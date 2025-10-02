'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

function getCurrentAcademicYear() {
  // Permite forzar año por env; por defecto año actual
  const forced = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(forced) ? forced : new Date().getFullYear();
}

async function ensureTeacherExists(docenteId) {
  const docente = await prisma.usuario.findUnique({
    where: { id: docenteId },
    select: { id: true, rol: true, estado_activo: true, nombre: true, apellido: true },
  });
  if (!docente || docente.rol !== 'docente' || !docente.estado_activo) {
    const e = new Error('Docente no existe o está inactivo');
    e.status = 404;
    e.code = 'TEACHER_NOT_FOUND';
    throw e;
  }
  return docente;
}

async function hasActiveAssignments(docenteId, year) {
  const count = await prisma.asignacionDocenteCurso.count({
    where: {
      docente_id: docenteId,
      año_academico: year,
      estado_activo: true,
    },
  });
  return count > 0;
}

async function upsertPermission({ docenteId, tipoPermiso, estadoActivo, directorId, year }) {
  const permiso = await prisma.permisoDocente.upsert({
    where: {
      docente_id_tipo_permiso_año_academico: {
        docente_id: docenteId,
        tipo_permiso: tipoPermiso,
        año_academico: year,
      },
    },
    create: {
      docente_id: docenteId,
      tipo_permiso: tipoPermiso,
      estado_activo: estadoActivo,
      año_academico: year,
      otorgado_por: directorId || null,
    },
    update: {
      estado_activo: estadoActivo,
      otorgado_por: directorId || null,
      fecha_otorgamiento: new Date(),
    },
  });

  await prisma.permisoDocenteLog.create({
    data: {
      docente_id: docenteId,
      tipo_permiso: tipoPermiso,
      accion: estadoActivo ? 'activado' : 'desactivado',
      otorgado_por: directorId || null,
      año_academico: year,
    },
  });

  return permiso;
}

function mapDocenteRow(row, year) {
  const permisos = { comunicados: { estado_activo: false, fecha_otorgamiento: null, otorgado_por: null }, encuestas: { estado_activo: false, fecha_otorgamiento: null, otorgado_por: null } };
  for (const p of row.permisosDocentes || []) {
    if (p.año_academico !== year) continue;
    permisos[p.tipo_permiso] = {
      estado_activo: p.estado_activo,
      fecha_otorgamiento: p.fecha_otorgamiento,
      otorgado_por: p.otorgado_por,
    };
  }

  const cursos_asignados = (row.asignacionesDocente || [])
    .filter(a => a.año_academico === year && a.estado_activo)
    .map(a => ({
      curso_id: a.curso.id,
      nombre: a.curso.nombre,
      nivel: a.nivel_grado.nivel,
      grado: a.nivel_grado.grado,
    }));

  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    telefono: row.telefono,
    permisos,
    cursos_asignados,
    estado_activo: row.estado_activo,
  };
}

async function listTeachersWithPermissions({ page = 1, limit = 20, search, filter }) {
  const year = getCurrentAcademicYear();
  const where = {
    rol: 'docente',
    estado_activo: true,
    ...(search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const total = await prisma.usuario.count({ where });
  const docentes = await prisma.usuario.findMany({
    where,
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    skip: (page - 1) * limit,
    take: limit,
    include: {
      permisosDocentes: {
        where: { año_academico: year },
        select: { tipo_permiso: true, estado_activo: true, fecha_otorgamiento: true, otorgado_por: true, año_academico: true },
      },
      asignacionesDocente: {
        where: { año_academico: year, estado_activo: true },
        include: {
          curso: { select: { id: true, nombre: true } },
          nivel_grado: { select: { nivel: true, grado: true } },
        },
      },
    },
  });

  let mapped = docentes.map(d => mapDocenteRow(d, year));
  if (filter === 'con_permisos') {
    mapped = mapped.filter(d => d.permisos.comunicados.estado_activo || d.permisos.encuestas.estado_activo);
  } else if (filter === 'sin_permisos') {
    mapped = mapped.filter(d => !d.permisos.comunicados.estado_activo && !d.permisos.encuestas.estado_activo);
  }

  return {
    docentes: mapped,
    pagination: {
      current_page: page,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      total_records: total,
      per_page: limit,
    },
  };
}

/**
 * Obtiene un único docente con sus permisos actuales y cursos asignados (año actual por defecto)
 */
async function getTeacherWithPermissions(docenteId, year = getCurrentAcademicYear()) {
  await ensureTeacherExists(docenteId);
  const row = await prisma.usuario.findUnique({
    where: { id: docenteId },
    include: {
      permisosDocentes: {
        where: { año_academico: year },
        select: {
          tipo_permiso: true,
          estado_activo: true,
          fecha_otorgamiento: true,
          otorgado_por: true,
          año_academico: true,
        },
      },
      asignacionesDocente: {
        where: { año_academico: year, estado_activo: true },
        include: {
          curso: { select: { id: true, nombre: true } },
          nivel_grado: { select: { nivel: true, grado: true } },
        },
      },
    },
  });

  // mapear al mismo formato usado en listTeachersWithPermissions
  return mapDocenteRow(row, year);
}

async function getPermissionHistory(docenteId, year) {
  const docente = await ensureTeacherExists(docenteId);
  const historial = await prisma.permisoDocenteLog.findMany({
    where: { docente_id: docenteId, año_academico: year },
    orderBy: { fecha: 'desc' },
    select: {
      id: true,
      tipo_permiso: true,
      accion: true,
      fecha: true,
      otorgado_por: true,
    },
  });

  return {
    docente: { id: docente.id, nombre: `${docente.nombre} ${docente.apellido}` },
    historial,
    total_cambios: historial.length,
  };
}

module.exports = {
  getCurrentAcademicYear,
  ensureTeacherExists,
  hasActiveAssignments,
  upsertPermission,
  listTeachersWithPermissions,
  getTeacherWithPermissions,
  getPermissionHistory,
};