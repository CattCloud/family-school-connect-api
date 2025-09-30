'use strict';

const logger = require('../utils/logger');

function normalizeError(err) {
  // Estructura estándar
  const status = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Error interno del servidor';

  // Manejo de errores de validación (Zod)
  if (err.name === 'ZodError') {
    return {
      status: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          details: err.issues?.map((i) => ({
            path: i.path?.join('.') || '',
            message: i.message,
          })),
        },
      },
    };
  }

  // Prisma errores comunes
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    return {
      status: 400,
      body: {
        success: false,
        error: {
          code: `PRISMA_${err.code}`,
          message,
        },
      },
    };
  }

  return {
    status,
    body: {
      success: false,
      error: { code, message },
    },
  };
}

// Error handler centralizado
// Formato: {"success": false, "error": {"code": "", "message": ""}}
/* eslint-disable no-unused-vars */
function errorHandler(err, _req, res, _next) {
  // Log detallado
  logger.error(err);

  const { status, body } = normalizeError(err);
  res.status(status).json(body);
}
/* eslint-enable no-unused-vars */

module.exports = { errorHandler };