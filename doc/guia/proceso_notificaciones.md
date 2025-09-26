## **Arquitectura de Notificaciones**

**Versión recomendada: híbrida, defensiva, y escalable sin complejidad excesiva**

### 🔹 **1. Notificaciones en plataforma (al hacer login + polling ligero)**

**Mecanismo:**

- Al iniciar sesión, el sistema consulta la base de datos y muestra notificaciones acumuladas (eventos académicos, mensajes, alertas).
- Durante la sesión activa, se realiza un *polling ligero* cada 5 minutos para detectar nuevos eventos (calificaciones, asistencia, mensajes del docente).

**Ventajas:**

- Fácil de implementar con cualquier stack (Node, Laravel, Django, etc.).
- No requiere infraestructura de WebSockets.
- Mantiene al usuario informado sin saturar el servidor.

**Ideal para:**

Padres que revisan el sistema 1–2 veces al día. Evita desfases sin exigir tiempo real.

---

### 🔹 **2. Notificaciones por Whatsapp (eventos críticos)**

**Mecanismo:**

- Se envía un mensaje por Whatsapp cuando ocurre un evento importante:
    - Inasistencia del estudiante
    - Observación de conducta
    - Nueva calificación
    - Mensaje directo del docente

**Ventajas:**

- Asegura trazabilidad fuera de la plataforma.
- No depende de que el padre esté conectado.

**WhatsApp (vía API oficial Twilio/Meta Business API):**

- Canal principal para alertas inmediatas (inasistencias, bajo rendimiento, comunicados, mensajes nuevos).
- Se enviará un texto breve con título y enlace directo al sistema.

**Ideal para:**

Alertas que requieren atención inmediata o registro externo.

---

### 🔹 **3. Panel de historial de notificaciones**

**Mecanismo:**

- Cada usuario (padre, docente, administrador) tiene un panel donde puede ver todas las notificaciones pasadas, filtradas por tipo, fecha y estudiante.

**Ventajas:**

- Refuerza la trazabilidad narrativa.
- Permite revisar eventos anteriores sin depender del correo.
- Facilita auditoría interna.

**Ideal para:**

Revisión mensual, reuniones con padres, seguimiento académico.

---

## Ficha técnica resumida

| Componente | Tipo | Frecuencia | Complejidad | Narrativa UX |
| --- | --- | --- | --- | --- |
| Notificación al login | Plataforma | 1 vez por sesión | Baja | Inicio claro y editorializado |
| Polling cada 5 min | Plataforma | Durante sesión | Media | Flujo continuo sin saturación |
| Whatsapp por evento crítico | Externo (SMTP) | Según evento | Baja | Refuerzo externo y trazabilidad |
| Historial de notificaciones | Plataforma | Permanente | Media | Revisión y auditoría |