'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// Datos solicitados por el usuario para el apoderado de prueba
const apoderadoPayload = {
  tipo_documento: 'DNI',
  nro_documento: '88888888',
  password: '123456789',
  rol: 'apoderado',
  nombre: 'Apoderado',
  apellido: 'Prueba',
  telefono: '+51988888888',
  estado_activo: true,
  debe_cambiar_password: false,
};

// Datos para el estudiante asociado
const estudiantePayload = {
  codigo_estudiante: 'P3001',
  nombre: 'Estudiante',
  apellido: 'Prueba',
  nivel_grado_id: '3c256547-35e8-45a2-baee-e3d861a8482e', // ID proporcionado por el usuario
  año_academico: 2025,
  estado_matricula: 'activo',
};

// Datos para la relación familiar
const relacionPayload = {
  tipo_relacion: 'apoderado',
  año_academico: 2025,
  estado_activo: true,
};

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function createApoderadoConEstudiante() {
  try {
    console.log('🔄 Creando apoderado de prueba con estudiante asociado...');

    // 1. Crear o actualizar el apoderado
    const password_hash = await hashPassword(apoderadoPayload.password);
    
    const apoderado = await prisma.usuario.upsert({
      where: {
        usuarios_documento_unique: {
          tipo_documento: apoderadoPayload.tipo_documento,
          nro_documento: apoderadoPayload.nro_documento,
        },
      },
      update: {
        password_hash,
        rol: apoderadoPayload.rol,
        nombre: apoderadoPayload.nombre,
        apellido: apoderadoPayload.apellido,
        telefono: apoderadoPayload.telefono,
        estado_activo: apoderadoPayload.estado_activo,
        debe_cambiar_password: apoderadoPayload.debe_cambiar_password,
      },
      create: {
        tipo_documento: apoderadoPayload.tipo_documento,
        nro_documento: apoderadoPayload.nro_documento,
        password_hash,
        rol: apoderadoPayload.rol,
        nombre: apoderadoPayload.nombre,
        apellido: apoderadoPayload.apellido,
        telefono: apoderadoPayload.telefono,
        estado_activo: apoderadoPayload.estado_activo,
        debe_cambiar_password: apoderadoPayload.debe_cambiar_password,
      },
    });

    console.log('✅ Apoderado creado/actualizado:', {
      id: apoderado.id,
      nombre: apoderado.nombre,
      apellido: apoderado.apellido,
      rol: apoderado.rol,
      documento: apoderado.nro_documento,
    });

    // 2. Crear el estudiante
    const estudiante = await prisma.estudiante.create({
      data: estudiantePayload,
    });

    console.log('✅ Estudiante creado:', {
      id: estudiante.id,
      codigo: estudiante.codigo_estudiante,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      nivel_grado_id: estudiante.nivel_grado_id,
      año: estudiante.año_academico,
    });

    // 3. Crear la relación familiar
    const relacion = await prisma.relacionesFamiliares.create({
      data: {
        apoderado_id: apoderado.id,
        estudiante_id: estudiante.id,
        tipo_relacion: relacionPayload.tipo_relacion,
        fecha_asignacion: new Date(),
        estado_activo: relacionPayload.estado_activo,
        año_academico: relacionPayload.año_academico,
      },
    });

    console.log('✅ Relación familiar creada:', {
      id: relacion.id,
      apoderado_id: relacion.apoderado_id,
      estudiante_id: relacion.estudiante_id,
      tipo_relacion: relacion.tipo_relacion,
      año_academico: relacion.año_academico,
    });

    // 4. Mostrar resumen final
    console.log('\n🎉 CREACIÓN EXITOSA COMPLETA');
    console.log('📋 Credenciales para pruebas:');
    console.log('   👤 Usuario:', apoderadoPayload.nro_documento);
    console.log('   🔑 Contraseña:', apoderadoPayload.password);
    console.log('   🎭 Rol:', apoderadoPayload.rol);
    console.log('\n📊 Datos del estudiante asociado:');
    console.log('   🆔 ID:', estudiante.id);
    console.log('   📛 Nombre:', estudiante.nombre + ' ' + estudiante.apellido);
    console.log('   📚 Código:', estudiante.codigo_estudiante);
    console.log('   🎓 Nivel/Grado ID:', estudiante.nivel_grado_id);
    console.log('   📅 Año:', estudiante.año_academico);
    console.log('\n🔗 Relación ID:', relacion.id);
    
    console.log('\n✨ Listo para realizar las pruebas manuales HU-ACAD-06');
    console.log('📝 Documento de pruebas: doc/Semana 6/Pruebas_Manuales_HU-ACAD-06.md');

    return {
      apoderado,
      estudiante,
      relacion,
    };

  } catch (error) {
    console.error('❌ Error durante la creación:', error);
    throw error;
  }
}

async function main() {
  try {
    await createApoderadoConEstudiante();
  } catch (error) {
    console.error('Error en la ejecución principal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();