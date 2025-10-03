
### 📌 Reflexión sobre HU-ACAD-04 y HU-ACAD-05
CARGA DE DATOS ACADÉMICOS (Docente/Director)
**HU-ACAD-04** — Solicitar cierre de notas al finalizar trimestre *(Docente)*

- Cambio de estado de "preliminar" a "pendiente de aprobación"
- Validación de que todas las calificaciones estén completas

**HU-ACAD-05** — Aprobar cierre de trimestre *(Director)*

- Congelar calificaciones como "finales"
- Generación automática de boletas en PDF

* **HU-ACAD-04 (Docente solicita cierre de notas)** y **HU-ACAD-05 (Director aprueba cierre)** pertenecen ya al **flujo académico-administrativo completo** (cierre oficial de calificaciones).
* El sistema, según lo que vienes trabajando, está enfocado en:
  ✅ Comunicación (entre institución y familias)
  ✅ Seguimiento (notas, asistencia, mensajes, comunicados)
  ✅ Carga y consulta de información (docentes y apoderados)

Entonces, **el cierre de trimestre no es estrictamente necesario** si el objetivo principal es solo **mostrar y comunicar el avance académico**.

Para este **primer release (MVP)**  solo se haran **HU-ACAD-01 a HU-ACAD-03**.
Se dejara HU-ACAD-04 y HU-ACAD-05 como **futuras HU opcionales** en un backlog de “extensiones administrativas”, por si luego la institución pide que el sistema también haga cierre de trimestres.

----

## **HU-ACAD-03 — Centro de Plantillas para Descarga y Guía de Uso**

**Título:** Acceso centralizado a plantillas de calificaciones y asistencia

**Historia:**

> Como docente/director, quiero acceder a un centro de plantillas para descargar formatos exactos y consultar guías de uso, de manera que pueda preparar la información con anticipación y evitar errores al momento de la carga.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso desde el dashboard mediante menú lateral → opción **📥 Centro de Plantillas**.
- **CA-02:** Pantalla principal muestra **dos tarjetas principales**:
    1. **Plantilla de Calificaciones**
        - Descripción: “Formato oficial para carga de notas por componentes”.
        - Botón: **📥 Generar Plantilla** → abre modal de selección (Nivel, Grado, Curso, Trimestre).
        - Botón secundario: **📄 Ver Guía de Uso** (abre modal con instrucciones y ejemplos).
    2. **Plantilla de Asistencia**
        - Descripción: “Formato oficial para carga de asistencia con estados definidos”.
        - Botón: **📥 Generar Plantilla** → abre modal de selección (Nivel, Grado, Curso, Fecha).
        - Botón secundario: **📄 Ver Guía de Uso**.
- **CA-03:** Las plantillas generadas se construyen dinámicamente según:
    - Estudiantes activos del curso seleccionado.
    - Estructura de evaluación vigente (para calificaciones).
    - Estados institucionales (para asistencia).
- **CA-04:** Descarga inmediata en formato `.xlsx`, con nombre auto-generado:
    - `Calificaciones_{Curso}_{Grado}_{Trimestre}_{Fecha}.xlsx`
    - `Asistencia_{Curso}_{Grado}_{Fecha}.xlsx`
- **CA-05:** Guías interactivas disponibles en cada plantilla:
    - Pestaña “Instrucciones Generales”
    - Pestaña “Ejemplos Visuales” (capturas Excel con anotaciones)
    - Pestaña “Errores Comunes”
    - Pestaña “Preguntas Frecuentes”
    - Botones: **Descargar Guía PDF** / **Imprimir**

---

### **Validaciones de Negocio**

- **VN-01:** Solo docentes con cursos asignados pueden generar plantillas de sus cursos.
- **VN-02:** Director puede generar plantillas de cualquier curso.
- **VN-03:** Plantilla de calificaciones requiere estructura de evaluación activa.
- **VN-04:** Plantillas incluyen solo estudiantes con matrícula activa.
- **VN-05:** Columnas y estructura deben coincidir exactamente con las definidas en el sistema.
- **VN-06:** Plantillas se regeneran dinámicamente (no son archivos estáticos).

---

### **UI/UX**

- **UX-01:** Pantalla principal tipo **cards** (2 plantillas destacadas).
- **UX-02:** Modal de selección de contexto antes de descarga.
- **UX-03:** Vista de guía con pestañas claras e ilustraciones.
- **UX-04:** Estilo consistente con colores institucionales y logo en encabezados Excel.
- **UX-05:** Acceso rápido desde módulos HU-ACAD-01 y HU-ACAD-02 mediante botón flotante → “📥 Ir al Centro de Plantillas”.

---

### **Estados y Flujo**

- **EF-01:** Estado inicial → listado de plantillas.
- **EF-02:** Estado de selección → modal con contexto (Nivel, Grado, Curso).
- **EF-03:** Estado de generación → backend crea Excel dinámico.
- **EF-04:** Estado de descarga → navegador descarga archivo.
- **EF-05:** Estado de guía → usuario explora instrucciones/ejemplos.

---

### **Mensajes de Éxito**

- "✅ Plantilla generada con éxito. Descarga iniciada."
- "📥 Plantilla de Asistencia descargada para 30 estudiantes."
- "✅ Guía de uso cargada correctamente."

### **Mensajes de Error**

- "No se puede generar plantilla. La estructura de evaluación no está definida."
- "El curso seleccionado no tiene estudiantes activos."
- "No tienes permisos para acceder a este curso."
- "Error inesperado al generar plantilla. Intente nuevamente."

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-USERS-04 (Estudiantes creados y vinculados).
    - HU-ACAD-01 (Carga de calificaciones).
    - HU-ACAD-02 (Carga de asistencia).
- **HU Siguientes:**
    - HU-ACAD-07 (Padres visualizan asistencia).
    - HU-ACAD-08 (Padres visualizan calificaciones).

---

### **Componentes y Estructura**

- **Tipo:** Página completa (`/dashboard/plantillas`).
- **Componentes principales:**
    - `TemplateCenter`: Contenedor principal con cards.
    - `TemplateCard`: Tarjeta de plantilla individual.
    - `ContextSelectorModal`: Modal de selección de curso/nivel.
    - `GuideModal`: Guía visual con pestañas.
    - `TemplateGenerator`: Servicio backend para generación de Excel.
- **Endpoints API:**
    - `GET /plantillas/tipos` — Listar plantillas disponibles.
    - `POST /plantillas/calificaciones` — Generar plantilla de calificaciones.
    - `POST /plantillas/asistencia` — Generar plantilla de asistencia.
    - `GET /plantillas/guias/{tipo}` — Obtener guía visual.
    - `GET /plantillas/guias/{tipo}/pdf` — Descargar guía en PDF.


ENDPOINTS

### **Centro de Plantillas**

```
GET    /plantillas/tipos                       # Listar tipos de plantillas disponibles
POST   /plantillas/calificaciones              # Generar plantilla de calificaciones
POST   /plantillas/asistencia                  # Generar plantilla de asistencia
GET    /plantillas/guias/{tipo}                # Obtener guía visual por tipo
GET    /plantillas/guias/{tipo}/pdf            # Descargar guía en PDF

```


---
## VISUALIZACIÓN DE DATOS ACADÉMICOS (Padre)

1. **HU-ACAD-06 — Ver calificaciones con 5 componentes fijos por trimestre**
   ✔️ Esencial. El padre necesita ver las notas de su hijo en tabla clara, con distinción preliminar/final y promedio ponderado.
   👉 **Debe estar en el MVP**.

2. **HU-ACAD-07 — Consultar asistencia diaria con 5 estados específicos**
   ✔️ También clave. El padre espera saber si su hijo asistió, faltó o llegó tarde.
   👉 **Debe estar en el MVP**.

3. **HU-ACAD-08 — Filtrar calificaciones por año, trimestre y curso**
   ✔️ Importante, pero más de usabilidad. Permite búsquedas más rápidas.
   👉 Puede ser **MVP si el volumen de datos es alto**, pero si recién es un piloto, puede dejarse como mejora posterior.

4. **HU-ACAD-09 — Acceder al historial académico de años anteriores**
   ⚠️ Útil para continuidad, pero no urgente en la primera versión.
   👉 Podría ir en una **segunda fase**, ya que para el MVP basta con el año académico actual.

5. **HU-ACAD-10 — Visualizar promedio trimestral y anual**
   ✔️ Es parte de lo que espera cualquier padre en un “boletín”.
   👉 **Debe estar en el MVP** junto con HU-ACAD-06.

6. **HU-ACAD-11 — Alternar entre visualización numérica (0-20) y letras (AD, A, B, C)**
   👍 Valor agregado, pero no crítico.
   👉 Puede ser **fase 2**, salvo que la institución lo requiera por reglamento.

7. **HU-ACAD-12 — Descargar boletas de notas en PDF**
   ✔️ Muy importante porque el padre siempre pedirá un documento oficial.
   👉 **Debe estar en el MVP**, aunque la versión inicial puede ser simple (PDF generado con logo e info básica).


### Recomendación de priorización

**MVP (imprescindible para la primera entrega):**

* HU-ACAD-06 (Ver calificaciones)
* HU-ACAD-07 (Consultar asistencia)
* HU-ACAD-10 (Promedios trimestral y anual)
* HU-ACAD-12 (Boletas PDF)

**Fase 2 (mejora de usabilidad y profundidad):**

* HU-ACAD-08 (Filtros avanzados de búsqueda)
* HU-ACAD-09 (Historial multi-año)
* HU-ACAD-11 (Vista numérica/letras)

