'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateParentAccess } = require('../middleware/access');
const { parentsReadLimiter } = require('../middleware/limiters');
const {
  getStudentComponentGradesController,
  getStudentComponentAverageController,
} = require('../controllers/gradesViewController');

const router = Router();

// GET /calificaciones/estudiante/:estudiante_id
router.get(
  '/:estudiante_id',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  getStudentComponentGradesController
);

// GET /calificaciones/estudiante/:estudiante_id/promedio
router.get(
  '/:estudiante_id/promedio',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  getStudentComponentAverageController
);

module.exports = router;