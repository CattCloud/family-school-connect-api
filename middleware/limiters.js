'use strict';

const rateLimit = require('express-rate-limit');


// 50 mensajes por minuto para envío WhatsApp de credenciales
const adminWhatsAppLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Límite de envíos por minuto alcanzado',
    },
  },
});

module.exports = {
  adminWhatsAppLimiter,
};