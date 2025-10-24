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

### **Reglas de Negocio:**
- **RN-20:** Solo director puede desactivar comunicados
- **RN-21:** Comunicados desactivados no aparecen en bandeja principal
- **RN-22:** Comunicados desactivados son visibles solo para director
- **RN-23:** Se pueden reactivar cambiando estado a `'publicado'`

---

### **6. Eliminar Comunicado**

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

### **Reglas de Negocio:**
- **RN-24:** Solo director puede eliminar comunicados
- **RN-25:** Eliminación es permanente e irreversible
- **RN-26:** Se eliminan también registros relacionados en `comunicados_lecturas`
- **RN-27:** Requiere confirmación explícita en request body

---

## **SECCIÓN 2: LEER COMUNICADO COMPLETO (HU-COM-01)**

### **7. Obtener Comunicado Completo**

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
- **RN-28:** Validar acceso según rol del usuario:
  - **Padre:** Verificar que comunicado está dirigido a grado/nivel de sus hijos
  - **Docente:** Verificar que es autor o comunicado es institucional
  - **Director:** Acceso total sin restricciones
- **RN-29:** Contenido HTML debe estar sanitizado antes de enviar
- **RN-30:** Campo `destinatarios.texto_legible` debe ser human-readable
- **RN-31:** Estadísticas básicas solo incluyen contadores generales

---

### **8. Marcar Comunicado como Leído**

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
- **RN-32:** Solo crear registro si no existe previamente
- **RN-33:** Usar `ON CONFLICT DO NOTHING` para evitar duplicados
- **RN-34:** Actualizar contador de no leídos del usuario
- **RN-35:** Validar que usuario tiene acceso al comunicado

---

### **9. Validar Acceso a Comunicado**

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
- **RN-36:** Endpoint de validación previa antes de cargar contenido completo
- **RN-37:** Retornar permisos detallados según rol y relación con el comunicado
- **RN-38:** No retornar error 403, sino información de acceso en data

---

## **SECCIÓN 3: CREAR Y PUBLICAR COMUNICADO (HU-COM-02)**

### **10. Verificar Permisos de Creación**

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

### **Reglas de Negocio:**
- **RN-39:** Director siempre tiene permisos sin necesidad de verificación
- **RN-40:** Docente debe tener `puede_crear_comunicados = true` y `estado_activo = true`
- **RN-41:** Retornar restricciones específicas del rol

---

### **11. Obtener Grados y Cursos Asignados al Docente**

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
- **RN-42:** Solo asignaciones con `estado_activo = true`
- **RN-43:** Solo del año académico especificado
- **RN-44:** Agrupar por nivel y grado para facilitar selección en frontend

---

### **12. Obtener Todos los Niveles y Grados (Director)**

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
- **RN-45:** Solo niveles y grados con `estado_activo = true`
- **RN-46:** Ordenar por orden lógico: Inicial → Primaria → Secundaria
- **RN-47:** Incluir descripción legible para UI

---

### **13. Calcular Destinatarios Estimados (Preview)**

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

### **Reglas de Negocio:**
- **RN-48:** Contar solo usuarios activos
- **RN-49:** Si `todos = true`, contar todos los usuarios de la institución
- **RN-50:** Desglosar por tipo de destinatario y grado
- **RN-51:** Generar texto legible para mostrar en UI

---

### **14. Crear Comunicado (Publicado o Borrador)**

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
  "niveles