## Objetivo del módulo

El módulo de Notas y Registro de Notas permite gestionar, registrar y visualizar las calificaciones de los estudiantes de manera transparente, estructurada y en tiempo real. Su diseño busca facilitar el trabajo de los docentes, dar control al director y brindar claridad a los padres de familia.
El sistema busca:

Estandarizar el registro de notas en todos los cursos.

Proveer seguimiento en tiempo real del desempeño académico.

Diferenciar entre notas preliminares y notas finales.

Facilitar el cálculo automático de promedios y ponderaciones.

---

### Actores involucrados

### 1. Director

Define la estructura global de evaluación (editable).

Recibe una plantilla base sugerida por el sistema, pero puede editar los nombres de los ítems y ajustar los pesos antes de aceptarla como definitiva,de esta forma define la fórmula global de cálculo de notas para la institución.

Aprueba el cierre de calificaciones por trimestre.

### 2. Docente

Ingresa notas diarias y notas de evaluaciones puntuales.

Supervisa el cálculo en vivo de promedios y ponderaciones.

Solicita el cierre de notas al finalizar el trimestre.

### 3. Padre de familia - Estudiante

Consulta las notas de su hijo/a en tiempo real.

Consulta las calificaciones (preliminares y finales).

Ve información detallada y consolidada por curso y trimestre.

Visualiza sus notas preliminares y finales.

---

## Proceso de configuración de notas (Director)

El director establece una única estructura de evaluación por año académico (válida para todos los cursos y trimestres).

Estructura definida:

- Máximo de 5 ítems de evaluación por trimestre
- El sistema muestra al director una plantilla base predefinida con los ítems más comunes:
    - Examen Trimestral
    - Revisión de Cuaderno
    - Revisión de Libro
    - Participación
    - Comportamiento

El director puede:
✅ Aceptar la plantilla tal cual.
✅ Editar los nombres de los ítems.
✅ Ajustar los pesos (asegurando que la suma = 100%).
✅ Eliminar ítems innecesarios o agregar uno extra (respetando un máximo de 5 ítems).

Una vez validada, esta estructura se aplica a todos los cursos y trimestres del año académico.

Tras la confirmación, la configuración queda bloqueada para mantener coherencia durante el año.

---

## Proceso de registro de notas (Docente)

Existen dos tipos de calificaciones:

### Notas únicas

Ejemplo: Examen Trimestral,Comportamiento

Se ingresa solo una vez en el trimestre.

### Notas recurrentes

Ejemplo: Participación, Revisión de Cuaderno.

Se ingresan múltiples veces (diarias, semanales, por actividad).

El sistema calcula automáticamente el promedio acumulado de todas esas notas y lo presenta como la nota final del ítem.

### Flujo de ingreso

1. El docente registra las notas en cualquier momento del trimestre.
2. El sistema recalcula automáticamente:
3. Promedio acumulado por ítem.
4. Promedio ponderado del trimestre.

El sistema etiqueta estos valores como “Preliminares” hasta que el director cierre oficialmente el trimestre.

---

## Proceso de visualización de notas

- Incluye el cálculo automático de cada nota segun la tabla

### Para docentes

Vista de tabla por curso y por trimestre.

Dos niveles:

1. Tabla de notas por ítem:

Lista de calificaciones diarias/por actividad con promedio acumulado.

1. Tabla de calificaciones del trimestre:

Muestra cada ítem con su nota final y su peso.

Incluye el cálculo automático del promedio ponderado del trimestre.

### Para padres

Vista simplificada y clara, por curso y trimestre.

Se muestran:

- Tabla por categoría (ej. Participación) → Todas las actividades registradas con fecha y nota.
    - Notas diarias en tablas por categoría (ej. todas las participaciones con fecha y nota).
    - Promedio preliminar del ítem (ej. Participación 14.6 ⭐).
- Promedio preliminar del trimestre.
    - Se visualiza la formula de calculo de nota(pesos de cada categoria)
    - Resumen de items del trimestre → Nota promedio por item del trimestre → Aplicacion de la formula para calculo del promedio del trimestre
    
    Diferenciación visual:
    
    Notas preliminares → se muestran con un rótulo “(Preliminar)” o color diferente.
    
    Notas finales → se confirman al cierre del trimestre y se muestran resaltadas.
    
- Tabla de notas finales
    - Presenta los promedios finales de cada trimestre.
    - Incluye el cálculo automático de la nota final del año (promedio de los 3 trimestres).
    - Estado del curso: Aprobado / Desaprobado.
    
    Ejemplo de tabla final (para padres y director):
    
    Curso	Trimestre 1	Trimestre 2	Trimestre 3	Nota Final Año	Estado
    
    Matemáticas	16.8	15.4	17.0	16.4	Aprobado
    Comunicación	15.2	14.0	15.8	15.0	Aprobado
    Ciencias	13.5	12.4	14.2	13.4	Desaprobado
    

### Para director

- Vista consolidada por curso y por estudiante.
- Permite aprobar/cerrar calificaciones por trimestre.

---

## Cálculo de notas

Fórmula global definida por el director.

Proceso:

- Promedio de ítem recurrente = Promedio aritmético simple de todas sus notas.
- Nota final del trimestre = Σ (Nota de cada ítem × Peso).
- Nota final anual = Promedio de los 3 trimestres.

Ejemplo:

Examen Trimestral (40%): 16

Revisión de Cuaderno (20%): Promedio 14.5

Participación (20%): Promedio 15.8

Comportamiento (20%): Promedio 18

Promedio Trimestral = 16×0.4 + 14.5×0.2 + 15.8×0.2 + 18×0.2 = 16.86 ≈ 17

Promedio anual = promedio de los 3 trimestres y se presenta en la tabla final.

---

## Estados de las calificaciones

Preliminar:

- Cuando las notas aún pueden modificarse.
- Vista disponible para docentes y padres, con advertencia de que puede cambiar.

Final:

- Se genera cuando el director aprueba el cierre del trimestre.
- Las notas quedan congeladas y se publican como definitivas.

---

## Consideraciones técnicas (base de datos)

- La tabla evaluación debe permitir al director modificar nombre y peso de ítems antes de validarlos.
- Se recomienda una tabla extra estructura_evaluacion para guardar la configuración establecida por el director.

**Entidad Evaluación:**

id

curso_id

trimestre_id

estudiante_id

tipo (única/recurrente)

categoría (Examen, Participación, etc.)

peso

estado (preliminar/final)

**Entidad Nota:**

id

evaluacion_id

fecha

calificación

observaciones

---

### ¿Quieres que el director pueda **editar la configuración de ítems en medio del año escolar** o solo al inicio?

Para el MVP, la opción más segura es que el director **defina la estructura al inicio del año académico** y esta se mantenga fija. 

### ¿Los ítems serán **iguales en todos los trimestres** o el director debe definir la estructura **por cada trimestre**?

Una sola definición para todo el año.: Sera unica e igual en todos los trimestres

### ¿El director podrá establecer un **máximo de ítems** (ej. máximo 5 evaluaciones) para evitar que se haga muy complejo?

**Sí. Justificación:** Permitir que el director establezca un número máximo de ítems de evaluación (por ejemplo, 5 por trimestre) es una excelente decisión de diseño. Esto no solo mantiene la simplicidad de la plataforma, sino que también fomenta una buena práctica en la gestión académica de la institución. Evita la creación de listas interminables de evaluaciones que pueden abrumar a los docentes y a los padres. La implementación de esta funcionalidad es muy sencilla y aporta un gran valor.

# **Preguntas de Refinamiento**

### 🔹 **1. Escalas de notas**

- ¿Quieres que los docentes **solo registren notas numéricas (0–20)** y el sistema convierta automáticamente a letras (AD, A, B, C)?
    
    **Sí, conversión automática.**
    
    Este enfoque simplifica el trabajo del docente y asegura la consistencia de los datos. El docente solo se preocupa por ingresar la nota numérica (0-20), que es el dato más preciso. El sistema se encarga de aplicar una regla de negocio predefinida para convertirlo a la escala de letras (AD, A, B, C).
    
    - **Justificación:** Elimina el margen de error humano y garantiza que todas las notas se presenten de manera uni
    
    Se implementará un sistema que acepta y gestiona **ambos formatos de notas**, tanto la escala numérica del 0 al 20 como la escala de letras (AD, A, B, C), de forma nativa.
    
    - **Registro por el Docente:** El docente tendrá la flexibilidad de registrar las notas en formato numerico, registrará un valor entre **0 y 20**.
        - El sistema automaticamente realizara la conversion basandose en:
            
            Los niveles de desempeño son:
            AD (Logro Destacado): Corresponde a las notas vigesimales más altas (18-20).
            A (Logro Esperado): Para notas de 14 a 17.
            B (En proceso): Para calificaciones entre 11 y 13.
            C (En inicio): Para las notas de 0 a 10, indicando un desempeño deficiente.
            
        
        ### **Propuesta de Visualización de Notas**
        
        Se implementará una opción para que el usuario pueda cambiar el formato de visualización de las notas.
        
        - **Manejo en la Interfaz:** En la sección de calificaciones del padre, se añadirá un **filtro o un *toggle*** en la parte superior de la tabla de notas. El padre podrá elegir entre "Ver notas numéricas" y "Ver notas de logro (AD, A, B, C)".
        - **Comportamiento del Sistema:**
            - El sistema seguirá almacenando la nota en el formato original en que fue ingresada por el docente (numérica).
            - La visualización por defecto será la que corresponda a la nota original.
            - Si el padre activa el filtro, el sistema aplicará la regla de conversión interna que ya definimos y mostrará las notas en el formato deseado.
    - **Gestión en el Sistema:** El backend almacenará la nota en el formato original en que fue ingresada.

---

### 🔹 **2. Ponderación**

- ¿La ponderación será **definida por cada curso** o será **estándar para todo el colegio**?
    
    **El colegio define una regla única para todos.**
    
    Para el MVP, la forma más sencilla y segura de gestionar las notas es con una regla de ponderación estándar para todos los cursos. Esto evita la complejidad de un módulo de configuración de ponderación por docente.
    
    - **Justificación:** Simplifica el desarrollo del backend y la lógica de cálculo del promedio. Un módulo de ponderación personalizable por docente sería una funcionalidad valiosa, pero es un desarrollo más complejo que se puede considerar en futuras versiones.

---

### 🔹 **3. Registro de evaluaciones**

- ¿El registro será **manual (uno a uno en la web)** o también quieres permitir **importación masiva (ej. subir Excel)**?
    
    Para un **Producto Mínimo Viable (MVP)**, es más eficiente y seguro optar por la **importación masiva mediante archivos Excel/CSV** en lugar de permitir el registro manual de notas.
    
    ### **Justificación de la Propuesta**
    
    - **Evita la Complejidad del MVP**: Implementar un registro manual "uno a uno" de notas y evaluaciones requeriría la creación de un módulo completo con formularios, validaciones, y flujos de usuario detallados. Esto aumenta significativamente el tiempo y el costo de desarrollo, desviándose del objetivo de un MVP funcional y bien definido.
    - **Se alinea con el Flujo de Trabajo (Real)**: La mayoría de los docentes registran las notas de un grupo de estudiantes de forma conjunta después de una evaluación. El flujo de carga masiva de archivos simula este proceso de manera eficiente.
    - **Consistencia de la Información**: Al no permitir el registro manual, se evita la posibilidad de que los docentes intenten ingresar notas en diferentes formatos o de manera incorrecta. Esto asegura que la información que llega a los padres sea consistente y confiable.
    
    Sin embargo, para mantener un nivel de flexibilidad y control, se implementará la **edición de notas**. Si un docente comete un error al subir un archivo, podrá corregir manualmente la nota de un estudiante específico en la plataforma. Este enfoque reduce la complejidad de la carga masiva y evita el retrabajo.
    
    En resumen, la propuesta es: **solo carga masiva de datos (no manual) y la posibilidad de editar notas de forma individual**. Esto es la solución más práctica para el MVP.
    

---

### 🔹 **4. Comunicación con padres**

- Cuando un docente registre una nota, ¿quieres que el padre reciba una **notificación inmediata**?
    
    **Sí, notificación push/whatsapp instantánea.**
    
    Esto es consistente con nuestra decisión de hacer que el sistema sea un canal de comunicación en tiempo real. La notificación instantánea de una calificación, especialmente si es baja, es un evento crítico que los padres necesitan conocer de inmediato.
    
    - **Justificación:** La inmediatez es un valor clave del proyecto. Las notificaciones automáticas y en tiempo real mejoran la participación de los padres y les permiten tomar medidas proactivas.

---

### 🔹 **5. Periodos académicos**

- ¿El sistema tendrá **trimestres fijos** o debería permitir **configurar bimestres/trimestres/semestres** según el colegio?
    
    **Solo trimestres (modelo peruano).**
    
    Para el MVP, la mejor estrategia es asumir un modelo de trimestres fijos, que es el estándar en el modelo educativo peruano.
    
    - **Justificación:** Esto simplifica la base de datos y la lógica de los reportes. No es necesario crear un módulo de configuración de periodos, lo que reduce la complejidad y nos permite enfocarnos en las funcionalidades clave. Un sistema configurable es una característica avanzada que se puede implementar en el futuro.

---

### 🔹 **6. Reportes finales**

- ¿Quieres que el sistema genere **boletas de notas en PDF** por estudiante al cierre de cada trimestre?
    
    **Sí, boletas PDF descargables/impresas.**
    
    La capacidad de generar boletas en PDF es una funcionalidad de alto valor para la institución y los padres. Estas boletas son documentos oficiales que se pueden guardar o imprimir, lo que añade una capa de formalidad y utilidad al sistema.
    
    - **Justificación:** Es una funcionalidad que, aunque puede ser un poco más compleja de implementar (generación de PDF), proporciona un valor tangible y esperado por los usuarios finales. Además, los boletos de notas en PDF se consideran un entregable estándar en las plataformas académicas.

---

**Regla clave:**

- **Solo el director** define la estructura de notas (ítems de evaluación).
- Esa estructura será **única y válida para todo el colegio** (no por curso, ni por docente).
- Esto le da flexibilidad pero mantiene la simplicidad del MVP.