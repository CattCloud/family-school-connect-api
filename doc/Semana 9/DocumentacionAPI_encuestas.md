# **Documentación API REST - Módulo de Encuestas**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semana 9 - 2025  
**Versión:** 1.0 - Sistema de Encuestas Institucionales  

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
&fecha_inicio=2025-10-01     # Fecha inicio (YYYY-MM-DD) (opcional)
&fecha_fin=2025-10-31        # Fecha fin (YYYY-MM-DD) (opcional)
&autor_id=usr_doc_001        # Filtrar por autor específico (opcional, solo director)
&nivel=Primaria              # Filtrar por nivel (opcional, solo director)
&grado=3                     # Filtrar por grado (opcional, solo director)
&hijo_id=est_001             # Filtrar por hijo específico (opcional, solo padre)
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
&offset=0                    # Desplazamiento (default: 0)
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
        "id": 1,
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
        "id": 2,
        "tipo": "opcion_unica",
        "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
        "obligatoria": true,
        "orden": 2,
        "opciones": [
          "Diariamente",
          "Semanalmente",
          "Mensualmente",
          "Nunca"
        ],
        "etiquetas": null,
        "validacion": {
          "min_opciones": 1,
          "max_opciones": 1
        }
      },
      {
        "id": 3,
        "tipo": "opcion_multiple",
        "texto": "¿Qué servicios te gustaría que mejoremos? (Selecciona todos los que apliquen)",
        "obligatoria": true,
        "orden": 3,
        "opciones": [
          "Comunicación con docentes",
          "Plataforma virtual",
          "Servicios administrativos",
          "Infraestructura",
          "Actividades extracurriculares"
        ],
        "etiquetas": null,
        "validacion": {
          "min_opciones": 1,
          "max_opciones": 5
        }
      },
      {
        "id": 4,
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
        "id": 5,
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

---

### **7. Enviar Respuestas de Encuesta**

**Endpoint:** `POST /respuestas-encuestas`  
**Descripción:** Registra las respuestas completas de un usuario a una encuesta  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Request Body (JSON):**
```json
{
  "encuesta_id": "enc_001",
  "estudiante_id": "est_001",
  "respuestas": [
    {
      "pregunta_id": 1,
      "tipo": "texto_corto",
      "valor": "Juan Carlos Pérez López"
    },
    {
      "pregunta_id": 2,
      "tipo": "opcion_unica",
      "valor": "Semanalmente"
    },
    {
      "pregunta_id": 3,
      "tipo": "opcion_multiple",
      "valor": ["Comunicación con docentes", "Plataforma virtual"]
    },
    {
      "pregunta_id": 4,
      "tipo": "escala_1_5",
      "valor": 4
    },
    {
      "pregunta_id": 5,
      "tipo": "texto_largo",
      "valor": "Me gustaría que mejoren la comunicación sobre las actividades de los niños."
    }
  ],
  "tiempo_respuesta_minutos": 8,
  "dispositivo": "desktop",
  "navegador": "Chrome"
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
      "estudiante_id": "est_001",
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
    "code": "INVALID_ANSWERS",
    "message": "La pregunta 3 es obligatoria y no fue respondida"
  }
}
```

- **409 Conflict - Ya respondió:**
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_ANSWERED",
    "message": "Ya has respondido esta encuesta anteriormente"
  }
}
```

### **Reglas de Negocio:**
- **RN-29:** Validar que todas las preguntas obligatorias tengan respuesta
- **RN-30:** Validar formato y longitud según tipo de pregunta
- **RN-31:** Verificar que usuario no haya respondido previamente
- **RN-32:** Sanitizar contenido de texto para prevenir XSS
- **RN-33:** Calcular tiempo de respuesta si no se proporciona
- **RN-34:** Registrar IP para auditoría

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
      "id": "enc_001",
      "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
      "descripcion": "Esta encuesta nos ayudó a medir tu nivel de satisfacción...",
      "fecha_vencimiento": "2025-10-25T23:59:59Z",
      "autor": {
        "nombre_completo": "Dr. Ricardo Mendoza García"
      }
    },
    "respuesta": {
      "id": "resp_001",
      "fecha_respuesta": "2025-10-12T16:45:00Z",
      "fecha_respuesta_legible": "12 de octubre de 2025, 16:45",
      "tiempo_respuesta_minutos": 6,
      "total_preguntas": 5,
      "preguntas_respondidas": 5,
      "completitud": 100.00,
      "estudiante_relacionado": {
        "id": "est_001",
        "nombre_completo": "Ana Sofía Pérez López",
        "grado": "2do B",
        "nivel": "Primaria"
      }
    },
    "respuestas_detalle": [
      {
        "pregunta_id": 1,
        "tipo": "texto_corto",
        "texto_pregunta": "¿Cuál es tu nombre completo?",
        "valor": "Juan Carlos Pérez López",
        "obligatoria": true,
        "respondida": true
      },
      {
        "pregunta_id": 2,
        "tipo": "opcion_unica",
        "texto_pregunta": "¿Con qué frecuencia revisas la plataforma educativa?",
        "valor": "Semanalmente",
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
        "pregunta_id": 3,
        "tipo": "opcion_multiple",
        "texto_pregunta": "¿Qué servicios te gustaría que mejoremos?",
        "valor": ["Comunicación con docentes", "Plataforma virtual"],
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
        "pregunta_id": 4,
        "tipo": "escala_1_5",
        "texto_pregunta": "¿Qué tan satisfecho estás con la calidad educativa?",
        "valor": 4,
        "valor_texto": "Satisfecho",
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
        "pregunta_id": 5,
        "tipo": "texto_largo",
        "texto_pregunta": "¿Tienes algún comentario o sugerencia adicional?",
        "valor": "Me gustaría que mejoren la comunicación sobre las actividades de los niños.",
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
    "code": "RESPONSE_NOT_FOUND",
    "message": "Aún no has respondido esta encuesta"
  }
}
```

### **Reglas de Negocio:**
- **RN-35:** Validar que usuario haya respondido la encuesta
- **RN-36:** Incluir texto completo de opciones para preguntas de selección
- **RN-37:** Mostrar valor numérico y texto para escalas
- **RN-38:** Incluir metadatos de tiempo y completitud

---

## **SECCIÓN 4: CREAR Y PUBLICAR ENCUESTA (HU-ENC-03)**

### **9. Verificar Permisos de Creación**

**Endpoint:** `GET /permisos-docentes/:docente_id/encuestas`  
**Descripción:** Verifica si el docente tiene permisos activos para crear encuestas  
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
      "puede_crear_encuestas": true,
      "estado_activo": true,
      "fecha_otorgamiento": "2025-03-01T00:00:00Z",
      "otorgado_por": {
        "nombre_completo": "Dr. Ricardo Mendoza García"
      }
    },
    "restricciones": {
      "segmentacion_limitada": true,
      "solo_padres": true,
      "max_preguntas": 50,
      "max_encuestas_mes": 10
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-39:** Director siempre tiene permisos sin necesidad de verificación
- **RN-40:** Docente debe tener `puede_crear_encuestas = true` y `estado_activo = true`
- **RN-41:** Retornar restricciones específicas del rol

---

### **10. Obtener Grados y Cursos Asignados al Docente**

**Endpoint:** `GET /cursos/docente/:docente_id/encuestas`  
**Descripción:** Lista cursos y grados donde el docente tiene asignaciones activas para segmentación  
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
          },
          {
            "id": "cur_016",
            "nombre": "Comunicación",
            "codigo_curso": "CP5002"
          }
        ]
      }
    ],
    "grados_unicos": ["5to A"],
    "niveles_unicos": ["Primaria"],
    "total_cursos": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-42:** Solo asignaciones con `estado_activo = true`
- **RN-43:** Solo del año académico especificado
- **RN-44:** Agrupar por nivel y grado para facilitar selección en frontend

---

### **11. Obtener Todos los Niveles y Grados (Director)**

**Endpoint:** `GET /nivel-grado/encuestas`  
**Descripción:** Lista completa de niveles y grados de la institución para segmentación de encuestas  
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

### **12. Calcular Destinatarios Estimados (Preview)**

**Endpoint:** `POST /usuarios/destinatarios/encuestas/preview`  
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

### **13. Crear Encuesta (Publicado o Borrador)**

**Endpoint:** `POST /encuestas`  
**Descripción:** Crea una nueva encuesta y la publica o guarda como borrador  
**Autenticación:** Bearer token (Rol: Docente con permisos / Director)  

#### **Request Body (JSON):**
```json
{
  "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
  "descripcion": "Esta encuesta nos ayudará a medir tu nivel de satisfacción con nuestros servicios educativos y a identificar áreas de mejora.",
  "fecha_vencimiento": "2025-10-25T23:59:59Z",
  "estado": "activa",
  "preguntas": [
    {
      "id": 1,
      "tipo": "texto_corto",
      "texto": "¿Cuál es tu nombre completo?",
      "obligatoria": true,
      "orden": 1
    },
    {
      "id": 2,
      "tipo": "opcion_unica",
      "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
      "obligatoria": true,
      "orden": 2,
      "opciones": [
        "Diariamente",
        "Semanalmente",
        "Mensualmente",
        "Nunca"
      ]
    },
    {
      "id": 3,
      "tipo": "opcion_multiple",
      "texto": "¿Qué servicios te gustaría que mejoremos?",
      "obligatoria": true,
      "orden": 3,
      "opciones": [
        "Comunicación con docentes",
        "Plataforma virtual",
        "Servicios administrativos",
        "Infraestructura",
        "Actividades extracurriculares"
      ]
    },
    {
      "id": 4,
      "tipo": "escala_1_5",
      "texto": "¿Qué tan satisfecho estás con la calidad educativa?",
      "obligatoria": false,
      "orden": 4,
      "etiquetas": [
        "Muy insatisfecho",
        "Insatisfecho",
        "Neutral",
        "Satisfecho",
        "Muy satisfecho"
      ]
    },
    {
      "id": 5,
      "tipo": "texto_largo",
      "texto": "¿Tienes algún comentario o sugerencia adicional?",
      "obligatoria": false,
      "orden": 5
    }
  ],
  "segmentacion": {
    "publico_objetivo": ["padres"],
    "niveles": ["Primaria"],
    "grados": ["1ro A", "2do B"],
    "cursos": [],
    "todos": false
  },
  "configuracion": {
    "permite_respuesta_multiple": false,
    "es_anonima": false,
    "mostrar_resultados": true
  }
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "enc_025",
      "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
      "descripcion": "Esta encuesta nos ayudará a medir tu nivel de satisfacción...",
      "estado": "activa",
      "fecha_creacion": "2025-10-18T14:00:00Z",
      "fecha_vencimiento": "2025-10-25T23:59:59Z",
      "autor_id": "usr_doc_002",
      "total_preguntas": 5,
      "preguntas_obligatorias": 3,
      "segmentacion": {
        "publico_objetivo": ["padres"],
        "niveles": ["Primaria"],
        "grados": ["1ro A", "2do B"],
        "cursos": [],
        "todos": false
      },
      "url_destino": "/dashboard/encuestas/enc_025/responder"
    },
    "notificaciones": {
      "total_destinatarios": 45,
      "notificaciones_creadas": 45,
      "mensaje_envio": "Las notificaciones se están enviando en background"
    },
    "mensaje": "¡Encuesta creada y publicada exitosamente! Se han generado 45 notificaciones."
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Datos inválidos:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SURVEY_DATA",
    "message": "La encuesta debe tener al menos 1 pregunta obligatoria"
  }
}
```

- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "No tienes permisos para crear encuestas"
  }
}
```

### **Reglas de Negocio:**
- **RN-52:** Validar permisos del usuario antes de crear
- **RN-53:** Validar estructura JSON de preguntas
- **RN-54:** Verificar que haya al menos 1 pregunta obligatoria
- **RN-55:** Sanitizar contenido HTML de título y descripción
- **RN-56:** Validar fecha de vencimiento (mínimo 24 horas futuro)
- **RN-57:** Crear notificaciones automáticamente si estado = 'activa'

---

### **14. Guardar Encuesta como Borrador**

**Endpoint:** `POST /encuestas/borrador`  
**Descripción:** Guarda una encuesta como borrador sin publicarla ni enviar notificaciones  
**Autenticación:** Bearer token (Rol: Docente con permisos / Director)  

#### **Request Body (JSON):**
```json
{
  "titulo": "Encuesta de Prueba - Borrador",
  "descripcion": "Esta es una encuesta de prueba que se guardará como borrador.",
  "preguntas": [
    {
      "id": 1,
      "tipo": "texto_corto",
      "texto": "Pregunta de prueba",
      "obligatoria": true,
      "orden": 1
    }
  ],
  "segmentacion": {
    "publico_objetivo": ["padres"],
    "niveles": ["Primaria"],
    "grados": ["1ro A"],
    "cursos": [],
    "todos": false
  }
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "enc_026",
      "titulo": "Encuesta de Prueba - Borrador",
      "estado": "borrador",
      "fecha_creacion": "2025-10-18T14:30:00Z",
      "autor_id": "usr_doc_002",
      "url_edicion": "/dashboard/encuestas/enc_026/editar"
    },
    "mensaje": "Borrador guardado correctamente. Puedes continuar editando o publicarla cuando esté lista."
  }
}
```

### **Reglas de Negocio:**
- **RN-58:** No se envían notificaciones para borradores
- **RN-59:** No se requiere fecha de vencimiento para borradores
- **RN-60:** Los borradores solo son visibles para el autor

---

## **SECCIÓN 5: GESTIONAR ENCUESTAS PROPIAS (HU-ENC-04)**

### **15. Obtener Encuestas para Gestión**

**Endpoint:** `GET /encuestas/gestion`  
**Descripción:** Obtiene lista de encuestas que el usuario puede gestionar (crearlas o todas si es director)  
**Autenticación:** Bearer token (Rol: Docente con permisos / Director)  

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=20                    # Registros por página (default: 20, max: 50)
&estado=todos                # Estado: todos, activa, cerrada, vencida, borrador (default: todos)
&autor_id=usr_doc_002        # Filtrar por autor específico (opcional, solo director)
&nivel=Primaria              # Filtrar por nivel (opcional, solo director)
&grado=3                     # Filtrar por grado (opcional, solo director)
&fecha_inicio=2025-10-01     # Fecha inicio (YYYY-MM-DD) (opcional)
&fecha_fin=2025-10-31        # Fecha fin (YYYY-MM-DD) (opcional)
&ordenamiento=mas_reciente   # Orden: mas_reciente, mas_antiguo,por_nombre,por_respuestas (default: mas_reciente)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "usr_doc_002",
      "nombre_completo": "Prof. María Elena Torres",
      "rol": "docente"
    },
    "estadisticas_globales": {
      "total_encuestas": 8,
      "activas": 3,
      "cerradas": 2,
      "vencidas": 1,
      "borradores": 2,
      "con_respuestas": 6,
      "participacion_promedio": 75.5
    },
    "encuestas": [
      {
        "id": "enc_015",
        "titulo": "Evaluación de Metodología Matemática",
        "estado": "activa",
        "autor": {
          "id": "usr_doc_002",
          "nombre_completo": "Prof. María Elena Torres",
          "rol": "docente"
        },
        "fecha_creacion": "2025-10-10T14:30:00Z",
        "fecha_vencimiento": "2025-10-25T23:59:59Z",
        "total_preguntas": 6,
        "total_respuestas": 18,
        "porcentaje_participacion": 90.00,
        "destinatarios_texto": "Padres de 2do B",
        "puede_editar": false,
        "puede_eliminar": false,
        "puede_cerrar": true,
        "puede_ver_resultados": true,
        "proxima_a_vencer": true
      },
      {
        "id": "enc_014",
        "titulo": "Feedback sobre Actividades Extracurriculares",
        "estado": "cerrada",
        "autor": {
          "id": "usr_doc_002",
          "nombre_completo": "Prof. María Elena Torres",
          "rol": "docente"
        },
        "fecha_creacion": "2025-09-28T10:00:00Z",
        "fecha_vencimiento": "2025-10-15T23:59:59Z",
        "total_preguntas": 4,
        "total_respuestas": 25,
        "porcentaje_participacion": 86.21,
        "destinatarios_texto": "Padres de 3ro A",
        "puede_editar": false,
        "puede_eliminar": false,
        "puede_cerrar": false,
        "puede_ver_resultados": true,
        "puede_reabrir": true,
        "fecha_cierre": "2025-10-14T16:00:00Z"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total_encuestas": 8,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-61:** Docente solo ve encuestas donde `autor_id = current_user`
- **RN-62:** Director ve todas las encuestas de la institución
- **RN-63:** Incluir estadísticas globales para panel de gestión
- **RN-64:** Determinar acciones disponibles según estado y respuestas

---

### **16. Cerrar Encuesta Anticipadamente**

**Endpoint:** `PATCH /encuestas/:id/cerrar`  
**Descripción:** Cierra una encuesta activa antes de su fecha de vencimiento  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Request Body (JSON):**
```json
{
  "motivo": "Se alcanzó el número deseado de respuestas",
  "notificar_cierre": true
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_015",
    "estado": "cerrada",
    "fecha_cierre": "2025-10-18T15:00:00Z",
    "fecha_vencimiento_original": "2025-10-25T23:59:59Z",
    "total_respuestas": 18,
    "mensaje": "Encuesta cerrada exitosamente. Ya no aceptará nuevas respuestas."
  }
}
```

### **Reglas de Negocio:**
- **RN-65:** Solo autor o director pueden cerrar encuesta
- **RN-66:** Encuesta debe estar en estado 'activa'
- **RN-67:** No se pueden enviar nuevas respuestas después del cierre
- **RN-68:** Opcionalmente enviar notificación del cierre a destinatarios

---

### **17. Extender Fecha de Vencimiento**

**Endpoint:** `PATCH /encuestas/:id/extender`  
**Descripción:** Extiende la fecha de vencimiento de una encuesta activa o cerrada  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Request Body (JSON):**
```json
{
  "nueva_fecha_vencimiento": "2025-11-05T23:59:59Z",
  "motivo": "Solicitudes de padres para más tiempo",
  "notificar_cambio": true
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_015",
    "fecha_vencimiento_anterior": "2025-10-25T23:59:59Z",
    "nueva_fecha_vencimiento": "2025-11-05T23:59:59Z",
    "estado": "activa",
    "dias_extendidos": 11,
    "mensaje": "Fecha de vencimiento extendida exitosamente."
  }
}
```

### **Reglas de Negocio:**
- **RN-69:** Nueva fecha debe ser futura y posterior a la actual
- **RN-70:** Si la encuesta estaba cerrada, cambia a estado 'activa'
- **RN-71:** Opcionalmente notificar del cambio a destinatarios pendientes

---

### **18. Reabrir Encuesta Cerrada o Vencida**

**Endpoint:** `PATCH /encuestas/:id/reabrir`  
**Descripción:** Reabre una encuesta cerrada o vencida con nueva fecha de vencimiento  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Request Body (JSON):**
```json
{
  "nueva_fecha_vencimiento": "2025-11-10T23:59:59Z",
  "motivo": "Interés de padres en participar",
  "notificar_reapertura": true
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_014",
    "estado_anterior": "cerrada",
    "nuevo_estado": "activa",
    "nueva_fecha_vencimiento": "2025-11-10T23:59:59Z",
    "mensaje": "Encuesta reabierta exitosamente. Se notificará a los destinatarios pendientes."
  }
}
```

### **Reglas de Negocio:**
- **RN-72:** Solo autor o director pueden reabrir encuesta
- **RN-73:** Encuesta debe estar en estado 'cerrada' o 'vencida'
- **RN-74:** Nueva fecha debe ser futura
- **RN-75:** Notificar solo a destinatarios que no han respondido

---

### **19. Editar Información Básica de Encuesta**

**Endpoint:** `PATCH /encuestas/:id/editar`  
**Descripción:** Edita título, descripción y fecha de vencimiento de una encuesta (solo si no tiene respuestas)  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Request Body (JSON):**
```json
{
  "titulo": "Evaluación Actualizada de Satisfacción",
  "descripcion": "Descripción modificada de la encuesta...",
  "fecha_vencimiento": "2025-10-30T23:59:59Z"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_026",
    "campos_actualizados": ["titulo", "descripcion", "fecha_vencimiento"],
    "fecha_edicion": "2025-10-18T16:00:00Z",
    "mensaje": "Información de encuesta actualizada correctamente."
  }
}
```

#### **Response Errors:**
- **409 Conflict - Tiene respuestas:**
```json
{
  "success": false,
  "error": {
    "code": "HAS_RESPONSES",
    "message": "No se puede editar una encuesta que ya tiene respuestas"
  }
}
```

### **Reglas de Negocio:**
- **RN-76:** Solo se puede editar si no hay respuestas registradas
- **RN-77:** No se permite editar estructura de preguntas
- **RN-78:** Registrar fecha de edición para auditoría

---

### **20. Duplicar Encuesta**

**Endpoint:** `POST /encuestas/:id/duplicar`  
**Descripción:** Crea una copia de una encuesta existente como nuevo borrador  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta a duplicar
```

#### **Request Body (JSON):**
```json
{
  "nuevo_titulo": "Copia - Evaluación de Satisfacción",
  "conservar_preguntas": true,
  "conservar_segmentacion": true
}
```

#### **Response Success (201):**
```json
{
  "success": true,
  "data": {
    "encuesta_original": {
      "id": "enc_015",
      "titulo": "Evaluación de Metodología Matemática"
    },
    "encuesta_duplicada": {
      "id": "enc_027",
      "titulo": "Copia - Evaluación de Satisfacción",
      "estado": "borrador",
      "autor_id": "usr_doc_002",
      "fecha_creacion": "2025-10-18T16:30:00Z",
      "total_preguntas": 6,
      "url_edicion": "/dashboard/encuestas/enc_027/editar"
    },
    "mensaje": "Encuesta duplicada exitosamente como borrador."
  }
}
```

### **Reglas de Negocio:**
- **RN-79:** Nueva encuesta se crea con estado 'borrador'
- **RN-80:** Autor de la copia es el usuario que solicita la duplicación
- **RN-81:** Se resetean estadísticas y fechas
- **RN-82:** Opcionalmente conservar o modificar preguntas y segmentación

---

### **21. Eliminar Encuesta**

**Endpoint:** `DELETE /encuestas/:id`  
**Descripción:** Elimina permanentemente una encuesta del sistema  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Request Body (JSON):**
```json
{
  "confirmacion": true,
  "motivo": "Encuesta creada por error, no es necesaria"
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_028",
    "eliminado": true,
    "fecha_eliminacion": "2025-10-18T17:00:00Z",
    "registros_eliminados": {
      "respuestas": 0,
      "notificaciones": 0,
      "lecturas": 0
    },
    "mensaje": "Encuesta eliminada permanentemente."
  }
}
```

#### **Response Errors:**
- **409 Conflict - Tiene respuestas:**
```json
{
  "success": false,
  "error": {
    "code": "HAS_RESPONSES",
    "message": "No se puede eliminar una encuesta que ya tiene respuestas"
  }
}
```

### **Reglas de Negocio:**
- **RN-83:** Solo se puede eliminar si no hay respuestas registradas
- **RN-84:** Eliminación es permanente e irreversible
- **RN-85:** Se eliminan también registros relacionados en otras tablas
- **RN-86:** Requiere confirmación explícita en request body

---

## **SECCIÓN 6: VER ANÁLISIS DE RESULTADOS (HU-ENC-05)**

### **22. Obtener Estadísticas Generales de Encuesta**

**Endpoint:** `GET /encuestas/:id/resultados/estadisticas`  
**Descripción:** Obtiene estadísticas generales y resumen de resultados de una encuesta  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

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
      "id": "enc_015",
      "titulo": "Evaluación de Metodología Matemática",
      "estado": "activa",
      "total_preguntas": 6,
      "preguntas_obligatorias": 4
    },
    "estadisticas_generales": {
      "total_respuestas": 18,
      "total_destinatarios": 20,
      "porcentaje_participacion": 90.00,
      "tiempo_promedio_respuesta": 6.5,
      "primera_respuesta": "2025-10-11T09:15:00Z",
      "ultima_respuesta": "2025-10-16T14:30:00Z",
      "fecha_analisis": "2025-10-18T18:00:00Z"
    },
    "distribucion_segmento": {
      "por_nivel": {
        "Primaria": 18
      },
      "por_grado": {
        "2do B": 18
      },
      "por_rol": {
        "padres": 18
      }
    },
    "tendencia_temporal": {
      "respuestas_por_dia": [
        {
          "fecha": "2025-10-11",
          "respuestas": 3
        },
        {
          "fecha": "2025-10-12",
          "respuestas": 7
        },
        {
          "fecha": "2025-10-13",
          "respuestas": 5
        },
        {
          "fecha": "2025-10-14",
          "respuestas": 2
        },
        {
          "fecha": "2025-10-15",
          "respuestas": 1
        }
      ]
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-87:** Solo autor o director pueden ver resultados
- **RN-88:** Calcular tiempo promedio excluyendo respuestas < 1 minuto
- **RN-89:** Incluir distribución por segmentos si la encuesta está segmentada
- **RN-90:** Mostrar tendencia temporal de respuestas

---

### **23. Obtener Análisis por Pregunta**

**Endpoint:** `GET /encuestas/:id/resultados/analisis-pregunta/:pregunta_id`  
**Descripción:** Obtiene análisis detallado de una pregunta específica con visualizaciones según tipo  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
{pregunta_id} = ID de la pregunta
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "pregunta": {
      "id": 2,
      "tipo": "opcion_unica",
      "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
      "obligatoria": true,
      "orden": 2
    },
    "estadisticas": {
      "total_respuestas": 18,
      "preguntas_respondidas": 18,
      "porcentaje_respuesta": 100.00
    },
    "analisis": {
      "tipo_visualizacion": "barras_horizontales",
      "opciones": [
        {
          "opcion": "Diariamente",
          "cantidad": 6,
          "porcentaje": 33.33,
          "color": "#3B82F6"
        },
        {
          "opcion": "Semanalmente",
          "cantidad": 8,
          "porcentaje": 44.44,
          "color": "#10B981"
        },
        {
          "opcion": "Mensualmente",
          "cantidad": 3,
          "porcentaje": 16.67,
          "color": "#F59E0B"
        },
        {
          "opcion": "Nunca",
          "cantidad": 1,
          "porcentaje": 5.56,
          "color": "#EF4444"
        }
      ],
      "opcion_mas_seleccionada": {
        "opcion": "Semanalmente",
        "cantidad": 8,
        "porcentaje": 44.44
      },
      "analisis_segmento": {
        "por_nivel": {
          "Primaria": {
            "Diariamente": 6,
            "Semanalmente": 8,
            "Mensualmente": 3,
            "Nunca": 1
          }
        }
      }
    },
    "datos_para_grafico": {
      "labels": ["Diariamente", "Semanalmente", "Mensualmente", "Nunca"],
      "datasets": [
        {
          "label": "Cantidad de Respuestas",
          "data": [6, 8, 3, 1],
          "backgroundColor": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
        }
      ]
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-91:** El tipo de visualización depende del tipo de pregunta
- **RN-92:** Incluir colores institucionales para gráficos
- **RN-93:** Para preguntas de opción múltiple, mostrar conteo de selecciones
- **RN-94:** Para escalas, incluir promedio y distribución
- **RN-95:** Para texto, mostrar nube de palabras y lista de respuestas

---

### **24. Obtener Lista de Respondientes**

**Endpoint:** `GET /encuestas/:id/resultados/respondientes`  
**Descripción:** Obtiene lista completa de usuarios que han respondido la encuesta  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=20                    # Registros por página (default: 20, max: 100)
&rol=todos                   # Filtrar por rol: todos, padres, docentes (default: todos)
&nivel=Primaria              # Filtrar por nivel (opcional)
&grado=2                     # Filtrar por grado (opcional)
&fecha_inicio=2025-10-01     # Fecha inicio (YYYY-MM-DD) (opcional)
&fecha_fin=2025-10-31        # Fecha fin (YYYY-MM-DD) (opcional)
&estado_respuesta=todos      # Estado: todos, completa, incompleta (default: todos)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_015",
    "total_respuestas": 18,
    "respondientes": [
      {
        "usuario_id": "usr_pad_005",
        "nombre_completo": "Carmen Rosa Vargas López",
        "rol": "padre",
        "email": "carmen.vargas@email.com",
        "telefono": "+51 987 654 321",
        "estudiante_relacionado": {
          "id": "est_008",
          "nombre_completo": "Luis Alberto Vargas Carmen",
          "grado": "2do B",
          "nivel": "Primaria"
        },
        "fecha_respuesta": "2025-10-12T10:30:00Z",
        "tiempo_respuesta_minutos": 4,
        "completitud": 100.00,
        "ip_respuesta": "192.168.1.105"
      },
      {
        "usuario_id": "usr_pad_008",
        "nombre_completo": "María Fernanda Díaz Torres",
        "rol": "padre",
        "email": "maria.diaz@email.com",
        "telefono": "+51 912 345 678",
        "estudiante_relacionado": {
          "id": "est_012",
          "nombre_completo": "Sofía Elena Díaz María",
          "grado": "2do B",
          "nivel": "Primaria"
        },
        "fecha_respuesta": "2025-10-14T15:45:00Z",
        "tiempo_respuesta_minutos": 8,
        "completitud": 83.33,
        "ip_respuesta": "192.168.1.108"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total_respondientes": 18,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "estadisticas_filtro": {
      "rol": "todos",
      "nivel": null,
      "grado": null,
      "estado_respuesta": "todos"
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-96:** Incluir información del estudiante relacionado para padres
- **RN-97:** Mostrar metadatos de respuesta (tiempo, IP, completitud)
- **RN-98:** Permitir filtrado por múltiples criterios
- **RN-99:** Para directores, incluir opción de ver todos los roles

---

### **25. Obtener Lista de Usuarios Pendientes**

**Endpoint:** `GET /encuestas/:id/resultados/pendientes`  
**Descripción:** Obtiene lista de usuarios que no han respondido la encuesta  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=20                    # Registros por página (default: 20, max: 100)
&rol=todos                   # Filtrar por rol: todos, padres, docentes (default: todos)
&nivel=Primaria              # Filtrar por nivel (opcional)
&grado=2                     # Filtrar por grado (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta_id": "enc_015",
    "total_destinatarios": 20,
    "total_pendientes": 2,
    "porcentaje_pendientes": 10.00,
    "pendientes": [
      {
        "usuario_id": "usr_pad_010",
        "nombre_completo": "José Luis Rojas Mendoza",
        "rol": "padre",
        "email": "jose.rojas@email.com",
        "telefono": "+51 934 567 890",
        "estudiante_relacionado": {
          "id": "est_015",
          "nombre_completo": "Diego Andrés Rojas José",
          "grado": "2do B",
          "nivel": "Primaria"
        },
        "ultimo_recordatorio": "2025-10-17T10:00:00Z",
        "notificaciones_enviadas": 2,
        "dias_desde_ultimo_recordatorio": 1
      },
      {
        "usuario_id": "usr_pad_012",
        "nombre_completo": "Ana Patricia Castillo Díaz",
        "rol": "padre",
        "email": "ana.castillo@email.com",
        "telefono": "+51 945 678 901",
        "estudiante_relacionado": {
          "id": "est_018",
          "nombre_completo": "Camila Andrea Castillo Ana",
          "grado": "2do B",
          "nivel": "Primaria"
        },
        "ultimo_recordatorio": null,
        "notificaciones_enviadas": 1,
        "dias_desde_ultimo_recordatorio": 7
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total_pendientes": 2,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-100:** Incluir información de recordatorios enviados
- **RN-101:** Mostrar días desde último recordatorio para priorizar
- **RN-102:** Permitir enviar recordatorios individuales desde esta vista
- **RN-103:** Excluir usuarios que ya respondieron

---

### **26. Exportar Resultados de Encuesta**

**Endpoint:** `POST /encuestas/:id/resultados/exportar`  
**Descripción:** Genera archivo exportado con resultados completos de la encuesta  
**Autenticación:** Bearer token (Rol: Autor de encuesta / Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta
```

#### **Request Body (JSON):**
```json
{
  "formato": "excel",
  "incluir_datos_personales": true,
  "incluir_comentarios_textuales": true,
  "incluir_analisis_por_segmento": true,
  "incluir_graficos": true,
  "rango_fechas": {
    "inicio": "2025-10-01",
    "fin": "2025-10-31"
  },
  "filtros": {
    "rol": "todos",
    "nivel": "Primaria",
    "grado": "2do B"
  }
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "exportacion": {
      "id": "exp_001",
      "formato": "excel",
      "nombre_archivo": "resultados_encuesta_015_2025-10-18.xlsx",
      "tamano_bytes": 2048576,
      "url_descarga": "https://api.orquideas.edu.pe/downloads/exp_001",
      "url_expiracion": "2025-10-25T18:00:00Z",
      "fecha_generacion": "2025-10-18T18:30:00Z"
    },
    "resumen": {
      "total_registros": 18,
      "total_preguntas": 6,
      "rango_fechas": "2025-10-01 al 2025-10-31",
      "incluye_graficos": true,
      "incluye_analisis_segmento": true
    },
    "mensaje": "Exportación generada exitosamente. El enlace estará disponible por 7 días."
  }
}
```

### **Reglas de Negocio:**
- **RN-104:** Generar archivo en background para exportaciones grandes
- **RN-105:** Los enlaces de descarga expiran en 7 días por seguridad
- **RN-106:** Incluir marca de agua con fecha de generación
- **RN-107:** Respetar filtros aplicados en la exportación

---

## **SECCIÓN 7: NOTIFICACIONES DE NUEVAS ENCUESTAS (HU-ENC-06)**

### **27. Obtener Notificaciones de Encuestas del Usuario**

**Endpoint:** `GET /notificaciones/encuestas`  
**Descripción:** Obtiene notificaciones relacionadas con encuestas para el usuario  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Query Parameters:**
```
?page=1                      # Número de página (default: 1)
&limit=15                    # Registros por página (default: 15, max: 50)
&tipo=todos                  # Tipo: todos, nueva_encuesta, recordatorio, resultado (default: todos)
&estado_leida=todos          # Estado: todos, leidas, no_leidas (default: todos)
&fecha_inicio=2025-10-01     # Fecha inicio (YYYY-MM-DD) (opcional)
&fecha_fin=2025-10-31        # Fecha fin (YYYY-MM-DD) (opcional)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "usr_pad_001",
      "nombre_completo": "Juan Carlos Pérez López"
    },
    "notificaciones": [
      {
        "id": "not_045",
        "tipo": "nueva_encuesta",
        "titulo": "📋 Nueva encuesta disponible",
        "contenido": "Evaluación de Satisfacción del Segundo Trimestre",
        "canal": "plataforma",
        "estado_plataforma": "entregada",
        "estado_whatsapp": "enviado",
        "fecha_creacion": "2025-10-18T10:00:00Z",
        "fecha_creacion_legible": "Hoy, 10:00 AM",
        "fecha_creacion_relativa": "Hace 2 horas",
        "leida": false,
        "fecha_lectura": null,
        "datos_adicionales": {
          "encuesta_id": "enc_025",
          "encuesta_titulo": "Evaluación de Satisfacción del Segundo Trimestre",
          "fecha_vencimiento": "2025-10-25T23:59:59Z",
          "autor": "Dr. Ricardo Mendoza García"
        },
        "url_destino": "/dashboard/encuestas/enc_025/responder",
        "accion_principal": {
          "texto": "Responder ahora",
          "url": "/dashboard/encuestas/enc_025/responder"
        }
      },
      {
        "id": "not_043",
        "tipo": "recordatorio",
        "titulo": "⏰ Recordatorio: Encuesta por vencer",
        "contenido": "La encuesta 'Evaluación de Satisfacción' vence en 2 días. Aún no has respondido.",
        "canal": "whatsapp",
        "estado_plataforma": "no_aplica",
        "estado_whatsapp": "entregado",
        "fecha_creacion": "2025-10-17T14:00:00Z",
        "fecha_creacion_legible": "Ayer, 2:00 PM",
        "fecha_creacion_relativa": "Hace 1 día",
        "leida": true,
        "fecha_lectura": "2025-10-17T16:30:00Z",
        "datos_adicionales": {
          "encuesta_id": "enc_015",
          "encuesta_titulo": "Evaluación de Metodología Matemática",
          "dias_restantes": 2,
          "tipo_recordatorio": "vencimiento_proximo"
        },
        "url_destino": "/dashboard/encuestas/enc_015/responder",
        "accion_principal": {
          "texto": "Responder encuesta",
          "url": "/dashboard/encuestas/enc_015/responder"
        }
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 15,
      "total_notificaciones": 23,
      "total_pages": 2,
      "has_next": true,
      "has_prev": false
    },
    "contadores": {
      "total": 23,
      "no_leidas": 5,
      "leidas": 18
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-108:** Mostrar solo notificaciones relacionadas con encuestas
- **RN-109:** Incluir datos adicionales específicos del tipo de notificación
- **RN-110:** Ordenar por fecha de creación descendente
- **RN-111:** No leídas aparecen primero independientemente del orden

---

### **28. Marcar Notificación como Leída**

**Endpoint:** `PATCH /notificaciones/:id/leida`  
**Descripción:** Marca una notificación específica como leída por el usuario  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Path Parameters:**
```
{id} = ID de la notificación
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "notificacion_id": "not_045",
    "estado_leida": true,
    "fecha_lectura": "2025-10-18T12:00:00Z",
    "nuevo_contador_no_leidas": 4,
    "mensaje": "Notificación marcada como leída"
  }
}
```

### **Reglas de Negocio:**
- **RN-112:** Solo el destinatario puede marcar como leída
- **RN-113:** Actualizar contador de no leídos del usuario
- **RN-114:** Registrar timestamp de lectura para auditoría

---

### **29. Marcar Todas las Notificaciones como Leídas**

**Endpoint:** `PATCH /notificaciones/encuestas/marcar-todas-leidas`  
**Descripción:** Marca todas las notificaciones no leídas del usuario como leídas  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Request Body (JSON):**
```json
{
  "tipo": "encuestas" // Opcional: filtrar por tipo específico
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "notificaciones_actualizadas": 5,
    "fecha_actualizacion": "2025-10-18T12:05:00Z",
    "nuevo_contador_no_leidas": 0,
    "mensaje": "Todas las notificaciones han sido marcadas como leídas"
  }
}
```

### **Reglas de Negocio:**
- **RN-115:** Actualizar solo notificaciones no leídas del usuario
- **RN-116:** Opcionalmente filtrar por tipo de notificación
- **RN-117:** Resetear contador de no leídos a cero

---

### **30. Obtener Preferencias de Notificaciones**

**Endpoint:** `GET /notificaciones/preferencias/:usuario_id`  
**Descripción:** Obtiene preferencias de notificación configuradas por el usuario  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Path Parameters:**
```
{usuario_id} = ID del usuario
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "usuario_id": "usr_pad_001",
    "preferencias": {
      "canales": {
        "plataforma": {
          "activo": true,
          "tipos": {
            "nueva_encuesta": true,
            "recordatorio": true,
            "resultado": false
          }
        },
        "whatsapp": {
          "activo": true,
          "tipos": {
            "nueva_encuesta": true,
            "recordatorio": true,
            "resultado": false
          }
        },
        "email": {
          "activo": false,
          "tipos": {
            "nueva_encuesta": false,
            "recordatorio": false,
            "resultado": false
          }
        }
      },
      "horarios": {
        "laborales": {
          "inicio": "08:00",
          "fin": "18:00",
          "activo": true
        },
        "fin_semana": {
          "inicio": "10:00",
          "fin": "14:00",
          "activo": true
        },
        "no_molestar": {
          "activo": false,
          "inicio": "22:00",
          "fin": "07:00"
        }
      },
      "frecuencia": {
        "maximo_diario": 10,
        "minimo_intervalo_minutos": 30
      },
      "suspension_temporal": {
        "activa": false,
        "fecha_inicio": null,
        "fecha_fin": null,
        "motivo": null
      }
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-118:** Cada usuario tiene preferencias personalizables
- **RN-119:** Las preferencias se respetan en cada envío
- **RN-120:** Suspensión temporal tiene prioridad sobre otras configuraciones

---

### **31. Actualizar Preferencias de Notificaciones**

**Endpoint:** `PATCH /notificaciones/preferencias/:usuario_id`  
**Descripción:** Actualiza las preferencias de notificación del usuario  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Path Parameters:**
```
{usuario_id} = ID del usuario
```

#### **Request Body (JSON):**
```json
{
  "canales": {
    "whatsapp": {
      "activo": true,
      "tipos": {
        "nueva_encuesta": true,
        "recordatorio": false,
        "resultado": false
      }
    },
    "email": {
      "activo": false,
      "tipos": {
        "nueva_encuesta": false,
        "recordatorio": false,
        "resultado": false
      }
    }
  },
  "horarios": {
    "no_molestar": {
      "activo": true,
      "inicio": "22:00",
      "fin": "07:00"
    }
  },
  "frecuencia": {
    "maximo_diario": 5
  }
}
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "preferencias_actualizadas": true,
    "fecha_actualizacion": "2025-10-18T12:10:00Z",
    "cambios_aplicados": [
      "whatsapp.recordatorio desactivado",
      "email completamente desactivado",
      "horario no_molestar activado",
      "frecuencia máxima reducida a 5 diarios"
    ],
    "mensaje": "Preferencias actualizadas exitosamente"
  }
}
```

### **Reglas de Negocio:**
- **RN-121:** Validar que los cambios sean coherentes
- **RN-122:** No permitir desactivar todos los canales para notificaciones críticas
- **RN-123:** Registrar cambios para auditoría

---

### **32. Obtener Estadísticas de Notificaciones**

**Endpoint:** `GET /notificaciones/encuestas/estadisticas`  
**Descripción:** Obtiene estadísticas generales de envío y entrega de notificaciones de encuestas  
**Autenticación:** Bearer token (Rol: Director)  

#### **Query Parameters:**
```
?encuesta_id=enc_015        # Filtrar por encuesta específica (opcional)
&fecha_inicio=2025-10-01     # Fecha inicio (YYYY-MM-DD) (opcional)
&fecha_fin=2025-10-31        # Fecha fin (YYYY-MM-DD) (opcional)
&canal=todos                 # Filtrar por canal: todos, plataforma, whatsapp, email (default: todos)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "inicio": "2025-10-01",
      "fin": "2025-10-31",
      "dias": 31
    },
    "estadisticas_generales": {
      "total_enviadas": 125,
      "total_entregadas": 118,
      "total_leidas": 95,
      "total_clics": 78,
      "tasa_entrega": 94.40,
      "tasa_apertura": 80.51,
      "tasa_clic": 82.11,
      "tasa_conversion": 65.60
    },
    "por_canal": {
      "plataforma": {
        "enviadas": 125,
        "entregadas": 125,
        "leidas": 95,
        "clics": 78,
        "tasa_apertura": 76.00,
        "tasa_clic": 82.11
      },
      "whatsapp": {
        "enviadas": 125,
        "entregadas": 118,
        "leidas": null,
        "clics": null,
        "tasa_entrega": 94.40
      },
      "email": {
        "enviadas": 0,
        "entregadas": 0,
        "leidas": 0,
        "clics": 0,
        "tasa_entrega": 0.00
      }
    },
    "por_tipo": {
      "nueva_encuesta": {
        "enviadas": 25,
        "entregadas": 24,
        "leidas": 20,
        "clics": 18,
        "tasa_conversion": 75.00
      },
      "recordatorio": {
        "enviadas": 85,
        "entregadas": 80,
        "leidas": 65,
        "clics": 52,
        "tasa_conversion": 65.00
      },
      "resultado": {
        "enviadas": 15,
        "entregadas": 14,
        "leidas": 10,
        "clics": 8,
        "tasa_conversion": 57.14
      }
    },
    "tendencia_diaria": [
      {
        "fecha": "2025-10-01",
        "enviadas": 8,
        "entregadas": 7,
        "leidas": 6,
        "clics": 5
      }
    ]
  }
}
```

### **Reglas de Negocio:**
- **RN-124:** Solo directores pueden ver estadísticas globales
- **RN-125:** Incluir métricas de conversión por canal y tipo
- **RN-126:** Mostrar tendencia temporal para análisis
- **RN-127:** Calcular tasas como porcentajes con 2 decimales

---

## **SECCIÓN 8: SEGURIDAD Y CONSIDERACIONES**

### **Autenticación y Autorización**

- **JWT Token:** Incluir `Authorization: Bearer <token>` en todos los requests
- **Token Expiration:** Los tokens expiran en 24 horas
- **Refresh Token:** Usar endpoint `/auth/refresh` para obtener nuevo token
- **Validación de Roles:** Cada endpoint valida roles específicos requeridos

### **Validaciones de Seguridad**

- **Sanitización de Input:** Todo contenido de texto se sanitiza para prevenir XSS
- **SQL Injection:** Usar parámetros preparados en todas las consultas
- **CSRF Protection:** Incluir token CSRF en todos los endpoints POST/PUT/PATCH/DELETE
- **Rate Limiting:** Respetar límites especificados en headers

### **Consideraciones de Rendimiento**

- **Paginación:** Usar paginación para listas grandes (default: 20, max: 100)
- **Caching:** Respuestas cacheadas por 5 minutos para datos no críticos
- **Lazy Loading:** Implementar para componentes pesados
- **Background Jobs:** Procesos largos (envío notificaciones, exportaciones) en background

### **Manejo de Errores**

- **Códigos HTTP:** Usar códigos apropiados (200, 201, 400, 401, 403, 404, 409, 500)
- **Formato Estandarizado:** Todos los errores siguen el formato especificado
- **Logging:** Registrar todos los errores para monitoreo y depuración
- **User-Friendly:** Mensajes de error comprensibles para usuarios finales

### **Ejemplos de Integración**

#### **JavaScript/TypeScript:**
```typescript
// Configuración del cliente
const apiClient = {
  baseURL: 'https://api.orquideas.edu.pe',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

// Obtener encuestas del usuario
async function getEncuestas(page = 1, filters = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '12',
    ...filters
  });
  
  try {
    const response = await fetch(`${apiClient.baseURL}/encuestas?${params}`, {
      headers: apiClient.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching encuestas:', error);
    throw error;
  }
}

// Enviar respuestas de encuesta
async function submitSurveyResponses(encuestaId, respuestas) {
  try {
    const response = await fetch(`${apiClient.baseURL}/respuestas-encuestas`, {
      method: 'POST',
      headers: apiClient.headers,
      body: JSON.stringify({
        encuesta_id: encuestaId,
        respuestas: respuestas,
        tiempo_respuesta_minutos: 5
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting responses:', error);
    throw error;
  }
}
```

