'use strict';

const multer = require('multer');

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

// Exports específicos por HU:
// - Calificaciones: 10MB
// - Asistencias: 5MB
const uploadGradesExcel = createUploadExcel('archivo', 10);
const uploadAttendanceExcel = createUploadExcel('archivo', 5);

module.exports = {
  createUploadExcel,
  uploadGradesExcel,
  uploadAttendanceExcel,
};