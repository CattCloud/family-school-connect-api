'use strict';

/**
 * Servicio de Reportes (TXT/PDF/Buffer) con retención
 * - Guarda archivos en disco bajo un directorio configurable (por defecto: ./tmp/reports)
 * - Mantiene metadatos (JSON) por archivo: mime, filename sugerido, expiración
 * - Funciones de guardado, lectura, borrado y limpieza de expirados
 *
 * NOTAS:
 * - MVP: no hay scheduler; la limpieza se puede invocar on-demand (por endpoints o cron externo).
 * - Integración futura: controllers de calificaciones/asistencias pueden usar saveTextReport()
 *   para emitir un validacion_id/report_id y luego exponer GET de descarga via readReport().
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const REPORTS_DIR = process.env.REPORTS_DIR || path.join(process.cwd(), 'tmp', 'reports');
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function now() {
  return Date.now();
}

function expiresAtFrom(ttlMs) {
  const ttl = Number.isFinite(ttlMs) ? ttlMs : DEFAULT_TTL_MS;
  return new Date(now() + ttl).toISOString();
}

function httpError(code, message, status = 400) {
  const e = new Error(message || code);
  e.code = code;
  e.status = status;
  return e;
}

async function ensureDir() {
  await fsp.mkdir(REPORTS_DIR, { recursive: true });
}

function buildPaths(reportId) {
  const base = path.join(REPORTS_DIR, reportId);
  return {
    base,
    dataPath: `${base}.bin`,
    metaPath: `${base}.json`,
  };
}

/**
 * Guarda un reporte (buffer) con metadatos y retención.
 * @param {Buffer} buffer
 * @param {Object} options
 *  - mime (string)
 *  - filename (string sugerido de descarga)
 *  - ttlMs (number) - opcional
 *  - kind (string) - opcional, ej: 'calificaciones' | 'asistencias'
 *  - extra (object) - libre (se guardará en metadatos)
 * @returns {Promise<{report_id, filename, mime, size, expires_at}>}
 */
async function saveBufferReport(buffer, options = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw httpError('INVALID_INPUT', 'Buffer requerido', 400);
  }
  await ensureDir();

  const report_id = crypto.randomUUID();
  const { dataPath, metaPath } = buildPaths(report_id);
  const mime = options.mime || 'application/octet-stream';
  const filename = options.filename || `reporte_${report_id}.bin`;
  const ttlMs = options.ttlMs;
  const expires_at = expiresAtFrom(ttlMs);
  const kind = options.kind || 'generic';
  const extra = options.extra || {};

  await fsp.writeFile(dataPath, buffer);
  const stat = await fsp.stat(dataPath).catch(() => ({ size: buffer.length }));

  const meta = {
    report_id,
    kind,
    filename,
    mime,
    size: stat.size,
    created_at: new Date().toISOString(),
    expires_at,
    extra,
  };
  await fsp.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');

  return {
    report_id,
    filename,
    mime,
    size: stat.size,
    expires_at,
  };
}

/**
 * Guarda un reporte de texto (txt) utilizando saveBufferReport
 * @param {string} text
 * @param {Object} options
 *  - filename (sugerido). Si no se provee, se autogenera con .txt
 *  - ttlMs, kind, extra
 */
async function saveTextReport(text, options = {}) {
  const content = String(text == null ? '' : text);
  const filename = options.filename || `reporte_${Date.now()}.txt`;
  return saveBufferReport(Buffer.from(content, 'utf8'), {
    ...options,
    filename,
    mime: 'text/plain; charset=utf-8',
  });
}

/**
 * Lee un reporte por ID
 * @param {string} report_id
 * @returns {Promise<{buffer, meta}>} o null si no existe/expirado
 */
async function readReport(report_id) {
  if (!report_id) {
    throw httpError('INVALID_INPUT', 'report_id requerido', 400);
  }
  const { dataPath, metaPath } = buildPaths(report_id);

  try {
    const metaRaw = await fsp.readFile(metaPath, 'utf8');
    const meta = JSON.parse(metaRaw);

    // Verificar expiración
    if (meta.expires_at && new Date(meta.expires_at).getTime() < now()) {
      // Expirado: intentar borrar
      await safeDelete(report_id);
      return null;
    }

    const buffer = await fsp.readFile(dataPath);
    return { buffer, meta };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Borrar un reporte (archivo y metadatos)
 * @param {string} report_id
 * @returns {Promise<boolean>} true si borró, false si no existía
 */
async function deleteReport(report_id) {
  const { dataPath, metaPath } = buildPaths(report_id);
  let removed = false;
  try {
    await fsp.unlink(dataPath);
    removed = true;
  } catch {}
  try {
    await fsp.unlink(metaPath);
    removed = true || removed;
  } catch {}
  return removed;
}

async function safeDelete(report_id) {
  try {
    await deleteReport(report_id);
  } catch {}
}

/**
 * Limpia reportes expirados en el directorio
 * @returns {Promise<{checked, removed}>}
 */
async function cleanupExpired() {
  await ensureDir();
  const files = await fsp.readdir(REPORTS_DIR);
  const metas = files.filter((f) => f.endsWith('.json'));

  let removed = 0;
  for (const mf of metas) {
    try {
      const metaPath = path.join(REPORTS_DIR, mf);
      const metaRaw = await fsp.readFile(metaPath, 'utf8');
      const meta = JSON.parse(metaRaw);
      if (meta.expires_at && new Date(meta.expires_at).getTime() < now()) {
        const report_id = String(meta.report_id || mf.replace(/\.json$/, ''));
        await safeDelete(report_id);
        removed++;
      }
    } catch {
      // Ignorar archivos corruptos y continuar
    }
  }
  return { checked: metas.length, removed };
}

module.exports = {
  REPORTS_DIR,
  DEFAULT_TTL_MS,

  saveBufferReport,
  saveTextReport,
  readReport,
  deleteReport,
  cleanupExpired,
};