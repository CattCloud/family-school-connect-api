const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Inicialización del cliente Prisma
const prisma = new PrismaClient();

// Función para generar fechas aleatorias en un rango
function fechaAleatoria(inicio, fin) {
  // Validar que inicio y fin no sean undefined
  if (!inicio || !fin) {
    return new Date();
  }
  return new Date(inicio.getTime() + Math.random() * (fin.getTime() - inicio.getTime()));
}

// Función para generar fechas de publicación variadas
function generarFechasPublicacion() {
  const ahora = new Date();
  const hace90Dias = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
  const en15Dias = new Date(ahora.getTime() + 15 * 24 * 60 * 60 * 1000);
  
  return {
    pasado: fechaAleatoria(hace90Dias, ahora),
    futuro: fechaAleatoria(ahora, en15Dias),
    hoy: ahora
  };
}

// Función para generar contenido HTML variado
function generarContenidoHTML(tema, longitud = 'media') {
  const contenidos = {
    academico: [
      '<p>Estimados padres de familia:</p><p>Les informamos que las <strong>evaluaciones del segundo trimestre</strong> se realizarán según el calendario adjunto. Es importante que los estudiantes repasen los temas vistos en clase.</p><p>Para cualquier consulta, pueden comunicarse con el docente del área.</p>',
      '<p>Señores padres:</p><p>A partir de la próxima semana, iniciaremos con el <strong>refuerzo académico</strong> para los estudiantes que requieren apoyo adicional. Las sesiones se realizarán los días martes y jueves de 3:00 p.m. a 4:30 p.m.</p><p>La participación es voluntaria pero recomendada.</p>',
      '<p>Estimada comunidad educativa:</p><p>Les recordamos que el <strong>plazo para la entrega de trabajos</strong> es el próximo viernes. Los trabajos deben ser presentados en formato digital e impreso.</p><p>Los criterios de evaluación están disponibles en el aula virtual.</p>'
    ],
    administrativo: [
      '<p>Estimados padres de familia:</p><p>Les informamos que el <strong>horario de atención administrativa</strong> ha sido modificado. A partir del próximo lunes, la oficina estará abierta de 8:00 a.m. a 1:00 p.m. y de 2:00 p.m. a 4:00 p.m.</p><p>Les agradecemos su comprensión.</p>',
      '<p>Señores padres:</p><p>Les recordamos que el <strong>pago de pensiones</strong> debe realizarse dentro de los primeros 5 días de cada mes. Para facilitar el proceso, hemos habilitado nuevos canales de pago en línea.</p><p>Para más información, pueden acercarse a la oficina de tesorería.</p>',
      '<p>Estimada comunidad educativa:</p><p>Les informamos que durante la próxima semana se realizarán <strong>trabajos de mantenimiento</strong> en las instalaciones educativas. Algunas áreas podrían estar temporalmente fuera de servicio.</p><p>Les pedimos disculpas por las molestias.</p>'
    ],
    evento: [
      '<p>Estimados padres de familia:</p><p>Tenemos el agrado de invitarlos a nuestro <strong>Día de la Familia</strong> que se realizará el próximo sábado 15 de octubre a partir de las 9:00 a.m.</p><p>Habrá actividades recreativas, exposiciones y un almuerzo compartido.</p><p>¡Esperamos contar con su presencia!</p>',
      '<p>Señores padres:</p><p>Les informamos que el próximo viernes 21 de octubre se llevará a cabo nuestra <strong>Feria de Ciencias</strong>. Los estudiantes expondrán sus proyectos investigativos.</p><p>La comunidad educativa está cordialmente invitada.</p>',
      '<p>Estimada comunidad educativa:</p><p>Les invitamos a la <strong>Ceremonia de Clausura</strong> del trimestre académico, que se realizará el viernes 28 de octubre a las 10:00 a.m. en el auditorio principal.</p><p>Se hará entrega de reconocimientos a los estudiantes destacados.</p>'
    ],
    urgente: [
      '<p><strong>COMUNICADO URGENTE</strong></p><p>Estimados padres de familia:</p><p>Debido a condiciones climáticas adversas, <strong>las clases serán suspendidas</strong> el día de hoy.</p><p>Las actividades se reanudarán mañana según el horario regular.</p><p>Les pedidos mantenerse atentos a cualquier actualización.</p>',
      '<p><strong>AVISO IMPORTANTE</strong></p><p>Señores padres:</p><p>Les informamos que el servicio de transporte escolar ha sufrido un retraso debido a problemas mecánicos en una de las unidades.</p><p>Los estudiantes llegarán aproximadamente 30 minutos después del horario habitual.</p><p>Les pedimos disculpas por las molestias.</p>',
      '<p><strong>COMUNICACIÓN DE EMERGENCIA</strong></p><p>Estimada comunidad educativa:</p><p>Por motivos de seguridad, <strong>la salida de los estudiantes será adelantada</strong> hoy a las 12:00 p.m.</p><p>Les solicitamos pasar por sus hijos a la brevedad posible.</p><p>Les agradecemos su cooperación.</p>'
    ],
    informativo: [
      '<p>Estimados padres de familia:</p><p>Les compartimos el <strong>calendario académico</strong> para el próximo trimestre. Las fechas importantes han sido resaltadas para su referencia.</p><p>Recomendamos guardar este documento para consulta futura.</p>',
      '<p>Señores padres:</p><p>Les informamos sobre las <strong>nuevas políticas de uso del uniforme</strong>. A partir del próximo mes, se implementará un control más estricto del cumplimiento del reglamento.</p><p>Para cualquier consulta, pueden dirigirse a la oficina de coordinación.</p>',
      '<p>Estimada comunidad educativa:</p><p>Les presentamos nuestro <strong>nuevo programa de actividades extracurriculares</strong>. Contamos con opciones deportivas, artísticas y académicas para todos los niveles.</p><p>Las inscripciones están abiertas hasta el próximo viernes.</p>'
    ]
  };
  
  const opciones = contenidos[tema] || contenidos.informativo;
  const contenido = opciones[Math.floor(Math.random() * opciones.length)];
  
  // Ajustar longitud según el parámetro
  if (longitud === 'corta') {
    return contenido.split('</p>')[0] + '</p>';
  } else if (longitud === 'larga') {
    return contenido + '<p>Información adicional: Este comunicado forma parte de nuestra política de transparencia y comunicación constante con la comunidad educativa. Agradecemos su atención y cooperación.</p>';
  }
  
  return contenido;
}

// Función para generar títulos variados
function generarTitulo(tipo) {
  const titulos = {
    academico: [
      'Evaluaciones del segundo trimestre',
      'Refuerzo académico para estudiantes',
      'Entrega de trabajos finales',
      'Actualización del calendario de exámenes',
      'Sesión de tutorías personalizadas'
    ],
    administrativo: [
      'Modificación del horario administrativo',
      'Recordatorio de pago de pensiones',
      'Trabajos de mantenimiento en instalaciones',
      'Actualización de datos de contacto',
      'Proceso de matrícula 2026'
    ],
    evento: [
      'Invitación al Día de la Familia',
      'Feria de Ciencias 2025',
      'Ceremonia de Clausura del trimestre',
      'Festival deportivo interaulas',
      'Exposición de proyectos estudiantiles'
    ],
    urgente: [
      'Suspensión de clases por condiciones climáticas',
      'Retraso en el servicio de transporte escolar',
      'Salida adelantada por medidas de seguridad',
      'Cierre temporal de instalaciones',
      'Cambio de horario de última hora'
    ],
    informativo: [
      'Calendario académico del próximo trimestre',
      'Nuevas políticas de uso del uniforme',
      'Programa de actividades extracurriculares',
      'Actualización del reglamento interno',
      'Resultados de la encuesta de satisfacción'
    ]
  };
  
  const opciones = titulos[tipo] || titulos.informativo;
  return opciones[Math.floor(Math.random() * opciones.length)];
}

// Función principal para poblar la base de datos con comunicados
async function main() {
  console.log('🌱 Iniciando siembra de comunicados...');
  
  try {
    // 1. Obtener usuarios existentes
    console.log('👥 Obteniendo usuarios existentes...');
    const usuarios = await prisma.usuario.findMany({
      where: { estado_activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        rol: true
      }
    });
    
    if (usuarios.length === 0) {
      console.error('❌ No se encontraron usuarios en la base de datos. Ejecute primero el script de seed principal.');
      return;
    }
    
    // Separar usuarios por rol
    const directores = usuarios.filter(u => u.rol === 'director');
    const docentes = usuarios.filter(u => u.rol === 'docente');
    const padres = usuarios.filter(u => u.rol === 'apoderado');
    
    console.log(`✅ Usuarios encontrados: ${directores.length} directores, ${docentes.length} docentes, ${padres.length} padres`);
    
    // 2. Obtener niveles, grados y cursos existentes
    console.log('📚 Obteniendo estructura académica...');
    const nivelesGrados = await prisma.nivelGrado.findMany({
      where: { estado_activo: true },
      include: {
        cursos: {
          where: { estado_activo: true }
        }
      }
    });
    
    if (nivelesGrados.length === 0) {
      console.error('❌ No se encontraron niveles y grados en la base de datos. Ejecute primero el script de seed principal.');
      return;
    }
    
    // Extraer niveles, grados y cursos únicos
    const niveles = [...new Set(nivelesGrados.map(ng => ng.nivel))];
    const grados = [...new Set(nivelesGrados.map(ng => ng.grado))];
    const cursos = nivelesGrados.flatMap(ng => ng.cursos).map(c => c.nombre);
    
    console.log(`✅ Estructura académica: ${niveles.length} niveles, ${grados.length} grados, ${cursos.length} cursos`);
    
    // 3. Generar comunicados
    console.log('📝 Generando comunicados...');
    const fechas = generarFechasPublicacion();
    const estados = ['borrador', 'publicado', 'programado', 'archivado', 'cancelado'];
    const tipos = ['academico', 'administrativo', 'evento', 'urgente', 'informativo'];
    const prioridades = ['baja', 'normal', 'alta'];
    const publicosObjetivo = ['padres', 'docentes', 'todos'];
    
    const comunicados = [];
    const totalComunicados = 25; // Generar entre 20-30 comunicados
    
    for (let i = 0; i < totalComunicados; i++) {
      // Determinar tipo y estado
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const estado = Math.random() > 0.7 ? 'publicado' : estados[Math.floor(Math.random() * estados.length)];
      
      // Seleccionar autor (70% directores, 30% docentes)
      const esDirector = Math.random() > 0.3;
      const autoresPosibles = esDirector ? directores : docentes;
      const autor = autoresPosibles[Math.floor(Math.random() * autoresPosibles.length)];
      
      if (!autor) continue; // Saltar si no hay autores disponibles
      
      // Generar fecha de publicación según estado
      let fechaPublicacion, fechaProgramada;
      if (estado === 'programado') {
        fechaProgramada = fechaAleatoria(fechas.hoy, fechas.futuro);
      } else if (estado === 'publicado') {
        fechaPublicacion = fechaAleatoria(fechas.pasado, fechas.hoy);
      }
      
      // Determinar público objetivo
      let publicoObjetivoSeleccionado;
      if (Math.random() > 0.7) {
        publicoObjetivoSeleccionado = ['todos'];
      } else {
        const numPublicos = Math.floor(Math.random() * 2) + 1; // 1-2 públicos
        const publicosSeleccionados = [];
        
        for (let j = 0; j < numPublicos; j++) {
          const publico = publicosObjetivo[Math.floor(Math.random() * publicosObjetivo.length)];
          if (!publicosSeleccionados.includes(publico) && publico !== 'todos') {
            publicosSeleccionados.push(publico);
          }
        }
        
        publicoObjetivoSeleccionado = publicosSeleccionados;
      }
      
      // Determinar segmentación (niveles, grados, cursos)
      let nivelesSeleccionados = [];
      let gradosSeleccionados = [];
      let cursosSeleccionados = [];
      
      if (!publicoObjetivoSeleccionado.includes('todos') && Math.random() > 0.3) {
        // Seleccionar niveles (30% de probabilidad)
        if (Math.random() > 0.7) {
          const numNiveles = Math.floor(Math.random() * Math.min(3, niveles.length)) + 1;
          for (let j = 0; j < numNiveles; j++) {
            const nivel = niveles[Math.floor(Math.random() * niveles.length)];
            if (!nivelesSeleccionados.includes(nivel)) {
              nivelesSeleccionados.push(nivel);
            }
          }
        }
        
        // Seleccionar grados (50% de probabilidad)
        if (Math.random() > 0.5) {
          const numGrados = Math.floor(Math.random() * Math.min(4, grados.length)) + 1;
          for (let j = 0; j < numGrados; j++) {
            const grado = grados[Math.floor(Math.random() * grados.length)];
            if (!gradosSeleccionados.includes(grado)) {
              gradosSeleccionados.push(grado);
            }
          }
        }
        
        // Seleccionar cursos (20% de probabilidad)
        if (Math.random() > 0.8) {
          const numCursos = Math.floor(Math.random() * Math.min(3, cursos.length)) + 1;
          for (let j = 0; j < numCursos; j++) {
            const curso = cursos[Math.floor(Math.random() * cursos.length)];
            if (!cursosSeleccionados.includes(curso)) {
              cursosSeleccionados.push(curso);
            }
          }
        }
      }
      
      // Generar vigencia (desde-hasta) para algunos comunicados
      let fechaVigenciaDesde, fechaVigenciaHasta;
      if (Math.random() > 0.7) {
        fechaVigenciaDesde = fechaAleatoria(fechas.pasado, fechas.hoy);
        fechaVigenciaHasta = fechaAleatoria(fechaVigenciaDesde, fechas.futuro);
      }
      
      // Determinar si requiere confirmación
      const requiereConfirmacion = Math.random() > 0.8;
      
      // Generar longitud del contenido
      const longitudes = ['corta', 'media', 'larga'];
      const longitud = longitudes[Math.floor(Math.random() * longitudes.length)];
      
      // Crear comunicado
      const comunicado = {
        titulo: generarTitulo(tipo),
        contenido: generarContenidoHTML(tipo, longitud),
        tipo,
        estado,
        autor_id: autor.id,
        publico_objetivo: publicoObjetivoSeleccionado,
        niveles_objetivo: nivelesSeleccionados,
        grados_objetivo: gradosSeleccionados,
        cursos_objetivo: cursosSeleccionados,
        fecha_creacion: fechaPublicacion || new Date(),
        fecha_publicacion: fechaPublicacion,
        fecha_programada: fechaProgramada,
        fecha_vigencia_desde: fechaVigenciaDesde,
        fecha_vigencia_hasta: fechaVigenciaHasta,
        requiere_confirmacion: requiereConfirmacion,
        prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
        editado: Math.random() > 0.8,
        año_academico: 2025
      };
      
      comunicados.push(comunicado);
    }
    
    console.log(`✅ Se generaron ${comunicados.length} comunicados`);
    
    // 4. Insertar comunicados en la base de datos
    console.log('💾 Insertando comunicados en la base de datos...');
    
    for (const comunicado of comunicados) {
      await prisma.comunicado.create({
        data: comunicado
      });
    }
    
    console.log(`✅ Se insertaron ${comunicados.length} comunicados en la base de datos`);
    
    // 5. Generar algunas lecturas de comunicados
    console.log('📖 Generando lecturas de comunicados...');
    
    // Obtener comunicados publicados
    const comunicadosPublicados = await prisma.comunicado.findMany({
      where: { estado: 'publicado' },
      select: { id: true }
    });
    
    if (comunicadosPublicados.length > 0) {
      // Generar lecturas aleatorias (aproximadamente 60% de los comunicados son leídos por los padres)
      for (const comunicado of comunicadosPublicados) {
        if (Math.random() > 0.4) {
          // Seleccionar padres aleatorios que lean este comunicado
          const numLecturas = Math.floor(Math.random() * Math.min(3, padres.length)) + 1;
          const padresSeleccionados = [];
          
          for (let i = 0; i < numLecturas; i++) {
            const padre = padres[Math.floor(Math.random() * padres.length)];
            if (!padresSeleccionados.includes(padre)) {
              padresSeleccionados.push(padre);
            }
          }
          
          // Crear registros de lectura
          for (const padre of padresSeleccionados) {
            await prisma.comunicadoLectura.create({
              data: {
                comunicado_id: comunicado.id,
                usuario_id: padre.id,
                fecha_lectura: fechaAleatoria(
                  comunicado.fecha_creacion,
                  new Date()
                )
              }
            });
          }
        }
      }
      
      console.log('✅ Se generaron lecturas de comunicados');
    }
    
    console.log('🎉 Siembra de comunicados completada con éxito!');
    
  } catch (error) {
    console.error('❌ Error durante la siembra de comunicados:', error);
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