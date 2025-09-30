import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import app from '../index.js';

describe('Auth API', () => {
  const base = '/api';
  const validUser = {
    tipo_documento: 'DNI',
    nro_documento: '12345678', // sembrado en prisma/seed.js
    password: 'Password123',
  };

  let bearer = '';

  it('POST /api/auth/login - debe autenticar con credenciales válidas', async () => {
    const res = await request(app).post(`${base}/auth/login`).send(validUser);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.token).toBeDefined();
    expect(res.body?.data?.user?.rol).toBe('apoderado');

    bearer = `Bearer ${res.body.data.token}`;
  });

  it('POST /api/auth/login - debe fallar con credenciales inválidas', async () => {
    const res = await request(app)
      .post(`${base}/auth/login`)
      .send({ ...validUser, password: 'WrongPass123' });

    expect(res.status).toBe(401);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/auth/validate-token - debe validar token emitido', async () => {
    const res = await request(app)
      .get(`${base}/auth/validate-token`)
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.valid).toBe(true);
    expect(res.body?.data?.user?.rol).toBe('apoderado');
  });

  it('POST /api/auth/forgot-password - responde mensaje genérico', async () => {
    const res = await request(app)
      .post(`${base}/auth/forgot-password`)
      .send({ tipo_documento: validUser.tipo_documento, nro_documento: validUser.nro_documento });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.message).toContain('Si el número de documento existe');
  });

  it('POST /api/auth/logout - invalida token (blacklist)', async () => {
    const res = await request(app).post(`${base}/auth/logout`).set('Authorization', bearer);
    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
  });

  it('GET /api/auth/validate-token - debe fallar con token en blacklist', async () => {
    const res = await request(app)
      .get(`${base}/auth/validate-token`)
      .set('Authorization', bearer);

    expect(res.status).toBe(401);
    expect(res.body?.success).toBe(false);
    expect(res.body?.error?.code).toBe('INVALID_TOKEN');
  });
});