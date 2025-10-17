# Instrucciones para Implementar el Sistema de Logging

Este documento proporciona las instrucciones para implementar el sistema de logging necesario para recolectar datos para las métricas definidas en el capítulo 6 de la tesis.

## 1. Crear Tablas de Logging en la Base de Datos

Ejecutar el script SQL que crea las tablas necesarias:

```bash
# Conectarse a la base de datos
psql -U [usuario] -d [nombre_bd]

# Ejecutar el script
\i doc/tesis/scripts_tablas_logging_v2.sql
```

## 2. Instalar el Middleware de Logging

1. Copiar el archivo `middleware/logging.js` en el directorio de middleware del proyecto.

2. Verificar que las dependencias necesarias estén disponibles:
   - El archivo utiliza `prisma` para acceder a la base de datos
   - El archivo utiliza `logger` para registrar eventos

## 3. Integrar el Middleware en las Rutas

Existen dos opciones para integrar el middleware de logging en las rutas:

### Opción 1: Reemplazar los archivos de rutas existentes

Reemplazar los archivos de rutas existentes con las versiones que incluyen logging:

```bash
# Hacer copia de seguridad de los archivos originales
cp routes/auth.js routes/auth.js.bak
cp routes/gradesView.js routes/gradesView.js.bak
cp routes/attendanceView.js routes/attendanceView.js.bak
cp routes/messaging.js routes/messaging.js.bak

# Reemplazar con las versiones con logging
cp routes/auth_with_logging.js routes/auth.js
cp routes/gradesView_with_logging.js routes/gradesView.js
cp routes/attendanceView_with_logging.js routes/attendanceView.js
cp routes/messaging_with_logging.js routes/messaging.js
```

### Opción 2: Modificar los archivos existentes

Alternativamente, se pueden modificar los archivos existentes para agregar el middleware de logging:

1. Importar el middleware de logging en cada archivo de rutas:
   ```javascript
   const { logAuthEvent, logAccess } = require('../middleware/logging');
   ```

2. Agregar el middleware a las rutas relevantes, como se muestra en los archivos `*_with_logging.js`.

## 4. Verificar la Implementación

Para verificar que el sistema de logging está funcionando correctamente:

1. Reiniciar el servidor de la aplicación:
   ```bash
   npm run dev
   ```

2. Realizar algunas acciones que deberían ser registradas:
   - Iniciar sesión como un usuario
   - Consultar calificaciones
   - Consultar asistencia
   - Enviar mensajes

3. Verificar que los registros se están creando en las tablas de logging:
   ```sql
   SELECT * FROM auth_logs ORDER BY timestamp DESC LIMIT 10;
   SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT 10;
   ```

## 5. Consideraciones Adicionales

- **Rendimiento**: El sistema de logging está diseñado para no bloquear las respuestas de la API. Las operaciones de registro se realizan de forma asíncrona después de enviar la respuesta al cliente.

- **Espacio en disco**: Monitorear el crecimiento de las tablas de logging. Dependiendo del tráfico, puede ser necesario implementar una política de retención de datos.

- **Privacidad**: El sistema no registra información sensible como contraseñas. Sin embargo, se debe tener cuidado al analizar los logs para no exponer información personal de los usuarios.

## 6. Consultas SQL para Métricas

Las consultas SQL para calcular las métricas definidas se encuentran en el archivo `scripts_tablas_logging_v2.sql`. Estas consultas pueden ser utilizadas para generar los reportes necesarios para el capítulo 6 de la tesis.

## 7. Próximos Pasos

Una vez implementado el sistema de logging, se puede proceder con:

1. Crear seeds para las instancias de prueba
2. Desarrollar tests automatizados para las métricas
3. Ejecutar pruebas y recolectar datos
4. Analizar resultados y crear visualizaciones
5. Redactar el capítulo 6 de la tesis