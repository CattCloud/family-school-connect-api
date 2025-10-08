'use strict';

const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { parentsReadLimiter } = require('../middleware/limiters');
const { getNonLectiveDaysController } = require('../controllers/calendarController');

const router = Router();

/**
 * Calendario - Días no lectivos
 * GET /calendario/dias-no-lectivos?año=YYYY
 * Auth: Bearer (rol: apoderado)
 */
router.get(
  '/calendario/dias-no-lectivos',
  auth,
  authorizeRole(['apoderado']),
  parentsReadLimiter,
  getNonLectiveDaysController
);

module.exports = router;