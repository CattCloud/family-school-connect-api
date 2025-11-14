const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const toNumber = (v) => (typeof v === 'bigint' ? Number(v) : v);

async function run() {
  const res = {};

  // 6.1.1 Coherencia Temporal
  const lecturaAntesPub = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM comunicados c
    JOIN comunicados_lecturas cl ON c.id = cl.comunicado_id
    WHERE cl.fecha_lectura < c.fecha_publicacion
  `);

  const accessAntesLogin = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM access_logs al
    LEFT JOIN auth_logs a
      ON al.session_id = a.session_id AND a.evento = 'login'
    WHERE a.timestamp IS NOT NULL AND al.timestamp < a.timestamp
  `);

  const futuros = await prisma.$queryRawUnsafe(`
    SELECT tabla, COUNT(*) AS registros_futuros
    FROM (
      SELECT 'auth_logs' AS tabla, timestamp FROM auth_logs WHERE timestamp > CURRENT_TIMESTAMP
      UNION ALL
      SELECT 'access_logs' AS tabla, timestamp FROM access_logs WHERE timestamp > CURRENT_TIMESTAMP
      UNION ALL
      SELECT 'notificaciones' AS tabla, fecha_creacion AS timestamp FROM notificaciones WHERE fecha_creacion > CURRENT_TIMESTAMP
    ) AS v
    GROUP BY tabla
  `);

  res.coherencia_temporal = {
    lecturaAntesPub: toNumber(lecturaAntesPub[0]?.n || 0n),
    accessAntesLogin: toNumber(accessAntesLogin[0]?.n || 0n),
    futuros: futuros.map(r => ({ tabla: r.tabla, registros_futuros: toNumber(r.registros_futuros) }))
  };

  // 6.1.2 Integridad Referencial
  const authUsuarioInvalid = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM auth_logs al
    LEFT JOIN usuarios u ON al.usuario_id = u.id
    WHERE u.id IS NULL
  `);

  const accessSinSesion = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM access_logs al
    WHERE NOT EXISTS (
      SELECT 1 FROM auth_logs a WHERE a.session_id = al.session_id
    )
  `);

  const notifAsistSinEst = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM notificaciones
    WHERE tipo = 'asistencia' AND estudiante_id IS NULL
  `);

  res.integridad_referencial = {
    authUsuarioInvalid: toNumber(authUsuarioInvalid[0]?.n || 0n),
    accessSinSesion: toNumber(accessSinSesion[0]?.n || 0n),
    notifAsistSinEst: toNumber(notifAsistSinEst[0]?.n || 0n)
  };

  // 6.1.3 Rangos de Valores Lógicos
  const durAnom = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM access_logs
    WHERE duracion_sesion < 10 OR duracion_sesion > 1800
  `);

  const reaccTardias = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM notificaciones
    WHERE tipo IN ('asistencia','calificacion')
      AND (datos_adicionales->>'criticidad') = 'alta'
      AND fecha_lectura IS NOT NULL
      AND EXTRACT(EPOCH FROM (fecha_lectura - fecha_creacion))/3600 > 72
  `);

  const ticketsBad = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS n
    FROM tickets_soporte
    WHERE estado = 'resuelto'
      AND fecha_resolucion IS NOT NULL
      AND fecha_resolucion <= fecha_creacion
  `);

  res.rangos_logicos = {
    duraciones_anomalas: toNumber(durAnom[0]?.n || 0n),
    reacciones_tardias_72h: toNumber(reaccTardias[0]?.n || 0n),
    tickets_resueltos_con_inversion_fechas: toNumber(ticketsBad[0]?.n || 0n)
  };

  console.log(JSON.stringify(res, null, 2));
}

run()
  .catch((e) => {
    console.error('ERR', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });