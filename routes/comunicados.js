const express = require('express');
const router = express.Router();
const comunicadosController = require('../controllers/comunicadosController');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { comunicadosLimiter } = require('../middleware/limiters');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// Rutas para creación y gestión de comunicados
// Solo directores y docentes con permisos pueden crear/editar comunicados
router.post('/comunicados', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.crearComunicadoController);
router.post('/comunicados/borrador', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.guardarBorradorController);
router.put('/comunicados/:id', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.editarComunicadoController);
router.get('/comunicados/mis-borradores', authorizeRole(['director', 'docente']), comunicadosController.obtenerMisBorradoresController);
router.post('/comunicados/:id/publicar', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.publicarBorradorController);
router.get('/comunicados/programados', authorizeRole(['director', 'docente']), comunicadosController.obtenerComunicadosProgramadosController);
router.delete('/comunicados/:id/programacion', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.cancelarProgramacionController);

// Rutas para validaciones
// Solo directores y docentes con permisos pueden validar comunicados
router.post('/comunicados/validar-html', authorizeRole(['director', 'docente']), comunicadosController.validarHtmlController);
router.post('/comunicados/validar-segmentacion', authorizeRole(['director', 'docente']), comunicadosController.validarSegmentacionController);

// Rutas para obtener datos de referencia
// Solo directores pueden verificar permisos de otros docentes
router.get('/permisos-docentes/:docente_id', authorizeRole(['director']), comunicadosController.verificarPermisosController);
// Solo directores pueden ver cursos de cualquier docente
router.get('/cursos/docente/:docente_id', authorizeRole(['director']), comunicadosController.obtenerCursosDocenteController);
// Solo directores pueden ver todos los cursos
router.get('/cursos/todos', authorizeRole(['director']), comunicadosController.obtenerTodosCursosController);
// Solo directores pueden ver todos los niveles y grados
router.get('/nivel-grado', authorizeRole(['director']), comunicadosController.obtenerNivelesGradosController);
// Solo directores y docentes con permisos pueden calcular destinatarios
router.post('/usuarios/destinatarios/preview', authorizeRole(['director', 'docente']), comunicadosController.calcularDestinatariosPreviewController);

module.exports = router;