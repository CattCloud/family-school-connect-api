'use strict';

function authorizeRole(allowedRoles = []) {
  return (req, res, next) => {
    console.log(`[AUTH] Ruta ${req.originalUrl}. Roles requeridos: [${allowedRoles.join(', ')}]`);

    const userRole = req.user?.rol;
    console.log(`[AUTH] Rol del usuario actual: ${userRole}`);

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log(`[AUTH] ACCESO DENEGADO (403). Causa: Rol ${userRole} no está en la lista.`);

      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'No tiene permisos para acceder a este recurso',
        },
      });
    }

    console.log(`[AUTH] ACCESO PERMITIDO (200). Rol: ${userRole}`);
    next();
  };
}

module.exports = { authorizeRole };