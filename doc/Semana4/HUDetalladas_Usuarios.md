# **Historias de Usuario Detalladas - Módulo de Gestión de Usuarios**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Tabla principal de actores del sistema
2. **permisos_docentes** - Permisos granulares por grado/nivel
3. **estructura_evaluacion** - Componentes de evaluación institucional
4. **configuraciones_sistema** - Parámetros configurables del sistema
5. **nivel_grado** - Niveles y grados académicos
6. **estudiantes** - Vinculación con apoderados
7. **relaciones_familiares** - Relaciones padre-hijo
8. **asignaciones_docente_curso** - Asignaciones de docentes a cursos

### **Módulos Previos Requeridos:**
- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones

### **Roles Involucrados:**
- **Director:** Usuario principal de gestión de permisos y configuración
- **Administrador:** Usuario técnico para creación masiva de usuarios

---
## **HU-USERS-01 — Activar/Desactivar Permisos de Comunicación y Encuestas (Director)**

**Título:** Activación simple de permisos de comunicación y encuestas a docentes

**Historia:**

> Como director, quiero activar o desactivar la capacidad de que un docente pueda crear comunicados y encuestas, de manera que el sistema limite automáticamente el alcance a los cursos que enseña según sus asignaciones.

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

* **CA-01:** Acceso a la opcion del Dashboard "Permisos de Docentes" 
* **CA-02:** Vista principal muestra tabla con todos los docentes activos con columnas:
  * Nombre completo del docente
  * Estado del permiso de **Comunicados** (Switch)
  * Estado del permiso de **Encuestas** (Switch)
- **CA-03:** Al hacer clic en el switch:
  - Mostrar modal de confirmación pequeño:
    - "¿Desea [activar/desactivar] el permiso de [tipo] para [docente]?"
    - Botones: "Confirmar" y "Cancelar"
* **CA-04:** Al Confirmar un permiso:
  * Si no existe ese tipo de permiso para el docente, se registra el permiso en `permisos_docentes` con 
	- `tipo_permiso` = comunicados` o `encuestas`
	- `estado_activo` = true
	- `docente_id` = docente al que se le dio el permiso
	- `fecha_otorgamiento` = now()
	- `año_academico` = actual
  sino `estado_activo = true`
* **CA-05:** Al desactivar un permiso:
  * Se marca `estado_activo = false` en `permisos_docentes` (No se crea un nuevo registro sino que ahi un solo registro por docente y tipo de permiso (docente_id + tipo_permiso = único).
    El campo estado_activo indica si el permiso está vigente o no.) 
  * El docente ya no ve la opción en su menú lateral.
 	
* **CA-06:** Refrescar tabla sin recargar página completa”.
* **CA-07:** Mostrar notificación de éxito tras guardar: “Permisos actualizados correctamente”.
* **CA-08:** Enviar notificación al docente vía plataforma informando los cambios.

---

### **Validaciones de Negocio**

* **VN-01:** Solo mostrar docentes con `usuarios.rol = 'docente'` y `estado_activo = true`.
* **VN-03:** Un docente puede tener ambos permisos activos al mismo tiempo (comunicados y encuestas).
* **VN-04:** El director es el único rol autorizado para gestionar permisos.

---

### **UI/UX**

* **UX-01:** Tabla de docentes responsive.
  * Desktop: tabla con Switch en columnas
  * Mobile: cards con Switch visibles
* **UX-02:** Switches claros y accesibles:
  * Verde (activo) / Gris (inactivo)
- **UX-03:** Modal de confirmación pequeño y centrado:
  - No oscurecer completamente la pantalla
  - Foco automático en botón "Confirmar"
- **UX-04:** Feedback visual inmediato:
  - Badge cambia de color según estado
  - Loading spinner en el switch durante procesamiento
- **UX-05:** Toast notifications:
  - Posición: Esquina superior derecha
  - Colores: Verde (éxito), Rojo (error)

---

### **Estados y Flujo**

* **EF-01:** Estado inicial: tabla con Switch  según permisos actuales.
* **EF-02:** Estado de confirmación: Modal visible esperando acción
* **EF-03:** Estado de procesamiento: Switch deshabilitado, spinner visible
* **EF-04:** Estado final: Permiso actualizado, switch refleja nuevo estado + notificación de éxito.

---

### **Validaciones de Entrada**

* **VE-01:** Validar que `docente_id` existe y es válido antes de asignar permiso.
* **VE-02:** Validar que `tipo_permiso` ∈ {“comunicado”, “encuesta”}.
* **VE-03:** Rechazar cambios si el docente no tiene cursos asignados activos.

---

### **Mensajes de Error**

* “No se pudo cargar la lista de docentes. Intente nuevamente.”
* “Error al guardar permisos. Verifique su conexión.”
* “Este docente no tiene asignaciones activas. Asigne cursos primero.”
* "No se pudo actualizar el permiso. Intente nuevamente."
---

### **HU Relacionadas**

* **HU Previas:** HU-DASH-01 (Dashboard Base como director)
* **HU Siguientes:** HU-COM-01 (Docente crea comunicados), HU-ENC-01 (Docente crea encuestas)

---

### **Componentes y Estructura**

* **Tipo:** Página completa (`/dashboard/gestion-permisos`)

* **Componentes principales:**

  * `PermissionsTable`: tabla de docentes
  * `PermissionSwitch`: componente de switch por tipo de permiso
  * `ToastNotification`: confirmación de cambios

* **Endpoints API:**

  * `GET /teachers/permissions` → Lista de docentes con permisos
  * `POST /teachers/{id}/permissions` → Registrar permiso para docente
  * `PUT /teachers/{id}/permissions` → Actualizar permiso de docente

---
## **HU-USERS-02** — Definir Estructura de Evaluación Institucional (Director)

**Título:** Configuración global de componentes de calificación

**Historia:**

> Como director, quiero definir la estructura de evaluación para todo el colegio para estandarizar el proceso de calificación y garantizar coherencia institucional en las evaluaciones académicas.
> 

**Criterios de Aceptación:**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Configuración de Evaluación" desde dashboard del director
- **CA-02:** Pantalla principal muestra la estructura actual del año en caso halla sido definido:
    - Lista de componentes de evaluación definidos (máximo 5)
    - Por cada componente:
        - Nombre del ítem (ej: "Examen", "Participación")
        - Peso porcentual asignado
        - Tipo de evaluación (única/recurrente)
        - Orden de visualización
        - Estado (Activo/Inactivo)
    - Total de pesos debe sumar 100%
    - Indicador visual si configuración está incompleta
- **CA-03:** Si no hay una estructura definida , Botón "Crear Estructura" abre modal con formulario:
    - **Para cada componente (máximo 5):**
        - Campo "Nombre del ítem" (texto, max 50 caracteres)
        - Campo "Peso %" (numérico, 0-100)
        - Select "Tipo de evaluación" (Única, Recurrente)
        - Campo "Orden de visualización" (numérico 1-5)
        - Toggle "Activo/Inactivo"
    - Validación en tiempo real: Suma de pesos = 100%
    - Botones: "Agregar componente" (hasta 5), "Eliminar componente"
    - Boton “Plantilla predefinida” elimina los componentes creados y carga la plantilla en el formulario
    - Botones finales: "Aceptar", "Cancelar"
    - Una vez se cierra el modal, se observa un preview de suma de componentes
    - Boton “Guardar Configuración” abre un mensaje de confirmacion “Esta seguro de crear la estructura de evaluacion, una vez generado no se podra cambiar hasta fin de año”
- **CA-04:** Al guardar configuración:
    - Validar que la suma de pesos = 100% exacto
    - Insertar/actualizar registros en `estructura_evaluacion`:
        - `año_academico = actual`
        - `nombre_item`, `peso_porcentual`, `tipo_evaluacion`, `orden_visualizacion`
        - `fecha_configuracion = now()`
    - Mostrar confirmación: "Estructura de evaluación registrada correctamente"
    - Enviar notificación a todos los docentes informando que la estructura quedó definida
    - Una vez confirmada, la configuración queda **bloqueada para todo el año académico**

**Validaciones de Negocio:**

- **VN-01:** Solo director puede modificar (`usuarios.rol = 'director'`)
- **VN-02:** Suma de pesos debe ser exactamente 100%
- **VN-03:** Mínimo 1 componente, máximo 5 componentes
- **VN-04:** Nombres de componentes únicos (sin duplicados)
- **VN-05:** Peso mínimo por componente: 5%, máximo: 50%
- **VN-06:** Una vez confirmada la estructura, no se permite modificar ni eliminar componentes durante el año académico.
- **VN-07:** Orden de visualización debe ser consecutivo (1, 2, 3, 4, 5)
- **VN-08:** Cambios solo aplican a partir de la fecha de modificación (no retroactivos)

**UI/UX:**

- **UX-01:** Vista actual con diseño de tarjetas:
    - Card por cada componente con ícono representativo
    - Barra de progreso visual del peso porcentual
    - Badge de tipo de evaluación
- **UX-02:** Modal de edición con drag & drop:
    - Arrastra componentes para reordenar
    - Sliders visuales para ajustar pesos con validación en tiempo real
    - Indicador grande: "Suma actual: XX% / 100%"
    - Colores: Verde si = 100%, Rojo si ≠ 100%
- **UX-03:** Ejemplos predefinidos (templates):
    - Botón "Usar plantilla predeterminada" carga estructura común:
        - Examen: 40%
        - Participación: 20%
        - Revisión de Cuaderno: 15%
        - Revisión de Libro: 15%
        - Comportamiento: 10%
- **UX-04:** Previsualización en tiempo real:
    - Muestra cómo se verán las calificaciones con la nueva estructura
    - Ejemplo de tabla de notas con los componentes configurados
- **UX-05:** Historial de cambios:
    - Botón "Ver historial" muestra timeline de configuraciones anteriores
    - Solo consulta (no permite revertir ni modificar en el mismo año académico)

**Estados y Flujo:**

- **EF-01:** Estado inicial: Cargando estructura actual del año académico
- **EF-02:** Estado de edición: Modal abierto con formulario interactivo
- **EF-03:** Estado de validación: Verificando que suma = 100%
- **EF-04:** Estado de confirmación: Modal de advertencia antes de guardar, recordando que la configuración quedará fija todo el año
- **EF-05:** Estado final: Estructura guardada, bloqueada y notificaciones enviadas

**Validaciones de Entrada:**

- **VE-01:** Nombres de componentes: Solo letras, espacios, máx 50 caracteres
- **VE-02:** Pesos: Números enteros o decimales con máx 2 decimales (ej: 33.33%)
- **VE-03:** Suma exacta de 100% requerida para habilitar botón "Guardar"
- **VE-04:** Al menos 1 componente activo obligatorio

**Mensajes de Error:**

- "La suma de pesos debe ser exactamente 100%. Actual: XX%"
- "Ya existe un componente con ese nombre. Use otro nombre."
- "Debe tener al menos 1 componente de evaluación activo."

**HU Relacionadas:**

- **HU Previas:** HU-AUTH-01 (Autenticación como director)
- **HU Siguientes:** HU-USERS-03 (Asignar pesos), HU-10 (Docente carga calificaciones con estructura definida)

**Componentes y Estructura:**

- **Tipo:** Página completa (`/dashboard/configuracion-evaluacion`)
- **Componentes principales:**
    - `EvaluationStructureView`: Vista actual de la estructura
    - `EvaluationStructureModal`: Modal de edición
    - `ComponentCard`: Card de componente individual
    - `WeightSlider`: Slider de peso con validación
    - `TemplateSelector`: Selector de plantillas predefinidas
    - `HistoryTimeline`: Timeline de cambios históricos
- **Endpoints API:**
    - `GET /estructura-evaluacion?año={año}` - Estructura actual
    - `PUT /estructura-evaluacion` - Actualizar estructura
    - `GET /estructura-evaluacion/history` - Historial de cambios
    - `GET /estructura-evaluacion/templates` - Plantillas predefinidas

---

## **HU-USERS-03** — Asignar Pesos a Componentes de Evaluación (Director)

**Título:** Definición de fórmula de cálculo de promedios institucional

**Historia:**
> Como director, quiero asignar pesos a cada componente de evaluación para establecer la fórmula de cálculo de promedios y garantizar que la ponderación refleje la importancia institucional de cada aspecto evaluado.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Funcionalidad integrada en HU-USERS-02 (mismo modal de configuración)
- **CA-02:** Para cada componente de evaluación, campo "Peso %" permite:
  - Ingreso manual de porcentaje (input numérico)
  - Slider visual para ajuste rápido (0-50%)
  - Incrementos/decrementos con botones +/- (pasos de 5%)
- **CA-03:** Validación en tiempo real:
  - Calcular suma total de pesos automáticamente
  - Mostrar indicador grande: "Suma: XX% / 100%"
  - Colorear indicador:
    - Verde si suma = 100%
    - Rojo si suma ≠ 100%
    - Mostrar mensaje: "Ajuste los pesos para alcanzar 100%"
  - Deshabilitar botón "Guardar" si suma ≠ 100%
- **CA-04:** Al guardar (cuando suma = 100%):
  - Actualizar campo `peso_porcentual` en `estructura_evaluacion`
  - Guardar `fecha_configuracion = now()` y `modificado_por = director_id`
  - Mostrar confirmación: "Pesos de evaluación registrados correctamente"
  - La configuración de pesos queda bloqueada para todo el año académico


**Validaciones de Negocio:**
- **VN-01:** Suma exacta de 100% obligatoria (no 99.99% ni 100.01%)
- **VN-02:** Peso mínimo por componente: 5%
- **VN-03:** Peso máximo por componente: 50%
- **VN-04:** Decimales permitidos: Máximo 2 (ej: 33.33%)
- **VN-05:** Los pesos solo pueden definirse al inicio del año académico, antes de que existan calificaciones cargadas.
- **VN-06:** Una vez confirmada la estructura, no se permiten modificaciones hasta el siguiente año académico.


**UI/UX:**
- **UX-01:** Sliders interconectados:
  - Al aumentar un peso, sugerir ajustes automáticos en otros para mantener 100%
  - Opción "Distribuir equitativamente" (divide 100% / cantidad de componentes)
  - Opción "Reestablecer a valores predeterminados"
- **UX-02:** Previsualización de impacto:
  - Muestra ejemplo de cálculo con notas ficticias
  - Tabla: Componente | Nota | Peso | Subtotal
  - Fila final: PROMEDIO PONDERADO: XX.XX
- **UX-03:** Indicadores visuales claros:
  - Barra de progreso circular grande: "100%"
  - Semáforo de colores según estado de suma
  - Animación cuando se alcanza 100% exacto
- **UX-04:** Tooltips informativos:
  - Hover en cada componente muestra:
    - "Este componente representa XX% de la nota final"
    - Ejemplo de cálculo con nota ficticia
- **UX-05:** Confirmación antes de aplicar cambios:
  - Modal de advertencia: "Una vez guardados, los pesos quedarán fijos durante todo el año académico"
  - Botones: "Confirmar" / "Cancelar"


**Estados y Flujo:**
- **EF-01:** Estado inicial: Cargando pesos actuales de la configuración
- **EF-02:** Estado de edición: Sliders y inputs activos, suma calculándose en tiempo real
- **EF-03:** Estado de validación: Verificando que suma = 100%
- **EF-04:** Estado de confirmación: Modal recordando que los cambios quedarán bloqueados para todo el año
- **EF-05:** Estado final: Configuración guardada y bloqueada

**Cálculo de Promedio Ponderado:**
```
Promedio = (Nota1 × Peso1/100) + (Nota2 × Peso2/100) + ... + (NotaN × PesoN/100)

Ejemplo:
- Examen: 18 × 40% = 7.20
- Participación: 16 × 20% = 3.20
- Cuaderno: 15 × 15% = 2.25
- Libro: 14 × 15% = 2.10
- Comportamiento: 17 × 10% = 1.70
PROMEDIO FINAL = 16.45
```

**Mensajes de Error:**
- "La suma de pesos debe ser exactamente 100%. Actual: XX.XX%"
- "El peso mínimo permitido es 5% por componente."
- "El peso máximo permitido es 50% por componente."

**HU Relacionadas:**
- **HU Previas:** HU-USERS-02 (Definir estructura de evaluación)
- **HU Siguientes:** HU-10 (Docente carga calificaciones), HU-02 (Padre visualiza calificaciones con promedio ponderado)

**Componentes y Estructura:**
- **Tipo:** Funcionalidad integrada en modal de HU-USERS-04
- **Componentes principales:**
  - `WeightSlider`: Slider con validación de peso
  - `WeightSumIndicator`: Indicador de suma total
  - `WeightPreview`: Previsualización de cálculo
  - `AutoAdjustButton`: Botón de distribución automática
  - `ConfirmModal`: Modal de confirmación de bloqueo

- **Endpoints API:**
  - `PUT /estructura-evaluacion/weights` - Actualizar pesos (solo al inicio del año)
  - `GET /estructura-evaluacion/preview` - Previsualizar impacto antes de confirmar

---

## HU-USERS-04 — Crear Usuarios masivamente via Scripts SQL (Administrador)

**Título:** Inicialización del sistema con carga masiva de actores educativos

**Historia:**

> Como administrador del sistema, quiero crear usuarios masivamente via base de datos para configurar el sistema con todos los actores educativos (padres, docentes, estudiantes) de forma eficiente mediante scripts SQL automatizados.

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

* **CA-01:** Administrador accede a herramienta de importación desde panel administrativo

* **CA-02:** Sistema proporciona plantillas Excel/CSV descargables para cada tipo de usuario:

  * **Plantilla Padres/Apoderados:**

    * Columnas: tipo_documento, nro_documento, nombre, apellido, telefono, email (opcional)
  * **Plantilla Docentes:**

    * Columnas: tipo_documento, nro_documento, nombre, apellido, telefono, email (opcional)
  * **Plantilla Estudiantes:**

    * Columnas: codigo_estudiante (opcional-autogenerativo), nombre, apellido, nivel, grado, nro_documento_apoderado, tipo_relacion
  * **Plantilla Relaciones Familiares:**

    * Columnas: nro_documento_padre, codigo_estudiante, tipo_relacion

* **CA-03:** Administrador carga archivo(s) Excel/CSV al sistema

* **CA-04:** Sistema ejecuta proceso de validación pre-inserción:

  * Verificar formato de documentos (8-12 dígitos numéricos)
  * Validar teléfonos (formato +51XXXXXXXXX)
  * Verificar que niveles/grados existan en `nivel_grado`
  * Detectar duplicados (por nro_documento)
  * Validar relaciones padre-hijo (existencia de documentos referenciados)
  * Generar reporte de validación con errores específicos por fila

* **CA-05:** Si validación es exitosa (o parcialmente exitosa):

  * Mostrar resumen: "XX registros válidos, YY con errores"
  * Botón "Procesar registros válidos"
  * Boton “Cancelar” en caso decida no continuar con el proceso
  * Opción de descargar archivo TXT con errores detallados

* **CA-06:** Al confirmar procesamiento, ejecutar transacción SQL:

  **Para Padres/Apoderados y Docentes:**

  ```sql
  INSERT INTO usuarios (tipo_documento, nro_documento, password_hash, rol, nombre, apellido, telefono, fecha_creacion, estado_activo, debe_cambiar_password)
  VALUES (?, ?, bcrypt_hash(password_random), 'apoderado'/'docente', ?, ?, ?, NOW(), true, true);
  ```

  * Donde `password_random` = contraseña generada automáticamente por el sistema (ej: 8 caracteres alfanuméricos).

  **Para Estudiantes:**

  ```sql
  -- 1. Generar codigo_estudiante automático: NIVEL+GRADO+INCREMENTAL
  -- Ejemplo: P3001 (Primaria 3° - estudiante 001)

  INSERT INTO estudiantes (codigo_estudiante, nombre, apellido, nivel_grado_id, año_academico, apoderado_principal_id, tipo_relacion, estado_matricula)
  VALUES (codigo_auto, ?, ?, nivel_grado_id, 2025, usuario_id_apoderado, ?, 'activo');
  ```

* **CA-07:** Después de inserción exitosa:

  * Generar credenciales iniciales en archivo Excel:

    * Columnas: Nombre Completo, Rol, Usuario (nro_documento), Contraseña Inicial (password_random generado)
  * Mostrar resumen: "XX usuarios creados exitosamente"
  * Opción de descargar archivo de credenciales
  * Enviar notificación WhatsApp automática a cada usuario con sus credenciales (opcional)

---

### **Validaciones de Negocio**

* **VN-01:** Solo usuarios con `usuarios.rol = 'administrador'` pueden ejecutar esta funcionalidad
* **VN-02:** Contraseña inicial = valor **aleatorio generado por el sistema** (no se incluye en el CSV)
* **VN-03:** Campo `debe_cambiar_password = true` para todos los nuevos usuarios (padres, docentes, director, administrador)
* **VN-04:** Validar unicidad de nro_documento (no permitir duplicados)
* **VN-05:** Validar unicidad de codigo_estudiante autogenerado
* **VN-06:** Para estudiantes, `apoderado_principal_id` debe existir previamente en tabla `usuarios`
* **VN-07:** Campo `año_academico` = año actual por defecto
* **VN-08:** Todos los usuarios nuevos inician con `estado_activo = true`
* **VN-09:** Si falla la inserción de un registro, continuar con los demás (no abortar todo el proceso)
* **VN-10:** Registros exitosos y fallidos deben reportarse por separado

---

### **UI/UX**

* **UX-01:** Wizard de 4 pasos:

  1. Seleccionar tipo de carga (Padres, Docentes, Estudiantes, Relaciones)
  2. Descargar plantilla y llenar externamente
  3. Subir archivo con drag & drop
  4. Revisar validación y confirmar
* **UX-02:** Interfaz de carga con progress bar:

  * "Validando archivo... XX/YY filas procesadas"
  * Animación de carga durante procesamiento
* **UX-03:** Reporte de validación visual:

  * Tabla con 2 pestañas: "Válidos" y "Con Errores"
  * Iconos: ✅ Verde (válido), ❌ Rojo (error)
  * Por cada error: Fila, Campo, Descripción del error
* **UX-04:** Resumen post-inserción con estadísticas:

  * Total procesados
  * Exitosos (verde)
  * Fallidos (rojo)
  * Gráfico de torta visual
* **UX-05:** Botones de acción claros:

  * "Descargar Plantilla"
  * "Subir Archivo"
  * "Procesar Válidos"
  * "Descargar Reporte de Errores"
  * "Descargar Credenciales"

---

### **Estados y Flujo**

* **EF-01:** Estado inicial: Selección de tipo de carga y descarga de plantilla
* **EF-02:** Estado de carga: Archivo subido, iniciando validación
* **EF-03:** Estado de validación: Procesando filas y detectando errores
* **EF-04:** Estado de revisión: Mostrando reporte de validación
* **EF-05:** Estado de inserción: Ejecutando transacciones SQL
* **EF-06:** Estado final: Usuarios creados, credenciales generadas

---

### **Mensajes de Error Específicos**

* Fila 5: "Formato de documento inválido. Debe ser numérico de 8-12 dígitos."
* Fila 8: "Teléfono inválido. Formato esperado: +51XXXXXXXXX"
* Fila 12: "El apoderado con documento 12345678 no existe en el sistema."
* Fila 15: "El nivel 'Premaria' no existe. Valores válidos: Inicial, Primaria, Secundaria"
* Fila 20: "Documento duplicado. Ya existe un usuario con nro_documento 87654321"

---

### **Mensajes de Éxito**

* "✅ 45 padres creados exitosamente"
* "✅ 28 docentes creados exitosamente"
* "✅ 320 estudiantes creados exitosamente"
* "⚠️ 5 registros omitidos por errores. Descargue el reporte para más detalles."
* "Se han generado contraseñas temporales seguras. Los usuarios deberán cambiarlas al primer inicio de sesión."

---

### **HU Relacionadas**

* **HU Previas:** Ninguna (primera configuración del sistema)
* **HU Siguientes:** HU-USERS-05 (Vincular relaciones familiares), HU-USERS-06 (Generar credenciales), HU-AUTH-01 (Usuarios pueden hacer login)

---

### **Componentes y Estructura**

* **Tipo:** Página completa del panel administrativo (`/admin/importar-usuarios`)
* **Componentes principales:**

  * `ImportWizard`: Wizard de 4 pasos
  * `FileUploader`: Componente de drag & drop
  * `ValidationReport`: Tabla de validación con pestañas
  * `ImportSummary`: Resumen post-inserción con estadísticas
  * `CredentialsDownloader`: Generador de archivo de credenciales
  * `TemplateDownloader`: Descargador de plantillas
* **Endpoints API:**

  * `GET /admin/templates/{tipo}` - Descargar plantillas
  * `POST /admin/import/validate` - Validar archivo sin insertar
  * `POST /admin/import/execute` - Ejecutar inserción masiva
  * `GET /admin/import/credentials/{importId}` - Descargar credenciales generadas


---

## **HU-USERS-05** — Vincular Automáticamente Relaciones Padre-Hijo (Administrador)

**Título:** Establecimiento automático de estructura familiar

**Historia:**

> Como administrador del sistema, quiero vincular automáticamente relaciones padre-hijo para establecer la estructura familiar en el sistema durante la importación masiva sin necesidad de configuración manual posterior.

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

* **CA-01:** Vinculación automática integrada en el proceso de HU-USERS-04 (carga masiva de usuarios).
* **CA-02:** Durante la carga de estudiantes, el sistema ejecuta:

  * Buscar `usuario_id` del apoderado por `nro_documento_apoderado` en tabla `usuarios`.
  * Si existe, insertar estudiante en `estudiantes` (sin apoderado).
  * Insertar simultáneamente en `relaciones_familiares`:

    * `padre_id = usuario_id` del apoderado
    * `estudiante_id = ID` del estudiante recién creado
    * `tipo_relacion = valor del CSV` (padre/madre/apoderado/tutor)
    * `fecha_asignacion = NOW()`
    * `estado_activo = true`
* **CA-03:** Si un padre tiene múltiples hijos:

  * Crear múltiples registros en `relaciones_familiares`.
  * Ejemplo:

    ```
    padre_id: 123 → estudiante_id: 456 (hijo 1)
    padre_id: 123 → estudiante_id: 789 (hijo 2)
    ```
* **CA-04:** Si el apoderado referenciado no existe:

  * Error crítico → No se inserta el estudiante ni la relación.
  * Registrar en reporte de validación:

    * Mensaje: "Apoderado con documento XXXXXXXX no encontrado. Cree primero el usuario apoderado."
* **CA-05:** Solo se permite **un apoderado principal por estudiante**.

  * No se registran relaciones secundarias (madre + padre, etc.).
  * La primera relación cargada en CSV se toma como definitiva.

---

### **Validaciones de Negocio**

* **VN-01:** Un estudiante debe tener exactamente un apoderado vinculado en `relaciones_familiares`.
* **VN-02:** Un apoderado puede estar vinculado a múltiples estudiantes.
* **VN-03:** Tipo de relación válido: padre, madre, apoderado, tutor (enum estricto).
* **VN-04:** No permitir vincular si el usuario encontrado no tiene rol `apoderado`.
* **VN-05:** `estado_activo = true` en relaciones creadas por defecto.
* **VN-06:** Validar integridad referencial antes de insertar (FK constraints).
* **VN-07:** No se permite crear estudiantes “huérfanos” sin apoderado.
* **VN-08:** El año académico de la relación debe coincidir con el del estudiante.
---

### **UI/UX**

* **UX-01:** En el reporte de validación, sección especial "Relaciones":

  * Tabla con columnas:

    * Estudiante (nombre)
    * Apoderado (nombre)
    * Tipo de Relación
    * Estado (✅ Válido / ❌ Error)
* **UX-02:** Visualización de estructura familiar:

  * Icono de familia 👨‍👩‍👧 al lado de cada estudiante procesado.
  * Tooltip con apoderado vinculado.
* **UX-03:** En resumen post-inserción:

  * "XXX relaciones familiares creadas"
  * Desglose por tipo de relación (padre, madre, apoderado, tutor).
* **UX-04:** Herramienta de verificación post-importación:

  * Botón "Verificar Relaciones"
  * Lista estudiantes sin apoderado vinculado

---

### **Estados y Flujo**

* **EF-01:** Estado de validación: Verificando existencia de apoderados.
* **EF-02:** Estado de vinculación: Creando registro en `relaciones_familiares`.
* **EF-03:** Estado de verificación: Confirmando que todos los estudiantes tienen apoderado.
* **EF-04:** Estado final: Relaciones establecidas correctamente.

---

### **Lógica de Vinculación SQL**

```sql
-- 1. Buscar usuario apoderado
SELECT id INTO apoderado_id
FROM usuarios
WHERE nro_documento = ? AND rol = 'apoderado' AND estado_activo = true;

-- 2. Insertar estudiante
INSERT INTO estudiantes (
  codigo_estudiante, nombre, apellido, nivel_grado_id,
  año_academico, estado_matricula
) VALUES (?, ?, ?, ?, 2025, 'activo')
RETURNING id INTO estudiante_id;

-- 3. Insertar relación familiar
INSERT INTO relaciones_familiares (
  padre_id, estudiante_id, tipo_relacion, fecha_asignacion, estado_activo
) VALUES (apoderado_id, estudiante_id, ?, NOW(), true);
```

---

### **Mensajes de Error**

* "Apoderado con documento 12345678 no existe. Créelo primero."
* "El usuario con documento 87654321 no tiene rol 'apoderado'."
* "Tipo de relación inválido: 'tio'. Valores válidos: padre, madre, apoderado, tutor."

---

### **HU Relacionadas**

* **HU Previas:** HU-USERS-04 (Crear usuarios masivamente)
* **HU Siguientes:** HU-AUTH-05 (Padre selecciona entre sus hijos), HU-02 (Padre ve calificaciones de sus hijos)

---

### **Componentes y Estructura**

* **Tipo:** Funcionalidad integrada en importación masiva.
* **Componentes principales:**

  * `RelationshipValidator`: Validador de relaciones familiares
  * `FamilyStructureViewer`: Visualizador de estructura familiar
  * `RelationshipVerifier`: Verificador post-importación
* **Endpoints API:**

  * `POST /admin/import/validate-relationships` - Validar relaciones
  * `POST /admin/import/create-relationships` - Crear relaciones familiares
  * `GET /admin/verify/relationships` - Verificar integridad


---

## **HU-USERS-06** — Generar Credenciales Iniciales para Nuevos Usuarios (Administrador)

**Título:** Generación automática de credenciales de acceso

**Historia:**

> Como administrador del sistema, quiero generar credenciales iniciales para nuevos usuarios para permitir su primer acceso al sistema de forma segura y controlada.

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

* **CA-01:** Generación automática integrada en HU-USERS-04.
* **CA-02:** Al finalizar importación exitosa, sistema genera archivo Excel con:

  * **Columnas:**

    * Nombre Completo
    * Rol (Padre/Docente/Estudiante)
    * Tipo de Documento
    * Usuario (nro_documento)
    * Contraseña Inicial (password_random generado automáticamente)
    * Teléfono (para WhatsApp)
    * Fecha de Creación
    * Estado (Activo)
  * **Formato:** Excel (.xlsx) con diseño institucional (logo, colores).
* **CA-03:** Contraseña inicial = valor aleatorio (8–10 caracteres alfanuméricos):

  * Ejemplo: Usuario: 12345678 → Contraseña: `aB9xT3qZ`
  * Almacenar en BD como `password_hash = bcrypt(password_random)`
  * Marcar `debe_cambiar_password = true` para forzar cambio en primer login.
* **CA-04:** Opciones de distribución de credenciales:

  * **Opción 1:** Descarga manual de archivo Excel.
  * **Opción 2:** Envío automático vía WhatsApp (integración API).

    * Mensaje personalizado por rol:

      ```
      [PADRES]
      Bienvenido a I.E.P. Las Orquídeas 🏫

      Accede a la plataforma educativa:
      🔗 https://plataforma.orquideas.edu.pe

      👤 Usuario: 12345678
      🔑 Contraseña inicial: aB9xT3qZ

      ⚠️ Por seguridad, cambia tu contraseña en tu primer ingreso.

      📱 ¿Necesitas ayuda? Contacta con soporte técnico +51 999999999.
      ```
  * **Opción 3:** Generación de PDFs individuales por usuario -> Libreria puppeteer
	Contenido del PDF (sin QR):
	- Logo institucional (arriba).
	- Nombre completo.
	- Rol.
	- Usuario (nro_documento).
	- Contraseña inicial (random generada o nro_documento según HU).
	- Teléfono registrado.
	- Instrucciones de primer acceso (“Cambiar contraseña en el primer inicio”).
---

### **Validaciones de Negocio**

* **VN-01:** Contraseña inicial debe ser un valor aleatorio, alfanumérico, de mínimo 8 caracteres.
* **VN-02:** `debe_cambiar_password = true` obligatorio para nuevos usuarios.
* **VN-03:** Solo generar credenciales para usuarios con `estado_activo = true`.
* **VN-04:** No re-generar credenciales si usuario ya tiene contraseña personalizada.
* **VN-05:** Para envío por WhatsApp, validar formato de teléfono (+51XXXXXXXXX).
* **VN-06:** Registrar log de cada credencial generada para auditoría.
* **VN-07:** Archivo de credenciales solo descargable por administrador (no compartir públicamente).

---

### **UI/UX**

* **UX-01:** Modal post-importación con opciones de distribución:

  * Botón grande: "📥 Descargar Excel con Credenciales"
  * Botón alternativo: "📱 Enviar por WhatsApp (Automático)"
  * Checkbox: "Generar PDFs individuales"
  * Resumen: "XXX credenciales generadas".
* **UX-02:** Archivo Excel con diseño institucional:

  * Header con logo de I.E.P. Las Orquídeas.
  * Colores institucionales (púrpura/naranja).
  * Filas alternas coloreadas para legibilidad.
  * Instrucciones en hoja separada "Cómo usar".
* **UX-03:** Progreso de envío WhatsApp:

  * Progress bar: "Enviando XX/YY mensajes..."
  * Lista de envíos exitosos/fallidos.
  * Botón "Reintentar envíos fallidos".
* **UX-04:** PDFs individuales con diseño profesional:

  * Header institucional.
  * Datos del usuario.
  * Instrucciones de primer acceso.
* **UX-05:** Confirmación de generación:
  * Toast notification: "✅ Credenciales generadas exitosamente".
  * Opción de re-descargar si se cierra por error.

---

### **Formato de Archivo Excel (Ejemplo)**

| Nombre Completo  | Rol     | Usuario  | Contraseña | Teléfono     | Fecha Creación |
| ---------------- | ------- | -------- | ---------- | ------------ | -------------- |
| Juan Pérez López | Padre   | 12345678 | aB9xT3qZ   | +51987654321 | 10/02/2025     |
| María García     | Docente | 87654321 | Zx8LmP1r   | +51912345678 | 10/02/2025     |

---

### **Mensajes de Error**

* "Error al generar archivo Excel. Intente nuevamente."
* "Envío WhatsApp fallido para el usuario 12345678. Número inválido."
* "No se pudieron generar PDFs. Verifique espacio en servidor."

### **Mensajes de Éxito**

* "✅ Archivo de credenciales descargado correctamente".
* "✅ 45 mensajes WhatsApp enviados exitosamente".
* "✅ 45 PDFs generados y disponibles para descarga".
* "⚠️ 3 envíos fallidos. Revise el reporte de errores."
* "⚠️ Contraseñas iniciales son temporales. Todos los usuarios deben cambiarlas al iniciar sesión".

---

### **HU Relacionadas**

* **HU Previas:** HU-USERS-04 (Crear usuarios masivamente).
* **HU Siguientes:** HU-AUTH-01 (Usuario inicia sesión con credenciales), HU-AUTH-02 (Recuperar contraseña si olvida), HU-AUTH-04 (Docente cambia contraseña obligatoriamente).

---

### **Componentes y Estructura**

* **Tipo:** Modal post-importación.
* **Componentes principales:**

  * `CredentialsGenerator`: Generador de credenciales.
  * `ExcelExporter`: Exportador a Excel.
  * `WhatsAppSender`: Enviador de mensajes WhatsApp.
  * `PDFGenerator`: Generador de PDFs individuales.
  * `DistributionModal`: Modal de opciones de distribución.
* **Endpoints API:**

  * `POST /admin/import/generate-credentials` - Generar credenciales.
  * `GET /admin/import/credentials/{importId}/download` - Descargar Excel.
  * `POST /admin/import/credentials/send-whatsapp` - Envío masivo WhatsApp.
  * `POST /admin/import/credentials/generate-pdfs` - Generar PDFs.





---

## **ENDPOINTS API CONSOLIDADOS DEL MÓDULO**
### Gestión de Permisos (Director)
GET    /teachers/permissions
PATCH  /teachers/{id}/permissions
GET    /teachers/{id}/permissions/history

### Estructura de Evaluación (Director)
GET    /evaluation-structure?año={año}
PUT    /evaluation-structure
GET    /evaluation-structure/history
GET    /evaluation-structure/templates
PATCH  /evaluation-structure/weights
GET    /evaluation-structure/preview

### Importación Masiva (Administrador)
GET    /admin/templates/{tipo}
POST   /admin/import/validate
POST   /admin/import/execute
POST   /admin/import/validate-relationships
POST   /admin/import/create-relationships
GET    /admin/verify/relationships

### Credenciales
POST   /admin/import/{importId}/credentials
GET    /admin/import/{importId}/credentials/download
POST   /admin/import/{importId}/credentials/send-whatsapp
POST   /admin/import/{importId}/credentials/generate-pdfs

### Datos Maestros
GET    /nivel-grado

```

---

## **CONSIDERACIONES TÉCNICAS ADICIONALES**

### **Seguridad:**
- Todos los endpoints requieren autenticación JWT
- Validación de roles en middleware (Director/Administrador)
- Encriptación bcrypt para contraseñas iniciales
- Logs de auditoría para cambios en permisos y configuraciones
- Rate limiting en endpoints de importación masiva

### **Performance:**
- Procesamiento asíncrono para importaciones masivas (>100 registros)
- Paginación en listados de docentes y permisos
- Caching de estructura de evaluación (actualización cada año)
- Índices en BD: `usuarios.nro_documento`, `estudiantes.codigo_estudiante`

### **Validaciones:**
- Frontend: React Hook Form + Zod
- Backend: Validación de schemas con Zod/Joi
- BD: Constraints FK, UNIQUE, NOT NULL

### **Notificaciones:**
- WhatsApp API para envío de credenciales y cambios de permisos
- Notificaciones en plataforma para docentes al cambiar permisos
- Email secundario (opcional) para credenciales

---

