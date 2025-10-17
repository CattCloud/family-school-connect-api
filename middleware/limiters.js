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

 // Bandeja de mensajería (padres/docentes): lectura/polling
const messagingReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Límite de consultas de mensajería alcanzado. Intente en 1 minuto'),
});

// Mensajería: creación/envío (padres) - 20 solicitudes por 15 min
const messagingCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Límite de envíos de mensajes alcanzado. Intente más tarde'),
});

// Mensajería: envío en conversación (padres/docentes) - 60 por minuto
const messagingSendLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Límite de envío de mensajes alcanzado. Intente en 1 minuto'),
});

// Comunicados: creación/publicación - 10 solicitudes por 15 minutos
const comunicadosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: msg('RATE_LIMIT_EXCEEDED', 'Límite de creación de comunicados alcanzado. Intente más tarde'),
});

module.exports = {
  adminWhatsAppLimiter,
  templatesLimiter,
  gradesValidateLimiter,
  gradesLoadLimiter,
  attendanceValidateLimiter,
  attendanceLoadLimiter,
  parentsReadLimiter,
  messagingReadLimiter,
  messagingCreateLimiter,
  messagingSendLimiter,
  comunicadosLimiter,
};