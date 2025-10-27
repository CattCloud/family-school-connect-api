'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { uploadGradesExcel } = require('../middleware/upload');
const { gradesValidateLimiter, gradesLoadLimiter } = require('../middleware/limiters');

const {
  postGradesTemplateController,
  postGradesValidateController,
  postGradesLoadController,
  getGradesErrorReportController,
} = require('../controllers/gradesController');

const router = Router();

/**
 * Endpoints Carga de Calificaciones (Semana 5)
 * - POST /calificaciones/plantilla            (Generar plantilla Excel)
 * - POST /calificaciones/validar              (Validar archivo Excel - multipart/form-data)
 * - POST /calificaciones/cargar               (Procesar e insertar calificaciones)
 * - GET  /calificaciones/reporte-errores/:id  (Descargar TXT de errores)
 *
 * Roles: Docente | Director
 */

// Generar plantilla
router.post(
  '/plantilla',
  auth,
  authorizeRole(['docente', 'director']),
  postGradesTemplateController
);

// Validar archivo (multipart/form-data, campo: archivo)
router.post(
  '/validar',
  auth,
  authorizeRole(['docente', 'director']),
  gradesValidateLimiter,
  uploadGradesExcel,
  postGradesValidateController
);

// Cargar calificaciones
router.post(
  '/cargar',
  auth,
  authorizeRole(['docente', 'director']),
  gradesLoadLimiter,
  postGradesLoadController
);

// Descargar reporte de errores TXT
router.get(
  '/reporte-errores/:id',
  auth,
  authorizeRole(['docente', 'director']),
  getGradesErrorReportController
);

module.exports = router;