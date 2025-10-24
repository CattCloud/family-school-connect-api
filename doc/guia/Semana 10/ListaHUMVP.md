### **1️⃣ HU-SOP-00 — Centro de Ayuda (Padre / Docente / Director)**

> Como usuario, quiero acceder a un centro de ayuda con FAQ y guías paso a paso para resolver dudas comunes sin necesidad de crear un ticket de soporte.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Página principal con 2 secciones:
  1. **FAQ (Preguntas Frecuentes):**
     - Lista organizada por categorías: Acceso, Notas, Asistencia, Comunicación, Mensajería, Archivos
     - Cada pregunta es colapsable (accordion)
     - Búsqueda en tiempo real por palabras clave
     - Contador de vistas por pregunta (para análisis de admin)
  2. **Centro de Guías:**
     - Tarjetas con guías en PDF
     - Cada tarjeta muestra: título, descripción breve, ícono de categoría, botón "Ver Guía"
     - Categorías: Primeros pasos, Comunicados, Encuestas, Mensajería, Calificaciones
     - Preview del PDF en modal o descarga directa
- Botón flotante "¿No encontraste lo que buscabas? Crear ticket" (redirige a HU-SOP-01)
- Diseño mobile-first con navegación por tabs

---

### **2️⃣ HU-SOP-01 — Crear Ticket de Soporte (Padre / Docente / Director)**

> Como usuario, quiero crear un ticket de soporte técnico con descripción detallada y archivos adjuntos para reportar problemas específicos que no puedo resolver con el FAQ.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Formulario de creación con:
  - **Título del problema:** Input de texto (10-200 caracteres)
  - **Categoría:** Select obligatorio
    - Login (problemas de acceso)
    - Calificaciones (visualización o datos incorrectos)
    - Mensajes (envío, recepción, archivos)
    - Archivos (subida, descarga, errores)
    - Navegación (enlaces rotos, páginas que no cargan)
    - Otro
  - **Descripción detallada:** Textarea (20-1000 caracteres)
    - Placeholder: "Describe el problema con el mayor detalle posible: qué estabas haciendo, qué error apareció, etc."
  - **Archivos adjuntos (opcional):**
    - Drag & drop o selector de archivos
    - Máximo 3 archivos
    - 5MB por archivo
    - Tipos: PDF, JPG, PNG
    - Preview de archivos antes de enviar
- Validación en tiempo real
- Botón "Enviar Ticket" con confirmación
- Modal de confirmación tras envío:
  - "✅ Ticket creado exitosamente"
  - "Número de ticket: #XXXX"
  - "Tiempo estimado de respuesta: 24-48 horas"
  - Botón "Ver mis tickets" (redirige a HU-SOP-02)
  - Botón "Crear otro ticket"

---

### **3️⃣ HU-SOP-02 — Ver Historial de Tickets (Padre / Docente / Director)**

> Como usuario, quiero consultar el historial de mis tickets con estados actualizados para hacer seguimiento a mis solicitudes de soporte.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Lista de tickets propios con filtros:
  - **Pestañas por estado:**
    - 🟡 Pendientes (nuevos sin atender)
    - 🔵 En Proceso (administrador trabajando)
    - 🟢 Resueltos
    - ⭕ Cerrados
  - **Filtros adicionales:**
    - Por categoría
    - Por rango de fechas
    - Búsqueda por número de ticket o título
- Vista de tarjetas (desktop) o lista (móvil):
  - **Cada tarjeta muestra:**
    - Badge de estado con color
    - Número de ticket: #XXXX
    - Título del problema (truncado a 60 caracteres)
    - Categoría (badge pequeño)
    - Fecha de creación: "Creado hace 2 días"
    - Última actualización: "Actualizado hace 5 horas"
    - Badge "Nueva respuesta" si administrador respondió
    - Botón "Ver detalle" (redirige a HU-SOP-03)
- Estado vacío si no hay tickets:
  - Ilustración + mensaje: "No tienes tickets de soporte aún"
  - Botón "Crear primer ticket"

---

### **4️⃣ HU-SOP-03 — Ver Detalle de Ticket y Conversación (Padre / Docente / Director)**

> Como usuario, quiero ver el detalle completo de mi ticket con el historial de conversación para seguir el progreso de resolución de mi problema.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Vista de detalle tipo chat con:
  - **Header con información del ticket:**
    - Número de ticket: #XXXX
    - Estado actual con badge de color
    - Categoría
    - Fecha de creación
    - Tiempo de respuesta (si aplica)
  - **Mensaje inicial del usuario:**
    - Avatar del usuario
    - Nombre completo + rol
    - Fecha y hora de envío
    - Título del problema (destacado)
    - Descripción completa
    - Archivos adjuntos (con preview y descarga)
  - **Respuestas del administrador:**
    - Avatar del administrador
    - Nombre completo
    - Fecha y hora de respuesta
    - Contenido de la respuesta
    - Archivos adjuntos (si hay)
    - Badge "Estado actualizado a: En Proceso" (si cambió estado)
  - **Campo de respuesta del usuario (opcional):**
    - Textarea: "Agregar información adicional..."
    - Botón de adjuntar archivos
    - Botón "Enviar respuesta"
    - Solo visible si ticket está "En Proceso"
- Orden cronológico ascendente (más antiguo arriba)
- Scroll automático al último mensaje
- Marcado automático como leído al abrir
---


### **6️⃣ HU-SOP-05 — Bandeja de Tickets (Administrador)**

> Como administrador, quiero ver una bandeja organizada con todos los tickets de soporte para gestionar eficientemente las solicitudes de los usuarios.

**Rol:** Administrador  
**Funcionalidad principal:**
- Panel administrativo con pestañas por estado:
  - 🆕 **Nuevas** (pendientes, sin atender)
  - 🔄 **En Proceso** (trabajando en ellas)
  - ✅ **Resueltas** (cerradas)
- Vista de tarjetas horizontales con:
  - **Información del ticket:**
    - Número: #XXXX
    - Estado con badge de color
    - Categoría con ícono
    - Fecha de creación + tiempo transcurrido
    - Prioridad (calculada automáticamente según categoría):
      - 🔴 Crítica (Login)
      - 🟠 Alta (Calificaciones, Mensajes)
      - 🟡 Normal (Archivos, Navegación)
      - 🟢 Baja (Otro)
  - **Información del usuario:**
    - Nombre completo
    - Rol (badge)
    - Contacto (teléfono)
  - **Título del problema** (truncado a 80 caracteres)
  - **Última actividad:** "Hace 2 horas"
  - **Botones de acción dinámica según estado:**
    - Nuevas: "👁️ Ver detalle" | "✅ Marcar en proceso"
    - En Proceso: "👁️ Ver detalle" | "✅ Marcar resuelto"
    - Resueltas: "👁️ Ver detalle"
- Filtros avanzados:
  - Por categoría
  - Por prioridad
  - Por usuario (búsqueda)
  - Por rango de fechas
  - Por tiempo de respuesta (SLA)
- Ordenamiento:
  - Por fecha de creación (default)
  - Por prioridad
  - Por última actividad
  - Por tiempo sin respuesta
- Badge con contador de tickets nuevos (actualizado en tiempo real)

### **7️⃣ HU-SOP-06 — Gestionar Ticket y Responder (Administrador)**

> Como administrador, quiero responder tickets con mensajes y archivos adjuntos, cambiar estados y dar seguimiento completo para resolver problemas de los usuarios.

**Rol:** Administrador  
**Funcionalidad principal:**
- Vista de detalle similar a HU-SOP-03 pero con:
  - **Acciones administrativas en header:**
    - Select "Estado":
      - Pendiente
      - En Proceso
      - Resuelto
    - Select "Prioridad" (editable):
      - Crítica
      - Alta
      - Normal
      - Baja
    - Botón "Guardar cambios"
  - **Historial completo de conversación**
  - **Campo de respuesta destacado:**
    - Textarea grande: "Escribe tu respuesta..."
    - Editor de texto enriquecido básico (negrita, listas, enlaces)
    - Botón de adjuntar archivos (máx 3, 5MB c/u)
    - Checkbox "Marcar como resuelto al enviar"
    - Botón "Enviar Respuesta" (color primario, grande)
- Al enviar respuesta:
  - Agregar mensaje a conversación con timestamp
  - Cambiar estado si checkbox está marcado
  - Generar notificación automática al usuario (WhatsApp + plataforma)
  - Actualizar "última actividad" del ticket
  - Confirmación visual: "✅ Respuesta enviada correctamente"
- Botón "← Volver a bandeja"

---

### **8️⃣ HU-SOP-07 — Gestionar FAQ y Guías (Administrador)**

> Como administrador, quiero actualizar el FAQ y las guías paso a paso para mantener actualizada la documentación del sistema y reducir la carga de tickets.

**Rol:** Administrador  
**Funcionalidad principal:**
- **Gestión de FAQ:**
  - CRUD completo de preguntas frecuentes
  - Formulario de creación/edición:
    - Categoría (select)
    - Pregunta (input, 10-200 caracteres)
    - Respuesta (textarea con editor enriquecido, 20-1000 caracteres)
    - Estado (activo/inactivo)
  - Ordenamiento drag & drop dentro de cada categoría
  - Estadísticas: vistas por pregunta
  - Botón "➕ Agregar pregunta"
- **Gestión de Guías:**
  - CRUD completo de guías
  - Formulario de creación/edición:
    - Título (input, 10-100 caracteres)
    - Descripción (textarea, 20-200 caracteres)
    - Categoría (select)
    - Archivo PDF (upload, máx 10MB)
    - Ícono representativo (select)
    - Estado (activo/inactivo)
  - Vista previa del PDF antes de publicar
  - Estadísticas: descargas por guía
  - Botón "➕ Agregar guía"

---

### **🔟 HU-SOP-09 — Notificaciones de Tickets (Todos los roles)**

> Como usuario/administrador, quiero recibir notificaciones sobre actualizaciones en mis tickets para estar informado del progreso en tiempo real.

**Rol:** Padre, Docente, Director, Administrador  
**Funcionalidad principal:**
- **Para usuarios (padre/docente/director):**
  - Notificación cuando administrador responde (WhatsApp + plataforma)
  - Notificación cuando estado cambia (En proceso, Resuelto)
  - Badge en módulo de soporte con contador de actualizaciones
- **Para administrador:**
  - Notificación cuando se crea ticket nuevo (plataforma)
  - Notificación cuando usuario reabra ticket (plataforma + opcional email)
  - Notificación cuando usuario responde (plataforma)
  - Badge en panel administrativo con contador de tickets nuevos
- Formato de mensaje WhatsApp:
  ```
  🎫 Actualización de Ticket #XXXX
  Estado: [Nuevo estado]
  
  Respuesta del equipo de soporte:
  [Primeros 100 caracteres...]
  
  📱 Ver ticket completo: [URL]
  ```