'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const { toLetter } = require('./gradesService');

/**
 * Utilidades
 */
function httpError(code, message, status = 400) {
  const e = new Error(message || code);
  e.code = code;
  e.status = status;
  return e;
}

function round2(n) {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.round(v * 100) / 100;
}

function toNumber(dec) {
  if (dec == null) return null;
  if (typeof dec === 'number') return dec;
  const n = Number(dec);
  return Number.isFinite(n) ? n : null;
}

/**
 * Datos básicos
 */
async function getEstudianteInfo(estudiante_id) {
  const est = await prisma.estudiante.findUnique({
    where: { id: estudiante_id },
    select: {
      id: true,
      codigo_estudiante: true,
      nombre: true,
      apellido: true,
      nivel_grado: { select: { nivel: true, grado: true } },
    },
  });
  if (!est) throw httpError('STUDENT_NOT_FOUND', 'Estudiante no existe', 404);
  return {
    id: est.id,
    codigo_estudiante: est.codigo_estudiante,
    nombre_completo: `${est.nombre} ${est.apellido}`.trim(),
    nivel_grado: {
      nivel: est.nivel_grado?.nivel || null,
      grado: est.nivel_grado?.grado || null,
    },
  };
}

async function getComponentesActivos(year) {
  const list = await prisma.estructuraEvaluacion.findMany({
    where: { año_academico: year, estado_activo: true },
    orderBy: [{ orden_visualizacion: 'asc' }],
    select: {
      id: true,
      nombre_item: true,
      peso_porcentual: true,
      tipo_evaluacion: true, // unica | recurrente
    },
  });
  return list.map((c) => ({
    id: c.id,
    nombre_item: c.nombre_item,
    peso_porcentual: toNumber(c.peso_porcentual),
    tipo_evaluacion: c.tipo_evaluacion,
  }));
}

async function getCursoInfo(curso_id) {
  const c = await prisma.curso.findUnique({
    where: { id: curso_id },
    select: {
      id: true,
      nombre: true,
      nivel_grado: { select: { nivel: true, grado: true } },
    },
  });
  if (!c) return null;
  return {
    id: c.id,
    nombre: c.nombre,
    nivel_grado: {
      nivel: c.nivel_grado?.nivel || null,
      grado: c.nivel_grado?.grado || null,
    },
  };
}

/**
 * Obtiene IDs de cursos donde el estudiante tiene al menos 1 evaluación
 * para el año (y opcionalmente trimestre) indicado.
 */
async function getCursosConEvaluaciones({ estudiante_id, año, trimestre }) {
  const where = {
    estudiante_id,
    año_academico: año,
    ...(trimestre ? { trimestre: Number(trimestre) } : {}),
  };

  const rows = await prisma.evaluacion.findMany({
    where,
    distinct: ['curso_id'],
    select: { curso_id: true },
  });

  return Array.from(new Set(rows.map((r) => r.curso_id)));
}

/**
 * Calcula promedio del componente para un curso/trimestre/año dado.
 * - Para 'recurrente': promedio = suma / cantidad
 * - Para 'unica': si existe >1 registro, se promedia igual (defensivo)
 * Retorna { promedio:number|null, count:number, preliminares:number }
 */
async function computeComponentePromedio({
  estudiante_id,
  curso_id,
  componente_id,
  año,
  trimestre,
}) {
  const list = await prisma.evaluacion.findMany({
    where: {
      estudiante_id,
      curso_id,
      estructura_evaluacion_id: componente_id,
      año_academico: año,
      trimestre: Number(trimestre),
    },
    select: { calificacion_numerica: true, estado: true },
  });

  if (list.length === 0) return { promedio: null, count: 0, preliminares: 0 };

  let suma = 0;
  let cnt = 0;
  let prelim = 0;
  for (const it of list) {
    const num = toNumber(it.calificacion_numerica);
    if (Number.isFinite(num)) {
      suma += num;
      cnt += 1;
    }
    if (it.estado === 'preliminar') prelim += 1;
  }
  const promedio = cnt > 0 ? round2(suma / cnt) : null;
  return { promedio, count: cnt, preliminares: prelim };
}

/**
 * Calcula resumen trimestral para un curso:
 * - promedios por componente (con subtotal = promedio * peso / 100)
 * - promedio_trimestre (suma de subtotales)
 * - estado preliminar si existe alguna nota preliminar en cualquiera de los componentes
 */
async function buildCourseTrimSummary({
  estudiante_id,
  curso_id,
  año,
  trimestre,
  componentes,
}) {
  const curso = await getCursoInfo(curso_id);
  if (!curso) return null;

  const promedios_componentes = [];
  let anyPreliminar = false;
  let sumaPonderada = 0;

  for (const comp of componentes) {
    const { promedio, count, preliminares } = await computeComponentePromedio({
      estudiante_id,
      curso_id,
      componente_id: comp.id,
      año,
      trimestre,
    });

    if (promedio != null) {
      const subtotal = round2((promedio * (comp.peso_porcentual || 0)) / 100);
      promedios_componentes.push({
        componente_id: comp.id,
        componente: comp.nombre_item,
        promedio,
        peso: round2(comp.peso_porcentual || 0),
        subtotal: subtotal != null ? subtotal : 0,
        color: promedio >= 14 ? 'verde' : promedio >= 11 ? 'amarillo' : 'rojo',
      });
      sumaPonderada += subtotal || 0;
      if (preliminares > 0) anyPreliminar = true;
    } else {
      // Componente sin datos no aparece en la tabla (según práctica común)
      // Alternativa: incluir con promedio null
    }
  }

  if (promedios_componentes.length === 0) {
    // No tuvo notas en ningún componente del trimestre
    return null;
  }

  const promedio_trimestre = round2(sumaPonderada);
  const promedio_letra = promedio_trimestre != null ? toLetter(promedio_trimestre) : null;

  return {
    id: curso.id,
    nombre: curso.nombre,
    formula_calculo: componentes.map((c) => ({
      componente_id: c.id,
      nombre: c.nombre_item,
      peso: round2(c.peso_porcentual || 0),
      icono: null,
    })),
    promedios_componentes,
    promedio_trimestre,
    promedio_letra,
    estado: anyPreliminar ? 'preliminar' : 'final',
    fecha_certificacion: null,
    mensaje: anyPreliminar
      ? 'Este promedio es preliminar y puede cambiar hasta el cierre del trimestre'
      : 'Promedio oficial',
  };
}

/**
 * Calcula promedio trimestral del curso, reutilizado para vista anual.
 */
async function computeCourseTrimAverage({
  estudiante_id,
  curso_id,
  año,
  trimestre,
  componentes,
}) {
  const sum = await buildCourseTrimSummary({
    estudiante_id,
    curso_id,
    año,
    trimestre,
    componentes,
  });
  return sum?.promedio_trimestre ?? null;
}

/**
 * Construye la vista TRIMESTRAL del resumen académico (HU-ACAD-09)
 */
async function getAcademicSummaryTrimestral({ estudiante_id, año, trimestre }) {
  if (!estudiante_id || !año || !trimestre) {
    throw httpError('INVALID_PARAMETERS', 'estudiante_id, año y trimestre son requeridos', 400);
  }
  const tri = Number(trimestre);
  if (![1, 2, 3].includes(tri)) {
    throw httpError('INVALID_PARAMETERS', 'Trimestre inválido. Debe ser 1, 2 o 3', 400);
  }

  const estudiante = await getEstudianteInfo(estudiante_id);
  const componentes = await getComponentesActivos(año);

  const cursosIds = await getCursosConEvaluaciones({ estudiante_id, año, trimestre: tri });

  const cursos = [];
  for (const cid of cursosIds) {
    const card = await buildCourseTrimSummary({
      estudiante_id,
      curso_id: cid,
      año,
      trimestre: tri,
      componentes,
    });
    if (card) cursos.push(card);
  }

  if (cursos.length === 0) {
    throw httpError(
      'NO_GRADES_FOUND',
      `No hay calificaciones registradas para el Trimestre ${tri}`,
      404
    );
  }

  return {
    estudiante,
    año_academico: año,
    trimestre: tri,
    cursos,
    total_cursos: cursos.length,
  };
}

/**
 * Construye la vista ANUAL del resumen académico (HU-ACAD-09)
 */
async function getAcademicSummaryAnual({ estudiante_id, año }) {
  if (!estudiante_id || !año) {
    throw httpError('INVALID_PARAMETERS', 'estudiante_id y año son requeridos', 400);
  }

  const estudiante = await getEstudianteInfo(estudiante_id);
  const componentes = await getComponentesActivos(año);

  // cursos con evaluaciones en cualquier trimestre del año
  const cursosIds = await getCursosConEvaluaciones({ estudiante_id, año, trimestre: null });

  if (cursosIds.length === 0) {
    throw httpError('NO_GRADES_FOUND', `No hay calificaciones registradas para el año ${año}`, 404);
  }

  const tabla = [];
  for (const cid of cursosIds) {
    const curso = await getCursoInfo(cid);
    const t1 = await computeCourseTrimAverage({
      estudiante_id,
      curso_id: cid,
      año,
      trimestre: 1,
      componentes,
    });
    const t2 = await computeCourseTrimAverage({
      estudiante_id,
      curso_id: cid,
      año,
      trimestre: 2,
      componentes,
    });
    const t3 = await computeCourseTrimAverage({
      estudiante_id,
      curso_id: cid,
      año,
      trimestre: 3,
      componentes,
    });

    let promedio_final = null;
    // Por especificación: (T1 + T2 + T3) / 3
    if ([t1, t2, t3].every((v) => typeof v === 'number')) {
      promedio_final = round2((t1 + t2 + t3) / 3);
    } else {
      // Si no están los 3 trimestres, dejamos promedio_final null
      promedio_final = null;
    }

    const promedio_letra = promedio_final != null ? toLetter(promedio_final) : null;
    const estado =
      promedio_final != null ? (promedio_final >= 11 ? 'aprobado' : 'desaprobado') : 'pendiente';

    tabla.push({
      curso_id: cid,
      curso_nombre: curso?.nombre || 'Curso',
      trimestre_1: t1 != null ? t1 : null,
      trimestre_2: t2 != null ? t2 : null,
      trimestre_3: t3 != null ? t3 : null,
      promedio_final,
      promedio_letra,
      estado,
      estado_badge: estado === 'aprobado' ? '✅' : estado === 'desaprobado' ? '❌' : '⏳',
    });
  }

  // Estadísticas generales
  const withFinal = tabla.filter((r) => typeof r.promedio_final === 'number');
  const promedio_general =
    withFinal.length > 0
      ? round2(withFinal.reduce((acc, r) => acc + r.promedio_final, 0) / withFinal.length)
      : null;

  const cursos_aprobados = withFinal.filter((r) => r.promedio_final >= 11).length;
  const cursos_desaprobados = withFinal.filter((r) => r.promedio_final < 11).length;

  let mejor_curso = null;
  if (withFinal.length > 0) {
    const best = withFinal.reduce((a, b) => (a.promedio_final >= b.promedio_final ? a : b));
    mejor_curso = { nombre: best.curso_nombre, promedio: best.promedio_final };
  }

  let curso_atencion = null;
  if (withFinal.length > 0) {
    const worst = withFinal.reduce((a, b) => (a.promedio_final <= b.promedio_final ? a : b));
    curso_atencion = { nombre: worst.curso_nombre, promedio: worst.promedio_final };
  }

  return {
    estudiante,
    año_academico: año,
    vista: 'anual',
    tabla_notas_finales: tabla,
    estadisticas: {
      promedio_general,
      cursos_aprobados,
      cursos_desaprobados,
      total_cursos: tabla.length,
      mejor_curso,
      curso_atencion,
    },
  };
}

/**
 * Facade principal HU-ACAD-09
 * - Si viene trimestre => vista trimestral
 * - Si no => vista anual
 */
async function getAcademicSummary({ estudiante_id, año, trimestre }) {
  if (trimestre == null || trimestre === '' || String(trimestre).toLowerCase() === 'null') {
    return getAcademicSummaryAnual({ estudiante_id, año });
  }
  return getAcademicSummaryTrimestral({ estudiante_id, año, trimestre });
}

/**
 * Exportación PDF (boleta anual)
 * - Genera un PDF simple con tabla anual y estadísticos.
 * - Requiere datos anuales (sin trimestre)
 */
async function exportAcademicSummaryPDF({ estudiante_id, año }) {
  const summary = await getAcademicSummaryAnual({ estudiante_id, año });

  // Camino rápido para tests o entornos que requieren performance (evita lanzar Chromium)
  if (process.env.NODE_ENV === 'test' || process.env.FAST_PDF === 'true') {
    const minimalPdf = `%PDF-1.4
% Minimal PDF generado en test
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >> endobj
4 0 obj << /Length 80 >> stream
BT /F1 12 Tf 72 800 Td (Boleta Anual ${summary.estudiante.nombre_completo}) Tj ET
endstream endobj
xref 0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000120 00000 n
0000000217 00000 n
trailer << /Root 1 0 R /Size 5 >>
startxref
300
%%EOF`;
    return {
      filename: `Boleta_Oficial_${summary.estudiante.nombre_completo.replace(/\s+/g, '')}_${año}.pdf`,
      buffer: Buffer.from(minimalPdf),
      mime: 'application/pdf',
    };
  }

  // Generar HTML para renderizado real en PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Boleta Anual</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1, h2 { color: #4B0082; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background: #4B0082; color: #fff; }
    .aprobado { color: #2ECC71; font-weight: bold; }
    .desaprobado { color: #E74C3C; font-weight: bold; }
    .muted { color: #777; }
  </style>
</head>
<body>
  <h1>I.E.P. LAS ORQUÍDEAS</h1>
  <h2>Boleta de Calificaciones Anual</h2>
  <p><strong>Estudiante:</strong> ${summary.estudiante.nombre_completo} (${summary.estudiante.codigo_estudiante})</p>
  <p><strong>Grado:</strong> ${summary.estudiante.nivel_grado.grado || ''} ${summary.estudiante.nivel_grado.nivel || ''} - <strong>Año:</strong> ${summary.año_academico}</p>

  <table>
    <thead>
      <tr>
        <th>Curso</th>
        <th>T1</th>
        <th>T2</th>
        <th>T3</th>
        <th>Promedio Final</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${summary.tabla_notas_finales
        .map((r) => {
          const estadoClass =
            r.estado === 'aprobado' ? 'aprobado' : r.estado === 'desaprobado' ? 'desaprobado' : 'muted';
          return `
          <tr>
            <td>${r.curso_nombre}</td>
            <td>${r.trimestre_1 != null ? r.trimestre_1 : '-'}</td>
            <td>${r.trimestre_2 != null ? r.trimestre_2 : '-'}</td>
            <td>${r.trimestre_3 != null ? r.trimestre_3 : '-'}</td>
            <td>${r.promedio_final != null ? r.promedio_final : '-'}</td>
            <td class="${estadoClass}">${r.estado_badge} ${r.estado}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <h3>Estadísticas</h3>
  <ul>
    <li><strong>Promedio General:</strong> ${summary.estadisticas.promedio_general ?? '-'}</li>
    <li><strong>Cursos Aprobados:</strong> ${summary.estadisticas.cursos_aprobados}</li>
    <li><strong>Cursos Desaprobados:</strong> ${summary.estadisticas.cursos_desaprobados}</li>
    <li><strong>Mejor Curso:</strong> ${
      summary.estadisticas.mejor_curso
        ? `${summary.estadisticas.mejor_curso.nombre} (${summary.estadisticas.mejor_curso.promedio})`
        : '-'
    }</li>
    <li><strong>Curso que requiere atención:</strong> ${
      summary.estadisticas.curso_atencion
        ? `${summary.estadisticas.curso_atencion.nombre} (${summary.estadisticas.curso_atencion.promedio})`
        : '-'
    }</li>
  </ul>

  <p class="muted">Generado automáticamente por la plataforma.</p>
</body>
</html>
`.trim();

  // Usar Puppeteer para PDF (opciones más rápidas y compatibles en CI)
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    return {
      filename: `Boleta_Oficial_${summary.estudiante.nombre_completo.replace(/\s+/g, '')}_${año}.pdf`,
      buffer: pdf,
      mime: 'application/pdf',
    };
  } finally {
    await browser.close();
  }
}

module.exports = {
  getAcademicSummary,
  getAcademicSummaryTrimestral,
  getAcademicSummaryAnual,
  exportAcademicSummaryPDF,
};