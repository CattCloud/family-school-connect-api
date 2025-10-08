'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateParentAccess } = require('../middleware/access');
const { parentsReadLimiter } = require('../middleware/limiters');
const { validateMutuallyExclusive } = require('../middleware/validateMutuallyExclusive');

const {
  getAttendanceByPeriodController,
  getAttendanceStatsController,
  exportAttendanceController,
} = require('../controllers/attendanceViewController');

const router = Router();

/**
 * HU-ACAD-07 — Visualización de Asistencia (Padres)
 *
 * Endpoints:
 * - GET /asistencias/estudiante/:estudiante_id
 *     Query: ?año=YYYY & (mes=1..12 | trimestre=1..3) [mutuamente excluyentes]
 * - GET /asistencias/estudiante/:estudiante_id/estadisticas
 *     Query: ?fecha_inicio=YYYY-MM-DD & fecha_fin=YYYY-MM-DD
 * - GET /asistencias/estudiante/:estudiante_id/export
 *     Query: ?formato=pdf & fecha_inicio=YYYY-MM-DD & fecha_fin=YYYY-MM-DD
 */

// GET /asistencias/estudiante/:estudiante_id
router.get(
  '/asistencias/estudiante/:estudiante_id',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  validateMutuallyExclusive(['mes', 'trimestre']),
  parentsReadLimiter,
  getAttendanceByPeriodController
);

// GET /asistencias/estudiante/:estudiante_id/estadisticas
router.get(
  '/asistencias/estudiante/:estudiante_id/estadisticas',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  getAttendanceStatsController
);

// GET /asistencias/estudiante/:estudiante_id/export
router.get(
  '/asistencias/estudiante/:estudiante_id/export',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  exportAttendanceController
);

module.exports = router;