# Contexto para el Desarrollo Frontend - Semana 5: Módulo de Datos Académicos (Carga)

## 📋 Visión General del Módulo

El Módulo de Datos Académicos permite a docentes y directores cargar masivamente calificaciones y asistencia mediante plantillas Excel. El sistema implementa un flujo de validación riguroso, generación de alertas automáticas y un sistema de reportes de errores.

## 🔐 Autenticación y Autorización

### Requisitos de Autenticación
- **JWT Token**: Todos los endpoints requieren autenticación JWT
- **Header Format**: `Authorization: Bearer <token>`
- **Token Payload**: El backend valida el rol del usuario para determinar el acceso

### Roles y Permisos
| Rol | Permisos de Carga | Acceso a Datos |
|-----|------------------|----------------|
| **Docente** | Solo cursos asignados (`asignaciones_docente_curso`) | Ver estudiantes de cursos asignados |
| **Director** | Todos los cursos sin restricciones | Ver estudiantes de cualquier curso |

## 🏗️ Arquitectura de Datos

### Entidades Principales
1. **usuarios**: Docentes y directores
2. **estudiantes**: Información de estudiantes
3. **cursos**: Cursos académicos
4. **nivel_grado**: Niveles y grados
5. **asignaciones_docente_curso**: Asignaciones de docentes a cursos
6. **estructura_evaluacion**: Componentes de evaluación
7. **evaluaciones**: Calificaciones registradas
8. **asistencias**: Registros de asistencia

### Relaciones Clave
- Docente → Asignación → Curso (1:N)
- Curso → Estudiantes (1:N)
- Estructura de Evaluación → Componente (1:N)
- Estudiante → Evaluación (1:N)
- Estudiante → Asistencia (1:N)

## 📊 Flujo General de Carga de Datos

### Flujo Común para Calificaciones y Asistencia
1. **Selección de Contexto** → 2. **Descarga de Plantilla** → 3. **Carga y Validación** → 4. **Procesamiento**

### Diferencias Clave entre Módulos
| Aspecto | Calificaciones | Asistencia |
|---------|---------------|------------|
| **Granularidad** | Por componente/curso | Por día completo |
| **Validación** | Únicos por componente/trimestre | Únicos por estudiante/fecha |
| **Plantillas** | Por componente específico | Por fecha específica |
| **Alertas** | Bajo rendimiento (< 11) | Tardanzas, faltas, patrones |

## 🔌 Endpoints API Disponibles

### Contexto y Datos Compartidos
```http
GET /cursos/asignados?docente_id={id}           # Cursos del docente
GET /cursos?nivel={nivel}&grado={grado}          # Cursos por nivel/grado
GET /estudiantes?curso_id={id}                   # Estudiantes del curso
GET /estructura-evaluacion?año={año}             # Componentes de evaluación
```

### Carga de Calificaciones
```http
POST /calificaciones/plantilla                    # Generar plantilla
POST /calificaciones/validar                      # Validar archivo
POST /calificaciones/cargar                       # Cargar datos
GET  /calificaciones/reporte-errores/{id}         # Descargar errores
```

### Carga de Asistencia
```http
GET  /asistencias/verificar?curso_id={id}&fecha={fecha}  # Verificar duplicados
POST /asistencias/plantilla                              # Generar plantilla
POST /asistencias/validar                                # Validar archivo
POST /asistencias/cargar                                 # Cargar datos
GET  /asistencias/reporte-errores/{id}                    # Descargar errores
GET  /asistencias/estadisticas?curso_id={id}&fecha={fecha} # Estadísticas
```

## 📝 Estructuras de Datos Importantes

### Respuesta de Cursos Asignados (Docente)
```json
{
  "success": true,
  "data": {
    "docente": { "id": "usr_doc_001", "nombre": "Ana María Rodríguez Vega" },
    "cursos": [
      {
        "id": "cur_001",
        "nombre": "Matemáticas",
        "nivel_grado": { "id": "ng_006", "nivel": "Primaria", "grado": "3" },
        "total_estudiantes": 28
      }
    ]
  }
}
```

### Estructura de Evaluación
```json
{
  "success": true,
  "data": {
    "componentes": [
      {
        "id": "eval_001",
        "nombre_item": "Examen",
        "peso_porcentual": 40.00,
        "tipo_evaluacion": "unica",
        "orden_visualizacion": 1
      }
    ]
  }
}
```

## ✅ Validaciones Clave Implementadas en Backend

### Validaciones de Calificaciones
- **Rango numérico**: 0-20 con hasta 2 decimales
- **Unicidad**: Componente `unica` → 1 registro/estudiante/trimestre
- **Duplicados**: Componente `recurrente` → 1 registro/estudiante/fecha
- **Integridad**: Estudiante debe pertenecer al curso

### Validaciones de Asistencia
- **Estados válidos**: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada
- **Formato de hora**: HH:MM (solo para Tardanza, rango 06:00-18:00)
- **Unicidad**: 1 registro/estudiante/fecha
- **Fecha**: Solo pasado o presente, dentro del año académico

## 🚨 Sistema de Alertas Automáticas

### Calificaciones
- **Bajo rendimiento**: Calificación < 11
- **Notificación**: WhatsApp + plataforma al apoderado

### Asistencia
- **Tardanza**: Alerta inmediata
- **Falta injustificada**: Alerta con solicitud de justificación
- **Patrón crítico**: 3+ faltas injustificadas consecutivas
- **Patrón preventivo**: 5+ tardanzas en un trimestre
- **Confirmación**: Por cada asistencia presente

## 📁 Estructura de Plantillas Excel

### Plantilla de Calificaciones
- **Columnas**: A=código_estudiante, B=nombre_completo, C=calificación, D=observaciones
- **Metadata**: componente_id, fecha_evaluacion
- **Validación**: 0-20, 2 decimales máximos

### Plantilla de Asistencia
- **Columnas**: A=código_estudiante, B=nombre_completo, C=estado, D=hora_llegada, E=justificacion
- **Metadata**: fecha_asistencia
- **Validación**: Dropdown de estados, formato HH:MM para hora

## 🔄 Estados y Flujos de UI

### Estados del Wizard
1. **Estado inicial**: Selección de contexto vacía
2. **Contexto completo**: Botón "Continuar" habilitado
3. **Descarga**: Generando plantilla
4. **Carga**: Archivo subido, iniciando validación
5. **Validación**: Procesando filas
6. **Resultados**: Reporte de resumen y errores
7. **Final**: Registros insertados, alertas generadas

## 🛠️ Consideraciones Técnicas para Frontend

### Manejo de Archivos
- **Formatos aceptados**: .xlsx, .xls
- **Tamaño máximo**: 10MB (calificaciones), 5MB (asistencia)
- **Implementación recomendada**: Componente drag & drop con previsualización

### Manejo de Errores
- **Reporte de errores**: TXT con formato estructurado
- **URL de descarga**: Temporal (24 horas)
- **Visualización**: Tabla con errores detallados por fila

### Performance
- **Archivos grandes**: Considerar procesamiento por lotes
- **Feedback**: Barra de progreso durante validación
- **Timeout**: Configurar tiempos de espera apropiados

## 📊 Visualizaciones Recomendadas

### Reporte de Resultados
- **Calificaciones**: Gráfico de torta (válido/inválido)
- **Asistencia**: Gráfico de barras por estado (Presente, Tardanza, etc.)
- **Librería recomendada**: Recharts o Chart.js

### Indicadores
- **Resumen de carga**: Total procesados, insertados, omitidos
- **Alertas generadas**: Conteo por tipo
- **Estadísticas**: Porcentajes y totales

## 🔐 Consideraciones de Seguridad

### Token Management
- **Almacenamiento**: localStorage o httpOnly cookies
- **Refresh**: Implementar renovación automática
- **Expiración**: Manejar redirección a login

### Validaciones en Frontend
- **Prevalidación**: Formatos antes de envío
- **Sanitización**: Prevenir inyección XSS
- **Rate limiting**: Respetar límites del backend

## 📱 Responsive Design

### Dispositivos Móviles
- **Wizard**: Implementar como carrusel o pasos secuenciales
- **Tablas**: Scroll horizontal para datos
- **Botones**: Tamaño mínimo para toque táctil

### Consideraciones de Accesibilidad
- **Contraste**: Cumplir WCAG AA como mínimo
- **Navegación**: Teclado y lector de pantalla
- **Feedback**: Mensajes claros y descriptivos

## 🔄 Integración con Backend

### Flujo de Comunicación
1. **Autenticación**: Verificar token JWT
2. **Contexto**: Obtener cursos y estudiantes disponibles
3. **Plantilla**: Solicitar generación según contexto
4. **Validación**: Enviar archivo para validación
5. **Procesamiento**: Confirmar inserción de datos válidos
6. **Notificaciones**: Recibir actualizaciones en tiempo real (opcional)

### Manejo de Estados
- **Optimista**: Actualizar UI antes de confirmación
- **Rollback**: Revertir cambios si falla inserción
- **Caching**: Almacenar datos de contexto para evitar peticiones repetidas

## 🚀 Recomendaciones de Implementación

### Componentes Reutilizables
- **FileUploader**: Para carga de archivos
- **ProgressBar**: Indicadores de progreso
- **DataTable**: Tabla con ordenamiento y filtrado
- **Wizard**: Contenedor de pasos secuenciales

### Manejo de Estados
- **Redux/Zustand**: Para estado global de usuario y autenticación
- **React Query**: Para caché y sincronización con API
- **Formularios**: React Hook Form con Yup/Zod para validaciones

### Optimización
- **Lazy loading**: Cargar componentes bajo demanda
- **Memoización**: Evitar renderizados innecesarios
- **Bundle splitting**: Dividir código por funcionalidades

---

## 📚 Puntos de Referencia

Para ejemplos detallados de respuestas, flujos y casos de uso, consulta:
- **Documentación API**: `doc/Semana 5/DocumentacionAPI_datos1.md`
- **Historias de Usuario**: `doc/Semana 5/HUDetalladas_datos1.md`

Este contexto proporciona toda la información necesaria para iniciar el desarrollo frontend del Módulo de Datos Académicos, asegurando una integración fluida con el backend existente.