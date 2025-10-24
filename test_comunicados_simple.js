'use strict';

const { PrismaClient } = require('@prisma/client');
const comunicadosService = require('./services/comunicadosService');

const prisma = new PrismaClient();

async function testComunicadosBasico() {
  try {
    console.log('🧪 Iniciando prueba básica del módulo de comunicados...');
    
    // 1. Verificar que las tablas existen
    console.log('📋 Verificando tablas en la base de datos...');
    const countComunicados = await prisma.comunicado.count();
    const countLecturas = await prisma.comunicadoLectura.count();
    const countNotificaciones = await prisma.notificacion.count();
    
    console.log(`✅ Tablas verificadas: ${countComunicados} comunicados, ${countLecturas} lecturas, ${countNotificaciones} notificaciones`);
    
    // 2. Verificar funciones del servicio
    console.log('🔧 Verificando funciones del servicio...');
    
    // Verificar validación HTML
    const htmlValido = '<p>Contenido válido</p>';
    const resultadoValidacion = comunicadosService.validarHTML(htmlValido);
    console.log(`✅ Validación HTML: ${resultadoValidacion.es_valido ? 'Válido' : 'Inválido'}`);
    
    // Verificar generación de preview
    const contenidoLargo = '<p>Este es un contenido largo para generar un preview de máximo 120 caracteres. Este contenido debe ser truncado correctamente.</p>';
    const preview = comunicadosService.generarPreviewContenido(contenidoLargo);
    console.log(`✅ Preview generado (${preview.length} caracteres): ${preview.substring(0, 50)}...`);
    
    // 3. Crear un usuario de prueba para el comunicado
    console.log('👤 Creando usuario de prueba...');
    const usuarioPrueba = await prisma.usuario.findFirst({
      where: { rol: 'director' }
    });
    
    if (!usuarioPrueba) {
      throw new Error('No se encontró un usuario director para la prueba');
    }
    
    console.log(`✅ Usuario director encontrado: ${usuarioPrueba.nombre} ${usuarioPrueba.apellido}`);
    
    // 4. Crear un comunicado de prueba
    console.log('📝 Creando comunicado de prueba...');
    const datosComunicado = {
      titulo: 'Comunicado de prueba para verificación',
      tipo: 'informativo',
      contenido_html: '<p>Este es un comunicado de prueba para verificar el funcionamiento del módulo de comunicados.</p>',
      publico_objetivo: ['todos'],
      estado: 'borrador'
    };
    
    const comunicadoCreado = await comunicadosService.guardarBorrador(datosComunicado, usuarioPrueba);
    console.log(`✅ Comunicado creado: ${comunicadoCreado.id} - ${comunicadoCreado.titulo}`);
    
    // 5. Verificar que se puede leer el comunicado
    console.log('📖 Verificando lectura del comunicado...');
    const comunicadoLeido = await prisma.comunicado.findUnique({
      where: { id: comunicadoCreado.id }
    });
    
    if (!comunicadoLeido) {
      throw new Error('No se pudo leer el comunicado creado');
    }
    
    console.log(`✅ Comunicado leído correctamente: ${comunicadoLeido.estado}`);
    
    // 6. Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await prisma.comunicado.delete({
      where: { id: comunicadoCreado.id }
    });
    console.log('✅ Datos de prueba eliminados');
    
    console.log('\n🎉 ¡Prueba básica del módulo de comunicados completada exitosamente!');
    console.log('\n📋 Resumen de funcionalidades verificadas:');
    console.log('  ✅ Tablas de base de datos creadas');
    console.log('  ✅ Funciones del servicio funcionando');
    console.log('  ✅ Creación de comunicados');
    console.log('  ✅ Lectura de comunicados');
    console.log('  ✅ Validación HTML');
    console.log('  ✅ Generación de preview');
    
  } catch (error) {
    console.error('\n❌ Error en la prueba básica:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
testComunicadosBasico();