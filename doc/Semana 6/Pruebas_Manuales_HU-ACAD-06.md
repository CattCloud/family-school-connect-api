# **Pruebas Manuales - HU-ACAD-06: Ver Calificaciones de Componente por Trimestre**

## **Información General**
- **Historia de Usuario:** HU-ACAD-06 — Ver Calificaciones de Componente por Trimestre
- **Rol:** Padre/Apoderado
- **Ruta de acceso:** `/dashboard/calificaciones`
- **Fecha de implementación:** 17 de octubre de 2025

---

## **Casos de Prueba Funcionales**

### **CP-01: Acceso al módulo de Calificaciones**
**Objetivo:** Verificar que los padres/apoderados puedan acceder al módulo de calificaciones

**Pasos:**
1. Iniciar sesión como usuario con rol `apoderado`
2. Navegar al dashboard principal
3. Hacer clic en la opción "Calificaciones" del menú lateral

**Resultado Esperado:**
- Redirección exitosa a `/dashboard/calificaciones`
- Se muestra la página principal de calificaciones con filtros
- El menú lateral muestra "Calificaciones" como opción activa

**Criterios de Aceptación:**
- ✅ CA-01: Acceso a la opción del Dashboard "Calificaciones"

---

### **CP-02: Selección de Filtros**
**Objetivo:** Verificar el funcionamiento de los controles de filtrado

**Pasos:**
1. Acceder al módulo de calificaciones
2. Seleccionar un hijo/a del dropdown
3. Verificar que se carguen los cursos disponibles para el año actual
4. Seleccionar un trimestre (T1, T2 o T3)
5. Seleccionar un curso de la lista
6. Seleccionar un componente de evaluación

**Resultado Esperado:**
- Los filtros se habilitan/deshabilitan según corresponda
- Al seleccionar hijo/a, se cargan sus cursos
- El breadcrumb se actualiza con las selecciones
- Los datos se cargan automáticamente al tener todos los filtros

**Criterios de Aceptación:**
- ✅ CA-02: Pantalla principal muestra controles de filtrado

---

### **CP-03: Visualización de Componentes Recurrentes**
**Objetivo:** Verificar la visualización de calificaciones para componentes recurrentes

**Pasos:**
1. Seleccionar un componente recurrente (ej: "Participación")
2. Verificar que se muestre la tabla con múltiples evaluaciones
3. Verificar el card de resumen con promedio
4. Probar el toggle de formato numérico/letras

**Resultado Esperado:**
- Tabla con todas las evaluaciones del componente
- Columnas: Fecha, Calificación, Estado, Registrado por
- Card de resumen con promedio calculado
- Toggle de formato funcional con persistencia en localStorage

**Criterios de Aceptación:**
- ✅ CA-03: Muestra tabla de notas individuales para componentes recurrentes
- ✅ CA-04: Toggle de formato de visualización funcional

---

### **CP-04: Visualización de Componentes Únicos**
**Objetivo:** Verificar la visualización de calificaciones para componentes únicos

**Pasos:**
1. Seleccionar un componente único (ej: "Examen Trimestral")
2. Verificar que se muestre una sola evaluación en la tabla
3. Verificar el card de resumen con calificación única

**Resultado Esperado:**
- Tabla con una sola fila para la evaluación única
- Card de resumen mostrando "Calificación" en lugar de "Promedio"
- Visualización clara del estado (preliminar/final)

**Criterios de Aceptación:**
- ✅ CA-03: Muestra tabla simple para componentes únicos

---

### **CP-05: Manejo de Estados Preliminares vs Finales**
**Objetivo:** Verificar la diferenciación visual entre estados

**Pasos:**
1. Seleccionar un componente con notas preliminares
2. Verificar badges de estado "Preliminar" (amarillo/naranja)
3. Verificar mensaje de advertencia
4. Seleccionar un componente con notas finales
5. Verificar badges de estado "Final" (verde/azul)
6. Verificar mensaje de confirmación

**Resultado Esperado:**
- Diferenciación visual clara entre estados
- Mensajes informativos según el estado
- Iconos apropiados para cada estado

**Criterios de Aceptación:**
- ✅ CA-05: Diferenciación visual clara entre preliminares y finales

---

### **CP-06: Exportación a PDF**
**Objetivo:** Verificar la funcionalidad de exportación

**Pasos:**
1. Seleccionar un componente con calificaciones
2. Hacer clic en el botón "Exportar PDF"
3. Verificar que se descargue el archivo PDF
4. Abrir el PDF y verificar su contenido

**Resultado Esperado:**
- Descarga exitosa del archivo PDF
- Nombre de archivo descriptivo
- Contenido incluye calificaciones, promedios y estado

**Criterios de Aceptación:**
- ✅ UX-03: Botón de exportación PDF funcional

---

### **CP-07: Estados Vacíos**
**Objetivo:** Verificar el manejo de estados sin datos

**Pasos:**
1. Seleccionar un componente sin evaluaciones registradas
2. Verificar el mensaje de estado vacío
3. Verificar ícono ilustrativo
4. Verificar sugerencia de contacto

**Resultado Esperado:**
- Mensaje claro: "Aún no hay calificaciones registradas..."
- Ícono representativo
- Sugerencia de contacto con docente

**Criterios de Aceptación:**
- ✅ CA-06: Estado vacío con mensaje apropiado

---

## **Casos de Prueba de Error**

### **CP-08: Manejo de Errores de API**
**Objetivo:** Verificar el manejo de errores de conexión

**Pasos:**
1. Simular error de conexión (desconectar red)
2. Intentar cargar calificaciones
3. Verificar mensaje de error
4. Reconectar red y verificar recuperación

**Resultado Esperado:**
- Toast notification con mensaje de error claro
- Opción de reintentar
- Recuperación automática al reestablecer conexión

---

### **CP-09: Validación de Permisos**
**Objetivo:** Verificar que solo usuarios autorizados accedan

**Pasos:**
1. Intentar acceder directamente a `/dashboard/calificaciones` sin autenticación
2. Iniciar sesión con rol diferente a `apoderado`
3. Intentar acceder al módulo

**Resultado Esperado:**
- Redirección a login para usuarios no autenticados
- Acceso denegado para roles no autorizados
- Mensaje de error apropiado

---

## **Casos de Prueba de Rendimiento**

### **CP-10: Tiempo de Carga**
**Objetivo:** Verificar tiempos de carga aceptables

**Pasos:**
1. Medir tiempo de carga inicial de la página
2. Medir tiempo de carga de filtros
3. Medir tiempo de carga de calificaciones
4. Medir tiempo de exportación PDF

**Resultado Esperado:**
- Carga inicial < 3 segundos
- Carga de filtros < 2 segundos
- Carga de calificaciones < 2 segundos
- Exportación PDF < 5 segundos

---

### **CP-11: Responsividad**
**Objetivo:** Verificar comportamiento en diferentes tamaños de pantalla

**Pasos:**
1. Probar en desktop (1920x1080)
2. Probar en tablet (768x1024)
3. Probar en mobile (375x667)
4. Verificar adaptación de componentes

**Resultado Esperado:**
- Desktop: Layout completo con todas las columnas
- Tablet: Columnas prioritarias visibles
- Mobile: Cards en lugar de tabla, filtros apilados

---

## **Casos de Prueba de Usabilidad**

### **CP-12: Flujo Completo de Usuario**
**Objetivo:** Verificar el flujo completo desde el inicio hasta la exportación

**Pasos:**
1. Iniciar sesión como apoderado
2. Navegar a calificaciones
3. Seleccionar hijo/a, año, trimestre, curso, componente
4. Revisar calificaciones en formato numérico
5. Cambiar a formato de letras
6. Exportar PDF
7. Regresar y seleccionar otro componente

**Resultado Esperado:**
- Flujo intuitivo sin fricciones
- Todos los elementos funcionales
- Experiencia de usuario consistente

---

## **Checklist de Validación Final**

### **Funcionalidad**
- [ ] Acceso al módulo funciona correctamente
- [ ] Filtros funcionan y se actualizan dinámicamente
- [ ] Tabla muestra datos correctamente
- [ ] Toggle de formato funciona y persiste preferencia
- [ ] Exportación PDF genera archivo correcto
- [ ] Estados preliminares/finales se diferencian correctamente

### **Interfaz de Usuario**
- [ ] Diseño responsivo en todos los dispositivos
- [ ] Colores y estilos según institucionales
- [ ] Loading states funcionales
- [ ] Estados vacíos claros
- [ ] Mensajes de error informativos

### **Rendimiento**
- [ ] Tiempos de carga dentro de límites aceptables
- [ ] No hay memory leaks
- [ ] La aplicación responde correctamente a interacciones

### **Accesibilidad**
- [ ] Navegación por teclado funcional
- [ ] Lectores de pantalla compatibles
- [ ] Contraste de colores adecuado
- [ ] Etiquetas ARIA correctas

---

## **Notas y Observaciones**

1. **Formato de calificaciones:** El toggle entre numérico y letras debe mantenerse en localStorage para persistencia entre sesiones.

2. **Exportación PDF:** El nombre del archivo debe seguir el formato: `Calificaciones_NombreEstudiante_Curso_Trimestre_Año.pdf`

3. **Estados de trimestre:** Los trimestres deben mostrar su estado (pendiente, en curso, cerrado) en los filtros.

4. **Breadcrumb:** Debe actualizarse dinámicamente según las selecciones del usuario.

5. **Paginación:** Para componentes con muchas evaluaciones, la paginación debe funcionar correctamente.

---

## **Firma de Validación**

**Tester:** _________________________ 
**Fecha:** _________________________ 
**Resultado:** ✅ Aprobado / ❌ Rechazado / ⚠️ Condicional

