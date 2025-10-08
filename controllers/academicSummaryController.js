'use strict';

const { z } = require('zod');
const {
  getAcademicSummary,
  exportAcademicSummaryPDF,
} = require('../services/academicSummaryService');

// Schemas
const SummaryQuerySchema = z.object({
  año: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int()),
  trimestre: z
    .preprocess(
      (v) => (v === undefined || v === null || v === '' ? undefined : Number(v)),
      z.number().int().refine((n) => [1, 2, 3].includes(n), 'Trimestre inválido. Debe ser 1, 2 o 3')
    )
    .optional(),
});

const ExportQuerySchema = z.object({
  año: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int()),
  formato: z.string().transform((v) => String(v).toLowerCase()).refine((v) => v === 'pdf', {
    message: "Formato inválido. Solo se permite 'pdf'",
  }),
});

// GET /resumen-academico/estudiante/:estudiante_id
async function getAcademicSummaryController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const parsed = SummaryQuerySchema.parse(req.query || {});
    const data = await getAcademicSummary({
      estudiante_id,
      año: parsed.año,
      trimestre: parsed.trimestre,
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

// GET /resumen-academico/estudiante/:estudiante_id/export
async function exportAcademicSummaryController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const parsed = ExportQuerySchema.parse(req.query || {});
    // Solo anual (sin trimestre), acorde a documentación
    const { filename, buffer, mime } = await exportAcademicSummaryPDF({
      estudiante_id,
      año: parsed.año,
    });

    res.setHeader('Content-Type', mime || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    // Si falla puppeteer u otros, mapear a EXPORT_FAILED si no hay code
    if (!err.code) {
      err.code = 'EXPORT_FAILED';
      err.status = 500;
    }
    next(err);
  }
}

module.exports = {
  getAcademicSummaryController,
  exportAcademicSummaryController,
};