'use strict';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Función para validar fecha programada
function validarFechaProgramada(fecha) {
  if (!fecha) return null;
  
  const fechaProgramada = new Date(fecha);
  const ahora = new Date();
  const treintaMinutos = 30 * 60 * 1000; // 30 minutos en milisegundos
  
  if (fechaProgramada.getTime() < ahora.getTime() + treintaMinutos) {
    throw new Error('La fecha programada debe ser al menos 30 minutos en el futuro');
  }
  
  return fechaProgramada;
}

// Función para verificar permisos de usuario
async function verificarPermisos(usuario, tipo, añoAcademico = 2025) {
  // Los directores pueden crear cualquier tipo
  if (usuario.rol === 'director') {
    return true;
  }
  
  // Los docentes solo pueden crear académicos y eventos con permisos explícitos
  if (usuario.rol === 'docente') {
    if (tipo === 'administrativo' || tipo === 'urgente') {
      return false;
    }
    
    // Verificar si tiene permisos para comunicados
    const permiso = await prisma.permisoDocente.findFirst({
      where: {
        docente_id: usuario.id,
        tipo_permiso: 'comunicados',
        estado_activo: true,
        año_academico
      }
    });
    
    return !!permiso;
  }
  
  // Los padres y otros roles no pueden crear comunicados
  return false;
}

// Función para verificar acceso a segmentación
async function verificarAccesoSegmentacion(usuario, segmentacion) {
  // Los directores tienen acceso completo
  if (usuario.rol === 'director') {
    return true;
  }
  
  // Para docentes, verificar que tenga acceso a los niveles/grados/cursos solicitados
  if (usuario.rol === 'docente') {
    const asignaciones = await prisma.asignacionDocenteCurso.findMany({
      where: {
        docente_id: usuario.id,
        estado_activo: true,
        año_academico: 2025
      },
      include: {
        nivel_grado: true,
        curso: true
      }
    });
    
    // Extraer niveles, grados y cursos a los que tiene acceso
    const nivelesPermitidos = [...new Set(asignaciones.map(a => a.nivel_grado.nivel))];
    const gradosPermitidos = [...new Set(asignaciones.map(a => a.nivel_grado.grado))];
    const cursosPermitidos = asignaciones.map(a => a.curso.codigo_curso);
    
    // Verificar cada nivel solicitado
    if (segmentacion.niveles) {
      for (const nivel of segmentacion.niveles) {
        if (!nivelesPermitidos.includes(nivel)) {
          return false;
        }
      }
    }
    
    // Verificar cada grado solicitado
    if (segmentacion.grados) {
      for (const grado of segmentacion.grados) {
        if (!gradosPermitidos.includes(grado)) {
          return false;
        }
      }
    }
    
    // Verificar cada curso solicitado
    if (segmentacion.cursos) {
      for (const curso of segmentacion.cursos) {
        if (!cursosPermitidos.includes(curso)) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// Función para crear comunicados
async function crearComunicado(datos, usuario) {
  // Verificar permisos para el tipo de comunicado
  const tienePermisos = await verificarPermisos(usuario, datos.tipo);
  if (!tienePermisos) {
    throw new Error('No tienes permisos para crear este tipo de comunicado');
  }
  
  // Verificar acceso a la segmentación
  const tieneAcceso = await verificarAccesoSegmentacion(usuario, datos);
  if (!tieneAcceso) {
    throw new Error('No tienes permisos para comunicarte con los destinatarios seleccionados');
  }
  
  // Validar fecha programada si existe
  let fechaProgramada = null;
  if (datos.fecha_programada) {
    fechaProgramada = validarFechaProgramada(datos.fecha_programada);
  }
  
  // Determinar estado
  const estado = datos.estado || 'borrador';
  const fechaPublicacion = estado === 'publicado' && !fechaProgramada ? new Date() : null;
  
  // Crear comunicado en la base de datos
  const comunicado = await prisma.comunicado.create({
    data: {
      titulo: datos.titulo,
      contenido: datos.contenido_html,
      tipo: datos.tipo,
      publico_objetivo: datos.publico_objetivo,
      niveles_objetivo: datos.niveles ? JSON.stringify(datos.niveles) : null,
      grados_objetivo: datos.grados ? JSON.stringify(datos.grados) : null,
      cursos_objetivo: datos.cursos ? JSON.stringify(datos.cursos) : null,
      fecha_creacion: new Date(),
      fecha_publicacion: fechaPublicacion,
      fecha_programada: fechaProgramada,
      estado: fechaProgramada ? 'programado' : estado,
      editado: false,
      autor_id: usuario.id,
      año_academico: 2025
    }
  });
  
  // Si se publica inmediatamente, generar notificaciones
  if (estado === 'publicado' && !fechaProgramada) {
    // Aquí se generarían las notificaciones automáticamente
    // Por ahora, solo lo registramos en el resultado
    console.log(`Notificaciones generadas para comunicado ${comunicado.id}`);
  }
  
  return comunicado;
}

// Función para obtener todos los cursos (solo director)
async function obtenerTodosLosCursos(usuario) {
  if (usuario.rol !== 'director') {
    throw new Error('Solo los directores pueden ver todos los cursos');
  }
  
  // Obtener todos los niveles y grados
  const nivelesGrados = await prisma.nivelGrado.findMany({
    where: { estado_activo: true },
    orderBy: [
      { nivel: 'asc' },
      { grado: 'asc' }
    ]
  });
  
  // Organizar por nivel
  const jerarquia = {};
  nivelesGrados.forEach(ng => {
    if (!jerarquia[ng.nivel]) {
      jerarquia[ng.nivel] = [];
    }
    
    // Obtener cursos para este nivel y grado
    const cursos = prisma.curso.findMany({
      where: {
        nivel_grado_id: ng.id,
        estado_activo: true
      },
      select: {
        id: true,
        nombre: true,
        codigo_curso: true
      }
    });
    
    jerarquia[ng.nivel].push({
      id: ng.id,
      grado: ng.grado,
      descripcion: ng.descripcion,
      cursos
    });
  });
  
  return jerarquia;
}

// Función para obtener niveles y grados (solo director)
async function obtenerNivelesYGrados(usuario) {
  if (usuario.rol !== 'director') {
    throw new Error('Solo los directores pueden ver todos los niveles y grados');
  }
  
  // Obtener todos los niveles y grados
  const nivelesGrados = await prisma.nivelGrado.findMany({
    where: { estado_activo: true },
    orderBy: [
      { nivel: 'asc' },
      { grado: 'asc' }
    ]
  });
  
  // Organizar por nivel
  const jerarquia = {};
  nivelesGrados.forEach(ng => {
    if (!jerarquia[ng.nivel]) {
      jerarquia[ng.nivel] = [];
    }
    
    jerarquia[ng.nivel].push({
      id: ng.id,
      grado: ng.grado,
      descripcion: ng.descripcion
    });
  });
  
  return jerarquia;
}

// Función para obtener cursos asignados a un docente
async function obtenerCursosDocente(docenteId, solicitante) {
  // Verificar permisos: solo el propio docente o un director pueden ver esta información
  if (solicitante.rol !== 'director' && solicitante.id !== docenteId) {
    throw new Error('No tienes permisos para ver esta información');
  }
  
  // Obtener información del docente
  const docente = await prisma.usuario.findUnique({
    where: { id: docenteId },
    select: {
      id: true,
      nombre: true,
      apellido: true
    }
  });
  
  if (!docente) {
    throw new Error('Docente no encontrado');
  }
  
  // Obtener asignaciones del docente
  const asignaciones = await prisma.asignacionDocenteCurso.findMany({
    where: {
      docente_id: docenteId,
      estado_activo: true,
      año_academico: 2025
    },
    include: {
      nivel_grado: true,
      curso: true
    },
    orderBy: [
      { nivel_grado: { nivel: 'asc' } },
      { nivel_grado: { grado: 'asc' } }
    ]
  });
  
  // Organizar por nivel
  const cursosPorNivel = {};
  asignaciones.forEach(asignacion => {
    const nivel = asignacion.nivel_grado.nivel;
    
    if (!cursosPorNivel[nivel]) {
      cursosPorNivel[nivel] = [];
    }
    
    cursosPorNivel[nivel].push({
      id: asignacion.curso.id,
      nombre: asignacion.curso.nombre,
      codigo_curso: asignacion.curso.codigo_curso,
      grado: asignacion.nivel_grado.grado
    });
  });
  
  return {
    docente,
    cursos: cursosPorNivel
  };
}

// Función para verificar permisos de un docente
async function verificarPermisosDocente(docenteId, solicitante) {
  // Verificar permisos: solo el propio docente o un director pueden ver esta información
  if (solicitante.rol !== 'director' && solicitante.id !== docenteId) {
    throw new Error('No tienes permisos para ver esta información');
  }
  
  // Obtener permisos del docente
  const permisos = await prisma.permisoDocente.findMany({
    where: {
      docente_id: docenteId,
      año_academico: 2025
    }
  });
  
  // Verificar si tiene permiso para comunicados
  const puedeCrearComunicados = permisos.some(p => p.tipo_permiso === 'comunicados' && p.estado_activo);
  
  // Verificar si tiene permiso para encuestas
  const puedeCrearEncuestas = permisos.some(p => p.tipo_permiso === 'encuestas' && p.estado_activo);
  
  return {
    puede_crear_comunicados: puedeCrearComunicados,
    puede_crear_encuestas: puedeCrearEncuestas,
    permisos_detalle: permisos
  };
}

// Función para calcular destinatarios
async function calcularDestinatarios(segmentacion, solicitante) {
  // Verificar permisos para la segmentación
  const tieneAcceso = await verificarAccesoSegmentacion(solicitante, segmentacion);
  if (!tieneAcceso) {
    throw new Error('No tienes permisos para comunicarte con los destinatarios seleccionados');
  }
  
  // Contar padres según segmentación
  let padresCount = 0;
  
  if (segmentacion.publico_objetivo.includes('padres') || segmentacion.todos) {
    // Construir filtros para padres
    const filtrosPadres = {
      where: {
        rol: 'apoderado',
        estado_activo: true
      }
    };
    
    // Agregar filtros por nivel/grado si se especifican
    if (segmentacion.niveles && segmentacion.niveles.length > 0) {
      // Obtener estudiantes de esos niveles
      const estudiantesPorNivel = await prisma.estudiante.findMany({
        where: {
          nivel_grado: {
            nivel: { in: segmentacion.niveles }
          },
          estado_matricula: 'activo',
          año_academico: 2025
        },
        select: { id: true }
      });
      
      const estudiantesIds = estudiantesPorNivel.map(e => e.id);
      
      // Obtener relaciones familiares de esos estudiantes
      const relacionesFamiliares = await prisma.relacionesFamiliares.findMany({
        where: {
          estudiante_id: { in: estudiantesIds },
          estado_activo: true,
          año_academico: 2025
        },
        select: { apoderado_id: true }
      });
      
      const padresIds = relacionesFamiliares.map(r => r.apoderado_id);
      filtrosPadres.where.id = { in: padresIds };
    }
    
    if (segmentacion.grados && segmentacion.grados.length > 0) {
      // Obtener estudiantes de esos grados
      const estudiantesPorGrado = await prisma.estudiante.findMany({
        where: {
          nivel_grado: {
            grado: { in: segmentacion.grados }
          },
          estado_matricula: 'activo',
          año_academico: 2025
        },
        select: { id: true }
      });
      
      const estudiantesIds = estudiantesPorGrado.map(e => e.id);
      
      // Obtener relaciones familiares de esos estudiantes
      const relacionesFamiliares = await prisma.relacionesFamiliares.findMany({
        where: {
          estudiante_id: { in: estudiantesIds },
          estado_activo: true,
          año_academico: 2025
        },
        select: { apoderado_id: true }
      });
      
      const padresIds = relacionesFamiliares.map(r => r.apoderado_id);
      
      // Si ya hay filtros por ID, intersectarlos
      if (filtrosPadres.where.id) {
        const idsExistentes = filtrosPadres.where.id.in;
        const idsNuevos = padresIds;
        filtrosPadres.where.id = { in: idsExistentes.filter(id => idsNuevos.includes(id)) };
      } else {
        filtrosPadres.where.id = { in: padresIds };
      }
    }
    
    // Contar padres
    padresCount = await prisma.usuario.count(filtrosPadres);
  }
  
  // Contar docentes según segmentación
  let docentesCount = 0;
  
  if (segmentacion.publico_objetivo.includes('docentes') || segmentacion.todos) {
    // Construir filtros para docentes
    const filtrosDocentes = {
      where: {
        rol: 'docente',
        estado_activo: true
      }
    };
    
    // Agregar filtros por nivel/grado si se especifican
    if (segmentacion.niveles && segmentacion.niveles.length > 0) {
      const asignacionesPorNivel = await prisma.asignacionDocenteCurso.findMany({
        where: {
          nivel_grado: {
            nivel: { in: segmentacion.niveles }
          },
          estado_activo: true,
          año_academico: 2025
        },
        select: { docente_id: true }
      });
      
      const docentesIds = asignacionesPorNivel.map(a => a.docente_id);
      filtrosDocentes.where.id = { in: docentesIds };
    }
    
    if (segmentacion.grados && segmentacion.grados.length > 0) {
      const asignacionesPorGrado = await prisma.asignacionDocenteCurso.findMany({
        where: {
          nivel_grado: {
            grado: { in: segmentacion.grados }
          },
          estado_activo: true,
          año_academico: 2025
        },
        select: { docente_id: true }
      });
      
      const docentesIds = asignacionesPorGrado.map(a => a.docente_id);
      
      // Si ya hay filtros por ID, intersectarlos
      if (filtrosDocentes.where.id) {
        const idsExistentes = filtrosDocentes.where.id.in;
        const idsNuevos = docentesIds;
        filtrosDocentes.where.id = { in: idsExistentes.filter(id => idsNuevos.includes(id)) };
      } else {
        filtrosDocentes.where.id = { in: docentesIds };
      }
    }
    
    // Contar docentes
    docentesCount = await prisma.usuario.count(filtrosDocentes);
  }
  
  return {
    total_estimado: padresCount + docentesCount,
    padres: padresCount,
    docentes: docentesCount
  };
}

// Función para guardar borrador
async function guardarBorrador(datos, usuario) {
  // Verificar permisos para el tipo de comunicado
  const tienePermisos = await verificarPermisos(usuario, datos.tipo);
  if (!tienePermisos) {
    throw new Error('No tienes permisos para crear este tipo de comunicado');
  }
  
  // Verificar acceso a la segmentación
  const tieneAcceso = await verificarAccesoSegmentacion(usuario, datos);
  if (!tieneAcceso) {
    throw new Error('No tienes permisos para comunicarte con los destinatarios seleccionados');
  }
  
  // Crear comunicado como borrador
  const borrador = await prisma.comunicado.create({
    data: {
      titulo: datos.titulo,
      contenido: datos.contenido_html,
      tipo: datos.tipo,
      publico_objetivo: datos.publico_objetivo,
      niveles_objetivo: datos.niveles ? JSON.stringify(datos.niveles) : null,
      grados_objetivo: datos.grados ? JSON.stringify(datos.grados) : null,
      cursos_objetivo: datos.cursos ? JSON.stringify(datos.cursos) : null,
      fecha_creacion: new Date(),
      estado: 'borrador',
      editado: false,
      autor_id: usuario.id,
      año_academico: 2025
    }
  });
  
  return borrador;
}

// Función para editar comunicado
async function editarComunicado(id, datos, usuario) {
  // Buscar comunicado existente
  const comunicadoExistente = await prisma.comunicado.findUnique({
    where: { id }
  });
  
  if (!comunicadoExistente) {
    throw new Error('Comunicado no encontrado');
  }
  
  // Verificar permisos: solo el autor o un director pueden editar
  if (usuario.rol !== 'director' && usuario.id !== comunicadoExistente.autor_id) {
    throw new Error('No tienes permisos para editar este comunicado');
  }
  
  // Verificar que no esté publicado hace mucho tiempo (ventana de 24 horas)
  if (comunicadoExistente.estado === 'publicado' && comunicadoExistente.fecha_publicacion) {
    const tiempoTranscurrido = new Date() - comunicadoExistente.fecha_publicacion;
    const ventanaEdicion = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    
    if (tiempoTranscurrido > ventanaEdicion) {
      throw new Error('Solo puedes editar comunicados publicados dentro de las primeras 24 horas');
    }
  }
  
  // Actualizar comunicado
  const comunicadoActualizado = await prisma.comunicado.update({
    where: { id },
    data: {
      ...datos,
      contenido: datos.contenido_html || comunicadoExistente.contenido,
      niveles_objetivo: datos.niveles ? JSON.stringify(datos.niveles) : comunicadoExistente.niveles_objetivo,
      grados_objetivo: datos.grados ? JSON.stringify(datos.grados) : comunicadoExistente.grados_objetivo,
      cursos_objetivo: datos.cursos ? JSON.stringify(datos.cursos) : comunicadoExistente.cursos_objetivo,
      fecha_edicion: new Date(),
      editado: true
    }
  });
  
  return comunicadoActualizado;
}

// Función para listar borradores de un usuario
async function listarBorradores(usuario, pagina = 1, limite = 10) {
  const offset = (pagina - 1) * limite;
  
  // Contar total de borradores
  const total = await prisma.comunicado.count({
    where: {
      autor_id: usuario.id,
      estado: 'borrador'
    }
  });
  
  // Obtener borradores paginados
  const borradores = await prisma.comunicado.findMany({
    where: {
      autor_id: usuario.id,
      estado: 'borrador'
    },
    orderBy: {
      fecha_creacion: 'desc'
    },
    skip: offset,
    take: limite
  });
  
  return {
    borradores,
    paginacion: {
      pagina,
      limite,
      total,
      paginas: Math.ceil(total / limite)
    }
  };
}

// Función para publicar borrador
async function publicarBorrador(id, datos, usuario) {
  // Buscar comunicado existente
  const comunicadoExistente = await prisma.comunicado.findUnique({
    where: { id }
  });
  
  if (!comunicadoExistente) {
    throw new Error('Comunicado no encontrado');
  }
  
  // Verificar que esté en estado borrador
  if (comunicadoExistente.estado !== 'borrador') {
    throw new Error('Solo se pueden publicar comunicados en estado borrador');
  }
  
  // Verificar permisos: solo el autor o un director pueden publicar
  if (usuario.rol !== 'director' && usuario.id !== comunicadoExistente.autor_id) {
    throw new Error('No tienes permisos para publicar este comunicado');
  }
  
  // Validar fecha programada si se proporciona
  let fechaProgramada = null;
  if (datos.fecha_programada) {
    fechaProgramada = validarFechaProgramada(datos.fecha_programada);
  }
  
  // Actualizar comunicado
  const comunicadoActualizado = await prisma.comunicado.update({
    where: { id },
    data: {
      estado: fechaProgramada ? 'programado' : 'publicado',
      fecha_publicacion: fechaProgramada ? null : new Date(),
      fecha_programada: fechaProgramada
    }
  });
  
  // Si se publica inmediatamente, generar notificaciones
  if (!fechaProgramada) {
    // Aquí se generarían las notificaciones automáticamente
    // Por ahora, solo lo registramos en el resultado
    console.log(`Notificaciones generadas para comunicado ${comunicadoActualizado.id}`);
  }
  
  return comunicadoActualizado;
}

// Función para listar comunicados programados
async function listarComunicadosProgramados(usuario, pagina = 1, limite = 10) {
  const offset = (pagina - 1) * limite;
  
  // Construir filtros según rol
  let where = {
    estado: 'programado',
    fecha_programada: {
      gt: new Date() // Solo programados futuros
    }
  };
  
  if (usuario.rol !== 'director') {
    where.autor_id = usuario.id;
  }
  
  // Contar total de comunicados programados
  const total = await prisma.comunicado.count({ where });
  
  // Obtener comunicados programados paginados
  const comunicados = await prisma.comunicado.findMany({
    where,
    orderBy: {
      fecha_programada: 'asc'
    },
    skip: offset,
    take: limite
  });
  
  // Calcular tiempo restante para cada comunicado
  const comunicadosConTiempo = comunicados.map(c => {
    const ahora = new Date();
    const fechaProgramada = new Date(c.fecha_programada);
    const tiempoRestante = fechaProgramada.getTime() - ahora.getTime();
    
    return {
      ...c,
      tiempo_restantante_ms: tiempoRestante,
      // Convertir a formato legible
      tiempo_restante: {
        dias: Math.floor(tiempoRestante / (1000 * 60 * 60 * 24)),
        horas: Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60))
      }
    };
  });
  
  return {
    comunicados_programados: comunicadosConTiempo,
    paginacion: {
      pagina,
      limite,
      total,
      paginas: Math.ceil(total / limite)
    }
  };
}

// Función para cancelar programación
async function cancelarProgramacion(id, usuario) {
  // Buscar comunicado existente
  const comunicadoExistente = await prisma.comunicado.findUnique({
    where: { id }
  });
  
  if (!comunicadoExistente) {
    throw new Error('Comunicado no encontrado');
  }
  
  // Verificar que esté en estado programado
  if (comunicadoExistente.estado !== 'programado') {
    throw new Error('Solo se puede cancelar la programación de comunicados en estado programado');
  }
  
  // Verificar permisos: solo el autor o un director pueden cancelar
  if (usuario.rol !== 'director' && usuario.id !== comunicadoExistente.autor_id) {
    throw new Error('No tienes permisos para cancelar la programación de este comunicado');
  }
  
  // Actualizar comunicado a estado borrador
  const comunicadoActualizado = await prisma.comunicado.update({
    where: { id },
    data: {
      estado: 'borrador',
      fecha_programada: null
    }
  });
  
  return comunicadoActualizado;
}

// Función para validar HTML
function validarHTML(contenido) {
  // Eliminar tags peligrosos (según arquitectura separada, no es necesario isomorphic-dompurify)
  const contenidoSanitizado = contenido
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  // Verificar si se eliminaron elementos peligrosos
  const tieneScript = /<script/i.test(contenido);
  const tieneIframe = /<iframe/i.test(contenido);
  const tieneObject = /<object/i.test(contenido);
  const tieneEmbed = /<embed/i.test(contenido);
  
  const elementosPeligrosos = tieneScript || tieneIframe || tieneObject || tieneEmbed;
  
  return {
    contenido_sanitizado: contenidoSanitizado,
    es_valido: !elementosPeligrosos,
    elementos_peligrosos_detectados: elementosPeligrosos
  };
}

// Función para validar segmentación
async function validarSegmentacion(segmentacion, usuario) {
  try {
    // Verificar acceso a la segmentación
    const tieneAcceso = await verificarAccesoSegmentacion(usuario, segmentacion);
    
    return {
      es_valida: tieneAcceso,
      mensaje: tieneAcceso 
        ? 'Segmentación válida' 
        : 'No tienes permisos para comunicarte con los destinatarios seleccionados'
    };
  } catch (error) {
    return {
      es_valida: false,
      mensaje: error.message
    };
  }
}

module.exports = {
  crearComunicado,
  obtenerTodosLosCursos,
  obtenerNivelesYGrados,
  obtenerCursosDocente,
  verificarPermisosDocente,
  calcularDestinatarios,
  guardarBorrador,
  editarComunicado,
  listarBorradores,
  publicarBorrador,
  listarComunicadosProgramados,
  cancelarProgramacion,
  validarHTML,
  validarSegmentacion
};