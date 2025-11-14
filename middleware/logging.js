'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Toggle para habilitar/deshabilitar escrituras a BD desde middleware.
// Por defecto deshabilitado para evitar conflictos con la simulación.
// Habilitar solo si se requiere logging en runtime:
// ENABLE_RUNTIME_DB_LOGGING=true
const ENABLE_RUNTIME_DB_LOGGING = process.env.ENABLE_RUNTIME_DB_LOGGING === 'true';

/**
 * Middleware para registrar eventos de autenticación (login, logout)
 * @param {string} tipo_evento - 'login_exitoso', 'login_fallido', 'logout'
 * @returns {Function} Middleware
 */
function logAuthEvent(tipo_evento) {
  return async (req, res, next) => {
    // Respetar bandera de desactivación por defecto
    if (!ENABLE_RUNTIME_DB_LOGGING) {
      return next();
    }
    try {
      // Solo registrar si la tabla existe (verificar en desarrollo)
      const tableExists = await checkTableExists('auth_logs');
      if (!tableExists) {
        logger.warn('Tabla auth_logs no existe. Evento de autenticación no registrado.');
        return next();
      }

      const usuario_id = req.user?.id || null;
      const ip_address = req.ip;
      const user_agent = req.headers['user-agent'] || null;

      // Intentar uso de esquema nuevo (evento/exito/ip/user_agent)
      // Si falla, caerá al catch y no interrumpe el flujo
      await prisma.$executeRaw`
        INSERT INTO auth_logs (usuario_id, evento, exito, timestamp, ip_address, user_agent, session_id, año_academico)
        VALUES (
          ${usuario_id}::uuid,
          ${tipo_evento === 'login_fallido' ? 'intento_fallido' : (tipo_evento === 'logout' ? 'logout' : 'login')},
          ${tipo_evento === 'login_fallido' ? false : true},
          NOW(),
          ${ip_address},
          ${user_agent},
          NULL,
          2025
        )
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
    // Respetar bandera de desactivación por defecto
    if (!ENABLE_RUNTIME_DB_LOGGING) {
      return next();
    }

    // Capturar tiempo de inicio para calcular duración
    const startTime = Date.now();

    // Almacenar la función original de res.json
    const originalJson = res.json;

    // Sobrescribir res.json para capturar cuando finaliza la respuesta
    res.json = function(data) {
      const endTime = Date.now();
      const duracion_s = Math.max(0, Math.round((endTime - startTime) / 1000)); // segundos

      // Restaurar el método original
      res.json = originalJson;

      // Registrar el acceso de forma asíncrona (no bloquear respuesta)
      logAccessAsync(req, modulo, accion, duracion_s, data)
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
async function logAccessAsync(req, modulo, accion, duracion_s, responseData) {
  // Respetar bandera de desactivación por defecto
  if (!ENABLE_RUNTIME_DB_LOGGING) return;

  try {
    // Solo registrar si la tabla existe (verificar en desarrollo)
    const tableExists = await checkTableExists('access_logs');
    if (!tableExists) {
      logger.warn('Tabla access_logs no existe. Acceso no registrado.');
      return;
    }

    const usuario_id = req.user?.id || null;
    const rol = req.user?.rol || null;

    // Extraer identificadores opcionales
    let estudiante_id = null;
    if (req.params?.estudiante_id) {
      estudiante_id = req.params.estudiante_id;
    } else if (req.query?.estudiante_id) {
      estudiante_id = req.query.estudiante_id;
    }

    // No tenemos session_id de runtime; para esquema nuevo es NOT NULL.
    // Generamos uno efímero para trazar coherencia básica si se habilita el middleware.
    const session_id = await prisma.$queryRaw`SELECT gen_random_uuid() as sid`;
    const sid = session_id[0]?.sid || null;

    // Capturar detalles opcionales para url
    const url_visitada = req.originalUrl || req.path || null;

    await prisma.$executeRaw`
      INSERT INTO access_logs (
        usuario_id, session_id, modulo, estudiante_id, curso_id,
        timestamp, duracion_sesion, url_visitada, año_academico
      )
      VALUES (
        ${usuario_id}::uuid, ${sid}::uuid, ${modulo},
        ${estudiante_id ? estudiante_id : null}::uuid,
        NULL,
        NOW(), ${duracion_s}, ${url_visitada}, 2025
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