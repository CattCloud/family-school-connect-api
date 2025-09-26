# **Arquitectura Funcional del Frontend**

**Proyecto:** Plataforma de Comunicación y Seguimiento Académico  
**Institución:** I.E.P. Las Orquídeas  
**Fase:** 2 - Diseño Funcional  
**Versión:** 1.0  

---

## **1. MÓDULOS PRINCIPALES DEL FRONTEND**

### **1.1 Módulo de Autenticación y Gestión de Sesión**
**Responsabilidad:** Control de acceso, gestión de credenciales y recuperación de contraseñas.

**Componentes principales:**
- **Login/Logout:** Autenticación con whatsapp/contraseña
- **Recuperación de contraseña:** Flujo completo con token por Whatsapp
- **Cambio de contraseña obligatorio:** Para docentes en primer acceso
- **Gestión de sesión:** Control JWT, sesiones únicas, timeout automático
- **Selector de contexto:** Dropdown para padres con múltiples hijos

**Flujos de usuario:**
- Usuario ingresa → Valida credenciales → Redirección según rol
- Olvidó contraseña → Solicita reset → Mensaje con token al Whatsapp→ Nueva contraseña
- Docente nuevo → Login → Forzar cambio contraseña → Dashboard

---

### **1.2 Módulo de Dashboard Diferenciado por Rol**
**Responsabilidad:** Pantalla principal personalizada según tipo de usuario con navegación específica.

**Dashboards por rol:**

**Dashboard Padre:**
- Selector de hijo en header (dropdown dinámico)
- Vista resumen: últimas calificaciones, asistencia reciente, notificaciones
- Acceso rápido: mensajes no leídos, comunicados nuevos, encuestas pendientes
- Indicadores visuales: alertas académicas, patrones de asistencia

**Dashboard Docente:**
- Cursos asignados con acceso rápido a carga de datos
- Mensajes pendientes de respuesta organizados por estudiante
- Notificaciones de nuevas conversaciones
- Acceso a módulos según permisos (comunicados/encuestas por grado)

**Dashboard Director:**
- Vista consolidada institucional con métricas clave
- Supervisión de comunicaciones (nuevas conversaciones)
- Gestión de permisos docentes pendientes
- Reportes de actividad del sistema

**Dashboard Administrador:**
- Tickets de soporte por estado (pendientes, en proceso, resueltos)
- Estado del sistema y configuraciones
- Gestión de usuarios y backups
- Métricas de uso de la plataforma

---

### **1.3 Módulo de Datos Académicos (Calificaciones y Asistencia)**
**Responsabilidad:** Carga, procesamiento y visualización de información académica.

**Submódulos:**

**Carga de Datos (Docentes/Director):**
- **Selección de contexto:** Nivel → Grado → Curso (obligatorio)
- **Subida de archivos:** Validación de plantilla Excel/CSV exacta
- **Procesamiento inteligente:** Válidos procesados, errores reportados en TXT
- **Feedback visual:** Progreso de carga, resultados, descargas de errores

**Consulta de Calificaciones (Padres):**
- **Visualización por trimestre:** Items de evaluacion con ponderaciones
- **Toggle numérico/letras:** Cambio entre escala 0-20 y AD/A/B/C
- **Filtros avanzados:** Año académico, trimestre, curso específico
- **Estados visuales:** Diferenciación preliminar vs. final
- **Histórico completo:** Acceso a años anteriores

**Consulta de Asistencia (Padres):**
- **Calendario visual:** Estados codificados por colores
- **Vista detallada:** Lista por rango de fechas con justificaciones
- **Filtros temporales:** Por mes, trimestre, año académico
- **Indicadores:** Estadísticas de asistencia, patrones de ausencias

---

### **1.4 Módulo de Comunicación Institucional**
**Responsabilidad:** Gestión de comunicados oficiales con segmentación de audiencias.

**Submódulos:**

**Creación y Gestión (Director/Docentes autorizados):**
- **Editor de comunicados:** Texto enriquecido con preview
- **Segmentación avanzada:** Por grado, nivel, rol, combinaciones
- **Programación:** Fecha de publicación futura opcional
- **Gestión de estados:** Borrador → Publicado → Archivado
- **Control de permisos:** Docentes solo pueden crear para grados autorizados

**Visualización (Todos los roles):**
- **Feed de comunicados:** Tarjetas con filtros por tipo, fecha, autor
- **Indicadores de lectura:** Leído/no leído con timestamps
- **Búsqueda y filtrado:** Por tipo, estado, rango de fechas
- **Detalle completo:** Vista expandida con metadatos

---

### **1.5 Módulo de Mensajería y Consultas**
**Responsabilidad:** Comunicación directa entre padres, docentes y dirección con supervisión.

**Submódulos:**

**Bandeja de Mensajes:**
- **Lista de conversaciones:** Organizadas por estudiante con estados
- **Vista de conversación:** Historial completo tipo chat
- **Composición de mensajes:** Con archivos adjuntos (máx. 3, 5MB c/u)
- **Estados de lectura:** Enviado, entregado, leído

**Gestión de Archivos:**
- **Subida validada:** Solo PDF, JPG, PNG con preview
- **Almacenamiento:** Integración Cloudinary transparente
- **Descarga segura:** Enlaces directos con validación de acceso

**Supervisión (Director):**
- **Vista global:** Todas las conversaciones en modo lectura
- **Filtros administrativos:** Por participantes, fecha, estado
- **Reportes de comunicación:** Frecuencia, temas recurrentes

---

### **1.6 Módulo de Encuestas Institucionales**
**Responsabilidad:** Creación, distribución y análisis de encuestas segmentadas.

**Submódulos:**

**Creación (Director/Docentes autorizados):**
- **Diseñador de encuestas:** 5 tipos de preguntas soportadas
- **Configuración:** Audiencia, fechas de vigencia, respuesta única
- **Preview:** Vista previa antes de publicación
- **Control de permisos:** Según grados autorizados por director

**Participación (Padres/Docentes):**
- **Lista de encuestas:** Activas, respondidas, vencidas con estados
- **Respuesta única:** Bloqueo automático tras envío
- **Experiencia fluida:** Validación en tiempo real, guardado automático

**Análisis de Resultados (Creadores):**
- **Visualización automática:** Gráficos según tipo de pregunta
- **Segmentación:** Resultados por grado, nivel, rol
- **Exportación:** CSV para análisis externo
- **Métricas:** Tasa de participación, tiempo promedio

---

### **1.7 Módulo de Notificaciones Híbridas**
**Responsabilidad:** Sistema de alertas en tiempo real con múltiples canales de entrega.

**Submódulos:**

**Centro de Notificaciones:**
- **Panel unificado:** Todas las notificaciones con estados
- **Filtros inteligentes:** Por tipo, fecha, estudiante relacionado
- **Acciones directas:** Enlaces a secciones específicas
- **Historial completo:** Archivo de notificaciones anteriores

**Alertas en Tiempo Real:**
- **Polling durante sesión:** Verificación cada 5 minutos
- **Notificaciones push:** Integración con service workers (PWA)
- **Indicadores visuales:** Badges, tooltips, highlighting

**Configuración de Preferencias:**
- **Canal preferido:** Plataforma, WhatsApp, ambos
- **Tipos de alerta:** Académicas, comunicación, administrativas
- **Horarios:** Ventanas de notificación personalizables

---

### **1.8 Módulo de Soporte Técnico**
**Responsabilidad:** Sistema de ayuda, documentación y tickets de soporte estructurado.

**Submódulos:**

**Centro de Ayuda:**
- **FAQ organizada:** Por categorías con búsqueda
- **Guías paso a paso:** Documentos PDF con capturas
- **Búsqueda inteligente:** Por palabras clave, categorías
- **Actualización dinámica:** Contenido administrable

**Sistema de Tickets:**
- **Creación de solicitudes:** Formulario estructurado con categorías
- **Seguimiento:** Estados visuales con timeline
- **Conversación:** Intercambio completo con soporte
- **Archivos adjuntos:** Evidencias del problema
- **Satisfacción:** Rating de resolución

**Panel Administrativo (Administrador):**
- **Gestión de tickets:** Por estado, prioridad, categoría
- **Métricas de soporte:** Tiempo respuesta, satisfacción, volumen
- **Base de conocimiento:** Gestión de FAQ y guías

---

### **1.9 Módulo de Configuración y Administración**
**Responsabilidad:** Gestión de parámetros del sistema y permisos de usuarios.

**Submódulos:**

**Gestión de Permisos (Director):**
- **Asignación a docentes:** Permisos granulares por grado/nivel
- **Panel de control:** Vista matricial de permisos activos
- **Auditoría:** Historial de cambios de permisos

**Configuración del Sistema (Administrador):**
- **Parámetros de evaluación:** Umbrales, ponderaciones, estructura
- **Configuración de alertas:** Límites, tipos, canales
- **Gestión de usuarios:** Creación masiva, estados, roles

**Estructura de Evaluación (Director):**
- **Definición anual:** Ítems de evaluación y pesos
- **Validación:** Suma de porcentajes, límites por ítem
- **Aplicación global:** Para todo el colegio

---

## **2. CONEXIONES ENTRE MÓDULOS**

### **2.1 Dependencias Directas**

```
Autenticación 
    ├─→ Dashboard (según rol autenticado)
    ├─→ Todos los módulos (requieren sesión válida)
    └─→ Configuración (para cambio de contraseña)

Dashboard 
    ├─→ Datos Académicos (acceso rápido)
    ├─→ Mensajería (mensajes no leídos)
    ├─→ Notificaciones (alertas recientes)
    └─→ Comunicación (comunicados nuevos)

Datos Académicos 
    ├─→ Notificaciones (genera alertas automáticas)
    ├─→ Configuración (usa estructura de evaluación)
    └─→ Dashboard (actualiza indicadores)

Comunicación 
    ├─→ Notificaciones (avisa de nuevos comunicados)
    ├─→ Configuración (usa permisos docentes)
    └─→ Dashboard (feed de comunicados)

Mensajería 
    ├─→ Notificaciones (nuevos mensajes)
    ├─→ Archivos (gestión de adjuntos)
    └─→ Dashboard (conversaciones activas)

Encuestas 
    ├─→ Notificaciones (nuevas encuestas)
    ├─→ Configuración (usa permisos docentes)
    └─→ Dashboard (encuestas pendientes)

Notificaciones 
    ├─→ Dashboard (alimenta indicadores)
    └─→ Todos los módulos (recibe eventos)

Soporte 
    ├─→ Notificaciones (updates de tickets)
    └─→ Dashboard (tickets activos)
```

### **2.2 Flujos de Información**

**Flujo de Datos Académicos:**
```
Carga de Archivo (Docente) 
→ Procesamiento (validación) 
→ Almacenamiento (evaluaciones/asistencias) 
→ Análisis de Umbrales (alertas) 
→ Generación de Notificaciones 
→ Actualización Dashboard (padres)
```

**Flujo de Comunicación:**
```
Creación Comunicado (Director/Docente) 
→ Segmentación Audiencia 
→ Publicación 
→ Notificación Destinatarios 
→ Tracking de Lectura 
→ Dashboard (nuevos comunicados)
```

**Flujo de Mensajería:**
```
Composición Mensaje (Padre/Docente) 
→ Validación Archivos 
→ Envío 
→ Notificación Destinatario 
→ Actualización Estado Lectura 
→ Supervisión (Director)
```

---

## **3. ORDEN DE USO POR TIPO DE USUARIO**

### **3.1 Flujo Típico - Padre/Apoderado**

**Primera vez:**
1. **Autenticación** → Recibe credenciales → Login inicial
2. **Dashboard** → Selector de hijo → Vista general
3. **Datos Académicos** → Consulta calificaciones/asistencia → Familiarización
4. **Notificaciones** → Revisa alertas acumuladas → Entiende el sistema
5. **Comunicación** → Lee comunicados → Se mantiene informado
6. **Mensajería** → Envía consultas a docentes → Inicia comunicación

**Uso recurrente:**
1. **Dashboard** → Vista rápida de alertas
2. **Notificaciones** → Revisa nuevas alertas
3. **Datos Académicos** → Consulta específica según alerta
4. **Mensajería** → Responde/inicia conversaciones
5. **Comunicación** → Lee nuevos comunicados
6. **Encuestas** → Responde encuestas pendientes

### **3.2 Flujo Típico - Docente**

**Primera vez:**
1. **Autenticación** → Login → Cambio contraseña obligatorio
2. **Dashboard** → Revisa cursos asignados
3. **Configuración** → Verifica permisos otorgados
4. **Datos Académicos** → Descarga plantillas → Carga inicial
5. **Mensajería** → Configura preferencias comunicación

**Uso diario:**
1. **Dashboard** → Revisa mensajes pendientes
2. **Datos Académicos** → Carga notas/asistencia del día
3. **Mensajería** → Responde consultas de padres
4. **Comunicación** → Crea comunicados (si tiene permisos)
5. **Notificaciones** → Revisa alertas generadas por sus cargas

### **3.3 Flujo Típico - Director**

**Configuración inicial:**
1. **Autenticación** → Acceso administrativo
2. **Configuración** → Define estructura de evaluación anual
3. **Configuración** → Asigna permisos a docentes por grado
4. **Dashboard** → Configura vista supervisión

**Uso habitual:**
1. **Dashboard** → Vista consolidada institucional
2. **Mensajería** → Supervisión de comunicaciones
3. **Datos Académicos** → Carga datos cualquier curso → Aprueba cierres
4. **Comunicación** → Gestiona comunicados institucionales
5. **Configuración** → Ajusta permisos según necesidades

### **3.4 Flujo Típico - Administrador**

**Setup inicial:**
1. **Configuración** → Carga masiva de usuarios vía scripts
2. **Configuración** → Establece parámetros sistema
3. **Soporte** → Configura FAQ y guías iniciales

**Operación diaria:**
1. **Dashboard** → Revisa tickets pendientes
2. **Soporte** → Gestiona solicitudes por prioridad
3. **Configuración** → Monitorea configuraciones sistema
4. **Notificaciones** → Supervisa entregas WhatsApp

---

## **4. ARQUITECTURA DE COMPONENTES REACT**

### **4.1 Estructura de Alto Nivel**

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── PasswordRecovery.jsx
│   │   └── ForcePasswordChange.jsx
│   ├── dashboard/
│   │   ├── DashboardPadre.jsx
│   │   ├── DashboardDocente.jsx
│   │   ├── DashboardDirector.jsx
│   │   └── DashboardAdmin.jsx
│   ├── academic/
│   │   ├── DataUpload.jsx
│   │   ├── GradesView.jsx
│   │   ├── AttendanceCalendar.jsx
│   │   └── ContextSelector.jsx
│   ├── communication/
│   │   ├── CommunicationFeed.jsx
│   │   ├── CommunicationEditor.jsx
│   │   └── CommunicationDetail.jsx
│   ├── messaging/
│   │   ├── ConversationList.jsx
│   │   ├── MessageView.jsx
│   │   ├── MessageComposer.jsx
│   │   └── FileUpload.jsx
│   ├── surveys/
│   │   ├── SurveyBuilder.jsx
│   │   ├── SurveyList.jsx
│   │   ├── SurveyResponse.jsx
│   │   └── ResultsAnalysis.jsx
│   ├── notifications/
│   │   ├── NotificationCenter.jsx
│   │   ├── NotificationItem.jsx
│   │   └── AlertBadge.jsx
│   ├── support/
│   │   ├── HelpCenter.jsx
│   │   ├── TicketCreation.jsx
│   │   ├── TicketList.jsx
│   │   └── TicketDetail.jsx
│   └── configuration/
│       ├── PermissionMatrix.jsx
│       ├── SystemConfig.jsx
│       └── EvaluationStructure.jsx
├── layouts/
│   ├── AuthLayout.jsx
│   ├── DashboardLayout.jsx
│   └── PublicLayout.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useNotifications.js
│   ├── useWebSocket.js
│   └── usePolling.js
├── services/
│   ├── authService.js
│   ├── academicService.js
│   ├── communicationService.js
│   ├── messagingService.js
│   ├── surveyService.js
│   ├── notificationService.js
│   └── supportService.js
└── utils/
    ├── apiClient.js
    ├── fileValidation.js
    ├── dateHelpers.js
    └── gradeCalculations.js
```

### **4.2 Componentes Transversales**

**Header con Navegación:**
- Logo institucional + nombre usuario
- Selector de hijo (padres) integrado
- Menú de navegación adaptativo por rol
- Indicadores de notificaciones no leídas
- Logout con confirmación

**Sidebar de Navegación:**
- Menú colapsible responsive
- Iconografía consistente por módulo
- Estados activo/inactivo según ruta
- Agrupación lógica por funcionalidad

**Componentes de Feedback:**
- Loading spinners y skeletons
- Toast notifications para acciones
- Modales de confirmación críticos
- Progress bars para cargas de archivos

---

## **5. PATRONES DE NAVEGACIÓN**

### **5.1 Navegación Jerárquica**

**Estructura por Rol:**
```
Padre:
├─ Dashboard Principal
├─ Académico
│  ├─ Calificaciones → Detalle por curso
│  └─ Asistencia → Vista calendario/lista
├─ Comunicación → Lista → Detalle
├─ Mensajería → Conversaciones → Detalle
├─ Encuestas → Lista → Respuesta
├─ Notificaciones → Centro → Historial
└─ Soporte → Ayuda/Tickets

Docente:
├─ Dashboard Cursos
├─ Académico
│  ├─ Carga Datos → Contexto → Upload
│  └─ Consulta → Por curso asignado
├─ Mensajería → Conversaciones por estudiante
├─ Comunicación → Crear/Gestionar (si autorizado)
└─ Encuestas → Crear/Gestionar (si autorizado)

Director:
├─ Dashboard Institucional
├─ Académico → Todos los cursos → Aprobación cierres
├─ Supervisión → Todas las conversaciones
├─ Comunicación → Gestión completa
├─ Encuestas → Gestión + Análisis
├─ Configuración → Permisos + Estructura
└─ Reportes → Métricas institucionales
```

### **5.2 Breadcrumbs y Estados**

**Navegación contextual:**
- Breadcrumbs en rutas profundas (más de 2 niveles)
- Estado de "atrás" preservado en navegación
- Deep linking para compartir vistas específicas
- Historial de navegación inteligente

**Indicadores de estado:**
- Badges para elementos no leídos/pendientes
- Progress indicators en procesos largos
- Estados de carga granulares por sección
- Feedback inmediato en interacciones

---

## **6. CONSIDERACIONES DE UX/UI**

### **6.1 Principios de Diseño**

**Mobile-First Responsive:**
- Diseño primario para móviles (320px+)
- Breakpoints: mobile (320px), tablet (768px), desktop (1024px)
- Touch-friendly (44px mínimo para botones)
- Optimización de formularios móviles

**Accesibilidad:**
- Contraste mínimo 4.5:1 (WCAG AA)
- Navegación por teclado completa
- Screen reader friendly
- Texto alternativo en imágenes

**Performance:**
- Lazy loading de componentes pesados
- Imágenes optimizadas y responsive
- Bundle splitting por rutas
- Service worker para cache offline

### **6.2 Consistencia Visual**

**Sistema de Diseño:**
- Paleta de colores institucional
- Tipografía escalable (rem/em)
- Spacing system (4px, 8px, 16px, 24px, 32px)
- Componentes reutilizables (botones, inputs, cards)

**Iconografía:**
- Librería consistente (Lucide React)
- Tamaños estándar (16px, 20px, 24px, 32px)
- Estados interactivos (hover, active, disabled)
- Contexto semántico por módulo

