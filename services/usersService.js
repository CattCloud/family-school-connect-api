'use strict';

const prisma = require('../config/prisma');

/**
 * Obtiene los hijos (estudiantes) vinculados al padre autenticado.
 * Reglas:
 * - Solo relaciones_familiares.estado_activo = true
 * - Solo estudiantes con estado_matricula = 'activo'
 * - Ordenar por Apellido, Nombre (asc)
 */
async function getChildrenForParent(user) {
  if (!user || !user.id) {
    const e = new Error('Usuario no autenticado');
    e.status = 401;
    e.code = 'INVALID_TOKEN';
    throw e;
  }

  const relaciones = await prisma.relacionesFamiliares.findMany({
    where: {
      apoderado_id: user.id,
      estado_activo: true,
      estudiante: {
        estado_matricula: 'activo',
      },
    },
    select: {
      estudiante: {
        select: {
          id: true,
          codigo_estudiante: true,
          nombre: true,
          apellido: true,
          estado_matricula: true,
          nivel_grado: {
            select: {
              nivel: true,
              grado: true,
              descripcion: true,
            },
          },
        },
      },
    },
  });

  // Mapear y ordenar
  const hijos = (relaciones || [])
    .map((r) => {
      const est = r.estudiante;
      return {
        id: est.id,
        codigo_estudiante: est.codigo_estudiante,
        nombre_completo: `${est.nombre} ${est.apellido}`,
        nivel_grado: {
          nivel: est.nivel_grado?.nivel || null,
          grado: est.nivel_grado?.grado || null,
          descripcion: est.nivel_grado?.descripcion || null,
        },
        estado_matricula: est.estado_matricula,
      };
    })
    .sort((a, b) => {
      // Orden: apellido, nombre (asc)
      const [an, aa] = a.nombre_completo.split(' ');
      const [bn, ba] = b.nombre_completo.split(' ');
      const lastA = aa || '';
      const lastB = ba || '';
      if (lastA.toLowerCase() < lastB.toLowerCase()) return -1;
      if (lastA.toLowerCase() > lastB.toLowerCase()) return 1;
      return a.nombre_completo.toLowerCase() < b.nombre_completo.toLowerCase() ? -1 : 1;
    });

  return {
    padre: {
      id: user.id,
      nombre: `${user.nombre} ${user.apellido}`,
    },
  hijos,
    total_hijos: hijos.length,
  };
}

module.exports = {
  getChildrenForParent,
};