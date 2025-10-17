# **Documentación API REST - Módulo de Comunicados**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semana 10 - 2025  
**Versión:** 1.0 - Comunicación Institucional  

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** `https://api.orquideas.edu.pe`

### **Autenticación JWT**
- Todos los endpoints requieren autenticación
- Incluir en cada request: `Authorization: Bearer <token>`
- Roles autorizados: **Padre/Apoderado**, **Docente** y **Director**

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

## **SECCIÓN 1: BANDEJA DE COMUNICADOS (HU-COM-00)**

### **1. Obtener Lista de Comunicados del Usuario**

**Endpoint:** `GET /comunicados`  
**Descripción:** Obtiene todos los comunicados visibles para el usuario autenticado con paginación, filtros y segmentación automática  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=12                    # Registros por página (default: 12, max: 50)
&tipo=todos                  # Tipo: todos, academico, administrativo, evento, urgente, informativo (default: todos)
&estado_lectura=todos        # Estado: todos, leidos, no_leidos (default: todos)
&fecha_inicio=2025-10-01     # Fecha inicio (YYYY-MM-DD) (opcional)
&fecha_fin=2025-10-31        # Fecha fin (YYYY-MM-DD) (opcional)
&autor_id=usr_doc_001        # Filtrar por autor específico (opcional, solo docente/director)
&nivel=Primaria              # Filtrar por nivel (opcional, solo director)
&grado=3                     # Filtrar por grado (opcional, solo director)
&hijo_id=est_001             # Filtrar por hijo específico (opcional, solo padre)
&busqueda=reunion            # Búsqueda por título o contenido (min 2 caracteres) (opcional)
&solo_mis_comunicados=true   # Solo comunicados creados por el usuario (opcional, solo docente/director)
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
        "titulo": "Reunión de Padres del Segundo Trimestre",
        "tipo": "academico",
        "contenido_preview": "Estimados padres de familia, les recordamos que el próximo viernes 20 de octubre tendremos la reunión...",
        "autor": {
          "id": "usr_dir_001",
          "nombre_completo": "Dr. Ricardo Mendoza García",
          "rol": "director"
        },
        "fecha_publicacion": "2025-10-15T10:00:00Z",
        "fecha_publicacion_legible": "15 de octubre de 2025, 10:00",
        "fecha_publicacion_relativa": "Hace 3 días",
        "editado": false,
        "fecha_edicion": null,
        "destinatarios_texto": "Todos los padres de Primaria",
        "estado_lectura": {
          "leido": false,
          "fecha_lectura": null
        },
        "es_nuevo": true,
        "es_autor": false
      },
      {
        "id": "com_002",
        "titulo": "Feria de Ciencias - Primaria",
        "tipo": "evento",
        "contenido_preview": "Nos complace invitarlos a la Feria de Ciencias que se realizará el día 25 de octubre...",
        "autor": {
          "id": "usr_doc_002",
          "nombre_completo": "Prof. María Elena Torres",
          "rol": "docente"
        },
        "fecha_publicacion": "2025-10-12T14:30:00Z",
        "fecha_publicacion_legible": "12 de octubre de 2025, 14:30",
        "fecha_publicacion_relativa": "Hace 6 días",
        "editado": true,
        "fecha_edicion": "2025-10-13T09:00:00Z",
        "destinatarios_texto": "Padres de 2do B, 3ro A",
        "estado_lectura": {
          "leido": true,
          "fecha_lectura": "2025-10-12T16:45:00Z"
        },
        "es_nuevo": false,
        "es_autor": false
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 12,
      "total_comunicados": 25,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    },
    "contadores": {
      "total": 25,
      "no_leidos": 8,
      "leidos": 17
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

#### **Response Errors:**
- **400 Bad Request - Parámetros inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "El parámetro 'tipo' debe ser: todos, academico, administrativo, evento, urgente o informativo"
  }
}
```

- **404 Not Found - Sin comunicados:**
```json
{
  "success": false,
  "error": {
    "code": "NO_COMUNICADOS_FOUND",
    "message": "No hay comunicados disponibles con los filtros aplicados"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Segmentación automática según rol del usuario:
  - **Padre:** Solo comunicados dirigidos a grados/niveles de sus hijos
  - **Docente:** Comunicados institucionales + propios
  - **Director:** Todos los comunicados
- **RN-02:** Ordenar por fecha de publicación descendente (más reciente primero)
- **RN-03:** Comunicados no leídos aparecen al inicio antes de ordenamiento
- **RN-04:** Solo comunicados con `estado = 'publicado'` y `fecha_publicacion <= NOW()`
- **RN-05:** Campo `es_nuevo` es `true` si comunicado tiene menos de 24 horas desde publicación
- **RN-06:** `contenido_preview` es máximo 120 caracteres del contenido sin HTML
- **RN-07:** Fecha relativa para últimos 7 días, después fecha completa

---

### **2. Obtener Contador de Comunicados No Leídos**

**Endpoint:** `GET /comunicados/no-leidos/count`  
**Descripción:** Devuelve el número total de comunicados no leídos del usuario  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_no_leidos": 8,
    "por_tipo": {
      "academico": 3,
      "administrativo": 1,
      "evento": 2,
      "urgente": 1,
      "informativo": 1
    },
    "ultimos_3": [
      {
        "id": "com_015",
        "titulo": "Reunión Urgente - Directorio",
        "tipo": "urgente",
        "fecha_publicacion": "2025-10-18T09:00:00Z"
      },
      {
        "id": "com_014",
        "titulo": "Cambio de horario - Matemáticas",
        "tipo": "academico",
        "fecha_publicacion": "2025-10-17T14:30:00Z"
      },
      {
        "id": "com_013",
        "titulo": "Información sobre pago de pensiones",
        "tipo": "administrativo",
        "fecha_publicacion": "2025-10-16T10:00:00Z"
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-08:** Solo contar comunicados activos y publicados
- **RN-09:** Solo contar comunicados visibles según segmentación del usuario
- **RN-10:** Excluir comunicados desactivados del contador

---

### **3. Buscar Comunicados**

**Endpoint:** `GET /comunicados/search`  
**Descripción:** Búsqueda de comunicados por título o contenido  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Query Parameters:**
```
?query=reunion               # Término de búsqueda (min 2 caracteres) (requerido)
&limit=20                    # Registros por página (default: 20)
&offset=0                    # Desplazamiento (default: 0)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "query": "reunion",
    "resultados": [
      {
        "id": "com_001",
        "titulo": "Reunión de Padres del Segundo Trimestre",
        "tipo": "academico",
        "contenido_preview": "...reunión de padres se realizará el próximo viernes...",
        "fecha_publicacion": "2025-10-15T10:00:00Z",
        "destacado": "Reunión de Padres del Segundo Trimestre",
        "match_en": "titulo"
      },
      {
        "id": "com_008",
        "titulo": "Coordinaciones Finales",
        "tipo": "administrativo",
        "contenido_preview": "...próxima reunión con el equipo directivo...",
        "fecha_publicacion": "2025-10-10T08:00:00Z",
        "destacado": "próxima reunión con el equipo directivo",
        "match_en": "contenido"
      }
    ],
    "total_resultados": 5,
    "paginacion": {
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-11:** Búsqueda case-insensitive
- **RN-12:** Buscar en campos: `titulo` y `contenido`
- **RN-13:** Aplicar segmentación automática según rol
- **RN-14:** Destacar término encontrado en resultados
- **RN-15:** Ordenar por relevancia (matches en título primero)

---

### **4. Verificar Actualizaciones de Comunicados (Polling)**

**Endpoint:** `GET /comunicados/actualizaciones`  
**Descripción:** Verifica si hay nuevos comunicados desde el último check (para polling)  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Query Parameters:**
```
?ultimo_check=2025-10-18T10:00:00Z  # Timestamp del último polling (ISO 8601) (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": true,
    "nuevos_comunicados": [
      {
        "id": "com_020",
        "titulo": "Suspensión de clases - Día del Maestro",
        "tipo": "informativo",
        "autor": {
          "nombre_completo": "Dr. Ricardo Mendoza García"
        },
        "fecha_publicacion": "2025-10-18T10:15:00Z",
        "contenido_preview": "Informamos que el día viernes 20 de octubre..."
      }
    ],
    "total_nuevos_comunicados": 1,
    "contador_no_leidos": 9
  }
}
```

#### **Response Success (200) - Sin actualizaciones:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": false,
    "nuevos_comunicados": [],
    "total_nuevos_comunicados": 0,
    "contador_no_leidos": 8
  }
}
```

### **Reglas de Negocio:**
- **RN-16:** Comparar `fecha_publicacion` con `ultimo_check`
- **RN-17:** Solo comunicados visibles según segmentación del usuario
- **RN-18:** Excluir comunicados que el usuario ya vio
- **RN-19:** Polling recomendado cada 60 segundos

---

### **5. Desactivar Comunicado**

**Endpoint:** `PATCH /comunicados/:id/desactivar`  
**Descripción:** Cambia el estado del comunicado a desactivado (oculto de vista pública)  
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
    "comunicado_id": "com_005",
    "estado": "desactivado",
    "fecha_desactivacion": "2025-10-18T11:00:00Z",
    "mensaje": "Comunicado desactivado correctamente. Ya no es visible para los destinatarios"
  }
}
```

#### **Response Errors:**
- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Solo el director puede desactivar comunicados"
  }
}
```

### **Reglas de Negocio:**
- **RN-20:** Solo director puede desactivar comunicados
- **RN-21:** Comunicados desactivados no aparecen en bandeja principal
- **RN-22:** Comunicados desactivados son visibles solo para director
- **RN-23:** Se pueden reactivar cambiando estado a `'publicado'`

---

### **6. Reactivar Comunicado**

**Endpoint:** `PATCH /comunicados/:id/reactivar`  
**Descripción:** Reactiva un comunicado previamente desactivado  
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
    "comunicado_id": "com_005",
    "estado": "publicado",
    "fecha_reactivacion": "2025-10-18T12:00:00Z",
    "mensaje": "Comunicado reactivado correctamente. Ahora es visible para los destinatarios"
  }
}
```

### **Reglas de Negocio:**
- **RN-24:** Solo director puede reactivar comunicados
- **RN-25:** Comunicado vuelve a ser visible en bandejas de usuarios
- **RN-26:** No se envían notificaciones al reactivar

---

### **7. Eliminar Comunicado**

**Endpoint:** `DELETE /comunicados/:id`  
**Descripción:** Elimina permanentemente un comunicado del sistema  
**Autenticación:** Bearer token (Rol: Director)  

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Request Body (JSON):**
```json
{
  "confirmacion": true,
  "motivo": "Información incorrecta publicada por error"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado_id": "com_012",
    "eliminado": true,
    "fecha_eliminacion": "2025-10-18T11:30:00Z",
    "mensaje": "Comunicado eliminado permanentemente"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Sin confirmación:**
```json
{
  "success": false,
  "error": {
    "code": "CONFIRMATION_REQUIRED",
    "message": "Debes confirmar la eliminación del comunicado"
  }
}
```

### **Reglas de Negocio:**
- **RN-27:** Solo director puede eliminar comunicados
- **RN-28:** Eliminación es permanente e irreversible
- **RN-29:** Se eliminan también registros relacionados en `comunicados_lecturas`
- **RN-30:** Requiere confirmación explícita en request body

---

## **SECCIÓN 2: LEER COMUNICADO COMPLETO (HU-COM-01)**

### **8. Obtener Comunicado Completo**

**Endpoint:** `GET /comunicados/:id`  
**Descripción:** Obtiene detalles completos de un comunicado específico con validación de acceso  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

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
      "titulo": "Reunión de Padres del Segundo Trimestre",
      "tipo": "academico",
      "contenido_html": "<p>Estimados padres de familia,</p><p>Les recordamos que el próximo <strong>viernes 20 de octubre</strong> a las <strong>3:00 PM</strong> tendremos la reunión de padres del segundo trimestre.</p><ul><li>Lugar: Auditorio principal</li><li>Duración: 2 horas</li></ul><p>Es importante su asistencia.</p>",
      "autor": {
        "id": "usr_dir_001",
        "nombre_completo": "Dr. Ricardo Mendoza García",
        "rol": "director",
        "avatar_url": null
      },
      "fecha_publicacion": "2025-10-15T10:00:00Z",
      "fecha_publicacion_legible": "15 de octubre de 2025, 10:00",
      "fecha_programada": null,
      "editado": false,
      "fecha_edicion": null,
      "estado": "publicado",
      "destinatarios": {
        "publico_objetivo": ["padres"],
        "niveles": ["Primaria"],
        "grados": ["1ro A", "2do B", "3ro A"],
        "cursos": [],
        "texto_legible": "Todos los padres de Primaria"
      },
      "año_academico": 2025
    },
    "estado_lectura": {
      "leido": false,
      "fecha_lectura": null
    },
    "permisos": {
      "puede_editar": false,
      "puede_eliminar": false,
      "puede_ver_estadisticas": false,
      "es_autor": false
    },
    "estadisticas_basicas": {
      "total_destinatarios": 120,
      "total_lecturas": 85,
      "porcentaje_lectura": 70.83
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
    "message": "No tienes permisos para ver este comunicado"
  }
}
```

- **404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "COMUNICADO_NOT_FOUND",
    "message": "El comunicado no existe o ha sido eliminado"
  }
}
```

### **Reglas de Negocio:**
- **RN-31:** Validar acceso según rol del usuario:
  - **Padre:** Verificar que comunicado está dirigido a grado/nivel de sus hijos
  - **Docente:** Verificar que es autor o comunicado es institucional
  - **Director:** Acceso total sin restricciones
- **RN-32:** Contenido HTML debe estar sanitizado antes de enviar
- **RN-33:** Campo `destinatarios.texto_legible` debe ser human-readable
- **RN-34:** Estadísticas básicas solo incluyen contadores generales

---

### **9. Marcar Comunicado como Leído**

**Endpoint:** `POST /comunicados-lecturas`  
**Descripción:** Registra que el usuario ha leído el comunicado  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Request Body (JSON):**
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
      "fecha_lectura": "2025-10-18T12:00:00Z"
    },
    "nuevo_contador_no_leidos": 7
  }
}
```

#### **Response Success (200) - Ya leído:**
```json
{
  "success": true,
  "data": {
    "mensaje": "El comunicado ya fue marcado como leído anteriormente",
    "fecha_lectura_previa": "2025-10-17T14:30:00Z",
    "nuevo_contador_no_leidos": 8
  }
}
```

### **Reglas de Negocio:**
- **RN-35:** Solo crear registro si no existe previamente
- **RN-36:** Usar `ON CONFLICT DO NOTHING` para evitar duplicados
- **RN-37:** Actualizar contador de no leídos del usuario
- **RN-38:** Validar que usuario tiene acceso al comunicado

---

### **10. Validar Acceso a Comunicado**

**Endpoint:** `GET /comunicados/:id/acceso`  
**Descripción:** Valida si el usuario tiene permisos para ver el comunicado (endpoint auxiliar)  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

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

#### **Response Success (200) - Sin acceso:**
```json
{
  "success": true,
  "data": {
    "tiene_acceso": false,
    "motivo": "El comunicado no está dirigido a su rol o nivel",
    "puede_ver": false,
    "puede_editar": false,
    "puede_eliminar": false
  }
}
```

### **Reglas de Negocio:**
- **RN-39:** Endpoint de validación previa antes de cargar contenido completo
- **RN-40:** Retornar permisos detallados según rol y relación con el comunicado
- **RN-41:** No retornar error 403, sino información de acceso en data

---

## **SECCIÓN 3: CREAR Y PUBLICAR COMUNICADO (HU-COM-02)**

### **11. Verificar Permisos de Creación**

**Endpoint:** `GET /permisos-docentes/:docente_id`  
**Descripción:** Verifica si el docente tiene permisos activos para crear comunicados  
**Autenticación:** Bearer token (Rol: Docente/Director)  

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
      "id": "usr_doc_002",
      "nombre_completo": "Prof. María Elena Torres"
    },
    "permisos": {
      "puede_crear_comunicados": true,
      "estado_activo": true,
      "fecha_otorgamiento": "2025-03-01T00:00:00Z",
      "otorgado_por": {
        "nombre_completo": "Dr. Ricardo Mendoza García"
      }
    },
    "restricciones": {
      "tipos_permitidos": ["academico", "evento"],
      "puede_segmentar_nivel": false,
      "solo_sus_grados": true
    }
  }
}
```

#### **Response Success (200) - Sin permisos:**
```json
{
  "success": true,
  "data": {
    "docente": {
      "id": "usr_doc_003",
      "nombre_completo": "Prof. Carlos Ramírez"
    },
    "permisos": {
      "puede_crear_comunicados": false,
      "estado_activo": false,
      "fecha_otorgamiento": null,
      "otorgado_por": null
    },
    "restricciones": null
  }
}
```

### **Reglas de Negocio:**
- **RN-42:** Director siempre tiene permisos sin necesidad de verificación
- **RN-43:** Docente debe tener `puede_crear_comunicados = true` y `estado_activo = true`
- **RN-44:** Retornar restricciones específicas del rol

---

### **12. Obtener Grados y Cursos Asignados al Docente**

**Endpoint:** `GET /cursos/docente/:docente_id`  
**Descripción:** Lista cursos y grados donde el docente tiene asignaciones activas  
**Autenticación:** Bearer token (Rol: Docente)  

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
      "id": "usr_doc_002",
      "nombre_completo": "Prof. María Elena Torres"
    },
    "año_academico": 2025,
    "asignaciones": [
      {
        "nivel": "Primaria",
        "grado": "5to A",
        "cursos": [
          {
            "id": "cur_015",
            "nombre": "Matemáticas",
            "codigo_curso": "CP5001"
          }
        ]
      }
    ],
    "grados_unicos": ["5to A"],
    "niveles_unicos": ["Primaria"],
    "total_cursos": 1
  }
}
```

### **Reglas de Negocio:**
- **RN-45:** Solo asignaciones con `estado_activo = true`
- **RN-46:** Solo del año académico especificado
- **RN-47:** Agrupar por nivel y grado para facilitar selección en frontend

---

### **13. Obtener Todos los Cursos de la Institución (Director)**

**Endpoint:** `GET /cursos/todos`  
**Descripción:** Lista completa de cursos organizados por nivel y grado  
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
    "jerarquia": [
      {
        "nivel": "Inicial",
        "grados": [
          {
            "grado": "3",
            "cursos": [
              {
                "id": "cur_001",
                "nombre": "Matemáticas Inicial",
                "codigo_curso": "CI3001"
              },
              {
                "id": "cur_002",
                "nombre": "Comunicación Inicial",
                "codigo_curso": "CI3002"
              }
            ]
          }
        ]
      },
      {
        "nivel": "Primaria",
        "grados": [
          {
            "grado": "1ro A",
            "cursos": [
              {
                "id": "cur_010",
                "nombre": "Matemáticas",
                "codigo_curso": "CP1001"
              },
              {
                "id": "cur_011",
                "nombre": "Comunicación",
                "codigo_curso": "CP1002"
              }
            ]
          }
        ]
      }
    ],
    "total_cursos": 150
  }
}
```

### **Reglas de Negocio:**
- **RN-48:** Solo cursos con `estado_activo = true`
- **RN-49:** Ordenar jerárquicamente: Nivel → Grado → Curso
- **RN-50:** Incluir información completa para Tree Select en frontend

---

### **14. Obtener Todos los Niveles y Grados (Director)**

**Endpoint:** `GET /nivel-grado`  
**Descripción:** Lista completa de niveles y grados de la institución  
**Autenticación:** Bearer token (Rol: Director)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "jerarquia": [
      {
        "nivel": "Inicial",
        "grados": [
          {
            "id": "ng_001",
            "grado": "3",
            "descripcion": "3 años"
          },
          {
            "id": "ng_002",
            "grado": "4",
            "descripcion": "4 años"
          },
          {
            "id": "ng_003",
            "grado": "5",
            "descripcion": "5 años"
          }
        ]
      },
      {
        "nivel": "Primaria",
        "grados": [
          {
            "id": "ng_004",
            "grado": "1",
            "descripcion": "1ro de Primaria"
          },
          {
            "id": "ng_005",
            "grado": "2",
            "descripcion": "2do de Primaria"
          },
          {
            "id": "ng_006",
            "grado": "3",
            "descripcion": "3ro de Primaria"
          },
          {
            "id": "ng_007",
            "grado": "4",
            "descripcion": "4to de Primaria"
          },
          {
            "id": "ng_008",
            "grado": "5",
            "descripcion": "5to de Primaria"
          },
          {
            "id": "ng_009",
            "grado": "6",
            "descripcion": "6to de Primaria"
          }
        ]
      },
      {
        "nivel": "Secundaria",
        "grados": [
          {
            "id": "ng_010",
            "grado": "1",
            "descripcion": "1ro de Secundaria"
          },
          {
            "id": "ng_011",
            "grado": "2",
            "descripcion": "2do de Secundaria"
          },
          {
            "id": "ng_012",
            "grado": "3",
            "descripcion": "3ro de Secundaria"
          },
          {
            "id": "ng_013",
            "grado": "4",
            "descripcion": "4to de Secundaria"
          },
          {
            "id": "ng_014",
            "grado": "5",
            "descripcion": "5to de Secundaria"
          }
        ]
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-51:** Solo niveles y grados con `estado_activo = true`
- **RN-52:** Ordenar por orden lógico: Inicial → Primaria → Secundaria
- **RN-53:** Incluir descripción legible para UI

---

### **15. Calcular Destinatarios Estimados (Preview)**

**Endpoint:** `POST /usuarios/destinatarios/preview`  
**Descripción:** Calcula número estimado de destinatarios según segmentación seleccionada  
**Autenticación:** Bearer token (Rol: Docente/Director)  

#### **Request Body (JSON):**
```json
{
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["1ro A", "2do B"],
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
      "grados": ["1ro A", "2do B"],
      "cursos": []
    },
    "destinatarios": {
      "total_estimado": 45,
      "desglose": {
        "padres": 45,
        "docentes": 0
      },
      "por_grado": {
        "1ro A": 22,
        "2do B": 23
      }
    },
    "texto_legible": "45 padres de los grados 1ro A y 2do B de Primaria"
  }
}
```

#### **Response Success (200) - Todos los destinatarios:**
```json
{
  "success": true,
  "data": {
    "segmentacion": {
      "publico_objetivo": ["todos"],
      "niveles": null,
      "grados": null,
      "cursos": null
    },
    "destinatarios": {
      "total_estimado": 450,
      "desglose": {
        "padres": 350,
        "docentes": 30,
        "directivos": 5,
        "administrativos": 15
      }
    },
    "texto_legible": "Todos los usuarios de la institución (450 personas)"
  }
}
```

### **Reglas de Negocio:**
- **RN-54:** Contar solo usuarios activos
- **RN-55:** Si `todos = true`, contar todos los usuarios de la institución
- **RN-56:** Desglosar por tipo de destinatario y grado
- **RN-57:** Generar texto legible para mostrar en UI

---

### **16. Crear Comunicado (Publicado o Borrador)**

**Endpoint:** `POST /comunicados`  
**Descripción:** Crea un nuevo comunicado y lo publica o guarda como borrador  
**Autenticación:** Bearer token (Rol: Docente con permisos / Director)  

#### **Request Body (JSON):**
```json
{
  "titulo": "Reunión de Padres del Segundo Trimestre",
  "tipo": "academico",
  "contenido_html": "<p>Estimados padres de familia,</p><p>Les recordamos que el próximo <strong>viernes 20 de octubre</strong> a las <strong>3:00 PM</strong> tendremos la reunión de padres.</p>",
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["1ro A", "2do B"],
  "cursos": [],
  "fecha_programada": null,
  "estado": "publicado"
}
```

#### **Request Body (JSON) - Guardar como borrador:**
```json
{
  "titulo": "Comunicado en Progreso",
  "tipo": "informativo",
  "contenido_html": "<p>Contenido parcial...</p>",
  "publico_objetivo": ["padres"],
  "niveles": ["Secundaria"],
  "grados": [],
  "cursos": [],
  "fecha_programada": null,
  "estado": "borrador"
}
```

#### **Request Body (JSON) - Publicación programada:**
```json
{
  "titulo": "Comunicado Programado",
  "tipo": "evento",
  "contenido_html": "<p>Este comunicado se publicará automáticamente...</p>",
  "publico_objetivo": ["padres", "docentes"],
  "niveles": [],
  "grados": [],
  "cursos": [],
  "fecha_programada": "2025-10-25T10:00:00Z",
  "estado": "programado"
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "com_025",
      "titulo": "Reunión de Padres del Segundo Trimestre",
      "tipo": "academico",
      "estado": "publicado",
      "fecha_publicacion": "2025-10-18T14:00:00Z",
      "fecha_programada": null,
      "autor_id": "usr_dir_001"
    },
    "notificaciones": {
      "total_enviadas": 45,
      "plataforma": 45,
      "whatsapp": 45,
      "errores_whatsapp": 0
    },
    "destinatarios": {
      "total": 45,
      "texto_legible": "45 padres de los grados 1ro A y 2do B de Primaria"
    },
    "mensaje": "Comunicado publicado exitosamente"
  }
}
```

#### **Response Success (201) - Borrador:**
```json
{
  "success": true,
  "data": {
    "comunicado": {
      "id": "com_026",
      "titulo": "Comunicado en Progreso",
      "tipo": "informativo",
      "estado": "borrador",
      "fecha_creacion": "2025-10-18T14:30:00Z",
      "autor_id": "usr_doc_002"
    },
    "mensaje": "Borrador guardado correctamente"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Validación fallida:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El título debe tener entre 10 y 200 caracteres",
    "field": "titulo"
  }
}
```

- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No tienes permisos para crear comunicados"
  }
}
```

- **403 Forbidden - Tipo no permitido:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_TYPE",
    "message": "No tienes permisos para crear comunicados de tipo 'urgente'"
  }
}
```

- **403 Forbidden - Segmentación no permitida:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_SEGMENTATION",
    "message": "No tienes permisos para enviar comunicados al grado '3ro C'"
  }
}
```

### **Reglas de Negocio:**
- **RN-58:** Validar permisos del usuario antes de crear
- **RN-59:** Docente solo puede crear tipos: "academico", "evento"
- **RN-60:** Director puede crear todos los tipos
- **RN-61:** Docente solo puede segmentar a sus grados asignados
- **RN-62:** Director puede segmentar a cualquier nivel/grado/curso
- **RN-63:** Si `estado = "publicado"`, generar notificaciones inmediatamente
- **RN-64:** Si `estado = "borrador"`, no generar notificaciones
- **RN-65:** Si `estado = "programado"`, validar que `fecha_programada > NOW() + 30 minutos`
- **RN-66:** Sanitizar contenido HTML antes de guardar
- **RN-67:** Validar que al menos un destinatario esté seleccionado

---

### **17. Guardar Borrador de Comunicado**

**Endpoint:** `POST /comunicados/borrador`  
**Descripción:** Guarda un comunicado en estado borrador (sin publicar)  
**Autenticación:** Bearer token (Rol: Docente con permisos / Director)  

#### **Request Body (JSON):**
```json
{
  "titulo": "Borrador de Comunicado",
  "tipo": "academico",
  "contenido_html": "<p>Contenido parcial en progreso...</p>",
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": [],
  "cursos": []
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "borrador": {
      "id": "com_027",
      "titulo": "Borrador de Comunicado",
      "tipo": "academico",
      "estado": "borrador",
      "fecha_creacion": "2025-10-18T15:00:00Z",
      "autor_id": "usr_doc_002"
    },
    "mensaje": "Borrador guardado correctamente"
  }
}
```

### **Reglas de Negocio:**
- **RN-68:** No generar notificaciones para borradores
- **RN-69:** Borradores no son visibles para destinatarios
- **RN-70:** Solo el autor puede ver y editar sus borradores
- **RN-71:** Validaciones mínimas: título y tipo requeridos

---

### **18. Editar Comunicado**

**Endpoint:** `PUT /comunicados/:id`  
**Descripción:** Edita un comunicado existente (solo autor o director)  
**Autenticación:** Bearer token (Rol: Docente autor / Director)  

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Request Body (JSON):**
```json
{
  "titulo": "Reunión de Padres - Actualizado",
  "contenido_html": "<p>Contenido actualizado con nueva información...</p>",
  "tipo": "academico",
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["1ro A", "2do B", "3ro A"],
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
      "titulo": "Reunión de Padres - Actualizado",
      "tipo": "academico",
      "estado": "publicado",
      "editado": true,
      "fecha_edicion": "2025-10-18T16:00:00Z",
      "fecha_publicacion": "2025-10-15T10:00:00Z"
    },
    "notificaciones_enviadas": false,
    "mensaje": "Comunicado actualizado correctamente"
  }
}
```

#### **Response Errors:**
- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No tienes permisos para editar este comunicado"
  }
}
```

- **404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "COMUNICADO_NOT_FOUND",
    "message": "El comunicado no existe o ha sido eliminado"
  }
}
```

### **Reglas de Negocio:**
- **RN-72:** Solo el autor o director puede editar
- **RN-73:** Marcar campo `editado = true` y actualizar `fecha_edicion`
- **RN-74:** No enviar notificaciones por edición
- **RN-75:** Sanitizar nuevo contenido HTML
- **RN-76:** Validar que segmentación cumple permisos del usuario

---

### **19. Obtener Borradores del Usuario**

**Endpoint:** `GET /comunicados/mis-borradores`  
**Descripción:** Lista todos los borradores del usuario autenticado  
**Autenticación:** Bearer token (Rol: Docente / Director)  

#### **Query Parameters:**
```
?limit=10   # Registros por página (default: 10)
&offset=0   # Desplazamiento (default: 0)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "borradores": [
      {
        "id": "com_026",
        "titulo": "Comunicado en Progreso",
        "tipo": "informativo",
        "contenido_preview": "Contenido parcial...",
        "fecha_creacion": "2025-10-18T14:30:00Z",
        "fecha_ultima_modificacion": "2025-10-18T15:00:00Z",
        "puede_editar": true,
        "puede_publicar": true
      },
      {
        "id": "com_024",
        "titulo": "Borrador Antiguo",
        "tipo": "academico",
        "contenido_preview": "Otro borrador guardado...",
        "fecha_creacion": "2025-10-10T10:00:00Z",
        "fecha_ultima_modificacion": "2025-10-10T10:00:00Z",
        "puede_editar": true,
        "puede_publicar": true
      }
    ],
    "total_borradores": 2,
    "paginacion": {
      "limit": 10,
      "offset": 0,
      "has_more": false
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-77:** Solo mostrar borradores del usuario autenticado
- **RN-78:** Ordenar por fecha de última modificación descendente
- **RN-79:** Director ve todos los borradores de la institución

---

### **20. Publicar Borrador**

**Endpoint:** `POST /comunicados/:id/publicar`  
**Descripción:** Convierte un borrador en comunicado publicado  
**Autenticación:** Bearer token (Rol: Docente autor / Director)  

#### **Path Parameters:**
```
{id} = ID del comunicado borrador
```

#### **Request Body (JSON):**
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
      "id": "com_026",
      "titulo": "Comunicado en Progreso",
      "tipo": "informativo",
      "estado": "publicado",
      "fecha_publicacion": "2025-10-18T16:30:00Z"
    },
    "notificaciones": {
      "total_enviadas": 120,
      "plataforma": 120,
      "whatsapp": 120,
      "errores_whatsapp": 0
    },
    "destinatarios": {
      "total": 120,
      "texto_legible": "Todos los padres de Secundaria"
    },
    "mensaje": "Borrador publicado exitosamente"
  }
}
```

### **Reglas de Negocio:**
- **RN-80:** Solo el autor o director puede publicar el borrador
- **RN-81:** Validar que cumple todos los requisitos de publicación
- **RN-82:** Generar notificaciones inmediatamente tras publicación
- **RN-83:** Si `fecha_programada` es especificada, cambiar estado a "programado"

---

## **SECCIÓN 4: NOTIFICACIONES MASIVAS**

### **21. Generar Notificaciones Masivas**

**Endpoint:** `POST /notificaciones/batch`  
**Descripción:** Crea notificaciones masivas en plataforma para un comunicado  
**Autenticación:** Bearer token (Rol: Sistema/Director)  

#### **Request Body (JSON):**
```json
{
  "comunicado_id": "com_001",
  "tipo": "comunicado",
  "destinatarios_ids": ["usr_pad_001", "usr_pad_002", "usr_pad_003"]
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "total_notificaciones_creadas": 45,
    "comunicado_id": "com_001",
    "tipo": "comunicado",
    "fecha_creacion": "2025-10-18T14:00:00Z",
    "errores": []
  }
}
```

### **Reglas de Negocio:**
- **RN-84:** Insertar notificaciones en lotes de 50 para optimizar
- **RN-85:** Crear notificación con `canal = "ambos"`
- **RN-86:** Estado inicial: `estado_plataforma = "pendiente"`
- **RN-87:** Registrar errores sin detener el proceso

---

### **22. Enviar WhatsApp Masivo**

**Endpoint:** `POST /notificaciones/whatsapp/batch`  
**Descripción:** Envía mensajes de WhatsApp masivos para un comunicado  
**Autenticación:** Bearer token (Rol: Sistema/Director)  

#### **Request Body (JSON):**
```json
{
  "comunicado_id": "com_001",
  "destinatarios": [
    {
      "usuario_id": "usr_pad_001",
      "telefono": "+51987654321",
      "nombre": "Juan Pérez"
    },
    {
      "usuario_id": "usr_pad_002",
      "telefono": "+51987654322",
      "nombre": "María López"
    }
  ],
  "mensaje_template": "📢 Nuevo comunicado: {tipo}\n{titulo}\n\n{contenido_preview}\n\n📱 Leer completo: {url}"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_enviados": 43,
    "total_errores": 2,
    "comunicado_id": "com_001",
    "fecha_envio": "2025-10-18T14:05:00Z",
    "detalles": {
      "exitosos": [
        {
          "usuario_id": "usr_pad_001",
          "telefono": "+51987654321",
          "mensaje_id": "whatsapp_msg_001",
          "estado": "enviado"
        }
      ],
      "errores": [
        {
          "usuario_id": "usr_pad_045",
          "telefono": "+51987654399",
          "error": "Número no registrado en WhatsApp"
        }
      ]
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-88:** Enviar en lotes de máximo 50 por minuto (throttling)
- **RN-89:** Actualizar `estado_whatsapp` en tabla `notificaciones`
- **RN-90:** Registrar errores para retry posterior
- **RN-91:** Formato del mensaje con variables dinámicas

---

## **SECCIÓN 5: ESTADÍSTICAS Y REPORTES**

### **23. Obtener Estadísticas de Lectura del Comunicado**

**Endpoint:** `GET /comunicados/:id/estadisticas`  
**Descripción:** Obtiene estadísticas detalladas de lectura de un comunicado específico  
**Autenticación:** Bearer token (Rol: Autor / Director)  

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
      "titulo": "Reunión de Padres del Segundo Trimestre",
      "tipo": "academico",
      "fecha_publicacion": "2025-10-15T10:00:00Z"
    },
    "estadisticas": {
      "total_destinatarios": 120,
      "total_lecturas": 95,
      "porcentaje_lectura": 79.17,
      "lecturas_en_24h": 75,
      "lecturas_despues_24h": 20,
      "no_leidos": 25,
      "promedio_tiempo_lectura_horas": 8.5
    },
    "por_tipo_destinatario": {
      "padres": {
        "total": 115,
        "leidos": 90,
        "porcentaje": 78.26
      },
      "docentes": {
        "total": 5,
        "leidos": 5,
        "porcentaje": 100
      }
    },
    "por_grado": [
      {
        "grado": "1ro A",
        "total": 22,
        "leidos": 18,
        "porcentaje": 81.82
      },
      {
        "grado": "2do B",
        "total": 23,
        "leidos": 19,
        "porcentaje": 82.61
      }
    ],
    "lecturas_por_dia": [
      {
        "fecha": "2025-10-15",
        "lecturas": 45
      },
      {
        "fecha": "2025-10-16",
        "lecturas": 30
      },
      {
        "fecha": "2025-10-17",
        "lecturas": 15
      },
      {
        "fecha": "2025-10-18",
        "lecturas": 5
      }
    ],
    "ultimas_lecturas": [
      {
        "usuario": {
          "nombre_completo": "Juan Pérez",
          "rol": "padre"
        },
        "fecha_lectura": "2025-10-18T09:30:00Z",
        "tiempo_desde_publicacion_horas": 71.5
      }
    ]
  }
}
```

#### **Response Errors:**
- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No tienes permisos para ver las estadísticas de este comunicado"
  }
}
```

### **Reglas de Negocio:**
- **RN-92:** Solo el autor o director puede ver estadísticas
- **RN-93:** Calcular promedios y porcentajes en tiempo real
- **RN-94:** Agrupar lecturas por día para gráficos
- **RN-95:** Mostrar desglose por tipo de destinatario y grado

---

### **24. Exportar Reporte de Lecturas**

**Endpoint:** `GET /comunicados/:id/estadisticas/export`  
**Descripción:** Exporta reporte de lecturas en formato CSV  
**Autenticación:** Bearer token (Rol: Autor / Director)  

#### **Path Parameters:**
```
{id} = ID del comunicado
```

#### **Query Parameters:**
```
?formato=csv  # Formato: csv o pdf (default: csv)
```

#### **Response Success (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="comunicado_com_001_lecturas.csv"

Usuario,Rol,Grado Hijo,Fecha Lectura,Tiempo desde Publicación (horas)
Juan Pérez,Padre,1ro A,15/10/2025 11:00,1.0
María López,Padre,2do B,15/10/2025 14:30,4.5
...
```

### **Reglas de Negocio:**
- **RN-96:** Solo el autor o director puede exportar
- **RN-97:** Formato CSV incluye todos los detalles de lectura
- **RN-98:** Formato PDF incluye gráficos y estadísticas visuales
- **RN-99:** Nombre de archivo incluye ID del comunicado y fecha de exportación

---

## **SECCIÓN 6: GESTIÓN DE COMUNICADOS (ADMINISTRACIÓN)**

### **25. Listar Todos los Comunicados (Director)**

**Endpoint:** `GET /comunicados/admin/todos`  
**Descripción:** Lista completa de comunicados con filtros administrativos  
**Autenticación:** Bearer token (Rol: Director)  

#### **Query Parameters:**
```
?page=1                  # Número de página (default: 1)
&limit=20                # Registros por página (default: 20)
&estado=todos            # Estado: todos, publicado, borrador, programado, desactivado (default: todos)
&autor_id=usr_doc_001    # Filtrar por autor (opcional)
&tipo=todos              # Tipo de comunicado (opcional)
&fecha_desde=2025-10-01  # Fecha desde (opcional)
&fecha_hasta=2025-10-31  # Fecha hasta (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicados": [
      {
        "id": "com_001",
        "titulo": "Reunión de Padres del Segundo Trimestre",
        "tipo": "academico",
        "estado": "publicado",
        "autor": {
          "id": "usr_dir_001",
          "nombre_completo": "Dr. Ricardo Mendoza García",
          "rol": "director"
        },
        "fecha_publicacion": "2025-10-15T10:00:00Z",
        "fecha_creacion": "2025-10-15T09:30:00Z",
        "editado": false,
        "destinatarios_count": 120,
        "lecturas_count": 95,
        "porcentaje_lectura": 79.17
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    },
    "resumen": {
      "total_publicados": 120,
      "total_borradores": 15,
      "total_programados": 5,
      "total_desactivados": 10
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-100:** Solo director puede acceder a este endpoint
- **RN-101:** Mostrar comunicados de todos los estados
- **RN-102:** Incluir estadísticas básicas de lectura
- **RN-103:** Ordenar por fecha de publicación descendente

---

### **26. Obtener Historial de Ediciones**

**Endpoint:** `GET /comunicados/:id/historial`  
**Descripción:** Obtiene el historial de ediciones de un comunicado  
**Autenticación:** Bearer token (Rol: Autor / Director)  

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
    "titulo_actual": "Reunión de Padres - Actualizado",
    "total_ediciones": 2,
    "historial": [
      {
        "version": 1,
        "titulo": "Reunión de Padres del Segundo Trimestre",
        "fecha_edicion": "2025-10-15T10:00:00Z",
        "editado_por": {
          "nombre_completo": "Dr. Ricardo Mendoza García"
        },
        "cambios": "Publicación inicial"
      },
      {
        "version": 2,
        "titulo": "Reunión de Padres - Actualizado",
        "fecha_edicion": "2025-10-16T14:30:00Z",
        "editado_por": {
          "nombre_completo": "Dr. Ricardo Mendoza García"
        },
        "cambios": "Actualización de fecha y horario"
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-104:** Solo autor o director puede ver historial
- **RN-105:** Registrar cada edición con timestamp y usuario
- **RN-106:** Ordenar historial por fecha descendente (más reciente primero)
- **RN-107:** Incluir descripción de cambios realizados

---

### **27. Obtener Comunicados Programados**

**Endpoint:** `GET /comunicados/programados`  
**Descripción:** Lista comunicados con publicación programada pendiente  
**Autenticación:** Bearer token (Rol: Director)  

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicados_programados": [
      {
        "id": "com_030",
        "titulo": "Comunicado Programado - Fiestas Patrias",
        "tipo": "evento",
        "autor": {
          "nombre_completo": "Dr. Ricardo Mendoza García"
        },
        "fecha_programada": "2025-10-25T10:00:00Z",
        "tiempo_restante_texto": "En 7 días",
        "tiempo_restante_horas": 168,
        "destinatarios_estimados": 350,
        "puede_cancelar": true,
        "puede_editar": true
      },
      {
        "id": "com_031",
        "titulo": "Recordatorio - Reunión de Apoderados",
        "tipo": "academico",
        "autor": {
          "nombre_completo": "Prof. María Elena Torres"
        },
        "fecha_programada": "2025-10-20T08:00:00Z",
        "tiempo_restante_texto": "En 2 días",
        "tiempo_restante_horas": 42,
        "destinatarios_estimados": 45,
        "puede_cancelar": true,
        "puede_editar": true
      }
    ],
    "total_programados": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-108:** Solo director puede ver todos los comunicados programados
- **RN-109:** Docente solo ve sus propios comunicados programados
- **RN-110:** Ordenar por fecha programada ascendente (próximos primero)
- **RN-111:** Mostrar tiempo restante en formato legible

---

### **28. Cancelar Publicación Programada**

**Endpoint:** `DELETE /comunicados/:id/programacion`  
**Descripción:** Cancela la publicación programada de un comunicado  
**Autenticación:** Bearer token (Rol: Autor / Director)  

#### **Path Parameters:**
```
{id} = ID del comunicado programado
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "comunicado_id": "com_030",
    "estado_anterior": "programado",
    "estado_nuevo": "borrador",
    "fecha_programada_cancelada": "2025-10-25T10:00:00Z",
    "mensaje": "Publicación programada cancelada. El comunicado volvió a estado borrador"
  }
}
```

#### **Response Errors:**
- **403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No tienes permisos para cancelar la programación de este comunicado"
  }
}
```

### **Reglas de Negocio:**
- **RN-112:** Solo autor o director puede cancelar programación
- **RN-113:** Comunicado vuelve a estado "borrador"
- **RN-114:** No se envían notificaciones al cancelar
- **RN-115:** Se mantiene todo el contenido del comunicado

---

## **SECCIÓN 7: VALIDACIONES Y UTILIDADES**

### **29. Validar Contenido HTML**

**Endpoint:** `POST /comunicados/validar-html`  
**Descripción:** Valida y sanitiza contenido HTML antes de guardar  
**Autenticación:** Bearer token (Rol: Docente / Director)  

#### **Request Body (JSON):**
```json
{
  "contenido_html": "<p>Contenido de prueba con <script>alert('XSS')</script> y <strong>formato</strong></p>"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "contenido_original": "<p>Contenido de prueba con <script>alert('XSS')</script> y <strong>formato</strong></p>",
    "contenido_sanitizado": "<p>Contenido de prueba con  y <strong>formato</strong></p>",
    "es_valido": true,
    "elementos_eliminados": [
      {
        "tipo": "script",
        "motivo": "Elemento no permitido por seguridad"
      }
    ],
    "longitud_caracteres": 48,
    "palabras_count": 7
  }
}
```

### **Reglas de Negocio:**
- **RN-116:** Eliminar etiquetas peligrosas: `<script>`, `<iframe>`, `<object>`
- **RN-117:** Permitir solo etiquetas seguras: `<p>`, `<strong>`, `<em>`, `<u>`, `<h1-h3>`, `<ul>`, `<ol>`, `<li>`, `<a>`, `<br>`, `<span>`
- **RN-118:** Eliminar atributos peligrosos: `onclick`, `onerror`, `onload`
- **RN-119:** Validar URLs en enlaces (solo http/https)
- **RN-120:** Retornar contenido sanitizado listo para guardar

---

### **30. Validar Segmentación de Audiencia**

**Endpoint:** `POST /comunicados/validar-segmentacion`  
**Descripción:** Valida que la segmentación seleccionada es válida según permisos del usuario  
**Autenticación:** Bearer token (Rol: Docente / Director)  

#### **Request Body (JSON):**
```json
{
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["5to A"],
  "cursos": ["Matemáticas"]
}
```

#### **Response Success (200) - Válido:**
```json
{
  "success": true,
  "data": {
    "es_valida": true,
    "segmentacion": {
      "publico_objetivo": ["padres"],
      "niveles": ["Primaria"],
      "grados": ["5to A"],
      "cursos": ["Matemáticas"]
    },
    "permisos": {
      "puede_segmentar_nivel": true,
      "puede_segmentar_grado": true,
      "puede_segmentar_curso": true
    },
    "destinatarios_estimados": 22,
    "mensaje": "Segmentación válida según tus permisos"
  }
}
```

#### **Response Success (200) - Inválido:**
```json
{
  "success": true,
  "data": {
    "es_valida": false,
    "errores": [
      {
        "campo": "grados",
        "valor": "3ro C",
        "motivo": "No tienes asignaciones en este grado"
      }
    ],
    "permisos": {
      "puede_segmentar_nivel": false,
      "puede_segmentar_grado": true,
      "puede_segmentar_curso": true
    },
    "mensaje": "La segmentación contiene elementos no permitidos"
  }
}
```

### **Reglas de Negocio:**
- **RN-121:** Validar según rol del usuario (docente/director)
- **RN-122:** Docente solo puede segmentar sus grados/cursos asignados
- **RN-123:** Director puede segmentar cualquier nivel/grado/curso
- **RN-124:** Retornar errores específicos por campo

---

## **SECCIÓN 8: GESTIÓN DE ERRORES Y LOGS**

### **31. Códigos de Error Estandarizados**

| Código | Descripción | Status HTTP |
|--------|-------------|-------------|
| `INVALID_PARAMETERS` | Parámetros de query inválidos | 400 |
| `VALIDATION_ERROR` | Error de validación de datos | 400 |
| `CONFIRMATION_REQUIRED` | Falta confirmación explícita | 400 |
| `UNAUTHORIZED` | Usuario no autenticado | 401 |
| `ACCESS_DENIED` | Sin permisos para acceder al recurso | 403 |
| `FORBIDDEN_TYPE` | Tipo de comunicado no permitido | 403 |
| `FORBIDDEN_SEGMENTATION` | Segmentación no permitida | 403 |
| `COMUNICADO_NOT_FOUND` | Comunicado no existe | 404 |
| `NO_COMUNICADOS_FOUND` | No hay comunicados con filtros | 404 |
| `INTERNAL_SERVER_ERROR` | Error interno del servidor | 500 |
| `DATABASE_ERROR` | Error en base de datos | 500 |
| `WHATSAPP_API_ERROR` | Error en API de WhatsApp | 502 |

---

### **32. Estructura de Logs**

**Logs de Creación de Comunicados:**
```json
{
  "timestamp": "2025-10-18T14:00:00Z",
  "evento": "COMUNICADO_CREADO",
  "usuario_id": "usr_dir_001",
  "comunicado_id": "com_025",
  "tipo": "academico",
  "estado": "publicado",
  "destinatarios_count": 45,
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

**Logs de Notificaciones:**
```json
{
  "timestamp": "2025-10-18T14:05:00Z",
  "evento": "NOTIFICACIONES_ENVIADAS",
  "comunicado_id": "com_025",
  "total_plataforma": 45,
  "total_whatsapp": 43,
  "errores_whatsapp": 2,
  "tiempo_procesamiento_ms": 3500
}
```

**Logs de Errores:**
```json
{
  "timestamp": "2025-10-18T14:10:00Z",
  "evento": "ERROR",
  "tipo_error": "WHATSAPP_API_ERROR",
  "comunicado_id": "com_025",
  "usuario_id": "usr_pad_045",
  "mensaje_error": "Número no registrado en WhatsApp",
  "stack_trace": "..."
}
```

---

## **SECCIÓN 9: EJEMPLOS DE INTEGRACIÓN**

### **33. Flujo Completo: Crear y Publicar Comunicado**

**Paso 1: Verificar permisos**
```http
GET /permisos-docentes/usr_doc_002
Authorization: Bearer <token>
```

**Paso 2: Obtener grados asignados**
```http
GET /cursos/docente/usr_doc_002?año=2025
Authorization: Bearer <token>
```

**Paso 3: Calcular destinatarios estimados**
```http
POST /usuarios/destinatarios/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["5to A"],
  "cursos": []
}
```

**Paso 4: Validar contenido HTML**
```http
POST /comunicados/validar-html
Authorization: Bearer <token>
Content-Type: application/json

{
  "contenido_html": "<p>Contenido del comunicado...</p>"
}
```

**Paso 5: Crear y publicar comunicado**
```http
POST /comunicados
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Reunión de Padres",
  "tipo": "academico",
  "contenido_html": "<p>Contenido sanitizado...</p>",
  "publico_objetivo": ["padres"],
  "niveles": ["Primaria"],
  "grados": ["5to A"],
  "cursos": [],
  "estado": "publicado"
}
```

---

### **34. Flujo Completo: Leer Comunicado y Marcar como Leído**

**Paso 1: Obtener lista de comunicados**
```http
GET /comunicados?page=1&limit=12&tipo=todos
Authorization: Bearer <token>
```

**Paso 2: Validar acceso al comunicado**
```http
GET /comunicados/com_001/acceso
Authorization: Bearer <token>
```

**Paso 3: Obtener comunicado completo**
```http
GET /comunicados/com_001
Authorization: Bearer <token>
```

**Paso 4: Marcar como leído (automático)**
```http
POST /comunicados-lecturas
Authorization: Bearer <token>
Content-Type: application/json

{
  "comunicado_id": "com_001"
}
```

---

### **35. Flujo Completo: Polling de Nuevos Comunicados**

**Cada 60 segundos ejecutar:**
```http
GET /comunicados/actualizaciones?ultimo_check=2025-10-18T10:00:00Z
Authorization: Bearer <token>
```

**Si hay actualizaciones:**
- Mostrar toast notification en frontend
- Actualizar contador de no leídos
- Agregar nuevos comunicados al inicio de la lista

---

## **SECCIÓN 10: CONSIDERACIONES DE PERFORMANCE**

### **36. Optimizaciones Implementadas**

**Paginación:**
- Límite máximo de 50 registros por página
- Usar `OFFSET` y `LIMIT` en queries SQL
- Incluir índices en campos de búsqueda

**Índices de Base de Datos:**
```sql
CREATE INDEX idx_comunicados_fecha_publicacion ON comunicados(fecha_publicacion DESC);
CREATE INDEX idx_comunicados_estado ON comunicados(estado);
CREATE INDEX idx_comunicados_autor_id ON comunicados(autor_id);
CREATE INDEX idx_comunicados_lecturas_usuario ON comunicados_lecturas(usuario_id, fecha_lectura);
CREATE INDEX idx_comunicados_tipo ON comunicados(tipo);
```

**Caché:**
- Cachear contador de no leídos por 30 segundos
- Cachear lista de niveles/grados por 1 hora
- Invalidar caché al crear/editar/eliminar comunicado

**Notificaciones:**
- Procesamiento en background con queue
- Batch insert de notificaciones (50 por lote)
- Throttling de WhatsApp (50 mensajes por minuto)

---

## **SECCIÓN 11: SEGURIDAD**

### **37. Medidas de Seguridad Implementadas**

**Autenticación y Autorización:**
- JWT con expiración de 24 horas
- Refresh tokens para renovación automática
- Validación de roles en cada endpoint
- Middleware de autorización por recurso

**Sanitización de Datos:**
- HTML sanitizado con biblioteca DOMPurify
- Validación de inputs con express-validator
- Escape de queries SQL (prevenir SQL injection)
- Validación de tipos MIME en archivos

**Rate Limiting:**
- 100 requests por minuto por usuario
- 10 requests por minuto para creación de comunicados
- 50 requests por hora para notificaciones WhatsApp

**CORS:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
```

**Headers de Seguridad:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
```

---

## **SECCIÓN 12: TESTING**

### **38. Casos de Prueba Recomendados**

**Crear Comunicado:**
- ✅ Crear comunicado como director con todos los tipos
- ✅ Crear comunicado como docente con permisos (solo académico/evento)
- ❌ Crear comunicado como docente sin permisos (debe fallar)
- ❌ Crear comunicado con tipo no permitido para docente (debe fallar)
- ❌ Crear comunicado con segmentación no permitida (debe fallar)
- ✅ Crear borrador sin generar notificaciones
- ✅ Crear comunicado programado
- ❌ Crear comunicado con HTML malicioso (debe sanitizar)

**Leer Comunicado:**
- ✅ Padre lee comunicado de grado de su hijo
- ❌ Padre intenta leer comunicado de otro grado (debe fallar)
- ✅ Docente lee comunicado institucional
- ✅ Director lee cualquier comunicado
- ✅ Marcar como leído automáticamente
- ❌ Marcar como leído dos veces (debe ser idempotente)

**Notificaciones:**
- ✅ Generar notificaciones masivas para 100+ usuarios
- ✅ Enviar WhatsApp con throttling correcto
- ✅ Registrar errores de WhatsApp sin detener proceso
- ✅ Actualizar contador de no leídos correctamente

**Validaciones:**
- ❌ Título con menos de 10 caracteres (debe fallar)
- ❌ Contenido con menos de 20 caracteres (debe fallar)
- ❌ Fecha programada en el pasado (debe fallar)
- ❌ Segmentación vacía (debe fallar)
- ✅ HTML sanitizado correctamente

---
