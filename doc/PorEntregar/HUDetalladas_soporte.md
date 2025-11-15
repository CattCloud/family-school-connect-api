# **Historia de Usuario Detallada - HU-SOP-05**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Administrador que gestiona los tickets
2. **tickets_soporte** - Tickets principales con información del problema
3. **mensajes_ticket** - Mensajes de la conversación del ticket
4. **archivos_adjuntos** - Archivos adjuntos a los tickets
5. **estados_tickets** - Estados del flujo de soporte
6. **categorias_tickets** - Categorías organizativas para tickets
7. **prioridades_tickets** - Prioridades asignadas a tickets

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Roles y permisos configurados
- **HU-SOP-01** - Crear Ticket de Soporte (prerrequisito para tener tickets que gestionar)
- **HU-SOP-02** - Ver Historial de Tickets (navegación previa)

### **Roles Involucrados:**

- **Administrador:** Gestiona completo el flujo de tickets de soporte

---

## **HU-SOP-05 — Bandeja de Tickets**

**Título:** Panel administrativo con organización por estados y filtros avanzados para gestión eficiente

**Historia:**

> Como administrador, quiero ver una bandeja organizada con todos los tickets de soporte para gestionar eficientemente las solicitudes de los usuarios.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al panel administrativo desde múltiples puntos:
    - **Botón "Bandeja de Tickets"** en menú lateral principal
    - **Opción en menú lateral:** "Soporte → Bandeja de Tickets"
    - **URL directa:** `/dashboard/soporte/bandeja-tickets`
    - **Badge de notificación:** Contador de tickets nuevos en menú lateral
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar bandeja (Backend):
    
    **Validación de Permisos:**
    
    - Verificar que usuario está autenticado
    - Verificar que `usuarios.rol = 'administrador'`
    - Si no es administrador: Redirigir a HU-SOP-00 con mensaje de error
    
    **Carga de Tickets:**
    
    ```sql
    -- Obtener tickets completos con información de usuario
    SELECT 
      ts.id, ts.numero_ticket, ts.titulo, ts.descripcion, ts.fecha_creacion,
      ts.fecha_ultima_actualizacion, ts.estado_id, ts.categoria_id, ts.prioridad_id,
      te.nombre as estado_nombre, te.color as estado_color,
      tc.nombre as categoria_nombre, tc.icono as categoria_icono,
      tp.nombre as prioridad_nombre, tp.color as prioridad_color,
      u.nombre as usuario_nombre, u.apellido as usuario_apellido,
      u.rol as usuario_rol, u.email as usuario_email,
      u.telefono as usuario_telefono,
      COUNT(mt.id) as cantidad_mensajes,
      MAX(mt.fecha_envio) as ultimo_mensaje_fecha
    FROM tickets_soporte ts
    JOIN estados_tickets te ON ts.estado_id = te.id
    JOIN categorias_tickets tc ON ts.categoria_id = tc.id
    JOIN prioridades_tickets tp ON ts.prioridad_id = tp.id
    JOIN usuarios u ON ts.usuario_id = u.id
    LEFT JOIN mensajes_ticket mt ON ts.id = mt.ticket_id
    GROUP BY ts.id
    ORDER BY 
      CASE 
        WHEN te.nombre = 'Pendiente' THEN 1
        WHEN te.nombre = 'En Proceso' THEN 2
        WHEN te.nombre = 'Resuelto' THEN 3
        ELSE 4
      END,
      ts.fecha_creacion DESC;
    ```
    
    **Si todas las validaciones pasan:**
    
    - Cargar listado completo de tickets
    - Renderizar panel de bandeja
- **CA-03:** Layout del panel administrativo:
    
    **HEADER FIJO DEL PANEL**
    
    - **Título del Panel:**
        - Texto grande, bold (24px)
        - Color: `text-text-primary`
        - Texto: "Bandeja de Tickets de Soporte"
        - Centrado horizontalmente
    - **Resumen de Estadísticas:**
        - Card horizontal con 4 métricas:
            - 🆕 "Nuevas: X"
            - 🔄 "En Proceso: Y"
            - ✅ "Resueltas: Z"
            - ⏰ "Promedio respuesta: W horas"
        - Background: `bg-info-light`
        - Border: `border-info`
        - Padding: 16px
    - **Badge de Contador de Nuevos:**
        - Circular en esquina superior derecha
        - Background: `bg-error-500 text-white`
        - Texto: Contador de tickets nuevos
        - Animación: Pulse cuando hay nuevos tickets
        - Actualización en tiempo real cada 30 segundos
    
    **SECCIÓN PRINCIPAL: Pestañas de Estados**
    
    - **Pestañas de Navegación por Estado:**
        
        **Layout de Tabs Horizontales:**
        
        - **Pestaña "Nuevas"** (activa por defecto):
            - Icono: `<LucideIcon name="inbox" />`
            - Color activo: `bg-warning-500 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador de tickets nuevos
        - **Pestaña "En Proceso"**:
            - Icono: `<LucideIcon name="loader" />`
            - Color activo: `bg-blue-500 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador de tickets en proceso
        - **Pestaña "Resueltas"**:
            - Icono: `<LucideIcon name="check-circle" />`
            - Color activo: `bg-success-500 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador de tickets resueltos
        - **Transición suave** al cambiar entre pestañas (fade 300ms)
        - **Underline animado** en pestaña activa
    
    - **PANEL DE FILTROS AVANZADOS:**
        
        - **Filtros Principales:**
            
            **Búsqueda por Texto:**
            - Input con placeholder "Buscar por título, usuario o número de ticket..."
            - Icono de búsqueda `<LucideIcon name="search" />`
            - Búsqueda en tiempo real (debounce 300ms)
            - Resalta términos coincidentes en resultados
            
            **Filtro por Categoría:**
            - Select con todas las categorías disponibles
            - Icono: `<LucideIcon name="filter" />`
            - Opción "Todas" (default)
            - Multi-selección permitida
            
            **Filtro por Prioridad:**
            - Checkboxes para múltiples prioridades:
                - 🔴 Crítica
                - 🟠 Alta
                - 🟡 Normal
                - 🟢 Baja
            
            **Filtro por Usuario:**
            - Input con autocompletado para buscar por nombre o email
            - Icono: `<LucideIcon name="user" />`
            - Muestra resultados coincidentes mientras se escribe
            
            **Filtro por Rango de Fechas:**
            - Date range picker con fecha inicio y fin
            - Icono: `<LucideIcon name="calendar" />`
            - Preset buttons: "Hoy", "Esta semana", "Este mes", "Todo"
            
            **Filtro por Tiempo de Respuesta (SLA):**
            - Select con opciones:
                - "Todos"
                - "Fuera de SLA (>48h)"
                - "Crítico (>24h)"
                - "Riesgoso (>12h)"
        
        - **Botones de Control:**
            - **"Aplicar Filtros"**: Color primario (`bg-primary-600`)
            - **"Limpiar Filtros"**: Secundario (outline `border-border-primary`)
            - Visible solo si hay filtros activos
        
        - **Indicadores Visuales:**
            - Badge con contador de filtros activos: "X filtros aplicados"
            - Resumen de resultados: "Mostrando Y de Z tickets"
            - Indicador de carga durante búsqueda
    
    - **SECCIÓN DE LISTADO DE TICKETS:**
        
        **Vista de Tarjetas Horizontales:**
        
        - **Desktop:** Grid de 2 columnas con gap de 20px
        - **Tablet:** Grid de 1 columna con gap de 16px
        - **Mobile:** Lista vertical con gap de 12px
        
        **Cada tarjeta muestra:**
            
            **Contenedor Principal:**
            - **Background:** `bg-bg-card`
            - **Border:** `border-border-primary`
            - **Border-radius:** 12px
            - **Padding:** 20px
            - **Sombra:** `shadow-sm`
            - **Hover:** Elevación `shadow-md`, transform `scale(1.01)`
            - **Transición:** `transition: all 0.2s ease`
            - **Border-left:** 4px sólido con color según estado
                - Pendiente: `border-warning-500`
                - En Proceso: `border-blue-500`
                - Resuelto: `border-success-500`
            
            **Header de Tarjeta:**
                - **Información del Ticket:**
                    - **Número de Ticket:**
                        - Texto grande, bold (18px)
                        - Color: `text-text-primary`
                        - Formato: "#SOP-2025-0001"
                        - Font-family: monoespaciado
                    - **Estado con Badge:**
                        - Pequeño, inline con número
                        - Color según estado:
                            - Pendiente: `bg-warning-100 text-warning-700`
                            - En Proceso: `bg-blue-100 text-blue-700`
                            - Resuelto: `bg-success-100 text-success-700`
                        - Icono según estado:
                            - Pendiente: `<LucideIcon name="clock" />`
                            - En Proceso: `<LucideIcon name="loader" />`
                            - Resuelto: `<LucideIcon name="check-circle" />`
                    - **Categoría con Badge:**
                        - Pequeño, inline
                        - Color según categoría:
                            - Login: `bg-red-100 text-red-700`
                            - Calificaciones: `bg-green-100 text-green-700`
                            - Mensajes: `bg-blue-100 text-blue-700`
                            - Archivos: `bg-yellow-100 text-yellow-700`
                            - Navegación: `bg-purple-100 text-purple-700`
                            - Otro: `bg-gray-100 text-gray-700`
                        - Icono según categoría
                    - **Fecha de Creación + Tiempo Transcurrido:**
                        - Texto pequeño `text-text-secondary`
                        - Formato: "Creado hace 2 días (15/10/2025)"
                        - Icono: `<LucideIcon name="calendar" />`
                    - **Prioridad con Badge:**
                        - Pequeño, inline
                        - Color según prioridad:
                            - Crítica: `bg-red-100 text-red-700`
                            - Alta: `bg-orange-100 text-orange-700`
                            - Normal: `bg-yellow-100 text-yellow-700`
                            - Baja: `bg-green-100 text-green-700`
                        - Icono según prioridad:
                            - Crítica: `<LucideIcon name="alert-triangle" />`
                            - Alta: `<LucideIcon name="alert-circle" />`
                            - Normal: `<LucideIcon name="info" />`
                            - Baja: `<LucideIcon name="check-circle" />`
                
                - **Información del Usuario:**
                    - **Nombre Completo:**
                        - Bold (16px), color `text-text-primary`
                        - Formato: "Juan Pérez"
                    - **Rol con Badge:**
                        - Pequeño, inline
                        - Color según rol:
                            - Padre: `bg-blue-100 text-blue-700`
                            - Docente: `bg-green-100 text-green-700`
                            - Director: `bg-purple-100 text-purple-700`
                        - Texto: "Padre", "Docente", "Director"
                    - **Contacto:**
                        - Texto pequeño `text-text-secondary`
                        - Formato: "📞 300-123-4567"
                        - Icono: `<LucideIcon name="phone" />`
            
            **Contenido de Tarjeta:**
                - **Título del Problema:**
                    - Bold (16px), color `text-text-primary`
                    - Truncado a 80 caracteres con tooltip
                    - Margin-top: 12px
                - **Descripción Breve:**
                    - Texto (14px), color `text-text-secondary`
                    - Truncado a 2 líneas con "..."
                    - Margin-top: 4px
                - **Última Actividad:**
                    - Texto pequeño `text-text-muted`
                    - Formato: "Última actividad: Hace 2 horas"
                    - Icono: `<LucideIcon name="refresh-cw" />`
                    - Margin-top: 8px
            
            **Footer de Tarjeta:**
                - **Botones de Acción Dinámicos según Estado:**
                    
                    **Para Tickets Nuevos (Pendientes):**
                    - **"Ver Detalle"**:
                        - Color primario (`bg-primary-600 text-white`)
                        - Icono: `<LucideIcon name="eye" />`
                        - Click redirige a HU-SOP-06
                    - **"Marcar en Proceso"**:
                        - Color secundario (`bg-blue-500 text-white`)
                        - Icono: `<LucideIcon name="play" />`
                        - Click cambia estado a "En Proceso"
                    
                    **Para Tickets en Proceso:**
                    - **"Ver Detalle"**:
                        - Color primario (`bg-primary-600 text-white`)
                        - Icono: `<LucideIcon name="eye" />`
                        - Click redirige a HU-SOP-06
                    - **"Marcar Resuelto"**:
                        - Color secundario (`bg-success-500 text-white`)
                        - Icono: `<LucideIcon name="check" />`
                        - Click cambia estado a "Resuelto"
                    
                    **Para Tickets Resueltos:**
                    - **"Ver Detalle"**:
                        - Color primario (`bg-primary-600 text-white`)
                        - Icono: `<LucideIcon name="eye" />`
                        - Click redirige a HU-SOP-06
                    - **"Reabrir Ticket"**:
                        - Color terciario (`bg-warning-500 text-white`)
                        - Icono: `<LucideIcon name="rotate-ccw" />`
                        - Click cambia estado a "En Proceso"
                
                - **Layout de Botones:**
                    - Gap de 8px entre botones
                    - Width: 100% en móvil
                    - Padding: 8px 16px
                    - Border-radius: 6px
                    - Font-size: 14px
                    - Font-weight: 600
                    - Hover: Opacidad 0.9
                    - Transición: `transition: all 0.2s ease`
- **CA-04:** Funcionalidades de Interacción:
    
    **Acciones en Lote:**
    
    - **Checkbox en cada tarjeta** para selección múltiple
    - **Controles Superiores:**
        - Checkbox "Seleccionar todas"
        - Selecciona/deselecciona todas las tarjetas visibles
        - Indicador visual de cuántas están seleccionadas
    - **"Marcar en Proceso Seleccionadas"**:
        - Visible solo en pestaña "Nuevas"
        - Cambia estado de todos los tickets seleccionados
        - Confirmación modal con resumen de cambios
    - **"Marcar Resueltas Seleccionadas"**:
        - Visible solo en pestaña "En Proceso"
        - Cambia estado de todos los tickets seleccionados
        - Confirmación modal con resumen de cambios
    - **"Asignar a Mí"**:
        - Visible para administradores con permisos especiales
        - Asigna todos los tickets seleccionados al administrador actual
        - Confirmación modal con resumen de asignación
    
    **Ordenamiento y Paginación:**
    
    - **Ordenamiento por Columnas:**
        - Click en encabezado de columna para ordenar
        - Columnas ordenables:
            - Fecha de creación (default)
            - Prioridad
            - Última actividad
            - Tiempo sin respuesta
        - Indicador visual de dirección de orden (ascendente/descendente)
    
    - **Paginación:**
        - 20 tickets por página (default)
        - Opciones de 10, 20, 50, 100 por página
        - Navegación con números de página y botones anterior/siguiente
        - Información: "Mostrando X-Y de Z tickets"
    
    **Actualización en Tiempo Real:**
    
    - **WebSocket o Polling:**
        - Actualización automática cada 30 segundos
        - Nuevos tickets aparecen con animación de fade-in
        - Cambios de estado se reflejan inmediatamente
        - Contador de nuevos se actualiza dinámicamente
    - **Notificaciones Visuales:**
        - Badge parpadeante cuando hay nuevos tickets
        - Toast notification cuando un ticket cambia de estado
        - Indicador de conexión en tiempo real
    
    **Búsqueda Avanzada:**
    
    - **Búsqueda Global:**
        - Busca en título, descripción, nombre de usuario
        - Resalta términos coincidentes en resultados
        - Muestra hasta 5 resultados mientras se escribe
        - Búsqueda por número de ticket con formato #SOP-YYYY-NNNN
    
    - **Filtros Combinados:**
        - Permite combinar múltiples criterios con operador AND
        - Indicadores visuales de filtros activos
        - URL compartible con filtros aplicados
        - Preservación de filtros al navegar entre páginas
    
    **Exportación de Datos:**
    
    - **Exportar a CSV:**
        - Exporta tickets visibles o filtrados
        - Incluye todas las columnas visibles
        - Opciones de formato de fecha
        - Botón de exportación en panel de filtros
- **CA-05:** Estados Vacíos y Mensajes:
    
    **Estado Vacío (Sin Tickets):**
    
    - **Ilustración Contextual:**
        - Imagen grande (300px) de bandeja vacía
        - Color: `text-text-muted`
        - Estilo: Ilustración amigable y motivacional
    
    - **Mensaje Principal:**
        - Texto grande, bold (20px)
        - Color: `text-text-primary`
        - Texto: "No hay tickets en esta sección"
        - Submensaje: "Cuando los usuarios creen tickets, aparecerán aquí"
    
    - **Botón de Acción:**
        - **"Ver Centro de Ayuda"**:
            - Color primario (`bg-primary-600 text-white`)
            - Icono: `<LucideIcon name="help-circle" />`
            - Click redirige a HU-SOP-00
            - Sugerencia para revisar FAQ y reducir tickets
    
    **Estado de Sin Resultados de Búsqueda:**
    
    - **Ilustración de Búsqueda:**
        - Imagen mediana (200px) de lupa vacía
        - Color: `text-text-muted`
    
    - **Mensaje de Búsqueda:**
        - Texto medio, bold (18px)
        - Color: `text-text-primary`
        - Texto: "No se encontraron tickets con tu búsqueda"
        - Sugerencia: "Prueba con otros términos o ajusta los filtros"
    
    - **Botón de Acción:**
        - **"Limpiar Búsqueda"**:
            - Color secundario (outline `border-border-primary`)
            - Icono: `<LucideIcon name="x" />`
            - Click limpia búsqueda y muestra todos los tickets
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Grid de 2 columnas para tarjetas
        - Panel de filtros en sidebar derecho fijo
        - Pestañas horizontales con subrayado animado
        - Hover effects con transformaciones suaves
    - **Tablet (768px-1024px):**
        - Grid de 1 columna con tarjetas más anchas
        - Panel de filtros colapsable en header
        - Pestañas adaptadas al tamaño táctil
    - **Mobile (<768px):**
        - Lista vertical de tarjetas con border-left indicador
        - Filtros en modal slide-up desde bottom
        - Pestañas verticales en header
        - Botones touch-friendly con padding generoso

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios con rol 'administrador' pueden acceder a la bandeja
- **VN-02:** Los tickets se organizan por estado con prioridad visual
- **VN-03:** La prioridad se calcula automáticamente según categoría
- **VN-04:** Los tickets nuevos se destacan visualmente con animación
- **VN-05:** Los filtros se aplican con operador AND entre criterios
- **VN-06:** Las acciones en lote requieren confirmación explícita
- **VN-07:** Los cambios de estado generan notificaciones automáticas
- **VN-08:** Los tickets se ordenan por fecha de creación (más reciente primero)
- **VN-09:** El contador de nuevos tickets se actualiza en tiempo real
- **VN-10:** Los usuarios pueden reabrir tickets resueltos si es necesario
- **VN-11:** Los filtros de fecha validan que inicio ≤ fin
- **VN-12:** La búsqueda resalta términos coincidentes en resultados
- **VN-13:** Los tickets inactivos por más de 30 días se archivan automáticamente
- **VN-14:** Las acciones masivas tienen límite de 50 tickets por operación
- **VN-15:** El sistema registra cada cambio de estado para auditoría

---

### **UI/UX**

- **UX-01:** Panel administrativo tipo dashboard:
    - Panel de estadísticas visual e informativo
    - Pestañas con contadores y colores distintivos
    - Filtros avanzados con iconos descriptivos
    - Tarjetas con información jerárquica clara
- **UX-02:** Diseño de tarjetas informativas:
    - Tarjetas con border-left indicador de estado
    - Información completa del ticket y usuario
    - Badges de estado, categoría y prioridad
    - Botones de acción dinámicos según estado
- **UX-03:** Filtros avanzados intuitivos:
    - Búsqueda global con resaltado de resultados
    - Filtros combinados con múltiples criterios
    - Autocompletado para búsqueda por usuario
    - Indicadores visuales de filtros activos
- **UX-04:** Acciones en lote eficientes:
    - Checkbox para selección múltiple
    - Controles superiores con acciones masivas
    - Confirmación modal con resumen de cambios
    - Indicador visual de elementos seleccionados
- **UX-05:** Actualización en tiempo real:
    - Badge animado con contador de nuevos tickets
    - Actualización automática sin recargar página
    - Notificaciones visuales de cambios de estado
    - Indicador de conexión con el servidor
- **UX-06:** Estados vacíos informativos:
    - Ilustraciones contextuales atractivas
    - Mensajes amigables y orientativos
    - Botones de acción sugeridos según contexto
    - Sugerencias para mejorar el flujo de trabajo
- **UX-07:** Diseño mobile-first:
    - Adaptación completa a diferentes tamaños
    - Elementos táctiles con tamaño adecuado
    - Navegación por gestos (swipe)
    - Optimización de rendimiento para móviles
- **UX-08:** Accesibilidad y usabilidad:
    - Contraste mínimo WCAG AA en todos los elementos
    - Navegación completa por teclado
    - Estructura semántica HTML5
    - Atributos ARIA descriptivos
    - Lectura de pantalla compatible

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar bandeja con pestaña "Nuevas" activa
- **EF-02:** Estado de filtros: Aplicar filtros y actualizar listado
- **EF-03:** Estado de búsqueda: Mostrar resultados destacados mientras se escribe
- **EF-04:** Estado de navegación: Cambiar entre pestañas de estado
- **EF-05:** Estado de selección: Activar checkboxes para selección múltiple
- **EF-06:** Estado de acciones en lote: Procesar cambios masivos con confirmación
- **EF-07:** Estado de actualización: Recibir cambios en tiempo real via WebSocket
- **EF-08:** Estado de ordenamiento: Cambiar orden de listado por columna
- **EF-09:** Estado de paginación: Navegar entre páginas de resultados
- **EF-10:** Estado de responsive: Adaptar layout según tamaño de pantalla

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe tener rol 'administrador'
- **VE-02:** Término de búsqueda debe tener mínimo 2 caracteres
- **VE-03:** Rango de fechas debe ser válido (inicio ≤ fin)
- **VE-04:** Categoría seleccionada debe existir en lista de categorías válidas
- **VE-05:** Prioridad seleccionada debe existir en lista de prioridades válidas
- **VE-06:** Usuario buscado debe tener mínimo 3 caracteres para autocompletar
- **VE-07:** Número de página debe ser entero positivo
- **VE-08:** ID de ticket debe ser válido y existir en base de datos

---

### **Mensajes de Error**

- "No tienes permisos para acceder a esta sección"
- "Error al cargar los tickets. Intenta nuevamente"
- "La búsqueda temporalmente no está disponible. Intenta en unos minutos"
- "El rango de fechas no es válido"
- "Error al cambiar el estado del ticket. Intenta nuevamente"
- "No se pueden procesar más de 50 tickets a la vez"
- "Error al exportar los datos. Intenta nuevamente más tarde"
- "Error al actualizar los filtros. Intenta nuevamente"

---

### **Mensajes de Éxito**

- " Estado del ticket actualizado correctamente"
- " Tickets marcados en proceso correctamente"
- " Tickets marcados como resueltos correctamente"
- " Tickets asignados correctamente"
- " Se encontraron X tickets con tu búsqueda"
- " Filtros aplicados correctamente"
- " Exportación generada correctamente"
- " Tienes X tickets nuevos"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-USERS-01 (Gestión de roles y permisos)
    - HU-SOP-01 (Crear Ticket de Soporte - prerrequisito)
- **HU Siguientes:**
    - HU-SOP-06 (Gestionar Ticket y Responder - acción principal)
    - HU-SOP-09 (Notificaciones de Tickets - actualizaciones)


---

### **Reglas de Negocio Específicas del Módulo (RN-SOP)**

- **RN-SOP-46:** Solo usuarios con rol 'administrador' pueden acceder a la bandeja de tickets
- **RN-SOP-47:** Los tickets se organizan por estado con prioridad visual (Nuevas > En Proceso > Resueltas)
- **RN-SOP-48:** La prioridad se calcula automáticamente según categoría predefinida
- **RN-SOP-49:** Los tickets nuevos se destacan visualmente con animación de fade-in
- **RN-SOP-50:** Los filtros se aplican con operador AND entre todos los criterios
- **RN-SOP-51:** Las acciones en lote requieren confirmación modal con resumen de cambios
- **RN-SOP-52:** Los cambios de estado generan notificaciones automáticas al usuario
- **RN-SOP-53:** Los tickets se ordenan por fecha de creación descendente por defecto
- **RN-SOP-54:** El contador de tickets nuevos se actualiza en tiempo real cada 30 segundos
- **RN-SOP-55:** Los usuarios pueden reabrir tickets resueltos si el problema persiste
- **RN-SOP-56:** Los filtros de fecha validan que la fecha de inicio sea anterior o igual a la fecha de fin
- **RN-SOP-57:** La búsqueda resalta términos coincidentes en título y descripción
- **RN-SOP-58:** Los tickets inactivos por más de 30 días se archivan automáticamente
- **RN-SOP-59:** Las acciones masivas tienen límite de 50 tickets por operación para optimizar rendimiento
- **RN-SOP-60:** El sistema registra cada cambio de estado con timestamp y usuario para auditoría
- **RN-SOP-61:** Los tickets se muestran con información completa del usuario (nombre, rol, contacto)
- **RN-SOP-62:** Los tickets se pueden filtrar por múltiples categorías simultáneamente
- **RN-SOP-63:** Los tickets se pueden filtrar por múltiples prioridades simultáneamente
- **RN-SOP-64:** Los tickets se pueden ordenar por múltiples columnas con dirección ascendente/descendente
- **RN-SOP-65:** Los tickets se pueden exportar a CSV con todas las columnas visibles
- **RN-SOP-66:** Los tickets se pueden asignar a administradores específicos (permiso especial)
- **RN-SOP-67:** Los tickets muestran tiempo transcurrido desde creación en formato relativo
- **RN-SOP-68:** Los tickets muestran última actividad con timestamp exacto
- **RN-SOP-69:** Los tickets se pueden buscar por número con formato #SOP-YYYY-NNNN
- **RN-SOP-70:** Los tickets se pueden buscar por nombre de usuario con autocompletado
- **RN-SOP-71:** El panel cumple con WCAG 2.1 nivel AA de accesibilidad
- **RN-SOP-72:** Los filtros se preservan en URL para compartir vistas específicas
- **RN-SOP-73:** Los tickets se cachean por 5 minutos para optimizar rendimiento
- **RN-SOP-74:** Los tickets se actualizan en tiempo real vía WebSocket sin recargar página
- **RN-SOP-75:** Los tickets muestran indicador visual de SLA (tiempo de respuesta)


---

# **Historia de Usuario Detallada - HU-SOP-00**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Usuario que accede al centro de ayuda
2. **faq** - Preguntas frecuentes organizadas por categorías
3. **guias** - Guías en PDF organizadas por categorías
4. **faq_vistas** - Registro de vistas por pregunta (para estadísticas)
5. **guias_descargas** - Registro de descargas por guía (para estadísticas)

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Roles y permisos configurados

### **Roles Involucrados:**

- **Padre:** Accede a FAQ y guías para resolver dudas sobre acceso de hijos, calificaciones, comunicados
- **Docente:** Accede a FAQ y guías para resolver dudas sobre gestión de notas, mensajería, archivos
- **Director:** Accede a FAQ y guías para resolver dudas sobre administración general y reportes

---

## **HU-SOP-00 — Centro de Ayuda**

**Título:** Portal de autoayuda con FAQ organizado y guías paso a paso para resolución autónoma de problemas

**Historia:**

> Como usuario (padre/docente/director), quiero acceder a un centro de ayuda con FAQ y guías paso a paso para resolver dudas comunes sin necesidad de crear un ticket de soporte.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al centro de ayuda desde múltiples puntos:
    - **Botón "Ayuda"** en menú lateral principal del dashboard
    - **Botón "Centro de Ayuda"** en footer de todas las páginas
    - **URL directa:** `/dashboard/soporte/centro-ayuda`
    - **Link desde página de login:** "¿Problemas para ingresar? Visita nuestro centro de ayuda"
    - Transición suave con animación de fade-in
- **CA-02:** Layout principal del centro de ayuda:
    
    **HEADER FIJO DEL CENTRO DE AYUDA**
    
    - **Título Principal:**
        - Texto grande, bold (28px desktop, 22px móvil)
        - Color: `text-text-primary`
        - Texto: "Centro de Ayuda"
        - Centrado horizontalmente
    - **Buscador Global:**
        - Input de búsqueda con icono de búsqueda `<LucideIcon name="search" />`
        - Placeholder: "Buscar en FAQ y guías..."
        - Ancho: 60% (desktop), 90% (móvil)
        - Búsqueda en tiempo real (debounce 300ms)
        - Resultados destacados mientras se escribe
    - **Altura fija:** 100px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    
    **CONTENIDO PRINCIPAL (Scrollable)**
    
    - **Sección de Pestañas de Navegación:**
        
        **Layout de Tabs Horizontales:**
        
        - **Pestaña "FAQ" (activa por defecto):**
            - Icono: `<LucideIcon name="help-circle" />`
            - Color activo: `bg-primary-600 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador total de preguntas
        - **Pestaña "Guías":**
            - Icono: `<LucideIcon name="book-open" />`
            - Color activo: `bg-primary-600 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador total de guías
        - **Transición suave** al cambiar entre pestañas (fade 300ms)
        - **Underline animado** en pestaña activa
    
    - **SECCIÓN FAQ (Pestaña activa por defecto):**
        
        **Filtros por Categoría:**
        
        - **Botones de filtro horizontales:**
            - "Todas" (activo por defecto, color `bg-primary-100 text-primary-700`)
            - "Acceso" (icono: `<LucideIcon name="log-in" />`)
            - "Notas" (icono: `<LucideIcon name="bar-chart" />`)
            - "Asistencia" (icono: `<LucideIcon name="calendar" />`)
            - "Comunicación" (icono: `<LucideIcon name="message-square" />`)
            - "Mensajería" (icono: `<LucideIcon name="mail" />`)
            - "Archivos" (icono: `<LucideIcon name="folder" />`)
        - **Layout:** Scroll horizontal en móvil, grid en desktop
        - **Estado activo:** Fondo de color primario claro
        - **Contador de preguntas** por categoría en cada botón
        
        **Lista de Preguntas Frecuentes:**
        
        - **Layout vertical** con separación entre preguntas (16px)
        - **Cada pregunta en formato accordion:**
            
            **Header de Pregunta (siempre visible):**
            
            - **Número de pregunta:** Badge circular con color `bg-primary-100 text-primary-700`
            - **Texto de la pregunta:** Bold (16px), color `text-text-primary`
            - **Badge de categoría:** Pequeño, esquina superior derecha
                - Acceso: `bg-blue-100 text-blue-700`
                - Notas: `bg-green-100 text-green-700`
                - Asistencia: `bg-yellow-100 text-yellow-700`
                - Comunicación: `bg-purple-100 text-purple-700`
                - Mensajería: `bg-orange-100 text-orange-700`
                - Archivos: `bg-gray-100 text-gray-700`
            - **Contador de vistas:** Texto pequeño gris `text-text-muted` "X vistas"
            - **Icono de expansión:** Flecha `<LucideIcon name="chevron-down" />` (rotada a `<LucideIcon name="chevron-up" />` cuando está expandida)
            - **Background:** `bg-bg-card` con borde `border-border-primary`
            - **Border-radius:** 8px
            - **Padding:** 16px
            - **Hover:** Fondo `bg-bg-sidebar`, cursor pointer
            - **Transición:** `transition: all 0.2s ease`
            
            **Contenido de Respuesta (expansible):**
            
            - **Texto de la respuesta:** Formato enriquecido soportado
                - Negritas, listas, enlaces
                - Código monoespaciado para snippets técnicos
                - Imágenes embebidas si aplica
            - **Background:** `bg-bg-sidebar`
            - **Padding:** 16px
            - **Border-top:** `border-border-secondary`
            - **Animación:** Height auto con transición suave (300ms)
            - **Links internos:** Destacados con color `text-primary-600`
            - **Links externos:** Con icono externo `<LucideIcon name="external-link" />` y apertura en nueva pestaña
    
    - **SECCIÓN GUÍAS (Pestaña secundaria):**
        
        **Filtros por Categoría:**
        
        - **Mismos botones de filtro** que sección FAQ
        - **Categorías específicas para guías:**
            - "Todas" (activo por defecto)
            - "Primeros pasos" (icono: `<LucideIcon name="rocket" />`)
            - "Comunicados" (icono: `<LucideIcon name="send" />`)
            - "Encuestas" (icono: `<LucideIcon name="clipboard-list" />`)
            - "Mensajería" (icono: `<LucideIcon name="message-circle" />`)
            - "Calificaciones" (icono: `<LucideIcon name="trending-up" />`)
        - **Contador de guías** por categoría en cada botón
        
        **Grid de Tarjetas de Guías:**
        
        - **Desktop:** Grid de 3 columnas con gap de 24px
        - **Tablet:** Grid de 2 columnas con gap de 16px
        - **Mobile:** Lista vertical con gap de 12px
        
        **Cada tarjeta de guía muestra:**
        
        - **Header de Tarjeta:**
            - **Icono de categoría:** Grande (48px), color según categoría
            - **Badge de categoría:** Esquina superior derecha
            - **Estado:** "Activa" (verde) o "Desactualizada" (naranja)
        
        - **Contenido de Tarjeta:**
            - **Título de la guía:** Bold (18px), color `text-text-primary`
            - **Descripción breve:** Texto (14px), color `text-text-secondary`
            - **Máximo 3 líneas** con truncamiento "..."
            - **Metadatos:**
                - "PDF • X páginas"
                - "Y descargas"
                - "Actualizada: DD/MM/YYYY"
        
        - **Footer de Tarjeta:**
            - **Botón "Ver Guía":**
                - Color primario (`bg-primary-600 text-white`)
                - Icono: `<LucideIcon name="eye" />`
                - Click abre modal con preview
            - **Botón "Descargar PDF":**
                - Secundario (outline `border-border-primary`)
                - Icono: `<LucideIcon name="download" />`
                - Click descarga directamente el PDF
        
        **Hover Effects:**
            - **Elevación:** Sombra más pronunciada `shadow-lg`
            - **Transform:** Escala 1.02
            - **Transición:** `transition: all 0.2s ease`
    
    - **MODAL DE PREVISIÓN DE GUÍA:**
        
        - **Trigger:** Click en botón "Ver Guía" de cualquier tarjeta
        - **Overlay:** Oscuro `bg-bg-overlay` con blur
        - **Modal centrado:** Ancho máximo 900px, altura 80% viewport
        - **Header del Modal:**
            - **Título de la guía:** Grande, bold
            - **Botón de cierre:** `<LucideIcon name="x" />` en esquina superior derecha
            - **Botón "Descargar":** Principal en esquina superior izquierda
        - **Contenido del Modal:**
            - **Visor de PDF embebido:** 
                - Full viewport del modal
                - Controles de zoom, navegación de páginas
                - Scroll vertical y horizontal si es necesario
            - **Información de la guía:**
                - Panel lateral (desktop) o inferior (móvil)
                - Categoría, fecha de actualización, número de descargas
                - Descripción completa
        - **Footer del Modal:**
            - **Botón "Descargar PDF":** Grande, primario
            - **Botón "Cerrar":** Secundario
- **CA-03:** Funcionalidades de búsqueda y filtrado:
    
    **Búsqueda Global en Tiempo Real:**
    
    - **Algoritmo de búsqueda:**
        - Busca en títulos de preguntas y guías
        - Busca en contenido de respuestas y descripciones
        - Resalta términos coincidentes en resultados
        - Ordena por relevancia (coincidencias exactas primero)
    - **Debounce de 300ms** para no saturar servidor
    - **Resultados destacados:** Muestra hasta 5 resultados mientras se escribe
    - **Sin resultados:** Mensaje "No se encontraron resultados para '[término]'"
    
    **Filtrado por Categoría:**
    
    - **Filtro instantáneo:** Al hacer clic en categoría, filtra inmediatamente
    - **Contador dinámico:** Actualiza contador de resultados
    - **Estado vacío:** Ilustración + mensaje "No hay elementos en esta categoría"
    - **Botón "Ver todas"** para resetear filtros
    
    **Búsqueda Combinada:**
    
    - **Permite combinar** búsqueda de texto + filtro de categoría
    - **Indicadores visuales:** "X resultados en [categoría] para '[término]'"
    - **Reset fácil:** Botón "Limpiar filtros" cuando hay filtros activos
- **CA-04:** Botón flotante de creación de ticket:
    
    **Diseño y Posicionamiento:**
    
    - **Posición:** Esquina inferior derecha, fijo
    - **Diseño:** Botón circular (FAB) con icono de ticket `<LucideIcon name="help-ticket" />`
    - **Color:** `bg-secondary-500 text-white` (naranja para destacar)
    - **Tamaño:** 56px diámetro (desktop), 48px (móvil)
    - **Sombra:** `shadow-lg` para elevación sobre contenido
    - **Efecto hover:** Escala 1.1, sombra más pronunciada
    - **Animación:** Pulse sutil cada 3 segundos para atraer atención
    
    **Funcionalidad:**
    
    - **Click:** Abre modal de confirmación
    - **Modal:**
        - Título: "¿No encontraste lo que buscabas?"
        - Contenido: "Nuestro equipo de soporte está listo para ayudarte. Crea un ticket y te responderemos en 24-48 horas."
        - Botones: "Crear Ticket" (primario) | "Seguir Buscando" (secundario)
    - **Redirección:** Click en "Crear Ticket" redirige a HU-SOP-01
    - **Tracking:** Registra clics para análisis de efectividad del FAQ
- **CA-05:** Estadísticas y analítica:
    
    **Registro de Interacciones:**
    
    - **Vistas de FAQ:** Incrementar contador cada vez que se expande una pregunta
    - **Descargas de guías:** Incrementar contador cada descarga de PDF
    - **Búsquedas:** Registrar términos buscados (sin datos personales)
    - **Tiempo en página:** Medir engagement del contenido
    
    **Panel para Administradores:**
    
    - **FAQ Más Vistas:** Top 10 preguntas más consultadas
    - **Guías Más Descargadas:** Top 5 guías más populares
    - **Términos Buscados:** Nube de palabras de búsquedas sin resultados
    - **Tasa de Conversión:** % usuarios que crean ticket después de visitar centro de ayuda
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Layout con sidebar fijo de categorías
        - Grid de 3 columnas para guías
        - Búsqueda con ancho generoso
        - Modal de PDF con panel lateral
    - **Tablet (768px-1024px):**
        - Layout con filtros horizontales scrollables
        - Grid de 2 columnas para guías
        - Búsqueda con ancho medio
        - Modal de PDF fullscreen
    - **Mobile (<768px):**
        - Layout de una sola columna
        - Filtros en carousel horizontal
        - Lista vertical para guías
        - Búsqueda con ancho completo
        - Modal de PDF con controles táctiles
        - Botón flotante más pequeño pero accesible

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden acceder al centro de ayuda
- **VN-02:** Todas las preguntas FAQ deben tener categoría asignada
- **VN-03:** Todas las guías deben tener archivo PDF válido asociado
- **VN-04:** Las búsquedas deben devolver resultados ordenados por relevancia
- **VN-05:** Los contadores de vistas/descargas deben ser únicos por usuario/día
- **VN-06:** Las guías desactualizadas deben mostrar badge de advertencia
- **VN-07:** Los términos de búsqueda se registran de forma anónima para análisis
- **VN-08:** Los enlaces externos deben abrir en nueva pestaña con atributo rel="noopener"
- **VN-09:** El contenido de FAQ y guías debe ser sanitizado para prevenir XSS
- **VN-10:** Los archivos PDF no deben exceder 10MB de tamaño

---

### **UI/UX**

- **UX-01:** Navegación intuitiva con tabs y filtros:
    - Tabs con indicadores de cantidad
    - Filtros visuales con iconos descriptivos
    - Accordion suave para expandir/colapsar respuestas
- **UX-02:** Diseño de tarjetas de guías atractivo:
    - Tarjetas con sombra sutil y hover effects
    - Iconos grandes y coloridos por categoría
    - Información jerárquica clara (título > descripción > metadatos)
    - Botones de acción con iconos descriptivos
- **UX-03:** Experiencia de búsqueda fluida:
    - Resultados en tiempo real mientras se escribe
    - Resaltado de términos coincidentes
    - Sin resultados con mensaje amigable y sugerencias
    - Búsqueda combinada con filtros de categoría
- **UX-04:** Modal de preview de guías inmersivo:
    - Visor de PDF completo con controles intuitivos
    - Información contextual sin interrumpir lectura
    - Opciones de descarga siempre accesibles
    - Cierre fácil con botón o tecla ESC
- **UX-05:** Botón flotante estratégico:
    - Posición fija siempre visible
    - Animación sutil para atraer atención sin molestar
    - Confirmación antes de redirigir a creación de ticket
    - Tracking de efectividad del centro de ayuda
- **UX-06:** Estados vacíos informativos:
    - Ilustraciones contextuales según sección
    - Mensajes amigables y orientativos
    - Botones de acción sugeridos según contexto
    - Indicadores visuales de qué hacer a continuación
- **UX-07:** Feedback visual de interacciones:
    - Estados hover en todos los elementos interactivos
    - Transiciones suaves al expandir/colapsar
    - Indicadores de carga durante búsquedas
    - Confirmaciones visuales al descargar guías
- **UX-08:** Accesibilidad y legibilidad:
    - Contraste mínimo WCAG AA en todos los textos
    - Tamaño de fuente legible (mínimo 16px)
    - Estructura semántica HTML5
    - Navegación por teclado completa
    - Atributos ARIA en elementos interactivos

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar centro de ayuda con FAQ activa por defecto
- **EF-02:** Estado de búsqueda: Mostrar resultados destacados mientras se escribe
- **EF-03:** Estado de filtrado: Actualizar lista según categoría seleccionada
- **EF-04:** Estado de expansión: Animación suave al expandir/colapsar preguntas FAQ
- **EF-05:** Estado de preview: Abrir modal con visor de PDF
- **EF-06:** Estado de descarga: Confirmación visual y contador incrementado
- **EF-07:** Estado de navegación: Cambiar entre pestañas FAQ y Guías
- **EF-08:** Estado de ticket flotante: Animación de pulse y modal de confirmación
- **EF-09:** Estado de responsive: Adaptación de layout según tamaño de pantalla
- **EF-10:** Estado de resultados vacíos: Mostrar ilustración y mensaje orientativo

---

### **Validaciones de Entrada**

- **VE-01:** Término de búsqueda debe tener mínimo 2 caracteres para activarse
- **VE-02:** Categoría seleccionada debe existir en lista de categorías válidas
- **VE-03:** ID de guía debe ser válido y existir en base de datos
- **VE-04:** Archivo PDF debe ser accesible y no exceder 10MB
- **VE-05:** Contenido HTML debe estar sanitizado para prevenir XSS

---

### **Mensajes de Error**

- "No se pudieron cargar las preguntas frecuentes. Intenta nuevamente."
- "La guía solicitada no está disponible en este momento."
- "Error al descargar el archivo. Intenta nuevamente más tarde."
- "La búsqueda temporalmente no está disponible. Intenta en unos minutos."
- "No se encontraron resultados para tu búsqueda. Prueba con otros términos."

---

### **Mensajes de Éxito**

- "Guía descargada correctamente"
- "Búsqueda actualizada con X resultados"
- "Vista registrada para mejorar nuestro contenido"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
- **HU Siguientes:**
    - HU-SOP-01 (Crear Ticket de Soporte - alternativa si no se encuentra solución)
    - HU-SOP-07 (Gestionar FAQ y Guías - mantenimiento del contenido)

---

### **Reglas de Negocio Específicas del Módulo (RN-SOP)**

- **RN-SOP-01:** Solo usuarios autenticados pueden acceder al centro de ayuda
- **RN-SOP-02:** Las preguntas FAQ se organizan por categorías predefinidas
- **RN-SOP-03:** Las guías deben tener archivo PDF asociado y metadatos completos
- **RN-SOP-04:** Los contadores de vistas/descargas son únicos por usuario/día/IP
- **RN-SOP-05:** Las búsquedas se registran de forma anónima para análisis de contenido
- **RN-SOP-06:** El contenido de FAQ y guías debe pasar sanitización XSS
- **RN-SOP-07:** Los archivos PDF no deben exceder 10MB para optimizar descargas
- **RN-SOP-08:** Las guías desactualizadas (más de 6 meses) muestran badge de advertencia
- **RN-SOP-09:** Los términos de búsqueda sin resultados se registran para análisis de gaps
- **RN-SOP-10:** El centro de ayuda debe estar disponible incluso si otros módulos fallan
- **RN-SOP-11:** Las búsquedas combinan texto y filtros con operador AND
- **RN-SOP-12:** Los resultados de búsqueda se ordenan por relevancia (título > contenido)
- **RN-SOP-13:** Las categorías pueden tener orden personalizado por administrador
- **RN-SOP-14:** Las preguntas FAQ pueden tener enlaces internos a otras preguntas
- **RN-SOP-15:** Las guías pueden tener enlaces a recursos externos validados
- **RN-SOP-16:** El botón flotante de ticket muestra tasa de conversión en dashboard admin
- **RN-SOP-17:** El contenido se cachea por 30 minutos para optimizar rendimiento
- **RN-SOP-18:** Las estadísticas se actualizan en tiempo real cada 5 minutos
- **RN-SOP-19:** El centro de ayuda cumple con WCAG 2.1 nivel AA de accesibilidad
- **RN-SOP-20:** Los PDFs se sirven con headers de cache optimizados para navegadores


---

# **Historia de Usuario Detallada - HU-SOP-07**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Administrador que gestiona el contenido
2. **faq** - Preguntas frecuentes con categorías y contenido
3. **guias** - Guías en PDF con metadatos
4. **faq_vistas** - Estadísticas de vistas por pregunta
5. **guias_descargas** - Estadísticas de descargas por guía
6. **categorias_faq** - Categorías organizativas para FAQ
7. **categorias_guias** - Categorías organizativas para guías

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Roles y permisos configurados
- **HU-SOP-00** - Centro de Ayuda (contenido a gestionar)

### **Roles Involucrados:**

- **Administrador:** Gestiona completo el contenido de FAQ y guías

---

## **HU-SOP-07 — Gestionar FAQ y Guías**

**Título:** Panel administrativo para mantenimiento y actualización de contenido de ayuda

**Historia:**

> Como administrador, quiero actualizar el FAQ y las guías paso a paso para mantener actualizada la documentación del sistema y reducir la carga de tickets.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al panel de gestión desde múltiples puntos:
    - **Botón "Gestionar Contenido"** en HU-SOP-00 (solo visible para administradores)
    - **Opción en menú lateral:** "Soporte → Gestionar Contenido"
    - **URL directa:** `/dashboard/soporte/gestionar-contenido`
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar panel (Backend):
    
    **Validación de Permisos:**
    
    - Verificar que usuario está autenticado
    - Verificar que `usuarios.rol = 'administrador'`
    - Si no es administrador: Redirigir a HU-SOP-00 con mensaje de error
    
    **Carga de Contenido:**
    
    ```sql
    -- Obtener FAQ completo
    SELECT f.*, c.nombre as categoria_nombre, COUNT(fv.id) as vistas
    FROM faq f
    JOIN categorias_faq c ON f.categoria_id = c.id
    LEFT JOIN faq_vistas fv ON f.id = fv.faq_id
    GROUP BY f.id
    ORDER BY c.orden, f.orden;
    
    -- Obtener guías completo
    SELECT g.*, c.nombre as categoria_nombre, COUNT(gd.id) as descargas
    FROM guias g
    JOIN categorias_guias c ON g.categoria_id = c.id
    LEFT JOIN guias_descargas gd ON g.id = gd.guia_id
    GROUP BY g.id
    ORDER BY c.orden, g.orden;
    ```
    
    **Si todas las validaciones pasan:**
    
    - Cargar listado completo de FAQ y guías
    - Renderizar panel de gestión
- **CA-03:** Layout del panel de gestión:
    
    **HEADER FIJO DEL PANEL**
    
    - **Título del Panel:**
        - Texto grande, bold (24px)
        - Color: `text-text-primary`
        - Texto: "Gestión de Contenido de Ayuda"
    - **Botones de Acción Rápida:**
        - **"Agregar Pregunta FAQ"**: Color primario (`bg-primary-600`)
        - **"Agregar Guía"**: Color secundario (`bg-secondary-500`)
        - Posición: Esquina superior derecha
    - **Resumen de Estadísticas:**
        - Card horizontal con 4 métricas:
            - "Total FAQ: X"
            - "Total Guías: Y"
            - "Vistas FAQ: Z"
            - "Descargas Guías: W"
        - Background: `bg-info-light`
        - Border: `border-info`
        - Padding: 16px
    
    **SECCIÓN PRINCIPAL: Tabs de Gestión**
    
    - **Pestañas de Navegación:**
        - **"FAQ Management"** (activa por defecto)
        - **"Guías Management"**
        - **"Estadísticas"**
        - **"Categorías"**
        - Transición suave al cambiar (fade 300ms)
        - Underline animado en pestaña activa
    
    - **SECCIÓN FAQ MANAGEMENT:**
        
        **Filtros y Búsqueda:**
        
        - **Búsqueda por texto:** Input con placeholder "Buscar en preguntas y respuestas..."
        - **Filtro por categoría:** Select con todas las categorías
        - **Filtro por estado:** "Todas", "Activas", "Inactivas"
        - **Botón "Aplicar Filtros"**: Color primario
        - **Botón "Limpiar Filtros"**: Secundario (outline)
        
        **Tabla de Preguntas FAQ:**
        
        - **Columnas:**
            1. **Orden:** Número con drag handle `<LucideIcon name="grip-vertical" />` para reordenar
            2. **Estado:** Toggle switch (activo/inactivo)
            3. **Pregunta:** Texto truncado a 100 caracteres con tooltip
            4. **Categoría:** Badge con color según categoría
            5. **Vistas:** Número con icono `<LucideIcon name="eye" />`
            6. **Última Actualización:** Fecha relativa "Hace 2 días"
            7. **Acciones:** Botones "Editar" | "Eliminar"
        - **Ordenamiento:** Click en encabezado de columna
        - **Paginación:** 20 resultados por página
        - **Drag & Drop:** Reordenar preguntas dentro de cada categoría
        
        **Acciones en lote:**
        
        - **Checkbox en cada fila** para selección múltiple
        - **Controles superiores:**
            - Checkbox "Seleccionar todas"
            - "Activar seleccionadas"
            - "Desactivar seleccionadas"
            - "Eliminar seleccionadas" (con confirmación)
    
    - **SECCIÓN GUÍAS MANAGEMENT:**
        
        **Filtros y Búsqueda:**
        
        - **Mismos filtros** que sección FAQ
        - **Filtro adicional por tamaño:** "< 1MB", "1-5MB", "> 5MB"
        
        **Grid de Tarjetas de Guías:**
        
        - **Desktop:** Grid de 3 columnas con gap de 24px
        - **Tablet:** Grid de 2 columnas con gap de 16px
        - **Mobile:** Lista vertical con gap de 12px
        
        **Cada tarjeta muestra:**
        
        - **Header:**
            - **Thumbnail del PDF:** Miniatura generada automáticamente
            - **Badge de estado:** "Activa" (verde) o "Inactiva" (gris)
            - **Badge de tamaño:** Color según peso (verde/amarillo/rojo)
        
        - **Contenido:**
            - **Título:** Bold (18px), truncado con tooltip
            - **Descripción:** Texto (14px), truncado a 3 líneas
            - **Categoría:** Badge con color
            - **Metadatos:**
                - "PDF • X páginas • Y MB"
                - "Z descargas"
                - "Actualizada: DD/MM/YYYY"
        
        - **Footer:**
            - **Botones de acción:**
                - "Editar" (primario)
                - "Vista Previa" (secundario)
                - "Descargar" (outline)
                - "Eliminar" (rojo)
    
    - **SECCIÓN ESTADÍSTICAS:**
        
        **Dashboard Analítico:**
        
        - **FAQ Más Vistas:**
            - Gráfico de barras horizontales
            - Top 10 preguntas con contador de vistas
            - Filtro por rango de fechas
        
        - **Guías Más Descargadas:**
            - Gráfico de barras verticales
            - Top 5 guías con contador de descargas
            - Filtro por rango de fechas
        
        - **Términos Buscados:**
            - Nube de palabras de búsquedas sin resultados
            - Tamaño según frecuencia de búsqueda
            - Click en palabra sugiere crear nueva FAQ
        
        - **Métricas de Engagement:**
            - Línea de tiempo de vistas/descargas
            - Comparación con períodos anteriores
            - Tasa de conversión a tickets
    
    - **SECCIÓN CATEGORÍAS:**
        
        **Gestión de Categorías:**
        
        - **FAQ Categories:**
            - Lista con drag & drop para ordenar
            - Cada categoría: nombre, color, icono, cantidad de preguntas
            - Botones "Editar" | "Eliminar"
            - "Agregar Categoría"
        
        - **Guías Categories:**
            - Lista con drag & drop para ordenar
            - Cada categoría: nombre, color, icono, cantidad de guías
            - Botones "Editar" | "Eliminar"
            - "Agregar Categoría"
- **CA-04:** Formularios de Creación/Edición:
    
    **Formulario de Pregunta FAQ:**
    
    - **Modal de Creación/Edición:**
        - **Título:** "Agregar Pregunta FAQ" o "Editar Pregunta FAQ"
        - **Campo "Categoría":**
            - Select obligatorio con categorías disponibles
            - Opción "Agregar nueva categoría" que abre modal secundario
        - **Campo "Pregunta":**
            - Input de texto obligatorio
            - Placeholder: "Escribe la pregunta clara y concisa..."
            - Mínimo: 10 caracteres, Máximo: 200 caracteres
            - Contador de caracteres: "XX/200"
        - **Campo "Respuesta":**
            - Textarea con editor de texto enriquecido
            - Placeholder: "Escribe la respuesta detallada..."
            - Mínimo: 20 caracteres, Máximo: 2000 caracteres
            - Toolbar: negrita, cursiva, lista, enlace, código
            - Preview en tiempo real
        - **Campo "Orden":**
            - Input numérico para orden dentro de categoría
            - Auto-calculado al final de lista
        - **Toggle "Activa":**
            - Switch para activar/desactivar pregunta
            - Default: activa
        - **Botones de acción:**
            - "Guardar" (primario, habilitado solo con campos válidos)
            - "Cancelar" (secundario)
            - "Guardar y agregar otra" (terciario)
    
    **Formulario de Guía:**
    
    - **Modal de Creación/Edición:**
        - **Título:** "Agregar Guía" o "Editar Guía"
        - **Campo "Título":**
            - Input de texto obligatorio
            - Placeholder: "Título descriptivo de la guía..."
            - Mínimo: 10 caracteres, Máximo: 100 caracteres
        - **Campo "Descripción":**
            - Textarea obligatoria
            - Placeholder: "Descripción breve del contenido..."
            - Mínimo: 20 caracteres, Máximo: 200 caracteres
        - **Campo "Categoría":**
            - Select obligatorio con categorías disponibles
        - **Campo "Ícono":**
            - Selector de iconos con preview
            - Grid de iconos disponibles
        - **Campo "Archivo PDF":**
            - Upload de archivo con drag & drop
            - Máximo: 10MB
            - Tipos permitidos: PDF únicamente
            - Preview del PDF si se está editando
            - Barra de progreso de subida
        - **Campo "Orden":**
            - Input numérico para orden dentro de categoría
        - **Toggle "Activa":**
            - Switch para activar/desactivar guía
            - Default: activa
        - **Botones de acción:**
            - "Guardar" (primario)
            - "Cancelar" (secundario)
            - "Vista Previa" (terciario, abre modal con PDF)
    
    **Formulario de Categoría:**
    
    - **Modal de Creación/Edición:**
        - **Campo "Nombre":**
            - Input de texto obligatorio
            - Mínimo: 3 caracteres, Máximo: 50 caracteres
        - **Campo "Color":**
            - Selector de color con preset institucionales
            - Input hexadecimal personalizado
        - **Campo "Ícono":**
            - Selector de iconos con preview
        - **Campo "Descripción":**
            - Textarea opcional para notas internas
        - **Botones de acción:**
            - "Guardar" (primario)
            - "Cancelar" (secundario)
- **CA-05:** Funcionalidades Avanzadas:
    
    **Importación/Exportación Masiva:**
    
    - **Importar FAQ desde CSV:**
        - Plantilla descargable con formato requerido
        - Validación de datos antes de importar
        - Preview de cambios antes de confirmar
        - Reporte de importación con éxitos/errores
    
    - **Exportar FAQ a CSV:**
        - Exportación completa o filtrada
        - Incluir estadísticas de vistas
        - Opciones de formato de fecha
    
    **Gestión de Versiones:**
    
    - **Control de cambios en guías:**
        - Historial de versiones de cada guía
        - Comparación entre versiones
        - Rollback a versiones anteriores
        - Notas de cambios en cada versión
    
    **Validación de Contenido:**
    
    - **Análisis de efectividad:**
        - Preguntas con baja tasa de vistas
        - Guías con pocas descargas
        - Sugerencias de mejora basadas en búsquedas
        - Contenido duplicado o similar
    
    **Programación de Contenido:**
    
    - **Publicación programada:**
        - Fecha y hora de activación automática
        - Desactivación programada
        - Notificaciones de contenido por expirar
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Layout con sidebar fijo de filtros
        - Tabla completa con todas las columnas
        - Modales grandes con espacio generoso
        - Grid de 3 columnas para guías
    - **Tablet (768px-1024px):**
        - Layout con filtros colapsables
        - Tabla con columnas reducidas
        - Modales adaptados
        - Grid de 2 columnas para guías
    - **Mobile (<768px):**
        - Layout de una sola columna
        - Filtros en modal slide-up
        - Tabla con cards en lugar de filas
        - Lista vertical para guías
        - Modales fullscreen

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios con rol 'administrador' pueden acceder al panel
- **VN-02:** Todas las preguntas FAQ deben tener categoría asignada
- **VN-03:** Todas las guías deben tener archivo PDF válido asociado
- **VN-04:** Los archivos PDF no deben exceder 10MB de tamaño
- **VN-05:** Las categorías no pueden eliminarse si tienen contenido asociado
- **VN-06:** El orden de elementos debe ser único dentro de cada categoría
- **VN-07:** El contenido debe estar sanitizado para prevenir XSS
- **VN-08:** Las preguntas inactivas no se muestran en centro de ayuda
- **VN-09:** Las guías inactivas no se muestran en centro de ayuda
- **VN-10:** Las categorías deben tener nombre único dentro de su tipo (FAQ/Guías)
- **VN-11:** Las importaciones masivas deben seguir formato estricto
- **VN-12:** Las exportaciones no deben incluir datos sensibles de usuarios
- **VN-13:** El control de versiones mantiene máximo 5 versiones por guía
- **VN-14:** La programación de contenido requiere fecha futura mínima de 1 hora

---

### **UI/UX**

- **UX-01:** Layout administrativo tipo dashboard:
    - Panel de estadísticas visual e informativo
    - Navegación por pestañas clara
    - Filtros intuitivos con presets comunes
    - Tabla ordenable con información completa
- **UX-02:** Diseño de tarjetas para guías:
    - Tarjetas con información jerárquica clara
    - Thumbnails de PDF generados automáticamente
    - Badges de estado y tamaño visuales
    - Acciones principales destacadas
- **UX-03:** Formularios modales eficientes:
    - Validación en tiempo real
    - Contadores de caracteres
    - Preview de contenido enriquecido
    - Guardado rápido con atajos de teclado
- **UX-04:** Drag & Drop intuitivo:
    - Indicadores visuales claros de drop zones
    - Animaciones suaves al reordenar
    - Actualización automática de números de orden
    - Confirmación visual al guardar cambios
- **UX-05:** Dashboard analítico informativo:
    - Gráficos interactivos con tooltips
    - Filtros por rango de fechas
    - Comparación con períodos anteriores
    - Insights accionables basados en datos
- **UX-06:** Gestión de categorías visual:
    - Drag & drop para reordenar
    - Colores e iconos personalizables
    - Contador de elementos asociados
    - Prevención de eliminación con contenido
- **UX-07:** Importación/Exportación amigable:
    - Plantillas descargables con ejemplos
    - Preview de cambios antes de confirmar
    - Reportes detallados de resultados
    - Indicadores de progreso claros
- **UX-08:** Estados de carga y feedback:
    - Skeletons durante carga de datos
    - Spinners en operaciones largas
    - Toast notifications para acciones rápidas
    - Confirmaciones para acciones destructivas

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar panel con estadísticas y listados
- **EF-02:** Estado de filtros: Aplicar filtros y actualizar listados
- **EF-03:** Estado de creación: Abrir modal con formulario vacío
- **EF-04:** Estado de edición: Abrir modal con datos precargados
- **EF-05:** Estado de guardado: Procesar formulario y actualizar listas
- **EF-06:** Estado de reordenamiento: Drag & drop con actualización automática
- **EF-07:** Estado de eliminación: Modal de confirmación y eliminación
- **EF-08:** Estado de importación: Subida y procesamiento de archivo
- **EF-09:** Estado de exportación: Generación y descarga de archivo
- **EF-10:** Estado de error: Mensaje específico con opciones de recuperación

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe tener rol 'administrador'
- **VE-02:** Título de pregunta debe tener entre 10-200 caracteres
- **VE-03:** Respuesta de FAQ debe tener entre 20-2000 caracteres
- **VE-04:** Título de guía debe tener entre 10-100 caracteres
- **VE-05:** Descripción de guía debe tener entre 20-200 caracteres
- **VE-06:** Archivo PDF debe ser válido y no exceder 10MB
- **VE-07:** Nombre de categoría debe tener entre 3-50 caracteres
- **VE-08:** Color de categoría debe ser formato hexadecimal válido
- **VE-09:** Orden debe ser número entero positivo
- **VE-10:** Fecha de programación debe ser futura (mínimo 1 hora)

---

### **Mensajes de Error**

- "No tienes permisos para acceder a esta sección"
- "La pregunta debe tener entre 10 y 200 caracteres"
- "La respuesta debe tener entre 20 y 2000 caracteres"
- "El archivo PDF no es válido o excede el tamaño máximo"
- "No se puede eliminar una categoría con contenido asociado"
- "Error al guardar los cambios. Intenta nuevamente"
- "El archivo CSV no tiene el formato correcto"
- "Error al procesar la importación. Revisa el reporte de errores"
- "No se puede eliminar la guía porque tiene descargas asociadas"
- "El orden debe ser único dentro de la categoría"

---

### **Mensajes de Éxito**

- "Pregunta FAQ guardada correctamente"
- "Guía guardada correctamente"
- "Categoría creada exitosamente"
- "Cambios guardados exitosamente"
- "Elemento eliminado correctamente"
- "Importación completada: X exitosas, Y con errores"
- "Exportación generada correctamente"
- "Orden actualizado correctamente"
- "Contenido programado para publicación"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-USERS-01 (Gestión de roles y permisos)
- **HU Siguientes:**
    - HU-SOP-00 (Centro de Ayuda - contenido gestionado)
    - HU-SOP-01 (Crear Ticket de Soporte - alternativa)

---

### **Reglas de Negocio Específicas del Módulo (RN-SOP)**

- **RN-SOP-21:** Solo usuarios con rol 'administrador' pueden acceder al panel de gestión
- **RN-SOP-22:** Todas las preguntas FAQ deben tener categoría, pregunta, respuesta y orden
- **RN-SOP-23:** Todas las guías deben tener título, descripción, categoría, archivo PDF y orden
- **RN-SOP-24:** Los archivos PDF se validan para asegurar que no contengan malware
- **RN-SOP-25:** Las categorías no pueden eliminarse si tienen FAQ o guías asociadas
- **RN-SOP-26:** El orden de elementos debe ser único dentro de cada categoría
- **RN-SOP-27:** El contenido se sanitiza automáticamente para prevenir XSS
- **RN-SOP-28:** Los cambios en contenido se registran en log de auditoría
- **RN-SOP-29:** Las estadísticas se actualizan en tiempo real cada 5 minutos
- **RN-SOP-30:** Las importaciones masivas se procesan en background para no bloquear UI
- **RN-SOP-31:** Las exportaciones no incluyen datos personales de usuarios
- **RN-SOP-32:** El control de versiones mantiene máximo 5 versiones por guía
- **RN-SOP-33:** La programación de contenido requiere fecha futura mínima de 1 hora
- **RN-SOP-34:** Las preguntas inactivas no se muestran en centro de ayuda pero conservan estadísticas
- **RN-SOP-35:** Las guías inactivas no se muestran en centro de ayuda pero conservan descargas
- **RN-SOP-36:** Las categorías pueden tener colores personalizados pero deben cumplir contraste mínimo
- **RN-SOP-37:** Los íconos de categorías deben ser del set predefinido para consistencia visual
- **RN-SOP-38:** El reordenamiento de elementos actualiza automáticamente todos los números afectados
- **RN-SOP-39:** Las búsquedas sin resultados se analizan para sugerir nuevo contenido
- **RN-SOP-40:** El panel cumple con WCAG 2.1 nivel AA de accesibilidad
- **RN-SOP-41:** Todas las acciones destructivas requieren confirmación explícita
- **RN-SOP-42:** El sistema genera backup automático del contenido antes de cambios masivos
- **RN-SOP-43:** Las notificaciones de contenido por expirar se envían 7 días antes
- **RN-SOP-44:** El contenido se cachea por 30 minutos para optimizar rendimiento
- **RN-SOP-45:** Las operaciones masivas tienen límite de 100 elementos por lote

# **Historia de Usuario Detallada - HU-SOP-03**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Usuario que consulta su ticket
2. **tickets_soporte** - Ticket principal con información del problema
3. **mensajes_ticket** - Mensajes de la conversación del ticket
4. **archivos_adjuntos** - Archivos adjuntos al ticket
5. **estados_tickets** - Estados del flujo de soporte
6. **categorias_tickets** - Categorías organizativas para tickets

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Roles y permisos configurados
- **HU-SOP-01** - Crear Ticket de Soporte (prerrequisito para tener ticket que ver)
- **HU-SOP-02** - Ver Historial de Tickets (navegación previa)

### **Roles Involucrados:**

- **Padre:** Consulta tickets sobre acceso de hijos, calificaciones, comunicados
- **Docente:** Consulta tickets sobre gestión de notas, mensajería, archivos
- **Director:** Consulta tickets sobre administración general y reportes

---

## **HU-SOP-03 — Ver Detalle de Ticket y Conversación**

**Título:** Vista de conversación tipo chat con historial completo y capacidad de respuesta

**Historia:**

> Como usuario (padre/docente/director), quiero ver el detalle completo de mi ticket con el historial de conversación para seguir el progreso de resolución de mi problema.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al detalle de ticket desde múltiples puntos:
    - **Botón "Ver Detalle"** en HU-SOP-02 (historial de tickets)
    - **URL directa:** `/dashboard/soporte/tickets/:id`
    - **Notificación push:** Click en notificación de nueva respuesta
    - **Link desde email:** Enlace en notificación por correo
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar detalle (Backend):
    
    **Validación de Acceso:**
    
    - Verificar que usuario está autenticado
    - Verificar que ticket pertenece al usuario (`tickets_soporte.usuario_id = usuarios.id`)
    - Si no pertenece: Redirigir a HU-SOP-02 con mensaje de error
    
    **Carga de Datos del Ticket:**
    
    ```sql
    -- Obtener información completa del ticket
    SELECT 
      ts.id, ts.numero_ticket, ts.titulo, ts.descripcion, ts.fecha_creacion,
      ts.fecha_ultima_actualizacion, ts.estado_id, ts.categoria_id,
      te.nombre as estado_nombre, te.color as estado_color,
      tc.nombre as categoria_nombre, tc.icono as categoria_icono,
      u.nombre as usuario_nombre, u.apellido as usuario_apellido,
      u.rol as usuario_rol, u.email as usuario_email,
      u.telefono as usuario_telefono
    FROM tickets_soporte ts
    JOIN estados_tickets te ON ts.estado_id = te.id
    JOIN categorias_tickets tc ON ts.categoria_id = tc.id
    JOIN usuarios u ON ts.usuario_id = u.id
    WHERE ts.id = :ticket_id AND u.id = :usuario_id;
    
    -- Obtener mensajes del ticket
    SELECT 
      mt.id, mt.contenido, mt.fecha_envio, mt.remitente_id,
      u.nombre as remitente_nombre, u.apellido as remitente_apellido,
      u.rol as remitente_rol, u.avatar as remitente_avatar
    FROM mensajes_ticket mt
    JOIN usuarios u ON mt.remitente_id = u.id
    WHERE mt.ticket_id = :ticket_id
    ORDER BY mt.fecha_envio ASC;
    
    -- Obtener archivos adjuntos
    SELECT 
      aa.id, aa.nombre_archivo, aa.ruta, aa.tipo, aa.tamaño,
      aa.fecha_subida
    FROM archivos_adjuntos aa
    WHERE aa.ticket_id = :ticket_id
    ORDER BY aa.fecha_subida ASC;
    ```
    
    **Si todas las validaciones pasan:**
    
    - Cargar información completa del ticket
    - Marcar ticket como leído si no lo estaba
    - Renderizar vista de detalle
- **CA-03:** Layout de la vista de detalle:
    
    **HEADER FIJO CON INFORMACIÓN DEL TICKET:**
    
    - **Título del Ticket:**
        - Texto grande, bold (20px desktop, 18px móvil)
        - Color: `text-text-primary`
        - Formato: "#SOP-2025-0001"
        - Font-family: monoespaciado para mejor legibilidad
        - Centrado horizontalmente
    - **Información del Ticket:**
        - **Estado Actual:**
            - Badge con color según estado:
                - Pendiente: `bg-warning-100 text-warning-700`
                - En Proceso: `bg-blue-100 text-blue-700`
                - Resuelto: `bg-success-100 text-success-700`
                - Cerrado: `bg-gray-100 text-gray-700`
            - Icono según estado:
                - Pendiente: `<LucideIcon name="clock" />`
                - En Proceso: `<LucideIcon name="loader" />`
                - Resuelto: `<LucideIcon name="check-circle" />`
                - Cerrado: `<LucideIcon name="x-circle" />`
            - Texto: "Pendiente", "En Proceso", "Resuelto", "Cerrado"
        - **Categoría:**
            - Badge pequeño con color según categoría
            - Icono según categoría
            - Texto: "Login", "Calificaciones", etc.
        - **Fecha de Creación:**
            - Texto pequeño `text-text-secondary`
            - Formato: "Creado el DD/MM/YYYY a las HH:MM"
            - Icono: `<LucideIcon name="calendar" />`
        - **Tiempo de Respuesta (si aplica):**
            - Texto pequeño `text-text-secondary`
            - Formato: "Tiempo de respuesta: 24 horas"
            - Icono: `<LucideIcon name="clock" />`
            - Visible solo si hay respuesta del administrador
    - **Altura fija:** 120px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    - **Background:** `bg-bg-card`
    - **Border-bottom:** `border-border-secondary`
    
    **CONTENIDO PRINCIPAL (Scrollable)**
    
    - **Vista de Conversación Tipo Chat:**
        
        **Layout Vertical:**
        
        - **Espaciado entre mensajes:** 16px
        - **Padding lateral:** 20px (desktop), 16px (móvil)
        - **Background:** `bg-bg-sidebar`
        - **Min-height:** 400px
        - **Max-height:** 600px (con scroll)
        
        **Mensaje Inicial del Usuario:**
        
        - **Contenedor del Mensaje:**
            - **Background:** `bg-bg-card`
            - **Border-radius:** 12px
            - **Border-left:** 4px sólido `border-primary-500`
            - **Padding:** 16px
            - **Margin-bottom:** 16px
            - **Box-shadow:** `shadow-sm`
        
        - **Header del Mensaje:**
            - **Avatar del Usuario:**
                - Imagen circular (48px) con iniciales si no hay foto
                - Background: `bg-primary-100 text-primary-700`
                - Texto: Iniciales del nombre (ej. "JD")
                - Font-size: 18px, bold
                - Posición: Izquierda
            - **Información del Usuario:**
                - **Nombre completo + rol:** Bold (16px), color `text-text-primary`
                - Formato: "Juan Díaz (Padre)"
                - Posición: Junto al avatar, centrado verticalmente
            - **Fecha y Hora de Envío:**
                - Texto pequeño `text-text-muted` (12px)
                - Formato: "DD/MM/YYYY HH:MM"
                - Posición: Derecha
                - Icono: `<LucideIcon name="send" />`
        
        - **Contenido del Mensaje:**
            - **Título del Problema (Destacado):**
                - Bold (18px), color `text-text-primary`
                - Margin-top: 12px
                - Margin-bottom: 8px
            - **Descripción Completa:**
                - Texto (16px), color `text-text-secondary`
                - Line-height: 1.5
                - White-space: pre-wrap para mantener formato
            - **Archivos Adjuntos (si hay):**
                - **Sección de Archivos:**
                    - Título pequeño: "Archivos adjuntos:"
                    - Icono: `<LucideIcon name="paperclip" />`
                    - Margin-top: 16px
                - **Lista de Archivos:**
                    - **Cada archivo muestra:**
                        - **Icono según tipo:**
                            - PDF: `<LucideIcon name="file-text" />`
                            - Imagen: `<LucideIcon name="image" />`
                        - **Nombre del archivo:** Texto (14px)
                        - **Tamaño:** Texto pequeño `text-text-muted`
                        - **Botón de descarga:**
                            - Icono: `<LucideIcon name="download" />`
                            - Color: `text-primary-600`
                            - Hover: `text-primary-700`
                            - Click: Descarga archivo
                    - **Layout:** Horizontal con gap de 12px
                    - **Background:** `bg-bg-card`
                    - **Border:** `border-border-primary`
                    - **Border-radius:** 8px
                    - **Padding:** 12px
                    - **Margin-top:** 8px
        
        **Respuestas del Administrador:**
        
        - **Contenedor del Mensaje:**
            - **Background:** `bg-info-light`
            - **Border-radius:** 12px
            - **Border-left:** 4px sólido `border-info-500`
            - **Padding:** 16px
            - **Margin-bottom:** 16px
            - **Box-shadow:** `shadow-sm`
        
        - **Header del Mensaje:**
            - **Avatar del Administrador:**
                - Imagen circular (48px) con icono si no hay foto
                - Background: `bg-info-100 text-info-700`
                - Icono: `<LucideIcon name="shield" />`
                - Font-size: 18px
                - Posición: Izquierda
            - **Información del Administrador:**
                - **Nombre completo:** Bold (16px), color `text-text-primary`
                - Formato: "Equipo de Soporte"
                - Posición: Junto al avatar, centrado verticalmente
            - **Fecha y Hora de Respuesta:**
                - Texto pequeño `text-text-muted` (12px)
                - Formato: "DD/MM/YYYY HH:MM"
                - Posición: Derecha
                - Icono: `<LucideIcon name="reply" />`
        
        - **Contenido del Mensaje:**
            - **Texto de la Respuesta:**
                - Texto (16px), color `text-text-secondary`
                - Line-height: 1.5
                - Formato enriquecido soportado (negritas, listas, enlaces)
            - **Badge de Cambio de Estado (si aplica):**
                - Background: `bg-warning-100 text-warning-700`
                - Texto: "Estado actualizado a: En Proceso"
                - Icono: `<LucideIcon name="refresh-cw" />`
                - Margin-top: 12px
                - Padding: 8px 12px
                - Border-radius: 20px
                - Display: inline-block
            - **Archivos Adjuntos (si hay):**
                - **Misma estructura** que mensaje de usuario
                - **Iconos según tipo:** PDF, imagen, etc.
                - **Botones de descarga** con iconos
        
        **Campo de Respuesta del Usuario (Opcional):**
        
        - **Visibilidad:**
            - Solo visible si ticket está "En Proceso"
            - Oculto si ticket está "Pendiente", "Resuelto" o "Cerrado"
        
        - **Contenedor de Respuesta:**
            - **Background:** `bg-bg-card`
            - **Border:** `border-border-primary`
            - **Border-radius:** 12px
            - **Padding:** 16px
            - **Margin-top:** 20px
            - **Position:** Sticky al bottom del contenedor de chat
        
        - **Campo de Texto:**
            - **Textarea:**
                - Placeholder: "Agregar información adicional..."
                - Min-height: 100px
                - Max-height: 200px
                - Resize: Vertical
                - Padding: 12px
                - Border: `border-border-primary`
                - Border-radius: 8px
                - Font-size: 16px
                - Line-height: 1.5
                - Focus: Border `border-primary-600`, sombra `ring-2 ring-primary-200`
        
        - **Botones de Acción:**
            - **Botón de Adjuntar Archivos:**
                - Icono: `<LucideIcon name="paperclip" />`
                - Texto: "Adjuntar archivos"
                - Color: Secundario (outline `border-border-primary`)
                - Position: Absoluto, bottom-right del textarea
                - Margin: 8px
            - **Botón de Enviar Respuesta:**
                - Icono: `<LucideIcon name="send" />`
                - Texto: "Enviar respuesta"
                - Color: Primario (`bg-primary-600 text-white`)
                - Padding: 12px 24px
                - Border-radius: 8px
                - Font-weight: 600
                - Margin-top: 12px
                - Width: 100%
                - Hover: `bg-primary-700`
                - Disabled: `bg-bg-disabled text-text-disabled` (si textarea vacío)
- **CA-04:** Funcionalidades de Interacción:
    
    **Orden y Navegación:**
    
    - **Orden Cronológico:** Mensajes ordenados por fecha de envío (más antiguo arriba)
    - **Scroll Automático:** Al cargar página, scroll hasta último mensaje no leído
    - **Navegación entre Mensajes:** Indicadores visuales de posición en conversación
    - **Marcado como Leído:** Al abrir ticket, marcar todos los mensajes como leídos
    
    **Interacción con Archivos:**
    
    - **Preview de Imágenes:** Click en imagen abre modal con vista ampliada
    - **Descarga de Archivos:** Click en botón de descarga inicia descarga directa
    - **Información de Archivo:** Tooltip con nombre, tamaño y tipo al hover
    
    **Envío de Respuestas:**
    
    - **Validación en Tiempo Real:**
        - Textarea vacío: Botón "Enviar" deshabilitado
        - Textarea con contenido: Botón "Enviar" habilitado
        - Contador de caracteres: "XX/1000"
    - **Confirmación de Envío:**
        - Modal de confirmación: "¿Estás seguro de enviar esta respuesta?"
        - Botones: "Sí, Enviar" (primario) | "Cancelar" (secundario)
    - **Notificación de Envío:**
        - Toast notification: "Respuesta enviada correctamente"
        - Actualización automática de lista de mensajes
        - Scroll hasta nueva respuesta enviada
    
    **Actualización de Estado:**
    
    - **Indicadores Visuales:** Badge de estado actualizado en header
    - **Historial de Cambios:** Registro de cuándo y quién cambió el estado
    - **Notificaciones Automáticas:** Alerta cuando administrador cambia estado
- **CA-05:** Responsive Design:
    - **Desktop (>1024px):**
        - Layout con sidebar opcional para información del ticket
        - Mensajes con ancho generoso (max-width 600px)
        - Avatares de 48px
        - Campo de respuesta con ancho completo
    - **Tablet (768px-1024px):**
        - Layout de una sola columna
        - Mensajes con ancho medio (max-width 500px)
        - Avatares de 40px
        - Campo de respuesta adaptado
    - **Mobile (<768px):**
        - Layout fullscreen con header sticky
        - Mensajes con ancho completo
        - Avatares de 36px
        - Campo de respuesta con botones más grandes
        - Optimización para scroll táctil

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden acceder a detalles de tickets
- **VN-02:** Los usuarios solo pueden ver tickets donde `usuario_id` coincide con su ID
- **VN-03:** Los tickets se marcan automáticamente como leídos al abrir vista de detalle
- **VN-04:** Los usuarios solo pueden responder tickets en estado "En Proceso"
- **VN-05:** Las respuestas de usuarios se registran con timestamp exacto
- **VN-06:** Los archivos adjuntos se validan para tipo y tamaño antes de descargar
- **VN-07:** Los cambios de estado generan notificaciones automáticas al usuario
- **VN-08:** Las conversaciones mantienen orden cronológico estricto
- **VN-09:** Los tickets resueltos o cerrados no permiten nuevas respuestas
- **VN-10:** Los usuarios pueden descargar archivos adjuntos sin restricciones
- **VN-11:** Las respuestas se sanitizan para prevenir XSS
- **VN-12:** Los tickets en estado "En Proceso" muestran campo de respuesta
- **VN-13:** Los tickets en estado "Pendiente" no muestran campo de respuesta
- **VN-14:** Los tickets en estado "Resuelto" o "Cerrado" muestran mensaje de estado final
- **VN-15:** El sistema registra cada acceso al detalle para auditoría

---

### **UI/UX**

- **UX-01:** Vista de conversación tipo chat intuitiva:
    
    ```
    ┌────────────────────────────────────────────────┐
    │  #SOP-2025-0001    [Pendiente] [Login] [Creado: 15/10/2025]  │
    ├────────────────────────────────────────────────┤
    │  ┌─ JD (Padre) ──────────────────────────────────────────┐ │
    │  │ 🧑 Problema con acceso al portal de padres        │ │
    │  │ Enviado: 15/10/2025 14:30                │ │
    │  │                                            │ │
    │  │ No puedo ingresar al portal con mi usuario y     │ │
    │  │ contraseña. He intentado restablecer pero no     │ │
    │  │ recibo el correo de recuperación.              │ │
    │  │                                            │ │
    │  │ 📎 [captura_error.png] [Descargar]          │ │
    │  └────────────────────────────────────────────────────┘ │
    │                                                    │
    │  ┌─ Equipo de Soporte ────────────────────────────────┐ │
    │  │ 🛡️ Respuesta: 15/10/2025 16:45              │ │
    │  │                                            │ │
    │  │ Hola Juan,                                  │ │
    │  │                                            │ │
    │  │ Para restablecer tu contraseña, sigue estos pasos: │ │
    │  │                                            │ │
    │  │ 1. Ve a la página de login                   │ │
    │  │ 2. Haz clic en "¿Olvidaste tu contraseña?"    │ │
    │  │ 3. Ingresa tu correo electrónico             │ │
    │  │                                            │ │
    │  │ ⚠️ Estado actualizado a: En Proceso          │ │
    │  └────────────────────────────────────────────────────┘ │
    │                                                    │
    │  ┌─ Agregar información adicional ─────────────────────┐ │
    │  │ Escribe aquí tu respuesta...                   │ │
    │  │                                            │ │
    │  │                                            │ │
    │  │ [📎 Adjuntar] [Enviar respuesta →]          │ │
    │  └────────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────┘
    
    ```
    
    - Conversación clara con diferenciación visual entre usuario y administrador
    - Información completa del ticket en header sticky
    - Avatares e información de remitente en cada mensaje
    - Archivos adjuntos con preview y descarga
    - Campo de respuesta solo cuando aplica
- **UX-02:** Diferenciación visual clara:
    - **Mensajes de usuario:** Border-left azul, avatar con iniciales
    - **Mensajes de administrador:** Border-left verde, avatar con ícono
    - **Badges de estado:** Colores consistentes con iconos descriptivos
    - **Timestamps claros:** Formato legible con iconos
- **UX-03:** Gestión de archivos intuitiva:
    - Iconos descriptivos según tipo de archivo
    - Preview de imágenes en modal
    - Descarga directa con un clic
    - Información de archivo en tooltip
- **UX-04:** Campo de respuesta contextual:
    - Solo visible cuando ticket está "En Proceso"
    - Placeholder descriptivo
    - Validación en tiempo real
    - Botón de adjuntar archivos accesible
- **UX-05:** Navegación y orden claros:
    - Conversación en orden cronológico
    - Scroll automático al último mensaje
    - Indicadores de mensajes no leídos
    - Marcado automático como leído al abrir
- **UX-06:** Estados vacíos informativos:
    - Mensaje claro cuando no hay mensajes
    - Indicador de carga mientras se obtienen mensajes
    - Estados de error con opciones de recuperación
    - Confirmaciones visuales para acciones importantes
- **UX-07:** Diseño mobile-first:
    - Adaptación completa a diferentes tamaños
    - Elementos táctiles con tamaño adecuado
    - Optimización de scroll en móviles
    - Header sticky siempre visible
- **UX-08:** Accesibilidad y usabilidad:
    - Contraste mínimo WCAG AA en todos los textos
    - Estructura semántica HTML5
    - Navegación por teclado completa
    - Atributos ARIA descriptivos
    - Lectura de pantalla compatible

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar información del ticket y marcar como leído
- **EF-02:** Estado de carga: Mostrar skeleton mientras se obtienen mensajes
- **EF-03:** Estado de conversación: Renderizar mensajes en orden cronológico
- **EF-04:** Estado de respuesta: Mostrar campo de respuesta si ticket está "En Proceso"
- **EF-05:** Estado de envío: Procesar respuesta y actualizar conversación
- **EF-06:** Estado de actualización: Recibir nuevos mensajes en tiempo real
- **EF-07:** Estado de archivo: Descargar o preview archivo adjunto
- **EF-08:** Estado de error: Mostrar mensaje específico con opciones de recuperación
- **EF-09:** Estado de navegación: Scroll entre mensajes con indicadores
- **EF-10:** Estado de responsive: Adaptar layout según tamaño de pantalla

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe estar autenticado
- **VE-02:** ID de ticket debe ser válido y existir en base de datos
- **VE-03:** Usuario debe ser propietario del ticket (`usuario_id` coincide)
- **VE-04:** Respuesta de usuario debe tener entre 1-1000 caracteres
- **VE-05:** Archivos adjuntos deben ser válidos y accesibles
- **VE-06:** Ticket debe estar en estado "En Proceso" para permitir respuesta
- **VE-07:** Contenido de respuesta debe estar sanitizado para prevenir XSS

---

### **Mensajes de Error**

- "No tienes permisos para ver este ticket"
- "El ticket solicitado no existe o no te pertenece"
- "Error al cargar los mensajes del ticket. Intenta nuevamente"
- "No puedes responder un ticket que no está en proceso"
- "Error al enviar tu respuesta. Intenta nuevamente"
- "El archivo adjunto no está disponible para descarga"
- "Error al descargar el archivo. Intenta más tarde"
- "La conversación temporalmente no está disponible"

---

### **Mensajes de Éxito**

- "✅ Respuesta enviada correctamente"
- "📝 Tu respuesta ha sido agregada a la conversación"
- "📁 Archivo descargado correctamente"
- "👁️ Ticket marcado como leído"
- "🔄 Estado del ticket actualizado"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-SOP-01 (Crear Ticket de Soporte - prerrequisito)
    - HU-SOP-02 (Ver Historial de Tickets - navegación previa)
- **HU Siguientes:**
    - HU-SOP-06 (Gestionar Ticket y Responder - vista administrativa)
    - HU-SOP-09 (Notificaciones de Tickets - actualizaciones)

---

### **Componentes y Estructura**

- **Tipo:** Página completa (`/dashboard/soporte/tickets/:id`)
- **Componentes principales:**
  - Reutilizables existentes
    - [Card.jsx](src/components/ui/Card.jsx:1) — Contenedores del header y burbujas de conversación.
    - [Button.jsx](src/components/ui/Button.jsx:1) — Acciones “Ver/Descargar/Enviar”.
    - [Input.jsx](src/components/ui/Input.jsx:1) — Base para textarea de respuesta (con estilos del sistema).
    - [Modal.jsx](src/components/ui/Modal.jsx:1) — Confirmación de envío, preview de imagen/archivo.
    - [LoadingSpinner.jsx](src/components/ui/LoadingSpinner.jsx:1) — Carga de mensajes y adjuntos.
    - [Toast.jsx](src/components/ui/Toast.jsx:1) — Feedback de envío/descarga/errores.
    - [TipoBadge.jsx](src/components/ui/TipoBadge.jsx:1) — Badges de estado y categoría del ticket.
    - [EmptyState.jsx](src/components/academic/EmptyState.jsx:1) — Conversación vacía o sin adjuntos.
  - Nuevos componentes propuestos
    - [TicketHeader.jsx](src/components/support/TicketHeader.jsx:1) — Header sticky con número, estado, categoría y metadatos.
    - [ConversacionChat.jsx](src/components/support/ConversacionChat.jsx:1) — Contenedor scrollable de conversación con gestión de auto-scroll y anclas.
    - [MensajeUsuario.jsx](src/components/support/MensajeUsuario.jsx:1) — Burbuja de usuario (border primario, avatar iniciales).
    - [MensajeAdmin.jsx](src/components/support/MensajeAdmin.jsx:1) — Burbuja de admin (info-light, avatar con ícono).
    - [UsuarioAvatar.jsx](src/components/support/UsuarioAvatar.jsx:1) — Avatar con fallback de iniciales.
    - [AdminAvatar.jsx](src/components/support/AdminAvatar.jsx:1) — Avatar con ícono/imagen de soporte.
    - [ArchivoAdjunto.jsx](src/components/support/ArchivoAdjunto.jsx:1) — Item de archivo con ícono por tipo y acción de descarga.
    - [ListaArchivos.jsx](src/components/support/ListaArchivos.jsx:1) — Contenedor de adjuntos por mensaje.
    - [CampoRespuesta.jsx](src/components/support/CampoRespuesta.jsx:1) — Textarea con contador (1–1000), estados y accesibilidad.
    - [EnviarRespuestaButton.jsx](src/components/support/EnviarRespuestaButton.jsx:1) — Botón con estado loading/disabled según validación.
    - [PreviewImagenModal.jsx](src/components/support/PreviewImagenModal.jsx:1) — Modal de visualización de imágenes adjuntas.
- **Librerías adicionales:**
    - **React Hook Form:** Para gestión de formulario de respuesta
    - **React Dropzone:** Para adjuntar archivos
    - **React Spring:** Para animaciones suaves
    - **React Virtualized:** Para conversaciones largas (optimización)

---

### **Reglas de Negocio Específicas del Módulo (RN-SOP)**

- **RN-SOP-91:** Solo usuarios autenticados pueden acceder a detalles de tickets
- **RN-SOP-92:** Los usuarios solo pueden ver tickets donde `usuario_id` coincide con su ID
- **RN-SOP-93:** Los tickets se marcan automáticamente como leídos al abrir vista de detalle
- **RN-SOP-94:** Los usuarios solo pueden responder tickets en estado "En Proceso"
- **RN-SOP-95:** Las respuestas de usuarios se registran con timestamp exacto y zona horaria
- **RN-SOP-96:** Los archivos adjuntos se validan para tipo MIME y tamaño antes de descargar
- **RN-SOP-97:** Los cambios de estado generan notificaciones automáticas al usuario
- **RN-SOP-98:** Las conversaciones mantienen orden cronológico estricto por fecha de envío
- **RN-SOP-99:** Los tickets resueltos o cerrados no permiten nuevas respuestas de usuarios
- **RN-SOP-100:** Los usuarios pueden descargar archivos adjuntos sin restricciones de tipo
- **RN-SOP-101:** Las respuestas se sanitizan automáticamente para prevenir XSS
- **RN-SOP-102:** Los tickets en estado "En Proceso" muestran campo de respuesta
- **RN-SOP-103:** Los tickets en estado "Pendiente" no muestran campo de respuesta
- **RN-SOP-104:** Los tickets en estado "Resuelto" o "Cerrado" muestran mensaje de estado final
- **RN-SOP-105:** El sistema registra cada acceso al detalle para auditoría con IP y navegador
- **RN-SOP-106:** Las respuestas de usuarios se limitan a 1000 caracteres para optimizar almacenamiento
- **RN-SOP-107:** Los usuarios pueden adjuntar máximo 3 archivos por respuesta
- **RN-SOP-108:** Los archivos adjuntos no deben exceder 5MB por archivo
- **RN-SOP-109:** Las conversaciones se actualizan en tiempo real vía WebSocket
- **RN-SOP-110:** Los mensajes no leídos se destacan visualmente en la conversación
- **RN-SOP-111:** El sistema genera backup automático de conversaciones importantes
- **RN-SOP-112:** Las respuestas se envían con confirmación de recepción al usuario
- **RN-SOP-113:** Los tickets inactivos por más de 30 días se archivan automáticamente
- **RN-SOP-114:** El campo de respuesta se deshabilita si el ticket cambia de estado
- **RN-SOP-115:** El sistema cumple con WCAG 2.1 nivel AA de accesibilidad en vista de detalle


---

# **Historia de Usuario Detallada - HU-SOP-02**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Usuario que consulta su historial de tickets
2. **tickets_soporte** - Tickets principales con información del problema
3. **mensajes_ticket** - Mensajes de la conversación del ticket
4. **archivos_adjuntos** - Archivos adjuntos a los tickets
5. **estados_tickets** - Estados del flujo de soporte
6. **categorias_tickets** - Categorías organizativas para tickets

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Roles y permisos configurados
- **HU-SOP-01** - Crear Ticket de Soporte (prerrequisito para tener historial)

### **Roles Involucrados:**

- **Padre:** Consulta tickets sobre acceso de hijos, calificaciones, comunicados
- **Docente:** Consulta tickets sobre gestión de notas, mensajería, archivos
- **Director:** Consulta tickets sobre administración general y reportes

---

## **HU-SOP-02 — Ver Historial de Tickets**

**Título:** Panel de seguimiento personalizado con filtros avanzados y estados actualizados

**Historia:**

> Como usuario (padre/docente/director), quiero consultar el historial de mis tickets con estados actualizados para hacer seguimiento a mis solicitudes de soporte.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al historial desde múltiples puntos:
    - **Botón "Mis Tickets"** en modal de confirmación de HU-SOP-01
    - **Opción en menú lateral:** "Soporte → Mis Tickets"
    - **URL directa:** `/dashboard/soporte/mis-tickets`
    - **Link desde dashboard:** Badge con contador de tickets pendientes
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar historial (Backend):
    
    **Validación de Acceso:**
    
    - Verificar que usuario está autenticado
    - Verificar que usuario tiene tickets creados
    - Si no hay tickets: Mostrar estado vacío con opción de crear
    
    **Carga de Tickets:**
    
    ```sql
    -- Obtener tickets del usuario con información completa
    SELECT 
      ts.id, ts.numero_ticket, ts.titulo, ts.descripcion, ts.fecha_creacion,
      ts.fecha_ultima_actualizacion, ts.estado_id, ts.categoria_id,
      te.nombre as estado_nombre, te.color as estado_color,
      tc.nombre as categoria_nombre, tc.icono as categoria_icono,
      COUNT(mt.id) as cantidad_mensajes,
      MAX(mt.fecha_envio) as ultimo_mensaje_fecha
    FROM tickets_soporte ts
    JOIN estados_tickets te ON ts.estado_id = te.id
    JOIN categorias_tickets tc ON ts.categoria_id = tc.id
    LEFT JOIN mensajes_ticket mt ON ts.id = mt.ticket_id
    WHERE ts.usuario_id = :usuario_id
    GROUP BY ts.id
    ORDER BY ts.fecha_ultima_actualizacion DESC;
    ```
    
    **Si hay tickets:**
    
    - Cargar listado completo con estados actualizados
    - Renderizar panel de historial
- **CA-03:** Layout del panel de historial:
    
    **HEADER FIJO DEL PANEL**
    
    - **Título del Panel:**
        - Texto grande, bold (24px)
        - Color: `text-text-primary`
        - Texto: "Mis Tickets de Soporte"
        - Centrado horizontalmente
    - **Resumen de Estadísticas:**
        - Card horizontal con 4 métricas:
            -  "Pendientes: X"
            -  "En Proceso: Y"
            -  "Resueltos: Z"
            -  "Cerrados: W"
        - Background: `bg-info-light`
        - Border: `border-info`
        - Padding: 16px
    - **Botón "Crear Nuevo Ticket":**
        - Color primario (`bg-primary-600 text-white`)
        - Icono: `<LucideIcon name="plus" />`
        - Posición: Esquina superior derecha
        - Click redirige a HU-SOP-01
    - **Altura fija:** 100px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    
    **SECCIÓN PRINCIPAL: Pestañas de Estados y Filtros**
    
    - **Pestañas de Navegación por Estado:**
        
        **Layout de Tabs Horizontales:**
        
        - **Pestaña "Todos"** (activa por defecto):
            - Icono: `<LucideIcon name="list" />`
            - Color activo: `bg-primary-600 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador total de tickets
        - **Pestaña "Pendientes"**:
            - Icono: `<LucideIcon name="clock" />`
            - Color activo: `bg-warning-500 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador de tickets pendientes
        - **Pestaña "En Proceso"**:
            - Icono: `<LucideIcon name="loader" />`
            - Color activo: `bg-blue-500 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador de tickets en proceso
        - **Pestaña "Resueltos"**:
            - Icono: `<LucideIcon name="check-circle" />`
            - Color activo: `bg-success-500 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador de tickets resueltos
        - **Pestaña "Cerrados"**:
            - Icono: `<LucideIcon name="x-circle" />`
            - Color activo: `bg-gray-500 text-white`
            - Color inactivo: `text-text-secondary`
            - Badge con contador de tickets cerrados
        - **Transición suave** al cambiar entre pestañas (fade 300ms)
        - **Underline animado** en pestaña activa
    
    - **Panel de Filtros Avanzados:**
        
        - **Filtros Principales:**
            
            **Búsqueda por Texto:**
            - Input con placeholder "Buscar por número de ticket o título..."
            - Icono de búsqueda `<LucideIcon name="search" />`
            - Búsqueda en tiempo real (debounce 300ms)
            - Resalta términos coincidentes en resultados
            
            **Filtro por Categoría:**
            - Select con todas las categorías disponibles
            - Icono: `<LucideIcon name="filter" />`
            - Opción "Todas" (default)
            
            **Filtro por Rango de Fechas:**
            - Date range picker con fecha inicio y fin
            - Icono: `<LucideIcon name="calendar" />`
            - Preset buttons: "Hoy", "Esta semana", "Este mes", "Todo"
        
        - **Botones de Control:**
            - **"Aplicar Filtros"**: Color primario (`bg-primary-600`)
            - **"Limpiar Filtros"**: Secundario (outline `border-border-primary`)
            - Visible solo si hay filtros activos
        
        - **Indicadores Visuales:**
            - Badge con contador de filtros activos: "X filtros aplicados"
            - Resumen de resultados: "Mostrando Y de Z tickets"
    
    - **SECCIÓN DE LISTADO DE TICKETS:**
        
        **Vista Desktop (Tarjetas):**
        
        - **Grid de Tarjetas:**
            - Layout: Grid de 2 columnas con gap de 20px
            - Cada tarjeta con:
                - **Background:** `bg-bg-card`
                - **Border:** `border-border-primary`
                - **Border-radius:** 12px
                - **Padding:** 20px
                - **Sombra:** `shadow-sm`
                - **Hover:** Elevación `shadow-md`, transform `scale(1.02)`
                - **Transición:** `transition: all 0.2s ease`
            
            - **Header de Tarjeta:**
                - **Badge de Estado:**
                    - Circular con color según estado:
                        - Pendiente: `bg-warning-100 text-warning-700`
                        - En Proceso: `bg-blue-100 text-blue-700`
                        - Resuelto: `bg-success-100 text-success-700`
                        - Cerrado: `bg-gray-100 text-gray-700`
                    - Icono según estado:
                        - Pendiente: `<LucideIcon name="clock" />`
                        - En Proceso: `<LucideIcon name="loader" />`
                        - Resuelto: `<LucideIcon name="check-circle" />`
                        - Cerrado: `<LucideIcon name="x-circle" />`
                - **Número de Ticket:**
                    - Texto grande, bold (18px)
                    - Color: `text-text-primary`
                    - Formato: "#SOP-2025-0001"
                    - Font-family: monoespaciado para mejor legibilidad
            
            - **Contenido de Tarjeta:**
                - **Título del Problema:**
                    - Bold (16px), color `text-text-primary`
                    - Truncado a 60 caracteres con tooltip
                - **Badge de Categoría:**
                    - Pequeño, esquina superior derecha
                    - Color según categoría:
                        - Login: `bg-red-100 text-red-700`
                        - Calificaciones: `bg-green-100 text-green-700`
                        - Mensajes: `bg-blue-100 text-blue-700`
                        - Archivos: `bg-yellow-100 text-yellow-700`
                        - Navegación: `bg-purple-100 text-purple-700`
                        - Otro: `bg-gray-100 text-gray-700`
                    - Icono según categoría
                - **Información Temporal:**
                    - **Fecha de Creación:** Texto pequeño `text-text-secondary`
                        - Formato relativo: "Creado hace 2 días"
                        - Icono: `<LucideIcon name="calendar" />`
                    - **Última Actualización:** Texto pequeño `text-text-secondary`
                        - Formato relativo: "Actualizado hace 5 horas"
                        - Icono: `<LucideIcon name="refresh-cw" />`
                - **Badge de "Nueva Respuesta":**
                    - Visible solo si administrador respondió después de última visita del usuario
                    - Background: `bg-primary-100 text-primary-700`
                    - Texto: "Nueva respuesta"
                    - Icono: `<LucideIcon name="bell" />`
                    - Animación: Pulse sutil
            
            - **Footer de Tarjeta:**
                - **Botón "Ver Detalle":**
                    - Color primario (`bg-primary-600 text-white`)
                    - Icono: `<LucideIcon name="eye" />`
                    - Click redirige a HU-SOP-03
                    - Width: 100%
        
        **Vista Mobile (Lista):**
        
        - **Lista Vertical:**
            - Layout: Una columna con gap de 12px
            - Cada item con:
                - **Background:** `bg-bg-card`
                - **Border-left:** 4px sólido con color según estado
                - **Padding:** 16px
                - **Border-radius:** 8px
                - **Margin-bottom:** 8px
            
            - **Contenido de Item:**
                - **Header:**
                    - **Badge de Estado:** Pequeño, inline con texto
                    - **Número de Ticket:** Bold, inline
                - **Título:** Truncado a 80 caracteres
                - **Información Temporal:** En línea separada
                - **Badge de "Nueva Respuesta"** (si aplica)
                - **Botón "Ver Detalle":** Pequeño, al final del item
- **CA-04:** Estado Vacío (Sin Tickets):
    
    **Diseño del Estado Vacío:**
    
    - **Ilustración Contextual:**
        - Imagen grande (300px) de personaje buscando tickets
        - Color: `text-text-muted`
        - Estilo: Ilustración amigable y motivacional
    
    - **Mensaje Principal:**
        - Texto grande, bold (20px)
        - Color: `text-text-primary`
        - Texto: "No tienes tickets de soporte aún"
        - Submensaje: "Cuando crees un ticket, aparecerá aquí para seguimiento"
    
    - **Botón de Acción:**
        - **"Crear Primer Ticket"**:
            - Color primario (`bg-primary-600 text-white`)
            - Icono: `<LucideIcon name="plus" />`
            - Tamaño grande: Padding 16px 32px
            - Click redirige a HU-SOP-01
            - Animación: Bounce suave al aparecer
    
    - **Sugerencias Adicionales:**
        - **"Visitar Centro de Ayuda"**:
            - Texto pequeño con enlace
            - Click redirige a HU-SOP-00
            - Icono: `<LucideIcon name="help-circle" />`
- **CA-05:** Funcionalidades de Interacción:
    
    **Detalles de Tickets:**
    
    - **Click en tarjeta/item:** Navegación a HU-SOP-03 con ID del ticket
    - **Hover effects:** Indicadores visuales de elementos interactivos
    - **Transiciones suaves:** Animaciones al cambiar entre pestañas y filtros
    
    **Actualización en Tiempo Real:**
    
    - **WebSocket o Polling:** Actualización automática de estados cada 30 segundos
    - **Notificaciones Push:** Alerta cuando hay nuevas respuestas
    - **Badge de contador:** Actualización automática en header
    
    **Búsqueda Avanzada:**
    
    - **Búsqueda por número:** Formato #SOP-YYYY-NNNN
    - **Búsqueda por título:** Coincidencias parciales y exactas
    - **Resaltado de términos:** Marcado visual de coincidencias
    - **Historial de búsquedas:** Guardar búsquedas recientes para acceso rápido
    
    **Filtros Combinados:**
    
    - **Operadores lógicos:** Combinación de múltiples filtros con AND/OR
    - **Preservación de estado:** Mantener filtros al navegar entre páginas
    - **URL compartible:** Filtros reflejados en URL para compartir vistas
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Grid de 2 columnas para tarjetas
        - Panel de filtros fijo en lateral derecho
        - Pestañas horizontales con subrayado animado
        - Hover effects con transformaciones suaves
    - **Tablet (768px-1024px):**
        - Grid de 2 columnas con tarjetas más compactas
        - Panel de filtros colapsable en header
        - Pestañas adaptadas al tamaño táctil
    - **Mobile (<768px):**
        - Lista vertical de items con border-left indicador
        - Filtros en modal slide-up desde bottom
        - Pestañas verticales en header
        - Botones touch-friendly con padding generoso

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden acceder a su historial
- **VN-02:** Los usuarios solo pueden ver sus propios tickets (usuario_id coincidente)
- **VN-03:** Los estados se muestran con colores e iconos consistentes
- **VN-04:** Las fechas se muestran en formato relativo para mejor comprensión
- **VN-05:** Los filtros se aplican con operador AND entre criterios
- **VN-06:** La búsqueda resalta términos coincidentes en título y número
- **VN-07:** El badge de "Nueva respuesta" aparece solo si hay respuestas no leídas
- **VN-08:** Los tickets se ordenan por última actualización (más reciente primero)
- **VN-09:** Los filtros de fecha validan que inicio ≤ fin
- **VN-10:** La paginación muestra máximo 20 resultados por página
- **VN-11:** Los contadores de tickets se actualizan en tiempo real
- **VN-12:** Los usuarios pueden marcar tickets como leídos al ver detalles

---

### **UI/UX**

- **UX-01:** Navegación por pestañas intuitiva:
    - Pestañas con contadores y colores distintivos
    - Filtros visuales con iconos descriptivos
    - Tarjetas con información jerárquica clara
- **UX-02:** Diseño de estado vacío motivacional:
    - Ilustración contextual atractiva
    - Mensaje amigable sin culpar al usuario
    - Botón de acción principal destacado
    - Sugerencia de alternativa (centro de ayuda)
- **UX-03:** Experiencia de búsqueda fluida:
    - Resultados en tiempo real mientras se escribe
    - Resaltado visual de términos coincidentes
    - Búsqueda por número con formato específico
    - Historial de búsquedas recientes
- **UX-04:** Indicadores visuales de estado:
    - Colores consistentes para cada estado
    - Iconos descriptivos para cada estado
    - Animaciones sutiles para cambios de estado
    - Badges de "Nueva respuesta" con pulse
- **UX-05:** Filtros avanzados intuitivos:
    - Date range picker con presets comunes
    - Combinación de múltiples criterios
    - Indicadores visuales de filtros activos
    - Resumen de resultados filtrados
- **UX-06:** Actualización en tiempo real:
    - Actualización automática sin recargar página
    - Notificaciones visuales de cambios
    - Contadores actualizados dinámicamente
    - Indicadores de conexión
- **UX-07:** Diseño mobile-first:
    - Adaptación completa a diferentes tamaños
    - Elementos táctiles con tamaño adecuado
    - Navegación por gestos (swipe)
    - Optimización de rendimiento para móviles
- **UX-08:** Accesibilidad y usabilidad:
    - Contraste mínimo WCAG AA en todos los elementos
    - Navegación completa por teclado
    - Estructura semántica HTML5
    - Atributos ARIA descriptivos
    - Lectura de pantalla compatible

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar historial con pestaña "Todos" activa
- **EF-02:** Estado de filtros: Aplicar filtros y actualizar listado
- **EF-03:** Estado de búsqueda: Mostrar resultados destacados mientras se escribe
- **EF-04:** Estado de navegación: Cambiar entre pestañas de estado
- **EF-05:** Estado de actualización: Recibir cambios en tiempo real via WebSocket
- **EF-06:** Estado de interacción: Hover y click en tarjetas/items
- **EF-07:** Estado de paginación: Navegar entre páginas de resultados
- **EF-08:** Estado de detalle: Navegar a vista detallada de ticket
- **EF-09:** Estado de vacío: Mostrar ilustración y mensaje orientativo
- **EF-10:** Estado de responsive: Adaptar layout según tamaño de pantalla

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe estar autenticado
- **VE-02:** Usuario debe tener al menos un ticket creado (opcional)
- **VE-03:** Término de búsqueda debe tener mínimo 2 caracteres
- **VE-04:** Rango de fechas debe ser válido (inicio ≤ fin)
- **VE-05:** Categoría seleccionada debe existir en lista de categorías válidas
- **VE-06:** Número de página debe ser entero positivo
- **VE-07:** ID de ticket debe ser válido y pertenecer al usuario

---

### **Mensajes de Error**

- "No tienes permisos para acceder a esta sección"
- "Error al cargar tus tickets. Intenta nuevamente"
- "La búsqueda temporalmente no está disponible. Intenta en unos minutos"
- "El rango de fechas no es válido"
- "No se encontraron tickets con los filtros seleccionados"
- "Error al actualizar el estado del ticket. Intenta nuevamente"

---

### **Mensajes de Éxito**

- " Filtros aplicados correctamente"
- " Se encontraron X tickets con tu búsqueda"
- " Estado del ticket actualizado"
- " Ticket marcado como leído"
- " Tienes X respuestas nuevas"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-SOP-01 (Crear Ticket de Soporte - prerrequisito)
- **HU Siguientes:**
    - HU-SOP-03 (Ver Detalle de Ticket y Conversación - acción principal)
    - HU-SOP-09 (Notificaciones de Tickets - actualizaciones)

---

### **Reglas de Negocio Específicas del Módulo (RN-SOP)**

- **RN-SOP-66:** Solo usuarios autenticados pueden acceder a su historial de tickets
- **RN-SOP-67:** Los usuarios solo pueden ver tickets donde `usuario_id` coincide con su ID
- **RN-SOP-68:** Los tickets se ordenan por `fecha_ultima_actualizacion` descendente
- **RN-SOP-69:** Los estados se muestran con colores e iconos predefinidos consistentes
- **RN-SOP-70:** Las fechas se muestran en formato relativo para mejor comprensión del usuario
- **RN-SOP-71:** Los filtros se combinan con operador AND entre todos los criterios
- **RN-SOP-72:** La búsqueda funciona en número de ticket y título con resaltado de coincidencias
- **RN-SOP-73:** El badge de "Nueva respuesta" aparece solo si hay mensajes no leídos del administrador
- **RN-SOP-74:** Los tickets se marcan automáticamente como leídos al abrir vista de detalle
- **RN-SOP-75:** Los filtros de fecha validan que la fecha de inicio sea anterior o igual a la fecha de fin
- **RN-SOP-76:** La paginación muestra máximo 20 tickets por página para optimizar rendimiento
- **RN-SOP-77:** Los contadores de tickets por estado se calculan en tiempo real
- **RN-SOP-78:** Las actualizaciones de estado se envían vía WebSocket para actualización inmediata
- **RN-SOP-79:** Los usuarios pueden buscar por número de ticket con formato #SOP-YYYY-NNNN
- **RN-SOP-80:** Los usuarios pueden filtrar por múltiples categorías simultáneamente
- **RN-SOP-81:** El historial mantiene registro completo de todos los estados del ticket
- **RN-SOP-82:** Los usuarios pueden exportar su historial de tickets a CSV (futuro)
- **RN-SOP-83:** El sistema registra cada acceso al historial para auditoría
- **RN-SOP-84:** Los tickets cerrados pueden reabrirse dentro de 30 días (futuro)
- **RN-SOP-85:** El historial cumple con WCAG 2.1 nivel AA de accesibilidad
- **RN-SOP-86:** Las búsquedas se registran anónimamente para análisis de contenido
- **RN-SOP-87:** Los filtros se preservan en URL para compartir vistas específicas
- **RN-SOP-88:** El sistema cachea resultados por 5 minutos para optimizar rendimiento
- **RN-SOP-89:** Los usuarios pueden marcar tickets como favoritos para acceso rápido (futuro)
- **RN-SOP-90:** Las notificaciones de nuevas respuestas se envían según preferencias del usuario


---

# **Historia de Usuario Detallada - HU-SOP-01**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Usuario que crea el ticket de soporte
2. **tickets_soporte** - Ticket principal con información del problema
3. **mensajes_ticket** - Mensajes de la conversación del ticket
4. **archivos_adjuntos** - Archivos adjuntos al ticket
5. **categorias_tickets** - Categorías organizativas para tickets
6. **estados_tickets** - Estados del flujo de soporte

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Roles y permisos configurados
- **HU-SOP-00** - Centro de Ayuda (alternativa antes de crear ticket)

### **Roles Involucrados:**

- **Padre:** Crea tickets sobre acceso de hijos, calificaciones, comunicados
- **Docente:** Crea tickets sobre gestión de notas, mensajería, archivos
- **Director:** Crea tickets sobre administración general y reportes

---

## **HU-SOP-01 — Crear Ticket de Soporte**

**Título:** Formulario estructurado para reporte de problemas técnicos con archivos adjuntos

**Historia:**

> Como usuario (padre/docente/director), quiero crear un ticket de soporte técnico con descripción detallada y archivos adjuntos para reportar problemas específicos que no puedo resolver con el FAQ.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al formulario desde múltiples puntos:
    - **Botón "Crear Ticket"** en HU-SOP-00 (centro de ayuda)
    - **Botón flotante "¿No encontraste lo que buscabas? Crear ticket"** en HU-SOP-00
    - **Opción en menú lateral:** "Soporte → Crear Ticket"
    - **URL directa:** `/dashboard/soporte/crear-ticket`
    - Transición suave con animación de fade-in
- **CA-02:** Layout del formulario de creación:
    
    **HEADER FIJO DEL FORMULARIO**
    
    - **Título del Formulario:**
        - Texto grande, bold (24px desktop, 20px móvil)
        - Color: `text-text-primary`
        - Texto: "Crear Ticket de Soporte"
        - Centrado horizontalmente
    - **Breadcrumb de navegación:**
        - "Inicio > Soporte > Crear Ticket"
        - Color: `text-text-secondary`
        - Click en "Soporte" redirige a HU-SOP-00
    - **Altura fija:** 80px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    
    **CONTENIDO PRINCIPAL (Scrollable)**
    
    - **Sección de Información del Problema:**
        
        **Campo "Título del Problema":**
        
        - **Input de texto:**
            - Placeholder: "Resume tu problema en pocas palabras..."
            - Obligatorio: ✓
            - Mínimo: 10 caracteres
            - Máximo: 200 caracteres
            - Contador de caracteres: "XX/200"
            - Validación en tiempo real
            - Estilo:
                - Border: `border-border-primary`
                - Border-radius: 8px
                - Padding: 12px 16px
                - Width: 100%
                - Font-size: 16px
            - **Estados:**
                - Normal: Border gris `border-border-primary`
                - Focus: Border primario `border-primary-600`, sombra azul `ring-2 ring-primary-200`
                - Error: Border rojo `border-error`, mensaje de error debajo
        
        **Campo "Categoría":**
        
        - **Select obligatorio:**
            - Placeholder: "Selecciona una categoría..."
            - Opciones:
                - "Login" (icono: `<LucideIcon name="log-in" />`)
                - "Calificaciones" (icono: `<LucideIcon name="bar-chart" />`)
                - "Mensajes" (icono: `<LucideIcon name="message-square" />`)
                - "Archivos" (icono: `<LucideIcon name="folder" />`)
                - "Navegación" (icono: `<LucideIcon name="compass" />`)
                - "Otro" (icono: `<LucideIcon name="more-horizontal" />`)
            - Estilo:
                - Border: `border-border-primary`
                - Border-radius: 8px
                - Padding: 12px 16px
                - Width: 100%
                - Font-size: 16px
            - **Validación:** Selección obligatoria
        
        **Campo "Descripción Detallada":**
        
        - **Textarea:**
            - Placeholder: "Describe el problema con el mayor detalle posible: qué estabas haciendo, qué error apareció, en qué página ocurre, etc."
            - Obligatorio: ✓
            - Mínimo: 20 caracteres
            - Máximo: 1000 caracteres
            - Contador de caracteres: "XX/1000"
            - Auto-expandible hasta 300px de altura
            - Resize: Vertical
            - Estilo:
                - Border: `border-border-primary`
                - Border-radius: 8px
                - Padding: 12px 16px
                - Width: 100%
                - Font-size: 16px
                - Line-height: 1.5
            - **Validación en tiempo real**
        
        **Campo "Archivos Adjuntos" (Opcional):**
        
        - **Área de Upload con Drag & Drop:**
            - **Estado inicial:**
                - Border: `border-dashed border-border-secondary`
                - Background: `bg-bg-sidebar`
                - Border-radius: 8px
                - Padding: 32px
                - Texto centrado: "Arrastra archivos aquí o haz clic para seleccionar"
                - Icono: `<LucideIcon name="upload-cloud" />` (grande, 48px)
                - Color: `text-text-muted`
            - **Estado hover:**
                - Border: `border-primary-400`
                - Background: `bg-primary-50`
                - Color: `text-primary-600`
            - **Estado drag-over:**
                - Border: `border-primary-600`
                - Background: `bg-primary-100`
                - Color: `text-primary-700`
        
        - **Restricciones de archivos:**
            - Máximo: 3 archivos
            - Tamaño máximo: 5MB por archivo
            - Tipos permitidos: PDF, JPG, PNG
            - Validación de tipo y tamaño en frontend y backend
        
        - **Preview de archivos seleccionados:**
            - **Lista horizontal** con miniaturas
            - **Cada archivo muestra:**
                - Miniatura (para imágenes) o icono (para PDF)
                - Nombre del archivo (truncado con tooltip)
                - Tamaño del archivo
                - Botón "X" para eliminar
            - **Layout:** Gap de 8px entre archivos
            - **Estilo:** Background `bg-bg-card`, border `border-border-primary`, border-radius 6px
            - **Padding:** 8px
    
    - **Sección de Acciones:**
        
        - **Botón "Enviar Ticket":**
            - **Diseño:**
                - Color primario (`bg-primary-600 text-white`)
                - Icono: `<LucideIcon name="send" />`
                - Tamaño grande: Padding 16px 32px
                - Width: 100% (móvil), auto (desktop)
                - Font-size: 18px
                - Font-weight: 600
                - Border-radius: 8px
            - **Estados:**
                - **Habilitado:** Solo si todos los campos obligatorios son válidos
                - **Deshabilitado:** Gris claro `bg-bg-disabled text-text-disabled`, cursor not-allowed
                - **Hover (habilitado):** Color más oscuro `bg-primary-700`, escala 1.02
                - **Cargando:** Spinner blanco + texto "Enviando..."
            - **Click:** Abre modal de confirmación
        
        - **Botón "Cancelar":**
            - Secundario (outline `border-border-primary`)
            - Icono: `<LucideIcon name="x" />`
            - Click redirige a HU-SOP-00
- **CA-03:** Modal de Confirmación de Envío:
    
    **Trigger:** Click en botón "Enviar Ticket" con formulario válido
    
    **Diseño del Modal:**
    - **Overlay:** Oscuro `bg-bg-overlay` con blur (z-index alto)
    - **Modal centrado:** Ancho máximo 500px, animación fade-in + scale
    - **Header del Modal:**
        - **Icono de confirmación:** `<LucideIcon name="check-circle" />` (verde, 48px)
        - Color: `text-success`
        - Animación: Bounce suave al aparecer
    - **Contenido del Modal:**
        - **Título:** "¿Confirmar envío de ticket?"
        - **Mensaje:** "Revisa cuidadosamente la información antes de enviar. Una vez creado, no podrás modificar el título y categoría."
        - **Resumen del ticket:**
            - Título: "[Título ingresado]"
            - Categoría: "[Categoría seleccionada]"
            - Archivos: "X archivos adjuntos" (si aplica)
    - **Botones de Acción:**
        - **"Sí, Enviar Ticket"** (primario):
            - Color: `bg-success-600 text-white`
            - Icono: `<LucideIcon name="send" />`
            - Click: Procesa envío del ticket
        - **"Revisar"** (secundario):
            - Color: outline `border-border-primary`
            - Click: Cierra modal y vuelve al formulario
- **CA-04:** Proceso de Envío y Validaciones:
    
    **Validación Frontend (Pre-envío):**
    
    - Verificar que todos los campos obligatorios tienen datos válidos
    - Verificar que título tiene entre 10-200 caracteres
    - Verificar que descripción tiene entre 20-1000 caracteres
    - Verificar que categoría está seleccionada
    - Verificar que archivos cumplen restricciones (tipo, tamaño, cantidad)
    - Mostrar errores específicos por campo si fallan validaciones
    - Scroll automático al primer campo con error
    
    **Validación Backend:**
    
    - Verificar que usuario está autenticado
    - Sanitizar contenido de título y descripción (eliminar HTML malicioso)
    - Validar estructura de archivos (tipo MIME, tamaño real)
    - Generar número de ticket único con formato: #SOP-YYYY-XXXX
    - Asignar estado inicial: "Pendiente"
    - Calcular prioridad automática según categoría:
        - Login: Crítica
        - Calificaciones, Mensajes: Alta
        - Archivos, Navegación: Normal
        - Otro: Baja
    
    **Inserción en Base de Datos:**
    
    ```sql
    INSERT INTO tickets_soporte (
      numero_ticket, titulo, descripcion, categoria_id, 
      usuario_id, estado_id, prioridad, fecha_creacion
    ) VALUES (
      ?, ?, ?, ?, ?, ?, NOW()
    );
    
    INSERT INTO mensajes_ticket (
      ticket_id, remitente_id, contenido, fecha_envio
    ) VALUES (
      ?, ?, ?, NOW()
    );
    
    INSERT INTO archivos_adjuntos (
      ticket_id, nombre_archivo, ruta, tipo, tamaño
    ) VALUES (?, ?, ?, ?, ?);
    ```
    
    - **Generación de número de ticket:**
        - Formato: #SOP-2025-0001 (incremental anual)
        - Prefijo: #SOP-
        - Año: 4 dígitos
        - Número: 4 dígitos con ceros a la izquierda
- **CA-05:** Modal de Confirmación de Éxito:
    
    **Trigger:** Envío exitoso del ticket
    
    **Diseño del Modal:**
    
    - **Overlay:** Oscuro `bg-bg-overlay` con blur
    - **Modal centrado:** Ancho máximo 450px, animación fade-in + scale
    - **Header del Modal:**
        - **Icono de éxito:** `<LucideIcon name="check-circle-2" />` (verde, 64px)
        - Color: `text-success`
        - Animación: Bounce + confetti (opcional)
    - **Contenido del Modal:**
        - **Título:** "Ticket creado exitosamente"
        - **Número de ticket:** Grande, bold, color primario
            - Texto: "#SOP-2025-0001"
            - Background: `bg-primary-100 text-primary-700`
            - Padding: 8px 16px
            - Border-radius: 20px
            - Display: inline-block
        - **Mensaje de tiempo estimado:**
            - Texto: "Tiempo estimado de respuesta: 24-48 horas"
            - Icono: `<LucideIcon name="clock" />`
            - Color: `text-text-secondary`
        - **Mensaje adicional:**
            - Texto: "Te notificaremos cuando haya actualizaciones en tu ticket"
            - Icono: `<LucideIcon name="bell" />`
    - **Botones de Acción:**
        - **"Ver mis Tickets"** (primario):
            - Color: `bg-primary-600 text-white`
            - Icono: `<LucideIcon name="list" />`
            - Click: Redirige a HU-SOP-02
        - **"Crear otro Ticket"** (secundario):
            - Color: outline `border-border-primary`
            - Icono: `<LucideIcon name="plus" />`
            - Click: Cierra modal y resetea formulario
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Formulario centrado con max-width 600px
        - Campos con padding lateral generoso
        - Layout en dos columnas para archivos y acciones
        - Modal con tamaño mediano
    - **Tablet (768px-1024px):**
        - Formulario centrado con max-width 500px
        - Campos con padding lateral reducido
        - Layout en una columna
        - Modal adaptado al tamaño
    - **Mobile (<768px):**
        - Formulario full-width con padding 16px
        - Campos con padding lateral mínimo
        - Botón "Enviar" con ancho completo
        - Modal fullscreen con botones en bottom

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden crear tickets
- **VN-02:** El título del ticket debe tener entre 10-200 caracteres
- **VN-03:** La descripción debe tener entre 20-1000 caracteres
- **VN-04:** La categoría es obligatoria y debe existir en el catálogo
- **VN-05:** Los archivos adjuntos son opcionales pero deben cumplir restricciones si se incluyen
- **VN-06:** Máximo 3 archivos por ticket, 5MB cada uno
- **VN-07:** Tipos permitidos: PDF, JPG, PNG únicamente
- **VN-08:** El contenido debe ser sanitizado para prevenir XSS
- **VN-09:** El número de ticket debe ser único y secuencial
- **VN-10:** La prioridad se asigna automáticamente según categoría
- **VN-11:** El estado inicial de todo ticket es "Pendiente"
- **VN-12:** Un usuario puede tener múltiples tickets abiertos simultáneamente
- **VN-13:** Los archivos se almacenan en sistema de archivos cloud (ej. Cloudinary)
- **VN-14:** El ticket se crea con timestamp exacto de creación

---

### **UI/UX**

- **UX-01:** Formulario estructurado con validación en tiempo real:
    - Validación visual en tiempo real
    - Contadores de caracteres siempre visibles
    - Estados de error claros con mensajes específicos
    - Indicadores de campos obligatorios con asterisco rojo
- **UX-02:** Área de upload intuitiva:
    - Drag & drop con indicadores visuales claros
    - Preview de archivos seleccionados con opción de eliminar
    - Indicadores de progreso durante subida
    - Validación de tipo y tamaño antes de enviar
- **UX-03:** Modales de confirmación claros:
    - Modal de pre-confirmación con resumen de datos
    - Modal de éxito con información del ticket creado
    - Animaciones suaves (bounce, confetti)
    - Botones con jerarquía visual clara
- **UX-04:** Estados de carga y feedback:
    - Spinner en botón durante envío
    - Deshabilitación de formulario durante procesamiento
    - Indicadores de progreso para archivos grandes
    - Toast notifications para acciones rápidas
- **UX-05:** Diseño mobile-first:
    - Formulario optimizado para pantallas pequeñas
    - Campos táctiles con tamaño adecuado
    - Botones fáciles de presionar
    - Modales fullscreen en móvil
- **UX-06:** Accesibilidad y usabilidad:
    - Navegación completa por teclado
    - Etiquetas ARIA descriptivas
    - Contraste mínimo WCAG AA
    - Estructura semántica HTML5
    - Placeholders descriptivos

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar formulario con campos vacíos
- **EF-02:** Estado de llenado: Validación en tiempo real mientras usuario escribe
- **EF-03:** Estado de archivos: Drag & drop y preview de archivos seleccionados
- **EF-04:** Estado de validación: Mostrar errores si hay campos inválidos
- **EF-05:** Estado de confirmación: Abrir modal con resumen del ticket
- **EF-06:** Estado de envío: Procesar formulario con spinner y deshabilitar campos
- **EF-07:** Estado de éxito: Mostrar modal de confirmación con número de ticket
- **EF-08:** Estado de redirección: Opciones para ver tickets o crear otro
- **EF-09:** Estado de error: Mostrar alert específica con opción de reintentar

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe estar autenticado
- **VE-02:** Título debe tener entre 10-200 caracteres
- **VE-03:** Descripción debe tener entre 20-1000 caracteres
- **VE-04:** Categoría debe ser válida y obligatoria
- **VE-05:** Archivos (si se incluyen): máximo 3, 5MB c/u, tipos PDF/JPG/PNG
- **VE-06:** Contenido debe estar sanitizado para prevenir XSS
- **VE-07:** Todos los campos obligatorios deben estar completos

---

### **Mensajes de Error**

- "El título debe tener entre 10 y 200 caracteres"
- "La descripción debe tener entre 20 y 1000 caracteres"
- "Debes seleccionar una categoría para el ticket"
- "Los archivos adjuntos no deben exceder 5MB cada uno"
- "Solo se permiten archivos PDF, JPG y PNG"
- "No puedes adjuntar más de 3 archivos"
- "Error al subir el archivo. Intenta nuevamente"
- "Error al crear el ticket. Verifica tu conexión e intenta de nuevo"
- "El contenido contiene caracteres no permitidos"

---

### **Mensajes de Éxito**

- "Ticket creado exitosamente"
- "Tu ticket #SOP-2025-0001 ha sido creado"
- "Te notificaremos cuando haya actualizaciones"
- "Tiempo estimado de respuesta: 24-48 horas"
- "Archivos adjuntados correctamente"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-SOP-00 (Centro de Ayuda - alternativa previa)
- **HU Siguientes:**
    - HU-SOP-02 (Ver Historial de Tickets - seguimiento)
    - HU-SOP-03 (Ver Detalle de Ticket - conversación)
    - HU-SOP-09 (Notificaciones de Tickets - confirmación)

---

### **Reglas de Negocio Específicas del Módulo (RN-SOP)**

- **RN-SOP-46:** Solo usuarios autenticados pueden crear tickets de soporte
- **RN-SOP-47:** Todo ticket debe tener título, descripción y categoría obligatorios
- **RN-SOP-48:** El número de ticket sigue formato #SOP-YYYY-NNNN secuencial
- **RN-SOP-49:** La prioridad se asigna automáticamente según categoría predefinida
- **RN-SOP-50:** Los archivos adjuntos son opcionales pero con límites estrictos
- **RN-SOP-51:** El contenido de texto se sanitiza automáticamente para prevenir XSS
- **RN-SOP-52:** Los archivos se validan para detectar malware antes de almacenar
- **RN-SOP-53:** El estado inicial de todo ticket es "Pendiente" hasta atención del admin
- **RN-SOP-54:** Un usuario puede tener múltiples tickets abiertos simultáneamente
- **RN-SOP-55:** Los tickets se crean con timestamp exacto y zona horaria del usuario
- **RN-SOP-56:** Las categorías de tickets son predefinidas y no modificables por usuarios
- **RN-SOP-57:** El sistema genera notificación automática al administrador al crear ticket
- **RN-SOP-58:** Los tickets se almacenan con metadatos de navegador y IP para auditoría
- **RN-SOP-59:** El formulario resetea automáticamente después de envío exitoso
- **RN-SOP-60:** Los tickets duplicados se detectan y se notifica al usuario
- **RN-SOP-61:** El sistema limita creación de tickets a 5 por hora por usuario para prevenir spam
- **RN-SOP-62:** Los archivos se eliminan automáticamente si el ticket se cancela antes de enviar
- **RN-SOP-63:** El número de teléfono del usuario se incluye automáticamente para contacto
- **RN-SOP-64:** El sistema sugiere FAQ relacionadas según categoría seleccionada
- **RN-SOP-65:** El formulario cumple con WCAG 2.1 nivel AA de accesibilidad


---

# **Historia de Usuario Detallada - HU-SOP-06**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Administrador que gestiona y responde tickets
2. **tickets_soporte** - Ticket principal con información del problema
3. **mensajes_ticket** - Mensajes de la conversación del ticket
4. **archivos_adjuntos** - Archivos adjuntos al ticket
5. **estados_tickets** - Estados del flujo de soporte
6. **categorias_tickets** - Categorías organizativas para tickets
7. **prioridades_tickets** - Prioridades asignadas a tickets

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Roles y permisos configurados
- **HU-SOP-05** - Bandeja de Tickets (navegación previa)

### **Roles Involucrados:**

- **Administrador:** Gestiona y responde tickets de soporte técnico

---

## **HU-SOP-06 — Gestionar Ticket y Responder**

**Título:** Vista administrativa completa con conversación tipo chat y herramientas de gestión

**Historia:**

> Como administrador, quiero ver y responder tickets de soporte con herramientas avanzadas de gestión para resolver eficientemente los problemas de los usuarios.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso a la vista de gestión desde múltiples puntos:
    - **Botón "Ver Detalle"** en HU-SOP-05 (bandeja de tickets)
    - **URL directa:** `/dashboard/soporte/admin/tickets/:id`
    - **Notificación push:** Click en notificación de nuevo ticket
    - **Link desde email:** Enlace en notificación por correo
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar vista (Backend):
    
    **Validación de Permisos:**
    
    - Verificar que usuario está autenticado
    - Verificar que `usuarios.rol = 'administrador'`
    - Si no es administrador: Redirigir a dashboard con mensaje de error
    
    **Carga de Datos del Ticket:**
    
    ```sql
    -- Obtener información completa del ticket
    SELECT 
      ts.id, ts.numero_ticket, ts.titulo, ts.descripcion, ts.fecha_creacion,
      ts.fecha_ultima_actualizacion, ts.estado_id, ts.categoria_id, ts.prioridad_id,
      te.nombre as estado_nombre, te.color as estado_color,
      tc.nombre as categoria_nombre, tc.icono as categoria_icono,
      tp.nombre as prioridad_nombre, tp.color as prioridad_color,
      u.nombre as usuario_nombre, u.apellido as usuario_apellido,
      u.rol as usuario_rol, u.email as usuario_email,
      u.telefono as usuario_telefono,
      COUNT(mt.id) as cantidad_mensajes,
      MAX(mt.fecha_envio) as ultimo_mensaje_fecha
    FROM tickets_soporte ts
    JOIN estados_tickets te ON ts.estado_id = te.id
    JOIN categorias_tickets tc ON ts.categoria_id = tc.id
    JOIN prioridades_tickets tp ON ts.prioridad_id = tp.id
    JOIN usuarios u ON ts.usuario_id = u.id
    LEFT JOIN mensajes_ticket mt ON ts.id = mt.ticket_id
    WHERE ts.id = :ticket_id
    GROUP BY ts.id;
    
    -- Obtener mensajes del ticket
    SELECT 
      mt.id, mt.contenido, mt.fecha_envio, mt.remitente_id,
      u.nombre as remitente_nombre, u.apellido as remitente_apellido,
      u.rol as remitente_rol, u.avatar as remitente_avatar
    FROM mensajes_ticket mt
    JOIN usuarios u ON mt.remitente_id = u.id
    WHERE mt.ticket_id = :ticket_id
    ORDER BY mt.fecha_envio ASC;
    
    -- Obtener archivos adjuntos
    SELECT 
      aa.id, aa.nombre_archivo, aa.ruta, aa.tipo, aa.tamaño,
      aa.fecha_subida
    FROM archivos_adjuntos aa
    WHERE aa.ticket_id = :ticket_id
    ORDER BY aa.fecha_subida ASC;
    ```
    
    **Si todas las validaciones pasan:**
    
    - Cargar información completa del ticket
    - Renderizar vista de gestión administrativa
- **CA-03:** Layout de la vista de gestión:
    
    **HEADER FIJO CON INFORMACIÓN DEL TICKET Y CONTROLES**
    
    - **Título del Ticket:**
        - Texto grande, bold (20px desktop, 18px móvil)
        - Color: `text-text-primary`
        - Formato: "#SOP-2025-0001"
        - Font-family: monoespaciado para mejor legibilidad
        - Centrado horizontalmente
    
    - **Panel de Información del Ticket:**
        - **Estado Actual:**
            - Badge con color según estado:
                - Pendiente: `bg-warning-100 text-warning-700`
                - En Proceso: `bg-blue-100 text-blue-700`
                - Resuelto: `bg-success-100 text-success-700`
                - Cerrado: `bg-gray-100 text-gray-700`
            - Icono según estado:
                - Pendiente: `<LucideIcon name="clock" />`
                - En Proceso: `<LucideIcon name="loader" />`
                - Resuelto: `<LucideIcon name="check-circle" />`
                - Cerrado: `<LucideIcon name="x-circle" />`
            - Texto: "Pendiente", "En Proceso", "Resuelto", "Cerrado"
        
        - **Prioridad:**
            - Badge con color según prioridad:
                - Crítica: `bg-red-100 text-red-700`
                - Alta: `bg-orange-100 text-orange-700`
                - Normal: `bg-yellow-100 text-yellow-700`
                - Baja: `bg-green-100 text-green-700`
            - Icono según prioridad:
                - Crítica: `<LucideIcon name="alert-triangle" />`
                - Alta: `<LucideIcon name="alert-circle" />`
                - Normal: `<LucideIcon name="info" />`
                - Baja: `<LucideIcon name="check-circle" />`
        
        - **Categoría:**
            - Badge pequeño con color según categoría
            - Icono según categoría
            - Texto: "Login", "Calificaciones", etc.
        
        - **Información del Usuario:**
            - **Nombre Completo:** Bold (16px), color `text-text-primary`
            - **Rol con Badge:** Pequeño, inline
                - Padre: `bg-blue-100 text-blue-700`
                - Docente: `bg-green-100 text-green-700`
                - Director: `bg-purple-100 text-purple-700`
            - **Contacto:**
                - Email: Texto pequeño `text-text-secondary` con icono `<LucideIcon name="mail" />`
                - Teléfono: Texto pequeño `text-text-secondary` con icono `<LucideIcon name="phone" />`
        
        - **Fechas Importantes:**
            - **Fecha de Creación:** Texto pequeño `text-text-secondary`
                - Formato: "Creado el DD/MM/YYYY a las HH:MM"
                - Icono: `<LucideIcon name="calendar" />`
            - **Última Actualización:** Texto pequeño `text-text-secondary`
                - Formato: "Actualizado hace X horas"
                - Icono: `<LucideIcon name="refresh-cw" />`
            - **Tiempo de Respuesta:** Texto pequeño `text-text-secondary`
                - Formato: "Tiempo respuesta: X horas"
                - Icono: `<LucideIcon name="clock" />`
    
    - **Panel de Acciones Rápidas:**
        - **Cambiar Estado:**
            - Select con opciones:
                - "Pendiente" → "En Proceso"
                - "En Proceso" → "Resuelto"
                - "Resuelto" → "Cerrado"
                - "Cualquiera" → "Cerrado" (forzar cierre)
            - Icono: `<LucideIcon name="refresh-cw" />`
        
        - **Cambiar Prioridad:**
            - Select con opciones:
                - "Crítica", "Alta", "Normal", "Baja"
            - Icono: `<LucideIcon name="flag" />`
        
        - **Asignar a Mí:**
            - Botón pequeño con icono `<LucideIcon name="user-plus" />`
            - Texto: "Asignar a mí"
            - Color: secundario (outline `border-border-primary`)
        
        - **Contactar Usuario:**
            - Botón pequeño con icono `<LucideIcon name="phone" />`
            - Texto: "Llamar"
            - Color: secundario (outline `border-border-primary`)
            - Click: Abre aplicación de teléfono con número del usuario
    
    - **Altura fija:** 160px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    - **Background:** `bg-bg-card`
    - **Border-bottom:** `border-border-secondary`
    
    **CONTENIDO PRINCIPAL (Scrollable)**
    
    - **Vista de Conversación Tipo Chat:**
        
        **Layout Vertical:**
        
        - **Espaciado entre mensajes:** 16px
        - **Padding lateral:** 20px (desktop), 16px (móvil)
        - **Background:** `bg-bg-sidebar`
        - **Min-height:** 400px
        - **Max-height:** 600px (con scroll)
        
        **Mensaje Inicial del Usuario:**
        
        - **Contenedor del Mensaje:**
            - **Background:** `bg-bg-card`
            - **Border-radius:** 12px
            - **Border-left:** 4px sólido `border-primary-500`
            - **Padding:** 16px
            - **Margin-bottom:** 16px
            - **Box-shadow:** `shadow-sm`
        
        - **Header del Mensaje:**
            - **Avatar del Usuario:**
                - Imagen circular (48px) con iniciales si no hay foto
                - Background: `bg-primary-100 text-primary-700`
                - Texto: Iniciales del nombre (ej. "JD")
                - Font-size: 18px, bold
                - Posición: Izquierda
            - **Información del Usuario:**
                - **Nombre completo + rol:** Bold (16px), color `text-text-primary`
                - Formato: "Juan Díaz (Padre)"
                - Posición: Junto al avatar, centrado verticalmente
            - **Fecha y Hora de Envío:**
                - Texto pequeño `text-text-muted` (12px)
                - Formato: "DD/MM/YYYY HH:MM"
                - Posición: Derecha
                - Icono: `<LucideIcon name="send" />`
        
        - **Contenido del Mensaje:**
            - **Título del Problema (Destacado):**
                - Bold (18px), color `text-text-primary`
                - Margin-top: 12px
                - Margin-bottom: 8px
            - **Descripción Completa:**
                - Texto (16px), color `text-text-secondary`
                - Line-height: 1.5
                - White-space: pre-wrap para mantener formato
            - **Archivos Adjuntos (si hay):**
                - **Sección de Archivos:**
                    - Título pequeño: "Archivos adjuntos:"
                    - Icono: `<LucideIcon name="paperclip" />`
                    - Margin-top: 16px
                - **Lista de Archivos:**
                    - **Cada archivo muestra:**
                        - **Icono según tipo:**
                            - PDF: `<LucideIcon name="file-text" />`
                            - Imagen: `<LucideIcon name="image" />`
                        - **Nombre del archivo:** Texto (14px)
                        - **Tamaño:** Texto pequeño `text-text-muted`
                        - **Botón de descarga:**
                            - Icono: `<LucideIcon name="download" />`
                            - Color: `text-primary-600`
                            - Hover: `text-primary-700`
                            - Click: Descarga archivo
                    - **Layout:** Horizontal con gap de 12px
                    - **Background:** `bg-bg-card`
                    - **Border:** `border-border-primary`
                    - **Border-radius:** 8px
                    - **Padding:** 12px
                    - **Margin-top:** 8px
        
        **Respuestas del Administrador:**
        
        - **Contenedor del Mensaje:**
            - **Background:** `bg-info-light`
            - **Border-radius:** 12px
            - **Border-left:** 4px sólido `border-info-500`
            - **Padding:** 16px
            - **Margin-bottom:** 16px
            - **Box-shadow:** `shadow-sm`
        
        - **Header del Mensaje:**
            - **Avatar del Administrador:**
                - Imagen circular (48px) con foto o icono
                - Background: `bg-info-100 text-info-700`
                - Icono: `<LucideIcon name="shield" />` si no hay foto
                - Font-size: 18px
                - Posición: Izquierda
            - **Información del Administrador:**
                - **Nombre completo:** Bold (16px), color `text-text-primary`
                - Formato: "Tu Nombre (Administrador)"
                - Posición: Junto al avatar, centrado verticalmente
            - **Fecha y Hora de Respuesta:**
                - Texto pequeño `text-text-muted` (12px)
                - Formato: "DD/MM/YYYY HH:MM"
                - Posición: Derecha
                - Icono: `<LucideIcon name="reply" />`
        
        - **Contenido del Mensaje:**
            - **Texto de la Respuesta:**
                - Texto (16px), color `text-text-secondary`
                - Line-height: 1.5
                - Formato enriquecido soportado (negritas, listas, enlaces)
            - **Badge de Cambio de Estado (si aplica):**
                - Background: `bg-warning-100 text-warning-700`
                - Texto: "Estado actualizado a: En Proceso"
                - Icono: `<LucideIcon name="refresh-cw" />`
                - Margin-top: 12px
                - Padding: 8px 12px
                - Border-radius: 20px
                - Display: inline-block
            - **Archivos Adjuntos (si hay):**
                - **Misma estructura** que mensaje de usuario
                - **Iconos según tipo:** PDF, imagen, etc.
                - **Botones de descarga** con iconos
        
        **Campo de Respuesta del Administrador:**
        
        - **Contenedor de Respuesta:**
            - **Background:** `bg-bg-card`
            - **Border:** `border-border-primary`
            - **Border-radius:** 12px
            - **Padding:** 16px
            - **Margin-top:** 20px
            - **Position:** Sticky al bottom del contenedor de chat
        
        - **Opciones de Respuesta Rápida:**
            - **Botones de Plantillas:**
                - "Solicitud recibida" (azul)
                - "En investigación" (amarillo)
                - "Solución propuesta" (verde)
                - "Escalado a equipo técnico" (naranja)
            - **Layout:** Horizontal con gap de 8px
            - **Click:** Inserta plantilla en campo de respuesta
        
        - **Campo de Texto:**
            - **Textarea:**
                - Placeholder: "Escribe tu respuesta al usuario..."
                - Min-height: 120px
                - Max-height: 300px
                - Resize: Vertical
                - Padding: 12px
                - Border: `border-border-primary`
                - Border-radius: 8px
                - Font-size: 16px
                - Line-height: 1.5
                - Focus: Border `border-primary-600`, sombra `ring-2 ring-primary-200`
        
        - **Opciones Adicionales:**
            - **Cambiar Estado al Responder:**
                - Checkbox: "Cambiar estado a 'En Proceso' al responder"
                - Default: marcado
                - Icono: `<LucideIcon name="settings" />`
            
            - **Notificar por Email:**
                - Checkbox: "Enviar notificación por email"
                - Default: marcado
                - Icono: `<LucideIcon name="mail" />`
            
            - **Notificar por WhatsApp:**
                - Checkbox: "Enviar notificación por WhatsApp"
                - Default: desmarcado
                - Icono: `<LucideIcon name="message-circle" />`
        
        - **Botones de Acción:**
            - **Botón de Adjuntar Archivos:**
                - Icono: `<LucideIcon name="paperclip" />`
                - Texto: "Adjuntar archivos"
                - Color: Secundario (outline `border-border-primary`)
                - Position: Absoluto, bottom-right del textarea
                - Margin: 8px
            
            - **Botón de Enviar Respuesta:**
                - Icono: `<LucideIcon name="send" />`
                - Texto: "Enviar respuesta"
                - Color: Primario (`bg-primary-600 text-white`)
                - Padding: 12px 24px
                - Border-radius: 8px
                - Font-weight: 600
                - Margin-top: 12px
                - Width: 100%
                - Hover: `bg-primary-700`
                - Disabled: `bg-bg-disabled text-text-disabled` (si textarea vacío)
            
            - **Botón de Resolver Ticket:**
                - Icono: `<LucideIcon name="check-circle" />`
                - Texto: "Resolver ticket"
                - Color: Éxito (`bg-success-600 text-white`)
                - Padding: 12px 24px
                - Border-radius: 8px
                - Font-weight: 600
                - Margin-top: 12px
                - Width: 100%
                - Hover: `bg-success-700`
                - Click: Abre modal de confirmación de resolución
- **CA-04:** Funcionalidades de Interacción:
    
    **Gestión de Estados:**
    
    - **Cambio de Estado:**
        - Select en header para cambiar estado rápidamente
        - Confirmación modal para cambios importantes (Pendiente → Resuelto)
        - Registro automático de quién y cuándo cambió el estado
        - Notificación automática al usuario por email/WhatsApp
    
    - **Cambio de Prioridad:**
        - Select en header para ajustar prioridad según urgencia
        - Justificación obligatoria para cambios drásticos (Normal → Crítica)
        - Registro en log de auditoría
    
    **Respuestas y Comunicación:**
    
    - **Plantillas de Respuesta:**
        - Botones de respuesta rápida con plantillas predefinidas
        - Personalización de plantillas por administrador
        - Variables dinámicas: {nombre_usuario}, {numero_ticket}, {fecha}
    
    - **Editor de Texto Enriquecido:**
        - Toolbar con opciones: negrita, cursiva, lista, enlace, código
        - Preview en tiempo real
        - Soporte para emojis y caracteres especiales
    
    - **Gestión de Archivos:**
        - Adjuntar archivos desde computadora o repositorio
        - Vista previa de imágenes antes de enviar
        - Límite: 5 archivos por respuesta, 10MB cada uno
        - Tipos permitidos: PDF, JPG, PNG, DOC, DOCX
    
    **Herramientas de Productividad:**
    
    - **Notas Internas:**
        - Campo oculto para notas internas entre administradores
        - Visible solo para equipo de soporte
        - No se envía al usuario
        - Icono: `<LucideIcon name="eye-off" />`
    
    - **Historial de Cambios:**
        - Timeline con todos los cambios del ticket
        - Incluye: cambios de estado, prioridad, asignaciones
        - Colores diferentes para cada tipo de cambio
        - Expandible/collapsible
    
    - **Información de Sistema:**
        - Datos técnicos del usuario:
            - Navegador y versión
            - Sistema operativo
            - Dirección IP
            - Último acceso
        - Click en botón "Ver detalles técnicos"
    
    **Integraciones Externas:**
    
    - **WhatsApp Integration:**
        - Botón para enviar respuesta por WhatsApp
        - Vista previa de mensaje antes de enviar
        - Confirmación de entrega
        - Historial de mensajes WhatsApp
    
    - **Email Integration:**
        - Vista previa de email antes de enviar
        - Personalización de plantillas de email
        - Historial de emails enviados
        - Confirmación de lectura (si disponible)
- **CA-05:** Modal de Confirmación de Resolución:
    
    **Trigger:** Click en botón "Resolver ticket"
    
    **Diseño del Modal:**
    
    - **Overlay:** Oscuro `bg-bg-overlay` con blur (z-index alto)
    - **Modal centrado:** Ancho máximo 600px, animación fade-in + scale
    - **Header del Modal:**
        - **Icono de confirmación:** `<LucideIcon name="check-circle" />` (verde, 48px)
        - Color: `text-success`
        - Animación: Bounce suave al aparecer
    - **Contenido del Modal:**
        - **Título:** "¿Confirmar resolución de ticket?"
        - **Mensaje:** "Estás a punto de marcar este ticket como resuelto. El usuario recibirá una notificación y ya no podrá responder."
        - **Resumen del ticket:**
            - Número: "#SOP-2025-0001"
            - Usuario: "Juan Pérez (Padre)"
            - Tiempo de resolución: "2 días 14 horas"
        - **Campo "Solución proporcionada":**
            - Textarea obligatorio
            - Placeholder: "Describe brevemente la solución proporcionada..."
            - Mínimo: 20 caracteres
            - Máximo: 500 caracteres
            - Contador de caracteres
        - **Checkbox "Enviar encuesta de satisfacción":**
            - Default: marcado
            - Texto: "Enviar encuesta de satisfacción al usuario"
            - Icono: `<LucideIcon name="star" />`
    - **Botones de Acción:**
        - **"Sí, Resolver Ticket"** (primario):
            - Color: `bg-success-600 text-white`
            - Icono: `<LucideIcon name="check-circle" />`
            - Click: Procesa resolución del ticket
        - **"Cancelar"** (secundario):
            - Color: outline `border-border-primary`
            - Click: Cierra modal sin cambios
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Layout con sidebar opcional para información del ticket
        - Mensajes con ancho generoso (max-width 600px)
        - Avatares de 48px
        - Campo de respuesta con ancho completo
        - Panel de acciones en header con múltiples botones
    - **Tablet (768px-1024px):**
        - Layout de una sola columna
        - Mensajes con ancho medio (max-width 500px)
        - Avatares de 40px
        - Campo de respuesta adaptado
        - Panel de acciones simplificado
    - **Mobile (<768px):**
        - Layout fullscreen con header sticky
        - Mensajes con ancho completo
        - Avatares de 36px
        - Campo de respuesta con botones más grandes
        - Panel de acciones en dropdown
        - Optimización para scroll táctil

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios con rol 'administrador' pueden acceder a la vista de gestión
- **VN-02:** Los administradores pueden ver todos los tickets del sistema
- **VN-03:** Los cambios de estado generan notificaciones automáticas al usuario
- **VN-04:** Las respuestas de administradores se registran con timestamp exacto
- **VN-05:** Los archivos adjuntos se validan para tipo y tamaño antes de enviar
- **VN-06:** Las resoluciones de tickets requieren descripción obligatoria de solución
- **VN-07:** Los tickets resueltos no pueden recibir nuevas respuestas
- **VN-08:** Las prioridades se pueden ajustar según criterios de urgencia
- **VN-09:** Las notas internas son visibles solo para administradores
- **VN-10:** Las respuestas se sanitizan para prevenir XSS
- **VN-11:** Los tickets se pueden asignar a administradores específicos
- **VN-12:** Las notificaciones por WhatsApp requieren consentimiento previo del usuario
- **VN-13:** Los cambios de estado se registran en log de auditoría
- **VN-14:** Los tickets inactivos por más de 30 días se marcan automáticamente como cerrados
- **VN-15:** Las encuestas de satisfacción se envían solo una vez por ticket resuelto

---

### **UI/UX**

- **UX-01:** Vista administrativa completa con información jerárquica:
    - Header completo con información del ticket y controles rápidos
    - Conversación clara con diferenciación visual entre usuario y administrador
    - Herramientas de respuesta avanzada con plantillas y opciones
    - Panel de acciones intuitivo con iconos descriptivos
- **UX-02:** Diferenciación visual clara:
    - **Mensajes de usuario:** Border-left azul, avatar con iniciales
    - **Mensajes de administrador:** Border-left verde, avatar con foto o ícono
    - **Badges de estado y prioridad:** Colores consistentes con iconos descriptivos
    - **Timestamps claros:** Formato legible con iconos
- **UX-03:** Herramientas de productividad:
    - Plantillas de respuesta rápida para respuestas comunes
    - Editor de texto enriquecido con preview
    - Notas internas para comunicación entre administradores
    - Historial de cambios completo con timeline
- **UX-04:** Gestión de archivos intuitiva:
    - Drag & drop para adjuntar archivos
    - Preview de imágenes antes de enviar
    - Validación de tipo y tamaño en tiempo real
    - Organización clara de archivos adjuntos
- **UX-05:** Integraciones externas fluidas:
    - WhatsApp integration con preview y confirmación
    - Email integration con plantillas personalizables
    - Notificaciones automáticas configurables
    - Historial completo de comunicaciones
- **UX-06:** Modal de resolución completo:
    - Confirmación clara con resumen del ticket
    - Campo obligatorio para descripción de solución
    - Opción de enviar encuesta de satisfacción
    - Animaciones suaves y feedback visual
- **UX-07:** Diseño mobile-first:
    - Adaptación completa a diferentes tamaños
    - Elementos táctiles con tamaño adecuado
    - Optimización de scroll en móviles
    - Header sticky siempre visible
- **UX-08:** Accesibilidad y usabilidad:
    - Contraste mínimo WCAG AA en todos los textos
    - Estructura semántica HTML5
    - Navegación completa por teclado
    - Atributos ARIA descriptivos
    - Lectura de pantalla compatible

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar información completa del ticket
- **EF-02:** Estado de carga: Mostrar skeleton mientras se obtienen mensajes
- **EF-03:** Estado de conversación: Renderizar mensajes en orden cronológico
- **EF-04:** Estado de respuesta: Mostrar campo de respuesta con opciones avanzadas
- **EF-05:** Estado de envío: Procesar respuesta y actualizar conversación
- **EF-06:** Estado de cambio de estado: Actualizar estado con notificación automática
- **EF-07:** Estado de resolución: Abrir modal de confirmación con descripción
- **EF-08:** Estado de archivo: Adjuntar y preview archivos
- **EF-09:** Estado de notas internas: Agregar notas visibles solo para administradores
- **EF-10:** Estado de responsive: Adaptar layout según tamaño de pantalla

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe tener rol 'administrador'
- **VE-02:** ID de ticket debe ser válido y existir en base de datos
- **VE-03:** Respuesta de administrador debe tener entre 1-2000 caracteres
- **VE-04:** Archivos adjuntos deben ser válidos y no exceder 10MB cada uno
- **VE-05:** Máximo 5 archivos por respuesta
- **VE-06:** Descripción de solución debe tener entre 20-500 caracteres
- **VE-07:** Notas internas deben tener máximo 1000 caracteres
- **VE-08:** Cambio de prioridad requiere justificación si es drástico
- **VE-09:** Contenido de respuesta debe estar sanitizado para prevenir XSS

---

### **Mensajes de Error**

- "No tienes permisos para gestionar tickets"
- "El ticket solicitado no existe"
- "Error al cargar los mensajes del ticket. Intenta nuevamente"
- "La respuesta no puede estar vacía"
- "Los archivos adjuntos exceden el tamaño máximo permitido"
- "No se pueden adjuntar más de 5 archivos"
- "Error al enviar la respuesta. Intenta nuevamente"
- "La descripción de la solución es obligatoria"
- "Error al cambiar el estado del ticket. Intenta nuevamente"
- "Error al adjuntar el archivo. Verifica el formato y tamaño"

---

### **Mensajes de Éxito**

- " Respuesta enviada correctamente"
- " Estado del ticket actualizado"
- " Nota interna agregada"
- " Archivos adjuntados correctamente"
- " Ticket resuelto exitosamente"
- " Notificación por email enviada"
- " Notificación por WhatsApp enviada"
- " Encuesta de satisfacción enviada"
- " Ticket asignado correctamente"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-USERS-01 (Gestión de roles y permisos)
    - HU-SOP-05 (Bandeja de Tickets - navegación previa)
- **HU Siguientes:**
    - HU-SOP-09 (Notificaciones de Tickets - actualizaciones)
    - HU-SOP-04 (Responder Ticket - función específica)


---

### **Reglas de Negocio Específicas del Módulo (RN-SOP)**

- **RN-SOP-116:** Solo usuarios con rol 'administrador' pueden acceder a la vista de gestión de tickets
- **RN-SOP-117:** Los administradores pueden ver todos los tickets del sistema sin restricciones
- **RN-SOP-118:** Los cambios de estado generan notificaciones automáticas al usuario por email y WhatsApp si está configurado
- **RN-SOP-119:** Las respuestas de administradores se registran con timestamp exacto y zona horaria
- **RN-SOP-120:** Los archivos adjuntos se validan para tipo MIME y tamaño antes de almacenar
- **RN-SOP-121:** Las resoluciones de tickets requieren descripción obligatoria de solución mínima de 20 caracteres
- **RN-SOP-122:** Los tickets resueltos cambian automáticamente a estado "Cerrado" después de 7 días sin actividad
- **RN-SOP-123:** Las prioridades se pueden ajustar según criterios de urgencia con justificación obligatoria para cambios drásticos
- **RN-SOP-124:** Las notas internas son visibles solo para administradores y no se envían al usuario
- **RN-SOP-125:** Las respuestas se sanitizan automáticamente para prevenir XSS y contenido malicioso
- **RN-SOP-126:** Los tickets se pueden asignar a administradores específicos para seguimiento especializado
- **RN-SOP-127:** Las notificaciones por WhatsApp requieren consentimiento previo explícito del usuario
- **RN-SOP-128:** Todos los cambios de estado, prioridad y asignación se registran en log de auditoría con IP y navegador
- **RN-SOP-129:** Los tickets inactivos por más de 30 días se marcan automáticamente como cerrados con notificación al usuario
- **RN-SOP-130:** Las encuestas de satisfacción se envían solo una vez por ticket resuelto y son anónimas
- **RN-SOP-131:** Las plantillas de respuesta pueden personalizarse por administrador pero manteniendo estructura base
- **RN-SOP-132:** Los administradores pueden responder tickets desde email con respuesta automática en el sistema
- **RN-SOP-133:** Las respuestas automáticas se marcan claramente como "Generadas automáticamente" en la conversación
- **RN-SOP-134:** Los tickets críticos generan notificaciones inmediatas a todos los administradores disponibles
- **RN-SOP-135:** El sistema sugiere respuestas basadas en tickets similares resueltos anteriormente
- **RN-SOP-136:** Los administradores pueden escalar tickets a niveles superiores con justificación obligatoria
- **RN-SOP-137:** Las estadísticas de respuesta de cada administrador se registran para evaluación de desempeño
- **RN-SOP-138:** Los tickets pueden reabrirse dentro de 30 días de resolución si el problema persiste
- **RN-SOP-139:** El sistema genera backup automático de todas las conversaciones importantes
- **RN-SOP-140:** La vista de gestión cumple con WCAG 2.1 nivel AA de accesibilidad

