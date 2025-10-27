'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const { toLetter } = require('./gradesService');

/**
 * Helpers
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
  // date: Date | string (ISO)
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Normaliza Decimal de Prisma a Number
 */
function toNumber(dec) {
  if (dec == null) return null;
  if (typeof dec === 'number') return dec;
  // Prisma Decimal suele venir como stringifiable
  const n = Number(dec);
  return Number.isFinite(n) ? n : null;
}

/**
 * Obtiene información mínima del estudiante requerida por los contratos
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
  if (!est) {
    throw httpError('STUDENT_NOT_FOUND', 'Estudiante no existe', 404);
  }
  const nombre_completo = `${est.nombre} ${est.apellido}`.trim();
  return {
    id: est.id,
    codigo_estudiante: est.codigo_estudiante,
    nombre_completo,
    nivel_grado: {
      nivel: est.nivel_grado?.nivel || null,
      grado: est.nivel_grado?.grado || null,
    },
  };
}

/**
 * Verifica existencia de curso para año académico
 */
async function getCursoInfo(curso_id, año) {
  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, año_academico: año, estado_activo: true },
    select: { id: true, nombre: true },
  });
  if (!curso) {
    throw httpError('COURSE_NOT_FOUND', 'Curso no existe para el año académico', 404);
  }
  return { id: curso.id, nombre: curso.nombre };
}

/**
 * Verifica existencia de componente (estructura_evaluacion) para año académico
 */
async function getComponenteInfo(componente_id, año) {
  const comp = await prisma.estructuraEvaluacion.findFirst({
    where: { id: componente_id, año_academico: año, estado_activo: true },
    select: {
      id: true,
      nombre_item: true,
      peso_porcentual: true,
      tipo_evaluacion: true,
    },
  });
  if (!comp) {
    throw httpError(
      'COMPONENT_NOT_FOUND',
      'Componente de evaluación no existe o no está activo para el año académico',
      404
    );
  }
  return {
    id: comp.id,
    nombre_item: comp.nombre_item,
    peso_porcentual: toNumber(comp.peso_porcentual),
    tipo_evaluacion: comp.tipo_evaluacion,
  };
}

/**
 * HU-ACAD-06
 * Lista las calificaciones (evaluaciones) del estudiante para un curso, componente, trimestre y año.
 * Orden: fecha_evaluacion desc
 */
async function getStudentComponentGrades({ estudiante_id, año, trimestre, curso_id, componente_id }) {
  // Validaciones básicas
  if (!estudiante_id || !año || !trimestre || !curso_id || !componente_id) {
    throw httpError(
      'INVALID_PARAMETERS',
      'estudiante_id, año, trimestre, curso_id y componente_id son requeridos',
      400
    );
  }
  const tri = Number(trimestre);
  if (![1, 2, 3].includes(tri)) {
    throw httpError('INVALID_PARAMETERS', 'Trimestre inválido. Debe ser 1, 2 o 3', 400);
  }

  const estudiante = await getEstudianteInfo(estudiante_id);
  const curso = await getCursoInfo(curso_id, año);
  const componente = await getComponenteInfo(componente_id, año);

  const evaluaciones = await prisma.evaluacion.findMany({
    where: {
      estudiante_id,
      año_academico: año,
      trimestre: tri,
      curso_id,
      estructura_evaluacion_id: componente_id,
    },
    include: {
      registrante: { select: { nombre: true, apellido: true } },
    },
    orderBy: [{ fecha_evaluacion: 'desc' }],
  });

  if (evaluaciones.length === 0) {
    throw httpError(
      'NO_GRADES_FOUND',
      `No hay calificaciones registradas para ${componente.nombre_item} en el Trimestre ${tri}`,
      404
    );
  }

  let suma = 0;
  let hayPreliminar = false;

  const items = evaluaciones.map((ev) => {
    const num = toNumber(ev.calificacion_numerica);
    const letra = toLetter(num);
    const regNombre = `${ev.registrante?.nombre || ''} ${ev.registrante?.apellido || ''}`.trim();
    if (Number.isFinite(num)) suma += num;
    if (ev.estado === 'preliminar') hayPreliminar = true;

    return {
      id: ev.id,
      fecha_evaluacion: ev.fecha_evaluacion.toISOString().slice(0, 10),
      fecha_evaluacion_legible: formatSpanishDateISO(ev.fecha_evaluacion),
      calificacion_numerica: num,
      calificacion_letra: letra,
      estado: ev.estado,
      fecha_registro: ev.fecha_registro ? ev.fecha_registro.toISOString() : null,
      registrado_por: {
        nombre: regNombre || null,
      },
    };
  });

  const total = items.length;
  const promedio = total > 0 ? round2(suma / total) : null;

  return {
    estudiante,
    curso,
    componente,
    trimestre: tri,
    año_academico: año,
    evaluaciones: items,
    total_evaluaciones: total,
    promedio_componente: promedio,
    hay_notas_preliminares: hayPreliminar,
  };
}

/**
 * HU-ACAD-06
 * Calcula el promedio del componente para estudiante/curso/trimestre/año.
 */
async function getStudentComponentAverage({ estudiante_id, año, trimestre, curso_id, componente_id }) {
  if (!estudiante_id || !año || !trimestre || !curso_id || !componente_id) {
    throw httpError(
      'INVALID_PARAMETERS',
      'estudiante_id, año, trimestre, curso_id y componente_id son requeridos',
      400
    );
  }
  const tri = Number(trimestre);
  if (![1, 2, 3].includes(tri)) {
    throw httpError('INVALID_PARAMETERS', 'Trimestre inválido. Debe ser 1, 2 o 3', 400);
  }

  // Verificaciones de existencia para devolver errores del contrato
  await getEstudianteInfo(estudiante_id);
  const componente = await getComponenteInfo(componente_id, año);
  await getCursoInfo(curso_id, año);

  const where = {
    estudiante_id,
    año_academico: año,
    trimestre: tri,
    curso_id,
    estructura_evaluacion_id: componente_id,
  };

  // Necesitamos conocer si hay preliminares para el estado final
  const [aggr, prelimCount] = await Promise.all([
    prisma.evaluacion.aggregate({
      where,
      _sum: { calificacion_numerica: true },
      _count: { _all: true },
    }),
    prisma.evaluacion.count({ where: { ...where, estado: 'preliminar' } }),
  ]);

  const total = aggr?._count?._all || 0;
  if (total === 0) {
    throw httpError('NO_GRADES_FOUND', 'No hay calificaciones registradas para el filtro aplicado', 404);
  }

  const suma = toNumber(aggr?._sum?.calificacion_numerica) || 0;
  const promedio = round2(suma / total);
  const promedio_letra = promedio != null ? toLetter(promedio) : null;
  const estado = prelimCount > 0 ? 'preliminar' : 'final';

  return {
    componente: {
      id: componente.id,
      nombre: componente.nombre_item,
      tipo: componente.tipo_evaluacion,
    },
    total_evaluaciones: total,
    suma_calificaciones: round2(suma),
    promedio,
    promedio_letra,
    estado,
    mensaje:
      estado === 'preliminar'
        ? 'Este promedio es preliminar y puede cambiar hasta el cierre del trimestre'
        : 'Promedio oficial',
  };
}

module.exports = {
  getStudentComponentGrades,
  getStudentComponentAverage,
};