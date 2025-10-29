import { describe, it, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

describe('Módulo de Soporte Técnico', () => {
  let tokenUsuario;
  let tokenAdmin;
  let usuarioId;
  let adminId;
  let ticketId;

  beforeAll(async () => {
    // Generar números de documento únicos para evitar conflictos
    const timestamp = Date.now().toString().slice(-6);
    const usuarioDni = `88888${timestamp}`;
    const adminDni = `11111${timestamp}`;
    
    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Usuario apoderado
    const usuario = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: usuarioDni,
        password_hash: hashedPassword,
        rol: 'apoderado',
        nombre: 'Usuario',
        apellido: 'Prueba',
        telefono: '+51 987 654 321',
        estado_activo: true
      }
    });
    usuarioId = usuario.id;
    
    // Administrador
    const admin = await prisma.usuario.create({
      data: {
        tipo_documento: 'DNI',
        nro_documento: adminDni,
        password_hash: hashedPassword,
        rol: 'administrador',
        nombre: 'Admin',
        apellido: 'Prueba',
        telefono: '+51 987 654 322',
        estado_activo: true
      }
    });
    adminId = admin.id;
    
    // Iniciar sesión y obtener tokens
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        tipo_documento: 'DNI',
        nro_documento: usuarioDni,
        password: 'password123'
      });

    if (loginResponse.body?.data?.token) {
      tokenUsuario = loginResponse.body.data.token;
    }

    const adminLoginResponse = await request(app)
      .post('/auth/login')
      .send({
        tipo_documento: 'DNI',
        nro_documento: adminDni,
        password: 'password123'
      });

    if (adminLoginResponse.body?.data?.token) {
      tokenAdmin = adminLoginResponse.body.data.token;
    }
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      // Eliminar en orden correcto para evitar conflictos de clave foránea
      // Primero eliminar notificaciones (que referencian a usuarios)
      if (prisma.notificacion) {
        await prisma.notificacion.deleteMany({});
      }
      
      if (prisma.respuestaTicket) {
        await prisma.respuestaTicket.deleteMany({});
      }
      if (prisma.ticketSoporte) {
        await prisma.ticketSoporte.deleteMany({});
      }
      if (prisma.fAQ) {
        await prisma.fAQ.deleteMany({});
      }
      if (prisma.categoriaFAQ) {
        await prisma.categoriaFAQ.deleteMany({});
      }
      
      // Eliminar todos los usuarios creados durante los tests
      if (prisma.usuario) {
        await prisma.usuario.deleteMany({
          where: {
            OR: [
              { id: { in: [usuarioId, adminId] } },
              { nro_documento: { contains: Date.now().toString().slice(-6) } }
            ]
          }
        });
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error en cleanup:', error);
    }
  });

  describe('HU-SOP-01: Crear Ticket', () => {
    test('Debería crear un ticket exitosamente', async () => {
      const ticketData = {
        titulo: 'Problema con el acceso a la plataforma',
        descripcion: 'No puedo ingresar a mi cuenta desde hace dos días. He intentado restablecer la contraseña pero no funciona.',
        categoria: 'acceso_plataforma',
        prioridad: 'normal'
      };

      const response = await request(app)
        .post('/soporte/tickets')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(ticketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket).toBeDefined();
      expect(response.body.data.ticket.numero_ticket).toMatch(/^#SOP-\d{4}-\d{4}$/);
      expect(response.body.data.ticket.estado).toBe('pendiente');
      
      ticketId = response.body.data.ticket.id;
    });

    test('Debería rechazar ticket con datos incompletos', async () => {
      const invalidTicketData = {
        titulo: 'Título corto',
        descripcion: 'Descripción',
        categoria: 'acceso_plataforma'
      };

      const response = await request(app)
        .post('/soporte/tickets')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(invalidTicketData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('Debería rechazar creación sin autenticación', async () => {
      const ticketData = {
        titulo: 'Título válido para prueba',
        descripcion: 'Esta es una descripción válida con más de 20 caracteres para cumplir con los requisitos.',
        categoria: 'acceso_plataforma'
      };

      await request(app)
        .post('/soporte/tickets')
        .send(ticketData)
        .expect(401);
    });
  });

  describe('HU-SOP-02: Ver Historial de Tickets', () => {
    test('Debería obtener historial de tickets del usuario', async () => {
      const response = await request(app)
        .get('/soporte/tickets/usuario')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tickets).toBeDefined();
      expect(response.body.data.paginacion).toBeDefined();
      expect(Array.isArray(response.body.data.tickets)).toBe(true);
    });

    test('Debería filtrar tickets por estado', async () => {
      const response = await request(app)
        .get('/soporte/tickets/usuario?estado=pendiente')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tickets.every(ticket => ticket.estado === 'pendiente')).toBe(true);
    });
  });

  describe('HU-SOP-03: Ver Detalle de Ticket', () => {
    test('Debería obtener detalle de ticket propio', async () => {
      const response = await request(app)
        .get(`/soporte/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket).toBeDefined();
      expect(response.body.data.ticket.id).toBe(ticketId);
      expect(response.body.data.ticket.usuario.id).toBe(usuarioId);
    });

    test('Debería rechazar acceso a ticket de otro usuario', async () => {
      // Crear otro usuario para la prueba
      const timestamp = Date.now().toString().slice(-6);
      const otroDni = `77777${timestamp}`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const otroUsuario = await prisma.usuario.create({
        data: {
          tipo_documento: 'DNI',
          nro_documento: otroDni,
          password_hash: hashedPassword,
          rol: 'apoderado',
          nombre: 'Otro',
          apellido: 'Usuario',
          telefono: '+51 987 654 323',
          estado_activo: true
        }
      });

      const otroLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          tipo_documento: 'DNI',
          nro_documento: otroDni,
          password: 'password123'
        });

      const otroToken = otroLoginResponse.body?.data?.token;

      await request(app)
        .get(`/soporte/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${otroToken}`)
        .expect(404);

      // Limpiar
      await prisma.usuario.delete({
        where: { id: otroUsuario.id }
      });
    });
  });

  describe('HU-SOP-04: Centro de Ayuda (FAQ)', () => {
    test('Debería obtener FAQs', async () => {
      // Primero crear algunas FAQs de prueba con nombre único
      const timestamp = Date.now().toString().slice(-6);
      const categoriaId = uuidv4();
      await prisma.categoriaFAQ.create({
        data: {
          id: categoriaId,
          nombre: `Categoría Test ${timestamp}`,
          icono: 'test',
          color: '#000000'
        }
      });

      await prisma.fAQ.create({
        data: {
          id: uuidv4(),
          pregunta: '¿Cómo puedo restablecer mi contraseña?',
          respuesta: 'Para restablecer tu contraseña, ve a la página de login y haz clic en "Olvidé mi contraseña".',
          categoria_id: categoriaId,
          orden: 1,
          activa: true
        }
      });

      const response = await request(app)
        .get('/soporte/faqs')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.faqs).toBeDefined();
      expect(Array.isArray(response.body.data.faqs)).toBe(true);
    });

    test('Debería buscar FAQs por término', async () => {
      const response = await request(app)
        .get('/soporte/faqs?busqueda=contraseña')
        .set('Authorization', `Bearer ${tokenUsuario}`) // Usar tokenUsuario porque solo requiere autenticación
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.faqs).toBeDefined();
    });
  });

  describe('HU-SOP-05: Bandeja de Tickets (Administrador)', () => {
    test('Debería obtener bandeja de tickets como administrador', async () => {
      const response = await request(app)
        .get('/soporte/tickets')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tickets).toBeDefined();
      expect(Array.isArray(response.body.data.tickets)).toBe(true);
    });

    test('Debería rechazar acceso a usuarios no administradores', async () => {
      await request(app)
        .get('/soporte/tickets')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .expect(403);
    });
  });

  describe('HU-SOP-06: Gestionar Ticket (Administrador)', () => {
    test('Debería responder a ticket como administrador', async () => {
      // Crear un ticket como administrador para esta prueba
      const ticketResponse = await request(app)
        .post('/soporte/tickets')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          titulo: 'Ticket para prueba de respuesta',
          descripcion: 'Este es un ticket creado por el administrador para probar la funcionalidad de respuesta.',
          categoria: 'acceso_plataforma',
          prioridad: 'normal'
        });
      
      const adminTicketId = ticketResponse.body.data.ticket.id;

      const respuestaData = {
        contenido: 'Hemos revisado tu ticket y estamos trabajando en una solución. Te mantendremos informado.',
        estado_cambio: 'en_progreso'
      };

      const response = await request(app)
        .post(`/soporte/tickets/${adminTicketId}/respuestas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(respuestaData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.respuesta).toBeDefined();
      expect(response.body.data.respuesta.contenido).toBe(respuestaData.contenido);
    });

    test('Debería cambiar estado de ticket', async () => {
      const estadoData = {
        estado: 'resuelto',
        motivo: 'Problema solucionado exitosamente'
      };

      const response = await request(app)
        .patch(`/soporte/tickets/${ticketId}/estado`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(estadoData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Estado actualizado exitosamente');
    });
  });

  describe('HU-SOP-08: Estadísticas (Administrador)', () => {
    test('Debería obtener estadísticas de tickets', async () => {
      const response = await request(app)
        .get('/soporte/estadisticas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totales).toBeDefined();
      expect(response.body.data.por_estado).toBeDefined();
      expect(response.body.data.por_categoria).toBeDefined();
      expect(response.body.data.por_prioridad).toBeDefined();
    });
  });

  describe('Categorías de Tickets', () => {
    test('Debería obtener categorías disponibles', async () => {
      const response = await request(app)
        .get('/soporte/categorias')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categorias).toBeDefined();
      expect(Array.isArray(response.body.data.categorias)).toBe(true);
      expect(response.body.data.categorias.length).toBeGreaterThan(0);
    });
  });
});