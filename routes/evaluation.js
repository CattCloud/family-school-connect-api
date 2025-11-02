'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');

const {
  getEvaluationStructure,
  putEvaluationStructure,
  getEvaluationTemplates,
  getEvaluationPreview,
  getEvaluationHistory,
  getNivelGradoController,
} = require('../controllers/evaluationController');

const router = Router();
 
// Estructura de evaluación: ver estructura actual por año (Docente/Director/Apoderado)
router.get(
  '/',
  auth,
  authorizeRole(['docente', 'director', 'apoderado']),
  getEvaluationStructure
);

// Director: crear/actualizar estructura (bloquea para el año)
router.put(
  '/',
  auth,
  authorizeRole(['director']),
  putEvaluationStructure
);

// Director: historial de configuraciones
router.get(
  '/history',
  auth,
  authorizeRole(['director']),
  getEvaluationHistory
);

// Director: plantillas predefinidas
router.get(
  '/templates',
  auth,
  authorizeRole(['director']),
  getEvaluationTemplates
);

// Director: previsualizar impacto de pesos
router.get(
  '/preview',
  auth,
  authorizeRole(['director']),
  getEvaluationPreview
);

// Datos maestros (todos los roles)
router.get(
  '/nivel-grado',
  auth,
  getNivelGradoController
);

module.exports = router;