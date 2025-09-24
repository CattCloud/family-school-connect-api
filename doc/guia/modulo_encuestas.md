**Objetivo:** Permitir a la institución educativa recopilar feedback estructurado de padres y docentes, con segmentación de audiencias y análisis básico de resultados.

---

### **Funcionalidades Principales**

**Visualización de encuestas**

- Los padres y docentes acceden a un panel con encuestas activas en formato de tarjetas.
- Cada tarjeta muestra: título, descripción, fecha de vencimiento y estado (*Pendiente, Respondida o Vencida*).
- Una vez respondida, la encuesta se bloquea para edición, pero el usuario puede consultar sus propias respuestas.
- Las encuestas vencidas quedan visibles solo como referencia, sin posibilidad de respuesta.

**Formulario de respuesta**

- Al abrir una encuesta activa, se muestran las preguntas cargadas dinámicamente desde JSON.
- El formulario se adapta al tipo de cada pregunta.
- Tras enviar la respuesta, aparece confirmación visual (*toast*) y la encuesta pasa a estado “Respondida”.
- La respuesta queda registrada en el historial personal del usuario.

**Creación de encuestas**

- Directores y docentes autorizados pueden crear encuestas desde un formulario con campos: título, descripción, público objetivo y fecha de vencimiento.
- Botón “Agregar Pregunta” abre un modal para añadir preguntas con distintos tipos de respuesta.
- Las opciones soportadas son:
    - **Texto corto**
    - **Texto largo**
    - **Opción única (radio buttons)**
    - **Opción múltiple (checkboxes)**
    - **Escala de satisfacción (1–5)**
- Las preguntas se guardan en formato JSON y la encuesta puede visualizarse en modo *preview* antes de publicarse.
- Al publicar, se envía notificación automática vía **WhatsApp + plataforma** a los usuarios destinatarios.

**Gestión y análisis de resultados**

- El panel administrativo muestra listado de encuestas con: título, total de respuestas, fecha de vencimiento y acceso al botón “Ver análisis”.
- Los resultados se presentan de forma automática según tipo de pregunta:
    - Barras para opción única.
    - Pastel para opción múltiple.
    - Columnas para escala 1–5.
    - Listado textual para preguntas abiertas.
- Solo el creador de la encuesta puede ver los resultados completos.

---

### **Decisiones de Diseño (Preguntas Críticas)**

**17. Tipos de preguntas**

- **Opción D:** Texto libre + opción múltiple + escala de satisfacción + casillas múltiples.
- Justificación: Cubre la mayoría de necesidades sin volverse excesivamente complejo en el MVP.

**18. Análisis de resultados**

- **Opción C:** Listado de respuestas + conteo básico + porcentajes + gráficos simples.
- Justificación: Ofrece valor inmediato a la institución sin necesidad de desarrollar analítica avanzada.

---

### **Notificaciones**

- Al publicar una encuesta, los destinatarios reciben notificación inmediata por **WhatsApp + plataforma**.
- Al responder, el usuario recibe confirmación visual en la plataforma.

---

### **Reglas de Negocio del Módulo**

- RN-ENC-01: Solo directores y docentes con permisos granulares pueden crear encuestas.
- RN-ENC-02: Cada usuario solo puede responder una vez y no puede modificar su respuesta.
- RN-ENC-03: Una encuesta vencida no admite nuevas respuestas.
- RN-ENC-04: Solo el creador de la encuesta puede acceder a resultados completos.
- RN-ENC-05: Las encuestas se segmentan por nivel, grado o rol (según configuración en creación).