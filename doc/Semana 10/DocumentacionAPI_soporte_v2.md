# Documentación API - Módulo de Soporte V2

Esta versión documenta exclusivamente las rutas implementadas en el sistema para el módulo de soporte. La estructura de cada endpoint sigue el estilo de la documentación original e incluye referencias a los archivos fuente para trazabilidad.

## Base URL (local)
```
http://localhost:3000
```

Prefijo del módulo: /soporte

## Autenticación JWT
- Todas las rutas de este módulo requieren token JWT.
- Las rutas administrativas requieren, además, rol administrador.

Header
```
Authorization: Bearer <token>
```

## Formato de respuesta estándar
```json
{ "success": true, "data": {}, "message": "..." }
```

---

## SECCIÓN 1: Tickets de Soporte (Usuario)

### 1. Crear Ticket de Soporte
- Endpoint: POST /soporte/tickets
- Descripción: Crea un nuevo ticket de soporte.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/support.js](routes/support.js:12), [supportController.crearTicket()](controllers/supportController.js:9)

Headers:
```
Content-Type: application/json
Authorization: Bearer <token>
```

Body:
```json
{ "titulo": "No puedo acceder a mis calificaciones", "descripcion": "Detalle del problema...", "categoria": "acceso_plataforma", "prioridad": "alta" }
```

Response Success (201):
```json
{ "success": true, "data": { "ticket": { "id": "ticket_001", "numero_ticket": "#SOP-2025-0001", "titulo": "No puedo acceder a mis calificaciones", "categoria": "acceso_plataforma", "prioridad": "alta", "estado": "pendiente", "año_academico": 2025, "usuario": { "id": "usr_pad_001", "nombre": "Juan", "apellido": "Pérez", "rol": "apoderado" } } }, "message": "Ticket creado exitosamente" }
```

---

### 2. Obtener Historial de Tickets (usuario actual)
- Endpoint: GET /soporte/tickets/usuario
- Descripción: Lista tickets creados por el usuario autenticado con filtros opcionales.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/support.js](routes/support.js:15), [supportController.obtenerHistorialTickets()](controllers/supportController.js:65)

Query:
```
?estado=pendiente&categoria=acceso_plataforma&pagina=1&limite=20
```

Response Success (200):
```json
{ "success": true, "data": { "tickets": [], "paginacion": { "pagina_actual": 1, "total_paginas": 0, "total_resultados": 0, "limite": 20 } } }
```

---

### 3. Obtener Detalle de Ticket
- Endpoint: GET /soporte/tickets/:id
- Descripción: Obtiene el detalle del ticket del usuario, incluyendo respuestas y adjuntos.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/support.js](routes/support.js:18), [supportController.obtenerDetalleTicket()](controllers/supportController.js:109)

Path Params:
```
{id} = ID del ticket
```

Response Success (200):
```json
{ "success": true, "data": { "ticket": { "id": "ticket_001", "numero_ticket": "#SOP-2025-0001" } } }
```

---

### 4. Responder a Ticket (Usuario)
- Endpoint: POST /soporte/tickets/:id/respuestas
- Descripción: Agrega una respuesta pública del usuario al ticket.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/support.js](routes/support.js:21), [supportController.responderTicket()](controllers/supportController.js:156)

Body:
```json
{ "contenido": "Información adicional del problema..." }
```

Response Success (201):
```json
{ "success": true, "data": { "respuesta": { "id": "resp_002", "ticket_id": "ticket_001" } }, "message": "Respuesta agregada exitosamente" }
```

---

### 5. Calificar Satisfacción del Ticket
- Endpoint: POST /soporte/tickets/:id/calificar
- Descripción: Registra calificación de satisfacción (1 a 5) para tickets resueltos.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/support.js](routes/support.js:24), [supportController.calificarTicket()](controllers/supportController.js:245)

Body:
```json
{ "satisfaccion": 5 }
```

Response Success (200):
```json
{ "success": true, "message": "Calificación registrada exitosamente" }
```

---

### 6. Obtener Categorías Disponibles
- Endpoint: GET /soporte/categorias
- Descripción: Lista de categorías disponibles para crear tickets.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/support.js](routes/support.js:27), [supportController.obtenerCategorias()](controllers/supportController.js:226), [supportService.obtenerCategoriasDisponibles()](services/supportService.js:39)

Response Success (200):
```json
{ "success": true, "data": { "categorias": [ { "valor": "acceso_plataforma", "nombre": "Acceso a la Plataforma" } ] } }
```

---

## SECCIÓN 2: Centro de Ayuda

### 7. Obtener FAQs
- Endpoint: GET /soporte/faqs
- Descripción: Lista FAQs activas con filtros y paginación.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:12), [helpCenterController.obtenerFAQs()](controllers/helpCenterController.js:9)

Query:
```
?categoria_id=cat_001&busqueda=acceso&pagina=1&limite=20
```

Response Success (200):
```json
{ "success": true, "data": { "faqs": [], "paginacion": { "pagina_actual": 1, "total_paginas": 0, "total_resultados": 0, "limite": 20 } } }
```

---

### 8. Obtener Detalle de FAQ
- Endpoint: GET /soporte/faqs/:id
- Descripción: Obtiene una FAQ y auto-incrementa el contador de vistas.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:15), [helpCenterController.obtenerDetalleFAQ()](controllers/helpCenterController.js:60)

Response Success (200):
```json
{ "success": true, "data": { "faq": { "id": "faq_001", "pregunta": "..." } } }
```

---

### 9. Obtener Categorías de FAQs
- Endpoint: GET /soporte/faqs-categorias
- Descripción: Lista categorías de FAQ con conteo de preguntas activas.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:18), [helpCenterController.obtenerCategoriasFAQ()](controllers/helpCenterController.js:100)

Response Success (200):
```json
{ "success": true, "data": { "categorias": [] } }
```

---

### 10. Obtener Guías
- Endpoint: GET /soporte/guias
- Descripción: Lista guías activas con filtros y paginación.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:21), [helpCenterController.obtenerGuias()](controllers/helpCenterController.js:125)

Query:
```
?categoria_id=cat_003&busqueda=calificaciones&pagina=1&limite=20
```

Response Success (200):
```json
{ "success": true, "data": { "guias": [], "paginacion": { "pagina_actual": 1, "total_paginas": 0, "total_resultados": 0, "limite": 20 } } }
```

---

### 11. Obtener Detalle de Guía
- Endpoint: GET /soporte/guias/:id
- Descripción: Obtiene una guía y auto-incrementa contador de descargas.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:24), [helpCenterController.obtenerDetalleGuia()](controllers/helpCenterController.js:177)

Response Success (200):
```json
{ "success": true, "data": { "guia": { "id": "guia_001", "titulo": "..." } } }
```

---

### 12. Obtener Categorías de Guías
- Endpoint: GET /soporte/guias-categorias
- Descripción: Lista categorías de guías con conteo.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:27), [helpCenterController.obtenerCategoriasGuias()](controllers/helpCenterController.js:217)

Response Success (200):
```json
{ "success": true, "data": { "categorias": [] } }
```

---

### 13. Búsqueda General en Centro de Ayuda
- Endpoint: GET /soporte/buscar
- Descripción: Busca en FAQs y guías.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:30), [helpCenterController.busquedaGeneral()](controllers/helpCenterController.js:242)

Query:
```
?termino=calificaciones&pagina=1&limite=10
```

Response Success (200):
```json
{ "success": true, "data": { "termino": "calificaciones", "resultados": [], "totales": { "faqs": 0, "guias": 0, "total": 0 }, "paginacion": { "pagina_actual": 1, "limite": 10 } } }
```

---

### 14. Contenido Destacado
- Endpoint: GET /soporte/destacado
- Descripción: Obtiene FAQs más vistas y guías más descargadas.
- Autenticación: Bearer token (Todos los roles)
- Referencias: [routes/helpCenter.js](routes/helpCenter.js:33), [helpCenterController.obtenerContenidoDestacado()](controllers/helpCenterController.js:353)

Query:
```
?limite=5
```

Response Success (200):
```json
{ "success": true, "data": { "faqs_destacadas": [], "guias_destacadas": [] } }
```

---

## SECCIÓN 3: Gestión Administrativa de Tickets (Rol: Administrador)

### 15. Obtener Bandeja de Tickets
- Endpoint: GET /soporte/tickets
- Descripción: Lista todos los tickets con filtros y paginación.
- Autenticación: Bearer token (Rol: Administrador)
- Referencias: [routes/adminSupport.js](routes/adminSupport.js:14), [adminSupportController.obtenerBandejaTickets()](controllers/adminSupportController.js:10)

Query:
```
?estado=en_progreso&categoria=acceso_plataforma&prioridad=alta&asignado_a=usr_admin_001&pagina=1&limite=20&busqueda=calificaciones
```

Response Success (200):
```json
{ "success": true, "data": { "tickets": [], "paginacion": { "pagina_actual": 1, "total_paginas": 0, "total_resultados": 0, "limite": 20 } } }
```

---

### 16. Obtener Ticket para Gestión
- Endpoint: GET /soporte/tickets/:id
- Descripción: Obtiene detalles completos de un ticket para gestión administrativa.
- Autenticación: Bearer token (Rol: Administrador)
- Referencias: [routes/adminSupport.js](routes/adminSupport.js:17), [adminSupportController.obtenerTicketGestion()](controllers/adminSupportController.js:79)

Response Success (200):
```json
{ "success": true, "data": { "ticket": { "id": "ticket_001" } } }
```

---

### 17. Responder a Ticket (Administrador)
- Endpoint: POST /soporte/tickets/:id/respuestas
- Descripción: Agrega una respuesta; opcionalmente cambia el estado.
- Autenticación: Bearer token (Rol: Administrador)
- Referencias: [routes/adminSupport.js](routes/adminSupport.js:20), [adminSupportController.responderTicketAdmin()](controllers/adminSupportController.js:141)

Body:
```json
{ "contenido": "Hemos identificado el problema...", "estado_cambio": "esperando_respuesta", "es_respuesta_publica": true }
```

Response Success (201):
```json
{ "success": true, "data": { "respuesta": { "id": "resp_003" } }, "message": "Respuesta agregada exitosamente" }
```

---

### 18. Cambiar Estado de Ticket
- Endpoint: PATCH /soporte/tickets/:id/estado
- Descripción: Cambia el estado del ticket.
- Autenticación: Bearer token (Rol: Administrador)
- Referencias: [routes/adminSupport.js](routes/adminSupport.js:23), [adminSupportController.cambiarEstadoTicket()](controllers/adminSupportController.js:222)

Body:
```json
{ "estado": "resuelto", "motivo": "Detalle de la justificación" }
```

Response Success (200):
```json
{ "success": true, "message": "Estado actualizado exitosamente" }
```

---

### 19. Resolver Ticket
- Endpoint: POST /soporte/tickets/:id/resolver
- Descripción: Marca el ticket como resuelto y notifica al usuario.
- Autenticación: Bearer token (Rol: Administrador)
- Referencias: [routes/adminSupport.js](routes/adminSupport.js:26), [adminSupportController.resolverTicket()](controllers/adminSupportController.js:304)

Body:
```json
{ "solucion": "Se aplicó el parche en el módulo afectado...", "solicitar_calificacion": true }
```

Response Success (200):
```json
{ "success": true, "message": "Ticket resuelto exitosamente" }
```

---

### 20. Asignar Ticket a Administrador
- Endpoint: POST /soporte/tickets/:id/asignar
- Descripción: Asigna un ticket a un administrador específico.
- Autenticación: Bearer token (Rol: Administrador)
- Referencias: [routes/adminSupport.js](routes/adminSupport.js:29), [adminSupportController.asignarTicket()](controllers/adminSupportController.js:486)

Body:
```json
{ "administrador_id": "usr_admin_002" }
```

Response Success (200):
```json
{ "success": true, "message": "Ticket asignado exitosamente" }
```

---

### 21. Obtener Estadísticas de Soporte
- Endpoint: GET /soporte/estadisticas
- Descripción: Obtiene estadísticas agregadas de tickets en un período.
- Autenticación: Bearer token (Rol: Administrador)
- Referencias: [routes/adminSupport.js](routes/adminSupport.js:32), [adminSupportController.obtenerEstadisticas()](controllers/adminSupportController.js:380), [supportService.obtenerEstadisticasPorPeriodo()](services/supportService.js:276)

Query:
```
?periodo=mes  # semana | mes | trimestre | año
```

Response Success (200):
```json
{ "success": true, "data": { "periodo": "mes", "totales": { "tickets_creados": 0, "tickets_resueltos": 0, "tasa_resolucion": 0, "tiempo_promedio_respuesta": 0, "satisfaccion_promedio": 0 }, "por_estado": [], "por_categoria": [], "por_prioridad": [] } }
```

---
