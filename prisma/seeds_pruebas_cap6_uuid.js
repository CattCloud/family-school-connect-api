'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

/**
 * Script para crear datos de prueba para el capítulo 6 de la tesis (con UUIDs)
 * 
 * Este script crea:
 * 1. Usuarios para las 3 instancias de prueba (2 padres, 1 docente)
 * 2. Niveles y grados
 * 3. Estudiantes vinculados a los padres
 * 4. Cursos asignados al docente
 * 5. Relaciones entre padres y estudiantes
 * 6. Asignaciones de cursos al docente
 * 7. Estructura de evaluación para los cursos
 */
async function main() {
  console.log('Iniciando creación de datos de prueba para el capítulo 6...');

  // Limpiar datos existentes (opcional, comentar si no se desea limpiar)
  await limpiarDatos();

  // 1. Crear usuarios para las instancias de prueba
  const usuarios = await crearUsuarios();

  // 2. Crear niveles y grados
  const nivelesGrados = await crearNivelesGrados();

  // 3. Crear estudiantes
  const estudiantes = await crearEstudiantes(nivelesGrados);

  // 4. Crear cursos
  const cursos = await crearCursos(nivelesGrados);

  // 5. Crear relaciones familiares
  await crearRelacionesFamiliares(usuarios, estudiantes);

  // 6. Crear asignaciones de cursos
  await crearAsignacionesCursos(usuarios, cursos, nivelesGrados);

  // 7. Crear estructura de evaluación
  await crearEstructuraEvaluacion(cursos);

  console.log('Datos de prueba creados exitosamente.');
}

/**
 * Limpia los datos existentes para evitar duplicados
 */
async function limpiarDatos() {
  console.log('Limpiando datos existentes...');

  // Limpiar tablas de permisos (dependen de usuarios)
  await prisma.permisoDocente.deleteMany({});
  await prisma.permisoDocenteLog.deleteMany({});
  console.log('✅ Tablas de permisos limpiadas');

  // Intentar limpiar tablas de logging si existen (no dependen de otras)
  try {
    await prisma.$executeRaw`DELETE FROM auth_logs`;
    console.log('✅ Tabla auth_logs limpiada');
  } catch (error) {
    console.log('⚠️ Tabla auth_logs no existe o no se puede limpiar');
  }

  try {
    await prisma.$executeRaw`DELETE FROM access_logs`;
    console.log('✅ Tabla access_logs limpiada');
  } catch (error) {
    console.log('⚠️ Tabla access_logs no existe o no se puede limpiar');
  }

  try {
    await prisma.$executeRaw`DELETE FROM file_uploads`;
    console.log('✅ Tabla file_uploads limpiada');
  } catch (error) {
    console.log('⚠️ Tabla file_uploads no existe o no se puede limpiar');
  }

  // Eliminar en orden para respetar las restricciones de clave foránea
  await prisma.archivoAdjunto.deleteMany({});
  await prisma.mensaje.deleteMany({});
  await prisma.conversacion.deleteMany({});
  await prisma.evaluacion.deleteMany({});
  await prisma.asistencia.deleteMany({});
  await prisma.asignacionDocenteCurso.deleteMany({});
  await prisma.relacionesFamiliares.deleteMany({});
  await prisma.estructuraEvaluacion.deleteMany({});
  await prisma.estudiante.deleteMany({});
  await prisma.curso.deleteMany({});
  await prisma.nivelGrado.deleteMany({});
  
  // Limpiar tablas de autenticación (dependen de usuarios)
  await prisma.passwordResetToken.deleteMany({});
  await prisma.tokenBlacklist.deleteMany({});
  
  // Finalmente limpiar usuarios (ahora no hay referencias)
  await prisma.usuario.deleteMany({});

  console.log('Datos existentes eliminados.');
}

/**
 * Crea los usuarios para las instancias de prueba
 */
async function crearUsuarios() {
  console.log('Creando usuarios...');

  const passwordHash = await bcrypt.hash('Test123!', 10);

  // Padre Activo: Carlos Méndez
  const padreActivoId = uuidv4();
  const padreActivo = await prisma.usuario.create({
    data: {
      id: padreActivoId,
      tipo_documento: 'DNI',
      nro_documento: '12345678',
      nombre: 'Carlos',
      apellido: 'Méndez',
      rol: 'apoderado',
      telefono: '999111222',
      password_hash: passwordHash,
      estado_activo: true,
      fecha_creacion: new Date(),
      fecha_ultimo_login: new Date()
    }
  });

  // Padre Reactivo: Ana Torres
  const padreReactivoId = uuidv4();
  const padreReactivo = await prisma.usuario.create({
    data: {
      id: padreReactivoId,
      tipo_documento: 'DNI',
      nro_documento: '87654321',
      nombre: 'Ana',
      apellido: 'Torres',
      rol: 'apoderado',
      telefono: '999333444',
      password_hash: passwordHash,
      estado_activo: true,
      fecha_creacion: new Date(),
      fecha_ultimo_login: new Date()
    }
  });

  // Docente: María González
  const docenteId = uuidv4();
  const docente = await prisma.usuario.create({
    data: {
      id: docenteId,
      tipo_documento: 'DNI',
      nro_documento: '11223344',
      nombre: 'María',
      apellido: 'González',
      rol: 'docente',
      telefono: '999555666',
      password_hash: passwordHash,
      estado_activo: true,
      fecha_creacion: new Date(),
      fecha_ultimo_login: new Date()
    }
  });

  console.log('Usuarios creados:', {
    padreActivo: padreActivo.id,
    padreReactivo: padreReactivo.id,
    docente: docente.id
  });

  return { 
    padreActivo: { ...padreActivo, idString: 'padre_activo' }, 
    padreReactivo: { ...padreReactivo, idString: 'padre_reactivo' }, 
    docente: { ...docente, idString: 'docente_prueba' } 
  };
}

/**
 * Crea los niveles y grados necesarios
 */
async function crearNivelesGrados() {
  console.log('Creando niveles y grados...');

  // Nivel Primaria - Grado 4
  const primaria4Id = uuidv4();
  const primaria4 = await prisma.nivelGrado.create({
    data: {
      id: primaria4Id,
      nivel: 'Primaria',
      grado: '4',
      descripcion: 'Cuarto grado de primaria',
      estado_activo: true
    }
  });

  // Nivel Primaria - Grado 6
  const primaria6Id = uuidv4();
  const primaria6 = await prisma.nivelGrado.create({
    data: {
      id: primaria6Id,
      nivel: 'Primaria',
      grado: '6',
      descripcion: 'Sexto grado de primaria',
      estado_activo: true
    }
  });

  // Nivel Secundaria - Grado 3
  const secundaria3Id = uuidv4();
  const secundaria3 = await prisma.nivelGrado.create({
    data: {
      id: secundaria3Id,
      nivel: 'Secundaria',
      grado: '3',
      descripcion: 'Tercer grado de secundaria',
      estado_activo: true
    }
  });

  console.log('Niveles y grados creados:', {
    primaria4: primaria4.id,
    primaria6: primaria6.id,
    secundaria3: secundaria3.id
  });

  return { 
    primaria4: { ...primaria4, idString: 'ng_primaria_4' }, 
    primaria6: { ...primaria6, idString: 'ng_primaria_6' }, 
    secundaria3: { ...secundaria3, idString: 'ng_secundaria_3' } 
  };
}

/**
 * Crea los estudiantes para las pruebas
 */
async function crearEstudiantes(nivelesGrados) {
  console.log('Creando estudiantes...');

  // Estudiante 1: Hijo 1 del Padre Activo (4to Primaria)
  const estudiante1Id = uuidv4();
  const estudiante1 = await prisma.estudiante.create({
    data: {
      id: estudiante1Id,
      codigo_estudiante: 'EST001',
      nombre: 'Juan',
      apellido: 'Méndez',
      nivel_grado_id: nivelesGrados.primaria4.id,
      año_academico: 2025,
      estado_matricula: 'activo'
    }
  });

  // Estudiante 2: Hijo 2 del Padre Activo (6to Primaria)
  const estudiante2Id = uuidv4();
  const estudiante2 = await prisma.estudiante.create({
    data: {
      id: estudiante2Id,
      codigo_estudiante: 'EST002',
      nombre: 'María',
      apellido: 'Méndez',
      nivel_grado_id: nivelesGrados.primaria6.id,
      año_academico: 2025,
      estado_matricula: 'activo'
    }
  });

  // Estudiante 3: Hijo del Padre Reactivo (3ro Secundaria)
  const estudiante3Id = uuidv4();
  const estudiante3 = await prisma.estudiante.create({
    data: {
      id: estudiante3Id,
      codigo_estudiante: 'EST003',
      nombre: 'Pedro',
      apellido: 'Torres',
      nivel_grado_id: nivelesGrados.secundaria3.id,
      año_academico: 2025,
      estado_matricula: 'activo'
    }
  });

  console.log('Estudiantes creados:', {
    estudiante1: estudiante1.id,
    estudiante2: estudiante2.id,
    estudiante3: estudiante3.id
  });

  return { 
    estudiante1: { ...estudiante1, idString: 'estudiante1' }, 
    estudiante2: { ...estudiante2, idString: 'estudiante2' }, 
    estudiante3: { ...estudiante3, idString: 'estudiante3' } 
  };
}

/**
 * Crea los cursos para las pruebas
 */
async function crearCursos(nivelesGrados) {
  console.log('Creando cursos...');

  // Curso 1: Matemáticas 4to Primaria
  const curso1Id = uuidv4();
  const curso1 = await prisma.curso.create({
    data: {
      id: curso1Id,
      nombre: 'Matemáticas',
      codigo_curso: 'MAT-P4',
      nivel_grado_id: nivelesGrados.primaria4.id,
      año_academico: 2025,
      estado_activo: true
    }
  });

  // Curso 2: Comunicación 4to Primaria
  const curso2Id = uuidv4();
  const curso2 = await prisma.curso.create({
    data: {
      id: curso2Id,
      nombre: 'Comunicación',
      codigo_curso: 'COM-P4',
      nivel_grado_id: nivelesGrados.primaria4.id,
      año_academico: 2025,
      estado_activo: true
    }
  });

  // Curso 3: Matemáticas 6to Primaria
  const curso3Id = uuidv4();
  const curso3 = await prisma.curso.create({
    data: {
      id: curso3Id,
      nombre: 'Matemáticas',
      codigo_curso: 'MAT-P6',
      nivel_grado_id: nivelesGrados.primaria6.id,
      año_academico: 2025,
      estado_activo: true
    }
  });

  // Curso 4: Comunicación 6to Primaria
  const curso4Id = uuidv4();
  const curso4 = await prisma.curso.create({
    data: {
      id: curso4Id,
      nombre: 'Comunicación',
      codigo_curso: 'COM-P6',
      nivel_grado_id: nivelesGrados.primaria6.id,
      año_academico: 2025,
      estado_activo: true
    }
  });

  // Curso 5: Matemáticas 3ro Secundaria
  const curso5Id = uuidv4();
  const curso5 = await prisma.curso.create({
    data: {
      id: curso5Id,
      nombre: 'Matemáticas',
      codigo_curso: 'MAT-S3',
      nivel_grado_id: nivelesGrados.secundaria3.id,
      año_academico: 2025,
      estado_activo: true
    }
  });

  console.log('Cursos creados:', {
    curso1: curso1.id,
    curso2: curso2.id,
    curso3: curso3.id,
    curso4: curso4.id,
    curso5: curso5.id
  });

  return { 
    curso1: { ...curso1, idString: 'curso1' }, 
    curso2: { ...curso2, idString: 'curso2' }, 
    curso3: { ...curso3, idString: 'curso3' }, 
    curso4: { ...curso4, idString: 'curso4' }, 
    curso5: { ...curso5, idString: 'curso5' } 
  };
}

/**
 * Crea las relaciones familiares entre padres y estudiantes
 */
async function crearRelacionesFamiliares(usuarios, estudiantes) {
  console.log('Creando relaciones familiares...');

  // Padre Activo - Estudiante 1
  await prisma.relacionesFamiliares.create({
    data: {
      apoderado_id: usuarios.padreActivo.id,
      estudiante_id: estudiantes.estudiante1.id,
      tipo_relacion: 'padre',
      fecha_asignacion: new Date(),
      estado_activo: true,
      año_academico: 2025
    }
  });

  // Padre Activo - Estudiante 2
  await prisma.relacionesFamiliares.create({
    data: {
      apoderado_id: usuarios.padreActivo.id,
      estudiante_id: estudiantes.estudiante2.id,
      tipo_relacion: 'padre',
      fecha_asignacion: new Date(),
      estado_activo: true,
      año_academico: 2025
    }
  });

  // Padre Reactivo - Estudiante 3
  await prisma.relacionesFamiliares.create({
    data: {
      apoderado_id: usuarios.padreReactivo.id,
      estudiante_id: estudiantes.estudiante3.id,
      tipo_relacion: 'madre',
      fecha_asignacion: new Date(),
      estado_activo: true,
      año_academico: 2025
    }
  });

  console.log('Relaciones familiares creadas.');
}

/**
 * Crea las asignaciones de cursos al docente
 */
async function crearAsignacionesCursos(usuarios, cursos, nivelesGrados) {
  console.log('Creando asignaciones de cursos...');

  // Docente - Curso 1 (Matemáticas 4to Primaria)
  await prisma.asignacionDocenteCurso.create({
    data: {
      id: uuidv4(),
      docente_id: usuarios.docente.id,
      curso_id: cursos.curso1.id,
      nivel_grado_id: nivelesGrados.primaria4.id,
      año_academico: 2025,
      fecha_asignacion: new Date(),
      estado_activo: true
    }
  });

  // Docente - Curso 3 (Matemáticas 6to Primaria)
  await prisma.asignacionDocenteCurso.create({
    data: {
      id: uuidv4(),
      docente_id: usuarios.docente.id,
      curso_id: cursos.curso3.id,
      nivel_grado_id: nivelesGrados.primaria6.id,
      año_academico: 2025,
      fecha_asignacion: new Date(),
      estado_activo: true
    }
  });

  // Docente - Curso 5 (Matemáticas 3ro Secundaria)
  await prisma.asignacionDocenteCurso.create({
    data: {
      id: uuidv4(),
      docente_id: usuarios.docente.id,
      curso_id: cursos.curso5.id,
      nivel_grado_id: nivelesGrados.secundaria3.id,
      año_academico: 2025,
      fecha_asignacion: new Date(),
      estado_activo: true
    }
  });

  console.log('Asignaciones de cursos creadas.');
}

/**
 * Crea la estructura de evaluación para los cursos
 */
async function crearEstructuraEvaluacion(cursos) {
  console.log('Creando estructura de evaluación...');

  // Componentes comunes para todos los cursos
  const componentesComunes = [
    {
      nombre: 'Examen Parcial',
      descripcion: 'Evaluación parcial del trimestre',
      peso: 30,
      tipo: 'unica',
      orden: 1
    },
    {
      nombre: 'Examen Final',
      descripcion: 'Evaluación final del trimestre',
      peso: 40,
      tipo: 'unica',
      orden: 2
    },
    {
      nombre: 'Participación',
      descripcion: 'Participación en clase',
      peso: 10,
      tipo: 'recurrente',
      orden: 3
    },
    {
      nombre: 'Tareas',
      descripcion: 'Tareas y trabajos',
      peso: 20,
      tipo: 'recurrente',
      orden: 4
    }
  ];

  // Crear componentes para cada curso
  for (const componente of componentesComunes) {
    await prisma.estructuraEvaluacion.create({
      data: {
        id: uuidv4(),
        año_academico: 2025,
        nombre_item: componente.nombre,
        peso_porcentual: componente.peso,
        tipo_evaluacion: componente.tipo,
        orden_visualizacion: componente.orden,
        estado_activo: true,
        fecha_configuracion: new Date(),
        bloqueada: false
      }
    });
  }

  console.log('Estructura de evaluación creada.');
}

// Ejecutar el script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });