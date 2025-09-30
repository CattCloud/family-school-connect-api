# **CRONOGRAMA DE DESARROLLO - 14 SEMANAS**
**Plataforma de Comunicación y Seguimiento Académico - I.E.P. Las Orquídeas**

## **METODOLOGÍA: Incremental e Iterativa (Scrum/Agile Modularizado)**

### **Principios aplicados:**
- **Incremental:** Desarrollo por módulos funcionales completos
- **Iterativo:** Cada módulo sigue el mismo ciclo de 7 pasos
- **Priorización por dependencias:** Módulos base primero
- **Integración continua:** Cada módulo se integra al completarse

---

## **FASE I: ANÁLISIS Y DISEÑO TÉCNICO**

### **Semana 1: Análisis de Requisitos (COMPLETADO)**
**Objetivo:** Definir completamente los requisitos funcionales y no funcionales del sistema

**Entregables:**
- Documento de Especificación de Requisitos (SRS)
- 20+ Historias de Usuario detalladas
- Modelo de entidades de base de datos

---

### **Semana 2: Diseño Funcional y Técnico (ACTUAL)**
**Objetivo:** Crear el diseño completo de la arquitectura del sistema y experiencia de usuario

**Entregables:**
- Arquitectura funcional del frontend
- Arquitectura del sistema y stack tecnologico
- Diseño completo de base de datos (modelo ER con todas las entidades)

---

## **FASE II: DESARROLLO INCREMENTAL POR MÓDULOS**

### **Semana 3: Setup del Proyecto y Módulo de Autenticación - Parte 1**

**Objetivo:** Configurar entorno + iniciar módulo crítico de autenticación

**Actividades (Setup - 2 días):**
- Creación de repositorio GitHub con estructura de ramas
- Setup backend (Express + Neon PostgreSQL)
- Setup frontend (React + Vite + Tailwind)
- Configuración de variables de entorno y herramientas de calidad

**Actividades (Autenticación - 3 días):**
- **Refinación HU:** Criterios de aceptación para autenticación
- **Diseño API REST:** Endpoints de login, logout, recuperación
- **Wireframes:** Pantallas de login y recuperación refinadas

**Entregables:**
- Proyecto base ejecutándose
- API de autenticación diseñada
- Wireframes de autenticación listos

---

### **Semana 4: Módulo de Autenticación - Parte 2 (Completar)**

**Objetivo:** Completar sistema de autenticación funcional

**Actividades:**
- **Codificación Backend:** JWT, middleware de autenticación, endpoints
- **Test Backend:** Pruebas unitarias y de integración
- **Codificación Frontend:** Login, recuperación, gestión de sesiones
- **Test Frontend:** Pruebas de componentes y e2e
- **Integración:** Flujo completo frontend-backend

**Entregables:**
- Sistema de autenticación 100% funcional
- Documentación técnica del módulo
- Pruebas automatizadas

---

### **Semana 5: Módulo de Gestión de Usuarios**

**Objetivo:** Sistema de usuarios y permisos 

**Actividades (Ciclo completo en 1 semana):**
- **Refinación HU:** Gestión de usuarios y permisos
- **Diseño API REST:** Endpoints CRUD de usuarios y asignación de permisos
- **Wireframes:** Pantallas de gestión refinadas
- **Codificación Backend:** Endpoints de gestión y permisos
- **Test Backend:** Validación de lógica de permisos
- **Codificación Frontend:** Interfaces de gestión de usuarios
- **Test Frontend + Integración:** Flujo completo funcional

**Entregables:**
- Sistema de gestión de usuarios completo
- Permisos  implementados

---

### **Semanas 6-7: Módulo de Datos Académicos (Crítico - 2 semanas)**

**Objetivo:** Sistema completo de calificaciones y asistencia

**Semana 6:**
- **Refinación HU:** Carga y visualización de datos académicos
- **Diseño API REST:** Endpoints complejos de calificaciones/asistencia
- **Wireframes:** Interfaces de carga y consulta refinadas
- **Codificación Backend:** Lógica de validación de archivos Excel/CSV
- **Test Backend:** Validación exhaustiva de carga masiva

**Semana 7:**
- **Codificación Frontend:** Interfaces de carga y visualización
- **Implementación:** Sistema de alertas automáticas post-carga
- **Test Frontend:** Pruebas de subida de archivos y visualización
- **Integración:** Flujo completo de carga → procesamiento → alertas
- **Optimización:** Performance para manejo de archivos grandes

**Entregables:**
- Sistema de datos académicos 100% funcional
- Validación robusta de archivos
- Alertas automáticas implementadas

---

### **Semana 8: Módulo de Notificaciones + Integración WhatsApp**

**Objetivo:** Sistema híbrido de notificaciones (plataforma + WhatsApp)

**Actividades (Ciclo acelerado):**
- **Refinación HU:** Notificaciones y alertas automáticas
- **Diseño API REST:** Endpoints de notificaciones y integración WhatsApp
- **Codificación Backend:** Motor de notificaciones + API WhatsApp
- **Test Backend:** Pruebas de envío dual (plataforma + WhatsApp)
- **Codificación Frontend:** Centro de notificaciones
- **Test Frontend + Integración:** Validación de flujo híbrido

**Entregables:**
- Sistema de notificaciones completo
- Integración WhatsApp funcional
- Centro de notificaciones en frontend

---

### **Semana 9: Módulo de Comunicación - Mensajería**

**Objetivo:** Sistema de mensajería bidireccional con archivos

**Actividades:**
- **Refinación HU:** Mensajería entre padres-docentes-director
- **Diseño API REST:** Endpoints de conversaciones y mensajes
- **Codificación Backend:** Lógica de mensajería + integración Cloudinary
- **Test Backend:** Pruebas de conversaciones y archivos adjuntos
- **Codificación Frontend:** Interface de chat y conversaciones
- **Test Frontend + Integración:** Flujo completo de mensajería

**Entregables:**
- Sistema de mensajería funcional
- Soporte para archivos adjuntos
- Supervisión para director implementada

---

### **Semana 10: Módulo de Comunicación - Comunicados**

**Objetivo:** Sistema de comunicados institucionales

**Actividades:**
- **Refinación HU:** Comunicados con segmentación de audiencia
- **Diseño API REST:** Endpoints de comunicados y lectura
- **Codificación Backend:** Lógica de segmentación y publicación
- **Test Backend:** Validación de permisos y audiencias
- **Codificación Frontend:** Editor de comunicados y visualización
- **Test Frontend + Integración:** Flujo de creación → publicación → lectura

**Entregables:**
- Sistema de comunicados completo
- Segmentación por grado/nivel/rol
- Indicadores de lectura implementados

---

### **Semana 11: Módulo de Encuestas**

**Objetivo:** Sistema de encuestas con análisis de resultados

**Actividades:**
- **Refinación HU:** Creación y respuesta de encuestas
- **Diseño API REST:** Endpoints de encuestas y respuestas (JSON dinámico)
- **Codificación Backend:** Motor de encuestas flexible + análisis
- **Test Backend:** Validación de tipos de preguntas y resultados
- **Codificación Frontend:** Constructor de encuestas + análisis visual
- **Test Frontend + Integración:** Flujo de creación → respuesta → análisis

**Entregables:**
- Sistema de encuestas completo
- 5 tipos de preguntas soportadas
- Dashboard de análisis con gráficos

---

### **Semana 12: Módulo de Soporte Técnico + Centro de Ayuda**

**Objetivo:** Sistema de tickets y autoayuda

**Actividades:**
- **Refinación HU:** Tickets de soporte y FAQ
- **Diseño API REST:** Endpoints de tickets y conversación
- **Codificación Backend:** Sistema de tickets con estados y prioridades
- **Test Backend:** Validación de flujo de atención
- **Codificación Frontend:** Centro de ayuda + sistema de tickets
- **Test Frontend + Integración:** Flujo de creación → atención → resolución

**Entregables:**
- Sistema de soporte técnico completo
- FAQ interactivo
- Panel administrativo para tickets

---

### **Semana 13: Integración Final + Dashboard Principal + Optimización**

**Objetivo:** Unificar todos los módulos + optimizar performance

**Actividades:**
- **Dashboard Principal:** Implementación de centro de navegación por rol
- **Integración Módulos:** Conexión de todos los flujos inter-módulos
- **Pruebas E2E:** Testing de flujos completos por tipo de usuario
- **Optimización:** Performance, carga de datos, consultas
- **Corrección de Bugs:** Resolución de issues encontrados en integración
- **Documentación:** Actualización de documentación técnica completa

**Entregables:**
- Dashboard funcional para todos los roles
- Sistema completamente integrado
- Performance optimizada
- Documentación técnica actualizada

---

## **FASE III: DEPLOY Y PRESENTACIÓN**

### **Semana 14: Deploy a Producción + Presentación Final**

**Objetivo:** Desplegar sistema + preparar presentación académica

**Actividades:**
- **Deploy Backend:** Configuración en Render/Railway con variables de producción
- **Deploy Frontend:** Configuración de build y deployment
- **Base de Datos:** Configuración final en Neon PostgreSQL con datos de prueba
- **Testing Producción:** Pruebas en ambiente real
- **Manual de Usuario:** Creación con capturas y flujos por rol
- **Presentación Académica:** Preparación de slides y demo en vivo
- **Video Demo:** Grabación de funcionalidades principales
- **Documentación Final:** README, guías de instalación, API docs

**Entregables:**
- Sistema desplegado y funcional en producción
- Manual de usuario completo
- Presentación académica lista
- Video demo de 10-15 minutos
- Documentación técnica completa

---

## **CRONOGRAMA VISUAL COMPACTADO**

```
Semana 1: [ANÁLISIS] 
Semana 2: [DISEÑO] ← ACTUAL
Semana 3: [SETUP + AUTENTICACIÓN 1/2]
Semana 4: [AUTENTICACIÓN 2/2] 
Semana 5: [GESTIÓN USUARIOS]
Semana 6: [DATOS ACADÉMICOS 1/2]
Semana 7: [DATOS ACADÉMICOS 2/2] 
Semana 8: [NOTIFICACIONES + WHATSAPP]
Semana 9: [MENSAJERÍA]
Semana 10: [COMUNICADOS]
Semana 11: [ENCUESTAS]
Semana 12: [SOPORTE TÉCNICO]
Semana 13: [INTEGRACIÓN + DASHBOARD]
Semana 14: [DEPLOY + PRESENTACIÓN]
```

## **DEPENDENCIAS CRÍTICAS RESPETADAS**

1. **Autenticación** → Base para todos los módulos (Semanas 3-4)
2. **Gestión de Usuarios** → Define permisos para otros módulos (Semana 5)
3. **Datos Académicos** → Alimenta notificaciones automáticas (Semanas 6-7)
4. **Notificaciones** → Depende de datos académicos para alertas (Semana 8)
5. **Comunicación** → Utiliza sistema de notificaciones (Semanas 9-10)
6. **Módulos Independientes** → Encuestas y Soporte pueden desarrollarse en paralelo conceptual

## **ESTRATEGIAS DE COMPACTACIÓN APLICADAS**

- **Módulos simples en 1 semana:** Gestión de usuarios, notificaciones, mensajería, comunicados, encuestas, soporte
- **Módulos complejos en 2 semanas:** Solo datos académicos (por validación de archivos y lógica de alertas)
- **Integración continua:** Cada módulo se integra al completarse, no al final
- **Paralelización conceptual:** Wireframes y APIs se refinan mientras se codifica el módulo anterior
- **Testing integrado:** Se hace en la misma semana, no en fase separada

