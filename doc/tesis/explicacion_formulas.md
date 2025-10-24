# Explicación Detallada de las Fórmulas de las Métricas

## Introducción

Este documento explica detalladamente cada una de las variables utilizadas en las fórmulas de las métricas definidas en el Capítulo VI de la tesis, para facilitar su comprensión y correcta aplicación.

## Métricas del Módulo de Autenticación

### M1: Tasa de éxito en inicios de sesión

**Fórmula:**
```
Tasa de Éxito = (Logins Exitosos / Total de Intentos) × 100
```

**Variables:**
- **Logins Exitosos:** Número total de inicios de sesión que se completaron exitosamente. Corresponde a los registros en la tabla `auth_logs` donde `tipo_evento = 'login_exitoso'`.
- **Total de Intentos:** Número total de intentos de inicio de sesión realizados. Corresponde a la suma de todos los registros en la tabla `auth_logs` donde `tipo_evento` es `'login_exitoso'` o `'login_fallido'`.

**Ejemplo práctico:**
Si un usuario intenta iniciar sesión 10 veces en un período determinado, y 8 de esos intentos son exitosos, mientras que 2 son fallidos:
- Logins Exitosos = 8
- Total de Intentos = 8 + 2 = 10
- Tasa de Éxito = (8 / 10) × 100 = 80%

### M2: Tiempo promedio de sesión activa

**Fórmula:**
```
Tiempo Promedio = Σ(Timestamp Logout - Timestamp Login) / Número de Sesiones
```

**Variables:**
- **Σ(Timestamp Logout - Timestamp Login):** Sumatoria de las duraciones de todas las sesiones. Cada duración se calcula restando el timestamp del evento de login del timestamp del evento de logout correspondiente.
- **Timestamp Logout:** Marca de tiempo exacta (en formato ISO 8601) cuando se registra el evento de cierre de sesión (`tipo_evento = 'logout'`).
- **Timestamp Login:** Marca de tiempo exacta (en formato ISO 8601) cuando se registra el evento de inicio de sesión exitoso (`tipo_evento = 'login_exitoso'`).
- **Número de Sesiones:** Cantidad total de sesiones completas (con login y logout correspondiente).

**Ejemplo práctico:**
Si un usuario tiene 3 sesiones en un día:
- Sesión 1: Login 08:00, Logout 08:30 (30 minutos)
- Sesión 2: Login 12:15, Logout 13:00 (45 minutos)
- Sesión 3: Login 16:00, Logout 16:20 (20 minutos)
- Σ(Timestamp Logout - Timestamp Login) = 30 + 45 + 20 = 95 minutos
- Número de Sesiones = 3
- Tiempo Promedio = 95 / 3 ≈ 31.67 minutos

## Métricas del Módulo de Datos Académicos

### M3: Frecuencia de consulta de calificaciones

**Fórmula:**
```
Frecuencia = Número de Consultas / (Días del Período / 7)
```

**Variables:**
- **Número de Consultas:** Total de accesos al módulo de calificaciones. Corresponde a los registros en la tabla `access_logs` donde `modulo = 'calificaciones'`.
- **Días del Período:** Cantidad de días calendario comprendidos en el período de evaluación. Se calcula como la diferencia entre la fecha más reciente y la fecha más antigua de los registros, más 1 día.

**Ejemplo práctico:**
Si un usuario consulta las calificaciones 8 veces en un período de 12 días:
- Número de Consultas = 8
- Días del Período = 12
- Frecuencia = 8 / (12 / 7) = 8 / 1.714 ≈ 4.67 consultas por semana

### M4: Frecuencia de consulta de asistencias

**Fórmula:**
```
Frecuencia = Número de Consultas / (Días del Período / 7)
```

**Variables:**
- **Número de Consultas:** Total de accesos al módulo de asistencia. Corresponde a los registros en la tabla `access_logs` donde `modulo = 'asistencia'`.
- **Días del Período:** Cantidad de días calendario comprendidos en el período de evaluación. Se calcula como la diferencia entre la fecha más reciente y la fecha más antigua de los registros, más 1 día.

**Ejemplo práctico:**
Si un usuario consulta las asistencias 3 veces en un período de 8 días:
- Número de Consultas = 3
- Días del Período = 8
- Frecuencia = 3 / (8 / 7) = 3 / 1.143 ≈ 2.63 consultas por semana

## Métricas del Módulo de Mensajería

### M5: Cantidad de mensajes bidireccionales enviados

**Fórmula:**
```
Porcentaje Bidireccional = (Conversaciones con >1 Emisor / Total Conversaciones) × 100
```

**Variables:**
- **Conversaciones con >1 Emisor:** Número de conversaciones que involucran mensajes enviados por más de un emisor diferente. Se calcula contando las conversaciones donde el número distintivo de emisores es mayor que 1.
- **Total Conversaciones:** Número total de conversaciones en el sistema. Corresponde al número total de registros en la tabla `conversaciones`.

**Ejemplo práctico:**
Si en el sistema existen 3 conversaciones:
- Conversación 1: 5 mensajes enviados por 2 emisores diferentes
- Conversación 2: 4 mensajes enviados por 2 emisores diferentes
- Conversación 3: 4 mensajes enviados por 2 emisores diferentes
- Conversaciones con >1 Emisor = 3
- Total Conversaciones = 3
- Porcentaje Bidireccional = (3 / 3) × 100 = 100%

### M6: Tiempo promedio de respuesta a mensajes

**Fórmula:**
```
Tiempo Promedio = Σ(Timestamp Respuesta - Timestamp Mensaje Original) / Número de Respuestas
```

**Variables:**
- **Σ(Timestamp Respuesta - Timestamp Mensaje Original):** Sumatoria de los tiempos de respuesta. Cada tiempo de respuesta se calcula restando el timestamp de un mensaje del timestamp del mensaje anterior en la misma conversación, siempre que sea enviado por un emisor diferente.
- **Timestamp Respuesta:** Marca de tiempo exacta cuando se envía un mensaje que responde a otro anterior.
- **Timestamp Mensaje Original:** Marca de tiempo exacta cuando se envió el mensaje original al que se responde.
- **Número de Respuestas:** Cantidad total de mensajes que son respuesta a otros mensajes anteriores en la misma conversación.

**Ejemplo práctico:**
Si en una conversación se producen las siguientes respuestas:
- Respuesta 1: Mensaje original a las 08:00, respuesta a las 08:30 (30 minutos = 0.5 horas)
- Respuesta 2: Mensaje original a las 09:15, respuesta a las 10:00 (45 minutos = 0.75 horas)
- Respuesta 3: Mensaje original a las 11:00, respuesta al día siguiente a las 09:00 (22 horas)
- Σ(Timestamp Respuesta - Timestamp Mensaje Original) = 0.5 + 0.75 + 22 = 23.25 horas
- Número de Respuestas = 3
- Tiempo Promedio = 23.25 / 3 = 7.75 horas

## Consideraciones Adicionales

1. **Unidades de Tiempo:** Para las métricas M2 y M6, los timestamps se registran en formato ISO 8601, pero los cálculos se realizan convirtiendo las diferencias a minutos (M2) u horas (M6).

2. **Redondeo:** Los resultados de las métricas se presentan con dos decimales para facilitar su interpretación y comparación.

3. **Filtros Temporales:** Todas las métricas pueden calcularse para diferentes períodos (diario, semanal, mensual) aplicando los filtros temporales correspondientes a las consultas SQL.

4. **Agrupación por Usuario:** Las métricas pueden calcularse de forma individual por usuario o de forma agregada para todo el sistema, según los requisitos de análisis.
