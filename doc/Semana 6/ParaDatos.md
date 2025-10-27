# Conjunto Mínimo de Datos para Prueba del Módulo de Visualización Académica

## Usuarios del Sistema

### 1. Usuario Administrador
- **DNI:** 11111111
- **Contraseña:** 123456789
- **Rol:** administrador
- **Nombre:** Admin Sistema
- **Apellido:** Orquídeas
- **Teléfono:** +51999999999

### 2. Usuario Director
- **DNI:** 99999999
- **Contraseña:** 123456789
- **Rol:** director
- **Nombre:** Director
- **Apellido:** Institución
- **Teléfono:** +51988888888

### 3. Usuario Docente
- **DNI:** 77777777
- **Contraseña:** 123456789
- **Rol:** docente
- **Nombre:** Docente
- **Apellido:** Ejemplo
- **Teléfono:** +51977777777

### 4. Usuario Padre
- **DNI:** 88888888
- **Contraseña:** 123456789
- **Rol:** apoderado
- **Nombre:** Padre
- **Apellido:** Ejemplo
- **Teléfono:** +51966666666

## Datos del Estudiante (Hijo del Padre con DNI 88888888)

### Estudiante
- **Código:** P3001
- **Nombre:** Estudiante
- **Apellido:** Ejemplo
- **Nivel:** Primaria
- **Grado:** 3
- **Año Académico:** 2025
- **Estado Matrícula:** activo

## Relación Familiar
- **Apoderado ID:** 88888888 (Padre Ejemplo)
- **Estudiante ID:** P3001 (Estudiante Ejemplo)
- **Tipo Relación:** padre
- **Año Académico:** 2025

## Estructura Académica

### Nivel-Grado
- **Nivel:** Primaria
- **Grado:** 3
- **Descripción:** 3ro de Primaria

### Cursos del Estudiante
1. **Matemáticas**
   - **Código:** CP3001
   - **Nivel:** Primaria
   - **Grado:** 3
   - **Año Académico:** 2025

2. **Comunicación**
   - **Código:** CP3002
   - **Nivel:** Primaria
   - **Grado:** 3
   - **Año Académico:** 2025

3. **Ciencias**
   - **Código:** CP3003
   - **Nivel:** Primaria
   - **Grado:** 3
   - **Año Académico:** 2025

### Estructura de Evaluación (Año 2025)
1. **Examen**
   - **Peso:** 40%
   - **Tipo:** unica
   - **Orden:** 1

2. **Participación**
   - **Peso:** 20%
   - **Tipo:** recurrente
   - **Orden:** 2

3. **Revisión de Cuaderno**
   - **Peso:** 15%
   - **Tipo:** recurrente
   - **Orden:** 3

4. **Revisión de Libro**
   - **Peso:** 15%
   - **Tipo:** recurrente
   - **Orden:** 4

5. **Comportamiento**
   - **Peso:** 10%
   - **Tipo:** recurrente
   - **Orden:** 5

## Asignación Docente-Curso
- **Docente ID:** 77777777 (Docente Ejemplo)
- **Curso ID:** CP3001 (Matemáticas)
- **Nivel:** Primaria
- **Grado:** 3
- **Año Académico:** 2025

## Calificaciones de Ejemplo (Trimestre 1)

### Matemáticas
1. **Examen**
   - **Calificación:** 16.5
   - **Fecha:** 2025-03-15
   - **Estado:** preliminar

2. **Participación** (3 evaluaciones)
   - **Evaluación 1:** 14.0 (2025-03-05)
   - **Evaluación 2:** 15.0 (2025-03-12)
   - **Evaluación 3:** 14.8 (2025-03-19)

3. **Revisión de Cuaderno** (2 evaluaciones)
   - **Evaluación 1:** 15.2 (2025-03-08)
   - **Evaluación 2:** 15.0 (2025-03-22)

4. **Revisión de Libro** (2 evaluaciones)
   - **Evaluación 1:** 14.0 (2025-03-10)
   - **Evaluación 2:** 14.5 (2025-03-17)

5. **Comportamiento** (4 evaluaciones)
   - **Evaluación 1:** 18.0 (2025-03-01)
   - **Evaluación 2:** 17.5 (2025-03-07)
   - **Evaluación 3:** 18.5 (2025-03-14)
   - **Evaluación 4:** 18.0 (2025-03-21)

### Comunicación
1. **Examen**
   - **Calificación:** 15.2
   - **Fecha:** 2025-03-16
   - **Estado:** preliminar

2. **Participación** (3 evaluaciones)
   - **Evaluación 1:** 15.5 (2025-03-06)
   - **Evaluación 2:** 14.8 (2025-03-13)
   - **Evaluación 3:** 15.2 (2025-03-20)

## Asistencia de Ejemplo (Marzo 2025)

### Registros Diarios
- **2025-03-01:** presente
- **2025-03-02:** tardanza (08:15)
- **2025-03-03:** falta_injustificada
- **2025-03-04:** presente
- **2025-03-05:** presente
- **2025-03-06:** presente
- **2025-03-07:** presente
- **2025-03-08:** presente
- **2025-03-09:** presente
- **2025-03-10:** tardanza (08:20)
- **2025-03-11:** presente
- **2025-03-12:** presente
- **2025-03-13:** presente
- **2025-03-14:** presente
- **2025-03-15:** presente
- **2025-03-16:** presente
- **2025-03-17:** presente
- **2025-03-18:** presente
- **2025-03-19:** presente
- **2025-03-20:** presente
- **2025-03-21:** presente
- **2025-03-22:** presente
- **2025-03-23:** presente
- **2025-03-24:** presente
- **2025-03-25:** presente
- **2025-03-26:** presente
- **2025-03-27:** presente
- **2025-03-28:** presente
- **2025-03-29:** presente
- **2025-03-30:** presente
- **2025-03-31:** presente

## Resumen de Datos

Este conjunto de datos permite probar:

1. **Autenticación** con los 4 tipos de usuarios
2. **Selector de hijos** para el padre (1 hijo vinculado)
3. **Visualización de calificaciones** por componente y trimestre
4. **Cálculo de promedios** ponderados según estructura de evaluación
5. **Visualización de asistencia** con calendario y estadísticas
6. **Diferenciación** entre notas preliminares y finales
7. **Filtros** por año académico, trimestre y curso
8. **Exportación** de boletas y reportes de asistencia

## Instrucciones de Uso

1. **Login como Padre (88888888):**
   - Acceder al dashboard principal
   - Seleccionar al hijo (Estudiante Ejemplo)
   - Navegar a "Calificaciones" y "Asistencia"

2. **Login como Docente (77777777):**
   - Acceder al dashboard de docente
   - Ver cursos asignados (Matemáticas)
   - Probar carga de calificaciones y asistencia

3. **Login como Director (99999999):**
   - Acceder al dashboard de director
   - Configurar estructura de evaluación
   - Asignar permisos a docentes

4. **Login como Administrador (11111111):**
   - Acceder al dashboard de administrador
   - Gestionar usuarios y permisos
   - Configurar parámetros del sistema