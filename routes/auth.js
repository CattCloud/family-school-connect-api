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
router.post('/login', loginRateLimiter, login);
router.post('/forgot-password', forgotPasswordRateLimiter, forgotPassword);
router.post('/reset-password', resetPasswordRateLimiter, resetPassword);

// Rutas protegidas
router.post('/logout', auth, logout);
router.get('/validate-token', auth, validateToken);
router.post('/change-required-password', auth, changeRequiredPassword);
router.get('/parent-context/:user_id', auth, getParentContext);

module.exports = router;