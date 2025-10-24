# Plan Detallado para Resolver el Problema de la Prueba de Encuestas

## Análisis del Problema

El problema está en la prueba "No debería permitir responder dos veces la misma encuesta" que está fallando con el error:
```
expected 200 "OK", got 400 "Bad Request"
Cannot read properties of undefined (reading 'preguntas')
```

Esto ocurre porque después de responder la encuesta una vez, el sistema correctamente retorna un error 400 cuando se intenta obtener el formulario nuevamente, pero la prueba está intentando acceder a `formularioResponse.body.data.preguntas` que no existe en una respuesta de error.

## Plan de Solución

### 1. Reestructurar la prueba en fases claras

**Fase 1: Obtener el formulario inicial**
- Obtener el formulario para obtener los IDs de las preguntas cuando el usuario aún no ha respondido
- Guardar estos IDs para usarlos posteriormente
- Esperar un código 200

**Fase 2: Enviar la primera respuesta**
- Enviar la respuesta de la encuesta usando los IDs guardados
- Esperar un código 201

**Fase 3: Verificar bloqueo del formulario**
- Intentar obtener el formulario después de haber respondido
- Verificar que retorna un código 400 (usuario ya respondió)

**Fase 4: Verificar bloqueo de segunda respuesta**
- Intentar enviar la misma respuesta nuevamente
- Verificar que retorna un código 409 (conflicto)

### 2. Implementación Específica

```javascript
it('No debería permitir responder dos veces la misma encuesta', async () => {
  // Fase 1: Obtener el formulario para obtener los IDs de las preguntas
  const formularioResponse = await request(app)
    .get(`/encuestas/${encuestaId}/formulario`)
    .set('Authorization', `Bearer ${tokenPadre}`)
    .expect(200);
  
  const preguntas = formularioResponse.body.data.preguntas;
  
  // Construir datos de respuesta con IDs reales
  const datosRespuesta = {
    encuesta_id: encuestaId,
    estudiante_id: estudianteId,
    respuestas: [
      {
        pregunta_id: preguntas[0].id,
        valor_opcion_id: preguntas[0].opciones[0].id
      }
    ],
    tiempo_respuesta_minutos: 2
  };
  
  // Fase 2: Enviar respuesta por primera vez
  await request(app)
    .post('/encuestas/respuestas')
    .set('Authorization', `Bearer ${tokenPadre}`)
    .send(datosRespuesta)
    .expect(201);
  
  // Esperar un momento para asegurar que la primera respuesta se guarde completamente
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Fase 3: Verificar que el formulario ya no sea accesible
  await request(app)
    .get(`/encuestas/${encuestaId}/formulario`)
    .set('Authorization', `Bearer ${tokenPadre}`)
    .expect(400);
  
  // Fase 4: Intentar enviar respuesta por segunda vez
  const response = await request(app)
    .post('/encuestas/respuestas')
    .set('Authorization', `Bearer ${tokenPadre}`)
    .send(datosRespuesta);
  
  // Verificar que la respuesta sea un conflicto
  expect(response.status).toBe(409);
  expect(response.body.error.code).toBe('CONFLICT');
});
```

### 3. Ventajas de esta Solución

- **Evita el bucle infinito**: No intenta acceder a propiedades que no existen en respuestas de error
- **Separa claramente las fases**: Cada fase tiene un propósito específico y verificable
- **Mantiene la coherencia**: Usa la misma encuesta para todas las verificaciones
- **No afecta a otras pruebas**: Solo modifica la prueba problemática

### 4. Pasos de Implementación

1. Localizar la prueba "No debería permitir responder dos veces la misma encuesta" en el archivo `tests/encuestas.test.js`
2. Reemplazar completamente el código actual con la nueva estructura
3. Verificar que cada fase tenga las aserciones correctas
4. Ejecutar las pruebas para confirmar que el problema está resuelto

Este plan aborda la causa raíz del problema y proporciona una solución estructurada que evita el bucle infinito de correcciones.
----
