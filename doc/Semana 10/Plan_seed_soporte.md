# Plan de Seed de Soporte (Tickets, Centro de Ayuda) — Enriquecido

Objetivo
- Sembrar datos realistas del módulo de soporte para pruebas de frontend descritas en [doc/Semana 10/HUDetalladas_soporte.md](doc/Semana%2010/HUDetalladas_soporte.md:1).
- Basado en los usuarios ya creados por [scripts/seed_datos_encuestas.js](scripts/seed_datos_encuestas.js:7).
- Compatible con el esquema Prisma soporte: [prisma/schema.prisma](prisma/schema.prisma:646) y migración [prisma/migrations/20251101121800_add_support_tables/migration.sql](prisma/migrations/20251101121800_add_support_tables/migration.sql:1).
- Coherente con endpoints implementados en:
  - Usuario: [routes/support.js](routes/support.js:11), [supportController.crearTicket()](controllers/supportController.js:9)
  - Admin: [routes/adminSupport.js](routes/adminSupport.js:13), [adminSupportController.obtenerBandejaTickets()](controllers/adminSupportController.js:10)
  - Centro de ayuda: [routes/helpCenter.js](routes/helpCenter.js:11), [helpCenterController.obtenerFAQs()](controllers/helpCenterController.js:9)

Base de ejecución
- Año académico: 2025.
- Generación de números de ticket con formato: #SOP-YYYY-#### (secuencial por año), alineado a [supportService.generarNumeroTicket()](services/supportService.js:52).

Usuarios base (del seed de encuestas)
- Administrador
  - DNI 11111111 — Admin Sistema
- Director
  - DNI 99999999 — Director Institución
- Docentes
  - DNI 77777777 — Docente Ejemplo
  - DNI 12345678 — Maria Rodriguez
  - DNI 11223344 — Luis Gonzalez
- Apoderados
  - DNI 88888888 — Padre Ejemplo
  - DNI 87654321 — Carlos Perez

Entidades a sembrar
1) Centro de Ayuda
   a) Categorías de FAQ (tabla categorias_faq)
      - Acceso a la Plataforma (icono login, color #4CAF50)
      - Funcionalidad Académica (icono school, color #2196F3)
      - Comunicaciones (icono chat, color #FF9800)
      - Reportes y Estadísticas (icono assessment, color #9C27B0)
      - Sugerencias (icono lightbulb, color #607D8B)
      - Errores del Sistema (icono bug_report, color #F44336)
      - Otros (icono more_horiz, color #795548)
      Referencia catálogo categorías usuario final: [supportService.obtenerCategoriasDisponibles()](services/supportService.js:39)

   b) FAQs (tabla faq)
      - Acceso a la Plataforma
        - ¿Cómo restablecer mi contraseña? (orden 1, activa)
        - No recibo el correo de recuperación (orden 2, activa)
      - Funcionalidad Académica
        - ¿Cómo consultar calificaciones del trimestre? (orden 1, activa)
      - Comunicaciones
        - ¿Cómo enviar un mensaje a un docente? (orden 1, activa)
      - Errores del Sistema
        - Error 500 al abrir mis calificaciones (orden 1, activa)
      - Cada FAQ con vistas iniciales en 0.

   c) Categorías de Guías (tabla categorias_guias)
      - Primeros pasos (icono rocket, color #10B981)
      - Guías Prácticas (icono menu_book, color #9C27B0)

   d) Guías (tabla guias)
      - Guía completa para consultar calificaciones
        - categoria: Guías Prácticas
        - icono: menu_book
        - pdf_url: /uploads/guias/guia_calificaciones.pdf (placeholder)
        - paginas: 12, tamaño: 2.5, descargas: 0
      - Guía de uso de mensajería con docentes
        - categoria: Guías Prácticas
        - icono: message
        - pdf_url: /uploads/guias/guia_mensajeria.pdf
      - Guía de acceso a la plataforma
        - categoria: Primeros pasos
        - icono: login
        - pdf_url: /uploads/guias/guia_acceso.pdf

2) Tickets de soporte (tabla tickets_soporte)
   Estados a cubrir: pendiente, en_progreso, esperando_respuesta, resuelto, cerrado
   Prioridades a cubrir: critica, alta, normal, baja
   Categorías: acceso_plataforma, funcionalidad_academica, comunicaciones, reportes, errores_sistema, sugerencias, otros (ver [prisma/schema.prisma](prisma/schema.prisma:618))

   Lote A — Apoderado DNI 88888888 (Padre Ejemplo)
   - T1: acceso_plataforma | prioridad: critica | estado: pendiente
     - titulo: No puedo acceder al portal de padres
     - descripcion: Intento iniciar sesión y me devuelve error de credenciales aunque son correctas...
   - T2: comunicaciones | prioridad: alta | estado: en_progreso
     - titulo: No puedo enviar mensajes al docente
     - descripcion: El sistema muestra un error al presionar enviar...
     - Respuesta admin (ver Respuestas)
   - T3: funcionalidad_academica | prioridad: normal | estado: resuelto | satisfaccion_usuario: 5
     - titulo: Error al ver calificaciones del T2
     - descripcion: Pantalla en blanco al abrir calificaciones del segundo trimestre.
     - Resolución y calificación (ver Respuestas)

   Lote B — Apoderado DNI 87654321 (Carlos Perez)
   - T4: reportes | prioridad: baja | estado: esperando_respuesta
     - titulo: No entiendo el reporte anual
     - descripcion: ¿Podrían explicarme el promedio anual y su cálculo?
     - Respuesta admin solicitando más detalles (estado pasa a esperando_respuesta)

   Lote C — Docente DNI 77777777 (Docente Ejemplo)
   - T5: comunicaciones | prioridad: alta | estado: en_progreso
     - titulo: Notificaciones no llegan a padres
     - descripcion: He publicado comunicados pero algunos padres no ven las notificaciones.
     - Asignado a admin y con respuesta inicial
   - T6: errores_sistema | prioridad: critica | estado: pendiente
     - titulo: Error 500 al cargar lista de estudiantes
     - descripcion: Al cargar el listado en mi curso CP3001 sale error 500 de servidor.

   Lote D — Docente DNI 12345678 (Maria Rodriguez)
   - T7: funcionalidad_academica | prioridad: normal | estado: cerrado
     - titulo: Duda sobre estructura de evaluación
     - descripcion: ¿Dónde veo los componentes de evaluación activos?

   Lote E — Director DNI 99999999 (Director Institución)
   - T8: reportes | prioridad: alta | estado: en_progreso
     - titulo: Tablero de estadísticas incompleto
     - descripcion: Los KPIs de soporte no muestran tasa de resolución.

3) Respuestas de tickets (tabla respuestas_tickets)
   - Para T2 (en_progreso): respuesta pública del admin (11111111) con estado_cambio en_progreso.
   - Para T3 (resuelto): respuesta pública del admin con prefijo SOLUCIÓN: ... y estado_cambio resuelto.
   - Para T4 (esperando_respuesta): respuesta pública del admin solicitando más detalles y estado_cambio esperando_respuesta.
   - Para T5 (en_progreso): respuesta pública del admin, si no está asignado, se autoasigna (lógica adminController ya lo hace; en seed asignar campo asignado_a).
   - Ajustar fecha_respuesta y derivar tiempo_respuesta_horas (aproximado) para tests de métricas (se puede calcular como diferencia en horas entre fecha_creacion y primera respuesta y persistir en ticket).

4) Adjuntos (tabla archivos_adjuntos) — opcional pero recomendado
   - Asignar 1 adjunto a T1 (captura_error.png):
     - nombre_original: captura_error.png
     - nombre_archivo: soporte_captura_error.png
     - url_cloudinary: https://res.cloudinary.com/demo/image/upload/sample.png (placeholder)
     - tipo_mime: image/png
     - tamaño_bytes: 245760
     - es_imagen: true
   - Asignar 1 adjunto a T3 (resuelto) con PDF:
     - nombre_original: solucion_calificaciones.pdf
     - tipo_mime: application/pdf
     - url_cloudinary: https://res.cloudinary.com/demo/raw/upload/sample.pdf

5) Notificaciones (tabla notificaciones) — opcional
   - Crear 1 notificación al admin en creación de T1 (tipo ticket, canal plataforma), siguiendo el estilo de [supportService.crearNotificacionAdministradores()](services/supportService.js:104).
   - Crear 1 notificación al usuario para cambio de estado y resolución, ver helpers en [services/supportService.js](services/supportService.js:192), (services/supportService.js:222). En seed solo mínima evidencia.

Arquitectura del script (scripts/seed_soporte.js)
- Lenguaje: Node + Prisma Client.
- Flujo:
  1. Cargar Prisma y mapear usuarios por DNI → id.
  2. Upsert de categorías FAQ y Guías.
  3. Upsert de FAQs y Guías con orden, PDFs, descargas=0.
  4. Generar número de ticket secuencial por año (replicar [supportService.generarNumeroTicket()](services/supportService.js:52)):
     - Buscar último número con startsWith #SOP-YYYY
     - Incrementar a ####
  5. Upsert de tickets por usuario según lotes (A..E).
     - Asignar prioridad según categoría si se desea (opcional) o usar definida arriba.
     - Para tickets con en_progreso/resuelto/esperando_respuesta: setear estado acorde.
     - Asignado_a: setear id del admin cuando aplique (T5, T2/T3 si se desea).
  6. Crear respuestas_tickets según casos, con fechas crecientes.
     - Para T3 agregar respuesta de solución y actualizar estado= resuelto + fecha_resolucion.
     - Para T4 respuesta que ponga esperando_respuesta.
  7. Calcular y actualizar tiempo_respuesta_horas de tickets con respuestas (diferencia en horas).
  8. Crear adjuntos de ejemplo para T1 y T3.
  9. (Opcional) Crear notificaciones básicas de ticket/respuesta/cambio de estado.
  10. Log de resumen: conteos por entidad y lista de tickets con numero_ticket, estado, prioridad.

Idempotencia
- Buscar por numero_ticket antes de crear.
- Para FAQs/Guías: buscar por pregunta/titulo y categoría; si existe, saltar.
- Para categorías: upsert por nombre.
- Adjuntos: comprobar por nombre_archivo y ticket_id.
- Notificaciones: opcional, preferible no duplicar; omitir si ya existiera una similar (no crítico para pruebas de UI).

Criterios de aceptación para pruebas frontend
- HU-SOP-01 Crear Ticket: ya existen categorías; los usuarios apoderado/docente/director pueden crear nuevos encima del dataset.
- HU-SOP-02 Historial de Tickets (usuario): ver distintas combinaciones de estados para 88888888 y 87654321, con badge de nueva respuesta si se simulan notificaciones (opcional).
- HU-SOP-03 Detalle de Ticket: T1 con adjunto imagen, T3 con respuesta de solución y estado resuelto, T2 con conversación activa en_progreso.
- HU-SOP-05 Bandeja (admin): mezcla rica de estados y prioridades (critica/alta/normal/baja), filtros por categoría y prioridad útiles.
- HU-SOP-06 Gestión (admin): T5 asignado al admin para probar flujo de respuesta y cambios de estado.

Consideraciones
- Año 2025 fijo para coherencia con otras semillas.
- No dependemos de importación de archivos reales; URLs de Cloudinary de ejemplo sirven para UI.
- Evitar inventar endpoints no implementados; este seed usa únicamente tablas persistentes.
- Si ya existen datos de tickets en la base, se seguirá numeración incremental; el script calcula prefijo anual y siguiente número.

Instrucciones de ejecución (una vez creado el script)
1) Generar cliente Prisma (si no está actualizado)
   - npx prisma generate
2) Ejecutar el seed de soporte
   - node scripts/seed_soporte.js
3) Verificar en consola el resumen final (tickets por estado, FAQs/Guías creadas)

Archivos y referencias
- Esquema soporte: [prisma/schema.prisma](prisma/schema.prisma:646)
- Migración soporte: [20251101121800_add_support_tables/migration.sql](prisma/migrations/20251101121800_add_support_tables/migration.sql:1)
- Semilla de usuarios y contexto académico: [scripts/seed_datos_encuestas.js](scripts/seed_datos_encuestas.js:7)
- Controladores Soporte:
  - Usuario: [supportController.crearTicket()](controllers/supportController.js:9), [supportController.obtenerHistorialTickets()](controllers/supportController.js:64), [supportController.obtenerDetalleTicket()](controllers/supportController.js:108), [supportController.responderTicket()](controllers/supportController.js:155), [supportController.calificarTicket()](controllers/supportController.js:244)
  - Admin: [adminSupportController.obtenerBandejaTickets()](controllers/adminSupportController.js:9), [adminSupportController.obtenerTicketGestion()](controllers/adminSupportController.js:79), [adminSupportController.responderTicketAdmin()](controllers/adminSupportController.js:141), [adminSupportController.cambiarEstadoTicket()](controllers/adminSupportController.js:221), [adminSupportController.resolverTicket()](controllers/adminSupportController.js:304), [adminSupportController.asignarTicket()](controllers/adminSupportController.js:486)
- Servicios auxiliares (notificaciones, numeración, métricas): [services/supportService.js](services/supportService.js:52)

Siguientes pasos
- Crear el archivo scripts/seed_soporte.js con la lógica anterior.
- Ejecutar y validar con la UI del frontend según [doc/Semana 10/HUDetalladas_soporte.md](doc/Semana%2010/HUDetalladas_soporte.md:1).
