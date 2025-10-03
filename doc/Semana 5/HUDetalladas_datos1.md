# **Historias de Usuario Detalladas - Módulo de Datos Académicos (Carga)**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Docentes y director que cargan datos
2. **estudiantes** - Estudiantes a evaluar
3. **cursos** - Cursos en los que se registran calificaciones
4. **nivel_grado** - Niveles y grados académicos
5. **asignaciones_docente_curso** - Determina qué cursos puede gestionar cada docente
6. **estructura_evaluacion** - Componentes de evaluación definidos por el director
7. **evaluaciones** - Calificaciones registradas por componente
8. **asistencias** - Registros de asistencia diaria
9. **notificaciones** - Alertas generadas post-carga

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Estructura de evaluación definida (HU-USERS-02)

### **Roles Involucrados:**

- **Docente:** Carga datos de cursos asignados
- **Director:** Carga datos de cualquier curso sin restricciones

---

## **HU-ACAD-01 — Cargar Calificaciones mediante Plantilla Excel Exacta**

**Título:** Registro masivo de calificaciones con validación estricta

**Historia:**

> Como docente/director, quiero cargar calificaciones mediante una plantilla Excel exacta para registrar el rendimiento de mis estudiantes de forma masiva, asegurando que los datos se procesen correctamente según la estructura de evaluación institucional.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Carga de Calificaciones" desde dashboard del docente/director
- **CA-02:** Pantalla principal muestra **flujo de 4 pasos obligatorios:**
    
    **PASO 1: Selección de Contexto** (obligatorio antes de habilitar carga)
    
    - Select "Nivel": {Inicial, Primaria, Secundaria}
    - Select "Grado": {1, 2, 3, 4, 5, 6} - Filtrado según nivel seleccionado
    - Select "Curso": Lista de cursos disponibles según nivel/grado
        - **Docente:** Solo ve cursos asignados en `asignaciones_docente_curso`
        - **Director:** Ve todos los cursos de la institución
    - Select "Trimestre": {1, 2, 3}
    - **Select "Componente de Evaluación"**:
        - Lista de componentes (`estructura_evaluacion`) del año actual (mostrar nombre + tipo: `unica` | `recurrente`). **Es obligatorio seleccionar exactamente 1 componente** antes de generar la plantilla o subir un archivo.
    - Botón "Continuar" habilitado solo cuando todos los campos están completos.
    
    **PASO 2: Descarga de Plantilla y Carga de Archivo**
    
    - Antes de descargar, el sistema genera la plantilla **solo para el componente seleccionado**.
    - Botón "📥 Descargar Plantilla" genera Excel con:
        - **Estructura de la plantilla (por componente seleccionado):**
            - **Única celda en el documento con el id componente:** prellenado con el id del componente seleccionado - **requerida** para **Validación de estructura**
            - **Única celda en el documento para colocar** **:** `fecha_evaluacion` (YYYY-MM-DD) — **requerida** (para ítems recurrentes identifica la actividad; para ítems únicos indica la fecha del examen/evaluación) - prellenado con la fecha de hoy
            - **Columna A:** `codigo_estudiante` (pre-llenado con estudiantes del curso; obligatorio)
            - **Columna B:** `nombre_completo` (referencia; no se procesa para cálculos)
            - **Columna C:** `calificacion` (valor numérico 0-20; decimales permitidos hasta 2 posiciones)
            - **Columna D:** `observaciones` (opcional)
        - Hoja adicional "Instrucciones" con:
            - Escala de calificación: 0-20
            - Ejemplos, formato de fecha, advertencias: "No modificar orden de columnas", "No agregar/eliminar columnas"
    - Componente de carga con **drag & drop**:
        - Área destacada: "Arrastra tu archivo aquí o haz clic para seleccionar"
        - Formatos aceptados: `.xlsx`, `.xls`
        - Tamaño máximo: 10MB
        - Validación inmediata de formato al soltar archivo
    
    **PASO 3: Validación** 
    
    - Sistema ejecuta proceso de validación pre-inserción:
        - Validacion en el Backend
            - **Validación de estructura:**
                - Verificar que el orden de columnas sea idéntico al de la plantilla
                - Verificar que los nombres de las columnas coincidan exactamente (case-sensitive)
                - Detectar columnas faltantes o adicionales
                - Verificar que el `id` del componente  enviado coincide con la plantilla (evita subir plantilla de otro componente).
            - **Validación de datos:**
                - `codigo_estudiante` existe en `estudiantes` y pertenece al curso seleccionado
                - `fecha_evaluacion` con formato válido (YYYY-MM-DD)
                - Calificaciones son numéricas entre 0-20 (permitir decimales con máx 2 posiciones)
                - Detectar celdas vacías (registrar como error)
                - Detectar duplicados de `codigo_estudiante` (registrar como error)
                - **Reglas según tipo de componente:**
                    - Si `tipo = unica`: validar que NO exista previamente una evaluación para ese estudiante + componente + curso + trimestre (si existe → error, no insertar).
                    - Si `tipo = recurrente`: permitir múltiples registros por estudiante; **si** existe un registro con misma fecha y mismo componente → marcar como duplicado/advertencia (no insertar).
        
        **CA-03:** Al finalizar validación, según la validacion mostrar **Reporte de validación**:
        
        - Mostrar resumen: "XX registros válidos, YY con errores"
        - Total de registros validados
            - ✅ Registros válidos : XX (verde)
            - ❌ Registros con errores: YY (rojo) : Mostrar **Errores Detallados**
        - Botón "Procesar registros válidos"
        - Boton “Atras” en caso no quiera continuar con el proceso
        - **CA-04:** Generación de archivo TXT de errores (si aplica), con formato claro (curso, fecha, usuario, listados por fila y error).
    
    **PASO 4: Procesamiento**
    
    - **Procesamiento inteligente:**
        - Registros válidos se insertan en `evaluaciones`
        - Registros con errores se omiten pero se reportan en archivo TXT
    - **CA-05:** Inserción en base de datos (registros válidos):
    
    ```sql
    INSERT INTO evaluaciones (
      estudiante_id, curso_id, estructura_evaluacion_id,
      trimestre, año_academico, fecha_evaluacion, calificacion_numerica,
      calificacion_letra, observaciones, fecha_registro, estado, registrado_por
    ) VALUES (
      ?, ?, ? 
      ?, ?, ?, ?, 
      ?, ?, NOW(), 'preliminar', ?
    );
    ```
    
    - `calificacion_letra` se calcula automáticamente según regla:
        - AD: 18-20
        - A: 14-17
        - B: 11-13
        - C: 0-10
    - **CA-06:** Después de inserción exitosa:
        - Mostrar notificación de éxito: "✅ XX calificaciones registradas correctamente"
        - **Activar sistema de alertas automáticas** (HU-ACAD-16):
            - Evaluar cada nota registrada
            - Si `calificacion_numerica < 11`, generar alerta de bajo rendimiento
            - Enviar notificaciones a padres afectados (WhatsApp + plataforma)
        - Actualizar vista de calificaciones para padres en tiempo real

---

### **Validaciones de Negocio**

- **VN-01:** Solo docentes con asignaciones activas pueden cargar datos de sus cursos.
- **VN-02:** Director puede cargar datos de cualquier curso sin restricciones.
- **VN-03:** Estructura de columnas debe coincidir exactamente con la plantilla generada para el componente seleccionado.
- **VN-04:** No se permite cargar calificaciones si la `estructura_evaluacion` del año no está definida.
- **VN-05:** Calificaciones deben estar en escala 0–20 (decimales permitidos hasta 2 decimales).
- **VN-06:** Campos obligatorios por plantilla: `codigo_estudiante`, `fecha_evaluacion`, `calificacion`.
- **VN-07:** Regla de duplicados:
    - **Componente `unica`**: un estudiante **no** puede tener más de un registro para ese componente / curso / trimestre — si ya existe → error.
    - **Componente `recurrente`**: se permiten múltiples registros por estudiante; si existe registro con la **misma fecha** y mismo componente → marcar duplicado/advertencia (no insertar).
- **VN-08:** El archivo debe contener al menos 1 estudiante válido para que se procesen registros.
- **VN-09:** Si todos los registros tienen errores, no se inserta nada (transacción nula) y se genera reporte.
- **VN-10:** Las notas cargadas inician en estado `"preliminar"` por defecto.

---

### **UI/UX**

- **UX-01:** Wizard visual de **4 pasos** con barra de progreso:
    - Step 1: Selección de Contexto
    - Step 2: Descarga y Carga
    - Step 3: Validación
    - Step 4: Procesamiento
    - Navegación: Botones "Anterior" y "Continuar" (solo si paso actual está completo)
- **UX-02:** Selección de contexto con diseño limpio:
    - Dropdowns grandes con iconos representativos
    - Nivel 🎓 | Grado 📚 | Curso 📖 | Trimestre 📅 | Componente 📑
    - Carga dinámica: Al seleccionar nivel, filtrar grados disponibles
    - Al seleccionar grado, filtrar cursos correspondientes
    - Al seleccionar curso, mostrar componentes de evaluación disponibles
- **UX-03:** Área de carga con drag & drop:
    - Zona punteada grande y atractiva
    - Animación al arrastrar archivo sobre la zona
    - Previsualización del nombre del archivo al soltar
    - Botón secundario "Examinar archivos" para usuarios sin experiencia en drag & drop
    - Indicador de progreso durante subida (spinner + porcentaje)
- **UX-04:** Validación con feedback en tiempo real:
    - Progress bar: "Validando archivo... XX/YY filas"
    - Animación de carga suave
    - Tiempo estimado de validacion (para archivos grandes)
    - Botón “Procesar registros válidos” visible tras la validación exitosa
- **UX-05:** Procesamiento con confirmación final:
    - Pantalla clara que informa: “Se insertarán XX registros válidos. ¿Desea continuar?”
    - Botones: "Confirmar procesamiento" ✅ | "Cancelar" ❌
    - Mensaje de éxito/alerta tras inserción con número de registros y alertas generadas
- **UX-06:** Reporte de resultados con diseño visual: Libreria Recharts
    - Gráfico de torta grande (verde/rojo) en pestaña "Resumen"
    - Tabla de errores con scroll si hay muchos
    - Iconos visuales: ✅ (válido) ❌ (error) ⚠️ (advertencia)
    - Botón "Descargar Reporte" destacado si hay errores
- **UX-07:** Plantilla Excel con formato institucional:
    - Header con logo de I.E.P. Las Orquídeas
    - Colores institucionales (púrpura/naranja)
    - Columnas con encabezados resaltados
    - Filas alternas con color suave para legibilidad
    - Hoja "Instrucciones" con tipografía clara, ejemplos de notas y formato de fecha

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Selección de contexto vacía, botón "Continuar" deshabilitado
- **EF-02:** Estado de contexto completo: Botón "Continuar" habilitado, transición a Paso 2
- **EF-03:** Estado de descarga: Generando plantilla para componente seleccionado con estudiantes del curso
- **EF-04:** Estado de carga: Archivo subido, iniciando validación
- **EF-05:** Estado de validación: Validando filas, mostrando progreso
- **EF-06:** Estado de resultados: Reporte de resumen y errores (si aplica)
- **EF-07:** Estado final: Registros insertados, alertas generadas, notificación de éxito

---

### **Validaciones de Entrada**

- **VE-01:** Archivo debe ser Excel (.xlsx o .xls) válido
- **VE-02:** Archivo no debe exceder 10MB de tamaño
- **VE-03:** Primera fila debe contener encabezados exactos (case-sensitive)
- **VE-04:** Códigos de estudiantes deben ser alfanuméricos (formato: P3001, S5023)
- **VE-05:** Calificaciones deben ser numéricas (enteros o decimales con máx 2 decimales)
- **VE-06:** No se permiten celdas vacías en columnas de calificación
- **VE-07:** No se permiten duplicados de `codigo_estudiante` en el mismo archivo

---

### **Mensajes de Error**

- "El archivo debe ser formato Excel (.xlsx o .xls)"
- "El tamaño del archivo excede el límite de 10MB"
- "La plantilla no coincide con el componente seleccionado. Descarga la plantilla actualizada."
- "La columna 'fecha_evaluacion' está ausente o en formato incorrecto (YYYY-MM-DD)."
- "Fila 5: Código de estudiante inválido 'ABC' (debe ser alfanumérico)"
- "Fila 8: Calificación '25' fuera de rango (debe ser 0–20)"
- "Fila 12: El estudiante con código P3040 no pertenece a este curso"
- "Fila 20: Celda vacía en columna 'calificacion'"
- "Fila 22: Ya existe evaluación única para este estudiante en este componente y trimestre"
- "No se encontraron estudiantes válidos en el archivo"
- "Todos los registros tienen errores. Revisa el reporte y corrige el archivo."

---

### **Mensajes de Éxito**

- "✅ 35 calificaciones registradas correctamente"
- "✅ Datos procesados exitosamente. 3 alertas de bajo rendimiento generadas."
- "⚠️ 30 registros procesados, 5 omitidos por errores. Descarga el reporte para más detalles."
- "✅ Carga completa. Las calificaciones están disponibles para los apoderados."

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-USERS-02 (Estructura de evaluación definida)
    - HU-AUTH-01 (Autenticación como docente/director)
- **HU Siguientes:**
    - HU-ACAD-06 (Padre visualiza calificaciones)
    - HU-ACAD-16 (Generación de alertas automáticas)
    - HU-ACAD-13 (Docente visualiza promedios del grupo)

---

### **Componentes y Estructura**

- **Tipo:** Página completa con wizard de 4 pasos (`/dashboard/carga-calificaciones`)
- **Componentes principales:**
    - `CalificacionesWizard`: Componente contenedor del wizard
    - `ContextSelector`: Paso 1 - Selección de contexto
    - `TemplateDownloader`: Generador de plantilla Excel
    - `FileUploader`: Componente de drag & drop
    - `ValidationProgress`: Barra de progreso de validación
    - `ResultsModal`: Tarjeta con resumen y errores
    - `ErrorReportGenerator`: Generador de archivo TXT de errores
- **Endpoints API:**
    - `GET /cursos/asignados?docente_id={id}` - Cursos del docente
    - `GET /cursos?nivel={nivel}&grado={grado}` - Cursos por nivel/grado (director)
    - `GET /estudiantes?curso_id={id}` - Estudiantes del curso
    - `GET /estructura-evaluacion?año={año}` - Componentes de evaluación
    - `POST /calificaciones/plantilla` - Generar plantilla Excel
    - `POST /calificaciones/validar` - Validar archivo sin insertar
    - `POST /calificaciones/cargar` - Procesar e insertar calificaciones
    - `GET /calificaciones/reporte-errores/{id}` - Descargar TXT de errores

---

## **HU-ACAD-02 — Cargar Asistencia Diaria con los 5 Estados Definidos**

**Título:** Registro masivo de asistencia con estados específicos

**Historia:**

> Como docente/director, quiero cargar asistencia diaria mediante una plantilla Excel con los 5 estados definidos para mantener un registro preciso de la presencia de los estudiantes y generar alertas automáticas según los patrones de asistencia. La asistencia es por día completo, no por curso.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Carga de Asistencia" desde dashboard del docente/director.
- **CA-02:** Pantalla principal muestra **flujo de 4 pasos obligatorios:**

---

### **PASO 1: Selección de Contexto**

- Select "Nivel": {Inicial, Primaria, Secundaria}
- Select "Grado": {1, 2, 3, 4, 5, 6} - Filtrado según nivel seleccionado
- **Date Picker "Fecha":** Seleccionar fecha específica del registro
    - Solo fechas pasadas y actual (no futuras)
    - Formato: DD/MM/YYYY
    - Validación: No permitir registros duplicados para la misma fecha
- Botón "Continuar" habilitado solo cuando todos los campos están completos

---

### **PASO 2: Descarga de Plantilla y Carga de Archivo**

- Botón "📥 Descargar Plantilla" genera Excel con:
    - **Celda única A1 → `fecha_asistencia`** (prellenada con la fecha seleccionada; requerida para validación).
    - **Columna A:** `codigo_estudiante` (prellenado con estudiantes del grado; obligatorio)
    - **Columna B:** `nombre_completo` (solo referencia)
    - **Columna C:** `estado_asistencia` (valores válidos)
    - **Columna D:** `hora_llegada` (opcional; solo si estado = Tardanza, formato HH:MM)
    - **Columna E:** `justificacion` (opcional; recomendado si estado = Falta Justificada o Permiso)
- Hoja adicional "Instrucciones" con:
    - **Estados válidos (case-insensitive):**
        - `Presente` o `P`
        - `Tardanza` o `T`
        - `Permiso` o `PE`
        - `Falta Justificada` o `FJ`
        - `Falta Injustificada` o `FI`
    - Ejemplos de llenado.
    - Advertencias: no modificar códigos, todos deben tener estado, hora solo para tardanza.
- Componente de carga con **drag & drop**:
    - Formatos aceptados: `.xlsx`, `.xls`
    - Tamaño máximo: 5MB
    - Validación inmediata de formato

---

### **PASO 3: Validación (pre-inserción)**

- Sistema valida en backend:
    - **Estructura:**
        - Columnas requeridas: `codigo_estudiante`, `estado_asistencia`
        - Verificar que `fecha_asistencia` en celda A1 coincide con la seleccionada en UI
        - Detectar columnas faltantes o adicionales
    - **Datos:**
        - `codigo_estudiante` existe y pertenece al grado
        - `estado_asistencia` válido (uno de los 5 estados)
        - `hora_llegada` presente solo si estado = Tardanza (formato HH:MM válido) , valor opcional
        - `justificacion` recomendada para FJ y Permiso
        - Duplicados de `codigo_estudiante` → error
        - Validar que no existan registros previos para misma fecha + estudiante
        - Fecha debe estar dentro del año académico
    - **Reporte de Validación:**
        - Resumen: XX válidos, YY con errores
        - Total de registros procesados
            - ✅ Registros válidos: XX (verde)
            - ❌ Registros con errores: YY (rojo) : Errores Detallados
        - Desglose por estado:
                    🟢 Presentes: XX
                    🟡 Tardanzas: YY
                    🔵 Permisos: ZZ
                    🟠 Faltas Justificadas: AA
                    🔴 Faltas Injustificadas: BB
        - Desglose por estado: Presente, Tardanza, Permiso, FJ, FI
        - Botón "Procesar registros válidos" o "Atrás"
        - Opción de descargar TXT de errores

---

### **PASO 4: Procesamiento**

- **Inserción en BD** para registros válidos:

```sql
INSERT INTO asistencias (
  estudiante_id, fecha, estado, hora_llegada,
  justificacion, año_academico, registrado_por, fecha_registro
) VALUES (
  ?, fecha_excel, estado_normalizado, hora_excel,
  justificacion_excel, 2025, usuario_actual_id, NOW()
);

```

- **Normalización de estados:**
    - Presente → `presente`
    - Tardanza → `tardanza`
    - Permiso → `permiso`
    - Falta Justificada → `falta_justificada`
    - Falta Injustificada → `falta_injustificada`
- **CA-04:** Notificación de éxito: `"✅ Asistencia registrada para XX estudiantes"`.
- **CA-05:** Activar alertas automáticas (HU-ACAD-15):
    - Por cada **Tardanza** → alerta inmediata
    - Por cada **Falta Injustificada** → alerta inmediata (solicitud de justificación)
    - Por cada **Presente** → confirmación diaria simple
    - Patrón crítico: 3 faltas injustificadas consecutivas → alerta crítica
    - Patrón acumulado: 5 tardanzas en un trimestre → alerta preventiva
- Actualizar vista de padres en tiempo real
- **CA-06:** Generación de archivo TXT de errores si aplica

---

### **Validaciones de Negocio**

- **VN-01:** Solo docentes con asignaciones activas pueden cargar asistencia de su grado.
- **VN-02:** El director puede cargar asistencia de cualquier grado sin restricciones.
- **VN-03:** No se permite registrar asistencia para fechas futuras.
- **VN-04:** No se permite duplicar asistencia (mismo estudiante + misma fecha).
- **VN-05:** Estados válidos (case-insensitive): Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada.
- **VN-06:** `hora_llegada` opcional únicamente si estado = "Tardanza"  (formato HH:MM).
- **VN-07:** `justificacion` opcional pero recomendada en "Permiso" y "Falta Justificada".
- **VN-08:** La hora de llegada debe estar dentro del horario escolar (06:00–18:00).
- **VN-09:** El archivo debe contener al menos 1 estudiante válido para procesarse.
- **VN-10:** Registro de asistencia es **por día completo**: un estado único por estudiante por día.

---

### **UI/UX**

- **UX-01:** Wizard visual de **4 pasos** con barra de progreso (idéntico al de calificaciones):
    - Step 1: Selección de Contexto + Fecha (📋📅)
    - Step 2: Descarga y Carga (📥)
    - Step 3: Validación (🔎✅)
    - Step 4: Procesamiento (⚙️📊)
- **UX-02:** Date Picker destacado en Paso 1:
    - Calendario visual con fechas pasadas/actual habilitadas
    - Fechas futuras deshabilitadas visualmente (gris)
    - Indicador si ya existe asistencia para esa fecha:
        - Badge naranja: "⚠️ Ya existe registro para esta fecha"
        - Confirmación antes de continuar: "¿Deseas reemplazar el registro existente?"
- **UX-03:** Plantilla Excel con formato claro:
    - Columna "Estado" con validación de datos (dropdown en Excel):
        - Opciones: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada
    - Columna "Hora Llegada" con formato de hora (HH:MM)
    - Formato condicional:
        - Verde para "Presente"
        - Amarillo para "Tardanza"
        - Azul para "Permiso"
        - Naranja para "Falta Justificada"
        - Rojo para "Falta Injustificada"
- **UX-04:** Vista de resultados con gráfico de barras: Libreria Recharts
    - Barras horizontales por estado con colores distintivos
    - Iconos representativos: 🟢🟡🔵🟠🔴
    - Tabla de errores con scroll y botón de descarga de reporte (TXT).

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Selección de contexto + fecha vacía
- **EF-02:** Estado de contexto completo: Verificando registros existentes para la fecha
- **EF-03:** Estado de advertencia: Si existe registro, modal de confirmación
- **EF-04:** Estado de carga: Archivo subido, iniciando validación
- **EF-05:** Estado de validación: Procesando filas, verificando estados y mostrando resultados de validacion
- **EF-06:** Estado de resultados: Vista esglose por estado
- **EF-07:** Estado final: Registros insertados, alertas generadas según patrones y confirmacion de exito

---

### **Validaciones de Entrada**

- **VE-01:** Fecha debe ser pasada o actual (no futura)
- **VE-02:** Archivo debe ser Excel (.xlsx o .xls) válido
- **VE-03:** Estados deben ser uno de los 5 valores válidos (case-insensitive)
- **VE-04:** Hora de llegada debe ser formato HH:MM válido (ej: 08:15, 14:30)
- **VE-05:** Hora de llegada solo presente si estado = "Tardanza" o “Presente”
- **VE-06:** Códigos de estudiantes deben ser alfanuméricos

---

### **Mensajes de Error**

- "No puedes registrar asistencia para fechas futuras"
- "Ya existe un registro de asistencia para esta fecha. ¿Deseas reemplazarlo?"
- "Fila 6: Estado inválido 'Ausente'. Valores válidos: Presente, Tardanza, Permiso, FJ, FI"
- "Fila 10: Hora de llegada especificada pero estado no es 'Tardanza'"
- "Fila 15: Formato de hora inválido '25:00'. Formato correcto: HH:MM (08:30)"
- "Fila 18: Hora de llegada '05:30' fuera del horario escolar (06:00-18:00)"
- "Fila 22: El estudiante con código S3045 no pertenece a este curso"

---

### **Mensajes de Éxito**

- "✅ Asistencia registrada para 30 estudiantes"
- "✅ Registros procesados: 28 Presentes, 2 Tardanzas"
- "✅ 5 alertas de tardanza enviadas a los apoderados"
- "⚠️ 25 registros procesados, 5 omitidos por errores. Descarga el reporte."
- "🔴 Alerta crítica: 3 estudiantes con 3+ faltas injustificadas consecutivas"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación como docente/director)
    - HU-USERS-04 (Estudiantes creados y vinculados)
- **HU Siguientes:**
    - HU-ACAD-07 (Padre visualiza asistencia con calendario)
    - HU-ACAD-15 (Generación de alertas automáticas de asistencia)

---

### **Componentes y Estructura**

- **Tipo:** Página completa con wizard de 3 pasos (`/dashboard/carga-asistencia`)
- **Componentes principales:**
    - `AsistenciaWizard`: Componente contenedor del wizard
    - `ContextDateSelector`: Paso 1 - Selección de contexto + fecha
    - `DatePicker`: Selector de fecha con validaciones
    - `DuplicateWarningModal`: Modal de advertencia por registro existente
    - `TemplateDownloader`: Generador de plantilla Excel
    - `FileUploader`: Componente de drag & drop
    - `ValidationProgress`: Barra de progreso de validación
    - `Results`: Vista con desglose por estados
    - `StateBarChart`: Gráfico de barras por estado
    - `ErrorReportGenerator`: Generador de archivo TXT de errores
- **Endpoints API:**
    - `GET /cursos/asignados?docente_id={id}` - Cursos del docente
    - `GET /cursos?nivel={nivel}&grado={grado}` - Cursos por nivel/grado (director)
    - `GET /estudiantes?curso_id={id}` - Estudiantes del curso
    - `GET /asistencias/verificar?curso_id={id}&fecha={fecha}` - Verificar duplicados
    - `POST /asistencias/plantilla` - Generar plantilla Excel
    - `POST /asistencias/validar` - Validar archivo sin insertar
    - `POST /asistencias/cargar` - Procesar e insertar asistencias
    - `GET /asistencias/reporte-errores/{id}` - Descargar TXT de errores
    - `GET /asistencias/estadisticas?curso_id={id}&fecha={fecha}` - Estadísticas del día

---

## **ENDPOINTS API CONSOLIDADOS DEL MÓDULO (Carga de Datos)**

### **Cursos y Estudiantes (uso compartido en todos los flujos)**

```
GET    /cursos/asignados?docente_id={id}        # Cursos asignados al docente
GET    /cursos?nivel={nivel}&grado={grado}      # Cursos por nivel/grado (para director)
GET    /estudiantes?curso_id={id}               # Estudiantes activos de un curso

```

---

### **Carga de Calificaciones**

```
GET    /estructura-evaluacion?año={año}         # Componentes de evaluación vigentes
POST   /calificaciones/plantilla                # Generar plantilla Excel para un componente
POST   /calificaciones/validar                  # Validar archivo Excel sin insertar
POST   /calificaciones/cargar                   # Procesar e insertar calificaciones
GET    /calificaciones/reporte-errores/{id}     # Descargar reporte TXT de errores

```

---

### **Carga de Asistencia**

```
GET    /asistencias/verificar?curso_id={id}&fecha={fecha}   # Verificar duplicados en una fecha
POST   /asistencias/plantilla                               # Generar plantilla Excel de asistencia
POST   /asistencias/validar                                 # Validar archivo Excel sin insertar
POST   /asistencias/cargar                                  # Procesar e insertar asistencias
GET    /asistencias/reporte-errores/{id}                    # Descargar reporte TXT de errores
GET    /asistencias/estadisticas?curso_id={id}&fecha={fecha}# Estadísticas de asistencia del día

```

---

## **CONSIDERACIONES TÉCNICAS ADICIONALES**

### **Seguridad:**

- Todos los endpoints requieren autenticación JWT
- Validación de roles: Docente (solo cursos asignados) / Director (todos los cursos)
- Validación de integridad referencial en FK
- Sanitización de datos de Excel para prevenir inyecciones
- Rate limiting en endpoints de carga (máx 5 archivos por minuto)

### **Performance:**

- Procesamiento asíncrono para archivos >50 registros
- Progress polling para mostrar avance en frontend
- Límite de tamaño de archivo: 10MB (calificaciones), 5MB (asistencia)
- Índices en BD:
    - `evaluaciones(estudiante_id, curso_id, trimestre, año_academico)`
    - `asistencias(estudiante_id, fecha, año_academico)`
- Caching de estructura de evaluación (TTL: 24 horas)

### **Validaciones de Archivos Excel:**

- Librería backend: `xlsx` o `exceljs` (Node.js)
- Validación de MIME type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Verificación de estructura antes de procesamiento completo
- Procesamiento en chunks (50 filas a la vez) para archivos grandes
- Generación de plantillas con `exceljs` para formato avanzado

### **Generación de Reportes:**

- Archivo TXT con encoding UTF-8
- Timestamp en nombre de archivo para trazabilidad
- Almacenamiento temporal (24 horas) en servidor
- Acceso único por ID de importación

### **Alertas Automáticas:**

- Procesamiento post-inserción (no bloquea respuesta de carga)
- Cola de mensajes para WhatsApp (evitar throttling de API)
- Batch de notificaciones (máx 50 por minuto)
- Log de alertas generadas para auditoría