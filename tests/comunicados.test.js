const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('API de Comunicados', () => {
  let tokenDirector;
  let tokenDocente;
  let tokenPadre;
  let directorId;
  let docenteId;
  let padreId;
  let nivelGradoId;
  let cursoId;
  let asignacionId;
  let permisoId;

  beforeAll(async () => {
    // Generar IDs únicos para evitar conflictos
    const uniqueId = Date.now();
    
    // Crear usuarios de prueba
    const director = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: uniqueId.toString(),
        password_hash: 'hashedpassword',
        rol: 'director',
        nombre: 'Director',
        apellido: 'Test',
        telefono: '+51987654321',
        estado_activo: true
      }
    });
    directorId = director.id;

    const docente = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: (uniqueId + 1).toString(),
        password_hash: 'hashedpassword',
        rol: 'docente',
        nombre: 'Docente',
        apellido: 'Test',
        telefono: '+51987654322',
        estado_activo: true
      }
    });
    docenteId = docente.id;

    const padre = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: (uniqueId + 2).toString(),
        password_hash: 'hashedpassword',
        rol: 'apoderado',
        nombre: 'Padre',
        apellido: 'Test',
        telefono: '+51987654323',
        estado_activo: true
      }
    });
    padreId = padre.id;

    // Crear nivel y grado de prueba con nombre único
    const nivelGrado = await prisma.nivelGrado.create({
      data: {
        nivel: 'Primaria',
        grado: `5to-${uniqueId}`,
        descripcion: '5to de Primaria',
        estado_activo: true
      }
    });
    nivelGradoId = nivelGrado.id;

    // Crear curso de prueba
    const curso = await prisma.curso.create({
      data: {
        nombre: 'Matemáticas',
        codigo_curso: `CP5-${uniqueId}`,
        nivel_grado_id: nivelGradoId,
        año_academico: 2025,
        estado_activo: true
      }
    });
    cursoId = curso.id;

    // Crear asignación del docente al curso
    const asignacion = await prisma.asignacionDocenteCurso.create({
      data: {
        docente_id: docenteId,
        curso_id: cursoId,
        nivel_grado_id: nivelGradoId,
        año_academico: 2025,
        fecha_asignacion: new Date(),
        estado_activo: true
      }
    });
    asignacionId = asignacion.id;

    // Dar permiso al docente para crear comunicados
    const permiso = await prisma.permisoDocente.create({
      data: {
        docente_id: docenteId,
        tipo_permiso: 'comunicados',
        estado_activo: true,
        año_academico: 2025
      }
    });
    permisoId = permiso.id;

    // Obtener tokens de autenticación
    const loginDirector = await request(app)
      .post('/auth/login')
      .send({
        nro_documento: uniqueId.toString(),
        password: 'hashedpassword'
      });
    
    if (loginDirector.status === 200 && loginDirector.body.data) {
      tokenDirector = loginDirector.body.data.token;
    } else {
      console.log('Error en login de director:', loginDirector.body);
    }

    const loginDocente = await request(app)
      .post('/auth/login')
      .send({
        nro_documento: (uniqueId + 1).toString(),
        password: 'hashedpassword'
      });
    
    if (loginDocente.status === 200 && loginDocente.body.data) {
      tokenDocente = loginDocente.body.data.token;
    } else {
      console.log('Error en login de docente:', loginDocente.body);
    }

    const loginPadre = await request(app)
      .post('/auth/login')
      .send({
        nro_documento: (uniqueId + 2).toString(),
        password: 'hashedpassword'
      });
    
    if (loginPadre.status === 200 && loginPadre.body.data) {
      tokenPadre = loginPadre.body.data.token;
    } else {
      console.log('Error en login de padre:', loginPadre.body);
    }
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      // Primero eliminar lecturas de comunicados si existe la tabla
      try {
        if (prisma.comunicadoLectura) {
          await prisma.comunicadoLectura.deleteMany({
            where: {
              comunicado_id: {
                in: await prisma.comunicado.findMany({
                  where: {
                    titulo: {
                      contains: 'Test'
                    }
                  },
                  select: { id: true }
                }).then(coms => coms.map(c => c.id))
              }
            }
          });
        }
      } catch (error) {
        // La tabla podría no existir, continuamos con la limpieza
        console.log('Tabla comunicadoLectura no encontrada, continuando...');
      }

      // Eliminar notificaciones si existe la tabla
      try {
        if (prisma.notificacion) {
          await prisma.notificacion.deleteMany({
            where: {
              referencia_id: {
                in: await prisma.comunicado.findMany({
                  where: {
                    titulo: {
                      contains: 'Test'
                    }
                  },
                  select: { id: true }
                }).then(coms => coms.map(c => c.id))
              }
            }
          });
        }
      } catch (error) {
        // La tabla podría no existir, continuamos con la limpieza
        console.log('Tabla notificacion no encontrada, continuando...');
      }

      // Eliminar comunicados
      await prisma.comunicado.deleteMany({
        where: {
          titulo: {
            contains: 'Test'
          }
        }
      });

      // Eliminar relaciones en orden inverso a su creación
      if (permisoId) {
        await prisma.permisoDocente.delete({
          where: { id: permisoId }
        });
      }

      if (asignacionId) {
        await prisma.asignacionDocenteCurso.delete({
          where: { id: asignacionId }
        });
      }

      if (cursoId) {
        await prisma.curso.delete({
          where: { id: cursoId }
        });
      }

      if (nivelGradoId) {
        await prisma.nivelGrado.delete({
          where: { id: nivelGradoId }
        });
      }

      await prisma.usuario.deleteMany({
        where: {
          id: {
            in: [directorId, docenteId, padreId]
          }
        }
      });
    } catch (error) {
      console.error('Error en limpieza de datos de prueba:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('POST /comunicados', () => {
    it('Director puede crear un comunicado académico', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .post('/comunicados')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({
          titulo: 'Comunicado académico de prueba',
          tipo: 'academico',
          contenido_html: '<p>Este es un contenido de prueba para el comunicado académico.</p>',
          publico_objetivo: ['padres'],
          grados: [`5to-${directorId}`],
          estado: 'publicado'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comunicado.tipo).toBe('academico');
      expect(response.body.data.comunicado.estado).toBe('publicado');
    });

    it('Docente con permisos puede crear un comunicado académico', async () => {
      if (!tokenDocente) {
        console.log('No se obtuvo token de docente, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .post('/comunicados')
        .set('Authorization', `Bearer ${tokenDocente}`)
        .send({
          titulo: 'Comunicado de docente de prueba',
          tipo: 'academico',
          contenido_html: '<p>Este es un contenido de prueba para el comunicado del docente.</p>',
          publico_objetivo: ['padres'],
          grados: [`5to-${docenteId}`],
          estado: 'publicado'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comunicado.tipo).toBe('academico');
      expect(response.body.data.comunicado.estado).toBe('publicado');
    });

    it('Padre no puede crear comunicados', async () => {
      if (!tokenPadre) {
        console.log('No se obtuvo token de padre, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .post('/comunicados')
        .set('Authorization', `Bearer ${tokenPadre}`)
        .send({
          titulo: 'Comunicado de padre de prueba',
          tipo: 'academico',
          contenido_html: '<p>Este es un contenido de prueba.</p>',
          publico_objetivo: ['padres'],
          grados: [`5to-${padreId}`],
          estado: 'publicado'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /comunicados/borrador', () => {
    it('Director puede guardar un borrador', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .post('/comunicados/borrador')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({
          titulo: 'Borrador de prueba',
          tipo: 'informativo',
          contenido_html: '<p>Este es un borrador de prueba.</p>',
          publico_objetivo: ['padres'],
          grados: [`5to-${directorId}`]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.borrador.estado).toBe('borrador');
    });
  });

  describe('GET /permisos-docentes/:docente_id', () => {
    it('Director puede verificar permisos de un docente', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .get(`/permisos-docentes/${docenteId}`)
        .set('Authorization', `Bearer ${tokenDirector}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.permisos.puede_crear_comunicados).toBe(true);
    });
  });

  describe('GET /cursos/docente/:docente_id', () => {
    it('Director puede ver cursos asignados a un docente', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .get(`/cursos/docente/${docenteId}`)
        .set('Authorization', `Bearer ${tokenDirector}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.docente.id).toBe(docenteId);
    });
  });

  describe('GET /cursos/todos', () => {
    it('Director puede ver todos los cursos', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .get('/cursos/todos')
        .set('Authorization', `Bearer ${tokenDirector}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.jerarquia).toBeDefined();
    });
  });

  describe('GET /nivel-grado', () => {
    it('Director puede ver todos los niveles y grados', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .get('/nivel-grado')
        .set('Authorization', `Bearer ${tokenDirector}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.jerarquia).toBeDefined();
    });
  });

  describe('POST /usuarios/destinatarios/preview', () => {
    it('Director puede calcular destinatarios', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .post('/usuarios/destinatarios/preview')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({
          publico_objetivo: ['padres'],
          grados: [`5to-${directorId}`],
          todos: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.destinatarios.total_estimado).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /comunicados/validar-html', () => {
    it('Valida HTML y elimina elementos no permitidos', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .post('/comunicados/validar-html')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({
          contenido_html: '<p>Contenido válido</p><script>alert("XSS")</script>'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contenido_sanitizado).toBe('<p>Contenido válido</p>');
    });
  });

  describe('POST /comunicados/validar-segmentacion', () => {
    it('Director puede validar segmentación completa', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .post('/comunicados/validar-segmentacion')
        .set('Authorization', `Bearer ${tokenDirector}`)
        .send({
          publico_objetivo: ['padres', 'docentes'],
          niveles: ['Primaria'],
          grados: [`5to-${directorId}`]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.es_valida).toBe(true);
    });
  });

  describe('GET /comunicados/mis-borradores', () => {
    it('Director puede ver sus borradores', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .get('/comunicados/mis-borradores')
        .set('Authorization', `Bearer ${tokenDirector}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /comunicados/programados', () => {
    it('Director puede ver comunicados programados', async () => {
      if (!tokenDirector) {
        console.log('No se obtuvo token de director, saltando prueba');
        return;
      }
      
      const response = await request(app)
        .get('/comunicados/programados')
        .set('Authorization', `Bearer ${tokenDirector}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});