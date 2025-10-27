
'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Utilidades comunes
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

function formatSpanishDateISO(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function getSpanishMonthName(m) {
  // m: 1-12
  const date = new Date(2025, Math.max(1, Math.min(12, Number(m))) - 1, 1);
  return new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(date);
}

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

function startOfMonth(year, month) {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
}
function endOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59));
}
function trimestreToMonthRange(tri) {
  const t = Number(tri);
  if (t === 1) return { m1: 1, m3: 3 };
  if (t === 2) return { m1: 4, m3: 6 };
  if (t === 3) return { m1: 7, m3: 9 };
  throw httpError('INVALID_PARAMETERS', 'Trimestre inválido. Debe ser 1, 2 o 3', 400);
}
function generateDateRange(start, end) {
  // inclusive
  const arr = [];
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (d <= last) {
    arr.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return arr;
}
function ymd(date) {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Días no lectivos (feriados Perú + institucionales)
 * - Demo: lista estática para 2025 (según documentación)
 * - Otros años: devolver lista vacía (fines de semana se marcan automáticamente)
 */
function getNonLectiveDaysByYear(year) {
  const y = Number(year);
  if (y !== 2025) {
    return { year: y, dias_no_lectivos: [], fines_de_semana_automaticos: true };
  }
  const dias = [
    { fecha: '2025-01-01', tipo: 'feriado_nacional', descripcion: 'Año Nuevo' },
    { fecha: '2025-05-01', tipo: 'feriado_nacional', descripcion: 'Día del Trabajo' },
    { fecha: '2025-07-28', tipo: 'feriado_nacional', descripcion: 'Fiestas Patrias' },
    { fecha: '2025-07-29', tipo: 'feriado_nacional', descripcion: 'Fiestas Patrias' },
    { fecha: '2025-08-30', tipo: 'feriado_nacional', descripcion: 'Santa Rosa de Lima' },
    { fecha: '2025-10-08', tipo: 'feriado_nacional', descripcion: 'Combate de Angamos' },
    { fecha: '2025-11-01', tipo: 'feriado_nacional', descripcion: 'Todos los Santos' },
    { fecha: '2025-12-08', tipo: 'feriado_nacional', descripcion: 'Inmaculada Concepción' },
    { fecha: '2025-12-25', tipo: 'feriado_nacional', descripcion: 'Navidad' },
    { fecha: '2025-03-17', tipo: 'dia_institucional', descripcion: 'Aniversario Institucional' },
    { fecha: '2025-07-15', tipo: 'vacaciones', descripcion: 'Inicio de Vacaciones de Medio Año' },
  ];
  return { year: y, dias_no_lectivos: dias, fines_de_semana_automaticos: true };
}

/**
 * Mapea un registro de asistencia al contrato de respuesta
 */
function mapAttendanceRecord(a) {
  const diaSemana = new Intl.DateTimeFormat('es-PE', { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(a.fecha.toISOString().slice(0, 10) + 'T00:00:00Z')
  );
  const regNombre = `${a.registrante?.nombre || ''} ${a.registrante?.apellido || ''}`.trim();
  return {
    id: a.id,
    fecha: a.fecha.toISOString().slice(0, 10),
    fecha_legible: formatSpanishDateISO(a.fecha),
    dia_semana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
    estado: a.estado,
    hora_llegada: a.hora_llegada || null,
    justificacion: a.justificacion || null,
    fecha_registro: a.fecha_registro ? a.fecha_registro.toISOString() : null,
    registrado_por: { nombre: regNombre || null },
  };
}

/**
 * GET /asistencias/estudiante/:estudiante_id
 * ?año=YYYY (requerido)
 * y uno de: ?mes=1..12 | ?trimestre=1..3
 * - Si no se especifica mes ni trimestre, usar mes actual del año indicado (o del sistema si difiere).
 */
async function getAttendanceByPeriod({ estudiante_id, año, mes, trimestre }) {
  if (!estudiante_id || !año) {
    throw httpError('INVALID_PARAMETERS', 'estudiante_id y año son requeridos', 400);
  }
  const year = Number(año);
  if (!Number.isInteger(year)) throw httpError('INVALID_PARAMETERS', 'Año inválido', 400);

  if (mes != null && trimestre != null && String(mes).trim() !== '' && String(trimestre).trim() !== '') {
    throw httpError(
      'INVALID_PARAMETERS',
      "No puede especificar 'mes' y 'trimestre' simultáneamente. Use solo uno.",
      400
    );
  }

  // Validar estudiante existe
  const estudiante = await getEstudianteInfo(estudiante_id);

  let start, end;
  let periodo = { año: year, mes: null, mes_nombre: null, trimestre: null };

  if (mes != null && String(mes).trim() !== '') {
    const m = Number(mes);
    if (!(m >= 1 && m <= 12)) throw httpError('INVALID_PARAMETERS', 'Mes inválido (1-12)', 400);
    start = startOfMonth(year, m);
    end = endOfMonth(year, m);
    periodo.mes = m;
    periodo.mes_nombre = getSpanishMonthName(m).charAt(0).toUpperCase() + getSpanishMonthName(m).slice(1);
  } else if (trimestre != null && String(trimestre).trim() !== '') {
    const t = Number(trimestre);
    if (![1, 2, 3].includes(t)) throw httpError('INVALID_PARAMETERS', 'Trimestre inválido. Debe ser 1, 2 o 3', 400);
    const { m1, m3 } = trimestreToMonthRange(t);
    start = startOfMonth(year, m1);
    end = endOfMonth(year, m3);
    periodo.trimestre = t;
  } else {
    // Default: mes actual (del sistema) acotado al año indicado
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const m = currentYear === year ? now.getUTCMonth() + 1 : 1; // si no es el año actual, usar enero como default
    start = startOfMonth(year, m);
    end = endOfMonth(year, m);
    periodo.mes = m;
    periodo.mes_nombre = getSpanishMonthName(m).charAt(0).toUpperCase() + getSpanishMonthName(m).slice(1);
  }

  // Traer registros del periodo (orden ascendente)
  const registros = await prisma.asistencia.findMany({
    where: {
      estudiante_id,
      año_academico: year,
      fecha: { gte: start, lte: end },
    },
    include: {
      registrante: { select: { nombre: true, apellido: true } },
    },
    orderBy: [{ fecha: 'asc' }],
  });

  // Resumen por estado
  const resumen = {
    presente: 0,
    tardanza: 0,
    permiso: 0,
    falta_justificada: 0,
    falta_injustificada: 0,
  };
  for (const r of registros) {
    if (resumen[r.estado] != null) resumen[r.estado] += 1;
  }

  return {
    estudiante,
    periodo,
    registros: registros.map(mapAttendanceRecord),
    total_registros: registros.length,
    resumen,
  };
}

/**
 * GET /asistencias/estudiante/:estudiante_id/estadisticas
 * ?fecha_inicio=YYYY-MM-DD & ?fecha_fin=YYYY-MM-DD
 */
async function getAttendanceStats({ estudiante_id, fecha_inicio, fecha_fin }) {
  if (!estudiante_id || !fecha_inicio || !fecha_fin) {
    throw httpError('INVALID_PARAMETERS', 'estudiante_id, fecha_inicio y fecha_fin son requeridos', 400);
  }
  const start = new Date(fecha_inicio + 'T00:00:00Z');
  const end = new Date(fecha_fin + 'T23:59:59Z');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw httpError('INVALID_PARAMETERS', 'Formato de fecha inválido (YYYY-MM-DD)', 400);
  }
  if (start > end) throw httpError('INVALID_DATE_RANGE', 'fecha_inicio debe ser menor o igual a fecha_fin', 400);

  // Validar estudiante existe
  await getEstudianteInfo(estudiante_id);

  const allDays = generateDateRange(start, end);
  const dias_totales = allDays.length;

  const year = start.getUTCFullYear();
  const nonLect = getNonLectiveDaysByYear(year);
  const feriadosSet = new Set(nonLect.dias_no_lectivos.map((d) => d.fecha));

  // Calcular días lectivos (excluir fines de semana y feriados)
  let dias_lectivos = 0;
  let dias_no_lectivos = 0;
  for (const d of allDays) {
    const dateStr = ymd(d);
    const wd = d.getUTCDay(); // 0-dom,6-sab
    const isWeekend = wd === 0 || wd === 6;
    const isHoliday = feriadosSet.has(dateStr);
    if (isWeekend || isHoliday) {
      dias_no_lectivos += 1;
    } else {
      dias_lectivos += 1;
    }
  }

  // Registros del estudiante en el rango
  const registros = await prisma.asistencia.findMany({
    where: {
      estudiante_id,
      fecha: { gte: start, lte: end },
    },
    select: {
      id: true,
      fecha: true,
      estado: true,
    },
    orderBy: [{ fecha: 'asc' }],
  });

  const counters = {
    total: registros.length,
    presente: 0,
    tardanza: 0,
    permiso: 0,
    falta_justificada: 0,
    falta_injustificada: 0,
    sin_registro: 0,
  };
  const uniqueDates = new Set();
  for (const r of registros) {
    if (counters[r.estado] != null) counters[r.estado] += 1;
    uniqueDates.add(ymd(r.fecha));
  }
  // Días lectivos sin registro
  counters.sin_registro = Math.max(dias_lectivos - uniqueDates.size, 0);

  const sumAsistenciaBase =
    counters.presente + counters.tardanza + counters.permiso + counters.falta_justificada;
  const asistencia_global = dias_lectivos > 0 ? round2((sumAsistenciaBase / dias_lectivos) * 100) : 0;

  const porcentajes = {
    asistencia_global,
    presente: dias_lectivos > 0 ? round2((counters.presente / dias_lectivos) * 100) : 0,
    tardanza: dias_lectivos > 0 ? round2((counters.tardanza / dias_lectivos) * 100) : 0,
    permiso: dias_lectivos > 0 ? round2((counters.permiso / dias_lectivos) * 100) : 0,
    falta_justificada:
      dias_lectivos > 0 ? round2((counters.falta_justificada / dias_lectivos) * 100) : 0,
    falta_injustificada:
      dias_lectivos > 0 ? round2((counters.falta_injustificada / dias_lectivos) * 100) : 0,
  };

  // Alertas y reconocimientos
  const alertas = [];
  const reconocimientos = [];

  // Faltas injustificadas consecutivas >= 3
  let consecFI = 0;
  let triggeredFI = false;
  for (const r of registros) {
    if (r.estado === 'falta_injustificada') {
      consecFI += 1;
      if (!triggeredFI && consecFI >= 3) {
        alertas.push({
          tipo: 'faltas_consecutivas',
          nivel: 'critico',
          mensaje: 'Su hijo(a) tiene 3 faltas injustificadas consecutivas',
          icono: '🚨',
        });
        triggeredFI = true;
      }
    } else {
      consecFI = 0;
    }
  }

  // Tardanzas acumuladas >= 5
  if (counters.tardanza >= 5) {
    alertas.push({
      tipo: 'tardanzas_acumuladas',
      nivel: 'advertencia',
      mensaje: `Su hijo(a) ha acumulado ${counters.tardanza} tardanzas en este período`,
      icono: '⚠️',
    });
  }

  // Reconocimiento asistencia >= 95%
  if (asistencia_global >= 95) {
    reconocimientos.push({
      tipo: 'asistencia_destacada',
      mensaje: `Excelente: Asistencia del ${asistencia_global}% en el período`,
      icono: '✅',
    });
  }

  return {
    periodo: {
      fecha_inicio: ymd(start),
      fecha_fin: ymd(end),
      dias_totales,
      dias_lectivos,
      dias_no_lectivos,
    },
    registros: counters,
    porcentajes,
    alertas,
    reconocimientos,
  };
}

/**
 * GET /calendario/dias-no-lectivos?año=YYYY
 */
async function getNonLectiveDays({ año }) {
  if (!año) throw httpError('INVALID_PARAMETERS', 'año es requerido', 400);
  const year = Number(año);
  if (!Number.isInteger(year)) throw httpError('INVALID_PARAMETERS', 'Año inválido', 400);

  const data = getNonLectiveDaysByYear(year);
  return {
    año: year,
    dias_no_lectivos: data.dias_no_lectivos,
    fines_de_semana_automaticos: data.fines_de_semana_automaticos,
    total_dias_no_lectivos: data.dias_no_lectivos.length,
  };
}

/**
 * Exportación de asistencia en PDF para un rango de fechas
 * - FAST_PDF para tests/CI
 */
async function exportAttendancePDF({ estudiante_id, fecha_inicio, fecha_fin }) {
  // Validaciones básicas delegadas a getAttendanceStats para consistencia
  const stats = await getAttendanceStats({ estudiante_id, fecha_inicio, fecha_fin });
  const estudiante = await getEstudianteInfo(estudiante_id);

  // RN-33: Solo generar PDF si hay al menos un registro
  if ((stats?.registros?.total ?? 0) === 0) {
    throw httpError('NO_DATA_TO_EXPORT', 'Sin datos para exportar', 400);
  }

  if (process.env.NODE_ENV === 'test' || process.env.FAST_PDF === 'true') {
    const minimalPdf = `%PDF-1.4
% Minimal PDF generado en test
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 4 0 R >> endobj
4 0 obj << /Length 160 >> stream
BT
/F1 12 Tf
72 540 Td
(Asistencia ${estudiante.nombre_completo} ${stats.periodo.fecha_inicio} - ${stats.periodo.fecha_fin}) Tj
ET
endstream endobj
xref 0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000120 00000 n
0000000220 00000 n
trailer << /Root 1 0 R /Size 5 >>
startxref
300
%%EOF`;
    const filename = `Asistencia_${estudiante.nombre_completo.replace(/\s+/g, '')}_${stats.periodo.fecha_inicio.replace(/-/g, '')}-${stats.periodo.fecha_fin.replace(/-/g, '')}.pdf`;
    return { filename, buffer: Buffer.from(minimalPdf), mime: 'application/pdf' };
  }

  // Generación real con Puppeteer (landscape)
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Reporte de Asistencia</title>
<style>
  body { font-family: Arial, sans-serif; padding: 24px; }
  h1, h2 { color: #4B0082; }
  .muted { color: #777; }
  .stats { margin-top: 12px; }
  .stats li { margin: 4px 0; }
</style>
</head>
<body>
  <h1>I.E.P. LAS ORQUÍDEAS</h1>
  <h2>Reporte de Asistencia</h2>
  <p><strong>Estudiante:</strong> ${estudiante.nombre_completo} (${estudiante.codigo_estudiante})</p>
  <p><strong>Período:</strong> ${stats.periodo.fecha_inicio} a ${stats.periodo.fecha_fin}</p>

  <h3>Estadísticas</h3>
  <ul class="stats">
    <li><strong>Asistencia global:</strong> ${stats.porcentajes.asistencia_global}%</li>
    <li>Presentes: ${stats.registros.presente} (${stats.porcentajes.presente}%)</li>
    <li>Tardanzas: ${stats.registros.tardanza} (${stats.porcentajes.tardanza}%)</li>
    <li>Permisos: ${stats.registros.permiso} (${stats.porcentajes.permiso}%)</li>
    <li>Faltas Justificadas: ${stats.registros.falta_justificada} (${stats.porcentajes.falta_justificada}%)</li>
    <li>Faltas Injustificadas: ${stats.registros.falta_injustificada} (${stats.porcentajes.falta_injustificada}%)</li>
    <li>Sin registro: ${stats.registros.sin_registro}</li>
  </ul>

  ${stats.alertas.length > 0 ? `<h3>Alertas</h3><ul>${stats.alertas.map(a => `<li>${a.icono} ${a.mensaje}</li>`).join('')}</ul>` : ''}
  ${stats.reconocimientos.length > 0 ? `<h3>Reconocimientos</h3><ul>${stats.reconocimientos.map(a => `<li>${a.icono} ${a.mensaje}</li>`).join('')}</ul>` : ''}

  <p class="muted">Generado automáticamente por la plataforma.</p>
</body>
</html>
`.trim();

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
    const filename = `Asistencia_${estudiante.nombre_completo.replace(/\s+/g, '')}_${stats.periodo.fecha_inicio.replace(/-/g, '')}-${stats.periodo.fecha_fin.replace(/-/g, '')}.pdf`;
    return { filename, buffer: pdf, mime: 'application/pdf' };
  } finally {
    await browser.close();
  }
}

module.exports = {
  getAttendanceByPeriod,
  getAttendanceStats,
  getNonLectiveDays,
  exportAttendancePDF,
};