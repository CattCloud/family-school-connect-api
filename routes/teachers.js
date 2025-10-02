'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');

const {
  getTeachersPermissions,
  patchTeacherPermission,
  getTeacherPermissionHistory,
} = require('../controllers/teachersController');

const router = Router();

// Gestión de permisos de docentes
// - Director: obtiene listado paginado de todos los docentes
// - Docente: obtiene únicamente sus propios permisos (controlado en el controlador)
router.get(
  '/teachers/permissions',
  auth,
  authorizeRole(['director', 'docente']),
  getTeachersPermissions
);

router.patch(
  '/teachers/:docente_id/permissions',
  auth,
  authorizeRole(['director']),
  patchTeacherPermission
);

router.get(
  '/teachers/:docente_id/permissions/history',
  auth,
  authorizeRole(['director']),
  getTeacherPermissionHistory
);

module.exports = router;