
## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** ``

### **Autenticación JWT**
- La API usa tokens JWT de corta duración (24 horas)
- Incluir en cada request protegido: `Authorization: Bearer <token>`
- Renovación: El cliente debe solicitar nuevo token antes del vencimiento

### **Formato de Errores Estandarizado**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción técnica legible"
  }
}
```

---

## **Endpoints del Módulo de Autenticación**

### **1. Iniciar Sesión (Login)**

**Endpoint:** `POST /auth/login`  
**Descripción:** Autenticación de usuarios con redirección automática por rol  
**Autenticación:** No requerida  

#### **Request Body:**
```json
{
  "tipo_documento": "DNI",
  "nro_documento": "12345678",
  "password": "miPassword123"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "24h",
    "user": {
      "id": "usr_001",
      "tipo_documento": "DNI",
      "nro_documento": "12345678",
      "nombre": "Juan Carlos",
      "apellido": "Pérez López",
      "rol": "apoderado",
      "telefono": "+51987654321",
      "fecha_ultimo_login": "2025-01-15T10:30:00Z",
      "debe_cambiar_password": false
    },
    "redirect_to": "/dashboard/padre",
    "context": {
      "hijos": [
        {
          "id": "est_001",
          "nombre": "María Elena",
          "apellido": "Pérez García",
          "codigo_estudiante": "PRI3001",
          "nivel_grado": {
            "nivel": "Primaria",
            "grado": "3",
            "descripcion": "3ro de Primaria"
          },
          "año_academico": 2025
        }
      ],
      "hijo_seleccionado_default": "est_001"
    }
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Datos inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Tipo de documento y número son requeridos"
  }
}
```

- **401 Unauthorized - Credenciales incorrectas:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Documento o contraseña incorrectos"
  }
}
```

- **423 Locked - Usuario bloqueado:**
```json
{
  "success": false,
  "error": {
    "code": "USER_LOCKED",
    "message": "Usuario bloqueado temporalmente. Intente en 15 minutos"
  }
}
```

- **403 Forbidden - Usuario inactivo:**
```json
{
  "success": false,
  "error": {
    "code": "USER_INACTIVE",
    "message": "Usuario desactivado. Contacte al administrador"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Validar que `tipo_documento` sea válido (DNI, CARNET_EXTRANJERIA)
- **RN-02:** `nro_documento` debe ser numérico y mínimo 8 dígitos
- **RN-03:** Máximo 5 intentos fallidos por usuario en 15 minutos
- **RN-04:** Actualizar `fecha_ultimo_login` en base de datos
- **RN-05:** Token JWT incluye: `user_id`, `rol`, `permisos`, `exp`
- **RN-06:** Si `debe_cambiar_password = true`, incluir flag en respuesta

---

### **2. Solicitar Recuperación de Contraseña**

**Endpoint:** `POST /auth/forgot-password`  
**Descripción:** Genera token temporal y envía enlace por WhatsApp  
**Autenticación:** No requerida  

#### **Request Body:**
```json
{
  "tipo_documento": "DNI",
  "nro_documento": "12345678"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Si el número de documento existe, recibirás un WhatsApp con instrucciones",
    "estimated_delivery": "1-2 minutos"
  }
}
```

#### **Response Errors:**
- **400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DOCUMENT",
    "message": "Tipo y número de documento son requeridos"
  }
}
```

- **429 Too Many Requests:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Máximo 3 solicitudes por día. Intente mañana"
  }
}
```

### **Reglas de Negocio:**
- **RN-07:** Generar token UUID único válido por 60 minutos
- **RN-08:** Invalidar tokens anteriores del mismo usuario
- **RN-09:** Envío WhatsApp con enlace: `{BASE_URL}/reset-password?token={TOKEN}`
- **RN-10:** Máximo 3 solicitudes por usuario por día
- **RN-11:** Respuesta genérica (no revelar si usuario existe)

---

### **3. Restablecer Contraseña**

**Endpoint:** `POST /auth/reset-password`  
**Descripción:** Actualiza contraseña usando token temporal  
**Autenticación:** Token temporal requerido  

#### **Request Body:**
```json
{
  "token": "uuid-token-temporal",
  "nueva_password": "nuevaPassword123",
  "confirmar_password": "nuevaPassword123"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada correctamente",
    "redirect_to": "/login"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Token inválido:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "El enlace ha expirado. Solicita uno nuevo"
  }
}
```

- **400 Bad Request - Contraseñas no coinciden:**
```json
{
  "success": false,
  "error": {
    "code": "PASSWORD_MISMATCH",
    "message": "Las contraseñas no coinciden"
  }
}
```

- **400 Bad Request - Contraseña débil:**
```json
{
  "success": false,
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número"
  }
}
```

### **Reglas de Negocio:**
- **RN-12:** Validar que token existe, no está usado y no ha expirado
- **RN-13:** Nueva contraseña mínimo 8 caracteres con complejidad
- **RN-14:** No permitir contraseña igual a la actual
- **RN-15:** Marcar token como `usado = true` después del cambio
- **RN-16:** Encriptar nueva contraseña con bcrypt

---

### **4. Cerrar Sesión (Logout)**

**Endpoint:** `POST /auth/logout`  
**Descripción:** Invalida token JWT actual  
**Autenticación:** Bearer token requerido  

#### **Request Body:**
```json
{}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

#### **Response Errors:**
- **401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token no válido o expirado"
  }
}
```

### **Reglas de Negocio:**
- **RN-17:** Agregar token a blacklist (tabla tokens_blacklist)
- **RN-18:** Registrar timestamp de logout
- **RN-19:** Token invalidado permanece inválido hasta expiración natural

---

### **5. Cambio Obligatorio de Contraseña (Docentes)**

**Endpoint:** `POST /auth/change-required-password`  
**Descripción:** Cambio forzado para docentes en primer login  
**Autenticación:** Bearer token requerido  

#### **Request Body:**
```json
{
  "password_actual": "passwordTemporal123",
  "nueva_password": "miNuevaPassword123",
  "confirmar_password": "miNuevaPassword123"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada correctamente",
    "redirect_to": "/dashboard/docente"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Contraseña actual incorrecta:**
```json
{
  "success": false,
  "error": {
    "code": "CURRENT_PASSWORD_INCORRECT",
    "message": "La contraseña actual es incorrecta"
  }
}
```

- **403 Forbidden - No requiere cambio:**
```json
{
  "success": false,
  "error": {
    "code": "CHANGE_NOT_REQUIRED",
    "message": "No es necesario cambiar la contraseña"
  }
}
```

### **Reglas de Negocio:**
- **RN-20:** Solo usuarios con `debe_cambiar_password = true`
- **RN-21:** Validar contraseña actual contra hash almacenado
- **RN-22:** Nueva contraseña debe ser diferente a la actual
- **RN-23:** Actualizar `debe_cambiar_password = false` tras cambio exitoso

---

### **6. Validar Token JWT**

**Endpoint:** `GET /auth/validate-token`  
**Descripción:** Verifica validez del token actual  
**Autenticación:** Bearer token requerido  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expires_in": "18h 45m",
    "user": {
      "id": "usr_001",
      "rol": "apoderado",
      "nombre": "Juan Carlos",
      "apellido": "Pérez López"
    }
  }
}
```

#### **Response Errors:**
- **401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token expirado. Inicie sesión nuevamente"
  }
}
```

### **Reglas de Negocio:**
- **RN-24:** Verificar token en blacklist
- **RN-25:** Validar firma y expiración
- **RN-26:** Retornar información básica del usuario

---

### **7. Obtener Contexto de Usuario Padre**

**Endpoint:** `GET /auth/parent-context/:user_id`  
**Descripción:** Obtiene hijos matriculados para selector  
**Autenticación:** Bearer token requerido  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "hijos": [
      {
        "id": "est_001",
        "nombre": "María Elena",
        "apellido": "Pérez García",
        "codigo_estudiante": "PRI3001",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3",
          "descripcion": "3ro de Primaria"
        },
        "año_academico": 2025,
        "estado_matricula": "activo"
      },
      {
        "id": "est_002",
        "nombre": "Carlos Alberto",
        "apellido": "Pérez García",
        "codigo_estudiante": "SEC1002",
        "nivel_grado": {
          "nivel": "Secundaria",
          "grado": "1",
          "descripcion": "1ro de Secundaria"
        },
        "año_academico": 2025,
        "estado_matricula": "activo"
      }
    ],
    "total_hijos": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-27:** Solo hijos con `estado_matricula = 'activo'`
- **RN-28:** Filtrar por `relaciones_familiares.estado_activo = true`
- **RN-29:** Ordenar por grado ascendente
- **RN-30:** Solo accesible por rol 'apoderado'

---

## **Códigos de Estado HTTP Utilizados**

| Código | Descripción | Uso |
|--------|-------------|-----|
| `200 OK` | Operación exitosa | Login, logout, validaciones exitosas |
| `201 Created` | Recurso creado | Token de recuperación generado |
| `400 Bad Request` | Datos inválidos | Validaciones de entrada fallidas |
| `401 Unauthorized` | No autenticado | Token inválido/expirado |
| `403 Forbidden` | Sin permisos | Usuario inactivo, cambio no requerido |
| `404 Not Found` | Recurso no existe | Usuario no encontrado |
| `423 Locked` | Usuario bloqueado | Máximo de intentos excedido |
| `429 Too Many Requests` | Límite de rate exceeded | Demasiadas solicitudes de reset |
| `500 Internal Server Error` | Error del servidor | Errores no controlados |

---

## **Middleware y Validaciones**

### **Middleware de Autenticación (`auth.js`):**
```javascript
// Validar Bearer token en headers
// Verificar token no esté en blacklist  
// Decodificar y validar payload JWT
// Inyectar user info en req.user
```

### **Middleware de Rate Limiting (`rateLimiter.js`):**
```javascript
// Login: 5 intentos por IP en 15 minutos
// Forgot Password: 3 intentos por usuario por día
// Reset Password: 5 intentos por token
```

### **Validaciones de Entrada:**
- **Tipo documento:** Enum válido (DNI, CARNET_EXTRANJERIA)
- **Número documento:** Numérico, 8-12 dígitos según tipo
- **Contraseña:** Mínimo 8 caracteres, complejidad requerida
- **Token:** Formato UUID válido

---

## **Integraciones Externas**

### **WhatsApp Cloud API:**
- **Endpoint:** `https://graph.facebook.com/v18.0/{phone_id}/messages`
- **Mensaje de recuperación:**
```json
{
  "messaging_product": "whatsapp",
  "to": "+51987654321",
  "type": "text",
  "text": {
    "body": "I.E.P. Las Orquídeas\n\nSolicitud de cambio de contraseña.\n\nHaz clic aquí: https://app-orquideas.com/reset-password?token=uuid-token\n\n⏰ Válido por 1 hora únicamente."
  }
}
```

---

## **Estructura de Base de Datos Relacionada**

### **Tablas Principales:**
- `usuarios`: Información de autenticación y perfil
- `password_reset_tokens`: Tokens temporales de recuperación
- `relaciones_familiares`: Vinculación padre-hijo para contexto
- `estudiantes`: Información para selector de hijos
- `nivel_grado`: Información de grado para contexto

### **Índices Recomendados:**
```sql
CREATE INDEX idx_usuarios_nro_documento ON usuarios(tipo_documento, nro_documento);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_usuario_fecha ON password_reset_tokens(id_usuario, fecha_creacion);
CREATE INDEX idx_relaciones_padre ON relaciones_familiares(padre_id, estado_activo);
```

---

## **SECCIÓN 1: GESTIÓN DE PERMISOS (DIRECTOR)**

### **1. Obtener Lista de Docentes con Permisos**

**Endpoint:** `GET /teachers/permissions`  
**Descripción:** Obtiene todos los docentes activos con estado actual de permisos  
**Autenticación:** Bearer token (Rol: Director)  
**Paginación:** Soportada  

#### **Query Parameters:**
```
?page=1              # Número de página (default: 1)
&limit=20            # Registros por página (default: 20)
&search=nombre       # Búsqueda por nombre de docente
&filter=con_permisos # Filtros: todos | con_permisos | sin_permisos
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "docentes": [
      {
        "id": "doc_001",
        "nombre": "Ana María",
        "apellido": "Rodríguez Vega",
        "telefono": "+51923456789",
        "permisos": {
          "comunicados": {
            "estado_activo": true,
            "fecha_otorgamiento": "2025-02-01T10:00:00Z",
            "otorgado_por": {
              "id": "usr_dir_001",
              "nombre": "Carlos Méndez"
            }
          },
          "encuestas": {
            "estado_activo": false,
            "fecha_otorgamiento": null,
            "otorgado_por": null
          }
        },
        "cursos_asignados": [
          {
            "curso_id": "cur_001",
            "nombre": "Matemáticas",
            "nivel": "Primaria",
            "grado": "3"
          }
        ],
        "estado_activo": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_records": 45,
      "per_page": 20
    }
  }
}
```

#### **Response Errors:**
- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Solo directores pueden acceder a este recurso"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Solo mostrar docentes con `rol = 'docente'` y `estado_activo = true`
- **RN-02:** Incluir permisos de ambos tipos (comunicados y encuestas)
- **RN-03:** Mostrar cursos asignados del año académico actual
- **RN-04:** Ordenar alfabéticamente por apellido

---

### **2. Actualizar Permisos de Docente**

**Endpoint:** `PATCH /teachers/{docente_id}/permissions`  
**Descripción:** Activa o desactiva permisos de comunicados/encuestas  
**Autenticación:** Bearer token (Rol: Director)  

#### **Request Body:**
```json
{
  "tipo_permiso": "comunicados",  // "comunicados" | "encuestas"
  "estado_activo": true           // true = activar | false = desactivar
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Permiso actualizado correctamente",
    "permiso": {
      "docente_id": "doc_001",
      "tipo_permiso": "comunicados",
      "estado_activo": true,
      "fecha_otorgamiento": "2025-02-10T14:30:00Z",
      "otorgado_por": "usr_dir_001",
      "año_academico": 2025
    }
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Datos inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PERMISSION_TYPE",
    "message": "Tipo de permiso debe ser 'comunicados' o 'encuestas'"
  }
}
```

- **404 Not Found - Docente no existe:**
```json
{
  "success": false,
  "error": {
    "code": "TEACHER_NOT_FOUND",
    "message": "Docente con ID doc_999 no existe"
  }
}
```

- **409 Conflict - Sin asignaciones:**
```json
{
  "success": false,
  "error": {
    "code": "NO_COURSE_ASSIGNMENTS",
    "message": "Este docente no tiene cursos asignados activos"
  }
}
```

### **Reglas de Negocio:**
- **RN-05:** Validar que docente tenga al menos una asignación activa
- **RN-06:** Si activa: crear o actualizar `estado_activo = true` en `permisos_docentes`
- **RN-07:** Si desactiva: actualizar `estado_activo = false` (no eliminar registro)
- **RN-08:** Registrar `otorgado_por = director_id` y `fecha_otorgamiento = now()`
- **RN-09:** Enviar notificación en plataforma al docente afectado

---

### **3. Obtener Historial de Permisos de Docente**

**Endpoint:** `GET /teachers/{docente_id}/permissions/history`  
**Descripción:** Historial completo de cambios en permisos  
**Autenticación:** Bearer token (Rol: Director)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": "doc_001",
      "nombre": "Ana María Rodríguez Vega"
    },
    "historial": [
      {
        "id": "perm_log_001",
        "tipo_permiso": "comunicados",
        "accion": "activado",
        "fecha": "2025-02-10T14:30:00Z",
        "otorgado_por": {
          "id": "usr_dir_001",
          "nombre": "Carlos Méndez"
        },
        "año_academico": 2025
      },
      {
        "id": "perm_log_002",
        "tipo_permiso": "encuestas",
        "accion": "desactivado",
        "fecha": "2025-01-15T09:00:00Z",
        "otorgado_por": {
          "id": "usr_dir_001",
          "nombre": "Carlos Méndez"
        },
        "año_academico": 2025
      }
    ],
    "total_cambios": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-10:** Mostrar cambios ordenados por fecha descendente
- **RN-11:** Incluir información del director que realizó el cambio
- **RN-12:** Filtrar por año académico actual por defecto

---

## **SECCIÓN 2: ESTRUCTURA DE EVALUACIÓN (DIRECTOR)**

### **4. Obtener Estructura de Evaluación Actual**

**Endpoint:** `GET /evaluation-structure?año={año}`  
**Descripción:** Obtiene componentes de evaluación configurados  
**Autenticación:** Bearer token (Rol: Director)  

#### **Query Parameters:**
```
?año=2025  # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "año_academico": 2025,
    "componentes": [
      {
        "id": "eval_001",
        "nombre_item": "Examen",
        "peso_porcentual": 40.00,
        "tipo_evaluacion": "unica",
        "orden_visualizacion": 1,
        "estado_activo": true,
        "fecha_configuracion": "2025-01-10T08:00:00Z"
      },
      {
        "id": "eval_002",
        "nombre_item": "Participación",
        "peso_porcentual": 20.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 2,
        "estado_activo": true,
        "fecha_configuracion": "2025-01-10T08:00:00Z"
      },
      {
        "id": "eval_003",
        "nombre_item": "Revisión de Cuaderno",
        "peso_porcentual": 15.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 3,
        "estado_activo": true,
        "fecha_configuracion": "2025-01-10T08:00:00Z"
      },
      {
        "id": "eval_004",
        "nombre_item": "Revisión de Libro",
        "peso_porcentual": 15.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 4,
        "estado_activo": true,
        "fecha_configuracion": "2025-01-10T08:00:00Z"
      },
      {
        "id": "eval_005",
        "nombre_item": "Comportamiento",
        "peso_porcentual": 10.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 5,
        "estado_activo": true,
        "fecha_configuracion": "2025-01-10T08:00:00Z"
      }
    ],
    "suma_pesos": 100.00,
    "total_componentes": 5,
    "configuracion_bloqueada": true,
    "fecha_bloqueo": "2025-01-10T08:00:00Z"
  }
}
```

#### **Response Errors:**
- **404 Not Found - No configurada:**
```json
{
  "success": false,
  "error": {
    "code": "STRUCTURE_NOT_CONFIGURED",
    "message": "No hay estructura de evaluación configurada para el año 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-13:** Solo componentes activos en respuesta
- **RN-14:** Ordenar por `orden_visualizacion` ascendente
- **RN-15:** Incluir flag de configuración bloqueada si ya se guardó

---

### **5. Crear/Actualizar Estructura de Evaluación**

**Endpoint:** `PUT /evaluation-structure`  
**Descripción:** Define componentes de evaluación institucional  
**Autenticación:** Bearer token (Rol: Director)  

#### **Request Body:**
```json
{
  "año_academico": 2025,
  "componentes": [
    {
      "nombre_item": "Examen",
      "peso_porcentual": 40.00,
      "tipo_evaluacion": "unica",
      "orden_visualizacion": 1
    },
    {
      "nombre_item": "Participación",
      "peso_porcentual": 20.00,
      "tipo_evaluacion": "recurrente",
      "orden_visualizacion": 2
    },
    {
      "nombre_item": "Revisión de Cuaderno",
      "peso_porcentual": 15.00,
      "tipo_evaluacion": "recurrente",
      "orden_visualizacion": 3
    },
    {
      "nombre_item": "Revisión de Libro",
      "peso_porcentual": 15.00,
      "tipo_evaluacion": "recurrente",
      "orden_visualizacion": 4
    },
    {
      "nombre_item": "Comportamiento",
      "peso_porcentual": 10.00,
      "tipo_evaluacion": "recurrente",
      "orden_visualizacion": 5
    }
  ]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Estructura de evaluación registrada correctamente",
    "año_academico": 2025,
    "total_componentes": 5,
    "suma_pesos": 100.00,
    "configuracion_bloqueada": true,
    "fecha_configuracion": "2025-02-10T10:00:00Z"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Suma incorrecta:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_WEIGHT_SUM",
    "message": "La suma de pesos debe ser exactamente 100%. Actual: 95.00%"
  }
}
```

- **400 Bad Request - Componentes duplicados:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_COMPONENT_NAME",
    "message": "Ya existe un componente con el nombre 'Examen'"
  }
}
```

- **409 Conflict - Configuración bloqueada:**
```json
{
  "success": false,
  "error": {
    "code": "STRUCTURE_LOCKED",
    "message": "La estructura ya está bloqueada para el año 2025. No se permiten modificaciones"
  }
}
```

### **Reglas de Negocio:**
- **RN-16:** Validar suma de pesos = 100% exacto
- **RN-17:** Mínimo 1 componente, máximo 5
- **RN-18:** Peso mínimo: 5%, máximo: 50% por componente
- **RN-19:** Nombres únicos (sin duplicados)
- **RN-20:** Una vez guardada, la configuración queda bloqueada para todo el año
- **RN-21:** Enviar notificación a todos los docentes activos

---

### **6. Obtener Plantillas Predefinidas**

**Endpoint:** `GET /evaluation-structure/templates`  
**Descripción:** Plantillas comunes de estructura de evaluación  
**Autenticación:** Bearer token (Rol: Director)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template_001",
        "nombre": "Estructura Estándar",
        "descripcion": "Configuración más común en instituciones educativas",
        "componentes": [
          {
            "nombre_item": "Examen",
            "peso_porcentual": 40.00,
            "tipo_evaluacion": "unica",
            "orden_visualizacion": 1
          },
          {
            "nombre_item": "Participación",
            "peso_porcentual": 20.00,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 2
          },
          {
            "nombre_item": "Revisión de Cuaderno",
            "peso_porcentual": 15.00,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 3
          },
          {
            "nombre_item": "Revisión de Libro",
            "peso_porcentual": 15.00,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 4
          },
          {
            "nombre_item": "Comportamiento",
            "peso_porcentual": 10.00,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 5
          }
        ]
      },
      {
        "id": "template_002",
        "nombre": "Evaluación Equilibrada",
        "descripcion": "Pesos distribuidos equitativamente",
        "componentes": [
          {
            "nombre_item": "Examen",
            "peso_porcentual": 25.00,
            "tipo_evaluacion": "unica",
            "orden_visualizacion": 1
          },
          {
            "nombre_item": "Trabajos Prácticos",
            "peso_porcentual": 25.00,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 2
          },
          {
            "nombre_item": "Participación",
            "peso_porcentual": 25.00,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 3
          },
          {
            "nombre_item": "Actitud",
            "peso_porcentual": 25.00,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 4
          }
        ]
      }
    ],
    "total_templates": 2
  }
}
```

---

### **7. Previsualizar Impacto de Pesos**

**Endpoint:** `GET /evaluation-structure/preview`  
**Descripción:** Simula cálculo de promedio con pesos propuestos  
**Autenticación:** Bearer token (Rol: Director)  

#### **Query Parameters:**
```
?componentes=[{"nombre":"Examen","peso":40,"nota":18}]  # JSON encoded
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "ejemplo_calculo": {
      "componentes": [
        {
          "nombre": "Examen",
          "nota": 18,
          "peso": 40.00,
          "subtotal": 7.20
        },
        {
          "nombre": "Participación",
          "nota": 16,
          "peso": 20.00,
          "subtotal": 3.20
        },
        {
          "nombre": "Revisión de Cuaderno",
          "nota": 15,
          "peso": 15.00,
          "subtotal": 2.25
        },
        {
          "nombre": "Revisión de Libro",
          "nota": 14,
          "peso": 15.00,
          "subtotal": 2.10
        },
        {
          "nombre": "Comportamiento",
          "nota": 17,
          "peso": 10.00,
          "subtotal": 1.70
        }
      ],
      "promedio_final": 16.45,
      "calificacion_letra": "A",
      "nivel_desempeño": "Logro Esperado"
    }
  }
}
```

---

### **8. Obtener Historial de Configuraciones**

**Endpoint:** `GET /evaluation-structure/history`  
**Descripción:** Historial de estructuras por año académico  
**Autenticación:** Bearer token (Rol: Director)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "configuraciones": [
      {
        "año_academico": 2025,
        "total_componentes": 5,
        "fecha_configuracion": "2025-01-10T08:00:00Z",
        "configurado_por": {
          "id": "usr_dir_001",
          "nombre": "Carlos Méndez"
        },
        "bloqueada": true
      },
      {
        "año_academico": 2024,
        "total_componentes": 5,
        "fecha_configuracion": "2024-01-15T09:00:00Z",
        "configurado_por": {
          "id": "usr_dir_001",
          "nombre": "Carlos Méndez"
        },
        "bloqueada": true
      }
    ],
    "total_configuraciones": 2
  }
}
```

---

## **SECCIÓN 3: IMPORTACIÓN MASIVA (ADMINISTRADOR)**

### **9. Descargar Plantillas de Importación**

**Endpoint:** `GET /admin/templates/{tipo}`  
**Descripción:** Descarga plantilla Excel/CSV para importación  
**Autenticación:** Bearer token (Rol: Administrador)  

#### **Path Parameters:**
```
{tipo} = padres | docentes | estudiantes | relaciones
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "headers": ["tipo_documento", "nro_documento", "nombre", "apellido", "telefono"],
    "sample": [
      { "tipo_documento": "DNI", "nro_documento": "45678912", "nombre": "Pedro", "apellido": "Pérez", "telefono": "+51911111111" }
    ]
  }
}
```

### **Reglas de Negocio:**
- RN-22: Respuesta JSON con headers y sample por tipo
- RN-23: Tipos soportados: padres | docentes | estudiantes | relaciones
- RN-24: Este endpoint no devuelve archivo; es guía para construir CSV/Excel en frontend

---

### **10. Validar Archivo de Importación**

**Endpoint:** `POST /admin/import/validate`  
**Descripción:** Valida archivo antes de inserción en BD  
**Autenticación:** Bearer token (Rol: Administrador)  

#### **Request Body (application/json):**
```json
{
  "tipo": "padres",
  "registros": [
    { "tipo_documento": "DNI", "nro_documento": "12345678", "nombre": "Juan", "apellido": "Pérez", "telefono": "+51987654321" }
  ]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "validacion_id": "val_1730434800000",
    "tipo": "padres",
    "resumen": {
      "total_filas": 2,
      "validos": 2,
      "con_errores": 0
    },
    "registros_validos": [
      {
        "tipo_documento": "DNI",
        "nro_documento": "12345678",
        "nombre": "Juan Carlos",
        "apellido": "Pérez López",
        "telefono": "+51987654321"
      }
    ],
    "registros_con_errores": []
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Archivo inválido:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "El archivo debe ser Excel (.xlsx) o CSV (.csv)"
  }
}
```

### **Reglas de Negocio:**
- **RN-25:** Validar formato de documento (8-12 dígitos)
- **RN-26:** Validar teléfonos (+51XXXXXXXXX)
- **RN-27:** Verificar existencia de niveles/grados en `nivel_grado`
- **RN-28:** Detectar duplicados por `nro_documento`
- **RN-29:** Para estudiantes, validar existencia de apoderado referenciado

---

### **11. Ejecutar Importación Masiva**

**Endpoint:** `POST /admin/import/execute`  
**Descripción:** Inserta registros válidos en base de datos  
**Autenticación:** Bearer token (Rol: Administrador)  

#### **Request Body:**
```json
{
  "tipo": "docentes",
  "registros_validos": [
    { "tipo_documento": "DNI", "nro_documento": "87654321", "nombre": "María", "apellido": "Gómez", "telefono": "+51922222222" }
  ]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "import_id": "imp_1730434800000",
    "resumen": {
      "total_procesados": 2,
      "exitosos": 2,
      "fallidos": 0
    },
    "detalles_por_tipo": {
      "docentes_creados": 2
    },
    "exitosos": [
      {
        "id": "usr_001",
        "nombre": "María",
        "apellido": "Gómez",
        "rol": "docente",
        "nro_documento": "87654321",
        "telefono": "+51922222222",
        "password_inicial": "********"
      }
    ],
    "fallidos": [],
    "año_academico": 2025
  }
}
```

#### **Response Errors:**
- **404 Not Found - Validación no existe:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_NOT_FOUND",
    "message": "Validación con ID val_999 no existe o expiró"
  }
}
```

### **Reglas de Negocio:**
- **RN-30:** Contraseña inicial = valor aleatorio (8-10 caracteres alfanuméricos)
- **RN-31:** Marcar `debe_cambiar_password = true` para todos
- **RN-32:** Generar `codigo_estudiante` automático: NIVEL+GRADO+INCREMENTAL
- **RN-33:** Si falla inserción de un registro, continuar con los demás
- **RN-34:** Registrar errores y exitosos por separado

---

### **12. Validar Relaciones Familiares**

**Endpoint:** `POST /admin/import/validate-relationships`  
**Descripción:** Valida vínculos padre-hijo antes de crear  
**Autenticación:** Bearer token (Rol: Administrador)  

#### **Request Body:**
```json
{
  "relaciones": [
    {
      "nro_documento_padre": "12345678",
      "codigo_estudiante": "P3001",
      "tipo_relacion": "madre"
    }
  ]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_relaciones": 1,
    "validas": 1,
    "invalidas": 0,
    "relaciones_validadas": [
      {
        "nro_documento_padre": "12345678",
        "padre_existe": true,
        "padre_nombre": "Juan Carlos Pérez López",
        "codigo_estudiante": "P3001",
        "estudiante_existe": true,
        "estudiante_nombre": "María Elena Pérez García",
        "tipo_relacion": "madre",
        "valido": true
      }
    ]
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Tipo relación inválido:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_RELATION_TYPE",
    "message": "Tipo de relación debe ser: padre, madre, apoderado o tutor"
  }
}
```

### **Reglas de Negocio:**
- **RN-35:** Verificar que apoderado existe y tiene rol `apoderado`
- **RN-36:** Verificar que estudiante existe y está activo
- **RN-37:** Validar tipo de relación (padre, madre, apoderado, tutor)
- **RN-38:** Un estudiante debe tener exactamente un apoderado principal

---

### **13. Crear Relaciones Familiares**

**Endpoint:** `POST /admin/import/create-relationships`  
**Descripción:** Establece vínculos padre-hijo en el sistema  
**Autenticación:** Bearer token (Rol: Administrador)  

#### **Request Body:**
```json
{
  "relaciones": [
    {
      "nro_documento_padre": "12345678",
      "codigo_estudiante": "P3001",
      "tipo_relacion": "madre"
    }
  ]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "relaciones_creadas": 1,
    "detalles": [
      {
        "padre_id": "usr_001",
        "estudiante_id": "est_001",
        "tipo_relacion": "madre",
        "fecha_asignacion": "2025-02-10T16:00:00Z"
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-39:** Insertar en `relaciones_familiares` con `estado_activo = true`
- **RN-40:** Año académico = año actual
- **RN-41:** Registrar `fecha_asignacion = now()`

---

### **14. Verificar Integridad de Relaciones**

**Endpoint:** `GET /admin/verify/relationships`  
**Descripción:** Verifica que todos los estudiantes tengan apoderado  
**Autenticación:** Bearer token (Rol: Administrador)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_estudiantes": 320,
    "con_apoderado": 318,
    "sin_apoderado": 2,
    "estudiantes_sin_apoderado": [
      {
        "id": "est_999",
        "codigo_estudiante": "P3999",
        "nombre": "Juan Sin Padre",
        "nivel": "Primaria",
        "grado": "3"
      }
    ]
  }
}
```

---


# 🚀 **SECCIÓN 4: GESTIÓN DE CREDENCIALES**

### **15. Generar Credenciales Iniciales**

**Endpoint:** `POST /admin/import/generate-credentials`
**Descripción:** Genera credenciales iniciales para los usuarios recién importados.
**Autenticación:** Bearer token (Rol: Administrador)

#### **Request Body:**

```json
{
  "import_id": "imp_20250210_001",
  "incluir_excel": true,
  "incluir_whatsapp": false,
  "incluir_pdfs": false
}
```

#### **Response Success (200):**

```json
{
  "success": true,
  "data": {
    "credentials_id": "cred_20250210_001",
    "total_credenciales": 45,
    "archivo_excel_url": " /admin/import/credentials/cred_20250210_001/download",
    "pdfs_zip_url": null,
    "fecha_generacion": "2025-10-01T12:30:00Z"
  }
}
```

### **Reglas de Negocio:**

* **RN-42:** Contraseñas aleatorias (8–10 caracteres alfanuméricos).
* **RN-43:** Contraseñas se guardan como hash bcrypt.
* **RN-44:** Marcar `debe_cambiar_password = true` en BD.
* **RN-45:** Solo usuarios con `estado_activo = true`.
* **RN-46:** No re-generar credenciales si ya tienen contraseña personalizada.
* **RN-47:** Registrar log de generación de credenciales.

---

### **16. Descargar Archivo de Credenciales**

**Endpoint:** `GET /admin/import/credentials/{credentials_id}/download`
**Descripción:** Descarga archivo Excel con credenciales.
**Autenticación:** Bearer token (Rol: Administrador)

📌 **Formato:** Excel con columnas: Nombre completo, Rol, Documento, Usuario, Contraseña inicial, Teléfono, Fecha creación, Estado.

---

### **17. Enviar Credenciales por WhatsApp**

**Endpoint:** `POST /admin/import/credentials/{credentials_id}/send-whatsapp`
**Descripción:** Envío masivo de credenciales vía WhatsApp.
**Autenticación:** Bearer token (Rol: Administrador)

#### **Request Body:**

```json
{
  "usuarios_seleccionados": ["usr_001", "usr_002"] 
}
```

#### **Response Success (200):**

```json
{
  "success": true,
  "data": {
    "total_envios": 45,
    "exitosos": 43,
    "fallidos": 2,
    "detalles_fallidos": [
      {
        "usuario_id": "usr_999",
        "telefono": "+51999999999",
        "error": "Número inválido"
      }
    ]
  }
}
```

---

### **18. Generar PDFs Individuales**

**Endpoint:** `POST /admin/import/credentials/{credentials_id}/generate-pdfs`
**Descripción:** Genera PDFs de credenciales (uno por usuario) con Puppeteer.
**Autenticación:** Bearer token (Rol: Administrador)

#### **Response Success (200):**

```json
{
  "success": true,
  "data": {
    "total_pdfs": 45,
    "zip_url": " /admin/import/credentials/cred_20250210_001/pdfs.zip",
    "pdfs_individuales": [
      {
        "usuario_id": "usr_001",
        "pdf_url": " /admin/import/credentials/cred_20250210_001/usr_001.pdf"
      }
    ]
  }
}
```

📌 **Contenido de cada PDF:**

* Logo institucional.
* Nombre completo.
* Rol.
* Usuario (nro_documento).
* Contraseña inicial.
* Teléfono registrado.
* Instrucciones de primer acceso.


---

## **SECCIÓN 5: DATOS MAESTROS**

### **19. Obtener Niveles y Grados Disponibles**

**Endpoint:** `GET /nivel-grado`  
**Descripción:** Lista de niveles y grados académicos  
**Autenticación:** Bearer token (Todos los roles)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "niveles": [
      {
        "id": "niv_001",
        "nivel": "Inicial",
        "grados": [
          {
            "id": "ng_001",
            "grado": "3",
            "descripcion": "3 años",
            "estado_activo": true
          },
          {
            "id": "ng_002",
            "grado": "4",
            "descripcion": "4 años",
            "estado_activo": true
          },
          {
            "id": "ng_003",
            "grado": "5",
            "descripcion": "5 años",
            "estado_activo": true
          }
        ]
      },
      {
        "id": "niv_002",
        "nivel": "Primaria",
        "grados": [
          {
            "id": "ng_004",
            "grado": "1",
            "descripcion": "1ro de Primaria",
            "estado_activo": true
          },
          {
            "id": "ng_005",
            "grado": "2",
            "descripcion": "2do de Primaria",
            "estado_activo": true
          },
          {
            "id": "ng_006",
            "grado": "3",
            "descripcion": "3ro de Primaria",
            "estado_activo": true
          },
          {
            "id": "ng_007",
            "grado": "4",
            "descripcion": "4to de Primaria",
            "estado_activo": true
          },
          {
            "id": "ng_008",
            "grado": "5",
            "descripcion": "5to de Primaria",
            "estado_activo": true
          },
          {
            "id": "ng_009",
            "grado": "6",
            "descripcion": "6to de Primaria",
            "estado_activo": true
          }
        ]
      },
      {
        "id": "niv_003",
        "nivel": "Secundaria",
        "grados": [
          {
            "id": "ng_010",
            "grado": "1",
            "descripcion": "1ro de Secundaria",
            "estado_activo": true
          },
          {
            "id": "ng_011",
            "grado": "2",
            "descripcion": "2do de Secundaria",
            "estado_activo": true
          },
          {
            "id": "ng_012",
            "grado": "3",
            "descripcion": "3ro de Secundaria",
            "estado_activo": true
          },
          {
            "id": "ng_013",
            "grado": "4",
            "descripcion": "4to de Secundaria",
            "estado_activo": true
          },
          {
            "id": "ng_014",
            "grado": "5",
            "descripcion": "5to de Secundaria",
            "estado_activo": true
          }
        ]
      }
    ],
    "total_niveles": 3,
    "total_grados": 14
  }
}
```

---

## **CÓDIGOS DE ERROR ESPECÍFICOS DEL MÓDULO**

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `INSUFFICIENT_PERMISSIONS` | Usuario sin permisos suficientes | 403 |
| `TEACHER_NOT_FOUND` | Docente no existe | 404 |
| `NO_COURSE_ASSIGNMENTS` | Docente sin asignaciones activas | 409 |
| `INVALID_PERMISSION_TYPE` | Tipo de permiso inválido | 400 |
| `STRUCTURE_NOT_CONFIGURED` | Estructura no configurada | 404 |
| `INVALID_WEIGHT_SUM` | Suma de pesos incorrecta | 400 |
| `DUPLICATE_COMPONENT_NAME` | Nombre de componente duplicado | 400 |
| `STRUCTURE_LOCKED` | Configuración bloqueada | 409 |
| `INVALID_INPUT` | Entrada inválida (validación de esquema) | 400 |
| `INVALID_TEMPLATE_TYPE` | Tipo de plantilla inválido | 400 |
| `INVALID_TYPE` | Tipo inválido en importación | 400 |
| `RATE_LIMIT_EXCEEDED` | Límite de solicitudes excedido | 429 |

---

## **MIDDLEWARE Y VALIDACIONES**

### **Middleware de Autorización por Rol:**
```javascript
// roleMiddleware.js
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.rol;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'No tiene permisos para acceder a este recurso'
        }
      });
    }
    next();
  };
};

// Uso:
router.get('/teachers/permissions', 
  authMiddleware, 
  authorizeRole(['director']), 
  getTeachersPermissions
);
```

### **Validaciones de Estructura de Evaluación:**
```javascript
// Validación de suma de pesos
const validateWeightSum = (componentes) => {
  const suma = componentes.reduce((acc, c) => acc + c.peso_porcentual, 0);
  if (Math.abs(suma - 100) > 0.01) {
    throw new Error(`Suma de pesos debe ser 100%. Actual: ${suma}%`);
  }
};

// Validación de pesos individuales
const validateIndividualWeights = (componentes) => {
  componentes.forEach(c => {
    if (c.peso_porcentual < 5 || c.peso_porcentual > 50) {
      throw new Error(`Peso de ${c.nombre_item} fuera de rango (5%-50%)`);
    }
  });
};

// Validación de nombres únicos
const validateUniqueNames = (componentes) => {
  const nombres = componentes.map(c => c.nombre_item.toLowerCase());
  const duplicados = nombres.filter((n, i) => nombres.indexOf(n) !== i);
  if (duplicados.length > 0) {
    throw new Error(`Nombres duplicados: ${duplicados.join(', ')}`);
  }
};
```

### **Validaciones de Importación Masiva:**
```javascript
// Validación de formato de documento
const validateDocumento = (tipoDoc, nroDoc) => {
  const regex = /^\d{8,12}$/;
  if (!regex.test(nroDoc)) {
    throw new Error('Formato de documento inválido');
  }
};

// Validación de teléfono
const validateTelefono = (telefono) => {
  const regex = /^\+51\d{9}$/;
  if (!regex.test(telefono)) {
    throw new Error('Formato de teléfono inválido. Esperado: +51XXXXXXXXX');
  }
};

// Validación de existencia de nivel/grado
const validateNivelGrado = async (nivel, grado) => {
  const exists = await db.nivel_grado.findOne({
    where: { nivel, grado, estado_activo: true }
  });
  if (!exists) {
    throw new Error(`Nivel ${nivel} - Grado ${grado} no existe`);
  }
};
```

---

## **ESTRUCTURA DE BASE DE DATOS RELACIONADA**

### **Tablas Principales:**
- `usuarios`: Información de usuarios del sistema
- `permisos_docentes`: Permisos granulares por tipo
- `estructura_evaluacion`: Componentes de evaluación institucional
- `estudiantes`: Información de estudiantes
- `relaciones_familiares`: Vínculos padre-hijo
- `nivel_grado`: Niveles y grados académicos
- `asignaciones_docente_curso`: Asignaciones de docentes

### **Índices Recomendados:**
```sql
-- Permisos
CREATE INDEX idx_permisos_docente_tipo ON permisos_docentes(docente_id, tipo_permiso);
CREATE INDEX idx_permisos_estado ON permisos_docentes(estado_activo, año_academico);

-- Estructura de evaluación
CREATE INDEX idx_estructura_año ON estructura_evaluacion(año_academico, estado_activo);
CREATE INDEX idx_estructura_orden ON estructura_evaluacion(orden_visualizacion);

-- Relaciones familiares
CREATE INDEX idx_relaciones_padre ON relaciones_familiares(padre_id, estado_activo);
CREATE INDEX idx_relaciones_estudiante ON relaciones_familiares(estudiante_id);

-- Estudiantes
CREATE INDEX idx_estudiantes_codigo ON estudiantes(codigo_estudiante);
CREATE INDEX idx_estudiantes_nivel_grado ON estudiantes(nivel_grado_id, año_academico);
```

---

## **INTEGRACIONES EXTERNAS**

### **WhatsApp Cloud API (Envío de Credenciales):**
```javascript
// Configuración
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0/{phone_id}/messages';
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;

// Mensaje de credenciales
const sendCredentialsWhatsApp = async (telefono, usuario, password) => {
  const message = {
    messaging_product: "whatsapp",
    to: telefono,
    type: "text",
    text: {
      body: `Bienvenido a I.E.P. Las Orquídeas 🏫\n\n` +
            `Accede a la plataforma educativa:\n` +
            `🔗 https://plataforma.orquideas.edu.pe\n\n` +
            `👤 Usuario: ${usuario}\n` +
            `🔑 Contraseña inicial: ${password}\n\n` +
            `⚠️ Por seguridad, cambia tu contraseña en tu primer ingreso.\n\n` +
            `📱 ¿Necesitas ayuda? Contacta con soporte técnico.`
    }
  };
  
  const response = await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });
  
  return response.json();
};
```

### **Generación de PDFs (Puppeteer):**
```javascript
const puppeteer = require('puppeteer');

const generateCredentialPDF = async (userData) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-width: 200px; }
          .credentials { background: #f5f5f5; padding: 20px; }
          .field { margin: 10px 0; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" class="logo" />
          <h1>I.E.P. Las Orquídeas</h1>
          <h2>Credenciales de Acceso</h2>
        </div>
        <div class="credentials">
          <div class="field"><strong>Nombre:</strong> ${userData.nombre}</div>
          <div class="field"><strong>Rol:</strong> ${userData.rol}</div>
          <div class="field"><strong>Usuario:</strong> ${userData.usuario}</div>
          <div class="field"><strong>Contraseña:</strong> ${userData.password}</div>
          <div class="field"><strong>Teléfono:</strong> ${userData.telefono}</div>
        </div>
        <p style="margin-top: 30px; color: #666;">
          <strong>Instrucciones:</strong><br>
          1. Accede a https://plataforma.orquideas.edu.pe<br>
          2. Ingresa tu usuario y contraseña<br>
          3. Cambia tu contraseña en tu primer inicio de sesión
        </p>
      </body>
    </html>
  `;
  
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  
  return pdf;
};
```


