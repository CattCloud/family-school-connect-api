const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Inicialización del cliente Prisma
const prisma = new PrismaClient();

// Datos de prueba
const usuariosData = [
  {
    tipo_documento: 'DNI',
    nro_documento: '11111111',
    password: '123456789',
    rol: 'administrador',
    nombre: 'Admin Sistema',
    apellido: 'Orquídeas',
    telefono: '+51999999999',
    debe_cambiar_password: false
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '99999999',
    password: '123456789',
    rol: 'director',
    nombre: 'Director',
    apellido: 'Institución',
    telefono: '+51988888888',
    debe_cambiar_password: false
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '77777777',
    password: '123456789',
    rol: 'docente',
    nombre: 'Docente',
    apellido: 'Ejemplo',
    telefono: '+51977777777',
    debe_cambiar_password: false
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '88888888',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Padre',
    apellido: 'Ejemplo',
    telefono: '+51966666666',
    debe_cambiar_password: false
  }
];

const nivelGradoData = {
  nivel: 'Primaria',
  grado: '3',
  descripcion: '3ro de Primaria'
};

const cursosData = [
  {
    nombre: 'Matemáticas',
    codigo_curso: 'CP3001',
    año_academico: 2025
  },
  {
    nombre: 'Comunicación',
    codigo_curso: 'CP3002',
    año_academico: 2025
  },
  {
    nombre: 'Ciencias',
    codigo_curso: 'CP3003',
    año_academico: 2025
  }
];

const estudianteData = {
  codigo_estudiante: 'P3001',
  nombre: 'Estudiante',
  apellido: 'Ejemplo',
  año_academico: 2025,
  estado_matricula: 'activo'
};

const estructuraEvaluacionData = [
  {
    año_academico: 2025,
    nombre_item: 'Examen',
    peso_porcentual: 40.00,
    tipo_evaluacion: 'unica',
    orden_visualizacion: 1
  },
  {
    año_academico: 2025,
    nombre_item: 'Participación',
    peso_porcentual: 20.00,
    tipo_evaluacion: 'recurrente',
    orden_visualizacion: 2
  },
  {
    año_academico: 2025,
    nombre_item: 'Revisión de Cuaderno',
    peso_porcentual: 15.00,
    tipo_evaluacion: 'recurrente',
    orden_visualizacion: 3
  },
  {
    año_academico: 2025,
    nombre_item: 'Revisión de Libro',
    peso_porcentual: 15.00,
    tipo_evaluacion: 'recurrente',
    orden_visualizacion: 4
  },
  {
    año_academico: 2025,
    nombre_item: 'Comportamiento',
    peso_porcentual: 10.00,
    tipo_evaluacion: 'recurrente',
    orden_visualizacion: 5
  }
];

const asignacionDocenteCursoData = {
  año_academico: 2025,
  fecha_asignacion: new Date('2025-01-15')
};

const relacionFamiliarData = {
  tipo_relacion: 'padre',
  año_academico: 2025
};

// Función para generar fechas de asistencia para marzo 2025
function generarAsistenciaMarzo() {
  const asistencia = [];
  const año = 2025;
  const mes = 3; // Marzo
  
  // Días con asistencia especial
  const diasEspeciales = {
    2: { estado: 'tardanza', hora_llegada: '08:15' }, // 2 de marzo
    3: { estado: 'falta_injustificada' }, // 3 de marzo
    10: { estado: 'tardanza', hora_llegada: '08:20' } // 10 de marzo
  };
  
  // Generar registros para todos los días de marzo 2025
  for (let dia = 1; dia <= 31; dia++) {
    const fecha = new Date(año, mes - 1, dia);
    const fechaStr = `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    
    let estado = 'presente';
    let horaLlegada = null;
    
    // Verificar si es un día especial
    if (diasEspeciales[dia]) {
      estado = diasEspeciales[dia].estado;
      horaLlegada = diasEspeciales[dia].hora_llegada || null;
    }
    
    // Omitir fines de semana (sábado=6, domingo=0)
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      asistencia.push({
        fecha: fechaStr,
        estado,
        hora_llegada,
        año_academico: año
      });
    }
  }
  
  return asistencia;
}

// Función para generar calificaciones de ejemplo
function generarCalificaciones() {
  const calificaciones = [];
  const año = 2025;
  const trimestre = 1;
  
  // Calificaciones para Matemáticas
  // Examen
  calificaciones.push({
    fecha_evaluacion: new Date('2025-03-15'),
    calificacion_numerica: 16.5,
    estado: 'preliminar',
    trimestre,
    año_academico: año
  });
  
  // Participación (3 evaluaciones)
  const fechasParticipacion = [
    new Date('2025-03-05'),
    new Date('2025-03-12'),
    new Date('2025-03-19')
  ];
  const notasParticipacion = [14.0, 15.0, 14.8];
  
  fechasParticipacion.forEach((fecha, index) => {
    calificaciones.push({
      fecha_evaluacion: fecha,
      calificacion_numerica: notasParticipacion[index],
      estado: 'preliminar',
      trimestre,
      año_academico: año
    });
  });
  
  // Revisión de Cuaderno (2 evaluaciones)
  const fechasCuaderno = [
    new Date('2025-03-08'),
    new Date('2025-03-22')
  ];
  const notasCuaderno = [15.2, 15.0];
  
  fechasCuaderno.forEach((fecha, index) => {
    calificaciones.push({
      fecha_evaluacion: fecha,
      calificacion_numerica: notasCuaderno[index],
      estado: 'preliminar',
      trimestre,
      año_academico: año
    });
  });
  
  // Revisión de Libro (2 evaluaciones)
  const fechasLibro = [
    new Date('2025-03-10'),
    new Date('2025-03-17')
  ];
  const notasLibro = [14.0, 14.5];
  
  fechasLibro.forEach((fecha, index) => {
    calificaciones.push({
      fecha_evaluacion: fecha,
      calificacion_numerica: notasLibro[index],
      estado: 'preliminar',
      trimestre,
      año_academico: año
    });
  });
  
  // Comportamiento (4 evaluaciones)
  const fechasComportamiento = [
    new Date('2025-03-01'),
    new Date('2025-03-07'),
    new Date('2025-03-14'),
    new Date('2025-03-21')
  ];
  const notasComportamiento = [18.0, 17.5, 18.5, 18.0];
  
  fechasComportamiento.forEach((fecha, index) => {
    calificaciones.push({
      fecha_evaluacion: fecha,
      calificacion_numerica: notasComportamiento[index],
      estado: 'preliminar',
      trimestre,
      año_academico: año
    });
  });
  
  // Calificaciones para Comunicación
  // Examen
  calificaciones.push({
    fecha_evaluacion: new Date('2025-03-16'),
    calificacion_numerica: 15.2,
    estado: 'preliminar',
    trimestre,
    año_academico: año
  });
  
  // Participación (3 evaluaciones)
  const fechasParticipacionCom = [
    new Date('2025-03-06'),
    new Date('2025-03-13'),
    new Date('2025-03-20')
  ];
  const notasParticipacionCom = [15.5, 14.8, 15.2];
  
  fechasParticipacionCom.forEach((fecha, index) => {
    calificaciones.push({
      fecha_evaluacion: fecha,
      calificacion_numerica: notasParticipacionCom[index],
      estado: 'preliminar',
      trimestre,
      año_academico: año
    });
  });
  
  return calificaciones;
}

// Función principal para poblar la base de datos
async function main() {
  console.log('🌱 Iniciando siembra de datos de prueba...');
  
  try {
    // 1. Crear usuarios
    console.log('👤 Creando usuarios...');
    const usuariosCreados = [];
    
    for (const usuarioData of usuariosData) {
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
            debe_cambiar_password: usuarioData.debe_cambiar_password
          }
        });
        
        usuariosCreados.push(usuario);
        console.log(`✅ Usuario creado: ${usuario.nombre} (${usuario.rol})`);
      } else {
        usuariosCreados.push(usuarioExistente);
        console.log(`ℹ️ Usuario ya existe: ${usuarioExistente.nombre} (${usuarioExistente.rol})`);
      }
    }
    
    // 2. Crear nivel-grado
    console.log('📚 Creando nivel-grado...');
    let nivelGrado = await prisma.nivelGrado.findFirst({
      where: {
        AND: [
          { nivel: nivelGradoData.nivel },
          { grado: nivelGradoData.grado }
        ]
      }
    });
    
    if (!nivelGrado) {
      nivelGrado = await prisma.nivelGrado.create({
        data: nivelGradoData
      });
      console.log(`✅ Nivel-Grado creado: ${nivelGrado.nivel} ${nivelGrado.grado}`);
    } else {
      console.log(`ℹ️ Nivel-Grado ya existe: ${nivelGrado.nivel} ${nivelGrado.grado}`);
    }
    
    // 3. Crear cursos
    console.log('📖 Creando cursos...');
    const cursosCreados = [];
    
    for (const cursoData of cursosData) {
      // Verificar si el curso ya existe
      const cursoExistente = await prisma.curso.findUnique({
        where: { codigo_curso: cursoData.codigo_curso }
      });
      
      if (!cursoExistente) {
        const curso = await prisma.curso.create({
          data: {
            ...cursoData,
            nivel_grado_id: nivelGrado.id
          }
        });
        
        cursosCreados.push(curso);
        console.log(`✅ Curso creado: ${curso.nombre}`);
      } else {
        cursosCreados.push(cursoExistente);
        console.log(`ℹ️ Curso ya existe: ${cursoExistente.nombre}`);
      }
    }
    
    // 4. Crear estudiante
    console.log('👨‍🎓 Creando estudiante...');
    let estudiante = await prisma.estudiante.findUnique({
      where: { codigo_estudiante: estudianteData.codigo_estudiante }
    });
    
    if (!estudiante) {
      estudiante = await prisma.estudiante.create({
        data: {
          ...estudianteData,
          nivel_grado_id: nivelGrado.id
        }
      });
      console.log(`✅ Estudiante creado: ${estudiante.nombre} ${estudiante.apellido}`);
    } else {
      console.log(`ℹ️ Estudiante ya existe: ${estudiante.nombre} ${estudiante.apellido}`);
    }
    
    // 5. Crear estructura de evaluación
    console.log('📊 Creando estructura de evaluación...');
    const estructuraEvaluacionCreada = [];
    
    for (const estructuraData of estructuraEvaluacionData) {
      // Verificar si ya existe
      const estructuraExistente = await prisma.estructuraEvaluacion.findFirst({
        where: {
          AND: [
            { año_academico: estructuraData.año_academico },
            { nombre_item: estructuraData.nombre_item }
          ]
        }
      });
      
      if (!estructuraExistente) {
        const estructura = await prisma.estructuraEvaluacion.create({
          data: estructuraData
        });
        
        estructuraEvaluacionCreada.push(estructura);
        console.log(`✅ Estructura de evaluación creada: ${estructura.nombre_item}`);
      } else {
        estructuraEvaluacionCreada.push(estructuraExistente);
        console.log(`ℹ️ Estructura de evaluación ya existe: ${estructuraExistente.nombre_item}`);
      }
    }
    
    // 6. Crear relación familiar
    console.log('👨‍👩‍👧‍👦 Creando relación familiar...');
    const padre = usuariosCreados.find(u => u.nro_documento === '88888888');
    
    if (padre && estudiante) {
      const relacionExistente = await prisma.relacionesFamiliares.findFirst({
        where: {
          AND: [
            { apoderado_id: padre.id },
            { estudiante_id: estudiante.id },
            { año_academico: 2025 }
          ]
        }
      });
      
      if (!relacionExistente) {
        const relacion = await prisma.relacionesFamiliares.create({
          data: {
            ...relacionFamiliarData,
            apoderado_id: padre.id,
            estudiante_id: estudiante.id
          }
        });
        console.log(`✅ Relación familiar creada: ${padre.nombre} -> ${estudiante.nombre}`);
      } else {
        console.log(`ℹ️ Relación familiar ya existe: ${padre.nombre} -> ${estudiante.nombre}`);
      }
    }
    
    // 7. Crear asignación docente-curso
    console.log('👨‍🏫 Creando asignación docente-curso...');
    const docente = usuariosCreados.find(u => u.nro_documento === '77777777');
    const cursoMatematicas = cursosCreados.find(c => c.codigo_curso === 'CP3001');
    
    if (docente && cursoMatematicas && nivelGrado) {
      const asignacionExistente = await prisma.asignacionDocenteCurso.findFirst({
        where: {
          AND: [
            { docente_id: docente.id },
            { curso_id: cursoMatematicas.id },
            { nivel_grado_id: nivelGrado.id },
            { año_academico: 2025 }
          ]
        }
      });
      
      if (!asignacionExistente) {
        const asignacion = await prisma.asignacionDocenteCurso.create({
          data: {
            ...asignacionDocenteCursoData,
            docente_id: docente.id,
            curso_id: cursoMatematicas.id,
            nivel_grado_id: nivelGrado.id
          }
        });
        console.log(`✅ Asignación docente-curso creada: ${docente.nombre} -> ${cursoMatematicas.nombre}`);
      } else {
        console.log(`ℹ️ Asignación docente-curso ya existe: ${docente.nombre} -> ${cursoMatematicas.nombre}`);
      }
    }
    
    // 8. Crear calificaciones de evaluación
    console.log('📝 Creando calificaciones de evaluación...');
    const calificaciones = generarCalificaciones();
    let calificacionesCreadas = 0;
    
    for (const calificacion of calificaciones) {
      // Asignar a cursos específicos según el tipo de evaluación
      let cursoId;
      if (calificacion.fecha_evaluacion <= new Date('2025-03-16')) {
        cursoId = cursosCreados.find(c => c.codigo_curso === 'CP3001')?.id; // Matemáticas
      } else {
        cursoId = cursosCreados.find(c => c.codigo_curso === 'CP3002')?.id; // Comunicación
      }
      
      if (cursoId && estudiante) {
        // Determinar el componente de evaluación según el tipo
        let componenteId;
        if (calificacion.fecha_evaluacion.getDay() === 6 || // Sábado (exámenes)
            (calificacion.fecha_evaluacion.getDate() === 15 && calificacion.fecha_evaluacion.getMonth() === 2) || // 15 de marzo
            (calificacion.fecha_evaluacion.getDate() === 16 && calificacion.fecha_evaluacion.getMonth() === 2)) { // 16 de marzo
          componenteId = estructuraEvaluacionCreada.find(e => e.nombre_item === 'Examen')?.id;
        } else if (calificacion.fecha_evaluacion.getDate() % 7 === 5 || calificacion.fecha_evaluacion.getDate() % 7 === 6) {
          componenteId = estructuraEvaluacionCreada.find(e => e.nombre_item === 'Participación')?.id;
        } else if (calificacion.fecha_evaluacion.getDate() % 7 === 1 || calificacion.fecha_evaluacion.getDate() % 7 === 2) {
          componenteId = estructuraEvaluacionCreada.find(e => e.nombre_item === 'Revisión de Cuaderno')?.id;
        } else if (calificacion.fecha_evaluacion.getDate() % 7 === 3 || calificacion.fecha_evaluacion.getDate() % 7 === 4) {
          componenteId = estructuraEvaluacionCreada.find(e => e.nombre_item === 'Revisión de Libro')?.id;
        } else {
          componenteId = estructuraEvaluacionCreada.find(e => e.nombre_item === 'Comportamiento')?.id;
        }
        
        if (componenteId) {
          const calificacionNumerica = calificacion.calificacion_numerica;
          const calificacionLetra = calificacionNumerica >= 14 ? 'A' : calificacionNumerica >= 11 ? 'B' : 'C';
          
          await prisma.evaluacion.create({
            data: {
              estudiante_id: estudiante.id,
              curso_id: cursoId,
              estructura_evaluacion_id: componenteId,
              trimestre: calificacion.trimestre,
              año_academico: calificacion.año_academico,
              fecha_evaluacion: calificacion.fecha_evaluacion,
              calificacion_numerica: calificacionNumerica,
              calificacion_letra: calificacionLetra,
              estado: calificacion.estado,
              registrado_por: docente.id
            }
          });
          calificacionesCreadas++;
        }
      }
    }
    console.log(`✅ Calificaciones creadas: ${calificacionesCreadas}`);
    
    // 9. Crear registros de asistencia
    console.log('📅 Creando registros de asistencia...');
    const asistencias = generarAsistenciaMarzo();
    let asistenciasCreadas = 0;
    
    for (const asistencia of asistencias) {
      if (estudiante && cursosCreados.length > 0) {
        // Usar el primer curso para todas las asistencias
        const cursoId = cursosCreados[0].id;
        
        let tipoAsistencia;
        switch (asistencia.estado) {
          case 'presente':
            tipoAsistencia = 'asistencia';
            break;
          case 'tardanza':
            tipoAsistencia = 'tardanza';
            break;
          case 'falta_injustificada':
            tipoAsistencia = 'falta';
            break;
          default:
            tipoAsistencia = 'asistencia';
        }
        
        await prisma.asistencia.create({
          data: {
            estudiante_id: estudiante.id,
            curso_id: cursoId,
            fecha: new Date(asistencia.fecha),
            tipo_asistencia: tipoAsistencia,
            observaciones: asistencia.hora_llegada ? `Llegada: ${asistencia.hora_llegada}` : null,
            registrado_por: docente.id
          }
        });
        asistenciasCreadas++;
      }
    }
    console.log(`✅ Asistencias creadas: ${asistenciasCreadas}`);
    
    console.log('🎉 Siembra de datos de prueba completada con éxito!');
    console.log('\n📋 Resumen de datos creados:');
    console.log(`- Usuarios: ${usuariosCreados.length}`);
    console.log(`- Nivel-Grado: ${nivelGrado ? 1 : 0}`);
    console.log(`- Cursos: ${cursosCreados.length}`);
    console.log(`- Estudiante: ${estudiante ? 1 : 0}`);
    console.log(`- Estructura de Evaluación: ${estructuraEvaluacionCreada.length}`);
    console.log(`- Relaciones Familiares: 1`);
    console.log(`- Asignaciones Docente-Curso: 1`);
    console.log(`- Calificaciones: ${calificacionesCreadas}`);
    console.log(`- Asistencias: ${asistenciasCreadas}`);
    
  } catch (error) {
    console.error('❌ Error durante la siembra de datos:', error);
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