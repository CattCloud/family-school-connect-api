console.log('Creando tablas de logging...');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('Creando tabla auth_logs...');
    
    // Crear tabla auth_logs
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS auth_logs (
        id SERIAL PRIMARY KEY,
        usuario_id VARCHAR(255) NOT NULL,
        tipo_evento VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        detalles JSONB
      )
    `;
    
    // Crear índices para auth_logs
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_auth_logs_usuario_id ON auth_logs(usuario_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_auth_logs_tipo_evento ON auth_logs(tipo_evento)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON auth_logs(timestamp)`;
    
    console.log('✅ Tabla auth_logs creada exitosamente');
    
    console.log('Creando tabla access_logs...');
    
    // Crear tabla access_logs
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS access_logs (
        id SERIAL PRIMARY KEY,
        usuario_id VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL,
        modulo VARCHAR(50) NOT NULL,
        accion VARCHAR(50) NOT NULL,
        estudiante_id VARCHAR(255),
        timestamp TIMESTAMP DEFAULT NOW(),
        duracion_ms INTEGER,
        detalles JSONB
      )
    `;
    
    // Crear índices para access_logs
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_access_logs_usuario_id ON access_logs(usuario_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_access_logs_modulo ON access_logs(modulo)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_access_logs_estudiante_id ON access_logs(estudiante_id)`;
    
    console.log('✅ Tabla access_logs creada exitosamente');
    
    console.log('Creando tabla file_uploads...');
    
    // Crear tabla file_uploads
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id SERIAL PRIMARY KEY,
        usuario_id VARCHAR(255) NOT NULL,
        tipo_archivo VARCHAR(20) NOT NULL,
        estado VARCHAR(20) NOT NULL,
        registros_procesados INTEGER,
        registros_con_error INTEGER,
        fecha_subida TIMESTAMP DEFAULT NOW(),
        detalles JSONB
      )
    `;
    
    // Crear índices para file_uploads
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_file_uploads_usuario_id ON file_uploads(usuario_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_file_uploads_tipo_archivo ON file_uploads(tipo_archivo)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_file_uploads_estado ON file_uploads(estado)`;
    
    console.log('✅ Tabla file_uploads creada exitosamente');
    
    console.log('\n🎉 Todas las tablas de logging han sido creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error al crear tablas:', error.message);
    console.error('Detalles del error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();