'use strict';

const fsp = require('fs/promises');
const path = require('path');

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const BASE_DIR = process.env.VALIDATIONS_DIR || path.join(process.cwd(), 'tmp', 'validations');

function now() {
  return Date.now();
}

async function ensureDir() {
  await fsp.mkdir(BASE_DIR, { recursive: true });
}

function expiresAt(ttlMs) {
  const ttl = Number.isFinite(ttlMs) ? ttlMs : DEFAULT_TTL_MS;
  return new Date(now() + ttl).toISOString();
}

function buildPaths(id) {
  const base = path.join(BASE_DIR, id);
  return {
    metaPath: `${base}.json`,
  };
}

/**
 * Guarda una validación (payload) con TTL
 * @param {string} id - validacion_id (ej: val_cal_173...)
 * @param {object} payload - Datos a persistir (contexto, registros_validos, etc.)
 * @param {object} options - { ttlMs?: number }
 * @returns {Promise<{id: string, expires_at: string}>}
 */
async function saveValidation(id, payload, options = {}) {
  if (!id) {
    throw new Error('id requerido para saveValidation');
  }
  await ensureDir();

  const { metaPath } = buildPaths(id);
  const meta = {
    id,
    created_at: new Date().toISOString(),
    expires_at: expiresAt(options.ttlMs),
    payload,
  };

  await fsp.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  return { id, expires_at: meta.expires_at };
}

/**
 * Lee una validación, respetando expiración
 * @param {string} id
 * @returns {Promise<object|null>} payload o null si no existe/expirado
 */
async function readValidation(id) {
  if (!id) return null;
  const { metaPath } = buildPaths(id);
  try {
    const raw = await fsp.readFile(metaPath, 'utf8');
    const meta = JSON.parse(raw);

    if (meta.expires_at && new Date(meta.expires_at).getTime() < now()) {
      await deleteValidation(id).catch(() => {});
      return null;
    }
    return meta.payload;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Elimina una validación de disco
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function deleteValidation(id) {
  const { metaPath } = buildPaths(id);
  try {
    await fsp.unlink(metaPath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

/**
 * Limpia validaciones expiradas
 * @returns {Promise<{removed: number}>}
 */
async function cleanupExpired() {
  await ensureDir();
  const files = await fsp.readdir(BASE_DIR);
  let removed = 0;
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    try {
      const metaPath = path.join(BASE_DIR, f);
      const raw = await fsp.readFile(metaPath, 'utf8');
      const meta = JSON.parse(raw);
      if (meta.expires_at && new Date(meta.expires_at).getTime() < now()) {
        await fsp.unlink(metaPath).catch(() => {});
        removed++;
      }
    } catch {
      // ignorar archivos corruptos
    }
  }
  return { removed };
}

module.exports = {
  DEFAULT_TTL_MS,
  BASE_DIR,
  saveValidation,
  readValidation,
  deleteValidation,
  cleanupExpired,
};