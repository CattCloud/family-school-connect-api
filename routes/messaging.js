'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { messagingReadLimiter, messagingCreateLimiter, messagingSendLimiter } = require('../middleware/limiters');
const { uploadMessagingAttachments } = require('../middleware/upload');

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
  getConversationsController
);

// GET /conversaciones/no-leidas/count
router.get(
  '/conversaciones/no-leidas/count',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  getUnreadCountController
);

// GET /conversaciones/actualizaciones?ultimo_check=ISO
router.get(
  '/conversaciones/actualizaciones',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  getConversationsUpdatesController
);

// PATCH /conversaciones/:id/marcar-leida
router.patch(
  '/conversaciones/:id/marcar-leida',
  auth,
  authorizeRole(['apoderado', 'docente']),
  markConversationReadController
);

// PATCH /conversaciones/:id/cerrar
router.patch(
  '/conversaciones/:id/cerrar',
  auth,
  authorizeRole(['apoderado', 'docente']),
  closeConversationController
);

// HU-MSG-01 — Enviar Nuevo Mensaje (Padre)

// GET /conversaciones/existe
router.get(
  '/conversaciones/existe',
  auth,
  authorizeRole(['apoderado']),
  checkConversationExistsController
);

// POST /conversaciones (multipart/form-data)
router.post(
  '/conversaciones',
  auth,
  authorizeRole(['apoderado']),
  messagingCreateLimiter,
  uploadMessagingAttachments,
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
  getConversationByIdController
);

// GET /mensajes?conversacion_id=&limit=&offset=&orden=
router.get(
  '/mensajes',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  getMessagesController
);

// POST /mensajes (multipart/form-data)
router.post(
  '/mensajes',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingSendLimiter,
  uploadMessagingAttachments,
  sendMessageController
);

// PATCH /mensajes/marcar-leidos
router.patch(
  '/mensajes/marcar-leidos',
  auth,
  authorizeRole(['apoderado', 'docente']),
  markMessagesBatchReadController
);

// GET /mensajes/nuevos?conversacion_id=&ultimo_mensaje_id=
router.get(
  '/mensajes/nuevos',
  auth,
  authorizeRole(['apoderado', 'docente']),
  messagingReadLimiter,
  getNewMessagesController
);

// GET /archivos/:id/download
router.get(
  '/archivos/:id/download',
  auth,
  authorizeRole(['apoderado', 'docente']),
  downloadAttachmentController
);

module.exports = router;