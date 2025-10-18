# Cumplimiento Legal y Normativo

**Proyecto:** Plataforma de Comunicación y Seguimiento Académico  
**Institución:** I.E.P. Las Orquídeas  
**Estudiante:** Erick Edison Verde Huaynaccero  

---

## **Ley N.° 29733 – Ley de Protección de Datos Personales**

### **Resumen de la Ley**
La Ley N.° 29733 establece el marco normativo para la protección de datos personales en Perú, garantizando que la información personal sea tratada de manera segura, confidencial y con el debido consentimiento. La ley establece principios como la finalidad, licitud, proporcionalidad y seguridad en el tratamiento de datos personales.

### **Implementación en el Sistema**

#### 🔐 **Control de Acceso y Autorización**
- **Autenticación JWT**: Solo usuarios autorizados pueden acceder al sistema mediante tokens seguros con expiración definida
- **Validación de Roles**: Cada rol (apoderado, docente, director, administrador) accede exclusivamente a los datos correspondientes a sus funciones
- **Acceso Familiar Restringido**: Los apoderados únicamente pueden visualizar datos de sus hijos vinculados mediante la tabla `relaciones_familiares`

#### 📊 **Principio de Finalidad**
- Los datos se recopilan **exclusivamente para fines educativos** (seguimiento académico, comunicación institucional, gestión de asistencia)
- No se utiliza la información para propósitos comerciales o ajenos al ámbito educativo

#### 🔒 **Seguridad de la Información**
- **Hashing de contraseñas** con bcrypt (12 rounds) para protección contra accesos no autorizados
- **Tokens JWT** con expiración y mecanismo de blacklist para revocación de sesiones
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Validaciones de entrada** con Zod para prevenir inyección SQL y XSS
- **Comunicación segura** mediante HTTPS en todo el sistema

#### 👥 **Derechos de Acceso y Control**
- Los padres acceden únicamente a datos de **sus hijos vinculados** mediante validación en base de datos
- **Separación estricta de datos** entre usuarios según su rol y permisos asignados
- **Control granular** de qué información puede visualizar y modificar cada tipo de usuario

#### 📋 **Minimización de Datos**
- Se almacena únicamente información **estrictamente necesaria** para el servicio educativo
- No se recopilan datos adicionales sin propósito definido y consentimiento informado

---

## **Ley N.° 28044 – Ley General de Educación**

### **Resumen de la Ley**
La Ley N.° 28044 es la norma fundamental del sistema educativo peruano, establece que las instituciones educativas deben promover la participación activa de los padres en el proceso educativo y utilizar la tecnología como apoyo para mejorar la gestión escolar y la calidad educativa.

### **Implementación en el Sistema**

#### 🏫 **Participación de los Padres en el Proceso Educativo**
- **Módulo de comunicación escuela-familia**: Mensajería directa padre-docente, comunicados institucionales segmentados y alertas académicas automáticas
- **Seguimiento académico accesible**: Reportes detallados de asistencia, calificaciones por componente y rendimiento en tiempo real disponibles 24/7
- **Dashboard parental**: Visión consolidada del progreso académico de sus hijos con indicadores clave

#### 💻 **Tecnología como Apoyo a la Gestión Escolar**
- **Gestión digital de calificaciones**: Registro automatizado, cálculo de promedios y consulta inmediata de notas
- **Sistema de asistencia digital**: Control y seguimiento de presencia en clases con 5 estados definidos
- **Reportes y boletas digitales**: Exportación automática de documentos oficiales en formato PDF
- **Notificaciones automáticas**: Alertas inmediatas de bajo rendimiento o inasistencias mediante WhatsApp y plataforma

#### 🤝 **Fortalecimiento de la Comunidad Educativa**
- **Canal de comunicación fluido**: Diálogo constante entre familia e institución mediante mensajería bidireccional
- **Transparencia informativa**: Acceso oportuno a información académica relevante y actualizada
- **Apoyo al seguimiento pedagógico**: Herramientas digitales para que los padres acompañen el proceso de aprendizaje

---

## **Marco Normativo TIC del MINEDU**

### **Resumen del Marco**
Son directivas y normas técnicas emitidas por el Ministerio de Educación del Perú para promover el uso de tecnologías de información y comunicación (TIC) en colegios, fomentando la transformación digital en la gestión educativa y estableciendo lineamientos sobre infraestructura tecnológica y plataformas digitales.

### **Implementación en el Sistema**

#### 🌐 **Transformación Digital Educativa**
El sistema no solo digitaliza procesos existentes, sino que **rediseña completamente la gestión académica**:
- **Estructuras dinámicas de evaluación**: El director puede configurar componentes y pesos según necesidades pedagógicas
- **Seguimiento en tiempo real**: Los padres acceden a información actualizada sin esperar períodos de cierre
- **Notificaciones automáticas**: Sistema inteligente que alerta sobre eventos académicos críticos
- **Generación automatizada de reportes**: Procesamiento sin intervención manual para boletas y estadísticas

#### 📱 **Accesibilidad e Inclusión Digital**
- **Diseño mobile-first**: Interfaz responsiva adaptable a diferentes dispositivos
- **Progresive Web App (PWA)**: Funcionalidades offline para áreas con conectividad limitada
- **Interfaz intuitiva**: Diseño centrado en el usuario para facilitar la adopción tecnológica

#### 🔗 **Integración con Ecosistema Educativo**
- **Compatibilidad conceptual** con sistemas oficiales como SIAGIE
- **Exportación de datos** en formatos estándar para interoperabilidad
- **Estructura modular** que permite futuras integraciones con plataformas ministeriales

---

## **ISO/IEC 12207 – Procesos de Ciclo de Vida del Software**

### **Resumen de la Norma**
Norma internacional que define cómo gestionar todo el ciclo de vida del software, desde el análisis de requisitos hasta el mantenimiento y retiro. Establece procesos principales (adquisición, desarrollo, operación, mantenimiento) y de apoyo (gestión de configuración, documentación, aseguramiento de calidad).

### **Implementación en el Sistema**

#### 📋 **Gestión Estructurada del Desarrollo**
- **Metodología ágil modularizada**: Implementación de Scrum con entregables semanales y trazabilidad clara
- **Documentación completa**: Especificación de requisitos, arquitectura funcional, historias de usuario y documentación API
- **Trazabilidad de requisitos**: Conexión directa entre necesidades del usuario, diseño y funcionalidades implementadas

#### 🔄 **Procesos de Calidad Asegurada**
- **Pruebas unitarias e integración**: Validación sistemática de componentes y flujos
- **Revisiones de código**: Control de calidad mediante pull requests en GitHub
- **Documentación técnica**: Manuales de usuario, guías de implementación y especificaciones detalladas

#### 📊 **Gestión de Configuración**
- **Control de versiones**: Gestión de cambios mediante Git con ramas por funcionalidad
- **Entornos diferenciados**: Desarrollo, pruebas y producción con configuraciones específicas
- **Gestión de dependencias**: Control explícito de librerías y versiones utilizadas

---

## **ISO/IEC 27001 – Seguridad de la Información**

### **Resumen de la Norma**
Norma internacional que define un Sistema de Gestión de Seguridad de la Información (SGSI) basado en tres pilares fundamentales: confidencialidad (proteger datos de accesos no autorizados), integridad (asegurar que la información no se altere indebidamente) y disponibilidad (garantizar acceso cuando se necesite).

### **Implementación en el Sistema**

#### 🔐 **Confidencialidad**
- **Control de acceso basado en roles**: Permisos granulares según responsabilidades
- **Autenticación multifactor**: JWT con mecanismos de renovación y revocación
- **Cifrado de datos sensibles**: Contraseñas hasheadas y transmisión cifrada mediante HTTPS
- **Segregación de datos**: Aislamiento de información entre diferentes usuarios y roles

#### 🛡️ **Integridad**
- **Validaciones estrictas**: Verificación de datos de entrada con Zod en frontend y backend
- **Transacciones atómicas**: Operaciones de base de datos que garantizan consistencia
- **Logs de auditoría**: Registro de acciones críticas para trazabilidad y detección de anomalías
- **Control de concurrencia**: Prevención de modificaciones simultáneas conflictivas

#### ⚡ **Disponibilidad**
- **Arquitectura escalable**: Diseño preparado para crecimiento de usuarios y datos
- **Backups automatizados**: Respaldo periódico de información crítica
- **Monitoreo de sistema**: Detección temprana de problemas y caídas de servicio
- **Plan de recuperación**: Procedimientos documentados para restauración de servicios

#### 🔄 **Gestión Continua de la Seguridad**
- **Actualizaciones regulares**: Mantenimiento de dependencias y parches de seguridad
- **Evaluaciones periódicas**: Análisis de vulnerabilidades y pruebas de penetración
- **Mejora continua**: Retroalimentación de incidentes para fortalecer controles
- **Capacitación del usuario**: Guías y buenas prácticas de seguridad para todos los roles

---

## **Conclusión de Cumplimiento**

El sistema ha sido diseñado e implementado con un **enfoque integral de cumplimiento legal y normativo**, integrando:

1. **Protección de datos personales** conforme a la Ley 29733
2. **Apoyo a la gestión educativa** según la Ley 28044
3. **Alineación con políticas TIC** del MINEDU para transformación digital
4. **Procesos estructurados** según ISO/IEC 12207
5. **Controles de seguridad** alineados con ISO/IEC 27001

Este enfoque no solo asegura el cumplimiento normativo, sino que también genera confianza en los usuarios (padres, docentes, directivos) al garantizar que sus datos están protegidos y que el sistema opera según estándares internacionales de calidad y seguridad.