# **Documentación API REST - Módulo de Autenticación**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semana 3 - 2025  
**Versión:** 1.0 - Autenticación  

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000/api`
- **Base URL (producción):** `https://app-orquideas.com/api`

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

### **Middleware de Autenticación (`authMiddleware.js`):**
```javascript
// Validar Bearer token en headers
// Verificar token no esté en blacklist  
// Decodificar y validar payload JWT
// Inyectar user info en req.user
```

### **Middleware de Rate Limiting (`rateLimitMiddleware.js`):**
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

## **Consideraciones de Seguridad**

1. **Contraseñas:** Hash con bcrypt (salt rounds: 12)
2. **Tokens JWT:** Clave secreta rotativa, expiración 24h
3. **Rate Limiting:** Implementado por endpoint crítico
4. **Blacklist tokens:** Logout inmediato y seguro
5. **Validación entrada:** Sanitización contra inyección
6. **HTTPS obligatorio:** Todo el tráfico encriptado
7. **Headers de seguridad:** CORS, CSP, HSTS configurados