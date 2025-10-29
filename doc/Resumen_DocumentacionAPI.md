
# Documentación API REST - Plataforma de Comunicación y Seguimiento Académico

**Institución:** I.E.P. Las Orquídeas  
**Fecha:** 2025  
**Versión:** 1.0

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`


### **Autenticación JWT**
- Todos los endpoints requieren autenticación (excepto los de login y recuperación de contraseña)
- Incluir en cada request: `Authorization: Bearer <token>`
- Roles autorizados: `apoderado`, `docente`, `director`, `administrador`

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

## **SECCIÓN 1: AUTENTICACIÓN**

### **1. Iniciar Sesión**

**Endpoint:** `POST /auth/login`  
**Descripción:** Autentica usuario y genera token JWT  
**Autenticación:** Pública (sin token)

#### **Request Body:**
```json
{
  "tipo_documento": "DNI",
  "nro_documento": "12345678",
  "password": "contraseña123"
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
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "apoderado",
      "telefono": "+51987654321",
      "fecha_ultimo_login": "2025-01-10T08:00:00Z",
      "debe_cambiar_password": false
    },
    "redirect_to": "/dashboard/padre",
    "context": {
      "hijos": [],
      "hijo_seleccionado_default": null
    }
  }
}
```

#### **Response Errors:**
- **401 Unauthorized - Credenciales inválidas:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Documento o contraseña incorrectos"
  }
}
```

---

### **2. Recuperar Contraseña**

**Endpoint:** `POST /auth/forgot-password`  
**Descripción:** Envía enlace de recuperación por WhatsApp  
**Autenticación:** Pública (sin token)

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

---

### **3. Restablecer Contraseña**

**Endpoint:** `POST /auth/reset-password`  
**Descripción:** Establece nueva contraseña con token de recuperación  
**Autenticación:** Pública (sin token)

#### **Request Body:**
```json
{
  "token": "uuid-token-recuperacion",
  "nueva_password": "NuevaContraseña123",
  "confirmar_password": "NuevaContraseña123"
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

---

### **4. Cerrar Sesión**

**Endpoint:** `POST /auth/logout`  
**Descripción:** Invalida token JWT actual  
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

---

### **5. Validar Token**

**Endpoint:** `GET /auth/validate-token`  
**Descripción:** Verifica validez del token JWT  
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expires_in": "23h 45m",
    "user": {
      "id": "usr_001",
      "rol": "apoderado",
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
}
```

---

### **6. Cambiar Contraseña Obligatoria**

**Endpoint:** `POST /auth/change-required-password`  
**Descripción:** Cambio de contraseña para usuarios con `debe_cambiar_password = true`  
**Autenticación:** Bearer token (Todos los roles)

#### **Request Body:**
```json
{
  "password_actual": "contraseña_actual",
  "nueva_password": "NuevaContraseña123",
  "confirmar_password": "NuevaContraseña123"
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

---

### **7. Obtener Contexto del Padre**

**Endpoint:** `GET /auth/parent-context/:user_id`
**Descripción:** Obtiene hijos vinculados al padre con información académica completa
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{user_id} = ID del usuario padre (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "hijos": [
      {
        "id": "41a379f9-ec54-4e01-8d64-e0df693e8721",
        "codigo_estudiante": "P3001",
        "nombre_completo": "Estudiante Ejemplo",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3",
          "descripcion": "3ro de Primaria"
        },
        "estado_matricula": "activo"
      }
    ],
    "total_hijos": 1
  }
}
```

#### **Response Errors:**
- **403 Forbidden - Usuario no es padre:**
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "El usuario no tiene rol de apoderado"
  }
}
```

- **404 Not Found - Usuario no encontrado:**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuario no encontrado"
  }
}
```

#### **Reglas de Negocio:**
- Solo usuarios con rol `apoderado` pueden acceder a este endpoint
- El endpoint devuelve información completa de los hijos vinculados al padre
- Incluye datos académicos como nivel, grado y estado de matrícula
- Se utiliza principalmente para el contexto inicial del dashboard del padre

---

## **SECCIÓN 2: USUARIOS Y PERMISOS**

### **8. Obtener Hijos del Padre Autenticado**

**Endpoint:** `GET /usuarios/hijos`  
**Descripción:** Lista hijos vinculados al padre autenticado  
**Autenticación:** Bearer token (Rol: Apoderado)

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
      }
    ],
    "total_hijos": 1
  }
}
```

---

### **9. Obtener Permisos de Docentes**

**Endpoint:** `GET /teachers/permissions`  
**Descripción:** Lista permisos de docentes (Director: todos, Docente: propios)  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "docentes": [
      {
        "id": "usr_doc_001",
        "nombre_completo": "Ana María Rodríguez Vega",
        "rol": "docente",
        "permisos": [
          {
            "tipo_permiso": "comunicados",
            "estado_activo": true,
            "fecha_otorgamiento": "2025-01-10T08:00:00Z",
            "otorgado_por": {
              "id": "usr_dir_001",
              "nombre": "Carlos Méndez"
            }
          }
        ]
      }
    ],
    "total_docentes": 1
  }
}
```

---

### **10. Actualizar Permiso de Docente**

**Endpoint:** `PATCH /teachers/:docente_id/permissions`  
**Descripción:** Actualiza estado de un permiso específico de un docente  
**Autenticación:** Bearer token (Rol: Director)

#### **Request Body:**
```json
{
  "tipo_permiso": "comunicados",
  "estado_activo": true
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Permiso actualizado correctamente",
    "docente_id": "usr_doc_001",
    "tipo_permiso": "comunicados",
    "nuevo_estado": true,
    "actualizado_por": {
      "id": "usr_dir_001",
      "nombre": "Carlos Méndez"
    },
    "fecha_actualizacion": "2025-01-10T08:00:00Z"
  }
}
```

---

### **11. Obtener Historial de Permisos de Docente**

**Endpoint:** `GET /teachers/:docente_id/permissions/history`  
**Descripción:** Historial de cambios en permisos de un docente  
**Autenticación:** Bearer token (Rol: Director)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": "usr_doc_001",
      "nombre_completo": "Ana María Rodríguez Vega"
    },
    "historial_permisos": [
      {
        "id": "perm_001",
        "tipo_permiso": "comunicados",
        "estado_anterior": false,
        "estado_nuevo": true,
        "fecha_cambio": "2025-01-10T08:00:00Z",
        "cambiado_por": {
          "id": "usr_dir_001",
          "nombre": "Carlos Méndez"
        },
        "motivo": "Autorización para crear comunicados institucionales"
      }
    ],
    "total_cambios": 1
  }
}
```

---

### **12. Obtener Docentes por Curso**

**Endpoint:** `GET /teachers/docentes/curso/:curso_id`  
**Descripción:** Lista docentes asignados a un curso específico  
**Autenticación:** Bearer token (Rol: Apoderado)

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

---

## **SECCIÓN 3: DATOS ACADÉMICOS**

### **13. Obtener Cursos Asignados (Docente)**

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
      }
    ],
    "total_cursos": 1
  }
}
```

---

### **14. Obtener Cursos por Nivel y Grado (Director)**

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
      }
    ],
    "total_cursos": 1
  }
}
```

---

### **15. Obtener Estudiantes de un Curso**

**Endpoint:** `GET /cursos/estudiantes`  
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
      }
    ],
    "total_estudiantes": 1
  }
}
```

---

### **16. Obtener Estructura de Evaluación Vigente**

**Endpoint:** `GET /evaluation-structure`  
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
      }
    ],
    "total_componentes": 1,
    "suma_pesos": 40.00,
    "configuracion_bloqueada": true
  }
}
```

---

### **17. Crear/Actualizar Estructura de Evaluación**

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
    "total_componentes": 1,
    "suma_pesos": 40.00,
    "configuracion_bloqueada": true,
    "fecha_configuracion": "2025-01-10T08:00:00Z"
  }
}
```

---

### **18. Obtener Plantillas De Estructura de Evaluacion Predefinidas**

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
          }
        ]
      }
    ],
    "total_templates": 1
  }
}
```

---

### **19. Previsualizar Impacto de Pesos**

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

### **20. Obtener Historial de Configuraciones**

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
        "total_componentes": 1,
        "fecha_configuracion": "2025-01-10T08:00:00Z",
        "configurado_por": {
          "id": "usr_dir_001",
          "nombre": "Carlos Méndez"
        },
        "bloqueada": true
      }
    ],
    "total_configuraciones": 1
  }
}
```

---

### **21. Obtener Niveles y Grados Disponibles**

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
          }
        ]
      }
    ],
    "total_niveles": 1,
    "total_grados": 1
  }
}
```

---

## **SECCIÓN 4: IMPORTACIÓN MASIVA (ADMINISTRADOR)**

### **22. Descargar Plantillas de Importación**

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

---

### **23. Validar Archivo de Importación**

**Endpoint:** `POST /admin/import/validate`  
**Descripción:** Valida archivo antes de inserción en BD  
**Autenticación:** Bearer token (Rol: Administrador)

#### **Request Body:**
```json
{
  "tipo": "padres",
  "registros": [
    {
      "nombre": "Juan Carlos Pérez López",
      "nro_documento": "12345678",
      "telefono": "+51987654321"
    }
  ]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "validacion_id": "val_20250210_001",
    "tipo": "padres",
    "resumen": {
      "total_filas": 1,
      "validos": 1,
      "con_errores": 0
    },
    "registros_validos": [
      {
        "fila": 2,
        "nombre": "Juan Carlos Pérez López",
        "nro_documento": "12345678",
        "telefono": "+51987654321"
      }
    ],
    "registros_con_errores": []
  }
}
```

---

### **24. Ejecutar Importación Masiva**

**Endpoint:** `POST /admin/import/execute`  
**Descripción:** Inserta registros válidos en base de datos  
**Autenticación:** Bearer token (Rol: Administrador)

#### **Request Body:**
```json
{
  "tipo": "padres",
  "registros_validos": [
    {
      "nombre": "Juan Carlos Pérez López",
      "nro_documento": "12345678",
      "telefono": "+51987654321"
    }
  ]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "import_id": "imp_20250210_001",
    "resumen": {
      "total_procesados": 1,
      "exitosos": 1,
      "fallidos": 0
    },
    "detalles_por_tipo": {
      "padres_creados": 1
    },
    "fecha_importacion": "2025-02-10T15:30:00Z"
  }
}
```

---

### **25. Validar Relaciones Familiares**

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

---

### **26. Crear Relaciones Familiares**

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

---

### **27. Verificar Integridad de Relaciones**

**Endpoint:** `GET /admin/verify/relationships`  
**Descripción:** Verifica que todos los estudiantes tengan apoderado  
**Autenticación:** Bearer token (Rol: Administrador)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_estudiantes": 1,
    "con_apoderado": 1,
    "sin_apoderado": 0,
    "estudiantes_sin_apoderado": []
  }
}
```

---

### **28. Generar Credenciales Iniciales**

**Endpoint:** `POST /admin/import/generate-credentials`  
**Descripción:** Genera credenciales iniciales para los usuarios recién importados  
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
    "total_credenciales": 1,
    "archivo_excel_url": "/admin/import/credentials/cred_20250210_001/download",
    "pdfs_zip_url": null,
    "fecha_generacion": "2025-10-01T12:30:00Z"
  }
}
```

---

### **29. Descargar Archivo de Credenciales**

**Endpoint:** `GET /admin/import/credentials/{credentials_id}/download`  
**Descripción:** Descarga archivo Excel con credenciales  
**Autenticación:** Bearer token (Rol: Administrador)

#### **Response Success (200):**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="credenciales.xlsx"

[Binary Excel File]
```

---

### **30. Enviar Credenciales por WhatsApp**

**Endpoint:** `POST /admin/import/credentials/{credentials_id}/send-whatsapp`  
**Descripción:** Envío masivo de credenciales vía WhatsApp  
**Autenticación:** Bearer token (Rol: Administrador)

#### **Request Body:**
```json
{
  "usuarios_seleccionados": ["usr_001"]
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_envios": 1,
    "exitosos": 1,
    "fallidos": 0,
    "detalles_fallidos": []
  }
}
```

---

### **31. Generar PDFs Individuales**

**Endpoint:** `POST /admin/import/credentials/{credentials_id}/generate-pdfs`  
**Descripción:** Genera PDFs de credenciales (uno por usuario)  
**Autenticación:** Bearer token (Rol: Administrador)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_pdfs": 1,
    "zip_url": "/admin/import/credentials/cred_20250210_001/pdfs.zip",
    "pdfs_individuales": [
      {
        "usuario_id": "usr_001",
        "pdf_url": "/admin/import/credentials/cred_20250210_001/usr_001.pdf"
      }
    ]
  }
}
```

---

## **SECCIÓN 5: CARGA DE DATOS ACADÉMICOS**

### **32. Generar Plantilla de Calificaciones**

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

---

### **33. Validar Archivo de Calificaciones**

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
      "total_filas": 1,
      "validos": 1,
      "con_errores": 0
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
    "registros_con_errores": []
  }
}
```

---

### **34. Cargar Calificaciones**

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
      "total_procesados": 1,
      "insertados_exitosamente": 1,
      "omitidos": 0
    },
    "fecha_carga": "2025-02-10T14:30:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
  }
}
```

---

### **35. Descargar Reporte de Errores de Calificaciones**

**Endpoint:** `GET /calificaciones/reporte-errores/{report_id}`  
**Descripción:** Descarga archivo TXT con errores detallados  
**Autenticación:** Bearer token (Roles: Docente, Director)

#### **Response Success (200):**
```
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="Errores_Calificaciones_Matematicas_3Primaria_T1_10022025.txt"

[Binary TXT File]
```

---

### **36. Verificar Registro Existente de Asistencia**

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
    "total_estudiantes_registrados": 1,
    "estadisticas": {
      "presente": 1,
      "tardanza": 0,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 0
    },
    "fecha_registro": "2025-02-10T08:30:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
  }
}
```

---

### **37. Generar Plantilla de Asistencia**

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

---

### **38. Validar Archivo de Asistencia**

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
      "total_filas": 1,
      "validos": 1,
      "con_errores": 0
    },
    "desglose_por_estado": {
      "presente": 1,
      "tardanza": 0,
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
      }
    ],
    "registros_con_errores": []
  }
}
```

---

### **39. Cargar Asistencia**

**Endpoint:** `POST /asistencias/cargar`  
**Descripción:** Inserta registros de asistencia en base de datos  
**Autenticación:** Bearer token (Roles: Docente, Director)

#### **Request Body:**
```json
{
  "validacion_id": "val_asi_20250210_001",
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
      "total_procesados": 1,
      "insertados_exitosamente": 1,
      "omitidos": 0
    },
    "desglose_por_estado": {
      "presente": 1,
      "tardanza": 0,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 0
    },
    "fecha_carga": "2025-02-10T08:45:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
  }
}
```

---

### **40. Descargar Reporte de Errores de Asistencia**

**Endpoint:** `GET /asistencias/reporte-errores/{report_id}`  
**Descripción:** Descarga archivo TXT con errores detallados  
**Autenticación:** Bearer token (Roles: Docente, Director)

#### **Response Success (200):**
```
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="Errores_Asistencia_3Primaria_10022025.txt"

[Binary TXT File]
```

---

### **41. Obtener Estadísticas de Asistencia del Día**

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
      "total_estudiantes": 1
    },
    "estadisticas": {
      "total_registros": 1,
      "presente": {
        "cantidad": 1,
        "porcentaje": 100.00
      },
      "tardanza": {
        "cantidad": 0,
        "porcentaje": 0.00
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
        "cantidad": 0,
        "porcentaje": 0.00
      }
    },
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    },
    "fecha_registro": "2025-02-10T08:00:00Z"
  }
}
```

---

## **SECCIÓN 6: CENTRO DE PLANTILLAS**

### **42. Listar Tipos de Plantillas Disponibles**

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

### **43. Generar Plantilla de Calificaciones (Centro de Plantillas)**

**Endpoint:** `POST /plantillas/calificaciones`  
**Descripción:** Genera plantilla desde Centro de Plantillas  
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

---

### **44. Generar Plantilla de Asistencia (Centro de Plantillas)**

**Endpoint:** `POST /plantillas/asistencia`  
**Descripción:** Genera plantilla desde Centro de Plantillas  
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

---

### **45. Obtener Guía de Uso de Plantilla**

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
      }
    ],
    "version": "1.0",
    "fecha_actualizacion": "2025-02-01"
  }
}
```

---

### **46. Descargar Guía en PDF**

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

## **SECCIÓN 7: VISUALIZACIÓN DE DATOS ACADÉMICOS (PADRES)**

### **47. Obtener Calificaciones del Estudiante**

**Endpoint:** `GET /calificaciones/estudiante/:estudiante_id`  
**Descripción:** Lista calificaciones por componente de evaluación  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025          # Año académico (default: año actual)
&trimestre=1        # Trimestre (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "codigo_estudiante": "P3001",
      "nombre_completo": "María Elena Pérez García"
    },
    "año_academico": 2025,
    "trimestre": 1,
    "calificaciones": [
      {
        "id": "eval_001",
        "nombre_componente": "Examen",
        "peso_porcentual": 40.00,
        "tipo_evaluacion": "unica",
        "calificaciones": [
          {
            "id": "cal_001",
            "fecha_evaluacion": "2025-02-10",
            "calificacion_numerica": 18.5,
            "calificacion_letra": "AD",
            "observaciones": "Excelente trabajo"
          }
        ],
        "promedio_componente": 18.5,
        "promedio_ponderado": 7.40
      }
    ],
    "promedio_general": 16.45,
    "promedio_letra": "A",
    "nivel_desempeño": "Logro Esperado"
  }
}
```

---

### **48. Obtener Promedio por Componente**

**Endpoint:** `GET /calificaciones/estudiante/:estudiante_id/promedio`  
**Descripción:** Calcula promedio por componente de evaluación  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025          # Año académico (default: año actual)
&trimestre=1        # Trimestre (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "codigo_estudiante": "P3001",
      "nombre_completo": "María Elena Pérez García"
    },
    "año_academico": 2025,
    "trimestre": 1,
    "promedios_por_componente": [
      {
        "id": "eval_001",
        "nombre_componente": "Examen",
        "peso_porcentual": 40.00,
        "promedio": 18.5,
        "promedio_ponderado": 7.40
      }
    ],
    "promedio_general": 16.45,
    "promedio_letra": "A",
    "nivel_desempeño": "Logro Esperado"
  }
}
```

---

### **49. Obtener Asistencia del Estudiante**

**Endpoint:** `GET /asistencias/estudiante/:estudiante_id`  
**Descripción:** Lista registros de asistencia por período  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025          # Año académico (default: año actual)
&mes=2              # Mes (1-12) (opcional, mutuamente excluyente con trimestre)
&trimestre=1        # Trimestre (1-3) (opcional, mutuamente excluyente con mes)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "codigo_estudiante": "P3001",
      "nombre_completo": "María Elena Pérez García"
    },
    "periodo": {
      "tipo": "trimestre",
      "valor": 1,
      "año": 2025,
      "descripcion": "Trimestre 1 de 2025"
    },
    "asistencias": [
      {
        "id": "asist_001",
        "fecha": "2025-02-10",
        "estado": "presente",
        "hora_llegada": null,
        "justificacion": null,
        "observaciones": null
      }
    ],
    "estadisticas": {
      "total_dias": 20,
      "presente": {
        "cantidad": 18,
        "porcentaje": 90.00
      },
      "tardanza": {
        "cantidad": 1,
        "porcentaje": 5.00
      },
      "permiso": {
        "cantidad": 0,
        "porcentaje": 0.00
      },
      "falta_justificada": {
        "cantidad": 1,
        "porcentaje": 5.00
      },
      "falta_injustificada": {
        "cantidad": 0,
        "porcentaje": 0.00
      }
    }
  }
}
```

---

### **50. Obtener Estadísticas de Asistencia**

**Endpoint:** `GET /asistencias/estudiante/:estudiante_id/estadisticas`  
**Descripción:** Resumen estadístico de asistencia por período  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?fecha_inicio=2025-01-01  # Fecha inicio (YYYY-MM-DD, requerida)
&fecha_fin=2025-03-31      # Fecha fin (YYYY-MM-DD, requerida)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "codigo_estudiante": "P3001",
      "nombre_completo": "María Elena Pérez García"
    },
    "periodo": {
      "fecha_inicio": "2025-01-01",
      "fecha_fin": "2025-03-31",
      "total_dias": 60
    },
    "estadisticas": {
      "total_dias": 60,
      "presente": {
        "cantidad": 54,
        "porcentaje": 90.00
      },
      "tardanza": {
        "cantidad": 3,
        "porcentaje": 5.00
      },
      "permiso": {
        "cantidad": 1,
        "porcentaje": 1.67
      },
      "falta_justificada": {
        "cantidad": 2,
        "porcentaje": 3.33
      },
      "falta_injustificada": {
        "cantidad": 0,
        "porcentaje": 0.00
      }
    },
    "tendencias": {
      "tardanzas_mensuales": [
        {
          "mes": "enero",
          "cantidad": 1
        },
        {
          "mes": "febrero",
          "cantidad": 2
        }
      ],
      "patrones_criticos": []
    }
  }
}
```

---

### **51. Exportar Asistencia**

**Endpoint:** `GET /asistencias/estudiante/:estudiante_id/export`  
**Descripción:** Genera reporte PDF de asistencia  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?formato=pdf         # Formato (solo pdf)
&fecha_inicio=2025-01-01  # Fecha inicio (YYYY-MM-DD, requerida)
&fecha_fin=2025-03-31      # Fecha fin (YYYY-MM-DD, requerida)
```

#### **Response Success (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Reporte_Asistencia_Maria_Perez_2025.pdf"

[Binary PDF File]
```

---

### **52. Obtener Resumen Académico**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id`  
**Descripción:** Resumen trimestral o anual consolidado  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025          # Año académico (default: año actual)
&trimestre=1        # Trimestre (opcional, si no se envía => vista anual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "codigo_estudiante": "P3001",
      "nombre_completo": "María Elena Pérez García",
      "nivel_grado": {
        "nivel": "Primaria",
        "grado": "3"
      }
    },
    "periodo": {
      "año": 2025,
      "tipo": "trimestre",
      "valor": 1
    },
    "resumen_por_curso": [
      {
        "curso": {
          "id": "cur_001",
          "nombre": "Matemáticas"
        },
        "promedio_trimestral": 16.45,
        "promedio_letra": "A",
        "componentes": [
          {
            "id": "eval_001",
            "nombre": "Examen",
            "peso": 40.00,
            "promedio": 18.5,
            "calificacion_letra": "AD"
          }
        ]
      }
    ],
    "promedio_general_trimestral": 16.45,
    "promedio_general_letra": "A",
    "asistencia_trimestral": {
      "total_dias": 60,
      "porcentaje_asistencia": 90.00
    },
    "observaciones_generales": "Buen desempeño académico y asistencia regular"
  }
}
```

---

### **53. Exportar Resumen Académico**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id/export`  
**Descripción:** Genera boleta institucional anual en PDF  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025          # Año académico (default: año actual)
&formato=pdf        # Formato (solo pdf)
```

#### **Response Success (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Boleta_Anual_2025_Maria_Perez.pdf"

[Binary PDF File]
```

---

### **54. Obtener Promedios Trimestrales**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id/promedios-trimestre`  
**Descripción:** Promedios por trimestre del año  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025          # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "codigo_estudiante": "P3001",
      "nombre_completo": "María Elena Pérez García"
    },
    "año": 2025,
    "promedios_trimestrales": [
      {
        "trimestre": 1,
        "promedio_general": 16.45,
        "promedio_letra": "A",
        "detalle_cursos": [
          {
            "curso": "Matemáticas",
            "promedio": 16.45,
            "promedio_letra": "A"
          }
        ]
      }
    ],
    "promedio_anual": 16.45,
    "promedio_anual_letra": "A"
  }
}
```

---

### **55. Obtener Promedios Anuales**

**Endpoint:** `GET /resumen-academico/estudiante/:estudiante_id/promedios-anuales`  
**Descripción:** Promedios de años académicos anteriores  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?años=2023,2024    # Años específicos (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "codigo_estudiante": "P3001",
      "nombre_completo": "María Elena Pérez García"
    },
    "promedios_anuales": [
      {
        "año": 2024,
        "promedio_general": 15.20,
        "promedio_letra": "B",
        "detalle_cursos": [
          {
            "curso": "Matemáticas",
            "promedio": 15.20,
            "promedio_letra": "B"
          }
        ]
      }
    ]
  }
}
```

---

## **SECCIÓN 8: MENSAJERÍA**

### **56. Obtener Lista de Conversaciones**

**Endpoint:** `GET /conversaciones`  
**Descripción:** Obtiene todas las conversaciones del usuario autenticado  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

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
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total_conversaciones": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "contadores": {
      "total": 1,
      "recibidas": 0,
      "enviadas": 1,
      "no_leidas": 0
    }
  }
}
```

---

### **57. Obtener Contador de Mensajes No Leídos**

**Endpoint:** `GET /conversaciones/no-leidas/count`  
**Descripción:** Devuelve el número total de mensajes no leídos del usuario  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_no_leidos": 0,
    "por_conversacion": []
  }
}
```

---

### **58. Verificar Actualizaciones de Conversaciones (Polling)**

**Endpoint:** `GET /conversaciones/actualizaciones`  
**Descripción:** Verifica si hay nuevos mensajes desde el último check  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

#### **Query Parameters:**
```
?ultimo_check=2025-10-09T14:30:00Z  # Timestamp del último polling (ISO 8601) (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": false,
    "nuevos_mensajes": [],
    "total_nuevos_mensajes": 0,
    "conversaciones_actualizadas": [],
    "contador_no_leidos": 0
  }
}
```

---

### **59. Marcar Conversación como Leída**

**Endpoint:** `PATCH /conversaciones/:id/marcar-leida`  
**Descripción:** Marca todos los mensajes no leídos de una conversación como leídos  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

#### **Path Parameters:**
```
{id} = ID de la conversación
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversacion_id": "conv_001",
    "mensajes_actualizados": 0,
    "nuevo_contador_no_leidos": 0
  }
}
```

---

### **60. Cerrar/Archivar Conversación**

**Endpoint:** `PATCH /conversaciones/:id/cerrar`  
**Descripción:** Cambia el estado de la conversación a cerrada (archivada)  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

#### **Path Parameters:**
```
{id} = ID de la conversación
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversacion_id": "conv_001",
    "estado": "cerrada",
    "fecha_cierre": "2025-10-09T15:00:00Z",
    "mensaje": "Conversación archivada correctamente"
  }
}
```

---

### **61. Verificar Conversación Existente**

**Endpoint:** `GET /conversaciones/existe`  
**Descripción:** Verifica si ya existe una conversación con el mismo contexto  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Query Parameters:**
```
?docente_id=usr_doc_001       # ID del docente seleccionado (requerido)
&estudiante_id=est_001        # ID del estudiante (requerido)
&curso_id=cur_001             # ID del curso (requerido)
```

#### **Response Success (200):**
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

---

### **62. Crear Nueva Conversación y Enviar Primer Mensaje**

**Endpoint:** `POST /conversaciones`  
**Descripción:** Crea nueva conversación y envía primer mensaje con archivos opcionales  
**Autenticación:** Bearer token (Rol: Apoderado)

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
      "tiene_adjuntos": false
    },
    "archivos_adjuntos": [],
    "notificacion": {
      "enviada": true,
      "canales": ["plataforma", "whatsapp"],
      "destinatario_id": "usr_doc_001"
    }
  },
  "message": "Conversación creada y mensaje enviado correctamente"
}
```

---

### **63. Obtener Conversación Completa**

**Endpoint:** `GET /conversaciones/:id`  
**Descripción:** Obtiene detalles completos de una conversación específica  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

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

---

### **64. Obtener Mensajes de una Conversación**

**Endpoint:** `GET /mensajes`  
**Descripción:** Lista mensajes de una conversación con paginación  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

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
      }
    ],
    "paginacion": {
      "limit": 50,
      "offset": 0,
      "total_mensajes": 1,
      "tiene_mas": false
    },
    "separadores_fecha": {
      "2025-10-08": "8 de octubre de 2025"
    }
  }
}
```

---

### **65. Enviar Mensaje en Conversación Existente**

**Endpoint:** `POST /mensajes`  
**Descripción:** Envía un nuevo mensaje en una conversación existente  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

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

---

### **66. Marcar Mensajes como Leídos (Batch)**

**Endpoint:** `PATCH /mensajes/marcar-leidos`  
**Descripción:** Marca múltiples mensajes como leídos  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

#### **Request Body:**
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

---

### **67. Verificar Nuevos Mensajes en Conversación (Polling)**

**Endpoint:** `GET /mensajes/nuevos`  
**Descripción:** Verifica si hay mensajes nuevos desde el último mensaje conocido  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

#### **Query Parameters:**
```
?conversacion_id=conv_001              # ID de la conversación (requerido)
&ultimo_mensaje_id=msg_089             # ID del último mensaje conocido (requerido)
```

#### **Response Success (200):**
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

---

### **68. Descargar Archivo Adjunto**

**Endpoint:** `GET /archivos/:id/download`  
**Descripción:** Descarga directa de archivo adjunto  
**Autenticación:** Bearer token (Roles: Apoderado, Docente)

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

---

## **SECCIÓN 9: COMUNICADOS**

### **69. Obtener Lista de Comunicados**

**Endpoint:** `GET /comunicados`  
**Descripción:** Lista de comunicados del usuario con paginación y filtros  
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=12                     # Registros por página (default: 12)
&tipo=todos                   # Tipo: todos, academico, administrativo, evento, urgente, informativo (default: todos)
&estado_lectura=todos         # Estado de lectura: todos, leidos, no_leidos (default: todos)
&fecha_inicio=2025-01-01      # Fecha inicio (YYYY-MM-DD) (opcional)
&fecha_fin=2025-12-31         # Fecha fin (YYYY-MM-DD) (opcional)
&autor_id=usr_doc_001         # Filtrar por autor (opcional)
&nivel=Primaria               # Filtrar por nivel (opcional)
&grado=3                      # Filtrar por grado (opcional)
&hijo_id=est_001             # Filtrar por hijo (opcional)
&busqueda=tarea                # Búsqueda por texto (opcional)
&solo_mis_comunicados=false    # Solo comunicados propios (docente) (default: false)
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
    "comunicados": [
      {
        "id": "com_001",
        "titulo": "Reunión de padres de familia",
        "tipo": "evento",
        "contenido_preview": "Se convoca a reunión...",
        "fecha_publicacion": "2025-10-01T10:00:00Z",
        "fecha_publicacion_legible": "1 de octubre de 2025",
        "fecha_publicacion_relativa": "Hace 9 días",
        "destinatarios_texto": "Padres de Primaria - 3°",
        "estado_lectura": {
          "leido": true,
          "fecha_lectura": "2025-10-01T11:00:00Z"
        },
        "es_nuevo": false,
        "es_autor": false,
        "autor": {
          "id": "usr_dir_001",
          "nombre": "Carlos Méndez",
          "apellido": "Torres",
          "rol": "director"
        }
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 12,
      "total_comunicados": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "contadores": {
      "total": 1,
      "no_leidos": 0,
      "leidos": 1
    }
  }
}
```

---

### **70. Obtener Contador de Comunicados No Leídos**

**Endpoint:** `GET /comunicados/no-leidos/count`  
**Descripción:** Devuelve el número total de comunicados no leídos  
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_no_leidos": 0,
    "por_tipo": {},
    "ultimos_3": []
  }
}
```

---

### **71. Buscar Comunicados**

**Endpoint:** `GET /comunicados/search`  
**Descripción:** Busca comunicados por término  
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?query=reunión               # Término de búsqueda (min 2 caracteres) (requerido)
&limit=20                   # Registros por página (default: 20)
&offset=0                   # Desplazamiento (default: 0)
&estado=todos                # Estado: todos, leidos, no_leidos (default: todos)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "query": "reunión",
    "resultados": [
      {
        "id": "com_001",
        "titulo": "Reunión de padres de familia",
        "tipo": "evento",
        "contenido_preview": "Se convoca a reunión...",
        "fecha_publicacion": "2025-10-01T10:00:00Z",
        "destacado": "<mark>Reunión</mark> de padres de familia",
        "match_en": "titulo"
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

---

### **72. Verificar Actualizaciones de Comunicados (Polling)**

**Endpoint:** `GET /comunicados/actualizaciones`  
**Descripción:** Verifica si hay nuevos comunicados desde el último check  
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?ultimo_check=2025-10-09T10:00:00Z  # Timestamp del último polling (ISO 8601) (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": false,
    "nuevos_comunicados": [],
    "total_nuevos_comunicados": 0,
    "contador_no_leidos": 0
  }
}
```

---

### **73. Obtener Comunicado Completo**

**Endpoint:** `GET /comunicados/:id`  
**Descripción:** Obtiene comunicado completo  
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "com_001",
      "titulo": "Reunión de padres de familia",
      "tipo": "evento",
      "contenido_html": "<p>Se convoca a reunión...</p>",
      "fecha_publicacion": "2025-10-01T10:00:00Z",
      "fecha_publicacion_legible": "1 de octubre de 2025",
      "publico_objetivo": ["padres"],
      "niveles_objetivo": ["Primaria"],
      "grados_objetivo": ["3"],
      "cursos_objetivo": [],
      "autor": {
        "id": "usr_dir_001",
        "nombre": "Carlos",
        "apellido": "Méndez",
        "rol": "director"
      },
      "destinatarios": {
        "publico_objetivo": ["padres"],
        "niveles": ["Primaria"],
        "grados": ["3"],
        "cursos": [],
        "texto_legible": "Padres de Primaria - 3°"
      }
    },
    "estado_lectura": {
      "leido": true,
      "fecha_lectura": "2025-10-01T11:00:00Z"
    },
    "permisos": {
      "puede_editar": false,
      "puede_eliminar": false,
      "puede_ver_estadisticas": false,
      "es_autor": false
    },
    "estadisticas_basicas": null
  }
}
```

---

### **74. Marcar Comunicado como Leído**

**Endpoint:** `POST /comunicados-lecturas`  
**Descripción:** Marca comunicado como leído  
**Autenticación:** Bearer token (Todos los roles)

#### **Request Body:**
```json
{
  "comunicado_id": "com_001"
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "lectura": {
      "id": "lect_001",
      "comunicado_id": "com_001",
      "usuario_id": "usr_pad_001",
      "fecha_lectura": "2025-10-01T11:00:00Z"
    },
    "nuevo_contador_no_leidos": 0
  }
}
```

---

### **75. Validar Acceso a Comunicado**

**Endpoint:** `GET /comunicados/:id/acceso`  
**Descripción:** Verifica si el usuario tiene acceso a un comunicado  
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "tiene_acceso": true,
    "motivo": "Comunicado dirigido al grado de su hijo",
    "puede_ver": true,
    "puede_editar": false,
    "puede_eliminar": false
  }
}
```

---

### **76. Verificar Permisos de Creación de Comunicados**

**Endpoint:** `GET /permisos-docentes/:docente_id`  
**Descripción:** Verifica si un docente tiene permisos para crear comunicados  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Path Parameters:**
```
{docente_id} = ID del docente
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": "usr_doc_001",
      "nombre_completo": "Ana María Rodríguez Vega"
    },
    "permisos": {
      "puede_crear_comunicados": true,
      "estado_activo": true,
      "es_director": false
    },
    "restricciones": {
      "tipos_permitidos": ["academico", "evento"],
      "puede_segmentar_nivel": false,
      "solo_sus_grados": true,
      "niveles_permitidos": ["Primaria"],
      "grados_permitidos": ["3"]
    }
  }
}
```

---

### **77. Obtener Cursos del Docente**

**Endpoint:** `GET /cursos/docente/:docente_id`  
**Descripción:** Lista cursos asignados a un docente  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Path Parameters:**
```
{docente_id} = ID del docente
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
    "docente": {
      "id": "usr_doc_001",
      "nombre_completo": "Ana María Rodríguez Vega"
    },
    "año_academico": 2025,
    "asignaciones": {
      "Primaria": [
        {
          "id": "cur_001",
          "nombre": "Matemáticas",
          "codigo_curso": "CP3001",
          "grado": "3"
        }
      ]
    },
    "grados_unicos": ["3"],
    "niveles_unicos": ["Primaria"],
    "total_cursos": 1
  }
}
```

---

### **78. Obtener Niveles y Grados**

**Endpoint:** `GET /nivel-grado`  
**Descripción:** Lista todos los niveles y grados (solo director)  
**Autenticación:** Bearer token (Rol: Director)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "jerarquia": {
      "Primaria": [
        {
          "id": "ng_006",
          "grado": "3",
          "descripcion": "3ro de Primaria"
        }
      ]
    }
  }
}
```

---

### **79. Calcular Destinatarios Estimados**

**Endpoint:** `POST /usuarios/destinatarios/preview`  
**Descripción:** Calcula número de destinatarios para segmentación  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Request Body:**
```json
{
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["3"],
  "cursos": [],
  "todos": false
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "segmentacion": {
      "publico_objetivo": ["padres"],
      "niveles": ["Primaria"],
      "grados": ["3"],
      "cursos": [],
      "todos": false
    },
    "destinatarios": {
      "total_estimado": 25,
      "desglose": {
        "padres": 25,
        "docentes": 0
      }
    },
    "texto_legible": "Padres de Primaria - 3°"
  }
}
```

---

### **80. Crear Comunicado**

**Endpoint:** `POST /comunicados`  
**Descripción:** Crea nuevo comunicado (Publicado o Borrador)  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Request Body:**
```json
{
  "titulo": "Reunión de padres de familia",
  "tipo": "evento",
  "contenido_html": "<p>Se convoca a reunión...</p>",
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["3"],
  "cursos": [],
  "fecha_programada": null
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "com_002",
      "titulo": "Reunión de padres de familia",
      "tipo": "evento",
      "contenido_html": "<p>Se convoca a reunión...</p>",
      "publico_objetivo": ["padres"],
      "niveles_objetivo": ["Primaria"],
      "grados_objetivo": ["3"],
      "cursos_objetivo": [],
      "estado": "publicado",
      "fecha_publicacion": "2025-10-10T10:00:00Z",
      "autor_id": "usr_dir_001"
    },
    "mensaje": "Comunicado publicado correctamente"
  }
}
```

---

### **81. Guardar Borrador de Comunicado**

**Endpoint:** `POST /comunicados/borrador`  
**Descripción:** Guarda comunicado como borrador  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Request Body:**
```json
{
  "titulo": "Borrador de comunicado",
  "tipo": "informativo",
  "contenido_html": "<p>Contenido del borrador...</p>",
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["3"],
  "cursos": []
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "com_003",
      "titulo": "Borrador de comunicado",
      "tipo": "informativo",
      "contenido_html": "<p>Contenido del borrador...</p>",
      "publico_objetivo": ["padres"],
      "niveles_objetivo": ["Primaria"],
      "grados_objetivo": ["3"],
      "cursos_objetivo": [],
      "estado": "borrador",
      "autor_id": "usr_dir_001"
    },
    "message": "Borrador guardado correctamente"
  }
}
```

---

### **82. Editar Comunicado**

**Endpoint:** `PUT /comunicados/:id`  
**Descripción:** Edita comunicado existente  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Request Body:**
```json
{
  "titulo": "Reunión de padres de familia (Actualizada)",
  "tipo": "evento",
  "contenido_html": "<p>Se convoca a reunión (actualizada)...</p>",
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["3"],
  "cursos": []
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "com_001",
      "titulo": "Reunión de padres de familia (Actualizada)",
      "tipo": "evento",
      "contenido_html": "<p>Se convoca a reunión (actualizada)...</p>",
      "publico_objetivo": ["padres"],
      "niveles_objetivo": ["Primaria"],
      "grados_objetivo": ["3"],
      "cursos_objetivo": [],
      "estado": "publicado",
      "fecha_actualizacion": "2025-10-10T11:00:00Z"
    },
    "message": "Comunicado actualizado correctamente"
  }
}
```

---

### **83. Obtener Mis Borradores**

**Endpoint:** `GET /comunicados/mis-borradores`  
**Descripción:** Lista borradores del usuario autenticado  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Query Parameters:**
```
?page=1      # Número de página (default: 1)
&limit=10     # Registros por página (default: 10)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "borradores": [
      {
        "id": "com_003",
        "titulo": "Borrador de comunicado",
        "tipo": "informativo",
        "contenido_preview": "Contenido del borrador...",
        "fecha_creacion": "2025-10-10T10:00:00Z",
        "fecha_actualizacion": "2025-10-10T10:00:00Z"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 10,
      "total_borradores": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### **84. Publicar Borrador**

**Endpoint:** `POST /comunicados/:id/publicar`  
**Descripción:** Publica un borrador existente  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Request Body:**
```json
{
  "fecha_programada": null
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "com_003",
      "titulo": "Borrador de comunicado",
      "tipo": "informativo",
      "estado": "publicado",
      "fecha_publicacion": "2025-10-10T11:00:00Z"
    },
    "message": "Comunicado publicado correctamente"
  }
}
```

---

### **85. Obtener Comunicados Programados**

**Endpoint:** `GET /comunicados/programados`  
**Descripción:** Lista comunicados programados del usuario  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Query Parameters:**
```
?page=1      # Número de página (default: 1)
&limit=10     # Registros por página (default: 10)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "programados": [
      {
        "id": "com_004",
        "titulo": "Comunicado programado",
        "tipo": "informativo",
        "fecha_programada": "2025-10-15T10:00:00Z",
        "fecha_creacion": "2025-10-10T10:00:00Z"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 10,
      "total_programados": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### **86. Cancelar Programación de Comunicado**

**Endpoint:** `DELETE /comunicados/:id/programacion`  
**Descripción:** Cancela programación de un comunicado  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado_id": "com_004",
    "estado": "borrador",
    "mensaje": "Programación cancelada correctamente"
  }
}
```

---

### **87. Validar HTML**

**Endpoint:** `POST /comunicados/validar-html`  
**Descripción:** Valida contenido HTML de comunicado  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Request Body:**
```json
{
  "contenido": "<p>Contenido HTML...</p>"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "valido": true,
    "errores": [],
    "advertencias": []
  }
}
```

---

### **88. Validar Segmentación**

**Endpoint:** `POST /comunicados/validar-segmentacion`  
**Descripción:** Valida segmentación de destinatarios  
**Autenticación:** Bearer token (Roles: Director, Docente)

#### **Request Body:**
```json
{
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["3"],
  "cursos": [],
  "todos": false
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "valido": true,
    "errores": [],
    "destinatarios_estimados": 25
  }
}
```

---

### **89. Desactivar Comunicado**

**Endpoint:** `PATCH /comunicados/:id/desactivar`  
**Descripción:** Desactiva un comunicado (solo director)  
**Autenticación:** Bearer token (Rol: Director)

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado_id": "com_001",
    "estado": "desactivado",
    "fecha_desactivacion": "2025-10-10T11:00:00Z",
    "message": "Comunicado desactivado correctamente"
  }
}
```

---

### **90. Eliminar Comunicado**

**Endpoint:** `DELETE /comunicados/:id`  
**Descripción:** Elimina comunicado permanentemente (solo director)  
**Autenticación:** Bearer token (Rol: Director)

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Request Body:**
```json
{
  "confirmacion": true,
  "motivo": "Comunicado obsoleto"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado_id": "com_001",
    "eliminado": true,
    "fecha_eliminacion": "2025-10-10T11:00:00Z",
    "message": "Comunicado eliminado permanentemente"
  }
}
```

---

## **SECCIÓN 10: ENCUESTAS**

### **91. Obtener Lista de Encuestas**

**Endpoint:** `GET /encuestas`  
**Descripción:** Lista de encuestas del usuario con paginación y filtros  
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=12                     # Registros por página (default: 12)
&estado=todos                  # Estado: todos, activa, cerrada (default: todos)
&tipo=todos                   # Tipo: todos, satisfaccion, academica (default: todos)
&busqueda=satisfaccion          # Búsqueda por texto (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuestas": [
      {
        "id": "enc_001",
        "titulo": "Encuesta de satisfacción",
        "descripcion": "Evalúe su experiencia con el servicio",
        "tipo": "satisfaccion",
        "estado": "activa",
        "fecha_creacion": "2025-10-01T10:00:00Z",
        "fecha_cierre": "2025-10-31T23:59:59Z",
        "total_respuestas": 5,
        "ya_respondida": false
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 12,
      "total_encuestas": 1,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### **92. Obtener Contador de Encuestas Pendientes**

**Endpoint:** `GET /encuestas/pendientes/count`  
**Descripción:** Devuelve el número total de encuestas pendientes de responder  
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_pendientes": 1,
    "por_tipo": {
      "satisfaccion": 1
    }
  }
}
```

---

### **93. Buscar Encuestas**

**Endpoint:** `GET /encuestas/search`  
**Descripción:** Busca encuestas por término  
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?query=satisfaccion           # Término de búsqueda (min 2 caracteres) (requerido)
&limit=20                   # Registros por página (default: 20)
&offset=0                   # Desplazamiento (default: 0)
&estado=todos                # Estado: todos, activa, cerrada (default: todos)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "query": "satisfaccion",
    "resultados": [
      {
        "id": "enc_001",
        "titulo": "Encuesta de satisfacción",
        "descripcion": "Evalúe su experiencia con el servicio",
        "tipo": "satisfaccion",
        "estado": "activa",
        "fecha_creacion": "2025-10-01T10:00:00Z",
        "destacado": "Encuesta de <mark>satisfacción</mark>",
        "match_en": "titulo"
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

---

### **94. Verificar Actualizaciones de Encuestas (Polling)**

**Endpoint:** `GET /encuestas/actualizaciones`  
**Descripción:** Verifica si hay nuevas encuestas desde el último check  
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?ultimo_check=2025-10-09T10:00:00Z  # Timestamp del último polling (ISO 8601) (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": false,
    "nuevas_encuestas": [],
    "total_nuevas_encuestas": 0,
    "contador_pendientes": 1
  }
}
```

---

### **95. Validar Acceso a Encuesta**

**Endpoint:** `GET /encuestas/:id/validar-acceso`  
**Descripción:** Verifica si el usuario tiene acceso a una encuesta  
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "tiene_acceso": true,
    "estado": "activa",
    "ya_respondida": false,
    "fecha_limite_respuesta": "2025-10-31T23:59:59Z"
  }
}
```

---

### **96. Obtener Formulario de Encuesta**

**Endpoint:** `GET /encuestas/:id/formulario`  
**Descripción:** Obtiene formulario completo de encuesta para responder  
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "enc_001",
      "titulo": "Encuesta de satisfacción",
      "descripcion": "Evalúe su experiencia con el servicio",
      "tipo": "satisfaccion",
      "estado": "activa",
      "fecha_creacion": "2025-10-01T10:00:00Z",
      "fecha_cierre": "2025-10-31T23:59:59Z"
    },
    "secciones": [
      {
        "id": "sec_001",
        "titulo": "Evaluación general",
        "descripcion": "Califique su experiencia general",
        "preguntas": [
          {
            "id": "preg_001",
            "tipo": "escala",
            "texto": "¿Cómo califica el servicio recibido?",
            "requerida": true,
            "opciones": [
              {
                "id": "opt_001",
                "texto": "Muy bueno",
                "valor": 5
              },
              {
                "id": "opt_002",
                "texto": "Bueno",
                "valor": 4
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### **97. Enviar Respuestas de Encuesta**

**Endpoint:** `POST /respuestas-encuestas`  
**Descripción:** Envía respuestas de una encuesta  
**Autenticación:** Bearer token (Todos los roles)

#### **Request Body:**
```json
{
  "encuesta_id": "enc_001",
  "respuestas": [
    {
      "pregunta_id": "preg_001",
      "opcion_id": "opt_001",
      "valor": 5,
      "texto_abierto": null
    }
  ]
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "respuesta": {
      "id": "resp_001",
      "encuesta_id": "enc_001",
      "usuario_id": "usr_pad_001",
      "fecha_respuesta": "2025-10-10T10:00:00Z",
      "ip": "192.168.1.1"
    },
    "message": "Respuestas enviadas correctamente"
  }
}
```

---

### **98. Obtener Respuestas Propias de Encuesta**

**Endpoint:** `GET /encuestas/:id/mis-respuestas`  
**Descripción:** Obtiene respuestas previas del usuario a una encuesta  
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "enc_001",
      "titulo": "Encuesta de satisfacción",
      "fecha_respuesta": "2025-10-05T10:00:00Z"
    },
    "respuestas": [
      {
        "pregunta_id": "preg_001",
        "pregunta_texto": "¿Cómo califica el servicio recibido?",
        "respuesta": {
          "opcion_id": "opt_001",
          "opcion_texto": "Muy bueno",
          "valor": 5,
          "texto_abierto": null
        }
      }
    ]
  }
}
```

---

## **SECCIÓN 11: CALENDARIO**

### **99. Obtener Días No Lectivos**

**Endpoint:** `GET /calendario/dias-no-lectivos`  
**Descripción:** Lista días no lectivos del año académico  
**Autenticación:** Bearer token (Rol: Apoderado)

#### **Query Parameters:**
```
?año=2025  # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "año": 2025,
    "dias_no_lectivos": [
      {
        "fecha": "2025-01-01",
        "descripcion": "Año Nuevo",
        "tipo": "feriado"
      },
      {
        "fecha": "2025-07-29",
        "descripcion": "Día de la Independencia",
        "tipo": "feriado"
      }
    ],
    "total_dias": 2
  }
}
```

---

## **CÓDIGOS DE ERROR ESPECÍFICOS**

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `INVALID_CREDENTIALS` | Credenciales inválidas | 401 |
| `USER_INACTIVE` | Usuario inactivo | 403 |
| `INVALID_TOKEN` | Token inválido o expirado | 401 |
| `FORBIDDEN` | Acceso denegado | 403 |
| `INVALID_INPUT` | Datos de entrada inválidos | 400 |
| `MISSING_REQUIRED_FIELDS` | Campos requeridos faltantes | 400 |
| `INVALID_PARAMETERS` | Parámetros inválidos | 400 |
| `ACCESS_DENIED` | Sin permisos para acceder al recurso | 403 |
| `NOT_FOUND` | Recurso no encontrado | 404 |
| `CONFLICT` | Conflicto de datos | 409 |
| `INTERNAL_ERROR` | Error interno del servidor | 500 |
| `VALIDATION_ERROR` | Error de validación | 400 |
| `FILE_TOO_LARGE` | Archivo demasiado grande | 413 |
| `FILE_TYPE_NOT_ALLOWED` | Tipo de archivo no permitido | 400 |
| `REPORT_NOT_FOUND` | Reporte no encontrado | 404 |
| `STRUCTURE_NOT_CONFIGURED` | Estructura no configurada | 404 |
| `COMPONENT_NOT_FOUND` | Componente no encontrado | 404 |
| `INVALID_TEMPLATE_STRUCTURE` | Estructura de plantilla incorrecta | 400 |
| `COMPONENT_MISMATCH` | Componente en archivo no coincide | 400 |
| `INVALID_DATE_FORMAT` | Formato de fecha inválido | 400 |
| `DATE_MISMATCH` | Fecha en archivo no coincide | 400 |
| `FUTURE_DATE_NOT_ALLOWED` | No se permiten fechas futuras | 400 |
| `DATE_OUT_OF_ACADEMIC_YEAR` | Fecha fuera del año académico | 400 |
| `DUPLICATE_RECORD_EXISTS` | Registro duplicado existe | 409 |
| `NO_ATTENDANCE_RECORD` | Sin registro de asistencia | 404 |
| `INVALID_TIME_FORMAT` | Formato de hora inválido | 400 |
| `TIME_OUT_OF_RANGE` | Hora fuera de horario escolar | 400 |
| `CONVERSATION_NOT_FOUND` | Conversación no existe | 404 |
| `CONVERSATION_CLOSED` | Conversación cerrada | 403 |
| `MESSAGE_NOT_FOUND` | Mensaje no existe | 404 |
| `FILE_NOT_FOUND` | Archivo no encontrado | 404 |
| `UPLOAD_FAILED` | Error al subir archivo | 500 |
| `ACTION_NOT_ALLOWED` | Acción no permitida para el rol | 403 |
| `WHATSAPP_API_ERROR` | Error al enviar mensaje de WhatsApp | 500 |
| `STUDENT_NOT_LINKED` | Estudiante no vinculado al padre | 403 |
| `TEACHER_NOT_ASSIGNED` | Docente no asignado al curso | 403 |
| `COMUNICADO_NOT_FOUND` | Comunicado no existe | 404 |
| `USER_NOT_FOUND` | Usuario no encontrado | 404 |
| `BAD_REQUEST` | Solicitud incorrecta | 400 |
| `EXPORT_FAILED` | Error al exportar | 500 |
| `INVALID_STATE` | Estado inválido | 400 |
| `TICKET_NOT_FOUND` | Ticket no encontrado | 404 |
| `INVALID_ADMIN` | Administrador no válido | 400 |
| `TICKET_NOT_RESOLVED` | Ticket no está resuelto | 400 |
| `FAQ_NOT_FOUND` | FAQ no encontrada | 404 |
| `GUIA_NOT_FOUND` | Guía no encontrada | 404 |
| `INVALID_RATING` | Calificación inválida | 400 |

---

## **SECCIÓN 12: SOPORTE TÉCNICO**

### **101. Crear Ticket de Soporte**

**Endpoint:** `POST /soporte/tickets`
**Descripción:** Crea un nuevo ticket de soporte técnico
**Autenticación:** Bearer token (Todos los roles)

#### **Request Body:**
```json
{
  "titulo": "No puedo acceder a mis calificaciones",
  "descripcion": "Cuando intento ver las calificaciones de mi hijo, el sistema muestra un error 500. Esto ha estado sucediendo desde ayer.",
  "categoria": "acceso_plataforma",
  "prioridad": "alta"
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket_001",
      "numero_ticket": "#SOP-2025-0001",
      "titulo": "No puedo acceder a mis calificaciones",
      "descripcion": "Cuando intento ver las calificaciones de mi hijo, el sistema muestra un error 500. Esto ha estado sucediendo desde ayer.",
      "categoria": "acceso_plataforma",
      "prioridad": "alta",
      "estado": "pendiente",
      "fecha_creacion": "2025-10-28T15:30:00Z",
      "usuario": {
        "id": "usr_pad_001",
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

#### **Response Errors:**
- **400 Bad Request - Datos inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El título debe tener entre 10 y 200 caracteres, La descripción debe tener entre 20 y 1000 caracteres"
  }
}
```

---

### **102. Obtener Historial de Tickets del Usuario**

**Endpoint:** `GET /soporte/tickets/usuario`
**Descripción:** Lista todos los tickets creados por el usuario autenticado
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?estado=pendiente          # Estado: pendiente, en_progreso, esperando_respuesta, resuelto, cerrado, cancelado (opcional)
&categoria=acceso_plataforma  # Categoría (opcional)
&pagina=1                 # Número de página (default: 1)
&limite=20                # Registros por página (default: 20)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket_001",
        "numero_ticket": "#SOP-2025-0001",
        "titulo": "No puedo acceder a mis calificaciones",
        "categoria": "acceso_plataforma",
        "prioridad": "alta",
        "estado": "en_progreso",
        "fecha_creacion": "2025-10-28T15:30:00Z",
        "usuario": {
          "id": "usr_pad_001",
          "nombre": "Juan",
          "apellido": "Pérez"
        }
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 1,
      "total_resultados": 1,
      "limite": 20
    }
  }
}
```

---

### **103. Obtener Detalle de Ticket**

**Endpoint:** `GET /soporte/tickets/:id`
**Descripción:** Obtiene detalles completos de un ticket específico del usuario
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket_001",
      "numero_ticket": "#SOP-2025-0001",
      "titulo": "No puedo acceder a mis calificaciones",
      "descripcion": "Cuando intento ver las calificaciones de mi hijo, el sistema muestra un error 500. Esto ha estado sucediendo desde ayer.",
      "categoria": "acceso_plataforma",
      "prioridad": "alta",
      "estado": "en_progreso",
      "fecha_creacion": "2025-10-28T15:30:00Z",
      "usuario": {
        "id": "usr_pad_001",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "apoderado",
        "telefono": "+51987654321"
      },
      "asignado": {
        "id": "usr_admin_001",
        "nombre": "Carlos",
        "apellido": "Méndez"
      },
      "respuestas": [
        {
          "id": "resp_001",
          "contenido": "Estamos revisando el problema. Le informaremos pronto.",
          "fecha_respuesta": "2025-10-28T16:00:00Z",
          "es_respuesta_publica": true,
          "usuario": {
            "id": "usr_admin_001",
            "nombre": "Carlos",
            "apellido": "Méndez",
            "rol": "administrador"
          }
        }
      ],
      "archivos_adjuntos": []
    }
  }
}
```

---

### **104. Responder a Ticket (Usuario)**

**Endpoint:** `POST /soporte/tickets/:id/respuestas`
**Descripción:** Agrega una respuesta a un ticket existente
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Request Body:**
```json
{
  "contenido": "Ya intenté limpiar el caché del navegador pero el problema persiste. El error aparece específicamente cuando intento ver las calificaciones del trimestre actual."
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "respuesta": {
      "id": "resp_002",
      "ticket_id": "ticket_001",
      "contenido": "Ya intenté limpiar el caché del navegador pero el problema persiste. El error aparece específicamente cuando intento ver las calificaciones del trimestre actual.",
      "fecha_respuesta": "2025-10-28T17:00:00Z",
      "es_respuesta_publica": true,
      "usuario": {
        "id": "usr_pad_001",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "apoderado"
      }
    }
  },
  "message": "Respuesta agregada exitosamente"
}
```

---

### **105. Calificar Satisfacción del Ticket**

**Endpoint:** `POST /soporte/tickets/:id/calificar`
**Descripción:** Califica la atención recibida en un ticket resuelto
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Request Body:**
```json
{
  "satisfaccion": 5
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "message": "Calificación registrada exitosamente"
}
```

---

### **106. Obtener Categorías Disponibles**

**Endpoint:** `GET /soporte/categorias`
**Descripción:** Lista todas las categorías disponibles para crear tickets
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "valor": "acceso_plataforma",
        "nombre": "Acceso a la Plataforma",
        "icono": "login",
        "color": "#4CAF50"
      },
      {
        "valor": "funcionalidad_academica",
        "nombre": "Funcionalidad Académica",
        "icono": "school",
        "color": "#2196F3"
      },
      {
        "valor": "comunicaciones",
        "nombre": "Comunicaciones",
        "icono": "chat",
        "color": "#FF9800"
      },
      {
        "valor": "reportes",
        "nombre": "Reportes y Estadísticas",
        "icono": "assessment",
        "color": "#9C27B0"
      },
      {
        "valor": "sugerencias",
        "nombre": "Sugerencias",
        "icono": "lightbulb",
        "color": "#607D8B"
      },
      {
        "valor": "errores_sistema",
        "nombre": "Errores del Sistema",
        "icono": "bug_report",
        "color": "#F44336"
      },
      {
        "valor": "otros",
        "nombre": "Otros",
        "icono": "more_horiz",
        "color": "#795548"
      }
    ]
  }
}
```

---

### **107. Obtener Bandeja de Tickets (Administrador)**

**Endpoint:** `GET /soporte/admin/tickets`
**Descripción:** Lista todos los tickets para gestión administrativa
**Autenticación:** Bearer token (Rol: Administrador)

#### **Query Parameters:**
```
?estado=en_progreso         # Estado: pendiente, en_progreso, esperando_respuesta, resuelto, cerrado, cancelado (opcional)
&categoria=acceso_plataforma # Categoría (opcional)
&prioridad=alta            # Prioridad: baja, normal, alta, critica (opcional)
&asignado_a=usr_admin_001  # ID del administrador asignado (opcional)
&pagina=1                  # Número de página (default: 1)
&limite=20                 # Registros por página (default: 20)
&busqueda=calificaciones    # Búsqueda por título, descripción o número de ticket (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "ticket_001",
        "numero_ticket": "#SOP-2025-0001",
        "titulo": "No puedo acceder a mis calificaciones",
        "categoria": "acceso_plataforma",
        "prioridad": "alta",
        "estado": "en_progreso",
        "fecha_creacion": "2025-10-28T15:30:00Z",
        "usuario": {
          "id": "usr_pad_001",
          "nombre": "Juan",
          "apellido": "Pérez",
          "rol": "apoderado",
          "telefono": "+51987654321"
        },
        "asignado": {
          "id": "usr_admin_001",
          "nombre": "Carlos",
          "apellido": "Méndez"
        },
        "_count": {
          "respuestas": 2
        }
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 1,
      "total_resultados": 1,
      "limite": 20
    }
  }
}
```

---

### **108. Obtener Ticket para Gestión (Administrador)**

**Endpoint:** `GET /soporte/admin/tickets/:id`
**Descripción:** Obtiene detalles completos de un ticket para gestión administrativa
**Autenticación:** Bearer token (Rol: Administrador)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket_001",
      "numero_ticket": "#SOP-2025-0001",
      "titulo": "No puedo acceder a mis calificaciones",
      "descripcion": "Cuando intento ver las calificaciones de mi hijo, el sistema muestra un error 500. Esto ha estado sucediendo desde ayer.",
      "categoria": "acceso_plataforma",
      "prioridad": "alta",
      "estado": "en_progreso",
      "fecha_creacion": "2025-10-28T15:30:00Z",
      "usuario": {
        "id": "usr_pad_001",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "apoderado",
        "telefono": "+51987654321"
      },
      "asignado": {
        "id": "usr_admin_001",
        "nombre": "Carlos",
        "apellido": "Méndez"
      },
      "respuestas": [
        {
          "id": "resp_001",
          "contenido": "Estamos revisando el problema. Le informaremos pronto.",
          "fecha_respuesta": "2025-10-28T16:00:00Z",
          "es_respuesta_publica": true,
          "estado_cambio": null,
          "usuario": {
            "id": "usr_admin_001",
            "nombre": "Carlos",
            "apellido": "Méndez",
            "rol": "administrador"
          }
        }
      ],
      "archivos_adjuntos": [],
      "tiempo_respuesta_horas": 2
    }
  }
}
```

---

### **109. Responder a Ticket (Administrador)**

**Endpoint:** `POST /soporte/admin/tickets/:id/respuestas`
**Descripción:** Agrega una respuesta administrativa a un ticket
**Autenticación:** Bearer token (Rol: Administrador)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Request Body:**
```json
{
  "contenido": "Hemos identificado el problema y estamos trabajando en una solución. El error está relacionado con la carga de datos del trimestre actual. Estimamos tenerlo solucionado en las próximas 2 horas.",
  "estado_cambio": "esperando_respuesta",
  "es_respuesta_publica": true
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "respuesta": {
      "id": "resp_003",
      "ticket_id": "ticket_001",
      "contenido": "Hemos identificado el problema y estamos trabajando en una solución. El error está relacionado con la carga de datos del trimestre actual. Estimamos tenerlo solucionado en las próximas 2 horas.",
      "fecha_respuesta": "2025-10-28T18:00:00Z",
      "es_respuesta_publica": true,
      "estado_cambio": "esperando_respuesta",
      "usuario": {
        "id": "usr_admin_001",
        "nombre": "Carlos",
        "apellido": "Méndez",
        "rol": "administrador"
      }
    }
  },
  "message": "Respuesta agregada exitosamente"
}
```

---

### **110. Cambiar Estado de Ticket**

**Endpoint:** `PATCH /soporte/admin/tickets/:id/estado`
**Descripción:** Cambia el estado de un ticket
**Autenticación:** Bearer token (Rol: Administrador)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Request Body:**
```json
{
  "estado": "resuelto",
  "motivo": "Se ha solucionado el error de carga de calificaciones. El usuario ya puede acceder normalmente."
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "message": "Estado actualizado exitosamente"
}
```

---

### **111. Resolver Ticket**

**Endpoint:** `POST /soporte/admin/tickets/:id/resolver`
**Descripción:** Marca un ticket como resuelto con una solución
**Autenticación:** Bearer token (Rol: Administrador)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Request Body:**
```json
{
  "solucion": "Se ha corregido el error en el módulo de calificaciones. El problema estaba en la consulta SQL que recuperaba los datos del trimestre actual. Ya se ha aplicado el parche y el usuario puede acceder a sus calificaciones sin problemas.",
  "solicitar_calificacion": true
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "message": "Ticket resuelto exitosamente"
}
```

---

### **112. Asignar Ticket a Administrador**

**Endpoint:** `POST /soporte/admin/tickets/:id/asignar`
**Descripción:** Asigna un ticket a un administrador específico
**Autenticación:** Bearer token (Rol: Administrador)

#### **Path Parameters:**
```
{id} = ID del ticket
```

#### **Request Body:**
```json
{
  "administrador_id": "usr_admin_002"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "message": "Ticket asignado exitosamente"
}
```

---

### **113. Obtener Estadísticas de Soporte**

**Endpoint:** `GET /soporte/admin/estadisticas`
**Descripción:** Obtiene estadísticas de tickets de soporte
**Autenticación:** Bearer token (Rol: Administrador)

#### **Query Parameters:**
```
?periodo=mes    # Período: semana, mes, trimestre, año (default: mes)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "periodo": "mes",
    "fecha_inicio": "2025-10-01T00:00:00Z",
    "fecha_fin": "2025-10-28T23:59:59Z",
    "totales": {
      "tickets_creados": 25,
      "tickets_resueltos": 20,
      "tasa_resolucion": 80,
      "tiempo_promedio_respuesta": 4.5,
      "satisfaccion_promedio": 4.2
    },
    "por_estado": [
      {
        "estado": "pendiente",
        "_count": { "estado": 3 }
      },
      {
        "estado": "en_progreso",
        "_count": { "estado": 2 }
      },
      {
        "estado": "resuelto",
        "_count": { "estado": 20 }
      }
    ],
    "por_categoria": [
      {
        "categoria": "acceso_plataforma",
        "_count": { "categoria": 10 }
      },
      {
        "categoria": "funcionalidad_academica",
        "_count": { "categoria": 8 }
      }
    ],
    "por_prioridad": [
      {
        "prioridad": "alta",
        "_count": { "prioridad": 5 }
      },
      {
        "prioridad": "normal",
        "_count": { "prioridad": 15 }
      }
    ]
  }
}
```

---

### **114. Obtener FAQs**

**Endpoint:** `GET /soporte/ayuda/faqs`
**Descripción:** Lista preguntas frecuentes del centro de ayuda
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?categoria_id=cat_001    # ID de categoría (opcional)
&busqueda=acceso         # Búsqueda en preguntas y respuestas (opcional)
&pagina=1               # Número de página (default: 1)
&limite=20              # Registros por página (default: 20)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": "faq_001",
        "pregunta": "¿Cómo puedo ver las calificaciones de mi hijo?",
        "respuesta": "Para ver las calificaciones de su hijo, siga estos pasos: 1. Inicie sesión en la plataforma. 2. Seleccione el estudiante. 3. Haga clic en la sección 'Calificaciones'. 4. Seleccione el trimestre que desea consultar.",
        "categoria": {
          "id": "cat_001",
          "nombre": "Funcionalidad Académica",
          "icono": "school",
          "color": "#2196F3"
        },
        "orden": 1,
        "activa": true,
        "vistas": 150
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 1,
      "total_resultados": 1,
      "limite": 20
    }
  }
}
```

---

### **115. Obtener Detalle de FAQ**

**Endpoint:** `GET /soporte/ayuda/faqs/:id`
**Descripción:** Obtiene detalles de una pregunta frecuente específica
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID de la FAQ
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "faq": {
      "id": "faq_001",
      "pregunta": "¿Cómo puedo ver las calificaciones de mi hijo?",
      "respuesta": "Para ver las calificaciones de su hijo, siga estos pasos: 1. Inicie sesión en la plataforma. 2. Seleccione el estudiante. 3. Haga clic en la sección 'Calificaciones'. 4. Seleccione el trimestre que desea consultar.",
      "categoria": {
        "id": "cat_001",
        "nombre": "Funcionalidad Académica",
        "icono": "school",
        "color": "#2196F3"
      },
      "orden": 1,
      "activa": true,
      "vistas": 151
    }
  }
}
```

---

### **116. Obtener Categorías de FAQs**

**Endpoint:** `GET /soporte/ayuda/faqs-categorias`
**Descripción:** Lista todas las categorías de preguntas frecuentes
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": "cat_001",
        "nombre": "Funcionalidad Académica",
        "descripcion": "Preguntas sobre calificaciones, asistencia y reportes",
        "icono": "school",
        "color": "#2196F3",
        "activa": true,
        "_count": {
          "preguntas": 15
        }
      },
      {
        "id": "cat_002",
        "nombre": "Acceso a la Plataforma",
        "descripcion": "Preguntas sobre inicio de sesión y recuperación de contraseña",
        "icono": "login",
        "color": "#4CAF50",
        "activa": true,
        "_count": {
          "preguntas": 8
        }
      }
    ]
  }
}
```

---

### **117. Obtener Guías de Ayuda**

**Endpoint:** `GET /soporte/ayuda/guias`
**Descripción:** Lista guías de ayuda disponibles
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?categoria_id=cat_003    # ID de categoría (opcional)
&busqueda=calificaciones   # Búsqueda en títulos y descripciones (opcional)
&pagina=1                # Número de página (default: 1)
&limite=20               # Registros por página (default: 20)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "guias": [
      {
        "id": "guia_001",
        "titulo": "Guía completa para consultar calificaciones",
        "descripcion": "Aprenda a utilizar todas las funcionalidades del módulo de calificaciones, incluyendo filtros, exportación y comparación entre trimestres.",
        "categoria": {
          "id": "cat_003",
          "nombre": "Guías Prácticas",
          "icono": "menu_book",
          "color": "#9C27B0"
        },
        "archivo_url": "/uploads/guias/guia_calificaciones.pdf",
        "activa": true,
        "descargas": 85
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "total_paginas": 1,
      "total_resultados": 1,
      "limite": 20
    }
  }
}
```

---

### **118. Obtener Detalle de Guía**

**Endpoint:** `GET /soporte/ayuda/guias/:id`
**Descripción:** Obtiene detalles de una guía específica
**Autenticación:** Bearer token (Todos los roles)

#### **Path Parameters:**
```
{id} = ID de la guía
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "guia": {
      "id": "guia_001",
      "titulo": "Guía completa para consultar calificaciones",
      "descripcion": "Aprenda a utilizar todas las funcionalidades del módulo de calificaciones, incluyendo filtros, exportación y comparación entre trimestres.",
      "categoria": {
        "id": "cat_003",
        "nombre": "Guías Prácticas",
        "icono": "menu_book",
        "color": "#9C27B0"
      },
      "archivo_url": "/uploads/guias/guia_calificaciones.pdf",
      "activa": true,
      "descargas": 86
    }
  }
}
```

---

### **119. Obtener Categorías de Guías**

**Endpoint:** `GET /soporte/ayuda/guias-categorias`
**Descripción:** Lista todas las categorías de guías
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": "cat_003",
        "nombre": "Guías Prácticas",
        "descripcion": "Manuales y tutoriales paso a paso",
        "icono": "menu_book",
        "color": "#9C27B0",
        "activa": true,
        "_count": {
          "guias": 12
        }
      },
      {
        "id": "cat_004",
        "nombre": "Videos Tutoriales",
        "descripcion": "Videos explicativos de las funcionalidades",
        "icono": "play_circle",
        "color": "#F44336",
        "activa": true,
        "_count": {
          "guias": 6
        }
      }
    ]
  }
}
```

---

### **120. Búsqueda General en Centro de Ayuda**

**Endpoint:** `GET /soporte/ayuda/buscar`
**Descripción:** Busca en todo el centro de ayuda (FAQs y guías)
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?termino=calificaciones    # Término de búsqueda (mínimo 3 caracteres) (requerido)
&pagina=1                 # Número de página (default: 1)
&limite=10                # Registros por página (default: 10)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "termino": "calificaciones",
    "resultados": [
      {
        "id": "faq_001",
        "pregunta": "¿Cómo puedo ver las calificaciones de mi hijo?",
        "respuesta": "Para ver las calificaciones de su hijo, siga estos pasos...",
        "categoria": {
          "id": "cat_001",
          "nombre": "Funcionalidad Académica",
          "icono": "school",
          "color": "#2196F3"
        },
        "tipo": "faq",
        "vistas": 150
      },
      {
        "id": "guia_001",
        "titulo": "Guía completa para consultar calificaciones",
        "descripcion": "Aprenda a utilizar todas las funcionalidades del módulo de calificaciones...",
        "categoria": {
          "id": "cat_003",
          "nombre": "Guías Prácticas",
          "icono": "menu_book",
          "color": "#9C27B0"
        },
        "tipo": "guia",
        "descargas": 85
      }
    ],
    "totales": {
      "faqs": 8,
      "guias": 3,
      "total": 11
    },
    "paginacion": {
      "pagina_actual": 1,
      "limite": 10
    }
  }
}
```

---

### **121. Obtener Contenido Destacado**

**Endpoint:** `GET /soporte/ayuda/destacado`
**Descripción:** Obtiene contenido más visitado y descargado
**Autenticación:** Bearer token (Todos los roles)

#### **Query Parameters:**
```
?limite=5    # Número de resultados (default: 5)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "faqs_destacadas": [
      {
        "id": "faq_001",
        "pregunta": "¿Cómo puedo ver las calificaciones de mi hijo?",
        "respuesta": "Para ver las calificaciones de su hijo, siga estos pasos...",
        "categoria": {
          "id": "cat_001",
          "nombre": "Funcionalidad Académica",
          "icono": "school",
          "color": "#2196F3"
        },
        "vistas": 150
      }
    ],
    "guias_destacadas": [
      {
        "id": "guia_001",
        "titulo": "Guía completa para consultar calificaciones",
        "descripcion": "Aprenda a utilizar todas las funcionalidades del módulo de calificaciones...",
        "categoria": {
          "id": "cat_003",
          "nombre": "Guías Prácticas",
          "icono": "menu_book",
          "color": "#9C27B0"
        },
        "descargas": 85
      }
    ]
  }
}
```

---

## **SECCIÓN 13: AÑO ACADÉMICO**

### **122. Obtener Año Académico Actual**

**Endpoint:** `GET /anio-academico/actual`
**Descripción:** Obtiene el año académico vigente actual del sistema
**Autenticación:** Bearer token (Todos los roles)

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "anio_academico": 2025,
    "estado": "vigente",
    "trimestres": [
      {
        "numero": 1,
        "nombre": "Primer Trimestre",
        "fecha_inicio": "2025-03-01",
        "fecha_fin": "2025-05-31",
        "estado": "finalizado"
      },
      {
        "numero": 2,
        "nombre": "Segundo Trimestre",
        "fecha_inicio": "2025-06-01",
        "fecha_fin": "2025-08-31",
        "estado": "finalizado"
      },
      {
        "numero": 3,
        "nombre": "Tercer Trimestre",
        "fecha_inicio": "2025-09-01",
        "fecha_fin": "2025-12-20",
        "estado": "vigente"
      }
    ],
    "trimestre_actual": {
      "numero": 3,
      "nombre": "Tercer Trimestre",
      "fecha_inicio": "2025-09-01",
      "fecha_fin": "2025-12-20",
      "estado": "vigente"
    },
    "fecha_actual": "2025-10-28"
  }
}
```

#### **Response Errors:**
- **404 Not Found - No hay año académico vigente:**
```json
{
  "success": false,
  "error": {
    "code": "NO_ACTIVE_ACADEMIC_YEAR",
    "message": "No se encontró un año académico vigente"
  }
}
```

#### **Reglas de Negocio:**
- El sistema determina automáticamente el año académico vigente basado en la fecha actual
- Cada año académico contiene 3 trimestres con fechas de inicio y fin definidas
- El trimestre actual se determina según la fecha del sistema
- Las fechas de los trimestres siguen el calendario escolar peruano:
  - T1: Marzo - Mayo
  - T2: Junio - Agosto
  - T3: Septiembre - Diciembre
- El endpoint está disponible para todos los roles autenticados

---

## **HEALTH CHECK**

### **100. Verificar Estado del API**

**Endpoint:** `GET /health`  
**Descripción:** Verifica que el API esté funcionando correctamente  
**Autenticación:** Pública (sin token)

#### **Response Success (200):**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2025-10-27T16:40:00.000Z",
  "uptime": 3600
}
```
