# Registro de Cambios - Plataforma de Comunicación y Seguimiento Académico

## **Semana 8 - 2025**

### **Módulo de Comunicados (HU-COM-02)**

#### **Nuevos Archivos Creados**

1. **`controllers/comunicadosController.js`**
   - Controladores para gestión completa de comunicados
   - Validaciones con Zod para todos los endpoints
   - Manejo de errores estandarizado

2. **`services/comunicadosService.js`**
   - Lógica de negocio para comunicados
   - Sanitización de HTML con DOMPurify
   - Validación de permisos y segmentación
   - Generación de notificaciones automáticas

3. **`routes/comunicados.js`**
   - Definición de rutas para módulo de comunicados
   - Aplicación de middleware de autenticación y rate limiting

4. **`tests/comunicados.test.js`**
   - Suite de pruebas completa para endpoints de comunicados
   - Pruebas de integración con Supertest
   - Cobertura de casos de éxito y error

#### **Archivos Modificados**

1. **`middleware/limiters.js`**
   - Agregado `comunicadosLimiter` para limitar creación de comunicados
   - Configuración: 10 solicitudes por 15 minutos por usuario

2. **`index.js`**
   - Import y montaje de rutas de comunicados
   - Integración con aplicación Express

#### **Endpoints Implementados**

1. **POST /comunicados**
   - Crear comunicado (borrador o publicado)
   - Validación de permisos y segmentación
   - Generación automática de notificaciones

2. **POST /comunicados/borrador**
   - Guardar comunicado como borrador
   - Sin generación de notificaciones

3. **PUT /comunicados/:id**
   - Editar comunicado existente
   - Solo autor o director pueden editar

4. **GET /comunicados/mis-borradores**
   - Listar borradores del usuario
   - Paginación y filtros

5. **POST /comunicados/:id/publicar**
   - Publicar borrador
   - Generación de notificaciones

6. **GET /comunicados/programados**
   - Listar comunicados con publicación programada
   - Cálculo de tiempo restante

7. **DELETE /comunicados/:id/programacion**
   - Cancelar publicación programada
   - Cambio a estado borrador

8. **GET /permisos-docentes/:docente_id**
   - Verificar permisos de docente para crear comunicados
   - Solo director o propio docente

9. **GET /cursos/docente/:docente_id**
   - Obtener cursos asignados a docente
   - Agrupados por nivel y grado

10. **GET /cursos/todos**
    - Obtener todos los cursos (solo director)
    - Estructura jerárquica

11. **GET /nivel-grado**
    - Obtener todos los niveles y grados (solo director)
    - Estructura jerárquica

12. **POST /usuarios/destinatarios/preview**
    - Calcular número estimado de destinatarios
    - Según segmentación seleccionada

13. **POST /comunicados/validar-html**
    - Validar y sanitizar contenido HTML
    - Eliminar elementos no permitidos

14. **POST /comunicados/validar-segmentacion**
    - Validar segmentación según permisos del usuario
    - Verificar acceso a grados/cursos

#### **Características Implementadas**

1. **Validación de Permisos**
   - Director: acceso completo a todos los tipos
   - Docente: solo académico y evento, con permisos explícitos
   - Segmentación restringida según asignaciones

2. **Sanitización de HTML**
   - Uso de DOMPurify para eliminar elementos peligrosos
   - Permitir solo etiquetas seguras
   - Validación de atributos

3. **Notificaciones Automáticas**
   - Generación al publicar comunicado
   - Creación en plataforma y WhatsApp
   - Segmentación según destinatarios

4. **Rate Limiting**
   - Límite de 10 creaciones por 15 minutos
   - Por usuario autenticado o IP

5. **Validaciones de Negocio**
   - Título: mínimo 10, máximo 200 caracteres
   - Contenido: mínimo 20, máximo 5000 caracteres
   - Fecha programada: mínimo 30 minutos en el futuro
   - Público objetivo: al menos uno requerido

#### **Dependencias Agregadas**

- `zod`: Para validación de esquemas
- `isomorphic-dompurify`: Para sanitización de HTML

#### **Pruebas Implementadas**

1. **Pruebas de Creación**
   - Director puede crear todos los tipos
   - Docente con permisos puede crear tipos permitidos
   - Validaciones de longitud y campos requeridos

2. **Pruebas de Permisos**
   - Verificación de permisos de docente
   - Acceso a cursos según rol
   - Validación de segmentación

3. **Pruebas de Borradores**
   - Creación y listado de borradores
   - Publicación de borradores
   - Edición de comunicados

4. **Pruebas de Programación**
   - Creación de comunicados programados
   - Listado y cancelación de programación

5. **Pruebas de Validación**
   - Validación de HTML
   - Validación de segmentación
   - Cálculo de destinatarios

#### **Consideraciones de Seguridad**

1. **Autenticación**
   - Todos los endpoints requieren token JWT válido
   - Verificación de roles y permisos

2. **Sanitización**
   - HTML sanitizado antes de guardar
   - Eliminación de scripts y elementos peligrosos

3. **Validación**
   - Validación estricta de inputs
   - Manejo de errores estandarizado

4. **Rate Limiting**
   - Protección contra abuso de creación
   - Limitación por usuario/IP

#### **Próximos Pasos**

1. **Integración Real de Notificaciones**
   - Conectar con servicios de WhatsApp API
   - Implementar sistema de colas para envío masivo

2. **Pruebas de Carga**
   - Verificar rendimiento con muchos usuarios
   - Optimizar consultas a base de datos

3. **Documentación de API**
   - Actualizar Swagger/OpenAPI
   - Documentar ejemplos de uso

4. **Monitoreo y Logging**
   - Implementar logs específicos para comunicados
   - Métricas de uso y errores

---

## **Notas de Configuración**

### **Variables de Entorno Requeridas**

```bash
# Para notificaciones de WhatsApp
WHATSAPP_API_TOKEN=
WHATSAPP_WEBHOOK_URL=
WHATSAPP_PHONE_NUMBER_ID=

# Para notificaciones de plataforma
FRONTEND_URL=

# Para rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

### **Dependencias de Desarrollo**

```bash
npm install zod isomorphic-dompurify
npm install --save-dev supertest
```

---

## **Cambios Anteriores**

Para ver cambios de semanas anteriores, consulte el historial del repositorio o documentación específica de cada módulo.