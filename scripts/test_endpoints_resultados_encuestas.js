const { PrismaClient } = require('@prisma/client');

// Configuración
const API_BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

// Test users credentials (from seed data)
const TEST_USERS = {
  director: {
    tipo_documento: 'DNI',
    nro_documento: '99999999',
    password: '123456789'
  },
  admin: {
    tipo_documento: 'DNI', 
    nro_documento: '11111111',
    password: '123456789'
  },
  docente: {
    tipo_documento: 'DNI',
    nro_documento: '77777777', 
    password: '123456789'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);
const logTest = (message) => log(`🧪 ${message}`, colors.magenta);

// Global variables for tests
let authToken = '';
let currentUser = null;
let availableSurveys = [];
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Authentication functions using fetch
async function authenticateUser(userType) {
  try {
    logTest(`Autenticando como ${userType}...`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_USERS[userType])
    });
    
    const data = await response.json();
    
    if (data.success) {
      authToken = data.data.token;
      currentUser = data.data.user;
      logSuccess(`Autenticación exitosa como ${userType}: ${currentUser.nombre} (${currentUser.rol})`);
      return true;
    } else {
      logError(`Fallo en autenticación: ${data.error?.message}`);
      return false;
    }
  } catch (error) {
    logError(`Error de autenticación: ${error.message}`);
    return false;
  }
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
}

// Database utility functions
async function getAvailableSurveys() {
  try {
    logTest('Obteniendo encuestas disponibles desde BD...');
    
    const surveys = await prisma.encuesta.findMany({
      include: {
        preguntas: {
          include: {
            opciones: true
          },
          orderBy: { orden: 'asc' }
        },
        autor: true,
        _count: {
          select: {
            preguntas: true,
            respuestas: true,
            notificacionesEncuesta: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    availableSurveys = surveys;
    logSuccess(`Encontradas ${surveys.length} encuestas en BD`);
    
    return surveys;
  } catch (error) {
    logError(`Error obteniendo encuestas: ${error.message}`);
    return [];
  }
}

// Test functions using fetch
async function testGetResultsByQuestion(surveyId, filters = {}) {
  try {
    logTest(`Probando GET /encuestas/${surveyId}/resultados/preguntas`);
    
    const params = new URLSearchParams();
    if (filters.nivel) params.append('nivel', filters.nivel);
    if (filters.grado) params.append('grado', filters.grado);
    if (filters.curso) params.append('curso', filters.curso);
    if (filters.rol) params.append('rol', filters.rol);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await fetch(
      `${API_BASE_URL}/encuestas/${surveyId}/resultados/preguntas${queryString}`,
      { 
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      logSuccess('Endpoint /resultados/preguntas funciona correctamente');
      
      // Validate response structure
      const hasRequiredFields = 
        data.data.encuesta &&
        data.data.resultados_por_pregunta &&
        Array.isArray(data.data.resultados_por_pregunta);
      
      if (hasRequiredFields) {
        logSuccess('Estructura de respuesta válida');
        logInfo(`Preguntas procesadas: ${data.data.resultados_por_pregunta.length}`);
        
        if (data.data.resultados_por_pregunta.length > 0) {
          const primeraPregunta = data.data.resultados_por_pregunta[0];
          logInfo(`Primera pregunta: "${primeraPregunta.texto.substring(0, 50)}..."`);
          if (primeraPregunta.agregacion) {
            logInfo(`Agregación disponible: tipo=${primeraPregunta.agregacion.tipo || 'N/A'}`);
          }
          if (primeraPregunta.agregacion?.opciones) {
            logInfo(`Opciones de distribución: ${primeraPregunta.agregacion.opciones.length || 0}`);
          }
        }
        
        testResults.passed++;
      } else {
        logWarning('Estructura de respuesta incompleta');
        testResults.failed++;
      }
      
    } else {
      logError(`Error en respuesta: ${data.error?.message}`);
      testResults.failed++;
    }
    
  } catch (error) {
    if (error.status === 403) {
      logWarning('Acceso denegado - Solo directores y administradores pueden acceder');
      logInfo('Este es el comportamiento esperado para roles no autorizados');
      testResults.passed++;
    } else if (error.status === 404) {
      logError('Encuesta no encontrada');
      testResults.failed++;
    } else {
      logError(`Error en test: ${error.message}`);
      testResults.failed++;
    }
  }
  
  testResults.total++;
}

async function testGetResultsStats(surveyId) {
  try {
    logTest(`Probando GET /encuestas/${surveyId}/estadisticas`);
    
    const response = await fetch(
      `${API_BASE_URL}/encuestas/${surveyId}/estadisticas`,
      { 
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      logSuccess('Endpoint /estadisticas funciona correctamente');
      
      // Validate response structure
      const hasRequiredFields = 
        data.data.encuesta &&
        data.data.metricas_generales &&
        data.data.distribucion_respuestas;
      
      if (hasRequiredFields) {
        logSuccess('Estructura de respuesta válida');
        logInfo(`Total destinatarios: ${data.data.metricas_generales.total_destinatarios || 'N/A'}`);
        logInfo(`Total respuestas: ${data.data.metricas_generales.total_respuestas || 'N/A'}`);
        logInfo(`Porcentaje participación: ${data.data.metricas_generales.porcentaje_participacion || 'N/A'}%`);
        
        if (data.data.distribucion_respuestas?.por_dia) {
          logInfo(`Distribución temporal: ${data.data.distribucion_respuestas.por_dia.length} días`);
        }
        
        if (data.data.indicadores_rendimiento) {
          logInfo(`Indicadores: ${Object.keys(data.data.indicadores_rendimiento).join(', ')}`);
        }
        
        testResults.passed++;
      } else {
        logWarning('Estructura de respuesta incompleta');
        testResults.failed++;
      }
      
    } else {
      logError(`Error en respuesta: ${data.error?.message}`);
      testResults.failed++;
    }
    
  } catch (error) {
    if (error.status === 403) {
      logWarning('Acceso denegado - Solo directores y administradores pueden acceder');
      logInfo('Este es el comportamiento esperado para roles no autorizados');
      testResults.passed++;
    } else if (error.status === 404) {
      logError('Encuesta no encontrada');
      testResults.failed++;
    } else {
      logError(`Error en test: ${error.message}`);
      testResults.failed++;
    }
  }
  
  testResults.total++;
}

async function testGetResponses(surveyId, params = {}) {
  try {
    logTest(`Probando GET /respuestas-encuestas con encuesta_id=${surveyId}`);
    
    const queryParams = new URLSearchParams({
      encuesta_id: surveyId,
      page: params.page || 1,
      limit: params.limit || 20,
      order: params.order || 'fecha_respuesta DESC'
    });
    
    if (params.nivel) queryParams.append('nivel', params.nivel);
    if (params.grado) queryParams.append('grado', params.grado);
    if (params.curso) queryParams.append('curso', params.curso);
    if (params.rol) queryParams.append('rol', params.rol);
    
    const response = await fetch(
      `${API_BASE_URL}/encuestas/respuestas-encuestas?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      logSuccess('Endpoint /respuestas-encuestas funciona correctamente');
      
      // Validate response structure
      const hasRequiredFields = 
        data.data.encuesta &&
        data.data.respuestas &&
        data.data.paginacion;
      
      if (hasRequiredFields) {
        logSuccess('Estructura de respuesta válida');
        logInfo(`Respuestas retornadas: ${data.data.respuestas.length}`);
        logInfo(`Total registros: ${data.data.paginacion.total_registros}`);
        logInfo(`Página actual: ${data.data.paginacion.pagina_actual}`);
        logInfo(`Total páginas: ${data.data.paginacion.total_paginas}`);
        
        if (data.data.respuestas.length > 0) {
          const primeraRespuesta = data.data.respuestas[0];
          logInfo(`Primera respuesta de: ${primeraRespuesta.respondiente?.nombre || 'N/A'}`);
          logInfo(`Respuestas completas: ${primeraRespuesta.respuestas?.length || 0}`);
        }
        
        testResults.passed++;
      } else {
        logWarning('Estructura de respuesta incompleta');
        testResults.failed++;
      }
      
    } else {
      logError(`Error en respuesta: ${data.error?.message}`);
      testResults.failed++;
    }
    
  } catch (error) {
    if (error.status === 403) {
      logWarning('Acceso denegado - Solo directores y administradores pueden acceder');
      logInfo('Este es el comportamiento esperado para roles no autorizados');
      testResults.passed++;
    } else if (error.status === 400) {
      logWarning('Parámetros inválidos - Comportamiento esperado sin respuestas');
      testResults.passed++;
    } else if (error.status === 404) {
      logError('Encuesta no encontrada');
      testResults.failed++;
    } else {
      logError(`Error en test: ${error.message}`);
      testResults.failed++;
    }
  }
  
  testResults.total++;
}

// Test scenarios
async function runTestScenario(userType, description) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`ESCENARIO: ${description}`, colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
  
  const authenticated = await authenticateUser(userType);
  if (!authenticated) {
    logError(`No se pudo autenticar como ${userType}. Saltando tests...`);
    return false;
  }
  
  // Get available surveys
  const surveys = await getAvailableSurveys();
  if (surveys.length === 0) {
    logWarning('No hay encuestas disponibles para testing');
    // Intentar con un ID dummy para probar que el endpoint existe
    const dummySurveyId = '00000000-0000-0000-0000-000000000000';
    logInfo('Probando con ID dummy para verificar que el endpoint existe...');
    await testGetResultsByQuestion(dummySurveyId);
    await testGetResultsStats(dummySurveyId);
    await testGetResponses(dummySurveyId);
    return false;
  }
  
  // Buscar una encuesta que tenga respuestas para testear mejor
  const surveyToTest = surveys.find(s => s._count.respuestas > 0) || surveys[0];
  logInfo(`Usando encuesta para tests: "${surveyToTest.titulo}"`);
  logInfo(`ID: ${surveyToTest.id}`);
  logInfo(`Total preguntas: ${surveyToTest.preguntas.length}`);
  logInfo(`Total respuestas existentes: ${surveyToTest._count.respuestas}`);
  
  // Test 1: Results by question (without filters)
  await testGetResultsByQuestion(surveyToTest.id);
  
  // Test 2: Results by question (with filters)
  await testGetResultsByQuestion(surveyToTest.id, {
    nivel: 'Primaria',
    grado: '3ro'
  });
  
  // Test 3: Results stats
  await testGetResultsStats(surveyToTest.id);
  
  // Test 4: Responses table (default params)
  await testGetResponses(surveyToTest.id);
  
  // Test 5: Responses table (with filters)
  await testGetResponses(surveyToTest.id, {
    page: 1,
    limit: 10,
    nivel: 'Primaria',
    order: 'fecha_respuesta DESC'
  });
  
  return true;
}

// Error case tests
async function testErrorCases() {
  log(`\n${'='.repeat(60)}`, colors.yellow);
  log('PROBANDO CASOS DE ERROR', colors.yellow);
  log(`${'='.repeat(60)}`, colors.yellow);
  
  // Test with invalid survey ID
  const invalidSurveyId = 'invalid-survey-id';
  await testGetResultsByQuestion(invalidSurveyId);
  await testGetResultsStats(invalidSurveyId);
  await testGetResponses(invalidSurveyId);
  
  // Test without authentication
  const originalToken = authToken;
  authToken = 'invalid_token';
  
  logTest('Probando endpoint sin autenticación válida...');
  try {
    await fetch(`${API_BASE_URL}/encuestas/any-id/estadisticas`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid_token' }
    });
    logError('El endpoint debería haber fallado sin autenticación válida');
    testResults.failed++;
  } catch (error) {
    logSuccess('Correctamente rechazó petición sin autenticación válida');
    testResults.passed++;
  }
  
  authToken = originalToken;
  testResults.total++;
}

// Main test execution
async function runAllTests() {
  log('\n🚀 INICIANDO TESTS DE ENDPOINTS DE RESULTADOS DE ENCUESTAS', colors.cyan);
  log('='.repeat(80), colors.cyan);
  
  try {
    // Test with director (should have access)
    await runTestScenario('director', 'Usuario Director (Acceso Completo)');
    
    // Test with admin (should have access)
    await runTestScenario('admin', 'Usuario Administrador (Acceso Completo)');
    
    // Test with docente (should be denied)
    await runTestScenario('docente', 'Usuario Docente (Acceso Denegado)');
    
    // Test error cases
    await testErrorCases();
    
    // Print results summary
    log('\n' + '='.repeat(80), colors.cyan);
    log('RESUMEN DE RESULTADOS', colors.cyan);
    log('='.repeat(80), colors.cyan);
    
    logInfo(`Total tests ejecutados: ${testResults.total}`);
    logSuccess(`Tests exitosos: ${testResults.passed}`);
    logError(`Tests fallidos: ${testResults.failed}`);
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    logInfo(`Tasa de éxito: ${successRate}%`);
    
    if (testResults.failed === 0) {
      logSuccess('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE');
    } else {
      logError(`⚠️  ${testResults.failed} TESTS FALLARON`);
    }
    
    // Additional validation
    log('\n' + '='.repeat(60), colors.magenta);
    log('VALIDACIÓN ADICIONAL', colors.magenta);
    log('='.repeat(60), colors.magenta);
    
    const surveys = await getAvailableSurveys();
    logInfo(`Encuestas disponibles en BD: ${surveys.length}`);
    
    for (const survey of surveys) {
      logInfo(`- "${survey.titulo}" (${survey.id})`);
      logInfo(`  Preguntas: ${survey.preguntas.length}, Respuestas: ${survey._count.respuestas}`);
      logInfo(`  Estado: ${survey.estado}, Autor: ${survey.autor.nombre}`);
    }
    
  } catch (error) {
    logError(`Error durante la ejecución de tests: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    log('\n🔌 Conexión a BD cerrada.');
  }
}

// Execute tests if run directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      log('\n🏁 Ejecución de tests completada', colors.green);
      process.exit(0);
    })
    .catch((error) => {
      logError(`Error en ejecución: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testGetResultsByQuestion,
  testGetResultsStats,
  testGetResponses
};