'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { templatesLimiter } = require('../middleware/limiters');

const {
  getTemplatesTypesController,
  postTemplatesCalificacionesController,
  postTemplatesAsistenciaController,
  getTemplatesGuideController,
  getTemplatesGuidePdfController,
} = require('../controllers/templatesController');

const router = Router();

/**
 * Centro de Plantillas (MVP)
 * - GET  /plantillas/tipos
 * - POST /plantillas/calificaciones
 * - POST /plantillas/asistencia
 * - GET  /plantillas/guias/:tipo
 * - GET  /plantillas/guias/:tipo/pdf
 *
 * Roles: Docente | Director
 */

// Tipos de plantillas disponibles
router.get(
  '/plantillas/tipos',
  auth,
  authorizeRole(['docente', 'director']),
  getTemplatesTypesController
);

// Generar plantilla de calificaciones
router.post(
  '/plantillas/calificaciones',
  auth,
  authorizeRole(['docente', 'director']),
  templatesLimiter,
  postTemplatesCalificacionesController
);

// Generar plantilla de asistencia
router.post(
  '/plantillas/asistencia',
  auth,
  authorizeRole(['docente', 'director']),
  templatesLimiter,
  postTemplatesAsistenciaController
);

// Guía (texto)
router.get(
  '/plantillas/guias/:tipo',
  auth,
  authorizeRole(['docente', 'director']),
  getTemplatesGuideController
);

// Guía (PDF simulado)
router.get(
  '/plantillas/guias/:tipo/pdf',
  auth,
  authorizeRole(['docente', 'director']),
  getTemplatesGuidePdfController
);

module.exports = router;