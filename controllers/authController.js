'use strict';

const { z } = require('zod');
const jwt = require('jsonwebtoken');

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const authService = require('../services/authService');

// ============ Schemas de validación ============
const TipoDocumentoEnum = z.enum(['DNI', 'CARNET_EXTRANJERIA']);

const LoginSchema = z.object({
  tipo_documento: TipoDocumentoEnum,
  nro_documento: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[0-9]+$/, 'Debe ser numérico'),
  password: z.string().min(8),
});

const ForgotSchema = z.object({
  tipo_documento: TipoDocumentoEnum,
  nro_documento: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[0-9]+$/, 'Debe ser numérico'),
});

const ResetPasswordSchema = z
  .object({
    token: z.string().uuid(),
    nueva_password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos 1 mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos 1 minúscula')
      .regex(/[0-9]/, 'Debe contener al menos 1 número'),
    confirmar_password: z.string(),
  })
  .refine((d) => d.nueva_password === d.confirmar_password, {
    path: ['confirmar_password'],
    message: 'Las contraseñas no coinciden',
  });

const ChangeRequiredSchema = z
  .object({
    password_actual: z.string().min(1),
    nueva_password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos 1 mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos 1 minúscula')
      .regex(/[0-9]/, 'Debe contener al menos 1 número'),
    confirmar_password: z.string(),
  })
  .refine((d) => d.nueva_password === d.confirmar_password, {
    path: ['confirmar_password'],
    message: 'Las contraseñas no coinciden',
  });

// ============ Helpers ============
function roleRedirect(rol) {
  switch (rol) {
    case 'apoderado':
      return '/dashboard/padre';
    case 'docente':
      return '/dashboard/docente';
    case 'director':
      return '/dashboard/director';
    case 'administrador':
      return '/admin';
    default:
      return '/';
  }
}

function formatExpiresIn(expUnixSeconds) {
  if (!expUnixSeconds) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, expUnixSeconds - nowSec);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ============ Controladores ============

// POST /auth/login
async function login(req, res, next) {
  try {
    const { tipo_documento, nro_documento, password } = LoginSchema.parse(req.body);

    const user = await authService.authenticateUser(tipo_documento, nro_documento, password);

    const token = authService.generateJWT(user);
    await authService.updateLastLogin(user.id);

    const redirect_to = roleRedirect(user.rol);

    // Contexto padre (placeholder en semana 3; se completará al crear tablas relaciones_familiares/estudiantes)
    const context =
      user.rol === 'apoderado'
        ? {
            hijos: [],
            hijo_seleccionado_default: null,
          }
        : undefined;

    return res.status(200).json({
      success: true,
      data: {
        token,
        expires_in: process.env.JWT_EXPIRES_IN || '24h',
        user: {
          id: user.id,
          tipo_documento: user.tipo_documento,
          nro_documento: user.nro_documento,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol,
          telefono: user.telefono,
          fecha_ultimo_login: user.fecha_ultimo_login,
          debe_cambiar_password: user.debe_cambiar_password,
        },
        redirect_to,
        ...(context ? { context } : {}),
      },
    });
  } catch (err) {
    // Estándar de errores según documentación
    if (err.code === 'INVALID_CREDENTIALS') {
      err.status = 401;
    }
    if (err.code === 'USER_INACTIVE') {
      err.status = 403;
    }
    next(err);
  }
}

// POST /auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { tipo_documento, nro_documento } = ForgotSchema.parse(req.body);

    // Respuesta genérica (no revelar existencia)
    const genericResponse = {
      success: true,
      data: {
        message:
          'Si el número de documento existe, recibirás un WhatsApp con instrucciones',
        estimated_delivery: '1-2 minutos',
      },
    };

    const user = await prisma.usuario.findFirst({
      where: { tipo_documento, nro_documento, estado_activo: true },
    });

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Invalida anteriores y crea nuevo
    const { token } = await authService.generateResetToken(user.id);

    // Enviar mensaje (no-op si no hay credenciales)
    await authService.sendWhatsAppResetLink(user.telefono, token);

    return res.status(200).json(genericResponse);
  } catch (err) {
    next(err);
  }
}

// POST /auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, nueva_password } = ResetPasswordSchema.parse(req.body);

    const { tokenRow, user } = await authService.validateResetToken(token);

    // Cambiar password (valida que no sea igual a la actual)
    await authService.changePassword(user.id, nueva_password);

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { token: tokenRow.token },
      data: { usado: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Contraseña actualizada correctamente',
        redirect_to: '/login',
      },
    });
  } catch (err) {
    if (err.code === 'INVALID_TOKEN') {
      err.status = 400;
    }
    next(err);
  }
}

// POST /auth/logout (protegida)
async function logout(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const token = req.token;
    if (token) {
      await authService.blacklistToken(token, userId);
    }
    return res.status(200).json({
      success: true,
      data: { message: 'Sesión cerrada correctamente' },
    });
  } catch (err) {
    next(err);
  }
}

// GET /auth/validate-token (protegida)
async function validateToken(req, res, next) {
  try {
    const decoded = jwt.decode(req.token);
    const expires_in = formatExpiresIn(decoded?.exp);

    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        expires_in,
        user: {
          id: req.user.id,
          rol: req.user.rol,
          nombre: req.user.nombre,
          apellido: req.user.apellido,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/change-required-password (protegida)
async function changeRequiredPassword(req, res, next) {
  try {
    const { password_actual, nueva_password } = ChangeRequiredSchema.parse(req.body);

    await authService.changeRequiredPassword(req.user.id, password_actual, nueva_password);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Contraseña actualizada correctamente',
        redirect_to: '/dashboard/docente',
      },
    });
  } catch (err) {
    if (err.code === 'CURRENT_PASSWORD_INCORRECT') {
      err.status = 400;
    }
    if (err.code === 'CHANGE_NOT_REQUIRED') {
      err.status = 403;
    }
    next(err);
  }
}

// GET /auth/parent-context/:user_id (protegida)
async function getParentContext(req, res, next) {
  try {
    const { user_id } = req.params;

    if (req.user.rol !== 'apoderado') {
      const e = new Error('Solo accesible por rol apoderado');
      e.status = 403;
      e.code = 'FORBIDDEN';
      throw e;
    }

    if (req.user.id !== user_id) {
      const e = new Error('No autorizado para consultar este contexto');
      e.status = 403;
      e.code = 'FORBIDDEN';
      throw e;
    }

    // Semana 3: stub temporal sin tablas relaciones_familiares/estudiantes
    // Al implementar BD, consultar:
    // relaciones_familiares.estado_activo = true
    // estudiantes.estado_matricula = 'activo'
    return res.status(200).json({
      success: true,
      data: {
        hijos: [],
        total_hijos: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  logout,
  validateToken,
  changeRequiredPassword,
  getParentContext,
};