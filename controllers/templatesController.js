'use strict';

const { z } = require('zod');
const {
  listTemplateTypes,
  generateTemplateCalificaciones,
  generateTemplateAsistencia,
  getGuide,
  getGuidePdf,
} = require('../services/templatesService');

// Schemas
const CalificacionesBodySchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  trimestre: z.number().int().positive(),
  componente_id: z.string().min(1),
  año_academico: z.number().int().optional(),
});

const AsistenciaBodySchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  fecha: z.string().min(8), // YYYY-MM-DD (validado en servicio)
  año_academico: z.number().int().optional(),
});

const GuideParamsSchema = z.object({
  tipo: z.string().min(1),
});

// GET /plantillas/tipos
async function getTemplatesTypesController(_req, res, next) {
  try {
    const types = listTemplateTypes();
    return res.status(200).json({ success: true, data: types });
  } catch (err) {
    next(err);
  }
}

// POST /plantillas/calificaciones
async function postTemplatesCalificacionesController(req, res, next) {
  try {
    const body = CalificacionesBodySchema.parse(req.body || {});
    const { buffer, filename, contentType } = await generateTemplateCalificaciones(body);

    res.setHeader('Content-Type', contentType);
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

// POST /plantillas/asistencia
async function postTemplatesAsistenciaController(req, res, next) {
  try {
    const body = AsistenciaBodySchema.parse(req.body || {});
    const { buffer, filename, contentType } = await generateTemplateAsistencia(body);

    res.setHeader('Content-Type', contentType);
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

// GET /plantillas/guias/:tipo (texto)
async function getTemplatesGuideController(req, res, next) {
  try {
    const { tipo } = GuideParamsSchema.parse(req.params || {});
    const { content, filename, contentType } = getGuide(tipo);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(content);
  } catch (err) {
    next(err);
  }
}

// GET /plantillas/guias/:tipo/pdf (pdf simulado)
async function getTemplatesGuidePdfController(req, res, next) {
  try {
    const { tipo } = GuideParamsSchema.parse(req.params || {});
    const { buffer, filename, contentType } = getGuidePdf(tipo);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTemplatesTypesController,
  postTemplatesCalificacionesController,
  postTemplatesAsistenciaController,
  getTemplatesGuideController,
  getTemplatesGuidePdfController,
};