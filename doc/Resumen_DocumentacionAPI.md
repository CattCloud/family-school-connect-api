## AUTENTICACIÓN
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| POST | /auth/login | Autenticar usuario y emitir token JWT | Padre, Docente, Director, Administrador |
| GET | /auth/validate-token | Validar token activo y vigencia | Padre, Docente, Director, Administrador |
| POST | /auth/forgot-password | Solicitar enlace de restablecimiento por WhatsApp | Padre, Docente, Director, Administrador |
| POST | /auth/logout | Cerrar sesión e invalidar token actual | Padre, Docente, Director, Administrador |

## USUARIOS
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| GET | /usuarios/hijos | Listar hijos del padre autenticado | Padre |
| GET | /teachers/permissions | Listar docentes activos con estado de permisos | Director |
| PATCH | /teachers/:id/permissions | Actualizar permisos de docente | Director |
| GET | /teachers/:id/permissions/history | Ver historial de cambios de permisos | Director |
| GET | /admin/templates/padres | Obtener headers y sample para padres | Administrador |
| POST | /admin/import/validate | Validar registros de importación | Administrador |
| POST | /admin/import/execute | Ejecutar importación de registros | Administrador |
| POST | /admin/import/validate-relationships | Validar relaciones padre-hijo | Administrador |
| POST | /admin/import/create-relationships | Crear relaciones padre-hijo | Administrador |
| GET | /admin/verify/relationships | Verificar integridad de relaciones | Administrador |
| POST | /admin/import/credentials/generate | Generar credenciales preview | Administrador |
| POST | /admin/import/credentials/send-whatsapp | Simular envío masivo de credenciales | Administrador |

## ACADÉMICO
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| GET | /calificaciones/estudiante/:id | Listar calificaciones por componente | Padre |
| GET | /calificaciones/estudiante/:id/promedio | Obtener promedio y estado | Padre |
| GET | /resumen-academico/estudiante/:id | Resumen trimestral o anual consolidado | Padre |
| GET | /resumen-academico/estudiante/:id/export | Exportar resumen anual en PDF | Padre |
| GET | /asistencias/estudiante/:id | Consultar asistencia por mes o trimestre | Padre |
| GET | /asistencias/estudiante/:id/estadisticas | Obtener estadísticas de asistencia | Padre |
| GET | /asistencias/estudiante/:id/export | Exportar asistencia en PDF | Padre |
| GET | /cursos/estudiante/:estudiante_id | Listar cursos del estudiante | Padre |
| GET | /docentes/curso/:curso_id | Listar docentes asignados del curso | Padre |

## MENSAJERÍA
| MÉTODO | ENDPOINT | DESCRIPCIÓN | ROLES PRINCIPALES |
|--------|-----------|--------------|-------------------|
| GET | /conversaciones | Listar conversaciones del usuario | Padre, Docente |
| GET | /conversaciones/no-leidas/count | Contador de mensajes no leídos | Padre, Docente |
| GET | /conversaciones/actualizaciones | Polling de actualizaciones de conversaciones | Padre, Docente |
| PATCH | /conversaciones/:id/marcar-leida | Marcar conversación como leída | Padre, Docente |
| PATCH | /conversaciones/:id/cerrar | Cerrar o archivar conversación | Padre, Docente |
| GET | /conversaciones/existe | Verificar existencia de conversación | Padre |
| POST | /conversaciones | Crear conversación y primer mensaje | Padre |
| GET | /conversaciones/:id | Obtener detalle de conversación | Padre, Docente |
| GET | /mensajes | Listar mensajes de conversación | Padre, Docente |
| POST | /mensajes | Enviar nuevo mensaje en conversación | Padre, Docente |
| PATCH | /mensajes/marcar-leidos | Marcar mensajes como leídos | Padre, Docente |
| GET | /mensajes/nuevos | Obtener mensajes nuevos desde último | Padre, Docente |
| GET | /archivos/:id/download | Descargar archivo adjunto | Padre, Docente |