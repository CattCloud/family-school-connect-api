## 🎯 **PROPUESTA DE HU SIMPLIFICADAS - MVP**

### **1️⃣ HU-COM-00 — Bandeja de Comunicados (Padre / Docente / Director)**

> Como usuario, quiero ver una bandeja organizada con comunicados institucionales segmentados según mi rol y filtrar por tipo, fecha y estado para mantenerme informado sobre asuntos relevantes.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Vista de tarjetas (grid en desktop, lista en móvil)
- Filtros: tipo, estado (leído/no leído), fecha, autor
- Segmentación automática según rol/grado/nivel del usuario
- Indicadores visuales de leído/no leído
- Búsqueda por texto

**Diferencias por rol:**
- **Padre:** Solo ve comunicados dirigidos a sus hijos (grado/nivel específico)
- **Docente:** Ve comunicados institucionales generales + los que él creó (si tiene permisos)
- **Director:** Ve todos los comunicados institucionales

---

### **2️⃣ HU-COM-01 — Leer Comunicado Completo (Padre / Docente / Director)**

> Como usuario, quiero abrir y leer el contenido completo de un comunicado para estar informado sobre el detalle de la comunicación institucional.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Vista de detalle con contenido enriquecido (HTML renderizado)
- Información del comunicado: título, tipo, autor, fecha, destinatarios
- Indicador "Editado" si fue modificado post-publicación
- Marcado automático como "leído" al abrir
- Opción de imprimir/descargar PDF (futuro)

---

### **3️⃣ HU-COM-02 — Crear y Publicar Comunicado (Docente con permisos / Director)**

> Como docente/director con permisos, quiero crear comunicados con editor enriquecido y segmentar audiencia para informar a padres sobre asuntos relevantes de forma efectiva.

**Rol:** Docente (con permisos), Director  
**Funcionalidad principal:**
- Wizard de 3 pasos:
  1. **Información básica:** Título, tipo, fecha programada (opcional)
  2. **Contenido:** Editor de texto enriquecido (TinyMCE/Quill)
  3. **Audiencia y publicación:** Segmentación + preview + publicar
- Segmentación flexible: por grado, nivel, rol o combinación
- Preview antes de publicar
- Guardado como borrador
- Publicación inmediata o programada

**Diferencias por rol:**
- **Docente:** Solo puede crear si tiene permisos activos (asignados por director)
- **Director:** Acceso total sin restricciones

---

### **4️⃣ HU-COM-03 — Gestionar Comunicados Propios (Docente con permisos / Director)**

> Como docente/director, quiero editar, desactivar o eliminar comunicados que he creado para mantener actualizada la información institucional.

**Rol:** Docente (con permisos), Director  
**Funcionalidad principal:**
- Lista de comunicados propios con filtros
- Editar comunicado (marca como "editado" automáticamente)
- Desactivar comunicado (oculta de vista pública)
- Eliminar comunicado (confirmación obligatoria)
- Ver estadísticas básicas (total de lecturas, % de lectura)

**Diferencias por rol:**
- **Docente:** Solo gestiona sus propios comunicados
- **Director:** Gestiona todos los comunicados de la institución

---

### **5️⃣ HU-COM-04 — Ver Estadísticas de Lectura (Docente con permisos / Director)**

> Como docente/director, quiero ver estadísticas de lectura de mis comunicados para evaluar el alcance e impacto de la comunicación.

**Rol:** Docente (con permisos), Director  
**Funcionalidad principal:**
- Dashboard con métricas por comunicado:
  - Total de destinatarios
  - Total de lecturas
  - % de lectura
  - Listado de usuarios que leyeron (con timestamp)
  - Listado de usuarios pendientes de leer
- Gráficos visuales (barras, donas)
- Exportación a CSV (futuro)

---

### **6️⃣ HU-COM-05 — Notificaciones de Nuevos Comunicados (Padre / Docente / Director)**

> Como usuario, quiero recibir notificaciones cuando se publiquen nuevos comunicados dirigidos a mí para estar informado oportunamente.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Notificación automática al publicar comunicado (plataforma + WhatsApp)
- Badge en módulo de comunicados con contador
- Toast notification si está en sesión activa
- Listado de notificaciones en centro de notificaciones global

---

## ⚙️ **RESUMEN ESTRUCTURAL - MVP**

| # | Código | Nombre resumido | Rol | Tipo de Vista | Prioridad |
|---|--------|-----------------|-----|---------------|-----------|
| 1 | HU-COM-00 | Bandeja de Comunicados | Padre / Docente / Director | Página principal | ⭐ Alta |
| 2 | HU-COM-01 | Leer Comunicado Completo | Padre / Docente / Director | Página de detalle | ⭐ Alta |
| 3 | HU-COM-02 | Crear y Publicar Comunicado | Docente / Director | Wizard (3 pasos) | ⭐ Alta |
| 4 | HU-COM-03 | Gestionar Comunicados Propios | Docente / Director | Página de gestión | ⭐ Alta |
| 5 | HU-COM-04 | Ver Estadísticas de Lectura | Docente / Director | Dashboard de métricas | 🟡 Media |
| 6 | HU-COM-05 | Notificaciones de Comunicados | Padre / Docente / Director | Global (backend + UI) | ⭐ Alta |

---

## 🚀 **FUNCIONALIDADES FUTURAS (Post-MVP)**

| Código | Nombre | Descripción |
|--------|--------|-------------|
| HU-COM-06 | Aprobar comunicados de docentes | Director aprueba antes de publicar |
| HU-COM-07 | Comentarios en comunicados | Permitir retroalimentación directa |
| HU-COM-08 | Adjuntar archivos a comunicados | PDFs, imágenes, documentos |
| HU-COM-09 | Reacciones a comunicados | Like, importante, etc. |
| HU-COM-10 | Archivar comunicados antiguos | Organización histórica |

---

## 💡 **BENEFICIOS DE ESTA ESTRUCTURA**

✅ **Eliminaste duplicidad:** HU-17, HU-18, HU-19 del padre se unifican en HU-COM-00 y HU-COM-01  
✅ **Componentes reutilizables:** Bandeja y detalle funcionan igual para todos los roles (solo cambian permisos)  
✅ **Escalabilidad clara:** Funcionalidades futuras bien definidas sin romper MVP  
✅ **API simplificada:** Endpoints comunes, filtrado por rol en backend  
✅ **Permisos claros:** Sistema de permisos documentado desde el inicio

---

## 🔸 **DECISIONES CLAVE DEL MVP**

1. **Segmentación automática:** Backend filtra comunicados según rol/grado del usuario (no selección manual en lectura)
2. **Editor enriquecido:** TinyMCE o Quill para formato básico (negrita, listas, enlaces, colores)
3. **Sin aprobación:** Docentes con permisos publican directamente (aprobación es funcionalidad futura)
4. **Estadísticas básicas:** Solo contadores y % de lectura (gráficos avanzados en futuro)
5. **Sin archivos adjuntos en MVP:** Solo texto enriquecido (archivos en versión futura)

