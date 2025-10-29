'use strict';

const express = require('express');
const router = express.Router();
const adminSupportController = require('../controllers/adminSupportController');
const { auth } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');

// Aplicar middleware de autenticación y rol administrador
router.use(auth);
router.use(authorizeRole(['administrador']));

// HU-SOP-05: Bandeja de Tickets
router.get('/tickets', adminSupportController.obtenerBandejaTickets);

// HU-SOP-06: Obtener Ticket para Gestión
router.get('/tickets/:id', adminSupportController.obtenerTicketGestion);

// HU-SOP-06: Responder a Ticket (Administrador)
router.post('/tickets/:id/respuestas', adminSupportController.responderTicketAdmin);

// HU-SOP-06: Cambiar Estado de Ticket
router.patch('/tickets/:id/estado', adminSupportController.cambiarEstadoTicket);

// HU-SOP-06: Resolver Ticket
router.post('/tickets/:id/resolver', adminSupportController.resolverTicket);

// Asignar ticket a administrador
router.post('/tickets/:id/asignar', adminSupportController.asignarTicket);

// HU-SOP-08: Obtener Estadísticas
router.get('/estadisticas', adminSupportController.obtenerEstadisticas);

module.exports = router;