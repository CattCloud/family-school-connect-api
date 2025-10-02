'use strict';

const { z } = require('zod');
const {
  getCurrentAcademicYear,
  ensureTeacherExists,
  hasActiveAssignments,
  upsertPermission,
  listTeachersWithPermissions,
  getPermissionHistory,
  getTeacherWithPermissions,
} = require('../services/permissionsService');

const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  filter: z.enum(['todos', 'con_permisos', 'sin_permisos']).optional(),
});

const TipoPermisoEnum = z.enum(['comunicados', 'encuestas']);

const PatchPermissionSchema = z.object({
  // Normaliza strings y valida contra enum permitido
  tipo_permiso: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    TipoPermisoEnum
  ),
  // Acepta "true"/"false" (string) y los convierte a boolean
  estado_activo: z.coerce.boolean(),
});

// GET /teachers/permissions
async function getTeachersPermissions(req, res, next) {
  try {
    // Si el rol es docente, devolver SOLO sus propios permisos en el mismo formato de respuesta
    if (req.user?.rol === 'docente') {
      const row = await getTeacherWithPermissions(req.user.id);
      return res.status(200).json({
        success: true,
        data: {
          docentes: [row],
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_records: 1,
            per_page: 1,
          },
        },
      });
    }

    // Por defecto (director): listado paginado con filtros/búsqueda
    const { page, limit, search, filter } = PaginationQuerySchema.parse(req.query || {});
    const data = await listTeachersWithPermissions({ page, limit, search, filter });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// PATCH /teachers/:docente_id/permissions
async function patchTeacherPermission(req, res, next) {
  try {
    const { docente_id } = req.params;
    const { tipo_permiso, estado_activo } = PatchPermissionSchema.parse(req.body || {});
    
    const year = getCurrentAcademicYear();

    const docente = await ensureTeacherExists(docente_id);


    const permiso = await upsertPermission({
      docenteId: docente_id,
      tipoPermiso: tipo_permiso,
      estadoActivo: estado_activo,
      directorId: req.user?.id || null,
      year,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Permiso actualizado correctamente',
        permiso: {
          docente_id: docente_id,
          tipo_permiso,
          estado_activo: permiso.estado_activo,
          fecha_otorgamiento: permiso.fecha_otorgamiento,
          otorgado_por: permiso.otorgado_por,
          año_academico: year,
        },
      },
    });
  } catch (err) {
    if (err.code === 'TEACHER_NOT_FOUND') err.status = 404;
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// GET /teachers/:docente_id/permissions/history
async function getTeacherPermissionHistory(req, res, next) {
  try {
    const { docente_id } = req.params;
    const year = getCurrentAcademicYear();
    const data = await getPermissionHistory(docente_id, year);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.code === 'TEACHER_NOT_FOUND') err.status = 404;
    next(err);
  }
}

module.exports = {
  getTeachersPermissions,
  patchTeacherPermission,
  getTeacherPermissionHistory,
};