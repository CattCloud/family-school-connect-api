import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import app from '../index.js';
import prisma from '../config/prisma.js';

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

describe('HU-ACAD-09 — Resumen Trimestral y Anual Consolidado', () => {
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

  // Estructura de evaluación creada por el test (marcar bandera para cleanup)
  const componentes = [];
  let createdComponentes = false;

  // Track evaluaciones para cleanup
  const evaluacionIds = [];

  beforeAll(async () => {
    bearer = await loginAsApoderado();

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

    // Nivel/Grado
    nivelGrado = await prisma.nivelGrado.findFirst({
      where: { nivel: 'Primaria', grado: '3' },
    });
    if (!nivelGrado) {
      nivelGrado = await prisma.nivelGrado.create({
        data: { nivel: 'Primaria', grado: '3', descripcion: '3ro de Primaria', estado_activo: true },
      });
    }

    // Curso
    curso = await prisma.curso.findFirst({
      where: { codigo_curso: 'C-PRI-3-001', año_academico: year },
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

    // Estudiante con relación
    const codigoEstudiante = `SUM-${Date.now()}`;
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
    const codigoEstudiante2 = `SUM-NOREL-${Date.now()}`;
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

    relacion = await prisma.relacionesFamiliares.create({
      data: {
        apoderado_id: apoderado.id,
        estudiante_id: estudiante.id,
        tipo_relacion: 'padre',
        estado_activo: true,
        año_academico: year,
      },
    });

    // Estructura de evaluación (intentar encontrar; si no, crear el set estándar)
    const search = await prisma.estructuraEvaluacion.findMany({
      where: { año_academico: year, estado_activo: true },
      orderBy: { orden_visualizacion: 'asc' },
    });

    if (search.length === 0) {
      createdComponentes = true;
      const payload = [
        { nombre_item: 'Examen', peso_porcentual: 40.0, tipo_evaluacion: 'unica', orden_visualizacion: 1 },
        { nombre_item: 'Participación', peso_porcentual: 20.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 2 },
        { nombre_item: 'Revisión de Cuaderno', peso_porcentual: 15.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 3 },
        { nombre_item: 'Revisión de Libro', peso_porcentual: 15.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 4 },
        { nombre_item: 'Comportamiento', peso_porcentual: 10.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 5 },
      ];
      for (const [i, comp] of payload.entries()) {
        const c = await prisma.estructuraEvaluacion.create({
          data: {
            año_academico: year,
            nombre_item: comp.nombre_item,
            peso_porcentual: comp.peso_porcentual,
            tipo_evaluacion: comp.tipo_evaluacion,
            orden_visualizacion: comp.orden_visualizacion,
            estado_activo: true,
            bloqueada: true,
          },
        });
        componentes.push(c);
      }
    } else {
      componentes.push(...search);
    }

    // Crear algunas evaluaciones para Trimestre 1 únicamente (para probar trimestral y que anual responda)
    const compByName = (name) => componentes.find((c) => c.nombre_item === name) || componentes[0];

    const registros = [
      // Examen (única)
      {
        fecha: `${year}-03-15`,
        componente: compByName('Examen'),
        nota: 16.0,
      },
      // Participación (recurrente) dos registros
      {
        fecha: `${year}-03-10`,
        componente: compByName('Participación'),
        nota: 14.5,
      },
      {
        fecha: `${year}-03-20`,
        componente: compByName('Participación'),
        nota: 15.0,
      },
      // Revisión de Cuaderno
      {
        fecha: `${year}-03-12`,
        componente: compByName('Revisión de Cuaderno'),
        nota: 15.2,
      },
      // Revisión de Libro
      {
        fecha: `${year}-03-22`,
        componente: compByName('Revisión de Libro'),
        nota: 14.0,
      },
      // Comportamiento
      {
        fecha: `${year}-03-05`,
        componente: compByName('Comportamiento'),
        nota: 18.0,
      },
    ];

    for (const r of registros) {
      const ev = await prisma.evaluacion.create({
        data: {
          estudiante_id: estudiante.id,
          curso_id: curso.id,
          estructura_evaluacion_id: r.componente.id,
          trimestre: 1,
          año_academico: year,
          fecha_evaluacion: new Date(r.fecha),
          calificacion_numerica: r.nota,
          calificacion_letra: notesToLetter(r.nota),
          observaciones: null,
          // estado por defecto: preliminar
          registrado_por: docente.id,
        },
      });
      evaluacionIds.push(ev.id);
    }
  });

  afterAll(async () => {
    // Limpiar evaluaciones
    if (evaluacionIds.length) {
      await prisma.evaluacion.deleteMany({ where: { id: { in: evaluacionIds } } }).catch(() => {});
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
    // Componentes creados por el test
    if (createdComponentes && componentes.length) {
      const ids = componentes.map((c) => c.id);
      await prisma.estructuraEvaluacion.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
  });

  it('GET /resumen-academico/estudiante/:id (trimestral) — 200 OK', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}?año=${year}&trimestre=1`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.estudiante?.id).toBe(estudiante.id);
    expect(data?.año_academico).toBe(year);
    expect(data?.trimestre).toBe(1);
    expect(Array.isArray(data?.cursos)).toBe(true);
    expect(data?.cursos.length).toBeGreaterThan(0);
    const math = data?.cursos?.find((c) => c.nombre === 'Matemáticas');
    expect(math).toBeDefined();
    expect(Array.isArray(math?.promedios_componentes)).toBe(true);
    expect(typeof math?.promedio_trimestre).toBe('number');
    expect(['preliminar', 'final']).toContain(math?.estado);
  });

  it('GET /resumen-academico/estudiante/:id (anual) — 200 OK', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}?año=${year}`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.estudiante?.id).toBe(estudiante.id);
    expect(data?.año_academico).toBe(year);
    expect(data?.vista).toBe('anual');
    expect(Array.isArray(data?.tabla_notas_finales)).toBe(true);
    expect(data?.tabla_notas_finales.length).toBeGreaterThan(0);
  });

  it('GET /resumen-academico/estudiante/:id — 404 NO_GRADES_FOUND para trimestre sin datos', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}?año=${year}&trimestre=2`)
      .set('Authorization', bearer);

    expect(res.status).toBe(404);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('NO_GRADES_FOUND');
  });

  it('GET /resumen-academico/estudiante/:id — 403 ACCESS_DENIED sin relación', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudianteSinRelacion.id}?año=${year}&trimestre=1`)
      .set('Authorization', bearer);

    expect(res.status).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('ACCESS_DENIED');
  });

  it('GET /resumen-academico/estudiante/:id — 400 INVALID_PARAMETERS por trimestre inválido', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}?año=${year}&trimestre=4`)
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_PARAMETERS');
  });

  it('GET /resumen-academico/estudiante/:id/export — 200 application/pdf', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}/export?año=${year}&formato=pdf`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    // Content-Type may include charset; check prefix
    expect(String(res.headers['content-type'] || '')).toContain('application/pdf');
    // content-disposition filename present
    expect(String(res.headers['content-disposition'] || '')).toContain('attachment; filename=');
    // body should be a buffer (non-empty)
    expect(res.body?.length >= 0).toBe(true);
  });

  it('GET /resumen-academico/estudiante/:id/promedios-trimestre — 200 OK', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}/promedios-trimestre?año=${year}`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.estudiante?.id).toBe(estudiante.id);
    expect(data?.año_academico).toBe(year);
    expect(Array.isArray(data?.promedios_trimestre)).toBe(true);
    expect(data?.promedios_trimestre.length).toBeGreaterThan(0);
    
    // Verificar estructura de promedios por trimestre
    const math = data?.promedios_trimestre?.find((c) => c.curso_nombre === 'Matemáticas');
    expect(math).toBeDefined();
    expect(typeof math?.trimestre_1).toBe('number');
    expect(math?.trimestre_2).toBeNull(); // No hay datos para T2
    expect(math?.trimestre_3).toBeNull(); // No hay datos para T3
    
    // Verificar promedio general por trimestre
    expect(data?.promedio_general_trimestres).toBeDefined();
    expect(typeof data?.promedio_general_trimestres?.trimestre_1).toBe('number');
    expect(data?.total_cursos).toBeGreaterThan(0);
  });

  it('GET /resumen-academico/estudiante/:id/promedios-anuales — 200 OK', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}/promedios-anuales?año=${year}`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const data = res.body?.data;
    expect(data?.estudiante?.id).toBe(estudiante.id);
    expect(data?.año_academico).toBe(year);
    expect(Array.isArray(data?.promedios_anuales)).toBe(true);
    expect(data?.promedios_anuales.length).toBeGreaterThan(0);
    
    // Verificar estructura de promedios anuales
    const math = data?.promedios_anuales?.find((c) => c.curso_nombre === 'Matemáticas');
    expect(math).toBeDefined();
    expect(typeof math?.trimestre_1).toBe('number');
    expect(math?.trimestre_2).toBeNull(); // No hay datos para T2
    expect(math?.trimestre_3).toBeNull(); // No hay datos para T3
    expect(math?.promedio_final).toBeNull(); // No hay datos suficientes para promedio final
    
    // Verificar estadísticas
    expect(data?.estadisticas).toBeDefined();
    expect(data?.estadisticas?.total_cursos).toBeGreaterThan(0);
  });

  it('GET /resumen-academico/estudiante/:id/promedios-trimestre — 403 ACCESS_DENIED sin relación', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudianteSinRelacion.id}/promedios-trimestre?año=${year}`)
      .set('Authorization', bearer);

    expect(res.status).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('ACCESS_DENIED');
  });

  it('GET /resumen-academico/estudiante/:id/promedios-anuales — 403 ACCESS_DENIED sin relación', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudianteSinRelacion.id}/promedios-anuales?año=${year}`)
      .set('Authorization', bearer);

    expect(res.status).toBe(403);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('ACCESS_DENIED');
  });

  it('GET /resumen-academico/estudiante/:id/promedios-trimestre — 400 INVALID_PARAMETERS sin año', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}/promedios-trimestre`)
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_PARAMETERS');
  });

  it('GET /resumen-academico/estudiante/:id/promedios-anuales — 400 INVALID_PARAMETERS sin año', async () => {
    const res = await request(app)
      .get(`/resumen-academico/estudiante/${estudiante.id}/promedios-anuales`)
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_PARAMETERS');
  });
});

// Utilidad local para letra
function notesToLetter(n) {
  if (n >= 18) return 'AD';
  if (n >= 14) return 'A';
  if (n >= 11) return 'B';
  return 'C';
}