## 📜 Leyes aplicables al sector educación en tu proyecto

### 1. **Ley N.° 29733 – Ley de Protección de Datos Personales**

- **Qué dice:** Esta ley protege la información personal de cualquier ciudadano en Perú. Obliga a que instituciones (empresas, colegios, universidades, etc.) gestionen los datos de manera segura, confidencial y con autorización.
- **Cómo se refleja en tu sistema web:**
    
    ### 🔐 **Control de Acceso y Autorización**
    
    - **Autenticación JWT**: Solo usuarios autorizados pueden acceder al sistema
    - **Validación de Roles**: Cada rol (apoderado, docente, director) ve únicamente los datos que le corresponden
    - Los apoderados solo pueden ver datos de sus hijos vinculados
    
    ### 📊 **Principio de Finalidad**
    
    - Los datos se recopilan **exclusivamente para fines educativos** (seguimiento académico, comunicación, asistencia)
    
    ### 🔒 **Seguridad de la Información**
    
    - **Hashing de contraseñas** con bcrypt (12 rounds)
    - **Tokens JWT** con expiración y blacklist
    - **Rate limiting** para prevenir ataques
    - **Validaciones de entrada** para prevenir inyección SQL
    
    ### 👥 **Derechos de Acceso**
    
    - Los padres solo acceden a datos de **sus hijos vinculados** mediante `relaciones_familiares`
    - **Separación de datos** entre usuarios según su rol
    - **Control granular** de qué información puede ver cada usuario
    
    ### 📋 **Minimización de Datos**
    
    - Se almacena solo información **estrictamente necesaria** para el servicio educativo
    - No se recopilan datos adicionales sin propósito definido

<aside>

### **Áreas de Mejora Identificadas**

Para cumplimiento total, considerar:

1. **Política de privacidad** visible para usuarios
2. **Consentimiento explícito** al registro
3. **Procedimientos de eliminación** de datos (derecho al olvido)
4. **Logs de auditoría** de accesos a datos sensibles
5. **Encriptación de datos sensibles** en base de datos

Tu sistema tiene una **base sólida de seguridad** que cumple con los principios fundamentales de la ley, aunque podría fortalecerse con políticas explícitas de privacidad y consentimiento informado.

</aside>

---

### 2. **Ley N.° 28044 – Ley General de Educación**

- **Qué dice:** Es la norma base del sistema educativo peruano. Establece que las instituciones deben **promover la participación de los padres** en el proceso educativo y usar la tecnología como apoyo a la gestión escolar.
- **Cómo se refleja en tu sistema web:**
    
    ### 🏫 **Participación de los Padres en el Proceso Educativo**
    
    - **Módulo de comunicación escuela-familia** → mensajería directa padre-docente, comunicados institucionales y alertas académicas automáticas
    - **Seguimiento académico accesible** → reportes de asistencia, calificaciones por componente y rendimiento en tiempo real que los padres pueden revisar 24/7
    - **Dashboard parental** → visión consolidada del progreso académico de sus hijos
    
    ### 💻 **Tecnología como Apoyo a la Gestión Escolar**
    
    - **Gestión digital de calificaciones** → registro y consulta automatizada de notas
    - **Sistema de asistencia digital** → control y seguimiento de presencia en clases
    - **Reportes y boletas digitales** → exportación PDF de documentos oficiales
    - **Notificaciones automáticas** → alertas de bajo rendimiento o inasistencias
    
    ### 🤝 **Fortalecimiento de la Comunidad Educativa**
    
    - **Canal de comunicación fluido** → diálogo constante entre familia e institución
    - **Transparencia informativa** → acceso oportuno a información académica relevante
    - **Apoyo al seguimiento pedagógico** → herramientas para que los padres acompañen el aprendizaje

👉 En tu formulario, esto se presenta como que tu sistema **apoya la gestión institucional y la participación parental**, cumpliendo con lineamientos de la ley.

---

## 🌐 ¿Por qué solo estas dos leyes (más HTTPS/seguridad)?

Porque son las **mínimas necesarias** para un sistema web escolar en Perú:

- **29733** asegura que no violas la privacidad de los estudiantes.
- **28044** asegura que tu sistema realmente aporta a la educación peruana.
- **HTTPS, buenas prácticas de seguridad y ética profesional** son la parte técnica que muestra que no solo piensas en programar, sino en hacer un sistema confiable.

---

## 📌 Marco Normativo de TIC en Educación (MINEDU)

### ¿Qué son?

Son resoluciones, directivas y normas técnicas que el **Ministerio de Educación del Perú (MINEDU)** ha emitido en los últimos años para promover:

- El **uso de tecnologías de la información y comunicación (TIC)** en colegios.
- La **transformación digital** en la gestión educativa.
- Lineamientos sobre **infraestructura tecnológica, conectividad y plataformas digitales** para la educación básica y superior.

Ejemplos:

- Directivas sobre **uso de plataformas virtuales** para la comunicación con familias y estudiantes.
- Normas sobre **gestión de datos educativos** en el SIAGIE (Sistema de Información de Apoyo a la Gestión de la Institución Educativa).
- Orientaciones para proyectos de innovación educativa con TIC.

<aside>

**Digitalización** → es pasar lo analógico a digital.

Ejemplo: un colegio que llevaba las notas en papel y ahora las pone en un Excel o en PDFs escaneados.

Solo cambia el formato, pero el proceso en sí sigue siendo el mismo.

**Transformación Digital →** es rediseñar los procesos usando la tecnología como eje.

Ejemplo: tu sistema no solo reemplaza la libreta física por una tabla digital, sino que:

Define estructuras dinámicas de evaluación.

Permite seguimiento en tiempo real de las notas.

Notifica automáticamente a los padres cuando se registra una calificación.

Genera reportes consolidados sin trabajo manual.

Cambia el proceso completo de gestión académica, mejorándolo con tecnología.

**¿En qué categoría está tu sistema?**

Tu proyecto es claramente una Transformación Digital, porque:

1. Cambia la experiencia del docente → ya no solo apunta notas en una libreta, sino que gestiona, edita, y ve promedios en vivo.

2. Empodera al director → antes definía criterios de evaluación “en papel”, ahora diseña y controla toda la estructura desde la plataforma.

3. Involucra a los padres en tiempo real → ellos ya no esperan 3 meses por la libreta, sino que reciben alertas inmediatas y seguimiento continuo.

4. Automatiza procesos → cálculo de promedios, conversión numérica ↔ letras, cierre de trimestres, generación de boletas PDF

</aside>

---

### ¿Debes incluirlas en tu formulario? ✅

**Sí conviene mencionarlas**, pero con un alcance limitado:

- No son leyes con sanciones directas como la **Ley 29733 (Protección de Datos)**, pero **sí son guías oficiales del MINEDU** que legitiman el uso de un sistema web en educación.
- Refuerzan que tu proyecto está alineado a las **políticas públicas de transformación digital educativa**.
- Sirven para mostrar que tu sistema no es un invento aislado, sino que responde a una **tendencia normativa del propio MINEDU**.

---

### ¿Cómo se visualizan en tu sistema web?

- **Conexión con la política nacional de TIC** → tu plataforma apoya la digitalización educativa promovida por el MINEDU.
- **Compatibilidad con SIAGIE u otros sistemas oficiales** (aunque sea a nivel conceptual, no integración directa).
- **Uso de buenas prácticas TIC** → accesibilidad, multiplataforma, inclusión digital de padres/docentes.

---

### 🟢 Recomendación para tu formulario

Incluye este marco como **referencia secundaria**, no como eje central.
En la sección **Competencias Genéricas (CG1)** puedes poner:

> “El proyecto se encuentra alineado con el Marco Normativo de Tecnologías de la Información y Comunicación (TIC) emitido por el MINEDU, que promueve la transformación digital de las instituciones educativas y el uso de plataformas virtuales para fortalecer la gestión escolar y la comunicación con las familias.”
> 

---

## 🔹 **ISO/IEC 12207 — Procesos de Ciclo de Vida del Software**

- **Qué es:** Norma internacional que define **cómo gestionar todo el ciclo de vida de un software** (desde análisis de requisitos hasta mantenimiento y retiro).
- **Puntos clave:**
    - Define procesos principales: **adquisición, desarrollo, operación y mantenimiento**.
    - Incluye procesos de apoyo: **gestión de configuración, documentación, aseguramiento de la calidad, verificación y validación**.
    - Busca orden, trazabilidad y calidad en cada etapa.

👉 **En tu sistema:**

- Estás aplicando una **metodología ágil (Scrum modularizado)**, pero al documentar requisitos, historias de usuario, arquitectura y pruebas, ya te alineas con los principios de la 12207: trazabilidad de requisitos → diseño → pruebas → entregables por fases.
- Por ejemplo: tu **documento de requisitos + arquitectura funcional + historias de usuario** son parte del cumplimiento de procesos de especificación y diseño definidos en la norma.

---

## 🔹 **ISO/IEC 27001 — Seguridad de la Información**

- **Qué es:** Norma internacional que define un **Sistema de Gestión de Seguridad de la Información (SGSI)**.
- **Puntos clave:**
    - Confidencialidad → proteger datos de accesos no autorizados.
    - Integridad → asegurar que la información no se altere indebidamente.
    - Disponibilidad → garantizar que el sistema esté accesible cuando se necesite.
    - Requiere controles de seguridad técnicos, organizativos y legales.

👉 **En tu sistema:**

- Manejas datos de **menores de edad y familias** → información altamente sensible.
- Tus medidas técnicas (JWT, bcrypt, HTTPS, control de roles, backups) cumplen el enfoque de **controles de seguridad** de la 27001.
- Además, al alinearte con la **Ley 29733 de Perú** (protección de datos personales), estás integrando el marco normativo local con las buenas prácticas globales de ISO/IEC 27001.

---

✅ **Resumen aplicado a tu contexto:**

- La **ISO/IEC 12207** te ayuda a justificar que tu proyecto sigue un proceso estructurado de desarrollo de software con trazabilidad y entregables claros.
- La **ISO/IEC 27001** justifica que tu sistema implementa controles de seguridad alineados con estándares internacionales para proteger la información de estudiantes, padres y docentes.