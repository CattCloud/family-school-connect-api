'use strict';

const prisma = require('../config/prisma');

function getCurrentAcademicYear() {
  return new Date().getFullYear();
}

/**
 * Lista docentes asignados a un curso para selección de destinatario (HU-MSG-01)
 * Reglas:
 * - Solo accesible por apoderado (admin pasa por override en middleware si aplica)
 * - RN-29: Solo docentes con estado_activo = true
 * - RN-30: Solo docentes con asignación activa en asignaciones_docente_curso
 * - RN-31: Verificar que asignación corresponde al año académico especificado
 * - Orden alfabético por nombre completo
 */
async function getActiveTeachersForCourse({ user, curso_id, año }) {
  if (!user || !user.id) {
    const e = new Error('Usuario no autenticado');
    e.status = 401;
    e.code = 'INVALID_TOKEN';
    throw e;
  }
  if (user.rol !== 'apoderado' && user.rol !== 'administrador') {
    const e = new Error('Acción no permitida para el rol');
    e.status = 403;
    e.code = 'ACCESS_DENIED';
    throw e;
  }

  const year = año || getCurrentAcademicYear();

  // Obtener curso para exponer en respuesta (id y nombre)
  const curso = await prisma.curso.findUnique({
    where: { id: curso_id },
    select: { id: true, nombre: true, estado_activo: true },
  });
  if (!curso) {
    const e = new Error('Curso no encontrado');
    e.status = 404;
    e.code = 'COURSE_NOT_FOUND';
    throw e;
  }

  // Docentes con asignación activa para el curso en el año indicado
  const asignaciones = await prisma.asignacionDocenteCurso.findMany({
    where: {
      curso_id,
      año_academico: year,
      estado_activo: true,
      docente: { estado_activo: true },
    },
    select: {
      docente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          telefono: true,
          estado_activo: true,
        },
      },
    },
  });

  const docentes = asignaciones
    .map((a) => a.docente)
    .filter(Boolean)
    .map((d) => ({
      id: d.id,
      nombre_completo: `${d.nombre} ${d.apellido}`,
      telefono: d.telefono,
      avatar_url: null,
    }))
    .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es', { sensitivity: 'base' }));

  return {
    curso: {
      id: curso.id,
      nombre: curso.nombre,
    },
    docentes,
    total_docentes: docentes.length,
  };
}

module.exports = {
  getCurrentAcademicYear,
  getActiveTeachersForCourse,
};