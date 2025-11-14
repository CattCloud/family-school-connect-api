'use strict';

/**
 * Seed de Soporte Enriquecido
 * - Basado en usuarios creados por scripts/seed_datos_encuestas.js
 * - Crea: Categorías FAQ y Guías, FAQs, Guías, Tickets con estados/prioridades,
 *         Respuestas admin, Resoluciones, Calificaciones, Adjuntos y Notificaciones mínimas
 *
 * Ejecución:
 *   1) npx prisma generate
 *   2) node scripts/seed_soporte.js
 *
 * Modelos relevantes:
 *   - Usuario, TicketSoporte, RespuestaTicket, ArchivoAdjunto, Notificacion
 *   - CategoriaFAQ, FAQ, CategoriaGuia, Guia
 *
 * Esquema Prisma: ver [prisma/schema.prisma](prisma/schema.prisma:646)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ANIO = 2025;

/* Utilidades */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* =========================
 * 1) Helpers comunes
 * ========================= */
async function getUsuarioByDocumento(dni) {
  const user = await prisma.usuario.findFirst({
    where: { tipo_documento: 'DNI', nro_documento: dni },
  });
  if (!user) {
    console.log(`⚠️ Usuario DNI ${dni} no encontrado. Asegúrate de ejecutar scripts/seed_datos_encuestas.js antes.`);
  }
  return user;
}

async function upsertCategoriaFAQ({ nombre, icono, color, descripcion }) {
  return prisma.categoriaFAQ.upsert({
    where: { nombre },
    update: { icono, color, descripcion },
    create: { nombre, icono, color, descripcion },
  });
}

async function upsertCategoriaGuia({ nombre, icono, color, descripcion }) {
  return prisma.categoriaGuia.upsert({
    where: { nombre },
    update: { icono, color, descripcion },
    create: { nombre, icono, color, descripcion },
  });
}

async function upsertFAQ({ categoriaNombre, pregunta, respuesta, orden = 1, activa = true }) {
  const categoria = await prisma.categoriaFAQ.findUnique({ where: { nombre: categoriaNombre } });
  if (!categoria) {
    console.log(`⚠️ CategoriaFAQ "${categoriaNombre}" no existe, creando por defecto...`);
    await upsertCategoriaFAQ({ nombre: categoriaNombre, icono: 'help', color: '#888888', descripcion: null });
  }
  const cat = await prisma.categoriaFAQ.findUnique({ where: { nombre: categoriaNombre } });

  // No existe restricción única, idempotencia por combinación (pregunta + categoria_id)
  const existing = await prisma.fAQ.findFirst({
    where: { pregunta, categoria_id: cat.id },
  });
  if (existing) return existing;

  return prisma.fAQ.create({
    data: {
      pregunta,
      respuesta,
      categoria_id: cat.id,
      orden,
      activa,
      vistas: 0,
    },
  });
}

async function upsertGuia({ categoriaNombre, titulo, descripcion, icono, pdf_url, paginas = null, tamaño_mb = null }) {
  const categoria = await prisma.categoriaGuia.findUnique({ where: { nombre: categoriaNombre } });
  if (!categoria) {
    console.log(`⚠️ CategoriaGuia "${categoriaNombre}" no existe, creando por defecto...`);
    await upsertCategoriaGuia({ nombre: categoriaNombre, icono: 'book', color: '#888888', descripcion: null });
  }
  const cat = await prisma.categoriaGuia.findUnique({ where: { nombre: categoriaNombre } });

  // Idempotencia por combinación (titulo + categoria_id)
  const existing = await prisma.guia.findFirst({
    where: { titulo, categoria_id: cat.id },
  });
  if (existing) return existing;

  return prisma.guia.create({
    data: {
      titulo,
      descripcion,
      categoria_id: cat.id,
      icono,
      pdf_url,
      paginas,
      tamaño_mb: tamaño_mb ? String(tamaño_mb) : null,
      descargas: 0,
      activa: true,
    },
  });
}

async function generarNumeroTicket() {
  const year = new Date().getFullYear();
  const prefijo = `#SOP-${year}`;
  const ultimo = await prisma.ticketSoporte.findFirst({
    where: { numero_ticket: { startsWith: prefijo } },
    orderBy: { numero_ticket: 'desc' },
  });

  if (!ultimo) return `${prefijo}-0001`;
  const parts = ultimo.numero_ticket.split('-');
  const lastNum = parseInt(parts[2], 10);
  const next = String(lastNum + 1).padStart(4, '0');
  return `${prefijo}-${next}`;
}

async function upsertTicket({
  usuario_id,
  titulo,
  descripcion,
  categoria, // enum CategoriaTicket
  prioridad, // enum PrioridadTicket
  estado, // enum EstadoTicket
  asignado_a = null,
  satisfaccion_usuario = null,
  fecha_creacion = null,
}) {
  // Idempotencia: por (usuario_id + titulo + año_academico)
  const existing = await prisma.ticketSoporte.findFirst({
    where: { usuario_id, titulo, año_academico: ANIO },
  });
  if (existing) {
    // Actualizar estado/prioridad/asignado si difiere (solo para mantener consistencia del seed)
    return prisma.ticketSoporte.update({
      where: { id: existing.id },
      data: {
        descripcion,
        categoria,
        prioridad: prioridad || existing.prioridad,
        estado: estado || existing.estado,
        asignado_a,
        satisfaccion_usuario,
      },
    });
  }

  const numero_ticket = await generarNumeroTicket();

  return prisma.ticketSoporte.create({
    data: {
      numero_ticket,
      titulo,
      descripcion,
      categoria,
      prioridad: prioridad || 'normal',
      estado: estado || 'pendiente',
      usuario_id,
      asignado_a,
      año_academico: ANIO,
      fecha_creacion: fecha_creacion || new Date(),
    },
  });
}

async function crearRespuesta({
  ticket_id,
  usuario_id,
  contenido,
  es_respuesta_publica = true,
  estado_cambio = null,
  fecha_respuesta = null,
}) {
  const resp = await prisma.respuestaTicket.create({
    data: {
      ticket_id,
      usuario_id,
      contenido: contenido.trim(),
      es_respuesta_publica,
      estado_cambio: estado_cambio || undefined,
      fecha_respuesta: fecha_respuesta || new Date(),
    },
  });

  // Si hay cambio de estado, actualizar ticket
  if (estado_cambio) {
    const updateData = { estado: estado_cambio };
    if (estado_cambio === 'resuelto') {
      updateData.fecha_resolucion = new Date();
    }
    await prisma.ticketSoporte.update({
      where: { id: ticket_id },
      data: updateData,
    });
  }

  return resp;
}

function diffHours(a, b) {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.floor(ms / (1000 * 60 * 60));
}

async function actualizarTiempoRespuesta(ticket_id) {
  // Buscar ticket y primera respuesta
  const ticket = await prisma.ticketSoporte.findUnique({
    where: { id: ticket_id },
    select: { fecha_creacion: true },
  });
  if (!ticket) return null;

  const primeraRespuesta = await prisma.respuestaTicket.findFirst({
    where: { ticket_id },
    orderBy: { fecha_respuesta: 'asc' },
  });

  if (!primeraRespuesta) return null;

  const horas = diffHours(primeraRespuesta.fecha_respuesta, ticket.fecha_creacion);
  await prisma.ticketSoporte.update({
    where: { id: ticket_id },
    data: { tiempo_respuesta_horas: horas },
  });
  return horas;
}

async function crearAdjuntoEjemplo({
  ticket_id,
  subido_por,
  nombre_original,
  nombre_archivo,
  url_cloudinary,
  tipo_mime,
  tamaño_bytes,
  es_imagen = false,
}) {
  // Idempotencia por (ticket_id + nombre_archivo)
  const exists = await prisma.archivoAdjunto.findFirst({
    where: { ticket_id, nombre_archivo },
  });
  if (exists) return exists;

  return prisma.archivoAdjunto.create({
    data: {
      ticket_id,
      subido_por,
      nombre_original,
      nombre_archivo,
      url_cloudinary,
      tipo_mime,
      tamaño_bytes,
      es_imagen,
    },
  });
}

async function notificarAdminsNuevoTicket(ticket) {
  // Buscar administradores activos
  const admins = await prisma.usuario.findMany({
    where: { rol: 'administrador', estado_activo: true },
    select: { id: true },
  });

  if (admins.length === 0) return 0;

  // Crear notificaciones simples (evitar duplicados por (usuario_id, ticket_id, tipo, titulo))
  let creadas = 0;
  for (const admin of admins) {
    const exists = await prisma.notificacion.findFirst({
      where: {
        usuario_id: admin.id,
        ticket_id: ticket.id,
        tipo: 'ticket',
        titulo: 'Nuevo Ticket de Soporte',
      },
    });
    if (exists) continue;

    await prisma.notificacion.create({
      data: {
        usuario_id: admin.id,
        tipo: 'ticket',
        titulo: 'Nuevo Ticket de Soporte',
        contenido: `Se ha creado un nuevo ticket: ${ticket.numero_ticket} - ${ticket.titulo}`,
        canal: 'plataforma',
        referencia_id: ticket.id,
        tipo_referencia: 'ticket',
        año_academico: ANIO,
        ticket_id: ticket.id,
        url_destino: `/soporte/admin/tickets/${ticket.id}`,
      },
    });
    creadas += 1;
  }
  return creadas;
}

async function notificarUsuarioCambio(ticket, titulo, contenido) {
  const exists = await prisma.notificacion.findFirst({
    where: {
      usuario_id: ticket.usuario_id,
      ticket_id: ticket.id,
      tipo: 'ticket',
      titulo,
    },
  });
  if (exists) return exists;

  return prisma.notificacion.create({
    data: {
      usuario_id: ticket.usuario_id,
      tipo: 'ticket',
      titulo,
      contenido,
      canal: 'plataforma',
      referencia_id: ticket.id,
      tipo_referencia: 'ticket',
      año_academico: ANIO,
      ticket_id: ticket.id,
      url_destino: `/soporte/tickets/${ticket.id}`,
    },
  });
}

/* =========================
 * 2) Seed Centro de Ayuda
 * ========================= */
async function seedCentroAyuda() {
  console.log('📚 Sembrando Centro de Ayuda (Categorías, FAQs, Guías)...');

  // Categorías de FAQ (alineadas al catálogo de SupportService)
  const categoriasFAQ = [
    { nombre: 'Acceso a la Plataforma', icono: 'login', color: '#4CAF50' },
    { nombre: 'Funcionalidad Académica', icono: 'school', color: '#2196F3' },
    { nombre: 'Comunicaciones', icono: 'chat', color: '#FF9800' },
    { nombre: 'Reportes y Estadísticas', icono: 'assessment', color: '#9C27B0' },
    { nombre: 'Sugerencias', icono: 'lightbulb', color: '#607D8B' },
    { nombre: 'Errores del Sistema', icono: 'bug_report', color: '#F44336' },
    { nombre: 'Otros', icono: 'more_horiz', color: '#795548' },
  ];

  for (const c of categoriasFAQ) {
    await upsertCategoriaFAQ({ ...c, descripcion: null });
  }

  // FAQs
  const faqs = [
    {
      categoriaNombre: 'Acceso a la Plataforma',
      pregunta: '¿Cómo restablecer mi contraseña?',
      respuesta:
        'Desde la pantalla de inicio de sesión, selecciona "¿Olvidaste tu contraseña?" y sigue las instrucciones del mensaje.',
      orden: 1,
      activa: true,
    },
    {
      categoriaNombre: 'Acceso a la Plataforma',
      pregunta: 'No recibo el correo de recuperación',
      respuesta:
        'Verifica tu carpeta de spam y que tu correo esté correctamente asociado a tu cuenta. Si persiste, crea un ticket.',
      orden: 2,
      activa: true,
    },
    {
      categoriaNombre: 'Funcionalidad Académica',
      pregunta: '¿Cómo consultar calificaciones del trimestre?',
      respuesta:
        'Ingresa a Calificaciones, selecciona el estudiante y el trimestre deseado. Podrás ver el detalle por componente.',
      orden: 1,
      activa: true,
    },
    {
      categoriaNombre: 'Comunicaciones',
      pregunta: '¿Cómo enviar un mensaje a un docente?',
      respuesta:
        'Desde Mensajería, crea una conversación seleccionando al docente, curso y asunto. Adjunta archivos si es necesario.',
      orden: 1,
      activa: true,
    },
    {
      categoriaNombre: 'Errores del Sistema',
      pregunta: 'Error 500 al abrir mis calificaciones',
      respuesta:
        'Intenta refrescar la página e iniciar sesión nuevamente. Si el problema persiste, genera un ticket con captura de pantalla.',
      orden: 1,
      activa: true,
    },
  ];
  for (const f of faqs) {
    await upsertFAQ(f);
  }

  // Categorías de Guías
  const categoriasGuia = [
    { nombre: 'Primeros pasos', icono: 'rocket', color: '#10B981' },
    { nombre: 'Guías Prácticas', icono: 'menu_book', color: '#9C27B0' },
  ];
  for (const c of categoriasGuia) {
    await upsertCategoriaGuia({ ...c, descripcion: null });
  }

  // Guías
  const guias = [
    {
      categoriaNombre: 'Guías Prácticas',
      titulo: 'Guía completa para consultar calificaciones',
      descripcion:
        'Aprenda a utilizar todas las funcionalidades del módulo de calificaciones, incluyendo filtros, exportación y comparación.',
      icono: 'menu_book',
      pdf_url: '/uploads/guias/guia_calificaciones.pdf',
      paginas: 12,
      tamaño_mb: 2.5,
    },
    {
      categoriaNombre: 'Guías Prácticas',
      titulo: 'Guía de uso de mensajería con docentes',
      descripcion:
        'Pasos para crear conversaciones con docentes, adjuntar archivos y recibir notificaciones.',
      icono: 'message',
      pdf_url: '/uploads/guias/guia_mensajeria.pdf',
      paginas: 8,
      tamaño_mb: 1.2,
    },
    {
      categoriaNombre: 'Primeros pasos',
      titulo: 'Guía de acceso a la plataforma',
      descripcion:
        'Cómo iniciar sesión, recuperar contraseña y configurar tus datos de acceso a la plataforma.',
      icono: 'login',
      pdf_url: '/uploads/guias/guia_acceso.pdf',
      paginas: 10,
      tamaño_mb: 1.8,
    },
  ];
  for (const g of guias) {
    await upsertGuia(g);
  }

  console.log('✅ Centro de Ayuda sembrado.');
}

/* =========================
 * 3) Seed Tickets Soporte
 * ========================= */
async function seedTicketsSoporte() {
  console.log('🧾 Sembrando Tickets de Soporte...');

  // Usuarios base (del seed de encuestas)
  const admin = await getUsuarioByDocumento('11111111'); // Admin Sistema
  const director = await getUsuarioByDocumento('99999999'); // Director Institución
  const docente1 = await getUsuarioByDocumento('77777777'); // Docente Ejemplo
  const apoderado1 = await getUsuarioByDocumento('88888888'); // Padre Ejemplo
  const docenteMaria = await getUsuarioByDocumento('12345678'); // Maria Rodriguez
  const apoderadoCarlos = await getUsuarioByDocumento('87654321'); // Carlos Perez
  const docenteLuis = await getUsuarioByDocumento('11223344'); // Luis Gonzalez

  const usuariosOk = [admin, director, docente1, apoderado1, docenteMaria, apoderadoCarlos, docenteLuis].every(Boolean);
  if (!usuariosOk) {
    console.log('❌ Faltan usuarios base. Aborta seed de soporte.');
    return;
  }

  // Dataset de tickets (por usuario)
  const dataset = [
    // Lote A — Apoderado 88888888
    {
      usuario_id: apoderado1.id,
      titulo: 'No puedo acceder al portal de padres',
      descripcion:
        'Intento iniciar sesión y me devuelve error de credenciales aunque son correctas. Probé cambiar de navegador sin éxito.',
      categoria: 'acceso_plataforma',
      prioridad: 'critica',
      estado: 'pendiente',
      asignado_a: null,
      satisfaccion_usuario: null,
      key: 'T1',
    },
    {
      usuario_id: apoderado1.id,
      titulo: 'No puedo enviar mensajes al docente',
      descripcion: 'El sistema muestra un error al presionar enviar en la conversación con el docente.',
      categoria: 'comunicaciones',
      prioridad: 'alta',
      estado: 'en_progreso',
      asignado_a: admin.id,
      satisfaccion_usuario: null,
      key: 'T2',
    },
    {
      usuario_id: apoderado1.id,
      titulo: 'Error al ver calificaciones del T2',
      descripcion: 'Pantalla en blanco al abrir calificaciones del segundo trimestre.',
      categoria: 'funcionalidad_academica',
      prioridad: 'normal',
      estado: 'resuelto',
      asignado_a: admin.id,
      satisfaccion_usuario: 5,
      key: 'T3',
    },

    // Lote B — Apoderado 87654321
    {
      usuario_id: apoderadoCarlos.id,
      titulo: 'No entiendo el reporte anual',
      descripcion: '¿Podrían explicarme el promedio anual y su cálculo? No encuentro la guía.',
      categoria: 'reportes',
      prioridad: 'baja',
      estado: 'esperando_respuesta',
      asignado_a: admin.id,
      satisfaccion_usuario: null,
      key: 'T4',
    },

    // Lote C — Docente 77777777
    {
      usuario_id: docente1.id,
      titulo: 'Notificaciones no llegan a padres',
      descripcion: 'He publicado comunicados pero algunos padres no ven las notificaciones.',
      categoria: 'comunicaciones',
      prioridad: 'alta',
      estado: 'en_progreso',
      asignado_a: admin.id,
      satisfaccion_usuario: null,
      key: 'T5',
    },
    {
      usuario_id: docente1.id,
      titulo: 'Error 500 al cargar lista de estudiantes',
      descripcion: 'Al cargar el listado en mi curso CP3001 sale error 500 de servidor.',
      categoria: 'errores_sistema',
      prioridad: 'critica',
      estado: 'pendiente',
      asignado_a: null,
      satisfaccion_usuario: null,
      key: 'T6',
    },

    // Lote D — Docente 12345678
    {
      usuario_id: docenteMaria.id,
      titulo: 'Duda sobre estructura de evaluación',
      descripcion: '¿Dónde veo los componentes de evaluación activos?',
      categoria: 'funcionalidad_academica',
      prioridad: 'normal',
      estado: 'cerrado',
      asignado_a: admin.id,
      satisfaccion_usuario: null,
      key: 'T7',
    },

    // Lote E — Director 99999999
    {
      usuario_id: director.id,
      titulo: 'Tablero de estadísticas incompleto',
      descripcion: 'Los KPIs de soporte no muestran tasa de resolución en el panel.',
      categoria: 'reportes',
      prioridad: 'alta',
      estado: 'en_progreso',
      asignado_a: admin.id,
      satisfaccion_usuario: null,
      key: 'T8',
    },
  ];

  // Crear tickets (upsert) y acumular referencia
  const tickets = {};
  for (const item of dataset) {
    const t = await upsertTicket(item);
    tickets[item.key] = t;

    // Notificar admins para nuevos tickets en estado pendiente (ejemplo T1/T6)
    if (item.estado === 'pendiente') {
      await notificarAdminsNuevoTicket(t);
    }
  }

  // Respuestas administrativas y resoluciones
  // T2: en_progreso -> respuesta inicial
  if (tickets.T2) {
    await crearRespuesta({
      ticket_id: tickets.T2.id,
      usuario_id: admin.id,
      contenido:
        'Hola, estamos revisando el problema de envío de mensajes. ¿Puedes indicar si aparece algún código de error específico?',
      es_respuesta_publica: true,
      estado_cambio: 'en_progreso',
    });
    await actualizarTiempoRespuesta(tickets.T2.id);
  }

  // T3: resuelto -> solución + satisfacción ya incluida en ticket
  if (tickets.T3) {
    await crearRespuesta({
      ticket_id: tickets.T3.id,
      usuario_id: admin.id,
      contenido:
        'SOLUCIÓN: Se corrigió la consulta de calificaciones del T2. Por favor vuelve a intentar. Gracias por tu paciencia.',
      es_respuesta_publica: true,
      estado_cambio: 'resuelto',
    });
    await actualizarTiempoRespuesta(tickets.T3.id);
  }

  // T4: esperando_respuesta -> solicitar más detalles
  if (tickets.T4) {
    await crearRespuesta({
      ticket_id: tickets.T4.id,
      usuario_id: admin.id,
      contenido:
        'Para poder ayudarte mejor, ¿puedes adjuntar una captura del reporte y señalar qué parte no queda clara?',
      es_respuesta_publica: true,
      estado_cambio: 'esperando_respuesta',
    });
    await actualizarTiempoRespuesta(tickets.T4.id);
  }

  // T5: en_progreso -> respuesta inicial
  if (tickets.T5) {
    await crearRespuesta({
      ticket_id: tickets.T5.id,
      usuario_id: admin.id,
      contenido:
        'Hemos detectado un retraso en la sincronización de notificaciones. Aplicaremos un ajuste y te avisamos.',
      es_respuesta_publica: true,
      estado_cambio: 'en_progreso',
    });
    await actualizarTiempoRespuesta(tickets.T5.id);
  }

  // Adjuntos de ejemplo
  if (tickets.T1) {
    await crearAdjuntoEjemplo({
      ticket_id: tickets.T1.id,
      subido_por: apoderado1.id,
      nombre_original: 'captura_error.png',
      nombre_archivo: 'soporte_captura_error.png',
      url_cloudinary: 'https://res.cloudinary.com/demo/image/upload/sample.png',
      tipo_mime: 'image/png',
      tamaño_bytes: 245760,
      es_imagen: true,
    });
  }

  if (tickets.T3) {
    await crearAdjuntoEjemplo({
      ticket_id: tickets.T3.id,
      subido_por: admin.id,
      nombre_original: 'solucion_calificaciones.pdf',
      nombre_archivo: 'solucion_calificaciones.pdf',
      url_cloudinary: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      tipo_mime: 'application/pdf',
      tamaño_bytes: 314572,
      es_imagen: false,
    });
  }

  // Notificaciones mínimas por cambios (ejemplo para T3 resuelto)
  if (tickets.T3) {
    await notificarUsuarioCambio(
      tickets.T3,
      'Ticket Resuelto',
      `Su ticket ${tickets.T3.numero_ticket} ha sido marcado como resuelto.`
    );
  }

  console.log('✅ Tickets de Soporte sembrados.');
  return tickets;
}

/* =========================
 * 4) Main
 * ========================= */
async function main() {
  console.log('🌱 Iniciando seed de Soporte...');
  try {
    await seedCentroAyuda();
    const tickets = await seedTicketsSoporte();

    // Resumen
    const totalTickets = await prisma.ticketSoporte.count({ where: { año_academico: ANIO } });
    const porEstado = await prisma.ticketSoporte.groupBy({
      by: ['estado'],
      where: { año_academico: ANIO },
      _count: { estado: true },
    });

    console.log('\n📊 Resumen Soporte');
    console.log(`- Año Académico: ${ANIO}`);
    console.log(`- Total Tickets: ${totalTickets}`);
    for (const row of porEstado) {
      console.log(`  * ${row.estado}: ${row._count.estado}`);
    }

    // Listado corto
    const lista = await prisma.ticketSoporte.findMany({
      where: { año_academico: ANIO },
      select: { numero_ticket: true, titulo: true, estado: true, prioridad: true },
      orderBy: { fecha_creacion: 'asc' },
    });
    console.log('\n🗂️ Tickets:');
    lista.forEach((t) => {
      console.log(`- ${t.numero_ticket} | ${t.estado} | ${t.prioridad} | ${t.titulo}`);
    });

    console.log('\n🎉 Seed de Soporte completado.');
  } catch (err) {
    console.error('❌ Error en seed de Soporte:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();