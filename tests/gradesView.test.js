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

describe('HU-ACAD-06 — Visualización de calificaciones por componente', () => {
  const year = currentYear();
  let bearer = '';

  // Fixtures
  let apoderado = null;
  let docente = null;
  let nivelGrado = null;
  let curso = null;
  let estudiante = null;
  let estudianteSinRelacion = null;
  let relacion = null;
  let componente = null;
  let createdComponente = false;
  const trimestre = 1;

  // Track evaluaciones creadas para cleanup
  const evaluacionIds = [];

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

    // Curso (del seed) o crear
    curso = await prisma.curso.findFirst({
      where: { codigo_curso: 'C-PRI-3-001' },
    });
    if (!curso) {
      curso = await prisma.curso.create({
        data: {
          nombre: 'Matemáticas',
          codigo_curso: 'C-PRI-3-001',
          nivel_grado_id: nivelGrado.id,
          año_academico: year,
          estado_activo: true,
        },
      });
    }

    // Estudiante principal
    const codigoEstudiante = `TST-${Date.now()}`;
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

    // Estudiante sin relación
    const codigoEstudiante2 = `NOREL-${Date.now()}`;
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

    // Estructura de evaluación (buscar o crear)
    componente = await prisma.estructuraEvaluacion.findFirst({
      where: {
        año_academico: year,
        nombre_item: 'Participación',
        estado_activo: true,
      },
    });
    if (!componente) {
      componente = await prisma.estructuraEvaluacion.create({
        data: {
          año_academico: year,
          nombre_item: 'Participación',
          peso_porcentual: 20.0,
          tipo_evaluacion: 'recurrente',
          orden_visualizacion: 1,
          estado_activo: true,
          bloqueada: true,
        },
      });
      createdComponente = true;
    }

    // Evaluaciones del componente (dos registros)
    const fechas = [`${year}-03-15`, `${year}-03-22`];
    const notas = [14.0, 17.0]; // promedio 15.5
    for (let i = 0; i < fechas.length; i++) {
      const ev = await prisma.evaluacion.create({
        data: {
          estudiante_id: estudiante.id,
          curso_id: curso.id,
          estructura_evaluacion_id: componente.id,
          trimestre,
          año_academico: year,
          fecha_evaluacion: new Date(fechas[i]),
          calificacion_numerica: notas[i],
          calificacion_letra: notas[i] >= 18 ? 'AD' : notesToLetter(notas[i]),
          observaciones: null,
          // estado: por defecto 'preliminar'
          registrado_por: docente.id,
        },
      });
      evaluacionIds.push(ev.id);
    }
  });

  afterAll(async () => {
    // Limpiar evaluaciones
    if (evaluacionIds.length) {
      await prisma.evaluacion.deleteMany({ where: { id: { in: evaluacionIds } } });
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
    // Componente (si lo creamos en este test)
    if (createdComponente && componente) {
      await prisma.estructuraEvaluacion.delete({ where: { id: componente.id } }).catch(() => {});
    }
  });

  it('GET /calificaciones/estudiante/:id - lista evaluaciones y promedio', async () => {
    const res = await request(app)
      .get(
        `/calificaciones/estudiante/${estudiante.id}?año=${year}&trimestre=${trimestre}&curso_id=${curso.id}&componente_id=${componente.id}`
      )
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.estudiante?.id).toBe(estudiante.id);
    expect(data?.curso?.id).toBe(curso.id);
    expect(data?.componente?.id).toBe(componente.id);
    expect(Array.isArray(data?.evaluaciones)).toBe(true);
    expect(data?.total_evaluaciones).toBe(2);
    expect(typeof data?.promedio_componente).toBe('number');
    expect(data?.hay_notas_preliminares).toBe(true); // por defecto 'preliminar'
  });

  it('GET /calificaciones/estudiante/:id/promedio - retorna promedio y estado', async () => {
    const res = await request(app)
      .get(
        `/calificaciones/estudiante/${estudiante.id}/promedio?curso_id=${curso.id}&componente_id=${componente.id}&trimestre=${trimestre}&año=${year}`
      )
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.componente?.id).toBe(componente.id);
    expect(data?.total_evaluaciones).toBeGreaterThan(0);
    expect(typeof data?.promedio).toBe('number');
    expect(['preliminar', 'final']).toContain(data?.estado);
    // Con los datos creados, debería ser preliminar
    expect(data?.estado).toBe('preliminar');
  });

  it('GET /calificaciones/estudiante/:id - 404 NO_GRADES_FOUND cuando no hay datos', async () => {
    const res = await request(app)
      .get(
        `/calificaciones/estudiante/${estudiante.id}?año=${year}&trimestre=2&curso_id=${curso.id}&componente_id=${componente.id}`
      )
      .set('Authorization', bearer);

    expect(res.status).toBe(404);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('NO_GRADES_FOUND');
  });

  it('GET /calificaciones/estudiante/:id - 403 ACCESS_DENIED sin relación padre-hijo', async () => {
    const res = await request(app)
      .get(
        `/calificaciones/estudiante/${estudianteSinRelacion.id}?año=${year}&trimestre=${trimestre}&curso_id=${curso.id}&componente_id=${componente.id}`
      )
      .set('Authorization', bearer);

    expect(res.status).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('ACCESS_DENIED');
  });

  it('GET /calificaciones/estudiante/:id - 400 INVALID_PARAMETERS por query faltante', async () => {
    const res = await request(app)
      .get(`/calificaciones/estudiante/${estudiante.id}?año=${year}&trimestre=${trimestre}&componente_id=${componente.id}`)
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_PARAMETERS');
  });
});

// Utilidad local mínima para letra (solo para construir fixtures coherentes)
function notesToLetter(n) {
  if (n >= 18) return 'AD';
  if (n >= 14) return 'A';
  if (n >= 11) return 'B';
  return 'C';
}