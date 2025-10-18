# Contexto Frontend - Semana 6: Módulo de Datos Académicos (Visualización - Padres)

## 📋 Visión General

Este documento proporciona el contexto completo para el equipo frontend que implementará el **Módulo de Visualización de Datos Académicos para Padres** en la Semana 6. Este módulo permite a los padres/apoderados consultar calificaciones, asistencia y resúmenes académicos de sus hijos mediante interfaces intuitivas y visualmente atractivas.

### 🎯 Objetivo Principal

Desarrollar una experiencia de usuario completa para que los padres puedan:
- Consultar calificaciones detalladas por componente de evaluación
- Visualizar asistencia mediante calendarios interactivos
- Acceder a resúmenes trimestrales y anuales consolidados
- Exportar reportes y boletas oficiales en PDF

---

## 🔐 Autenticación y Autorización

### Requisitos de Autenticación
- **JWT Token Obligatorio**: Todos los endpoints requieren `Authorization: Bearer <token>`
- **Rol Requerido**: Padre/Apoderado (`rol: 'apoderado'`)
- **Validación de Vinculación**: El sistema verifica que el padre esté vinculado al estudiante en `relaciones_familiares`

### Middleware de Seguridad
```javascript
// validateParentAccess.js - Implementado en backend
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
```

---

## 🏗️ Arquitectura de Datos

### Entidades Principales
1. **usuarios** - Padre/apoderado autenticado
2. **estudiantes** - Hijos vinculados al padre
3. **relaciones_familiares** - Vinculación padre-hijo (validación de acceso)
4. **cursos** - Cursos del estudiante por año académico
5. **estructura_evaluacion** - Componentes de evaluación (Examen 40%, Participación 20%, etc.)
6. **evaluaciones** - Calificaciones registradas por docentes
7. **asistencias** - Registros diarios de asistencia
8. **nivel_grado** - Información académica (Primaria, Secundaria, etc.)

### Relaciones Clave
- Padre → Estudiantes (via `relaciones_familiares`)
- Estudiante → Cursos (via `estudiantes.nivel_grado_id`)
- Curso → Evaluaciones (via `evaluaciones.curso_id`)
- Evaluaciones → Estructura (via `evaluaciones.estructura_evaluacion_id`)

---

## 📊 Flujo General de Visualización

### 1. Calificaciones por Componente (HU-ACAD-06)
```
Dashboard Padre → Módulo Calificaciones → 
Seleccionar Año/Trimestre → Seleccionar Curso → 
Seleccionar Componente → Visualizar Notas → 
Ver Promedio + Detalles → Exportar PDF
```

### 2. Asistencia con Calendario (HU-ACAD-07)
```
Dashboard Padre → Módulo Asistencia → 
Seleccionar Año → Seleccionar Vista (Mes/Trimestre/Año) →
Calendario Interactivo → Estadísticas en Tiempo Real →
Exportar Reporte
```

### 3. Resumen Académico (HU-ACAD-09)
```
Dashboard Padre → Resumen Académico →
Vista Trimestral (Cards por Curso) o Vista Anual (Tabla) →
Gráfico Comparativo → Exportar Boleta Oficial
```

---

## 🚀 Endpoints API Disponibles

### CALIFICACIONES

| Método | Endpoint | Descripción | Parámetros |
|---|---|---|---|
| **GET** | `/calificaciones/estudiante/{id}` | Calificaciones completas por filtros | `?año={año}&trimestre={trimestre}&curso_id={id}&componente_id={id}` |
| **GET** | `/calificaciones/estudiante/{id}/promedio` | Promedio en tiempo real | `?curso_id={id}&componente_id={id}&trimestre={trimestre}&año={año}` |
| **GET** | `/cursos/estudiante/{id}` | Cursos del estudiante | `?año={año}` |
| **GET** | `/calificaciones/estudiante/{id}/export` | Exportar boleta PDF | `?año={año}&formato=pdf&curso_id={id}&componente_id={id}&trimestre={trimestre}` |

### ASISTENCIA

| Método | Endpoint | Descripción | Parámetros |
|---|---|---|---|
| **GET** | `/asistencias/estudiante/{id}` | Registros de asistencia | `?año={año}&mes={mes}` (excluyente con trimestre) |
| **GET** | `/asistencias/estudiante/{id}/estadisticas` | Estadísticas de asistencia | `?fecha_inicio={fecha}&fecha_fin={fecha}` |
| **GET** | `/asistencias/estudiante/{id}/export` | Exportar reporte PDF | `?formato=pdf&fecha_inicio={fecha}&fecha_fin={fecha}` |
| **GET** | `/calendario/dias-no-lectivos` | Días no lectivos | `?año={año}` |

### RESUMEN ACADÉMICO

| Método | Endpoint | Descripción | Parámetros |
|---|---|---|---|
| **GET** | `/resumen-academico/estudiante/{id}` | Resumen completo | `?año={año}&trimestre={trimestre}` |
| **GET** | `/resumen-academico/estudiante/{id}/export` | Boleta oficial PDF | `?año={año}&formato=pdf` |

### COMPLEMENTARIOS

| Método | Endpoint | Descripción |
|---|---|---|
| **GET** | `/usuarios/hijos` | Lista de hijos del padre autenticado |
| **GET** | `/año-academico/actual` | Año académico activo y trimestres |
| **GET** | `/alertas/estudiante/{id}` | Alertas de rendimiento y asistencia |

---

## 📱 Estructuras de Datos Importantes

### Respuesta de Calificaciones
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
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
    "evaluaciones": [
      {
        "id": "eval_log_001",
        "fecha_evaluacion": "2025-03-15",
        "fecha_evaluacion_legible": "15 de marzo de 2025",
        "calificacion_numerica": 16.5,
        "calificacion_letra": "A",
        "estado": "preliminar"
      }
    ],
    "promedio_componente": 16.5,
    "hay_notas_preliminares": true
  }
}
```

### Respuesta de Asistencia
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "nombre_completo": "María Elena Pérez García"
    },
    "periodo": {
      "año": 2025,
      "mes": 3,
      "mes_nombre": "Marzo"
    },
    "registros": [
      {
        "id": "asist_001",
        "fecha": "2025-03-01",
        "fecha_legible": "1 de marzo de 2025",
        "dia_semana": "Lunes",
        "estado": "presente"
      }
    ],
    "resumen": {
      "presente": 17,
      "tardanza": 2,
      "falta_injustificada": 1
    }
  }
}
```

### Respuesta de Resumen Trimestral
```json
{
  "success": true,
  "data": {
    "estudiante": {
      "id": "est_001",
      "nombre_completo": "María Elena Pérez García"
    },
    "trimestre": 1,
    "cursos": [
      {
        "id": "cur_001",
        "nombre": "Matemáticas",
        "formula_calculo": [
          {
            "componente_id": "eval_001",
            "nombre": "Examen",
            "peso": 40.00
          }
        ],
        "promedios_componentes": [
          {
            "componente": "Examen",
            "promedio": 16.0,
            "peso": 40.00,
            "subtotal": 6.40,
            "color": "verde"
          }
        ],
        "promedio_trimestre": 15.50,
        "promedio_letra": "A",
        "estado": "preliminar"
      }
    ]
  }
}
```

---

## ⚠️ Validaciones Clave

### Validaciones de Acceso
- **VN-01**: Padre solo ve datos de hijos vinculados en `relaciones_familiares`
- **VN-02**: Solo mostrar cursos del año académico seleccionado
- **VN-03**: Respetar filtros de año y trimestre (no mezclar datos)

### Validaciones de Negocio
- **Promedios**: Calculados en tiempo real, no precargados
- **Estados**: "preliminar" vs "final" según certificación del trimestre
- **Porcentajes**: Calculados sobre días lectivos, no días calendario
- **Colores**: Verde ≥14, Amarillo 11-13, Rojo <11

### Validaciones de Entrada
- **Parámetros Mutuamente Excluyentes**: `mes` y `trimestre` no pueden usarse juntos
- **Rangos de Fechas**: `fecha_inicio` debe ser ≤ `fecha_fin`
- **Existencia**: Validar que estudiante_id, curso_id, componente_id existan

---

## 🎨 Sistema de Alertas Automáticas

### Tipos de Alertas
```json
{
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
      "url_destino": "/calificaciones/est_001?curso_id=cur_001"
    }
  ]
}
```

### Criterios de Generación
- **Rendimiento Bajo**: Calificación < 11 en componentes importantes
- **Tardanzas Acumuladas**: ≥5 tardanzas en el trimestre
- **Faltas Consecutivas**: ≥3 faltas injustificadas seguidas
- **Asistencia Destacada**: ≥95% de asistencia

---

## 📅 Estados y Flujos de UI

### Calificaciones (HU-ACAD-06)
1. **Estado Inicial**: Cargando datos del estudiante y filtros
2. **Estado Selección**: Esperando selección de curso y componente
3. **Estado Carga**: Fetching calificaciones del backend
4. **Estado Visualización**: Tabla y resumen poblados
5. **Estado Vacío**: Sin datos para mostrar
6. **Estado Error**: Fallo en la carga

### Asistencia (HU-ACAD-07)
1. **Estado Inicial**: Cargando calendario del mes actual
2. **Estado Navegación**: Cambiando de mes/vista
3. **Estado Visualización**: Calendario poblado con datos
4. **Estado Detalle**: Modal de día específico abierto
5. **Estado Selección**: Rango de fechas seleccionado

### Resumen Académico (HU-ACAD-09)
1. **Estado Trimestral**: Cards de cursos por trimestre
2. **Estado Anual**: Tabla consolidada y gráfico
3. **Estado Exportación**: Generando PDF oficial

---

## 🎯 Consideraciones Técnicas

### Performance
- **Caching**: 
  - Estructura evaluación: 24 horas
  - Calificaciones finales: 1 hora
  - Calificaciones preliminares: 5 minutos
  - Asistencia: 30 minutos
- **Lazy Loading**: Cargar componentes bajo demanda
- **Optimización**: Índices en campos de filtrado frecuente

### Librerías Recomendadas
- **Tablas**: TanStack Table (sorting, filtering, pagination)
- **Calendarios**: React Big Calendar (customizado con colores)
- **Gráficos**: Recharts (barras, donas, líneas)
- **PDF**: Puppeteer (backend) + descarga en frontend
- **Manejo de Estado**: React Context o Redux Toolkit

### Diseño Responsivo
- **Desktop**: Layout completo con paneles laterales
- **Tablet**: 2 columnas, elementos apilados
- **Mobile**: Cards apiladas, swipe para navegación

---

## 🎨 Visualizaciones Recomendadas

### 1. Tabla de Calificaciones (TanStack Table)
- Columnas dinámicas según tipo de componente
- Badges de estado (preliminar/final)
- Toggle numérico/letras
- Exportación a PDF

### 2. Calendario de Asistencia (React Big Calendar)
- Códigos de colores por estado
- Tooltips informativos
- Navegación intuitiva
- Selección de rangos

### 3. Gráfico de Rendimiento (Recharts)
- Barras comparativas por curso
- Línea de referencia (nota mínima)
- Colores según desempeño
- Interactivo con tooltips

### 4. Panel de Estadísticas
- Cards con indicadores clave
- Gráfico de dona (distribución de asistencia)
- Alertas y reconocimientos
- Animaciones suaves

---

## 🔒 Seguridad y Accesibilidad

### Seguridad
- **Validación JWT**: En cada request
- **Rate Limiting**: 60 requests/minuto consultas, 10/minuto exportación
- **Sanitización**: No exponer IDs internos innecesariamente
- **HTTPS**: Obligatorio en producción

### Accesibilidad
- **ARIA Labels**: Completo en componentes interactivos
- **Navegación por Teclado**: Flechas para calendario, Tab para formularios
- **Contraste**: Mínimo 4.5:1 en texto
- **Lectura de Pantalla**: Compatible con screen readers

---

## 🔄 Integración con Backend

### Flujo de Comunicación
1. **Autenticación**: Verificación JWT en cada request
2. **Validación de Acceso**: Middleware `validateParentAccess`
3. **Carga de Datos**: Endpoints específicos por módulo
4. **Procesamiento**: Cálculos en tiempo real en backend
5. **Respuesta**: JSON estandarizado con success/data/error

### Manejo de Errores
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "No tiene permisos para ver los datos de este estudiante"
  }
}
```

### Códigos de Error Comunes
- `ACCESS_DENIED` (403): Sin permisos
- `NO_GRADES_FOUND` (404): Sin calificaciones
- `INVALID_PARAMETERS` (400): Parámetros inválidos
- `EXPORT_FAILED` (500): Error generando PDF

---

## 📋 Recomendaciones de Implementación

### Estructura de Componentes
```
src/
├── pages/
│   ├── CalificacionesView/
│   ├── AsistenciaView/
│   └── ResumenAcademicoView/
├── components/
│   ├── common/
│   │   ├── FilterControls/
│   │   ├── LoadingStates/
│   │   └── ErrorStates/
│   ├── calificaciones/
│   │   ├── NotasTable/
│   │   ├── ResumenCard/
│   │   └── FormatToggle/
│   ├── asistencia/
│   │   ├── CalendarioAsistencia/
│   │   ├── EstadisticasPanel/
│   │   └── LeyendaColores/
│   └── resumen/
│       ├── CursoResumenCard/
│       ├── TablaNotasAnuales/
│       └── GraficoRendimiento/
├── services/
│   ├── api.js
│   ├── calificacionesService.js
│   ├── asistenciaService.js
│   └── resumenService.js
└── utils/
    ├── formatters.js
    ├── validators.js
    └── constants.js
```

### Manejo de Estado
- **Global**: Context para usuario autenticado e hijos seleccionados
- **Local**: State para filtros, carga de datos y UI interacciones
- **Caching**: React Query o SWR para data fetching con caché

### Testing
- **Unit Tests**: Lógica de componentes y utilidades
- **Integration Tests**: Flujo completo de usuario
- **E2E Tests**: Casos críticos con Cypress o Playwright

---

## 🚀 Próximos Pasos

1. **Setup Inicial**: Configurar estructura de proyecto y dependencias
2. **Autenticación**: Implementar flujo de login y selector de hijos
3. **Módulo Calificaciones**: Tablas, filtros y exportación PDF
4. **Módulo Asistencia**: Calendario interactivo con estadísticas
5. **Módulo Resumen**: Cards trimestrales y tabla anual
6. **Integración**: Conexión completa con backend API
7. **Testing**: Pruebas unitarias y de integración
8. **Optimización**: Performance y accesibilidad

Este documento proporciona la base técnica y funcional para comenzar el desarrollo del frontend del Módulo de Visualización de Datos Académicos para Padres.