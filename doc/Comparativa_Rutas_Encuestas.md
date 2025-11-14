# Comparativa de rutas del módulo de Encuestas: Frontend vs Backend

Contexto: se compararon las rutas que el frontend intenta consumir para el módulo de encuestas contra lo realmente implementado en el backend y lo descrito en la documentación fiable.

Fuentes consultadas
- Router real: [routes/encuestas.js](routes/encuestas.js)
- Controlador real: [controllers/encuestasController.js](controllers/encuestasController.js)
- Middleware de encuestas (intención de permisos/validaciones): [middleware/encuestasMiddleware.js](middleware/encuestasMiddleware.js)
- Documentación más fiable: [doc/Resumen_DocumentacionAPI.md](doc/Resumen_DocumentacionAPI.md)

Resumen ejecutivo
- Las 5 rutas de resultados/segmentos/exportación que el frontend intenta usar no existen actualmente en el backend.
- El backend sí expone las rutas base de encuestas: listado, búsqueda, pendientes, polling, validar acceso, formulario, mis respuestas y envío de respuestas (este último con un path distinto al del Resumen).
- Si el frontend llama hoy a las rutas inexistentes, obtendrá 404 Not Found (o 401 si falta autenticación).

Análisis por ruta del frontend

1) GET /encuestas/:id/estadisticas
- Estado en backend: No existe.
- Evidencia: no hay handler equivalente en [routes/encuestas.js](routes/encuestas.js).
- Documentación fiable: [doc/Resumen_DocumentacionAPI.md](doc/Resumen_DocumentacionAPI.md) no define un endpoint de estadísticas generales por encuesta.
- Resultado al llamar: 404 Not Found (tras pasar por [middleware/auth.js](middleware/auth.js) si provee JWT); 401 Unauthorized si no hay JWT.
- Impacto UI: gráficos KPI de encuesta no pueden renderizar; bloqueará vistas dependientes.
- Recomendación frontend:
  - Desactivar el módulo de “Estadísticas” o mostrar mensaje “Estadísticas no disponibles”.
  - Habilitar vía feature flag cuando el backend lo implemente.

2) GET /encuestas/:id/resultados/preguntas
- Estado en backend: No existe.
- Evidencia: no hay handler equivalente en [routes/encuestas.js](routes/encuestas.js).
- Documentación fiable: [doc/Resumen_DocumentacionAPI.md](doc/Resumen_DocumentacionAPI.md) no define resultados agregados por pregunta.
- Resultado al llamar: 404 Not Found (o 401 sin JWT).
- Impacto UI: no se puede mostrar desglose por pregunta ni rankings de opciones.
- Recomendación frontend:
  - Ocultar pestaña “Por pregunta” o mostrar “Próximamente”.
  - Si es crítico, coordinar implementación prioritaria en backend.

3) GET /encuestas/:id/resultados/segmentos?nivel=&grado=&curso=&rol=&fecha_inicio=&fecha_fin=
- Estado en backend: No existe.
- Evidencia: no hay handler equivalente en [routes/encuestas.js](routes/encuestas.js).
- Documentación fiable: [doc/Resumen_DocumentacionAPI.md](doc/Resumen_DocumentacionAPI.md) no define segmentos para filtros/gráficos de encuestas.
- Resultado al llamar: 404 Not Found (o 401 sin JWT).
- Impacto UI: filtros dinámicos por segmento y gráficos segmentados no funcionan.
- Recomendación frontend:
  - Remover/ocultar controles de segmentación dependientes de este endpoint.
  - Si se quiere demo, simular segmentos client-side marcados como “estimado”.

4) GET /respuestas-encuestas?encuesta_id=&page=&limit=&nivel=&grado=&curso=&rol=&order=
- Estado en backend: No existe este listado. El router actual no define GET /respuestas-encuestas.
- Evidencia: revisión completa de [routes/encuestas.js](routes/encuestas.js) sin coincidencias.
- Documentación fiable: [doc/Resumen_DocumentacionAPI.md](doc/Resumen_DocumentacionAPI.md) tampoco define este listado; sí define POST /respuestas-encuestas para enviar respuestas, pero el backend real usa otro path (ver nota más abajo).
- Resultado al llamar: 404 Not Found (o 401 sin JWT).
- Impacto UI: una “tabla de respuestas” server-side no es posible hoy.
- Recomendación frontend:
  - Si el requerimiento es solo “lo que respondió el usuario”, usar GET /encuestas/:id/mis-respuestas que sí existe.
  - Si se requiere tabla institucional (autor/director), proponer endpoint a implementar: GET /encuestas/:id/respuestas?page=&limit=&... (o mantener el nombre que el frontend ya intenta, pero hay que crearlo).

5) GET /encuestas/:id/export.csv?scope=aggregates|responses
- Estado en backend: No existe.
- Evidencia: no hay handler de exportación en [routes/encuestas.js](routes/encuestas.js).
- Documentación fiable: [doc/Resumen_DocumentacionAPI.md](doc/Resumen_DocumentacionAPI.md) no define exportación CSV para encuestas.
- Resultado al llamar: 404 Not Found (o 401 sin JWT).
- Impacto UI: botón de exportación descargará error o quedará inoperativo.
- Recomendación frontend:
  - Deshabilitar botón Exportar con tooltip “No disponible”.
  - Activarlo mediante feature flag cuando exista el endpoint.

Nota importante sobre “envío de respuestas”
- Backend real implementado: POST /encuestas/respuestas → [routes/encuestas.js](routes/encuestas.js), handler [encuestasController.enviarRespuestas](controllers/encuestasController.js).
- Documentación Resumen (sección encuestas): POST /respuestas-encuestas.
- Diferencia: el backend actual usa el path anidado bajo /encuestas, no /respuestas-encuestas.
- Recomendación:
  - Ajustar el frontend para enviar a POST /encuestas/respuestas (rápido), o
  - Exponer en backend también POST /respuestas-encuestas como alias para alinearse con el Resumen y evitar cambios en frontend.

Endpoints de encuestas disponibles hoy (backend)
- GET /encuestas → listado de encuestas del usuario [routes/encuestas.js](routes/encuestas.js)
- GET /encuestas/pendientes/count → contador de pendientes [routes/encuestas.js](routes/encuestas.js)
- GET /encuestas/search → búsqueda [routes/encuestas.js](routes/encuestas.js)
- GET /encuestas/actualizaciones → polling [routes/encuestas.js](routes/encuestas.js)
- GET /encuestas/:id/validar-acceso → validar acceso [routes/encuestas.js](routes/encuestas.js)
- GET /encuestas/:id/formulario → obtener formulario [routes/encuestas.js](routes/encuestas.js)
- POST /encuestas → crear encuesta [routes/encuestas.js](routes/encuestas.js)
- POST /encuestas/respuestas → enviar respuestas [routes/encuestas.js](routes/encuestas.js)
- GET /encuestas/:id/mis-respuestas → ver respuestas del usuario [routes/encuestas.js](routes/encuestas.js)

Consideraciones de errores esperados al invocar rutas inexistentes
- 404 Not Found:
  - Cuando el path no coincide con ningún handler de [routes/encuestas.js](routes/encuestas.js).
  - Respuesta puede ser la del middleware global de not found configurado en el proyecto (p. ej., [middleware/notFound.js](middleware/notFound.js) o [middleware/simpleNotFound.js](middleware/simpleNotFound.js)).
- 401 Unauthorized:
  - Si falta o es inválido el JWT; el router aplica [middleware/auth.js](middleware/auth.js) a todas las rutas de encuestas.
- 403 Forbidden:
  - En caso de existir futuros endpoints de resultados, podrían aplicar verificaciones como las modeladas en [middleware/encuestasMiddleware.js](middleware/encuestasMiddleware.js) (p. ej., puedeVerResultados). Hoy no hay handlers de resultados publicados.

Recomendaciones accionables para frontend
- Corto plazo (sin tocar backend):
  - Desactivar u ocultar: estadísticas generales, resultados por pregunta, segmentos, exportación CSV, tabla de respuestas general.
  - Para estados básicos, usar: GET /encuestas/:id/validar-acceso, GET /encuestas/:id/formulario, GET /encuestas/:id/mis-respuestas.
  - Envío de respuestas: apuntar a POST /encuestas/respuestas.
  - Manejo de errores: mapear 404 a “Funcionalidad no disponible” y no bloquear el resto del módulo.
- Mediano plazo (alinear contratos):
  - Definir y priorizar implementación backend de:
    - GET /encuestas/:id/estadisticas
    - GET /encuestas/:id/resultados/preguntas
    - GET /encuestas/:id/resultados/segmentos
    - GET /encuestas/:id/respuestas (paginado y con filtros) o mantener nombre /respuestas-encuestas
    - GET /encuestas/:id/export.csv
  - Decidir si se mantiene además POST /respuestas-encuestas como alias al actual POST /encuestas/respuestas para compatibilidad.

Observaciones adicionales
- El Resumen documenta “/respuestas-encuestas” como POST; el backend real difiere. Resolver esta discrepancia ahora evita errores futuros.
- Las rutas actuales de panel (listado/búsqueda/pendientes/polling) ya permiten una UX útil sin estadísticas avanzadas.

Listo para revisión
- El documento refleja la situación actual. Indica si procedemos con:
  - Ajuste rápido de frontend, o
  - Diseño e implementación de endpoints de resultados en backend, o
  - Enfoque mixto (priorizar 1–2 endpoints claves y desactivar el resto temporalmente).