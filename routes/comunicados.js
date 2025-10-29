const express = require('express');
const router = express.Router();
const comunicadosController = require('../controllers/comunicadosController');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { comunicadosLimiter, comunicadosReadLimiter } = require('../middleware/limiters');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// ========================================
// BANDEJA DE COMUNICADOS (HU-COM-00)
// ========================================

// Obtener lista de comunicados del usuario con paginación y filtros
router.get('/', comunicadosReadLimiter, comunicadosController.obtenerComunicadosController);

// Obtener contador de comunicados no leídos
router.get('/no-leidos/count', comunicadosReadLimiter, comunicadosController.obtenerContadorNoLeidosController);

// Buscar comunicados por término
router.get('/search', comunicadosReadLimiter, comunicadosController.buscarComunicadosController);

// Verificar actualizaciones de comunicados (polling)
router.get('/actualizaciones', comunicadosReadLimiter, comunicadosController.verificarActualizacionesController);

// ========================================
// LEER COMUNICADO COMPLETO (HU-COM-01)
// ========================================

// Obtener comunicado completo
router.get('/:id', comunicadosReadLimiter, comunicadosController.obtenerComunicadoController);

// Marcar comunicado como leído
router.post('/comunicados-lecturas', comunicadosReadLimiter, comunicadosController.marcarComoLeidoController);

// Validar acceso a comunicado
router.get('/:id/acceso', comunicadosReadLimiter, comunicadosController.validarAccesoController);

// ========================================
// CREAR Y PUBLICAR COMUNICADO (HU-COM-02)
// ========================================

// Verificar permisos de creación de comunicados
router.get('/permisos-docentes/:docente_id', comunicadosReadLimiter, comunicadosController.verificarPermisosController);

// Obtener cursos asignados a un docente
router.get('/cursos/docente/:docente_id', comunicadosReadLimiter, comunicadosController.obtenerCursosDocenteController);

// Obtener todos los niveles y grados (solo director)
router.get('/nivel-grado', comunicadosReadLimiter, comunicadosController.obtenerNivelesGradosController);

// Calcular destinatarios estimados (preview)
router.post('/usuarios/destinatarios/preview', comunicadosReadLimiter, comunicadosController.calcularDestinatariosPreviewController);

// Crear comunicado (Publicado o Borrador)
router.post('/', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.crearComunicadoController);

// Guardar borrador de comunicado
router.post('/borrador', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.guardarBorradorController);

// ========================================
// GESTIÓN DE COMUNICADOS PROPIOS (HU-COM-03)
// ========================================

// Editar comunicado
router.put('/:id', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.editarComunicadoController);

// Obtener mis borradores
router.get('/mis-borradores', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.obtenerMisBorradoresController);

// Publicar borrador
router.post('/:id/publicar', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.publicarBorradorController);

// Obtener comunicados programados
router.get('/programados', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.obtenerComunicadosProgramadosController);

// Cancelar programación de comunicado
router.delete('/:id/programacion', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.cancelarProgramacionController);

// ========================================
// VALIDACIONES
// ========================================

// Validar HTML
router.post('/validar-html', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.validarHtmlController);

// Validar segmentación
router.post('/validar-segmentacion', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.validarSegmentacionController);

// ========================================
// GESTIÓN ADMINISTRATIVA (SOLO DIRECTOR)
// ========================================

// Desactivar comunicado
router.patch('/:id/desactivar', comunicadosLimiter, authorizeRole(['director']), comunicadosController.desactivarComunicadoController);

// Eliminar comunicado
router.delete('/:id', comunicadosLimiter, authorizeRole(['director']), comunicadosController.eliminarComunicadoController);

// Rutas para validaciones
// Solo directores y docentes con permisos pueden validar comunicados
router.post('/validar-html', authorizeRole(['director', 'docente']), comunicadosController.validarHtmlController);
router.post('/validar-segmentacion', authorizeRole(['director', 'docente']), comunicadosController.validarSegmentacionController);


module.exports = router;