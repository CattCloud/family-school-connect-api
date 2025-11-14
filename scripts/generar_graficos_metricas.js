/**
 * Generador de gráficos a partir de CSV exportados por:
 *  - scripts/extraer_metricas_vi.js (M1–M8)
 *  - scripts/extraer_metricas_vd.js (M9–M14)
 *
 * Uso:
 *   node scripts/generar_graficos_metricas.js
 *
 * Requisitos:
 *   npm i chart.js canvas chartjs-node-canvas
 *
 * Entradas CSV esperadas (creadas en doc/neotesis/resultados por los extractores):
 *   - M1_frec_calificaciones.csv
 *   - M2_frec_asistencia.csv
 *   - M3_cobertura_consulta.csv
 *   - M4_tasa_lectura_comunicados.csv
 *   - M5_tiempo_lectura_comunicados.csv
 *   - M6_tasa_visualizacion_notificaciones.csv
 *   - M7_tasa_participacion_encuestas.csv
 *   - M8_tiempo_resolucion_tickets.csv
 *
 * Salidas PNG:
 *   - doc/tesis/graficos/M{1..8}_*.png
 */

const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Entradas/salidas
const IN_DIR = path.join('doc', 'neotesis', 'resultados');
const OUT_DIR = path.join('doc', 'tesis', 'graficos');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Configuración Chart
const width = 900;
const height = 560;
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  chartCallback: (ChartJS) => {
    ChartJS.defaults.font.family = 'Arial, sans-serif';
    ChartJS.defaults.font.size = 14;
    ChartJS.defaults.color = '#333';
  }
});

function readCSV(filePath) {
  const full = path.join(IN_DIR, filePath);
  if (!fs.existsSync(full)) {
    return { headers: [], rows: [] };
  }
  const txt = fs.readFileSync(full, 'utf8').trim();
  if (!txt) return { headers: [], rows: [] };
  const lines = txt.split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i]));
    return obj;
  });
  return { headers, rows };
}

async function saveChart(config, outName) {
  const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  fs.writeFileSync(path.join(OUT_DIR, outName), buffer);
}

// M1: Accesos a calificaciones (serie temporal Apoderado)
async function chartM1() {
  // Preferir la serie diaria agregada por rol (Apoderado)
  const { rows } = readCSV('M1_series_diaria.csv');
  if (!rows.length) return;

  const labels = rows.map((r) => r.dia);
  const serie = rows.map((r) => Number(r.total_accesos || 0));

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Apoderado',
          data: serie,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          fill: false,
          tension: 0.25
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'M1: Accesos a calificaciones por día (Apoderado)' },
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Accesos por día' } },
        x: { title: { display: true, text: 'Día (D1–D14)' } }
      }
    }
  };
  await saveChart(config, 'M1_series_calificaciones.png');
}

// M2: Accesos a asistencia (serie temporal Apoderado)
async function chartM2() {
  const { rows } = readCSV('M2_series_diaria.csv');
  if (!rows.length) return;

  const labels = rows.map((r) => r.dia);
  const serie = rows.map((r) => Number(r.total_accesos || 0));

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Apoderado',
          data: serie,
          borderColor: 'rgba(255, 205, 86, 1)',
          backgroundColor: 'rgba(255, 205, 86, 0.25)',
          borderWidth: 2,
          fill: false,
          tension: 0.25
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'M2: Accesos a asistencia por día (Apoderado)' },
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Accesos por día' } },
        x: { title: { display: true, text: 'Día (D1–D14)' } }
      }
    }
  };
  await saveChart(config, 'M2_series_asistencia.png');
}

// M3: Cobertura de consulta académica (anillo: consultados vs no consultados)
async function chartM3() {
  const { rows } = readCSV('M3_cobertura_consulta.csv');
  if (!rows.length) return;
  const cc = Number(rows[0].cursos_consultados || 0);
  const total = Number(rows[0].total || 0);
  const noConsultados = Math.max(0, total - cc);

  const config = {
    type: 'doughnut',
    data: {
      labels: ['Cursos consultados', 'Cursos no consultados'],
      datasets: [
        {
          data: [cc, noConsultados],
          backgroundColor: ['rgba(75, 192, 192, 0.85)', 'rgba(201, 203, 207, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(201, 203, 207, 1)'],
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        title: { display: true, text: `M3: Cobertura de consulta académica (${total} cursos)` },
        legend: { position: 'bottom' }
      },
      cutout: '50%'
    }
  };
  await saveChart(config, 'M3_cobertura_consulta.png');
}

// M4: Lectura de comunicados — gráfico apilado (Leídos vs No leídos) + tasa en título
async function chartM4() {
  const { rows } = readCSV('M4_tasa_lectura_comunicados.csv');
  if (!rows.length) return;
  const pub = Number(rows[0].publicados_dirigidos || 0);
  const read = Number(rows[0].leidos || 0);
  const noRead = Math.max(0, pub - read);
  const tasa = pub > 0 ? (read / pub) * 100 : 0;

  const config = {
    type: 'bar',
    data: {
      labels: ['Comunicados'],
      datasets: [
        {
          label: 'Leídos',
          data: [read],
          backgroundColor: 'rgba(54, 162, 235, 0.85)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          stack: 'comunicados'
        },
        {
          label: 'No leídos',
          data: [noRead],
          backgroundColor: 'rgba(201, 203, 207, 0.6)',
          borderColor: 'rgba(201, 203, 207, 1)',
          borderWidth: 1,
          stack: 'comunicados'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `M4: Lectura de comunicados (tasa ${tasa.toFixed(1)}%) — Publicados: ${pub}` },
        legend: { position: 'top' }
      },
      scales: {
        x: { stacked: true },
        y: { beginAtZero: true, stacked: true, title: { display: true, text: 'Cantidad' } }
      }
    }
  };
  await saveChart(config, 'M4_tasa_lectura_comunicados.png');
}

// M5: Tiempo hasta lectura de comunicados (Apoderado) — min/mediana/máximo
async function chartM5() {
  const { rows } = readCSV('M5_tiempo_lectura_comunicados.csv');
  if (!rows.length) return;

  const muestras = Number(rows[0].muestras || 0);
  const min = Number(rows[0].tiempo_min_horas || 0);
  const mediana = Number(rows[0].tiempo_mediana_horas || 0);
  const max = Number(rows[0].tiempo_max_horas || 0);

  const config = {
    type: 'bar',
    data: {
      labels: ['Mínimo', 'Mediana', 'Máximo'],
      datasets: [
        {
          label: `Muestras: ${muestras}`,
          data: [min, mediana, max],
          backgroundColor: [
            'rgba(255, 205, 86, 0.85)',
            'rgba(255, 159, 64, 0.85)',
            'rgba(54, 162, 235, 0.85)'
          ],
          borderColor: [
            'rgba(255, 205, 86, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'M5: Tiempo hasta lectura de comunicados (horas, Apoderado)' },
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Horas' } }
      }
    }
  };
  await saveChart(config, 'M5_tiempo_lectura_comunicados.png');
}

// M6: Visualización de notificaciones — donut (Vistas vs No vistas)
async function chartM6() {
  const { rows } = readCSV('M6_tasa_visualizacion_notificaciones.csv');
  if (!rows.length) return;
  const enviadas = Number(rows[0].enviadas || 0);
  const vistas = Number(rows[0].vistas || 0);
  const noVistas = Math.max(0, enviadas - vistas);
  const tasa = enviadas > 0 ? (vistas / enviadas) * 100 : 0;

  const config = {
    type: 'doughnut',
    data: {
      labels: ['Vistas', 'No vistas'],
      datasets: [
        {
          data: [vistas, noVistas],
          backgroundColor: ['rgba(153, 102, 255, 0.85)', 'rgba(201, 203, 207, 0.6)'],
          borderColor: ['rgba(153, 102, 255, 1)', 'rgba(201, 203, 207, 1)'],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `M6: Visualización de notificaciones (tasa ${tasa.toFixed(1)}%) — Total: ${enviadas}` },
        legend: { position: 'bottom' }
      },
      cutout: '55%'
    }
  };
  await saveChart(config, 'M6_tasa_visualizacion_notificaciones.png');
}

// M7: Participación en encuestas — donut (Respondidas vs No respondidas)
async function chartM7() {
  const { rows } = readCSV('M7_tasa_participacion_encuestas.csv');
  if (!rows.length) return;
  const publicadas = Number(rows[0].encuestas_publicadas || 0);
  const respondidas = Number(rows[0].encuestas_respondidas || 0);
  const noRespondidas = Math.max(0, publicadas - respondidas);
  const tasa = publicadas > 0 ? (respondidas / publicadas) * 100 : 0;

  const config = {
    type: 'doughnut',
    data: {
      labels: ['Respondidas', 'No respondidas'],
      datasets: [
        {
          data: [respondidas, noRespondidas],
          backgroundColor: ['rgba(75, 192, 192, 0.85)', 'rgba(201, 203, 207, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(201, 203, 207, 1)'],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `M7: Participación en encuestas (tasa ${tasa.toFixed(1)}%) — Publicadas: ${publicadas}` },
        legend: { position: 'bottom' }
      },
      cutout: '55%'
    }
  };
  await saveChart(config, 'M7_tasa_participacion_encuestas.png');
}

// M8: Tiempo promedio de resolución de tickets (horas)
async function chartM8() {
  const { rows } = readCSV('M8_tiempo_resolucion_tickets.csv');
  if (!rows.length) return;
  const tickets = Number(rows[0].tickets_resueltos || 0);
  const avg = Number(rows[0].tiempo_promedio_horas || 0);
  const min = Number(rows[0].tiempo_min_horas || 0);
  const max = Number(rows[0].tiempo_max_horas || 0);

  const config = {
    type: 'bar',
    data: {
      labels: ['Promedio', 'Mínimo', 'Máximo'],
      datasets: [
        {
          label: `Tickets resueltos: ${tickets}`,
          data: [avg, min, max],
          backgroundColor: [
            'rgba(255, 99, 132, 0.85)',
            'rgba(255, 205, 86, 0.85)',
            'rgba(54, 162, 235, 0.85)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'M8: Tiempo de resolución de tickets (horas)' },
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Horas' } }
      }
    }
  };
  await saveChart(config, 'M8_tiempo_resolucion_tickets.png');
}

async function main() {
  console.log('Generando gráficos desde CSV en:', IN_DIR);
  await chartM1();
  await chartM2();
  await chartM3();
  await chartM4();
  await chartM5();
  await chartM6();
  await chartM7();
  await chartM8();
  console.log('Gráficos generados en:', OUT_DIR);
}

main().catch((e) => {
  console.error('Error al generar gráficos:', e);
  process.exit(1);
});