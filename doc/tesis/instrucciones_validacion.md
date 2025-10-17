# Instrucciones para la Validación del Sistema (Capítulo 6)

Este documento proporciona las instrucciones paso a paso para ejecutar las pruebas de validación del sistema y generar los datos necesarios para el Capítulo 6 de la tesis.

## Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- Prisma ORM
- Paquetes npm adicionales:
  - chart.js
  - chartjs-node-canvas
  - canvas

## Instalación de Dependencias

```bash
# Instalar dependencias para generar gráficos
npm install chart.js chartjs-node-canvas canvas
```

## Proceso de Validación

### 1. Crear Tablas de Logging

Primero, es necesario crear las tablas de logging en la base de datos para registrar las métricas:

```bash
# Ejecutar script SQL para crear tablas de logging
psql -U <usuario> -d <base_de_datos> -f doc/tesis/scripts_tablas_logging_v2.sql
```

### 2. Cargar Datos de Prueba

A continuación, se deben cargar los datos de prueba (seeds) para las instancias definidas:

```bash
# Ejecutar script de seeds
node prisma/seeds_pruebas_cap6_corregido.js
```

### 3. Simular Comportamiento de Usuarios

Luego, se debe simular el comportamiento de las instancias de prueba:

```bash
# Ejecutar script de simulación
node prisma/simular_comportamiento_instancias_corregido.js
```

### 4. Ejecutar Tests de Métricas

Una vez que se han simulado los comportamientos, se pueden ejecutar los tests para validar las métricas:

```bash
# Ejecutar tests de métricas
npx jest tests/metricas.test.js --verbose
```

Este comando ejecutará los tests y mostrará los resultados de cada métrica en la consola.

### 5. Generar Gráficos

Finalmente, se pueden generar los gráficos para visualizar los resultados:

```bash
# Ejecutar script de generación de gráficos
node scripts/generar_graficos_metricas.js
```

Los gráficos se guardarán en el directorio `doc/tesis/graficos/`.

## Descripción de las Métricas

### M1: Tasa de éxito en inicios de sesión

**Definición:** Porcentaje de intentos de login que resultan exitosos respecto al total de intentos realizados.

**Fórmula:**
```
Tasa de Éxito = (Logins Exitosos / Total de Intentos) × 100
```

**Fuente de Datos:** Tabla `auth_logs`, campos `tipo_evento` ('login_exitoso', 'login_fallido')

### M2: Tiempo promedio de sesión activa

**Definición:** Duración promedio de las sesiones de usuario, medida desde el login hasta el logout.

**Fórmula:**
```
Tiempo Promedio = Σ(Timestamp Logout - Timestamp Login) / Número de Sesiones
```

**Fuente de Datos:** Tabla `auth_logs`, timestamps de eventos 'login_exitoso' y 'logout'

### M3: Frecuencia de consulta de calificaciones

**Definición:** Número promedio de veces que un padre consulta las calificaciones de sus hijos por semana.

**Fórmula:**
```
Frecuencia = Número de Consultas / (Días del Período / 7)
```

**Fuente de Datos:** Tabla `access_logs` donde `modulo = 'calificaciones'`

### M4: Frecuencia de consulta de asistencias

**Definición:** Número promedio de veces que un padre consulta el registro de asistencia de sus hijos por semana.

**Fórmula:**
```
Frecuencia = Número de Consultas / (Días del Período / 7)
```

**Fuente de Datos:** Tabla `access_logs` donde `modulo = 'asistencia'`

### M5: Cantidad de mensajes bidireccionales enviados

**Definición:** Número de mensajes enviados entre padres y docentes, y porcentaje de conversaciones con comunicación bidireccional.

**Fórmula:**
```
Porcentaje Bidireccional = (Conversaciones con >1 Emisor / Total Conversaciones) × 100
```

**Fuente de Datos:** Tablas `mensaje` y `conversacion`

### M6: Tiempo promedio de respuesta a mensajes

**Definición:** Tiempo promedio que tarda un usuario en responder a un mensaje recibido.

**Fórmula:**
```
Tiempo Promedio = Σ(Timestamp Respuesta - Timestamp Mensaje Original) / Número de Respuestas
```

**Fuente de Datos:** Tabla `mensaje`, timestamps de mensajes consecutivos con emisores diferentes

## Interpretación de Resultados

Para cada métrica, se debe analizar:

1. **Valor global:** Resultado general de la métrica para todo el sistema
2. **Valores por instancia:** Resultados específicos para cada instancia de prueba
3. **Comparación con expectativas:** ¿Los valores obtenidos cumplen con los objetivos del sistema?
4. **Patrones y tendencias:** ¿Hay diferencias significativas entre instancias?

## Estructura de Archivos

- `doc/tesis/scripts_tablas_logging_v2.sql`: Script SQL para crear tablas de logging
- `prisma/seeds_pruebas_cap6_corregido.js`: Script para cargar datos de prueba
- `prisma/simular_comportamiento_instancias_corregido.js`: Script para simular comportamiento
- `tests/metricas.test.js`: Tests para validar métricas
- `scripts/generar_graficos_metricas.js`: Script para generar gráficos
- `doc/tesis/graficos/`: Directorio donde se guardan los gráficos generados

## Notas Adicionales

- Los tests están diseñados para validar que las métricas se calculen correctamente y que los resultados sean consistentes con el comportamiento simulado.
- Los gráficos generados pueden incluirse directamente en el Capítulo 6 de la tesis.
- Para obtener resultados más precisos, se recomienda ejecutar la simulación durante un período más largo (por ejemplo, 4 semanas en lugar de 2).