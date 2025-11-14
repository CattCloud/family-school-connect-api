# **Documentación API REST - Módulo de Datos Académicos (Visualización - Padres)**

### **Autenticación JWT**
- Todos los endpoints requieren autenticación
- Incluir en cada request: `Authorization: Bearer <token>`
- Roles autorizados: **Padre/Apoderado**

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

## **SECCIÓN 1: CALIFICACIONES (PADRES)**

### **1. Obtener Calificaciones del Estudiante**

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

#### **Response Errors:**
- **403 Forbidden - Sin permisos:**
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "No tiene permisos para ver las calificaciones de este estudiante"
  }
}
```

- **404 Not Found - Sin calificaciones:**
```json
{
  "success": false,
  "error": {
    "code": "NO_GRADES_FOUND",
    "message": "No hay calificaciones registradas para este estudiante"
  }
}
```

---

### **2. Obtener Promedio por Componente**

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

## **SECCIÓN 2: ASISTENCIA (PADRES)**

### **3. Obtener Asistencia del Estudiante**

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

### **4. Obtener Estadísticas de Asistencia**

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

### **5. Exportar Asistencia**

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

## **SECCIÓN 3: RESUMEN ACADÉMICO (PADRES)**

### **6. Obtener Resumen Académico**

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

### **7. Exportar Resumen Académico**

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

### **8. Obtener Promedios Trimestrales**

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

### **9. Obtener Promedios Anuales**

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

## **SECCIÓN 4: CALENDARIO**

### **10. Obtener Días No Lectivos**

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

## **SECCIÓN 5: AÑO ACADÉMICO**

### **11. Obtener Año Académico Actual**

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

---

## **SECCIÓN 6: ENDPOINTS COMPLEMENTARIOS**

### **12. Obtener Hijos del Padre Autenticado**

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

## **CÓDIGOS DE ERROR ESPECÍFICOS DEL MÓDULO**

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `ACCESS_DENIED` | Sin permisos para ver datos del estudiante | 403 |
| `NO_GRADES_FOUND` | Sin calificaciones para el filtro aplicado | 404 |
| `NO_ATTENDANCE_FOUND` | Sin registros de asistencia | 404 |
| `INVALID_PARAMETERS` | Parámetros mutuamente excluyentes o inválidos | 400 |
| `INVALID_DATE_RANGE` | Rango de fechas inválido | 400 |
| `STUDENT_NOT_FOUND` | Estudiante no existe | 404 |
| `COURSE_NOT_FOUND` | Curso no existe | 404 |
| `COMPONENT_NOT_FOUND` | Componente de evaluación no existe | 404 |
| `EXPORT_FAILED` | Error al generar reporte PDF | 500 |
| `NO_DATA_TO_EXPORT` | Sin datos para exportar | 400 |
| `ACADEMIC_YEAR_NOT_FOUND` | Año académico no existe | 404 |
| `NO_ACTIVE_ACADEMIC_YEAR` | No hay año académico vigente | 404 |

---

## **REGLAS DE NEGOCIO**

### **Calificaciones:**
- **RN-01:** Validar que padre está vinculado al estudiante en `relaciones_familiares`
- **RN-02:** Solo mostrar evaluaciones del año/trimestre seleccionado
- **RN-03:** Ordenar evaluaciones por fecha descendente (más reciente primero)
- **RN-04:** Calcular promedio en tiempo real: suma / cantidad
- **RN-05:** Convertir fechas a formato legible español

### **Asistencia:**
- **RN-06:** Validar que padre está vinculado al estudiante
- **RN-07:** `mes` y `trimestre` son mutuamente excluyentes
- **RN-08:** Si no se especifica mes ni trimestre, usar mes actual
- **RN-09:** Convertir fechas a formato legible en español
- **RN-10:** Incluir nombre del día de la semana
- **RN-11:** Ordenar por fecha ascendente (más antigua primero)

### **Resumen Académico:**
- **RN-12:** Si `trimestre` es null o no se especifica, retornar vista anual
- **RN-13:** Promedio trimestral = Σ (promedio_componente × peso / 100)
- **RN-14:** Promedio final anual = (T1 + T2 + T3) / 3
- **RN-15:** Estado aprobado si promedio >= 11
- **RN-16:** Color verde >= 14, amarillo 11-13, rojo < 11
- **RN-17:** Redondear todos los valores a 2 decimales

### **Año Académico:**
- **RN-18:** El sistema determina automáticamente el año académico vigente basado en la fecha actual
- **RN-19:** Cada año académico contiene 3 trimestres con fechas de inicio y fin definidas
- **RN-20:** El trimestre actual se determina según la fecha del sistema
- **RN-21:** Las fechas de los trimestres siguen el calendario escolar peruano


---

## **CONSIDERACIONES DE SEGURIDAD**

1. **Validación de Acceso:**
   - Middleware obligatorio `validateParentAccess` en todos los endpoints
   - Verificar relación padre-hijo activa en cada request
   - Logs de auditoría de accesos

2. **Protección de Datos:**
   - No exponer información de otros estudiantes
   - Sanitizar outputs (no exponer IDs internos innecesariamente)
   - Datos sensibles solo visibles para el padre vinculado

3. **Rate Limiting:**
   - Consultas: 60 requests/minuto
   - Exportación PDF: 10 requests/minuto
   - Bloqueo temporal por intentos excesivos

4. **Caching Inteligente:**
   - Calificaciones finales: 1 hora
   - Calificaciones preliminares: 5 minutos
   - Asistencia: 30 minutos
   - Estructura de evaluación: 24 horas

---

## **CONSIDERACIONES DE PERFORMANCE**

1. **Optimización de Queries:**
   - Eager loading de relaciones (`include` en Sequelize)
   - Índices en campos de filtrado frecuente
   - Paginación en listados grandes (>50 registros)

2. **Caching:**
   - Redis para datos frecuentemente consultados
   - TTL diferenciado según tipo de dato
   - Invalidación de caché al actualizar datos

3. **Lazy Loading:**
   - Cargar gráficos solo cuando son visibles (viewport)
   - Calendarios cargan mes actual + buffer de 1 mes
   - Estadísticas se calculan bajo demanda

4. **Compresión:**
   - Gzip para respuestas >1KB
   - Minificación de HTML en PDFs
   - Optimización de imágenes en reportes
