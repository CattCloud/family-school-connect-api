# Family School Connect API

API REST para la plataforma de comunicación y seguimiento académico de la I.E.P. Las Orquídeas.

## **Tecnologías**

- **Backend**: Node.js con Express.js
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT
- **Validación**: Zod
- **Pruebas**: Supertest y Vitest
- **Sanitización**: DOMPurify
- **Rate Limiting**: express-rate-limit

## **Instalación**

1. Clonar el repositorio
```bash
git clone https://github.com/usuario/family-school-connect-api.git
cd family-school-connect-api
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Ejecutar migraciones de la base de datos
```bash
npx prisma migrate dev
```

5. Iniciar servidor
```bash
npm start
```

## **Variables de Entorno**

### **Configuración Básica**

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/family_school_connect"

# JWT
JWT_SECRET="tu_secreto_jwt"
JWT_EXPIRES_IN="24h"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### **Servicios Externos**

```bash
# Cloudinary (para archivos adjuntos)
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# WhatsApp (para notificaciones)
WHATSAPP_API_TOKEN="tu_token_de_api"
WHATSAPP_WEBHOOK_URL="tu_webhook_url"
WHATSAPP_PHONE_NUMBER_ID="tu_phone_number_id"

# Frontend (para enlaces en notificaciones)
FRONTEND_URL="http://localhost:3000"
```

### **Rate Limiting**

```bash
# Límites generales
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10

# Límites específicos
MESSAGING_SEND_LIMIT=60
TEMPLATES_GENERATE_LIMIT=20
GRADES_LOAD_LIMIT=5
```

## **Módulos Implementados**

### **1. Autenticación**
- Login y logout
- Verificación de token
- Refresh token

### **2. Usuarios**
- Gestión de perfiles
- Cambio de contraseña
- Recuperación de contraseña

### **3. Calificaciones**
- Carga masiva de calificaciones
- Consulta de calificaciones por estudiante
- Validación de archivos Excel

### **4. Asistencias**
- Registro masivo de asistencias
- Consulta de asistencias por estudiante
- Validación de archivos Excel

### **5. Mensajería**
- Conversaciones entre padres y docentes
- Envío de mensajes con archivos adjuntos
- Notificaciones de nuevos mensajes

### **6. Comunicados** (Nuevo)
- Creación de comunicados institucionales
- Publicación inmediata o programada
- Segmentación por nivel/grado/curso
- Notificaciones automáticas
- Borradores y edición

### **7. Evaluaciones**
- Estructura de evaluación configurada por director
- Registro de notas por componente
- Cálculo automático de promedios

### **8. Reportes Académicos**
- Resúmenes de progreso
- Reportes por trimestre
- Exportación a PDF/Excel

## **API Endpoints**

### **Base URL**
```
http://localhost:3000
```

### **Autenticación**
```
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
```

### **Comunicados**
```
POST /comunicados                              # Crear comunicado
POST /comunicados/borrador                    # Guardar borrador
PUT /comunicados/:id                          # Editar comunicado
GET /comunicados/mis-borradores               # Listar borradores
POST /comunicados/:id/publicar               # Publicar borrador
GET /comunicados/programados                  # Listar programados
DELETE /comunicados/:id/programacion         # Cancelar programación
POST /comunicados/validar-html               # Validar HTML
POST /comunicados/validar-segmentacion       # Validar segmentación
GET /permisos-docentes/:docente_id           # Verificar permisos
GET /cursos/docente/:docente_id              # Cursos asignados
GET /cursos/todos                            # Todos los cursos (director)
GET /nivel-grado                              # Niveles y grados
POST /usuarios/destinatarios/preview         # Calcular destinatarios
```

### **Mensajería**
```
GET /conversaciones                           # Listar conversaciones
GET /conversaciones/:id                       # Obtener conversación
POST /mensajes                                # Enviar mensaje
GET /mensajes                                 # Listar mensajes
PATCH /mensajes/marcar-leidos                 # Marcar como leídos
GET /mensajes/nuevos                         # Nuevos mensajes
GET /archivos/:id/download                   # Descargar archivo
```

### **Calificaciones**
```
POST /grades/validate                         # Validar archivo
POST /grades/load                             # Cargar calificaciones
GET /grades/student/:id                       # Calificaciones de estudiante
GET /grades/summary/:id                       # Resumen académico
```

### **Asistencias**
```
POST /attendance/validate                     # Validar archivo
POST /attendance/load                         # Cargar asistencias
GET /attendance/student/:id                   # Asistencias de estudiante
```

## **Estructura del Proyecto**

```
├── controllers/          # Controladores de Express
├── services/            # Lógica de negocio
├── routes/              # Definición de rutas
├── middleware/          # Middlewares personalizados
├── utils/               # Utilidades y helpers
├── prisma/              # Esquema de base de datos
├── tests/               # Pruebas unitarias y de integración
├── doc/                 # Documentación
└── config/              # Configuraciones
```

## **Desarrollo**

### **Ejecutar pruebas**
```bash
npm test
```

### **Ejecutar pruebas en modo watch**
```bash
npm run test:watch
```

### **Verificar cobertura de pruebas**
```bash
npm run test:coverage
```

### **Generar Prisma Client**
```bash
npx prisma generate
```

### **Verificar estado de la base de datos**
```bash
npx prisma migrate status
```

### **Verificar conexión a la base de datos**
```bash
npm run test:db
```

## **Seguridad**

- **Autenticación**: Tokens JWT con expiración configurable
- **Validación**: Validación estricta de inputs con Zod
- **Sanitización**: HTML sanitizado con DOMPurify
- **Rate Limiting**: Límites configurables por endpoint
- **CORS**: Configuración de orígenes permitidos
- **Headers de Seguridad**: Uso de Helmet para headers seguros

## **Contribución**

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## **Documentación Adicional**

- [Historial de Cambios](doc/Cambios.md)
- [Arquitectura y Stack](doc/Semana2/ArquitecturaStack.md)
- [Modelo de Entidades](doc/Semana1/modelo_entidades.md)
- [Documentación API de Comunicados](doc/Semana8/DocumentacionAPI_comunicados.md)
- [Documentación API de Mensajería](doc/Semana7/DocumentacionAPI_mensajeria.md)

## **Soporte**

Para soporte técnico, contactar a:
- Email: soporte@orquideas.edu.pe
- Teléfono: +51 123 456 789