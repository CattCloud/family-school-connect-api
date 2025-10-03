'use strict';

const { generateGradesTemplate } = require('./gradesService');
const { generateAttendanceTemplate } = require('./attendanceService');

/**
 * Centro de Plantillas - Servicio (MVP)
 * - Reusa generation de calificaciones/asistencia para exponerlas bajo /plantillas/*
 * - Guías: contenido simulado (texto) y PDF simulado (buffer)
 */

// Tipos soportados (MVP)
function listTemplateTypes() {
  return [
    {
      tipo: 'calificaciones',
      descripcion: 'Plantilla para carga de calificaciones por curso y componente',
      endpoints: {
        generar: '/plantillas/calificaciones',
        guia: '/plantillas/guias/calificaciones',
        guia_pdf: '/plantillas/guias/calificaciones/pdf',
      },
      requiere: ['curso_id', 'nivel_grado_id', 'trimestre', 'componente_id'],
      formato: 'Excel (.xlsx/.xls)',
    },
    {
      tipo: 'asistencia',
      descripcion: 'Plantilla para carga de asistencias por curso y fecha',
      endpoints: {
        generar: '/plantillas/asistencia',
        guia: '/plantillas/guias/asistencia',
        guia_pdf: '/plantillas/guias/asistencia/pdf',
      },
      requiere: ['curso_id', 'nivel_grado_id', 'fecha'],
      formato: 'Excel (.xlsx/.xls)',
    },
  ];
}

// Delegaciones a servicios existentes

async function generateTemplateCalificaciones(params) {
  // params: { curso_id, nivel_grado_id, trimestre, componente_id, año_academico? }
  const { buffer, filename } = await generateGradesTemplate(params);
  return { buffer, filename, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
}

async function generateTemplateAsistencia(params) {
  // params: { curso_id, nivel_grado_id, fecha, año_academico? }
  const { buffer, filename } = await generateAttendanceTemplate(params);
  return { buffer, filename, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
}

// Guías (simuladas)

function guideTextFor(tipo) {
  if (tipo === 'calificaciones') {
    return [
      'GUÍA DE USO - PLANTILLA DE CALIFICACIONES',
      '========================================',
      '',
      '1) Descargue la plantilla desde /plantillas/calificaciones enviando:',
      '   - curso_id, nivel_grado_id, trimestre, componente_id',
      '2) Complete solo la columna "calificacion" (0-20) y "observaciones" si aplica.',
      '3) No edite los encabezados ni reordene filas.',
      '4) Valide el archivo en /calificaciones/validar (multipart/form-data, campo: archivo).',
      '5) Si la validación es correcta, cargue en /calificaciones/cargar con el validacion_id.',
      '',
      'Notas:',
      '- Para componentes "unica", no se duplicará evaluación por estudiante.',
      '- Para componentes "recurrente", pueden existir varias evaluaciones por trimestre.',
    ].join('\n');
  }
  if (tipo === 'asistencia') {
    return [
      'GUÍA DE USO - PLANTILLA DE ASISTENCIA',
      '=====================================',
      '',
      '1) Descargue la plantilla desde /plantillas/asistencia enviando:',
      '   - curso_id, nivel_grado_id, fecha (YYYY-MM-DD)',
      '2) Complete la columna "estado" con uno de:',
      '   presente | tardanza | permiso | falta_justificada | falta_injustificada',
      '3) Si marca "tardanza", complete "hora_llegada" (HH:MM, 24h).',
      '4) Valide el archivo en /asistencias/validar (multipart/form-data, campo: archivo).',
      '5) Si la validación es correcta, cargue en /asistencias/cargar con el validacion_id.',
      '',
      'Notas:',
      '- La fecha no puede ser futura.',
      '- Los códigos de estudiante deben existir en el curso seleccionado.',
    ].join('\n');
  }
  return [
    'GUÍA NO DISPONIBLE',
    '===================',
    '',
    'Tipo no reconocido. Use: calificaciones | asistencia',
  ].join('\n');
}

function getGuide(tipo) {
  const text = guideTextFor(String(tipo || '').trim().toLowerCase());
  const filename = `Guia_${tipo || 'desconocido'}.txt`;
  return { content: text, filename, contentType: 'text/plain; charset=utf-8' };
}

function getGuidePdf(tipo) {
  // PDF simulado (no válido para visores avanzados, pero usable como stub)
  const title = `Guía de ${tipo || 'Plantillas'}`;
  const body = guideTextFor(String(tipo || '').trim().toLowerCase());
  // Mínimo PDF stub
  const pseudoPdf = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj',
    `4 0 obj << /Length ${body.length + title.length + 50} >> stream`,
    `Guia: ${title}\n\n${body}\n`,
    'endstream endobj',
    'xref 0 5',
    '0000000000 65535 f ',
    'trailer << /Size 5 /Root 1 0 R >>',
    'startxref',
    '0',
    '%%EOF',
  ].join('\n');
  const buffer = Buffer.from(pseudoPdf, 'utf8');
  const filename = `Guia_${tipo || 'Plantillas'}.pdf`;
  return { buffer, filename, contentType: 'application/pdf' };
}

module.exports = {
  listTemplateTypes,
  generateTemplateCalificaciones,
  generateTemplateAsistencia,
  getGuide,
  getGuidePdf,
};