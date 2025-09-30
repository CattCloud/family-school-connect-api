'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-super-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateJWT(user) {
  const payload = {
    user_id: user.id,
    rol: user.rol,
    nombre: user.nombre,
    apellido: user.apellido,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return token;
}

function decode(token) {
  try {
    return jwt.decode(token, { complete: true });
  } catch {
    return null;
  }
}

module.exports = { generateJWT, decode };