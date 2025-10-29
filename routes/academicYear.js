const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAcademicYearController } = require('../controllers/academicYearController');

// Endpoint para obtener el año académico actual
router.get('/actual', auth, getAcademicYearController);

module.exports = router;