/**
 * Extracción de métricas VD (M9–M14) y exportación a CSV
 * Parámetros:
 *  --start=YYYY-MM-DD
 *  --end=YYYY-MM-DD
 * Defaults (si no se pasan): 2025-10-20 → 2025-11-01
 * Salida: doc/neotesis/resultados/M{9..14}_*.csv
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

async function getPadreCarlosId() {
  const carlos = await prisma.usuario.findFirst({ where: { nombre: 'Carlos' }, select: { id: true } });
  return carlos?.id || null;
}

/** M9: Frecuencia de logins semanales (apoderados) */
async function runM9() {
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT u.nombre AS usuario, COUNT(*) AS total_logins
    FROM auth_logs al
    JOIN usuarios u ON al.usuario_id = u.id
    WHERE al.evento = 'login'
      AND al.exito = true
      AND u.rol = 'apoderado'
      AND al.timestamp BETWEEN $1::timestamp AND $2::timestamp
    GROUP BY u.id, u.nombre
    ORDER BY u.nombre
    `,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const w = weeksBetween(START, END);
  const out = [['usuario', 'total_logins', 'frecuencia_semanal_dinamica']];
  for (const r of rows) {
    const total = toNumber(r.total_logins || 0);
    out.push([r.usuario, String(total), String((total / w).toFixed(2))]);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'M9_frec_logins_semanales.csv'), out.map(a => a.join(',')).join('\n'));
}

/** M10: Constancia en el seguimiento (Carlos) */
async function runM10() {
  const carlosId = await getPadreCarlosId();
  const totalDias = daysBetween(START, END);
  if (!carlosId) {
    fs.writeFileSync(path.join(OUT_DIR, 'M10_constancia_seguimiento.csv'), `dias_con_acceso,total_dias,constancia_porcentaje\n0,${totalDias},0.00`);
    return;
  }
  const dias = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(DISTINCT DATE(al.timestamp)) AS dias_unicos
    FROM auth_logs al
    WHERE al.usuario_id = $1::uuid
      AND al.evento = 'login'
      AND al.exito = true
      AND al.timestamp BETWEEN $2::timestamp AND $3::timestamp
    `,
    carlosId,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const du = toNumber(dias[0]?.dias_unicos || 0);
  const pct = ((du / totalDias) * 100).toFixed(2);
  const out = [['dias_con_acceso', 'total_dias', 'constancia_porcentaje'], [String(du), String(totalDias), String(pct)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M10_constancia_seguimiento.csv'), out.map(a => a.join(',')).join('\n'));
}

/** M11: Tiempo de reacción a alertas críticas (horas) — Carlos */
async function runM11() {
  const carlosId = await getPadreCarlosId();
  if (!carlosId) {
    fs.writeFileSync(path.join(OUT_DIR, 'M11_tiempo_reaccion_alertas.csv'), 'alertas_criticas,tiempo_promedio_horas\n0,0.00');
    return;
  }
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS alertas_criticas,
           AVG(EXTRACT(EPOCH FROM (fecha_lectura - fecha_creacion))/3600) AS tiempo_promedio_horas
    FROM notificaciones
    WHERE usuario_id = $1::uuid
      AND tipo IN ('asistencia','calificacion')
      AND (datos_adicionales->>'criticidad') = 'alta'
      AND fecha_lectura IS NOT NULL
      AND fecha_creacion BETWEEN $2::timestamp AND $3::timestamp
    `,
    carlosId,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const count = toNumber(rows[0]?.alertas_criticas || 0);
  const avg = rows[0]?.tiempo_promedio_horas != null ? Number(rows[0].tiempo_promedio_horas) : 0;
  const out = [['alertas_criticas', 'tiempo_promedio_horas'], [String(count), String(avg.toFixed(2))]];
  fs.writeFileSync(path.join(OUT_DIR, 'M11_tiempo_reaccion_alertas.csv'), out.map(a => a.join(',')).join('\n'));
}

/** M12: Frecuencia de revisión post-alerta (24h) — Carlos */
async function runM12() {
  const carlosId = await getPadreCarlosId();
  if (!carlosId) {
    fs.writeFileSync(path.join(OUT_DIR, 'M12_accesos_post_alerta.csv'), 'total_alertas,total_accesos_post_alerta,promedio_accesos_por_alerta\n0,0,0.00');
    return;
  }
  const alertas = await prisma.$queryRawUnsafe(
    `
    SELECT 
      n.id,
      n.fecha_creacion,
      CASE WHEN n.tipo = 'calificacion' THEN 'calificaciones' ELSE 'asistencia' END AS modulo_relacionado,
      (
        SELECT COUNT(*)
        FROM access_logs al
        WHERE al.usuario_id = n.usuario_id
          AND al.modulo = CASE WHEN n.tipo = 'calificacion' THEN 'calificaciones' ELSE 'asistencia' END
          AND al.timestamp BETWEEN n.fecha_creacion AND (n.fecha_creacion + INTERVAL '24 hours')
      ) AS accesos_24h
    FROM notificaciones n
    WHERE n.usuario_id = $1::uuid
      AND n.tipo IN ('asistencia','calificacion')
      AND n.fecha_creacion BETWEEN $2::timestamp AND $3::timestamp
    `,
    carlosId,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const totalAlertas = alertas.length;
  const totalAccesos = alertas.reduce((a, r) => a + toNumber(r.accesos_24h || 0), 0);
  const prom = totalAlertas > 0 ? (totalAccesos / totalAlertas).toFixed(2) : '0.00';
  const out = [['total_alertas', 'total_accesos_post_alerta', 'promedio_accesos_por_alerta'], [String(totalAlertas), String(totalAccesos), String(prom)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M12_accesos_post_alerta.csv'), out.map(a => a.join(',')).join('\n'));
}

/** M13: Tasa de participación activa — Carlos */
async function runM13() {
  const carlosId = await getPadreCarlosId();
  const totalDias = daysBetween(START, END);
  if (!carlosId) {
    fs.writeFileSync(path.join(OUT_DIR, 'M13_tasa_participacion_activa.csv'), `dias_con_participacion_activa,total_dias,tasa_participacion_activa\n0,${totalDias},0.00`);
    return;
  }
  const dias = await prisma.$queryRawUnsafe(
    `
    SELECT DATE(timestamp) AS fecha, COUNT(*) AS accesos_dia
    FROM access_logs
    WHERE usuario_id = $1::uuid
      AND modulo IN ('calificaciones','asistencia','comunicados')
      AND duracion_sesion >= 10
      AND timestamp BETWEEN $2::timestamp AND $3::timestamp
    GROUP BY DATE(timestamp)
    HAVING COUNT(*) >= 2
    `,
    carlosId,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const activeDays = dias.length;
  const tasa = ((activeDays / totalDias) * 100).toFixed(2);
  const out = [['dias_con_participacion_activa', 'total_dias', 'tasa_participacion_activa'], [String(activeDays), String(totalDias), String(tasa)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M13_tasa_participacion_activa.csv'), out.map(a => a.join(',')).join('\n'));
}

/** M14: Diversidad de uso del sistema — Carlos */
async function runM14() {
  const carlosId = await getPadreCarlosId();
  if (!carlosId) {
    fs.writeFileSync(path.join(OUT_DIR, 'M14_diversidad_uso.csv'), 'modulos_usados\n0');
    return;
  }
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(DISTINCT modulo) AS modulos_usados
    FROM access_logs
    WHERE usuario_id = $1::uuid
      AND timestamp BETWEEN $2::timestamp AND $3::timestamp
      AND modulo IN ('calificaciones','asistencia','comunicados','notificaciones','encuestas','soporte')
    `,
    carlosId,
    START + ' 00:00:00-05:00',
    END + ' 23:59:59-05:00'
  );
  const mu = toNumber(rows[0]?.modulos_usados || 0);
  const out = [['modulos_usados'], [String(mu)]];
  fs.writeFileSync(path.join(OUT_DIR, 'M14_diversidad_uso.csv'), out.map(a => a.join(',')).join('\n'));
}

async function main() {
  console.log(`[VD] Extrayendo métricas M9–M14 para rango ${START} → ${END} ...`);
  await runM9();
  await runM10();
  await runM11();
  await runM12();
  await runM13();
  await runM14();
  console.log(`[VD] Métricas exportadas en ${OUT_DIR}`);
}

main()
  .catch((e) => {
    console.error('ERR', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });