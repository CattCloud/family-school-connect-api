## ¿Qué tan estrictas deben ser las plantillas de Excel/CSV?

La flexibilidad de las plantillas de carga es un punto crucial para la **usabilidad** del sistema. Una plantilla demasiado estricta puede frustrar al usuario, mientras que una muy flexible puede provocar errores.

Para este proyecto, la **Opción A) Plantilla exacta, mismo orden de columnas y nombres idénticos** es la mejor elección para el MVP.

### Justificación de la Elección

- **Simplifica el desarrollo:** La validación en el *backend* es mucho más sencilla. El sistema solo necesita verificar que el archivo tenga un formato predefinido, sin tener que analizar el orden o los nombres de las columnas. Esto ahorra tiempo de desarrollo y reduce la probabilidad de errores.
- **Asegura la calidad de los datos:** Un formato de plantilla fijo asegura que los datos se ingresen siempre de la misma manera, lo que facilita el procesamiento y evita inconsistencias en la base de datos.
- **Mejora la experiencia del usuario:** Aunque parezca restrictivo, una plantilla exacta guía al usuario (docente) y le indica exactamente qué información debe proporcionar y dónde. Con un buen diseño y documentación (como un ejemplo de plantilla descargable), esta opción se vuelve muy intuitiva.

<aside>

En Centro de Guias habra documentacion de como deben estar estructurados los CV

</aside>

## ¿Qué pasa si el archivo tiene estudiantes que no existen en la base de datos?

La flexibilidad de las plantillas de carga es un punto crucial para la **usabilidad** del sistema. Una plantilla demasiado estricta puede frustrar al usuario, mientras que una muy flexible puede provocar errores.

Para este proyecto, la **Opción A) Plantilla exacta, mismo orden de columnas y nombres idénticos** es la mejor elección para el MVP.

### Justificación de la Elección

- **Simplifica el desarrollo:** La validación en el *backend* es mucho más sencilla. El sistema solo necesita verificar que el archivo tenga un formato predefinido, sin tener que analizar el orden o los nombres de las columnas. Esto ahorra tiempo de desarrollo y reduce la probabilidad de errores.
- **Asegura la calidad de los datos:** Un formato de plantilla fijo asegura que los datos se ingresen siempre de la misma manera, lo que facilita el procesamiento y evita inconsistencias en la base de datos.
- **Mejora la experiencia del usuario:** Aunque parezca restrictivo, una plantilla exacta guía al usuario (docente) y le indica exactamente qué información debe proporcionar y dónde. Con un buen diseño y documentación (como un ejemplo de plantilla descargable), esta opción se vuelve muy intuitiva.

<aside>

Al final generar un archivos txt con el detalle de los errores 

</aside>

---

## Propuesta de Flujo de Carga de Datos Académicos

Para simular de manera efectiva el registro de notas y asistencias por parte de los docentes, mantendremos la Opción: Importación manual de archivos Excel/CSV, pero la refinaremos con el siguiente flujo de trabajo granular:

1. Roles y Permisos de Carga:
Docente: Un docente solo tendrá permiso para subir archivos de calificaciones y asistencias para los cursos que tiene asignados.
Director: Un director tendrá la capacidad de subir archivos para cualquier curso o sección de la institución. Esto le da una visión y control general, cumpliendo con su rol de supervisor.
2. Flujo de Subida del Archivo:
El proceso se diseñará para que el usuario (docente o director) defina el contexto antes de la carga, eliminando ambigüedades.
Paso 1: Selección del Contexto: El usuario ingresará al módulo de carga de datos y seleccionará el Nivel, Grado y Curso al que corresponde la información que va a subir.
Paso 2: Subida del Archivo: Una vez seleccionado el contexto, se habilitará la opción para subir el archivo. El sistema solo aceptará archivos con un formato predefinido (por ejemplo, Plantilla_Notas_Matemáticas_3ro_A.xlsx), asegurando la integridad de los datos.
Paso 3: Validación y Confirmación: Al subir el archivo, el sistema lo validará. Esto incluye verificar que las columnas y los datos coincidan con la plantilla, y que los estudiantes listados en el archivo existan en la base de datos para ese curso.
Paso 4: Procesamiento y Notificación: Una vez validado, el sistema procesará los datos, los insertará en la base de datos y notificará al usuario de que la carga ha sido exitosa.