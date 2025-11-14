# **Historias de Usuario Detalladas - Módulo de Comunicados**

# **Historia de Usuario Detallada - HU-COM-00**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **Usuario** - Usuario autenticado que visualiza comunicados
2. **Comunicado** - Comunicados publicados en la institución
3. **ComunicadoLectura** - Registro de comunicados leídos por usuario
4. **Estudiante** - Hijos del padre (para filtrado automático)
5. **RelacionesFamiliares** - Vinculación padre-hijo
6. **NivelGrado** - Niveles y grados para filtrado
7. **AsignacionDocenteCurso** - Cursos del docente (para filtrado)
8. **PermisoDocente** - Permisos de creación de comunicados

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Relaciones y permisos configurados

### **Roles Involucrados:**

- **Padre:** Ve comunicados de grados/niveles de sus hijos
- **Docente:** Ve comunicados institucionales + propios
- **Director:** Ve todos los comunicados de la institución

---

## **HU-COM-00 — Bandeja de Comunicados**

**Título:** Vista principal de gestión y visualización de comunicados institucionales

**Historia:**

> Como padre/docente/director, quiero ver una bandeja organizada con comunicados institucionales segmentados automáticamente según mi rol, grado y nivel, para mantenerme informado sobre asuntos relevantes de la institución y filtrar información específica cuando lo necesite.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Comunicados" desde el dashboard principal mediante botón destacado en menú lateral
- **CA-02:** La interfaz principal está dividida en **2 secciones** (layout tipo Pinterest/Grid):
    
    **SECCIÓN SUPERIOR: Barra de Herramientas y Filtros**
    
    - **Botón " Nuevo Comunicado"** (solo visible si tiene permisos):
        - **Director:** Siempre visible, color primario (púrpura)
        - **Docente con permisos:** Visible si `PermisoDocente.tipo_permiso = 'comunicados'` y `estado_activo = true`
        - **Docente sin permisos / Padre:** No visible
        - Click redirige a HU-COM-02
        - Posición: Esquina superior derecha, fijo
    - **Badge de contador** de comunicados no leídos (esquina superior del ícono del módulo):
        - Número en círculo rojo
        - Solo cuenta comunicados activos y no leídos del usuario
        - Se actualiza en tiempo real con polling
    - **Buscador con campo de texto:**
        - Placeholder: "Buscar por título o contenido..."
        - Búsqueda en tiempo real (debounce 300ms)
        - Ícono de lupa 
        - Búsqueda aplica sobre: título, contenido (primeros 200 caracteres)
        - Ancho: 40% de la pantalla (desktop), 100% (móvil)
    - **Filtros avanzados:**
        
        **Filtros Comunes (Padre / Docente / Director):**
        
        - **Select "Tipo de Comunicado":**
            - Opciones: Todos, Académico, Administrativo, Evento, Urgente, Informativo
            - Con íconos de colores correspondientes
            - Default: "Todos"
        - **Select "Estado de Lectura":**
            - Opciones: Todos, No leídos, Leídos
            - Default: "Todos"
        - **Date Range Picker "Rango de Fechas":**
            - Selector de fecha inicio y fecha fin
            - Formato: DD/MM/YYYY
            - Default: Último mes
            - Preset buttons: "Hoy", "Última semana", "Último mes", "Todo"
        
        **Filtros Específicos por Rol:**
        
        **Para Docente:**
        
        - **Select "Autor":**
            - Opciones: Todos, Solo mis comunicados, Del director
            - Default: "Todos"
        - **Checkbox "Solo institucionales":**
            - Filtra comunicados dirigidos a docentes o todos
            - Default: Desmarcado
        
        **Para Director:**
        
        - **Select "Autor":**
            - Dropdown con lista de todos los autores (director + docentes con permisos)
            - Opciones: Todos, [Nombres de usuarios]
            - Default: "Todos"
        - **Select "Nivel":**
            - Opciones: Todos, Inicial, Primaria, Secundaria
            - Default: "Todos"
        - **Select "Grado":**
            - Opciones dinámicas según nivel seleccionado
            - Default: "Todos"
    - **Botón "Limpiar Filtros":**
        - Visible solo si hay al menos 1 filtro activo
        - Resetea todos los filtros a valores por defecto
        - Color secundario (outline gris)
    
    **SECCIÓN PRINCIPAL: Vista de Comunicados**
    
    - **Vista de tarjetas (Grid Layout):**
        - **Desktop (>1024px):** Grid de 3 columnas con gap de 24px
        - **Tablet (768px-1024px):** Grid de 2 columnas con gap de16px
        - **Mobile (<768px):** Lista vertical con gap de 12px
    - **Cada tarjeta de comunicado muestra:**
        
        **Header de Tarjeta:**
        
        - **Badge de Tipo** (esquina superior izquierda):
            - Académico:  Azul
            - Administrativo: Gris
            - Evento:  Verde
            - Urgente:  Rojo
            - Informativo:  Púrpura
        - **Badge "Nuevo"** (esquina superior derecha):
            - Visible si el comunicado tiene menos de 24 horas desde publicación
            - Color naranja pulsante
            - Texto: "NUEVO"
        - **Indicador de Lectura** (punto circular a la izquierda del título):
            -  **Azul:** No leído (bold, fondo blanco)
            -  **Gris claro:** Leído (texto normal, fondo gris claro)
        
        **Contenido de Tarjeta:**
        
        - **Título del Comunicado:**
            - Texto grande, bold (18px)
            - Máximo 2 líneas, truncado con "..."
            - Color según estado de lectura:
                - No leído: Negro (#1F2937)
                - Leído: Gris oscuro (#6B7280)
        - **Extracto del Contenido:**
            - Preview del contenido HTML (sin etiquetas)
            - Máximo 120 caracteres
            - Truncado con "..."
            - Color gris medio (#9CA3AF)
            - Tamaño: 14px
        - **Metadatos en fila inferior:**
            - **Autor:** "Por: [Nombre Completo]" con ícono 
            - **Fecha de Publicación:**
                - Si es hoy: "Hoy, HH:MM"
                - Si es ayer: "Ayer, HH:MM"
                - Otros: "DD/MM/YYYY"

            - **Indicador de Edición** (si aplica):
                - Badge pequeño "Editado" con ícono 
                - Solo si `editado = true`
                - Color gris claro
        - **Destinatarios** (tooltip al hover sobre ícono ):
            - Lista de destinatarios: "2do B, Primaria, Padres"
            - Solo visible para docentes y director
            - Padres no ven este campo
        
        **Footer de Tarjeta:**
        
        - **Botón "Leer más →":**
            - Color primario (púrpura)
            - Alineado a la derecha
            - Hover: Color más oscuro
            - Click: Redirige a HU-COM-01 (detalle completo)
        - **Menú de opciones (⋮)** (solo docente creador y director):
            - Visible solo al hover sobre la tarjeta
            - Dropdown con opciones:
                - " Editar" (solo si es el autor o director)
                - " Ver estadísticas" (solo autor o director)
                - " Desactivar" (solo director)
                - " Eliminar" (solo director, confirmación obligatoria)
    - **Estado Vacío:**
        - Si no hay comunicados después de aplicar filtros:
            - Ilustración SVG centrada (documento vacío)
            - Mensaje según contexto:
                - **Sin filtros:** "No hay comunicados publicados aún"
                - **Con filtros:** "No se encontraron comunicados con los filtros aplicados"
            - Botón "Limpiar filtros" (si aplica)
            - Botón " Crear Comunicado" (si tiene permisos)
- **CA-03:** Segmentación Automática por Rol:
    
    **Lógica de Filtrado Automático (Backend):**
    
    **Para Padre:**
    
    ```sql
    SELECT c.* FROM comunicados c
    WHERE c.estado = 'publicado'
      AND c.fecha_publicacion <= NOW()
      AND (
        -- Comunicados dirigidos a todos
        c.publico_objetivo @> '["todos"]'::jsonb
        OR
        -- Comunicados dirigidos a padres
        (c.publico_objetivo @> '["padres"]'::jsonb
         AND (
           -- Comunicados del nivel de sus hijos
           c.niveles_objetivo @> '["{nivel_hijo}"]'::jsonb
           OR
           -- Comunicados del grado de sus hijos
           c.grados_objetivo @> '["{grado_hijo}"]'::jsonb
           OR
           -- Comunicados del curso de sus hijos
           c.cursos_objetivo @> '["{curso_hijo}"]'::jsonb
         ))
      )
    ORDER BY c.fecha_publicacion DESC;
    
    ```
    
    - **Lógica específica:**
        - Obtener estudiantes del padre desde `RelacionesFamiliares`
        - Obtener nivel/grado de cada estudiante
        - Filtrar comunicados que:
            - Incluyen "todos" en `publico_objetivo`
            - O incluyen "padres" Y (nivel/grado/curso del hijo en arrays objetivo)
    
    **Para Docente:**
    
    ```sql
    SELECT c.* FROM comunicados c
    WHERE c.estado = 'publicado'
      AND c.fecha_publicacion <= NOW()
      AND (
        -- Comunicados creados por el docente
        c.autor_id = {docente_id}
        OR
        -- Comunicados institucionales
        (c.publico_objetivo @> '["todos"]'::jsonb
         OR c.publico_objetivo @> '["docentes"]'::jsonb)
      )
    ORDER BY c.fecha_publicacion DESC;
    
    ```
    
    - **Lógica específica:**
        - Mostrar comunicados creados por el docente (propios)
        - Mostrar comunicados dirigidos a "todos" o "docentes"
        - No mostrar comunicados de otros docentes dirigidos solo a padres
    
    **Para Director:**
    
    ```sql
    SELECT c.* FROM comunicados c
    WHERE c.estado = 'publicado'
      AND c.fecha_publicacion <= NOW()
    ORDER BY c.fecha_publicacion DESC;
    
    ```
    
    - **Lógica específica:**
        - Sin filtros automáticos
        - Acceso completo a todos los comunicados de la institución
- **CA-04:** Ordenamiento de Comunicados:
    - Por defecto: **Fecha de publicación descendente** (más reciente primero)
    - Comunicados no leídos aparecen siempre al inicio
    - Selector de ordenamiento alternativo (opcional):
        - "Más reciente"
        - "Más antigua"
        - "Por tipo"
        - "Por autor (A-Z)"
- **CA-05:** Paginación y Carga:
    - **Lazy loading:** Cargar 12 comunicados iniciales
    - Al hacer scroll al final: Cargar siguiente lote de 12 automáticamente
    - Indicador de carga: Spinner al final de la lista
    - Si no hay más comunicados: Mensaje "No hay más comunicados"
    - Botón "Cargar más" alternativo (si lazy loading falla)
- **CA-06:** Interacciones con Comunicados:
    - **Click en tarjeta completa:** Abre el comunicado (HU-COM-01)
    - **Hover sobre tarjeta:**
        - Fondo ligeramente más oscuro
        - Sombra más pronunciada
        - Cursor pointer
        - Menú de opciones (⋮) visible (solo autor/director)
    - **Click en botón "Leer más":** Abre el comunicado (HU-COM-01)
    - **Click en menú de opciones:**
        - **Editar:** Redirige a formulario de edición (HU-COM-03)
        - **Ver estadísticas:** Redirige a dashboard de estadísticas (HU-COM-04)
        - **Desactivar:** Modal de confirmación + actualizar estado
        - **Eliminar:** Modal de confirmación con advertencia + eliminación permanente
- **CA-07:** Marcado Automático como Leído:
    - Al abrir un comunicado (click en tarjeta o "Leer más"):
        - Insertar registro en `ComunicadoLectura`:
        
        ```sql
        INSERT INTO comunicados_lecturas (
          comunicado_id, usuario_id, fecha_lectura
        ) VALUES (
          ?, ?, NOW()
        )
        ON CONFLICT (comunicado_id, usuario_id) DO NOTHING;
        
        ```
        
        - Actualizar indicador visual en tarjeta inmediatamente (optimistic update)
        - Actualizar contador de no leídos en badge del módulo
    - **No hay botón manual de "Marcar como leído"**
- **CA-08:** Actualización en Tiempo Real:
    - **Polling cada 60 segundos** para verificar nuevos comunicados
    - Si hay nuevos comunicados:
        - Mostrar toast notification: "[X] nuevo(s) comunicado(s) disponible(s)"
        - Agregar comunicados al inicio de la lista con animación fade-in
        - Actualizar badge de contador de no leídos
        - Reproducir sonido de notificación (opcional, configurable)
    - Actualizar contador de no leídos sin recargar página
- **CA-09:** Responsive Design:
    - **Desktop (>1024px):**
        - Sidebar de filtros fijo a la izquierda (20% ancho)
        - Grid de 3 columnas para comunicados (80% ancho)
        - Buscador y botón "Nuevo Comunicado" en header fijo
    - **Tablet (768px-1024px):**
        - Filtros colapsables en hamburger menu
        - Grid de 2 columnas
        - Buscador en header, botón "Nuevo" flotante
    - **Mobile (<768px):**
        - Filtros en modal slide-up desde abajo
        - Lista vertical (1 columna)
        - Botón flotante "+" para nuevo comunicado (esquina inferior derecha)
        - Buscador colapsable en header

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden acceder al módulo
- **VN-02:** Padre solo ve comunicados de grados/niveles de sus hijos vinculados
- **VN-03:** Docente solo ve comunicados institucionales + propios
- **VN-04:** Director ve todos los comunicados sin restricciones
- **VN-05:** Solo comunicados con `estado = 'publicado'` son visibles
- **VN-06:** Solo comunicados con `fecha_publicacion <= NOW()` son visibles
- **VN-07:** Comunicados desactivados no aparecen en bandeja principal
- **VN-08:** Botón "Nuevo Comunicado" solo visible si usuario tiene permisos
- **VN-09:** Opciones de editar/eliminar solo visibles para autor o director
- **VN-10:** Contador de no leídos solo cuenta comunicados activos del usuario

---

### **UI/UX**

- **UX-01:** Layout tipo Pinterest/Grid con diseño limpio
- **UX-02:** Diseño de tarjetas de comunicado:
    - **Altura:** Automática según contenido (min 200px, max 300px)
    - **Padding:** 20px
    - **Border-radius:** 12px
    - **Sombra:**
        - Normal: `box-shadow: 0 2px 8px rgba(0,0,0,.1)`
        - Hover: `box-shadow: 0 4px 16px rgba(0,0,0,.15)`
    - **Transición:** `transition: all 0.3s ease`
    - **Estado no leído:**
        - Fondo: `bg-white`
        - Borde izquierdo azul de 4px
        - Título en bold
    - **Estado leído:**
        - Fondo: `bg-gray-50`
        - Sin borde izquierdo
        - Título en font-normal
- **UX-03:** Badges visuales con colores institucionales:
    - **Académico:** `bg-blue-100 text-blue-700` 
    - **Administrativo:** `bg-gray-100 text-gray-700` 
    - **Evento:** `bg-green-100 text-green-700` 
    - **Urgente:** `bg-red-100 text-red-700` 
    - **Informativo:** `bg-purple-100 text-purple-700` 
    - **Nuevo:** `bg-orange-100 text-orange-700` animación de pulse
    - **Editado:** `bg-gray-100 text-gray-600` 
- **UX-04:** Botón "Nuevo Comunicado" destacado:
    - **Desktop:** Botón grande en header, color primario
    - **Mobile:** Botón flotante circular (FAB) en esquina inferior derecha
    - **Animación:** Escala 1.1 al hover, pulse sutil en mobile
    - **Posición fija:** Visible siempre al hacer scroll
- **UX-05:** Filtros con diseño limpio:
    - Dropdowns con íconos descriptivos
    - Chips visuales para filtros activos (removibles con X)
    - Botón "Limpiar filtros" solo visible si hay filtros aplicados
    - Animación de aplicación de filtros: Fade-out → Fade-in de tarjetas
- **UX-06:** Buscador con feedback instantáneo:
    - Ícono de lupa animado mientras busca
    - Debounce de 300ms para no saturar servidor
    - Highlight de texto encontrado en tarjetas (opcional)
    - Mensaje si no hay resultados: "No se encontraron comunicados con '[término]'"
- **UX-07:** Animaciones suaves:
    - Aparición de tarjetas: Fade-in + slide-up (300ms, stagger 50ms entre tarjetas)
    - Hover en tarjetas: Escala 1.02 + sombra más pronunciada (200ms)
    - Aplicación de filtros: Cross-fade (400ms)
    - Lazy loading: Spinner centrado con animación de rotación
    - Toast de nuevo comunicado: Slide-in desde arriba (300ms)
- **UX-08:** Indicadores de estado visuales:
    - **Punto circular de lectura:**
        - Azul sólido: No leído
        - Gris claro: Leído
        - Posición: Izquierda del título, alineado verticalmente
    - **Badge "Nuevo":**
        - Esquina superior derecha de la tarjeta
        - Animación de pulse: `animation: pulse 2s infinite`
        - Desaparece después de 24 horas
    - **Badge "Editado":**
        - Junto a la fecha de publicación
        - Tooltip al hover: "Editado el [fecha/hora]"

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar 12 comunicados más recientes con spinner
- **EF-02:** Estado cargado: Mostrar grid completo con tarjetas
- **EF-03:** Estado vacío: Ilustración + mensaje + botón de acción
- **EF-04:** Estado de búsqueda: Filtrar comunicados en tiempo real mientras se escribe
- **EF-05:** Estado de filtros aplicados: Recarga de lista según filtros seleccionados
- **EF-06:** Estado de lazy loading: Spinner al final de lista mientras carga más
- **EF-07:** Estado de actualización: Toast de nuevo comunicado + badge actualizado
- **EF-08:** Estado de hover: Sombra y menú de opciones visible (autor/director)
- **EF-09:** Estado de click: Transición suave a vista de detalle (HU-COM-01)

---

### **Validaciones de Entrada**

- **VE-01:** Búsqueda debe tener mínimo 2 caracteres para activarse
- **VE-02:** Rango de fechas debe ser válido (fecha inicio <= fecha fin)
- **VE-03:** Filtros son opcionales, por defecto muestra todos los comunicados relevantes
- **VE-04:** Al cambiar filtros, resetear paginación a página 1

---

### **Mensajes de Error**

- "No se pudieron cargar los comunicados. Verifica tu conexión."
- "No se encontraron comunicados con los filtros aplicados."
- "Error al marcar como leído. Intenta nuevamente."
- "No tienes permisos para ver este comunicado."
- "Error al desactivar el comunicado. Intenta nuevamente."
- "Error al eliminar el comunicado. Intenta nuevamente."

---

### **Mensajes de Éxito**

- " Comunicado marcado como leído"
- " Comunicado desactivado correctamente"
- " Comunicado eliminado correctamente"
- " [X] nuevo(s) comunicado(s) disponible(s)"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación como docente/director)
    - HU-USERS-04 (Relaciones padre-hijo configuradas)
    - HU-USERS-65 (Permisos de docentes asignados)
- **HU Siguientes:**
    - HU-COM-01 (Leer comunicado completo)
    - HU-COM-02 (Crear nuevo comunicado)
    - HU-COM-03 (Gestionar comunicados propios)
    - HU-COM-04 (Ver estadísticas de lectura)
    - HU-COM-05 (Notificaciones de nuevos comunicados)

---

# **Historia de Usuario Detallada - HU-COM-01**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **Usuario** - Usuario que visualiza el comunicado
2. **Comunicado** - Comunicado específico a visualizar
3. **ComunicadoLectura** - Registro de comunicados leídos por usuario
4. **Estudiante** - Estudiantes relacionados (para validación de acceso)
5. **RelacionesFamiliares** - Validación de acceso del padre
6. **AsignacionDocenteCurso** - Validación de acceso del docente

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **HU-COM-00** - Bandeja de comunicados (punto de acceso)

### **Roles Involucrados:**

- **Padre:** Ve comunicados de grados/niveles de sus hijos
- **Docente:** Ve comunicados institucionales + propios
- **Director:** Ve todos los comunicados de la institución

---

## **HU-COM-01 — Leer Comunicado Completo**

**Título:** Visualización completa de comunicado con contenido enriquecido y marcado automático de lectura

**Historia:**

> Como padre/docente/director, quiero abrir y leer el contenido completo de un comunicado institucional con su información detallada para estar informado sobre asuntos relevantes de la institución y tener acceso al historial completo de comunicaciones.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso a la vista de detalle desde dos puntos:
    - Click en tarjeta de comunicado en HU-COM-00
    - Click en botón "Leer más" de la tarjeta
    - URL directa: `/dashboard/comunicados/:id`
    - Transición suave con animación de fade-in
- **CA-02:** Layout de la página tipo artículo/blog:
    
    **HEADER FIJO DE COMUNICADO**
    
    - **Botón "← Atrás":**
        - Vuelve a la bandeja (HU-COM-00)
        - Mantiene estado de filtros y scroll previos
        - Posición: Esquina superior izquierda
        - Color secundario (gris)
    - **Menú de opciones (⋮)** (solo autor o director):
        - Dropdown con opciones:
            - " Editar Comunicado" (redirige a HU-COM-03)
            - " Ver Estadísticas" (redirige a HU-COM-04)
            - " Desactivar" (solo director)
            - " Eliminar" (solo director, confirmación obligatoria)
        - Posición: Esquina superior derecha
        - Visible solo al hacer hover (desktop) o siempre (móvil)
    - **Altura fija:** 60px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** Separación visual del contenido
    
    **CONTENIDO PRINCIPAL (Scrollable)**
    
    - **Sección de Encabezado del Comunicado:**
        
        **Badge de Tipo:**
        
        - Badge grande con ícono y color correspondiente:
            -  **Académico:** Azul
            -  **Administrativo:** Gris
            -  **Evento:** Verde
            -  **Urgente:** Rojo (pulsante)
            -  **Informativo:** Púrpura
        - Tamaño: 18px padding, 14px texto
        - Border-radius: 20px
        - Posición: Centrado horizontalmente
        
        **Título del Comunicado:**
        
        - Texto muy grande, bold (32px desktop, 24px móvil)
        - Color: Negro (#1F2937)
        - Centrado horizontalmente
        - Máximo 3 líneas, sin truncado
        - Margin: 24px arriba y abajo
        
        **Metadatos del Comunicado:**
        
        - **Card con fondo gris claro** (`bg-gray-50`) y borde redondeado
        - Layout horizontal con separadores verticales
        - Información presentada en formato "Etiqueta: Valor":
           
            **Autor:**
           
            - Ícono: 👤
            - Formato: "Publicado por: [Nombre Completo del Autor]"
            - Si es el usuario actual: Badge pequeño "(Tú)" en color primario
           
            **Fecha de Publicación:**
           
            - Ícono: 
            - Formato completo: "DD de MMMM de YYYY, HH:MM"
            - Ejemplo: "15 de octubre de 2025, 10:30"
           
            **Indicador de Edición** (si aplica):
           
            - Solo visible si `editado = true`
            - Badge: "Editado"
            - Tooltip al hover: "Última edición: [fecha_edicion en formato DD/MM/YYYY HH:MM]"
            - Color: Gris medio
           
            **Destinatarios** (solo visible para docente/director):
           
            - Formato: "Dirigido a: [Lista de destinatarios]"
            - Ejemplos:
                - "Todos los padres"
                - "Padres de 2do B, 3ro A"
                - "Primaria, Secundaria"
                - "Docentes de la institución"
            - Color: Gris oscuro
            - **Padre no ve este campo**
        - **Responsive:**
            - Desktop: Layout horizontal con 4 columnas
            - Móvil: Stack vertical con separadores horizontales
    - **Sección de Contenido del Comunicado:**
        
        **Contenido HTML Renderizado:**
        
        - Renderizado completo del contenido HTML desde `Comunicado.contenido`
        - Estilos aplicados para mantener formato: estandar de colores en index.css
        - Sanitización de HTML para evitar XSS:
            - Permitir solo etiquetas seguras: `<p>, <strong>, <em>, <u>, <h1-h3>, <ul>, <ol>, <li>, <a>, <br>, <span>`
            - Eliminar atributos peligrosos: `onclick`, `onerror`, `onload`, etc.
            - Validar URLs en enlaces (solo http/https)
        - Máximo ancho: 800px centrado
        - Padding: 32px vertical, 24px horizontal
    - **Sección de Footer del Comunicado:**
        
        **Información de Auditoría:**
        
        - Card con fondo azul claro muy sutil
        - Texto pequeño (12px) en gris medio
        - Información presentada:
            - "Comunicado publicado el [fecha completa]"
            - Si está editado: "Última edición el [fecha_edicion]"
            - "ID del comunicado: [id]" (solo visible para director/administrador)
        - Centrado horizontalmente
        - Margin-top: 48px
        
        **Botones de Acción:**
        
        - Layout horizontal centrado con gap de16px
        - **Botón "← Volver a la Bandeja":**
            - Color secundario (outline gris)
            - Ícono de flecha izquierda
            - Redirige a HU-COM-00
        - **Botón " Ver Estadísticas"** (solo autor o director):
            - Color primario (púrpura)
            - Redirige a HU-COM-04
        - **Botón " Editar"** (solo autor o director):
            - Color primario (púrpura)
            - Redirige a formulario de edición (HU-COM-03)
- **CA-03:** Marcado Automático como Leído:
    
    **Proceso al Cargar la Vista:**
    
    - **Al montar el componente (useEffect):**
        - Verificar si existe registro en `ComunicadoLectura` para el usuario actual
        - Si NO existe:
            - Insertar registro en base de datos:
           
            ```sql
            INSERT INTO comunicados_lecturas (
              comunicado_id, usuario_id, fecha_lectura
            ) VALUES (
              ?, ?, NOW()
            )
            ON CONFLICT (comunicado_id, usuario_id) DO NOTHING;
           
            ```
           
            - Actualizar estado local del componente
            - Actualizar contador de no leídos en header global (mediante context)
        - Si YA existe:
            - No hacer nada, solo mostrar el contenido
    - **Optimistic Update:**
        - Actualizar UI inmediatamente sin esperar respuesta del servidor
        - Si falla el request, revertir cambio y mostrar error
    - **Sin Botón Manual:**
        - No existe opción de "Marcar como leído" manualmente
        - La lectura se registra automáticamente al abrir
- **CA-04:** Validación de Acceso por Rol:
    
    **Backend: Middleware de Validación**
    
    **Para Padre:**
    
    ```jsx
    // Verificar que el comunicado está dirigido al grado/nivel de sus hijos
    const estudiantes = await getEstudiantesDelPadre(padre_id);
    const grados_hijos = estudiantes.map(e => e.nivel_grado);
    
    const tiene_acceso =
      comunicado.publico_objetivo.includes("todos") ||
      (comunicado.publico_objetivo.includes("padres") &&
       (comunicado.niveles_objetivo.some(n => grados_hijos.includes(n)) ||
        comunicado.grados_objetivo.some(g => grados_hijos.includes(g))));
    
    if (!tiene_acceso) {
      return res.status(403).json({
        error: "No tienes permisos para ver este comunicado"
      });
    }
    
    ```
    
    **Para Docente:**
    
    ```jsx
    // Verificar que el comunicado es institucional o propio
    const tiene_acceso =
      comunicado.autor_id === docente_id ||
      comunicado.publico_objetivo.includes("todos") ||
      comunicado.publico_objetivo.includes("docentes");
    
    if (!tiene_acceso) {
      return res.status(403).json({
        error: "No tienes permisos para ver este comunicado"
      });
    }
    
    ```
    
    **Para Director:**
    
    ```jsx
    // Acceso total sin restricciones
    // No se requiere validación adicional
    
    ```
    
- **CA-05:** Estados del Comunicado:
    
    **Si el comunicado está desactivado:**
    
    - Mostrar mensaje de advertencia en banner amarillo:
        - "Este comunicado ha sido desactivado y no es visible para los destinatarios"
        - Solo visible para director
        - Botón "Reactivar" disponible
    
    **Si el comunicado está programado (no publicado aún):**
    
    - Mostrar mensaje informativo en banner azul:
        - "Este comunicado se publicará automáticamente el [fecha_programada]"
        - Solo visible para autor o director
        - Contenido completo visible en modo preview
    
    **Si el comunicado fue eliminado:**
    
    - Redirigir a bandeja con mensaje de error:
        - "El comunicado que intentas ver ha sido eliminado"
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Contenido centrado con max-width 1000px
        - Padding lateral: 48px
        - Header sticky con sombra
        - Metadatos en layout horizontal (4 columnas)
    - **Tablet (768px-1024px):**
        - Contenido centrado con max-width 800px
        - Padding lateral: 32px
        - Metadatos en layout de 2x2 grid
    - **Mobile (<768px):**
        - Contenido full-width con padding 16px
        - Título más pequeño (24px)
        - Metadatos en stack vertical
        - Botones de acción en stack vertical (full-width)

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden ver comunicados
- **VN-02:** Padre solo puede ver comunicados de grados/niveles de sus hijos
- **VN-03:** Docente solo puede ver comunicados institucionales o propios
- **VN-04:** Director puede ver todos los comunicados sin restricciones
- **VN-05:** Comunicados desactivados solo visibles para director
- **VN-06:** Comunicados programados solo visibles para autor o director
- **VN-07:** Marcado de lectura solo se registra una vez por usuario
- **VN-08:** Contenido HTML debe estar sanitizado (sin scripts maliciosos)
- **VN-09:** Opciones de editar/eliminar solo visibles para autor o director

---

### **UI/UX**

- **UX-01:** Layout tipo artículo con diseño limpio
    
- **UX-02:** Diseño del header sticky:
    - Fondo blanco con sombra sutil: `box-shadow: 0 2px 8px rgba(0,0,0,.1)`
    - Padding: 16px horizontal, 12px vertical
    - Z-index: 10 para estar sobre el contenido
    - Transición suave al hacer scroll: `transition: box-shadow 0.3s ease`
- **UX-03:** Diseño del badge de tipo:
    - Tamaño grande para destacar: 18px padding, 14px texto
    - Border-radius: 24px (pastilla completa)
    - Sombra sutil: `box-shadow: 0 1px 3px rgba(0,0,0,.1)`
    - Animación en urgentes: `animation: pulse 2s infinite`
    - Margin-bottom: 24px
- **UX-04:** Diseño del título:
    - Tipografía: Font-family serif para dar sensación de artículo (opcional)
    - Font-weight: 700 (extra bold)
    - Letter-spacing: -0.02em (más compacto)
    - Line-height: 1.2
    - Text-align: center
    - Color: Negro profundo (#1F2937)
- **UX-05:** Diseño de la card de metadatos:
    - Fondo: `bg-gray-50`
    - Border: 1px solid `border-gray-200`
    - Border-radius: 12px
    - Padding: 20px
    - Margin: 32px 0
    - Layout:
        - Desktop: Grid de 4 columnas con separadores verticales
        - Móvil: Stack vertical con separadores horizontales
    - Íconos: Tamaño 20px, color gris medio
    - Texto: 14px, color gris oscuro
- **UX-06:** Diseño del contenido HTML:
    - Tipografía legible: Font-size 16px, line-height 1.8
    - Párrafos con espacio generoso: 12px margin
    - Títulos con jerarquía clara (h1 > h2 > h3)
    - Enlaces con color institucional púrpura
    - Listas con indentación clara
    - Máximo ancho: 800px para líneas de lectura óptimas
- **UX-07:** Diseño del footer:
    - Card de auditoría:
        - Fondo: `bg-blue-50`
        - Border: 1px solid `border-blue-200`
        - Padding: 16px
        - Border-radius: 8px
        - Texto: 12px, color gris medio
        - Margin-top: 48px
    - Botones de acción:
        - Gap: 16px entre botones
        - Tamaño: Padding 12px 24px
        - Border-radius: 8px
        - Transición: `transition: all 0.2s ease`
        - Hover: Escala 1.02 + sombra más pronunciada
- **UX-08:** Indicador de edición:
    - Badge pequeño junto a la fecha
    - Color: `bg-gray-100 text-gray-600`
    - Tooltip al hover con fecha exacta de última edición
    - Formato tooltip: "Editado el DD/MM/YYYY a las HH:MM"
- **UX-09:** Animaciones suaves:
    - Carga inicial: Fade-in del contenido (400ms)
    - Scroll: Header sticky con sombra progresiva
    - Hover en botones: Escala 1.02 (200ms)
    - Marcado de lectura: Sin animación visible (proceso silencioso)

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar comunicado con spinner centrado
- **EF-02:** Estado cargado: Mostrar contenido completo con animación fade-in
- **EF-03:** Estado de marcado de lectura: Proceso silencioso en background
- **EF-04:** Estado de error de acceso: Redirigir a bandeja con mensaje
- **EF-05:** Estado de comunicado desactivado: Banner de advertencia (solo director)
- **EF-06:** Estado de comunicado programado: Banner informativo (autor/director)
- **EF-07:** Estado de comunicado eliminado: Redirigir con mensaje de error
- **EF-08:** Estado de hover en header: Menú de opciones visible (autor/director)

---

### **Validaciones de Entrada**

- **VE-01:** ID del comunicado debe ser numérico válido
- **VE-02:** Usuario debe estar autenticado
- **VE-03:** Usuario debe tener permisos para ver el comunicado según rol

---

### **Mensajes de Error**

- "El comunicado que intentas ver no existe o ha sido eliminado"
- "No tienes permisos para ver este comunicado"
- "Error al cargar el comunicado. Verifica tu conexión e intenta nuevamente"
- "Error al marcar como leído. El comunicado se mostrará correctamente pero no se registró la lectura"
- "El comunicado está en estado borrador y no puede ser visualizado"

---

### **Mensajes de Éxito**

- "Comunicado marcado como leído" (silencioso, solo en consola)
- "Comunicado reactivado correctamente" (si director reactiva)

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-COM-00 (Bandeja de comunicados)
- **HU Siguientes:**
    - HU-COM-03 (Gestionar comunicados propios - desde botón editar)
    - HU-COM-04 (Ver estadísticas de lectura - desde botón estadísticas)

---


# **Historia de Usuario Detallada - HU-COM-02**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **Usuario** - Docente/Director que crea el comunicado
2. **Comunicado** - Comunicado con contenido y configuración
3. **PermisoDocente** - Validación de permisos de publicación
4. **NivelGrado** - Niveles y grados para segmentación
5. **Curso** - Cursos para segmentación específica
6. **AsignacionDocenteCurso** - Determina qué grados/cursos puede usar el docente
7. **Notificacion** - Alertas generadas a destinatarios

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Permisos de docentes configurados
- **HU-COM-00** - Bandeja de comunicados (punto de acceso)

### **Roles Involucrados:**

- **Docente:** Solo si tiene `permiso_activo = true` en `PermisoDocente`
- **Director:** Acceso completo sin restricciones

---

## **HU-COM-02 — Crear y Publicar Comunicado**

**Título:** Creación de comunicado con editor enriquecido y segmentación de audiencia

**Historia:**

> Como docente con permisos/director, quiero crear comunicados con un editor enriquecido y segmentar la audiencia de forma precisa para informar a padres, docentes o toda la institución sobre asuntos relevantes de manera efectiva y organizada.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al formulario desde dos puntos:
    - Botón **"Nuevo Comunicado"** en HU-COM-00 (bandeja)
    - Opción en menú lateral del dashboard
    - Al hacer clic, redirige a `/dashboard/comunicados/nuevo`
- **CA-02:** Validación de permisos previa:
    - **Docente:** Verificar que `PermisoDocente.tipo_permiso = 'comunicados'` y `estado_activo = true`
    - **Director:** Acceso automático sin validación adicional
    - Si el docente no tiene permisos: Mostrar mensaje "No tienes permisos para crear comunicados. Contacta al director."
- **CA-03:** La interfaz está diseñada como **Wizard de 3 pasos** con barra de progreso visual:
    
    **PASO 1: Información Básica**
    
    - **Título de página:** "Crear Nuevo Comunicado"
    - **Input "Título del Comunicado":**
        - Campo de texto de una línea
        - Placeholder: "Ej: Reunión de padres del segundo trimestre"
        - Mínimo: 10 caracteres
        - Máximo: 200 caracteres
        - Contador de caracteres visible: "XX/200"
        - Validación en tiempo real con mensaje de error
    - **Select "Tipo de Comunicado":**
        - **Director:** Opciones completas
            - Académico
            - Administrativo
            - Evento
            - Urgente
            - Informativo
        - **Docente:** Opciones limitadas
            - Académico
            - Evento
        - Formato: Dropdown con íconos representativos
    - **Date/Time Picker "Fecha de Publicación" (Opcional):**
        - **Publicación inmediata:** Radio button seleccionado por defecto
            - "Publicar inmediatamente al finalizar"
        - **Publicación programada:** Radio button alternativo
            - "Programar publicación"
            - Date picker que se habilita al seleccionar esta opción
            - Solo fechas futuras (no pasadas)
            - Hora específica (HH:MM format)
            - Validación: fecha/hora debe ser al menos 30 minutos en el futuro
    - **Botón "Continuar":**
        - Habilitado solo cuando título y tipo están completos y válidos
        - Color primario (púrpura), texto blanco
        - Al hacer clic: Transición suave al Paso 2
    - **Botón "Cancelar":**
        - Secundario (gris), borde outline
        - Modal de confirmación: "¿Seguro que deseas cancelar? Se perderá la información ingresada."
        - Opciones: "Sí, cancelar" (rojo) | "No, continuar editando" (gris)
    
    **PASO 2: Contenido del Comunicado**
    
    - **Resumen del Paso 1** (no editable, solo lectura):
        - Badge con: " [Tipo] |  [Fecha/Hora o 'Inmediato']"
        - Botón " Editar" para volver al Paso 1
    - **Editor de Texto Enriquecido (TinyMCE):**
        - Toolbar con herramientas básicas:
            - **Formato:** Negrita, Cursiva, Subrayado
            - **Listas:** Viñetas, Numeradas
            - **Alineación:** Izquierda, Centro, Derecha
            - **Estilos:** Títulos (H1, H2, H3), Párrafo normal
            - **Colores:** Selector de color de texto y fondo
            - **Enlaces:** Insertar/editar enlaces
            - **Deshacer/Rehacer**
        - Placeholder: "Redacta aquí el contenido del comunicado..."
        - Mínimo: 20 caracteres
        - Máximo: 5000 caracteres
        - Contador de caracteres: "XX/5000"
        - Altura inicial: 400px
        - Auto-save cada 2 minutos en localStorage (borrador temporal)
            - No crea registros en la base de datos hasta que el usuario seleccione explícitamente "💾 Guardar Borrador" o "📤 Publicar".
    - **Vista Previa en Tiempo Real:**
        - Toggle "Vista Previa" en esquina superior derecha del editor
        - Al activar: Muestra panel split-screen con renderizado HTML en tiempo real
        - Al cerrar: Vuelve a vista completa del editor
    - **Botón "Continuar":**
        - Habilitado solo si contenido tiene mínimo 20 caracteres
        - Color primario (púrpura)
        - Al hacer clic: Transición suave al Paso 3
    - **Botón "Atrás":**
        - Vuelve al Paso 1 manteniendo datos ingresados
        - Secundario (gris outline)
    - **Botón "Guardar Borrador":**
        - Botón secundario (outline) visible en todo momento
        - Guarda comunicado con `estado = "borrador"`
        - Mensaje de confirmación: "Borrador guardado correctamente"
        - Permite continuar editando o salir
    
    **PASO 3: Audiencia y Publicación**
    
    - **Resumen de Pasos Anteriores:**
        - Card compacto con título, tipo y fecha
        - Preview colapsable del contenido (primeros 100 caracteres)
        - Botón "Editar Contenido" para volver al Paso 2
    - **Selector de Audiencia (Tree Select Multinivel):**
        
        **Para Director:**
        
        - **Checkbox Global "Todos los Destinatarios":**
            - Ubicado al inicio del árbol
            - Al marcar: Selecciona automáticamente todos los nodos visibles
            - Al desmarcar: Limpia toda la selección
            - Badge informativo: "Total estimado: XXX personas"
        - **Árbol Jerárquico Completo:**
           
            ```
            [☑️] Todos los destinatarios
            -----------------------------------
             Nivel: Inicial
             ├── [☐] 3 años
             │     └── [☐] Matemáticas Inicial
             ├── [☐] 4 años
             └── [☐] 5 años
             Nivel: Primaria
             ├── [☑️] 1ro 
             │     ├── [☑️] Matemáticas
             │     └── [☐] Comunicación
             ├── [☑️] 2do 
             │     └── [☑️] Comunicación
             ├── [☐] 3ro 
             ├── [☐] 4to 
             ├── [☐] 5to 
             └── [☐] 6to 
             Nivel: Secundaria
             ├── [☐] 1ro 
             │     └── [☐] Ciencias
             ├── [☐] 2do 
             └── [☐] 3ro 
            -----------------------------------
             Rol: Padres [☑️]
             Rol: Docentes [☐]
            -----------------------------------
            Resumen: 3 cursos, 2 grados, 1 nivel, 1 rol
           
            ```
           
        - **Funcionalidades del árbol:**
            - Selección jerárquica: Marcar "Primaria" marca todos sus grados automáticamente
            - Estados intermedios: Si un padre tiene algunos hijos marcados, muestra estado semi-seleccionado (ícono "–")
            - Colapso/expansión por nivel con animación suave
            - Tooltip al hover: "Haz clic para expandir/colapsar"
        
        **Para Docente con Permisos:**
        
        - **Sin Checkbox Global "Todos"** (oculto completamente)
        - **Árbol Limitado a sus Asignaciones:**
           
            ```
             Nivel: Primaria
             ├── [☑️] 5to A (solo este grado)
             │     └── [☑️] Matemáticas (solo este curso)
            -----------------------------------
             Rol: Padres [☑️] (fijo, no editable)
            -----------------------------------
            Resumen: 1 curso, 1 grado, 1 nivel
           
            ```
           
        - **Restricciones visuales:**
            - Solo muestra grados/cursos donde tiene `AsignacionDocenteCurso` activas
            - Rol "Padres" pre-seleccionado y deshabilitado (no puede cambiar)
            - Mensaje informativo: "ℹ️ Solo puedes enviar comunicados a padres de tus cursos asignados"
    - **Panel de Resumen de Audiencia:**
        - Card lateral o debajo del árbol con:
            - Total estimado de destinatarios: "📧 Total estimado: 45 padres"
            - Desglose por tipo:
                - " 2 grados seleccionados"
                - " 3 cursos seleccionados"
                - " 1 rol seleccionado"
            - Botón " Previsualizar Lista" (opcional, abre modal con listado completo)
    - **Vista Previa Final del Comunicado:**
        - Card grande con el comunicado renderizado tal como lo verán los destinatarios
        - Incluye: título, tipo (badge), fecha, contenido HTML renderizado
        - Botón "✏️ Editar Contenido" si se necesita ajustar algo
    - **Botones de Acción Final:**
        - **Botón " Publicar Comunicado":**
            - Color primario (púrpura), ícono de envío
            - Habilitado solo si:
                - Audiencia tiene al menos 1 selección
                - Título y contenido válidos
            - Al hacer clic:
                - Mostrar modal de confirmación:
                    - "¿Confirmas la publicación de este comunicado?"
                    - "Se enviará a [XX] destinatarios"
                    - Botones: "Sí, publicar" (primario) | "Cancelar" (secundario)
                - Spinner en botón + texto "Publicando..."
                - Deshabilitar todos los controles durante publicación
        - **Botón " Guardar como Borrador":**
            - Secundario (outline gris)
            - Guarda comunicado con `estado = "borrador"`
            - Permite continuar editando después
        - **Botón "Atrás":**
            - Vuelve al Paso 2
            - Secundario (gris outline)
- **CA-04:** Proceso de publicación y validaciones:
    
    **Validación Frontend:**
    
    - Verificar que título tiene entre 10-200 caracteres
    - Verificar que contenido tiene entre 20-5000 caracteres
    - Verificar que audiencia tiene al menos 1 selección
    - Si fecha programada: Validar que sea al menos 30 minutos en el futuro
    - Mostrar errores específicos por campo si fallan validaciones
    
    **Validación Backend:**
    
    - Verificar permisos del usuario:
        - **Docente:** Validar `PermisoDocente.tipo_permiso = 'comunicados'` y `estado_activo = true`
        - **Docente:** Validar que los grados/cursos seleccionados están en `AsignacionDocenteCurso`
        - **Director:** Sin restricciones
    - Sanitizar contenido HTML:
        - Permitir solo etiquetas seguras: `<p>, <strong>, <em>, <u>, <h1-h3>, <ul>, <ol>, <li>, <a>, <br>, <span>`
        - Eliminar scripts, iframes, objetos maliciosos
        - Validar URLs en enlaces
    - Validar tipos de comunicado según rol
    - Validar fecha programada (si aplica)
    
    **Inserción en Base de Datos:**
    
    ```sql
    INSERT INTO comunicados (
      titulo, contenido, tipo, publico_objetivo,
      grados_objetivo, niveles_objetivo, cursos_objetivo,
      fecha_publicacion, fecha_programada, estado,
      editado, autor_id, año_academico
    ) VALUES (
      ?, ?, ?,
      ?, ?, ?, ?,
      NOW(), ?, 'publicado',
      false, ?, 2025
    );
    
    ```
    
    - **Campos JSON para segmentación:**
        - `grados_objetivo`: `["1ro A", "2do B"]`
        - `niveles_objetivo`: `["Primaria"]`
        - `cursos_objetivo`: `["Matemáticas - 1ro A", "Comunicación - 2do B"]`
        - `publico_objetivo`: `["padres"]` o `["padres", "docentes"]` o `["todos"]`
    - Si checkbox "Todos los destinatarios" está marcado:
        - `publico_objetivo = ["todos"]`
        - `grados_objetivo = null`
        - `niveles_objetivo = null`
        - `cursos_objetivo = null`
- **CA-05:** Generación de notificaciones automáticas:
    
    **Determinación de Destinatarios:**
    
    - **Si `publico_objetivo = ["todos"]`:**
        - Obtener todos los usuarios activos de la institución
    - **Si segmentación específica:**
        - Query complejo para obtener usuarios según:
            - Padres de estudiantes en `grados_objetivo`
            - Padres de estudiantes en `cursos_objetivo`
            - Docentes (si `publico_objetivo` incluye "docentes")
    
    **Creación de Notificaciones:**
    
    ```sql
    INSERT INTO notificaciones (
      usuario_id, tipo, titulo, contenido,
      canal, estado_plataforma, fecha_creacion,
      url_destino, referencia_id, año_academico,
      datos_adicionales
    ) VALUES (
      ?, 'comunicado', '[Tipo] Nuevo comunicado: [Título]', [Primeros 100 caracteres del contenido],
      'ambos', 'pendiente', NOW(),
      '/dashboard/comunicados/[comunicado_id]', ?, 2025,
      '{"tipo_comunicado": "[tipo]", "autor": "[nombre_autor]"}'
    );
    
    ```
    
    - **Batch insert:** Insertar notificaciones en lotes de 50 para optimizar
    
    **Envío de WhatsApp:**
    
    - Formato del mensaje:
        
        ```
         Nuevo comunicado: [Tipo]
        [Título del comunicado]
        
        [Primeros 150 caracteres del contenido...]
        
         Leer completo: [URL]
        
        ```
        
    - Enviar mediante Meta WhatsApp Cloud API
    - Cola de mensajes para evitar throttling (máx 50 por minuto)
    - Actualizar `estado_whatsapp` en tabla `notificaciones`
    - Registrar errores de envío para retry posterior
- **CA-06:** Feedback después de la publicación:
    - **Modal de Confirmación de Éxito:**
        - Ícono:  (verde, animación de bounce)
        - Título: "¡Comunicado publicado exitosamente!"
        - Contenido:
            - "Tu comunicado ha sido enviado a [XX] destinatarios"
            - "Se han generado [XX] notificaciones (plataforma + WhatsApp)"
            - Si es publicación programada: "Se publicará automáticamente el [fecha/hora]"
        - Botones:
            - "Ver Comunicado" (primario) → Redirige a vista de detalle
            - "Ver Estadísticas" (secundario) → Redirige a HU-COM-04
            - "Crear Otro" (outline) → Limpia formulario y reinicia wizard
            - "Volver a Bandeja" (outline) → Redirige a HU-COM-00
    - **Actualizar bandeja de comunicados:**
        - Agregar nuevo comunicado al inicio de la lista
        - Badge "Nuevo" visible por 24 horas
    - **Limpiar auto-save:**
        - Eliminar borrador temporal de localStorage
        - Limpiar todos los campos del wizard

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados con rol docente (con permisos) o director pueden crear comunicados
- **VN-02:** Docente solo puede crear si `PermisoDocente.tipo_permiso = 'comunicados'` y `estado_activo = true`
- **VN-03:** Título debe tener entre 10 y 200 caracteres
- **VN-04:** Contenido debe tener entre 20 y 5000 caracteres
- **VN-05:** Tipo de comunicado debe ser válido según rol:
    - Director: Académico, Administrativo, Evento, Urgente, Informativo
    - Docente: Académico, Evento
- **VN-06:** Audiencia debe tener al menos 1 selección (grado, curso, nivel o rol)
- **VN-07:** Docente solo puede seleccionar grados/cursos donde tiene `AsignacionDocenteCurso` activas
- **VN-08:** Docente solo puede seleccionar rol "Padres"
- **VN-09:** Fecha programada debe ser al menos 30 minutos en el futuro
- **VN-10:** Contenido HTML debe estar sanitizado (sin scripts maliciosos)
- **VN-11:** Si checkbox "Todos" está marcado, otros selectores no aplican
- **VN-12:** No se puede publicar comunicado sin contenido o audiencia

---

### **UI/UX**

- **UX-01:** Wizard visual de **3 pasos** con barra de progreso:
    
    ```
    ┌─────────────────────────────────────────────────────┐
    │  [1] Información  ━━━  [2] Contenido  ━━━  [3] Audiencia │
    │      ●━━━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━○           │
    └─────────────────────────────────────────────────────┘
    
    ```
    
    - Paso actual resaltado en color primario
    - Paso completado con check verde ✓
    - Paso pendiente en gris claro
    - Animación de transición tipo slide
- **UX-02:** Diseño del Paso 1 (Información Básica):
    - Layout de formulario vertical con espaciado consistente
    - Campos agrupados en card con sombra sutil
    - Labels con asterisco rojo (*) para campos obligatorios
    - Tipo de comunicado con badges de colores:
        - Académico: Azul 
        - Administrativo: Gris 
        - Evento: Verde 
        - Urgente: Rojo 
        - Informativo: Púrpura 
    - Date/Time picker con calendario visual integrado
    - Radio buttons para publicación inmediata vs programada
- **UX-03:** Diseño del Paso 2 (Contenido):
    - Editor TinyMCE con toolbar sticky en la parte superior
    - Botones del toolbar con tooltips descriptivos
    - Vista previa split-screen con toggle suave
    - Auto-save indicator: " Guardado automáticamente hace 30s"
    - Contador de caracteres con colores:
        - Verde: > 20 caracteres
        - Rojo: < 20 caracteres (mínimo no alcanzado)
        - Naranja: > 4500 caracteres (cerca del límite)
- **UX-04:** Diseño del Paso 3 (Audiencia):
    - **Tree Select con diseño jerárquico claro:**
        - Indentación visual por nivel (4px por nivel)
        - Íconos representativos:  Nivel,  Grado,  Curso,  Rol
        - Checkboxes con 3 estados visuales:
            - Marcado:  (azul)
            - Desmarcado: ☐ (gris)
            - Parcial: ⊟ (azul claro)
        - Animación de expansión/colapso suave
        - Hover effect: Fondo gris claro en nodos
    - **Panel de Resumen lateral:**
        - Card fixed en el lado derecho (desktop) o debajo (móvil)
        - Fondo azul claro con borde azul
        - Íconos grandes con números destacados
        - Actualización en tiempo real al seleccionar nodos
    - **Vista previa del comunicado:**
        - Card grande con diseño similar a la vista final
        - Header con tipo (badge) y fecha
        - Contenido HTML renderizado correctamente
        - Botón "Editar" flotante en esquina
- **UX-05:** Estados visuales de botones:
    - **Normal:** Color correspondiente, cursor pointer
    - **Hover:** Color más oscuro, escala 1.02
    - **Deshabilitado:** Gris claro, cursor not-allowed, opacidad 0.5
    - **Cargando:** Spinner animado + texto "Procesando..."
    - **Éxito:** Transición a verde con check ✓ (300ms)
- **UX-06:** Modal de confirmación de publicación:
    - Overlay oscuro semi-transparente (z-index alto)
    - Modal centrado con animación de fade-in + scale
    - Ícono de alerta grande (48px) con color naranja
    - Texto claro: "¿Confirmas la publicación?"
    - Desglose de destinatarios: "[XX] padres, [YY] docentes"
    - Botones con jerarquía visual clara:
        - "Sí, publicar" (primario, grande)
        - "Cancelar" (secundario, outline)
- **UX-07:** Modal de éxito con animación:
    - Ícono grande  (64px) con animación de bounce
    - Confetti animation (opcional, usando canvas)
    - Texto de confirmación con números destacados
    - Botones de acción con íconos descriptivos

---

### **Estados y Flujo**

- **EF-01:** Estado inicial Paso 1: Todos los campos vacíos, botón "Continuar" deshabilitado
- **EF-02:** Estado Paso 1 completo: Título y tipo válidos, botón "Continuar" habilitado
- **EF-03:** Transición Paso 1 → Paso 2: Animación de slide hacia la izquierda (300ms)
- **EF-04:** Estado inicial Paso 2: Editor vacío, vista previa desactivada, botón "Continuar" deshabilitado
- **EF-05:** Estado con auto-save: Icono de guardado parpadeando, timestamp actualizado
- **EF-06:** Estado Paso 2 completo: Contenido válido (>20 caracteres), botón "Continuar" habilitado
- **EF-07:** Transición Paso 2 → Paso 3: Animación de slide hacia la izquierda
- **EF-08:** Estado inicial Paso 3: Árbol colapsado, ninguna selección, botón "Publicar" deshabilitado
- **EF-09:** Estado con selección: Panel de resumen actualizado, botón "Publicar" habilitado
- **EF-10:** Estado de publicación: Spinner en botón, wizard deshabilitado, modal de confirmación
- **EF-11:** Estado de éxito: Modal de éxito con animación, opciones de navegación
- **EF-12:** Estado de error: Alert con mensaje específico, opción de reintentar

---

### **Validaciones de Entrada**

- **VE-01:** Título debe tener entre 10 y 200 caracteres (validación en tiempo real)
- **VE-02:** Contenido debe tener entre 20 y 5000 caracteres (validación en tiempo real)
- **VE-03:** Tipo de comunicado debe ser una de las opciones válidas según rol
- **VE-04:** Fecha programada debe ser timestamp válido en formato ISO 8601
- **VE-05:** Fecha programada debe ser al menos 30 minutos en el futuro
- **VE-06:** Audiencia debe tener al menos 1 nodo seleccionado en el árbol
- **VE-07:** Contenido HTML debe pasar sanitización (sin scripts maliciosos)

---

### **Mensajes de Error**

- "El título debe tener al menos 10 caracteres"
- "El título no puede exceder 200 caracteres"
- "El contenido debe tener al menos 20 caracteres"
- "El contenido no puede exceder 5000 caracteres"
- "Debes seleccionar un tipo de comunicado"
- "No tienes permisos para crear comunicados de tipo '[Tipo]'"
- "La fecha programada debe ser al menos 30 minutos en el futuro"
- "Debes seleccionar al menos un destinatario"
- "No tienes permisos para enviar comunicados a '[Grado/Curso]'"
- "Error al publicar el comunicado. Verifica tu conexión e intenta nuevamente"
- "Error al enviar notificaciones por WhatsApp. El comunicado fue publicado pero algunas notificaciones fallaron"
- "El contenido contiene elementos no permitidos. Por favor, revisa tu mensaje"

---

### **Mensajes de Éxito**

- " Borrador guardado correctamente"
- " ¡Comunicado publicado exitosamente!"
- " Comunicado programado para [fecha/hora]"
- " Notificaciones enviadas a [XX] destinatarios"
- " [XX] notificaciones de plataforma generadas"
- " [YY] mensajes de WhatsApp enviados"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación como docente/director)
    - HU-USERS-65 (Asignación de permisos a docentes)
    - HU-COM-00 (Bandeja de comunicados)
- **HU Siguientes:**
    - HU-COM-01 (Leer comunicado completo)
    - HU-COM-03 (Gestionar comunicados propios)
    - HU-COM-04 (Ver estadísticas de lectura)
    - HU-COM-05 (Notificaciones de nuevos comunicados)

---
