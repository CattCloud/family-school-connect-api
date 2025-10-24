const { PrismaClient } = require('@prisma/client');
const { badRequest, forbidden, notFound } = require('../utils/response');

const prisma = new PrismaClient();

class EncuestasMiddleware {
  // Verificar si el usuario tiene permisos para crear encuestas
  async puedeCrearEncuestas(req, res, next) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.usuario;
      
      // Los directores siempre pueden crear encuestas
      if (usuarioRol === 'director') {
        return next();
      }
      
      // Los docentes necesitan tener permisos explícitos
      if (usuarioRol === 'docente') {
        const permiso = await prisma.permisoDocente.findFirst({
          where: {
            docente_id: usuarioId,
            tipo_permiso: 'encuestas',
            estado_activo: true
          }
        });
        
        if (!permiso) {
          return res.status(403).json(forbidden('No tienes permisos para crear encuestas'));
        }
      } else {
        // Los padres no pueden crear encuestas
        return res.status(403).json(forbidden('Los padres no pueden crear encuestas'));
      }
      
      next();
    } catch (error) {
      console.error('Error al verificar permisos para crear encuestas:', error);
      return res.status(500).json({ error: 'Error al verificar permisos' });
    }
  }
  
  // Verificar si el usuario puede gestionar una encuesta específica
  async puedeGestionarEncuesta(req, res, next) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.usuario;
      const { id } = req.params;
      
      // Obtener la encuesta
      const encuesta = await prisma.encuesta.findUnique({
        where: {
          id: id
        }
      });
      
      if (!encuesta) {
        return res.status(404).json(notFound('Encuesta no encontrada'));
      }
      
      // Los directores pueden gestionar cualquier encuesta
      if (usuarioRol === 'director') {
        req.encuesta = encuesta;
        return next();
      }
      
      // Los docentes solo pueden gestionar sus propias encuestas
      if (usuarioRol === 'docente' && encuesta.autor_id === usuarioId) {
        req.encuesta = encuesta;
        return next();
      }
      
      return res.status(403).json(forbidden('No tienes permisos para gestionar esta encuesta'));
    } catch (error) {
      console.error('Error al verificar permisos para gestionar encuesta:', error);
      return res.status(500).json({ error: 'Error al verificar permisos' });
    }
  }
  
  // Verificar si el usuario puede ver los resultados de una encuesta
  async puedeVerResultados(req, res, next) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.usuario;
      const { id } = req.params;
      
      // Obtener la encuesta
      const encuesta = await prisma.encuesta.findUnique({
        where: {
          id: id
        },
        include: {
          autor: {
            select: {
              id: true,
              rol: true
            }
          }
        }
      });
      
      if (!encuesta) {
        return res.status(404).json(notFound('Encuesta no encontrada'));
      }
      
      // Los directores siempre pueden ver los resultados
      if (usuarioRol === 'director') {
        req.encuesta = encuesta;
        return next();
      }
      
      // El autor de la encuesta siempre puede ver los resultados
      if (encuesta.autor_id === usuarioId) {
        req.encuesta = encuesta;
        return next();
      }
      
      // Si la encuesta permite mostrar resultados públicos
      if (encuesta.mostrar_resultados) {
        // Verificar si el usuario ha respondido la encuesta
        const respuestaUsuario = await prisma.respuestaEncuesta.findUnique({
          where: {
            encuesta_id_usuario_id: {
              encuesta_id: id,
              usuario_id: usuarioId
            }
          }
        });
        
        if (respuestaUsuario) {
          req.encuesta = encuesta;
          return next();
        }
      }
      
      return res.status(403).json(forbidden('No tienes permisos para ver los resultados de esta encuesta'));
    } catch (error) {
      console.error('Error al verificar permisos para ver resultados:', error);
      return res.status(500).json({ error: 'Error al verificar permisos' });
    }
  }
  
  // Validar datos para crear una encuesta
  async validarCreacionEncuesta(req, res, next) {
    try {
      const { titulo, descripcion, preguntas } = req.body;
      
      // Validar campos obligatorios
      if (!titulo || titulo.trim().length < 3) {
        return res.status(400).json(badRequest('El título debe tener al menos 3 caracteres'));
      }
      
      if (!descripcion || descripcion.trim().length < 10) {
        return res.status(400).json(badRequest('La descripción debe tener al menos 10 caracteres'));
      }
      
      if (!preguntas || !Array.isArray(preguntas) || preguntas.length === 0) {
        return res.status(400).json(badRequest('La encuesta debe tener al menos una pregunta'));
      }
      
      // Validar cada pregunta
      for (let i = 0; i < preguntas.length; i++) {
        const pregunta = preguntas[i];
        
        if (!pregunta.texto || pregunta.texto.trim().length < 3) {
          return res.status(400).json(badRequest(`La pregunta ${i + 1} debe tener al menos 3 caracteres`));
        }
        
        if (!pregunta.tipo || !['texto_corto', 'texto_largo', 'opcion_unica', 'opcion_multiple', 'escala_1_5'].includes(pregunta.tipo)) {
          return res.status(400).json(badRequest(`La pregunta ${i + 1} tiene un tipo inválido`));
        }
        
        // Validar preguntas de opción única y múltiple
        if (['opcion_unica', 'opcion_multiple'].includes(pregunta.tipo)) {
          if (!pregunta.opciones || !Array.isArray(pregunta.opciones) || pregunta.opciones.length < 2) {
            return res.status(400).json(badRequest(`La pregunta ${i + 1} debe tener al menos 2 opciones`));
          }
          
          // Validar cada opción
          for (let j = 0; j < pregunta.opciones.length; j++) {
            const opcion = pregunta.opciones[j];
            
            if (!opcion.texto || opcion.texto.trim().length < 1) {
              return res.status(400).json(badRequest(`La opción ${j + 1} de la pregunta ${i + 1} no puede estar vacía`));
            }
          }
        }
      }
      
      // Validar que haya al menos una pregunta obligatoria
      const preguntasObligatorias = preguntas.filter(p => p.obligatoria);
      if (preguntasObligatorias.length === 0) {
        return res.status(400).json(badRequest('La encuesta debe tener al menos una pregunta obligatoria'));
      }
      
      // Validar fecha de vencimiento si se proporciona
      if (req.body.fecha_vencimiento) {
        const fechaVencimiento = new Date(req.body.fecha_vencimiento);
        const ahora = new Date();
        
        if (fechaVencimiento <= ahora) {
          return res.status(400).json(badRequest('La fecha de vencimiento debe ser posterior a la fecha actual'));
        }
        
        // Verificar que la fecha de vencimiento sea al menos 24 horas después
        const minimaFechaVencimiento = new Date(ahora.getTime() + (24 * 60 * 60 * 1000));
        if (fechaVencimiento < minimaFechaVencimiento) {
          return res.status(400).json(badRequest('La fecha de vencimiento debe ser al menos 24 horas después de la publicación'));
        }
      }
      
      next();
    } catch (error) {
      console.error('Error al validar datos de creación de encuesta:', error);
      return res.status(500).json({ error: 'Error al validar datos de creación' });
    }
  }
  
  // Validar datos para responder una encuesta
  async validarRespuestaEncuesta(req, res, next) {
    try {
      const { encuesta_id, respuestas } = req.body;
      
      // Validar campos obligatorios
      if (!encuesta_id) {
        return res.status(400).json(badRequest('El ID de la encuesta es requerido'));
      }
      
      if (!respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
        return res.status(400).json(badRequest('Debes proporcionar al menos una respuesta'));
      }
      
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
        return res.status(404).json(notFound('Encuesta no encontrada'));
      }
      
      if (encuesta.estado !== 'activa') {
        return res.status(400).json(badRequest('La encuesta no está activa'));
      }
      
      if (encuesta.fecha_vencimiento && new Date(encuesta.fecha_vencimiento) < new Date()) {
        return res.status(400).json(badRequest('La encuesta ha vencido'));
      }
      
      // Verificar que el usuario no haya respondido previamente
      const { id: usuarioId } = req.usuario;
      const respuestaExistente = await prisma.respuestaEncuesta.findUnique({
        where: {
          encuesta_id_usuario_id: {
            encuesta_id: encuesta_id,
            usuario_id: usuarioId
          }
        }
      });
      
      if (respuestaExistente) {
        return res.status(409).json({ error: 'Ya has respondido esta encuesta anteriormente' });
      }
      
      // Validar que todas las preguntas obligatorias tengan respuesta
      const preguntasObligatorias = encuesta.preguntas.filter(p => p.obligatoria);
      const idsPreguntasObligatorias = new Set(preguntasObligatorias.map(p => p.id));
      const idsPreguntasRespondidas = new Set(respuestas.map(r => r.pregunta_id));
      
      const preguntasObligatoriasSinRespuesta = [...idsPreguntasObligatorias].filter(
        id => !idsPreguntasRespondidas.has(id)
      );
      
      if (preguntasObligatoriasSinRespuesta.length > 0) {
        return res.status(400).json(badRequest('Las siguientes preguntas obligatorias no fueron respondidas', {
          preguntas_faltantes: preguntasObligatoriasSinRespuesta
        }));
      }
      
      // Validar cada respuesta según el tipo de pregunta
      for (const respuesta of respuestas) {
        const pregunta = encuesta.preguntas.find(p => p.id === respuesta.pregunta_id);
        
        if (!pregunta) {
          return res.status(400).json(badRequest(`La pregunta con ID ${respuesta.pregunta_id} no existe en esta encuesta`));
        }
        
        // Validar según el tipo de pregunta
        switch (pregunta.tipo) {
          case 'texto_corto':
            if (!respuesta.valor_texto || respuesta.valor_texto.trim().length < 2) {
              return res.status(400).json(badRequest(`La respuesta a la pregunta "${pregunta.texto}" debe tener al menos 2 caracteres`));
            }
            
            if (respuesta.valor_texto.length > 500) {
              return res.status(400).json(badRequest(`La respuesta a la pregunta "${pregunta.texto}" no puede exceder 500 caracteres`));
            }
            break;
            
          case 'texto_largo':
            if (!respuesta.valor_texto || respuesta.valor_texto.trim().length < 10) {
              return res.status(400).json(badRequest(`La respuesta a la pregunta "${pregunta.texto}" debe tener al menos 10 caracteres`));
            }
            
            if (respuesta.valor_texto.length > 2000) {
              return res.status(400).json(badRequest(`La respuesta a la pregunta "${pregunta.texto}" no puede exceder 2000 caracteres`));
            }
            break;
            
          case 'opcion_unica':
            if (!respuesta.valor_opcion_id) {
              return res.status(400).json(badRequest(`Debes seleccionar una opción para la pregunta "${pregunta.texto}"`));
            }
            
            // Verificar que la opción exista y pertenezca a esta pregunta
            const opcionValida = pregunta.opciones.find(o => o.id === respuesta.valor_opcion_id);
            if (!opcionValida) {
              return res.status(400).json(badRequest(`La opción seleccionada no es válida para la pregunta "${pregunta.texto}"`));
            }
            break;
            
          case 'opcion_multiple':
            if (!respuesta.valor_opciones || respuesta.valor_opciones.length === 0) {
              return res.status(400).json(badRequest(`Debes seleccionar al menos una opción para la pregunta "${pregunta.texto}"`));
            }
            
            // Verificar que todas las opciones existan y pertenezcan a esta pregunta
            for (const opcionId of respuesta.valor_opciones) {
              const opcionValida = pregunta.opciones.find(o => o.id === opcionId);
              if (!opcionValida) {
                return res.status(400).json(badRequest(`Una de las opciones seleccionadas no es válida para la pregunta "${pregunta.texto}"`));
              }
            }
            break;
            
          case 'escala_1_5':
            if (respuesta.valor_escala === undefined || respuesta.valor_escala < 1 || respuesta.valor_escala > 5) {
              return res.status(400).json(badRequest(`Debes seleccionar un valor entre 1 y 5 para la pregunta "${pregunta.texto}"`));
            }
            break;
        }
      }
      
      req.encuesta = encuesta;
      next();
    } catch (error) {
      console.error('Error al validar respuesta de encuesta:', error);
      return res.status(500).json({ error: 'Error al validar respuesta' });
    }
  }
}

module.exports = new EncuestasMiddleware();