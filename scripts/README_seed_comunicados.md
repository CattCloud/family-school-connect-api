# Script de Seeding para el Módulo de Comunicados

## Descripción

Este script genera datos de prueba realistas para el módulo de Comunicados del sistema Family School Connect API. Crea entre 20-30 comunicados distribuidos en los últimos 90 días y los próximos 15 días, con variedad de estados, prioridades y audiencias.

## Características

- **Generación de 20-30 comunicados** con contenido variado y realista
- **Distribución temporal** en los últimos 90 días y próximos 15 días
- **Variedad de estados**: borrador, publicado, programado, archivado, cancelado
- **Variedad de prioridades**: baja, normal, alta
- **Segmentación diversa** por rol, nivel, grado y curso
- **Contenido contextualizado** al ámbito escolar en español
- **Generación de lecturas** para simular interacción de usuarios

## Requisitos Previos

1. **Ejecutar primero el script principal de seeding**:
   ```bash
   node scripts/seed_datos_prueba_final.js
   ```

2. **Contar con usuarios, niveles, grados y cursos** en la base de datos.

3. **Generar el cliente Prisma** después de actualizar el esquema:
   ```bash
   npx prisma generate
   ```

4. **Aplicar las migraciones** si es necesario:
   ```bash
   npx prisma migrate dev --name add-comunicados
   ```

## Uso

1. **Ejecutar el script**:
   ```bash
   node scripts/seed_comunicados.js
   ```

2. **Verificar los resultados** en la base de datos.

## Estructura de Datos Generados

### Comunicados

Cada comunicado generado incluye:

- **Título**: Contextualizado según el tipo (académico, administrativo, evento, urgente, informativo)
- **Contenido**: HTML variado según el tipo y longitud (corta, media, larga)
- **Tipo**: academico, administrativo, evento, urgente, informativo
- **Estado**: borrador, publicado, programado, archivado, cancelado
- **Autor**: Directores (70%) o docentes (30%) existentes en la base de datos
- **Público objetivo**: padres, docentes, todos
- **Segmentación**: niveles, grados y cursos según la estructura existente
- **Fechas**: 
  - Creación: según estado
  - Publicación: para comunicados publicados
  - Programación: para comunicados programados
  - Vigencia: desde-hasta para algunos comunicados
- **Confirmación**: algunos comunicados requieren confirmación de lectura
- **Prioridad**: baja, normal, alta

### Lecturas de Comunicados

Para los comunicados publicados, se generan lecturas aleatorias:

- **60% de los comunicados** son leídos por al menos un padre
- **1-3 padres** leen cada comunicado seleccionado
- **Fechas de lectura**: entre la fecha de publicación y la fecha actual

## Consideraciones Importantes

### Modelo de Datos

El script utiliza los modelos `Comunicado` y `ComunicadoLectura` que ya están definidos en el esquema Prisma:

```prisma
/// Tabla: comunicados
model Comunicado {
  id                    String    @id @default(uuid()) @db.Uuid
  titulo                String
  contenido             String    @db.Text
  tipo                  TipoComunicado
  estado                EstadoComunicado    @default("borrador")
  autor_id              String    @db.Uuid
  autor                 Usuario    @relation("AutorComunicado", fields: [autor_id], references: [id])
  publico_objetivo      String[]
  niveles_objetivo       String[]
  grados_objetivo        String[]
  cursos_objetivo        String[]
  fecha_creacion        DateTime  @default(now())
  fecha_publicacion     DateTime?
  fecha_programada      DateTime?
  fecha_vigencia_desde DateTime?
  fecha_vigencia_hasta DateTime?
  requiere_confirmacion Boolean   @default(false)
  prioridad            PrioridadComunicado    @default("normal")
  editado               Boolean   @default(false)
  año_academico         Int

  // Relaciones
  lecturas              ComunicadoLectura[]
  notificaciones         Notificacion[]
  
  @@map("comunicados")
}

/// Tabla: comunicados_lecturas
model ComunicadoLectura {
  id               String    @id @default(uuid()) @db.Uuid
  comunicado_id    String    @db.Uuid
  comunicado       Comunicado @relation(fields: [comunicado_id], references: [id], onDelete: Cascade)
  usuario_id       String    @db.Uuid
  usuario          Usuario    @relation(fields: [usuario_id], references: [id])
  fecha_lectura    DateTime  @default(now())
  
  @@unique([comunicado_id, usuario_id])
  @@map("comunicados_lecturas")
}
```

### Actualización del Modelo de Usuario

El modelo `Usuario` ya incluye las relaciones necesarias:

```prisma
model Usuario {
  // ... campos existentes
  
  // Nuevas relaciones para comunicados
  comunicados_creados   Comunicado[] @relation("AutorComunicado")
  comunicados_leidos    ComunicadoLectura[]
  
  // ... resto del modelo
}
```

## Personalización

El script puede ser personalizado modificando:

- **`totalComunicados`**: Número de comunicados a generar (línea 215)
- **Proporción de autores**: Directores (70%) vs docentes (30%) (línea 247)
- **Distribución de estados**: Porcentaje de comunicados publicados (línea 261)
- **Rangos de fechas**: Períodos para comunicados pasados y futuros (línea 32)

## Solución de Problemas

### Error: "No se encontraron usuarios en la base de datos"

**Causa**: No se ha ejecutado el script principal de seeding.

**Solución**: Ejecutar primero:
```bash
node scripts/seed_datos_prueba_final.js
```

### Error: "No se encontraron niveles y grados en la base de datos"

**Causa**: No se ha ejecutado el script principal de seeding.

**Solución**: Ejecutar primero:
```bash
node scripts/seed_datos_prueba_final.js
```

### Error: "No se encontró el modelo Comunicado"

**Causa**: El cliente Prisma no ha sido regenerado después de actualizar el esquema.

**Solución**: 
1. Generar el cliente Prisma: `npx prisma generate`
2. Aplicar las migraciones: `npx prisma migrate dev --name add-comunicados`
3. Volver a ejecutar el script de seeding

## Verificación

Para verificar que los datos se han generado correctamente:

1. **Consultar comunicados**:
   ```sql
   SELECT COUNT(*) FROM comunicados;
   SELECT tipo, estado, COUNT(*) FROM comunicados GROUP BY tipo, estado;
   ```

2. **Consultar lecturas**:
   ```sql
   SELECT COUNT(*) FROM comunicados_lecturas;
   ```

3. **Verificar en la aplicación**:
   - Iniciar sesión como director, docente o padre
   - Navegar a la sección de Comunicados
   - Verificar que los comunicados generados aparezcan correctamente

## Flujo de Trabajo Completo

1. **Actualizar el esquema**: Los modelos `Comunicado` y `ComunicadoLectura` ya están definidos en `prisma/schema.prisma`
2. **Generar el cliente Prisma**: `npx prisma generate`
3. **Aplicar migraciones**: `npx prisma migrate dev --name add-comunicados`
4. **Ejecutar el script principal**: `node scripts/seed_datos_prueba_final.js`
5. **Ejecutar el script de comunicados**: `node scripts/seed_comunicados.js`
6. **Verificar los resultados**: Consultar la base de datos o usar la aplicación