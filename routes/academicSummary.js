'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateParentAccess } = require('../middleware/access');
const { parentsReadLimiter } = require('../middleware/limiters');
const {
  getAcademicSummaryController,
  exportAcademicSummaryController,
  getStudentTrimestreAveragesController,
  getStudentAnnualAveragesController,
} = require('../controllers/academicSummaryController');

const router = Router();

/**
 * HU-ACAD-09 — Visualización de Resumen Trimestral y Anual Consolidado
 *
 * Endpoints:
 * - GET /resumen-academico/estudiante/:estudiante_id
 *     Query: ?año={año}&trimestre={trimestre} (si no se envía trimestre => vista anual)
 * - GET /resumen-academico/estudiante/:estudiante_id/export
 *     Query: ?año={año}&formato=pdf (boleta institucional anual)
 *
 * Middlewares:
 *  - auth (JWT)
 *  - authorizeRole(['apoderado']) (override admin por defecto en role.js)
 *  - validateParentAccess (relación apoderado-estudiante activa)
 *  - parentsReadLimiter (60 req/min)
 */

// GET /resumen-academico/estudiante/:estudiante_id
router.get(
  '/estudiante/:estudiante_id',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  getAcademicSummaryController
);

// GET /resumen-academico/estudiante/:estudiante_id/export
router.get(
  '/estudiante/:estudiante_id/export',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  exportAcademicSummaryController
);

// GET /resumen-academico/estudiante/:estudiante_id/promedios-trimestre
router.get(
  '/estudiante/:estudiante_id/promedios-trimestre',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  getStudentTrimestreAveragesController
);

// GET /resumen-academico/estudiante/:estudiante_id/promedios-anuales
router.get(
  '/estudiante/:estudiante_id/promedios-anuales',
  auth,
  authorizeRole(['apoderado']),
  validateParentAccess,
  parentsReadLimiter,
  getStudentAnnualAveragesController
);

module.exports = router;