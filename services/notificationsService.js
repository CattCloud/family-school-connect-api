'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Servicio especializado para generar notificaciones automáticas
 * para los módulos de calificaciones y asistencias
 */
class NotificationsService {

  /**
   * Crear notificaciones para padres cuando se registran calificaciones
   */
  static async crearNotificacionesCalificaciones(evaluaciones, contexto) {
    try {
      if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
        return { notificaciones_creadas: 0, alertas_bajo_rendimiento: 0 };
      }

      const notificaciones = [];
      let alertasBajoRendimiento = 0;

      // Obtener información de estudiantes y sus padres
      const estudiantesIds = [...new Set(evaluaciones.map(e => e.estudiante_id))];
      const relacionesFamiliares = await prisma.relacionesFamiliares.findMany({
        where: {
          estudiante_id: { in: estudiantesIds },
          estado_activo: true,
          año_academico: contexto.año_academico
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              codigo_estudiante: true
            }
          },
          apoderado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              telefono: true
            }
          }
        }
      });

      // Crear un mapa de estudiante_id -> lista de padres
      const estudianteToPadres = new Map();
      relacionesFamiliares.forEach(rel => {
        if (!estudianteToPadres.has(rel.estudiante_id)) {
          estudianteToPadres.set(rel.estudiante_id, []);
        }
        estudianteToPadres.get(rel.estudiante_id).push(rel);
      });

      // Procesar cada evaluación
      for (const evaluacion of evaluaciones) {
        const padres = estudianteToPadres.get(evaluacion.estudiante_id) || [];
        const calificacion = Number(evaluacion.calificacion_numerica);
        
        if (padres.length === 0) {
          continue; // Sin padres vinculados, saltar
        }

        // Determinar tipo de notificación según calificación
        let tipoNotificacion, titulo, contenido, esBajoRendimiento = false;

        if (calificacion < 11) {
          // Alerta de bajo rendimiento
          esBajoRendimiento = true;
          alertasBajoRendimiento++;
          tipoNotificacion = 'calificacion_bajo_rendimiento';
          titulo = '🔴 Alerta: Calificación Baja Registrada';
          contenido = `Su hijo(a) ${padres[0].estudiante.nombre} ${padres[0].estudiante.apellido} ha obtenido una calificación de ${calificacion} en ${contexto.componente || 'un componente'} del trimestre ${contexto.trimestre}. Se recomienda contactar al docente para apoyo adicional.`;
        } else {
          // Confirmación de nota subida
          tipoNotificacion = 'calificacion_registrada';
          titulo = '✅ Nueva Calificación Registrada';
          contenido = `Se ha registrado una nueva calificación para su hijo(a) ${padres[0].estudiante.nombre} ${padres[0].estudiante.apellido}: ${calificacion} (${evaluacion.calificacion_letra}) en ${contexto.componente || 'un componente'} del trimestre ${contexto.trimestre}.`;
        }

        // Crear notificación para cada padre del estudiante
        for (const relacion of padres) {
          notificaciones.push({
            usuario_id: relacion.apoderado.id,
            tipo: 'calificacion',
            titulo,
            contenido,
            canal: 'ambos', // plataforma + whatsapp
            estado_plataforma: 'pendiente',
            url_destino: `/dashboard/calificaciones/estudiante/${evaluacion.estudiante_id}?año=${contexto.año_academico}&trimestre=${contexto.trimestre}`,
            estudiante_id: evaluacion.estudiante_id,
            año_academico: contexto.año_academico,
            datos_adicionales: {
              tipo_alerta: tipoNotificacion,
              calificacion: calificacion,
              calificacion_letra: evaluacion.calificacion_letra,
              componente: contexto.componente,
              trimestre: contexto.trimestre,
              curso: contexto.curso,
              es_bajo_rendimiento: esBajoRendimiento
            }
          });
        }
      }

      // Insertar notificaciones en lote
      let notificacionesCreadas = 0;
      if (notificaciones.length > 0) {
        await prisma.notificacion.createMany({
          data: notificaciones
        });
        notificacionesCreadas = notificaciones.length;
        
        logger.info(`Se generaron ${notificacionesCreadas} notificaciones de calificaciones para ${new Set(notificaciones.map(n => n.usuario_id)).size} padres`, {
          curso: contexto.curso,
          trimestre: contexto.trimestre,
          alertas_bajo_rendimiento: alertasBajoRendimiento
        });
      }

      return {
        notificaciones_creadas: notificacionesCreadas,
        alertas_bajo_rendimiento: alertasBajoRendimiento,
        padres_notificados: new Set(notificaciones.map(n => n.usuario_id)).size
      };

    } catch (error) {
      logger.error('Error al crear notificaciones de calificaciones:', error);
      throw error;
    }
  }

  /**
   * Crear notificaciones para padres cuando se registra asistencia
   */
  static async crearNotificacionesAsistencia(asistencias, contexto) {
    try {
      if (!Array.isArray(asistencias) || asistencias.length === 0) {
        return { notificaciones_creadas: 0, alertas_criticas: 0, alertas_tardanza: 0 };
      }

      const notificaciones = [];
      let alertasCriticas = 0;
      let alertasTardanza = 0;

      // Obtener información de estudiantes y sus padres
      const estudiantesIds = [...new Set(asistencias.map(a => a.estudiante_id))];
      const relacionesFamiliares = await prisma.relacionesFamiliares.findMany({
        where: {
          estudiante_id: { in: estudiantesIds },
          estado_activo: true,
          año_academico: contexto.año_academico
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              codigo_estudiante: true
            }
          },
          apoderado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              telefono: true
            }
          }
        }
      });

      // Crear un mapa de estudiante_id -> lista de padres
      const estudianteToPadres = new Map();
      relacionesFamiliares.forEach(rel => {
        if (!estudianteToPadres.has(rel.estudiante_id)) {
          estudianteToPadres.set(rel.estudiante_id, []);
        }
        estudianteToPadres.get(rel.estudiante_id).push(rel);
      });

      // Procesar cada registro de asistencia
      for (const asistencia of asistencias) {
        const padres = estudianteToPadres.get(asistencia.estudiante_id) || [];
        
        if (padres.length === 0) {
          continue; // Sin padres vinculados, saltar
        }

        const estudiante = padres[0].estudiante;
        let tipoNotificacion, titulo, contenido, esAlertaCritica = false;

        // Determinar tipo de notificación según estado de asistencia
        switch (asistencia.estado) {
          case 'presente':
            // Confirmación diaria simple
            tipoNotificacion = 'asistencia_presente';
            titulo = '✅ Asistencia Confirmada';
            contenido = `Su hijo(a) ${estudiante.nombre} ${estudiante.apellido} asistió puntualmente a clases el ${contexto.fecha}.`;
            break;

          case 'tardanza':
            // Alerta inmediata de tardanza
            tipoNotificacion = 'asistencia_tardanza';
            titulo = '🟡 Alerta: Tardanza Registrada';
            contenido = `Su hijo(a) ${estudiante.nombre} ${estudiante.apellido} llegó tarde a clases el ${contexto.fecha}${asistencia.hora_llegada ? ` (hora de llegada: ${asistencia.hora_llegada})` : ''}. Por favor, verifique su puntualidad.`;
            alertasTardanza++;
            break;

          case 'falta_injustificada':
            // Alerta inmediata - solicitud de justificación
            tipoNotificacion = 'asistencia_falta_injustificada';
            titulo = '🔴 Alerta: Falta Injustificada';
            contenido = `Su hijo(a) ${estudiante.nombre} ${estudiante.apellido} no asistió a clases el ${contexto.fecha}. Por favor, proporcione la justificación correspondiente contactando a la institución.`;
            esAlertaCritica = true;
            alertasCriticas++;
            break;

          case 'permiso':
            // Confirmación de permiso
            tipoNotificacion = 'asistencia_permiso';
            titulo = '🔵 Permiso Registrado';
            contenido = `Se ha registrado el permiso de su hijo(a) ${estudiante.nombre} ${estudiante.apellido} para el ${contexto.fecha}${asistencia.justificacion ? `. Motivo: ${asistencia.justificacion}` : ''}.`;
            break;

          case 'falta_justificada':
            // Confirmación de falta justificada
            tipoNotificacion = 'asistencia_falta_justificada';
            titulo = '🟠 Falta Justificada';
            contenido = `Se ha registrado una falta justificada para su hijo(a) ${estudiante.nombre} ${estudiante.apellido} el ${contexto.fecha}${asistencia.justificacion ? `. Motivo: ${asistencia.justificacion}` : ''}.`;
            break;

          default:
            continue; // Estado no reconocido, saltar
        }

        // Crear notificación para cada padre del estudiante
        for (const relacion of padres) {
          notificaciones.push({
            usuario_id: relacion.apoderado.id,
            tipo: 'asistencia',
            titulo,
            contenido,
            canal: esAlertaCritica ? 'ambos' : 'plataforma', // Alertas críticas van por ambos canales
            estado_plataforma: 'pendiente',
            url_destino: `/dashboard/asistencia/estudiante/${asistencia.estudiante_id}?fecha=${contexto.fecha}`,
            estudiante_id: asistencia.estudiante_id,
            año_academico: contexto.año_academico,
            datos_adicionales: {
              tipo_alerta: tipoNotificacion,
              estado_asistencia: asistencia.estado,
              fecha: contexto.fecha,
              hora_llegada: asistencia.hora_llegada || null,
              justificacion: asistencia.justificacion || null,
              es_alerta_critica: esAlertaCritica
            }
          });
        }
      }

      // Verificar patrones críticos para cada estudiante
      await this.verificarPatronesCriticosAsistencia(estudiantesIds, contexto, notificaciones);

      // Insertar notificaciones en lote
      let notificacionesCreadas = 0;
      if (notificaciones.length > 0) {
        await prisma.notificacion.createMany({
          data: notificaciones
        });
        notificacionesCreadas = notificaciones.length;
        
        logger.info(`Se generaron ${notificacionesCreadas} notificaciones de asistencia para ${new Set(notificaciones.map(n => n.usuario_id)).size} padres`, {
          fecha: contexto.fecha,
          alertas_criticas: alertasCriticas,
          alertas_tardanza: alertasTardanza
        });
      }

      return {
        notificaciones_creadas: notificacionesCreadas,
        alertas_criticas: alertasCriticas,
        alertas_tardanza: alertasTardanza,
        padres_notificados: new Set(notificaciones.map(n => n.usuario_id)).size
      };

    } catch (error) {
      logger.error('Error al crear notificaciones de asistencia:', error);
      throw error;
    }
  }

  /**
   * Verificar patrones críticos de asistencia y generar alertas adicionales
   */
  static async verificarPatronesCriticosAsistencia(estudiantesIds, contexto, notificaciones) {
    try {
      const fechaActual = new Date(contexto.fecha);
      
      for (const estudianteId of estudiantesIds) {
        // Verificar patrón crítico: 3 faltas injustificadas consecutivas
        await this.verificarFaltasConsecutivas(estudianteId, fechaActual, contexto, notificaciones);
        
        // Verificar patrón acumulado: 5 tardanzas en un trimestre
        await this.verificarTardanzasAcumuladas(estudianteId, fechaActual, contexto, notificaciones);
      }
    } catch (error) {
      logger.error('Error al verificar patrones críticos de asistencia:', error);
    }
  }

  /**
   * Verificar faltas injustificadas consecutivas (3 o más)
   */
  static async verificarFaltasConsecutivas(estudianteId, fechaActual, contexto, notificaciones) {
    try {
      // Obtener últimos 7 días de asistencia del estudiante
      const fechaInicio = new Date(fechaActual);
      fechaInicio.setDate(fechaInicio.getDate() - 7);

      const asistenciasRecientes = await prisma.asistencia.findMany({
        where: {
          estudiante_id: estudianteId,
          año_academico: contexto.año_academico,
          fecha: {
            gte: fechaInicio,
            lte: fechaActual
          }
        },
        orderBy: { fecha: 'desc' },
        take: 5
      });

      // Contar faltas injustificadas consecutivas desde la fecha más reciente
      let faltasConsecutivas = 0;
      for (const asistencia of asistenciasRecientes) {
        if (asistencia.estado === 'falta_injustificada') {
          faltasConsecutivas++;
        } else {
          break; // Se rompe la secuencia
        }
      }

      // Si tiene 3 o más faltas consecutivas, generar alerta crítica
      if (faltasConsecutivas >= 3) {
        const relacionesFamiliares = await prisma.relacionesFamiliares.findMany({
          where: {
            estudiante_id: estudianteId,
            estado_activo: true,
            año_academico: contexto.año_academico
          },
          include: {
            estudiante: {
              select: { nombre: true, apellido: true }
            },
            apoderado: {
              select: { id: true }
            }
          }
        });

        for (const relacion of relacionesFamiliares) {
          notificaciones.push({
            usuario_id: relacion.apoderado.id,
            tipo: 'asistencia',
            titulo: '🚨 ALERTA CRÍTICA: Faltas Consecutivas',
            contenido: `Su hijo(a) ${relacion.estudiante.nombre} ${relacion.estudiante.apellido} tiene ${faltasConsecutivas} faltas injustificadas consecutivas. Es urgente contactar a la institución para regularizar su asistencia.`,
            canal: 'ambos', // Ambos canales para alertas críticas
            estado_plataforma: 'pendiente',
            url_destino: `/dashboard/asistencia/estudiante/${estudianteId}`,
            estudiante_id: estudianteId,
            año_academico: contexto.año_academico,
            datos_adicionales: {
              tipo_alerta: 'faltas_consecutivas_criticas',
              faltas_consecutivas: faltasConsecutivas,
              fecha_ultima_falta: fechaActual.toISOString().slice(0, 10),
              es_alerta_critica: true
            }
          });
        }
      }
    } catch (error) {
      logger.error('Error al verificar faltas consecutivas:', error);
    }
  }

  /**
   * Verificar tardanzas acumuladas en trimestre (5 o más)
   */
  static async verificarTardanzasAcumuladas(estudianteId, fechaActual, contexto, notificaciones) {
    try {
      // Definir rango del trimestre
      const año = fechaActual.getFullYear();
      let fechaInicioTrimestre, fechaFinTrimestre;
      
      // Simplificado: cada trimestre son ~3 meses
      if (contexto.trimestre === 1) {
        fechaInicioTrimestre = new Date(año, 2, 1); // Marzo
        fechaFinTrimestre = new Date(año, 4, 31); // Mayo
      } else if (contexto.trimestre === 2) {
        fechaInicioTrimestre = new Date(año, 5, 1); // Junio
        fechaFinTrimestre = new Date(año, 8, 15); // Septiembre
      } else if (contexto.trimestre === 3) {
        fechaInicioTrimestre = new Date(año, 8, 16); // Septiembre
        fechaFinTrimestre = new Date(año, 11, 20); // Diciembre
      }

      const tardanzasTrimestre = await prisma.asistencia.count({
        where: {
          estudiante_id: estudianteId,
          estado: 'tardanza',
          año_academico: contexto.año_academico,
          fecha: {
            gte: fechaInicioTrimestre,
            lte: fechaFinTrimestre
          }
        }
      });

      // Si tiene 5 o más tardanzas, generar alerta preventiva
      if (tardanzasTrimestre >= 5) {
        const relacionesFamiliares = await prisma.relacionesFamiliares.findMany({
          where: {
            estudiante_id: estudianteId,
            estado_activo: true,
            año_academico: contexto.año_academico
          },
          include: {
            estudiante: {
              select: { nombre: true, apellido: true }
            },
            apoderado: {
              select: { id: true }
            }
          }
        });

        for (const relacion of relacionesFamiliares) {
          notificaciones.push({
            usuario_id: relacion.apoderado.id,
            tipo: 'asistencia',
            titulo: '⚠️ Alerta: Tardanzas Acumuladas',
            contenido: `Su hijo(a) ${relacion.estudiante.nombre} ${relacion.estudiante.apellido} ha acumulado ${tardanzasTrimestre} tardanzas en el trimestre ${contexto.trimestre}. Se recomienda reforzar los hábitos de puntualidad.`,
            canal: 'ambos',
            estado_plataforma: 'pendiente',
            url_destino: `/dashboard/asistencia/estudiante/${estudianteId}?año=${contexto.año_academico}&trimestre=${contexto.trimestre}`,
            estudiante_id: estudianteId,
            año_academico: contexto.año_academico,
            datos_adicionales: {
              tipo_alerta: 'tardanzas_acumuladas_trimestre',
              tardanzas_acumuladas: tardanzasTrimestre,
              trimestre: contexto.trimestre,
              fecha_actual: fechaActual.toISOString().slice(0, 10)
            }
          });
        }
      }
    } catch (error) {
      logger.error('Error al verificar tardanzas acumuladas:', error);
    }
  }

  /**
   * Obtener resumen de notificaciones generadas para logging/debug
   */
  static async obtenerResumenNotificaciones(fechaInicio, fechaFin, tipos = []) {
    try {
      const where = {
        fecha_creacion: {
          gte: fechaInicio,
          lte: fechaFin
        }
      };

      if (tipos.length > 0) {
        where.tipo = { in: tipos };
      }

      const [
        totalNotificaciones,
        notificacionesPorTipo,
        notificacionesPorCanal
      ] = await Promise.all([
        prisma.notificacion.count({ where }),
        prisma.notificacion.groupBy({
          by: ['tipo'],
          where,
          _count: { tipo: true }
        }),
        prisma.notificacion.groupBy({
          by: ['canal'],
          where,
          _count: { canal: true }
        })
      ]);

      return {
        total: totalNotificaciones,
        por_tipo: notificacionesPorTipo,
        por_canal: notificacionesPorCanal,
        periodo: {
          inicio: fechaInicio.toISOString(),
          fin: fechaFin.toISOString()
        }
      };
    } catch (error) {
      logger.error('Error al obtener resumen de notificaciones:', error);
      return null;
    }
  }
}

module.exports = NotificationsService;