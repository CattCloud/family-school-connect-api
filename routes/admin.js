'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { adminWhatsAppLimiter } = require('../middleware/limiters');

const {
  getTemplateController,
  validateImportController,
  executeImportController,
  validateRelationshipsController,
  createRelationshipsController,
  verifyRelationshipsController,
  generateCredentialsController,
  sendCredentialsWhatsAppController,
  // HU-USERS-06 (v2)
  generateCredentialsV2Controller,
  downloadCredentialsController,
  sendCredentialsWhatsAppV2Controller,
  generatePdfsController,
} = require('../controllers/adminImportController');

const router = Router();

// Templates
router.get(
  '/admin/templates/:tipo',
  auth,
  authorizeRole(['administrador']),
  getTemplateController
);

// Validación y ejecución (limitado)
router.post(
  '/admin/import/validate',
  auth,
  authorizeRole(['administrador']),
  validateImportController
);

router.post(
  '/admin/import/execute',
  auth,
  authorizeRole(['administrador']),
  executeImportController
);

// Relaciones familiares
router.post(
  '/admin/import/validate-relationships',
  auth,
  authorizeRole(['administrador']),
  validateRelationshipsController
);

router.post(
  '/admin/import/create-relationships',
  auth,
  authorizeRole(['administrador']),
  createRelationshipsController
);

router.get(
  '/admin/verify/relationships',
  auth,
  authorizeRole(['administrador']),
  verifyRelationshipsController
);

// Credenciales (simulado en pruebas)
router.post(
 '/admin/import/credentials/generate',
 auth,
 authorizeRole(['administrador']),
 generateCredentialsController
);

router.post(
 '/admin/import/credentials/send-whatsapp',
 auth,
 authorizeRole(['administrador']),
 adminWhatsAppLimiter,
 sendCredentialsWhatsAppController
);

// Gestión de Credenciales v2 (según DocumentacionAPI.md - Sección 4)
router.post(
 '/admin/import/generate-credentials',
 auth,
 authorizeRole(['administrador']),
 generateCredentialsV2Controller
);

router.get(
 '/admin/import/credentials/:credentials_id/download',
 auth,
 authorizeRole(['administrador']),
 downloadCredentialsController
);

router.post(
 '/admin/import/credentials/:credentials_id/send-whatsapp',
 auth,
 authorizeRole(['administrador']),
 adminWhatsAppLimiter,
 sendCredentialsWhatsAppV2Controller
);

router.post(
 '/admin/import/credentials/:credentials_id/generate-pdfs',
 auth,
 authorizeRole(['administrador']),
 generatePdfsController
);

module.exports = router;