/**
 * Script de limpieza completa de datos de validación
 * Elimina todos los registros de tablas específicas manteniendo la estructura
 * Útil para regenerar datos limpios antes de nueva simulación
 * 
 * Uso: node scripts/limpiar_base_datos_validacion.js
 * 
 * PRECAUCIÓN: Este script elimina datos reales. Usar solo en entorno de desarrollo.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ANIO = 2025;

async function main() {
  console.log('🧹 Iniciando limpieza completa de base de datos para validación...');
  console.log('⚠️  Este proceso eliminará todos los datos de simulación.');
  
  try {
    // 1. Tablas de logging (datos de simulación)
    console.log('\n🗑️  Limpiando tablas de logging...');
    await prisma.$executeRaw`DELETE FROM access_logs WHERE año_academico = ${ANIO}`;
    console.log('   - access_logs eliminados');
    
    await prisma.$executeRaw`DELETE FROM auth_logs WHERE año_academico = ${ANIO}`;
    console.log('   - auth_logs eliminados');

    // 2. Tablas de interacciones (respuestas a simulación)
    console.log('\n🗑️  Limpiando interacciones de usuarios...');
    
    // Comunicados lecturas
    await prisma.$executeRaw`
      DELETE FROM comunicados_lecturas 
      WHERE comunicado_id IN (
        SELECT id FROM comunicados WHERE año_academico = ${ANIO}
      )
    `;
    console.log('   - comunicados_lecturas eliminados');

    // Respuestas a encuestas
    await prisma.$executeRaw`
      DELETE FROM respuestas_encuestas 
      WHERE encuesta_id IN (
        SELECT id FROM encuestas WHERE año_academico = ${ANIO}
      )
    `;
    console.log('   - respuestas_encuestas eliminados');

    // Notificaciones
    await prisma.$executeRaw`DELETE FROM notificaciones WHERE año_academico = ${ANIO}`;
    console.log('   - notificaciones eliminados');

    // Tickets de soporte
    await prisma.$executeRaw`DELETE FROM tickets_soporte WHERE año_academico = ${ANIO}`;
    console.log('   - tickets_soporte eliminados');

    // 3. Contenido de comunicados y encuestas
    console.log('\n🗑️  Limpiando comunicados y encuestas...');
    
    // Opciones de preguntas (referencias a preguntas)
    await prisma.$executeRaw`
      DELETE FROM opciones_pregunta
      WHERE pregunta_id IN (
        SELECT id FROM preguntas_encuesta
        WHERE encuesta_id IN (
          SELECT id FROM encuestas WHERE año_academico = ${ANIO}
        )
      )
    `;
    console.log('   - opciones_pregunta eliminados');

    // Preguntas de encuestas
    await prisma.$executeRaw`
      DELETE FROM preguntas_encuesta
      WHERE encuesta_id IN (
        SELECT id FROM encuestas WHERE año_academico = ${ANIO}
      )
    `;
    console.log('   - preguntas_encuesta eliminados');

    // Encuestas
    await prisma.$executeRaw`DELETE FROM encuestas WHERE año_academico = ${ANIO}`;
    console.log('   - encuestas eliminados');

    // Comunicados
    await prisma.$executeRaw`DELETE FROM comunicados WHERE año_academico = ${ANIO}`;
    console.log('   - comunicados eliminados');

    // 4. Datos académicos base (evaluaciones, asistencias)
    console.log('\n🗑️  Limpiando datos académicos...');
    
    await prisma.$executeRaw`DELETE FROM asistencias WHERE año_academico = ${ANIO}`;
    console.log('   - asistencias eliminados');

    await prisma.$executeRaw`DELETE FROM evaluaciones WHERE año_academico = ${ANIO}`;
    console.log('   - evaluaciones eliminados');

    await prisma.$executeRaw`DELETE FROM estructura_evaluacion WHERE año_academico = ${ANIO}`;
    console.log('   - estructura_evaluacion eliminados');

    // 5. Relaciones y asignaciones
    console.log('\n🗑️  Limpiando relaciones...');
    
    await prisma.$executeRaw`DELETE FROM permisos_docentes WHERE año_academico = ${ANIO}`;
    console.log('   - permisos_docentes eliminados');
    
    await prisma.$executeRaw`DELETE FROM asignaciones_docente_curso WHERE año_academico = ${ANIO}`;
    console.log('   - asignaciones_docente_curso eliminados');
    
    await prisma.$executeRaw`DELETE FROM relaciones_familiares WHERE año_academico = ${ANIO}`;
    console.log('   - relaciones_familiares eliminados');

    // 6. Entidades principales
    console.log('\n🗑️  Limpiando entidades principales...');
    
    await prisma.$executeRaw`DELETE FROM estudiantes WHERE año_academico = ${ANIO}`;
    console.log('   - estudiantes eliminados');

    await prisma.$executeRaw`DELETE FROM cursos WHERE año_academico = ${ANIO}`;
    console.log('   - cursos eliminados');

    await prisma.$executeRaw`DELETE FROM usuarios WHERE id IN (
      SELECT id FROM usuarios
      WHERE nombre IN ('Carlos', 'María', 'Jorge', 'Ana')
      AND nro_documento IN ('12345678', '23456789', '34567890', '45678901')
    )`;
    console.log('   - usuarios de prueba eliminados');

    await prisma.$executeRaw`DELETE FROM nivel_grado WHERE grado IN ('4to', '3ro')`;
    console.log('   - nivel_grado eliminados');

    console.log('\n✅ Limpieza completa finalizada.');
    console.log('\n📋 Tablas limpiadas:');
    console.log('   ✓ Logging: auth_logs, access_logs');
    console.log('   ✓ Interacciones: comunicados_lecturas, notificaciones, respuestas_encuestas, tickets_soporte');
    console.log('   ✓ Contenido: comunicados, encuestas, preguntas_encuestas, opciones_preguntas');
    console.log('   ✓ Académicos: evaluaciones, asistencias, estructuras_evaluacion');
    console.log('   ✓ Relaciones: relaciones_familiares, asignacion_docente_curso, permisos_docentes');
    console.log('   ✓ Entidades: estudiantes, cursos, usuarios, niveles_grados');
    console.log('\n🚀 La base de datos está lista para una nueva simulación limpia.');

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    console.log('\n💡 Nota: Algunos errores pueden ser normales si ciertas tablas ya estaban vacías.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error crítico:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });