## **FASE I: ANÁLISIS Y DISEÑO TÉCNICO**

### **Semana 1: Análisis de Requisitos  (HOY)**

**Objetivo:** Definir completamente los requisitos funcionales y no funcionales del sistema

**Entregable:** Documento de Especificación de Requisitos (SRS) con historias de usuario

**Actividades:**

- Análisis detallado de problemática y contexto
- Identificación y caracterización de usuarios (roles y permisos)
- Redacción de historias de usuario por módulo (30+ historias)
- Definición del alcance del MVP y funcionalidades futuras
- Matriz de trazabilidad requisitos-funcionalidades

---

### **Semana 2: Diseño Funcional y Técnico**

**Objetivo:** Crear el diseño completo de la arquitectura del sistema y experiencia de usuario

**Entregable:** Documento de Diseño del Sistema + Wireframes + Diagramas

**Actividades:**

- Definición de arquitectura del sistema (frontend-backend separado)
- Diseño completo de base de datos (modelo ER con todas las entidades)
- Creación de wireframes para todas las pantallas principales
- Mapa de navegación y flujos de usuario por rol
- Diagramas de componentes y arquitectura técnica

---

### **Semana 3: Setup del Proyecto y Configuración**

**Objetivo:** Configurar completamente el entorno de desarrollo y estructura base

**Entregable:** Proyecto base funcionando + Repositorio configurado + Documentación técnica

**Actividades:**

- Creación de repositorio GitHub con estructura de ramas (main, dev, feature/*)
- Setup completo del backend (Express + conexión a Neon PostgreSQL)
- Setup completo del frontend (React + Vite + Tailwind)
- Configuración de variables de entorno y scripts de desarrollo
- Primer commit con proyecto base ejecutándose correctamente

---

## **FASE II: DESARROLLO ÁGIL POR SPRINTS**

### **Sprint 1 - Semanas 4-5: Autenticación y Base del Sistema**

**Objetivo:** Implementar sistema de autenticación completo con roles diferenciados

**Entregable:** Login funcional + Dashboard base + Documentación del sprint

**Semana 4 - Backend Autenticación:**

- Modelo de datos para usuarios (padres, docentes, admin)
- APIs de registro y login con JWT
- Middleware de autenticación y autorización por roles
- Endpoints de perfil de usuario y gestión de sesiones

**Semana 5 - Frontend Autenticación:**

- Pantallas de login responsive
- Dashboard diferenciado por tipo de usuario
- Navegación principal con menús por rol
- Manejo de estados de autenticación (login/logout)
- Rutas protegidas por rol

---

### **Sprint 2 - Semanas 6-7: Módulo de Información Académica**

**Objetivo:** Desarrollar visualización completa de calificaciones y asistencia

**Entregable:** Sistema completo de consulta académica + Demo funcional

**Semana 6 - Backend Académico:**

- Modelo de datos para estudiantes, cursos, calificaciones y asistencia
- APIs para consulta de notas por bimestre y componentes
- APIs para registro y consulta de asistencia diaria
- Sistema de alertas automáticas (inasistencias, bajo rendimiento)

**Semana 7 - Frontend Académico:**

- Dashboard académico para padres con gráficos
- Tablas interactivas de calificaciones por bimestre
- Calendario de asistencia con estados visuales
- Panel de alertas y notificaciones académicas
- Filtros por fecha, curso y bimestre

---

### **Sprint 3 - Semanas 8-9: Comunicación Institucional**

**Objetivo:** Implementar sistema de comunicados y avisos oficiales

**Entregable:** Gestión completa de comunicados + Sistema de notificaciones

**Semana 8 - Backend Comunicados:**

- Modelo de datos para comunicados y destinatarios
- APIs para creación, edición y publicación de comunicados
- Sistema de segmentación de audiencia (por grado, nivel, rol)
- APIs para notificaciones y seguimiento de lectura

**Semana 9 - Frontend Comunicados:**

- Panel administrativo para gestión de comunicados
- Vista de comunicados para padres con filtros
- Sistema de notificaciones en tiempo real
- Interfaz para marcar como leído y feedback
- Editor de comunicados con preview

---

### **Sprint 4 - Semanas 10-11: Mensajería y Soporte**

**Objetivo:** Crear sistema de comunicación directa y soporte técnico

**Entregable:** Mensajería completa + Centro de soporte funcional

**Semana 10 - Backend Mensajería:**

- Modelo de datos para conversaciones y mensajes
- APIs para envío, recepción y historial de mensajes
- Sistema de notificaciones de mensajes nuevos
- APIs para tickets de soporte y FAQ

**Semana 11 - Frontend Mensajería:**

- Interfaz de mensajería tipo chat
- Bandeja de entrada con filtros y búsqueda
- Centro de ayuda con FAQ categorizado
- Sistema de tickets de soporte con seguimiento
- Notificaciones en tiempo real para mensajes

---

### **Semana 12: Encuestas e Integración General**

**Objetivo:** Completar módulo de encuestas e integrar todos los componentes

**Entregable:** Sistema completo integrado + Módulo de encuestas

**Actividades:**

- Desarrollo completo del módulo de encuestas (backend + frontend)
- Integración de todos los módulos desarrollados
- Pruebas de integración entre componentes
- Ajustes de interfaz y experiencia de usuario
- Optimización de rendimiento y corrección de bugs

---

## **FASE III: CONSOLIDACIÓN Y PRESENTACIÓN**

### **Semana 13: Testing y Deploy**

**Objetivo:** Realizar pruebas exhaustivas y desplegar en producción

**Entregable:** Sistema desplegado + Documentación de pruebas + Manual de usuario

**Actividades:**

- Pruebas funcionales completas de todos los módulos
- Pruebas de integración y flujos de usuario end-to-end
- Deploy del backend en Render/Railway
- Deploy del frontend en Render/Railway
- Configuración de base de datos de producción en Neon
- Creación de manual de usuario con capturas de pantalla

---

### **Semana 14: Documentación Final y Presentación**

**Objetivo:** Completar documentación del proyecto y preparar presentación final

**Entregable:** Documentación técnica completa + Presentación + Video demo

**Actividades:**

- Documentación técnica completa (README, API docs, guías)
- Documentación académica final del proyecto
- Creación de presentación para sustentación
- Grabación de video demo del sistema funcionando
- Preparación de respuestas para posibles preguntas
- Backup del proyecto y entregables finales

---

# 📊 **DIAGRAMA DE GANTT (Formato Texto)**

```
SEMANAS: 1    2    3    4    5    6    7    8    9   10   11   12   13   14
         |    |    |    |    |    |    |    |    |    |    |    |    |    |

FASE I - ANÁLISIS Y DISEÑO:
├─ Análisis Requisitos    [████]
├─ Diseño Técnico              [████]
└─ Setup Proyecto                   [████]

FASE II - DESARROLLO ÁGIL:
├─ Sprint 1: Autenticación               [████████]
├─ Sprint 2: Info Académica                       [████████]
├─ Sprint 3: Comunicados                                   [████████]
├─ Sprint 4: Mensajería                                             [████████]
└─ Integración                                                               [████]

FASE III - CONSOLIDACIÓN:
├─ Testing y Deploy                                                               [████]
└─ Documentación Final                                                                 [████]

ENTREGABLES SEMANALES:
S1:  SRS + Historias Usuario
S2:  Diseño Sistema + Wireframes
S3:  Proyecto Base Funcionando
S4:  Backend Autenticación
S5:  Login + Dashboard Base
S6:  Backend Académico
S7:  Vista Calificaciones + Asistencia
S8:  Backend Comunicados
S9:  Gestión Comunicados + Notificaciones
S10: Backend Mensajería + Soporte
S11: Chat + Centro Ayuda
S12: Encuestas + Integración Completa
S13: Deploy + Testing + Manual Usuario
S14: Documentación Final + Presentación

```