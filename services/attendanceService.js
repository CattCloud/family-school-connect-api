'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const { generateAttendanceTemplateExcel, parseAttendanceFile } = require('./excelService');
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

const ASISTENCIA_ESTADOS = new Set([
  'presente',
  'tardanza',
  'permiso',
  'falta_justificada',
  'falta_injustificada',
]);

function isValidHHMM(str) {
  if (!str) return false;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(str).trim());
  return !!m;
}

function isISODate(str) {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(String(str));
}

// ============ Normalizadores ============
function normalizeNivel(nivel) {
  if (nivel == null) return null;
  const key = String(nivel).trim().toLowerCase();
  const map = { inicial: 'Inicial', primaria: 'Primaria', secundaria: 'Secundaria' };
  return map[key] || null;
}

// ============ Verificar contexto (real) ============
// GET /asistencias/verificar - verifica curso/nivel_grado/fecha y existencia de registros
async function verifyAttendanceContext({ curso_id, nivel_grado_id, fecha, año_academico }) {
  const year = año_academico || getCurrentAcademicYear();

  if (!curso_id || !nivel_grado_id || !fecha) {
    throw httpError('MISSING_REQUIRED_FIELDS', 'curso_id, nivel_grado_id y fecha son requeridos', 400);
  }
  if (!isISODate(fecha)) {
    throw httpError('INVALID_PARAMETERS', 'fecha debe estar en formato YYYY-MM-DD', 400);
  }
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  if (fechaObj > hoy) {
    throw httpError('FUTURE_DATE_NOT_ALLOWED', 'No se puede verificar asistencia para fechas futuras', 400);
  }
  if (fechaObj.getFullYear() !== year) {
    throw httpError('DATE_OUT_OF_ACADEMIC_YEAR', `La fecha ${fecha} está fuera del año académico ${year}`, 400);
  }

  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year, estado_activo: true },
    select: { id: true, nombre: true, nivel_grado: { select: { nivel: true, grado: true } } },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'El curso/nivel_grado no existe para el año académico', 400);
  }

  const totalActivos = await prisma.estudiante.count({
    where: { nivel_grado_id, año_academico: year, estado_matricula: 'activo' },
  });

  // Buscar si ya existen asistencias para esa fecha y grado
  const existentes = await prisma.asistencia.findMany({
    where: {
      año_academico: year,
      fecha: fechaObj,
      estudiante: { nivel_grado_id },
    },
    select: { estado: true },
  });

  const existe_registro = existentes.length > 0;

  // Armar estadísticas si existen
  const stats = { presente: 0, tardanza: 0, permiso: 0, falta_justificada: 0, falta_injustificada: 0 };
  for (const a of existentes) {
    if (stats[a.estado] != null) stats[a.estado]++;
  }

  return {
    curso: `${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`,
    fecha,
    año_academico: year,
    total_estudiantes: totalActivos,
    existe_registro,
    estadisticas: existe_registro ? stats : undefined,
  };
}

// ============ Generación Plantilla (MVP: binario simulado) ============
// Retorna buffer y filename sugerido.
async function generateAttendanceTemplate({ curso_id, nivel_grado_id, fecha, año_academico }) {
  return generateAttendanceTemplateExcel({ curso_id, nivel_grado_id, fecha, año_academico });
}

// ============ Validación de archivo (real con store TTL) ============
// Recibe metadatos y el archivo (multer), retorna estructura de validación como en doc.
async function validateAttendanceFile({ curso_id, nivel_grado_id, fecha, año_academico }, file) {
  const year = año_academico || getCurrentAcademicYear();
  if (!file) {
    throw httpError('INVALID_FILE_FORMAT', 'El archivo debe ser Excel (.xlsx) o (.xls)', 400);
  }
  if (!curso_id || !nivel_grado_id || !fecha) {
    throw httpError('MISSING_REQUIRED_FIELDS', 'curso_id, nivel_grado_id y fecha son requeridos', 400);
  }
  if (!isISODate(fecha)) {
    throw httpError('INVALID_PARAMETERS', 'fecha debe estar en formato YYYY-MM-DD', 400);
  }
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  if (fechaObj > hoy) {
    throw httpError('FUTURE_DATE_NOT_ALLOWED', 'No se puede validar asistencia para fechas futuras', 400);
  }
  if (fechaObj.getFullYear() !== year) {
    throw httpError('DATE_OUT_OF_ACADEMIC_YEAR', `La fecha ${fecha} está fuera del año académico ${year}`, 400);
  }

  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year },
    select: { id: true, nombre: true, nivel_grado: { select: { nivel: true, grado: true } } },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'El curso/nivel_grado no existe para el año académico', 400);
  }

  const parsed = await parseAttendanceFile(file.buffer, {
    curso_id,
    nivel_grado_id,
    año_academico: year,
  });

  // Validaciones de meta (celda A3)
  const meta = parsed.meta || {};
  if (!meta.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(meta.fecha)) {
    throw httpError('INVALID_DATE_FORMAT', 'Formato de fecha en plantilla inválido. Esperado: YYYY-MM-DD', 400);
  }
  if (meta.fecha !== fecha) {
    throw httpError('DATE_MISMATCH', `La fecha en el archivo (${meta.fecha}) no coincide con la fecha seleccionada (${fecha})`, 400);
  }

  // Advertencia si ya existe registro ese día para el grado
  const prevCount = await prisma.asistencia.count({
    where: {
      año_academico: year,
      fecha: fechaObj,
      estudiante: { nivel_grado_id },
    },
  });
  const advertencias = parsed.advertencias ? [...parsed.advertencias] : [];
  if (prevCount > 0) {
    advertencias.push({
      tipo: 'DUPLICATE_DATE',
      mensaje: 'Ya existe registro de asistencia para esta fecha. Si continúa, se reemplazarán los datos existentes.',
    });
  }

  const validacion_id = `val_asist_${Date.now()}`;

  // Persistir validación (TTL 24h) para posterior carga
  await saveValidation(validacion_id, {
    context: {
      curso_id,
      nivel_grado_id,
      fecha,
      año_academico: year,
    },
    registros_validos: parsed.registros_validos,
  });

  // Generar reporte de errores si corresponde
  let archivo_errores_url = null;
  if ((parsed.registros_con_errores?.length || 0) > 0) {
    const lines = [];
    lines.push('REPORTE DE ERRORES - CARGA DE ASISTENCIAS');
    lines.push('=========================================');
    lines.push(`Fecha: ${new Date().toISOString()}`);
    lines.push(`Curso: ${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`);
    lines.push('');
    for (const e of parsed.registros_con_errores) {
      lines.push(`Fila ${e.fila}: Código ${e.codigo_estudiante} - ${e.nombre_completo || ''}`);
      for (const err of e.errores || []) {
        lines.push(`  ❌ ${err.campo}: ${err.mensaje}${err.valor != null ? ` (valor: ${err.valor})` : ''}`);
      }
    }
    const report = await saveTextReport(lines.join('\n'), {
      filename: `Errores_Asistencias_${validacion_id}.txt`,
      kind: 'asistencias',
      extra: { curso_id, nivel_grado_id, fecha, año_academico: year },
    });
    archivo_errores_url = `/asistencias/reporte-errores/${report.report_id}`;
  }

  return {
    validacion_id,
    contexto: {
      curso: `${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`,
      fecha,
    },
    resumen: parsed.resumen,
    registros_validos: parsed.registros_validos,
    registros_con_errores: parsed.registros_con_errores,
    advertencias,
    archivo_errores_url,
  };
}

// ============ Carga (inserción) de asistencias (Persistencia real) ============
async function loadAttendance({ validacion_id, reemplazar_existente = false }, user) {
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

  const { context, registros_validos = [] } = payload || {};
  const { curso_id, nivel_grado_id, fecha, año_academico } = context || {};
  const year = año_academico || getCurrentAcademicYear();

  if (!curso_id || !nivel_grado_id || !fecha || !year) {
    throw httpError('INVALID_PARAMETERS', 'Contexto de validación incompleto', 400);
  }

  const fechaObj = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  if (fechaObj > hoy) {
    throw httpError('FUTURE_DATE_NOT_ALLOWED', 'No se puede cargar asistencia para fechas futuras', 400);
  }
  if (fechaObj.getFullYear() !== year) {
    throw httpError('DATE_OUT_OF_ACADEMIC_YEAR', `La fecha ${fecha} está fuera del año académico ${year}`, 400);
  }

  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year, estado_activo: true },
    select: { nombre: true, nivel_grado: { select: { grado: true, nivel: true } } },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'Curso/nivel_grado inválido para el año académico', 400);
  }

  if (!Array.isArray(registros_validos) || registros_validos.length === 0) {
    throw httpError('NO_VALID_RECORDS', 'No hay registros válidos para procesar', 400);
  }

  // Mapear códigos -> estudiantes activos del grado
  const codes = Array.from(new Set(registros_validos.map((r) => r.codigo_estudiante).filter(Boolean)));
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

  // Verificar existencia de registros para esa fecha y grado
  const existentesCount = await prisma.asistencia.count({
    where: {
      año_academico: year,
      fecha: fechaObj,
      estudiante: { nivel_grado_id },
    },
  });
  if (existentesCount > 0 && !reemplazar_existente) {
    throw httpError(
      'DUPLICATE_RECORD_EXISTS',
      'Ya existe registro de asistencia para esta fecha. Use reemplazar_existente: true para sobrescribir',
      409
    );
  }

  let insertados = 0;
  let omitidos = 0;
  let reemplazados = 0;

  await prisma.$transaction(async (tx) => {
    if (existentesCount > 0 && reemplazar_existente) {
      const del = await tx.asistencia.deleteMany({
        where: {
          año_academico: year,
          fecha: fechaObj,
          estudiante: { nivel_grado_id },
        },
      });
      reemplazados = del.count || 0;
    }

    for (const reg of registros_validos) {
      const estId = codeToId.get(reg.codigo_estudiante);
      if (!estId) {
        omitidos++;
        continue;
      }

      // Normalización de estado (ya viene normalizado en parse)
      const estado = reg.estado;
      let hora = reg.hora_llegada ? String(reg.hora_llegada) : null;

      // Revalidación defensiva de hora si estado = tardanza
      if (estado === 'tardanza') {
        if (!hora || !isValidHHMM(hora)) {
          omitidos++;
          continue;
        }
        const [hh, mm] = hora.split(':').map((n) => parseInt(n, 10));
        if (hh < 6 || (hh > 18) || (hh === 18 && mm > 0)) {
          omitidos++;
          continue;
        }
      } else {
        // Solo guardar hora si tardanza
        hora = null;
      }

      await tx.asistencia.create({
        data: {
          estudiante_id: estId,
          fecha: fechaObj,
          estado,
          hora_llegada: hora,
          justificacion: reg.justificacion || null,
          año_academico: year,
          registrado_por: user.id,
        },
      });
      insertados++;
    }
  });

  // Opcional: invalidar validación para evitar replays
  await deleteValidation(validacion_id).catch(() => {});

  const contexto = {
    curso: `${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`,
    fecha,
  };

  return {
    carga_id: `carga_asist_${Date.now()}`,
    contexto,
    resumen: {
      total_procesados: insertados + omitidos + reemplazados,
      insertados_exitosamente: insertados,
      omitidos,
      reemplazados,
    },
    fecha_carga: new Date().toISOString(),
    registrado_por: {
      id: user.id,
      nombre: `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario',
    },
  };
}

// ============ Estadísticas (real) ============
async function getAttendanceStats({ curso_id, nivel_grado_id, fecha, año_academico }) {
  const year = año_academico || getCurrentAcademicYear();
  if (!curso_id || !nivel_grado_id || !fecha) {
    throw httpError('MISSING_REQUIRED_FIELDS', 'curso_id, nivel_grado_id y fecha son requeridos', 400);
  }
  if (!isISODate(fecha)) {
    throw httpError('INVALID_PARAMETERS', 'fecha debe estar en formato YYYY-MM-DD', 400);
  }
  const fechaObj = new Date(fecha);

  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year, estado_activo: true },
    select: { id: true, nombre: true, nivel_grado: { select: { nivel: true, grado: true } } },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'El curso/nivel_grado no existe para el año académico', 400);
  }

  // Traer asistencias del día para el grado
  const asistencias = await prisma.asistencia.findMany({
    where: {
      año_academico: year,
      fecha: fechaObj,
      estudiante: { nivel_grado_id },
    },
    select: { estado: true, hora_llegada: true },
  });

  if (asistencias.length === 0) {
    throw httpError('NO_ATTENDANCE_RECORD', `No hay registro de asistencia para el grado en la fecha ${fecha}`, 404);
  }

  const counters = { presente: 0, tardanza: 0, permiso: 0, falta_justificada: 0, falta_injustificada: 0 };
  let tardanzaMinTotal = 0;
  let tardanzaCount = 0;

  // Base de cálculo simple para minutos de retraso (08:00)
  const baseHH = 8;
  const baseMM = 0;

  for (const a of asistencias) {
    if (counters[a.estado] != null) counters[a.estado]++;
    if (a.estado === 'tardanza' && a.hora_llegada) {
      const [hh, mm] = a.hora_llegada.split(':').map((n) => parseInt(n, 10));
      const minutos = (hh - baseHH) * 60 + (mm - baseMM);
      if (Number.isFinite(minutos) && minutos >= 0) {
        tardanzaMinTotal += minutos;
        tardanzaCount++;
      }
    }
  }

  const promedio_minutos_retraso = tardanzaCount > 0 ? Math.round((tardanzaMinTotal / tardanzaCount) * 100) / 100 : 0;

  return {
    curso: `${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`,
    fecha,
    año_academico: year,
    total_registros: asistencias.length,
    presente: counters.presente,
    tardanza: counters.tardanza,
    permiso: counters.permiso,
    falta_justificada: counters.falta_justificada,
    falta_injustificada: counters.falta_injustificada,
    promedio_minutos_retraso,
  };
}

module.exports = {
  getCurrentAcademicYear,
  verifyAttendanceContext,
  generateAttendanceTemplate,
  validateAttendanceFile,
  loadAttendance,
  getAttendanceStats,
  normalizeNivel,
  isValidHHMM,
  ASISTENCIA_ESTADOS,
};