### Contexto actual
Actualmente no se cuenta con todo el backend ni el frontend, se esta avanzando el proyecto siguiendo el cronograma y estoy en el modulo de mensajeria
asi que hasta ahi hare la pruebas, conforme desarrolle los demas modulos hare las pruebas alli
Como solo tengo el backend y siento que es lo unico que necesito pensaba
1.Agregar seeds minimos a la bd para las pruebas
2.Dejar en claro a mi agente de codificacion cuales son las instancias de prueba o escenarios a simular
3.Luego creo tests que simulen instancias de prueba para cada variable que quiero simular
4.Anoto o redacto los resultados para mi tesis es un formato de toma de decisiones facil(grafico,etc)
Osea lo que quiero tener al final es lo suficiente para redactar parte de la prueba 6
capítulo 6: Validación
introducción breve y corta
métricas (indicadores)
Las metricas/indicadores no tienen que ser complejas,mientras respondan el objetivo del modulo
-    Definir con detalle y precision cada metrica(indicadores) y las tecnologias que se usaran
-    Indicar formulas si son necesarias y fundamentarlas
Instancias de prueba (Como evaluaras el seguimiento y comunicación academico)
Son los usuarios que acceden al sistema
Las instancias de prueba es la unidad ,seran varias (3 a menos) 
-    Detallas cuales son las instancias de prueba para el sistema
-    Proceso y metodologia de validacion -> Como se estan aplicando las metricas a las instancias de prueba
-    Que se espera de esa instancia de prueba      
-    Solucion Esperada
Pruebas(Aplicación de las metricas)
-    Capturas de las pruebas y resultados obtenidos
resultados: Cuadros estadisticos, graficos, forma facil de presentarlo 
Objetivo final: Redaccion del capitulo 6 en la tesis

# 📋 PLANNING COMPLETO: De Métricas a Capítulo 6 de Tesis

---

## **FASE 0: PREPARACIÓN Y DEFINICIÓN (ACTUAL)**

### ✅ **Paso 0.1: Definir Variables y Métricas Finales**
**Objetivo:** Tener clara la matriz de operacionalización simplificada (12 indicadores core)

**Tareas:**
- [ ] Revisar HU detalladas de módulos implementados
- [ ] Revisar endpoints del backend disponibles
- [ ] Seleccionar **6 métricas para Variable Independiente** (plataforma)
- [ ] Seleccionar **6 métricas para Variable Dependiente** (seguimiento parental)
- [ ] Validar que cada métrica tenga:
  - ✓ Fuente de datos clara (tabla específica)
  - ✓ Fórmula simple
  - ✓ Justificación técnica breve

**Entregable:** Matriz de Operacionalización Final (12 indicadores)

---

### ✅ **Paso 0.2: Diseñar Tablas Faltantes**
**Objetivo:** Definir estructura de `access_logs` y `file_uploads` (o similares)

**Tareas:**
- [ ] Diseñar esquema SQL de tabla `access_logs`
- [ ] Diseñar esquema SQL de tabla `file_uploads` (si aplica)
- [ ] Definir qué endpoints registrarán logs automáticamente
- [ ] Documentar estructura JSON de campos adicionales

**Entregable:** Script SQL de creación de tablas + Documentación

---

## **FASE 1: IMPLEMENTACIÓN TÉCNICA**

### 🔧 **Paso 1.1: Crear Tablas de Logging en BD**
**Objetivo:** Ejecutar migraciones de nuevas tablas

**Tareas:**
- [ ] Ejecutar script SQL en PostgreSQL/Neon
- [ ] Verificar creación exitosa de tablas
- [ ] Crear índices necesarios para consultas rápidas

**Entregable:** BD actualizada con tablas operativas

---

### 🔧 **Paso 1.2: Implementar Logging en Backend**
**Objetivo:** Agregar código que registre métricas automáticamente

**Tareas:**
- [ ] Crear middleware de logging para `access_logs`
  - Detectar módulo/acción desde la ruta del endpoint
  - Registrar timestamp de entrada
  - Opcional: calcular duración (timestamp de salida)
- [ ] Agregar logging en endpoints de carga de archivos
- [ ] Agregar logging en endpoints de autenticación (login/logout)
- [ ] Probar cada endpoint y verificar que escriba en BD

**Entregable:** Backend con sistema de logging funcional

---

### 🔧 **Paso 1.3: Crear Seeds Mínimos para Pruebas**
**Objetivo:** Poblar BD con datos simulados realistas

**Tareas:**
- [ ] Definir 3 instancias de prueba:
  1. **Padre Activo:** 2 hijos, login frecuente
  2. **Padre Reactivo:** 1 hijo, login solo tras alertas
  3. **Docente:** 3 cursos, carga de datos regular
- [ ] Crear script de seeds con:
  - 3 usuarios (1 padre con 2 hijos, 1 padre con 1 hijo, 1 docente)
  - 3 estudiantes vinculados
  - 3-5 cursos asignados
  - 10-15 calificaciones preliminares
  - 10-15 registros de asistencia
  - 3-5 comunicados publicados
  - 2-3 conversaciones con 3-5 mensajes cada una
  - 5-10 notificaciones variadas
- [ ] Ejecutar seeds y verificar data en BD

**Entregable:** Script de seeds + BD poblada con data de prueba

---

## **FASE 2: DEFINICIÓN DE PRUEBAS**

### 📝 **Paso 2.1: Diseñar Escenarios de Prueba**
**Objetivo:** Documentar qué simulará cada instancia de prueba

**Tareas:**
- [ ] Para cada instancia, definir:
  - **Perfil del usuario** (rol, contexto familiar/académico)
  - **Comportamiento esperado** (frecuencia de uso, módulos que visitará)
  - **Escenarios específicos** (ej: "Padre recibe notificación de falta → login en <2h → consulta asistencia")
  - **Métricas que validará** (cuáles de las 12 se aplicarán)
- [ ] Crear tabla resumen:

```markdown
| Instancia | Rol | Comportamiento | Métricas a Validar |
|-----------|-----|----------------|-------------------|
| Padre Activo | Apoderado | Login diario, consulta calificaciones 2x/semana | M1, M2, M7, M8, M11 |
| Padre Reactivo | Apoderado | Login solo tras alerta | M3, M10, M12 |
| Docente | Docente | Carga datos 1x/semana, responde mensajes <24h | M4, M5, M6 |
```

**Entregable:** Documento "Escenarios de Prueba Detallados" (1-2 páginas)

---

### 📝 **Paso 2.2: Definir Tests Automatizados**
**Objetivo:** Planificar qué tests escribir en código

**Tareas:**
- [ ] Listar endpoints a probar por métrica
- [ ] Decidir herramienta de testing (Vitest + Supertest según tu stack)
- [ ] Crear checklist de tests:

**Ejemplo para Métrica 1 (Tasa de éxito en logins):**
```javascript
// Test 1: Login exitoso registra en auth_logs
// Test 2: Login fallido registra en auth_logs
// Test 3: Calcular tasa = (exitosos / total) × 100
```

**Entregable:** Checklist de tests por métrica (12 grupos de tests)

---

## **FASE 3: EJECUCIÓN DE PRUEBAS**

### 🧪 **Paso 3.1: Escribir Tests Unitarios/Integración**
**Objetivo:** Codificar tests que simulen las instancias

**Tareas:**
- [ ] Por cada métrica, escribir 2-4 tests:
  - Test de funcionalidad básica
  - Test con datos de instancia específica
  - Test de cálculo de métrica
  - Test de valores extremos (opcional)
- [ ] Ejecutar tests y verificar que pasen
- [ ] Ajustar código si hay fallos

**Entregable:** Suite de tests completa (archivo `.test.js` o `.spec.js`)

---

### 🧪 **Paso 3.2: Ejecutar Simulación Manual (Opcional)**
**Objetivo:** Validar comportamiento desde interfaz real (si tienes frontend parcial)

**Tareas:**
- [ ] Para cada instancia:
  - Hacer login como ese usuario
  - Ejecutar acciones del escenario (consultar calificaciones, leer comunicados, etc.)
  - Verificar que se registren logs en BD
- [ ] Tomar capturas de pantalla de:
  - Login exitoso
  - Módulos consultados
  - Notificaciones recibidas
  - Mensajes enviados

**Entregable:** Carpeta con capturas de pantalla + video corto (opcional)

---

### 🧪 **Paso 3.3: Extraer Datos de Métricas**
**Objetivo:** Consultar BD para obtener valores reales de indicadores

**Tareas:**
- [ ] Crear queries SQL para cada métrica
- [ ] Ejecutar queries y exportar resultados a CSV/Excel
- [ ] Ejemplo de queries:

```sql
-- Métrica 1: Tasa de éxito en logins
SELECT 
  COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso') AS exitosos,
  COUNT(*) FILTER (WHERE tipo_evento = 'login_fallido') AS fallidos,
  ROUND((COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso')::DECIMAL / COUNT(*)) * 100, 2) AS tasa_exito
FROM auth_logs
WHERE fecha BETWEEN '2025-01-01' AND '2025-01-31';

-- Métrica 2: Frecuencia de acceso a datos académicos
SELECT 
  usuario_id,
  COUNT(*) AS total_accesos,
  COUNT(*) FILTER (WHERE modulo = 'calificaciones') AS accesos_calificaciones,
  COUNT(*) FILTER (WHERE modulo = 'asistencia') AS accesos_asistencia
FROM access_logs
GROUP BY usuario_id;
```

**Entregable:** Archivo Excel con resultados de las 12 métricas

---

## **FASE 4: ANÁLISIS Y VISUALIZACIÓN**

### 📊 **Paso 4.1: Crear Gráficos y Tablas Estadísticas**
**Objetivo:** Presentar resultados de forma visual

**Tareas:**
- [ ] Elegir herramienta (Excel, Google Sheets, Python matplotlib, etc.)
- [ ] Por cada métrica, crear:
  - **Tabla resumen** con valores por instancia
  - **Gráfico apropiado** (barras, líneas, pastel según el tipo de dato)
- [ ] Ejemplos de gráficos:
  - Gráfico de barras: Tasa de éxito en logins por instancia
  - Gráfico de línea: Frecuencia de acceso por día
  - Gráfico de pastel: Distribución de módulos más consultados

**Entregable:** 12 gráficos + 12 tablas (1 por métrica)

---

### 📊 **Paso 4.2: Analizar Resultados**
**Objetivo:** Interpretar qué significan los números

**Tareas:**
- [ ] Para cada métrica, responder:
  - ¿El valor obtenido es alto/bajo/esperado?
  - ¿Cumple con el objetivo del módulo?
  - ¿Hay diferencias notables entre instancias?
  - ¿Qué conclusión se puede extraer?
- [ ] Crear tabla de análisis:

```markdown
| Métrica | Valor Obtenido | Interpretación | Cumple Objetivo |
|---------|----------------|----------------|-----------------|
| M1: Tasa de éxito en logins | 95% | Alta confiabilidad del sistema de autenticación | ✅ Sí |
| M2: Accesos a calificaciones | 4.2/semana | Padres consultan frecuentemente | ✅ Sí |
```

**Entregable:** Documento "Análisis de Resultados" (2-3 páginas)

---

## **FASE 5: REDACCIÓN DEL CAPÍTULO 6**

### ✍️ **Paso 5.1: Escribir Introducción**
**Objetivo:** Contextualizar el capítulo de validación

**Tareas:**
- [ ] Redactar 1-2 párrafos que expliquen:
  - Que este capítulo presenta la validación del sistema
  - Que se usaron métricas técnicas objetivas
  - Que se simularon 3 instancias de prueba
  - Que los resultados demuestran la efectividad de la plataforma

**Entregable:** Sección "6.1 Introducción" (1 página)

---

### ✍️ **Paso 5.2: Redactar Sección "Métricas e Indicadores"**
**Objetivo:** Documentar cada métrica con detalle técnico

**Tareas:**
- [ ] Para cada una de las 12 métricas, escribir:
  - **Nombre completo del indicador**
  - **Definición conceptual** (qué mide)
  - **Fórmula matemática** (si aplica)
  - **Fuente de datos** (tabla y campos específicos)
  - **Tecnología de medición** (SQL, logs, etc.)
  - **Justificación** (por qué es relevante)

**Plantilla por métrica:**
```markdown
#### 6.2.1 Métrica M1: Tasa de Éxito en Inicios de Sesión

**Definición:** Porcentaje de intentos de login que resultan exitosos respecto al total de intentos realizados.

**Fórmula:**
$$\text{Tasa de Éxito} = \frac{\text{Logins Exitosos}}{\text{Total de Intentos}} \times 100$$

**Fuente de Datos:** Tabla `auth_logs`, campos `tipo_evento` ('login_exitoso', 'login_fallido')

**Tecnología de Medición:** Query SQL con funciones de agregación (COUNT, FILTER)

**Justificación:** Esta métrica evalúa la confiabilidad del sistema de autenticación y la facilidad de acceso para los usuarios. Un valor >90% indica un sistema robusto con baja fricción de ingreso.
```

**Entregable:** Sección "6.2 Métricas e Indicadores" (6-8 páginas)

---

### ✍️ **Paso 5.3: Redactar Sección "Instancias de Prueba"**
**Objetivo:** Documentar los 3 escenarios simulados

**Tareas:**
- [ ] Explicar qué son las instancias de prueba
- [ ] Describir cada una:
  - **Perfil del usuario**
  - **Contexto académico/familiar**
  - **Comportamiento esperado**
  - **Escenarios específicos ejecutados**
  - **Métricas asociadas**
- [ ] Explicar la metodología de validación:
  - Cómo se aplicaron las métricas
  - Qué herramientas se usaron (tests, queries SQL)
  - Período de simulación
- [ ] Definir soluciones esperadas por instancia

**Plantilla por instancia:**
```markdown
#### 6.3.1 Instancia 1: Padre Activo

**Perfil:** Apoderado de 2 estudiantes matriculados en primaria, usuario con conocimiento básico de tecnología.

**Contexto:** Padre involucrado que desea monitorear constantemente el rendimiento académico de sus hijos.

**Comportamiento Esperado:**
- Login diario durante horarios de tarde (18:00-20:00)
- Consulta de calificaciones 2-3 veces por semana
- Revisión de asistencia cada lunes
- Envío de 1-2 mensajes semanales a docentes

**Escenarios Ejecutados:**
1. Login exitoso con credenciales correctas
2. Consulta de calificaciones de hijo 1 (curso: Matemáticas)
3. Consulta de asistencia de hijo 2 del último mes
4. Lectura de 2 comunicados institucionales
5. Envío de mensaje a docente de Comunicación

**Métricas Validadas:**
- M1: Tasa de éxito en logins
- M2: Frecuencia de acceso a datos académicos
- M7: Frecuencia de logins por padre/semana
- M8: Módulos más consultados
- M11: Porcentaje de cursos consultados

**Solución Esperada:** 
El sistema debe registrar todos los accesos, mantener sesión estable, y mostrar información académica actualizada sin errores.
```

**Entregable:** Sección "6.3 Instancias de Prueba" (4-6 páginas)

---

### ✍️ **Paso 5.4: Redactar Sección "Pruebas y Resultados"**
**Objetivo:** Presentar evidencia visual de las pruebas

**Tareas:**
- [ ] Por cada métrica:
  - Insertar tabla con valores obtenidos
  - Insertar gráfico correspondiente
  - Escribir 1-2 párrafos de interpretación
  - Opcional: capturas de pantalla de pruebas
- [ ] Crear subsecciones por grupo de métricas:
  - 6.4.1 Resultados de Variable Independiente
  - 6.4.2 Resultados de Variable Dependiente

**Plantilla por métrica:**
```markdown
#### 6.4.1.1 Resultados de M1: Tasa de Éxito en Inicios de Sesión

**Tabla de Resultados:**

| Instancia | Intentos Totales | Exitosos | Fallidos | Tasa de Éxito |
|-----------|------------------|----------|----------|---------------|
| Padre Activo | 15 | 15 | 0 | 100% |
| Padre Reactivo | 5 | 5 | 0 | 100% |
| Docente | 10 | 10 | 0 | 100% |
| **TOTAL** | **30** | **30** | **0** | **100%** |

**Gráfico:**
[Insertar gráfico de barras]

**Interpretación:**
El sistema de autenticación demostró una confiabilidad del 100% durante el período de prueba, sin registrar intentos fallidos. Esto indica que el mecanismo de validación de credenciales funciona correctamente y no presenta fricción para los usuarios. Los 30 intentos exitosos corresponden a sesiones iniciadas por las 3 instancias de prueba sin errores de conexión ni problemas de validación.

**Capturas:**
[Opcional: Captura de pantalla de login exitoso]
```

**Entregable:** Sección "6.4 Pruebas y Resultados" (10-15 páginas con gráficos)

---

### ✍️ **Paso 5.5: Redactar Conclusiones del Capítulo**
**Objetivo:** Sintetizar hallazgos principales

**Tareas:**
- [ ] Resumir resultados clave de las 12 métricas
- [ ] Destacar logros del sistema:
  - Qué objetivos se cumplieron
  - Qué métricas superaron expectativas
- [ ] Identificar áreas de mejora (si las hay)
- [ ] Conectar con hipótesis de la tesis

**Entregable:** Sección "6.5 Conclusiones de la Validación" (2-3 páginas)

---

## **FASE 6: REVISIÓN Y AJUSTES**

### ✅ **Paso 6.1: Revisión Técnica**
**Tareas:**
- [ ] Verificar que todas las métricas estén correctamente calculadas
- [ ] Revisar queries SQL por posibles errores
- [ ] Validar que gráficos sean legibles y claros
- [ ] Confirmar que capturas sean de alta calidad

---

### ✅ **Paso 6.2: Revisión de Redacción**
**Tareas:**
- [ ] Leer capítulo completo en busca de:
  - Errores ortográficos/gramaticales
  - Inconsistencias en nomenclatura
  - Falta de claridad en explicaciones técnicas
- [ ] Verificar formato APA en citas (si aplica)
- [ ] Asegurar que el estilo sea académico formal

---

### ✅ **Paso 6.3: Validación con Asesor**
**Tareas:**
- [ ] Enviar borrador del Capítulo 6 a profesora
- [ ] Incorporar retroalimentación
- [ ] Ajustar métricas/gráficos según observaciones

**Entregable:** Capítulo 6 completo y aprobado

---

## **📦 ENTREGABLES FINALES**

Al completar este planning, tendrás:

1. ✅ **Matriz de Operacionalización Final** (12 indicadores)
2. ✅ **Base de datos con tablas de logging**
3. ✅ **Backend con sistema de métricas implementado**
4. ✅ **Seeds de prueba y data simulada**
5. ✅ **Suite de tests automatizados**
6. ✅ **12 gráficos + 12 tablas estadísticas**
7. ✅ **Documento "Análisis de Resultados"**
8. ✅ **Capítulo 6 completo de tu tesis (20-30 páginas)**

---

## **⏱️ ESTIMACIÓN DE TIEMPO**

| Fase | Duración Estimada |
|------|-------------------|
| Fase 0: Preparación | 1-2 días |
| Fase 1: Implementación Técnica | 3-4 días |
| Fase 2: Definición de Pruebas | 1-2 días |
| Fase 3: Ejecución de Pruebas | 2-3 días |
| Fase 4: Análisis y Visualización | 2-3 días |
| Fase 5: Redacción Capítulo 6 | 4-5 días |
| Fase 6: Revisión | 2 días |
| **TOTAL** | **15-21 días** |

