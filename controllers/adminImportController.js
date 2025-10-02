'use strict';

const { z } = require('zod');
const {
  getTemplate,
  validateUsers,
  executeImport,
  validateRelationships: svcValidateRelationships,
  createRelationships: svcCreateRelationships,
  verifyRelationships: svcVerifyRelationships,
} = require('../services/importService');

// Caches en memoria (MVP) para enlazar import_id -> resultados, y credentials_id -> dataset a descargar/enviar
const importCache = new Map();        // import_id -> { tipo, exitosos, createdAt }
const credentialsCache = new Map();   // credentials_id -> { import_id, usuarios, createdAt }

// Schemas
const ValidateBodySchema = z.object({
  tipo: z.enum(['padres', 'docentes', 'estudiantes']),
  registros: z.array(z.any()).min(1),
});

const ExecuteBodySchema = z.object({
  tipo: z.enum(['padres', 'docentes', 'estudiantes']),
  registros_validos: z.array(z.any()).min(1),
});

const RelationshipsSchema = z.object({
  relaciones: z
    .array(
      z.object({
        nro_documento_padre: z.string().min(8),
        codigo_estudiante: z.string().min(1),
        tipo_relacion: z.enum(['padre', 'madre', 'apoderado', 'tutor']),
      })
    )
    .min(1),
});

const CredentialsGenerateSchema = z.object({
  usuarios: z.array(
    z.object({
      nro_documento: z.string().min(8),
      nombre: z.string().optional(),
      apellido: z.string().optional(),
      telefono: z.string().optional(),
      rol: z.enum(['apoderado', 'docente']).optional(),
    })
  ),
});

// HU-USERS-06 (v2) - Generar credenciales a partir de un import_id y opcionales de salida
const GenerateCredsV2Schema = z.object({
  import_id: z.string().min(1),
  incluir_excel: z.boolean().optional().default(true),
  incluir_whatsapp: z.boolean().optional().default(false),
  incluir_pdfs: z.boolean().optional().default(false),
});

// GET /admin/templates/:tipo
async function getTemplateController(req, res, next) {
  try {
    const { tipo } = req.params;
    const tpl = getTemplate(tipo);
    return res.status(200).json({ success: true, data: tpl });
  } catch (err) {
    err.status = err.status || 400;
    next(err);
  }
}

// POST /admin/import/validate
async function validateImportController(req, res, next) {
  try {
    const { tipo, registros } = ValidateBodySchema.parse(req.body || {});
    const result = await validateUsers(tipo, registros);
    // Retornamos un id de validación simulado para pruebas
    return res.status(200).json({
      success: true,
      data: {
        validacion_id: `val_${Date.now()}`,
        tipo,
        ...result,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// POST /admin/import/execute
async function executeImportController(req, res, next) {
  try {
    const { tipo, registros_validos } = ExecuteBodySchema.parse(req.body || {});
    const importId = `imp_${Date.now()}`;
    const result = await executeImport(tipo, registros_validos);

    // Cachear resultados del import para HU-USERS-06 (generación de credenciales)
    importCache.set(importId, {
      tipo,
      exitosos: result.exitosos, // incluye password_inicial para padres/docentes
      createdAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: {
        import_id: importId,
        resumen: result.resumen,
        detalles_por_tipo:
          tipo === 'padres'
            ? { padres_creados: result.resumen.exitosos }
            : tipo === 'docentes'
            ? { docentes_creados: result.resumen.exitosos }
            : { estudiantes_creados: result.resumen.exitosos },
        exitosos: result.exitosos,
        fallidos: result.fallidos,
        año_academico: result.año_academico,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// POST /admin/import/validate-relationships
async function validateRelationshipsController(req, res, next) {
  try {
    const { relaciones } = RelationshipsSchema.parse(req.body || {});
    const data = await svcValidateRelationships(relaciones);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// POST /admin/import/create-relationships
async function createRelationshipsController(req, res, next) {
  try {
    const { relaciones } = RelationshipsSchema.parse(req.body || {});
    const data = await svcCreateRelationships(relaciones);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// GET /admin/verify/relationships
async function verifyRelationshipsController(_req, res, next) {
  try {
    const data = await svcVerifyRelationships();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// POST /admin/import/credentials/generate
async function generateCredentialsController(req, res, next) {
  try {
    const { usuarios } = CredentialsGenerateSchema.parse(req.body || {});
    // No generamos Excel en pruebas; devolvemos estructura con conteo y filas simuladas
    const rows = usuarios.slice(0, 20).map((u) => ({
      nombre_completo: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
      rol: u.rol || 'apoderado',
      usuario: u.nro_documento,
      password_inicial: '********', // no exponer
      telefono: u.telefono || '',
      fecha_creacion: new Date().toISOString(),
    }));
    return res.status(200).json({
      success: true,
      data: {
        credentials_id: `cred_${Date.now()}`,
        total_credenciales: rows.length,
        excel_preview: rows,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// POST /admin/import/generate-credentials (v2) - basado en import_id
async function generateCredentialsV2Controller(req, res, next) {
  try {
    const { import_id, incluir_excel, incluir_whatsapp, incluir_pdfs } = GenerateCredsV2Schema.parse(req.body || {});

    const cached = importCache.get(import_id);
    if (!cached) {
      const e = new Error('Import no encontrado o expirado');
      e.status = 404;
      e.code = 'IMPORT_NOT_FOUND';
      throw e;
    }

    // Elegibles: solo quienes tienen usuario del sistema (padres/docentes) con password_inicial
    const elegibles = (cached.exitosos || []).filter((u) => !!u?.nro_documento && !!u?.password_inicial);

    const credentials_id = `cred_${Date.now()}`;
    const rows = elegibles.map((u) => ({
      nombre_completo: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
      rol: u.rol || '',
      tipo_documento: 'DNI', // MVP: asumido; extender si se requiere
      usuario: u.nro_documento,
      password_inicial: '********', // no exponer en descarga directa
      telefono: u.telefono || '',
      fecha_creacion: new Date().toISOString(),
      estado: 'Activo',
    }));

    // Cacheamos dataset para posteriores descargas/envíos
    credentialsCache.set(credentials_id, {
      import_id,
      usuarios: elegibles,
      rows,
      createdAt: Date.now(),
      incluir_excel,
      incluir_whatsapp,
      incluir_pdfs,
    });

    return res.status(200).json({
      success: true,
      data: {
        credentials_id,
        total_credenciales: rows.length,
        archivo_excel_url: `/admin/import/credentials/${credentials_id}/download`,
        pdfs_zip_url: null,
        fecha_generacion: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      err.status = 400;
      err.code = 'INVALID_INPUT';
    }
    next(err);
  }
}

// GET /admin/import/credentials/:credentials_id/download
async function downloadCredentialsController(req, res, next) {
  try {
    const { credentials_id } = req.params || {};
    const cached = credentialsCache.get(credentials_id);
    if (!cached) {
      const e = new Error('Credenciales no encontradas');
      e.status = 404;
      e.code = 'CREDENTIALS_NOT_FOUND';
      throw e;
    }
    // MVP: devolvemos JSON con "excel_preview" (no se genera archivo real)
    return res.status(200).json({
      success: true,
      data: {
        credentials_id,
        total_credenciales: cached.rows.length,
        excel_preview: cached.rows,
        generated_from_import: cached.import_id,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/import/credentials/:credentials_id/send-whatsapp
async function sendCredentialsWhatsAppV2Controller(req, res, next) {
  try {
    const { credentials_id } = req.params || {};
    const body = req.body || {};
    const usuariosSeleccionados = Array.isArray(body.usuarios_seleccionados) ? body.usuarios_seleccionados : null;

    const cached = credentialsCache.get(credentials_id);
    if (!cached) {
      const e = new Error('Credenciales no encontradas');
      e.status = 404;
      e.code = 'CREDENTIALS_NOT_FOUND';
      throw e;
    }
    const allUsers = cached.usuarios || [];
    const selected = usuariosSeleccionados
      ? allUsers.filter((u) => usuariosSeleccionados.includes(u.id) || usuariosSeleccionados.includes(u.nro_documento))
      : allUsers;

    const total = selected.length;
    const exitosos = total; // MVP: simulación
    const fallidos = 0;

    return res.status(200).json({
      success: true,
      data: {
        total_envios: total,
        exitosos,
        fallidos,
        detalles_fallidos: [],
        tiempo_procesamiento: '0s',
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/import/credentials/:credentials_id/generate-pdfs
async function generatePdfsController(req, res, next) {
  try {
    const { credentials_id } = req.params || {};
    const cached = credentialsCache.get(credentials_id);
    if (!cached) {
      const e = new Error('Credenciales no encontradas');
      e.status = 404;
      e.code = 'CREDENTIALS_NOT_FOUND';
      throw e;
    }
    const total = (cached.usuarios || []).length;
    // MVP: simulación con URLs ficticias
    const pdfs_individuales = (cached.usuarios || []).slice(0, 5).map((u) => ({
      usuario_id: u.id || u.nro_documento,
      pdf_url: `/admin/import/credentials/${credentials_id}/${encodeURIComponent(u.id || u.nro_documento)}.pdf`,
    }));

    return res.status(200).json({
      success: true,
      data: {
        total_pdfs: total,
        zip_url: `/admin/import/credentials/${credentials_id}/pdfs.zip`,
        pdfs_individuales,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/import/credentials/send-whatsapp
async function sendCredentialsWhatsAppController(req, res, next) {
  try {
    const body = req.body || {};
    const usuarios = Array.isArray(body.usuarios_seleccionados) ? body.usuarios_seleccionados : [];
    // Para pruebas: simular entrega sin golpear API externa
    const total = usuarios.length || 0;
    const exitosos = usuarios.slice(0, total).length;
    const fallidos = 0;
    return res.status(200).json({
      success: true,
      data: {
        total_envios: total,
        exitosos,
        fallidos,
        detalles_fallidos: [],
        tiempo_procesamiento: '0s',
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTemplateController,
  validateImportController,
  executeImportController,
  validateRelationshipsController,
  createRelationshipsController,
  verifyRelationshipsController,
  // Versiones anteriores (compatibilidad de pruebas)
  generateCredentialsController,
  sendCredentialsWhatsAppController,
  // HU-USERS-06 (v2) endpoints
  generateCredentialsV2Controller,
  downloadCredentialsController,
  sendCredentialsWhatsAppV2Controller,
  generatePdfsController,
};