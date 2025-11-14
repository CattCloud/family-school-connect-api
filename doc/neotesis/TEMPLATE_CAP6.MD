# PLANTILLA COMPLETA: CAPÍTULO 6 - VALIDACIÓN

## **6.1 INTRODUCCIÓN**

### **Propósito de esta sección**
Contextualizar el capítulo dentro de la tesis, conectando la validación con los objetivos del proyecto y justificando su relevancia.

### **Guía de redacción**
- **Extensión:** 2-3 párrafos (150-250 palabras)
- **Tiempo verbal:** Presente para generalizar, pasado para describir lo ejecutado
- **Estructura sugerida:**
  1. Párrafo 1: Propósito del capítulo y vínculo con problema/objetivos
  2. Párrafo 2: Qué se validó (módulos, métricas, usuarios)
  3. Párrafo 3: Estructura del capítulo (roadmap de secciones)

### **Frase modelo de inicio**
*"Este capítulo presenta los resultados de la validación del sistema de comunicación escolar implementado en la I.E.P. Las Orquídeas, con el objetivo de verificar el cumplimiento de los objetivos específicos planteados en el Capítulo 1. La validación se realizó mediante una prueba de campo controlada durante un período de 14 días (D1–D14), con la participación de usuarios reales en contexto escolar operativo."*

### **Indicaciones específicas**
- NO mencionar "simulación" ni "datos sintéticos"
- Enfatizar participación de usuarios reales (padres, docentes, director, administrador)
- Vincular explícitamente con Objetivos Específicos 1, 2 y 3 del Capítulo 1
- Citar documentos previos: *"La metodología aplicada se detalló en la Sección 6.3 y se fundamentó en el enfoque de Evaluación Basada en Uso Real documentado en `doc/neotesis/metodologia.md`"*

---

## **6.2 OBJETIVOS DE VALIDACIÓN Y CRITERIOS DE ÉXITO**

### **Propósito de esta sección**
Especificar qué se buscó demostrar con la validación y bajo qué criterios se consideraría exitosa.

### **Guía de redacción**
- **Extensión:** 3-4 párrafos (200-300 palabras)
- **Tiempo verbal:** Infinitivo para objetivos, presente para criterios
- **Estructura sugerida:**
  1. Listar 3 objetivos de validación (uno por cada Objetivo Específico del proyecto)
  2. Definir criterios de éxito operativos por objetivo
  3. Justificar por qué estos criterios son apropiados

### **Contenido esperado**

**Objetivo de Validación 1 (OV1):** Verificar que el sistema facilita el acceso oportuno a información académica (calificaciones y asistencia) por parte de los padres de familia.

**Criterios de éxito OV1:**
- Frecuencia de consulta de calificaciones ≥ 2 accesos/semana (Métrica M1)
- Frecuencia de consulta de asistencia ≥ 1 acceso/semana (Métrica M2)
- Cobertura de consulta académica ≥ 50% de cursos (Métrica M3)

**Objetivo de Validación 2 (OV2):** Comprobar que la comunicación institucional (comunicados y notificaciones) alcanza efectivamente a los destinatarios.

**Criterios de éxito OV2:**
- Tasa de lectura de comunicados ≥ 70% (Métrica M4)
- Tiempo promedio hasta lectura ≤ 48 horas (Métrica M5)
- Tasa de visualización de notificaciones ≥ 60% (Métrica M6)

**Objetivo de Validación 3 (OV3):** Evaluar la efectividad de mecanismos de retroalimentación y soporte técnico.

**Criterios de éxito OV3:**
- Tasa de participación en encuestas ≥ 50% (Métrica M7)
- Tiempo promedio de resolución de tickets ≤ 48 horas (Métrica M8)

### **Frase modelo de inicio**
*"La validación persiguió tres objetivos específicos alineados con los Objetivos Específicos 1, 2 y 3 del proyecto. El primer objetivo de validación (OV1) consistió en verificar que el sistema facilita el acceso oportuno a información académica, estableciendo como criterio mínimo una frecuencia de consulta de calificaciones de al menos 2 accesos por semana por parte de los apoderados."*

---

## **6.3 ALCANCE Y CONTEXTO DE LA VALIDACIÓN**

### **Propósito de esta sección**
Delimitar el perímetro de la validación: qué se validó, qué no, en qué condiciones y durante cuánto tiempo.

### **Guía de redacción**
- **Extensión:** 4-5 párrafos (300-400 palabras)
- **Tiempo verbal:** Pasado para describir lo ejecutado
- **Estructura sugerida:**
  1. Entorno escolar (institución, nivel educativo)
  2. Roles participantes
  3. Período de validación (D1–D14)
  4. Módulos validados
  5. Supuestos y limitaciones por tiempo de curso

### **Contenido esperado**

**Entorno:** I.E.P. Las Orquídeas, institución privada en Lima Norte con 150-200 estudiantes en niveles inicial, primaria y secundaria.

**Roles participantes:** 4 usuarios reales representando roles críticos del sistema:
- 1 apoderado con 2 hijos matriculados
- 1 docente con 3 cursos asignados
- 1 director con funciones administrativas globales
- 1 administrador técnico

**Período:** 14 días naturales continuos (D1 a D14), iniciando un lunes en horario lectivo regular.

**Módulos validados:**
- ✓ Autenticación y gestión de sesiones
- ✓ Consulta de calificaciones y asistencia
- ✓ Comunicados institucionales
- ✓ Sistema de notificaciones
- ✓ Encuestas institucionales
- ✓ Mensajería docente-apoderado
- ✓ Soporte técnico (tickets)

**Supuestos:**
- Sistema desplegado en producción (Render + Neon PostgreSQL)
- Datos académicos reales precargados en base de datos
- Usuarios capacitados en sesión de 1 hora previa al inicio
- Sin intervención del investigador durante el período activo

### **Frase modelo de inicio**
*"La validación se ejecutó en la I.E.P. Las Orquídeas durante un período de 14 días naturales (D1–D14) en contexto escolar operativo regular. Participaron cuatro usuarios reales representando los roles críticos del sistema: un apoderado con dos hijos matriculados en nivel primaria, un docente asignado a tres cursos del área de Matemática y Ciencias, el director académico de la institución y el administrador técnico responsable del soporte."*

### **Indicaciones específicas**
- Justificar brevemente el período de 14 días: *"El período de dos semanas se consideró suficiente para observar patrones de uso recurrentes sin extender excesivamente la carga operativa en un contexto de proyecto de curso universitario"*
- NO detallar nombres reales de participantes (usar códigos: AP01, DOC01, DIR01, ADM01)
- Mencionar consentimiento informado sin extenderse: *"Los participantes firmaron consentimiento informado previo al inicio de la validación"*

---

## **6.4 INSTANCIAS DE PRUEBA Y ENTORNO TÉCNICO**

### **Propósito de esta sección**
Inventariar brevemente las instancias de usuario y las condiciones técnicas del despliegue.
[Guia de Instancias de Prueba usadas](/doc/neotesis/instanciasPrueba.md) 

### **Guía de redacción**
- **Extensión:** 3-4 párrafos (250-350 palabras)
- **Tiempo verbal:** Pasado para describir configuración
- **Estructura sugerida:**
  1. Perfiles de usuario (roles y características)
  2. Infraestructura técnica
  3. Datos precargados
  4. Procedimiento de acceso

### **Contenido esperado**

**Tabla 6.1: Perfiles de Instancias de Prueba**

| Código | Rol | Contexto Operativo | Módulos de Uso Principal |
|--------|-----|-------------------|-------------------------|
| AP01 | Apoderado | 2 hijos en primaria (5to y 3er grado) | Calificaciones, Asistencia, Comunicados, Notificaciones, Mensajes |
| DOC01 | Docente | 3 cursos asignados (Matemática, Ciencias, Personal Social) | Carga de datos, Comunicados, Mensajes, Encuestas |
| DIR01 | Director | Gestión institucional global | Comunicados, Encuestas, Supervisión |
| ADM01 | Administrador | Soporte técnico | Tickets, Administración, FAQ/Guías |

**Infraestructura:**
- **Backend:** Node.js + Express desplegado en Render (URL: `https://family-school-connect-api.onrender.com`)
- **Base de datos:** PostgreSQL en Neon (conexión SSL)
- **Almacenamiento:** Cloudinary para archivos adjuntos
- **Notificaciones:** WhatsApp Cloud API (Meta Business)

**Datos precargados:**
- 2 estudiantes vinculados a AP01 con 8 cursos cada uno
- 30 registros de calificaciones preliminares (2 trimestres)
- 40 registros de asistencia (últimos 20 días lectivos)
- 5 comunicados publicados al inicio del período
- 2 encuestas activas

### **Frase modelo de inicio**
*"Se configuraron cuatro instancias de prueba representando los roles funcionales del sistema, según se detalla en la Tabla 6.1. La instancia AP01 (apoderado) correspondió a un padre con dos hijos matriculados en nivel primaria, quien accedió principalmente a los módulos de consulta de calificaciones y asistencia."*

### **Indicaciones específicas**
- Referenciar documentación detallada: *"Los criterios completos de selección y funciones por rol se documentaron en `doc/neotesis/instanciasPrueba.md`"*
- NO extenderse en características sociodemográficas
- Enfatizar representatividad operativa, no estadística


---

## **6.6 METODOLOGÍA DE VALIDACIÓN**

### **Propósito de esta sección**
Explicar el diseño metodológico, variables observadas, procedimientos y fuentes de datos.

### **Guía de redacción**
- **Extensión:** 6-8 párrafos (500-700 palabras)
- **Tiempo verbal:** Pasado para procedimientos, presente para generalizar
- **Estructura sugerida:**
  1. Diseño de validación
  2. Variables observadas (métricas M1-M14)
  3. Procedimiento fase por fase
  4. Instrumentos y fuentes de datos
  5. Extracción y procesamiento

### **Contenido esperado**

**Diseño:** Estudio observacional de campo con mediciones longitudinales durante 14 días, fundamentado en el enfoque de Evaluación Basada en Uso Real (Nielsen, 1994; Siemens & Long, 2011).

**Variables observadas:**
- **Variable Independiente:** Plataforma web de comunicación (funcionalidades implementadas)
- **Variable Dependiente:** Nivel de comunicación y seguimiento parental
- **14 métricas específicas** distribuidas en 6 dimensiones (ver Tabla 6.2)

**Tabla 6.2: Dimensiones y Métricas de Validación**

| Dimensión | Métricas | Fuente de Datos |
|-----------|---------|----------------|
| D1. Acceso a Información Académica | M1, M2, M3 | `access_logs`, cruce con `cursos` |
| D2. Comunicación Institucional | M4, M5, M6 | `comunicados_lecturas`, `notificaciones` |
| D3. Mecanismos de Sostenibilidad | M7, M8 | `respuestas_encuestas`, `tickets_soporte` |
| D4. Frecuencia de Acceso | M9, M10 | `auth_logs`, `access_logs` |
| D5. Oportunidad en Comunicación | M11, M12 | `notificaciones`, correlación temporal |
| D6. Involucramiento Parental | M13, M14 | Agregaciones de `access_logs` |

**Procedimiento:**

1. **Fase de Preparación (3 días previos):**
   - Configuración de tablas de logging (`auth_logs`, `access_logs`)
   - Carga de datos académicos iniciales
   - Capacitación de usuarios (sesión de 1 hora)
   - Firma de consentimientos informados

2. **Fase de Validación Activa (14 días D1-D14):**
   - Inicio simultáneo de acceso por las 4 instancias (día D1, 8:00 AM)
   - Captura automática de eventos:
     - Logins/logouts en `auth_logs`
     - Navegación por módulos en `access_logs`
     - Lecturas de comunicados en `comunicados_lecturas`
     - Visualización de notificaciones en `notificaciones`
     - Respuestas a encuestas en `respuestas_encuestas`
     - Creación/resolución de tickets en `tickets_soporte`
   - Sin intervención del investigador (validez ecológica)

3. **Fase de Extracción de Datos (7 días posteriores):**
   - Exportación de logs y registros de interacción
   - Ejecución de queries SQL por métrica
   - Generación de archivos CSV de resultados
   - Validación de calidad de datos

**Fuentes de datos:**
- Tablas de logging: `auth_logs`, `access_logs`
- Tablas transaccionales: `comunicados_lecturas`, `notificaciones`, `respuestas_encuestas`, `tickets_soporte`
- Tablas maestras: `usuarios`, `estudiantes`, `cursos`, `relaciones_familiares`

### **Frase modelo de inicio**
*"La validación adoptó un diseño observacional de campo con mediciones longitudinales durante 14 días naturales (D1–D14), fundamentado en el enfoque de Evaluación Basada en Uso Real documentado por Nielsen (1994) y aplicado en contextos educativos por Siemens y Long (2011). Este enfoque permite capturar el comportamiento natural de los usuarios en condiciones operativas reales, sin intervenciones artificiales que puedan sesgar los resultados."*

### **Indicaciones específicas**
- Citar documentación metodológica: *"La fundamentación teórica completa se encuentra en `doc/neotesis/metodologia.md`"*
- Referenciar matriz de operacionalización: *"Las definiciones operacionales de cada métrica se detallan en `doc/neotesis/matricesTesis.md`"*
- NO extenderse en fundamentos teóricos (ya están en capítulos previos)

---

## **6.7 PIPELINE DE EXTRACCIÓN Y REPRODUCIBILIDAD**

### **Propósito de esta sección**
Documentar comandos ejecutados, rutas de salida y procedimiento para replicar el análisis.

### **Guía de redacción**
- **Extensión:** 3-4 párrafos (250-350 palabras)
- **Tiempo verbal:** Pasado para lo ejecutado, infinitivo para instrucciones de réplica
- **Estructura sugerida:**
  1. Scripts desarrollados
  2. Comandos de ejecución
  3. Rutas de salida
  4. Control de versiones

### **Contenido esperado**

**Scripts desarrollados:**
- `scripts/extraer_metricas.js`: Ejecuta queries SQL para las 14 métricas
- `scripts/generar_graficos.js`: Genera visualizaciones PNG a partir de CSV
- `scripts/exportar_csv.js`: Exporta resultados crudos a formato CSV

**Comandos ejecutados:**
```bash
# 1. Extracción de métricas (post-validación)
node scripts/extraer_metricas.js --inicio=2025-03-03 --fin=2025-03-16

# 2. Exportación a CSV
node scripts/exportar_csv.js --output=doc/neotesis/resultados/

# 3. Generación de gráficos
node scripts/generar_graficos.js --input=doc/neotesis/resultados/ --output=doc/tesis/graficos/
```

**Rutas de salida:**
- **CSV de métricas:** `doc/neotesis/resultados/M*.csv`
- **Gráficos PNG:** `doc/tesis/graficos/M*.png`
- **Logs de ejecución:** `logs/extraccion_YYYYMMDD.log`

**Control de versiones:**
- Repositorio Git: `https://github.com/CattCloud/family-school-connect-api`
- Commit de validación: `[hash del commit]`
- Rama: `main` o `validacion-cap6`

### **Frase modelo de inicio**
*"La extracción de datos y generación de resultados se automatizó mediante scripts Node.js ejecutados al finalizar el período de validación. El script principal `scripts/extraer_metricas.js` ejecutó las queries SQL definidas para cada una de las 14 métricas, exportando los resultados crudos a archivos CSV en la ruta `doc/neotesis/resultados/`."*

### **Indicaciones específicas**
- Incluir timestamp de ejecución: *"La extracción se realizó el 17 de marzo de 2025 a las 10:00 AM"*
- Mencionar versiones de herramientas: *"Node.js v20.x, PostgreSQL 15.x"*
- Proporcionar instrucciones de réplica: *"Para replicar el análisis, ejecutar los comandos listados en orden secuencial tras configurar la conexión a base de datos en el archivo `.env`"*

---

## **6.8 MÉTRICAS Y FUENTES DE DATOS**

### **Propósito de esta sección**
Mapear cada métrica a sus fuentes, definir qué mide y justificar su relevancia.

### **Guía de redacción**
- **Extensión:** 1-2 párrafos por métrica (total: 3-4 páginas)
- **Tiempo verbal:** Presente para definir, pasado para fuentes
- **Estructura sugerida:** Para cada métrica:
  1. Código y nombre completo
  2. Definición operacional breve
  3. Fuente de datos (tabla + campos)
  4. Archivo CSV y gráfico asociado
  5. Relevancia (1-2 oraciones)

### **Contenido esperado (ejemplo para M1)**

**M1: Frecuencia de Consulta de Calificaciones**

**Definición:** Número promedio de accesos al módulo de calificaciones por semana, por usuario con rol de apoderado.

**Fuente de datos:** Tabla `access_logs`, filtrada por `modulo='calificaciones'` y `usuario_id IN (SELECT id FROM usuarios WHERE rol='apoderado')`. La métrica se calculó mediante agregación temporal sobre el rango de fechas D1-D14.

**Archivos generados:**
- CSV: `doc/neotesis/resultados/M1_frec_calificaciones.csv` (frecuencias por semana)
- CSV serie diaria: `doc/neotesis/resultados/M1_series_diaria.csv` (accesos diarios D1-D14)
- Gráfico: `doc/tesis/graficos/M1_series_calificaciones.png` (línea temporal diaria, rol Apoderado)

**Relevancia:** Esta métrica valida el Objetivo Específico 1 sobre facilitar el acceso a información académica. Un valor ≥ 2 accesos/semana indica que los padres utilizan activamente el sistema para monitorear el desempeño académico de sus hijos.

### **Tabla 6.3: Resumen de Métricas y Archivos Asociados**

| Métrica | Nombre | Dimensión | CSV Resultados | Gráfico PNG | Objetivo Validado |
|---------|--------|-----------|---------------|-------------|------------------|
| M1 | Frecuencia consulta calificaciones | D1 | M1_frec_calificaciones.csv, M1_series_diaria.csv | M1_series_calificaciones.png | OE1 |
| M2 | Frecuencia consulta asistencia | D1 | M2_frec_asistencia.csv, M2_series_diaria.csv | M2_series_asistencia.png | OE1 |
| M3 | Cobertura consulta académica | D1 | M3_cobertura_consulta.csv | M3_cobertura_consulta.png | OE1 |
| M4 | Tasa lectura comunicados | D2 | M4_tasa_lectura_comunicados.csv | M4_tasa_lectura_comunicados.png | OE2 |
| M5 | Tiempo hasta lectura comunicados | D2 | M5_tiempo_lectura_comunicados.csv | M5_tiempo_lectura_comunicados.png | OE2 |
| M6 | Tasa visualización notificaciones | D2 | M6_tasa_visualizacion_notificaciones.csv | M6_tasa_visualizacion_notificaciones.png | OE2 |
| M7 | Tasa participación encuestas | D3 | M7_tasa_participacion_encuestas.csv | M7_tasa_participacion_encuestas.png | OE3 |
| M8 | Tiempo resolución tickets | D3 | M8_tiempo_resolucion_tickets.csv | M8_tiempo_resolucion_tickets.png | OE3 |
| M9-M14 | Engagement y seguimiento | D4-D6 | M9_frec_logins.csv ... M14_diversidad_uso.csv | (Tablas en texto) | OE1, OE2 |

### **Frase modelo de inicio**
*"Las 14 métricas definidas en la Matriz de Operacionalización (ver `doc/neotesis/matricesTesis.md`) se extrajeron de las tablas de logging y transaccionales del sistema, según se detalla en la Tabla 6.3. A continuación se describe cada métrica, su fuente de datos y los archivos generados para el análisis."*

### **Indicaciones específicas**
- Para M9-M14, especificar que se reportan como tablas en el texto por su naturaleza (engagement, no requieren visualización gráfica compleja)
- Referenciar definiciones completas: *"La fórmula detallada de cada métrica se encuentra en `doc/neotesis/metrica.md`"*

---

## **6.9 RESULTADOS**

### **Propósito de esta sección**
Presentar los resultados cuantitativos de las 14 métricas con figuras y tablas, sin interpretar aún.

### **Guía de redacción**
- **Extensión:** 1 párrafo + 1 figura/tabla por métrica (total: 5-7 páginas)
- **Tiempo verbal:** Pasado para reportar resultados
- **Estructura sugerida:** Para cada métrica:
  1. Párrafo descriptivo (50-80 palabras)
  2. Inserción de figura o tabla numerada
  3. Referencia al archivo fuente

### **Subsección 6.9.1: Resultados de Acceso a Información Académica (M1-M3)**

**M1: Frecuencia de Consulta de Calificaciones**

*"La Figura 6.1 muestra la frecuencia diaria de accesos al módulo de calificaciones por parte del usuario AP01 (apoderado) durante el período D1-D14. Se registraron un total de 20 accesos, distribuidos irregularmente a lo largo de las dos semanas, con picos en los días D3, D7 y D12. La frecuencia semanal promedio fue de 10 accesos/semana, superando el criterio de éxito establecido (≥ 2 accesos/semana). Los datos completos se encuentran en `doc/neotesis/resultados/M1_series_diaria.csv`."*

**Figura 6.1:** Frecuencia diaria de consulta de calificaciones (D1-D14, rol Apoderado)  
![M1_series_calificaciones.png](doc/tesis/graficos/M1_series_calificaciones.png)  
*Fuente:* `doc/tesis/graficos/M1_series_calificaciones.png`

---

**M2: Frecuencia de Consulta de Asistencia**

*"La Figura 6.2 presenta la frecuencia diaria de accesos al módulo de asistencia por parte de AP01 durante D1-D14. Se registraron 14 accesos totales, concentrados principalmente en días D4, D8, D10 y D13. La frecuencia semanal promedio alcanzó 7 accesos/semana, superando ampliamente el umbral mínimo de 1 acceso/semana. La serie temporal completa se documenta en `doc/neotesis/resultados/M2_series_diaria.csv`."*

**Figura 6.2:** Frecuencia diaria de consulta de asistencia (D1-D14, rol Apoderado)  
![M2_series_asistencia.png](doc/tesis/graficos/M2_series_asistencia.png)  
*Fuente:* `doc/tesis/graficos/M2_series_asistencia.png`

---

**M3: Cobertura de Consulta Académica**

*"La Figura 6.3 ilustra la proporción de cursos consultados versus no consultados durante el período de validación. El apoderado AP01 consultó información de 7 de los 8 cursos asignados a sus hijos, alcanzando una cobertura del 87.5%. Solo el curso de Educación para el Trabajo no fue accedido durante las dos semanas. Los datos desagregados se encuentran en `doc/neotesis/resultados/M3_cobertura_consulta.csv`."*

**Figura 6.3:** Cobertura de consulta de cursos académicos (% consultados vs no consultados)  
![M3_cobertura_consulta.png](doc/tesis/graficos/M3_cobertura_consulta.png)  
*Fuente:* `doc/tesis/graficos/M3_cobertura_consulta.png`

---

### **Subsección 6.9.2: Resultados de Comunicación Institucional (M4-M6)**

**M4: Tasa de Lectura de Comunicados**

*"La Figura 6.4 muestra la distribución de comunicados leídos y no leídos durante el período de validación, con la tasa de lectura indicada en el título. De los 6 comunicados publicados dirigidos al apoderado AP01, 5 fueron leídos (83.3%) y 1 permaneció sin leer al finalizar D14. Este resultado supera el criterio de éxito establecido (≥ 70%). El detalle por comunicado se encuentra en `doc/neotesis/resultados/M4_tasa_lectura_comunicados.csv`."*

**Figura 6.4:** Tasa de lectura de comunicados (Tasa: 83.3% - 5 de 6 leídos)  
![M4_tasa_lectura_comunicados.png](doc/tesis/graficos/M4_tasa_lectura_comunicados.png)  
*Fuente:* `doc/tesis/graficos/M4_tasa_lectura_comunicados.png`

---

**M5: Tiempo hasta Lectura de Comunicados**

*"La Figura 6.5 presenta la distribución de tiempos transcurridos entre la publicación de comunicados y su primera lectura por parte de AP01. El tiempo mínimo fue de 3 horas (comunicado urgente), la mediana fue de 12 horas y el máximo alcanzó 30 horas (comunicado informativo de baja prioridad). El tiempo promedio general (14.8 horas) cumple el criterio de ≤ 48 horas. Los datos completos se encuentran en `doc/neotesis/resultados/M5_tiempo_lectura_comunicados.csv`."*

**Figura 6.5:** Distribución de tiempos hasta lectura de comunicados (Mínimo, Mediana, Máximo)  
![M5_tiempo_lectura_comunicados.png](doc/tesis/graficos/M5_tiempo_lectura_comunicados.png)  
*Fuente:* `doc/tesis/graficos/M5_tiempo_lectura_comunicados.png`

---

**M6: Tasa de Visualización de Notificaciones**

*"La Figura 6.6 muestra la proporción de notificaciones visualizadas versus no visualizadas durante D1-D14. El apoderado AP01 visualizó 12 de las 14 notificaciones enviadas (85.7%), superando el umbral mínimo de 60%. Las 2 notificaciones no visualizadas correspondieron a alertas de baja prioridad. El detalle por tipo de notificación se documenta en `doc/neotesis/resultados/M6_tasa_visualizacion_notificaciones.csv`."*

**Figura 6.6:** Tasa de visualización de notific