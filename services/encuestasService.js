const { PrismaClient } = require('@prisma/client');
const { success, error, notFound, conflict, badRequest } = require('../utils/response');
const { z } = require('zod');

const prisma = new PrismaClient();

// Esquemas de validación con Zod
const crearEncuestaSchema = z.object({
  titulo: z.string().min(3).max(200),
  descripcion: z.string().min(10),
  fecha_inicio: z.string().datetime().optional(),
  fecha_vencimiento: z.string().datetime().optional(),
  permite_respuesta_multiple: z.boolean().default(false),
  es_anonima: z.boolean().default(false),
  mostrar_resultados: z.boolean().default(true),
  año_academico: z.number().int().positive(),
  preguntas: z.array(z.object({
    texto: z.string().min(3),
    tipo: z.enum(['texto_corto', 'texto_largo', 'opcion_unica', 'opcion_multiple', 'escala_1_5']),
    obligatoria: z.boolean().default(false),
    orden: z.number().int().positive(),
    opciones: z.array(z.object({
      texto: z.string().min(1),
      orden: z.number().int().positive()
    })).optional()
  })).min(1)
});

const responderEncuestaSchema = z.object({
  encuesta_id: z.string().uuid(),
  estudiante_id: z.string().uuid().optional(),
  respuestas: z.array(z.object({
    pregunta_id: z.string().uuid(),
    valor_texto: z.string().optional(),
    valor_opcion_id: z.string().uuid().optional(),
    valor_opciones: z.array(z.string().uuid()).optional(),
    valor_escala: z.number().int().min(1).max(5).optional()
  })).min(1),
  tiempo_respuesta_minutos: z.number().int().positive().optional()
});

const obtenerEncuestasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  estado: z.enum(['todos', 'activas', 'respondidas', 'vencidas']).default('todos'),
  tipo: z.enum(['todos', 'institucionales', 'propias']).default('todos'),
  autor_id: z.string().uuid().optional(),
  busqueda: z.string().min(2).optional(),
  ordenamiento: z.enum(['mas_reciente', 'mas_antiguo', 'por_vencimiento', 'por_nombre']).default('mas_reciente')
});

class EncuestasService {
  // Método para crear una nueva encuesta
  async crearEncuesta(datosEncuesta, usuarioId, usuarioRol) {
    try {
      // Verificar permisos para crear encuestas
      if (usuarioRol !== 'director' && usuarioRol !== 'docente') {
        return {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para crear encuestas'
          }
        };
      }
      
      // Si es docente, verificar que tenga permisos
      if (usuarioRol === 'docente') {
        const permisoDocente = await prisma.permisoDocente.findFirst({
          where: {
            docente_id: usuarioId,
            tipo_permiso: 'encuestas',
            estado_activo: true,
            año_academico: datosEncuesta.año_academico || 2025
          }
        });
        
        if (!permisoDocente) {
          return {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'No tienes permisos para crear encuestas este año académico'
            }
          };
        }
      }
      
      // Validar datos de entrada
      const datosValidados = crearEncuestaSchema.parse(datosEncuesta);
      
      const {
        titulo,
        descripcion,
        fecha_inicio,
        fecha_vencimiento,
        permite_respuesta_multiple,
        es_anonima,
        mostrar_resultados,
        año_academico,
        preguntas
      } = datosValidados;
      
      // Crear la encuesta
      const nuevaEncuesta = await prisma.encuesta.create({
        data: {
          titulo,
          descripcion,
          fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date(),
          fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
          permite_respuesta_multiple: permite_respuesta_multiple || false,
          es_anonima: es_anonima || false,
          mostrar_resultados: mostrar_resultados || true,
          año_academico: año_academico || 2025,
          estado: 'activa',
          autor_id: usuarioId,
          fecha_creacion: new Date()
        }
      });
      
      // Crear las preguntas
      for (const pregunta of preguntas) {
        const nuevaPregunta = await prisma.preguntaEncuesta.create({
          data: {
            encuesta_id: nuevaEncuesta.id,
            texto: pregunta.texto,
            tipo: pregunta.tipo,
            obligatoria: pregunta.obligatoria || false,
            orden: pregunta.orden
          }
        });
        
        // Crear las opciones si las hay
        if (pregunta.opciones && pregunta.opciones.length > 0) {
          for (const opcion of pregunta.opciones) {
            await prisma.opcionPregunta.create({
              data: {
                pregunta_id: nuevaPregunta.id,
                texto: opcion.texto,
                orden: opcion.orden
              }
            });
          }
        }
      }
      
      // Obtener la encuesta creada con todas las relaciones
      const encuestaCompleta = await prisma.encuesta.findUnique({
        where: {
          id: nuevaEncuesta.id
        },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true
            }
          },
          preguntas: {
            include: {
              opciones: {
                orderBy: {
                  orden: 'asc'
                }
              }
            },
            orderBy: {
              orden: 'asc'
            }
          }
        }
      });
      
      return {
        success: true,
        data: {
          encuesta: encuestaCompleta,
          mensaje: 'Encuesta creada exitosamente'
        }
      };
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        return badRequest('Datos inválidos', err.errors);
      }
      console.error('Error al crear encuesta:', err);
      return error('Error al crear encuesta');
    }
  }
  
  // Método para obtener encuestas del usuario con segmentación automática
  async obtenerEncuestas(usuarioId, usuarioRol, opciones = {}) {
    try {
      // Validar opciones con Zod
      const opcionesValidadas = obtenerEncuestasSchema.parse(opciones);
      
      const {
        page,
        limit,
        estado,
        tipo,
        autor_id,
        busqueda,
        ordenamiento
      } = opcionesValidadas;

      const skip = (page - 1) * limit;
      
      // Construir filtros base
      let whereClause = {};
      
      // Filtro por estado
      if (estado !== 'todos') {
        const estadoMap = {
          'activas': 'activa',
          'vencidas': 'vencida',
          'respondidas': 'respondida'
        };
        
        if (estado === 'respondidas') {
          // Para encuestas respondidas, necesitamos un enfoque diferente
          whereClause.respuestas = {
            some: {
              usuario_id: usuarioId
            }
          };
        } else {
          whereClause.estado = estadoMap[estado];
        }
      }
      
      // Filtro por tipo (propias vs institucionales)
      if (tipo === 'propias') {
        whereClause.autor_id = usuarioId;
      } else if (tipo === 'institucionales' && usuarioRol !== 'director') {
        whereClause.autor_id = {
          not: usuarioId
        };
      }
      
      // Filtro por autor (solo para directores)
      if (autor_id && usuarioRol === 'director') {
        whereClause.autor_id = autor_id;
      }
      
      // Filtro por búsqueda
      if (busqueda) {
        whereClause.OR = [
          {
            titulo: {
              contains: busqueda,
              mode: 'insensitive'
            }
          },
          {
            descripcion: {
              contains: busqueda,
              mode: 'insensitive'
            }
          }
        ];
      }
      
      // Aplicar segmentación automática según rol del usuario
      if (usuarioRol === 'apoderado') {
        // Obtener los niveles/grados de los hijos del padre
        const hijosDelPadre = await prisma.relacionesFamiliares.findMany({
          where: {
            apoderado_id: usuarioId,
            estado_activo: true
          },
          include: {
            estudiante: {
              include: {
                nivel_grado: true
              }
            }
          }
        });
        
        if (hijosDelPadre.length === 0) {
          return {
            success: false,
            error: {
              code: 'NO_STUDENTS_FOUND',
              message: 'No se encontraron estudiantes asociados a este usuario'
            }
          };
        }
        
        // Extraer niveles y grados únicos
        const niveles = [...new Set(hijosDelPadre.map(h => h.estudiante.nivel_grado.nivel))];
        const grados = [...new Set(hijosDelPadre.map(h => h.estudiante.nivel_grado.grado))];
        
        // Aplicar filtro de segmentación
        whereClause.estado = 'activa'; // Solo encuestas activas
        // Aquí deberías agregar los campos de segmentación cuando los implementes
        // Por ahora, mostramos todas las encuestas activas para padres
        
      } else if (usuarioRol === 'docente') {
        // Los docentes ven encuestas institucionales dirigidas a docentes
        whereClause.estado = 'activa';
        // Aquí deberías agregar los campos de segmentación cuando los implementes
        
      } else if (usuarioRol === 'director') {
        // Los directores ven todas las encuestas
        // No se aplica filtro adicional
      }
      
      // Construir ordenamiento
      let orderBy = {};
      switch (ordenamiento) {
        case 'mas_antiguo':
          orderBy = { fecha_creacion: 'asc' };
          break;
        case 'por_vencimiento':
          orderBy = { fecha_vencimiento: 'asc' };
          break;
        case 'por_nombre':
          orderBy = { titulo: 'asc' };
          break;
        case 'mas_reciente':
        default:
          orderBy = { fecha_creacion: 'desc' };
          break;
      }
      
      // Obtener encuestas
      const encuestas = await prisma.encuesta.findMany({
        where: whereClause,
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true
            }
          },
          _count: {
            select: {
              respuestas: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      });
      
      // Obtener total de encuestas para paginación
      const totalEncuestas = await prisma.encuesta.count({
        where: whereClause
      });
      
      // Procesar encuestas para agregar información adicional
      const encuestasProcesadas = await Promise.all(
        encuestas.map(async (encuesta) => {
          // Verificar si el usuario ya respondió esta encuesta
          const yaRespondio = await prisma.respuestaEncuesta.findUnique({
            where: {
              encuesta_id_usuario_id: {
                encuesta_id: encuesta.id,
                usuario_id: usuarioId
              }
            }
          });
          
          // Calcular días para vencimiento
          let diasParaVencimiento = null;
          let proximaAVencer = false;
          
          if (encuesta.fecha_vencimiento) {
            const ahora = new Date();
            const fechaVenc = new Date(encuesta.fecha_vencimiento);
            const diffTime = fechaVenc - ahora;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            diasParaVencimiento = diffDays;
            proximaAVencer = diffDays <= 3 && diffDays >= 0;
          }
          
          // Determinar tipo de encuesta
          let tipoEncuesta = 'institucional';
          if (encuesta.autor_id === usuarioId) {
            tipoEncuesta = 'propia';
          }
          
          // Calcular porcentaje de participación (si aplica)
          let porcentajeParticipacion = 0;
          if (encuesta.estado === 'activa' || encuesta.estado === 'cerrada') {
            // Aquí deberías calcular el número de destinatarios
            // Por ahora, usamos un número fijo de ejemplo
            const destinatariosEstimados = 100;
            porcentajeParticipacion = Math.round((encuesta._count.respuestas / destinatariosEstimados) * 100);
          }
          
          return {
            ...encuesta,
            tipo: tipoEncuesta,
            estado_respuesta: {
              respondida: !!yaRespondio,
              fecha_respuesta: yaRespondio ? yaRespondio.fecha_respuesta : null
            },
            es_autor: encuesta.autor_id === usuarioId,
            puede_responder: !yaRespondio && encuesta.estado === 'activa',
            puede_ver_resultados: encuesta.autor_id === usuarioId || (encuesta.mostrar_resultados && yaRespondio),
            dias_para_vencimiento: diasParaVencimiento,
            proxima_a_vencer: proximaAVencer,
            porcentaje_participacion: porcentajeParticipacion,
            total_respuestas: encuesta._count.respuestas
          };
        })
      );
      
      // Calcular contadores
      const contadores = {
        total: totalEncuestas,
        activas: await prisma.encuesta.count({
          where: {
            estado: 'activa',
            ...whereClause
          }
        }),
        respondidas: await prisma.respuestaEncuesta.count({
          where: {
            usuario_id: usuarioId
          }
        }),
        vencidas: await prisma.encuesta.count({
          where: {
            estado: 'vencida',
            ...whereClause
          }
        })
      };
      
      return {
        success: true,
        data: {
          usuario: {
            id: usuarioId,
            rol: usuarioRol
          },
          encuestas: encuestasProcesadas,
          paginacion: {
            page,
            limit,
            total_encuestas: totalEncuestas,
            total_pages: Math.ceil(totalEncuestas / limit),
            has_next: page < Math.ceil(totalEncuestas / limit),
            has_prev: page > 1
          },
          contadores,
          filtros_aplicados: {
            estado,
            tipo,
            autor_id: autor_id || null
          }
        }
      };
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        return badRequest('Parámetros inválidos', err.errors);
      }
      console.error('Error al obtener encuestas:', err);
      return error('Error al obtener encuestas');
    }
  }
  
  // Método para obtener el contador de encuestas pendientes
  async obtenerContadorPendientes(usuarioId, usuarioRol) {
    try {
      // Construir filtros base
      let whereClause = {
        estado: 'activa'
      };
      
      // Aplicar segmentación automática según rol del usuario
      if (usuarioRol === 'apoderado') {
        // Obtener los niveles/grados de los hijos del padre
        const hijosDelPadre = await prisma.relacionesFamiliares.findMany({
          where: {
            apoderado_id: usuarioId,
            estado_activo: true
          },
          include: {
            estudiante: {
              include: {
                nivel_grado: true
              }
            }
          }
        });
        
        if (hijosDelPadre.length === 0) {
          return {
            success: true,
            data: {
              total_pendientes: 0,
              por_tipo: {
                institucionales: 0,
                propias: 0
              },
              proximas_a_vencer: []
            }
          };
        }
        
        // Extraer niveles y grados únicos
        const niveles = [...new Set(hijosDelPadre.map(h => h.estudiante.nivel_grado.nivel))];
        const grados = [...new Set(hijosDelPadre.map(h => h.estudiante.nivel_grado.grado))];
        
        // Aquí deberías agregar los campos de segmentación cuando los implementes
        
      } else if (usuarioRol === 'docente') {
        // Los docentes ven encuestas institucionales dirigidas a docentes
        // Aquí deberías agregar los campos de segmentación cuando los implementes
        
      } else if (usuarioRol === 'director') {
        // Los directores ven todas las encuestas
        // No se aplica filtro adicional
      }
      
      // Obtener encuestas que el usuario aún no ha respondido
      const encuestasRespondidas = await prisma.respuestaEncuesta.findMany({
        where: {
          usuario_id: usuarioId
        },
        select: {
          encuesta_id: true
        }
      });
      
      const encuestasRespondidasIds = encuestasRespondidas.map(r => r.encuesta_id);
      
      // Excluir encuestas ya respondidas
      if (encuestasRespondidasIds.length > 0) {
        whereClause.id = {
          notIn: encuestasRespondidasIds
        };
      }
      
      // Obtener encuestas pendientes
      const encuestasPendientes = await prisma.encuesta.findMany({
        where: whereClause,
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true
            }
          }
        },
        orderBy: {
          fecha_vencimiento: 'asc'
        }
      });
      
      // Procesar encuestas para agregar información adicional
      const encuestasProcesadas = encuestasPendientes.map(encuesta => {
        // Calcular días para vencimiento
        let diasParaVencimiento = null;
        
        if (encuesta.fecha_vencimiento) {
          const ahora = new Date();
          const fechaVenc = new Date(encuesta.fecha_vencimiento);
          const diffTime = fechaVenc - ahora;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          diasParaVencimiento = diffDays;
        }
        
        // Determinar tipo de encuesta
        let tipoEncuesta = 'institucional';
        if (encuesta.autor_id === usuarioId) {
          tipoEncuesta = 'propia';
        }
        
        return {
          id: encuesta.id,
          titulo: encuesta.titulo,
          dias_restantes: diasParaVencimiento,
          tipo: tipoEncuesta
        };
      });
      
      // Filtrar encuestas próximas a vencer (menos de 3 días)
      const proximasAVencer = encuestasProcesadas.filter(
        e => e.dias_restantes !== null && e.dias_restantes <= 3 && e.dias_restantes >= 0
      );
      
      // Contar por tipo
      const institucionales = encuestasProcesadas.filter(e => e.tipo === 'institucional').length;
      const propias = encuestasProcesadas.filter(e => e.tipo === 'propia').length;
      
      return {
        success: true,
        data: {
          total_pendientes: encuestasProcesadas.length,
          por_tipo: {
            institucionales,
            propias
          },
          proximas_a_vencer: proximasAVencer
        }
      };
      
    } catch (err) {
      console.error('Error al obtener contador de pendientes:', err);
      return error('Error al obtener contador de pendientes');
    }
  }
  
  // Método para validar acceso a una encuesta
  async validarAccesoEncuesta(encuestaId, usuarioId, usuarioRol) {
    try {
      console.log(`[DEBUG] validarAccesoEncuesta - Inicio: encuestaId=${encuestaId}, usuarioId=${usuarioId}, usuarioRol=${usuarioRol}`);
      
      // Validar que el ID sea un UUID válido
      if (!encuestaId || typeof encuestaId !== 'string' || !encuestaId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.log(`[DEBUG] validarAccesoEncuesta - ID de encuesta inválido: ${encuestaId}`);
        return notFound('Encuesta no encontrada');
      }
      
      console.log(`[DEBUG] validarAccesoEncuesta - ID válido, buscando encuesta en BD`);
      
      // Obtener la encuesta
      const encuesta = await prisma.encuesta.findUnique({
        where: {
          id: encuestaId
        },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true
            }
          }
        }
      });
      
      console.log(`[DEBUG] validarAccesoEncuesta - Encuesta encontrada:`, encuesta ? 'Sí' : 'No');
      
      if (!encuesta) {
        console.log(`[DEBUG] validarAccesoEncuesta - Encuesta no encontrada en BD`);
        return notFound('Encuesta no encontrada');
      }
      
      // Verificar si la encuesta está activa y no ha vencido
      const ahora = new Date();
      console.log(`[DEBUG] validarAccesoEncuesta - Estado de encuesta: ${encuesta.estado}, Fecha actual: ${ahora}, Fecha vencimiento: ${encuesta.fecha_vencimiento}`);
      
      if (encuesta.estado !== 'activa') {
        console.log(`[DEBUG] validarAccesoEncuesta - Encuesta no está activa, estado: ${encuesta.estado}`);
        return {
          success: true,
          data: {
            encuesta_id: encuestaId,
            tiene_acceso: false,
            motivo: `La encuesta está ${encuesta.estado}`,
            puede_responder: false,
            estado_encuesta: encuesta.estado,
            fecha_vencimiento: encuesta.fecha_vencimiento,
            dias_restantes: null,
            ya_respondio: false,
            segmentacion_valida: false
          }
        };
      }
      
      if (encuesta.fecha_vencimiento && new Date(encuesta.fecha_vencimiento) < ahora) {
        console.log(`[DEBUG] validarAccesoEncuesta - Encuesta ha vencido`);
        return {
          success: true,
          data: {
            encuesta_id: encuestaId,
            tiene_acceso: false,
            motivo: 'La encuesta ha vencido',
            puede_responder: false,
            estado_encuesta: 'vencida',
            fecha_vencimiento: encuesta.fecha_vencimiento,
            dias_restantes: null,
            ya_respondio: false,
            segmentacion_valida: false
          }
        };
      }
      
      console.log(`[DEBUG] validarAccesoEncuesta - Verificando si usuario ya respondió`);
      
      // Verificar si el usuario ya respondió
      const respuestaExistente = await prisma.respuestaEncuesta.findUnique({
        where: {
          encuesta_id_usuario_id: {
            encuesta_id: encuestaId,
            usuario_id: usuarioId
          }
        }
      });
      
      console.log(`[DEBUG] validarAccesoEncuesta - Respuesta existente encontrada:`, respuestaExistente ? 'Sí' : 'No');
      
      if (respuestaExistente) {
        console.log(`[DEBUG] validarAccesoEncuesta - Usuario ya respondió, no puede responder nuevamente`);
        return {
          success: true,
          data: {
            encuesta_id: encuestaId,
            tiene_acceso: true,
            motivo: 'Ya has respondido esta encuesta',
            puede_responder: false,
            estado_encuesta: encuesta.estado,
            fecha_vencimiento: encuesta.fecha_vencimiento,
            dias_restantes: null,
            ya_respondio: true,
            segmentacion_valida: true
          }
        };
      }
      
      // Verificar segmentación según rol del usuario
      let segmentacionValida = false;
      let motivo = '';
      
      if (usuarioRol === 'director') {
        // Los directores tienen acceso a todas las encuestas
        segmentacionValida = true;
        motivo = 'Acceso completo como director';
        
      } else if (usuarioRol === 'docente') {
        // Los docentes solo pueden responder encuestas dirigidas a docentes
        // Aquí deberías verificar los campos de segmentación cuando los implementes
        segmentacionValida = true; // Temporalmente true hasta implementar segmentación
        motivo = 'Encuesta dirigida a docentes';
        
      } else if (usuarioRol === 'apoderado') {
        // Los padres solo pueden responder encuestas dirigidas a sus hijos
        // Verificar si el padre tiene hijos en los niveles/grados objetivo de la encuesta
        const hijosDelPadre = await prisma.relacionesFamiliares.findMany({
          where: {
            apoderado_id: usuarioId,
            estado_activo: true
          },
          include: {
            estudiante: {
              include: {
                nivel_grado: true
              }
            }
          }
        });
        
        if (hijosDelPadre.length === 0) {
          segmentacionValida = false;
          motivo = 'No se encontraron estudiantes asociados a este usuario';
        } else {
          // Aquí deberías verificar los campos de segmentación cuando los implementes
          segmentacionValida = true; // Temporalmente true hasta implementar segmentación
          motivo = 'Encuesta dirigida al grado de su hijo';
        }
      }
      
      // Calcular días restantes
      let diasRestantes = null;
      if (encuesta.fecha_vencimiento) {
        const ahora = new Date();
        const fechaVenc = new Date(encuesta.fecha_vencimiento);
        const diffTime = fechaVenc - ahora;
        diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      const resultado = {
        success: true,
        data: {
          encuesta_id: encuestaId,
          tiene_acceso: segmentacionValida,
          motivo: segmentacionValida ? motivo : 'La encuesta no está dirigida a tu rol o nivel',
          puede_responder: segmentacionValida && !respuestaExistente,
          estado_encuesta: encuesta.estado,
          fecha_vencimiento: encuesta.fecha_vencimiento,
          dias_restantes: diasRestantes,
          ya_respondio: !!respuestaExistente,
          segmentacion_valida: segmentacionValida
        }
      };
      
      console.log(`[DEBUG] validarAccesoEncuesta - Retornando resultado:`, JSON.stringify(resultado, null, 2));
      return resultado;
      
    } catch (err) {
      console.error('[DEBUG] validarAccesoEncuesta - Error:', err);
      return error('Error al validar acceso a encuesta');
    }
  }
  
  // Método para obtener el formulario de una encuesta para responder
  async obtenerFormularioEncuesta(encuestaId, usuarioId, usuarioRol) {
    try {
      console.log(`[DEBUG] obtenerFormularioEncuesta - Inicio: encuestaId=${encuestaId}, usuarioId=${usuarioId}, usuarioRol=${usuarioRol}`);
      
      // Validar que el ID sea un UUID válido
      if (!encuestaId || typeof encuestaId !== 'string' || !encuestaId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.log(`[DEBUG] obtenerFormularioEncuesta - ID de encuesta inválido: ${encuestaId}`);
        return notFound('Encuesta no encontrada');
      }
      
      console.log(`[DEBUG] obtenerFormularioEncuesta - ID válido, llamando a validarAccesoEncuesta`);
      
      // Primero validar acceso
      const validacionAcceso = await this.validarAccesoEncuesta(encuestaId, usuarioId, usuarioRol);
      
      console.log(`[DEBUG] obtenerFormularioEncuesta - Resultado validarAccesoEncuesta:`, JSON.stringify(validacionAcceso, null, 2));
      
      if (!validacionAcceso.success) {
        console.log(`[DEBUG] obtenerFormularioEncuesta - validacionAcceso.success es false`);
        return validacionAcceso;
      }
      
      if (!validacionAcceso.data.puede_responder) {
        console.log(`[DEBUG] obtenerFormularioEncuesta - No puede responder, motivo: ${validacionAcceso.data.motivo}`);
        return {
          success: false,
          error: {
            code: 'NO_PUEDE_RESPONDER',
            message: validacionAcceso.data.motivo
          }
        };
      }
      
      console.log(`[DEBUG] obtenerFormularioEncuesta - Acceso validado, obteniendo encuesta con preguntas`);
      
      // Obtener la encuesta con sus preguntas
      const encuesta = await prisma.encuesta.findUnique({
        where: {
          id: encuestaId
        },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true
            }
          },
          preguntas: {
            include: {
              opciones: {
                orderBy: {
                  orden: 'asc'
                }
              }
            },
            orderBy: {
              orden: 'asc'
            }
          }
        }
      });
      
      console.log(`[DEBUG] obtenerFormularioEncuesta - Encuesta encontrada:`, encuesta ? 'Sí' : 'No');
      
      if (!encuesta) {
        console.log(`[DEBUG] obtenerFormularioEncuesta - Encuesta no encontrada, retornando error`);
        return notFound('Encuesta no encontrada');
      }
      
      // Calcular días restantes
      let diasRestantes = null;
      if (encuesta.fecha_vencimiento) {
        const ahora = new Date();
        const fechaVenc = new Date(encuesta.fecha_vencimiento);
        const diffTime = fechaVenc - ahora;
        diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      // Contar preguntas obligatorias
      const preguntasObligatorias = encuesta.preguntas.filter(p => p.obligatoria).length;
      
      // Estimar tiempo de respuesta (2 minutos por pregunta obligatoria + 1 minuto por pregunta opcional)
      const preguntasOpcionales = encuesta.preguntas.length - preguntasObligatorias;
      const tiempoEstimado = (preguntasObligatorias * 2) + (preguntasOpcionales * 1);
      
      console.log(`[DEBUG] obtenerFormularioEncuesta - Construyendo respuesta exitosa`);
      
      const resultado = {
        success: true,
        data: {
          encuesta: {
            id: encuesta.id,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            fecha_vencimiento: encuesta.fecha_vencimiento,
            fecha_vencimiento_legible: encuesta.fecha_vencimiento
              ? new Date(encuesta.fecha_vencimiento).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : null,
            dias_restantes: diasRestantes,
            total_preguntas: encuesta.preguntas.length,
            preguntas_obligatorias: preguntasObligatorias,
            tiempo_estimado: tiempoEstimado,
            autor: encuesta.autor
          },
          preguntas: encuesta.preguntas.map(pregunta => {
            // Agregar reglas de validación según el tipo de pregunta
            let validacion = {};
            
            switch (pregunta.tipo) {
              case 'texto_corto':
                validacion = {
                  min_caracteres: 2,
                  max_caracteres: 500
                };
                break;
              case 'texto_largo':
                validacion = {
                  min_caracteres: 10,
                  max_caracteres: 2000
                };
                break;
              case 'opcion_unica':
                validacion = {
                  min_opciones: 1,
                  max_opciones: 1
                };
                break;
              case 'opcion_multiple':
                validacion = {
                  min_opciones: pregunta.obligatoria ? 1 : 0,
                  max_opciones: pregunta.opciones.length
                };
                break;
              case 'escala_1_5':
                validacion = {
                  min_valor: 1,
                  max_valor: 5
                };
                break;
            }
            
            return {
              id: pregunta.id,
              tipo: pregunta.tipo,
              texto: pregunta.texto,
              obligatoria: pregunta.obligatoria,
              orden: pregunta.orden,
              opciones: pregunta.opciones.map(opcion => ({
                id: opcion.id,
                texto: opcion.texto,
                orden: opcion.orden
              })),
              etiquetas: pregunta.tipo === 'escala_1_5'
                ? ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho']
                : null,
              validacion
            };
          }),
          progreso: {
            pregunta_actual: 1,
            total_preguntas: encuesta.preguntas.length,
            porcentaje_completado: 0
          }
        }
      };
      
      console.log(`[DEBUG] obtenerFormularioEncuesta - Respuesta construida exitosamente, retornando`);
      return resultado;
      
    } catch (err) {
      console.error('[DEBUG] obtenerFormularioEncuesta - Error:', err);
      return error('Error al obtener formulario de encuesta');
    }
  }
  
  // Método para enviar respuestas de una encuesta
  async enviarRespuestas(datosRespuesta, usuarioId, ipUsuario) {
    try {
      // Validar datos de entrada
      const datosValidados = responderEncuestaSchema.parse(datosRespuesta);
      
      const {
        encuesta_id,
        estudiante_id,
        respuestas,
        tiempo_respuesta_minutos
      } = datosValidados;
      
      // Verificar que la encuesta existe y está activa
      const encuesta = await prisma.encuesta.findUnique({
        where: {
          id: encuesta_id
        },
        include: {
          preguntas: {
            include: {
              opciones: true
            }
          }
        }
      });
      
      if (!encuesta) {
        return notFound('Encuesta no encontrada');
      }
      
      // Verificar que la encuesta esté activa
      if (encuesta.estado !== 'activa') {
        return badRequest('La encuesta no está activa');
      }
      
      // Verificar que la encuesta no haya vencido
      if (encuesta.fecha_vencimiento && new Date(encuesta.fecha_vencimiento) < new Date()) {
        return badRequest('La encuesta ha vencido');
      }
      
      // Verificar que el usuario no haya respondido previamente
      const respuestaExistente = await prisma.respuestaEncuesta.findUnique({
        where: {
          encuesta_id_usuario_id: {
            encuesta_id: encuesta_id,
            usuario_id: usuarioId
          }
        }
      });
      
      if (respuestaExistente) {
        return conflict('Ya has respondido esta encuesta anteriormente');
      }
      
      // Validar que todas las preguntas obligatorias tengan respuesta
      const preguntasObligatorias = encuesta.preguntas.filter(p => p.obligatoria);
      const idsPreguntasObligatorias = new Set(preguntasObligatorias.map(p => p.id));
      const idsPreguntasRespondidas = new Set(respuestas.map(r => r.pregunta_id));
      
      const preguntasObligatoriasSinRespuesta = [...idsPreguntasObligatorias].filter(
        id => !idsPreguntasRespondidas.has(id)
      );
      
      if (preguntasObligatoriasSinRespuesta.length > 0) {
        return badRequest('Las siguientes preguntas obligatorias no fueron respondidas', {
          preguntas_faltantes: preguntasObligatoriasSinRespuesta
        });
      }
      
      // Validar cada respuesta según el tipo de pregunta
      for (const respuesta of respuestas) {
        const pregunta = encuesta.preguntas.find(p => p.id === respuesta.pregunta_id);
        
        if (!pregunta) {
          return badRequest(`La pregunta con ID ${respuesta.pregunta_id} no existe en esta encuesta`);
        }
        
        // Validar según el tipo de pregunta
        switch (pregunta.tipo) {
          case 'texto_corto':
            if (!respuesta.valor_texto || respuesta.valor_texto.trim().length < 2) {
              return badRequest(`La respuesta a la pregunta "${pregunta.texto}" debe tener al menos 2 caracteres`);
            }
            
            if (respuesta.valor_texto.length > 500) {
              return badRequest(`La respuesta a la pregunta "${pregunta.texto}" no puede exceder 500 caracteres`);
            }
            break;
            
          case 'texto_largo':
            if (!respuesta.valor_texto || respuesta.valor_texto.trim().length < 10) {
              return badRequest(`La respuesta a la pregunta "${pregunta.texto}" debe tener al menos 10 caracteres`);
            }
            
            if (respuesta.valor_texto.length > 2000) {
              return badRequest(`La respuesta a la pregunta "${pregunta.texto}" no puede exceder 2000 caracteres`);
            }
            break;
            
          case 'opcion_unica':
            if (!respuesta.valor_opcion_id) {
              return badRequest(`Debes seleccionar una opción para la pregunta "${pregunta.texto}"`);
            }
            
            // Verificar que la opción exista y pertenezca a esta pregunta
            const opcionValida = pregunta.opciones.find(o => o.id === respuesta.valor_opcion_id);
            if (!opcionValida) {
              return badRequest(`La opción seleccionada no es válida para la pregunta "${pregunta.texto}"`);
            }
            break;
            
          case 'opcion_multiple':
            if (!respuesta.valor_opciones || respuesta.valor_opciones.length === 0) {
              return badRequest(`Debes seleccionar al menos una opción para la pregunta "${pregunta.texto}"`);
            }
            
            // Verificar que todas las opciones existan y pertenezcan a esta pregunta
            for (const opcionId of respuesta.valor_opciones) {
              const opcionValida = pregunta.opciones.find(o => o.id === opcionId);
              if (!opcionValida) {
                return badRequest(`Una de las opciones seleccionadas no es válida para la pregunta "${pregunta.texto}"`);
              }
            }
            break;
            
          case 'escala_1_5':
            if (respuesta.valor_escala === undefined || respuesta.valor_escala < 1 || respuesta.valor_escala > 5) {
              return badRequest(`Debes seleccionar un valor entre 1 y 5 para la pregunta "${pregunta.texto}"`);
            }
            break;
        }
      }
      
      // Crear la respuesta principal y todas las respuestas relacionadas en una sola transacción
      let nuevaRespuesta;
      const respuestasPregunta = [];
      
      await prisma.$transaction(async (tx) => {
        // Crear la respuesta principal
        nuevaRespuesta = await tx.respuestaEncuesta.create({
          data: {
            encuesta_id,
            usuario_id: usuarioId,
            estudiante_id,
            fecha_respuesta: new Date(),
            tiempo_respuesta_minutos: tiempo_respuesta_minutos || null,
            ip_respuesta: ipUsuario
          }
        });
        
        // Crear las respuestas a cada pregunta
        for (const respuesta of respuestas) {
          const pregunta = encuesta.preguntas.find(p => p.id === respuesta.pregunta_id);
          
          let datosRespuesta = {
            respuesta_id: nuevaRespuesta.id,
            pregunta_id: respuesta.pregunta_id
          };
          
          switch (pregunta.tipo) {
            case 'texto_corto':
            case 'texto_largo':
              datosRespuesta.valor_texto = respuesta.valor_texto;
              break;
              
            case 'opcion_unica':
              datosRespuesta.valor_opcion_id = respuesta.valor_opcion_id;
              break;
              
            case 'opcion_multiple':
              datosRespuesta.valor_opciones = respuesta.valor_opciones;
              break;
              
            case 'escala_1_5':
              datosRespuesta.valor_escala = respuesta.valor_escala;
              break;
          }
          
          const respuestaPregunta = await tx.respuestaPregunta.create({
            data: datosRespuesta
          });
          
          respuestasPregunta.push(respuestaPregunta);
          
          // Crear votos para opciones múltiples
          if (pregunta.tipo === 'opcion_multiple' && respuesta.valor_opciones) {
            for (const opcionId of respuesta.valor_opciones) {
              await tx.votoEncuesta.create({
                data: {
                  respuesta_id: nuevaRespuesta.id,
                  pregunta_id: respuesta.pregunta_id,
                  opcion_id: opcionId
                }
              });
            }
          }
        }
      });
      
      // Actualizar estadísticas de la encuesta
      const totalRespuestas = await prisma.respuestaEncuesta.count({
        where: {
          encuesta_id
        }
      });
      
      console.log(`Respuesta guardada exitosamente. ID: ${nuevaRespuesta.id}, Usuario: ${usuarioId}, Encuesta: ${encuesta_id}`);
      
      // Crear notificación para el autor de la encuesta
      await prisma.notificacion.create({
        data: {
          usuario_id: encuesta.autor_id,
          tipo: 'encuesta',
          titulo: 'Nueva respuesta recibida',
          contenido: `Un usuario ha respondido tu encuesta "${encuesta.titulo}"`,
          canal: 'plataforma',
          estado_plataforma: 'pendiente',
          referencia_id: encuesta_id,
          tipo_referencia: 'encuesta',
          año_academico: encuesta.año_academico
        }
      });
      
      return {
        success: true,
        data: {
          respuesta: {
            id: nuevaRespuesta.id,
            encuesta_id,
            usuario_id: usuarioId,
            estudiante_id,
            fecha_respuesta: nuevaRespuesta.fecha_respuesta,
            tiempo_respuesta_minutos: nuevaRespuesta.tiempo_respuesta_minutos,
            total_preguntas: encuesta.preguntas.length,
            preguntas_respondidas: respuestas.length,
            ip_respuesta: nuevaRespuesta.ip_respuesta
          },
          estadisticas_actualizadas: {
            total_respuestas: totalRespuestas,
            porcentaje_participacion: Math.round((totalRespuestas / 100) * 100) // Temporal hasta calcular destinatarios reales
          },
          mensaje: '¡Respuestas enviadas exitosamente! Gracias por tu participación.'
        }
      };
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        return badRequest('Datos inválidos', err.errors);
      }
      console.error('Error al enviar respuestas:', err);
      return error('Error al enviar respuestas');
    }
  }
  
  // Método para obtener las respuestas de un usuario a una encuesta específica
  async obtenerMisRespuestas(encuestaId, usuarioId) {
    try {
      // Validar que el ID sea un UUID válido
      if (!encuestaId || typeof encuestaId !== 'string' || !encuestaId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        return notFound('Encuesta no encontrada');
      }
      
      // Verificar que la encuesta existe
      const encuesta = await prisma.encuesta.findUnique({
        where: {
          id: encuestaId
        },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true
            }
          }
        }
      });
      
      if (!encuesta) {
        return notFound('Encuesta no encontrada');
      }
      
      // Verificar si el usuario ha respondido esta encuesta
      const respuestaUsuario = await prisma.respuestaEncuesta.findUnique({
        where: {
          encuesta_id_usuario_id: {
            encuesta_id: encuestaId,
            usuario_id: usuarioId
          }
        },
        include: {
          estudiante: {
            include: {
              nivel_grado: true
            }
          }
        }
      });
      
      if (!respuestaUsuario) {
        return {
          success: false,
          error: {
            code: 'RESPONSE_NOT_FOUND',
            message: 'Aún no has respondido esta encuesta'
          }
        };
      }
      
      // Obtener las respuestas detalladas a cada pregunta
      const respuestasDetalle = await prisma.respuestaPregunta.findMany({
        where: {
          respuesta_id: respuestaUsuario.id
        },
        include: {
          pregunta: {
            include: {
              opciones: {
                orderBy: {
                  orden: 'asc'
                }
              }
            }
          }
        },
        orderBy: {
          pregunta: {
            orden: 'asc'
          }
        }
      });
      
      // Procesar las respuestas para incluir información completa
      const respuestasProcesadas = respuestasDetalle.map(respuesta => {
        let valorMostrar = null;
        let opcionesDisponibles = null;
        
        switch (respuesta.pregunta.tipo) {
          case 'texto_corto':
          case 'texto_largo':
            valorMostrar = respuesta.valor_texto;
            break;
            
          case 'opcion_unica':
            const opcionSeleccionada = respuesta.pregunta.opciones.find(o => o.id === respuesta.valor_opcion_id);
            valorMostrar = opcionSeleccionada ? opcionSeleccionada.texto : null;
            opcionesDisponibles = respuesta.pregunta.opciones.map(o => o.texto);
            break;
            
          case 'opcion_multiple':
            const opcionesSeleccionadas = respuesta.pregunta.opciones.filter(o => 
              respuesta.valor_opciones && respuesta.valor_opciones.includes(o.id)
            );
            valorMostrar = opcionesSeleccionadas.map(o => o.texto);
            opcionesDisponibles = respuesta.pregunta.opciones.map(o => o.texto);
            break;
            
          case 'escala_1_5':
            valorMostrar = respuesta.valor_escala;
            const etiquetas = ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'];
            opcionesDisponibles = etiquetas;
            break;
        }
        
        return {
          pregunta_id: respuesta.pregunta_id,
          tipo: respuesta.pregunta.tipo,
          texto_pregunta: respuesta.pregunta.texto,
          valor: valorMostrar,
          valor_texto: respuesta.valor_texto,
          valor_opcion_id: respuesta.valor_opcion_id,
          valor_opciones: respuesta.valor_opciones,
          valor_escala: respuesta.valor_escala,
          obligatoria: respuesta.pregunta.obligatoria,
          respondida: true,
          opciones_disponibles: opcionesDisponibles,
          etiquetas: respuesta.pregunta.tipo === 'escala_1_5'
            ? ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho']
            : null
        };
      });
      
      // Calcular completitud
      const preguntasEncuesta = await prisma.preguntaEncuesta.count({
        where: {
          encuesta_id: encuestaId
        }
      });
      
      const completitud = Math.round((respuestasProcesadas.length / preguntasEncuesta) * 100);
      
      return {
        success: true,
        data: {
          encuesta: {
            id: encuesta.id,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            fecha_vencimiento: encuesta.fecha_vencimiento,
            autor: encuesta.autor
          },
          respuesta: {
            id: respuestaUsuario.id,
            fecha_respuesta: respuestaUsuario.fecha_respuesta,
            fecha_respuesta_legible: new Date(respuestaUsuario.fecha_respuesta).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            tiempo_respuesta_minutos: respuestaUsuario.tiempo_respuesta_minutos,
            total_preguntas: preguntasEncuesta,
            preguntas_respondidas: respuestasProcesadas.length,
            completitud: completitud,
            estudiante_relacionado: respuestaUsuario.estudiante ? {
              id: respuestaUsuario.estudiante.id,
              nombre_completo: `${respuestaUsuario.estudiante.nombre} ${respuestaUsuario.estudiante.apellido}`,
              grado: respuestaUsuario.estudiante.nivel_grado.grado,
              nivel: respuestaUsuario.estudiante.nivel_grado.nivel
            } : null
          },
          respuestas_detalle: respuestasProcesadas
        }
      };
      
    } catch (err) {
      console.error('Error al obtener mis respuestas:', err);
      return error('Error al obtener mis respuestas');
    }
  }

  // ============================================================================
  // MÉTODOS NUEVOS PARA RESULTADOS DE ENCUESTAS
  // ============================================================================

  /**
   * Obtener resultados agregados por pregunta
   * @param {string} encuestaId - ID de la encuesta
   * @param {object} opciones - Opciones de filtrado
   * @returns {object} Resultados agregados por pregunta
   */
  async obtenerResultadosPorPregunta(encuestaId, opciones = {}) {
    try {
      // Validar permisos de acceso (mismo patrón que otros métodos)
      const validacion = await this.validarAccesoParaResultados(encuestaId, opciones.usuarioId, opciones.usuarioRol);
      if (!validacion.success) {
        return validacion;
      }

      // Esquema de validación para parámetros
      const resultadosSchema = z.object({
        incluir_respuestas_texto: z.boolean().default(true),
        limite_respuestas_texto: z.number().int().min(1).max(50).default(10)
      });

      const opcionesValidadas = resultadosSchema.parse(opciones);

      // Obtener encuesta con preguntas y opciones
      const encuesta = await prisma.encuesta.findUnique({
        where: { id: encuestaId },
        include: {
          preguntas: {
            include: {
              opciones: {
                orderBy: { orden: 'asc' }
              }
            },
            orderBy: { orden: 'asc' }
          }
        }
      });

      if (!encuesta) {
        return notFound('Encuesta no encontrada');
      }

      // Verificar que la encuesta tenga respuestas
      const totalRespuestas = await prisma.respuestaEncuesta.count({
        where: { encuesta_id: encuestaId }
      });

      if (totalRespuestas === 0) {
        return {
          success: false,
          error: {
            code: 'NO_RESPONSES_FOUND',
            message: 'Esta encuesta aún no tiene respuestas'
          }
        };
      }

      // Obtener respuestas agrupadas por pregunta
      const resultados = await Promise.all(
        encuesta.preguntas.map(async (pregunta) => {
          const respuestasPregunta = await prisma.respuestaPregunta.findMany({
            where: { pregunta_id: pregunta.id },
            include: {
              respuesta: {
                select: {
                  id: true,
                  fecha_respuesta: true
                }
              }
            }
          });

          // Calcular agregaciones según tipo de pregunta
          let agregacion = {};
          
          switch (pregunta.tipo) {
            case 'texto_corto':
            case 'texto_largo':
              agregacion = await this.agregarRespuestasTexto(respuestasPregunta, opcionesValidadas.limite_respuestas_texto);
              break;
              
            case 'opcion_unica':
              agregacion = await this.agregarOpcionesUnicas(pregunta.opciones, respuestasPregunta);
              break;
              
            case 'opcion_multiple':
              agregacion = await this.agregarOpcionesMultiples(pregunta.opciones, respuestasPregunta);
              break;
              
            case 'escala_1_5':
              agregacion = await this.agregarEscalas(respuestasPregunta);
              break;
          }

          return {
            pregunta_id: pregunta.id,
            texto: pregunta.texto,
            tipo: pregunta.tipo,
            obligatoria: pregunta.obligatoria,
            total_respuestas: respuestasPregunta.length,
            respuestas_porcentaje: Math.round((respuestasPregunta.length / totalRespuestas) * 100),
            agregacion
          };
        })
      );

      return {
        success: true,
        data: {
          encuesta: {
            id: encuesta.id,
            titulo: encuesta.titulo,
            total_respuestas: totalRespuestas,
            porcentaje_participacion: Math.round((totalRespuestas / 100) * 100) // TODO: calcular destinatarios reales
          },
          resultados_por_pregunta: resultados
        }
      };

    } catch (err) {
      console.error('Error al obtener resultados por pregunta:', err);
      return error('Error al obtener resultados por pregunta');
    }
  }

  /**
   * Obtener estadísticas generales de encuesta
   * @param {string} encuestaId - ID de la encuesta
   * @param {string} usuarioId - ID del usuario (para permisos)
   * @param {string} usuarioRol - Rol del usuario
   * @returns {object} Métricas generales y KPIs
   */
  async obtenerEstadisticasGenerales(encuestaId, usuarioId, usuarioRol) {
    try {
      // Validar permisos
      const validacion = await this.validarAccesoParaResultados(encuestaId, usuarioId, usuarioRol);
      if (!validacion.success) {
        return validacion;
      }

      // Obtener encuesta básica
      const encuesta = await prisma.encuesta.findUnique({
        where: { id: encuestaId },
        include: {
          autor: {
            select: {
              nombre: true,
              apellido: true,
              rol: true
            }
          },
          _count: {
            select: {
              respuestas: true
            }
          }
        }
      });

      if (!encuesta) {
        return notFound('Encuesta no encontrada');
      }

      // Calcular métricas generales
      const totalRespuestas = encuesta._count.respuestas;
      const tiempoPromedio = await this.calcularTiempoPromedioRespuesta(encuestaId);
      const tasaCompletitud = await this.calcularTasaCompletitud(encuestaId);
      const respuestasUltimas24h = await this.contarRespuestasUltimas24h(encuestaId);
      const proyeccionTotal = await this.calcularProyeccionTotal(encuestaId, encuesta.fecha_vencimiento);

      // Distribución temporal
      const distribucionTemporal = await this.obtenerDistribucionTemporal(encuestaId);

      // Insights automáticos
      const insights = await this.generarInsights(encuestaId);

      return {
        success: true,
        data: {
          encuesta: {
            id: encuesta.id,
            titulo: encuesta.titulo,
            fecha_creacion: encuesta.fecha_creacion,
            fecha_vencimiento: encuesta.fecha_vencimiento,
            estado: encuesta.estado,
            autor: encuesta.autor
          },
          metricas_generales: {
            total_destinatarios: 100, // TODO: calcular destinatarios reales
            total_respuestas: totalRespuestas,
            porcentaje_participacion: Math.round((totalRespuestas / 100) * 100), // TODO: destinatarios reales
            tiempo_promedio_respuesta_minutos: tiempoPromedio,
            tasa_completitud: tasaCompletitud,
            respuestas_ultimas_24h: respuestasUltimas24h,
            proyeccion_total_estimado: proyeccionTotal
          },
          distribucion_respuestas: distribucionTemporal,
          indicadores_rendimiento: insights
        }
      };

    } catch (err) {
      console.error('Error al obtener estadísticas generales:', err);
      return error('Error al obtener estadísticas generales');
    }
  }

  /**
   * Obtener tabla paginada de respuestas
   * @param {object} filtros - Filtros de búsqueda
   * @param {string} usuarioId - ID del usuario (para permisos)
   * @param {string} usuarioRol - Rol del usuario
   * @returns {object} Lista paginada de respuestas
   */
  async obtenerTablaRespuestas(filtros, usuarioId, usuarioRol) {
    try {
      // Esquema de validación
      const tablaSchema = z.object({
        encuesta_id: z.string().uuid(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        nivel: z.string().optional(),
        grado: z.string().optional(),
        curso: z.string().optional(),
        rol: z.string().optional(),
        order: z.string().default('fecha_respuesta DESC')
      });

      const filtrosValidados = tablaSchema.parse(filtros);
      const { encuesta_id, page, limit } = filtrosValidados;

      // Validar permisos para ver respuestas
      const validacion = await this.validarAccesoParaResultados(encuesta_id, usuarioId, usuarioRol);
      if (!validacion.success) {
        return validacion;
      }

      // Obtener título de la encuesta
      const encuestaInfo = await prisma.encuesta.findUnique({
        where: { id: encuesta_id },
        select: { titulo: true }
      });

      const skip = (page - 1) * limit;

      // Construir filtros de segmentación (corregido: pasar usuarioId separado)
      const whereClause = await this.construirFiltrosSegmentacion(encuesta_id, filtrosValidados, usuarioRol, usuarioId);

      // Obtener respuestas con información del respondiente
      const respuestas = await prisma.respuestaEncuesta.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true
            }
          },
          estudiante: {
            include: {
              nivel_grado: {
                select: {
                  nivel: true,
                  grado: true
                }
              }
            }
          },
          respuestasPregunta: {
            include: {
              pregunta: {
                select: {
                  id: true,
                  texto: true,
                  tipo: true
                }
              }
            },
            take: 3 // Limitar a 3 respuestas en el resumen
          }
        },
        orderBy: this.parsearOrdenamiento(filtrosValidados.order),
        skip,
        take: limit
      });

      // Obtener total para paginación
      const totalRespuestas = await prisma.respuestaEncuesta.count({
        where: whereClause
      });

      // Procesar respuestas para el frontend
      const respuestasProcesadas = respuestas.map(respuesta => {
        // Crear resumen de respuestas clave
        const respuestasResumen = respuesta.respuestasPregunta.map(rp => {
          let valor = null;
          
          switch (rp.pregunta.tipo) {
            case 'opcion_unica':
              valor = rp.valor_opcion_id; // El frontend puede mapear el texto si es necesario
              break;
            case 'escala_1_5':
              valor = rp.valor_escala;
              break;
            default:
              valor = rp.valor_texto ? rp.valor_texto.substring(0, 50) + '...' : null;
          }

          return {
            pregunta_id: rp.pregunta_id,
            tipo: rp.pregunta.tipo,
            texto_pregunta: rp.pregunta.texto,
            valor: valor,
            valor_opcion_id: rp.valor_opcion_id,
            valor_escala: rp.valor_escala
          };
        });

        return {
          respuesta_id: respuesta.id,
          fecha_respuesta: respuesta.fecha_respuesta,
          fecha_respuesta_legible: new Date(respuesta.fecha_respuesta).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          tiempo_respuesta_minutos: respuesta.tiempo_respuesta_minutos,
          completitud_porcentaje: Math.round((respuesta.respuestasPregunta.length / 5) * 100), // TODO: preguntas reales
          respondiente: {
            id: respuesta.usuario.id,
            nombre_completo: `${respuesta.usuario.nombre} ${respuesta.usuario.apellido}`,
            rol: respuesta.usuario.rol,
            estudiante_relacionado: respuesta.estudiante ? {
              id: respuesta.estudiante.id,
              nombre_completo: `${respuesta.estudiante.nombre} ${respuesta.estudiante.apellido}`,
              grado: respuesta.estudiante.nivel_grado.grado,
              nivel: respuesta.estudiante.nivel_grado.nivel
            } : null
          },
          respuestas_resumen: respuestasResumen,
          respuestas_omitidas: Math.max(0, respuesta.respuestasPregunta.length - 3),
          ip_respuesta: respuesta.ip_respuesta
        };
      });

      return {
        success: true,
        data: {
          encuesta: {
            id: encuesta_id,
            titulo: encuestaInfo ? encuestaInfo.titulo : "Encuesta con respuestas"
          },
          respuestas: respuestasProcesadas,
          paginacion: {
            pagina_actual: page,
            limite: limit,
            total_registros: totalRespuestas,
            total_paginas: Math.ceil(totalRespuestas / limit),
            has_next: page < Math.ceil(totalRespuestas / limit),
            has_prev: page > 1
          },
          filtros_aplicados: {
            encuesta_id,
            nivel: filtrosValidados.nivel || null,
            grado: filtrosValidados.grado || null,
            curso: filtrosValidados.curso || null,
            rol: filtrosValidados.rol || null,
            page,
            limit
          },
          estadisticas_filtros: {
            total_sin_filtros: await prisma.respuestaEncuesta.count({ where: { encuesta_id } }),
            total_con_filtros: totalRespuestas,
            porcentaje_cocentaje: Math.round((totalRespuestas / await prisma.respuestaEncuesta.count({ where: { encuesta_id } })) * 100)
          }
        }
      };

    } catch (err) {
      console.error('Error al obtener tabla de respuestas:', err);
      return error('Error al obtener tabla de respuestas');
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ============================================================================

  /**
   * Validar acceso para ver resultados
   */
  async validarAccesoParaResultados(encuestaId, usuarioId, usuarioRol) {
    // Implementar lógica similar a validarAccesoEncuesta pero para resultados
    // Autor de encuesta, director, o usuario que ya respondió (si mostrar_resultados=true)
    
    const encuesta = await prisma.encuesta.findUnique({
      where: { id: encuestaId },
      select: {
        id: true,
        autor_id: true,
        mostrar_resultados: true
      }
    });

    if (!encuesta) {
      return notFound('Encuesta no encontrada');
    }

    // Autor siempre puede ver resultados
    if (encuesta.autor_id === usuarioId) {
      return { success: true };
    }

    // Director siempre puede ver resultados
    if (usuarioRol === 'director') {
      return { success: true };
    }

    // Usuario que respondió puede ver si mostrar_resultados=true
    if (encuesta.mostrar_resultados) {
      const yaRespondio = await prisma.respuestaEncuesta.findUnique({
        where: {
          encuesta_id_usuario_id: {
            encuesta_id: encuestaId,
            usuario_id: usuarioId
          }
        }
      });

      if (yaRespondio) {
        return { success: true };
      }
    }

    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No tienes permisos para ver los resultados de esta encuesta'
      }
    };
  }

  /**
   * Agregar respuestas de texto (muestra aleatoria)
   */
  async agregarRespuestasTexto(respuestasPregunta, limite) {
    const textos = respuestasPregunta
      .filter(r => r.valor_texto)
      .map(r => r.valor_texto)
      .sort(() => 0.5 - Math.random()) // Shuffle aleatorio
      .slice(0, limite);

    return {
      tipo: 'texto',
      respuestas_texto: textos,
      total_respuestas_texto: textos.length
    };
  }

  /**
   * Agregar opciones únicas
   */
  async agregarOpcionesUnicas(opciones, respuestasPregunta) {
    const conteos = {};
    
    // Inicializar contadores
    opciones.forEach(opcion => {
      conteos[opcion.id] = {
        opcion_id: opcion.id,
        texto: opcion.texto,
        cantidad: 0,
        porcentaje: 0
      };
    });

    // Contar respuestas
    respuestasPregunta.forEach(respuesta => {
      if (respuesta.valor_opcion_id && conteos[respuesta.valor_opcion_id]) {
        conteos[respuesta.valor_opcion_id].cantidad++;
      }
    });

    // Calcular porcentajes
    const total = respuestasPregunta.length;
    Object.values(conteos).forEach(conteo => {
      conteo.porcentaje = total > 0 ? Math.round((conteo.cantidad / total) * 100) : 0;
    });

    return {
      tipo: 'opciones',
      opciones: Object.values(conteos)
    };
  }

  /**
   * Agregar opciones múltiples
   */
  async agregarOpcionesMultiples(opciones, respuestasPregunta) {
    const conteos = {};
    
    // Inicializar contadores
    opciones.forEach(opcion => {
      conteos[opcion.id] = {
        opcion_id: opcion.id,
        texto: opcion.texto,
        cantidad: 0,
        porcentaje: 0
      };
    });

    // Contar votos
    let totalSelecciones = 0;
    respuestasPregunta.forEach(respuesta => {
      if (respuesta.valor_opciones) {
        respuesta.valor_opciones.forEach(opcionId => {
          if (conteos[opcionId]) {
            conteos[opcionId].cantidad++;
            totalSelecciones++;
          }
        });
      }
    });

    // Calcular porcentajes (base: total de respuestas)
    const totalRespuestas = respuestasPregunta.length;
    Object.values(conteos).forEach(conteo => {
      conteo.porcentaje = totalRespuestas > 0 ? Math.round((conteo.cantidad / totalRespuestas) * 100) : 0;
    });

    return {
      tipo: 'opciones_multiples',
      total_selecciones: totalSelecciones,
      promedio_selecciones_por_usuario: totalRespuestas > 0 ? Math.round((totalSelecciones / totalRespuestas) * 10) / 10 : 0,
      total_respuestas: totalRespuestas,
      opciones: Object.values(conteos)
    };
  }

  /**
   * Agregar escalas
   */
  async agregarEscalas(respuestasPregunta) {
    const valores = respuestasPregunta
      .filter(r => r.valor_escala !== null)
      .map(r => r.valor_escala);

    if (valores.length === 0) {
      return {
        tipo: 'escala',
        promedio: 0,
        mediana: 0,
        distribucion: [],
        etiquetas: ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho']
      };
    }

    // Calcular distribución
    const distribucion = [1, 2, 3, 4, 5].map(valor => {
      const cantidad = valores.filter(v => v === valor).length;
      return {
        valor,
        cantidad,
        porcentaje: Math.round((cantidad / valores.length) * 100)
      };
    });

    // Calcular promedio y mediana
    const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;
    const valoresOrdenados = [...valores].sort((a, b) => a - b);
    const mediana = valoresOrdenados.length % 2 === 0
      ? (valoresOrdenados[valoresOrdenados.length / 2 - 1] + valoresOrdenados[valoresOrdenados.length / 2]) / 2
      : valoresOrdenados[Math.floor(valoresOrdenados.length / 2)];

    return {
      tipo: 'escala',
      promedio: Math.round(promedio * 10) / 10,
      mediana: Math.round(mediana * 10) / 10,
      distribucion,
      etiquetas: ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho']
    };
  }

  /**
   * Calcular tiempo promedio de respuesta
   */
  async calcularTiempoPromedioRespuesta(encuestaId) {
    const respuestas = await prisma.respuestaEncuesta.findMany({
      where: {
        encuesta_id: encuestaId,
        tiempo_respuesta_minutos: { not: null }
      },
      select: { tiempo_respuesta_minutos: true }
    });

    if (respuestas.length === 0) return 0;

    const total = respuestas.reduce((sum, r) => sum + r.tiempo_respuesta_minutos, 0);
    return Math.round((total / respuestas.length) * 10) / 10;
  }

  /**
   * Calcular tasa de completitud
   */
  async calcularTasaCompletitud(encuestaId) {
    const totalRespuestas = await prisma.respuestaEncuesta.count({
      where: { encuesta_id: encuestaId }
    });

    if (totalRespuestas === 0) return 0;

    // Obtener número total de preguntas en la encuesta
    const totalPreguntas = await prisma.preguntaEncuesta.count({
      where: { encuesta_id: encuestaId }
    });

    if (totalPreguntas === 0) return 0;

    const respuestasCompletas = await prisma.respuestaEncuesta.count({
      where: {
        encuesta_id: encuestaId,
        respuestasPregunta: {
          // Contar respuestas que tienen al menos tantas respuestas como preguntas
          some: {}
        }
      }
    });

    return Math.round((respuestasCompletas / totalRespuestas) * 100);
  }

  /**
   * Contar respuestas de las últimas 24 horas
   */
  async contarRespuestasUltimas24h(encuestaId) {
    const hace24h = new Date();
    hace24h.setHours(hace24h.getHours() - 24);

    return await prisma.respuestaEncuesta.count({
      where: {
        encuesta_id: encuestaId,
        fecha_respuesta: {
          gte: hace24h
        }
      }
    });
  }

  /**
   * Calcular proyección total
   */
  async calcularProyeccionTotal(encuestaId, fechaVencimiento) {
    if (!fechaVencimiento) return null;

    const ahora = new Date();
    const fechaCreacion = new Date(); // Usar fecha actual como referencia
    const diasTranscurridos = Math.ceil((ahora - fechaCreacion) / (1000 * 60 * 60 * 24));
    const diasTotales = Math.ceil((new Date(fechaVencimiento) - ahora) / (1000 * 60 * 60 * 24));

    if (diasTranscurridos <= 0 || diasTotales <= 0) return null;

    const respuestasActuales = await prisma.respuestaEncuesta.count({
      where: { encuesta_id: encuestaId }
    });

    const tasaDiaria = respuestasActuales / Math.max(diasTranscurridos, 1);
    return Math.round(tasaDiaria * diasTotales);
  }

  /**
   * Obtener distribución temporal
   */
  async obtenerDistribucionTemporal(encuestaId) {
    try {
      const respuestas = await prisma.respuestaEncuesta.findMany({
        where: { encuesta_id: encuestaId },
        select: { fecha_respuesta: true },
        orderBy: { fecha_respuesta: 'asc' }
      });

      // Agrupar por día
      const distribucionPorDia = {};
      
      respuestas.forEach(respuesta => {
        const fecha = new Date(respuesta.fecha_respuesta).toISOString().split('T')[0]; // YYYY-MM-DD
        if (!distribucionPorDia[fecha]) {
          distribucionPorDia[fecha] = 0;
        }
        distribucionPorDia[fecha]++;
      });

      const totalRespuestas = respuestas.length;
      const porDia = Object.entries(distribucionPorDia).map(([fecha, cantidad]) => ({
        fecha,
        respuestas: cantidad,
        porcentaje: Math.round((cantidad / totalRespuestas) * 100)
      }));

      return { por_dia: porDia };
    } catch (error) {
      console.error('Error al obtener distribución temporal:', error);
      return { por_dia: [] };
    }
  }

  /**
   * Generar insights automáticos
   */
  async generarInsights(encuestaId) {
    try {
      const encuesta = await prisma.encuesta.findUnique({
        where: { id: encuestaId },
        include: {
          preguntas: {
            include: {
              _count: {
                select: { respuestas: true }
              }
            }
          }
        }
      });

      if (!encuesta) {
        return {};
      }

      // Encontrar pregunta más/menos respondida
      const preguntasConRespuestas = encuesta.preguntas.map(p => ({
        pregunta_id: p.id,
        texto: p.texto,
        total_respuestas: p._count.respuestas
      }));

      const preguntaMasRespondida = preguntasConRespuestas.reduce((max, p) =>
        p.total_respuestas > max.total_respuestas ? p : max, preguntasConRespuestas[0]);
      
      const preguntaMenosRespondida = preguntasConRespuestas.reduce((min, p) =>
        p.total_respuestas < min.total_respuestas ? p : min, preguntasConRespuestas[0]);

      // Calcular tendencia de participación (comparar últimas 24h vs promedio diario)
      const hace48h = new Date();
      hace48h.setHours(hace48h.getHours() - 48);
      const hace24h = new Date();
      hace24h.setHours(hace24h.getHours() - 24);

      const respuestasUltimas24h = await prisma.respuestaEncuesta.count({
        where: {
          encuesta_id: encuestaId,
          fecha_respuesta: { gte: hace24h }
        }
      });

      const respuestas24hAnteriores = await prisma.respuestaEncuesta.count({
        where: {
          encuesta_id: encuestaId,
          fecha_respuesta: { gte: hace48h, lt: hace24h }
        }
      });

      let tendencia = 'estable';
      if (respuestasUltimas24h > respuestas24hAnteriores * 1.2) {
        tendencia = 'creciente';
      } else if (respuestasUltimas24h < respuestas24hAnteriores * 0.8) {
        tendencia = 'decreciente';
      }

      // Días restantes para vencer
      let diasRestantesParaVencer = null;
      if (encuesta.fecha_vencimiento) {
        const ahora = new Date();
        const fechaVenc = new Date(encuesta.fecha_vencimiento);
        const diffTime = fechaVenc - ahora;
        diasRestantesParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        pregunta_mas_respondida: {
          pregunta_id: preguntaMasRespondida?.pregunta_id,
          texto: preguntaMasRespondida?.texto,
          tasa_respuesta: preguntaMasRespondida?.total_respuestas
        },
        pregunta_menos_respondida: {
          pregunta_id: preguntaMenosRespondida?.pregunta_id,
          texto: preguntaMenosRespondida?.texto,
          tasa_respuesta: preguntaMenosRespondida?.total_respuestas
        },
        tendencia_participacion: tendencia,
        dias_restantes_para_vencer: diasRestantesParaVencer
      };
    } catch (error) {
      console.error('Error al generar insights:', error);
      return {};
    }
  }

  /**
   * Construir filtros de segmentación
   */
  async construirFiltrosSegmentacion(encuestaId, filtros, usuarioRol, usuarioId) {
    const whereClause = { encuesta_id: encuestaId };

    // Filtros adicionales según parámetros
    if (filtros.nivel) {
      // TODO: Implementar filtro por nivel cuando se tenga la relación
    }
    
    if (filtros.grado) {
      // TODO: Implementar filtro por grado cuando se tenga la relación
    }
    
    if (filtros.curso) {
      // TODO: Implementar filtro por curso cuando se tenga la relación
    }
    
    if (filtros.rol) {
      whereClause.usuario = {
        rol: filtros.rol
      };
    }

    // Restricciones según rol del usuario
    if (usuarioRol === 'apoderado') {
      // Padres solo pueden ver sus propias respuestas
      whereClause.usuario_id = usuarioId;
    } else if (usuarioRol === 'docente') {
      // Docentes solo pueden ver respuestas de sus encuestas (ya validado en permisos)
      // No se aplican restricciones adicionales
    }
    // Los directores ven todas las respuestas sin restricciones adicionales

    return whereClause;
  }

  /**
   * Parsear ordenamiento
   */
  parsearOrdenamiento(orderString) {
    if (!orderString) return { fecha_respuesta: 'desc' };
    
    const [campo, direccion] = orderString.split(' ');
    const campoMapeado = campo.toLowerCase() === 'fecha_respuesta' ? 'fecha_respuesta' : 'fecha_respuesta';
    
    return {
      [campoMapeado]: direccion && direccion.toLowerCase() === 'asc' ? 'asc' : 'desc'
    };
  }
}

module.exports = new EncuestasService();