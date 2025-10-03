
# **Documentación API REST - Módulo de Datos Académicos (Carga)**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semanas 6-7 - 2025  
**Versión:** 1.0 - Carga de Calificaciones y Asistencia  

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** ``

### **Autenticación JWT**
- Todos los endpoints requieren autenticación
- Incluir en cada request: `Authorization: Bearer <token>`
- Roles autorizados por endpoint especificados en cada sección

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

> Nota de implementación (Estado actual - Semana 3)
>
> - Reportes de errores devuelven URL con report_id y vencen en 24h:
>   - GET /calificaciones/reporte-errores/{report_id}
>   - GET /asistencias/reporte-errores/{report_id}
> - Plantillas Excel reales generadas con ExcelJS:
>   - Calificaciones: Hoja "Calificaciones" con filas 1-3 informativas y fila 5 de encabezados; validación 0-20 en columna C; sin hoja "Instrucciones" ni celdas bloqueadas por ahora; nombre de archivo: Calificaciones_{Curso}{Grado}{Nivel}_{YYYY-MM-DD}.xlsx
>   - Asistencias: Hoja "Asistencias" con estados válidos en dropdown; nota en D5 para hora de tardanza; nombre de archivo: Asistencias_{Curso}{Grado}{Nivel}_{YYYY-MM-DD}.xlsx
> - Validación de archivos:
>   - Calificaciones: requiere curso_id, nivel_grado_id, trimestre (por defecto 1 si no se envía), componente_id; archivo_errores_url devuelve un report_id (TTL 24h).
>   - Asistencias: requiere curso_id, nivel_grado_id y fecha; archivo_errores_url devuelve un report_id (TTL 24h).
> - Verificación de asistencia: valida contexto (curso/nivel_grado/fecha), verifica registros previos del día y devuelve estadísticas si existen.
> - Carga de calificaciones/asistencias: Persistencia real con Prisma. En Asistencias, soporta reemplazar_existente: true para sobrescribir el día; se invalida el validacion_id tras cargar; operación transaccional.
> - Seguridad y límites: endpoints protegidos con JWT y roles; rate limiting por endpoint activo.

## **SECCIÓN 1: CURSOS Y ESTUDIANTES (Contexto Compartido)**

### **1. Obtener Cursos Asignados (Docente)**

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
      },
      {
        "id": "cur_002",
        "codigo_curso": "CP4001",
        "nombre": "Matemáticas",
        "nivel_grado": {
          "id": "ng_007",
          "nivel": "Primaria",
          "grado": "4",
          "descripcion": "4to de Primaria"
        },
        "total_estudiantes": 30,
        "estado_activo": true
      }
    ],
    "total_cursos": 2
  }
}
```

#### **Response Errors:**
- **404 Not Found - Sin asignaciones:**
```json
{
  "success": false,
  "error": {
    "code": "NO_COURSE_ASSIGNMENTS",
    "message": "No tiene cursos asignados para el año 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Solo mostrar cursos con `estado_activo = true`
- **RN-02:** Filtrar por `año_academico` actual por defecto
- **RN-03:** Incluir conteo de estudiantes activos por curso
- **RN-04:** Ordenar por nivel, grado y nombre de curso

---

### **2. Obtener Cursos por Nivel y Grado (Director)**

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
      },
      {
        "id": "cur_002",
        "codigo_curso": "CP3002",
        "nombre": "Comunicación",
        "total_estudiantes": 28,
        "docente_asignado": {
          "id": "usr_doc_002",
          "nombre": "Carlos Méndez Torres"
        },
        "estado_activo": true
      }
    ],
    "total_cursos": 8
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Parámetros faltantes:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Los parámetros 'nivel' y 'grado' son requeridos"
  }
}
```

- **404 Not Found - Nivel/grado no existe:**
```json
{
  "success": false,
  "error": {
    "code": "NIVEL_GRADO_NOT_FOUND",
    "message": "Nivel 'Premaria' - Grado '3' no existe en el sistema"
  }
}
```

### **Reglas de Negocio:**
- **RN-05:** Validar existencia de nivel/grado en `nivel_grado`
- **RN-06:** Solo cursos activos del año académico especificado
- **RN-07:** Incluir información del docente asignado actual
- **RN-08:** Ordenar alfabéticamente por nombre de curso

---

### **3. Obtener Estudiantes de un Curso**

**Endpoint:** `GET /estudiantes`  
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
      },
      {
        "id": "est_002",
        "codigo_estudiante": "P3002",
        "nombre": "Luis Alberto",
        "apellido": "Fernández Soto",
        "nombre_completo": "Luis Alberto Fernández Soto",
        "apoderado_principal": {
          "id": "usr_pad_002",
          "nombre": "Carmen Rosa Soto Díaz",
          "telefono": "+51923456789"
        },
        "estado_matricula": "activo"
      }
    ],
    "total_estudiantes": 28
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
    "message": "curso_id y nivel_grado_id son requeridos"
  }
}
```

- **403 Forbidden - Sin acceso al curso:**
```json
{
  "success": false,
  "error": {
    "code": "COURSE_ACCESS_DENIED",
    "message": "No tiene permisos para acceder a este curso"
  }
}
```

### **Reglas de Negocio:**
- **RN-09:** Docente: solo estudiantes de sus cursos asignados
- **RN-10:** Director: acceso a estudiantes de cualquier curso
- **RN-11:** Solo estudiantes con `estado_matricula = 'activo'`
- **RN-12:** Incluir información del apoderado principal
- **RN-13:** Ordenar alfabéticamente por apellido, nombre

---

## **SECCIÓN 2: CARGA DE CALIFICACIONES**

### **4. Obtener Estructura de Evaluación Vigente**

**Endpoint:** `GET /estructura-evaluacion`  
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
      },
      {
        "id": "eval_002",
        "nombre_item": "Participación",
        "peso_porcentual": 20.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 2,
        "estado_activo": true
      },
      {
        "id": "eval_003",
        "nombre_item": "Revisión de Cuaderno",
        "peso_porcentual": 15.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 3,
        "estado_activo": true
      },
      {
        "id": "eval_004",
        "nombre_item": "Revisión de Libro",
        "peso_porcentual": 15.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 4,
        "estado_activo": true
      },
      {
        "id": "eval_005",
        "nombre_item": "Comportamiento",
        "peso_porcentual": 10.00,
        "tipo_evaluacion": "recurrente",
        "orden_visualizacion": 5,
        "estado_activo": true
      }
    ],
    "total_componentes": 5,
    "suma_pesos": 100.00,
    "configuracion_bloqueada": true
  }
}
```

#### **Response Errors:**
- **404 Not Found - No configurada:**
```json
{
  "success": false,
  "error": {
    "code": "STRUCTURE_NOT_CONFIGURED",
    "message": "No hay estructura de evaluación configurada para el año 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-14:** Solo componentes con `estado_activo = true`
- **RN-15:** Ordenar por `orden_visualizacion` ascendente
- **RN-16:** Validar que configuración esté bloqueada antes de permitir cargas

---

### **5. Generar Plantilla de Calificaciones**

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

#### **Estructura del Excel Generado:**

**Hoja 1: "Calificaciones"**
- **Celda A1:** `componente_id` (prellenado con ID del componente - oculta/protegida)
- **Celda B1:** `fecha_evaluacion` (prellenada con fecha actual - formato YYYY-MM-DD)
- **Fila 3 (Headers):**
  - Columna A: `codigo_estudiante`
  - Columna B: `nombre_completo`
  - Columna C: `calificacion`
  - Columna D: `observaciones`
- **Filas 4+:** Datos de estudiantes prellenados
- **Formato:**
  - Columnas A y B: Bloqueadas (solo lectura)
  - Columna C: Validación de datos (0-20, decimales hasta 2 posiciones)
  - Formato condicional en C: Rojo si < 11
  - Columna D: Texto libre

**Hoja 2: "Instrucciones"**
- Información del componente (nombre, tipo, peso)
- Escala de calificación (0-20 → AD/A/B/C)
- Explicación de fecha de evaluación
- Advertencias de no modificar estructura
- Ejemplos de llenado correcto

#### **Response Errors:**
- **400 Bad Request - Parámetros faltantes:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "curso_id, nivel_grado_id, trimestre y componente_id son requeridos"
  }
}
```

- **404 Not Found - Componente no existe:**
```json
{
  "success": false,
  "error": {
    "code": "COMPONENT_NOT_FOUND",
    "message": "Componente con ID eval_999 no existe o no está activo"
  }
}
```

- **403 Forbidden - Sin acceso al curso:**
```json
{
  "success": false,
  "error": {
    "code": "COURSE_ACCESS_DENIED",
    "message": "No tiene permisos para generar plantilla de este curso"
  }
}
```

### **Reglas de Negocio:**
- **RN-17:** Docente: solo plantillas de cursos asignados
- **RN-18:** Director: plantillas de cualquier curso
- **RN-19:** Solo estudiantes activos del curso en el año académico
- **RN-20:** Nombre de archivo incluye contexto completo
- **RN-21:** Plantilla debe incluir ID de componente (validación backend)

---

### **6. Validar Archivo de Calificaciones**

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
      "total_filas": 28,
      "validos": 25,
      "con_errores": 3
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
    "registros_con_errores": [
      {
        "fila": 8,
        "codigo_estudiante": "P3005",
        "nombre_completo": "Carlos Ruiz Torres",
        "errores": [
          {
            "campo": "calificacion",
            "valor": "25",
            "mensaje": "Calificación fuera de rango (debe ser 0-20)"
          }
        ]
      },
      {
        "fila": 15,
        "codigo_estudiante": "P3012",
        "nombre_completo": "Ana Soto García",
        "errores": [
          {
            "campo": "calificacion",
            "valor": "",
            "mensaje": "Calificación es obligatoria"
          }
        ]
      },
      {
        "fila": 20,
        "codigo_estudiante": "P3040",
        "nombre_completo": "Estudiante Inexistente",
        "errores": [
          {
            "campo": "codigo_estudiante",
            "valor": "P3040",
            "mensaje": "Estudiante no encontrado en el curso seleccionado"
          }
        ]
      }
    ],
    "advertencias": [
      {
        "tipo": "EVALUACION_UNICA_EXISTENTE",
        "mensaje": "Ya existe evaluación única para 2 estudiantes. Se omitirán si intenta cargar duplicados.",
        "estudiantes_afectados": ["P3001", "P3002"]
      }
    ],
    "archivo_errores_url": "/calificaciones/reporte-errores/{report_id}"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Estructura inválida:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TEMPLATE_STRUCTURE",
    "message": "La estructura del archivo no coincide con la plantilla del componente 'Examen'"
  }
}
```

- **400 Bad Request - Componente no coincide:**
```json
{
  "success": false,
  "error": {
    "code": "COMPONENT_MISMATCH",
    "message": "El componente_id en el archivo (eval_002) no coincide con el componente seleccionado (eval_001)"
  }
}
```

- **400 Bad Request - Fecha inválida:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Formato de fecha_evaluacion inválido. Esperado: YYYY-MM-DD"
  }
}
```

### **Reglas de Negocio:**
- **RN-22:** Validar que `componente_id` en archivo coincida con seleccionado
- **RN-23:** Validar formato de `fecha_evaluacion` (YYYY-MM-DD)
- **RN-24:** Calificaciones 0-20 (decimales hasta 2 posiciones)
- **RN-25:** Campos obligatorios: `codigo_estudiante`, `calificacion`
- **RN-26:** Observaciones opcionales (max 500 caracteres)
- **RN-27:** Para componente `unica`: verificar si ya existe evaluación
- **RN-28:** Para componente `recurrente`: verificar duplicados por fecha
- **RN-29:** Generar advertencias (no errores críticos) para duplicados

---

### **7. Cargar Calificaciones (Procesar e Insertar)**

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
      "total_procesados": 25,
      "insertados_exitosamente": 25,
      "omitidos": 3
    },
    "alertas_generadas": {
      "total": 5,
      "bajo_rendimiento": 5,
      "estudiantes_afectados": [
        {
          "codigo_estudiante": "P3008",
          "nombre": "Pedro Gómez",
          "calificacion": 9.5,
          "apoderado": {
            "nombre": "Rosa Gómez",
            "telefono": "+51923456789"
          },
          "notificacion_enviada": true
        }
      ]
    },
    "fecha_carga": "2025-02-10T14:30:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
  }
}
```

#### **Response Errors:**
- **404 Not Found - Validación no existe:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_NOT_FOUND",
    "message": "Validación con ID val_cal_999 no existe o expiró"
  }
}
```

- **400 Bad Request - No hay registros válidos:**
```json
{
  "success": false,
  "error": {
    "code": "NO_VALID_RECORDS",
    "message": "No hay registros válidos para procesar"
  }
}
```

### **Reglas de Negocio:**
- **RN-30:** Insertar en `evaluaciones` con estado `'preliminar'`
- **RN-31:** Calcular `calificacion_letra` automáticamente (AD/A/B/C)
- **RN-32:** Registrar `fecha_evaluacion` del archivo
- **RN-33:** Registrar `registrado_por = usuario_actual_id`
- **RN-34:** Si `calificacion_numerica < 11`: generar alerta de bajo rendimiento
- **RN-35:** Enviar notificaciones a apoderados afectados (WhatsApp + plataforma)
- **RN-36:** Transacción atómica: si falla un insert, rollback completo

---

### **8. Descargar Reporte de Errores (TXT)**

**Endpoint:** `GET /calificaciones/reporte-errores/{report_id}`
**Descripción:** Descarga archivo TXT con errores detallados  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Response Success (200):**
```
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="Errores_Calificaciones_Matematicas_3Primaria_T1_10022025.txt"

REPORTE DE ERRORES - CARGA DE CALIFICACIONES
====================================================
Curso: Matemáticas - 3° de Primaria
Trimestre: 1
Componente: Examen (Única - 40%)
Fecha de Evaluación: 2025-02-10
Usuario: Ana María Rodríguez Vega (Docente)
Fecha de Validación: 10/02/2025 14:15 PM

====================================================
ERRORES DETECTADOS: 3
====================================================

Fila 8: Código P3005 - Carlos Ruiz Torres
❌ Calificación inválida: "25" (debe estar entre 0 y 20)

Fila 15: Código P3012 - Ana Soto García
❌ Calificación vacía (campo obligatorio)

Fila 20: Código P3040 - Estudiante Inexistente
❌ Estudiante no encontrado en el curso seleccionado

====================================================
ADVERTENCIAS: 1
====================================================

⚠️ Ya existe evaluación única para 2 estudiantes: P3001, P3002
   Si intenta cargar nuevamente, estos registros se omitirán.

====================================================
RECOMENDACIONES
====================================================
1. Corrija los errores indicados en el archivo original
2. No modifique la estructura de columnas
3. Asegúrese de que todos los códigos de estudiante sean correctos
4. Vuelva a subir el archivo corregido

Para soporte técnico, contacte al administrador del sistema.
```

### **Reglas de Negocio:**
- **RN-37:** Archivo generado automáticamente al validar
- **RN-38:** Almacenamiento temporal (24 horas)
- **RN-39:** Encoding UTF-8 para compatibilidad
- **RN-40:** Incluir contexto completo de la carga

---

## **SECCIÓN 3: CARGA DE ASISTENCIA**

### **9. Verificar Registro Existente de Asistencia**

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
    "total_estudiantes_registrados": 28,
    "estadisticas": {
      "presente": 25,
      "tardanza": 2,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 1
    },
    "fecha_registro": "2025-02-10T08:30:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
  }
}
```

#### **Response Success (200) - No existe:**
```json
{
  "success": true,
  "data": {
    "existe_registro": false,
    "fecha": "2025-02-11",
    "nivel_grado": {
      "nivel": "Primaria",
      "grado": "3"
    },
    "total_estudiantes": 28,
    "mensaje": "No hay registro de asistencia para esta fecha"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Fecha futura:**
```json
{
  "success": false,
  "error": {
    "code": "FUTURE_DATE_NOT_ALLOWED",
    "message": "No se puede verificar asistencia para fechas futuras"
  }
}
```

### **Reglas de Negocio:**
- **RN-41:** Solo fechas pasadas o actual
- **RN-42:** Verificar por `nivel_grado_id + fecha + año_academico`
- **RN-43:** Si existe, mostrar estadísticas de estados
- **RN-44:** Permitir reemplazo solo con confirmación del usuario

---

### **10. Generar Plantilla de Asistencia**

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

#### **Estructura del Excel Generado:**

**Hoja 1: "Asistencia"**
- **Celda A1:** `fecha_asistencia` (prellenada con fecha seleccionada - formato YYYY-MM-DD)
- **Fila 3 (Headers):**
  - Columna A: `codigo_estudiante`
  - Columna B: `nombre_completo`
  - Columna C: `estado` (dropdown)
  - Columna D: `hora_llegada` (opcional, formato HH:MM)
  - Columna E: `justificacion` (opcional)
- **Filas 4+:** Datos de estudiantes prellenados
- **Formato:**
  - Columnas A y B: Bloqueadas
  - Columna C: Dropdown con valores {Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada}
  - Formato condicional en C: Verde (Presente), Amarillo (Tardanza), Azul (Permiso), Naranja (FJ), Rojo (FI)
  - Columna D: Formato de hora (HH:MM)
  - Columna E: Texto libre (max 200 caracteres)

**Hoja 2: "Instrucciones"**
- **Sección "Estados de Asistencia":**
  - Tabla con: Estado | Abreviatura | Descripción | Campos Adicionales
  - Presente | P | Asistencia completa y puntual | Ninguno
  - Tardanza | T | Llegada fuera de horario | Hora de llegada (obligatoria)
  - Permiso | PE | Ausencia autorizada previamente | Justificación (opcional)
  - Falta Justificada | FJ | Ausencia con justificación posterior | Justificación (recomendada)
  - Falta Injustificada | FI | Ausencia sin justificación válida | Ninguno
- **Sección "Formato de Hora":**
  - Explicación: "Usar formato 24 horas HH:MM (ej: 08:15, 14:30)"
  - Horario válido: 06:00 a 18:00
- **Sección "Advertencias":**
  - ⚠️ Un estado por estudiante
  - ⚠️ Hora solo para Tardanzas
  - ⚠️ No modificar códigos de estudiante ni fecha
- **Sección "Ejemplos":**
  - 5 ejemplos visuales (uno por cada estado)

#### **Response Errors:**
- **400 Bad Request - Fecha futura:**
```json
{
  "success": false,
  "error": {
    "code": "FUTURE_DATE_NOT_ALLOWED",
    "message": "No se puede generar plantilla para fechas futuras"
  }
}
```

- **404 Not Found - Nivel/grado sin estudiantes:**
```json
{
  "success": false,
  "error": {
    "code": "NO_STUDENTS_FOUND",
    "message": "No hay estudiantes activos en Primaria - 3° para el año 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-45:** Solo fechas pasadas o actual
- **RN-46:** Incluir todos los estudiantes activos del grado
- **RN-47:** Nombre de archivo incluye nivel, grado y fecha
- **RN-48:** Fecha prellenada en celda A1 (validación backend)

---

### **11. Validar Archivo de Asistencia**

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
      "total_filas": 28,
      "validos": 25,
      "con_errores": 3
    },
    "desglose_por_estado": {
      "presente": 23,
      "tardanza": 2,
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
      },
      {
        "fila": 5,
        "codigo_estudiante": "P3002",
        "nombre_completo": "Luis Alberto Fernández Soto",
        "estado": "tardanza",
        "hora_llegada": "08:15",
        "justificacion": null
      }
    ],
    "registros_con_errores": [
      {
        "fila": 10,
        "codigo_estudiante": "P3009",
        "nombre_completo": "Carlos Ruiz Torres",
        "errores": [
          {
            "campo": "estado",
            "valor": "Ausente",
            "mensaje": "Estado inválido. Valores válidos: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada"
          }
        ]
      },
      {
        "fila": 15,
        "codigo_estudiante": "P3014",
        "nombre_completo": "Ana García López",
        "errores": [
          {
            "campo": "hora_llegada",
            "valor": "25:00",
            "mensaje": "Formato de hora inválido. Formato correcto: HH:MM (06:00-18:00)"
          }
        ]
      },
      {
        "fila": 20,
        "codigo_estudiante": "P3019",
        "nombre_completo": "Pedro Soto Díaz",
        "errores": [
          {
            "campo": "hora_llegada",
            "valor": "08:30",
            "mensaje": "Hora de llegada especificada pero estado no es 'Tardanza'"
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
    "archivo_errores_url": "/asistencias/reporte-errores/{report_id}"
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Fecha no coincide:**
```json
{
  "success": false,
  "error": {
    "code": "DATE_MISMATCH",
    "message": "La fecha en el archivo (2025-02-11) no coincide con la fecha seleccionada (2025-02-10)"
  }
}
```

- **400 Bad Request - Fecha fuera de año académico:**
```json
{
  "success": false,
  "error": {
    "code": "DATE_OUT_OF_ACADEMIC_YEAR",
    "message": "La fecha 2024-12-15 está fuera del año académico 2025"
  }
}
```

### **Reglas de Negocio:**
- **RN-49:** Validar que `fecha_asistencia` en archivo coincida con seleccionada
- **RN-50:** Estados válidos (case-insensitive): Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada
- **RN-51:** `hora_llegada` opcional solo si estado = "Tardanza" (formato HH:MM, rango 06:00-18:00)
- **RN-52:** `justificacion` opcional (max 200 caracteres)
- **RN-53:** Detectar duplicados de `codigo_estudiante` en archivo
- **RN-54:** Verificar que no existan registros previos para misma fecha
- **RN-55:** Fecha debe estar dentro del año académico

---

### **12. Cargar Asistencia (Procesar e Insertar)**

**Endpoint:** `POST /asistencias/cargar`  
**Descripción:** Inserta registros de asistencia en base de datos  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Request Body:**
```json
{
  "validacion_id": "val_asi_20250210_001",
  "procesar_solo_validos": true,
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
      "total_procesados": 25,
      "insertados_exitosamente": 25,
      "omitidos": 3
    },
    "desglose_por_estado": {
      "presente": 23,
      "tardanza": 2,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 0
    },
    "alertas_generadas": {
      "total": 2,
      "tardanzas": 2,
      "faltas_injustificadas": 0,
      "patrones_criticos": 0,
      "confirmaciones_presencia": 23,
      "estudiantes_afectados": [
        {
          "codigo_estudiante": "P3002",
          "nombre": "Luis Alberto Fernández Soto",
          "tipo_alerta": "tardanza",
          "hora_llegada": "08:15",
          "apoderado": {
            "nombre": "Carmen Rosa Soto Díaz",
            "telefono": "+51923456789"
          },
          "notificacion_enviada": true
        },
        {
          "codigo_estudiante": "P3005",
          "nombre": "Pedro Gómez Torres",
          "tipo_alerta": "tardanza",
          "hora_llegada": "08:20",
          "apoderado": {
            "nombre": "Rosa Gómez Vega",
            "telefono": "+51987654321"
          },
          "notificacion_enviada": true
        }
      ]
    },
    "fecha_carga": "2025-02-10T08:45:00Z",
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    }
  }
}
```

#### **Response Errors:**
- **404 Not Found - Validación no existe:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_NOT_FOUND",
    "message": "Validación con ID val_asi_999 no existe o expiró"
  }
}
```

- **409 Conflict - Registro existente sin confirmación:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_RECORD_EXISTS",
    "message": "Ya existe registro de asistencia para esta fecha. Use reemplazar_existente: true para sobrescribir"
  }
}
```

### **Reglas de Negocio:**
- **RN-56:** Insertar en `asistencias` con estados normalizados (minúsculas con guiones bajos)
- **RN-57:** Registrar `fecha`, `año_academico`, `registrado_por`, `fecha_registro`
- **RN-58:** **Alertas automáticas por Tardanza:** generar alerta inmediata + notificación WhatsApp/plataforma
- **RN-59:** **Alertas por Falta Injustificada:** generar alerta con solicitud de justificación
- **RN-60:** **Confirmación por Presente:** generar notificación positiva simple
- **RN-61:** **Patrón crítico:** detectar 3+ faltas injustificadas consecutivas → alerta crítica
- **RN-62:** **Patrón preventivo:** detectar 5+ tardanzas en un trimestre → alerta preventiva
- **RN-63:** Si `reemplazar_existente = true`: eliminar registros previos y insertar nuevos
- **RN-64:** Transacción atómica: rollback completo si falla algún insert

---

### **13. Descargar Reporte de Errores de Asistencia (TXT)**

**Endpoint:** `GET /asistencias/reporte-errores/{report_id}`
**Descripción:** Descarga archivo TXT con errores detallados  
**Autenticación:** Bearer token (Roles: Docente, Director)  

#### **Response Success (200):**
```
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename="Errores_Asistencia_3Primaria_10022025.txt"

REPORTE DE ERRORES - CARGA DE ASISTENCIA
====================================================
Nivel/Grado: 3° de Primaria
Fecha: 10/02/2025 (Lunes)
Usuario: Ana María Rodríguez Vega (Docente)
Fecha de Validación: 10/02/2025 08:30 AM

====================================================
ERRORES DETECTADOS: 3
====================================================

Fila 10: Código P3009 - Carlos Ruiz Torres
❌ Estado inválido: "Ausente"
   Valores válidos: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada

Fila 15: Código P3014 - Ana García López
❌ Formato de hora inválido: "25:00"
   Formato correcto: HH:MM (06:00-18:00)

Fila 20: Código P3019 - Pedro Soto Díaz
❌ Hora de llegada especificada pero estado no es "Tardanza"
   La hora de llegada solo debe registrarse para tardanzas

====================================================
ADVERTENCIAS: 1
====================================================

⚠️ Ya existe registro de asistencia para esta fecha (10/02/2025)
   Registrado por: Ana María Rodríguez Vega el 10/02/2025 08:00 AM
   Si carga nuevamente, deberá confirmar el reemplazo de datos.

====================================================
RECOMENDACIONES
====================================================
1. Corrija los errores indicados en el archivo original
2. Use el dropdown de estados para evitar errores de escritura
3. Registre hora de llegada solo para tardanzas
4. No modifique la fecha en la celda A1
5. Vuelva a subir el archivo corregido

Para soporte técnico, contacte al administrador del sistema.
```

### **Reglas de Negocio:**
- **RN-65:** Archivo generado automáticamente al validar
- **RN-66:** Almacenamiento temporal (24 horas)
- **RN-67:** Encoding UTF-8 para compatibilidad
- **RN-68:** Incluir contexto completo (nivel, grado, fecha, día de la semana)

---

### **14. Obtener Estadísticas de Asistencia del Día**

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
      "total_estudiantes": 28
    },
    "estadisticas": {
      "total_registros": 28,
      "presente": {
        "cantidad": 25,
        "porcentaje": 89.29
      },
      "tardanza": {
        "cantidad": 2,
        "porcentaje": 7.14,
        "promedio_minutos_retraso": 18
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
        "cantidad": 1,
        "porcentaje": 3.57
      }
    },
    "alertas_generadas": {
      "tardanzas": 2,
      "faltas_injustificadas": 1,
      "patrones_criticos": 0
    },
    "registrado_por": {
      "id": "usr_doc_001",
      "nombre": "Ana María Rodríguez Vega"
    },
    "fecha_registro": "2025-02-10T08:00:00Z"
  }
}
```

#### **Response Errors:**
- **404 Not Found - Sin registro:**
```json
{
  "success": false,
  "error": {
    "code": "NO_ATTENDANCE_RECORD",
    "message": "No hay registro de asistencia para 3ro de Primaria en la fecha 2025-02-10"
  }
}
```

### **Reglas de Negocio:**
- **RN-69:** Calcular porcentajes con 2 decimales
- **RN-70:** Para tardanzas, calcular promedio de minutos de retraso
- **RN-71:** Incluir conteo de alertas generadas
- **RN-72:** Mostrar información del usuario que registró

---

## **SECCIÓN 4: CENTRO DE PLANTILLAS**

### **15. Listar Tipos de Plantillas Disponibles**

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

### **16. Generar Plantilla de Calificaciones (Centro de Plantillas)**

**Endpoint:** `POST /plantillas/calificaciones`  
**Descripción:** Genera plantilla desde Centro de Plantillas  
**Autenticación:** Bearer token (Roles: Docente, Director)  

*(Misma funcionalidad que `/calificaciones/plantilla` pero con acceso desde Centro de Plantillas)*

---

### **17. Generar Plantilla de Asistencia (Centro de Plantillas)**

**Endpoint:** `POST /plantillas/asistencia`  
**Descripción:** Genera plantilla desde Centro de Plantillas  
**Autenticación:** Bearer token (Roles: Docente, Director)  

*(Misma funcionalidad que `/asistencias/plantilla` pero con acceso desde Centro de Plantillas)*

---

### **18. Obtener Guía de Uso de Plantilla**

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
      },
      {
        "id": "ejemplos_visuales",
        "titulo": "Ejemplos Visuales",
        "contenido": "Capturas de pantalla con anotaciones...",
        "imagenes": [
          "/guias/calificaciones/ejemplo1.png",
          "/guias/calificaciones/ejemplo2.png"
        ],
        "orden": 2
      },
      {
        "id": "errores_comunes",
        "titulo": "Errores Comunes",
        "contenido": [
          {
            "error": "Modificar el orden de las columnas",
            "solucion": "Usa la plantilla sin cambios estructurales"
          },
          {
            "error": "Agregar columnas adicionales",
            "solucion": "Solo llena las columnas existentes"
          }
        ],
        "orden": 3
      },
      {
        "id": "preguntas_frecuentes",
        "titulo": "Preguntas Frecuentes",
        "contenido": [
          {
            "pregunta": "¿Puedo usar la misma plantilla para varios trimestres?",
            "respuesta": "No, descarga una plantilla nueva para cada trimestre."
          }
        ],
        "orden": 4
      }
    ],
    "version": "1.0",
    "fecha_actualizacion": "2025-02-01"
  }
}
```

---

### **19. Descargar Guía en PDF**

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

## **CÓDIGOS DE ERROR ESPECÍFICOS DEL MÓDULO**

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `NO_COURSE_ASSIGNMENTS` | Docente sin asignaciones activas | 404 |
| `COURSE_ACCESS_DENIED` | Sin permisos para acceder al curso | 403 |
| `NIVEL_GRADO_NOT_FOUND` | Nivel/grado no existe | 404 |
| `STRUCTURE_NOT_CONFIGURED` | Estructura de evaluación no definida | 404 |
| `COMPONENT_NOT_FOUND` | Componente de evaluación no existe | 404 |
| `INVALID_TEMPLATE_STRUCTURE` | Estructura de plantilla incorrecta | 400 |
| `COMPONENT_MISMATCH` | Componente en archivo no coincide | 400 |
| `INVALID_DATE_FORMAT` | Formato de fecha inválido | 400 |
| `DATE_MISMATCH` | Fecha en archivo no coincide | 400 |
| `FUTURE_DATE_NOT_ALLOWED` | No se permiten fechas futuras | 400 |
| `DATE_OUT_OF_ACADEMIC_YEAR` | Fecha fuera del año académico | 400 |
| `VALIDATION_NOT_FOUND` | Validación no existe o expiró | 404 |
| `NO_VALID_RECORDS` | No hay registros válidos para procesar | 400 |
| `NO_STUDENTS_FOUND` | Sin estudiantes activos en el curso | 404 |
| `DUPLICATE_RECORD_EXISTS` | Registro duplicado existe | 409 |
| `NO_ATTENDANCE_RECORD` | Sin registro de asistencia | 404 |
| `INVALID_TIME_FORMAT` | Formato de hora inválido | 400 |
| `TIME_OUT_OF_RANGE` | Hora fuera de horario escolar | 400 |
| `MISSING_REQUIRED_FIELDS` | Campos requeridos faltantes | 400 |
| `MISSING_PARAMETERS` | Parámetros de query faltantes | 400 |
| `INVALID_PARAMETERS` | Parámetros inválidos | 400 |

---

## **MIDDLEWARE Y VALIDACIONES**

### **Middleware de Validación de Contexto:**
```javascript
// validateContext.js
const validateCourseContext = async (req, res, next) => {
  const { curso_id, nivel_grado_id } = req.body || req.query;
  
  if (!curso_id || !nivel_grado_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAMETERS',
        message: 'curso_id y nivel_grado_id son requeridos'
      }
    });
  }
  
  // Validar acceso según rol
  const userRole = req.user.rol;
  if (userRole === 'docente') {
    const hasAccess = await checkDocenteCourseAccess(req.user.id, curso_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'COURSE_ACCESS_DENIED',
          message: 'No tiene permisos para acceder a este curso'
        }
      });
    }
  }
  
  next();
};
```

### **Validaciones de Calificaciones:**
```javascript
// Validación de calificación numérica
const validateCalificacion = (calificacion) => {
  const regex = /^\d{1,2}(\.\d{1,2})?$/;
  if (!regex.test(calificacion)) {
    throw new Error('Formato de calificación inválido');
  }
  
  const valor = parseFloat(calificacion);
  if (valor < 0 || valor > 20) {
    throw new Error('Calificación fuera de rango (0-20)');
  }
  
  return valor;
};

// Conversión automática a letra
const convertirALetra = (calificacion) => {
  if (calificacion >= 18) return 'AD';
  if (calificacion >= 14) return 'A';
  if (calificacion >= 11) return 'B';
  return 'C';
};

// Validación de componente único
const validateComponenteUnico = async (estudiante_id, curso_id, componente_id, trimestre, año) => {
  const existe = await db.evaluaciones.findOne({
    where: {
      estudiante_id,
      curso_id,
      estructura_evaluacion_id: componente_id,
      trimestre,
      año_academico: año
    }
  });
  
  if (existe) {
    throw new Error('Ya existe evaluación única para este estudiante en este componente y trimestre');
  }
};
```

### **Validaciones de Asistencia:**
```javascript
// Validación de estado
const validateEstado = (estado) => {
  const estadosValidos = ['presente', 'tardanza', 'permiso', 'falta_justificada', 'falta_injustificada'];
  const estadoNormalizado = estado.toLowerCase().replace(/\s+/g, '_');
  
  if (!estadosValidos.includes(estadoNormalizado)) {
    throw new Error(`Estado inválido: ${estado}. Valores válidos: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada`);
  }
  
  return estadoNormalizado;
};

// Validación de hora
const validateHora = (hora, estado) => {
  if (estado !== 'tardanza' && hora) {
    throw new Error('Hora de llegada solo debe especificarse para tardanzas');
  }
  
  if (estado === 'tardanza' && !hora) {
    throw new Error('Hora de llegada es obligatoria para tardanzas');
  }
  
  if (hora) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(hora)) {
      throw new Error('Formato de hora inválido. Use HH:MM (ej: 08:15)');
    }
    
    const [horas, minutos] = hora.split(':').map(Number);
    if (horas < 6 || (horas === 18 && minutos > 0) || horas > 18) {
      throw new Error('Hora fuera del horario escolar (06:00-18:00)');
    }
  }
  
  return hora;
};

// Validación de fecha
const validateFecha = (fecha, año_academico) => {
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  
  if (fechaObj > hoy) {
    throw new Error('No se permiten fechas futuras');
  }
  
  const añoFecha = fechaObj.getFullYear();
  if (añoFecha !== año_academico) {
    throw new Error(`La fecha está fuera del año académico ${año_academico}`);
  }
  
  return fecha;
};
```

---

## **ESTRUCTURA DE BASE DE DATOS RELACIONADA**

### **Tablas Principales:**
- `usuarios`: Docentes y director
- `estudiantes`: Estudiantes a evaluar
- `cursos`: Cursos académicos
- `nivel_grado`: Niveles y grados
- `asignaciones_docente_curso`: Asignaciones de docentes
- `estructura_evaluacion`: Componentes de evaluación
- `evaluaciones`: Calificaciones registradas
- `asistencias`: Registros de asistencia
- `notificaciones`: Alertas generadas

### **Índices Recomendados:**
```sql
-- Evaluaciones
CREATE INDEX idx_evaluaciones_estudiante_curso ON evaluaciones(estudiante_id, curso_id, trimestre, año_academico);
CREATE INDEX idx_evaluaciones_componente ON evaluaciones(estructura_evaluacion_id, año_academico);
CREATE INDEX idx_evaluaciones_fecha ON evaluaciones(fecha_evaluacion, estado);
CREATE INDEX idx_evaluaciones_calificacion ON evaluaciones(calificacion_numerica); -- Para alertas

-- Asistencias
CREATE INDEX idx_asistencias_estudiante_fecha ON asistencias(estudiante_id, fecha, año_academico);
CREATE INDEX idx_asistencias_estado ON asistencias(estado, fecha);
CREATE INDEX idx_asistencias_fecha_nivel ON asistencias(fecha, año_academico);

-- Cursos y Asignaciones
CREATE INDEX idx_asignaciones_docente ON asignaciones_docente_curso(docente_id, año_academico, estado_activo);
CREATE INDEX idx_asignaciones_curso ON asignaciones_docente_curso(curso_id, año_academico);
CREATE INDEX idx_cursos_nivel_grado ON cursos(nivel_grado_id, año_academico, estado_activo);

-- Estudiantes
CREATE INDEX idx_estudiantes_codigo ON estudiantes(codigo_estudiante);
CREATE INDEX idx_estudiantes_nivel_grado ON estudiantes(nivel_grado_id, año_academico, estado_matricula);
CREATE INDEX idx_estudiantes_apoderado ON estudiantes(apoderado_principal_id);
```

## **CONSIDERACIONES DE SEGURIDAD**

1. **Autenticación JWT obligatoria:** Token válido en header `Authorization`
2. **Autorización por rol:**
   - Docente: solo cursos asignados
   - Director: acceso completo
3. **Validación de archivos:**
   - MIME type verificado
   - Tamaño máximo: 10MB (calificaciones), 5MB (asistencia)
   - Sanitización contra inyección de fórmulas Excel
4. **Rate limiting:**
   - Validación de archivos: 10 requests/minuto
   - Carga de datos: 5 requests/minuto
   - Generación de plantillas: 20 requests/minuto
5. **Protección de datos sensibles:**
   - No exponer `componente_id` en respuestas innecesariamente
   - Logs sanitizados sin información personal
6. **Transacciones atómicas:** Rollback completo si falla inserción

---

## **CONSIDERACIONES DE PERFORMANCE**

1. **Procesamiento asíncrono:**
   - Archivos >50 registros: background jobs con progress polling
   - Generación de alertas: cola de mensajes
2. **Caching:**
   - Estructura de evaluación: 24 horas
   - Lista de estudiantes por curso: 1 hora
   - Cursos asignados: 1 hora
3. **Optimización de queries:**
   - Eager loading de relaciones (estudiantes + apoderados)
   - Paginación en listados grandes
4. **Límites de tiempo:**
   - Validación de archivo: 2 minutos
   - Carga de datos: 5 minutos
   - Generación de plantilla: 30 segundos
5. **Compresión:** Gzip para respuestas >1KB
6. **Batch operations:** Inserción masiva en chunks de 50 registros

---

## **TESTING Y VALIDACIÓN**

### **Casos de Prueba Críticos:**

**Calificaciones:**
1. Cargar calificación < 11 (debe generar alerta)
2. Componente único duplicado (debe rechazar)
3. Componente recurrente con misma fecha (debe advertir)
4. Archivo con estructura incorrecta (debe rechazar)
5. Calificación fuera de rango (debe marcar error)

**Asistencia:**
1. Tardanza sin hora de llegada (debe marcar error)
2. Hora de llegada fuera de horario (debe rechazar)
3. 3 faltas injustificadas consecutivas (debe generar alerta crítica)
4. 5 tardanzas en trimestre (debe generar alerta preventiva)
5. Fecha futura (debe rechazar)

**Alertas:**
1. Verificar envío dual (plataforma + WhatsApp)
2. Confirmar contenido de mensajes
3. Validar que no se dupliquen alertas

