'use strict';

const { Router } = require('express');
const { sendTemplateMessage } = require('../services/whatsappService');

const router = Router();

// GET /api/dev/wa-template?to=+51XXXXXXXXX&template=hello_world
// Envía un mensaje de template (debe estar aprobado en tu WABA).
// Útil para abrir la ventana de 24h y luego poder enviar mensajes de texto.
router.get('/dev/wa-template', async (req, res) => {
  // Proteger esta ruta para desarrollo
  if (process.env.ENABLE_DEV_ROUTES !== 'true' || process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ruta no disponible' },
    });
  }

  const to = req.query.to;
  const template = req.query.template || process.env.WA_TEMPLATE_NAME || 'hello_world';

  if (!to) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Parámetro "to" requerido en formato E.164 (+51XXXXXXXXX)' },
    });
  }

  try {
    const result = await sendTemplateMessage(to, template);
    if (result.success) {
      return res.status(200).json({ success: true, data: result.data });
    }
    return res.status(502).json({
      success: false,
      error: { code: 'WHATSAPP_DELIVERY_ERROR', message: result.body || 'Fallo en envío template' },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
    });
  }
});

module.exports = router;