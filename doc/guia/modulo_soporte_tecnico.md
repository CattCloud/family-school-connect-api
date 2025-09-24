**Objetivo:**

Brindar asistencia técnica estructurada a los usuarios mediante un sistema de ayuda rápida (FAQ y guías) y un flujo de tickets que garantiza seguimiento y resolución formal de incidencias.

---

### **Funcionalidades Principales**

**Centro de ayuda rápida (FAQ):**

- Página de preguntas frecuentes organizada por categorías: *Acceso, Notas, Comunicación, Mensajería, Archivos*.
- Cada entrada incluye pregunta y respuesta breve, accesible en un clic.
- Se actualiza periódicamente por el administrador.

**Guías paso a paso:**

- Sección de “Centro de Guías” con documentos PDF que explican procesos frecuentes (ej. cómo crear un comunicado, responder una encuesta).
- Cada guía se presenta como tarjeta con título, breve descripción y botón **“Ver Guía”**.
- Busca reducir la carga de tickets mediante autoformación.

**Registro de solicitudes:**

- Padres, docentes y directivos pueden crear tickets desde un formulario accesible.
- Campos: título del problema, descripción detallada, categoría, adjuntos (máx. 3, 5MB c/u, solo PDF/JPG/PNG).
- Validación automática de campos obligatorios.
- Confirmación visual tras el envío con tiempo estimado de respuesta.

**Mis solicitudes (usuarios):**

- Cada usuario puede consultar su historial de tickets con estados actualizados: *Pendiente, En proceso, Resuelto*.
- Vista tipo tabla o lista con fecha de envío, última actualización y acceso al detalle.
- En el detalle, se muestra el mensaje original, las respuestas del equipo de soporte y los archivos adjuntos.

**Bandeja de solicitudes (administrador):**

- Panel administrativo con pestañas por estado (*Nuevas, En proceso, Resueltas*).
- Vista de tarjetas horizontales con datos resumidos: remitente, rol, título del problema, fecha de creación.
- Botones de acción dinámicos según estado: *Marcar en proceso, Marcar como resuelto, Ver detalle*.

**Detalle de solicitud y respuestas (administrador):**

- Vista de conversación con historial completo.
- Campo para responder con texto + adjuntos.
- Cada respuesta puede actualizar el estado del ticket.
- El sistema envía notificación automática al usuario por **WhatsApp + plataforma**.

---

### **Decisiones de Diseño (Preguntas Críticas)**

**19. Categorías de soporte**

- **Opción C: Detalladas (Login, Calificaciones, Mensajes, Archivos, Navegación).**
- Justificación: Ayuda a clasificar mejor los problemas y a generar estadísticas internas. No es excesivo y cubre los casos más comunes.

**20. Flujo de respuesta de tickets**

- **Opción B + C:** Conversación ida y vuelta hasta resolución, con posibilidad de que el usuario **reabra tickets cerrados** si el problema persiste.
- Justificación: Proporciona flexibilidad, evita cierres prematuros y mejora la satisfacción del usuario.

---

### **Notificaciones**

- Cada actualización en un ticket (nueva respuesta del administrador o cambio de estado) genera notificación inmediata al usuario por **WhatsApp + plataforma**.

---

### **Reglas de Negocio del Módulo**

- RN-SOP-01: Todos los usuarios (padres, docentes, directores) pueden crear tickets.
- RN-SOP-02: Solo el administrador puede gestionar (responder, cambiar estado) tickets.
- RN-SOP-03: Cada ticket tiene un estado único: *Pendiente, En proceso, Resuelto*.
- RN-SOP-04: Los usuarios pueden consultar su historial completo de tickets.
- RN-SOP-05: Los tickets resueltos pueden ser reabiertos por el usuario en caso de persistencia del problema.
- RN-SOP-06: Archivos adjuntos limitados a 3 por ticket, máximo 5MB c/u, formatos PDF/JPG/PNG.