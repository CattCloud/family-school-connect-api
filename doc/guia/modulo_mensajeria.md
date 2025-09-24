## SOBRE LOS ARCHIVOS ADJUNTOS

Se ha decidido implementar solo el manejo de archivos adjuntos en los módulos de Mensajería y Consultas y Soporte Técnico. Para garantizar un rendimiento óptimo y una experiencia de usuario fluida, se establecen los siguientes límites técnicos:

- Tipos de archivos permitidos: Se restringirá la subida de archivos únicamente a documentos PDF e imágenes (JPG y PNG). Esta limitación cubre las necesidades principales de un contexto educativo, como el envío de tareas, reportes o capturas de pantalla, sin introducir riesgos de seguridad o archivos innecesarios.
- Tamaño máximo por archivo: El límite de tamaño se fijará en 5MB. Este tamaño es un buen equilibrio para permitir documentos e imágenes de buena calidad, al mismo tiempo que se asegura que las cargas y descargas sean rápidas, especialmente para los usuarios que accedan a la plataforma desde sus dispositivos móviles.
- Límite de archivos por mensaje: Se permitirá un máximo de tres (3) archivos adjuntos por mensaje o solicitud de soporte. Esta cantidad es suficiente para la mayoría de los casos de uso y ayuda a mantener la interfaz organizada, facilitando que tanto el emisor como el receptor identifiquen el contenido de cada archivo.
- Almacenamiento: El almacenamiento de todos los archivos adjuntos se gestionará a través de Cloudinary. Esta es la solución ideal, ya que evita la sobrecarga del servidor del backend y simplifica el despliegue del proyecto. El backend utilizará la librería Multer para manejar la carga de archivos antes de enviarlos a Cloudinary, garantizando una integración fluida con la arquitectura de la API.

---

# **Módulo 5: Mensajería y Consultas**

**Objetivo:** Facilitar la comunicación directa entre padres, docentes y dirección de manera estructurada, con historial y control de supervisión.

---

### **Funcionalidades Principales**

**Bandeja de entrada**

- Lista organizada de conversaciones con: emisor, asunto, fecha y estado (leído/no leído).
- Mensajes no leídos resaltados en gris y en negrita.
- Apertura automática cambia el estado a “leído”.

**Redacción de mensajes**

- Formulario con: selección dinámica de receptor (docente, director, apoderado), asunto, cuerpo de mensaje y adjuntos.
- Validación de receptor antes del envío.
- Hasta 3 archivos adjuntos (PDF/JPG/PNG, máx. 5MB c/u).
- Confirmación visual tras envío exitoso.

**Vista de mensaje y conversación**

- Encabezado con foto, nombre y fecha.
- Contenido + adjuntos descargables.
- Área de respuesta estilo “chat” (conversación lineal, sin anidaciones).

**Seguimiento y supervisión (Director/Administrador)**

- Acceso a todo el historial de mensajes.
- Filtros por asunto, fecha, estado y usuarios.
- Vista de solo lectura (sin responder, editar ni eliminar).

---

### **Decisiones de Diseño (Preguntas Críticas)**

**14. Iniciación de conversaciones**

- **Opción B + C:** Padres pueden iniciar conversaciones con docentes/director, y docentes con padres. El director puede iniciar con cualquier usuario.
- Justificación: mantiene equilibrio; no abrimos a “todos con todos”, pero sí damos flexibilidad necesaria.

**15. Agrupación de mensajes**

- **Opción B:** Una conversación por estudiante específico.
- Justificación: así cada chat queda ligado al contexto académico del estudiante, evitando dispersión.

**16. Notificaciones de mensajería**

- **Opción A (ajustada):** Notificación inmediata vía **WhatsApp + plataforma** cada vez que llega un mensaje nuevo.
- Justificación: WhatsApp garantiza inmediatez y el módulo interno asegura trazabilidad. → Solo si se encuentra fuera del sistema

---

### **Notificaciones**

- Al enviarse un mensaje,  recibe:
    - Notificación por WhatsApp (resumen + enlace directo a la plataforma). → Solo si se encuentra fuera del sistema
    - Notificación en la plataforma (detalle completo, historial).
- Director recibe notificación automática de nuevas conversaciones creadas (para fines de supervisión).

---

### **Reglas de Negocio del Módulo**

- RN-MSG-01: Solo padres y docentes pueden iniciar conversaciones; director puede iniciar con cualquiera.
- RN-MSG-02: Los padres solo pueden hablar con los docentes que enseñan cursos a su hijo y el director
- RN-MSG-03: Máximo 3 archivos adjuntos por mensaje, con validación de tipo y tamaño.
- RN-MSG-04: Los directores/administradores tienen acceso a todo el historial, en modo solo lectura.