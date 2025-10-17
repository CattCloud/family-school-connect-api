'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateParentAccess } = require('../middleware/access');
const { parentsReadLimiter } = require('../middleware/limiters');
const { logAccess } = require('../middleware/logging');
const {
  getStudentAttendanceController,
  getStudentAttendanceStatisticsController,
  exportAttendanceReportController
} = require('../controllers/attendanceViewController');

const router = Router();

// GET /asistencias/estudiante/:estudiante_id
router.get(
  '/asistencias/estudiante/:estudiante_id',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  logAccess('asistencia', 'consulta_detalle'),
  getStudentAttendanceController
);

// GET /asistencias/estudiante/:estudiante_id/estadisticas
router.get(
  '/asistencias/estudiante/:estudiante_id/estadisticas',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  logAccess('asistencia', 'consulta_estadisticas'),
  getStudentAttendanceStatisticsController
);

// GET /asistencias/estudiante/:estudiante_id/export
router.get(
  '/asistencias/estudiante/:estudiante_id/export',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  logAccess('asistencia', 'exportar_reporte'),
  exportAttendanceReportController
);

module.exports = router;