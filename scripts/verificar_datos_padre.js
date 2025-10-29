const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarDatosPadre() {
  try {
    console.log('🔍 Verificando datos del padre y sus hijos...\n');
    
    // 1. Buscar usuario padre
    const padre = await prisma.usuario.findFirst({
      where: {
        rol: 'apoderado'
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        rol: true,
        tipo_documento: true,
        nro_documento: true
      }
    });
    
    if (!padre) {
      console.log('❌ No se encontró ningún usuario con rol apoderado');
      return;
    }
    
    console.log('✅ Usuario padre encontrado:');
    console.log(`   ID: ${padre.id}`);
    console.log(`   Nombre: ${padre.nombre} ${padre.apellido}`);
    console.log(`   Rol: ${padre.rol}`);
    console.log(`   Documento: ${padre.tipo_documento} ${padre.nro_documento}\n`);
    
    // 2. Buscar relaciones familiares del padre
    const relaciones = await prisma.relacionesFamiliares.findMany({
      where: {
        apoderado_id: padre.id
      },
      include: {
        estudiante: {
          include: {
            nivel_grado: true
          }
        }
      }
    });
    
    console.log(`📊 Relaciones familiares encontradas: ${relaciones.length}\n`);
    
    if (relaciones.length === 0) {
      console.log('❌ El padre no tiene relaciones familiares registradas');
      return;
    }
    
    relaciones.forEach((relacion, index) => {
      console.log(`   Relación ${index + 1}:`);
      console.log(`   - ID: ${relacion.id}`);
      console.log(`   - Tipo: ${relacion.tipo_relacion}`);
      console.log(`   - Estado activo: ${relacion.estado_activo}`);
      console.log(`   - Año académico: ${relacion.año_academico}`);
      console.log(`   - Estudiante: ${relacion.estudiante.nombre} ${relacion.estudiante.apellido}`);
      console.log(`   - Código estudiante: ${relacion.estudiante.codigo_estudiante}`);
      console.log(`   - Estado matrícula: ${relacion.estudiante.estado_matricula}`);
      console.log(`   - Nivel-grado: ${relacion.estudiante.nivel_grado?.nivel} ${relacion.estudiante.nivel_grado?.grado}\n`);
    });
    
    // 3. Simular la consulta del servicio
    console.log('🔍 Simulando consulta del servicio getChildrenForParent...\n');
    
    const relacionesSimuladas = await prisma.relacionesFamiliares.findMany({
      where: {
        apoderado_id: padre.id,
        estado_activo: true,
        estudiante: {
          estado_matricula: 'activo',
        },
      },
      select: {
        estudiante: {
          select: {
            id: true,
            codigo_estudiante: true,
            nombre: true,
            apellido: true,
            estado_matricula: true,
            nivel_grado: {
              select: {
                nivel: true,
                grado: true,
                descripcion: true,
              },
            },
          },
        },
      },
    });
    
    console.log(`📊 Relaciones que cumplirían los filtros del servicio: ${relacionesSimuladas.length}\n`);
    
    if (relacionesSimuladas.length === 0) {
      console.log('❌ Ninguna relación cumple con los filtros del servicio');
      console.log('   Filtros aplicados:');
      console.log('   - estado_activo: true');
      console.log('   - estudiante.estado_matricula: "activo"');
    } else {
      relacionesSimuladas.forEach((relacion, index) => {
        console.log(`   Hijo ${index + 1}:`);
        console.log(`   - ID: ${relacion.estudiante.id}`);
        console.log(`   - Nombre: ${relacion.estudiante.nombre} ${relacion.estudiante.apellido}`);
        console.log(`   - Código: ${relacion.estudiante.codigo_estudiante}`);
        console.log(`   - Estado matrícula: ${relacion.estudiante.estado_matricula}`);
        console.log(`   - Nivel-grado: ${relacion.estudiante.nivel_grado?.nivel} ${relacion.estudiante.nivel_grado?.grado}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión a la base de datos cerrada.');
  }
}

verificarDatosPadre();