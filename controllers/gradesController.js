'use strict';

const { z } = require('zod');
const {
  getCurrentAcademicYear,
  generateGradesTemplate,
  validateGradesFile,
  loadGrades,
} = require('../services/gradesService');
const { readReport } = require('../services/reportsService');

// Schemas
const TemplateBodySchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  trimestre: z.number().int().positive(),
  componente_id: z.string().min(1),
  año_academico: z.number().int().optional(),
});

const ValidateFormSchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  trimestre: z
    .preprocess((v) => (v != null ? Number(v) : v), z.number().int().positive())
    .optional(),
  componente_id: z.string().min(1),
  año_academico: z
    .preprocess((v) => (v != null ? Number(v) : v), z.number().int())
    .optional(),
});

const LoadBodySchema = z.object({
  validacion_id: z.string().min(1),
  procesar_solo_validos: z.boolean().optional().default(true),
  generar_alertas: z.boolean().optional().default(true),
});

// POST /calificaciones/plantilla
async function postGradesTemplateController(req, res, next) {
  try {
    const body = TemplateBodySchema.parse(req.body || {});
    // Roles permitidos: docente | director (protegido por route)
    const { buffer, filename } = await generateGradesTemplate(body);

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

// POST /calificaciones/validar (multipart/form-data, campo: archivo)
async function postGradesValidateController(req, res, next) {
  try {
    const parsed = ValidateFormSchema.parse(req.body || {});
    const file = req.file || null; // provisto por multer (uploadGradesExcel)
    const data = await validateGradesFile(
      {
        ...parsed,
        trimestre: parsed.trimestre || 1,
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

// POST /calificaciones/cargar
async function postGradesLoadController(req, res, next) {
  try {
    const body = LoadBodySchema.parse(req.body || {});
    const result = await loadGrades(body, req.user || null);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// GET /calificaciones/reporte-errores/:id (lee desde reportsService)
async function getGradesErrorReportController(req, res, next) {
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
   const fname = result.meta.filename || `Errores_Calificaciones_${reportId}.txt`;
   res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
   return res.status(200).send(result.buffer);
 } catch (err) {
   next(err);
 }
}

module.exports = {
  postGradesTemplateController,
  postGradesValidateController,
  postGradesLoadController,
  getGradesErrorReportController,
};