'use strict';

const logger = require('../utils/logger');

function authorizeRole(allowedRoles = [], options = {}) {
  const { allowAdminOverride = true } = options;

  return (req, res, next) => {
    const required = `[${allowedRoles.join(', ')}]`;
    const userRole = req.user?.rol;

    logger.info('[AUTH] check', {
      route: req.originalUrl,
      required_roles: required,
      user_role: userRole,
    });

    if (!userRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'No tiene permisos para acceder a este recurso',
        },
      });
    }

    // Permite que un administrador pase cualquier verificación de rol (override),
    // útil para tareas de soporte/auditoría. Se puede desactivar con { allowAdminOverride: false }.
    if (allowAdminOverride && userRole === 'administrador') {
      logger.info('[AUTH] override admin allowed', { route: req.originalUrl });
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      logger.warn('[AUTH] denied', {
        route: req.originalUrl,
        required_roles: required,
        user_role: userRole,
      });
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'No tiene permisos para acceder a este recurso',
        },
      });
    }

    logger.info('[AUTH] allowed', { route: req.originalUrl, user_role: userRole });
    next();
  };
}

module.exports = { authorizeRole };