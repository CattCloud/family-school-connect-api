
## 🎯 **PROPUESTA DE HU SIMPLIFICADAS - MVP**

### **1️⃣ HU-ENC-00 — Panel de Encuestas (Padre / Docente / Director)**

> Como usuario, quiero ver un panel organizado con encuestas activas, respondidas y vencidas en formato de tarjetas para gestionar mis encuestas pendientes y consultar mi historial de respuestas.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Vista de tarjetas con encuestas en 3 pestañas: Activas, Respondidas, Vencidas
- Cada tarjeta muestra: título, descripción, fecha de vencimiento, estado, número de respuestas (solo creador)
- Filtros: por estado, fecha de vencimiento, tipo
- Búsqueda por título o descripción
- Segmentación automática según rol/grado/nivel del usuario

**Diferencias por rol:**
- **Padre/Docente sin permisos:** Solo ve encuestas dirigidas a ellos
- **Docente con permisos:** Ve encuestas dirigidas a él + las que creó (con badge "Mis encuestas")
- **Director:** Ve todas las encuestas institucionales + las que creó

---

### **2️⃣ HU-ENC-01 — Responder Encuesta (Padre / Docente / Director)**

> Como usuario, quiero responder encuestas con diferentes tipos de preguntas de forma intuitiva para proporcionar feedback a la institución educativa.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Formulario dinámico que renderiza 5 tipos de preguntas:
  1. Texto corto (input de 1 línea)
  2. Texto largo (textarea)
  3. Opción única (radio buttons)
  4. Opción múltiple (checkboxes)
  5. Escala de satisfacción (1-5 con labels: Muy insatisfecho → Muy satisfecho)
- Validación de campos obligatorios
- Progress bar visual (pregunta X de Y)
- Botón "Enviar Respuestas" habilitado solo si todas las preguntas obligatorias están respondidas
- Confirmación visual tras envío (toast + redirección a panel)
- Bloqueo automático de encuesta después de responder (no editable)

---

### **3️⃣ HU-ENC-02 — Ver Mis Respuestas (Padre / Docente / Director)**

> Como usuario, quiero consultar mis respuestas a encuestas ya completadas para recordar el feedback que proporcioné.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Vista de detalle de respuestas propias
- Presentación ordenada por pregunta con respuesta dada
- Fecha y hora de envío de respuesta
- Indicador de encuesta respondida (check verde)
- No editable (solo lectura)

---

### **4️⃣ HU-ENC-03 — Crear y Publicar Encuesta (Docente con permisos / Director)**

> Como docente/director con permisos, quiero crear encuestas con diferentes tipos de preguntas y segmentar audiencia para recopilar feedback estructurado de padres y docentes.

**Rol:** Docente (con permisos), Director  
**Funcionalidad principal:**
- Wizard de 3 pasos:
  1. **Información básica:** Título, descripción, fecha de vencimiento
  2. **Preguntas:** Constructor de preguntas con 5 tipos soportados
  3. **Audiencia y publicación:** Segmentación + preview + publicar
- Constructor de preguntas:
  - Botón "➕ Agregar Pregunta" abre modal
  - Modal con: texto de pregunta, tipo de pregunta, obligatoria (checkbox), opciones (si aplica)
  - Drag & drop para reordenar preguntas
  - Preview en tiempo real
  - Editar/eliminar preguntas antes de publicar
- Segmentación similar a comunicados (nivel, grado, curso, rol)
- Guardado como borrador
- Publicación inmediata o programada
- Notificaciones automáticas (WhatsApp + plataforma)

**Diferencias por rol:**
- **Docente:** Solo puede crear si tiene permisos activos
- **Docente:** Solo puede segmentar a padres de sus grados/cursos asignados
- **Director:** Acceso total sin restricciones

---

### **5️⃣ HU-ENC-04 — Gestionar Encuestas Propias (Docente con permisos / Director)**

> Como docente/director, quiero gestionar encuestas que he creado para mantener organizadas mis encuestas y controlar su estado.

**Rol:** Docente (con permisos), Director  
**Funcionalidad principal:**
- Lista de encuestas propias con filtros
- Ver estadísticas básicas (total de respuestas, % de participación)
- Cerrar encuesta anticipadamente (antes de fecha de vencimiento)
- Editar encuesta (solo si no tiene respuestas aún)
- Eliminar encuesta (confirmación obligatoria)
- Reabrir encuesta vencida (extender fecha de vencimiento)

**Diferencias por rol:**
- **Docente:** Solo gestiona sus propias encuestas
- **Director:** Gestiona todas las encuestas de la institución

---

### **6️⃣ HU-ENC-05 — Ver Análisis de Resultados (Docente con permisos / Director)**

> Como docente/director, quiero ver análisis visual de resultados de mis encuestas para evaluar el feedback recibido y tomar decisiones informadas.

**Rol:** Docente (con permisos), Director  
**Funcionalidad principal:**
- Dashboard de análisis con:
  - Resumen general: total de respuestas, % de participación, tiempo promedio de respuesta
  - Análisis por pregunta según tipo:
    - **Texto corto/largo:** Listado textual completo
    - **Opción única:** Gráfico de barras horizontales con conteos y %
    - **Opción múltiple:** Gráfico de pastel con distribución
    - **Escala 1-5:** Gráfico de columnas + promedio general
  - Filtros: por fecha de respuesta, grado (si segmentado)
  - Lista de usuarios que respondieron (con timestamps)
  - Lista de usuarios pendientes de responder


---

### **7️⃣ HU-ENC-06 — Notificaciones de Nuevas Encuestas (Padre / Docente / Director)**

> Como usuario, quiero recibir notificaciones cuando se publiquen nuevas encuestas dirigidas a mí para responder oportunamente.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Notificación automática al publicar encuesta (plataforma + WhatsApp)
- Badge en módulo de encuestas con contador de pendientes
- Toast notification si está en sesión activa
- Recordatorio automático 3 días antes del vencimiento (si no respondió)

---

## ⚙️ **RESUMEN ESTRUCTURAL - MVP**

| # | Código | Nombre resumido | Rol | Tipo de Vista | Prioridad |
|---|--------|-----------------|-----|---------------|-----------|
| 1 | HU-ENC-00 | Panel de Encuestas | Padre / Docente / Director | Página principal | ⭐ Alta |
| 2 | HU-ENC-01 | Responder Encuesta | Padre / Docente / Director | Formulario dinámico | ⭐ Alta |
| 3 | HU-ENC-02 | Ver Mis Respuestas | Padre / Docente / Director | Página de detalle | 🟡 Media |
| 4 | HU-ENC-03 | Crear y Publicar Encuesta | Docente / Director | Wizard (3 pasos) | ⭐ Alta |
| 5 | HU-ENC-04 | Gestionar Encuestas Propias | Docente / Director | Página de gestión | 🟡 Media |
| 6 | HU-ENC-05 | Ver Análisis de Resultados | Docente / Director | Dashboard de métricas | ⭐ Alta |
| 7 | HU-ENC-06 | Notificaciones de Encuestas | Padre / Docente / Director | Global (backend + UI) | ⭐ Alta |

---

## 🚀 **FUNCIONALIDADES FUTURAS (Post-MVP)**

| Código | Nombre | Descripción |
|--------|--------|-------------|
| HU-ENC-07 | Plantillas de encuestas | Guardar y reutilizar estructuras de encuestas frecuentes |
| HU-ENC-08 | Encuestas anónimas | Permitir respuestas sin identificación del usuario |
| HU-ENC-09 | Lógica condicional | Mostrar preguntas según respuestas anteriores |
| HU-ENC-10 | Exportación avanzada | Excel con tablas dinámicas, gráficos avanzados |
| HU-ENC-11 | Análisis comparativo | Comparar resultados entre encuestas similares |
| HU-ENC-12 | Recordatorios automáticos | Sistema de recordatorios programados |

---

## 💡 **BENEFICIOS DE ESTA ESTRUCTURA**

✅ **Eliminaste duplicidad:** HU-25, HU-26, HU-27 del padre se unifican en HU-ENC-00, HU-ENC-01, HU-ENC-02  
✅ **Componentes reutilizables:** Panel y formulario funcionan igual para todos los roles (solo cambian permisos)  
✅ **Escalabilidad clara:** Funcionalidades futuras bien definidas sin romper MVP  
✅ **API simplificada:** Endpoints comunes, filtrado por rol en backend  
✅ **Permisos claros:** Sistema de permisos documentado desde el inicio  

---

## 🔸 **DECISIONES CLAVE DEL MVP**

1. **5 tipos de preguntas:** Texto corto, texto largo, opción única, opción múltiple, escala 1-5
2. **Preguntas en JSON:** Almacenadas en campo JSON de PostgreSQL para flexibilidad
3. **Respuesta única:** No modificable después de envío
4. **Segmentación automática:** Backend filtra encuestas según rol/grado del usuario
5. **Análisis visual básico:** Gráficos simples con Recharts (barras, pastel, columnas)
6. **Sin lógica condicional:** Todas las preguntas se muestran linealmente (condicionales en futuro)
7. **Exportación CSV:** Solo datos tabulares, gráficos en PDF es funcionalidad futura
8. **Notificaciones obligatorias:** Siempre se envía notificación al publicar (no opcional)

---

## 📊 **ESTRUCTURA DE DATOS JSON (Ejemplo)**

### **Preguntas (almacenadas en `encuestas.preguntas`):**
```json
[
  {
    "id": 1,
    "texto": "¿Qué tan satisfecho está con la comunicación del colegio?",
    "tipo": "escala_1_5",
    "obligatoria": true,
    "opciones": null,
    "orden": 1
  },
  {
    "id": 2,
    "texto": "¿Qué aspectos considera que deben mejorar?",
    "tipo": "opcion_multiple",
    "obligatoria": true,
    "opciones": [
      "Infraestructura",
      "Comunicación",
      "Enseñanza",
      "Administración"
    ],
    "orden": 2
  },
  {
    "id": 3,
    "texto": "Comentarios adicionales",
    "tipo": "texto_largo",
    "obligatoria": false,
    "opciones": null,
    "orden": 3
  }
]
```

### **Respuestas (almacenadas en `respuestas_encuestas.respuestas`):**
```json
{
  "respuestas": [
    {
      "pregunta_id": 1,
      "valor": 4
    },
    {
      "pregunta_id": 2,
      "valor": ["Comunicación", "Infraestructura"]
    },
    {
      "pregunta_id": 3,
      "valor": "Me gustaría más actividades extracurriculares"
    }
  ]
}
```

---
