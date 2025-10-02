'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

function currentYear() {
  const y = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

async function upsertUsuario({
  tipo_documento,
  nro_documento,
  password,
  rol,
  nombre,
  apellido,
  telefono,
  debe_cambiar_password = false,
  estado_activo = true,
}) {
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

async function ensureNivelGrado({ nivel, grado, descripcion }) {
  // Prisma upsert requiere selector único; usamos find/create por claridad
  const found = await prisma.nivelGrado.findFirst({ where: { nivel, grado } });
  if (found) return found;
  return prisma.nivelGrado.create({
    data: { nivel, grado, descripcion, estado_activo: true },
  });
}

async function ensureCurso({ nombre, codigo_curso, nivel_grado_id, year }) {
  const existing = await prisma.curso.findFirst({ where: { codigo_curso } });
  if (existing) return existing;
  return prisma.curso.create({
    data: {
      nombre,
      codigo_curso,
      nivel_grado_id,
      año_academico: year,
      estado_activo: true,
    },
  });
}

async function ensureAsignacionDocenteCurso({ docente_id, curso_id, nivel_grado_id, year }) {
  const existing = await prisma.asignacionDocenteCurso.findFirst({
    where: { docente_id, curso_id, año_academico: year },
  });
  if (existing) return existing;
  return prisma.asignacionDocenteCurso.create({
    data: {
      docente_id,
      curso_id,
      nivel_grado_id,
      año_academico: year,
      fecha_asignacion: new Date(),
      estado_activo: true,
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

  // Datos maestros mínimos para pruebas de permisos
  const year = currentYear();
  const ng = await ensureNivelGrado({ nivel: 'Primaria', grado: '3', descripcion: '3ro de Primaria' });
  const curso = await ensureCurso({
    nombre: 'Matemáticas',
    codigo_curso: `C-PRI-3-001`,
    nivel_grado_id: ng.id,
    year,
  });
  await ensureAsignacionDocenteCurso({
    docente_id: docente.id,
    curso_id: curso.id,
    nivel_grado_id: ng.id,
    year,
  });

  console.log('Usuarios sembrados:');
  console.table([
    { rol: admin.rol, doc: admin.nro_documento },
    { rol: director.rol, doc: director.nro_documento },
    { rol: docente.rol, doc: docente.nro_documento, debe_cambiar_password: docente.debe_cambiar_password },
    { rol: apoderado.rol, doc: apoderado.nro_documento },
  ]);

  console.log('Catálogos básicos creados: Nivel/Grado y Curso con asignación al docente.');
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