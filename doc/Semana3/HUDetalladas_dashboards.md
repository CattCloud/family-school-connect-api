# **Historias de Usuario - Módulo de Dashboard Principal**

---

## **HU-DASH-01** — Dashboard Base (Estructura Común)

**Título:** Interfaz base responsive con navegación adaptada por rol

**Historia:**
> Como usuario del sistema (padre, docente, director, administrador), quiero acceder a una interfaz principal intuitiva y responsive que me permita navegar fácilmente entre los módulos disponibles según mi rol.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Dashboard se renderiza inmediatamente después de autenticación exitosa
- **CA-02:** Estructura base incluye 3 zonas principales:
  - **Header:** Barra superior fija con identidad del usuario y acciones globales
  - **Sidebar/Navegación:** Menú lateral colapsable (desktop) o menú hamburguesa (mobile)
  - **Body/Contenido:** Área principal dinámica según el módulo activo
- **CA-03:** Header debe incluir:
  - Logo institucional (I.E.P. Las Orquídeas) clickeable → vuelve al dashboard
  - Selector de hijo (solo para padres con múltiples hijos) - HU-AUTH-05
  - Icono de notificaciones con badge de cantidad no leídas
  - Avatar/Icono de usuario con dropdown: Ver perfil, Cerrar sesión
- **CA-04:** Sidebar debe mostrar:
  - Nombre completo del usuario + rol
  - Lista de módulos disponibles según permisos del rol
  - Íconos claros para cada módulo
  - Indicador visual del módulo actualmente activo
- **CA-05:** Navegación debe ser:
  - **Desktop:** Sidebar siempre visible (colapsable a modo compacto)
  - **Mobile:** Menú hamburguesa que se despliega desde la izquierda

**Validaciones de Negocio:**
- **VN-01:** Mostrar solo módulos accesibles según `usuarios.rol`
- **VN-02:** Si hay permisos granulares (docentes), filtrar opciones según `permisos_docentes`
- **VN-03:** Validar sesión activa en cada cambio de módulo
- **VN-04:** Si token JWT expira, redirigir automáticamente a login

**UI/UX:**
- **UX-01:** Diseño mobile-first con breakpoints:
  - Mobile: < 768px (menú hamburguesa)
  - Tablet: 768px - 1024px (sidebar colapsable)
  - Desktop: > 1024px (sidebar completo)
- **UX-02:** Colores institucionales consistentes
- **UX-03:** Transiciones suaves:
  - Apertura/cierre de sidebar (300ms)
  - Cambio entre módulos (fade in/out)
- **UX-04:** Accesibilidad:
  - Contraste mínimo WCAG AA
  - Navegación por teclado (Tab, Enter)
  - Tooltips en íconos del sidebar colapsado
- **UX-05:** Loading states:
  - Skeleton screens al cargar contenido inicial
  - Spinners en acciones asíncronas

**Estados y Flujo:**
- **EF-01:** Estado inicial: Usuario autenticado, cargando dashboard
- **EF-02:** Estado activo: Dashboard renderizado con módulo inicial
- **EF-03:** Estado de navegación: Usuario cambia entre módulos
- **EF-04:** Estado responsive: Adaptación según tamaño de pantalla

**HU Relacionadas:**
- **HU Previas:** HU-AUTH-01 (Autenticación exitosa)
- **HU Siguientes:** HU-DASH-02 a HU-DASH-05 (Dashboards específicos por rol)

**Componentes y Estructura:**
- **Tipo:** Layout wrapper para todas las rutas protegidas
- **Componentes principales:**
  - `DashboardLayout`: Contenedor principal con estructura fija
  - `Header`: Barra superior con acciones globales
  - `Sidebar`: Navegación lateral con menú por rol
  - `MainContent`: Área de contenido dinámico
  - `NotificationBadge`: Contador de notificaciones no leídas
  - `UserDropdown`: Menú desplegable con opciones de usuario
  - `MobileMenu`: Menú hamburguesa para móviles
- **Rutas protegidas:** `/dashboard/*` (requiere autenticación)

---

## **HU-DASH-02** — Dashboard Padre/Apoderado

**Título:** Centro de información académica del estudiante seleccionado

**Historia:**
> Como padre/apoderado, quiero visualizar un resumen consolidado del desempeño académico de mi hijo seleccionado, con accesos rápidos a los módulos más importantes para facilitar el seguimiento diario.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Body del dashboard muestra 4 secciones principales:
  1. **Resumen Académico Reciente:**
     - Últimas 5 calificaciones registradas (curso, nota, fecha)
     - Promedio general del trimestre actual
     - Toggle para cambiar entre escala numérica (0-20) y letras (AD/A/B/C)
  2. **Estado de Asistencia Actual:**
     - Porcentaje de asistencia del mes actual
     - Últimos 7 días en calendario compacto con estados visuales
     - Alertas si hay faltas injustificadas recientes
  3. **Notificaciones Recientes:**
     - Últimas 5 notificaciones (académicas, comunicados, mensajes)
     - Botón "Ver todas" → redirige a módulo de notificaciones
  4. **Accesos Rápidos (Cards clickeables):**
     - Ver Calificaciones Completas
     - Ver Asistencia Detallada
     - Mis Mensajes
     - Comunicados Institucionales
     - Encuestas Pendientes
     - Soporte Técnico
- **CA-02:** Si padre tiene múltiples hijos:
  - Mostrar selector en header (HU-AUTH-05)
  - Al cambiar hijo, refrescar automáticamente todo el contenido del dashboard
- **CA-03:** Si no hay datos académicos aún:
  - Mostrar mensaje amigable: "Aún no hay calificaciones/asistencia registradas"
  - Mantener accesos rápidos visibles

**Validaciones de Negocio:**
- **VN-01:** Mostrar solo información del hijo seleccionado actualmente
- **VN-02:** Filtrar por año académico actual por defecto
- **VN-03:** Datos de resumen deben actualizarse en tiempo real (polling cada 5 min si está activo)
- **VN-04:** Solo mostrar comunicados/encuestas dirigidos al grado del hijo

**UI/UX:**
- **UX-01:** Layout en grid responsive:
  - Mobile: 1 columna (secciones apiladas)
  - Tablet: 2 columnas (2x2)
  - Desktop: 3 columnas (cards más anchos para resumen)
- **UX-02:** Cards con diseño consistente:
  - Título claro de la sección
  - Contenido visual (números grandes, gráficos simples)
  - Botón de acción "Ver más" cuando aplique
- **UX-03:** Indicadores visuales:
  - Verde: Asistencia >90%, notas ≥14
  - Amarillo: Asistencia 80-90%, notas 11-13
  - Rojo: Asistencia <80%, notas <11
- **UX-04:** Íconos representativos por sección:
  - Calificaciones: 📊 o medalla
  - Asistencia: 📅 o checklist
  - Notificaciones: 🔔
  - Mensajes: 💬
- **UX-05:** Scroll suave entre secciones en mobile

**Estados y Flujo:**
- **EF-01:** Estado inicial: Cargando resumen académico del hijo seleccionado
- **EF-02:** Estado con datos: Dashboard completo con todas las secciones
- **EF-03:** Estado sin datos: Mensajes informativos en secciones vacías
- **EF-04:** Estado de actualización: Refrescando datos al cambiar hijo

**HU Relacionadas:**
- **HU Previas:** HU-DASH-01 (Estructura base), HU-AUTH-05 (Selector de hijos)
- **HU Siguientes:** HU-02 (Calificaciones), HU-03 (Asistencia), HU-06 (Comunicados), HU-07 (Mensajería)

**Componentes y Estructura:**
- **Tipo:** Vista principal del dashboard (`/dashboard` para padres)
- **Componentes principales:**
  - `ParentDashboard`: Contenedor principal
  - `AcademicSummaryCard`: Resumen de calificaciones
  - `AttendanceSummaryCard`: Estado de asistencia
  - `RecentNotificationsCard`: Últimas notificaciones
  - `QuickAccessGrid`: Grid de accesos rápidos
  - `EmptyStateMessage`: Mensaje cuando no hay datos
- **Endpoints API:**
  - `GET /students/{id}/summary` (resumen académico)
  - `GET /students/{id}/attendance/recent` (asistencia reciente)
  - `GET /notifications/recent?limit=5` (notificaciones)

---

## **HU-DASH-03** — Dashboard Docente

**Título:** Centro de gestión académica y comunicación con asignaciones

**Historia:**
> Como docente, quiero visualizar mis cursos asignados y acceder rápidamente a las herramientas de carga de datos y comunicación para optimizar mi flujo de trabajo diario.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Body del dashboard muestra 3 secciones principales:
  1. **Mis Asignaciones Actuales:**
     - Lista de cursos asignados con cards:
       - Nombre del curso
       - Grado y nivel
       - Número de estudiantes
       - Botón "Cargar Datos" (redirige a módulo de datos académicos pre-filtrado)
     - Filtro rápido por grado/nivel
  2. **Mensajes Pendientes:**
     - Últimas 5 conversaciones con padres
     - Indicador de mensajes no leídos
     - Botón "Ver todos" → módulo de mensajería
  3. **Permisos y Herramientas:**
     - Cards condicionales según permisos otorgados:
       - Si tiene permiso de comunicados: "Crear Comunicado" (con grados autorizados visibles)
       - Si tiene permiso de encuestas: "Crear Encuesta" (con niveles autorizados visibles)
     - Siempre visible: "Soporte Técnico"
- **CA-02:** Si es primer login (`debe_cambiar_password = true`):
  - Interceptar y mostrar modal de cambio de contraseña obligatorio (HU-AUTH-04)
- **CA-03:** Notificación visible si hay permisos recién otorgados por el director

**Validaciones de Negocio:**
- **VN-01:** Mostrar solo asignaciones del año académico actual
- **VN-02:** Filtrar cursos donde `asignaciones_docente_curso.estado_activo = true`
- **VN-03:** Permisos deben validarse contra `permisos_docentes` en tiempo real
- **VN-04:** Si docente no tiene asignaciones, mostrar mensaje: "No tienes cursos asignados. Contacta al director"

**UI/UX:**
- **UX-01:** Layout en 2 columnas:
  - Columna principal (70%): Asignaciones + Mensajes
  - Columna lateral (30%): Permisos y herramientas
  - Mobile: Apilado en 1 columna
- **UX-02:** Cards de cursos con hover effects:
  - Fondo suave en hover
  - Botón "Cargar Datos" con ícono de upload
- **UX-03:** Badges visuales:
  - Mensajes no leídos: Badge rojo con número
  - Permisos activos: Badge verde "Autorizado"
- **UX-04:** Accesos rápidos con íconos grandes:
  - 📤 Cargar Calificaciones
  - 📋 Cargar Asistencia
  - 📢 Crear Comunicado (si tiene permiso)
  - 📊 Crear Encuesta (si tiene permiso)
- **UX-05:** Filtros visuales claros con chips o tabs

**Estados y Flujo:**
- **EF-01:** Estado inicial: Cargando asignaciones y permisos del docente
- **EF-02:** Estado con asignaciones: Dashboard completo con cursos
- **EF-03:** Estado sin asignaciones: Mensaje informativo
- **EF-04:** Estado de primer login: Modal obligatorio de cambio de contraseña

**HU Relacionadas:**
- **HU Previas:** HU-DASH-01 (Estructura base), HU-AUTH-04 (Cambio de contraseña obligatorio)
- **HU Siguientes:** HU-10 (Cargar calificaciones), HU-11 (Cargar asistencia), HU-13 (Mensajería), HU-14 (Comunicados), HU-15 (Encuestas)

**Componentes y Estructura:**
- **Tipo:** Vista principal del dashboard (`/dashboard` para docentes)
- **Componentes principales:**
  - `TeacherDashboard`: Contenedor principal
  - `CourseAssignmentsGrid`: Grid de cursos asignados
  - `CourseCard`: Card individual por curso
  - `MessagesPreviewCard`: Últimas conversaciones
  - `PermissionsPanel`: Panel lateral con permisos y herramientas
  - `QuickActionButton`: Botones de acceso rápido
- **Endpoints API:**
  - `GET /teachers/{id}/assignments` (asignaciones)
  - `GET /teachers/{id}/permissions` (permisos granulares)
  - `GET /conversations/recent?limit=5` (mensajes)

---

## **HU-DASH-04** — Dashboard Director

**Título:** Centro de supervisión y gestión institucional

**Historia:**
> Como director, quiero visualizar métricas institucionales clave y acceder a herramientas de gestión y supervisión para tomar decisiones informadas sobre la operación educativa.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Body del dashboard muestra 4 zonas principales:
  1. **Métricas Institucionales (KPIs):**
     - Cards con números grandes:
       - Total de estudiantes activos (por nivel)
       - Promedio general institucional (trimestre actual)
       - Porcentaje de asistencia institucional (mes actual)
       - Comunicados activos publicados
       - Encuestas activas con tasa de respuesta
  2. **Actividad Reciente del Sistema:**
     - Timeline de últimas 10 acciones relevantes:
       - Docente X cargó calificaciones de Curso Y
       - Se publicó comunicado Z
       - Padre W envió mensaje sobre estudiante V
     - Filtro por tipo de actividad
  3. **Herramientas de Gestión Rápida:**
     - Cards clickeables grandes:
       - 🔑 Gestionar Permisos de Docentes
       - ⚙️ Configurar Estructura de Evaluación
       - 📊 Configurar Umbrales de Alertas
       - 👁️ Supervisar Mensajería
       - 📢 Crear Comunicado Institucional
       - 📋 Crear Encuesta Institucional
  4. **Alertas Críticas:**
     - Sección destacada (borde rojo/amarillo) con:
       - Estudiantes con 3+ faltas injustificadas consecutivas
       - Cursos sin calificaciones cargadas en el trimestre
       - Docentes sin actividad reciente (>15 días)

**Validaciones de Negocio:**
- **VN-01:** Métricas calculadas en tiempo real desde base de datos
- **VN-02:** Filtrar por año académico actual
- **VN-03:** Actividad reciente solo de últimas 24-48 horas
- **VN-04:** Alertas críticas deben actualizarse cada 5 minutos si dashboard está activo

**UI/UX:**
- **UX-01:** Layout en grid adaptativo:
  - Desktop: 3 columnas (KPIs | Actividad + Alertas | Herramientas)
  - Tablet: 2 columnas
  - Mobile: 1 columna apilada
- **UX-02:** KPIs con visualización impactante:
  - Números grandes con tendencias (↑ ↓ →)
  - Colores según estado (verde/amarillo/rojo)
  - Gráficos simples (barras, tortas pequeñas)
- **UX-03:** Timeline de actividad con íconos:
  - 📚 Carga académica
  - 💬 Mensajería
  - 📢 Comunicados
  - 📊 Encuestas
- **UX-04:** Herramientas con cards grandes y coloridas:
  - Hover effect con elevación (shadow)
  - Íconos grandes representativos
- **UX-05:** Alertas con diseño destacado:
  - Borde grueso coloreado
  - Ícono de advertencia ⚠️
  - Botón "Ver detalle" por cada alerta

**Estados y Flujo:**
- **EF-01:** Estado inicial: Cargando métricas institucionales
- **EF-02:** Estado completo: Dashboard con todas las secciones
- **EF-03:** Estado con alertas: Sección de alertas visible si existen
- **EF-04:** Estado sin alertas: Mensaje positivo "Todo en orden ✓"

**HU Relacionadas:**
- **HU Previas:** HU-DASH-01 (Estructura base)
- **HU Siguientes:** HU-16 (Gestión de permisos), HU-17 (Supervisión de mensajería), HU-18 (Carga de datos), HU-19 (Configuración de evaluación)

**Componentes y Estructura:**
- **Tipo:** Vista principal del dashboard (`/dashboard` para director)
- **Componentes principales:**
  - `DirectorDashboard`: Contenedor principal
  - `InstitutionalKPIsGrid`: Grid de métricas clave
  - `ActivityTimeline`: Timeline de actividad reciente
  - `ManagementToolsGrid`: Grid de herramientas
  - `CriticalAlertsPanel`: Panel de alertas urgentes
  - `KPICard`: Card individual para cada métrica
  - `AlertItem`: Componente de alerta individual
- **Endpoints API:**
  - `GET /institutional/kpis` (métricas institucionales)
  - `GET /activity/recent` (actividad del sistema)
  - `GET /alerts/critical` (alertas urgentes)

---

## **HU-DASH-05** — Dashboard Administrador

**Título:** Centro de gestión técnica y soporte

**Historia:**
> Como administrador del sistema, quiero visualizar el estado técnico de la plataforma y gestionar tickets de soporte para garantizar el correcto funcionamiento operativo.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Body del dashboard muestra 3 secciones principales:
  1. **Estado del Sistema:**
     - Cards con métricas técnicas:
       - Usuarios activos (última sesión < 24h)
       - Total de usuarios registrados (por rol)
       - Espacio usado en Cloudinary (archivos adjuntos)
       - Tamaño de base de datos (PostgreSQL)
       - Última fecha de backup
  2. **Tickets de Soporte:**
     - Grid con tabs por estado:
       - Pendientes (badge con número)
       - En Proceso
       - Resueltos (últimos 10)
     - Por cada ticket:
       - Número de ticket
       - Usuario solicitante + rol
       - Categoría y prioridad
       - Fecha de creación
       - Botón "Atender"
  3. **Herramientas Administrativas:**
     - Cards de acciones rápidas:
       - 📥 Exportar Datos (CSV/SQL)
       - 🔄 Backup Manual
       - 📋 Ver Logs del Sistema
       - ❓ Gestionar FAQ/Guías
       - 👥 Ver Todos los Usuarios
- **CA-02:** Notificación destacada si hay tickets críticos sin atender (>4 horas)
- **CA-03:** Dashboard debe ser accesible solo con rol `administrador`

**Validaciones de Negocio:**
- **VN-01:** Métricas técnicas actualizadas cada 5 minutos
- **VN-02:** Tickets ordenados por prioridad (crítica > alta > normal > baja)
- **VN-03:** Solo mostrar tickets del año académico actual por defecto
- **VN-04:** Validar permisos de administrador en cada acción crítica

**UI/UX:**
- **UX-01:** Layout en 2 columnas:
  - Columna principal (70%): Tickets de soporte
  - Columna lateral (30%): Estado del sistema + Herramientas
  - Mobile: Apilado
- **UX-02:** Tickets con diseño tipo tabla compacta:
  - Colores por prioridad (rojo crítica, naranja alta, verde normal)
  - Badges de categoría
  - Hover muestra preview de la descripción
- **UX-03:** Estado del sistema con íconos visuales:
  - ✅ Verde: Todo operativo
  - ⚠️ Amarillo: Atención requerida
  - ❌ Rojo: Problema crítico
- **UX-04:** Herramientas con íconos técnicos:
  - 🗄️ Base de datos
  - 📦 Archivos
  - 📊 Logs
  - 🛠️ Configuración
- **UX-05:** Filtros rápidos para tickets:
  - Por categoría (dropdown)
  - Por prioridad (chips)
  - Por fecha de creación (date picker)

**Estados y Flujo:**
- **EF-01:** Estado inicial: Cargando estado del sistema y tickets
- **EF-02:** Estado operativo: Dashboard completo sin alertas críticas
- **EF-03:** Estado con alertas: Tickets críticos destacados
- **EF-04:** Estado de mantenimiento: Mensaje si se está ejecutando backup

**HU Relacionadas:**
- **HU Previas:** HU-DASH-01 (Estructura base)
- **HU Siguientes:** HU-20 (Gestión de usuarios), HU-21 (Gestión de tickets), HU-22 (Exportación de datos)

**Componentes y Estructura:**
- **Tipo:** Vista principal del dashboard (`/dashboard` para administrador)
- **Componentes principales:**
  - `AdminDashboard`: Contenedor principal
  - `SystemStatusPanel`: Panel de estado técnico
  - `TicketsTable`: Tabla de tickets con tabs
  - `TicketRow`: Componente de ticket individual
  - `AdminToolsGrid`: Grid de herramientas administrativas
  - `SystemMetricCard`: Card de métrica técnica
- **Endpoints API:**
  - `GET /system/status` (estado del sistema)
  - `GET /tickets?status={status}` (tickets por estado)
  - `GET /users/stats` (estadísticas de usuarios)

---

## **Estructura de Navegación por Rol (Sidebar)**

### **Padre/Apoderado:**
```
🏠 Inicio (Dashboard)
📊 Calificaciones
📅 Asistencia
💬 Mensajes
📢 Comunicados
📋 Encuestas
🆘 Soporte Técnico
```

### **Docente:**
```
🏠 Inicio (Dashboard)
📚 Mis Cursos
📤 Cargar Datos
   ├─ Calificaciones
   └─ Asistencia
💬 Mensajes
📢 Comunicados* (si tiene permiso)
📋 Encuestas* (si tiene permiso)
🆘 Soporte Técnico
```

### **Director:**
```
🏠 Inicio (Dashboard)
👥 Gestión de Usuarios
   ├─ Permisos Docentes
   └─ Ver Todos
⚙️ Configuración
   ├─ Estructura de Evaluación
   ├─ Umbrales de Alertas
   └─ Períodos Académicos
📤 Cargar Datos
   ├─ Calificaciones
   └─ Asistencia
👁️ Supervisión
   ├─ Mensajería
   └─ Actividad del Sistema
💬 Mensajes
📢 Comunicados
📋 Encuestas
```

### **Administrador:**
```
🏠 Inicio (Dashboard)
🎫 Soporte Técnico
👥 Usuarios del Sistema
📥 Exportar Datos
🗄️ Backups
📋 Logs del Sistema
❓ Gestionar Ayuda (FAQ/Guías)
⚙️ Configuración Técnica
```

---

