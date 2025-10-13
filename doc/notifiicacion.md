## MENSAJERIA
HU-MSG-04 — Notificaciones de nuevos mensajes (Padre / Docente)

Como usuario, quiero recibir notificaciones en plataforma y WhatsApp cuando tengo mensajes nuevos, para responder oportunamente.

Rol: Padre y Docente
Funcionalidad principal: Sistema de alertas (badge, contador, WhatsApp, push interna).

La HU-MSG-04 debería convertirse en el módulo de gestión central de notificaciones, encargándose de:

🔹 Backend (lógica centralizada)

Unificar los endpoints para obtener, marcar como leídas o limpiar notificaciones.

Administrar los canales activos (plataforma / WhatsApp / email futuro).

Controlar la persistencia en tabla notificaciones.

🔹 Frontend (interfaz y experiencia)

Componente global Campana de notificaciones 🔔 en el header principal.

Mostrar lista desplegable con las notificaciones recientes.

Marcar como leída al hacer clic.

Badge global con contador dinámico (actualizable por polling o socket).

Configuración del canal (activar/desactivar WhatsApp desde perfil).

En las HU HU-MSG-00, HU-MSG-01 y HU-MSG-03, ya definimos procesos internos de notificación (badge, toast, envío WhatsApp, creación de registro en tabla notificaciones), pero no la lógica unificada ni su gestión visual global, que es precisamente lo que debe cubrir HU-MSG-04.