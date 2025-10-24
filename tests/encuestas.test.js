import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import app from '../index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Módulo de Encuestas', () => {
  let tokenDirector, tokenDocente, tokenPadre;
  let directorId, docenteId, padreId, estudianteId;
  let encuestaId;
  
  beforeAll(async () => {
    // Generar números de documento únicos para evitar conflictos
    const timestamp = Date.now().toString().slice(-6); // Usar solo los últimos 6 dígitos
    const directorDni = `98765${timestamp}`;
    const docenteDni = `65432${timestamp}`;
    const padreDni = `43210${timestamp}`;
    
    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Director
    const director = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: directorDni,
        password_hash: hashedPassword,
        rol: 'director',
        nombre: 'Director',
        apellido: 'Prueba',
        telefono: '+51 987 654 321',
        estado_activo: true
      }
    });
    directorId = director.id;
    
    // Docente con permisos
    const docente = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: docenteDni,
        password_hash: hashedPassword,
        rol: 'docente',
        nombre: 'Docente',
        apellido: 'Prueba',
        telefono: '+51 987 654 322',
        estado_activo: true
      }
    });
    docenteId = docente.id;
    
    // Dar permisos al docente
    await prisma.permisoDocente.create({
      data: {
        docente_id: docenteId,
        tipo_permiso: 'encuestas',
        estado_activo: true,
        año_academico: 2025
      }
    });
    
    // Padre
    const padre = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: padreDni,
        password_hash: hashedPassword,
        rol: 'apoderado',
        nombre: 'Padre',
        apellido: 'Prueba',
        telefono: '+51 987 654 323',
        estado_activo: true
      }
    });
    padreId = padre.id;
    
    // Crear nivel y grado con grado único
    const nivelGrado = await prisma.nivelGrado.create({
      data: {
        nivel: 'Primaria',
        grado: `2${timestamp}`, // Usar grado único con timestamp
        descripcion: '2do de Primaria',
        estado_activo: true
      }
    });
    
    // Crear estudiante
    const estudiante = await prisma.estudiante.create({
      data: {
        codigo_estudiante: `P25${timestamp}`,
        nombre: 'Estudiante',
        apellido: 'Prueba',
        nivel_grado_id: nivelGrado.id,
        año_academico: 2025,
        estado_matricula: 'activo'
      }
    });
    estudianteId = estudiante.id;
    
    // Relacionar padre con estudiante
    await prisma.relacionesFamiliares.create({
      data: {
        apoderado_id: padreId,
        estudiante_id: estudianteId,
        tipo_relacion: 'padre',
        estado_activo: true,
        año_academico: 2025
      }
    });
    
    // Iniciar sesión y obtener tokens
    const loginDirector = await request(app)
      .post('/auth/login')
      .send({
        tipo_documento: 'DNI',
        nro_documento: directorDni,
        password: 'password123'
      });
    
    // Verificar la respuesta del login
    console.log('Respuesta login director:', JSON.stringify(loginDirector.body, null, 2));
    
    if (loginDirector.body && loginDirector.body.data && loginDirector.body.data.token) {
      tokenDirector = loginDirector.body.data.token;
    } else {
      throw new Error('No se pudo obtener el token del director');
    }
    
    const loginDocente = await request(app)
      .post('/auth/login')
      .send({
        tipo_documento: 'DNI',
        nro_documento: docenteDni,
        password: 'password123'
      });
    
    // Verificar la respuesta del login
    console.log('Respuesta login docente:', JSON.stringify(loginDocente.body, null, 2));
    
    if (loginDocente.body && loginDocente.body.data && loginDocente.body.data.token) {
      tokenDocente = loginDocente.body.data.token;
    } else {
      throw new Error('No se pudo obtener el token del docente');
    }
    
    const loginPadre = await request(app)
      .post('/auth/login')
      .send({
        tipo_documento: 'DNI',
        nro_documento: padreDni,
        password: 'password123'
      });
    
    // Verificar la respuesta del login
    console.log('Respuesta login padre:', JSON.stringify(loginPadre.body, null, 2));
    
    if (loginPadre.body && loginPadre.body.data && loginPadre.body.data.token) {
      tokenPadre = loginPadre.body.data.token;
    } else {
      throw new Error('No se pudo obtener el token del padre');
    }
  });
  
  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      // Eliminar respuestas de encuestas si la tabla existe
      if (prisma.respuestaEncuesta) {
        await prisma.respuestaEncuesta.deleteMany({
          where: {
            usuario_id: {
              in: [directorId, docenteId, padreId]
            }
          }
        });
      }
      
      // Eliminar encuestas
      await prisma.encuesta.deleteMany({
        where: {
          autor_id: {
            in: [directorId, docenteId]
          }
        }
      });
      
      // Eliminar relaciones familiares
      await prisma.relacionesFamiliares.deleteMany({
        where: {
          apoderado_id: padreId
        }
      });
      
      // Eliminar estudiantes
      await prisma.estudiante.deleteMany({
        where: {
          id: estudianteId
        }
      });
      
      // Eliminar permisos de docente
      await prisma.permisoDocente.deleteMany({
        where: {
          docente_id: docenteId
        }
      });
      
      // Eliminar usuarios
      await prisma.usuario.deleteMany({
        where: {
          id: {
            in: [directorId, docenteId, padreId]
          }
        }
      });
      
      // Eliminar nivel y grado
      await prisma.nivelGrado.deleteMany({
        where: {
          nivel: 'Primaria',
          grado: { contains: '2' }
        }
      });
    } catch (error) {
      console.error('Error al limpiar datos de prueba:', error);
    } finally {
      await prisma.$disconnect();
    }
  });
  
  describe('GET /encuestas', () => {
    it('Director debería obtener lista de encuestas', async () => {
      const response = await request(app)
        .get('/encuestas')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('encuestas');
      expect(response.body.data).toHaveProperty('paginacion');
      expect(response.body.data).toHaveProperty('contadores');
    });
    
    it('Docente debería obtener lista de encuestas', async () => {
      const response = await request(app)
        .get('/encuestas')
        .set('Authorization', `Bearer ${tokenDocente}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('encuestas');
    });
    
    it('Padre debería obtener lista de encuestas', async () => {
      const response = await request(app)
        .get('/encuestas')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('encuestas');
    });
    
    it('Debería filtrar por estado', async () => {
      const response = await request(app)
        .get('/encuestas?estado=activas')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
    
    it('Debería filtrar por tipo', async () => {
      const response = await request(app)
        .get('/encuestas?tipo=propias')
        .set('Authorization', `Bearer ${tokenDocente}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
    
    it('Debería buscar encuestas', async () => {
      const response = await request(app)
        .get('/encuestas/search?query=prueba')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resultados');
    });
    
    it('Debería requerir autenticación', async () => {
      await request(app)
        .get('/encuestas')
        .expect(401);
    });
  });
  
  describe('GET /encuestas/pendientes/count', () => {
    it('Debería obtener contador de encuestas pendientes', async () => {
      const response = await request(app)
        .get('/encuestas/pendientes/count')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_pendientes');
      expect(response.body.data).toHaveProperty('por_tipo');
      expect(response.body.data).toHaveProperty('proximas_a_vencer');
    });
  });
  
  describe('POST /encuestas', () => {
    const encuestaData = {
      titulo: 'Encuesta de Prueba',
      descripcion: 'Esta es una encuesta de prueba para el sistema',
      año_academico: 2025,
      fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      preguntas: [
        {
          texto: '¿Qué te parece el sistema?',
          tipo: 'opcion_unica',
          obligatoria: true,
          orden: 1,
          opciones: [
            { texto: 'Excelente', orden: 1 },
            { texto: 'Bueno', orden: 2 },
            { texto: 'Regular', orden: 3 },
            { texto: 'Malo', orden: 4 }
          ]
        },
        {
          texto: '¿Qué mejorarías del sistema?',
          tipo: 'texto_largo',
          obligatoria: false,
          orden: 2
        }
      ]
    };
    
    it('Director debería poder crear una encuesta', async () => {
      const response = await request(app)
        .post('/encuestas')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send(encuestaData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('encuesta');
      expect(response.body.data.encuesta.titulo).toBe(encuestaData.titulo);
      
      encuestaId = response.body.data.encuesta.id;
    });
    
    it('Docente con permisos debería poder crear una encuesta', async () => {
      const response = await request(app)
        .post('/encuestas')
        .set('Authorization', `Bearer ${tokenDocente}`)
        .send({
          ...encuestaData,
          titulo: 'Encuesta de Docente'
        })
        .expect(201);
      
      expect(response.body.success).toBe(true);
    });
    
    it('Padre no debería poder crear una encuesta', async () => {
      const response = await request(app)
        .post('/encuestas')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .send(encuestaData)
        .expect(403);
      
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
    
    it('Debería validar datos obligatorios', async () => {
      const response = await request(app)
        .post('/encuestas')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({})
        .expect(400);
      
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });
  
  describe('GET /encuestas/:id/validar-acceso', () => {
    it('Debería validar acceso a encuesta existente', async () => {
      const response = await request(app)
        .get(`/encuestas/${encuestaId}/validar-acceso`)
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tiene_acceso');
      expect(response.body.data).toHaveProperty('puede_responder');
    });
    
    it('Debería retornar error para encuesta inexistente', async () => {
      const response = await request(app)
        .get('/encuestas/id-inexistente/validar-acceso')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(400);
      
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
  
  describe('GET /encuestas/:id/formulario', () => {
    it('Debería obtener formulario de encuesta', async () => {
      const response = await request(app)
        .get(`/encuestas/${encuestaId}/formulario`)
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('encuesta');
      expect(response.body.data).toHaveProperty('preguntas');
      expect(response.body.data.preguntas.length).toBeGreaterThan(0);
    });
  });
  
  describe('POST /respuestas-encuestas', () => {
    it('Debería registrar respuestas de encuesta', async () => {
      // Primero obtener el formulario para obtener los IDs de las preguntas
      const formularioResponse = await request(app)
        .get(`/encuestas/${encuestaId}/formulario`)
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(200);
      
      const preguntas = formularioResponse.body.data.preguntas;
      
      // Construir datos de respuesta con IDs reales
      const datosRespuesta = {
        encuesta_id: encuestaId,
        estudiante_id: estudianteId,
        respuestas: [
          {
            pregunta_id: preguntas[0].id,
            valor_opcion_id: preguntas[0].opciones[0].id
          },
          {
            pregunta_id: preguntas[1].id,
            valor_texto: 'Esta es una respuesta de prueba'
          }
        ],
        tiempo_respuesta_minutos: 3
      };
      
      const response = await request(app)
        .post('/encuestas/respuestas')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .send(datosRespuesta)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('respuesta');
    });
    
    it('No debería permitir responder dos veces la misma encuesta', async () => {
      // Crear una nueva encuesta específica para esta prueba
      const nuevaEncuesta = await request(app)
        .post('/encuestas')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({
          titulo: 'Encuesta para Test de Doble Respuesta',
          descripcion: 'Encuesta de prueba para verificar doble respuesta',
          año_academico: 2025,
          fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          preguntas: [
            {
              texto: '¿Te gusta el sistema?',
              tipo: 'opcion_unica',
              obligatoria: true,
              orden: 1,
              opciones: [
                { texto: 'Sí', orden: 1 },
                { texto: 'No', orden: 2 }
              ]
            }
          ]
        })
        .expect(201);
      
      const nuevaEncuestaId = nuevaEncuesta.body.data.encuesta.id;
      
      // Fase 1: Obtener el formulario para obtener los IDs de las preguntas
      const formularioResponse = await request(app)
        .get(`/encuestas/${nuevaEncuestaId}/formulario`)
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(200);
      
      const preguntas = formularioResponse.body.data.preguntas;
      
      // Construir datos de respuesta con IDs reales
      const datosRespuesta = {
        encuesta_id: nuevaEncuestaId,
        estudiante_id: estudianteId,
        respuestas: [
          {
            pregunta_id: preguntas[0].id,
            valor_opcion_id: preguntas[0].opciones[0].id
          }
        ],
        tiempo_respuesta_minutos: 2
      };
      
      // Fase 2: Enviar respuesta por primera vez
      await request(app)
        .post('/encuestas/respuestas')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .send(datosRespuesta)
        .expect(201);
      
      // Esperar un momento para asegurar que la primera respuesta se guarde completamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fase 3: Verificar que el formulario ya no sea accesible
      await request(app)
        .get(`/encuestas/${nuevaEncuestaId}/formulario`)
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(400);
      
      // Fase 4: Intentar enviar respuesta por segunda vez
      const response = await request(app)
        .post('/encuestas/respuestas')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .send(datosRespuesta);
      
      // Verificar que la respuesta sea un conflicto
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });
  
  describe('GET /encuestas/:id/mis-respuestas', () => {
    it('Debería obtener respuestas propias', async () => {
      const response = await request(app)
        .get(`/encuestas/${encuestaId}/mis-respuestas`)
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('respuesta');
      expect(response.body.data).toHaveProperty('respuestas_detalle');
    });
    
    it('Debería retornar error si no ha respondido la encuesta', async () => {
      // Crear una nueva encuesta para este test
      const nuevaEncuesta = await request(app)
        .post('/encuestas')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({
          titulo: 'Encuesta para Test',
          descripcion: 'Encuesta de prueba para verificar respuestas',
          año_academico: 2025,
          fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          preguntas: [
            {
              texto: '¿Te gusta el sistema?',
              tipo: 'opcion_unica',
              obligatoria: true,
              orden: 1,
              opciones: [
                { texto: 'Sí', orden: 1 },
                { texto: 'No', orden: 2 }
              ]
            }
          ]
        })
        .expect(201);
      
      const nuevaEncuestaId = nuevaEncuesta.body.data.encuesta.id;
      
      // Intentar obtener respuestas sin haber respondido
      const response = await request(app)
        .get(`/encuestas/${nuevaEncuestaId}/mis-respuestas`)
        .set('Authorization', `Bearer ${tokenPadre}`)
        .expect(400);
      
      expect(response.body.error.code).toBe('RESPONSE_NOT_FOUND');
    });
  });
});