'use strict';

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// Límite por IP para login: 5 intentos en 15 minutos
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'USER_LOCKED',
      message: 'Usuario bloqueado temporalmente. Intente en 15 minutos',
    },
  },
  keyGenerator: ipKeyGenerator,
});

// Límite por usuario/día para forgot-password: 3 intentos
// Implementación in-memory para MVP (reinicia al levantar servidor)
const forgotCounters = new Map();
let lastReset = Date.now();

function resetDailyIfNeeded() {
  const now = new Date();
  const last = new Date(lastReset);
  if (
    now.getUTCFullYear() !== last.getUTCFullYear() ||
    now.getUTCMonth() !== last.getUTCMonth() ||
    now.getUTCDate() !== last.getUTCDate()
  ) {
    forgotCounters.clear();
    lastReset = Date.now();
  }
}

function forgotPasswordRateLimiter(req, res, next) {
  resetDailyIfNeeded();

  // Intentamos identificar usuario por documento; si no hay datos, usar IP
  const { tipo_documento, nro_documento } = req.body || {};
  const key =
    (tipo_documento && nro_documento && `${tipo_documento}:${nro_documento}`) ||
    `ip:${ipKeyGenerator(req)}`;

  const count = forgotCounters.get(key) || 0;

  if (count >= 3) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Máximo 3 solicitudes por día. Intente mañana',
      },
    });
  }

  forgotCounters.set(key, count + 1);
  next();
}

// Límite para reset-password: 5 intentos por token en 1 hora (in-memory MVP)
const resetTokenCounters = new Map();

function resetPasswordRateLimiter(req, res, next) {
  const { token } = req.body || {};
  if (!token) return next();

  const now = Date.now();
  const info = resetTokenCounters.get(token) || { count: 0, first: now };

  // Expira a la hora
  if (now - info.first > 60 * 60 * 1000) {
    info.count = 0;
    info.first = now;
  }

  if (info.count >= 5) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiados intentos de restablecimiento. Intente más tarde',
      },
    });
  }

  info.count += 1;
  resetTokenCounters.set(token, info);
  next();
}

module.exports = {
  loginRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
};