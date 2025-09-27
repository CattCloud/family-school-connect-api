# **Modelo de Entidades - Plataforma de Comunicación y Seguimiento Académico**

**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semana 1 - 2025  
**Versión:** 1.0 - Modelo Completo  

---

## **1. ENTIDADES PRINCIPALES**

### **1.1 Entidad: usuarios**
**Propósito:** Almacena información básica de todos los actores del sistema (padres, docentes, director, administrador).

**Atributos:**
- **id** - Identificador único principal (clave primaria)
- **tipo_documento** - Tipo de documento de identidad requerido para el login (DNI,CARNET DE EXTRANJERIA)
- **nro_documento** - Nro_documento único para autenticación (único, requerido)
- **password_hash** - Contraseña encriptada con bcrypt (requerido)
- **rol** - Tipo de usuario: "apoderado", "docente", "director", "administrador" (enum, requerido)
- **nombre** - Nombre completo del usuario (requerido)
- **apellido** - Apellido completo del usuario (requerido)
- **telefono** - Número telefónico para WhatsApp (requerido, formato +51XXXXXXXXX)
- **fecha_creacion** - Timestamp de creación de cuenta (auto-generado)
- **fecha_ultimo_login** - Último acceso al sistema (nullable)
- **estado_activo** - Usuario habilitado/deshabilitado (boolean, default: true)
- **debe_cambiar_password** - Flag para forzar cambio de contraseña en primer login (boolean, default: false)

**Justificación técnica:**
- **Campo rol como enum:** Permite control estricto de tipos de usuario sin necesidad de tabla adicional
- **Separación nombre/apellido:** Facilita búsquedas y ordenamiento alfabético
- **Teléfono obligatorio:** Requerido para integración con WhatsApp API
- **Estado activo:** Permite desactivar usuarios sin eliminar datos históricos

---

### **1.2 Entidad: estudiantes**
**Propósito:** Información académica de estudiantes matriculados, vinculados con padres y docentes.

**Atributos:**
- **id** - Identificador único del estudiante (clave primaria)
- **codigo_estudiante** - Código institucional único (único, requerido) - Autogenerativo(NIVEL+GRADO+INCREMENTAL(001,002,003,ETC))
- **nombre** - Nombre completo del estudiante (requerido)
- **apellido** - Apellido completo del estudiante (requerido)
- **nivel_grado_id** - Referencia al nivel y grado del estudiante (FK a nivel_grado)
- **año_academico** - Año lectivo de matriculación (integer, requerido)
- **apoderado_principal_id** - Referencia al padre/apoderado principal (FK a usuarios)
- **tipo_relacion** - Tipo de parentesco del apoderado: "padre", "madre", "apoderado", "tutor" (enum, requerido)
- **estado_matricula** - Estado actual: "activo", "retirado", "trasladado" (enum, default: "activo")

**Justificación técnica:**
- **Separación grado/nivel:** Facilita filtros y agrupaciones académicas
- **Campo año_academico:** Fundamental para el histórico multi-año requerido
- **Un solo apoderado principal:** Simplifica notificaciones y comunicación oficial

---

### **1.3 Entidad: relaciones_familiares**
**Propósito:** Vincula padres/apoderados con estudiantes, permitiendo que un padre tenga múltiples hijos.

**Atributos:**
- **id** - Identificador único de la relación (clave primaria)
- **padre_id** - Referencia al usuario padre (FK a usuarios)
- **estudiante_id** - Referencia al estudiante (FK a estudiantes)
- **tipo_relacion** - Tipo de parentesco: "padre", "madre", "apoderado", "tutor" (enum, requerido)
- **fecha_asignacion** - Cuándo se estableció la relación (timestamp, auto-generado)
- **estado_activo** - Relación vigente (boolean, default: true)

**Justificación técnica:**
- **Tabla intermedia necesaria:** Relación muchos a muchos entre padres e hijos
- **Tipo de relación:** Permite documentar el parentesco exacto
- **Estado activo:** Manejo de cambios de apoderado sin perder historial

**Cardinalidad:** N:M (un padre puede tener múltiples hijos, un estudiante solo tiene un responsable)

---

### **Entidad: nivel\_grado**

**Propósito:** Estandarizar los grados y niveles educativos disponibles en la institución.
Sirve como punto intermedio entre **estudiantes** y **asignaciones\_docente\_curso**.

**Atributos:**

* **id** (PK) – Identificador único
* **nivel** (enum/string) – {Inicial, Primaria, Secundaria}
* **grado** (string/int) – Ej: 1, 2, 3, …
* **descripcion** (string opcional) – Ej: “3ro de Secundaria”, “6to de Primaria”
* **estado\_activo** (boolean) – Para activar/desactivar grados si fuera necesario

---

### **1.4 Entidad: cursos**
**Propósito:** Catálogo de materias académicas disponibles por grado y nivel.

**Atributos:**
- **id** - Identificador único del curso (clave primaria)
- **nombre** - Nombre de la materia: "Matemáticas", "Comunicación", etc. (requerido)
- **codigo_curso** - Código institucional del curso (único, requerido) - AUTOGENERATIVO(C+"nivel"+"grado"+Incremental(001,002,003))
- **nivel_grado_id** - Referencia al nivel y grado en el que se enseña el curso (FK a nivel_grado)
- **año_academico** - Año lectivo vigente (integer, requerido)
- **estado_activo** - Curso habilitado (boolean, default: true)

**Justificación técnica:**
- **Separación por grado/nivel:** Misma materia puede tener contenido diferente según grado
- **Campo año_academico:** Permite evolución del pensum académico por año
- **Código curso único:** Identificación institucional estándar

---

### **1.5 Entidad: asignaciones_docente_curso**
**Propósito:** Define qué docente enseña qué curso a qué grado/sección específica.

**Atributos:**
- **id** - Identificador único de la asignación (clave primaria)
- **docente_id** - Referencia al usuario docente (FK a usuarios)
- **curso_id** - Referencia al curso (FK a cursos)
- **nivel_grado_id** - Referencia al nivel y grado (FK a nivel_grado)
- **año_academico** - Año lectivo de la asignación (integer, requerido)
- **fecha_asignacion** - Cuándo se asignó el curso (date, requerido)
- **estado_activo** - Asignación vigente (boolean, default: true)

**Justificación técnica:**
- **Granularidad específica:** Un docente puede enseñar el mismo curso a diferentes grados/secciones
- **Control temporal:** Permite reasignaciones durante el año sin perder historial
- **Base para permisos:** Define qué datos académicos puede cargar cada docente

**Cardinalidad:** N:M (un docente puede tener múltiples cursos, un curso puede tener múltiples docentes)

---

### **1.6 Entidad: estructura_evaluacion**
**Propósito:** Define la estructura global de evaluación establecida por el director para todo el colegio.

**Atributos:**
- **id** - Identificador único de la estructura (clave primaria)
- **año_academico** - Año lectivo para el cual aplica (integer, requerido)
- **nombre_item** - Nombre del componente: "Examen", "Participación", etc. (requerido)
- **peso_porcentual** - Porcentaje que representa en la nota final (decimal, requerido)
- **tipo_evaluacion** - Tipo: "unica" o "recurrente" (enum, requerido)
- **orden_visualizacion** - Orden de presentación en interfaces (integer, requerido)
- **estado_activo** - Componente habilitado (boolean, default: true)
- **fecha_configuracion** - Cuándo se definió (timestamp, auto-generado)

**Justificación técnica:**
- **Configuración única anual:** Evita inconsistencias entre cursos y docentes
- **Peso porcentual:** Permite cálculo automático de promedios ponderados
- **Tipo de evaluación:** Diferencia ítems únicos (examen) de recurrentes (participación)
- **Orden visualización:** Control de presentación en interfaces

---

### **1.7 Entidad: evaluaciones**
**Propósito:** Registra las calificaciones individuales de cada estudiante por componente de evaluación.

**Atributos:**
- **id** - Identificador único de la evaluación (clave primaria)
- **estudiante_id** - Referencia al estudiante evaluado (FK a estudiantes)
- **curso_id** - Referencia al curso evaluado (FK a cursos)
- **estructura_evaluacion_id** - Referación al tipo de evaluación (FK a estructura_evaluacion)
- **trimestre** - Trimestre académico: 1, 2, 3 (integer, requerido)
- **año_academico** - Año lectivo (integer, requerido)
- **calificacion_numerica** - Nota en escala 0-20 (decimal, requerido)
- **calificacion_letra** - Conversión automática: "AD", "A", "B", "C" (enum, auto-calculado)
- **fecha_evaluacion** - Cuándo se realizó la evaluación (date, requerido)
- **fecha_registro** - Cuándo se registró en el sistema (timestamp, auto-generado)
- **observaciones** - Comentarios adicionales del docente (text, nullable)
- **estado** - Estado de la calificación: "preliminar", "final" (enum, default: "preliminar")
- **registrado_por** - Usuario que registró la nota (FK a usuarios)

**Justificación técnica:**
- **Calificación numérica como fuente:** Base única para todos los cálculos
- **Conversión automática a letras:** Evita inconsistencias humanas
- **Estados preliminar/final:** Permite proceso de cierre de trimestre
- **Campos de auditoría:** Trazabilidad completa de registros

---

### **1.8 Entidad: asistencias**
**Propósito:** Registra la asistencia diaria de estudiantes con estados específicos.

**Atributos:**
- **id** - Identificador único del registro (clave primaria)
- **estudiante_id** - Referencia al estudiante (FK a estudiantes)
- **fecha** - Fecha del registro de asistencia (date, requerido)
- **estado** - Estado de asistencia: "presente", "tardanza", "permiso", "falta_justificada", "falta_injustificada" (enum, requerido)
- **hora_llegada** - Hora de llegada (para tardanzas) (time, nullable)
- **justificacion** - Motivo de ausencia o permiso (text, nullable)
- **año_academico** - Año lectivo (integer, requerido)
- **registrado_por** - Usuario que registró la asistencia (FK a usuarios)
- **fecha_registro** - Cuándo se registró en el sistema (timestamp, auto-generado)

**Justificación técnica:**
- **Registro por día completo:** Simplifica la lógica de carga masiva
- **Estados específicos:** Cubre todos los casos reales de asistencia institucional
- **Campos opcionales:** Hora llegada solo para tardanzas, justificación solo para ausencias
- **Archivo justificación:** Permite adjuntar certificados médicos, permisos, etc.

---

### **1.9 Entidad: comunicados**
**Propósito:** Almacena avisos y comunicaciones oficiales de la institución.

**Atributos:**
- **id** - Identificador único del comunicado (clave primaria)
- **titulo** - Título del comunicado (requerido, max 200 caracteres)
- **contenido** - Texto completo del comunicado (text, requerido)
- **tipo** - Categoría: "academico", "administrativo", "evento", "urgente", "informativo" (enum, requerido)
- **publico_objetivo** - A quién se dirige: "padres", "docentes", "ambos" (enum, requerido)
- **grados_objetivo** - Grados específicos (JSON array, nullable para "todos")
- **niveles_objetivo** - Niveles específicos (JSON array, nullable para "todos")
- **fecha_publicacion** - Cuándo se publicó (timestamp, auto-generado)
- **fecha_programada** - Fecha programada de publicación (timestamp, nullable)
- **estado** - Estado actual: "borrador", "publicado", "archivado" (enum, default: "borrador")
- **editado** - Si fue modificado después de publicación (boolean, default: false)
- **fecha_edicion** - Última modificación (timestamp, nullable)
- **autor_id** - Usuario que creó el comunicado (FK a usuarios)
- **año_academico** - Año lectivo (integer, requerido)

**Justificación técnica:**
- **Segmentación flexible:** JSON arrays permiten múltiples grados/niveles sin tablas adicionales
- **Estados de publicación:** Control del ciclo de vida del comunicado
- **Campo editado:** Transparencia sobre modificaciones post-publicación
- **Fecha programada:** Permite programar publicaciones futuras

---

### **1.10 Entidad: comunicados_lecturas**
**Propósito:** Registra qué usuarios han leído cada comunicado (para indicador de leído/no leído).

**Atributos:**
- **id** - Identificador único del registro (clave primaria)
- **comunicado_id** - Referencia al comunicado (FK a comunicados)
- **usuario_id** - Referencia al usuario que leyó (FK a usuarios)
- **fecha_lectura** - Cuándo se marcó como leído (timestamp, auto-generado)

**Justificación técnica:**
- **Tabla intermedia simple:** Relación muchos a muchos entre comunicados y usuarios
- **Registro temporal:** Permite análisis de tiempo de lectura y seguimiento

**Cardinalidad:** N:M (un comunicado puede ser leído por muchos usuarios, un usuario puede leer muchos comunicados)

---

### **1.11 Entidad: conversaciones**
**Propósito:** Agrupa mensajes entre usuarios específicos relacionados con un estudiante particular.

**Atributos:**
- **id** - Identificador único de la conversación (clave primaria)
- **estudiante_id** - Estudiante sobre el cual gira la conversación (FK a estudiantes,nullable), nullable porque no necesariamente una conversacion trata sobre el alumno
- **padre_id** - Padre participante (FK a usuarios)
- **docente_id** - Docente participante (FK a usuarios, nullable si es con director)
- **asunto** - Tema de la conversación (requerido, max 200 caracteres)
- **estado** - Estado: "activa", "cerrada" (enum, default: "activa")
- **fecha_inicio** - Cuándo se creó la conversación (timestamp, auto-generado)
- **fecha_ultimo_mensaje** - Última actividad (timestamp, actualizado automáticamente)
- **año_academico** - Año lectivo (integer, requerido)

**Justificación técnica:**
- **Agrupación por estudiante:** Mantiene contexto académico de cada conversación
- **Participantes específicos:** Máximo 3 participantes (padre-docente-director potencial supervisor)
- **Estado de conversación:** Permite cerrar/archivar conversaciones resueltas

---

### **1.12 Entidad: mensajes**
**Propósito:** Almacena los mensajes individuales dentro de cada conversación.

**Atributos:**
- **id** - Identificador único del mensaje (clave primaria)
- **conversacion_id** - Referencia a la conversación (FK a conversaciones)
- **emisor_id** - Usuario que envió el mensaje (FK a usuarios)
- **contenido** - Texto del mensaje (text, requerido)
- **fecha_envio** - Cuándo se envió (timestamp, auto-generado)
- **estado_lectura** - Si fue leído: "enviado", "entregado", "leido" (enum, default: "enviado")
- **fecha_lectura** - Cuándo se marcó como leído (timestamp, nullable)

**Justificación técnica:**
- **Estructura simple:** Cada mensaje es independiente dentro de su conversación
- **Estados de lectura:** Permite tracking de mensajes leídos/no leídos
- **Contenido como text:** Soporta mensajes largos sin limitaciones

---

### **1.13 Entidad: archivos_adjuntos**
**Propósito:** Gestiona archivos adjuntos en mensajes y tickets de soporte.

**Atributos:**
- **id** - Identificador único del archivo (clave primaria)
- **mensaje_id** - Referencia al mensaje (FK a mensajes, nullable)
- **ticket_id** - Referencia al ticket (FK a tickets_soporte, nullable)
- **nombre_original** - Nombre del archivo al subirlo (requerido)
- **nombre_archivo** - Nombre único generado para almacenamiento (requerido)
- **url_cloudinary** - URL completa en Cloudinary (requerido)
- **tipo_mime** - Tipo MIME: "application/pdf", "image/jpeg", "image/png" (enum, requerido)
- **tamaño_bytes** - Tamaño del archivo en bytes (integer, requerido)
- **fecha_subida** - Cuándo se subió (timestamp, auto-generado)
- **subido_por** - Usuario que subió el archivo (FK a usuarios)

**Justificación técnica:**
- **Referencias opcionales:** Un archivo puede estar en mensaje O en ticket, no ambos
- **Información completa:** Metadatos necesarios para validación y presentación
- **URL directa de Cloudinary:** Acceso directo sin procesamiento adicional

---

### **1.14 Entidad: encuestas**
**Propósito:** Almacena encuestas institucionales con segmentación de audiencia.

**Atributos:**
- **id** - Identificador único de la encuesta (clave primaria)
- **titulo** - Título de la encuesta (requerido, max 200 caracteres)
- **descripcion** - Descripción y contexto (text, requerido)
- **preguntas** - Estructura de preguntas en formato JSON (json, requerido)
- **publico_objetivo** - A quién se dirige: "padres", "docentes", "ambos" (enum, requerido)
- **grados_objetivo** - Grados específicos (JSON array, nullable)
- **niveles_objetivo** - Niveles específicos (JSON array, nullable)
- **fecha_creacion** - Cuándo se creó (timestamp, auto-generado)
- **fecha_inicio** - Cuándo se habilitó (timestamp, nullable)
- **fecha_vencimiento** - Fecha límite para responder (timestamp, nullable)
- **estado** - Estado: "borrador", "activa", "cerrada", "vencida" (enum, default: "borrador")
- **permite_respuesta_multiple** - Si permite responder varias veces (boolean, default: false)
- **autor_id** - Usuario que creó la encuesta (FK a usuarios)
- **año_academico** - Año lectivo (integer, requerido)

**Justificación técnica:**
- **Preguntas como JSON:** Flexibilidad para diferentes tipos de preguntas sin tablas complejas
- **Segmentación similar a comunicados:** Consistencia en el diseño
- **Control temporal:** Fechas de inicio/vencimiento para gestión automática
- **Respuesta múltiple configurable:** Permite encuestas de seguimiento

---

### **1.15 Entidad: respuestas_encuestas**
**Propósito:** Almacena las respuestas individuales de usuarios a encuestas.

**Atributos:**
- **id** - Identificador único de la respuesta (clave primaria)
- **encuesta_id** - Referencia a la encuesta (FK a encuestas)
- **usuario_id** - Usuario que respondió (FK a usuarios)
- **estudiante_id** - Estudiante relacionado (FK a estudiantes, nullable)
- **respuestas** - Respuestas en formato JSON estructurado (json, requerido)
- **fecha_respuesta** - Cuándo se respondió (timestamp, auto-generado)
- **tiempo_respuesta_minutos** - Tiempo que tardó en responder (integer, nullable)
- **ip_respuesta** - IP desde donde se respondió (string, nullable)

**Justificación técnica:**
- **Respuestas como JSON:** Flexibilidad para manejar diferentes estructuras de respuesta
- **Estudiante relacionado:** Para encuestas específicas sobre un estudiante particular
- **Metadatos de respuesta:** Información adicional para análisis y auditoría

---

### **1.16 Entidad: tickets_soporte**
**Propósito:** Sistema de tickets para soporte técnico y atención de incidencias.

**Atributos:**
- **id** - Identificador único del ticket (clave primaria)
- **numero_ticket** - Número secuencial para referencia (único, auto-generado)
- **usuario_id** - Usuario que creó el ticket (FK a usuarios)
- **titulo** - Título del problema (requerido, max 200 caracteres)
- **descripcion** - Descripción detallada del problema (text, requerido)
- **categoria** - Tipo de problema: "login", "calificaciones", "mensajes", "archivos", "navegacion", "otro" (enum, requerido)
- **prioridad** - Urgencia: "baja", "normal", "alta", "critica" (enum, default: "normal")
- **estado** - Estado actual: "pendiente", "en_proceso", "resuelto", "cerrado" (enum, default: "pendiente")
- **fecha_creacion** - Cuándo se creó (timestamp, auto-generado)
- **fecha_asignacion** - Cuándo se asignó a administrador (timestamp, nullable)
- **fecha_resolucion** - Cuándo se resolvió (timestamp, nullable)
- **asignado_a** - Administrador responsable (FK a usuarios, nullable)
- **tiempo_respuesta_horas** - SLA de respuesta según prioridad (integer, calculado)
- **satisfaccion_usuario** - Rating de 1-5 sobre la resolución (integer, nullable)
- **año_academico** - Año lectivo (integer, requerido)

**Justificación técnica:**
- **Número ticket secuencial:** Fácil referencia para usuarios no técnicos
- **Categorización:** Facilita asignación y análisis de problemas frecuentes
- **Campos de gestión:** Control completo del flujo de atención
- **SLA automático:** Cálculo de tiempo de respuesta según prioridad

---

### **1.17 Entidad: respuestas_tickets**
**Propósito:** Conversación completa dentro de cada ticket de soporte.

**Atributos:**
- **id** - Identificador único de la respuesta (clave primaria)
- **ticket_id** - Referencia al ticket (FK a tickets_soporte)
- **usuario_id** - Usuario que respondió (FK a usuarios)
- **contenido** - Texto de la respuesta (text, requerido)
- **es_respuesta_publica** - Visible para el usuario final (boolean, default: true)
- **fecha_respuesta** - Cuándo se respondió (timestamp, auto-generado)
- **estado_cambio** - Si cambió el estado del ticket (string, nullable)

**Justificación técnica:**
- **Conversación estructurada:** Historial completo de intercambios
- **Respuestas internas:** Permite comunicación entre administradores sin que vea el usuario
- **Tracking de cambios:** Registro de modificaciones de estado

---

### **1.18 Entidad: notificaciones**
**Propósito:** Registro de todas las notificaciones enviadas a usuarios (plataforma y WhatsApp).

**Atributos:**
- **id** - Identificador único de la notificación (clave primaria)
- **usuario_id** - Usuario destinatario (FK a usuarios)
- **tipo** - Tipo de notificación: "asistencia", "calificacion", "mensaje", "comunicado", "encuesta", "sistema" (enum, requerido)
- **titulo** - Título de la notificación (requerido, max 200 caracteres)
- **contenido** - Mensaje completo (text, requerido)
- **datos_adicionales** - Información extra en JSON (json, nullable)
- **canal** - Canal de envío: "plataforma", "whatsapp", "ambos" (enum, requerido)
- **estado_plataforma** - Estado en plataforma: "pendiente", "entregada", "leida" (enum, default: "pendiente")
- **estado_whatsapp** - Estado de WhatsApp: "pendiente", "enviado", "entregado", "error" (enum, nullable)
- **fecha_creacion** - Cuándo se generó (timestamp, auto-generado)
- **fecha_entrega_plataforma** - Cuándo se mostró en plataforma (timestamp, nullable)
- **fecha_envio_whatsapp** - Cuándo se envió por WhatsApp (timestamp, nullable)
- **fecha_lectura** - Cuándo el usuario la marcó como leída (timestamp, nullable)
- **url_destino** - Enlace directo para acciones específicas (string, nullable)
- **estudiante_id** - Estudiante relacionado (FK a estudiantes, nullable)
- **referencia_id** - ID del elemento que generó la notificación (integer, nullable)
- **año_academico** - Año lectivo (integer, requerido)

**Justificación técnica:**
- **Registro centralizado:** Auditoría completa de todas las comunicaciones
- **Doble canal:** Tracking independiente de plataforma y WhatsApp
- **Estados específicos:** Control detallado del flujo de entrega
- **Referencias:** Conexión con el elemento que originó la notificación

---

### **1.19 Entidad: configuraciones_sistema**
**Propósito:** Parámetros configurables del sistema (umbrales, alertas, etc.).

**Atributos:**
- **id** - Identificador único de la configuración (clave primaria)
- **clave** - Nombre único del parámetro (único, requerido)
- **valor** - Valor de la configuración (text, requerido)
- **tipo_dato** - Tipo de dato: "string", "integer", "boolean", "decimal", "json" (enum, requerido)
- **descripcion** - Descripción del parámetro (text, requerido)
- **categoria** - Grupo: "alertas", "evaluacion", "notificaciones", "archivos", "general" (enum, requerido)
- **modificable_por** - Quién puede cambiar: "administrador", "director" (enum, default: "administrador")
- **valor_por_defecto** - Valor inicial (text, requerido)
- **fecha_modificacion** - Última actualización (timestamp, nullable)
- **modificado_por** - Usuario que hizo el cambio (FK a usuarios, nullable)

**Justificación técnica:**
- **Parámetros dinámicos:** Evita hardcodear valores en el código
- **Tipado de datos:** Validación automática según el tipo
- **Control de acceso:** Define quién puede modificar cada parámetro
- **Auditoría de cambios:** Trazabilidad de modificaciones

**Ejemplos de configuraciones:**
- umbral_nota_minima: "11"
- limite_faltas_consecutivas: "3"
- tamaño_maximo_archivo_mb: "5"
- tipos_archivos_permitidos: ["pdf", "jpg", "png"]

---

### **1.20 Entidad: permisos_docentes**
**Propósito:** Define permisos granulares de docentes para crear comunicados y encuestas por grado/nivel.

**Atributos:**
- **id** - Identificador único del permiso (clave primaria)
- **docente_id** - Usuario docente (FK a usuarios)
- **tipo_permiso** - Tipo: "comunicados", "encuestas" (enum, requerido)
- **grado** - Grado autorizado (string, requerido)
- **nivel** - Nivel autorizado: "primaria", "secundaria" (enum, requerido)
- **estado_activo** - Permiso vigente (boolean, default: true)
- **otorgado_por** - Usuario director que otorgó (FK a usuarios)
- **fecha_otorgamiento** - Cuándo se otorgó (timestamp, auto-generado)
- **fecha_vencimiento** - Fecha límite del permiso (timestamp, nullable)
- **año_academico** - Año lectivo (integer, requerido)

**Justificación técnica:**
- **Granularidad específica:** Control por grado/nivel individual
- **Múltiples tipos:** Permisos independientes para comunicados y encuestas
- **Control temporal:** Permisos con fecha de vencimiento opcionales
- **Auditoría:** Registro de quién otorga cada permiso


### **1.21 Entidad: password_reset_tokens**
**Propósito:** Almacena los tokens generados por la solicitud de cambio de contraseña

**Atributos:**
- **id** - Identificador único (clave primaria)
- **id_usuario** - identificador único (UUID).
- **fecha_creacion** 
- **fecha_expiracion** - Control de validez
- **usado** - marcar si ya fue consumido, false por defecto

### **1.22 Entidad: tokens_blacklist**
**Propósito:** Almacena los tokens ya usados(Tokens JWT al cerrar sesion)

**Atributos:**
- **id** - Identificador único (clave primaria)
- **token** - el JWT completo.
- **usuario_id** - referencia al usuario que cerró sesión
- **fecha_creacion** - Registro de cuándo se insertó en blacklist.

---

## **2. RELACIONES ENTRE ENTIDADES**

### **2.1 Relaciones 1:N (Uno a Muchos)**

**usuarios (director) → estructura_evaluacion**
- Un director configura múltiples componentes de evaluación
- FK: configurado_por en estructura_evaluacion

**nivel_grado ↔ estudiante**
- Un nivel_grado tiene muchos estudiantes.
- Cada estudiante pertenece a un solo nivel_grado.


**nivel_grado ↔ cursos**
- Un nivel_grado puede tener muchos cursos.
- Cada curso se enseña en un solo nivel_grado.


**usuarios (docente) → asignaciones_docente_curso**
- Un docente puede tener múltiples asignaciones de cursos
- FK: docente_id en asignaciones_docente_curso


**nivel_grado ↔ asignaciones_docente_curso**
- Un nivel_grado puede tener muchas asignaciones de docentes/cursos.
- Cada asignación corresponde a un solo nivel_grado.

**estudiantes → evaluaciones**
- Un estudiante tiene múltiples calificaciones
- FK: estudiante_id en evaluaciones

**estudiantes → asistencias**
- Un estudiante tiene múltiples registros de asistencia
- FK: estudiante_id en asistencias

**conversaciones → mensajes**
- Una conversación contiene múltiples mensajes
- FK: conversacion_id en mensajes

**tickets_soporte → respuestas_tickets**
- Un ticket puede tener múltiples respuestas
- FK: ticket_id en respuestas_tickets

**encuestas → respuestas_encuestas**
- Una encuesta puede tener múltiples respuestas de usuarios
- FK: encuesta_id en respuestas_encuestas

**usuarios → notificaciones**
- Un usuario recibe múltiples notificaciones
- FK: usuario_id en notificaciones

**comunicados → comunicados_lecturas**
- Un comunicado puede ser leído por múltiples usuarios
- FK: comunicado_id en comunicados_lecturas

**usuarios → permisos_docentes**
- Un docente puede tener múltiples permisos granulares
- FK: docente_id en permisos_docentes

**usuarios (padres) ↔ estudiantes**
- Un padre puede tener múltiples hijos, un estudiante solo puede tener un responsable
- Campos adicionales: apoderado_principal_id,tipo_relacion, estado_activo

**usuarios ↔ password_reset_tokens**
- Un usuario puede tener multiples solicitudes de cambio de password, pero solo uno estara activo

### **2.2 Relaciones N:M (Muchos a Muchos)**

**docentes ↔ cursos**
- Tabla intermedia: asignaciones_docente_curso
- Un docente puede enseñar múltiples cursos, un curso puede ser enseñado por múltiples docentes
- Campos adicionales: grado, seccion, año_academico, estado_activo

**comunicados ↔ usuarios**
- Tabla intermedia: comunicados_lecturas
- Un comunicado puede ser leído por múltiples usuarios, un usuario puede leer múltiples comunicados
- Campos adicionales: fecha_lectura

### **2.3 Relaciones 1:1 (Uno a Uno)**

**estudiantes → usuarios (apoderado_principal)**
- Cada estudiante tiene exactamente un apoderado principal
- FK: apoderado_principal_id en estudiantes

**conversaciones → estudiantes**
- Cada conversación está relacionada con exactamente un estudiante
- FK: estudiante_id en conversaciones
