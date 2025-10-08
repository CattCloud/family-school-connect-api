'use strict';

const logger = require('../utils/logger');

/**
 * validateMutuallyExclusive
 * Fabrica de middleware para validar que ciertos query params sean mutuamente excluyentes.
 * Ejemplo de uso:
 *   router.get('/asistencias/estudiante/:estudiante_id',
 *     auth, validateParentAccess, validateMutuallyExclusive(['mes','trimestre']), controller.getAttendance)
 *
 * Comportamiento:
 * - Si más de uno de los parámetros está presente, responde 400 INVALID_PARAMETERS
 * - Si ninguno está presente, no falla; el controlador decidirá defaults (p. ej. mes actual)
 */
function validateMutuallyExclusive(params = []) {
  if (!Array.isArray(params) || params.length < 2) {
    throw new Error('validateMutuallyExclusive requiere al menos 2 parámetros');
  }

  return function validateMutuallyExclusiveMiddleware(req, res, next) {
    try {
      const presentParams = params.filter((p) => {
        const v = req.query?.[p];
        return v !== undefined && v !== null && String(v).trim() !== '';
      });

      if (presentParams.length > 1) {
        const joined = presentParams.join("' y '");
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: `No puede especificar '${joined}' simultáneamente. Use solo uno.`,
          },
        });
      }

      return next();
    } catch (err) {
      logger.error('[validateMutuallyExclusive] error', { err });
      return next(err);
    }
  };
}

module.exports = { validateMutuallyExclusive };