# Script de Siembra de Datos de Prueba

## Descripción

Este script (`seed_datos_prueba.js`) pobla la base de datos con el conjunto mínimo de datos necesarios para probar el módulo de visualización académica en el frontend.

## Datos Generados

El script crea los siguientes datos:

### Usuarios
- **Administrador:** DNI 11111111, contraseña 123456789
- **Director:** DNI 99999999, contraseña 123456789
- **Docente:** DNI 77777777, contraseña 123456789
- **Padre:** DNI 88888888, contraseña 123456789

### Estructura Académica
- **Nivel-Grado:** Primaria 3
- **Cursos:** Matemáticas, Comunicación, Ciencias
- **Estructura de Evaluación:** 5 componentes (Examen, Participación, Revisión de Cuaderno, Revisión de Libro, Comportamiento)

### Estudiante
- **Código:** P3001
- **Nombre:** Estudiante Ejemplo
- **Nivel:** Primaria 3
- **Año Académico:** 2025

### Relaciones
- **Relación Familiar:** Padre (88888888) -> Estudiante (P3001)
- **Asignación Docente-Curso:** Docente (77777777) -> Matemáticas (Primaria 3)

### Datos Académicos
- **Calificaciones:** Múltiples evaluaciones para Matemáticas y Comunicación (Trimestre 1)
- **Asistencia:** Registros diarios para marzo 2025

## Ejecución

### Prerrequisitos
1. Tener Node.js instalado
2. Tener las dependencias del proyecto instaladas (`npm install`)
3. Configurar la variable de entorno `DATABASE_URL` en el archivo `.env`

### Comandos

Para ejecutar el script de siembra de datos:

```bash
# Desde la raíz del proyecto
node scripts/seed_datos_prueba.js
```

O usando npm (si se agrega al package.json del proyecto principal):

```bash
npm run seed:datos
```

## Verificación

Después de ejecutar el script, puedes verificar los datos:

1. **Iniciar sesión** con los usuarios creados:
   - Administrador: 11111111 / 123456789
   - Director: 99999999 / 123456789
   - Docente: 77777777 / 123456789
   - Padre: 88888888 / 123456789

2. **Probar el módulo de visualización académica**:
   - Iniciar sesión como Padre (88888888)
   - Seleccionar al hijo (Estudiante Ejemplo)
   - Navegar a las secciones de Calificaciones y Asistencia

## Notas Técnicas

- El script maneja duplicados, verificando si los datos ya existen antes de crearlos
- Las contraseñas se hashean usando bcrypt con 10 salt rounds
- Se mantiene la integridad referencial entre todas las tablas
- El script genera logs detallados de cada operación realizada
- Se cierra la conexión a la base de datos al finalizar

## Personalización

Si necesitas modificar los datos de prueba:

1. Edita el archivo `scripts/seed_datos_prueba.js`
2. Modifica los datos en las secciones correspondientes
3. Vuelve a ejecutar el script

## Solución de Problemas

Si encuentras errores durante la ejecución:

1. **Error de conexión a la base de datos:**
   - Verifica que la variable `DATABASE_URL` esté configurada correctamente
   - Asegúrate de que la base de datos esté accesible

2. **Error de módulos no encontrados:**
   - Ejecuta `npm install` para instalar las dependencias
   - Verifica que `@prisma/client` y `bcrypt` estén instalados

3. **Error de permisos:**
   - Asegúrate de tener permisos de escritura en la base de datos
   - Verifica que el usuario de la base de datos tenga los permisos necesarios

## Limpieza de Datos

Si necesitas limpiar los datos de prueba y volver a generarlos:

1. Elimina los registros manualmente de la base de datos
2. O ejecuta el script con la opción de limpieza (si está implementada)
3. Vuelve a ejecutar el script de siembra