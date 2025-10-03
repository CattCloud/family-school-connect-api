'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');

const {
  getCursosAsignadosController,
  getCursosByNivelGradoController,
  getEstudiantesByCursoController,
} = require('../controllers/academicsController');

const router = Router();

/**
 * Endpoints según doc/Semana 5/DocumentacionAPI_datos1.md
 *
 * - GET /cursos/asignados                (Rol: Docente)
 * - GET /cursos?nivel=&grado=            (Rol: Director)
 * - GET /estudiantes?curso_id=&nivel_grado_id=  (Roles: Docente, Director)
 */

// Docente: cursos asignados
router.get(
  '/cursos/asignados',
  auth,
  authorizeRole(['docente']),
  getCursosAsignadosController
);

// Director: cursos por nivel/grado
router.get(
  '/cursos',
  auth,
  authorizeRole(['director']),
  getCursosByNivelGradoController
);

// Docente/Director: estudiantes del curso
router.get(
  '/estudiantes',
  auth,
  authorizeRole(['docente', 'director']),
  getEstudiantesByCursoController
);

module.exports = router;