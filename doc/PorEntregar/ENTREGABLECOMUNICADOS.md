# UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS
(Universidad del Perú, Decana de América)

Facultad de Ingeniería de Sistemas e Informática

*"ENTREGABLE – MÓDULO DE COMUNICADOS"*

*PRÁCTICAS PRE PROFESIONALES*

*PROFESOR*

William Martín, Enriquez Maguiña

*PRESENTADO POR*

Verde Huaynaccero, Erick Edison

*Lima-Perú*

*2025*

---

*Informe del Módulo de Comunicados – Sistema de Comunicación Institucional*

*Objetivo del Entregable*

Desarrollar un sistema integral de comunicación institucional para la I.E.P. Las Orquídeas que permita a directivos y docentes publicar comunicados oficiales con segmentación automática por nivel, grado y curso según las relaciones institucionales de cada usuario.

El propósito fue resolver la problemática de comunicación dispersa estableciendo un canal formal que garantice que cada familia reciba únicamente comunicados relevantes para sus hijos, que docentes accedan a información institucional, y que el director supervise toda la comunicación con capacidad de gestión administrativa.

El sistema incorpora controles de acceso por rol, validación de permisos, sanitización automática de contenido, publicación inmediata o programada, marcado automático de lectura y funcionalidades administrativas.

La implementación respeta la Ley N.° 29733 (artículos 8 y 9), la Ley 28044, y aplica buenas prácticas de ISO/IEC 27001 (controles A.9, A.12, A.14, A.18) e ISO/IEC 12207.

***Metodología Aplicada***

El desarrollo siguió cuatro etapas con validación continua:

1. *Análisis y refinación de requisitos:*  
   Traduje las necesidades en tres historias de usuario con criterios de aceptación verificables: HU-COM-00 (bandeja con filtros y segmentación), HU-COM-01 (lectura con marcado automático), y HU-COM-02 (creación con validaciones).

2. *Diseño de arquitectura y contratos de API:*  
   Diseñé veinticuatro endpoints REST organizados en seis secciones funcionales, especificando métodos HTTP, parámetros, estructuras de respuesta, códigos de error y reglas de negocio.

3. *Implementación modular backend:*  
   Implementé tres capas independientes: ruteo con middlewares de seguridad, controladores con validación de parámetros, y servicios con reglas de negocio. Modelé las entidades Comunicado y ComunicadoLectura con restricciones de integridad.

4. *Validación funcional y generación de datos:*  
   Desarrollé un script que genera comunicados de ejemplo con diferentes configuraciones, permitiendo validar manualmente todos los flujos críticos del sistema.

*Herramientas Utilizadas*

- *Node.js con Express:* Construcción de APIs REST con organización modular y middlewares de seguridad.

- *Prisma ORM:* Modelado de datos con tipos estrictos, relaciones entre entidades y consultas eficientes con arrays de segmentación en JSON.

- *PostgreSQL en Neon:* Base de datos relacional con soporte JSONB para arrays de segmentación con índices optimizados.

- *Validación con expresiones regulares:* Sanitización de contenido HTML eliminando etiquetas peligrosas preservando formato básico.

- *GitHub:* Control de versiones con historial trazable de modificaciones.

- *Limitadores de tasa:* Treinta solicitudes por minuto para lectura y diez para escritura, protegiendo contra saturación.

*Actividades Realizadas*

- Refiné tres historias de usuario con criterios de aceptación detallados especificando validaciones, reglas de visibilidad, mensajes y flujos esperados.

- Diseñé y documenté veinticuatro endpoints REST especificando formatos, códigos HTTP, reglas de negocio y restricciones por rol.

- Implementé la capa de ruteo con métodos HTTP, rutas dinámicas y middlewares de autenticación, autorización y limitación de tasa.

- Desarrollé dieciocho funciones de controlador gestionando operaciones como listado con paginación, conteo de no leídos, búsqueda, marcado de lectura, creación, edición, publicación y operaciones administrativas.

- Codifiqué lógica de negocio: verificación de permisos, validación de acceso a segmentación, cálculo de destinatarios, generación de previews, formateo de fechas, sanitización HTML y texto descriptivo de destinatarios.

- Modelé entidad Comunicado con campos de contenido, tipo, estado, cuatro arrays de segmentación, fechas de trazabilidad y vinculación al autor; y ComunicadoLectura con restricción única.

- Construí script de generación automática de veinticinco comunicados variados con fechas distribuidas en noventa días y registros de lectura simulando sesenta por ciento de adopción.

- Documenté servicio frontend de integración con funciones cliente que consumen los endpoints principales con validaciones y manejo de errores.

- Verifiqué manualmente flujos críticos: listado segmentado, búsqueda, contador actualizado, lectura con marcado automático, creación con validaciones, publicación programada, edición temporal y operaciones administrativas.

***Evidencias***

- *Especificación técnica:* Documentación de tres historias de usuario refinadas, veinticuatro endpoints especificados con ejemplos y modelo de datos con dos entidades.

- *Implementación backend:* Archivo de rutas con seguridad configurada; archivo de controladores con dieciocho funciones; archivo de servicios con validaciones y reglas de negocio.

- *Estructura de datos:* Modelo Comunicado con enumeraciones, arrays de segmentación y campos de trazabilidad; modelo ComunicadoLectura con clave única compuesta.

- *Datos de prueba:* Script automatizado generando veinticinco comunicados variados con registros de lectura representando sesenta por ciento de adopción.

- *Integración frontend:* Servicio cliente con funciones de consumo de API, validaciones del lado del cliente y manejo estructurado de errores.

- *Verificación funcional:*  
  Validé segmentación automática por rol verificando que padres ven solo comunicados de sus niveles/grados, docentes ven institucionales y propios, y director ve todos sin restricción.
  
  Verifiqué marcado único de lectura mediante cláusula de conflicto y actualización correcta del contador de no leídos.
  
  Confirmé validaciones de longitud (título 10-200 caracteres, contenido 20-5000 caracteres), tipo según rol y segmentación según asignaciones.
  
  Validé publicación programada con mínimo treinta minutos de anticipación quedando en estado programado.
  
  Comprobé edición permitida solo dentro de veinticuatro horas post-publicación, y borradores sin restricción.
  
  Verifiqué que desactivación oculta el comunicado manteniendo registro para auditoría, y eliminación permanente remueve el comunicado y lecturas asociadas.

*Dificultades Encontradas*

- *Segmentación automática compleja:* Diseñar la lógica para determinar comunicados visibles según rol, vínculos familiares y asignaciones docentes requirió consultas con múltiples tablas relacionadas. Resolví construyendo consultas dinámicas con operadores de pertenencia y validando con datos de prueba.

- *Sanitización HTML preservando formato:* Eliminé elementos peligrosos sin destruir formato visual implementando patrones que detectan y remueven etiquetas inseguras preservando etiquetas básicas seguras.

- *Gestión de estados y transiciones:* Definí validaciones claras para cada transición posible documentando reglas y verificando flujos mediante pruebas manuales.

- *Ventana de edición:* Implementé cálculo del tiempo transcurrido desde publicación comparándolo contra ventana de veinticuatro horas, sin restricción para borradores.

- *Trazabilidad única de lecturas:* Usé restricción única en base de datos sobre comunicado-usuario e instrucción de inserción condicional que ignora si ya existe el registro.

***Lecciones Aprendidas***

- Reforcé la importancia de controles de acceso granulares verificando autenticación, autorización de endpoint y permisos específicos para recursos, aplicando defensa en profundidad según ISO/IEC 27001 A.9.1.

- Consolidé comprensión del principio de Proporcionalidad (Ley 29733 art. 8) al segmentar comunicados automáticamente garantizando que usuarios vean solo información pertinente.

- Aprendí que seguridad de contenido requiere validación doble: sanitización en frontend para experiencia y sanitización obligatoria en backend para protección real, según ISO/IEC 27001 A.14.2.

- Desarrollé capacidad para diseñar validaciones de negocio que reflejan restricciones operativas reales, como la ventana de edición que balancea corrección de errores con estabilidad de información comunicada.

- Comprendí el valor de trazabilidad para auditoría y análisis, registrando lecturas, ediciones y desactivaciones para métricas de adopción y cumplimiento con ISO/IEC 27001 A.12.4.

- Perfeccioné documentación de decisiones técnicas con justificación normativa vinculando cada control a principios legales o buenas prácticas, facilitando auditorías y demostrando cumplimiento.

***Competencias Desarrolladas en el Módulo de Comunicados***

***Competencias Genéricas***

***CG1 – Valores, compromiso ético y social***

Apliqué el principio de Proporcionalidad (Ley 29733 art. 8) diseñando segmentación automática donde cada usuario visualiza únicamente comunicados pertinentes según rol y vínculos. Implementé el principio de Seguridad (art. 9) mediante controles en tres capas: autenticación JWT, autorización por rol y sanitización de contenido. Apliqué ISO/IEC 27001 A.9.4.1 validando que docentes publiquen solo tipos autorizados dirigidos a grados con asignaciones activas.

Comprendí que en entornos educativos con datos de menores, la responsabilidad ética trasciende cumplimiento formal. Cada control de acceso protege el derecho de familias a privacidad informativa y comunicación pertinente.

***CG3 – Capacidad de análisis y pensamiento crítico***

Ejercité análisis sistemático descomponiendo el problema en requisitos verificables, identificando casos problemáticos y diseñando soluciones validadas. Apliqué pensamiento crítico evaluando efectividad de controles documentales versus técnicos automatizados, implementando doble validación.

Desarrollé capacidad para cuestionar supuestos proponiendo mejoras como validador robusto externo y preview calculado de destinatarios para confirmación explícita.

***CG4 – Habilidad para la comunicación oral y escrita***

Elaboré documentación técnica con tres niveles de audiencia: desarrolladores (especificación detallada con ejemplos), usuarios finales (mensajes claros orientados a acción) y auditores (trazabilidad de controles a normativas). Adapté lenguaje técnico según contexto usando terminología precisa internamente y lenguaje natural para usuarios.

Redacté ejemplos estructurados para cada endpoint facilitando integración frontend. Documenté reglas de negocio en lenguaje declarativo traduciendo restricciones técnicas en políticas comprensibles. Organicé documentación con numeración consistente, vinculación a historias de usuario y formatos estandarizados.

***Competencias Específicas***

***CT1.1 – Aplicación de metodologías, estándares y métricas de calidad***

Apliqué desarrollo incremental según ISO/IEC 12207 estructurado en refinamiento de requisitos, diseño de contratos, implementación modular y validación continua, manteniendo trazabilidad bidireccional entre historias de usuario, endpoints, código y entidades.

***Cómo lo hice:*** Estructuré desarrollo en fases con entregables claros refinando criterios de aceptación verificables, diseñando contratos API estandarizados, implementando código en capas independientes y validando con datos de prueba automatizados.

Definí métricas objetivas: cobertura de validación, autorización y sanitización en cien por ciento de endpoints, y consistencia de formato de respuesta unificado.

***Qué usé:*** Metodología ágil por historias de usuario; patrón de tres capas; especificación API tipo OpenAPI; versionamiento en GitHub; validación manual iterativa.

***Aprendizaje:*** Comprendí que metodologías no son procesos mecánicos sino adaptación de principios de organización, trazabilidad y calidad al contexto. La trazabilidad Historia→Endpoint→Código→Validación asegura implementación completa reduciendo defectos y facilitando mantenimiento.

***CT2.2 – Construcción y gestión de repositorios de datos***

Diseñé estructura aplicando normalización, integridad referencial y eficiencia. Modelé Comunicado con identificador único, tipo y estado enumerados, cuatro arrays de segmentación, fechas de trazabilidad, relación al autor y año académico. Modelé ComunicadoLectura con clave única compuesta garantizando unicidad de registros.

***Cómo lo hice:*** Apliqué normalización evitando redundancia almacenando solo identificadores; usé arrays JSONB para consultas de pertenencia eficientes; definí enumeraciones estrictas; configuré índices en campos de filtrado frecuente.

Implementé consultas dinámicas construyendo filtros según rol: padres filtrados por niveles/grados vinculados, docentes por autoría o público objetivo, director sin filtros.

***Qué usé:*** Prisma ORM con tipos estrictos; PostgreSQL con soporte JSONB; migraciones controladas; restricciones de unicidad y claves foráneas; consultas con inclusión de relaciones.

***Aprendizaje:*** Confirmé que calidad de estructura de datos impacta directamente en simplicidad de lógica de negocio. Modelar segmentación como arrays simplificó consultas pero requirió validaciones más cuidadosas, requiriendo balance entre normalización y optimización según patrones de acceso.

***CT2.3 – Fundamentos de gestión de calidad y seguridad***

Implementé controles en cuatro niveles: autenticación JWT verificando identidad, autorización por rol restringiendo endpoints, validación de permisos específicos consultando base de datos, y sanitización eliminando elementos peligrosos.

Apliqué Ley 29733 art. 9 protegiendo confidencialidad, integridad y disponibilidad. Implementé ISO/IEC 27001 A.12.6.1 validando contenido HTML antes de persistir.

***Cómo lo hice:*** Configuré autenticación JWT obligatoria; implementé autorización granular por endpoint; codifiqué validaciones consultando PermisoDocente; desarrollé sanitización con expresiones regulares; configuré limitadores de tasa diferenciados.

Implementé trazabilidad registrando fechas de acciones administrativas. Diseñé eliminación como operación transaccional de dos pasos garantizando atomicidad.

***Qué usé:*** Middleware JWT y autorización por rol; consultas de verificación de permisos; sanitización con expresiones regulares; limitadores con umbrales diferenciados; transacciones de base de datos.

***Aprendizaje:*** Aprendí que seguridad efectiva es resultado de capas superpuestas donde cada una mitiga riesgos residuales. Esta defensa en profundidad según ISO/IEC 27001 A.14.2.5 me permitió entender que seguridad es propiedad emergente de múltiples decisiones técnicas correctas.

***CT4.3 – Identificación y análisis de problemas de investigación***

Identifiqué como problema central la ausencia de trazabilidad y segmentación en comunicación institucional mediante canales informales sin registro de confirmación, segmentación automática ni organización histórica.

***Cómo lo hice:*** Formulé requisitos medibles traducidos en funcionalidades verificables: bandeja con filtros, marcado automático con timestamp, búsqueda y segmentación mediante consultas que cruzan arrays con vínculos institucionales.

Analicé causas raíz: falta de herramienta centralizada (resuelto con módulo dedicado), ausencia de control de permisos (tabla PermisoDocente), incapacidad de segmentar (arrays y filtrado automático) y falta de métricas (tabla ComunicadoLectura).

***Qué usé:*** Historias de usuario; criterios de aceptación; especificación de API; datos de prueba simulados; documentación vinculando funcionalidades a problemas.

***Aprendizaje:*** Desarrollé capacidad para fundamentar problemas con evidencia verificable y proponer soluciones preventivas con controles técnicos. Comprendí que debo traducir problemas en requisitos accionables validando que soluciones resuelven causas raíz mediante verificación empírica.

***CT4.4 – Gestión de proyectos de TI***

Planifiqué desarrollo en cuatro fases incrementales con entregables progresivos: análisis (especificación funcional), diseño (documentación de endpoints), implementación (código en capas) y validación (script de semillas y verificación).

Prioricé funcionalidades según dependencias y valor: primero bandeja y lectura (habilitadores), luego creación y publicación (valor directo), después gestión de borradores (optimización) y finalmente operaciones administrativas (control).

***Cómo lo hice:*** Organicé trabajo en entregables verificables; gestioné versionamiento con commits atómicos; apliqué separación de responsabilidades en tres capas; documenté alcance comprometido y pendiente con criterios claros.

Implementé controles de calidad: validaciones en cien por ciento de endpoints, sanitización obligatoria, limitadores de tasa y trazabilidad de acciones. Revisé cada función verificando manejo de errores apropiado.

***Qué usé:*** Cronograma general; GitHub como repositorio central; historias de usuario con criterios de aceptación; patrón MVC adaptado; testing manual iterativo; documentación técnica progresiva.

***Aprendizaje:*** Comprendí que gestión efectiva no es completar tareas en plazos sino entregar valor incremental con calidad verificable. Priorizar funcionalidades según dependencias reduce bloqueos. Documentar alcance previene expectativas incorrectas. Mantener trazabilidad bidireccional mejora calidad y capacidad de respuesta ante cambios.

***Conclusiones***

El módulo de Comunicados habilitó un sistema estructurado, seguro y trazable con controles de acceso por rol, segmentación automática, sanitización obligatoria, validación de permisos, publicación programada, registro de lectura y operaciones administrativas.

La arquitectura en tres capas y trazabilidad bidireccional facilitan mantenimiento, extensión y auditoría. La aplicación de principios normativos (Ley 29733, Ley 28044) y buenas prácticas (ISO/IEC 27001) fortalece cumplimiento regulatorio y confianza de la comunidad educativa.

Este módulo mejora comunicación efectiva reduciendo dispersión informativa, mejorando oportunidad mediante publicación programada y facilitando seguimiento con registro de lectura. La trazabilidad habilita métricas de adopción y análisis informando mejoras futuras.

En conclusión, este desarrollo consolidó competencias en gestión de datos (estructuras eficientes, consultas optimizadas), seguridad (controles en capas, mínimo privilegio), gestión de proyectos (priorización, entregables incrementales) y comunicación técnica (documentación multinivel). Reforzó compromiso ético en tratamiento responsable de datos en contextos educativos.