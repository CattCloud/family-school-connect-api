# Informacion brindada por el cliente
En el contexto específico de la I.E.P. Las Orquídeas, se observa que:

- No cuenta con un sistema digital para gestionar tareas académicas fundamentales.
- El registro de asistencia es completamente manual, limitándose a sellos en un cuaderno de control, sin mantener un historial digital accesible.
- Cada docente administra las notas según su criterio personal (en cuaderno físico o digital), sin un sistema que centralice esta información vital.
- Los padres de familia solo reciben información sobre el rendimiento académico mediante reuniones presenciales semestrales o por comunicaciones informales de los docentes.
- Las noticias e información relevante se transmiten a través del cuaderno de control físico de cada alumno.
- Existe una descoordinación entre horarios de atención y dispersión de medios de comunicación (WhatsApp, llamadas telefónicas, agendas físicas), generando retrasos informativos y respuestas evasivas ante incidencias académicas o de conducta.

Este escenario genera múltiples consecuencias negativas, entre ellas: el desconocimiento oportuno del desempeño académico y comportamiento del estudiante, la falta de involucramiento de los padres en la educación de sus hijos, retrasos en la resolución de problemas académicos y una mayor carga administrativa y operativa para la institución educativa. Como señalan Ochoa et al. (2021), la participación efectiva de los padres en el proceso educativo requiere de información oportuna y accesible, lo que a su vez demanda la implementación de herramientas tecnológicas adaptadas a las necesidades específicas de la comunidad educativa.

**1.2 Formulación del problema**

**1.2.1. Problema general**

- ¿De qué manera se puede mejorar la comunicación entre los padres y la institución educativa I.E.P. ¿Las Orquídeas, permitiendo mejorar el desempeño académico de los estudiantes?

**1.2.2. Problemas específicos**

- ¿Qué información del estudiante debe compartir la institución educativa con los padres para mejorar el seguimiento académico?
- ¿Qué medios de comunicación digital se deben implementar para facilitar la interacción efectiva entre los padres y la institución educativa?
- ¿Cómo se debe gestionar (creación, actualización, mantenimiento) el canal de comunicación planteado para garantizar su sostenibilidad y efectividad?

**1.3. Objetivos**

**1.3.1. Objetivo general**

- Diseñar e implementar una plataforma web que facilite la comunicación efectiva entre los padres y la institución educativa I.E.P. Las Orquídeas, permitiendo el seguimiento del desempeño académico de los estudiantes.

**1.3.2. Objetivos específicos**

- Diseñar un sistema centralizado para visualizar y gestionar información académica relevante que fomente el involucramiento parental en el proceso educativo.
- Desarrollar canales de comunicación digital integrados entre padres y docentes que permitan interacciones oportunas y efectivas.

Establecer un sistema de mantenimiento y actualización de datos en tiempo real que garantice la precisión y disponibilidad de la información académica y administrativa

## **4.1 Módulos del Sistema**

La plataforma web está organizada en módulos funcionales, cada uno diseñado para gestionar un aspecto específico de la comunicación escolar. Esta estructura modular permite una gestión ordenada y accesible de la información, asegurando que cada usuario acceda únicamente a los datos correspondientes a su perfil.

**4.1.1 Módulo de Autenticación y Perfiles**

Este módulo garantiza el acceso controlado al sistema, diferenciando los niveles de visibilidad y funcionalidad según el tipo de usuario (padre, docente ,director o administrador). No permite el registro libre; la creación de cuentas es exclusiva del administrador, en base a la información institucional existente.

El objetivo es establecer un mecanismo de ingreso seguro y segmentar la interfaz según el rol del usuario, evitando accesos no autorizados y mejorando la experiencia de uso.

Características principales

- Acceso autenticado: Los usuarios ingresan con credenciales proporcionadas por la institución. Las sesiones son únicas y el contenido visible se adapta automáticamente al perfil.
- Asignación de roles: Cada usuario posee un rol definido (padre, docente, administrador/director), lo que determina los módulos y acciones disponibles.
- Gestión de permisos personalizada: El director o administrador puede otorgar o restringir permisos específicos a docentes, por ejemplo, acceso para publicar comunicados o crear encuestas.

Este módulo refuerza la integridad del sistema al proteger los datos escolares mediante acceso segmentado. Además, promueve una estructura organizativa clara, donde cada actor accede únicamente a las funciones relacionadas con sus responsabilidades educativas.

**4.1.2 Módulo de Asistencia y Calificaciones**

Este módulo permite consolidar y presentar información académica clave del estudiante, orientado exclusivamente a padres o apoderados. Su objetivo es brindar seguimiento continuo y alertas preventivas sobre las calificaciones y la asistencia del alumno.

Este módulo facilita la consulta estructurada de calificaciones y asistencias, y generar alertas automáticas que fomenten la participación activa de los padres en el proceso educativo.

Características principales

- Visualización de calificaciones: Las notas se estructuran por curso y bimestre. Cada bimestre contempla cinco componentes fijos (examen, participación, revisión de cuaderno, revisión de libro y comportamiento), permitiendo un análisis claro del rendimiento por periodo.
- Consulta detallada de asistencia: Se registra diariamente la asistencia con estados definidos (puntual, tardanza, falta justificada, etc.), y se permite la exploración por fecha, mes o bimestre.
- Alertas inteligentes: Inasistencias consecutivas (por ejemplo, tres días seguidos sin justificar), bajo rendimiento académico (notas menores a un umbral establecido, como 10), registro de nuevas notas o asistencias.

Este módulo promueve la corresponsabilidad entre la institución y las familias, alentando la intervención temprana frente a posibles dificultades académicas o conductuales. Su diseño se fundamenta en la necesidad de convertir los datos escolares en información útil para la toma de decisiones de padres y directivos.

Relación con el diagrama: El módulo de asistencias y calificaciones interactúa directamente con la base de datos, consultando información académica que posteriormente es accesible para los padres.

**4.1.3 Módulo de Comunicados y Avisos**

Este módulo tiene como propósito establecer un canal oficial de comunicación entre la institución educativa y los actores involucrados (padres, docentes), asegurando que los comunicados de la institución sean difundidos de forma oportuna.

El objetivo es permitir la creación, gestión y distribución segmentada de comunicados informativos dentro de la comunidad educativa.

Características principales:

- Difusión segmentada: Los comunicados pueden dirigirse a públicos específicos (docentes, padres, grados o niveles), evitando saturar de información irrelevante a los usuarios.
- Disponibilidad visual: Los comunicados se presentan en formato estructurado, con información relevante como título, tipo, resumen y fecha.
- Control de acceso y publicación: Solo el director y ciertos docentes autorizados pueden publicar o gestionar comunicados.
- Notificación inmediata: El sistema alerta automáticamente a los destinatarios cuando se genera un nuevo comunicado, favoreciendo la inmediatez en la recepción de la información.

Este módulo mejora significativamente la organización institucional al reducir la informalidad en la comunicación y promover la transparencia informativa. Además, facilita el seguimiento de comunicados vistos/no vistos por parte de los padres, lo que potencia la corresponsabilidad educativa.

**4.1.4 Módulo de Mensajes y Consultas**

Este módulo proporciona una vía formal de comunicación entre padres, docentes y director, fortaleciendo el vínculo entre familia y escuela y fomentando la atención oportuna a las consultas. El intercambio de mensajes se realiza directamente dentro del sistema, sin necesidad de medios externos, lo que facilita el seguimiento y la trazabilidad de la comunicación institucional.

Este módulo tiene como objetivo, establecer un canal de comunicación digital, directo y privado, que permita enviar consultas, responder inquietudes y mantener un historial accesible de cada conversación educativa.

Características principales

- Mensajería estructurada: Padres y docentes pueden enviarse mensajes relacionados con calificaciones, comportamiento, asistencia o cualquier tema escolar relevante.
- Historial conversacional: Cada mensaje conserva sus respuestas en forma de conversación ordenada, permitiendo su revisión en cualquier momento.
- Notificaciones instantáneas: El sistema genera alertas automáticas cada vez que se recibe o responde un mensaje, asegurando que los usuarios estén siempre informados.
- Bandeja organizada y filtros de búsqueda: Los usuarios cuentan con una interfaz tipo bandeja de entrada, donde pueden filtrar los mensajes por emisor, fecha, asunto o estado (leído/no leído).
- Supervisión administrativa: El director o administrador puede visualizar todos los intercambios de mensajes con fines de seguimiento y control institucional, sin intervenir directamente en ellos.

Este módulo mejora significativamente la comunicación institucional al brindar una herramienta transparente, inmediata de comunicación. Sustituye las vías informales (mensajes por redes o papel) por un canal trazable, facilitando la respuesta oportuna a preocupaciones académicas y promoviendo la corresponsabilidad educativa

**4.1.5 Módulo de Soporte Técnico**

Este módulo proporciona un canal formal de asistencia para resolver dudas, incidencias o dificultades técnicas que puedan presentarse durante el uso de la plataforma. Su inclusión garantiza una experiencia de usuario fluida, promueve la autonomía y facilita el acompañamiento digital.

Permite brindar apoyo oportuno a todos los actores de la comunidad educativa (padres, docentes, director) frente a dificultades técnicas o funcionales, asegurando el uso efectivo y sostenido del sistema.

Características principales

- Centro de ayuda rápida: El sistema incluye una sección de preguntas frecuentes (FAQ) organizadas por categorías temáticas, permitiendo al usuario resolver dudas sin necesidad de intervención directa.
- Sistema de tickets de soporte: Ante dudas no resueltas por el centro de ayuda, los usuarios pueden crear solicitudes de soporte mediante un formulario que permite detallar el problema y adjuntar evidencia (capturas, archivos, etc.).
- Seguimiento personalizado: Cada solicitud se gestiona desde un panel especializado, donde el equipo de soporte puede responder, asignar estados (nueva, en proceso, resuelta) y mantener un historial de cada caso.
- Notificaciones automáticas: Cada respuesta a una solicitud genera una alerta para el usuario, garantizando comunicación fluida durante todo el proceso de soporte.
- Acceso a guías paso a paso: Como recurso complementario, se incluyen manuales visuales y guías prácticas para ejecutar tareas frecuentes dentro del sistema, fortaleciendo la autonomía del usuario.

La incorporación de este módulo fortalece la confianza institucional en el uso de herramientas tecnológicas, reduce la dependencia del personal técnico y promueve el aprendizaje auto asistido. Asimismo, permite identificar patrones recurrentes de fallas o dudas, generando oportunidades de mejora continua del sistema.

**4.1.6 Módulo de Encuestas**

Este módulo permite evaluar la percepción de los usuarios sobre la plataforma, recoger sugerencias constructivas y detectar a tiempo posibles dificultades pedagógicas o comunicacionales. La posibilidad de realizar encuestas digitales facilita la toma de decisiones informadas por parte de la administración.

El objetivo del este módulo es brindar una herramienta de retroalimentación institucional que permita medir el nivel de satisfacción, participación y comunicación dentro de la comunidad educativa.

Características principales

- Diseño de encuestas flexibles: El director, administradores o docentes autorizados pueden crear encuestas con diferentes tipos de preguntas (cerradas, abiertas, escala, opción múltiple), según el propósito del sondeo.
- Participación orientada: Las encuestas pueden dirigirse a públicos específicos (padres, docentes, grupos), lo que permite obtener información relevante y segmentada.
- Notificaciones automáticas: Al publicarse una nueva encuesta, el sistema notifica a los usuarios correspondientes, incentivando una participación oportuna.
- Seguimiento y visualización de resultados: Los datos recolectados se almacenan de forma estructurada y son presentados en reportes con estadísticas, gráficos y tablas, facilitando su análisis por parte de la dirección.

El módulo fortalece la cultura de escucha activa dentro de la institución, permitiendo tomar decisiones con base en evidencias. Además, contribuye a identificar áreas de mejora, generar confianza en la comunidad y fomentar una gestión educativa participativa.

**4.2.1 Base de Datos Centralizada**

La base de datos actúa como el núcleo de la plataforma, almacenando información académica, asistencia, comunicados, mensajes y solicitudes de soporte.

Todos los módulos interactúan con la base de datos para almacenar y consultar información.

Tecnologia usada: PostgreSQL - Neon

PostgreSQL  es un sistema de gestión de bases de datos relacional ampliamente utilizado en entornos web. 

**4.2.2 API REST - Servidor Web**

El servidor web gestiona las peticiones de los usuarios, procesando la lógica de negocio y comunicándose con la base de datos.

Es el intermediario entre los módulos y la base de datos, asegurando que cada usuario acceda únicamente a la información correspondiente a su perfil.

Tecnología usada: Node.js – Express.js

Node.js es un entorno de ejecución para JavaScript del lado del servidor que permite manejar múltiples conexiones de forma eficiente. A través del framework Express.js, se configura una API que gestiona toda la lógica del sistema, incluyendo operaciones CRUD, autenticación, subida de archivos y envío de respuestas. Su arquitectura asincrónica lo convierte en una solución liviana y flexible para servir contenido dinámico.

Manejador de Archivos – Multer - Coudinary: Multer es un middleware para Node.js que permite el manejo de archivos cargados por el usuario. En esta solución, facilita la subida de evidencias o adjuntos en módulos como mensajes, soporte técnico o encuestas, asegurando que los archivos se almacenen correctamente y sin comprometer el rendimiento.

Cloudinary es el manejador de archivo en la nube.

**4.2.3 Interfaz Frontend**

El frontend del sistema está desarrollado bajo un enfoque SPA (Single Page Application) utilizando tecnologías web.

Tecnologias: Vite + React + Tailwind CSS

**4.2.4 Servicio en la Nube (Deploy)**

La nube es el punto de conexión entre los módulos y los dispositivos de los usuarios.

Tecnología usada: Render

Render es una plataforma de despliegue en la nube que permite publicar servicios web de manera automatizada. Se eligió por su compatibilidad con Node.js, facilidad de configuración y plan gratuito para pruebas y desarrollo. Funciona como punto de acceso centralizado desde el cual los usuarios pueden conectarse a la plataforma sin necesidad de instalación local.

**4.3 Funcionalidades Clave del Sistema**

**4.3.1 Notificaciones Push**

Las notificaciones juegan un papel fundamental en la efectividad del sistema, garantizando que los padres y docentes reciban información crítica en tiempo real.

Ejemplos de Notificaciones:

- Actualización de calificaciones.
- Registro de inasistencia o tardanza.
- Publicación de un nuevo comunicado.
- Respuesta a una consulta de soporte técnico.

**4.3.2 Acceso Multiplataforma**

La plataforma está concebida bajo una lógica de accesibilidad universal, permitiendo que los usuarios puedan utilizarla desde distintos dispositivos —computadoras, tablets o teléfonos inteligentes— sin pérdida de funcionalidad ni de calidad visual. Esto garantiza que los padres y apoderados puedan consultar información académica en cualquier momento y desde cualquier lugar, reforzando la inmediatez y la cercanía con el entorno educativo.

- Estrategia tecnológica: Diseño responsivo: Toda la interfaz se adapta automáticamente al tamaño de pantalla del dispositivo, asegurando una visualización óptima sin necesidad de aplicaciones externas o instalaciones adicionales.
- Aplicación Progresiva (PWA): El sistema incorpora características propias de las Progressive Web Apps, permitiendo que la plataforma funcione como una aplicación web instalada, con capacidad para ejecutarse sin conexión parcial, ofrecer tiempos de carga rápidos y acceso directo desde el inicio del dispositivo.
- Sincronización en la nube: Al estar conectada a un servidor en la nube, la plataforma garantiza la actualización en tiempo real de los módulos, sin importar desde qué dispositivo se acceda.

Este enfoque multiplataforma promueve la inclusión digital, ya que no exige equipamiento específico por parte del usuario. Además, facilita una experiencia uniforme y accesible, ampliando el alcance del sistema y adaptándose a las dinámicas de conectividad actuales.

# Informacion sobre el sistema de notas y division escolar en el Peru
En Perú, el sistema educativo se maneja a través de los niveles de Inicial, Primaria y Secundaria, que conforman la Educación Básica. La Educación Inicial atiende a niños de 0 a 5 años, la Primaria abarca seis años (de los 6 a los 12 años) y la Secundaria comprende cinco años (de los 12 a los 17 años). La evaluación de los estudiantes se basa en un sistema vigesimal (11-20), pero con una escala literal que va desde C (Deficiente) hasta AD (Logro Destacado) para describir el desempeño de los alumnos.
La secundaria en Perú tiene una duración de cinco años, abarcando desde el primer grado hasta el quinto grado de secundaria.
la Primaria está dividida en seis grados
Inicial solo esta conformado por uno

Para calcular la nota en un colegio se consideran los promedios de exámenes, tareas, prácticas y participación en clase, las cuales son ponderadas según la importancia que el docente o el reglamento de cada institución les asigne.
Tipos de notas que se consideran:
Exámenes: Pueden ser parciales o finales, y evalúan el conocimiento en diferentes estándares o competencias de aprendizaje.
Tareas y trabajos: Estas actividades prácticas permiten evaluar el aprendizaje aplicado y la comprensión del material.
Prácticas: En algunas carreras o cursos, las prácticas calificadas son parte importante de la nota final, pudiendo incluso eliminar la calificación más baja.
Participación en clase: La interacción del estudiante en el aula y su contribución en las discusiones también puede ser considerada en la calificación.
Cómo se calcula la nota final:
Definir la escala de calificación: Cada colegio y docente establece una escala numérica (0-20 en Perú, 0-100 en EE. UU.) o con letras (A, B, C, etc.) para calificar las evaluaciones.
Ponderar las calificaciones: Se asigna un peso o porcentaje a cada tipo de actividad (examen, tarea, práctica) según su importancia en la evaluación del curso.
Calcular el promedio ponderado: Se multiplican las notas obtenidas en cada evaluación por su peso correspondiente, y luego se suman los resultados para obtener la nota final del estudiante.
Ejemplo de cálculo:
Si un curso tiene dos exámenes y un trabajo, con los siguientes pesos y notas:
Examen 1: 20% de la nota, obtuvo 80
Examen 2: 30% de la nota, obtuvo 90
Trabajo: 50% de la nota, obtuvo 70
La nota final se calcula como: (0.20 \* 80) + (0.30 \* 90) + (0.50 \* 70) = 16 + 27 + 35 = 78.
Nota importante: La forma específica de calcular las notas varía según el colegio y el país, por lo que es fundamental consultar el reglamento o preguntar directamente al profesor para conocer los criterios de evaluación y ponderación aplicados en un curso específico.

Sistema de Evaluación
Se utiliza una calificación vigesimal tradicional, pero se complementa con una escala literal que busca describir el proceso de aprendizaje.
Los niveles de desempeño son:
AD (Logro Destacado): Corresponde a las notas vigesimales más altas (18-20).
A (Logro Esperado): Para notas de 14 a 17.
B (En proceso): Para calificaciones entre 11 y 13.
C (En inicio): Para las notas de 0 a 10, indicando un desempeño deficiente.

La evaluación se realiza de manera progresiva y se comunica periódicamente (bimestral, trimestral o semestralmente) a los estudiantes y sus familias para identificar avances y áreas de mejora.

En el Perú, los colegios dividen el año escolar en trimestres, que son los periodos de tres meses en los que se organizan las actividades lectivas, evaluaciones y entrega de calificaciones. Aunque los términos «bimestre» y «semestre» existen para periodos de dos y seis meses respectivamente, el modelo de tres trimestres es el más común y adoptado en la mayoría de instituciones educativas y en el calendario oficial del país.

¿Por qué se usan trimestres?
División Equitativa: El año escolar se divide en tres partes iguales para estructurar el aprendizaje de manera continua.
Evaluación y Seguimiento: Cada trimestre permite una evaluación y seguimiento más detallado del progreso de los estudiantes, facilitando la entrega de calificaciones y la aplicación de medidas correctivas si fuera necesario.
Flexibilidad Curricular: La estructura trimestral permite una distribución equilibrada de las competencias curriculares a lo largo del año.
Ejemplo de calendario trimestral:
Un colegio en Perú puede organizar su año académico de la siguiente manera, con un calendario que incluye tres periodos lectivos principales:
I Trimestre: (Ej. Febrero a Abril)
II Trimestre: (Ej. Mayo a Julio)
III Trimestre: (Ej. Septiembre a Diciembre)
La duración exacta de cada trimestre y las fechas de inicio y fin pueden variar ligeramente entre colegios, pero el patrón de tres trimestres es la norma en el sistema educativo peruano.

Esta informacion es de Peru porque el escenario es un colegio peruano