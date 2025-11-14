const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Inicialización del cliente Prisma
const prisma = new PrismaClient();

/**
 * Script para crear una encuesta completa con respuestas enriquecidas
 * para probar la funcionalidad de resultados y gráficos
 */

// Usuarios adicionales para generar respuestas
const usuariosAdicionalesData = [
  {
    tipo_documento: 'DNI',
    nro_documento: '11111112',
    password: '123456789',
    rol: 'docente',
    nombre: 'Ana',
    apellido: 'Fernandez',
    telefono: '+51911111111'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111113',
    password: '123456789',
    rol: 'docente',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    telefono: '+51922222222'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111114',
    password: '123456789',
    rol: 'docente',
    nombre: 'Maria',
    apellido: 'Silva',
    telefono: '+51933333333'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111115',
    password: '123456789',
    rol: 'docente',
    nombre: 'Luis',
    apellido: 'Rojas',
    telefono: '+51944444444'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111116',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Patricia',
    apellido: 'Lopez',
    telefono: '+51955555555'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111117',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Roberto',
    apellido: 'Vargas',
    telefono: '+51966666666'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111118',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Claudia',
    apellido: 'Ramos',
    telefono: '+51977777777'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111119',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Jorge',
    apellido: 'Torres',
    telefono: '+51988888888'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111120',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Sandra',
    apellido: 'Morales',
    telefono: '+51999999990'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111121',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Miguel',
    apellido: 'Herrera',
    telefono: '+51999999991'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111122',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Elena',
    apellido: 'Castro',
    telefono: '+51999999992'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111123',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Ricardo',
    apellido: 'Ortiz',
    telefono: '+51999999993'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111124',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Andrea',
    apellido: 'Suarez',
    telefono: '+51999999994'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111125',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Fernando',
    apellido: 'Medina',
    telefono: '+51999999995'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111126',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Gabriela',
    apellido: 'Valencia',
    telefono: '+51999999996'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111127',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Alejandro',
    apellido: 'Jimenez',
    telefono: '+51999999997'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111128',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Valeria',
    apellido: 'Diaz',
    telefono: '+51999999998'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111129',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Diego',
    apellido: 'Santos',
    telefono: '+51999999999'
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11111130',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Monica',
    apellido: 'Aguilar',
    telefono: '+51988888889'
  }
];

// Datos de la encuesta completa para probar resultados
const encuestaCompletaData = {
  titulo: 'Evaluación Integral del Servicio Educativo 2025',
  descripcion: 'Encuesta comprensiva para evaluar todos los aspectos del servicio educativo brindado por nuestra institución. Sus respuestas nos permitirán mejorar continuamente y brindar una educación de excelencia.',
  fecha_vencimiento: new Date('2025-12-31T23:59:59.000Z'),
  permite_respuesta_multiple: false,
  es_anonima: false,
  mostrar_resultados: true,
  año_academico: 2025,
  preguntas: [
    {
      texto: '¿Cómo calificarías la calidad general de la enseñanza en una escala del 1 al 5?',
      tipo: 'escala_1_5',
      obligatoria: true,
      orden: 1
    },
    {
      texto: '¿Cuál es tu nivel de satisfacción con las instalaciones físicas del colegio?',
      tipo: 'opcion_unica',
      obligatoria: true,
      orden: 2,
      opciones: [
        { texto: 'Muy satisfecho', orden: 1 },
        { texto: 'Satisfecho', orden: 2 },
        { texto: 'Neutral', orden: 3 },
        { texto: 'Insatisfecho', orden: 4 },
        { texto: 'Muy insatisfecho', orden: 5 }
      ]
    },
    {
      texto: '¿Qué servicios adicionales consideras más importantes? (Puedes seleccionar múltiples opciones)',
      tipo: 'opcion_multiple',
      obligatoria: false,
      orden: 3,
      opciones: [
        { texto: 'Transporte escolar', orden: 1 },
        { texto: 'Servicio de biblioteca', orden: 2 },
        { texto: 'Actividades deportivas', orden: 3 },
        { texto: 'Talleres de arte y cultura', orden: 4 },
        { texto: 'Programa de alimentación', orden: 5 },
        { texto: 'Servicios médicos escolares', orden: 6 },
        { texto: 'Actividades tecnológicas', orden: 7 }
      ]
    },
    {
      texto: '¿Qué mejoras específicas propones para la institución?',
      tipo: 'texto_corto',
      obligatoria: false,
      orden: 4
    },
    {
      texto: 'Describe detalladamente tu experiencia con la comunicación entre la institución y las familias',
      tipo: 'texto_largo',
      obligatoria: false,
      orden: 5
    }
  ],
  autor_documento: '99999999' // Director institucional
};

// Respuestas predefinidas para generar datos realistas
const respuestasPredefinidas = {
  escala_1_5: [1, 2, 3, 4, 5, 4, 5, 3, 4, 4, 5, 2, 4, 3, 5, 4, 4, 3, 5, 4],
  opcion_unica: [
    'Muy satisfecho', 'Satisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho',
    'Satisfecho', 'Neutral', 'Insatisfecho', 'Satisfecho', 'Satisfecho',
    'Muy satisfecho', 'Neutral', 'Satisfecho', 'Neutral', 'Muy satisfecho',
    'Satisfecho', 'Satisfecho', 'Neutral', 'Muy satisfecho', 'Satisfecho'
  ],
  opcion_multiple: [
    ['Transporte escolar', 'Servicio de biblioteca', 'Actividades deportivas'],
    ['Talleres de arte y cultura', 'Programa de alimentación'],
    ['Actividades deportivas', 'Talleres de arte y cultura', 'Actividades tecnológicas'],
    ['Servicio de biblioteca', 'Actividades deportivas', 'Servicios médicos escolares'],
    ['Transporte escolar', 'Actividades deportivas', 'Programa de alimentación'],
    ['Talleres de arte y cultura', 'Actividades tecnológicas'],
    ['Servicio de biblioteca', 'Talleres de arte y cultura', 'Programa de alimentación'],
    ['Actividades deportivas', 'Servicios médicos escolares', 'Actividades tecnológicas'],
    ['Transporte escolar', 'Servicio de biblioteca', 'Actividades deportivas'],
    ['Talleres de arte y cultura', 'Programa de alimentación', 'Actividades tecnológicas'],
    ['Servicio de biblioteca', 'Actividades deportivas', 'Servicios médicos escolares'],
    ['Transporte escolar', 'Talleres de arte y cultura', 'Actividades tecnológicas'],
    ['Actividades deportivas', 'Programa de alimentación'],
    ['Servicio de biblioteca', 'Talleres de arte y cultura', 'Servicios médicos escolares'],
    ['Transporte escolar', 'Actividades deportivas', 'Actividades tecnológicas'],
    ['Talleres de arte y cultura', 'Programa de alimentación', 'Servicios médicos escolares'],
    ['Servicio de biblioteca', 'Actividades deportivas'],
    ['Transporte escolar', 'Talleres de arte y cultura', 'Programa de alimentación'],
    ['Actividades deportivas', 'Actividades tecnológicas'],
    ['Servicio de biblioteca', 'Talleres de arte y cultura', 'Actividades deportivas']
  ],
  texto_corto: [
    'Mejorar las aulas con más tecnología',
    'Ampliar la biblioteca y horarios',
    'Más actividades deportivas y recreativas',
    'Mejorar el sistema de comunicación con padres',
    'Ampliar las instalaciones deportivas',
    'Implementar más talleres de arte',
    'Mejorar la calidad de la alimentación',
    'Más actividades tecnológicas para estudiantes',
    'Ampliar el servicio de transporte',
    'Mejorar las instalaciones médicas',
    'Implementar laboratorio de ciencias',
    'Más actividades extracurriculares',
    'Mejorar el sistema de seguridad',
    'Ampliar programas deportivos',
    'Implementar jardín vertical',
    'Mejorar el sistema de climatización',
    'Más actividades culturales',
    'Implementar huerto escolar',
    'Ampliar el teatro escolar',
    'Mejorar los laboratorios de computación'
  ],
  texto_largo: [
    'La comunicación entre la institución y las familias es muy buena. Los docentes están siempre disponibles para conversar sobre el progreso de nuestros hijos. El uso de la aplicación móvil facilita mucho estar informados sobre las actividades y eventos escolares.',
    'He notado una mejora significativa en la comunicación. Antes era más complicado coordinar con los profesores, pero ahora con las reuniones virtuales y el sistema de mensajería, todo es más ágil y eficiente.',
    'La comunicación es excelente. Los maestros son muy profesionales y siempre responden a nuestras consultas. Me gusta que nos informen sobre el comportamiento y rendimiento académico de manera regular.',
    'Considero que la comunicación puede mejorar. A veces es difícil conseguir información específica sobre las actividades de nuestros hijos. Espero que puedan implementar más canales de comunicación directa.',
    'La comunicación es buena en general, pero podría ser más frecuente. Me gustaría recibir más reportes sobre el desarrollo social y emocional de mi hija, no solo académico.',
    'Estoy muy satisfecho con la comunicación institucional. Los canales son diversos: llamadas telefónicas, correos, reuniones presenciales y la aplicación. Todo funciona muy bien.',
    'La comunicación es efectiva pero puede ser más personalizada. Me gustaría conocer más sobre las metodologías de enseñanza que utilizan con mi hijo.',
    'Excelente comunicación. Los docentes son muy accesibles y siempre están dispuestos a atender nuestras consultas. El sistema de notificaciones es muy útil.',
    'La comunicación es buena pero podría mejorarse en cuanto a tiempos de respuesta. A veces tardan un poco en responder consultas urgentes.',
    'Estoy muy contento con la comunicación. Es clara, oportuna y nos mantiene bien informados sobre todo lo relacionado con la educación de nuestros hijos.',
    'La comunicación entre la institución y las familias es muy profesional. Los docentes y directivos siempre mantienen una actitud amable y comprensiva.',
    'Me parece que la comunicación es adecuada pero podría ser más frecuente. Me gusta estar al tanto de las actividades diarias de mi hijo en el colegio.',
    'La comunicación es muy buena, especialmente la digital. La aplicación móvil es muy práctica para revisar calificaciones, horarios y comunicados importantes.',
    'Estoy satisfecho con la comunicación. Los profesores siempre informan sobre el progreso académico y también sobre aspectos conductuales y sociales.',
    'La comunicación es excelente. Se nota que hay un compromiso real con mantener informados a los padres sobre la educación integral de sus hijos.',
    'La comunicación es buena, aunque a veces los mensajes pueden perderse entre tanta información. Sería bueno tener un sistema más organizado.',
    'Considero que la comunicación es muy efectiva. Los canales son múltiples y siempre hay alguien disponible para atender nuestras consultas.',
    'La comunicación es muy buena, especialmente en momentos importantes como evaluaciones o eventos especiales. Los padres siempre estamos bien informados.',
    'Estoy muy pleased con la comunicación. Es clara, directa y siempre oportuna. Los docentes y directivos están muy comprometidos con la transparencia.',
    'La comunicación es excelente en general. Solo sugiero que podrían mejorar en la comunicación de actividades extracurriculares y eventos especiales.'
  ]
};

// Función para crear usuarios adicionales
async function crearUsuariosAdicionales() {
  console.log('👥 Creando usuarios adicionales para generar respuestas...');
  const usuariosCreados = [];
  
  for (const usuarioData of usuariosAdicionalesData) {
    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        AND: [
          { tipo_documento: usuarioData.tipo_documento },
          { nro_documento: usuarioData.nro_documento }
        ]
      }
    });
    
    if (!usuarioExistente) {
      const hashedPassword = await bcrypt.hash(usuarioData.password, 10);
      
      const usuario = await prisma.usuario.create({
        data: {
          tipo_documento: usuarioData.tipo_documento,
          nro_documento: usuarioData.nro_documento,
          password_hash: hashedPassword,
          rol: usuarioData.rol,
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido,
          telefono: usuarioData.telefono,
          debe_cambiar_password: false
        }
      });
      
      usuariosCreados.push(usuario);
      console.log(`✅ Usuario creado: ${usuario.nombre} ${usuario.apellido} (${usuario.rol})`);
    } else {
      usuariosCreados.push(usuarioExistente);
      console.log(`ℹ️ Usuario ya existe: ${usuarioExistente.nombre} ${usuarioExistente.apellido}`);
    }
  }
  
  return usuariosCreados;
}

// Función para crear la encuesta completa
async function crearEncuestaCompleta() {
  console.log('📋 Creando encuesta completa para resultados...');
  
  // Buscar al director como autor
  const director = await prisma.usuario.findFirst({
    where: {
      tipo_documento: 'DNI',
      nro_documento: '99999999'
    }
  });
  
  if (!director) {
    throw new Error('No se pudo encontrar al director con DNI 99999999');
  }
  
  // Verificar si la encuesta ya existe
  const encuestaExistente = await prisma.encuesta.findFirst({
    where: { titulo: encuestaCompletaData.titulo }
  });
  
  if (encuestaExistente) {
    console.log(`ℹ️ La encuesta "${encuestaCompletaData.titulo}" ya existe`);
    return encuestaExistente;
  }
  
  // Crear la encuesta
  const nuevaEncuesta = await prisma.encuesta.create({
    data: {
      titulo: encuestaCompletaData.titulo,
      descripcion: encuestaCompletaData.descripcion,
      fecha_inicio: new Date(),
      fecha_vencimiento: encuestaCompletaData.fecha_vencimiento,
      permite_respuesta_multiple: encuestaCompletaData.permite_respuesta_multiple,
      es_anonima: encuestaCompletaData.es_anonima,
      mostrar_resultados: encuestaCompletaData.mostrar_resultados,
      año_academico: encuestaCompletaData.año_academico,
      estado: 'activa',
      autor_id: director.id
    }
  });
  
  console.log(`✅ Encuesta creada: "${encuestaCompletaData.titulo}"`);
  
  // Crear las preguntas
  const preguntasCreadas = [];
  for (const preguntaData of encuestaCompletaData.preguntas) {
    const nuevaPregunta = await prisma.preguntaEncuesta.create({
      data: {
        encuesta_id: nuevaEncuesta.id,
        texto: preguntaData.texto,
        tipo: preguntaData.tipo,
        obligatoria: preguntaData.obligatoria,
        orden: preguntaData.orden
      }
    });
    
    preguntasCreadas.push(nuevaPregunta);
    console.log(`  ✅ Pregunta creada: "${preguntaData.texto}"`);
    
    // Crear las opciones si las hay
    if (preguntaData.opciones && preguntaData.opciones.length > 0) {
      for (const opcionData of preguntaData.opciones) {
        await prisma.opcionPregunta.create({
          data: {
            pregunta_id: nuevaPregunta.id,
            texto: opcionData.texto,
            orden: opcionData.orden
          }
        });
      }
      console.log(`    ✅ ${preguntaData.opciones.length} opciones creadas para la pregunta`);
    }
  }
  
  return {
    encuesta: nuevaEncuesta,
    preguntas: preguntasCreadas
  };
}

// Función para generar respuestas a la encuesta
async function generarRespuestas(encuestaCompleta, usuarios) {
  console.log('📝 Generando respuestas enriquecidas para la encuesta...');
  
  const { encuesta, preguntas } = encuestaCompleta;
  
  // Distribuir respuestas entre los usuarios disponibles
  const usuariosParaResponder = usuarios.filter(u => ['docente', 'apoderado'].includes(u.rol));
  
  if (usuariosParaResponder.length < 20) {
    console.log(`⚠️ Solo hay ${usuariosParaResponder.length} usuarios disponibles para responder`);
  }
  
  for (let i = 0; i < 20 && i < usuariosParaResponder.length; i++) {
    const usuario = usuariosParaResponder[i];
    
    // Verificar si el usuario ya respondió esta encuesta
    const respuestaExistente = await prisma.respuestaEncuesta.findUnique({
      where: {
        encuesta_id_usuario_id: {
          encuesta_id: encuesta.id,
          usuario_id: usuario.id
        }
      }
    });
    
    if (respuestaExistente) {
      console.log(`ℹ️ Usuario ${usuario.nombre} ya respondió la encuesta`);
      continue;
    }
    
    // Crear la respuesta principal
    const nuevaRespuesta = await prisma.respuestaEncuesta.create({
      data: {
        encuesta_id: encuesta.id,
        usuario_id: usuario.id,
        fecha_respuesta: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        tiempo_respuesta_minutos: Math.floor(Math.random() * 30) + 10, // 10-40 minutos
        ip_respuesta: '127.0.0.1'
      }
    });
    
    // Crear las respuestas a cada pregunta
    for (let j = 0; j < preguntas.length; j++) {
      const pregunta = preguntas[j];
      let datosRespuesta = {
        respuesta_id: nuevaRespuesta.id,
        pregunta_id: pregunta.id
      };
      
      // Asignar respuesta según el tipo de pregunta
      switch (pregunta.tipo) {
        case 'escala_1_5':
          datosRespuesta.valor_escala = respuestasPredefinidas.escala_1_5[i];
          break;
          
        case 'opcion_unica':
          const opcionTexto = respuestasPredefinidas.opcion_unica[i];
          const opcion = await prisma.opcionPregunta.findFirst({
            where: {
              pregunta_id: pregunta.id,
              texto: opcionTexto
            }
          });
          if (opcion) {
            datosRespuesta.valor_opcion_id = opcion.id;
          }
          break;
          
        case 'opcion_multiple':
          const opcionesSeleccionadas = respuestasPredefinidas.opcion_multiple[i];
          const opciones = await prisma.opcionPregunta.findMany({
            where: {
              pregunta_id: pregunta.id,
              texto: { in: opcionesSeleccionadas }
            }
          });
          datosRespuesta.valor_opciones = opciones.map(o => o.id);
          break;
          
        case 'texto_corto':
          datosRespuesta.valor_texto = respuestasPredefinidas.texto_corto[i];
          break;
          
        case 'texto_largo':
          datosRespuesta.valor_texto = respuestasPredefinidas.texto_largo[i];
          break;
      }
      
      await prisma.respuestaPregunta.create({
        data: datosRespuesta
      });
    }
    
    console.log(`✅ Respuesta creada para: ${usuario.nombre} ${usuario.apellido} (${usuario.rol})`);
  }
}

// Función principal
async function main() {
  console.log('🌱 Iniciando generación de encuesta completa para resultados...');
  
  try {
    // 1. Crear usuarios adicionales
    const usuariosCreados = await crearUsuariosAdicionales();
    
    // 2. Crear la encuesta completa
    const encuestaCompleta = await crearEncuestaCompleta();
    
    // 3. Generar respuestas enriquecidas
    await generarRespuestas(encuestaCompleta, usuariosCreados);
    
    console.log('🎉 Generación de encuesta completa para resultados finalizada con éxito!');
    console.log('\n📊 Resumen de datos creados:');
    console.log('- Usuario director: DNI 99999999 (autor de la encuesta)');
    console.log('- Usuarios adicionales para respuestas: 20');
    console.log('- Encuesta completa: "Evaluación Integral del Servicio Educativo 2025"');
    console.log('- Preguntas: 5 (escala, opción única, opción múltiple, texto corto, texto largo)');
    console.log('- Respuestas: 20 (distribuidas entre docentes y apoderados)');
    console.log('\n🔍 Endpoints para probar resultados:');
    console.log(`GET /encuestas/${encuestaCompleta.encuesta.id}/resultados/preguntas`);
    console.log(`GET /encuestas/${encuestaCompleta.encuesta.id}/estadisticas`);
    console.log(`GET /respuestas-encuestas?encuesta_id=${encuestaCompleta.encuesta.id}&page=1&limit=20`);
    
  } catch (error) {
    console.error('❌ Error durante la generación:', error);
    throw error;
  } finally {
    // Desconectar el cliente Prisma
    await prisma.$disconnect();
    console.log('🔌 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar la función principal
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });