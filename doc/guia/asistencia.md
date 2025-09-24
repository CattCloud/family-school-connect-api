### **Estados de Asistencia**

Se implementarán **cinco estados** específicos para el registro de asistencia, lo que proporcionará un control más detallado y preciso para los docentes y un historial más claro para los padres:

1. **Presente:** El estudiante asistió a clases.
2. **Tardanza:** El estudiante llegó tarde, pero asistió a clases.
3. **Permiso:** El estudiante se ausentó con permiso previo de la institución.
4. **Falta Justificada:** El estudiante se ausentó por una razón válida, pero no contaba con permiso previo (por ejemplo, por enfermedad, sustentada con un certificado médico).
5. **Falta Injustificada:** El estudiante se ausentó sin motivo o justificación.

### Gestión de Asistencia: Flujo Detallado

1. Carga de Datos: El docente sube el archivo de asistencia del día.
2. Procesamiento: El sistema procesa el archivo.
3.Disparadores de Alertas:
Hemos establecido que el registro de asistencia será por día completo y que se realizará a través de la carga de archivos Excel, con la posibilidad de que los docentes lo hagan.
**Notificación de Asistencia:** Si se registra a un estudiante con el estado Presente, se enviará una notificación a su apoderado. El mensaje será algo simple como: "Confirmamos la asistencia de [nombre del estudiante] a clases el día de hoy."
**Notificaciones Críticas o Alerta**: Si se registra una Falta Injustificada o si se cumplen los umbrales de Faltas Consecutivas o Tardanzas Acumuladas, se dispararán las alertas correspondientes
- Falta Injustificada: Cuando se registra una Falta injustificada. Este es un evento de alta prioridad que se notifica de inmediato, ya que indica que el estudiante no se presentó a la institución sin previo aviso. Se da el aviso de que debe justificar.
- Patrón de Ausencias Injustificadas Consecutivas: Cuando un estudiante acumula tres (3) ausencias injustificadas consecutivas. Esta alerta se envía para indicar un patrón de ausencias que podría requerir la atención de los padres, ya que las justificaciones no han sido presentadas a la escuela.
- Tardanzas: La notificación se enviará de forma inmediata cada vez que se registre una tardanza.El mensaje será algo simple como: "Tu hijo/a, [Nombre del estudiante], registró una tardanza el día de hoy.",Notificar inmediatamente a los padres les permite estar al tanto de la situación el mismo día, lo que fomenta una comunicación más proactiva.