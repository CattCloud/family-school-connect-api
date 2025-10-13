# **Historia de Usuario Detallada - HU-MSG-00**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Padres y docentes que participan en conversaciones
2. **estudiantes** - Estudiantes relacionados con las conversaciones
3. **conversaciones** - Agrupa mensajes entre usuarios específicos
4. **mensajes** - Mensajes individuales dentro de conversaciones
5. **archivos_adjuntos** - Archivos asociados a mensajes
6. **cursos** - Cursos que contextualizan las conversaciones
7. **asignaciones_docente_curso** - Determina qué conversaciones puede ver cada docente

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Usuarios creados y vinculados

### **Roles Involucrados:**

- **Padre:** Ve conversaciones de sus hijos con docentes
- **Docente:** Ve conversaciones de estudiantes de sus cursos asignados

---

## **HU-MSG-00 — Bandeja de Mensajería**

**Título:** Vista principal de gestión de conversaciones tipo Gmail

**Historia:**

> Como padre/docente, quiero acceder a una bandeja organizada con mis conversaciones (recibidas y enviadas) para gestionar fácilmente mi comunicación con la institución educativa y dar seguimiento a los mensajes importantes.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Mensajería" desde el dashboard principal mediante botón destacado en menú lateral
- **CA-02:** La interfaz principal está dividida en **2 secciones** (layout tipo Gmail):
    
    **SECCIÓN IZQUIERDA: Sidebar de Navegación**
    
    - Botón principal **"📝 Nuevo Mensaje"** (destacado, color primario)
        - **Padre:** Botón habilitado, redirige a HU-MSG-01
        - **Docente:** Botón deshabilitado visualmente (gris) con tooltip: "Solo puedes responder mensajes iniciados por padres"
    - **Pestañas de filtrado:**
        - 📥 **Recibidos** - Conversaciones con mensajes entrantes
        - 📤 **Enviados** - Conversaciones iniciadas por el usuario
        - 📋 **Todos** - Vista combinada (opción por defecto)
    - **Badge con contador** de mensajes no leídos (número rojo en esquina superior derecha del ícono 📥)
    - **Buscador** con campo de texto:
        - Placeholder: "Buscar conversaciones..."
        - Búsqueda en tiempo real (debounce 300ms)
        - Filtra por: nombre del destinatario, asunto, contenido de mensajes
    
    **SECCIÓN DERECHA: Lista de Conversaciones**
    
    - **Vista principal:** Lista vertical scrollable con tarjetas de conversación
    - **Cada tarjeta muestra:**
        - **Avatar circular** del otro usuario (inicial del nombre si no hay foto)
        - **Nombre completo** del destinatario (padre o docente)
        - **Curso relacionado** (badge pequeño): Ej. "Matemáticas - 5to Primaria"
        - **Estudiante relacionado** (solo visible para padre con múltiples hijos): Ej. "Sobre: Juan Pérez"
        - **Asunto** de la conversación (máx 50 caracteres, truncado con "...")
        - **Último mensaje:** Preview del contenido (máx 80 caracteres)
        - **Fecha/Hora** del último mensaje:
            - Si es hoy: "HH:MM" (Ej: "14:30")
            - Si es ayer: "Ayer"
            - Otros días: "DD/MM/YYYY"
        - **Estado visual:**
            - **No leído:** Fondo blanco, texto en negrita, punto azul a la izquierda
            - **Leído:** Fondo gris claro, texto normal
        - **Indicador de archivos adjuntos:** Ícono 📎 si el último mensaje tiene adjuntos (Libreria Lucide React)
- **CA-03:** Ordenamiento de conversaciones:
    - Por defecto: **Fecha del último mensaje (más reciente primero)**
    - Conversaciones con mensajes no leídos aparecen siempre al inicio
    - Selector de ordenamiento alternativo:
        - "Más reciente"
        - "Más antigua"
        - "Por estudiante (A-Z)" (solo para docentes)
- **CA-04:** Filtros específicos por rol:
    
    **Para Padre:**
    
    - **Filtro por hijo:** Dropdown en header global (ya existente)
        - Al cambiar de hijo, se recargan conversaciones correspondientes
    - **Filtro por docente:** Dropdown con lista de docentes que enseñan al hijo seleccionado
    - **Filtro por curso:** Dropdown con cursos del hijo seleccionado
    
    **Para Docente:**
    
    - **Filtro por estudiante:** Dropdown con lista de estudiantes de sus cursos asignados
    - **Filtro por curso:** Dropdown con cursos que enseña
    - **Filtro por grado:** Dropdown con grados en los que tiene cursos asignados
- **CA-05:** Interacciones con conversaciones:
    - **Click en tarjeta:** Abre la conversación completa (HU-MSG-03)
    - **Hover:** Fondo ligeramente más oscuro, cursor pointer
    - **Marcar como leída/no leída:** Botón de tres puntos (⋮) con menú contextual:
        - "Marcar como leída" / "Marcar como no leída"
        - "Cerrar conversación" (cambia estado a `cerrada`, se archiva)
- **CA-06:** Estado vacío:
    - Si no hay conversaciones: Ilustración SVG + mensaje:
        - **Padre:** "No tienes conversaciones aún. Inicia una nueva para comunicarte con los docentes."
        - **Docente:** "No tienes conversaciones pendientes. Los padres pueden contactarte desde su panel."
    - Botón "📝 Nuevo Mensaje" (solo habilitado para padres)
- **CA-07:** Paginación y carga:
    - **Lazy loading:** Cargar 20 conversaciones iniciales
    - Al hacer scroll al final: Cargar siguiente lote de 20 automáticamente
    - Indicador de carga: Spinner al final de la lista
    - Si no hay más conversaciones: Mensaje "No hay más conversaciones"
- **CA-08:** Actualización en tiempo real:
    - **Polling cada 30 segundos** para verificar nuevos mensajes
    - Si hay nuevos mensajes:
        - Actualizar badge de contador
        - Mostrar notificación toast: "Nuevo mensaje de [Nombre]"
        - Reproducir sonido de notificación (opcional, configurable por usuario)
        - Agregar conversación al inicio de la lista (si es nuevo) o moverla al inicio (si existía)
- **CA-09:** Responsive design:
    - **Desktop (>1024px):** Sidebar fijo + lista a la derecha (layout de 2 columnas)
    - **Tablet (768px-1024px):** Sidebar colapsable con hamburger menu
    - **Mobile (<768px):** Vista única, sidebar se oculta, aparece botón flotante "+" para nuevo mensaje

---

### **Validaciones de Negocio**

- **VN-01:** Solo padres pueden ver conversaciones de sus hijos matriculados
- **VN-02:** Solo docentes pueden ver conversaciones de estudiantes de sus cursos asignados
- **VN-03:** Las conversaciones cerradas no aparecen en vista principal (se archivan)
- **VN-04:** Conversaciones sin mensajes (huérfanas) no se muestran
- **VN-05:** El contador de no leídos solo cuenta mensajes donde el usuario actual es el destinatario
- **VN-06:** Al cambiar de hijo (padre con múltiples hijos), el estado de filtros se resetea

---

### **UI/UX**

- **UX-01:** Layout tipo Gmail con sidebar izquierdo fijo y panel principal scrollable:
    
    ```
    ┌─────────────────────────────────────────────────┐
    │              HEADER GLOBAL                      │
    │  [Logo] [Selector hijo ▼] [Notificaciones] [👤] │
    ├────────────┬────────────────────────────────────┤
    │  SIDEBAR   │     LISTA DE CONVERSACIONES        │
    │            │  ┌──────────────────────────────┐  │
    │ 📝 Nuevo   │  │ [Avatar] Nombre Docente      │  │
    │  Mensaje   │  │ Matemáticas - 5to Primaria   │  │
    │            │  │ Asunto: Consulta sobre...    │  │
    │ 📥 Recibidos│  │ Último msg: Gracias por...   │  │
    │    (5)     │  │ 14:30                    📎  │  │
    │            │  └──────────────────────────────┘  │
    │ 📤 Enviados │  ┌──────────────────────────────┐  │
    │            │  │ [Avatar] María González      │  │
    │ 📋 Todos   │  │ Comunicación - 5to Primaria  │  │
    │            │  │ Asunto: Tarea pendiente      │  │
    │ 🔍 Buscar  │  │ Último msg: Entendido, lo... │  │
    │ [________] │  │ Ayer                         │  │
    │            │  └──────────────────────────────┘  │
    └────────────┴────────────────────────────────────┘
    
    ```
    
- **UX-02:** Diseño de tarjetas de conversación:
    - **Altura:** 100px fija
    - **Padding:** 16px
    - **Separación:** 8px entre tarjetas
    - **Border-radius:** 8px
    - **Sombra sutil:** `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`
    - **Hover:** Sombra más pronunciada + escala 1.01
    - **No leído:** Borde izquierdo azul de 4px
- **UX-03:** Estados visuales claros:
    - **No leído:**
        - Fondo: `bg-white`
        - Texto: `font-semibold`
        - Punto azul: `🔵` a la izquierda del avatar
    - **Leído:**
        - Fondo: `bg-gray-50`
        - Texto: `font-normal`
        - Sin punto de color
- **UX-04:** Botón "Nuevo Mensaje" destacado:
    - **Padre:** Color primario (púrpura), con ícono ✍️, texto "Nuevo Mensaje"
    - **Docente:** Gris claro, deshabilitado, tooltip al hover
    - Posición: Fijo en parte superior del sidebar
    - **Mobile:** Botón flotante circular en esquina inferior derecha
- **UX-05:** Filtros con diseño limpio:
    - Dropdowns con íconos descriptivos
    - Filtros aplicados se muestran como chips removibles debajo del buscador
    - Botón "Limpiar filtros" si hay al menos 1 filtro activo
- **UX-06:** Animaciones suaves:
    - Transición al hacer hover en tarjetas: `transition: all 0.2s ease`
    - Aparición de nuevas conversaciones: Fade-in desde arriba
    - Scroll suave al cargar más conversaciones

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar las 20 conversaciones más recientes con spinner
- **EF-02:** Estado cargado: Mostrar lista completa con scroll habilitado
- **EF-03:** Estado vacío: Ilustración + mensaje según rol
- **EF-04:** Estado de búsqueda: Filtrar conversaciones en tiempo real mientras se escribe
- **EF-05:** Estado de filtros aplicados: Recarga de lista según filtros seleccionados
- **EF-06:** Estado de actualización: Polling activo cada 30s sin bloquear UI
- **EF-07:** Estado de nueva conversación: Toast de notificación + badge actualizado

---

### **Validaciones de Entrada**

- **VE-01:** Búsqueda debe tener mínimo 2 caracteres para activarse
- **VE-02:** Filtros son opcionales, por defecto muestra "Todos"
- **VE-03:** Al cambiar filtros, resetear paginación a página 1

---

### **Mensajes de Error**

- "No se pudieron cargar las conversaciones. Verifica tu conexión."
- "No se encontraron conversaciones con ese criterio de búsqueda."
- "Error al marcar como leída. Intenta nuevamente."
- "No tienes permisos para ver esta conversación."

---

### **Mensajes de Éxito**

- "✅ Conversación marcada como leída"
- "✅ Conversación cerrada correctamente"
- "📬 Nuevo mensaje de [Nombre Docente/Padre]"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación como padre/docente)
    - HU-USERS-04 (Usuarios creados y vinculados)
- **HU Siguientes:**
    - HU-MSG-01 (Enviar nuevo mensaje - Padre)
    - HU-MSG-03 (Ver conversación completa)
    - HU-MSG-04 (Notificaciones de nuevos mensajes)

---

### **Componentes y Estructura**

- **Tipo:** Página principal completa (`/dashboard/mensajeria`)
- **Componentes principales:**
    - `MensajeriaBandeja`: Componente contenedor principal
    - `MensajeriaSidebar`: Sidebar con navegación y filtros
    - `NuevoMensajeButton`: Botón de nueva conversación (condicional por rol)
    - `ConversacionesList`: Lista scrollable de conversaciones
    - `ConversacionCard`: Tarjeta individual de conversación
    - `BuscadorConversaciones`: Campo de búsqueda con debounce
    - `FiltrosDropdowns`: Selectores de filtros por rol
    - `EmptyState`: Estado vacío con ilustración
    - `NotificacionToast`: Toast de nuevos mensajes
- **Endpoints API:**
    - `GET /conversaciones?usuario_id={id}&rol={rol}&page={page}&limit={limit}` - Lista de conversaciones paginadas
    - `GET /conversaciones/search?query={query}&usuario_id={id}` - Búsqueda de conversaciones
    - `GET /conversaciones/filtros?usuario_id={id}&estudiante_id={id}&curso_id={id}` - Conversaciones filtradas
    - `PATCH /conversaciones/:id/marcar-leida` - Marcar conversación como leída
    - `PATCH /conversaciones/:id/cerrar` - Cerrar/archivar conversación
    - `GET /conversaciones/no-leidas/count?usuario_id={id}` - Contador de mensajes no leídos
    - `GET /conversaciones/actualizaciones?usuario_id={id}&ultimo_check={timestamp}` - Polling de nuevos mensajes

---

# **Historia de Usuario Detallada - HU-MSG-01**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Padre que envía y docente que recibe
2. **estudiantes** - Estudiante relacionado con la conversación
3. **conversaciones** - Nueva conversación o continuación de existente
4. **mensajes** - Mensaje enviado con contenido y adjuntos
5. **archivos_adjuntos** - Archivos asociados al mensaje (máx 3)
6. **cursos** - Curso que contextualiza la conversación
7. **asignaciones_docente_curso** - Determina qué docentes pueden recibir mensajes
8. **notificaciones** - Alerta generada al docente

### **Roles Involucrados:**

- **Padre:** Único rol que puede iniciar conversaciones en MVP

## **HU-MSG-01 — Enviar Nuevo Mensaje (Padre)**

**Título:** Iniciar conversación con docente mediante wizard de 2 pasos

**Historia:**

> Como padre de familia, quiero enviar mensajes con archivos adjuntos a los docentes de mi hijo para comunicar situaciones específicas, hacer consultas académicas y adjuntar evidencias cuando sea necesario.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al formulario desde dos puntos:
    - Botón **"📝 Nuevo Mensaje"** en sidebar de HU-MSG-00
    - Botón flotante **"+"** en versión móvil
    - Al hacer clic, redirige a `/dashboard/mensajeria/nuevo`
- **CA-02:** La interfaz está diseñada como **Wizard de 2 pasos** con barra de progreso visual:
    
    **PASO 1: Selección de Destinatario y Contexto**
    
    - **Título de página:** "Nuevo Mensaje"
    - **Select "Hijo":** (Pre-seleccionado del header global)
        - Muestra: Nombre completo + Grado (Ej: "Juan Pérez - 5to Primaria")
    - **Select "Curso":**
        - Lista de cursos del hijo seleccionado
        - Formato: "Nombre del Curso - Grado" (Ej: "Matemáticas - 5to Primaria")
        - Ordenado alfabéticamente
        - Solo cursos con docentes asignados activos
    - **Select "Docente":**
        - Se carga dinámicamente según el curso seleccionado
        - Muestra: Nombre completo del docente (Ej: "Prof. María González")
        - Si un curso tiene múltiples docentes (varios paralelos): Muestra todos
            - Si solo tiene un docente, se autoselecciona el unico docente
        - Solo docentes con `estado_activo = true`
    - **Input "Asunto":**
        - Campo de texto de una línea
        - Placeholder: "Ej: Consulta sobre tarea de matemáticas"
        - Mínimo: 10 caracteres
        - Máximo: 200 caracteres
        - Contador de caracteres visible: "XX/200"
        - Validación en tiempo real con mensaje de error si está fuera de rango
    - **Botón "Continuar":**
        - Habilitado solo cuando todos los campos están completos y válidos
        - Color primario (púrpura), texto blanco
        - Al hacer clic: Transición suave al Paso 2
    - **Botón "Cancelar":**
        - Secundario (gris), borde outline
        - Muestra modal de confirmación: "¿Seguro que deseas cancelar? Se perderá la información ingresada."
        - Opciones: "Sí, cancelar" (rojo) | "No, continuar editando" (gris)
    
    **PASO 2: Redacción de Mensaje y Adjuntos**
    
    - **Resumen del contexto** (no editable, solo lectura):
        - Badge pequeño con: "Para: [Docente] | Curso: [Curso] | Sobre: [Hijo]"
        - Botón "✏️ Editar" para volver al Paso 1
    - **Textarea "Mensaje":**
        - Campo de texto multilínea expandible
        - Placeholder: "Escribe tu mensaje aquí..."
        - Mínimo: 10 caracteres
        - Máximo: 1000 caracteres
        - Contador de caracteres: "XX/1000"
        - Altura inicial: 150px
        - Auto-resize al escribir (max-height: 400px)
    - **Sección "Adjuntar Archivos":**
        - Componente de **drag & drop** con área destacada:
            - Texto: "📎 Arrastra tus archivos aquí o haz clic para seleccionar"
            - Zona punteada con animación al arrastrar archivo
        - Botón alternativo: "Examinar archivos" (para usuarios sin experiencia en drag & drop)
        - **Validaciones en tiempo real:**
            - Tipos permitidos: **PDF, JPG, PNG** únicamente
            - Tamaño máximo: **5MB por archivo**
            - Cantidad máxima: **3 archivos**
        - **Vista previa de archivos adjuntos:**
            - Lista de archivos cargados con:
                - Ícono según tipo (📄 PDF, 🖼️ JPG/PNG) (Libreria Lucide React)
                - Nombre del archivo (truncado si es muy largo)
                - Tamaño del archivo (Ej: "2.3 MB")
                - Botón "❌" para eliminar archivo
            - Si se alcanza el límite de 3 archivos: Área de carga se deshabilita visualmente
    - **Botón "Enviar Mensaje":**
        - Color primario (púrpura), texto blanco, ícono ✉️
        - Habilitado solo si el mensaje tiene mínimo 10 caracteres
        - Al hacer clic: Mostrar spinner en el botón + texto "Enviando..."
        - Deshabilitar botón durante el envío
    - **Botón "Atrás":**
        - Vuelve al Paso 1 manteniendo datos ingresados
        - Secundario (gris outline)
- **CA-03:** Proceso de envío y validaciones:
    - **Validación frontend:**
        - Verificar que todos los campos obligatorios están completos
        - Validar tipo MIME de archivos antes de subida
        - Validar tamaño de archivos antes de subida
        - Mostrar errores específicos por campo si fallan validaciones
    - **Subida de archivos a Cloudinary:**
        - Usar middleware Multer para procesar archivos
        - Subir archivos uno por uno con barra de progreso:
            - "Subiendo archivo 1 de 3... 45%"
        - Generar URL de Cloudinary por cada archivo
        - Almacenar metadatos en tabla `archivos_adjuntos`
    - **Validación backend:**
        - Verificar que el hijo pertenece al padre autenticado
        - Verificar que el docente está asignado al curso seleccionado
        - Verificar tipo MIME y tamaño de archivos
        - Validar que no existen más de 3 archivos adjuntos
- **CA-04:** Comportamiento según conversación existente:
    - **Si NO existe conversación previa** entre ese padre-docente-estudiante-curso:
        - Crear nueva conversación en tabla `conversaciones`:
            
            ```sql
            INSERT INTO conversaciones (
              estudiante_id, padre_id, docente_id, asunto,
              estado, fecha_inicio, fecha_ultimo_mensaje,
              año_academico, tipo_conversacion, creado_por
            ) VALUES (
              ?, ?, ?, ?,
              'activa', NOW(), NOW(),
              2025, 'padre_docente', ?
            );
            
            ```
            
        - Crear primer mensaje en tabla `mensajes`:
            
            ```sql
            INSERT INTO mensajes (
              conversacion_id, emisor_id, contenido,
              fecha_envio, estado_lectura, tiene_adjuntos
            ) VALUES (
              ?, ?, ?,
              NOW(), 'enviado', ?
            );
            
            ```
            
    - **Si YA existe conversación previa:**
        - Verificar si el asunto es diferente al actual
        - Si el asunto es diferente: Modal de confirmación:
            - "Ya existe una conversación con este docente sobre [Hijo]. ¿Deseas continuar la conversación existente o crear una nueva?"
            - Opciones: "Continuar existente" | "Crear nueva"
        - Si el asunto es igual: Agregar mensaje al hilo existente
        - Actualizar `fecha_ultimo_mensaje` en tabla `conversaciones`
- **CA-05:** Almacenamiento de archivos adjuntos:
    - Insertar registros en tabla `archivos_adjuntos`:
        
        ```sql
        INSERT INTO archivos_adjuntos (
          mensaje_id, nombre_original, nombre_archivo,
          url_cloudinary, tipo_mime, tamaño_bytes,
          fecha_subida, subido_por
        ) VALUES (
          ?, ?, ?,
          ?, ?, ?,
          NOW(), ?
        );
        
        ```
        
    - Actualizar campo `tiene_adjuntos = true` en tabla `mensajes`
- **CA-06:** Generación de notificaciones automáticas:
    - Crear registro en tabla `notificaciones`:
        
        ```sql
        INSERT INTO notificaciones (
          usuario_id, tipo, titulo, contenido,
          canal, estado_plataforma, fecha_creacion,
          url_destino, estudiante_id, año_academico
        ) VALUES (
          docente_id, 'mensaje', 'Nuevo mensaje de [Padre]', contenido_mensaje,
          'ambos', 'pendiente', NOW(),
          '/dashboard/mensajeria/conversacion/{id}', estudiante_id, 2025
        );
        
        ```
        
    - **Envío de notificación WhatsApp:**
        - Formato del mensaje:
            
            ```
            📬 Nuevo mensaje de [Nombre Padre]
            Sobre: [Nombre Estudiante]
            Curso: [Nombre Curso]
            Asunto: [Asunto]
            
            Mensaje: [Primeros 100 caracteres...]
            
            📱 Ver mensaje completo: [URL]
            
            ```
            
        - Enviar mediante Meta WhatsApp Cloud API
        - Actualizar `estado_whatsapp` en tabla `notificaciones`
    - **Notificación en plataforma:**
        - Badge en campana de notificaciones del docente
        - Toast notification si el docente está en sesión activa
- **CA-07:** Feedback después del envío:
    - Modal de confirmación con animación de éxito:
        - Ícono: ✅ (verde)
        - Título: "¡Mensaje enviado correctamente!"
        - Contenido: "Tu mensaje ha sido enviado a [Docente]. Recibirás una notificación cuando te responda."
        - Botón: "Ver conversación" (redirige a HU-MSG-03)
        - Botón: "Volver a bandeja" (redirige a HU-MSG-00)
    - Actualizar bandeja de mensajería (agregar nueva conversación al inicio)
    - Limpiar formulario completamente

---

### **Validaciones de Negocio**

- **VN-01:** Solo padres autenticados pueden enviar mensajes
- **VN-02:** Un padre solo puede enviar mensajes sobre sus hijos matriculados
- **VN-03:** Solo puede enviar mensajes a docentes con cursos asignados activos del hijo seleccionado
- **VN-04:** El asunto debe tener entre 10 y 200 caracteres
- **VN-05:** El mensaje debe tener entre 10 y 1000 caracteres
- **VN-06:** Máximo 3 archivos adjuntos por mensaje
- **VN-07:** Tamaño máximo por archivo: 5MB
- **VN-08:** Tipos de archivo permitidos: PDF, JPG, PNG (validación MIME estricta)
- **VN-09:** Si existe conversación previa con mismo contexto y asunto diferente, solicitar confirmación
- **VN-10:** Todos los archivos deben subirse exitosamente a Cloudinary antes de crear el mensaje

---

### **UI/UX**

- **UX-01:** Wizard visual de **2 pasos** con barra de progreso:
    
    ```
    ┌─────────────────────────────────────────────┐
    │    [1] Destinatario  ━━━  [2] Mensaje       │
    │        ●━━━━━━━━━━━━━━━━━━○                 │
    └─────────────────────────────────────────────┘
    
    ```
    
    - Paso actual resaltado en color primario
    - Paso completado con check verde ✓
    - Paso pendiente en gris claro
- **UX-02:** Diseño del Paso 1 (Selección):
    - Layout de formulario vertical con espaciado consistente
    - Campos agrupados en tarjeta con sombra sutil
    - Labels con asterisco rojo (*) para campos obligatorios
    - Dropdowns con iconos descriptivos:
        - 👨‍🎓 Hijo
        - 📚 Curso
        - 👨‍🏫 Docente
    - Asunto con contador de caracteres en tiempo real
    - Transición suave entre pasos (slide animation)
- **UX-03:** Diseño del Paso 2 (Redacción):
    - Resumen del contexto en badge destacado (fondo azul claro, texto azul oscuro)
    - Textarea con borde redondeado y foco visual claro
    - Área de drag & drop destacada:
        - Borde punteado (dashed) en estado normal
        - Fondo azul claro al arrastrar archivo sobre la zona
        - Animación de "pulse" al soltar archivo
    - Vista previa de archivos con diseño de lista:
        
        ```
        ┌──────────────────────────────────┐
        │ 📄 documento.pdf          2.3 MB  │  [❌]
        │ 🖼️ captura.jpg            1.8 MB  │  [❌]
        └──────────────────────────────────┘
        
        ```
        
- **UX-04:** Componente de carga de archivos:
    - Progress bar individual por archivo durante subida:
        - "Subiendo documento.pdf... 65%" con barra visual
    - Animación de check verde ✓ cuando termina cada archivo
    - Si falla subida: Mensaje de error específico con opción "Reintentar"
- **UX-05:** Estados visuales del botón "Enviar Mensaje":
    - **Normal:** Color primario, cursor pointer
    - **Hover:** Color más oscuro, escala 1.02
    - **Deshabilitado:** Gris claro, cursor not-allowed
    - **Enviando:** Spinner animado + texto "Enviando..."
    - **Éxito:** Transición a verde con check ✓
- **UX-06:** Modal de confirmación de envío:
    - Overlay oscuro semi-transparente
    - Modal centrado con animación de fade-in + scale
    - Ícono de éxito grande (64px) con animación de bounce
    - Texto claro y conciso
    - Botones con jerarquía visual:
        - "Ver conversación" (primario)
        - "Volver a bandeja" (secundario)

---

### **Estados y Flujo**

- **EF-01:** Estado inicial Paso 1: Todos los campos vacíos, botón "Continuar" deshabilitado
- **EF-02:** Estado Paso 1 completo: Todos los campos válidos, botón "Continuar" habilitado
- **EF-03:** Transición Paso 1 → Paso 2: Animación de slide hacia la izquierda
- **EF-04:** Estado inicial Paso 2: Mensaje vacío, sin archivos, botón "Enviar" deshabilitado
- **EF-05:** Estado con archivos: Vista previa de archivos con opciones de eliminar
- **EF-06:** Estado de subida de archivos: Progress bar activa, botones deshabilitados
- **EF-07:** Estado de envío: Spinner en botón, formulario deshabilitado
- **EF-08:** Estado de éxito: Modal de confirmación con opciones de navegación
- **EF-09:** Estado de error: Mensaje de error específico con opción de reintentar

---

### **Validaciones de Entrada**

- **VE-01:** Asunto debe tener entre 10 y 200 caracteres (validación en tiempo real)
- **VE-02:** Mensaje debe tener entre 10 y 1000 caracteres (validación en tiempo real)
- **VE-03:** Archivos deben ser PDF, JPG o PNG (validación de extensión y MIME type)
- **VE-04:** Cada archivo no debe exceder 5MB (validación antes de subir)
- **VE-05:** No se permiten más de 3 archivos adjuntos
- **VE-06:** Selección de hijo, curso y docente son obligatorias

---

### **Mensajes de Error**

- "El asunto debe tener al menos 10 caracteres"
- "El asunto no puede exceder 200 caracteres"
- "El mensaje debe tener al menos 10 caracteres"
- "El mensaje no puede exceder 1000 caracteres"
- "Solo se permiten archivos PDF, JPG y PNG"
- "El archivo excede el tamaño máximo de 5MB"
- "No puedes adjuntar más de 3 archivos"
- "Error al subir el archivo [nombre]. Intenta nuevamente"
- "Error al enviar el mensaje. Verifica tu conexión e intenta nuevamente"
- "No tienes permisos para enviar mensajes a este docente"
- "El docente seleccionado no está activo en el sistema"

---

### **Mensajes de Éxito**

- "✅ ¡Mensaje enviado correctamente!"
- "✅ Archivos subidos exitosamente (3/3)"
- "✅ Conversación creada y mensaje enviado"
- "✅ Mensaje agregado a la conversación existente"
- "📬 El docente ha sido notificado por WhatsApp"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación como padre)
    - HU-USERS-04 (Relaciones padre-hijo creadas)
    - HU-MSG-00 (Bandeja de mensajería)
- **HU Siguientes:**
    - HU-MSG-03 (Ver conversación completa)
    - HU-MSG-04 (Notificaciones de nuevos mensajes)

---

### **Componentes y Estructura**

- **Tipo:** Página completa con wizard de 2 pasos (`/dashboard/mensajeria/nuevo`)
- **Componentes principales:**
    - `NuevoMensajeWizard`: Componente contenedor del wizard
    - `StepProgressBar`: Barra de progreso visual entre pasos
    - `DestinatarioStep`: Paso 1 - Selección de contexto
    - `HijoSelector`: Dropdown de selección de hijo
    - `CursoSelector`: Dropdown de cursos (filtrado por hijo)
    - `DocenteSelector`: Dropdown de docentes (filtrado por curso)
    - `AsuntoInput`: Campo de texto con contador de caracteres
    - `MensajeStep`: Paso 2 - Redacción y adjuntos
    - `ContextoResumen`: Badge con resumen del Paso 1
    - `MensajeTextarea`: Textarea expandible con contador
    - `FileUploader`: Componente de drag & drop para archivos
    - `FilePreviewList`: Lista de archivos con preview y opción de eliminar
    - `UploadProgressBar`: Barra de progreso de subida individual
    - `EnviarButton`: Botón de envío con estados
    - `SuccessModal`: Modal de confirmación de envío exitoso
    - `ErrorAlert`: Componente de alertas de error
- **Endpoints API:**
    - `GET /estudiantes?padre_id={id}` - Hijos del padre
    - `GET /cursos/estudiante/:estudiante_id` - Cursos del estudiante
    - `GET /docentes/curso/:curso_id` - Docentes del curso
    - `GET /conversaciones/existe?padre_id={id}&docente_id={id}&estudiante_id={id}` - Verificar conversación existente
    - `POST /conversaciones` - Crear nueva conversación
    - `POST /mensajes` - Crear nuevo mensaje
    - `POST /archivos/upload` - Subir archivo a Cloudinary
    - `POST /archivos-adjuntos` - Registrar archivo en BD
    - `POST /notificaciones` - Crear notificación
    - `POST /notificaciones/whatsapp` - Enviar WhatsApp

---

# **Historia de Usuario Detallada - HU-MSG-03**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Padre y docente participantes en la conversación
2. **estudiantes** - Estudiante relacionado con la conversación
3. **conversaciones** - Conversación específica a visualizar
4. **mensajes** - Historial completo de mensajes intercambiados
5. **archivos_adjuntos** - Archivos asociados a mensajes
6. **cursos** - Curso que contextualiza la conversación

### **Roles Involucrados:**

- **Padre:** Puede enviar nuevos mensajes en el hilo
- **Docente:** Solo puede responder (no puede iniciar conversaciones en MVP)

---

## **HU-MSG-03 — Ver Conversación y Continuar Chat**

**Título:** Visualización de historial completo y continuación de conversación tipo WhatsApp

**Historia:**

> Como padre/docente, quiero abrir una conversación específica y visualizar el historial completo de mensajes para revisar comunicaciones anteriores, ver archivos adjuntos y continuar el intercambio de mensajes de forma fluida.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso a la conversación desde HU-MSG-00:
    - Click en cualquier tarjeta de conversación en la bandeja
    - Redirige a `/dashboard/mensajeria/conversacion/:id`
    - Transición suave con animación de slide
- **CA-02:** Layout de la página tipo WhatsApp/Telegram:
    
    **HEADER FIJO DE CONVERSACIÓN**
    
    - **Botón "← Atrás":** Vuelve a la bandeja (HU-MSG-00)
    - **Avatar circular** del otro usuario (inicial del nombre si no hay foto)
    - **Información del contexto:**
        - Nombre completo del otro usuario (docente o padre)
        - Línea secundaria: "[Curso] - Sobre: [Estudiante]"
        - Ejemplo: "Prof. María González"
        "Matemáticas - Sobre: Juan Pérez"
    - **Menú de opciones (⋮)** con dropdown:
        - "Ver información del contacto"
        - "Cerrar conversación"
        - "Reportar problema" (futuro)
    - **Altura fija:** 80px
    - **Sticky:** Permanece visible al hacer scroll
    
    **ÁREA DE MENSAJES (Scrollable)**
    
    - **Vista de chat vertical** con scroll automático al último mensaje
    - **Mensajes agrupados por fecha:**
        - Separador visual por día: "Hoy", "Ayer", "DD/MM/YYYY"
        - Badge centrado con fondo gris claro
    - **Burbujas de mensaje diferenciadas:**
        
        **Mensajes enviados por el usuario actual (derecha):**
        
        - Alineación: derecha
        - Color de fondo: Púrpura (color institucional)
        - Color de texto: Blanco
        - Border-radius: 18px (esquinas redondeadas, excepto esquina inferior derecha)
        - Padding: 12px 16px
        - Max-width: 70% del ancho disponible
        - Timestamp: Pequeño, gris claro, abajo a la derecha
        - Estado de lectura: Iconos tipo WhatsApp
            - ✓ Enviado (gris)
            - ✓✓ Entregado (gris)
            - ✓✓ Leído (azul)
        
        **Mensajes recibidos (izquierda):**
        
        - Alineación: izquierda
        - Color de fondo: Gris claro (#F1F3F4)
        - Color de texto: Negro
        - Border-radius: 18px (esquinas redondeadas, excepto esquina inferior izquierda)
        - Padding: 12px 16px
        - Max-width: 70% del ancho disponible
        - Timestamp: Pequeño, gris oscuro, abajo a la izquierda
        - Nombre del emisor (solo visible para docentes con múltiples conversaciones)
    - **Contenido de cada mensaje:**
        - Texto del mensaje con line-breaks respetados
        - Timestamp en formato:
            - Si es hoy: "HH:MM" (Ej: "14:30")
            - Si es ayer: "Ayer HH:MM"
            - Otros días: "DD/MM HH:MM"
        - Archivos adjuntos (si existen)
    - **Visualización de archivos adjuntos:**
        
        **Para imágenes (JPG, PNG):**
        
        - Preview thumbnail (200x200px) dentro de la burbuja
        - Click abre modal de imagen completa con opciones:
            - Botón "Descargar"
            - Botón "Cerrar" (X)
            - Zoom in/out con scroll
        - Nombre del archivo debajo del thumbnail (truncado)
        - Tamaño del archivo: "1.2 MB"
        
        **Para PDFs:**
        
        - Ícono 📄 con fondo blanco
        - Nombre del archivo (max 30 caracteres, truncado con "...")
        - Tamaño del archivo: "2.5 MB"
        - Botón "📥 Descargar" al hacer hover
        - Click descarga el archivo directamente (no abre en navegador)
        
        **Múltiples archivos en un mensaje:**
        
        - Se muestran apilados verticalmente dentro de la burbuja
        - Separación de 8px entre cada archivo
        - Máximo 3 archivos (validación desde HU-MSG-01)
    - **Scroll automático:**
        - Al cargar la conversación: Scroll hasta el último mensaje
        - Al enviar nuevo mensaje: Scroll suave hasta el fondo
        - Botón flotante "↓ Ir al final" aparece si el usuario sube más de 200px
    - **Lazy loading:**
        - Carga inicial: Últimos 50 mensajes
        - Al hacer scroll hacia arriba (detectar tope): Cargar 50 mensajes anteriores
        - Indicador de carga (spinner) en la parte superior durante carga
        - Si no hay más mensajes: Mostrar "Inicio de la conversación"
    
    **FOOTER FIJO (Área de redacción)**
    
    - **Posición:** Fixed en la parte inferior
    - **Altura dinámica:** Min 60px, max 200px (crece con el contenido)
    - **Componentes:**
        
        **Textarea de mensaje:**
        
        - Placeholder diferenciado por rol:
            - **Padre:** "Escribe un mensaje..."
            - **Docente:** "Escribe tu respuesta..."
        - Auto-resize al escribir (max 5 líneas)
        - Mínimo: 10 caracteres
        - Máximo: 1000 caracteres
        - Contador de caracteres visible: "XX/1000"
        - Shortcut: Enter para salto de línea, Ctrl+Enter para enviar
        
        **Botón de adjuntar archivos (📎):**
        
        - Botón circular a la izquierda del textarea
        - Click abre selector de archivos del sistema
        - Mismas validaciones que HU-MSG-01:
            - Tipos: PDF, JPG, PNG
            - Tamaño: Max 5MB por archivo
            - Cantidad: Max 3 archivos
        - Vista previa de archivos seleccionados:
            - Aparece encima del textarea
            - Thumbnails pequeños (60x60px) con nombre truncado
            - Botón "❌" para eliminar cada archivo antes de enviar
        
        **Botón "Enviar" (✉️):**
        
        - Botón circular a la derecha del textarea
        - Color primario (púrpura)
        - Habilitado solo si:
            - Hay texto (min 10 caracteres) O hay archivos adjuntos
        - Estados visuales:
            - **Normal:** Color primario, cursor pointer
            - **Hover:** Color más oscuro
            - **Deshabilitado:** Gris claro, cursor not-allowed
            - **Enviando:** Spinner animado
        - Al hacer clic:
            - Deshabilitar textarea y botones
            - Mostrar spinner en botón
            - Subir archivos a Cloudinary (si existen)
            - Enviar mensaje al backend
            - Insertar mensaje en el chat inmediatamente (optimistic update)
            - Scroll automático al nuevo mensaje
            - Limpiar textarea y archivos adjuntos
            - Re-habilitar controles
- **CA-03:** Comportamiento diferenciado por rol:
    
    **Para Padre:**
    
    - Puede enviar mensajes libremente en el hilo
    - Footer de redacción siempre habilitado
    - Sin restricciones de respuesta
    
    **Para Docente:**
    
    - Solo puede responder mensajes iniciados por padres (MVP)
    - Footer de redacción habilitado solo si la conversación fue iniciada por un padre
    - No puede iniciar nuevas conversaciones desde esta vista
    - Tooltip visible si intenta escribir en conversación no válida (futuro)
- **CA-04:** Proceso de envío de mensaje:
    
    **Validación frontend:**
    
    - Verificar mínimo 10 caracteres si hay texto
    - Validar archivos adjuntos (tipo, tamaño, cantidad)
    - Mostrar errores específicos si fallan validaciones
    
    **Subida de archivos (si existen):**
    
    - Subir archivos a Cloudinary con progress bar
    - Mostrar progreso: "Subiendo archivo 1 de 2... 45%"
    - Si falla subida: Mostrar error y permitir reintentar
    
    **Inserción en base de datos:**
    
    - Crear registro en tabla `mensajes`:
        
        ```sql
        INSERT INTO mensajes (
          conversacion_id, emisor_id, contenido,
          fecha_envio, estado_lectura, tiene_adjuntos
        ) VALUES (
          ?, ?, ?,
          NOW(), 'enviado', ?
        );
        
        ```
        
    - Si hay archivos, insertar en tabla `archivos_adjuntos`:
        
        ```sql
        INSERT INTO archivos_adjuntos (
          mensaje_id, nombre_original, nombre_archivo,
          url_cloudinary, tipo_mime, tamaño_bytes,
          fecha_subida, subido_por
        ) VALUES (
          ?, ?, ?,
          ?, ?, ?,
          NOW(), ?
        );
        
        ```
        
    - Actualizar `fecha_ultimo_mensaje` en tabla `conversaciones`:
        
        ```sql
        UPDATE conversaciones
        SET fecha_ultimo_mensaje = NOW()
        WHERE id = ?;
        
        ```
        
    
    **Generación de notificación:**
    
    - Crear registro en tabla `notificaciones` para el destinatario
    - Enviar WhatsApp con formato:
        
        ```
        💬 Nueva respuesta de [Nombre]
        Sobre: [Estudiante]
        
        Mensaje: [Primeros 100 caracteres...]
        
        📱 Ver respuesta: [URL]
        
        ```
        
    - Actualizar badge de mensajería del destinatario
- **CA-05:** Marcado de mensajes como leídos:
    - Al abrir la conversación: Marcar todos los mensajes del otro usuario como "leído"
    - Update masivo en tabla `mensajes`:
        
        ```sql
        UPDATE mensajes
        SET estado_lectura = 'leido', fecha_lectura = NOW()
        WHERE conversacion_id = ?
          AND emisor_id != ?
          AND estado_lectura != 'leido';
        
        ```
        
    - Actualizar estado en tiempo real (optimistic update en frontend)
    - Actualizar contador de no leídos en HU-MSG-00
- **CA-06:** Actualización en tiempo real:
    - **Polling cada 10 segundos** para verificar nuevos mensajes
    - Si hay mensajes nuevos:
        - Agregar mensajes al final del chat
        - Scroll automático si el usuario está cerca del final (últimos 100px)
        - Si el usuario está leyendo mensajes anteriores: No hacer scroll, mostrar badge "Nuevos mensajes ↓"
    - Actualizar estados de lectura de mensajes enviados (✓ → ✓✓)
- **CA-07:** Estado vacío (conversación sin mensajes):
    - Ilustración SVG centrada
    - Mensaje: "Esta conversación acaba de comenzar. Envía el primer mensaje."
    - Footer de redacción visible y habilitado

---

### **Validaciones de Negocio**

- **VN-01:** Solo los participantes de la conversación pueden verla (padre y docente específicos)
- **VN-02:** El padre solo puede ver conversaciones de sus hijos matriculados
- **VN-03:** El docente solo puede ver conversaciones de estudiantes de sus cursos asignados
- **VN-04:** Los mensajes deben tener mínimo 10 caracteres o al menos 1 archivo adjunto
- **VN-05:** Máximo 1000 caracteres por mensaje
- **VN-06:** Máximo 3 archivos adjuntos por mensaje
- **VN-07:** Tamaño máximo por archivo: 5MB
- **VN-08:** Tipos de archivo permitidos: PDF, JPG, PNG (validación MIME estricta)
- **VN-09:** Solo se pueden enviar mensajes en conversaciones con estado "activa"
- **VN-10:** El docente solo puede responder en conversaciones iniciadas por padres (MVP)

---

### **UI/UX**

- **UX-01:** Layout tipo WhatsApp con 3 secciones claras:
    
    ```
    ┌─────────────────────────────────────────────┐
    │  [←] Prof. María González            [⋮]   │
    │      Matemáticas - Sobre: Juan Pérez       │
    ├─────────────────────────────────────────────┤
    │                  13/05/2025                 │
    │  ┌──────────────────────────┐              │
    │  │ Hola, quería consultar... │ 10:30  ✓✓   │
    │  └──────────────────────────┘              │
    │                                             │
    │           ┌──────────────────────────┐     │
    │      14:15│ Claro, con gusto te ayudo│     │
    │           └──────────────────────────┘     │
    │                                             │
    │  ┌──────────────────────────┐              │
    │  │ 📄 tarea.pdf      2.3 MB  │ 15:00  ✓    │
    │  └──────────────────────────┘              │
    ├─────────────────────────────────────────────┤
    │ 📎  [Escribe un mensaje...]          [✉️]  │
    └─────────────────────────────────────────────┘
    
    ```
    
- **UX-02:** Diseño de burbujas de mensaje:
    - **Propias (derecha):**
        - Background: `#7C3AED` (púrpura institucional)
        - Color texto: `#FFFFFF`
        - Border-radius: `18px 18px 4px 18px`
        - Sombra sutil: `0 1px 2px rgba(0,0,0,0.1)`
    - **Ajenas (izquierda):**
        - Background: `#F1F3F4` (gris claro)
        - Color texto: `#1F2937` (gris oscuro)
        - Border-radius: `18px 18px 18px 4px`
        - Sombra sutil: `0 1px 2px rgba(0,0,0,0.1)`
    - **Espaciado:**
        - Entre mensajes del mismo usuario: 4px
        - Entre mensajes de usuarios diferentes: 12px
        - Padding interno: 12px horizontal, 10px vertical
- **UX-03:** Visualización de archivos adjuntos dentro de burbujas:
    
    **Imágenes:**
    
    - Thumbnail con border-radius de 8px
    - Overlay oscuro al hacer hover con ícono de lupa 🔍
    - Click abre modal de imagen completa con fondo oscuro semi-transparente
    
    **PDFs:**
    
    - Card horizontal con:
        - Ícono 📄 (32px)
        - Nombre del archivo (truncado)
        - Tamaño en MB
        - Botón "Descargar" con ícono 📥
    
    **Múltiples archivos:**
    
    - Stack vertical con separación de 8px
    - Border-radius consistente de 8px por archivo
- **UX-04:** Estados de lectura tipo WhatsApp:
    - ✓ **Enviado:** Un check gris claro
    - ✓✓ **Entregado:** Dos checks grises
    - ✓✓ **Leído:** Dos checks azules
    - Posición: Esquina inferior derecha de cada burbuja propia
    - Tamaño: 14px
- **UX-05:** Footer de redacción expandible:
    - Textarea con borde redondeado (24px)
    - Auto-resize al escribir (de 1 a 5 líneas)
    - Contador de caracteres discreto en esquina inferior derecha
    - Botones circulares con animaciones suaves:
        - Botón adjuntar: Rotación de 45° al hacer hover
        - Botón enviar: Escala 1.1 al hacer hover
- **UX-06:** Scroll suave y automático:
    - Scroll automático al cargar: `behavior: 'smooth'`
    - Botón flotante "↓ Ir al final":
        - Aparece solo si el usuario sube más de 200px desde el fondo
        - Posición: Fixed, esquina inferior derecha (encima del footer)
        - Badge con número de mensajes nuevos no vistos
        - Click hace scroll suave hasta el final
- **UX-07:** Separadores de fecha:
    - Badge centrado con texto pequeño
    - Fondo gris claro semi-transparente
    - Border-radius: 12px
    - Padding: 4px 12px
    - Texto: "Hoy", "Ayer", "DD/MM/YYYY"
- **UX-08:** Animaciones suaves:
    - Aparición de nuevos mensajes: Fade-in + slide-up (300ms)
    - Actualización de estados de lectura: Transición de color (200ms)
    - Envío de mensaje: Optimistic update con fade-in
    - Hover en archivos: Escala 1.02 (150ms)

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar conversación + scroll automático al último mensaje
- **EF-02:** Estado de carga: Spinner centrado mientras se obtienen mensajes
- **EF-03:** Estado vacío: Ilustración + mensaje de bienvenida
- **EF-04:** Estado con mensajes: Vista de chat completo con scroll
- **EF-05:** Estado de redacción: Textarea habilitado, archivos seleccionables
- **EF-06:** Estado de envío: Spinner en botón, controles deshabilitados
- **EF-07:** Estado de éxito: Mensaje aparece en chat, controles re-habilitados
- **EF-08:** Estado de error: Alert con mensaje específico, opción de reintentar
- **EF-09:** Estado de polling: Verificación cada 10s sin bloquear UI
- **EF-10:** Estado de nuevos mensajes: Badge "Nuevos mensajes ↓" si no está en el fondo

---

### **Validaciones de Entrada**

- **VE-01:** Mensaje debe tener entre 10 y 1000 caracteres (si no hay archivos)
- **VE-02:** Si solo hay archivos sin texto, permitir envío
- **VE-03:** Archivos deben ser PDF, JPG o PNG (validación de extensión y MIME)
- **VE-04:** Cada archivo no debe exceder 5MB
- **VE-05:** No se permiten más de 3 archivos adjuntos
- **VE-06:** Al menos debe haber texto O archivos para habilitar envío

---

### **Mensajes de Error**

- "El mensaje debe tener al menos 10 caracteres"
- "El mensaje no puede exceder 1000 caracteres"
- "Solo se permiten archivos PDF, JPG y PNG"
- "El archivo excede el tamaño máximo de 5MB"
- "No puedes adjuntar más de 3 archivos"
- "Error al subir el archivo [nombre]. Intenta nuevamente"
- "Error al enviar el mensaje. Verifica tu conexión"
- "No tienes permisos para ver esta conversación"
- "Error al cargar los mensajes. Intenta recargar la página"
- "La conversación está cerrada. No puedes enviar más mensajes"

---

### **Mensajes de Éxito**

- "✅ Mensaje enviado"
- "✅ Archivos subidos correctamente (3/3)"
- "✓✓ Mensaje entregado"
- "✓✓ Mensaje leído"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-MSG-00 (Bandeja de mensajería)
    - HU-MSG-01 (Enviar nuevo mensaje)
- **HU Siguientes:**
    - HU-MSG-04 (Notificaciones de nuevos mensajes)

---

### **Componentes y Estructura**

- **Tipo:** Página completa tipo chat (`/dashboard/mensajeria/conversacion/:id`)
- **Componentes principales:**
    - `ConversacionChat`: Componente contenedor principal
    - `ChatHeader`: Header fijo con info del contacto y menú
    - `ContactoAvatar`: Avatar circular del otro usuario
    - `MenuOpciones`: Dropdown con opciones (⋮)
    - `MensajesArea`: Área scrollable de mensajes
    - `FechaSeparador`: Separador visual por fecha
    - `MensajeBurbuja`: Burbuja individual de mensaje
    - `ArchivoAdjuntoView`: Visualización de archivo (imagen/PDF)
    - `ImagenModal`: Modal de imagen completa
    - `EstadoLectura`: Iconos de estado (✓/✓✓)
    - `ScrollToBottom`: Botón flotante "Ir al final"
    - `ChatFooter`: Footer fijo de redacción
    - `MensajeTextarea`: Textarea expandible con contador
    - `AdjuntarButton`: Botón de adjuntar archivos
    - `ArchivoPreview`: Preview de archivos antes de enviar
    - `EnviarButton`: Botón de envío con estados
    - `UploadProgress`: Barra de progreso de subida
- **Endpoints API:**
    - `GET /conversaciones/:id` - Obtener conversación específica
    - `GET /mensajes?conversacion_id={id}&limit={limit}&offset={offset}` - Mensajes paginados
    - `POST /mensajes` - Enviar nuevo mensaje
    - `PATCH /mensajes/marcar-leidos` - Marcar mensajes como leídos
    - `GET /mensajes/nuevos?conversacion_id={id}&ultimo_mensaje_id={id}` - Polling de nuevos mensajes
    - `POST /archivos/upload` - Subir archivo a Cloudinary
    - `POST /archivos-adjuntos` - Registrar archivo en BD
    - `GET /archivos/:id/download` - Descargar archivo
    - `PATCH /conversaciones/:id/cerrar` - Cerrar conversación
    - `POST /notificaciones` - Crear notificación para destinatario
    - `POST /notificaciones/whatsapp` - Enviar WhatsApp

---