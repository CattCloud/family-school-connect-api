const express = require('express');
const router = express.Router();
const encuestasController = require('../controllers/encuestasController');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// SECCIÓN 1: PANEL DE ENCUESTAS (HU-ENC-00)

// 1. Obtener Lista de Encuestas del Usuario
// GET /encuestas?page=1&limit=12&estado=todos&tipo=todos&busqueda=satisfaccion&ordenamiento=mas_reciente
router.get('/', encuestasController.obtenerEncuestas);

// 2. Obtener Contador de Encuestas Pendientes
// GET /encuestas/pendientes/count
router.get('/pendientes/count', encuestasController.obtenerContadorPendientes);

// 3. Buscar Encuestas
// GET /encuestas/search?query=satisfaccion&limit=20&offset=0&estado=todos
router.get('/search', encuestasController.buscarEncuestas);

// 4. Verificar Actualizaciones de Encuestas (Polling)
// GET /encuestas/actualizaciones?ultimo_check=2025-10-18T10:00:00Z
router.get('/actualizaciones', encuestasController.verificarActualizaciones);

// SECCIÓN 2: RESPONDER ENCUESTA (HU-ENC-01)

// 5. Validar Acceso a Encuesta
// GET /encuestas/:id/validar-acceso
router.get('/:id/validar-acceso', encuestasController.validarAccesoEncuesta);

// 6. Obtener Formulario de Encuesta para Responder
// GET /encuestas/:id/formulario
router.get('/:id/formulario', encuestasController.obtenerFormularioEncuesta);

// SECCIÓN 3: CREAR ENCUESTA (HU-ENC-03)

// 7. Crear Nueva Encuesta
// POST /encuestas
router.post('/', encuestasController.crearEncuesta);

// SECCIÓN 4: RESPONDER ENCUESTA (HU-ENC-01)

// 8. Enviar Respuestas de Encuesta
// POST /respuestas-encuestas
router.post('/respuestas', encuestasController.enviarRespuestas);

// SECCIÓN 5: VER MIS RESPUESTAS (HU-ENC-02)

// 9. Obtener Respuestas Propias de Encuesta
// GET /encuestas/:id/mis-respuestas
router.get('/:id/mis-respuestas', encuestasController.obtenerMisRespuestas);

// SECCIÓN 6: VER RESULTADOS DE ENCUESTA (HU-ENC-05)

// 10. Obtener Resultados Agregados por Pregunta
// GET /encuestas/:id/resultados/preguntas
router.get('/:id/resultados/preguntas', encuestasController.obtenerResultadosPorPregunta);

// 11. Obtener Estadísticas Generales de Encuesta
// GET /encuestas/:id/estadisticas
router.get('/:id/estadisticas', encuestasController.obtenerEstadisticasGenerales);

// 12. Obtener Tabla de Respuestas
// GET /respuestas-encuestas
//router.get('/respuestas-encuestas', encuestasController.obtenerTablaRespuestas);

module.exports = router;