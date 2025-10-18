'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// Datos solicitados por el usuario para el docente de prueba
const payload = {
  tipo_documento: 'DNI',
  nro_documento: '77777777',
  password: '123456789',
  rol: 'docente',
  nombre: 'Docente',
  apellido: 'Prueba',
  telefono: '+51977777777',
  estado_activo: true,
  debe_cambiar_password: false,
};

async function upsertUsuario(u) {
  const password_hash = await bcrypt.hash(u.password, SALT_ROUNDS);

  const res = await prisma.usuario.upsert({
    where: {
      usuarios_documento_unique: {
        tipo_documento: u.tipo_documento,
        nro_documento: u.nro_documento,
      },
    },
    update: {
      password_hash,
      rol: u.rol,
      nombre: u.nombre,
      apellido: u.apellido,
      telefono: u.telefono,
      estado_activo: u.estado_activo,
      debe_cambiar_password: u.debe_cambiar_password,
    },
    create: {
      tipo_documento: u.tipo_documento,
      nro_documento: u.nro_documento,
      password_hash,
      rol: u.rol,
      nombre: u.nombre,
      apellido: u.apellido,
      telefono: u.telefono,
      estado_activo: u.estado_activo,
      debe_cambiar_password: u.debe_cambiar_password,
    },
  });

  return res;
}

async function main() {
  console.log('🔄 Creando docente de prueba...');
  const user = await upsertUsuario(payload);
  console.table([
    {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      tipo_documento: user.tipo_documento,
      nro_documento: user.nro_documento,
      telefono: user.telefono,
      activo: user.estado_activo,
    },
  ]);
  console.log('✅ Docente de prueba creado exitosamente.');
  console.log('📋 Credenciales:');
  console.log(`   Documento: ${payload.nro_documento}`);
  console.log(`   Contraseña: ${payload.password}`);
  console.log(`   Rol: ${payload.rol}`);
  console.log('🔐 Puedes usar estas credenciales para probar el acceso docente al sistema.');
  console.log('📚 Acceso a módulos académicos, registro de calificaciones y seguimiento de estudiantes.');
  console.log('💡 Para asignar cursos, usar el módulo de gestión de usuarios o asignación directa desde admin.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });