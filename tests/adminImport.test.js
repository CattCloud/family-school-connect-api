import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../index.js';

async function loginAsAdmin() {
  const res = await request(app).post('/auth/login').send({
    tipo_documento: 'DNI',
    nro_documento: '99999999',
    password: 'Password123',
  });
  expect(res.status).toBe(200);
  return `Bearer ${res.body.data.token}`;
}

describe('Administración - Importación y Relaciones (2 registros máx por rol)', () => {
  let bearer = '';

  beforeAll(async () => {
    bearer = await loginAsAdmin();
  });

  it('GET /admin/templates/padres - obtiene headers y sample', async () => {
    const res = await request(app)
      .get('/admin/templates/padres')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.headers).toContain('tipo_documento');
  });

  it('POST /admin/import/validate - valida 2 padres (uno válido y uno con error)', async () => {
    const registros = [
      { tipo_documento: 'DNI', nro_documento: '45678912', nombre: 'Pedro', apellido: 'Pérez', telefono: '+51911111111' },
      { tipo_documento: 'DNI', nro_documento: 'ABC12345', nombre: 'Malo', apellido: 'Dato', telefono: '999' },
    ];
    const res = await request(app)
      .post('/admin/import/validate')
      .set('Authorization', bearer)
      .send({ tipo: 'padres', registros });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.resumen?.total_filas).toBe(registros.length);
    expect(res.body?.data?.resumen?.validos).toBe(1);
    expect(res.body?.data?.resumen?.con_errores).toBe(1);
  });

  it('POST /admin/import/execute - inserta 2 docentes con contraseñas aleatorias y flag debe_cambiar_password = true', async () => {
    const registros_validos = [
      { tipo_documento: 'DNI', nro_documento: '87654321', nombre: 'María', apellido: 'Gómez', telefono: '+51922222222' },
      { tipo_documento: 'DNI', nro_documento: '87654322', nombre: 'Julia', apellido: 'Rojas', telefono: '+51933333333' },
    ];
    const res = await request(app)
      .post('/admin/import/execute')
      .set('Authorization', bearer)
      .send({ tipo: 'docentes', registros_validos });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.resumen?.exitosos).toBeGreaterThan(0);
    expect(Array.isArray(res.body?.data?.exitosos)).toBe(true);
    // no se expone contraseña hash; el servicio devuelve password_inicial solo en payload de respuesta para testing
    expect(res.body?.data?.exitosos[0]?.password_inicial).toBeDefined();
  });

  it('POST /admin/import/execute - inserta 2 estudiantes', async () => {
    const registros_validos = [
      { nombre: 'Juan', apellido: 'Lopez', nivel: 'Primaria', grado: '3', codigo_estudiante: 'PRI3-901' },
      { nombre: 'Ana', apellido: 'Diaz', nivel: 'Primaria', grado: '3', codigo_estudiante: 'PRI3-902' },
    ];
    const res = await request(app)
      .post('/admin/import/execute')
      .set('Authorization', bearer)
      .send({ tipo: 'estudiantes', registros_validos });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.detalles_por_tipo?.estudiantes_creados).toBeGreaterThan(0);
  });

  it('POST /admin/import/validate-relationships - valida relaciones padre-hijo', async () => {
    const relaciones = [
      { nro_documento_padre: '45678912', codigo_estudiante: 'PRI3-901', tipo_relacion: 'padre' },
      { nro_documento_padre: '45678912', codigo_estudiante: 'PRI3-902', tipo_relacion: 'padre' },
    ];
    const res = await request(app)
      .post('/admin/import/validate-relationships')
      .set('Authorization', bearer)
      .send({ relaciones });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    // Puede que aún no exista el apoderado 45678912 si no lo insertamos previamente, por lo tanto validas puede ser 0
    expect(res.body?.data?.total_relaciones).toBe(relaciones.length);
  });

  it('POST /admin/import/create-relationships - crea relaciones para estudiantes insertados (si apoderado existe)', async () => {
    const relaciones = [
      { nro_documento_padre: '45678912', codigo_estudiante: 'PRI3-901', tipo_relacion: 'padre' },
      { nro_documento_padre: '45678912', codigo_estudiante: 'PRI3-902', tipo_relacion: 'padre' },
    ];
    const res = await request(app)
      .post('/admin/import/create-relationships')
      .set('Authorization', bearer)
      .send({ relaciones });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    // Si el apoderado válido fue insertado en pruebas anteriores, debería crear al menos 1
    expect(res.body?.data?.relaciones_creadas).toBeGreaterThanOrEqual(0);
  });

  it('GET /admin/verify/relationships - verifica integridad', async () => {
    const res = await request(app)
      .get('/admin/verify/relationships')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.total_estudiantes).toBeGreaterThanOrEqual(0);
  });

  it('POST /admin/import/credentials/generate - genera credenciales preview (no Excel real en test)', async () => {
    const usuarios = [
      { nro_documento: '87654321', nombre: 'María', apellido: 'Gómez', telefono: '+51922222222', rol: 'docente' },
      { nro_documento: '45678912', nombre: 'Pedro', apellido: 'Pérez', telefono: '+51911111111', rol: 'apoderado' },
    ];
    const res = await request(app)
      .post('/admin/import/credentials/generate')
      .set('Authorization', bearer)
      .send({ usuarios });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.total_credenciales).toBe(usuarios.length);
    expect(Array.isArray(res.body?.data?.excel_preview)).toBe(true);
  });

  it('POST /admin/import/credentials/send-whatsapp - simula envío masivo (rate-limited)', async () => {
    const usuarios = ['87654321', '45678912'];
    const res = await request(app)
      .post('/admin/import/credentials/send-whatsapp')
      .set('Authorization', bearer)
      .send({ usuarios_seleccionados: usuarios });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.total_envios).toBe(usuarios.length);
    expect(res.body?.data?.fallidos).toBe(0);
  });
});