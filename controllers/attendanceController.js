'use strict';

const { z } = require('zod');
const {
  getCurrentAcademicYear,
  verifyAttendanceContext,
  generateAttendanceTemplate,
  validateAttendanceFile,
  loadAttendance,
  getAttendanceStats,
} = require('../services/attendanceService');
const { readReport } = require('../services/reportsService');

// Schemas
const TemplateBodySchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  fecha: z.string().min(8), // YYYY-MM-DD (validación exacta en servicio)
  año_academico: z.number().int().optional(),
});

const ValidateFormSchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  fecha: z.string().min(8),
  año_academico: z
    .preprocess((v) => (v != null ? Number(v) : v), z.number().int())
    .optional(),
});

const LoadBodySchema = z.object({
  validacion_id: z.string().min(1),
  reemplazar_existente: z.boolean().optional().default(false),
});

const VerifyQuerySchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  fecha: z.string().min(8),
  año_academico: z
    .preprocess((v) => (v != null ? Number(v) : v), z.number().int())
    .optional(),
});

const StatsQuerySchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  fecha: z.string().min(8),
  año_academico: z
    .preprocess((v) => (v != null ? Number(v) : v), z.number().int())
    .optional(),
});

// GET /asistencias/verificar
async function getAttendanceVerifyController(req, res, next) {
  try {
    const parsed = VerifyQuerySchema.parse(req.query || {});
    const data = await verifyAttendanceContext({
      ...parsed,
      año_academico: parsed.año_academico || getCurrentAcademicYear(),
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// POST /asistencias/plantilla
async function postAttendanceTemplateController(req, res, next) {
  try {
    const body = TemplateBodySchema.parse(req.body || {});
    const { buffer, filename } = await generateAttendanceTemplate(body);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'MISSING_REQUIRED_FIELDS';
    }
    next(err);
  }
}

// POST /asistencias/validar (multipart/form-data, campo: archivo)
async function postAttendanceValidateController(req, res, next) {
  try {
    const parsed = ValidateFormSchema.parse(req.body || {});
    const file = req.file || null; // provisto por multer (uploadAttendanceExcel)
    const data = await validateAttendanceFile(
      {
        ...parsed,
        año_academico: parsed.año_academico || getCurrentAcademicYear(),
      },
      file
    );
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// POST /asistencias/cargar
async function postAttendanceLoadController(req, res, next) {
  try {
    const body = LoadBodySchema.parse(req.body || {});
    const result = await loadAttendance(body, req.user || null);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// GET /asistencias/reporte-errores/:id (lee desde reportsService)
async function getAttendanceErrorReportController(req, res, next) {
 try {
   const reportId = String(req.params?.id || '').trim();
   if (!reportId) {
     const e = new Error('report_id requerido');
     e.status = 400;
     e.code = 'INVALID_INPUT';
     throw e;
   }

   const result = await readReport(reportId);
   if (!result) {
     const e = new Error('Reporte no disponible o expirado');
     e.status = 404;
     e.code = 'REPORT_NOT_FOUND';
     throw e;
   }

   res.setHeader('Content-Type', result.meta.mime || 'text/plain; charset=utf-8');
   const fname = result.meta.filename || `Errores_Asistencias_${reportId}.txt`;
   res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
   return res.status(200).send(result.buffer);
 } catch (err) {
   next(err);
 }
}

// GET /asistencias/estadisticas
async function getAttendanceStatsController(req, res, next) {
  try {
    const parsed = StatsQuerySchema.parse(req.query || {});
    const data = await getAttendanceStats({
      ...parsed,
      año_academico: parsed.año_academico || getCurrentAcademicYear(),
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

module.exports = {
  getAttendanceVerifyController,
  postAttendanceTemplateController,
  postAttendanceValidateController,
  postAttendanceLoadController,
  getAttendanceErrorReportController,
  getAttendanceStatsController,
};