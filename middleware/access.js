'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * validateParentAccess
 * Verifica que el usuario autenticado (apoderado) tenga relación activa con el estudiante solicitado.
 * Reglas:
 *  - 401 INVALID_TOKEN si no hay usuario en req.user
 *  - 400 INVALID_PARAMETERS si falta estudiante_id
 *  - 404 STUDENT_NOT_FOUND si el estudiante no existe
 *  - 403 ACCESS_DENIED si no existe relación activa apoderado-estudiante
 *  - Permitimos override de administrador (útil para soporte/auditoría)
 */
async function validateParentAccess(req, res, next) {
  try {
    const estudianteId = req.params?.estudiante_id || req.params?.id || null;
    const user = req.user || null;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Usuario no autenticado' },
      });
    }

    // Override administrador opcional (útil en diagnósticos)
    const allowAdminOverride = true;
    if (allowAdminOverride && user.rol === 'administrador') {
      logger.info('[ACCESS] override admin for parent access', {
        user_id: user.id,
        route: req.originalUrl,
      });
      return next();
    }

    if (!estudianteId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Parámetro estudiante_id requerido en la ruta',
        },
      });
    }

    // Verificar existencia del estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { id: true, estado_matricula: true },
    });

    if (!estudiante) {
      return res.status(404).json({
        success: false,
        error: { code: 'STUDENT_NOT_FOUND', message: 'Estudiante no existe' },
      });
    }

    // Verificar relación apoderado-estudiante activa
    const relacion = await prisma.relacionesFamiliares.findFirst({
      where: {
        apoderado_id: user.id,
        estudiante_id: estudianteId,
        estado_activo: true,
      },
      select: { id: true },
    });

    if (!relacion) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'No tiene permisos para ver los datos de este estudiante',
        },
      });
    }

    // Inyectar en contexto si fuera útil para etapas siguientes
    req.context = req.context || {};
    req.context.estudiante_id = estudianteId;

    return next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
}

module.exports = { validateParentAccess };