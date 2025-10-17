# **Documentación API REST - Módulo de Autenticación**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semana 3 - 2025  
**Versión:** 1.0 - Autenticación  

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** `https://app-orquideas.com`

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
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="plantilla_padres.xlsx"

[Binary Excel File]
```

### **Reglas de Negocio:**
- **RN-22:** Archivo Excel con headers predefinidos según tipo
- **RN-23:** Incluir hoja de instrucciones con ejemplos
- **RN-24:** Formato de columnas específico y documentado

---

### **10. Validar Archivo de Importación**

**Endpoint:** `POST /admin/import/validate`  
**Descripción:** Valida archivo antes de inserción en BD  
**Autenticación:** Bearer token (Rol: Administrador)  

#### **Request Body (multipart/form-data):**
```
tipo: "padres"
archivo: [Excel/CSV File]
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "validacion_id": "val_20250210_001",
    "tipo": "padres",
    "resumen": {
      "total_filas": 50,
      "validos": 45,
      "con_errores": 5
    },
    "registros_validos": [
      {
        "fila": 2,
        "nombre": "Juan Carlos Pérez López",
        "nro_documento": "12345678",
        "telefono": "+51987654321"
      }
    ],
    "registros_con_errores": [
      {
        "fila": 8,
        "errores": [
          {
            "campo": "nro_documento",
            "mensaje": "Formato inválido. Debe ser numérico de 8-12 dígitos"
          }
        ],
        "datos": {
          "nombre": "María García",
          "nro_documento": "ABC12345"
        }
      },
      {
        "fila": 12,
        "errores": [
          {
            "campo": "telefono",
            "mensaje": "Formato inválido. Esperado: +51XXXXXXXXX"
          }
        ],
        "datos": {
          "nombre": "Pedro Sánchez",
          "telefono": "987654321"
        }
      }
    ],
    "archivo_errores_url": "/admin/import/val_20250210_001/errores.txt"
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
  "validacion_id": "val_20250210_001",
  "procesar_solo_validos": true,
  "enviar_credenciales_whatsapp": false
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "import_id": "imp_20250210_001",
    "resumen": {
      "total_procesados": 45,
      "exitosos": 43,
      "fallidos": 2
    },
    "detalles_por_tipo": {
      "padres_creados": 43,
      "docentes_creados": 0,
      "estudiantes_creados": 0
    },
    "credenciales_generadas": true,
    "archivo_credenciales_url": "/admin/import/imp_20250210_001/credenciales",
    "fecha_importacion": "2025-02-10T15:30:00Z"
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
| `INVALID_FILE_FORMAT` | Formato de archivo inválido | 400 |
| `VALIDATION_NOT_FOUND` | Validación no existe | 404 |
| `INVALID_RELATION_TYPE` | Tipo de relación inválido | 400 |
| `PARENT_NOT_FOUND` | Apoderado no existe | 404 |
| `STUDENT_NOT_FOUND` | Estudiante no existe | 404 |

---

# **Documentación API REST - Módulo de Datos Académicos (Carga)**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semanas 6-7 - 2025  
**Versión:** 1.0 - Carga de Calificaciones y Asistencia  

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** ``

### **Autenticación JWT**
- Todos los endpoints requieren autenticación
- Incluir en cada request: `Authorization: Bearer <token>`
- Roles autorizados por endpoint especificados en cada sección

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

> Nota de implementación (Estado actual - Semana 3)
>
> - Reportes de errores devuelven URL con report_id y vencen en 24h:
>   - GET /calificaciones/reporte-errores/{report_id}
>   - GET /asistencias/reporte-errores/{report_id}
> - Plantillas Excel reales generadas con ExcelJS:
>   - Calificaciones: Hoja "Calificaciones" con filas 1-3 informativas y fila 5 de encabezados; validación 0-20 en columna C; sin hoja "Instrucciones" ni celdas bloqueadas por ahora; nombre de archivo: Calificaciones_{Curso}{Grado}{Nivel}_{YYYY-MM-DD}.xlsx
>   - Asistencias: Hoja "Asistencias" con estados válidos en dropdown; nota en D5 para hora de tardanza; nombre de archivo: Asistencias_{Curso}{Grado}{Nivel}_{YYYY-MM-DD}.xlsx
> - Validación de archivos:
>   - Calificaciones: requiere curso_id, nivel_grado_id, trimestre (por defecto 1 si no se envía), componente_id; archivo_errores_url devuelve un report_id (TTL 24h).
>   - Asistencias: requiere curso_id, nivel_grado_id y fecha; archivo_errores_url devuelve un report_id (TTL 24h).
> - Verificación de asistencia: valida contexto (curso/nivel_grado/fecha), verifica registros previos del día y devuelve estadísticas si existen.
> - Carga de calificaciones/asistencias: Persistencia real con Prisma. En Asistencias, soporta reemplazar_existente: true para sobrescribir el día; se invalida el validacion_id tras cargar; operación transaccional.
> - Seguridad y límites: endpoints protegidos con JWT y roles; rate limiting por endpoint activo.

## **SECCIÓN 1: CURSOS Y ESTUDIANTES (Contexto Compartido)**

### **1. Obtener Cursos Asignados (Docente)**

**Endpoint:** `GET /cursos/asignados`  
**Descripción:** Lista de cursos asignados al docente autenticado  
**Autenticación:** Bearer token (Rol: Docente)  

#### **Query Parameters:**
```
?año_academico=2025  # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    },
    "año_academico": 2025,
    "cursos": [
      {
        "id": "cur_001",
        "codigo_curso": "CP3001",
        "nombre": "Matemáticas",
        "nivel_grado": {
          "id": "ng_006",
          "nivel": "Primaria",
          "grado": "3",
          "descripcion": "3ro de Primaria"
        },
        "total_estudiantes": 28,
        "estado_activo": true
      },
      {
        "id": "cur_002",
        "codigo_curso": "CP4001",
        "nombre": "Matemáticas",
        "nivel_grado": {
          "id": "ng_007",
          "nivel": "Primaria",
          "grado": "4",
          "descripcion": "4to de Primaria"
        },
        "total_estudiantes": 30,
        "estado_activo": true
      }
    ],
    "total_cursos": 2
  }
}
```

#### **Response Errors:**
- **404 Not Found - Sin asignaciones:**
```json
{
  "success": false,
  "error": {
    "code": "NO_COURSE_ASSIGNMENTS",
    "message": "No tiene cursos asignados para el año 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Solo mostrar cursos con `estado_activo = true`
- **RN-02:** Filtrar por `año_academico` actual por defecto
- **RN-03:** Incluir conteo de estudiantes activos por curso
- **RN-04:** Ordenar por nivel, grado y nombre de curso

---

### **2. Obtener Cursos por Nivel y Grado (Director)**

**Endpoint:** `GET /cursos`  
**Descripción:** Lista de cursos disponibles por nivel y grado  
**Autenticación:** Bearer token (Rol: Director)  

#### **Query Parameters:**
```
?nivel=Primaria       # Nivel académico (requerido)
&grado=3              # Grado (requerido)
&año_academico=2025   # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "nivel_grado": {
      "id": "ng_006",
      "nivel": "Primaria",
      "grado": "3",
      "descripcion": "3ro de Primaria"
    },
    "año_academico": 2025,
    "cursos": [
      {
        "id": "cur_001",
        "codigo_curso": "CP3001",
        "nombre": "Matemáticas",
        "total_estudiantes": 28,
        "docente_asignado": {
          "id": "usr_doc_001",
          "nombre": "Ana María Rodríguez Vega"
        },
        "estado_activo": true
      },
      {
        "id": "cur_002",
        "codigo_curso": "CP3002",
        "nombre": "Comunicación",
        "total_estudiantes": 28,
        "docente_asignado": {
          "id": "usr_doc_002",
          "nombre": "Carlos Méndez Torres"
        },
        "estado_activo": true
      }
    ],
    "total_cursos": 8
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Parámetros faltantes:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Los parámetros 'nivel' y 'grado' son requeridos"
  }
}
```

- **404 Not Found - Nivel/grado no existe:**
```json
{
  "success": false,
  "error": {
    "code": "NIVEL_GRADO_NOT_FOUND",
    "message": "Nivel 'Premaria' - Grado '3' no existe en el sistema"
  }
}
```

### **Reglas de Negocio:**
- **RN-05:** Validar existencia de nivel/grado en `nivel_grado`
- **RN-06:** Solo cursos activos del año académico especificado
- **RN-07:** Incluir información del docente asignado actual
- **RN-08:** Ordenar alfabéticamente por nombre de curso

---

### **3. Obtener Estudiantes de un Curso**

**Endpoint:** `GET /estudiantes`  
**Descripción:** Lista de estudiantes activos matriculados en un curso  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Query Parameters:**
```
?curso_id=cur_001           # ID del curso (requerido)
&nivel_grado_id=ng_006      # ID del nivel/grado (requerido)
&año_academico=2025         # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "curso": {
      "id": "cur_001",
      "nombre": "Matemáticas",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "3"
      }
    },
    "año_academico": 2025,
    "estudiantes": [
      {
        "id": "est_001",
        "codigo_estudiante": "P3001",
        "nombre": "María Elena",
        "apellido": "Pérez García",
        "nombre_completo": "María Elena Pérez García",
        "apoderado_principal": {
          "id": "usr_pad_001",
          "nombre": "Juan Carlos Pérez López",
          "telefono": "+51987654321"
        },
        "estado_matricula": "activo"
      },
      {
        "id": "est_002",
        "codigo_estudiante": "P3002",
        "nombre": "Luis Alberto",
        "apellido": "Fernández Soto",
        "nombre_completo": "Luis Alberto Fernández Soto",
        "apoderado_principal": {
          "id": "usr_pad_002",
          "nombre": "Carmen Rosa Soto Díaz",
          "telefono": "+51923456789"
        },
        "estado_matricula": "activo"
      }
    ],
    "total_estudiantes": 28
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Parámetros inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "curso_id y nivel_grado_id son requeridos"
  }
}
```

- **403 Forbidden - Sin acceso al curso:**
```json
{
  "success": false,
  "error": {
    "code": "COURSE_ACCESS_DENIED",
    "message": "No tiene permisos para acceder a este curso"
  }
}
```

### **Reglas de Negocio:**
- **RN-09:** Docente: solo estudiantes de sus cursos asignados
- **RN-10:** Director: acceso a estudiantes de cualquier curso
- **RN-11:** Solo estudiantes con `estado_matricula = 'activo'`
- **RN-12:** Incluir información del apoderado principal
- **RN-13:** Ordenar alfabéticamente por apellido, nombre

---

## **SECCIÓN 2: CARGA DE CALIFICACIONES**

### **4. Obtener Estructura de Evaluación Vigente**

**Endpoint:** `GET /estructura-evaluacion`  
**Descripción:** Componentes de evaluación configurados para el año  
**Autenticación:** Bearer token (Roles: Docente, Director)  

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
        "estado_activo": true
      },
      {
        "id": "eval_002",
        "nombre_item": "Participación",
        "peso_porcentual": 20.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 2,
        "estado_activo": true
      },
      {
        "id": "eval_003",
        "nombre_item": "Revisión de Cuaderno",
        "peso_porcentual": 15.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 3,
        "estado_activo": true
      },
      {
        "id": "eval_004",
        "nombre_item": "Revisión de Libro",
        "peso_porcentual": 15.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 4,
        "estado_activo": true
      },
      {
        "id": "eval_005",
        "nombre_item": "Comportamiento",
        "peso_porcentual": 10.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 5,
        "estado_activo": true
      }
    ],
    "total_componentes": 5,
    "suma_pesos": 100.00,
    "configuracion_bloqueada": true
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
- **RN-14:** Solo componentes con `estado_activo = true`
- **RN-15:** Ordenar por `orden_visualizacion` ascendente
- **RN-16:** Validar que configuración esté bloqueada antes de permitir cargas

---

### **5. Generar Plantilla de Calificaciones**

**Endpoint:** `POST /calificaciones/plantilla`  
**Descripción:** Genera archivo Excel con plantilla para un componente específico  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Request Body:**
```json
{
  "curso_id": "cur_001",
  "nivel_grado_id": "ng_006",
  "trimestre": 1,
  "componente_id": "eval_001",
  "año_academico": 2025
}
```

#### **Response Success (200):**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Calificaciones_Matematicas_3Primaria_T1_Examen_10022025.xlsx"

[Binary Excel File]
```

#### **Estructura del Excel Generado:**

**Hoja 1: "Calificaciones"**
- **Celda A1:** `componente_id` (prellenado con ID del componente - oculta/protegida)
- **Celda B1:** `fecha_evaluacion` (prellenada con fecha actual - formato YYYY-MM-DD)
- **Fila 3 (Headers):**
  - Columna A: `codigo_estudiante`
  - Columna B: `nombre_completo`
  - Columna C: `calificacion`
  - Columna D: `observaciones`
- **Filas 4+:** Datos de estudiantes prellenados
- **Formato:**
  - Columnas A y B: Bloqueadas (solo lectura)
  - Columna C: Validación de datos (0-20, decimales hasta 2 posiciones)
  - Formato condicional en C: Rojo si < 11
  - Columna D: Texto libre

**Hoja 2: "Instrucciones"**
- Información del componente (nombre, tipo, peso)
- Escala de calificación (0-20 → AD/A/B/C)
- Explicación de fecha de evaluación
- Advertencias de no modificar estructura
- Ejemplos de llenado correcto

#### **Response Errors:**
- **400 Bad Request - Parámetros faltantes:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "curso_id, nivel_grado_id, trimestre y componente_id son requeridos"
  }
}
```

- **404 Not Found - Componente no existe:**
```json
{
  "success": false,
  "error": {
    "code": "COMPONENT_NOT_FOUND",
    "message": "Componente con ID eval_999 no existe o no está activo"
  }
}
```

- **403 Forbidden - Sin acceso al curso:**
```json
{
  "success": false,
  "error": {
    "code": "COURSE_ACCESS_DENIED",
    "message": "No tiene permisos para generar plantilla de este curso"
  }
}
```

### **Reglas de Negocio:**
- **RN-17:** Docente: solo plantillas de cursos asignados
- **RN-18:** Director: plantillas de cualquier curso
- **RN-19:** Solo estudiantes activos del curso en el año académico
- **RN-20:** Nombre de archivo incluye contexto completo
- **RN-21:** Plantilla debe incluir ID de componente (validación backend)

---

### **6. Validar Archivo de Calificaciones**

**Endpoint:** `POST /calificaciones/validar`  
**Descripción:** Valida estructura y datos antes de inserción  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Request Body (multipart/form-data):**
```
curso_id: "cur_001"
nivel_grado_id: "ng_006"
trimestre: 1
componente_id: "eval_001"
año_academico: 2025
archivo: [Excel File]
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "validacion_id": "val_cal_20250210_001",
    "contexto": {
      "curso": "Matemáticas - 3ro de Primaria",
      "trimestre": 1,
      "componente": "Examen (Única - 40%)",
      "fecha_evaluacion": "2025-02-10"
    },
    "resumen": {
      "total_filas": 28,
      "validos": 25,
      "con_errores": 3
    },
    "registros_validos": [
      {
        "fila": 4,
        "codigo_estudiante": "P3001",
        "nombre_completo": "María Elena Pérez García",
        "calificacion": 18.5,
        "observaciones": "Excelente trabajo"
      }
    ],
    "registros_con_errores": [
      {
        "fila": 8,
        "codigo_estudiante": "P3005",
        "nombre_completo": "Carlos Ruiz Torres",
        "errores": [
          {
            "campo": "calificacion",
            "valor": "25",
            "mensaje": "Calificación fuera de rango (debe ser 0-20)"
          }
        ]
      },
      {
        "fila": 15,
        "codigo_estudiante": "P3012",
        "nombre_completo": "Ana Soto García",
        "errores": [
          {
            "campo": "calificacion",
            "valor": "",
            "mensaje": "Calificación es obligatoria"
          }
        ]
      },
      {
        "fila": 20,
        "codigo_estudiante": "P3040",
        "nombre_completo": "Estudiante Inexistente",
        "errores": [
          {
            "campo": "codigo_estudiante",
            "valor": "P3040",
            "mensaje": "Estudiante no encontrado en el curso seleccionado"
          }
        ]
      }
    ],
    "advertencias": [
      {
        "tipo": "EVALUACION_UNICA_EXISTENTE",
        "mensaje": "Ya existe evaluación única para 2 estudiantes. Se omitirán si intenta cargar duplicados.",
        "estudiantes_afectados": ["P3001", "P3002"]
      }
    ],
    "archivo_errores_url": "/calificaciones/reporte-errores/{report_id}"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Estructura inválida:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TEMPLATE_STRUCTURE",
    "message": "La estructura del archivo no coincide con la plantilla del componente 'Examen'"
  }
}
```

- **400 Bad Request - Componente no coincide:**
```json
{
  "success": false,
  "error": {
    "code": "COMPONENT_MISMATCH",
    "message": "El componente_id en el archivo (eval_002) no coincide con el componente seleccionado (eval_001)"
  }
}
```

- **400 Bad Request - Fecha inválida:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Formato de fecha_evaluacion inválido. Esperado: YYYY-MM-DD"
  }
}
```

### **Reglas de Negocio:**
- **RN-22:** Validar que `componente_id` en archivo coincida con seleccionado
- **RN-23:** Validar formato de `fecha_evaluacion` (YYYY-MM-DD)
- **RN-24:** Calificaciones 0-20 (decimales hasta 2 posiciones)
- **RN-25:** Campos obligatorios: `codigo_estudiante`, `calificacion`
- **RN-26:** Observaciones opcionales (max 500 caracteres)
- **RN-27:** Para componente `unica`: verificar si ya existe evaluación
- **RN-28:** Para componente `recurrente`: verificar duplicados por fecha
- **RN-29:** Generar advertencias (no errores críticos) para duplicados

---

### **7. Cargar Calificaciones (Procesar e Insertar)**

**Endpoint:** `POST /calificaciones/cargar`  
**Descripción:** Inserta calificaciones válidas en base de datos  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Request Body:**
```json
{
  "validacion_id": "val_cal_20250210_001",
  "procesar_solo_validos": true,
  "generar_alertas": true
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "carga_id": "carga_cal_20250210_001",
    "contexto": {
      "curso": "Matemáticas - 3ro de Primaria",
      "trimestre": 1,
      "componente": "Examen",
      "fecha_evaluacion": "2025-02-10"
    },
    "resumen": {
      "total_procesados": 25,
      "insertados_exitosamente": 25,
      "omitidos": 3
    },
    "alertas_generadas": {
      "total": 5,
      "bajo_rendimiento": 5,
      "estudiantes_afectados": [
        {
          "codigo_estudiante": "P3008",
          "nombre": "Pedro Gómez",
          "calificacion": 9.5,
          "apoderado": {
            "nombre": "Rosa Gómez",
            "telefono": "+51923456789"
          },
          "notificacion_enviada": true
        }
      ]
    },
    "fecha_carga": "2025-02-10T14:30:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
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
    "message": "Validación con ID val_cal_999 no existe o expiró"
  }
}
```

- **400 Bad Request - No hay registros válidos:**
```json
{
  "success": false,
  "error": {
    "code": "NO_VALID_RECORDS",
    "message": "No hay registros válidos para procesar"
  }
}
```

### **Reglas de Negocio:**
- **RN-30:** Insertar en `evaluaciones` con estado `'preliminar'`
- **RN-31:** Calcular `calificacion_letra` automáticamente (AD/A/B/C)
- **RN-32:** Registrar `fecha_evaluacion` del archivo
- **RN-33:** Registrar `registrado_por = usuario_actual_id`
- **RN-34:** Si `calificacion_numerica < 11`: generar alerta de bajo rendimiento
- **RN-35:** Enviar notificaciones a apoderados afectados (WhatsApp + plataforma)
- **RN-36:** Transacción atómica: si falla un insert, rollback completo

---

### **8. Descargar Reporte de Errores (TXT)**

**Endpoint:** `GET /calificaciones/reporte-errores/{report_id}`
**Descripción:** Descarga archivo TXT con errores detallados  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Response Success (200):**
```
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="Errores_Calificaciones_Matematicas_3Primaria_T1_10022025.txt"

REPORTE DE ERRORES - CARGA DE CALIFICACIONES
====================================================
Curso: Matemáticas - 3° de Primaria
Trimestre: 1
Componente: Examen (Única - 40%)
Fecha de Evaluación: 2025-02-10
Usuario: Ana María Rodríguez Vega (Docente)
Fecha de Validación: 10/02/2025 14:15 PM

====================================================
ERRORES DETECTADOS: 3
====================================================

Fila 8: Código P3005 - Carlos Ruiz Torres
❌ Calificación inválida: "25" (debe estar entre 0 y 20)

Fila 15: Código P3012 - Ana Soto García
❌ Calificación vacía (campo obligatorio)

Fila 20: Código P3040 - Estudiante Inexistente
❌ Estudiante no encontrado en el curso seleccionado

====================================================
ADVERTENCIAS: 1
====================================================

⚠️ Ya existe evaluación única para 2 estudiantes: P3001, P3002
   Si intenta cargar nuevamente, estos registros se omitirán.

====================================================
RECOMENDACIONES
====================================================
1. Corrija los errores indicados en el archivo original
2. No modifique la estructura de columnas
3. Asegúrese de que todos los códigos de estudiante sean correctos
4. Vuelva a subir el archivo corregido

Para soporte técnico, contacte al administrador del sistema.
```

### **Reglas de Negocio:**
- **RN-37:** Archivo generado automáticamente al validar
- **RN-38:** Almacenamiento temporal (24 horas)
- **RN-39:** Encoding UTF-8 para compatibilidad
- **RN-40:** Incluir contexto completo de la carga

---

## **SECCIÓN 3: CARGA DE ASISTENCIA**

### **9. Verificar Registro Existente de Asistencia**

**Endpoint:** `GET /asistencias/verificar`  
**Descripción:** Verifica si ya existe asistencia para una fecha específica  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Query Parameters:**
```
?curso_id=cur_001           # ID del curso (requerido)
&nivel_grado_id=ng_006      # ID del nivel/grado (requerido)
&fecha=2025-02-10           # Fecha a verificar (YYYY-MM-DD, requerida)
&año_academico=2025         # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "existe_registro": true,
    "fecha": "2025-02-10",
    "nivel_grado": {
      "nivel": "Primaria",
      "grado": "3"
    },
    "total_estudiantes_registrados": 28,
    "estadisticas": {
      "presente": 25,
      "tardanza": 2,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 1
    },
    "fecha_registro": "2025-02-10T08:30:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
  }
}
```

#### **Response Success (200) - No existe:**
```json
{
  "success": true,
  "data": {
    "existe_registro": false,
    "fecha": "2025-02-11",
    "nivel_grado": {
      "nivel": "Primaria",
      "grado": "3"
    },
    "total_estudiantes": 28,
    "mensaje": "No hay registro de asistencia para esta fecha"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Fecha futura:**
```json
{
  "success": false,
  "error": {
    "code": "FUTURE_DATE_NOT_ALLOWED",
    "message": "No se puede verificar asistencia para fechas futuras"
  }
}
```

### **Reglas de Negocio:**
- **RN-41:** Solo fechas pasadas o actual
- **RN-42:** Verificar por `nivel_grado_id + fecha + año_academico`
- **RN-43:** Si existe, mostrar estadísticas de estados
- **RN-44:** Permitir reemplazo solo con confirmación del usuario

---

### **10. Generar Plantilla de Asistencia**

**Endpoint:** `POST /asistencias/plantilla`  
**Descripción:** Genera archivo Excel para registro de asistencia diaria  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Request Body:**
```json
{
  "curso_id": "cur_001",
  "nivel_grado_id": "ng_006",
  "fecha": "2025-02-10",
  "año_academico": 2025
}
```

#### **Response Success (200):**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Asistencia_3Primaria_10022025.xlsx"

[Binary Excel File]
```

#### **Estructura del Excel Generado:**

**Hoja 1: "Asistencia"**
- **Celda A1:** `fecha_asistencia` (prellenada con fecha seleccionada - formato YYYY-MM-DD)
- **Fila 3 (Headers):**
  - Columna A: `codigo_estudiante`
  - Columna B: `nombre_completo`
  - Columna C: `estado` (dropdown)
  - Columna D: `hora_llegada` (opcional, formato HH:MM)
  - Columna E: `justificacion` (opcional)
- **Filas 4+:** Datos de estudiantes prellenados
- **Formato:**
  - Columnas A y B: Bloqueadas
  - Columna C: Dropdown con valores {Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada}
  - Formato condicional en C: Verde (Presente), Amarillo (Tardanza), Azul (Permiso), Naranja (FJ), Rojo (FI)
  - Columna D: Formato de hora (HH:MM)
  - Columna E: Texto libre (max 200 caracteres)

**Hoja 2: "Instrucciones"**
- **Sección "Estados de Asistencia":**
  - Tabla con: Estado | Abreviatura | Descripción | Campos Adicionales
  - Presente | P | Asistencia completa y puntual | Ninguno
  - Tardanza | T | Llegada fuera de horario | Hora de llegada (obligatoria)
  - Permiso | PE | Ausencia autorizada previamente | Justificación (opcional)
  - Falta Justificada | FJ | Ausencia con justificación posterior | Justificación (recomendada)
  - Falta Injustificada | FI | Ausencia sin justificación válida | Ninguno
- **Sección "Formato de Hora":**
  - Explicación: "Usar formato 24 horas HH:MM (ej: 08:15, 14:30)"
  - Horario válido: 06:00 a 18:00
- **Sección "Advertencias":**
  - ⚠️ Un estado por estudiante
  - ⚠️ Hora solo para Tardanzas
  - ⚠️ No modificar códigos de estudiante ni fecha
- **Sección "Ejemplos":**
  - 5 ejemplos visuales (uno por cada estado)

#### **Response Errors:**
- **400 Bad Request - Fecha futura:**
```json
{
  "success": false,
  "error": {
    "code": "FUTURE_DATE_NOT_ALLOWED",
    "message": "No se puede generar plantilla para fechas futuras"
  }
}
```

- **404 Not Found - Nivel/grado sin estudiantes:**
```json
{
  "success": false,
  "error": {
    "code": "NO_STUDENTS_FOUND",
    "message": "No hay estudiantes activos en Primaria - 3° para el año 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-45:** Solo fechas pasadas o actual
- **RN-46:** Incluir todos los estudiantes activos del grado
- **RN-47:** Nombre de archivo incluye nivel, grado y fecha
- **RN-48:** Fecha prellenada en celda A1 (validación backend)

---

### **11. Validar Archivo de Asistencia**

**Endpoint:** `POST /asistencias/validar`  
**Descripción:** Valida estructura y datos antes de inserción  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Request Body (multipart/form-data):**
```
curso_id: "cur_001"
nivel_grado_id: "ng_006"
fecha: "2025-02-10"
año_academico: 2025
archivo: [Excel File]
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "validacion_id": "val_asi_20250210_001",
    "contexto": {
      "nivel_grado": "3ro de Primaria",
      "fecha": "2025-02-10",
      "día_semana": "Lunes"
    },
    "resumen": {
      "total_filas": 28,
      "validos": 25,
      "con_errores": 3
    },
    "desglose_por_estado": {
      "presente": 23,
      "tardanza": 2,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 0
    },
    "registros_validos": [
      {
        "fila": 4,
        "codigo_estudiante": "P3001",
        "nombre_completo": "María Elena Pérez García",
        "estado": "presente",
        "hora_llegada": null,
        "justificacion": null
      },
      {
        "fila": 5,
        "codigo_estudiante": "P3002",
        "nombre_completo": "Luis Alberto Fernández Soto",
        "estado": "tardanza",
        "hora_llegada": "08:15",
        "justificacion": null
      }
    ],
    "registros_con_errores": [
      {
        "fila": 10,
        "codigo_estudiante": "P3009",
        "nombre_completo": "Carlos Ruiz Torres",
        "errores": [
          {
            "campo": "estado",
            "valor": "Ausente",
            "mensaje": "Estado inválido. Valores válidos: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada"
          }
        ]
      },
      {
        "fila": 15,
        "codigo_estudiante": "P3014",
        "nombre_completo": "Ana García López",
        "errores": [
          {
            "campo": "hora_llegada",
            "valor": "25:00",
            "mensaje": "Formato de hora inválido. Formato correcto: HH:MM (06:00-18:00)"
          }
        ]
      },
      {
        "fila": 20,
        "codigo_estudiante": "P3019",
        "nombre_completo": "Pedro Soto Díaz",
        "errores": [
          {
            "campo": "hora_llegada",
            "valor": "08:30",
            "mensaje": "Hora de llegada especificada pero estado no es 'Tardanza'"
          }
        ]
      }
    ],
    "advertencias": [
      {
        "tipo": "DUPLICATE_DATE",
        "mensaje": "Ya existe registro de asistencia para esta fecha. Si continúa, se reemplazarán los datos existentes."
      }
    ],
    "archivo_errores_url": "/asistencias/reporte-errores/{report_id}"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Fecha no coincide:**
```json
{
  "success": false,
  "error": {
    "code": "DATE_MISMATCH",
    "message": "La fecha en el archivo (2025-02-11) no coincide con la fecha seleccionada (2025-02-10)"
  }
}
```

- **400 Bad Request - Fecha fuera de año académico:**
```json
{
  "success": false,
  "error": {
    "code": "DATE_OUT_OF_ACADEMIC_YEAR",
    "message": "La fecha 2024-12-15 está fuera del año académico 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-49:** Validar que `fecha_asistencia` en archivo coincida con seleccionada
- **RN-50:** Estados válidos (case-insensitive): Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada
- **RN-51:** `hora_llegada` opcional solo si estado = "Tardanza" (formato HH:MM, rango 06:00-18:00)
- **RN-52:** `justificacion` opcional (max 200 caracteres)
- **RN-53:** Detectar duplicados de `codigo_estudiante` en archivo
- **RN-54:** Verificar que no existan registros previos para misma fecha
- **RN-55:** Fecha debe estar dentro del año académico

---

### **12. Cargar Asistencia (Procesar e Insertar)**

**Endpoint:** `POST /asistencias/cargar`  
**Descripción:** Inserta registros de asistencia en base de datos  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Request Body:**
```json
{
  "validacion_id": "val_asi_20250210_001",
  "procesar_solo_validos": true,
  "reemplazar_existente": false,
  "generar_alertas": true
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "carga_id": "carga_asi_20250210_001",
    "contexto": {
      "nivel_grado": "3ro de Primaria",
      "fecha": "2025-02-10",
      "día_semana": "Lunes"
    },
    "resumen": {
      "total_procesados": 25,
      "insertados_exitosamente": 25,
      "omitidos": 3
    },
    "desglose_por_estado": {
      "presente": 23,
      "tardanza": 2,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 0
    },
    "alertas_generadas": {
      "total": 2,
      "tardanzas": 2,
      "faltas_injustificadas": 0,
      "patrones_criticos": 0,
      "confirmaciones_presencia": 23,
      "estudiantes_afectados": [
        {
          "codigo_estudiante": "P3002",
          "nombre": "Luis Alberto Fernández Soto",
          "tipo_alerta": "tardanza",
          "hora_llegada": "08:15",
          "apoderado": {
            "nombre": "Carmen Rosa Soto Díaz",
            "telefono": "+51923456789"
          },
          "notificacion_enviada": true
        },
        {
          "codigo_estudiante": "P3005",
          "nombre": "Pedro Gómez Torres",
          "tipo_alerta": "tardanza",
          "hora_llegada": "08:20",
          "apoderado": {
            "nombre": "Rosa Gómez Vega",
            "telefono": "+51987654321"
          },
          "notificacion_enviada": true
        }
      ]
    },
    "fecha_carga": "2025-02-10T08:45:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
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
    "message": "Validación con ID val_asi_999 no existe o expiró"
  }
}
```

- **409 Conflict - Registro existente sin confirmación:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_RECORD_EXISTS",
    "message": "Ya existe registro de asistencia para esta fecha. Use reemplazar_existente: true para sobrescribir"
  }
}
```

### **Reglas de Negocio:**
- **RN-56:** Insertar en `asistencias` con estados normalizados (minúsculas con guiones bajos)
- **RN-57:** Registrar `fecha`, `año_academico`, `registrado_por`, `fecha_registro`
- **RN-58:** **Alertas automáticas por Tardanza:** generar alerta inmediata + notificación WhatsApp/plataforma
- **RN-59:** **Alertas por Falta Injustificada:** generar alerta con solicitud de justificación
- **RN-60:** **Confirmación por Presente:** generar notificación positiva simple
- **RN-61:** **Patrón crítico:** detectar 3+ faltas injustificadas consecutivas → alerta crítica
- **RN-62:** **Patrón preventivo:** detectar 5+ tardanzas en un trimestre → alerta preventiva
- **RN-63:** Si `reemplazar_existente = true`: eliminar registros previos y insertar nuevos
- **RN-64:** Transacción atómica: rollback completo si falla algún insert

---

### **13. Descargar Reporte de Errores de Asistencia (TXT)**

**Endpoint:** `GET /asistencias/reporte-errores/{report_id}`
**Descripción:** Descarga archivo TXT con errores detallados  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Response Success (200):**
```
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="Errores_Asistencia_3Primaria_10022025.txt"

REPORTE DE ERRORES - CARGA DE ASISTENCIA
====================================================
Nivel/Grado: 3° de Primaria
Fecha: 10/02/2025 (Lunes)
Usuario: Ana María Rodríguez Vega (Docente)
Fecha de Validación: 10/02/2025 08:30 AM

====================================================
ERRORES DETECTADOS: 3
====================================================

Fila 10: Código P3009 - Carlos Ruiz Torres
❌ Estado inválido: "Ausente"
   Valores válidos: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada

Fila 15: Código P3014 - Ana García López
❌ Formato de hora inválido: "25:00"
   Formato correcto: HH:MM (06:00-18:00)

Fila 20: Código P3019 - Pedro Soto Díaz
❌ Hora de llegada especificada pero estado no es "Tardanza"
   La hora de llegada solo debe registrarse para tardanzas

====================================================
ADVERTENCIAS: 1
====================================================

⚠️ Ya existe registro de asistencia para esta fecha (10/02/2025)
   Registrado por: Ana María Rodríguez Vega el 10/02/2025 08:00 AM
   Si carga nuevamente, deberá confirmar el reemplazo de datos.

====================================================
RECOMENDACIONES
====================================================
1. Corrija los errores indicados en el archivo original
2. Use el dropdown de estados para evitar errores de escritura
3. Registre hora de llegada solo para tardanzas
4. No modifique la fecha en la celda A1
5. Vuelva a subir el archivo corregido

Para soporte técnico, contacte al administrador del sistema.
```

### **Reglas de Negocio:**
- **RN-65:** Archivo generado automáticamente al validar
- **RN-66:** Almacenamiento temporal (24 horas)
- **RN-67:** Encoding UTF-8 para compatibilidad
- **RN-68:** Incluir contexto completo (nivel, grado, fecha, día de la semana)

---

### **14. Obtener Estadísticas de Asistencia del Día**

**Endpoint:** `GET /asistencias/estadisticas`  
**Descripción:** Resumen estadístico de asistencia por fecha  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Query Parameters:**
```
?curso_id=cur_001            # ID del curso (requerido)
&nivel_grado_id=ng_006       # ID del nivel/grado (requerido)
&fecha=2025-02-10            # Fecha (YYYY-MM-DD, requerida)
&año_academico=2025          # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "fecha": "2025-02-10",
    "día_semana": "Lunes",
    "nivel_grado": {
      "nivel": "Primaria",
      "grado": "3",
      "total_estudiantes": 28
    },
    "estadisticas": {
      "total_registros": 28,
      "presente": {
        "cantidad": 25,
        "porcentaje": 89.29
      },
      "tardanza": {
        "cantidad": 2,
        "porcentaje": 7.14,
        "promedio_minutos_retraso": 18
      },
      "permiso": {
        "cantidad": 0,
        "porcentaje": 0.00
      },
      "falta_justificada": {
        "cantidad": 0,
        "porcentaje": 0.00
      },
      "falta_injustificada": {
        "cantidad": 1,
        "porcentaje": 3.57
      }
    },
    "alertas_generadas": {
      "tardanzas": 2,
      "faltas_injustificadas": 1,
      "patrones_criticos": 0
    },
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    },
    "fecha_registro": "2025-02-10T08:00:00Z"
  }
}
```

#### **Response Errors:**
- **404 Not Found - Sin registro:**
```json
{
  "success": false,
  "error": {
    "code": "NO_ATTENDANCE_RECORD",
    "message": "No hay registro de asistencia para 3ro de Primaria en la fecha 2025-02-10"
  }
}
```

### **Reglas de Negocio:**
- **RN-69:** Calcular porcentajes con 2 decimales
- **RN-70:** Para tardanzas, calcular promedio de minutos de retraso
- **RN-71:** Incluir conteo de alertas generadas
- **RN-72:** Mostrar información del usuario que registró

---

## **SECCIÓN 4: CENTRO DE PLANTILLAS**

### **15. Listar Tipos de Plantillas Disponibles**

**Endpoint:** `GET /plantillas/tipos`  
**Descripción:** Tipos de plantillas disponibles para descarga  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "plantillas": [
      {
        "id": "calificaciones",
        "nombre": "Plantilla de Calificaciones",
        "descripcion": "Formato oficial para carga de notas por componentes de evaluación",
        "icono": "📊",
        "tipo_archivo": "Excel (.xlsx)",
        "requiere_contexto": true,
        "contexto_requerido": ["nivel", "grado", "curso", "trimestre", "componente"],
        "guia_disponible": true
      },
      {
        "id": "asistencia",
        "nombre": "Plantilla de Asistencia Diaria",
        "descripcion": "Formato oficial para registro de asistencia con estados institucionales",
        "icono": "✅",
        "tipo_archivo": "Excel (.xlsx)",
        "requiere_contexto": true,
        "contexto_requerido": ["nivel", "grado", "fecha"],
        "guia_disponible": true
      }
    ],
    "total_plantillas": 2
  }
}
```

---

### **16. Generar Plantilla de Calificaciones (Centro de Plantillas)**

**Endpoint:** `POST /plantillas/calificaciones`  
**Descripción:** Genera plantilla desde Centro de Plantillas  
**Autenticación:** Bearer token (Roles: Docente, Director)  

*(Misma funcionalidad que `/calificaciones/plantilla` pero con acceso desde Centro de Plantillas)*

---

### **17. Generar Plantilla de Asistencia (Centro de Plantillas)**

**Endpoint:** `POST /plantillas/asistencia`  
**Descripción:** Genera plantilla desde Centro de Plantillas  
**Autenticación:** Bearer token (Roles: Docente, Director)  

*(Misma funcionalidad que `/asistencias/plantilla` pero con acceso desde Centro de Plantillas)*

---

### **18. Obtener Guía de Uso de Plantilla**

**Endpoint:** `GET /plantillas/guias/{tipo}`  
**Descripción:** Guía interactiva con instrucciones y ejemplos  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Path Parameters:**
```
{tipo} = calificaciones | asistencia
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "tipo": "calificaciones",
    "nombre": "Guía de Uso - Plantilla de Calificaciones",
    "secciones": [
      {
        "id": "instrucciones_generales",
        "titulo": "Instrucciones Generales",
        "contenido": "Pasos detallados para usar la plantilla...",
        "orden": 1
      },
      {
        "id": "ejemplos_visuales",
        "titulo": "Ejemplos Visuales",
        "contenido": "Capturas de pantalla con anotaciones...",
        "imagenes": [
          "/guias/calificaciones/ejemplo1.png",
          "/guias/calificaciones/ejemplo2.png"
        ],
        "orden": 2
      },
      {
        "id": "errores_comunes",
        "titulo": "Errores Comunes",
        "contenido": [
          {
            "error": "Modificar el orden de las columnas",
            "solucion": "Usa la plantilla sin cambios estructurales"
          },
          {
            "error": "Agregar columnas adicionales",
            "solucion": "Solo llena las columnas existentes"
          }
        ],
        "orden": 3
      },
      {
        "id": "preguntas_frecuentes",
        "titulo": "Preguntas Frecuentes",
        "contenido": [
          {
            "pregunta": "¿Puedo usar la misma plantilla para varios trimestres?",
            "respuesta": "No, descarga una plantilla nueva para cada trimestre."
          }
        ],
        "orden": 4
      }
    ],
    "version": "1.0",
    "fecha_actualizacion": "2025-02-01"
  }
}
```

---

### **19. Descargar Guía en PDF**

**Endpoint:** `GET /plantillas/guias/{tipo}/pdf`  
**Descripción:** Descarga guía completa en formato PDF  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Response Success (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Guia_Plantilla_Calificaciones.pdf"

[Binary PDF File]
```

---

## **CÓDIGOS DE ERROR ESPECÍFICOS DEL MÓDULO**

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `NO_COURSE_ASSIGNMENTS` | Docente sin asignaciones activas | 404 |
| `COURSE_ACCESS_DENIED` | Sin permisos para acceder al curso | 403 |
| `NIVEL_GRADO_NOT_FOUND` | Nivel/grado no existe | 404 |
| `STRUCTURE_NOT_CONFIGURED` | Estructura de evaluación no definida | 404 |
| `COMPONENT_NOT_FOUND` | Componente de evaluación no existe | 404 |
| `INVALID_TEMPLATE_STRUCTURE` | Estructura de plantilla incorrecta | 400 |
| `COMPONENT_MISMATCH` | Componente en archivo no coincide | 400 |
| `INVALID_DATE_FORMAT` | Formato de fecha inválido | 400 |
| `DATE_MISMATCH` | Fecha en archivo no coincide | 400 |
| `FUTURE_DATE_NOT_ALLOWED` | No se permiten fechas futuras | 400 |
| `DATE_OUT_OF_ACADEMIC_YEAR` | Fecha fuera del año académico | 400 |
| `VALIDATION_NOT_FOUND` | Validación no existe o expiró | 404 |
| `NO_VALID_RECORDS` | No hay registros válidos para procesar | 400 |
| `NO_STUDENTS_FOUND` | Sin estudiantes activos en el curso | 404 |
| `DUPLICATE_RECORD_EXISTS` | Registro duplicado existe | 409 |
| `NO_ATTENDANCE_RECORD` | Sin registro de asistencia | 404 |
| `INVALID_TIME_FORMAT` | Formato de hora inválido | 400 |
| `TIME_OUT_OF_RANGE` | Hora fuera de horario escolar | 400 |
| `MISSING_REQUIRED_FIELDS` | Campos requeridos faltantes | 400 |
| `MISSING_PARAMETERS` | Parámetros de query faltantes | 400 |
| `INVALID_PARAMETERS` | Parámetros inválidos | 400 |

---

# **Documentación API REST - Módulo de Mensajería**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semana 9 - 2025  
**Versión:** 1.0 - Comunicación Padre-Docente  

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** `https://api.orquideas.edu.pe`

### **Autenticación JWT**
- Todos los endpoints requieren autenticación
- Incluir en cada request: `Authorization: Bearer <token>`
- Roles autorizados: **Padre/Apoderado** y **Docente**

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

## **SECCIÓN 1: BANDEJA DE MENSAJERÍA (HU-MSG-00)**

### **1. Obtener Lista de Conversaciones del Usuario**

**Endpoint:** `GET /conversaciones`  
**Descripción:** Obtiene todas las conversaciones del usuario autenticado con paginación y filtros  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=20                    # Registros por página (default: 20, max: 50)
&filtro=todos                # Filtro de bandeja: todos, recibidos, enviados (default: todos)
&estudiante_id=est_001       # Filtrar por estudiante específico (opcional)
&curso_id=cur_001            # Filtrar por curso específico (opcional)
&grado=3                     # Filtrar por grado (opcional, solo docentes)
&estado=activa               # Estado: activa, cerrada (default: activa)
&busqueda=tarea              # Búsqueda por texto (min 2 caracteres) (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "usr_pad_001",
      "nombre": "Juan Carlos Pérez López",
      "rol": "padre"
    },
    "conversaciones": [
      {
        "id": "conv_001",
        "asunto": "Consulta sobre tarea de matemáticas",
        "estudiante": {
          "id": "est_001",
          "nombre_completo": "María Elena Pérez García",
          "codigo_estudiante": "P3001"
        },
        "curso": {
          "id": "cur_001",
          "nombre": "Matemáticas",
          "nivel_grado": {
            "nivel": "Primaria",
            "grado": "3"
          }
        },
        "otro_usuario": {
          "id": "usr_doc_001",
          "nombre_completo": "Prof. Ana María Rodríguez Vega",
          "rol": "docente",
          "avatar_url": null
        },
        "ultimo_mensaje": {
          "id": "msg_045",
          "contenido": "Gracias por la aclaración, profesora...",
          "emisor_id": "usr_pad_001",
          "fecha_envio": "2025-10-09T14:30:00Z",
          "fecha_envio_relativa": "14:30",
          "tiene_adjuntos": false,
          "estado_lectura": "leido"
        },
        "fecha_ultimo_mensaje": "2025-10-09T14:30:00Z",
        "mensajes_no_leidos": 0,
        "estado": "activa",
        "iniciado_por": "padre",
        "fecha_inicio": "2025-10-08T10:15:00Z"
      },
      {
        "id": "conv_002",
        "asunto": "Permiso para salida anticipada",
        "estudiante": {
          "id": "est_001",
          "nombre_completo": "María Elena Pérez García",
          "codigo_estudiante": "P3001"
        },
        "curso": {
          "id": "cur_002",
          "nombre": "Comunicación",
          "nivel_grado": {
            "nivel": "Primaria",
            "grado": "3"
          }
        },
        "otro_usuario": {
          "id": "usr_doc_002",
          "nombre_completo": "Prof. Carlos Méndez Torres",
          "rol": "docente",
          "avatar_url": null
        },
        "ultimo_mensaje": {
          "id": "msg_023",
          "contenido": "Buenos días, necesito solicitar...",
          "emisor_id": "usr_pad_001",
          "fecha_envio": "2025-10-08T08:45:00Z",
          "fecha_envio_relativa": "Ayer",
          "tiene_adjuntos": true,
          "estado_lectura": "entregado"
        },
        "fecha_ultimo_mensaje": "2025-10-08T08:45:00Z",
        "mensajes_no_leidos": 1,
        "estado": "activa",
        "iniciado_por": "padre",
        "fecha_inicio": "2025-10-08T08:45:00Z"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total_conversaciones": 8,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "contadores": {
      "total": 8,
      "recibidas": 5,
      "enviadas": 3,
      "no_leidas": 2
    }
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Parámetros inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "El parámetro 'filtro' debe ser: todos, recibidos o enviados"
  }
}
```

- **404 Not Found - Sin conversaciones:**
```json
{
  "success": false,
  "error": {
    "code": "NO_CONVERSATIONS_FOUND",
    "message": "No tiene conversaciones registradas"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Padre solo ve conversaciones de sus hijos vinculados en `relaciones_familiares`
- **RN-02:** Docente solo ve conversaciones de estudiantes de sus cursos asignados
- **RN-03:** Ordenar por `fecha_ultimo_mensaje` descendente (más reciente primero)
- **RN-04:** Conversaciones no leídas siempre al inicio, independiente del orden
- **RN-05:** Formato de fecha relativa:
  - Hoy: "HH:MM"
  - Ayer: "Ayer"
  - Otros: "DD/MM/YYYY"
- **RN-06:** Búsqueda aplica sobre: `asunto`, `contenido de mensajes`, `nombre del otro usuario`

---

### **2. Obtener Contador de Mensajes No Leídos**

**Endpoint:** `GET /conversaciones/no-leidas/count`  
**Descripción:** Devuelve el número total de mensajes no leídos del usuario  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_no_leidos": 5,
    "por_conversacion": [
      {
        "conversacion_id": "conv_002",
        "asunto": "Permiso para salida anticipada",
        "mensajes_no_leidos": 1,
        "ultimo_mensaje_fecha": "2025-10-08T08:45:00Z"
      },
      {
        "conversacion_id": "conv_005",
        "asunto": "Consulta sobre conducta",
        "mensajes_no_leidos": 4,
        "ultimo_mensaje_fecha": "2025-10-09T16:20:00Z"
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-07:** Solo contar mensajes donde el usuario actual es el destinatario
- **RN-08:** Solo contar mensajes con `estado_lectura != 'leido'`
- **RN-09:** Excluir conversaciones cerradas del contador

---

### **3. Verificar Actualizaciones de Conversaciones (Polling)**

**Endpoint:** `GET /conversaciones/actualizaciones`  
**Descripción:** Verifica si hay nuevos mensajes desde el último check (para polling)  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Query Parameters:**
```
?ultimo_check=2025-10-09T14:30:00Z  # Timestamp del último polling (ISO 8601) (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": true,
    "nuevos_mensajes": [
      {
        "conversacion_id": "conv_003",
        "mensaje_id": "msg_078",
        "emisor": {
          "id": "usr_doc_003",
          "nombre": "Prof. María González"
        },
        "contenido_preview": "Respecto a tu consulta sobre...",
        "fecha_envio": "2025-10-09T14:35:00Z",
        "tiene_adjuntos": false
      }
    ],
    "total_nuevos_mensajes": 1,
    "conversaciones_actualizadas": ["conv_003"],
    "contador_no_leidos": 3
  }
}
```

#### **Response Success (200) - Sin actualizaciones:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": false,
    "nuevos_mensajes": [],
    "total_nuevos_mensajes": 0,
    "conversaciones_actualizadas": [],
    "contador_no_leidos": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-10:** Comparar `fecha_envio` de mensajes con `ultimo_check`
- **RN-11:** Solo mensajes donde el usuario actual es destinatario
- **RN-12:** Excluir mensajes propios del usuario
- **RN-13:** Actualizar badge de contador en respuesta

---

### **4. Marcar Conversación como Leída**

**Endpoint:** `PATCH /conversaciones/:id/marcar-leida`  
**Descripción:** Marca todos los mensajes no leídos de una conversación como leídos  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Path Parameters:**
```
{id} = ID de la conversación
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversacion_id": "conv_002",
    "mensajes_actualizados": 3,
    "nuevo_contador_no_leidos": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-14:** Solo actualizar mensajes del otro usuario (no los propios)
- **RN-15:** Actualizar `estado_lectura` a `'leido'`
- **RN-16:** Registrar `fecha_lectura` con timestamp actual
- **RN-17:** Validar que el usuario tiene acceso a la conversación

---

### **5. Cerrar/Archivar Conversación**

**Endpoint:** `PATCH /conversaciones/:id/cerrar`  
**Descripción:** Cambia el estado de la conversación a cerrada (archivada)  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Path Parameters:**
```
{id} = ID de la conversación
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversacion_id": "conv_004",
    "estado": "cerrada",
    "fecha_cierre": "2025-10-09T15:00:00Z",
    "mensaje": "Conversación archivada correctamente"
  }
}
```

### **Reglas de Negocio:**
- **RN-18:** Solo el creador de la conversación puede cerrarla
- **RN-19:** Conversaciones cerradas no aparecen en bandeja principal (filtro `estado=activa`)
- **RN-20:** Se pueden reabrir cambiando estado a `'activa'` (funcionalidad futura)
- **RN-21:** No se pueden enviar mensajes en conversaciones cerradas

---

## **SECCIÓN 2: ENVIAR NUEVO MENSAJE - PADRE (HU-MSG-01)**

### **6. Obtener Hijos del Padre Autenticado**

**Endpoint:** `GET /usuarios/hijos`  
**Descripción:** Lista los hijos vinculados al padre para selección en nuevo mensaje  
**Autenticación:** Bearer token (Rol: Padre)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "padre": {
      "id": "usr_pad_001",
      "nombre": "Juan Carlos Pérez López"
    },
    "hijos": [
      {
        "id": "est_001",
        "codigo_estudiante": "P3001",
        "nombre_completo": "María Elena Pérez García",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3",
          "descripcion": "3ro de Primaria"
        },
        "estado_matricula": "activo"
      },
      {
        "id": "est_002",
        "codigo_estudiante": "P5008",
        "nombre_completo": "Carlos Alberto Pérez García",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "5",
          "descripcion": "5to de Primaria"
        },
        "estado_matricula": "activo"
      }
    ],
    "total_hijos": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-22:** Solo mostrar hijos con `estado_matricula = 'activo'`
- **RN-23:** Ordenar alfabéticamente por apellido, nombre
- **RN-24:** Validar relación activa en `relaciones_familiares`

---

### **7. Obtener Cursos del Estudiante**

**Endpoint:** `GET /cursos/estudiante/:estudiante_id`  
**Descripción:** Lista cursos del estudiante para selección de contexto  
**Autenticación:** Bearer token (Rol: Padre)  

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025  # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "nombre_completo": "María Elena Pérez García"
    },
    "año_academico": 2025,
    "cursos": [
      {
        "id": "cur_001",
        "codigo_curso": "CP3001",
        "nombre": "Matemáticas",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3"
        }
      },
      {
        "id": "cur_002",
        "codigo_curso": "CP3002",
        "nombre": "Comunicación",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3"
        }
      }
    ],
    "total_cursos": 8
  }
}
```

### **Reglas de Negocio:**
- **RN-25:** Validar que padre tiene acceso al estudiante
- **RN-26:** Solo cursos del año académico especificado
- **RN-27:** Solo cursos con docentes asignados activos
- **RN-28:** Ordenar alfabéticamente por nombre de curso

---

### **8. Obtener Docentes del Curso**

**Endpoint:** `GET /docentes/curso/:curso_id`  
**Descripción:** Lista docentes asignados al curso para selección de destinatario  
**Autenticación:** Bearer token (Rol: Padre)  

#### **Path Parameters:**
```
{curso_id} = ID del curso
```

#### **Query Parameters:**
```
?año=2025  # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "curso": {
      "id": "cur_001",
      "nombre": "Matemáticas"
    },
    "docentes": [
      {
        "id": "usr_doc_001",
        "nombre_completo": "Prof. Ana María Rodríguez Vega",
        "telefono": "+51987654321",
        "avatar_url": null
      }
    ],
    "total_docentes": 1
  }
}
```

### **Reglas de Negocio:**
- **RN-29:** Solo docentes con `estado_activo = true`
- **RN-30:** Solo docentes con asignación activa en `asignaciones_docente_curso`
- **RN-31:** Verificar que asignación corresponde al año académico especificado

---

### **9. Verificar Conversación Existente**

**Endpoint:** `GET /conversaciones/existe`  
**Descripción:** Verifica si ya existe una conversación con el mismo contexto  
**Autenticación:** Bearer token (Rol: Padre)  

#### **Query Parameters:**
```
?padre_id=usr_pad_001         # ID del padre (desde token JWT)
&docente_id=usr_doc_001       # ID del docente seleccionado (requerido)
&estudiante_id=est_001        # ID del estudiante (requerido)
&curso_id=cur_001             # ID del curso (requerido)
```

#### **Response Success (200) - Conversación existente:**
```json
{
  "success": true,
  "data": {
    "existe": true,
    "conversacion": {
      "id": "conv_001",
      "asunto": "Consulta sobre tarea de matemáticas",
      "fecha_inicio": "2025-10-08T10:15:00Z",
      "total_mensajes": 8,
      "ultimo_mensaje_fecha": "2025-10-09T14:30:00Z"
    },
    "mensaje": "Ya existe una conversación activa con este docente sobre este estudiante"
  }
}
```

#### **Response Success (200) - Sin conversación:**
```json
{
  "success": true,
  "data": {
    "existe": false,
    "conversacion": null,
    "mensaje": "No existe conversación previa, se creará una nueva"
  }
}
```

### **Reglas de Negocio:**
- **RN-32:** Buscar conversación con mismo padre, docente, estudiante y curso
- **RN-33:** Solo considerar conversaciones con `estado = 'activa'`
- **RN-34:** Si existe, mostrar modal de confirmación en frontend

---

### **10. Crear Nueva Conversación y Enviar Primer Mensaje**

**Endpoint:** `POST /conversaciones`  
**Descripción:** Crea nueva conversación y envía primer mensaje con archivos opcionales  
**Autenticación:** Bearer token (Rol: Padre)  

#### **Request Body (multipart/form-data):**
```
estudiante_id: est_001                    # ID del estudiante (requerido)
curso_id: cur_001                         # ID del curso (requerido)
docente_id: usr_doc_001                   # ID del docente (requerido)
asunto: Consulta sobre tarea              # Asunto (10-200 caracteres) (requerido)
mensaje: Buenos días, quería consultar... # Contenido (10-1000 caracteres) (requerido)
archivos: [File, File]                    # Archivos adjuntos (max 3, 5MB c/u) (opcional)
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "conversacion": {
      "id": "conv_009",
      "asunto": "Consulta sobre tarea",
      "estudiante_id": "est_001",
      "curso_id": "cur_001",
      "padre_id": "usr_pad_001",
      "docente_id": "usr_doc_001",
      "estado": "activa",
      "fecha_inicio": "2025-10-10T10:00:00Z",
      "fecha_ultimo_mensaje": "2025-10-10T10:00:00Z",
      "tipo_conversacion": "padre_docente",
      "creado_por": "usr_pad_001"
    },
    "mensaje": {
      "id": "msg_089",
      "conversacion_id": "conv_009",
      "emisor_id": "usr_pad_001",
      "contenido": "Buenos días, quería consultar...",
      "fecha_envio": "2025-10-10T10:00:00Z",
      "estado_lectura": "enviado",
      "tiene_adjuntos": true
    },
    "archivos_adjuntos": [
      {
        "id": "arch_001",
        "mensaje_id": "msg_089",
        "nombre_original": "tarea_matematicas.pdf",
        "nombre_archivo": "1728554400_tarea_matematicas.pdf",
        "url_cloudinary": "https://res.cloudinary.com/.../tarea_matematicas.pdf",
        "tipo_mime": "application/pdf",
        "tamaño_bytes": 2457600,
        "fecha_subida": "2025-10-10T10:00:00Z"
      }
    ],
    "notificacion": {
      "enviada": true,
      "canales": ["plataforma", "whatsapp"],
      "destinatario_id": "usr_doc_001"
    }
  },
  "message": "Conversación creada y mensaje enviado correctamente"
}
```

#### **Response Errors:**
- **400 Bad Request - Validación de campos:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El asunto debe tener entre 10 y 200 caracteres",
    "details": {
      "field": "asunto",
      "value": "Hola",
      "constraint": "minLength: 10, maxLength: 200"
    }
  }
}
```

- **400 Bad Request - Validación de archivos:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_VALIDATION_ERROR",
    "message": "El archivo 'documento.docx' no es un tipo permitido",
    "details": {
      "allowed_types": ["application/pdf", "image/jpeg", "image/png"],
      "received_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
  }
}
```

- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "No tiene permisos para enviar mensajes a este docente sobre este estudiante"
  }
}
```

- **413 Payload Too Large - Archivo muy grande:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "El archivo 'imagen.jpg' excede el tamaño máximo de 5MB",
    "details": {
      "file_size": 7340032,
      "max_size": 5242880
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-35:** Validar que padre tiene acceso al estudiante en `relaciones_familiares`
- **RN-36:** Validar que docente está asignado al curso en `asignaciones_docente_curso`
- **RN-37:** Asunto: 10-200 caracteres
- **RN-38:** Mensaje: 10-1000 caracteres
- **RN-39:** Archivos: máximo 3, 5MB cada uno, tipos: PDF, JPG, PNG
- **RN-40:** Validar tipo MIME real del archivo (no solo extensión)
- **RN-41:** Subir archivos a Cloudinary antes de crear registros en BD
- **RN-42:** Transacción atómica: si falla subida de archivos, no crear conversación
- **RN-43:** Generar notificación automática al docente (plataforma + WhatsApp)
- **RN-44:** Actualizar `fecha_ultimo_mensaje` en conversación

---

## **SECCIÓN 3: VER CONVERSACIÓN Y CHAT (HU-MSG-03)**

### **11. Obtener Conversación Completa**

**Endpoint:** `GET /conversaciones/:id`  
**Descripción:** Obtiene detalles completos de una conversación específica  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Path Parameters:**
```
{id} = ID de la conversación
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversacion": {
      "id": "conv_001",
      "asunto": "Consulta sobre tarea de matemáticas",
      "estudiante": {
        "id": "est_001",
        "codigo_estudiante": "P3001",
        "nombre_completo": "María Elena Pérez García"
      },
      "curso": {
        "id": "cur_001",
        "nombre": "Matemáticas",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3",
          "descripcion": "3ro de Primaria"
        }
      },
      "padre": {
        "id": "usr_pad_001",
        "nombre_completo": "Juan Carlos Pérez López",
        "telefono": "+51987654321",
        "avatar_url": null
      },
      "docente": {
        "id": "usr_doc_001",
        "nombre_completo": "Prof. Ana María Rodríguez Vega",
        "telefono": "+51912345678",
        "avatar_url": null
      },
      "estado": "activa",
      "fecha_inicio": "2025-10-08T10:15:00Z",
      "fecha_ultimo_mensaje": "2025-10-09T14:30:00Z",
      "tipo_conversacion": "padre_docente",
      "iniciado_por": "padre"
    },
    "otro_usuario": {
      "id": "usr_doc_001",
      "nombre_completo": "Prof. Ana María Rodríguez Vega",
      "rol": "docente",
      "avatar_url": null
    },
    "permisos": {
      "puede_enviar_mensajes": true,
      "puede_cerrar_conversacion": true,
      "es_creador": true
    }
  }
}
```

#### **Response Errors:**
- **403 Forbidden - Sin acceso:**
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "No tiene permisos para ver esta conversación"
  }
}
```

- **404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "La conversación no existe o ha sido eliminada"
  }
}
```

### **Reglas de Negocio:**
- **RN-45:** Validar que usuario autenticado es participante de la conversación
- **RN-46:** Padre valida acceso vía `relaciones_familiares`
- **RN-47:** Docente valida acceso vía `asignaciones_docente_curso`
- **RN-48:** Determinar permisos según rol y relación con la conversación

---

### **12. Obtener Mensajes de una Conversación (Paginados)**

**Endpoint:** `GET /mensajes`  
**Descripción:** Lista mensajes de una conversación con paginación y lazy loading  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Query Parameters:**
```
?conversacion_id=conv_001    # ID de la conversación (requerido)
&limit=50                    # Mensajes por página (default: 50)
&offset=0                    # Desplazamiento (default: 0)
&orden=asc                   # Orden: asc (antiguo->reciente), desc (reciente->antiguo) (default: asc)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversacion_id": "conv_001",
    "mensajes": [
      {
        "id": "msg_001",
        "conversacion_id": "conv_001",
        "emisor": {
          "id": "usr_pad_001",
          "nombre_completo": "Juan Carlos Pérez López",
          "rol": "padre",
          "es_usuario_actual": true
        },
        "contenido": "Buenos días, profesora. Quería consultar sobre la tarea de matemáticas de esta semana.",
        "fecha_envio": "2025-10-08T10:15:00Z",
        "fecha_envio_legible": "8 de octubre de 2025, 10:15",
        "fecha_envio_relativa": "Hace 2 días",
        "estado_lectura": "leido",
        "fecha_lectura": "2025-10-08T14:20:00Z",
        "tiene_adjuntos": false,
        "archivos_adjuntos": []
      },
      {
        "id": "msg_002",
        "conversacion_id": "conv_001",
        "emisor": {
          "id": "usr_doc_001",
          "nombre_completo": "Prof. Ana María Rodríguez Vega",
          "rol": "docente",
          "es_usuario_actual": false
        },
        "contenido": "Buenos días, Sr. Pérez. Con gusto le ayudo. ¿Cuál es su consulta específica?",
        "fecha_envio": "2025-10-08T14:20:00Z",
        "fecha_envio_legible": "8 de octubre de 2025, 14:20",
        "fecha_envio_relativa": "Hace2 días",
        "estado_lectura": "leido",
        "fecha_lectura": "2025-10-08T15:10:00Z",
        "tiene_adjuntos": false,
        "archivos_adjuntos": []
      },
      {
        "id": "msg_003",
        "conversacion_id": "conv_001",
        "emisor": {
          "id": "usr_pad_001",
          "nombre_completo": "Juan Carlos Pérez López",
          "rol": "padre",
          "es_usuario_actual": true
        },
        "contenido": "Le adjunto la página del libro donde mi hija tiene dudas sobre el ejercicio 5.",
        "fecha_envio": "2025-10-08T15:10:00Z",
        "fecha_envio_legible": "8 de octubre de 2025, 15:10",
        "fecha_envio_relativa": "Hace 2 días",
        "estado_lectura": "leido",
        "fecha_lectura": "2025-10-08T16:00:00Z",
        "tiene_adjuntos": true,
        "archivos_adjuntos": [
          {
            "id": "arch_001",
            "mensaje_id": "msg_003",
            "nombre_original": "pagina_libro_matematicas.jpg",
            "nombre_archivo": "1728396600_pagina_libro_matematicas.jpg",
            "url_cloudinary": "https://res.cloudinary.com/.../pagina_libro_matematicas.jpg",
            "tipo_mime": "image/jpeg",
            "tamaño_bytes": 1843200,
            "tamaño_legible": "1.8 MB",
            "fecha_subida": "2025-10-08T15:10:00Z",
            "es_imagen": true
          }
        ]
      },
      {
        "id": "msg_004",
        "conversacion_id": "conv_001",
        "emisor": {
          "id": "usr_doc_001",
          "nombre_completo": "Prof. Ana María Rodríguez Vega",
          "rol": "docente",
          "es_usuario_actual": false
        },
        "contenido": "Perfecto, ya veo el ejercicio. Le explico paso a paso en el documento adjunto.",
        "fecha_envio": "2025-10-09T09:30:00Z",
        "fecha_envio_legible": "9 de octubre de 2025, 09:30",
        "fecha_envio_relativa": "Ayer",
        "estado_lectura": "leido",
        "fecha_lectura": "2025-10-09T10:05:00Z",
        "tiene_adjuntos": true,
        "archivos_adjuntos": [
          {
            "id": "arch_002",
            "mensaje_id": "msg_004",
            "nombre_original": "explicacion_ejercicio_5.pdf",
            "nombre_archivo": "1728462600_explicacion_ejercicio_5.pdf",
            "url_cloudinary": "https://res.cloudinary.com/.../explicacion_ejercicio_5.pdf",
            "tipo_mime": "application/pdf",
            "tamaño_bytes": 524288,
            "tamaño_legible": "512 KB",
            "fecha_subida": "2025-10-09T09:30:00Z",
            "es_imagen": false
          }
        ]
      },
      {
        "id": "msg_005",
        "conversacion_id": "conv_001",
        "emisor": {
          "id": "usr_pad_001",
          "nombre_completo": "Juan Carlos Pérez López",
          "rol": "padre",
          "es_usuario_actual": true
        },
        "contenido": "Muchísimas gracias, profesora. Quedó muy claro con su explicación.",
        "fecha_envio": "2025-10-09T14:30:00Z",
        "fecha_envio_legible": "9 de octubre de 2025, 14:30",
        "fecha_envio_relativa": "Hace 5 horas",
        "estado_lectura": "leido",
        "fecha_lectura": "2025-10-09T15:00:00Z",
        "tiene_adjuntos": false,
        "archivos_adjuntos": []
      }
    ],
    "paginacion": {
      "limit": 50,
      "offset": 0,
      "total_mensajes": 5,
      "tiene_mas": false
    },
    "separadores_fecha": {
      "2025-10-08": "8 de octubre de 2025",
      "2025-10-09": "Ayer"
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-49:** Validar acceso del usuario a la conversación
- **RN-50:** Orden ascendente por defecto (más antiguo primero) para chat
- **RN-51:** Flag `es_usuario_actual` para diferenciar burbujas en frontend
- **RN-52:** Formato de fecha relativa:
  - Últimas 24 horas: "Hace X horas/minutos"
  - Ayer: "Ayer"
  - Otros: "DD de MMM de YYYY"
- **RN-53:** Agrupar separadores por fecha para frontend
- **RN-54:** Incluir información completa de archivos adjuntos
- **RN-55:** Marcar si archivo es imagen para mostrar preview

---

### **13. Enviar Mensaje en Conversación Existente**

**Endpoint:** `POST /mensajes`  
**Descripción:** Envía un nuevo mensaje en una conversación existente con archivos opcionales  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Request Body (multipart/form-data):**
```
conversacion_id: conv_001                  # ID de la conversación (requerido)
contenido: Gracias por la explicación...   # Contenido del mensaje (10-1000 caracteres) (requerido)
archivos: [File, File]                     # Archivos adjuntos (max 3, 5MB c/u) (opcional)
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "mensaje": {
      "id": "msg_090",
      "conversacion_id": "conv_001",
      "emisor": {
        "id": "usr_pad_001",
        "nombre_completo": "Juan Carlos Pérez López",
        "rol": "padre",
        "es_usuario_actual": true
      },
      "contenido": "Gracias por la explicación, profesora. Muy clara.",
      "fecha_envio": "2025-10-10T10:30:00Z",
      "fecha_envio_legible": "10 de octubre de 2025, 10:30",
      "fecha_envio_relativa": "Ahora",
      "estado_lectura": "enviado",
      "fecha_lectura": null,
      "tiene_adjuntos": false,
      "archivos_adjuntos": []
    },
    "conversacion_actualizada": {
      "fecha_ultimo_mensaje": "2025-10-10T10:30:00Z"
    },
    "notificacion": {
      "enviada": true,
      "canales": ["plataforma", "whatsapp"],
      "destinatario_id": "usr_doc_001"
    }
  },
  "message": "Mensaje enviado correctamente"
}
```

#### **Response Errors:**
- **400 Bad Request - Validación de contenido:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El mensaje debe tener entre 10 y 1000 caracteres",
    "details": {
      "field": "contenido",
      "minLength": 10,
      "maxLength": 1000,
      "current": 5
    }
  }
}
```

- **403 Forbidden - Conversación cerrada:**
```json
{
  "success": false,
  "error": {
    "code": "CONVERSATION_CLOSED",
    "message": "No se pueden enviar mensajes en una conversación cerrada"
  }
}
```

- **403 Forbidden - Docente sin permisos (MVP):**
```json
{
  "success": false,
  "error": {
    "code": "ACTION_NOT_ALLOWED",
    "message": "Los docentes solo pueden responder a conversaciones iniciadas por padres en esta versión"
  }
}
```

### **Reglas de Negocio:**
- **RN-56:** Validar acceso del usuario a la conversación
- **RN-57:** Mensaje: 10-1000 caracteres
- **RN-58:** Archivos: máximo 3, 5MB cada uno, tipos: PDF, JPG, PNG
- **RN-59:** Validar tipo MIME real del archivo
- **RN-60:** Subir archivos a Cloudinary antes de crear mensaje
- **RN-61:** Transacción atómica: si falla subida, no crear mensaje
- **RN-62:** Actualizar `fecha_ultimo_mensaje` en conversación
- **RN-63:** Generar notificación automática al destinatario
- **RN-64:** **MVP:** Validar que docentes solo responden (no inician)
- **RN-65:** No permitir mensajes en conversaciones cerradas

---

### **14. Marcar Mensajes como Leídos (Batch)**

**Endpoint:** `PATCH /mensajes/marcar-leidos`  
**Descripción:** Marca múltiples mensajes como leídos al abrir conversación  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Request Body (JSON):**
```json
{
  "conversacion_id": "conv_001",
  "mensajes_ids": ["msg_078", "msg_079", "msg_080"]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversacion_id": "conv_001",
    "mensajes_actualizados": 3,
    "fecha_lectura": "2025-10-10T10:35:00Z"
  }
}
```

### **Reglas de Negocio:**
- **RN-66:** Solo marcar mensajes del otro usuario (no propios)
- **RN-67:** Solo actualizar mensajes con `estado_lectura != 'leido'`
- **RN-68:** Actualizar `estado_lectura` a `'leido'`
- **RN-69:** Registrar `fecha_lectura` con timestamp actual
- **RN-70:** Validar que todos los mensajes pertenecen a la conversación especificada

---

### **15. Verificar Nuevos Mensajes en Conversación (Polling)**

**Endpoint:** `GET /mensajes/nuevos`  
**Descripción:** Verifica si hay mensajes nuevos desde el último mensaje conocido  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Query Parameters:**
```
?conversacion_id=conv_001              # ID de la conversación (requerido)
&ultimo_mensaje_id=msg_089             # ID del último mensaje conocido (requerido)
```

#### **Response Success (200) - Con nuevos mensajes:**
```json
{
  "success": true,
  "data": {
    "hay_nuevos_mensajes": true,
    "nuevos_mensajes": [
      {
        "id": "msg_090",
        "conversacion_id": "conv_001",
        "emisor": {
          "id": "usr_doc_001",
          "nombre_completo": "Prof. Ana María Rodríguez Vega",
          "rol": "docente",
          "es_usuario_actual": false
        },
        "contenido": "De nada, estoy para ayudarlos.",
        "fecha_envio": "2025-10-10T10:32:00Z",
        "fecha_envio_legible": "10 de octubre de 2025, 10:32",
        "fecha_envio_relativa": "Ahora",
        "estado_lectura": "entregado",
        "fecha_lectura": null,
        "tiene_adjuntos": false,
        "archivos_adjuntos": []
      }
    ],
    "total_nuevos_mensajes": 1
  }
}
```

#### **Response Success (200) - Sin nuevos mensajes:**
```json
{
  "success": true,
  "data": {
    "hay_nuevos_mensajes": false,
    "nuevos_mensajes": [],
    "total_nuevos_mensajes": 0
  }
}
```

### **Reglas de Negocio:**
- **RN-71:** Buscar mensajes con ID mayor al `ultimo_mensaje_id` especificado
- **RN-72:** Ordenar por fecha ascendente
- **RN-73:** Incluir información completa de archivos adjuntos
- **RN-74:** Polling recomendado cada 10 segundos durante sesión activa

---

### **16. Subir Archivo a Cloudinary**

**Endpoint:** `POST /archivos/upload`  
**Descripción:** Endpoint auxiliar para subir archivos antes de enviar mensaje  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Request Body (multipart/form-data):**
```
archivo: [File]                          # Archivo a subir (requerido)
contexto: mensaje                        # Contexto del archivo: mensaje, perfil (requerido)
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "archivo": {
      "nombre_original": "documento.pdf",
      "nombre_archivo": "1728554700_documento.pdf",
      "url_cloudinary": "https://res.cloudinary.com/.../1728554700_documento.pdf",
      "url_thumbnail": null,
      "tipo_mime": "application/pdf",
      "tamaño_bytes": 2457600,
      "tamaño_legible": "2.4 MB",
      "es_imagen": false,
      "fecha_subida": "2025-10-10T10:45:00Z"
    }
  },
  "message": "Archivo subido correctamente"
}
```

#### **Response Errors:**
- **400 Bad Request - Tipo no permitido:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TYPE_NOT_ALLOWED",
    "message": "Solo se permiten archivos PDF, JPG y PNG",
    "details": {
      "allowed_types": ["application/pdf", "image/jpeg", "image/png"],
      "received_type": "application/msword"
    }
  }
}
```

- **413 Payload Too Large:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "El archivo excede el tamaño máximo de 5MB",
    "details": {
      "file_size": 6291456,
      "max_size": 5242880,
      "file_name": "documento_grande.pdf"
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-75:** Tipos permitidos: `application/pdf`, `image/jpeg`, `image/png`
- **RN-76:** Tamaño máximo: 5MB (5,242,880 bytes)
- **RN-77:** Validar tipo MIME real, no solo extensión
- **RN-78:** Generar nombre único con timestamp
- **RN-79:** Para imágenes JPG/PNG, generar thumbnail de 200x200px
- **RN-80:** Almacenar en carpeta organizada: `/mensajeria/año/mes/`

---

### **17. Descargar Archivo Adjunto**

**Endpoint:** `GET /archivos/:id/download`  
**Descripción:** Descarga directa de archivo adjunto desde Cloudinary  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Path Parameters:**
```
{id} = ID del archivo adjunto
```

#### **Response Success (200):**
```
Content-Type: [tipo MIME del archivo]
Content-Disposition: attachment; filename="nombre_original.pdf"

[Binary File Stream]
```

#### **Response Errors:**
- **403 Forbidden - Sin acceso:**
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "No tiene permisos para descargar este archivo"
  }
}
```

- **404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "El archivo no existe o ha sido eliminado"
  }
}
```

### **Reglas de Negocio:**
- **RN-81:** Validar que usuario tiene acceso a la conversación del mensaje
- **RN-82:** Redirigir a URL de Cloudinary con token temporal
- **RN-83:** Registrar descarga en logs de auditoría
- **RN-84:** Headers de Content-Disposition para forzar descarga

---

## **SECCIÓN 4: NOTIFICACIONES (HU-MSG-04)**

### **18. Crear Notificación de Mensaje**

**Endpoint:** `POST /notificaciones`  
**Descripción:** Endpoint interno para crear notificación de nuevo mensaje  
**Autenticación:** Bearer token (Sistema interno)  

#### **Request Body (JSON):**
```json
{
  "usuario_id": "usr_doc_001",
  "tipo": "mensaje",
  "titulo": "Nuevo mensaje de Juan Carlos Pérez",
  "contenido": "Buenos días, quería consultar sobre la tarea...",
  "canal": "ambos",
  "url_destino": "/dashboard/mensajeria/conversacion/conv_001",
  "estudiante_id": "est_001",
  "referencia_id": "msg_089",
  "datos_adicionales": {
    "conversacion_id": "conv_001",
    "asunto": "Consulta sobre tarea de matemáticas",
    "tiene_adjuntos": true
  }
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "notificacion": {
      "id": "notif_089",
      "usuario_id": "usr_doc_001",
      "tipo": "mensaje",
      "titulo": "Nuevo mensaje de Juan Carlos Pérez",
      "contenido": "Buenos días, quería consultar sobre la tarea...",
      "canal": "ambos",
      "estado_plataforma": "pendiente",
      "estado_whatsapp": "pendiente",
      "fecha_creacion": "2025-10-10T10:00:00Z",
      "url_destino": "/dashboard/mensajeria/conversacion/conv_001"
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-85:** Generar automáticamente al enviar mensaje
- **RN-86:** Canal `"ambos"` para plataforma + WhatsApp
- **RN-87:** Truncar contenido a 100 caracteres para preview
- **RN-88:** URL destino apunta directamente a la conversación

---

### **19. Enviar Notificación WhatsApp**

**Endpoint:** `POST /notificaciones/whatsapp`  
**Descripción:** Envía mensaje de notificación vía Meta WhatsApp Cloud API  
**Autenticación:** Bearer token (Sistema interno)  

#### **Request Body (JSON):**
```json
{
  "notificacion_id": "notif_089",
  "usuario_id": "usr_doc_001",
  "telefono": "+51912345678",
  "tipo": "mensaje",
  "datos": {
    "emisor": "Juan Carlos Pérez López",
    "estudiante": "María Elena Pérez García",
    "asunto": "Consulta sobre tarea de matemáticas",
    "contenido_preview": "Buenos días, quería consultar sobre la tarea...",
    "url": "https://orquideas.edu.pe/mensajeria/conv_001"
  }
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "notificacion_id": "notif_089",
    "whatsapp_message_id": "wamid.HBgNNTE5MTIzNDU2NzgVAgARGBI5OUJDQTM3RTcyRjAyRDMyQjIA",
    "estado": "enviado",
    "fecha_envio": "2025-10-10T10:00:05Z",
    "telefono_destino": "+51912345678"
  }
}
```

#### **Response Errors:**
- **500 Internal Server Error - Error de WhatsApp API:**
```json
{
  "success": false,
  "error": {
    "code": "WHATSAPP_API_ERROR",
    "message": "Error al enviar mensaje de WhatsApp",
    "details": {
      "whatsapp_error": "Invalid phone number format",
      "telefono": "+51912345678"
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-89:** Formato de mensaje WhatsApp:
  ```
  💬 Nuevo mensaje de [Emisor]
  Sobre: [Estudiante]
  Asunto: [Asunto]
  
  Mensaje: [Preview 100 caracteres...]
  
  📱 Ver mensaje completo: [URL]
  ```
- **RN-90:** Actualizar `estado_whatsapp` en tabla `notificaciones`
- **RN-91:** Guardar `whatsapp_message_id` para tracking
- **RN-92:** Registrar timestamp de envío
- **RN-93:** Retry automático hasta 3 intentos si falla

---

### **20. Obtener Notificaciones del Usuario**

**Endpoint:** `GET /notificaciones`  
**Descripción:** Lista notificaciones del usuario con filtros  
**Autenticación:** Bearer token (Rol: Padre/Docente)  

#### **Query Parameters:**
```
?tipo=mensaje                 # Tipo: mensaje, calificacion, asistencia, comunicado (opcional)
&estado=pendiente             # Estado: pendiente, leida, archivada (opcional)
&limit=20                     # Registros por página (default: 20)
&offset=0                     # Desplazamiento (default: 0)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "notificaciones": [
      {
        "id": "notif_089",
        "tipo": "mensaje",
        "titulo": "💬 Nuevo mensaje de Juan Carlos Pérez",
        "contenido": "Buenos días, quería consultar sobre la tarea...",
        "fecha_creacion": "2025-10-10T10:00:00Z",
        "fecha_creacion_relativa": "Hace 2 horas",
        "estado_plataforma": "pendiente",
        "leida": false,
        "url_destino": "/dashboard/mensajeria/conversacion/conv_001",
        "estudiante": {
          "id": "est_001",
          "nombre_completo": "María Elena Pérez García"
        },
        "icono": "💬",
        "color": "blue"
      },
      {
        "id": "notif_078",
        "tipo": "mensaje",
        "titulo": "💬 Nueva respuesta de Prof. Ana María Rodríguez",
        "contenido": "Perfecto, ya veo el ejercicio. Le explico paso a paso...",
        "fecha_creacion": "2025-10-09T09:30:00Z",
        "fecha_creacion_relativa": "Ayer",
        "estado_plataforma": "leida",
        "leida": true,
        "url_destino": "/dashboard/mensajeria/conversacion/conv_001",
        "estudiante": {
          "id": "est_001",
          "nombre_completo": "María Elena Pérez García"
        },
        "icono": "💬",
        "color": "blue"
      }
    ],
    "paginacion": {
      "limit": 20,
      "offset": 0,
      "total_notificaciones": 15,
      "total_pages": 1,
      "has_next": false
    },
    "contadores": {
      "total": 15,
      "pendientes": 3,
      "leidas": 12
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-94:** Ordenar por fecha descendente (más reciente primero)
- **RN-95:** Notificaciones pendientes al inicio
- **RN-96:** Fecha relativa para últimas 24 horas
- **RN-97:** Iconos y colores según tipo de notificación

---

## **CÓDIGOS DE ERROR ESPECÍFICOS DEL MÓDULO**

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `ACCESS_DENIED` | Sin permisos para acceder al recurso | 403 |
| `CONVERSATION_NOT_FOUND` | Conversación no existe | 404 |
| `CONVERSATION_CLOSED` | Conversación cerrada, no se pueden enviar mensajes | 403 |
| `NO_CONVERSATIONS_FOUND` | Usuario sin conversaciones | 404 |
| `MESSAGE_NOT_FOUND` | Mensaje no existe | 404 |
| `VALIDATION_ERROR` | Error de validación de campos | 400 |
| `FILE_VALIDATION_ERROR` | Error de validación de archivo | 400 |
| `FILE_TYPE_NOT_ALLOWED` | Tipo de archivo no permitido | 400 |
| `FILE_TOO_LARGE` | Archivo excede tamaño máximo | 413 |
| `FILE_NOT_FOUND` | Archivo no existe o fue eliminado | 404 |
| `UPLOAD_FAILED` | Error al subir archivo a Cloudinary | 500 |
| `INVALID_PARAMETERS` | Parámetros inválidos o mutuamente excluyentes | 400 |
| `ACTION_NOT_ALLOWED` | Acción no permitida para el rol (MVP) | 403 |
| `WHATSAPP_API_ERROR` | Error al enviar mensaje de WhatsApp | 500 |
| `STUDENT_NOT_LINKED` | Estudiante no vinculado al padre | 403 |
| `TEACHER_NOT_ASSIGNED` | Docente no asignado al curso | 403 |

---


