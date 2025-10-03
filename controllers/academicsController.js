'use strict';

const { z } = require('zod');
const {
  listDocenteCursos,
  getCursosByNivelGrado,
  listEstudiantesByCurso,
  getCurrentAcademicYear,
} = require('../services/academicsService');

// Schemas
const CursosAsignadosQuerySchema = z.object({
  año_academico: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .optional()
    .or(z.undefined()),
});

const CursosDirectorQuerySchema = z.object({
  nivel: z.string(),
  grado: z.string(),
  año_academico: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .optional()
    .or(z.undefined()),
});

const EstudiantesQuerySchema = z.object({
  curso_id: z.string().min(1),
  nivel_grado_id: z.string().min(1),
  año_academico: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .optional()
    .or(z.undefined()),
});

// GET /cursos/asignados
async function getCursosAsignadosController(req, res, next) {
  try {
    const { año_academico } = CursosAsignadosQuerySchema.parse(req.query || {});
    const docenteId = req.user?.id;
    if (!docenteId) {
      const err = new Error('Token no válido o expirado');
      err.code = 'INVALID_TOKEN';
      err.status = 401;
      throw err;
    }
    const data = await listDocenteCursos(docenteId, año_academico);
    return res.status(200).json({ success: true, data: { docente: { id: docenteId }, ...data } });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_PARAMETERS';
    }
    next(err);
  }
}

// GET /cursos?nivel=&grado=&año_academico=
async function getCursosByNivelGradoController(req, res, next) {
  try {
    const { nivel, grado, año_academico } = CursosDirectorQuerySchema.parse(req.query || {});
    const data = await getCursosByNivelGrado(nivel, grado, año_academico);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'MISSING_PARAMETERS';
    }
    next(err);
  }
}

// GET /estudiantes?curso_id=&nivel_grado_id=&año_academico=
async function getEstudiantesByCursoController(req, res, next) {
  try {
    const { curso_id, nivel_grado_id, año_academico } = EstudiantesQuerySchema.parse(req.query || {});
    const requester = req.user || null;
    const data = await listEstudiantesByCurso({
      curso_id,
      nivel_grado_id,
      año: año_academico || getCurrentAcademicYear(),
      requester,
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
  getCursosAsignadosController,
  getCursosByNivelGradoController,
  getEstudiantesByCursoController,
};