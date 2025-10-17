'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para simular el comportamiento de las instancias de prueba
 * 
 * Este script simula:
 * 1. Logins y logouts de usuarios
 * 2. Consultas a calificaciones y asistencia
 * 3. Envío de mensajes entre padres y docentes
 * 
 * Simula el comportamiento de las 3 instancias de prueba:
 * - Padre Activo: Login diario, consultas frecuentes, mensajes regulares
 * - Padre Reactivo: Login ocasional, consultas esporádicas
 * - Docente: Login regular, carga de datos, respuestas rápidas
 */
async function main() {
  console.log('Iniciando simulación de comportamiento de instancias de prueba...');

  // Verificar que las tablas de logging existen
  const tablasExisten = await verificarTablasLogging();
  if (!tablasExisten) {
    console.error('Las tablas de logging no existen. Ejecute primero el script de creación de tablas.');
    return;
  }

  // Obtener los IDs de los usuarios de prueba
  const usuarios = await obtenerUsuariosPrueba();
  if (!usuarios) {
    console.error('Los usuarios de prueba no existen. Ejecute primero el script de seeds_pruebas_cap6_uuid.js.');
    return;
  }

  console.log('Usuarios de prueba encontrados:', usuarios);

  // Definir período de simulación (2 semanas)
  const fechaInicio = new Date('2025-01-01');
  const fechaFin = new Date('2025-01-14');

  // Simular comportamiento de Padre Activo
  await simularPadreActivo(fechaInicio, fechaFin, usuarios.padre_activo);

  // Simular comportamiento de Padre Reactivo
  await simularPadreReactivo(fechaInicio, fechaFin, usuarios.padre_reactivo);

  // Simular comportamiento de Docente
  await simularDocente(fechaInicio, fechaFin, usuarios.docente_prueba);

  // Simular conversaciones entre usuarios
  await simularConversaciones(fechaInicio, fechaFin, usuarios);

  console.log('Simulación completada exitosamente.');
}

/**
 * Verifica que las tablas de logging existen en la base de datos
 */
async function verificarTablasLogging() {
  try {
    const tablas = ['auth_logs', 'access_logs'];
    
    for (const tabla of tablas) {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tabla}
        );
      `;
      
      if (!result[0].exists) {
        console.error(`La tabla ${tabla} no existe.`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error al verificar tablas de logging:', error);
    return false;
  }
}

/**
 * Obtiene los IDs de los usuarios de prueba por su número de documento
 */
async function obtenerUsuariosPrueba() {
  try {
    // Buscar usuarios por su número de documento
    const padreActivo = await prisma.usuario.findFirst({
      where: { nro_documento: '12345678', rol: 'apoderado' }
    });
    
    const padreReactivo = await prisma.usuario.findFirst({
      where: { nro_documento: '87654321', rol: 'apoderado' }
    });
    
    const docente = await prisma.usuario.findFirst({
      where: { nro_documento: '11223344', rol: 'docente' }
    });
    
    if (!padreActivo || !padreReactivo || !docente) {
      console.error('No se encontraron todos los usuarios de prueba:');
      if (!padreActivo) console.error('- Padre Activo (DNI: 12345678) no encontrado');
      if (!padreReactivo) console.error('- Padre Reactivo (DNI: 87654321) no encontrado');
      if (!docente) console.error('- Docente (DNI: 11223344) no encontrado');
      return null;
    }
    
    return {
      padre_activo: padreActivo.id,
      padre_reactivo: padreReactivo.id,
      docente_prueba: docente.id
    };
  } catch (error) {
    console.error('Error al obtener usuarios de prueba:', error);
    return null;
  }
}

/**
 * Simula el comportamiento del Padre Activo
 * - Login diario (5 veces/semana)
 * - Consulta calificaciones 2 veces/semana
 * - Consulta asistencia semanalmente
 * - Envía 2-3 mensajes/semana a docentes
 */
async function simularPadreActivo(fechaInicio, fechaFin, usuario_id) {
  console.log('Simulando comportamiento de Padre Activo...');
  
  const estudiantes = await obtenerEstudiantesPadre(usuario_id);
  
  // Iterar por cada día del período
  for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
    const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Simular login en días laborables (lunes a viernes)
    if (diaSemana >= 1 && diaSemana <= 5) {
      // Login por la mañana (entre 7:00 y 8:00)
      const horaLogin = new Date(fecha);
      horaLogin.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      
      await registrarLogin(usuario_id, horaLogin);
      
      // Consulta de calificaciones (lunes y jueves)
      if (diaSemana === 1 || diaSemana === 4) {
        for (const estudiante of estudiantes) {
          const horaConsulta = new Date(horaLogin);
          horaConsulta.setMinutes(horaConsulta.getMinutes() + Math.floor(Math.random() * 30));
          
          await registrarConsultaCalificaciones(usuario_id, 'apoderado', estudiante.id, horaConsulta);
        }
      }
      
      // Consulta de asistencia (miércoles)
      if (diaSemana === 3) {
        for (const estudiante of estudiantes) {
          const horaConsulta = new Date(horaLogin);
          horaConsulta.setMinutes(horaConsulta.getMinutes() + Math.floor(Math.random() * 30));
          
          await registrarConsultaAsistencia(usuario_id, 'apoderado', estudiante.id, horaConsulta);
        }
      }
      
      // Logout después de 20-40 minutos
      const horaLogout = new Date(horaLogin);
      horaLogout.setMinutes(horaLogout.getMinutes() + 20 + Math.floor(Math.random() * 20));
      
      await registrarLogout(usuario_id, horaLogout);
    }
  }
  
  console.log('Simulación de Padre Activo completada.');
}

/**
 * Simula el comportamiento del Padre Reactivo
 * - Login solo tras recibir notificaciones (2-3 veces/semana)
 * - Consulta calificaciones 1 vez cada 2 semanas
 * - Consulta asistencia solo después de alertas
 */
async function simularPadreReactivo(fechaInicio, fechaFin, usuario_id) {
  console.log('Simulando comportamiento de Padre Reactivo...');
  
  const estudiantes = await obtenerEstudiantesPadre(usuario_id);
  
  // Definir días específicos de login (martes y viernes de la primera semana, solo martes de la segunda)
  const diasLogin = [
    new Date('2025-01-03'), // Viernes semana 1
    new Date('2025-01-07'), // Martes semana 2
    new Date('2025-01-10')  // Viernes semana 2
  ];
  
  // Simular login en días específicos
  for (const fecha of diasLogin) {
    // Login por la tarde (entre 17:00 y 19:00)
    const horaLogin = new Date(fecha);
    horaLogin.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
    
    await registrarLogin(usuario_id, horaLogin);
    
    // Consulta de calificaciones (solo el primer viernes)
    if (fecha.getTime() === new Date('2025-01-03').getTime()) {
      for (const estudiante of estudiantes) {
        const horaConsulta = new Date(horaLogin);
        horaConsulta.setMinutes(horaConsulta.getMinutes() + Math.floor(Math.random() * 20));
        
        await registrarConsultaCalificaciones(usuario_id, 'apoderado', estudiante.id, horaConsulta);
      }
    }
    
    // Consulta de asistencia (solo después de "recibir alerta" - segundo martes)
    if (fecha.getTime() === new Date('2025-01-07').getTime()) {
      for (const estudiante of estudiantes) {
        const horaConsulta = new Date(horaLogin);
        horaConsulta.setMinutes(horaConsulta.getMinutes() + Math.floor(Math.random() * 20));
        
        await registrarConsultaAsistencia(usuario_id, 'apoderado', estudiante.id, horaConsulta);
      }
    }
    
    // Logout después de 10-20 minutos (sesiones más cortas que el padre activo)
    const horaLogout = new Date(horaLogin);
    horaLogout.setMinutes(horaLogout.getMinutes() + 10 + Math.floor(Math.random() * 10));
    
    await registrarLogout(usuario_id, horaLogout);
  }
  
  console.log('Simulación de Padre Reactivo completada.');
}

/**
 * Simula el comportamiento del Docente
 * - Login 3 veces/semana
 * - Carga calificaciones 1 vez/semana
 * - Carga asistencia 3 veces/semana
 */
async function simularDocente(fechaInicio, fechaFin, usuario_id) {
  console.log('Simulando comportamiento de Docente...');
  
  
  // Iterar por cada día del período
  for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
    const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Simular login en días específicos (lunes, miércoles, viernes)
    if (diaSemana === 1 || diaSemana === 3 || diaSemana === 5) {
      // Login por la mañana (entre 8:00 y 9:00)
      const horaLogin = new Date(fecha);
      horaLogin.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      
      await registrarLogin(usuario_id, horaLogin);
      
      // Consulta de mensajes (todos los días de login)
      const horaConsultaMensajes = new Date(horaLogin);
      horaConsultaMensajes.setMinutes(horaConsultaMensajes.getMinutes() + Math.floor(Math.random() * 15));
      
      await registrarAcceso(usuario_id, 'docente', 'mensajes', 'listar_conversaciones', null, horaConsultaMensajes);
      
      // Logout después de 60-90 minutos
      const horaLogout = new Date(horaLogin);
      horaLogout.setMinutes(horaLogout.getMinutes() + 60 + Math.floor(Math.random() * 30));
      
      await registrarLogout(usuario_id, horaLogout);
    }
  }
  
  console.log('Simulación de Docente completada.');
}

/**
 * Simula conversaciones entre usuarios
 */
async function simularConversaciones(fechaInicio, fechaFin, usuarios) {
  console.log('Simulando conversaciones entre usuarios...');
  
  // Crear conversaciones iniciales
  const conversaciones = await crearConversacionesIniciales(usuarios);
  
  // Simular mensajes en las conversaciones
  for (const conversacion of conversaciones) {
    await simularMensajesEnConversacion(conversacion, fechaInicio, fechaFin);
  }
  
  console.log('Simulación de conversaciones completada.');
}

/**
 * Crea conversaciones iniciales entre padres y docente
 */
async function crearConversacionesIniciales(usuarios) {
  const conversaciones = [];
  
  // Obtener IDs de estudiantes y cursos
  const estudiante1 = await prisma.estudiante.findFirst({ where: { codigo_estudiante: 'EST001' } });
  const estudiante2 = await prisma.estudiante.findFirst({ where: { codigo_estudiante: 'EST002' } });
  const estudiante3 = await prisma.estudiante.findFirst({ where: { codigo_estudiante: 'EST003' } });
  
  const curso1 = await prisma.curso.findFirst({ where: { codigo_curso: 'MAT-P4' } });
  const curso3 = await prisma.curso.findFirst({ where: { codigo_curso: 'MAT-P6' } });
  const curso5 = await prisma.curso.findFirst({ where: { codigo_curso: 'MAT-S3' } });
  
  // Conversación 1: Padre Activo - Docente (sobre Estudiante 1)
  const conv1 = await prisma.conversacion.create({
    data: {
      padre_id: usuarios.padre_activo,
      docente_id: usuarios.docente_prueba,
      estudiante_id: estudiante1.id,
      curso_id: curso1.id, // Matemáticas 4to Primaria
      asunto: 'Consulta sobre tareas de matemáticas',
      estado: 'activa',
      fecha_inicio: new Date('2025-01-02T10:00:00'),
      fecha_ultimo_mensaje: new Date('2025-01-02T10:00:00'),
      año_academico: 2025,
      tipo_conversacion: 'padre_docente',
      creado_por: usuarios.padre_activo
    }
  });
  conversaciones.push(conv1);
  
  // Conversación 2: Padre Activo - Docente (sobre Estudiante 2)
  const conv2 = await prisma.conversacion.create({
    data: {
      padre_id: usuarios.padre_activo,
      docente_id: usuarios.docente_prueba,
      estudiante_id: estudiante2.id,
      curso_id: curso3.id, // Matemáticas 6to Primaria
      asunto: 'Dificultades con ejercicios de álgebra',
      estado: 'activa',
      fecha_inicio: new Date('2025-01-03T14:30:00'),
      fecha_ultimo_mensaje: new Date('2025-01-03T14:30:00'),
      año_academico: 2025,
      tipo_conversacion: 'padre_docente',
      creado_por: usuarios.padre_activo
    }
  });
  conversaciones.push(conv2);
  
  // Conversación 3: Padre Reactivo - Docente (sobre Estudiante 3)
  const conv3 = await prisma.conversacion.create({
    data: {
      padre_id: usuarios.padre_reactivo,
      docente_id: usuarios.docente_prueba,
      estudiante_id: estudiante3.id,
      curso_id: curso5.id, // Matemáticas 3ro Secundaria
      asunto: 'Justificación de inasistencia',
      estado: 'activa',
      fecha_inicio: new Date('2025-01-07T18:15:00'),
      fecha_ultimo_mensaje: new Date('2025-01-07T18:15:00'),
      año_academico: 2025,
      tipo_conversacion: 'padre_docente',
      creado_por: usuarios.padre_reactivo
    }
  });
  conversaciones.push(conv3);
  
  return conversaciones;
}

/**
 * Simula mensajes en una conversación
 */
async function simularMensajesEnConversacion(conversacion, fechaInicio, fechaFin) {
  // Definir patrones de mensajes según el tipo de conversación
  let mensajes = [];
  
  // Obtener información de estudiantes para comparar
  const estudiante1 = await prisma.estudiante.findFirst({ where: { codigo_estudiante: 'EST001' } });
  const estudiante2 = await prisma.estudiante.findFirst({ where: { codigo_estudiante: 'EST002' } });
  const estudiante3 = await prisma.estudiante.findFirst({ where: { codigo_estudiante: 'EST003' } });
  
  // Obtener IDs de usuarios para los mensajes
  const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678' } });
  const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321' } });
  const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344' } });
  
  if (conversacion.padre_id === padreActivo.id && conversacion.estudiante_id === estudiante1.id) {
    // Conversación 1: Padre Activo - Docente (sobre Estudiante 1)
    mensajes = [
      {
        emisor_id: padreActivo.id,
        contenido: 'Buenos días profesora. Quería consultarle sobre las tareas de matemáticas de esta semana. Juan me comenta que tiene dudas con los ejercicios de fracciones.',
        fecha_envio: new Date('2025-01-02T10:00:00')
      },
      {
        emisor_id: docente.id,
        contenido: 'Buenos días Sr. Méndez. Efectivamente, estamos trabajando con fracciones. Le recomiendo que Juan revise los ejemplos de las páginas 25-27 del libro. Si tiene dudas específicas, puede indicarme cuáles son para ayudarlo mejor.',
        fecha_envio: new Date('2025-01-02T10:45:00')
      },
      {
        emisor_id: padreActivo.id,
        contenido: 'Gracias profesora. Revisaremos esas páginas. Específicamente tiene dudas con la suma de fracciones con diferente denominador.',
        fecha_envio: new Date('2025-01-02T17:30:00')
      },
      {
        emisor_id: docente.id,
        contenido: 'Entiendo. Para ese tema, los ejercicios de la página 26 son clave. Además, mañana reforzaremos ese tema en clase. Le enviaré algunos ejercicios adicionales para que practique en casa.',
        fecha_envio: new Date('2025-01-03T08:15:00')
      },
      {
        emisor_id: padreActivo.id,
        contenido: 'Perfecto, se lo agradezco mucho. Estaremos atentos a los ejercicios adicionales.',
        fecha_envio: new Date('2025-01-03T12:20:00')
      }
    ];
  } else if (conversacion.padre_id === padreActivo.id && conversacion.estudiante_id === estudiante2.id) {
    // Conversación 2: Padre Activo - Docente (sobre Estudiante 2)
    mensajes = [
      {
        emisor_id: padreActivo.id,
        contenido: 'Buenas tardes profesora. María está teniendo dificultades con los ejercicios de álgebra. ¿Podría indicarme qué temas debería reforzar?',
        fecha_envio: new Date('2025-01-03T14:30:00')
      },
      {
        emisor_id: docente.id,
        contenido: 'Buenas tardes Sr. Méndez. María está avanzando bien, pero efectivamente necesita reforzar la resolución de ecuaciones de primer grado. Le sugiero que practique los ejercicios de las páginas 45-48.',
        fecha_envio: new Date('2025-01-03T16:00:00')
      },
      {
        emisor_id: padreActivo.id,
        contenido: 'Gracias por la información. ¿Habrá alguna evaluación próximamente sobre este tema?',
        fecha_envio: new Date('2025-01-06T09:45:00')
      },
      {
        emisor_id: docente.id,
        contenido: 'Sí, tendremos una evaluación el próximo viernes. Incluirá ecuaciones de primer grado y problemas de aplicación. Estamos repasando en clase, pero el refuerzo en casa será muy útil.',
        fecha_envio: new Date('2025-01-06T11:30:00')
      }
    ];
  } else if (conversacion.padre_id === padreReactivo.id) {
    // Conversación 3: Padre Reactivo - Docente (sobre Estudiante 3)
    mensajes = [
      {
        emisor_id: padreReactivo.id,
        contenido: 'Profesora, le escribo para justificar la inasistencia de Pedro el día de ayer. Tuvo una cita médica que no pudimos reprogramar.',
        fecha_envio: new Date('2025-01-07T18:15:00')
      },
      {
        emisor_id: docente.id,
        contenido: 'Buenas noches Sra. Torres. Gracias por la justificación. Por favor, ¿podría enviarme el certificado médico para registrarlo en el sistema?',
        fecha_envio: new Date('2025-01-07T19:00:00')
      },
      {
        emisor_id: padreReactivo.id,
        contenido: 'Claro, adjunto el certificado médico. ¿Pedro debe realizar alguna tarea o actividad que haya perdido ayer?',
        fecha_envio: new Date('2025-01-08T20:30:00')
      },
      {
        emisor_id: docente.id,
        contenido: 'He recibido el certificado, gracias. Sí, ayer realizamos un ejercicio práctico importante. Le enviaré los detalles para que Pedro pueda ponerse al día. Tiene hasta el viernes para entregarlo.',
        fecha_envio: new Date('2025-01-09T08:45:00')
      }
    ];
  }
  
  // Registrar mensajes en la base de datos
  for (const mensaje of mensajes) {
    await prisma.mensaje.create({
      data: {
        conversacion_id: conversacion.id,
        emisor_id: mensaje.emisor_id,
        contenido: mensaje.contenido,
        fecha_envio: mensaje.fecha_envio,
        estado_lectura: 'leido',
        fecha_lectura: new Date(mensaje.fecha_envio.getTime() + 1000 * 60 * 30), // 30 minutos después
        tiene_adjuntos: false
      }
    });
    
    // Registrar acceso de lectura de mensaje
    const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678' } });
    const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321' } });
    const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344' } });
    
    const emisor_rol = mensaje.emisor_id === padreActivo.id || mensaje.emisor_id === padreReactivo.id ? 'apoderado' : 'docente';
    const receptor_id = mensaje.emisor_id === conversacion.padre_id ? conversacion.docente_id : conversacion.padre_id;
    const receptor_rol = receptor_id === padreActivo.id || receptor_id === padreReactivo.id ? 'apoderado' : 'docente';
    
    await registrarAcceso(
      receptor_id,
      receptor_rol,
      'mensajes',
      'leer_mensaje',
      conversacion.estudiante_id,
      new Date(mensaje.fecha_envio.getTime() + 1000 * 60 * 30) // 30 minutos después
    );
  }
  
  // Actualizar fecha del último mensaje
  if (mensajes.length > 0) {
    await prisma.conversacion.update({
      where: { id: conversacion.id },
      data: { fecha_ultimo_mensaje: mensajes[mensajes.length - 1].fecha_envio }
    });
  }
}

/**
 * Obtiene los estudiantes asociados a un padre
 */
async function obtenerEstudiantesPadre(apoderado_id) {
  const relaciones = await prisma.relacionesFamiliares.findMany({
    where: {
      apoderado_id: apoderado_id,
      estado_activo: true
    },
    include: {
      estudiante: true
    }
  });
  
  return relaciones.map(rel => rel.estudiante);
}

/**
 * Registra un evento de login en auth_logs
 */
async function registrarLogin(usuario_id, timestamp) {
  await prisma.$executeRaw`
    INSERT INTO auth_logs (usuario_id, tipo_evento, timestamp, detalles)
    VALUES (${usuario_id}, 'login_exitoso', ${timestamp}, '{"ip":"192.168.1.100","user_agent":"Mozilla/5.0"}'::jsonb)
  `;
  
  console.log(`Login registrado: ${usuario_id} - ${timestamp.toISOString()}`);
}

/**
 * Registra un evento de logout en auth_logs
 */
async function registrarLogout(usuario_id, timestamp) {
  await prisma.$executeRaw`
    INSERT INTO auth_logs (usuario_id, tipo_evento, timestamp, detalles)
    VALUES (${usuario_id}, 'logout', ${timestamp}, '{"ip":"192.168.1.100","user_agent":"Mozilla/5.0"}'::jsonb)
  `;
  
  console.log(`Logout registrado: ${usuario_id} - ${timestamp.toISOString()}`);
}

/**
 * Registra una consulta de calificaciones en access_logs
 */
async function registrarConsultaCalificaciones(usuario_id, rol, estudiante_id, timestamp) {
  await registrarAcceso(usuario_id, rol, 'calificaciones', 'consulta_detalle', estudiante_id, timestamp);
}

/**
 * Registra una consulta de asistencia en access_logs
 */
async function registrarConsultaAsistencia(usuario_id, rol, estudiante_id, timestamp) {
  await registrarAcceso(usuario_id, rol, 'asistencia', 'consulta_detalle', estudiante_id, timestamp);
}

/**
 * Registra un acceso genérico en access_logs
 */
async function registrarAcceso(usuario_id, rol, modulo, accion, estudiante_id, timestamp) {
  const duracion_ms = Math.floor(Math.random() * 5000) + 1000; // Entre 1 y 6 segundos
  
  await prisma.$executeRaw`
    INSERT INTO access_logs (
      usuario_id, rol, modulo, accion, estudiante_id, 
      timestamp, duracion_ms, detalles
    )
    VALUES (
      ${usuario_id}, ${rol}, ${modulo}, ${accion}, ${estudiante_id}, 
      ${timestamp}, ${duracion_ms}, '{"method":"GET","path":"/api/${modulo}"}'::jsonb
    )
  `;
  
  console.log(`Acceso registrado: ${usuario_id} - ${modulo}/${accion} - ${timestamp.toISOString()}`);
}

// Ejecutar el script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });