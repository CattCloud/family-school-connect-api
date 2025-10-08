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

Excelente pregunta, Erick 😎 — y muy oportuna, porque aclara el **paradigma del módulo de mensajería** dentro de tu plataforma.

Vamos a verlo con claridad: tu módulo **NO es como Gmail**, pero **sí toma inspiración en ese estilo de comunicación**, adaptado al contexto educativo.
Te explico exactamente **cómo es el módulo de mensajes según toda tu documentación hasta ahora.**

---

## 💬 **Concepto del Módulo de Mensajería**

> Es un sistema de mensajería **1 a 1 (privado)** entre **padres y docentes**, centrado en la comunicación sobre un **estudiante específico**, con adjuntos y notificaciones integradas.

---

## 🧠 **Visión General**

Imagina una mezcla entre:

* **WhatsApp (por su simpleza y flujo conversacional)**
* y **Gmail (por su estructura de conversaciones con asunto y agrupación temática)**

Tu módulo combina lo mejor de ambos:
✅ **Conversaciones temáticas** (como Gmail)
✅ **Mensajes tipo chat con adjuntos** (como WhatsApp)

---

## 🧩 **Estructura funcional (según tus HU y entidades)**

### 1. **Conversaciones**

Cada conversación es como un “hilo” o **chat temático**, y contiene:

* Un **asunto** (“Consulta sobre tareas de matemáticas”)
* Un **padre y un docente** (roles definidos)
* Opcionalmente, un **estudiante vinculado** (para contextualizar)
* Estado de conversación: *activa* o *cerrada*
* Tipo de conversación: `"padre_docente"`, `"padre_director"`, `"soporte"`, etc.

> 🔹 Ejemplo visual:
>
> ```
> [Conversación: Consulta sobre tareas de Matemáticas]
> Padre: "Buenos días, profe, ¿podría aclararme la tarea?"
> Docente: "Claro, se trata del ejercicio 5 del libro. Adjunto imagen 📎"
> Padre: "Perfecto, gracias 🙏"
> ```

---

### 2. **Mensajes**

Dentro de cada conversación hay varios mensajes (como burbujas de chat).

Cada mensaje tiene:

* Texto (`contenido`)
* Emisor (`emisor_id`)
* Fecha (`fecha_envio`)
* Estado de lectura (`enviado`, `entregado`, `leído`)
* Hasta **3 archivos adjuntos** (PDF, JPG, PNG)

> 🔹 Flujo típico:
>
> * Padre envía un mensaje → Estado: “enviado”
> * Docente abre la conversación → Estado: “leído”
> * Plataforma actualiza `fecha_lectura`

---

### 3. **Archivos Adjuntos**

Cada mensaje puede tener archivos (subidos a **Cloudinary**):

* Ej: tareas escaneadas, boletas, fotos de actividades.
* Límite: **3 archivos**, máx. **5MB cada uno**
* Tipos permitidos: PDF, JPG, PNG
* Guardados en la entidad `archivos_adjuntos`

---

### 4. **Notificaciones**

El sistema notifica automáticamente:

* 🔔 En la **plataforma** (badge rojo en el icono de mensajes)
* 💬 En **WhatsApp** (opcional, vía integración)

> Ejemplo:
> “📩 Nuevo mensaje de Prof. Juan Pérez sobre Matemáticas — Trimestre 2”

Estas notificaciones se gestionan desde la tabla `notificaciones`, vinculadas al `mensaje_id` o `conversacion_id`.

---

### 5. **Interfaz esperada (según HU y estructura UI/UX)**

El flujo de uso es así:

| Rol                              | Vista                                        | Descripción                                                      |
| -------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| 👨‍👩‍👧 **Padre**               | Panel “Mensajes” con lista de conversaciones | Puede ver cada docente con quien ha hablado y abrir el historial |
| 🧑‍🏫 **Docente**                | Panel “Mensajes” agrupado por estudiante     | Puede responder, adjuntar archivos, marcar mensajes leídos       |
| 👨‍💼 **Director**               | Vista de supervisión (solo lectura)          | Puede revisar las conversaciones, sin intervenir                 |
| 🧑‍💻 **Backend/Notificaciones** | Dispara alertas                              | Cuando hay nuevo mensaje o respuesta                             |

> 🔹 **Diseño visual:**
>
> * Sidebar izquierdo → lista de conversaciones
> * Panel derecho → mensajes tipo chat
> * Campo inferior → caja de texto + botón “Enviar” + ícono de clip 📎
> * Estado de lectura → doble check ✓✓ o color del badge

---

## ⚙️ **Arquitectura técnica**

**Tablas involucradas:**

* `conversaciones` → agrupa los hilos
* `mensajes` → almacena cada mensaje
* `archivos_adjuntos` → maneja los archivos
* `notificaciones` → integra alertas internas y externas

**Flujo simplificado:**

1. Padre envía mensaje → se guarda en `mensajes`
2. Si es primer mensaje → se crea `conversacion`
3. Backend dispara `notificacion`
4. Docente responde → mismo `conversacion_id`
5. Estado del mensaje cambia a “leído” cuando el receptor abre la vista

---

## 🧭 **En resumen**

| Elemento       | Inspiración                       | Implementación         |
| -------------- | --------------------------------- | ---------------------- |
| Conversaciones | Gmail (por “asunto” y agrupación) | `conversaciones`       |
| Mensajes       | WhatsApp (por chat y estados)     | `mensajes`             |
| Adjuntos       | Gmail/WhatsApp                    | `archivos_adjuntos`    |
| Notificaciones | Sistema central                   | `notificaciones`       |
| Estructura MVP | Simplicidad + contexto académico  | Perfectamente definida |

---

👉 En conclusión:
Tu **módulo de mensajería** es un **híbrido optimizado** entre un **chat educativo contextualizado** y un **correo simplificado con adjuntos y estados**.
Perfecto para comunicación clara y rastreable entre padres y docentes.

