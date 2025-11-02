# REGLAS Y ESTÁNDARES DE DESARROLLO

## REGLA OBLIGATORIA: ACCESO UNIFICADO A DATOS DEL ESTUDIANTE SELECCIONADO

### META-INSTRUCCIÓN

**Todo módulo del sistema que requiera acceder a los datos del estudiante/hijo actual cuando el usuario tiene rol de apoderado DEBE OBLIGATORIAMENTE utilizar el hook personalizado `useStudentSelector` como único mecanismo permitido.**

### Sistema de Selección de Hijos para Padres

#### **Flujo Automático de Selección**

**Cuando el padre ingresa al sistema:**

1. **Verificación de rol**: El sistema detecta si el usuario tiene rol 'apoderado'
2. **Carga automática de hijos**: Se llama a `GET /auth/parent-context/:user_id` para obtener la lista de hijos
3. **Lógica de selección automática**:
   - **Si solo hay un hijo**: Se selecciona automáticamente sin mostrar selector
   - **Si hay múltiples hijos**: Se muestra el dropdown `StudentSelector` para que el padre elija

#### 📋 **Implementación Técnica**

**Hook `useStudentSelector` (líneas 26-57):**
```javascript
useEffect(() => {
  if (!isAuthenticated || !isParent) return

  let cancelled = false
  async function load() {
    setIsLoading(true)
    try {
      const ctx = await getParentContext(user.id)
      if (cancelled) return
      const hijos = ctx?.hijos || []
      setChildren(hijos)

      // 🔥 LÓGICA CLAVE DE SELECCIÓN AUTOMÁTICA
      const stored = sessionStorage.getItem(STORAGE_SELECTED_CHILD)
      const validStored = hijos.find((h) => h.id === stored)
      if (validStored) {
        setSelectedId(validStored.id)
        return
      }
      // 🎯 SI SOLO HAY UN HIJO, SE SELECCIONA AUTOMÁTICAMENTE
      if (hijos.length > 0) {
        setSelectedId(hijos[0].id)
        sessionStorage.setItem(STORAGE_SELECTED_CHILD, hijos[0].id)
      }
    } finally {
      if (!cancelled) setIsLoading(false)
    }
  }
  load()
  return () => {
    cancelled = true
  }
}, [isAuthenticated, isParent, user?.id, getParentContext])
```

**Componente `StudentSelector` (líneas 27-30):**
```javascript
// Si no es padre o no tiene hijos, no mostrar nada
if (!isParent || children.length === 0) {
  return null
}
```

####🔄 **Persistencia de Selección**

- **SessionStorage**: El hijo seleccionado se persiste en `sessionStorage` con clave `'selected_child_id'`
- **Recuperación automática**: Al recargar la página, se recupera la selección previa
- **Validación**: Se verifica que el hijo seleccionado aún exista en la lista actual

#### 🎨 **Experiencia de Usuario**

**Caso 1: Padre con un solo hijo**
- ✅ No se muestra el selector
- ✅ El hijo se selecciona automáticamente
- ✅ El dashboard muestra directamente la información del único hijo

**Caso 2: Padre con múltiples hijos**
- ✅ Se muestra el dropdown `StudentSelector` en el header
- ✅ Se puede cambiar entre hijos en cualquier momento
- ✅ La selección se persiste durante la sesión

#### 📊 **Estado Actual del Sistema**

Según el código analizado:
- ✅ **Detección automática**: El sistema sabe si el usuario es padre
- ✅ **Carga de hijos**: Obtiene la lista desde el backend
- ✅ **Selección inteligente**: Automática si hay un hijo, manual si hay varios
- ✅ **Persistencia**: Mantiene la selección durante la sesión
- ✅ **UI condicional**: Solo muestra el selector si es necesario



### PROTOCOLO OBLIGATORIO

#### 1. ÚNICA FUENTE DE VERDAD
- **ÚNICAMENTE** se permite el uso del hook `useStudentSelector` para obtener datos del estudiante seleccionado
- **ESTRICTAMENTE PROHIBIDO** crear fuentes alternativas de datos para esta información
- **ESTRICTAMENTE PROHIBIDO** crear contextos adicionales para gestión de selección de estudiantes
- **ESTRICTAMENTE PROHIBIDO** realizar llamadas directas a API para obtener información del estudiante seleccionado

#### 2. IMPLEMENTACIÓN OBLIGATORIA

```javascript
// ✅ USO CORRECTO Y OBLIGATORIO
import { useStudentSelector } from '../hooks/useStudentSelector'

function CualquierComponente() {
  const { selectedChild, isParent, isLoading } = useStudentSelector()
  
  if (!isParent) return null
  if (isLoading) return <LoadingSpinner />
  if (!selectedChild) return <div>Por favor selecciona un hijo</div>
  
  // Usar selectedChild para todas las operaciones
  return <div>Trabajando con: {selectedChild.nombre}</div>
}
```

#### 3. PROHIBICIONES ESTRICTAS

```javascript
// ❌ ESTRICTAMENTE PROHIBIDO - Llamada directa a API
const studentData = await apiFetch(`/students/${selectedId}`)

// ❌ ESTRICTAMENTE PROHIBIDO - Contexto adicional
const StudentContext = createContext()
const useStudentData = () => useContext(StudentContext)

// ❌ ESTRICTAMENTE PROHIBIDO - Estado local duplicado
const [selectedStudent, setSelectedStudent] = useState(null)

// ❌ ESTRICTAMENTE PROHIBIDO - sessionStorage directo
const studentId = sessionStorage.getItem('selected_child_id')
```

#### 4. PROPIEDADES DISPONIBLES DEL HOOK

El hook `useStudentSelector` proporciona las siguientes propiedades:

```javascript
const {
  isParent,        // boolean: true si el usuario es apoderado
  isLoading,       // boolean: true mientras carga los hijos
  children,         // Student[]: lista completa de hijos del apoderado
  selectedId,      // string: ID del hijo actualmente seleccionado
  selectedChild,   // Student | null: objeto completo del hijo seleccionado
  selectChild,      // (id: string) => void: función para cambiar selección
} = useStudentSelector()
```

#### 5. FLUJO DE TRABAJO OBLIGATORIO

1. **Verificar rol**: Siempre verificar `isParent` antes de usar datos del estudiante
2. **Manejar carga**: Siempre mostrar estado de carga mientras `isLoading` es true
3. **Validar selección**: Siempre verificar que `selectedChild` no sea null
4. **Usar objeto completo**: Utilizar siempre `selectedChild` (no solo `selectedId`)
5. **Usar función de cambio**: Utilizar siempre `selectChild` para cambiar la selección

#### 6. EJEMPLOS DE IMPLEMENTACIÓN CORRECTA

```javascript
// Componente de calificaciones (actualizado con componentes académicos)
function GradesView() {
  const { selectedChild, isParent, isLoading } = useStudentSelector()
  
  if (!isParent) return <div>Acceso denegado</div>
  if (isLoading) return <LoadingSpinner />
  if (!selectedChild) return <StudentSelector />
  
  // Usar el ID del estudiante seleccionado para consultas con el servicio actualizado
  const { data: grades } = useQuery({
    queryKey: ['grades', selectedChild.id],
    queryFn: () => academicsViewService.getGrades(selectedChild.id, academicYear)
  })
  
  // Obtener cursos del estudiante con el servicio corregido
  const { data: courses } = useQuery({
    queryKey: ['courses', selectedChild.id],
    queryFn: () => academicsViewService.getStudentCourses(selectedChild.id, academicYear)
  })
  
  return (
    <div>
      <h2>Calificaciones de {selectedChild.nombre} {selectedChild.apellido}</h2>
      <p>Grado: {selectedChild.grado}</p>
      
      {/* Componentes académicos actualizados con validación de arrays */}
      <FilterControls
        courses={courses || []}
        selectedYear={academicYear}
        onCourseChange={handleCourseChange}
      />
      
      <GradesTable
        grades={grades || []}
        formatType={formatType}
        onFormatToggle={handleFormatToggle}
      />
    </div>
  )
}

// Componente de asistencia
function AttendanceView() {
  const { selectedChild, isParent, isLoading } = useStudentSelector()
  
  if (!isParent) return null
  if (isLoading) return <LoadingSpinner />
  if (!selectedChild) return <StudentSelector />
  
  // Usar el ID del estudiante seleccionado para consultas
  const { data: attendance } = useQuery({
    queryKey: ['attendance', selectedChild.id],
    queryFn: () => attendanceService.getAttendance(selectedChild.id)
  })
  
  return <AttendanceCalendar data={attendance} />
}
```

#### 7. INTEGRACIÓN CON SERVICIOS

Los servicios que requieren el ID del estudiante deben recibirlo como parámetro:

```javascript
// ✅ CORRECTO - El servicio recibe el ID como parámetro (servicio actualizado)
const grades = await academicsViewService.getGrades(selectedChild.id, academicYear)

// ✅ CORRECTO - El servicio de cursos retorna array validado
const courses = await academicsViewService.getStudentCourses(selectedChild.id, academicYear)

// ❌ INCORRECTO - El servicio obtiene el ID internamente
const grades = await gradesService.getCurrentStudentGrades()

// ❌ INCORRECTO - Acceso directo a datos sin validación
const courses = apiData.cursos // Sin validación de array
```

### RESPONSABILIDADES

#### DESARROLLADORES
- **OBLIGATORIO**: Usar `useStudentSelector` en cualquier componente que necesite datos del estudiante
- **OBLIGATORIO**: Verificar siempre el rol y estado de carga
- **OBLIGATORIO**: No crear alternativas o duplicaciones de esta lógica

#### CODE REVIEWERS
- **OBLIGATORIO**: Rechazar cualquier PR que implemente acceso alternativo a datos del estudiante
- **OBLIGATORIO**: Verificar que todo acceso a datos del estudiante use el hook estandarizado
- **OBLIGATORIO**: Asegurar que no existan llamadas directas a API para esta información

#### TECH LEAD
- **OBLIGATORIO**: Asegurar cumplimiento del protocolo en todo el código base
- **OBLIGATORIO**: Realizar auditorías periódicas para detectar violaciones
- **OBLIGATORIO**: Proporcionar entrenamiento sobre el uso correcto del hook

### VIOLACIONES Y CONSECUENCIAS

#### VIOLACIONES CRÍTICAS
1. Crear contexto adicional para gestión de estudiantes
2. Realizar llamadas directas a API para obtener datos del estudiante seleccionado
3. Mantener estado local duplicado de selección de estudiantes
4. Usar sessionStorage directamente para esta información

#### CONSECUENCIAS
- **Rechazo automático** del Pull Request
- **Obligación de refactorizar** usando el hook estandarizado
- **Bloqueo del merge** hasta cumplir con el protocolo
- **Revisión obligatoria** por Tech Lead

### JUSTIFICACIÓN

Esta regla asegura:
- **Consistencia del estado**: Única fuente de verdad evita inconsistencias
- **Centralización de lógica**: Mantenimiento simplificado y menos duplicación
- **Sincronización automática**: Todos los componentes se actualizan simultáneamente
- **Persistencia unificada**: Manejo centralizado de sessionStorage
- **Performance optimizada**: Carga única de datos compartida entre componentes
- **Validación robusta**: Los servicios académicos retornan arrays validados previniendo errores de `.map()`
- **Integración segura**: Componentes como `FilterControls` y `GradesTable` validan tipos de datos antes de procesarlos

---

**Última actualización:** 29 de octubre de 2025  
**Versión de la regla:** 1.0.0  
**Estado:** VIGENTE Y OBLIGATORIA