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
const { logAuthEvent } = require('../middleware/logging');
const {
  loginRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
} = require('../middleware/rateLimiter');

const router = Router();

// Rutas públicas con rate limiting y logging
router.post('/auth/login', 
  loginRateLimiter, 
  // Middleware para capturar login exitoso (se ejecuta después del controlador)
  function(req, res, next) {
    // Almacenar la función original de res.json
    const originalJson = res.json;
    
    // Sobrescribir res.json para capturar el resultado del login
    res.json = function(data) {
      // Restaurar el método original
      res.json = originalJson;
      
      // Si el login fue exitoso, registrar el evento
      if (data && data.success) {
        req.user = { id: data.data.user.id }; // Establecer user para el middleware de logging
        logAuthEvent('login_exitoso')(req, res, function() {});
      } else {
        // Si falló, registrar login fallido
        logAuthEvent('login_fallido')(req, res, function() {});
      }
      
      // Continuar con la respuesta normal
      return originalJson.call(this, data);
    };
    
    next();
  },
  login
);

router.post('/auth/forgot-password', forgotPasswordRateLimiter, forgotPassword);
router.post('/auth/reset-password', resetPasswordRateLimiter, resetPassword);

// Rutas protegidas con logging
router.post('/auth/logout', 
  auth, 
  logAuthEvent('logout'),
  logout
);

router.get('/auth/validate-token', auth, validateToken);
router.post('/auth/change-required-password', auth, changeRequiredPassword);
router.get('/auth/parent-context/:user_id', auth, getParentContext);

module.exports = router;