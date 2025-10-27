Ahora voy a analizar la documentación del módulo de datos académicos (Semana 5) para proporcionar la sintaxis exacta para montar las rutas faltantes en `index.js`.

Basado en el análisis de los archivos [`doc/Semana 5/HUDetalladas_datos1.md`](doc/Semana 5/HUDetalladas_datos1.md:1), [`doc/Semana 5/DocumentacionAPI_datos1.md`](doc/Semana 5/DocumentacionAPI_datos1.md:1) y [`doc/Semana 5/Actual.md`](doc/Semana 5/Actual.md:1), aquí está el mapeo exacto de rutas que deben ser montadas:

## Análisis Detallado de Rutas por Módulo

### Módulo Académico (Semana 5-6)

#### HU-ACAD-01: Cargar Calificaciones mediante Plantilla Excel
**Archivo de rutas**: [`routes/grades.js`](routes/grades.js:1)
**Endpoints según documentación**:
- `POST /calificaciones/plantilla` → Generar plantilla Excel
- `POST /calificaciones/validar` → Validar archivo sin insertar
- `POST /calificaciones/cargar` → Procesar e insertar calificaciones
- `GET /calificaciones/reporte-errores/{id}` → Descargar reporte TXT de errores

#### HU-ACAD-02: Cargar Asistencia Diaria
**Archivo de rutas**: [`routes/attendance.js`](routes/attendance.js:1)
**Endpoints según documentación**:
- `GET /asistencias/verificar` → Verificar si ya existe registro
- `POST /asistencias/plantilla` → Generar plantilla Excel
- `POST /asistencias/validar` → Validar archivo sin insertar
- `POST /asistencias/cargar` → Procesar e insertar asistencias
- `GET /asistencias/reporte-errores/{id}` → Descargar reporte TXT de errores
- `GET /asistencias/estadisticas` → Estadísticas del día

#### HU-ACAD-09: Resumen Académico
**Archivo de rutas**: [`routes/academicSummary.js`](routes/academicSummary.js:1)
**Endpoints según documentación**:
- `GET /resumen-academico/estudiante/:id` → Resumen
- `GET /resumen-academico/estudiante/:id/export` → Exportar PDF

#### Gestión de Cursos y Estudiantes
**Archivo de rutas**: [`routes/academics.js`](routes/academics.js:1)
**Endpoints según documentación**:
- `GET /cursos/asignados?docente_id={id}` → Cursos del docente
- `GET /cursos?nivel={nivel}&grado={grado}` → Cursos por nivel/grado (director)
- `GET /estudiantes?curso_id={id}` → Estudiantes del curso
- `GET /cursos/estudiante/:estudiante_id` → Cursos del estudiante

#### HU-MSG-01: Docentes por curso
**Archivo de rutas**: [`routes/teachers.js`](routes/teachers.js:1)
**Endpoints según documentación**:
- `GET /docentes/curso/:curso_id` → Docentes por curso

#### Centro de Plantillas
**Archivo de rutas**: [`routes/templates.js`](routes/templates.js:1)
**Endpoints según documentación**:
- `GET /plantillas/tipos` → Listar tipos de plantillas
- `POST /plantillas/calificaciones` → Generar plantilla de calificaciones
- `POST /plantillas/asistencia` → Generar plantilla de asistencia
- `GET /plantillas/guias/{tipo}` → Obtener guía de uso
- `GET /plantillas/guias/{tipo}/pdf` → Descargar guía en PDF

## Sintaxis Exacta para index.js

Basado en el análisis, aquí está la sintaxis exacta que debe agregarse a `index.js`:

```javascript
// Importar rutas faltantes (agregar después de las importaciones existentes)
const gradesRoutes = require('./routes/grades');
const attendanceRoutes = require('./routes/attendance');
const gradesViewRoutes = require('./routes/gradesView');
const attendanceViewRoutes = require('./routes/attendanceView');
const academicsRoutes = require('./routes/academics');
const templatesRoutes = require('./routes/templates');
const messagingRoutes = require('./routes/messaging');

// Montar rutas (agregar después de las rutas existentes)
// Módulo de Carga de Datos Académicos
app.use('/calificaciones', gradesRoutes);
app.use('/asistencias', attendanceRoutes);

// Módulo de Visualización para Padres
app.use('/calificaciones/estudiante', gradesViewRoutes);
app.use('/asistencias/estudiante', attendanceViewRoutes);

// Módulo Académico General
app.use('/cursos', academicsRoutes);

// Centro de Plantillas
app.use('/plantillas', templatesRoutes);

// Módulo de Mensajería
app.use('/conversaciones', messagingRoutes);
app.use('/mensajes', messagingRoutes);
app.use('/archivos', messagingRoutes);
```

## Consideraciones Importantes

1. **Compatibilidad con Frontend**: Las rutas deben coincidir exactamente con las especificadas en [`doc/Semana 5/DocumentacionAPI_datos1.md`](doc/Semana 5/DocumentacionAPI_datos1.md:1)

2. **Orden de las Rutas**: Es importante montar las rutas más específicas antes que las genéricas para evitar conflictos

3. **Ruta de Resumen Académico**: Ya está montada incorrectamente como `/` cuando debería ser `/resumen-academico`

4. **Rutas Anidadas**: Algunas rutas como `/calificaciones/estudiante` y `/asistencias/estudiante` requieren montaje específico
