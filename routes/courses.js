'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { getCoursesByStudentController } = require('../controllers/coursesController');

const router = Router();

// HU-MSG-01 — Obtener Cursos del Estudiante
// GET /cursos/estudiante/:estudiante_id
router.get(
  '/estudiante/:estudiante_id',
  auth,
  authorizeRole(['apoderado']),
  getCoursesByStudentController
);

module.exports = router;