'use strict';

const { z } = require('zod');
const { getNonLectiveDays } = require('../services/attendanceViewService');

// Schema de query para días no lectivos
const YearQuerySchema = z.object({
  año: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int()),
});

// GET /calendario/dias-no-lectivos?año=YYYY
async function getNonLectiveDaysController(req, res, next) {
  try {
    const parsed = YearQuerySchema.parse(req.query || {});
    const data = await getNonLectiveDays({ año: parsed.año });
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
  getNonLectiveDaysController,
};