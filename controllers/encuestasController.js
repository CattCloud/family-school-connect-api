const encuestasService = require('../services/encuestasService');
const { success, error, notFound, badRequest, conflict } = require('../utils/response');

class EncuestasController {
  // Crear nueva encuesta
  async crearEncuesta(req, res) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.user;
      
      const resultado = await encuestasService.crearEncuesta(req.body, usuarioId, usuarioRol);
      
      if (!resultado.success) {
        // Manejar diferentes tipos de error
        if (resultado.error.code === 'BAD_REQUEST') {
          return res.status(400).json(resultado);
        } else if (resultado.error.code === 'FORBIDDEN') {
          return res.status(403).json(resultado);
        } else {
          return res.status(400).json(resultado);
        }
      }
      
      return res.status(201).json(resultado);
    } catch (err) {
      console.error('Error en el controlador al crear encuesta:', err);
      return res.status(500).json(error('Error al crear encuesta'));
    }
  }
  // Obtener lista de encuestas del usuario
  async obtenerEncuestas(req, res) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.user;
      
      const resultado = await encuestasService.obtenerEncuestas(usuarioId, usuarioRol, req.query);
      
      if (!resultado.success) {
        return res.status(400).json(resultado);
      }
      
      return res.status(200).json(resultado);
    } catch (err) {
      console.error('Error en el controlador al obtener encuestas:', err);
      return res.status(500).json(error('Error al obtener encuestas'));
    }
  }
  
  // Obtener contador de encuestas pendientes
  async obtenerContadorPendientes(req, res) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.user;
      
      const resultado = await encuestasService.obtenerContadorPendientes(usuarioId, usuarioRol);
      
      if (!resultado.success) {
        return res.status(400).json(resultado);
      }
      
      return res.status(200).json(resultado);
    } catch (err) {
      console.error('Error en el controlador al obtener contador pendientes:', err);
      return res.status(500).json(error('Error al obtener contador de pendientes'));
    }
  }
  
  // Buscar encuestas
  async buscarEncuestas(req, res) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.user;
      const { query } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json(badRequest('El término de búsqueda debe tener al menos 2 caracteres'));
      }
      
      // Usar el mismo método de obtener encuestas pero con filtro de búsqueda
      const resultado = await encuestasService.obtenerEncuestas(usuarioId, usuarioRol, {
        ...req.query,
        busqueda: query,
        limit: 20
      });
      
      if (!resultado.success) {
        return res.status(400).json(resultado);
      }
      
      // Formatear respuesta para búsqueda
      const respuestaBusqueda = {
        success: true,
        data: {
          query: query,
          resultados: resultado.data.encuestas.map(encuesta => ({
            id: encuesta.id,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            estado: encuesta.estado,
            fecha_creacion: encuesta.fecha_creacion,
            destacado: encuesta.titulo.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`),
            match_en: 'titulo',
            relevancia: 95
          })),
          total_resultados: resultado.data.encuestas.length,
          paginacion: {
            limit: 20,
            offset: 0,
            has_more: false
          }
        }
      };
      
      return res.status(200).json(respuestaBusqueda);
    } catch (err) {
      console.error('Error en el controlador al buscar encuestas:', err);
      return res.status(500).json(error('Error al buscar encuestas'));
    }
  }
  
  // Verificar actualizaciones de encuestas (para polling)
  async verificarActualizaciones(req, res) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.user;
      const { ultimo_check } = req.query;
      
      if (!ultimo_check) {
        return res.status(400).json(badRequest('El parámetro ultimo_check es requerido'));
      }
      
      const fechaUltimoCheck = new Date(ultimo_check);
      
      // Obtener encuestas actualizadas desde el último check
      const resultado = await encuestasService.obtenerEncuestas(usuarioId, usuarioRol, {
        page: 1,
        limit: 50
      });
      
      if (!resultado.success) {
        return res.status(400).json(resultado);
      }
      
      // Filtrar encuestas nuevas o actualizadas
      const ahora = new Date();
      const nuevasEncuestas = resultado.data.encuestas.filter(
        encuesta => new Date(encuesta.fecha_creacion) > fechaUltimoCheck
      );
      
      const encuestasActualizadas = resultado.data.encuestas.filter(
        encuesta => new Date(encuesta.fecha_creacion) <= fechaUltimoCheck && 
                   encuesta.fecha_creacion > fechaUltimoCheck
      );
      
      const hayActualizaciones = nuevasEncuestas.length > 0 || encuestasActualizadas.length > 0;
      
      return res.status(200).json({
        success: true,
        data: {
          hay_actualizaciones,
          nuevas_encuestas: nuevasEncuestas,
          encuestas_actualizadas: encuestasActualizadas,
          total_nuevas_encuestas: nuevasEncuestas.length,
          total_actualizaciones: encuestasActualizadas.length,
          contador_pendientes: resultado.data.contadores.activas
        }
      });
    } catch (err) {
      console.error('Error en el controlador al verificar actualizaciones:', err);
      return res.status(500).json(error('Error al verificar actualizaciones'));
    }
  }
  
  // Validar acceso a una encuesta
  async validarAccesoEncuesta(req, res) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.user;
      const { id } = req.params;
      
      const resultado = await encuestasService.validarAccesoEncuesta(id, usuarioId, usuarioRol);
      
      if (!resultado.success) {
        return res.status(400).json(resultado);
      }
      
      return res.status(200).json(resultado);
    } catch (err) {
      console.error('Error en el controlador al validar acceso a encuesta:', err);
      return res.status(500).json(error('Error al validar acceso a encuesta'));
    }
  }
  
  // Obtener formulario de encuesta para responder
  async obtenerFormularioEncuesta(req, res) {
    try {
      const { id: usuarioId, rol: usuarioRol } = req.user;
      const { id } = req.params;
      
      console.log(`[DEBUG] Controller obtenerFormularioEncuesta - Inicio: usuarioId=${usuarioId}, usuarioRol=${usuarioRol}, encuestaId=${id}`);
      
      const resultado = await encuestasService.obtenerFormularioEncuesta(id, usuarioId, usuarioRol);
      
      console.log(`[DEBUG] Controller obtenerFormularioEncuesta - Resultado del servicio:`, JSON.stringify(resultado, null, 2));
      
      if (!resultado.success) {
        console.log(`[DEBUG] Controller obtenerFormularioEncuesta - El servicio retornó error, status 400`);
        return res.status(400).json(resultado);
      }
      
      console.log(`[DEBUG] Controller obtenerFormularioEncuesta - Respuesta exitosa, status 200`);
      return res.status(200).json(resultado);
    } catch (err) {
      console.error('[DEBUG] Controller obtenerFormularioEncuesta - Error:', err);
      return res.status(500).json(error('Error al obtener formulario de encuesta'));
    }
  }
  
  // Enviar respuestas de encuesta
  async enviarRespuestas(req, res) {
    try {
      const { id: usuarioId } = req.user;
      const ip = req.ip || req.connection.remoteAddress;
      
      const resultado = await encuestasService.enviarRespuestas(req.body, usuarioId, ip);
      
      if (!resultado.success) {
        // Manejar diferentes tipos de error
        if (resultado.error.code === 'NOT_FOUND') {
          return res.status(404).json(resultado);
        } else if (resultado.error.code === 'BAD_REQUEST') {
          return res.status(400).json(resultado);
        } else if (resultado.error.code === 'CONFLICT') {
          return res.status(409).json(resultado);
        } else {
          return res.status(400).json(resultado);
        }
      }
      
      return res.status(201).json(resultado);
    } catch (err) {
      console.error('Error en el controlador al enviar respuestas:', err);
      return res.status(500).json(error('Error al enviar respuestas'));
    }
  }
  
  // Obtener respuestas propias de una encuesta
  async obtenerMisRespuestas(req, res) {
    try {
      const { id: usuarioId } = req.user;
      const { id } = req.params;
      
      const resultado = await encuestasService.obtenerMisRespuestas(id, usuarioId);
      
      if (!resultado.success) {
        if (resultado.error.code === 'NOT_FOUND') {
          return res.status(404).json(resultado);
        }
        return res.status(400).json(resultado);
      }
      
      return res.status(200).json(resultado);
    } catch (err) {
      console.error('Error en el controlador al obtener mis respuestas:', err);
      return res.status(500).json(error('Error al obtener mis respuestas'));
    }
  }
}

module.exports = new EncuestasController();