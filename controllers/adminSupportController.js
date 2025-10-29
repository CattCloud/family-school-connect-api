'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const SupportService = require('../services/supportService');
const logger = require('../utils/logger');

class AdminSupportController {
  // HU-SOP-05: Bandeja de Tickets
  async obtenerBandejaTickets(req, res) {
    try {
      const { 
        estado, 
        categoria, 
        prioridad, 
        asignado_a, 
        pagina = 1, 
        limite = 20,
        busqueda 
      } = req.query;

      const where = {};
      
      if (estado) where.estado = estado;
      if (categoria) where.categoria = categoria;
      if (prioridad) where.prioridad = prioridad;
      if (asignado_a) where.asignado_a = asignado_a;
      
      if (busqueda) {
        where.OR = [
          { titulo: { contains: busqueda, mode: 'insensitive' } },
          { descripcion: { contains: busqueda, mode: 'insensitive' } },
          { numero_ticket: { contains: busqueda, mode: 'insensitive' } }
        ];
      }

      const [tickets, total] = await Promise.all([
        prisma.ticketSoporte.findMany({
          where,
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, rol: true, telefono: true }
            },
            asignado: {
              select: { id: true, nombre: true, apellido: true }
            },
            _count: {
              select: { respuestas: true }
            }
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
      logger.error('Error al obtener bandeja de tickets:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener los tickets' }
      });
    }
  }

  // HU-SOP-06: Obtener Ticket para Gestión
  async obtenerTicketGestion(req, res) {
    try {
      const { id } = req.params;

      const ticket = await prisma.ticketSoporte.findUnique({
        where: { id },
        include: {
          usuario: {
            select: { 
              id: true, 
              nombre: true, 
              apellido: true, 
              rol: true, 
              telefono: true,
              telefono: true 
            }
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

      // Calcular tiempo de respuesta
      const tiempo_respuesta = SupportService.calcularTiempoRespuesta(ticket.fecha_creacion);

      res.json({
        success: true,
        data: { 
          ticket: {
            ...ticket,
            tiempo_respuesta_horas: tiempo_respuesta
          }
        }
      });
    } catch (error) {
      logger.error('Error al obtener ticket para gestión:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el ticket' }
      });
    }
  }

  // HU-SOP-06: Responder a Ticket (Administrador)
  async responderTicketAdmin(req, res) {
    try {
      const { id } = req.params;
      const { contenido, estado_cambio, es_respuesta_publica = true } = req.body;
      const admin_id = req.user.id;

      // Validar que el ticket exista
      const ticket = await prisma.ticketSoporte.findUnique({
        where: { id }
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

      // Asignar ticket si no está asignado
      if (!ticket.asignado_a) {
        await prisma.ticketSoporte.update({
          where: { id },
          data: { 
            asignado_a: admin_id,
            fecha_asignacion: new Date()
          }
        });
      }

      // Crear respuesta
      const respuesta = await prisma.respuestaTicket.create({
        data: {
          ticket_id: id,
          usuario_id: admin_id,
          contenido: contenido.trim(),
          es_respuesta_publica,
          estado_cambio
        },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, rol: true }
          }
        }
      });

      // Actualizar estado del ticket si se especificó
      if (estado_cambio) {
        await prisma.ticketSoporte.update({
          where: { id },
          data: { estado: estado_cambio }
        });
      }

      // Notificar al usuario del ticket
      await SupportService.crearNotificacionRespuestaUsuario(ticket, respuesta);

      logger.info(`Respuesta de administrador agregada al ticket ${ticket.numero_ticket} por ${admin_id}`);

      res.status(201).json({
        success: true,
        data: { respuesta },
        message: 'Respuesta agregada exitosamente'
      });
    } catch (error) {
      logger.error('Error al responder ticket como administrador:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al agregar la respuesta' }
      });
    }
  }

  // HU-SOP-06: Cambiar Estado de Ticket
  async cambiarEstadoTicket(req, res) {
    try {
      const { id } = req.params;
      const { estado, motivo } = req.body;
      const admin_id = req.user.id;

      // Validar que el ticket exista
      const ticket = await prisma.ticketSoporte.findUnique({
        where: { id }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ticket no encontrado' }
        });
      }

      // Validar estado
      const estadosValidos = ['pendiente', 'en_progreso', 'esperando_respuesta', 'resuelto', 'cerrado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Estado no válido' }
        });
      }

      // Asignar ticket si no está asignado y se está cambiando a en_progreso
      if (!ticket.asignado_a && estado === 'en_progreso') {
        await prisma.ticketSoporte.update({
          where: { id },
          data: { 
            asignado_a: admin_id,
            fecha_asignacion: new Date()
          }
        });
      }

      // Actualizar estado
      const updateData = { estado };
      
      if (estado === 'resuelto') {
        updateData.fecha_resolucion = new Date();
      }

      await prisma.ticketSoporte.update({
        where: { id },
        data: updateData
      });

      // Crear respuesta interna si se proporcionó motivo
      if (motivo) {
        await prisma.respuestaTicket.create({
          data: {
            ticket_id: id,
            usuario_id: admin_id,
            contenido: `Cambio de estado a "${estado}": ${motivo}`,
            es_respuesta_publica: false,
            estado_cambio: estado
          }
        });
      }

      // Notificar al usuario del cambio de estado
      await SupportService.crearNotificacionCambioEstado(ticket, estado, motivo);

      logger.info(`Estado del ticket ${ticket.numero_ticket} cambiado a ${estado} por ${admin_id}`);

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error al cambiar estado del ticket:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al actualizar el estado' }
      });
    }
  }

  // HU-SOP-06: Resolver Ticket
  async resolverTicket(req, res) {
    try {
      const { id } = req.params;
      const { solucion, solicitar_calificacion = true } = req.body;
      const admin_id = req.user.id;

      // Validar que el ticket exista
      const ticket = await prisma.ticketSoporte.findUnique({
        where: { id }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ticket no encontrado' }
        });
      }

      // Validar solución
      if (!solucion || solucion.trim().length < 20) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'La solución debe tener al menos 20 caracteres' }
        });
      }

      // Asignar ticket si no está asignado
      if (!ticket.asignado_a) {
        await prisma.ticketSoporte.update({
          where: { id },
          data: { 
            asignado_a: admin_id,
            fecha_asignacion: new Date()
          }
        });
      }

      // Crear respuesta con la solución
      await prisma.respuestaTicket.create({
        data: {
          ticket_id: id,
          usuario_id: admin_id,
          contenido: `SOLUCIÓN: ${solucion.trim()}`,
          es_respuesta_publica: true,
          estado_cambio: 'resuelto'
        }
      });

      // Actualizar estado y fecha de resolución
      await prisma.ticketSoporte.update({
        where: { id },
        data: { 
          estado: 'resuelto',
          fecha_resolucion: new Date()
        }
      });

      // Notificar al usuario que el ticket ha sido resuelto
      await SupportService.crearNotificacionTicketResuelto(ticket, solucion, solicitar_calificacion);

      logger.info(`Ticket ${ticket.numero_ticket} resuelto por ${admin_id}`);

      res.json({
        success: true,
        message: 'Ticket resuelto exitosamente'
      });
    } catch (error) {
      logger.error('Error al resolver ticket:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al resolver el ticket' }
      });
    }
  }

  // HU-SOP-08: Obtener Estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const { periodo = 'mes' } = req.query;
      
      // Calcular fechas según el período
      const ahora = new Date();
      let fecha_inicio;
      
      switch (periodo) {
        case 'semana':
          fecha_inicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'mes':
          fecha_inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
          break;
        case 'trimestre':
          fecha_inicio = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1);
          break;
        case 'año':
          fecha_inicio = new Date(ahora.getFullYear(), 0, 1);
          break;
        default:
          fecha_inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      }

      const where = {
        fecha_creacion: {
          gte: fecha_inicio
        }
      };

      // Obtener estadísticas básicas
      const [
        totalTickets,
        ticketsPorEstado,
        ticketsPorCategoria,
        ticketsPorPrioridad,
        tiempoPromedioRespuesta,
        ticketsResueltos,
        satisfaccionPromedio
      ] = await Promise.all([
        prisma.ticketSoporte.count({ where }),
        
        prisma.ticketSoporte.groupBy({
          by: ['estado'],
          where,
          _count: { estado: true }
        }),
        
        prisma.ticketSoporte.groupBy({
          by: ['categoria'],
          where,
          _count: { categoria: true }
        }),
        
        prisma.ticketSoporte.groupBy({
          by: ['prioridad'],
          where,
          _count: { prioridad: true }
        }),
        
        prisma.ticketSoporte.aggregate({
          where: { ...where, tiempo_respuesta_horas: { not: null } },
          _avg: { tiempo_respuesta_horas: true }
        }),
        
        prisma.ticketSoporte.count({
          where: { ...where, estado: 'resuelto' }
        }),
        
        prisma.ticketSoporte.aggregate({
          where: { ...where, satisfaccion_usuario: { not: null } },
          _avg: { satisfaccion_usuario: true }
        })
      ]);

      // Calcular tasa de resolución
      const tasaResolucion = totalTickets > 0 ? (ticketsResueltos / totalTickets) * 100 : 0;

      res.json({
        success: true,
        data: {
          periodo,
          fecha_inicio,
          fecha_fin: ahora,
          totales: {
            tickets_creados: totalTickets,
            tickets_resueltos: ticketsResueltos,
            tasa_resolucion: Math.round(tasaResolucion * 100) / 100,
            tiempo_promedio_respuesta: tiempoPromedioRespuesta._avg.tiempo_respuesta_horas || 0,
            satisfaccion_promedio: satisfaccionPromedio._avg.satisfaccion_usuario || 0
          },
          por_estado: ticketsPorEstado,
          por_categoria: ticketsPorCategoria,
          por_prioridad: ticketsPorPrioridad
        }
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las estadísticas' }
      });
    }
  }

  // Asignar ticket a administrador
  async asignarTicket(req, res) {
    try {
      const { id } = req.params;
      const { administrador_id } = req.body;

      // Validar que el ticket exista
      const ticket = await prisma.ticketSoporte.findUnique({
        where: { id }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ticket no encontrado' }
        });
      }

      // Validar que el administrador exista y tenga rol de administrador
      const administrador = await prisma.usuario.findFirst({
        where: { 
          id: administrador_id, 
          rol: 'administrador',
          estado_activo: true
        }
      });

      if (!administrador) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_ADMIN', message: 'Administrador no válido' }
        });
      }

      // Asignar ticket
      await prisma.ticketSoporte.update({
        where: { id },
        data: { 
          asignado_a: administrador_id,
          fecha_asignacion: new Date()
        }
      });

      // Notificar al administrador asignado
      await SupportService.crearNotificacionAsignacion(ticket, administrador);

      logger.info(`Ticket ${ticket.numero_ticket} asignado a ${administrador_id}`);

      res.json({
        success: true,
        message: 'Ticket asignado exitosamente'
      });
    } catch (error) {
      logger.error('Error al asignar ticket:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al asignar el ticket' }
      });
    }
  }
}

module.exports = new AdminSupportController();