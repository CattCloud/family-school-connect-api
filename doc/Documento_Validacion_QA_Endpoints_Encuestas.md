# Documento de Validación QA - Endpoints de Resultados de Encuestas

**Proyecto:** Family School Connect API  
**Módulo:** Encuestas - Resultados  
**Fecha:** 2025-11-12  
**Responsable:** Arquitectura y Desarrollo Backend  
**Para validación:** Equipo QA y Frontend  

---

## **RESUMEN EJECUTIVO**

### **Problema Identificado**
El frontend del módulo de encuestas está intentando acceder a **5 rutas de resultados que no existen** en el backend actual, causando **errores 404** y bloqueando la funcionalidad básica de visualización de resultados.

### **Solución Propuesta**
Implementación de **3 endpoints mínimos viables** que cubran las necesidades críticas del frontend mientras se desarrolla una solución completa:

1. ✅ **GET /encuestas/:id/resultados/preguntas** - Resultados agregados por pregunta
2. ✅ **GET /encuestas/:id/estadisticas** - Métricas generales y KPIs
3. ✅ **GET /respuestas-encuestas** - Tabla paginada de respuestas

### **Impacto en UX**
- **Actual:** Frontend muestra errores 404 para todas las funciones de resultados
- **Esperado:** Frontend podrá mostrar resultados básicos, estadísticas y tabla de respuestas
- **Tiempo de desarrollo:** 8-12 horas estimado

---

## **ANÁLISIS DETALLADO DE RUTAS**

### **Rutas del Frontend vs Backend Actual**

| Endpoint Frontend | Estado | Impacto | Endpoint Backend Propuesto |
|-------------------|--------|---------|---------------------------|
| `GET /encuestas/:id/estadisticas` | ❌ **404** | Alto | `GET /encuestas/:id/estadisticas` |
| `GET /encuestas/:id/resultados/preguntas` | ❌ **404** | Alto | `GET /encuestas/:id/resultados/preguntas` |
| `GET /encuestas/:id/resultados/segmentos` | ❌ **404** | Medio | ❌ **Postergado** |
| `GET /respuestas-encuestas` | ❌ **404** | Alto | `GET /respuestas-encuestas` |
| `GET /encuestas/:id/export.csv` | ❌ **404** | Bajo | ❌ **Postergado** |

### **Endpoints Existentes en Backend**
El backend actual cuenta con **9 endpoints funcionales** para encuestas (crear, responder, listar, etc.) pero **ninguno para resultados**.

---

## **ESPECIFICACIONES TÉCNICAS COMPLETAS**

### **ENDPOINT 1: Resultados Agregados por Pregunta**

**URL:** `GET /encuestas/:id/resultados/preguntas`  
**Descripción:** Obtiene resultados agregados por pregunta para mostrar en la interfaz  
**Autenticación:** Bearer token (Padre/Docente/Director)  

#### **Parámetros de Consulta:**
```
?incluir_respuestas_texto=true    # Incluir respuestas de texto (default: true)
&limite_respuestas_texto=10      # Límite de respuestas texto (default: 10)
```

#### **Response de Éxito (200):**
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
            }
          ]
        }
      }
    ]
  }
}
```

#### **Casos de Error:**
- **404 Not Found:** Encuesta no existe
- **403 Forbidden:** Sin permisos para ver resultados
- **404 No Responses:** Encuesta sin respuestas

---

### **ENDPOINT 2: Estadísticas Generales**

**URL:** `GET /encuestas/:id/estadisticas`  
**Descripción:** Obtiene métricas generales y KPIs de la encuesta  
**Autenticación:** Bearer token (Padre/Docente/Director)  

#### **Response de Éxito (200):**
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
        }
      ]
    },
    "insights": {
      "pregunta_mas_respondida": {
        "pregunta_id": "223e4567-e89b-12d3-a456-426614174002",
        "texto": "¿Con qué frecuencia revisas la plataforma educativa?",
        "tasa_respuesta": 100.00
      },
      "tendencia_participacion": "creciente",
      "dias_restantes_para_vencer": 7
    }
  }
}
```

---

### **ENDPOINT 3: Tabla de Respuestas**

**URL:** `GET /respuestas-encuestas`  
**Descripción:** Obtiene listado paginado de respuestas con filtros  
**Autenticación:** Bearer token (Padre/Docente/Director)  

#### **Parámetros de Consulta:**
```
?encuesta_id=123e4567-e89b-12d3-a456-426614174000  # Requerido
&page=1                                           # Página (default: 1)
&limit=20                                         # Límite (default: 20, max: 100)
&nivel=Primaria                                   # Filtrar por nivel (opcional)
&grado=2do                                        # Filtrar por grado (opcional)
&curso=B                                          # Filtrar por curso (opcional)
&rol=padre                                        # Filtrar por rol (opcional)
&order=fecha_respuesta DESC                       # Ordenamiento (default)
```

#### **Response de Éxito (200):**
```json
{
  "success": true,
  "data": {
    "filtros_aplicados": {
      "encuesta_id": "123e4567-e89b-12d3-a456-426614174000",
      "nivel": null,
      "grado": null,
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
            "valor": "Semanalmente"
          }
        ],
        "ip_respuesta": "192.168.1.100"
      }
    ],
    "paginacion": {
      "page": 1,
      "limit": 20,
      "total_respuestas": 24,
      "total_pages": 2,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

## **PLAN DE IMPLEMENTACIÓN**

### **Fase 1: Servicio (2-3 horas)**
- Extender `encuestasService.js` con 3 nuevos métodos
- Implementar lógica de agregación por tipo de pregunta
- Agregar métodos auxiliares para cálculos estadísticos

### **Fase 2: Controlador (1-2 horas)**  
- Extender `encuestasController.js` con 3 nuevos handlers
- Manejar validaciones y errores HTTP apropiados
- Reutilizar utilidades existentes (`success`, `error`, etc.)

### **Fase 3: Router (30 minutos)**
- Agregar 3 nuevas rutas a `routes/encuestas.js`
- Mantener compatibilidad con frontend existente

### **Fase 4: Validación (1-2 horas)**
- Tests unitarios para cada endpoint
- Validación de permisos por rol
- Optimización de queries Prisma

---

## **CASOS DE PRUEBA PARA QA**

### **Tests de Funcionalidad Básica**

#### **Test 1: Obtener Resultados por Pregunta**
```
✅ REQUEST: GET /encuestas/{id}/resultados/preguntas
✅ AUTH: Bearer token válido
✅ EXPECTED: 200 OK con resultados agregados
✅ VALIDATE: 
   - Estructura de respuesta coincide con especificación
   - Porcentajes suman 100% para preguntas de opción única
   - Respuestas de texto limitadas por parámetro
   - Incluye metadatos de encuesta
```

#### **Test 2: Obtener Estadísticas Generales**
```
✅ REQUEST: GET /encuestas/{id}/estadisticas  
✅ AUTH: Bearer token válido
✅ EXPECTED: 200 OK con métricas
✅ VALIDATE:
   - Total respuestas > 0
   - Porcentaje participación entre 0-100
   - Tiempo promedio respuesta realista (1-60 min)
   - Distribución temporal incluye fechas válidas
```

#### **Test 3: Tabla de Respuestas Paginada**
```
✅ REQUEST: GET /respuestas-encuestas?encuesta_id={id}&page=1&limit=20
✅ AUTH: Bearer token válido  
✅ EXPECTED: 200 OK con lista paginada
✅ VALIDATE:
   - Número de resultados ≤ límite solicitado
   - has_next=true si hay más páginas
   - Filtros funcionan correctamente
   - Paginación accurately calcula total_pages
```

### **Tests de Seguridad y Permisos**

#### **Test 4: Permisos por Rol**
```
ESCENARIO A: Padre autenticado
✅ REQUEST: GET /encuestas/{id}/resultados/preguntas
✅ EXPECTED: 200 si es su encuesta o muestra_resultados=true
✅ EXPECTED: 403 Forbidden si no tiene acceso

ESCENARIO B: Director autenticado  
✅ REQUEST: GET /encuestas/{id}/estadisticas
✅ EXPECTED: 200 OK (director tiene acceso a todas)

ESCENARIO C: Usuario no autenticado
✅ REQUEST: GET /respuestas-encuestas?encuesta_id={id}
✅ EXPECTED: 401 Unauthorized
```

#### **Test 5: Casos de Error**
```
CASO A: Encuesta no existe
✅ REQUEST: GET /encuestas/{uuid-inexistente}/estadisticas
✅ EXPECTED: 404 Not Found
✅ VALIDATE: {"success": false, "error": {"code": "NOT_FOUND"}}

CASO B: Sin permisos
✅ REQUEST: GET /encuestas/{id}/resultados (usuario sin acceso)
✅ EXPECTED: 403 Forbidden  
✅ VALIDATE: {"success": false, "error": {"code": "FORBIDDEN"}}

CASO C: Parámetros inválidos
✅ REQUEST: GET /respuestas-encuestas (sin encuesta_id)
✅ EXPECTED: 400 Bad Request
✅ VALIDATE: {"success": false, "error": {"code": "INVALID_PARAMETERS"}}

CASO D: Encuesta sin respuestas
✅ REQUEST: GET /encuestas/{id}/resultados/preguntas
✅ EXPECTED: 404 Not Found
✅ VALIDATE: {"success": false, "error": {"code": "NO_RESPONSES_FOUND"}}
```

### **Tests de Rendimiento**

#### **Test 6: Performance con Datos Masivos**
```
CONFIGURACIÓN: Encuesta con 1000+ respuestas
✅ REQUEST: GET /encuestas/{id}/resultados/preguntas
✅ EXPECTED: Response < 2 segundos
✅ EXPECTED: Memory usage stable
✅ VALIDATE: No timeout errors

CONFIGURACIÓN: Tabla con paginación
✅ REQUEST: GET /respuestas-encuestas?encuesta_id={id}&limit=100
✅ EXPECTED: Máximo 100 resultados retornados
✅ VALIDATE: Paginación funciona correctamente
```

---

## **CRITERIOS DE ACEPTACIÓN**

### **Criterios Funcionales**
- [ ] **RF-01:** Los 3 endpoints responden con código 200 para casos válidos
- [ ] **RF-02:** Estructura de respuesta coincide exactamente con especificaciones
- [ ] **RF-03:** Agregaciones calculadas correctamente para todos los tipos de pregunta
- [ ] **RF-04:** Paginación funciona en tabla de respuestas
- [ ] **RF-05:** Filtros de segmentación reducen correctamente el conjunto de resultados

### **Criterios de Seguridad**  
- [ ] **RS-01:** Solo usuarios autorizados pueden acceder a resultados
- [ ] **RS-02:** Autor de encuesta siempre puede ver resultados
- [ ] **RS-03:** Director tiene acceso a todas las encuestas
- [ ] **RS-04:** Padres solo ven respuestas propias (excepto encuestas públicas)
- [ ] **RS-05:** Rate limiting aplicado (50 req/min para endpoints de resultados)

### **Criterios de Rendimiento**
- [ ] **RP-01:** Response time < 2 segundos para datasets grandes (1000+ respuestas)
- [ ] **RP-02:** Memory usage estable durante agregaciones complejas
- [ ] **RP-03:** Paginación limita correctamente resultados (max 100 por página)
- [ ] **RP-04:** No hay timeouts en consultas de agregación

### **Criterios de Compatibilidad**
- [ ] **RC-01:** Endpoints compatibles con llamadas del frontend existente
- [ ] **RC-02:** Respuestas usan mismo formato que endpoints existentes
- [ ] **RC-03:** Códigos de error siguen convenciones established
- [ ] **RC-04:** Headers de autenticación funcionan igual que otros endpoints

---

## **PLAN DE VALIDACIÓN**

### **Checklist de Validación Técnica**
- [ ] **Backend:** Código implementado siguiendo especificaciones
- [ ] **Backend:** Tests unitarios pasando para todos los casos de prueba
- [ ] **Backend:** Queries Prisma optimizadas con índices apropiados
- [ ] **Backend:** Manejo de errores robusto y logging apropiado
- [ ] **Frontend:** Llamadas API actualizadas coinciden con nuevas URLs
- [ ] **Frontend:** Estados de carga y error manejados correctamente
- [ ] **Frontend:** Datos renderizados correctamente en la UI

### **Proceso de QA**
1. **Review Técnico:** Revisar código y arquitectura con equipo backend
2. **Testing Unitario:** Ejecutar tests automatizados para cada endpoint  
3. **Testing Manual:** Probar todos los casos de uso con datos reales
4. **Testing de Integración:** Validar flujo completo frontend → backend → UI
5. **Testing de Performance:** Verificar tiempos de respuesta con datos masivos
6. **Testing de Seguridad:** Validar permisos y casos de acceso no autorizado
7. **UAT:** Validación final con usuarios representativos

### **Rollback Plan**
En caso de problemas críticos:
- Revertir a estado anterior (sin endpoints de resultados)
- Frontend mostrará mensajes de "Funcionalidad en desarrollo"
- No se afectan otras funcionalidades existentes del sistema

---

## **DOCUMENTACIÓN ADICIONAL**

### **Archivos de Referencia**
- 📄 [Especificaciones_Endpoints_Resultados.md](Especificaciones_Endpoints_Resultados.md) - Especificaciones técnicas detalladas
- 📄 [Plan_Implementacion_Backend.md](Plan_Implementacion_Backend.md) - Plan detallado de implementación
- 📄 [Comparativa_Rutas_Encuestas.md](Comparativa_Rutas_Encuestas.md) - Análisis comparativo completo

### **Recursos de Desarrollo**
- **Backend Service:** `services/encuestasService.js` - Extender con nuevos métodos
- **Backend Controller:** `controllers/encuestasController.js` - Agregar HTTP handlers  
- **Backend Router:** `routes/encuestas.js` - Definir nuevas rutas
- **Database Schema:** `prisma/schema.prisma` - Modelos ya existentes

### **URLs de Testing**
Una vez implementado, los endpoints estarán disponibles en:
```
Base URL Local: http://localhost:3000
Base URL Production: https://api.orquideas.edu.pe

GET /encuestas/{id}/resultados/preguntas
GET /encuestas/{id}/estadisticas  
GET /respuestas-encuestas?encuesta_id={id}
```

---

## **PRÓXIMOS PASOS**

### **Inmediatos (Esta Semana)**
1. **Aprobación QA:** Revisar y aprobar especificaciones técnicas
2. **Desarrollo:** Implementar los 3 endpoints según plan
3. **Testing:** Ejecutar suite completa de casos de prueba

### **Futuro (Sprints Siguientes)**  
1. **Filtros Avanzados:** Implementar `GET /encuestas/:id/resultados/segmentos`
2. **Exportación:** Implementar `GET /encuestas/:id/export.csv`
3. **Optimizaciones:** Cache de resultados, índices adicionales
4. **Analytics:** Métricas avanzadas y insights automáticos

---

**Documento preparado por:** Arquitectura Backend  
**Para:** Equipo QA, Frontend y Product Owner  
**Fecha de revisión:** 2025-11-12  
**Versión:** 1.0