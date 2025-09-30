'use strict';

// Servicio de integración con WhatsApp Cloud API (Meta)
// En desarrollo, si faltan credenciales, hace no-op y loguea.

const logger = require('../utils/logger');

const BASE_URL = process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com/v18.0';
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

const TEMPLATE_LANG = process.env.WA_TEMPLATE_LANG || 'en_US';
const TEMPLATE_NAME = process.env.WA_TEMPLATE_NAME || 'hello_world';
const TRY_TEMPLATE_BEFORE_TEXT =
  process.env.WA_TRY_TEMPLATE_BEFORE_TEXT !== 'false';

/**
 * Llama al endpoint de WhatsApp con el body indicado
 * Devuelve { ok, status, data, raw }
 */
async function callWhatsAppAPI(body) {
  // No-op si no hay configuración para evitar fallos locales
  if (!PHONE_ID || !TOKEN) {
    logger.warn('WhatsApp Cloud API no configurado. Envío simulado.', {
      to: body?.to,
      type: body?.type,
    });
    return {
      ok: true,
      simulated: true,
      status: 200,
      data: { messages: [{ id: 'simulated' }] },
      raw: '{"simulated":true}',
    };
  }

  const url = `${BASE_URL}/${PHONE_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text().catch(() => '');
  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = raw;
  }

  return { ok: res.ok, status: res.status, data: parsed, raw };
}

/**
 * Envía un template (ej. hello_world) para abrir la ventana de 24h
 * Útil cuando el usuario no ha iniciado conversación con el negocio
 */
async function sendTemplateMessage(phone, templateName = TEMPLATE_NAME, components) {
  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: TEMPLATE_LANG },
      ...(components ? { components } : {}),
    },
  };

  const res = await callWhatsAppAPI(body);
  if (!res.ok) {
    logger.error('Error WhatsApp Template', { status: res.status, body: res.raw });
    return { success: false, status: res.status, body: res.raw };
  }

  logger.info('WhatsApp template enviado', {
    messageId: res.data?.messages?.[0]?.id,
    to: phone,
    template: templateName,
    data: res.data,
    status: res.status,
  });
  return { success: true, data: res.data };
}

/**
 * Envío previo de template para asegurar sesión de 24h (si está habilitado)
 */
async function ensureSession(phone) {
  if (!TRY_TEMPLATE_BEFORE_TEXT) return;
  try {
    await sendTemplateMessage(phone, TEMPLATE_NAME);
  } catch (e) {
    logger.warn('No se pudo enviar template para abrir sesión (continuando con texto)', {
      error: e?.message,
      to: phone,
      template: TEMPLATE_NAME,
    });
  }
}
/**
 * Envía un mensaje de restablecimiento de contraseña por WhatsApp
 * @param {string} phone - Número en formato E.164, ej: +51987654321
 * @param {string} token - Token UUID temporal de reset
 * @param {string} baseAppUrl - URL base del frontend, ej: https://app-orquideas.com
 */
async function sendResetPasswordMessage(phone, token, baseAppUrl) {
  const resetUrl = `${baseAppUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: {
      body: `I.E.P. Las Orquídeas\n\nSolicitud de cambio de contraseña.\n\nHaz clic aquí: ${resetUrl}\n\n⏰ Válido por 1 hora únicamente.`,
    },
  };

  // Asegurar ventana de 24h con template (hello_world) si está habilitado
  await ensureSession(phone);

  try {
    const res = await callWhatsAppAPI(body);

    if (!res.ok) {
      logger.error('Error WhatsApp API', { status: res.status, body: res.raw });
      return { success: false, status: res.status, body: res.raw };
    }

    logger.info('WhatsApp reset enviado', {
      messageId: res.data?.messages?.[0]?.id,
      to: phone,
    });
    return { success: true, data: res.data };
  } catch (err) {
    logger.error('Excepción WhatsApp API', err);
    return { success: false, error: err.message };
  }
}

module.exports = { sendResetPasswordMessage, sendTemplateMessage };