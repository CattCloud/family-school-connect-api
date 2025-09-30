1. Ya no seran permisos granulares(por grado o nivel especifico) , se simplifico a permisos mas generales
En vez de manejar permisos_docentes por grado/nivel:
Los permisos de crear comunicados/encuestas se asignan a nivel rol (ej. todos los docentes pueden, o solo algunos marcados), para mas claridad, revisa *HU-USERS-01 — Activar/Desactivar Permisos de Comunicación y Encuestas (Director).
Añadido a eso
El alcance de los comunicados y encuestas creados se determinara en el formulario durante su creacion , sea encuesta o comunicado(por grado, nivel,etc)

2. El cambio obligatorio de contraseña en primer login no sera solo para el docente sino para todos los usuarios en general, la razon es la HU Detallada
HU-USERS-04 — Crear Usuarios masivamente via Scripts SQL (Administrador)

3. La entidad estudiantes no tendran los campos
- **apoderado_principal_id** - Referencia al padre/apoderado principal (FK a usuarios)
- **tipo_relacion** - Tipo de parentesco del apoderado: "padre", "madre", "apoderado", "tutor" (enum, requerido)
Eso solo estara en la entidad relaciones_familiares, ademas solo se registra un apoderado del estudiante y se deduce que este es el principal, osea que la tabla de relaciones_familiares registra solo relaciones entre estudiantes y apoderado principal, no secundarios