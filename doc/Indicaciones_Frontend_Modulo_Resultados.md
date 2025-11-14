
# Indicaciones Frontend - Módulo de Resultados de Encuestas

**Fecha:** 2025-11-12  
**Proyecto:** Family School Connect API  
**Módulo:** Resultados de Encuestas  
**Versión:** 1.0

---

## 🎯 **RESUMEN EJECUTIVO**

Se han implementado exitosamente **3 endpoints críticos** para el módulo de resultados de encuestas que el frontend estaba solicitando. Estos endpoints resuelven completamente los errores 404 que experimentaba la interfaz de usuario.

### **Endpoints Implementados:**
1. ✅ `GET /encuestas/:id/resultados/preguntas` - Resultados agregados por pregunta
2. ✅ `GET /encuestas/:id/estadisticas` - Estadísticas generales de encuesta
3. ✅ `GET /respuestas-encuestas` - Tabla de respuestas (paginada server-side)

---

## 📋 **ANÁLISIS DE CORRECCIÓN DE LLAMADAS FRONTEND**

### **Estado Actual vs Requerimientos Frontend:**

| Endpoint Frontend | Estado Backend | Implementación | Observaciones |
|-------------------|----------------|----------------|---------------|
| `GET /encuestas/:id/estadisticas` | ✅ **CORRECTO** | Endpoint completo | Respuesta exacta esperada |
| `GET /encuestas/:id/resultados/preguntas` | ✅ **CORRECTO** | Endpoint completo | Datos completos para gráficos |
| `GET /encuestas/:id/resultados/segmentos` | ❌ **PENDIENTE** | No implementado | Endpoint adicional no crítico |
| `GET /respuestas-encuestas` | ✅ **CORRECTO** | Endpoint completo | Paginación server-side funcional |
| `GET /encuestas/:id/export.csv` | ❌ **PENDIENTE** | No implementado | Funcionalidad no prioritaria |

### **Errores 404 Resueltos:**
- ✅ Error en `getResultsStats(encuestaId)` - **RESUELTO**
- ✅ Error en `getResultsByQuestion(encuestaId)` - **RESUELTO**  
- ✅ Error en `getResponses(encuestaId, params)` - **RESUELTO**

---

## 🛠️ **INDICACIONES FRONTEND - IMPLEMENTACIÓN**

### **1. Configuración de Servicios**

#### **Servicio getResultsStats() - ✅ FUNCIONAL**
```javascript
// ✅ IMPLEMENTADO - Usar normalmente
async function getResultsStats(encuestaId) {
  if (!encuestaId) {
    throw new ApiError('encuestaId requerido', 400, 'INVALID_PARAMETERS')
  }
  const res = await fetchWithAuth(`/encuestas/${encodeURIComponent(encuestaId)}/estadisticas`, {
    method: 'GET'
  })
  return ensureSuccess(res, 200)
}

// Manejo de errores específico:
try {
  const stats = await getResultsStats('enc_001')
  // Datos disponibles en: stats.data
  console.log('Estadísticas:', stats.data.metricas_generales)
} catch (error) {
  if (error.code === 'SURVEY_NOT_FOUND') {
    // Encuesta no encontrada
    showMessage('La encuesta no existe o fue eliminada')
  } else if (error.code === 'ACCESS_DENIED') {
    // Sin permisos
    showMessage('No tienes permisos para ver estas estadísticas')
  }
}
```

#### **Servicio getResultsByQuestion() - ✅ FUNCIONAL**
```javascript
// ✅ IMPLEMENTADO - Usar normalmente
async function getResultsByQuestion(encuestaId) {
  if (!encuestaId) {
    throw new ApiError('encuestaId requerido', 400, 'INVALID_PARAMETERS')
  }
  const res = await fetchWithAuth(`/encuestas/${encodeURIComponent(encuestaId)}/resultados/preguntas`, {
    method: 'GET'
  })
  return ensureSuccess(res, 200)
}

// Con filtros opcionales:
async function getResultsByQuestionFiltered(encuestaId, filtros) {
  const qs = buildQuery({
    nivel: filtros.nivel,
    grado: filtros.grado,
    curso: filtros.curso,
    rol: filtros.rol,
    fecha_inicio: filtros.fecha_inicio,
    fecha_fin: filtros.fecha_fin
  })
  const res = await fetchWithAuth(`/encuestas/${encodeURIComponent(encuestaId)}/resultados/preguntas${qs}`)
  return ensureSuccess(res, 200)
}

// Manejo de errores:
try {
  const resultados = await getResultsByQuestionFiltered('enc_001', {
    nivel: 'Primaria',
    grado: '3'
  })
  // Datos para gráficos disponibles en: resultados.data.resultados_por_pregunta
} catch (error) {
  if (error.code === 'SURVEY_NOT_FOUND') {
    showMessage('Encuesta no encontrada')
  }
}
```

#### **Servicio getResponses() - ✅ FUNCIONAL**
```javascript
// ✅ IMPLEMENTADO - Usar normalmente
async function getResponses(encuestaId, params = {}) {
  if (!encuestaId) {
    throw new ApiError('encuestaId requerido', 400, 'INVALID_PARAMETERS')
  }
  const {
    page = 1,
    limit = 20,
    nivel,
    grado,
    curso,
    rol,
    order = 'fecha_respuesta DESC'
  } = params

  const qs = buildQuery({
    encuesta_id: encuestaId,
    page,
    limit,
    nivel,
    grado,
    curso,
    rol,
    order
  })

  const res = await fetchWithAuth(`/respuestas-encuestas${qs}`, { method: 'GET' })
  return ensureSuccess(res, 200)
}

// Manejo de errores:
try {
  const responses = await getResponses('enc_001', {
    page: 1,
    limit: 20,
    nivel: 'Primaria',
    grado: '3'
  })
  // Datos disponibles en: responses.data.respuestas
  // Paginación en: responses.data.paginacion
} catch (error) {
  if (error.code === 'INVALID_PARAMETERS') {
    showMessage('Parámetros de consulta inválidos')
  }
}
```

### **2. Servicios NO Implementados (Manejargracefulmente)**

#### **getSurveySegments() - ❌ NO DISPONIBLE**
```javascript
// ❌ NO IMPLEMENTADO - Simular o mostrar mensaje
async function getSurveySegments(encuestaId, filtros = {}) {
  // Opción 1: Mostrar mensaje de funcionalidad en desarrollo
  throw new ApiError('Esta funcionalidad estará disponible próximamente', 501, 'NOT_IMPLEMENTED')
  
  // Opción 2: Simular datos para desarrollo
  return {
    success: true,
    data: {
      segmentos: [
        { nivel: 'Primaria', cantidad: 15 },
        { nivel: 'Secundaria', cantidad: 10 }
      ]
    }
  }
}
```

#### **exportResultsCsv() - ❌ NO DISPONIBLE**
```javascript
// ❌ NO IMPLEMENTADO - Manejar gracefulmente
async function exportResultsCsv(encuestaId, scope = 'aggregates') {
  throw new ApiError('Funcionalidad de exportación estará disponible en versión futura', 501, 'NOT_IMPLEMENTED')
}

// En el frontend:
try {
  await exportResultsCsv('enc_001')
} catch (error) {
  if (error.code === 'NOT_IMPLEMENTED') {
    showMessage('La exportación CSV estará disponible próximamente')
  }
}
```

---

## 🚨 **MANEJO DE ERRORES ESPECÍFICO**

### **Códigos de Error Implementados:**

| Código HTTP | Código API | Descripción | Acción Frontend |
|-------------|------------|-------------|-----------------|
| 200 | - | Éxito | Procesar datos normalmente |
| 400 | `INVALID_PARAMETERS` | Parámetros inválidos | Mostrar mensaje de validación |
| 403 | `ACCESS_DENIED` | Sin permisos | Mostrar mensaje de acceso denegado |
| 404 | `SURVEY_NOT_FOUND` | Encuesta no encontrada | Mostrar mensaje y redirigir |
| 500 | `INTERNAL_ERROR` | Error interno | Mostrar mensaje genérico y reportar |

### **Ejemplos de Manejo de Errores por Endpoint:**

#### **Para getResultsStats():**
```javascript
// Manejo específico de errores
const handleStatsError = (error) => {
  switch (error.code) {
    case 'SURVEY_NOT_FOUND':
      return 'La encuesta no existe o fue eliminada'
    case 'ACCESS_DENIED':
      return 'No tienes permisos para ver las estadísticas'
    case 'INVALID_PARAMETERS':
      return 'ID de encuesta inválido'
    default:
      return 'Error al cargar las estadísticas'
  }
}

// Uso:
try {
  const stats = await getResultsStats(encuestaId)
  renderStats(stats.data)
} catch (error) {
  showError(handleStatsError(error))
}
```

#### **Para getResultsByQuestion():**
```javascript
// Manejo específico con filtros
const handleResultsError = (error) => {
  switch (error.code) {
    case 'SURVEY_NOT_FOUND':
      return 'La encuesta no existe'
    case 'ACCESS_DENIED':
      return 'No autorizado para ver resultados'
    case 'INVALID_PARAMETERS':
      return 'Filtros de consulta inválidos'
    default:
      return 'Error al cargar resultados por pregunta'
  }
}

// Uso con filtros:
try {
  const filtros = { nivel: 'Primaria', grado: '3' }
  const results = await getResultsByQuestionFiltered(encuestaId, filtros)
  renderCharts(results.data.resultados_por_pregunta)
} catch (error) {
  showError(handleResultsError(error))
}
```

#### **Para getResponses():**
```javascript
// Manejo específico para tabla paginada
const handleResponsesError = (error) => {
  switch (error.code) {
    case 'INVALID_PARAMETERS':
      return 'Parámetros de paginación inválidos'
    case 'SURVEY_NOT_FOUND':
      return 'Encuesta no encontrada'
    case 'ACCESS_DENIED':
      return 'Sin permisos para ver respuestas'
    default:
      return 'Error al cargar tabla de respuestas'
  }
}

// Uso:
try {
  const responses = await getResponses(encuestaId, {
    page: 1,
    limit: 20,
    order: 'fecha_respuesta DESC'
  })
  renderResponsesTable(responses.data.respuestas)
  renderPagination(responses.data.paginacion)
} catch (error) {
  showError(handleResponsesError(error))
}
```

---

## 📊 **ESTRUCTURA DE DATOS DISPONIBLES**

### **Para Estadísticas Generales (getResultsStats):**
```javascript
// Estructura de respuesta:
{
  success: true,
  data: {
    encuesta: { id, titulo, tipo, estado, ... },
    metricas_generales: {
      total_destinatarios: number,
      total_respuestas: number,
      tasa_respuesta: number,
      respuestas_completas: number,
      respuestas_parciales: number,
      tasa_completitud: number
    },
    distribucion_respuestas: {
      por_fecha: [...],
      por_rol: [...],
      por_nivel: [...]
    },
    metricas_calidad: {
      tiempo_promedio_completado: number,
      preguntas_mas_omitidas: [...],
      preguntas_mas_tardias: [...]
    },
    indicadores_rendimiento: {
      velocidad_respuesta: string,
      calidad_respuestas: string,
      satisfaccion_respondientes: number
    }
  }
}
```

### **Para Resultados por Pregunta (getResultsByQuestion):**
```javascript
// Estructura de respuesta:
{
  success: true,
  data: {
    encuesta: { id, titulo, fecha_cierre },
    resumen_respuestas: {
      total_respuestas: number,
      respuestas_filtradas: number,
      porcentaje_respuesta: number
    },
    resultados_por_pregunta: [
      {
        pregunta: { id, texto, tipo, requerida },
        estadisticas: {
          total_respuestas: number,
          promedio: number,
          mediana: number,
          moda: number
        },
        distribucion: {
          opciones: [
            {
              texto: string,
              valor: number,
              cantidad: number,
              porcentaje: number
            }
          ]
        },
        analisis_cualitativo: {
          temas_recurrentes: [...],
          palabras_clave: [...]
        }
      }
    ]
  }
}
```

### **Para Tabla de Respuestas (getResponses):**
```javascript
// Estructura de respuesta:
{
  success: true,
  data: {
    encuesta: { id, titulo, total_respuestas },
    respuestas: [
      {
        id: string,
        fecha_respuesta: string,
        respondiente: {
          nombre: string,
          rol: string
        },
        contexto_academico: {
          nivel: string,
          grado: string,
          cursos: [...]
        },
        respuestas: [
          {
            pregunta: { texto, tipo },
            respuesta: {
              opcion_texto: string,
              valor: number,
              texto_abierto: string
            }
          }
        ],
        metadatos: {
          tiempo_total: number,
          dispositivo: string
        }
      }
    ],
    paginacion: {
      pagina_actual: number,
      total_paginas: number,
      total_registros: number,
      has_next: boolean,
      has_prev: boolean
    }
  }
}
```

---

## 🎨 **COMPONENTES FRONTEND RECOMENDADOS**

### **1. Componente de Estadísticas Generales:**
```javascript
// Componente: SurveyStatsDashboard
const SurveyStatsDashboard = ({ encuestaId }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadStats()
  }, [encuestaId])
  
  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getResultsStats(encuestaId)
      setStats(data.data)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <LoadingSpinner />
  if (!stats) return <ErrorMessage message="No se pudieron cargar las estadísticas" />
  
  return (
    <div className="survey-stats-dashboard">
      <MetricCard
        title="Tasa de Respuesta"
        value={`${stats.metricas_generales.tasa_respuesta}%`}
      />
      <DistributionChart
        data={stats.distribucion_respuestas.por_rol}
        title="Distribución por Rol"
      />
      <QualityMetrics
        metrics={stats.metricas_calidad}
      />
    </div>
  )
}
```

### **2. Componente de Gráficos por Pregunta:**
```javascript
// Componente: QuestionResultsChart
const QuestionResultsChart = ({ encuestaId, filtros }) => {
  const [results, setResults] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  
  useEffect(() => {
    loadQuestionResults()
  }, [encuestaId, filtros])
  
  const loadQuestionResults = async () => {
    try {
      const data = await getResultsByQuestionFiltered(encuestaId, filtros)
      setResults(data.data.resultados_por_pregunta)
    } catch (error) {
      handleError(error)
    }
  }
  
  return (
    <div className="question-results">
      <QuestionSelector
        questions={results}
        selected={selectedQuestion}
        onSelect={setSelectedQuestion}
      />
      {selectedQuestion && (
        <ResultsChart
          data={selectedQuestion.distribucion.opciones}
          stats={selectedQuestion.estadisticas}
        />
      )}
    </div>
  )
}
```

### **3. Componente de Tabla de Respuestas:**
```javascript
// Component: ResponsesDataTable
const ResponsesDataTable = ({ encuestaId }) => {
  const [responses, setResponses] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({})
  
  const loadResponses = async (page = 1, newFilters = {}) => {
    try {
      const data = await getResponses(encuestaId, {
        page,
        limit: 20,
        ...newFilters
      })
      setResponses(data.data.respuestas)
      setPagination(data.data.paginacion)
    } catch (error) {
      handleError(error)
    }
  }
  
  return (
    <div className="responses-table">
      <FiltersPanel
        filters={filters}
        onChange={setFilters}
        onApply={(newFilters) => loadResponses(1, newFilters)}
      />
      <DataTable
        data={responses}
        columns={[
          { key: 'fecha_respuesta_legible', title: 'Fecha' },
          { key: 'respondiente.nombre', title: 'Respondiente' },
          { key: 'respondiente.rol', title: 'Rol' },
          { key: 'contexto_academico.nivel', title: 'Nivel' },
          { key: 'metadatos.tiempo_total', title: 'Tiempo (s)' }
        ]}
      />
      <Pagination
        current={pagination.pagina_actual}
        total={pagination.total_paginas}
        onChange={(page) => loadResponses(page, filters)}
      />
    </div>
  )
}
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN FRONTEND**

### **Funcionalidades Prioritarias:**
- [ ] Implementar servicios para 3 endpoints funcionales
- [ ] Crear manejo de errores específico por endpoint
- [ ] Desarrollar componentes de visualización de estadísticas
- [ ] Implementar gráficos para resultados por pregunta
- [ ] Crear tabla paginada de respuestas individuales
- [ ] Agregar filtros en consultas de resultados
- [ ] Manejar gracefulmente endpoints no implementados

### **Funcionalidades Secundarias:**
- [ ] Implementar mock para getSurveySegments()
- [ ] Mostrar mensaje temporal para exportResultsCsv()
- [ ] Agregar loading states en componentes
- [ ] Implementar validaciones de parámetros frontend
- [ ] Agregar tooltips informativos para métricas
- [ ] Implementar exportación local de datos (temporal)

---

## 🔄 **FLUJO DE USUARIO RECOMENDADO**

### **1. Dashboard de Resultados:**
```
Usuario accede a resultados de encuesta
    ↓
Cargar estadísticas generales (getResultsStats)
    ↓
Mostrar métricas clave y gráficos de distribución
    ↓
Permitir navegación a vistas específicas
```

### **2. Vista de Resultados por Pregunta:**
```
Usuario selecciona "Ver por pregunta"
    ↓
Cargar resultados agregados (getResultsByQuestion)
    ↓
Mostrar selector de preguntas
    ↓
Renderizar gráfico de distribución por pregunta seleccionada
    ↓
Aplicar filtros opcionales (nivel, grado, curso, rol)
```

### **3. Vista de Tabla de Respuestas:**
```
Usuario selecciona "Ver respuestas individuales"
    ↓
Cargar tabla paginada (getResponses)
    ↓
Mostrar filtros disponibles
    ↓
Renderizar tabla con paginación
    ↓
Permitir ordenamiento y filtrado en tiempo real
```

---

## 🎯 **MENSAJES DE ERROR RECOMENDADOS**

### **Errores de Acceso:**
- "No tienes permisos para ver los resultados de esta encuesta"
- "Solo directores y administradores pueden acceder a esta información"

### **Errores de Validación:**
- "ID de encuesta inválido"
- "Parámetros de consulta incorrectos"
- "Filtros de fecha inválidos"

### **Errores de Sistema:**
- "Error al cargar las estadísticas. Inténtalo nuevamente"
- "La encuesta no existe o fue eliminada"
- "Error temporal del servidor. Inténtalo en unos minutos"

### **Funcionalidades en Desarrollo:**
- "La funcionalidad de segmentación estará disponible próximamente"
- "La exportación CSV estará disponible en la próxima versión"

---

## 📝 **NOTAS DE DESARROLLO**

### **Consideraciones de Rendimiento:**
- Los endpoints incluyen paginación server-side para respuestas
- Se pueden aplicar filtros para reducir el volumen de datos
- Las estadísticas generales son agregadas, por lo que son ligeras

### **Consideraciones de Seguridad:**
- Solo roles director y administrador pueden acceder
- Los datos se filtran automáticamente por permisos del usuario
- Se incluye auditoría de consultas para trazabilidad

### **Consideraciones de UX:**
- Implementar loading states durante las consultas
- Mostrar progress indicators para operaciones largas
- Proporcionar feedback claro en caso de errores
- Permitir exportar datos manualmente como workaround temporal

---

## 🚀 **PRÓXIMOS PASOS**

### **Inmediatos (Esta Semana):**
1. ✅ Implementar servicios frontend para 3 endpoints
2. ✅ Crear componentes básicos de visualización
3. ✅ Implementar manejo de errores
4. ✅ Probar flujo completo de usuario

### **Corto Plazo (Próximas 2 Semanas):**
1. Mejorar UX con loading states y animaciones
2. Agregar filtros avanzados en frontend
3. Implementar exportación local temporal
4. Optimizar rendimiento de consultas

### **Mediano Plazo (Próximo Mes):**
1. Implementar endpoint de segmentación (getSurveySegments)
2. Implementar exportación CSV (exportResultsCsv)
3. Agregar análisis avanzado de tendencias
4. Implementar comparativas entre encuestas

---

**Documento actualizado:** 2025-11-12  
**Estado:** Implementación completada ✅  
