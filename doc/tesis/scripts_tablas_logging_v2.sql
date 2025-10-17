-- Scripts para crear tablas de logging para el Capítulo 6 de la tesis
-- Estas tablas permiten recolectar datos para las métricas definidas

-- Tabla para registrar eventos de autenticación (M1, M2)
CREATE TABLE IF NOT EXISTS auth_logs (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  tipo_evento VARCHAR(20) NOT NULL, -- 'login_exitoso', 'login_fallido', 'logout'
  timestamp TIMESTAMP DEFAULT NOW(),
  detalles JSONB -- Información adicional: IP, user-agent, etc.
);

-- Índices para optimizar consultas en auth_logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_usuario_id ON auth_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_tipo_evento ON auth_logs(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON auth_logs(timestamp);

-- Tabla para registrar accesos a módulos (M3)
CREATE TABLE IF NOT EXISTS access_logs (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL, -- 'apoderado', 'docente', 'director', 'administrador'
  modulo VARCHAR(50) NOT NULL, -- 'calificaciones', 'asistencia', 'mensajes', etc.
  accion VARCHAR(50) NOT NULL, -- 'consulta_detalle', 'listar', 'filtrar', etc.
  estudiante_id VARCHAR(255), -- ID del estudiante relacionado (si aplica)
  timestamp TIMESTAMP DEFAULT NOW(),
  duracion_ms INTEGER, -- Duración de la operación en milisegundos
  detalles JSONB -- Información adicional: parámetros, filtros, etc.
);

-- Índices para optimizar consultas en access_logs
CREATE INDEX IF NOT EXISTS idx_access_logs_usuario_id ON access_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_modulo ON access_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_estudiante_id ON access_logs(estudiante_id);

-- Tabla para registrar cargas de archivos (M4)
CREATE TABLE IF NOT EXISTS file_uploads (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(20) NOT NULL, -- 'calificaciones', 'asistencia'
  estado VARCHAR(20) NOT NULL, -- 'exitoso', 'con_errores', 'fallido'
  registros_procesados INTEGER,
  registros_con_error INTEGER,
  fecha_subida TIMESTAMP DEFAULT NOW(),
  detalles JSONB -- Información adicional: nombre archivo, tamaño, etc.
);

-- Índices para optimizar consultas en file_uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_usuario_id ON file_uploads(usuario_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_tipo_archivo ON file_uploads(tipo_archivo);
CREATE INDEX IF NOT EXISTS idx_file_uploads_estado ON file_uploads(estado);

-- Consultas SQL para calcular las métricas

-- M1: Tasa de éxito en inicios de sesión
-- Global
SELECT 
  COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso') AS exitosos,
  COUNT(*) FILTER (WHERE tipo_evento = 'login_fallido') AS fallidos,
  COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')) AS total,
  ROUND(
    (COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso')::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')), 0)) * 100, 
    2
  ) AS tasa_exito
FROM auth_logs
WHERE tipo_evento IN ('login_exitoso', 'login_fallido');

-- Por instancia
SELECT 
  usuario_id,
  COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso') AS exitosos,
  COUNT(*) FILTER (WHERE tipo_evento = 'login_fallido') AS fallidos,
  COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')) AS total,
  ROUND(
    (COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso')::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')), 0)) * 100, 
    2
  ) AS tasa_exito
FROM auth_logs
WHERE tipo_evento IN ('login_exitoso', 'login_fallido')
GROUP BY usuario_id
ORDER BY usuario_id;

-- M2: Tiempo promedio de sesión activa
-- Global
WITH sesiones AS (
  SELECT 
    usuario_id,
    login.timestamp AS login_time,
    logout.timestamp AS logout_time,
    EXTRACT(EPOCH FROM (logout.timestamp - login.timestamp)) / 60 AS duracion_minutos
  FROM (
    SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
    FROM auth_logs
    WHERE tipo_evento = 'login_exitoso'
  ) login
  JOIN (
    SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
    FROM auth_logs
    WHERE tipo_evento = 'logout'
  ) logout ON login.usuario_id = logout.usuario_id AND login.rn = logout.rn
  WHERE logout.timestamp > login.timestamp
)
SELECT 
  COUNT(*) AS total_sesiones,
  ROUND(AVG(duracion_minutos), 2) AS duracion_promedio_minutos,
  ROUND(MIN(duracion_minutos), 2) AS duracion_minima_minutos,
  ROUND(MAX(duracion_minutos), 2) AS duracion_maxima_minutos
FROM sesiones;

-- Por instancia
WITH sesiones AS (
  SELECT 
    usuario_id,
    login.timestamp AS login_time,
    logout.timestamp AS logout_time,
    EXTRACT(EPOCH FROM (logout.timestamp - login.timestamp)) / 60 AS duracion_minutos
  FROM (
    SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
    FROM auth_logs
    WHERE tipo_evento = 'login_exitoso'
  ) login
  JOIN (
    SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
    FROM auth_logs
    WHERE tipo_evento = 'logout'
  ) logout ON login.usuario_id = logout.usuario_id AND login.rn = logout.rn
  WHERE logout.timestamp > login.timestamp
)
SELECT 
  usuario_id,
  COUNT(*) AS total_sesiones,
  ROUND(AVG(duracion_minutos), 2) AS duracion_promedio_minutos,
  ROUND(MIN(duracion_minutos), 2) AS duracion_minima_minutos,
  ROUND(MAX(duracion_minutos), 2) AS duracion_maxima_minutos
FROM sesiones
GROUP BY usuario_id
ORDER BY usuario_id;

-- M3: Frecuencia de consulta de calificaciones
-- Global
WITH fechas AS (
  SELECT 
    MIN(timestamp::date) AS fecha_inicio,
    MAX(timestamp::date) AS fecha_fin
  FROM access_logs
  WHERE modulo = 'calificaciones'
),
dias_periodo AS (
  SELECT 
    EXTRACT(DAY FROM (fecha_fin - fecha_inicio)) + 1 AS total_dias
  FROM fechas
)
SELECT 
  COUNT(*) AS total_consultas,
  (SELECT total_dias FROM dias_periodo) AS dias_periodo,
  ROUND(COUNT(*)::DECIMAL / (SELECT total_dias FROM dias_periodo), 2) AS consultas_por_dia,
  ROUND(COUNT(*)::DECIMAL / ((SELECT total_dias FROM dias_periodo) / 7), 2) AS consultas_por_semana
FROM access_logs
WHERE modulo = 'calificaciones';

-- Por instancia
WITH fechas AS (
  SELECT 
    MIN(timestamp::date) AS fecha_inicio,
    MAX(timestamp::date) AS fecha_fin
  FROM access_logs
  WHERE modulo = 'calificaciones'
),
dias_periodo AS (
  SELECT 
    EXTRACT(DAY FROM (fecha_fin - fecha_inicio)) + 1 AS total_dias
  FROM fechas
)
SELECT 
  usuario_id,
  COUNT(*) AS total_consultas,
  (SELECT total_dias FROM dias_periodo) AS dias_periodo,
  ROUND(COUNT(*)::DECIMAL / (SELECT total_dias FROM dias_periodo), 2) AS consultas_por_dia,
  ROUND(COUNT(*)::DECIMAL / ((SELECT total_dias FROM dias_periodo) / 7), 2) AS consultas_por_semana
FROM access_logs
WHERE modulo = 'calificaciones'
GROUP BY usuario_id
ORDER BY usuario_id;

-- M4: Tasa de éxito en carga de archivos académicos
-- Global
SELECT 
  COUNT(*) AS total_archivos,
  COUNT(*) FILTER (WHERE estado = 'exitoso') AS exitosos,
  COUNT(*) FILTER (WHERE estado = 'con_errores') AS con_errores,
  COUNT(*) FILTER (WHERE estado = 'fallido') AS fallidos,
  ROUND(
    (COUNT(*) FILTER (WHERE estado = 'exitoso')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) AS tasa_exito
FROM file_uploads;

-- Por tipo de archivo
SELECT 
  tipo_archivo,
  COUNT(*) AS total_archivos,
  COUNT(*) FILTER (WHERE estado = 'exitoso') AS exitosos,
  COUNT(*) FILTER (WHERE estado = 'con_errores') AS con_errores,
  COUNT(*) FILTER (WHERE estado = 'fallido') AS fallidos,
  ROUND(
    (COUNT(*) FILTER (WHERE estado = 'exitoso')::DECIMAL / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) AS tasa_exito
FROM file_uploads
GROUP BY tipo_archivo
ORDER BY tipo_archivo;

-- M5: Cantidad de mensajes bidireccionales
-- Total de mensajes y conversaciones
SELECT 
  COUNT(*) AS total_mensajes,
  COUNT(DISTINCT conversacion_id) AS total_conversaciones,
  ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT conversacion_id), 2) AS mensajes_por_conversacion
FROM mensaje;

-- Mensajes por emisor
SELECT 
  emisor_id,
  COUNT(*) AS mensajes_enviados,
  COUNT(DISTINCT conversacion_id) AS conversaciones_activas
FROM mensaje
GROUP BY emisor_id
ORDER BY emisor_id;

-- Bidireccionalidad de conversaciones
WITH emisores_por_conversacion AS (
  SELECT 
    conversacion_id,
    COUNT(DISTINCT emisor_id) AS num_emisores
  FROM mensaje
  GROUP BY conversacion_id
)
SELECT 
  COUNT(*) AS total_conversaciones,
  COUNT(*) FILTER (WHERE num_emisores > 1) AS conversaciones_bidireccionales,
  ROUND((COUNT(*) FILTER (WHERE num_emisores > 1))::DECIMAL / COUNT(*) * 100, 2) AS porcentaje_bidireccional
FROM emisores_por_conversacion;

-- M6: Tiempo promedio de respuesta a mensajes
-- Global
WITH mensajes_ordenados AS (
  SELECT 
    conversacion_id,
    emisor_id,
    fecha_envio,
    LAG(emisor_id) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS emisor_anterior,
    LAG(fecha_envio) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS fecha_anterior
  FROM mensaje
),
tiempos_respuesta AS (
  SELECT 
    conversacion_id,
    emisor_id,
    fecha_envio,
    fecha_anterior,
    EXTRACT(EPOCH FROM (fecha_envio - fecha_anterior)) / 3600 AS horas_respuesta
  FROM mensajes_ordenados
  WHERE emisor_id != emisor_anterior
    AND emisor_anterior IS NOT NULL
)
SELECT 
  COUNT(*) AS total_respuestas,
  ROUND(AVG(horas_respuesta), 2) AS tiempo_promedio_horas,
  ROUND(MIN(horas_respuesta), 2) AS tiempo_minimo_horas,
  ROUND(MAX(horas_respuesta), 2) AS tiempo_maximo_horas
FROM tiempos_respuesta;

-- Por rol
WITH mensajes_ordenados AS (
  SELECT 
    conversacion_id,
    emisor_id,
    fecha_envio,
    LAG(emisor_id) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS emisor_anterior,
    LAG(fecha_envio) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS fecha_anterior
  FROM mensaje
),
tiempos_respuesta AS (
  SELECT 
    conversacion_id,
    emisor_id,
    fecha_envio,
    fecha_anterior,
    EXTRACT(EPOCH FROM (fecha_envio - fecha_anterior)) / 3600 AS horas_respuesta,
    CASE 
      WHEN emisor_id LIKE 'padre%' THEN 'apoderado'
      WHEN emisor_id LIKE 'docente%' THEN 'docente'
      ELSE 'otro'
    END AS rol_emisor
  FROM mensajes_ordenados
  WHERE emisor_id != emisor_anterior
    AND emisor_anterior IS NOT NULL
)
SELECT 
  rol_emisor,
  COUNT(*) AS total_respuestas,
  ROUND(AVG(horas_respuesta), 2) AS tiempo_promedio_horas,
  ROUND(MIN(horas_respuesta), 2) AS tiempo_minimo_horas,
  ROUND(MAX(horas_respuesta), 2) AS tiempo_maximo_horas
FROM tiempos_respuesta
GROUP BY rol_emisor
ORDER BY rol_emisor;