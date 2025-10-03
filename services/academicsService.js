'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

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

async function checkDocenteCourseAccess(docenteId, cursoId, year = getCurrentAcademicYear()) {
  const asig = await prisma.asignacionDocenteCurso.findFirst({
    where: {
      docente_id: docenteId,
      curso_id: cursoId,
      año_academico: year,
      estado_activo: true,
    },
    select: { id: true },
  });
  return !!asig;
}

function normalizeNivel(nivel) {
  if (nivel == null) return null;
  const key = String(nivel).trim().toLowerCase();
  const map = { inicial: 'Inicial', primaria: 'Primaria', secundaria: 'Secundaria' };
  return map[key] || null;
}

// ========== Cursos asignados a docente ==========
async function listDocenteCursos(docenteId, año) {
  const year = año || getCurrentAcademicYear();
  const asignaciones = await prisma.asignacionDocenteCurso.findMany({
    where: {
      docente_id: docenteId,
      año_academico: year,
      estado_activo: true,
    },
    select: {
      curso: {
        select: {
          id: true,
          codigo_curso: true,
          nombre: true,
          nivel_grado: {
            select: { id: true, nivel: true, grado: true, descripcion: true },
          },
          estado_activo: true,
        },
      },
      nivel_grado: {
        select: { id: true, nivel: true, grado: true, descripcion: true },
      },
    },
  });

  if (!asignaciones || asignaciones.length === 0) {
    throw httpError('NO_COURSE_ASSIGNMENTS', `No tiene cursos asignados para el año ${year}`, 404);
  }

  const cursos = [];
  for (const a of asignaciones) {
    const ngId = a.nivel_grado.id;
    const total_estudiantes = await prisma.estudiante.count({
      where: { nivel_grado_id: ngId, año_academico: year, estado_matricula: 'activo' },
    });
    cursos.push({
      id: a.curso.id,
      codigo_curso: a.curso.codigo_curso,
      nombre: a.curso.nombre,
      nivel_grado: {
        id: a.nivel_grado.id,
        nivel: a.nivel_grado.nivel,
        grado: a.nivel_grado.grado,
        descripcion: a.nivel_grado.descripcion || null,
      },
      total_estudiantes,
      estado_activo: a.curso.estado_activo,
    });
  }

  // Orden sugerido: nivel, grado, nombre curso
  cursos.sort((c1, c2) => {
    const n1 = String(c1.nivel_grado.nivel);
    const n2 = String(c2.nivel_grado.nivel);
    if (n1 !== n2) return n1.localeCompare(n2);
    const g1 = String(c1.nivel_grado.grado);
    const g2 = String(c2.nivel_grado.grado);
    if (g1 !== g2) return g1.localeCompare(g2, undefined, { numeric: true });
    return String(c1.nombre).localeCompare(String(c2.nombre));
  });

  return { año_academico: year, cursos, total_cursos: cursos.length };
}

// ========== Cursos por nivel/grado (director) ==========
async function getCursosByNivelGrado(nivel, grado, año) {
  const year = año || getCurrentAcademicYear();
  const canonicalNivel = normalizeNivel(nivel);
  if (!canonicalNivel || !grado) {
    throw httpError('MISSING_PARAMETERS', "Los parámetros 'nivel' y 'grado' son requeridos", 400);
  }

  const ng = await prisma.nivelGrado.findFirst({
    where: { nivel: canonicalNivel, grado: String(grado) },
    select: { id: true, nivel: true, grado: true, descripcion: true },
  });
  if (!ng) {
    throw httpError('NIVEL_GRADO_NOT_FOUND', `Nivel '${nivel}' - Grado '${grado}' no existe en el sistema`, 404);
  }

  const cursosRaw = await prisma.curso.findMany({
    where: { nivel_grado_id: ng.id, año_academico: year, estado_activo: true },
    select: { id: true, codigo_curso: true, nombre: true, estado_activo: true },
  });

  const cursos = [];
  for (const c of cursosRaw) {
    // docente asignado (primera asignación activa del año)
    const asig = await prisma.asignacionDocenteCurso.findFirst({
      where: { curso_id: c.id, año_academico: year, estado_activo: true },
      select: {
        docente: { select: { id: true, nombre: true, apellido: true } },
      },
    });
    const total_estudiantes = await prisma.estudiante.count({
      where: { nivel_grado_id: ng.id, año_academico: year, estado_matricula: 'activo' },
    });

    cursos.push({
      id: c.id,
      codigo_curso: c.codigo_curso,
      nombre: c.nombre,
      total_estudiantes,
      docente_asignado: asig
        ? {
            id: asig.docente.id,
            nombre: `${asig.docente.nombre} ${asig.docente.apellido}`.trim(),
          }
        : null,
      estado_activo: c.estado_activo,
    });
  }

  // Orden alfabético por nombre de curso
  cursos.sort((a, b) => a.nombre.localeCompare(b.nombre));

  return {
    nivel_grado: {
      id: ng.id,
      nivel: ng.nivel,
      grado: ng.grado,
      descripcion: ng.descripcion || null,
    },
    año_academico: year,
    cursos,
    total_cursos: cursos.length,
  };
}

// ========== Estudiantes de un curso (por nivel_grado) ==========
async function listEstudiantesByCurso({ curso_id, nivel_grado_id, año, requester }) {
  const year = año || getCurrentAcademicYear();
  if (!curso_id || !nivel_grado_id) {
    throw httpError('INVALID_PARAMETERS', 'curso_id y nivel_grado_id son requeridos', 400);
  }

  // Validar que el curso pertenece al nivel_grado
  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year },
    select: { id: true, nombre: true, nivel_grado: { select: { nivel: true, grado: true } } },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'curso_id y nivel_grado_id no corresponden o no están activos para el año', 400);
  }

  // Si es docente, validar acceso al curso
  if (requester?.rol === 'docente') {
    const hasAccess = await checkDocenteCourseAccess(requester.id, curso_id, year);
    if (!hasAccess) {
      throw httpError('COURSE_ACCESS_DENIED', 'No tiene permisos para acceder a este curso', 403);
    }
  }

  const estudiantes = await prisma.estudiante.findMany({
    where: { nivel_grado_id, año_academico: year, estado_matricula: 'activo' },
    select: { id: true, codigo_estudiante: true, nombre: true, apellido: true },
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
  });

  // Cargar apoderado principal (si existe relación activa)
  const enriched = [];
  for (const e of estudiantes) {
    const rel = await prisma.relacionesFamiliares.findFirst({
      where: { estudiante_id: e.id, estado_activo: true, año_academico: year },
      select: {
        apoderado: { select: { id: true, nombre: true, apellido: true, telefono: true } },
      },
    });
    enriched.push({
      id: e.id,
      codigo_estudiante: e.codigo_estudiante,
      nombre: e.nombre,
      apellido: e.apellido,
      nombre_completo: `${e.nombre} ${e.apellido}`.trim(),
      apoderado_principal: rel
        ? {
            id: rel.apoderado.id,
            nombre: `${rel.apoderado.nombre} ${rel.apoderado.apellido}`.trim(),
            telefono: rel.apoderado.telefono,
          }
        : null,
      estado_matricula: 'activo',
    });
  }

  return {
    curso: {
      id: curso.id,
      nombre: curso.nombre,
      nivel_grado: {
        nivel: curso.nivel_grado.nivel,
        grado: curso.nivel_grado.grado,
      },
    },
    año_academico: year,
    estudiantes: enriched,
    total_estudiantes: enriched.length,
  };
}

module.exports = {
  getCurrentAcademicYear,
  checkDocenteCourseAccess,
  listDocenteCursos,
  getCursosByNivelGrado,
  listEstudiantesByCurso,
};