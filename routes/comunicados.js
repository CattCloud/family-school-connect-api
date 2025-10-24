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
router.get('/comunicados', comunicadosReadLimiter, comunicadosController.obtenerComunicadosController);

// Obtener contador de comunicados no leídos
router.get('/comunicados/no-leidos/count', comunicadosReadLimiter, comunicadosController.obtenerContadorNoLeidosController);

// Buscar comunicados por término
router.get('/comunicados/search', comunicadosReadLimiter, comunicadosController.buscarComunicadosController);

// Verificar actualizaciones de comunicados (polling)
router.get('/comunicados/actualizaciones', comunicadosReadLimiter, comunicadosController.verificarActualizacionesController);

// ========================================
// LEER COMUNICADO COMPLETO (HU-COM-01)
// ========================================

// Obtener comunicado completo
router.get('/comunicados/:id', comunicadosReadLimiter, comunicadosController.obtenerComunicadoController);

// Marcar comunicado como leído
router.post('/comunicados-lecturas', comunicadosReadLimiter, comunicadosController.marcarComoLeidoController);

// Validar acceso a comunicado
router.get('/comunicados/:id/acceso', comunicadosReadLimiter, comunicadosController.validarAccesoController);

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
router.post('/comunicados', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.crearComunicadoController);

// Guardar borrador de comunicado
router.post('/comunicados/borrador', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.guardarBorradorController);

// ========================================
// GESTIÓN DE COMUNICADOS PROPIOS (HU-COM-03)
// ========================================

// Editar comunicado
router.put('/comunicados/:id', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.editarComunicadoController);

// Obtener mis borradores
router.get('/comunicados/mis-borradores', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.obtenerMisBorradoresController);

// Publicar borrador
router.post('/comunicados/:id/publicar', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.publicarBorradorController);

// Obtener comunicados programados
router.get('/comunicados/programados', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.obtenerComunicadosProgramadosController);

// Cancelar programación de comunicado
router.delete('/comunicados/:id/programacion', comunicadosLimiter, authorizeRole(['director', 'docente']), comunicadosController.cancelarProgramacionController);

// ========================================
// VALIDACIONES
// ========================================

// Validar HTML
router.post('/comunicados/validar-html', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.validarHtmlController);

// Validar segmentación
router.post('/comunicados/validar-segmentacion', comunicadosReadLimiter, authorizeRole(['director', 'docente']), comunicadosController.validarSegmentacionController);

// ========================================
// GESTIÓN ADMINISTRATIVA (SOLO DIRECTOR)
// ========================================

// Desactivar comunicado
router.patch('/comunicados/:id/desactivar', comunicadosLimiter, authorizeRole(['director']), comunicadosController.desactivarComunicadoController);

// Eliminar comunicado
router.delete('/comunicados/:id', comunicadosLimiter, authorizeRole(['director']), comunicadosController.eliminarComunicadoController);

// Rutas para validaciones
// Solo directores y docentes con permisos pueden validar comunicados
router.post('/comunicados/validar-html', authorizeRole(['director', 'docente']), comunicadosController.validarHtmlController);
router.post('/comunicados/validar-segmentacion', authorizeRole(['director', 'docente']), comunicadosController.validarSegmentacionController);


module.exports = router;