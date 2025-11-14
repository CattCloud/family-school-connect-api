const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Inicialización del cliente Prisma
const prisma = new PrismaClient();

// Datos de usuarios
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
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '12345678',
    password: '123456789',
    rol: 'docente',
    nombre: 'Maria',
    apellido: 'Rodriguez',
    telefono: '+51955555555',
    debe_cambiar_password: false
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '87654321',
    password: '123456789',
    rol: 'apoderado',
    nombre: 'Carlos',
    apellido: 'Perez',
    telefono: '+51944444444',
    debe_cambiar_password: false
  },
  {
    tipo_documento: 'DNI',
    nro_documento: '11223344',
    password: '123456789',
    rol: 'docente',
    nombre: 'Luis',
    apellido: 'Gonzalez',
    telefono: '+51933333333',
    debe_cambiar_password: false
  }
];

// Datos de niveles y grados
const nivelesGradosData = [
  {
    nivel: 'Inicial',
    grado: '4 años',
    descripcion: '4 años de Inicial'
  },
  {
    nivel: 'Inicial',
    grado: '5 años',
    descripcion: '5 años de Inicial'
  },
  {
    nivel: 'Primaria',
    grado: '1ro',
    descripcion: '1ro de Primaria'
  },
  {
    nivel: 'Primaria',
    grado: '2do',
    descripcion: '2do de Primaria'
  },
  {
    nivel: 'Primaria',
    grado: '3ro',
    descripcion: '3ro de Primaria'
  },
  {
    nivel: 'Primaria',
    grado: '4to',
    descripcion: '4to de Primaria'
  },
  {
    nivel: 'Primaria',
    grado: '5to',
    descripcion: '5to de Primaria'
  },
  {
    nivel: 'Primaria',
    grado: '6to',
    descripcion: '6to de Primaria'
  },
  {
    nivel: 'Secundaria',
    grado: '1ro',
    descripcion: '1ro de Secundaria'
  },
  {
    nivel: 'Secundaria',
    grado: '2do',
    descripcion: '2do de Secundaria'
  },
  {
    nivel: 'Secundaria',
    grado: '3ro',
    descripcion: '3ro de Secundaria'
  },
  {
    nivel: 'Secundaria',
    grado: '4to',
    descripcion: '4to de Secundaria'
  },
  {
    nivel: 'Secundaria',
    grado: '5to',
    descripcion: '5to de Secundaria'
  }
];

// Datos de cursos por nivel y grado
const cursosData = [
  // Inicial
  { nombre: 'Matemáticas Inicial', codigo_curso: 'CI4001', nivel: 'Inicial', grado: '4 años' },
  { nombre: 'Matemáticas Inicial', codigo_curso: 'CI5001', nivel: 'Inicial', grado: '5 años' },
  
  // Primaria
  { nombre: 'Matemáticas', codigo_curso: 'CP1001', nivel: 'Primaria', grado: '1ro' },
  { nombre: 'Comunicación', codigo_curso: 'CP1002', nivel: 'Primaria', grado: '1ro' },
  { nombre: 'Ciencias', codigo_curso: 'CP1003', nivel: 'Primaria', grado: '1ro' },
  { nombre: 'Matemáticas', codigo_curso: 'CP2001', nivel: 'Primaria', grado: '2do' },
  { nombre: 'Comunicación', codigo_curso: 'CP2002', nivel: 'Primaria', grado: '2do' },
  { nombre: 'Ciencias', codigo_curso: 'CP2003', nivel: 'Primaria', grado: '2do' },
  { nombre: 'Matemáticas', codigo_curso: 'CP3001', nivel: 'Primaria', grado: '3ro' },
  { nombre: 'Comunicación', codigo_curso: 'CP3002', nivel: 'Primaria', grado: '3ro' },
  { nombre: 'Ciencias', codigo_curso: 'CP3003', nivel: 'Primaria', grado: '3ro' },
  { nombre: 'Matemáticas', codigo_curso: 'CP4001', nivel: 'Primaria', grado: '4to' },
  { nombre: 'Comunicación', codigo_curso: 'CP4002', nivel: 'Primaria', grado: '4to' },
  { nombre: 'Ciencias', codigo_curso: 'CP4003', nivel: 'Primaria', grado: '4to' },
  { nombre: 'Matemáticas', codigo_curso: 'CP5001', nivel: 'Primaria', grado: '5to' },
  { nombre: 'Comunicación', codigo_curso: 'CP5002', nivel: 'Primaria', grado: '5to' },
  { nombre: 'Ciencias', codigo_curso: 'CP5003', nivel: 'Primaria', grado: '5to' },
  { nombre: 'Matemáticas', codigo_curso: 'CP6001', nivel: 'Primaria', grado: '6to' },
  { nombre: 'Comunicación', codigo_curso: 'CP6002', nivel: 'Primaria', grado: '6to' },
  { nombre: 'Ciencias', codigo_curso: 'CP6003', nivel: 'Primaria', grado: '6to' },
  
  // Secundaria
  { nombre: 'Matemáticas', codigo_curso: 'CS1001', nivel: 'Secundaria', grado: '1ro' },
  { nombre: 'Comunicación', codigo_curso: 'CS1002', nivel: 'Secundaria', grado: '1ro' },
  { nombre: 'Ciencias', codigo_curso: 'CS1003', nivel: 'Secundaria', grado: '1ro' },
  { nombre: 'Matemáticas', codigo_curso: 'CS2001', nivel: 'Secundaria', grado: '2do' },
  { nombre: 'Comunicación', codigo_curso: 'CS2002', nivel: 'Secundaria', grado: '2do' },
  { nombre: 'Ciencias', codigo_curso: 'CS2003', nivel: 'Secundaria', grado: '2do' },
  { nombre: 'Matemáticas', codigo_curso: 'CS3001', nivel: 'Secundaria', grado: '3ro' },
  { nombre: 'Comunicación', codigo_curso: 'CS3002', nivel: 'Secundaria', grado: '3ro' },
  { nombre: 'Ciencias', codigo_curso: 'CS3003', nivel: 'Secundaria', grado: '3ro' },
  { nombre: 'Matemáticas', codigo_curso: 'CS4001', nivel: 'Secundaria', grado: '4to' },
  { nombre: 'Comunicación', codigo_curso: 'CS4002', nivel: 'Secundaria', grado: '4to' },
  { nombre: 'Ciencias', codigo_curso: 'CS4003', nivel: 'Secundaria', grado: '4to' },
  { nombre: 'Matemáticas', codigo_curso: 'CS5001', nivel: 'Secundaria', grado: '5to' },
  { nombre: 'Comunicación', codigo_curso: 'CS5002', nivel: 'Secundaria', grado: '5to' },
  { nombre: 'Ciencias', codigo_curso: 'CS5003', nivel: 'Secundaria', grado: '5to' }
];

// Datos de estudiantes
const estudiantesData = [
  { codigo_estudiante: 'P3001', nombre: 'Ana', apellido: 'Rodriguez', nivel: 'Primaria', grado: '3ro' },
  { codigo_estudiante: 'P3002', nombre: 'Luis', apellido: 'Gomez', nivel: 'Primaria', grado: '3ro' },
  { codigo_estudiante: 'P4001', nombre: 'Maria', apellido: 'Martinez', nivel: 'Primaria', grado: '4to' },
  { codigo_estudiante: 'P4002', nombre: 'Carlos', apellido: 'Lopez', nivel: 'Primaria', grado: '4to' },
  { codigo_estudiante: 'S1001', nombre: 'Pedro', apellido: 'Sanchez', nivel: 'Secundaria', grado: '1ro' },
  { codigo_estudiante: 'S1002', nombre: 'Laura', apellido: 'Torres', nivel: 'Secundaria', grado: '1ro' },
  { codigo_estudiante: 'S2001', nombre: 'Diego', apellido: 'Ramirez', nivel: 'Secundaria', grado: '2do' }
];

// Datos de permisos de docentes
const permisosDocentesData = [
  {
    tipo_permiso: 'comunicados',
    estado_activo: true,
    año_academico: 2025
  },
  {
    tipo_permiso: 'encuestas',
    estado_activo: true,
    año_academico: 2025
  }
];

// Datos de asignaciones docente-curso
const asignacionesDocenteCursoData = [
  { docente_documento: '77777777', curso_codigo: 'CP3001' }, // Docente -> Matemáticas 3ro
  { docente_documento: '77777777', curso_codigo: 'CP3002' }, // Docente -> Comunicación 3ro
  { docente_documento: '12345678', curso_codigo: 'CP4001' }, // Maria -> Matemáticas 4to
  { docente_documento: '12345678', curso_codigo: 'CP4002' }, // Maria -> Comunicación 4to
  { docente_documento: '11223344', curso_codigo: 'CS1001' }, // Luis -> Matemáticas 1ro Secundaria
  { docente_documento: '11223344', curso_codigo: 'CS1002' }  // Luis -> Comunicación 1ro Secundaria
];

// Datos de relaciones familiares
const relacionesFamiliaresData = [
  { apoderado_documento: '88888888', estudiante_codigo: 'P3001', tipo_relacion: 'padre' },
  { apoderado_documento: '88888888', estudiante_codigo: 'P3002', tipo_relacion: 'padre' },
  { apoderado_documento: '87654321', estudiante_codigo: 'P4001', tipo_relacion: 'padre' },
  { apoderado_documento: '87654321', estudiante_codigo: 'P4002', tipo_relacion: 'padre' },
  { apoderado_documento: '88888888', estudiante_codigo: 'S1001', tipo_relacion: 'padre' },
  { apoderado_documento: '87654321', estudiante_codigo: 'S2001', tipo_relacion: 'padre' }
];

// Datos de encuestas
const encuestasData = [
  {
    titulo: 'Satisfacción con el servicio educativo',
    descripcion: 'Esta encuesta tiene como objetivo conocer tu nivel de satisfacción con los servicios educativos brindados por nuestra institución. Tu opinión es muy importante para mejorar continuamente.',
    fecha_vencimiento: new Date('2025-12-31T23:59:59.000Z'),
    permite_respuesta_multiple: false,
    es_anonima: false,
    mostrar_resultados: true,
    año_academico: 2025,
    preguntas: [
      {
        texto: '¿Qué tan satisfecho estás con la calidad de la enseñanza?',
        tipo: 'escala_1_5',
        obligatoria: true,
        orden: 1
      },
      {
        texto: '¿Cómo calificarías la comunicación entre docentes y padres?',
        tipo: 'opcion_unica',
        obligatoria: true,
        orden: 2,
        opciones: [
          { texto: 'Excelente', orden: 1 },
          { texto: 'Buena', orden: 2 },
          { texto: 'Regular', orden: 3 },
          { texto: 'Mala', orden: 4 }
        ]
      },
      {
        texto: '¿Qué aspectos mejorarías del servicio educativo? (Puedes seleccionar más de una)',
        tipo: 'opcion_multiple',
        obligatoria: false,
        orden: 3,
        opciones: [
          { texto: 'Metodología de enseñanza', orden: 1 },
          { texto: 'Tecnología educativa', orden: 2 },
          { texto: 'Instalaciones físicas', orden: 3 },
          { texto: 'Actividades extracurriculares', orden: 4 },
          { texto: 'Comunicación institucional', orden: 5 }
        ]
      },
      {
        texto: 'Comentarios adicionales',
        tipo: 'texto_largo',
        obligatoria: false,
        orden: 4
      }
    ],
    autor_documento: '77777777'
  },
  {
    titulo: 'Propuesta de mejora para el próximo año académico',
    descripcion: 'Nos interesa conocer tus propuestas de mejora para implementar en el próximo año académico. Comparte tus ideas para que nuestra institución continúe creciendo.',
    fecha_vencimiento: new Date('2025-11-30T23:59:59.000Z'),
    permite_respuesta_multiple: false,
    es_anonima: false,
    mostrar_resultados: true,
    año_academico: 2025,
    preguntas: [
      {
        texto: '¿Qué nuevas actividades te gustaría que se implementaran?',
        tipo: 'texto_corto',
        obligatoria: true,
        orden: 1
      },
      {
        texto: '¿Cómo evalúas la gestión directiva actual?',
        tipo: 'opcion_unica',
        obligatoria: true,
        orden: 2,
        opciones: [
          { texto: 'Excelente', orden: 1 },
          { texto: 'Muy buena', orden: 2 },
          { texto: 'Buena', orden: 3 },
          { texto: 'Regular', orden: 4 },
          { texto: 'Deficiente', orden: 5 }
        ]
      },
      {
        texto: '¿Consideras que la infraestructura actual es suficiente?',
        tipo: 'opcion_unica',
        obligatoria: true,
        orden: 3,
        opciones: [
          { texto: 'Sí, completamente', orden: 1 },
          { texto: 'En su mayoría', orden: 2 },
          { texto: 'Parcialmente', orden: 3 },
          { texto: 'En su mayoría no', orden: 4 },
          { texto: 'No, en absoluto', orden: 5 }
        ]
      }
    ],
    autor_documento: '99999999'
  }
];

// Función para crear datos de encuestas
async function crearEncuestas(usuariosCreados) {
  console.log('📋 Creando encuestas...');
  
  for (const encuestaData of encuestasData) {
    // Buscar al autor de la encuesta en los usuarios ya creados
    const autor = usuariosCreados.find(u => u.nro_documento === encuestaData.autor_documento);
    
    if (!autor) {
      console.log(`⚠️ No se pudo encontrar al autor de la encuesta: ${encuestaData.autor_documento}`);
      continue;
    }
    
    // Verificar si la encuesta ya existe
    const encuestaExistente = await prisma.encuesta.findFirst({
      where: {
        titulo: encuestaData.titulo
      }
    });
    
    if (encuestaExistente) {
      console.log(`ℹ️ La encuesta "${encuestaData.titulo}" ya existe`);
      continue;
    }
    
    // Crear la encuesta
    const nuevaEncuesta = await prisma.encuesta.create({
      data: {
        titulo: encuestaData.titulo,
        descripcion: encuestaData.descripcion,
        fecha_inicio: new Date(),
        fecha_vencimiento: encuestaData.fecha_vencimiento,
        permite_respuesta_multiple: encuestaData.permite_respuesta_multiple,
        es_anonima: encuestaData.es_anonima,
        mostrar_resultados: encuestaData.mostrar_resultados,
        año_academico: encuestaData.año_academico,
        estado: 'activa',
        autor_id: autor.id
      }
    });
    
    console.log(`✅ Encuesta creada: "${encuestaData.titulo}"`);
    
    // Crear las preguntas
    for (const preguntaData of encuestaData.preguntas) {
      const nuevaPregunta = await prisma.preguntaEncuesta.create({
        data: {
          encuesta_id: nuevaEncuesta.id,
          texto: preguntaData.texto,
          tipo: preguntaData.tipo,
          obligatoria: preguntaData.obligatoria,
          orden: preguntaData.orden
        }
      });
      
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
  }
}

// Función principal para poblar la base de datos
async function main() {
  console.log('🌱 Iniciando siembra de datos para el módulo de encuestas...');
  
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
    
    // 2. Crear niveles y grados
    console.log('📚 Creando niveles y grados...');
    const nivelesGradosCreados = [];
    
    for (const nivelGradoData of nivelesGradosData) {
      // Verificar si el nivel-grado ya existe
      const nivelGradoExistente = await prisma.nivelGrado.findFirst({
        where: {
          AND: [
            { nivel: nivelGradoData.nivel },
            { grado: nivelGradoData.grado }
          ]
        }
      });
      
      if (!nivelGradoExistente) {
        const nivelGrado = await prisma.nivelGrado.create({
          data: nivelGradoData
        });
        
        nivelesGradosCreados.push(nivelGrado);
        console.log(`✅ Nivel-Grado creado: ${nivelGrado.nivel} ${nivelGrado.grado}`);
      } else {
        nivelesGradosCreados.push(nivelGradoExistente);
        console.log(`ℹ️ Nivel-Grado ya existe: ${nivelGradoExistente.nivel} ${nivelGradoExistente.grado}`);
      }
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
        // Buscar el nivel-grado correspondiente
        const nivelGrado = nivelesGradosCreados.find(
          ng => ng.nivel === cursoData.nivel && ng.grado === cursoData.grado
        );
        
        if (nivelGrado) {
          const curso = await prisma.curso.create({
            data: {
              nombre: cursoData.nombre,
              codigo_curso: cursoData.codigo_curso,
              nivel_grado_id: nivelGrado.id,
              año_academico: 2025
            }
          });
          
          cursosCreados.push(curso);
          console.log(`✅ Curso creado: ${curso.nombre} - ${cursoData.nivel} ${cursoData.grado}`);
        } else {
          console.log(`⚠️ No se pudo encontrar el nivel-grado para el curso: ${cursoData.codigo_curso}`);
        }
      } else {
        cursosCreados.push(cursoExistente);
        console.log(`ℹ️ Curso ya existe: ${cursoExistente.nombre}`);
      }
    }
    
    // 4. Crear estudiantes
    console.log('👨‍🎓 Creando estudiantes...');
    const estudiantesCreados = [];
    
    for (const estudianteData of estudiantesData) {
      // Verificar si el estudiante ya existe
      const estudianteExistente = await prisma.estudiante.findUnique({
        where: { codigo_estudiante: estudianteData.codigo_estudiante }
      });
      
      if (!estudianteExistente) {
        // Buscar el nivel-grado correspondiente
        const nivelGrado = nivelesGradosCreados.find(
          ng => ng.nivel === estudianteData.nivel && ng.grado === estudianteData.grado
        );
        
        if (nivelGrado) {
          const estudiante = await prisma.estudiante.create({
            data: {
              codigo_estudiante: estudianteData.codigo_estudiante,
              nombre: estudianteData.nombre,
              apellido: estudianteData.apellido,
              nivel_grado_id: nivelGrado.id,
              año_academico: 2025,
              estado_matricula: 'activo'
            }
          });
          
          estudiantesCreados.push(estudiante);
          console.log(`✅ Estudiante creado: ${estudiante.nombre} ${estudiante.apellido} (${estudianteData.nivel} ${estudianteData.grado})`);
        } else {
          console.log(`⚠️ No se pudo encontrar el nivel-grado para el estudiante: ${estudianteData.codigo_estudiante}`);
        }
      } else {
        estudiantesCreados.push(estudianteExistente);
        console.log(`ℹ️ Estudiante ya existe: ${estudianteExistente.nombre} ${estudianteExistente.apellido}`);
      }
    }
    
    // 5. Crear permisos de docentes
    console.log('🛂 Creando permisos de docentes...');
    
    for (const docente of usuariosCreados.filter(u => u.rol === 'docente')) {
      for (const permisoData of permisosDocentesData) {
        // Verificar si el permiso ya existe
        const permisoExistente = await prisma.permisoDocente.findFirst({
          where: {
            AND: [
              { docente_id: docente.id },
              { tipo_permiso: permisoData.tipo_permiso },
              { año_academico: permisoData.año_academico }
            ]
          }
        });
        
        if (!permisoExistente) {
          await prisma.permisoDocente.create({
            data: {
              docente_id: docente.id,
              tipo_permiso: permisoData.tipo_permiso,
              estado_activo: permisoData.estado_activo,
              año_academico: permisoData.año_academico
            }
          });
          
          console.log(`✅ Permiso creado para ${docente.nombre}: ${permisoData.tipo_permiso}`);
        } else {
          console.log(`ℹ️ Permiso ya existe para ${docente.nombre}: ${permisoData.tipo_permiso}`);
        }
      }
    }
    
    // 6. Crear asignaciones docente-curso
    console.log('👨‍🏫 Creando asignaciones docente-curso...');
    
    for (const asignacionData of asignacionesDocenteCursoData) {
      // Buscar docente
      const docente = usuariosCreados.find(u => u.nro_documento === asignacionData.docente_documento);
      if (!docente) continue;
      
      // Buscar curso
      const curso = cursosCreados.find(c => c.codigo_curso === asignacionData.curso_codigo);
      if (!curso) continue;
      
      // Verificar si la asignación ya existe
      const asignacionExistente = await prisma.asignacionDocenteCurso.findFirst({
        where: {
          AND: [
            { docente_id: docente.id },
            { curso_id: curso.id },
            { año_academico: 2025 }
          ]
        }
      });
      
      if (!asignacionExistente) {
        await prisma.asignacionDocenteCurso.create({
          data: {
            docente_id: docente.id,
            curso_id: curso.id,
            nivel_grado_id: curso.nivel_grado_id,
            año_academico: 2025,
            fecha_asignacion: new Date('2025-01-15'),
            estado_activo: true
          }
        });
        
        console.log(`✅ Asignación creada: ${docente.nombre} -> ${curso.nombre} (${curso.codigo_curso})`);
      } else {
        console.log(`ℹ️ Asignación ya existe: ${docente.nombre} -> ${curso.nombre}`);
      }
    }
    
    // 7. Crear relaciones familiares
    console.log('👨‍👩‍👧‍👦 Creando relaciones familiares...');
    
    for (const relacionData of relacionesFamiliaresData) {
      // Buscar apoderado
      const apoderado = usuariosCreados.find(u => u.nro_documento === relacionData.apoderado_documento);
      if (!apoderado) continue;
      
      // Buscar estudiante
      const estudiante = estudiantesCreados.find(e => e.codigo_estudiante === relacionData.estudiante_codigo);
      if (!estudiante) continue;
      
      // Verificar si la relación ya existe
      const relacionExistente = await prisma.relacionesFamiliares.findFirst({
        where: {
          AND: [
            { apoderado_id: apoderado.id },
            { estudiante_id: estudiante.id },
            { año_academico: 2025 }
          ]
        }
      });
      
      if (!relacionExistente) {
        await prisma.relacionesFamiliares.create({
          data: {
            apoderado_id: apoderado.id,
            estudiante_id: estudiante.id,
            tipo_relacion: relacionData.tipo_relacion,
            fecha_asignacion: new Date(),
            estado_activo: true,
            año_academico: 2025
          }
        });
        
        console.log(`✅ Relación familiar creada: ${apoderado.nombre} -> ${estudiante.nombre} (${relacionData.tipo_relacion})`);
      } else {
        console.log(`ℹ️ Relación familiar ya existe: ${apoderado.nombre} -> ${estudiante.nombre}`);
      }
    }
    
    // 8. Crear encuestas
    await crearEncuestas(usuariosCreados);
    
    console.log('🎉 Siembra de datos para el módulo de encuestas completada con éxito!');
    console.log('\n📋 Resumen de datos creados:');
    console.log(`- Usuarios: ${usuariosCreados.length}`);
    console.log(`- Niveles y Grados: ${nivelesGradosCreados.length}`);
    console.log(`- Cursos: ${cursosCreados.length}`);
    console.log(`- Estudiantes: ${estudiantesCreados.length}`);
    console.log(`- Permisos de Docentes: ${usuariosCreados.filter(u => u.rol === 'docente').length * permisosDocentesData.length}`);
    console.log(`- Asignaciones Docente-Curso: ${asignacionesDocenteCursoData.length}`);
    console.log(`- Relaciones Familiares: ${relacionesFamiliaresData.length}`);
    console.log(`- Encuestas: ${encuestasData.length}`);
    
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