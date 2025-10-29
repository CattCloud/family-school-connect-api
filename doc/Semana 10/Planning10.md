# **Análisis de Arquitectura y Plan de Implementación - Módulo de Soporte Técnico**

## **1. ANÁLISIS DE REQUERIMIENTOS**

### **1.1 Análisis de Historias de Usuario**

Basado en las HU detalladas proporcionadas, he identificado los siguientes componentes clave:

#### **Módulo de Soporte Técnico (HU-SOP-01 a HU-SOP-09)**

**Historias Principales:**
- **HU-SOP-01:** Crear Ticket de Soporte
- **HU-SOP-02:** Ver Historial de Tickets  
- **HU-SOP-03:** Ver Detalle de Ticket y Conversación
- **HU-SOP-04:** Centro de Ayuda (FAQ y Guías)
- **HU-SOP-05:** Bandeja de Tickets (Administrador)
- **HU-SOP-06:** Gestionar Ticket y Responder (Administrador)
- **HU-SOP-07:** Gestión de Contenido (Administrador)
- **HU-SOP-08:** Estadísticas y Reportes (Administrador)
- **HU-SOP-09:** Notificaciones de Tickets

### **1.2 Entidades de Base de Datos Requeridas**

Basado en el modelo de entidades existente y las HU del módulo de soporte:

```sql
-- Entidades ya existentes que se utilizarán:
usuarios (para todos los roles)
notificaciones (para notificaciones de tickets)
archivos_adjuntos (para adjuntos en tickets)

-- Nuevas entidades requeridas:
tickets_soporte
respuestas_tickets
categorias_tickets
estados_tickets
prioridades_tickets
faq
categorias_faq
guias
categorias_guias
estadisticas_soporte
```

## **2. ARQUITECTURA DEL MÓDULO**

### **2.1 Estructura de Carpetas Sugerida**

```
backend/
├── controllers/
│   ├── supportController.js          # HU-SOP-01, 02, 03
│   ├── adminSupportController.js      # HU-SOP-05, 06
│   ├── helpCenterController.js        # HU-SOP-04
│   └── contentManagementController.js # HU-SOP-07
├── services/
│   ├── supportService.js
│   ├── adminSupportService.js
│   ├── helpCenterService.js
│   └── contentManagementService.js
├── routes/
│   ├── support.js                     # Rutas de usuarios
│   ├── adminSupport.js                # Rutas de administrador
│   └── helpCenter.js                  # Rutas de centro de ayuda
├── middleware/
│   ├── supportAuth.js                 # Middleware de autenticación
│   └── adminAuth.js                   # Middleware de rol administrador
└── utils/
    ├── ticketValidation.js
    └── emailTemplates.js
```

### **2.2 Arquitectura de Capas**

```
┌─────────────────────────────────────────┐
│           FRONTEND (React)             │
│  - Formularios de tickets             │
│  - Vista de conversaciones            │
│  - Centro de ayuda                   │
│  - Panel administrativo              │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           API REST (Express)          │
│  - Controllers                        │
│  - Services                           │
│  - Middleware                         │
│  - Routes                             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         BASE DE DATOS (PostgreSQL)     │
│  - Tickets y respuestas               │
│  - FAQ y guías                       │
│  - Estadísticas                      │
│  - Relaciones con usuarios           │
└─────────────────────────────────────────┘
```

## **3. PLAN DE IMPLEMENTACIÓN**

### **3.1 Fase 1: Infraestructura Básica (Semana 10)**

#### **3.1.1 Actualización de Schema Prisma**

```prisma
// Agregar al schema.prisma existente:

model TicketSoporte {
  id                Int               @id @default(autoincrement())
  numero_ticket     String            @unique
  titulo            String
  descripcion       String            @db.Text
  categoria         CategoriaTicket
  prioridad         PrioridadTicket   @default(NORMAL)
  estado            EstadoTicket      @default(PENDIENTE)
  usuario_id        Int
  usuario           Usuario           @relation(fields: [usuario_id], references: [id])
  asignado_a        Int?              @map("asignado_a")
  asignado          Usuario?          @relation("TicketAsignado", fields: [asignado_a], references: [id])
  fecha_creacion    DateTime          @default(now())
  fecha_asignacion  DateTime?
  fecha_resolucion  DateTime?
  tiempo_respuesta_horas Int?
  satisfaccion_usuario Int?
  año_academico     Int
  respuestas        RespuestaTicket[]
  archivos_adjuntos ArchivoAdjunto[]
  notificaciones    Notificacion[]

  @@map("tickets_soporte")
}

model RespuestaTicket {
  id                  Int               @id @default(autoincrement())
  ticket_id           Int
  ticket              TicketSoporte    @relation(fields: [ticket_id], references: [id], onDelete: Cascade)
  usuario_id          Int
  usuario             Usuario           @relation(fields: [usuario_id], references: [id])
  contenido           String            @db.Text
  es_respuesta_publica Boolean          @default(true)
  fecha_respuesta     DateTime          @default(now())
  estado_cambio       String?

  @@map("respuestas_tickets")
}

model CategoriaTicket {
  id          Int               @id @default(autoincrement())
  nombre      String            @unique
  icono       String
  color       String
  descripcion String?
  tickets     TicketSoporte[]

  @@map("categorias_tickets")
}

model EstadoTicket {
  id     Int            @id @default(autoincrement())
  nombre String         @unique
  color  String
  tickets TicketSoporte[]

  @@map("estados_tickets")
}

model PrioridadTicket {
  id     Int            @id @default(autoincrement())
  nombre String         @unique
  color  String
  tickets TicketSoporte[]

  @@map("prioridades_tickets")
}

model FAQ {
  id                Int               @id @default(autoincrement())
  pregunta         String
  respuesta         String            @db.Text
  categoria_id      Int
  categoria         CategoriaFAQ      @relation(fields: [categoria_id], references: [id])
  orden             Int
  vistas            Int               @default(0)
  activa            Boolean           @default(true)
  fecha_actualizacion DateTime         @updatedAt

  @@map("faq")
}

model CategoriaFAQ {
  id                Int               @id @default(autoincrement())
  nombre            String            @unique
  icono             String
  color             String
  descripcion       String?
  preguntas         FAQ[]

  @@map("categorias_faq")
}

model Guia {
  id                Int               @id @default(autoincrement())
  titulo            String
  descripcion       String            @db.Text
  categoria_id      Int
  categoria         CategoriaGuia     @relation(fields: [categoria_id], references: [id])
  icono             String
  pdf_url           String
  paginas           Int?
  tamaño_mb         Decimal?
  descargas         Int               @default(0)
  activa            Boolean           @default(true)
  fecha_actualizacion DateTime         @updatedAt

  @@map("guias")
}

model CategoriaGuia {
  id          Int               @id @default(autoincrement())
  nombre      String            @unique
  icono       String
  color       String
  descripcion String?
  guias       Guia[]

  @@map("categorias_guias")
}

// Actualizar modelo Usuario existente:
model Usuario {
  // ... campos existentes ...
  
  // Agregar relaciones nuevas:
  tickets_creados    TicketSoporte[]     @relation("TicketCreador")
  tickets_asignados   TicketSoporte[]     @relation("TicketAsignado")
  respuestas_tickets  RespuestaTicket[]
}
```

#### **3.1.2 Creación de Endpoints Básicos**

**`routes/support.js`**
```javascript
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// HU-SOP-01: Crear Ticket
router.post('/tickets', supportController.crearTicket);

// HU-SOP-02: Ver Historial de Tickets
router.get('/tickets/usuario/:usuario_id', supportController.obtenerHistorialTickets);

// HU-SOP-03: Ver Detalle de Ticket
router.get('/tickets/:id', supportController.obtenerDetalleTicket);

// HU-SOP-03: Responder a Ticket (usuario)
router.post('/tickets/:id/respuestas', supportController.responderTicket);

module.exports = router;
```

**`routes/adminSupport.js`**
```javascript
const express = require('express');
const router = express.Router();
const adminSupportController = require('../controllers/adminSupportController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Aplicar middleware de autenticación y rol administrador
router.use(authMiddleware);
router.use(adminAuthMiddleware);

// HU-SOP-05: Bandeja de Tickets
router.get('/admin/tickets', adminSupportController.obtenerBandejaTickets);

// HU-SOP-06: Gestionar Ticket
router.get('/admin/tickets/:id', adminSupportController.obtenerTicketGestion);
router.post('/admin/tickets/:id/respuestas', adminSupportController.responderTicketAdmin);
router.patch('/admin/tickets/:id/estado', adminSupportController.cambiarEstadoTicket);
router.post('/admin/tickets/:id/resolver', adminSupportController.resolverTicket);

module.exports = router;
```

### **3.2 Fase 2: Implementación de Controllers (Semana 10)**

#### **3.2.1 Support Controller**

**`controllers/supportController.js`**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SupportController {
  // HU-SOP-01: Crear Ticket
  async crearTicket(req, res) {
    try {
      const { titulo, descripcion, categoria } = req.body;
      const usuario_id = req.usuario.id;

      // Validaciones
      if (!titulo || !descripcion || !categoria) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELDS', message: 'Todos los campos son requeridos' }
        });
      }

      // Generar número de ticket
      const numero_ticket = await this.generarNumeroTicket();

      // Crear ticket
      const ticket = await prisma.ticketSoporte.create({
        data: {
          numero_ticket,
          titulo,
          descripcion,
          categoria,
          usuario_id,
          año_academico: new Date().getFullYear()
        },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, rol: true }
          }
        }
      });

      // Crear notificación para administradores
      await this.crearNotificacionAdministradores(ticket);

      res.status(201).json({
        success: true,
        data: { ticket },
        message: 'Ticket creado exitosamente'
      });
    } catch (error) {
      console.error('Error al crear ticket:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al crear el ticket' }
      });
    }
  }

  // HU-SOP-02: Obtener Historial de Tickets
  async obtenerHistorialTickets(req, res) {
    try {
      const usuario_id = req.usuario.id;
      const { estado, categoria, pagina = 1, limite = 20 } = req.query;

      const where = { usuario_id };
      if (estado) where.estado = estado;
      if (categoria) where.categoria = categoria;

      const [tickets, total] = await Promise.all([
        prisma.ticketSoporte.findMany({
          where,
          include: {
            usuario: { select: { id: true, nombre: true, apellido: true } }
          },
          orderBy: { fecha_creacion: 'desc' },
          skip: (pagina - 1) * limite,
          take: parseInt(limite)
        }),
        prisma.ticketSoporte.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          tickets,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / limite),
            total_resultados: total,
            limite: parseInt(limite)
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el historial' }
      });
    }
  }

  // HU-SOP-03: Obtener Detalle de Ticket
  async obtenerDetalleTicket(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario.id;

      const ticket = await prisma.ticketSoporte.findFirst({
        where: { id: parseInt(id), usuario_id },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, rol: true, email: true, telefono: true }
          },
          respuestas: {
            include: {
              usuario: {
                select: { id: true, nombre: true, apellido: true, rol: true }
              }
            },
            orderBy: { fecha_respuesta: 'asc' }
          },
          archivos_adjuntos: true
        }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Ticket no encontrado' }
        });
      }

      res.json({
        success: true,
        data: { ticket }
      });
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el detalle' }
      });
    }
  }

  // Método auxiliar para generar número de ticket
  async generarNumeroTicket() {
    const año = new Date().getFullYear();
    const ultimoTicket = await prisma.ticketSoporte.findFirst({
      where: { numero_ticket: { startsWith: `#SOP-${año}` } },
      orderBy: { numero_ticket: 'desc' }
    });

    if (!ultimoTicket) {
      return `#SOP-${año}-0001`;
    }

    const ultimoNumero = parseInt(ultimoTicket.numero_ticket.split('-')[2]);
    const siguienteNumero = String(ultimoNumero + 1).padStart(4, '0');
    
    return `#SOP-${año}-${siguienteNumero}`;
  }

  // Método auxiliar para crear notificaciones
  async crearNotificacionAdministradores(ticket) {
    // Implementar lógica para notificar a administradores
    // Esto se conectará con el sistema de notificaciones existente
  }
}

module.exports = new SupportController();
```

### **3.3 Fase 3: Implementación de Services (Semana 10)**

#### **3.3.1 Support Service**

**`services/supportService.js`**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SupportService {
  // Validar datos de ticket
  static validarDatosTicket(datos) {
    const errores = [];

    if (!datos.titulo || datos.titulo.length < 10 || datos.titulo.length > 200) {
      errores.push('El título debe tener entre 10 y 200 caracteres');
    }

    if (!datos.descripcion || datos.descripcion.length < 20 || datos.descripcion.length > 1000) {
      errores.push('La descripción debe tener entre 20 y 1000 caracteres');
    }

    if (!datos.categoria) {
      errores.push('La categoría es requerida');
    }

    return errores;
  }

  // Obtener categorías disponibles
  static async obtenerCategorias() {
    return await prisma.categoriaTicket.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  // Calcular tiempo de respuesta
  static calcularTiempoRespuesta(fechaCreacion) {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diferencia = ahora - creacion;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    return horas;
  }

  // Verificar permisos de usuario sobre ticket
  static async verificarPermisosTicket(ticketId, usuarioId, rol) {
    const ticket = await prisma.ticketSoporte.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return { tieneAcceso: false, motivo: 'Ticket no encontrado' };
    }

    // Si es administrador, tiene acceso
    if (rol === 'administrador') {
      return { tieneAcceso: true };
    }

    // Si es el dueño del ticket, tiene acceso
    if (ticket.usuario_id === usuarioId) {
      return { tieneAcceso: true };
    }

    return { tieneAcceso: false, motivo: 'No tienes permisos para ver este ticket' };
  }
}

module.exports = SupportService;
```

### **3.4 Fase 4: Middleware de Autenticación (Semana 10)**

#### **3.4.1 Admin Auth Middleware**

**`middleware/adminAuthMiddleware.js`**
```javascript
const adminAuthMiddleware = (req, res, next) => {
  if (req.usuario.rol !== 'administrador') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No tienes permisos de administrador para acceder a esta ruta'
      }
    });
  }
  next();
};

module.exports = adminAuthMiddleware;
```

### **3.5 Fase 5: Integración con Sistema Existente (Semana 10)**

#### **3.5.1 Actualización de Index Principal**

**`index.js`**
```javascript
// Agregar nuevas rutas
const supportRoutes = require('./routes/support');
const adminSupportRoutes = require('./routes/adminSupport');
const helpCenterRoutes = require('./routes/helpCenter');

// Usar las rutas
app.use('/api/soporte', supportRoutes);
app.use('/api/soporte', adminSupportRoutes);
app.use('/api/soporte', helpCenterRoutes);
```

## **4. PRÓXIMOS PASOS**

### **4.1 Para la Semana 10 (Continuación)**

1. **Completar implementación de controllers restantes:**
   - `adminSupportController.js`
   - `helpCenterController.js`
   - `contentManagementController.js`

2. **Implementar servicios restantes:**
   - `adminSupportService.js`
   - `helpCenterService.js`
   - `contentManagementService.js`

3. **Crear middleware de validación:**
   - `ticketValidation.js`
   - `fileUploadValidation.js`

4. **Implementar sistema de notificaciones:**
   - Integrar con sistema de notificaciones existente
   - Crear plantillas de email para tickets

### **4.2 Para la Semana 11**

1. **Implementar frontend (React):**
   - Componentes para creación de tickets
   - Vista de conversaciones
   - Panel administrativo
   - Centro de ayuda

2. **Implementar WebSocket para actualizaciones en tiempo real:**
   - Notificaciones de nuevos mensajes
   - Actualizaciones de estado de tickets

3. **Testing:**
   - Unit tests para services
   - Integration tests para controllers
   - E2E tests para flujo completo

### **4.3 Para la Semana 12**

1. **Optimización y Performance:**
   - Caching de consultas frecuentes
   - Optimización de queries
   - Implementación de rate limiting

2. **Seguridad:**
   - Validación de entrada de datos
   - Sanitización de contenido
   - Prevención de XSS y SQL Injection

3. **Documentación:**
   - Completar documentación de API
   - Crear guías de uso
   - Documentar arquitectura

## **5. CONSIDERACIONES TÉCNICAS**

### **5.1 Integración con Sistema Existente**

- **Autenticación:** Reutilizar middleware de autenticación existente
- **Notificaciones:** Integrar con sistema de notificaciones ya implementado
- **Archivos:** Utilizar sistema de archivos adjuntos existente
- **Base de datos:** Extender schema Prisma existente

### **5.2 Buenas Prácticas**

- **Manejo de errores:** Estructura consistente de respuestas de error
- **Logging:** Registrar todas las operaciones importantes
- **Validación:** Validar datos de entrada en todos los niveles
- **Seguridad:** Sanitizar todo contenido de usuario
- **Performance:** Optimizar queries y usar índices apropiados

### **5.3 Escalabilidad**

- **Modularidad:** Diseño modular para facilitar mantenimiento
- **Caching:** Implementar caching para consultas frecuentes
- **Async:** Usar operaciones asíncronas para mejor rendimiento
- **Rate Limiting:** Implementar límites de uso para prevenir abuso

Este plan proporciona una base sólida para implementar el módulo de soporte técnico de manera estructurada y escalable, integrándose perfectamente con la arquitectura existente del sistema Family School Connect.