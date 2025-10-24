'use strict';

/**
 * Envía una respuesta de éxito estandarizada
 * @param {Object} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {Object} data - Datos a incluir en la respuesta
 * @param {string} message - Mensaje opcional
 * @returns {Object} Respuesta JSON
 */
const successResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error estandarizada
 * @param {Object} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} code - Código de error específico
 * @param {string} message - Mensaje de error
 * @param {Object} details - Detalles adicionales del error (opcional)
 * @returns {Object} Respuesta JSON
 */
const errorResponse = (res, statusCode, code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

// Funciones de respuesta simplificadas para servicios y controladores
const success = (data, message = null) => ({
  success: true,
  data,
  ...(message && { message })
});

const error = (message, code = 'INTERNAL_ERROR', details = null) => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details })
  }
});

const badRequest = (message, details = null) => ({
  success: false,
  error: {
    code: 'BAD_REQUEST',
    message,
    ...(details && { details })
  }
});

const notFound = (message, details = null) => ({
  success: false,
  error: {
    code: 'NOT_FOUND',
    message,
    ...(details && { details })
  }
});

const conflict = (message, details = null) => ({
  success: false,
  error: {
    code: 'CONFLICT',
    message,
    ...(details && { details })
  }
});

module.exports = {
  successResponse,
  errorResponse,
  success,
  error,
  badRequest,
  notFound,
  conflict
};