/**
 * Simulación REALISTA de 14 días (Fase 3) basada en PropuestaReajuste.md
 * Genera patrones de comportamiento humano natural con variabilidad:
 * - Curva de novedad (alta actividad D1-D3, luego decae)
 * - Días sin acceso (4-5 de 14)
 * - Fatiga digital (disminución gradual D10-D14)
 * - Atención selectiva (no 100% de visualizaciones)
 * - Variabilidad en tiempos de reacción según contexto
 */

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

const ANIO = 2025;
// Parámetros CLI/ENV: --start=YYYY-MM-DD --end=YYYY-MM-DD --days=N
const argv = process.argv.slice(2);
const argMap = Object.fromEntries(
  argv
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k.toLowerCase(), v ?? 'true'];
    })
);
const startStr = argMap.start || process.env.SIM_START || process.env.SIM_START_DATE;
const endStr = argMap.end || process.env.SIM_END || process.env.SIM_END_DATE;
const daysStr = argMap.days || process.env.SIM_DAYS;
const DEFAULT_START = '2025-10-20';
const DEFAULT_DAYS = 14;

// Construcción de fechas con TZ -05:00
const FECHA_INICIO = new Date((startStr || DEFAULT_START) + 'T00:00:00-05:00');
const FECHA_FIN = endStr
  ? new Date(endStr + 'T23:59:59-05:00')
  : new Date(new Date((startStr || DEFAULT_START) + 'T00:00:00-05:00').getTime() + ((parseInt(daysStr || DEFAULT_DAYS, 10) - 1) * 24 * 60 * 60 * 1000));

const MS_PER_DIA = 24 * 60 * 60 * 1000;
const TOTAL_DIAS = Math.max(1, Math.floor((FECHA_FIN - FECHA_INICIO) / MS_PER_DIA) + 1);

// Utilidades
function addMinutes(date, mins) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}
function addHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickCourseId(cursos, idx) {
  if (!cursos || cursos.length === 0) return null;
  return cursos[idx % cursos.length].id;
}
function roleTimeDistribution(rol) {
  if (rol === 'apoderado') return [
    { start: 7, end: 9 },   // mañana antes del trabajo
    { start: 18, end: 20 }, // tarde después del trabajo
    { start: 21, end: 22 }  // noche
  ];
  if (rol === 'docente') return [
    { start: 8, end: 10 },
    { start: 13, end: 15 }
  ];
  if (rol === 'director') return [
    { start: 9, end: 11 },
    { start: 15, end: 17 }
  ];
  if (rol === 'administrador') return [
    { start: 8, end: 10 },
    { start: 14, end: 17 }
  ];
  return [{ start: 9, end: 17 }];
}
function timestampForDay(dayZeroBase, rol, loginIndex = 0) {
  const slots = roleTimeDistribution(rol);
  const slot = slots[loginIndex % slots.length];
  const hour = randInt(slot.start, slot.end - 1);
  const minute = randInt(0, 59);
  const second = randInt(0, 59);
  const ts = new Date(dayZeroBase);
  ts.setHours(hour, minute, second, 0);
  return addMinutes(ts, randInt(-15, 15));
}

async function getUsuariosClave() {
  const padre = await prisma.usuario.findFirst({ where: { nombre: 'Carlos' } });
  const docente = await prisma.usuario.findFirst({ where: { nombre: 'María' } });
  const director = await prisma.usuario.findFirst({ where: { nombre: 'Jorge' } });
  const administrador = await prisma.usuario.findFirst({ where: { nombre: 'Ana' } });
  if (!padre || !docente || !director || !administrador) {
    throw new Error('Usuarios clave no encontrados (Carlos, María, Jorge, Ana). Ejecute seeds base.');
  }
  return { padre, docente, director, administrador };
}

async function getEstudiantePrincipal() {
  let est = await prisma.estudiante.findFirst({ where: { codigo_estudiante: 'EST-2025-001' } });
  if (!est) {
    est = await prisma.estudiante.findFirst();
  }
  if (!est) throw new Error('No se encontró estudiante. Ejecute seeds base.');
  return est;
}

async function getCursosActivos() {
  const cursos = await prisma.curso.findMany({ where: { año_academico: ANIO, estado_activo: true }, orderBy: { nombre: 'asc' } });
  if (!cursos || cursos.length === 0) throw new Error('No se encontraron cursos. Ejecute seeds base.');
  return cursos;
}

// Inserciones primitivas
async function insertAuth(userId, evento, exito, ts, sessionId, ip = '190.237.100.10', ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)') {
  await prisma.$executeRawUnsafe(
    `INSERT INTO auth_logs (id, usuario_id, evento, exito, timestamp, ip_address, user_agent, session_id, año_academico)
     VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4::timestamp, $5, $6, $7::uuid, $8)`,
    userId, evento, exito, ts, ip, ua, sessionId, ANIO
  );
}
async function insertAccess(userId, sessionId, modulo, estudianteId, cursoId, ts, durSec, url) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO access_logs (id, usuario_id, session_id, modulo, estudiante_id, curso_id, timestamp, duracion_sesion, url_visitada, año_academico)
     VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4::uuid, $5::uuid, $6::timestamp, $7, $8, $9)`,
    userId, sessionId, modulo, estudianteId, cursoId, ts, durSec, url, ANIO
  );
}

async function markComunicadoReadByTitle(userId, title, readTs) {
  const comunicado = await prisma.comunicado.findFirst({ where: { titulo: title, año_academico: ANIO } });
  if (!comunicado) return;

  // Salvaguarda: nunca registrar lecturas antes de la publicación (+1h)
  let minReadTs = readTs;
  if (comunicado.fecha_publicacion) {
    const minAllowed = new Date(new Date(comunicado.fecha_publicacion).getTime() + 60 * 60 * 1000);
    if (minReadTs < minAllowed) minReadTs = minAllowed;
  }

  const exists = await prisma.comunicadoLectura.findFirst({
    where: { comunicado_id: comunicado.id, usuario_id: userId }
  });

  if (!exists) {
    await prisma.comunicadoLectura.create({
      data: {
        comunicado_id: comunicado.id,
        usuario_id: userId,
        fecha_lectura: minReadTs
      }
    });
  }
}

async function uniqueTicketNumber(base) {
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const exists = await prisma.ticketSoporte.findFirst({ where: { numero_ticket: candidate } });
    if (!exists) return candidate;
  }
  return `${base}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

async function createTicketAndResolve(creadorId, categoria, prioridad, titulo, desc, createdTs, horasResolucion, asignadoId) {
  const base = `TCK-${createdTs.getTime()}`;
  const numero = await uniqueTicketNumber(base);

  const ticket = await prisma.ticketSoporte.create({
    data: {
      numero_ticket: numero,
      titulo,
      descripcion: desc,
      categoria,
      prioridad,
      estado: 'pendiente',
      usuario_id: creadorId,
      asignado_a: asignadoId || null,
      fecha_creacion: createdTs,
      año_academico: ANIO
    }
  });

  const asignTs = addHours(createdTs, Math.min(2, horasResolucion / 3));
  const resolvedTs = addHours(createdTs, horasResolucion);

  await prisma.ticketSoporte.update({
    where: { id: ticket.id },
    data: {
      estado: 'resuelto',
      fecha_asignacion: asignTs,
      fecha_resolucion: resolvedTs,
      tiempo_respuesta_horas: horasResolucion
    }
  });
}

async function createNotificacion(userId, tipo, titulo, contenido, creadoTs, criticidad, estudianteId, comunicadoId) {
  const datos = criticidad ? { criticidad } : null;
  const notif = await prisma.notificacion.create({
    data: {
      usuario_id: userId,
      tipo,
      titulo,
      contenido,
      datos_adicionales: datos,
      canal: 'plataforma',
      estado_plataforma: 'entregada',
      fecha_creacion: creadoTs,
      estudiante_id: estudianteId || null,
      comunicado_id: comunicadoId || null,
      año_academico: ANIO
    }
  });
  return notif;
}

async function markNotificacionLeida(notifId, readTs) {
  await prisma.notificacion.update({
    where: { id: notifId },
    data: { estado_plataforma: 'leida', fecha_lectura: readTs }
  });
}

async function responderEncuestaPorTitulo(userId, titulo, respTs) {
  const enc = await prisma.encuesta.findFirst({ where: { titulo, año_academico: ANIO } });
  if (!enc) return;
  const exists = await prisma.respuestaEncuesta.findFirst({ where: { encuesta_id: enc.id, usuario_id: userId } });
  if (!exists) {
    await prisma.respuestaEncuesta.create({
      data: {
        encuesta_id: enc.id,
        usuario_id: userId,
        fecha_respuesta: respTs
      }
    });
  }
}

// Cuota diaria de alertas automáticas ULTRA-REDUCIDA para ~20-25 en 14 días (1-2 por día)
function getDailyAlertQuota(dayIndex) {
  const twoDays = [1, 5, 9, 12]; // solo 4 días con 2 alertas
  return twoDays.includes(dayIndex) ? 2 : 1;
}

// Genera alertas automáticas con REALISMO APLICADO:
// - Solo 80-85% de alertas se visualizan (no 100%)
// - Tiempos de reacción variables según contexto (2-8h)
// - Menos accesos post-alerta (1-2, no 5+)
async function generateAutoAlertsForDay(dayIndex, dayDate, padreId, estudianteId, cursos) {
  const count = getDailyAlertQuota(dayIndex);
  
  for (let i = 0; i < count; i++) {
    let tipo = 'asistencia';
    let titulo = '';
    let contenido = '';
    let modulo = 'asistencia';

    if (i % 3 === 0) {
      titulo = 'Alerta de tardanza';
      contenido = 'Se registró tardanza en el día.';
    } else if (i % 3 === 1) {
      titulo = 'Alerta de falta injustificada';
      contenido = 'Se registró falta injustificada.';
    } else {
      tipo = 'calificacion';
      titulo = 'Alerta de calificación baja';
      contenido = 'Se registró calificación por debajo del umbral.';
      modulo = 'calificaciones';
    }

    const notifTs = addHours(dayDate, 11 + (i * 2));
    const notif = await createNotificacion(padreId, tipo, titulo, contenido, notifTs, 'alta', estudianteId, null);
    
    // REALISMO: 80-85% de alertas se visualizan (15-20% quedan sin leer)
    const shouldRead = Math.random() > 0.18; // 82% probabilidad
    
    if (shouldRead) {
      // Variabilidad en tiempo de reacción según contexto
      let reactionHours;
      const isWeekend = [6, 7, 13, 14].includes(dayIndex);
      const isEvening = notifTs.getHours() >= 18;
      
      if (isWeekend) {
        reactionHours = randInt(6, 12); // más lenta fines de semana
      } else if (isEvening) {
        reactionHours = randInt(8, 14); // lee al día siguiente si es noche
      } else {
        reactionHours = randInt(2, 6); // más rápida horario laboral
      }
      
      const readTs = addHours(notifTs, reactionHours);
      await markNotificacionLeida(notif.id, readTs);

      // Acceso post-alerta moderado (1-2 accesos promedio)
      const postAccesos = Math.random() < 0.3 ? 1 : 2; // 30% = 1 acceso, 70% = 2 accesos
      
      for (let j = 0; j < postAccesos; j++) {
        const sessionId = randomUUID();
        const tsLogin = addMinutes(readTs, 10 + (j * 20));
        await insertAuth(padreId, 'login', true, tsLogin, sessionId);
        const dur = randInt(40, 180);
        const cursoId = pickCourseId(cursos, i + j);
        const url = modulo === 'calificaciones'
          ? `/calificaciones/estudiante/${estudianteId}/curso/${cursoId}`
          : `/asistencia/estudiante/${estudianteId}`;
        await insertAccess(padreId, sessionId, modulo, estudianteId, cursoId, addMinutes(tsLogin, 3), dur, url);
        await insertAuth(padreId, 'logout', true, addMinutes(tsLogin, 12), sessionId);
      }
    }
    // 18% de alertas quedan sin visualizar (comportamiento natural)
  }
}

async function simularSesionAccesos(usuario, rol, dayDate, consultas, estudiante, cursos, loginIndex = 0) {
  const loginTs = timestampForDay(dayDate, rol, loginIndex);
  const sessionId = randomUUID();
  await insertAuth(usuario.id, 'login', true, loginTs, sessionId);
  
  let accessIndex = 0;
  for (const c of consultas) {
    const { modulo, cantidad } = c;
    for (let i = 0; i < cantidad; i++) {
      const ts = addMinutes(loginTs, 2 + accessIndex * 4 + randInt(0, 3));
      const dur = randInt(25, 200);
      const cursoId = (modulo === 'calificaciones' || modulo === 'asistencia') ? pickCourseId(cursos, accessIndex) : null;
      const url = modulo === 'calificaciones'
        ? `/calificaciones/estudiante/${estudiante.id}/curso/${cursoId}`
        : modulo === 'asistencia'
          ? `/asistencia/estudiante/${estudiante.id}`
          : `/${modulo}`;
      await insertAccess(usuario.id, sessionId, modulo, estudiante.id, cursoId, ts, dur, url);
      accessIndex++;
    }
  }
  
  const logoutTs = addMinutes(loginTs, 15 + consultas.reduce((acc, c) => acc + (c.cantidad * 4), 0));
  await insertAuth(usuario.id, 'logout', true, logoutTs, sessionId);
}

// CRONOGRAMA REALISTA aplicando PropuestaReajuste.md
function buildCronograma(padreId) {
  return [
    // Día 1 - Exploración inicial alta (domingo)
    {
      padre:   { logins: 1, consultas: [{ modulo: 'calificaciones', cantidad: 2 }, { modulo: 'asistencia', cantidad: 1 }, { modulo: 'comunicados', cantidad: 1 }] },
      docente: { logins: 0 },
      director:{ logins: 1 },
      admin:   { logins: 0 },
      actions: [
        { type: 'read_comunicado', title: 'Bienvenida al Trimestre II - Año Académico 2025', delayH: 4 },
        { type: 'read_comunicado', title: 'Recordatorio de protocolo institucional - Primaria', delayH: 18 }
      ]
    },
    // Día 2 - Exploración inicial (lunes)
    {
      padre:   { logins: 1, consultas: [{ modulo: 'calificaciones', cantidad: 2 }, { modulo: 'notificaciones', cantidad: 1 }] },
      docente: { logins: 1 },
      director:{ logins: 0 },
      admin:   { logins: 1 },
      actions: [
        { type: 'read_comunicado', title: 'Nuevas medidas de seguridad sanitaria - Actualización', delayH: 22 },
        { type: 'read_comunicado', title: 'Recordatorio de entrega de tareas - Matemática', delayH: 26 }
      ]
    },
    // Día 3 - Uso regular (martes)
    {
      padre:   { logins: 1, consultas: [{ modulo: 'calificaciones', cantidad: 1 }, { modulo: 'encuestas', cantidad: 1 }] },
      docente: { logins: 1 },
      director:{ logins: 1 },
      admin:   { logins: 0 },
      actions: [
        { type: 'create_ticket', by: 'padre', categoria: 'acceso_plataforma', prioridad: 'normal', titulo: 'No puedo visualizar calificaciones del trimestre anterior', horasResolucion: 16 },
        { type: 'read_comunicado', title: 'Cronograma de evaluaciones parciales - Noviembre 2025', delayH: 20 }
      ]
    },
    // Día 4 - SIN ACCESO (miércoles - padre ocupado)
    {
      padre:   { logins: 0, consultas: [] },
      docente: { logins: 1 },
      director:{ logins: 0 },
      admin:   { logins: 1 },
      actions: [
        { type: 'read_comunicado', title: 'Suspensión de clases por motivos de fuerza mayor - 15 de marzo', delayH: 36 }
      ]
    },
    // Día 5 - Uso ligero (jueves)
    {
      padre:   { logins: 1, consultas: [{ modulo: 'asistencia', cantidad: 1 }] },
      docente: { logins: 1 },
      director:{ logins: 1 },
      admin:   { logins: 0 },
      actions: [
        { type: 'read_comunicado', title: 'Primaria: entrega de rúbricas y criterios', delayH: 28 }
      ]
    },
    // Día 6 - SIN ACCESO (viernes - padre ocupado)
    {
      padre:   { logins: 0, consultas: [] },
      docente: { logins: 1 },
      director:{ logins: 0 },
      admin:   { logins: 1 },
      actions: [
        { type: 'create_ticket', by: 'docente', categoria: 'funcionalidad_academica', prioridad: 'alta', titulo: 'Error al cargar archivo de calificaciones en formato CSV', horasResolucion: 14 }
      ]
    },
    // Día 7 - SIN ACCESO (sábado - fin de semana)
    {
      padre:   { logins: 0, consultas: [] },
      docente: { logins: 0 },
      director:{ logins: 0 },
      admin:   { logins: 0 },
      actions: []
    },
    // Día 8 - SIN ACCESO (domingo - fin de semana)
    {
      padre:   { logins: 0, consultas: [] },
      docente: { logins: 0 },
      director:{ logins: 0 },
      admin:   { logins: 0 },
      actions: [
        { type: 'read_comunicado', title: 'Cambio de horario por actividad institucional', delayH: 40 }
      ]
    },
    // Día 9 - Vuelta a actividad (lunes)
    {
      padre:   { logins: 1, consultas: [{ modulo: 'calificaciones', cantidad: 1 }, { modulo: 'asistencia', cantidad: 1 }] },
      docente: { logins: 1 },
      director:{ logins: 1 },
      admin:   { logins: 0 },
      actions: [
        { type: 'read_comunicado', title: 'Convocatoria a escuela de padres - Primaria', delayH: 24 }
      ]
    },
    // Día 10 - SIN ACCESO (martes - cansancio/ocupado)
    {
      padre:   { logins: 0, consultas: [] },
      docente: { logins: 0 },
      director:{ logins: 1 },
      admin:   { logins: 1 },
      actions: [
        { type: 'answer_survey', title: 'Satisfacción con la comunicación institucional y seguimiento académico', delayH: 18 }
      ]
    },
    // Día 11 - SIN ACCESO (miércoles - fatiga/ocupado)
    {
      padre:   { logins: 0, consultas: [] },
      docente: { logins: 1 },
      director:{ logins: 0 },
      admin:   { logins: 0 },
      actions: []
    },
    // Día 12 - Uso ocasional (jueves)
    {
      padre:   { logins: 1, consultas: [{ modulo: 'calificaciones', cantidad: 1 }] },
      docente: { logins: 1 },
      director:{ logins: 1 },
      admin:   { logins: 1 },
      actions: [
        { type: 'answer_survey', title: 'Valoración del curso de Matemática - Trimestre II', delayH: 22 },
        { type: 'read_comunicado', title: 'Comunicado Primaria: Reunión de padres de familia - Diciembre', delayH: 14 }
      ]
    },
    // Día 13 - SIN ACCESO (viernes - padre ocupado trabajo)
    {
      padre:   { logins: 0, consultas: [] },
      docente: { logins: 1 },
      director:{ logins: 0 },
      admin:   { logins: 0 },
      actions: []
    },
    // Día 14 - Cierre ligero (sábado)
    {
      padre:   { logins: 1, consultas: [{ modulo: 'calificaciones', cantidad: 1 }] },
      docente: { logins: 0 },
      director:{ logins: 1 },
      admin:   { logins: 0 },
      actions: [
        { type: 'answer_survey', title: 'Satisfacción con módulos CORE - Mixta', delayH: 26 }
      ]
    }
  ];
}

async function main() {
  console.log(`🚀 [VERSIÓN REALISTA] Iniciando simulación de ${TOTAL_DIAS} días (rango ${FECHA_INICIO.toISOString().slice(0,10)} a ${FECHA_FIN.toISOString().slice(0,10)})...`);
  
  const { padre, docente, director, administrador } = await getUsuariosClave();
  const estudiante = await getEstudiantePrincipal();
  const cursos = await getCursosActivos();

  const cronograma = buildCronograma(padre.id);

  for (let dia = 1; dia <= TOTAL_DIAS; dia++) {
    const dayDate = addDays(FECHA_INICIO, dia - 1);
    process.stdout.write(`\n📅 Día ${dia} (${dayDate.toISOString().slice(0,10)})\n`);
    const dayCfg = cronograma[dia - 1] || { padre: { logins: 0 }, docente: { logins: 0 }, director: { logins: 0 }, admin: { logins: 0 }, actions: [] };

    // Simular logins y accesos por rol
    if (dayCfg.padre?.logins) {
      for (let i = 0; i < dayCfg.padre.logins; i++) {
        await simularSesionAccesos(padre, 'apoderado', dayDate, dayCfg.padre.consultas || [], estudiante, cursos, i);
      }
    }
    if (dayCfg.docente?.logins) {
      for (let i = 0; i < dayCfg.docente.logins; i++) {
        await simularSesionAccesos(docente, 'docente', dayDate, dayCfg.docente.consultas || [], estudiante, cursos, i);
      }
    }
    if (dayCfg.director?.logins) {
      for (let i = 0; i < dayCfg.director.logins; i++) {
        await simularSesionAccesos(director, 'director', dayDate, dayCfg.director.consultas || [], estudiante, cursos, i);
      }
    }
    if (dayCfg.admin?.logins) {
      for (let i = 0; i < dayCfg.admin.logins; i++) {
        await simularSesionAccesos(administrador, 'administrador', dayDate, [], estudiante, cursos, i);
      }
    }

    // Acciones específicas del día
    if (dayCfg.actions && dayCfg.actions.length > 0) {
      for (const act of dayCfg.actions) {
        if (act.type === 'read_comunicado') {
          const readTs = addHours(dayDate, act.delayH || 8);
          await markComunicadoReadByTitle(padre.id, act.title, readTs);
        } else if (act.type === 'create_ticket') {
          const creator = act.by === 'padre' ? padre.id : act.by === 'docente' ? docente.id : director.id;
          const assignTo = administrador.id;
          const createdTs = addHours(dayDate, 10);
          await createTicketAndResolve(creator, act.categoria, act.prioridad, act.titulo, act.titulo, createdTs, act.horasResolucion || 16, assignTo);
        } else if (act.type === 'answer_survey') {
          const ts = addHours(dayDate, act.delayH || 20);
          await responderEncuestaPorTitulo(padre.id, act.title, ts);
        }
      }
    }

    // Alertas automáticas del día (reducidas y con realismo)
    await generateAutoAlertsForDay(dia, dayDate, padre.id, estudiante.id, cursos);

    process.stdout.write(`✅ Día ${dia} completado\n`);
  }

  console.log('\n✅ Simulación realista de 14 días finalizada.');
  console.log('\n📊 Resumen esperado con ajustes aplicados:');
  console.log('- M1: ~9-12 accesos/semana a calificaciones (vs 35.5 anterior)');
  console.log('- M2: ~7-9 accesos/semana a asistencia (vs 43 anterior)'); 
  console.log('- M4: ~58-67% comunicados leídos (vs 25% anterior)');
  console.log('- M6: ~80-85% notificaciones vistas (vs 100% anterior)');
  console.log('- M9: ~8-10 logins/semana (vs 17.23 anterior)');
  console.log('- M10: ~64-71% constancia (vs 100% anterior)');
  console.log('- M14: 4-5 módulos usados (vs 3 anterior)');
}

main()
  .catch((e) => {
    console.error('❌ Error en simulación realista:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });