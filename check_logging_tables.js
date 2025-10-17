console.log('Verificando tablas de logging...');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Verificar tabla auth_logs
    const authLogsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'auth_logs'
      );
    `;
    
    // Verificar tabla access_logs
    const accessLogsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'access_logs'
      );
    `;
    
    console.log(`Tabla auth_logs: ${authLogsExists[0].exists ? '✅ Existe' : '❌ No existe'}`);
    console.log(`Tabla access_logs: ${accessLogsExists[0].exists ? '✅ Existe' : '❌ No existe'}`);
    
    if (!authLogsExists[0].exists || !accessLogsExists[0].exists) {
      console.log('\n⚠️  Algunas tablas de logging no existen. Debes ejecutar el script SQL:');
      console.log('psql -U <usuario> -d <base_de_datos> -f doc/tesis/scripts_tablas_logging_v2.sql');
    } else {
      console.log('\n✅ Todas las tablas de logging existen');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar tablas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();