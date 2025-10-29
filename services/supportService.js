'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

class SupportService {
  // Validar datos de ticket
  static validarDatosTicket(datos) {
    const errores = [];

    if (!datos.titulo || datos.titulo.length < 10 || datos.titulo.length > 200) {
      errores.push('El título debe tener entre 10 y 200 caracteres');
    }

    if (!datos.descripcion || datos.descripcion.length < 20 || datos.descripcion.length > 1000) {
      errores.push('La descripción debe tener entre 20 y 1000 caracteres');
    }

    if (!datos.categoria) {
      errores.push('La categoría es requerida');
    }

    const categoriasValidas = ['acceso_plataforma', 'funcionalidad_academica', 'comunicaciones', 'reportes', 'sugerencias', 'errores_sistema', 'otros'];
    if (datos.categoria && !categoriasValidas.includes(datos.categoria)) {
      errores.push('Categoría no válida');
    }

    if (datos.prioridad) {
      const prioridadesValidas = ['baja', 'normal', 'alta', 'critica'];
      if (!prioridadesValidas.includes(datos.prioridad)) {
        errores.push('Prioridad no válida');
      }
    }

    return errores;
  }

  // Obtener categorías disponibles
  static obtenerCategoriasDisponibles() {
    return [
      { valor: 'acceso_plataforma', nombre: 'Acceso a la Plataforma', icono: 'login', color: '#4CAF50' },
      { valor: 'funcionalidad_academica', nombre: 'Funcionalidad Académica', icono: 'school', color: '#2196F3' },
      { valor: 'comunicaciones', nombre: 'Comunicaciones', icono: 'chat', color: '#FF9800' },
      { valor: 'reportes', nombre: 'Reportes y Estadísticas', icono: 'assessment', color: '#9C27B0' },
      { valor: 'sugerencias', nombre: 'Sugerencias', icono: 'lightbulb', color: '#607D8B' },
      { valor: 'errores_sistema', nombre: 'Errores del Sistema', icono: 'bug_report', color: '#F44336' },
      { valor: 'otros', nombre: 'Otros', icono: 'more_horiz', color: '#795548' }
    ];
  }

  // Generar número de ticket único
  static async generarNumeroTicket() {
    const año = new Date().getFullYear();
    const prefijo = `#SOP-${año}`;
    
    const ultimoTicket = await prisma.ticketSoporte.findFirst({
      where: { numero_ticket: { startsWith: prefijo } },
      orderBy: { numero_ticket: 'desc' }
    });

    if (!ultimoTicket) {
      return `${prefijo}-0001`;
    }

    const ultimoNumero = parseInt(ultimoTicket.numero_ticket.split('-')[2]);
    const siguienteNumero = String(ultimoNumero + 1).padStart(4, '0');
    
    return `${prefijo}-${siguienteNumero}`;
  }

  // Calcular tiempo de respuesta en horas
  static calcularTiempoRespuesta(fechaCreacion) {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diferencia = ahora - creacion;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    return horas;
  }

  // Verificar permisos de usuario sobre ticket
  static async verificarPermisosTicket(ticketId, usuarioId, rol) {
    const ticket = await prisma.ticketSoporte.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return { tieneAcceso: false, motivo: 'Ticket no encontrado' };
    }

    // Si es administrador, tiene acceso
    if (rol === 'administrador') {
      return { tieneAcceso: true };
    }

    // Si es el dueño del ticket, tiene acceso
    if (ticket.usuario_id === usuarioId) {
      return { tieneAcceso: true };
    }

    return { tieneAcceso: false, motivo: 'No tienes permisos para ver este ticket' };
  }

  // Crear notificaciones para administradores cuando se crea un ticket
  static async crearNotificacionAdministradores(ticket) {
    try {
      // Obtener todos los administradores activos
      const administradores = await prisma.usuario.findMany({
        where: { 
          rol: 'administrador',
          estado_activo: true
        },
        select: { id: true }
      });

      // Crear notificación para cada administrador
      const notificaciones = administradores.map(admin => ({
        usuario_id: admin.id,
        tipo: 'ticket',
        titulo: 'Nuevo Ticket de Soporte',
        contenido: `Se ha creado un nuevo ticket: ${ticket.numero_ticket} - ${ticket.titulo}`,
        canal: 'plataforma',
        referencia_id: ticket.id,
        tipo_referencia: 'ticket',
        año_academico: ticket.año_academico,
        ticket_id: ticket.id,
        url_destino: `/soporte/admin/tickets/${ticket.id}`
      }));

      if (notificaciones.length > 0) {
        await prisma.notificacion.createMany({
          data: notificaciones
        });

        logger.info(`Notificaciones creadas para ${administradores.length} administradores sobre ticket ${ticket.numero_ticket}`);
      }
    } catch (error) {
      logger.error('Error al crear notificaciones de administradores:', error);
    }
  }

  // Crear notificación cuando un usuario responde a un ticket
  static async crearNotificacionRespuesta(ticket, respuesta) {
    try {
      if (!ticket.asignado_a) return;

      await prisma.notificacion.create({
        data: {
          usuario_id: ticket.asignado_a,
          tipo: 'ticket',
          titulo: 'Nueva Respuesta en Ticket',
          contenido: `El usuario ha respondido al ticket ${ticket.numero_ticket}: ${respuesta.contenido.substring(0, 100)}...`,
          canal: 'plataforma',
          referencia_id: ticket.id,
          tipo_referencia: 'ticket',
          año_academico: ticket.año_academico,
          ticket_id: ticket.id,
          url_destino: `/soporte/admin/tickets/${ticket.id}`
        }
      });

      logger.info(`Notificación de respuesta creada para administrador ${ticket.asignado_a} sobre ticket ${ticket.numero_ticket}`);
    } catch (error) {
      logger.error('Error al crear notificación de respuesta:', error);
    }
  }

  // Crear notificación al usuario cuando un administrador responde
  static async crearNotificacionRespuestaUsuario(ticket, respuesta) {
    try {
      await prisma.notificacion.create({
        data: {
          usuario_id: ticket.usuario_id,
          tipo: 'ticket',
          titulo: 'Nueva Respuesta en su Ticket',
          contenido: `Han respondido a su ticket ${ticket.numero_ticket}: ${respuesta.contenido.substring(0, 100)}...`,
          canal: 'plataforma',
          referencia_id: ticket.id,
          tipo_referencia: 'ticket',
          año_academico: ticket.año_academico,
          ticket_id: ticket.id,
          url_destino: `/soporte/tickets/${ticket.id}`
        }
      });

      logger.info(`Notificación de respuesta creada para usuario ${ticket.usuario_id} sobre ticket ${ticket.numero_ticket}`);
    } catch (error) {
      logger.error('Error al crear notificación de respuesta al usuario:', error);
    }
  }

  // Crear notificación de cambio de estado
  static async crearNotificacionCambioEstado(ticket, nuevoEstado, motivo) {
    try {
      let contenido = `El estado de su ticket ${ticket.numero_ticket} ha cambiado a: ${nuevoEstado}`;
      
      if (motivo) {
        contenido += `\nMotivo: ${motivo}`;
      }

      await prisma.notificacion.create({
        data: {
          usuario_id: ticket.usuario_id,
          tipo: 'ticket',
          titulo: 'Cambio de Estado en Ticket',
          contenido,
          canal: 'plataforma',
          referencia_id: ticket.id,
          tipo_referencia: 'ticket',
          año_academico: ticket.año_academico,
          ticket_id: ticket.id,
          url_destino: `/soporte/tickets/${ticket.id}`
        }
      });

      logger.info(`Notificación de cambio de estado creada para usuario ${ticket.usuario_id} sobre ticket ${ticket.numero_ticket}`);
    } catch (error) {
      logger.error('Error al crear notificación de cambio de estado:', error);
    }
  }

  // Crear notificación cuando un ticket es resuelto
  static async crearNotificacionTicketResuelto(ticket, solucion, solicitarCalificacion) {
    try {
      let contenido = `Su ticket ${ticket.numero_ticket} ha sido resuelto.\n\nSolución: ${solucion}`;
      
      if (solicitarCalificacion) {
        contenido += '\n\nPor favor, califique la atención recibida.';
      }

      await prisma.notificacion.create({
        data: {
          usuario_id: ticket.usuario_id,
          tipo: 'ticket',
          titulo: 'Ticket Resuelto',
          contenido,
          canal: 'plataforma',
          referencia_id: ticket.id,
          tipo_referencia: 'ticket',
          año_academico: ticket.año_academico,
          ticket_id: ticket.id,
          url_destino: `/soporte/tickets/${ticket.id}`
        }
      });

      logger.info(`Notificación de ticket resuelto creada para usuario ${ticket.usuario_id} sobre ticket ${ticket.numero_ticket}`);
    } catch (error) {
      logger.error('Error al crear notificación de ticket resuelto:', error);
    }
  }

  // Crear notificación de asignación de ticket
  static async crearNotificacionAsignacion(ticket, administrador) {
    try {
      await prisma.notificacion.create({
        data: {
          usuario_id: administrador.id,
          tipo: 'ticket',
          titulo: 'Ticket Asignado',
          contenido: `Se le ha asignado el ticket ${ticket.numero_ticket}: ${ticket.titulo}`,
          canal: 'plataforma',
          referencia_id: ticket.id,
          tipo_referencia: 'ticket',
          año_academico: ticket.año_academico,
          ticket_id: ticket.id,
          url_destino: `/soporte/admin/tickets/${ticket.id}`
        }
      });

      logger.info(`Notificación de asignación creada para administrador ${administrador.id} sobre ticket ${ticket.numero_ticket}`);
    } catch (error) {
      logger.error('Error al crear notificación de asignación:', error);
    }
  }

  // Obtener estadísticas de tickets por período
  static async obtenerEstadisticasPorPeriodo(fechaInicio, fechaFin) {
    try {
      const where = {
        fecha_creacion: {
          gte: fechaInicio,
          lte: fechaFin
        }
      };

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

      return {
        total: totalTickets,
        resueltos: ticketsResueltos,
        tasaResolucion: totalTickets > 0 ? (ticketsResueltos / totalTickets) * 100 : 0,
        tiempoPromedioRespuesta: tiempoPromedioRespuesta._avg.tiempo_respuesta_horas || 0,
        satisfaccionPromedio: satisfaccionPromedio._avg.satisfaccion_usuario || 0,
        porEstado: ticketsPorEstado,
        porCategoria: ticketsPorCategoria,
        porPrioridad: ticketsPorPrioridad
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas por período:', error);
      throw error;
    }
  }

  // Actualizar tiempo de respuesta de tickets
  static async actualizarTiempoRespuesta(ticketId) {
    try {
      const ticket = await prisma.ticketSoporte.findUnique({
        where: { id: ticketId },
        select: { fecha_creacion: true }
      });

      if (!ticket) return;

      const tiempoRespuesta = this.calcularTiempoRespuesta(ticket.fecha_creacion);

      await prisma.ticketSoporte.update({
        where: { id: ticketId },
        data: { tiempo_respuesta_horas: tiempoRespuesta }
      });

      return tiempoRespuesta;
    } catch (error) {
      logger.error('Error al actualizar tiempo de respuesta:', error);
      throw error;
    }
  }
}

module.exports = SupportService;