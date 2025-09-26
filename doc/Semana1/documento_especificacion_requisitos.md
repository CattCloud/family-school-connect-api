**Proyecto:** Plataforma de Comunicación y Seguimiento Académico

**Institución:** I.E.P. Las Orquídeas

**Fecha:** Semana 1 - 2025

**Versión:** 3 - Especificación Completa

---

## 1. PROBLEMA Y OBJETIVO DEL PROYECTO

### 1.1 Problemática Identificada

La I.E.P. Las Orquídeas presenta deficiencias significativas en la comunicación entre padres de familia e institución educativa que afectan el seguimiento académico de los estudiantes, limitando la participación parental en el proceso educativo y generando retrasos en la atención de situaciones académicas críticas.

**Problemas específicos identificados:**

- **Información fragmentada:** Los padres no tienen acceso centralizado y en tiempo real a calificaciones, asistencia y comportamiento de sus hijos
- **Comunicación informal e ineficiente:** Dependencia de medios no oficiales (WhatsApp, papeles, llamadas) que generan pérdida de información y falta de trazabilidad
- **Falta de herramientas de gestión:** La institución carece de un sistema digital que permita administrar, actualizar y mantener la comunicación de manera sostenible y efectiva

### 1.2 Objetivo Principal

Desarrollar e implementar una plataforma web que facilite la comunicación efectiva entre padres de familia y la institución educativa I.E.P. Las Orquídeas, permitiendo el seguimiento en tiempo real del desempeño académico de los estudiantes mediante un sistema híbrido de comunicación centralizada y gestión académica ligera.

### 1.3 Resultado Esperado

El sistema permitirá mejorar significativamente:

- El seguimiento académico continuo por parte de los padres
- La participación parental en el proceso educativo
- La eficiencia en la comunicación institucional
- La trazabilidad y organización de la información académica
- El control y supervisión administrativa de las comunicaciones

---

## 2. USUARIOS Y ROLES DEL SISTEMA

### 2.1 Roles Definidos

### **Rol: Padre/Apoderado**

**Descripción:** Padre o tutor legal responsable del seguimiento académico del estudiante.

**Características especiales:**

- Un padre puede tener múltiples hijos matriculados
- Solo un apoderado principal por estudiante
- Una cuenta única con acceso a todos sus hijos mediante dropdown en header
- Perfil de solo consulta (sin edición de datos personales)

**Funcionalidades disponibles:**

- Visualizar calificaciones y asistencia de sus hijos
- Recibir y leer comunicados institucionales
- Enviar y recibir mensajes con docentes y dirección
- Responder encuestas institucionales
- Crear solicitudes de soporte técnico
- Recibir notificaciones automáticas por whattsap y en plataforma
- Recuperación de contraseña automatizada por whatsapp

### **Rol: Docente**

**Descripción:** Personal académico encargado de la enseñanza, carga de datos académicos y comunicación con padres de familia.

**Funcionalidades disponibles:**

- Cargar datos académicos (notas y asistencia) mediante archivos Excel/CSV con plantilla exacta
- Comunicarse con padres mediante mensajería
- Responder consultas de padres
- Acceder a módulos adicionales según permisos otorgados por grado/nivel:
    - Crear y gestionar comunicados
    - Crear y gestionar encuestas
- Crear solicitudes de soporte técnico
- Cambio obligatorio de contraseña en primer login

### **Rol: Director**

**Descripción:** Máxima autoridad académica con control de supervisión y gestión de alto nivel.

**Funcionalidades disponibles:**

- Asignar permisos granulares por grado/nivel a docentes
- Gestionar todos los módulos del sistema
- Supervisar comunicaciones del sistema (lectura completa de mensajes)
- Cargar datos académicos de cualquier curso/sección
- Dashboard con vista general de actividad
- Configuración de umbrales de alertas

### **Rol: Administrador del Sistema**

**Descripción:** Responsable del mantenimiento técnico y operativo de la plataforma.

**Características especiales:**

- Creación de usuarios mediante scripts de base de datos (no interfaz web)
- Entrega manual de credenciales a usuarios

**Funcionalidades disponibles:**

- Crear y configurar usuarios del sistema via base de datos
- Carga masiva de datos académicos institucionales
- Gestionar solicitudes de soporte técnico
- Configuración técnica del sistema
- Gestión de backups y exportación de datos

### 2.2 Matriz de Acceso por Rol

| Módulo | Padre | Docente | Director | Administrador |
| --- | --- | --- | --- | --- |
| Autenticación | ✓ | ✓ | ✓ | ✓ |
| Calificaciones/Asistencia | Consulta | Carga por archivos | Carga + Supervisión | Carga masiva |
| Comunicados | Lectura | Crear* | Gestión completa | - |
| Mensajería | Envío/Recepción | Envío/Recepción | Supervisión completa | - |
| Encuestas | Responder | Crear* | Gestión completa | - |
| Notificaciones | Recibir | Recibir | Configurar | Configurar |
| Soporte Técnico | Crear tickets | Crear tickets | - | Gestionar tickets |
| Gestión Usuarios | - | - | Permisos docentes | Crear usuarios |
- Según permisos granulares otorgados por el director

---

## 3. HISTORIAS DE USUARIO ESPECIFICADAS

### 3.1 Historias de Usuario - Padre/Apoderado

| ID | Historia de Usuario | Prioridad | Criterios de Aceptación Específicos |
| --- | --- | --- | --- |
| HU-01 | Como padre, quiero iniciar sesión y seleccionar entre mis hijos mediante dropdown en header | Alta | - Login con credenciales únicas<br>- Dropdown en header cambia todo el dashboard<br>- Sesión única activa<br>- Recuperación de contraseña por whatsapp automático |
| HU-02 | Como padre, quiero ver calificaciones con 5 componentes fijos por trimestre para hacer seguimiento académico | Alta | - Componentes: Examen, Participación, Revisión cuaderno, Revisión libro, Comportamiento<br>- Filtros por año académico, trimestre, curso<br>- Histórico multi-año disponible |
| HU-03 | Como padre, quiero consultar asistencia diaria con 5 estados específicos | Alta | - Estados: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada<br>- Vista calendario con estados visuales<br>- Registro por día completo |
| HU-04 | Como padre, quiero recibir notificaciones de asistencia y alertas críticas específicas | Alta | - Notificación inmediata por tardanza vía WhatsApp + plataforma<br>- Alerta por falta injustificada con solicitud de justificación<br>- Alerta por 3+ faltas injustificadas consecutivas<br>- Confirmación diaria de asistencia presente |
| HU-05 | Como padre, quiero recibir alertas por bajo rendimiento cuando nota individual < 11 | Alta | - WhatsApp + notificación en plataforma<br>- Detalle de curso y tipo de evaluación<br>- Enlace directo a la sección de calificaciones |
| HU-06 | Como padre, quiero leer comunicados institucionales segmentados | Media | - Comunicados dirigidos a mis grados/niveles<br>- Indicador de leído/no leído |
| HU-07 | Como padre, quiero enviar mensajes con archivos adjuntos a docentes | Alta | - Máximo 3 archivos por mensaje<br>- Tipos: PDF, JPG, PNG<br>- Máximo 5MB cada archivo<br>- Almacenamiento en Cloudinary |
| HU-08 | Como padre, quiero responder encuestas institucionales una sola vez | Baja | - Una respuesta por encuesta<br>- Respuesta no modificable después de envío |
| HU-09 | Como padre, quiero crear tickets de soporte técnico con evidencias | Media | - Sistema de tickets con estados<br>- Archivos adjuntos permitidos<br>- FAQ disponible antes de crear ticket |

### 3.2 Historias de Usuario - Docente

| ID | Historia de Usuario | Prioridad | Criterios de Aceptación Específicos |
| --- | --- | --- | --- |
| HU-10 | Como docente, quiero cargar calificaciones mediante plantilla Excel exacta | Alta | - Plantilla con formato fijo obligatorio<br>- Validación estricta de columnas y orden<br>- Solo cursos asignados a mi perfil<br>- Selección previa de contexto (nivel/grado/curso) |
| HU-11 | Como docente, quiero cargar asistencia diaria con los 5 estados definidos | Alta | - Estados: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada<br>- Procesamiento con reporte de errores<br>- Registro por día completo |
| HU-12 | Como docente, quiero que se procesen registros válidos y se reporten errores específicos | Alta | - Procesar datos correctos aunque haya errores<br>- Generar archivo TXT con detalle de errores<br>- Especificar fila y tipo de error exacto |
| HU-13 | Como docente, quiero recibir notificaciones de mensajes de padres | Alta | - Notificaciones whatsapp + plataforma<br>- Historial conversacional por estudiante |
| HU-14 | Como docente, quiero crear comunicados solo para grados donde tengo permisos | Media | - Permisos granulares asignados por director<br>- Segmentación por grado específico |
| HU-15 | Como docente, quiero crear encuestas para mis niveles autorizados | Baja | - Control de permisos por nivel<br>- Visualización completa de resultados propios |

### 3.3 Historias de Usuario - Director

| ID | Historia de Usuario | Prioridad | Criterios de Aceptación Específicos |
| --- | --- | --- | --- |
| HU-16 | Como director, quiero asignar permisos específicos de comunicados/encuestas por grado a docentes | Alta | - Panel de gestión con vista de docentes<br>- Permisos granulares por grado y nivel<br>- Activación/desactivación individual |
| HU-17 | Como director, quiero leer todos los mensajes del sistema para supervisión | Media | - Acceso completo de solo lectura<br>- Vista organizada por conversaciones<br>- Sin capacidad de edición o eliminación |
| HU-18 | Como director, quiero cargar datos académicos de cualquier curso sin restricciones | Alta | - Acceso total a todos los cursos/secciones<br>- Mismo proceso de validación que docentes<br>- Capacidad de aprobar cierre de trimestre |
| HU-19 | Como director, quiero configurar umbrales de alertas académicas y estructura de evaluación | Alta | - Configuración de nota mínima (actual: 11)<br>- Configuración de faltas consecutivas (actual: 3)<br>- Definición de estructura de evaluación (5 ítems máximo)<br>- Asignación de pesos a cada componente de evaluación |

### 3.4 Historias de Usuario - Administrador del Sistema

| ID | Historia de Usuario | Prioridad | Criterios de Aceptación Específicos |
| --- | --- | --- | --- |
| HU-20 | Como administrador, quiero crear usuarios masivamente via base de datos | Alta | - Scripts SQL para inserción masiva<br>- Vinculación automática padre-hijo<br>- Generación de credenciales iniciales |
| HU-21 | Como administrador, quiero gestionar tickets con estados y seguimiento completo | Media | - Estados: Nueva, En Proceso, Resuelta<br>- Conversación completa por ticket<br>- Categorización por tipo de problema |
| HU-22 | Como administrador, quiero realizar exportaciones de datos para respaldo | Media | - Script de exportación SQL/CSV<br>- Backup completo de datos académicos<br>- Documentación del proceso |

---

## 4. DEFINICIÓN DETALLADA DE MÓDULOS

### **Módulo 1: Autenticación y Perfiles**

**Objetivo:** Garantizar acceso controlado con gestión de credenciales automatizada.

**Funcionalidades Específicas:**

**Sistema de Login:**

- Validación de credenciales contra base de datos
- Generación de JWT para gestión de sesiones
- Redirección automática según rol de usuario
- Control de sesiones únicas (logout automático en nueva sesión)

**Recuperación de Contraseñas:**

- Endpoint de solicitud de reset con validación de whatsapp
- Generación de token temporal único (válido 1 hora)
- Envío automatizado via servicio Resend
- Interface de cambio de contraseña con token

**Gestión de Perfiles:**

- Padres: perfil de solo consulta (nombre, whatsapp, teléfono)
- Docentes: cambio obligatorio de contraseña inicial
- Selector de hijo: dropdown en header que actualiza todo el dashboard
- Dashboard diferenciado por rol con módulos específicos

**Creación de Usuarios (Administrador):**

- Scripts SQL para inserción masiva
- Proceso manual fuera de interfaz web
- Vinculación automática de relaciones padre-hijo-docente

### **Módulo 2: Carga y Consulta de Datos Académicos**

**Objetivo:** Gestión robusta de información académica con validación estricta.

**Funcionalidades de Carga:**

**Proceso de Subida de Archivos:**

**Flujo detallado:**

1. **Selección del Contexto:**
   - Usuario ingresa al módulo de carga de datos
   - Selección obligatoria de Nivel → Grado → Curso
   - Diferenciación por rol: docentes solo ven sus cursos asignados, director ve todos

2. **Subida del Archivo:**
   - Habilitación de botón de carga solo después de seleccionar contexto
   - Aceptación exclusiva de archivos con formato predefinido
   - Descarga disponible de plantilla exacta para cada tipo de datos

3. **Validación y Procesamiento:**
   - Verificación estricta de plantilla:
     - Orden de columnas fijo (sin alteraciones)
     - Nombres de columnas idénticos (sensible a mayúsculas/minúsculas)
     - Tipos de datos específicos por columna
   - Validación de estudiantes contra base de datos del curso seleccionado
   - Procesamiento inteligente:
     - Registros válidos se procesan correctamente aunque existan errores
     - Errores se reportan en archivo TXT detallado
     - Especificación exacta de fila y tipo de error para facilitar corrección

4. **Notificación de Resultados:**
   - Confirmación visual de carga exitosa
   - Descarga automática de archivo TXT con detalle de errores (si existen)
   - Activación de alertas automáticas según umbrales definidos

**Componentes de Calificación (5 fijos por trimestre):**
Plantilla de items de evaluacion por trimestre predispuestas a cambios por parte del director

1. **Examen:** Evaluación formal del trimestre
2. **Participación:** Intervenciones y actividades en clase
3. **Revisión de Cuaderno:** Control de apuntes y tareas
4. **Revisión de Libro:** Trabajo con material bibliográfico
5. **Comportamiento:** Conducta y disciplina del estudiante

**Escala de Calificación:**

- **Escala Numérica:** Sistema vigesimal (0-20)
- **Escala de Letras:** Conversión automática a niveles de desempeño
  - AD (Logro Destacado): 18-20 puntos
  - A (Logro Esperado): 14-17 puntos
  - B (En Proceso): 11-13 puntos
  - C (En Inicio): 0-10 puntos
- **Visualización:** Opción para alternar entre formato numérico y letras mediante toggle

**Estados de Calificaciones:**

- **Preliminar:** Notas en proceso, visibles pero modificables
  - Identificadas visualmente con rótulo "(Preliminar)" o color diferente
  - Disponibles para consulta por padres y docentes
- **Final:** Notas oficiales tras cierre de trimestre
  - Congeladas y publicadas como definitivas
  - Resaltadas visualmente para indicar su carácter oficial

**Proceso de Cierre de Calificaciones:**

1. Docente registra notas durante el trimestre (estado preliminar)
2. Sistema calcula automáticamente promedios por ítem y trimestre
3. Al finalizar el trimestre, docente solicita cierre de notas
4. Director aprueba el cierre, congelando las calificaciones (estado final)
5. Sistema genera boletas de notas en PDF por estudiante

**Estados de Asistencia (5 específicos):**

1. **Presente:** Asistencia completa y puntual
2. **Tardanza:** Llegada fuera de horario establecido
3. **Permiso:** Ausencia autorizada previamente
4. **Falta Justificada:** Ausencia con justificación posterior
5. **Falta Injustificada:** Ausencia sin justificación válida

**Funcionalidades de Consulta (Padres):**

- Vista de calificaciones por componentes y trimestre
- Calendario de asistencia con códigos de colores por estado
- Filtros avanzados: año académico, trimestre, curso, fecha
- Histórico multi-año con campo año_academico en base de datos

### **Módulo 3: Sistema de Alertas Automáticas Inteligentes**

**Objetivo:** Notificación inmediata y específica de eventos académicos críticos.

**Disparadores de Alertas (Post-procesamiento de archivos):**

**Alertas de Asistencia:**

1. **Tardanza Individual:** Notificación inmediata por cada tardanza registrada
2. **Falta Injustificada:** Alerta inmediata solicitando justificación
3. **Patrón de Faltas:** Alerta por 3+ faltas injustificadas consecutivas
4. **Confirmación de Presencia:** Notificación positiva de asistencia presente

**Alertas de Rendimiento:**

1. **Bajo Rendimiento Individual:** Calificación < 11 en cualquier componente
2. **Detalle Específico:** Curso, componente evaluado, fecha de registro

**Mecanismos de Entrega:**

- **Mensaje Whatsapp Inmediato:** Mensaje al Whatsapp del padre/apoderado
- **Notificación en Plataforma:** Visible al hacer login
- **Polling Durante Sesión:** Verificación cada 5 minutos
- **Panel de Historial:** Registro completo navegable

### **Módulo 4: Comunicados y Avisos Institucionales**

**Objetivo:** Canal oficial de comunicación con segmentación avanzada.

**Funcionalidades de Creación:**

- Permisos granulares por director: específicos por grado
- Editor de texto básico con preview
- Segmentación de audiencia: por grado, nivel o rol
- Programación opcional de fecha de publicación

**Gestión de Contenido:**

- Indicador visual de "editado" con timestamp
- Control de versiones básico
- Categorización por tipo (informativo, urgente, evento)
- Archive y desarchive de comunicados antiguos

**Distribución Automatizada:**

- Notificación inmediata a destinatarios específicos
- Mensaje Whattsap + notificación en plataforma
- Tracking de comunicados leídos/no leídos
- Recordatorios automáticos para comunicados urgentes

### **Módulo 5: Mensajería y Consultas con Supervisión**

**Objetivo:** Comunicación directa trazable entre actores educativos.

**Funcionalidades de Mensajería:**

- Conversaciones organizadas por estudiante específico
- Historial completo con timestamps
- Estados de mensaje: enviado, entregado, leído
- Búsqueda avanzada por contenido, fecha, participantes

**Gestión de Archivos Adjuntos:**

- **Límites Técnicos:**
    - Máximo 3 archivos por mensaje
    - Tamaño máximo: 5MB por archivo
    - Tipos permitidos: PDF, JPG, PNG únicamente
- **Almacenamiento:** Cloudinary via middleware Multer
- **Validación:** Verificación de tipo MIME y tamaño antes de subida

**Supervisión del Director:**

- Acceso completo de solo lectura a todas las conversaciones
- Vista organizada por participantes y estudiantes
- Sin capacidad de edición, eliminación o participación directa
- Panel de reportes de comunicación (frecuencia, temas, etc.)

### **Módulo 6: Encuestas con Análisis Segmentado**

**Objetivo:** Recolección estructurada de feedback institucional con segmentación de audiencias y análisis básico de resultados.

**Visualización de Encuestas:**

- Panel con encuestas activas en formato de tarjetas
- Información visible: título, descripción, fecha de vencimiento, estado (Pendiente, Respondida, Vencida), nro de vistas
- Bloqueo automático tras respuesta, con posibilidad de consultar respuestas propias
- Encuestas vencidas visibles solo como referencia histórica

**Tipos de Preguntas Soportadas:**

1. **Texto Corto:** Respuestas breves de una línea
2. **Texto Largo:** Respuestas extensas con múltiples párrafos
3. **Opción Única (radio buttons):** Selección de una sola opción entre varias
4. **Opción Múltiple (checkboxes):** Selección de varias opciones simultáneamente
5. **Escala de Satisfacción (1-5):** Valoración numérica con etiquetas descriptivas

**Gestión y Distribución:**

- Creación exclusiva por directores y docentes autorizados
- Formulario de creación con: título, descripción, público objetivo, fecha de vencimiento
- Segmentación específica: grado, nivel, rol
- Preguntas almacenadas en formato JSON
- Preview antes de publicación
- Notificación automática vía WhatsApp + plataforma a destinatarios
- Fechas de vencimiento con cierre automático
- Respuesta única no modificable

**Análisis de Resultados:**

- Panel administrativo con listado de encuestas y total de respuestas
- Visualización automática según tipo de pregunta:
  - Gráficos de barras para opción única
  - Gráficos de pastel para opción múltiple
  - Gráficos de columnas para escala 1-5
  - Listado textual para preguntas abiertas
- Acceso a resultados completos solo para el creador de la encuesta
- Conteos automáticos y porcentajes
- Análisis por segmento (grado, nivel)
- Exportación a CSV para análisis externo

### **Módulo 7: Soporte Técnico Estructurado**

**Objetivo:** Asistencia técnica organizada mediante sistema de ayuda rápida (FAQ y guías) y flujo de tickets con seguimiento y resolución formal de incidencias.

**Centro de Ayuda Rápida (FAQ):**

- Página de preguntas frecuentes organizada por categorías: Acceso, Notas, Comunicación, Mensajería, Archivos
- Cada entrada incluye pregunta y respuesta breve, accesible en un clic
- Actualización periódica por el administrador
- Reducción de carga de tickets mediante autoformación

**Guías Paso a Paso:**

- Sección "Centro de Guías" con documentos PDF explicativos
- Cada guía presentada como tarjeta con título, descripción y botón "Ver Guía"
- Documentación de procesos frecuentes (crear comunicado, responder encuesta, etc.)
- Incluye capturas de pantalla y ejemplos prácticos

**Sistema de Tickets:**

- **Registro de Solicitudes:**
  - Formulario accesible para todos los usuarios,excepto administrador
  - Campos: título, descripción detallada, categoría, adjuntos
  - Validación automática de campos obligatorios
  - Confirmación visual con tiempo estimado de respuesta

- **Categorías Detalladas:** Login, Calificaciones, Mensajes, Archivos, Navegación
- **Estados:** Pendiente, En Proceso, Resuelto
- **Prioridades:** Crítica, Alta, Normal, Baja
- Archivos adjuntos: máximo 3, 5MB c/u, formatos PDF/JPG/PNG
- SLA definidos por categoría y prioridad

**Gestión de Solicitudes:**

- **Vista de Usuario:**
  - Historial personal de tickets con estados actualizados
  - Acceso al detalle completo de cada solicitud
  - Capacidad de reabrir tickets cerrados si el problema persiste

- **Panel Administrativo:**
  - Pestañas por estado (Nuevas, En proceso, Resueltas)
  - Tarjetas horizontales con datos resumidos del ticket
  - Botones de acción dinámicos según estado
  - Conversación completa por ticket
  - Notificación automática al usuario por WhatsApp + plataforma
  - Métricas de satisfacción por resolución

---

## 5. REGLAS DE NEGOCIO CONSOLIDADAS

### 5.1 Reglas de Acceso y Seguridad

| ID | Regla | Descripción |
| --- | --- | --- |
| RN-01 | Autenticación obligatoria | Solo acceso mediante login, sin registro público |
| RN-02 | Creación de usuarios externa | Solo administrador crea cuentas via scripts de BD |
| RN-03 | Segmentación por rol | Acceso limitado a funciones correspondientes al rol |
| RN-04 | Acceso familiar único | Un padre con una cuenta accede a todos sus hijos vía dropdown |
| RN-05 | Apoderado principal único | Solo un apoderado principal por estudiante |
| RN-06 | Sesiones únicas | Un usuario solo puede tener una sesión activa |
| RN-07 | Cambio de contraseña inicial | Docentes deben cambiar contraseña en primer login |
| RN-08 | Recuperación automatizada | Reset de contraseña por whatsapp con token temporal |
| RN-08 | Transmisión segura obligatoria | Todo intercambio de datos entre cliente y servidor debe realizarse mediante HTTPS (TLS 1.2 o superior) para garantizar confidencialidad e integridad. |

### 5.2 Reglas de Carga de Datos Académicos

| ID | Regla | Descripción |
| --- | --- | --- |
| RN-09 | Plantilla exacta obligatoria | Orden de columnas y nombres deben ser idénticos |
| RN-10 | Contexto previo requerido | Selección de nivel/grado/curso antes de subir archivo |
| RN-11 | Procesamiento inteligente | Procesar válidos, reportar errores en archivo TXT |
| RN-12 | Permisos diferenciados | Docentes: sus cursos / Director: todos los cursos |
| RN-13 | Componentes fijos de calificación | 5 componentes por trimestre sin excepción |
| RN-14 | Estados específicos de asistencia | 5 estados únicamente, registro por día completo |
| RN-15 | Histórico multi-año | Todos los datos incluyen campo año_academico |

### 5.3 Reglas de Alertas y Notificaciones

| ID | Regla | Descripción |
| --- | --- | --- |
| RN-16 | Alertas post-procesamiento | Generación inmediata tras carga exitosa de archivos |
| RN-17 | Umbrales específicos | Nota < 11 / 3+ faltas injustificadas consecutivas |
| RN-18 | Notificación de tardanzas | Alerta inmediata por cada tardanza registrada |
| RN-19 | Confirmación de presencia | Notificación positiva de asistencia presente |
| RN-20 | Solo padres reciben alertas | Docentes/director ven en dashboard, no reciben alertas |
| RN-21 | Doble canal de notificación | WhatsApp + notificación en plataforma |
| RN-22 | Polling activo | Verificación cada 5 minutos durante sesión |
| RN-23 | Notificaciones externas | WhatsApp solo si usuario está fuera del sistema |

### 5.4 Reglas de Archivos Adjuntos

| ID | Regla | Descripción |
| --- | --- | --- |
| RN-24 | Tipos estrictamente limitados | Solo PDF, JPG, PNG en mensajes y tickets |
| RN-25 | Límite de tamaño individual | Máximo 5MB por archivo |
| RN-26 | Cantidad máxima por mensaje | Máximo 3 archivos por mensaje/ticket |
| RN-27 | Almacenamiento en nube | Todos los archivos via Cloudinary + Multer |
| RN-28 | Validación pre-subida | Verificación MIME y tamaño antes de procesamiento |

### 5.5 Reglas de Comunicación y Supervisión

| ID | Regla | Descripción |
| --- | --- | --- |
| RN-29 | Permisos granulares docentes | Crear comunicados/encuestas según grados asignados |
| RN-30 | Supervisión completa director | Lectura de todos los mensajes sin edición |
| RN-31 | Conversaciones por estudiante | Mensajes agrupados por estudiante específico |
| RN-32 | Respuesta única en encuestas | No modificación después de envío |
| RN-33 | Segmentación obligatoria | Comunicados/encuestas deben especificar audiencia |

---

### 5.6 Reglas de Calificaciones y Evaluación

| ID | Regla | Descripción |
| --- | --- | --- |
| RN-34 | Estructura única de evaluación | Director define estructura válida para todo el colegio |
| RN-35 | Máximo de ítems | Límite de 5 componentes de evaluación por trimestre |
| RN-36 | Ponderación global | Pesos definidos por director, suma total 100% |
| RN-37 | Escala de calificación dual | Numérica (0-20) con conversión automática a letras (AD,A,B,C) |
| RN-38 | Estados de calificaciones | Preliminar (modificable) y Final (congelada) |
| RN-39 | Cierre de trimestre | Solo director puede aprobar cierre y congelar calificaciones |
| RN-40 | Boletas de notas | Generación automática de PDF por estudiante al cierre |

---

## 6. ARQUITECTURA TÉCNICA DEFINIDA

### 6.1 Stack Tecnológico Confirmado

**Frontend (Mobile-First):**

- **Vite + React + Tailwind CSS**
- Progressive Web App (PWA) capabilities
- Diseño responsive con prioridad móvil
- Single Page Application con React Router

**Backend:**

- Node.js + Express.js
- API REST con autenticación JWT
- Middleware Multer para manejo de archivos


**Patron:**
- MVC (Para Frontend y Backend)

**Base de Datos:**

- **PostgreSQL en Neon** (servicio en nube)
- Diseño multi-año con campos año_academico
- Índices optimizados para consultas frecuentes
- Respaldos automáticos diarios

**Almacenamiento:**

- Cloudinary para archivos adjuntos
- Integración vía Multer

**Deploy y Hosting:**

- **Frontend:** Render/Railway con build automático
- **Backend:** Render/Railway con variables de entorno
- **Base de Datos:** Neon PostgreSQL con SSL

**Servicios Externos:**

- **Cloudinary:** Almacenamiento de archivos adjuntos
- **Neon:** Hosting de base de datos PostgreSQL
- **Meta WhatsApp Cloud API** Mensajes a WhatsApp

### 6.2 Arquitectura de Notificaciones Híbrida Detallada

**Arquitectura híbrida, defensiva y escalable sin complejidad excesiva**

**Nivel 1 - Notificaciones en plataforma:**

- **Mecanismo:** Al iniciar sesión, el sistema consulta la base de datos y muestra notificaciones acumuladas
- Durante la sesión activa, se realiza un *polling ligero* cada 5 minutos para detectar nuevos eventos
- **Ventajas:** Fácil implementación, no requiere WebSockets, mantiene al usuario informado sin saturar el servidor
- **Ideal para:** Padres que revisan el sistema 1-2 veces al día

**Nivel 2 - Notificaciones por WhatsApp (eventos críticos):**

- **Mecanismo:** Envío de mensaje por WhatsApp para eventos importantes:
  - Inasistencia del estudiante
  - Observación de conducta
  - Nueva calificación
  - Mensaje directo del docente
- **Implementación:** Vía API oficial (Meta Business API)
- **Contenido:** Texto breve con título y enlace directo al sistema
- **Ventajas:** Asegura trazabilidad fuera de la plataforma, no depende de que el padre esté conectado
- **Ideal para:** Alertas que requieren atención inmediata

**Nivel 3 - Panel de historial de notificaciones:**

- **Mecanismo:** Panel donde cada usuario puede ver todas sus notificaciones pasadas
- **Filtros:** Por tipo, fecha y estudiante
- **Ventajas:** Refuerza la trazabilidad, permite revisar eventos anteriores, facilita auditoría
- **Ideal para:** Revisión mensual, reuniones con padres, seguimiento académico

**Ficha técnica resumida:**

| Componente | Tipo | Frecuencia | Complejidad | Narrativa UX |
| --- | --- | --- | --- | --- |
| Notificación al login | Plataforma | 1 vez por sesión | Baja | Inicio claro y editorializado |
| Polling cada 5 min | Plataforma | Durante sesión | Media | Flujo continuo sin saturación |
| WhatsApp por evento crítico | Externo (API) | Según evento | Baja | Inmediatez y trazabilidad externa |
| Historial de notificaciones | Plataforma | Permanente | Media | Revisión y auditoría |

### 6.3 Flujo de Datos Académicos Completo

**Carga por Docente/Director:**

1. **Roles y Permisos:**
   - **Docente:** Solo puede subir archivos para cursos asignados a su perfil
   - **Director:** Acceso total a todos los cursos/secciones de la institución

2. **Flujo Completo:**
   - **Selección del Contexto:** Nivel → Grado → Curso (obligatorio)
   - **Validación de Plantilla:** Verificación estricta de formato exacto
   - **Procesamiento Inteligente:** Válidos procesados, errores reportados
   - **Generación de Alertas:** Evaluación inmediata de umbrales configurados
   - **Notificación Dual:** WhatsApp + plataforma a padres afectados
   - **Reporte de Resultados:** Archivo TXT con detalle específico de errores

3. **Restricciones de Plantillas:**
   - Formato exacto obligatorio (mismo orden y nombres de columnas)
   - Documentación disponible en Centro de Guías
   - Plantillas descargables por tipo de datos (notas/asistencia)

**Consulta por Padres:**

1. **Selección de Hijo:** Via dropdown en header
2. **Vista de Calificaciones:** 5 componentes por trimestre
3. **Vista de Asistencia:** Calendario con 5 estados visuales
4. **Filtros Dinámicos:** Año académico, trimestre, curso, fecha
5. **Histórico Completo:** Acceso a datos de años anteriores

---

## 8. BACKUP Y RECUPERACIÓN DE DATOS

### 8.1 Estrategia de Backup

**Backups Automáticos Diarios:**

- Configuración en servicio de PostgreSQL (Neon)
- Backup diario automático con redundancia en nube
- Retención de 30 días mínimo

**Exportación Manual:**

- Script de exportación ejecutable por administrador
- Formato estándar (SQL/CSV) para migración futura
- Documentado en herramientas de administración

### 8.2 Recuperación ante Fallos

**Proceso de Restauración:**

- Restauración desde backup más reciente
- Tiempo de recuperación objetivo: < 1 hora
- Procedimiento documentado para equipo técnico

---

## 9. CRITERIOS DE ACEPTACIÓN GENERALES 

### 9.1 Criterios Técnicos

- Sistema responsive funcional en móviles y desktop
- Contraseñas encriptadas con bcrypt en base de datos
- Tiempo de carga < 3 segundos para cualquier pantalla
- Manejo de hasta 150 usuarios concurrentes (estimado real para institución)
- Archivos adjuntos limitados a 5MB, tipos PDF/JPG/PNG
- Todo tráfico entre frontend, backend y servicios externos se debe realizar mediante protocolo seguro HTTPS con certificado válido.

### 9.2 Criterios Funcionales

- Acceso segmentado por rol sin excepciones
- Notificaciones automáticas inmediatas post-procesamiento de datos
- Padres ven solo información de sus hijos matriculados
- Comunicados editados muestran indicador "editado"
- Supervisión completa del director sobre mensajería

### 9.3 Criterios de Usabilidad

- Interfaz mobile-first intuitiva para usuarios sin experiencia técnica
- Cualquier función principal accesible en máximo 3 clics
- Feedback claro para todas las acciones del usuario
- Selector fácil para padres con múltiples hijos

---

## 10. FUNCIONALIDADES CLAVE Y FUTURAS

### 10.1 Generación de Boletas de Notas en PDF

**Objetivo:** Proporcionar documentos oficiales descargables e imprimibles con el rendimiento académico del estudiante.

**Proceso de Generación:**

1. **Activación:** Automática al cierre de cada trimestre por el director
2. **Formato:** PDF estandarizado con diseño institucional
3. **Contenido:**
   - Datos del estudiante y periodo académico
   - Tabla de calificaciones por curso con los 5 componentes
   - Promedios por trimestre y anuales
   - Estado (Aprobado/Desaprobado) por curso
   - Escala de calificación dual (numérica y letras)
   - Firma digital del director
4. **Acceso:** Disponible para descarga desde el perfil del estudiante
5. **Historial:** Almacenamiento permanente de todas las boletas generadas

**Beneficios:**

- Formalización del proceso de evaluación
- Reducción de impresiones innecesarias (solo cuando se requiera)
- Acceso permanente al historial académico
- Facilidad para compartir con otros miembros de la familia

### 10.2 Funcionalidades Futuras (Post-MVP)

- Dashboard directivo con métricas avanzadas
- Reportes estadísticos exportables (PDF/Excel)
- Análisis estadístico avanzado de encuestas
- Notificaciones push/WebSockets en tiempo real
- Integración automática con sistemas académicos externos
- Gestión de permisos con fechas de vencimiento
- Comentarios a comunicados

---

## 11. CONSIDERACIONES DE ESCALABILIDAD

### 11.1 Números Institucionales Reales

- **Estudiantes:** Aproximadamente 400-500
- **Padres:** Aproximadamente 350-400 usuarios únicos
- **Docentes:** Aproximadamente 25-30
- **Personal administrativo:** 3-5 usuarios

**Total estimado:** 400-450 usuarios registrados máximo
**Concurrencia real estimada:** 50-100 usuarios simultáneos en horarios pico

### 11.2 Arquitectura Preparada para Crecimiento

- Base de datos multi-año con campos de año_academico
- Estructura modular permite agregar funcionalidades
- Stack tecnológico escalable (Node.js + PostgreSQL + Nube)
- Almacenamiento de archivos en servicio especializado (Cloudinary)