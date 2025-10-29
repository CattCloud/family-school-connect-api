'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const SupportService = require('../services/supportService');
const logger = require('../utils/logger');

class SupportController {
  // HU-SOP-01: Crear Ticket
  async crearTicket(req, res) {
    try {
      const { titulo, descripcion, categoria, prioridad } = req.body;
      const usuario_id = req.user.id;

      // Validaciones
      const errores = SupportService.validarDatosTicket({ titulo, descripcion, categoria });
      if (errores.length > 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: errores.join(', ') }
        });
      }

      // Generar número de ticket
      const numero_ticket = await SupportService.generarNumeroTicket();

      // Crear ticket
      const ticket = await prisma.ticketSoporte.create({
        data: {
          numero_ticket,
          titulo,
          descripcion,
          categoria,
          prioridad: prioridad || 'normal',
          usuario_id,
          año_academico: new Date().getFullYear()
        },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, rol: true }
          }
        }
      });

      // Crear notificación para administradores
      await SupportService.crearNotificacionAdministradores(ticket);

      logger.info(`Ticket creado: ${ticket.numero_ticket} por usuario ${usuario_id}`);

      res.status(201).json({
        success: true,
        data: { ticket },
        message: 'Ticket creado exitosamente'
      });
    } catch (error) {
      logger.error('Error al crear ticket:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al crear el ticket' }
      });
    }
  }

  // HU-SOP-02: Obtener Historial de Tickets
  async obtenerHistorialTickets(req, res) {
    try {
      const usuario_id = req.user.id;
      const { estado, categoria, pagina = 1, limite = 20 } = req.query;

      const where = { usuario_id };
      if (estado) where.estado = estado;
      if (categoria) where.categoria = categoria;

      const [tickets, total] = await Promise.all([
        prisma.ticketSoporte.findMany({
          where,
          include: {
            usuario: { select: { id: true, nombre: true, apellido: true } }
          },
          orderBy: { fecha_creacion: 'desc' },
          skip: (pagina - 1) * limite,
          take: parseInt(limite)
        }),
        prisma.ticketSoporte.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          tickets,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / limite),
            total_resultados: total,
            limite: parseInt(limite)
          }
        }
      });
    } catch (error) {
      logger.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el historial' }
      });
    }
  }

  // HU-SOP-03: Obtener Detalle de Ticket
  async obtenerDetalleTicket(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      const ticket = await prisma.ticketSoporte.findFirst({
        where: { id, usuario_id },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, rol: true, telefono: true }
          },
          asignado: {
            select: { id: true, nombre: true, apellido: true }
          },
          respuestas: {
            include: {
              usuario: {
                select: { id: true, nombre: true, apellido: true, rol: true }
              }
            },
            orderBy: { fecha_respuesta: 'asc' }
          },
          archivos_adjuntos: true
        }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ticket no encontrado' }
        });
      }

      res.json({
        success: true,
        data: { ticket }
      });
    } catch (error) {
      logger.error('Error al obtener detalle:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el detalle' }
      });
    }
  }

  // HU-SOP-03: Responder a Ticket (usuario)
  async responderTicket(req, res) {
    try {
      const { id } = req.params;
      const { contenido } = req.body;
      const usuario_id = req.user.id;

      // Validar que el ticket exista y pertenezca al usuario
      const ticket = await prisma.ticketSoporte.findFirst({
        where: { id, usuario_id }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ticket no encontrado' }
        });
      }

      // Validar contenido
      if (!contenido || contenido.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'El contenido debe tener al menos 10 caracteres' }
        });
      }

      // Crear respuesta
      const respuesta = await prisma.respuestaTicket.create({
        data: {
          ticket_id: id,
          usuario_id,
          contenido: contenido.trim(),
          es_respuesta_publica: true
        },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, rol: true }
          }
        }
      });

      // Actualizar estado del ticket si estaba en espera de respuesta
      if (ticket.estado === 'esperando_respuesta') {
        await prisma.ticketSoporte.update({
          where: { id },
          data: { estado: 'en_progreso' }
        });
      }

      // Notificar al administrador asignado
      if (ticket.asignado_a) {
        await SupportService.crearNotificacionRespuesta(ticket, respuesta);
      }

      logger.info(`Respuesta agregada al ticket ${ticket.numero_ticket} por usuario ${usuario_id}`);

      res.status(201).json({
        success: true,
        data: { respuesta },
        message: 'Respuesta agregada exitosamente'
      });
    } catch (error) {
      logger.error('Error al responder ticket:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al agregar la respuesta' }
      });
    }
  }

  // Obtener categorías disponibles
  async obtenerCategorias(req, res) {
    try {
      const categorias = SupportService.obtenerCategoriasDisponibles();
      
      res.json({
        success: true,
        data: { categorias }
      });
    } catch (error) {
      logger.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las categorías' }
      });
    }
  }

  // Calificar satisfacción del ticket
  async calificarTicket(req, res) {
    try {
      const { id } = req.params;
      const { satisfaccion } = req.body;
      const usuario_id = req.user.id;

      // Validar que el ticket exista, pertenezca al usuario y esté resuelto
      const ticket = await prisma.ticketSoporte.findFirst({
        where: { id, usuario_id, estado: 'resuelto' }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ticket no encontrado o no está resuelto' }
        });
      }

      // Validar calificación (1-5)
      if (!satisfaccion || satisfaccion < 1 || satisfaccion > 5) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'La calificación debe estar entre 1 y 5' }
        });
      }

      // Actualizar calificación
      await prisma.ticketSoporte.update({
        where: { id },
        data: { satisfaccion_usuario: satisfaccion }
      });

      logger.info(`Ticket ${ticket.numero_ticket} calificado con ${satisfaccion} por usuario ${usuario_id}`);

      res.json({
        success: true,
        message: 'Calificación registrada exitosamente'
      });
    } catch (error) {
      logger.error('Error al calificar ticket:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al registrar la calificación' }
      });
    }
  }
}

module.exports = new SupportController();