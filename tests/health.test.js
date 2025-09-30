import request from 'supertest';
import { describe, it, expect } from 'vitest';

import app from '../index.js';

describe('GET /api/health', () => {
  it('debe responder 200 y {"status":"ok"}', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});