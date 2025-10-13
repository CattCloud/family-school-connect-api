'use strict';

const cloudinary = require('cloudinary').v2;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Inicializar configuración desde variables de entorno (CLOUDINARY_URL recomendado)
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || undefined,
    api_key: process.env.CLOUDINARY_API_KEY || undefined,
    api_secret: process.env.CLOUDINARY_API_SECRET || undefined,
    secure: true,
  });
} catch {
  // cloudinary también detecta CLOUDINARY_URL automáticamente
}

function isConfigured() {
  const cfg = cloudinary.config();
  return Boolean(cfg && cfg.cloud_name);
}

function sanitizeBaseName(name) {
  if (!name) return 'archivo';
  return String(name)
    .replace(/[\s]+/g, '_')
    .replace(/[^a-zA-Z0-9_\-\.]+/g, '')
    .slice(0, 80);
}

function yearMonthFolder(base = 'mensajeria') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${base}/${year}/${month}`;
}

function validateFileOrThrow(file) {
  if (!file) {
    const e = new Error('Archivo no provisto');
    e.code = 'FILE_NOT_FOUND';
    e.status = 400;
    throw e;
  }
  if (!ALLOWED_MIME.has(file.mimetype)) {
    const e = new Error('Solo se permiten archivos PDF, JPG y PNG');
    e.code = 'FILE_TYPE_NOT_ALLOWED';
    e.status = 400;
    e.details = {
      allowed_types: Array.from(ALLOWED_MIME),
      received_type: file.mimetype,
    };
    throw e;
  }
  if (file.size > MAX_BYTES) {
    const e = new Error('El archivo excede el tamaño máximo de 5MB');
    e.code = 'FILE_TOO_LARGE';
    e.status = 413;
    e.details = {
      file_size: file.size,
      max_size: MAX_BYTES,
      file_name: file.originalname || 'archivo',
    };
    throw e;
  }
}

function buildPublicId(originalname) {
  const base = sanitizeBaseName(path.parse(originalname || 'archivo').name);
  const ts = Date.now();
  const rand = crypto.randomBytes(3).toString('hex'); // 6 hex
  return `${ts}_${rand}_${base}`;
}

function detectIsImage(mime) {
  return mime === 'image/jpeg' || mime === 'image/png';
}

function toDataURI(file) {
  const b64 = file.buffer ? file.buffer.toString('base64') : '';
  return `data:${file.mimetype};base64,${b64}`;
}

async function uploadBufferToCloudinary(file, { folder }) {
  const public_id = buildPublicId(file.originalname);
  const uploadOptions = {
    resource_type: 'auto',
    folder,
    public_id,
    use_filename: false,
    unique_filename: false,
    overwrite: false,
  };

  try {
    const res = await cloudinary.uploader.upload(toDataURI(file), uploadOptions);
    const extension = res.format ? `.${res.format}` : '';
    return {
      nombre_original: file.originalname || 'archivo',
      nombre_archivo: `${public_id}${extension}`,
      url_cloudinary: res.secure_url || res.url,
      tipo_mime: file.mimetype,
      tamaño_bytes: file.size,
      es_imagen: detectIsImage(file.mimetype),
      fecha_subida: res.created_at,
    };
  } catch (err) {
    logger.error('Cloudinary upload error', { error: err?.message });
    const e = new Error('Error al subir archivo a Cloudinary');
    e.code = 'UPLOAD_FAILED';
    e.status = 500;
    e.details = { error: err?.message };
    throw e;
  }
}

async function simulateUpload(file, { folder }) {
  const public_id = buildPublicId(file.originalname);
  const ext =
    file.mimetype === 'application/pdf'
      ? '.pdf'
      : file.mimetype === 'image/jpeg'
      ? '.jpg'
      : '.png';
  return {
    nombre_original: file.originalname || 'archivo',
    nombre_archivo: `${public_id}${ext}`,
    url_cloudinary: `https://simulated.local/${folder}/${public_id}${ext}`,
    tipo_mime: file.mimetype,
    tamaño_bytes: file.size,
    es_imagen: detectIsImage(file.mimetype),
    fecha_subida: new Date().toISOString(),
    simulated: true,
  };
}

/**
 * Sube un archivo (buffer en memoria) a Cloudinary. Simula si no hay configuración.
 * Retorna metadatos requeridos por el dominio de mensajería.
 */
async function uploadSingle(file, baseFolder = 'mensajeria') {
  validateFileOrThrow(file);
  const folder = yearMonthFolder(baseFolder);

  if (!isConfigured()) {
    logger.warn('Cloudinary no configurado. Subida simulada.', {
      file: file.originalname,
      mimetype: file.mimetype,
    });
    return simulateUpload(file, { folder });
  }

  return uploadBufferToCloudinary(file, { folder });
}

/**
 * Sube múltiples archivos (máximo 3). Lanza error si excede el límite.
 */
async function uploadMany(files, baseFolder = 'mensajeria') {
  const arr = Array.isArray(files) ? files : files ? [files] : [];
  if (arr.length === 0) return [];
  if (arr.length > 3) {
    const e = new Error('No puedes adjuntar más de 3 archivos');
    e.code = 'FILE_LIMIT_EXCEEDED';
    e.status = 400;
    throw e;
  }
  return Promise.all(arr.map((f) => uploadSingle(f, baseFolder)));
}

module.exports = {
  isConfigured,
  ALLOWED_MIME,
  MAX_BYTES,
  validateFileOrThrow,
  uploadSingle,
  uploadMany,
  yearMonthFolder,
  buildPublicId,
  detectIsImage,
};