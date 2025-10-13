'use strict';

const { z } = require('zod');
const { getCoursesForStudent } = require('../services/coursesService');

// Schemas HU-MSG-01
const CoursesByStudentParamsSchema = z.object({
  estudiante_id: z.string().trim().min(1, 'estudiante_id requerido'),
});

const CoursesByStudentQuerySchema = z.object({
  año: z
    .preprocess(
      (v) => (v != null && String(v).trim() !== '' ? Number(v) : undefined),
      z.number().int()
    )
    .optional(),
});

// GET /cursos/estudiante/:estudiante_id
async function getCoursesByStudentController(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      const e = new Error('Usuario no autenticado');
      e.status = 401;
      e.code = 'INVALID_TOKEN';
      throw e;
    }

    const { estudiante_id } = CoursesByStudentParamsSchema.parse(req.params || {});
    const { año } = CoursesByStudentQuerySchema.parse(req.query || {});
    const data = await getCoursesForStudent({ user, estudiante_id, año });
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
  getCoursesByStudentController,
};