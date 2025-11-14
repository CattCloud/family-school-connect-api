# **Historias de Usuario Detalladas - Módulo de Visualizacion de Datos Academicos**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Padres/apoderados que consultan
2. **estudiantes** - Estudiantes cuyos datos se visualizan
3. **relaciones_familiares** - Vinculación padre-hijo
4. **cursos** - Cursos del estudiante
5. **estructura_evaluacion** - Componentes de evaluación configurados
6. **evaluaciones** - Calificaciones registradas
7. **asistencias** - Registros de asistencia diaria
8. **nivel_grado** - Información académica del estudiante

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login con selector de hijos
- **Módulo de Gestión de Usuarios** (Semana 5) - Estructura de evaluación definida
- **Módulo de Carga de Datos** (Semanas 6-7 Parte 1) - Calificaciones y asistencia registradas

### **Roles Involucrados:**

- **Padre/Apoderado:** Usuario que consulta información académica de sus hijos

---

## **HU-ACAD-01 — Ver Calificaciones de Componente por Trimestre**

**Título:** Consulta detallada de calificaciones por componente de evaluación

**Historia:**

> Como padre/apoderado, quiero ver las calificaciones de mi hijo por componente de evaluación y trimestre para hacer seguimiento detallado de su desempeño académico en cada aspecto evaluado.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Calificaciones" desde dashboard del padre
- **CA-02:** Pantalla principal muestra **controles de filtrado:**
    - **Selector de Año Académico:** Dropdown con años disponibles (default: año actual)
    - **Selector de Trimestre:** Tabs horizontales {Trimestre 1, Trimestre 2, Trimestre 3} (default: trimestre actual)
    - **Selector de Curso:** Dropdown con cursos del estudiante en el año/trimestre seleccionado
    - **Selector de Componente:** Dropdown con componentes de evaluación activos (extraídos de `estructura_evaluacion`)
- **CA-03:** Al seleccionar curso y componente, el sistema muestra:
    
    **Para componentes RECURRENTES (ej. Participación, Tareas):**
    
    - **Tabla de Notas Individuales** (TanStack Table):
        - Columnas dinámicas: Fecha de evaluación | Calificación | Estado
        - Fecha de evaluacion en formato facil de leer
        - Filas: Una por cada evaluación registrada
        - Formato de calificación según preferencia del padre (numérico 0-20 o letras AD/A/B/C)
        - Badge de estado:
            - "Preliminar" (fondo amarillo/naranja) si `estado = 'preliminar'`
            - "Final" (fondo verde/azul) si `estado = 'final'`
        - Ordenamiento: Fecha descendente (más reciente primero)
        - Paginación: 10 registros por página
    - **Card de Resumen Superior:**
        - Título: "Promedio Actual - [Nombre Componente]"
        - Valor: Promedio del componente (calculado en tiempo real)
        - Subtítulo: "Basado en X evaluaciones registradas"
        - Indicador visual: Color según promedio
        - Nota: "Este promedio es preliminar y puede cambiar" (si hay notas preliminares)
    
    **Para componentes ÚNICOS (ej. Examen Trimestral):**
    
    - **Tabla Simple** (TanStack Table):
        - Columnas: Fecha de evaluación | Calificación | Estado
        - Fecha de evaluacion en formato facil de leer
        - Una sola fila (solo una evaluación)
        - Mismo formato de badges de estado
    - **Card de Resumen Superior:**
        - Título: "Calificación - [Nombre Componente]"
        - Valor: Calificación única
        - Badge de estado claramente visible
- **CA-04:** Toggle de Formato de Visualización:
    - Ubicación: Esquina superior derecha de la tabla
    - Opciones: "Numérico (0-20)" | "Letras (AD, A, B, C)"
    - Comportamiento:
        - Default: Numérico
        - Al cambiar, todas las calificaciones se convierten automáticamente
        - Conversión según regla:
            - AD: 18-20
            - A: 14-17
            - B: 11-13
            - C: 0-10
    - Preferencia se guarda en localStorage del navegador
- **CA-05:** Diferenciación Visual Clara:
    - **Notas Preliminares:**
        - Badge amarillo/naranja con texto "Preliminar"
        - Texto de advertencia: "Las notas preliminares pueden modificarse hasta el cierre del trimestre"
    - **Notas Finales:**
        - Badge verde/azul con texto "Final"
        - Ícono de candado  indicando que no pueden modificarse
        - Texto de confirmación: " Notas oficiales del trimestre"
- **CA-06:** Estado Vacío:
    - Si no hay evaluaciones registradas para el componente/trimestre seleccionado:
        - Mensaje: "Aún no hay calificaciones registradas para [Componente] en el Trimestre [X]"
        - Ícono ilustrativo
        - Sugerencia: "Consulte con el docente si tiene dudas"
- **CA-07:** Carga y Performance:
    - Skeleton loaders mientras se cargan los datos
    - Timeout: 5 segundos máximo
    - Mensaje de error claro si falla la carga

---

### **Validaciones de Negocio**

- **VN-01:** Padre solo ve calificaciones de sus hijos vinculados en `relaciones_familiares`
- **VN-02:** Solo mostrar cursos con al menos una evaluación registrada
- **VN-03:** Solo mostrar componentes activos de `estructura_evaluacion` del año académico
- **VN-04:** Promedios calculados en tiempo real (no pre-calculados)
- **VN-05:** Para componentes recurrentes: promedio = suma de calificaciones / cantidad de evaluaciones
- **VN-06:** Ordenar evaluaciones por fecha descendente (más reciente primero)
- **VN-07:** Respetar filtros de año académico (no mezclar años)

---

### **UI/UX**

- **UX-01:** Diseño responsivo mobile-first:
    - Desktop: Tabla completa con todas las columnas
    - Tablet: Columnas prioritarias visibles, observaciones colapsables
    - Mobile: Cards individuales en lugar de tabla
- **UX-02:** Controles de Filtrado Sticky:
    - Selectores permanecen fijos en la parte superior al hacer scroll
    - Breadcrumb visible: Año > Trimestre > Curso > Componente
- **UX-03:** TanStack Table Features:
    - Columnas ordenables (clic en header)
    - Búsqueda rápida en observaciones (opcional)
    - Exportar **PDF (boleta de notas)** (botón en esquina superior) - Libreria Puppeteer
- **UX-04:** Card de Resumen Destacado:
    - Diseño tipo "hero" con fondo gradiente
    - Número grande para el promedio
    - Animación suave al actualizar valor
- **UX-05:** Tooltips Informativos:
    - Hover en badge "Preliminar": "Las notas pueden cambiar hasta el cierre del trimestre"
    - Hover en badge "Final": "Notas oficiales certificadas por la dirección"
    - Color segun promedio
- **UX-06:** Animaciones Sutiles:
    - Fade-in al cargar tabla
    - Highlight temporal en nueva fila al cambiar filtros
    - Transición suave en toggle de formato

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargando datos del estudiante y filtros disponibles
- **EF-02:** Estado de selección: Esperando selección de curso y componente
- **EF-03:** Estado de carga de datos: Fetching calificaciones del backend
- **EF-04:** Estado de visualización: Tabla y resumen poblados
- **EF-05:** Estado vacío: No hay datos para mostrar
- **EF-06:** Estado de error: Fallo en la carga de datos

---

### **Validaciones de Entrada**

- **VE-01:** Validar que estudiante_id existe y pertenece al padre
- **VE-02:** Validar que curso_id existe y está asignado al estudiante
- **VE-03:** Validar que componente_id existe en estructura_evaluacion del año
- **VE-04:** Validar que trimestre es válido (1, 2 o 3)

---

### **Mensajes de Error**

- "No se pudieron cargar las calificaciones. Intente nuevamente."
- "El curso seleccionado no existe o no está disponible para este año."
- "No tiene permisos para ver las calificaciones de este estudiante."
- "Error al calcular el promedio. Contacte con soporte técnico."

---

### **Mensajes Informativos**

- "Aún no hay calificaciones registradas para Participación en el Trimestre 1"
- "Las notas preliminares están sujetas a cambios hasta el cierre del trimestre"
- "Este promedio se actualiza automáticamente cada vez que el docente registra una nueva nota"
- "Calificaciones finales del trimestre certificadas el [fecha]"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Login con selector de hijos)
    - HU-ACAD-01 (Carga de calificaciones por docentes)
- **HU Siguientes:**
    - HU-ACAD-09 (Visualizar promedio trimestral consolidado)
    - HU-ACAD-16 (Recepción de alertas de bajo rendimiento)

---

## **HU-ACAD-02 — Consultar Asistencia Diaria con Calendario y Estadísticas**

**Título:** Visualización de asistencia con calendario interactivo

**Historia:**

> Como padre/apoderado, quiero consultar la asistencia diaria de mi hijo mediante un calendario visual con códigos de colores para monitorear fácilmente su presencia en la institución y detectar patrones.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Asistencia" desde dashboard del padre
- **CA-02:** Pantalla principal muestra **controles de filtrado:**
    - **Selector de Año Académico:** Dropdown con años disponibles (default: año actual)
    - **Selector de Vista:** Tabs {Mes, Trimestre, Año Completo} (default: Mes actual)
- **CA-03:** **Calendario Visual** (React Big Calendar):
    - **Vista por Mes:**
        - Calendario mensual estándar (7 columnas x 4-5 filas)
        - Cada día muestra:
            - Badge circular con ícono según estado de asistencia
            - Tooltip al hover con detalle completo
        - Navegación: Flechas < > para cambiar de mes
        - Botón "Hoy" para regresar al mes actual
    - **Vista por Trimestre:**
        - 3 mini-calendarios lado a lado (uno por cada mes del trimestre)
        - Mismo sistema de códigos de colores
        - Zoom reducido pero badges visibles

- **CA-04:** **Códigos de Colores y Estados:**
    - **Presente :**
        - Color: Verde (#2ECC71)
        - Tooltip: "Presente"
    - **Tardanza :**
        - Color: Amarillo (#F39C12)
        - Tooltip: "Tardanza"
    - **Permiso :**
        - Color: Azul (#3498DB)
        - Tooltip: "Permiso "
    - **Falta Justificada :**
        - Color: Naranja (#E67E22)
        - Tooltip: "Falta Justificada "
    - **Falta Injustificada:**
        - Color: Rojo (#E74C3C)
        - Tooltip: "Falta Injustificada "
    - **Sin Registro:**
        - Color: Gris claro (#ECF0F1)
        - Ícono: —
        - Tooltip: "Sin registro"
    - **Día No Lectivo:**
        - Color: Gris oscuro (#95A5A6)
        - Ícono: —
        - Tooltip: "Día no lectivo" (fines de semana, feriados)
- **CA-05:** **Panel de Estadísticas** (lateral o superior):
    - **Card Principal:** Resumen del período visible (mes/trimestre/año)
        - Total de días lectivos
        - Días con registro
        - Porcentaje de asistencia global
        - Gráfico de dona (Recharts) con distribución de estados
    - **Desglose Detallado:**
        - **Presentes:** XX días (XX%)
        - **Tardanzas:** XX días (XX%)
        - **Permisos:** XX días (XX%)
        - **Faltas Justificadas:** XX días (XX%)
        - **Faltas Injustificadas:** XX días (XX%)
        - Cada línea con badge de color correspondiente
    - **Indicadores Especiales:**
        -  Alerta si faltas injustificadas >= 3 consecutivas
        -  Advertencia si tardanzas >= 5 en el trimestre
        -  Reconocimiento si asistencia >= 95%
- **CA-06:** **Interactividad del Calendario:**
    - Clic en un día con registro: Abre modal con detalle completo
        - Fecha
        - Estado
        - Hora de llegada (si aplica)
        - Justificación (si aplica)
        - Fecha de registro
        - Registrado por (nombre del docente)
    - Selección de rango de fechas:
        - Permite seleccionar múltiples días (click + drag)
        - Muestra estadísticas solo del rango seleccionado
        - Botón "Limpiar selección"
- **CA-07:** **Exportación de Datos:**
    - Botón "Exportar" en esquina superior
    - Opciones:
        - Exportar a PDF (reporte con calendario visual)
    - Incluye filtros aplicados y estadísticas
- **CA-08:** **Estado Vacío:**
    - Si no hay registros de asistencia para el período:
        - Mensaje: "Aún no hay registros de asistencia para [Mes/Trimestre/Año]"
        - Calendario visible pero sin datos
        - Sugerencia: "Los registros se actualizan diariamente"

---

### **Validaciones de Negocio**

- **VN-08:** Padre solo ve asistencia de sus hijos vinculados
- **VN-09:** Solo mostrar registros del año académico seleccionado
- **VN-10:** Días no lectivos marcados automáticamente (fines de semana, feriados institucionales)
- **VN-11:** Porcentajes calculados sobre días lectivos, no días calendario
- **VN-12:** Estadísticas actualizadas en tiempo real al cambiar filtros
- **VN-13:** Validar que no haya registros duplicados para una misma fecha

---

### **UI/UX**

- **UX-07:** Diseño Responsivo:
    - **Desktop:** Calendario grande + panel lateral de estadísticas
    - **Tablet:** Calendario completo + estadísticas abajo
    - **Mobile:**
        - Vista mensual por defecto
        - Calendario ocupa ancho completo
        - Estadísticas en cards apiladas abajo
        - Swipe horizontal para cambiar de mes
- **UX-08:** React Big Calendar Customizado:
    - Estilos personalizados con colores institucionales
    - Días con eventos destacados con borde
    - Navegación intuitiva con teclado (flechas)
    - Accesibilidad: atributos ARIA completos
- **UX-09:** Panel de Estadísticas Sticky:
    - Se mantiene visible al hacer scroll en el calendario
    - Animación de números al actualizar
    - Gráfico de dona con Recharts (interactivo)
    - Hover en segmentos muestra tooltip con valor exacto
- **UX-10:** Leyenda de Colores:
    - Siempre visible en la parte superior
    - Cards pequeñas con color + ícono + nombre de estado
    - Diseño compacto y claro
- **UX-11:** Loading States:
    - Skeleton del calendario mientras carga
    - Shimmer effect en estadísticas
    - No bloquear interacción con navegación de meses
- **UX-12:** Animaciones Sutiles:
    - Fade-in al cargar calendario
    - Hover effect en días con registro
    - Transición suave entre vistas (mes/trimestre/año)
    - Highlight en día actual

---

### **Estados y Flujo**

- **EF-08:** Estado inicial: Cargando calendario del mes actual
- **EF-09:** Estado de navegación: Cambiando de mes/vista
- **EF-10:** Estado de visualización: Calendario poblado con datos
- **EF-11:** Estado de detalle: Modal de día específico abierto
- **EF-12:** Estado de selección: Rango de fechas seleccionado
- **EF-13:** Estado vacío: Sin registros para el período
- **EF-14:** Estado de exportación: Generando reporte PDF

---

### **Validaciones de Entrada**

- **VE-08:** Validar que fecha_inicio <= fecha_fin en selección de rango
- **VE-09:** Validar que año académico existe y tiene registros
- **VE-10:** Validar que estudiante_id pertenece al padre autenticado

---

### **Mensajes de Error**

- "No se pudieron cargar los registros de asistencia. Intente nuevamente."
- "Error al generar el reporte. Contacte con soporte técnico."
- "No tiene permisos para ver la asistencia de este estudiante."

---

### **Mensajes Informativos**

- "Aún no hay registros de asistencia para este período"
- "🚨 Atención: Se detectaron 3 faltas injustificadas consecutivas"
- "⚠️ Su hijo(a) ha acumulado 5 tardanzas en este trimestre"
- "✅ Excelente: Asistencia del 98% en el trimestre"
- "Los registros se actualizan diariamente después de las 6:00 PM"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Login con selector de hijos)
    - HU-ACAD-02 (Carga de asistencia por docentes)
- **HU Siguientes:**
    - HU-ACAD-15 (Alertas automáticas de asistencia)

---

## **HU-ACAD-03 — Visualizar Resumen Trimestral y Anual Consolidado**

**Título:** Vista consolidada de promedios y resultados finales por curso

**Historia:**

> Como padre/apoderado, quiero ver el resumen de notas de mi hijo por curso y trimestre, así como la tabla final del año, para entender su rendimiento general y acceder a la boleta oficial.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo **"Resumen Académico"** desde el dashboard del padre.
- **CA-02:** Pantalla principal muestra **controles de filtrado:**
    - **Selector de Año Académico:** Dropdown con años disponibles (default: año actual)
    - **Selector de Trimestre:** Tabs horizontales {Trimestre 1, Trimestre 2, Trimestre 3, Anual} (default: trimestre actual)

---

### **Vista Trimestral — Resumen de notas por curso**

- **CA-03:** Para cada curso del estudiante, se muestra un **card de resumen** con:
    - **Header:**
        - Nombre del curso + ícono representativo
        - Badge del trimestre actual
    - **Fórmula de cálculo (Estructura Evaluación):**
        - Lista visual de componentes con sus pesos (ej. Examen 40%, Participación 20%, etc.)
    - **Tabla de promedios por componente (TanStack Table):**
        - Columnas: Componente | Promedio | Peso | Subtotal
        - Promedios redondeados a 2 decimales
        - Colores de desempeño:
            - Verde ≥ 14 (Logro esperado)
            - Amarillo 11–13 (En proceso)
            - Rojo < 11 (Bajo rendimiento)
    - **Card de promedio final del trimestre:**
        - Promedio calculado: `Σ (promedio × peso) / 100`
        - Badge de estado:
            -  "Preliminar" si hay notas preliminares
            -  "Final" si todas son oficiales
        - Calificación en letras (AD, A, B, C)
        - Barra de progreso visual
        - Mensaje:
            -  "Promedio preliminar, sujeto a cambios"
            -  "Promedio oficial certificado el [fecha]"

---

### **Vista Anual — Tabla consolidada de notas finales**

- **CA-04:** Al seleccionar la vista "Anual", se muestra una **tabla consolidada** (TanStack Table):
    - Columnas: Curso | T1 | T2 | T3 | Promedio Final | Estado
    - Filas: Un curso por fila
    - **Cálculos:**
        - Promedio Final = (T1 + T2 + T3) / 3
        - Estado:
            -  Aprobado (≥ 11)
            -  Desaprobado (< 11)
    - **Estilo visual coherente con HU-06:**
        - Fondo verde/rojo según estado
        - Tooltip con desglose del cálculo
    - **Acciones:**
        - Botón "Ver Detalle" → redirige a HU-06 (vista por componente)
        - Botón "Exportar Boleta (PDF)" → descarga boleta institucional

---

### **Gráfico Comparativo (Recharts)**

- **CA-05:** Gráfico de barras simple:
    - Eje X: Cursos
    - Eje Y: Promedio final (escala 0–20)
    - Colores:
        - Verde ≥ 14
        - Amarillo 11–13
        - Rojo < 11
    - Línea de referencia en 11 (nota mínima aprobatoria)
    - Tooltip al hover: muestra promedio exacto

---

### **Exportación**

- **CA-06:** Botón global "Exportar Boleta PDF" en la parte superior:
    - Genera un documento con logo institucional, datos del estudiante y tabla anual
    - Incluye firma digital y fecha de certificación
    - Disponible solo si hay al menos un trimestre cerrado (notas finales)

---

### **Validaciones de Negocio**

- **VN-01:** Padre solo ve notas de sus hijos vinculados (`relaciones_familiares`)
- **VN-02:** Promedios calculados en tiempo real
- **VN-03:** Promedio trimestral = Σ (promedio_componente × peso / 100)
- **VN-04:** Promedio anual = (T1 + T2 + T3) / 3
- **VN-05:** Estado = "Aprobado" si promedio ≥ 11
- **VN-06:** Redondear todos los valores a 2 decimales
- **VN-07:** Mostrar solo cursos con notas registradas

---

### **UI/UX**

- **UX-01:** Diseño responsivo mobile-first, igual a HU-06:
    - **Desktop:** Grid de cards por curso + gráfico lateral
    - **Tablet:** Cards en 2 columnas, gráfico inferior
    - **Mobile:** Cards apiladas + tabla simplificada
- **UX-02:** Controles de filtrado sticky en la parte superior
- **UX-03:** **Cards animadas** al cargar (fade-in) y expandibles para ver fórmula
- **UX-04:** **TanStack Table:**
    - Ordenamiento y búsqueda por curso
    - Filtros por estado (Aprobado/Desaprobado)
    - Exportar CSV
- **UX-05:** **Tooltips informativos:**
    - Hover en promedio → muestra desglose del cálculo
    - Hover en barra del gráfico → muestra nota exacta
- **UX-06:** **Animaciones suaves:**
    - Transición al cambiar trimestre/anual
    - Highlight temporal al actualizar valores
- **UX-07:** **Empty State:**
    - Ilustración + texto:
        
        "Aún no hay calificaciones registradas para el año [XXXX]"
        
    - Botón: "Volver al panel principal"

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: cargando resumen del trimestre actual
- **EF-02:** Estado visualización trimestral: cards pobladas
- **EF-03:** Estado anual: tabla consolidada y gráfico visibles
- **EF-04:** Estado vacío: sin datos
- **EF-05:** Estado exportación: generando PDF

---

### **Validaciones de Entrada**

- **VE-01:** Validar que `estudiante_id` pertenece al padre autenticado
- **VE-02:** Validar que `año_academico` existe
- **VE-03:** Validar que hay cursos con registros para el año

---

### **Mensajes de Error**

- "No se pudieron cargar las calificaciones. Intente nuevamente."
- "Error al calcular promedio anual. Contacte con soporte."
- "No tiene permisos para ver las calificaciones de este estudiante."

---

### **Mensajes Informativos**

- "Promedios preliminares pueden cambiar hasta el cierre del trimestre."
- "Promedios finales certificados el [fecha]."
- "Promedio general del año: [X.X]  Excelente rendimiento."
- "Curso que requiere atención: [Nombre del curso]."

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-ACAD-06 (Detalle de calificaciones por componente)
    - HU-ACAD-01 (Carga de calificaciones)
- **HU Siguientes:**
    - HU-ACAD-12 (Descarga de boleta PDF automática)

---



## **CONSIDERACIONES TÉCNICAS ADICIONALES**

### **Performance:**

1. **Caching de datos:**
    - Estructura de evaluación: 24 horas
    - Calificaciones finales: 1 hora
    - Calificaciones preliminares: 5 minutos
    - Asistencia: 30 minutos
2. **Lazy Loading:**
    - Cards de cursos cargan bajo demanda
    - Calendario carga mes visible + 1 mes adelante/atrás
    - Estadísticas se calculan solo cuando son visibles
3. **Optimización de Queries:**
    - Eager loading de relaciones necesarias
    - Índices en campos de filtrado frecuente
    - Paginación en listados grandes

