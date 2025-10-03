'use strict';

/**
 * Servicio Excel (exceljs) - Generación y Lectura
 * - Plantillas reales (.xlsx) para Calificaciones y Asistencias
 * - Parsing/validación básica de archivos subidos (estructura y reglas de negocio mínimas)
 *
 * NOTA:
 * Este servicio no modifica controladores existentes (MVP simulado).
 * Próximo paso: integrar estos métodos en gradesService/attendanceService y controllers
 * para reemplazar generación/validación simuladas.
 */

const ExcelJS = require('exceljs');
const prisma = require('../config/prisma');

// ===================== Utiles y Constantes =====================

const ESTADOS_ASISTENCIA = [
  'presente',
  'tardanza',
  'permiso',
  'falta_justificada',
  'falta_injustificada',
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentAcademicYear() {
  const forced = process.env.ACADEMIC_YEAR && parseInt(process.env.ACADEMIC_YEAR, 10);
  return Number.isFinite(forced) ? forced : new Date().getFullYear();
}

function httpError(code, message, status = 400) {
  const e = new Error(message || code);
  e.code = code;
  e.status = status;
  return e;
}

function normalizeStr(v) {
  return (v == null ? '' : String(v)).trim();
}

function toNumberOrNull(v) {
  if (v === '' || v == null) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function isValidHHMM(v) {
  if (!v) return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(v).trim());
}

function isYYYYMMDD(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s).trim());
}

/**
 * Extrae metadatos de la hoja "Calificaciones" colocados en A3 con el formato:
 * "componente_id=... | trimestre=... | fecha_evaluacion=YYYY-MM-DD"
 */
function parseCalificacionesMeta(ws) {
  try {
    const raw = ws.getCell('A3')?.value ? String(ws.getCell('A3').value) : '';
    const parts = raw.split('|').map((p) => String(p || '').trim());
    const meta = {};
    for (const part of parts) {
      const [k, v] = String(part).split('=').map((t) => String(t || '').trim());
      if (!k) continue;
      if (k.includes('componente_id')) meta.componente_id = v || null;
      else if (k.includes('trimestre')) {
        const n = Number(v);
        meta.trimestre = Number.isFinite(n) ? n : null;
      } else if (k.includes('fecha_evaluacion')) {
        meta.fecha_evaluacion = v || null;
      }
    }
    return meta;
  } catch {
    return {};
  }
}

function isYYYYMMDD(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s).trim());
}

/**
 * Extrae metadatos de la hoja "Asistencias" colocados en A3 con el formato:
 * "fecha=YYYY-MM-DD"
 */
function parseAsistenciasMeta(ws) {
  try {
    const raw = ws.getCell('A3')?.value ? String(ws.getCell('A3').value) : '';
    const parts = raw.split('|').map((p) => String(p || '').trim());
    const meta = {};
    for (const part of parts) {
      const [k, v] = String(part).split('=').map((t) => String(t || '').trim());
      if (!k) continue;
      if (k.includes('fecha')) meta.fecha = v || null;
    }
    return meta;
  } catch {
    return {};
  }
}

 // ===================== Generación de Plantillas =====================

/**
 * Genera plantilla real de Calificaciones (.xlsx)
 * Hoja: "Calificaciones"
 * Columnas:
 *  - codigo_estudiante (texto)
 *  - nombre_completo (texto)
 *  - calificacion (número 0-20)
 *  - observaciones (texto)
 *
 * @param {Object} params
 *  - curso_id, nivel_grado_id, trimestre, componente_id, año_academico?
 * @returns {Promise<{buffer: Buffer, filename: string}>}
 */
async function generateGradesTemplateExcel(params) {
  const {
    curso_id,
    nivel_grado_id,
    trimestre,
    componente_id,
    año_academico,
  } = params || {};
  const year = año_academico || getCurrentAcademicYear();

  if (!curso_id || !nivel_grado_id || !trimestre || !componente_id) {
    throw httpError(
      'MISSING_REQUIRED_FIELDS',
      'curso_id, nivel_grado_id, trimestre y componente_id son requeridos',
      400
    );
  }

  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year },
    select: {
      id: true,
      nombre: true,
      nivel_grado: { select: { nivel: true, grado: true } },
    },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'El curso/nivel_grado no existe para el año académico', 400);
  }

  const estudiantes = await prisma.estudiante.findMany({
    where: { nivel_grado_id, año_academico: year, estado_matricula: 'activo' },
    select: { codigo_estudiante: true, nombre: true, apellido: true },
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'family-school-connect-api';
  wb.created = new Date();

  // Hoja de datos
  const ws = wb.addWorksheet('Calificaciones', {
    properties: { defaultRowHeight: 18 },
    pageSetup: { paperSize: 9, orientation: 'portrait' },
  });

  // Encabezado informativo (fila 1-3)
  ws.getCell('A1').value = 'PLANTILLA CALIFICACIONES';
  ws.getCell('A2').value = `Curso: ${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`;
  ws.getCell('A3').value = `componente_id=${componente_id} | trimestre=${trimestre} | fecha_evaluacion=${todayISO()}`;
  ws.mergeCells('A1:D1');
  ws.mergeCells('A2:D2');
  ws.mergeCells('A3:D3');
  ws.getRow(1).font = { bold: true, size: 12 };
  ws.getRow(2).font = { italic: true };
  ws.getRow(3).font = { italic: true };
  ws.addRow([]);

  // Fila de headers (fila 5)
  const headers = ['codigo_estudiante', 'nombre_completo', 'calificacion', 'observaciones'];
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFECEFF1' },
    };
  });

  // Columnas
  ws.columns = [
    { key: 'codigo_estudiante', width: 20 },
    { key: 'nombre_completo', width: 36 },
    { key: 'calificacion', width: 14 },
    { key: 'observaciones', width: 40 },
  ];

  // Datos
  estudiantes.forEach((e) => {
    const nombre = `${normalizeStr(e.nombre)} ${normalizeStr(e.apellido)}`.trim();
    ws.addRow([e.codigo_estudiante, nombre, null, null]);
  });

  // Validación numérica 0-20 para calificacion (columna C)
  const startRow = headerRow.number + 1;
  const endRow = ws.rowCount;
  for (let r = startRow; r <= endRow; r++) {
    const cell = ws.getCell(`C${r}`);
    cell.dataValidation = {
      type: 'decimal',
      operator: 'between',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [0, 20],
      errorStyle: 'stop',
      error: 'La calificación debe estar entre 0 y 20',
      promptTitle: 'Rango permitido',
      prompt: 'Ingrese un valor entre 0 y 20 (decimales permitidos)',
    };
  }

  // Estética
  ws.getColumn(1).alignment = { horizontal: 'left' };
  ws.getColumn(2).alignment = { horizontal: 'left' };
  ws.getColumn(3).alignment = { horizontal: 'center' };
  ws.getColumn(4).alignment = { horizontal: 'left' };

  const filename = `Calificaciones_${curso.nombre.replace(/\s+/g, '')}_${curso.nivel_grado.grado}${curso.nivel_grado.nivel}_${todayISO()}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer), filename };
}

/**
 * Genera plantilla real de Asistencias (.xlsx)
 * Hoja: "Asistencias"
 * Columnas:
 *  - codigo_estudiante, nombre_completo, estado, hora_llegada, justificacion
 *  - estado con validación de lista
 *  - hora_llegada formato HH:MM (validación suave mediante comentario)
 *
 * @param {Object} params
 *  - curso_id, nivel_grado_id, fecha, año_academico?
 * @returns {Promise<{buffer: Buffer, filename: string}>}
 */
async function generateAttendanceTemplateExcel(params) {
  const { curso_id, nivel_grado_id, fecha, año_academico } = params || {};
  const year = año_academico || getCurrentAcademicYear();

  if (!curso_id || !nivel_grado_id || !fecha) {
    throw httpError('MISSING_REQUIRED_FIELDS', 'curso_id, nivel_grado_id y fecha son requeridos', 400);
  }

  const curso = await prisma.curso.findFirst({
    where: { id: curso_id, nivel_grado_id, año_academico: year },
    select: {
      id: true,
      nombre: true,
      nivel_grado: { select: { nivel: true, grado: true } },
    },
  });
  if (!curso) {
    throw httpError('INVALID_PARAMETERS', 'El curso/nivel_grado no existe para el año académico', 400);
  }

  const estudiantes = await prisma.estudiante.findMany({
    where: { nivel_grado_id, año_academico: year, estado_matricula: 'activo' },
    select: { codigo_estudiante: true, nombre: true, apellido: true },
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'family-school-connect-api';
  wb.created = new Date();

  const ws = wb.addWorksheet('Asistencias', {
    properties: { defaultRowHeight: 18 },
    pageSetup: { paperSize: 9, orientation: 'portrait' },
  });

  ws.getCell('A1').value = 'PLANTILLA ASISTENCIAS';
  ws.getCell('A2').value = `Curso: ${curso.nombre} - ${curso.nivel_grado.grado} ${curso.nivel_grado.nivel}`;
  ws.getCell('A3').value = `fecha=${fecha}`;
  ws.mergeCells('A1:E1');
  ws.mergeCells('A2:E2');
  ws.mergeCells('A3:E3');
  ws.getRow(1).font = { bold: true, size: 12 };
  ws.getRow(2).font = { italic: true };
  ws.getRow(3).font = { italic: true };
  ws.addRow([]);

  const headers = ['codigo_estudiante', 'nombre_completo', 'estado', 'hora_llegada', 'justificacion'];
  const headerRow = ws.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFECEFF1' },
    };
  });

  ws.columns = [
    { key: 'codigo_estudiante', width: 20 },
    { key: 'nombre_completo', width: 36 },
    { key: 'estado', width: 22 },
    { key: 'hora_llegada', width: 14 },
    { key: 'justificacion', width: 40 },
  ];

  estudiantes.forEach((e) => {
    const nombre = `${normalizeStr(e.nombre)} ${normalizeStr(e.apellido)}`.trim();
    ws.addRow([e.codigo_estudiante, nombre, 'presente', '', '']);
  });

  // Validación lista para "estado"
  const startRow = headerRow.number + 1;
  const endRow = ws.rowCount;
  for (let r = startRow; r <= endRow; r++) {
    ws.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      showErrorMessage: true,
      formulae: [`"${ESTADOS_ASISTENCIA.join(',')}"`],
      error: 'Estado inválido',
      promptTitle: 'Estados válidos',
      prompt: ESTADOS_ASISTENCIA.join(', '),
    };
  }

  // Nota sobre hora_llegada = HH:MM solo si estado=tardanza
  ws.getCell('D5').note = 'Formato HH:MM (24h). Requerido si estado=tardanza';

  const filename = `Asistencias_${curso.nombre.replace(/\s+/g, '')}_${curso.nivel_grado.grado}${curso.nivel_grado.nivel}_${fecha}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer), filename };
}

// ===================== Parsing/Validación de Archivos =====================

/**
 * Parse/valida archivo de calificaciones:
 * - Verifica headers esperados
 * - Valida calificación 0-20 (si presente)
 * - Opcional: verifica existencia de estudiante en curso si se proveen curso_id, nivel_grado_id, año_academico
 *
 * @param {Buffer} buffer
 * @param {Object} options
 *  - curso_id?, nivel_grado_id?, año_academico?
 * @returns {Promise<{resumen, registros_validos, registros_con_errores}>}
 */
async function parseGradesFile(buffer, options = {}) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.getWorksheet('Calificaciones') || wb.worksheets[0];
  if (!ws) {
    throw httpError('INVALID_FILE_FORMAT', 'No se encontró hoja de calificaciones', 400);
  }

  // Metadatos de la plantilla (A3)
  const meta = parseCalificacionesMeta(ws);

  // Detectar fila de headers: buscar fila que contenga exactamente los headers esperados
  const expectedHeaders = ['codigo_estudiante', 'nombre_completo', 'calificacion', 'observaciones'];
  let headerRowIdx = null;
  for (let i = 1; i <= ws.rowCount; i++) {
    const r = ws.getRow(i);
    const values = r.values
      .map((v) => (typeof v === 'object' && v && v.text ? v.text : v))
      .map((t) => String(t ?? '').trim());
    if (values.includes('codigo_estudiante') && values.includes('calificacion')) {
      headerRowIdx = i;
      break;
    }
  }
  if (!headerRowIdx) {
    throw httpError('INVALID_TEMPLATE_STRUCTURE', 'No se encontraron encabezados esperados', 400);
  }

  const headerRow = ws.getRow(headerRowIdx);

  // Mapa de encabezados -> índice de columna
  const headerMap = {};
  headerRow.eachCell((cell, colNumber) => {
    headerMap[String(cell.value ?? '').trim()] = colNumber;
  });

  const colCodigo = headerMap['codigo_estudiante'];
  const colNombre = headerMap['nombre_completo'];
  const colNota = headerMap['calificacion'];
  const colObs = headerMap['observaciones'];

  // Validación estricta de estructura: orden y nombres exactos (case-sensitive)
  const isExactOrder =
    colCodigo === 1 &&
    colNombre === 2 &&
    colNota === 3 &&
    colObs === 4 &&
    String(headerRow.getCell(1).value).trim() === 'codigo_estudiante' &&
    String(headerRow.getCell(2).value).trim() === 'nombre_completo' &&
    String(headerRow.getCell(3).value).trim() === 'calificacion' &&
    String(headerRow.getCell(4).value).trim() === 'observaciones';

  if (!isExactOrder) {
    throw httpError('INVALID_TEMPLATE_STRUCTURE', 'La estructura del archivo no coincide con la plantilla del componente', 400);
  }

  const registros_validos = [];
  const registros_con_errores = [];
  const year = options.año_academico || getCurrentAcademicYear();

  // Construir set de estudiantes válidos (opcional)
  let validCodes = null;
  if (options.curso_id && options.nivel_grado_id) {
    const ests = await prisma.estudiante.findMany({
      where: { nivel_grado_id: options.nivel_grado_id, año_academico: year, estado_matricula: 'activo' },
      select: { codigo_estudiante: true },
      orderBy: [{ codigo_estudiante: 'asc' }],
    });
    validCodes = new Set(ests.map((e) => e.codigo_estudiante));
  }

  // Duplicados dentro del archivo
  const seenCodes = new Set();

  for (let r = headerRowIdx + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const rawCodigo = row.getCell(1).value;
    const rawNombre = row.getCell(2).value;
    const rawNota = row.getCell(3).value;
    const rawObs = row.getCell(4).value;

    // Fila vacía (sin código y sin nombre)
    if (rawCodigo == null && rawNombre == null) {
      continue;
    }

    const codigo = normalizeStr(rawCodigo);
    const nombre = normalizeStr(rawNombre);
    const obs = normalizeStr(rawObs);
    const califNumber = toNumberOrNull(rawNota);

    const errores = [];

    // Requeridos
    if (!codigo) {
      errores.push({ campo: 'codigo_estudiante', valor: '', mensaje: 'Requerido' });
    }

    // Calificación obligatoria
    if (rawNota == null || String(rawNota).trim() === '') {
      errores.push({ campo: 'calificacion', valor: '', mensaje: 'Calificación es obligatoria' });
    } else if (califNumber == null || Number.isNaN(Number(califNumber))) {
      errores.push({ campo: 'calificacion', valor: String(rawNota), mensaje: 'Calificación debe ser numérica' });
    } else if (califNumber < 0 || califNumber > 20) {
      errores.push({ campo: 'calificacion', valor: String(rawNota), mensaje: 'Calificación fuera de rango (debe ser 0–20)' });
    }

    // Pertenencia al curso (si se solicitó)
    if (validCodes && codigo && !validCodes.has(codigo)) {
      errores.push({ campo: 'codigo_estudiante', valor: codigo, mensaje: 'El estudiante no pertenece a este curso' });
    }

    // Duplicados en el archivo
    if (codigo) {
      if (seenCodes.has(codigo)) {
        errores.push({ campo: 'codigo_estudiante', valor: codigo, mensaje: 'Código de estudiante duplicado en el archivo' });
      } else {
        seenCodes.add(codigo);
      }
    }

    if (errores.length > 0) {
      registros_con_errores.push({
        fila: r,
        codigo_estudiante: codigo,
        nombre_completo: nombre,
        errores,
      });
    } else {
      registros_validos.push({
        fila: r,
        codigo_estudiante: codigo,
        nombre_completo: nombre,
        calificacion: Number(califNumber),
        observaciones: obs || null,
      });
    }
  }

  return {
    meta: {
      componente_id: meta.componente_id || null,
      trimestre: meta.trimestre ?? null,
      fecha_evaluacion: meta.fecha_evaluacion || null,
      fecha_valida: meta.fecha_evaluacion ? isYYYYMMDD(meta.fecha_evaluacion) : false,
    },
    resumen: {
      total_filas: registros_validos.length + registros_con_errores.length,
      validos: registros_validos.length,
      con_errores: registros_con_errores.length,
    },
    registros_validos,
    registros_con_errores,
  };
}

/**
 * Parse/valida archivo de asistencias:
 * - Verifica headers esperados
 * - Valida estado ∈ lista, hora_llegada HH:MM si estado=tardanza
 * - Opcional: verifica existencia de estudiante en curso
 *
 * @param {Buffer} buffer
 * @param {Object} options
 *  - curso_id?, nivel_grado_id?, año_academico?
 * @returns {Promise<{resumen, registros_validos, registros_con_errores, advertencias}>}
 */
async function parseAttendanceFile(buffer, options = {}) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.getWorksheet('Asistencias') || wb.worksheets[0];
  if (!ws) {
    throw httpError('INVALID_FILE_FORMAT', 'No se encontró hoja de asistencias', 400);
  }

  // Metadatos (A3): "fecha=YYYY-MM-DD"
  const meta = parseAsistenciasMeta(ws);

  // Detectar fila de headers y validar estructura exacta
  const expectedHeaders = ['codigo_estudiante', 'nombre_completo', 'estado', 'hora_llegada', 'justificacion'];
  let headerRowIdx = null;
  for (let i = 1; i <= ws.rowCount; i++) {
    const r = ws.getRow(i);
    const values = r.values
      .map((v) => (typeof v === 'object' && v && v.text ? v.text : v))
      .map((t) => String(t ?? '').trim());
    if (values.includes('codigo_estudiante') && values.includes('estado')) {
      headerRowIdx = i;
      break;
    }
  }
  if (!headerRowIdx) {
    throw httpError('INVALID_TEMPLATE_STRUCTURE', 'No se encontraron encabezados esperados', 400);
  }

  const headerRow = ws.getRow(headerRowIdx);
  const headerMap = {};
  headerRow.eachCell((cell, colNumber) => {
    headerMap[String(cell.value ?? '').trim()] = colNumber;
  });

  const colCodigo = headerMap['codigo_estudiante'];
  const colNombre = headerMap['nombre_completo'];
  const colEstado = headerMap['estado'];
  const colHora = headerMap['hora_llegada'];
  const colJust = headerMap['justificacion'];

  // Estructura estricta: orden y nombres exactos (case-sensitive)
  const isExactOrder =
    colCodigo === 1 &&
    colNombre === 2 &&
    colEstado === 3 &&
    colHora === 4 &&
    colJust === 5 &&
    String(headerRow.getCell(1).value).trim() === 'codigo_estudiante' &&
    String(headerRow.getCell(2).value).trim() === 'nombre_completo' &&
    String(headerRow.getCell(3).value).trim() === 'estado' &&
    String(headerRow.getCell(4).value).trim() === 'hora_llegada' &&
    String(headerRow.getCell(5).value).trim() === 'justificacion';

  if (!isExactOrder) {
    throw httpError('INVALID_TEMPLATE_STRUCTURE', 'La estructura del archivo no coincide con la plantilla de asistencia', 400);
  }

  const registros_validos = [];
  const registros_con_errores = [];
  const advertencias = [];
  const year = options.año_academico || getCurrentAcademicYear();

  // Construir set de estudiantes válidos (opcional)
  let validCodes = null;
  if (options.curso_id && options.nivel_grado_id) {
    const ests = await prisma.estudiante.findMany({
      where: { nivel_grado_id: options.nivel_grado_id, año_academico: year, estado_matricula: 'activo' },
      select: { codigo_estudiante: true },
      orderBy: [{ codigo_estudiante: 'asc' }],
    });
    validCodes = new Set(ests.map((e) => e.codigo_estudiante));
  }

  // Duplicados dentro del archivo
  const seenCodes = new Set();

  for (let r = headerRowIdx + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const rawCodigo = row.getCell(1).value;
    const rawNombre = row.getCell(2).value;
    const rawEstado = row.getCell(3).value;
    const rawHora = row.getCell(4).value;
    const rawJust = row.getCell(5).value;

    // Fila vacía
    if (rawCodigo == null && rawNombre == null) continue;

    const codigo = normalizeStr(rawCodigo);
    const nombre = normalizeStr(rawNombre);
    const estado = normalizeStr(rawEstado).toLowerCase();
    const hora = normalizeStr(rawHora);
    const just = normalizeStr(rawJust);

    const errores = [];

    if (!codigo) {
      errores.push({ campo: 'codigo_estudiante', valor: '', mensaje: 'Requerido' });
    }

    if (!estado || !ESTADOS_ASISTENCIA.includes(estado)) {
      errores.push({
        campo: 'estado',
        valor: String(rawEstado || ''),
        mensaje: 'Estado inválido. Valores válidos: Presente, Tardanza, Permiso, Falta Justificada, Falta Injustificada',
      });
    }

    // Reglas de hora
    if (estado !== 'tardanza' && hora) {
      errores.push({
        campo: 'hora_llegada',
        valor: hora,
        mensaje: 'Hora de llegada especificada pero estado no es "Tardanza"',
      });
    }
    if (estado === 'tardanza') {
      if (!hora) {
        errores.push({
          campo: 'hora_llegada',
          valor: '',
          mensaje: 'Hora de llegada es obligatoria para tardanzas (HH:MM)',
        });
      } else if (!isValidHHMM(hora)) {
        errores.push({
          campo: 'hora_llegada',
          valor: hora,
          mensaje: 'Formato de hora inválido. Formato correcto: HH:MM (06:00-18:00)',
        });
      } else {
        const [hh, mm] = hora.split(':').map((n) => parseInt(n, 10));
        if (hh < 6 || (hh > 18) || (hh === 18 && mm > 0)) {
          errores.push({
            campo: 'hora_llegada',
            valor: hora,
            mensaje: 'Hora de llegada fuera del horario escolar (06:00-18:00)',
          });
        }
      }
    }

    // Pertenencia al curso (si se solicitó)
    if (validCodes && codigo && !validCodes.has(codigo)) {
      errores.push({ campo: 'codigo_estudiante', valor: codigo, mensaje: 'No pertenece al curso/nivel indicado' });
    }

    // Duplicados en el archivo
    if (codigo) {
      if (seenCodes.has(codigo)) {
        errores.push({ campo: 'codigo_estudiante', valor: codigo, mensaje: 'Código de estudiante duplicado en el archivo' });
      } else {
        seenCodes.add(codigo);
      }
    }

    if (errores.length > 0) {
      registros_con_errores.push({
        fila: r,
        codigo_estudiante: codigo,
        nombre_completo: nombre,
        errores,
      });
    } else {
      registros_validos.push({
        fila: r,
        codigo_estudiante: codigo,
        nombre_completo: nombre,
        estado,
        hora_llegada: estado === 'tardanza' ? hora : null,
        justificacion: just || null,
      });
    }
  }

  return {
    meta: {
      fecha: meta.fecha || null,
      fecha_valida: meta.fecha ? isYYYYMMDD(meta.fecha) : false,
    },
    resumen: {
      total_filas: registros_validos.length + registros_con_errores.length,
      validos: registros_validos.length,
      con_errores: registros_con_errores.length,
    },
    registros_validos,
    registros_con_errores,
    advertencias,
  };
}

module.exports = {
  // Generación de plantillas
  generateGradesTemplateExcel,
  generateAttendanceTemplateExcel,

  // Parsing/validación
  parseGradesFile,
  parseAttendanceFile,

  // utilidades expuestas
  ESTADOS_ASISTENCIA,
  getCurrentAcademicYear,
};