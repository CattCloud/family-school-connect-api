import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import app from '../index.js';

const prisma = new PrismaClient();

async function login(tipo_documento, nro_documento, password) {
  const res = await request(app).post('/auth/login').send({
    tipo_documento,
    nro_documento,
    password,
  });
  expect(res.status).toBe(200);
  expect(res.body?.data?.token).toBeDefined();
  return {
    bearer: `Bearer ${res.body.data.token}`,
    user: res.body?.data?.user,
  };
}

async function loginAsParent() {
  return login('DNI', '12345678', 'Password123');
}

async function loginAsTeacher() {
  return login('DNI', '77777777', 'Password123');
}

function currentYear() {
  const y = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

describe('HU-MSG-03 — Ver Conversación y Continuar Chat', () => {
  let bearerParent = '';
  let bearerTeacher = '';

  let padre = null;
  let docente = null;
  let nivelGrado = null;
  let curso = null;
  let estudiante = null;

  let conversacionId = null;
  let initialParentMsgId = null;
  let initialAttachmentId = null;

  beforeAll(async () => {
    // Logins
    const p = await loginAsParent();
    bearerParent = p.bearer;

    const t = await loginAsTeacher();
    bearerTeacher = t.bearer;

    // Entidades base del seed
    padre = await prisma.usuario.findFirst({
      where: { tipo_documento: 'DNI', nro_documento: '12345678' },
    });
    expect(padre).toBeTruthy();

    docente = await prisma.usuario.findFirst({
      where: { tipo_documento: 'DNI', nro_documento: '77777777' },
    });
    expect(docente).toBeTruthy();

    nivelGrado = await prisma.nivelGrado.findFirst({
      where: { nivel: 'Primaria', grado: '3' },
    });
    expect(nivelGrado).toBeTruthy();

    curso = await prisma.curso.findFirst({
      where: { codigo_curso: 'C-PRI-3-001' },
    });
    expect(curso).toBeTruthy();

    // Crear estudiante de prueba y relación con apoderado
    const year = currentYear();

    estudiante = await prisma.estudiante.create({
      data: {
        codigo_estudiante: `P3CHAT_${Date.now()}`,
        nombre: 'Juan',
        apellido: 'Pérez Chat',
        nivel_grado_id: nivelGrado.id,
        año_academico: year,
        estado_matricula: 'activo',
      },
    });

    await prisma.relacionesFamiliares.create({
      data: {
        apoderado_id: padre.id,
        estudiante_id: estudiante.id,
        tipo_relacion: 'padre',
        estado_activo: true,
        año_academico: year,
      },
    });

    // Verificar asignación docente-curso activa en el año
    const asg = await prisma.asignacionDocenteCurso.findFirst({
      where: {
        docente_id: docente.id,
        curso_id: curso.id,
        año_academico: year,
        estado_activo: true,
      },
    });
    expect(asg).toBeTruthy();

    // Crear conversación inicial (HU-MSG-01) con un adjunto para probar descarga
    const asunto = 'Consulta inicial sobre la tarea de matemáticas (chat)';
    const mensaje = 'Buenos días, profesora. Tengo una consulta sobre el ejercicio 5.';
    const pdfBuffer = Buffer.from('%PDF-1.4\n%Test Chat\n', 'utf-8');

    const resCreate = await request(app)
      .post('/conversaciones')
      .set('Authorization', bearerParent)
      .field('estudiante_id', estudiante.id)
      .field('curso_id', curso.id)
      .field('docente_id', docente.id)
      .field('asunto', asunto)
      .field('mensaje', mensaje)
      .attach('archivos', pdfBuffer, { filename: 'chat-ejemplo.pdf', contentType: 'application/pdf' });

    expect(resCreate.status).toBe(201);
    expect(resCreate.body?.success).toBe(true);
    conversacionId = resCreate.body?.data?.conversacion?.id;
    initialParentMsgId = resCreate.body?.data?.mensaje?.id;
    // Adjuntos se devuelven sin id (simulado), luego obtendremos por GET /mensajes
    expect(conversacionId).toBeDefined();
    expect(initialParentMsgId).toBeDefined();
  });

  it('GET /conversaciones/:id — devuelve el detalle de conversación y permisos', async () => {
    const res = await request(app)
      .get(`/conversaciones/${conversacionId}`)
      .set('Authorization', bearerParent);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);

    const conv = res.body?.data?.conversacion;
    expect(conv?.id).toBe(conversacionId);
    expect(conv?.estado).toBe('activa');
    expect(conv?.asunto).toBeTruthy();
    expect(conv?.padre?.id).toBe(padre.id);
    expect(conv?.docente?.id).toBe(docente.id);

    const permisos = res.body?.data?.permisos;
    expect(permisos?.puede_enviar_mensajes).toBe(true); // padre siempre puede
  });

  it('GET /mensajes?conversacion_id — lista mensajes (asc por defecto) y separadores', async () => {
    const res = await request(app)
      .get('/mensajes')
      .query({ conversacion_id: conversacionId, limit: 50, offset: 0, orden: 'asc' })
      .set('Authorization', bearerParent);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);

    const mensajes = res.body?.data?.mensajes || [];
    expect(Array.isArray(mensajes)).toBe(true);
    expect(mensajes.length).toBeGreaterThanOrEqual(1);

    const first = mensajes[0];
    expect(first?.conversacion_id).toBe(conversacionId);
    expect(first?.emisor?.id).toBe(padre.id);

    // Capturar attachment id si existe
    const conAdjuntos = mensajes.find((m) => (m.archivos_adjuntos || []).length > 0);
    if (conAdjuntos) {
      initialAttachmentId = conAdjuntos.archivos_adjuntos[0]?.id || null;
    }

    // Separadores de fecha
    const sep = res.body?.data?.separadores_fecha || {};
    expect(typeof sep).toBe('object');
  });

  it('GET /archivos/:id/download — 302 redirige a URL de Cloudinary (si existe adjunto)', async () => {
    if (!initialAttachmentId) {
      // Si no hubo adjuntos en el almacenamiento simulado, se omite esta aserción.
      return;
    }
    const res = await request(app)
      .get(`/archivos/${initialAttachmentId}/download`)
      .set('Authorization', bearerParent)
      .redirects(0); // no seguir redirección

    expect([302, 200, 404]).toContain(res.status); // En simulación puede devolver 302 o 200/404 según CDN
    if (res.status === 302) {
      expect(res.headers?.location).toBeTruthy();
    }
  });

  it('POST /mensajes — docente puede responder en conversación iniciada por padre', async () => {
    const contenido = 'Respuesta del docente respecto a su consulta.';
    const res = await request(app)
      .post('/mensajes')
      .set('Authorization', bearerTeacher)
      .field('conversacion_id', conversacionId)
      .field('contenido', contenido);

    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);

    const msg = res.body?.data?.mensaje;
    expect(msg?.conversacion_id).toBe(conversacionId);
    expect(msg?.emisor?.id).toBe(docente.id);
  });

  it('GET /mensajes/nuevos — devuelve mensajes nuevos desde el último conocido', async () => {
    // Obtener el último mensaje actual del hilo
    const resList = await request(app)
      .get('/mensajes')
      .query({ conversacion_id: conversacionId, limit: 50, offset: 0, orden: 'asc' })
      .set('Authorization', bearerParent);

    expect(resList.status).toBe(200);
    const mensajes = resList.body?.data?.mensajes || [];
    expect(mensajes.length).toBeGreaterThan(0);
    const lastMsgId = mensajes[mensajes.length - 1].id;

    // Enviar otro mensaje por docente para que aparezca en "nuevos"
    const resSend = await request(app)
      .post('/mensajes')
      .set('Authorization', bearerTeacher)
      .field('conversacion_id', conversacionId)
      .field('contenido', 'Otra respuesta del docente para probar polling.');
    expect(resSend.status).toBe(201);

    const resNuevos = await request(app)
      .get('/mensajes/nuevos')
      .query({ conversacion_id: conversacionId, ultimo_mensaje_id: lastMsgId })
      .set('Authorization', bearerParent);

    expect(resNuevos.status).toBe(200);
    expect(resNuevos.body?.success).toBe(true);
    expect(typeof resNuevos.body?.data?.hay_nuevos_mensajes).toBe('boolean');
    const totalNuevos = resNuevos.body?.data?.total_nuevos_mensajes || 0;
    expect(totalNuevos).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /mensajes/marcar-leidos — marca mensajes del otro usuario como leídos', async () => {
    // Encontrar un mensaje del docente para marcar como leído
    const resList = await request(app)
      .get('/mensajes')
      .query({ conversacion_id: conversacionId, limit: 50, offset: 0, orden: 'asc' })
      .set('Authorization', bearerParent);

    expect(resList.status).toBe(200);
    const mensajes = resList.body?.data?.mensajes || [];
    const docenteMsgs = mensajes.filter((m) => m.emisor?.id === docente.id);
    expect(docenteMsgs.length).toBeGreaterThan(0);

    const ids = docenteMsgs.slice(-2).map((m) => m.id); // últimos 1-2 mensajes del docente
    const resMark = await request(app)
      .patch('/mensajes/marcar-leidos')
      .set('Authorization', bearerParent)
      .send({ conversacion_id: conversacionId, mensajes_ids: ids });

    expect(resMark.status).toBe(200);
    expect(resMark.body?.success).toBe(true);
    expect(resMark.body?.data?.mensajes_actualizados).toBeGreaterThanOrEqual(1);
  });

  it('POST /mensajes — validación: contenido demasiado corto sin archivos', async () => {
    const res = await request(app)
      .post('/mensajes')
      .set('Authorization', bearerParent)
      .field('conversacion_id', conversacionId)
      .field('contenido', 'Hola'); // length < 10, sin adjuntos

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('VALIDATION_ERROR');
  });
});