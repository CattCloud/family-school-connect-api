'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// Datos solicitados por el usuario
const payload = {
  tipo_documento: 'DNI',
  nro_documento: '76931889',
  password: 'Password123',
  rol: 'apoderado',
  nombre: 'Erick',
  apellido: 'Verde',
  telefono: '+51989431173',
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
  console.log('Upserting usuario de prueba para WhatsApp...');
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
  console.log('Listo. Puedes probar POST /auth/forgot-password con el documento indicado.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });