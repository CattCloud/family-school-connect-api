'use strict';

const { PrismaClient } = require('@prisma/client');
const comunicadosService = require('../services/comunicadosService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ========================================
// BANDEJA DE COMUNICADOS (HU-COM-00)
// ========================================

/**
 * Obtener lista de comunicados del usuario con paginación y filtros
 */
const obtenerComunicadosController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      tipo = 'todos',
      estado_lectura = 'todos',
      fecha_inicio,
      fecha_fin,
      autor_id,
      nivel,
      grado,
      hijo_id,
      busqueda,
      solo_mis_comunicados = 'false'
    } = req.query;

    const usuario = req.user;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Construir filtros base
    let where = {
      estado: 'publicado',
      fecha_publicacion: { lte: new Date() }
    };

    // Aplicar segmentación automática según rol
    if (usuario.rol === 'padre') {
      // Obtener hijos del padre
      const estudiantes = await prisma.relacionesFamiliares.findMany({
        where: {
          apoderado_id: usuario.id,
          estado_activo: true,
          año_academico: 2025
        },
        include: {
          estudiante: {
            include: {
              nivel_grado: true
            }
          }
        }
      });

      const nivelesHijos = [...new Set(estudiantes.map(e => e.estudiante.nivel_grado.nivel))];
      const gradosHijos = [...new Set(estudiantes.map(e => e.estudiante.nivel_grado.grado))];

      where.AND = [
        {
          OR: [
            { publico_objetivo: { has: 'todos' } },
            {
              AND: [
                { publico_objetivo: { has: 'padres' } },
                {
                  OR: [
                    { niveles_objetivo: { hasSome: nivelesHijos } },
                    { grados_objetivo: { hasSome: gradosHijos } }
                  ]
                }
              ]
            }
          ]
        }
      ];
    } else if (usuario.rol === 'docente') {
      if (solo_mis_comunicados === 'true') {
        where.autor_id = usuario.id;
      } else {
        where.AND = [
          {
            OR: [
              { autor_id: usuario.id },
              { publico_objetivo: { has: 'todos' } },
              { publico_objetivo: { has: 'docentes' } }
            ]
          }
        ];
      }
    }
    // Director: sin filtros adicionales

    // Aplicar filtros adicionales
    if (tipo !== 'todos') {
      where.tipo = tipo;
    }

    if (autor_id) {
      where.autor_id = autor_id;
    }

    if (fecha_inicio || fecha_fin) {
      where.fecha_publicacion = {};
      if (fecha_inicio) where.fecha_publicacion.gte = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_publicacion.lte = new Date(fecha_fin + 'T23:59:59');
    }

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { contenido: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    // Contar total
    const total = await prisma.comunicado.count({ where });

    // Obtener comunicados
    const comunicados = await prisma.comunicado.findMany({
      where,
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
      orderBy: [
        { fecha_publicacion: 'desc' }
      ],
      skip: offset,
      take: limitNum
    });

    // Obtener estado de lectura para cada comunicado
    const comunicadosConLectura = await Promise.all(
      comunicados.map(async (comunicado) => {
        const lectura = await prisma.comunicadoLectura.findUnique({
          where: {
            comunicado_id_usuario_id: {
              comunicado_id: comunicado.id,
              usuario_id: usuario.id
            }
          }
        });

        // Generar preview del contenido
        const contenidoPreview = comunicadosService.generarPreviewContenido(comunicado.contenido);
        
        // Determinar si es nuevo (menos de 24 horas)
        const esNuevo = (Date.now() - comunicado.fecha_publicacion.getTime()) < (24 * 60 * 60 * 1000);

        // Generar texto de destinatarios
        const destinatariosTexto = comunicadosService.generarTextoDestinatarios(comunicado);

        return {
          ...comunicado,
          contenido_preview: contenidoPreview,
          fecha_publicacion_legible: comunicadosService.formatearFechaLegible(comunicado.fecha_publicacion),
          fecha_publicacion_relativa: comunicadosService.formatearFechaRelativa(comunicado.fecha_publicacion),
          destinatarios_texto: destinatariosTexto,
          estado_lectura: {
            leido: !!lectura,
            fecha_lectura: lectura?.fecha_lectura || null
          },
          es_nuevo: esNuevo,
          es_autor: comunicado.autor_id === usuario.id
        };
      })
    );

    // Contar comunicados no leídos
    const countWhere = { ...where };
    const comunicadosNoLeidos = await prisma.comunicadoLectura.findMany({
      where: {
        usuario_id: usuario.id,
        comunicado: countWhere
      },
      select: { comunicado_id: true }
    });

    const comunicadosLeidosIds = comunicadosNoLeidos.map(cl => cl.comunicado_id);
    const totalNoLeidos = total - comunicadosLeidosIds.length;

    return successResponse(res, 200, {
      usuario: {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellido}`,
        rol: usuario.rol
      },
      comunicados: comunicadosConLectura,
      paginacion: {
        page: pageNum,
        limit: limitNum,
        total_comunicados: total,
        total_pages: Math.ceil(total / limitNum),
        has_next: pageNum * limitNum < total,
        has_prev: pageNum > 1
      },
      contadores: {
        total,
        no_leidos: totalNoLeidos,
        leidos: total - totalNoLeidos
      },
      filtros_aplicados: {
        tipo,
        estado_lectura,
        fecha_inicio,
        fecha_fin,
        autor_id
      }
    });

  } catch (error) {
    logger.error('Error en obtenerComunicadosController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al obtener comunicados');
  }
};

/**
 * Obtener contador de comunicados no leídos
 */
const obtenerContadorNoLeidosController = async (req, res) => {
  try {
    const usuario = req.user;

    // Obtener comunicados visibles para el usuario
    const comunicadosVisibles = await comunicadosService.obtenerComunicadosVisibles(usuario);

    // Obtener comunicados ya leídos
    const comunicadosLeidos = await prisma.comunicadoLectura.findMany({
      where: {
        usuario_id: usuario.id,
        comunicado_id: { in: comunicadosVisibles.map(c => c.id) }
      },
      select: { comunicado_id: true }
    });

    const comunicadosLeidosIds = comunicadosLeidos.map(cl => cl.comunicado_id);
    const noLeidos = comunicadosVisibles.filter(c => !comunicadosLeidosIds.includes(c.id));

    // Contar por tipo
    const porTipo = {};
    noLeidos.forEach(comunicado => {
      porTipo[comunicado.tipo] = (porTipo[comunicado.tipo] || 0) + 1;
    });

    // Obtener últimos 3 no leídos
    const ultimos3 = noLeidos
      .sort((a, b) => b.fecha_publicacion - a.fecha_publicacion)
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        titulo: c.titulo,
        tipo: c.tipo,
        fecha_publicacion: c.fecha_publicacion
      }));

    return successResponse(res, 200, {
      total_no_leidos: noLeidos.length,
      por_tipo,
      ultimos_3: ultimos3
    });

  } catch (error) {
    logger.error('Error en obtenerContadorNoLeidosController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al obtener contador de no leídos');
  }
};

/**
 * Buscar comunicados por término
 */
const buscarComunicadosController = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;
    const usuario = req.user;

    if (!query || query.length < 2) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'El término de búsqueda debe tener al menos 2 caracteres');
    }

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    // Obtener comunicados visibles para el usuario
    const comunicadosVisibles = await comunicadosService.obtenerComunicadosVisibles(usuario);

    // Buscar en título y contenido
    const resultados = await prisma.comunicado.findMany({
      where: {
        id: { in: comunicadosVisibles.map(c => c.id) },
        OR: [
          { titulo: { contains: query, mode: 'insensitive' } },
          { contenido: { contains: query, mode: 'insensitive' } }
        ]
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
      },
      orderBy: [
        { fecha_publicacion: 'desc' }
      ],
      skip: offsetNum,
      take: limitNum
    });

    // Procesar resultados
    const resultadosProcesados = resultados.map(comunicado => {
      const contenidoPreview = comunicadosService.generarPreviewContenido(comunicado.contenido);
      
      // Determinar dónde encontró el match
      const matchEnTitulo = comunicado.titulo.toLowerCase().includes(query.toLowerCase());
      const matchEnContenido = comunicado.contenido.toLowerCase().includes(query.toLowerCase());
      
      let destacado = '';
      if (matchEnTitulo) {
        destacado = comunicadosService.resaltarTermino(comunicado.titulo, query);
      } else if (matchEnContenido) {
        destacado = comunicadosService.resaltarTermino(contenidoPreview, query);
      }

      return {
        id: comunicado.id,
        titulo: comunicado.titulo,
        tipo: comunicado.tipo,
        contenido_preview: contenidoPreview,
        fecha_publicacion: comunicado.fecha_publicacion,
        destacado,
        match_en: matchEnTitulo ? 'titulo' : 'contenido'
      };
    });

    // Contar total de resultados
    const totalResultados = await prisma.comunicado.count({
      where: {
        id: { in: comunicadosVisibles.map(c => c.id) },
        OR: [
          { titulo: { contains: query, mode: 'insensitive' } },
          { contenido: { contains: query, mode: 'insensitive' } }
        ]
      }
    });

    return successResponse(res, 200, {
      query,
      resultados: resultadosProcesados,
      total_resultados: totalResultados,
      paginacion: {
        limit: limitNum,
        offset: offsetNum,
        has_more: offsetNum + limitNum < totalResultados
      }
    });

  } catch (error) {
    logger.error('Error en buscarComunicadosController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al buscar comunicados');
  }
};

/**
 * Verificar actualizaciones de comunicados (polling)
 */
const verificarActualizacionesController = async (req, res) => {
  try {
    const { ultimo_check } = req.query;
    const usuario = req.user;

    if (!ultimo_check) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Se requiere el parámetro ultimo_check');
    }

    const ultimoCheckDate = new Date(ultimo_check);

    // Obtener comunicados visibles para el usuario
    const comunicadosVisibles = await comunicadosService.obtenerComunicadosVisibles(usuario);

    // Filtrar comunicados más recientes que el último check
    const nuevosComunicados = comunicadosVisibles.filter(
      c => c.fecha_publicacion > ultimoCheckDate
    );

    // Obtener comunicados ya leídos
    const comunicadosLeidos = await prisma.comunicadoLectura.findMany({
      where: {
        usuario_id: usuario.id,
        comunicado_id: { in: comunicadosVisibles.map(c => c.id) }
      },
      select: { comunicado_id: true }
    });

    const comunicadosLeidosIds = comunicadosLeidos.map(cl => cl.comunicado_id);
    const noLeidos = comunicadosVisibles.filter(c => !comunicadosLeidosIds.includes(c.id));

    // Procesar nuevos comunicados
    const nuevosComunicadosProcesados = await Promise.all(
      nuevosComunicados.map(async (comunicado) => {
        const autor = await prisma.usuario.findUnique({
          where: { id: comunicado.autor_id },
          select: { nombre: true, apellido: true }
        });

        const contenidoPreview = comunicadosService.generarPreviewContenido(comunicado.contenido);

        return {
          id: comunicado.id,
          titulo: comunicado.titulo,
          tipo: comunicado.tipo,
          autor: {
            nombre_completo: `${autor.nombre} ${autor.apellido}`
          },
          fecha_publicacion: comunicado.fecha_publicacion,
          contenido_preview: contenidoPreview
        };
      })
    );

    return successResponse(res, 200, {
      hay_actualizaciones: nuevosComunicados.length > 0,
      nuevos_comunicados: nuevosComunicadosProcesados,
      total_nuevos_comunicados: nuevosComunicados.length,
      contador_no_leidos: noLeidos.length
    });

  } catch (error) {
    logger.error('Error en verificarActualizacionesController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al verificar actualizaciones');
  }
};

// ========================================
// LEER COMUNICADO COMPLETO (HU-COM-01)
// ========================================

/**
 * Obtener comunicado completo
 */
const obtenerComunicadoController = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    // Obtener comunicado
    const comunicado = await prisma.comunicado.findUnique({
      where: { id },
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

    if (!comunicado) {
      return errorResponse(res, 404, 'COMUNICADO_NOT_FOUND', 'El comunicado no existe o ha sido eliminado');
    }

    // Validar acceso según rol
    const tieneAcceso = await comunicadosService.validarAccesoComunicado(usuario, comunicado);
    if (!tieneAcceso) {
      return errorResponse(res, 403, 'ACCESS_DENIED', 'No tienes permisos para ver este comunicado');
    }

    // Verificar si ya fue leído
    let lectura = await prisma.comunicadoLectura.findUnique({
      where: {
        comunicado_id_usuario_id: {
          comunicado_id: id,
          usuario_id: usuario.id
        }
      }
    });

    // Si no fue leído, marcar como leído
    if (!lectura) {
      lectura = await prisma.comunicadoLectura.create({
        data: {
          comunicado_id: id,
          usuario_id: usuario.id,
          fecha_lectura: new Date()
        }
      });
    }

    // Obtener estadísticas básicas (solo para autor o director)
    let estadisticasBasicas = null;
    if (usuario.id === comunicado.autor_id || usuario.rol === 'director') {
      const totalDestinatarios = await comunicadosService.calcularTotalDestinatarios(comunicado);
      const totalLecturas = await prisma.comunicadoLectura.count({
        where: { comunicado_id: id }
      });
      
      estadisticasBasicas = {
        total_destinatarios: totalDestinatarios,
        total_lecturas: totalLecturas,
        porcentaje_lectura: totalDestinatarios > 0 ? (totalLecturas / totalDestinatarios) * 100 : 0
      };
    }

    // Procesar destinatarios
    const destinatarios = {
      publico_objetivo: comunicado.publico_objetivo,
      niveles: comunicado.niveles_objetivo,
      grados: comunicado.grados_objetivo,
      cursos: comunicado.cursos_objetivo,
      texto_legible: comunicadosService.generarTextoDestinatarios(comunicado)
    };

    // Determinar permisos
    const permisos = {
      puede_editar: usuario.id === comunicado.autor_id || usuario.rol === 'director',
      puede_eliminar: usuario.rol === 'director',
      puede_ver_estadisticas: usuario.id === comunicado.autor_id || usuario.rol === 'director',
      es_autor: usuario.id === comunicado.autor_id
    };

    return successResponse(res, 200, {
      comunicado: {
        ...comunicado,
        fecha_publicacion_legible: comunicadosService.formatearFechaLegible(comunicado.fecha_publicacion),
        destinatarios,
        autor: {
          ...comunicado.autor,
          nombre_completo: `${comunicado.autor.nombre} ${comunicado.autor.apellido}`
        }
      },
      estado_lectura: {
        leido: !!lectura,
        fecha_lectura: lectura.fecha_lectura
      },
      permisos,
      estadisticas_basicas: estadisticasBasicas
    });

  } catch (error) {
    logger.error('Error en obtenerComunicadoController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al obtener comunicado');
  }
};

/**
 * Marcar comunicado como leído
 */
const marcarComoLeidoController = async (req, res) => {
  try {
    const { comunicado_id } = req.body;
    const usuario = req.user;

    if (!comunicado_id) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Se requiere el ID del comunicado');
    }

    // Verificar que el comunicado existe y el usuario tiene acceso
    const comunicado = await prisma.comunicado.findUnique({
      where: { id: comunicado_id }
    });

    if (!comunicado) {
      return errorResponse(res, 404, 'COMUNICADO_NOT_FOUND', 'El comunicado no existe');
    }

    const tieneAcceso = await comunicadosService.validarAccesoComunicado(usuario, comunicado);
    if (!tieneAcceso) {
      return errorResponse(res, 403, 'ACCESS_DENIED', 'No tienes permisos para este comunicado');
    }

    // Verificar si ya fue leído
    const lecturaExistente = await prisma.comunicadoLectura.findUnique({
      where: {
        comunicado_id_usuario_id: {
          comunicado_id,
          usuario_id: usuario.id
        }
      }
    });

    if (lecturaExistente) {
      // Ya fue leído anteriormente
      return successResponse(res, 200, {
        mensaje: 'El comunicado ya fue marcado como leído anteriormente',
        fecha_lectura_previa: lecturaExistente.fecha_lectura,
        nuevo_contador_no_leidos: await comunicadosService.contarNoLeidos(usuario)
      });
    }

    // Marcar como leído
    const lectura = await prisma.comunicadoLectura.create({
      data: {
        comunicado_id,
        usuario_id: usuario.id,
        fecha_lectura: new Date()
      }
    });

    // Obtener nuevo contador de no leídos
    const nuevoContadorNoLeidos = await comunicadosService.contarNoLeidos(usuario);

    return successResponse(res, 201, {
      lectura: {
        id: lectura.id,
        comunicado_id: lectura.comunicado_id,
        usuario_id: lectura.usuario_id,
        fecha_lectura: lectura.fecha_lectura
      },
      nuevo_contador_no_leidos: nuevoContadorNoLeidos
    });

  } catch (error) {
    logger.error('Error en marcarComoLeidoController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al marcar comunicado como leído');
  }
};

/**
 * Validar acceso a comunicado
 */
const validarAccesoController = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    // Obtener comunicado
    const comunicado = await prisma.comunicado.findUnique({
      where: { id }
    });

    if (!comunicado) {
      return successResponse(res, 200, {
        tiene_acceso: false,
        motivo: 'El comunicado no existe',
        puede_ver: false,
        puede_editar: false,
        puede_eliminar: false
      });
    }

    // Validar acceso
    const tieneAcceso = await comunicadosService.validarAccesoComunicado(usuario, comunicado);
    let motivo = '';

    if (usuario.rol === 'padre') {
      motivo = tieneAcceso 
        ? 'Comunicado dirigido al grado de su hijo' 
        : 'El comunicado no está dirigido a su rol o nivel';
    } else if (usuario.rol === 'docente') {
      motivo = tieneAcceso 
        ? 'Comunicado institucional o propio' 
        : 'El comunicado no está dirigido a tu rol';
    } else {
      motivo = tieneAcceso 
        ? 'Acceso completo como director' 
        : 'Acceso restringido';
    }

    // Determinar permisos específicos
    const puedeVer = tieneAcceso;
    const puedeEditar = tieneAcceso && (usuario.id === comunicado.autor_id || usuario.rol === 'director');
    const puedeEliminar = usuario.rol === 'director';

    return successResponse(res, 200, {
      tiene_acceso: tieneAcceso,
      motivo,
      puede_ver: puedeVer,
      puede_editar: puedeEditar,
      puede_eliminar: puedeEliminar
    });

  } catch (error) {
    logger.error('Error en validarAccesoController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al validar acceso al comunicado');
  }
};

// ========================================
// CREAR Y PUBLICAR COMUNICADO (HU-COM-02)
// ========================================

/**
 * Verificar permisos de creación de comunicados
 */
const verificarPermisosController = async (req, res) => {
  try {
    const { docente_id } = req.params;
    const solicitante = req.user;

    // El director siempre tiene permisos
    if (solicitante.rol === 'director') {
      return successResponse(res, 200, {
        docente: {
          id: solicitante.id,
          nombre_completo: `${solicitante.nombre} ${solicitante.apellido}`
        },
        permisos: {
          puede_crear_comunicados: true,
          estado_activo: true,
          es_director: true
        },
        restricciones: {
          tipos_permitidos: ['academico', 'administrativo', 'evento', 'urgente', 'informativo'],
          puede_segmentar_nivel: true,
          solo_sus_grados: false
        }
      });
    }

    // Verificar que solo el propio docente o un director puedan verificar permisos
    if (solicitante.rol !== 'director' && solicitante.id !== docente_id) {
      return errorResponse(res, 403, 'ACCESS_DENIED', 'No tienes permisos para ver esta información');
    }

    // Obtener información del docente
    const docente = await prisma.usuario.findUnique({
      where: { id: docente_id },
      select: {
        id: true,
        nombre: true,
        apellido: true
      }
    });

    if (!docente) {
      return errorResponse(res, 404, 'USER_NOT_FOUND', 'Docente no encontrado');
    }

    // Verificar permisos del docente
    const permiso = await prisma.permisoDocente.findFirst({
      where: {
        docente_id,
        tipo_permiso: 'comunicados',
        estado_activo: true,
        año_academico: 2025
      },
      include: {
        otorgante: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    const puedeCrearComunicados = !!permiso;

    // Obtener asignaciones del docente para determinar restricciones
    const asignaciones = await prisma.asignacionDocenteCurso.findMany({
      where: {
        docente_id,
        estado_activo: true,
        año_academico: 2025
      },
      include: {
        nivel_grado: true
      }
    });

    const nivelesPermitidos = [...new Set(asignaciones.map(a => a.nivel_grado.nivel))];
    const gradosPermitidos = [...new Set(asignaciones.map(a => a.nivel_grado.grado))];

    return successResponse(res, 200, {
      docente: {
        ...docente,
        nombre_completo: `${docente.nombre} ${docente.apellido}`
      },
      permisos: {
        puede_crear_comunicados: puedeCrearComunicados,
        estado_activo: puedeCrearComunicados,
        fecha_otorgamiento: permiso?.fecha_otorgamiento || null,
        otorgado_por: permiso?.otorgante ? {
          nombre_completo: `${permiso.otorgante.nombre} ${permiso.otorgante.apellido}`
        } : null,
        es_director: false
      },
      restricciones: {
        tipos_permitidos: puedeCrearComunicados ? ['academico', 'evento'] : [],
        puede_segmentar_nivel: false,
        solo_sus_grados: true,
        niveles_permitidos,
        grados_permitidos
      }
    });

  } catch (error) {
    logger.error('Error en verificarPermisosController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al verificar permisos');
  }
};

/**
 * Obtener cursos asignados a un docente
 */
const obtenerCursosDocenteController = async (req, res) => {
  try {
    const { docente_id } = req.params;
    const { año = 2025 } = req.query;
    const solicitante = req.user;

    // Verificar permisos: solo el propio docente o un director pueden ver esta información
    if (solicitante.rol !== 'director' && solicitante.id !== docente_id) {
      return errorResponse(res, 403, 'ACCESS_DENIED', 'No tienes permisos para ver esta información');
    }

    const añoNum = parseInt(año);

    // Obtener información del docente
    const docente = await prisma.usuario.findUnique({
      where: { id: docente_id },
      select: {
        id: true,
        nombre: true,
        apellido: true
      }
    });

    if (!docente) {
      return errorResponse(res, 404, 'USER_NOT_FOUND', 'Docente no encontrado');
    }

    // Obtener asignaciones del docente
    const asignaciones = await prisma.asignacionDocenteCurso.findMany({
      where: {
        docente_id,
        estado_activo: true,
        año_academico: añoNum
      },
      include: {
        nivel_grado: true,
        curso: true
      },
      orderBy: [
        { nivel_grado: { nivel: 'asc' } },
        { nivel_grado: { grado: 'asc' } }
      ]
    });

    // Organizar por nivel
    const cursosPorNivel = {};
    asignaciones.forEach(asignacion => {
      const nivel = asignacion.nivel_grado.nivel;
      
      if (!cursosPorNivel[nivel]) {
        cursosPorNivel[nivel] = [];
      }
      
      cursosPorNivel[nivel].push({
        id: asignacion.curso.id,
        nombre: asignacion.curso.nombre,
        codigo_curso: asignacion.curso.codigo_curso,
        grado: asignacion.nivel_grado.grado
      });
    });

    return successResponse(res, 200, {
      docente: {
        ...docente,
        nombre_completo: `${docente.nombre} ${docente.apellido}`
      },
      año_academico: añoNum,
      asignaciones: cursosPorNivel,
      grados_unicos: [...new Set(asignaciones.map(a => a.nivel_grado.grado))],
      niveles_unicos: [...new Set(asignaciones.map(a => a.nivel_grado.nivel))],
      total_cursos: asignaciones.length
    });

  } catch (error) {
    logger.error('Error en obtenerCursosDocenteController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al obtener cursos del docente');
  }
};

/**
 * Obtener todos los niveles y grados (solo director)
 */
const obtenerNivelesGradosController = async (req, res) => {
  try {
    const usuario = req.user;

    // Solo el director puede ver todos los niveles y grados
    if (usuario.rol !== 'director') {
      return errorResponse(res, 403, 'ACCESS_DENIED', 'Solo los directores pueden ver todos los niveles y grados');
    }

    // Obtener todos los niveles y grados
    const nivelesGrados = await prisma.nivelGrado.findMany({
      where: { estado_activo: true },
      orderBy: [
        { nivel: 'asc' },
        { grado: 'asc' }
      ]
    });

    // Organizar por nivel
    const jerarquia = {};
    nivelesGrados.forEach(ng => {
      if (!jerarquia[ng.nivel]) {
        jerarquia[ng.nivel] = [];
      }
      
      jerarquia[ng.nivel].push({
        id: ng.id,
        grado: ng.grado,
        descripcion: ng.descripcion
      });
    });

    return successResponse(res, 200, {
      jerarquia
    });

  } catch (error) {
    logger.error('Error en obtenerNivelesGradosController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al obtener niveles y grados');
  }
};

/**
 * Calcular destinatarios estimados (preview)
 */
const calcularDestinatariosPreviewController = async (req, res) => {
  try {
    const {
      publico_objetivo,
      niveles,
      grados,
      cursos,
      todos = false
    } = req.body;
    const solicitante = req.user;

    // Validar datos de entrada
    if (!publico_objetivo || !Array.isArray(publico_objetivo) || publico_objetivo.length === 0) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Se requiere público objetivo');
    }

    const segmentacion = {
      publico_objetivo,
      niveles: niveles || [],
      grados: grados || [],
      cursos: cursos || [],
      todos
    };

    // Calcular destinatarios
    const destinatarios = await comunicadosService.calcularDestinatarios(segmentacion, solicitante);

    // Generar texto legible
    const textoLegible = comunicadosService.generarTextoDestinatariosSegmentacion(segmentacion, destinatarios);

    return successResponse(res, 200, {
      segmentacion,
      destinatarios: {
        total_estimado: destinatarios.total,
        desglose: {
          padres: destinatarios.padres,
          docentes: destinatarios.docentes
        }
      },
      texto_legible: textoLegible
    });

  } catch (error) {
    logger.error('Error en calcularDestinatariosPreviewController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al calcular destinatarios');
  }
};

/**
 * Crear comunicado (Publicado o Borrador)
 */
const crearComunicadoController = async (req, res) => {
  try {
    const {
      titulo,
      tipo,
      contenido_html,
      publico_objetivo,
      niveles,
      grados,
      cursos,
      fecha_programada
    } = req.body;
    const usuario = req.user;

    // Validar datos de entrada
    if (!titulo || !tipo || !contenido_html || !publico_objetivo) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Faltan campos requeridos');
    }

    if (titulo.length < 10 || titulo.length > 200) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'El título debe tener entre 10 y 200 caracteres');
    }

    if (contenido_html.length < 20 || contenido_html.length > 5000) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'El contenido debe tener entre 20 y 5000 caracteres');
    }

    // Preparar datos para el servicio
    const datos = {
      titulo,
      tipo,
      contenido_html,
      publico_objetivo,
      niveles,
      grados,
      cursos,
      fecha_programada,
      estado: 'publicado'
    };

    // Crear comunicado
    const comunicado = await comunicadosService.crearComunicado(datos, usuario);

    // Generar notificaciones (si se publica inmediatamente)
    if (!fecha_programada) {
      try {
        await comunicadosService.generarNotificaciones(comunicado, usuario);
      } catch (notifError) {
        logger.error('Error al generar notificaciones:', notifError);
        // No fallar la creación del comunicado si fallan las notificaciones
      }
    }

    return successResponse(res, 201, {
      comunicado,
      mensaje: fecha_programada 
        ? 'Comunicado programado correctamente' 
        : 'Comunicado publicado correctamente'
    });

  } catch (error) {
    logger.error('Error en crearComunicadoController:', error);
    
    if (error.message.includes('No tienes permisos')) {
      return errorResponse(res, 403, 'ACCESS_DENIED', error.message);
    }
    
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al crear comunicado');
  }
};

/**
 * Guardar borrador de comunicado
 */
const guardarBorradorController = async (req, res) => {
  try {
    const {
      titulo,
      tipo,
      contenido_html,
      publico_objetivo,
      niveles,
      grados,
      cursos
    } = req.body;
    const usuario = req.user;

    // Validar datos de entrada
    if (!titulo || !tipo || !contenido_html || !publico_objetivo) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Faltan campos requeridos');
    }

    // Preparar datos para el servicio
    const datos = {
      titulo,
      tipo,
      contenido_html,
      publico_objetivo,
      niveles,
      grados,
      cursos,
      estado: 'borrador'
    };

    // Guardar borrador
    const borrador = await comunicadosService.guardarBorrador(datos, usuario);

    return successResponse(res, 201, {
      comunicado: borrador,
      mensaje: 'Borrador guardado correctamente'
    });

  } catch (error) {
    logger.error('Error en guardarBorradorController:', error);
    
    if (error.message.includes('No tienes permisos')) {
      return errorResponse(res, 403, 'ACCESS_DENIED', error.message);
    }
    
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al guardar borrador');
  }
};

// ========================================
// GESTIÓN DE COMUNICADOS PROPIOS (HU-COM-03)
// ========================================

/**
 * Editar comunicado
 */
const editarComunicadoController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      tipo,
      contenido_html,
      publico_objetivo,
      niveles,
      grados,
      cursos
    } = req.body;
    const usuario = req.user;

    // Validar datos de entrada
    if (!titulo || !tipo || !contenido_html || !publico_objetivo) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Faltan campos requeridos');
    }

    // Preparar datos para el servicio
    const datos = {
      titulo,
      tipo,
      contenido_html,
      publico_objetivo,
      niveles,
      grados,
      cursos
    };

    // Editar comunicado
    const comunicadoActualizado = await comunicadosService.editarComunicado(id, datos, usuario);

    return successResponse(res, 200, {
      comunicado: comunicadoActualizado,
      mensaje: 'Comunicado actualizado correctamente'
    });

  } catch (error) {
    logger.error('Error en editarComunicadoController:', error);
    
    if (error.message.includes('No tienes permisos') || error.message.includes('Solo puedes editar')) {
      return errorResponse(res, 403, 'ACCESS_DENIED', error.message);
    }
    
    if (error.message.includes('Comunicado no encontrado')) {
      return errorResponse(res, 404, 'COMUNICADO_NOT_FOUND', error.message);
    }
    
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al editar comunicado');
  }
};

/**
 * Obtener mis borradores
 */
const obtenerMisBorradoresController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const usuario = req.user;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const resultado = await comunicadosService.listarBorradores(usuario, pageNum, limitNum);

    return successResponse(res, 200, resultado);

  } catch (error) {
    logger.error('Error en obtenerMisBorradoresController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al obtener borradores');
  }
};

/**
 * Publicar borrador
 */
const publicarBorradorController = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_programada } = req.body;
    const usuario = req.user;

    // Preparar datos para el servicio
    const datos = {};
    if (fecha_programada) {
      datos.fecha_programada = fecha_programada;
    }

    // Publicar borrador
    const comunicadoActualizado = await comunicadosService.publicarBorrador(id, datos, usuario);

    // Generar notificaciones si se publica inmediatamente
    if (!fecha_programada) {
      try {
        await comunicadosService.generarNotificaciones(comunicadoActualizado, usuario);
      } catch (notifError) {
        logger.error('Error al generar notificaciones:', notifError);
        // No fallar la publicación si fallan las notificaciones
      }
    }

    return successResponse(res, 200, {
      comunicado: comunicadoActualizado,
      mensaje: fecha_programada 
        ? 'Comunicado programado correctamente' 
        : 'Comunicado publicado correctamente'
    });

  } catch (error) {
    logger.error('Error en publicarBorradorController:', error);
    
    if (error.message.includes('No tienes permisos')) {
      return errorResponse(res, 403, 'ACCESS_DENIED', error.message);
    }
    
    if (error.message.includes('Comunicado no encontrado')) {
      return errorResponse(res, 404, 'COMUNICADO_NOT_FOUND', error.message);
    }
    
    if (error.message.includes('Solo se pueden publicar')) {
      return errorResponse(res, 400, 'INVALID_STATE', error.message);
    }
    
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al publicar borrador');
  }
};

/**
 * Obtener comunicados programados
 */
const obtenerComunicadosProgramadosController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const usuario = req.user;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const resultado = await comunicadosService.listarComunicadosProgramados(usuario, pageNum, limitNum);

    return successResponse(res, 200, resultado);

  } catch (error) {
    logger.error('Error en obtenerComunicadosProgramadosController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al obtener comunicados programados');
  }
};

/**
 * Cancelar programación de comunicado
 */
const cancelarProgramacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    // Cancelar programación
    const comunicadoActualizado = await comunicadosService.cancelarProgramacion(id, usuario);

    return successResponse(res, 200, {
      comunicado: comunicadoActualizado,
      mensaje: 'Programación cancelada correctamente'
    });

  } catch (error) {
    logger.error('Error en cancelarProgramacionController:', error);
    
    if (error.message.includes('No tienes permisos')) {
      return errorResponse(res, 403, 'ACCESS_DENIED', error.message);
    }
    
    if (error.message.includes('Comunicado no encontrado')) {
      return errorResponse(res, 404, 'COMUNICADO_NOT_FOUND', error.message);
    }
    
    if (error.message.includes('Solo se puede cancelar')) {
      return errorResponse(res, 400, 'INVALID_STATE', error.message);
    }
    
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al cancelar programación');
  }
};

// ========================================
// VALIDACIONES
// ========================================

/**
 * Validar HTML
 */
const validarHtmlController = async (req, res) => {
  try {
    const { contenido } = req.body;

    if (!contenido) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Se requiere el contenido HTML');
    }

    const resultado = comunicadosService.validarHTML(contenido);

    return successResponse(res, 200, resultado);

  } catch (error) {
    logger.error('Error en validarHtmlController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al validar HTML');
  }
};

/**
 * Validar segmentación
 */
const validarSegmentacionController = async (req, res) => {
  try {
    const {
      publico_objetivo,
      niveles,
      grados,
      cursos,
      todos = false
    } = req.body;
    const usuario = req.user;

    if (!publico_objetivo) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Se requiere público objetivo');
    }

    const segmentacion = {
      publico_objetivo,
      niveles: niveles || [],
      grados: grados || [],
      cursos: cursos || [],
      todos
    };

    const resultado = await comunicadosService.validarSegmentacion(segmentacion, usuario);

    return successResponse(res, 200, resultado);

  } catch (error) {
    logger.error('Error en validarSegmentacionController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al validar segmentación');
  }
};

// ========================================
// GESTIÓN ADMINISTRATIVA (SOLO DIRECTOR)
// ========================================

/**
 * Desactivar comunicado
 */
const desactivarComunicadoController = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    // Solo director puede desactivar comunicados
    if (usuario.rol !== 'director') {
      return errorResponse(res, 403, 'ACCESS_DENIED', 'Solo los directores pueden desactivar comunicados');
    }

    // Actualizar comunicado a desactivado
    const comunicadoActualizado = await prisma.comunicado.update({
      where: { id },
      data: {
        estado: 'desactivado',
        fecha_desactivacion: new Date()
      }
    });

    return successResponse(res, 200, {
      comunicado_id: comunicadoActualizado.id,
      estado: 'desactivado',
      fecha_desactivacion: comunicadoActualizado.fecha_desactivacion,
      mensaje: 'Comunicado desactivado correctamente. Ya no es visible para los destinatarios'
    });

  } catch (error) {
    logger.error('Error en desactivarComunicadoController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al desactivar comunicado');
  }
};

/**
 * Eliminar comunicado
 */
const eliminarComunicadoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmacion, motivo } = req.body;
    const usuario = req.user;

    // Solo director puede eliminar comunicados
    if (usuario.rol !== 'director') {
      return errorResponse(res, 403, 'ACCESS_DENIED', 'Solo los directores pueden eliminar comunicados');
    }

    // Requerir confirmación explícita
    if (!confirmacion) {
      return errorResponse(res, 400, 'INVALID_PARAMETERS', 'Se requiere confirmación explícita para eliminar');
    }

    // Eliminar registros relacionados en comunicados_lecturas
    await prisma.comunicadoLectura.deleteMany({
      where: { comunicado_id: id }
    });

    // Eliminar comunicado
    await prisma.comunicado.delete({
      where: { id }
    });

    return successResponse(res, 200, {
      comunicado_id: id,
      eliminado: true,
      fecha_eliminacion: new Date(),
      mensaje: 'Comunicado eliminado permanentemente'
    });

  } catch (error) {
    logger.error('Error en eliminarComunicadoController:', error);
    return errorResponse(res, 500, 'INTERNAL_ERROR', 'Error al eliminar comunicado');
  }
};

module.exports = {
  // Bandeja de comunicados
  obtenerComunicadosController,
  obtenerContadorNoLeidosController,
  buscarComunicadosController,
  verificarActualizacionesController,
  
  // Leer comunicado completo
  obtenerComunicadoController,
  marcarComoLeidoController,
  validarAccesoController,
  
  // Crear y publicar comunicado
  verificarPermisosController,
  obtenerCursosDocenteController,
  obtenerNivelesGradosController,
  calcularDestinatariosPreviewController,
  crearComunicadoController,
  guardarBorradorController,
  
  // Gestión de comunicados propios
  editarComunicadoController,
  obtenerMisBorradoresController,
  publicarBorradorController,
  obtenerComunicadosProgramadosController,
  cancelarProgramacionController,
  
  // Validaciones
  validarHtmlController,
  validarSegmentacionController,
  
  // Gestión administrativa
  desactivarComunicadoController,
  eliminarComunicadoController
};