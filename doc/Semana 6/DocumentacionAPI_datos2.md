# **Documentación API REST - Módulo de Datos Académicos (Visualización - Padres)**

**Plataforma de Comunicación y Seguimiento Académico**  
**Institución:** I.E.P. Las Orquídeas  
**Fecha:** Semanas 6-7 - 2025  
**Versión:** 1.0 - Consulta de Calificaciones y Asistencia  

---

## **Base URL y Configuración**

- **Base URL (local):** `http://localhost:3000`
- **Base URL (producción):** `https://api.orquideas.edu.pe`

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

### **1. Obtener Calificaciones Completas del Estudiante**

**Endpoint:** `GET /calificaciones/estudiante/{estudiante_id}`  
**Descripción:** Obtiene todas las calificaciones del estudiante filtradas por año, trimestre, curso y componente  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Path Parameters:**
```
{estudiante_id} = ID del estudiante
```

#### **Query Parameters:**
```
?año=2025                    # Año académico (requerido)
&trimestre=1                 # Trimestre (1, 2 o 3) (requerido)
&curso_id=cur_001            # ID del curso (requerido)
&componente_id=eval_001      # ID del componente de evaluación (requerido)
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
    "curso": {
      "id": "cur_001",
      "nombre": "Matemáticas"
    },
    "componente": {
      "id": "eval_001",
      "nombre_item": "Examen",
      "peso_porcentual": 40.00,
      "tipo_evaluacion": "unica"
    },
    "trimestre": 1,
    "año_academico": 2025,
    "evaluaciones": [
      {
        "id": "eval_log_001",
        "fecha_evaluacion": "2025-03-15",
        "fecha_evaluacion_legible": "15 de marzo de 2025",
        "calificacion_numerica": 16.5,
        "calificacion_letra": "A",
        "estado": "preliminar",
        "fecha_registro": "2025-03-15T14:30:00Z",
        "registrado_por": {
          "nombre": "Ana María Rodríguez Vega"
        }
      }
    ],
    "total_evaluaciones": 1,
    "promedio_componente": 16.5,
    "hay_notas_preliminares": true
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
    "message": "No hay calificaciones registradas para Examen en el Trimestre 1"
  }
}
```

### **Reglas de Negocio:**
- **RN-01:** Validar que padre está vinculado al estudiante en `relaciones_familiares`
- **RN-02:** Solo mostrar evaluaciones del año/trimestre seleccionado
- **RN-03:** Ordenar evaluaciones por fecha descendente (más reciente primero)
- **RN-04:** Calcular promedio en tiempo real: suma / cantidad
- **RN-05:** Convertir fechas a formato legible español

---

### **2. Calcular Promedio de Componente en Tiempo Real**

**Endpoint:** `GET /calificaciones/estudiante/{estudiante_id}/promedio`  
**Descripción:** Calcula el promedio actual de un componente específico  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?curso_id=cur_001            # ID del curso (requerido)
&componente_id=eval_002      # ID del componente (requerido)
&trimestre=1                 # Trimestre (requerido)
&año=2025                    # Año académico (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "componente": {
      "id": "eval_002",
      "nombre": "Participación",
      "tipo": "recurrente"
    },
    "total_evaluaciones": 5,
    "suma_calificaciones": 73.0,
    "promedio": 14.6,
    "promedio_letra": "A",
    "estado": "preliminar",
    "mensaje": "Este promedio es preliminar y puede cambiar hasta el cierre del trimestre"
  }
}
```

### **Reglas de Negocio:**
- **RN-06:** Para componentes únicos: promedio = calificación única
- **RN-07:** Para componentes recurrentes: promedio = suma / cantidad
- **RN-08:** Redondear a 2 decimales
- **RN-09:** Estado = "preliminar" si al menos una nota es preliminar

---

### **3. Obtener Cursos del Estudiante**

**Endpoint:** `GET /cursos/estudiante/{estudiante_id}`  
**Descripción:** Lista los cursos matriculados del estudiante en un año académico  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?año=2025  # Año académico (default: año actual)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante_id": "est_001",
    "año_academico": 2025,
    "cursos": [
      {
        "id": "cur_001",
        "codigo_curso": "CP3001",
        "nombre": "Matemáticas",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3"
        },
        "docente_asignado": {
          "nombre": "Ana María Rodríguez Vega"
        },
        "tiene_calificaciones": true
      },
      {
        "id": "cur_002",
        "codigo_curso": "CP3002",
        "nombre": "Comunicación",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3"
        },
        "docente_asignado": {
          "nombre": "Carlos Méndez Torres"
        },
        "tiene_calificaciones": true
      }
    ],
    "total_cursos": 8
  }
}
```

### **Reglas de Negocio:**
- **RN-10:** Solo mostrar cursos del año académico especificado
- **RN-11:** Incluir flag `tiene_calificaciones` para filtrar en frontend
- **RN-12:** Ordenar alfabéticamente por nombre de curso

---

### **4. Exportar Boleta de Notas en PDF**

**Endpoint:** `GET /calificaciones/estudiante/{estudiante_id}/export`  
**Descripción:** Genera boleta de notas en formato PDF con Puppeteer  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?año=2025                # Año académico (requerido)
&formato=pdf             # Formato (solo pdf)
&curso_id=cur_001        # ID del curso específico (opcional)
&componente_id=eval_001  # ID del componente (opcional)
&trimestre=1             # Trimestre (opcional)
```

#### **Response Success (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Boleta_MariaPerez_Matematicas_T1_2025.pdf"

[Binary PDF File]
```

#### **Contenido del PDF:**
- Logo institucional (header)
- Datos del estudiante (nombre, código, grado)
- Datos del curso y trimestre
- Tabla de calificaciones con componentes y promedios
- Promedio ponderado del trimestre
- Estado: Preliminar/Final
- Fecha de generación
- Firma digital (opcional)

### **Reglas de Negocio:**
- **RN-13:** Solo generar PDF si hay al menos una calificación registrada
- **RN-14:** Incluir marca de agua "PRELIMINAR" si hay notas no oficiales
- **RN-15:** Formato institucional estandarizado
- **RN-16:** Nombre de archivo descriptivo y único

---

## **SECCIÓN 2: ASISTENCIA (PADRES)**

### **5. Obtener Asistencia del Estudiante**

**Endpoint:** `GET /asistencias/estudiante/{estudiante_id}`  
**Descripción:** Obtiene todos los registros de asistencia del estudiante  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?año=2025           # Año académico (requerido)
&mes=3              # Mes específico (1-12) (mutuamente excluyente con trimestre)
O
?año=2025           # Año académico (requerido)
&trimestre=1        # Trimestre (1, 2 o 3) (mutuamente excluyente con mes)
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
      "mes": 3,
      "mes_nombre": "Marzo",
      "trimestre": null
    },
    "registros": [
      {
        "id": "asist_001",
        "fecha": "2025-03-01",
        "fecha_legible": "1 de marzo de 2025",
        "dia_semana": "Lunes",
        "estado": "presente",
        "hora_llegada": null,
        "justificacion": null,
        "fecha_registro": "2025-03-01T08:00:00Z",
        "registrado_por": {
          "nombre": "Ana María Rodríguez Vega"
        }
      },
      {
        "id": "asist_002",
        "fecha": "2025-03-02",
        "fecha_legible": "2 de marzo de 2025",
        "dia_semana": "Martes",
        "estado": "tardanza",
        "hora_llegada": "08:15",
        "justificacion": null,
        "fecha_registro": "2025-03-02T08:15:00Z",
        "registrado_por": {
          "nombre": "Ana María Rodríguez Vega"
        }
      },
      {
        "id": "asist_003",
        "fecha": "2025-03-03",
        "fecha_legible": "3 de marzo de 2025",
        "dia_semana": "Miércoles",
        "estado": "falta_injustificada",
        "hora_llegada": null,
        "justificacion": null,
        "fecha_registro": "2025-03-03T18:00:00Z",
        "registrado_por": {
          "nombre": "Ana María Rodríguez Vega"
        }
      }
    ],
    "total_registros": 20,
    "resumen": {
      "presente": 17,
      "tardanza": 2,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 1
    }
  }
}
```

#### **Response Errors:**
- **400 Bad Request - Parámetros mutuamente excluyentes:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "No puede especificar 'mes' y 'trimestre' simultáneamente. Use solo uno."
  }
}
```

### **Reglas de Negocio:**
- **RN-17:** Validar que padre está vinculado al estudiante
- **RN-18:** `mes` y `trimestre` son mutuamente excluyentes
- **RN-19:** Si no se especifica mes ni trimestre, usar mes actual
- **RN-20:** Convertir fechas a formato legible en español
- **RN-21:** Incluir nombre del día de la semana
- **RN-22:** Ordenar por fecha ascendente (más antigua primero)

---

### **6. Obtener Estadísticas de Asistencia**

**Endpoint:** `GET /asistencias/estudiante/{estudiante_id}/estadisticas`  
**Descripción:** Calcula estadísticas de asistencia para un rango de fechas  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?fecha_inicio=2025-03-01  # Fecha de inicio (YYYY-MM-DD) (requerido)
&fecha_fin=2025-03-31     # Fecha de fin (YYYY-MM-DD) (requerido)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "fecha_inicio": "2025-03-01",
      "fecha_fin": "2025-03-31",
      "dias_totales": 31,
      "dias_lectivos": 20,
      "dias_no_lectivos": 11
    },
    "registros": {
      "total": 20,
      "presente": 17,
      "tardanza": 2,
      "permiso": 0,
      "falta_justificada": 0,
      "falta_injustificada": 1,
      "sin_registro": 0
    },
    "porcentajes": {
      "asistencia_global": 95.00,
      "presente": 85.00,
      "tardanza": 10.00,
      "permiso": 0.00,
      "falta_justificada": 0.00,
      "falta_injustificada": 5.00
    },
    "alertas": [
      {
        "tipo": "tardanzas_acumuladas",
        "nivel": "advertencia",
        "mensaje": "Su hijo(a) ha acumulado 2 tardanzas en este período",
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

### **Reglas de Negocio:**
- **RN-23:** Porcentajes calculados sobre días lectivos, no días calendario
- **RN-24:** Asistencia global = (presente + tardanza + permiso + falta_justificada) / días_lectivos × 100
- **RN-25:** Generar alerta si faltas_injustificadas >= 3 consecutivas
- **RN-26:** Generar advertencia si tardanzas >= 5 en el período
- **RN-27:** Generar reconocimiento si asistencia >= 95%
- **RN-28:** Redondear porcentajes a 2 decimales

---

### **7. Obtener Días No Lectivos**

**Endpoint:** `GET /calendario/dias-no-lectivos`  
**Descripción:** Lista feriados y días no lectivos institucionales  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?año=2025  # Año académico (requerido)
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
        "tipo": "feriado_nacional",
        "descripcion": "Año Nuevo"
      },
      {
        "fecha": "2025-05-01",
        "tipo": "feriado_nacional",
        "descripcion": "Día del Trabajo"
      },
      {
        "fecha": "2025-07-28",
        "tipo": "feriado_nacional",
        "descripcion": "Fiestas Patrias"
      },
      {
        "fecha": "2025-07-29",
        "tipo": "feriado_nacional",
        "descripcion": "Fiestas Patrias"
      },
      {
        "fecha": "2025-08-30",
        "tipo": "feriado_nacional",
        "descripcion": "Santa Rosa de Lima"
      },
      {
        "fecha": "2025-10-08",
        "tipo": "feriado_nacional",
        "descripcion": "Combate de Angamos"
      },
      {
        "fecha": "2025-11-01",
        "tipo": "feriado_nacional",
        "descripcion": "Todos los Santos"
      },
      {
        "fecha": "2025-12-08",
        "tipo": "feriado_nacional",
        "descripcion": "Inmaculada Concepción"
      },
      {
        "fecha": "2025-12-25",
        "tipo": "feriado_nacional",
        "descripcion": "Navidad"
      },
      {
        "fecha": "2025-03-17",
        "tipo": "dia_institucional",
        "descripcion": "Aniversario Institucional"
      },
      {
        "fecha": "2025-07-15",
        "tipo": "vacaciones",
        "descripcion": "Inicio de Vacaciones de Medio Año"
      }
    ],
    "fines_de_semana_automaticos": true,
    "total_dias_no_lectivos": 11
  }
}
```

### **Reglas de Negocio:**
- **RN-29:** Incluir feriados nacionales oficiales del Perú
- **RN-30:** Incluir días institucionales configurados por el colegio
- **RN-31:** Fines de semana se marcan automáticamente (no requieren registro)
- **RN-32:** Ordenar por fecha ascendente

---

### **8. Exportar Reporte de Asistencia en PDF**

**Endpoint:** `GET /asistencias/estudiante/{estudiante_id}/export`  
**Descripción:** Genera reporte visual de asistencia con calendario  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?formato=pdf                  # Formato (solo pdf)
&fecha_inicio=2025-03-01      # Fecha de inicio (requerido)
&fecha_fin=2025-03-31         # Fecha de fin (requerido)
```

#### **Response Success (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Asistencia_MariaPerez_Marzo2025.pdf"

[Binary PDF File]
```

#### **Contenido del PDF:**
- Logo institucional
- Datos del estudiante
- Calendario visual del período con códigos de colores
- Leyenda de estados
- Tabla de estadísticas
- Gráfico de dona (distribución de estados)
- Alertas y reconocimientos
- Fecha de generación

### **Reglas de Negocio:**
- **RN-33:** Solo generar PDF si hay al menos un registro
- **RN-34:** Incluir calendario visual con colores institucionales
- **RN-35:** Formato institucional estandarizado
- **RN-36:** Nombre de archivo descriptivo y único

---

## **SECCIÓN 3: RESUMEN ACADÉMICO (PADRES)**

### **9. Obtener Resumen Académico Completo**

**Endpoint:** `GET /resumen-academico/estudiante/{estudiante_id}`  
**Descripción:** Resumen completo de calificaciones del estudiante  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?año=2025           # Año académico (requerido)
&trimestre=1        # Trimestre (1, 2, 3 o null para anual) (opcional)
```

#### **Response Success (200) - Vista Trimestral:**
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
    "año_academico": 2025,
    "trimestre": 1,
    "cursos": [
      {
        "id": "cur_001",
        "nombre": "Matemáticas",
        "formula_calculo": [
          {
            "componente_id": "eval_001",
            "nombre": "Examen",
            "peso": 40.00,
            "icono": "📊"
          },
          {
            "componente_id": "eval_002",
            "nombre": "Participación",
            "peso": 20.00,
            "icono": "✍️"
          },
          {
            "componente_id": "eval_003",
            "nombre": "Revisión de Cuaderno",
            "peso": 15.00,
            "icono": "📓"
          },
          {
            "componente_id": "eval_004",
            "nombre": "Revisión de Libro",
            "peso": 15.00,
            "icono": "📖"
          },
          {
            "componente_id": "eval_005",
            "nombre": "Comportamiento",
            "peso": 10.00,
            "icono": "😊"
          }
        ],
        "promedios_componentes": [
          {
            "componente": "Examen",
            "promedio": 16.0,
            "peso": 40.00,
            "subtotal": 6.40,
            "color": "verde"
          },
          {
            "componente": "Participación",
            "promedio": 14.6,
            "peso": 20.00,
            "subtotal": 2.92,
            "color": "verde"
          },
          {
            "componente": "Revisión de Cuaderno",
            "promedio": 15.2,
            "peso": 15.00,
            "subtotal": 2.28,
            "color": "verde"
          },
          {
            "componente": "Revisión de Libro",
            "promedio": 14.0,
            "peso": 15.00,
            "subtotal": 2.10,
            "color": "verde"
          },
          {
            "componente": "Comportamiento",
            "promedio": 18.0,
            "peso": 10.00,
            "subtotal": 1.80,
            "color": "verde"
          }
        ],
        "promedio_trimestre": 15.50,
        "promedio_letra": "A",
        "estado": "preliminar",
        "fecha_certificacion": null,
        "mensaje": "Este promedio es preliminar y puede cambiar hasta el cierre del trimestre"
      }
    ],
    "total_cursos": 8
  }
}
```

#### **Response Success (200) - Vista Anual:**
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
    "año_academico": 2025,
    "vista": "anual",
    "tabla_notas_finales": [
      {
        "curso_id": "cur_001",
        "curso_nombre": "Matemáticas",
        "trimestre_1": 15.50,
        "trimestre_2": 14.80,
        "trimestre_3": 16.20,
        "promedio_final": 15.50,
        "promedio_letra": "A",
        "estado": "aprobado",
        "estado_badge": "✅"
      },
      {
        "curso_id": "cur_002",
        "curso_nombre": "Comunicación",
        "trimestre_1": 15.20,
        "trimestre_2": 14.00,
        "trimestre_3": 15.80,
        "promedio_final": 15.00,
        "promedio_letra": "A",
        "estado": "aprobado",
        "estado_badge": "✅"
      },
      {
        "curso_id": "cur_003",
        "curso_nombre": "Ciencias",
        "trimestre_1": 13.50,
        "trimestre_2": 12.40,
        "trimestre_3": 14.20,
        "promedio_final": 13.37,
        "promedio_letra": "B",
        "estado": "aprobado",
        "estado_badge": "✅"
      },
      {
        "curso_id": "cur_004",
        "curso_nombre": "Historia",
        "trimestre_1": 10.50,
        "trimestre_2": 9.80,
        "trimestre_3": 11.20,
        "promedio_final": 10.50,
        "promedio_letra": "C",
        "estado": "desaprobado",
        "estado_badge": "❌"
      }
    ],
    "estadisticas": {
      "promedio_general": 13.59,
      "cursos_aprobados": 7,
      "cursos_desaprobados": 1,
      "total_cursos": 8,
      "mejor_curso": {
        "nombre": "Matemáticas",
        "promedio": 15.50
      },
      "curso_atencion": {
        "nombre": "Historia",
        "promedio": 10.50
      }
    }
  }
}
```

### **Reglas de Negocio:**
- **RN-37:** Si `trimestre` es null o no se especifica, retornar vista anual
- **RN-38:** Promedio trimestral = Σ (promedio_componente × peso / 100)
- **RN-39:** Promedio final anual = (T1 + T2 + T3) / 3
- **RN-40:** Estado aprobado si promedio >= 11
- **RN-41:** Color verde >= 14, amarillo 11-13, rojo < 11
- **RN-42:** Redondear todos los valores a 2 decimales

---

### **10. Exportar Boleta Institucional Anual en PDF**

**Endpoint:** `GET /resumen-academico/estudiante/{estudiante_id}/export`  
**Descripción:** Genera boleta oficial institucional con promedios finales  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?año=2025           # Año académico (requerido)
&formato=pdf        # Formato (solo pdf)
```

#### **Response Success (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Boleta_Oficial_MariaPerez_2025.pdf"

[Binary PDF File]
```

#### **Contenido del PDF:**
- Logo institucional grande (header)
- Título: "BOLETA DE CALIFICACIONES ANUAL"
- Datos del estudiante (nombre, código, grado, año)
- Tabla consolidada:
  * Columnas: Curso | T1 | T2 | T3 | Promedio Final | Estado
  * Filas: Un curso por fila
  * Colores según estado (aprobado verde, desaprobado rojo)
- Estadísticas generales:
  * Promedio general del año
  * Cursos aprobados/desaprobados
  * Mejor curso del año
- Escala de calificación:
  * AD: 18-20 (Logro Destacado)
  * A: 14-17 (Logro Esperado)
  * B: 11-13 (En Proceso)
  * C: 0-10 (En Inicio)
- Sección de observaciones (opcional)
- Firma digital del director
- Fecha de certificación
- Código QR de verificación (opcional)
- Footer: Datos institucionales

### **Reglas de Negocio:**
- **RN-43:** Solo generar PDF si hay al menos un trimestre con notas finales
- **RN-44:** Incluir marca de agua "NO OFICIAL" si hay trimestres pendientes
- **RN-45:** Formato institucional oficial estandarizado
- **RN-46:** Firma digital solo si todos los trimestres están cerrados
- **RN-47:** Nombre de archivo descriptivo: `Boleta_Oficial_{NombreEstudiante}_{Año}.pdf`

---

## **SECCIÓN 4: ENDPOINTS COMPLEMENTARIOS**

### **11. Obtener Lista de Hijos del Padre**

**Endpoint:** `GET /usuarios/hijos`  
**Descripción:** Devuelve lista de hijos asociados al padre autenticado  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

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
        "nombre": "María Elena",
        "apellido": "Pérez García",
        "nombre_completo": "María Elena Pérez García",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "3"
        },
        "foto_url": null,
        "estado_matricula": "activo"
      },
      {
        "id": "est_002",
        "codigo_estudiante": "P5008",
        "nombre": "Carlos Alberto",
        "apellido": "Pérez García",
        "nombre_completo": "Carlos Alberto Pérez García",
        "nivel_grado": {
          "nivel": "Primaria",
          "grado": "5"
        },
        "foto_url": null,
        "estado_matricula": "activo"
      }
    ],
    "total_hijos": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-48:** Solo mostrar hijos activos (`estado_matricula = 'activo'`)
- **RN-49:** Ordenar alfabéticamente por apellido, nombre
- **RN-50:** Incluir información completa del nivel/grado actual

---

### **12. Obtener Año Académico Actual**

**Endpoint:** `GET /año-academico/actual`  
**Descripción:** Devuelve el año académico activo y configuración de trimestres  
**Autenticación:** Bearer token (Todos los roles)  

#### **Response Success (200):**
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

### **Reglas de Negocio:**
- **RN-51:** Determinar trimestre actual según fecha del sistema
- **RN-52:** Estados posibles: `pendiente`, `en_curso`, `cerrado`
- **RN-53:** Solo un trimestre puede estar `en_curso` a la vez

---

### **13. Obtener Alertas del Estudiante**

**Endpoint:** `GET /alertas/estudiante/{estudiante_id}`  
**Descripción:** Lista alertas activas de asistencia y rendimiento  
**Autenticación:** Bearer token (Rol: Padre/Apoderado)  

#### **Query Parameters:**
```
?tipo=todos              # Tipo de alerta (todos, asistencia, calificacion)
&estado=activa           # Estado (activa, leida, archivada)
&limit=10                # Límite de resultados (default: 10)
```

#### **Response Success (200):**
```json
{
  "success": true,
  "data": {
    "estudiante_id": "est_001",
    "alertas": [
      {
        "id": "alerta_001",
        "tipo": "calificacion",
        "nivel": "critico",
        "titulo": "⚠️ Bajo Rendimiento - Matemáticas",
        "mensaje": "María Elena obtuvo 9.5 en Examen del Trimestre 1",
        "datos": {
          "curso": "Matemáticas",
          "componente": "Examen",
          "calificacion": 9.5,
          "trimestre": 1
        },
        "fecha_creacion": "2025-03-15T14:30:00Z",
        "estado": "activa",
        "leida": false,
        "url_destino": "/calificaciones/est_001?curso_id=cur_001&componente_id=eval_001"
      },
      {
        "id": "alerta_002",
        "tipo": "asistencia",
        "nivel": "advertencia",
        "titulo": "⏰ Tardanza Registrada",
        "mensaje": "María Elena llegó tarde a clases el 10 de marzo",
        "datos": {
          "fecha": "2025-03-10",
          "hora_llegada": "08:15"
        },
        "fecha_creacion": "2025-03-10T08:15:00Z",
        "estado": "activa",
        "leida": true,
        "url_destino": "/asistencia/est_001"
      },
      {
        "id": "alerta_003",
        "tipo": "asistencia",
        "nivel": "critico",
        "titulo": "🚨 ALERTA CRÍTICA - Faltas Consecutivas",
        "mensaje": "María Elena tiene 3 faltas injustificadas consecutivas",
        "datos": {
          "total_faltas": 3,
          "fecha_inicio": "2025-03-05",
          "fecha_fin": "2025-03-07"
        },
        "fecha_creacion": "2025-03-07T18:00:00Z",
        "estado": "activa",
        "leida": false,
        "url_destino": "/asistencia/est_001"
      }
    ],
    "total_alertas": 3,
    "no_leidas": 2
  }
}
```

### **Reglas de Negocio:**
- **RN-54:** Alertas ordenadas por fecha descendente (más reciente primero)
- **RN-55:** Niveles: `critico`, `advertencia`, `informativo`
- **RN-56:** Estados: `activa`, `leida`, `archivada`
- **RN-57:** Incluir URL de destino para navegación directa
- **RN-58:** Padre solo ve alertas de sus hijos vinculados

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

---

## **MIDDLEWARE Y VALIDACIONES**

### **Middleware de Validación de Relación Padre-Hijo:**
```javascript
// validateParentAccess.js
const validateParentAccess = async (req, res, next) => {
  const { estudiante_id } = req.params;
  const padre_id = req.user.id; // Del token JWT
  
  // Verificar relación en relaciones_familiares
  const relacion = await db.relaciones_familiares.findOne({
    where: {
      padre_id: padre_id,
      estudiante_id: estudiante_id,
      estado_activo: true
    }
  });
  
  if (!relacion) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'No tiene permisos para ver los datos de este estudiante'
      }
    });
  }
  
  next();
};

// Uso:
router.get('/calificaciones/estudiante/:estudiante_id', 
  authMiddleware, 
  validateParentAccess, 
  getCalificaciones
);
```

### **Validación de Parámetros Mutuamente Excluyentes:**
```javascript
// validateMutuallyExclusive.js
const validateMutuallyExclusive = (params) => {
  return (req, res, next) => {
    const presentParams = params.filter(param => req.query[param]);
    
    if (presentParams.length > 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: `No puede especificar ${presentParams.join(' y ')} simultáneamente. Use solo uno.`
        }
      });
    }
    
    next();
  };
};

// Uso:
router.get('/asistencias/estudiante/:id', 
  authMiddleware,
  validateParentAccess,
  validateMutuallyExclusive(['mes', 'trimestre']),
  getAsistencias
);
```

### **Cálculos de Promedios:**
```javascript
// Promedio de componente recurrente
const calcularPromedioComponente = (evaluaciones) => {
  if (evaluaciones.length === 0) return null;
  
  const suma = evaluaciones.reduce((acc, eval) => acc + eval.calificacion_numerica, 0);
  const promedio = suma / evaluaciones.length;
  
  return parseFloat(promedio.toFixed(2));
};

// Promedio ponderado del trimestre
const calcularPromedioTrimestre = (promediosComponentes, estructuraEvaluacion) => {
  let sumaPonderada = 0;
  
  for (const comp of promediosComponentes) {
    const estructura = estructuraEvaluacion.find(e => e.id === comp.componente_id);
    sumaPonderada += (comp.promedio * estructura.peso_porcentual) / 100;
  }
  
  return parseFloat(sumaPonderada.toFixed(2));
};

// Promedio final anual
const calcularPromedioAnual = (trimestre1, trimestre2, trimestre3) => {
  const suma = trimestre1 + trimestre2 + trimestre3;
  const promedio = suma / 3;
  
  return parseFloat(promedio.toFixed(2));
};

// Conversión a letra
const convertirALetra = (calificacion) => {
  if (calificacion >= 18) return 'AD';
  if (calificacion >= 14) return 'A';
  if (calificacion >= 11) return 'B';
  return 'C';
};

// Determinar color
const determinarColor = (promedio) => {
  if (promedio >= 14) return 'verde';
  if (promedio >= 11) return 'amarillo';
  return 'rojo';
};
```

### **Formateo de Fechas:**
```javascript
const moment = require('moment');
moment.locale('es');

// Fecha legible
const formatearFechaLegible = (fecha) => {
  return moment(fecha).format('D [de] MMMM [de] YYYY');
  // Resultado: "15 de marzo de 2025"
};

// Día de la semana
const obtenerDiaSemana = (fecha) => {
  return moment(fecha).format('dddd');
  // Resultado: "Lunes"
};

// Nombre de mes
const obtenerNombreMes = (mes) => {
  return moment().month(mes - 1).format('MMMM');
  // Resultado: "Marzo"
};
```

---

## **ESTRUCTURA DE BASE DE DATOS RELACIONADA**

### **Índices Optimizados para Consultas Frecuentes:**
```sql
-- Calificaciones por estudiante
CREATE INDEX idx_evaluaciones_estudiante_filtros 
ON evaluaciones(estudiante_id, año_academico, trimestre, curso_id, estructura_evaluacion_id);

-- Asistencias por estudiante y fecha
CREATE INDEX idx_asistencias_estudiante_fecha 
ON asistencias(estudiante_id, fecha, año_academico);

-- Relaciones familiares activas
CREATE INDEX idx_relaciones_padre_hijo 
ON relaciones_familiares(padre_id, estudiante_id, estado_activo);

-- Cursos del estudiante
CREATE INDEX idx_estudiantes_nivel_grado 
ON estudiantes(nivel_grado_id, año_academico, estado_matricula);
```

---

## **GENERACIÓN DE REPORTES PDF CON PUPPETEER**

### **Boleta de Notas:**
```javascript
const puppeteer = require('puppeteer');

const generarBoletaCalificaciones = async (estudiante, curso, evaluaciones, promedio) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; }
        .titulo { font-size: 20px; font-weight: bold; color: #9B59B6; }
        .datos-estudiante { margin: 20px 0; }
        .tabla { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .tabla th, .tabla td { border: 1px solid #ddd; padding: 10px; text-align: center; }
        .tabla th { background: #9B59B6; color: white; }
        .preliminar { color: #F39C12; font-weight: bold; }
        .final { color: #2ECC71; font-weight: bold; }
        .promedio-destacado { font-size: 24px; color: #9B59B6; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" class="logo" />
        <div class="titulo">I.E.P. LAS ORQUÍDEAS</div>
        <div>BOLETA DE CALIFICACIONES</div>
      </div>
      
      <div class="datos-estudiante">
        <p><strong>Estudiante:</strong> ${estudiante.nombre_completo}</p>
        <p><strong>Código:</strong> ${estudiante.codigo_estudiante}</p>
        <p><strong>Grado:</strong> ${estudiante.nivel_grado.descripcion}</p>
        <p><strong>Curso:</strong> ${curso.nombre}</p>
        <p><strong>Trimestre:</strong> ${evaluaciones[0].trimestre}</p>
        <p><strong>Año Académico:</strong> ${evaluaciones[0].año_academico}</p>
      </div>
      
      <table class="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Componente</th>
            <th>Calificación</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${evaluaciones.map(eval => `
            <tr>
              <td>${eval.fecha_evaluacion_legible}</td>
              <td>${eval.componente.nombre}</td>
              <td>${eval.calificacion_numerica}</td>
              <td class="${eval.estado}">${eval.estado === 'preliminar' ? 'Preliminar' : 'Final'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <p><strong>PROMEDIO DEL COMPONENTE</strong></p>
        <p class="promedio-destacado">${promedio.valor}</p>
        <p>${promedio.letra} - ${promedio.descripcion}</p>
        ${promedio.estado === 'preliminar' ? 
          '<p class="preliminar">⚠️ Este promedio es preliminar y puede cambiar</p>' : 
          '<p class="final">✅ Promedio oficial certificado</p>'
        }
      </div>
      
      <div class="footer">
        <p>Generado el ${moment().format('DD/MM/YYYY HH:mm')}</p>
        <p>I.E.P. Las Orquídeas - San Isidro, Lima - Perú</p>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  
  return pdf;
};
```

### **Reporte de Asistencia:**
```javascript
const generarReporteAsistencia = async (estudiante, registros, estadisticas, periodo) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4 landscape; margin: 1.5cm; }
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .calendario { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
        .dia { border: 1px solid #ddd; padding: 10px; text-align: center; }
        .presente { background: #2ECC71; color: white; }
        .tardanza { background: #F39C12; color: white; }
        .permiso { background: #3498DB; color: white; }
        .falta-justificada { background: #E67E22; color: white; }
        .falta-injustificada { background: #E74C3C; color: white; }
        .sin-registro { background: #ECF0F1; }
        .no-lectivo { background: #95A5A6; color: white; }
        .estadisticas { margin-top: 20px; }
        .stat-card { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" style="max-width: 120px;" />
        <h2>REPORTE DE ASISTENCIA</h2>
        <p><strong>${estudiante.nombre_completo}</strong></p>
        <p>${periodo.descripcion}</p>
      </div>
      
      <div class="calendario">
        ${generarCalendarioHTML(registros, periodo)}
      </div>
      
      <div class="estadisticas">
        <h3>Estadísticas del Período</h3>
        <div class="stat-card">
          <div>Asistencia Global</div>
          <div style="font-size: 24px; font-weight: bold;">${estadisticas.porcentajes.asistencia_global}%</div>
        </div>
        <div class="stat-card">
          <div>Presentes</div>
          <div>${estadisticas.registros.presente} días (${estadisticas.porcentajes.presente}%)</div>
        </div>
        <div class="stat-card">
          <div>Tardanzas</div>
          <div>${estadisticas.registros.tardanza} días (${estadisticas.porcentajes.tardanza}%)</div>
        </div>
        <div class="stat-card">
          <div>Faltas Injustificadas</div>
          <div>${estadisticas.registros.falta_injustificada} días (${estadisticas.porcentajes.falta_injustificada}%)</div>
        </div>
      </div>
      
      ${estadisticas.alertas.length > 0 ? `
        <div style="margin-top: 20px; padding: 15px; background: #FFEBEE; border-left: 4px solid #E74C3C;">
          <h4>Alertas</h4>
          ${estadisticas.alertas.map(alerta => `
            <p>${alerta.icono} ${alerta.mensaje}</p>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        <p>Generado el ${moment().format('DD/MM/YYYY HH:mm')}</p>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
  await browser.close();
  
  return pdf;
};
```

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

4. **Cacheo Inteligente:**
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

