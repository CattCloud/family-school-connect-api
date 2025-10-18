'use strict';

const { z } = require('zod');
const {
  getStudentComponentGrades,
  getStudentComponentAverage,
  exportGradesPDF,
} = require('../services/gradesViewService');

const BaseQuerySchema = z.object({
  año: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int()),
  trimestre: z.preprocess(
    (v) => (v != null ? Number(v) : v),
    z
      .number()
      .int()
      .refine((n) => [1, 2, 3].includes(n), 'Trimestre inválido. Debe ser 1, 2 o 3')
  ),
  curso_id: z.string().min(1),
  componente_id: z.string().min(1),
});

// GET /calificaciones/estudiante/:estudiante_id
async function getStudentComponentGradesController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const parsed = BaseQuerySchema.parse(req.query || {});
    const data = await getStudentComponentGrades({
      estudiante_id,
      año: parsed.año,
      trimestre: parsed.trimestre,
      curso_id: parsed.curso_id,
      componente_id: parsed.componente_id,
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

// GET /calificaciones/estudiante/:estudiante_id/promedio
async function getStudentComponentAverageController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const parsed = BaseQuerySchema.parse(req.query || {});
    const data = await getStudentComponentAverage({
      estudiante_id,
      año: parsed.año,
      trimestre: parsed.trimestre,
      curso_id: parsed.curso_id,
      componente_id: parsed.componente_id,
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

// GET /calificaciones/estudiante/:estudiante_id/export
async function exportGradesPDFController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const ExportQuerySchema = z.object({
      año: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int()),
      formato: z.enum(['pdf']).default('pdf'),
      curso_id: z.string().optional(),
      componente_id: z.string().optional(),
      trimestre: z.preprocess(
        (v) => (v != null ? Number(v) : v),
        z.number().int().refine((n) => [1, 2, 3].includes(n), 'Trimestre inválido. Debe ser 1, 2 o 3').optional()
      ),
    });

    const parsed = ExportQuerySchema.parse(req.query || {});
    
    const pdfBuffer = await exportGradesPDF({
      estudiante_id,
      año: parsed.año,
      formato: parsed.formato,
      curso_id: parsed.curso_id,
      componente_id: parsed.componente_id,
      trimestre: parsed.trimestre,
    });

    // Configurar headers para descarga de PDF
    const filename = `Calificaciones_Estudiante_${estudiante_id}_${parsed.año || '2025'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);

  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

module.exports = {
  getStudentComponentGradesController,
  getStudentComponentAverageController,
  exportGradesPDFController,
};