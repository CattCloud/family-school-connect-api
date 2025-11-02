# Guía de Referencia de Endpoints de la API

## Módulo de Autenticación

### **1. Iniciar Sesión**

**Endpoint:** `POST /auth/login`
**Descripción:** Autentica a un usuario en el sistema mediante documento y contraseña, devolviendo un token JWT y la información del usuario.
**Autenticación:** No requerida (pública)

#### **Cabeceras (Headers):**
```
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "tipo_documento": (Tipo: string, Obligatorio, Descripción: Tipo de documento, valores: 'DNI' o 'CARNET_EXTRANJERIA'),
  "nro_documento": (Tipo: string, Obligatorio, Descripción: Número de documento, entre 8-20 caracteres numéricos),
  "password": (Tipo: string, Obligatorio, Descripción: Contraseña del usuario, mínimo 8 caracteres)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "token": (Tipo: string, Descripción: Token JWT para autenticación),
    "expires_in": (Tipo: string, Descripción: Tiempo de expiración del token),
    "user": {
      "id": (Tipo: string, Descripción: ID único del usuario),
      "tipo_documento": (Tipo: string, Descripción: Tipo de documento),
      "nro_documento": (Tipo: string, Descripción: Número de documento),
      "nombre": (Tipo: string, Descripción: Nombre del usuario),
      "apellido": (Tipo: string, Descripción: Apellido del usuario),
      "rol": (Tipo: string, Descripción: Rol del usuario: 'apoderado', 'docente', 'director', 'administrador'),
      "telefono": (Tipo: string, Descripción: Teléfono del usuario),
      "fecha_ultimo_login": (Tipo: string, Descripción: Fecha del último inicio de sesión),
      "debe_cambiar_password": (Tipo: boolean, Descripción: Indica si debe cambiar contraseña)
    },
    "redirect_to": (Tipo: string, Descripción: URL de redirección según rol),
    "context": (Tipo: object, Opcional, Descripción: Contexto adicional para rol apoderado)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "expires_in": "24h",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "tipo_documento": "DNI",
      "nro_documento": "12345678",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "apoderado",
      "telefono": "987654321",
      "fecha_ultimo_login": "2025-10-31T20:00:00Z",
      "debe_cambiar_password": false
    },
    "redirect_to": "/dashboard/apoderado",
    "context": {
      "hijos": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "nombre": "María",
          "apellido": "Pérez",
          "grado": "4° Primaria"
        }
      ]
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "Mensaje de error específico sobre el campo inválido"
}
```

**Código 401 Unauthorized (Credenciales incorrectas):**
```json
{
  "success": false,
  "error": "Documento o contraseña incorrectos"
}
```

**Código 403 Forbidden (Usuario inactivo):**
```json
{
  "success": false,
  "error": "Usuario desactivado. Contacte al administrador"
}
```

---

### **2. Olvidé Contraseña**

**Endpoint:** `POST /auth/forgot-password`
**Descripción:** Inicia el proceso de recuperación de contraseña enviando un enlace por WhatsApp.
**Autenticación:** No requerida (pública)

#### **Cabeceras (Headers):**
```
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "tipo_documento": (Tipo: string, Obligatorio, Descripción: Tipo de documento, valores: 'DNI' o 'CARNET_EXTRANJERIA'),
  "nro_documento": (Tipo: string, Obligatorio, Descripción: Número de documento, entre 8-20 caracteres numéricos)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "message": (Tipo: string, Descripción: Mensaje informativo),
    "estimated_delivery": (Tipo: string, Descripción: Tiempo estimado de entrega)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "message": "Si el número de documento existe, recibirás un WhatsApp con instrucciones",
    "estimated_delivery": "1-2 minutos"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "Mensaje de error específico sobre el campo inválido"
}
```

---

### **3. Restablecer Contraseña**

**Endpoint:** `POST /auth/reset-password`
**Descripción:** Restablece la contraseña utilizando un token válido recibido por WhatsApp.
**Autenticación:** No requerida (pública)

#### **Cabeceras (Headers):**
```
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "token": (Tipo: string, Obligatorio, Descripción: Token UUID de recuperación),
  "nueva_password": (Tipo: string, Obligatorio, Descripción: Nueva contraseña, mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número),
  "confirmar_password": (Tipo: string, Obligatorio, Descripción: Confirmación de la nueva contraseña)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "message": (Tipo: string, Descripción: Mensaje de confirmación),
    "redirect_to": (Tipo: string, Descripción: URL de redirección)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada correctamente",
    "redirect_to": "/login"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Token inválido o expirado):**
```json
{
  "success": false,
  "error": "El enlace ha expirado. Solicita uno nuevo"
}
```

**Código 400 Bad Request (Contraseñas no coinciden):**
```json
{
  "success": false,
  "error": "Las contraseñas no coinciden"
}
```

---

### **4. Cerrar Sesión**

**Endpoint:** `POST /auth/logout`
**Descripción:** Cierra la sesión del usuario añadiendo el token a una lista negra.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "message": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **5. Validar Token**

**Endpoint:** `GET /auth/validate-token`
**Descripción:** Verifica si un token JWT es válido y devuelve información básica del usuario.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "valid": (Tipo: boolean, Descripción: Indica si el token es válido),
    "expires_in": (Tipo: string, Descripción: Tiempo restante de expiración),
    "user": {
      "id": (Tipo: string, Descripción: ID del usuario),
      "rol": (Tipo: string, Descripción: Rol del usuario),
      "nombre": (Tipo: string, Descripción: Nombre del usuario),
      "apellido": (Tipo: string, Descripción: Apellido del usuario)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expires_in": "23h 45m 30s",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "rol": "apoderado",
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **6. Cambiar Contraseña Requerida**

**Endpoint:** `POST /auth/change-required-password`
**Descripción:** Permite a los usuarios cambiar su contraseña cuando el sistema lo requiere (ej: primer inicio de sesión).
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "password_actual": (Tipo: string, Obligatorio, Descripción: Contraseña actual del usuario),
  "nueva_password": (Tipo: string, Obligatorio, Descripción: Nueva contraseña, mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número),
  "confirmar_password": (Tipo: string, Obligatorio, Descripción: Confirmación de la nueva contraseña)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "message": (Tipo: string, Descripción: Mensaje de confirmación),
    "redirect_to": (Tipo: string, Descripción: URL de redirección)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada correctamente",
    "redirect_to": "/dashboard/docente"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Contraseña actual incorrecta):**
```json
{
  "success": false,
  "error": "La contraseña actual es incorrecta"
}
```

**Código 400 Bad Request (Contraseñas no coinciden):**
```json
{
  "success": false,
  "error": "Las contraseñas no coinciden"
}
```

**Código 403 Forbidden (No es necesario cambiar contraseña):**
```json
{
  "success": false,
  "error": "No es necesario cambiar la contraseña"
}
```

---

### **7. Obtener Contexto del Padre**

**Endpoint:** `GET /auth/parent-context/:user_id`
**Descripción:** Obtiene información sobre los hijos vinculados a un padre/apoderado.
**Autenticación:** Bearer token (Rol: apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{user_id} = (Tipo: string, Descripción: ID del usuario padre/apoderado)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "hijos": (Tipo: array, Descripción: Lista de hijos vinculados al padre),
    "total_hijos": (Tipo: number, Descripción: Número total de hijos)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "hijos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "nombre": "María",
        "apellido": "Pérez",
        "grado": "4° Primaria"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "nombre": "Carlos",
        "apellido": "Pérez",
        "grado": "2° Primaria"
      }
    ],
    "total_hijos": 2
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "Solo accesible por rol apoderado"
}
```

---

## Módulo de Usuarios

### **8. Obtener Hijos del Padre Autenticado**

**Endpoint:** `GET /usuarios/hijos`
**Descripción:** Obtiene la lista de estudiantes (hijos) vinculados al padre/apoderado autenticado.
**Autenticación:** Bearer token (Rol: apoderado, administrador)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "padre": {
      "id": (Tipo: string, Descripción: ID del padre/apoderado),
      "nombre": (Tipo: string, Descripción: Nombre completo del padre/apoderado)
    },
    "hijos": [
      {
        "id": (Tipo: string, Descripción: ID del estudiante),
        "codigo_estudiante": (Tipo: string, Descripción: Código único del estudiante),
        "nombre_completo": (Tipo: string, Descripción: Nombre completo del estudiante),
        "nivel_grado": {
          "nivel": (Tipo: string, Descripción: Nivel educativo),
          "grado": (Tipo: string, Descripción: Grado del estudiante),
          "descripcion": (Tipo: string, Descripción: Descripción del nivel-grado)
        },
        "estado_matricula": (Tipo: string, Descripción: Estado de la matrícula)
      }
    ],
    "total_hijos": (Tipo: number, Descripción: Número total de hijos)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "padre": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Juan Pérez García"
    },
    "hijos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "codigo_estudiante": "EST2025001",
        "nombre_completo": "María Pérez López",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "4°",
          "descripcion": "Cuarto grado de primaria"
        },
        "estado_matricula": "Activa"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "codigo_estudiante": "EST2025002",
        "nombre_completo": "Carlos Pérez López",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "2°",
          "descripcion": "Segundo grado de primaria"
        },
        "estado_matricula": "Activa"
      }
    ],
    "total_hijos": 2
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "Solo apoderados pueden acceder a sus hijos"
}

---

## Módulo de Comunicados

### **9. Obtener Niveles y Grados**

**Endpoint:** `GET /comunicados/nivel-grado`
**Descripción:** Obtiene la lista completa de niveles y grados disponibles en el sistema. Solo accesible por directores.
**Autenticación:** Bearer token (Rol: director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "jerarquia": {
      "Primaria": [
        {
          "id": (Tipo: string, Descripción: ID del nivel-grado),
          "grado": (Tipo: string, Descripción: Nombre del grado),
          "descripcion": (Tipo: string, Descripción: Descripción del nivel-grado)
        }
      ],
      "Secundaria": [
        {
          "id": (Tipo: string, Descripción: ID del nivel-grado),
          "grado": (Tipo: string, Descripción: Nombre del grado),
          "descripcion": (Tipo: string, Descripción: Descripción del nivel-grado)
        }
      ]
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "jerarquia": {
      "Primaria": [
        {
          "id": "prim-1ro",
          "grado": "1°",
          "descripcion": "Primer grado de primaria"
        },
        {
          "id": "prim-2do",
          "grado": "2°",
          "descripcion": "Segundo grado de primaria"
        },
        {
          "id": "prim-3ro",
          "grado": "3°",
          "descripcion": "Tercer grado de primaria"
        },
        {
          "id": "prim-4to",
          "grado": "4°",
          "descripcion": "Cuarto grado de primaria"
        },
        {
          "id": "prim-5to",
          "grado": "5°",
          "descripcion": "Quinto grado de primaria"
        },
        {
          "id": "prim-6to",
          "grado": "6°",
          "descripcion": "Sexto grado de primaria"
        }
      ],
      "Secundaria": [
        {
          "id": "sec-1ro",
          "grado": "1°",
          "descripcion": "Primer grado de secundaria"
        },
        {
          "id": "sec-2do",
          "grado": "2°",
          "descripcion": "Segundo grado de secundaria"
        },
        {
          "id": "sec-3ro",
          "grado": "3°",
          "descripcion": "Tercer grado de secundaria"
        },
        {
          "id": "sec-4to",
          "grado": "4°",
          "descripcion": "Cuarto grado de secundaria"
        },
        {
          "id": "sec-5to",
          "grado": "5°",
          "descripcion": "Quinto grado de secundaria"
        }
      ]
    }
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "Solo los directores pueden ver todos los niveles y grados"
}
```

---

## Módulo de Comunicados

### **10. Obtener Lista de Comunicados**

**Endpoint:** `GET /comunicados/`
**Descripción:** Obtiene la lista de comunicados visibles para el usuario con paginación y filtros.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?page=(Tipo: number, Opcional, Descripción: Número de página, default: 1)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados por página, default: 12)
&tipo=(Tipo: string, Opcional, Descripción: Tipo de comunicado: 'academico', 'administrativo', 'evento', 'urgente', 'informativo')
&estado_lectura=(Tipo: string, Opcional, Descripción: Estado de lectura: 'todos', 'leidos', 'no_leidos')
&fecha_inicio=(Tipo: string, Opcional, Descripción: Fecha de inicio para filtrar, formato: YYYY-MM-DD)
&fecha_fin=(Tipo: string, Opcional, Descripción: Fecha de fin para filtrar, formato: YYYY-MM-DD)
&autor_id=(Tipo: string, Opcional, Descripción: ID del autor para filtrar)
&nivel=(Tipo: string, Opcional, Descripción: Nivel para filtrar)
&grado=(Tipo: string, Opcional, Descripción: Grado para filtrar)
&hijo_id=(Tipo: string, Opcional, Descripción: ID del hijo para filtrar, solo para padres)
&busqueda=(Tipo: string, Opcional, Descripción: Término de búsqueda en título y contenido)
&solo_mis_comunicados=(Tipo: boolean, Opcional, Descripción: Mostrar solo comunicados propios, solo para docentes)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": (Tipo: string, Descripción: ID del usuario),
      "nombre": (Tipo: string, Descripción: Nombre completo del usuario),
      "rol": (Tipo: string, Descripción: Rol del usuario)
    },
    "comunicados": [
      {
        "id": (Tipo: string, Descripción: ID del comunicado),
        "titulo": (Tipo: string, Descripción: Título del comunicado),
        "tipo": (Tipo: string, Descripción: Tipo de comunicado),
        "contenido_preview": (Tipo: string, Descripción: Vista previa del contenido, máximo 120 caracteres),
        "fecha_publicacion": (Tipo: string, Descripción: Fecha de publicación),
        "fecha_publicacion_legible": (Tipo: string, Descripción: Fecha formateada legible),
        "fecha_publicacion_relativa": (Tipo: string, Descripción: Tiempo relativo: 'Hace X horas'),
        "destinatarios_texto": (Tipo: string, Descripción: Texto descriptivo de destinatarios),
        "estado_lectura": {
          "leido": (Tipo: boolean, Descripción: Indica si ha sido leído),
          "fecha_lectura": (Tipo: string, Descripción: Fecha de lectura)
        },
        "es_nuevo": (Tipo: boolean, Descripción: Indica si es reciente, menos de 24 horas),
        "es_autor": (Tipo: boolean, Descripción: Indica si el usuario es el autor),
        "autor": {
          "id": (Tipo: string, Descripción: ID del autor),
          "nombre": (Tipo: string, Descripción: Nombre del autor),
          "apellido": (Tipo: string, Descripción: Apellido del autor),
          "rol": (Tipo: string, Descripción: Rol del autor)
        }
      }
    ],
    "paginacion": {
      "page": (Tipo: number, Descripción: Página actual),
      "limit": (Tipo: number, Descripción: Límite de resultados),
      "total_comunicados": (Tipo: number, Descripción: Total de comunicados),
      "total_pages": (Tipo: number, Descripción: Total de páginas),
      "has_next": (Tipo: boolean, Descripción: Indica si hay página siguiente),
      "has_prev": (Tipo: boolean, Descripción: Indica si hay página anterior)
    },
    "contadores": {
      "total": (Tipo: number, Descripción: Total de comunicados),
      "no_leidos": (Tipo: number, Descripción: Total de no leídos),
      "leidos": (Tipo: number, Descripción: Total de leídos)
    },
    "filtros_aplicados": {
      "tipo": (Tipo: string, Descripción: Tipo aplicado),
      "estado_lectura": (Tipo: string, Descripción: Estado de lectura aplicado),
      "fecha_inicio": (Tipo: string, Descripción: Fecha de inicio aplicada),
      "fecha_fin": (Tipo: string, Descripción: Fecha de fin aplicada),
      "autor_id": (Tipo: string, Descripción: ID del autor aplicado)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Juan Pérez",
      "rol": "apoderado"
    },
    "comunicados": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "titulo": "Reunión de padres de familia",
        "tipo": "administrativo",
        "contenido_preview": "Se convoca a todos los padres de familia a una reunión importante para tratar temas académicos...",
        "fecha_publicacion": "2025-10-30T15:30:00Z",
        "fecha_publicacion_legible": "30 de octubre de 2025, 03:30 PM",
        "fecha_publicacion_relativa": "Hace 1 día",
        "destinatarios_texto": "Todos los padres de familia",
        "estado_lectura": {
          "leido": false,
          "fecha_lectura": null
        },
        "es_nuevo": true,
        "es_autor": false,
        "autor": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "nombre": "María",
          "apellido": "González",
          "rol": "director"
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "titulo": "Evaluación de matemáticas",
        "tipo": "academico",
        "contenido_preview": "Se informa que el próximo viernes se realizará una evaluación de matemáticas...",
        "fecha_publicacion": "2025-10-28T10:15:00Z",
        "fecha_publicacion_legible": "28 de octubre de 2025, 10:15 AM",
        "fecha_publicacion_relativa": "Hace 3 días",
        "destinatarios_texto": "Estudiantes de 4° grado",
        "estado_lectura": {
          "leido": true,
          "fecha_lectura": "2025-10-28T14:20:00Z"
        },
        "es_nuevo": false,
        "es_autor": false,
        "autor": {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "nombre": "Carlos",
          "apellido": "Rodríguez",
          "rol": "docente"
        }
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 12,
      "total_comunicados": 8,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "contadores": {
      "total": 8,
      "no_leidos": 3,
      "leidos": 5
    },
    "filtros_aplicados": {
      "tipo": "todos",
      "estado_lectura": "todos",
      "fecha_inicio": null,
      "fecha_fin": null,
      "autor_id": null
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **11. Obtener Contador de Comunicados No Leídos**

**Endpoint:** `GET /comunicados/no-leidos/count`
**Descripción:** Obtiene el contador de comunicados no leídos para el usuario autenticado.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "total_no_leidos": (Tipo: number, Descripción: Total de comunicados no leídos),
    "por_tipo": {
      "academico": (Tipo: number, Descripción: No leídos de tipo académico),
      "administrativo": (Tipo: number, Descripción: No leídos de tipo administrativo),
      "evento": (Tipo: number, Descripción: No leídos de tipo evento),
      "urgente": (Tipo: number, Descripción: No leídos de tipo urgente),
      "informativo": (Tipo: number, Descripción: No leídos de tipo informativo)
    },
    "ultimos_3": [
      {
        "id": (Tipo: string, Descripción: ID del comunicado),
        "titulo": (Tipo: string, Descripción: Título del comunicado),
        "tipo": (Tipo: string, Descripción: Tipo de comunicado),
        "fecha_publicacion": (Tipo: string, Descripción: Fecha de publicación)
      }
    ]
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_no_leidos": 5,
    "por_tipo": {
      "academico": 2,
      "administrativo": 1,
      "evento": 1,
      "urgente": 1,
      "informativo": 0
    },
    "ultimos_3": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "titulo": "Reunión de padres de familia",
        "tipo": "administrativo",
        "fecha_publicacion": "2025-10-30T15:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "titulo": "Evaluación de matemáticas",
        "tipo": "academico",
        "fecha_publicacion": "2025-10-29T10:15:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "titulo": "Evento deportivo escolar",
        "tipo": "evento",
        "fecha_publicacion": "2025-10-28T14:20:00Z"
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **12. Buscar Comunicados**

**Endpoint:** `GET /comunicados/search`
**Descripción:** Busca comunicados por término en título y contenido.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?query=(Tipo: string, Obligatorio, Descripción: Término de búsqueda, mínimo 2 caracteres)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados, default: 20)
&offset=(Tipo: number, Opcional, Descripción: Desplazamiento para paginación, default: 0)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "query": (Tipo: string, Descripción: Término buscado),
    "resultados": [
      {
        "id": (Tipo: string, Descripción: ID del comunicado),
        "titulo": (Tipo: string, Descripción: Título del comunicado),
        "tipo": (Tipo: string, Descripción: Tipo de comunicado),
        "contenido_preview": (Tipo: string, Descripción: Vista previa del contenido),
        "fecha_publicacion": (Tipo: string, Descripción: Fecha de publicación),
        "destacado": (Tipo: string, Descripción: Texto con término resaltado),
        "match_en": (Tipo: string, Descripción: Dónde se encontró coincidencia: 'titulo' o 'contenido')
      }
    ],
    "total_resultados": (Tipo: number, Descripción: Total de resultados encontrados),
    "paginacion": {
      "limit": (Tipo: number, Descripción: Límite de resultados),
      "offset": (Tipo: number, Descripción: Desplazamiento),
      "has_more": (Tipo: boolean, Descripción: Indica si hay más resultados)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "query": "evaluación",
    "resultados": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "titulo": "Evaluación de matemáticas",
        "tipo": "academico",
        "contenido_preview": "Se informa que el próximo viernes se realizará una <mark>evaluación</mark> de matemáticas...",
        "fecha_publicacion": "2025-10-28T10:15:00Z",
        "destacado": "Evaluación de matemáticas",
        "match_en": "titulo"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "titulo": "Calendario de evaluaciones",
        "tipo": "academico",
        "contenido_preview": "Se adjunta el calendario de <mark>evaluaciones</mark> para el presente bimestre...",
        "fecha_publicacion": "2025-10-25T14:30:00Z",
        "destacado": "Calendario de <mark>evaluaciones</mark>",
        "match_en": "contenido"
      }
    ],
    "total_resultados": 2,
    "paginacion": {
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "El término de búsqueda debe tener al menos 2 caracteres"
}
```

---

### **13. Verificar Actualizaciones de Comunicados**

**Endpoint:** `GET /comunicados/actualizaciones`
**Descripción:** Verifica si hay nuevos comunicados desde la última verificación (polling).
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?ultimo_check=(Tipo: string, Obligatorio, Descripción: Fecha y hora de la última verificación, formato ISO 8601)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": (Tipo: boolean, Descripción: Indica si hay nuevos comunicados),
    "nuevos_comunicados": [
      {
        "id": (Tipo: string, Descripción: ID del comunicado),
        "titulo": (Tipo: string, Descripción: Título del comunicado),
        "tipo": (Tipo: string, Descripción: Tipo de comunicado),
        "autor": {
          "nombre_completo": (Tipo: string, Descripción: Nombre completo del autor)
        },
        "fecha_publicacion": (Tipo: string, Descripción: Fecha de publicación),
        "contenido_preview": (Tipo: string, Descripción: Vista previa del contenido)
      }
    ],
    "total_nuevos_comunicados": (Tipo: number, Descripción: Total de nuevos comunicados),
    "contador_no_leidos": (Tipo: number, Descripción: Total de comunicados no leídos)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": true,
    "nuevos_comunicados": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "titulo": "Reunión de padres de familia",
        "tipo": "administrativo",
        "autor": {
          "nombre_completo": "María González"
        },
        "fecha_publicacion": "2025-10-31T15:30:00Z",
        "contenido_preview": "Se convoca a todos los padres de familia a una reunión importante..."
      }
    ],
    "total_nuevos_comunicados": 1,
    "contador_no_leidos": 3
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Se requiere el parámetro ultimo_check"
}
```

---

### **14. Obtener Comunicado Completo**

**Endpoint:** `GET /comunicados/:id`
**Descripción:** Obtiene el contenido completo de un comunicado específico y lo marca como leído.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del comunicado)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": (Tipo: string, Descripción: ID del comunicado),
      "titulo": (Tipo: string, Descripción: Título del comunicado),
      "contenido": (Tipo: string, Descripción: Contenido completo en HTML),
      "tipo": (Tipo: string, Descripción: Tipo de comunicado),
      "fecha_creacion": (Tipo: string, Descripción: Fecha de creación),
      "fecha_publicacion": (Tipo: string, Descripción: Fecha de publicación),
      "fecha_publicacion_legible": (Tipo: string, Descripción: Fecha formateada legible),
      "destinatarios": {
        "publico_objetivo": (Tipo: array, Descripción: Público objetivo),
        "niveles": (Tipo: array, Descripción: Niveles objetivo),
        "grados": (Tipo: array, Descripción: Grados objetivo),
        "cursos": (Tipo: array, Descripción: Cursos objetivo),
        "texto_legible": (Tipo: string, Descripción: Texto descriptivo de destinatarios)
      },
      "autor": {
        "id": (Tipo: string, Descripción: ID del autor),
        "nombre": (Tipo: string, Descripción: Nombre del autor),
        "apellido": (Tipo: string, Descripción: Apellido del autor),
        "rol": (Tipo: string, Descripción: Rol del autor),
        "nombre_completo": (Tipo: string, Descripción: Nombre completo del autor)
      }
    },
    "estado_lectura": {
      "leido": (Tipo: boolean, Descripción: Indica si ha sido leído),
      "fecha_lectura": (Tipo: string, Descripción: Fecha de lectura)
    },
    "permisos": {
      "puede_editar": (Tipo: boolean, Descripción: Indica si puede editar),
      "puede_eliminar": (Tipo: boolean, Descripción: Indica si puede eliminar),
      "puede_ver_estadisticas": (Tipo: boolean, Descripción: Indica si puede ver estadísticas),
      "es_autor": (Tipo: boolean, Descripción: Indica si es el autor)
    },
    "estadisticas_basicas": {
      "total_destinatarios": (Tipo: number, Descripción: Total de destinatarios),
      "total_lecturas": (Tipo: number, Descripción: Total de lecturas),
      "porcentaje_lectura": (Tipo: number, Descripción: Porcentaje de lectura)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Reunión de padres de familia",
      "contenido": "<p>Se convoca a todos los padres de familia a una reunión importante para tratar temas académicos y administrativos del presente bimestre.</p><p><strong>Fecha:</strong> 5 de noviembre de 2025<br><strong>Hora:</strong> 6:00 PM<br><strong>Lugar:</strong> Auditorio de la escuela</p>",
      "tipo": "administrativo",
      "fecha_creacion": "2025-10-30T14:00:00Z",
      "fecha_publicacion": "2025-10-30T15:30:00Z",
      "fecha_publicacion_legible": "30 de octubre de 2025, 03:30 PM",
      "destinatarios": {
        "publico_objetivo": ["padres"],
        "niveles": ["Primaria", "Secundaria"],
        "grados": [],
        "cursos": [],
        "texto_legible": "Todos los padres de familia"
      },
      "autor": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "nombre": "María",
        "apellido": "González",
        "rol": "director",
        "nombre_completo": "María González"
      }
    },
    "estado_lectura": {
      "leido": true,
      "fecha_lectura": "2025-10-31T10:15:00Z"
    },
    "permisos": {
      "puede_editar": false,
      "puede_eliminar": false,
      "puede_ver_estadisticas": false,
      "es_autor": false
    },
    "estadisticas_basicas": {
      "total_destinatarios": 150,
      "total_lecturas": 85,
      "porcentaje_lectura": 56.7
    }
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tienes permisos para ver este comunicado"
}
```

**Código 404 Not Found (Comunicado no encontrado):**
```json
{
  "success": false,
  "error": "El comunicado no existe o ha sido eliminado"
}
```

---

### **15. Marcar Comunicado como Leído**

**Endpoint:** `POST /comunicados/comunicados-lecturas`
**Descripción:** Marca un comunicado como leído para el usuario autenticado.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "comunicado_id": (Tipo: string, Obligatorio, Descripción: ID del comunicado a marcar como leído)
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "lectura": {
      "id": (Tipo: string, Descripción: ID del registro de lectura),
      "comunicado_id": (Tipo: string, Descripción: ID del comunicado),
      "usuario_id": (Tipo: string, Descripción: ID del usuario),
      "fecha_lectura": (Tipo: string, Descripción: Fecha de lectura)
    },
    "nuevo_contador_no_leidos": (Tipo: number, Descripción: Nuevo contador de no leídos)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "lectura": {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "comunicado_id": "550e8400-e29b-41d4-a716-446655440001",
      "usuario_id": "550e8400-e29b-41d4-a716-446655440000",
      "fecha_lectura": "2025-10-31T20:30:00Z"
    },
    "nuevo_contador_no_leidos": 4
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Se requiere el ID del comunicado"
}
```

**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tienes permisos para este comunicado"
}
```

---

### **16. Validar Acceso a Comunicado**

**Endpoint:** `GET /comunicados/:id/acceso`
**Descripción:** Verifica si el usuario tiene acceso a un comunicado específico.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del comunicado)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "tiene_acceso": (Tipo: boolean, Descripción: Indica si tiene acceso),
    "motivo": (Tipo: string, Descripción: Motivo del resultado),
    "puede_ver": (Tipo: boolean, Descripción: Indica si puede ver),
    "puede_editar": (Tipo: boolean, Descripción: Indica si puede editar),
    "puede_eliminar": (Tipo: boolean, Descripción: Indica si puede eliminar)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "tiene_acceso": true,
    "motivo": "El comunicado está dirigido a padres de familia",
    "puede_ver": true,
    "puede_editar": false,
    "puede_eliminar": false
  }
}
```

---

### **17. Verificar Permisos de Creación de Comunicados**

**Endpoint:** `GET /comunicados/permisos-docentes/:docente_id`
**Descripción:** Verifica los permisos de un docente para crear comunicados.
**Autenticación:** Bearer token (Rol: director, o el propio docente)

#### **Parámetros de Ruta (Path Parameters):**
```
{docente_id} = (Tipo: string, Descripción: ID del docente)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": (Tipo: string, Descripción: ID del docente),
      "nombre_completo": (Tipo: string, Descripción: Nombre completo del docente)
    },
    "permisos": {
      "puede_crear_comunicados": (Tipo: boolean, Descripción: Indica si puede crear comunicados),
      "estado_activo": (Tipo: boolean, Descripción: Estado del permiso),
      "fecha_otorgamiento": (Tipo: string, Descripción: Fecha de otorgamiento del permiso),
      "otorgado_por": {
        "nombre_completo": (Tipo: string, Descripción: Nombre completo de quien otorgó el permiso)
      },
      "es_director": (Tipo: boolean, Descripción: Indica si es director)
    },
    "restricciones": {
      "tipos_permitidos": (Tipo: array, Descripción: Tipos de comunicados permitidos),
      "puede_segmentar_nivel": (Tipo: boolean, Descripción: Indica si puede segmentar por nivel),
      "solo_sus_grados": (Tipo: boolean, Descripción: Indica si solo puede comunicarse con sus grados),
      "niveles_permitidos": (Tipo: array, Descripción: Niveles permitidos),
      "grados_permitidos": (Tipo: array, Descripción: Grados permitidos)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "nombre_completo": "Carlos Rodríguez"
    },
    "permisos": {
      "puede_crear_comunicados": true,
      "estado_activo": true,
      "fecha_otorgamiento": "2025-09-01T10:00:00Z",
      "otorgado_por": {
        "nombre_completo": "María González"
      },
      "es_director": false
    },
    "restricciones": {
      "tipos_permitidos": ["academico", "informativo"],
      "puede_segmentar_nivel": false,
      "solo_sus_grados": true,
      "niveles_permitidos": ["Primaria"],
      "grados_permitidos": ["3°", "4°"]
    }
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tienes permisos para ver esta información"
}
```

---

### **18. Obtener Cursos del Docente**

**Endpoint:** `GET /comunicados/cursos/docente/:docente_id`
**Descripción:** Obtiene los cursos asignados a un docente específico.
**Autenticación:** Bearer token (Rol: director, o el propio docente)

#### **Parámetros de Ruta (Path Parameters):**
```
{docente_id} = (Tipo: string, Descripción: ID del docente)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Opcional, Descripción: Año académico, default: 2025)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": (Tipo: string, Descripción: ID del docente),
      "nombre_completo": (Tipo: string, Descripción: Nombre completo del docente)
    },
    "año_academico": (Tipo: number, Descripción: Año académico consultado),
    "asignaciones": {
      "Primaria": [
        {
          "id": (Tipo: string, Descripción: ID del curso),
          "nombre": (Tipo: string, Descripción: Nombre del curso),
          "codigo_curso": (Tipo: string, Descripción: Código del curso),
          "grado": (Tipo: string, Descripción: Grado del curso)
        }
      ]
    },
    "grados_unicos": (Tipo: array, Descripción: Lista de grados únicos),
    "niveles_unicos": (Tipo: array, Descripción: Lista de niveles únicos),
    "total_cursos": (Tipo: number, Descripción: Total de cursos asignados)
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tienes permisos para ver esta información"
}
```

---

### **19. Calcular Destinatarios Estimados**

**Endpoint:** `POST /comunicados/usuarios/destinatarios/preview`
**Descripción:** Calcula el número estimado de destinatarios para una segmentación específica.
**Autenticación:** Bearer token (Roles: director, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "publico_objetivo": (Tipo: array, Obligatorio, Descripción: Público objetivo: ['padres', 'docentes', 'todos']),
  "niveles": (Tipo: array, Opcional, Descripción: Niveles específicos),
  "grados": (Tipo: array, Opcional, Descripción: Grados específicos),
  "cursos": (Tipo: array, Opcional, Descripción: Cursos específicos),
  "todos": (Tipo: boolean, Opcional, Descripción: Indica si es para todos)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "segmentacion": {
      "publico_objetivo": (Tipo: array, Descripción: Público objetivo),
      "niveles": (Tipo: array, Descripción: Niveles),
      "grados": (Tipo: array, Descripción: Grados),
      "cursos": (Tipo: array, Descripción: Cursos),
      "todos": (Tipo: boolean, Descripción: Indica si es para todos)
    },
    "destinatarios": {
      "total_estimado": (Tipo: number, Descripción: Total estimado de destinatarios),
      "desglose": {
        "padres": (Tipo: number, Descripción: Número de padres),
        "docentes": (Tipo: number, Descripción: Número de docentes)
      }
    },
    "texto_legible": (Tipo: string, Descripción: Texto descriptivo de destinatarios)
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Se requiere público objetivo"
}
```

---

### **20. Crear Comunicado**

**Endpoint:** `POST /comunicados/`
**Descripción:** Crea un nuevo comunicado (publicado o programado).
**Autenticación:** Bearer token (Roles: director, docente con permisos)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "titulo": (Tipo: string, Obligatorio, Descripción: Título del comunicado, entre 10-200 caracteres),
  "tipo": (Tipo: string, Obligatorio, Descripción: Tipo de comunicado: 'academico', 'administrativo', 'evento', 'urgente', 'informativo'),
  "contenido_html": (Tipo: string, Obligatorio, Descripción: Contenido en HTML, entre 20-5000 caracteres),
  "publico_objetivo": (Tipo: array, Obligatorio, Descripción: Público objetivo: ['padres', 'docentes', 'todos']),
  "niveles": (Tipo: array, Opcional, Descripción: Niveles específicos),
  "grados": (Tipo: array, Opcional, Descripción: Grados específicos),
  "cursos": (Tipo: array, Opcional, Descripción: Cursos específicos),
  "fecha_programada": (Tipo: string, Opcional, Descripción: Fecha programada para publicación, formato ISO 8601)
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": (Tipo: string, Descripción: ID del comunicado creado),
      "titulo": (Tipo: string, Descripción: Título del comunicado),
      "contenido": (Tipo: string, Descripción: Contenido del comunicado),
      "tipo": (Tipo: string, Descripción: Tipo de comunicado),
      "publico_objetivo": (Tipo: array, Descripción: Público objetivo),
      "niveles_objetivo": (Tipo: array, Descripción: Niveles objetivo),
      "grados_objetivo": (Tipo: array, Descripción: Grados objetivo),
      "cursos_objetivo": (Tipo: array, Descripción: Cursos objetivo),
      "fecha_creacion": (Tipo: string, Descripción: Fecha de creación),
      "fecha_publicacion": (Tipo: string, Descripción: Fecha de publicación),
      "fecha_programada": (Tipo: string, Descripción: Fecha programada),
      "estado": (Tipo: string, Descripción: Estado: 'publicado', 'programado'),
      "autor_id": (Tipo: string, Descripción: ID del autor),
      "año_academico": (Tipo: number, Descripción: Año académico)
    },
    "mensaje": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Reunión de padres de familia",
      "contenido": "<p>Se convoca a todos los padres de familia a una reunión importante para tratar temas académicos y administrativos del presente bimestre.</p>",
      "tipo": "administrativo",
      "publico_objetivo": ["padres"],
      "niveles_objetivo": ["Primaria", "Secundaria"],
      "grados_objetivo": [],
      "cursos_objetivo": [],
      "fecha_creacion": "2025-10-31T20:00:00Z",
      "fecha_publicacion": "2025-10-31T20:00:00Z",
      "fecha_programada": null,
      "estado": "publicado",
      "autor_id": "550e8400-e29b-41d4-a716-446655440002",
      "año_academico": 2025
    },
    "mensaje": "Comunicado creado exitosamente"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "Faltan campos requeridos"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para crear este tipo de comunicado"
}
```

---

### **21. Guardar Borrador de Comunicado**

**Endpoint:** `POST /comunicados/borrador`
**Descripción:** Guarda un borrador de comunicado sin publicarlo.
**Autenticación:** Bearer token (Roles: director, docente con permisos)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "titulo": (Tipo: string, Obligatorio, Descripción: Título del comunicado),
  "tipo": (Tipo: string, Obligatorio, Descripción: Tipo de comunicado),
  "contenido_html": (Tipo: string, Obligatorio, Descripción: Contenido en HTML),
  "publico_objetivo": (Tipo: array, Obligatorio, Descripción: Público objetivo),
  "niveles": (Tipo: array, Opcional, Descripción: Niveles específicos),
  "grados": (Tipo: array, Opcional, Descripción: Grados específicos),
  "cursos": (Tipo: array, Opcional, Descripción: Cursos específicos)
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": (Tipo: string, Descripción: ID del borrador),
      "titulo": (Tipo: string, Descripción: Título del comunicado),
      "contenido": (Tipo: string, Descripción: Contenido del comunicado),
      "tipo": (Tipo: string, Descripción: Tipo de comunicado),
      "publico_objetivo": (Tipo: array, Descripción: Público objetivo),
      "niveles_objetivo": (Tipo: array, Descripción: Niveles objetivo),
      "grados_objetivo": (Tipo: array, Descripción: Grados objetivo),
      "cursos_objetivo": (Tipo: array, Descripción: Cursos objetivo),
      "fecha_creacion": (Tipo: string, Descripción: Fecha de creación),
      "estado": (Tipo: string, Descripción: Estado: 'borrador'),
      "autor_id": (Tipo: string, Descripción: ID del autor),
      "año_academico": (Tipo: number, Descripción: Año académico)
    },
    "mensaje": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Reunión de padres de familia",
      "contenido": "<p>Se convoca a todos los padres de familia a una reunión importante para tratar temas académicos y administrativos del presente bimestre.</p>",
      "tipo": "administrativo",
      "publico_objetivo": ["padres"],
      "niveles_objetivo": ["Primaria", "Secundaria"],
      "grados_objetivo": [],
      "cursos_objetivo": [],
      "fecha_creacion": "2025-10-31T20:00:00Z",
      "estado": "borrador",
      "autor_id": "550e8400-e29b-41d4-a716-446655440002",
      "año_academico": 2025
    },
    "mensaje": "Borrador guardado correctamente"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "Faltan campos requeridos"
}
```

---

### **22. Editar Comunicado**

**Endpoint:** `PUT /comunicados/:id`
**Descripción:** Edita un comunicado existente.
**Autenticación:** Bearer token (Roles: director, o autor del comunicado)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del comunicado a editar)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "titulo": (Tipo: string, Obligatorio, Descripción: Nuevo título del comunicado),
  "tipo": (Tipo: string, Obligatorio, Descripción: Nuevo tipo de comunicado),
  "contenido_html": (Tipo: string, Obligatorio, Descripción: Nuevo contenido en HTML),
  "publico_objetivo": (Tipo: array, Obligatorio, Descripción: Nuevo público objetivo),
  "niveles": (Tipo: array, Opcional, Descripción: Nuevos niveles específicos),
  "grados": (Tipo: array, Opcional, Descripción: Nuevos grados específicos),
  "cursos": (Tipo: array, Opcional, Descripción: Nuevos cursos específicos)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": (Tipo: string, Descripción: ID del comunicado actualizado),
      "titulo": (Tipo: string, Descripción: Nuevo título),
      "contenido": (Tipo: string, Descripción: Nuevo contenido),
      "tipo": (Tipo: string, Descripción: Nuevo tipo),
      "publico_objetivo": (Tipo: array, Descripción: Nuevo público objetivo),
      "niveles_objetivo": (Tipo: array, Descripción: Nuevos niveles objetivo),
      "grados_objetivo": (Tipo: array, Descripción: Nuevos grados objetivo),
      "cursos_objetivo": (Tipo: array, Descripción: Nuevos cursos objetivo),
      "fecha_edicion": (Tipo: string, Descripción: Fecha de edición),
      "editado": (Tipo: boolean, Descripción: Indica que ha sido editado)
    },
    "mensaje": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Reunión de padres de familia - Actualizada",
      "contenido": "<p>Se convoca a todos los padres de familia a una reunión importante para tratar temas académicos y administrativos del presente bimestre. <strong>Nota:</strong> Se ha cambiado la fecha.</p>",
      "tipo": "administrativo",
      "publico_objetivo": ["padres"],
      "niveles_objetivo": ["Primaria", "Secundaria"],
      "grados_objetivo": [],
      "cursos_objetivo": [],
      "fecha_edicion": "2025-10-31T21:00:00Z",
      "editado": true
    },
    "mensaje": "Comunicado actualizado correctamente"
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para editar este comunicado"
}
```

**Código 404 Not Found (Comunicado no encontrado):**
```json
{
  "success": false,
  "error": "Comunicado no encontrado"
}
```

---

### **23. Obtener Mis Borradores**

**Endpoint:** `GET /comunicados/mis-borradores`
**Descripción:** Obtiene la lista de borradores del usuario autenticado.
**Autenticación:** Bearer token (Roles: director, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?page=(Tipo: number, Opcional, Descripción: Número de página, default: 1)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados por página, default: 10)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "borradores": [
      {
        "id": (Tipo: string, Descripción: ID del borrador),
        "titulo": (Tipo: string, Descripción: Título del borrador),
        "contenido": (Tipo: string, Descripción: Contenido del borrador),
        "tipo": (Tipo: string, Descripción: Tipo de comunicado),
        "fecha_creacion": (Tipo: string, Descripción: Fecha de creación),
        "publico_objetivo": (Tipo: array, Descripción: Público objetivo),
        "niveles_objetivo": (Tipo: array, Descripción: Niveles objetivo),
        "grados_objetivo": (Tipo: array, Descripción: Grados objetivo),
        "cursos_objetivo": (Tipo: array, Descripción: Cursos objetivo)
      }
    ],
    "paginacion": {
      "pagina": (Tipo: number, Descripción: Página actual),
      "limite": (Tipo: number, Descripción: Límite de resultados),
      "total": (Tipo: number, Descripción: Total de borradores),
      "paginas": (Tipo: number, Descripción: Total de páginas)
    }
  }
}
```

---

### **24. Publicar Borrador**

**Endpoint:** `POST /comunicados/:id/publicar`
**Descripción:** Publica un borrador existente.
**Autenticación:** Bearer token (Roles: director, o autor del borrador)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del borrador a publicar)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "fecha_programada": (Tipo: string, Opcional, Descripción: Fecha programada para publicación, formato ISO 8601)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": (Tipo: string, Descripción: ID del comunicado publicado),
      "titulo": (Tipo: string, Descripción: Título del comunicado),
      "contenido": (Tipo: string, Descripción: Contenido del comunicado),
      "tipo": (Tipo: string, Descripción: Tipo de comunicado),
      "publico_objetivo": (Tipo: array, Descripción: Público objetivo),
      "niveles_objetivo": (Tipo: array, Descripción: Niveles objetivo),
      "grados_objetivo": (Tipo: array, Descripción: Grados objetivo),
      "cursos_objetivo": (Tipo: array, Descripción: Cursos objetivo),
      "fecha_publicacion": (Tipo: string, Descripción: Fecha de publicación),
      "fecha_programada": (Tipo: string, Descripción: Fecha programada),
      "estado": (Tipo: string, Descripción: Estado: 'publicado' o 'programado')
    },
    "mensaje": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Estado inválido):**
```json
{
  "success": false,
  "error": "Solo se pueden publicar comunicados en estado borrador"
}
```

---

### **25. Obtener Comunicados Programados**

**Endpoint:** `GET /comunicados/programados`
**Descripción:** Obtiene la lista de comunicados programados por el usuario.
**Autenticación:** Bearer token (Roles: director, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?page=(Tipo: number, Opcional, Descripción: Número de página, default: 1)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados por página, default: 10)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "comunicados_programados": [
      {
        "id": (Tipo: string, Descripción: ID del comunicado),
        "titulo": (Tipo: string, Descripción: Título del comunicado),
        "tipo": (Tipo: string, Descripción: Tipo de comunicado),
        "fecha_programada": (Tipo: string, Descripción: Fecha programada),
        "tiempo_restantante_ms": (Tipo: number, Descripción: Tiempo restante en milisegundos),
        "tiempo_restante": {
          "dias": (Tipo: number, Descripción: Días restantes),
          "horas": (Tipo: number, Descripción: Horas restantes),
          "minutos": (Tipo: number, Descripción: Minutos restantes)
        }
      }
    ],
    "paginacion": {
      "pagina": (Tipo: number, Descripción: Página actual),
      "limite": (Tipo: number, Descripción: Límite de resultados),
      "total": (Tipo: number, Descripción: Total de comunicados programados),
      "paginas": (Tipo: number, Descripción: Total de páginas)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "comunicados_programados": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "titulo": "Reunión de padres de familia",
        "tipo": "administrativo",
        "fecha_programada": "2025-11-05T18:00:00Z",
        "tiempo_restantante_ms": 432000000,
        "tiempo_restante": {
          "dias": 5,
          "horas": 0,
          "minutos": 0
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "titulo": "Evaluación de matemáticas",
        "tipo": "academico",
        "fecha_programada": "2025-11-02T10:00:00Z",
        "tiempo_restantante_ms": 86400000,
        "tiempo_restante": {
          "dias": 1,
          "horas": 0,
          "minutos": 0
        }
      }
    ],
    "paginacion": {
      "pagina": 1,
      "limite": 10,
      "total": 2,
      "paginas": 1
    }
  }
}
```

---

### **26. Cancelar Programación de Comunicado**

**Endpoint:** `DELETE /comunicados/:id/programacion`
**Descripción:** Cancela la programación de un comunicado, devolviéndolo a estado borrador.
**Autenticación:** Bearer token (Roles: director, o autor del comunicado)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del comunicado programado)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": (Tipo: string, Descripción: ID del comunicado),
      "estado": (Tipo: string, Descripción: Nuevo estado: 'borrador'),
      "fecha_programada": (Tipo: null, Descripción: Fecha programada eliminada)
    },
    "mensaje": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "estado": "borrador",
      "fecha_programada": null
    },
    "mensaje": "Programación cancelada correctamente"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Estado inválido):**
```json
{
  "success": false,
  "error": "Solo se puede cancelar la programación de comunicados en estado programado"
}
```

---

### **27. Validar HTML**

**Endpoint:** `POST /comunicados/validar-html`
**Descripción:** Valida y sanitiza el contenido HTML de un comunicado.
**Autenticación:** Bearer token (Roles: director, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "contenido": (Tipo: string, Obligatorio, Descripción: Contenido HTML a validar)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "contenido_sanitizado": (Tipo: string, Descripción: Contenido HTML sanitizado),
    "es_valido": (Tipo: boolean, Descripción: Indica si el contenido es válido),
    "elementos_peligrosos_detectados": (Tipo: boolean, Descripción: Indica si se detectaron elementos peligrosos)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "contenido_sanitizado": "<p>Se convoca a todos los padres de familia a una reunión importante para tratar temas académicos y administrativos del presente bimestre.</p>",
    "es_valido": true,
    "elementos_peligrosos_detectados": false
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Se requiere el contenido HTML"
}
```

---

### **28. Validar Segmentación**

**Endpoint:** `POST /comunicados/validar-segmentacion`
**Descripción:** Valida si el usuario tiene permisos para la segmentación especificada.
**Autenticación:** Bearer token (Roles: director, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "publico_objetivo": (Tipo: array, Obligatorio, Descripción: Público objetivo),
  "niveles": (Tipo: array, Opcional, Descripción: Niveles específicos),
  "grados": (Tipo: array, Opcional, Descripción: Grados específicos),
  "cursos": (Tipo: array, Opcional, Descripción: Cursos específicos),
  "todos": (Tipo: boolean, Opcional, Descripción: Indica si es para todos)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "es_valida": (Tipo: boolean, Descripción: Indica si la segmentación es válida),
    "mensaje": (Tipo: string, Descripción: Mensaje descriptivo del resultado)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "es_valida": true,
    "mensaje": "La segmentación es válida para tu rol y permisos"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Se requiere público objetivo"
}
```

---

### **29. Desactivar Comunicado**

**Endpoint:** `PATCH /comunicados/:id/desactivar`
**Descripción:** Desactiva un comunicado para que ya no sea visible para los destinatarios.
**Autenticación:** Bearer token (Rol: director)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del comunicado a desactivar)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "comunicado_id": (Tipo: string, Descripción: ID del comunicado desactivado),
    "estado": (Tipo: string, Descripción: Nuevo estado: 'desactivado'),
    "fecha_desactivacion": (Tipo: string, Descripción: Fecha de desactivación),
    "mensaje": "Comunicado desactivado correctamente. Ya no es visible para los destinatarios"
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "Solo los directores pueden desactivar comunicados"
}
```

---

### **30. Eliminar Comunicado**

**Endpoint:** `DELETE /comunicados/:id`
**Descripción:** Elimina permanentemente un comunicado y todos sus registros relacionados.
**Autenticación:** Bearer token (Rol: director)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del comunicado a eliminar)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "confirmacion": (Tipo: boolean, Obligatorio, Descripción: Confirmación explícita para eliminar),
  "motivo": (Tipo: string, Opcional, Descripción: Motivo de la eliminación)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "comunicado_id": (Tipo: string, Descripción: ID del comunicado eliminado),
    "eliminado": (Tipo: boolean, Descripción: Confirmación de eliminación),
    "fecha_eliminacion": (Tipo: string, Descripción: Fecha de eliminación),
    "mensaje": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "comunicado_id": "550e8400-e29b-41d4-a716-446655440001",
    "eliminado": true,
    "fecha_eliminacion": "2025-10-31T21:00:00Z",
    "mensaje": "Comunicado eliminado permanentemente"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Confirmación requerida):**
```json
{
  "success": false,
  "error": "Se requiere confirmación explícita para eliminar"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "Solo los directores pueden eliminar comunicados"
}
```

---

## Módulo de Encuestas

### **31. Obtener Lista de Encuestas**

**Endpoint:** `GET /encuestas/`
**Descripción:** Obtiene la lista de encuestas visibles para el usuario con paginación y filtros.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?page=(Tipo: number, Opcional, Descripción: Número de página, default: 1)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados por página, default: 12)
&estado=(Tipo: string, Opcional, Descripción: Estado de la encuesta: 'todos', 'activas', 'respondidas', 'vencidas')
&tipo=(Tipo: string, Opcional, Descripción: Tipo de encuesta: 'todos', 'institucionales', 'propias')
&autor_id=(Tipo: string, Opcional, Descripción: ID del autor para filtrar, solo para directores)
&busqueda=(Tipo: string, Opcional, Descripción: Término de búsqueda en título y descripción)
&ordenamiento=(Tipo: string, Opcional, Descripción: Ordenamiento: 'mas_reciente', 'mas_antiguo', 'por_vencimiento', 'por_nombre')
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": (Tipo: string, Descripción: ID del usuario),
      "rol": (Tipo: string, Descripción: Rol del usuario)
    },
    "encuestas": [
      {
        "id": (Tipo: string, Descripción: ID de la encuesta),
        "titulo": (Tipo: string, Descripción: Título de la encuesta),
        "descripcion": (Tipo: string, Descripción: Descripción de la encuesta),
        "estado": (Tipo: string, Descripción: Estado de la encuesta),
        "fecha_creacion": (Tipo: string, Descripción: Fecha de creación),
        "fecha_vencimiento": (Tipo: string, Descripción: Fecha de vencimiento),
        "tipo": (Tipo: string, Descripción: Tipo de encuesta),
        "estado_respuesta": {
          "respondida": (Tipo: boolean, Descripción: Indica si ha sido respondida),
          "fecha_respuesta": (Tipo: string, Descripción: Fecha de respuesta)
        },
        "es_autor": (Tipo: boolean, Descripción: Indica si el usuario es el autor),
        "puede_responder": (Tipo: boolean, Descripción: Indica si puede responder),
        "puede_ver_resultados": (Tipo: boolean, Descripción: Indica si puede ver resultados),
        "dias_para_vencimiento": (Tipo: number, Descripción: Días restantes para vencimiento),
        "proxima_a_vencer": (Tipo: boolean, Descripción: Indica si está próxima a vencer),
        "porcentaje_participacion": (Tipo: number, Descripción: Porcentaje de participación),
        "total_respuestas": (Tipo: number, Descripción: Total de respuestas),
        "autor": {
          "id": (Tipo: string, Descripción: ID del autor),
          "nombre": (Tipo: string, Descripción: Nombre del autor),
          "apellido": (Tipo: string, Descripción: Apellido del autor),
          "rol": (Tipo: string, Descripción: Rol del autor)
        }
      }
    ],
    "paginacion": {
      "page": (Tipo: number, Descripción: Página actual),
      "limit": (Tipo: number, Descripción: Límite de resultados),
      "total_encuestas": (Tipo: number, Descripción: Total de encuestas),
      "total_pages": (Tipo: number, Descripción: Total de páginas),
      "has_next": (Tipo: boolean, Descripción: Indica si hay página siguiente),
      "has_prev": (Tipo: boolean, Descripción: Indica si hay página anterior)
    },
    "contadores": {
      "total": (Tipo: number, Descripción: Total de encuestas),
      "activas": (Tipo: number, Descripción: Total de encuestas activas),
      "respondidas": (Tipo: number, Descripción: Total de encuestas respondidas),
      "vencidas": (Tipo: number, Descripción: Total de encuestas vencidas)
    },
    "filtros_aplicados": {
      "estado": (Tipo: string, Descripción: Estado aplicado),
      "tipo": (Tipo: string, Descripción: Tipo aplicado),
      "autor_id": (Tipo: string, Descripción: ID del autor aplicado)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "rol": "apoderado"
    },
    "encuestas": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "titulo": "Encuesta de satisfacción escolar",
        "descripcion": "Esta encuesta busca conocer tu nivel de satisfacción con los servicios educativos",
        "estado": "activa",
        "fecha_creacion": "2025-10-15T10:30:00Z",
        "fecha_vencimiento": "2025-11-15T23:59:59Z",
        "tipo": "institucional",
        "estado_respuesta": {
          "respondida": false,
          "fecha_respuesta": null
        },
        "es_autor": false,
        "puede_responder": true,
        "puede_ver_resultados": false,
        "dias_para_vencimiento": 15,
        "proxima_a_vencer": false,
        "porcentaje_participacion": 25,
        "total_respuestas": 25,
        "autor": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "nombre": "María",
          "apellido": "González",
          "rol": "director"
        }
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 12,
      "total_encuestas": 5,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "contadores": {
      "total": 5,
      "activas": 3,
      "respondidas": 1,
      "vencidas": 1
    },
    "filtros_aplicados": {
      "estado": "todos",
      "tipo": "todos",
      "autor_id": null
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **32. Obtener Contador de Encuestas Pendientes**

**Endpoint:** `GET /encuestas/pendientes/count`
**Descripción:** Obtiene el contador de encuestas pendientes de respuesta para el usuario autenticado.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "total_pendientes": (Tipo: number, Descripción: Total de encuestas pendientes),
    "por_tipo": {
      "institucionales": (Tipo: number, Descripción: Pendientes institucionales),
      "propias": (Tipo: number, Descripción: Pendientes propias)
    },
    "proximas_a_vencer": [
      {
        "id": (Tipo: string, Descripción: ID de la encuesta),
        "titulo": (Tipo: string, Descripción: Título de la encuesta),
        "dias_restantes": (Tipo: number, Descripción: Días restantes para vencimiento),
        "tipo": (Tipo: string, Descripción: Tipo de encuesta)
      }
    ]
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_pendientes": 3,
    "por_tipo": {
      "institucionales": 2,
      "propias": 1
    },
    "proximas_a_vencer": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "titulo": "Encuesta de satisfacción escolar",
        "dias_restantes": 2,
        "tipo": "institucional"
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **33. Buscar Encuestas**

**Endpoint:** `GET /encuestas/search`
**Descripción:** Busca encuestas por término en título y descripción.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?query=(Tipo: string, Obligatorio, Descripción: Término de búsqueda, mínimo 2 caracteres)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados, default: 20)
&offset=(Tipo: number, Opcional, Descripción: Desplazamiento para paginación, default: 0)
&estado=(Tipo: string, Opcional, Descripción: Estado de la encuesta: 'todos', 'activas', 'respondidas', 'vencidas')
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "query": (Tipo: string, Descripción: Término buscado),
    "resultados": [
      {
        "id": (Tipo: string, Descripción: ID de la encuesta),
        "titulo": (Tipo: string, Descripción: Título con término resaltado),
        "descripcion": (Tipo: string, Descripción: Descripción con término resaltado),
        "estado": (Tipo: string, Descripción: Estado de la encuesta),
        "fecha_creacion": (Tipo: string, Descripción: Fecha de creación),
        "destacado": (Tipo: string, Descripción: Texto destacado),
        "match_en": (Tipo: string, Descripción: Dónde se encontró coincidencia),
        "relevancia": (Tipo: number, Descripción: Puntuación de relevancia)
      }
    ],
    "total_resultados": (Tipo: number, Descripción: Total de resultados encontrados),
    "paginacion": {
      "limit": (Tipo: number, Descripción: Límite de resultados),
      "offset": (Tipo: number, Descripción: Desplazamiento),
      "has_more": (Tipo: boolean, Descripción: Indica si hay más resultados)
    }
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "query": "satisfacción",
    "resultados": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "titulo": "Encuesta de <mark>satisfacción</mark> escolar",
        "descripcion": "Esta encuesta busca conocer tu nivel de <mark>satisfacción</mark> con los servicios educativos",
        "estado": "activa",
        "fecha_creacion": "2025-10-15T10:30:00Z",
        "destacado": "Encuesta de <mark>satisfacción</mark> escolar",
        "match_en": "titulo",
        "relevancia": 95
      }
    ],
    "total_resultados": 1,
    "paginacion": {
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "El término de búsqueda debe tener al menos 2 caracteres"
}
```

---

### **34. Verificar Actualizaciones de Encuestas**

**Endpoint:** `GET /encuestas/actualizaciones`
**Descripción:** Verifica si hay nuevas encuestas o actualizaciones desde la última verificación (polling).
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?ultimo_check=(Tipo: string, Obligatorio, Descripción: Fecha y hora de la última verificación, formato ISO 8601)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": (Tipo: boolean, Descripción: Indica si hay actualizaciones),
    "nuevas_encuestas": [
      {
        "id": (Tipo: string, Descripción: ID de la encuesta),
        "titulo": (Tipo: string, Descripción: Título de la encuesta),
        "descripcion": (Tipo: string, Descripción: Descripción de la encuesta),
        "estado": (Tipo: string, Descripción: Estado de la encuesta),
        "fecha_creacion": (Tipo: string, Descripción: Fecha de creación),
        "tipo": (Tipo: string, Descripción: Tipo de encuesta),
        "estado_respuesta": {
          "respondida": (Tipo: boolean, Descripción: Indica si ha sido respondida),
          "fecha_respuesta": (Tipo: string, Descripción: Fecha de respuesta)
        },
        "es_autor": (Tipo: boolean, Descripción: Indica si el usuario es el autor),
        "puede_responder": (Tipo: boolean, Descripción: Indica si puede responder),
        "dias_para_vencimiento": (Tipo: number, Descripción: Días para vencimiento),
        "autor": {
          "id": (Tipo: string, Descripción: ID del autor),
          "nombre": (Tipo: string, Descripción: Nombre del autor),
          "apellido": (Tipo: string, Descripción: Apellido del autor),
          "rol": (Tipo: string, Descripción: Rol del autor)
        }
      }
    ],
    "encuestas_actualizadas": (Tipo: array, Descripción: Encuestas actualizadas),
    "total_nuevas_encuestas": (Tipo: number, Descripción: Total de nuevas encuestas),
    "total_actualizaciones": (Tipo: number, Descripción: Total de actualizaciones),
    "contador_pendientes": (Tipo: number, Descripción: Contador de pendientes)
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": true,
    "nuevas_encuestas": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "titulo": "Nueva encuesta de opinión",
        "descripcion": "Queremos conocer tu opinión sobre las actividades extracurriculares",
        "estado": "activa",
        "fecha_creacion": "2025-10-30T14:20:00Z",
        "tipo": "institucional",
        "estado_respuesta": {
          "respondida": false,
          "fecha_respuesta": null
        },
        "es_autor": false,
        "puede_responder": true,
        "dias_para_vencimiento": 30,
        "autor": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "nombre": "María",
          "apellido": "González",
          "rol": "director"
        }
      }
    ],
    "encuestas_actualizadas": [],
    "total_nuevas_encuestas": 1,
    "total_actualizaciones": 0,
    "contador_pendientes": 3
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "El parámetro ultimo_check es requerido"
}
```

---

### **35. Validar Acceso a Encuesta**

**Endpoint:** `GET /encuestas/:id/validar-acceso`
**Descripción:** Verifica si el usuario tiene acceso a una encuesta específica y si puede responderla.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID de la encuesta)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "550e8400-e29b-41d4-a716-446655440001",
    "tiene_acceso": true,
    "motivo": "Encuesta dirigida al grado de su hijo",
    "puede_responder": true,
    "estado_encuesta": "activa",
    "fecha_vencimiento": "2025-11-15T23:59:59Z",
    "dias_restantes": 15,
    "ya_respondio": false,
    "segmentacion_valida": true
  }
}
```

#### **Respuestas de Error:**
**Código 404 Not Found (Encuesta no encontrada):**
```json
{
  "success": false,
  "error": "Encuesta no encontrada"
}
```

---

### **36. Obtener Formulario de Encuesta**

**Endpoint:** `GET /encuestas/:id/formulario`
**Descripción:** Obtiene el formulario completo de una encuesta para responder.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID de la encuesta)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Encuesta de satisfacción escolar",
      "descripcion": "Esta encuesta busca conocer tu nivel de satisfacción con los servicios educativos",
      "fecha_vencimiento": "2025-11-15T23:59:59Z",
      "fecha_vencimiento_legible": "15 de noviembre de 2025, 11:59 PM",
      "dias_restantes": 15,
      "total_preguntas": 5,
      "preguntas_obligatorias": 3,
      "tiempo_estimado": 8,
      "autor": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "nombre": "María",
        "apellido": "González",
        "rol": "director"
      }
    },
    "preguntas": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "tipo": "opcion_unica",
        "texto": "¿Cómo califica la calidad de la enseñanza?",
        "obligatoria": true,
        "orden": 1,
        "opciones": [
          {
            "id": "550e8400-e29b-41d4-a716-446655440006",
            "texto": "Excelente",
            "orden": 1
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440007",
            "texto": "Buena",
            "orden": 2
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440008",
            "texto": "Regular",
            "orden": 3
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440009",
            "texto": "Mala",
            "orden": 4
          }
        ],
        "validacion": {
          "min_opciones": 1,
          "max_opciones": 1
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "tipo": "escala_1_5",
        "texto": "¿Qué tan satisfecho está con la comunicación de la escuela?",
        "obligatoria": true,
        "orden": 2,
        "etiquetas": ["Muy insatisfecho", "Insatisfecho", "Neutral", "Satisfecho", "Muy satisfecho"],
        "validacion": {
          "min_valor": 1,
          "max_valor": 5
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "tipo": "texto_largo",
        "texto": "¿Qué sugerencias tiene para mejorar la experiencia educativa?",
        "obligatoria": false,
        "orden": 3,
        "validacion": {
          "min_caracteres": 10,
          "max_caracteres": 2000
        }
      }
    ],
    "progreso": {
      "pregunta_actual": 1,
      "total_preguntas": 5,
      "porcentaje_completado": 0
    }
  }
}
```

#### **Respuestas de Error:**
**Código 404 Not Found (Encuesta no encontrada):**
```json
{
  "success": false,
  "error": "Encuesta no encontrada"
}
```

**Código 400 Bad Request (No puede responder):**
```json
{
  "success": false,
  "error": {
    "code": "NO_PUEDE_RESPONDER",
    "message": "Ya has respondido esta encuesta"
  }
}
```

---

### **37. Crear Encuesta**

**Endpoint:** `POST /encuestas/`
**Descripción:** Crea una nueva encuesta con sus preguntas y opciones.
**Autenticación:** Bearer token (Roles: director, docente con permisos)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "titulo": (Tipo: string, Obligatorio, Descripción: Título de la encuesta, entre 3-200 caracteres),
  "descripcion": (Tipo: string, Obligatorio, Descripción: Descripción de la encuesta, mínimo 10 caracteres),
  "fecha_inicio": (Tipo: string, Opcional, Descripción: Fecha de inicio, formato ISO 8601),
  "fecha_vencimiento": (Tipo: string, Opcional, Descripción: Fecha de vencimiento, formato ISO 8601),
  "permite_respuesta_multiple": (Tipo: boolean, Opcional, Descripción: Permite múltiples respuestas, default: false),
  "es_anonima": (Tipo: boolean, Opcional, Descripción: Es anónima, default: false),
  "mostrar_resultados": (Tipo: boolean, Opcional, Descripción: Muestra resultados, default: true),
  "año_academico": (Tipo: number, Obligatorio, Descripción: Año académico),
  "preguntas": (Tipo: array, Obligatorio, Descripción: Lista de preguntas, mínimo 1)
}
```

#### **Ejemplo de Cuerpo de Petición:**
```json
{
  "titulo": "Encuesta de satisfacción escolar",
  "descripcion": "Esta encuesta busca conocer tu nivel de satisfacción con los servicios educativos",
  "fecha_vencimiento": "2025-11-15T23:59:59Z",
  "permite_respuesta_multiple": false,
  "es_anonima": false,
  "mostrar_resultados": true,
  "año_academico": 2025,
  "preguntas": [
    {
      "texto": "¿Cómo califica la calidad de la enseñanza?",
      "tipo": "opcion_unica",
      "obligatoria": true,
      "orden": 1,
      "opciones": [
        {
          "texto": "Excelente",
          "orden": 1
        },
        {
          "texto": "Buena",
          "orden": 2
        },
        {
          "texto": "Regular",
          "orden": 3
        },
        {
          "texto": "Mala",
          "orden": 4
        }
      ]
    },
    {
      "texto": "¿Qué tan satisfecho está con la comunicación de la escuela?",
      "tipo": "escala_1_5",
      "obligatoria": true,
      "orden": 2
    },
    {
      "texto": "¿Qué sugerencias tiene para mejorar la experiencia educativa?",
      "tipo": "texto_largo",
      "obligatoria": false,
      "orden": 3
    }
  ]
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Encuesta de satisfacción escolar",
      "descripcion": "Esta encuesta busca conocer tu nivel de satisfacción con los servicios educativos",
      "fecha_inicio": "2025-10-31T20:00:00Z",
      "fecha_vencimiento": "2025-11-15T23:59:59Z",
      "permite_respuesta_multiple": false,
      "es_anonima": false,
      "mostrar_resultados": true,
      "año_academico": 2025,
      "estado": "activa",
      "autor_id": "550e8400-e29b-41d4-a716-446655440002",
      "fecha_creacion": "2025-10-31T20:00:00Z",
      "autor": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "nombre": "María",
        "apellido": "González",
        "rol": "director"
      },
      "preguntas": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440005",
          "texto": "¿Cómo califica la calidad de la enseñanza?",
          "tipo": "opcion_unica",
          "obligatoria": true,
          "orden": 1,
          "opciones": [
            {
              "id": "550e8400-e29b-41d4-a716-446655440006",
              "texto": "Excelente",
              "orden": 1
            },
            {
              "id": "550e8400-e29b-41d4-a716-446655440007",
              "texto": "Buena",
              "orden": 2
            },
            {
              "id": "550e8400-e29b-41d4-a716-446655440008",
              "texto": "Regular",
              "orden": 3
            },
            {
              "id": "550e8400-e29b-41d4-a716-446655440009",
              "texto": "Mala",
              "orden": 4
            }
          ]
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "texto": "¿Qué tan satisfecho está con la comunicación de la escuela?",
          "tipo": "escala_1_5",
          "obligatoria": true,
          "orden": 2,
          "opciones": []
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440011",
          "texto": "¿Qué sugerencias tiene para mejorar la experiencia educativa?",
          "tipo": "texto_largo",
          "obligatoria": false,
          "orden": 3,
          "opciones": []
        }
      ]
    },
    "mensaje": "Encuesta creada exitosamente"
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para crear encuestas"
  }
}
```

**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Datos inválidos",
    "details": [
      {
        "path": ["titulo"],
        "message": "El título debe tener al menos 3 caracteres"
      }
    ]
  }
}
```

---

### **38. Enviar Respuestas de Encuesta**

**Endpoint:** `POST /encuestas/respuestas`
**Descripción:** Envía las respuestas de un usuario a una encuesta.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "encuesta_id": (Tipo: string, Obligatorio, Descripción: ID de la encuesta),
  "estudiante_id": (Tipo: string, Opcional, Descripción: ID del estudiante relacionado, para padres),
  "respuestas": (Tipo: array, Obligatorio, Descripción: Lista de respuestas, mínimo 1),
  "tiempo_respuesta_minutos": (Tipo: number, Opcional, Descripción: Tiempo empleado en responder)
}
```

#### **Ejemplo de Cuerpo de Petición:**
```json
{
  "encuesta_id": "550e8400-e29b-41d4-a716-446655440001",
  "estudiante_id": "550e8400-e29b-41d4-a716-446655440012",
  "respuestas": [
    {
      "pregunta_id": "550e8400-e29b-41d4-a716-446655440005",
      "valor_opcion_id": "550e8400-e29b-41d4-a716-446655440007"
    },
    {
      "pregunta_id": "550e8400-e29b-41d4-a716-446655440010",
      "valor_escala": 4
    },
    {
      "pregunta_id": "550e8400-e29b-41d4-a716-446655440011",
      "valor_texto": "Me gustaría que hubiera más actividades extracurriculares y mejor comunicación sobre los eventos escolares."
    }
  ],
  "tiempo_respuesta_minutos": 8
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**
```json
{
  "success": true,
  "data": {
    "respuesta": {
      "id": "550e8400-e29b-41d4-a716-446655440013",
      "encuesta_id": "550e8400-e29b-41d4-a716-446655440001",
      "usuario_id": "550e8400-e29b-41d4-a716-446655440000",
      "estudiante_id": "550e8400-e29b-41d4-a716-446655440012",
      "fecha_respuesta": "2025-10-31T20:30:00Z",
      "tiempo_respuesta_minutos": 8,
      "total_preguntas": 3,
      "preguntas_respondidas": 3,
      "ip_respuesta": "192.168.1.100"
    },
    "estadisticas_actualizadas": {
      "total_respuestas": 26,
      "porcentaje_participacion": 26
    },
    "mensaje": "¡Respuestas enviadas exitosamente! Gracias por tu participación."
  }
}
```

#### **Respuestas de Error:**
**Código 404 Not Found (Encuesta no encontrada):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Encuesta no encontrada"
  }
}
```

**Código 409 Conflict (Ya respondida):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Ya has respondido esta encuesta anteriormente"
  }
}
```

**Código 400 Bad Request (Preguntas obligatorias faltantes):**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Las siguientes preguntas obligatorias no fueron respondidas",
    "details": {
      "preguntas_faltantes": ["550e8400-e29b-41d4-a716-446655440005"]
    }
  }
}
```

---

### **39. Obtener Mis Respuestas de Encuesta**

**Endpoint:** `GET /encuestas/:id/mis-respuestas`
**Descripción:** Obtiene las respuestas que el usuario ha enviado a una encuesta específica.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID de la encuesta)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": (Tipo: string, Descripción: ID de la encuesta),
      "titulo": (Tipo: string, Descripción: Título de la encuesta),
      "descripcion": (Tipo: string, Descripción: Descripción de la encuesta),
      "fecha_vencimiento": (Tipo: string, Descripción: Fecha de vencimiento),
      "autor": {
        "id": (Tipo: string, Descripción: ID del autor),
        "nombre": (Tipo: string, Descripción: Nombre del autor),
        "apellido": (Tipo: string, Descripción: Apellido del autor),
        "rol": (Tipo: string, Descripción: Rol del autor)
      }
    },
    "respuesta": {
      "id": (Tipo: string, Descripción: ID de la respuesta),
      "fecha_respuesta": (Tipo: string, Descripción: Fecha de respuesta),
      "fecha_respuesta_legible": (Tipo: string, Descripción: Fecha formateada legible),
      "tiempo_respuesta_minutos": (Tipo: number, Descripción: Tiempo empleado en responder),
      "total_preguntas": (Tipo: number, Descripción: Total de preguntas),
      "preguntas_respondidas": (Tipo: number, Descripción: Preguntas respondidas),
      "completitud": (Tipo: number, Descripción: Porcentaje de completitud),
      "estudiante_relacionado": {
        "id": (Tipo: string, Descripción: ID del estudiante),
        "nombre_completo": (Tipo: string, Descripción: Nombre completo del estudiante),
        "grado": (Tipo: string, Descripción: Grado del estudiante),
        "nivel": (Tipo: string, Descripción: Nivel del estudiante)
      }
    },
    "respuestas_detalle": [
      {
        "pregunta_id": (Tipo: string, Descripción: ID de la pregunta),
        "tipo": (Tipo: string, Descripción: Tipo de pregunta),
        "texto_pregunta": (Tipo: string, Descripción: Texto de la pregunta),
        "valor": (Tipo: string/number, Descripción: Valor respondido),
        "valor_opcion_id": (Tipo: string, Descripción: ID de la opción seleccionada),
        "valor_escala": (Tipo: number, Descripción: Valor en escala),
        "valor_texto": (Tipo: string, Descripción: Valor de texto),
        "obligatoria": (Tipo: boolean, Descripción: Indica si es obligatoria),
        "respondida": (Tipo: boolean, Descripción: Indica si fue respondida),
        "opciones_disponibles": (Tipo: array, Descripción: Opciones disponibles),
        "etiquetas": (Tipo: array, Descripción: Etiquetas de escala)
      }
    ]
  }
}
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Encuesta de satisfacción escolar",
      "descripcion": "Esta encuesta busca conocer tu nivel de satisfacción con los servicios educativos",
      "fecha_vencimiento": "2025-11-15T23:59:59Z",
      "autor": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "nombre": "María",
        "apellido": "González",
        "rol": "director"
      }
    },
    "respuesta": {
      "id": "550e8400-e29b-41d4-a716-446655440013",
      "fecha_respuesta": "2025-10-31T20:30:00Z",
      "fecha_respuesta_legible": "31 de octubre de 2025, 08:30 PM",
      "tiempo_respuesta_minutos": 8,
      "total_preguntas": 3,
      "preguntas_respondidas": 3,
      "completitud": 100,
      "estudiante_relacionado": {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "nombre_completo": "Juan Pérez",
        "grado": "4°",
        "nivel": "Primaria"
      }
    },
    "respuestas_detalle": [
      {
        "pregunta_id": "550e8400-e29b-41d4-a716-446655440005",
        "tipo": "opcion_unica",
        "texto_pregunta": "¿Cómo califica la calidad de la enseñanza?",
        "valor": "Buena",
        "valor_opcion_id": "550e8400-e29b-41d4-a716-446655440007",
        "obligatoria": true,
        "respondida": true,
        "opciones_disponibles": ["Excelente", "Buena", "Regular", "Mala"]
      },
      {
        "pregunta_id": "550e8400-e29b-41d4-a716-446655440010",
        "tipo": "escala_1_5",
        "texto_pregunta": "¿Qué tan satisfecho está con la comunicación de la escuela?",
        "valor": 4,
        "valor_escala": 4,
        "obligatoria": true,
        "respondida": true,
        "opciones_disponibles": ["Muy insatisfecho", "Insatisfecho", "Neutral", "Satisfecho", "Muy satisfecho"],
        "etiquetas": ["Muy insatisfecho", "Insatisfecho", "Neutral", "Satisfecho", "Muy satisfecho"]
      },
      {
        "pregunta_id": "550e8400-e29b-41d4-a716-446655440011",
        "tipo": "texto_largo",
        "texto_pregunta": "¿Qué sugerencias tiene para mejorar la experiencia educativa?",
        "valor": "Me gustaría que hubiera más actividades extracurriculares y mejor comunicación sobre los eventos escolares.",
        "valor_texto": "Me gustaría que hubiera más actividades extracurriculares y mejor comunicación sobre los eventos escolares.",
        "obligatoria": false,
        "respondida": true
      }
    ]
  }
}
---

## Módulo de Mensajería

### **40. Obtener Lista de Conversaciones**

**Endpoint:** `GET /conversaciones`
**Descripción:** Obtiene la lista de conversaciones del usuario con paginación y filtros.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?page=(Tipo: number, Opcional, Descripción: Número de página, default: 1)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados por página, default: 20)
&filtro=(Tipo: string, Opcional, Descripción: Filtro: 'todos', 'recibidos', 'enviados', default: 'todos')
&estudiante_id=(Tipo: string, Opcional, Descripción: ID del estudiante para filtrar)
&curso_id=(Tipo: string, Opcional, Descripción: ID del curso para filtrar)
&grado=(Tipo: number, Opcional, Descripción: Grado para filtrar)
&estado=(Tipo: string, Opcional, Descripción: Estado: 'activa', 'cerrada', default: 'activa')
&busqueda=(Tipo: string, Opcional, Descripción: Término de búsqueda, mínimo 2 caracteres)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": (Tipo: string, Descripción: ID del usuario),
      "nombre": (Tipo: string, Descripción: Nombre completo del usuario),
      "rol": (Tipo: string, Descripción: Rol del usuario)
    },
    "conversaciones": [
      {
        "id": (Tipo: string, Descripción: ID de la conversación),
        "asunto": (Tipo: string, Descripción: Asunto de la conversación),
        "estudiante": {
          "id": (Tipo: string, Descripción: ID del estudiante),
          "nombre_completo": (Tipo: string, Descripción: Nombre completo del estudiante),
          "codigo_estudiante": (Tipo: string, Descripción: Código del estudiante)
        },
        "curso": {
          "id": (Tipo: string, Descripción: ID del curso),
          "nombre": (Tipo: string, Descripción: Nombre del curso),
          "nivel_grado": {
            "nivel": (Tipo: string, Descripción: Nivel educativo),
            "grado": (Tipo: string, Descripción: Grado)
          }
        },
        "otro_usuario": {
          "id": (Tipo: string, Descripción: ID del otro participante),
          "nombre_completo": (Tipo: string, Descripción: Nombre completo del otro participante),
          "rol": (Tipo: string, Descripción: Rol del otro participante)
        },
        "ultimo_mensaje": {
          "id": (Tipo: string, Descripción: ID del último mensaje),
          "contenido": (Tipo: string, Descripción: Contenido del último mensaje, truncado a 80 caracteres),
          "emisor_id": (Tipo: string, Descripción: ID del emisor del último mensaje),
          "fecha_envio": (Tipo: string, Descripción: Fecha de envío del último mensaje),
          "fecha_envio_relativa": (Tipo: string, Descripción: Tiempo relativo del último mensaje),
          "tiene_adjuntos": (Tipo: boolean, Descripción: Indica si el último mensaje tiene adjuntos),
          "estado_lectura": (Tipo: string, Descripción: Estado de lectura del último mensaje)
        },
        "fecha_ultimo_mensaje": (Tipo: string, Descripción: Fecha del último mensaje),
        "mensajes_no_leidos": (Tipo: number, Descripción: Número de mensajes no leídos),
        "estado": (Tipo: string, Descripción: Estado de la conversación),
        "iniciado_por": (Tipo: string, Descripción: Quién inició la conversación: 'padre' o 'docente'),
        "fecha_inicio": (Tipo: string, Descripción: Fecha de inicio de la conversación)
      }
    ],
    "paginacion": {
      "page": (Tipo: number, Descripción: Página actual),
      "limit": (Tipo: number, Descripción: Límite de resultados),
      "total_conversaciones": (Tipo: number, Descripción: Total de conversaciones),
      "total_pages": (Tipo: number, Descripción: Total de páginas),
      "has_next": (Tipo: boolean, Descripción: Indica si hay página siguiente),
      "has_prev": (Tipo: boolean, Descripción: Indica si hay página anterior)
    },
    "contadores": {
      "total": (Tipo: number, Descripción: Total de conversaciones),
      "recibidas": (Tipo: number, Descripción: Total de conversaciones recibidas),
      "enviadas": (Tipo: number, Descripción: Total de conversaciones enviadas),
      "no_leidas": (Tipo: number, Descripción: Total de mensajes no leídos)
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 404 Not Found (Sin conversaciones):**
```json
{
  "success": false,
  "error": "No tiene conversaciones registradas"
}
```

---

### **41. Obtener Contador de Mensajes No Leídos**

**Endpoint:** `GET /conversaciones/no-leidas/count`
**Descripción:** Obtiene el contador de mensajes no leídos para el usuario autenticado.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "total_no_leidos": (Tipo: number, Descripción: Total de mensajes no leídos),
    "por_conversacion": [
      {
        "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
        "asunto": (Tipo: string, Descripción: Asunto de la conversación),
        "mensajes_no_leidos": (Tipo: number, Descripción: Número de mensajes no leídos en esta conversación),
        "ultimo_mensaje_fecha": (Tipo: string, Descripción: Fecha del último mensaje)
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (Token no proporcionado o inválido):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **42. Verificar Actualizaciones de Conversaciones**

**Endpoint:** `GET /conversaciones/actualizaciones`
**Descripción:** Verifica si hay nuevos mensajes en conversaciones desde la última verificación (polling).
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?ultimo_check=(Tipo: string, Obligatorio, Descripción: Fecha y hora de la última verificación, formato ISO 8601)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": (Tipo: boolean, Descripción: Indica si hay actualizaciones),
    "nuevos_mensajes": [
      {
        "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
        "mensaje_id": (Tipo: string, Descripción: ID del mensaje),
        "emisor": {
          "id": (Tipo: string, Descripción: ID del emisor),
          "nombre": (Tipo: string, Descripción: Nombre completo del emisor)
        },
        "contenido_preview": (Tipo: string, Descripción: Vista previa del contenido, truncado a 80 caracteres),
        "fecha_envio": (Tipo: string, Descripción: Fecha de envío),
        "tiene_adjuntos": (Tipo: boolean, Descripción: Indica si tiene adjuntos)
      }
    ],
    "total_nuevos_mensajes": (Tipo: number, Descripción: Total de nuevos mensajes),
    "conversaciones_actualizadas": (Tipo: array, Descripción: IDs de conversaciones actualizadas),
    "contador_no_leidos": (Tipo: number, Descripción: Contador de mensajes no leídos)
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "El parámetro 'ultimo_check' debe ser un ISO válido"
}
```

---

### **43. Marcar Conversación como Leída**

**Endpoint:** `PATCH /conversaciones/:id/marcar-leida`
**Descripción:** Marca todos los mensajes de una conversación como leídos para el usuario.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID de la conversación)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
    "mensajes_actualizados": (Tipo: number, Descripción: Número de mensajes marcados como leídos),
    "nuevo_contador_no_leidos": (Tipo: number, Descripción: Nuevo contador de mensajes no leídos)
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tiene permisos para ver esta conversación"
}
```

**Código 404 Not Found (Conversación no encontrada):**
```json
{
  "success": false,
  "error": "La conversación no existe o ha sido eliminada"
}
```

---

### **44. Cerrar Conversación**

**Endpoint:** `PATCH /conversaciones/:id/cerrar`
**Descripción:** Cierra o archiva una conversación (solo el creador puede cerrarla).
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID de la conversación)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
    "estado": (Tipo: string, Descripción: Nuevo estado: 'cerrada'),
    "fecha_cierre": (Tipo: string, Descripción: Fecha de cierre),
    "mensaje": (Tipo: string, Descripción: Mensaje de confirmación)
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tiene permisos para cerrar esta conversación"
}
```

**Código 404 Not Found (Conversación no encontrada):**
```json
{
  "success": false,
  "error": "La conversación no existe o ha sido eliminada"
}
```

---

### **45. Verificar si Existe Conversación**

**Endpoint:** `GET /conversaciones/existe`
**Descripción:** Verifica si ya existe una conversación activa entre un padre, docente, estudiante y curso.
**Autenticación:** Bearer token (Rol: apoderado)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?docente_id=(Tipo: string, Obligatorio, Descripción: ID del docente)
&estudiante_id=(Tipo: string, Obligatorio, Descripción: ID del estudiante)
&curso_id=(Tipo: string, Obligatorio, Descripción: ID del curso)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "existe": (Tipo: boolean, Descripción: Indica si existe la conversación),
    "conversacion": {
      "id": (Tipo: string, Descripción: ID de la conversación),
      "asunto": (Tipo: string, Descripción: Asunto de la conversación),
      "fecha_inicio": (Tipo: string, Descripción: Fecha de inicio),
      "total_mensajes": (Tipo: number, Descripción: Total de mensajes),
      "ultimo_mensaje_fecha": (Tipo: string, Descripción: Fecha del último mensaje)
    },
    "mensaje": (Tipo: string, Descripción: Mensaje descriptivo)
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "Acción no permitida para el rol"
}
```

---

### **46. Crear Nueva Conversación**

**Endpoint:** `POST /conversaciones`
**Descripción:** Crea una nueva conversación con el primer mensaje (solo para padres/apoderados).
**Autenticación:** Bearer token (Rol: apoderado)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### **Cuerpo de la Petición (Request Body):**
```
estudiante_id=(Tipo: string, Obligatorio, Descripción: ID del estudiante)
curso_id=(Tipo: string, Obligatorio, Descripción: ID del curso)
docente_id=(Tipo: string, Obligatorio, Descripción: ID del docente)
asunto=(Tipo: string, Obligatorio, Descripción: Asunto de la conversación, entre 10-200 caracteres)
mensaje=(Tipo: string, Obligatorio, Descripción: Contenido del primer mensaje, entre 10-1000 caracteres)
año=(Tipo: number, Opcional, Descripción: Año académico, default: año actual)
archivos=(Tipo: file[], Opcional, Descripción: Archivos adjuntos)
```

#### **Respuestas de Éxito:**
**Código 201 Created:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "conversacion": {
      "id": (Tipo: string, Descripción: ID de la conversación creada),
      "asunto": (Tipo: string, Descripción: Asunto de la conversación),
      "estudiante_id": (Tipo: string, Descripción: ID del estudiante),
      "curso_id": (Tipo: string, Descripción: ID del curso),
      "padre_id": (Tipo: string, Descripción: ID del padre/apoderado),
      "docente_id": (Tipo: string, Descripción: ID del docente),
      "estado": (Tipo: string, Descripción: Estado de la conversación),
      "fecha_inicio": (Tipo: string, Descripción: Fecha de inicio),
      "fecha_ultimo_mensaje": (Tipo: string, Descripción: Fecha del último mensaje),
      "tipo_conversacion": (Tipo: string, Descripción: Tipo de conversación),
      "creado_por": (Tipo: string, Descripción: ID del creador)
    },
    "mensaje": {
      "id": (Tipo: string, Descripción: ID del mensaje creado),
      "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
      "emisor_id": (Tipo: string, Descripción: ID del emisor),
      "contenido": (Tipo: string, Descripción: Contenido del mensaje),
      "fecha_envio": (Tipo: string, Descripción: Fecha de envío),
      "estado_lectura": (Tipo: string, Descripción: Estado de lectura),
      "tiene_adjuntos": (Tipo: boolean, Descripción: Indica si tiene adjuntos)
    },
    "archivos_adjuntos": [
      {
        "mensaje_id": (Tipo: string, Descripción: ID del mensaje),
        "nombre_original": (Tipo: string, Descripción: Nombre original del archivo),
        "nombre_archivo": (Tipo: string, Descripción: Nombre del archivo en el sistema),
        "url_cloudinary": (Tipo: string, Descripción: URL del archivo en Cloudinary),
        "tipo_mime": (Tipo: string, Descripción: Tipo MIME del archivo),
        "tamaño_bytes": (Tipo: number, Descripción: Tamaño en bytes),
        "fecha_subida": (Tipo: string, Descripción: Fecha de subida)
      }
    ],
    "notificacion": {
      "enviada": (Tipo: boolean, Descripción: Indica si se envió notificación),
      "canales": (Tipo: array, Descripción: Canales de notificación),
      "destinatario_id": (Tipo: string, Descripción: ID del destinatario)
    }
  },
  "message": "Conversación creada y mensaje enviado correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "El asunto debe tener entre 10 y 200 caracteres"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "El estudiante no está vinculado al apoderado"
}
```

---

### **47. Obtener Detalle de Conversación**

**Endpoint:** `GET /conversaciones/:id`
**Descripción:** Obtiene los detalles completos de una conversación específica.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID de la conversación)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "conversacion": {
      "id": (Tipo: string, Descripción: ID de la conversación),
      "asunto": (Tipo: string, Descripción: Asunto de la conversación),
      "estudiante": {
        "id": (Tipo: string, Descripción: ID del estudiante),
        "codigo_estudiante": (Tipo: string, Descripción: Código del estudiante),
        "nombre_completo": (Tipo: string, Descripción: Nombre completo del estudiante)
      },
      "curso": {
        "id": (Tipo: string, Descripción: ID del curso),
        "nombre": (Tipo: string, Descripción: Nombre del curso),
        "nivel_grado": {
          "nivel": (Tipo: string, Descripción: Nivel educativo),
          "grado": (Tipo: string, Descripción: Grado),
          "descripcion": (Tipo: string, Descripción: Descripción del nivel-grado)
        }
      },
      "padre": {
        "id": (Tipo: string, Descripción: ID del padre),
        "nombre_completo": (Tipo: string, Descripción: Nombre completo del padre),
        "telefono": (Tipo: string, Descripción: Teléfono del padre)
      },
      "docente": {
        "id": (Tipo: string, Descripción: ID del docente),
        "nombre_completo": (Tipo: string, Descripción: Nombre completo del docente),
        "telefono": (Tipo: string, Descripción: Teléfono del docente)
      },
      "estado": (Tipo: string, Descripción: Estado de la conversación),
      "fecha_inicio": (Tipo: string, Descripción: Fecha de inicio),
      "fecha_ultimo_mensaje": (Tipo: string, Descripción: Fecha del último mensaje),
      "tipo_conversacion": (Tipo: string, Descripción: Tipo de conversación),
      "iniciado_por": (Tipo: string, Descripción: Quién inició la conversación)
    },
    "otro_usuario": {
      "id": (Tipo: string, Descripción: ID del otro participante),
      "nombre_completo": (Tipo: string, Descripción: Nombre completo del otro participante),
      "rol": (Tipo: string, Descripción: Rol del otro participante)
    },
    "permisos": {
      "puede_enviar_mensajes": (Tipo: boolean, Descripción: Indica si puede enviar mensajes),
      "puede_cerrar_conversacion": (Tipo: boolean, Descripción: Indica si puede cerrar la conversación),
      "es_creador": (Tipo: boolean, Descripción: Indica si es el creador)
    }
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tiene permisos para ver esta conversación"
}
```

**Código 404 Not Found (Conversación no encontrada):**
```json
{
  "success": false,
  "error": "La conversación no existe o ha sido eliminada"
}
```

---

### **48. Obtener Mensajes de Conversación**

**Endpoint:** `GET /mensajes`
**Descripción:** Obtiene los mensajes de una conversación específica con paginación.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?conversacion_id=(Tipo: string, Obligatorio, Descripción: ID de la conversación)
&limit=(Tipo: number, Opcional, Descripción: Límite de resultados, default: 50, max: 100)
&offset=(Tipo: number, Opcional, Descripción: Desplazamiento para paginación, default: 0)
&orden=(Tipo: string, Opcional, Descripción: Orden: 'asc' o 'desc', default: 'asc')
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
    "mensajes": [
      {
        "id": (Tipo: string, Descripción: ID del mensaje),
        "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
        "emisor": {
          "id": (Tipo: string, Descripción: ID del emisor),
          "nombre_completo": (Tipo: string, Descripción: Nombre completo del emisor),
          "rol": (Tipo: string, Descripción: Rol del emisor),
          "es_usuario_actual": (Tipo: boolean, Descripción: Indica si es el usuario actual)
        },
        "contenido": (Tipo: string, Descripción: Contenido del mensaje),
        "fecha_envio": (Tipo: string, Descripción: Fecha de envío),
        "fecha_envio_legible": (Tipo: string, Descripción: Fecha formateada legible),
        "fecha_envio_relativa": (Tipo: string, Descripción: Tiempo relativo),
        "estado_lectura": (Tipo: string, Descripción: Estado de lectura),
        "fecha_lectura": (Tipo: string, Descripción: Fecha de lectura),
        "tiene_adjuntos": (Tipo: boolean, Descripción: Indica si tiene adjuntos),
        "archivos_adjuntos": [
          {
            "id": (Tipo: string, Descripción: ID del archivo),
            "mensaje_id": (Tipo: string, Descripción: ID del mensaje),
            "nombre_original": (Tipo: string, Descripción: Nombre original del archivo),
            "nombre_archivo": (Tipo: string, Descripción: Nombre del archivo en el sistema),
            "url_cloudinary": (Tipo: string, Descripción: URL del archivo en Cloudinary),
            "tipo_mime": (Tipo: string, Descripción: Tipo MIME del archivo),
            "tamaño_bytes": (Tipo: number, Descripción: Tamaño en bytes),
            "tamaño_legible": (Tipo: string, Descripción: Tamaño formateado legible),
            "fecha_subida": (Tipo: string, Descripción: Fecha de subida),
            "es_imagen": (Tipo: boolean, Descripción: Indica si es una imagen)
          }
        ]
      }
    ],
    "paginacion": {
      "limit": (Tipo: number, Descripción: Límite de resultados),
      "offset": (Tipo: number, Descripción: Desplazamiento),
      "total_mensajes": (Tipo: number, Descripción: Total de mensajes),
      "tiene_mas": (Tipo: boolean, Descripción: Indica si hay más mensajes)
    },
    "separadores_fecha": {
      "YYYY-MM-DD": (Tipo: string, Descripción: Etiqueta de fecha para agrupar mensajes)
    }
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tiene permisos para ver esta conversación"
}
```

---

### **49. Enviar Mensaje en Conversación**

**Endpoint:** `POST /mensajes`
**Descripción:** Envía un nuevo mensaje en una conversación existente.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### **Cuerpo de la Petición (Request Body):**
```
conversacion_id=(Tipo: string, Obligatorio, Descripción: ID de la conversación)
contenido=(Tipo: string, Opcional, Descripción: Contenido del mensaje, entre 10-1000 caracteres)
archivos=(Tipo: file[], Opcional, Descripción: Archivos adjuntos)
```

#### **Respuestas de Éxito:**
**Código 201 Created:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "mensaje": {
      "id": (Tipo: string, Descripción: ID del mensaje creado),
      "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
      "emisor": {
        "id": (Tipo: string, Descripción: ID del emisor),
        "nombre_completo": (Tipo: string, Descripción: Nombre completo del emisor),
        "rol": (Tipo: string, Descripción: Rol del emisor),
        "es_usuario_actual": (Tipo: boolean, Descripción: Indica si es el usuario actual)
      },
      "contenido": (Tipo: string, Descripción: Contenido del mensaje),
      "fecha_envio": (Tipo: string, Descripción: Fecha de envío),
      "fecha_envio_legible": (Tipo: string, Descripción: Fecha formateada legible),
      "fecha_envio_relativa": (Tipo: string, Descripción: Tiempo relativo),
      "estado_lectura": (Tipo: string, Descripción: Estado de lectura),
      "fecha_lectura": (Tipo: string, Descripción: Fecha de lectura),
      "tiene_adjuntos": (Tipo: boolean, Descripción: Indica si tiene adjuntos),
      "archivos_adjuntos": [
        {
          "id": (Tipo: string, Descripción: ID del archivo),
          "mensaje_id": (Tipo: string, Descripción: ID del mensaje),
          "nombre_original": (Tipo: string, Descripción: Nombre original del archivo),
          "nombre_archivo": (Tipo: string, Descripción: Nombre del archivo en el sistema),
          "url_cloudinary": (Tipo: string, Descripción: URL del archivo en Cloudinary),
          "tipo_mime": (Tipo: string, Descripción: Tipo MIME del archivo),
          "tamaño_bytes": (Tipo: number, Descripción: Tamaño en bytes),
          "tamaño_legible": (Tipo: string, Descripción: Tamaño formateado legible),
          "fecha_subida": (Tipo: string, Descripción: Fecha de subida),
          "es_imagen": (Tipo: boolean, Descripción: Indica si es una imagen)
        }
      ]
    },
    "conversacion_actualizada": {
      "fecha_ultimo_mensaje": (Tipo: string, Descripción: Fecha del último mensaje actualizada)
    },
    "notificacion": {
      "enviada": (Tipo: boolean, Descripción: Indica si se envió notificación),
      "canales": (Tipo: array, Descripción: Canales de notificación),
      "destinatario_id": (Tipo: string, Descripción: ID del destinatario)
    }
  },
  "message": "Mensaje enviado correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "Debe ingresar un mensaje de al menos 10 caracteres o adjuntar archivos"
}
```

**Código 403 Forbidden (Conversación cerrada):**
```json
{
  "success": false,
  "error": "No se pueden enviar mensajes en una conversación cerrada"
}
```

---

### **50. Marcar Mensajes como Leídos (Lote)**

**Endpoint:** `PATCH /mensajes/marcar-leidos`
**Descripción:** Marca múltiples mensajes como leídos en una conversación.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "conversacion_id": (Tipo: string, Obligatorio, Descripción: ID de la conversación),
  "mensajes_ids": (Tipo: array, Obligatorio, Descripción: Lista de IDs de mensajes a marcar como leídos)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
    "mensajes_actualizados": (Tipo: number, Descripción: Número de mensajes actualizados),
    "fecha_lectura": (Tipo: string, Descripción: Fecha de lectura)
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "mensajes_ids requerido (array no vacío)"
}
```

---

### **51. Obtener Mensajes Nuevos**

**Endpoint:** `GET /mensajes/nuevos`
**Descripción:** Obtiene los mensajes nuevos en una conversación desde un mensaje específico.
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?conversacion_id=(Tipo: string, Obligatorio, Descripción: ID de la conversación)
&ultimo_mensaje_id=(Tipo: string, Obligatorio, Descripción: ID del último mensaje conocido)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**

**Vista Estructurada:**
```json
{
  "success": true,
  "data": {
    "hay_nuevos_mensajes": (Tipo: boolean, Descripción: Indica si hay nuevos mensajes),
    "nuevos_mensajes": [
      {
        "id": (Tipo: string, Descripción: ID del mensaje),
        "conversacion_id": (Tipo: string, Descripción: ID de la conversación),
        "emisor": {
          "id": (Tipo: string, Descripción: ID del emisor),
          "nombre_completo": (Tipo: string, Descripción: Nombre completo del emisor),
          "rol": (Tipo: string, Descripción: Rol del emisor),
          "es_usuario_actual": (Tipo: boolean, Descripción: Indica si es el usuario actual)
        },
        "contenido": (Tipo: string, Descripción: Contenido del mensaje),
        "fecha_envio": (Tipo: string, Descripción: Fecha de envío),
        "fecha_envio_legible": (Tipo: string, Descripción: Fecha formateada legible),
        "fecha_envio_relativa": (Tipo: string, Descripción: Tiempo relativo),
        "estado_lectura": (Tipo: string, Descripción: Estado de lectura),
        "fecha_lectura": (Tipo: string, Descripción: Fecha de lectura),
        "tiene_adjuntos": (Tipo: boolean, Descripción: Indica si tiene adjuntos),
        "archivos_adjuntos": [
          {
            "id": (Tipo: string, Descripción: ID del archivo),
            "mensaje_id": (Tipo: string, Descripción: ID del mensaje),
            "nombre_original": (Tipo: string, Descripción: Nombre original del archivo),
            "nombre_archivo": (Tipo: string, Descripción: Nombre del archivo en el sistema),
            "url_cloudinary": (Tipo: string, Descripción: URL del archivo en Cloudinary),
            "tipo_mime": (Tipo: string, Descripción: Tipo MIME del archivo),
            "tamaño_bytes": (Tipo: number, Descripción: Tamaño en bytes),
            "tamaño_legible": (Tipo: string, Descripción: Tamaño formateado legible),
            "fecha_subida": (Tipo: string, Descripción: Fecha de subida),
            "es_imagen": (Tipo: boolean, Descripción: Indica si es una imagen)
          }
        ]
      }
    ],
    "total_nuevos_mensajes": (Tipo: number, Descripción: Total de nuevos mensajes)
  }
}
```

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tiene permisos para ver esta conversación"
}
```

---

### **52. Descargar Archivo Adjunto**

**Endpoint:** `GET /archivos/:id/download`
**Descripción:** Descarga un archivo adjunto de un mensaje (redirección a Cloudinary).
**Autenticación:** Bearer token (Roles: apoderado, docente)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: ID del archivo adjunto)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 302 Found:**
Redirección a la URL del archivo en Cloudinary.

#### **Respuestas de Error:**
**Código 403 Forbidden (Acceso denegado):**
```json
{
  "success": false,
  "error": "No tiene permisos para acceder a este archivo"
}
```

**Código 404 Not Found (Archivo no encontrado):**
```json
{
  "success": false,
  "error": "El archivo no existe o ha sido eliminado"
}
```
```

#### **Respuestas de Error:**
**Código 404 Not Found (Encuesta no encontrada):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Encuesta no encontrada"
  }
}
```

**Código 404 Not Found (Respuesta no encontrada):**
```json
{
  "success": false,
  "error": {
    "code": "RESPONSE_NOT_FOUND",
    "message": "Aún no has respondido esta encuesta"
  }
}
```
---

## MÓDULO DE ASISTENCIA

### **40. Verificar contexto de asistencia**

**Endpoint:** `GET /asistencias/verificar`
**Descripción:** Verifica si existe un curso válido para una fecha específica y si ya hay registros de asistencia para esa fecha.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Parámetros de Consulta (Query Parameters):**
```
?curso_id=(Tipo: string, Obligatorio, Descripción: Identificador del curso)
&nivel_grado_id=(Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado)
&fecha=(Tipo: string, Obligatorio, Descripción: Fecha en formato YYYY-MM-DD)
&año_academico=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "curso": "2A - Primaria",
    "fecha": "2025-10-31",
    "año_academico": 2025,
    "total_estudiantes": 30,
    "existe_registro": true,
    "estadisticas": {
      "presente": 25,
      "tardanza": 3,
      "permiso": 1,
      "falta_justificada": 1,
      "falta_injustificada": 0
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "curso_id, nivel_grado_id y fecha son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **41. Generar plantilla de asistencia**

**Endpoint:** `POST /asistencias/plantilla`
**Descripción:** Genera una plantilla Excel para el registro de asistencias de un curso específico en una fecha determinada.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "curso_id": (Tipo: string, Obligatorio, Descripción: Identificador del curso),
  "nivel_grado_id": (Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado),
  "fecha": (Tipo: string, Obligatorio, Descripción: Fecha en formato YYYY-MM-DD),
  "año_academico": (Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "asistencia_2A_2025-10-31.xlsx",
    "buffer": "contenido_del_archivo_excel_en_base64"
  },
  "message": "Plantilla generada correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "curso_id, nivel_grado_id y fecha son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **42. Validar archivo de asistencia**

**Endpoint:** `POST /asistencias/validar`
**Descripción:** Valida un archivo Excel con registros de asistencia, identificando errores y registros válidos.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### **Cuerpo de la Petición (Request Body):**
```
archivo=(Tipo: file, Obligatorio, Descripción: Archivo Excel con los datos de asistencia)
curso_id=(Tipo: string, Obligatorio, Descripción: Identificador del curso)
nivel_grado_id=(Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado)
fecha=(Tipo: string, Obligatorio, Descripción: Fecha en formato YYYY-MM-DD)
año_academico=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "validacion_id": "val_asist_1698765432100",
    "contexto": {
      "curso": "2A - Primaria",
      "fecha": "2025-10-31"
    },
    "resumen": {
      "total_registros": 30,
      "validos": 28,
      "con_errores": 2
    },
    "desglose_por_estado": {
      "presente": 25,
      "tardanza": 2,
      "permiso": 1,
      "falta_justificada": 0,
      "falta_injustificada": 0
    },
    "registros_validos": [
      {
        "codigo_estudiante": "EST001",
        "nombre_completo": "Juan Pérez",
        "estado": "presente",
        "hora_llegada": null,
        "justificacion": null
      }
    ],
    "registros_con_errores": [
      {
        "fila": 5,
        "codigo_estudiante": "EST005",
        "nombre_completo": "María García",
        "errores": [
          {
            "campo": "estado",
            "mensaje": "Estado inválido. Debe ser uno de: presente, tardanza, permiso, falta_justificada, falta_injustificada",
            "valor": "ausente"
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
    "archivo_errores_url": "/asistencias/reporte-errores/val_asist_1698765432100"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "El archivo debe ser Excel (.xlsx) o (.xls)"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **43. Cargar asistencias**

**Endpoint:** `POST /asistencias/cargar`
**Descripción:** Procesa e inserta los registros de asistencia validados previamente en la base de datos.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "validacion_id": (Tipo: string, Obligatorio, Descripción: Identificador de la validación previa),
  "reemplazar_existente": (Tipo: boolean, Opcional, Descripción: Indica si se deben reemplazar los registros existentes, por defecto false)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "carga_id": "carga_asist_1698765432100",
    "contexto": {
      "curso": "2A - Primaria",
      "fecha": "2025-10-31"
    },
    "resumen": {
      "total_procesados": 28,
      "insertados_exitosamente": 27,
      "omitidos": 1,
      "reemplazados": 0
    },
    "fecha_carga": "2025-10-31T20:30:00.000Z",
    "registrado_por": {
      "id": "usr123",
      "nombre": "Carlos Rodríguez"
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "validacion_id es requerido"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Validación no encontrada):**
```json
{
  "success": false,
  "error": "Validación con ID no existe o expiró"
}
```

**Código 409 Conflict (Registros duplicados):**
```json
{
  "success": false,
  "error": "Ya existe registro de asistencia para esta fecha. Use reemplazar_existente: true para sobrescribir"
}
```

---

### **44. Descargar reporte de errores**

**Endpoint:** `GET /asistencias/reporte-errores/:id`
**Descripción:** Descarga un archivo de texto con el detalle de los errores encontrados durante la validación de asistencias.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador del reporte de errores)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "Errores_Asistencias_val_asist_1698765432100.txt",
    "content": "REPORTE DE ERRORES - CARGA DE ASISTENCIAS\n=========================================\nFecha: 2025-10-31T20:30:00.000Z\nCurso: 2A - Primaria\n\nFila 5: Código EST005 - María García\n  ❌ estado: Estado inválido. Debe ser uno de: presente, tardanza, permiso, falta_justificada, falta_injustificada (valor: ausente)"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "report_id requerido"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Reporte no encontrado):**
```json
{
  "success": false,
  "error": "Reporte no disponible o expirado"
}
```

---

### **45. Obtener estadísticas de asistencia**

**Endpoint:** `GET /asistencias/estadisticas`
**Descripción:** Obtiene las estadísticas de asistencia de un curso para una fecha específica.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Parámetros de Consulta (Query Parameters):**
```
?curso_id=(Tipo: string, Obligatorio, Descripción: Identificador del curso)
&nivel_grado_id=(Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado)
&fecha=(Tipo: string, Obligatorio, Descripción: Fecha en formato YYYY-MM-DD)
&año_academico=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "curso": "2A - Primaria",
    "fecha": "2025-10-31",
    "año_academico": 2025,
    "total_registros": 30,
    "presente": 25,
    "tardanza": 3,
    "permiso": 1,
    "falta_justificada": 1,
    "falta_injustificada": 0,
    "promedio_minutos_retraso": 12.5
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "curso_id, nivel_grado_id y fecha son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Sin registros):**
```json
{
  "success": false,
  "error": "No hay registro de asistencia para el grado en la fecha 2025-10-31"
}
```

---

### **46. Consultar asistencia por período**

**Endpoint:** `GET /asistencias/estudiante/:estudiante_id`
**Descripción:** Obtiene los registros de asistencia de un estudiante para un período específico (mes o trimestre).
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Obligatorio, Descripción: Año académico)
&mes=(Tipo: number, Opcional, Descripción: Mes del 1 al 12, mutuamente excluyente con trimestre)
&trimestre=(Tipo: number, Opcional, Descripción: Trimestre del 1 al 3, mutuamente excluyente con mes)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "codigo_estudiante": "EST001",
      "nombre_completo": "Juan Pérez",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "periodo": {
      "año": 2025,
      "mes": 10,
      "mes_nombre": "Octubre"
    },
    "registros": [
      {
        "id": "asist123",
        "fecha": "2025-10-31",
        "fecha_legible": "31 de octubre de 2025",
        "dia_semana": "Viernes",
        "estado": "presente",
        "hora_llegada": null,
        "justificacion": null,
        "fecha_registro": "2025-10-31T08:00:00.000Z",
        "registrado_por": {
          "nombre": "Carlos Rodríguez"
        }
      }
    ],
    "total_registros": 20,
    "resumen": {
      "presente": 18,
      "tardanza": 1,
      "permiso": 1,
      "falta_justificada": 0,
      "falta_injustificada": 0
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id y año son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar la asistencia de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

---

### **47. Obtener estadísticas de asistencia de estudiante**

**Endpoint:** `GET /asistencias/estudiante/:estudiante_id/estadisticas`
**Descripción:** Obtiene estadísticas detalladas de asistencia de un estudiante en un rango de fechas específico.
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?fecha_inicio=(Tipo: string, Obligatorio, Descripción: Fecha de inicio en formato YYYY-MM-DD)
&fecha_fin=(Tipo: string, Obligatorio, Descripción: Fecha de fin en formato YYYY-MM-DD)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "fecha_inicio": "2025-10-01",
      "fecha_fin": "2025-10-31",
      "dias_totales": 31,
      "dias_lectivos": 22,
      "dias_no_lectivos": 9
    },
    "registros": {
      "total": 20,
      "presente": 18,
      "tardanza": 1,
      "permiso": 1,
      "falta_justificada": 0,
      "falta_injustificada": 0,
      "sin_registro": 2
    },
    "porcentajes": {
      "asistencia_global": 90.91,
      "presente": 81.82,
      "tardanza": 4.55,
      "permiso": 4.55,
      "falta_justificada": 0,
      "falta_injustificada": 0
    },
    "alertas": [
      {
        "tipo": "tardanzas_acumuladas",
        "nivel": "advertencia",
        "mensaje": "Su hijo(a) ha acumulado 5 tardanzas en este período",
        "icono": "⚠️"
      }
    ],
    "reconocimientos": [
      {
        "tipo": "asistencia_destacada",
        "mensaje": "Excelente: Asistencia del 95% en el período",
        "icono": "✅"
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id, fecha_inicio y fecha_fin son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar las estadísticas de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

---

### **48. Exportar asistencia a PDF**

**Endpoint:** `GET /asistencias/estudiante/:estudiante_id/export`
**Descripción:** Exporta un reporte de asistencia de un estudiante en formato PDF para un rango de fechas específico.
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?formato=(Tipo: string, Obligatorio, Descripción: Formato de exportación, valor debe ser 'pdf')
&fecha_inicio=(Tipo: string, Obligatorio, Descripción: Fecha de inicio en formato YYYY-MM-DD)
&fecha_fin=(Tipo: string, Obligatorio, Descripción: Fecha de fin en formato YYYY-MM-DD)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "Asistencia_JuanPerez_20251001-20251031.pdf",
    "buffer": "contenido_del_archivo_pdf_en_base64"
  },
  "message": "PDF exportado correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Formato inválido. Solo se permite 'pdf'"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para exportar la asistencia de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

**Código 400 Bad Request (Sin datos para exportar):**
```json
{
  "success": false,
  "error": "Sin datos para exportar"
}
```
---

## MÓDULO DE NOTAS ACADÉMICAS

### **49. Generar plantilla de calificaciones**

**Endpoint:** `POST /calificaciones/plantilla`
**Descripción:** Genera una plantilla Excel para el registro de calificaciones de un curso específico.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "curso_id": (Tipo: string, Obligatorio, Descripción: Identificador del curso),
  "nivel_grado_id": (Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado),
  "trimestre": (Tipo: number, Obligatorio, Descripción: Número del trimestre, valores: 1, 2, 3),
  "componente_id": (Tipo: string, Obligatorio, Descripción: Identificador del componente de evaluación),
  "año_academico": (Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "calificaciones_2A_Matematicas_T1_2025.xlsx",
    "buffer": "contenido_del_archivo_excel_en_base64"
  },
  "message": "Plantilla generada correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "curso_id, nivel_grado_id, trimestre y componente_id son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **50. Validar archivo de calificaciones**

**Endpoint:** `POST /calificaciones/validar`
**Descripción:** Valida un archivo Excel con registros de calificaciones, identificando errores y registros válidos.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### **Cuerpo de la Petición (Request Body):**
```
archivo=(Tipo: file, Obligatorio, Descripción: Archivo Excel con los datos de calificaciones)
curso_id=(Tipo: string, Obligatorio, Descripción: Identificador del curso)
nivel_grado_id=(Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado)
trimestre=(Tipo: number, Opcional, Descripción: Número del trimestre, por defecto 1)
componente_id=(Tipo: string, Obligatorio, Descripción: Identificador del componente de evaluación)
año_academico=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "validacion_id": "val_cal_1698765432100",
    "contexto": {
      "curso": "2A - Primaria",
      "trimestre": 1,
      "componente": "Matemáticas",
      "fecha_evaluacion": "2025-10-31"
    },
    "resumen": {
      "total_registros": 30,
      "validos": 28,
      "con_errores": 2
    },
    "registros_validos": [
      {
        "codigo_estudiante": "EST001",
        "nombre_completo": "Juan Pérez",
        "calificacion": 15,
        "observaciones": null
      }
    ],
    "registros_con_errores": [
      {
        "fila": 5,
        "codigo_estudiante": "EST005",
        "nombre_completo": "María García",
        "errores": [
          {
            "campo": "calificacion",
            "mensaje": "Calificación fuera de rango (debe ser 0–20)",
            "valor": 25
          }
        ]
      }
    ],
    "advertencias": [
      {
        "tipo": "DUPLICATE_DATE",
        "mensaje": "Ya existe evaluación para esta fecha. Si continúa, se reemplazarán los datos existentes."
      }
    ],
    "archivo_errores_url": "/calificaciones/reporte-errores/val_cal_1698765432100"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "El archivo debe ser Excel (.xlsx) o (.xls)"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **51. Cargar calificaciones**

**Endpoint:** `POST /calificaciones/cargar`
**Descripción:** Procesa e inserta los registros de calificaciones validados previamente en la base de datos.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "validacion_id": (Tipo: string, Obligatorio, Descripción: Identificador de la validación previa),
  "procesar_solo_validos": (Tipo: boolean, Opcional, Descripción: Indica si se deben procesar solo los registros válidos, por defecto true),
  "generar_alertas": (Tipo: boolean, Opcional, Descripción: Indica si se deben generar alertas, por defecto true)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "carga_id": "carga_cal_1698765432100",
    "contexto": {
      "curso": "2A - Primaria",
      "trimestre": 1,
      "componente": "Matemáticas",
      "fecha_evaluacion": "2025-10-31"
    },
    "resumen": {
      "total_procesados": 28,
      "insertados_exitosamente": 27,
      "omitidos": 1
    },
    "alertas_generadas": {
      "total": 0,
      "bajo_rendimiento": 0,
      "estudiantes_afectados": []
    },
    "fecha_carga": "2025-10-31T20:30:00.000Z",
    "registrado_por": {
      "id": "usr123",
      "nombre": "Carlos Rodríguez"
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "validacion_id es requerido"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Validación no encontrada):**
```json
{
  "success": false,
  "error": "Validación con ID no existe o expiró"
}
```

---

### **52. Descargar reporte de errores de calificaciones**

**Endpoint:** `GET /calificaciones/reporte-errores/:id`
**Descripción:** Descarga un archivo de texto con el detalle de los errores encontrados durante la validación de calificaciones.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador del reporte de errores)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "Errores_Calificaciones_val_cal_1698765432100.txt",
    "content": "REPORTE DE ERRORES - CARGA DE CALIFICACIONES\n===========================================\nFecha: 2025-10-31T20:30:00.000Z\nCurso: 2A - Primaria\n\nFila 5: Código EST005 - María García\n  ❌ calificacion: Calificación fuera de rango (debe ser 0–20) (valor: 25)"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "report_id requerido"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Reporte no encontrado):**
```json
{
  "success": false,
  "error": "Reporte no disponible o expirado"
}
```

---

### **53. Consultar calificaciones de estudiante**

**Endpoint:** `GET /calificaciones/estudiante/:estudiante_id`
**Descripción:** Obtiene las calificaciones de un estudiante para un período específico (año, trimestre, curso, componente).
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Obligatorio, Descripción: Año académico)
&trimestre=(Tipo: number, Opcional, Descripción: Número del trimestre, valores: 1, 2, 3)
&curso_id=(Tipo: string, Opcional, Descripción: Identificador del curso)
&componente_id=(Tipo: string, Opcional, Descripción: Identificador del componente de evaluación)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "codigo_estudiante": "EST001",
      "nombre_completo": "Juan Pérez",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "año_academico": 2025,
    "calificaciones": [
      {
        "componente": {
          "id": "comp123",
          "nombre_componente": "Matemáticas",
          "peso_porcentual": 30,
          "tipo_evaluacion": "recurrente"
        },
        "trimestre": 1,
        "calificaciones": [
          {
            "id": "eval123",
            "fecha_evaluacion": "2025-10-31",
            "fecha_evaluacion_legible": "31 de octubre de 2025",
            "calificacion_numerica": 15,
            "calificacion_letra": "A",
            "observaciones": "Buen desempeño",
            "estado": "final",
            "fecha_registro": "2025-10-31T08:00:00.000Z",
            "registrado_por": {
              "nombre": "Carlos Rodríguez"
            }
          }
        ],
        "promedio_componente": 15.5,
        "promedio_ponderado": 4.65
      }
    ],
    "promedio_general": 14.2,
    "promedio_letra": "A",
    "nivel_desempeño": "Logro Esperado"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id y año son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar las calificaciones de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

---

### **54. Obtener promedio de componente de estudiante**

**Endpoint:** `GET /calificaciones/estudiante/:estudiante_id/promedio`
**Descripción:** Obtiene el promedio de un componente específico para un estudiante en un período determinado.
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Obligatorio, Descripción: Año académico)
&trimestre=(Tipo: number, Opcional, Descripción: Número del trimestre, valores: 1, 2, 3)
&curso_id=(Tipo: string, Opcional, Descripción: Identificador del curso)
&componente_id=(Tipo: string, Opcional, Descripción: Identificador del componente de evaluación)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "codigo_estudiante": "EST001",
      "nombre_completo": "Juan Pérez",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "curso": {
      "id": "curso123",
      "nombre": "2A - Primaria"
    },
    "componente": {
      "id": "comp123",
      "nombre": "Matemáticas",
      "tipo": "recurrente"
    },
    "trimestre": 1,
    "año_academico": 2025,
    "total_evaluaciones": 3,
    "suma_calificaciones": 46.5,
    "promedio": 15.5,
    "promedio_letra": "A",
    "estado": "final",
    "mensaje": "Promedio oficial"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id y año son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar las calificaciones de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

---

### **55. Obtener resumen académico de estudiante**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id`
**Descripción:** Obtiene el resumen académico de un estudiante para un año académico específico (trimestral o anual).
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Obligatorio, Descripción: Año académico)
&trimestre=(Tipo: number, Opcional, Descripción: Número del trimestre, valores: 1, 2, 3. Si no se especifica, se muestra vista anual)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK (Vista Trimestral):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "codigo_estudiante": "EST001",
      "nombre_completo": "Juan Pérez",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "año_academico": 2025,
    "trimestre": 1,
    "cursos": [
      {
        "id": "curso123",
        "nombre": "2A - Primaria",
        "formula_calculo": [
          {
            "componente_id": "comp123",
            "nombre": "Matemáticas",
            "peso": 30,
            "icono": null
          }
        ],
        "promedios_componentes": [
          {
            "componente_id": "comp123",
            "componente": "Matemáticas",
            "promedio": 15.5,
            "peso": 30,
            "subtotal": 4.65,
            "color": "verde"
          }
        ],
        "promedio_trimestre": 14.2,
        "promedio_letra": "A",
        "estado": "final",
        "fecha_certificacion": null,
        "mensaje": "Promedio oficial"
      }
    ],
    "total_cursos": 1
  }
}
```

**Código 200 OK (Vista Anual):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "codigo_estudiante": "EST001",
      "nombre_completo": "Juan Pérez",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "año_academico": 2025,
    "vista": "anual",
    "tabla_notas_finales": [
      {
        "curso_id": "curso123",
        "curso_nombre": "2A - Primaria",
        "trimestre_1": 14.2,
        "trimestre_2": 15.1,
        "trimestre_3": 14.8,
        "promedio_final": 14.7,
        "promedio_letra": "A",
        "estado": "aprobado",
        "estado_badge": "✅"
      }
    ],
    "estadisticas": {
      "promedio_general": 14.7,
      "cursos_aprobados": 1,
      "cursos_desaprobados": 0,
      "total_cursos": 1,
      "mejor_curso": {
        "nombre": "2A - Primaria",
        "promedio": 14.7
      },
      "curso_atencion": null
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id, año y trimestre son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar el resumen académico de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

---

### **56. Exportar resumen académico a PDF**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id/export`
**Descripción:** Exporta el resumen académico anual de un estudiante en formato PDF (boleta institucional).
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Obligatorio, Descripción: Año académico)
&formato=(Tipo: string, Obligatorio, Descripción: Formato de exportación, valor debe ser 'pdf')
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "Boleta_Oficial_JuanPerez_2025.pdf",
    "buffer": "contenido_del_archivo_pdf_en_base64"
  },
  "message": "PDF exportado correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Formato inválido. Solo se permite 'pdf'"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para exportar el resumen académico de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

---

### **57. Obtener promedios trimestrales de estudiante**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id/promedios-trimestre`
**Descripción:** Obtiene los promedios trimestrales de todos los cursos de un estudiante para un año académico específico.
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Obligatorio, Descripción: Año académico)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "codigo_estudiante": "EST001",
      "nombre_completo": "Juan Pérez",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "año_academico": 2025,
    "promedios_trimestre": [
      {
        "curso_id": "curso123",
        "curso_nombre": "2A - Primaria",
        "trimestre_1": 14.2,
        "trimestre_2": 15.1,
        "trimestre_3": 14.8
      }
    ],
    "promedio_general_trimestres": {
      "trimestre_1": 14.2,
      "trimestre_2": 15.1,
      "trimestre_3": 14.8
    },
    "total_cursos": 1
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id y año son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar los promedios de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```

---

### **58. Obtener promedios anuales de estudiante**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id/promedios-anuales`
**Descripción:** Obtiene los promedios anuales consolidados de todos los cursos de un estudiante para un año académico específico.
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Obligatorio, Descripción: Año académico)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "codigo_estudiante": "EST001",
      "nombre_completo": "Juan Pérez",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "año_academico": 2025,
    "promedios_anuales": [
      {
        "curso_id": "curso123",
        "curso_nombre": "2A - Primaria",
        "trimestre_1": 14.2,
        "trimestre_2": 15.1,
        "trimestre_3": 14.8,
        "promedio_final": 14.7,
        "promedio_letra": "A",
        "estado": "aprobado",
        "estado_badge": "✅"
      }
    ],
    "estadisticas": {
      "promedio_general": 14.7,
      "cursos_aprobados": 1,
      "cursos_desaprobados": 0,
      "total_cursos": 1,
      "mejor_curso": {
        "nombre": "2A - Primaria",
        "promedio": 14.7
      },
      "curso_atencion": null
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id y año son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar los promedios de este estudiante"
}
```

**Código 404 Not Found (Estudiante no encontrado):**
```json
{
  "success": false,
  "error": "Estudiante no existe"
}
```


---

## MÓDULO DE CURSOS

### **59. Obtener cursos asignados a docente**

**Endpoint:** `GET /cursos/asignados`
**Descripción:** Obtiene la lista de cursos asignados a un docente para un año académico específico.
**Autenticación:** Bearer token (Rol/es requeridos: Docente)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año_academico=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": "doc123"
    },
    "año_academico": 2025,
    "cursos": [
      {
        "id": "curso123",
        "codigo_curso": "2A-MAT",
        "nombre": "Matemáticas - 2A",
        "nivel_grado": {
          "id": "ng123",
          "nivel": "Primaria",
          "grado": "2A",
          "descripcion": "Segundo grado de primaria"
        },
        "total_estudiantes": 30,
        "estado_activo": true
      }
    ],
    "total_cursos": 1
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Sin cursos asignados):**
```json
{
  "success": false,
  "error": "No tiene cursos asignados para el año 2025"
}
```

---

### **60. Obtener cursos por nivel y grado**

**Endpoint:** `GET /cursos`
**Descripción:** Obtiene la lista de cursos para un nivel y grado específicos en un año académico determinado.
**Autenticación:** Bearer token (Rol/es requeridos: Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?nivel=(Tipo: string, Obligatorio, Descripción: Nivel educativo: 'Inicial', 'Primaria', 'Secundaria')
&grado=(Tipo: string, Obligatorio, Descripción: Grado: '1°', '2°', etc.)
&año_academico=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "nivel_grado": {
      "id": "ng123",
      "nivel": "Primaria",
      "grado": "2A",
      "descripcion": "Segundo grado de primaria"
    },
    "año_academico": 2025,
    "cursos": [
      {
        "id": "curso123",
        "codigo_curso": "2A-MAT",
        "nombre": "Matemáticas - 2A",
        "total_estudiantes": 30,
        "docente_asignado": {
          "id": "doc123",
          "nombre": "Carlos Rodríguez"
        },
        "estado_activo": true
      },
      {
        "id": "curso124",
        "codigo_curso": "2A-COM",
        "nombre": "Comunicación - 2A",
        "total_estudiantes": 30,
        "docente_asignado": {
          "id": "doc124",
          "nombre": "María González"
        },
        "estado_activo": true
      }
    ],
    "total_cursos": 2
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Los parámetros 'nivel' y 'grado' son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Nivel/Grado no encontrado):**
```json
{
  "success": false,
  "error": "Nivel 'Primaria' - Grado '2A' no existe en el sistema"
}
```

---

### **61. Obtener estudiantes de un curso**

**Endpoint:** `GET /cursos/estudiantes`
**Descripción:** Obtiene la lista de estudiantes matriculados en un curso específico para un año académico determinado.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?curso_id=(Tipo: string, Obligatorio, Descripción: Identificador del curso)
&nivel_grado_id=(Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado)
&año_academico=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "curso": {
      "id": "curso123",
      "nombre": "Matemáticas - 2A",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "2A"
      }
    },
    "año_academico": 2025,
    "estudiantes": [
      {
        "id": "est123",
        "codigo_estudiante": "EST001",
        "nombre": "Juan",
        "apellido": "Pérez",
        "nombre_completo": "Juan Pérez",
        "apoderado_principal": {
          "id": "apod123",
          "nombre": "María López",
          "telefono": "987654321"
        },
        "estado_matricula": "activo"
      },
      {
        "id": "est124",
        "codigo_estudiante": "EST002",
        "nombre": "Ana",
        "apellido": "García",
        "nombre_completo": "Ana García",
        "apoderado_principal": {
          "id": "apod124",
          "nombre": "Carlos García",
          "telefono": "987654322"
        },
        "estado_matricula": "activo"
      }
    ],
    "total_estudiantes": 2
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "curso_id y nivel_grado_id son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para acceder a este curso"
}
```

**Código 404 Not Found (Curso no encontrado):**
```json
{
  "success": false,
  "error": "curso_id y nivel_grado_id no corresponden o no están activos para el año"
}
```

---

## MÓDULO DE EVALUACIÓN

### **62. Obtener estructura de evaluación**

**Endpoint:** `GET /evaluation-structure`
**Descripción:** Obtiene la estructura de evaluación actual para un año académico específico.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director, Apoderado)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "año_academico": 2025,
    "componentes": [
      {
        "id": "comp123",
        "nombre_item": "Matemáticas",
        "peso_porcentual": 30,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 1
      },
      {
        "id": "comp124",
        "nombre_item": "Comunicación",
        "peso_porcentual": 25,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 2
      }
    ],
    "total_componentes": 2,
    "suma_pesos": 55,
    "configuracion_bloqueada": true,
    "fecha_bloqueo": "2025-03-01T00:00:00.000Z"
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **63. Actualizar estructura de evaluación**

**Endpoint:** `PUT /evaluation-structure`
**Descripción:** Crea o actualiza la estructura de evaluación para un año académico específico.
**Autenticación:** Bearer token (Rol/es requeridos: Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "año_academico": (Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual),
  "componentes": (Tipo: array, Obligatorio, Descripción: Lista de componentes de evaluación, mínimo 1, máximo 5),
  [
    {
      "nombre_item": (Tipo: string, Obligatorio, Descripción: Nombre del componente, entre 1-50 caracteres),
      "peso_porcentual": (Tipo: number, Obligatorio, Descripción: Peso porcentual del componente),
      "tipo_evaluacion": (Tipo: string, Obligatorio, Descripción: Tipo de evaluación: 'unica' o 'recurrente'),
      "orden_visualizacion": (Tipo: number, Obligatorio, Descripción: Orden de visualización)
    }
  ]
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Estructura de evaluación registrada correctamente",
    "año_academico": 2025,
    "total_componentes": 2,
    "suma_pesos": 55,
    "configuracion_bloqueada": true,
    "fecha_bloqueo": "2025-10-31T20:30:00.000Z"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "La suma de pesos porcentuales debe ser 100"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **64. Obtener historial de configuraciones de evaluación**

**Endpoint:** `GET /evaluation-structure/history`
**Descripción:** Obtiene el historial de configuraciones de estructura de evaluación por año académico.
**Autenticación:** Bearer token (Rol/es requeridos: Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "configuraciones": [
      {
        "año_academico": 2025,
        "total_componentes": 2,
        "fecha_configuracion": "2025-03-01T00:00:00.000Z",
        "configurado_por": null,
        "bloqueada": true
      },
      {
        "año_academico": 2024,
        "total_componentes": 3,
        "fecha_configuracion": "2024-03-01T00:00:00.000Z",
        "configurado_por": null,
        "bloqueada": true
      }
    ],
    "total_configuraciones": 2
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **65. Obtener plantillas de evaluación**

**Endpoint:** `GET /evaluation-structure/templates`
**Descripción:** Obtiene las plantillas predefinidas de estructura de evaluación.
**Autenticación:** Bearer token (Rol/es requeridos: Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "temp123",
        "nombre": "Estructura Primaria Básica",
        "descripcion": "Estructura básica para nivel primaria",
        "componentes": [
          {
            "nombre_item": "Matemáticas",
            "peso_porcentual": 30,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 1
          },
          {
            "nombre_item": "Comunicación",
            "peso_porcentual": 25,
            "tipo_evaluacion": "recurrente",
            "orden_visualizacion": 2
          }
        ]
      }
    ],
    "total_templates": 1
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **66. Previsualizar impacto de pesos**

**Endpoint:** `GET /evaluation-structure/preview`
**Descripción:** Previsualiza el impacto de los pesos de los componentes en el cálculo de promedios.
**Autenticación:** Bearer token (Rol/es requeridos: Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?componentes=(Tipo: string, Obligatorio, Descripción: JSON con la lista de componentes y sus pesos)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "ejemplo_calculo": {
      "matematicas": 15,
      "comunicacion": 14,
      "ciencias": 16
    },
    "promedio_ponderado": 14.8,
    "promedio_letra": "A"
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "Parámetro \"componentes\" requerido en JSON"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **67. Obtener niveles y grados**

**Endpoint:** `GET /evaluation-structure/nivel-grado`
**Descripción:** Obtiene la lista de niveles y grados disponibles en el sistema.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "niveles_grados": [
      {
        "id": "ng123",
        "nivel": "Inicial",
        "grado": "3 años",
        "descripcion": "Tercer año de educación inicial"
      },
      {
        "id": "ng124",
        "nivel": "Primaria",
        "grado": "1°",
        "descripcion": "Primer grado de primaria"
      },
      {
        "id": "ng125",
        "nivel": "Secundaria",
        "grado": "1°",
        "descripcion": "Primer grado de secundaria"
      }
    ],
    "total_niveles_grados": 3
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

## MÓDULO DE AÑO ACADÉMICO

### **68. Obtener año académico actual**

**Endpoint:** `GET /anio-academico/actual`
**Descripción:** Obtiene el año académico actual y la configuración de trimestres.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "año_actual": 2025,
    "trimestres": [
      {
        "numero": 1,
        "nombre": "Trimestre 1",
        "fecha_inicio": "2025-03-01",
        "fecha_fin": "2025-05-31",
        "estado": "cerrado",
        "fecha_cierre": "2025-06-05"
      },
      {
        "numero": 2,
        "nombre": "Trimestre 2",
        "fecha_inicio": "2025-06-01",
        "fecha_fin": "2025-09-15",
        "estado": "en_curso",
        "fecha_cierre": null
      },
      {
        "numero": 3,
        "nombre": "Trimestre 3",
        "fecha_inicio": "2025-09-16",
        "fecha_fin": "2025-12-20",
        "estado": "pendiente",
        "fecha_cierre": null
      }
    ],
    "trimestre_actual": 2
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

## MÓDULO DE CURSOS DE ESTUDIANTES

### **69. Obtener cursos de estudiante**

**Endpoint:** `GET /cursos/estudiante/:estudiante_id`
**Descripción:** Obtiene la lista de cursos en los que está matriculado un estudiante para un año académico específico.
**Autenticación:** Bearer token (Rol/es requeridos: Apoderado)

#### **Parámetros de Ruta (Path Parameters):**
```
{estudiante_id} = (Tipo: string, Descripción: Identificador único del estudiante)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?año=(Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est123",
      "nombre_completo": "Juan Pérez",
      "codigo_estudiante": "EST001"
    },
    "año_academico": 2025,
    "cursos": [
      {
        "id": "curso123",
        "nombre": "Matemáticas - 2A",
        "codigo_curso": "2A-MAT",
        "docente": {
          "id": "doc123",
          "nombre_completo": "Carlos Rodríguez"
        },
        "nivel_grado": {
          "id": "ng123",
          "nivel": "Primaria",
          "grado": "2A"
        }
      },
      {
        "id": "curso124",
        "nombre": "Comunicación - 2A",
        "codigo_curso": "2A-COM",
        "docente": {
          "id": "doc124",
          "nombre_completo": "María González"
        },
        "nivel_grado": {
          "id": "ng123",
          "nivel": "Primaria",
          "grado": "2A"
        }
      }
    ],
    "total_cursos": 2
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Parámetros inválidos):**
```json
{
  "success": false,
  "error": "estudiante_id requerido"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes permisos para consultar los cursos de este estudiante"
}
```

---

## MÓDULO DE PLANTILLAS

### **70. Obtener tipos de plantillas**

**Endpoint:** `GET /plantillas/tipos`
**Descripción:** Obtiene la lista de tipos de plantillas disponibles en el sistema.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "tipos": [
      {
        "id": "tip123",
        "nombre": "Calificaciones",
        "descripcion": "Plantilla para registro de calificaciones",
        "formato": "xlsx"
      },
      {
        "id": "tip124",
        "nombre": "Asistencia",
        "descripcion": "Plantilla para registro de asistencia",
        "formato": "xlsx"
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **71. Generar plantilla de calificaciones**

**Endpoint:** `POST /plantillas/calificaciones`
**Descripción:** Genera una plantilla Excel para el registro de calificaciones de un curso específico.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "curso_id": (Tipo: string, Obligatorio, Descripción: Identificador del curso),
  "nivel_grado_id": (Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado),
  "trimestre": (Tipo: number, Obligatorio, Descripción: Número del trimestre, valores: 1, 2, 3),
  "componente_id": (Tipo: string, Obligatorio, Descripción: Identificador del componente de evaluación),
  "año_academico": (Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "calificaciones_2A_Matematicas_T1_2025.xlsx",
    "buffer": "contenido_del_archivo_excel_en_base64"
  },
  "message": "Plantilla generada correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "curso_id, nivel_grado_id, trimestre y componente_id son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **72. Generar plantilla de asistencia**

**Endpoint:** `POST /plantillas/asistencia`
**Descripción:** Genera una plantilla Excel para el registro de asistencia de un curso específico.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "curso_id": (Tipo: string, Obligatorio, Descripción: Identificador del curso),
  "nivel_grado_id": (Tipo: string, Obligatorio, Descripción: Identificador del nivel y grado),
  "fecha": (Tipo: string, Obligatorio, Descripción: Fecha en formato YYYY-MM-DD),
  "año_academico": (Tipo: number, Opcional, Descripción: Año académico, por defecto el año actual)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "asistencia_2A_2025-10-31.xlsx",
    "buffer": "contenido_del_archivo_excel_en_base64"
  },
  "message": "Plantilla generada correctamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": "curso_id, nivel_grado_id y fecha son requeridos"
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **73. Obtener guía de plantillas**

**Endpoint:** `GET /plantillas/guias/:tipo`
**Descripción:** Obtiene la guía de uso para un tipo específico de plantilla en formato texto.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Parámetros de Ruta (Path Parameters):**
```
{tipo} = (Tipo: string, Descripción: Tipo de plantilla: 'calificaciones' o 'asistencia')
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "content": "GUÍA DE USO - PLANTILLA DE CALIFICACIONES\n=====================================\n\n1. Descargue la plantilla\n2. Complete los datos de los estudiantes\n3. Cargue el archivo en el sistema\n\nFormato de columnas:\n- Código de estudiante (obligatorio)\n- Nombre completo (obligatorio)\n- Calificación (obligatorio, 0-20)\n- Observaciones (opcional)",
    "filename": "guia_calificaciones.txt",
    "contentType": "text/plain"
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **74. Obtener guía de plantillas en PDF**

**Endpoint:** `GET /plantillas/guias/:tipo/pdf`
**Descripción:** Obtiene la guía de uso para un tipo específico de plantilla en formato PDF.
**Autenticación:** Bearer token (Rol/es requeridos: Docente, Director)

#### **Parámetros de Ruta (Path Parameters):**
```
{tipo} = (Tipo: string, Descripción: Tipo de plantilla: 'calificaciones' o 'asistencia')
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "filename": "guia_calificaciones.pdf",
    "buffer": "contenido_del_archivo_pdf_en_base64",
    "contentType": "application/pdf"
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

## MÓDULO DE SOPORTE TÉCNICO

### **75. Crear ticket de soporte**

**Endpoint:** `POST /soporte/tickets`
**Descripción:** Crea un nuevo ticket de soporte técnico para el usuario autenticado.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "titulo": (Tipo: string, Obligatorio, Descripción: Título del ticket, entre 5-100 caracteres),
  "descripcion": (Tipo: string, Obligatorio, Descripción: Descripción detallada del problema, mínimo 20 caracteres),
  "categoria": (Tipo: string, Obligatorio, Descripción: Categoría del problema),
  "prioridad": (Tipo: string, Opcional, Descripción: Nivel de prioridad: 'baja', 'normal', 'alta', 'urgente', por defecto 'normal')
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket123",
      "numero_ticket": "TKT-2025-001",
      "titulo": "Problema con acceso a plataforma",
      "descripcion": "No puedo iniciar sesión en la plataforma desde mi dispositivo móvil",
      "categoria": "acceso",
      "prioridad": "normal",
      "estado": "pendiente",
      "fecha_creacion": "2025-10-31T20:30:00.000Z",
      "usuario": {
        "id": "usr123",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "apoderado"
      },
      "año_academico": 2025
    }
  },
  "message": "Ticket creado exitosamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El título debe tener entre 5 y 100 caracteres, La descripción debe tener al menos 20 caracteres"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **76. Obtener historial de tickets de usuario**

**Endpoint:** `GET /soporte/tickets/usuario`
**Descripción:** Obtiene el historial de tickets de soporte del usuario autenticado.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?estado=(Tipo: string, Opcional, Descripción: Estado del ticket: 'pendiente', 'en_progreso', 'esperando_respuesta', 'resuelto', 'cerrado', 'cancelado')
&categoria=(Tipo: string, Opcional, Descripción: Categoría del ticket)
&pagina=(Tipo: number, Opcional, Descripción: Número de página, por defecto 1)
&limite=(Tipo: number, Opcional, Descripción: Límite de resultados por página, por defecto 20)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket123",
        "numero_ticket": "TKT-2025-001",
        "titulo": "Problema con acceso a plataforma",
        "categoria": "acceso",
        "prioridad": "normal",
        "estado": "resuelto",
        "fecha_creacion": "2025-10-31T20:30:00.000Z",
        "fecha_resolucion": "2025-11-01T10:15:00.000Z",
        "usuario": {
          "id": "usr123",
          "nombre": "Juan",
          "apellido": "Pérez"
        }
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 2,
      "total_resultados": 25,
      "limite": 20
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **77. Obtener detalle de ticket**

**Endpoint:** `GET /soporte/tickets/:id`
**Descripción:** Obtiene los detalles completos de un ticket específico del usuario autenticado.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket123",
      "numero_ticket": "TKT-2025-001",
      "titulo": "Problema con acceso a plataforma",
      "descripcion": "No puedo iniciar sesión en la plataforma desde mi dispositivo móvil",
      "categoria": "acceso",
      "prioridad": "normal",
      "estado": "resuelto",
      "fecha_creacion": "2025-10-31T20:30:00.000Z",
      "fecha_asignacion": "2025-10-31T21:00:00.000Z",
      "fecha_resolucion": "2025-11-01T10:15:00.000Z",
      "satisfaccion_usuario": 5,
      "usuario": {
        "id": "usr123",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "apoderado",
        "telefono": "987654321"
      },
      "asignado": {
        "id": "admin123",
        "nombre": "María",
        "apellido": "González"
      },
      "respuestas": [
        {
          "id": "resp123",
          "contenido": "Hemos verificado su problema. Por favor, intente limpiar la caché de su navegador.",
          "fecha_respuesta": "2025-10-31T21:30:00.000Z",
          "es_respuesta_publica": true,
          "usuario": {
            "id": "admin123",
            "nombre": "María",
            "apellido": "González",
            "rol": "administrador"
          }
        }
      ],
      "archivos_adjuntos": []
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 404 Not Found (Ticket no encontrado):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado"
  }
}
```

---

### **78. Responder a ticket (usuario)**

**Endpoint:** `POST /soporte/tickets/:id/respuestas`
**Descripción:** Agrega una respuesta a un ticket existente desde la cuenta del usuario.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "contenido": (Tipo: string, Obligatorio, Descripción: Contenido de la respuesta, mínimo 10 caracteres)
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**
```json
{
  "success": true,
  "data": {
    "respuesta": {
      "id": "resp124",
      "ticket_id": "ticket123",
      "contenido": "Ya intenté limpiar la caché pero el problema persiste. Adjunto captura de pantalla.",
      "fecha_respuesta": "2025-11-01T08:30:00.000Z",
      "es_respuesta_publica": true,
      "usuario": {
        "id": "usr123",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "apoderado"
      }
    }
  },
  "message": "Respuesta agregada exitosamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El contenido debe tener al menos 10 caracteres"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 404 Not Found (Ticket no encontrado):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado"
  }
}
```

---

### **79. Calificar satisfacción de ticket**

**Endpoint:** `POST /soporte/tickets/:id/calificar`
**Descripción:** Califica la satisfacción del usuario con la solución proporcionada para un ticket resuelto.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "satisfaccion": (Tipo: number, Obligatorio, Descripción: Nivel de satisfacción, valores: 1-5)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "message": "Calificación registrada exitosamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La calificación debe estar entre 1 y 5"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 404 Not Found (Ticket no encontrado o no resuelto):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado o no está resuelto"
  }
}
```

---

### **80. Obtener categorías de tickets**

**Endpoint:** `GET /soporte/categorias`
**Descripción:** Obtiene la lista de categorías disponibles para los tickets de soporte.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": "cat1",
        "nombre": "acceso",
        "descripcion": "Problemas relacionados con el acceso a la plataforma",
        "icono": "login",
        "color": "#FF5722"
      },
      {
        "id": "cat2",
        "nombre": "funcionalidad",
        "descripcion": "Errores en el funcionamiento de las características",
        "icono": "bug",
        "color": "#2196F3"
      },
      {
        "id": "cat3",
        "nombre": "rendimiento",
        "descripcion": "Consultas sobre la velocidad o rendimiento del sistema",
        "icono": "speed",
        "color": "#4CAF50"
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **81. Obtener bandeja de tickets (administrador)**

**Endpoint:** `GET /soporte/tickets`
**Descripción:** Obtiene la bandeja de tickets de soporte para gestión por parte del administrador.
**Autenticación:** Bearer token (Rol/es requeridos: Administrador)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?estado=(Tipo: string, Opcional, Descripción: Estado del ticket: 'pendiente', 'en_progreso', 'esperando_respuesta', 'resuelto', 'cerrado', 'cancelado')
&categoria=(Tipo: string, Opcional, Descripción: Categoría del ticket)
&prioridad=(Tipo: string, Opcional, Descripción: Prioridad del ticket: 'baja', 'normal', 'alta', 'urgente')
&asignado_a=(Tipo: string, Opcional, Descripción: ID del administrador asignado)
&pagina=(Tipo: number, Opcional, Descripción: Número de página, por defecto 1)
&limite=(Tipo: number, Opcional, Descripción: Límite de resultados por página, por defecto 20)
&busqueda=(Tipo: string, Opcional, Descripción: Término de búsqueda en título, descripción o número de ticket)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket123",
        "numero_ticket": "TKT-2025-001",
        "titulo": "Problema con acceso a plataforma",
        "categoria": "acceso",
        "prioridad": "normal",
        "estado": "en_progreso",
        "fecha_creacion": "2025-10-31T20:30:00.000Z",
        "fecha_asignacion": "2025-10-31T21:00:00.000Z",
        "usuario": {
          "id": "usr123",
          "nombre": "Juan",
          "apellido": "Pérez",
          "rol": "apoderado",
          "telefono": "987654321"
        },
        "asignado": {
          "id": "admin123",
          "nombre": "María",
          "apellido": "González"
        },
        "_count": {
          "respuestas": 3
        }
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 3,
      "total_resultados": 45,
      "limite": 20
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

### **82. Obtener ticket para gestión (administrador)**

**Endpoint:** `GET /soporte/tickets/:id`
**Descripción:** Obtiene los detalles completos de un ticket para gestión por parte del administrador.
**Autenticación:** Bearer token (Rol/es requeridos: Administrador)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket123",
      "numero_ticket": "TKT-2025-001",
      "titulo": "Problema con acceso a plataforma",
      "descripcion": "No puedo iniciar sesión en la plataforma desde mi dispositivo móvil",
      "categoria": "acceso",
      "prioridad": "normal",
      "estado": "en_progreso",
      "fecha_creacion": "2025-10-31T20:30:00.000Z",
      "fecha_asignacion": "2025-10-31T21:00:00.000Z",
      "tiempo_respuesta_horas": 0.5,
      "usuario": {
        "id": "usr123",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "apoderado",
        "telefono": "987654321"
      },
      "asignado": {
        "id": "admin123",
        "nombre": "María",
        "apellido": "González"
      },
      "respuestas": [
        {
          "id": "resp123",
          "contenido": "Hemos verificado su problema. Por favor, intente limpiar la caché de su navegador.",
          "fecha_respuesta": "2025-10-31T21:30:00.000Z",
          "es_respuesta_publica": true,
          "usuario": {
            "id": "admin123",
            "nombre": "María",
            "apellido": "González",
            "rol": "administrador"
          }
        }
      ],
      "archivos_adjuntos": []
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Ticket no encontrado):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado"
  }
}
```

---

### **83. Responder a ticket (administrador)**

**Endpoint:** `POST /soporte/tickets/:id/respuestas`
**Descripción:** Agrega una respuesta a un ticket existente desde la cuenta del administrador.
**Autenticación:** Bearer token (Rol/es requeridos: Administrador)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "contenido": (Tipo: string, Obligatorio, Descripción: Contenido de la respuesta, mínimo 10 caracteres),
  "estado_cambio": (Tipo: string, Opcional, Descripción: Nuevo estado del ticket si se desea cambiar),
  "es_respuesta_publica": (Tipo: boolean, Opcional, Descripción: Indica si la respuesta es visible para el usuario, por defecto true)
}
```

#### **Respuestas de Éxito:**
**Código 201 Created:**
```json
{
  "success": true,
  "data": {
    "respuesta": {
      "id": "resp124",
      "ticket_id": "ticket123",
      "contenido": "Le hemos asignado un técnico especializado que contactará con usted en las próximas 24 horas.",
      "fecha_respuesta": "2025-11-01T08:30:00.000Z",
      "es_respuesta_publica": true,
      "estado_cambio": "en_progreso",
      "usuario": {
        "id": "admin123",
        "nombre": "María",
        "apellido": "González",
        "rol": "administrador"
      }
    }
  },
  "message": "Respuesta agregada exitosamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El contenido debe tener al menos 10 caracteres"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Ticket no encontrado):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado"
  }
}
```

---

### **84. Cambiar estado de ticket**

**Endpoint:** `PATCH /soporte/tickets/:id/estado`
**Descripción:** Cambia el estado de un ticket existente.
**Autenticación:** Bearer token (Rol/es requeridos: Administrador)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "estado": (Tipo: string, Obligatorio, Descripción: Nuevo estado del ticket: 'pendiente', 'en_progreso', 'esperando_respuesta', 'resuelto', 'cerrado', 'cancelado'),
  "motivo": (Tipo: string, Opcional, Descripción: Motivo del cambio de estado)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "message": "Estado actualizado exitosamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Estado no válido"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Ticket no encontrado):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado"
  }
}
```

---

### **85. Resolver ticket**

**Endpoint:** `POST /soporte/tickets/:id/resolver`
**Descripción:** Marca un ticket como resuelto, proporcionando la solución final.
**Autenticación:** Bearer token (Rol/es requeridos: Administrador)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "solucion": (Tipo: string, Obligatorio, Descripción: Descripción detallada de la solución, mínimo 20 caracteres),
  "solicitar_calificacion": (Tipo: boolean, Opcional, Descripción: Indica si se solicitará calificación al usuario, por defecto true)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "message": "Ticket resuelto exitosamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La solución debe tener al menos 20 caracteres"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Ticket no encontrado):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado"
  }
}
```

---

### **86. Asignar ticket a administrador**

**Endpoint:** `POST /soporte/tickets/:id/asignar`
**Descripción:** Asigna un ticket a un administrador específico.
**Autenticación:** Bearer token (Rol/es requeridos: Administrador)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único del ticket)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Cuerpo de la Petición (Request Body):**
```json
{
  "administrador_id": (Tipo: string, Obligatorio, Descripción: Identificador único del administrador)
}
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "message": "Ticket asignado exitosamente"
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADMIN",
    "message": "Administrador no válido"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

**Código 404 Not Found (Ticket no encontrado):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ticket no encontrado"
  }
}
```

---

### **87. Obtener estadísticas de soporte**

**Endpoint:** `GET /soporte/estadisticas`
**Descripción:** Obtiene estadísticas de los tickets de soporte para un período específico.
**Autenticación:** Bearer token (Rol/es requeridos: Administrador)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?periodo=(Tipo: string, Opcional, Descripción: Período de análisis: 'semana', 'mes', 'trimestre', 'año', por defecto 'mes')
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "periodo": "mes",
    "fecha_inicio": "2025-10-01T00:00:00.000Z",
    "fecha_fin": "2025-10-31T23:59:59.999Z",
    "totales": {
      "tickets_creados": 125,
      "tickets_resueltos": 98,
      "tasa_resolucion": 78.4,
      "tiempo_promedio_respuesta": 4.2,
      "satisfaccion_promedio": 4.3
    },
    "por_estado": [
      {
        "estado": "pendiente",
        "count": 5
      },
      {
        "estado": "en_progreso",
        "count": 12
      },
      {
        "estado": "resuelto",
        "count": 98
      },
      {
        "estado": "cerrado",
        "count": 8
      },
      {
        "estado": "cancelado",
        "count": 2
      }
    ],
    "por_categoria": [
      {
        "categoria": "acceso",
        "count": 45
      },
      {
        "categoria": "funcionalidad",
        "count": 38
      },
      {
        "categoria": "rendimiento",
        "count": 25
      },
      {
        "categoria": "otro",
        "count": 17
      }
    ],
    "por_prioridad": [
      {
        "prioridad": "urgente",
        "count": 8
      },
      {
        "prioridad": "alta",
        "count": 15
      },
      {
        "prioridad": "normal",
        "count": 85
      },
      {
        "prioridad": "baja",
        "count": 17
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 403 Forbidden (Permisos insuficientes):**
```json
{
  "success": false,
  "error": "No tienes los permisos necesarios para realizar esta acción"
}
```

---

## MÓDULO DE CENTRO DE AYUDA

### **88. Obtener FAQs**

**Endpoint:** `GET /soporte/faqs`
**Descripción:** Obtiene la lista de preguntas frecuentes (FAQs) disponibles en el sistema.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?categoria_id=(Tipo: string, Opcional, Descripción: Identificador de la categoría de FAQ)
&busqueda=(Tipo: string, Opcional, Descripción: Término de búsqueda en pregunta o respuesta)
&pagina=(Tipo: number, Opcional, Descripción: Número de página, por defecto 1)
&limite=(Tipo: number, Opcional, Descripción: Límite de resultados por página, por defecto 20)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": "faq123",
        "pregunta": "¿Cómo restablecer mi contraseña?",
        "respuesta": "Para restablecer su contraseña, haga clic en el enlace 'Olvidé mi contraseña' en la página de inicio de sesión y siga las instrucciones.",
        "categoria": {
          "id": "cat1",
          "nombre": "acceso",
          "icono": "login",
          "color": "#FF5722"
        },
        "vistas": 245,
        "orden": 1,
        "fecha_creacion": "2025-10-15T10:30:00.000Z",
        "fecha_actualizacion": "2025-10-20T14:15:00.000Z"
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 3,
      "total_resultados": 45,
      "limite": 20
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **89. Obtener detalle de FAQ**

**Endpoint:** `GET /soporte/faqs/:id`
**Descripción:** Obtiene los detalles completos de una pregunta frecuente (FAQ) específica.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único de la FAQ)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "faq": {
      "id": "faq123",
      "pregunta": "¿Cómo restablecer mi contraseña?",
      "respuesta": "Para restablecer su contraseña, haga clic en el enlace 'Olvidé mi contraseña' en la página de inicio de sesión y siga las instrucciones.",
      "categoria": {
        "id": "cat1",
        "nombre": "acceso",
        "icono": "login",
        "color": "#FF5722"
      },
      "vistas": 246,
      "orden": 1,
      "fecha_creacion": "2025-10-15T10:30:00.000Z",
      "fecha_actualizacion": "2025-10-20T14:15:00.000Z"
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 404 Not Found (FAQ no encontrada):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "FAQ no encontrada"
  }
}
```

---

### **90. Obtener categorías de FAQs**

**Endpoint:** `GET /soporte/faqs-categorias`
**Descripción:** Obtiene la lista de categorías disponibles para las preguntas frecuentes (FAQs).
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": "cat1",
        "nombre": "acceso",
        "descripcion": "Preguntas relacionadas con el acceso a la plataforma",
        "icono": "login",
        "color": "#FF5722",
        "_count": {
          "preguntas": 15
        }
      },
      {
        "id": "cat2",
        "nombre": "funcionalidad",
        "descripcion": "Preguntas sobre el funcionamiento de las características",
        "icono": "bug",
        "color": "#2196F3",
        "_count": {
          "preguntas": 12
        }
      },
      {
        "id": "cat3",
        "nombre": "perfil",
        "descripcion": "Preguntas sobre la configuración del perfil de usuario",
        "icono": "user",
        "color": "#4CAF50",
        "_count": {
          "preguntas": 8
        }
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **91. Obtener guías**

**Endpoint:** `GET /soporte/guias`
**Descripción:** Obtiene la lista de guías de ayuda disponibles en el sistema.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?categoria_id=(Tipo: string, Opcional, Descripción: Identificador de la categoría de guía)
&busqueda=(Tipo: string, Opcional, Descripción: Término de búsqueda en título o descripción)
&pagina=(Tipo: number, Opcional, Descripción: Número de página, por defecto 1)
&limite=(Tipo: number, Opcional, Descripción: Límite de resultados por página, por defecto 20)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "guias": [
      {
        "id": "guia123",
        "titulo": "Guía de inicio rápido para padres",
        "descripcion": "Esta guía le ayudará a familiarizarse con las funciones básicas de la plataforma para padres de familia.",
        "categoria": {
          "id": "cat1",
          "nombre": "padres",
          "icono": "family",
          "color": "#9C27B0"
        },
        "descargas": 156,
        "orden": 1,
        "fecha_creacion": "2025-10-15T10:30:00.000Z",
        "fecha_actualizacion": "2025-10-20T14:15:00.000Z"
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 2,
      "total_resultados": 25,
      "limite": 20
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **92. Obtener detalle de guía**

**Endpoint:** `GET /soporte/guias/:id`
**Descripción:** Obtiene los detalles completos de una guía de ayuda específica.
**Autenticación:** Bearer token (Todos los roles)

#### **Parámetros de Ruta (Path Parameters):**
```
{id} = (Tipo: string, Descripción: Identificador único de la guía)
```

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "guia": {
      "id": "guia123",
      "titulo": "Guía de inicio rápido para padres",
      "descripcion": "Esta guía le ayudará a familiarizarse con las funciones básicas de la plataforma para padres de familia.",
      "contenido": "# Guía de inicio rápido para padres\n\n## 1. Inicio de sesión\nPara acceder a la plataforma, use su correo electrónico y contraseña proporcionados por la institución.\n\n## 2. Navegación principal\nEl menú principal le permite acceder a:\n- Dashboard\n- Comunicados\n- Calificaciones\n- Asistencia\n\n## 3. Ver información de sus hijos\nDesde el panel principal, puede seleccionar a sus hijos para ver su información académica y de asistencia.\n\n## 4. Comunicación con docentes\nPuede enviar mensajes directos a los docentes de sus hijos a través de la sección de mensajería.",
      "categoria": {
        "id": "cat1",
        "nombre": "padres",
        "icono": "family",
        "color": "#9C27B0"
      },
      "descargas": 157,
      "orden": 1,
      "fecha_creacion": "2025-10-15T10:30:00.000Z",
      "fecha_actualizacion": "2025-10-20T14:15:00.000Z"
    }
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

**Código 404 Not Found (Guía no encontrada):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Guía no encontrada"
  }
}
```

---

### **93. Obtener categorías de guías**

**Endpoint:** `GET /soporte/guias-categorias`
**Descripción:** Obtiene la lista de categorías disponibles para las guías de ayuda.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": "cat1",
        "nombre": "padres",
        "descripcion": "Guías específicas para padres de familia",
        "icono": "family",
        "color": "#9C27B0",
        "_count": {
          "guias": 8
        }
      },
      {
        "id": "cat2",
        "nombre": "docentes",
        "descripcion": "Guías específicas para docentes",
        "icono": "school",
        "color": "#2196F3",
        "_count": {
          "guias": 12
        }
      },
      {
        "id": "cat3",
        "nombre": "estudiantes",
        "descripcion": "Guías específicas para estudiantes",
        "icono": "person",
        "color": "#4CAF50",
        "_count": {
          "guias": 5
        }
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **94. Búsqueda general en centro de ayuda**

**Endpoint:** `GET /soporte/buscar`
**Descripción:** Realiza una búsqueda general en FAQs y guías de ayuda.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?termino=(Tipo: string, Obligatorio, Descripción: Término de búsqueda, mínimo 3 caracteres)
&pagina=(Tipo: number, Opcional, Descripción: Número de página, por defecto 1)
&limite=(Tipo: number, Opcional, Descripción: Límite de resultados por página, por defecto 10)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "termino": "acceso",
    "resultados": [
      {
        "id": "faq123",
        "pregunta": "¿Cómo restablecer mi contraseña?",
        "respuesta": "Para restablecer su contraseña, haga clic en el enlace 'Olvidé mi contraseña' en la página de inicio de sesión y siga las instrucciones.",
        "tipo": "faq",
        "categoria": {
          "id": "cat1",
          "nombre": "acceso",
          "icono": "login",
          "color": "#FF5722"
        },
        "vistas": 245
      },
      {
        "id": "guia123",
        "titulo": "Guía de solución de problemas de acceso",
        "descripcion": "Esta guía le ayudará a resolver los problemas más comunes de acceso a la plataforma.",
        "tipo": "guia",
        "categoria": {
          "id": "cat1",
          "nombre": "acceso",
          "icono": "login",
          "color": "#FF5722"
        },
        "descargas": 156
      }
    ],
    "totales": {
      "faqs": 15,
      "guias": 8,
      "total": 23
    },
    "paginacion": {
      "pagina_actual": 1,
      "limite": 10
    }
  }
}
```

#### **Respuestas de Error:**
**Código 400 Bad Request (Datos inválidos):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El término de búsqueda debe tener al menos 3 caracteres"
  }
}
```

**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

### **95. Obtener contenido destacado**

**Endpoint:** `GET /soporte/destacado`
**Descripción:** Obtiene el contenido más visitado o descargado del centro de ayuda.
**Autenticación:** Bearer token (Todos los roles)

#### **Cabeceras (Headers):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de Consulta (Query Parameters):**
```
?limite=(Tipo: number, Opcional, Descripción: Límite de resultados, por defecto 5)
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "data": {
    "faqs_destacadas": [
      {
        "id": "faq123",
        "pregunta": "¿Cómo restablecer mi contraseña?",
        "respuesta": "Para restablecer su contraseña, haga clic en el enlace 'Olvidé mi contraseña' en la página de inicio de sesión y siga las instrucciones.",
        "categoria": {
          "id": "cat1",
          "nombre": "acceso",
          "icono": "login",
          "color": "#FF5722"
        },
        "vistas": 245
      }
    ],
    "guias_destacadas": [
      {
        "id": "guia123",
        "titulo": "Guía de inicio rápido para padres",
        "descripcion": "Esta guía le ayudará a familiarizarse con las funciones básicas de la plataforma para padres de familia.",
        "categoria": {
          "id": "cat1",
          "nombre": "padres",
          "icono": "family",
          "color": "#9C27B0"
        },
        "descargas": 156
      }
    ]
  }
}
```

#### **Respuestas de Error:**
**Código 401 Unauthorized (No autorizado):**
```json
{
  "success": false,
  "error": "Token no proporcionado, inválido o expirado"
}
```

---

## ENDPOINT DE SALUD DEL SISTEMA

### **96. Verificar estado de la API**

**Endpoint:** `GET /health`
**Descripción:** Verifica el estado de funcionamiento de la API.
**Autenticación:** No requiere autenticación

#### **Cabeceras (Headers):**
```
Content-Type: application/json
```

#### **Respuestas de Éxito:**
**Código 200 OK:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2025-10-31T22:37:22.412Z",
  "uptime": 3600.5
}
```

#### **Respuestas de Error:**
**Código 500 Internal Server Error (Error interno):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Error interno del servidor"
  }
}
```

# GUÍA DE ENDPOINTS DE LA API

Esta guía documenta todos los endpoints disponibles en la API del sistema de gestión educativa I.E.P. LAS ORQUÍDEAS.

## TABLA DE CONTENIDOS

1. [MÓDULO DE AUTENTICACIÓN](#módulo-de-autenticación)
   - 1.1. Iniciar sesión
   - 1.2. Cerrar sesión
   - 1.3. Refrescar token
   - 1.4. Verificar token
   - 1.5. Cambiar contraseña
   - 1.6. Solicitar restablecimiento de contraseña
   - 1.7. Confirmar restablecimiento de contraseña

2. [MÓDULO DE USUARIOS](#módulo-de-usuarios)
   - 2.1. Obtener perfil de usuario

3. [MÓDULO DE COMUNICADOS](#módulo-de-comunicados)
   - 3.1. Listar comunicados
   - 3.2. Obtener detalle de comunicado
   - 3.3. Crear comunicado
   - 3.4. Actualizar comunicado
   - 3.5. Eliminar comunicado
   - 3.6. Publicar comunicado
   - 3.7. Archivar comunicado
   - 3.8. Obtener comunicados por curso
   - 3.9. Obtener comunicados por nivel/grado
   - 3.10. Obtener comunicados por estado
   - 3.11. Obtener comunicados por fecha
   - 3.12. Obtener comunicados por autor
   - 3.13. Obtener comunicados destacados
   - 3.14. Marcar comunicado como leído
   - 3.15. Obtener estadísticas de comunicados
   - 3.16. Obtener plantillas de comunicados
   - 3.17. Crear plantilla de comunicado
   - 3.18. Actualizar plantilla de comunicado
   - 3.19. Eliminar plantilla de comunicado
   - 3.20. Obtener categorías de comunicados
   - 3.21. Obtener comunicados para apoderados
   - 3.22. Obtener comunicados para docentes

4. [MÓDULO DE ENCUESTAS](#módulo-de-encuestas)
   - 4.1. Listar encuestas
   - 4.2. Obtener detalle de encuesta
   - 4.3. Crear encuesta
   - 4.4. Actualizar encuesta
   - 4.5. Eliminar encuesta
   - 4.6. Publicar encuesta
   - 4.7. Cerrar encuesta
   - 4.8. Responder encuesta
   - 4.9. Obtener resultados de encuesta

5. [MÓDULO DE MENSAJERÍA](#módulo-de-mensajería)
   - 5.1. Listar conversaciones
   - 5.2. Obtener detalle de conversación
   - 5.3. Crear conversación
   - 5.4. Cerrar conversación
   - 5.5. Obtener mensajes de conversación
   - 5.6. Enviar mensaje en conversación
   - 5.7. Marcar mensajes como leídos (lote)
   - 5.8. Obtener mensajes nuevos
   - 5.9. Descargar archivo adjunto
   - 5.10. Obtener conversaciones de estudiante
   - 5.11. Obtener conversaciones de docente
   - 5.12. Obtener conversaciones de apoderado

6. [MÓDULO DE ASISTENCIA](#módulo-de-asistencia)
   - 6.1. Verificar contexto de asistencia
   - 6.2. Generar plantilla de asistencia
   - 6.3. Validar archivo de asistencia
   - 6.4. Cargar asistencias
   - 6.5. Descargar reporte de errores
   - 6.6. Obtener estadísticas de asistencia
   - 6.7. Consultar asistencia por período
   - 6.8. Obtener estadísticas de asistencia de estudiante
   - 6.9. Exportar asistencia a PDF

7. [MÓDULO DE NOTAS ACADÉMICAS](#módulo-de-notas-académicas)
   - 7.1. Generar plantilla de calificaciones
   - 7.2. Validar archivo de calificaciones
   - 7.3. Cargar calificaciones
   - 7.4. Descargar reporte de errores de calificaciones
   - 7.5. Consultar calificaciones de estudiante
   - 7.6. Obtener promedio de componente de estudiante
   - 7.7. Obtener resumen académico de estudiante
   - 7.8. Exportar resumen académico a PDF
   - 7.9. Obtener promedios trimestrales de estudiante
   - 7.10. Obtener promedios anuales de estudiante

8. [MÓDULO DE CURSOS](#módulo-de-cursos)
   - 8.1. Obtener cursos asignados a docente
   - 8.2. Obtener cursos por nivel y grado
   - 8.3. Obtener estudiantes de un curso

9. [MÓDULO DE EVALUACIÓN](#módulo-de-evaluación)
   - 9.1. Obtener estructura de evaluación
   - 9.2. Actualizar estructura de evaluación
   - 9.3. Obtener historial de configuraciones de evaluación
   - 9.4. Obtener plantillas de evaluación
   - 9.5. Previsualizar impacto de pesos
   - 9.6. Obtener niveles y grados
   - 9.7. Obtener año académico actual
   - 9.8. Obtener cursos de estudiante
   - 9.9. Obtener tipos de plantillas
   - 9.10. Generar plantilla de calificaciones
   - 9.11. Generar plantilla de asistencia
   - 9.12. Obtener guía de plantillas
   - 9.13. Obtener guía de plantillas en PDF

10. [MÓDULO DE SOPORTE TÉCNICO](#módulo-de-soporte-técnico)
    - 10.1. Crear ticket de soporte
    - 10.2. Obtener historial de tickets de usuario
    - 10.3. Obtener detalle de ticket
    - 10.4. Responder a ticket (usuario)
    - 10.5. Calificar satisfacción de ticket
    - 10.6. Obtener categorías de tickets
    - 10.7. Obtener bandeja de tickets (administrador)
    - 10.8. Obtener ticket para gestión (administrador)
    - 10.9. Responder a ticket (administrador)
    - 10.10. Cambiar estado de ticket
    - 10.11. Resolver ticket
    - 10.12. Asignar ticket a administrador
    - 10.13. Obtener estadísticas de soporte
    - 10.14. Obtener FAQs
    - 10.15. Obtener detalle de FAQ
    - 10.16. Obtener categorías de FAQs
    - 10.17. Obtener guías
    - 10.18. Obtener detalle de guía
    - 10.19. Obtener categorías de guías
    - 10.20. Búsqueda general en centro de ayuda
    - 10.21. Obtener contenido destacado

11. [ENDPOINT DE SALUD DEL SISTEMA](#endpoint-de-salud-del-sistema)
    - 11.1. Verificar estado de la API

## RESUMEN DE LA DOCUMENTACIÓN

Esta guía documenta un total de **96 endpoints** distribuidos en **11 módulos** principales:

- **Autenticación**: 7 endpoints para gestión de sesiones y recuperación de contraseñas
- **Usuarios**: 1 endpoint para gestión de perfiles
- **Comunicados**: 22 endpoints para gestión de comunicaciones institucionales
- **Encuestas**: 9 endpoints para creación y gestión de encuestas
- **Mensajería**: 12 endpoints para comunicación directa entre usuarios
- **Asistencia**: 9 endpoints para registro y seguimiento de asistencias
- **Notas Académicas**: 10 endpoints para gestión de calificaciones y resúmenes académicos
- **Cursos**: 3 endpoints para gestión de cursos y estudiantes
- **Evaluación**: 13 endpoints para configuración de estructuras de evaluación y plantillas
- **Soporte Técnico**: 21 endpoints para gestión de tickets de soporte y centro de ayuda
- **Salud del Sistema**: 1 endpoint para verificación del estado de la API

Cada endpoint incluye:
- Descripción detallada de su funcionalidad
- Método HTTP y URL completa
- Parámetros requeridos y opcionales
- Cabeceras necesarias
- Ejemplos de respuestas exitosas
- Posibles respuestas de error con códigos HTTP

## CONVENCIONES UTILIZADAS

- **Autenticación**: La mayoría de endpoints requieren un token JWT en la cabecera `Authorization: Bearer <token>`
- **Roles**: Los permisos se gestionan por roles (apoderado, docente, director, administrador)
- **Paginación**: Los endpoints que devuelven listas utilizan parámetros `pagina` y `limite`
- **Formato de fechas**: Se utiliza el formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Códigos de estado**: Se siguen los códigos HTTP estándar (200, 201, 400, 401, 403, 404, 500)

## CONSIDERACIONES FINALES

- Esta documentación está basada en la versión actual de la API y puede estar sujeta a cambios.
- Para obtener información sobre versiones y cambios futuros, consulte el registro de cambios (changelog) del proyecto.

