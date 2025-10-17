'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Middleware para registrar eventos de autenticación (login, logout)
 * @param {string} tipo_evento - 'login_exitoso', 'login_fallido', 'logout'
 * @returns {Function} Middleware
 */
function logAuthEvent(tipo_evento) {
  return async (req, res, next) => {
    try {
      // Solo registrar si la tabla existe (verificar en desarrollo)
      const tableExists = await checkTableExists('auth_logs');
      if (!tableExists) {
        logger.warn('Tabla auth_logs no existe. Evento de autenticación no registrado.');
        return next();
      }

      const usuario_id = req.user?.id || null;
      const detalles = {
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        method: req.method,
        path: req.path
      };

      // Si es login fallido, capturar información adicional
      if (tipo_evento === 'login_fallido' && req.body) {
        detalles.documento = req.body.nro_documento || null;
        detalles.tipo_documento = req.body.tipo_documento || null;
      }

      await prisma.$executeRaw`
        INSERT INTO auth_logs (usuario_id, tipo_evento, timestamp, detalles)
        VALUES (${usuario_id}, ${tipo_evento}, NOW(), ${JSON.stringify(detalles)}::jsonb)
      `;

      logger.debug(`Evento de autenticación registrado: ${tipo_evento}`);
    } catch (error) {
      // No interrumpir el flujo si falla el logging
      logger.error(`Error al registrar evento de autenticación: ${error.message}`);
    }
    next();
  };
}

/**
 * Middleware para registrar accesos a módulos del sistema
 * @param {string} modulo - 'calificaciones', 'asistencia', 'mensajes', etc.
 * @param {string} accion - 'consulta', 'listado', 'detalle', etc.
 * @returns {Function} Middleware
 */
function logAccess(modulo, accion) {
  return async (req, res, next) => {
    // Capturar tiempo de inicio para calcular duración
    const startTime = Date.now();
    
    // Almacenar la función original de res.json
    const originalJson = res.json;
    
    // Sobrescribir res.json para capturar cuando finaliza la respuesta
    res.json = function(data) {
      const endTime = Date.now();
      const duracion_ms = endTime - startTime;
      
      // Restaurar el método original
      res.json = originalJson;
      
      // Registrar el acceso de forma asíncrona (no bloquear respuesta)
      logAccessAsync(req, modulo, accion, duracion_ms, data)
        .catch(err => logger.error(`Error al registrar acceso: ${err.message}`));
      
      // Continuar con la respuesta normal
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Función asíncrona para registrar acceso en la base de datos
 */
async function logAccessAsync(req, modulo, accion, duracion_ms, responseData) {
  try {
    // Solo registrar si la tabla existe (verificar en desarrollo)
    const tableExists = await checkTableExists('access_logs');
    if (!tableExists) {
      logger.warn('Tabla access_logs no existe. Acceso no registrado.');
      return;
    }

    const usuario_id = req.user?.id || null;
    const rol = req.user?.rol || null;
    
    // Extraer estudiante_id de los parámetros o query
    let estudiante_id = null;
    if (req.params?.estudiante_id) {
      estudiante_id = parseInt(req.params.estudiante_id, 10) || null;
    } else if (req.query?.estudiante_id) {
      estudiante_id = parseInt(req.query.estudiante_id, 10) || null;
    }
    
    // Capturar detalles relevantes de la petición
    const detalles = {
      method: req.method,
      path: req.path,
      query: req.query || {},
      params: req.params || {},
      status: responseData?.success ? 'success' : 'error'
    };

    await prisma.$executeRaw`
      INSERT INTO access_logs (
        usuario_id, rol, modulo, accion, estudiante_id, 
        timestamp, duracion_ms, detalles
      )
      VALUES (
        ${usuario_id}, ${rol}, ${modulo}, ${accion}, ${estudiante_id}, 
        NOW(), ${duracion_ms}, ${JSON.stringify(detalles)}::jsonb
      )
    `;

    logger.debug(`Acceso registrado: ${modulo}/${accion}`);
  } catch (error) {
    logger.error(`Error al registrar acceso: ${error.message}`);
  }
}

/**
 * Verifica si una tabla existe en la base de datos
 * @param {string} tableName - Nombre de la tabla
 * @returns {Promise<boolean>} - true si la tabla existe
 */
async function checkTableExists(tableName) {
  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      );
    `;
    return result[0].exists;
  } catch (error) {
    logger.error(`Error al verificar existencia de tabla ${tableName}: ${error.message}`);
    return false;
  }
}

module.exports = {
  logAuthEvent,
  logAccess
};