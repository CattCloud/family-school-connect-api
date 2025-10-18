'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { getCurrentAcademicYearController } = require('../controllers/academicYearController');

const router = Router();

// GET /anio-academico/actual - Obtener año académico actual
// Accesible para todos los roles autenticados
router.get('/anio-academico/actual', auth, getCurrentAcademicYearController);

module.exports = router;