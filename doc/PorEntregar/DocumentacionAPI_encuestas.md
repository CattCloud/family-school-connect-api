# **Documentación API REST - Módulo de Encuestas**

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

### **Rate Limiting**
- **Límite general:** 100 requests por minuto por usuario
- **Endpoints críticos:** 10 requests por minuto
- **Headers incluidos:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## **SECCIÓN 1: PANEL DE ENCUESTAS (HU-ENC-00)**

### **1. Obtener Lista de Encuestas del Usuario**

**Endpoint:** `GET /encuestas`  
**Descripción:** Obtiene todas las encuestas visibles para el usuario autenticado con paginación, filtros y segmentación automática  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=12                    # Registros por página (default: 12, max: 50)
&estado=todos                # Estado: todos, activas, respondidas, vencidas (default: todos)
&tipo=todos                  # Tipo: todos, institucionales, propias (default: todos)
&autor_id=usr_doc_001        # Filtrar por autor específico (opcional, solo director)
&busqueda=satisfaccion        # Búsqueda por título o descripción (min 2 caracteres) (opcional)
&ordenamiento=mas_reciente   # Orden: mas_reciente, mas_antiguo,por_vencimiento,por_nombre (default: mas_reciente)
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
    "encuestas": [
      {
        "id": "enc_001",
        "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
        "descripcion": "Encuesta para medir la satisfacción de padres sobre los servicios educativos...",
        "estado": "activa",
        "tipo": "institucional",
        "autor": {
          "id": "usr_dir_001",
          "nombre_completo": "Dr. Ricardo Mendoza García",
          "rol": "director"
        },
        "fecha_creacion": "2025-10-15T10:00:00Z",
        "fecha_creacion_legible": "15 de octubre de 2025, 10:00",
        "fecha_creacion_relativa": "Hace 3 días",
        "fecha_vencimiento": "2025-10-25T23:59:59Z",
        "fecha_vencimiento_legible": "25 de octubre de 2025, 23:59",
        "dias_para_vencimiento": 2,
        "proxima_a_vencer": true,
        "total_preguntas": 8,
        "total_respuestas": 23,
        "porcentaje_participacion": 76.67,
        "estado_respuesta": {
          "respondida": false,
          "fecha_respuesta": null
        },
        "es_autor": false,
        "puede_responder": true,
        "puede_ver_resultados": false,
        "destinatarios_texto": "Todos los padres de Primaria"
      },
      {
        "id": "enc_002",
        "titulo": "Feedback sobre Metodología Matemática",
        "descripcion": "Encuesta para mejorar nuestras estrategias de enseñanza...",
        "estado": "respondida",
        "tipo": "propia",
        "autor": {
          "id": "usr_doc_002",
          "nombre_completo": "Prof. María Elena Torres",
          "rol": "docente"
        },
        "fecha_creacion": "2025-10-10T14:30:00Z",
        "fecha_creacion_legible": "10 de octubre de 2025, 14:30",
        "fecha_creacion_relativa": "Hace 8 días",
        "fecha_vencimiento": "2025-10-20T23:59:59Z",
        "fecha_vencimiento_legible": "20 de octubre de 2025, 23:59",
        "dias_para_vencimiento": -3,
        "proxima_a_vencer": false,
        "total_preguntas": 5,
        "total_respuestas": 18,
        "porcentaje_participacion": 90.00,
        "estado_respuesta": {
          "respondida": true,
          "fecha_respuesta": "2025-10-12T16:45:00Z"
        },
        "es_autor": true,
        "puede_responder": false,
        "puede_ver_resultados": true,
        "destinatarios_texto": "Padres de 2do B"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 12,
      "total_encuestas": 15,
      "total_pages": 2,
      "has_next": true,
      "has_prev": false
    },
    "contadores": {
      "total": 15,
      "activas": 3,
      "respondidas": 10,
      "vencidas": 2
    },
    "filtros_aplicados": {
      "estado": "todos",
      "tipo": "todos",
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
    "message": "El parámetro 'estado' debe ser: todos, activas, respondidas o vencidas"
  }
}
```

- **404 Not Found - Sin encuestas:**
```json
{
  "success": false,
  "error": {
    "code": "NO_ENCUESTAS_FOUND",
    "message": "No hay encuestas disponibles con los filtros aplicados"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Segmentación automática según rol del usuario:
  - **Padre:** Solo encuestas dirigidas a grados/niveles de sus hijos
  - **Docente sin permisos:** Solo encuestas institucionales dirigidas a docentes
  - **Docente con permisos:** Encuestas institucionales + propias
  - **Director:** Todas las encuestas sin restricciones
- **RN-02:** Ordenar por fecha de creación descendente (más reciente primero)
- **RN-03:** Encuestas respondidas aparecen después de activas en mismo estado
- **RN-04:** Solo encuestas con `estado IN ('activa', 'vencida')` o respondidas por usuario
- **RN-05:** Campo `proxima_a_vencer` es `true` si vence en menos de 3 días
- **RN-06:** `descripcion` es máximo 100 caracteres del contenido sin HTML
- **RN-07:** Fecha relativa para últimos 7 días, después fecha completa

---

### **2. Obtener Contador de Encuestas Pendientes**

**Endpoint:** `GET /encuestas/pendientes/count`  
**Descripción:** Devuelve el número total de encuestas activas no respondidas del usuario  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Response Success (200):**
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
        "id": "enc_005",
        "titulo": "Evaluación de Servicios",
        "dias_restantes": 1,
        "tipo": "institucional"
      },
      {
        "id": "enc_003",
        "titulo": "Feedback Docente",
        "dias_restantes": 2,
        "tipo": "propia"
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-08:** Solo contar encuestas activas y no respondidas
- **RN-09:** Solo contar encuestas visibles según segmentación del usuario
- **RN-10:** Excluir encuestas vencidas del contador
- **RN-11:** Incluir encuestas próximas a vencer (< 3 días) en lista

---

### **3. Buscar Encuestas**

**Endpoint:** `GET /encuestas/search`  
**Descripción:** Búsqueda de encuestas por título o descripción  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Query Parameters:**
```
?query=satisfaccion           # Término de búsqueda (min 2 caracteres) (requerido)
&limit=20                    # Registros por página (default: 20)
&estado=todos                # Filtrar por estado (opcional)
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
        "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
        "descripcion": "...medir la satisfacción de padres sobre los servicios...",
        "estado": "activa",
        "fecha_creacion": "2025-10-15T10:00:00Z",
        "destacado": "Evaluación de <mark>Satisfacción</mark> del Segundo Trimestre",
        "match_en": "titulo",
        "relevancia": 95
      },
      {
        "id": "enc_008",
        "titulo": "Encuesta de Servicios",
        "descripcion": "...evaluar la <mark>satisfacción</mark> con nuestros servicios...",
        "estado": "respondida",
        "fecha_creacion": "2025-10-08T08:00:00Z",
        "destacado": "Encuesta de Servicios",
        "match_en": "descripcion",
        "relevancia": 78
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
- **RN-12:** Búsqueda case-insensitive
- **RN-13:** Buscar en campos: `titulo` y `descripcion`
- **RN-14:** Aplicar segmentación automática según rol
- **RN-15:** Destacar término encontrado en resultados con HTML `<mark>`
- **RN-16:** Ordenar por relevancia (matches en título primero, luego frecuencia)

---

### **4. Verificar Actualizaciones de Encuestas (Polling)**

**Endpoint:** `GET /encuestas/actualizaciones`  
**Descripción:** Verifica si hay nuevas encuestas o cambios desde el último check (para polling)  
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
    "nuevas_encuestas": [
      {
        "id": "enc_020",
        "titulo": "Encuesta de Clima Escolar",
        "estado": "activa",
        "autor": {
          "nombre_completo": "Dr. Ricardo Mendoza García"
        },
        "fecha_creacion": "2025-10-18T10:15:00Z",
        "descripcion_preview": "Evalúa el ambiente educativo..."
      }
    ],
    "encuestas_actualizadas": [
      {
        "id": "enc_015",
        "titulo": "Feedback Profesores",
        "cambio": "nuevas_respuestas",
        "fecha_actualizacion": "2025-10-18T09:30:00Z"
      }
    ],
    "total_nuevas_encuestas": 1,
    "total_actualizaciones": 1,
    "contador_pendientes": 4
  }
}
```

#### **Response Success (200) - Sin actualizaciones:**
```json
{
  "success": true,
  "data": {
    "hay_actualizaciones": false,
    "nuevas_encuestas": [],
    "encuestas_actualizadas": [],
    "total_nuevas_encuestas": 0,
    "total_actualizaciones": 0,
    "contador_pendientes": 3
  }
}
```

### **Reglas de Negocio:**
- **RN-17:** Comparar `fecha_creacion` y `fecha_actualizacion` con `ultimo_check`
- **RN-18:** Solo encuestas visibles según segmentación del usuario
- **RN-19:** Excluir encuestas que el usuario ya vio o respondió
- **RN-20:** Polling recomendado cada 60 segundos

---

## **SECCIÓN 2: RESPONDER ENCUESTA (HU-ENC-01)**

### **5. Validar Acceso a Encuesta**

**Endpoint:** `GET /encuestas/:id/validar-acceso`  
**Descripción:** Valida si el usuario tiene permisos para responder la encuesta  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_001",
    "tiene_acceso": true,
    "motivo": "Encuesta dirigida al grado de su hijo",
    "puede_responder": true,
    "estado_encuesta": "activa",
    "fecha_vencimiento": "2025-10-25T23:59:59Z",
    "dias_restantes": 5,
    "ya_respondio": false,
    "segmentacion_valida": true
  }
}
```

#### **Response Success (200) - Sin acceso:**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_002",
    "tiene_acceso": false,
    "motivo": "La encuesta no está dirigida a su rol o nivel",
    "puede_responder": false,
    "estado_encuesta": "activa",
    "fecha_vencimiento": "2025-10-30T23:59:59Z",
    "dias_restantes": 10,
    "ya_respondio": false,
    "segmentacion_valida": false
  }
}
```

### **Reglas de Negocio:**
- **RN-21:** Validar acceso según rol del usuario y segmentación de la encuesta
- **RN-22:** Verificar que encuesta esté activa y no vencida
- **RN-23:** Verificar que usuario no haya respondido previamente
- **RN-24:** No retornar error 403, sino información de acceso en data

---

### **6. Obtener Formulario de Encuesta para Responder**

**Endpoint:** `GET /encuestas/:id/formulario`  
**Descripción:** Obtiene estructura completa de la encuesta para mostrar formulario de respuesta  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

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
      "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
      "descripcion": "Esta encuesta nos ayudará a medir tu nivel de satisfacción con nuestros servicios educativos...",
      "fecha_vencimiento": "2025-10-25T23:59:59Z",
      "fecha_vencimiento_legible": "25 de octubre de 2025, 23:59",
      "dias_restantes": 5,
      "total_preguntas": 5,
      "preguntas_obligatorias": 3,
      "tiempo_estimado": 8,
      "autor": {
        "id": "usr_dir_001",
        "nombre_completo": "Dr. Ricardo Mendoza García",
        "rol": "director"
      }
    },
    "preguntas": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "tipo": "texto_corto",
        "texto": "¿Cuál es tu nombre completo?",
        "obligatoria": true,
        "orden": 1,
        "opciones": null,
        "etiquetas": null,
        "validacion": {
          "min_caracteres": 2,
          "max_caracteres": 500
        }
      },
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "tipo": "opcion_unica",
        "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
        "obligatoria": true,
        "orden": 2,
        "opciones": [
          {
            "id": "323e4567-e89b-12d3-a456-426614174002",
            "texto": "Diariamente",
            "orden": 1
          },
          {
            "id": "423e4567-e89b-12d3-a456-426614174003",
            "texto": "Semanalmente",
            "orden": 2
          },
          {
            "id": "523e4567-e89b-12d3-a456-426614174004",
            "texto": "Mensualmente",
            "orden": 3
          },
          {
            "id": "623e4567-e89b-12d3-a456-426614174005",
            "texto": "Nunca",
            "orden": 4
          }
        ],
        "etiquetas": null,
        "validacion": {
          "min_opciones": 1,
          "max_opciones": 1
        }
      },
      {
        "id": "723e4567-e89b-12d3-a456-426614174006",
        "tipo": "opcion_multiple",
        "texto": "¿Qué servicios te gustaría que mejoremos? (Selecciona todos los que apliquen)",
        "obligatoria": true,
        "orden": 3,
        "opciones": [
          {
            "id": "823e4567-e89b-12d3-a456-426614174007",
            "texto": "Comunicación con docentes",
            "orden": 1
          },
          {
            "id": "923e4567-e89b-12d3-a456-426614174008",
            "texto": "Plataforma virtual",
            "orden": 2
          },
          {
            "id": "a23e4567-e89b-12d3-a456-426614174009",
            "texto": "Servicios administrativos",
            "orden": 3
          },
          {
            "id": "b23e4567-e89b-12d3-a456-42661417400a",
            "texto": "Infraestructura",
            "orden": 4
          },
          {
            "id": "c23e4567-e89b-12d3-a456-42661417400b",
            "texto": "Actividades extracurriculares",
            "orden": 5
          }
        ],
        "etiquetas": null,
        "validacion": {
          "min_opciones": 1,
          "max_opciones": 5
        }
      },
      {
        "id": "d23e4567-e89b-12d3-a456-42661417400c",
        "tipo": "escala_1_5",
        "texto": "¿Qué tan satisfecho estás con la calidad educativa?",
        "obligatoria": false,
        "orden": 4,
        "opciones": null,
        "etiquetas": [
          "Muy insatisfecho",
          "Insatisfecho", 
          "Neutral",
          "Satisfecho",
          "Muy satisfecho"
        ],
        "validacion": {
          "min_valor": 1,
          "max_valor": 5
        }
      },
      {
        "id": "e23e4567-e89b-12d3-a456-42661417400d",
        "tipo": "texto_largo",
        "texto": "¿Tienes algún comentario o sugerencia adicional?",
        "obligatoria": false,
        "orden": 5,
        "opciones": null,
        "etiquetas": null,
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

### **Reglas de Negocio:**
- **RN-25:** Validar acceso antes de enviar estructura completa
- **RN-26:** Incluir reglas de validación para cada tipo de pregunta
- **RN-27:** Ordenar preguntas por campo `orden`
- **RN-28:** Incluir metadatos de tiempo estimado y progreso
- **RN-29:** Los IDs de preguntas son UUIDs reales del sistema

---

### **7. Enviar Respuestas de Encuesta**

**Endpoint:** `POST /respuestas`  
**Descripción:** Registra las respuestas completas de un usuario a una encuesta  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Request Body (JSON):**
```json
{
  "encuesta_id": "123e4567-e89b-12d3-a456-426614174000",
  "estudiante_id": "223e4567-e89b-12d3-a456-426614174001",
  "respuestas": [
    {
      "pregunta_id": "123e4567-e89b-12d3-a456-426614174000",
      "valor_texto": "Juan Carlos Pérez López"
    },
    {
      "pregunta_id": "223e4567-e89b-12d3-a456-426614174001",
      "valor_opcion_id": "423e4567-e89b-12d3-a456-426614174003"
    },
    {
      "pregunta_id": "723e4567-e89b-12d3-a456-426614174006",
      "valor_opciones": [
        "823e4567-e89b-12d3-a456-426614174007",
        "923e4567-e89b-12d3-a456-426614174008"
      ]
    },
    {
      "pregunta_id": "d23e4567-e89b-12d3-a456-42661417400c",
      "valor_escala": 4
    },
    {
      "pregunta_id": "e23e4567-e89b-12d3-a456-42661417400d",
      "valor_texto": "Me gustaría que mejoren la comunicación sobre las actividades de los niños."
    }
  ],
  "tiempo_respuesta_minutos": 8
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "respuesta": {
      "id": "f23e4567-e89b-12d3-a456-42661417400e",
      "encuesta_id": "123e4567-e89b-12d3-a456-426614174000",
      "usuario_id": "usr_pad_001",
      "estudiante_id": "223e4567-e89b-12d3-a456-426614174001",
      "fecha_respuesta": "2025-10-18T12:00:00Z",
      "tiempo_respuesta_minutos": 8,
      "total_preguntas": 5,
      "preguntas_respondidas": 5,
      "ip_respuesta": "192.168.1.100"
    },
    "estadisticas_actualizadas": {
      "total_respuestas": 24,
      "porcentaje_participacion": 80.00
    },
    "mensaje": "¡Respuestas enviadas exitosamente! Gracias por tu participación."
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Respuestas inválidas:**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Las siguientes preguntas obligatorias no fueron respondidas"
  }
}
```

- **404 Not Found - Encuesta no encontrada:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Encuesta no encontrada"
  }
}
```

- **409 Conflict - Ya respondió:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Ya has respondido esta encuesta anteriormente"
  }
}
```

### **Reglas de Negocio:**
- **RN-30:** Validar que todas las preguntas obligatorias tengan respuesta
- **RN-31:** Validar formato y longitud según tipo de pregunta
- **RN-32:** Verificar que usuario no haya respondido previamente
- **RN-33:** Sanitizar contenido de texto para prevenir XSS
- **RN-34:** Calcular tiempo de respuesta si no se proporciona
- **RN-35:** Registrar IP para auditoría
- **RN-36:** Usar UUIDs reales para preguntas y opciones en las respuestas

---

## **SECCIÓN 3: VER MIS RESPUESTAS (HU-ENC-02)**

### **8. Obtener Respuestas Propias de Encuesta**

**Endpoint:** `GET /encuestas/:id/mis-respuestas`  
**Descripción:** Obtiene las respuestas que el usuario ha dado a una encuesta específica  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

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
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
      "descripcion": "Esta encuesta nos ayudó a medir tu nivel de satisfacción...",
      "fecha_vencimiento": "2025-10-25T23:59:59Z",
      "autor": {
        "nombre_completo": "Dr. Ricardo Mendoza García"
      }
    },
    "respuesta": {
      "id": "f23e4567-e89b-12d3-a456-42661417400e",
      "fecha_respuesta": "2025-10-12T16:45:00Z",
      "fecha_respuesta_legible": "12 de octubre de 2025, 16:45",
      "tiempo_respuesta_minutos": 6,
      "total_preguntas": 5,
      "preguntas_respondidas": 5,
      "completitud": 100.00,
      "estudiante_relacionado": {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "nombre_completo": "Ana Sofía Pérez López",
        "grado": "2do B",
        "nivel": "Primaria"
      }
    },
    "respuestas_detalle": [
      {
        "pregunta_id": "123e4567-e89b-12d3-a456-426614174000",
        "tipo": "texto_corto",
        "texto_pregunta": "¿Cuál es tu nombre completo?",
        "valor": "Juan Carlos Pérez López",
        "obligatoria": true,
        "respondida": true
      },
      {
        "pregunta_id": "223e4567-e89b-12d3-a456-426614174001",
        "tipo": "opcion_unica",
        "texto_pregunta": "¿Con qué frecuencia revisas la plataforma educativa?",
        "valor": "Semanalmente",
        "valor_opcion_id": "423e4567-e89b-12d3-a456-426614174003",
        "obligatoria": true,
        "respondida": true,
        "opciones_disponibles": [
          "Diariamente",
          "Semanalmente",
          "Mensualmente",
          "Nunca"
        ]
      },
      {
        "pregunta_id": "723e4567-e89b-12d3-a456-426614174006",
        "tipo": "opcion_multiple",
        "texto_pregunta": "¿Qué servicios te gustaría que mejoremos?",
        "valor": [
          "Comunicación con docentes",
          "Plataforma virtual"
        ],
        "valor_opciones": [
          "823e4567-e89b-12d3-a456-426614174007",
          "923e4567-e89b-12d3-a456-426614174008"
        ],
        "obligatoria": true,
        "respondida": true,
        "opciones_disponibles": [
          "Comunicación con docentes",
          "Plataforma virtual",
          "Servicios administrativos",
          "Infraestructura",
          "Actividades extracurriculares"
        ]
      },
      {
        "pregunta_id": "d23e4567-e89b-12d3-a456-42661417400c",
        "tipo": "escala_1_5",
        "texto_pregunta": "¿Qué tan satisfecho estás con la calidad educativa?",
        "valor": 4,
        "valor_escala": 4,
        "obligatoria": false,
        "respondida": true,
        "etiquetas": [
          "Muy insatisfecho",
          "Insatisfecho",
          "Neutral",
          "Satisfecho",
          "Muy satisfecho"
        ]
      },
      {
        "pregunta_id": "e23e4567-e89b-12d3-a456-42661417400d",
        "tipo": "texto_largo",
        "texto_pregunta": "¿Tienes algún comentario o sugerencia adicional?",
        "valor": "Me gustaría que mejoren la comunicación sobre las actividades de los niños.",
        "valor_texto": "Me gustaría que mejoren la comunicación sobre las actividades de los niños.",
        "obligatoria": false,
        "respondida": true
      }
    ]
  }
}
```

#### **Response Errors:**
- **404 Not Found - No respondió:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Encuesta no encontrada"
  }
}
```

### **Reglas de Negocio:**
- **RN-37:** Validar que usuario haya respondido la encuesta
- **RN-38:** Incluir texto completo de opciones para preguntas de selección
- **RN-39:** Mostrar valor numérico y texto para escalas
- **RN-40:** Incluir metadatos de tiempo y completitud

---

## **SECCIÓN 4: CREAR Y PUBLICAR ENCUESTA (HU-ENC-03)**

### **9. Crear Encuesta**

**Endpoint:** `POST /encuestas`  
**Descripción:** Crea una nueva encuesta activa  
**Autenticación:** Bearer token (Rol: Docente con permisos / Director)  

#### **Request Body (JSON):**
```json
{
  "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
  "descripcion": "Esta encuesta nos ayudará a medir tu nivel de satisfacción con nuestros servicios educativos y a identificar áreas de mejora.",
  "fecha_inicio": "2025-10-18T10:00:00Z",
  "fecha_vencimiento": "2025-10-25T23:59:59Z",
  "permite_respuesta_multiple": false,
  "es_anonima": false,
  "mostrar_resultados": true,
  "año_academico": 2025,
  "preguntas": [
    {
      "texto": "¿Cuál es tu nombre completo?",
      "tipo": "texto_corto",
      "obligatoria": true,
      "orden": 1
    },
    {
      "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
      "tipo": "opcion_unica",
      "obligatoria": true,
      "orden": 2,
      "opciones": [
        {
          "texto": "Diariamente",
          "orden": 1
        },
        {
          "texto": "Semanalmente",
          "orden": 2
        },
        {
          "texto": "Mensualmente",
          "orden": 3
        },
        {
          "texto": "Nunca",
          "orden": 4
        }
      ]
    },
    {
      "texto": "¿Qué servicios te gustaría que mejoremos?",
      "tipo": "opcion_multiple",
      "obligatoria": true,
      "orden": 3,
      "opciones": [
        {
          "texto": "Comunicación con docentes",
          "orden": 1
        },
        {
          "texto": "Plataforma virtual",
          "orden": 2
        },
        {
          "texto": "Servicios administrativos",
          "orden": 3
        },
        {
          "texto": "Infraestructura",
          "orden": 4
        },
        {
          "texto": "Actividades extracurriculares",
          "orden": 5
        }
      ]
    },
    {
      "texto": "¿Qué tan satisfecho estás con la calidad educativa?",
      "tipo": "escala_1_5",
      "obligatoria": false,
      "orden": 4
    },
    {
      "texto": "¿Tienes algún comentario o sugerencia adicional?",
      "tipo": "texto_largo",
      "obligatoria": false,
      "orden": 5
    }
  ]
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
      "descripcion": "Esta encuesta nos ayudará a medir tu nivel de satisfacción...",
      "estado": "activa",
      "fecha_creacion": "2025-10-18T14:00:00Z",
      "fecha_vencimiento": "2025-10-25T23:59:59Z",
      "autor_id": "usr_doc_002",
      "total_preguntas": 5,
      "preguntas_obligatorias": 3,
      "año_academico": 2025,
      "autor": {
        "id": "usr_doc_002",
        "nombre": "María Elena",
        "apellido": "Torres",
        "rol": "docente"
      },
      "preguntas": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174001",
          "texto": "¿Cuál es tu nombre completo?",
          "tipo": "texto_corto",
          "obligatoria": true,
          "orden": 1,
          "opciones": []
        },
        {
          "id": "223e4567-e89b-12d3-a456-426614174002",
          "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
          "tipo": "opcion_unica",
          "obligatoria": true,
          "orden": 2,
          "opciones": [
            {
              "id": "323e4567-e89b-12d3-a456-426614174003",
              "texto": "Diariamente",
              "orden": 1
            },
            {
              "id": "423e4567-e89b-12d3-a456-426614174004",
              "texto": "Semanalmente",
              "orden": 2
            },
            {
              "id": "523e4567-e89b-12d3-a456-426614174005",
              "texto": "Mensualmente",
              "orden": 3
            },
            {
              "id": "623e4567-e89b-12d3-a456-426614174006",
              "texto": "Nunca",
              "orden": 4
            }
          ]
        }
      ]
    },
    "mensaje": "Encuesta creada exitosamente"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Datos inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Datos inválidos"
  }
}
```

- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para crear encuestas"
  }
}
```

### **Reglas de Negocio:**
- **RN-41:** Validar permisos del usuario antes de crear
- **RN-42:** Validar estructura JSON de preguntas
- **RN-43:** Verificar que haya al menos 1 pregunta obligatoria
- **RN-44:** Sanitizar contenido HTML de título y descripción
- **RN-45:** Validar fecha de vencimiento (mínimo 24 horas futuro)
- **RN-46:** La encuesta se crea con estado "activa" por defecto

---

## **ENDPOINTS ADICIONALES IMPLEMENTADOS**

### **10. Obtener todas las preguntas de una encuesta específica**

**Endpoint:** `GET /encuestas/:id/preguntas`  
**Descripción:** Obtiene todas las preguntas de una encuesta específica con sus opciones  
**Autenticación:** Bearer token (Rol: Director/Autor de la encuesta)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "123e4567-e89b-12d3-a456-426614174000",
    "preguntas": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "texto": "¿Cuál es tu nombre completo?",
        "tipo": "texto_corto",
        "obligatoria": true,
        "orden": 1,
        "opciones": []
      },
      {
        "id": "223e4567-e89b-12d3-a456-426614174002",
        "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
        "tipo": "opcion_unica",
        "obligatoria": true,
        "orden": 2,
        "opciones": [
          {
            "id": "323e4567-e89b-12d3-a456-426614174003",
            "texto": "Diariamente",
            "orden": 1
          },
          {
            "id": "423e4567-e89b-12d3-a456-426614174004",
            "texto": "Semanalmente",
            "orden": 2
          }
        ]
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-47:** Solo el autor de la encuesta o un director pueden ver todas las preguntas
- **RN-48:** Las preguntas se ordenan por el campo `orden`
- **RN-49:** Las opciones se ordenan por el campo `orden` dentro de cada pregunta

---

## **CÓDIGOS DE ERROR COMUNES**

### **400 Bad Request**
- **INVALID_PARAMETERS:** Parámetros de consulta inválidos
- **BAD_REQUEST:** Datos de entrada inválidos en POST/PUT/PATCH
- **VALIDATION_ERROR:** Error de validación de datos

### **401 Unauthorized**
Token JWT inválido, expirado o no proporcionado

### **403 Forbidden**
- **FORBIDDEN:** No tiene permisos para acceder al recurso
- **INSUFFICIENT_PERMISSIONS:** Permisos insuficientes para la operación

### **404 Not Found**
- **NOT_FOUND:** Recurso no encontrado (encuesta, pregunta, etc.)

### **409 Conflict**
- **CONFLICT:** Conflicto en la operación (ya existe, ya respondió, etc.)

### **500 Internal Server Error**
Error interno del servidor

---

## **CONSIDERACIONES DE SEGURIDAD**

1. **Autenticación JWT:** Todos los endpoints requieren token válido
2. **Autorización por Roles:** Segmentación automática según rol del usuario
3. **Validación de Entrada:** Validación estricta de datos de entrada con Zod
4. **Sanitización:** Sanitización de contenido para prevenir XSS
5. **Rate Limiting:** Protección contra ataques de fuerza bruta
6. **Auditoría:** Registro de IP y tiempo de respuesta para auditoría

---

## **EJEMPLOS DE USO**

### **Obtener lista de encuestas activas para padre de familia:**
```bash
curl -X GET "http://localhost:3000/encuestas?estado=activas&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

### **Validar acceso a una encuesta específica:**
```bash
curl -X GET "http://localhost:3000/encuestas/123e4567-e89b-12d3-a456-426614174000/validar-acceso" \
  -H "Authorization: Bearer <jwt_token>"
```

### **Enviar respuestas a una encuesta:**
```bash
curl -X POST "http://localhost:3000/respuestas" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "encuesta_id": "123e4567-e89b-12d3-a456-426614174000",
    "respuestas": [
      {
        "pregunta_id": "123e4567-e89b-12d3-a456-426614174001",
        "valor_texto": "Juan Pérez"
      }
    ]
  }'
```

### **Crear una nueva encuesta:**
```bash
curl -X POST "http://localhost:3000/encuestas" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Evaluación de Servicios",
    "descripcion": "Encuesta sobre satisfacción de servicios",
    "año_academico": 2025,
    "preguntas": [
      {
        "texto": "¿Cómo califica nuestros servicios?",
        "tipo": "escala_1_5",
        "obligatoria": true,
        "orden": 1
      }
    ]
  }'
```

---

**Fin de la Documentación - Módulo de Encuestas v1.0**