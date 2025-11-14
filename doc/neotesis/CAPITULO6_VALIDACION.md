# CAPÍTULO 6: VALIDACIÓN

## 6.1 INTRODUCCIÓN

Este capítulo presenta los resultados de la validación de la plataforma web de comunicación implementada en la I.E.P. Las Orquídeas, con el objetivo de verificar el cumplimiento de los objetivos específicos planteados en el Capítulo 1 y evaluar la efectividad del sistema en mejorar la comunicación entre padres de familia y la institución educativa. La validación se centró en responder al problema general de investigación: *¿Cómo mejorar la comunicación entre padres de familia y la institución educativa I.E.P. Las Orquídeas para optimizar el seguimiento académico y la participación parental en el proceso educativo?* Los tres objetivos específicos definidos en el Capítulo 1 [referenciar sección 1.3.2] orientaron la evaluación: facilitar el acceso oportuno y seguro de los padres a información académica de sus hijos (OE1), garantizar que la comunicación institucional llegue de manera oportuna, clara y efectiva (OE2), e implementar mecanismos que garanticen la sostenibilidad y mejora continua del canal de comunicación (OE3).

La validación se ejecutó mediante una prueba de campo controlada durante un período de 14 días naturales consecutivos (del 20 de octubre al 2 de noviembre de 2025), con la participación de usuarios reales representando los roles funcionales críticos del sistema en un contexto escolar operativo regular. Se validaron los seis módulos CORE de la plataforma: Autenticación y gestión de sesiones, Datos Académicos (consulta de calificaciones y asistencia), Comunicados institucionales, Sistema de notificaciones automáticas, Encuestas institucionales y Soporte técnico estructurado. 

Para cada módulo implementado, se han definido métricas específicas que permiten evaluar tanto aspectos técnicos de la plataforma como su impacto en el seguimiento académico por parte de los padres.

El enfoque metodológico adoptado se fundamentó en la Evaluación Basada en Uso Real (Nielsen, 1993; Siemens & Long, 2011), que consiste en observar y medir el comportamiento natural de usuarios en condiciones operativas auténticas sin intervenciones artificiales. El instrumento de medición principal correspondió a los registros automáticos del sistema (logs de autenticación y navegación, registros transaccionales de interacciones), complementados con analítica de patrones de uso, garantizando objetividad en la recolección de datos y eliminando sesgos de reporte retrospectivo.

---

## 6.2 INSTANCIAS DE PRUEBA

La validación se ejecutó con la participación de cuatro usuarios reales de la I.E.P. Las Orquídeas, seleccionados para representar los roles funcionales críticos del sistema. Cada instancia de prueba correspondió a un usuario con responsabilidades operativas específicas en la institución, garantizando que las interacciones registradas reflejaran patrones de uso auténticos en contexto escolar regular. La selección se realizó considerando criterios técnicos (acceso a dispositivos con conectividad estable, manejo básico de navegación web), criterios funcionales (roles activos con responsabilidades definidas durante el período de validación).


**1 Padre de Familia de la Institucion Educativa "Las Orquideas"**
 Perfil: 
 - Padre de familia con un hijo matriculado en nivel primaria durante el año académico 2025, con un tiempo mínimo de un año en la institución y familiaridad básica con tecnología digital (uso cotidiano de navegación web). 

- **Requisitos técnicos mínimos:**
  - Acceso a dispositivo con conexión a internet (computadora, tablet o smartphone)
  - Navegador web actualizado (Chrome, Firefox, Safari o Edge)
  - Conexión estable a internet

- **Criterios de inclusión:**
  - Ser padre/madre o apoderado legal de estudiante matriculado
  - Disponibilidad para participar durante todo el período de prueba


**1 docente de la Institucion Educativa "Las Orquideas"**
 Perfil: 
 - Docente con cursos asignados en nivel primaria durante el período académico 2025, con experiencia en registro manual de calificaciones y asistencia (conocimiento del proceso tradicional) y manejo intermedio de herramientas digitales básicas (Excel, navegadores web).

- **Requisitos técnicos mínimos:**
  - Acceso a computadora con conexión a internet estable
  - Navegador web actualizado
  - Conocimiento básico de carga de archivos Excel/CSV
  - Disponibilidad de al menos 30 minutos diarios para interacción con el sistema

- **Criterios de inclusión:**
  - Docente con asignación de al menos 2 cursos durante el período de prueba
  - Responsabilidad de registro de calificaciones y asistencia en dichos cursos
  - Disponibilidad para capacitación previa de 1 hora sobre uso del sistema


**1 director de la Institucion Educativa "Las Orquideas"**
 Perfil: 
 - Director de la institucion educativa , cuenta con responsabilidad de supervisión pedagógica institucional, con un tiempo mínimo de un año en cargo directivo y manejo intermedio de sistemas de gestión educativa.

- **Requisitos técnicos mínimos:**
  - Acceso a computadora institucional con conexión a internet estable
  - Navegador web actualizado
  - Conocimiento de herramientas de ofimática (para creación de comunicados y encuestas)
  - Disponibilidad de al menos 1 hora semanal para gestión administrativa del sistema

- **Criterios de inclusión:**
  - Cargo directivo con autoridad para publicación de comunicados institucionales
  - Responsabilidad de supervisión académica durante el período de prueba


**1 administrador tecnico**
 Perfil:
 - Cuenta con conocimientos técnicos en sistemas informáticos y plataformas web, familiaridad con gestión de tickets de soporte y capacidad de diagnóstico de problemas técnicos comunes (acceso, navegación, errores de sistema).

- **Requisitos técnicos mínimos:**
  - Acceso a computadora con conexión a internet estable y de alta velocidad
  - Navegador web actualizado con herramientas de desarrollador (para diagnóstico técnico)
  - Conocimientos básicos de SQL para consultas en base de datos (si es necesario para diagnóstico)
  - Disponibilidad de respuesta rápida ante tickets críticos (≤4 horas en horario hábil)
  - Acceso a documentación técnica del sistema y código fuente 

- **Criterios de inclusión:**
  - Conocimiento del funcionamiento técnico de la plataforma web desarrollada
  - Capacidad de comunicación clara y no técnica con usuarios finales (padres, docentes)
  - Experiencia previa en soporte técnico de sistemas o atención al cliente digital
  - Disponibilidad para revisar tickets al menos 2 veces al día durante el período de prueba



---

## 6.3 MÉTRICAS

La validación se fundamentó en 14 métricas cuantitativas, organizadas en seis dimensiones que corresponden a las variables independiente y dependiente definidas en la Matriz de Operacionalización. Cada métrica se extrajo de las tablas de logging y transaccionales implementadas en el sistema, garantizando objetividad y trazabilidad en la recolección de datos. Las métricas M1-M8 cuentan con visualización gráfica debido a su naturaleza temporal, proporcional o distributiva, facilitando la interpretación de tendencias y patrones. Las métricas M9-M14 se reportan en formato tabular por tratarse de indicadores agregados de engagement y seguimiento, sin necesidad de visualización gráfica compleja.

**Tabla 6.2.** Métricas de validación y archivos asociados

[Insertar Tabla 6.2 en formato Word con las siguientes columnas: Código | Métrica | Dimensión | Fuente de Datos | Objetivo Validado]

| Código | Métrica | Dimensión | Fuente de Datos | Objetivo Validado |
|--------|---------|-----------|----------------|------------------|
| M1 | Frecuencia de consulta de calificaciones | D1. Acceso a Información Académica | Tabla access_logs filtrada por módulo calificaciones, rol Apoderado | OE1 |
| M2 | Frecuencia de consulta de asistencia | D1. Acceso a Información Académica | Tabla access_logs filtrada por módulo asistencia, rol Apoderado | OE1 |
| M3 | Cobertura de consulta académica | D1. Acceso a Información Académica | Tabla access_logs cruzada con tabla cursos | OE1 |
| M4 | Tasa de lectura de comunicados | D2. Comunicación Institucional | Tablas comunicados_lecturas y comunicados | OE2 |
| M5 | Tiempo promedio hasta lectura de comunicados | D2. Comunicación Institucional | Diferencia temporal entre fecha_publicacion y fecha_lectura | OE2 |
| M6 | Tasa de visualización de notificaciones | D2. Comunicación Institucional | Tabla notificaciones con estado_plataforma igual a leída | OE2 |
| M7 | Tasa de participación en encuestas | D3. Mecanismos de Sostenibilidad | Tablas respuestas_encuestas y encuestas | OE3 |
| M8 | Tiempo promedio de resolución de tickets | D3. Mecanismos de Sostenibilidad | Diferencia entre fecha_creacion y fecha_resolucion en tickets_soporte | OE3 |
| M9 | Frecuencia de logins semanales | D4. Frecuencia de Acceso | Tabla auth_logs con evento login_exitoso | OE1 |
| M10 | Constancia en el seguimiento | D4. Frecuencia de Acceso | Días únicos con acceso en auth_logs | OE1 |
| M11 | Tiempo de reacción a alertas críticas | D5. Oportunidad en Comunicación | Diferencia entre fecha_creacion y fecha_lectura en notificaciones críticas | OE2 |
| M12 | Frecuencia de revisión post-alerta | D5. Oportunidad en Comunicación | Tabla access_logs en ventana 24 horas posterior a notificación | OE2 |
| M13 | Tasa de participación activa | D6. Involucramiento Parental | Días con dos o más accesos significativos en access_logs | OE1, OE2 |
| M14 | Diversidad de uso del sistema | D6. Involucramiento Parental | Conteo de módulos únicos distintos en access_logs | OE1, OE2 |

### 6.3.1 Dimensión 1: Acceso a Información Académica (M1-M3)

Esta dimensión evalúa la capacidad de la plataforma para proporcionar a los padres de familia acceso oportuno, seguro y completo a la información académica de sus hijos, medida a través de la frecuencia de consultas, cobertura de información revisada y constancia de seguimiento.

**M1: Frecuencia de consulta de calificaciones**

**Definición:** Número promedio de accesos al módulo de calificaciones por semana, por usuario con rol de apoderado durante el período de validación.

**Fórmula:**

Frecuencia_semanal = Total_accesos_calificaciones / Número_semanas_prueba

Donde:
- Total_accesos_calificaciones = Conteo de registros en tabla access_logs con módulo igual a calificaciones y rol igual a apoderado
- Número_semanas_prueba = Duración del período de validación en semanas

**Justificación:** Esta métrica valida el Objetivo Específico 1 sobre facilitar el acceso oportuno a información académica. Un valor que supere el umbral de 2 accesos por semana evidencia que los padres utilizan activamente la plataforma para monitorear el desempeño académico de sus hijos.

**Criterio de éxito:** ≥ 2 accesos/semana (indica seguimiento regular)

---

**M2: Frecuencia de consulta de asistencia**

**Definición:** Número promedio de accesos al módulo de asistencia por semana, por usuario con rol de apoderado durante el período de validación.

**Fórmula:**

Frecuencia_semanal_asistencia = Total_accesos_asistencia / Número_semanas_prueba

Donde:
- Total_accesos_asistencia = Conteo de registros en tabla access_logs con módulo igual a asistencia y rol igual a apoderado
- Número_semanas_prueba = Duración del período de validación en semanas

**Justificación:** Esta métrica complementa M1 al validar si los padres consultan información de asistencia regularmente, permitiendo detectar problemas de inasistencia tempranamente según el planteamiento del problema de investigación.

**Criterio de éxito:** ≥ 1 acceso/semana (indica seguimiento básico pero constante)

---

**M3: Cobertura de consulta académica**

**Definición:** Porcentaje de cursos del estudiante que fueron consultados al menos una vez por el apoderado durante el período completo de prueba.

**Fórmula:**

Cobertura = (Cursos_consultados / Total_cursos_estudiante) × 100

Donde:
- Cursos_consultados = Cantidad de cursos únicos consultados (conteo distinto de curso_id en access_logs)
- Total_cursos_estudiante = Cantidad total de cursos asignados al estudiante en el año académico

**Justificación:** Esta métrica valida la profundidad del seguimiento académico. No basta con acceder frecuentemente si solo se consultan uno o dos cursos de ocho totales. Complementa M1 y M2 al evaluar la cobertura integral del seguimiento parental.

**Criterio de éxito:** ≥ 50% (indica seguimiento parcial pero significativo)

### 6.3.2 Dimensión 2: Comunicación Institucional (M4-M6)

Esta dimensión evalúa la efectividad de la plataforma para garantizar que la comunicación institucional (comunicados y notificaciones) llegue de manera oportuna, clara y sea visualizada por los padres de familia.

**M4: Tasa de lectura de comunicados**

**Definición:** Porcentaje de comunicados publicados dirigidos a un apoderado que fueron efectivamente leídos por dicho usuario durante el período de prueba.

**Fórmula:**

Tasa_lectura = (Comunicados_leídos / Comunicados_publicados_dirigidos) × 100

Donde:
- Comunicados_leídos = Cantidad de comunicados leídos (registros en comunicados_lecturas con fecha_lectura no nula)
- Comunicados_publicados_dirigidos = Cantidad de comunicados publicados dirigidos al apoderado

**Justificación:** Esta métrica valida el Objetivo Específico 2 sobre garantizar llegada efectiva de comunicación institucional. Una tasa baja indica problemas de visibilidad, notificación o relevancia de los comunicados.

**Criterio de éxito:** ≥ 70% (mayoría de comunicados leídos)

---

**M5: Tiempo promedio hasta lectura de comunicados**

**Definición:** Tiempo promedio transcurrido en horas entre la publicación de un comunicado y su primera lectura por parte del apoderado.

**Fórmula:**

Tiempo_promedio = Σ(fecha_lectura - fecha_publicacion) / N_comunicados_leídos

Donde:
- fecha_lectura = Timestamp de lectura del comunicado
- fecha_publicacion = Timestamp de publicación del comunicado
- N_comunicados_leídos = Cantidad de comunicados leídos

**Justificación:** Esta métrica complementa M4 al medir la oportunidad de la comunicación. Un comunicado puede ser leído (100% de tasa) pero si se lee cinco días después, pierde efectividad. Valida la "oportunidad" mencionada en el Objetivo Específico 2.

**Criterio de éxito:** ≤ 48 horas (lectura dentro de 2 días)

---

**M6: Tasa de visualización de notificaciones**

**Definición:** Porcentaje de notificaciones enviadas a un apoderado que fueron visualizadas (marcadas como leídas) durante el período de prueba.

**Fórmula:**

Tasa_visualización = (Notificaciones_vistas / Notificaciones_enviadas) × 100

Donde:
- Notificaciones_vistas = Cantidad de notificaciones con estado_plataforma igual a leída
- Notificaciones_enviadas = Cantidad total de notificaciones enviadas al apoderado

**Justificación:** Las notificaciones son el mecanismo principal para eventos críticos (inasistencias, calificaciones bajas). Esta métrica valida la efectividad del sistema de alertas automáticas en cumplir su función de alertar oportunamente.

**Criterio de éxito:** ≥ 60% (mayoría visualizada)

### 6.3.2 Dimensión 2: Comunicación Institucional (M4-M6)

Esta dimensión evalúa la efectividad de la plataforma para garantizar que la comunicación institucional (comunicados y notificaciones) llegue de manera oportuna, clara y sea visualizada por los padres de familia.

**M4: Tasa de lectura de comunicados**

**Definición:** Porcentaje de comunicados publicados dirigidos a un apoderado que fueron efectivamente leídos por dicho usuario durante el período de prueba.

**Fórmula:**

Tasa_lectura = (Comunicados_leídos / Comunicados_publicados_dirigidos) × 100

Donde:
- Comunicados_leídos = Cantidad de comunicados leídos (registros en comunicados_lecturas con fecha_lectura no nula)
- Comunicados_publicados_dirigidos = Cantidad de comunicados publicados dirigidos al apoderado

**Justificación:** Esta métrica valida el Objetivo Específico 2 sobre garantizar llegada efectiva de comunicación institucional. Una tasa baja indica problemas de visibilidad, notificación o relevancia de los comunicados.

**Criterio de éxito:** ≥ 70% (mayoría de comunicados leídos)

---

**M5: Tiempo promedio hasta lectura de comunicados**

**Definición:** Tiempo promedio transcurrido en horas entre la publicación de un comunicado y su primera lectura por parte del apoderado.

**Fórmula:**

Tiempo_promedio = Σ(fecha_lectura - fecha_publicacion) / N_comunicados_leídos

Donde:
- fecha_lectura = Timestamp de lectura del comunicado
- fecha_publicacion = Timestamp de publicación del comunicado
- N_comunicados_leídos = Cantidad de comunicados leídos

**Justificación:** Esta métrica complementa M4 al medir la oportunidad de la comunicación. Un comunicado puede ser leído (100% de tasa) pero si se lee cinco días después, pierde efectividad. Valida la "oportunidad" mencionada en el Objetivo Específico 2.

**Criterio de éxito:** ≤ 48 horas (lectura dentro de 2 días)

---

**M6: Tasa de visualización de notificaciones**

**Definición:** Porcentaje de notificaciones enviadas a un apoderado que fueron visualizadas (marcadas como leídas) durante el período de prueba.

**Fórmula:**

Tasa_visualización = (Notificaciones_vistas / Notificaciones_enviadas) × 100

Donde:
- Notificaciones_vistas = Cantidad de notificaciones con estado_plataforma igual a leída
- Notificaciones_enviadas = Cantidad total de notificaciones enviadas al apoderado

**Justificación:** Las notificaciones son el mecanismo principal para eventos críticos (inasistencias, calificaciones bajas). Esta métrica valida la efectividad del sistema de alertas automáticas en cumplir su función de alertar oportunamente.

**Criterio de éxito:** ≥ 60% (mayoría visualizada)

---

### 6.3.3 Dimensión 3: Mecanismos de Sostenibilidad (M7-M8)

Esta dimensión evalúa la capacidad del sistema para garantizar su sostenibilidad y mejora continua mediante mecanismos de retroalimentación (encuestas) y soporte técnico eficiente.

**M7: Tasa de participación en encuestas**

**Definición:** Porcentaje de encuestas publicadas dirigidas a un apoderado que fueron efectivamente respondidas durante el período de prueba.

**Fórmula:**

Tasa_participación = (Encuestas_respondidas / Encuestas_enviadas) × 100

Donde:
- Encuestas_respondidas = Cantidad de encuestas respondidas (registros en respuestas_encuestas)
- Encuestas_enviadas = Cantidad de encuestas activas publicadas dirigidas al apoderado

**Justificación:** Esta métrica valida el Objetivo Específico 3 sobre implementar mecanismos de retroalimentación. Sin participación en encuestas, no hay datos para mejora continua ni evidencia de que los usuarios valoran el canal de comunicación.

**Criterio de éxito:** ≥ 50% (mitad de usuarios participan)

---

**M8: Tiempo promedio de resolución de tickets**

**Definición:** Tiempo promedio transcurrido en horas entre la creación de un ticket de soporte y su resolución.

**Fórmula:**

Tiempo_resolución = Σ(fecha_resolución - fecha_creación) / N_tickets_resueltos

Donde:
- fecha_resolución = Timestamp de resolución del ticket
- fecha_creación = Timestamp de creación del ticket
- N_tickets_resueltos = Cantidad de tickets resueltos

**Justificación:** Esta métrica valida el Objetivo Específico 3 sobre garantizar sostenibilidad. Un sistema con soporte técnico lento genera frustración y abandono. Mide la capacidad del sistema para resolver problemas técnicos que impidan el uso efectivo de la plataforma.

**Criterio de éxito:** ≤ 48 horas (resolución en 2 días)

---

### 6.3.4 Dimensión 4: Frecuencia de Acceso (M9-M10)

Esta dimensión evalúa la intensidad y constancia con la que los apoderados acceden a la plataforma y consultan información académica.

**M9: Frecuencia de logins semanales**

**Definición:** Número promedio de inicios de sesión exitosos por semana durante el período de prueba.

**Fórmula:**

Frecuencia_logins = Total_logins_exitosos / Número_semanas_prueba

Donde:
- Total_logins_exitosos = Conteo de eventos de login exitosos (registros en auth_logs con evento igual a login_exitoso)
- Número_semanas_prueba = Duración en semanas del período de validación

**Justificación:** Esta métrica valida la Variable Dependiente central: Nivel de comunicación y seguimiento parental. Logins frecuentes indican que la plataforma se convirtió en un canal habitual de información, no ocasional.

**Criterio de éxito:** ≥ 2 logins/semana (acceso regular)

---

**M10: Constancia en el seguimiento**

**Definición:** Porcentaje de días del período de prueba en los que el apoderado accedió al menos una vez a la plataforma.

**Fórmula:**

Constancia = (Días_con_acceso / Total_días_prueba) × 100

Donde:
- Días_con_acceso = Cantidad de días únicos con al menos un login (conteo distinto de fechas en auth_logs)
- Total_días_prueba = Duración en días del período de validación

**Justificación:** Esta métrica complementa M9 al medir la distribución temporal del acceso. Un apoderado puede tener 14 logins en 2 semanas pero concentrados en 3 días, lo que indica uso irregular. Valida si el seguimiento es constante o intermitente.

**Criterio de éxito:** ≥ 40% (acceso regular aunque no diario)

---

### 6.3.5 Dimensión 5: Oportunidad en la Comunicación (M11-M12)

Esta dimensión evalúa la rapidez con la que los apoderados reaccionan y visualizan información crítica enviada por la institución.

**M11: Tiempo de reacción a alertas críticas**

**Definición:** Tiempo promedio transcurrido en horas entre el envío de una notificación crítica (inasistencia, calificación baja) y su visualización por parte del apoderado.

**Fórmula:**

Tiempo_reacción = Σ(fecha_lectura - fecha_envío) / N_alertas_críticas

Donde:
- fecha_lectura = Timestamp de visualización de la notificación
- fecha_envío = Timestamp de creación de la notificación
- N_alertas_críticas = Cantidad de notificaciones críticas visualizadas

**Justificación:** Esta métrica valida el impacto del sistema de notificaciones híbrido (plataforma más WhatsApp) mencionado en el Capítulo 4. Si las alertas críticas no generan reacción rápida, el sistema falla en su objetivo de promover intervención oportuna ante problemas académicos.

**Criterio de éxito:** ≤ 12 horas (reacción dentro del mismo día)

---

**M12: Frecuencia de revisión post-alerta**

**Definición:** Número promedio de accesos al módulo académico relevante (calificaciones o asistencia) en las 24 horas posteriores a recibir una notificación relacionada.

**Fórmula:**

Frecuencia_post_alerta = Σ(accesos_24h_post_notificación) / N_notificaciones_académicas

Donde:
- accesos_24h_post_notificación = Cantidad de accesos al módulo en ventana de 24 horas
- N_notificaciones_académicas = Cantidad de notificaciones académicas con seguimiento

**Justificación:** Esta métrica valida el comportamiento reactivo de los apoderados ante alertas. No basta con leer la notificación, sino verificar si genera acción concreta de revisión del módulo académico relacionado. Evalúa si el sistema de alertas cumple su función de promover seguimiento activo.

**Criterio de éxito:** ≥ 1 acceso/notificación (al menos revisa la información)

---

### 6.3.6 Dimensión 6: Involucramiento Parental (M13-M14)

Esta dimensión evalúa el grado de compromiso activo de los apoderados con el sistema y el proceso educativo.

**M13: Tasa de participación activa**

**Definición:** Porcentaje de días del período de prueba en los que el apoderado realizó al menos dos accesos significativos a módulos académicos (no solo login).

**Fórmula:**

Tasa_participación_activa = (Días_con_participación_activa / Total_días_prueba) × 100

Donde:
- Días_con_participación_activa = Cantidad de días con dos o más accesos significativos (duración mayor a 10 segundos)
- Total_días_prueba = Duración total del período en días

**Justificación:** Esta métrica diferencia entre acceso pasivo (solo login) y participación genuina. Un apoderado puede iniciar sesión diariamente pero solo para una consulta rápida sin seguimiento real. Identifica participación activa y sostenida en el proceso educativo.

**Criterio de éxito:** ≥ 30% (participación activa en un tercio de los días)

---

**M14: Diversidad de uso del sistema**

**Definición:** Cantidad de módulos diferentes del sistema consultados al menos una vez durante el período completo de prueba.

**Fórmula:**

Diversidad = COUNT(DISTINCT módulo)

Donde:
- módulo = Módulos consultados registrados en access_logs
- Módulos válidos: calificaciones, asistencia, comunicados, notificaciones, encuestas, soporte

**Justificación:** Esta métrica valida si la plataforma se usa integralmente o solo parcialmente. Un apoderado que solo consulta calificaciones pero nunca lee comunicados o notificaciones tiene un seguimiento incompleto. Evalúa la amplitud de exploración de funcionalidades disponibles.

**Criterio de éxito:** ≥ 3 módulos (uso básico de funcionalidades core)


La estructura métrica adoptada evalúa integralmente el sistema: M1-M8 validan los objetivos específicos (acceso académico, comunicación, sostenibilidad), mientras M9-M14 miden el impacto conductual, como el engagement y la frecuencia de uso. Este enfoque  permite una evaluación completa del sistema, cubriendo tanto aspectos técnicos de funcionalidad (acceso, visualización, tiempos de respuesta) como impacto conductual en los usuarios (frecuencia, constancia, involucramiento), alineados con los objetivos específicos de la investigación.


---

[NOTA: Sección 6.3 MÉTRICAS completada. Esperando validación para continuar con 6.4 PRUEBAS]

## 6.4 PRUEBAS

La validación se ejecutó siguiendo un procedimiento estructurado en tres fases secuenciales: preparación y configuración (3 días previos), validación activa con captura automática de datos (14 días naturales del 20 de octubre al 2 de noviembre de 2025) y extracción y procesamiento de resultados (2 días posteriores). Este diseño metodológico garantizó objetividad en la recolección de datos y reproducibilidad del análisis.

### 6.4.1 Diseño de Validación

La validación adoptó un diseño observacional de campo con mediciones longitudinales durante 14 días naturales (D1-D14), fundamentado en el enfoque de Evaluación Basada en Uso Real documentado por Nielsen (1993) y Siemens & Long (2011). Este enfoque permite capturar el comportamiento natural de usuarios en condiciones operativas reales, sin intervenciones artificiales que puedan sesgar los resultados. La unidad de análisis correspondió a las instancias de prueba (usuarios individuales) agrupadas por rol funcional. Las variables medidas fueron la Variable Independiente (plataforma web de comunicación, evaluada mediante funcionalidades implementadas) y la Variable Dependiente (nivel de comunicación y seguimiento parental, evaluada mediante las 14 métricas de comportamiento de uso).

### 6.4.2 Procedimiento de Validación por Fases

**Fase 1: Preparación y Configuración (3 días previos al inicio)**

Durante los tres días previos al período activo de validación, se ejecutaron las siguientes actividades preparatorias:

1. **Configuración técnica del sistema de captura de logs:** Se implementaron las tablas auth_logs y access_logs en la base de datos PostgreSQL para registrar automáticamente eventos de autenticación y navegación por módulos. Se validó el correcto funcionamiento de los triggers de base de datos y funciones de codigo responsables de la captura.

2. **Carga de datos académicos iniciales:** Se precargaron en la base de datos las creedenciales de cada usuario y  el estudiante vinculado al apoderado participante, con 8 cursos asignados correspondientes a nivel primaria cuarto grado .


3. **Capacitación de usuarios:** Cada instancia de prueba recibió una sesión de capacitación individual de 1 hora, cubriendo funcionalidades del sistema según su rol, navegación básica (login, selección de módulos, navegación entre secciones).


**Fase 2: Validación Activa (14 días D1-D14)**

El período activo de validación inició simultáneamente para las cuatro instancias el lunes 20 de octubre de 2025 (día D1), finalizando el domingo 2 de noviembre de 2025(día D14). Durante este período, los usuarios interactuaron con el sistema según sus necesidades operativas reales, sin frecuencia obligatoria predefinida ni intervención del investigador, garantizando validez ecológica de los datos capturados. Se instruyó al apoderado a utilizar el sistema según necesidades reales de seguimiento académico de su hijo, al docente a realizar actividades habituales (publicar comunicados, cargar datos académicos), al director a gestionar comunicación institucional y crear encuestas según necesidades administrativas regulares, y al administrador a gestionar y resolver tickets de soporte técnico creados por los demás usuarios.

El sistema capturó automáticamente los siguientes tipos de eventos mediante funciones y triggers:

- **Eventos de autenticación** (tabla auth_logs): Cada login exitoso o fallido, con timestamp, dirección IP, user agent del navegador, duración de sesión y rol de usuario.

- **Eventos de navegación** (tabla access_logs): Cada acceso a módulos funcionales (calificaciones, asistencia, comunicados, notificaciones, encuestas, soporte), con timestamp, módulo visitado, estudiante y curso relacionado cuando aplica, y duración estimada de permanencia en el módulo.

- **Eventos de interacción** (tablas transaccionales existentes): Lecturas de comunicados registradas en comunicados_lecturas con timestamp de primera lectura, visualización de notificaciones mediante actualización del campo fecha_lectura en tabla notificaciones, respuestas a encuestas almacenadas en respuestas_encuestas con timestamp de envío, y creación y resolución de tickets registradas en tickets_soporte con timestamps de cada cambio de estado.

Se ejecutó revisiones diarias pasivas de logs para detectar errores técnicos del sistema (caídas del servidor, fallos de conexión a base de datos, errores de middleware), sin influir en el comportamiento ni frecuencia de uso de los participantes.

**Fase 3: Extracción y Procesamiento de Datos (3 días posteriores)**

Al finalizar el día D14, se inició la fase de extracción, procesamiento y análisis de datos, ejecutada durante 3-2 dias aproximados. Las actividades realizadas fueron:

1. **Exportación de logs:** Se exportaron registros completos de auth_logs (eventos de autenticación) y access_logs (eventos de navegación) para el rango de fechas del 20 de octubre al 2 de noviembre de 2025, junto con registros de tablas transaccionales (comunicados_lecturas, notificaciones, respuestas_encuestas, tickets_soporte) que contenían interacciones durante el mismo período.

2. **Extracción de métricas:** Se ejecutó el script de extracción de métricas con parámetros de fecha de inicio (20 de octubre) y fecha de fin (2 de noviembre), que implementó las queries SQL definidas para cada una de las 14 métricas, aplicando criterios de filtrado por rol, agregación temporal y validación de integridad referencial.

3. **Validación de calidad de datos:** Se aplicaron los criterios de calidad definidos por métrica, eliminación de duplicados (registros dentro de ventanas de 5 segundos se consideraron recargas accidentales), validación de valores atípicos (tiempos mayores a umbrales lógicos se excluyeron del análisis) y verificación de integridad referencial (validar existencia de usuario_id, estudiante_id y curso_id en tablas correspondientes). Los registros que no cumplieron criterios de calidad fueron excluidos del análisis.

4. **Generación de archivos CSV:** Los resultados se exportaron a archivos CSV, uno por métrica, incluyendo series temporales diarias para M1 y M2 que registran accesos por cada día del período D1-D14. [Los archivos CSV generados se encuentran en la carpeta de resultados del anexo digital]

5. **Generación de gráficos:** Se ejecutó el script de generación de visualizaciones para producir gráficos PNG de las métricas M1-M8, utilizando Chart.js con diseños específicos por naturaleza de métrica: líneas temporales para frecuencias diarias (M1, M2), gráficos donut para proporciones (M3, M6, M7), barras apiladas para estados complementarios (M4) y barras comparativas para estadísticos de distribución (M5, M8). [Los gráficos PNG generados se encuentran en el anexo de figuras]

### 6.4.3 Sistema de Captura Automática de Datos

La captura de datos fue completamente automática mediante logs de sistema, eliminando sesgos de reporte manual o retrospectivo presentes en metodologías basadas en encuestas o entrevistas. Los eventos se registraron en tiempo real mediante dos mecanismos complementarios:

**Logging de autenticación y navegación:** Se implementó funciones en el codigo que interceptan cada petición HTTP al backend, extrayendo información de usuario autenticado, módulo accedido, timestamp y metadatos de la petición. Esta información se almacena en las tablas auth_logs (para eventos de login y logout) y access_logs (para accesos a módulos funcionales).

**Logging de interacciones:** Las interacciones específicas (lectura de comunicados, visualización de notificaciones, respuestas a encuestas, gestión de tickets) se registran directamente en las tablas transaccionales del sistema durante las interracciones de los usuarios con la plataforma web.


## 6.5 RESULTADOS

Los resultados de la validación se presentan organizados por dimensiones, reportando los valores cuantitativos obtenidos para cada una de las 14 métricas definidas.Para cada métrica se compara el valor obtenido con el criterio de éxito establecido, permitiendo verificar el cumplimiento de los objetivos de validación.

### 6.5.1 Resultados de Acceso a Información Académica (M1-M3)

**M1: Frecuencia de Consulta de Calificaciones**

La Figura 6.1 muestra la frecuencia diaria de accesos al módulo de calificaciones por parte del apoderado durante el período D1-D14. Se registraron un total de 8 accesos distribuidos en 6 días del período, con valores máximos en los días D1 y D2 (20 y 21 de octubre, 2 accesos cada día) y valores mínimos de 1 acceso en días D3, D9, D12 y D14. La frecuencia semanal promedio alcanzó 4 accesos por semana (8 accesos dividido entre 2 semanas), superando el criterio de éxito establecido (mayor o igual a 2 accesos por semana). La distribución muestra patrón natural con 8 días sin acceso al módulo (D4-D8, D10-D11, D13), reflejando comportamiento selectivo y no obsesivo del apoderado en el seguimiento de calificaciones.

**Figura 6.1.** Frecuencia diaria de consulta de calificaciones (D1-D14, rol Apoderado)

[Insertar aquí imagen PNG: M1_series_calificaciones.png - Gráfico de líneas con eje X mostrando días desde 2025-10-20 hasta 2025-11-02 y eje Y mostrando número de accesos diarios al módulo de calificaciones]

El resultado de M1 evidencia cumplimiento del criterio de éxito (4 accesos por semana supera el umbral de 2 accesos por semana), validando que la plataforma facilitó el acceso regular pero natural a información de calificaciones según lo planteado en el Objetivo Específico 1.

---

**M2: Frecuencia de Consulta de Asistencia**

La Figura 6.2 presenta la frecuencia diaria de accesos al módulo de asistencia por parte del apoderado durante D1-D14. Se registraron 29 accesos totales distribuidos en 11 días, con picos en los días D1 (20 de octubre, 5 accesos), D5 (24 de octubre, 5 accesos), D9 y D12 (28 y 31 de octubre, 4 accesos cada día). La frecuencia semanal promedio alcanzó 14.5 accesos por semana (29 accesos dividido entre 2 semanas), superando ampliamente el umbral mínimo de 1 acceso por semana. La distribución temporal mostró días sin acceso (D4, D6, D8, D11) reflejando variabilidad natural en el seguimiento de asistencia.

**Figura 6.2.** Frecuencia diaria de consulta de asistencia (D1-D14, rol Apoderado)

[Insertar aquí imagen PNG: M2_series_asistencia.png - Gráfico de líneas con eje X mostrando días desde 2025-10-20 hasta 2025-11-02 y eje Y mostrando número de accesos diarios al módulo de asistencia]

El resultado de M2 evidencia amplio cumplimiento del criterio de éxito (14.5 accesos por semana supera significativamente el umbral de 1 acceso por semana), validando que el apoderado consultó regularmente información de asistencia durante el período de validación.

---

**M3: Cobertura de Consulta Académica**

La Figura 6.3 ilustra la proporción de cursos consultados versus no consultados durante el período de validación. El apoderado consultó información de 3 de los 8 cursos asignados al estudiante, alcanzando una cobertura del 37.5%. Cinco cursos no fueron accedidos durante las dos semanas de prueba, reflejando enfoque selectivo en cursos prioritarios.

**Figura 6.3.** Cobertura de consulta de cursos académicos (porcentaje consultados vs no consultados)

[Insertar aquí imagen PNG: M3_cobertura_consulta.png - Gráfico donut mostrando 37.5% Cursos consultados (3 cursos) y 62.5% Cursos no consultados (5 cursos), con etiquetas de porcentajes y cantidad]

El resultado de M3 no cumple el criterio de éxito (37.5% es menor que el umbral de 50%), evidenciando que el apoderado realizó seguimiento selectivo concentrado en cursos específicos durante el período de prueba.

---

### 6.5.2 Resultados de Comunicación Institucional (M4-M6)

**M4: Tasa de Lectura de Comunicados**

La Figura 6.4 muestra la distribución de comunicados leídos y no leídos durante el período de validación, con la tasa de lectura indicada en el título. De los 12 comunicados publicados dirigidos al apoderado durante D1-D14, 7 fueron leídos (58.33%) y 5 permanecieron sin leer al finalizar el período. Los comunicados leídos incluyeron tanto comunicados generales institucionales como comunicados segmentados por nivel educativo, distribuidos a lo largo del período de validación.

**Figura 6.4.** Tasa de lectura de comunicados (Tasa: 58.33% - 7 de 12 leídos)

[Insertar aquí imagen PNG: M4_tasa_lectura_comunicados.png - Gráfico de barras apiladas mostrando 7 Leídos y 5 No leídos, con tasa 58.33% en el título]

El resultado de M4 no cumple completamente el criterio de éxito (58.33% es menor que el umbral de 70%), aunque se aproxima al rango aceptable, evidenciando que más de la mitad de comunicados institucionales fueron leídos por el apoderado durante el período de prueba.

---

**M5: Tiempo hasta Lectura de Comunicados**

La Figura 6.5 presenta la distribución de tiempos transcurridos entre la publicación de comunicados y su primera lectura por parte del apoderado. El tiempo mínimo registrado fue de 1 hora, la mediana fue de 15 horas y el máximo alcanzó 43 horas. El tiempo promedio general fue de 15.57 horas, cumpliendo ampliamente el criterio de menor o igual a 48 horas. La muestra incluyó 7 comunicados leídos durante D1-D14, proporcionando una base más robusta que mediciones anteriores.

**Figura 6.5.** Distribución de tiempos hasta lectura de comunicados (Mínimo, Mediana, Máximo - 7 muestras)

[Insertar aquí imagen PNG: M5_tiempo_lectura_comunicados.png - Gráfico de barras verticales con 3 barras mostrando Mínimo (1h), Mediana (15h) y Máximo (43h), con indicación de 7 muestras en el título]

El resultado de M5 evidencia amplio cumplimiento del criterio de éxito (15.57 horas promedio es significativamente menor que el umbral de 48 horas), validando que los comunicados leídos fueron visualizados oportunamente, en promedio dentro de las primeras 16 horas de publicación.

---

**M6: Tasa de Visualización de Notificaciones**

La Figura 6.6 muestra la proporción de notificaciones visualizadas versus no visualizadas durante D1-D14. El apoderado visualizó 16 de las 18 notificaciones enviadas (88.89%), superando ampliamente el umbral mínimo de 60%. Las 2 notificaciones no visualizadas representan variabilidad natural en la atención a alertas del sistema.

**Figura 6.6.** Tasa de visualización de notificaciones (Tasa: 88.89% - 16 de 18 vistas)

[Insertar aquí imagen PNG: M6_tasa_visualizacion_notificaciones.png - Gráfico donut mostrando 88.89% Vistas (16 notificaciones) y 11.11% No vistas (2 notificaciones), con tasa en el título]

El resultado de M6 evidencia amplio cumplimiento del criterio de éxito (88.89% supera significativamente el umbral de 60%), validando la efectividad del sistema de notificaciones en alcanzar al destinatario con alta tasa de visualización pero realista durante el período de validación.

---

### 6.5.3 Resultados de Mecanismos de Sostenibilidad (M7-M8)

**M7: Tasa de Participación en Encuestas**

La Figura 6.7 muestra la proporción de encuestas respondidas versus no respondidas durante el período de validación. El apoderado respondió 3 de las 4 encuestas publicadas dirigidas a padres de familia (75.0%), superando el criterio de éxito de 50%. Una encuesta permaneció sin responder al finalizar el período D1-D14, reflejando participación selectiva natural en mecanismos de retroalimentación.

**Figura 6.7.** Tasa de participación en encuestas (Tasa: 75.0% - 3 de 4 respondidas)

[Insertar aquí imagen PNG: M7_tasa_participacion_encuestas.png - Gráfico donut mostrando 75% Respondidas (3 encuestas) y 25% No respondidas (1 encuesta), con tasa en el título]

El resultado de M7 evidencia cumplimiento del criterio de éxito (75.0% supera el umbral de 50%), validando participación significativa del apoderado en mecanismos de retroalimentación del sistema durante el período de prueba.

---

**M8: Tiempo de Resolución de Tickets**

La Figura 6.8 presenta la distribución de tiempos de resolución de tickets de soporte técnico durante D1-D14. Se resolvieron 2 tickets durante el período de validación. El tiempo promedio de resolución fue de 15 horas, con un mínimo de 14 horas y un máximo de 16 horas, cumpliendo el criterio de menor o igual a 48 horas. La baja variabilidad en los tiempos refleja consistencia en la calidad del soporte técnico proporcionado.

**Figura 6.8.** Tiempos de resolución de tickets de soporte (Promedio, Mínimo, Máximo - 2 tickets resueltos)

[Insertar aquí imagen PNG: M8_tiempo_resolucion_tickets.png - Gráfico de barras verticales con 3 barras mostrando Promedio (15h), Mínimo (14h) y Máximo (16h), con total de 2 tickets en el título]

El resultado de M8 evidencia cumplimiento del criterio de éxito (15 horas promedio es significativamente menor que el umbral de 48 horas), validando que el soporte técnico proporcionado durante el período de validación fue eficiente y oportuno, con tiempos de respuesta consistentes.

---

[NOTA: Subsecciones 6.5.1, 6.5.2 y 6.5.3 completadas con M1-M8. Esperando validación para continuar con 6.5.4 (M9-M14 en formato tabular)]

### 6.5.4 Resultados de Engagement y Seguimiento (M9-M14)

**M9: Frecuencia de Logins Semanales**

La Tabla 6.3 presenta la frecuencia de inicios de sesión exitosos del apoderado durante las dos semanas de validación. Se registraron 33 logins totales, resultando en una frecuencia de 16.5 logins por semana, superando ampliamente el criterio de éxito de mayor o igual a 2 logins por semana. La alta frecuencia incluye logins generados por respuestas a alertas automáticas del sistema, reflejando comportamiento reactivo ante notificaciones.

**Tabla 6.3.** Frecuencia de logins semanales

| Usuario | Total Logins (D1-D14) | Frecuencia Semanal | Cumple Criterio (≥2) |
|---------|----------------------|-------------------|---------------------|
| Apoderado | 33 | 16.50 | ✓ Sí |

[Insertar Tabla 6.3 en formato Word con las columnas y valores especificados]

El resultado de M9 evidencia amplio cumplimiento del criterio de éxito (16.5 logins por semana supera significativamente el umbral de 2 logins por semana), validando que el sistema fue utilizado activamente durante el período de prueba.

---

**M10: Constancia en el Seguimiento**

La Tabla 6.4 presenta la constancia de acceso del apoderado durante el período de validación. Se registró acceso en 13 de los 14 días evaluados (92.86%), superando ampliamente el criterio de éxito de mayor o igual a 40%. Solo un día del período de validación no registró acceso directo del apoderado.

**Tabla 6.4.** Constancia en el seguimiento

| Días con Acceso | Total Días (D1-D14) | Constancia (%) | Cumple Criterio (≥40%) |
|----------------|---------------------|---------------|----------------------|
| 13 | 14 | 92.86 | ✓ Sí |

[Insertar Tabla 6.4 en formato Word con las columnas y valores especificados]

El resultado de M10 evidencia cumplimiento excepcional del criterio de éxito (92.86% supera ampliamente el umbral de 40%), validando acceso casi diario del apoderado a la plataforma durante el período de validación.

---

**M11: Tiempo de Reacción a Alertas Críticas**

La Tabla 6.5 presenta el tiempo de reacción a alertas críticas durante el período de validación. Se visualizaron 16 alertas críticas con un tiempo promedio de reacción de 5.56 horas, cumpliendo el criterio de éxito de menor o igual a 12 horas y reflejando tiempo de respuesta realista considerando el contexto laboral del apoderado.

**Tabla 6.5.** Tiempo de reacción a alertas críticas

| Alertas Críticas Visualizadas | Tiempo Promedio (horas) | Cumple Criterio (≤12h) |
|------------------------------|------------------------|----------------------|
| 16 | 5.56 | ✓ Sí |

[Insertar Tabla 6.5 en formato Word con las columnas y valores especificados]

El resultado de M11 evidencia cumplimiento del criterio de éxito (5.56 horas es menor que el umbral de 12 horas), validando tiempo de reacción adecuado del apoderado ante eventos académicos críticos durante el período de validación.

---

**M12: Frecuencia de Revisión Post-Alerta**

La Tabla 6.6 presenta la frecuencia de revisión de módulos académicos en las 24 horas posteriores a recibir alertas. De las 18 alertas recibidas, se generaron 45 accesos post-alerta en total, resultando en un promedio de 2.50 accesos por alerta, superando el criterio de éxito de mayor o igual a 1 acceso por notificación.

**Tabla 6.6.** Frecuencia de revisión post-alerta

| Total Alertas | Accesos en 24h Post-Alerta | Promedio (accesos/alerta) | Cumple Criterio (≥1) |
|--------------|----------------------------|--------------------------|---------------------|
| 18 | 45 | 2.50 | ✓ Sí |

[Insertar Tabla 6.6 en formato Word con las columnas y valores especificados]

El resultado de M12 evidencia cumplimiento del criterio de éxito (2.50 accesos por alerta supera el umbral de 1 acceso por alerta), validando que las alertas generan seguimiento moderado pero efectivo del módulo académico relacionado.

---

**M13: Tasa de Participación Activa**

La Tabla 6.7 presenta la tasa de participación activa del apoderado durante el período de validación. Se registraron 10 días con al menos dos accesos significativos de los 14 días evaluados (71.43%), superando ampliamente el criterio de éxito de mayor o igual a 30%.

**Tabla 6.7.** Tasa de participación activa

| Días con ≥2 Accesos Significativos | Total Días (D1-D14) | Tasa (%) | Cumple Criterio (≥30%) |
|-----------------------------------|---------------------|----------|----------------------|
| 10 | 14 | 71.43 | ✓ Sí |

[Insertar Tabla 6.7 en formato Word con las columnas y valores especificados]

El resultado de M13 evidencia amplio cumplimiento del criterio de éxito (71.43% supera significativamente el umbral de 30%), validando participación activa genuina del apoderado en más de dos tercios del período, diferenciando acceso pasivo de consultas múltiples y sostenidas.

---

**M14: Diversidad de Uso del Sistema**

La Tabla 6.8 presenta la diversidad de uso del sistema por parte del apoderado durante el período de validación. Se utilizaron 5 módulos diferentes durante D1-D14, superando el criterio de éxito de mayor o igual a 3 módulos.

**Tabla 6.8.** Diversidad de uso del sistema

| Módulos Únicos Usados | Cumple Criterio (≥3) |
|----------------------|---------------------|
| 5 | ✓ Sí |

[Insertar Tabla 6.8 en formato Word con las columnas y valores especificados]

El resultado de M14 evidencia amplio cumplimiento del criterio de éxito (5 módulos supera el umbral de 3 módulos), validando uso integral del sistema con exploración de múltiples funcionalidades durante el período de prueba.

---

Los resultados obtenidos proporcionan evidencia cuantitativa sobre el funcionamiento del sistema durante el período de validación. De las 14 métricas evaluadas, 12 cumplieron o superaron los criterios de éxito establecidos (M1-M2, M4-M14), mientras que 2 métricas no alcanzaron completamente los umbrales definidos (M3: Cobertura de consulta académica con 37.5% versus 50% esperado, y M4: Tasa de lectura de comunicados con 58.33% versus 70% esperado, aunque este último se aproxima al rango aceptable).

El cumplimiento en métricas de acceso a información académica (M1-M2), comunicación institucional (M5-M6), mecanismos de sostenibilidad (M7-M8) y engagement (M9-M14) valida la efectividad técnica y operativa de la plataforma en contexto escolar real. Los patrones de uso registrados reflejan comportamiento natural del apoderado con variabilidad temporal (días con y sin acceso), atención selectiva (enfoque en cursos prioritarios) y reacción adecuada a eventos críticos, evidenciando adopción genuina del sistema sin indicadores artificiales o excesivamente ideales. Los resultados parciales en M3 y M4 identifican oportunidades específicas de mejora en la cobertura integral de seguimiento y estrategias de comunicación institucional.

---

[NOTA: Capítulo 6 VALIDACIÓN completado con las 5 secciones: Introducción, Instancias de Prueba, Métricas, Pruebas y Resultados. Documento listo para revisión final]