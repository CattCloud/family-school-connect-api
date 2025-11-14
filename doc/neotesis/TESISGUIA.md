
**UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS**

**(Universidad del Perú, DECANA DE AMÉRICA)**

FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA

Escuela Profesional de  Ingeniería de Sistemas
 

**TESIS**

Implementación de una solución de inteligencia de Negocios para mejorar la toma de decisiones referente al riesgo académico de una Escuela de Educación Superior

**INTEGRANTES**

ATOCCSA LEON, BETCY MILAGROS

HUAMAN FELIPE, AMY JANETH

**ASESORA**

VERA POMALAZA, VIRGINIA

**Lima, 202**
# <a name="_heading=h.e4khmwrhccft"></a>**CAPÍTULO 1: INTRODUCCIÓN**
## <a name="_heading=h.z7lhc8bodbb9"></a>**1.1. Situación Problemática**
La educación superior enfrenta desafíos significativos en torno al rendimiento académico y la equidad en el aprendizaje. De acuerdo con la Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura (UNESCO, 2022), persisten desigualdades estructurales que limitan el desarrollo pleno de las capacidades de los estudiantes, derivadas de factores sociales, económicos y de género. Dicho informe advierte que estas brechas se vieron agravadas por los efectos de la pandemia de la COVID-19, afectando el acceso y el desempeño de los estudiantes en todos los niveles educativos. Estos lineamientos internacionales respaldan el desarrollo de estrategias tecnológicas y analíticas que contribuyan a una educación más inclusiva y equitativa.

En la región latinoamericana, los desafíos en la educación superior se relacionan principalmente con la permanencia estudiantil, las desigualdades socioeconómicas y la calidad de la enseñanza. Según el Instituto Internacional de la UNESCO para la Educación Superior en América Latina y el Caribe (UNESCO IESALC, 2025), la tasa bruta de matrícula universitaria aumentó de un 49 % en 2015 a un 54,1 % en 2020, lo que equivale a más de 17 millones de estudiantes. En este sentido, el informe señala que “el aumento de las tasas de matriculación oculta disparidades significativas, lo que muestra la necesidad de políticas de apoyo académico y social para garantizar la permanencia y la finalización de los estudios” (UNESCO IESALC, 2025, p. 9). De esta manera, se pone de manifiesto la importancia de diseñar estrategias que permitan identificar y atender a los alumnos en situación de riesgo académico.

En el contexto peruano, la problemática del bajo rendimiento y el riesgo académico es evidente en los indicadores de deserción y permanencia universitaria. Según SUNEDU (2022), aproximadamente el 26 % de los estudiantes de universidades públicas y el 22 % de los de instituciones privadas abandonan sus estudios antes de concluirlos; entre los factores asociados se encuentran el bajo rendimiento académico y las limitaciones económicas (p. 45). Estas cifras reflejan una necesidad urgente de implementar soluciones tecnológicas que permitan detectar tempranamente a los estudiantes en riesgo académico, facilitando la toma de decisiones oportunas por parte de las autoridades universitarias.

Desde sus inicios, la Facultad de Ingeniería de Sistemas e Informática (FISI) de la Universidad Nacional Mayor de San Marcos ha experimentado un crecimiento sostenido en la matrícula estudiantil. Sin embargo, este crecimiento ha venido acompañado de nuevos desafíos en la gestión y el análisis de datos vinculados al rendimiento académico. Según un estudio desarrollado en la facultad, durante el periodo 2004–2014, solo alrededor del 68 % de los estudiantes matriculados lograron culminar sus estudios, lo que representa una tasa de deserción cercana al 32 % (Vega et al., 2022). Esta situación evidencia la necesidad de adoptar medidas preventivas y herramientas de análisis que permitan comprender de manera integral los factores que inciden en el desempeño estudiantil.
## <a name="_heading=h.tkkzzyjz8vbl"></a>**1.2. Definición del Problema**
La Facultad de Ingeniería de Sistemas de la UNMSM requiere un análisis más profundo del rendimiento académico de sus estudiantes. La falta de un sistema centralizado de datos dificulta el análisis integral y profundo de los factores que afectan el rendimiento. Esto impide la identificación de patrones que permitan implementar estrategias eficaces para resolver estas dificultades, lo que genera la necesidad de una herramienta que facilite la toma de decisiones informada y eficiente. 

***Problema general***

¿Cómo identificar a los alumnos en riesgo académico en las universidades?

***Problemas Específicos***

- **Manejo ineficiente de la información académica:** El almacenamiento de datos relevantes como notas, asistencias y faltas en medios no centralizados dificulta un análisis adecuado, lo que retrasa o impide la implementación de estrategias de mejora para los estudiantes.
- **Falta de visualizaciones integrales:** La ausencia de visualizaciones integrales en una universidad implica que no se están utilizando datos de manera efectiva para evaluar el riesgo académico. Esto puede dificultar la toma de decisiones informadas y afectar la calidad educativa. 
- **Ausencia de métricas claras y consistentes:** La falta de indicadores clave de rendimiento (KPI) relacionados con el rendimiento académico dificulta la identificación temprana de los estudiantes en riesgo.
## <a name="_heading=h.e5rqxz6okjes"></a>**1.3. Objetivos**
Desarrollar e implementar una solución de inteligencia de negocios que facilite la toma de decisiones, proporcionando a los administradores educativos información valiosa sobre el rendimiento académico de los estudiantes de la FISI, para que puedan implementar estrategias efectivas.

***Objetivos específicos***

- **Creación de un modelo de repositorio único:** Diseñar un data warehouse centralizada para almacenar y gestionar toda la información académica, facilitando el acceso y análisis de los datos relevantes.
- **Diseñar visualizaciones interactivas:** Desarrollar dashboards interactivos que permitan explorar y comprender el rendimiento académico, facilitando la toma de decisiones.
- **Implementar indicadores de desempeño académico:** Definir e incorporar métricas clave para evaluar el rendimiento de los estudiantes y detectar posibles riesgos académicos de manera temprana.
## <a name="_heading=h.bbp5wj8kbc7k"></a>**1.4. Justificación**
La investigación propuesta tiene como objetivo la implementación de una solución de inteligencia de negocios (BI) en la Facultad de Ingeniería de Sistemas e Informática (FISI) de la Universidad Nacional Mayor de San Marcos, con el fin de mejorar la toma de decisiones relacionadas con el rendimiento académico de los estudiantes. En la actualidad, la facultad enfrenta dificultades para acceder a información clara y actualizada sobre el rendimiento estudiantil, lo que limita la capacidad de los administradores educativos para desarrollar estrategias efectivas.

Desde un enfoque teórico, la inteligencia de negocios ha demostrado ser una herramienta valiosa para convertir grandes cantidades de datos en información útil y procesable, lo que facilita la toma de decisiones estratégicas dentro de una organización. Según el estudio de Alvarado-Apodaca et al. (2023), el uso de herramientas de BI, como Microsoft Power BI, permite generar reportes detallados y en tiempo real que facilitan la toma de decisiones. Este enfoque resulta esencial para la gestión del rendimiento académico en la FISI, ya que proporciona a los administradores una visión clara y precisa de los aspectos que deben ser mejorados.

Desde una perspectiva práctica, esta investigación busca desarrollar una solución de BI que permita a los responsables de la administración educativa acceder a datos clave sobre el rendimiento académico de los estudiantes. Con esta solución, se podrán identificar las áreas que afectan el rendimiento, detectar a los estudiantes con riesgo de abandono académico y mejorar la toma de decisiones para diseñar políticas y estrategias más eficaces. De esta manera, se contribuirá a la mejora del rendimiento académico y la calidad educativa en la facultad, adaptándose a las necesidades específicas de la institución.

Además, la implementación de soluciones de inteligencia de negocios (BI) ha demostrado tener un impacto positivo en la toma de decisiones y en la asignación de recursos en instituciones de educación superior (HEIs). Según un estudio realizado por Hmoud et al. (2023), los factores que influyen en la adopción de BI en las HEIs incluyen el apoyo de la alta dirección y la complejidad de las herramientas toma de decisiones, destacando que las instituciones educativas adoptan BI no solo por presión competitiva, sino principalmente por los beneficios tangibles que ofrece para mejorar la gestión. La FISI, al implementar BI, podría aprovechar estos beneficios para mejorar la toma de decisiones relacionadas con el rendimiento académico y servir como ejemplo para otras facultades que enfrentan desafíos similares.
## <a name="_heading=h.hpqahjqsvgj7"></a>**1.5. Alcances**
La solución de inteligencia de negocios propuesta está dirigida al personal responsable de la coordinación académica, tutoría y administración educativa de la Facultad de Ingeniería de Sistemas (FISI) de la Universidad Nacional Mayor de San Marcos. Con el apoyo de esta implementación, la FISI podrá optimizar el análisis, planificación y mejora continua de los procesos educativos, centrándose en el rendimiento académico de los estudiantes. La solución incluye los siguientes componentes clave:

- Estudio del Estado del Arte
  - Revisión exhaustiva de la literatura académica, investigaciones previas, estándares, y tecnologías relacionadas con la problemática abordada en la tesis.
  - Identificación de enfoques y herramientas utilizadas en soluciones similares para problemas de análisis de datos educativos.
  - Comparativa entre metodologías existentes, seleccionando las más adecuadas para el caso de estudio.
- Data Warehouse con Modelo Dimensional
  - Se construirá un data warehouse diseñado específicamente para el análisis educativo, con un modelo dimensional que facilite consultas y análisis rápidos.
- Procesos ETL
  - Se desarrollará un conjunto robusto de procesos ETL (Extract, Transform, Load) para garantizar la integración, transformación y carga eficiente de datos provenientes de diversas fuentes.
- Minería de datos
  - Se implementarán técnicas de minería de datos con el objetivo de realizar predicciones y obtener insights valiosos a partir de los datos académicos.
- Integración de Herramientas BI
  - Se utilizarán herramientas modernas de BI para el desarrollo de dashboards y reportes.
- Validación y Prueba
  - Realización de pruebas integrales que evaluarán la efectividad y confiabilidad de la solución.
# <a name="_heading=h.tmhf3x9n1nay"></a><a name="_heading=h.xy6ia22s6aq3"></a><a name="_heading=h.l7jyv7gbzcsp"></a>**CAPÍTULO 4: APORTE TEÓRICO**
## <a name="_heading=h.r6ir1kff6qq2"></a>**3.1. El modelo conceptual del aporte**
La solución de Inteligencia de Negocios propuesta para la mejora de la gestión académica en la Facultad de Ingeniería de Sistemas e Informática (FISI) de la UNMSM se articula sobre un modelo integral que combina principios de diseño de *data warehousing* y metodologías de minería de datos. Este modelo está concebido para transformar la información académica fragmentada en *insights* accionables, abordando la problemática, con el objetivo final de optimizar el rendimiento estudiantil y reducir la deserción. La arquitectura global de la solución, sus componentes principales y el flujo de datos se ilustran en la *Fig 3*.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.002.png)

**Fig 3.** *Modelo de la Solución para la Gestión Académica.* 

En la Figura 3 se presenta el modelo conceptual subyacente, el cual se guía por la metodología de Ralph Kimball para el diseño del Data Warehouse y una arquitectura de BI robusta para la integración y procesamiento de datos. Se muestra el flujo de trabajo en etapas secuenciales: Fuentes de datos internas, el proceso de ETL (Extracción, Transformación y Carga), la fase de Almacenamiento en un Data Warehouse centralizado, el módulo de Minería de Datos para la extracción de patrones y predicciones, y finalmente, la Visualización de los resultados a través de Dashboards y Reportes interactivos. El resultado de este proceso es una Solución integral que busca la centralización de datos, la generación de reportes estratégicos y visualizaciones que faciliten la toma de decisiones informadas para mejorar el rendimiento académico.
### <a name="_heading=h.lugwl78xkvj"></a>**3.1.1. Diseño del Data Warehouse con la Metodología de Ralph Kimball**
La construcción del Data Warehouse central para el análisis académico se adhiere rigurosamente a la metodología dimensional de Ralph Kimball. Este enfoque se seleccionó por su probada eficacia en la creación de estructuras de datos intuitivas y de alto rendimiento, optimizadas para consultas analíticas y la generación de reportes estratégicos. La metodología de Kimball prioriza un diseño centrado en el negocio, estructurando los datos en esquemas de estrella que facilitan la comprensión por parte de los usuarios finales y la integración de diversos datos académicos. Esto permite una consolidación eficiente de la información, esencial para superar la problemática de los datos descentralizados y la falta de insights coherentes.![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.003.png)

***Metodología de Ralph Kimball (MediaWiki, 2014)***
## <a name="_heading=h.g5pyjdcib36l"></a>**3.2. Novedad**
La propuesta de solución de Inteligencia de Negocios y minería de datos presentada representa una contribución significativa al a la gestión académica de instituciones de educación superior, particularmente en contextos similares a la FISI de la UNMSM. A diferencia de enfoques existentes que se centran predominantemente en el monitoreo retrospectivo del rendimiento o en aplicaciones parciales de BI (Castillo et al., 2024), nuestra solución integra de manera cohesiva y proactiva la analítica descriptiva con la predictiva.

La principal novedad radica en la integración de un Data Warehouse diseñado bajo los principios de Ralph Kimball con proceso de minería de datos. Esta sinergia permite no solo la consolidación eficiente de datos fragmentados y la generación de reportes estratégicos, sino también la capacidad de generar predicciones tempranas sobre el riesgo de bajo rendimiento. Mientras que otras investigaciones han explorado la predicción de resultados (Phuong et al., 2023) o la optimización de recursos (Bai, 2024), la novedad de este modelo reside en su holismo y aplicabilidad directa a la toma de decisiones proactiva en un contexto universitario específico. Supera las limitaciones de las soluciones que no abordan la integralidad del flujo de datos desde la extracción y consolidación (ETL/DW) hasta la visualización de insights predictivos, y se enfoca en un problema persistente de las universidades públicas: la deserción y el bajo rendimiento por falta de información unificada para actuar a tiempo.
## <a name="_heading=h.gb605fu8odk5"></a>**3.3. Fundamentos**
El modelo de la solución propuesta se sustenta en sólidos fundamentos teóricos de la gestión de datos y la inteligencia de negocios, así como en un conjunto de tecnologías clave que habilitan su implementación:
### <a name="_heading=h.brvz0ppwu6lb"></a>**3.3.1. Fundamentos Teóricos**
- Teoría de Data Warehousing (DW): El modelo se basa en los principios de diseño dimensional, que organizan los datos para facilitar el análisis de grandes volúmenes de información histórica (Duque et al., 2022; Hosen et al., 2024). Esto permite la creación de un repositorio centralizado y consistente, crucial para la toma de decisiones informadas.
- Minería de Datos y Aprendizaje Automático: La capacidad predictiva de la solución se fundamenta en diversas técnicas de minería de datos y algoritmos de aprendizaje automático. Estos principios permiten descubrir patrones, identificar relaciones y construir modelos que pueden pronosticar comportamientos futuros de los estudiantes, como el riesgo de deserción o el éxito académico (Phuong et al., 2023).
- Inteligencia de Negocios (BI) para la Toma de Decisiones: Los principios de BI se aplican para transformar los datos procesados en información significativa mediante dashboards interactivos y reportes (Castillo et al., 2024; Gaftandzhieva et al., 2023). Esto empodera a los administradores y docentes con una visión clara del rendimiento y las tendencias, facilitando decisiones estratégicas y operativas.
### <a name="_heading=h.uii1k93bftn"></a>**3.3.2. Fundamentos Tecnológicos**
La implementación de la solución se apoya en un ecosistema de herramientas tecnológicas seleccionadas por su robustez, escalabilidad y compatibilidad:

- Fuentes de Datos: Se conectará a diversas fuentes de datos internas existentes en la universidad.
- Proceso ETL: Para la extracción, transformación y carga de datos hacia el Data Warehouse, se utilizarán herramientas de SQL Server Integration Services (SSIS). SSIS permite automatizar y gestionar flujos de datos complejos, asegurando la calidad y consistencia de la información cargada (Duque et al., 2022; Hosen et al., 2024).
- Almacenamiento (Data Warehouse): El corazón de la solución es el Data Warehouse implementado en SQL Server. Esta base de datos relacional está optimizada para almacenar grandes volúmenes de datos históricos de manera organizada y eficiente, siguiendo el diseño dimensional (Duque et al., 2022; Hosen et al., 2024).
- Minería de Datos: Para el desarrollo y aplicación de los modelos predictivos, se emplearán lenguajes de programación como Python y/o herramientas especializadas como RapidMiner. Estas plataformas proporcionan librerías y funcionalidades avanzadas para la preparación de datos, la implementación de algoritmos de Machine Learning (ej. regresión logística, *random forests*, redes neuronales) y la evaluación de modelos (Phuong et al., 2023).
- Visualización: La presentación de los *insights* y reportes estratégicos se realizará mediante Microsoft Power BI. Power BI permite la creación de *dashboards* interactivos y personalizables, facilitando la visualización de KPIs de rendimiento académico y los resultados predictivos para una toma de decisiones ágil y basada en datos (Castillo et al., 2024; Duque et al., 2022). La utilización de Visual Studio 2022 complementará el desarrollo de componentes específicos y la integración de soluciones.
## <a name="_heading=h.d5x9ivl5dl3n"></a>**3.4. Componentes/Fases**
La arquitectura propuesta se compone de módulos interconectados que aseguran un flujo de datos continuo desde las fuentes de origen hasta la visualización de insights estratégicos, tal como se detalla en la Figura 3. Cada componente desempeña un rol crucial en el procesamiento y la transformación de los datos académicos:
### <a name="_heading=h.7111ktr2owow"></a>**3.4.1. Fuentes de Datos:**
Este componente representa el origen de toda la información. Incluye los sistemas transaccionales internos de la universidad que contienen datos operativos detallados sobre el historial académico, demográfico y de comportamiento estudiantil. La diversidad de estas fuentes, a menudo descentralizadas y heterogéneas, justifica la necesidad de un proceso de integración robusto.
### <a name="_heading=h.lpbceh8ibv69"></a>**3.4.2. Proceso ETL (Extracción, Transformación y Carga):**
Esta fase es vital para la integración de datos y la preparación para el Data Warehouse.

- Extracción (Extract): Se encarga de la lectura y recolección de datos desde las diversas fuentes internas identificadas.
- Transformación (Transform): Los datos extraídos son limpiados, estandarizados, validados y consolidados para asegurar su calidad y consistencia. 
- Carga (Load): Los datos transformados y preparados son cargados en el Data Warehouse, siguiendo el diseño dimensional previamente establecido. 
### <a name="_heading=h.tl2i6znjsscx"></a>**3.4.3. Almacenamiento (Data Warehouse):**
El Data Warehouse es el repositorio centralizado y optimizado para el análisis de la solución. Diseñado bajo la metodología de Ralph Kimball, organiza los datos en esquemas dimensionales (hechos y dimensiones) que facilitan el acceso rápido y la agregación de información para análisis complejos. Contiene datos históricos consolidados y limpios, fundamentales para el análisis descriptivo y la base para la minería de datos.
### <a name="_heading=h.8prllxbe78k"></a>**3.4.4. Minería de Datos:**
Este módulo desarrolla el modelo predictivo, se emplean algoritmos de aprendizaje automático (como regresión logística, o árboles de decisión), cuyo resultado son insights predictivos que complementan el análisis descriptivo.
### <a name="_heading=h.jjneebomo2u1"></a>**3.4.5. Visualización (Dashboards y Reportes):**
La etapa final del flujo de datos, donde los insights generados son presentados a los usuarios finales (directivos, coordinadores académicos, docentes) de manera interactiva y comprensible.

- Dashboards: Paneles de control interactivos que muestran KPIs clave de rendimiento académico (ej. tasas de aprobación por curso, promedios de notas por cohorte) y visualizaciones de los resultados predictivos (ej. lista de estudiantes en riesgo de deserción con su probabilidad). Permiten una exploración dinámica de los datos.
## <a name="_heading=h.2xgitcr6sm9v"></a>**3.5. Benchmarking**
La solución de Inteligencia de Negocios para la gestión académica propuesta se distingue de otros enfoques presentes en la literatura por su integralidad y su enfoque proactivo en el contexto específico de las universidades públicas.

- Integración de BI y Minería de Datos: Muchos estudios demuestran la efectividad de los *dashboards* para monitorear el rendimiento (Castillo et al., 2024) o aplican algoritmos predictivos para identificar estudiantes en riesgo (Saeedi et al., 2024; Alkattan et al., 2023). Sin embargo, la propuesta actual ofrece una integración de ambos mundos. Esto permite que las decisiones no solo se basen en lo que ha pasado, sino en lo que podría pasar.
- Enfoque en Contextos Específicos y Desafíos Reales: Si bien existen modelos de BI y DM en diferentes universidades (Júnior et al., 2022), nuestra propuesta está diseñada para abordar directamente los desafíos identificados en la FISI de la UNMSM. 

En síntesis, la propuesta se posiciona como una solución integral que, si bien se basa en principios y tecnologías existentes, innova al integrar de manera robusta la analítica descriptiva bajo metodologías estándar, abordando un problema crítico en un contexto universitario específico y ofreciendo un soporte a la toma de decisiones y proactivo que las soluciones previamente documentadas.
# <a name="_heading=h.weyqr3swyakr"></a>**CAPÍTULO 5: APORTE PRÁCTICO**
## <a name="_heading=h.585xqyl2mssz"></a>**4.1. Planificación del proyecto**
### <a name="_heading=h.nj8p667hdns0"></a>**4.1.1. Definir el alcance**
El producto a implementar es un sistema de Inteligencia de Negocios que permitirá tanto el análisis descriptivo y predictivo del rendimiento académico en la Escuela Profesional de Ingeniería de Sistemas de la FISI. La solución integrará información socioeconómica y académica con el fin de permitir decisiones institucionales.

La aplicación final incluirá paneles interactivos y reportes descriptivos construidos en Power BI, así como modelos predictivos desarrollados en Python. Estos modelos permitirán estimar la probabilidad de aprobación de los estudiantes y predecir su promedio según factores contextuales.

La solución se desarrollará utilizando herramientas como SQL Server, SSIS, Visual Studio y Power BI, integrando además scripts de Python. La información será extraída, transformada y cargada.
### <a name="_heading=h.uymi1b9j4x05"></a>**4.1.2. Actores clave**
`	`El Vicedecanato Académico tiene un papel esencial en identificar situaciones críticas que influyen en el rendimiento estudiantil y proponer medidas correctivas en un contexto institucional y estratégico. Su participación es esencial para validar los hallazgos y fomentar la toma de decisiones informada.

Dentro del Vicedecanato, la Unidad de Bienestar detecta oportunamente a los estudiantes con bajo rendimiento académico e indaga en factores sociales que puedan estar influyendo negativamente en su progreso. Asimismo, la Unidad UNAYOE brinda acompañamiento psicológico personalizado y realiza un seguimiento continuo mediante el análisis del historial de notas y reuniones periódicas con los estudiantes.

En la *Fig 4* se puede ver cada uno de los actores con sus respectivas funcionalidades enfocadas en el rendimiento académico.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.004.png)

**Fig 4.** *Actores involucrados en el rendimiento académico en la FISI*
### <a name="_heading=h.6e1q75sgz0bk"></a>**4.1.3. Identificar tareas**
1) Identificación de los Requerimientos e indicadores
   1) Identificación de fuentes de datos
   1) Análisis de requerimientos
   1) Identificación de indicadores clave (KPIs)
1) Modelado Dimensional del Data Warehouse
   1) Diseño del modelo dimensional (modelo estrella)
   1) Diccionario de datos
1) Desarrollo del proceso etl
   1) Extracción y transformación de datos
   1) Carga en el DW
1) Minería de datos /análisis descriptivo
   1) Preparación de los Datos para Minería
   1) Selección de Técnicas
   1) Implementación del Modelo Predictivo
1) Visualización
   1) Diseño de Dashboards Descriptivos
   1) Diseño de Dashboards Predictivos
### <a name="_heading=h.sj8v3tp9flqx"></a>**4.1.4. Programar tareas**
**Tabla 8**

*Programación de tareas*

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.005.png)

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.006.png)

Nota: Cronograma de tareas para la implementación de la solución
## <a name="_heading=h.1psosajk2f0i"></a>**4.2 Requerimientos**
### <a name="_heading=h.2zb91o0tg8m"></a>**4.2.1 Requerimientos Funcionales**
**Tabla 9 .** *Requerimientos funcionales*

||**Categoría**|**Requerimientos**|
| :- | :-: | :-: |
|*RF01*|Visualización del Rendimiento Académico|El sistema debe mostrar un dashboard general del rendimiento académico por periodo (2020–2024) para los estudiantes del 5to ciclo.|
|*RF02*|Visualización del Rendimiento Académico|El sistema debe mostrar el rendimiento académico por curso, incluyendo nota de evaluación continua, parcial, final, nota final y asistencia.|
|*RF03*|Visualización del Rendimiento Académico|El sistema debe permitir comparar el rendimiento académico entre años, modalidad de ingreso.|
|*RF04*|Análisis de Factores Socioeconómicos|El sistema debe cruzar el rendimiento académico con variables socioeconómicas para visualizar cómo influyen en el desempeño.|
|*RF05*|Minería de Datos|El sistema debe aplicar minería de datos para agrupar estudiantes con patrones académicos similares y detectar perfiles de riesgo.|
|*RF06*|Toma de Decisiones Estratégicas|El sistema debe permitir visualizar indicadores clave de rendimiento que apoyen la toma de decisiones académicas|
|*RF07*|Generación de Reportes|El sistema debe permitir filtrar reportes por modalidad de ingreso, situación académica y otros criterios relevantes.|

Nota: Los requerimientos funcionales listados serán aplicados a la solución.
### <a name="_heading=h.mn74nkqgisip"></a>**4.2.1 Requerimientos no funcionales**
**Tabla 10 .** *Requerimientos no funcionales*

||**Categoría**|**Requerimientos**|
| :- | :-: | :-: |
|*RNF-1*|Usabilidad|El sistema debe permitir ser usado intuitivamente por cualquier usuario.|
|*RNF-2*|Accesibilidad|El sistema permitirá a los usuarios realizar búsquedas sin previo entrenamiento.|
|*RNF-3*|Restricciones del diseño|La aplicación se desarrollará con la herramienta PostgreSQL Y Power BI|
|*RNF-4*|Requisitos del Sistema|El sistema debe trabajar sobre cualquier computador que cuente con estos requerimientos mínimos con procesador Corei3 o superior, 8 GB de memoria RAM|
|*RNF-5*|Rendimientos|El rendimiento del Data Warehouse debe ser superior a las herramientas utilizadas para la consulta.|
|*RNF-6*|Herramientas|El Data Warehouse se construirá sobre una base de datos SQL server, utilizando herramientas de Business Intelligence compatibles con SQL server, como SQL Server Management Studio para la gestión de base de datos y SQL Server Integration Services (SSIS) para el desarrollo y construcción del modelo dimensional.|

Nota: Los requerimientos no funcionales listados se implementarán según lo establecido.
## <a name="_heading=h.c0fihg3m41hl"></a>**4.3 Modelo Dimensional**
Para realizar el modelo dimensional se tomó en cuenta lo siguiente:
### <a name="_heading=h.w48a0fo31os3"></a>**4.3.1 Rendimiento Académico** 
En este modelo, nos enfocamos directamente en el rendimiento académico de los estudiantes. Esto incluye aspectos fundamentales como las calificaciones asignadas por los docentes, la relación de los estudiantes con los cursos que eligen, y el análisis del desempeño académico a lo largo del tiempo.
### <a name="_heading=h.p2mwanae71y2"></a>**4.3.2 Establecimiento del nivel de detalle**
Una vez que hemos establecido el proceso de negocio, el siguiente paso es decidir el nivel de detalle que necesitamos en el modelo de datos. Siguiendo la metodología de Kimball, se recomienda usar un nivel de detalle bajo, lo que implica que la información debe ser lo más precisa y específica posible. Este enfoque permite analizar los datos de manera flexible y responder a preguntas complejas que no podrían resolverse con modelos más simplificados. Al tener detalles más finos, el modelo es capaz de ofrecer análisis mucho más profundos.
### <a name="_heading=h.6xe9fp2z0vnb"></a>**4.3.3 Elección del modelo: Diseño Estrella**
Para estructurar nuestros datos, hemos optado por el diseño estrella, un modelo ampliamente utilizado por su simplicidad y eficiencia a la hora de realizar consultas analíticas. En este diseño, tenemos una tabla central de hechos que almacena las medidas cuantitativas, como las calificaciones obtenidas por los estudiantes. Alrededor de esta tabla central, se encuentran las tablas de dimensiones, que proporcionan información descriptiva, como los detalles de los estudiantes, los docentes y los cursos.
### <a name="_heading=h.rjqoujrve5lj"></a>**4.3.4 Dimensiones**
En este modelo se seleccionaron cinco dimensiones las cuales son:

1) Alumnos: Información detallada sobre los estudiantes, tomando en cuenta datos relevantes como los socioeconómicos  y factores como el interés.
1) Profesor: Los datos de los profesores que imparten cursos, con lo cual se puede analizar diferentes aspectos.
1) Tiempo: Evalúa el desempeño académico a lo largo de los años.
1) Ciclo: Los ciclos académicos en el cual los estudiantes se inscriben, permitiendo así el análisis por ciclo.
1) Curso: Información sobre las materias que los estudiantes están cursando, importante para conocer el desempeño por curso.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.007.png)

**Fig 5.**  *Diagrama de Entidad-Relación del Modelo Dimensional*
### <a name="_heading=h.oo57pqlrkqzq"></a>**4.3.5. Atributos de las Dimensiones y Métricas de la Tabla de Hechos**
A continuación, se presenta una tabla que detalla los atributos de cada dimensión y las métricas asociadas a la tabla de hechos.

**Tabla 11 .** *Hecho Rendimiento Académico*

|**Hecho: Rendimiento Académico**||
| :- | :- |
|**Métrica**|**Descripción**|
|Porcen\_Asistencia|Porcentaje de asistencia de los alumnos.|
|Nota\_parcial|Nota del examen parcial.|
|Nota\_final|Nota del examen final.|
|Nota\_continua|Nota de la evaluación continua.|
|Promedio|Promedio general del curso.|
|**Dimensiones**||
|**Nombre de la dimensión**|**Niveles**|
|Alumno|Id\_Alumno, Nombre, Apellido\_p, Apellido\_m, Dni, Sexo, Correo, Domicilio, Fecha\_nac, Lug\_nac, Telefono, Estado\_civil, Colegio\_proce, Situacion\_aca, Modal\_ingreso, Factor\_economico, Factor\_interes, Factor\_transporte, Factor\_recursos\_estudios, Factor\_vivienda|
|Profesor|Id\_profesor, Nombre, Apellido\_p, Apellido\_m, Dni, Cod\_profesor, Titulos, Fecha\_nac, Correo|
|Tiempo|Id\_tiempo, Año, Semestre|
|Curso|Id\_curso, Nombre\_curso, Cod\_curso, Creditos, Seccion|
|Ciclo|Id\_ciclo, Valor\_ciclo, Periodo\_Academico|

Nota: Se muestra el Hecho Rendimiento Académico
### <a name="_heading=h.9jfcjp47yz5n"></a>**4.3.6. Diagrama Físico**
![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.008.png)

**Fig 6.** *Diagrama Físico - Hechos Rendimiento* 
## <a name="_heading=h.atxb0mogz1id"></a>**4.4 Diseño Físico**
**Tabla 12**. *Dimension Alumno*

|**Dimensión**|**Alumno**||||
| :- | :- | :- | :- | :- |
||Dimensión que contiene los datos de los estudiantes||||
|***NombreCampo***|***Nulidad***|***Tipo***|***Entidad***|***Descripción***|
|*Is\_Alumno*|Not null|int|PK|Identificador único del alumno.|
|*Nombre*|Not null|Varchar||Nombre del alumno.|
|*Apellido\_p*|Not null|Varchar||Apellido paterno del alumno.|
|*Apellido\_m*|Not null|Varchar||Apellido materno del alumno.|
|*Dni*|Not null|int||Documento Nacional de Identidad del alumno.|
|*Sexo*|Not null|Char(1)||Sexo del alumno (M/F).|
|*Correo*|Not null|Varchar||Correo electrónico del alumno.|
|*domicilio*|Not null|Varchar||Domicilio del alumno.|
|*Fecha\_nac*|null|Date||Fecha de nacimiento del alumno.|
|*Lugar\_nac*|Not null|Varchar||Lugar de nacimiento del alumno.|
|*Telefono*|null|int||Teléfono de contacto del alumno.|
|*Estado\_civil*|null|Varchar||Estado civil del alumno.|
|*Colegio\_proce*|Not null|Varchar||Colegio de procedencia del alumno.|
|*Situacion\_aca*|Not null|Varchar||Estado en el que se encuentra el alumno|
|*Modal\_ingreso*|Not null|Varchar||Modo de ingreso del alumno|
|*Factor\_economico*|Not null|Varchar||Factor económico del alumno.|
|*Factor\_interes*|Not null|Varchar||Factor de interés del alumno.|
|*Factor\_Trasporte*|Not null|int||Factor transporte del alumno.|
|*Factor\_resursos\_estudio*|Not null|Varchar||Factor recursos de estudio del alumno|
|*Factor\_vivienda*|Not null|Varchar||Factor vivienda del alumno|

Nota: Se muestra la estructura física de la dimensión Alumno

**Tabla 13.** *Dimension Profesor*

|**Dimensión**|**Profesor**||||
| :- | :- | :- | :- | :- |
||Dimensión que contiene los datos de los Docentes||||
|***NombreCampo***|***Nulidad***|***Tipo***|***Entidad***|***Descripción***|
|*id\_profesor*|Not null|Int|PK|Identificador único del profesor.|
|*Nombre*|Not null|Varchar||Nombre del profesor.|
|*Apellido\_p*|Not null|Varchar||Apellido paterno del profesor.|
|*Apellido\_m*|Not null|Varchar||Apellido materno del profesor.|
|*Dni*|Not null|int||Documento Nacional de Identidad|
|*Cod\_profesor*|Not null|Varchar||Código único del profesor.|
|*Títulos*|Null|Varchar||Títulos académicos del profesor.|
|*Fecha\_nac*|Null|Date||Fecha de nacimiento del profesor.|
|*Correo*|Not null|Varchar||Correo electrónico del profesor.|

Nota: Se muestra la estructura física de la dimensión profesor

**Tabla 14.** *Dimension Curso*

|**Dimensión**|**Curso**||||
| :- | :- | :- | :- | :- |
||Dimensión que contiene los datos de los estudiantes||||
|***NombreCampo***|***Nulidad***|***Tipo***|***Entidad***|***Descripción***|
|*id\_curso*|<p>Not null</p><p></p>|int|PK|Identificador único del curso.|
|*Nombre\_curso*|Not null|Varchar||Nombre del curso.|
|*Cod\_curso*|Not null|Varchar||Código único del curso.|
|*Créditos*|Not null|int||Número de créditos que otorga el curso.|
|*Sección*|Not null|int||Sección del curso.|

Nota: Se muestra la estructura física de la dimensión curso

**Tabla 15.** *Dimension Ciclo*

|**Dimensión**|**Ciclo**||||
| :- | :- | :- | :- | :- |
||Dimensión que contiene los datos de los estudiantes||||
|***NombreCampo***|***Nulidad***|***Tipo***|***Entidad***|***Descripción***|
|*Id\_ciclo*|Not null|int|PK|Identificador único del ciclo académico.|
|*valor\_ciclo*|Not null|int||Número del ciclo.|
|*Peridodo\_Academico*|Not null|varchar||Periodo académico relacionado con el ciclo |

Nota: Se muestra la estructura física de la dimensión ciclo

**Tabla 16.** *Dimensión Tiempo*

|**Dimensión**|**Tiempo**||||
| :- | :- | :- | :- | :- |
||Dimensión que contiene los datos de los estudiantes||||
|***NombreCampo***|***Nulidad***|***Tipo***|***Entidad***|***Descripción***|
|*Id\_tiempo*|Not null|int|PK|Identificador único para el registro de tiempo.|
|*Año*|<p>Not null</p><p></p><p></p>|int||Año correspondiente al registro de tiempo.|
|*Semestre*|<p>Not null</p><p></p><p></p>|int||Semestre correspondiente (1 o 2).|

Nota: Se muestra la estructura física de la dimensión Tiempo

**Tabla 17.** *Hecho Rendimiento académico*

|**Dimensión**|**Rendimiento Académico**||||
| :- | :- | :- | :- | :- |
||Dimensión que contiene los datos de los estudiantes||||
|***NombreCampo***|***Nulidad***|***Tipo***|***Entidad***|***Descripción***|
|*Id\_hecho*|Not null|int|PK|identificador de la tabla rendimiento académico.|
|*Id\_ciclo*|Not null|int|FK|Referencia al identificador del ciclo académico en Dim\_Ciclo.|
|*Id\_tiempo*|Not null|int|FK|Referencia al identificador de tiempo en la tabla Dim\_Tiempo.|
|*Id\_curso*|Not null|int|FK|Referencia al identificador del curso en la tabla Dim\_Curso.|
|*Id\_profesor*|Not null|int|FK|Referencia al identificador del profesor en la tabla Dim\_Profesor.|
|*Id\_Alumno*|Not null|int|FK|Referencia al identificador del alumno en la tabla Dim\_Alumno.|
|*Porcentaje\_Asistencia*|Null|float||Porcentaje de asistencias por alumno.|
|*Nota\_Parcial*|Null|float||Nota obtenida en la evaluación parcial del curso.|
|*Nota\_continua*|Null|float||Nota obtenida en las evaluaciones continuas del curso.|
|*Nota\_Final*|Null|float||Nota obtenida en la evaluación final del curso.|
|*Promedio*|Null|float||Nota promedio final calculada a partir de las notas.|

Nota: Se muestra la estructura física del hecho Rendimiento académico
## <a name="_heading=h.w94i2ewjdeai"></a>**4.5 Proceso de ETL**
Para el proceso de extracción, transformación y carga (ETL) de los datos, se utilizó SSIS (SQL Server Integration Services) como herramienta, aprovechando la compatibilidad que tiene con SQL Server. Los procesos que se realizaron para el flujo de control se muestran a continuación:

- Limpieza de Tabla Hechos: A través de una tarea SQL, se realizó una limpieza previa de los datos en la tabla de hechos antes de proceder con la carga. Esta limpieza asegura que los datos no duplicados y no válidos sean eliminados, mejorando la calidad de la información que se almacenará en la tabla de hechos.
- Limpieza de Dimensiones: Similar al proceso de la tabla de hechos, se ejecutó una tarea SQL para limpiar las tablas de dimensiones antes de cargarlas. Esto garantiza que las dimensiones estén libres de inconsistencias y que no haya registros redundantes que puedan afectar el rendimiento y la precisión de los análisis posteriores.
- De forma paralela:
  - Carga de Dimensión Curso: Se cargaron los datos de la dimensión Curso, asegurando que se incluyeran todos los detalles de los cursos disponibles en el sistema académico, como el nombre, código y duración. Esta dimensión es crucial para conectar las métricas con los cursos específicos en los que los estudiantes están inscritos.
  - Carga de Dimensión Ciclo: Se realizó la carga de la dimensión Ciclo, la cual contiene información sobre los ciclos académicos en los que los estudiantes cursan. Esta dimensión permite analizar el rendimiento por período académico.
  - Carga de Dimensión Tiempo: Se cargó la dimensión Tiempo, que incluye detalles específicos de cada curso. Esta dimensión es fundamental para realizar análisis temporales.
  - Carga de Dimension Profesor: La carga de la dimensión Profesor incluye la información relevante sobre los docentes. Esta dimensión permite analizar cómo las calificaciones y el rendimiento de los estudiantes varían dependiendo del profesor.
  - Carga de Dimension Alumno: Finalmente, se cargaron los datos correspondientes a la dimensión Alumno, que contiene información sobre los estudiantes, como sus identificaciones y características socioeconómicas. Esta dimensión es clave para realizar análisis por estudiante, incluyendo su rendimiento en cada curso o ciclo académico.
- Carga de la tabla hechos: Esta tabla se carga al final del proceso, una vez que todas las dimensiones estén cargadas y validadas. El motivo de este orden es evitar problemas con las llaves foráneas, ya que las tablas de hechos deben estar relacionadas con las dimensiones a través de las claves que estas dimensiones generan. Si la tabla de hechos se carga antes de las dimensiones, podrían generarse inconsistencias o errores debido a la falta de coincidencia de las claves.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.009.jpeg)

**Fig 7.** *Flujo de control*

En cada flujo de datos, en la *Fig 7*, se encuentra:

- Origen de Excel: El proceso comienza con la lectura de datos desde un archivo Excel. Aquí, se extraen los datos relevantes que serán utilizados en el proceso de transformación. Este paso asegura que los datos provenientes de fuentes externas se carguen correctamente en el flujo.
- Ordenar: Una vez extraídos los datos del archivo Excel, se pasa por una tarea de ordenación. En esta fase, los datos son organizados de acuerdo a criterios definidos previamente. El objetivo de este paso es preparar los datos para su posterior carga de manera ordenada y eficiente.
- Destino de OLE DB: Finalmente, después de ordenar los datos, se cargan en el destino de OLE DB. Este paso asegura que los datos transformados y ordenados se inserten en la base de datos de destino. OLE DB es utilizado para establecer la conexión con la base de datos, y aquí se realiza la carga definitiva de los datos procesados.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.010.png)

**Fig 8.** *Flujo de datos de la Dimensión Alumno*

De forma predeterminada, SSIS (SQL Server Integration Services) incluye mecanismos que previenen la carga de datos incorrectos o incompletos en el flujo ETL. Este sistema no permite el paso de datos nulos, registros que no cumplan con el formato correcto o identificadores repetidos. Si se detecta cualquier inconsistencia, como valores nulos en campos obligatorios o registros con IDs duplicados, SSIS rechaza esos datos antes de que lleguen al destino de carga. Por lo cual de esta forma esta herramienta ya de por sí sola no acepta ninguna clase de error a la hora de revisar los datos y conexiones.
## <a name="_heading=h.5qwql8hm8kju"></a>**4.6. Predicción del Desempeño Académico**
En el contexto de la predicción del rendimiento académico de los estudiantes, se desarrollaron dos modelos para abordar diferentes aspectos del desempeño en función de diferentes variables.
### <a name="_heading=h.4pe8kl7xtvv6"></a>**4.6.1 Predicción de si un alumno aprueba o no un curso**
El primer modelo tiene como objetivo predecir si un estudiante aprobará o no el curso. Este proceso se divide en dos fases principales: el preprocesamiento de los datos y la aplicación del modelo.

*Preprocesamiento*

- División de datos: Para garantizar la capacidad de generalización del modelo, se dividieron los datos en un 70% para entrenamiento y un 30% para prueba. De esta manera, el modelo se entrena con un conjunto de datos y se evalúa con otro independiente.
- Creación de nueva columna: Se creó a partir de la variable ‘Promedio’, una variable de salida en la cual si la nota es mayor o igual a once sale ‘1’ o caso contrario ‘0’, esto nos ayudará para esta predicción binaria.
- Codificación: Una de las variables en el modelo fue 'Sexo'. Para poder usarla en el modelo, se transformó esta variable categórica en valores numéricos (por ejemplo, 0 para femenino y 1 para masculino) mediante una técnica de codificación.

*Aplicación del modelo: Regresión Lineal*

Para este caso, se eligió un modelo de regresión logística. La regresión logística es ideal para problemas de clasificación binaria y proporciona probabilidades sobre las predicciones, lo que facilita la toma de decisiones sobre el rendimiento de los estudiantes.

- Variables: Las variables utilizadas para la predicción son 'Id\_curso', 'Id\_profesor', 'Año', 'Sexo', 'Semestre', 'Porcentaje\_Asistencia', 'Nota\_parcial' y 'Nota\_continúa'. 
- Métrica Evaluada: Se utilizó la accuracy como métrica para evaluar el desempeño del modelo. En este caso, el modelo alcanzó una precision del 94% (accuracy = 0.94), lo que significa que fue capaz de clasificar correctamente el 94% de las veces si un estudiante aprobaría o no.
### <a name="_heading=h.ox9p6ryqrhi3"></a>**4.6.2 Predicción de promedio dependiendo de los factores socioeconómicos**
El segundo modelo tiene como objetivo predecir la nota promedio del estudiante en función de diferentes factores socioeconómicos. Este modelo es un poco más complejo, ya que involucra una variable continua (la nota promedio).

*Preprocesamiento*

- División de datos: Al igual que en el primer modelo, los datos fueron divididos en un 70% para entrenamiento y un 30% para prueba. Esto asegura que el modelo se entrene en una parte de los datos y se valide en otra parte que no haya visto antes, lo que ayuda a evitar sobreajuste.
- Codificación: Dado que algunas de las variables socioeconómicas son categóricas, se utilizaron técnicas como LabelEncoder para convertirlas en valores numéricos. Las variables transformadas son 'Factor\_economico', 'Factor\_interes', 'Factor\_vivienda', 'Factor\_recursos\_estudios'.

*Aplicación del modelo: Random Forest*

El Random Forest es muy efectivo para manejar relaciones no lineales entre las variables y para manejar grandes volúmenes de datos con varias características.

- Variables: Las variables consideradas en el modelo son 'Factor\_economico', 'Factor\_interes', 'Factor\_vivienda', 'Factor\_recursos\_estudios', 'Sexo', 'Nota\_parcial', 'Nota\_continúa' y 'Porcentaje\_Asistencia'. Estas variables proporcionan información integral sobre el entorno socioeconómico y académico del estudiante.
- Métrica Evaluada: En este caso, se utilizó el Coeficiente de Determinación (R²) como métrica para evaluar el desempeño del modelo. Este coeficiente mide qué tan bien las variables independientes explican la variabilidad de la variable dependiente. Un valor de R² de 0.95 indica que el modelo es extremadamente efectivo para predecir la nota promedio del estudiante, ya que el 95% de la variabilidad de la nota está explicada por las variables utilizadas.
## <a name="_heading=h.dcx2w4o8fd3p"></a>**4.7. Diseño de la Arquitectura Técnica**
En la *Fig 9* se presenta la arquitectura técnica de la solución, compuesta por cinco etapas: fuentes de datos, ETL, almacenamiento, minería de datos y visualización. Los datos del sistema SUM y Excel son transformados con Visual Studio, almacenados en SQL Server y analizados con Python. Finalmente, los resultados se visualizan en dashboards interactivos mediante Power BI.![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.011.png)

**Fig 9.** *Arquitectura de la solución*
# <a name="_heading=h.m6vt1b50ijrg"></a>**CAPÍTULO 6: VALIDACIÓN**
Este capítulo se dedicará a la validación del modelo de inteligencia de negocios, un paso fundamental para confirmar su viabilidad y rendimiento. La validación se llevará a cabo a través de una serie de pruebas diseñadas para evaluar dos aspectos críticos del sistema: su eficiencia operativa, entendida como la capacidad de integrar datos y ofrecer visualizaciones en tiempos adecuados para el usuario, y la precisión del modelo, referida al nivel de exactitud de las predicciones.
## <a name="_heading=h.tu4dty54i2jt"></a>**6.1 Instancia de prueba**
La instancia de prueba se determina por un estudiante de la Facultad de Ingeniería de Sistemas e Informática (FISI) de la Universidad Nacional Mayor de San Marcos

*Solución esperada*

El sistema de BI debe apoyar la toma de decisiones académicas, mostrando de forma clara si este estudiante se encuentra o no en condición de riesgo. A partir de la integración de los datos, se espera que los resultados permitan identificar a los alumnos que requieren acciones preventivas y de acompañamiento, contribuyendo a la gestión institucional del rendimiento académico.

Se trabajó con un total de 250 instancias simuladas, cada una correspondiente a un alumno del quinto ciclo de estudios. Los datos fueron generados de manera simulada, pero siguiendo la estructura, atributos y formatos que se obtienen en el Sistema Único de Matrícula (SUM) de la universidad, a fin de asegurar coherencia y realismo en la información utilizada. 

El uso de datos simulados se justifica por la imposibilidad de acceder a información real debido a restricciones de confidencialidad. Esta misma estrategia ha sido aplicada en investigaciones similares, como la tesis de Xiloj López (2025) en la Universidad de San Carlos de Guatemala, donde se generaron datos sintéticos basados en la estructura de sistemas financieros reales para implementar y validar una solución de Business Intelligence mediante Data Lake y Power BI.

En ambos casos, el uso de datos simulados estructurados permite verificar el funcionamiento del modelo de Data Warehouse, los procesos ETL y los dashboards, garantizando la validez técnica de la propuesta aun sin acceso a información confidencial.

Las variables consideradas abarcan:

- Datos generales: nombre, apellido, edad, DNI, entre otros. Tal como se muestra en la *Fig 10*.
- Datos académicos: promedio final del curso, porcentaje de asistencia, nota continua, nota final, entre otras.
- Factores socioeconómicos: nivel económico, disponibilidad de recursos tecnológicos y situación laboral del estudiante.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.012.png)

**Fig 10**. *Datos simulados de los alumnos*

*Aplicación de las instancias*

El modelo de Business Intelligence se ejecutó sobre este conjunto de 250 registros simulados, permitiendo generar dashboards y reportes que integran tanto los datos académicos como los factores socioeconómicos. Con ello, se buscó observar patrones generales en la población simulada y, al mismo tiempo, analizar casos individuales de riesgo académico.

## <a name="_heading=h.40emdqz42f83"></a>**6.2 Métricas (indicadores)**
Para la validación de la solución propuesta, se definió un conjunto de métricas clave que permiten medir el rendimiento de cada componente del sistema de Business Intelligence (BI). Para una evaluación más rigurosa, este proceso se dividió en dos partes, enfocadas en el modelo descriptivo y el modelo predictivo, respectivamente. El siguiente cuadro resume la operacionalización de cada indicador, detallando las fórmulas empleadas y el tipo de variable asociada.

**Tabla 18.** *Cuadro de dimensiones y métricas de validación del modelo*

|**Dimensión**|**Subdimensión**|**Indicador**|**Operacionalización**|
| :-: | :-: | :-: | :-: |
|Rendimiento del modelo descriptivo|Visualización e Interacción|Tiempo de ejecución del proceso ETL|Tiempo de ejecución = (TE + TT + TL)|
|||Tiempo de respuesta de las visualizaciones|Tiempo de respuesta = Consulta DAX + Presentación Visual + Otros Tiempos|
|||Número de indicadores establecidos|N° i = número de indicadores definidos (3 < N° i < 10)|
|Rendimiento del modelo predictivo|Precisión de las predicciones|Porcentaje de aciertos del modelo|𝐴𝑐𝑐𝑢𝑟𝑎𝑐𝑦 = (𝑇𝑃 + 𝑇𝑁) / 𝑛|
||Generalización del modelo|Porcentaje de casos positivos correctamente identificados|𝑅𝑒𝑐𝑎𝑙𝑙 = 𝑇𝑃 / (𝑇𝑃 + 𝐹𝑁)|

Nota: Elaboración propia a partir de los indicadores definidos para la validación del modelo

A continuación, se detallan las métricas específicas de cada componente del modelo.
### <a name="_heading=h.e6qa5bkafslg"></a>**6.2.1. Métricas del Rendimiento Descriptivo**
El rendimiento del modelo descriptivo se evaluó mediante: 

*Visualización e Interacción*

La dimensión visualización e interacción evalúa la capacidad del sistema de BI de presentar información consolidada en formatos gráficos que faciliten la interpretación y la toma de decisiones. Una visualización efectiva no solo implica representar datos, sino también garantizar rapidez en la respuesta, fluidez en la navegación y capacidad de interacción en tiempo real (Kethavath, 2025).

- Indicador Tiempo de ejecución del proceso ETL: Este indicador mide la eficiencia operativa de la integración, expresándose en segundos o minutos según el tamaño de los datasets procesados. Una reducción en este tiempo refleja mayor rendimiento y escalabilidad del sistema de BI (Farhan, Youssef & Abdelhamid, 2024).

` `Tiempo de ejecución =Σ(TE+TT+TL)

TE = Tiempo de extracción

TT = Tiempo de transformación

TL = Tiempo de carga

- Indicador Tiempo de respuesta de las visualizaciones: Este indicador mide el intervalo que transcurre desde la solicitud de un reporte hasta que el sistema entrega la información visualizada. De acuerdo con la documentación técnica de Microsoft (2025), es fundamental evaluar y supervisar este tiempo, ya que un rendimiento óptimo en la generación de reportes garantiza que los usuarios reciban la información de forma rápida y eficiente.

Tiempo de Respuesta =TC+TP+TO

TC = Tiempo de Consulta DAX

TP = Tiempo de  Presentación Visual

TO = Otros Tiempos

- Número de indicadores definidos: mide cuántos indicadores de rendimiento académico han sido establecidos e implementados dentro del sistema de inteligencia de negocios. Este valor permite determinar si el sistema cuenta con la cantidad adecuada de métricas para ofrecer un análisis completo sin sobrecargar al usuario. Según Efy (2023) y Berglund, Tenic (2020), lo recomendable es mantener entre cinco y diez indicadores, ya que este rango favorece la claridad, evita la saturación de información y garantiza que los usuarios se concentren en los datos más relevantes para una toma de decisiones efectiva.

  N° i = número de indicadores definidos

  3 < N° i <10
### <a name="_heading=h.147yyku9tmzf"></a>**6.2.2. Métricas del Rendimiento Predictivo**
El rendimiento del modelo predictivo se evaluó considerando: la precisión de las predicciones y generalización del modelo.

*Precisión de las predicciones*

La precisión se refiere a la capacidad del modelo de clasificar correctamente tanto los casos positivos como negativos. En el estudio de Orrego Granados et al. (2022), esta métrica se empleó para evaluar qué tan exacto era el modelo al predecir el rendimiento académico de los estudiantes.

- Indicador Porcentaje de aciertos del modelo: Este indicador mide la proporción de predicciones correctas frente al total de observaciones evaluadas.

Accuracy =TP+TNn 

donde TP representa los verdaderos positivos, TN los verdaderos negativos y n el número total de observaciones. Esta métrica permitió a los autores verificar la exactitud global de los modelos predictivos aplicados en el estudio (Orrego Granados et al., 2022).

*Generalización del modelo*

La generalización hace referencia a la capacidad del modelo para detectar correctamente los casos positivos, es decir, identificar a los estudiantes que realmente se encuentran en riesgo académico. Según Orrego Granados et al. (2022), este indicador es fundamental para garantizar que el modelo no solo aprenda de los datos de entrenamiento, sino que también pueda aplicarse a nuevos conjuntos de datos.

- Indicador Porcentaje de casos positivos correctamente identificados: Este indicador mide la proporción de verdaderos positivos frente a todos los casos positivos presentes en los datos.

Recall =TPTP + FN 

donde TP corresponde a los casos positivos correctamente detectados y FN a los casos positivos que el modelo no logró identificar. En el estudio, esta métrica permite validar la capacidad de generalización del modelo predictivo aplicado a datos académicos (Orrego Granados et al., 2022).

Indicadores de la variable dependiente
## <a name="_heading=h.mxqbn6boo0pv"></a>**6.3 Prueba**
Para la validación de la solución propuesta, se realizaron pruebas tanto sobre el modelo descriptivo como sobre el predictivo. Estas pruebas se ejecutaron usando las 250 instancias simuladas de alumnos de la FISI (quinto ciclo), y sus resultados se presentan a continuación a través de los paneles del dashboard diseñados para este propósito.

**6.3.1 Paneles de rendimiento descriptivo**

En la *Fig 11* se puede tener una visión global de los estudiantes, permitiendo explorar de forma detallada su situación académica. Se incluyen campos como el nombre, curso, docente, año, trimestre, estado académico y porcentaje de asistencia. Además, se presentan filtros interactivos que permiten segmentar los datos por género, colegio de procedencia y sección.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.013.png)

**Fig 11**. *Información general de alumnos*

En la parte superior de la Fig 11 se muestran indicadores clave como el promedio general de notas, el total de profesores y el porcentaje total de aprobados. Esta información permite tener un panorama inicial del rendimiento académico que sirve como base para realizar análisis más específicos en las siguientes páginas.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.014.png)

**Fig 12.** *Promedio académico por curso, modalidad de ingreso, semestre y profesor*

La Fig 12 nos permite analizar el promedio de notas de los estudiantes desde distintas dimensiones clave. Se muestra el promedio por curso, lo que permite identificar qué asignaturas presentan mayores o menores niveles de desempeño general. 

Asimismo, se incluye el análisis del promedio según la modalidad de ingreso (ordinario, traslado externo o interno, y CEP), por semestre académico y por docente responsable. Esta vista integral facilita comprender cómo varían los resultados académicos según el tipo de ingreso, la temporalidad o el enfoque de cada profesor.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.015.png)

**Fig 13.** *Relación entre asistencia y rendimiento académico*

En la *Fig 13* se analiza la relación entre el porcentaje de asistencia de los estudiantes y su promedio de notas. Se presenta un gráfico de dispersión que permite observar tendencias entre estos dos factores.

Además, se incluye un gráfico de barras que muestra el promedio de asistencia por curso, lo que permite identificar en qué asignaturas se presentan mayores niveles de inasistencia. Esta información resulta útil para detectar posibles causas de bajo rendimiento y reforzar estrategias de seguimiento académico.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.016.png)

**Fig 14.** *Análisis de factores socioeconómicos y su relación con el rendimiento*

La *Fig 14* explora cómo diversos factores personales y del entorno del estudiante influyen en su promedio académico. Se analizan variables como el interés por los estudios, el acceso a recursos de aprendizaje, el tiempo de transporte hacia la universidad, las condiciones de vivienda y la situación económica.

Cada gráfico muestra la comparación del promedio de notas entre quienes presentan o no dichos factores, permitiendo identificar su impacto en el rendimiento. Esta información resulta valiosa para las unidades de apoyo académico y bienestar, ya que permite priorizar intervenciones basadas en evidencia.


![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.017.png)

**Fig 15.** *Distribución de estudiantes según situación académica y factores personales*

En la *Fig 15* se muestra la cantidad de estudiantes con condición regular y observada por cada año académico. Este análisis permite visualizar cómo ha evolucionado el número de alumnos en ambas situaciones a lo largo del tiempo. Además, se presenta una distribución según factores como vivienda y nivel económico, lo que permite identificar qué condiciones personales están más asociadas a un desempeño académico bajo. Esta información apoya la toma de decisiones para diseñar estrategias de acompañamiento más focalizadas.

**6.3.2 Paneles de rendimiento predictivo**

Las pruebas del modelo predictivo se enfocaron en su precisión y fiabilidad. Para ello, el dataset se dividió en conjuntos de entrenamiento y pruebas. El modelo fue entrenado y luego evaluado, y sus resultados se visualizan directamente en los siguiente panel. 

**Fig 16.** *Predicción de aprobación académica por estudiante![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.018.png)*

En la *Fig 16* se presentan los resultados del modelo predictivo de clasificación desarrollado en Python, cuyo objetivo es estimar si un estudiante aprobará o desaprobará un curso. El modelo toma en cuenta variables como asistencia, nota continua, nota parcial y factores personales.

` `Los resultados se muestran de forma visual a través de etiquetas que indican si el alumno será aprobado o no, junto con gráficos que comparan la asistencia promedio entre ambos grupos. Esta predicción permite anticipar riesgos académicos y actuar preventivamente mediante tutorías o asesoramiento académico.

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.019.png)

**Fig 17.** *Predicción de nota promedio en función de factores socioeconómicos*

En la *Fig 17* se  muestran los resultados de un modelo de regresión aplicado para estimar la nota promedio de cada estudiante, considerando factores como nivel económico, tiempo de transporte, condiciones de vivienda, interés académico y recursos de estudio. 

Los gráficos permiten visualizar la relación entre cada variable y la nota estimada, facilitando la identificación de factores que impactan significativamente en el rendimiento. Esta información permite a la institución anticiparse a situaciones de riesgo y fortalecer las políticas de apoyo estudiantil desde una perspectiva preventiva y contextualizada.
## <a name="_heading=h.lwbrht1p1uih"></a>**6.4 Resultados de las métricas**
### <a name="_heading=h.ja0jmoc0tlgt"></a>**6.4.1. Resultados del Rendimiento Descriptivo**
*Tiempo de ejecución del ETL*

Cada ejecución incluyó las etapas de extracción, transformación y carga de los 250 registros simulados correspondientes a los estudiantes del quinto ciclo de la FISI. La Tabla 19 presenta los tiempos obtenidos en segundos para cada corrida, así como el promedio general.

**Tabla  19.** *Tiempos de ejecución del ETL (en segundos)*

|**Corrida**|**T. Extracción**|**T. Transformación** |**T. Carga**|**Total**|
| :- | :-: | :-: | :-: | :-: |
|1|95|110|70|275|
|2|100|120|60|280|
|3|90|115|72|277|
|**Promedio**|95|115|67|277|

Nota: Elaboración propia

En la *Tabla 18* cada columna detalla una fase del proceso, con todos los valores expresados en segundos: la T. Extracción muestra el tiempo que toma obtener los datos de las fuentes, la T. Transformación refleja el tiempo dedicado a la limpieza y aplicación de reglas de negocio, y la T. Carga indica el tiempo para insertar los datos procesados en el almacén. Finalmente, la columna Total suma los tiempos de las tres fases por cada ejecución. La fila final, Promedio, resume la eficiencia del sistema, indicando que el proceso completo de actualización del almacén de datos se ejecuta consistentemente en un promedio de 277 segundos (aproximadamente 4 minutos y 37 segundos).

*Tiempo de respuesta de las visualizaciones*

Con el objetivo de evaluar la fluidez de la interacción en el sistema de BI, se midió el tiempo de carga de los dashboards y el tiempo de respuesta frente a los filtros representativos en cada uno. Para cada panel se registró el tiempo de carga inicial y el tiempo de respuesta al aplicar filtros o segmentaciones. Los resultados se resumen en la Tabla 20, donde se muestran los valores obtenidos en las corridas de prueba y el promedio final, esto se realizó con la herramienta de Power BI, el cual es *analizador de rendimiento.*

**Tabla  20.** *Tiempos de respuesta de visualizaciones (en milisegundos)*
|**Panel**|**T. Carga Inicial**|**T. Respuesta de Consulta**|
| :-: | :-: | :-: |
|General|491|300|
|Semestres, Cursos, etc|606|373|
|Porcentaje de asistencias|590|586|
|Factores Socioeconómicos I|377|633|
|Factores Socioeconómicos II|387|454|
|Predicción de Aprobación|240|214|
|Predicción de Promedio|154|184|
|**Promedio**|406\.42|392|

Nota: Elaboración propia

La *Tabla 20* cuantifica el rendimiento de la interacción del usuario, presentando los resultados en milisegundos (ms). Se observa que el promedio del Tiempo de Carga Inicial de los paneles fue de 406.42 ms, mientras que el Tiempo de Respuesta de Consulta al aplicar filtros alcanzó los 392 ms. Dado que ambos promedios se mantienen consistentemente por debajo del medio segundo (500 ms), se valida la fluidez y agilidad del sistema de Business Intelligence. Este desempeño asegura una experiencia de usuario casi instantánea al navegar y segmentar la información en los siete dashboards analizados, cumpliendo con los estándares de respuesta rápida necesarios para la consulta y toma de decisiones.

*Número de indicadores*

El análisis del número de indicadores definidos permite evaluar la cantidad de kpis establecidas en cada panel del sistema de inteligencia de negocios, lo cual refleja el grado de profundidad y la capacidad analítica que ofrece cada tablero. Mantener un número equilibrado de indicadores es clave para garantizar la claridad de la información visualizada y evitar la sobrecarga cognitiva de los usuarios.

**Tabla  21.** *Número de indicadores por panel*
|**Panel**|**N de indicadores**|
| :-: | :-: |
|1(**Fig 11**)|7|
|2(**Fig 12**)|4|
|3(**Fig 13**)|3|
|4(**Fig 14**)|5|
|5(**Fig 15)**|5|
|6(**Fig 16**)|3|
|7(**Fig 17**)|3|
|**Promedio**|4\.3|

Nota: Elaboración propia

En la **Tabla 21**, se observa que la cantidad de indicadores varía entre tres y siete por panel, con un promedio general de 4.3 indicadores. Este resultado se encuentra dentro del rango recomendado por Efy (2023) y Berglund, Tenic (2020), quienes sugieren mantener entre tres y diez indicadores para asegurar una visualización clara y efectiva. En este caso, el promedio obtenido evidencia un diseño de dashboards orientado a la simplicidad y al enfoque analítico, lo que favorece la comprensión y facilita la toma de decisiones por parte de los usuarios.
### <a name="_heading=h.68ooq4osa2i2"></a>**6.4.2. Resultados del Rendimiento Predictivo**
*Clasificación: Predicción de aprobación del curso*

Para evaluar y comparar el desempeño de los diferentes modelos, se analizan dos métricas clave: *accuracy* y *recall*. A continuación, se presenta una tabla comparativa de los resultados obtenidos para cada modelo, con el objetivo de determinar cuál tiene el mejor rendimiento en cuanto a ambas métricas.

**Tabla  22.** *Comparación de accuracy y recall*
|**Modelo**|**Accuracy**|**Recall**|
| :-: | :-: | :-: |
|Regresión logística|0\.94|0\.945|
|Árbol de Decisión|0\.91|0\.91|
|Máquinas de Vectores de Soporte (SVM)|0\.939|0\.942|

Nota: Elaboración propia

A continuación, en la *Figura 18*, se presenta un gráfico comparativo que visualiza los resultados de accuracy y recall para los modelos mencionados en la *Tabla 21*:

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.020.png)

**Fig 18.** *Comparación de los modelos de predicción de aprobación del curso*

La Figura 18 ofrece una comparación visual detallada del rendimiento de los modelos predictivos para la aprobación del curso, empleando un gráfico combinado de barras y puntos con doble eje para contrastar las métricas de Accuracy y Recall. Las barras azules, regidas por el eje izquierdo, representan la Accuracy, mientras que los puntos rojos, relacionados con el eje derecho, muestran el Recall. El gráfico confirma que los tres algoritmos evaluados (Regresión Logística, Árbol de Decisión y SVM) presentan una alta eficacia, con todas las métricas consistentemente por encima del 0.90 (90%). Sin embargo, un examen visual minucioso revela que la Regresión Logística se posiciona como el modelo más robusto, ya que tanto sus barras de Accuracy (0.94) como sus puntos de Recall (0.945) son los más altos en el gráfico. Esta superioridad justifica su elección para el módulo de predicción de riesgo académico.

*Regresión: Predicción de la nota del curso*

A continuación, se presenta una tabla comparativa de los resultados obtenidos para cada modelo, con el objetivo de determinar cuál tiene el mejor rendimiento en cuanto a ambas métricas.

**Tabla  23.** *Comparación de MRE y R²*
|**Modelo**|**MRE**|**R²**|
| :-: | :-: | :-: |
|Random Forest|0\.76|0\.949|
|XGBoost|0\.85|0\.943|
|Árbol de Decisión para Regresión|1\.31|0\.91|

Nota: Elaboración propia

A continuación, en la *Figura 19*, se presenta un gráfico comparativo de los resultados de MRE y R² para los tres modelos de predicción de la nota del curso:

![](Aspose.Words.8c3a180a-ae05-45bb-82ba-1bd81ba75cac.021.png)

**Fig 19.** *Comparación de los modelos de predicción de promedio del curso*

La Figura 19 ilustra el rendimiento de los modelos de Regresión utilizados para predecir la nota promedio del curso, empleando un gráfico de barras y puntos con doble eje. Este gráfico contrasta dos métricas esenciales: el Error Medio Relativo (MRE) y el Coeficiente de Determinación (R²). Las barras azules, regidas por el eje vertical izquierdo, representan el MRE; en esta métrica, un valor menor indica un mejor modelo. Por su parte, los puntos rojos, relacionados con el eje vertical derecho, muestran el R², donde un valor más alto indica que el modelo explica mejor la variabilidad de la nota. El análisis visual del gráfico confirma que el modelo Random Forest es superior, ya que su barra de MRE es la más baja (0.76), mostrando el menor error de predicción. Además, su punto de R² (0.949) se ubica en la posición más alta. Esta combinación de un error mínimo y una alta capacidad explicativa válida al modelo Random Forest como la opción más precisa y robusta para la predicción de la nota promedio en el sistema.
# <a name="_heading=h.kp88nwroaju8"></a>**CAPÍTULO 7: CONCLUSIÓN**
La implementación de la solución de Inteligencia de Negocios permitió demostrar que es posible aplicar un enfoque analítico para identificar el riesgo académico dentro de una escuela de educación superior. A través del diseño de un modelo basado en la metodología de Ralph Kimball, se integraron datos académicos y socioeconómicos en un repositorio estructurado que facilita el análisis y la interpretación de la información. Aunque se trabajó con datos sintéticos, las pruebas realizadas confirmaron que el sistema cumple con los objetivos propuestos. El proceso ETL mostró un tiempo de ejecución adecuado y sin errores de carga, mientras que las visualizaciones presentaron un tiempo de respuesta casi inmediato, permitiendo una exploración fluida de los datos. Estos resultados respaldan que la solución planteada puede aplicarse de manera efectiva en un entorno real, ayudando a centralizar la información y mejorar la toma de decisiones académicas.

En relación con el primer problema específico, sobre el manejo ineficiente de la información académica, el modelo de repositorio centralizado permitió integrar correctamente los datos y eliminar duplicidades. Durante la validación, el tiempo de ejecución del proceso ETL fue óptimo, garantizando la carga completa y limpia de las tablas de hechos y dimensiones. Esto demostró que el flujo de integración diseñado es funcional y que la estructura propuesta puede sostener el análisis de grandes volúmenes de datos de manera ordenada, confiable y adaptable a las necesidades institucionales.

Respecto al segundo problema, vinculado a la falta de visualizaciones integrales, los dashboards desarrollados en Power BI permitieron mostrar indicadores clave sobre tasas de aprobación, promedios académicos y comparaciones entre años y modalidades. En las pruebas, las visualizaciones respondieron sin demoras perceptibles y mostraron los datos de manera clara y comprensible. Estos resultados validan que las visualizaciones son útiles, accesibles y efectivas para analizar el rendimiento académico desde diferentes perspectivas.

En cuanto al tercer problema, relacionado con la ausencia de métricas claras y consistentes, se definieron indicadores de rendimiento que fueron verificados a través de los modelos predictivos desarrollados. El modelo de regresión logística alcanzó un 94 % de aciertos en la predicción de aprobación o desaprobación, mientras que el modelo de Random Forest obtuvo un coeficiente de determinación (R²) de 0.95 y un 93 % de casos positivos correctamente identificados. Aunque los datos utilizados fueron simulados, estos resultados confirman que la estructura analítica propuesta es sólida y que los indicadores definidos son adecuados para evaluar y anticipar el rendimiento académico de los estudiantes.

En conjunto, las validaciones realizadas respaldan que la solución propuesta cumple con los objetivos del proyecto y resuelve de manera efectiva los problemas planteados. La eficiencia del proceso ETL, la rapidez de las visualizaciones, la pertinencia de los indicadores y la precisión de los modelos predictivos demuestran que el sistema puede adaptarse a un entorno real y aportar valor en la gestión educativa. En ese sentido, esta investigación sienta las bases para futuras implementaciones con datos reales, orientadas a mejorar la toma de decisiones y fortalecer el seguimiento académico dentro de la Facultad de Ingeniería de Sistemas.

**Trabajos futuros**

Se recomienda que, en futuras investigaciones, la solución de inteligencia de negocios desarrollada sea aplicada utilizando datos reales provenientes del Sistema Único de Matrícula (SUM) de la FISI, con el propósito de validar su comportamiento en un entorno institucional y medir con mayor precisión su impacto en la toma de decisiones académicas. Esta aplicación permitiría contrastar los resultados obtenidos con los datos simulados y verificar la efectividad del modelo en condiciones reales.

Asimismo, sería conveniente optimizar y automatizar el proceso de extracción, transformación y carga (ETL) para asegurar una actualización continua y eficiente de los datos. De igual manera, se sugiere incluir nuevas variables relacionadas con el bienestar emocional, la modalidad de estudio y el acceso a recursos tecnológicos, lo que contribuiría a enriquecer el análisis y mejorar la capacidad predictiva del sistema.

En caso de implementarse la solución en un entorno universitario, se recomienda promover la capacitación del personal académico y administrativo en el uso de herramientas de inteligencia de negocios, fomentando una cultura institucional basada en el análisis de datos y la toma de decisiones informada. Finalmente, se propone continuar la línea de investigación en inteligencia de negocios aplicada a la educación, explorando la integración de técnicas avanzadas de inteligencia artificial, como redes neuronales o modelos de aprendizaje profundo, que permitan anticipar con mayor precisión los casos de riesgo académico y fortalecer la gestión educativa en la universidad.


<a name="_heading=h.21yx2ox43pk"></a>2
