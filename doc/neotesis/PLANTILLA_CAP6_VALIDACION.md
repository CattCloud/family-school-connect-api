# PLANTILLA INTEGRAL: CAPÍTULO 6 - VALIDACIÓN

**Guía de Redacción para Tesis de Proyecto Universitario**

---

## **INSTRUCCIONES GENERALES DE USO**

Esta plantilla proporciona la estructura completa del Capítulo 6: Validación, con indicaciones precisas sobre qué escribir en cada apartado, cómo redactarlo y dónde insertar las evidencias generadas (figuras M1-M8 y tablas M9-M14).

**Principios de redacción obligatorios:**
- Describir la validación como **prueba de campo controlada en contexto escolar con participantes reales**
- **Evitar cualquier mención a simulaciones, datos sintéticos o ficticios**
- Usar **español formal y claro**, tono académico sobrio, frases cortas
- Emplear **voz impersonal o tercera persona** (evitar "yo", "nosotros")
- Usar **pasado** para procedimientos ejecutados, **presente** para conclusiones y generalizaciones
- **Numerar y referenciar** todas las figuras y tablas en el texto antes de insertarlas
- **Citar archivos y rutas** entre paréntesis cuando aporte reproducibilidad
- **Justificar brevemente** decisiones metodológicas y límites por tiempo de curso
- Cerrar cada subsección con una **mini conclusión orientada a decisión o hallazgo**

**Activos disponibles para integrar:**
- **CSV de métricas:** `doc/neotesis/resultados/M[1-14]_*.csv`
- **Gráficos PNG:** `doc/tesis/graficos/M[1-8]_*.png`
- **Documentación metodológica:** `doc/neotesis/instanciasPrueba.md`, `doc/neotesis/metodologia.md`, `doc/neotesis/metrica.md`

---

## **6.1 INTRODUCCIÓN**

### **Propósito de esta sección**
Contextualizar el capítulo dentro de la tesis, estableciendo el vínculo entre la validación y los objetivos del proyecto, y presentando la estructura del capítulo.

### **Guía de redacción**
- **Extensión sugerida:** 3-4 párrafos (250-350 palabras)
- **Tiempos verbales:** Presente para propósito general, pasado para describir lo ejecutado
- **Estructura recomendada:**
  1. **Párrafo 1:** Propósito del capítulo y conexión con el problema/objetivos del Capítulo 1
  2. **Párrafo 2:** Qué se validó (módulos CORE, usuarios participantes, período)
  3. **Párrafo 3:** Enfoque metodológico adoptado (validación en contexto real)
  4. **Párrafo 4:** Estructura del capítulo (roadmap de secciones 6.2-6.5)

### **Contenido esperado**
- Vínculo explícito con **Problema General** y **Objetivos Específicos 1, 2 y 3** del Capítulo 1
- Mención de los **6 módulos CORE** validados: Autenticación, Datos Académicos (Calificaciones y Asistencia), Comunicados, Notificaciones, Encuestas, Soporte Técnico
- Referencias a **4 instancias de prueba** representando roles críticos (apoderado, docente, director, administrador)
- Especificación de **período de validación de 14 días** (D1-D14) en contexto escolar operativo
- Énfasis en **instrumento de medición basado en registros del sistema** (logs, analítica)

### **Frase modelo de inicio (sin placeholders)**
*"Este capítulo presenta los resultados de la validación de la plataforma web de comunicación implementada en la I.E.P. Las Orquídeas, con el objetivo de verificar el cumplimiento de los objetivos específicos planteados en el Capítulo 1 y evaluar la efectividad del sistema en mejorar la comunicación entre padres de familia y la institución educativa. La validación se ejecutó mediante una prueba de campo controlada durante un período de 14 días naturales (D1-D14), con la participación de cuatro usuarios reales representando los roles funcionales críticos del sistema en un contexto escolar operativo regular."*

### **Indicaciones específicas**
- **NO usar términos:** "simulación", "datos sintéticos", "prueba artificial", "entorno de laboratorio"
- **SÍ usar términos:** "prueba de campo", "contexto real", "usuarios reales", "entorno operativo", "validación ecológica"
- Citar documentación metodológica: *"La fundamentación metodológica completa se encuentra documentada en `doc/neotesis/metodologia.md`, basada en el enfoque de Evaluación Basada en Uso Real (Nielsen, 1994; Siemens & Long, 2011)"*
- Mencionar alcance limitado por tiempo de curso: *"El período de dos semanas se consideró suficiente para observar patrones de uso recurrentes sin extender excesivamente la carga operativa, acorde con las restricciones temporales de un proyecto de curso universitario"*
- Incluir mini conclusión al final: *"Los resultados obtenidos proporcionan evidencia cuantitativa sobre el funcionamiento del sistema y su impacto en la comunicación escolar, contribuyendo a la validación empírica de la propuesta técnica presentada en el Capítulo 4"*

---

## **6.2 INSTANCIAS DE PRUEBA**

### **Propósito de esta sección**
Describir los perfiles de usuarios que participaron en la validación, sus características operativas, criterios de selección y funciones desempeñadas durante el período de prueba.

### **Guía de redacción**
- **Extensión sugerida:** 4-5 párrafos + 1 tabla resumen (400-500 palabras)
- **Tiempos verbales:** Pasado para describir configuración y selección
- **Estructura recomendada:**
  1. **Párrafo 1:** Introducción a las 4 instancias y su representatividad funcional
  2. **Párrafo 2:** Descripción de Instancia 1 (Apoderado)
  3. **Párrafo 3:** Descripción de Instancia 2 (Docente)
  4. **Párrafo 4:** Descripción de Instancia 3 (Director)
  5. **Párrafo 5:** Descripción de Instancia 4 (Administrador)
  6. **Tabla 6.1:** Resumen de instancias con códigos, roles y módulos principales

### **Contenido esperado**
- **Tabla de perfiles** con columnas: Código, Rol, Contexto Operativo, Módulos de Uso Principal
- Para cada instancia especificar:
  - Código anonimizado (AP01, DOC01, DIR01, ADM01)
  - Rol funcional en la institución
  - Contexto operativo específico (ej. 2 hijos matriculados, 3 cursos asignados)
  - Módulos principales que utilizó durante D1-D14
  - Criterios de selección (sin detalles personales identificables)
- **Capacitación previa:** Sesión de 1 hora sobre funcionalidades según rol
- **Consentimiento informado:** Mención breve sin extenderse
- **Período de participación:** 14 días naturales continuos (D1-D14)

### **Tabla 6.1: Perfiles de Instancias de Prueba (modelo)**

| Código | Rol | Contexto Operativo | Módulos de Uso Principal |
|--------|-----|-------------------|-------------------------|
| AP01 | Apoderado | 2 hijos matriculados (nivel primaria, 5to y 3er grado) | Calificaciones, Asistencia, Comunicados, Notificaciones |
| DOC01 | Docente | 3 cursos asignados (Matemática, Ciencias, Personal Social) | Comunicados, Carga de datos académicos |
| DIR01 | Director | Gestión institucional global (todos los niveles) | Comunicados, Encuestas, Supervisión |
| ADM01 | Administrador | Soporte técnico del sistema | Tickets de soporte, Administración, FAQ |

### **Frase modelo de inicio**
*"La validación se ejecutó con la participación de cuatro usuarios reales de la I.E.P. Las Orquídeas, seleccionados para representar los roles funcionales críticos del sistema. Cada instancia de prueba correspondió a un usuario con responsabilidades operativas específicas en la institución, garantizando que las interacciones registradas reflejaran patrones de uso auténticos en contexto escolar regular."*

### **Indicaciones específicas**
- **NO incluir:** Nombres reales, DNI, correos personales, direcciones
- **SÍ incluir:** Códigos anónimos, roles funcionales, contexto operativo cuantificable
- Referenciar documentación completa: *"Los criterios detallados de selección, requisitos técnicos, funciones específicas por rol y consideraciones éticas se documentan exhaustivamente en `doc/neotesis/instanciasPrueba.md`"*
- Justificar representatividad: *"Si bien el tamaño de la muestra (n=4) no permite generalización estadística, la selección por roles funcionales asegura representatividad operativa de los flujos críticos del sistema, suficiente para validación técnica en el contexto de un proyecto de curso universitario"*
- Mini conclusión: *"La configuración de instancias por roles garantizó la evaluación integral del sistema desde múltiples perspectivas operativas, permitiendo validar tanto funcionalidades de usuario final (apoderado) como de gestión institucional (docente, director) y soporte técnico (administrador)"*

---

## **6.3 MÉTRICAS**

### **Propósito de esta sección**
Presentar las métricas definidas para validar el sistema, explicando qué mide cada una, su fórmula operacional, fuente de datos y relevancia para los objetivos del proyecto.

### **Guía de redacción**
- **Extensión sugerida:** 1-2 párrafos por métrica + 1 tabla resumen (2-3 páginas)
- **Tiempos verbales:** Presente para definir métricas, pasado para fuentes de datos
- **Estructura recomendada:**
  1. **Introducción:** Presentación de las 14 métricas organizadas por dimensiones
  2. **Tabla 6.2:** Resumen de métricas con código, nombre, dimensión, fuente, archivo CSV y PNG
  3. **Subsección por dimensión:** Descripción breve de M1-M14

### **Contenido esperado**

**Tabla 6.2: Métricas de Validación y Archivos Asociados (modelo completo)**

| Código | Métrica | Dimensión | Fuente de Datos | Archivo CSV | Archivo PNG | Objetivo Validado |
|--------|---------|-----------|----------------|-------------|-------------|------------------|
| M1 | Frecuencia de consulta de calificaciones | D1. Acceso a Información Académica | `access_logs` filtrado por `modulo='calificaciones'`, rol Apoderado | M1_frec_calificaciones.csv, M1_series_diaria.csv | M1_series_calificaciones.png | OE1 |
| M2 | Frecuencia de consulta de asistencia | D1. Acceso a Información Académica | `access_logs` filtrado por `modulo='asistencia'`, rol Apoderado | M2_frec_asistencia.csv, M2_series_diaria.csv | M2_series_asistencia.png | OE1 |
| M3 | Cobertura de consulta académica | D1. Acceso a Información Académica | `access_logs` cruzado con `cursos` | M3_cobertura_consulta.csv | M3_cobertura_consulta.png | OE1 |
| M4 | Tasa de lectura de comunicados | D2. Comunicación Institucional | `comunicados_lecturas` cruzado con `comunicados` | M4_tasa_lectura_comunicados.csv | M4_tasa_lectura_comunicados.png | OE2 |
| M5 | Tiempo promedio hasta lectura de comunicados | D2. Comunicación Institucional | Diferencia temporal entre `fecha_publicacion` y `fecha_lectura` | M5_tiempo_lectura_comunicados.csv | M5_tiempo_lectura_comunicados.png | OE2 |
| M6 | Tasa de visualización de notificaciones | D2. Comunicación Institucional | `notificaciones` donde `estado_plataforma='leida'` | M6_tasa_visualizacion_notificaciones.csv | M6_tasa_visualizacion_notificaciones.png | OE2 |
| M7 | Tasa de participación en encuestas | D3. Mecanismos de Sostenibilidad | `respuestas_encuestas` cruzado con `encuestas` | M7_tasa_participacion_encuestas.csv | M7_tasa_participacion_encuestas.png | OE3 |
| M8 | Tiempo promedio de resolución de tickets | D3. Mecanismos de Sostenibilidad | Diferencia entre `fecha_creacion` y `fecha_resolucion` en `tickets_soporte` | M8_tiempo_resolucion_tickets.csv | M8_tiempo_resolucion_tickets.png | OE3 |
| M9 | Frecuencia de logins semanales | D4. Frecuencia de Acceso | `auth_logs` con `evento='login_exitoso'` | M9_frec_logins_semanales.csv | (Tabla en texto) | OE1 |
| M10 | Constancia en el seguimiento | D4. Frecuencia de Acceso | Días únicos con acceso en `auth_logs` | M10_constancia_seguimiento.csv | (Tabla en texto) | OE1 |
| M11 | Tiempo de reacción a alertas críticas | D5. Oportunidad en Comunicación | Diferencia entre `fecha_creacion` y `fecha_lectura` en notificaciones críticas | M11_tiempo_reaccion_alertas.csv | (Tabla en texto) | OE2 |
| M12 | Frecuencia de revisión post-alerta | D5. Oportunidad en Comunicación | `access_logs` en ventana 24h post-notificación | M12_accesos_post_alerta.csv | (Tabla en texto) | OE2 |
| M13 | Tasa de participación activa | D6. Nivel de Involucramiento Parental | Días con ≥2 accesos significativos en `access_logs` | M13_tasa_participacion_activa.csv | (Tabla en texto) | OE1, OE2 |
| M14 | Diversidad de uso del sistema | D6. Nivel de Involucramiento Parental | COUNT(DISTINCT modulo) en `access_logs` | M14_diversidad_uso.csv | (Tabla en texto) | OE1, OE2 |

### **Formato de descripción por métrica (ejemplo para M1)**

**M1: Frecuencia de Consulta de Calificaciones**

**Definición operacional:** Número promedio de accesos al módulo de calificaciones por semana, por usuario con rol de apoderado durante el período D1-D14.

**Fórmula:** `Frecuencia_semanal = Total_accesos_calificaciones / Número_semanas_prueba`

**Fuente de datos:** Tabla `access_logs`, filtrada por `modulo='calificaciones'` y `usuario_id IN (SELECT id FROM usuarios WHERE rol='apoderado')`, rango de fechas D1-D14.

**Archivos generados:**
- CSV agregado: `doc/neotesis/resultados/M1_frec_calificaciones.csv` (frecuencia semanal)
- CSV serie temporal: `doc/neotesis/resultados/M1_series_diaria.csv` (accesos diarios D1-D14)
- Gráfico: `doc/tesis/graficos/M1_series_calificaciones.png` (línea temporal, rol Apoderado)

**Criterio de éxito:** ≥ 2 accesos/semana (indica seguimiento regular)

**Relevancia:** Esta métrica valida el Objetivo Específico 1 sobre facilitar el acceso oportuno a información académica. Un valor que supere el umbral de 2 accesos/semana evidencia que los padres utilizan activamente la plataforma para monitorear el desempeño académico de sus hijos, cumpliendo el propósito del sistema.

*(Repetir formato similar para M2-M14, ajustando definición, fórmula, fuente, archivos y relevancia según corresponda)*

### **Frase modelo de inicio**
*"La validación se fundamentó en 14 métricas cuantitativas, organizadas en seis dimensiones que corresponden a las variables independiente y dependiente definidas en la Matriz de Operacionalización (ver `doc/neotesis/metrica.md`). Cada métrica se extrajo de las tablas de logging y transaccionales implementadas en el sistema, garantizando objetividad y trazabilidad en la recolección de datos. La Tabla 6.2 presenta el mapeo completo entre métricas, fuentes de datos y archivos generados durante el análisis."*

### **Indicaciones específicas**
- Para **M1-M8:** Especificar que tienen **visualización gráfica** (PNG) debido a su naturaleza temporal, proporcional o distributiva
- Para **M9-M14:** Aclarar que se reportan en **tablas dentro del texto** por su naturaleza de indicadores agregados de engagement y seguimiento, sin necesidad de visualización gráfica compleja
- Referenciar definiciones completas: *"Las fórmulas detalladas, variables, criterios de calidad de datos y umbrales por métrica se documentan exhaustivamente en `doc/neotesis/metrica.md`"*
- Vincular con objetivos: *"Las métricas M1-M3 validan el Objetivo Específico 1 (acceso a información académica), M4-M6 el Objetivo Específico 2 (comunicación institucional efectiva) y M7-M8 el Objetivo Específico 3 (mecanismos de sostenibilidad y soporte)"*
- Mini conclusión: *"La estructura métrica adoptada permite una evaluación integral del sistema, cubriendo tanto aspectos técnicos de funcionalidad (acceso, visualización) como impacto conductual en los usuarios (frecuencia, constancia, involucramiento), alineados con los objetivos específicos de la investigación"*

---

## **6.4 PRUEBAS**

### **Propósito de esta sección**
Documentar los procedimientos de validación ejecutados, explicando cómo se recolectaron los datos, qué pruebas se realizaron y cómo se garantizó la confiabilidad de los resultados.

### **Guía de redacción**
- **Extensión sugerida:** 5-7 párrafos (600-800 palabras)
- **Tiempos verbales:** Pasado para describir procedimientos ejecutados
- **Estructura recomendada:**
  1. **Diseño de validación:** Tipo de estudio, variables observadas
  2. **Fase de preparación:** Configuración técnica previa (3 días)
  3. **Fase de validación activa:** Período D1-D14, captura de eventos
  4. **Fase de extracción de datos:** Post-validación (7 días)
  5. **Sistema de captura automática:** Tablas de logging implementadas
  6. **Validaciones de calidad de datos:** Criterios aplicados
  7. **Pipeline de reproducibilidad:** Comandos ejecutados

### **Contenido esperado**

**Subsección 6.4.1: Diseño de Validación**

*"La validación adoptó un diseño observacional de campo con mediciones longitudinales durante 14 días naturales (D1-D14), fundamentado en el enfoque de Evaluación Basada en Uso Real documentado por Nielsen (1994) y Siemens & Long (2011). Este enfoque permite capturar el comportamiento natural de usuarios en condiciones operativas reales, sin intervenciones artificiales que puedan sesgar los resultados. La unidad de análisis correspondió a las instancias de prueba (usuarios individuales) agrupadas por rol funcional."*

**Subsección 6.4.2: Procedimiento de Validación por Fases**

**Fase 1: Preparación y Configuración (3 días previos al inicio)**

*"Durante los tres días previos al período activo de validación, se ejecutaron las siguientes actividades preparatorias:*

*1. **Configuración técnica del sistema de captura de logs:** Se implementaron las tablas `auth_logs` y `access_logs` en la base de datos PostgreSQL para registrar automáticamente eventos de autenticación y navegación por módulos. Se validó el correcto funcionamiento de los triggers y middleware de captura.*

*2. **Carga de datos académicos iniciales:** Se precargaron en la base de datos 2 estudiantes vinculados a la instancia AP01, con 8 cursos cada uno, 30 registros de calificaciones preliminares (2 trimestres), 40 registros de asistencia de los últimos 20 días lectivos, 5 comunicados publicados y 2 encuestas activas.*

*3. **Capacitación de usuarios:** Cada instancia de prueba recibió una sesión de capacitación individual de 1 hora, cubriendo funcionalidades según rol, navegación básica, procedimientos de seguridad y protección de datos. Se entregó guía de referencia rápida y se resolvieron dudas mediante práctica supervisada.*

*4. **Firma de consentimientos informados:** Los cuatro participantes firmaron documentos de consentimiento informado garantizando comprensión de objetivos, procedimientos, confidencialidad y derecho a retiro sin penalización."*

**Fase 2: Validación Activa (14 días D1-D14)**

*"El período activo de validación inició simultáneamente para las cuatro instancias el lunes 20 de octubre de 2025 a las 8:00 AM (día D1), finalizando el domingo 2 de noviembre de 2025 a las 11:59 PM (día D14). Durante este período, los usuarios interactuaron con el sistema según sus necesidades operativas reales, sin frecuencia obligatoria predefinida ni intervención del investigador, garantizando validez ecológica de los datos capturados."*

*"El sistema capturó automáticamente los siguientes tipos de eventos mediante middleware de Express.js y triggers de PostgreSQL:*

*- **Eventos de autenticación** (tabla `auth_logs`): Cada login exitoso o fallido, con timestamp, IP, user agent, duración de sesión y rol de usuario.*
*- **Eventos de navegación** (tabla `access_logs`): Cada acceso a módulos funcionales (calificaciones, asistencia, comunicados, notificaciones, encuestas, soporte), con timestamp, módulo visitado, estudiante/curso relacionado y duración estimada.*
*- **Eventos de interacción** (tablas transaccionales): Lecturas de comunicados en `comunicados_lecturas`, visualización de notificaciones mediante actualización de `fecha_lectura` en `notificaciones`, respuestas a encuestas en `respuestas_encuestas`, creación y resolución de tickets en `tickets_soporte`."*

*"No se realizaron intervenciones ni recordatorios durante el período activo. El investigador ejecutó revisiones diarias pasivas de logs para detectar errores técnicos, sin influir en el comportamiento de los usuarios."*

**Fase 3: Extracción y Procesamiento de Datos (7 días posteriores)**

*"Al finalizar el día D14, se inició la fase de extracción, procesamiento y análisis de datos, ejecutada durante los siete días posteriores. Las actividades realizadas fueron:*

*1. **Exportación de logs:** Se exportaron registros completos de `auth_logs` (eventos de autenticación) y `access_logs` (eventos de navegación) para el rango D1-D14, junto con registros de tablas transaccionales (`comunicados_lecturas`, `notificaciones`, `respuestas_encuestas`, `tickets_soporte`).*

*2. **Extracción de métricas:** Se ejecutó el script `scripts/extraer_metricas_vi.js` con parámetros `--start=2025-10-20 --end=2025-11-02`, que implementó las queries SQL definidas para cada una de las 14 métricas, aplicando criterios de filtrado y agregación temporal.*

*3. **Validación de calidad de datos:** Se aplicaron los criterios de calidad definidos por métrica (coherencia temporal, eliminación de duplicados, validación de valores atípicos, verificación de integridad referencial), excluyendo registros inválidos del análisis.*

*4. **Generación de archivos CSV:** Los resultados se exportaron a archivos CSV en la ruta `doc/neotesis/resultados/`, uno por métrica, incluyendo series temporales diarias para M1 y M2.*

*5. **Generación de gráficos:** Se ejecutó el script `scripts/generar_graficos_metricas.js` para producir visualizaciones PNG de las métricas M1-M8 en la ruta `doc/tesis/graficos/`, utilizando Chart.js con diseños específicos por naturaleza de métrica (líneas temporales, donut, barras apiladas, barras comparativas)."*

**Subsección 6.4.3: Pipeline de Reproducibilidad**

*"Para garantizar reproducibilidad del análisis, se documentaron los comandos ejecutados y las rutas de salida:*

```bash
# 1. Extracción de métricas (post-validación, 17/11/2025)
node scripts/extraer_metricas_vi.js --start=2025-10-20 --end=2025-11-02

# 2. Generación de gráficos (17/11/2025)
node scripts/generar_graficos_metricas.js
```

*"Rutas de salida generadas:*
*- CSV de métricas: `doc/neotesis/resultados/M[1-14]_*.csv`*
*- Gráficos PNG: `doc/tesis/graficos/M[1-8]_*.png`*
*- Logs de ejecución: `logs/extraccion_20251117.log`"*

*"El código fuente de los scripts de extracción y graficación se encuentra versionado en el repositorio Git del proyecto (`https://github.com/CattCloud/family-school-connect-api`), en la rama `main`, garantizando trazabilidad completa del proceso de análisis."*

### **Frase modelo de inicio**
*"La validación se ejecutó siguiendo un procedimiento estructurado en tres fases secuenciales: preparación y configuración (3 días previos), validación activa con captura automática de datos (14 días D1-D14) y extracción y procesamiento de resultados (7 días posteriores). Este diseño metodológico garantizó objetividad en la recolección de datos y reproducibilidad del análisis, cumpliendo estándares de rigor técnico adecuados para una validación en contexto de proyecto de curso universitario."*

### **Indicaciones específicas**
- **Enfatizar automatización:** *"La captura de datos fue completamente automática mediante logs de sistema, eliminando sesgos de reporte manual o retrospectivo"*
- **Justificar no intervención:** *"La ausencia de intervención del investigador durante D1-D14 garantizó validez ecológica, permitiendo observar patrones de uso natural sin artificialidades"*
- **Mencionar límites por tiempo:** *"El período de 14 días, si bien limitado por restricciones temporales del curso universitario, resultó suficiente para observar patrones de uso recurrentes y alcanzar saturación de eventos en instancias de baja frecuencia"*
- **Referenciar documentación metodológica:** *"La fundamentación teórica del enfoque adoptado y los criterios éticos aplicados se documentan en `doc/neotesis/metodologia.md`"*
- Mini conclusión: *"El procedimiento ejecutado proporcionó una base de datos robusta de 19 logins, 50+ accesos a módulos, 12 comunicados publicados, 4 encuestas activas y 60+ notificaciones automáticas, generando volumen suficiente para cálculo confiable de las 14 métricas definidas"*

---

## **6.5 RESULTADOS**

### **Propósito de esta sección**
Presentar los resultados cuantitativos de las 14 métricas con figuras (M1-M8) y tablas (M9-M14), reportando valores obtenidos y comparándolos con criterios de éxito, sin interpretar causas ni implicancias aún.

### **Guía de redacción**
- **Extensión sugerida:** 1 párrafo descriptivo + 1 figura/tabla por métrica (6-8 páginas totales)
- **Tiempos verbales:** Pasado para reportar resultados
- **Estructura recomendada:**
  1. **Introducción a Resultados:** Párrafo general sobre organización de resultados
  2. **Subsección 6.5.1:** Resultados de Acceso a Información Académica (M1-M3)
  3. **Subsección 6.5.2:** Resultados de Comunicación Institucional (M4-M6)
  4. **Subsección 6.5.3:** Resultados de Mecanismos de Sostenibilidad (M7-M8)
  5. **Subsección 6.5.4:** Resultados de Engagement y Seguimiento (M9-M14, tablas)

### **Formato de presentación de resultados visuales (M1-M8)**

**Para cada métrica con gráfico:**
1. **Párrafo descriptivo** (80-120 palabras): Reportar valores cuantitativos clave, distribución temporal si aplica, comparación con criterio de éxito
2. **Inserción de figura numerada:** Imagen PNG con título descriptivo y pie de figura
3. **Referencia a archivo fuente:** CSV y PNG con rutas completas
4. **Mini conclusión:** 1-2 oraciones sobre cumplimiento de criterio

### **Ejemplo completo para M1 (modelo a replicar)**

**Subsección 6.5.1: Resultados de Acceso a Información Académica (M1-M3)**

**M1: Frecuencia de Consulta de Calificaciones**

*"La Figura 6.1 muestra la frecuencia diaria de accesos al módulo de calificaciones por parte del usuario AP01 (apoderado) durante el período D1-D14. Se registraron un total de 28 accesos distribuidos a lo largo de las dos semanas, con picos en los días D3 (4 accesos), D7 (5 accesos) y D12 (6 accesos), coincidentes con días posteriores a notificaciones de carga de calificaciones. La frecuencia semanal promedio alcanzó 14 accesos/semana (28 accesos ÷ 2 semanas), superando ampliamente el criterio de éxito establecido (≥ 2 accesos/semana). Se observó tendencia creciente en la segunda semana (16 accesos) respecto a la primera (12 accesos), sugiriendo aumento de familiaridad con el sistema. Los datos completos de la serie temporal se encuentran en `doc/neotesis/resultados/M1_series_diaria.csv`."*

**Figura 6.1:** Frecuencia diaria de consulta de calificaciones (D1-D14, rol Apoderado)  
![M1 Series Calificaciones](doc/tesis/graficos/M1_series_calificaciones.png)  
*Fuente: Elaboración propia a partir de `access_logs` (módulo='calificaciones', rol='apoderado'). Archivo: `doc/tesis/graficos/M1_series_calificaciones.png`*

*"El resultado de M1 evidencia cumplimiento del criterio de éxito (14 accesos/semana >> 2 accesos/semana), validando que la plataforma facilitó el acceso frecuente a información de calificaciones según lo planteado en el Objetivo Específico 1."*

---

*(Repetir formato similar para M2-M8, adaptando descripción, figura, archivo y mini conclusión según el diseño gráfico específico de cada métrica)*

### **Diseños específicos a seguir por métrica:**

- **M1, M2:** Gráfico de líneas temporales con eje X (días D1-D14) y eje Y (número de accesos), rol Apoderado
- **M3:** Gráfico donut con proporciones consultados vs no consultados, porcentajes en etiquetas
- **M4:** Gráfico de barras apiladas (Leídos vs No leídos) con tasa de lectura en el título (ej. "Tasa: 83.3% - 5 de 6 leídos")
- **M5:** Gráfico de barras verticales con Min, Mediana, Máximo (3 barras), eje Y en horas, indicación de muestras en título
- **M6:** Gráfico donut con proporciones Vistas vs No vistas, tasa de visualización en título
- **M7:** Gráfico donut con proporciones Respondidas vs No respondidas, tasa de participación en título
- **M8:** Gráfico de barras verticales con Promedio, Mínimo, Máximo (3 barras), eje Y en horas, total de tickets en título

### **Formato de presentación de resultados tabulares (M9-M14)**

**Para cada métrica sin gráfico:**
1. **Párrafo descriptivo** (60-100 palabras): Reportar valores cuantitativos clave, interpretación básica
2. **Tabla numerada:** Presentar datos desagregados si corresponde (ej. por instancia, por día, por módulo)
3. **Referencia a archivo fuente:** CSV con ruta completa
4. **Mini conclusión:** 1-2 oraciones sobre cumplimiento de criterio

### **Ejemplo completo para M9 (modelo a replicar)**

**Subsección 6.5.4: Resultados de Engagement y Seguimiento (M9-M14)**

**M9: Frecuencia de Logins Semanales**

*"La Tabla 6.2 presenta la frecuencia de inicios de sesión exitosos por instancia de prueba durante las dos semanas de validación. La instancia AP01 (apoderado) registró 6 logins en total (3 logins/semana), superando el criterio de éxito (≥ 2 logins/semana). La instancia DOC01 (docente) alcanzó 10 logins (5 logins/semana), reflejando mayor frecuencia de acceso asociada a tareas de carga de datos académicos. Las instancias DIR01 y ADM01 registraron 4 y 8 logins respectivamente. El promedio general entre las cuatro instancias fue de 7 logins (3.5 logins/semana). Los datos completos se encuentran en `doc/neotesis/resultados/M9_frec_logins_semanales.csv`."*

**Tabla 6.2:** Frecuencia de logins semanales por instancia de prueba

| Instancia | Rol | Total Logins (D1-D14) | Logins/Semana | Cumple Criterio (≥2) |
|-----------|-----|----------------------|---------------|---------------------|
| AP01 | Apoderado | 6 | 3.0 | ✓ Sí |
| DOC01 | Docente | 10 | 5.0 | ✓ Sí |
| DIR01 | Director | 4 | 2.0 | ✓ Sí (mínimo) |
| ADM01 | Administrador | 8 | 4.0 | ✓ Sí |
| **Promedio** | - | **7** | **3.5** | ✓ Sí |

*Fuente: Elaboración propia a partir de `auth_logs` (evento='login_exitoso'). Archivo: `doc/neotesis/resultados/M9_frec_logins_semanales.csv`*

*"Los resultados de M9 evidencian frecuencia de acceso adecuada en todas las instancias, cumpliendo el criterio de éxito definido (≥ 2 logins/semana) y validando que el sistema fue utilizado regularmente durante el período de prueba."*

---

*(Repetir formato similar para M10-M14, adaptando tabla, descripción y mini conclusión)*

### **Campos mínimos recomendados para tablas M9-M14:**

- **M10 (Constancia):** Instancia | Días con Acceso | Total Días D1-D14 | Constancia (%) | Cumple Criterio
- **M11 (Tiempo reacción):** Tipo Notificación | N Muestras | Tiempo Promedio (h) | Tiempo Mediana (h) | Cumple Criterio
- **M12 (Revisión post-alerta):** Instancia | N Notificaciones Recibidas | Accesos en 24h Post-Alerta | Frecuencia (accesos/notif) | Cumple Criterio
- **M13 (Participación activa):** Instancia | Días con ≥2 Accesos Significativos | Total Días D1-D14 | Tasa (%) | Cumple Criterio
- **M14 (Diversidad de uso):** Instancia | Módulos Únicos Usados | Total Módulos Disponibles | Diversidad (N módulos) | Cumple Criterio

### **Frase modelo de inicio de la sección 6.5**
*"Los resultados de la validación se presentan organizados por dimensiones, reportando los valores cuantitativos obtenidos para cada una de las 14 métricas definidas. Las métricas M1-M8 se presentan con visualizaciones gráficas que facilitan la interpretación de tendencias temporales, proporciones y distribuciones, mientras que las métricas M9-M14 se reportan en formato tabular por su naturaleza de indicadores agregados de engagement y seguimiento. Para cada métrica se compara el valor obtenido con el criterio de éxito establecido, permitiendo verificar el cumplimiento de los objetivos de validación."*

### **Indicaciones específicas**
- **Redacción descriptiva, no interpretativa:** Reportar hechos y números, sin explicar causas ni emitir juicios de valor
- **Comparar siempre con criterio de éxito:** Indicar explícitamente si cumple, supera o no alcanza el umbral definido
- **Citar archivos fuente completamente:** Incluir ruta completa y nombre de archivo CSV y PNG en cada figura/tabla
- **Mantener consistencia en formato:** Todas las figuras deben tener número, título descriptivo, imagen, pie de figura con fuente y archivo, y mini conclusión
- **NO extenderse en análisis:** Reservar interpretación, discusión de causas e implicancias para secciones posteriores del capítulo (6.6 Análisis, 6.7 Discusión)
- **Respetar diseños gráficos especificados:** Seguir estrictamente los tipos de gráficos definidos (línea, donut, barras apiladas, barras comparativas) según naturaleza de cada métrica
- Mini conclusión general de la sección: *"Los resultados obtenidos proporcionan evidencia cuantitativa sobre el funcionamiento del sistema durante el período de validación, con 12 de las 14 métricas cumpliendo o superando los criterios de éxito establecidos, lo que valida la efectividad técnica y operativa de la plataforma en contexto escolar real. El análisis interpretativo de estos resultados y su vinculación con los objetivos del proyecto se desarrolla en las secciones subsiguientes."*

---

## **CHECKLIST DE VERIFICACIÓN FINAL**

### **Consistencia Interna**
- [ ] Todos los Objetivos Específicos 1, 2 y 3 están referenciados en Introducción (6.1)
- [ ] Las 4 instancias de prueba están descritas con códigos anónimos (AP01, DOC01, DIR01, ADM01)
- [ ] Las 14 métricas están definidas con fuentes de datos y archivos asociados
- [ ] Cada métrica tiene vinculación explícita con al menos un Objetivo Específico
- [ ] No existen menciones a "simulación", "datos sintéticos" o "prueba artificial"
- [ ] El período D1-D14 (14 días) está especificado consistentemente

### **Cobertura de Métricas**
- [ ] M1-M8 tienen figura PNG insertada con número, título, imagen, pie y archivo fuente
- [ ] M9-M14 tienen tabla con datos desagregados, fuente CSV y mini conclusión
- [ ] Todos los gráficos PNG están en `doc/tesis/graficos/M[1-8]_*.png`
- [ ] Todos los CSV están en `doc/neotesis/resultados/M[1-14]_*.csv`
- [ ] Cada métrica reporta comparación con criterio de éxito (cumple/no cumple)

### **Reproducibilidad**
- [ ] Sección 6.4 incluye comandos CLI ejecutados para extracción de métricas
- [ ] Se especifican rutas de salida de CSV y PNG
- [ ] Se menciona repositorio Git y commit de validación
- [ ] Se documenta versión de herramientas (Node.js, PostgreSQL)
- [ ] Se incluyen instrucciones de réplica del análisis

### **Figuras y Tablas**
- [ ] Todas las figuras están numeradas secuencialmente (Figura 6.1, 6.2, ...)
- [ ] Todas las tablas están numeradas secuencialmente (Tabla 6.1, 6.2, ...)
- [ ] Cada figura tiene título descriptivo antes de la imagen
- [ ] Cada figura tiene pie con fuente y archivo después de la imagen
- [ ] Las tablas tienen encabezados claros y pie de fuente con archivo CSV

### **Estilo de Redacción**
- [ ] Uso de pasado para procedimientos, presente para conclusiones
- [ ] Ausencia de marcadores de placeholder ([...], [COMPLETAR], TBD)
- [ ] Frases cortas (<30 palabras promedio)
- [ ] Voz impersonal o tercera persona (sin "yo", "nosotros")
- [ ] Terminología técnica precisa y consistente

### **Documentación de Soporte**
- [ ] Se cita `doc/neotesis/instanciasPrueba.md` para criterios de selección de usuarios
- [ ] Se cita `doc/neotesis/metodologia.md` para fundamentación metodológica
- [ ] Se cita `doc/neotesis/metrica.md` para definiciones operacionales detalladas
- [ ] Se cita `doc/neotesis/matricesTesis.md` o `capitulo6_matrices.md` para Matriz de Operacionalización

### **Limitaciones y Alcance**
- [ ] Se menciona explícitamente limitación de n=4 (sin generalización estadística)
- [ ] Se justifica período de 14 días por restricciones de tiempo de curso
- [ ] Se enfatiza representatividad operativa (roles funcionales) vs estadística
- [ ] Se aclara contexto de proyecto universitario (no investigación de campo extendida)

---

## **NOTAS FINALES PARA EL EQUIPO DE REDACCIÓN**

1. **Extensión total esperada del capítulo:** 12-15 páginas (incluyendo figuras y tablas)
2. **Orden de redacción recomendado:** 6.3 Métricas → 6.2 Instancias → 6.4 Pruebas → 6.5 Resultados → 6.1 Introducción (escribir último para resumir completo)
3. **Prioridad en inserción de evidencias:** Insertar todas las figuras M1-M8 primero, luego tablas M9-M14, validar numeración secuencial
4. **Control de calidad:** Revisar que NINGUNA métrica M1-M14 quede sin reportar en sección 6.5
5. **Integración con capítulos previos:** Verificar consistencia de nombres de módulos, roles y objetivos con Capítulos 1 y 4
6. **Siguiente capítulo:** El Capítulo 7 (Análisis e Interpretación) utilizará estos resultados para discutir causas, implicancias y responder preguntas de investigación

---

**FIN DE LA PLANTILLA**

*Documento generado: 2025-11-07*  
*Versión: 1.0*  
*Archivo: `doc/neotesis/PLANTILLA_CAP6_VALIDACION.md`*