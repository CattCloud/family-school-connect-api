/**
 * Aplica el SQL de la migración de logging a la BD usando Prisma.
 * Fuente del SQL: prisma/migrations/20251107001500_create_logging_tables/migration.sql
 * Requiere: DATABASE_URL configurado. Prisma Client instalado.
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MIGRATION_FILE = path.resolve(__dirname, '../prisma/migrations/20251107001500_create_logging_tables/migration.sql');

function splitStatements(sql) {
  // Normaliza saltos de línea
  const normalized = sql.replace(/\r\n/g, '\n');

  // Elimina líneas de comentarios '-- ...'
  const noLineComments = normalized
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  // Elimina bloques BEGIN/COMMIT si existen para ejecutar por sentencia
  const cleaned = noLineComments
    .replace(/\bBEGIN\b\s*;?/gi, '')
    .replace(/\bCOMMIT\b\s*;?/gi, '');

  // Separa por ';' seguido de salto de línea o fin de archivo
  const parts = cleaned.split(/;\s*(?:\n|$)/g);

  // Limpia y filtra vacíos
  const statements = parts
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return statements;
}

async function main() {
  console.log('Aplicando migración de tablas de logging...');
  console.log(`Archivo: ${MIGRATION_FILE}`);

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('❌ No se encontró el archivo de migración.');
    process.exit(1);
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  const statements = splitStatements(sql);

  if (statements.length === 0) {
    console.error('❌ No se detectaron sentencias SQL para ejecutar.');
    process.exit(1);
  }

  try {
    for (const stmt of statements) {
      // Asegura un ';' al final por claridad
      const sqlStmt = stmt.endsWith(';') ? stmt : `${stmt};`;
      await prisma.$executeRawUnsafe(sqlStmt);
    }
    console.log('✅ Migración aplicada correctamente.');
  } catch (err) {
    console.error('❌ Error aplicando migración:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();