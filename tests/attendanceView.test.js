import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import app from '../index.js';
import prisma from '../config/prisma.js';

// Helpers
function currentYear() {
  const y = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

async function loginAsApoderado() {
  const res = await request(app).post('/auth/login').send({
    tipo_documento: 'DNI',
    nro_documento: '12345678',
    password: 'Password123',
  });
  expect(res.status).toBe(200);
  expect(res.body?.data?.token).toBeDefined();
  return `Bearer ${res.body.data.token}`;
}

describe('HU-ACAD-07 — Consultar Asistencia Diaria con Calendario y Estadísticas', () => {
  const year = currentYear();
  let bearer = '';

  // Fixtures
  let apoderado = null;
  let docente = null;
  let nivelGrado = null;
  let estudiante = null;
  let estudianteSinRelacion = null;
  let relacion = null;

  // Track asistencias creadas para cleanup
  const asistenciaIds = [];

  beforeAll(async () => {
    bearer = await loginAsApoderado();

    // Usuarios base del seed
    apoderado = await prisma.usuario.findFirst({
      where: { tipo_documento: 'DNI', nro_documento: '12345678' },
      select: { id: true },
    });
    expect(apoderado).toBeTruthy();

    docente = await prisma.usuario.findFirst({
      where: { tipo_documento: 'DNI', nro_documento: '77777777' },
      select: { id: true },
    });
    expect(docente).toBeTruthy();

    // Nivel/Grado (del seed) o crear si no existe
    nivelGrado = await prisma.nivelGrado.findFirst({
      where: { nivel: 'Primaria', grado: '3' },
    });
    if (!nivelGrado) {
      nivelGrado = await prisma.nivelGrado.create({
        data: { nivel: 'Primaria', grado: '3', descripcion: '3ro de Primaria', estado_activo: true },
      });
    }

    // Crear un curso para las asistencias
    const curso = await prisma.curso.findFirst({
      where: { codigo_curso: 'C-PRI-3-001' },
    });
    if (!curso) {
      await prisma.curso.create({
        data: {
          nombre: 'Matemáticas',
          codigo_curso: 'C-PRI-3-001',
          nivel_grado_id: nivelGrado.id,
          año_academico: year,
          estado_activo: true,
        },
      });
    }

    // Estudiantes
    const codigoEstudiante = `AST-${Date.now()}`;
    estudiante = await prisma.estudiante.create({
      data: {
        codigo_estudiante: codigoEstudiante,
        nombre: 'María Elena',
        apellido: 'Pérez García',
        nivel_grado_id: nivelGrado.id,
        año_academico: year,
        estado_matricula: 'activo',
      },
    });

    const codigoEstudiante2 = `AST-NOREL-${Date.now()}`;
    estudianteSinRelacion = await prisma.estudiante.create({
      data: {
        codigo_estudiante: codigoEstudiante2,
        nombre: 'Carlos',
        apellido: 'SinRelacion',
        nivel_grado_id: nivelGrado.id,
        año_academico: year,
        estado_matricula: 'activo',
      },
    });

    // Relación apoderado-estudiante
    relacion = await prisma.relacionesFamiliares.create({
      data: {
        apoderado_id: apoderado.id,
        estudiante_id: estudiante.id,
        tipo_relacion: 'padre',
        estado_activo: true,
        año_academico: year,
      },
    });

    // Crear asistencias para marzo (mes=3) del año actual
    const registros = [
      { fecha: `${year}-03-01`, estado: 'presente' },
      { fecha: `${year}-03-02`, estado: 'tardanza', hora_llegada: '08:15' },
      { fecha: `${year}-03-03`, estado: 'falta_injustificada' },
      { fecha: `${year}-03-04`, estado: 'permiso' },
      { fecha: `${year}-03-05`, estado: 'falta_justificada' },
    ];

    for (const r of registros) {
      const a = await prisma.asistencia.create({
        data: {
          estudiante_id: estudiante.id,
          curso_id: curso.id, // Usar el ID del curso creado
          fecha: new Date(r.fecha),
          tipo_asistencia: r.estado, // Usar tipo_asistencia en lugar de estado
          estado: r.estado, // Agregar campo estado según el modelo
          hora_llegada: r.hora_llegada || null, // Agregar campo hora_llegada
          justificacion: null, // Agregar campo justificacion
          año_academico: year, // Agregar campo año_academico
          registrado_por: docente.id,
        },
      });
      asistenciaIds.push(a.id);
    }
  });

  afterAll(async () => {
    // Limpiar asistencias
    if (asistenciaIds.length) {
      await prisma.asistencia.deleteMany({ where: { id: { in: asistenciaIds } } }).catch(() => {});
    }
    // Relación
    if (relacion) {
      await prisma.relacionesFamiliares.delete({ where: { id: relacion.id } }).catch(() => {});
    }
    // Estudiantes
    if (estudiante) {
      await prisma.estudiante.delete({ where: { id: estudiante.id } }).catch(() => {});
    }
    if (estudianteSinRelacion) {
      await prisma.estudiante.delete({ where: { id: estudianteSinRelacion.id } }).catch(() => {});
    }
  });

  it('GET /asistencias/estudiante/:id (mes) — 200 OK', async () => {
    const res = await request(app)
      .get(`/asistencias/estudiante/${estudiante.id}?año=${year}&mes=3`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.estudiante?.id).toBe(estudiante.id);
    expect(data?.periodo?.año).toBe(year);
    expect(data?.periodo?.mes).toBe(3);
    expect(Array.isArray(data?.registros)).toBe(true);
    expect(data?.total_registros).toBeGreaterThanOrEqual(5);
    // Resumen debería reflejar los 5 estados que creamos (al menos 1 cada uno)
    expect(data?.resumen?.presente).toBeGreaterThanOrEqual(1);
    expect(data?.resumen?.tardanza).toBeGreaterThanOrEqual(1);
    expect(data?.resumen?.permiso).toBeGreaterThanOrEqual(1);
    expect(data?.resumen?.falta_justificada).toBeGreaterThanOrEqual(1);
    expect(data?.resumen?.falta_injustificada).toBeGreaterThanOrEqual(1);
  });

  it('GET /asistencias/estudiante/:id (trimestre) — 200 OK', async () => {
    const res = await request(app)
      .get(`/asistencias/estudiante/${estudiante.id}?año=${year}&trimestre=1`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.periodo?.trimestre).toBe(1);
    expect(Array.isArray(data?.registros)).toBe(true);
  });

  it('GET /asistencias/estudiante/:id — 400 INVALID_PARAMETERS por mes y trimestre simultáneos', async () => {
    const res = await request(app)
      .get(`/asistencias/estudiante/${estudiante.id}?año=${year}&mes=3&trimestre=1`)
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_PARAMETERS');
  });

  it('GET /asistencias/estudiante/:id — 403 ACCESS_DENIED sin relación', async () => {
    const res = await request(app)
      .get(`/asistencias/estudiante/${estudianteSinRelacion.id}?año=${year}&mes=3`)
      .set('Authorization', bearer);

    expect(res.status).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('ACCESS_DENIED');
  });

  it('GET /asistencias/estudiante/:id/estadisticas — 200 OK', async () => {
    const res = await request(app)
      .get(`/asistencias/estudiante/${estudiante.id}/estadisticas?fecha_inicio=${year}-03-01&fecha_fin=${year}-03-31`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.periodo?.fecha_inicio).toBe(`${year}-03-01`);
    expect(data?.periodo?.fecha_fin).toBe(`${year}-03-31`);
    expect(typeof data?.porcentajes?.asistencia_global).toBe('number');
    expect(Array.isArray(data?.alertas)).toBe(true);
    expect(Array.isArray(data?.reconocimientos)).toBe(true);
  });

  it('GET /asistencias/estudiante/:id/export — 200 application/pdf', async () => {
    const res = await request(app)
      .get(
        `/asistencias/estudiante/${estudiante.id}/export?formato=pdf&fecha_inicio=${year}-03-01&fecha_fin=${year}-03-31`
      )
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(String(res.headers['content-type'] || '')).toContain('application/pdf');
    expect(String(res.headers['content-disposition'] || '')).toContain('attachment; filename=');
    expect(res.body?.length >= 0).toBe(true);
  });

  it('GET /asistencias/estudiante/:id/export — 400 NO_DATA_TO_EXPORT cuando no hay registros', async () => {
    const res = await request(app)
      .get(
        `/asistencias/estudiante/${estudiante.id}/export?formato=pdf&fecha_inicio=${year}-02-01&fecha_fin=${year}-02-10`
      )
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('NO_DATA_TO_EXPORT');
  });

  it('GET /asistencias/estudiante/:id/estadisticas — 400 INVALID_DATE_RANGE cuando fecha_inicio > fecha_fin', async () => {
    const res = await request(app)
      .get(`/asistencias/estudiante/${estudiante.id}/estadisticas?fecha_inicio=${year}-03-31&fecha_fin=${year}-03-01`)
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_DATE_RANGE');
  });
});