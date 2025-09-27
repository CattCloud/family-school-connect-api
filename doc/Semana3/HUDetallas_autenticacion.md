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

**Validaciones de Negocio:**
- **VN-01:** Select tipo documento obligatorio (DNI,etc)
- **VN-02:** Campo nro documento obligatorio, formato numérico, mínimo 8 dígitos (Indicador informativo debajo del campo de ejemplo segun el tipo de tipo de documento)
- **VN-03:** Campo contraseña obligatorio, mínimo 8 caracteres
- **VN-04:** Usuario debe estar en estado `activo = true`
- **VN-05:** Máximo 5 intentos fallidos por usuario en 15 minutos (lockout temporal)
- **VN-06:** Verificar que el rol del usuario existe y está habilitado

**UI/UX:**
- **UX-01:** Pantalla de login limpia con campos: 
    -   Tipo de Documento
    -   Documento
    -   Contraseña
    -   botón "Ingresar"
- **UX-02:** Mensajes de error específicos:
  - "Documento o contraseña incorrectos" (sin especificar cuál falla)
  - "Usuario bloqueado temporalmente. Intente en 15 minutos"
  - "Usuario desactivado. Contacte al administrador"
- **UX-03:** Splash Screen con spinner durante validación con bloqueo de múltiples envíos
- **UX-04:** Link visible a "¿Olvidaste tu contraseña?" (HU-AUTH-02)
- **UX-05:** Recordar último documento ingresado (localStorage)

**Estados y Flujo:**
- **EF-01:** Estado inicial: Usuario no autenticado, en página de login
- **EF-02:** Estado de validación: Verificando credenciales en backend
- **EF-03:** Estado final exitoso: Usuario autenticado, redirigido a dashboard correspondiente
- **EF-04:** Estado final fallido: Permanecer en login con mensaje de error

**HU Relacionadas:**
- **HU Siguientes:** HU-AUTH-02 (Recuperar contraseña), HU-AUTH-04 (Cambio obligatorio - docentes)

**Componentes y Estructura:**
- **Tipo:** Página completa independiente (`/login`)
- **Componentes principales:**
  - `LoginForm`: Formulario con validación en tiempo real
  - `ErrorMessage`: Componente de alertas y mensajes
  - `LoadingSpinner`: Indicador de carga durante autenticación (introduccido en SplashScreen)
  - `SplashScreen` 
- **Responsive:** Mobile-first, optimizado para dispositivos móviles

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

**Validaciones de Negocio:**
- **VN-01:** Tipo y Nro de documento debe existir en base de datos y estar activo
- **VN-02:** Un usuario solo puede tener 1 token activo (invalidar anteriores)
- **VN-03:** Token válido por 60 minutos exactos desde creación
- **VN-04:** Nueva contraseña mínimo 8 caracteres, reglas de las contraseñas seguras (Texto informativo debajo del campo)
- **VN-05:** No permitir la misma contraseña actual (comparar con hash existente)
- **VN-06:** Máximo 3 solicitudes de reset por usuario por día

**UI/UX:**
- **UX-01:** Pantalla de solicitud con campos: 
 - Select "Tipo de Documento"
 - Campo numerico "Número de documento"
 - Boton "Continuar" 
 - Boton Regresar a Login
- **UX-02:** Mensaje de éxito genérico: "Si el nro de documento existe,revisa tu WhatsApp recibirás un mensaje con instrucciones"
- **UX-03:** Pantalla de reset con campos: 
  - Campo "Nueva contraseña"
  - Campo "Confirmar contraseña"
  - Texto informativo de que debe tener la contraseña
  - Boton "Cambiar Contraseña"
- **UX-04:** Validación en tiempo real:
  - Fortaleza de contraseña con indicador visual
  - Confirmación de coincidencia de contraseñas
- **UX-05:** Mensajes de error específicos:
  - "El enlace ha expirado. Solicita uno nuevo"
  - "Las contraseñas no coinciden"
  - "La contraseña no cumple los requisitos mínimos"
- **UX-06:** Confirmación exitosa y redireccion automatica al login

**Estados y Flujo:**
- **EF-01:** Estado inicial: Usuario en pantalla de recuperación
- **EF-02:** Estado de solicitud: Enviando WhatsApp con token
- **EF-03:** Estado de reset: Usuario accede via enlace temporal
- **EF-04:** Estado final: Contraseña actualizada, redirigir a login

**HU Relacionadas:**
- **HU Previas:** HU-AUTH-01 (Iniciar sesión - link de recuperación)
- **HU Siguientes:** HU-AUTH-01 (Vuelta al login con nueva contraseña)

**Componentes y Estructura:**
- **Tipo:** Dos páginas separadas
  - `/forgot-password`: Solicitud de recuperación
  - `/reset-password?token=xxx`: Formulario de nueva contraseña
- **Componentes principales:**
  - `ForgotPasswordForm`: Formulario de solicitud
  - `ResetPasswordForm`: Formulario de nueva contraseña
  - `PasswordStrengthIndicator`: Medidor de fortaleza
  - `TokenValidator`: Validador de enlaces temporales
- **Integración externa:** WhatsApp API para envío de mensajes

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

**Validaciones de Negocio:**
- **VN-01:** Logout disponible desde cualquier pantalla autenticada
- **VN-02:** Proceso debe ser instantáneo (< 1 segundo)
- **VN-03:** Limpiar completamente datos sensibles del navegador
- **VN-04:** Invalidación del token debe ser inmediata en backend

**UI/UX:**
- **UX-01:** Botón "Cerrar sesión" visible en dropdown del icono del usuario en el header del dashboard principal
- **UX-02:** Confirmación opcional via modal: "¿Está seguro de que desea cerrar sesión?"
- **UX-03:** Loading breve durante proceso de logout
- **UX-04:** Mensaje de confirmación en login: "Sesión cerrada correctamente"
- **UX-05:** Íconos claros (puerta de salida, logout symbol)

**Estados y Flujo:**
- **EF-01:** Estado inicial: Usuario autenticado en cualquier módulo
- **EF-02:** Estado de logout: Invalidando sesión y limpiando datos
- **EF-03:** Estado final: Usuario no autenticado, en pantalla de login

**HU Relacionadas:**
- **HU Previas:** HU-AUTH-01 (Usuario debe estar autenticado)
- **HU Siguientes:** HU-AUTH-01 (Puede volver a iniciar sesión)

**Componentes y Estructura:**
- **Tipo:** Funcionalidad transversal (no es página independiente)
- **Componentes principales:**
  - `LogoutButton`: Botón con confirmación opcional
  - `SessionManager`: Gestor de invalidación de tokens
  - `RouteGuard`: Protección de rutas después del logout
- **Ubicación:** Header principal, menú de usuario, sidebar de navegación

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

**Validaciones de Negocio:**
- **VN-01:** Solo aplicar a usuarios con rol "docente"
- **VN-02:** Contraseña actual debe coincidir con hash almacenado
- **VN-03:** Nueva contraseña mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
- **VN-04:** Nueva contraseña debe ser diferente a la actual
- **VN-05:** Confirmación debe coincidir exactamente con nueva contraseña
- **VN-06:** Process debe completarse en la misma sesión (no permitir skip)

**UI/UX:**
- **UX-01:** Modal no cerrable o pantalla completa con mensaje claro:
  "Por seguridad, debe cambiar su contraseña antes de continuar"
- **UX-02:** Indicador de fortaleza de contraseña en tiempo real
- **UX-02:** Texto informativo de lo minimo que requiere la contraseña
- **UX-03:** Validaciones visuales inmediatas:
  - ✓ Contraseña actual correcta
  - ✓ Nueva contraseña cumple requisitos
  - ✓ Confirmación coincide
- **UX-04:** Mensajes de error específicos por campo
- **UX-05:** Botón "Cambiar contraseña" habilitado solo cuando todo es válido
- **UX-06:** Confirmación exitosa: "Contraseña actualizada. Accediendo al sistema..."

**Estados y Flujo:**
- **EF-01:** Estado inicial: Docente autentica por primera vez
- **EF-02:** Estado bloqueado: No puede acceder a otros módulos
- **EF-03:** Estado de cambio: Completando formulario obligatorio
- **EF-04:** Estado final: Contraseña cambiada, acceso completo al sistema

**HU Relacionadas:**
- **HU Previas:** HU-AUTH-01 (Autenticación exitosa con flag activo)
- **HU Siguientes:** Dashboard Docente (acceso normal después del cambio)

**Componentes y Estructura:**
- **Tipo:** Modal bloqueante o página completa (`/change-password-required`)
- **Componentes principales:**
  - `ChangePasswordModal`: Modal no cerrable con formulario
  - `PasswordValidator`: Validador de requisitos en tiempo real
  - `StrengthMeter`: Medidor visual de fortaleza
  - `RouteGuard`: Interceptor que fuerza el cambio
- **Comportamiento:** Bloquea navegación hasta completar el proceso

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

**Validaciones de Negocio:**
- **VN-01:** Solo mostrar hijos activos (`estado_matricula = 'activo'`)
- **VN-02:** Filtrar por año académico actual por defecto
- **VN-03:** Padre solo puede ver hijos donde `relaciones_familiares.estado_activo = true`
- **VN-04:** Mantener selección en sessionStorage para recuperar después de refresh

**UI/UX:**
- **UX-01:** Dropdown elegante en header con:
  - Nombre completo del hijo
  - Grado y nivel (ej. "3° Primaria")
  - Avatar o ícono estudiantil
- **UX-02:** Indicador visual claro del hijo actualmente seleccionado
- **UX-03:** Transición suave al cambiar (loading breve en dashboard)
- **UX-04:** Responsive: En móvil puede ser un selector más compacto
- **UX-05:** Texto contextual en módulos: "Información de [Nombre del hijo]"

**Estados y Flujo:**
- **EF-01:** Estado inicial: Padre autentica, sistema detecta múltiples hijos
- **EF-02:** Estado de selección: Dropdown visible con primer hijo seleccionado
- **EF-03:** Estado de cambio: Usuario selecciona otro hijo, contexto actualiza
- **EF-04:** Estado persistente: Selección mantenida durante toda la sesión

**HU Relacionadas:**
- **HU Previas:** HU-AUTH-01 (Autenticación como padre)
- **HU Siguientes:** Todos los módulos de consulta (Calificaciones, Asistencia, etc.)

**Componentes y Estructura:**
- **Tipo:** Componente del header (no página independiente)
- **Componentes principales:**
  - `StudentSelector`: Dropdown con lista de hijos
  - `ContextProvider`: Proveedor global del estudiante seleccionado
  - `StudentContext`: Hook para acceder al contexto en cualquier componente
- **Integración:** Afecta a todos los módulos de consulta académica
- **Estado global:** Context API o store para mantener selección activa

---
