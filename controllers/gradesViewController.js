'use strict';

const { z } = require('zod');
const {
  getStudentComponentGrades,
  getStudentComponentAverage,
} = require('../services/gradesViewService');

const BaseQuerySchema = z.object({
  año: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int()),
  trimestre: z.preprocess(
    (v) => (v != null ? Number(v) : v),
    z
      .number()
      .int()
      .refine((n) => [1, 2, 3].includes(n), 'Trimestre inválido. Debe ser 1, 2 o 3')
  )
  .optional(),
  curso_id: z.string().min(1).optional(),
  componente_id: z.string().min(1).optional(),
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

module.exports = {
  getStudentComponentGradesController,
  getStudentComponentAverageController,
};