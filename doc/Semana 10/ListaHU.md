## 🎯 **PROPUESTA DE HU SIMPLIFICADAS - MVP**



---

### **5️⃣ HU-SOP-04 — Reabrir Ticket Cerrado (Padre / Docente / Director)**

> Como usuario, quiero reabrir tickets cerrados si el problema persiste para continuar con la resolución sin crear un ticket duplicado.

**Rol:** Padre, Docente, Director  
**Funcionalidad principal:**
- Botón "🔄 Reabrir Ticket" visible solo en tickets resueltos/cerrados
- Modal de confirmación:
  - "¿Por qué deseas reabrir este ticket?"
  - Textarea obligatorio (mínimo 20 caracteres)
  - Botones: "Reabrir" (primario) | "Cancelar" (secundario)
- Al reabrir:
  - Estado cambia a "Pendiente"
  - Se agrega mensaje automático en conversación:
    - "🔄 Ticket reabierto por el usuario"
    - "Motivo: [texto ingresado]"
  - Notificación al administrador (WhatsApp + plataforma)
  - Confirmación visual: "✅ Ticket reabierto correctamente"

---


### **9️⃣ HU-SOP-08 — Ver Métricas de Soporte (Administrador)**

> Como administrador, quiero ver métricas de satisfacción y rendimiento del soporte técnico para evaluar la calidad del servicio y tomar decisiones de mejora.

**Rol:** Administrador  
**Funcionalidad principal:**
- Dashboard con métricas clave:
  - **Resumen general:**
    - Total de tickets (por periodo)
    - Tickets abiertos vs cerrados
    - Tiempo promedio de respuesta
    - Tiempo promedio de resolución
    - Tasa de reapertura
  - **Por categoría:**
    - Gráfico de dona: Distribución de tickets por categoría
    - Top 3 categorías con más tickets
  - **Por prioridad:**
    - Gráfico de barras: Tickets por prioridad
  - **Por estado:**
    - Gráfico de área: Evolución de tickets en el tiempo
  - **Satisfacción (futuro):**
    - Rating promedio (1-5 estrellas)
    - Comentarios de usuarios
  - **Tendencias:**
    - Gráfico de líneas: Tickets creados por mes
    - Comparativa con periodo anterior
- Filtros por:
  - Rango de fechas
  - Categoría
  - Prioridad
  - Usuario (rol)
- Exportación a CSV/Excel

---


---

## ⚙️ **RESUMEN ESTRUCTURAL - MVP**

| # | Código | Nombre resumido | Rol | Tipo de Vista | Prioridad |
|---|--------|-----------------|-----|---------------|-----------|
| 1 | HU-SOP-00 | Centro de Ayuda (FAQ + Guías) | Padre / Docente / Director | Página informativa | ⭐ Alta |
| 2 | HU-SOP-01 | Crear Ticket de Soporte | Padre / Docente / Director | Formulario | ⭐ Alta |
| 3 | HU-SOP-02 | Ver Historial de Tickets | Padre / Docente / Director | Lista con filtros | ⭐ Alta |
| 4 | HU-SOP-03 | Ver Detalle de Ticket | Padre / Docente / Director | Página de conversación | ⭐ Alta |
| 5 | HU-SOP-04 | Reabrir Ticket Cerrado | Padre / Docente / Director | Acción sobre ticket | 🟡 Media |
| 6 | HU-SOP-05 | Bandeja de Tickets (Admin) | Administrador | Panel administrativo | ⭐ Alta |
| 7 | HU-SOP-06 | Gestionar y Responder Ticket | Administrador | Página de gestión | ⭐ Alta |
| 8 | HU-SOP-07 | Gestionar FAQ y Guías | Administrador | CRUD de contenido | 🟡 Media |
| 9 | HU-SOP-08 | Ver Métricas de Soporte | Administrador | Dashboard de análisis | 🟢 Baja |
| 10 | HU-SOP-09 | Notificaciones de Tickets | Todos | Global (backend + UI) | ⭐ Alta |

---

## 🚀 **FUNCIONALIDADES FUTURAS (Post-MVP)**

| Código | Nombre | Descripción |
|--------|--------|-------------|
| HU-SOP-10 | Sistema de rating de satisfacción | Usuarios califican resolución (1-5 estrellas) |
| HU-SOP-11 | Asignación de tickets a agentes | Múltiples administradores con asignación específica |
| HU-SOP-12 | Plantillas de respuestas | Respuestas predefinidas para problemas comunes |
| HU-SOP-13 | Chat en vivo | Soporte en tiempo real via chat |
| HU-SOP-14 | Base de conocimientos | Wiki colaborativa con artículos |
| HU-SOP-15 | SLA automático | Alertas cuando tickets exceden tiempo de respuesta |

---

## 💡 **BENEFICIOS DE ESTA ESTRUCTURA**

✅ **Eliminaste duplicidad:** HU-28 a HU-32 se unifican en HU-SOP-00 a HU-SOP-04  
✅ **Componentes reutilizables:** FAQ, formularios y conversación funcionan igual para todos los usuarios  
✅ **Escalabilidad clara:** Funcionalidades futuras bien definidas sin romper MVP  
✅ **Flujo natural:** Usuario busca en FAQ → crea ticket → administrador responde → usuario reabres si es necesario  
✅ **Métricas desde MVP:** Base para análisis de calidad del soporte

---

## 🔸 **DECISIONES CLAVE DEL MVP**

1. **5 categorías detalladas:** Login, Calificaciones, Mensajes, Archivos, Navegación, Otro
2. **Estados simples:** Pendiente, En Proceso, Resuelto, Cerrado
3. **Prioridades automáticas:** Calculadas según categoría (configurable)
4. **Conversación bidireccional:** Usuario puede agregar información después de crear ticket
5. **Reapertura permitida:** Sin límite de veces (mejor que crear duplicados)
6. **FAQ actualizable:** Administrador puede editar sin deploy de código
7. **Notificaciones obligatorias:** Cada actualización genera notificación automática
8. **Sin rating en MVP:** Satisfacción es funcionalidad futura (simplifica flujo inicial)

