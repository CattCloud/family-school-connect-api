# **Historias de Usuario - Módulo de Autenticación y Perfiles**

---

## **HU-AUTH-01** — Iniciar Sesión (Todos los Roles)

**Título:** Autenticación segura con redirección por rol

**Historia:**
> Como usuario del sistema (padre, docente, director, administrador), quiero iniciar sesión con mis credenciales únicas para acceder de forma segura a las funcionalidades correspondientes a mi rol.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Sistema valida documento + contraseña contra base de datos encriptada (bcrypt)
- Contraseña segura (mínimo 8 caracteres, reglas de complejidad).
- **CA-02:** Al validar correctamente:
  - Generar token JWT con datos del usuario (id, rol, nombre, permisos)
  - Registrar `fecha_ultimo_login = now()` en tabla usuarios
  - Crear sesión activa única (invalidar sesiones previas del mismo usuario)
- **CA-03:** Redirección automática según rol:
  - **Padre:** Dashboard con selector de hijos si tiene múltiples
  - **Docente:** Dashboard con asignaciones de cursos y flag de primer login
  - **Director:** Dashboard con métricas institucionales y herramientas de gestión
  - **Administrador:** Panel de soporte técnico y gestión del sistema


---

## **HU-AUTH-02** — Recuperar Contraseña Automatizada

**Título:** Reset de contraseña via WhatsApp con token temporal

**Historia:**
> Como usuario del sistema, quiero recuperar mi contraseña mediante un proceso automatizado que envíe un enlace temporal a mi WhatsApp registrado, para poder restablecer el acceso cuando olvide mis credenciales.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Usuario pone su tipo y número de documento en formulario de recuperación
- **CA-02:** Sistema valida que el documento existe y está activo
- **CA-03:** Al validar correctamente:
  - Generar token único temporal (UUID) válido por 1 hora
  - Almacenar token en tabla `password_reset_tokens` con `id_usuario`, `token`, `fecha_creacion` ,`fecha_expiracion`
  - Enviar mensaje WhatsApp al teléfono registrado con enlace: `[URL_SISTEMA]/reset-password?token=[TOKEN]`
- **CA-04:** Usuario accede al enlace y visualiza formulario de nueva contraseña
- **CA-05:** Al enviar nueva contraseña:
  - Validar que token existe y no ha expirado
  - En tabla password_reset_tokens marcar `usado` =true
  - Encriptar nueva contraseña con bcrypt
  - Actualizar `password_hash` en tabla usuarios
  - Invalidar token usado
  - Mostrar confirmación y redireccionar a login
---

## **HU-AUTH-03** — Cerrar Sesión Segura

**Título:** Logout seguro con invalidación de token

**Historia:**
> Como usuario autenticado, quiero cerrar sesión de forma segura para garantizar que mi cuenta no sea accesible desde el dispositivo cuando termine de usar el sistema.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Icono del Usuario presente en el header, al hace click se abre un desplegable dropdown con opciones del usuario, una opcion es "Cerrar sesión".
- **CA-02:** Sistema ejecuta logout inmediato:
  - Invalidar token JWT actual del usuario
  - Limpiar localStorage/sessionStorage del navegador
  - Eliminar cookies de sesión si existen
  - Registrar timestamp de logout en logs del sistema
- **CA-03:** Redirección automática a pantalla de login
- **CA-04:** Prevención de acceso: Si usuario intenta acceder a rutas protegidas, redirección inmediata a login

---

## **HU-AUTH-04** — Cambio Obligatorio de Contraseña (Docentes)

**Título:** Primera autenticación con cambio forzado de credenciales

**Historia:**
> Como docente, quiero cambiar mi contraseña inicial obligatoriamente en mi primer acceso al sistema, para garantizar la seguridad de mi cuenta y el acceso a datos sensibles de estudiantes.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Al autenticarse, verificar si `usuarios.debe_cambiar_password = true`
- **CA-02:** Si debe cambiar contraseña:
  - Interceptar redirección normal al dashboard
  - Mostrar pantalla obligatoria de cambio de contraseña
  - Bloquear acceso a cualquier otro módulo hasta completar el cambio
- **CA-03:** Formulario de cambio con campos: 
  - "Contraseña actual"
  - "Nueva contraseña"
  - Boton "Confirmar nueva"
- **CA-04:** Al validar y actualizar correctamente:
  - Encriptar nueva contraseña con bcrypt
  - Actualizar `password_hash` en base de datos
  - Cambiar `debe_cambiar_password = false`
  - Permitir acceso normal al dashboard docente

---

## **HU-AUTH-05** — Selector de Hijos (Padres)

**Título:** Cambio de contexto entre múltiples hijos matriculados

**Historia:**
> Como padre con múltiples hijos matriculados, quiero seleccionar fácilmente entre mis hijos mediante un selector en el header para visualizar la información académica específica de cada uno sin cerrar sesión.

**Criterios de Aceptación:**

**Condiciones Funcionales:**
- **CA-01:** Al autenticarse como padre, sistema verifica cantidad de hijos en `relaciones_familiares`
- **CA-02:** Si tiene múltiples hijos:
  - Mostrar dropdown en header con lista de hijos (nombre completo + grado)
  - Seleccionar automáticamente el primer hijo como contexto inicial
  - Permitir cambio en cualquier momento durante la sesión (dropdown con lista de hijos presente en el menu principal del padre)
- **CA-03:** Al cambiar selección:
  - Actualizar contexto global de la aplicación
  - Refrescar automáticamente dashboard y módulos visibles
  - Mantener selección durante toda la sesión (hasta logout)
- **CA-04:** Si tiene un solo hijo: No mostrar selector, contexto automático

---

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

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Padres/apoderados que consultan
2. **estudiantes** - Estudiantes cuyos datos se visualizan
3. **relaciones_familiares** - Vinculación padre-hijo
4. **cursos** - Cursos del estudiante
5. **estructura_evaluacion** - Componentes de evaluación configurados
6. **evaluaciones** - Calificaciones registradas
7. **asistencias** - Registros de asistencia diaria
8. **nivel_grado** - Información académica del estudiante

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login con selector de hijos
- **Módulo de Gestión de Usuarios** (Semana 5) - Estructura de evaluación definida
- **Módulo de Carga de Datos** (Semanas 6-7 Parte 1) - Calificaciones y asistencia registradas

### **Roles Involucrados:**

- **Padre/Apoderado:** Usuario que consulta información académica de sus hijos

---

## **HU-ACAD-06 — Ver Calificaciones de Componente por Trimestre**

**Título:** Consulta detallada de calificaciones por componente de evaluación

**Historia:**

> Como padre/apoderado, quiero ver las calificaciones de mi hijo por componente de evaluación y trimestre para hacer seguimiento detallado de su desempeño académico en cada aspecto evaluado.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Calificaciones" desde dashboard del padre
- **CA-02:** Pantalla principal muestra **controles de filtrado:**
    - **Selector de Año Académico:** Dropdown con años disponibles (default: año actual)
    - **Selector de Trimestre:** Tabs horizontales {Trimestre 1, Trimestre 2, Trimestre 3} (default: trimestre actual)
    - **Selector de Curso:** Dropdown con cursos del estudiante en el año/trimestre seleccionado
    - **Selector de Componente:** Dropdown con componentes de evaluación activos (extraídos de `estructura_evaluacion`)
- **CA-03:** Al seleccionar curso y componente, el sistema muestra:
    
    **Para componentes RECURRENTES (ej. Participación, Tareas):**
    
    - **Tabla de Notas Individuales** (TanStack Table):
        - Columnas dinámicas: Fecha de evaluación | Calificación | Estado
        - Fecha de evaluacion en formato facil de leer
        - Filas: Una por cada evaluación registrada
        - Formato de calificación según preferencia del padre (numérico 0-20 o letras AD/A/B/C)
        - Badge de estado:
            - "Preliminar" (fondo amarillo/naranja) si `estado = 'preliminar'`
            - "Final" (fondo verde/azul) si `estado = 'final'`
        - Ordenamiento: Fecha descendente (más reciente primero)
        - Paginación: 10 registros por página
    - **Card de Resumen Superior:**
        - Título: "Promedio Actual - [Nombre Componente]"
        - Valor: Promedio del componente (calculado en tiempo real)
        - Subtítulo: "Basado en X evaluaciones registradas"
        - Indicador visual: Color según promedio
        - Nota: "Este promedio es preliminar y puede cambiar" (si hay notas preliminares)
    
    **Para componentes ÚNICOS (ej. Examen Trimestral):**
    
    - **Tabla Simple** (TanStack Table):
        - Columnas: Fecha de evaluación | Calificación | Estado
        - Fecha de evaluacion en formato facil de leer
        - Una sola fila (solo una evaluación)
        - Mismo formato de badges de estado
    - **Card de Resumen Superior:**
        - Título: "Calificación - [Nombre Componente]"
        - Valor: Calificación única
        - Badge de estado claramente visible
- **CA-04:** Toggle de Formato de Visualización:
    - Ubicación: Esquina superior derecha de la tabla
    - Opciones: "Numérico (0-20)" | "Letras (AD, A, B, C)"
    - Comportamiento:
        - Default: Numérico
        - Al cambiar, todas las calificaciones se convierten automáticamente
        - Conversión según regla:
            - AD: 18-20
            - A: 14-17
            - B: 11-13
            - C: 0-10
    - Preferencia se guarda en localStorage del navegador
- **CA-05:** Diferenciación Visual Clara:
    - **Notas Preliminares:**
        - Badge amarillo/naranja con texto "Preliminar"
        - Texto de advertencia: "⚠️ Las notas preliminares pueden modificarse hasta el cierre del trimestre"
    - **Notas Finales:**
        - Badge verde/azul con texto "Final"
        - Ícono de candado 🔒 indicando que no pueden modificarse
        - Texto de confirmación: "✅ Notas oficiales del trimestre"
- **CA-06:** Estado Vacío:
    - Si no hay evaluaciones registradas para el componente/trimestre seleccionado:
        - Mensaje: "Aún no hay calificaciones registradas para [Componente] en el Trimestre [X]"
        - Ícono ilustrativo
        - Sugerencia: "Consulte con el docente si tiene dudas"
- **CA-07:** Carga y Performance:
    - Skeleton loaders mientras se cargan los datos
    - Timeout: 5 segundos máximo
    - Mensaje de error claro si falla la carga
- **Endpoints API:**
    - `GET /calificaciones/estudiante/{id}` - Calificaciones completas del estudiante
        - Query params: `?año={año}&trimestre={trimestre}&curso_id={id}&componente_id={id}`
    - `GET /calificaciones/promedio` - Promedio calculado en tiempo real
        - Query params: `?estudiante_id={id}&curso_id={id}&componente_id={id}&trimestre={trimestre}`
    - `GET /cursos/estudiante/{id}` - Cursos del estudiante por año
    - `GET /estructura-evaluacion?año={año}` - Componentes disponibles

---

## **HU-ACAD-07 — Consultar Asistencia Diaria con Calendario y Estadísticas**

**Título:** Visualización de asistencia con calendario interactivo

**Historia:**

> Como padre/apoderado, quiero consultar la asistencia diaria de mi hijo mediante un calendario visual con códigos de colores para monitorear fácilmente su presencia en la institución y detectar patrones.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Asistencia" desde dashboard del padre
- **CA-02:** Pantalla principal muestra **controles de filtrado:**
    - **Selector de Año Académico:** Dropdown con años disponibles (default: año actual)
    - **Selector de Vista:** Tabs {Mes, Trimestre, Año Completo} (default: Mes actual)
- **CA-03:** **Calendario Visual** (React Big Calendar):
    - **Vista por Mes:**
        - Calendario mensual estándar (7 columnas x 4-5 filas)
        - Cada día muestra:
            - Badge circular con ícono según estado de asistencia
            - Tooltip al hover con detalle completo
        - Navegación: Flechas < > para cambiar de mes
        - Botón "Hoy" para regresar al mes actual
    - **Vista por Trimestre:**
        - 3 mini-calendarios lado a lado (uno por cada mes del trimestre)
        - Mismo sistema de códigos de colores
        - Zoom reducido pero badges visibles

- **CA-04:** **Códigos de Colores y Estados:**
    - **Presente (🟢):**
        - Color: Verde (#2ECC71)
        - Ícono: ✅
        - Tooltip: "Presente"
    - **Tardanza (🟡):**
        - Color: Amarillo (#F39C12)
        - Ícono: ⏰
        - Tooltip: "Tardanza"
    - **Permiso (🔵):**
        - Color: Azul (#3498DB)
        - Ícono: 📋
        - Tooltip: "Permiso "
    - **Falta Justificada (🟠):**
        - Color: Naranja (#E67E22)
        - Ícono: 📄
        - Tooltip: "Falta Justificada "
    - **Falta Injustificada (🔴):**
        - Color: Rojo (#E74C3C)
        - Ícono: ❌
        - Tooltip: "Falta Injustificada "
    - **Sin Registro (⚪):**
        - Color: Gris claro (#ECF0F1)
        - Ícono: —
        - Tooltip: "Sin registro"
    - **Día No Lectivo (⬛):**
        - Color: Gris oscuro (#95A5A6)
        - Ícono: —
        - Tooltip: "Día no lectivo" (fines de semana, feriados)
- **CA-05:** **Panel de Estadísticas** (lateral o superior):
    - **Card Principal:** Resumen del período visible (mes/trimestre/año)
        - Total de días lectivos
        - Días con registro
        - Porcentaje de asistencia global
        - Gráfico de dona (Recharts) con distribución de estados
    - **Desglose Detallado:**
        - **Presentes:** XX días (XX%)
        - **Tardanzas:** XX días (XX%)
        - **Permisos:** XX días (XX%)
        - **Faltas Justificadas:** XX días (XX%)
        - **Faltas Injustificadas:** XX días (XX%)
        - Cada línea con badge de color correspondiente
    - **Indicadores Especiales:**
        - 🚨 Alerta si faltas injustificadas >= 3 consecutivas
        - ⚠️ Advertencia si tardanzas >= 5 en el trimestre
        - ✅ Reconocimiento si asistencia >= 95%
- **CA-06:** **Interactividad del Calendario:**
    - Clic en un día con registro: Abre modal con detalle completo
        - Fecha
        - Estado
        - Hora de llegada (si aplica)
        - Justificación (si aplica)
        - Fecha de registro
        - Registrado por (nombre del docente)
    - Selección de rango de fechas:
        - Permite seleccionar múltiples días (click + drag)
        - Muestra estadísticas solo del rango seleccionado
        - Botón "Limpiar selección"
- **CA-07:** **Exportación de Datos:**
    - Botón "Exportar" en esquina superior
    - Opciones:
        - Exportar a PDF (reporte con calendario visual)
    - Incluye filtros aplicados y estadísticas
- **CA-08:** **Estado Vacío:**
    - Si no hay registros de asistencia para el período:
        - Mensaje: "Aún no hay registros de asistencia para [Mes/Trimestre/Año]"
        - Calendario visible pero sin datos
        - Sugerencia: "Los registros se actualizan diariamente"
- **Endpoints API:**
    - `GET /asistencias/estudiante/{id}` - Obtiene todos los registros de asistencia del estudiante.
        - Query params: `?año={año}&mes={mes}` (mutuamente excluyentes con `trimestre`) o `?año={año}&trimestre={trimestre}` (mutuamente excluyentes con `mes`). Si no se especifica, se usa el mes actual.
    - `GET /asistencias/estudiante/{id}/estadisticas` - Estadísticas calculadas para un rango de fechas.
        - Query params: `?fecha_inicio={fecha}&fecha_fin={fecha}`
    - `GET /asistencias/estudiante/{id}/export` - Exporta reporte visual de asistencia (PDF/Excel) con calendario y estadísticas.
        - Query params: `?formato={pdf|excel}&fecha_inicio={fecha}&fecha_fin={fecha}`
    - `GET /calendario/dias-no-lectivos?año={año}` - Lista los feriados y días no lectivos institucionales (para marcar en calendario).

---

## **HU-ACAD-09 — Visualizar Resumen Trimestral y Anual Consolidado**

**Título:** Vista consolidada de promedios y resultados finales por curso

**Historia:**

> Como padre/apoderado, quiero ver el resumen de notas de mi hijo por curso y trimestre, así como la tabla final del año, para entender su rendimiento general y acceder a la boleta oficial.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo **“Resumen Académico”** desde el dashboard del padre.
- **CA-02:** Pantalla principal muestra **controles de filtrado:**
    - **Selector de Año Académico:** Dropdown con años disponibles (default: año actual)
    - **Selector de Trimestre:** Tabs horizontales {Trimestre 1, Trimestre 2, Trimestre 3, Anual} (default: trimestre actual)

---

### **Vista Trimestral — Resumen de notas por curso**

- **CA-03:** Para cada curso del estudiante, se muestra un **card de resumen** con:
    - **Header:**
        - Nombre del curso + ícono representativo
        - Badge del trimestre actual
    - **Fórmula de cálculo (Estructura Evaluación):**
        - Lista visual de componentes con sus pesos (ej. Examen 40%, Participación 20%, etc.)
    - **Tabla de promedios por componente (TanStack Table):**
        - Columnas: Componente | Promedio | Peso | Subtotal
        - Promedios redondeados a 2 decimales
        - Colores de desempeño:
            - Verde ≥ 14 (Logro esperado)
            - Amarillo 11–13 (En proceso)
            - Rojo < 11 (Bajo rendimiento)
    - **Card de promedio final del trimestre:**
        - Promedio calculado: `Σ (promedio × peso) / 100`
        - Badge de estado:
            - 🟡 “Preliminar” si hay notas preliminares
            - 🟢 “Final” si todas son oficiales
        - Calificación en letras (AD, A, B, C)
        - Barra de progreso visual
        - Mensaje:
            - ⚠️ “Promedio preliminar, sujeto a cambios”
            - ✅ “Promedio oficial certificado el [fecha]”

---

### **Vista Anual — Tabla consolidada de notas finales**

- **CA-04:** Al seleccionar la vista “Anual”, se muestra una **tabla consolidada** (TanStack Table):
    - Columnas: Curso | T1 | T2 | T3 | Promedio Final | Estado
    - Filas: Un curso por fila
    - **Cálculos:**
        - Promedio Final = (T1 + T2 + T3) / 3
        - Estado:
            - ✅ Aprobado (≥ 11)
            - ❌ Desaprobado (< 11)
    - **Estilo visual coherente con HU-06:**
        - Fondo verde/rojo según estado
        - Tooltip con desglose del cálculo
    - **Acciones:**
        - Botón “Ver Detalle” → redirige a HU-06 (vista por componente)
        - Botón “Exportar Boleta (PDF)” → descarga boleta institucional

---

### **Gráfico Comparativo (Recharts)**

- **CA-05:** Gráfico de barras simple:
    - Eje X: Cursos
    - Eje Y: Promedio final (escala 0–20)
    - Colores:
        - Verde ≥ 14
        - Amarillo 11–13
        - Rojo < 11
    - Línea de referencia en 11 (nota mínima aprobatoria)
    - Tooltip al hover: muestra promedio exacto

---

### **Exportación**

- **CA-06:** Botón global “Exportar Boleta PDF” en la parte superior:
    - Genera un documento con logo institucional, datos del estudiante y tabla anual
    - Incluye firma digital y fecha de certificación
    - Disponible solo si hay al menos un trimestre cerrado (notas finales)

- **Endpoints API:**
    - `GET /resumen-academico/estudiante/{id}` - Retorna el resumen completo de calificaciones del estudiante.
        - Query params: `?año={año}&trimestre={trimestre}`
    - `GET /resumen-academico/estudiante/{id}/export` - Genera la boleta institucional PDF con promedios finales y logo oficial.
        - Query params: `?año={año}&formato={pdf}`

---

**ENDPOINTS API CONSOLIDADOS — VISUALIZACIÓN (PADRES)**

### **CALIFICACIONES**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| **GET** | `/calificaciones/estudiante/{id}` | Obtiene todas las calificaciones del estudiante por año y trimestre. |
| **GET** | `/calificaciones/estudiante/{id}/promedio` | Calcula el promedio en tiempo real para un curso y componente específicos. |
| **GET** | `/calificaciones/estudiante/{id}/promedios-trimestre` | Devuelve los promedios por componente y curso del trimestre seleccionado. |
| **GET** | `/calificaciones/estudiante/{id}/promedios-anuales` | Retorna los promedios finales anuales por curso. |
| **GET** | `/calificaciones/estudiante/{id}/estadisticas-generales` | Entrega métricas generales del rendimiento (promedio general, curso con mejor/peor nota, etc.). |
| **GET** | `/cursos/estudiante/{id}` | Lista los cursos matriculados del estudiante en un año académico. |
| **GET** | `/estructura-evaluacion` | Obtiene los componentes de evaluación y pesos definidos por la institución. **Query:** `?año={año}` |
| **GET** | `/calificaciones/estudiante/{id}/export` | Exporta calificaciones o boleta de notas en formato PDF o Excel. **Query:** `?año={año}&formato={pdf|excel}` |

### **ASISTENCIA**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| **GET** | `/asistencias/estudiante/{id}` | Obtiene todos los registros de asistencia del estudiante. **Query:** `?año={año}&mes={mes}` (mutuamente excluyentes con `trimestre`) o `?año={año}&trimestre={trimestre}` (mutuamente excluyentes con `mes`). |
| **GET** | `/asistencias/estudiante/{id}/estadisticas` | Calcula porcentajes de asistencia, tardanza, permisos, faltas, etc. **Query:** `?fecha_inicio={fecha}&fecha_fin={fecha}` |
| **GET** | `/asistencias/estudiante/{id}/export` | Exporta reporte visual de asistencia (PDF/Excel) con calendario y estadísticas. **Query:** `?formato={pdf|excel}&fecha_inicio={fecha}&fecha_fin={fecha}` |
| **GET** | `/calendario/dias-no-lectivos?año={año}` | Lista los feriados y días no lectivos institucionales (para marcar en calendario). |

### **RESUMEN ACADÉMICO**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| **GET** | `/resumen-academico/estudiante/{id}` | Retorna el resumen completo de calificaciones del estudiante. **Query:** `?año={año}&trimestre={trimestre}` |
| **GET** | `/resumen-academico/estudiante/{id}/promedios-trimestre` | Devuelve promedios ponderados por curso del trimestre seleccionado. **Query:** `?año={año}&trimestre={trimestre}` |
| **GET** | `/resumen-academico/estudiante/{id}/promedios-anuales` | Devuelve tabla consolidada de los 3 trimestres y promedio final anual. **Query:** `?año={año}` |
| **GET** | `/resumen-academico/estudiante/{id}/estadisticas` | Calcula métricas globales: promedio general, cursos aprobados/desaprobados, mejor curso, etc. **Query:** `?año={año}&trimestre={trimestre}` |
| **GET** | `/resumen-academico/estudiante/{id}/export` | Genera la boleta institucional PDF con promedios finales y logo oficial. **Query:** `?año={año}&formato={pdf}` |

## **COMPLEMENTARIOS (Opcionales / Utilitarios)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| **GET** | `/usuarios/hijos` | Devuelve lista de hijos asociados al padre autenticado (para selector global). |
| **GET** | `/año-academico/actual` | Devuelve el año académico activo y trimestres configurados. |
| **GET** | `/nivel-grado` | Devuelve la lista de niveles y grados activos. |
| **GET** | `/alertas/estudiante/{id}` | Muestra alertas de asistencia o rendimiento (integrable con HU futuras). |

---
## **HU-MSG-00 — Bandeja de Mensajería**

**Título:** Vista principal de gestión de conversaciones tipo Gmail

**Historia:**

> Como padre/docente, quiero acceder a una bandeja organizada con mis conversaciones (recibidas y enviadas) para gestionar fácilmente mi comunicación con la institución educativa y dar seguimiento a los mensajes importantes.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Mensajería" desde el dashboard principal mediante botón destacado en menú lateral
- **CA-02:** La interfaz principal está dividida en **2 secciones** (layout tipo Gmail):
    
    **SECCIÓN IZQUIERDA: Sidebar de Navegación**
    
    - Botón principal **"📝 Nuevo Mensaje"** (destacado, color primario)
        - **Padre:** Botón habilitado, redirige a HU-MSG-01
        - **Docente:** Botón deshabilitado visualmente (gris) con tooltip: "Solo puedes responder mensajes iniciados por padres"
    - **Pestañas de filtrado:**
        - 📥 **Recibidos** - Conversaciones con mensajes entrantes
        - 📤 **Enviados** - Conversaciones iniciadas por el usuario
        - 📋 **Todos** - Vista combinada (opción por defecto)
    - **Badge con contador** de mensajes no leídos (número rojo en esquina superior derecha del ícono 📥)
    - **Buscador** con campo de texto:
        - Placeholder: "Buscar conversaciones..."
        - Búsqueda en tiempo real (debounce 300ms)
        - Filtra por: nombre del destinatario, asunto, contenido de mensajes
    
    **SECCIÓN DERECHA: Lista de Conversaciones**
    
    - **Vista principal:** Lista vertical scrollable con tarjetas de conversación
    - **Cada tarjeta muestra:**
        - **Avatar circular** del otro usuario (inicial del nombre si no hay foto)
        - **Nombre completo** del destinatario (padre o docente)
        - **Curso relacionado** (badge pequeño): Ej. "Matemáticas - 5to Primaria"
        - **Estudiante relacionado** (solo visible para padre con múltiples hijos): Ej. "Sobre: Juan Pérez"
        - **Asunto** de la conversación (máx 50 caracteres, truncado con "...")
        - **Último mensaje:** Preview del contenido (máx 80 caracteres)
        - **Fecha/Hora** del último mensaje:
            - Si es hoy: "HH:MM" (Ej: "14:30")
            - Si es ayer: "Ayer"
            - Otros días: "DD/MM/YYYY"
        - **Estado visual:**
            - **No leído:** Fondo blanco, texto en negrita, punto azul a la izquierda
            - **Leído:** Fondo gris claro, texto normal
        - **Indicador de archivos adjuntos:** Ícono 📎 si el último mensaje tiene adjuntos (Libreria Lucide React)
- **CA-03:** Ordenamiento de conversaciones:
    - Por defecto: **Fecha del último mensaje (más reciente primero)**
    - Conversaciones con mensajes no leídos aparecen siempre al inicio
    - Selector de ordenamiento alternativo:
        - "Más reciente"
        - "Más antigua"
        - "Por estudiante (A-Z)" (solo para docentes)
- **CA-04:** Filtros específicos por rol:
    
    **Para Padre:**
    
    - **Filtro por hijo:** Dropdown en header global (ya existente)
        - Al cambiar de hijo, se recargan conversaciones correspondientes
    - **Filtro por docente:** Dropdown con lista de docentes que enseñan al hijo seleccionado
    - **Filtro por curso:** Dropdown con cursos del hijo seleccionado
    
    **Para Docente:**
    
    - **Filtro por estudiante:** Dropdown con lista de estudiantes de sus cursos asignados
    - **Filtro por curso:** Dropdown con cursos que enseña
    - **Filtro por grado:** Dropdown con grados en los que tiene cursos asignados
- **CA-05:** Interacciones con conversaciones:
    - **Click en tarjeta:** Abre la conversación completa (HU-MSG-03)
    - **Hover:** Fondo ligeramente más oscuro, cursor pointer
    - **Marcar como leída/no leída:** Botón de tres puntos (⋮) con menú contextual:
        - "Marcar como leída" / "Marcar como no leída"
        - "Cerrar conversación" (cambia estado a `cerrada`, se archiva)
- **CA-06:** Estado vacío:
    - Si no hay conversaciones: Ilustración SVG + mensaje:
        - **Padre:** "No tienes conversaciones aún. Inicia una nueva para comunicarte con los docentes."
        - **Docente:** "No tienes conversaciones pendientes. Los padres pueden contactarte desde su panel."
    - Botón "📝 Nuevo Mensaje" (solo habilitado para padres)
- **CA-07:** Paginación y carga:
    - **Lazy loading:** Cargar 20 conversaciones iniciales
    - Al hacer scroll al final: Cargar siguiente lote de 20 automáticamente
    - Indicador de carga: Spinner al final de la lista
    - Si no hay más conversaciones: Mensaje "No hay más conversaciones"
- **CA-08:** Actualización en tiempo real:
    - **Polling cada 30 segundos** para verificar nuevos mensajes
    - Si hay nuevos mensajes:
        - Actualizar badge de contador
        - Mostrar notificación toast: "Nuevo mensaje de [Nombre]"
        - Reproducir sonido de notificación (opcional, configurable por usuario)
        - Agregar conversación al inicio de la lista (si es nuevo) o moverla al inicio (si existía)
- **CA-09:** Responsive design:
    - **Desktop (>1024px):** Sidebar fijo + lista a la derecha (layout de 2 columnas)
    - **Tablet (768px-1024px):** Sidebar colapsable con hamburger menu
    - **Mobile (<768px):** Vista única, sidebar se oculta, aparece botón flotante "+" para nuevo mensaje
- **Endpoints API:**
    - `GET /conversaciones?usuario_id={id}&rol={rol}&page={page}&limit={limit}` - Lista de conversaciones paginadas
    - `GET /conversaciones/search?query={query}&usuario_id={id}` - Búsqueda de conversaciones
    - `GET /conversaciones/filtros?usuario_id={id}&estudiante_id={id}&curso_id={id}` - Conversaciones filtradas
    - `PATCH /conversaciones/:id/marcar-leida` - Marcar conversación como leída
    - `PATCH /conversaciones/:id/cerrar` - Cerrar/archivar conversación
    - `GET /conversaciones/no-leidas/count?usuario_id={id}` - Contador de mensajes no leídos
    - `GET /conversaciones/actualizaciones?usuario_id={id}&ultimo_check={timestamp}` - Polling de nuevos mensajes

---

## **HU-MSG-01 — Enviar Nuevo Mensaje (Padre)**

**Título:** Iniciar conversación con docente mediante wizard de 2 pasos

**Historia:**

> Como padre de familia, quiero enviar mensajes con archivos adjuntos a los docentes de mi hijo para comunicar situaciones específicas, hacer consultas académicas y adjuntar evidencias cuando sea necesario.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al formulario desde dos puntos:
    - Botón **"📝 Nuevo Mensaje"** en sidebar de HU-MSG-00
    - Botón flotante **"+"** en versión móvil
    - Al hacer clic, redirige a `/dashboard/mensajeria/nuevo`
- **CA-02:** La interfaz está diseñada como **Wizard de 2 pasos** con barra de progreso visual:
    
    **PASO 1: Selección de Destinatario y Contexto**
    
    - **Título de página:** "Nuevo Mensaje"
    - **Select "Hijo":** (Pre-seleccionado del header global)
        - Muestra: Nombre completo + Grado (Ej: "Juan Pérez - 5to Primaria")
    - **Select "Curso":**
        - Lista de cursos del hijo seleccionado
        - Formato: "Nombre del Curso - Grado" (Ej: "Matemáticas - 5to Primaria")
        - Ordenado alfabéticamente
        - Solo cursos con docentes asignados activos
    - **Select "Docente":**
        - Se carga dinámicamente según el curso seleccionado
        - Muestra: Nombre completo del docente (Ej: "Prof. María González")
        - Si un curso tiene múltiples docentes (varios paralelos): Muestra todos
            - Si solo tiene un docente, se autoselecciona el unico docente
        - Solo docentes con `estado_activo = true`
    - **Input "Asunto":**
        - Campo de texto de una línea
        - Placeholder: "Ej: Consulta sobre tarea de matemáticas"
        - Mínimo: 10 caracteres
        - Máximo: 200 caracteres
        - Contador de caracteres visible: "XX/200"
        - Validación en tiempo real con mensaje de error si está fuera de rango
    - **Botón "Continuar":**
        - Habilitado solo cuando todos los campos están completos y válidos
        - Color primario (púrpura), texto blanco
        - Al hacer clic: Transición suave al Paso 2
    - **Botón "Cancelar":**
        - Secundario (gris), borde outline
        - Muestra modal de confirmación: "¿Seguro que deseas cancelar? Se perderá la información ingresada."
        - Opciones: "Sí, cancelar" (rojo) | "No, continuar editando" (gris)
    
    **PASO 2: Redacción de Mensaje y Adjuntos**
    
    - **Resumen del contexto** (no editable, solo lectura):
        - Badge pequeño con: "Para: [Docente] | Curso: [Curso] | Sobre: [Hijo]"
        - Botón "✏️ Editar" para volver al Paso 1
    - **Textarea "Mensaje":**
        - Campo de texto multilínea expandible
        - Placeholder: "Escribe tu mensaje aquí..."
        - Mínimo: 10 caracteres
        - Máximo: 1000 caracteres
        - Contador de caracteres: "XX/1000"
        - Altura inicial: 150px
        - Auto-resize al escribir (max-height: 400px)
    - **Sección "Adjuntar Archivos":**
        - Componente de **drag & drop** con área destacada:
            - Texto: "📎 Arrastra tus archivos aquí o haz clic para seleccionar"
            - Zona punteada con animación al arrastrar archivo
        - Botón alternativo: "Examinar archivos" (para usuarios sin experiencia en drag & drop)
        - **Validaciones en tiempo real:**
            - Tipos permitidos: **PDF, JPG, PNG** únicamente
            - Tamaño máximo: **5MB por archivo**
            - Cantidad máxima: **3 archivos**
        - **Vista previa de archivos adjuntos:**
            - Lista de archivos cargados con:
                - Ícono según tipo (📄 PDF, 🖼️ JPG/PNG) (Libreria Lucide React)
                - Nombre del archivo (truncado si es muy largo)
                - Tamaño del archivo (Ej: "2.3 MB")
                - Botón "❌" para eliminar archivo
            - Si se alcanza el límite de 3 archivos: Área de carga se deshabilita visualmente
    - **Botón "Enviar Mensaje":**
        - Color primario (púrpura), texto blanco, ícono ✉️
        - Habilitado solo si el mensaje tiene mínimo 10 caracteres
        - Al hacer clic: Mostrar spinner en el botón + texto "Enviando..."
        - Deshabilitar botón durante el envío
    - **Botón "Atrás":**
        - Vuelve al Paso 1 manteniendo datos ingresados
        - Secundario (gris outline)
- **CA-03:** Proceso de envío y validaciones:
    - **Validación frontend:**
        - Verificar que todos los campos obligatorios están completos
        - Validar tipo MIME de archivos antes de subida
        - Validar tamaño de archivos antes de subida
        - Mostrar errores específicos por campo si fallan validaciones
    - **Subida de archivos a Cloudinary:**
        - Usar middleware Multer para procesar archivos
        - Subir archivos uno por uno con barra de progreso:
            - "Subiendo archivo 1 de 3... 45%"
        - Generar URL de Cloudinary por cada archivo
        - Almacenar metadatos en tabla `archivos_adjuntos`
    - **Validación backend:**
        - Verificar que el hijo pertenece al padre autenticado
        - Verificar que el docente está asignado al curso seleccionado
        - Verificar tipo MIME y tamaño de archivos
        - Validar que no existen más de 3 archivos adjuntos
- **CA-04:** Comportamiento según conversación existente:
    - **Si NO existe conversación previa** entre ese padre-docente-estudiante-curso:
        - Crear nueva conversación en tabla `conversaciones`:
            
            ```sql
            INSERT INTO conversaciones (
              estudiante_id, padre_id, docente_id, asunto,
              estado, fecha_inicio, fecha_ultimo_mensaje,
              año_academico, tipo_conversacion, creado_por
            ) VALUES (
              ?, ?, ?, ?,
              'activa', NOW(), NOW(),
              2025, 'padre_docente', ?
            );
            
            ```
            
        - Crear primer mensaje en tabla `mensajes`:
            
            ```sql
            INSERT INTO mensajes (
              conversacion_id, emisor_id, contenido,
              fecha_envio, estado_lectura, tiene_adjuntos
            ) VALUES (
              ?, ?, ?,
              NOW(), 'enviado', ?
            );
            
            ```
            
    - **Si YA existe conversación previa:**
        - Verificar si el asunto es diferente al actual
        - Si el asunto es diferente: Modal de confirmación:
            - "Ya existe una conversación con este docente sobre [Hijo]. ¿Deseas continuar la conversación existente o crear una nueva?"
            - Opciones: "Continuar existente" | "Crear nueva"
        - Si el asunto es igual: Agregar mensaje al hilo existente
        - Actualizar `fecha_ultimo_mensaje` en tabla `conversaciones`
- **CA-05:** Almacenamiento de archivos adjuntos:
    - Insertar registros en tabla `archivos_adjuntos`:
        
        ```sql
        INSERT INTO archivos_adjuntos (
          mensaje_id, nombre_original, nombre_archivo,
          url_cloudinary, tipo_mime, tamaño_bytes,
          fecha_subida, subido_por
        ) VALUES (
          ?, ?, ?,
          ?, ?, ?,
          NOW(), ?
        );
        
        ```
        
    - Actualizar campo `tiene_adjuntos = true` en tabla `mensajes`
- **CA-06:** Generación de notificaciones automáticas:
    - Crear registro en tabla `notificaciones`:
        
        ```sql
        INSERT INTO notificaciones (
          usuario_id, tipo, titulo, contenido,
          canal, estado_plataforma, fecha_creacion,
          url_destino, estudiante_id, año_academico
        ) VALUES (
          docente_id, 'mensaje', 'Nuevo mensaje de [Padre]', contenido_mensaje,
          'ambos', 'pendiente', NOW(),
          '/dashboard/mensajeria/conversacion/{id}', estudiante_id, 2025
        );
        
        ```
        
    - **Envío de notificación WhatsApp:**
        - Formato del mensaje:
            
            ```
            📬 Nuevo mensaje de [Nombre Padre]
            Sobre: [Nombre Estudiante]
            Curso: [Nombre Curso]
            Asunto: [Asunto]
            
            Mensaje: [Primeros 100 caracteres...]
            
            📱 Ver mensaje completo: [URL]
            
            ```
            
        - Enviar mediante Meta WhatsApp Cloud API
        - Actualizar `estado_whatsapp` en tabla `notificaciones`
    - **Notificación en plataforma:**
        - Badge en campana de notificaciones del docente
        - Toast notification si el docente está en sesión activa
- **CA-07:** Feedback después del envío:
    - Modal de confirmación con animación de éxito:
        - Ícono: ✅ (verde)
        - Título: "¡Mensaje enviado correctamente!"
        - Contenido: "Tu mensaje ha sido enviado a [Docente]. Recibirás una notificación cuando te responda."
        - Botón: "Ver conversación" (redirige a HU-MSG-03)
        - Botón: "Volver a bandeja" (redirige a HU-MSG-00)
    - Actualizar bandeja de mensajería (agregar nueva conversación al inicio)
    - Limpiar formulario completamente
- **Endpoints API:**
    - `GET /estudiantes?padre_id={id}` - Hijos del padre
    - `GET /cursos/estudiante/:estudiante_id` - Cursos del estudiante
    - `GET /docentes/curso/:curso_id` - Docentes del curso
    - `GET /conversaciones/existe?padre_id={id}&docente_id={id}&estudiante_id={id}` - Verificar conversación existente
    - `POST /conversaciones` - Crear nueva conversación
    - `POST /mensajes` - Crear nuevo mensaje
    - `POST /archivos/upload` - Subir archivo a Cloudinary
    - `POST /archivos-adjuntos` - Registrar archivo en BD
    - `POST /notificaciones` - Crear notificación
    - `POST /notificaciones/whatsapp` - Enviar WhatsApp


---

## **HU-MSG-03 — Ver Conversación y Continuar Chat**

**Título:** Visualización de historial completo y continuación de conversación tipo WhatsApp

**Historia:**

> Como padre/docente, quiero abrir una conversación específica y visualizar el historial completo de mensajes para revisar comunicaciones anteriores, ver archivos adjuntos y continuar el intercambio de mensajes de forma fluida.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso a la conversación desde HU-MSG-00:
    - Click en cualquier tarjeta de conversación en la bandeja
    - Redirige a `/dashboard/mensajeria/conversacion/:id`
    - Transición suave con animación de slide
- **CA-02:** Layout de la página tipo WhatsApp/Telegram:
    
    **HEADER FIJO DE CONVERSACIÓN**
    
    - **Botón "← Atrás":** Vuelve a la bandeja (HU-MSG-00)
    - **Avatar circular** del otro usuario (inicial del nombre si no hay foto)
    - **Información del contexto:**
        - Nombre completo del otro usuario (docente o padre)
        - Línea secundaria: "[Curso] - Sobre: [Estudiante]"
        - Ejemplo: "Prof. María González"
        "Matemáticas - Sobre: Juan Pérez"
    - **Menú de opciones (⋮)** con dropdown:
        - "Ver información del contacto"
        - "Cerrar conversación"
        - "Reportar problema" (futuro)
    - **Altura fija:** 80px
    - **Sticky:** Permanece visible al hacer scroll
    
    **ÁREA DE MENSAJES (Scrollable)**
    
    - **Vista de chat vertical** con scroll automático al último mensaje
    - **Mensajes agrupados por fecha:**
        - Separador visual por día: "Hoy", "Ayer", "DD/MM/YYYY"
        - Badge centrado con fondo gris claro
    - **Burbujas de mensaje diferenciadas:**
        
        **Mensajes enviados por el usuario actual (derecha):**
        
        - Alineación: derecha
        - Color de fondo: Púrpura (color institucional)
        - Color de texto: Blanco
        - Border-radius: 18px (esquinas redondeadas, excepto esquina inferior derecha)
        - Padding: 12px 16px
        - Max-width: 70% del ancho disponible
        - Timestamp: Pequeño, gris claro, abajo a la derecha
        - Estado de lectura: Iconos tipo WhatsApp
            - ✓ Enviado (gris)
            - ✓✓ Entregado (gris)
            - ✓✓ Leído (azul)
        
        **Mensajes recibidos (izquierda):**
        
        - Alineación: izquierda
        - Color de fondo: Gris claro (#F1F3F4)
        - Color de texto: Negro
        - Border-radius: 18px (esquinas redondeadas, excepto esquina inferior izquierda)
        - Padding: 12px 16px
        - Max-width: 70% del ancho disponible
        - Timestamp: Pequeño, gris oscuro, abajo a la izquierda
        - Nombre del emisor (solo visible para docentes con múltiples conversaciones)
    - **Contenido de cada mensaje:**
        - Texto del mensaje con line-breaks respetados
        - Timestamp en formato:
            - Si es hoy: "HH:MM" (Ej: "14:30")
            - Si es ayer: "Ayer HH:MM"
            - Otros días: "DD/MM HH:MM"
        - Archivos adjuntos (si existen)
    - **Visualización de archivos adjuntos:**
        
        **Para imágenes (JPG, PNG):**
        
        - Preview thumbnail (200x200px) dentro de la burbuja
        - Click abre modal de imagen completa con opciones:
            - Botón "Descargar"
            - Botón "Cerrar" (X)
            - Zoom in/out con scroll
        - Nombre del archivo debajo del thumbnail (truncado)
        - Tamaño del archivo: "1.2 MB"
        
        **Para PDFs:**
        
        - Ícono 📄 con fondo blanco
        - Nombre del archivo (max 30 caracteres, truncado con "...")
        - Tamaño del archivo: "2.5 MB"
        - Botón "📥 Descargar" al hacer hover
        - Click descarga el archivo directamente (no abre en navegador)
        
        **Múltiples archivos en un mensaje:**
        
        - Se muestran apilados verticalmente dentro de la burbuja
        - Separación de 8px entre cada archivo
        - Máximo 3 archivos (validación desde HU-MSG-01)
    - **Scroll automático:**
        - Al cargar la conversación: Scroll hasta el último mensaje
        - Al enviar nuevo mensaje: Scroll suave hasta el fondo
        - Botón flotante "↓ Ir al final" aparece si el usuario sube más de 200px
    - **Lazy loading:**
        - Carga inicial: Últimos 50 mensajes
        - Al hacer scroll hacia arriba (detectar tope): Cargar 50 mensajes anteriores
        - Indicador de carga (spinner) en la parte superior durante carga
        - Si no hay más mensajes: Mostrar "Inicio de la conversación"
    
    **FOOTER FIJO (Área de redacción)**
    
    - **Posición:** Fixed en la parte inferior
    - **Altura dinámica:** Min 60px, max 200px (crece con el contenido)
    - **Componentes:**
        
        **Textarea de mensaje:**
        
        - Placeholder diferenciado por rol:
            - **Padre:** "Escribe un mensaje..."
            - **Docente:** "Escribe tu respuesta..."
        - Auto-resize al escribir (max 5 líneas)
        - Mínimo: 10 caracteres
        - Máximo: 1000 caracteres
        - Contador de caracteres visible: "XX/1000"
        - Shortcut: Enter para salto de línea, Ctrl+Enter para enviar
        
        **Botón de adjuntar archivos (📎):**
        
        - Botón circular a la izquierda del textarea
        - Click abre selector de archivos del sistema
        - Mismas validaciones que HU-MSG-01:
            - Tipos: PDF, JPG, PNG
            - Tamaño: Max 5MB por archivo
            - Cantidad: Max 3 archivos
        - Vista previa de archivos seleccionados:
            - Aparece encima del textarea
            - Thumbnails pequeños (60x60px) con nombre truncado
            - Botón "❌" para eliminar cada archivo antes de enviar
        
        **Botón "Enviar" (✉️):**
        
        - Botón circular a la derecha del textarea
        - Color primario (púrpura)
        - Habilitado solo si:
            - Hay texto (min 10 caracteres) O hay archivos adjuntos
        - Estados visuales:
            - **Normal:** Color primario, cursor pointer
            - **Hover:** Color más oscuro
            - **Deshabilitado:** Gris claro, cursor not-allowed
            - **Enviando:** Spinner animado
        - Al hacer clic:
            - Deshabilitar textarea y botones
            - Mostrar spinner en botón
            - Subir archivos a Cloudinary (si existen)
            - Enviar mensaje al backend
            - Insertar mensaje en el chat inmediatamente (optimistic update)
            - Scroll automático al nuevo mensaje
            - Limpiar textarea y archivos adjuntos
            - Re-habilitar controles
- **CA-03:** Comportamiento diferenciado por rol:
    
    **Para Padre:**
    
    - Puede enviar mensajes libremente en el hilo
    - Footer de redacción siempre habilitado
    - Sin restricciones de respuesta
    
    **Para Docente:**
    
    - Solo puede responder mensajes iniciados por padres (MVP)
    - Footer de redacción habilitado solo si la conversación fue iniciada por un padre
    - No puede iniciar nuevas conversaciones desde esta vista
    - Tooltip visible si intenta escribir en conversación no válida (futuro)
- **CA-04:** Proceso de envío de mensaje:
    
    **Validación frontend:**
    
    - Verificar mínimo 10 caracteres si hay texto
    - Validar archivos adjuntos (tipo, tamaño, cantidad)
    - Mostrar errores específicos si fallan validaciones
    
    **Subida de archivos (si existen):**
    
    - Subir archivos a Cloudinary con progress bar
    - Mostrar progreso: "Subiendo archivo 1 de 2... 45%"
    - Si falla subida: Mostrar error y permitir reintentar
    
    **Inserción en base de datos:**
    
    - Crear registro en tabla `mensajes`:
        
        ```sql
        INSERT INTO mensajes (
          conversacion_id, emisor_id, contenido,
          fecha_envio, estado_lectura, tiene_adjuntos
        ) VALUES (
          ?, ?, ?,
          NOW(), 'enviado', ?
        );
        
        ```
        
    - Si hay archivos, insertar en tabla `archivos_adjuntos`:
        
        ```sql
        INSERT INTO archivos_adjuntos (
          mensaje_id, nombre_original, nombre_archivo,
          url_cloudinary, tipo_mime, tamaño_bytes,
          fecha_subida, subido_por
        ) VALUES (
          ?, ?, ?,
          ?, ?, ?,
          NOW(), ?
        );
        
        ```
        
    - Actualizar `fecha_ultimo_mensaje` en tabla `conversaciones`:
        
        ```sql
        UPDATE conversaciones
        SET fecha_ultimo_mensaje = NOW()
        WHERE id = ?;
        
        ```
        
    
    **Generación de notificación:**
    
    - Crear registro en tabla `notificaciones` para el destinatario
    - Enviar WhatsApp con formato:
        
        ```
        💬 Nueva respuesta de [Nombre]
        Sobre: [Estudiante]
        
        Mensaje: [Primeros 100 caracteres...]
        
        📱 Ver respuesta: [URL]
        
        ```
        
    - Actualizar badge de mensajería del destinatario
- **CA-05:** Marcado de mensajes como leídos:
    - Al abrir la conversación: Marcar todos los mensajes del otro usuario como "leído"
    - Update masivo en tabla `mensajes`:
        
        ```sql
        UPDATE mensajes
        SET estado_lectura = 'leido', fecha_lectura = NOW()
        WHERE conversacion_id = ?
          AND emisor_id != ?
          AND estado_lectura != 'leido';
        
        ```
        
    - Actualizar estado en tiempo real (optimistic update en frontend)
    - Actualizar contador de no leídos en HU-MSG-00
- **CA-06:** Actualización en tiempo real:
    - **Polling cada 10 segundos** para verificar nuevos mensajes
    - Si hay mensajes nuevos:
        - Agregar mensajes al final del chat
        - Scroll automático si el usuario está cerca del final (últimos 100px)
        - Si el usuario está leyendo mensajes anteriores: No hacer scroll, mostrar badge "Nuevos mensajes ↓"
    - Actualizar estados de lectura de mensajes enviados (✓ → ✓✓)
- **CA-07:** Estado vacío (conversación sin mensajes):
    - Ilustración SVG centrada
    - Mensaje: "Esta conversación acaba de comenzar. Envía el primer mensaje."
    - Footer de redacción visible y habilitado

- **Endpoints API:**
    - `GET /conversaciones/:id` - Obtener conversación específica
    - `GET /mensajes?conversacion_id={id}&limit={limit}&offset={offset}` - Mensajes paginados
    - `POST /mensajes` - Enviar nuevo mensaje
    - `PATCH /mensajes/marcar-leidos` - Marcar mensajes como leídos
    - `GET /mensajes/nuevos?conversacion_id={id}&ultimo_mensaje_id={id}` - Polling de nuevos mensajes
    - `POST /archivos/upload` - Subir archivo a Cloudinary
    - `POST /archivos-adjuntos` - Registrar archivo en BD
    - `GET /archivos/:id/download` - Descargar archivo
    - `PATCH /conversaciones/:id/cerrar` - Cerrar conversación
    - `POST /notificaciones` - Crear notificación para destinatario
    - `POST /notificaciones/whatsapp` - Enviar WhatsApp

---
## AUTENTICACIÓN
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| POST | /auth/login | Autenticar usuario y emitir token JWT | Padre, Docente, Director, Administrador |
| GET | /auth/validate-token | Validar token activo y vigencia | Padre, Docente, Director, Administrador |
| POST | /auth/forgot-password | Solicitar enlace de restablecimiento por WhatsApp | Padre, Docente, Director, Administrador |
| POST | /auth/logout | Cerrar sesión e invalidar token actual | Padre, Docente, Director, Administrador |

## USUARIOS
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| GET | /usuarios/hijos | Listar hijos del padre autenticado | Padre |
| GET | /teachers/permissions | Listar docentes activos con estado de permisos | Director |
| PATCH | /teachers/:id/permissions | Actualizar permisos de docente | Director |
| GET | /teachers/:id/permissions/history | Ver historial de cambios de permisos | Director |
| GET | /admin/templates/padres | Obtener headers y sample para padres | Administrador |
| POST | /admin/import/validate | Validar registros de importación | Administrador |
| POST | /admin/import/execute | Ejecutar importación de registros | Administrador |
| POST | /admin/import/validate-relationships | Validar relaciones padre-hijo | Administrador |
| POST | /admin/import/create-relationships | Crear relaciones padre-hijo | Administrador |
| GET | /admin/verify/relationships | Verificar integridad de relaciones | Administrador |
| POST | /admin/import/credentials/generate | Generar credenciales preview | Administrador |
| POST | /admin/import/credentials/send-whatsapp | Simular envío masivo de credenciales | Administrador |

## ACADÉMICO
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| GET | /calificaciones/estudiante/:id | Listar calificaciones por componente | Padre |
| GET | /calificaciones/estudiante/:id/promedio | Obtener promedio y estado | Padre |
| GET | /resumen-academico/estudiante/:id | Resumen trimestral o anual consolidado | Padre |
| GET | /resumen-academico/estudiante/:id/export | Exportar resumen anual en PDF | Padre |
| GET | /asistencias/estudiante/:id | Consultar asistencia por mes o trimestre | Padre |
| GET | /asistencias/estudiante/:id/estadisticas | Obtener estadísticas de asistencia | Padre |
| GET | /asistencias/estudiante/:id/export | Exportar asistencia en PDF | Padre |
| GET | /cursos/estudiante/:estudiante_id | Listar cursos del estudiante | Padre |
| GET | /docentes/curso/:curso_id | Listar docentes asignados del curso | Padre |

## MENSAJERÍA
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| GET | /conversaciones | Listar conversaciones del usuario | Padre, Docente |
| GET | /conversaciones/no-leidas/count | Contador de mensajes no leídos | Padre, Docente |
| GET | /conversaciones/actualizaciones | Polling de actualizaciones de conversaciones | Padre, Docente |
| PATCH | /conversaciones/:id/marcar-leida | Marcar conversación como leída | Padre, Docente |
| PATCH | /conversaciones/:id/cerrar | Cerrar o archivar conversación | Padre, Docente |
| GET | /conversaciones/existe | Verificar existencia de conversación | Padre |
| POST | /conversaciones | Crear conversación y primer mensaje | Padre |
| GET | /conversaciones/:id | Obtener detalle de conversación | Padre, Docente |
| GET | /mensajes | Listar mensajes de conversación | Padre, Docente |
| POST | /mensajes | Enviar nuevo mensaje en conversación | Padre, Docente |
| PATCH | /mensajes/marcar-leidos | Marcar mensajes como leídos | Padre, Docente |
| GET | /mensajes/nuevos | Obtener mensajes nuevos desde último | Padre, Docente |
| GET | /archivos/:id/download | Descargar archivo adjunto | Padre, Docente |