/**
 * Script para generar gráficos de las métricas del Capítulo 6
 * 
 * Este script:
 * 1. Consulta los datos de las métricas en la base de datos
 * 2. Genera gráficos usando Chart.js
 * 3. Guarda los gráficos como imágenes PNG
 * 
 * Requisitos:
 * - Node.js
 * - Paquetes: @prisma/client, chart.js, canvas
 * 
 * Instalación:
 * npm install chart.js canvas chartjs-node-canvas
 */

import { PrismaClient } from '@prisma/client';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el equivalente de __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Configuración de Chart.js
const width = 800;
const height = 500;
const chartCallback = (ChartJS) => {
  // Configuración global de Chart.js
  ChartJS.defaults.font.family = 'Arial';
  ChartJS.defaults.font.size = 14;
  ChartJS.defaults.color = '#666';
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

// Directorio para guardar los gráficos
const outputDir = path.join(__dirname, '../doc/tesis/graficos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Función principal
 */
async function main() {
  console.log('Generando gráficos de métricas...');
  
  try {
    // M1: Tasa de éxito en inicios de sesión
    await generarGraficoTasaExitoLogin();
    
    // M2: Tiempo promedio de sesión activa
    await generarGraficoTiempoSesion();
    
    // M3: Frecuencia de consulta de calificaciones
    await generarGraficoFrecuenciaConsulta();
    
    // M4: Frecuencia de consulta de asistencias
    await generarGraficoFrecuenciaAsistencia();
    
    // M5: Cantidad de mensajes bidireccionales
    await generarGraficoMensajesBidireccionales();
    
    // M6: Tiempo promedio de respuesta
    await generarGraficoTiempoRespuesta();
    
    console.log('Gráficos generados exitosamente en:', outputDir);
  } catch (error) {
    console.error('Error al generar gráficos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * M1: Tasa de éxito en inicios de sesión
 */
async function generarGraficoTasaExitoLogin() {
  console.log('Generando gráfico M1: Tasa de éxito en inicios de sesión...');
  
  // Consulta por instancia
  const resultadosPorInstancia = await prisma.$queryRaw`
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
  
  // Preparar datos para el gráfico
  // Obtener nombres amigables para los usuarios
  const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678' } });
  const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321' } });
  const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344' } });
  
  const labels = resultadosPorInstancia.map(row => {
    // Convertir IDs técnicos a nombres amigables
    if (row.usuario_id === padreActivo?.id) return 'Padre Activo';
    if (row.usuario_id === padreReactivo?.id) return 'Padre Reactivo';
    if (row.usuario_id === docente?.id) return 'Docente';
    return row.usuario_id.substring(0, 8) + '...';
  });
  
  const tasasExito = resultadosPorInstancia.map(row => Number(row.tasa_exito));
  const intentosTotales = resultadosPorInstancia.map(row => Number(row.total));
  
  // Configuración del gráfico
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Tasa de Éxito (%)',
          data: tasasExito,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Intentos Totales',
          data: intentosTotales,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'M1: Tasa de Éxito en Inicios de Sesión por Instancia',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.raw;
              if (context.datasetIndex === 0) {
                return `${label}: ${value}%`;
              } else {
                return `${label}: ${value}`;
              }
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Tasa de Éxito (%)'
          },
          min: 0,
          max: 100
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Intentos Totales'
          },
          min: 0,
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  };
  
  // Generar y guardar el gráfico
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(path.join(outputDir, 'M1_tasa_exito_login.png'), image);
  
  console.log('Gráfico M1 generado.');
}

/**
 * M2: Tiempo promedio de sesión activa
 */
async function generarGraficoTiempoSesion() {
  console.log('Generando gráfico M2: Tiempo promedio de sesión activa...');
  
  // Consulta por instancia
  const resultadosPorInstancia = await prisma.$queryRaw`
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
      ROUND(AVG(duracion_minutos), 2) AS duracion_promedio_minutos,
      ROUND(MIN(duracion_minutos), 2) AS duracion_minima_minutos,
      ROUND(MAX(duracion_minutos), 2) AS duracion_maxima_minutos
    FROM sesiones
    GROUP BY usuario_id
    ORDER BY usuario_id
  `;
  
  // Obtener nombres amigables para los usuarios
  const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678' } });
  const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321' } });
  const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344' } });
  
  // Preparar datos para el gráfico
  const labels = resultadosPorInstancia.map(row => {
    if (row.usuario_id === padreActivo?.id) return 'Padre Activo';
    if (row.usuario_id === padreReactivo?.id) return 'Padre Reactivo';
    if (row.usuario_id === docente?.id) return 'Docente';
    return row.usuario_id.substring(0, 8) + '...';
  });
  
  const duracionPromedio = resultadosPorInstancia.map(row => Number(row.duracion_promedio_minutos));
  const duracionMinima = resultadosPorInstancia.map(row => Number(row.duracion_minima_minutos));
  const duracionMaxima = resultadosPorInstancia.map(row => Number(row.duracion_maxima_minutos));
  
  // Configuración del gráfico
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Duración Promedio (min)',
          data: duracionPromedio,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Duración Mínima (min)',
          data: duracionMinima,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Duración Máxima (min)',
          data: duracionMaxima,
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'M2: Tiempo de Sesión Activa por Instancia',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.raw;
              return `${label}: ${value} minutos`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Duración (minutos)'
          }
        }
      }
    }
  };
  
  // Generar y guardar el gráfico
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(path.join(outputDir, 'M2_tiempo_sesion.png'), image);
  
  console.log('Gráfico M2 generado.');
}

/**
 * M3: Frecuencia de consulta de calificaciones
 */
async function generarGraficoFrecuenciaConsulta() {
  console.log('Generando gráfico M3: Frecuencia de consulta de calificaciones...');
  
  // Consulta por instancia
  const resultadosPorInstancia = await prisma.$queryRaw`
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
  
  // Obtener nombres amigables para los usuarios
  const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678' } });
  const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321' } });
  const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344' } });
  
  const labels = resultadosPorInstancia.map(row => {
    if (row.usuario_id === padreActivo?.id) return 'Padre Activo';
    if (row.usuario_id === padreReactivo?.id) return 'Padre Reactivo';
    if (row.usuario_id === docente?.id) return 'Docente';
    return row.usuario_id.substring(0, 8) + '...';
  });
  
  const consultasPorSemana = resultadosPorInstancia.map(row => Number(row.consultas_por_semana));
  const totalConsultas = resultadosPorInstancia.map(row => Number(row.total_consultas));
  
  // Configuración del gráfico
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Consultas por Semana',
          data: consultasPorSemana,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Total Consultas',
          data: totalConsultas,
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'M3: Frecuencia de Consulta de Calificaciones por Instancia',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Consultas por Semana'
          },
          beginAtZero: true
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Total Consultas'
          },
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  };
  
  // Generar y guardar el gráfico
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(path.join(outputDir, 'M3_frecuencia_consulta.png'), image);
  
  console.log('Gráfico M3 generado.');
}

/**
 * M4: Frecuencia de consulta de asistencias
 */
async function generarGraficoFrecuenciaAsistencia() {
  console.log('Generando gráfico M4: Frecuencia de consulta de asistencias...');
  
  // Consulta por instancia
  const resultadosPorInstancia = await prisma.$queryRaw`
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
  
  // Obtener nombres amigables para los usuarios
  const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678' } });
  const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321' } });
  const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344' } });
  
  const labels = resultadosPorInstancia.map(row => {
    if (row.usuario_id === padreActivo?.id) return 'Padre Activo';
    if (row.usuario_id === padreReactivo?.id) return 'Padre Reactivo';
    if (row.usuario_id === docente?.id) return 'Docente';
    return row.usuario_id.substring(0, 8) + '...';
  });
  
  const consultasPorSemana = resultadosPorInstancia.map(row => Number(row.consultas_por_semana));
  const totalConsultas = resultadosPorInstancia.map(row => Number(row.total_consultas));
  
  // Configuración del gráfico
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Consultas por Semana',
          data: consultasPorSemana,
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Total Consultas',
          data: totalConsultas,
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'M4: Frecuencia de Consulta de Asistencias por Instancia',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Consultas por Semana'
          },
          beginAtZero: true
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Total Consultas'
          },
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  };
  
  // Generar y guardar el gráfico
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(path.join(outputDir, 'M4_frecuencia_asistencia.png'), image);
  
  console.log('Gráfico M4 generado.');
}

/**
 * M5: Cantidad de mensajes bidireccionales
 */
async function generarGraficoMensajesBidireccionales() {
  console.log('Generando gráfico M5: Cantidad de mensajes bidireccionales...');
  
  // Consulta por emisor
  const mensajesPorEmisor = await prisma.$queryRaw`
    SELECT 
      emisor_id,
      COUNT(*) AS mensajes_enviados,
      COUNT(DISTINCT conversacion_id) AS conversaciones_activas
    FROM mensajes
    GROUP BY emisor_id
    ORDER BY emisor_id
  `;
  
  // Consulta por conversación
  const mensajesPorConversacion = await prisma.$queryRaw`
    SELECT
      c.id AS conversacion_id,
      c.asunto,
      COUNT(m.id) AS total_mensajes,
      COUNT(DISTINCT m.emisor_id) AS num_emisores,
      MIN(m.fecha_envio) AS fecha_inicio,
      MAX(m.fecha_envio) AS fecha_fin,
      EXTRACT(DAY FROM (MAX(m.fecha_envio) - MIN(m.fecha_envio))) AS duracion_dias
    FROM conversaciones c
    JOIN mensajes m ON c.id = m.conversacion_id
    GROUP BY c.id, c.asunto
    ORDER BY c.id
  `;
  
  // Obtener nombres amigables para los usuarios
  const padreActivo = await prisma.usuario.findFirst({ where: { nro_documento: '12345678' } });
  const padreReactivo = await prisma.usuario.findFirst({ where: { nro_documento: '87654321' } });
  const docente = await prisma.usuario.findFirst({ where: { nro_documento: '11223344' } });
  
  const labelsEmisor = mensajesPorEmisor.map(row => {
    if (row.emisor_id === padreActivo?.id) return 'Padre Activo';
    if (row.emisor_id === padreReactivo?.id) return 'Padre Reactivo';
    if (row.emisor_id === docente?.id) return 'Docente';
    return row.emisor_id.substring(0, 8) + '...';
  });
  
  const mensajesEnviados = mensajesPorEmisor.map(row => Number(row.mensajes_enviados));
  const conversacionesActivas = mensajesPorEmisor.map(row => Number(row.conversaciones_activas));
  
  // Configuración del gráfico de mensajes por emisor
  const configurationEmisor = {
    type: 'bar',
    data: {
      labels: labelsEmisor,
      datasets: [
        {
          label: 'Mensajes Enviados',
          data: mensajesEnviados,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Conversaciones Activas',
          data: conversacionesActivas,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'M5: Mensajes Enviados por Instancia',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Mensajes Enviados'
          },
          beginAtZero: true
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Conversaciones Activas'
          },
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  };
  
  // Generar y guardar el gráfico de mensajes por emisor
  const imageEmisor = await chartJSNodeCanvas.renderToBuffer(configurationEmisor);
  fs.writeFileSync(path.join(outputDir, 'M5_mensajes_por_emisor.png'), imageEmisor);
  
  // Preparar datos para el gráfico de mensajes por conversación
  const labelsConversacion = mensajesPorConversacion.map((row, index) => `Conv ${index + 1}`);
  const totalMensajes = mensajesPorConversacion.map(row => Number(row.total_mensajes));
  const numEmisores = mensajesPorConversacion.map(row => Number(row.num_emisores));
  
  // Configuración del gráfico de mensajes por conversación
  const configurationConversacion = {
    type: 'bar',
    data: {
      labels: labelsConversacion,
      datasets: [
        {
          label: 'Total Mensajes',
          data: totalMensajes,
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Número de Emisores',
          data: numEmisores,
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'M5: Mensajes y Emisores por Conversación',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            afterTitle: function(context) {
              const index = context[0].dataIndex;
              return mensajesPorConversacion[index].asunto;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Total Mensajes'
          },
          beginAtZero: true
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Número de Emisores'
          },
          beginAtZero: true,
          max: 3,
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  };
  
  // Generar y guardar el gráfico de mensajes por conversación
  const imageConversacion = await chartJSNodeCanvas.renderToBuffer(configurationConversacion);
  fs.writeFileSync(path.join(outputDir, 'M5_mensajes_por_conversacion.png'), imageConversacion);
  
  console.log('Gráficos M5 generados.');
}

/**
 * M6: Tiempo promedio de respuesta
 */
async function generarGraficoTiempoRespuesta() {
  console.log('Generando gráfico M6: Tiempo promedio de respuesta...');
  
  // Consulta por rol
  const resultadosPorRol = await prisma.$queryRaw`
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
      ROUND(AVG(horas_respuesta), 2) AS tiempo_promedio_horas,
      ROUND(MIN(horas_respuesta), 2) AS tiempo_minimo_horas,
      ROUND(MAX(horas_respuesta), 2) AS tiempo_maximo_horas
    FROM tiempos_respuesta
    GROUP BY rol_emisor
    ORDER BY rol_emisor
  `;
  
  // Preparar datos para el gráfico
  const labels = resultadosPorRol.map(row => {
    if (row.rol_emisor === 'apoderado') return 'Padres';
    if (row.rol_emisor === 'docente') return 'Docentes';
    return row.rol_emisor;
  });
  
  const tiempoPromedio = resultadosPorRol.map(row => Number(row.tiempo_promedio_horas));
  const tiempoMinimo = resultadosPorRol.map(row => Number(row.tiempo_minimo_horas));
  const tiempoMaximo = resultadosPorRol.map(row => Number(row.tiempo_maximo_horas));
  
  // Configuración del gráfico
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Tiempo Promedio (horas)',
          data: tiempoPromedio,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Tiempo Mínimo (horas)',
          data: tiempoMinimo,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Tiempo Máximo (horas)',
          data: tiempoMaximo,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'M6: Tiempo de Respuesta a Mensajes por Rol',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.raw;
              return `${label}: ${value} horas`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Tiempo (horas)'
          }
        }
      }
    }
  };
  
  // Generar y guardar el gráfico
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(path.join(outputDir, 'M6_tiempo_respuesta.png'), image);
  
  console.log('Gráfico M6 generado.');
}

// Ejecutar el script
main().catch(console.error);