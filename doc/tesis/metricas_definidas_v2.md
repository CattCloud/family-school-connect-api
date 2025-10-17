# Métricas Específicas para Módulos Implementados (Versión 2)

## 1. Módulo de Autenticación

### M1: Tasa de éxito en inicios de sesión
- **Definición:** Porcentaje de intentos de login que resultan exitosos respecto al total de intentos realizados.
- **Fórmula:** (Logins exitosos / Total de intentos) × 100
- **Fuente de datos:** Tabla `auth_logs` (a crear), campos `tipo_evento` ('login_exitoso', 'login_fallido')
- **Justificación:** Esta métrica evalúa la confiabilidad del sistema de autenticación y la facilidad de acceso para los usuarios. Un valor >90% indica un sistema robusto con baja fricción de ingreso.
- **Endpoints relacionados:** `POST /auth/login`

### M2: Tiempo promedio de sesión activa
- **Definición:** Duración promedio de las sesiones de usuario, desde el login hasta el logout.
- **Fórmula:** Promedio de (timestamp_logout - timestamp_login) para todas las sesiones completadas
- **Fuente de datos:** Tabla `auth_logs` (a crear), timestamps de eventos 'login_exitoso' y 'logout'
- **Justificación:** Mide el nivel de engagement de los usuarios con la plataforma. Sesiones más largas indican mayor interacción y uso efectivo del sistema.
- **Endpoints relacionados:** `POST /auth/login`, `POST /auth/logout`

## 2. Módulo de Datos Académicos

### M3: Frecuencia de consulta de calificaciones
- **Definición:** Número promedio de veces que un padre consulta las calificaciones de sus hijos por semana.
- **Fórmula:** Total de consultas a calificaciones / (Número de padres × Semanas del período)
- **Fuente de datos:** Tabla `access_logs` (a crear), campo `modulo` = 'calificaciones'
- **Justificación:** Indica el nivel de seguimiento académico por parte de los padres. Una frecuencia alta sugiere mayor involucramiento parental en el proceso educativo.
- **Endpoints relacionados:** `GET /calificaciones/estudiante/:estudiante_id`, `GET /calificaciones/estudiante/:estudiante_id/promedio`

### M4: Frecuencia de consulta de asistencias
- **Definición:** Número promedio de veces que un padre consulta el registro de asistencia de sus hijos por semana.
- **Fórmula:** Total de consultas a asistencia / (Número de padres × Semanas del período)
- **Fuente de datos:** Tabla `access_logs` (a crear), campo `modulo` = 'asistencia'
- **Justificación:** Mide el interés de los padres en monitorear la asistencia escolar de sus hijos, un aspecto fundamental del seguimiento académico. Una mayor frecuencia indica mayor atención al cumplimiento de la asistencia escolar.
- **Endpoints relacionados:** `GET /asistencias/estudiante/:estudiante_id`, `GET /asistencias/estudiante/:estudiante_id/estadisticas`

## 3. Módulo de Mensajería

### M5: Cantidad de mensajes bidireccionales enviados
- **Definición:** Número total de mensajes intercambiados entre padres y docentes en un período determinado.
- **Fórmula:** Conteo de registros en tabla `mensajes` durante el período de evaluación
- **Fuente de datos:** Tabla `mensajes` (existente)
- **Justificación:** Mide el volumen de comunicación efectiva entre padres y docentes. Un mayor número de mensajes indica que el canal está siendo utilizado activamente.
- **Endpoints relacionados:** `POST /conversaciones`, `POST /mensajes`

### M6: Tiempo promedio de respuesta a mensajes
- **Definición:** Tiempo promedio que tarda un usuario en responder a un mensaje recibido.
- **Fórmula:** Promedio de (timestamp_respuesta - timestamp_mensaje_original) para todos los pares de mensajes
- **Fuente de datos:** Tabla `mensajes` (existente), campo `fecha_envio`
- **Justificación:** Evalúa la eficiencia y rapidez de la comunicación institucional. Un tiempo de respuesta bajo indica una comunicación más fluida y efectiva.
- **Endpoints relacionados:** `POST /mensajes`

## Tablas de Logging Necesarias

Para implementar estas métricas, necesitamos crear las siguientes tablas:

### 1. Tabla `auth_logs`
```sql
CREATE TABLE auth_logs (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  tipo_evento VARCHAR(20), -- 'login_exitoso', 'login_fallido', 'logout'
  timestamp TIMESTAMP DEFAULT NOW(),
  detalles JSONB -- Información adicional: IP, dispositivo, etc.
);
```

### 2. Tabla `access_logs`
```sql
CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  modulo VARCHAR(50), -- 'calificaciones', 'asistencia', 'mensajes', etc.
  accion VARCHAR(50), -- 'consulta', 'listado', etc.
  timestamp TIMESTAMP DEFAULT NOW(),
  detalles JSONB -- Parámetros de la consulta, filtros, etc.
);
```

## Instancias de Prueba

Para validar estas métricas, utilizaremos tres perfiles de usuario:

### Instancia 1: Padre Activo "Carlos Méndez"
- **Perfil:** Apoderado de 2 hijos (Primaria 4to y 6to)
- **Comportamiento:**
  - Login diario (5 veces/semana)
  - Consulta calificaciones 2 veces/semana
  - Consulta asistencia semanalmente
  - Envía 2-3 mensajes/semana a docentes
- **Métricas que valida:** M1, M2, M3, M4, M5, M6

### Instancia 2: Padre Reactivo "Ana Torres"
- **Perfil:** Apoderado de 1 hijo (Secundaria 3ro)
- **Comportamiento:**
  - Login solo tras recibir notificaciones críticas (2-3 veces/semana)
  - Consulta calificaciones 1 vez cada 2 semanas
  - Consulta asistencia solo después de recibir alertas de inasistencia
  - Responde mensajes de docentes en <24h
- **Métricas que valida:** M1, M3, M4, M5, M6

### Instancia 3: Docente "Prof. María González"
- **Perfil:** Docente de Matemáticas (3 cursos, 90 estudiantes)
- **Comportamiento:**
  - Login 3 veces/semana
  - Carga calificaciones 1 vez/semana (archivo Excel)
  - Carga asistencia 3 veces/semana
  - Responde mensajes de padres en <12h
- **Métricas que valida:** M1, M2, M5, M6

## Alineación con la Matriz de Operacionalización

Estas métricas están directamente alineadas con las dimensiones de la matriz de operacionalización:

1. **Variable Independiente (Plataforma web):**
   - M1 y M2 evalúan la dimensión "Autenticación"
   - M3 y M4 evalúan la dimensión "Datos académicos"
   - M5 y M6 evalúan la dimensión "Comunicación"

2. **Variable Dependiente (Nivel de comunicación y seguimiento parental):**
   - M3 y M4 miden la dimensión "Frecuencia de acceso a información"
   - M5 y M6 miden la dimensión "Participación en comunicaciones bidireccionales"

Esta alineación garantiza que las métricas seleccionadas evalúen efectivamente el objetivo principal de la tesis: mejorar el seguimiento académico y la comunicación entre padres y la institución educativa.