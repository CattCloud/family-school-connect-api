'use strict';

const { z } = require('zod');
const { getChildrenForParent } = require('../services/usersService');

// GET /usuarios/hijos
async function getChildrenController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }
    // Rol requerido: apoderado
    if (user.rol !== 'apoderado' && user.rol !== 'administrador') {
      const e = new Error('Solo apoderados pueden acceder a sus hijos');
      e.status = 403;
      e.code = 'ACCESS_DENIED';
      throw e;
    }

    const data = await getChildrenForParent(user);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getChildrenController,
};