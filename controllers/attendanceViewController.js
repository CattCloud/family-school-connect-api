'use strict';

const { z } = require('zod');
const {
  getAttendanceByPeriod,
  getAttendanceStats,
  exportAttendancePDF,
} = require('../services/attendanceViewService');

// Schemas
const PeriodQuerySchema = z.object({
  año: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int()),
  mes: z
    .preprocess(
      (v) => (v === undefined || v === null || v === '' ? undefined : Number(v)),
      z.number().int().min(1).max(12)
    )
    .optional(),
  trimestre: z
    .preprocess(
      (v) => (v === undefined || v === null || v === '' ? undefined : Number(v)),
      z.number().int().refine((n) => [1, 2, 3].includes(n), 'Trimestre inválido. Debe ser 1, 2 o 3')
    )
    .optional(),
});

const StatsQuerySchema = z.object({
  fecha_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fecha_fin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
});

const ExportQuerySchema = z.object({
  formato: z
    .string()
    .transform((v) => String(v).toLowerCase())
    .refine((v) => v === 'pdf', { message: "Formato inválido. Solo se permite 'pdf'" }),
  fecha_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  fecha_fin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
});

// GET /asistencias/estudiante/:estudiante_id
async function getAttendanceByPeriodController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const parsed = PeriodQuerySchema.parse(req.query || {});
    const data = await getAttendanceByPeriod({
      estudiante_id,
      año: parsed.año,
      mes: parsed.mes,
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

// GET /asistencias/estudiante/:estudiante_id/estadisticas
async function getAttendanceStatsController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const parsed = StatsQuerySchema.parse(req.query || {});
    const data = await getAttendanceStats({
      estudiante_id,
      fecha_inicio: parsed.fecha_inicio,
      fecha_fin: parsed.fecha_fin,
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

// GET /asistencias/estudiante/:estudiante_id/export
async function exportAttendanceController(req, res, next) {
  try {
    const estudiante_id = String(req.params?.estudiante_id || req.params?.id || '').trim();
    if (!estudiante_id) {
      const e = new Error('Parámetro estudiante_id requerido');
      e.status = 400;
      e.code = 'INVALID_PARAMETERS';
      throw e;
    }

    const parsed = ExportQuerySchema.parse(req.query || {});
    const { filename, buffer, mime } = await exportAttendancePDF({
      estudiante_id,
      fecha_inicio: parsed.fecha_inicio,
      fecha_fin: parsed.fecha_fin,
    });

    res.setHeader('Content-Type', mime || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    if (!err.code) {
      err.code = 'EXPORT_FAILED';
      err.status = 500;
    }
    next(err);
  }
}

module.exports = {
  getAttendanceByPeriodController,
  getAttendanceStatsController,
  exportAttendanceController,
};