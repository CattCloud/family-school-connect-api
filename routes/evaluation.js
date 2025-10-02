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

// Director: ver estructura actual por año
router.get(
  '/evaluation-structure',
  auth,
  authorizeRole(['director']),
  getEvaluationStructure
);

// Director: crear/actualizar estructura (bloquea para el año)
router.put(
  '/evaluation-structure',
  auth,
  authorizeRole(['director']),
  putEvaluationStructure
);

// Director: historial de configuraciones
router.get(
  '/evaluation-structure/history',
  auth,
  authorizeRole(['director']),
  getEvaluationHistory
);

// Director: plantillas predefinidas
router.get(
  '/evaluation-structure/templates',
  auth,
  authorizeRole(['director']),
  getEvaluationTemplates
);

// Director: previsualizar impacto de pesos
router.get(
  '/evaluation-structure/preview',
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