'use strict';

const { z } = require('zod');
const prisma = require('../config/prisma');
const {
  getCurrentAcademicYear,
  getStructure,
  putStructure,
  listTemplates,
  previewWeightedAverage,
  listNivelGrado,
} = require('../services/evaluationService');

// Schemas
const PutStructureSchema = z.object({
  año_academico: z.number().int().optional(),
  componentes: z
    .array(
      z.object({
        nombre_item: z.string().min(1).max(50),
        peso_porcentual: z.number(),
        tipo_evaluacion: z.enum(['unica', 'recurrente']),
        orden_visualizacion: z.number().int(),
      })
    )
    .min(1)
    .max(5),
});

// GET /evaluation-structure?año=2025
async function getEvaluationStructure(req, res, next) {
  try {
    const año = req.query.año ? Number(req.query.año) : getCurrentAcademicYear();
    const data = await getStructure(año);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (!err.status) err.status = 500;
    next(err);
  }
}

// PUT /evaluation-structure
async function putEvaluationStructure(req, res, next) {
  try {
    const parsed = PutStructureSchema.parse(req.body || {});
    const year = parsed.año_academico ?? getCurrentAcademicYear();
    const data = await putStructure(year, parsed.componentes, req.user?.id || null);
    return res.status(200).json({
      success: true,
      data: {
        message: 'Estructura de evaluación registrada correctamente',
        año_academico: data.año_academico,
        total_componentes: data.total_componentes,
        suma_pesos: data.suma_pesos,
        configuracion_bloqueada: data.configuracion_bloqueada,
        fecha_configuracion: data.fecha_bloqueo,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// GET /evaluation-structure/templates
async function getEvaluationTemplates(_req, res, next) {
  try {
    const templates = await listTemplates();
    return res.status(200).json({ success: true, data: { templates, total_templates: templates.length } });
  } catch (err) {
    next(err);
  }
}

// GET /evaluation-structure/preview?componentes=<json>
async function getEvaluationPreview(req, res, next) {
  try {
    // componentes es un JSON encode en query ([{nombre, peso, nota}, ...])
    const raw = req.query.componentes;
    if (!raw) {
      const e = new Error('Parámetro "componentes" requerido en JSON');
      e.status = 400;
      e.code = 'INVALID_INPUT';
      throw e;
    }
    const parsed = JSON.parse(raw);
    const data = { ejemplo_calculo: previewWeightedAverage(parsed) };
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /evaluation-structure/history
async function getEvaluationHistory(req, res, next) {
  try {
    // Historial por año con resumen
    const rows = await prisma.estructuraEvaluacion.groupBy({
      by: ['año_academico'],
      _count: { _all: true },
    });

    // Tomar un registro por año para extraer metadata (fecha_configuracion, bloqueada)
    const detalles = [];
    for (const r of rows) {
      const one = await prisma.estructuraEvaluacion.findFirst({
        where: { año_academico: r.año_academico },
        orderBy: { fecha_configuracion: 'asc' },
        select: { fecha_configuracion: true, bloqueada: true },
      });
      detalles.push({
        año_academico: r.año_academico,
        total_componentes: r._count._all,
        fecha_configuracion: one?.fecha_configuracion || null,
        configurado_por: null, // no se persiste aún quién configuró
        bloqueada: one?.bloqueada ?? true,
      });
    }

    return res.status(200).json({ success: true, data: { configuraciones: detalles, total_configuraciones: detalles.length } });
  } catch (err) {
    next(err);
  }
}

// GET /nivel-grado
async function getNivelGradoController(_req, res, next) {
  try {
    const data = await listNivelGrado();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEvaluationStructure,
  putEvaluationStructure,
  getEvaluationTemplates,
  getEvaluationPreview,
  getEvaluationHistory,
  getNivelGradoController,
};