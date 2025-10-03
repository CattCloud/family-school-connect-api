'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const { generateGradesTemplateExcel, parseGradesFile } = require('./excelService');
const { saveTextReport } = require('./reportsService');
const { saveValidation, readValidation, deleteValidation } = require('./validationStore');

// ============ Utiles comunes ============
function getCurrentAcademicYear() {
  const forced = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(forced) ? forced : new Date().getFullYear();
}

function httpError(code, message, status = 400) {
  const e = new Error(message || code);
  e.code = code;
  e.status = status;
  return e;
}

function toLetter(calificacion) {
  const v = typeof calificacion === 'number' ? calificacion : parseFloat(String(calificacion));
  if (Number.isNaN(v)) return 'C';
  if (v >= 18) return 'AD';
  if (v >= 14) return 'A';
  if (v >= 11) return 'B';
  return 'C';
}

// ============ Normalizadores ============
function normalizeNivel(nivel) {
  if (nivel == null) return null;
  const key = String(nivel).trim().toLowerCase();
  const map = { inicial: 'Inicial', primaria: 'Primaria', secundaria: 'Secundaria' };
  return map[key] || null;
}

// ============ Generación Plantilla (exceljs real) ============
// Retorna buffer y filename sugerido.
async function generateGradesTemplate({ curso_id, nivel_grado_id, trimestre, componente_id, año_academico }) {
  return generateGradesTemplateExcel({ curso_id, nivel_grado_id, trimestre, componente_id, año_academico });
}

// ============ Validación de archivo (exceljs real) ============
// Recibe metadatos y el archivo (multer), retorna estructura de validación como en doc.
async function validateGradesFile({ curso_id, nivel_grado_id, trimestre, componente_id, año_academico }, file) {
  const year = año_academico || getCurrentAcademicYear();
  if (!file) {
    throw httpError('INVALID_FILE_FORMAT', 'El archivo debe ser Excel (.xlsx) o (.xls)', 400);
  }
  if (!curso_id || !nivel_grado_id || !trimestre || !componente_id) {
    throw httpError(
      'MISSING_REQUIRED_FIELDS',
      'curso_id, nivel_grado_id, trimestre y componente_id son requeridos',
      400
    );
  }

  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year },
    select: { id: true, nombre: true, nivel_grado: { select: { nivel: true, grado: true } } },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'El curso/nivel_grado no existe para el año académico', 400);
  }

  const parsed = await parseGradesFile(file.buffer, {
    curso_id,
    nivel_grado_id,
    año_academico: year,
  });

  // Validaciones estrictas adicionales según HU:
  // - Coincidencia del componente_id entre archivo y selección
  // - fecha_evaluacion presente y con formato YYYY-MM-DD
  const meta = parsed.meta || {};
  if (meta.componente_id && meta.componente_id !== componente_id) {
    throw httpError(
      'COMPONENT_MISMATCH',
      `El componente_id en el archivo (${meta.componente_id}) no coincide con el componente seleccionado (${componente_id})`,
      400
    );
  }
  if (!meta.fecha_evaluacion || meta.fecha_valida === false) {
    throw httpError(
      'INVALID_DATE_FORMAT',
      'Formato de fecha_evaluacion inválido. Esperado: YYYY-MM-DD',
      400
    );
  }

  const validacion_id = `val_cal_${Date.now()}`;
  const fecha_evaluacion = meta.fecha_evaluacion;

  // Persistir validación (TTL 24h) para posterior carga
  await saveValidation(validacion_id, {
    context: {
      curso_id,
      nivel_grado_id,
      trimestre,
      componente_id,
      año_academico: year,
      fecha_evaluacion,
    },
    registros_validos: parsed.registros_validos,
  });

  // Si hay errores/advertencias, generar reporte TXT y devolver URL
  let archivo_errores_url = null;
  if ((parsed.registros_con_errores?.length || 0) > 0) {
    const lines = [];
    lines.push('REPORTE DE ERRORES - CARGA DE CALIFICACIONES');
    lines.push('===========================================');
    lines.push(`Fecha: ${new Date().toISOString()}`);
    lines.push(`Curso: ${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`);
    lines.push('');
    for (const e of parsed.registros_con_errores) {
      lines.push(`Fila ${e.fila}: Código ${e.codigo_estudiante} - ${e.nombre_completo || ''}`);
      for (const err of e.errores || []) {
        // err.mensaje proviene de parseGradesFile y cubre:
        // - "Calificación es obligatoria"
        // - "Calificación fuera de rango (debe ser 0–20)"
        // - "Código de estudiante duplicado en el archivo"
        // - "El estudiante no pertenece a este curso"
        lines.push(`  ❌ ${err.campo}: ${err.mensaje}${err.valor != null ? ` (valor: ${err.valor})` : ''}`);
      }
    }
    const report = await saveTextReport(lines.join('\n'), {
      filename: `Errores_Calificaciones_${validacion_id}.txt`,
      kind: 'calificaciones',
      extra: { curso_id, nivel_grado_id, trimestre, componente_id, año_academico: year },
    });
    archivo_errores_url = `/calificaciones/reporte-errores/${report.report_id}`;
  }

  return {
    validacion_id,
    contexto: {
      curso: `${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`,
      trimestre,
      componente: componente_id,
      fecha_evaluacion,
    },
    resumen: parsed.resumen,
    registros_validos: parsed.registros_validos,
    registros_con_errores: parsed.registros_con_errores,
    advertencias: parsed.advertencias || [],
    archivo_errores_url,
  };
}

// ============ Carga (inserción) de calificaciones (Persistencia real) ============
// Inserta registros válidos en BD usando la validación previa (TTL 24h)
async function loadGrades({ validacion_id, procesar_solo_validos = true, generar_alertas = true }, user) {
  if (!validacion_id) {
    throw httpError('VALIDATION_NOT_FOUND', 'Validación con ID no existe o expiró', 404);
  }
  if (!user || !user.id) {
    throw httpError('INVALID_TOKEN', 'Usuario no autenticado', 401);
  }

  const payload = await readValidation(validacion_id);
  if (!payload) {
    throw httpError('VALIDATION_NOT_FOUND', 'Validación con ID no existe o expiró', 404);
  }

  const {
    context,
    registros_validos = [],
  } = payload || {};

  const {
    curso_id,
    nivel_grado_id,
    trimestre,
    componente_id,
    año_academico: year,
    fecha_evaluacion,
  } = context || {};

  if (!curso_id || !nivel_grado_id || !trimestre || !componente_id || !year) {
    throw httpError('INVALID_PARAMETERS', 'Contexto de validación incompleto', 400);
  }

  // Validar trimestre permitido (1,2,3)
  const tri = Number(trimestre);
  if (![1, 2, 3].includes(tri)) {
    throw httpError('INVALID_PARAMETERS', 'Trimestre inválido. Debe ser 1, 2 o 3', 400);
  }

  if (procesar_solo_validos && (!Array.isArray(registros_validos) || registros_validos.length === 0)) {
    throw httpError('NO_VALID_RECORDS', 'No hay registros válidos para procesar', 400);
  }

  // Datos de curso para contexto humano
  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year, estado_activo: true },
    select: { nombre: true, nivel_grado: { select: { grado: true, nivel: true } } },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'Curso/nivel_grado inválido para el año académico', 400);
  }

  // Tipo de evaluación (unica | recurrente)
  const componente = await prisma.estructuraEvaluacion.findFirst({
    where: { id: componente_id, año_academico: year, estado_activo: true },
    select: { id: true, tipo_evaluacion: true },
  });
  if (!componente) {
    throw httpError('COMPONENT_NOT_FOUND', 'Componente con ID no existe o no está activo para el año indicado', 404);
  }

  // Preparar mapeo de códigos -> estudiantes
  const codes = Array.from(new Set((registros_validos || []).map((r) => r.codigo_estudiante).filter(Boolean)));
  const estudiantes = codes.length
    ? await prisma.estudiante.findMany({
        where: {
          codigo_estudiante: { in: codes },
          nivel_grado_id,
          año_academico: year,
          estado_matricula: 'activo',
        },
        select: { id: true, codigo_estudiante: true },
      })
    : [];
  const codeToId = new Map(estudiantes.map((e) => [e.codigo_estudiante, e.id]));

  let insertados = 0;
  let omitidos = 0;

  const fechaEval = new Date(fecha_evaluacion || new Date().toISOString().slice(0, 10));
  if (fechaEval.getFullYear() !== year) {
    throw httpError(
      'DATE_OUT_OF_ACADEMIC_YEAR',
      `La fecha ${fechaEval.toISOString().slice(0, 10)} está fuera del año académico ${year}`,
      400
    );
  }

  await prisma.$transaction(async (tx) => {
    for (const reg of registros_validos) {
      const codigo = reg.codigo_estudiante;
      const estId = codeToId.get(codigo);
      const calif = reg.calificacion;

      // Revalidación defensiva mínima
      if (!estId || calif == null || Number.isNaN(Number(calif))) {
        omitidos++;
        continue;
      }

      // Reglas de duplicidad según tipo
      if (componente.tipo_evaluacion === 'unica') {
        const exists = await tx.evaluacion.findFirst({
          where: {
            estudiante_id: estId,
            curso_id,
            estructura_evaluacion_id: componente_id,
            trimestre,
            año_academico: year,
          },
          select: { id: true },
        });
        if (exists) {
          omitidos++;
          continue;
        }
      } else {
        // recurrente: omitir si ya existe misma fecha para ese componente
        const existsSameDate = await tx.evaluacion.findFirst({
          where: {
            estudiante_id: estId,
            curso_id,
            estructura_evaluacion_id: componente_id,
            trimestre,
            año_academico: year,
            fecha_evaluacion: fechaEval,
          },
          select: { id: true },
        });
        if (existsSameDate) {
          omitidos++;
          continue;
        }
      }

      // Insert real
      await tx.evaluacion.create({
        data: {
          estudiante_id: estId,
          curso_id,
          estructura_evaluacion_id: componente_id,
          trimestre,
          año_academico: year,
          fecha_evaluacion: fechaEval,
          calificacion_numerica: Number(calif),
          calificacion_letra: toLetter(Number(calif)),
          observaciones: reg.observaciones || null,
          registrado_por: user.id,
          // estado y fecha_registro usan defaults del schema
        },
      });
      insertados++;
    }
  });

  const nowIso = new Date().toISOString();

  // Contexto de salida
  const contexto = {
    curso: `${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`,
    trimestre,
    componente: componente_id,
    fecha_evaluacion: fechaEval.toISOString().slice(0, 10),
  };

  // Alertas automáticas (no implementadas aún)
  const alertas_generadas = generar_alertas
    ? { total: 0, bajo_rendimiento: 0, estudiantes_afectados: [] }
    : { total: 0, bajo_rendimiento: 0, estudiantes_afectados: [] };

  return {
    carga_id: `carga_cal_${Date.now()}`,
    contexto,
    resumen: {
      total_procesados: insertados + omitidos,
      insertados_exitosamente: insertados,
      omitidos,
    },
    alertas_generadas,
    fecha_carga: nowIso,
    registrado_por: {
      id: user.id,
      nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario',
    },
  };
}

module.exports = {
  getCurrentAcademicYear,
  generateGradesTemplate,
  validateGradesFile,
  loadGrades,
  toLetter,
};