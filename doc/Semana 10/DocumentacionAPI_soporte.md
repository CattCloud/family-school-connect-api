# Documentación API - Módulo de Soporte Técnico

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Tickets de Soporte](#endpoints-de-tickets-de-soporte)
   - [Crear Ticket de Soporte](#crear-ticket-de-soporte)
   - [Ver Historial de Tickets](#ver-historial-de-tickets)
   - [Ver Detalle de Ticket y Conversación](#ver-detalle-de-ticket-y-conversación)
   - [Bandeja de Tickets (Administrador)](#bandeja-de-tickets-administrador)
   - [Gestionar Ticket y Responder (Administrador)](#gestionar-ticket-y-responder-administrador)
4. [Endpoints de Centro de Ayuda](#endpoints-de-centro-de-ayuda)
   - [FAQ - Preguntas Frecuentes](#faq---preguntas-frecuentes)
   - [Guías Paso a Paso](#guías-paso-a-paso)
5. [Endpoints de Gestión de Contenido (Administrador)](#endpoints-de-gestión-de-contenido-administrador)
   - [Gestión de FAQ](#gestión-de-faq)
   - [Gestión de Guías](#gestión-de-guías)
   - [Gestión de Categorías](#gestión-de-categorías)
   - [Estadísticas y Análisis](#estadísticas-y-análisis)
6. [Modelos de Datos](#modelos-de-datos)
7. [Códigos de Error](#códigos-de-error)
8. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## Introducción

La API del Módulo de Soporte Técnico proporciona endpoints completos para la gestión de tickets de soporte, centro de ayuda con FAQ y guías, y herramientas administrativas para la resolución de problemas técnicos del sistema Family School Connect.

### URL Base
```
https://api.familyschoolconnect.com/v1/soporte
```

### Formato de Respuesta
Todas las respuestas siguen el formato estándar:
```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

---

## Autenticación

Todos los endpoints requieren autenticación mediante token JWT en el header:

```
Authorization: Bearer <token_jwt>
```

### Tokens
- Los tokens se obtienen mediante el endpoint de autenticación
- Tienen una validez de 24 horas
- Se pueden refrescar antes de expirar

---

## Endpoints de Tickets de Soporte

### Crear Ticket de Soporte

**Endpoint:** `POST /soporte/tickets`

**Descripción:** Crea un nuevo ticket de soporte técnico con descripción detallada y archivos adjuntos.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token_jwt>
```

**Body:**
```json
{
  "titulo": "Problema con acceso al portal de padres",
  "categoria_id": 1,
  "descripcion": "No puedo ingresar al portal con mi usuario y contraseña. He intentado restablecer pero no recibo el correo de recuperación.",
  "archivos": [
    {
      "nombre": "captura_error.png",
      "tipo": "image/png",
      "contenido": "base64_encoded_content",
      "tamaño": 245760
    }
  ]
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "numero_ticket": "#SOP-2025-0001",
    "titulo": "Problema con acceso al portal de padres",
    "estado": "Pendiente",
    "categoria": "Login",
    "prioridad": "Crítica",
    "fecha_creacion": "2025-10-24T18:30:00.000Z",
    "usuario": {
      "id": 456,
      "nombre": "Juan Pérez",
      "rol": "Padre"
    }
  },
  "message": "Ticket creado exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

**Errores:**
- `400` - Datos inválidos o incompletos
- `401` - No autenticado
- `429` - Límite de tickets por hora excedido

---

### Ver Historial de Tickets

**Endpoint:** `GET /soporte/tickets/usuario/{usuario_id}`

**Descripción:** Obtiene el listado de tickets del usuario con estados actualizados.

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Parámetros de Query:**
- `estado` (opcional): Filtrar por estado (Pendiente, En Proceso, Resuelto, Cerrado)
- `categoria` (opcional): Filtrar por categoría
- `pagina` (opcional): Número de página (default: 1)
- `limite` (opcional): Resultados por página (default: 20)
- `busqueda` (opcional): Término de búsqueda

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 123,
        "numero_ticket": "#SOP-2025-0001",
        "titulo": "Problema con acceso al portal de padres",
        "estado": "Pendiente",
        "categoria": "Login",
        "fecha_creacion": "2025-10-24T18:30:00.000Z",
        "fecha_ultima_actualizacion": "2025-10-24T18:30:00.000Z",
        "cantidad_mensajes": 1,
        "tiene_respuesta_nueva": false
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 3,
      "total_resultados": 45,
      "limite": 20
    },
    "estadisticas": {
      "pendientes": 3,
      "en_proceso": 2,
      "resueltos": 15,
      "cerrados": 5
    }
  },
  "message": "Tickets obtenidos exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

**Errores:**
- `401` - No autenticado
- `403` - No tiene permisos para ver estos tickets
- `404` - Usuario no encontrado

---

### Ver Detalle de Ticket y Conversación

**Endpoint:** `GET /soporte/tickets/{ticket_id}`

**Descripción:** Obtiene información completa del ticket con historial de conversación.

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 123,
      "numero_ticket": "#SOP-2025-0001",
      "titulo": "Problema con acceso al portal de padres",
      "descripcion": "No puedo ingresar al portal con mi usuario y contraseña...",
      "estado": "Pendiente",
      "categoria": "Login",
      "prioridad": "Crítica",
      "fecha_creacion": "2025-10-24T18:30:00.000Z",
      "fecha_ultima_actualizacion": "2025-10-24T18:30:00.000Z",
      "usuario": {
        "id": 456,
        "nombre": "Juan Pérez",
        "apellido": "Gómez",
        "rol": "Padre",
        "email": "juan.perez@email.com",
        "telefono": "300-123-4567"
      }
    },
    "mensajes": [
      {
        "id": 789,
        "contenido": "No puedo ingresar al portal con mi usuario y contraseña...",
        "fecha_envio": "2025-10-24T18:30:00.000Z",
        "remitente": {
          "id": 456,
          "nombre": "Juan Pérez",
          "rol": "Padre",
          "avatar": null
        }
      }
    ],
    "archivos_adjuntos": [
      {
        "id": 101,
        "nombre_archivo": "captura_error.png",
        "ruta": "/soporte/archivos/123/captura_error.png",
        "tipo": "image/png",
        "tamaño": 245760,
        "fecha_subida": "2025-10-24T18:30:00.000Z"
      }
    ]
  },
  "message": "Ticket obtenido exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

**Errores:**
- `401` - No autenticado
- `403` - No tiene permisos para ver este ticket
- `404` - Ticket no encontrado

---

### Bandeja de Tickets (Administrador)

**Endpoint:** `GET /soporte/admin/tickets`

**Descripción:** Obtiene todos los tickets del sistema para gestión administrativa.

**Headers:**
```
Authorization: Bearer <token_jwt>
```

**Parámetros de Query:**
- `estado` (opcional): Filtrar por estado
- `categoria` (opcional): Filtrar por categoría
- `prioridad` (opcional): Filtrar por prioridad
- `usuario` (opcional): Filtrar por usuario
- `fecha_inicio` (opcional): Fecha de inicio (YYYY-MM-DD)
- `fecha_fin` (opcional): Fecha de fin (YYYY-MM-DD)
- `pagina` (opcional): Número de página (default: 1)
- `limite` (opcional): Resultados por página (default: 20)
- `busqueda` (opcional): Término de búsqueda

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 123,
        "numero_ticket": "#SOP-2025-0001",
        "titulo": "Problema con acceso al portal de padres",
        "estado": "Pendiente",
        "categoria": "Login",
        "prioridad": "Crítica",
        "fecha_creacion": "2025-10-24T18:30:00.000Z",
        "fecha_ultima_actualizacion": "2025-10-24T18:30:00.000Z",
        "usuario": {
          "id": 456,
          "nombre": "Juan Pérez",
          "apellido": "Gómez",
          "rol": "Padre",
          "email": "juan.perez@email.com",
          "telefono": "300-123-4567"
        },
        "cantidad_mensajes": 1,
        "ultimo_mensaje_fecha": "2025-10-24T18:30:00.000Z"
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 5,
      "total_resultados": 87,
      "limite": 20
    },
    "estadisticas": {
      "nuevas": 12,
      "en_proceso": 8,
      "resueltas": 45,
      "promedio_respuesta_horas": 24
    }
  },
  "message": "Tickets obtenidos exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

**Errores:**
- `401` - No autenticado
- `403` - No tiene permisos de administrador

---

### Gestionar Ticket y Responder (Administrador)

**Endpoint:** `POST /soporte/admin/tickets/{ticket_id}/mensajes`

**Descripción:** Envía una respuesta a un ticket y opcionalmente cambia el estado.

**Headers:**
```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

**Body:**
```json
{
  "contenido": "Hola Juan, para restablecer tu contraseña, sigue estos pasos: 1. Ve a la página de login 2. Haz clic en '¿Olvidaste tu contraseña?' 3. Ingresa tu correo electrónico",
  "cambiar_estado": true,
  "nuevo_estado": "En Proceso",
  "notificar_email": true,
  "notificar_whatsapp": false,
  "archivos": [
    {
      "nombre": "guia_restablecimiento.pdf",
      "tipo": "application/pdf",
      "contenido": "base64_encoded_content",
      "tamaño": 524288
    }
  ]
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "mensaje": {
      "id": 790,
      "contenido": "Hola Juan, para restablecer tu contraseña...",
      "fecha_envio": "2025-10-24T19:15:00.000Z",
      "remitente": {
        "id": 789,
        "nombre": "María Rodríguez",
        "rol": "Administrador",
        "avatar": "/avatars/admin.jpg"
      }
    },
    "ticket_actualizado": {
      "id": 123,
      "estado": "En Proceso",
      "fecha_ultima_actualizacion": "2025-10-24T19:15:00.000Z"
    },
    "notificaciones_enviadas": {
      "email": true,
      "whatsapp": false
    }
  },
  "message": "Respuesta enviada exitosamente",
  "timestamp": "2025-10-24T19:15:00.000Z"
}
```

**Endpoint:** `PATCH /soporte/admin/tickets/{ticket_id}/estado`

**Descripción:** Cambia el estado de un ticket.

**Body:**
```json
{
  "estado_id": 3,
  "justificacion": "Problema resuelto siguiendo los pasos de restablecimiento de contraseña"
}
```

**Endpoint:** `POST /soporte/admin/tickets/{ticket_id}/resolver`

**Descripción:** Marca un ticket como resuelto con descripción de solución.

**Body:**
```json
{
  "solucion": "Se restableció la contraseña del usuario siguiendo el flujo estándar. El usuario ahora puede acceder al portal.",
  "enviar_encuesta": true
}
```

**Errores:**
- `401` - No autenticado
- `403` - No tiene permisos de administrador
- `404` - Ticket no encontrado
- `400` - Datos inválidos

---

## Endpoints de Centro de Ayuda

### FAQ - Preguntas Frecuentes

**Endpoint:** `GET /soporte/faq`

**Descripción:** Obtiene el listado completo de preguntas frecuentes.

**Parámetros de Query:**
- `categoria` (opcional): Filtrar por categoría
- `busqueda` (opcional): Término de búsqueda

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "preguntas": [
      {
        "id": 1,
        "pregunta": "¿Cómo restablecer mi contraseña?",
        "respuesta": "Para restablecer tu contraseña, sigue estos pasos: 1. Ve a la página de login 2. Haz clic en '¿Olvidaste tu contraseña?' 3. Ingresa tu correo electrónico 4. Sigue las instrucciones del correo",
        "categoria": "Acceso",
        "orden": 1,
        "vistas": 125,
        "fecha_actualizacion": "2025-10-15T10:30:00.000Z"
      }
    ],
    "categorias": [
      {
        "id": 1,
        "nombre": "Acceso",
        "icono": "log-in",
        "color": "#3B82F6",
        "cantidad_preguntas": 15
      }
    ]
  },
  "message": "FAQ obtenida exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

**Endpoint:** `POST /soporte/faq/{id}/vista`

**Descripción:** Registra una vista de pregunta FAQ (para estadísticas).

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "vista_registrada": true,
    "total_vistas": 126
  },
  "message": "Vista registrada exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

---

### Guías Paso a Paso

**Endpoint:** `GET /soporte/guias`

**Descripción:** Obtiene el listado completo de guías paso a paso.

**Parámetros de Query:**
- `categoria` (opcional): Filtrar por categoría
- `busqueda` (opcional): Término de búsqueda

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "guias": [
      {
        "id": 1,
        "titulo": "Guía completa de acceso al portal de padres",
        "descripcion": "Aprende paso a paso cómo acceder y utilizar todas las funcionalidades del portal de padres",
        "categoria": "Primeros pasos",
        "icono": "rocket",
        "pdf_url": "/soporte/guias/1/guia_acceso_padres.pdf",
        "paginas": 12,
        "tamaño_mb": 2.5,
        "descargas": 89,
        "fecha_actualizacion": "2025-10-10T15:20:00.000Z",
        "estado": "Activa"
      }
    ],
    "categorias": [
      {
        "id": 1,
        "nombre": "Primeros pasos",
        "icono": "rocket",
        "color": "#10B981",
        "cantidad_guias": 8
      }
    ]
  },
  "message": "Guías obtenidas exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

**Endpoint:** `GET /soporte/guias/{id}/pdf`

**Descripción:** Descarga el archivo PDF de una guía.

**Respuesta:** Archivo PDF directamente

**Endpoint:** `POST /soporte/guias/{id}/descarga`

**Descripción:** Registra una descarga de guía (para estadísticas).

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "descarga_registrada": true,
    "total_descargas": 90
  },
  "message": "Descarga registrada exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

---

## Endpoints de Gestión de Contenido (Administrador)

### Gestión de FAQ

**Endpoint:** `GET /soporte/admin/faq`

**Descripción:** Obtiene el listado completo de preguntas FAQ para administración.

**Endpoint:** `POST /soporte/admin/faq`

**Descripción:** Crea una nueva pregunta FAQ.

**Body:**
```json
{
  "pregunta": "¿Cómo cambiar mi foto de perfil?",
  "respuesta": "Para cambiar tu foto de perfil: 1. Ve a Configuración 2. Haz clic en 'Editar perfil' 3. Selecciona 'Cambiar foto' 4. Elige una imagen y guarda los cambios",
  "categoria_id": 2,
  "orden": 15,
  "activa": true
}
```

**Endpoint:** `PATCH /soporte/admin/faq/{id}`

**Descripción:** Actualiza una pregunta FAQ existente.

**Endpoint:** `DELETE /soporte/admin/faq/{id}`

**Descripción:** Elimina una pregunta FAQ.

**Endpoint:** `PATCH /soporte/admin/faq/reordenar`

**Descripción:** Reordena las preguntas FAQ.

**Body:**
```json
{
  "reordenamiento": [
    {"id": 1, "orden": 1},
    {"id": 2, "orden": 2},
    {"id": 3, "orden": 3}
  ]
}
```

---

### Gestión de Guías

**Endpoint:** `GET /soporte/admin/guias`

**Descripción:** Obtiene el listado completo de guías para administración.

**Endpoint:** `POST /soporte/admin/guias`

**Descripción:** Crea una nueva guía.

**Body:**
```json
{
  "titulo": "Guía de uso de calificaciones",
  "descripcion": "Aprende cómo consultar y entender las calificaciones de tus hijos",
  "categoria_id": 3,
  "icono": "trending-up",
  "pdf_base64": "base64_encoded_pdf_content",
  "orden": 5,
  "activa": true
}
```

**Endpoint:** `PATCH /soporte/admin/guias/{id}`

**Descripción:** Actualiza una guía existente.

**Endpoint:** `DELETE /soporte/admin/guias/{id}`

**Descripción:** Elimina una guía.

**Endpoint:** `POST /soporte/admin/guias/{id}/pdf`

**Descripción:** Sube o reemplaza el archivo PDF de una guía.

---

### Gestión de Categorías

**Endpoint:** `GET /soporte/admin/categorias/faq`

**Descripción:** Obtiene las categorías de FAQ.

**Endpoint:** `POST /soporte/admin/categorias/faq`

**Descripción:** Crea una nueva categoría de FAQ.

**Body:**
```json
{
  "nombre": "Mensajería",
  "icono": "message-square",
  "color": "#F59E0B",
  "descripcion": "Preguntas sobre el sistema de mensajería"
}
```

**Endpoint:** `GET /soporte/admin/categorias/guias`

**Descripción:** Obtiene las categorías de guías.

**Endpoint:** `POST /soporte/admin/categorias/guias`

**Descripción:** Crea una nueva categoría de guías.

---

### Estadísticas y Análisis

**Endpoint:** `GET /soporte/admin/estadisticas`

**Descripción:** Obtiene estadísticas generales del sistema de soporte.

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "tickets": {
      "total": 150,
      "pendientes": 12,
      "en_proceso": 8,
      "resueltos": 120,
      "cerrados": 10,
      "tiempo_promedio_respuesta_horas": 18.5
    },
    "faq": {
      "total_vistas": 2500,
      "preguntas_mas_vistas": [
        {
          "id": 1,
          "pregunta": "¿Cómo restablecer mi contraseña?",
          "vistas": 125
        }
      ]
    },
    "guias": {
      "total_descargas": 450,
      "guias_mas_descargadas": [
        {
          "id": 1,
          "titulo": "Guía completa de acceso al portal de padres",
          "descargas": 89
        }
      ]
    },
    "busquedas_sin_resultados": [
      {
        "termino": "cambiar contraseña wifi",
        "frecuencia": 15
      }
    ]
  },
  "message": "Estadísticas obtenidas exitosamente",
  "timestamp": "2025-10-24T18:30:00.000Z"
}
```

**Endpoint:** `POST /soporte/admin/importar/faq`

**Descripción:** Importa preguntas FAQ desde archivo CSV.

**Endpoint:** `GET /soporte/admin/exportar/faq`

**Descripción:** Exporta preguntas FAQ a CSV.

---

## Modelos de Datos

### TicketSoporte
```json
{
  "id": "integer",
  "numero_ticket": "string",
  "titulo": "string",
  "descripcion": "text",
  "estado_id": "integer",
  "categoria_id": "integer",
  "prioridad_id": "integer",
  "usuario_id": "integer",
  "fecha_creacion": "datetime",
  "fecha_ultima_actualizacion": "datetime"
}
```

### MensajeTicket
```json
{
  "id": "integer",
  "ticket_id": "integer",
  "remitente_id": "integer",
  "contenido": "text",
  "fecha_envio": "datetime"
}
```

### FAQ
```json
{
  "id": "integer",
  "pregunta": "string",
  "respuesta": "text",
  "categoria_id": "integer",
  "orden": "integer",
  "activa": "boolean",
  "fecha_actualizacion": "datetime"
}
```

### Guia
```json
{
  "id": "integer",
  "titulo": "string",
  "descripcion": "text",
  "categoria_id": "integer",
  "pdf_url": "string",
  "paginas": "integer",
  "tamaño_mb": "decimal",
  "orden": "integer",
  "activa": "boolean",
  "fecha_actualizacion": "datetime"
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos o incompletos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - No tiene permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto de datos |
| 413 | Payload Too Large - Archivo demasiado grande |
| 415 | Unsupported Media Type - Tipo de archivo no soportado |
| 422 | Unprocessable Entity - Datos válidos pero semánticamente incorrectos |
| 429 | Too Many Requests - Límite de solicitudes excedido |
| 500 | Internal Server Error - Error del servidor |

---

## Consideraciones de Seguridad

1. **Autenticación**: Todos los endpoints requieren token JWT válido
2. **Autorización**: Verificación de roles para endpoints administrativos
3. **Sanitización**: Todo contenido de texto se sanitiza para prevenir XSS
4. **Validación de Archivos**: Los archivos se validan para tipo y tamaño
5. **Rate Limiting**: Límites de solicitudes por usuario y por IP
6. **Auditoría**: Todas las acciones se registran en logs de auditoría
7. **HTTPS**: Todas las comunicaciones deben usar HTTPS
8. **CORS**: Configuración restrictiva de orígenes permitidos

---

## WebSocket

### Conexión en Tiempo Real

**Endpoint:** `wss://api.familyschoolconnect.com/v1/soporte/actualizaciones/{usuario_id}`

**Descripción:** Establece conexión WebSocket para recibir actualizaciones en tiempo real de tickets.

**Eventos:**
- `ticket_nuevo`: Nuevo ticket creado
- `ticket_actualizado`: Cambio de estado de ticket
- `nueva_respuesta`: Nueva respuesta en ticket
- `ticket_asignado`: Ticket asignado a administrador

**Formato de Mensaje:**
```json
{
  "tipo": "ticket_actualizado",
  "datos": {
    "ticket_id": 123,
    "estado_anterior": "Pendiente",
    "estado_nuevo": "En Proceso",
    "timestamp": "2025-10-24T19:15:00.000Z"
  }
}
```

---

## Versionamiento

- **Versión Actual**: v1.0.0
- **Fecha de Actualización**: 2025-10-24
- **Política de Versiones**: Cambios no compatibles incrementan versión mayor, cambios compatibles incrementan versión menor

---

## Contacto y Soporte

Para consultas sobre esta API:
- **Email**: api-support@familyschoolconnect.com
- **Documentación**: https://docs.familyschoolconnect.com/api/soporte
- **Estado del Sistema**: https://status.familyschoolconnect.com