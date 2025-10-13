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

