import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, describe, test, expect } from 'vitest';

const prisma = new PrismaClient();

/**
 * Tests para validar las métricas definidas para el Capítulo 6 de la tesis
 * 
 * Estos tests verifican:
 * 1. Que los datos de simulación se registren correctamente
 * 2. Que las métricas se calculen según las fórmulas definidas
 * 3. Que los resultados sean consistentes con el comportamiento simulado
 */

// Configuración global para los tests
beforeAll(async () => {
  // Verificar que existen datos de simulación
  const authLogsCount = await prisma.$queryRaw`SELECT COUNT(*) FROM auth_logs`;
  const accessLogsCount = await prisma.$queryRaw`SELECT COUNT(*) FROM access_logs`;
  
  if (authLogsCount[0].count === 0 || accessLogsCount[0].count === 0) {
    console.warn('ADVERTENCIA: No hay datos de simulación. Ejecute primero el script simular_comportamiento_instancias_corregido.js');
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('M1: Tasa de éxito en inicios de sesión', () => {
  test('Debe calcular correctamente la tasa de éxito global', async () => {
    // Consulta SQL para calcular la tasa de éxito
    const result = await prisma.$queryRaw`
      SELECT 
        COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso') AS exitosos,
        COUNT(*) FILTER (WHERE tipo_evento = 'login_fallido') AS fallidos,
        COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')) AS total,
        ROUND(
          (COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso')::DECIMAL / 
           NULLIF(COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')), 0)) * 100, 
          2
        ) AS tasa_exito
      FROM auth_logs
      WHERE tipo_evento IN ('login_exitoso', 'login_fallido')
    `;
    
    // Verificar que hay datos
    expect(result[0].total).toBeGreaterThan(0);
    
    // En nuestra simulación, todos los logins son exitosos
    expect(Number(result[0].tasa_exito)).toBe(100);
    
    console.log('M1 - Tasa de éxito en inicios de sesión:');
    console.log(`  Total intentos: ${result[0].total}`);
    console.log(`  Exitosos: ${result[0].exitosos}`);
    console.log(`  Fallidos: ${result[0].fallidos}`);
    console.log(`  Tasa de éxito: ${result[0].tasa_exito}%`);
  });
  
  test('Debe calcular la tasa de éxito por instancia de prueba', async () => {
    // Consulta SQL para calcular la tasa por usuario
    const result = await prisma.$queryRaw`
      SELECT 
        usuario_id,
        COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso') AS exitosos,
        COUNT(*) FILTER (WHERE tipo_evento = 'login_fallido') AS fallidos,
        COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')) AS total,
        ROUND(
          (COUNT(*) FILTER (WHERE tipo_evento = 'login_exitoso')::DECIMAL / 
           NULLIF(COUNT(*) FILTER (WHERE tipo_evento IN ('login_exitoso', 'login_fallido')), 0)) * 100, 
          2
        ) AS tasa_exito
      FROM auth_logs
      WHERE tipo_evento IN ('login_exitoso', 'login_fallido')
      GROUP BY usuario_id
      ORDER BY usuario_id
    `;
    
    // Verificar que hay datos para cada instancia
    expect(result.length).toBeGreaterThanOrEqual(3); // Al menos las 3 instancias de prueba
    
    // Verificar que cada instancia tiene una tasa de éxito
    for (const row of result) {
      expect(row.tasa_exito).toBeDefined();
      // En nuestra simulación, todos los logins son exitosos
      expect(Number(row.tasa_exito)).toBe(100);
    }
    
    console.log('M1 - Tasa de éxito por instancia:');
    for (const row of result) {
      console.log(`  ${row.usuario_id}: ${row.tasa_exito}% (${row.exitosos}/${row.total})`);
    }
  });
});

describe('M2: Tiempo promedio de sesión activa', () => {
  test('Debe calcular correctamente el tiempo promedio de sesión global', async () => {
    // Consulta SQL para calcular el tiempo promedio de sesión
    const result = await prisma.$queryRaw`
      WITH sesiones AS (
        SELECT
          login.usuario_id,
          login.timestamp AS login_time,
          logout.timestamp AS logout_time,
          EXTRACT(EPOCH FROM (logout.timestamp - login.timestamp)) / 60 AS duracion_minutos
        FROM (
          SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
          FROM auth_logs
          WHERE tipo_evento = 'login_exitoso'
        ) login
        JOIN (
          SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
          FROM auth_logs
          WHERE tipo_evento = 'logout'
        ) logout ON login.usuario_id = logout.usuario_id AND login.rn = logout.rn
        WHERE logout.timestamp > login.timestamp
      )
      SELECT 
        COUNT(*) AS total_sesiones,
        ROUND(AVG(duracion_minutos), 2) AS duracion_promedio_minutos,
        ROUND(MIN(duracion_minutos), 2) AS duracion_minima_minutos,
        ROUND(MAX(duracion_minutos), 2) AS duracion_maxima_minutos
      FROM sesiones
    `;
    
    // Verificar que hay datos
    expect(result[0].total_sesiones).toBeGreaterThan(0);
    
    // Verificar que el tiempo promedio es razonable (entre 10 y 90 minutos)
    expect(Number(result[0].duracion_promedio_minutos)).toBeGreaterThan(10);
    expect(Number(result[0].duracion_promedio_minutos)).toBeLessThan(90);
    
    console.log('M2 - Tiempo promedio de sesión activa:');
    console.log(`  Total sesiones: ${result[0].total_sesiones}`);
    console.log(`  Duración promedio: ${result[0].duracion_promedio_minutos} minutos`);
    console.log(`  Duración mínima: ${result[0].duracion_minima_minutos} minutos`);
    console.log(`  Duración máxima: ${result[0].duracion_maxima_minutos} minutos`);
  });
  
  test('Debe calcular el tiempo promedio de sesión por instancia de prueba', async () => {
    // Consulta SQL para calcular el tiempo promedio por usuario
    const result = await prisma.$queryRaw`
      WITH sesiones AS (
        SELECT
          login.usuario_id,
          login.timestamp AS login_time,
          logout.timestamp AS logout_time,
          EXTRACT(EPOCH FROM (logout.timestamp - login.timestamp)) / 60 AS duracion_minutos
        FROM (
          SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
          FROM auth_logs
          WHERE tipo_evento = 'login_exitoso'
        ) login
        JOIN (
          SELECT usuario_id, timestamp, ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY timestamp) AS rn
          FROM auth_logs
          WHERE tipo_evento = 'logout'
        ) logout ON login.usuario_id = logout.usuario_id AND login.rn = logout.rn
        WHERE logout.timestamp > login.timestamp
      )
      SELECT 
        usuario_id,
        COUNT(*) AS total_sesiones,
        ROUND(AVG(duracion_minutos), 2) AS duracion_promedio_minutos
      FROM sesiones
      GROUP BY usuario_id
      ORDER BY usuario_id
    `;
    
    // Verificar que hay datos para cada instancia
    expect(result.length).toBeGreaterThanOrEqual(3); // Al menos las 3 instancias de prueba
    
    // Verificar que cada instancia tiene un tiempo promedio
    for (const row of result) {
      expect(row.duracion_promedio_minutos).toBeDefined();
      
      // Obtener los IDs de los usuarios para comparar
      const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678', rol: 'apoderado' } });
      const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321', rol: 'apoderado' } });
      const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344', rol: 'docente' } });
      
      // Verificar que los tiempos son consistentes con el comportamiento simulado
      if (row.usuario_id === padreActivo.id) {
        // Padre Activo: 20-40 minutos
        expect(Number(row.duracion_promedio_minutos)).toBeGreaterThan(15);
        expect(Number(row.duracion_promedio_minutos)).toBeLessThan(45);
      } else if (row.usuario_id === padreReactivo.id) {
        // Padre Reactivo: 10-20 minutos
        expect(Number(row.duracion_promedio_minutos)).toBeGreaterThan(5);
        expect(Number(row.duracion_promedio_minutos)).toBeLessThan(25);
      } else if (row.usuario_id === docente.id) {
        // Docente: 60-90 minutos
        expect(Number(row.duracion_promedio_minutos)).toBeGreaterThan(55);
        expect(Number(row.duracion_promedio_minutos)).toBeLessThan(95);
      }
    }
    
    console.log('M2 - Tiempo promedio de sesión por instancia:');
    for (const row of result) {
      console.log(`  ${row.usuario_id}: ${row.duracion_promedio_minutos} minutos (${row.total_sesiones} sesiones)`);
    }
  });
});

describe('M3: Frecuencia de consulta de calificaciones', () => {
  test('Debe calcular correctamente la frecuencia de consulta global', async () => {
    // Consulta SQL para calcular la frecuencia de consulta
    const result = await prisma.$queryRaw`
      WITH fechas AS (
        SELECT 
          MIN(timestamp::date) AS fecha_inicio,
          MAX(timestamp::date) AS fecha_fin
        FROM access_logs
        WHERE modulo = 'calificaciones'
      ),
      dias_periodo AS (
        SELECT
          EXTRACT(DAY FROM (fecha_fin::timestamp - fecha_inicio::timestamp)) + 1 AS total_dias
        FROM fechas
      )
      SELECT 
        COUNT(*) AS total_consultas,
        (SELECT total_dias FROM dias_periodo) AS dias_periodo,
        ROUND(COUNT(*)::DECIMAL / (SELECT total_dias FROM dias_periodo), 2) AS consultas_por_dia
      FROM access_logs
      WHERE modulo = 'calificaciones'
    `;
    
    // Verificar que hay datos
    expect(result[0].total_consultas).toBeGreaterThan(0);
    
    // Verificar que la frecuencia es razonable
    expect(Number(result[0].consultas_por_dia)).toBeGreaterThan(0);
    
    console.log('M3 - Frecuencia de consulta de calificaciones:');
    console.log(`  Total consultas: ${result[0].total_consultas}`);
    console.log(`  Días del período: ${result[0].dias_periodo}`);
    console.log(`  Consultas por día: ${result[0].consultas_por_dia}`);
  });
  
  test('Debe calcular la frecuencia de consulta por instancia de prueba', async () => {
    // Consulta SQL para calcular la frecuencia por usuario
    const result = await prisma.$queryRaw`
      WITH fechas AS (
        SELECT 
          MIN(timestamp::date) AS fecha_inicio,
          MAX(timestamp::date) AS fecha_fin
        FROM access_logs
        WHERE modulo = 'calificaciones'
      ),
      dias_periodo AS (
        SELECT
          EXTRACT(DAY FROM (fecha_fin::timestamp - fecha_inicio::timestamp)) + 1 AS total_dias
        FROM fechas
      )
      SELECT 
        usuario_id,
        COUNT(*) AS total_consultas,
        (SELECT total_dias FROM dias_periodo) AS dias_periodo,
        ROUND(COUNT(*)::DECIMAL / (SELECT total_dias FROM dias_periodo), 2) AS consultas_por_dia,
        ROUND(COUNT(*)::DECIMAL / ((SELECT total_dias FROM dias_periodo) / 7), 2) AS consultas_por_semana
      FROM access_logs
      WHERE modulo = 'calificaciones'
      GROUP BY usuario_id
      ORDER BY usuario_id
    `;
    
    // Verificar que hay datos para las instancias
    expect(result.length).toBeGreaterThanOrEqual(2); // Al menos los 2 padres
    
    // Verificar que cada instancia tiene una frecuencia
    for (const row of result) {
      expect(row.consultas_por_semana).toBeDefined();
      
      // Obtener los IDs de los usuarios para comparar
      const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678', rol: 'apoderado' } });
      const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321', rol: 'apoderado' } });
      
      // Verificar que las frecuencias son consistentes con el comportamiento simulado
      if (row.usuario_id === padreActivo.id) {
        // Padre Activo: 2 veces/semana
        expect(Number(row.consultas_por_semana)).toBeGreaterThanOrEqual(1.5);
        expect(Number(row.consultas_por_semana)).toBeLessThanOrEqual(2.5);
      } else if (row.usuario_id === padreReactivo.id) {
        // Padre Reactivo: 1 vez cada 2 semanas (0.5/semana)
        expect(Number(row.consultas_por_semana)).toBeGreaterThanOrEqual(0.3);
        expect(Number(row.consultas_por_semana)).toBeLessThanOrEqual(0.7);
      }
    }
    
    console.log('M3 - Frecuencia de consulta por instancia:');
    for (const row of result) {
      console.log(`  ${row.usuario_id}: ${row.consultas_por_semana} consultas/semana (${row.total_consultas} consultas)`);
    }
  });
});

describe('M4: Frecuencia de consulta de asistencias', () => {
  test('Debe calcular correctamente la frecuencia de consulta global', async () => {
    // Consulta SQL para calcular la frecuencia de consulta
    const result = await prisma.$queryRaw`
      WITH fechas AS (
        SELECT 
          MIN(timestamp::date) AS fecha_inicio,
          MAX(timestamp::date) AS fecha_fin
        FROM access_logs
        WHERE modulo = 'asistencia'
      ),
      dias_periodo AS (
        SELECT
          EXTRACT(DAY FROM (fecha_fin::timestamp - fecha_inicio::timestamp)) + 1 AS total_dias
        FROM fechas
      )
      SELECT 
        COUNT(*) AS total_consultas,
        (SELECT total_dias FROM dias_periodo) AS dias_periodo,
        ROUND(COUNT(*)::DECIMAL / (SELECT total_dias FROM dias_periodo), 2) AS consultas_por_dia
      FROM access_logs
      WHERE modulo = 'asistencia'
    `;
    
    // Verificar que hay datos
    expect(result[0].total_consultas).toBeGreaterThan(0);
    
    // Verificar que la frecuencia es razonable
    expect(Number(result[0].consultas_por_dia)).toBeGreaterThan(0);
    
    console.log('M4 - Frecuencia de consulta de asistencias:');
    console.log(`  Total consultas: ${result[0].total_consultas}`);
    console.log(`  Días del período: ${result[0].dias_periodo}`);
    console.log(`  Consultas por día: ${result[0].consultas_por_dia}`);
  });
  
  test('Debe calcular la frecuencia de consulta por instancia de prueba', async () => {
    // Consulta SQL para calcular la frecuencia por usuario
    const result = await prisma.$queryRaw`
      WITH fechas AS (
        SELECT 
          MIN(timestamp::date) AS fecha_inicio,
          MAX(timestamp::date) AS fecha_fin
        FROM access_logs
        WHERE modulo = 'asistencia'
      ),
      dias_periodo AS (
        SELECT
          EXTRACT(DAY FROM (fecha_fin::timestamp - fecha_inicio::timestamp)) + 1 AS total_dias
        FROM fechas
      )
      SELECT 
        usuario_id,
        COUNT(*) AS total_consultas,
        (SELECT total_dias FROM dias_periodo) AS dias_periodo,
        ROUND(COUNT(*)::DECIMAL / (SELECT total_dias FROM dias_periodo), 2) AS consultas_por_dia,
        ROUND(COUNT(*)::DECIMAL / ((SELECT total_dias FROM dias_periodo) / 7), 2) AS consultas_por_semana
      FROM access_logs
      WHERE modulo = 'asistencia'
      GROUP BY usuario_id
      ORDER BY usuario_id
    `;
    
    // Verificar que hay datos para las instancias
    expect(result.length).toBeGreaterThanOrEqual(2); // Al menos los 2 padres
    
    // Verificar que cada instancia tiene una frecuencia
    for (const row of result) {
      expect(row.consultas_por_semana).toBeDefined();
      
      // Obtener los IDs de los usuarios para comparar
      const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678', rol: 'apoderado' } });
      const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321', rol: 'apoderado' } });
      
      // Verificar que las frecuencias son consistentes con el comportamiento simulado
      if (row.usuario_id === padreActivo.id) {
        // Padre Activo: 1 vez/semana
        expect(Number(row.consultas_por_semana)).toBeGreaterThanOrEqual(0.7);
        expect(Number(row.consultas_por_semana)).toBeLessThanOrEqual(1.3);
      } else if (row.usuario_id === padreReactivo.id) {
        // Padre Reactivo: solo después de alertas (menos frecuente)
        expect(Number(row.consultas_por_semana)).toBeGreaterThanOrEqual(0);
        expect(Number(row.consultas_por_semana)).toBeLessThanOrEqual(0.5);
      }
    }
    
    console.log('M4 - Frecuencia de consulta por instancia:');
    for (const row of result) {
      console.log(`  ${row.usuario_id}: ${row.consultas_por_semana} consultas/semana (${row.total_consultas} consultas)`);
    }
  });
});

describe('M5: Cantidad de mensajes bidireccionales enviados', () => {
  test('Debe calcular correctamente la cantidad total de mensajes', async () => {
    // Consulta SQL para contar mensajes
    const result = await prisma.$queryRaw`
      SELECT
        COUNT(*) AS total_mensajes,
        COUNT(DISTINCT conversacion_id) AS total_conversaciones,
        ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT conversacion_id), 2) AS mensajes_por_conversacion
      FROM mensajes
    `;
    
    // Verificar que hay datos
    expect(result[0].total_mensajes).toBeGreaterThan(0);
    expect(result[0].total_conversaciones).toBeGreaterThan(0);
    
    console.log('M5 - Cantidad de mensajes bidireccionales:');
    console.log(`  Total mensajes: ${result[0].total_mensajes}`);
    console.log(`  Total conversaciones: ${result[0].total_conversaciones}`);
    console.log(`  Mensajes por conversación: ${result[0].mensajes_por_conversacion}`);
  });
  
  test('Debe calcular la cantidad de mensajes por instancia de prueba', async () => {
    // Consulta SQL para contar mensajes por usuario
    const result = await prisma.$queryRaw`
      SELECT
        emisor_id,
        COUNT(*) AS mensajes_enviados,
        COUNT(DISTINCT conversacion_id) AS conversaciones_activas
      FROM mensajes
      GROUP BY emisor_id
      ORDER BY emisor_id
    `;
    
    // Verificar que hay datos para las instancias
    expect(result.length).toBeGreaterThanOrEqual(3); // Al menos las 3 instancias de prueba
    
    console.log('M5 - Mensajes por instancia:');
    for (const row of result) {
      console.log(`  ${row.emisor_id}: ${row.mensajes_enviados} mensajes en ${row.conversaciones_activas} conversaciones`);
    }
  });
  
  test('Debe verificar la bidireccionalidad de las conversaciones', async () => {
    // Consulta SQL para verificar bidireccionalidad
    const result = await prisma.$queryRaw`
      WITH emisores_por_conversacion AS (
        SELECT
          conversacion_id,
          COUNT(DISTINCT emisor_id) AS num_emisores
        FROM mensajes
        GROUP BY conversacion_id
      )
      SELECT 
        COUNT(*) AS total_conversaciones,
        COUNT(*) FILTER (WHERE num_emisores > 1) AS conversaciones_bidireccionales,
        ROUND((COUNT(*) FILTER (WHERE num_emisores > 1))::DECIMAL / COUNT(*) * 100, 2) AS porcentaje_bidireccional
      FROM emisores_por_conversacion
    `;
    
    // Verificar que hay conversaciones bidireccionales
    expect(result[0].conversaciones_bidireccionales).toBeGreaterThan(0);
    
    // En nuestra simulación, todas las conversaciones deberían ser bidireccionales
    expect(Number(result[0].porcentaje_bidireccional)).toBe(100);
    
    console.log('M5 - Bidireccionalidad de conversaciones:');
    console.log(`  Total conversaciones: ${result[0].total_conversaciones}`);
    console.log(`  Conversaciones bidireccionales: ${result[0].conversaciones_bidireccionales}`);
    console.log(`  Porcentaje bidireccional: ${result[0].porcentaje_bidireccional}%`);
  });
});

describe('M6: Tiempo promedio de respuesta a mensajes', () => {
  test('Debe calcular correctamente el tiempo promedio de respuesta global', async () => {
    // Consulta SQL para calcular tiempo de respuesta
    const result = await prisma.$queryRaw`
      WITH mensajes_ordenados AS (
        SELECT
          conversacion_id,
          emisor_id,
          fecha_envio,
          LAG(emisor_id) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS emisor_anterior,
          LAG(fecha_envio) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS fecha_anterior
        FROM mensajes
      ),
      tiempos_respuesta AS (
        SELECT 
          conversacion_id,
          emisor_id,
          fecha_envio,
          fecha_anterior,
          EXTRACT(EPOCH FROM (fecha_envio - fecha_anterior)) / 3600 AS horas_respuesta
        FROM mensajes_ordenados
        WHERE emisor_id != emisor_anterior
          AND emisor_anterior IS NOT NULL
      )
      SELECT 
        COUNT(*) AS total_respuestas,
        ROUND(AVG(horas_respuesta), 2) AS tiempo_promedio_horas,
        ROUND(MIN(horas_respuesta), 2) AS tiempo_minimo_horas,
        ROUND(MAX(horas_respuesta), 2) AS tiempo_maximo_horas
      FROM tiempos_respuesta
    `;
    
    // Verificar que hay datos
    expect(result[0].total_respuestas).toBeGreaterThan(0);
    
    console.log('M6 - Tiempo promedio de respuesta:');
    console.log(`  Total respuestas: ${result[0].total_respuestas}`);
    console.log(`  Tiempo promedio: ${Number(result[0].tiempo_promedio_horas)} horas`);
    console.log(`  Tiempo mínimo: ${Number(result[0].tiempo_minimo_horas)} horas`);
    console.log(`  Tiempo máximo: ${Number(result[0].tiempo_maximo_horas)} horas`);
  });
  
  test('Debe calcular el tiempo de respuesta por rol', async () => {
    // Consulta SQL para calcular tiempo por rol
    const result = await prisma.$queryRaw`
      WITH mensajes_ordenados AS (
        SELECT
          conversacion_id,
          emisor_id,
          fecha_envio,
          LAG(emisor_id) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS emisor_anterior,
          LAG(fecha_envio) OVER (PARTITION BY conversacion_id ORDER BY fecha_envio) AS fecha_anterior
        FROM mensajes
      ),
      tiempos_respuesta AS (
        SELECT 
          conversacion_id,
          emisor_id,
          fecha_envio,
          fecha_anterior,
          EXTRACT(EPOCH FROM (fecha_envio - fecha_anterior)) / 3600 AS horas_respuesta,
          CASE
            WHEN emisor_id IN (SELECT id FROM usuarios WHERE rol = 'apoderado') THEN 'apoderado'
            WHEN emisor_id IN (SELECT id FROM usuarios WHERE rol = 'docente') THEN 'docente'
            ELSE 'otro'
          END AS rol_emisor
        FROM mensajes_ordenados
        WHERE emisor_id != emisor_anterior
          AND emisor_anterior IS NOT NULL
      )
      SELECT 
        rol_emisor,
        COUNT(*) AS total_respuestas,
        ROUND(AVG(horas_respuesta), 2) AS tiempo_promedio_horas
      FROM tiempos_respuesta
      GROUP BY rol_emisor
      ORDER BY rol_emisor
    `;
    
    // Verificar que hay datos para ambos roles
    expect(result.length).toBeGreaterThanOrEqual(2); // Apoderado y Docente
    
    // Verificar que los tiempos son consistentes con el comportamiento simulado
    for (const row of result) {
      if (row.rol_emisor === 'apoderado') {
        // Los padres suelen responder en un plazo más largo
        expect(Number(row.tiempo_promedio_horas)).toBeGreaterThan(1);
      } else if (row.rol_emisor === 'docente') {
        // Los docentes deberían responder más rápido (<12h)
        expect(Number(row.tiempo_promedio_horas)).toBeLessThan(12);
      }
    }
    
    console.log('M6 - Tiempo de respuesta por rol:');
    for (const row of result) {
      console.log(`  ${row.rol_emisor}: ${Number(row.tiempo_promedio_horas)} horas (${row.total_respuestas} respuestas)`);
    }
  });
});