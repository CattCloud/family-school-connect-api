'use strict';

const { z } = require('zod');
const {
  listConversations,
  countUnread,
  getUpdatesSince,
  markConversationRead,
  closeConversation,
  // HU-MSG-01
  checkConversationExists,
  createConversationWithMessage,
  // HU-MSG-03
  getConversationById,
  getMessagesPaginated,
  sendMessageInConversation,
  markMessagesAsRead,
  getNewMessagesSince,
  getAttachmentForDownload,
} = require('../services/messagingService');

// Schemas de validación (Zod)
const ListQuerySchema = z.object({
  page: z
    .preprocess((v) => (v != null ? Number(v) : 1), z.number().int().min(1))
    .optional()
    .default(1),
  limit: z
    .preprocess((v) => (v != null ? Number(v) : 20), z.number().int().min(1).max(50))
    .optional()
    .default(20),
  filtro: z.enum(['todos', 'recibidos', 'enviados']).optional().default('todos'),
  estudiante_id: z.string().min(1).optional(),
  curso_id: z.string().min(1).optional(),
  grado: z
    .preprocess((v) => (v != null && v !== '' ? Number(v) : undefined), z.number().int())
    .optional(),
  estado: z.enum(['activa', 'cerrada']).optional().default('activa'),
  busqueda: z.string().trim().min(2).optional(),
});

const UpdatesQuerySchema = z.object({
  ultimo_check: z
    .string()
    .min(1, "El parámetro 'ultimo_check' es requerido")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), "El parámetro 'ultimo_check' debe ser un ISO válido"),
});

// HU-MSG-01: Schemas adicionales
const ConversationExistsQuerySchema = z.object({
  docente_id: z.string().trim().min(1, 'docente_id requerido'),
  estudiante_id: z.string().trim().min(1, 'estudiante_id requerido'),
  curso_id: z.string().trim().min(1, 'curso_id requerido'),
});

const CreateConversationBodySchema = z.object({
  estudiante_id: z.string().trim().min(1, 'estudiante_id requerido'),
  curso_id: z.string().trim().min(1, 'curso_id requerido'),
  docente_id: z.string().trim().min(1, 'docente_id requerido'),
  asunto: z.string().trim().min(10).max(200),
  mensaje: z.string().trim().min(10).max(1000),
  año: z.preprocess((v) => (v != null && v !== '' ? Number(v) : undefined), z.number().int().optional()),
});

// HU-MSG-03: Schemas
const GetMessagesQuerySchema = z.object({
  conversacion_id: z.string().trim().min(1, 'conversacion_id requerido'),
  limit: z
    .preprocess((v) => (v != null && v !== '' ? Number(v) : 50), z.number().int().min(1).max(100))
    .optional()
    .default(50),
  offset: z
    .preprocess((v) => (v != null && v !== '' ? Number(v) : 0), z.number().int().min(0))
    .optional()
    .default(0),
  orden: z.enum(['asc', 'desc']).optional().default('asc'),
});

const SendMessageBodySchema = z.object({
  conversacion_id: z.string().trim().min(1, 'conversacion_id requerido'),
  contenido: z.string().trim().optional(),
});

const MarkReadBodySchema = z.object({
  conversacion_id: z.string().trim().min(1, 'conversacion_id requerido'),
  mensajes_ids: z.array(z.string().trim().min(1)).min(1, 'mensajes_ids requerido'),
});

const NewMessagesQuerySchema = z.object({
  conversacion_id: z.string().trim().min(1, 'conversacion_id requerido'),
  ultimo_mensaje_id: z.string().trim().min(1, 'ultimo_mensaje_id requerido'),
});

// GET /conversaciones
async function getConversationsController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }

    const parsed = ListQuerySchema.parse(req.query || {});
    const data = await listConversations({ user, query: parsed });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

// GET /conversaciones/no-leidas/count
async function getUnreadCountController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const data = await countUnread({ user });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /conversaciones/actualizaciones
async function getConversationsUpdatesController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const parsed = UpdatesQuerySchema.parse(req.query || {});
    const data = await getUpdatesSince({ user, ultimo_check: parsed.ultimo_check });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

// PATCH /conversaciones/:id/marcar-leida
async function markConversationReadController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const conversacion_id = String(req.params?.id || '').trim();
    if (!conversacion_id) {
      const e = new Error('Parámetro id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }
    const data = await markConversationRead({ user, conversacion_id });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// PATCH /conversaciones/:id/cerrar
async function closeConversationController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const conversacion_id = String(req.params?.id || '').trim();
    if (!conversacion_id) {
      const e = new Error('Parámetro id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }
    const data = await closeConversation({ user, conversacion_id });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /conversaciones/existe
async function checkConversationExistsController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const { docente_id, estudiante_id, curso_id } = ConversationExistsQuerySchema.parse(req.query || {});
    const data = await checkConversationExists({ user, docente_id, estudiante_id, curso_id });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

// POST /conversaciones
async function createConversationController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    // Nota: body proviene de multipart/form-data. Zod validará strings.
    const parsed = CreateConversationBodySchema.parse(req.body || {});
    const files = Array.isArray(req.files) ? req.files : [];
    const data = await createConversationWithMessage({ user, body: parsed, files });
    return res.status(201).json({ success: true, data, message: 'Conversación creada y mensaje enviado correctamente' });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
    }
    next(err);
  }
}

/**
 * HU-MSG-03 — GET /conversaciones/:id
 */
async function getConversationByIdController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const conversacion_id = String(req.params?.id || '').trim();
    if (!conversacion_id) {
      const e = new Error('Parámetro id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }
    const data = await getConversationById({ user, conversacion_id });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * HU-MSG-03 — GET /mensajes?conversacion_id=&limit=&offset=&orden=
 */
async function getMessagesController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const parsed = GetMessagesQuerySchema.parse(req.query || {});
    const data = await getMessagesPaginated({
      user,
      conversacion_id: parsed.conversacion_id,
      limit: parsed.limit,
      offset: parsed.offset,
      orden: parsed.orden,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

/**
 * HU-MSG-03 — POST /mensajes (multipart/form-data)
 */
async function sendMessageController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const parsed = SendMessageBodySchema.parse(req.body || {});
    const files = Array.isArray(req.files) ? req.files : [];
    const data = await sendMessageInConversation({ user, body: parsed, files });
    return res.status(201).json({ success: true, data, message: 'Mensaje enviado correctamente' });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
    }
    next(err);
  }
}

/**
 * HU-MSG-03 — PATCH /mensajes/marcar-leidos
 */
async function markMessagesBatchReadController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const parsed = MarkReadBodySchema.parse(req.body || {});
    const data = await markMessagesAsRead({
      user,
      conversacion_id: parsed.conversacion_id,
      mensajes_ids: parsed.mensajes_ids,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
    }
    next(err);
  }
}

/**
 * HU-MSG-03 — GET /mensajes/nuevos?conversacion_id=&ultimo_mensaje_id=
 */
async function getNewMessagesController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const parsed = NewMessagesQuerySchema.parse(req.query || {});
    const data = await getNewMessagesSince({
      user,
      conversacion_id: parsed.conversacion_id,
      ultimo_mensaje_id: parsed.ultimo_mensaje_id,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

/**
 * HU-MSG-03 — GET /archivos/:id/download
 * Implementación: redirección 302 a la URL de Cloudinary
 */
async function downloadAttachmentController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    const archivo_id = String(req.params?.id || '').trim();
    if (!archivo_id) {
      const e = new Error('Parámetro id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }
    const data = await getAttachmentForDownload({ user, archivo_id });
    // Redirigir a URL Cloudinary (descarga/visualización manejada por CDN)
    return res.redirect(302, data.url);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConversationsController,
  getUnreadCountController,
  getConversationsUpdatesController,
  markConversationReadController,
  closeConversationController,
  // HU-MSG-01
  checkConversationExistsController,
  createConversationController,
  // HU-MSG-03
  getConversationByIdController,
  getMessagesController,
  sendMessageController,
  markMessagesBatchReadController,
  getNewMessagesController,
  downloadAttachmentController,
};