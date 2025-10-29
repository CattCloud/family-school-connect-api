'use strict';

const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// HU-SOP-01: Crear Ticket
router.post('/tickets', supportController.crearTicket);

// HU-SOP-02: Ver Historial de Tickets
router.get('/tickets/usuario', supportController.obtenerHistorialTickets);

// HU-SOP-03: Ver Detalle de Ticket
router.get('/tickets/:id', supportController.obtenerDetalleTicket);

// HU-SOP-03: Responder a Ticket (usuario)
router.post('/tickets/:id/respuestas', supportController.responderTicket);

// Calificar satisfacción del ticket
router.post('/tickets/:id/calificar', supportController.calificarTicket);

// Obtener categorías disponibles
router.get('/categorias', supportController.obtenerCategorias);

module.exports = router;