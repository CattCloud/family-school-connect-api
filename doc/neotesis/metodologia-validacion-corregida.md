# 6.3 METODOLOGÍA DE VALIDACIÓN


## 6.3.1 Enfoque Metodológico


La validación del sistema se fundamenta en el enfoque de **Evaluación Basada en Uso Real (Real-World Usage Evaluation)**, una metodología ampliamente empleada en investigación de sistemas interactivos y tecnologías educativas, que consiste en observar y medir el comportamiento de usuarios reales en condiciones naturales de uso durante un período definido (Nielsen, 1993; Dumas & Redish, 1999).


Este enfoque se complementa con técnicas de **analítica de learning analytics** aplicadas a plataformas educativas, donde los logs de sistema se utilizan como fuente primaria de datos para medir patrones de interacción, engagement y efectividad de intervenciones digitales (Siemens & Long, 2011; Ferguson, 2012).


**Fundamentos teóricos y empíricos:**


**1. User Behavior Analytics (UBA) en Sistemas Educativos**


Según Romero y Ventura (2020), el análisis de comportamiento de usuarios mediante registros automáticos de interacción (logs) es una metodología validada para evaluar la adopción, usabilidad y efectividad de plataformas educativas digitales. Los autores destacan que los datos de interacción capturados automáticamente por el sistema proporcionan una visión objetiva y no invasiva del comportamiento real de los usuarios, eliminando sesgos de reporte retrospectivo presentes en encuestas o entrevistas.


Esta metodología ha sido utilizada exitosamente en estudios similares sobre plataformas de comunicación escolar, como el trabajo de Woodhouse, Passey y Anderson (2024) sobre aplicaciones digitales para vinculación familia-escuela, donde se emplearon logs de sistema para medir frecuencia de acceso, tipos de interacción y patrones temporales de uso.


**2. Evaluación Ecológica de Tecnologías Educativas**


La validación mediante uso real en contextos auténticos (evaluación ecológica) es recomendada por Barab y Squire (2004) como método preferido para investigación en diseño de tecnología educativa, dado que:


- Captura la complejidad del contexto real de uso
- Permite identificar barreras y facilitadores no anticipados en diseño
- Genera datos de validez ecológica superior a laboratorios controlados
- Proporciona evidencia directa de viabilidad y sostenibilidad del sistema


**3. Learning Analytics para Medición de Engagement**


El uso de métricas derivadas de logs de sistema para medir engagement y efectividad de plataformas educativas está respaldado por el framework de Learning Analytics propuesto por Siemens y Long (2011), quienes establecen que las métricas de frecuencia de acceso, tiempo de interacción, diversidad de uso y patrones temporales son indicadores válidos de engagement y adopción de tecnología educativa.


Este framework ha sido adoptado ampliamente en investigación educativa y validado empíricamente en múltiples estudios (Ferguson, 2012; Gašević, Dawson & Siemens, 2015).


## 6.3.2 Diseño de la Validación


**Tipo de estudio:** Estudio cuasi-experimental de caso único con mediciones longitudinales pre-post implementación (Campbell & Stanley, 1963).


**Unidad de análisis:** Usuarios individuales (instancias de prueba) agrupados por rol funcional.


**Variables medidas:** Según Matriz de Operacionalización de Variables (Sección 6.1).


## 6.3.3 Procedimiento de Validación


El procedimiento de validación se desarrollará en cuatro fases secuenciales durante un período total de 3 semanas:


### **Fase 1: Preparación y Configuración (3 días previos al inicio)**


**Actividades:**
1. Configuración técnica del sistema de captura de logs (`auth_logs`, `access_logs`)
2. Validación de funcionamiento de todas las métricas definidas
3. Creación de usuarios de prueba con datos reales de la institución
4. Verificación de permisos y accesos según roles
5. Preparación de materiales de capacitación (guías, videos tutoriales)


**Responsables:** Investigador y equipo técnico de desarrollo


### **Fase 2: Capacitación de Instancias de Prueba (1 día)**


**Duración:** 1 hora por instancia (3 horas totales)


**Contenido de la capacitación:**
- Funcionalidades del sistema según rol de usuario
- Navegación básica: login, módulos principales, navegación entre secciones
- Procedimientos de seguridad: cambio de contraseña, cierre de sesión
- Protección de datos: confidencialidad de información académica, uso ético del sistema
- Canales de soporte técnico durante el período de prueba (ticket system, WhatsApp de soporte)
- Resolución de dudas y práctica guiada


**Metodología:** Sesión presencial individual o grupal (según disponibilidad) con demostración en vivo, práctica supervisada y entrega de guía de referencia rápida.


**Consentimiento informado:** Durante esta fase, cada instancia de prueba firmará el consentimiento informado para participación voluntaria, garantizando comprensión de objetivos, procedimientos, confidencialidad y derecho a retiro.


### **Fase 3: Período de Validación Activa (14 días naturales / 2 semanas)**


**Inicio simultáneo:** Las tres instancias de prueba iniciarán el uso del sistema el mismo día a la misma hora (lunes 8:00 am) para garantizar condiciones equivalentes.


**Instrucciones a instancias:**
- **Padre:** Utilizar el sistema según necesidades reales de seguimiento académico de su hijo, sin frecuencia obligatoria predefinida
- **Docente:** Realizar las actividades docentes habituales (publicar comunicados, generar notificaciones académicas, responder consultas)
- **Director:** Gestionar comunicación institucional, crear encuestas y supervisar el sistema según necesidades administrativas regulares
- **Administrador:** Gestionar y resolver tickets de soporte técnico creados por padres, docentes y director



**Recolección automática de datos:**


Durante todo el período, el sistema capturará automáticamente:


1. **Eventos de autenticación** (tabla `auth_logs`):
   - Cada login exitoso o fallido
   - Timestamp, IP, user agent, duración de sesión
   
2. **Eventos de navegación** (tabla `access_logs`):
   - Cada acceso a módulos funcionales (calificaciones, asistencia, comunicados, etc.)
   - Timestamp, módulo visitado, estudiante/curso relacionado, duración estimada
   
3. **Eventos de interacción** (tablas existentes):
   - Lectura de comunicados (`comunicados_lecturas`)
   - Visualización de notificaciones (`notificaciones.fecha_lectura`)
   - Respuestas a encuestas (`respuestas_encuestas`)
   - Creación y resolución de tickets (`tickets_soporte`)


**No intervención del investigador:** El investigador no intervendrá en el uso cotidiano del sistema. Esto garantiza la naturalidad y validez ecológica de los datos.


**Monitoreo pasivo:** El investigador realizará revisiones diarias de logs para detectar errores técnicos, sin influir en el comportamiento de los usuarios.


### **Fase 4: Análisis y Procesamiento de Datos (7 días posteriores al cierre)**


**Actividades:**


1. **Extracción de datos:**
   - Exportación de logs de `auth_logs` y `access_logs`
   - Extracción de registros de interacción de tablas principales
   - Consolidación en dataset de análisis (CSV/Excel)


2. **Cálculo de métricas:**
   - Aplicación de fórmulas definidas en Matriz de Operacionalización
   - Generación de valores para las 15 métricas por cada instancia de prueba
   - Verificación de calidad de datos según criterios establecidos


3. **Análisis estadístico descriptivo:**
   - Cálculo de promedios, medianas, desviaciones estándar
   - Identificación de valores atípicos
   - Comparación con umbrales definidos


4. **Análisis cualitativo complementario:**
   - Revisión de contenido de tickets de soporte
   - Análisis de respuestas a encuestas de satisfacción
   - Identificación de patrones de uso no anticipados


5. **Interpretación de resultados:**
   - Contrastación con objetivos específicos de la investigación
   - Identificación de fortalezas y limitaciones del sistema
   - Generación de recomendaciones de mejora


## 6.3.4 Consideraciones Éticas


Todo el proceso de validación se rige por los siguientes principios éticos:


- **Participación voluntaria:** Consentimiento informado firmado por cada instancia
- **Confidencialidad:** Anonimización de datos personales en reportes
- **Derecho a retiro:** Posibilidad de abandonar el estudio sin penalización
- **Protección de datos:** Cumplimiento de Ley N° 29733 (Ley de Protección de Datos Personales - Perú)
- **Beneficio mutuo:** Los participantes reciben capacitación y acceso gratuito al sistema
- **Transparencia:** Comunicación clara de objetivos y procedimientos del estudio


---


## REFERENCIAS DE LA METODOLOGÍA DE VALIDACIÓN


Barab, S., & Squire, K. (2004). Design-based research: Putting a stake in the ground. *The Journal of the Learning Sciences*, 13(1), 1-14. https://doi.org/10.1207/s15327809jls1301_1


Campbell, D. T., & Stanley, J. C. (1963). *Experimental and quasi-experimental designs for research*. Rand McNally.


Dumas, J. S., & Redish, J. (1999). *A practical guide to usability testing*. Intellect Books.


Ferguson, R. (2012). Learning analytics: Drivers, developments and challenges. *International Journal of Technology Enhanced Learning*, 4(5/6), 304-317. https://doi.org/10.1504/IJTEL.2012.051816


Gašević, D., Dawson, S., & Siemens, G. (2015). Let's not forget: Learning analytics are about learning. *TechTrends*, 59(1), 64. https://doi.org/10.1007/s11528-014-0822-x





Romero, C., & Ventura, S. (2020). Educational data mining and learning analytics: An updated survey. *Wiley Interdisciplinary Reviews: Data Mining and Knowledge Discovery*, 10(3), e1355. https://doi.org/10.1002/widm.1355



Siemens, G., & Long, P. (2011). Penetrating the fog: Analytics in learning and education. *EDUCAUSE Review*, 46(5), 30-40.

Nielsen, J. (1993). *Usability engineering*. Morgan Kaufmann.