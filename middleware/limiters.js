'use strict';

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// Helper: clave por usuario autenticado o IP (fallback)
function userOrIpKey(req) {
  return (req && req.user && req.user.id) || ipKeyGenerator(req);
}

function msg(code, message) {
  return {
    success: false,
    error: { code, message },
  };
}

// 50 mensajes por minuto para envío WhatsApp de credenciales (admin)
const adminWhatsAppLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Límite de envíos por minuto alcanzado'),
});

// Centro de Plantillas: generación (por usuario/IP)
const templatesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Límite de generación de plantillas alcanzado. Intente en 1 minuto'),
});

// Calificaciones: validar archivo
const gradesValidateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Demasiadas validaciones de calificaciones en 10 minutos'),
});

// Calificaciones: cargar
const gradesLoadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Demasiadas cargas de calificaciones en 10 minutos'),
});

// Asistencias: validar archivo
const attendanceValidateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Demasiadas validaciones de asistencias en 10 minutos'),
});

// Asistencias: cargar
const attendanceLoadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Demasiadas cargas de asistencias en 10 minutos'),
});

// Lectura de calificaciones/asistencias para padres (visualización)
// 60 requests por minuto por usuario/IP
const parentsReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Límite de consultas alcanzado. Intente en 1 minuto'),
});

module.exports = {
  adminWhatsAppLimiter,
  templatesLimiter,
  gradesValidateLimiter,
  gradesLoadLimiter,
  attendanceValidateLimiter,
  attendanceLoadLimiter,
  parentsReadLimiter,
};