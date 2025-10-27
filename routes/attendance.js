'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { uploadAttendanceExcel } = require('../middleware/upload');
const { attendanceValidateLimiter, attendanceLoadLimiter } = require('../middleware/limiters');

const {
  getAttendanceVerifyController,
  postAttendanceTemplateController,
  postAttendanceValidateController,
  postAttendanceLoadController,
  getAttendanceErrorReportController,
  getAttendanceStatsController,
} = require('../controllers/attendanceController');

const router = Router();

/**
 * Endpoints Carga de Asistencias (Semana 5)
 * - GET  /asistencias/verificar            (verifica curso/nivel_grado/fecha)
 * - POST /asistencias/plantilla            (Generar plantilla Excel)
 * - POST /asistencias/validar              (Validar archivo Excel - multipart/form-data)
 * - POST /asistencias/cargar               (Procesar e insertar asistencias)
 * - GET  /asistencias/reporte-errores/:id  (Descargar TXT de errores)
 * - GET  /asistencias/estadisticas         (Resumen del día por curso)
 *
 * Roles: Docente | Director
 */

// Verificar contexto
router.get(
  '/verificar',
  auth,
  authorizeRole(['docente', 'director']),
  getAttendanceVerifyController
);

// Generar plantilla
router.post(
  '/plantilla',
  auth,
  authorizeRole(['docente', 'director']),
  postAttendanceTemplateController
);

// Validar archivo (multipart/form-data, campo: archivo)
router.post(
  '/validar',
  auth,
  authorizeRole(['docente', 'director']),
  attendanceValidateLimiter,
  uploadAttendanceExcel,
  postAttendanceValidateController
);

// Cargar asistencias
router.post(
  '/cargar',
  auth,
  authorizeRole(['docente', 'director']),
  attendanceLoadLimiter,
  postAttendanceLoadController
);

// Descargar reporte de errores TXT
router.get(
  '/reporte-errores/:id',
  auth,
  authorizeRole(['docente', 'director']),
  getAttendanceErrorReportController
);

// Estadísticas del día por curso
router.get(
  '/estadisticas',
  auth,
  authorizeRole(['docente', 'director']),
  getAttendanceStatsController
);

module.exports = router;