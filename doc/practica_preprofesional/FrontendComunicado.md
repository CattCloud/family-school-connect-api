// Servicio de Comunicados - HU-COM-02
// Endpoints según doc/Semana 8/Planning_COM_02.md secciones 4.* y 14.*

import { fetchWithAuth, ApiError } from './api.js'

/**
 * Estandariza respuesta { success, data } y lanza ApiError si success=false
 * @param {any} json
 * @returns {any}
 */
function ensureSuccess(json) {
  if (json && typeof json === 'object' && 'success' in json) {
    if (json.success === false) {
      const code = json.error?.code || 'HTTP_ERROR'
      const message = json.error?.message || 'Error en la solicitud'
      throw new ApiError(message, 400, code, json)
    }
  }
  return json
}

/**
 * Utilidad simple de validación de campos requeridos
 * @param {Record<string, any>} obj
 * @param {string[]} fields
 */
function assertRequired(obj, fields) {
  for (const k of fields) {
    if (obj == null || obj[k] === undefined || obj[k] === null || obj[k] === '') {
      throw new ApiError(`Campo requerido faltante: ${k}`, 400, 'MISSING_REQUIRED_FIELDS')
    }
  }
}

/**
 * Construye querystring a partir de params definidos
 * omite undefined/null/''
 */
function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return ''
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return `?${qs}`
}

const communicationService = {
  /**
   * Verifica permisos del docente para crear comunicados
   * GET /permisos-docentes/:docente_id
   * @param {string|number} docenteId
   * @returns {Promise<any>}
   */
  async getTeacherPermission(docenteId) {
    if (!docenteId) {
      throw new ApiError('docente_id es requerido', 400, 'MISSING_REQUIRED_FIELDS')
    }
    const res = await fetchWithAuth(`/comunicados/permisos-docentes/${encodeURIComponent(String(docenteId))}`, { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Obtiene estructura niveles/grados
   * GET /nivel-grado
   */
  async getNivelGrado() {
    const res = await fetchWithAuth('/comunicados/nivel-grado', { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Obtiene cursos asignados a un docente
   * GET /cursos/docente/:docente_id
   */
  async getCursosDocente(docenteId) {
    if (!docenteId) {
      throw new ApiError('docente_id es requerido', 400, 'MISSING_REQUIRED_FIELDS')
    }
    const res = await fetchWithAuth(`/comunicados/cursos/docente/${encodeURIComponent(String(docenteId))}`, { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Valida HTML del comunicado en servidor
   * POST /comunicados/validar-html
   * @param {{contenido_html:string}} payload
   * @returns {Promise<{seguro:boolean,warnings?:string[]}>}
   */
  async validateHtml(payload) {
    assertRequired(payload, ['contenido_html'])
    const res = await fetchWithAuth('/comunicados/validar-html', {
      method: 'POST',
      body: { contenido: String(payload.contenido_html) }
    })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Preview de destinatarios según segmentación
   * POST /usuarios/destinatarios/preview
   * @param {{publico_objetivo:string[],niveles?:string[],grados?:string[],cursos?:string[],año_academico?:number}} selection
   */
  async previewRecipients(selection) {
    assertRequired(selection, ['publico_objetivo'])
    const res = await fetchWithAuth('/comunicados/usuarios/destinatarios/preview', { method: 'POST', body: selection })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Validación estricta de segmentación previa a publicar
   * POST /comunicados/validar-segmentacion
   */
  async validateSegmentation(selection) {
    assertRequired(selection, ['publico_objetivo'])
    const res = await fetchWithAuth('/comunicados/validar-segmentacion', { method: 'POST', body: selection })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Crea un borrador de comunicado
   * POST /comunicados/borrador
   * @param {object} dto ComunicadoDraftDTO
   * @returns {Promise<{id:string,estado:string}>}
   */
  async createDraft(dto) {
    // Validaciones mínimas para borrador según documentación
    if (dto?.titulo) {
      const titleLength = String(dto.titulo).length
      if (titleLength < 1 || titleLength > 200) {
        throw new ApiError('Título debe tener entre 1 y 200 caracteres', 400, 'INVALID_INPUT')
      }
    }
    if (dto?.contenido_html) {
      const contentLength = String(dto.contenido_html).length
      if (contentLength < 1 || contentLength > 5000) {
        throw new ApiError('Contenido debe tener entre 1 y 5000 caracteres', 400, 'INVALID_INPUT')
      }
    }
    
    // Validar campos requeridos según documentación
    assertRequired(dto, ['publico_objetivo'])
    
    const res = await fetchWithAuth('/comunicados/borrador', { method: 'POST', body: dto })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Publica un comunicado nuevo (o programado)
   * POST /comunicados
   * @param {object} dto ComunicadoCreateDTO
   */
  async createComunicado(dto) {
    // Validar campos requeridos según documentación
    assertRequired(dto, ['titulo', 'tipo', 'contenido_html', 'publico_objetivo'])
    
    // Validaciones básicas adicionales según documentación
    const t = String(dto.titulo)
    if (t.length < 10 || t.length > 200) {
      throw new ApiError('El título debe tener entre 10 y 200 caracteres', 400, 'INVALID_INPUT')
    }
    const c = String(dto.contenido_html)
    if (c.length < 20 || c.length > 5000) {
      throw new ApiError('El contenido debe tener entre 20 y 5000 caracteres', 400, 'INVALID_INPUT')
    }
    
    // Validar tipos de comunicado
    const tiposValidos = ['academico', 'administrativo', 'evento', 'urgente', 'informativo']
    if (!tiposValidos.includes(dto.tipo)) {
      throw new ApiError('Tipo de comunicado inválido', 400, 'INVALID_INPUT')
    }
    
    // Normalizar payload según documentación API
    const payload = {
      titulo: dto.titulo,
      tipo: dto.tipo,
      contenido_html: dto.contenido_html,
      publico_objetivo: dto.publico_objetivo,
      niveles: dto.niveles || dto.niveles_objetivo,
      grados: dto.grados || dto.grados_objetivo,
      cursos: dto.cursos || dto.cursos_objetivo,
      fecha_programada: dto.fecha_programada
    }
    
    const res = await fetchWithAuth('/comunicados', { method: 'POST', body: payload })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Publica un borrador existente
   * POST /comunicados/:id/publicar
   * @param {string|number} id
   * @param {{confirm?:boolean}} [payload]
   */
  async publishDraft(id, payload = { confirm: true }) {
    if (!id) {
      throw new ApiError('id es requerido', 400, 'MISSING_REQUIRED_FIELDS')
    }
    const res = await fetchWithAuth(`/comunicados/${encodeURIComponent(String(id))}/publicar`, { method: 'POST', body: { confirm: !!payload?.confirm } })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Lista comunicados paginados/filtrados (HU-COM-00)
   * GET /comunicados?page=&limit=&rol=&usuario_id=&tipo=&estado_lectura=&fecha_inicio=&fecha_fin=&autor_id=&nivel=&grado=&hijo_id=&busqueda=&solo_mis_comunicados=
   * @param {Object} params
   * @returns {Promise<{items:any[], page:number, limit:number, total:number}>}
   */
  async listComunicados(params = {}) {
    // Parámetros documentados en GUIA_ENDPOINTS.md
    const {
      page = 1,
      limit = 12,
      tipo,
      estado_lectura,
      fecha_inicio,
      fecha_fin,
      autor_id,
      nivel,
      grado,
      busqueda,
      solo_mis_comunicados
    } = params

    // Nota: rol, usuario_id, hijo_id no están documentados pero pueden ser necesarios
    // para funcionalidad específica del frontend
    const {
      rol,
      usuario_id,
      hijo_id
    } = params

    const qs = buildQuery({
      page, limit,
      rol, usuario_id,
      tipo, estado_lectura,
      fecha_inicio, fecha_fin,
      autor_id, nivel, grado,
      hijo_id, busqueda,
      solo_mis_comunicados
    })

    const res = await fetchWithAuth(`/comunicados${qs}`, { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Contador de comunicados no leídos para el usuario autenticado
   * GET /comunicados/no-leidos/count
   */
  async getUnreadCount() {
    const res = await fetchWithAuth('/comunicados/no-leidos/count', { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Verifica nuevas actualizaciones desde un timestamp
   * GET /comunicados/actualizaciones?ultimo_check=ISO8601
   * @param {string|number|Date} ultimo_check
   */
  async getUpdates(ultimo_check) {
    const ts =
      ultimo_check instanceof Date
        ? ultimo_check.toISOString()
        : typeof ultimo_check === 'number'
          ? new Date(ultimo_check).toISOString()
          : String(ultimo_check || '')
    const qs = buildQuery({ ultimo_check: ts })
    const res = await fetchWithAuth(`/comunicados/actualizaciones${qs}`, { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Marca un comunicado como leído por el usuario actual
   * POST /comunicados-lecturas
   * @param {string|number} comunicado_id
   */
  async markAsRead(comunicado_id) {
    assertRequired({ comunicado_id }, ['comunicado_id'])
    const res = await fetchWithAuth('/comunicados/comunicados-lecturas', {
      method: 'POST',
      body: { comunicado_id }
    })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Obtiene comunicado por id (soporte a HU-COM-01)
   * GET /comunicados/:id
   */
  async getById(id) {
    if (!id) throw new ApiError('id es requerido', 400, 'MISSING_REQUIRED_FIELDS')
    const res = await fetchWithAuth(`/comunicados/${encodeURIComponent(String(id))}`, { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  },

  /**
   * Valida acceso del usuario autenticado a un comunicado
   * GET /comunicados/:id/acceso
   */
  async validateAccess(id) {
    if (!id) throw new ApiError('id es requerido', 400, 'MISSING_REQUIRED_FIELDS')
    const res = await fetchWithAuth(`/comunicados/${encodeURIComponent(String(id))}/acceso`, { method: 'GET' })
    const json = ensureSuccess(res)
    return json?.data ?? json
  }
}

export default communicationService