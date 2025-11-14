/**
 * Seeds de población base para Fase 3 de Validación (simulación 14 días)
 * Crea:
 * - 1 Nivel/Grado (Primaria 4to)
 * - 8 Cursos (Matemática, Comunicación, etc.)
 * - 4 Usuarios (apoderado, docente, director, administrador)
 * - 1 Estudiante y relación familiar con el apoderado
 * - Asignaciones del docente a 3 cursos
 * - Estructura de evaluación (3 componentes)
 * - 24 Evaluaciones (8 cursos × 3 componentes) con algunas bajas (< 11)
 * - 40 registros de asistencia distribuidos en estados
 *
 * Idempotente: usa upsert/findFirst para evitar duplicados.
 * Requiere: DATABASE_URL configurado. Prisma Client generado.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ANIO = 2025;
const TRIMESTRE = 2;

// Cursos base para el nivel
const CURSOS_BASE = [
  { nombre: 'Matemática', codigo: 'MAT-P4-2025' },
  { nombre: 'Comunicación', codigo: 'COM-P4-2025' },
  { nombre: 'Ciencia y Tecnología', codigo: 'CYT-P4-2025' },
  { nombre: 'Personal Social', codigo: 'PS-P4-2025' },
  { nombre: 'Arte y Cultura', codigo: 'ART-P4-2025' },
  { nombre: 'Educación Física', codigo: 'EF-P4-2025' },
  { nombre: 'Educación Religiosa', codigo: 'ER-P4-2025' },
  { nombre: 'Inglés', codigo: 'ING-P4-2025' }
];

// Estados de asistencia a distribuir
const DISTRIB_ASISTENCIA = {
  presente: 28,             // 70%
  tardanza: 4,              // 10%
  falta_injustificada: 6,   // 15%
  falta_justificada: 2      // 5%
};

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mapea calificación numérica a letra simple (aprox.)
function numToLetra(n) {
  if (n >= 17) return 'AD';
  if (n >= 14) return 'A';
  if (n >= 11) return 'B';
  return 'C';
}

async function upsertUsuario({ tipo_documento, nro_documento, password_hash, rol, nombre, apellido, telefono }) {
  // Usa la clave compuesta única definida en el schema:
  // @@unique([tipo_documento, nro_documento], name: "usuarios_documento_unique")
  return prisma.usuario.upsert({
    where: { usuarios_documento_unique: { tipo_documento, nro_documento } },
    update: {
      tipo_documento, password_hash, rol, nombre, apellido, telefono, estado_activo: true
    },
    create: {
      tipo_documento, nro_documento, password_hash, rol, nombre, apellido, telefono
    }
  });
}

async function getOrCreateNivelGrado(nivel, grado) {
  const existing = await prisma.nivelGrado.findFirst({ where: { nivel, grado } });
  if (existing) return existing;
  return prisma.nivelGrado.create({ data: { nivel, grado, estado_activo: true } });
}

async function getOrCreateCurso(nivel_grado_id, nombre, codigo) {
  const existing = await prisma.curso.findFirst({ where: { codigo_curso: codigo } });
  if (existing) return existing;
  return prisma.curso.create({
    data: {
      nombre,
      codigo_curso: codigo,
      nivel_grado_id,
      año_academico: ANIO,
      estado_activo: true
    }
  });
}

async function getOrCreateEstudiante({ codigo_estudiante, nombre, apellido, nivel_grado_id }) {
  const existing = await prisma.estudiante.findFirst({ where: { codigo_estudiante } });
  if (existing) return existing;
  return prisma.estudiante.create({
    data: {
      codigo_estudiante,
      nombre,
      apellido,
      nivel_grado_id,
      año_academico: ANIO,
      estado_matricula: 'activo'
    }
  });
}

async function ensureRelacionFamiliar(apoderado_id, estudiante_id) {
  const rel = await prisma.relacionesFamiliares.findFirst({
    where: { apoderado_id, estudiante_id, año_academico: ANIO }
  });
  if (rel) return rel;
  return prisma.relacionesFamiliares.create({
    data: {
      apoderado_id,
      estudiante_id,
      tipo_relacion: 'padre',
      estado_activo: true,
      año_academico: ANIO
    }
  });
}

async function ensureAsignacionDocente(docente_id, curso, nivel_grado_id) {
  const found = await prisma.asignacionDocenteCurso.findFirst({
    where: { docente_id, curso_id: curso.id, estado_activo: true, año_academico: ANIO }
  });
  if (found) return found;
  return prisma.asignacionDocenteCurso.create({
    data: {
      docente_id,
      curso_id: curso.id,
      nivel_grado_id,
      año_academico: ANIO,
      fecha_asignacion: new Date(),
      estado_activo: true
    }
  });
}

async function ensurePermisoDocente(docente_id, tipo_permiso, año, otorgado_por) {
  const exist = await prisma.permisoDocente.findFirst({
    where: { docente_id, tipo_permiso, año_academico: año }
  });
  if (exist) return exist;
  return prisma.permisoDocente.create({
    data: {
      docente_id,
      tipo_permiso,
      estado_activo: true,
      año_academico: año,
      otorgado_por
    }
  });
}

async function ensureEstructuraEvaluacion() {
  // Crea 3 componentes si no existen (por año)
  const items = [
    { nombre_item: 'Práctica Calificada', peso_porcentual: '40.00', tipo_evaluacion: 'recurrente', orden_visualizacion: 1 },
    { nombre_item: 'Tarea Domiciliaria', peso_porcentual: '30.00', tipo_evaluacion: 'recurrente', orden_visualizacion: 2 },
    { nombre_item: 'Examen Trimestral', peso_porcentual: '30.00', tipo_evaluacion: 'unica', order: 3 }
  ];

  const created = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const exist = await prisma.estructuraEvaluacion.findFirst({
      where: { año_academico: ANIO, nombre_item: it.nombre_item, estado_activo: true }
    });
    if (exist) {
      created.push(exist);
    } else {
      const row = await prisma.estructuraEvaluacion.create({
        data: {
          año_academico: ANIO,
          nombre_item: it.nombre_item,
          peso_porcentual: it.peso_porcentual,
          tipo_evaluacion: it.tipo_evaluacion,
          orden_visualizacion: it.orden_visualizacion ?? (i + 1),
          estado_activo: true,
          bloqueada: true
        }
      });
      created.push(row);
    }
  }
  return created;
}

async function seedEvaluaciones(estudiante, cursos, estructuraItems, registrante_id) {
  // Crea 3 evaluaciones por curso (una por componente), con algunas bajas
  const baseDate = new Date(`${ANIO}-07-15T10:00:00Z`);
  let bajasRestantes = 3; // 3 calificaciones < 11 para disparar alertas en simulación

  for (const curso of cursos) {
    for (const comp of estructuraItems) {
      let nota = randInt(12, 18);
      if (bajasRestantes > 0 && Math.random() < 0.25) {
        nota = randInt(7, 10);
        bajasRestantes--;
      }

      const letra = numToLetra(nota);
      const fechaEval = addDays(baseDate, randInt(0, 20));

      // Evita duplicados (mismo estudiante, curso, trimestre, estructura)
      const exists = await prisma.evaluacion.findFirst({
        where: {
          estudiante_id: estudiante.id,
          curso_id: curso.id,
          estructura_evaluacion_id: comp.id,
          trimestre: TRIMESTRE,
          año_academico: ANIO
        }
      });
      if (exists) continue;

      await prisma.evaluacion.create({
        data: {
          estudiante_id: estudiante.id,
          curso_id: curso.id,
          estructura_evaluacion_id: comp.id,
          trimestre: TRIMESTRE,
          año_academico: ANIO,
          fecha_evaluacion: fechaEval,
          calificacion_numerica: String(nota),
          calificacion_letra: letra,
          observaciones: null,
          estado: 'preliminar',
          registrado_por: registrante_id
        }
      });
    }
  }
}

async function seedAsistencias(estudiante, cursos, registrante_id) {
  // Distribuir 40 registros totales a lo largo de varios días y cursos
  const total =
    DISTRIB_ASISTENCIA.presente +
    DISTRIB_ASISTENCIA.tardanza +
    DISTRIB_ASISTENCIA.falta_injustificada +
    DISTRIB_ASISTENCIA.falta_justificada;

  const estados = [];
  for (let i = 0; i < DISTRIB_ASISTENCIA.presente; i++) estados.push('presente');
  for (let i = 0; i < DISTRIB_ASISTENCIA.tardanza; i++) estados.push('tardanza');
  for (let i = 0; i < DISTRIB_ASISTENCIA.falta_injustificada; i++) estados.push('falta_injustificada');
  for (let i = 0; i < DISTRIB_ASISTENCIA.falta_justificada; i++) estados.push('falta_justificada');

  const startDate = new Date(`${ANIO}-10-15T13:00:00Z`);

  for (let i = 0; i < total; i++) {
    const estado = estados[i];
    const curso = cursos[i % cursos.length];
    const fecha = addDays(startDate, i % 10); // 10 días calendario

    // Evita duplicado por clave única (estudiante_id, curso_id, fecha)
    const exists = await prisma.asistencia.findFirst({
      where: {
        estudiante_id: estudiante.id,
        curso_id: curso.id,
        fecha: fecha
      }
    });
    if (exists) continue;

    await prisma.asistencia.create({
      data: {
        estudiante_id: estudiante.id,
        curso_id: curso.id,
        fecha,
        estado,
        hora_llegada: estado === 'tardanza' ? `${8 + (i % 2)}:${randInt(0, 59).toString().padStart(2, '0')}` : null,
        justificacion: estado.includes('justificada') ? 'Documento presentado' : null,
        año_academico: ANIO,
        tipo_asistencia: estado.includes('falta') ? 'falta' : (estado === 'tardanza' ? 'tardanza' : 'asistencia'),
        observaciones: null,
        registrado_por: registrante_id
      }
    });
  }
}

async function main() {
  console.log('Seeding población base para simulación Fase 3...');

  // 1) Nivel/Grado
  const nivel = await getOrCreateNivelGrado('Primaria', '4to');
  console.log(`Nivel/Grado: ${nivel.nivel} ${nivel.grado}`);

  // 1.1) Nivel/Grado adicional requerido por el plan (Secundaria 3ro)
  const nivelSecundaria = await getOrCreateNivelGrado('Secundaria', '3ro');
  console.log(`Nivel/Grado adicional: ${nivelSecundaria.nivel} ${nivelSecundaria.grado}`);

  // 2) Cursos (8)
  const cursos = [];
  for (const c of CURSOS_BASE) {
    const curso = await getOrCreateCurso(nivel.id, c.nombre, c.codigo);
    cursos.push(curso);
  }
  console.log(`Cursos creados/asegurados: ${cursos.length}`);

  // 3) Usuarios (apoderado, docente, director, administrador)
  // Nota: password_hash de ejemplo (no se usará login real para la simulación de logs)
  const apoderado = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '12345678',
    password_hash: '$2b$10$7u7u7u7u7u7u7u7u7u7uuO8h5m4o6f', // dummy
    rol: 'apoderado',
    nombre: 'Carlos',
    apellido: 'Méndez',
    telefono: '987654321'
  });

  const docente = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '23456789',
    password_hash: '$2b$10$7u7u7u7u7u7u7u7u7u7uuO8h5m4o6f',
    rol: 'docente',
    nombre: 'María',
    apellido: 'González',
    telefono: '987654322'
  });

  const director = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '34567890',
    password_hash: '$2b$10$7u7u7u7u7u7u7u7u7u7uuO8h5m4o6f',
    rol: 'director',
    nombre: 'Jorge',
    apellido: 'Ramírez',
    telefono: '987654323'
  });

  const administrador = await upsertUsuario({
    tipo_documento: 'DNI',
    nro_documento: '45678901',
    password_hash: '$2b$10$7u7u7u7u7u7u7u7u7u7uuO8h5m4o6f',
    rol: 'administrador',
    nombre: 'Ana',
    apellido: 'Torres',
    telefono: '987654324'
  });

  console.log('Usuarios asegurados:', {
    apoderado: apoderado.id, docente: docente.id, director: director.id, administrador: administrador.id
  });

  // 4) Estudiante y relación con apoderado
  const estudiante = await getOrCreateEstudiante({
    codigo_estudiante: 'EST-2025-001',
    nombre: 'Luis',
    apellido: 'Méndez García',
    nivel_grado_id: nivel.id
  });

  await ensureRelacionFamiliar(apoderado.id, estudiante.id);
  console.log(`Estudiante ${estudiante.codigo_estudiante} relacionado con apoderado.`);

  // 5) Asignar docente a 3 cursos
  for (const curso of cursos.slice(0, 3)) {
    await ensureAsignacionDocente(docente.id, curso, nivel.id);
  }
  console.log('Asignaciones de docente aseguradas para 3 cursos.');

  // 5.1) Permisos del docente para comunicados y encuestas (según plan 2.7.2)
  await ensurePermisoDocente(docente.id, 'comunicados', ANIO, director.id);
  await ensurePermisoDocente(docente.id, 'encuestas', ANIO, director.id);
  console.log('Permisos del docente asegurados: comunicados, encuestas.');

  // 6) Estructura de evaluación (3 componentes)
  const estructuraItems = await ensureEstructuraEvaluacion();
  console.log(`Estructura de evaluación lista: ${estructuraItems.length} componentes.`);

  // 7) Evaluaciones (24 registros esperados: 8 cursos × 3 componentes)
  await seedEvaluaciones(estudiante, cursos, estructuraItems, docente.id);
  console.log('Evaluaciones creadas/aseguradas.');

  // 8) Asistencias (40 registros con distribución)
  await seedAsistencias(estudiante, cursos, docente.id);
  console.log('Asistencias creadas/aseguradas.');

  console.log('✅ Seed de población base completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });