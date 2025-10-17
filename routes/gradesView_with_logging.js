'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateParentAccess } = require('../middleware/access');
const { parentsReadLimiter } = require('../middleware/limiters');
const { logAccess } = require('../middleware/logging');
const {
  getStudentComponentGradesController,
  getStudentComponentAverageController,
} = require('../controllers/gradesViewController');

const router = Router();

// GET /calificaciones/estudiante/:estudiante_id
router.get(
  '/calificaciones/estudiante/:estudiante_id',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  logAccess('calificaciones', 'consulta_detalle'),
  getStudentComponentGradesController
);

// GET /calificaciones/estudiante/:estudiante_id/promedio
router.get(
  '/calificaciones/estudiante/:estudiante_id/promedio',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  logAccess('calificaciones', 'consulta_promedio'),
  getStudentComponentAverageController
);

module.exports = router;