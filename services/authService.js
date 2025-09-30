'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const { generateJWT } = require('../utils/jwt');
const { sendResetPasswordMessage } = require('./whatsappService');

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

function httpError(status, code, message) {
  const err = new Error(message || code);
  err.status = status;
  err.code = code;
  return err;
}

/**
 * Autentica usuario por documento y password
 * - Valida estado_activo
 * - Compara password (bcrypt)
 * - Devuelve objeto user (sin password_hash)
 */
async function authenticateUser(tipo_documento, nro_documento, password) {
  const user = await prisma.usuario.findFirst({
    where: {
      tipo_documento,
      nro_documento,
    },
  });

  if (!user) {
    throw httpError(401, 'INVALID_CREDENTIALS', 'Documento o contraseña incorrectos');
  }

  if (!user.estado_activo) {
    throw httpError(403, 'USER_INACTIVE', 'Usuario desactivado. Contacte al administrador');
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw httpError(401, 'INVALID_CREDENTIALS', 'Documento o contraseña incorrectos');
  }

  return sanitizeUser(user);
}

/**
 * Genera JWT con expiración configurada
 */
function generateJWTForUser(user) {
  return generateJWT(user);
}

/**
 * Actualiza fecha_ultimo_login
 */
async function updateLastLogin(userId) {
  await prisma.usuario.update({
    where: { id: userId },
    data: { fecha_ultimo_login: new Date() },
  });
}

/**
 * Invalida cualquier reset token previo y genera uno nuevo
 */
async function generateResetToken(userId) {
  await prisma.passwordResetToken.updateMany({
    where: { id_usuario: userId, usado: false },
    data: { usado: true },
  });

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      token,
      id_usuario: userId,
      fecha_expiracion: expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Valida un token temporal de reset:
 * - Debe existir
 * - No estar usado
 * - No estar expirado
 * Devuelve { tokenRow, user }
 */
async function validateResetToken(token) {
  const tokenRow = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { usuario: true },
  });

  if (!tokenRow || tokenRow.usado) {
    throw httpError(400, 'INVALID_TOKEN', 'El enlace ha expirado. Solicita uno nuevo');
  }

  if (new Date(tokenRow.fecha_expiracion).getTime() < Date.now()) {
    throw httpError(400, 'INVALID_TOKEN', 'El enlace ha expirado. Solicita uno nuevo');
  }

  return { tokenRow, user: tokenRow.usuario };
}

/**
 * Envía enlace de restablecimiento por WhatsApp (no-op si no hay credenciales)
 */
async function sendWhatsAppResetLink(phone, token) {
  const baseAppUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
  return sendResetPasswordMessage(phone, token, baseAppUrl);
}

/**
 * Cambia password del usuario (validando que sea diferente)
 */
async function changePassword(userId, newPassword) {
  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

  const same = await bcrypt.compare(newPassword, user.password_hash);
  if (same) {
    throw httpError(400, 'PASSWORD_REUSE', 'La nueva contraseña no puede ser igual a la actual');
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.usuario.update({
    where: { id: userId },
    data: { password_hash: hash },
  });
}

/**
 * Cambia password requerido (docentes) validando current
 */
async function changeRequiredPassword(userId, currentPassword, newPassword) {
  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user) throw httpError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

  if (!user.debe_cambiar_password) {
    throw httpError(403, 'CHANGE_NOT_REQUIRED', 'No es necesario cambiar la contraseña');
  }

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) {
    throw httpError(400, 'CURRENT_PASSWORD_INCORRECT', 'La contraseña actual es incorrecta');
  }

  const same = await bcrypt.compare(newPassword, user.password_hash);
  if (same) {
    throw httpError(400, 'PASSWORD_REUSE', 'La nueva contraseña no puede ser igual a la actual');
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.usuario.update({
    where: { id: userId },
    data: {
      password_hash: hash,
      debe_cambiar_password: false,
    },
  });
}

/**
 * Agrega JWT a blacklist (logout)
 */
async function blacklistToken(token, userId) {
  try {
    await prisma.tokenBlacklist.create({
      data: {
        token,
        usuario_id: userId || null,
      },
    });
  } catch (err) {
    // Si el token ya existe, ignorar (idempotencia)
    logger.warn('Token ya en blacklist o error al insertar', { error: err.code });
  }
}

function sanitizeUser(user) {
  // quita hash antes de devolver
  const { password_hash, ...rest } = user;
  return rest;
}

module.exports = {
  authenticateUser,
  generateJWT: generateJWTForUser,
  generateResetToken,
  validateResetToken,
  sendWhatsAppResetLink,
  updateLastLogin,
  changePassword,
  changeRequiredPassword,
  blacklistToken,
  sanitizeUser,
};