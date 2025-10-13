'use strict';

const multer = require('multer');
const { ALLOWED_MIME, MAX_BYTES } = require('../services/cloudinaryService');

// MIME types aceptados para Excel
const EXCEL_MIMES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls (legacy)
]);

// Almacenamiento en memoria (MVP). En producción considerar almacenamiento temporal en disco.
const storage = multer.memoryStorage();

// Filtro por tipo de archivo (Excel)
function excelFileFilter(_req, file, cb) {
  if (EXCEL_MIMES.has(file.mimetype)) {
    return cb(null, true);
  }
  const err = new Error('El archivo debe ser Excel (.xlsx o .xls)');
  err.code = 'INVALID_FILE_FORMAT';
  err.status = 400;
  return cb(err);
}

/**
 * Crea un middleware Multer para subir un único archivo Excel en memoria.
 * - fieldName: nombre del campo en form-data (por doc: "archivo")
 * - maxMB: tamaño máximo en MB (número)
 */
function createUploadExcel(fieldName = 'archivo', maxMB = 10) {
  const limits = {
    fileSize: maxMB * 1024 * 1024,
    files: 1,
  };
  const uploader = multer({ storage, fileFilter: excelFileFilter, limits });
  return uploader.single(fieldName);
}

/**
 * Filtro de archivos adjuntos para mensajería (PDF, JPG, PNG)
 */
function attachmentsFileFilter(_req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) {
    return cb(null, true);
  }
  const err = new Error('Solo se permiten archivos PDF, JPG y PNG');
  err.code = 'FILE_TYPE_NOT_ALLOWED';
  err.status = 400;
  return cb(err);
}

/**
 * Crea un middleware Multer para subir adjuntos de mensajería (hasta maxFiles).
 * - fieldName: nombre del campo form-data (por doc: "archivos")
 * - maxFiles: cantidad máxima de archivos (default 3)
 * - maxBytes: tamaño máximo por archivo (default 5MB)
 */
function createUploadAttachments(fieldName = 'archivos', maxFiles = 3, maxBytes = MAX_BYTES) {
  const limits = {
    fileSize: maxBytes,
    files: maxFiles,
  };
  const uploader = multer({ storage, fileFilter: attachmentsFileFilter, limits });
  return uploader.array(fieldName, maxFiles);
}

// Exports específicos por HU:
// - Calificaciones: 10MB
// - Asistencias: 5MB
const uploadGradesExcel = createUploadExcel('archivo', 10);
const uploadAttendanceExcel = createUploadExcel('archivo', 5);

// Mensajería: adjuntos (hasta 3 archivos, 5MB c/u)
const uploadMessagingAttachments = createUploadAttachments('archivos', 3, MAX_BYTES);

module.exports = {
  createUploadExcel,
  uploadGradesExcel,
  uploadAttendanceExcel,
  createUploadAttachments,
  uploadMessagingAttachments,
};