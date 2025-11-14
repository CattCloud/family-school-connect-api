/**
 * Extracción de métricas VI (M1–M8) y exportación a CSV
 * Parámetros:
 *  --start=YYYY-MM-DD
 *  --end=YYYY-MM-DD
 * Defaults (si no se pasan): 2025-10-20 → 2025-11-01
 * Salida: doc/neotesis/resultados/M{1..8}_*.csv
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const argv = process.argv.slice(2);
const argMap = Object.fromEntries(
  argv
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k.toLowerCase(), v ?? 'true'];
    })
);

const START_DEFAULT = '2025-10-20';
const END_DEFAULT = '2025-11-01';
const START = argMap.start || process.env.METRIC_START || START_DEFAULT;
const END = argMap.end || process.env.METRIC_END || END_DEFAULT;

const OUT_DIR = path.join('doc', 'neotesis', 'resultados');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function toNumber(v) {
  return typeof v === 'bigint' ? Number(v) : v;
}
function daysBetween(startStr, endStr) {
  const s = new Date(startStr + 'T00:00:00-05:00');
  const e = new Date(endStr + 'T23:59:59-05:00');
  return Math.max(1, Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1);
}
function weeksBetween(startStr, endStr) {
  return daysBetween(startStr, endStr) / 7.0;
}

async function runM1() {
  // M1: Frecuencia de consulta de calificaciones (apoderados)
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT u.nombre AS usuario, COUNT(*) AS total_accesos
    FROM access_logs al
    JOIN usuarios u ON al.usuario_id = u.id
    WHERE al.modulo = 'calificaciones'
      AND u.rol = 'apoderado'
      AND al.timestamp BETWEEN $1::timestamp AND $2::timestamp
    GROUP BY u.id, u.nombre
    ORDER BY u.nombre
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const w = weeksBetween(START, END);
  const out = [['usuario', 'total_accesos', 'frecuencia_semanal_dinamica']];
  for (const r of rows) {
    const total = toNumber(r.total_accesos || 0);
    out.push([r.usuario, String(total), String((total / w).toFixed(2))]);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'M1_frec_calificaciones.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM1_series() {
  // M1 (series): Accesos diarios a calificaciones por Apoderado (rol)
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT TO_CHAR((al.timestamp AT TIME ZONE '-05'), 'YYYY-MM-DD') AS dia, COUNT(*) AS total
    FROM access_logs al
    WHERE al.modulo = 'calificaciones'
      AND al.usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
      AND al.timestamp BETWEEN $1::timestamp AND $2::timestamp
    GROUP BY 1
    ORDER BY 1
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const out = [['dia', 'total_accesos']];
  for (const r of rows) {
    out.push([r.dia, String(toNumber(r.total || 0))]);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'M1_series_diaria.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM2() {
  // M2: Frecuencia de consulta de asistencia (apoderados)
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT u.nombre AS usuario, COUNT(*) AS total_accesos
    FROM access_logs al
    JOIN usuarios u ON al.usuario_id = u.id
    WHERE al.modulo = 'asistencia'
      AND u.rol = 'apoderado'
      AND al.timestamp BETWEEN $1::timestamp AND $2::timestamp
    GROUP BY u.id, u.nombre
    ORDER BY u.nombre
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const w = weeksBetween(START, END);
  const out = [['usuario', 'total_accesos', 'frecuencia_semanal_dinamica']];
  for (const r of rows) {
    const total = toNumber(r.total_accesos || 0);
    out.push([r.usuario, String(total), String((total / w).toFixed(2))]);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'M2_frec_asistencia.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM2_series() {
  // M2 (series): Accesos diarios a asistencia por Apoderado (rol)
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT TO_CHAR((al.timestamp AT TIME ZONE '-05'), 'YYYY-MM-DD') AS dia, COUNT(*) AS total
    FROM access_logs al
    WHERE al.modulo = 'asistencia'
      AND al.usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
      AND al.timestamp BETWEEN $1::timestamp AND $2::timestamp
    GROUP BY 1
    ORDER BY 1
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const out = [['dia', 'total_accesos']];
  for (const r of rows) {
    out.push([r.dia, String(toNumber(r.total || 0))]);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'M2_series_diaria.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM3() {
  // M3: Cobertura de consulta académica (Apoderado - rol)
  const cursosConsultados = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(DISTINCT al.curso_id) AS cc
    FROM access_logs al
    WHERE al.usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
      AND al.modulo IN ('calificaciones','asistencia')
      AND al.curso_id IS NOT NULL
      AND al.timestamp BETWEEN $1::timestamp AND $2::timestamp
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const totalCursos = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS total
    FROM cursos c
    WHERE c.año_academico = 2025 AND c.estado_activo = true
    `
  );
  const cc = toNumber(cursosConsultados[0]?.cc || 0);
  const total = toNumber(totalCursos[0]?.total || 0);
  const cobertura = total > 0 ? ((cc / total) * 100).toFixed(2) : '0.00';
  const out = [['cursos_consultados', 'total', 'cobertura_porcentaje'], [String(cc), String(total), String(cobertura)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M3_cobertura_consulta.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM4() {
  // M4: Tasa de lectura de comunicados (Apoderado - rol)
  const publicadosDirigidos = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS n
    FROM comunicados c
    WHERE c.estado = 'publicado'
      AND c.fecha_publicacion BETWEEN $1::timestamp AND $2::timestamp
      AND EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.rol = 'apoderado' AND u.id = ANY(c.publico_objetivo::uuid[])
      )
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const leidos = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS n
    FROM comunicados c
    JOIN comunicados_lecturas cl ON c.id = cl.comunicado_id
    WHERE c.estado = 'publicado'
      AND c.fecha_publicacion BETWEEN $1::timestamp AND $2::timestamp
      AND EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.rol = 'apoderado' AND u.id = ANY(c.publico_objetivo::uuid[])
      )
      AND cl.usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
      AND cl.fecha_lectura IS NOT NULL
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const pub = toNumber(publicadosDirigidos[0]?.n || 0);
  const read = toNumber(leidos[0]?.n || 0);
  const tasa = pub > 0 ? ((read / pub) * 100).toFixed(2) : '0.00';
  const out = [['publicados_dirigidos', 'leidos', 'tasa_lectura'], [String(pub), String(read), String(tasa)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M4_tasa_lectura_comunicados.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM5() {
  // M5: Tiempo hasta lectura de comunicados (horas) — Apoderado (rol) con estadísticos
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT EXTRACT(EPOCH FROM (cl.fecha_lectura - c.fecha_publicacion))/3600 AS horas
    FROM comunicados c
    JOIN comunicados_lecturas cl ON c.id = cl.comunicado_id
    WHERE c.fecha_publicacion BETWEEN $1::timestamp AND $2::timestamp
      AND cl.usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
      AND cl.fecha_lectura IS NOT NULL
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  if (!rows.length) {
    fs.writeFileSync(path.join(OUT_DIR, 'M5_tiempo_lectura_comunicados.csv'), 'muestras,tiempo_promedio_horas,tiempo_mediana_horas,tiempo_min_horas,tiempo_max_horas\n0,0,0,0,0');
    return;
  }
  const horas = rows.map(r => Number(r.horas)).sort((a,b) => a - b);
  const n = horas.length;
  const avg = horas.reduce((a, b) => a + b, 0) / n;
  const min = horas[0];
  const max = horas[n - 1];
  const median = n % 2 === 1 ? horas[(n - 1) / 2] : (horas[n/2 - 1] + horas[n/2]) / 2;
  const out = [['muestras','tiempo_promedio_horas','tiempo_mediana_horas','tiempo_min_horas','tiempo_max_horas'],
               [String(n), String(avg.toFixed(2)), String(median.toFixed(2)), String(min.toFixed(2)), String(max.toFixed(2))]];
  fs.writeFileSync(path.join(OUT_DIR, 'M5_tiempo_lectura_comunicados.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM6() {
  // M6: Tasa de visualización de notificaciones — Apoderado (rol)
  const enviadas = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS n
    FROM notificaciones
    WHERE usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
      AND fecha_creacion BETWEEN $1::timestamp AND $2::timestamp
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const vistas = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS n
    FROM notificaciones
    WHERE usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
      AND fecha_creacion BETWEEN $1::timestamp AND $2::timestamp
      AND estado_plataforma = 'leida'
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const total = toNumber(enviadas[0]?.n || 0);
  const read = toNumber(vistas[0]?.n || 0);
  const tasa = total > 0 ? ((read / total) * 100).toFixed(2) : '0.00';
  const out = [['enviadas', 'vistas', 'tasa_visualizacion'], [String(total), String(read), String(tasa)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M6_tasa_visualizacion_notificaciones.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM7() {
  // M7: Tasa de participación en encuestas — Apoderado (rol)
  const enviadas = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS n
    FROM encuestas e
    WHERE e.estado = 'activa'
      AND e.fecha_inicio BETWEEN $1::timestamp AND $2::timestamp
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const respondidas = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(DISTINCT e.id) AS n
    FROM encuestas e
    LEFT JOIN respuestas_encuestas re
      ON e.id = re.encuesta_id
     AND re.usuario_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado')
    WHERE e.estado = 'activa'
      AND e.fecha_inicio BETWEEN $1::timestamp AND $2::timestamp
      AND re.id IS NOT NULL
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const pub = toNumber(enviadas[0]?.n || 0);
  const resp = toNumber(respondidas[0]?.n || 0);
  const tasa = pub > 0 ? ((resp / pub) * 100).toFixed(2) : '0.00';
  const out = [['encuestas_publicadas', 'encuestas_respondidas', 'tasa_participacion'], [String(pub), String(resp), String(tasa)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M7_tasa_participacion_encuestas.csv'), out.map(a => a.join(',')).join('\n'));
}

async function runM8() {
  // M8: Tiempo promedio de resolución de tickets (horas) — tickets resueltos en el rango
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT EXTRACT(EPOCH FROM (fecha_resolucion - fecha_creacion))/3600 AS horas
    FROM tickets_soporte
    WHERE estado = 'resuelto'
      AND fecha_creacion BETWEEN $1::timestamp AND $2::timestamp
      AND fecha_resolucion IS NOT NULL
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  if (!rows.length) {
    fs.writeFileSync(path.join(OUT_DIR, 'M8_tiempo_resolucion_tickets.csv'), 'tickets_resueltos,tiempo_promedio_horas,tiempo_min_horas,tiempo_max_horas\n0,0,0,0');
    return;
  }
  const horas = rows.map(r => Number(r.horas));
  const avg = horas.reduce((a, b) => a + b, 0) / horas.length;
  const min = Math.min(...horas);
  const max = Math.max(...horas);
  const out = [['tickets_resueltos', 'tiempo_promedio_horas', 'tiempo_min_horas', 'tiempo_max_horas'],
               [String(horas.length), String(avg.toFixed(2)), String(min.toFixed(2)), String(max.toFixed(2))]];
  fs.writeFileSync(path.join(OUT_DIR, 'M8_tiempo_resolucion_tickets.csv'), out.map(a => a.join(',')).join('\n'));
}

async function main() {
  console.log(`[VI] Extrayendo métricas M1–M8 para rango ${START} → ${END} ...`);
  await runM1();
  await runM1_series();
  await runM2();
  await runM2_series();
  await runM3();
  await runM4();
  await runM5();
  await runM6();
  await runM7();
  await runM8();
  console.log(`[VI] Métricas exportadas en ${OUT_DIR}`);
}

main()
  .catch((e) => {
    console.error('ERR', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });