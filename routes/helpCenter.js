'use strict';

const express = require('express');
const router = express.Router();
const helpCenterController = require('../controllers/helpCenterController');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// HU-SOP-04: Obtener FAQs
router.get('/faqs', helpCenterController.obtenerFAQs);

// HU-SOP-04: Obtener detalle de FAQ
router.get('/faqs/:id', helpCenterController.obtenerDetalleFAQ);

// HU-SOP-04: Obtener categorías de FAQs
router.get('/faqs-categorias', helpCenterController.obtenerCategoriasFAQ);

// HU-SOP-04: Obtener guías
router.get('/guias', helpCenterController.obtenerGuias);

// HU-SOP-04: Obtener detalle de guía
router.get('/guias/:id', helpCenterController.obtenerDetalleGuia);

// HU-SOP-04: Obtener categorías de guías
router.get('/guias-categorias', helpCenterController.obtenerCategoriasGuias);

// Búsqueda general en centro de ayuda
router.get('/buscar', helpCenterController.busquedaGeneral);

// Obtener contenido destacado
router.get('/destacado', helpCenterController.obtenerContenidoDestacado);

module.exports = router;