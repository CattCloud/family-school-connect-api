'use strict';

const prisma = require('../config/prisma');

function getCurrentAcademicYear() {
  const forced = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(forced) ? forced : new Date().getFullYear();
}

// Obtiene componentes activos para un año
async function getStructure(year) {
  const componentes = await prisma.estructuraEvaluacion.findMany({
    where: { año_academico: year, estado_activo: true },
    orderBy: { orden_visualizacion: 'asc' },
    select: {
      id: true,
      nombre_item: true,
      peso_porcentual: true,
      tipo_evaluacion: true,
      orden_visualizacion: true,
      estado_activo: true,
      fecha_configuracion: true,
      bloqueada: true,
    },
  });

  if (!componentes.length) {
    const e = new Error(`No hay estructura de evaluación configurada para el año ${year}`);
    e.status = 404;
    e.code = 'STRUCTURE_NOT_CONFIGURED';
    throw e;
  }

  const suma = componentes.reduce((acc, c) => acc + Number(c.peso_porcentual), 0);
  const bloqueada = componentes[0]?.bloqueada ?? true;

  return {
    año_academico: year,
    componentes,
    suma_pesos: Number(suma.toFixed(2)),
    total_componentes: componentes.length,
    configuracion_bloqueada: bloqueada,
    fecha_bloqueo: componentes[0]?.fecha_configuracion ?? null,
  };
}

function validateComponents(componentes) {
  if (!Array.isArray(componentes) || componentes.length < 1 || componentes.length > 5) {
    const e = new Error('Mínimo 1 y máximo 5 componentes');
    e.status = 400;
    e.code = 'INVALID_COMPONENTS_COUNT';
    throw e;
  }
  const nombres = new Set();
  let suma = 0;
  for (const c of componentes) {
    const nombre = String(c.nombre_item || '').trim().toLowerCase();
    if (!nombre) {
      const e = new Error('Nombre de ítem requerido');
      e.status = 400;
      e.code = 'INVALID_COMPONENT_NAME';
      throw e;
    }
    if (nombres.has(nombre)) {
      const e = new Error(`Nombre duplicado: ${c.nombre_item}`);
      e.status = 400;
      e.code = 'DUPLICATE_COMPONENT_NAME';
      throw e;
    }
    nombres.add(nombre);

    const peso = Number(c.peso_porcentual);
    if (!(peso >= 5 && peso <= 50)) {
      const e = new Error(`Peso de ${c.nombre_item} fuera de rango (5-50)`);
      e.status = 400;
      e.code = 'INVALID_WEIGHT_RANGE';
      throw e;
    }
    suma += peso;

    if (!['unica', 'recurrente'].includes(String(c.tipo_evaluacion))) {
      const e = new Error(`tipo_evaluacion inválido en ${c.nombre_item}`);
      e.status = 400;
      e.code = 'INVALID_EVAL_TYPE';
      throw e;
    }

    const orden = Number(c.orden_visualizacion);
    if (!(orden >= 1 && orden <= 5)) {
      const e = new Error(`orden_visualizacion inválido en ${c.nombre_item}`);
      e.status = 400;
      e.code = 'INVALID_ORDER';
      throw e;
    }
  }
  if (Math.abs(suma - 100) > 0.01) {
    const e = new Error(`La suma de pesos debe ser exactamente 100%. Actual: ${suma.toFixed(2)}%`);
    e.status = 400;
    e.code = 'INVALID_WEIGHT_SUM';
    throw e;
  }
}

// Crea/actualiza estructura para el año; bloquea configuración
async function putStructure(year, componentes, directorId) {
  // Verificar bloqueo
  const yaBloqueada = await prisma.estructuraEvaluacion.findFirst({
    where: { año_academico: year },
    select: { bloqueada: true },
  });
  if (yaBloqueada?.bloqueada) {
    const e = new Error(`La estructura ya está bloqueada para el año ${year}. No se permiten modificaciones`);
    e.status = 409;
    e.code = 'STRUCTURE_LOCKED';
    throw e;
  }

  validateComponents(componentes);

  // Estrategia: eliminar todo del año y crear nuevos registros bloqueados
  await prisma.$transaction(async (tx) => {
    await tx.estructuraEvaluacion.deleteMany({ where: { año_academico: year } });
    for (const c of componentes) {
      await tx.estructuraEvaluacion.create({
        data: {
          año_academico: year,
          nombre_item: c.nombre_item,
          peso_porcentual: c.peso_porcentual,
          tipo_evaluacion: c.tipo_evaluacion,
          orden_visualizacion: c.orden_visualizacion,
          estado_activo: true,
          // bloqueada = true para bloquear edición
          bloqueada: true,
        },
      });
    }
    // Nota: si se requiere auditoría de quién configuró, agregar modelo de logs separado
  });

  return getStructure(year);
}

async function listTemplates() {
  // Dos plantillas predefinidas según documentación
  return [
    {
      id: 'template_001',
      nombre: 'Estructura Estándar',
      descripcion: 'Configuración más común en instituciones educativas',
      componentes: [
        { nombre_item: 'Examen', peso_porcentual: 40.0, tipo_evaluacion: 'unica', orden_visualizacion: 1 },
        { nombre_item: 'Participación', peso_porcentual: 20.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 2 },
        { nombre_item: 'Revisión de Cuaderno', peso_porcentual: 15.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 3 },
        { nombre_item: 'Revisión de Libro', peso_porcentual: 15.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 4 },
        { nombre_item: 'Comportamiento', peso_porcentual: 10.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 5 },
      ],
    },
    {
      id: 'template_002',
      nombre: 'Evaluación Equilibrada',
      descripcion: 'Pesos distribuidos equitativamente',
      componentes: [
        { nombre_item: 'Examen', peso_porcentual: 25.0, tipo_evaluacion: 'unica', orden_visualizacion: 1 },
        { nombre_item: 'Trabajos Prácticos', peso_porcentual: 25.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 2 },
        { nombre_item: 'Participación', peso_porcentual: 25.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 3 },
        { nombre_item: 'Actitud', peso_porcentual: 25.0, tipo_evaluacion: 'recurrente', orden_visualizacion: 4 },
      ],
    },
  ];
}

function previewWeightedAverage(componentes) {
  // componentes: [{ nombre, peso, nota }]
  let promedio = 0;
  const items = [];
  for (const c of componentes) {
    const peso = Number(c.peso);
    const nota = Number(c.nota);
    const subtotal = (nota * peso) / 100;
    promedio += subtotal;
    items.push({ nombre: c.nombre, nota, peso: Number(peso.toFixed(2)), subtotal: Number(subtotal.toFixed(2)) });
  }
  let letra = 'C';
  if (promedio >= 18) letra = 'AD';
  else if (promedio >= 14) letra = 'A';
  else if (promedio >= 11) letra = 'B';
  else letra = 'C';
  return {
    componentes: items,
    promedio_final: Number(promedio.toFixed(2)),
    calificacion_letra: letra,
    nivel_desempeño: letra === 'AD' ? 'Logro Destacado' : letra === 'A' ? 'Logro Esperado' : letra === 'B' ? 'En Proceso' : 'En Inicio',
  };
}

async function listNivelGrado() {
  const niveles = await prisma.nivelGrado.findMany({
    where: { estado_activo: true },
    orderBy: [{ nivel: 'asc' }, { grado: 'asc' }],
    select: {
      id: true,
      nivel: true,
      grado: true,
      descripcion: true,
      estado_activo: true,
    },
  });

  // Agrupar por nivel
  const agrupado = {};
  for (const ng of niveles) {
    if (!agrupado[ng.nivel]) agrupado[ng.nivel] = [];
    agrupado[ng.nivel].push({
      id: ng.id,
      grado: ng.grado,
      descripcion: ng.descripcion,
      estado_activo: ng.estado_activo,
    });
  }

  const resultado = Object.entries(agrupado).map(([nivel, grados]) => ({
    id: null,
    nivel,
    grados,
  }));

  const totales = niveles.length;
  const totalNiveles = new Set(niveles.map((n) => n.nivel)).size;

  return { niveles: resultado, total_niveles: totalNiveles, total_grados: totales };
}

module.exports = {
  getCurrentAcademicYear,
  getStructure,
  putStructure,
  listTemplates,
  previewWeightedAverage,
  listNivelGrado,
};