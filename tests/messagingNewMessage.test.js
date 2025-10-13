import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import app from '../index.js';

const prisma = new PrismaClient();

async function loginAsParent() {
  const res = await request(app).post('/auth/login').send({
    tipo_documento: 'DNI',
    nro_documento: '12345678',
    password: 'Password123',
  });
  expect(res.status).toBe(200);
  expect(res.body?.data?.token).toBeDefined();
  return {
    bearer: `Bearer ${res.body.data.token}`,
    user: res.body?.data?.user,
  };
}

function currentYear() {
  const y = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

describe('HU-MSG-01 — Enviar Nuevo Mensaje (Padre)', () => {
  let bearer = '';
  let padre = null;

  let nivelGrado = null;
  let curso = null;
  let docente = null;
  let estudiante = null;

  let createdConversationId = null;

  beforeAll(async () => {
    // Login como apoderado
    const login = await loginAsParent();
    bearer = login.bearer;

    // Obtener entidades base del seed
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

    // Crear estudiante de prueba y relación familiar activa con el apoderado
    const year = currentYear();

    estudiante = await prisma.estudiante.create({
      data: {
        codigo_estudiante: `P3TEST_${Date.now()}`,
        nombre: 'María Elena',
        apellido: 'Pérez García',
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

    // La asignación docente-curso ya existe en seed (docente -> curso)
    const asg = await prisma.asignacionDocenteCurso.findFirst({
      where: {
        docente_id: docente.id,
        curso_id: curso.id,
        año_academico: year,
        estado_activo: true,
      },
    });
    expect(asg).toBeTruthy();
  });

  it('GET /usuarios/hijos - debe listar hijos del padre autenticado', async () => {
    const res = await request(app).get('/usuarios/hijos').set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);

    const hijos = res.body?.data?.hijos || [];
    const found = hijos.find((h) => h.id === estudiante.id);
    expect(found).toBeTruthy();
    expect(res.body?.data?.total_hijos).toBeGreaterThan(0);
  });

  it('GET /cursos/estudiante/:estudiante_id - debe listar cursos del estudiante', async () => {
    const res = await request(app)
      .get(`/cursos/estudiante/${estudiante.id}`)
      .query({ año: currentYear() })
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);

    const cursos = res.body?.data?.cursos || [];
    const found = cursos.find((c) => c.id === curso.id);
    expect(found).toBeTruthy();
  });

  it('GET /docentes/curso/:curso_id - debe listar docentes asignados activos para el curso', async () => {
    const res = await request(app)
      .get(`/docentes/curso/${curso.id}`)
      .query({ año: currentYear() })
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);

    const docentes = res.body?.data?.docentes || [];
    const found = docentes.find((d) => d.id === docente.id);
    expect(found).toBeTruthy();
  });

  it('GET /conversaciones/existe - inicialmente no debe existir conversación', async () => {
    const res = await request(app)
      .get('/conversaciones/existe')
      .query({
        docente_id: docente.id,
        estudiante_id: estudiante.id,
        curso_id: curso.id,
      })
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.existe).toBe(false);
    expect(res.body?.data?.conversacion).toBeNull();
  });

  it('POST /conversaciones - debe crear conversación con mensaje y adjunto', async () => {
    const asunto = 'Consulta sobre tarea de matemáticas';
    const mensaje = 'Buenos días, profesora. Quisiera consultar sobre la tarea de esta semana.';

    // Generar un buffer mínimo de "PDF" (simulado)
    const pdfBuffer = Buffer.from('%PDF-1.4\n%Test\n', 'utf-8');

    const res = await request(app)
      .post('/conversaciones')
      .set('Authorization', bearer)
      .field('estudiante_id', estudiante.id)
      .field('curso_id', curso.id)
      .field('docente_id', docente.id)
      .field('asunto', asunto)
      .field('mensaje', mensaje)
      .attach('archivos', pdfBuffer, { filename: 'ejemplo.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.conversacion?.id).toBeDefined();
    expect(res.body?.data?.mensaje?.id).toBeDefined();
    expect(res.body?.data?.archivos_adjuntos?.length).toBeGreaterThanOrEqual(1);

    createdConversationId = res.body?.data?.conversacion?.id;
  });

  it('GET /conversaciones/existe - luego debe existir conversación con ese contexto', async () => {
    const res = await request(app)
      .get('/conversaciones/existe')
      .query({
        docente_id: docente.id,
        estudiante_id: estudiante.id,
        curso_id: curso.id,
      })
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.existe).toBe(true);
    expect(res.body?.data?.conversacion?.id).toBeDefined();
  });

  it('POST /conversaciones - validación de asunto demasiado corto', async () => {
    const res = await request(app)
      .post('/conversaciones')
      .set('Authorization', bearer)
      .field('estudiante_id', estudiante.id)
      .field('curso_id', curso.id)
      .field('docente_id', docente.id)
      .field('asunto', 'Hola') // inválido
      .field('mensaje', 'Mensaje suficiente para validar contenido.');

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('VALIDATION_ERROR');
  });
});