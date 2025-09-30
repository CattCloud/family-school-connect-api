'use strict';

const { Router } = require('express');

const {
  login,
  forgotPassword,
  resetPassword,
  logout,
  validateToken,
  changeRequiredPassword,
  getParentContext,
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');
const {
  loginRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
} = require('../middleware/rateLimiter');

const router = Router();

// Rutas públicas con rate limiting
router.post('/auth/login', loginRateLimiter, login);
router.post('/auth/forgot-password', forgotPasswordRateLimiter, forgotPassword);
router.post('/auth/reset-password', resetPasswordRateLimiter, resetPassword);

// Rutas protegidas
router.post('/auth/logout', auth, logout);
router.get('/auth/validate-token', auth, validateToken);
router.post('/auth/change-required-password', auth, changeRequiredPassword);
router.get('/auth/parent-context/:user_id', auth, getParentContext);

module.exports = router;