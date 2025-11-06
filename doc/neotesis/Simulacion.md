# DOCUMENTACIÓN DE SIMULACIÓN DE INSTANCIAS DE PRUEBA

## CONTEXTO GENERAL

Esta documentación define los volúmenes realistas de interacciones, patrones de comportamiento y distribuciones temporales que deben simular las cuatro instancias de prueba durante el período de validación de 14 días (2 semanas). Los datos aquí especificados servirán como base para la codificación de scripts ejecutables que generarán registros en las tablas del sistema de manera automatizada, garantizando coherencia metodológica con las métricas definidas en la Matriz de Operacionalización.

---

## 1. INSTANCIA PADRE DE FAMILIA

### 1.1 Perfil de Comportamiento

El padre representa un usuario **moderadamente activo** que utiliza la plataforma para seguimiento académico regular de su hijo, con patrones de acceso consistentes pero no excesivos. Este perfil busca validar un uso realista que cumpla los umbrales mínimos y objetivos de las métricas definidas.

### 1.2 Volúmenes de Interacción por Actividad

#### **Autenticación (Métrica M9: Frecuencia de logins semanales)**

- **Total de logins durante 2 semanas:** 18-20 logins
- **Distribución semanal:** 9-10 logins por semana
- **Objetivo métrico:** ≥ 4 logins/semana (se supera el objetivo)
- **Patrón temporal:**
  - Lunes: 2 logins (mañana y tarde)
  - Martes: 1 login (tarde)
  - Miércoles: 2 logins (mañana y noche)
  - Jueves: 1 login (tarde)
  - Viernes: 2 logins (mañana y tarde)
  - Sábado: 1 login (mañana)
  - Domingo: 0-1 login (opcional, tarde)

- **Distribución horaria realista:**
  - Mañana (7am-9am): 30% de logins (antes de ir a trabajar)
  - Tarde (2pm-6pm): 40% de logins (después del trabajo)
  - Noche (8pm-10pm): 30% de logins (antes de dormir)

- **Duración promedio de sesión:** 8-15 minutos por login

#### **Constancia en el Seguimiento (Métrica M10)**

- **Días con al menos 1 acceso:** 10-11 días de los 14 días totales
- **Porcentaje esperado:** 71-78% (supera umbral objetivo de ≥60%)
- **Días sin acceso:** 3-4 días (distribuidos: 1 día en semana 1, 2-3 días en semana 2)

#### **Consulta de Calificaciones (Métrica M1)**

- **Total de accesos al módulo de calificaciones:** 18-22 accesos durante las 2 semanas
- **Frecuencia semanal:** 9-11 accesos/semana
- **Objetivo métrico:** ≥ 2 accesos/semana (se supera ampliamente)
- **Patrón de consulta:**
  - Revisión completa de todos los cursos: 4 veces durante las 2 semanas (1 vez por semana + 2 revisiones adicionales)
  - Revisión selectiva de 2-3 cursos: 14-18 veces (consultas específicas tras alertas o interés particular)

#### **Consulta de Asistencia (Métrica M2)**

- **Total de accesos al módulo de asistencia:** 12-16 accesos durante las 2 semanas
- **Frecuencia semanal:** 6-8 accesos/semana
- **Objetivo métrico:** ≥ 2 accesos/semana (se supera ampliamente)
- **Patrón de consulta:**
  - Revisión del mes completo (calendario): 6 veces durante las 2 semanas (3 veces por semana)
  - Revisión diaria tras alerta de inasistencia: 6-10 veces (reacción a notificaciones)

#### **Cobertura de Consulta Académica (Métrica M3)**

- **Total de cursos del estudiante:** 8 cursos asignados
- **Cursos consultados al menos 1 vez:** 7 cursos (87.5% de cobertura)
- **Objetivo métrico:** ≥ 80% (se cumple el objetivo)
- **Distribución:**
  - Cursos principales (Matemática, Comunicación, Ciencias): consultados 4-6 veces cada uno
  - Cursos secundarios (Arte, Educación Física, Religión): consultados 1-2 veces cada uno
  - 1 curso no consultado (ej. Educación para el Trabajo)

#### **Lectura de Comunicados (Métrica M4 y M5)**

- **Total de comunicados publicados dirigidos al padre:** 6 comunicados durante las 2 semanas
  - 3 comunicados de tipo "informativo"
  - 2 comunicados de tipo "académico"
  - 1 comunicado de tipo "urgente"

- **Comunicados leídos:** 5 de 6 (83.3% de tasa de lectura)
- **Objetivo métrico:** ≥ 70% (se supera el objetivo)
- **1 comunicado no leído:** Comunicado informativo de baja prioridad publicado el día 13

- **Tiempos hasta lectura:**
  - Comunicado urgente: leído en 3 horas después de publicación
  - Comunicados académicos: leídos en 8-12 horas después de publicación (promedio: 10 horas)
  - Comunicados informativos: leídos en 18-30 horas después de publicación (promedio: 24 horas)
  - **Tiempo promedio general:** 14-16 horas (cumple umbral objetivo de ≤24 horas)

#### **Visualización de Notificaciones (Métrica M6)**

- **Total de notificaciones enviadas:** 14 notificaciones durante las 2 semanas
  - 4 notificaciones de asistencia (2 tardanzas, 2 faltas injustificadas)
  - 3 notificaciones de calificaciones (1 calificación baja en Matemática, 2 alertas de mejora)
  - 5 notificaciones de comunicados (1 urgente, 4 normales)
  - 2 notificaciones de encuestas

- **Notificaciones visualizadas:** 12 de 14 (85.7% de tasa de visualización)
- **Objetivo métrico:** ≥ 85% (se cumple justo el objetivo)
- **2 notificaciones no visualizadas:** 1 comunicado informativo + 1 alerta de calificación no crítica

#### **Tiempo de Reacción a Alertas Críticas (Métrica M11)**

- **Total de alertas críticas enviadas:** 4 alertas (2 tardanzas + 2 faltas injustificadas)
- **Tiempos de reacción:**
  - Alerta 1 (tardanza): visualizada en 1.5 horas
  - Alerta 2 (falta injustificada): visualizada en 4 horas
  - Alerta 3 (tardanza): visualizada en 2 horas
  - Alerta 4 (falta injustificada): visualizada en 3 horas
  - **Tiempo promedio:** 2.6 horas (cumple objetivo de ≤2 horas con margen)

#### **Frecuencia de Revisión Post-Alerta (Métrica M12)**

- **Accesos a módulo de asistencia en las 24h posteriores a cada alerta crítica:**
  - Tras Alerta 1: 2 accesos (revisa asistencia del día + histórico semanal)
  - Tras Alerta 2: 3 accesos (revisa asistencia del día + histórico semanal + histórico mensual)
  - Tras Alerta 3: 1 acceso (solo revisa asistencia del día)
  - Tras Alerta 4: 2 accesos (revisa asistencia del día + histórico semanal)
  - **Promedio:** 2 accesos/alerta (cumple objetivo de ≥2 accesos/notificación)

#### **Participación en Encuestas (Métrica M7)**

- **Total de encuestas publicadas dirigidas al padre:** 2 encuestas
  - Encuesta 1: "Satisfacción con la plataforma de comunicación" (publicada día 7)
  - Encuesta 2: "Valoración del seguimiento académico digital" (publicada día 12)

- **Encuestas respondidas:** 2 de 2 (100% de participación)
- **Objetivo métrico:** ≥ 70% (se supera ampliamente)
- **Tiempos de respuesta:**
  - Encuesta 1: respondida 18 horas después de publicación
  - Encuesta 2: respondida 25 horas después de publicación
  - **Tiempo promedio:** 21.5 horas

#### **Creación de Tickets de Soporte (Métrica M8 - como solicitante)**

- **Total de tickets creados por el padre:** 2 tickets
  - Ticket 1 (día 3): Categoría "acceso_plataforma" - Prioridad "normal" - "No puedo visualizar calificaciones del trimestre anterior"
  - Ticket 2 (día 10): Categoría "funcionalidad_academica" - Prioridad "alta" - "Las notificaciones de WhatsApp no están llegando"

- **Estados esperados:**
  - Ticket 1: Resuelto en 18 horas
  - Ticket 2: Resuelto en 6 horas (por prioridad alta)

#### **Diversidad de Uso del Sistema (Métrica M14)**

- **Módulos consultados al menos 1 vez:** 5 de 6 módulos disponibles
  - Calificaciones: ✓ (consultado 18-22 veces)
  - Asistencia: ✓ (consultado 12-16 veces)
  - Comunicados: ✓ (consultado 5 veces)
  - Notificaciones: ✓ (consultado 12 veces)
  - Encuestas: ✓ (consultado 2 veces)
  - Soporte: ✓ (consultado 2 veces)
- **Objetivo métrico:** ≥ 4 módulos (se supera el objetivo)

#### **Participación Activa (Métrica M13)**

- **Días con ≥2 accesos significativos (>10 segundos en módulos académicos):** 9 días de 14
- **Porcentaje esperado:** 64.3% (supera objetivo de ≥50%)

---

## 2. INSTANCIA DOCENTE

### 2.1 Perfil de Comportamiento

El docente representa un usuario **funcional y regular** que utiliza la plataforma principalmente para publicar información institucional, generar alertas académicas y responder consultas. Su patrón de acceso es más estructurado y predecible que el del padre, con picos de actividad durante días lectivos.

### 2.2 Volúmenes de Interacción por Actividad

#### **Autenticación**

- **Total de logins durante 2 semanas:** 16-18 logins
- **Distribución semanal:** 8-9 logins por semana
- **Patrón temporal:**
  - Lunes a viernes: 1-2 logins por día (horario laboral: 8am-3pm)
  - Sábado y domingo: 0-1 login (eventual revisión)

- **Distribución horaria:**
  - Mañana (8am-10am): 60% de logins (inicio de jornada laboral)
  - Tarde (1pm-3pm): 30% de logins (final de jornada)
  - Noche (8pm-9pm): 10% de logins (trabajo desde casa)

- **Duración promedio de sesión:** 15-25 minutos por login

#### **Publicación de Comunicados**

- **Total de comunicados publicados:** 3 comunicados durante las 2 semanas
  - Comunicado 1 (día 2): Tipo "académico" - "Recordatorio de entrega de tareas del curso de Matemática"
  - Comunicado 2 (día 8): Tipo "informativo" - "Cambio de horario de clases por actividad institucional"
  - Comunicado 3 (día 13): Tipo "académico" - "Avance del programa curricular - Trimestre II"

- **Público objetivo:** Padres de estudiantes de sus cursos asignados (aproximadamente 30 padres)

#### **Generación de Notificaciones Académicas**

El docente **no genera notificaciones manualmente**, sino que el sistema las genera **automáticamente** tras cargar archivos de calificaciones y asistencia. Sin embargo, el docente es responsable de la carga de datos que dispara estas notificaciones.

- **Carga de archivos de asistencia:** 8 cargas durante las 2 semanas (4 por semana, días: lunes y jueves)
  - Cada carga genera entre 2-5 notificaciones automáticas (tardanzas, faltas injustificadas)
  - **Total de notificaciones de asistencia generadas:** 20-30 notificaciones

- **Carga de archivos de calificaciones:** 2 cargas durante las 2 semanas
  - Carga 1 (día 5): Calificaciones preliminares del Trimestre II - Componente 1
  - Carga 2 (día 12): Calificaciones preliminares del Trimestre II - Componente 2
  - Cada carga genera entre 3-8 notificaciones automáticas (calificaciones bajas)
  - **Total de notificaciones de calificaciones generadas:** 10-15 notificaciones

#### **Consulta de Información Académica**

- **Accesos al módulo de calificaciones:** 10-12 accesos (para verificar registros cargados)
- **Accesos al módulo de asistencia:** 12-15 accesos (para verificar registros cargados y consultar histórico)

#### **Creación de Encuestas**

- **Total de encuestas creadas:** 1 encuesta durante las 2 semanas
  - Encuesta (día 11): "Valoración del curso de Matemática - Trimestre II"
  - Público objetivo: Padres de estudiantes de Matemática (20 padres)
  - Tipo de preguntas: 3 preguntas de opción única + 1 pregunta de texto libre + 1 pregunta de escala 1-5

#### **Creación de Tickets de Soporte**

- **Total de tickets creados por el docente:** 1 ticket
  - Ticket 1 (día 6): Categoría "funcionalidad_academica" - Prioridad "alta" - "Error al cargar archivo de calificaciones en formato CSV"

- **Estado esperado:** Resuelto en 8 horas

#### **Diversidad de Uso del Sistema**

- **Módulos consultados:** 5 módulos
  - Calificaciones: ✓
  - Asistencia: ✓
  - Comunicados: ✓
  - Encuestas: ✓
  - Soporte: ✓

---

## 3. INSTANCIA DIRECTOR

### 3.1 Perfil de Comportamiento

El director representa un usuario **supervisor y estratégico** que utiliza la plataforma para gestión institucional, publicación de comunicados globales, creación de encuestas y supervisión general del sistema. Su patrón de acceso es menos frecuente que docentes y padres, pero más diverso en funcionalidades utilizadas.

### 3.2 Volúmenes de Interacción por Actividad

#### **Autenticación**

- **Total de logins durante 2 semanas:** 12-14 logins
- **Distribución semanal:** 6-7 logins por semana
- **Patrón temporal:**
  - Lunes, miércoles, viernes: 1-2 logins por día (días de gestión administrativa)
  - Martes, jueves, sábado, domingo: 0-1 login

- **Distribución horaria:**
  - Mañana (9am-11am): 50% de logins
  - Tarde (3pm-5pm): 40% de logins
  - Noche (7pm-9pm): 10% de logins

- **Duración promedio de sesión:** 20-35 minutos por login

#### **Publicación de Comunicados Institucionales**

- **Total de comunicados publicados:** 3 comunicados durante las 2 semanas
  - Comunicado 1 (día 1): Tipo "informativo" - Prioridad "normal" - "Bienvenida al Trimestre II - Año Académico 2025"
  - Comunicado 2 (día 7): Tipo "urgente" - Prioridad "alta" - "Suspensión de clases por motivos de fuerza mayor - 15 de marzo"
  - Comunicado 3 (día 12): Tipo "evento" - Prioridad "normal" - "Invitación a Jornada de Integración Familiar - 25 de marzo"

- **Público objetivo:** Todos los padres de la institución (100% de padres registrados)

#### **Creación de Encuestas Institucionales**

- **Total de encuestas creadas:** 1 encuesta durante las 2 semanas
  - Encuesta (día 9): "Satisfacción con la comunicación institucional y seguimiento académico"
  - Público objetivo: Todos los padres de familia (100% de padres)
  - Tipo de preguntas: 2 preguntas de opción única + 1 pregunta de opción múltiple + 2 preguntas de escala 1-5 + 1 pregunta de texto libre

#### **Supervisión de Información Académica**

- **Accesos al módulo de calificaciones:** 6-8 accesos (supervisión de registros por curso y nivel)
- **Accesos al módulo de asistencia:** 5-7 accesos (supervisión de inasistencias institucionales)
- **Accesos al módulo de comunicados:** 8-10 accesos (revisión de comunicados publicados por docentes)

#### **Gestión de Tickets de Soporte**

El director **no gestiona tickets** directamente (esa función corresponde al administrador), pero puede **crear tickets** como cualquier usuario.

- **Total de tickets creados por el director:** 1 ticket
  - Ticket 1 (día 4): Categoría "funcionalidad_academica" - Prioridad "normal" - "¿Cómo configurar la estructura de evaluación para el Trimestre III?"

- **Estado esperado:** Resuelto en 12 horas

#### **Diversidad de Uso del Sistema**

- **Módulos consultados:** 5 módulos
  - Calificaciones: ✓
  - Asistencia: ✓
  - Comunicados: ✓
  - Encuestas: ✓
  - Soporte: ✓

---

## 4. INSTANCIA ADMINISTRADOR

### 4.1 Perfil de Comportamiento

El administrador representa un usuario **reactivo y técnico** que monitorea el sistema, gestiona tickets de soporte y garantiza el funcionamiento continuo de la plataforma. Su patrón de acceso está determinado por la creación de tickets por parte de otros usuarios.

### 4.2 Volúmenes de Interacción por Actividad

#### **Autenticación**

- **Total de logins durante 2 semanas:** 14-16 logins
- **Distribución semanal:** 7-8 logins por semana
- **Patrón temporal:**
  - Logins frecuentes durante días con tickets activos
  - Logins de monitoreo (sin tickets) cada 2-3 días

- **Distribución horaria:**
  - Mañana (8am-10am): 40% de logins (revisión de tickets nuevos)
  - Tarde (2pm-5pm): 40% de logins (resolución de tickets)
  - Noche (8pm-10pm): 20% de logins (seguimiento de tickets críticos)

- **Duración promedio de sesión:** 10-20 minutos por login

#### **Gestión de Tickets de Soporte (Métrica M8)**

- **Total de tickets a gestionar:** 4 tickets (creados por las 3 instancias)
  - **Ticket 1** (creado por Padre, día 3):
    - Categoría: "acceso_plataforma"
    - Prioridad: "normal"
    - Descripción: "No puedo visualizar calificaciones del trimestre anterior"
    - **Tiempo de resolución:** 18 horas
    - **Acciones del administrador:**
      - Día 3, 2pm: Asignación del ticket (2 horas después de creación)
      - Día 3, 3pm: Respuesta inicial solicitando capturas de pantalla (1 hora después de asignación)
      - Día 4, 8am: Diagnóstico del problema (filtro de año académico incorrecto)
      - Día 4, 9am: Resolución y cierre del ticket (18 horas totales desde creación)

  - **Ticket 2** (creado por Director, día 4):
    - Categoría: "funcionalidad_academica"
    - Prioridad: "normal"
    - Descripción: "¿Cómo configurar la estructura de evaluación para el Trimestre III?"
    - **Tiempo de resolución:** 12 horas
    - **Acciones del administrador:**
      - Día 4, 11am: Asignación del ticket (1 hora después de creación)
      - Día 4, 12pm: Respuesta con enlace a guía paso a paso y video tutorial
      - Día 4, 11pm: Confirmación de comprensión por parte del director y cierre del ticket

  - **Ticket 3** (creado por Docente, día 6):
    - Categoría: "funcionalidad_academica"
    - Prioridad: "alta"
    - Descripción: "Error al cargar archivo de calificaciones en formato CSV"
    - **Tiempo de resolución:** 8 horas
    - **Acciones del administrador:**
      - Día 6, 10am: Asignación inmediata del ticket (prioridad alta)
      - Día 6, 10:30am: Solicitud de archivo CSV problemático para diagnóstico
      - Día 6, 2pm: Identificación del error (columna faltante en CSV)
      - Día 6, 3pm: Envío de plantilla corregida y resolución del ticket
      - Día 6, 6pm: Confirmación de carga exitosa y cierre del ticket

  - **Ticket 4** (creado por Padre, día 10):
    - Categoría: "funcionalidad_academica"
    - Prioridad: "alta"
    - Descripción: "Las notificaciones de WhatsApp no están llegando"
    - **Tiempo de resolución:** 6 horas
    - **Acciones del administrador:**
      - Día 10, 2pm: Asignación inmediata (prioridad alta)
      - Día 10, 2:30pm: Solicitud de número de WhatsApp registrado para verificación
      - Día 10, 4pm: Diagnóstico (número de WhatsApp desactualizado en base de datos)
      - Día 10, 5pm: Actualización del número y reenvío de notificaciones pendientes
      - Día 10, 8pm: Confirmación de recepción de notificaciones y cierre del ticket

- **Distribución por categoría (según volumen esperado documentado):**
  - Acceso/autenticación (40%): 1-2 tickets → **1 ticket** (Ticket 1)
  - Funcionalidad académica (30%): 1-2 tickets → **2 tickets** (Ticket 2, Ticket 3, Ticket 4)
  - Errores sistema (20%): 0-1 tickets → **0 tickets** (no se presentaron)
  - Sugerencias (10%): 0-1 tickets → **0 tickets** (no se presentaron)

- **Tiempo promedio de resolución:** (18 + 12 + 8 + 6) / 4 = **11 horas**
- **Objetivo métrico:** ≤ 24 horas (se cumple ampliamente el objetivo)

#### **Monitoreo del Sistema**

- **Accesos al módulo de administración:** 12-15 accesos durante las 2 semanas
  - Revisión de logs de errores: 4-5 veces
  - Revisión de métricas de uso: 3-4 veces
  - Revisión de tickets pendientes: 5-6 veces

#### **Actualización de FAQ y Guías**

- **Actualizaciones realizadas:** 1 actualización
  - Día 5: Creación de nueva pregunta FAQ sobre "Cómo visualizar histórico de calificaciones de años anteriores" (basada en Ticket 1)

#### **Diversidad de Uso del Sistema**

- **Módulos consultados:** 3 módulos
  - Soporte (tickets): ✓
  - Administración (configuración): ✓
  - FAQ/Guías (gestión de contenido): ✓

---

## 5. DISTRIBUCIÓN TEMPORAL DE EVENTOS CLAVE

### 5.1 Cronograma Detallado de Actividades por Día

| **Día** | **Padre** | **Docente** | **Director** | **Administrador** | **Eventos Automáticos** |
|---------|-----------|-------------|--------------|-------------------|------------------------|
| **1** | - 2 logins<br>- Consulta calificaciones (3 cursos)<br>- Consulta asistencia (1 vez) | - 1 login<br>- Revisión inicial del sistema | - 1 login<br>- Publicación comunicado "Bienvenida Trimestre II" | - 1 login<br>- Monitoreo inicial | - Notificación de comunicado a todos los padres |
| **2** | - 1 login<br>- Lectura de comunicado del director (12h después)<br>- Consulta asistencia | - 1 login<br>- Publicación comunicado "Recordatorio tareas Matemática" | - No login | - No login | - Notificación de comunicado a padres de Matemática |
| **3** | - 2 logins<br>- Consulta calificaciones (2 cursos)<br>- **Creación Ticket 1** | - 1 login<br>- Carga de asistencia (genera 3 notificaciones) | - 1 login<br>- Supervisión de asistencia | - 1 login<br>- **Asignación Ticket 1**<br>- Respuesta inicial Ticket 1 | - 3 notificaciones de asistencia (1 tardanza, 2 faltas) |
| **4** | - 1 login<br>- **Visualización alerta tardanza** (1.5h después)<br>- Consulta asistencia (2 accesos en 24h) | - 1 login<br>- Revisión de calificaciones | - 1 login<br>- **Creación Ticket 2**<br>- Supervisión de comunicados | - 2 logins<br>- **Resolución Ticket 1** (18h total)<br>- **Asignación Ticket 2** | - Alerta crítica de tardanza al padre |
| **5** | - 2 logins<br>- Consulta calificaciones (4 cursos) | - 2 logins<br>- **Carga calificaciones preliminares T2-C1** (genera 5 notificaciones) | - 1 login<br>- Supervisión de calificaciones | - 1 login<br>- **Resolución Ticket 2** (12h total)<br>- Creación FAQ nueva | - 5 notificaciones de calificaciones bajas |
| **6** | - 1 login<br>- **Visualización alerta calificación baja** (4h después)<br>- Consulta calificaciones (2 accesos) | - 2 logins<br>- **Creación Ticket 3**<br>- Intento de carga CSV (error) | - No login | - 2 logins<br>- **Asignación Ticket 3** (inmediata)<br>- Diagnóstico y **resolución Ticket 3** (8h) | - Alerta crítica de calificación baja |
| **7** | - 2 logins<br>- Lectura comunicado urgente del director (3h después)<br>- Consulta asistencia | - 1 login<br>- Carga de asistencia (genera 4 notificaciones) | - 2 logins<br>- **Publicación comunicado urgente** "Suspensión de clases" | - 1 login<br>- Monitoreo de notificaciones WhatsApp | - Notificación urgente a todos los padres<br>- 4 notificaciones de asistencia |
| **8** | - 1 login<br>- **Visualización alerta falta injustificada** (2h después)<br>- Consulta asistencia (3 accesos) | - 1 login<br>- **Publicación comunicado** "Cambio de horario" | - No login | - No login | - Alerta crítica de falta injustificada<br>- Notificación de comunicado docente |
| **9** | - 2 logins<br>- Consulta calificaciones (3 cursos)<br>- Lectura comunicado docente (18h después) | - 1 login<br>- Revisión de asistencia | - 2 logins<br>- **Creación encuesta** "Satisfacción comunicación" | - 1 login<br>- Monitoreo general | - Notificación de encuesta a todos los padres |
| **10** | - 2 logins<br>- **Respuesta a encuesta del director** (18h después)<br>- **Creación Ticket 4**<br>- Consulta asistencia | - 1 login<br>- Carga de asistencia (genera 3 notificaciones) | - 1 login<br>- Revisión de respuestas de encuesta | - 2 logins<br>- **Asignación Ticket 4** (inmediata)<br>- **Resolución Ticket 4** (6h) | - 3 notificaciones de asistencia<br>- 1 alerta de tardanza |
| **11** | - 1 login<br>- **Visualización alerta tardanza** (3h después)<br>- Consulta asistencia (1 acceso) | - 2 logins<br>- **Creación encuesta** "Valoración curso Matemática" | - No login | - 1 login<br>- Monitoreo de tickets | - Alerta crítica de tardanza<br>- Notificación de encuesta a padres de Matemática |
| **12** | - 2 logins<br>- Consulta calificaciones (5 cursos)<br>- Respuesta a encuesta del docente (25h después) | - 2 logins<br>- Carga calificaciones preliminares T2-C2 (genera 6 notificaciones) | - 2 logins<br>- Publicación comunicado "Invitación Jornada Familiar"<br>- Supervisión de calificaciones | - 1 login<br>- Monitoreo general | - 6 notificaciones de calificaciones<br>- Notificación de comunicado evento |
| **13** | - 1 login<br>- Lectura comunicado evento del director (20h después)<br>- Consulta asistencia | - 2 logins<br>- Publicación comunicado "Avance programa curricular"<br>- Carga de asistencia (genera 2 notificaciones) | - 1 login<br>- Supervisión general | - 1 login<br>- Revisión de métricas finales | - 2 notificaciones de asistencia<br>- Notificación de comunicado académico |
| **14** | - 2 logins<br>- Consulta calificaciones (3 cursos)<br>- Consulta asistencia<br>- Revisión general del sistema | - 1 login<br>- Revisión final de registros | - 1 login<br>- Supervisión final<br>- Revisión de resultados de encuesta | - 1 login<br>- Monitoreo final<br>- Verificación de cierre de todos los tickets | - Sistema en operación normal |


--- 
login | - 1 login<br>- Monitoreo de tickets | - Alerta crítica de tardanza<br>- Notificación de encuesta a padres de Matemática |
| **12** | - 2 logins<br>- Consulta calificaciones (5 cursos)<br>- **Respuesta a encuesta del docente** (25h después) | - 2 logins<br>- **Carga calificaciones preliminares T2-C2** (genera 6 notificaciones) | - 2 logins<br>- **Publicación comunicado** "Invitación Jornada Familiar"<br>- Supervisión de calificaciones | - 1 login<br>- Monitoreo general | - 6 notificaciones de calificaciones<br>- Notificación de comunicado evento |
| **13** | - 1 login<br>- Lectura comunicado evento del director (20h después)<br>- Consulta asistencia | - 2 logins<br>- **Publicación comunicado** "Avance programa curricular"<br>- Carga de asistencia (genera 2 notificaciones) | - 1 login<br>- Supervisión general | - 1 login<br>- Revisión de métricas finales | - 2 notificaciones de asistencia<br>- Notificación de comunicado académico |
| **14** | - 2 logins<br>- Consulta calificaciones (3 cursos)<br>- Consulta asistencia<br>- Revisión general del sistema | - 1 login<br>- Revisión final de registros | - 1 login<br>- Supervisión final<br>- Revisión de resultados de encuesta | - 1 login<br>- Monitoreo final<br>- Verificación de cierre de todos los tickets | - Sistema en operación normal |

---

## 6. ESPECIFICACIONES TÉCNICAS PARA SCRIPTS DE SIMULACIÓN

### 6.1 Tabla: `auth_logs`

**Registros totales a generar:** Aproximadamente 60-68 registros de autenticación

**Distribución por usuario:**
- Padre: 18-20 logins
- Docente: 16-18 logins
- Director: 12-14 logins
- Administrador: 14-16 logins

**Campos a completar por cada registro:**
- `id`: UUID generado automáticamente
- `usuario_id`: UUID del usuario correspondiente (padre/docente/director/administrador)
- `evento`: Siempre "login" (no simular intentos fallidos para simplificar)
- `exito`: Siempre `true`
- `timestamp`: Fecha y hora según cronograma detallado (Sección 5.1)
- `ip_address`: IP simulada aleatoria pero realista (ej. 190.237.x.x para Perú)
- `user_agent`: User agent realista (ej. "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...")
- `session_id`: UUID único por login
- `año_academico`: 2025

**Reglas de generación:**
- Respetar distribución horaria especificada en Sección 1.2, 2.2, 3.2, 4.2
- Generar timestamps con minutos aleatorios dentro de la franja horaria (ej. "8am-10am" → generar entre 08:00 y 09:59)
- No generar logins en días sin actividad según cronograma
- Mantener coherencia temporal (no generar login del día 5 antes que login del día 3)

---

### 6.2 Tabla: `access_logs`

**Registros totales a generar:** Aproximadamente 180-220 registros de navegación

**Distribución por usuario y módulo:**

**Padre (aproximadamente 100 registros):**
- Módulo "calificaciones": 18-22 accesos
- Módulo "asistencia": 12-16 accesos
- Módulo "comunicados": 5 accesos
- Módulo "notificaciones": 12 accesos
- Módulo "encuestas": 2 accesos
- Módulo "soporte": 2 accesos
- Otros módulos (perfil, configuración): 10-15 accesos

**Docente (aproximadamente 50 registros):**
- Módulo "calificaciones": 10-12 accesos
- Módulo "asistencia": 12-15 accesos
- Módulo "comunicados": 8-10 accesos
- Módulo "encuestas": 3-5 accesos
- Módulo "soporte": 1 acceso
- Otros módulos: 10-12 accesos

**Director (aproximadamente 35 registros):**
- Módulo "calificaciones": 6-8 accesos
- Módulo "asistencia": 5-7 accesos
- Módulo "comunicados": 8-10 accesos
- Módulo "encuestas": 4-6 accesos
- Módulo "soporte": 1 acceso
- Otros módulos: 8-10 accesos

**Administrador (aproximadamente 20 registros):**
- Módulo "soporte" (tickets): 10-12 accesos
- Módulo "administración": 5-7 accesos
- Módulo "faq_guias": 2-3 accesos
- Otros módulos: 3-5 accesos

**Campos a completar por cada registro:**
- `id`: UUID generado automáticamente
- `usuario_id`: UUID del usuario correspondiente
- `session_id`: UUID de la sesión de login correspondiente
- `modulo`: Nombre del módulo según especificación ("calificaciones", "asistencia", "comunicados", etc.)
- `estudiante_id`: UUID del estudiante relacionado (solo para padre cuando consulta calificaciones/asistencia; NULL para otros casos)
- `curso_id`: UUID del curso relacionado (solo cuando se consulta información específica de un curso; NULL en caso contrario)
- `timestamp`: Fecha y hora dentro de la sesión correspondiente (después del login)
- `duracion_sesion`: Tiempo en segundos (aleatorio entre 10-300 segundos para accesos significativos)
- `url_visitada`: URL simulada del módulo (ej. "/calificaciones/estudiante/{id}/curso/{id}")
- `año_academico`: 2025

**Reglas de generación:**
- Cada acceso debe ocurrir dentro de una sesión válida (después del login correspondiente)
- Respetar la distribución de accesos por día según cronograma (Sección 5.1)
- Generar timestamps con intervalos realistas entre accesos (ej. 2-5 minutos entre consultas dentro de la misma sesión)
- Asignar `duracion_sesion` mayor a 10 segundos para accesos significativos (requerido por Métrica M13)
- Para el padre, asignar `estudiante_id` del hijo relacionado en accesos a calificaciones/asistencia
- Para el padre, distribuir accesos entre los 8 cursos del estudiante según cobertura especificada (Métrica M3: 7 de 8 cursos consultados)

---

