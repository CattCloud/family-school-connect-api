'use strict';

const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

function getCurrentAcademicYear() {
  const forced = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(forced) ? forced : new Date().getFullYear();
}

function randomPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

 // Validaciones comunes
function validateDocumento(nro) {
  return /^\d{8,12}$/.test(String(nro));
}
function validateTelefono(tel) {
  return /^\+51\d{9}$/.test(String(tel));
}
function normalizeNivel(nivel) {
  if (nivel == null) return null;
  const key = String(nivel).trim().toLowerCase();
  const map = {
    inicial: 'Inicial',
    primaria: 'Primaria',
    secundaria: 'Secundaria',
  };
  return map[key] || null;
}
function assert(cond, code, message, status = 400) {
  if (!cond) {
    const e = new Error(message || code);
    e.code = code;
    e.status = status;
    throw e;
  }
}

// =============== Templates (simples) ===============
function getTemplate(tipo) {
  switch (tipo) {
    case 'padres':
      return {
        headers: ['tipo_documento', 'nro_documento', 'nombre', 'apellido', 'telefono'],
        sample: [
          { tipo_documento: 'DNI', nro_documento: '45678912', nombre: 'Pedro', apellido: 'Pérez', telefono: '+51911111111' },
        ],
      };
    case 'docentes':
      return {
        headers: ['tipo_documento', 'nro_documento', 'nombre', 'apellido', 'telefono'],
        sample: [
          { tipo_documento: 'DNI', nro_documento: '87654321', nombre: 'María', apellido: 'Gómez', telefono: '+51922222222' },
        ],
      };
    case 'estudiantes':
      return {
        headers: ['nombre', 'apellido', 'nivel', 'grado', 'codigo_estudiante(opcional)'],
        sample: [{ nombre: 'Juan', apellido: 'Lopez', nivel: 'Primaria', grado: '3' }],
      };
    case 'relaciones':
      return {
        headers: ['nro_documento_padre', 'codigo_estudiante', 'tipo_relacion'],
        sample: [{ nro_documento_padre: '45678912', codigo_estudiante: 'PRI3-001', tipo_relacion: 'padre' }],
      };
    default:
      assert(false, 'INVALID_TEMPLATE_TYPE', 'Tipo inválido. Use: padres|docentes|estudiantes|relaciones');
  }
}

 // =============== Validación de registros ===============
async function validateUsers(tipo, registros = []) {
  assert(Array.isArray(registros) && registros.length > 0, 'EMPTY_DATA', 'Sin registros para validar');

  const validos = [];
  const con_errores = [];

  const pushError = (idx, msg, datos) => {
    con_errores.push({ fila: idx + 1, errores: [{ mensaje: msg }], datos });
  };

  if (tipo === 'padres' || tipo === 'docentes') {
    const slice = registros.slice(0, 2);

    // Detectar duplicados dentro del mismo lote (mismo tipo_documento + nro_documento)
    const seen = new Set();
    // Preparar claves para verificación masiva en BD
    const keys = [];
    for (const r of slice) {
      if (!r) continue;
      const td = r.tipo_documento;
      const nd = r?.nro_documento != null ? String(r.nro_documento) : undefined;
      if (td && nd) keys.push({ tipo_documento: td, nro_documento: nd });
    }

    // Consultar existencia previa en BD (usuarios)
    let existing = [];
    if (keys.length > 0) {
      existing = await prisma.usuario.findMany({
        where: { OR: keys },
        select: { tipo_documento: true, nro_documento: true },
      });
    }
    const existingSet = new Set(existing.map((e) => `${e.tipo_documento}|${e.nro_documento}`));

    slice.forEach((r, i) => {
      const { tipo_documento, nro_documento, nombre, apellido, telefono } = r || {};
      if (!tipo_documento || !nro_documento || !nombre || !apellido) return pushError(i, 'Campos obligatorios faltantes', r);
      if (!validateDocumento(nro_documento)) return pushError(i, 'Documento inválido (8-12 dígitos)', r);
      if (!validateTelefono(telefono || '')) return pushError(i, 'Teléfono inválido (+51XXXXXXXXX)', r);

      const key = `${tipo_documento}|${String(nro_documento)}`;

      // Duplicado dentro del archivo
      if (seen.has(key)) return pushError(i, `Documento duplicado en archivo: ${String(nro_documento)}`, r);
      // Duplicado contra la BD
      if (existingSet.has(key)) {
        return pushError(
          i,
          `Documento duplicado. Ya existe un usuario con nro_documento ${String(nro_documento)}`,
          r
        );
      }

      seen.add(key);
      validos.push({ tipo_documento, nro_documento: String(nro_documento), nombre, apellido, telefono });
    });
  } else if (tipo === 'estudiantes') {
    const year = getCurrentAcademicYear();
    const slice = registros.slice(0, 2);

    // Preparar claves (nombre + apellido) para verificación masiva en BD
    const keys = [];
    for (const r of slice) {
      if (!r) continue;
      const n = r.nombre != null ? String(r.nombre).trim() : '';
      const a = r.apellido != null ? String(r.apellido).trim() : '';
      if (n && a) keys.push({ nombre: n, apellido: a });
    }

    // Consultar existencia previa en BD (estudiantes del año actual) por nombre+apellido (case-insensitive)
    let existing = [];
    if (keys.length > 0) {
      existing = await prisma.estudiante.findMany({
        where: {
          año_academico: year,
          OR: keys.map((k) => ({
            AND: [
              { nombre: { equals: k.nombre, mode: 'insensitive' } },
              { apellido: { equals: k.apellido, mode: 'insensitive' } },
            ],
          })),
        },
        select: { nombre: true, apellido: true },
      });
    }
    const existingSet = new Set(
      existing.map(
        (e) => `${String(e.nombre).trim().toLowerCase()}|${String(e.apellido).trim().toLowerCase()}`
      )
    );

    // Detectar duplicados dentro del mismo archivo (case-insensitive)
    const seen = new Set();

    slice.forEach((r, i) => {
      const { nombre, apellido, nivel, grado, codigo_estudiante } = r || {};
      if (!nombre || !apellido || !nivel || !grado) return pushError(i, 'Campos obligatorios faltantes', r);
      const canonicalNivel = normalizeNivel(nivel);
      if (!canonicalNivel) return pushError(i, 'Nivel inválido. Valores válidos: Inicial, Primaria, Secundaria', r);

      const key = `${String(nombre).trim().toLowerCase()}|${String(apellido).trim().toLowerCase()}`;

      if (seen.has(key)) {
        return pushError(
          i,
          `Nombre y apellido duplicados en archivo: ${String(nombre)} ${String(apellido)}`,
          r
        );
      }
      if (existingSet.has(key)) {
        return pushError(
          i,
          `Estudiante duplicado. Ya existe un estudiante con nombre y apellido "${String(nombre)} ${String(apellido)}"`,
          r
        );
      }

      seen.add(key);
      validos.push({ nombre, apellido, nivel: canonicalNivel, grado: String(grado), codigo_estudiante });
    });
  } else if (tipo === 'relaciones') {
    registros.slice(0, 2).forEach((r, i) => {
      const { nro_documento_padre, codigo_estudiante, tipo_relacion } = r || {};
      if (!nro_documento_padre || !codigo_estudiante || !tipo_relacion) return pushError(i, 'Campos obligatorios faltantes', r);
      if (!validateDocumento(nro_documento_padre)) return pushError(i, 'Documento apoderado inválido', r);
      if (!['padre', 'madre', 'apoderado', 'tutor'].includes(tipo_relacion)) return pushError(i, 'Tipo de relación inválido', r);
      validos.push({ nro_documento_padre, codigo_estudiante, tipo_relacion });
    });
  } else {
    assert(false, 'INVALID_TYPE', 'Tipo inválido');
  }

  return {
    resumen: {
      total_filas: registros.length,
      validos: validos.length,
      con_errores: con_errores.length,
    },
    registros_validos: validos,
    registros_con_errores: con_errores,
  };
}

// =============== Utilidades de catálogos ===============
async function ensureNivelGrado({ nivel, grado, descripcion }) {
  const found = await prisma.nivelGrado.findFirst({ where: { nivel, grado } });
  if (found) return found;
  return prisma.nivelGrado.create({ data: { nivel, grado, descripcion: descripcion || null, estado_activo: true } });
}

async function autoCodigoEstudiante(nivel, grado) {
  const canonical = normalizeNivel(nivel) || 'Inicial';
  const prefix = `${canonical === 'Primaria' ? 'PRI' : canonical === 'Secundaria' ? 'SEC' : 'INI'}${grado}`;
  const count = await prisma.estudiante.count({ where: { año_academico: getCurrentAcademicYear() } });
  const num = `${count + 1}`.padStart(3, '0');
  return `${prefix}-${num}`;
}

// =============== Ejecución de import ===============
async function executeImport(tipo, registrosValidos = []) {
  const year = getCurrentAcademicYear();
  const exitosos = [];
  const fallidos = [];

  if (tipo === 'padres' || tipo === 'docentes') {
    const rol = tipo === 'padres' ? 'apoderado' : 'docente';
    for (const r of registrosValidos.slice(0, 2)) {
      try {
        const password = randomPassword(9);
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.usuario.create({
          data: {
            tipo_documento: r.tipo_documento,
            nro_documento: r.nro_documento,
            password_hash,
            rol,
            nombre: r.nombre,
            apellido: r.apellido,
            telefono: r.telefono,
            estado_activo: true,
            debe_cambiar_password: true,
          },
          select: { id: true, nombre: true, apellido: true, rol: true, nro_documento: true, telefono: true },
        });
        exitosos.push({ ...user, password_inicial: password });
      } catch (e) {
        logger.error('Import user error', e);
        fallidos.push({ datos: r, error: e.code || e.message });
      }
    }
  } else if (tipo === 'estudiantes') {
    for (const r of registrosValidos.slice(0, 2)) {
      try {
        const canonicalNivel = normalizeNivel(r.nivel);
        if (!canonicalNivel) throw new Error('Nivel inválido. Valores válidos: Inicial, Primaria, Secundaria');

        // Verificación defensiva en BD: unicidad por nombre + apellido en el año académico actual (case-insensitive)
        const dup = await prisma.estudiante.findFirst({
          where: {
            año_academico: year,
            AND: [
              { nombre: { equals: String(r.nombre).trim(), mode: 'insensitive' } },
              { apellido: { equals: String(r.apellido).trim(), mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        });
        if (dup) {
          fallidos.push({
            datos: r,
            error: 'Estudiante duplicado por nombre y apellido en el año académico actual',
          });
          continue;
        }

        const ng = await ensureNivelGrado({ nivel: canonicalNivel, grado: String(r.grado) });
        const codigo = r.codigo_estudiante || (await autoCodigoEstudiante(canonicalNivel, String(r.grado)));
        const est = await prisma.estudiante.create({
          data: {
            codigo_estudiante: codigo,
            nombre: r.nombre,
            apellido: r.apellido,
            nivel_grado_id: ng.id,
            año_academico: year,
            estado_matricula: 'activo',
          },
          select: { id: true, codigo_estudiante: true, nombre: true, apellido: true },
        });
        exitosos.push(est);
      } catch (e) {
        logger.error('Import student error', e);
        const friendly =
          e.code === 'P2002'
            ? 'Estudiante duplicado por nombre y apellido en la base de datos'
            : e.message || 'Error al crear estudiante';
        fallidos.push({ datos: r, error: e.code || friendly });
      }
    }
  } else {
    assert(false, 'INVALID_TYPE', 'Tipo inválido');
  }

  return {
    resumen: { total_procesados: registrosValidos.length, exitosos: exitosos.length, fallidos: fallidos.length },
    exitosos,
    fallidos,
    año_academico: year,
  };
}

// =============== Relaciones familiares ===============
async function validateRelationships(relaciones = []) {
  const year = getCurrentAcademicYear();
  const resultados = [];
  for (const r of relaciones.slice(0, 2)) {
    const padre = await prisma.usuario.findFirst({
      where: { nro_documento: r.nro_documento_padre, rol: 'apoderado', estado_activo: true },
      select: { id: true, nombre: true, apellido: true },
    });
    const est = await prisma.estudiante.findFirst({
      where: { codigo_estudiante: r.codigo_estudiante, año_academico: year },
      select: { id: true, nombre: true, apellido: true },
    });
    resultados.push({
      nro_documento_padre: r.nro_documento_padre,
      padre_existe: !!padre,
      padre_nombre: padre ? `${padre.nombre} ${padre.apellido}` : null,
      codigo_estudiante: r.codigo_estudiante,
      estudiante_existe: !!est,
      estudiante_nombre: est ? `${est.nombre} ${est.apellido}` : null,
      tipo_relacion: r.tipo_relacion,
      valido: !!padre && !!est,
    });
  }
  const validas = resultados.filter((x) => x.valido).length;
  return {
    total_relaciones: resultados.length,
    validas,
    invalidas: resultados.length - validas,
    relaciones_validadas: resultados,
  };
}

async function createRelationships(relaciones = []) {
  const year = getCurrentAcademicYear();
  const detalles = [];
  let creadas = 0;
  for (const r of relaciones.slice(0, 2)) {
    const padre = await prisma.usuario.findFirst({
      where: { nro_documento: r.nro_documento_padre, rol: 'apoderado', estado_activo: true },
      select: { id: true },
    });
    const est = await prisma.estudiante.findFirst({
      where: { codigo_estudiante: r.codigo_estudiante, año_academico: year },
      select: { id: true },
    });
    if (!padre || !est) continue;
    // Permitir solo una relación por estudiante
    const exists = await prisma.relacionesFamiliares.findFirst({
      where: { estudiante_id: est.id, estado_activo: true },
      select: { id: true },
    });
    if (exists) {
      detalles.push({ estudiante_id: est.id, skipped: true });
      continue;
    }
    const row = await prisma.relacionesFamiliares.create({
      data: {
        apoderado_id: padre.id,
        estudiante_id: est.id,
        tipo_relacion: r.tipo_relacion,
        estado_activo: true,
        año_academico: year,
      },
      select: { id: true, apoderado_id: true, estudiante_id: true, tipo_relacion: true, fecha_asignacion: true },
    });
    detalles.push({ ...row, skipped: false });
    creadas++;
  }
  return { relaciones_creadas: creadas, detalles };
}

async function verifyRelationships() {
  const year = getCurrentAcademicYear();
  const total = await prisma.estudiante.count({ where: { año_academico: year } });
  const conRel = await prisma.relacionesFamiliares.findMany({
    where: { estado_activo: true, año_academico: year },
    select: { estudiante_id: true },
  });
  const set = new Set(conRel.map((x) => x.estudiante_id));
  const sin = await prisma.estudiante.findMany({
    where: { año_academico: year, NOT: { id: { in: Array.from(set) } } },
    select: { id: true, codigo_estudiante: true, nombre: true, apellido: true, nivel_grado: { select: { nivel: true, grado: true } } },
  });
  return {
    total_estudiantes: total,
    con_apoderado: set.size,
    sin_apoderado: sin.length,
    estudiantes_sin_apoderado: sin.map((s) => ({
      id: s.id,
      codigo_estudiante: s.codigo_estudiante,
      nombre: `${s.nombre} ${s.apellido}`,
      nivel: s.nivel_grado.nivel,
      grado: s.nivel_grado.grado,
    })),
  };
}

module.exports = {
  getTemplate,
  validateUsers,
  executeImport,
  validateRelationships,
  createRelationships,
  verifyRelationships,
};