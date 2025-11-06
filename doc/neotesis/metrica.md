# MÉTRICAS DE LA MATRIZ DE OPERACIONALIZACIÓN

---

## VARIABLE INDEPENDIENTE: PLATAFORMA WEB DE COMUNICACIÓN

### DIMENSIÓN 1: ACCESO A INFORMACIÓN ACADÉMICA

**Descripción de la dimensión:**  
Capacidad de la plataforma para proporcionar a los padres de familia acceso oportuno, seguro y completo a la información académica de sus hijos (calificaciones y asistencia), medida a través de la frecuencia de consultas, cobertura de información revisada y constancia de seguimiento durante el período de validación.

**Métricas de la dimensión:**

**M1: Frecuencia de consulta de calificaciones**

- **Definición operacional:** Número promedio de veces que un usuario con rol de padre accede al módulo de calificaciones durante una semana del período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Frecuencia_semanal = Total_accesos_calificaciones / Número_semanas_prueba
  
  Pseudocódigo:
  accesos = COUNT(access_logs WHERE modulo='calificaciones' AND usuario_rol='apoderado' AND fecha BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  semanas = (fecha_fin_prueba - fecha_inicio_prueba) / 7
  Frecuencia_semanal = accesos / semanas
  ```

- **Variables de la fórmula:**
  - `Total_accesos_calificaciones`: Conteo de registros en tabla `access_logs` con módulo='calificaciones' (unidad: eventos)
  - `Número_semanas_prueba`: Duración del período de validación en semanas (unidad: semanas)

- **Unidad de medida:** Accesos por semana (accesos/semana)

- **Fuente de datos:**  
  - **Tabla:** `access_logs` (tabla a crear para tracking de navegación)
  - **Campos clave:** `id`, `usuario_id`, `modulo`, `timestamp`, `año_academico`
  - **Filtros:** `modulo='calificaciones'`, `usuario_id IN (SELECT id FROM usuarios WHERE rol='apoderado')`, `timestamp BETWEEN fecha_inicio_prueba AND fecha_fin_prueba`
  - **Join:** `access_logs INNER JOIN usuarios ON access_logs.usuario_id = usuarios.id`
  - **Eventos capturados:** Cada vez que un padre visualiza la vista de calificaciones de un estudiante

- **Criterios de calidad de datos:**
  - Validar que `timestamp` esté dentro del rango de prueba
  - Excluir registros con `usuario_id` nulo o inexistente
  - Eliminar duplicados dentro de ventanas de 5 segundos (recargas accidentales)
  - Validar que el usuario tenga relación activa con al menos un estudiante en `relaciones_familiares`

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 2 accesos/semana (indica seguimiento regular)
  - **Mínimo aceptable:** ≥ 1 acceso/semana (indica uso básico)
  - **Alerta:** < 1 acceso/semana (indica bajo involucramiento)

- **Sentido de la métrica:** Más alto es mejor. Indica mayor frecuencia de seguimiento académico por parte del padre.

- **Justificación:** Esta métrica valida si la plataforma logra promover el acceso recurrente a información de calificaciones, uno de los objetivos específicos centrales del proyecto. Frecuencias altas indican que los padres utilizan activamente el sistema para monitorear el desempeño académico.

---

**M2: Frecuencia de consulta de asistencia**

- **Definición operacional:** Número promedio de veces que un usuario con rol de padre accede al módulo de asistencia durante una semana del período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Frecuencia_semanal_asistencia = Total_accesos_asistencia / Número_semanas_prueba
  
  Pseudocódigo:
  accesos = COUNT(access_logs WHERE modulo='asistencia' AND usuario_rol='apoderado' AND fecha BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  semanas = (fecha_fin_prueba - fecha_inicio_prueba) / 7
  Frecuencia_semanal_asistencia = accesos / semanas
  ```

- **Variables de la fórmula:**
  - `Total_accesos_asistencia`: Conteo de registros en tabla `access_logs` con módulo='asistencia' (unidad: eventos)
  - `Número_semanas_prueba`: Duración del período de validación en semanas (unidad: semanas)

- **Unidad de medida:** Accesos por semana (accesos/semana)

- **Fuente de datos:**  
  - **Tabla:** `access_logs`
  - **Campos clave:** `id`, `usuario_id`, `modulo`, `timestamp`, `año_academico`
  - **Filtros:** `modulo='asistencia'`, `usuario_id IN (SELECT id FROM usuarios WHERE rol='apoderado')`, `timestamp BETWEEN fecha_inicio_prueba AND fecha_fin_prueba`
  - **Join:** `access_logs INNER JOIN usuarios ON access_logs.usuario_id = usuarios.id`
  - **Eventos capturados:** Cada vez que un padre visualiza el calendario/registro de asistencia de un estudiante

- **Criterios de calidad de datos:**
  - Validar que `timestamp` esté dentro del rango de prueba
  - Excluir registros con `usuario_id` nulo
  - Eliminar duplicados dentro de ventanas de 5 segundos
  - Validar existencia de relación padre-estudiante en `relaciones_familiares` con `estado_activo=true`

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 2 accesos/semana
  - **Mínimo aceptable:** ≥ 1 acceso/semana
  - **Alerta:** < 1 acceso/semana

- **Sentido de la métrica:** Más alto es mejor. Indica mayor frecuencia de seguimiento de asistencia.

- **Justificación:** Complementa M1 al validar si los padres consultan información de asistencia regularmente, permitiendo detectar problemas de inasistencia tempranamente según el planteamiento del problema de investigación.

---

**M3: Cobertura de consulta académica**

- **Definición operacional:** Porcentaje de cursos del estudiante que han sido consultados al menos una vez por el padre durante el período completo de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Cobertura = (Cursos_consultados / Total_cursos_estudiante) × 100
  
  Pseudocódigo:
  cursos_consultados = COUNT(DISTINCT curso_id FROM access_logs 
                             WHERE usuario_id=padre_id 
                             AND estudiante_id=hijo_id 
                             AND modulo IN ('calificaciones', 'asistencia') 
                             AND fecha BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  
  total_cursos = COUNT(cursos WHERE estudiante_id=hijo_id AND año_academico=año_actual AND estado_activo=true)
  
  Cobertura = (cursos_consultados / total_cursos) × 100
  ```

- **Variables de la fórmula:**
  - `Cursos_consultados`: Cantidad de cursos únicos consultados por el padre (unidad: cursos)
  - `Total_cursos_estudiante`: Cantidad total de cursos asignados al estudiante en el año académico (unidad: cursos)

- **Unidad de medida:** Porcentaje (%)

- **Fuente de datos:**  
  - **Tablas:** `access_logs`, `cursos`, `estudiantes`, `relaciones_familiares`
  - **Campos clave:** 
    - `access_logs`: `usuario_id`, `estudiante_id`, `curso_id`, `modulo`, `timestamp`
    - `cursos`: `id`, `nivel_grado_id`, `año_academico`, `estado_activo`
    - `relaciones_familiares`: `apoderado_id`, `estudiante_id`, `estado_activo`
  - **Filtros:** `modulo IN ('calificaciones', 'asistencia')`, `estado_activo=true`, año académico válido
  - **Join:** 
    ```sql
    access_logs 
    INNER JOIN relaciones_familiares ON access_logs.usuario_id = relaciones_familiares.apoderado_id
    INNER JOIN estudiantes ON relaciones_familiares.estudiante_id = estudiantes.id
    INNER JOIN cursos ON estudiantes.nivel_grado_id = cursos.nivel_grado_id
    ```

- **Criterios de calidad de datos:**
  - Validar que el estudiante tenga al menos 1 curso activo
  - Excluir cursos con `estado_activo=false`
  - Validar que `curso_id` en `access_logs` exista en tabla `cursos`
  - Verificar coherencia de `año_academico` entre tablas

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 80% (indica seguimiento integral de todos los cursos)
  - **Mínimo aceptable:** ≥ 50% (indica seguimiento parcial)
  - **Alerta:** < 50% (indica seguimiento fragmentado o insuficiente)

- **Sentido de la métrica:** Más alto es mejor. Un valor cercano a 100% indica que el padre revisa información de todos los cursos, no solo de algunos selectivamente.

- **Justificación:** Esta métrica valida la profundidad del seguimiento académico. No basta con acceder frecuentemente si solo se consultan 1 o 2 cursos de 8 totales. Complementa M1 y M2 al evaluar la cobertura integral del seguimiento parental.

---

### DIMENSIÓN 2: COMUNICACIÓN INSTITUCIONAL

**Descripción de la dimensión:**  
Efectividad de la plataforma para garantizar que la comunicación institucional (comunicados y notificaciones) llegue de manera oportuna, clara y sea visualizada por los padres de familia, medida a través de tasas de lectura, tiempos de visualización y efectividad de alertas automáticas.

**Métricas de la dimensión:**

**M4: Tasa de lectura de comunicados**

- **Definición operacional:** Porcentaje de comunicados publicados dirigidos a un padre que efectivamente fueron leídos por dicho padre durante el período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Tasa_lectura = (Comunicados_leidos / Comunicados_publicados_dirigidos) × 100
  
  Pseudocódigo:
  comunicados_leidos = COUNT(comunicados_lecturas WHERE usuario_id=padre_id AND fecha_lectura IS NOT NULL)
  
  comunicados_publicados = COUNT(comunicados WHERE estado='publicado' 
                                   AND fecha_publicacion BETWEEN fecha_inicio_prueba AND fecha_fin_prueba
                                   AND padre_id IN publico_objetivo)
  
  Tasa_lectura = (comunicados_leidos / comunicados_publicados) × 100
  ```

- **Variables de la fórmula:**
  - `Comunicados_leidos`: Cantidad de comunicados leídos por el padre (unidad: comunicados)
  - `Comunicados_publicados_dirigidos`: Cantidad de comunicados publicados dirigidos al padre (unidad: comunicados)

- **Unidad de medida:** Porcentaje (%)

- **Fuente de datos:**  
  - **Tablas:** `comunicados`, `comunicados_lecturas`, `usuarios`
  - **Campos clave:** 
    - `comunicados`: `id`, `estado`, `fecha_publicacion`, `publico_objetivo`, `tipo`
    - `comunicados_lecturas`: `id`, `comunicado_id`, `usuario_id`, `fecha_lectura`
  - **Filtros:** `estado='publicado'`, `fecha_publicacion BETWEEN fecha_inicio_prueba AND fecha_fin_prueba`, `usuario_id=padre_id`
  - **Join:** 
    ```sql
    comunicados 
    LEFT JOIN comunicados_lecturas ON comunicados.id = comunicados_lecturas.comunicado_id AND comunicados_lecturas.usuario_id = padre_id
    ```

- **Criterios de calidad de datos:**
  - Validar que `fecha_publicacion` sea anterior a `fecha_lectura`
  - Excluir comunicados con `estado != 'publicado'`
  - Validar que el padre esté incluido en `publico_objetivo` del comunicado
  - Eliminar duplicados de lectura (considerar solo la primera lectura)

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 90% (casi todos los comunicados son leídos)
  - **Mínimo aceptable:** ≥ 70% (mayoría de comunicados leídos)
  - **Alerta:** < 70% (comunicados no están llegando efectivamente)

- **Sentido de la métrica:** Más alto es mejor. Indica que los comunicados institucionales cumplen su función de informar.

- **Justificación:** Valida el Objetivo Específico 2 sobre garantizar llegada efectiva de comunicación institucional. Una tasa baja indica problemas de visibilidad, notificación o relevancia de los comunicados.

---

**M5: Tiempo promedio hasta lectura de comunicados**

- **Definición operacional:** Tiempo promedio transcurrido (en horas) entre la publicación de un comunicado y su primera lectura por parte de un padre durante el período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Tiempo_promedio = Σ(fecha_lectura - fecha_publicacion) / N_comunicados_leidos
  
  Pseudocódigo:
  tiempos = []
  FOR EACH comunicado_lectura IN comunicados_lecturas WHERE usuario_id=padre_id:
      comunicado = SELECT * FROM comunicados WHERE id=comunicado_lectura.comunicado_id
      tiempo_horas = (comunicado_lectura.fecha_lectura - comunicado.fecha_publicacion) IN HOURS
      tiempos.append(tiempo_horas)
  
  Tiempo_promedio = SUM(tiempos) / COUNT(tiempos)
  ```

- **Variables de la fórmula:**
  - `fecha_lectura`: Timestamp de lectura del comunicado (unidad: datetime)
  - `fecha_publicacion`: Timestamp de publicación del comunicado (unidad: datetime)
  - `N_comunicados_leidos`: Cantidad de comunicados leídos (unidad: comunicados)

- **Unidad de medida:** Horas (h)

- **Fuente de datos:**  
  - **Tablas:** `comunicados`, `comunicados_lecturas`
  - **Campos clave:** 
    - `comunicados`: `id`, `fecha_publicacion`
    - `comunicados_lecturas`: `comunicado_id`, `usuario_id`, `fecha_lectura`
  - **Cálculo:** Diferencia temporal en horas usando función `EXTRACT(EPOCH FROM (fecha_lectura - fecha_publicacion))/3600`
  - **Filtros:** Solo comunicados con `fecha_lectura IS NOT NULL`

- **Criterios de calidad de datos:**
  - Validar que `fecha_lectura > fecha_publicacion` (valores negativos son error)
  - Excluir valores atípicos (>168 horas = 7 días sugiere que el comunicado no fue relevante)
  - Validar que ambas fechas estén en el rango de prueba
  - Excluir comunicados programados no publicados aún

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≤ 24 horas (lectura dentro del día de publicación)
  - **Aceptable:** ≤ 48 horas (lectura dentro de 2 días)
  - **Alerta:** > 48 horas (lectura muy tardía, comunicación inefectiva)

- **Sentido de la métrica:** Más bajo es mejor. Tiempos cortos indican que los padres revisan comunicados rápidamente.

- **Justificación:** Complementa M4 al medir la oportunidad de la comunicación. Un comunicado puede ser leído (100% de tasa) pero si se lee 5 días después, pierde efectividad. Esta métrica valida la "oportunidad" mencionada en el Objetivo Específico 2.

---

**M6: Tasa de visualización de notificaciones**

- **Definición operacional:** Porcentaje de notificaciones enviadas a un padre que fueron visualizadas (marcadas como leídas) durante el período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Tasa_visualizacion = (Notificaciones_vistas / Notificaciones_enviadas) × 100
  
  Pseudocódigo:
  notificaciones_vistas = COUNT(notificaciones WHERE usuario_id=padre_id 
                                  AND estado_plataforma='leida' 
                                  AND fecha_creacion BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  
  notificaciones_enviadas = COUNT(notificaciones WHERE usuario_id=padre_id 
                                   AND fecha_creacion BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  
  Tasa_visualizacion = (notificaciones_vistas / notificaciones_enviadas) × 100
  ```

- **Variables de la fórmula:**
  - `Notificaciones_vistas`: Cantidad de notificaciones con `estado_plataforma='leida'` (unidad: notificaciones)
  - `Notificaciones_enviadas`: Cantidad total de notificaciones enviadas al padre (unidad: notificaciones)

- **Unidad de medida:** Porcentaje (%)

- **Fuente de datos:**  
  - **Tabla:** `notificaciones`
  - **Campos clave:** `id`, `usuario_id`, `tipo`, `estado_plataforma`, `fecha_creacion`, `fecha_lectura`
  - **Filtros:** `usuario_id=padre_id`, `fecha_creacion BETWEEN fecha_inicio_prueba AND fecha_fin_prueba`
  - **Estados válidos:** `estado_plataforma IN ('entregada', 'leida')`

- **Criterios de calidad de datos:**
  - Validar que `fecha_lectura >= fecha_creacion` cuando `estado_plataforma='leida'`
  - Excluir notificaciones con `estado_plataforma='error'` del denominador
  - Validar que `usuario_id` exista en tabla `usuarios` con `rol='apoderado'`
  - Considerar solo notificaciones con `canal IN ('plataforma', 'ambos')`

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 85% (casi todas las notificaciones son visualizadas)
  - **Mínimo aceptable:** ≥ 60% (mayoría visualizada)
  - **Alerta:** < 60% (sistema de notificaciones poco efectivo)

- **Sentido de la métrica:** Más alto es mejor. Indica que el sistema de notificaciones cumple su función de alertar.

- **Justificación:** Las notificaciones son el mecanismo principal para eventos críticos (inasistencias, calificaciones bajas). Una tasa baja indica que los padres no están siendo alertados efectivamente, lo cual contradice el objetivo de "garantizar comunicación oportuna".

---

### DIMENSIÓN 3: MECANISMOS DE SOSTENIBILIDAD

**Descripción de la dimensión:**  
Capacidad del sistema para garantizar su sostenibilidad y mejora continua mediante mecanismos de retroalimentación (encuestas) y soporte técnico eficiente, medida a través de tasas de participación, calidad de respuestas y tiempos de resolución de incidencias.

**Métricas de la dimensión:**

**M7: Tasa de participación en encuestas**

- **Definición operacional:** Porcentaje de encuestas publicadas dirigidas a un padre que fueron efectivamente respondidas por dicho padre durante el período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Tasa_participacion = (Encuestas_respondidas / Encuestas_enviadas) × 100
  
  Pseudocódigo:
  encuestas_respondidas = COUNT(respuestas_encuestas WHERE usuario_id=padre_id 
                                 AND fecha_respuesta BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  
  encuestas_enviadas = COUNT(encuestas WHERE estado='activa' 
                              AND fecha_inicio BETWEEN fecha_inicio_prueba AND fecha_fin_prueba
                              AND padre_id IN publico_objetivo)
  
  Tasa_participacion = (encuestas_respondidas / encuestas_enviadas) × 100
  ```

- **Variables de la fórmula:**
  - `Encuestas_respondidas`: Cantidad de encuestas respondidas por el padre (unidad: encuestas)
  - `Encuestas_enviadas`: Cantidad de encuestas publicadas dirigidas al padre (unidad: encuestas)

- **Unidad de medida:** Porcentaje (%)

- **Fuente de datos:**  
  - **Tablas:** `encuestas`, `respuestas_encuestas`
  - **Campos clave:** 
    - `encuestas`: `id`, `estado`, `fecha_inicio`, `fecha_vencimiento`
    - `respuestas_encuestas`: `id`, `encuesta_id`, `usuario_id`, `fecha_respuesta`
  - **Filtros:** `estado='activa'`, `fecha_inicio <= fecha_fin_prueba`, `fecha_vencimiento >= fecha_inicio_prueba`
  - **Join:** 
    ```sql
    encuestas 
    LEFT JOIN respuestas_encuestas ON encuestas.id = respuestas_encuestas.encuesta_id AND respuestas_encuestas.usuario_id = padre_id
    ```

- **Criterios de calidad de datos:**
  - Validar que `fecha_respuesta` esté entre `fecha_inicio` y `fecha_vencimiento` de la encuesta
  - Excluir encuestas con `estado IN ('borrador', 'cerrada', 'vencida')` fuera del período activo
  - Validar unicidad de respuesta por usuario (`UNIQUE(encuesta_id, usuario_id)`)
  - Excluir respuestas incompletas (sin ninguna pregunta respondida)

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 70% (mayoría participa en retroalimentación)
  - **Mínimo aceptable:** ≥ 50% (mitad de usuarios participan)
  - **Alerta:** < 50% (baja participación en mecanismos de mejora)

- **Sentido de la métrica:** Más alto es mejor. Indica compromiso de los usuarios con la mejora del sistema.

- **Justificación:** Valida el Objetivo Específico 3 sobre implementar mecanismos de retroalimentación. Sin participación en encuestas, no hay datos para mejora continua ni evidencia de que los usuarios valoran el canal de comunicación.

---

**M8: Tiempo promedio de resolución de tickets**

- **Definición operacional:** Tiempo promedio transcurrido (en horas) entre la creación de un ticket de soporte y su resolución durante el período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Tiempo_resolucion = Σ(fecha_resolucion - fecha_creacion) / N_tickets_resueltos
  
  Pseudocódigo:
  tiempos = []
  FOR EACH ticket IN tickets_soporte WHERE estado='resuelto' AND fecha_creacion BETWEEN fecha_inicio_prueba AND fecha_fin_prueba:
      tiempo_horas = (ticket.fecha_resolucion - ticket.fecha_creacion) IN HOURS
      tiempos.append(tiempo_horas)
  
  Tiempo_resolucion = SUM(tiempos) / COUNT(tiempos)
  ```

- **Variables de la fórmula:**
  - `fecha_resolucion`: Timestamp de resolución del ticket (unidad: datetime)
  - `fecha_creacion`: Timestamp de creación del ticket (unidad: datetime)
  - `N_tickets_resueltos`: Cantidad de tickets resueltos (unidad: tickets)

- **Unidad de medida:** Horas (h)

- **Fuente de datos:**  
  - **Tabla:** `tickets_soporte`
  - **Campos clave:** `id`, `numero_ticket`, `usuario_id`, `categoria`, `prioridad`, `estado`, `fecha_creacion`, `fecha_resolucion`
  - **Cálculo:** Diferencia temporal en horas usando `EXTRACT(EPOCH FROM (fecha_resolucion - fecha_creacion))/3600`
  - **Filtros:** `estado='resuelto'`, `fecha_creacion BETWEEN fecha_inicio_prueba AND fecha_fin_prueba`, `fecha_resolucion IS NOT NULL`

- **Criterios de calidad de datos:**
  - Validar que `fecha_resolucion > fecha_creacion` (valores negativos son error)
  - Excluir tickets con `estado IN ('cancelado', 'pendiente')` del cálculo
  - Excluir valores atípicos (>72 horas para tickets de prioridad 'critica')
  - Validar que el ticket tenga al menos una respuesta en `respuestas_tickets`

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≤ 24 horas (resolución dentro del día)
  - **Aceptable:** ≤ 48 horas (resolución en 2 días)
  - **Alerta:** > 48 horas (soporte técnico ineficiente)
  - **Crítico:** > 72 horas para tickets con `prioridad='critica'`

- **Sentido de la métrica:** Más bajo es mejor. Tiempos cortos indican soporte técnico eficiente.

- **Justificación:** Valida el Objetivo Específico 3 sobre garantizar sostenibilidad. Un sistema con soporte técnico lento genera frustración y abandono. Esta métrica mide la capacidad del sistema para resolver problemas técnicos que impidan el uso efectivo de la plataforma.

---

## VARIABLE DEPENDIENTE: NIVEL DE COMUNICACIÓN Y SEGUIMIENTO PARENTAL

### DIMENSIÓN 4: FRECUENCIA DE ACCESO A INFORMACIÓN

**Descripción de la dimensión:**  
Intensidad y constancia con la que los padres de familia acceden a la plataforma y consultan información académica de sus hijos, medida a través de frecuencia de inicios de sesión, constancia temporal de uso y diversidad de módulos consultados durante el período de validación.

**Métricas de la dimensión:**

**M9: Frecuencia de logins semanales**

- **Definición operacional:** Número promedio de inicios de sesión exitosos de un padre por semana durante el período de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Frecuencia_logins = Total_logins_exitosos / Número_semanas_prueba
  
  Pseudocódigo:
  logins_exitosos = COUNT(auth_logs WHERE usuario_id=padre_id 
                           AND evento='login_exitoso' 
                           AND fecha BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  
  semanas = (fecha_fin_prueba - fecha_inicio_prueba) / 7
  
  Frecuencia_logins = logins_exitosos / semanas
  ```

- **Variables de la fórmula:**
  - `Total_logins_exitosos`: Conteo de eventos de login exitosos (unidad: eventos)
  - `Número_semanas_prueba`: Duración en semanas del período de validación (unidad: semanas)

- **Unidad de medida:** Logins por semana (logins/semana)

- **Fuente de datos:**  
  - **Tabla:** `auth_logs` (tabla a crear para registro de autenticación)
  - **Campos clave:** `id`, `usuario_id`, `evento`, `timestamp`, `ip_address`, `exito`
  - **Filtros:** `evento='login'`, `exito=true`, `usuario_id IN (SELECT id FROM usuarios WHERE rol='apoderado')`
  - **Eventos capturados:** Cada autenticación exitosa con generación de JWT válido

- **Criterios de calidad de datos:**
  - Excluir logins con `exito=false` (intentos fallidos)
  - Validar que `timestamp` esté dentro del rango de prueba
  - Eliminar duplicados dentro de ventanas de 30 segundos (sesiones múltiples simultáneas)
  - Validar que `usuario_id` exista en tabla `usuarios` con `estado_activo=true`

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 4 logins/semana (acceso casi diario)
  - **Mínimo aceptable:** ≥ 2 logins/semana (acceso inter-diario)
  - **Alerta:** < 2 logins/semana (acceso esporádico, bajo seguimiento)

- **Sentido de la métrica:** Más alto es mejor. Indica mayor constancia en el seguimiento académico.

- **Justificación:** Valida la Variable Dependiente central: "Nivel de comunicación y seguimiento parental". Logins frecuentes indican que la plataforma se convirtió en un canal habitual de información, no ocasional.

---

**M10: Constancia en el seguimiento**

- **Definición operacional:** Porcentaje de días del período de prueba en los que el padre accedió al menos una vez a la plataforma.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Constancia = (Días_con_acceso / Total_días_prueba) × 100
  
  Pseudocódigo:
  dias_unicos = COUNT(DISTINCT DATE(timestamp) FROM auth_logs 
                      WHERE usuario_id=padre_id 
                      AND evento='login_exitoso' 
                      AND fecha BETWEEN fecha_inicio_prueba AND fecha_fin_prueba)
  
  total_dias = (fecha_fin_prueba - fecha_inicio_prueba) + 1
  
  Constancia = (dias_unicos / total_dias) × 100
  ```

- **Variables de la fórmula:**
  - `Días_con_acceso`: Cantidad de días únicos con al menos 1 login (unidad: días)
  - `Total_días_prueba`: Duración en días del período de validación (unidad: días)

- **Unidad de medida:** Porcentaje (%)

- **Fuente de datos:**  
  **Tabla:** `auth_logs`
  - **Campos clave:** `id`, `usuario_id`, `evento`, `timestamp`, `exito`
  - **Transformación:** Extracción de fecha única mediante `DATE(timestamp)`
  - **Filtros:** `evento='login'`, `exito=true`, `usuario_id=padre_id`, rango de fechas de prueba
  - **Agregación:** `COUNT(DISTINCT DATE(timestamp))`

- **Criterios de calidad de datos:**
  - Validar que `timestamp` esté en zona horaria correcta (UTC-5 para Perú)
  - Excluir días sin logins exitosos (`exito=false`)
  - Validar coherencia temporal (fechas futuras son error)
  - Considerar solo días hábiles si se requiere análisis diferenciado

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 60% (acceso en más de la mitad de los días)
  - **Mínimo aceptable:** ≥ 40% (acceso regular aunque no diario)
  - **Alerta:** < 40% (uso esporádico, bajo compromiso)

- **Sentido de la métrica:** Más alto es mejor. Indica regularidad y hábito de uso.

- **Justificación:** Complementa M9 al medir distribución temporal del acceso. Un padre puede tener 14 logins en 2 semanas pero concentrados en 3 días, lo que indica uso irregular. Esta métrica valida si el seguimiento es constante o intermitente.


---

### DIMENSIÓN 5: OPORTUNIDAD EN LA COMUNICACIÓN

**Descripción de la dimensión:**  
Rapidez con la que los padres reaccionan y visualizan información crítica enviada por la institución (alertas y comunicados urgentes), medida a través de tiempos de reacción, frecuencia de revisión post-alerta y patrones de respuesta a eventos académicos relevantes.

**Métricas de la dimensión:**

**M11: Tiempo de reacción a alertas críticas**

- **Definición operacional:** Tiempo promedio transcurrido (en horas) entre el envío de una notificación crítica (inasistencia, calificación baja) y su visualización por parte del padre.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Tiempo_reaccion = Σ(fecha_lectura - fecha_envio) / N_alertas_criticas
  
  Pseudocódigo:
  tiempos = []
  FOR EACH notificacion IN notificaciones WHERE usuario_id=padre_id 
                                           AND tipo IN ('asistencia', 'calificacion') 
                                           AND datos_adicionales.criticidad='alta':
      IF notificacion.fecha_lectura IS NOT NULL:
          tiempo_horas = (notificacion.fecha_lectura - notificacion.fecha_creacion) IN HOURS
          tiempos.append(tiempo_horas)
  
  Tiempo_reaccion = SUM(tiempos) / COUNT(tiempos)
  ```

- **Variables de la fórmula:**
  - `fecha_lectura`: Timestamp de visualización de la notificación (unidad: datetime)
  - `fecha_envio`: Timestamp de creación de la notificación (unidad: datetime)
  - `N_alertas_criticas`: Cantidad de notificaciones críticas visualizadas (unidad: notificaciones)

- **Unidad de medida:** Horas (h)

- **Fuente de datos:**  
  - **Tabla:** `notificaciones`
  - **Campos clave:** `id`, `usuario_id`, `tipo`, `fecha_creacion`, `fecha_lectura`, `datos_adicionales`, `estado_plataforma`
  - **Cálculo:** Diferencia temporal en horas usando `EXTRACT(EPOCH FROM (fecha_lectura - fecha_creacion))/3600`
  - **Filtros:** `tipo IN ('asistencia', 'calificacion')`, `JSON_EXTRACT(datos_adicionales, '$.criticidad')='alta'`, `fecha_lectura IS NOT NULL`
  - **Criticidad:** Definida en campo JSON `datos_adicionales` con valores: `baja`, `media`, `alta`

- **Criterios de calidad de datos:**
  - Validar que `fecha_lectura > fecha_creacion`
  - Excluir notificaciones con `estado_plataforma='error'`
  - Excluir valores atípicos (>72 horas sugiere que la alerta no fue relevante)
  - Validar existencia de campo `criticidad` en `datos_adicionales`
  - Considerar solo alertas generadas durante horarios hábiles (7am-10pm)

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≤ 2 horas (reacción inmediata a eventos críticos)
  - **Aceptable:** ≤ 12 horas (reacción dentro del mismo día)
  - **Alerta:** > 24 horas (reacción tardía, alerta pierde efectividad)

- **Sentido de la métrica:** Más bajo es mejor. Tiempos cortos indican que los padres atienden rápidamente eventos críticos.

- **Justificación:** Valida el impacto del sistema de notificaciones híbrido (plataforma + WhatsApp) mencionado en el Capítulo 4. Si las alertas críticas no generan reacción rápida, el sistema falla en su objetivo de promover intervención oportuna ante problemas académicos.

---

**M12: Frecuencia de revisión post-alerta**

- **Definición operacional:** Número promedio de accesos al módulo académico relevante (calificaciones o asistencia) en las 24 horas posteriores a recibir una notificación relacionada.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Frecuencia_post_alerta = Σ(accesos_24h_post_notificacion) / N_notificaciones_academicas
  
  Pseudocódigo:
  total_accesos = 0
  notificaciones_con_seguimiento = 0
  
  FOR EACH notificacion IN notificaciones WHERE usuario_id=padre_id 
                                           AND tipo IN ('asistencia', 'calificacion'):
      modulo_relacionado = 'calificaciones' IF notificacion.tipo='calificacion' ELSE 'asistencia'
      
      accesos_24h = COUNT(access_logs WHERE usuario_id=padre_id 
                                       AND modulo=modulo_relacionado
                                       AND timestamp BETWEEN notificacion.fecha_creacion AND (notificacion.fecha_creacion + 24 HOURS))
      
      IF accesos_24h > 0:
          total_accesos += accesos_24h
          notificaciones_con_seguimiento += 1
  
  Frecuencia_post_alerta = total_accesos / notificaciones_con_seguimiento
  ```

- **Variables de la fórmula:**
  - `accesos_24h_post_notificacion`: Cantidad de accesos al módulo en ventana de 24h (unidad: accesos)
  - `N_notificaciones_academicas`: Cantidad de notificaciones académicas con seguimiento (unidad: notificaciones)

- **Unidad de medida:** Accesos por notificación (accesos/notificación)

- **Fuente de datos:**  
  - **Tablas:** `notificaciones`, `access_logs`
  - **Campos clave:** 
    - `notificaciones`: `id`, `usuario_id`, `tipo`, `fecha_creacion`, `estudiante_id`
    - `access_logs`: `usuario_id`, `modulo`, `timestamp`, `estudiante_id`
  - **Ventana temporal:** 24 horas posteriores a `fecha_creacion` de notificación
  - **Join:** Correlación por `usuario_id`, `estudiante_id` y `timestamp`

- **Criterios de calidad de datos:**
  - Validar que `access_logs.timestamp` esté entre `notificacion.fecha_creacion` y `notificacion.fecha_creacion + INTERVAL '24 hours'`
  - Excluir accesos previos a la notificación
  - Validar coherencia entre `tipo` de notificación y `modulo` accedido
  - Excluir notificaciones sin seguimiento (0 accesos) del cálculo
  - Validar que `estudiante_id` coincida entre notificación y access_log

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 2 accesos/notificación (seguimiento detallado tras alerta)
  - **Mínimo aceptable:** ≥ 1 acceso/notificación (al menos revisa la información)
  - **Alerta:** < 1 acceso/notificación (alertas no generan seguimiento)

- **Sentido de la métrica:** Más alto es mejor. Indica que las notificaciones generan acción (revisión profunda del problema).

- **Justificación:** Valida el comportamiento reactivo de los padres ante alertas. No basta con leer la notificación (M12), sino verificar si genera acción concreta de revisión del módulo académico relacionado. Esta métrica evalúa si el sistema de alertas cumple su función de promover seguimiento activo.

---

### DIMENSIÓN 6: NIVEL DE INVOLUCRAMIENTO PARENTAL

**Descripción de la dimensión:**  
Grado de compromiso activo de los padres con el sistema y el proceso educativo de sus hijos, medido a través de patrones de interacción significativa, participación voluntaria y consistencia entre acceso y profundidad de uso durante el período de validación.

**Métricas de la dimensión:**

**M13: Tasa de participación activa en el sistema**

- **Definición operacional:** Porcentaje de días del período de prueba en los que el padre realizó al menos 2 accesos significativos a módulos académicos (no solo login).

- **Fórmula (matemática y pseudocálculo):**
  ```
  Tasa_participacion_activa = (Días_con_participacion_activa / Total_días_prueba) × 100
  
  Pseudocódigo:
  dias_activos = 0
  
  FOR EACH dia IN range(fecha_inicio_prueba, fecha_fin_prueba):
      accesos_dia = COUNT(access_logs WHERE usuario_id=padre_id 
                                       AND DATE(timestamp)=dia
                                       AND modulo IN ('calificaciones', 'asistencia', 'comunicados')
                                       AND duracion_sesion > 10 segundos)
      
      IF accesos_dia >= 2:
          dias_activos += 1
  
  total_dias = (fecha_fin_prueba - fecha_inicio_prueba) + 1
  
  Tasa_participacion_activa = (dias_activos / total_dias) × 100
  ```

- **Variables de la fórmula:**
  - `Días_con_participacion_activa`: Cantidad de días con ≥2 accesos significativos (unidad: días)
  - `Total_días_prueba`: Duración total del período en días (unidad: días)
  - `duracion_sesion`: Tiempo en segundos entre timestamp de acceso y siguiente acción (unidad: segundos)

- **Unidad de medida:** Porcentaje (%)

- **Fuente de datos:**  
  - **Tabla:** `access_logs`
  - **Campos clave:** `id`, `usuario_id`, `modulo`, `timestamp`, `session_id`, `duracion_sesion`
  - **Cálculo de duración:** Diferencia entre timestamps consecutivos del mismo `session_id`
  - **Filtros:** `modulo IN ('calificaciones', 'asistencia', 'comunicados')`, `duracion_sesion >= 10`
  - **Agregación:** Agrupación por `DATE(timestamp)` y conteo de accesos

- **Criterios de calidad de datos:**
  - Validar que `duracion_sesion > 0` (excluir accesos sin interacción)
  - Excluir accesos con duración sospechosamente alta (>30 minutos sin actividad = sesión abandonada)
  - Validar que `session_id` sea consistente dentro del día
  - Normalizar zonas horarias a UTC-5 (hora local de Lima, Perú)
  - Excluir módulos no académicos (perfil, configuración, FAQ)

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 50% (participación activa en mitad de los días)
  - **Mínimo aceptable:** ≥ 30% (participación activa en 1/3 de los días)
  - **Alerta:** < 30% (bajo involucramiento real, uso superficial)

- **Sentido de la métrica:** Más alto es mejor. Diferencia entre acceso pasivo (solo login) y participación activa (consulta múltiple).

- **Justificación:** Valida la profundidad del involucramiento parental más allá de simples logins. Un padre puede iniciar sesión diariamente (M9 alta) pero solo para una consulta rápida sin seguimiento real. Esta métrica identifica participación genuina y sostenida.

---

**M14: Diversidad de uso del sistema**

- **Definición operacional:** Cantidad de módulos diferentes del sistema consultados al menos una vez por el padre durante el período completo de prueba.

- **Fórmula (matemática y pseudocálculo):**
  ```
  Diversidad = COUNT(DISTINCT modulo)
  
  Pseudocódigo:
  modulos_usados = COUNT(DISTINCT modulo FROM access_logs 
                         WHERE usuario_id=padre_id 
                         AND fecha BETWEEN fecha_inicio_prueba AND fecha_fin_prueba
                         AND modulo IS NOT NULL)
  
  Diversidad = modulos_usados
  ```

- **Variables de la fórmula:**
  - `modulos_usados`: Cantidad de módulos únicos accedidos (unidad: módulos)
  - Módulos válidos: `calificaciones`, `asistencia`, `comunicados`, `notificaciones`, `encuestas`, `soporte`

- **Unidad de medida:** Cantidad de módulos (módulos)

- **Fuente de datos:**  
  - **Tabla:** `access_logs`
  - **Campos clave:** `id`, `usuario_id`, `modulo`, `timestamp`
  - **Valores válidos de módulo:** Lista cerrada de módulos funcionales del sistema
  - **Filtros:** `usuario_id=padre_id`, `modulo IS NOT NULL`, rango de fechas
  - **Agregación:** `COUNT(DISTINCT modulo)`

- **Criterios de calidad de datos:**
  - Validar que `modulo` pertenezca a lista de módulos válidos
  - Excluir valores NULL o vacíos en campo `modulo`
  - Normalizar nombres de módulos (minúsculas, sin espacios)
  - Validar que cada módulo tenga al menos 1 interacción significativa (>5 segundos de permanencia)

- **Umbrales y criterios de aceptación/alerta:**
  - **Objetivo:** ≥ 4 módulos (uso integral del sistema)
  - **Mínimo aceptable:** ≥ 3 módulos (uso básico de funcionalidades core)
  - **Alerta:** ≤ 2 módulos (uso limitado, posible desconocimiento de funcionalidades)

- **Sentido de la métrica:** Más alto es mejor. Indica que el padre explora y utiliza múltiples funcionalidades.

- **Justificación:** Valida si la plataforma se usa integralmente o solo parcialmente. Un padre que solo consulta calificaciones pero nunca lee comunicados o notificaciones tiene un seguimiento incompleto. Esta métrica evalúa la amplitud de uso del sistema.


---

## REGLAS DE CONSISTENCIA APLICADAS

1. **Coherencia entre definición, fórmula, unidad y fuente:**  
   Cada métrica especifica claramente qué mide, cómo se calcula, en qué unidad se expresa y de dónde provienen los datos, garantizando trazabilidad metodológica completa.

2. **Especificación de filtros y ventanas temporales:**  
   Todas las consultas a bases de datos incluyen filtros explícitos (rangos de fechas, roles, estados válidos) para evitar ambigüedades en la recolección de datos.

3. **Validación de calidad de datos:**  
   Cada métrica define criterios de validación (valores nulos, duplicados, atípicos, coherencia temporal) para garantizar confiabilidad de los resultados.

4. **Umbrales definidos y justificados:**  
   Todos los umbrales de aceptación/alerta están fundamentados en el contexto educativo y los objetivos de la investigación, proporcionando criterios claros de evaluación.

5. **Propuesta de fuentes faltantes:**  
   Las tablas `access_logs` y `auth_logs` no existen en el schema actual pero se proponen como fuentes necesarias para tracking de navegación y autenticación, especificando campos mínimos requeridos.

6. **Métrica compuesta con ponderaciones explícitas:**  
   La métrica M15 (Índice de involucramiento integral) especifica las ponderaciones utilizadas (40%-30%-30%) y la justificación de su combinación lineal.

7. **Sentido direccional claro:**  
   Cada métrica indica explícitamente si valores altos o bajos son deseables, evitando interpretaciones erróneas durante el análisis.

8. **Justificación vinculada a objetivos:**  
   Todas las métricas se vinculan directamente con los Problemas y Objetivos Específicos de la investigación, garantizando relevancia metodológica.

---

## TABLAS ADICIONALES REQUERIDAS (No existentes en schema actual)

Para implementar estas métricas, se requiere crear las siguientes tablas en el sistema:

### Tabla: `auth_logs`
```sql
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  evento VARCHAR(50) NOT NULL, -- 'login', 'logout', 'intento_fallido'
  exito BOOLEAN NOT NULL DEFAULT true,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id UUID,
  año_academico INT NOT NULL
);

CREATE INDEX idx_auth_logs_usuario_fecha ON auth_logs(usuario_id, timestamp);
CREATE INDEX idx_auth_logs_evento ON auth_logs(evento, exito);
```

### Tabla: `access_logs`
```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  session_id UUID NOT NULL,
  modulo VARCHAR(100) NOT NULL, -- 'calificaciones', 'asistencia', 'comunicados', etc.
  estudiante_id UUID REFERENCES estudiantes(id),
  curso_id UUID REFERENCES cursos(id),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  duracion_sesion INT, -- en segundos
  url_visitada TEXT,
  año_academico INT NOT NULL
);

CREATE INDEX idx_access_logs_usuario_modulo ON access_logs(usuario_id, modulo, timestamp);
CREATE INDEX idx_access_logs_estudiante ON access_logs(estudiante_id, timestamp);
CREATE INDEX idx_access_logs_fecha ON access_logs(timestamp);
```

Estas tablas deben implementarse en el backend para capturar automáticamente eventos de autenticación y navegación mediante middleware en Express.js.