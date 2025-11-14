# Especificaciones Técnicas - Endpoints de Resultados de Encuestas

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** 2025-11-12  
**Versión:** 1.0 - Endpoints de Resultados de Encuestas  

---

## Base URL y Configuración

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** `https://api.orquideas.edu.pe`

### Autenticación JWT
- Todos los endpoints requieren autenticación
- Incluir en cada request: `Authorization: Bearer <token>`
- Roles autorizados: **Padre/Apoderado**, **Docente** y **Director**

### Formato de Errores Estandarizado
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

## **ENDPOINT 1: Obtener Resultados Agregados por Pregunta**

### **Endpoint:** `GET /encuestas/:id/resultados/preguntas`  
**Descripción:** Obtiene resultados agregados por pregunta para mostrar en la interfaz de respuesta  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta (UUID)
```

#### **Query Parameters:**
```
?incluir_respuestas_texto=true    # Incluir respuestas de texto abierto en agregación (opcional)
&limite_respuestas_texto=10      # Límite de respuestas de texto a mostrar (default: 10)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
      "total_respuestas": 24,
      "porcentaje_participacion": 80.00
    },
    "resultados": [
      {
        "pregunta_id": "123e4567-e89b-12d3-a456-426614174001",
        "texto": "¿Cuál es tu nombre completo?",
        "tipo": "texto_corto",
        "obligatoria": true,
        "total_respuestas": 24,
        "respuestas_porcentaje": 100.00,
        "agregacion": {
          "tipo": "texto",
          "respuestas_texto": [
            "Juan Carlos Pérez López",
            "María Elena Torres", 
            "Ana Sofía Rodríguez"
          ],
          "total_respuestas_texto": 24
        }
      },
      {
        "pregunta_id": "223e4567-e89b-12d3-a456-426614174002",
        "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
        "tipo": "opcion_unica",
        "obligatoria": true,
        "total_respuestas": 24,
        "respuestas_porcentaje": 100.00,
        "agregacion": {
          "tipo": "opciones",
          "opciones": [
            {
              "opcion_id": "323e4567-e89b-12d3-a456-426614174003",
              "texto": "Diariamente",
              "cantidad": 8,
              "porcentaje": 33.33
            },
            {
              "opcion_id": "423e4567-e89b-12d3-a456-426614174004",
              "texto": "Semanalmente", 
              "cantidad": 12,
              "porcentaje": 50.00
            },
            {
              "opcion_id": "523e4567-e89b-12d3-a456-426614174005",
              "texto": "Mensualmente",
              "cantidad": 3,
              "porcentaje": 12.50
            },
            {
              "opcion_id": "623e4567-e89b-12d3-a456-426614174006",
              "texto": "Nunca",
              "cantidad": 1,
              "porcentaje": 4.17
            }
          ]
        }
      },
      {
        "pregunta_id": "723e4567-e89b-12d3-a456-426614174006",
        "texto": "¿Qué servicios te gustaría que mejoremos?",
        "tipo": "opcion_multiple",
        "obligatoria": true,
        "total_respuestas": 24,
        "respuestas_porcentaje": 100.00,
        "agregacion": {
          "tipo": "opciones_multiples",
          "opciones": [
            {
              "opcion_id": "823e4567-e89b-12d3-a456-426614174007",
              "texto": "Comunicación con docentes",
              "cantidad": 18,
              "porcentaje": 75.00
            },
            {
              "opcion_id": "923e4567-e89b-12d3-a456-426614174008",
              "texto": "Plataforma virtual",
              "cantidad": 15,
              "porcentaje": 62.50
            },
            {
              "opcion_id": "a23e4567-e89b-12d3-a456-426614174009",
              "texto": "Servicios administrativos",
              "cantidad": 6,
              "porcentaje": 25.00
            }
          ]
        }
      },
      {
        "pregunta_id": "d23e4567-e89b-12d3-a456-42661417400c",
        "texto": "¿Qué tan satisfecho estás con la calidad educativa?",
        "tipo": "escala_1_5",
        "obligatoria": false,
        "total_respuestas": 22,
        "respuestas_porcentaje": 91.67,
        "agregacion": {
          "tipo": "escala",
          "promedio": 4.2,
          "mediana": 4,
          "distribucion": [
            { "valor": 1, "cantidad": 0, "porcentaje": 0.00 },
            { "valor": 2, "cantidad": 1, "porcentaje": 4.55 },
            { "valor": 3, "cantidad": 3, "porcentaje": 13.64 },
            { "valor": 4, "cantidad": 10, "porcentaje": 45.45 },
            { "valor": 5, "cantidad": 8, "porcentaje": 36.36 }
          ],
          "etiquetas": [
            "Muy insatisfecho",
            "Insatisfecho", 
            "Neutral",
            "Satisfecho",
            "Muy satisfecho"
          ]
        }
      }
    ]
  }
}
```

#### **Response Errors:**
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

- **403 Forbidden - Sin permisos para ver resultados:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN", 
    "message": "No tienes permisos para ver los resultados de esta encuesta"
  }
}
```

- **404 Not Found - Sin respuestas:**
```json
{
  "success": false,
  "error": {
    "code": "NO_RESPONSES_FOUND",
    "message": "Esta encuesta aún no tiene respuestas"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Solo usuarios con permisos pueden ver resultados (autor de encuesta, director, o si mostrar_resultados=true y ya respondió)
- **RN-02:** Para preguntas de texto, mostrar solo muestra aleatoria de respuestas para preservar privacidad
- **RN-03:** Para escalas, incluir promedio, mediana y distribución completa
- **RN-04:** Para opciones múltiples, calcular porcentaje basado en total de respuestas (no en suma de selecciones)
- **RN-05:** Excluir del conteo preguntas que no han sido respondidas por nadie

---

## **ENDPOINT 2: Obtener Estadísticas Generales de Encuesta**

### **Endpoint:** `GET /encuestas/:id/estadisticas`  
**Descripción:** Obtiene métricas generales y KPIs de una encuesta  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Path Parameters:**
```
{id} = ID de la encuesta (UUID)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "encuesta": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "titulo": "Evaluación de Satisfacción del Segundo Trimestre",
      "fecha_creacion": "2025-10-15T10:00:00Z",
      "fecha_vencimiento": "2025-10-25T23:59:59Z",
      "estado": "activa",
      "autor": {
        "nombre_completo": "Dr. Ricardo Mendoza García",
        "rol": "director"
      }
    },
    "metricas_generales": {
      "total_respuestas": 24,
      "porcentaje_participacion": 80.00,
      "tiempo_promedio_respuesta_minutos": 6.5,
      "tasa_completitud": 95.83,
      "respuestas_ultimas_24h": 3,
      "proyeccion_total_estimado": 30
    },
    "distribucion_temporal": {
      "por_dia": [
        {
          "fecha": "2025-10-15",
          "respuestas": 5,
          "porcentaje": 20.83
        },
        {
          "fecha": "2025-10-16", 
          "respuestas": 8,
          "porcentaje": 33.33
        },
        {
          "fecha": "2025-10-17",
          "respuestas": 6,
          "porcentaje": 25.00
        },
        {
          "fecha": "2025-10-18",
          "respuestas": 5,
          "porcentaje": 20.83
        }
      ],
      "por_hora": [
        {
          "hora": "08:00",
          "respuestas": 2,
          "porcentaje": 8.33
        },
        {
          "hora": "12:00",
          "respuestas": 8,
          "porcentaje": 33.33
        },
        {
          "hora": "18:00",
          "respuestas": 10,
          "porcentaje": 41.67
        },
        {
          "hora": "20:00",
          "respuestas": 4,
          "porcentaje": 16.67
        }
      ]
    },
    "insights": {
      "pregunta_mas_respondida": {
        "pregunta_id": "223e4567-e89b-12d3-a456-426614174002",
        "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
        "tasa_respuesta": 100.00
      },
      "pregunta_menos_respondida": {
        "pregunta_id": "e23e4567-e89b-12d3-a456-42661417400d",
        "texto": "¿Tienes algún comentario adicional?",
        "tasa_respuesta": 45.83
      },
      "opcion_mas_seleccionada": {
        "pregunta_id": "723e4567-e89b-12d3-a456-426614174006",
        "opcion_id": "823e4567-e89b-12d3-a456-426614174007",
        "texto": "Comunicación con docentes",
        "cantidad": 18,
        "porcentaje": 75.00
      },
      "tendencia_participacion": "creciente",
      "dias_restantes_para_vencer": 7
    }
  }
}
```

#### **Response Errors:**
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

- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para ver las estadísticas de esta encuesta"
  }
}
```

### **Reglas de Negocio:**
- **RN-06:** Solo el autor de la encuesta, director, o usuarios que hayan respondido (si mostrar_resultados=true) pueden ver estadísticas
- **RN-07:** Calcular porcentaje de participación basado en destinatarios estimados de la encuesta
- **RN-08:** Tasa de completitud = (respuestas completas / total respuestas) * 100
- **RN-09:** Proyección total estimada basada en tasa actual de respuestas y días restantes
- **RN-10:** Incluir insights automáticos para identificar patrones relevantes

---

## **ENDPOINT 3: Obtener Tabla de Respuestas (Paginada)**

### **Endpoint:** `GET /respuestas-encuestas`  
**Descripción:** Obtiene listado paginado de respuestas a encuestas con filtros  
**Autenticación:** Bearer token (Rol: Padre/Docente/Director)  

#### **Query Parameters:**
```
?encuesta_id=123e4567-e89b-12d3-a456-426614174000  # ID de encuesta (requerido)
&page=1                                           # Número de página (default: 1)
&limit=20                                         # Registros por página (default: 20, max: 100)
&nivel=Primaria                                   # Filtrar por nivel educativo (opcional)
&grado=2do                                        # Filtrar por grado (opcional)
&curso=B                                          # Filtrar por curso (opcional)
&rol=padre                                        # Filtrar por rol del respondiente (opcional)
&order=fecha_respuesta DESC                       # Ordenamiento (default: fecha_respuesta DESC)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "filtros_aplicados": {
      "encuesta_id": "123e4567-e89b-12d3-a456-426614174000",
      "nivel": null,
      "grado": null,
      "curso": null,
      "rol": null,
      "page": 1,
      "limit": 20
    },
    "respuestas": [
      {
        "respuesta_id": "f23e4567-e89b-12d3-a456-42661417400e",
        "fecha_respuesta": "2025-10-18T12:00:00Z",
        "fecha_respuesta_legible": "18 de octubre de 2025, 12:00",
        "tiempo_respuesta_minutos": 8,
        "completitud_porcentaje": 100.00,
        "respondiente": {
          "id": "usr_pad_001",
          "nombre_completo": "Juan Carlos Pérez López",
          "rol": "padre",
          "estudiante_relacionado": {
            "id": "223e4567-e89b-12d3-a456-426614174001",
            "nombre_completo": "Ana Sofía Pérez López",
            "grado": "2do B",
            "nivel": "Primaria"
          }
        },
        "respuestas_resumen": [
          {
            "pregunta_id": "223e4567-e89b-12d3-a456-426614174002",
            "tipo": "opcion_unica",
            "texto_pregunta": "¿Con qué frecuencia revisas la plataforma educativa?",
            "valor": "Semanalmente",
            "valor_opcion_id": "423e4567-e89b-12d3-a456-426614174004"
          },
          {
            "pregunta_id": "d23e4567-e89b-12d3-a456-42661417400c",
            "tipo": "escala_1_5", 
            "texto_pregunta": "¿Qué tan satisfecho estás?",
            "valor": 4,
            "valor_escala": 4,
            "etiqueta_valor": "Satisfecho"
          }
        ],
        "ip_respuesta": "192.168.1.100"
      },
      {
        "respuesta_id": "g23e4567-e89b-12d3-a456-42661417400f",
        "fecha_respuesta": "2025-10-18T14:30:00Z",
        "fecha_respuesta_legible": "18 de octubre de 2025, 14:30",
        "tiempo_respuesta_minutos": 5,
        "completitud_porcentaje": 80.00,
        "respondiente": {
          "id": "usr_pad_002",
          "nombre_completo": "María Elena Torres",
          "rol": "padre",
          "estudiante_relacionado": {
            "id": "323e4567-e89b-12d3-a456-426614174001",
            "nombre_completo": "Carlos Miguel Torres",
            "grado": "2do B", 
            "nivel": "Primaria"
          }
        },
        "respuestas_resumen": [
          {
            "pregunta_id": "223e4567-e89b-12d3-a456-426614174002",
            "tipo": "opcion_unica",
            "texto_pregunta": "¿Con qué frecuencia revisas la plataforma educativa?",
            "valor": "Diariamente",
            "valor_opcion_id": "323e4567-e89b-12d3-a456-426614174003"
          }
        ],
        "respuestas_omitidas": 4,
        "ip_respuesta": "192.168.1.101"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total_respuestas": 24,
      "total_pages": 2,
      "has_next": true,
      "has_prev": false
    },
    "estadisticas_filtros": {
      "total_sin_filtros": 24,
      "total_con_filtros": 24,
      "porcentaje_cobertura": 100.00
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
    "message": "El parámetro 'encuesta_id' es requerido y debe ser un UUID válido"
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

- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para ver las respuestas de esta encuesta"
  }
}
```

### **Reglas de Negocio:**
- **RN-11:** Solo el autor de la encuesta, director, o usuarios con permisos explícitos pueden ver listado completo
- **RN-12:** Aplicar segmentación automática: padres solo ven respuestas propias (excepto si son autores)
- **RN-13:** En respuestas_resumen mostrar solo 2-3 respuestas clave para preservar privacidad y rendimiento
- **RN-14:** Si respuestas_omitidas > 0, indicar cuántas respuestas no se muestran en el resumen
- **RN-15:** Ordenamiento por defecto: fecha_respuesta DESC (más reciente primero)
- **RN-16:** Límite máximo de 100 registros por página para optimizar rendimiento

---

## **Consideraciones de Seguridad y Rendimiento**

1. **Autenticación JWT:** Todos los endpoints requieren token válido
2. **Autorización Granular:** Validar permisos específicos por encuesta y tipo de usuario
3. **Paginación Obligatoria:** Endpoints con grandes volúmenes de datos deben usar paginación
4. **Rate Limiting:** 50 requests por minuto por usuario para endpoints de resultados
5. **Caché de Resultados:** Cachear agregaciones por 5 minutos para mejorar rendimiento
6. **Anonimización:** Para encuestas anónimas, no incluir información personal en respuestas

---

## **Códigos de Error Adicionales**

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `NO_RESPONSES_FOUND` | No hay respuestas para mostrar | 404 |
| `INVALID_PARAMETERS` | Parámetros de consulta inválidos | 400 |
| `PERMISSION_DENIED` | Sin permisos específicos para esta operación | 403 |
| `RATE_LIMIT_EXCEEDED` | Límite de requests excedido | 429 |
| `AGGREGATION_TIMEOUT` | Timeout en agregación de datos masivos | 500 |

---

**Fin de las Especificaciones - Endpoints de Resultados de Encuestas v1.0**