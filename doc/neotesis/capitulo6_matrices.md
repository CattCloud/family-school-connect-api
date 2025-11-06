# CAPÍTULO VI: PRUEBAS Y VALIDACIÓN

## 6.1 Marcos Metodológicos para la Validación del Sistema

El presente capítulo establece los fundamentos metodológicos para la validación de la plataforma web desarrollada, mediante la presentación de las matrices de consistencia y operacionalización que articulan coherentemente los elementos del problema de investigación con los mecanismos de medición y evaluación del sistema.

La validación se estructura a partir de un enfoque cuantitativo basado en métricas objetivas extraídas de los registros del sistema (logs, analítica web y datos de interacción), en lugar de métodos tradicionales como encuestas o entrevistas. Esta aproximación permite obtener datos verificables y en tiempo real sobre el comportamiento de los usuarios y la efectividad de la plataforma.

## 6.2 Matriz de Consistencia Metodológica

La matriz de consistencia articula los elementos fundamentales de la investigación, asegurando coherencia entre el problema identificado, los objetivos planteados, las hipótesis formuladas y las variables de estudio, todos extraídos directamente del marco teórico y conceptual establecido en los capítulos anteriores.

### 6.2.1 Estructura de la Matriz de Consistencia

| **PROBLEMAS DE INVESTIGACIÓN** | **OBJETIVOS** | **HIPÓTESIS** | **VARIABLES** | **DIMENSIONES** | **INDICADORES** | **METODOLOGÍA** | **POBLACIÓN Y MUESTRA** |
|---|---|---|---|---|---|---|---|
| **PROBLEMA GENERAL:** <br>¿Cómo mejorar la comunicación entre padres de familia y la institución educativa I.E.P. Las Orquídeas para optimizar el seguimiento académico y la participación parental en el proceso educativo? | **OBJETIVO GENERAL:** <br>Diseñar e implementar una plataforma web de comunicación en la I.E.P. Las Orquídeas que mejore la interacción entre la institución y los padres, optimizando el acceso a información académica y fortaleciendo el seguimiento parental. | **HIPÓTESIS GENERAL:** <br>La implementación de una plataforma web de comunicación mejora significativamente la comunicación entre padres de familia y la institución educativa I.E.P. Las Orquídeas, optimizando el seguimiento académico y fortaleciendo la participación parental en el proceso educativo. | **V.I.:** <br>Plataforma web de comunicación <br><br>**V.D.:** <br>Nivel de comunicación y seguimiento parental | **V.I.:** <br>- Módulo de autenticación <br>- Módulo de datos académicos <br>- Módulo de notificaciones <br>- Módulo de comunicados <br>- Módulo de encuestas <br>- Módulo de soporte técnico <br><br>**V.D.:** <br>- Frecuencia de acceso a información <br>- Participación en comunicaciones bidireccionales <br>- Nivel de seguimiento académico | **V.I.:** <br>- Funcionalidad del sistema <br>- Accesibilidad y usabilidad <br>- Integración de módulos <br><br>**V.D.:** <br>- Frecuencia de uso <br>- Tiempo de interacción <br>- Patrones de navegación <br>- Respuesta a notificaciones | **Enfoque:** Cuantitativo <br>**Diseño:** Cuasi-experimental <br>**Técnica:** Análisis de logs y métricas del sistema <br>**Instrumento:** Registros automatizados de interacción | **Población:** <br>Comunidad educativa I.E.P. Las Orquídeas <br><br>**Muestra:** <br>Instancias de prueba simuladas: <br>- 2 perfiles de padres <br>- 1 perfil de docente <br>- Período: 2 semanas de simulación |
| **PROBLEMA ESPECÍFICO 1:** <br>¿De qué manera se puede facilitar el acceso oportuno y seguro de los padres a la información académica de sus hijos para mejorar el seguimiento parental? | **OBJETIVO ESPECÍFICO 1:** <br>Implementar un sistema centralizado que facilite el acceso oportuno y seguro de los padres a la información académica de sus hijos y fomente el involucramiento en el proceso educativo. | **HIPÓTESIS ESPECÍFICA 1:** <br>La implementación de un sistema centralizado de acceso a información académica mediante la plataforma web facilita significativamente el acceso oportuno y seguro de los padres, mejorando el seguimiento parental del desempeño estudiantil. | **V.I.:** <br>Sistema centralizado de información académica (módulos de autenticación y datos académicos) <br><br>**V.D.:** <br>Nivel de acceso y seguimiento de información académica | **V.I.:** <br>- Seguridad de acceso <br>- Disponibilidad de información <br>- Oportunidad de datos <br><br>**V.D.:** <br>- Consultas de calificaciones <br>- Consultas de asistencia <br>- Frecuencia de acceso | **V.I.:** <br>- Tasa de éxito en autenticación <br>- Disponibilidad del sistema <br>- Actualización de datos <br><br>**V.D.:** <br>- Frecuencia de consultas académicas <br>- Tiempo de sesión <br>- Cobertura de información consultada | Análisis de logs de autenticación y acceso a módulos académicos | Registros de interacción de padres con módulos de calificaciones y asistencia |
| **PROBLEMA ESPECÍFICO 2:** <br>¿Cómo garantizar que la comunicación institucional llegue de manera oportuna, clara y efectiva a los padres de familia? | **OBJETIVO ESPECÍFICO 2:** <br>Desarrollar canales de comunicación digital que garanticen que la comunicación institucional (comunicados y alertas) llegue de manera oportuna, clara y efectiva a los padres de familia. | **HIPÓTESIS ESPECÍFICA 2:** <br>El desarrollo de canales de comunicación digital integrados (comunicados, notificaciones y WhatsApp) garantiza que la comunicación institucional llegue de manera oportuna, clara y efectiva a los padres de familia. | **V.I.:** <br>Canales de comunicación digital (módulos de comunicados y notificaciones) <br><br>**V.D.:** <br>Efectividad de la comunicación institucional | **V.I.:** <br>- Sistema de comunicados <br>- Sistema de notificaciones <br>- Integración WhatsApp <br><br>**V.D.:** <br>- Alcance de comunicación <br>- Oportunidad de información <br>- Claridad de mensajes | **V.I.:** <br>- Funcionalidad de envío <br>- Cobertura de destinatarios <br>- Tiempo de entrega <br><br>**V.D.:** <br>- Tasa de lectura <br>- Tiempo de respuesta <br>- Interacción con comunicados | Análisis de registros de envío y lectura de comunicados y notificaciones | Métricas de comunicados publicados, notificaciones enviadas y respuestas de usuarios |
| **PROBLEMA ESPECÍFICO 3:** <br>¿Qué mecanismos se deben implementar para garantizar la sostenibilidad, mejora continua y efectividad del canal de comunicación entre padres y la institución educativa? | **OBJETIVO ESPECÍFICO 3:** <br>Implementar mecanismos que garanticen la sostenibilidad, mejora continua y efectividad del canal de comunicación entre padres y la institución educativa. | **HIPÓTESIS ESPECÍFICA 3:** <br>La implementación de mecanismos de retroalimentación y soporte técnico (encuestas y sistema de tickets) garantiza la sostenibilidad, mejora continua y efectividad del canal de comunicación entre padres y la institución educativa. | **V.I.:** <br>Mecanismos de mejora continua y sostenibilidad (módulos de encuestas y soporte técnico) <br><br>**V.D.:** <br>Sostenibilidad y efectividad del canal de comunicación | **V.I.:** <br>- Sistema de encuestas <br>- Sistema de soporte técnico <br>- Mecanismos de feedback <br><br>**V.D.:** <br>- Continuidad de uso <br>- Resolución de problemas <br>- Satisfacción del usuario | **V.I.:** <br>- Funcionalidad de encuestas <br>- Efectividad del soporte <br>- Capacidad de mejora <br><br>**V.D.:** <br>- Participación sostenida <br>- Tiempo de resolución <br>- Mejoras implementadas | Análisis de registros de participación en encuestas y tickets de soporte | Métricas de uso continuo, resolución de incidencias y retroalimentación de usuarios |

### 6.2.2 Justificación de la Coherencia Metodológica

La matriz de consistencia demuestra la alineación perfecta entre cada problema específico identificado en la I.E.P. Las Orquídeas y los objetivos planteados para resolverlos. Las hipótesis formuladas establecen relaciones causales verificables entre la implementación de los módulos específicos de la plataforma (variable independiente) y las mejoras esperadas en la comunicación y seguimiento parental (variable dependiente).

La metodología cuantitativa basada en análisis de logs y métricas del sistema permite una validación objetiva y continua, superando las limitaciones de métodos tradicionales que dependen de percepciones subjetivas. Este enfoque es particularmente apropiado para evaluar sistemas tecnológicos en entornos educativos, donde los datos de interacción proporcionan evidencia directa del comportamiento de los usuarios.

## 6.3 Matriz de Operacionalización de Variables

La matriz de operacionalización convierte los conceptos abstractos identificados en la matriz de consistencia en elementos medibles y verificables, estableciendo indicadores específicos que pueden ser cuantificados mediante los registros automáticos del sistema.

### 6.3.1 Variable Independiente: Plataforma Web de Comunicación

**Definición Conceptual:** Sistema informático basado en tecnologías web que centraliza la gestión de información académica y facilita la comunicación entre la institución educativa y los padres de familia.

**Justificación de Selección de Indicadores:** Los indicadores seleccionados miden exclusivamente la funcionalidad y efectividad de la plataforma desde la perspectiva del usuario final (padres), enfocándose en métricas que pueden ser capturadas durante sesiones reales de uso con un grupo reducido de usuarios de prueba.

| **DIMENSIONES** | **INDICADORES** | **MÉTRICA DE MEDICIÓN** | **FUENTE DE DATOS** | **JUSTIFICACIÓN PARA OBJETIVOS** |
|---|---|---|---|---|
| **D1: ACCESO SEGURO AL SISTEMA** | **I1.1** Tasa de éxito en autenticación | (Logins exitosos / Total intentos) × 100 | Tabla `auth_logs` | **OE1:** Demuestra que el sistema facilita acceso seguro a información académica |
| | **I1.2** Tiempo promedio de sesión activa | Promedio duración sesiones por usuario (minutos) | Timestamps login/logout | **OG:** Mide nivel de engagement e interacción con la plataforma |
| **D2: CONSULTA DE INFORMACIÓN ACADÉMICA** | **I2.1** Frecuencia de consulta de datos académicos | Total accesos a calificaciones y asistencia / usuario / semana | Tabla `access_logs` módulos 'calificaciones' y 'asistencia' | **OE1:** Valida que los padres acceden oportunamente a información de sus hijos |
| | **I2.2** Cobertura de información consultada | (Cursos consultados / Total cursos del hijo) × 100 | Relación consultas vs cursos matriculados | **OE1:** Demuestra que el acceso es comprehensivo, no limitado |
| **D3: COMUNICACIÓN INSTITUCIONAL EFECTIVA** | **I3.1** Tasa de lectura de comunicados | (Comunicados leídos / Comunicados enviados) × 100 | Campo `estado_lectura` tabla `comunicados` | **OE2:** Verifica que la comunicación llega efectivamente a los padres |
| | **I3.2** Tiempo promedio hasta lectura de comunicados | Promedio tiempo entre envío y lectura (horas) | Diferencia `fecha_envio` - `fecha_lectura` | **OE2:** Mide oportunidad de la comunicación institucional |
| | **I3.3** Tasa de visualización de notificaciones críticas | (Notificaciones críticas vistas <24h / Total críticas) × 100 | Campo `fecha_visualizacion` tabla `notificaciones` | **OE2:** Confirma que alertas importantes son atendidas rápidamente |
| **D4: SOSTENIBILIDAD DEL CANAL DE COMUNICACIÓN** | **I4.1** Tasa de respuesta a encuestas institucionales | (Encuestas respondidas / Encuestas enviadas) × 100 | Tabla `encuestas_respuestas` | **OE3:** Mide participación en mecanismos de mejora continua |
| | **I4.2** Eficiencia de resolución de soporte | Promedio tiempo resolución tickets (horas) | Diferencia `fecha_creacion` - `fecha_resolucion` tickets | **OE3:** Verifica que existen mecanismos efectivos para garantizar continuidad |

### 6.3.2 Variable Dependiente: Nivel de Comunicación y Seguimiento Parental

**Definición Conceptual:** Grado de participación, conocimiento e involucramiento de los padres en el proceso educativo de sus hijos, medido mediante indicadores observables de comportamiento durante el uso del sistema.

**Justificación de Selección de Indicadores:** Los indicadores miden directamente los cambios en el comportamiento parental que demuestran mejora en comunicación y seguimiento académico, capturables con datos reales de interacción durante el período de pruebas.

| **DIMENSIONES** | **INDICADORES** | **MÉTRICA DE MEDICIÓN** | **FUENTE DE DATOS** | **JUSTIFICACIÓN PARA HIPÓTESIS** |
|---|---|---|---|---|
| **D5: FRECUENCIA DE ACCESO A INFORMACIÓN** | **I5.1** Frecuencia de logins de padres | Cantidad de inicios de sesión / usuario padre / semana | Tabla `auth_logs` filtro rol='padre' | **HG/HE1:** Demuestra que los padres acceden regularmente al sistema para seguimiento |
| | **I5.2** Constancia en monitoreo académico | (Días con consulta académica / Total días período) × 100 | Registros diarios acceso módulos académicos | **HE1:** Valida seguimiento continuo vs esporádico |
| **D6: CONOCIMIENTO DEL DESEMPEÑO ESTUDIANTIL** | **I6.1** Cobertura de información consultada | (Cursos consultados / Total cursos hijo) × 100 | Relación consultas vs cursos matriculados | **HE1:** Verifica que el conocimiento parental es integral |
| | **I6.2** Reacción a alertas académicas | Accesos al sistema <24h posteriores a notificación crítica | Correlación temporal `notificaciones` y `access_logs` | **HE2:** Mide oportunidad de respuesta ante información crítica |
| **D7: PARTICIPACIÓN EN COMUNICACIÓN BIDIRECCIONAL** | **I7.1** Iniciativa de contacto con docentes | Cantidad de mensajes/consultas iniciados por padres | Tabla `mensajes` filtro `es_iniciador=true` rol='padre' | **HG:** Demuestra mejora en participación activa (no pasiva) |
| | **I7.2** Sostenimiento de diálogo educativo | Promedio de intercambios por conversación padre-docente | Mensajes por `conversacion_id` con ambos roles | **HE2:** Valida que existe comunicación bidireccional efectiva |



### 6.3.4 Mapeo Indicadores-Objetivos

| **Objetivo** | **Indicadores Asociados** | **Propósito Específico** |
|---|---|---|
| **OE1:** Facilitar acceso oportuno y seguro a información académica | I1.1, I1.2, I2.1, I2.2, I6.1 | Demostrar que el sistema permite acceso seguro, frecuente y comprehensivo a datos académicos |
| **OE2:** Garantizar comunicación institucional oportuna y efectiva | I3.1, I3.2, I3.3, I6.2, I7.2 | Validar que comunicados y alertas llegan efectivamente y generan respuesta oportuna |
| **OE3:** Garantizar sostenibilidad y mejora continua | I4.1, I4.2, I5.2 | Verificar participación sostenida y existencia de mecanismos de retroalimentación |
| **OG:** Mejorar comunicación y seguimiento parental | I5.1, I7.1 | Medir incremento en frecuencia de acceso e iniciativa de comunicación |

## 6.4 Metodología de Recolección y Análisis de Datos

### 6.4.1 Estrategia de Recolección con Usuarios Reales


**Instrumento de Captura:**
- **Tablas de logging automáticas:** `auth_logs`, `access_logs`, `notificaciones`, `comunicados`, `mensajes`
- **Timestamps precisos:** Cada interacción registra fecha/hora exacta para análisis temporal
- **Sin intervención manual:** Los datos se generan automáticamente por el comportamiento real del usuario

**Ventajas del Enfoque:**
- Datos verificables y objetivos (no percepciones)
- Captura del comportamiento natural del usuario
- Reproducibilidad y auditabilidad completa
- Análisis cuantitativo riguroso posible

### 6.4.2 Validez y Confiabilidad de las Métricas

**Validez de Constructo:** Cada indicador mide efectivamente el constructo teórico que representa (ej: frecuencia de logins mide realmente "acceso regular al sistema").

**Validez de Contenido:** Los indicadores cubren las dimensiones esenciales de las variables independiente y dependiente sin redundancia.

**Confiabilidad:** Los registros automáticos eliminan errores humanos de medición y garantizan consistencia en la captura de datos.

**Validez Ecológica:** Al usar usuarios reales en condiciones naturales de uso, los resultados reflejan comportamiento auténtico, no artificial.

## 6.5 Plan de Análisis de Datos

### 6.5.1 Técnicas Estadísticas

Para cada indicador se aplicarán las siguientes técnicas según su naturaleza:

**Estadística Descriptiva:**
- Medidas de tendencia central (media, mediana) para tiempos y frecuencias
- Porcentajes para tasas de éxito, lectura y visualización
- Rangos y distribución de frecuencias para patrones de uso

**Análisis Comparativo:**
- Comparación entre perfiles de usuario (padre activo vs reactivo)
- Evolución temporal (inicio vs final del período de pruebas)
- Benchmarking contra valores esperados definidos en objetivos

**Análisis de Correlación:**
- Relación entre frecuencia de acceso y cobertura de información consultada
- Asociación temporal entre envío de alertas y respuesta de padres
- Conexión entre lectura de comunicados e iniciativa de contacto

