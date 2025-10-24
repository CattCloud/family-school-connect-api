# **Historia de Usuario Detallada - HU-ENC-03**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Docente/Director que crea la encuesta
2. **encuestas** - Encuesta con preguntas y configuración
3. **permisos_docentes** - Validación de permisos de creación
4. **nivel_grado** - Niveles y grados para segmentación
5. **cursos** - Cursos para segmentación específica
6. **asignaciones_docente_curso** - Determina qué grados/cursos puede usar el docente
7. **notificaciones** - Alertas generadas a destinatarios

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Permisos de docentes configurados
- **HU-ENC-00** - Bandeja de encuestas (punto de acceso)

### **Roles Involucrados:**

- **Docente:** Solo si tiene `permiso_activo = true` en `permisos_docentes` para tipo `encuestas`
- **Director:** Acceso completo sin restricciones

---

## **HU-ENC-03 — Crear y Publicar Encuesta**

**Título:** Creación de encuesta con constructor de preguntas dinámicas y segmentación de audiencia

**Historia:**

> Como docente con permisos/director, quiero crear encuestas con un constructor de preguntas flexible y segmentar la audiencia de forma precisa para recopilar feedback estructurado de padres y docentes sobre asuntos relevantes de la institución.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Validación de permisos previa:
    - **Docente:** Verificar que `permisos_docentes.tipo_permiso = 'encuestas'` y `estado_activo = true`
    - **Director:** Acceso automático sin validación adicional
- **CA-02:** Acceso al formulario desde dos puntos:
    - Botón **"📋 Nueva Encuesta"** en HU-ENC-00 (bandeja)
        - Si el docente no tiene permisos de encuesta, no mostrar Botón
    - Opción en menú lateral del dashboard
        - Si el docente no tiene permisos de encuesta, no mostrar Opcion(ya esta implementado)
    - Al hacer clic, redirige a `/dashboard/encuestas/nueva`
- **CA-03:** La interfaz está diseñada como **Wizard de 3 pasos** con barra de progreso visual:
    
    **PASO 1: Información Básica**
    
    - **Título de página:** "Crear Nueva Encuesta"
    - **Input "Título de la Encuesta":**
        - Campo de texto de una línea
        - Placeholder: "Ej: Evaluación de satisfacción del segundo trimestre"
        - Mínimo: 10 caracteres
        - Máximo: 200 caracteres
        - Contador de caracteres visible: "XX/200"
        - Validación en tiempo real con mensaje de error
    - **Textarea "Descripción":**
        - Campo de texto multilínea
        - Placeholder: "Describe el objetivo de la encuesta y por qué es importante responderla..."
        - Mínimo: 20 caracteres
        - Máximo: 500 caracteres
        - Contador de caracteres: "XX/500"
        - Altura inicial: 120px, auto-expandible
    - **Date Picker "Fecha de Vencimiento"(Opcional, ahi encuestas libres):**
        - Selector de fecha con calendario visual
        - Solo fechas futuras (mínimo: mañana)
        - Formato: DD/MM/YYYY
        - Hora fija: 23:59 del día seleccionado
        - Mensaje informativo: "Las encuestas se cerrarán automáticamente a las 23:59 de esta fecha"
        - Validación: fecha debe ser al menos 24 horas en el futuro
    - **Botón "Continuar":**
        - Habilitado solo cuando título, descripción y fecha están completos y válidos
        - Color primario (`bg-primary-600`), texto blanco
        - Al hacer clic: Transición suave al Paso 2
    - **Botón "Cancelar":**
        - Secundario (outline `border-border-primary`), texto gris
        - Modal de confirmación: "¿Seguro que deseas cancelar? Se perderá la información ingresada."
        - Opciones: "Sí, cancelar" (rojo) | "No, continuar editando" (gris)
    
    **PASO 2: Constructor de Preguntas**
    
    - **Resumen del Paso 1** (no editable, solo lectura):
        - Card compacta con: título (truncado a 60 caracteres), descripción (truncada a 100 caracteres), fecha de vencimiento
        - Badge: "📅 Vence: DD/MM/YYYY"
        - Botón "✏️ Editar" pequeño para volver al Paso 1
    - **Lista de Preguntas (Inicialmente vacía):**
        - Mensaje de estado vacío:
            - Ilustración SVG (clipboard vacío)
            - Texto: "Aún no has agregado preguntas"
            - Subtexto: "Haz clic en el botón de abajo para comenzar"
        - Al agregar preguntas, se muestran como cards apiladas verticalmente
        - Cada card de pregunta muestra:
            - **Número de pregunta:** Badge circular con número (1, 2, 3, etc.)
            - **Tipo de pregunta:** Badge con ícono y color:
                - 📝 **Texto Corto:** `bg-blue-100 text-blue-700`
                - 📄 **Texto Largo:** `bg-indigo-100 text-indigo-700`
                - ⭕ **Opción Única:** `bg-purple-100 text-purple-700`
                - ☑️ **Opción Múltiple:** `bg-green-100 text-green-700`
                - ⭐ **Escala 1-5:** `bg-orange-100 text-orange-700`
            - **Texto de la pregunta:** Texto grande (16px), bold
            - **Indicador "Obligatoria":** Badge pequeño rojo si es obligatoria
            - **Opciones de respuesta** (si aplica):
                - Lista de opciones numeradas (1, 2, 3...)
                - Máximo 3 líneas visibles, resto colapsable con "Ver más"
            - **Botones de acción:**
                - **"✏️ Editar":** Abre modal de edición con datos prellenados
                - **"🗑️ Eliminar":** Modal de confirmación
                - **"⬆️ / ⬇️":** Flechas para reordenar (deshabilitadas en primera/última pregunta)
    - **Botón "➕ Agregar Pregunta":**
        - Botón grande, color primario (`bg-primary-600`)
        - Siempre visible al final de la lista
        - Abre **Modal de Constructor de Pregunta**
    - **Modal de Constructor de Pregunta:**
        
        **Header del Modal:**
        
        - Título: "Agregar Nueva Pregunta" o "Editar Pregunta #X"
        - Botón "✕" para cerrar (confirmación si hay cambios sin guardar)
        
        **Contenido del Modal:**
        
        - **Input "Texto de la Pregunta":**
            - Campo de texto multilínea (textarea)
            - Placeholder: "Escribe aquí tu pregunta..."
            - Mínimo: 10 caracteres
            - Máximo: 500 caracteres
            - Contador: "XX/500"
            - Altura: 100px
        - **Select "Tipo de Pregunta":**
            - Dropdown con opciones:
                - 📝 **Texto Corto** - "Respuesta breve de una línea"
                - 📄 **Texto Largo** - "Respuesta extensa con múltiples párrafos"
                - ⭕ **Opción Única** - "Selección de una sola opción (radio buttons)"
                - ☑️ **Opción Múltiple** - "Selección de varias opciones (checkboxes)"
                - ⭐ **Escala de Satisfacción (1-5)** - "Valoración numérica del 1 al 5"
            - Cada opción con ícono, nombre y descripción
            - Al cambiar, se actualiza dinámicamente el formulario inferior
        - **Sección "Opciones de Respuesta"** (Condicional):
            - **Solo visible si tipo = "Opción Única" o "Opción Múltiple"**
            - Lista dinámica de inputs de texto:
                - Placeholder: "Opción 1", "Opción 2", etc.
                - Botón "➕ Agregar Opción" (máximo 10 opciones)
                - Botón "✕" rojo para eliminar cada opción (mínimo 2 opciones)
                - Drag handle "⋮⋮" para reordenar opciones
            - Validación: Mínimo 2 opciones, máximo 10
        - **Sección "Etiquetas de Escala"** (Condicional):
            - **Solo visible si tipo = "Escala de Satisfacción (1-5)"**
            - 5 inputs pequeños para personalizar etiquetas:
                - 1: "Muy insatisfecho" (default)
                - 2: "Insatisfecho" (default)
                - 3: "Neutral" (default)
                - 4: "Satisfecho" (default)
                - 5: "Muy satisfecho" (default)
            - Editables, máximo 30 caracteres cada una
            - Mensaje informativo: "ℹ️ Personaliza las etiquetas para que se adapten a tu pregunta"
        - **Checkbox "Respuesta Obligatoria":**
            - Default: false
            - Label: "Marcar como pregunta obligatoria"
            - Tooltip: "Los usuarios deberán responder esta pregunta para enviar la encuesta"
        - **Preview de la Pregunta:**
            - Card de preview en tiempo real en la parte inferior del modal
            - Muestra cómo se verá la pregunta para el usuario final
            - Incluye: número, tipo, texto, opciones (si aplica), indicador obligatorio
        
        **Footer del Modal:**
        
        - **Botón "Cancelar":**
            - Secundario (outline)
            - Cierra modal (confirmación si hay cambios)
        - **Botón "Guardar Pregunta":**
            - Primario (`bg-primary-600`)
            - Valida campos obligatorios
            - Agrega pregunta a la lista principal
            - Cierra modal automáticamente
    - **Drag & Drop para Reordenar:**
        - Cards de preguntas arrastrables con cursor `cursor-grab`
        - Indicador visual de drag activo: sombra pronunciada + opacidad 0.8
        - Área de drop: línea azul punteada entre preguntas
        - Al soltar: Animación suave de reordenamiento
        - Actualización automática de numeración
    - **Botón "Continuar":**
        - Habilitado solo si hay al menos 1 pregunta agregada
        - Color primario (`bg-primary-600`)
        - Al hacer clic: Transición suave al Paso 3
    - **Botón "Atrás":**
        - Vuelve al Paso 1 manteniendo preguntas guardadas
        - Secundario (outline)
    - **Botón "Guardar Borrador":**
        - Botón secundario (outline) visible en todo momento
        - Guarda encuesta con `estado = "borrador"`
        - Mensaje de confirmación: "✅ Borrador guardado correctamente"
        - Permite continuar editando o salir
    
    **PASO 3: Audiencia y Publicación**
    
    - **Resumen de Pasos Anteriores:**
        - Card compacta con:
            - Título y fecha de vencimiento
            - Total de preguntas agregadas (badge): "📋 X preguntas"
            - Botón "✏️ Editar Preguntas" para volver al Paso 2
    - **Selector de Audiencia (Tree Select Multinivel):**
        
        **Para Director:**
        
        - **Checkbox Global "Todos los Destinatarios":**
            - Ubicado al inicio del árbol
            - Al marcar: Selecciona automáticamente todos los nodos visibles
            - Al desmarcar: Limpia toda la selección
            - Badge informativo: "Total estimado: XXX personas"
        - **Árbol Jerárquico Completo:**
            
            ```
            [☑️] Todos los destinatarios
            -----------------------------------
            📚 Nivel: Inicial
             ├── [☐] 4 años
             │     └── [☐] Matemáticas Inicial
             ├── [☐] 5 años
            📚 Nivel: Primaria
             ├── [☑️] 1ro
             │     ├── [☑️] Matemáticas
             │     └── [☐] Comunicación
             ├── [☑️] 2do 
             │     └── [☑️] Comunicación
             ├── [☐] 3ro 
             ├── [☐] 4to 
             ├── [☐] 5to 
             └── [☐] 6to 
            📚 Nivel: Secundaria
             ├── [☐] 1ro 
             │     └── [☐] Ciencias
             ├── [☐] 2do 
             └── [☐] 3ro 
            -----------------------------------
            👥 Rol: Padres [☑️]
            👥 Rol: Docentes [☐]
            -----------------------------------
            Resumen: 3 cursos, 2 grados, 1 nivel, 1 rol
            
            ```
            
        - **Funcionalidades del árbol:**
            - Selección jerárquica: Marcar "Primaria" marca todos sus grados automáticamente
            - Estados intermedios: Si un padre tiene algunos hijos marcados, muestra estado semi-seleccionado (ícono "–")
            - Colapso/expansión por nivel con animación suave
            - Tooltip al hover: "Haz clic para expandir/colapsar"
        
        **Para Docente con Permisos:**
        
        - **Sin Checkbox Global "Todos"** (oculto completamente)
        - **Árbol Limitado a sus Asignaciones:**
            
            ```
            📚 Mis Grados Asignados
             ├── [☑️] 1ro 
             │     └── [☑️] Matemáticas
             ├── [☐] 2do 
             │     └── [☐] Matemáticas
            -----------------------------------
            👥 Rol: Padres [☑️] (fijo, no editable)
            -----------------------------------
            Resumen: 1 curso, 1 grado
            
            ```
            
        - **Restricciones visuales:**
            - Solo muestra grados/cursos donde tiene `asignaciones_docente_curso` activas
            - Rol "Padres" pre-seleccionado y deshabilitado (no puede cambiar)
            - Mensaje informativo: "ℹ️ Solo puedes enviar encuestas a padres de tus cursos asignados"
            - Sin acceso a roles "Docentes" o combinaciones globales
    - **Panel de Resumen de Audiencia:**
        - Card lateral (desktop) o debajo (móvil) con:
            - Total estimado de destinatarios: "📧 Total estimado: 45 padres"
            - Desglose por tipo:
                - "📚 2 grados seleccionados"
                - "📖 3 cursos seleccionados"
                - "👥 1 rol seleccionado"
            - Botón "👁️ Previsualizar Lista" (opcional, abre modal con listado completo)
    - **Vista Previa Final de la Encuesta:**
        - Card grande con la encuesta renderizada tal como la verán los destinatarios
        - Incluye:
            - Título y descripción
            - Badge de fecha de vencimiento
            - Lista de preguntas con sus tipos y opciones
            - Indicadores de preguntas obligatorias (*)
        - Scroll vertical si hay muchas preguntas
        - Botón "✏️ Editar Preguntas" si se necesita ajustar algo
    - **Botones de Acción Final:**
        - **Botón "📤 Publicar Encuesta":**
            - Color primario (`bg-primary-600`), ícono de envío
            - Habilitado solo si:
                - Audiencia tiene al menos 1 selección
                - Título, descripción, fecha y al menos 1 pregunta válidos
            - Al hacer clic:
                - Mostrar modal de confirmación:
                    - "¿Confirmas la publicación de esta encuesta?"
                    - "Se enviará a [XX] destinatarios"
                    - "Fecha de vencimiento: DD/MM/YYYY"
                    - Botones: "Sí, publicar" (primario) | "Cancelar" (secundario)
                - Spinner en botón + texto "Publicando..."
                - Deshabilitar todos los controles durante publicación
        - **Botón "💾 Guardar como Borrador":**
            - Secundario (outline `border-border-primary`)
            - Guarda encuesta con `estado = "borrador"`
            - Permite continuar editando después
        - **Botón "Atrás":**
            - Vuelve al Paso 2
            - Secundario (outline)
- **CA-04:** Proceso de publicación y validaciones:
    
    **Validación Frontend:**
    
    - Verificar que título tiene entre 10-200 caracteres
    - Verificar que descripción tiene entre 20-500 caracteres
    - Verificar que hay al menos 1 pregunta agregada
    - Verificar que todas las preguntas tienen texto válido (10-500 caracteres)
    - Verificar que preguntas de opción única/múltiple tienen mínimo 2 opciones
    - Verificar que audiencia tiene al menos 1 selección
    - Verificar que fecha de vencimiento es al menos 24 horas en el futuro
    - Mostrar errores específicos por campo si fallan validaciones
    
    **Validación Backend:**
    
    - Verificar permisos del usuario:
        - **Docente:** Validar `permisos_docentes.tipo_permiso = 'encuestas'` y `estado_activo = true`
        - **Docente:** Validar que los grados/cursos seleccionados están en `asignaciones_docente_curso`
        - **Director:** Sin restricciones
    - Sanitizar contenido HTML (descripción y textos de preguntas):
        - Permitir solo texto plano o etiquetas básicas: `<p>, <strong>, <em>, <br>`
        - Eliminar scripts, iframes, objetos maliciosos
    - Validar estructura JSON de preguntas:
        - Cada pregunta debe tener: `tipo`, `texto`, `obligatoria`
        - Preguntas de opción única/múltiple deben tener array `opciones` con mínimo 2 elementos
        - Preguntas de escala deben tener array `etiquetas` con exactamente 5 elementos
    - Validar fecha de vencimiento (al menos 24 horas futuras)
    
    **Inserción en Base de Datos:**
    
    ```sql
    INSERT INTO encuestas (
      titulo, descripcion, preguntas,
      publico_objetivo, grados_objetivo, niveles_objetivo, cursos_objetivo,
      fecha_creacion, fecha_inicio, fecha_vencimiento,
      estado, permite_respuesta_multiple, autor_id, año_academico
    ) VALUES (
      ?, ?, ?::jsonb,
      ?, ?, ?, ?,
      NOW(), NOW(), ?,
      'activa', false, ?, 2025
    );
    
    ```
    
    - **Campos JSON para segmentación:**
        - `publico_objetivo`: `["padres"]` o `["padres", "docentes"]` o `["todos"]`
        - `grados_objetivo`: `["1ro A", "2do B"]`
        - `niveles_objetivo`: `["Primaria"]`
        - `cursos_objetivo`: `["Matemáticas - 1ro A", "Comunicación - 2do B"]`
    - **Estructura JSON de preguntas:**
        
        ```json
        [
          {
            "id": 1,
            "tipo": "texto_corto",
            "texto": "¿Cómo calificarías la comunicación del docente?",
            "obligatoria": true
          },
          {
            "id": 2,
            "tipo": "opcion_unica",
            "texto": "¿Con qué frecuencia revisa la plataforma?",
            "obligatoria": true,
            "opciones": ["Diariamente", "Semanalmente", "Mensualmente", "Nunca"]
          },
          {
            "id": 3,
            "tipo": "escala_1_5",
            "texto": "¿Qué tan satisfecho está con el servicio educativo?",
            "obligatoria": false,
            "etiquetas": ["Muy insatisfecho", "Insatisfecho", "Neutral", "Satisfecho", "Muy satisfecho"]
          }
        ]
        
        ```
        
    - Si checkbox "Todos los destinatarios" está marcado:
        - `publico_objetivo = ["todos"]`
        - `grados_objetivo = null`
        - `niveles_objetivo = null`
        - `cursos_objetivo = null`
- **CA-05:** Generación de notificaciones automáticas:
    
    **Determinación de Destinatarios:**
    
    - **Si `publico_objetivo = ["todos"]`:**
        - Obtener todos los usuarios activos de la institución
    - **Si segmentación específica:**
        - Query complejo para obtener usuarios según:
            - Padres de estudiantes en `grados_objetivo`
            - Padres de estudiantes en `cursos_objetivo`
            - Docentes (si `publico_objetivo` incluye "docentes")
    
    **Creación de Notificaciones:**
    
    ```sql
    INSERT INTO notificaciones (
      usuario_id, tipo, titulo, contenido,
      canal, estado_plataforma, fecha_creacion,
      url_destino, referencia_id, año_academico,
      datos_adicionales
    ) VALUES (
      ?, 'encuesta', 'Nueva encuesta: [Título]', [Descripción truncada a 100 caracteres],
      'ambos', 'pendiente', NOW(),
      '/dashboard/encuestas/[encuesta_id]', ?, 2025,
      '{"fecha_vencimiento": "[fecha]", "autor": "[nombre_autor]"}'
    );
    
    ```
    
    - **Batch insert:** Insertar notificaciones en lotes de 50 para optimizar
    
    **Envío de WhatsApp:**
    
    - Formato del mensaje:
        
        ```
        📋 Nueva encuesta disponible
        [Título de la encuesta]
        
        [Descripción truncada a 150 caracteres...]
        
        ⏰ Vence: DD/MM/YYYY
        📱 Responder ahora: [URL]
        
        ```
        
    - Enviar mediante Meta WhatsApp Cloud API
    - Cola de mensajes para evitar throttling (máx 50 por minuto)
    - Actualizar `estado_whatsapp` en tabla `notificaciones`
    - Registrar errores de envío para retry posterior
- **CA-06:** Feedback después de la publicación:
    - **Modal de Confirmación de Éxito:**
        - Ícono: ✅ (verde, animación de bounce)
        - Título: "¡Encuesta publicada exitosamente!"
        - Contenido:
            - "Tu encuesta ha sido enviada a [XX] destinatarios"
            - "Se han generado [XX] notificaciones (plataforma + WhatsApp)"
            - "Vence el: DD/MM/YYYY a las 23:59"
        - Botones:
            - "Ver Encuesta" (primario) → Redirige a vista de detalle
            - "Ver Resultados" (secundario) → Redirige a HU-ENC-04 (inicialmente sin respuestas)
            - "Crear Otra" (outline) → Limpia formulario y reinicia wizard
            - "Volver a Bandeja" (outline) → Redirige a HU-ENC-00
    - **Actualizar bandeja de encuestas:**
        - Agregar nueva encuesta al inicio de la lista
        - Badge "Nuevo" visible por 24 horas
    - **Limpiar estados:**
        - Resetear wizard completo
        - Limpiar lista de preguntas
        - Limpiar selección de audiencia

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados con rol docente (con permisos) o director pueden crear encuestas
- **VN-02:** Docente solo puede crear si `permisos_docentes.tipo_permiso = 'encuestas'` y `estado_activo = true`
- **VN-03:** Título debe tener entre 10 y 200 caracteres
- **VN-04:** Descripción debe tener entre 20 y 500 caracteres
- **VN-05:** Fecha de vencimiento debe ser al menos 24 horas en el futuro
- **VN-06:** Debe haber al menos 1 pregunta agregada
- **VN-07:** Cada pregunta debe tener texto válido (10-500 caracteres)
- **VN-08:** Preguntas de opción única/múltiple deben tener mínimo 2 opciones, máximo 10
- **VN-09:** Preguntas de escala deben tener exactamente 5 etiquetas
- **VN-10:** Audiencia debe tener al menos 1 selección (grado, curso, nivel o rol)
- **VN-11:** Docente solo puede seleccionar grados/cursos donde tiene `asignaciones_docente_curso` activas
- **VN-12:** Docente solo puede seleccionar rol "Padres"
- **VN-13:** Contenido debe estar sanitizado (sin scripts maliciosos)
- **VN-14:** Si checkbox "Todos" está marcado, otros selectores no aplican
- **VN-15:** No se puede publicar encuesta sin preguntas o audiencia

---

### **UI/UX**

- **UX-01:** Wizard visual de **3 pasos** con barra de progreso:
    
    ```
    ┌─────────────────────────────────────────────────────┐
    │  [1] Información  ━━━  [2] Preguntas  ━━━  [3] Audiencia │
    │      ●━━━━━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━○           │
    └─────────────────────────────────────────────────────┘
    
    ```
    
    - Paso actual resaltado en `bg-primary-600`
    - Paso completado con check verde ✓
    - Paso pendiente en gris claro `text-text-muted`
    - Animación de transición tipo slide
- **UX-02:** Diseño del Paso 1 (Información Básica):
    - Layout de formulario vertical con espaciado consistente (24px entre campos)
    - Card con fondo blanco `bg-bg-card` y sombra `shadow-md`
    - Labels con asterisco rojo (*) para campos obligatorios
    - Fecha de vencimiento con calendario visual integrado
    - Contador de caracteres con colores:
        - Verde `text-success`: Dentro del rango válido
        - Rojo `text-error`: Fuera del rango mínimo
        - Naranja `text-warning`: Cerca del límite máximo
- **UX-03:** Diseño del Paso 2 (Constructor de Preguntas):
    - **Estado Vacío:**
        - Ilustración SVG centrada (clipboard vacío) con color `text-text-muted`
        - Texto grande: "Aún no has agregado preguntas"
        - Subtexto: "Haz clic en el botón de abajo para comenzar"
    - **Cards de Preguntas:**
        - Fondo blanco `bg-bg-card` con borde `border-border-primary`
        - Sombra sutil `shadow-sm`, elevada al hover `shadow-md`
        - Layout grid con número de pregunta a la izquierda
        - Badges de tipo con colores específicos:
            - 📝 Texto Corto: `bg-blue-100 text-blue-700`
            - 📄 Texto Largo: `bg-indigo-100 text-indigo-700`
            - ⭕ Opción Única: `bg-purple-100 text-purple-700`
            - ☑️ Opción Múltiple: `bg-green-100 text-green-700`
            - ⭐ Escala 1-5: `bg-orange-100 text-orange-700`
        - Indicador obligatoria: Badge pequeño rojo `bg-error-light text-error-dark`
        - Botones de acción con íconos claros y tooltips
    - **Modal de Constructor:**
        - Overlay oscuro `bg-bg-overlay` (z-index alto)
        - Modal centrado con animación fade-in + scale
        - Ancho máximo: 700px
        - Secciones claramente separadas con dividers
        - Preview en tiempo real al final con fondo gris claro `bg-bg-sidebar`
    - **Drag & Drop:**
        - Cursor `cursor-grab` en estado normal
        - Cursor `cursor-grabbing` durante drag
        - Opacidad 0.8 + sombra `shadow-xl` al arrastrar
        - Línea azul punteada `border-primary-400` para indicar drop zone
        - Animación suave de reordenamiento (300ms)
- **UX-04:** Diseño del Paso 3 (Audiencia y Publicación):
- **Tree Select con diseño jerárquico claro:**
    - Indentación visual por nivel (4px por nivel)
    - Íconos representativos: 📚 Nivel, 📖 Grado, 📘 Curso, 👥 Rol
    - Checkboxes con 3 estados visuales:
        - Marcado: ☑️ (color `bg-primary-600`)
        - Desmarcado: ☐ (gris `text-text-muted`)
        - Parcial: ⊟ (color `bg-primary-300`)
    - Animación de expansión/colapso suave (200ms)
    - Hover effect: Fondo gris claro `bg-bg-sidebar` en nodos
    - Transición suave en todos los estados
- **Panel de Resumen lateral:**
    - Card fixed en el lado derecho (desktop) o debajo (móvil)
    - Fondo azul muy claro `bg-info-light` con borde `border-info`
    - Íconos grandes (32px) con números destacados en bold
    - Actualización en tiempo real al seleccionar nodos
    - Badge con total estimado de destinatarios
- **Vista previa de la encuesta:**
    - Card grande con diseño similar a la vista final
    - Header con título y badge de fecha de vencimiento
    - Lista de preguntas con numeración
    - Indicadores de preguntas obligatorias con asterisco rojo
    - Scroll vertical si excede 600px de altura
    - Botón "✏️ Editar" flotante en esquina superior derecha
- **UX-05:** Estados visuales de botones:
    - **Normal:** Color correspondiente, cursor pointer
    - **Hover:** Color más oscuro, escala 1.02, transición 200ms
    - **Deshabilitado:** Gris claro `bg-bg-disabled`, cursor not-allowed, opacidad 0.5
    - **Cargando:** Spinner animado en color blanco + texto "Procesando..."
    - **Éxito:** Transición a verde `bg-success` con check ✓ (300ms)
- **UX-06:** Modal de confirmación de publicación:
    - Overlay oscuro semi-transparente `bg-bg-overlay` (z-index alto)
    - Modal centrado con animación de fade-in + scale
    - Ícono de alerta grande (48px) con color naranja `text-warning`
    - Texto claro: "¿Confirmas la publicación?"
    - Desglose de destinatarios: "[XX] padres, [YY] docentes"
    - Fecha de vencimiento destacada con ícono 📅
    - Botones con jerarquía visual clara:
        - "Sí, publicar" (primario `bg-primary-600`, grande)
        - "Cancelar" (secundario outline `border-border-primary`)
- **UX-07:** Modal de éxito con animación:
    - Ícono grande ✅ (64px) con animación de bounce
    - Confetti animation opcional usando canvas
    - Texto de confirmación con números destacados en bold
    - Lista de acciones completadas con checks verdes
    - Botones de acción con íconos descriptivos y colores diferenciados

---

### **Estados y Flujo**

- **EF-01:** Estado inicial Paso 1: Todos los campos vacíos, botón "Continuar" deshabilitado
- **EF-02:** Estado Paso 1 completo: Título, descripción y fecha válidos, botón "Continuar" habilitado con color `bg-primary-600`
- **EF-03:** Transición Paso 1 → Paso 2: Animación de slide hacia la izquierda (300ms)
- **EF-04:** Estado inicial Paso 2: Lista vacía, mensaje de estado vacío, botón "➕ Agregar Pregunta" destacado
- **EF-05:** Estado con preguntas: Cards apiladas verticalmente, botones de reordenamiento activos
- **EF-06:** Estado de modal abierto: Overlay visible, formulario de pregunta centrado, preview en tiempo real
- **EF-07:** Estado de drag activo: Card con opacidad 0.8, sombra pronunciada, línea de drop visible
- **EF-08:** Estado Paso 2 completo: Al menos 1 pregunta agregada, botón "Continuar" habilitado
- **EF-09:** Transición Paso 2 → Paso 3: Animación de slide hacia la izquierda
- **EF-10:** Estado inicial Paso 3: Árbol colapsado, ninguna selección, botón "Publicar" deshabilitado
- **EF-11:** Estado con selección: Panel de resumen actualizado, botón "Publicar" habilitado
- **EF-12:** Estado de publicación: Spinner en botón, wizard deshabilitado, modal de confirmación
- **EF-13:** Estado de éxito: Modal de éxito con animación, opciones de navegación
- **EF-14:** Estado de error: Alert con mensaje específico, opción de reintentar

---

### **Validaciones de Entrada**

- **VE-01:** Título debe tener entre 10 y 200 caracteres (validación en tiempo real)
- **VE-02:** Descripción debe tener entre 20 y 500 caracteres (validación en tiempo real)
- **VE-03:** Fecha de vencimiento debe ser timestamp válido en formato ISO 8601
- **VE-04:** Fecha de vencimiento debe ser al menos 24 horas en el futuro
- **VE-05:** Texto de pregunta debe tener entre 10 y 500 caracteres
- **VE-06:** Preguntas de opción única/múltiple deben tener mínimo 2 opciones, máximo 10
- **VE-07:** Cada opción debe tener mínimo 2 caracteres, máximo 100
- **VE-08:** Etiquetas de escala deben tener máximo 30 caracteres cada una
- **VE-09:** Audiencia debe tener al menos 1 nodo seleccionado en el árbol
- **VE-10:** Contenido debe pasar sanitización (sin scripts maliciosos)

---

### **Mensajes de Error**

- "El título debe tener al menos 10 caracteres"
- "El título no puede exceder 200 caracteres"
- "La descripción debe tener al menos 20 caracteres"
- "La descripción no puede exceder 500 caracteres"
- "La fecha de vencimiento debe ser al menos 24 horas en el futuro"
- "Debes agregar al menos una pregunta"
- "El texto de la pregunta debe tener entre 10 y 500 caracteres"
- "Debes agregar al menos 2 opciones de respuesta"
- "No puedes agregar más de 10 opciones"
- "Cada opción debe tener al menos 2 caracteres"
- "Debes seleccionar al menos un destinatario"
- "No tienes permisos para enviar encuestas a '[Grado/Curso]'"
- "Error al publicar la encuesta. Verifica tu conexión e intenta nuevamente"
- "Error al enviar notificaciones por WhatsApp. La encuesta fue publicada pero algunas notificaciones fallaron"
- "El contenido contiene elementos no permitidos. Por favor, revisa tu mensaje"

---

### **Mensajes de Éxito**

- "✅ Borrador guardado correctamente"
- "✅ Pregunta agregada exitosamente"
- "✅ Pregunta editada correctamente"
- "✅ Pregunta eliminada"
- "✅ Preguntas reordenadas"
- "✅ ¡Encuesta publicada exitosamente!"
- "✅ Notificaciones enviadas a [XX] destinatarios"
- "📧 [XX] notificaciones de plataforma generadas"
- "📱 [YY] mensajes de WhatsApp enviados"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación como docente/director)
    - HU-USERS-65 (Asignación de permisos a docentes)
    - HU-ENC-00 (Bandeja de encuestas)
- **HU Siguientes:**
    - HU-ENC-01 (Responder encuesta)
    - HU-ENC-02 (Ver encuestas respondidas)
    - HU-ENC-04 (Ver resultados y estadísticas)
    - HU-ENC-05 (Notificaciones de nuevas encuestas)

---

### **Componentes y Estructura**

- **Tipo:** Página completa con wizard de 3 pasos (`/dashboard/encuestas/nueva`)
- **Componentes principales:**
    - `CrearEncuestaWizard`: Componente contenedor del wizard
    - `StepProgressBar`: Barra de progreso visual entre pasos
    - `InformacionBasicaStep`: Paso 1 - Título, descripción, fecha
    - `TituloInput`: Campo de texto con contador
    - `DescripcionTextarea`: Campo multilínea con contador
    - `FechaVencimientoPicker`: Selector de fecha con calendario
    - `PreguntasStep`: Paso 2 - Constructor de preguntas
    - `ContextoResumen`: Card con resumen del Paso 1
    - `ListaPreguntas`: Container de cards de preguntas
    - `PreguntaCard`: Card individual de pregunta con acciones
    - `DragHandle`: Handle para drag & drop de preguntas
    - `AgregarPreguntaButton`: Botón para abrir modal
    - `ConstructorPreguntaModal`: Modal de creación/edición
    - `TipoPreguntaSelect`: Selector de tipo con íconos
    - `OpcionesRespuesta`: Lista dinámica de inputs para opciones
    - `EtiquetasEscala`: Inputs para personalizar etiquetas 1-5
    - `PreguntaPreview`: Vista previa en tiempo real
    - `AudienciaStep`: Paso 3 - Segmentación y publicación
    - `EncuestaResumen`: Card con resumen de pasos anteriores
    - `AudienciaTreeSelect`: Árbol jerárquico con checkboxes
    - `CheckboxGlobal`: Checkbox "Todos los destinatarios"
    - `ResumenAudienciaPanel`: Card lateral con contadores
    - `EncuestaPreviewFinal`: Vista previa final de la encuesta
    - `PublicarButton`: Botón de publicación con estados
    - `GuardarBorradorButton`: Botón de guardado temporal
    - `ConfirmacionModal`: Modal de confirmación de publicación
    - `ExitoModal`: Modal de éxito con animación
    - `ErrorAlert`: Componente de alertas de error
- **Endpoints API:**
    - `GET /permisos-docentes/:docente_id` - Verificar permisos del docente
    - `GET /nivel-grado` - Lista de niveles y grados
    - `GET /cursos/docente/:docente_id` - Cursos asignados al docente (con grados)
    - `GET /cursos/todos` - Todos los cursos (solo director)
    - `POST /encuestas` - Crear nueva encuesta
    - `POST /encuestas/borrador` - Guardar como borrador
    - `POST /notificaciones/batch` - Crear notificaciones masivas
    - `POST /notificaciones/whatsapp/batch` - Enviar WhatsApp masivo
    - `GET /usuarios/destinatarios` - Calcular destinatarios según segmentación (preview)

---

### **Reglas de Negocio Específicas del Módulo (RN-ENC)**

- **RN-ENC-01:** Docentes solo pueden crear encuestas si tienen `permisos_docentes.tipo_permiso = 'encuestas'` y `estado_activo = true`
- **RN-ENC-02:** Cada encuesta debe tener al menos 1 pregunta y máximo 50 preguntas
- **RN-ENC-03:** Preguntas de opción única/múltiple deben tener mínimo 2 opciones y máximo 10
- **RN-ENC-04:** Preguntas de escala siempre tienen exactamente 5 niveles (1-5)
- **RN-ENC-05:** Docentes solo pueden segmentar encuestas dentro de sus grados/cursos asignados
- **RN-ENC-06:** Docentes solo pueden enviar encuestas a rol "Padres", no a "Docentes"
- **RN-ENC-07:** Director puede enviar encuestas a cualquier segmento sin restricciones
- **RN-ENC-08:** Fecha de vencimiento debe ser al menos 24 horas después de la fecha de publicación
- **RN-ENC-09:** Las encuestas se cierran automáticamente a las 23:59 del día de vencimiento
- **RN-ENC-10:** Una vez publicada, no se puede editar la estructura de preguntas (solo título/descripción)
- **RN-ENC-11:** Las preguntas se almacenan en formato JSON en el campo `preguntas` de la tabla `encuestas`
- **RN-ENC-12:** Al publicar, se generan notificaciones automáticas vía WhatsApp + plataforma a todos los destinatarios
- **RN-ENC-13:** Solo el autor de la encuesta puede ver los resultados completos
- **RN-ENC-14:** El contenido de la encuesta (título, descripción, preguntas) debe ser sanitizado para evitar XSS
- **RN-ENC-15:** El orden de las preguntas definido al crear se mantiene fijo en el formulario de respuesta

---

# **Historia de Usuario Detallada - HU-ENC-00**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Usuario que visualiza encuestas
2. **encuestas** - Encuestas publicadas en la institución
3. **respuestas_encuestas** - Registro de respuestas del usuario
4. **estudiantes** - Hijos del padre (para filtrado automático)
5. **relaciones_familiares** - Vinculación padre-hijo
6. **nivel_grado** - Niveles y grados para filtrado
7. **asignaciones_docente_curso** - Cursos del docente (para filtrado)
8. **permisos_docentes** - Permisos de creación de encuestas

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Relaciones y permisos configurados

### **Roles Involucrados:**

- **Padre:** Ve encuestas de grados/niveles de sus hijos
- **Docente:** Ve encuestas institucionales + propias (si tiene permisos)
- **Director:** Ve todas las encuestas de la institución

---

## **HU-ENC-00 — Panel de Encuestas**

**Título:** Vista principal de gestión y visualización de encuestas institucionales

**Historia:**

> Como padre/docente/director, quiero ver un panel organizado con encuestas activas, respondidas y vencidas en formato de tarjetas para gestionar mis encuestas pendientes y consultar mi historial de respuestas.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al módulo "Encuestas" desde el dashboard principal mediante botón destacado en menú lateral
- **CA-02:** La interfaz principal está dividida en **2 secciones** (layout tipo Pinterest/Grid):
    
    **SECCIÓN SUPERIOR: Barra de Herramientas y Filtros**
    
    - **Botón "Nueva Encuesta"** (solo visible si tiene permisos):
        - **Director:** Siempre visible, color primario (`bg-primary-600`)
        - **Docente con permisos:** Visible si `permisos_docentes.tipo_permiso = 'encuestas'` y `estado_activo = true`
        - **Docente sin permisos / Padre:** No visible
        - Click redirige a HU-ENC-03
        - Posición: Esquina superior derecha, fijo
    - **Badge de contador** de encuestas pendientes (esquina superior del ícono del módulo):
        - Número en círculo naranja (`bg-warning text-white`)
        - Solo cuenta encuestas activas y no respondidas del usuario
        - Se actualiza en tiempo real con polling
    - **Pestañas de Estado (Tabs):**
        - Layout horizontal con 3 pestañas:
            - **"Activas"**: Encuestas dentro del rango de fechas y no respondidas
                - Badge con número de pendientes: `bg-warning text-white`
                - Color activo: `bg-primary-600 text-white`
            - **"Respondidas"**: Encuestas completadas por el usuario
                - Badge con número de respondidas: `bg-success text-white`
                - Color activo: `bg-success text-white`
            - **"Vencidas"**: Encuestas con fecha vencida y no respondidas
                - Badge con número de vencidas: `bg-error text-white`
                - Color activo: `bg-error text-white`
        - Transición suave al cambiar de pestaña (fade 300ms)
        - Pestaña activa con fondo de color y texto blanco
        - Pestañas inactivas con texto gris `text-text-secondary`
    - **Buscador con campo de texto:**
        - Placeholder: "Buscar encuestas por título o descripción..."
        - Búsqueda en tiempo real (debounce 300ms)
        - Ícono de lupa 🔍
        - Búsqueda aplica sobre: título, descripción
        - Ancho: 40% de la pantalla (desktop), 100% (móvil)
    - **Filtros avanzados:**
        
        **Filtros Comunes (Padre / Docente / Director):**
        
        - **Date Range Picker "Rango de Fechas de Vencimiento":**
            - Selector de fecha inicio y fecha fin
            - Formato: DD/MM/YYYY
            - Default: Próximos 30 días
            - Preset buttons: "Esta semana", "Este mes", "Próximos 30 días", "Todo"
        - **Select "Ordenar por":**
            - Opciones: Más reciente, Más antigua, Por vencimiento (ascendente), Por vencimiento (descendente)
            - Default: "Más reciente"
        
        **Filtros Específicos por Rol:**
        
        **Para Docente con permisos:**
        
        - **Select "Tipo de Encuesta":**
            - Opciones: Todas, Mis encuestas, Encuestas recibidas
            - Default: "Todas"
        
        **Para Director:**
        
        - **Select "Autor":**
            - Dropdown con lista de todos los autores (director + docentes con permisos)
            - Opciones: Todos, [Nombres de usuarios]
            - Default: "Todos"
        - **Select "Nivel":**
            - Opciones: Todos, Inicial, Primaria, Secundaria
            - Default: "Todos"
        - **Select "Grado":**
            - Opciones dinámicas según nivel seleccionado
            - Default: "Todos"
    - **Botón "Limpiar Filtros":**
        - Visible solo si hay al menos 1 filtro activo (excepto ordenamiento)
        - Resetea todos los filtros a valores por defecto
        - Color secundario (outline `border-border-primary`)
    
    **SECCIÓN PRINCIPAL: Vista de Encuestas**
    
    - **Vista de tarjetas (Grid Layout):**
        - **Desktop (>1024px):** Grid de 3 columnas con gap de 24px
        - **Tablet (768px-1024px):** Grid de 2 columnas con gap de 16px
        - **Mobile (<768px):** Lista vertical con gap de 12px
    - **Cada tarjeta de encuesta muestra:**
        
        **Header de Tarjeta:**
        
        - **Badge de Estado** (esquina superior izquierda):
            - Activa: 🟢 `bg-success-light text-success-dark` "ACTIVA"
            - Respondida: 🟡 `bg-warning-light text-warning-dark` "RESPONDIDA"
            - Vencida: 🔴 `bg-error-light text-error-dark` "VENCIDA"
        - **Badge "Mis Encuestas"** (esquina superior derecha):
            - Visible solo si el usuario es el autor
            - Color: `bg-tertiary-100 text-tertiary-700`
            - Ícono: 📝
            - Texto: "MÍA"
        - **Borde de Color según Estado:**
            - Activa: Borde izquierdo verde de 4px (`border-l-4 border-success`)
            - Respondida: Borde izquierdo amarillo de 4px (`border-l-4 border-warning`)
            - Vencida: Borde izquierdo rojo de 4px (`border-l-4 border-error`)
        
        **Contenido de Tarjeta:**
        
        - **Título de la Encuesta:**
            - Texto grande, bold (18px)
            - Máximo 2 líneas, truncado con "..."
            - Color: Negro (`text-text-primary`)
        - **Descripción:**
            - Preview de la descripción (sin HTML)
            - Máximo 100 caracteres
            - Truncado con "..."
            - Color: Gris medio (`text-text-secondary`)
            - Tamaño: 14px
        - **Metadatos en fila inferior:**
            - **Autor:** "Por: [Nombre Completo]" con ícono 👤
            - **Fecha de Vencimiento:**
                - Formato: "Vence: DD/MM/YYYY"
                - Ícono: ⏰
                - Color especial si está próximo a vencer (menos de 3 días): `text-warning-dark`
            - **Indicador de Total de Preguntas:**
                - Badge pequeño: "📋 X preguntas"
                - Color: `bg-bg-sidebar text-text-secondary`
        - **Contador de Respuestas** (solo visible para el autor):
            - Layout horizontal con ícono
            - Texto: "📊 [XX] respuestas"
            - Color: `text-tertiary-600`
            - Tooltip al hover: "Ver análisis de resultados"
        
        **Footer de Tarjeta:**
        
        - **Botón principal según estado:**
            
            **Si es Activa y no respondida:**
            
            - Botón "Responder →"
            - Color primario (`bg-primary-600 text-white`)
            - Click: Redirige a HU-ENC-01 (responder encuesta)
            
            **Si es Respondida:**
            
            - Botón "Ver mi respuesta →"
            - Color secundario (`bg-secondary-500 text-white`)
            - Click: Redirige a HU-ENC-02 (ver respuestas propias)
            
            **Si es Vencida:**
            
            - Botón "Ver encuesta" (deshabilitado visualmente)
            - Color gris claro (`bg-bg-disabled text-text-disabled`)
            - Tooltip: "Esta encuesta ha vencido"
            - Click: Redirige a vista de solo lectura
        - **Menú de opciones (⋮)** (solo autor de la encuesta):
            - Visible solo al hover sobre la tarjeta
            - Dropdown con opciones:
                - "📊 Ver resultados" (redirige a HU-ENC-04)
                - "✏️ Editar información" (solo título/descripción, no preguntas)
                - "🚫 Cerrar encuesta" (antes del vencimiento)
                - "🗑️ Eliminar" (solo si no tiene respuestas, confirmación obligatoria)
    - **Estado Vacío:**
        - Si no hay encuestas después de aplicar filtros:
            - Ilustración SVG centrada (clipboard vacío)
            - Mensaje según contexto:
                - **Sin filtros (Activas):** "No tienes encuestas activas por responder"
                - **Sin filtros (Respondidas):** "Aún no has respondido ninguna encuesta"
                - **Sin filtros (Vencidas):** "No tienes encuestas vencidas"
                - **Con filtros:** "No se encontraron encuestas con los filtros aplicados"
            - Botón "Limpiar filtros" (si aplica)
            - Botón "📋 Crear Encuesta" (si tiene permisos, solo en pestaña "Activas")
- **CA-03:** Segmentación Automática por Rol:
    
    **Lógica de Filtrado Automático (Backend):**
    
    **Para Padre:**
    
    ```sql
    SELECT e.* FROM encuestas e
    WHERE e.estado IN ('activa', 'vencida')
      AND e.fecha_inicio <= NOW()
      AND (
        -- Encuestas dirigidas a todos
        e.publico_objetivo @> '["todos"]'::jsonb
        OR
        -- Encuestas dirigidas a padres
        (e.publico_objetivo @> '["padres"]'::jsonb
         AND (
           -- Encuestas del nivel de sus hijos
           e.niveles_objetivo @> '["{nivel_hijo}"]'::jsonb
           OR
           -- Encuestas del grado de sus hijos
           e.grados_objetivo @> '["{grado_hijo}"]'::jsonb
           OR
           -- Encuestas del curso de sus hijos
           e.cursos_objetivo @> '["{curso_hijo}"]'::jsonb
         ))
      )
    ORDER BY e.fecha_creacion DESC;
    
    ```
    
    - **Lógica específica:**
        - Obtener estudiantes del padre desde `relaciones_familiares`
        - Obtener nivel/grado de cada estudiante
        - Filtrar encuestas que:
            - Incluyen "todos" en `publico_objetivo`
            - O incluyen "padres" Y (nivel/grado/curso del hijo en arrays objetivo)
    
    **Para Docente sin permisos:**
    
    ```sql
    SELECT e.* FROM encuestas e
    WHERE e.estado IN ('activa', 'vencida')
      AND e.fecha_inicio <= NOW()
      AND (
        -- Encuestas institucionales dirigidas a docentes
        (e.publico_objetivo @> '["todos"]'::jsonb
         OR e.publico_objetivo @> '["docentes"]'::jsonb)
      )
    ORDER BY e.fecha_creacion DESC;
    
    ```
    
    - **Lógica específica:**
        - Mostrar encuestas dirigidas a "todos" o "docentes"
        - No mostrar encuestas de otros docentes dirigidas solo a padres
    
    **Para Docente con permisos:**
    
    ```sql
    SELECT e.* FROM encuestas e
    WHERE e.estado IN ('activa', 'vencida')
      AND e.fecha_inicio <= NOW()
      AND (
        -- Encuestas creadas por el docente
        e.autor_id = {docente_id}
        OR
        -- Encuestas institucionales
        (e.publico_objetivo @> '["todos"]'::jsonb
         OR e.publico_objetivo @> '["docentes"]'::jsonb)
      )
    ORDER BY e.fecha_creacion DESC;
    
    ```
    
    - **Lógica específica:**
        - Mostrar encuestas creadas por el docente (propias) con badge "Mis Encuestas"
        - Mostrar encuestas dirigidas a "todos" o "docentes"
    
    **Para Director:**
    
    ```sql
    SELECT e.* FROM encuestas e
    WHERE e.estado IN ('activa', 'vencida')
      AND e.fecha_inicio <= NOW()
    ORDER BY e.fecha_creacion DESC;
    
    ```
    
    - **Lógica específica:**
        - Sin filtros automáticos
        - Acceso completo a todas las encuestas de la institución
        - Encuestas propias marcadas con badge "Mis Encuestas"
- **CA-04:** Determinación del Estado de la Encuesta:
    - **Estado "Activa":**
        - `estado = 'activa'` en base de datos
        - `fecha_vencimiento >= NOW()`
        - No existe respuesta del usuario en `respuestas_encuestas`
    - **Estado "Respondida":**
        - Existe registro en `respuestas_encuestas` con `usuario_id = current_user`
        - Independiente de si está vencida o no
    - **Estado "Vencida":**
        - `fecha_vencimiento < NOW()`
        - No existe respuesta del usuario en `respuestas_encuestas`
        - Automáticamente marcada como vencida por el sistema
- **CA-05:** Ordenamiento de Encuestas:
    - Por defecto: **Fecha de creación descendente** (más reciente primero)
    - Encuestas próximas a vencer (menos de 3 días) aparecen destacadas con badge naranja
    - Selector de ordenamiento alternativo:
        - "Más reciente"
        - "Más antigua"
        - "Por vencimiento (más próximo)"
        - "Por vencimiento (más lejano)"
    - Dentro de cada pestaña, mantener ordenamiento seleccionado
- **CA-06:** Paginación y Carga:
    - **Lazy loading:** Cargar 12 encuestas iniciales
    - Al hacer scroll al final: Cargar siguiente lote de 12 automáticamente
    - Indicador de carga: Spinner al final de la lista
    - Si no hay más encuestas: Mensaje "No hay más encuestas"
    - Botón "Cargar más" alternativo (si lazy loading falla)
- **CA-07:** Interacciones con Encuestas:
    - **Click en tarjeta completa:**
        - Si es Activa: Abre formulario de respuesta (HU-ENC-01)
        - Si es Respondida: Abre vista de respuestas propias (HU-ENC-02)
        - Si es Vencida: Abre vista de solo lectura
    - **Hover sobre tarjeta:**
        - Fondo ligeramente más oscuro (`bg-bg-sidebar`)
        - Sombra más pronunciada (`shadow-lg`)
        - Cursor pointer
        - Menú de opciones (⋮) visible (solo autor)
    - **Click en botón principal:**
        - Responder/Ver respuesta/Ver encuesta según estado
    - **Click en menú de opciones:**
        - **Ver resultados:** Redirige a dashboard de resultados (HU-ENC-04)
        - **Editar información:** Permite editar título y descripción (no preguntas)
        - **Cerrar encuesta:** Modal de confirmación + actualizar estado
        - **Eliminar:** Modal de confirmación con advertencia + eliminación permanente (solo si no tiene respuestas)
- **CA-08:** Actualización en Tiempo Real:
    - **Polling cada 60 segundos** para verificar nuevas encuestas
    - Si hay nuevas encuestas:
        - Mostrar toast notification: "📋 [X] nueva(s) encuesta(s) disponible(s)"
        - Agregar encuestas al inicio de la lista con animación fade-in
        - Actualizar badge de contador de pendientes
        - Reproducir sonido de notificación (opcional, configurable)
    - Actualizar contador de pendientes sin recargar página
    - Actualizar estados de encuestas vencidas automáticamente
- **CA-09:** Responsive Design:
    - **Desktop (>1024px):**
        - Sidebar de filtros fijo a la izquierda (20% ancho)
        - Grid de 3 columnas para encuestas (80% ancho)
        - Pestañas y botón "Nueva Encuesta" en header fijo
    - **Tablet (768px-1024px):**
        - Filtros colapsables en hamburger menu
        - Grid de 2 columnas
        - Pestañas en header, botón "Nueva" flotante
    - **Mobile (<768px):**
        - Filtros en modal slide-up desde abajo
        - Lista vertical (1 columna)
        - Botón flotante "+" para nueva encuesta (esquina inferior derecha)
        - Pestañas scrollables horizontalmente

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden acceder al módulo
- **VN-02:** Padre solo ve encuestas de grados/niveles de sus hijos vinculados
- **VN-03:** Docente sin permisos solo ve encuestas institucionales dirigidas a docentes
- **VN-04:** Docente con permisos ve encuestas institucionales + propias
- **VN-05:** Director ve todas las encuestas sin restricciones
- **VN-06:** Solo encuestas con `estado = 'activa'` o `fecha_vencimiento < NOW()` son visibles
- **VN-07:** Encuestas con `estado = 'borrador'` no aparecen en bandeja principal
- **VN-08:** Botón "Nueva Encuesta" solo visible si usuario tiene permisos de creación
- **VN-09:** Opciones de editar/eliminar solo visibles para autor de la encuesta
- **VN-10:** Contador de pendientes solo cuenta encuestas activas no respondidas del usuario
- **VN-11:** Una encuesta respondida no puede volver a estado "Activa" para el mismo usuario
- **VN-12:** Encuestas vencidas no permiten respuestas nuevas

---

### **UI/UX**

- **UX-01:** Layout tipo Pinterest/Grid con diseño limpio:
    
    ```
    ┌────────────────────────────────────────────────────────┐
    │  📋 Encuestas                     [🔍 Buscar...]  [📋 Nueva]  │
    │  [Activas (5)] [Respondidas (12)] [Vencidas (2)]       │
    ├──────────┬─────────────────────────────────────────────┤
    │ FILTROS  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
    │          │  │ 🟢 Card 1│  │ 🟢 Card 2│  │ 🟡 Card 3│  │
    │ Orden    │  │ Título...│  │ Título...│  │ Título...│  │
    │ [Más▼]   │  │ Descripción││ Descripción││ Descripción││
    │          │  │ Por: ... │  │ Por: ... │  │ Por: ... │  │
    │ Fecha    │  │ Vence:   │  │ Vence:   │  │ Vence:   │  │
    │ [Rango▼] │  │[Responder]│  │[Ver resp]│  │[Responder]│  │
    │          │  └──────────┘  └──────────┘  └──────────┘  │
    └──────────┴─────────────────────────────────────────────┘
    
    ```
    
- **UX-02:** Diseño de pestañas (Tabs):
    - Layout horizontal con 3 pestañas de igual ancho
    - Pestaña activa con fondo de color específico + texto blanco
    - Badge circular con número en esquina superior derecha de cada pestaña
    - Transición suave al cambiar (fade 300ms)
    - Underline animado en pestaña activa
- **UX-03:** Diseño de tarjetas de encuesta:
    - **Altura:** Automática según contenido (min 220px, max 320px)
    - **Padding:** 20px
    - **Border-radius:** 12px
    - **Borde izquierdo de 4px** con color según estado:
        - Activa: `border-l-4 border-success`
        - Respondida: `border-l-4 border-warning`
        - Vencida: `border-l-4 border-error`
    - **Sombra:**
        - Normal: `shadow-sm`
        - Hover: `shadow-lg`
    - **Transición:** `transition: all 0.3s ease`
    - **Estado según pestaña:**
        - Activa: Fondo blanco `bg-bg-card`
        - Respondida: Fondo gris muy claro `bg-gray-50`
        - Vencida: Fondo rojo muy claro `bg-error-light` con opacidad 0.3
- **UX-04:** Badges visuales con colores institucionales:
    - **Activa:** `bg-success-light text-success-dark` 🟢
    - **Respondida:** `bg-warning-light text-warning-dark` 🟡
    - **Vencida:** `bg-error-light text-error-dark` 🔴
    - **Mis Encuestas:** `bg-tertiary-100 text-tertiary-700` 📝
    - **Próximo a vencer:** `bg-warning-light text-warning-dark` ⏰ (pulsante)
- **UX-05:** Botón "Nueva Encuesta" destacado:
    - **Desktop:** Botón grande en header, color primario `bg-primary-600`, ícono 📋
    - **Mobile:** Botón flotante circular (FAB) en esquina inferior derecha
    - **Animación:** Escala 1.1 al hover, pulse sutil en mobile
    - **Posición fija:** Visible siempre al hacer scroll
- **UX-06:** Filtros con diseño limpio:
    - Dropdowns con íconos descriptivos
    - Chips visuales para filtros activos (removibles con X)
    - Botón "Limpiar filtros" solo visible si hay filtros aplicados
    - Animación de aplicación de filtros: Fade-out → Fade-in de tarjetas
- **UX-07:** Buscador con feedback instantáneo:
    - Ícono de lupa animado mientras busca
    - Debounce de 300ms para no saturar servidor
    - Mensaje si no hay resultados: "No se encontraron encuestas con '[término]'"
- **UX-08:** Animaciones suaves:
    - Aparición de tarjetas: Fade-in + slide-up (300ms, stagger 50ms entre tarjetas)
    - Hover en tarjetas: Escala 1.02 + sombra más pronunciada (200ms)
    - Cambio de pestaña: Cross-fade (400ms)
    - Lazy loading: Spinner centrado con animación de rotación
    - Toast de nueva encuesta: Slide-in desde arriba (300ms)
- **UX-09:** Indicadores de estado visuales:
    - **Borde izquierdo de color** según estado (4px)
    - **Badge de estado** en esquina superior izquierda con ícono
    - **Badge "Mis Encuestas"** en esquina superior derecha (solo autor)
    - **Indicador de vencimiento próximo** en fecha (menos de 3 días):
        - Color naranja `text-warning-dark`
        - Ícono pulsante ⏰
        - Tooltip: "Vence en X días"

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar pestaña "Activas" con 12 encuestas más recientes y spinner
- **EF-02:** Estado cargado: Mostrar grid completo con tarjetas según pestaña activa
- **EF-03:** Estado vacío: Ilustración + mensaje + botón de acción
- **EF-04:** Estado de búsqueda: Filtrar encuestas en tiempo real mientras se escribe
- **EF-05:** Estado de filtros aplicados: Recarga de lista según filtros seleccionados
- **EF-06:** Estado de lazy loading: Spinner al final de lista mientras carga más
- **EF-07:** Estado de actualización: Toast de nueva encuesta + badge actualizado
- **EF-08:** Estado de hover: Sombra y menú de opciones visible (solo autor)
- **EF-09:** Estado de click: Transición suave a vista correspondiente según estado
- **EF-10:** Estado de cambio de pestaña: Fade de contenido antiguo + carga de nuevo contenido

---

### **Validaciones de Entrada**

- **VE-01:** Búsqueda debe tener mínimo 2 caracteres para activarse
- **VE-02:** Rango de fechas debe ser válido (fecha inicio <= fecha fin)
- **VE-03:** Filtros son opcionales, por defecto muestra todas las encuestas relevantes
- **VE-04:** Al cambiar filtros, resetear paginación a página 1

---

### **Mensajes de Error**

- "No se pudieron cargar las encuestas. Verifica tu conexión."
- "No se encontraron encuestas con los filtros aplicados."
- "No tienes permisos para ver esta encuesta."
- "Error al cerrar la encuesta. Intenta nuevamente."
- "Error al eliminar la encuesta. Intenta nuevamente."
- "No puedes eliminar una encuesta que ya tiene respuestas."

---

### **Mensajes de Éxito**

- "✅ Encuesta cerrada correctamente"
- "✅ Encuesta eliminada correctamente"
- "📋 [X] nueva(s) encuesta(s) disponible(s)"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-USERS-04 (Relaciones padre-hijo configuradas)
    - HU-USERS-65 (Permisos de docentes asignados)
- **HU Siguientes:**
    - HU-ENC-01 (Responder encuesta)
    - HU-ENC-02 (Ver respuestas propias)
    - HU-ENC-03 (Crear nueva encuesta)
    - HU-ENC-04 (Ver resultados y estadísticas)
    - HU-ENC-05 (Notificaciones de encuestas)

---

### **Componentes y Estructura**

- **Tipo:** Página principal completa (`/dashboard/encuestas`)
- **Componentes principales:**
    - `EncuestasBandeja`: Componente contenedor principal
    - `EncuestasHeader`: Header con buscador y botón nueva
    - `NuevaEncuestaButton`: Botón de creación (condicional por rol)
    - `BadgeContador`: Badge de contador de pendientes
    - `TabsEstado`: Pestañas de estado (Activas/Respondidas/Vencidas)
    - `FiltrosSidebar`: Sidebar con filtros (desktop) o modal (móvil)
    - `BuscadorEncuestas`: Campo de búsqueda con debounce
    - `OrdenamientoSelect`: Selector de ordenamiento
    - `DateRangePicker`: Selector de rango de fechas
    - `AutorSelect`: Selector de autor (director)
    - `NivelGradoSelect`: Selectores de nivel/grado (director)
    - `LimpiarFiltrosButton`: Botón de reseteo de filtros
    - `EncuestasGrid`: Grid de tarjetas con lazy loading
    - `EncuestaCard`: Tarjeta individual de encuesta
    - `EstadoBadge`: Badge de estado con color
    - `MisEncuestasBadge`: Badge "Mis Encuestas"
    - `ProximoVencerIndicador`: Indicador de vencimiento próximo
    - `MenuOpciones`: Dropdown con opciones (editar/cerrar/eliminar)
    - `EmptyState`: Estado vacío con ilustración
    - `LazyLoadSpinner`: Spinner de carga
    - `ToastNotification`: Toast de nueva encuesta
- **Endpoints API:**
    - `GET /encuestas?page={page}&limit={limit}&rol={rol}&usuario_id={id}&pestaña={pestaña}` - Lista de encuestas paginada y filtrada
    - `GET /encuestas/search?query={query}&usuario_id={id}` - Búsqueda de encuestas
    - `GET /encuestas/filtros?ordenamiento={orden}&fecha_inicio={fecha}&fecha_fin={fecha}&autor_id={id}&nivel={nivel}&grado={grado}` - Encuestas filtradas
    - `GET /encuestas/pendientes/count?usuario_id={id}` - Contador de pendientes
    - `GET /encuestas/:id/estado?usuario_id={id}` - Determinar estado de encuesta para usuario específico
    - `PATCH /encuestas/:id/cerrar` - Cerrar encuesta antes del vencimiento (autor)
    - `DELETE /encuestas/:id` - Eliminar encuesta (autor, solo si no tiene respuestas)
    - `GET /encuestas/actualizaciones?usuario_id={id}&ultimo_check={timestamp}` - Polling de nuevas encuestas
    - `GET /estudiantes/padre/:padre_id` - Hijos del padre (para filtrado)
    - `GET /asignaciones-docente-curso?docente_id={id}` - Cursos del docente (para filtrado)
    - `GET /permisos-docentes/:docente_id` - Permisos de creación
    - `GET /respuestas-encuestas/usuario/:usuario_id` - Verificar encuestas respondidas por usuario

---

### **Reglas de Negocio Específicas del Módulo (RN-ENC)**

- **RN-ENC-16:** Padre solo ve encuestas dirigidas a grados/niveles/cursos de sus hijos vinculados en `relaciones_familiares`
- **RN-ENC-17:** Docente sin permisos solo ve encuestas institucionales dirigidas a "todos" o "docentes"
- **RN-ENC-18:** Docente con permisos ve encuestas institucionales + las que él creó
- **RN-ENC-19:** Director ve todas las encuestas de la institución sin restricciones
- **RN-ENC-20:** Una encuesta pasa automáticamente a estado "Vencida" cuando `fecha_vencimiento < NOW()` y el usuario no la respondió
- **RN-ENC-21:** Una encuesta marcada como "Respondida" para un usuario permanece en ese estado indefinidamente
- **RN-ENC-22:** Las encuestas creadas por el usuario siempre se muestran con badge "Mis Encuestas"
- **RN-ENC-23:** El contador de pendientes solo incluye encuestas en estado "Activa" (no respondidas y no vencidas)
- **RN-ENC-24:** Encuestas próximas a vencer (menos de 3 días) se destacan visualmente con badge naranja pulsante
- **RN-ENC-25:** Solo el autor puede cerrar una encuesta antes de su fecha de vencimiento
- **RN-ENC-26:** Solo el autor puede eliminar una encuesta, y únicamente si no tiene respuestas registradas
- **RN-ENC-27:** Al cerrar una encuesta manualmente, su estado cambia a "cerrada" y no acepta más respuestas
- **RN-ENC-28:** Encuestas con `estado = 'borrador'` no aparecen en la bandeja principal
- **RN-ENC-29:** El sistema actualiza automáticamente los estados de vencimiento mediante job programado (cada hora)
- **RN-ENC-30:** La búsqueda aplica sobre campos `titulo` y `descripcion` de la encuesta
- **RN-ENC-31:** Los filtros de fecha se aplican sobre `fecha_vencimiento` de la encuesta
- **RN-ENC-32:** El ordenamiento por defecto es por `fecha_creacion DESC` (más reciente primero)
- **RN-ENC-33:** Al cambiar de pestaña, se resetean los filtros de búsqueda pero se mantienen los filtros de fecha y ordenamiento
- **RN-ENC-34:** Una encuesta respondida puede seguir visible en pestaña "Respondidas" incluso después de vencida
- **RN-ENC-35:** El badge de contador de respuestas solo es visible para el autor de la encuesta

---

# **Historia de Usuario Detallada - HU-ENC-01**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Usuario que responde la encuesta
2. **encuestas** - Encuesta con preguntas en formato JSON
3. **respuestas_encuestas** - Registro de respuestas del usuario
4. **estudiantes** - Estudiante relacionado (para contexto del padre)
5. **relaciones_familiares** - Vinculación padre-hijo (validación de acceso)
6. **asignaciones_docente_curso** - Cursos del docente (validación de acceso)

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **HU-ENC-00** - Bandeja de encuestas (punto de acceso principal)

### **Roles Involucrados:**

- **Padre:** Responde encuestas de grados/niveles de sus hijos
- **Docente:** Responde encuestas institucionales dirigidas a docentes
- **Director:** Responde encuestas dirigidas a la dirección

---

## **HU-ENC-01 — Responder Encuesta**

**Título:** Formulario dinámico de respuesta de encuestas con validación y confirmación

**Historia:**

> Como usuario, quiero responder encuestas con diferentes tipos de preguntas de forma intuitiva y clara para proporcionar feedback estructurado a la institución educativa.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al formulario desde dos puntos:
    - Click en tarjeta de encuesta activa en HU-ENC-00
    - Click en botón "Responder →" de la tarjeta
    - URL directa: `/dashboard/encuestas/:id/responder`
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar formulario (Backend):
    
    **Validación de Acceso:**
    
    - Verificar que usuario está autenticado
    - Verificar que encuesta existe y `estado = 'activa'`
    - Verificar que `fecha_vencimiento >= NOW()`
    - Verificar que usuario tiene acceso según segmentación:
        - **Padre:** Validar que encuesta está dirigida a grados/niveles/cursos de sus hijos
        - **Docente:** Validar que encuesta está dirigida a "todos" o "docentes"
        - **Director:** Sin restricciones
    
    **Validación de Estado de Respuesta:**
    
    - Verificar que NO existe registro en `respuestas_encuestas` con `usuario_id = current_user` y `encuesta_id = :id`
    - Si ya respondió: Redirigir a HU-ENC-02 (ver respuestas propias) con mensaje: "Ya respondiste esta encuesta"
    - Si está vencida: Redirigir a HU-ENC-00 con mensaje: "Esta encuesta ha vencido"
    
    **Si todas las validaciones pasan:**
    
    - Cargar encuesta completa con preguntas en JSON
    - Renderizar formulario dinámico
- **CA-03:** Layout de la página de respuesta:
    
    **HEADER FIJO DE ENCUESTA**
    
    - **Botón "← Volver":**
        - Vuelve a la bandeja (HU-ENC-00)
        - Modal de confirmación si hay cambios sin guardar: "¿Seguro que deseas salir? Perderás tus respuestas."
        - Posición: Esquina superior izquierda
        - Color secundario (outline `border-border-primary`)
    - **Progress Bar Visual:**
        - Barra de progreso horizontal
        - Muestra: "Pregunta X de Y"
        - Porcentaje visual: Relleno con color primario (`bg-primary-600`)
        - Actualización en tiempo real al responder
        - Texto pequeño debajo: "Obligatorias respondidas: X de Y"
    - **Altura fija:** 80px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    
    **CONTENIDO PRINCIPAL (Scrollable)**
    
    - **Sección de Encabezado de la Encuesta:**
        
        **Título de la Encuesta:**
        
        - Texto muy grande, bold (28px desktop, 22px móvil)
        - Color: Negro (`text-text-primary`)
        - Centrado horizontalmente
        - Margin: 24px arriba y abajo
        
        **Descripción de la Encuesta:**
        
        - Texto medio (16px)
        - Color: Gris oscuro (`text-text-secondary`)
        - Centrado horizontalmente
        - Max-width: 700px
        - Margin: 16px abajo
        
        **Badge de Información:**
        
        - Card con fondo azul claro (`bg-info-light`)
        - Border: `border-info`
        - Padding: 16px
        - Border-radius: 8px
        - Contenido:
            - Ícono: ℹ️
            - Texto: "Esta encuesta tiene [X] preguntas ([Y] obligatorias)"
            - Subtexto: "Las preguntas obligatorias están marcadas con asterisco (*)"
        - Margin: 24px abajo
    - **Sección de Preguntas (Formulario Dinámico):**
        
        **Container de Preguntas:**
        
        - Layout vertical con separación entre preguntas (32px)
        - Máximo ancho: 800px centrado
        - Padding lateral: 24px
        
        **Cada Pregunta renderiza según tipo:**
        
        **Estructura Común para Todas las Preguntas:**
        
        - Card con fondo blanco `bg-bg-card`
        - Border: `border-border-primary`
        - Border-radius: 12px
        - Padding: 24px
        - Sombra sutil: `shadow-sm`
        - **Header de Pregunta:**
            - Número de pregunta: Badge circular con color primario (`bg-primary-100 text-primary-700`)
            - Texto de la pregunta: Bold (18px), color `text-text-primary`
            - Asterisco rojo (*) si es obligatoria: `text-error`
        
        **TIPO 1: Texto Corto**
        
        - **Input:** Campo de texto de una línea
        - **Componente:** `<input type="text">`
        - **Placeholder:** "Escribe tu respuesta aquí..."
        - **Estilo:**
            - Border: `border-border-primary`
            - Border-radius: 8px
            - Padding: 12px 16px
            - Width: 100%
            - Font-size: 16px
        - **Estados:**
            - Normal: Border gris `border-border-primary`
            - Focus: Border primario `border-primary-600`, sombra azul `ring-2 ring-primary-200`
            - Error (obligatoria sin responder): Border rojo `border-error`, mensaje de error debajo
        - **Validación:**
            - Mínimo: 2 caracteres (si es obligatoria)
            - Máximo: 500 caracteres
            - Contador de caracteres: "X/500" en gris claro
        
        **TIPO 2: Texto Largo**
        
        - **Input:** Campo de texto multilínea
        - **Componente:** `<textarea>`
        - **Placeholder:** "Escribe tu respuesta aquí... Puedes usar varias líneas"
        - **Estilo:**
            - Border: `border-border-primary`
            - Border-radius: 8px
            - Padding: 12px 16px
            - Width: 100%
            - Height: 150px (auto-expandible hasta 400px)
            - Font-size: 16px
            - Resize: Vertical
        - **Estados:** Mismos que texto corto
        - **Validación:**
            - Mínimo: 10 caracteres (si es obligatoria)
            - Máximo: 2000 caracteres
            - Contador de caracteres: "X/2000" en gris claro
        
        **TIPO 3: Opción Única (Radio Buttons)**
        
        - **Input:** Grupo de radio buttons
        - **Componente:** `<RadioGroup>`
        - **Layout:**
            - Lista vertical de opciones
            - Gap de 12px entre opciones
        - **Cada opción muestra:**
            - Radio button circular:
                - No seleccionado: Border gris `border-border-primary`
                - Seleccionado: Relleno primario `bg-primary-600`, check blanco
                - Hover: Border más oscuro `border-primary-400`
            - Label con texto de la opción:
                - Font-size: 16px
                - Color: `text-text-primary`
                - Cursor: pointer en toda el área
        - **Estilo de container:**
            - Padding: 16px
            - Border: `border-border-secondary`
            - Border-radius: 8px
            - Background: `bg-bg-sidebar` al seleccionar
        - **Validación:**
            - Una opción debe estar seleccionada (si es obligatoria)
        
        **TIPO 4: Opción Múltiple (Checkboxes)**
        
        - **Input:** Grupo de checkboxes
        - **Componente:** `<CheckboxGroup>`
        - **Layout:**
            - Lista vertical de opciones
            - Gap de 12px entre opciones
        - **Cada opción muestra:**
            - Checkbox cuadrado:
                - No seleccionado: Border gris `border-border-primary`
                - Seleccionado: Relleno primario `bg-primary-600`, check blanco
                - Hover: Border más oscuro `border-primary-400`
            - Label con texto de la opción:
                - Font-size: 16px
                - Color: `text-text-primary`
                - Cursor: pointer en toda el área
        - **Estilo de container:**
            - Padding: 16px
            - Border: `border-border-secondary`
            - Border-radius: 8px
            - Background: `bg-bg-sidebar` al seleccionar al menos una
        - **Mensaje informativo:**
            - Texto pequeño debajo: "Puedes seleccionar varias opciones"
            - Color: `text-text-muted`
        - **Validación:**
            - Al menos una opción debe estar seleccionada (si es obligatoria)
        
        **TIPO 5: Escala de Satisfacción (1-5)**
        
        - **Input:** Escala visual con 5 niveles
        - **Componente:** `<RatingScale>`
        - **Layout:**
            - 5 botones circulares grandes alineados horizontalmente
            - Gap de 16px entre botones (desktop), 8px (móvil)
        - **Cada nivel muestra:**
            - Número grande (1, 2, 3, 4, 5) dentro del círculo
            - Label personalizable debajo del número:
                - Default: "Muy insatisfecho", "Insatisfecho", "Neutral", "Satisfecho", "Muy satisfecho"
                - Customizable según JSON de la pregunta
            - Font-size del número: 24px bold
            - Font-size del label: 12px
        - **Estados de los botones:**
            - No seleccionado:
                - Border: `border-border-primary`
                - Background: blanco `bg-bg-card`
                - Número: gris `text-text-muted`
            - Seleccionado:
                - Background con gradiente según nivel:
                    - 1-2: Rojo gradiente `bg-gradient-to-br from-error to-error-dark`
                    - 3: Amarillo `bg-gradient-to-br from-warning to-warning-dark`
                    - 4-5: Verde `bg-gradient-to-br from-success to-success-dark`
                - Número: blanco `text-white`
                - Label: Color más oscuro del gradiente
                - Sombra: `shadow-lg`
            - Hover:
                - Escala 1.1
                - Sombra más pronunciada `shadow-md`
        - **Responsive:**
            - Desktop: Círculos de 80px de diámetro
            - Móvil: Círculos de 60px de diámetro, labels ocultos (tooltip al tap)
        - **Validación:**
            - Un nivel debe estar seleccionado (si es obligatoria)
        
        **Mensaje de Error (Validación):**
        
        - Solo visible si pregunta obligatoria no tiene respuesta al intentar enviar
        - Texto: "Esta pregunta es obligatoria"
        - Color: `text-error`
        - Font-size: 14px
        - Ícono: ⚠️
        - Animación: Shake al mostrar (200ms)
    - **Sección de Footer del Formulario:**
        
        **Resumen de Progreso:**
        
        - Card con fondo azul muy claro (`bg-info-light`)
        - Padding: 20px
        - Border-radius: 12px
        - Margin-top: 48px
        - Contenido:
            - Texto: "Has respondido [X] de [Y] preguntas obligatorias"
            - Progress bar pequeño: Relleno verde `bg-success`
            - Mensaje motivacional:
                - Si completo: "¡Excelente! Ya puedes enviar tus respuestas" con check ✓
                - Si incompleto: "Completa las preguntas obligatorias para enviar"
        
        **Botones de Acción:**
        
        - Layout horizontal centrado con gap de 16px
        - **Botón "Enviar Respuestas":**
            - Color primario (`bg-primary-600 text-white`)
            - Ícono: 📤
            - Tamaño grande: Padding 16px 32px
            - Estados:
                - **Habilitado:** Solo si todas las preguntas obligatorias están respondidas
                - **Deshabilitado:** Gris claro `bg-bg-disabled text-text-disabled`, cursor not-allowed
                - **Hover (habilitado):** Color más oscuro `bg-primary-700`, escala 1.02
                - **Cargando:** Spinner blanco + texto "Enviando..."
            - Al hacer clic:
                - Mostrar modal de confirmación:
                    - "¿Confirmas el envío de tus respuestas?"
                    - "No podrás modificarlas después de enviar"
                    - Botones: "Sí, enviar" (primario) | "Revisar" (secundario)
                - Deshabilitar todos los inputs durante envío
        - **Botón "Cancelar":**
            - Secundario (outline `border-border-primary`)
            - Modal de confirmación si hay respuestas ingresadas
- **CA-04:** Proceso de envío y validaciones:
    
    **Validación Frontend (Pre-envío):**
    
    - Verificar que todas las preguntas obligatorias tienen respuesta
    - Verificar que respuestas de texto cumplen longitudes mínimas/máximas
    - Verificar que opciones única/múltiple tienen al menos una selección
    - Verificar que escala tiene un nivel seleccionado
    - Mostrar errores específicos por pregunta si fallan validaciones
    - Scroll automático a la primera pregunta con error
    
    **Validación Backend:**
    
    - Verificar que usuario tiene acceso a la encuesta
    - Verificar que encuesta sigue activa (`estado = 'activa'` y `fecha_vencimiento >= NOW()`)
    - Verificar que usuario NO ha respondido previamente
    - Validar estructura JSON de respuestas:
        - Cada respuesta debe tener: `pregunta_id`, `tipo`, `valor`
        - Tipos de valor según tipo de pregunta:
            - Texto corto/largo: string
            - Opción única: string (opción seleccionada)
            - Opción múltiple: array de strings
            - Escala: integer (1-5)
    - Validar que respuestas corresponden a preguntas existentes en la encuesta
    - Sanitizar contenido de texto (eliminar HTML malicioso)
    
    **Inserción en Base de Datos:**
    
    ```sql
    INSERT INTO respuestas_encuestas (
      encuesta_id, usuario_id, estudiante_id,
      respuestas, fecha_respuesta, tiempo_respuesta_minutos, ip_respuesta
    ) VALUES (
      ?, ?, ?,
      ?::jsonb, NOW(), ?, ?
    );
    
    ```
    
    - **Campo JSON de respuestas:**
        
        ```json
        {
          "respuestas": [
            {
              "pregunta_id": 1,
              "tipo": "texto_corto",
              "texto_pregunta": "¿Qué opinas del servicio?",
              "valor": "Excelente atención"
            },
            {
              "pregunta_id": 2,
              "tipo": "opcion_unica",
              "texto_pregunta": "¿Recomendarías la institución?",
              "valor": "Sí"
            },
            {
              "pregunta_id": 3,
              "tipo": "escala_1_5",
              "texto_pregunta": "Nivel de satisfacción",
              "valor": 5,
              "etiqueta": "Muy satisfecho"
            }
          ],
          "metadata": {
            "total_preguntas": 10,
            "preguntas_respondidas": 10,
            "tiempo_total_minutos": 8
          }
        }
        
        ```
        
    - **Campos adicionales:**
        - `estudiante_id`: Solo si es padre, ID del hijo relacionado (nullable)
        - `tiempo_respuesta_minutos`: Calculado desde carga del formulario hasta envío
        - `ip_respuesta`: IP desde donde se respondió (para auditoría)
- **CA-05:** Feedback después del envío:
    - **Modal de Confirmación de Éxito:**
        - Ícono: ✅ (verde, animación de bounce)
        - Título: "¡Respuestas enviadas exitosamente!"
        - Contenido:
            - "Gracias por tu participación"
            - "Tu feedback es muy valioso para nosotros"
            - Badge con tiempo total: "⏱️ Completaste la encuesta en [X] minutos"
        - Botones:
            - "Ver mis Respuestas" (primario) → Redirige a HU-ENC-02
            - "Volver a Encuestas" (secundario) → Redirige a HU-ENC-00
    - **Toast Notification:**
        - Mensaje: "✅ Encuesta respondida correctamente"
        - Duración: 3 segundos
        - Posición: Superior derecha
        - Color: Verde `bg-success`
    - **Actualizar estado en bandeja:**
        - Encuesta pasa automáticamente a pestaña "Respondidas" en HU-ENC-00
        - Badge de contador de pendientes disminuye en 1
    - **Bloqueo automático:**
        - Cualquier intento de acceder nuevamente a `/encuestas/:id/responder` redirige a HU-ENC-02
        - No se permite edición de respuestas (RN-ENC-02)
- **CA-06:** Responsive Design:
    - **Desktop (>1024px):**
        - Formulario centrado con max-width 800px
        - Progress bar en header fijo
        - Preguntas con padding lateral generoso
        - Escala 1-5 con círculos grandes y labels visibles
    - **Tablet (768px-1024px):**
        - Formulario centrado con max-width 700px
        - Progress bar más compacto
        - Escala 1-5 con círculos medianos
    - **Mobile (<768px):**
        - Formulario full-width con padding 16px
        - Progress bar simplificado (solo número de pregunta)
        - Escala 1-5 con círculos pequeños, labels en tooltip
        - Radio buttons y checkboxes más grandes (touch-friendly)
        - Botón "Enviar" fijo en bottom con shadow

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden responder encuestas
- **VN-02:** Usuario debe tener acceso a la encuesta según segmentación (padre/docente/director)
- **VN-03:** Encuesta debe estar en estado `'activa'`
- **VN-04:** `fecha_vencimiento` debe ser >= NOW()
- **VN-05:** Usuario NO debe haber respondido previamente (verificar en `respuestas_encuestas`)
- **VN-06:** Todas las preguntas obligatorias deben tener respuesta válida
- **VN-07:** Respuestas de texto corto: mínimo 2 caracteres (si obligatoria), máximo 500
- **VN-08:** Respuestas de texto largo: mínimo 10 caracteres (si obligatoria), máximo 2000
- **VN-09:** Opción única: exactamente 1 opción seleccionada (si obligatoria)
- **VN-10:** Opción múltiple: al menos 1 opción seleccionada (si obligatoria)
- **VN-11:** Escala: valor entre 1 y 5 (si obligatoria)
- **VN-12:** Respuestas deben ser sanitizadas para evitar XSS
- **VN-13:** Una vez enviada, la respuesta no se puede modificar ni eliminar
- **VN-14:** El tiempo de respuesta se calcula desde carga hasta envío

---

### **UI/UX**

- **UX-01:** Header fijo con progress bar visual:
    
    ```
    ┌────────────────────────────────────────────────────────┐
    │  [←] Responder Encuesta                   ⏰ Vence en: 2h │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○○○  Pregunta 7 de 10│
    │  Obligatorias respondidas: 5 de 7                       │
    └────────────────────────────────────────────────────────┘
    
    ```
    
    - Barra de progreso con animación smooth al avanzar
    - Colores según estado:
        - < 50%: `bg-warning`
        - 50-80%: `bg-info`
        - 80%: `bg-success`
- **UX-02:** Diseño de cards de preguntas:
    - Fondo blanco `bg-bg-card` con sombra sutil `shadow-sm`
    - Border radius generoso: 12px
    - Separación clara entre preguntas: 32px
    - Número de pregunta en badge circular destacado
    - Asterisco rojo (*) prominente para obligatorias
- **UX-03:** Inputs con diseño consistente:
    - Border radius: 8px en todos los inputs
    - Padding generoso: 12px 16px
    - Focus state con ring azul: `ring-2 ring-primary-200`
    - Transiciones suaves: `transition: all 0.2s ease`
    - Estados de error con shake animation
- **UX-04:** Radio buttons y checkboxes personalizados:
    - Tamaño grande: 24px (desktop), 32px (móvil para touch)
    - Animación smooth al seleccionar (scale 1.1 + fade)
    - Hover effect: Background gris claro `bg-bg-sidebar`
    - Click area amplia (todo el label es clickeable)
- **UX-05:** Escala 1-5 con diseño visual atractivo:
    - Círculos grandes con números bold
    - Gradientes de color según nivel:
        - 1-2: Rojo (negativo)
        - 3: Amarillo (neutral)
        - 4-5: Verde (positivo)
    - Animación al seleccionar: Scale 1.15 + shadow
    - Labels descriptivos que guían al usuario
- **UX-06:** Modal de confirmación de envío:
    - Overlay oscuro `bg-bg-overlay` (z-index alto)
    - Modal centrado con animación fade-in + scale
    - Ícono de alerta: ⚠️ (naranja `text-warning`)
    - Texto claro: "No podrás modificar tus respuestas"
    - Botones con jerarquía visual clara
- **UX-07:** Modal de éxito con celebración:
    - Ícono grande ✅ (64px) con animación de bounce
    - Confetti animation opcional
    - Badge con tiempo total de respuesta
    - Mensaje motivacional personalizado
- **UX-08:** Estados de carga y feedback:
    - Spinner en botón "Enviar" durante procesamiento
    - Deshabilitación de todos los inputs durante envío
    - Progress bar animado en header
    - Toast notification verde al completar
- **UX-09:** Validación en tiempo real:
    - Contadores de caracteres en inputs de texto
    - Actualización de progress bar al responder
    - Mensaje de error debajo de preguntas obligatorias vacías
    - Scroll suave a primera pregunta con error

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar encuesta y preguntas con spinner
- **EF-02:** Estado cargado: Mostrar formulario completo con primera pregunta visible
- **EF-03:** Estado de validación previa: Verificar si usuario ya respondió
- **EF-04:** Estado de respuesta en progreso: Progress bar actualizado, inputs activos
- **EF-05:** Estado de validación pre-envío: Marcar preguntas obligatorias sin respuesta
- **EF-06:** Estado de envío: Spinner en botón, inputs deshabilitados, modal de confirmación
- **EF-07:** Estado de éxito: Modal de éxito con animación, opciones de navegación
- **EF-08:** Estado de error: Alert con mensaje específico, opción de reintentar
- **EF-09:** Estado de bloqueo: Redirigir si ya respondió o encuesta vencida

---

### **Validaciones de Entrada**

- **VE-01:** Texto corto: mínimo 2 caracteres (si obligatoria), máximo 500
- **VE-02:** Texto largo: mínimo 10 caracteres (si obligatoria), máximo 2000
- **VE-03:** Opción única: exactamente 1 opción seleccionada (si obligatoria)
- **VE-04:** Opción múltiple: mínimo 1 opción seleccionada (si obligatoria)
- **VE-05:** Escala: valor entre 1 y 5 (si obligatoria)
- **VE-06:** Respuestas deben ser sanitizadas para evitar XSS
- **VE-07:** Todas las preguntas obligatorias deben tener respuesta antes de enviar

---

### **Mensajes de Error**

- "No tienes permisos para responder esta encuesta"
- "Esta encuesta ha vencido y ya no acepta respuestas"
- "Ya has respondido esta encuesta. No puedes modificar tus respuestas"
- "Esta pregunta es obligatoria"
- "La respuesta debe tener al menos [X] caracteres"
- "La respuesta no puede exceder [X] caracteres"
- "Debes seleccionar al menos una opción"
- "Debes seleccionar un nivel de satisfacción"
- "Error al enviar respuestas. Verifica tu conexión e intenta nuevamente"
- "La encuesta ha cambiado de estado. Recarga la página"

---

### **Mensajes de Éxito**

- "✅ ¡Respuestas enviadas exitosamente!"
- "✅ Gracias por tu participación"
- "⏱️ Completaste la encuesta en [X] minutos"
- "Tu feedback es muy valioso para nosotros"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-ENC-00 (Bandeja de encuestas)
    - HU-ENC-03 (Creación de encuesta - define estructura de preguntas)
- **HU Siguientes:**
    - HU-ENC-02 (Ver respuestas propias)
    - HU-ENC-04 (Ver resultados y estadísticas - solo autor)

---

### **Componentes y Estructura**

- **Tipo:** Página completa de formulario (`/dashboard/encuestas/:id/responder`)
- **Componentes principales:**
    - `ResponderEncuestaPage`: Componente contenedor principal
    - `EncuestaHeader`: Header fijo con progress bar
    - `ProgressBar`: Barra de progreso visual
    - `TiempoRestante`: Contador de tiempo hasta vencimiento
    - `EncuestaInfo`: Card con título, descripción y badge informativo
    - `FormularioDinamico`: Container del formulario de preguntas
    - `PreguntaRenderer`: Componente genérico que renderiza según tipo
    - `PreguntaCard`: Card wrapper para cada pregunta
    - `TextoCortoInput`: Input de texto corto
    - `TextoLargoTextarea`: Textarea para texto largo
    - `OpcionUnicaRadioGroup`: Grupo de radio buttons
    - `OpcionMultipleCheckboxGroup`: Grupo de checkboxes
    - `EscalaSatisfaccionRating`: Escala visual 1-5
    - `ValidacionError`: Mensaje de error por pregunta
    - `ResumenProgreso`: Card de resumen al final
    - `EnviarButton`: Botón de envío con estados
    - `GuardarBorradorButton`: Botón de guardado (futuro)
    - `CancelarButton`: Botón de cancelar
    - `ConfirmacionModal`: Modal de confirmación de envío
    - `ExitoModal`: Modal de éxito con animación
    - `ErrorAlert`: Componente de alertas de error
- **Endpoints API:**
    - `GET /encuestas/:id/formulario` - Obtener encuesta completa con preguntas para responder
    - `POST /encuestas/:id/validar-acceso` - Validar que usuario tiene acceso a la encuesta
    - `GET /encuestas/:id/estado-respuesta?usuario_id={id}` - Verificar si usuario ya respondió
    - `POST /respuestas-encuestas` - Enviar respuestas completas de la encuesta
    - `POST /respuestas-encuestas/validar` - Validar estructura de respuestas antes de insertar
    - `GET /estudiantes/padre/:padre_id` - Obtener hijo relacionado (para contexto del padre)
    - `POST /notificaciones` - Crear notificación de respuesta recibida (para autor de encuesta)

---

### **Reglas de Negocio Específicas del Módulo (RN-ENC)**

- **RN-ENC-36:** Usuario debe estar autenticado para acceder al formulario de respuesta
- **RN-ENC-37:** Encuesta debe tener estado `'activa'` para permitir respuestas
- **RN-ENC-38:** `fecha_vencimiento` debe ser mayor o igual a NOW() al momento de cargar el formulario
- **RN-ENC-39:** Usuario debe tener acceso según segmentación (padre/docente/director)
- **RN-ENC-40:** Padre solo puede responder encuestas dirigidas a grados/niveles/cursos de sus hijos
- **RN-ENC-41:** Docente solo puede responder encuestas dirigidas a "todos" o "docentes"
- **RN-ENC-42:** Director puede responder cualquier encuesta dirigida a "todos" o "directores"
- **RN-ENC-43:** No se permite responder una encuesta si ya existe registro en `respuestas_encuestas` con mismo `usuario_id` y `encuesta_id`
- **RN-ENC-44:** Todas las preguntas marcadas como `obligatoria: true` deben tener respuesta válida
- **RN-ENC-45:** Respuestas de tipo "texto_corto" deben tener mínimo 2 caracteres (si obligatoria) y máximo 500
- **RN-ENC-46:** Respuestas de tipo "texto_largo" deben tener mínimo 10 caracteres (si obligatoria) y máximo 2000
- **RN-ENC-47:** Respuestas de tipo "opcion_unica" deben contener exactamente 1 opción de las definidas en la pregunta
- **RN-ENC-48:** Respuestas de tipo "opcion_multiple" deben contener al menos 1 opción (si obligatoria) de las definidas en la pregunta
- **RN-ENC-49:** Respuestas de tipo "escala_1_5" deben contener un valor entero entre 1 y 5
- **RN-ENC-50:** Las respuestas deben sanitizarse para eliminar HTML malicioso antes de almacenar
- **RN-ENC-51:** El campo `tiempo_respuesta_minutos` se calcula desde la carga del formulario hasta el envío exitoso
- **RN-ENC-52:** Una vez enviada, la respuesta no puede ser modificada ni eliminada (inmutable)
- **RN-ENC-53:** Al enviar respuestas, se registra la IP del usuario para auditoría en campo `ip_respuesta`
- **RN-ENC-54:** Para padres, se registra el `estudiante_id` del hijo relacionado en campo opcional
- **RN-ENC-55:** Las respuestas se almacenan en formato JSON con estructura: `{respuestas: [...], metadata: {...}}`
- **RN-ENC-56:** El JSON de respuestas debe incluir: `pregunta_id`, `tipo`, `texto_pregunta`, `valor` para cada respuesta
- **RN-ENC-57:** El metadata debe incluir: `total_preguntas`, `preguntas_respondidas`, `tiempo_total_minutos`
- **RN-ENC-58:** Si la encuesta cambia a estado "cerrada" o vence mientras el usuario está respondiendo, se rechaza el envío
- **RN-ENC-59:** Después de enviar respuestas exitosamente, cualquier intento de acceder al formulario redirige a HU-ENC-02
- **RN-ENC-60:** El autor de la encuesta recibe notificación en plataforma cuando se registra una nueva respuesta
- **RN-ENC-61:** El contador de respuestas de la encuesta se incrementa automáticamente con trigger en `respuestas_encuestas`
- **RN-ENC-62:** Las validaciones de longitud de texto se aplican tanto en frontend (tiempo real) como en backend (antes de insertar)
- **RN-ENC-63:** Si una pregunta no es obligatoria y el usuario no responde, se guarda como `null` en el JSON
- **RN-ENC-64:** El progress bar se actualiza en tiempo real cada vez que el usuario responde una pregunta obligatoria
- **RN-ENC-65:** El tiempo restante se calcula en frontend con countdown automático si vence en menos de 24 horas
---


---

# **Historia de Usuario Detallada - HU-ENC-02**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Usuario que consulta sus respuestas
2. **encuestas** - Encuesta respondida por el usuario
3. **respuestas_encuestas** - Registro de respuestas del usuario
4. **estudiantes** - Estudiante relacionado (para contexto del padre)
5. **relaciones_familiares** - Vinculación padre-hijo (validación de acceso)

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **HU-ENC-00** - Bandeja de encuestas (punto de acceso)
- **HU-ENC-01** - Formulario de respuesta (debe existir respuesta previa)

### **Roles Involucrados:**

- **Padre:** Consulta respuestas de encuestas de grados/niveles de sus hijos
- **Docente:** Consulta respuestas de encuestas institucionales dirigidas a docentes
- **Director:** Consulta respuestas de encuestas dirigidas a la dirección

---

## **HU-ENC-02 — Ver Mis Respuestas**

**Título:** Vista de detalle histórico de respuestas personales con información contextual y metadatos

**Historia:**

> Como usuario, quiero consultar mis respuestas a encuestas ya completadas para recordar el feedback que proporcioné y tener un registro histórico de mi participación en las encuestas institucionales.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso a la vista desde múltiples puntos:
    - Click en tarjeta de encuesta respondida en HU-ENC-00
    - Click en botón "Ver mi respuesta →" de la tarjeta
    - URL directa: `/dashboard/encuestas/:id/mis-respuestas`
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar vista (Backend):
    
    **Validación de Acceso:**
    
    - Verificar que usuario está autenticado
    - Verificar que encuesta existe
    - Verificar que usuario tiene acceso según segmentación:
        - **Padre:** Validar que encuesta está dirigida a grados/niveles/cursos de sus hijos
        - **Docente:** Validar que encuesta está dirigida a "todos" o "docentes"
        - **Director:** Sin restricciones
    
    **Validación de Estado de Respuesta:**
    
    - Verificar que SÍ existe registro en `respuestas_encuestas` con `usuario_id = current_user` y `encuesta_id = :id`
    - Si NO respondió: Redirigir a HU-ENC-00 con mensaje: "Aún no has respondido esta encuesta"
    - Si la encuesta está activa y no respondió: Redirigir a HU-ENC-01 para responder
    
    **Si todas las validaciones pasan:**
    
    - Cargar encuesta completa con preguntas en JSON
    - Cargar respuestas del usuario desde `respuestas_encuestas`
    - Renderizar vista de respuestas
- **CA-03:** Layout de la página de respuestas:
    
    **HEADER FIJO DE INFORMACIÓN**
    
    - **Botón "← Volver":**
        - Vuelve a la bandeja (HU-ENC-00)
        - Posición: Esquina superior izquierda
        - Color secundario (outline `border-border-primary`)
    - **Badge de Estado Respondida:**
        - Badge grande con check verde ✓
        - Texto: "RESPONDIDA"
        - Color: `bg-success-light text-success-dark`
        - Posición: Centro del header
    - **Fecha y Hora de Respuesta:**
        - Texto: "Respondido el: DD/MM/YYYY a las HH:MM"
        - Ícono: 📅
        - Color: `text-text-secondary`
        - Posición: Esquina superior derecha
    - **Altura fija:** 80px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    
    **CONTENIDO PRINCIPAL (Scrollable)**
    
    - **Sección de Encabezado de la Encuesta:**
        
        **Título de la Encuesta:**
        
        - Texto grande, bold (24px desktop, 20px móvil)
        - Color: Negro (`text-text-primary`)
        - Centrado horizontalmente
        - Margin: 24px arriba y abajo
        
        **Descripción de la Encuesta:**
        
        - Texto medio (16px)
        - Color: Gris oscuro (`text-text-secondary`)
        - Centrado horizontalmente
        - Max-width: 700px
        - Margin: 16px abajo
        
        **Metadatos de Respuesta:**
        
        - Card con fondo azul muy claro (`bg-info-light`)
        - Border: `border-info`
        - Padding: 16px
        - Border-radius: 8px
        - Contenido:
            - Ícono: ✅
            - Texto: "Tiempo de respuesta: [X] minutos"
            - Subtexto: "Fecha de vencimiento original: DD/MM/YYYY"
        - Margin: 24px abajo
    - **Sección de Respuestas (Vista Detallada):**
        
        **Container de Respuestas:**
        
        - Layout vertical con separación entre preguntas (32px)
        - Máximo ancho: 800px centrado
        - Padding lateral: 24px
        
        **Cada Respuesta se muestra según tipo:**
        
        **Estructura Común para Todas las Respuestas:**
        
        - Card con fondo blanco `bg-bg-card`
        - Border: `border-border-primary`
        - Border-radius: 12px
        - Padding: 24px
        - Sombra sutil: `shadow-sm`
        - **Header de Respuesta:**
            - Número de pregunta: Badge circular con color success (`bg-success-100 text-success-700`)
            - Texto de la pregunta: Bold (18px), color `text-text-primary`
            - Badge de tipo de pregunta: Pequeño, esquina superior derecha
            - Check verde ✓ al lado del número (indicando respuesta completada)
        
        **TIPO 1: Texto Corto**
        
        - **Respuesta mostrada:** Campo de texto deshabilitado
        - **Componente:** `<input type="text" disabled>`
        - **Estilo:**
            - Border: `border-border-secondary`
            - Background: `bg-bg-sidebar`
            - Border-radius: 8px
            - Padding: 12px 16px
            - Width: 100%
            - Font-size: 16px
            - Color: `text-text-primary`
            - Cursor: not-allowed
        - **Metadatos:** "Caracteres: X/500" en gris claro debajo
        
        **TIPO 2: Texto Largo**
        
        - **Respuesta mostrada:** Campo multilínea deshabilitado
        - **Componente:** `<textarea disabled>`
        - **Estilo:**
            - Border: `border-border-secondary`
            - Background: `bg-bg-sidebar`
            - Border-radius: 8px
            - Padding: 12px 16px
            - Width: 100%
            - Height: auto (según contenido)
            - Min-height: 100px
            - Font-size: 16px
            - Color: `text-text-primary`
            - Cursor: not-allowed
            - Resize: none
        - **Metadatos:** "Caracteres: X/2000" en gris claro debajo
        
        **TIPO 3: Opción Única (Radio Buttons)**
        
        - **Respuesta mostrada:** Radio buttons deshabilitados
        - **Componente:** Grupo de radio buttons con selección marcada
        - **Layout:**
            - Lista vertical de opciones
            - Gap de 12px entre opciones
        - **Cada opción muestra:**
            - Radio button circular:
                - No seleccionado: Border gris `border-border-secondary`, deshabilitado
                - Seleccionado: Relleno success `bg-success-600`, check blanco, deshabilitado
            - Label con texto de la opción:
                - Font-size: 16px
                - Color: `text-text-primary` (seleccionada), `text-text-muted` (no seleccionadas)
                - Cursor: not-allowed
        - **Indicador visual:** Opción seleccionada con fondo verde muy claro `bg-success-light`
        
        **TIPO 4: Opción Múltiple (Checkboxes)**
        
        - **Respuesta mostrada:** Checkboxes deshabilitados
        - **Componente:** Grupo de checkboxes con selecciones marcadas
        - **Layout:**
            - Lista vertical de opciones
            - Gap de 12px entre opciones
        - **Cada opción muestra:**
            - Checkbox cuadrado:
                - No seleccionado: Border gris `border-border-secondary`, deshabilitado
                - Seleccionado: Relleno success `bg-success-600`, check blanco, deshabilitado
            - Label con texto de la opción:
                - Font-size: 16px
                - Color: `text-text-primary` (seleccionadas), `text-text-muted` (no seleccionadas)
                - Cursor: not-allowed
        - **Indicador visual:** Opciones seleccionadas con fondo verde muy claro `bg-success-light`
        - **Contador:** "X opciones seleccionadas" en gris claro debajo
        
        **TIPO 5: Escala de Satisfacción (1-5)**
        
        - **Respuesta mostrada:** Escala visual con nivel seleccionado destacado
        - **Componente:** Escala visual de 5 niveles
        - **Layout:**
            - 5 círculos alineados horizontalmente
            - Gap de 16px entre círculos (desktop), 8px (móvil)
        - **Cada nivel muestra:**
            - Número grande (1, 2, 3, 4, 5) dentro del círculo
            - Label personalizable debajo del número
            - Font-size del número: 24px bold
            - Font-size del label: 12px
        - **Estados de los botones:**
            - No seleccionado:
                - Border: `border-border-secondary`
                - Background: gris muy claro `bg-bg-disabled`
                - Número: gris `text-text-muted`
            - Seleccionado:
                - Background con gradiente según nivel:
                    - 1-2: Rojo gradiente `bg-gradient-to-br from-error to-error-dark`
                    - 3: Amarillo `bg-gradient-to-br from-warning to-warning-dark`
                    - 4-5: Verde `bg-gradient-to-br from-success to-success-dark`
                - Número: blanco `text-white`
                - Label: Color más oscuro del gradiente
                - Sombra: `shadow-lg`
                - Animación sutil de pulse
        - **Indicador de selección:** Badge con "Tu respuesta: X - [Label]" debajo de la escala
- **CA-04:** Sección de Resumen y Acciones:
    
    **Card de Resumen de Participación:**
    
    - Fondo verde muy claro (`bg-success-light`)
    - Border: `border-success`
    - Padding: 20px
    - Border-radius: 12px
    - Margin-top: 48px
    - Contenido:
        - Título: "Resumen de tu participación"
        - Lista con íconos:
            - ✅ "Respondida el: DD/MM/YYYY a las HH:MM"
            - ⏱️ "Tiempo de respuesta: X minutos"
            - 📋 "Total de preguntas: Y"
            - 📊 "Preguntas obligatorias: Z (todas respondidas)"
        - Badge de estado: "COMPLETADA" en verde `bg-success text-white`
    
    **Botones de Acción:**
    
    - Layout horizontal centrado con gap de 16px
    - **Botón "Volver a Encuestas":**
        - Primario (`bg-primary-600 text-white`)
        - Ícono: 📋
        - Redirige a HU-ENC-00
    - **Botón "Descargar Respuesta":**
        - Secundario (outline `border-border-primary`)
        - Ícono: 📥
        - Genera PDF con respuestas (futuro)
        - Deshabilitado con tooltip "Funcionalidad en desarrollo"
- **CA-05:** Responsive Design:
    - **Desktop (>1024px):**
        - Vista centrada con max-width 800px
        - Header fijo con información completa
        - Respuestas con padding lateral generoso
        - Escala 1-5 con círculos grandes y labels visibles
    - **Tablet (768px-1024px):**
        - Vista centrada con max-width 700px
        - Header más compacto
        - Escala 1-5 con círculos medianos
    - **Mobile (<768px):**
        - Vista full-width con padding 16px
        - Header simplificado
        - Escala 1-5 con círculos pequeños, labels en tooltip
        - Cards de respuestas con padding reducido

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados pueden acceder a sus respuestas
- **VN-02:** Usuario debe tener acceso a la encuesta según segmentación (padre/docente/director)
- **VN-03:** Usuario DEBE haber respondido la encuesta previamente (verificar en `respuestas_encuestas`)
- **VN-04:** Las respuestas son de solo lectura, no se pueden modificar
- **VN-05:** Si la encuesta está activa y el usuario no ha respondido, redirigir a HU-ENC-01
- **VN-06:** Padre solo puede ver respuestas de encuestas dirigidas a grados/niveles/cursos de sus hijos
- **VN-07:** Docente solo puede ver respuestas de encuestas dirigidas a "todos" o "docentes"
- **VN-08:** Director puede ver respuestas de cualquier encuesta dirigida a "todos" o "directores"
- **VN-09:** Los metadatos de respuesta (tiempo, fecha) se muestran siempre que estén disponibles
- **VN-10:** Las respuestas se muestran en el mismo orden que las preguntas originales

---

### **UI/UX**

- **UX-01:** Header fijo con información de respuesta:
    
    ```
    ┌────────────────────────────────────────────────────────┐
    │  [←]              ✅ RESPONDIDA              📅 15/10/2025  │
    │              Respondido el: 14/10/2025 a las 15:30            │
    └────────────────────────────────────────────────────────┘
    
    ```
    
    - Badge de estado prominente con check verde
    - Información temporal clara y visible
    - Botón de navegación siempre accesible
- **UX-02:** Diseño de cards de respuestas:
    - Fondo blanco `bg-bg-card` con sombra sutil `shadow-sm`
    - Border radius generoso: 12px
    - Separación clara entre respuestas: 32px
    - Número de pregunta en badge circular con check verde
    - Indicador visual de tipo de pregunta
- **UX-03:** Estados de solo lectura consistentes:
    - Background gris claro `bg-bg-sidebar` para inputs deshabilitados
    - Border gris `border-border-secondary` en todos los elementos
    - Cursor not-allowed en todos los elementos interactivos
    - Texto en negro `text-text-primary` para mantener legibilidad
- **UX-04:** Resaltado de respuestas seleccionadas:
    - Radio buttons y checkboxes seleccionados con fondo verde `bg-success-light`
    - Escala 1-5 con botón seleccionado con gradiente de color
    - Indicadores visuales claros de qué opción eligió el usuario
- **UX-05:** Metadatos informativos:
    - Contador de caracteres para respuestas de texto
    - Indicador de opciones seleccionadas en opción múltiple
    - Badge con nivel seleccionado en escala 1-5
    - Timestamp de respuesta siempre visible
- **UX-06:** Card de resumen motivacional:
    - Fondo verde claro `bg-success-light` con borde success
    - Lista de logros con íconos descriptivos
    - Badge "COMPLETADA" como recompensa visual
    - Refuerzo positivo de la participación del usuario
- **UX-07:** Navegación intuitiva:
    - Botón "Volver" siempre visible en header
    - Botón secundario "Volver a Encuestas" al final
    - Flujo circular: Bandeja → Respuesta → Bandeja
- **UX-08:** Accesibilidad y legibilidad:
    - Contraste alto en todos los textos
    - Tamaño de fuente legible (mínimo 16px)
    - Espaciado generoso entre elementos
    - Estructura semántica HTML5

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar encuesta y respuestas con spinner
- **EF-02:** Estado cargado: Mostrar vista completa con respuestas del usuario
- **EF-03:** Estado de validación previa: Verificar si usuario respondió la encuesta
- **EF-04:** Estado de redirección: Si no respondió, redirigir a HU-ENC-01 o HU-ENC-00
- **EF-05:** Estado de visualización: Usuario navega por sus respuestas
- **EF-06:** Estado de navegación: Usuario hace clic en "Volver" para regresar a bandeja
- **EF-07:** Estado de descarga: Usuario intenta descargar PDF (futuro)
- **EF-08:** Estado de error: Alert con mensaje específico si hay problemas de carga

---

### **Validaciones de Entrada**

- **VE-01:** ID de encuesta debe ser válido y existir en base de datos
- **VE-02:** Usuario debe estar autenticado
- **VE-03:** Usuario debe tener acceso a la encuesta según segmentación
- **VE-04:** Debe existir registro de respuesta del usuario en `respuestas_encuestas`

---

### **Mensajes de Error**

- "No tienes permisos para ver esta encuesta"
- "Aún no has respondido esta encuesta. ¿Deseas responderla ahora?"
- "Esta encuesta no está disponible"
- "Error al cargar tus respuestas. Intenta nuevamente"
- "La encuesta ha cambiado desde que respondiste. Contacta al administrador"

---

### **Mensajes de Éxito**

- "✅ Tus respuestas se cargaron correctamente"
- "📋 Descargando tus respuestas..." (futuro)

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-ENC-00 (Bandeja de encuestas - punto de acceso)
    - HU-ENC-01 (Responder encuesta - prerequisite)
- **HU Siguientes:**
    - HU-ENC-05 (Ver análisis de resultados - solo autor, contrasting view)

---

### **Componentes y Estructura**

- **Tipo:** Página completa de vista de datos (`/dashboard/encuestas/:id/mis-respuestas`)
- **Componentes principales:**
    - `VerRespuestasPage`: Componente contenedor principal
    - `RespuestasHeader`: Header fijo con información de respuesta
    - `EstadoRespondidaBadge`: Badge verde con check
    - `FechaRespuestaInfo`: Componente de fecha y hora
    - `EncuestaResumenInfo`: Card con título y descripción de encuesta
    - `MetadatosRespuesta`: Card con tiempo de respuesta
    - `RespuestasContainer`: Container de respuestas scrollable
    - `RespuestaRenderer`: Componente genérico que renderiza según tipo
    - `RespuestaCard`: Card wrapper para cada respuesta
    - `TextoCortoRespuesta`: Input deshabilitado para texto corto
    - `TextoLargoRespuesta`: Textarea deshabilitado para texto largo
    - `OpcionUnicaRespuesta`: Radio buttons deshabilitados
    - `OpcionMultipleRespuesta`: Checkboxes deshabilitados
    - `EscalaSatisfaccionRespuesta`: Escala visual con selección marcada
    - `ResumenParticipacionCard`: Card de resumen motivacional
    - `VolverButton`: Botón de navegación
    - `DescargarButton`: Botón de descarga (futuro)
    - `ErrorAlert`: Componente de alertas de error
- **Endpoints API:**
    - `GET /encuestas/:id/mis-respuestas` - Obtener encuesta con respuestas del usuario
    - `GET /encuestas/:id/validar-acceso-respuesta` - Validar que usuario puede ver respuestas
    - `GET /respuestas-encuestas/usuario/:usuario_id/encuesta/:encuesta_id` - Obtener respuesta específica
    - `GET /encuestas/:id` - Obtener datos de la encuesta
    - `POST /respuestas-encuestas/descargar` - Generar PDF de respuestas (futuro)

---

### **Reglas de Negocio Específicas del Módulo (RN-ENC)**

- **RN-ENC-66:** Usuario debe estar autenticado para acceder a sus respuestas
- **RN-ENC-67:** Usuario solo puede ver sus propias respuestas, no las de otros usuarios
- **RN-ENC-68:** Para ver respuestas, debe existir registro en `respuestas_encuestas` con `usuario_id` y `encuesta_id`
- **RN-ENC-69:** Padre solo puede ver respuestas de encuestas dirigidas a grados/niveles/cursos de sus hijos
- **RN-ENC-70:** Docente solo puede ver respuestas de encuestas dirigidas a "todos" o "docentes"
- **RN-ENC-71:** Director puede ver respuestas de cualquier encuesta dirigida a "todos" o "directores"
- **RN-ENC-72:** Las respuestas son inmutables y de solo lectura una vez enviadas
- **RN-ENC-73:** Si una encuesta está activa y el usuario no ha respondido, se redirige al formulario de respuesta
- **RN-ENC-74:** El tiempo de respuesta se muestra si está disponible en campo `tiempo_respuesta_minutos`
- **RN-ENC-75:** Las respuestas se muestran en el mismo orden definido en `orden` de las preguntas originales
- **RN-ENC-76:** Los metadatos de respuesta (fecha, tiempo, IP) son informativos y no modificables
- **RN-ENC-77:** El sistema debe validar que el usuario tenga acceso a la encuesta antes de mostrar respuestas
- **RN-ENC-78:** Las respuestas de texto largo mantienen su formato original (saltos de línea, párrafos)
- **RN-ENC-79:** Las respuestas de opción múltiple muestran todas las opciones, destacando las seleccionadas
- **RN-ENC-80:** La escala 1-5 muestra el nivel seleccionado con gradiente de color según valor (negativo/neutral/positivo)
- **RN-ENC-81:** Si una pregunta no era obligatoria y el usuario no respondió, se muestra como "No respondida"
- **RN-ENC-82:** El sistema registra cada acceso a las respuestas para auditoría en logs de aplicación
- **RN-ENC-83:** Las respuestas se cargan con cache de 5 minutos para optimizar rendimiento
- **RN-ENC-84:** El PDF de descarga (futuro) incluirá marca de agua con fecha y hora de generación
---


---

# **Historia de Usuario Detallada - HU-ENC-04**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Docente/Director que gestiona sus encuestas
2. **encuestas** - Encuestas creadas por el usuario
3. **respuestas_encuestas** - Respuestas registradas para control de edición/eliminación
4. **permisos_docentes** - Validación de permisos de gestión
5. **nivel_grado** - Niveles y grados para filtros
6. **cursos** - Cursos para filtros específicos
7. **asignaciones_docente_curso** - Determina qué grados/cursos puede gestionar el docente
8. **notificaciones** - Registro de notificaciones enviadas

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Permisos de docentes configurados
- **HU-ENC-03** - Creación de encuestas (debe existir al menos una encuesta propia)

### **Roles Involucrados:**

- **Docente con permisos:** Solo gestiona sus propias encuestas creadas
- **Director:** Gestiona todas las encuestas de la institución (propias + de otros docentes)

---

## **HU-ENC-04 — Gestionar Encuestas Propias**

**Título:** Panel administrativo para gestión completa de encuestas creadas con estadísticas y control de estado

**Historia:**

> Como docente/director con permisos, quiero gestionar encuestas que he creado para mantener organizadas mis encuestas, controlar su estado, analizar participación y realizar acciones administrativas como cerrar, editar o eliminar según sea necesario.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al panel de gestión desde múltiples puntos:
    - **Botón "Mis Encuestas"** en menú lateral del dashboard (solo visible si tiene permisos)
        - **Docente:** Visible si `permisos_docentes.tipo_permiso = 'encuestas'` y `estado_activo = true`
        - **Director:** Siempre visible
        - Click redirige a `/dashboard/encuestas/gestion`
    - **Opción "Gestionar Encuestas"** en menú de opciones de encuesta en HU-ENC-00
    - **URL directa:** `/dashboard/encuestas/gestion`
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar panel (Backend):
    
    **Validación de Permisos:**
    
    - Verificar que usuario está autenticado
    - Verificar permisos de gestión:
        - **Docente:** Validar que `permisos_docentes.tipo_permiso = 'encuestas'` y `estado_activo = true`
        - **Director:** Acceso automático sin validación adicional
    
    **Carga de Encuestas:**
    
    - **Para Docente:**
        ```sql
        SELECT e.* FROM encuestas e
        WHERE e.autor_id = {docente_id}
        ORDER BY e.fecha_creacion DESC;
        ```
    - **Para Director:**
        ```sql
        SELECT e.*, u.nombre_completo as autor_nombre 
        FROM encuestas e
        JOIN usuarios u ON e.autor_id = u.id
        ORDER BY e.fecha_creacion DESC;
        ```
    
    **Si todas las validaciones pasan:**
    
    - Cargar listado completo de encuestas con estadísticas
    - Renderizar panel de gestión
- **CA-03:** Layout del panel de gestión:
    
    **HEADER FIJO DEL PANEL**
    
    - **Título del Panel:**
        - Texto grande, bold (24px)
        - Color: Negro (`text-text-primary`)
        - **Para Docente:** "Mis Encuestas"
        - **Para Director:** "Gestión de Encuestas Institucionales"
    - **Botón "Crear Nueva Encuesta":**
        - Color primario (`bg-primary-600 text-white`)
        - Ícono: 📋
        - Posición: Esquina superior derecha
        - Click redirige a HU-ENC-03
        - Siempre visible
    - **Resumen de Estadísticas Globales:**
        - Card horizontal con 4 métricas:
            - 📋 "Total encuestas: X"
            - ✅ "Activas: Y"
            - 📊 "Con respuestas: Z"
            - 📈 "Participación promedio: W%"
        - Background: `bg-info-light`
        - Border: `border-info`
        - Padding: 16px
        - Border-radius: 8px
    
    **SECCIÓN PRINCIPAL: Filtros y Listado**
    
    - **Barra de Filtros Avanzados:**
        
        **Filtros Comunes (Docente / Director):**
        
        - **Select "Estado":**
            - Opciones: Todas, Activas, Cerradas, Vencidas, Borrador
            - Default: "Todas"
            - Iconos por estado: 🟢 Activas, 🔒 Cerradas, 🔴 Vencidas, 📝 Borrador
        - **Date Range Picker "Rango de Fechas":**
            - Selector de fecha creación inicio y fin
            - Formato: DD/MM/YYYY
            - Preset buttons: "Hoy", "Esta semana", "Este mes", "Todo"
        - **Select "Ordenar por":**
            - Opciones: Más reciente, Más antigua, Por nombre (A-Z), Por respuestas (más-menos)
            - Default: "Más reciente"
        
        **Filtros Específicos para Director:**
        
        - **Select "Autor":**
            - Dropdown con lista de todos los creadores
            - Opciones: Todos, [Nombre de cada docente], "Mis encuestas"
            - Default: "Todos"
        - **Select "Nivel":**
            - Opciones: Todos, Inicial, Primaria, Secundaria
            - Default: "Todos"
        - **Select "Grado":**
            - Opciones dinámicas según nivel seleccionado
            - Default: "Todos"
        
        **Controles de Filtros:**
        
        - **Botón "Aplicar Filtros":**
            - Color primario (`bg-primary-600`)
            - Recarga lista con filtros aplicados
        - **Botón "Limpiar Filtros":**
            - Secundario (outline)
            - Visible solo si hay filtros activos
            - Resetea todos los filtros a valores por defecto
    
    - **Tabla de Encuestas (Desktop) / Lista de Cards (Mobile):**
        
        **Vista Desktop (Tabla):**
        
        - **Columnas:**
            1. **Estado:** Badge con color e ícono
            2. **Título:** Texto con truncamiento a 50 caracteres
            3. **Autor:** (solo director) Nombre del creador
            4. **Fecha Creación:** DD/MM/YYYY
            5. **Fecha Vencimiento:** DD/MM/YYYY (con color si está próxima)
            6. **Respuestas:** "X / Y" (respondidas / estimadas)
            7. **Participación:** "ZZ%" con barra de progreso visual
            8. **Acciones:** Botones de acción
        - **Ordenamiento:** Click en encabezado de columna para ordenar
        - **Paginación:** 20 resultados por página
        
        **Vista Mobile (Cards):**
        
        - **Cada card muestra:**
            - **Header:** Badge de estado + título + menú de acciones
            - **Metadatos:** Autor (solo director), fechas, estadísticas
            - **Footer:** Barra de progreso de participación + botones principales
        - **Layout:** Lista vertical con gap de 16px
        - **Lazy loading:** Cargar 10 cards inicialmente, más al scroll
        
        **Contenido de cada encuesta:**
        
        - **Badge de Estado:** 
            - Activa: 🟢 `bg-success-light text-success-dark`
            - Cerrada: 🔒 `bg-warning-light text-warning-dark`
            - Vencida: 🔴 `bg-error-light text-error-dark`
            - Borrador: 📝 `bg-tertiary-light text-tertiary-dark`
        - **Título:** Bold, truncado con tooltip si es largo
        - **Información temporal:**
            - "Creada: DD/MM/YYYY"
            - "Vence: DD/MM/YYYY" (rojo si vence en < 3 días)
        - **Estadísticas de participación:**
            - "📊 X respuestas / Y estimados"
            - Barra de progreso visual: 
                - > 80%: Verde `bg-success`
                - 50-80%: Amarillo `bg-warning`
                - < 50%: Rojo `bg-error`
        - **Botones de Acción:**
            
            **Acciones Principales (siempre visibles):**
            
            - **"📊 Ver Resultados":**
                - Visible si hay respuestas
                - Color primario (`bg-primary-600`)
                - Redirige a HU-ENC-05
            - **"👥 Ver Destinatarios":**
                - Color secundario (`bg-secondary-500`)
                - Abre modal con lista de destinatarios
            
            **Acciones Secundarias (menú ⋮):**
            
            - **"✏️ Editar Información":**
                - Visible solo si no hay respuestas
                - Permite editar título, descripción, fecha de vencimiento
                - No permite editar preguntas
            - **"📅 Extender Vencimiento":**
                - Visible si está activa o cerrada
                - Abre modal para seleccionar nueva fecha
            - **"🔒 Cerrar Encuesta":**
                - Visible si está activa
                - Abre modal de confirmación
            - **"🔓 Reabrir Encuesta":**
                - Visible si está cerrada o vencida
                - Permite extender fecha y reactivar
            - **"📋 Duplicar Encuesta":**
                - Crea copia como borrador
                - Mantiene estructura de preguntas
            - **"🗑️ Eliminar":**
                - Visible solo si no hay respuestas
                - Modal de confirmación con advertencia
                - Eliminación permanente
- **CA-04:** Funcionalidades de Gestión por Estado:
    
    **Para Encuestas ACTIVAS:**
    
    - **Ver Resultados:** Si hay respuestas, redirige a HU-ENC-05
    - **Cerrar Anticipadamente:** Cambia estado a "cerrada", deja de aceptar respuestas
    - **Extender Vencimiento:** Permite modificar fecha de vencimiento futura
    - **Editar Información:** Solo si no hay respuestas aún
    - **Ver Destinatarios:** Lista completa de usuarios a quienes se envió
    
    **Para Encuestas CERRADAS:**
    
    - **Ver Resultados:** Siempre disponible
    - **Reabrir:** Extiende fecha de vencimiento y cambia estado a "activa"
    - **Editar Información:** No disponible (ya tiene respuestas)
    - **Ver Destinatarios:** Solo lectura
    
    **Para Encuestas VENCIDAS:**
    
    - **Ver Resultados:** Si hay respuestas
    - **Reabrir:** Permite extender fecha y reactivar
    - **Eliminar:** Solo si no tiene respuestas
    - **Editar Información:** No disponible
    
    **Para Encuestas BORRADOR:**
    
    - **Editar:** Permite modificar toda la estructura (preguntas incluidas)
    - **Publicar:** Redirige a HU-ENC-03 paso 3 para publicación
    - **Eliminar:** Siempre disponible con confirmación
    - **Duplicar:** Crea copia como nuevo borrador
- **CA-05:** Modales de Confirmación y Acciones:
    
    **Modal "Cerrar Encuesta":**
    
    - Título: "¿Cerrar encuesta?"
    - Contenido: "Al cerrar esta encuesta, ya no aceptará nuevas respuestas. Las respuestas existentes se conservarán."
    - Información: "Actualmente tiene X respuestas registradas"
    - Botones: "Sí, cerrar" (rojo) | "Cancelar" (secundario)
    
    **Modal "Extender Vencimiento":**
    
    - Título: "Extender fecha de vencimiento"
    - Date picker con fecha mínima = mañana
    - Texto informativo: "La encuesta seguirá activa hasta la nueva fecha"
    - Botones: "Extender" (primario) | "Cancelar" (secundario)
    
    **Modal "Reabrir Encuesta":**
    
    - Título: "¿Reabrir encuesta?"
    - Date picker para nueva fecha de vencimiento
    - Contenido: "La encuesta volverá a estar activa y aceptará nuevas respuestas"
    - Botones: "Reabrir" (primario) | "Cancelar" (secundario)
    
    **Modal "Eliminar Encuesta":**
    
    - Título: "⚠️ Eliminar encuesta permanentemente"
    - Contenido: "Esta acción no se puede deshacer. Se eliminarán todos los datos asociados."
    - Checkbox de confirmación: "Entiendo que esta acción es irreversible"
    - Botón "Eliminar" deshabilitado hasta marcar checkbox
    - Botones: "Eliminar permanentemente" (rojo) | "Cancelar" (secundario)
    
    **Modal "Ver Destinatarios":**
    
    - Título: "Destinatarios de la encuesta"
    - Lista paginada con:
        - Nombre completo del usuario
        - Rol (Padre/Docente/Director)
        - Grado/Curso (si aplica)
        - Estado de respuesta: ✅ Respondió | ⏳ Pendiente
    - Filtros: Por rol, por estado de respuesta
    - Exportación a CSV (futuro)
- **CA-06:** Estadísticas y Métricas en Tiempo Real:
    
    **Para cada encuesta se muestra:**
    
    - **Total de Respuestas:** Count de `respuestas_encuestas` por `encuesta_id`
    - **Participación %:** (Respuestas / Destinatarios) * 100
    - **Tiempo Promedio de Respuesta:** Promedio de `tiempo_respuesta_minutos`
    - **Última Respuesta:** Fecha y hora de la respuesta más reciente
    - **Tasa de Apertura:** (Destinatarios que vieron la encuesta / Total destinatarios) * 100
    
    **Estadísticas Globales del Panel:**
    
    - **Total de Encuestas Creadas:** Count de encuestas del usuario
    - **Encuestas Activas:** Count con estado = 'activa'
    - **Promedio de Participación:** Promedio de participación de todas las encuestas
    - **Tendencia de Respuestas:** Comparación con período anterior (semana/mes)
- **CA-07:** Responsive Design:
    - **Desktop (>1024px):**
        - Layout de tabla con ordenamiento por columna
        - Sidebar de filtros fijo a la izquierda
        - Panel de estadísticas en header
        - Paginación clásica abajo de la tabla
    - **Tablet (768px-1024px):**
        - Vista de cards con 2 columnas
        - Filtros colapsables en header
        - Paginación con botones "Cargar más"
    - **Mobile (<768px):**
        - Lista vertical de cards
        - Filtros en modal slide-up
        - Lazy loading con scroll infinito
        - Actions en botones touch-friendly

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados con rol docente (con permisos) o director pueden acceder
- **VN-02:** Docente solo puede gestionar sus propias encuestas (`autor_id = current_user`)
- **VN-03:** Director puede gestionar todas las encuestas de la institución
- **VN-04:** Solo se puede editar información de encuesta si no tiene respuestas registradas
- **VN-05:** Solo se puede eliminar encuesta si no tiene respuestas registradas
- **VN-06:** Al cerrar encuesta, cambia estado a "cerrada" y no acepta más respuestas
- **VN-07:** Al reabrir encuesta, se debe especificar nueva fecha de vencimiento futura
- **VN-08:** La duplicación de encuesta crea copia con estado "borrador" y nuevo ID
- **VN-09:** Las estadísticas se calculan en tiempo real desde la base de datos
- **VN-10:** La extensión de vencimiento solo permite fechas futuras
- **VN-11:** Docente solo ve filtros de autor/grado/nivel si es director
- **VN-12:** Las acciones disponibles varían según estado de la encuesta
- **VN-13:** La eliminación es permanente y no se puede deshacer
- **VN-14:** Al duplicar, se mantiene estructura de preguntas pero se resetean estadísticas
- **VN-15:** Los destinatarios se calculan según segmentación original de la encuesta

---

### **UI/UX**

- **UX-01:** Layout administrativo tipo dashboard:
    
    ```
    ┌────────────────────────────────────────────────────────┐
    │  📋 Mis Encuestas                           [📋 Nueva]  │
    │  [📋 15] [✅ 8] [📊 12] [📈 73%]                     │
    ├────────────────────────────────────────────────────────┤
    │  [Estado▼] [Fechas▼] [Autor▼] [Aplicar] [Limpiar]    │
    ├────────────────────────────────────────────────────────┤
    │  ┌─ Estado ── Título ────── Autor ── Respuestas ── Acciones ┐ │
    │  │ 🟢 │ Satisfacción... │ Juan Pérez │ 45/60 (75%) │ [⋮]    │ │
    │  │ 🔒 │ Comunicación   │ María Gómez│ 12/30 (40%) │ [⋮]    │ │
    │  └───────────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────┘
    
    ```
    
    - Panel de estadísticas visual e informativo
    - Filtros intuitivos con presets comunes
    - Tabla ordenable con información completa
- **UX-02:** Diseño de cards para mobile:
    - Altura variable según contenido
    - Header con badge de estado y título prominente
    - Sección de metadatos con información temporal
    - Barra de progreso visual para participación
    - Footer con botones de acción principales
- **UX-03:** Estados visuales consistentes:
    - **Activa:** Verde con ícono 🟢, animación sutil de pulse
    - **Cerrada:** Amarillo con ícono 🔒, sin animaciones
    - **Vencida:** Rojo con ícono 🔴, opacidad reducida
    - **Borrador:** Gris con ícono 📝, estilo diferente
- **UX-04:** Barras de progreso de participación:
    - **> 80%:** Verde (`bg-success`) con check ✓
    - **50-80%:** Amarillo (`bg-warning`) con advertencia ⚠️
    - **< 50%:** Rojo (`bg-error`) con alerta ❌
    - Animación smooth al cargar valores
    - Tooltip con texto exacto: "X de Y usuarios (ZZ%)"
- **UX-05:** Modales de confirmación claros:
    - Overlay oscuro `bg-bg-overlay` con blur
    - Modal centrado con animación fade-in + scale
    - Íconos grandes y descriptivos según acción
    - Botones con jerarquía visual clara
    - Texto explicativo de consecuencias
- **UX-06:** Menús de acciones contextuales:
    - Botón "⋮" que abre dropdown al hover/click
    - Opciones agrupadas por tipo:
        - Acciones principales (ver resultados, destinatarios)
        - Acciones de edición (editar, extender)
        - Acciones de estado (cerrar, reabrir)
        - Acciones destructivas (duplicar, eliminar)
    - Íconos descriptivos para cada opción
    - Separadores visuales entre grupos
- **UX-07:** Indicadores de datos vacíos:
    - **Sin encuestas:** Ilustración + mensaje motivacional
    - **Sin respuestas:** Badge gris "Sin respuestas"
    - **Sin filtros:** Mensaje "Aplica filtros para refinar resultados"
    - Botones de acción sugeridos según contexto
- **UX-08:** Feedback visual de acciones:
    - **Éxito:** Toast verde + check ✓
    - **Error:** Toast rojo + ícono ❌
    - **Procesando:** Spinner en botón + texto "Procesando..."
    - **Confirmación:** Modal con información detallada

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar panel con spinner y estadísticas globales
- **EF-02:** Estado cargado: Mostrar tabla/cards con encuestas del usuario
- **EF-03:** Estado de filtros: Aplicar filtros y recargar lista con animación
- **EF-04:** Estado de ordenamiento: Reorganizar lista según columna seleccionada
- **EF-05:** Estado de acción: Abrir modal correspondiente a acción seleccionada
- **EF-06:** Estado de procesamiento: Mostrar spinner durante operación CRUD
- **EF-07:** Estado de éxito: Toast de confirmación + actualización de lista
- **EF-08:** Estado de error: Alert con mensaje específico + opción de reintentar
- **EF-09:** Estado de paginación: Cargar siguiente página de resultados
- **EF-10:** Estado de búsqueda: Filtrar resultados en tiempo real

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe estar autenticado y tener permisos de gestión
- **VE-02:** Fecha de vencimiento debe ser futura al extender/reabrir
- **VE-03:** Confirmación de eliminación debe estar marcada para proceder
- **VE-04:** Filtros de fecha deben tener rango válido (inicio <= fin)
- **VE-05:** Solo se pueden editar encuestas sin respuestas registradas
- **VE-06:** Solo se pueden eliminar encuestas sin respuestas registradas

---

### **Mensajes de Error**

- "No tienes permisos para gestionar encuestas"
- "No se pueden editar encuestas que ya tienen respuestas"
- "No se pueden eliminar encuestas que ya tienen respuestas"
- "La fecha de vencimiento debe ser futura"
- "Error al actualizar el estado de la encuesta"
- "Error al cargar las estadísticas. Intenta nuevamente"
- "No se pudo duplicar la encuesta. Intenta nuevamente"
- "Debes confirmar la eliminación para proceder"

---

### **Mensajes de Éxito**

- "✅ Encuesta cerrada correctamente"
- "✅ Fecha de vencimiento extendida hasta DD/MM/YYYY"
- "✅ Encuesta reabierta exitosamente"
- "✅ Encuesta duplicada como borrador"
- "✅ Encuesta eliminada permanentemente"
- "✅ Información de encuesta actualizada"
- "📊 Estadísticas actualizadas en tiempo real"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-USERS-65 (Permisos de docentes asignados)
    - HU-ENC-03 (Crear y Publicar Encuesta - prerequisite)
- **HU Siguientes:**
    - HU-ENC-05 (Ver Análisis de Resultados - acción principal)
    - HU-ENC-01 (Responder Encuesta - reabrir flujo)
    - HU-ENC-00 (Bandeja de Encuestas - navegación)

---

### **Componentes y Estructura**

- **Tipo:** Página completa de gestión (`/dashboard/encuestas/gestion`)
- **Componentes principales:**
    - `GestionEncuestasPage`: Componente contenedor principal
    - `GestionHeader`: Header con título y estadísticas globales
    - `EstadisticasGlobalesCard`: Card con 4 métricas principales
    - `NuevaEncuestaButton`: Botón de creación (siempre visible)
    - `FiltrosAvanzados`: Barra de filtros con selects y date pickers
    - `EstadoSelect`: Selector de estado con iconos
    - `AutorSelect`: Selector de autor (solo director)
    - `NivelGradoSelect`: Selectores de nivel/grado (solo director)
    - `DateRangePicker`: Selector de rango de fechas
    - `OrdenamientoSelect`: Selector de ordenamiento
    - `AplicarFiltrosButton`: Botón para aplicar filtros
    - `LimpiarFiltrosButton`: Botón de reseteo de filtros
    - `EncuestasTable`: Tabla de encuestas (desktop)
    - `EncuestasCardsList`: Lista de cards (mobile)
    - `EncuestaRow`: Fila individual de tabla
    - `EncuestaCard`: Card individual de encuesta
    - `EstadoBadge`: Badge de estado con color e icono
    - `ParticipacionProgressBar`: Barra de progreso visual
    - `AccionesDropdown`: Menú de acciones contextuales
    - `VerResultadosButton`: Botón de navegación a resultados
    - `VerDestinatariosButton`: Botón para ver destinatarios
    - `EditarInformacionButton`: Botón de edición (condicional)
    - `CerrarEncuestaModal`: Modal de confirmación de cierre
    - `ExtenderVencimientoModal`: Modal para extender fecha
    - `ReabrirEncuestaModal`: Modal para reabrir encuesta
    - `EliminarEncuestaModal`: Modal de eliminación con confirmación
    - `DestinatariosModal`: Modal con lista de destinatarios
    - `DestinatariosTable`: Tabla de destinatarios con estados
    - `PaginacionComponent`: Componente de paginación
    - `LazyLoadSpinner`: Spinner para carga infinita
    - `EmptyState`: Estado vacío con ilustración
    - `ToastNotification`: Toast de feedback
    - `ErrorAlert`: Componente de alertas de error
- **Endpoints API:**
    - `GET /encuestas/gestion?rol={rol}&usuario_id={id}&filtros={...}` - Listado de encuestas para gestión
    - `GET /encuestas/estadisticas/globales?usuario_id={id}` - Estadísticas globales del usuario
    - `GET /encuestas/:id/estadisticas` - Estadísticas específicas de una encuesta
    - `GET /encuestas/:id/destinatarios` - Lista completa de destinatarios
    - `PATCH /encuestas/:id/cerrar` - Cerrar encuesta anticipadamente
    - `PATCH /encuestas/:id/extender` - Extender fecha de vencimiento
    - `PATCH /encuestas/:id/reabrir` - Reabrir encuesta con nueva fecha
    - `PATCH /encuestas/:id/editar` - Editar información básica (solo si sin respuestas)
    - `POST /encuestas/:id/duplicar` - Crear copia como borrador
    - `DELETE /encuestas/:id` - Eliminar encuesta (solo si sin respuestas)
    - `GET /respuestas-encuestas/count?encuesta_id={id}` - Conteo de respuestas
    - `GET /usuarios/destinatarios?encuesta_id={id}` - Calcular destinatarios según segmentación

---

### **Reglas de Negocio Específicas del Módulo (RN-ENC)**

- **RN-ENC-85:** Usuario debe estar autenticado y tener permisos de gestión para acceder al panel
- **RN-ENC-86:** Docente solo puede gestionar encuestas donde `autor_id = current_user`
- **RN-ENC-87:** Director puede gestionar todas las encuestas de la institución sin restricciones
- **RN-ENC-88:** Solo se permite editar información (título, descripción, fecha) si no hay respuestas registradas
- **RN-ENC-89:** No se permite editar estructura de preguntas una vez publicada la encuesta
- **RN-ENC-90:** Solo se puede eliminar encuesta si no tiene respuestas en `respuestas_encuestas`
- **RN-ENC-91:** Al cerrar encuesta, estado cambia a "cerrada" y `fecha_cierre = NOW()`
- **RN-ENC-92:** Encuesta cerrada no acepta nuevas respuestas pero mantiene las existentes
- **RN-ENC-93:** Al extender vencimiento, `fecha_vencimiento` se actualiza y encuesta permanece en mismo estado
- **RN-ENC-94:** Al reabrir encuesta, estado cambia a "activa" y se asigna nueva `fecha_vencimiento`
- **RN-ENC-95:** La duplicación crea nueva encuesta con `estado = "borrador"` y `autor_id = current_user`
- **RN-ENC-96:** Al duplicar, se copia estructura JSON de preguntas pero se resetean estadísticas y fechas
- **RN-ENC-97:** Las estadísticas de participación se calculan como (respuestas_count / destinatarios_count) * 100
- **RN-ENC-98:** El tiempo promedio de respuesta es el promedio de `tiempo_respuesta_minutos` de todas las respuestas
- **RN-ENC-99:** Los destinatarios se calculan según segmentación original guardada en campos JSON de la encuesta
- **RN-ENC-100:** Al ver destinatarios, se muestra estado de respuesta: "Respondió" o "Pendiente"
- **RN-ENC-101:** Las acciones disponibles varían dinámicamente según estado de la encuesta
- **RN-ENC-102:** La eliminación es permanente y afecta a encuesta, sus respuestas y notificaciones asociadas
- **RN-ENC-103:** Todas las acciones de gestión registran log de auditoría con usuario, fecha y acción realizada
- **RN-ENC-104:** El panel se actualiza en tiempo real mediante polling cada 30 segundos para reflejar cambios
- **RN-ENC-105:** Los filtros se aplican en backend para optimizar rendimiento y seguridad
- **RN-ENC-106:** La paginación en desktop es de 20 resultados por página, en mobile es lazy loading
- **RN-ENC-107:** Las estadísticas globales se cachean por 5 minutos para optimizar rendimiento
- **RN-ENC-108:** Al cambiar estado de encuesta, se envía notificación a usuarios afectados (ej: reabrir)
- **RN-ENC-109:** El sistema valida que el usuario tenga permisos sobre los grados/cursos al filtrar por nivel/grado
- **RN-ENC-110:** Las exportaciones de destinatarios o resultados estarán disponibles en futuras versiones


---

# **Historia de Usuario Detallada - HU-ENC-05**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Docente/Director que analiza resultados
2. **encuestas** - Encuesta con preguntas y configuración
3. **respuestas_encuestas** - Respuestas registradas para análisis
4. **usuarios** - Respondientes (para nombres y roles)
5. **estudiantes** - Estudiantes relacionados (para contexto del padre)
6. **relaciones_familiares** - Vinculación padre-hijo (para segmentación)
7. **asignaciones_docente_curso** - Cursos (para filtros de segmentación)
8. **permisos_docentes** - Validación de permisos de análisis

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Permisos de docentes configurados
- **HU-ENC-03** - Creación de encuestas (debe existir la encuesta)
- **HU-ENC-04** - Gestión de encuestas (punto de acceso principal)

### **Roles Involucrados:**

- **Docente con permisos:** Solo analiza resultados de sus encuestas creadas
- **Director:** Analiza resultados de todas las encuestas de la institución

---

## **HU-ENC-05 — Ver Análisis de Resultados**

**Título:** Dashboard analítico con visualizaciones interactivas y métricas detalladas de resultados de encuestas

**Historia:**

> Como docente/director con permisos, quiero ver análisis visual de resultados de mis encuestas con gráficos interactivos, métricas detalladas y segmentación avanzada para evaluar el feedback recibido, identificar tendencias y tomar decisiones informadas basadas en datos concretos.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Acceso al dashboard de análisis desde múltiples puntos:
    - **Botón "📊 Ver Resultados"** en HU-ENC-04 (panel de gestión)
        - Visible solo si la encuesta tiene respuestas registradas
        - Click redirige a `/dashboard/encuestas/:id/resultados`
    - **Botón "📊 Ver Resultados"** en menú de acciones de encuesta en HU-ENC-00
    - **URL directa:** `/dashboard/encuestas/:id/resultados`
    - Transición suave con animación de fade-in
- **CA-02:** Validaciones previas al cargar dashboard (Backend):
    
    **Validación de Acceso:**
    
    - Verificar que usuario está autenticado
    - Verificar que encuesta existe
    - Verificar permisos de análisis:
        - **Docente:** Validar que `encuestas.autor_id = current_user`
        - **Director:** Acceso automático sin validación adicional
    - Verificar que encuesta tenga al menos 1 respuesta registrada
    
    **Carga de Datos:**
    
    ```sql
    -- Obtener estadísticas generales
    SELECT 
      COUNT(*) as total_respuestas,
      AVG(tiempo_respuesta_minutos) as tiempo_promedio,
      MIN(fecha_respuesta) as primera_respuesta,
      MAX(fecha_respuesta) as ultima_respuesta
    FROM respuestas_encuestas 
    WHERE encuesta_id = :id;
    
    -- Obtener respuestas detalladas
    SELECT re.respuestas, re.fecha_respuesta, re.tiempo_respuesta_minutos,
           u.nombre_completo, u.rol, u.email
    FROM respuestas_encuestas re
    JOIN usuarios u ON re.usuario_id = u.id
    WHERE re.encuesta_id = :id
    ORDER BY re.fecha_respuesta DESC;
    ```
    
    **Si todas las validaciones pasan:**
    
    - Cargar estadísticas generales
    - Procesar respuestas para generar visualizaciones
    - Renderizar dashboard completo
- **CA-03:** Layout del dashboard de análisis:
    
    **HEADER FIJO DEL DASHBOARD**
    
    - **Botón "← Volver":**
        - Vuelve a HU-ENC-04 (gestión de encuestas)
        - Posición: Esquina superior izquierda
        - Color secundario (outline `border-border-primary`)
    - **Título de la Encuesta:**
        - Texto grande, bold (24px)
        - Color: Negro (`text-text-primary`)
        - Centrado horizontalmente
        - Truncado a 80 caracteres con tooltip si es largo
    - **Badge de Estadísticas Principales:**
        - Card horizontal con 3 métricas clave:
            - 📊 "X respuestas recibidas"
            - 📈 "Y% de participación"
            - ⏱️ "Z min. tiempo promedio"
        - Background: `bg-info-light`
        - Border: `border-info`
        - Posición: Esquina superior derecha
    - **Altura fija:** 100px
    - **Sticky:** Permanece visible al hacer scroll
    - **Sombra sutil:** `shadow-md`
    
    **SECCIÓN PRINCIPAL: Resumen General y Filtros**
    
    - **Card de Resumen General:**
        
        **Métricas Principales:**
        
        - **Total de Respuestas:** Número grande con trend vs período anterior
        - **Tasa de Participación:** Porcentaje con barra de progreso visual
        - **Tiempo Promedio de Respuesta:** Minutos con comparación
        - **Fecha del Análisis:** "Actualizado: DD/MM/YYYY a las HH:MM"
        
        **Distribución por Segmento (si aplica):**
        
        - **Por Nivel:** Gráfico de barras con participación por nivel
        - **Por Grado:** Gráfico de barras con participación por grado
        - **Por Rol:** Pie chart con distribución Padres vs Docentes
        - **Por Curso:** Tabla con participación por curso específico
        
        **Indicadores de Calidad:**
        
        - **Completitud:** % de preguntas obligatorias respondidas en promedio
        - **Satisfacción General:** Promedio de escalas 1-5 (si hay preguntas de este tipo)
        - **Velocidad de Respuesta:** Tiempo promedio desde publicación hasta primera respuesta
    
    - **Panel de Filtros Avanzados:**
        
        **Filtros Temporales:**
        
        - **Date Range Picker "Período de Respuestas":**
            - Selector de fecha inicio y fin
            - Default: Desde fecha de publicación hasta hoy
            - Preset buttons: "Hoy", "Última semana", "Último mes", "Todo"
        
        **Filtros de Segmentación (solo si encuesta está segmentada):**
        
        - **Select "Nivel":** Todas, Inicial, Primaria, Secundaria
        - **Select "Grado":** Todos, 1ro, 2do, etc. (dinámico por nivel)
        - **Select "Curso":** Todos, [lista de cursos] (dinámico por grado)
        - **Select "Rol":** Todos, Padres, Docentes
        
        **Filtros de Calidad:**
        
        - **Checkbox "Solo respuestas completas":** Filtra usuarios que respondieron todas las obligatorias
        - **Select "Tiempo de respuesta":** Todos, Rápidas (<5min), Normales (5-15min), Lentas (>15min)
        
        **Controles de Filtros:**
        
        - **Botón "Aplicar Filtros":** Recalculate visualizaciones
        - **Botón "Limpiar Filtros":** Reset a valores por defecto
        - **Badge de filtros activos:** "X filtros aplicados"
    
    - **Sección de Análisis por Pregunta:**
        
        **Container de Preguntas:**
        
        - Layout vertical con separación entre preguntas (48px)
        - Máximo ancho: 1200px centrado
        - Padding lateral: 24px
        
        **Cada Pregunta muestra análisis según tipo:**
        
        **Estructura Común para Todas las Preguntas:**
        
        - Card con fondo blanco `bg-bg-card`
        - Border: `border-border-primary`
        - Border-radius: 12px
        - Padding: 32px
        - Sombra: `shadow-md`
        - **Header de Pregunta:**
            - Número de pregunta: Badge circular con color primario
            - Texto de la pregunta: Bold (20px), color `text-text-primary`
            - Badge de tipo de pregunta: Pequeño, esquina superior derecha
            - Estadísticas básicas: "X de Y respondieron (Z%)"
        
        **TIPO 1: Texto Corto / Texto Largo**
        
        - **Sección de Estadísticas:**
            - **Total de Respuestas:** Número grande
            - **Longitud Promedio:** "XX caracteres en promedio"
            - **Respuestas Únicas:** "X respuestas únicas de Y totales"
        
        - **Lista de Respuestas:**
            
            **Vista Compacta (Default):**
            
            - Lista de 10 respuestas más recientes
            - Cada respuesta muestra:
                - Texto truncado a 150 caracteres con "..."
                - Autor: "Por: [Nombre]" con rol
                - Fecha: "DD/MM/YYYY HH:MM"
                - Botón "Ver más" para respuesta completa
            
            **Vista Completa (Modal):**
            
            - Click en respuesta abre modal con texto completo
            - Metadatos completos: autor, fecha, tiempo de respuesta
            - Botones de navegación: "Anterior" | "Siguiente"
        
        - **Nube de Palabras (Opcional):**
            - Visualización de palabras más frecuentes
            - Tamaño de palabra según frecuencia
            - Click en palabra filtra respuestas que la contienen
        
        **TIPO 2: Opción Única (Radio Buttons)**
        
        - **Gráfico de Barras Horizontales:**
            - Eje Y: Opciones de respuesta
            - Eje X: Número de respuestas y porcentaje
            - Colores: Gradiente de primario a secundario
            - Animación smooth al cargar
            - Hover: Tooltip con número exacto y %
        
        - **Estadísticas Detalladas:**
            - **Opción Más Seleccionada:** "[Opción] con X votos (Y%)"
            - **Total de Votos:** "X de Y respondieron"
            - **Distribución:** Lista completa con conteos y porcentajes
        
        - **Análisis por Segmento:**
            - Gráfico apilado mostrando distribución por rol/nivel/grado
            - Comparación visual entre segmentos
            - Tabla detallada con breakdown por segmento
        
        **TIPO 3: Opción Múltiple (Checkboxes)**
        
        - **Gráfico de Pastel (Pie Chart):**
            - Cada segmento representa una opción
            - Colores diferenciados con buena contraste
            - Porcentajes dentro de cada segmento
            - Leyenda externa con colores y nombres
            - Animación de entrada tipo "grow"
        
        - **Gráfico de Barras Verticales:**
            - Alternativa al pie chart para mejor comparación
            - Eje X: Opciones de respuesta
            - Eje Y: Número de selecciones (puede sumar más que total de respuestas)
            - Colores consistentes con pie chart
        
        - **Estadísticas Adicionales:**
            - **Promedio de Selecciones:** "X opciones seleccionadas por respuesta en promedio"
            - **Opción Más Popular:** "[Opción] seleccionada en X% de respuestas"
            - **Combinaciones Frecuentes:** Top 5 combinaciones de opciones
        
        **TIPO 4: Escala de Satisfacción (1-5)**
        
        - **Gráfico de Columnas:**
            - Eje X: Valores 1, 2, 3, 4, 5
            - Eje Y: Número de respuestas
            - Colores por valor:
                - 1-2: Rojo (negativo)
                - 3: Amarillo (neutral)
                - 4-5: Verde (positivo)
            - Línea de promedio horizontal
        
        - **Métricas Clave:**
            - **Promedio General:** "X.X de 5.0" grande y destacado
            - **Distribución:**
                - 😠 "Muy insatisfecho: X%"
                - 😕 "Insatisfecho: Y%"
                - 😐 "Neutral: Z%"
                - 🙂 "Satisfecho: W%"
                - 😊 "Muy satisfecho: V%"
        
        - **Análisis de Tendencias:**
            - Evolución temporal del promedio
            - Comparación por segmentos (rol/nivel/grado)
            - Correlación con tiempo de respuesta
        
        - **Nube de Sentimientos (Opcional):**
            - Análisis de palabras clave en comentarios abiertos relacionados
            - Clasificación automática: positivo, neutral, negativo
    
    - **Sección de Respondientes:**
        
        **Lista Completa de Respondientes:**
        
        - **Tabla con:**
            - Nombre completo del respondiente
            - Rol (Padre/Docente/Director)
            - Grado/Curso (si aplica)
            - Fecha y hora de respuesta
            - Tiempo de respuesta
            - Estado: ✅ Completa | ⚠️ Incompleta
        
        - **Acciones por Respondiente:**
            - **"👁️ Ver Respuesta Completa":** Abre modal con todas las respuestas del usuario
            - **"📧 Contactar":** Abrir cliente de correo con email prellenado (futuro)
        
        - **Estadísticas de Respondientes:**
            - **Lista de Pendientes:** Usuarios que no han respondido
            - **Recordatorios Enviados:** Conteo de notificaciones de recordatorio
            - **Tasa de Conversión:** % que respondió después de recordatorio
    
    - **Sección de Exportación y Compartir:**
        
        **Opciones de Exportación:**
        
        - **Botón "📊 Exportar a Excel":**
            - Genera archivo XLSX con:
                - Resumen general
                - Tabla de respuestas por pregunta
                - Lista completa de respondientes
                - Gráficos como imágenes
        - **Botón "📄 Exportar a PDF":**
            - Genera reporte PDF con:
                - Encabezado institucional
                - Resumen ejecutivo
                - Gráficos de alta calidad
                - Tablas detalladas
        - **Botón "🔗 Compartir Link":**
            - Genera enlace público de solo lectura
            - Opciones de expiración: 7 días, 30 días, ilimitado
            - Password opcional
            - Copy to clipboard con confirmación
        
        **Configuración de Reporte:**
        
        - **Checkbox "Incluir datos personales":** Nombres y emails
        - **Checkbox "Incluir comentarios textuales":** Respuestas abiertas
        - **Checkbox "Incluir análisis por segmento":** Desglose detallado
        - **Select "Formato de fecha":** DD/MM/YYYY o MM/DD/YYYY
- **CA-04:** Interactividad y Funcionalidades Avanzadas:
    
    **Filtros en Tiempo Real:**
    
    - Al cambiar cualquier filtro, las visualizaciones se actualizan automáticamente
    - Animación smooth de transición entre estados
    - Indicador de carga durante procesamiento
    - Badge con número de resultados actualizados
    
    **Gráficos Interactivos:**
    
    - **Hover Effects:** Tooltips con información detallada
    - **Click Actions:** Drill-down a datos más específicos
    - **Zoom:** Permitir zoom en gráficos para mejor visualización
    - **Legend Toggle:** Mostrar/ocultar categorías específicas
    
    **Comparaciones:**
    
    - **Comparar Períodos:** Seleccionar 2 rangos de fechas para comparar
    - **Comparar Segmentos:** Seleccionar 2 segmentos para comparar lado a lado
    - **Benchmark Institucional:** Comparar con promedio de otras encuestas similares
    
    **Anotaciones y Comentarios:**
    
    - **Agregar Nota:** Click en gráfico para agregar anotación personal
    - **Compartir Insights:** Generar link a gráfico específico con comentario
    - **Guardar Vista:** Guardar configuración actual de filtros y visualizaciones
    
    **Alertas y Notificaciones:**
    
    - **Baja Participación:** Alerta si < 30% después de 3 días
    - **Respuestas Atípicas:** Detectar outliers en tiempo de respuesta
    - **Tendencias Negativas:** Alerta si satisfacción disminuye vs período anterior
- **CA-05:** Responsive Design:
    - **Desktop (>1024px):**
        - Layout completo con todas las secciones visibles
        - Gráficos grandes con buena resolución
        - Panel de filtros fijo en lateral derecho
        - Navegación entre secciones con tabs
    - **Tablet (768px-1024px):**
        - Layout apilado verticalmente
        - Gráficos medianos con controles touch
        - Filtros colapsables en header
        - Scroll horizontal para gráficos anchos
    - **Mobile (<768px):**
        - Layout de una sola columna
        - Gráficos simplificados y optimizados para touch
        - Filtros en modal slide-up
        - Cards apiladas con swipe entre preguntas
        - Exportación limitada a formatos básicos

---

### **Validaciones de Negocio**

- **VN-01:** Solo usuarios autenticados con rol docente (con permisos) o director pueden acceder
- **VN-02:** Docente solo puede analizar resultados de sus encuestas (`autor_id = current_user`)
- **VN-03:** Director puede analizar resultados de todas las encuestas de la institución
- **VN-04:** La encuesta debe tener al menos 1 respuesta registrada para mostrar análisis
- **VN-05:** Los filtros de segmentación solo aplican si la encuesta original estaba segmentada
- **VN-06:** Las visualizaciones se actualizan en tiempo real al cambiar filtros
- **VN-07:** Los datos personales solo se muestran si el usuario tiene permisos de nivel director
- **VN-08:** Las exportaciones incluyen solo datos que el usuario tiene permiso de ver
- **VN-09:** Los enlaces compartidos son de solo lectura y expiran según configuración
- **VN-10:** Las anotaciones personales solo las ve el usuario que las crea
- **VN-11:** Las comparaciones solo se permiten entre períodos con datos suficientes
- **VN-12:** Los benchmarks institucionales solo están disponibles para directores
- **VN-13:** Las alertas automáticas se configuran según umbrales predefinidos
- **VN-14:** Los datos se cachean por 10 minutos para optimizar rendimiento
- **VN-15:** Todas las acciones de análisis registran log de auditoría

---

### **UI/UX**

- **UX-01:** Layout tipo dashboard analítico:
    
    ```
    ┌────────────────────────────────────────────────────────┐
    │  [←] Análisis: Satisfacción Q2              [📊X 📈Y% ⏱️Zm] │
    ├────────────────────────────────────────────────────────┤
    │  📊 Resumen General     [📅Filtros] [🎯Segmentación]   │
    │  ┌─────┬─────┬─────┬─────┐                              │
    │  │ 145 │ 78% │ 8.5m│ 2.5★│                              │
    │  │Resp │Part │Tiemp│Satis│                              │
    │  └─────┴─────┴─────┴─────┘                              │
    ├────────────────────────────────────────────────────────┤
    │  📊 Pregunta 1: ¿Satisfecho con el servicio?           │
    │  ┌─────────────────────────────────────────────────────┐ │
    │  │   [Gráfico de barras verticales con colores]       │ │
    │  │   😊😐😕                                      │ │
    │  └─────────────────────────────────────────────────────┘ │
    │  📝 Pregunta 2: Comentarios adicionales                │
    │  ┌─────────────────────────────────────────────────────┐ │
    │  │   [Nube de palabras + lista de respuestas]        │ │
    │  └─────────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────┘
    
    ```
    
    - Header sticky con métricas clave siempre visibles
    - Resumen general con KPIs importantes
    - Sección de filtros accesible y collapsible
    - Análisis detallado por pregunta con visualizaciones apropiadas
- **UX-02:** Diseño de visualizaciones por tipo de pregunta:
    - **Opción única:** Barras horizontales con porcentajes
    - **Opción múltiple:** Pie chart + barras verticales
    - **Escala:** Columnas con gradiente de colores
    - **Texto:** Nube de palabras + lista paginada
    - Colores institucionales consistentes en todos los gráficos
- **UX-03:** Interactividad de gráficos:
    - Hover effects con tooltips informativos
    - Click para drill-down a detalles
    - Legend toggles para mostrar/ocultar categorías
    - Zoom y pan en gráficos complejos
    - Animaciones smooth al cargar y actualizar
- **UX-04:** Panel de filtros intuitivo:
    - Agrupación lógica por tipo de filtro
    - Presets comunes para acciones frecuentes
    - Indicadores visuales de filtros activos
    - Actualización en tiempo real sin recargar página
    - Badge con contador de resultados filtrados
- **UX-05:** Diseño responsive de visualizaciones:
    - Desktop: Gráficos grandes con máximo detalle
    - Tablet: Gráficos medianos con controles touch
    - Mobile: Gráficos simplificados, swipe entre preguntas
    - Mantener legibilidad en todos los dispositivos
- **UX-06:** Exportación y compartición:
    - Botones prominentes con íconos claros
    - Modal de configuración de exportación
    - Previsualización antes de exportar
    - Confirmación visual cuando se completa exportación
    - Compartición con opciones de seguridad
- **UX-07:** Estados de carga y feedback:
    - Skeletons durante carga de gráficos
    - Spinners en actualizaciones de datos
    - Toast notifications para acciones exitosas
    - Alerts para errores con sugerencias de solución
    - Progress indicators para exportaciones largas
- **UX-08:** Accesibilidad en visualizaciones:
    - Contraste mínimo WCAG AA en todos los gráficos
    - Textos alternativos para gráficos (screen readers)
    - Navegación por teclado en todos los controles
    - Etiquetas descriptivas en todos los filtros
    - Zoom sin pérdida de calidad en gráficos vectoriales

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Cargar dashboard con estadísticas generales
- **EF-02:** Estado cargado: Mostrar resumen general + primera pregunta
- **EF-03:** Estado de navegación: Scroll entre preguntas con smooth scroll
- **EF-04:** Estado de filtros: Aplicar filtros y actualizar visualizaciones
- **EF-05:** Estado de interacción: Hover/click en gráficos para detalles
- **EF-06:** Estado de exportación: Mostrar modal de configuración y procesar
- **EF-07:** Estado de compartición: Generar enlace y copiar al clipboard
- **EF-08:** Estado de comparación: Mostrar vista side-by-side de períodos/segmentos
- **EF-09:** Estado de error: Alert con mensaje específico y opciones de recuperación
- **EF-10:** Estado de actualización: Refresh automático cada 10 minutos

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe estar autenticado y tener permisos de análisis
- **VE-02:** Encuesta debe existir y tener respuestas registradas
- **VE-03:** Rangos de fecha deben ser válidos (inicio <= fin)
- **VE-04:** Filtros de segmentación deben corresponder a segmentación original
- **VE-05:** Fecha de expiración de enlace compartido debe ser futura
- **VE-06:** Formatos de exportación deben ser válidos y disponibles

---

### **Mensajes de Error**

- "No tienes permisos para ver los resultados de esta encuesta"
- "Esta encuesta no tiene respuestas registradas aún"
- "Error al cargar los datos de análisis. Intenta nuevamente"
- "Los filtros seleccionados no producen resultados. Prueba con otros criterios"
- "Error al generar exportación. Intenta con un formato diferente"
- "El enlace para compartir ha expirado. Genera uno nuevo"
- "No se pueden comparar períodos sin datos suficientes"
- "Error al actualizar gráficos. Recarga la página"

---

### **Mensajes de Éxito**

- "✅ Análisis actualizado con nuevos datos"
- "✅ Filtros aplicados: X resultados encontrados"
- "✅ Exportación completada: descargando archivo..."
- "✅ Enlace copiado al portapapeles"
- "✅ Vista guardada correctamente"
- "✅ Comparación generada exitosamente"
- "✅ Anotación agregada al gráfico"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-USERS-65 (Permisos de docentes asignados)
    - HU-ENC-03 (Crear y Publicar Encuesta - prerequisite)
    - HU-ENC-04 (Gestionar Encuestas Propias - punto de acceso)
- **HU Siguientes:**
    - HU-ENC-06 (Notificaciones de Encuestas - alertas de baja participación)

---

### **Componentes y Estructura**

- **Tipo:** Página completa de dashboard (`/dashboard/encuestas/:id/resultados`)
- **Componentes principales:**
    - `ResultadosDashboardPage`: Componente contenedor principal
    - `ResultadosHeader`: Header sticky con título y métricas
    - `EstadisticasBadge`: Badge con 3 métricas clave
    - `ResumenGeneralCard`: Card con KPIs principales
    - `ParticipacionProgressBar`: Barra de progreso visual
    - `SegmentacionCharts`: Gráficos por nivel/grado/rol
    - `FiltrosAvanzadosPanel`: Panel de filtros collapsible
    - `FechaRangePicker`: Selector de rango de fechas
    - `SegmentacionFilters`: Filtros de nivel/grado/rol
    - `CalidadFilters`: Filtros de completitud y tiempo
    - `PreguntaAnalysisCard`: Card de análisis por pregunta
    - `OpcionUnicaChart`: Gráfico de barras horizontales
    - `OpcionMultiplePieChart`: Gráfico de pastel
    - `OpcionMultipleBarChart`: Gráfico de barras verticales
    - `EscalaColumnChart`: Gráfico de columnas con gradiente
    - `TextoRespuestasList`: Lista de respuestas textuales
    - `PalabrasNube`: Nube de palabras (opcional)
    - `RespondientesTable`: Tabla completa de respondientes
    - `VerRespuestaModal`: Modal con respuesta completa de usuario
    - `ExportacionModal`: Modal de configuración de exportación
    - `CompartirModal`: Modal para generar enlace compartido
    - `ComparacionView`: Vista side-by-side para comparaciones
    - `AnotacionesOverlay`: Overlay para agregar notas
    - `AlertasPanel`: Panel de alertas automáticas
    - `LazyLoadSkeleton`: Skeleton durante carga
    - `ToastNotification`: Toast de feedback
    - `ErrorAlert`: Componente de alertas de error
- **Librerías de visualización:**
    - **Recharts:** Para gráficos de barras, líneas, áreas
    - **Chart.js:** Para gráficos de pastel más complejos
    - **D3.js:** Para visualizaciones personalizadas (nube de palabras)
    - **React-Spring:** Para animaciones smooth
- **Endpoints API:**
    - `GET /encuestas/:id/resultados/estadisticas` - Estadísticas generales
    - `GET /encuestas/:id/resultados/respuestas?filtros={...}` - Respuestas filtradas
    - `GET /encuestas/:id/resultados/analisis-pregunta/:pregunta_id` - Análisis por pregunta
    - `GET /encuestas/:id/resultados/respondientes?filtros={...}` - Lista de respondientes
    - `GET /encuestas/:id/resultados/segmentacion` - Datos por segmento
    - `GET /encuestas/:id/resultados/tendencias` - Evolución temporal
    - `POST /encuestas/:id/resultados/exportar` - Generar exportación
    - `POST /encuestas/:id/resultados/compartir` - Generar enlace compartido
    - `POST /encuestas/:id/resultados/anotaciones` - Guardar anotación personal
    - `GET /encuestas/:id/resultados/comparar` - Datos para comparación
    - `GET /encuestas/:id/resultados/benchmark` - Datos institucionales para benchmark

---

### **Reglas de Negocio Específicas del Módulo (RN-ENC)**

- **RN-ENC-111:** Usuario debe estar autenticado y tener permisos de análisis para acceder
- **RN-ENC-112:** Docente solo puede analizar encuestas donde `autor_id = current_user`
- **RN-ENC-113:** Director puede analizar todas las encuestas de la institución sin restricciones
- **RN-ENC-114:** El dashboard solo está disponible si la encuesta tiene al menos 1 respuesta
- **RN-ENC-115:** Las estadísticas se calculan en tiempo real desde `respuestas_encuestas`
- **RN-ENC-116:** Los filtros de segmentación solo se muestran si la encuesta estaba segmentada originalmente
- **RN-ENC-117:** El tiempo promedio de respuesta excluye respuestas con tiempo < 1 minuto (errores)
- **RN-ENC-118:** La tasa de participación se calcula como (respuestas / destinatarios) * 100
- **RN-ENC-119:** Los gráficos de opción múltiple muestran conteo de selecciones (puede sumar > 100%)
- **RN-ENC-120:** El promedio de escala se calcula solo con respuestas que tienen valor numérico
- **RN-ENC-121:** Las respuestas textuales se procesan para eliminar HTML y caracteres especiales
- **RN-ENC-122:** La nube de palabras excluye palabras comunes (stopwords) en español
- **RN-ENC-123:** Los datos personales (nombres, emails) solo se muestran a directores
- **RN-ENC-124:** Las exportaciones a Excel incluyen todos los datos visibles en el dashboard
- **RN-ENC-125:** Las exportaciones a PDF incluyen gráficos en alta resolución (300 DPI)
- **RN-ENC-126:** Los enlaces compartidos son de solo lectura y no permiten modificar filtros
- **RN-ENC-127:** Los enlaces compartidos expiran según configuración (7/30 días o ilimitado)
- **RN-ENC-128:** Las anotaciones personales se guardan por usuario y no son visibles para otros
- **RN-ENC-129:** Las comparaciones requieren mínimo 5 respuestas en cada período para ser válidas
- **RN-ENC-130:** Los benchmarks institucionales solo están disponibles para directores
- **RN-ENC-131:** Las alertas de baja participación se activan si < 30% después de 72 horas
- **RN-ENC-132:** Las alertas de satisfacción baja se activan si promedio < 2.5 en escalas
- **RN-ENC-133:** El dashboard se actualiza automáticamente cada 10 minutos si está abierto
- **RN-ENC-134:** Los datos se cachean por 10 minutos para optimizar rendimiento
- **RN-ENC-135:** Todas las acciones de análisis registran log con usuario, fecha y acción
- **RN-ENC-136:** Los gráficos son responsivos y se adaptan al tamaño del contenedor
- **RN-ENC-137:** Los colores de gráficos siguen paleta institucional con buen contraste
- **RN-ENC-138:** Las animaciones son opcionales y respetan preferencias de movimiento reducido
- **RN-ENC-139:** El dashboard es accesible y cumple con WCAG 2.1 nivel AA
- **RN-ENC-140:** Las exportaciones grandes (>10MB) se generan en background y se notifican por email


---

# **Historia de Usuario Detallada - HU-ENC-06**

## **PREREQUISITOS Y DEPENDENCIAS**

### **Entidades de Base de Datos Involucradas:**

1. **usuarios** - Destinatarios de notificaciones (padres/docentes/directores)
2. **encuestas** - Encuesta publicada que genera notificaciones
3. **notificaciones** - Registro de notificaciones enviadas
4. **respuestas_encuestas** - Para verificar si usuario ya respondió (no enviar recordatorios)
5. **estudiantes** - Hijos de padres (para contexto en notificaciones)
6. **relaciones_familiares** - Vinculación padre-hijo (para segmentación)
7. **asignaciones_docente_curso** - Cursos (para determinar destinatarios)
8. **permisos_docentes** - Validación de permisos de envío

### **Módulos Previos Requeridos:**

- **Módulo de Autenticación** (Semanas 3-4) - Sistema de login y gestión de sesiones
- **Módulo de Gestión de Usuarios** (Semana 5) - Permisos y relaciones configurados
- **HU-ENC-03** - Creación y Publicación Encuesta (disparador principal)
- **Servicio de WhatsApp** - Integración con Meta WhatsApp Cloud API
- **Servicio de Notificaciones** - Sistema de notificaciones internas

### **Roles Involucrados:**

- **Padre:** Recibe notificaciones de encuestas dirigidas a sus hijos
- **Docente:** Recibe notificaciones de encuestas institucionales dirigidas a docentes
- **Director:** Recibe notificaciones de todas las encuestas institucionales
- **Sistema:** Procesa automáticamente envío masivo de notificaciones

---

## **HU-ENC-06 — Notificaciones de Nuevas Encuestas**

**Título:** Sistema integral de notificaciones automáticas multi-canal para encuestas publicadas con recordatorios inteligentes

**Historia:**

> Como usuario, quiero recibir notificaciones inmediatas cuando se publiquen nuevas encuestas dirigidas a mí, además de recordatorios oportunos antes del vencimiento, para asegurar que responda oportunamente y no pierda la oportunidad de proporcionar mi feedback a la institución.
> 

---

### **Criterios de Aceptación**

**Condiciones Funcionales:**

- **CA-01:** Disparador Automático al Publicar Encuesta:
    
    **Momento del Envío:**
    
    - Inmediatamente después de publicación exitosa en HU-ENC-03
    - Después de confirmación de éxito en modal de publicación
    - En background (asíncrono) para no bloquear UI del publicador
    
    **Proceso Backend:**
    
    ```sql
    -- 1. Obtener destinatarios según segmentación
    SELECT DISTINCT u.id, u.nombre_completo, u.email, u.telefono, u.rol
    FROM usuarios u
    LEFT JOIN relaciones_familiares rf ON u.id = rf.padre_id
    LEFT JOIN estudiantes e ON rf.estudiante_id = e.id
    WHERE 
      -- Lógica de segmentación según encuesta.publico_objetivo
      (encuesta.publico_objetivo @> '["todos"]' 
       OR (encuesta.publico_objetivo @> '["padres"]' AND u.rol = 'padre')
       OR (encuesta.publico_objetivo @> '["docentes"]' AND u.rol = 'docente'))
      -- Filtrar por nivel/grado/curso si aplica
      AND (encuesta.niveles_objetivo IS NULL 
           OR e.nivel IN (SELECT jsonb_array_elements_text(encuesta.niveles_objetivo)))
      -- Excluir usuarios que ya respondieron
      AND u.id NOT IN (
        SELECT usuario_id FROM respuestas_encuestas 
        WHERE encuesta_id = :encuesta_id
      );
    
    -- 2. Insertar notificaciones en lote
    INSERT INTO notificaciones (
      usuario_id, tipo, titulo, contenido, canal, estado_plataforma, 
      fecha_creacion, url_destino, referencia_id, año_academico, datos_adicionales
    ) VALUES 
      -- Batch insert para todos los destinatarios
    ```
    
    **Confirmación de Proceso:**
    
    - Actualizar estado de encuesta a "notificaciones_enviadas"
    - Registrar en log: "X notificaciones creadas para encuesta Y"
    - Notificar al publicador sobre resultado del envío
- **CA-02:** Notificaciones Multi-Canal:
    
    **Canal de Plataforma (Notificaciones Internas):**
    
    - **Badge en Módulo:** Actualizar contador de encuestas pendientes en ícono del módulo
    - **Notificación en Centro:** Entrada en centro de notificaciones del dashboard
    - **Toast Notification (si está online):**
        - Título: "📋 Nueva encuesta disponible"
        - Mensaje: "[Título de la encuesta]"
        - Submensaje: "Vence en [X] días"
        - Acción: "Ver ahora" → Redirige a HU-ENC-01
        - Duración: 5 segundos auto-dismiss
        - Sonido: Notificación sutil (configurable)
    
    **Canal de WhatsApp (Mensajes Externos):**
    
    - **Formato del Mensaje:**
        ```
        📋 *NUEVA ENCUESTA DISPONIBLE*
        
        *[Título de la encuesta]*
        
        [Descripción truncada a 150 caracteres...]
        
        📅 *Vence:* DD/MM/YYYY
        ⏰ *Tiempo estimado:* X minutos
        
        📱 *Responder ahora:* [URL corta]
        
        _Institución Educativa [Nombre]_
        ```
    
    - **Características del Envío:**
        - URL acortada con tracking de clics
        - Personalización con nombre del destinatario
        - Formato con negritas y emojis para mejor legibilidad
        - Firma institucional
    
    **Canal de Email (Opcional - Futuro):**
    
    - **Asunto:** "Nueva encuesta: [Título]"
    - **Contenido HTML:** Template institucional con branding
    - **Botón CTA:** "Responder Encuesta" con enlace directo
    - **Preheader:** "Tienes X minutos para completar esta encuesta"
- **CA-03:** Sistema de Recordatorios Inteligentes:
    
    **Recordatorio de Vencimiento Próximo:**
    
    - **Timing:** 72 horas antes del vencimiento
    - **Condición:** Solo para usuarios que no han respondido
    - **Frecuencia:** Máximo 1 recordatorio por encuesta
    
    **Recordatorio Final (Últimas 24 horas):**
    
    - **Timing:** 24 horas antes del vencimiento
    - **Condición:** Solo para usuarios críticos (padres de grados importantes)
    - **Urgencia:** Mensaje con tono más urgente
    
    **Recordatorio de Última Hora:**
    
    - **Timing:** 4 horas antes del vencimiento
    - **Condición:** Solo para encuestas críticas institucionales
    - **Autorización:** Requiere aprobación explícita del director
    
    **Lógica de Supresión:**
    
    - No enviar recordatorios si usuario ya respondió
    - No enviar más de 1 recordatorio por día
    - Respetar preferencias de notificación del usuario
    - Suprimir automáticamente si encuesta ya está cerrada
- **CA-04:** Personalización y Segmentación de Notificaciones:
    
    **Personalización por Rol:**
    
    **Para Padres:**
    - Saludo: "Estimado/a [Nombre Padre/Madre]"
    - Contexto: "Tienes una nueva encuesta sobre [grado/hijo]"
    - Beneficio: "Tu opinión nos ayuda a mejorar la educación de [Nombre Hijo]"
    
    **Para Docentes:**
    - Saludo: "Estimado/a Profesor/a [Nombre]"
    - Contexto: "Nueva encuesta institucional sobre [tema]"
    - Beneficio: "Tu feedback como docente es valioso para nuestra mejora continua"
    
    **Para Directores:**
    - Saludo: "Estimado/a Director/a [Nombre]"
    - Contexto: "Encuesta de seguimiento institucional"
    - Beneficio: "Tu visión estratégica es fundamental para la toma de decisiones"
    
    **Segmentación por Contenido:**
    
    - **Grado Específico:** Mencionar grado/hijo específico
    - **Curso Específico:** Referenciar curso y asignatura
    - **Nivel Educativo:** Adaptar lenguaje según nivel (inicial, primaria, secundaria)
    - **Tipo de Contenido:** Ajustar tono (académico, operativo, satisfacción)
- **CA-05:** Gestión de Estados y Seguimiento:
    
    **Estados de Notificación:**
    
    - **Pendiente:** Recién creada, en cola para envío
    - **Enviada:** Enviada al canal correspondiente
    - **Entregada:** Confirmación de entrega (WhatsApp)
    - **Leída:** Usuario abrió la notificación
    - **Fallida:** Error en el envío
    - **Reintentando:** Programada para reintento
    - **Cancelada:** Cancelada manualmente
    
    **Métricas de Seguimiento:**
    
    - **Tasa de Entrega:** % de notificaciones entregadas exitosamente
    - **Tasa de Apertura:** % de notificaciones leídas
    - **Tasa de Clic:** % de clics en enlace de respuesta
    - **Tiempo a Respuesta:** Tiempo promedio desde notificación hasta respuesta
    - **Conversion por Canal:** Efectividad por canal (plataforma vs WhatsApp)
    
    **Panel de Seguimiento:**
    
    - **Para Publicadores:** Vista de estado de envío de sus encuestas
    - **Para Administradores:** Dashboard global de métricas de notificaciones
    - **Alertas:** Notificaciones de tasas bajas o problemas de entrega
- **CA-06:** Manejo de Errores y Reintentos:
    
    **Política de Reintentos:**
    
    - **Intento 1:** Inmediato (falla temporal)
    - **Intento 2:** 5 minutos después
    - **Intento 3:** 30 minutos después
    - **Intento 4:** 2 horas después
    - **Intento 5:** 6 horas después
    - **Máximo:** 5 intentos, luego marca como "Fallida"
    
    **Tipos de Error y Manejo:**
    
    - **Error Temporal (WhatsApp):** Reintentar con backoff exponencial
    - **Usuario Bloqueado:** Marcar como "No disponible" y no reintentar
    - **Teléfono Inválido:** Registrar para corrección futura
    - **Cuota Excedida:** Esperar y reintentar en siguiente ventana
    - **Error Crítico:** Notificar administrador inmediatamente
    
    **Recuperación Manual:**
    
    - **Reenvío Individual:** Permitir reenviar a usuarios específicos
    - **Reenvío Masivo:** Opción para reenviar a todos los fallidos
    - **Corrección de Datos:** Interface para actualizar teléfonos/emails inválidos
    - **Exportación de Errores:** Lista de usuarios con problemas para corrección
- **CA-07:** Preferencias y Configuración de Usuario:
    
    **Centro de Preferencias de Notificación:**
    
    - **Canales Activos:** Checkbox para plataforma, WhatsApp, email
    - **Horarios de Recepción:**
        - Laborales: 8:00 AM - 6:00 PM
        - Fines de semana: 10:00 AM - 2:00 PM
        - No molestar: Configurar horas específicas
    - **Frecuencia Máxima:** Límite de notificaciones por día
    - **Tipos de Notificación:** 
        - ✅ Nuevas encuestas (siempre activo)
        - ⚙️ Recordatorios (configurable)
        - 📊 Resultados (opcional)
    
    **Respeto de Preferencias:**
    
    - Validar preferencias antes de cada envío
    - Respetar horarios de "No molestar"
    - No exceder frecuencia máxima diaria
    - Adaptar tono según historial de interacción
    
    **Gestión de Suscripción:**
    
    - **Suspender Temporalmente:** Pausar notificaciones por X días
    - **Suspender por Tipo:** Desactivar solo recordatorios
    - **Reactivación Automática:** Volver a activar después de período
    - **Confirmación por Email:** Confirmar cambios importantes

---

### **Validaciones de Negocio**

- **VN-01:** Las notificaciones se envían solo a usuarios con segmentación correcta
- **VN-02:** No se envían notificaciones a usuarios que ya respondieron la encuesta
- **VN-03:** Los recordatorios respetan preferencias de usuario y horarios configurados
- **VN-04:** Las notificaciones de WhatsApp solo se envían a números válidos y verificados
- **VN-05:** El contenido de notificaciones se personaliza según rol y contexto del usuario
- **VN-06:** Las URLs en notificaciones son seguras y tienen tracking de clics
- **VN-07:** No se exceden los límites de cuota de la API de WhatsApp
- **VN-08:** Los errores de envío se registran y se reintentan según política
- **VN-09:** Las notificaciones fallidas después de 5 intentos se marcan como permanently failed
- **VN-10:** El sistema de notificaciones no bloquea la publicación de encuestas
- **VN-11:** Las notificaciones se envían en background para no afectar rendimiento
- **VN-12:** Los recordatorios automáticos se detienen si la encuesta se cierra manualmente
- **VN-13:** Las preferencias de usuario se validan antes de cada envío
- **VN-14:** Las estadísticas de notificaciones se actualizan en tiempo real
- **VN-15:** El sistema cumple con regulaciones de privacidad y consentimiento

---

### **UI/UX**

- **UX-01:** Centro de Notificaciones Integrado:
    
    ```
    ┌────────────────────────────────────────────────────────┐
    │  🔔 [3]                                              👤 [Menu] │
    ├────────────────────────────────────────────────────────┤
    │  📋 NOTIFICACIONES                                    │
    │  ┌─────────────────────────────────────────────────────┐ │
    │  │ 📋 Nueva encuesta: Satisfacción Q2       [Hace 5m]  │ │
    │  │ Vence en 3 días • Responder ahora →               │ │
    │  ├─────────────────────────────────────────────────────┤ │
    │  │ 📊 Resultados disponibles: Comunicación   [Ayer]   │ │
    │  │ 45 respuestas • Ver análisis →                    │ │
    │  └─────────────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────────┘
    
    ```
    
    - Badge con contador de notificaciones no leídas
    - Lista cronológica con acciones directas
    - Indicadores visuales de tipo y urgencia
    - Botones de acción directos sin navegación extra
- **UX-02:** Diseño de Toast Notifications:
    - **Posición:** Esquina superior derecha
    - **Duración:** 5 segundos auto-dismiss (configurable)
    - **Animación:** Slide-in desde derecha con fade
    - **Contenido:** Título grande + mensaje + acción principal
    - **Colores:** 
        - Nueva encuesta: Azul `bg-info`
        - Recordatorio: Amarillo `bg-warning`
        - Urgente: Rojo `bg-error`
    - **Sonido:** Sutil y diferenciable por tipo
- **UX-03:** Badges de Contador Contextuales:
    - **Ícono del módulo:** Badge circular rojo con número
    - **Actualización en tiempo real:** Incrementa/decrementa inmediatamente
    - **Animación:** Pulse cuando hay nuevas notificaciones
    - **Tooltip:** "X encuestas pendientes de respuesta"
    - **Reset automático:** Al hacer clic o marcar como leídas
- **UX-04:** Preferencias de Notificación Intuitivas:
    - **Toggle switches** grandes y accesibles
    - **Time pickers** visuales para configurar horarios
    - **Preview** de cómo se verán las notificaciones
    - **Confirmación visual** al guardar cambios
    - **Resumen** de configuración actual
- **UX-05:** Estados Visuales de Envío:
    - **Enviando:** Spinner con progreso
    - **Enviado:** Check verde con timestamp
    - **Fallido:** Icono rojo con opción de reintentar
    - **Pendiente:** Reloj amarillo para programados
    - **Indicadores de progreso** para envíos masivos
- **UX-06:** Diseño Responsivo de Notificaciones:
    - **Desktop:** Centro de notificaciones en sidebar
    - **Tablet:** Dropdown desde header con lista completa
    - **Mobile:** Pantalla completa con swipe gestures
    - **Touch-friendly:** Botones grandes y espaciados
- **UX-07:** Feedback de Acciones:
    - **Marcar como leída:** Animación smooth de fade
    - **Eliminar:** Deslizamiento lateral con confirmación
    - **Responder:** Transición directa a formulario
    - **Configurar:** Modal con preferencias
- **UX-08:** Accesibilidad en Notificaciones:
    - **Screen reader:** Anuncios de nuevas notificaciones
    - **Keyboard navigation:** Navegación completa por teclado
    - **High contrast:** Modo alto contraste disponible
    - **Reduced motion:** Opción para desactivar animaciones

---

### **Estados y Flujo**

- **EF-01:** Estado inicial: Publicación de encuesta exitosa
- **EF-02:** Estado de procesamiento: Creación de notificaciones en background
- **EF-03:** Estado de envío: Envío masivo a través de canales
- **EF-04:** Estado de entrega: Confirmación de recepción en cada canal
- **EF-05:** Estado de interacción: Usuario abre notificación o hace clic
- **EF-06:** Estado de conversión: Usuario completa la encuesta
- **EF-07:** Estado de recordatorio: Envío programado de recordatorios
- **EF-08:** Estado de error: Manejo de fallos y reintentos
- **EF-09:** Estado de seguimiento: Actualización de métricas
- **EF-10:** Estado de completitud: Todos los destinatarios respondieron o encuesta vencida

---

### **Validaciones de Entrada**

- **VE-01:** Usuario debe tener segmentación válida para la encuesta
- **VE-02:** Teléfono de WhatsApp debe estar verificado y en formato internacional
- **VE-03:** Email debe tener formato válido y estar confirmado
- **VE-04:** Contenido de notificación no debe exceder límites de caracteres
- **VE-05:** URLs en notificaciones deben ser seguras y válidas
- **VE-06:** Horarios de envío deben respetar preferencias de usuario
- **VE-07:** Frecuencia de envío no debe exceder límites configurados

---

### **Mensajes de Error**

- "Error al enviar notificaciones por WhatsApp. Se intentará más tarde."
- "El número de teléfono no es válido. Contacta al administrador."
- "Cuota de WhatsApp excedida. Las notificaciones se enviarán mañana."
- "No se pudieron enviar X notificaciones. Revisa la lista de errores."
- "Error en el sistema de notificaciones. Contacta soporte técnico."
- "Las preferencias de notificación no pudieron guardarse. Intenta nuevamente."

---

### **Mensajes de Éxito**

- "✅ Notificaciones enviadas a X destinatarios"
- "✅ Recordatorio programado para DD/MM/YYYY"
- "✅ Preferencias de notificación actualizadas"
- "✅ X usuarios respondieron después del recordatorio"
- "✅ Todas las notificaciones fueron entregadas exitosamente"
- "📊 Tasa de apertura: Y% • Tasa de respuesta: Z%"

---

### **HU Relacionadas**

- **HU Previas:**
    - HU-AUTH-01 (Autenticación de usuarios)
    - HU-USERS-04 (Relaciones padre-hijo configuradas)
    - HU-ENC-03 (Crear y Publicar Encuesta - disparador principal)
- **HU Siguientes:**
    - HU-ENC-01 (Responder Encuesta - conversión)
    - HU-ENC-02 (Ver Mis Respuestas - post-conversión)
    - HU-ENC-05 (Ver Análisis de Resultados - seguimiento)

---

### **Componentes y Estructura**

- **Tipo:** Sistema global multi-canal (backend + frontend)
- **Componentes principales:**
    - `NotificacionService`: Servicio central de gestión de notificaciones
    - `WhatsAppService`: Integración con Meta WhatsApp Cloud API
    - `EmailService`: Servicio de envío de emails (futuro)
    - `NotificacionProcessor`: Procesador de envíos masivos
    - `RetryQueueManager`: Gestor de colas de reintentos
    - `PreferencesManager`: Gestor de preferencias de usuario
    - `NotificationCenter`: Centro de notificaciones en UI
    - `NotificationBadge`: Badge de contador en header
    - `ToastNotification`: Toast flotante de notificaciones
    - `NotificationItem`: Item individual en lista de notificaciones
    - `NotificationActions`: Botones de acción por notificación
    - `PreferencesModal`: Modal de configuración de preferencias
    - `ChannelToggle`: Toggle para activar/desactivar canales
    - `TimePicker`: Selector de horarios de recepción
    - `FrequencySlider**: Slider para configurar frecuencia máxima
    - `NotificationStats`: Panel de estadísticas de envío
    - `DeliveryStatus`: Indicador visual de estado de entrega
    - `RetryButton`: Botón para reintentar envíos fallidos
    - `ErrorList`: Lista de errores con opciones de corrección
    - `TrackingService`: Servicio de tracking de clics y aperturas
    - `SchedulerService`: Programador de recordatorios automáticos
- **Endpoints API:**
    - `POST /notificaciones/encuesta-publicada` - Disparar envío masivo
    - `POST /notificaciones/recordatorio` - Enviar recordatorios
    - `GET /notificaciones/usuario/:id` - Obtener notificaciones de usuario
    - `PATCH /notificaciones/:id/leida` - Marcar como leída
    - `DELETE /notificaciones/:id` - Eliminar notificación
    - `GET /notificaciones/estadisticas/:encuesta_id` - Estadísticas de envío
    - `POST /notificaciones/reintentar/:id` - Reintentar envío fallido
    - `GET /notificaciones/preferencias/:usuario_id` - Obtener preferencias
    - `PATCH /notificaciones/preferencias/:usuario_id` - Actualizar preferencias
    - `POST /notificaciones/track/click` - Registrar clic en enlace
    - `POST /notificaciones/track/open` - Registrar apertura
    - `GET /notificaciones/errores/:encuesta_id` - Lista de errores de envío
    - `POST /notificaciones/corregir-datos` - Corregir datos de contacto inválidos
- **Servicios Externos:**
    - **Meta WhatsApp Cloud API:** Envío de mensajes WhatsApp
    - **SendGrid/AWS SES:** Envío de emails (futuro)
    - **URL Shortener:** Acortamiento y tracking de enlaces
    - **Push Notifications:** Notificaciones push (futuro)

---

### **Reglas de Negocio Específicas del Módulo (RN-ENC)**

- **RN-ENC-141:** Las notificaciones se envían automáticamente al publicar encuesta
- **RN-ENC-142:** Solo se notifica a usuarios con segmentación correcta según encuesta
- **RN-ENC-143:** No se envían notificaciones a usuarios que ya respondieron
- **RN-ENC-144:** Las notificaciones se envían en background sin bloquear UI
- **RN-ENC-145:** El contenido se personaliza según rol y contexto del usuario
- **RN-ENC-146:** Los recordatorios se envían 72 horas antes del vencimiento
- **RN-ENC-147:** Se respeta un máximo de 1 recordatorio por encuesta por día
- **RN-ENC-148:** Las preferencias de usuario se validan antes de cada envío
- **RN-ENC-149:** Los horarios de "No molestar" se respetan estrictamente
- **RN-ENC-150:** Los errores de WhatsApp se reintentan con backoff exponencial
- **RN-ENC-151:** Después de 5 intentos fallidos, la notificación se marca como permanentemente fallida
- **RN-ENC-152:** Las URLs en notificaciones tienen tracking de clics y expiran según configuración
- **RN-ENC-153:** El badge de contador se actualiza en tiempo real vía WebSocket
- **RN-ENC-154:** Las notificaciones internas se mantienen por 30 días en el centro
- **RN-ENC-155:** Las notificaciones de WhatsApp se limitan a 160 caracteres
- **RN-ENC-156:** El sistema no envía más de 10 notificaciones por día por usuario
- **RN-ENC-157:** Las notificaciones urgentes pueden exceder límites con autorización del director
- **RN-ENC-158:** Los usuarios pueden suspender notificaciones por máximo 30 días
- **RN-ENC-159:** Las estadísticas de envío se actualizan cada 5 minutos
- **RN-ENC-160:** El sistema cumple con GDPR y regulaciones de consentimiento
- **RN-ENC-161:** Las notificaciones se registran en logs de auditoría con timestamp
- **RN-ENC-162:** El contenido de notificaciones se sanitiza para prevenir XSS
- **RN-ENC-163:** Los templates de notificación soportan variables dinámicas
- **RN-ENC-164:** El sistema detecta y previene envíos duplicados al mismo usuario
- **RN-ENC-165:** Las notificaciones programadas se cancelan automáticamente si la encuesta se cierra
- **RN-ENC-166:** El sistema envía notificación al publicador sobre el resultado del envío masivo
- **RN-ENC-167:** Las tasas de conversión se calculan por canal y tipo de notificación
- **RN-ENC-168:** El sistema optimiza horarios de envío según patrones de apertura del usuario
- **RN-ENC-169:** Las notificaciones fallidas por datos incorrectos generan alertas administrativas
- **RN-ENC-170:** El sistema mantiene estadísticas históricas para mejorar efectividad futura
