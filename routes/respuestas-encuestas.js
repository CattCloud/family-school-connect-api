const express = require('express');
const router = express.Router();
const encuestasController = require('../controllers/encuestasController');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// Obtener Tabla Paginada de Respuestas
// GET /respuestas-encuestas?encuesta_id=&page=&limit=&nivel=&grado=&curso=&rol=&order=
router.get('/', encuestasController.obtenerTablaRespuestas);

module.exports = router;