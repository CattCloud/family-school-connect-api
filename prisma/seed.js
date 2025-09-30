'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function upsertUsuario({ tipo_documento, nro_documento, password, rol, nombre, apellido, telefono, debe_cambiar_password = false, estado_activo = true }) {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.usuario.upsert({
    where: {
      usuarios_documento_unique: {
        tipo_documento,
        nro_documento,
      },
    },
    update: {
      password_hash,
      rol,
      nombre,
      apellido,
      telefono,
      estado_activo,
      debe_cambiar_password,
    },
    create: {
      tipo_documento,
      nro_documento,
      password_hash,
      rol,
      nombre,
      apellido,
      telefono,
      estado_activo,
      debe_cambiar_password,
    },
  });
}

async function main() {
  console.log('Seeding base de datos...');

  const admin = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '99999999',
    password: 'Password123',
    rol: 'administrador',
    nombre: 'Admin',
    apellido: 'Sistema',
    telefono: '+51999999999',
  });

  const director = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '88888888',
    password: 'Password123',
    rol: 'director',
    nombre: 'Ana',
    apellido: 'Director',
    telefono: '+51888888888',
  });

  const docente = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '77777777',
    password: 'Password123',
    rol: 'docente',
    nombre: 'Luis',
    apellido: 'Docente',
    telefono: '+51777777777',
    debe_cambiar_password: true,
  });

  const apoderado = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '12345678',
    password: 'Password123',
    rol: 'apoderado',
    nombre: 'Juan',
    apellido: 'Padre',
    telefono: '+51123456789',
  });

  console.log('Usuarios sembrados:');
  console.table([
    { rol: admin.rol, doc: admin.nro_documento },
    { rol: director.rol, doc: director.nro_documento },
    { rol: docente.rol, doc: docente.nro_documento, debe_cambiar_password: docente.debe_cambiar_password },
    { rol: apoderado.rol, doc: apoderado.nro_documento },
  ]);

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });