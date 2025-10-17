'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { messagingReadLimiter, messagingCreateLimiter, messagingSendLimiter } = require('../middleware/limiters');
const { uploadMessagingAttachments } = require('../middleware/upload');
const { logAccess } = require('../middleware/logging');

const {
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
} = require('../controllers/messagingController');

const router = Router();

// Bandeja de mensajería (HU-MSG-00)
// GET /conversaciones
router.get(
  '/conversaciones',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  logAccess('mensajes', 'listar_conversaciones'),
  getConversationsController
);

// GET /conversaciones/no-leidas/count
router.get(
  '/conversaciones/no-leidas/count',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  logAccess('mensajes', 'contar_no_leidos'),
  getUnreadCountController
);

// GET /conversaciones/actualizaciones?ultimo_check=ISO
router.get(
  '/conversaciones/actualizaciones',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  logAccess('mensajes', 'verificar_actualizaciones'),
  getConversationsUpdatesController
);

// PATCH /conversaciones/:id/marcar-leida
router.patch(
  '/conversaciones/:id/marcar-leida',
  auth,
  authorizeRole(['apoderado', 'docente']),
  logAccess('mensajes', 'marcar_leida'),
  markConversationReadController
);

// PATCH /conversaciones/:id/cerrar
router.patch(
  '/conversaciones/:id/cerrar',
  auth,
  authorizeRole(['apoderado', 'docente']),
  logAccess('mensajes', 'cerrar_conversacion'),
  closeConversationController
);

// HU-MSG-01 — Enviar Nuevo Mensaje (Padre)

// GET /conversaciones/existe
router.get(
  '/conversaciones/existe',
  auth,
  authorizeRole(['apoderado']),
  logAccess('mensajes', 'verificar_existencia'),
  checkConversationExistsController
);

// POST /conversaciones (multipart/form-data)
router.post(
  '/conversaciones',
  auth,
  authorizeRole(['apoderado']),
  messagingCreateLimiter,
  uploadMessagingAttachments,
  logAccess('mensajes', 'crear_conversacion'),
  createConversationController
);

/**
 * HU-MSG-03 — Ver Conversación y Continuar Chat
 */

// GET /conversaciones/:id
router.get(
  '/conversaciones/:id',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  logAccess('mensajes', 'ver_conversacion'),
  getConversationByIdController
);

// GET /mensajes?conversacion_id=&limit=&offset=&orden=
router.get(
  '/mensajes',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  logAccess('mensajes', 'listar_mensajes'),
  getMessagesController
);

// POST /mensajes (multipart/form-data)
router.post(
  '/mensajes',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingSendLimiter,
  uploadMessagingAttachments,
  logAccess('mensajes', 'enviar_mensaje'),
  sendMessageController
);

// PATCH /mensajes/marcar-leidos
router.patch(
  '/mensajes/marcar-leidos',
  auth,
  authorizeRole(['apoderado', 'docente']),
  logAccess('mensajes', 'marcar_mensajes_leidos'),
  markMessagesBatchReadController
);

// GET /mensajes/nuevos?conversacion_id=&ultimo_mensaje_id=
router.get(
  '/mensajes/nuevos',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  logAccess('mensajes', 'verificar_nuevos'),
  getNewMessagesController
);

// GET /archivos/:id/download
router.get(
  '/archivos/:id/download',
  auth,
  authorizeRole(['apoderado', 'docente']),
  logAccess('mensajes', 'descargar_archivo'),
  downloadAttachmentController
);

module.exports = router;