/**
 * Pre-carga de Comunicados y Encuestas para Fase 3 (14 días)
 * - 12 comunicados publicados (6 generales, 6 segmentados por nivel)
 * - 4 encuestas activas (2 padres, 1 docente, 1 mixta) con preguntas mínimas
 * 
 * Idempotente: Verifica por (titulo + autor) antes de crear.
 * Requiere: Usuarios de seed creados (Carlos apoderado, María docente, Jorge director).
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ANIO = 2025;

// Parámetros CLI/ENV: --start=YYYY-MM-DD (SIM_START o SIM_START_DATE)
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
const DEFAULT_START = '2025-10-27';

// Ventana de simulación (parametrizable)
const FECHA_INICIO = new Date((startStr || DEFAULT_START) + 'T08:00:00-05:00'); // Lunes por defecto
const FECHA_FIN = new Date(new Date((startStr || DEFAULT_START) + 'T00:00:00-05:00').getTime() + (14 * 24 * 60 * 60 * 1000) - 1000);

// Utilidades
function dateAt(dayOffset, hour = 9) {
  const d = new Date(FECHA_INICIO);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function getUsuarioPorNombre(nombre) {
  const u = await prisma.usuario.findFirst({ where: { nombre } });
  if (!u) throw new Error(`Usuario no encontrado: ${nombre}`);
  return u;
}

async function upsertComunicado({ titulo, contenido, tipo, prioridad = 'normal', autor_id, publicoObjetivoIds, fecha_publicacion, nivelesObjetivo = [] }) {
  // No existe unique en titulo, verificamos por par (autor_id + titulo + año)
  const existente = await prisma.comunicado.findFirst({
    where: { autor_id, titulo, año_academico: ANIO }
  });
  if (existente) {
    // Actualiza fechas y campos clave para mantener coherencia con el nuevo FECHA_INICIO
    return prisma.comunicado.update({
      where: { id: existente.id },
      data: {
        contenido,
        tipo,
        prioridad,
        publico_objetivo: publicoObjetivoIds,
        niveles_objetivo: nivelesObjetivo,
        estado: 'publicado',
        fecha_creacion: fecha_publicacion,
        fecha_publicacion
      }
    });
  }

  return prisma.comunicado.create({
    data: {
      titulo,
      contenido,
      tipo, // TipoComunicado
      estado: 'publicado',
      autor_id,
      publico_objetivo: publicoObjetivoIds,
      niveles_objetivo: nivelesObjetivo,
      grados_objetivo: [],
      cursos_objetivo: [],
      fecha_creacion: fecha_publicacion,
      fecha_publicacion,
      requiere_confirmacion: false,
      prioridad, // PrioridadComunicado
      editado: false,
      año_academico: ANIO
    }
  });
}

async function upsertEncuestaConPreguntas({ titulo, descripcion, autor_id, fecha_inicio, fecha_vencimiento, preguntas }) {
  const existente = await prisma.encuesta.findFirst({
    where: { titulo, autor_id, año_academico: ANIO }
  });
  if (existente) {
    // Actualiza fechas/estado; no recrea preguntas si ya existen
    await prisma.encuesta.update({
      where: { id: existente.id },
      data: {
        descripcion,
        fecha_inicio,
        fecha_vencimiento,
        estado: 'activa',
        mostrar_resultados: true
      }
    });
    return existente;
  }

  const encuesta = await prisma.encuesta.create({
    data: {
      titulo,
      descripcion,
      fecha_creacion: fecha_inicio,
      fecha_inicio,
      fecha_vencimiento,
      estado: 'activa',
      permite_respuesta_multiple: false,
      es_anonima: false,
      mostrar_resultados: true,
      autor_id,
      año_academico: ANIO
    }
  });

  // Crear preguntas mínimas
  let orden = 1;
  for (const p of preguntas) {
    const preg = await prisma.preguntaEncuesta.create({
      data: {
        encuesta_id: encuesta.id,
        texto: p.texto,
        tipo: p.tipo, // 'texto_corto' | 'opcion_unica' | 'opcion_multiple' | 'escala_1_5' | 'texto_largo'
        obligatoria: p.obligatoria ?? false,
        orden: orden++
      }
    });

    if (p.opciones && p.opciones.length > 0) {
      let idx = 1;
      for (const opt of p.opciones) {
        await prisma.opcionPregunta.create({
          data: {
            pregunta_id: preg.id,
            texto: opt,
            orden: idx++
          }
        });
      }
    }
  }

  return encuesta;
}

async function main() {
  console.log('Pre-cargando comunicados y encuestas para simulación...');

  // Usuarios clave
  const padre = await getUsuarioPorNombre('Carlos');
  const docente = await getUsuarioPorNombre('María');
  const director = await getUsuarioPorNombre('Jorge');

  const publicoPadresSoloCarlos = [padre.id]; // String[] (UUIDs) según schema

  // -------------------------------
  // Comunicados del Director (3)
  // -------------------------------
  await upsertComunicado({
    titulo: 'Bienvenida al Trimestre II - Año Académico 2025',
    contenido: 'Estimadas familias, damos inicio al Trimestre II con el compromiso de fortalecer la comunicación y el seguimiento académico.',
    tipo: 'informativo',
    prioridad: 'normal',
    autor_id: director.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(0, 9) // Día 1
  });

  await upsertComunicado({
    titulo: 'Suspensión de clases por motivos de fuerza mayor - 15 de marzo',
    contenido: 'Se suspenderán las clases el 15 de marzo por motivos de fuerza mayor. Agradecemos su comprensión.',
    tipo: 'urgente',
    prioridad: 'alta',
    autor_id: director.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(6, 10) // Día 7
  });

  await upsertComunicado({
    titulo: 'Invitación a Jornada de Integración Familiar - 25 de marzo',
    contenido: 'Quedan invitados a la Jornada de Integración Familiar el 25 de marzo. ¡Los esperamos!',
    tipo: 'evento',
    prioridad: 'normal',
    autor_id: director.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(10, 11) // Día 11-12
  });

  // -------------------------------
  // Comunicados del Docente (3)
  // -------------------------------
  await upsertComunicado({
    titulo: 'Recordatorio de entrega de tareas - Matemática',
    contenido: 'Se recuerda a los padres que la entrega de tareas de Matemática vence el viernes de la presente semana.',
    tipo: 'academico',
    prioridad: 'normal',
    autor_id: docente.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(1, 9) // Día 2
  });

  await upsertComunicado({
    titulo: 'Cambio de horario por actividad institucional',
    contenido: 'El horario del curso de Matemática cambiará el día jueves por actividades institucionales.',
    tipo: 'informativo',
    prioridad: 'normal',
    autor_id: docente.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(7, 9) // Día 8
  });

  await upsertComunicado({
    titulo: 'Avance del programa curricular - Trimestre II',
    contenido: 'Se comparte el avance del programa curricular del curso de Matemática correspondiente al Trimestre II.',
    tipo: 'academico',
    prioridad: 'normal',
    autor_id: docente.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(12, 9) // Día 13
  });

  // -------------------------------
  // Comunicados adicionales para alcanzar 12 (6 generales, 6 segmentados por nivel)
  // Nota: Los 6 primeros (arriba) se mantienen como GENERALES.
  // Aquí añadimos 6 SEGMENTADOS por nivel = 'Primaria' manteniendo el público que incluye al padre (Carlos).
  // -------------------------------

  // Director (segmentados por nivel)
  await upsertComunicado({
    titulo: 'Recordatorio de protocolo institucional - Primaria',
    contenido: 'Se recuerda el cumplimiento del protocolo institucional durante el trimestre (nivel Primaria).',
    tipo: 'informativo',
    prioridad: 'normal',
    autor_id: director.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(2, 9), // Día 3
    nivelesObjetivo: ['Primaria']
  });

  await upsertComunicado({
    titulo: 'Convocatoria a escuela de padres - Primaria',
    contenido: 'Invitación a la escuela de padres dirigida al nivel Primaria.',
    tipo: 'evento',
    prioridad: 'normal',
    autor_id: director.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(8, 9), // Día 9
    nivelesObjetivo: ['Primaria']
  });

  await upsertComunicado({
    titulo: 'Indicaciones para Primaria sobre evaluación formativa',
    contenido: 'Indicaciones específicas para el nivel Primaria respecto a evaluación formativa.',
    tipo: 'informativo',
    prioridad: 'normal',
    autor_id: director.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(13, 9), // Día 14
    nivelesObjetivo: ['Primaria']
  });

  // Docente (segmentados por nivel)
  await upsertComunicado({
    titulo: 'Primaria: cronograma de tareas de la semana',
    contenido: 'Detalle de tareas y fechas para el nivel Primaria.',
    tipo: 'academico',
    prioridad: 'normal',
    autor_id: docente.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(11, 9), // Día 12
    nivelesObjetivo: ['Primaria']
  });

  await upsertComunicado({
    titulo: 'Primaria: entrega de rúbricas y criterios',
    contenido: 'Se publica la rúbrica de evaluación y criterios para actividades del nivel Primaria.',
    tipo: 'academico',
    prioridad: 'normal',
    autor_id: docente.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(3, 9), // Día 4
    nivelesObjetivo: ['Primaria']
  });

  await upsertComunicado({
    titulo: 'Primaria: material de refuerzo disponible',
    contenido: 'Se habilitó material de refuerzo para el nivel Primaria en plataforma.',
    tipo: 'informativo',
    prioridad: 'normal',
    autor_id: docente.id,
    publicoObjetivoIds: publicoPadresSoloCarlos,
    fecha_publicacion: dateAt(9, 9), // Día 10
    nivelesObjetivo: ['Primaria']
  });

  console.log('Comunicados cargados/asegurados.');

  // -------------------------------
  // Encuestas
  // -------------------------------
  // Encuesta del Director
  await upsertEncuestaConPreguntas({
    titulo: 'Satisfacción con la comunicación institucional y seguimiento académico',
    descripcion: 'Encuesta para conocer su satisfacción respecto a la comunicación y el seguimiento académico.',
    autor_id: director.id,
    fecha_inicio: dateAt(8, 9), // Día 9
    fecha_vencimiento: dateAt(14, 23), // Fin de período
    preguntas: [
      { texto: 'La comunicación institucional es oportuna.', tipo: 'escala_1_5', obligatoria: true },
      { texto: '¿Con qué frecuencia revisa la plataforma por semana?', tipo: 'opcion_unica', opciones: ['1 vez', '2-3 veces', '4 o más'], obligatoria: true },
      { texto: 'Comentarios adicionales', tipo: 'texto_largo', obligatoria: false }
    ]
  });

  // Encuesta del Docente
  await upsertEncuestaConPreguntas({
    titulo: 'Valoración del curso de Matemática - Trimestre II',
    descripcion: 'Encuesta breve para conocer su percepción sobre el curso.',
    autor_id: docente.id,
    fecha_inicio: dateAt(10, 9), // Día 11
    fecha_vencimiento: dateAt(14, 23),
    preguntas: [
      { texto: 'Las tareas asignadas son claras.', tipo: 'escala_1_5', obligatoria: true },
      { texto: 'Dificultad percibida del curso', tipo: 'opcion_unica', opciones: ['Baja', 'Media', 'Alta'], obligatoria: true },
      { texto: 'Sugerencias', tipo: 'texto_corto', obligatoria: false }
    ]
  });

  // Encuesta adicional (Padres)
  await upsertEncuestaConPreguntas({
    titulo: 'Usabilidad de la plataforma web - Padres',
    descripcion: 'Encuesta breve para evaluar la facilidad de uso de la plataforma por parte de los padres.',
    autor_id: director.id,
    fecha_inicio: dateAt(5, 9), // Día 6
    fecha_vencimiento: dateAt(8, 23),
    preguntas: [
      { texto: 'La plataforma es fácil de usar.', tipo: 'escala_1_5', obligatoria: true },
      { texto: '¿Qué módulo utiliza con mayor frecuencia?', tipo: 'opcion_unica', opciones: ['Calificaciones', 'Asistencia', 'Comunicados', 'Encuestas'], obligatoria: true },
      { texto: 'Comentarios', tipo: 'texto_corto', obligatoria: false }
    ]
  });

  // Encuesta adicional (Mixta: padres + docentes)
  await upsertEncuestaConPreguntas({
    titulo: 'Satisfacción con módulos CORE - Mixta',
    descripcion: 'Encuesta para recoger retroalimentación sobre Autenticación, Datos Académicos, Comunicados, Encuestas, Soporte y Notificaciones.',
    autor_id: docente.id,
    fecha_inicio: dateAt(12, 9), // Día 13
    fecha_vencimiento: dateAt(14, 23), // Fin del período
    preguntas: [
      { texto: 'Las notificaciones llegan a tiempo.', tipo: 'escala_1_5', obligatoria: true },
      { texto: 'Priorización de módulos por utilidad', tipo: 'opcion_multiple', opciones: ['Autenticación','Datos Académicos','Comunicados','Encuestas','Soporte Técnico','Notificaciones'], obligatoria: false },
      { texto: 'Sugerencias de mejora', tipo: 'texto_largo', obligatoria: false }
    ]
  });

  console.log('Encuestas cargadas/aseguradas.');
  console.log('✅ Pre-carga de comunicados y encuestas completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error en pre-carga:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });