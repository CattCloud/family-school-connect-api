'use strict';

const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const { uploadMany } = require('./cloudinaryService');

/**
 * Helpers de fecha y texto
 */
function pad2(n) {
  return n < 10 ? `0${n}` : String(n);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(d, base = new Date()) {
  const y = new Date(base);
  y.setDate(base.getDate() - 1);
  return isSameDay(d, y);
}

function formatRelative(dateISO) {
  const d = typeof dateISO === 'string' ? new Date(dateISO) : dateISO;
  const now = new Date();
  if (isNaN(d.getTime())) return null;

  if (isSameDay(d, now)) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  if (isYesterday(d, now)) {
    return 'Ayer';
  }
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function truncate(str, max) {
  if (str == null) return '';
  const s = String(str);
  return s.length > max ? `${s.slice(0, max - 3)}...` : s;
}

/**
 * Construye el filtro base para conversaciones donde el usuario participa
 */
function participantWhere(user) {
  return {
    OR: [{ padre_id: user.id }, { docente_id: user.id }],
  };
}

/**
 * Determina el "otro usuario" respecto del rol actual
 */
function getOtherUserInfo(conv, userRole) {
  if (userRole === 'apoderado') {
    if (conv.docente) {
      return {
        id: conv.docente.id,
        nombre_completo: `${conv.docente.nombre} ${conv.docente.apellido}`,
        rol: 'docente',
        avatar_url: null,
      };
    }
  } else if (userRole === 'docente') {
    if (conv.padre) {
      return {
        id: conv.padre.id,
        nombre_completo: `${conv.padre.nombre} ${conv.padre.apellido}`,
        rol: 'apoderado',
        avatar_url: null,
      };
    }
  }
  return {
    id: null,
    nombre_completo: 'Desconocido',
    rol: userRole === 'apoderado' ? 'docente' : 'apoderado',
    avatar_url: null,
  };
}

/**
 * Cuenta no leídos por conversación para el usuario
 */
async function countUnreadByConversation(conversationId, userId) {
  const count = await prisma.mensaje.count({
    where: {
      conversacion_id: conversationId,
      emisor_id: { not: userId },
      estado_lectura: { not: 'leido' },
    },
  });
  return count;
}

/**
 * Obtiene el último mensaje de una conversación
 */
async function getLastMessage(conversationId) {
  const last = await prisma.mensaje.findFirst({
    where: { conversacion_id: conversationId },
    orderBy: { fecha_envio: 'desc' },
    select: {
      id: true,
      contenido: true,
      emisor_id: true,
      fecha_envio: true,
      estado_lectura: true,
      tiene_adjuntos: true,
    },
  });
  return last;
}

/**
 * Construye objeto de respuesta de conversación según contrato
 */
async function mapConversation(conv, user) {
  const [ultimo, unread] = await Promise.all([
    getLastMessage(conv.id),
    countUnreadByConversation(conv.id, user.id),
  ]);

  const otro = getOtherUserInfo(conv, user.rol);

  return {
    id: conv.id,
    asunto: conv.asunto,
    estudiante: conv.estudiante
      ? {
          id: conv.estudiante.id,
          nombre_completo: `${conv.estudiante.nombre} ${conv.estudiante.apellido}`,
          codigo_estudiante: conv.estudiante.codigo_estudiante || null,
        }
      : null,
    curso: conv.curso
      ? {
          id: conv.curso.id,
          nombre: conv.curso.nombre,
          nivel_grado: conv.curso.nivel_grado
            ? {
                nivel: conv.curso.nivel_grado.nivel,
                grado: conv.curso.nivel_grado.grado,
              }
            : null,
        }
      : null,
    otro_usuario: otro,
    ultimo_mensaje: ultimo
      ? {
          id: ultimo.id,
          contenido: truncate(ultimo.contenido || '', 80),
          emisor_id: ultimo.emisor_id,
          fecha_envio: ultimo.fecha_envio,
          fecha_envio_relativa: formatRelative(ultimo.fecha_envio),
          tiene_adjuntos: !!ultimo.tiene_adjuntos,
          estado_lectura: ultimo.estado_lectura,
        }
      : null,
    fecha_ultimo_mensaje: conv.fecha_ultimo_mensaje,
    mensajes_no_leidos: unread,
    estado: conv.estado,
    iniciado_por: conv.creado_por === conv.padre_id ? 'padre' : 'docente',
    fecha_inicio: conv.fecha_inicio,
  };
}

/**
 * Aplica filtros adicionales a conversaciones
 */
function buildFilters(user, query) {
  const {
    filtro = 'todos',
    estudiante_id,
    curso_id,
    grado,
    estado = 'activa',
    busqueda,
  } = query || {};

  const and = [];
  // Excluir conversaciones huérfanas (sin mensajes)
  and.push({ mensajes: { some: {} } });

  // Estado
  if (estado) {
    and.push({ estado });
  }

  // Filtros directos
  if (estudiante_id) {
    and.push({ estudiante_id });
  }
  if (curso_id) {
    and.push({ curso_id });
  }

  // Filtro por grado (principalmente docente)
  if (grado) {
    // Filtra por grado ya sea vía curso.nivel_grado o estudiante.nivel_grado
    and.push({
      OR: [
        { curso: { nivel_grado: { grado: String(grado) } } },
        { estudiante: { nivel_grado: { grado: String(grado) } } },
      ],
    });
  }

  // Filtro por dirección (recibidos / enviados) según contrato de HU:
  // - recibidos: conversaciones con mensajes entrantes (del otro usuario)
  // - enviados: conversaciones iniciadas por el usuario
  if (filtro === 'recibidos') {
    and.push({
      mensajes: {
        some: {
          emisor_id: { not: user.id },
        },
      },
    });
  } else if (filtro === 'enviados') {
    and.push({ creado_por: user.id });
  }

  // Búsqueda texto (min 2 caracteres)
  if (busqueda && String(busqueda).trim().length >= 2) {
    const q = String(busqueda).trim();
    const searchOtro =
      user.rol === 'apoderado'
        ? {
            docente: {
              OR: [
                { nombre: { contains: q, mode: 'insensitive' } },
                { apellido: { contains: q, mode: 'insensitive' } },
              ],
            },
          }
        : {
            padre: {
              OR: [
                { nombre: { contains: q, mode: 'insensitive' } },
                { apellido: { contains: q, mode: 'insensitive' } },
              ],
            },
          };

    and.push({
      OR: [
        { asunto: { contains: q, mode: 'insensitive' } },
        { mensajes: { some: { contenido: { contains: q, mode: 'insensitive' } } } },
        searchOtro,
      ],
    });
  }

  return { AND: and };
}

/**
 * Lista conversaciones del usuario autenticado con paginación y contadores
 * Contrato: GET /conversaciones
 */
async function listConversations({ user, query }) {
  // Validación básica de parámetros
  const page = Math.max(1, Number(query?.page || 1));
  const rawLimit = Number(query?.limit || 20);
  const limit = Math.min(Math.max(1, rawLimit), 50);

  const where = {
    ...participantWhere(user),
    ...buildFilters(user, query),
  };

  const total = await prisma.conversacion.count({ where });

  if (total === 0) {
    const err = new Error('No tiene conversaciones registradas');
    err.status = 404;
    err.code = 'NO_CONVERSATIONS_FOUND';
    throw err;
  }

  const conversations = await prisma.conversacion.findMany({
    where,
    orderBy: [{ fecha_ultimo_mensaje: 'desc' }],
    skip: (page - 1) * limit,
    take: limit,
    include: {
      padre: { select: { id: true, nombre: true, apellido: true } },
      docente: { select: { id: true, nombre: true, apellido: true } },
      estudiante: {
        select: { id: true, nombre: true, apellido: true, codigo_estudiante: true },
      },
      curso: {
        select: {
          id: true,
          nombre: true,
          nivel_grado: { select: { nivel: true, grado: true } },
        },
      },
    },
  });

  // Enriquecer con último mensaje y no leídos
  const enriched = await Promise.all(conversations.map((c) => mapConversation(c, user)));

  // Ordenar: no leídos al inicio, luego por fecha_ultimo_mensaje desc
  enriched.sort((a, b) => {
    if ((b.mensajes_no_leidos > 0) !== (a.mensajes_no_leidos > 0)) {
      return b.mensajes_no_leidos - a.mensajes_no_leidos;
    }
    return new Date(b.fecha_ultimo_mensaje) - new Date(a.fecha_ultimo_mensaje);
  });

  // Contadores (según contrato API)
  const total_no_leidas = enriched.reduce((acc, c) => acc + (c.mensajes_no_leidos || 0), 0);
  const total_recibidas = enriched.filter(
    (c) => c.ultimo_mensaje && c.ultimo_mensaje.emisor_id !== user.id
  ).length;
  const total_enviadas = enriched.filter(
    (c) => c.ultimo_mensaje && c.ultimo_mensaje.emisor_id === user.id
  ).length;

  const total_pages = Math.max(1, Math.ceil(total / limit));

  return {
    usuario: {
      id: user.id,
      nombre: `${user.nombre} ${user.apellido}`,
      rol: user.rol,
    },
    conversaciones: enriched,
    paginacion: {
      page,
      limit,
      total_conversaciones: total,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    },
    contadores: {
      total,
      recibidas: total_recibidas,
      enviadas: total_enviadas,
      no_leidas: total_no_leidas,
    },
  };
}

/**
 * Contador de no leídos global y por conversación
 * Contrato: GET /conversaciones/no-leidas/count
 */
async function countUnread({ user }) {
  // Todas las conversaciones donde participa y están activas
  const convs = await prisma.conversacion.findMany({
    where: { ...participantWhere(user), estado: 'activa' },
    select: { id: true, asunto: true, fecha_ultimo_mensaje: true },
  });

  const por_conversacion = [];
  let total_no_leidos = 0;

  for (const c of convs) {
    const count = await countUnreadByConversation(c.id, user.id);
    if (count > 0) {
      por_conversacion.push({
        conversacion_id: c.id,
        asunto: c.asunto,
        mensajes_no_leidos: count,
        ultimo_mensaje_fecha: c.fecha_ultimo_mensaje,
      });
      total_no_leidos += count;
    }
  }

  return {
    total_no_leidos,
    por_conversacion,
  };
}

/**
 * Polling de actualizaciones desde un timestamp
 * Contrato: GET /conversaciones/actualizaciones?ultimo_check=ISO
 */
async function getUpdatesSince({ user, ultimo_check }) {
  const since = new Date(ultimo_check);
  if (isNaN(since.getTime())) {
    const e = new Error("El parámetro 'ultimo_check' debe ser un ISO válido");
    e.status = 400;
    e.code = 'INVALID_PARAMETERS';
    throw e;
  }

  const nuevos = await prisma.mensaje.findMany({
    where: {
      fecha_envio: { gt: since },
      emisor_id: { not: user.id },
      conversacion: {
        ...participantWhere(user),
        estado: 'activa',
      },
    },
    orderBy: { fecha_envio: 'asc' },
    select: {
      id: true,
      contenido: true,
      fecha_envio: true,
      tiene_adjuntos: true,
      conversacion_id: true,
      emisor: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  const dataMsgs = nuevos.map((m) => ({
    conversacion_id: m.conversacion_id,
    mensaje_id: m.id,
    emisor: {
      id: m.emisor.id,
      nombre: `${m.emisor.nombre} ${m.emisor.apellido}`,
    },
    contenido_preview: truncate(m.contenido || '', 80),
    fecha_envio: m.fecha_envio,
    tiene_adjuntos: !!m.tiene_adjuntos,
  }));

  const convIds = Array.from(new Set(nuevos.map((m) => m.conversacion_id)));
  let contador_no_leidos = 0;
  for (const cid of convIds) {
    contador_no_leidos += await countUnreadByConversation(cid, user.id);
  }

  return {
    hay_actualizaciones: dataMsgs.length > 0,
    nuevos_mensajes: dataMsgs,
    total_nuevos_mensajes: dataMsgs.length,
    conversaciones_actualizadas: convIds,
    contador_no_leidos,
  };
}

/**
 * Marca como leídos los mensajes de una conversación (del otro usuario)
 * Contrato: PATCH /conversaciones/:id/marcar-leida
 */
async function markConversationRead({ user, conversacion_id }) {
  const conv = await prisma.conversacion.findUnique({
    where: { id: conversacion_id },
    select: { id: true, padre_id: true, docente_id: true },
  });
  if (!conv) {
    const e = new Error('La conversación no existe o ha sido eliminada');
    e.status = 404;
    e.code = 'CONVERSATION_NOT_FOUND';
    throw e;
  }
  if (conv.padre_id !== user.id && conv.docente_id !== user.id && user.rol !== 'administrador') {
    const e = new Error('No tiene permisos para ver esta conversación');
    e.status = 403;
    e.code = 'ACCESS_DENIED';
    throw e;
  }

  const upd = await prisma.mensaje.updateMany({
    where: {
      conversacion_id,
      emisor_id: { not: user.id },
      estado_lectura: { not: 'leido' },
    },
    data: {
      estado_lectura: 'leido',
      fecha_lectura: new Date(),
    },
  });

  // Recalcular contador global actualizado (opcional)
  const unreadNow = await countUnread({ user });

  return {
    conversacion_id,
    mensajes_actualizados: upd.count,
    nuevo_contador_no_leidos: unreadNow.total_no_leidos,
  };
}

/**
 * Cierra/archiva conversación (solo creador)
 * Contrato: PATCH /conversaciones/:id/cerrar
 */
async function closeConversation({ user, conversacion_id }) {
  const conv = await prisma.conversacion.findUnique({
    where: { id: conversacion_id },
    select: { id: true, creado_por: true, estado: true },
  });
  if (!conv) {
    const e = new Error('La conversación no existe o ha sido eliminada');
    e.status = 404;
    e.code = 'CONVERSATION_NOT_FOUND';
    throw e;
  }
  if (conv.creado_por !== user.id && user.rol !== 'administrador') {
    const e = new Error('No tiene permisos para cerrar esta conversación');
    e.status = 403;
    e.code = 'ACCESS_DENIED';
    throw e;
  }

  if (conv.estado !== 'cerrada') {
    await prisma.conversacion.update({
      where: { id: conversacion_id },
      data: { estado: 'cerrada' },
      select: { id: true },
    });
  }

  const fecha_cierre = new Date();

  return {
    conversacion_id,
    estado: 'cerrada',
    fecha_cierre,
    mensaje: 'Conversación archivada correctamente',
  };
}

/**
 * Año académico actual (entero)
 */
function getCurrentAcademicYear() {
  return new Date().getFullYear();
}

/**
 * Verifica que el estudiante pertenezca (relación activa) al apoderado
 * Lanza STUDENT_NOT_LINKED (403) si no corresponde
 */
async function ensureParentHasStudent(padre_id, estudiante_id) {
  const rel = await prisma.relacionesFamiliares.findFirst({
    where: {
      apoderado_id: padre_id,
      estudiante_id,
      estado_activo: true,
      estudiante: { estado_matricula: 'activo' },
    },
    select: { id: true },
  });
  if (!rel) {
    const e = new Error('El estudiante no está vinculado al apoderado');
    e.status = 403;
    e.code = 'STUDENT_NOT_LINKED';
    throw e;
  }
}

/**
 * Verifica que el docente esté asignado al curso en el año indicado
 * Lanza TEACHER_NOT_ASSIGNED (403) si no corresponde
 */
async function ensureTeacherAssignedToCourse(docente_id, curso_id, año) {
  const asg = await prisma.asignacionDocenteCurso.findFirst({
    where: {
      docente_id,
      curso_id,
      año_academico: año,
      estado_activo: true,
    },
    select: { id: true },
  });
  if (!asg) {
    const e = new Error('El docente no está asignado al curso');
    e.status = 403;
    e.code = 'TEACHER_NOT_ASSIGNED';
    throw e;
  }
}

/**
 * Verifica si existe conversación activa con mismo contexto (padre, docente, estudiante, curso)
 * Contrato: GET /conversaciones/existe
 */
async function checkConversationExists({ user, docente_id, estudiante_id, curso_id }) {
  if (!user || !user.id) {
    const e = new Error('Usuario no autenticado');
    e.status = 401;
    e.code = 'INVALID_TOKEN';
    throw e;
  }
  if (user.rol !== 'apoderado') {
    const e = new Error('Acción no permitida para el rol');
    e.status = 403;
    e.code = 'ACCESS_DENIED';
    throw e;
  }

  await ensureParentHasStudent(user.id, estudiante_id);

  const conv = await prisma.conversacion.findFirst({
    where: {
      estado: 'activa',
      padre_id: user.id,
      docente_id,
      estudiante_id,
      curso_id,
    },
    select: {
      id: true,
      asunto: true,
      fecha_inicio: true,
      fecha_ultimo_mensaje: true,
      _count: { select: { mensajes: true } },
    },
  });

  if (!conv) {
    return {
      existe: false,
      conversacion: null,
      mensaje: 'No existe conversación previa, se creará una nueva',
    };
  }

  return {
    existe: true,
    conversacion: {
      id: conv.id,
      asunto: conv.asunto,
      fecha_inicio: conv.fecha_inicio,
      total_mensajes: conv._count.mensajes,
      ultimo_mensaje_fecha: conv.fecha_ultimo_mensaje,
    },
    mensaje: 'Ya existe una conversación activa con este docente sobre este estudiante',
  };
}

/**
 * Crea nueva conversación y primer mensaje (con adjuntos opcionales)
 * Contrato: POST /conversaciones (multipart/form-data)
 */
async function createConversationWithMessage({ user, body, files }) {
  if (!user || !user.id) {
    const e = new Error('Usuario no autenticado');
    e.status = 401;
    e.code = 'INVALID_TOKEN';
    throw e;
  }
  if (user.rol !== 'apoderado') {
    const e = new Error('Acción no permitida para el rol');
    e.status = 403;
    e.code = 'ACCESS_DENIED';
    throw e;
  }

  const estudiante_id = String(body?.estudiante_id || '').trim();
  const curso_id = String(body?.curso_id || '').trim();
  const docente_id = String(body?.docente_id || '').trim();
  const asunto = String(body?.asunto || '').trim();
  const contenido = String(body?.mensaje || '').trim();
  const año = body?.año ? Number(body.año) : getCurrentAcademicYear();

  // Validaciones de longitud (HU-MSG-01)
  if (asunto.length < 10 || asunto.length > 200) {
    const e = new Error('El asunto debe tener entre 10 y 200 caracteres');
    e.status = 400;
    e.code = 'VALIDATION_ERROR';
    e.details = { field: 'asunto', value: asunto, constraint: 'minLength: 10, maxLength: 200' };
    throw e;
  }
  if (contenido.length < 10 || contenido.length > 1000) {
    const e = new Error('El mensaje debe tener entre 10 y 1000 caracteres');
    e.status = 400;
    e.code = 'VALIDATION_ERROR';
    e.details = { field: 'mensaje', minLength: 10, maxLength: 1000, current: contenido.length };
    throw e;
  }

  // Reglas de negocio clave
  await ensureParentHasStudent(user.id, estudiante_id);
  await ensureTeacherAssignedToCourse(docente_id, curso_id, año);

  // Subida de adjuntos a Cloudinary (simulada si no hay config)
  const uploaded = files && files.length ? await uploadMany(files, 'mensajeria') : [];

  // Transacción de creación (conversación, mensaje, adjuntos)
  const result = await prisma.$transaction(async (tx) => {
    const conv = await tx.conversacion.create({
      data: {
        estudiante_id,
        curso_id,
        padre_id: user.id,
        docente_id,
        asunto,
        estado: 'activa',
        fecha_inicio: new Date(),
        fecha_ultimo_mensaje: new Date(),
        año_academico: año,
        tipo_conversacion: 'padre_docente',
        creado_por: user.id,
      },
    });

    const msg = await tx.mensaje.create({
      data: {
        conversacion_id: conv.id,
        emisor_id: user.id,
        contenido,
        fecha_envio: new Date(),
        estado_lectura: 'enviado',
        tiene_adjuntos: uploaded.length > 0,
      },
    });

    if (uploaded.length) {
      for (const a of uploaded) {
        await tx.archivoAdjunto.create({
          data: {
            mensaje_id: msg.id,
            nombre_original: a.nombre_original,
            nombre_archivo: a.nombre_archivo,
            url_cloudinary: a.url_cloudinary,
            tipo_mime: a.tipo_mime,
            tamaño_bytes: a.tamaño_bytes,
            es_imagen: !!a.es_imagen,
            subido_por: user.id,
          },
        });
      }
    }

    // Asegurar fecha_ultimo_mensaje actualizada
    await tx.conversacion.update({
      where: { id: conv.id },
      data: { fecha_ultimo_mensaje: new Date() },
    });

    return { conv, msg, uploaded };
  });

  // Simulación de notificación (plataforma + WhatsApp)
  const notificacion = {
    enviada: true,
    canales: ['plataforma', 'whatsapp'],
    destinatario_id: docente_id,
  };

  const { conv, msg, uploaded: filesMeta } = result;

  return {
    conversacion: {
      id: conv.id,
      asunto: conv.asunto,
      estudiante_id: conv.estudiante_id,
      curso_id: conv.curso_id,
      padre_id: conv.padre_id,
      docente_id: conv.docente_id,
      estado: conv.estado,
      fecha_inicio: conv.fecha_inicio,
      fecha_ultimo_mensaje: conv.fecha_ultimo_mensaje,
      tipo_conversacion: conv.tipo_conversacion,
      creado_por: conv.creado_por,
    },
    mensaje: {
      id: msg.id,
      conversacion_id: msg.conversacion_id,
      emisor_id: msg.emisor_id,
      contenido: msg.contenido,
      fecha_envio: msg.fecha_envio,
      estado_lectura: msg.estado_lectura,
      tiene_adjuntos: msg.tiene_adjuntos,
    },
    archivos_adjuntos: filesMeta.map((a) => ({
      id: undefined,
      mensaje_id: msg.id,
      nombre_original: a.nombre_original,
      nombre_archivo: a.nombre_archivo,
      url_cloudinary: a.url_cloudinary,
      tipo_mime: a.tipo_mime,
      tamaño_bytes: a.tamaño_bytes,
      fecha_subida: a.fecha_subida,
    })),
    notificacion,
  };
}

/**
 * Helpers HU-MSG-03
 */
function formatLongDate(dateISO) {
  const d = typeof dateISO === 'string' ? new Date(dateISO) : dateISO;
  if (isNaN(d.getTime())) return null;
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const año = d.getFullYear();
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${dia} de ${mes} de ${año}, ${hh}:${mm}`;
}

function humanSize(bytes) {
  const b = Number(bytes || 0);
  if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
}

function dateKeyISO(dateISO) {
  const d = typeof dateISO === 'string' ? new Date(dateISO) : dateISO;
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function humanSeparatorLabel(dateISO) {
  const d = typeof dateISO === 'string' ? new Date(dateISO) : dateISO;
  const now = new Date();
  if (isSameDay(d, now)) return 'Hoy';
  if (isYesterday(d, now)) return 'Ayer';
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Asegura que el usuario tenga acceso a la conversación
 * RN-45, RN-46, RN-47
 */
async function ensureUserCanAccessConversation(user, conversacion_id) {
  const conv = await prisma.conversacion.findUnique({
    where: { id: conversacion_id },
    include: {
      padre: { select: { id: true, nombre: true, apellido: true, telefono: true } },
      docente: { select: { id: true, nombre: true, apellido: true, telefono: true } },
      estudiante: {
        select: {
          id: true, nombre: true, apellido: true, codigo_estudiante: true,
          nivel_grado: { select: { nivel: true, grado: true, descripcion: true } },
        },
      },
      curso: {
        select: {
          id: true, nombre: true,
          nivel_grado: { select: { nivel: true, grado: true, descripcion: true } },
        },
      },
    },
  });

  if (!conv) {
    const e = new Error('La conversación no existe o ha sido eliminada');
    e.status = 404;
    e.code = 'CONVERSATION_NOT_FOUND';
    throw e;
  }

  // Participación por rol
  const isParticipant =
    user.id === conv.padre_id ||
    user.id === conv.docente_id ||
    user.rol === 'administrador';

  if (!isParticipant) {
    const e = new Error('No tiene permisos para ver esta conversación');
    e.status = 403;
    e.code = 'ACCESS_DENIED';
    throw e;
  }

  return conv;
}

/**
 * Verifica que la conversación esté activa
 * RN-59, RN-65
 */
function ensureConversationIsActive(conv) {
  if (!conv || conv.estado !== 'activa') {
    const e = new Error('No se pueden enviar mensajes en una conversación cerrada');
    e.status = 403;
    e.code = 'CONVERSATION_CLOSED';
    throw e;
  }
}

/**
 * GET /conversaciones/:id — Detalle de conversación
 */
async function getConversationById({ user, conversacion_id }) {
  const conv = await ensureUserCanAccessConversation(user, conversacion_id);

  const iniciado_por = conv.creado_por === conv.padre_id ? 'padre' : 'docente';
  const otro_usuario = getOtherUserInfo(conv, user.rol);

  const puede_enviar_mensajes =
    conv.estado === 'activa' &&
    ((user.rol === 'apoderado') || (user.rol === 'docente' && iniciado_por === 'padre') || user.rol === 'administrador');

  const puede_cerrar_conversacion = user.id === conv.creado_por || user.rol === 'administrador';
  const es_creador = user.id === conv.creado_por;

  return {
    conversacion: {
      id: conv.id,
      asunto: conv.asunto,
      estudiante: conv.estudiante
        ? {
            id: conv.estudiante.id,
            codigo_estudiante: conv.estudiante.codigo_estudiante,
            nombre_completo: `${conv.estudiante.nombre} ${conv.estudiante.apellido}`,
          }
        : null,
      curso: conv.curso
        ? {
            id: conv.curso.id,
            nombre: conv.curso.nombre,
            nivel_grado: conv.curso.nivel_grado
              ? {
                  nivel: conv.curso.nivel_grado.nivel,
                  grado: conv.curso.nivel_grado.grado,
                  descripcion: conv.curso.nivel_grado.descripcion || null,
                }
              : null,
          }
        : null,
      padre: conv.padre
        ? {
            id: conv.padre.id,
            nombre_completo: `${conv.padre.nombre} ${conv.padre.apellido}`,
            telefono: conv.padre.telefono,
            avatar_url: null,
          }
        : null,
      docente: conv.docente
        ? {
            id: conv.docente.id,
            nombre_completo: `${conv.docente.nombre} ${conv.docente.apellido}`,
            telefono: conv.docente.telefono,
            avatar_url: null,
          }
        : null,
      estado: conv.estado,
      fecha_inicio: conv.fecha_inicio,
      fecha_ultimo_mensaje: conv.fecha_ultimo_mensaje,
      tipo_conversacion: conv.tipo_conversacion,
      iniciado_por,
    },
    otro_usuario,
    permisos: {
      puede_enviar_mensajes,
      puede_cerrar_conversacion,
      es_creador,
    },
  };
}

/**
 * GET /mensajes — mensajes paginados de una conversación
 */
async function getMessagesPaginated({ user, conversacion_id, limit = 50, offset = 0, orden = 'asc' }) {
  // Acceso
  await ensureUserCanAccessConversation(user, conversacion_id);

  const total = await prisma.mensaje.count({ where: { conversacion_id } });

  const mensajes = await prisma.mensaje.findMany({
    where: { conversacion_id },
    orderBy: { fecha_envio: orden === 'desc' ? 'desc' : 'asc' },
    skip: Math.max(0, Number(offset || 0)),
    take: Math.min(100, Math.max(1, Number(limit || 50))),
    include: {
      emisor: { select: { id: true, nombre: true, apellido: true, rol: true } },
      archivos: {
        select: {
          id: true,
          nombre_original: true,
          nombre_archivo: true,
          url_cloudinary: true,
          tipo_mime: true,
          tamaño_bytes: true,
          fecha_subida: true,
          es_imagen: true,
        },
      },
    },
  });

  const mapped = mensajes.map((m) => ({
    id: m.id,
    conversacion_id,
    emisor: {
      id: m.emisor.id,
      nombre_completo: `${m.emisor.nombre} ${m.emisor.apellido}`,
      rol: m.emisor.rol,
      es_usuario_actual: m.emisor.id === user.id,
    },
    contenido: m.contenido,
    fecha_envio: m.fecha_envio,
    fecha_envio_legible: formatLongDate(m.fecha_envio),
    fecha_envio_relativa: formatRelative(m.fecha_envio),
    estado_lectura: m.estado_lectura,
    fecha_lectura: m.fecha_lectura,
    tiene_adjuntos: !!m.tiene_adjuntos,
    archivos_adjuntos: (m.archivos || []).map((a) => ({
      id: a.id,
      mensaje_id: m.id,
      nombre_original: a.nombre_original,
      nombre_archivo: a.nombre_archivo,
      url_cloudinary: a.url_cloudinary,
      tipo_mime: a.tipo_mime,
      tamaño_bytes: a.tamaño_bytes,
      tamaño_legible: humanSize(a.tamaño_bytes),
      fecha_subida: a.fecha_subida,
      es_imagen: !!a.es_imagen,
    })),
  }));

  // Separadores por fecha
  const separadores_fecha = {};
  for (const m of mapped) {
    const key = dateKeyISO(m.fecha_envio);
    if (key && !separadores_fecha[key]) {
      separadores_fecha[key] = humanSeparatorLabel(m.fecha_envio);
    }
  }

  const take = Math.min(100, Math.max(1, Number(limit || 50)));
  const skip = Math.max(0, Number(offset || 0));
  const tiene_mas = skip + take < total;

  return {
    conversacion_id,
    mensajes: mapped,
    paginacion: { limit: take, offset: skip, total_mensajes: total, tiene_mas },
    separadores_fecha,
  };
}

/**
 * POST /mensajes — Enviar nuevo mensaje en conversación existente
 */
async function sendMessageInConversation({ user, body, files }) {
  const conversacion_id = String(body?.conversacion_id || '').trim();
  const contenido = (body?.contenido != null ? String(body.contenido) : '').trim();

  if (!conversacion_id) {
    const e = new Error('conversacion_id requerido');
    e.status = 400;
    e.code = 'VALIDATION_ERROR';
    e.details = { field: 'conversacion_id' };
    throw e;
  }

  const conv = await ensureUserCanAccessConversation(user, conversacion_id);
  ensureConversationIsActive(conv);

  // RN-64: Docente solo puede responder si la conversación fue iniciada por padre
  const iniciado_por = conv.creado_por === conv.padre_id ? 'padre' : 'docente';
  // Permitir que los docentes respondan en conversaciones iniciadas por padres
  // Esta validación ya se maneja en el controlador de permisos

  // Validaciones de contenido VN-04/05/06/07/08 + VE-06
  const filesArr = Array.isArray(files) ? files : [];
  const contenidoStr = contenido || '';
  if ((contenidoStr.length === 0 || contenidoStr.length < 10) && filesArr.length === 0) {
    const e = new Error('Debe ingresar un mensaje de al menos 10 caracteres o adjuntar archivos');
    e.status = 400;
    e.code = 'VALIDATION_ERROR';
    e.details = { field: 'contenido', minLength: 10, has_files: false };
    throw e;
  }
  if (contenidoStr.length > 0 && (contenidoStr.length < 10 || contenidoStr.length > 1000)) {
    const e = new Error('El mensaje debe tener entre 10 y 1000 caracteres');
    e.status = 400;
    e.code = 'VALIDATION_ERROR';
    e.details = { field: 'contenido', minLength: 10, maxLength: 1000, current: contenidoStr.length };
    throw e;
  }

  // Subidas
  const uploaded = filesArr.length ? await uploadMany(filesArr, 'mensajeria') : [];

  // Transacción: crear mensaje + adjuntos + actualizar fecha_ultimo_mensaje
  const result = await prisma.$transaction(async (tx) => {
    const msg = await tx.mensaje.create({
      data: {
        conversacion_id: conv.id,
        emisor_id: user.id,
        contenido,
        fecha_envio: new Date(),
        estado_lectura: 'enviado',
        tiene_adjuntos: uploaded.length > 0,
      },
      include: { emisor: { select: { id: true, nombre: true, apellido: true, rol: true } } },
    });

    if (uploaded.length) {
      for (const a of uploaded) {
        await tx.archivoAdjunto.create({
          data: {
            mensaje_id: msg.id,
            nombre_original: a.nombre_original,
            nombre_archivo: a.nombre_archivo,
            url_cloudinary: a.url_cloudinary,
            tipo_mime: a.tipo_mime,
            tamaño_bytes: a.tamaño_bytes,
            es_imagen: !!a.es_imagen,
            subido_por: user.id,
          },
        });
      }
    }

    await tx.conversacion.update({
      where: { id: conv.id },
      data: { fecha_ultimo_mensaje: new Date() },
    });

    return { msg };
  });

  // Notificación simulada
  const destinatario_id = user.id === conv.padre_id ? conv.docente_id : conv.padre_id;
  const notificacion = {
    enviada: true,
    canales: ['plataforma', 'whatsapp'],
    destinatario_id,
  };

  // Reconstruir adjuntos para respuesta
  const adjuntos = await prisma.archivoAdjunto.findMany({
    where: { mensaje_id: result.msg.id },
    select: {
      id: true,
      nombre_original: true,
      nombre_archivo: true,
      url_cloudinary: true,
      tipo_mime: true,
      tamaño_bytes: true,
      fecha_subida: true,
      es_imagen: true,
    },
  });

  return {
    mensaje: {
      id: result.msg.id,
      conversacion_id: conv.id,
      emisor: {
        id: result.msg.emisor.id,
        nombre_completo: `${result.msg.emisor.nombre} ${result.msg.emisor.apellido}`,
        rol: result.msg.emisor.rol,
        es_usuario_actual: true,
      },
      contenido,
      fecha_envio: result.msg.fecha_envio,
      fecha_envio_legible: formatLongDate(result.msg.fecha_envio),
      fecha_envio_relativa: 'Ahora',
      estado_lectura: result.msg.estado_lectura,
      fecha_lectura: null,
      tiene_adjuntos: adjuntos.length > 0,
      archivos_adjuntos: adjuntos.map((a) => ({
        id: a.id,
        mensaje_id: result.msg.id,
        nombre_original: a.nombre_original,
        nombre_archivo: a.nombre_archivo,
        url_cloudinary: a.url_cloudinary,
        tipo_mime: a.tipo_mime,
        tamaño_bytes: a.tamaño_bytes,
        tamaño_legible: humanSize(a.tamaño_bytes),
        fecha_subida: a.fecha_subida,
        es_imagen: !!a.es_imagen,
      })),
    },
    conversacion_actualizada: {
      fecha_ultimo_mensaje: new Date(),
    },
    notificacion,
  };
}

/**
 * PATCH /mensajes/marcar-leidos — batch por IDs
 */
async function markMessagesAsRead({ user, conversacion_id, mensajes_ids = [] }) {
  if (!Array.isArray(mensajes_ids) || mensajes_ids.length === 0) {
    const e = new Error('mensajes_ids requerido (array no vacío)');
    e.status = 400;
    e.code = 'VALIDATION_ERROR';
    e.details = { field: 'mensajes_ids' };
    throw e;
  }

  await ensureUserCanAccessConversation(user, conversacion_id);

  const now = new Date();
  const upd = await prisma.mensaje.updateMany({
    where: {
      id: { in: mensajes_ids },
      conversacion_id,
      emisor_id: { not: user.id },
      estado_lectura: { not: 'leido' },
    },
    data: {
      estado_lectura: 'leido',
      fecha_lectura: now,
    },
  });

  return {
    conversacion_id,
    mensajes_actualizados: upd.count,
    fecha_lectura: now,
  };
}

/**
 * GET /mensajes/nuevos — desde último mensaje conocido
 */
async function getNewMessagesSince({ user, conversacion_id, ultimo_mensaje_id }) {
  await ensureUserCanAccessConversation(user, conversacion_id);

  const last = await prisma.mensaje.findFirst({
    where: { id: ultimo_mensaje_id, conversacion_id },
    select: { fecha_envio: true },
  });

  if (!last) {
    return {
      hay_nuevos_mensajes: false,
      nuevos_mensajes: [],
      total_nuevos_mensajes: 0,
    };
  }

  const nuevos = await prisma.mensaje.findMany({
    where: {
      conversacion_id,
      fecha_envio: { gt: last.fecha_envio },
    },
    orderBy: { fecha_envio: 'asc' },
    include: {
      emisor: { select: { id: true, nombre: true, apellido: true, rol: true } },
      archivos: {
        select: {
          id: true,
          nombre_original: true,
          nombre_archivo: true,
          url_cloudinary: true,
          tipo_mime: true,
          tamaño_bytes: true,
          fecha_subida: true,
          es_imagen: true,
        },
      },
    },
  });

  const mapped = nuevos.map((m) => ({
    id: m.id,
    conversacion_id,
    emisor: {
      id: m.emisor.id,
      nombre_completo: `${m.emisor.nombre} ${m.emisor.apellido}`,
      rol: m.emisor.rol,
      es_usuario_actual: m.emisor.id === user.id,
    },
    contenido: m.contenido,
    fecha_envio: m.fecha_envio,
    fecha_envio_legible: formatLongDate(m.fecha_envio),
    fecha_envio_relativa: formatRelative(m.fecha_envio),
    estado_lectura: m.estado_lectura,
    fecha_lectura: m.fecha_lectura,
    tiene_adjuntos: (m.archivos || []).length > 0,
    archivos_adjuntos: (m.archivos || []).map((a) => ({
      id: a.id,
      mensaje_id: m.id,
      nombre_original: a.nombre_original,
      nombre_archivo: a.nombre_archivo,
      url_cloudinary: a.url_cloudinary,
      tipo_mime: a.tipo_mime,
      tamaño_bytes: a.tamaño_bytes,
      tamaño_legible: humanSize(a.tamaño_bytes),
      fecha_subida: a.fecha_subida,
      es_imagen: !!a.es_imagen,
    })),
  }));

  return {
    hay_nuevos_mensajes: mapped.length > 0,
    nuevos_mensajes: mapped,
    total_nuevos_mensajes: mapped.length,
  };
}

/**
 * GET /archivos/:id/download — datos para descarga
 */
async function getAttachmentForDownload({ user, archivo_id }) {
  const adj = await prisma.archivoAdjunto.findUnique({
    where: { id: archivo_id },
    include: {
      mensaje: {
        select: {
          conversacion_id: true,
          conversacion: {
            select: {
              id: true, padre_id: true, docente_id: true,
            },
          },
        },
      },
    },
  });

  if (!adj) {
    const e = new Error('El archivo no existe o ha sido eliminado');
    e.status = 404;
    e.code = 'FILE_NOT_FOUND';
    throw e;
  }

  // Validar acceso por conversación
  await ensureUserCanAccessConversation(user, adj.mensaje.conversacion_id);

  return {
    url: adj.url_cloudinary,
    nombre_original: adj.nombre_original,
    tipo_mime: adj.tipo_mime,
  };
}

module.exports = {
  listConversations,
  countUnread,
  getUpdatesSince,
  markConversationRead,
  closeConversation,
  // HU-MSG-01
  checkConversationExists,
  createConversationWithMessage,
  getCurrentAcademicYear,
  // HU-MSG-03
  ensureUserCanAccessConversation,
  ensureConversationIsActive,
  getConversationById,
  getMessagesPaginated,
  sendMessageInConversation,
  markMessagesAsRead,
  getNewMessagesSince,
  getAttachmentForDownload,
};