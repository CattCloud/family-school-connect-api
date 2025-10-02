import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';

import app from '../index.js';

async function loginAsDirector() {
  const res = await request(app).post('/auth/login').send({
    tipo_documento: 'DNI',
    nro_documento: '88888888',
    password: 'Password123',
  });
  expect(res.status).toBe(200);
  expect(res.body?.data?.token).toBeDefined();
  return `Bearer ${res.body.data.token}`;
}

describe('Gestión de permisos de docentes', () => {
  let bearer = '';
  let docenteId = '';

  beforeAll(async () => {
    bearer = await loginAsDirector();
  });

  it('GET /teachers/permissions - lista docentes activos con permisos', async () => {
    const res = await request(app)
      .get('/teachers/permissions')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const docentes = res.body?.data?.docentes || [];
    expect(Array.isArray(docentes)).toBe(true);

    // Buscar el docente sembrado "Luis Docente"
    const found = docentes.find(
      (d) => d.nombre === 'Luis' && d.apellido === 'Docente'
    );
    expect(found).toBeDefined();
    docenteId = found.id;
  });

  it('PATCH /teachers/:id/permissions - activar permiso comunicados', async () => {
    const res = await request(app)
      .patch(`/teachers/${docenteId}/permissions`)
      .set('Authorization', bearer)
      .send({ tipo_permiso: 'comunicados', estado_activo: true });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.permiso?.docente_id).toBe(docenteId);
    expect(res.body?.data?.permiso?.tipo_permiso).toBe('comunicados');
    expect(res.body?.data?.permiso?.estado_activo).toBe(true);
  });

  it('GET /teachers/:id/permissions/history - historial del docente', async () => {
    const res = await request(app)
      .get(`/teachers/${docenteId}/permissions/history`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    const historial = res.body?.data?.historial || [];
    expect(Array.isArray(historial)).toBe(true);
    // Debe haber al menos 1 cambio por el test previo
    expect(historial.length).toBeGreaterThan(0);
  });
});