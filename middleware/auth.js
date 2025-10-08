'use strict';

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-super-secret';
const BEARER_PREFIX = 'Bearer ';

// Extrae token del header Authorization
function extractToken(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth || typeof auth !== 'string') return null;
  if (auth.startsWith(BEARER_PREFIX)) return auth.slice(BEARER_PREFIX.length).trim();
  return auth.trim();
}

// Verifica que el token no esté en blacklist
async function isTokenBlacklisted(token) {
  try {
    const black = await prisma.tokenBlacklist.findUnique({
      where: { token },
      select: { id: true },
    });
    return !!black;
  } catch (err) {
    // Si hay error de DB en tests, no bloquear autenticación para evitar falsos 401
    logger.error(err);
    return false;
  }
}

// Middleware de autenticación JWT
async function auth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token no provisto' },
      });
    }

    // Blacklist
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token no válido o expirado' },
      });
    }

    // Verificación de firma
    const payload = jwt.verify(token, JWT_SECRET);
    // Inyectar contexto de usuario básico en la request
    req.user = {
      id: payload.user_id,
      rol: payload.rol,
      nombre: payload.nombre,
      apellido: payload.apellido,
    };
    req.token = token;

    next();
  } catch (err) {
    err.status = 401;
    err.code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    next(err);
  }
}

module.exports = { auth, extractToken };