'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { getChildrenController } = require('../controllers/usersController');

const router = Router();

// HU-MSG-01 — Obtener Hijos del Padre Autenticado
// GET /usuarios/hijos
router.get(
  '/usuarios/hijos',
  auth,
  authorizeRole(['apoderado']), // admin puede pasar por override del middleware
  getChildrenController
);

module.exports = router;