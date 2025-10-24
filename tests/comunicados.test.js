import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import app from '../index.js';

const prisma = new PrismaClient();

// Variables globales para tests
let directorToken, docenteToken, padreToken;
let directorId, docenteId, padreId;
let nivelGradoId, cursoId, estudianteId, relacionId;
let permisoDocenteId;
let comunicadoId;

// Datos de prueba
const directorPrueba = {
  nombre: 'Director',
  apellido: 'Prueba',
  email: 'director.prueba@test.com',
  rol: 'director',
  estado_activo: true,
  año_academico: 2025
};

const docentePrueba = {
  nombre: 'Docente',
  apellido: 'Prueba',
  email: 'docente.prueba@test.com',
  rol: 'docente',
  estado_activo: true,
  año_academico: 2025
};

const padrePrueba = {
  nombre: 'Padre',
  apellido: 'Prueba',
  email: 'padre.prueba@test.com',
  rol: 'apoderado',
  estado_activo: true,
  año_academico: 2025
};

const nivelGradoPrueba = {
  nivel: 'Primaria',
  grado: '3ro',
  descripcion: 'Tercer grado de primaria',
  estado_activo: true
};

const cursoPrueba = {
  nombre: 'Matemáticas',
  codigo_curso: 'PM3001',
  estado_activo: true
};

const estudiantePrueba = {
  nombre: 'Estudiante',
  apellido: 'Prueba',
  dni: '12345678',
  estado_matricula: 'activo',
  año_academico: 2025
};

const comunicadoPrueba = {
  titulo: 'Comunicado de prueba para el sistema',
  tipo: 'academico',
  contenido_html: '<p>Este es un comunicado de prueba para verificar el funcionamiento del sistema.</p>',
  publico_objetivo: ['padres'],
  niveles: ['Primaria'],
  grados: ['3ro']
};

// Función auxiliar para autenticar y obtener token
async function login(email, password) {
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password });
  
  return res.body.data.token;
}

// Configuración inicial antes de todos los tests
beforeAll(async () => {
  try {
    // Crear usuarios de prueba
    const director = await prisma.usuario.create({ data: directorPrueba });
    const docente = await prisma.usuario.create({ data: docentePrueba });
    const padre = await prisma.usuario.create({ data: padrePrueba });
    
    directorId = director.id;
    docenteId = docente.id;
    padreId = padre.id;
    
    // Crear nivel y grado
    const nivelGrado = await prisma.nivelGrado.create({ data: nivelGradoPrueba });
    nivelGradoId = nivelGrado.id;
    
    // Crear curso
    const curso = await prisma.curso.create({ 
      data: { 
        ...cursoPrueba, 
        nivel_grado_id: nivelGradoId 
      } 
    });
    cursoId = curso.id;
    
    // Crear estudiante
    const estudiante = await prisma.estudiante.create({ 
      data: { 
        ...estudiantePrueba, 
        nivel_grado_id: nivelGradoId 
      } 
    });
    estudianteId = estudiante.id;
    
    // Crear relación familiar
    const relacion = await prisma.relacionesFamiliares.create({
      data: {
        apoderado_id: padreId,
        estudiante_id: estudianteId,
        estado_activo: true,
        año_academico: 2025
      }
    });
    relacionId = relacion.id;
    
    // Crear asignación docente-curso
    await prisma.asignacionDocenteCurso.create({
      data: {
        docente_id: docenteId,
        curso_id: cursoId,
        nivel_grado_id: nivelGradoId,
        estado_activo: true,
        año_academico: 2025
      }
    });
    
    // Crear permiso para docente
    const permisoDocente = await prisma.permisoDocente.create({
      data: {
        docente_id: docenteId,
        tipo_permiso: 'comunicados',
        estado_activo: true,
        año_academico: 2025,
        fecha_otorgamiento: new Date(),
        otorgado_por: directorId
      }
    });
    permisoDocenteId = permisoDocente.id;
    
    // Autenticar usuarios y obtener tokens
    directorToken = await login(directorPrueba.email, 'password123');
    docenteToken = await login(docentePrueba.email, 'password123');
    padreToken = await login(padrePrueba.email, 'password123');
    
    console.log('✅ Configuración inicial de pruebas completada');
  } catch (error) {
    console.error('❌ Error en configuración inicial:', error);
  }
});

// Limpieza después de todos los tests
afterAll(async () => {
  try {
    // Eliminar en orden correcto para evitar errores de clave foránea
    await prisma.comunicadoLectura.deleteMany({});
    await prisma.comunicado.deleteMany({});
    await prisma.notificacion.deleteMany({});
    
    await prisma.permisoDocente.delete({ where: { id: permisoDocenteId } });
    await prisma.relacionesFamiliares.delete({ where: { id: relacionId } });
    await prisma.estudiante.delete({ where: { id: estudianteId } });
    await prisma.asignacionDocenteCurso.deleteMany({});
    await prisma.curso.delete({ where: { id: cursoId } });
    await prisma.nivelGrado.delete({ where: { id: nivelGradoId } });
    
    await prisma.usuario.deleteMany({
      where: {
        id: { in: [directorId, docenteId, padreId] }
      }
    });
    
    console.log('✅ Limpieza final de pruebas completada');
  } catch (error) {
    console.error('❌ Error en limpieza final:', error);
  } finally {
    await prisma.$disconnect();
  }
});

// Limpieza entre tests
beforeEach(async () => {
  try {
    // Limpiar comunicados y notificaciones entre tests
    await prisma.comunicadoLectura.deleteMany({});
    await prisma.comunicado.deleteMany({});
    await prisma.notificacion.deleteMany({});
  } catch (error) {
    console.error('❌ Error en limpieza entre tests:', error);
  }
});

describe('Módulo de Comunicados - HU-COM-00 (Bandeja de Comunicados)', () => {
  
  it('GET /comunicados - Padre puede ver comunicados de sus hijos', async () => {
    // Crear un comunicado como director
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    comunicadoId = comunicado.id;
    
    const res = await request(app)
      .get('/comunicados')
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicados).toHaveLength(1);
    expect(res.body.data.comunicados[0].id).toBe(comunicadoId);
    expect(res.body.data.usuario.rol).toBe('apoderado');
  });
  
  it('GET /comunicados - Docente puede ver comunicados institucionales y propios', async () => {
    // Crear un comunicado como director
    await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    // Crear un comunicado como docente
    const comunicadoDocente = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: docenteId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .get('/comunicados')
      .set('Authorization', `Bearer ${docenteToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicados).toHaveLength(2);
    expect(res.body.data.usuario.rol).toBe('docente');
    
    // Verificar que puede ver comunicados institucionales y propios
    const comunicados = res.body.data.comunicados;
    const ids = comunicados.map(c => c.id);
    expect(ids).toContain(comunicadoDocente.id);
  });
  
  it('GET /comunicados - Director puede ver todos los comunicados', async () => {
    // Crear varios comunicados
    await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: docenteId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .get('/comunicados')
      .set('Authorization', `Bearer ${directorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicados).toHaveLength(2);
    expect(res.body.data.usuario.rol).toBe('director');
  });
  
  it('GET /comunicados/no-leidos/count - Contar comunicados no leídos', async () => {
    // Crear un comunicado
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .get('/comunicados/no-leidos/count')
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_no_leidos).toBe(1);
  });
  
  it('GET /comunicados/search - Buscar comunicados por término', async () => {
    // Crear un comunicado con término específico
    await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        titulo: 'Comunicado importante sobre matemáticas',
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .get('/comunicados/search?query=matemáticas')
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resultados).toHaveLength(1);
    expect(res.body.data.resultados[0].match_en).toBe('titulo');
  });
  
  it('GET /comunicados/actualizaciones - Verificar actualizaciones (polling)', async () => {
    const ultimoCheck = new Date(Date.now() - 60000).toISOString();
    
    const res = await request(app)
      .get(`/comunicados/actualizaciones?ultimo_check=${ultimoCheck}`)
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hay_actualizaciones).toBeDefined();
  });
});

describe('Módulo de Comunicados - HU-COM-01 (Leer Comunicado Completo)', () => {
  
  it('GET /comunicados/:id - Obtener comunicado completo', async () => {
    // Crear un comunicado
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .get(`/comunicados/${comunicado.id}`)
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicado.id).toBe(comunicado.id);
    expect(res.body.data.comunicado.contenido_html).toBe(comunicado.contenido);
  });
  
  it('POST /comunicados-lecturas - Marcar comunicado como leído', async () => {
    // Crear un comunicado
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .post('/comunicados-lecturas')
      .set('Authorization', `Bearer ${padreToken}`)
      .send({ comunicado_id: comunicado.id });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lectura.comunicado_id).toBe(comunicado.id);
    
    // Verificar que se registró la lectura
    const lectura = await prisma.comunicadoLectura.findUnique({
      where: {
        comunicado_id_usuario_id: {
          comunicado_id: comunicado.id,
          usuario_id: padreId
        }
      }
    });
    
    expect(lectura).toBeTruthy();
    expect(lectura.usuario_id).toBe(padreId);
  });
  
  it('GET /comunicados/:id/acceso - Validar acceso a comunicado', async () => {
    // Crear un comunicado
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .get(`/comunicados/${comunicado.id}/acceso`)
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tiene_acceso).toBe(true);
    expect(res.body.data.puede_ver).toBe(true);
  });
});

describe('Módulo de Comunicados - HU-COM-02 (Crear y Publicar Comunicado)', () => {
  
  it('GET /permisos-docentes/:docente_id - Verificar permisos de docente', async () => {
    const res = await request(app)
      .get(`/permisos-docentes/${docenteId}`)
      .set('Authorization', `Bearer ${directorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.permisos.puede_crear_comunicados).toBe(true);
  });
  
  it('GET /cursos/docente/:docente_id - Obtener cursos asignados a docente', async () => {
    const res = await request(app)
      .get(`/cursos/docente/${docenteId}`)
      .set('Authorization', `Bearer ${docenteToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.docente.id).toBe(docenteId);
    expect(res.body.data.asignaciones).toBeDefined();
  });
  
  it('GET /nivel-grado - Obtener niveles y grados (solo director)', async () => {
    const res = await request(app)
      .get('/nivel-grado')
      .set('Authorization', `Bearer ${directorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.jerarquia).toBeDefined();
  });
  
  it('POST /usuarios/destinatarios/preview - Calcular destinatarios estimados', async () => {
    const segmentacion = {
      publico_objetivo: ['padres'],
      niveles: ['Primaria'],
      grados: ['3ro']
    };
    
    const res = await request(app)
      .post('/usuarios/destinatarios/preview')
      .set('Authorization', `Bearer ${directorToken}`)
      .send(segmentacion);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.destinatarios.total_estimado).toBeGreaterThan(0);
  });
  
  it('POST /comunicados - Crear comunicado (Publicado)', async () => {
    const res = await request(app)
      .post('/comunicados')
      .set('Authorization', `Bearer ${directorToken}`)
      .send(comunicadoPrueba);
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicado.titulo).toBe(comunicadoPrueba.titulo);
    expect(res.body.data.comunicado.estado).toBe('publicado');
    
    // Guardar ID para otros tests
    comunicadoId = res.body.data.comunicado.id;
  });
  
  it('POST /comunicados/borrador - Guardar borrador de comunicado', async () => {
    const borradorData = {
      ...comunicadoPrueba,
      titulo: 'Borrador de comunicado'
    };
    
    const res = await request(app)
      .post('/comunicados/borrador')
      .set('Authorization', `Bearer ${docenteToken}`)
      .send(borradorData);
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicado.estado).toBe('borrador');
  });
  
  it('POST /comunicados/validar-html - Validar HTML', async () => {
    const res = await request(app)
      .post('/comunicados/validar-html')
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ contenido: '<p>HTML válido</p>' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.es_valido).toBe(true);
  });
  
  it('POST /comunicados/validar-segmentacion - Validar segmentación', async () => {
    const segmentacion = {
      publico_objetivo: ['padres'],
      niveles: ['Primaria'],
      grados: ['3ro']
    };
    
    const res = await request(app)
      .post('/comunicados/validar-segmentacion')
      .set('Authorization', `Bearer ${directorToken}`)
      .send(segmentacion);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.es_valida).toBe(true);
  });
});

describe('Módulo de Comunicados - HU-COM-03 (Gestión de Comunicados Propios)', () => {
  
  it('PUT /comunicados/:id - Editar comunicado', async () => {
    // Crear un comunicado primero
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const datosActualizacion = {
      titulo: 'Comunicado actualizado',
      tipo: 'evento',
      contenido_html: '<p>Contenido actualizado</p>',
      publico_objetivo: ['padres'],
      niveles: ['Primaria'],
      grados: ['3ro']
    };
    
    const res = await request(app)
      .put(`/comunicados/${comunicado.id}`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send(datosActualizacion);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicado.titulo).toBe(datosActualizacion.titulo);
    expect(res.body.data.comunicado.editado).toBe(true);
  });
  
  it('GET /comunicados/mis-borradores - Obtener mis borradores', async () => {
    // Crear un borrador primero
    await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: docenteId,
        estado: 'borrador'
      }
    });
    
    const res = await request(app)
      .get('/comunicados/mis-borradores')
      .set('Authorization', `Bearer ${docenteToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.borradores).toHaveLength(1);
  });
  
  it('POST /comunicados/:id/publicar - Publicar borrador', async () => {
    // Crear un borrador primero
    const borrador = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: docenteId,
        estado: 'borrador'
      }
    });
    
    const res = await request(app)
      .post(`/comunicados/${borrador.id}/publicar`)
      .set('Authorization', `Bearer ${docenteToken}`)
      .send({});
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicado.estado).toBe('publicado');
  });
  
  it('GET /comunicados/programados - Obtener comunicados programados', async () => {
    // Crear un comunicado programado
    const fechaProgramada = new Date(Date.now() + 24 * 60 * 60 * 1000); // Mañana
    
    await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'programado',
        fecha_programada
      }
    });
    
    const res = await request(app)
      .get('/comunicados/programados')
      .set('Authorization', `Bearer ${directorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicados_programados).toHaveLength(1);
  });
  
  it('DELETE /comunicados/:id/programacion - Cancelar programación', async () => {
    // Crear un comunicado programado
    const fechaProgramada = new Date(Date.now() + 24 * 60 * 60 * 1000); // Mañana
    
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'programado',
        fecha_programada
      }
    });
    
    const res = await request(app)
      .delete(`/comunicados/${comunicado.id}/programacion`)
      .set('Authorization', `Bearer ${directorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comunicado.estado).toBe('borrador');
  });
});

describe('Módulo de Comunicados - Gestión Administrativa (Solo Director)', () => {
  
  it('PATCH /comunicados/:id/desactivar - Desactivar comunicado', async () => {
    // Crear un comunicado primero
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .patch(`/comunicados/${comunicado.id}/desactivar`)
      .set('Authorization', `Bearer ${directorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estado).toBe('desactivado');
  });
  
  it('DELETE /comunicados/:id - Eliminar comunicado', async () => {
    // Crear un comunicado primero
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .delete(`/comunicados/${comunicado.id}`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ confirmacion: true, motivo: 'Prueba de eliminación' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eliminado).toBe(true);
    
    // Verificar que se eliminó
    const comunicadoEliminado = await prisma.comunicado.findUnique({
      where: { id: comunicado.id }
    });
    
    expect(comunicadoEliminado).toBeNull();
  });
  
  it('DELETE /comunicados/:id - Solo director puede eliminar comunicados', async () => {
    // Crear un comunicado primero
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    // Intentar eliminar como docente (debe fallar)
    const res = await request(app)
      .delete(`/comunicados/${comunicado.id}`)
      .set('Authorization', `Bearer ${docenteToken}`)
      .send({ confirmacion: true, motivo: 'Intento no autorizado' });
    
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('Módulo de Comunicados - Errores y Validaciones', () => {
  
  it('POST /comunicados - Error sin autenticación', async () => {
    const res = await request(app)
      .post('/comunicados')
      .send(comunicadoPrueba);
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
  
  it('POST /comunicados - Error sin permisos', async () => {
    // Crear un usuario sin permisos
    const usuarioSinPermisos = await prisma.usuario.create({
      data: {
        nombre: 'Usuario',
        apellido: 'Sin Permisos',
        email: 'sin.permisos@test.com',
        rol: 'docente',
        estado_activo: true,
        año_academico: 2025
      }
    });
    
    const tokenSinPermisos = await login(usuarioSinPermisos.email, 'password123');
    
    const res = await request(app)
      .post('/comunicados')
      .set('Authorization', `Bearer ${tokenSinPermisos}`)
      .send(comunicadoPrueba);
    
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    
    // Limpiar
    await prisma.usuario.delete({ where: { id: usuarioSinPermisos.id } });
  });
  
  it('POST /comunicados - Error con datos inválidos', async () => {
    const res = await request(app)
      .post('/comunicados')
      .set('Authorization', `Bearer ${directorToken}`)
      .send({
        titulo: 'Corto', // Menos de 10 caracteres
        tipo: 'academico',
        contenido_html: 'Corto', // Menos de 20 caracteres
        publico_objetivo: ['padres']
      });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  
  it('GET /comunicados/:id - Error con comunicado no encontrado', async () => {
    const res = await request(app)
      .get('/comunicados/id-inexistente')
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  
  it('GET /comunicados/:id - Error sin acceso al comunicado', async () => {
    // Crear un comunicado dirigido a otro nivel
    const comunicado = await prisma.comunicado.create({
      data: {
        ...comunicadoPrueba,
        publico_objetivo: ['padres'],
        niveles: ['Secundaria'], // Nivel diferente al del padre
        autor_id: directorId,
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });
    
    const res = await request(app)
      .get(`/comunicados/${comunicado.id}`)
      .set('Authorization', `Bearer ${padreToken}`);
    
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});