# Análisis Completo del Módulo de Datos 1 (Carga de Calificaciones y Asistencia)

## Estructura del Módulo Académico

Después de analizar todos los archivos relevantes, he identificado que el módulo académico está dividido en **6 submódulos especializados**:

### 1. Módulo Académico General (`academics.js`)
- **Propósito**: Gestión de cursos y estudiantes (contexto compartido)
- **Funcionalidades**:
  - Obtener cursos asignados a docentes
  - Obtener cursos por nivel/grado (para directores)
  - Listar estudiantes de un curso
- **Tablas utilizadas**: `usuarios`, `cursos`, `nivel_grado`, `estudiantes`, `asignaciones_docente_curso`, `relaciones_familiares`

### 2. Módulo de Estructura de Evaluación (`evaluation.js`)
- **Propósito**: Configurar componentes de evaluación por año académico
- **Funcionalidades**:
  - Ver estructura de evaluación vigente
  - Crear/actualizar estructura (solo directores)
  - Ver historial de configuraciones
  - Obtener plantillas predefinidas
  - Previsualizar impacto de pesos
  - Listar niveles y grados disponibles
- **Tablas utilizadas**: `estructura_evaluacion`, `nivel_grado`

### 3. Módulo de Carga de Calificaciones (`grades.js`)
- **Propósito**: Carga masiva de calificaciones mediante plantillas Excel
- **Funcionalidades**:
  - Generar plantilla Excel para un componente específico
  - Validar archivo Excel sin insertar
  - Procesar e insertar calificaciones válidas
  - Descargar reporte de errores en TXT
- **Tablas utilizadas**: `evaluaciones`, `cursos`, `nivel_grado`, `estudiantes`, `estructura_evaluacion`

### 4. Módulo de Carga de Asistencia (`attendance.js`)
- **Propósito**: Registro masivo de asistencia diaria mediante plantillas Excel
- **Funcionalidades**:
  - Verificar si ya existe registro para una fecha
  - Generar plantilla Excel de asistencia
  - Validar archivo Excel sin insertar
  - Procesar e insertar registros válidos
  - Descargar reporte de errores en TXT
  - Obtener estadísticas del día
- **Tablas utilizadas**: `asistencias`, `cursos`, `nivel_grado`, `estudiantes`

### 5. Módulo de Visualización de Calificaciones (`gradesView.js`)
- **Propósito**: Consulta de calificaciones para padres (apoderados)
- **Funcionalidades**:
  - Ver calificaciones de un estudiante por componente
  - Calcular promedio de componente
- **Tablas utilizadas**: `evaluaciones`, `cursos`, `nivel_grado`, `estudiantes`, `estructura_evaluacion`

### 6. Módulo de Visualización de Asistencia (`attendanceView.js`)
- **Propósito**: Consulta de asistencia para padres (apoderados)
- **Funcionalidades**:
  - Ver asistencia por período (mes/trimestre)
  - Obtener estadísticas de asistencia
  - Exportar asistencia en PDF
- **Tablas utilizadas**: `asistencias`, `estudiantes`, `nivel_grado`

### 7. Módulo de Resumen Académico (`academicSummary.js`)
- **Propósito**: Visualización consolidada de rendimiento académico (HU-ACAD-09)
- **Funcionalidades**:
  - Resumen general de calificaciones
  - Resumen de asistencia
  - Gráficos y estadísticas
- **Tablas utilizadas**: `evaluaciones`, `asistencias`, `estudiantes`, `cursos`, `nivel_grado`

