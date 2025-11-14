# Plan de Implementación Backend - Endpoints de Resultados de Encuestas

**Fecha:** 2025-11-12  
**Objetivo:** Implementar 3 endpoints mínimos para mostrar resultados básicos en la interfaz de respuesta de encuesta  

---

## **RESUMEN EJECUTIVO**

Se implementarán 3 nuevos endpoints en el backend para completar la funcionalidad básica del módulo de encuestas:

1. **GET /encuestas/:id/resultados/preguntas** - Resultados agregados por pregunta
2. **GET /encuestas/:id/estadisticas** - Métricas generales y KPIs  
3. **GET /respuestas-encuestas** - Tabla paginada de respuestas (con filtros)

**Tiempo estimado:** 8-12 horas de desarrollo  
**Prioridad:** Alta - desbloquea la interfaz básica de resultados  

---

## **ARQUITECTURA ACTUAL**

### **Archivos Base Existentes:**
- **Servicio:** [services/encuestasService.js](services/encuestasService.js)
- **Controlador:** [controllers/encuestasController.js](controllers/encuestasController.js)
- **Router:** [routes/encuestas.js](routes/encuestas.js)
- **Esquema:** [prisma/schema.prisma](prisma/schema.prisma)

### **Métodos Ya Implementados:**
```javascript
// En encuestasService.js - Líneas 52-1421
- crearEncuesta()                    // ✅ Implementado
- obtenerEncuestas()                 // ✅ Implementado  
- obtenerContadorPendientes()        // ✅ Implementado
- validarAccesoEncuesta()            // ✅ Implementado
- obtenerFormularioEncuesta()        // ✅ Implementado
- enviarRespuestas()                 // ✅ Implementado
- obtenerMisRespuestas()             // ✅ Implementado
```

---

## **IMPLEMENTACIÓN PASO A PASO**

### **FASE 1: Extender el Servicio (2-3 horas)**

#### **1.1 Agregar métodos al servicio existente**

**Archivo:** [services/encuestasService.js](services/encuestasService.js:1423) - **agregar al final de la clase**

```javascript
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
    const { z } = require('zod');
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
        resultados
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
          total_respuestas: totalRespuestas,
          porcentaje_participacion: Math.round((totalRespuestas / 100) * 100), // TODO: destinatarios reales
          tiempo_promedio_respuesta_minutos: tiempoPromedio,
          tasa_completitud: tasaCompletitud,
          respuestas_ultimas_24h: respuestasUltimas24h,
          proyeccion_total_estimado: proyeccionTotal
        },
        distribucion_temporal: distribucionTemporal,
        insights
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
    const { z } = require('zod');
    const tablaSchema = z.object({
      encuesta_id: z.string().uuid(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
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

    const skip = (page - 1) * limit;

    // Construir filtros de segmentación
    const whereClause = await this.construirFiltrosSegmentacion(encuesta_id, filtrosValidados, usuarioRol);

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
        filtros_aplicados: {
          encuesta_id,
          nivel: filtrosValidados.nivel || null,
          grado: filtrosValidados.grado || null,
          curso: filtrosValidados.curso || null,
          rol: filtrosValidados.rol || null,
          page,
          limit
        },
        respuestas: respuestasProcesadas,
        paginacion: {
          page,
          limit,
          total_respuestas: totalRespuestas,
          total_pages: Math.ceil(totalRespuestas / limit),
          has_next: page < Math.ceil(totalRespuestas / limit),
          has_prev: page > 1
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
  respuestasPregunta.forEach(respuesta => {
    if (respuesta.valor_opciones) {
      respuesta.valor_opciones.forEach(opcionId => {
        if (conteos[opcionId]) {
          conteos[opcionId].cantidad++;
        }
      });
    }
  });

  // Calcular porcentajes (base: total de respuestas, no suma de selecciones)
  const total = respuestasPregunta.length;
  Object.values(conteos).forEach(conteo => {
    conteo.porcentaje = total > 0 ? Math.round((conteo.cantidad / total) * 100) : 0;
  });

  return {
    tipo: 'opciones_multiples',
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

// ... otros métodos auxiliares (calcularTiempoPromedioRespuesta, etc.)
```

#### **1.2 Métodos auxiliares para cálculos (agregar al final de la clase)**

```javascript
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

  const respuestasCompletas = await prisma.respuestaEncuesta.count({
    where: {
      encuesta_id: encuestaId,
      respuestasPregunta: {
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
  const diasTranscurridos = Math.ceil((ahora - new Date()) / (1000 * 60 * 60 * 24));
  const diasTotales = Math.ceil((new Date(fechaVencimiento) - ahora) / (1000 * 60 * 60 * 24));

  if (diasTranscurridos <= 0 || diasTotales <= 0) return null;

  const respuestasActuales = await prisma.respuestaEncuesta.count({
    where: { encuesta_id: encuestaId }
  });

  const tasaDiaria = respuestasActuales / diasTranscurridos;
  return Math.round(tasaDiaria * diasTotales);
}

/**
 * Obtener distribución temporal
 */
async obtenerDistribucionTemporal(encuestaId) {
  // Implementar distribución por día y por hora
  // Retornar formato requerido por la especificación
}

/**
 * Generar insights automáticos
 */
async generarInsights(encuestaId) {
  // Implementar lógica para encontrar:
  // - Pregunta más/menos respondida
  // - Opción más seleccionada
  // - Tendencia de participación
  // - Días restantes para vencer
}

/**
 * Construir filtros de segmentación
 */
async construirFiltrosSegmentacion(encuestaId, filtros, usuarioRol) {
  // Implementar filtros según rol:
  // - Padres: solo sus respuestas
  // - Docentes: respuestas de sus encuestas
  // - Directores: todas las respuestas
}

/**
 * Parsear ordenamiento
 */
parsearOrdenamiento(orderString) {
  const [campo, direccion] = orderString.split(' ');
  return { [campo.toLowerCase()]: direccion.toLowerCase() === 'asc' ? 'asc' : 'desc' };
}
```

### **FASE 2: Extender el Controlador (1-2 horas)**

#### **2.1 Agregar métodos al controlador**

**Archivo:** [controllers/encuestasController.js](controllers/encuestasController.js:264) - **agregar al final de la clase**

```javascript
/**
 * Obtener resultados agregados por pregunta
 */
async obtenerResultadosPorPregunta(req, res) {
  try {
    const { id: usuarioId, rol: usuarioRol } = req.user;
    const { id } = req.params;
    const { incluir_respuestas_texto = true, limite_respuestas_texto = 10 } = req.query;

    const resultado = await encuestasService.obtenerResultadosPorPregunta(id, {
      usuarioId,
      usuarioRol,
      incluir_respuestas_texto: incluir_respuestas_texto === 'true',
      limite_respuestas_texto: parseInt(limite_respuestas_texto)
    });

    if (!resultado.success) {
      return res.status(resultado.error.code === 'FORBIDDEN' ? 403 : 404).json(resultado);
    }

    return res.status(200).json(resultado);
  } catch (err) {
    console.error('Error en el controlador al obtener resultados por pregunta:', err);
    return res.status(500).json(error('Error al obtener resultados por pregunta'));
  }
}

/**
 * Obtener estadísticas generales de encuesta
 */
async obtenerEstadisticasGenerales(req, res) {
  try {
    const { id: usuarioId, rol: usuarioRol } = req.user;
    const { id } = req.params;

    const resultado = await encuestasService.obtenerEstadisticasGenerales(id, usuarioId, usuarioRol);

    if (!resultado.success) {
      return res.status(resultado.error.code === 'FORBIDDEN' ? 403 : 404).json(resultado);
    }

    return res.status(200).json(resultado);
  } catch (err) {
    console.error('Error en el controlador al obtener estadísticas generales:', err);
    return res.status(500).json(error('Error al obtener estadísticas generales'));
  }
}

/**
 * Obtener tabla paginada de respuestas
 */
async obtenerTablaRespuestas(req, res) {
  try {
    const { id: usuarioId, rol: usuarioRol } = req.user;
    const { 
      encuesta_id,
      page = 1,
      limit = 20,
      nivel,
      grado,
      curso,
      rol,
      order = 'fecha_respuesta DESC'
    } = req.query;

    // Validar encuesta_id requerido
    if (!encuesta_id) {
      return res.status(400).json(badRequest('El parámetro encuesta_id es requerido'));
    }

    const resultado = await encuestasService.obtenerTablaRespuestas({
      encuesta_id,
      page: parseInt(page),
      limit: parseInt(limit),
      nivel,
      grado,
      curso,
      rol,
      order
    }, usuarioId, usuarioRol);

    if (!resultado.success) {
      return res.status(resultado.error.code === 'FORBIDDEN' ? 403 : 400).json(resultado);
    }

    return res.status(200).json(resultado);
  } catch (err) {
    console.error('Error en el controlador al obtener tabla de respuestas:', err);
    return res.status(500).json(error('Error al obtener tabla de respuestas'));
  }
}
```

### **FASE 3: Extender el Router (30 minutos)**

#### **3.1 Agregar rutas al router**

**Archivo:** [routes/encuestas.js](routes/encuestas.js:55) - **agregar antes de module.exports**

```javascript
// SECCIÓN 6: RESULTADOS DE ENCUESTA (HU-ENC-05)

// 10. Obtener resultados agregados por pregunta
// GET /encuestas/:id/resultados/preguntas?incluir_respuestas_texto=true&limite_respuestas_texto=10
router.get('/:id/resultados/preguntas', encuestasController.obtenerResultadosPorPregunta);

// 11. Obtener estadísticas generales de encuesta
// GET /encuestas/:id/estadisticas
router.get('/:id/estadisticas', encuestasController.obtenerEstadisticasGenerales);

// 12. Obtener tabla paginada de respuestas
// GET /respuestas-encuestas?encuesta_id=&page=&limit=&nivel=&grado=&curso=&rol=&order=
router.get('/respuestas-encuestas', encuestasController.obtenerTablaRespuestas);

// También agregar ruta alternativa para mantener compatibilidad con frontend
// GET /encuestas/:id/respuestas (alias)
router.get('/:id/respuestas', encuestasController.obtenerTablaRespuestas);
```

### **FASE 4: Validaciones y Tests (1-2 horas)**

#### **4.1 Validaciones de seguridad**

**Implementar en el servicio:**
- Verificación de permisos por rol
- Validación de UUIDs
- Sanitización de parámetros de búsqueda
- Rate limiting para endpoints de resultados

#### **4.2 Queries de Prisma optimizadas**

**Optimizaciones sugeridas:**
- Índices en `respuestas_encuestas.encuesta_id`
- Índices en `respuestas_pregunta.pregunta_id`
- Considerar índices compuestos para filtros de segmentación

#### **4.3 Tests unitarios**

**Crear tests para:**
- `obtenerResultadosPorPregunta()` - diferentes tipos de pregunta
- `obtenerEstadisticasGenerales()` - métricas calculadas
- `obtenerTablaRespuestas()` - paginación y filtros
- Permisos por rol
- Casos de error (404, 403, 500)

---

## **CONSIDERACIONES TÉCNICAS**

### **Seguridad y Permisos**
- ✅ Reutilizar lógica de `validarAccesoEncuesta()` para resultados
- ✅ Solo autor/director/usuarios que respondieron pueden ver resultados
- ✅ Aplicar segmentación automática según rol
- ✅ Rate limiting: 50 req/min para endpoints de resultados

### **Rendimiento**
- ✅ Paginación obligatoria en tabla de respuestas
- ✅ Límite en respuestas de texto para preservar privacidad
- ✅ Cache de agregaciones por 5 minutos (opcional)
- ✅ Índices optimizados en consultas de agregación

### **Compatibilidad**
- ✅ Mantener esquema de respuesta consistente con endpoints existentes
- ✅ Usar mismos códigos de error y estructura de respuesta
- ✅ Reutilizar utilidades existentes (`success`, `error`, `notFound`, etc.)

---

## **CASOS DE PRUEBA RECOMENDADOS**

### **Tests de Permisos**
```javascript
// Padre intenta ver resultados de encuesta ajena → 403
// Director ve resultados de cualquier encuesta → 200
// Autor ve resultados de su encuesta → 200
// Usuario que no ha respondido ve resultados públicos → 200
```

### **Tests de Agregación**
```javascript
// Pregunta de texto: muestra aleatoria de respuestas
// Opción única: porcentajes correctos
// Opción múltiple: porcentajes basados en total de respuestas
// Escala: promedio, mediana y distribución correctos
```

### **Tests de Rendimiento**
```javascript
// Encuesta con 1000+ respuestas no debe timeout
// Paginación funciona correctamente
// Filtros reducen el conjunto de resultados
```

---

## **DEPENDENCIAS Y PREREQUISITOS**

### **Base de Datos**
- ✅ Prisma client actualizado
- ✅ Tablas `encuestas`, `preguntas_encuesta`, `respuestas_encuestas` existentes
- ✅ Índices ya creados en schema.prisma

### **NPM Packages**
- ✅ `zod` ya instalado (para validaciones)
- ✅ `@prisma/client` ya instalado
- ✅ Utilidades de respuesta ya disponibles

### **Middleware**
- ✅ `auth.js` ya aplica a todas las rutas de encuestas
- ✅ `rateLimiter.js` disponible para aplicar límites específicos

---

## **ORDEN DE IMPLEMENTACIÓN RECOMENDADO**

### **Sprint 1 (4 horas):**
1. **Agregar métodos al servicio** - core logic
2. **Agregar métodos al controlador** - HTTP handlers
3. **Agregar rutas al router** - endpoints básicos

### **Sprint 2 (2 horas):**
4. **Implementar métodos auxiliares** - cálculos y agregaciones
5. **Optimizar queries Prisma** - rendimiento

### **Sprint 3 (2 horas):**
6. **Testing completo** - unit tests y casos edge
7. **Documentación** - Swagger/OpenAPI specs (opcional)

---

## **VALIDACIÓN POST-IMPLEMENTACIÓN**

### **Checklist de Funcionalidad**
- [ ] `GET /encuestas/:id/resultados/preguntas` retorna datos agregados correctos
- [ ] `GET /encuestas/:id/estadisticas` calcula métricas precisas
- [ ] `GET /respuestas-encuestas` paginates correctamente con filtros
- [ ] Permisos se aplican correctamente por rol
- [ ] Casos de error manejados apropiadamente (404, 403, 500)
- [ ] Performance aceptable con datasets grandes

### **Validación con Frontend**
- [ ] UI puede renderizar resultados de `/resultados/preguntas`
- [ ] Dashboard muestra métricas de `/estadisticas`
- [ ] Tabla paginada funciona con `/respuestas-encuestas`
- [ ] Estados de carga y error manejados correctamente

---

**Fin del Plan de Implementación Backend**