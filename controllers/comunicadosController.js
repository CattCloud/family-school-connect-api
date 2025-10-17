const { z } = require('zod');
const comunicadosService = require('../services/comunicadosService');
const { successResponse, errorResponse } = require('../utils/response');

// Esquemas de validación con Zod
const crearComunicadoSchema = z.object({
  titulo: z.string().min(10, 'El título debe tener al menos 10 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  tipo: z.enum(['academico', 'administrativo', 'evento', 'urgente', 'informativo']),
  contenido_html: z.string().min(20, 'El contenido debe tener al menos 20 caracteres').max(5000, 'El contenido no puede exceder 5000 caracteres'),
  publico_objetivo: z.array(z.string()).min(1, 'Debes seleccionar al menos un público objetivo'),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  cursos: z.array(z.string()).optional(),
  fecha_programada: z.string().datetime().optional(),
  estado: z.enum(['borrador', 'publicado', 'programado']).default('borrador')
});

const editarComunicadoSchema = z.object({
  titulo: z.string().min(10, 'El título debe tener al menos 10 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  contenido_html: z.string().min(20, 'El contenido debe tener al menos 20 caracteres').max(5000, 'El contenido no puede exceder 5000 caracteres'),
  tipo: z.enum(['academico', 'administrativo', 'evento', 'urgente', 'informativo']),
  publico_objetivo: z.array(z.string()).min(1, 'Debes seleccionar al menos un público objetivo'),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  cursos: z.array(z.string()).optional()
});

const validarSegmentacionSchema = z.object({
  publico_objetivo: z.array(z.string()).min(1, 'Debes seleccionar al menos un público objetivo'),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  cursos: z.array(z.string()).optional()
});

const validarHtmlSchema = z.object({
  contenido_html: z.string().min(1, 'El contenido no puede estar vacío')
});

const destinatariosPreviewSchema = z.object({
  publico_objetivo: z.array(z.string()).min(1, 'Debes seleccionar al menos un público objetivo'),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  cursos: z.array(z.string()).optional(),
  todos: z.boolean().default(false)
});

const publicarBorradorSchema = z.object({
  fecha_programada: z.string().datetime().nullable().optional()
});

// Controladores
const crearComunicadoController = async (req, res) => {
  try {
    const validatedData = crearComunicadoSchema.parse(req.body);
    const usuario = req.user;
    
    const resultado = await comunicadosService.crearComunicado(validatedData, usuario);
    
    return successResponse(res, resultado, 201);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Error en crearComunicadoController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al crear el comunicado', 500);
  }
};

const guardarBorradorController = async (req, res) => {
  try {
    const validatedData = crearComunicadoSchema.parse({
      ...req.body,
      estado: 'borrador'
    });
    const usuario = req.user;
    
    const resultado = await comunicadosService.guardarBorrador(validatedData, usuario);
    
    return successResponse(res, resultado, 201);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Error en guardarBorradorController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al guardar el borrador', 500);
  }
};

const editarComunicadoController = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = editarComunicadoSchema.parse(req.body);
    const usuario = req.user;
    
    const resultado = await comunicadosService.editarComunicado(id, validatedData, usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Error en editarComunicadoController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al editar el comunicado', 500);
  }
};

const obtenerMisBorradoresController = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const usuario = req.user;
    
    const resultado = await comunicadosService.obtenerMisBorradores(usuario, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return successResponse(res, resultado);
  } catch (error) {
    console.error('Error en obtenerMisBorradoresController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al obtener los borradores', 500);
  }
};

const publicarBorradorController = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = publicarBorradorSchema.parse(req.body);
    const usuario = req.user;
    
    const resultado = await comunicadosService.publicarBorrador(id, validatedData, usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Error en publicarBorradorController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al publicar el borrador', 500);
  }
};

const obtenerComunicadosProgramadosController = async (req, res) => {
  try {
    const usuario = req.user;
    
    const resultado = await comunicadosService.obtenerComunicadosProgramados(usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    console.error('Error en obtenerComunicadosProgramadosController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al obtener comunicados programados', 500);
  }
};

const cancelarProgramacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    
    const resultado = await comunicadosService.cancelarProgramacion(id, usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    console.error('Error en cancelarProgramacionController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al cancelar la programación', 500);
  }
};

const validarHtmlController = async (req, res) => {
  try {
    const validatedData = validarHtmlSchema.parse(req.body);
    
    const resultado = await comunicadosService.validarHtml(validatedData.contenido_html);
    
    return successResponse(res, resultado);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Error en validarHtmlController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al validar el HTML', 500);
  }
};

const validarSegmentacionController = async (req, res) => {
  try {
    const validatedData = validarSegmentacionSchema.parse(req.body);
    const usuario = req.user;
    
    const resultado = await comunicadosService.validarSegmentacion(validatedData, usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Error en validarSegmentacionController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al validar la segmentación', 500);
  }
};

const verificarPermisosController = async (req, res) => {
  try {
    const { docente_id } = req.params;
    const usuario = req.user;
    
    const resultado = await comunicadosService.verificarPermisos(docente_id, usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    console.error('Error en verificarPermisosController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al verificar permisos', 500);
  }
};

const obtenerCursosDocenteController = async (req, res) => {
  try {
    const { docente_id } = req.params;
    const { año = new Date().getFullYear() } = req.query;
    const usuario = req.user;
    
    const resultado = await comunicadosService.obtenerCursosDocente(docente_id, parseInt(año), usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    console.error('Error en obtenerCursosDocenteController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al obtener cursos del docente', 500);
  }
};

const obtenerTodosCursosController = async (req, res) => {
  try {
    const { año = new Date().getFullYear() } = req.query;
    const usuario = req.user;
    
    const resultado = await comunicadosService.obtenerTodosCursos(parseInt(año), usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    console.error('Error en obtenerTodosCursosController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al obtener todos los cursos', 500);
  }
};

const obtenerNivelesGradosController = async (req, res) => {
  try {
    const usuario = req.user;
    
    const resultado = await comunicadosService.obtenerNivelesGrados(usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    console.error('Error en obtenerNivelesGradosController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al obtener niveles y grados', 500);
  }
};

const calcularDestinatariosPreviewController = async (req, res) => {
  try {
    const validatedData = destinatariosPreviewSchema.parse(req.body);
    const usuario = req.user;
    
    const resultado = await comunicadosService.calcularDestinatariosPreview(validatedData, usuario);
    
    return successResponse(res, resultado);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Error en calcularDestinatariosPreviewController:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al calcular destinatarios', 500);
  }
};

module.exports = {
  crearComunicadoController,
  guardarBorradorController,
  editarComunicadoController,
  obtenerMisBorradoresController,
  publicarBorradorController,
  obtenerComunicadosProgramadosController,
  cancelarProgramacionController,
  validarHtmlController,
  validarSegmentacionController,
  verificarPermisosController,
  obtenerCursosDocenteController,
  obtenerTodosCursosController,
  obtenerNivelesGradosController,
  calcularDestinatariosPreviewController
};