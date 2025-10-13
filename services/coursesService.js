'use strict';

const prisma = require('../config/prisma');

/**
 * Año académico actual
 */
function getCurrentAcademicYear() {
  return new Date().getFullYear();
}

/**
 * Verifica relación activa padre-estudiante y matrícula activa
 * Lanza STUDENT_NOT_LINKED (403) si no corresponde
 */
async function ensureParentHasStudent(padre_id, estudiante_id) {
  const rel = await prisma.relacionesFamiliares.findFirst({
    where: {
      apoderado_id: padre_id,
      estudiante_id,
      estado_activo: true,
      estudiante: { estado_matricula: 'activo' },
    },
    select: { id: true },
  });
  if (!rel) {
    const e = new Error('El estudiante no está vinculado al apoderado');
    e.status = 403;
    e.code = 'STUDENT_NOT_LINKED';
    throw e;
  }
}

/**
 * Lista cursos del estudiante (año dado o año actual), solo con docentes asignados activos
 * Reglas:
 * - RN-25: validar acceso del padre al estudiante
 * - RN-26: solo cursos del año académico especificado
 * - RN-27: solo cursos con asignaciones_docente_curso activas
 * - RN-28: ordenar alfabéticamente por nombre de curso
 */
async function getCoursesForStudent({ user, estudiante_id, año }) {
  if (!user || !user.id) {
    const e = new Error('Usuario no autenticado');
    e.status = 401;
    e.code = 'INVALID_TOKEN';
    throw e;
  }
  if (user.rol !== 'apoderado') {
    const e = new Error('Acción no permitida para el rol');
    e.status = 403;
    e.code = 'ACCESS_DENIED';
    throw e;
  }

  await ensureParentHasStudent(user.id, estudiante_id);

  const year = año || getCurrentAcademicYear();

  // Obtener estudiante para exponer nombre en la respuesta
  const est = await prisma.estudiante.findUnique({
    where: { id: estudiante_id },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      nivel_grado_id: true,
    },
  });
  if (!est) {
    const e = new Error('Estudiante no encontrado');
    e.status = 404;
    e.code = 'STUDENT_NOT_FOUND';
    throw e;
  }

  // Cursos del mismo nivel_grado del estudiante, por año indicado y activos
  // Con al menos un docente asignado activo en ese año
  const cursos = await prisma.curso.findMany({
    where: {
      nivel_grado_id: est.nivel_grado_id,
      año_academico: year,
      estado_activo: true,
      asignaciones: {
        some: {
          estado_activo: true,
          año_academico: year,
        },
      },
    },
    select: {
      id: true,
      codigo_curso: true,
      nombre: true,
      nivel_grado: {
        select: {
          nivel: true,
          grado: true,
        },
      },
    },
    orderBy: { nombre: 'asc' },
  });

  return {
    estudiante: {
      id: est.id,
      nombre_completo: `${est.nombre} ${est.apellido}`,
    },
    año_academico: year,
    cursos: cursos.map((c) => ({
      id: c.id,
      codigo_curso: c.codigo_curso || null,
      nombre: c.nombre,
      nivel_grado: {
        nivel: c.nivel_grado?.nivel || null,
        grado: c.nivel_grado?.grado || null,
      },
    })),
    total_cursos: cursos.length,
  };
}

module.exports = {
  getCurrentAcademicYear,
  getCoursesForStudent,
};