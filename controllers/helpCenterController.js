'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

class HelpCenterController {
  // HU-SOP-04: Obtener FAQs
  async obtenerFAQs(req, res) {
    try {
      const { categoria_id, busqueda, pagina = 1, limite = 20 } = req.query;

      const where = { activa: true };
      
      if (categoria_id) where.categoria_id = categoria_id;
      
      if (busqueda) {
        where.OR = [
          { pregunta: { contains: busqueda, mode: 'insensitive' } },
          { respuesta: { contains: busqueda, mode: 'insensitive' } }
        ];
      }

      const [faqs, total] = await Promise.all([
        prisma.fAQ.findMany({
          where,
          include: {
            categoria: {
              select: { id: true, nombre: true, icono: true, color: true }
            }
          },
          orderBy: { orden: 'asc' },
          skip: (pagina - 1) * limite,
          take: parseInt(limite)
        }),
        prisma.fAQ.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          faqs,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / limite),
            total_resultados: total,
            limite: parseInt(limite)
          }
        }
      });
    } catch (error) {
      logger.error('Error al obtener FAQs:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las FAQs' }
      });
    }
  }

  // HU-SOP-04: Obtener detalle de FAQ
  async obtenerDetalleFAQ(req, res) {
    try {
      const { id } = req.params;

      const faq = await prisma.fAQ.findUnique({
        where: { id, activa: true },
        include: {
          categoria: {
            select: { id: true, nombre: true, icono: true, color: true }
          }
        }
      });

      if (!faq) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'FAQ no encontrada' }
        });
      }

      // Incrementar contador de vistas
      await prisma.fAQ.update({
        where: { id },
        data: { vistas: { increment: 1 } }
      });

      res.json({
        success: true,
        data: { faq }
      });
    } catch (error) {
      logger.error('Error al obtener detalle de FAQ:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el detalle de la FAQ' }
      });
    }
  }

  // HU-SOP-04: Obtener categorías de FAQs
  async obtenerCategoriasFAQ(req, res) {
    try {
      const categorias = await prisma.categoriaFAQ.findMany({
        include: {
          _count: {
            select: { preguntas: { where: { activa: true } } }
          }
        },
        orderBy: { nombre: 'asc' }
      });

      res.json({
        success: true,
        data: { categorias }
      });
    } catch (error) {
      logger.error('Error al obtener categorías de FAQ:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las categorías' }
      });
    }
  }

  // HU-SOP-04: Obtener guías
  async obtenerGuias(req, res) {
    try {
      const { categoria_id, busqueda, pagina = 1, limite = 20 } = req.query;

      const where = { activa: true };
      
      if (categoria_id) where.categoria_id = categoria_id;
      
      if (busqueda) {
        where.OR = [
          { titulo: { contains: busqueda, mode: 'insensitive' } },
          { descripcion: { contains: busqueda, mode: 'insensitive' } }
        ];
      }

      const [guias, total] = await Promise.all([
        prisma.guia.findMany({
          where,
          include: {
            categoria: {
              select: { id: true, nombre: true, icono: true, color: true }
            }
          },
          orderBy: { titulo: 'asc' },
          skip: (pagina - 1) * limite,
          take: parseInt(limite)
        }),
        prisma.guia.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          guias,
          paginacion: {
            pagina_actual: parseInt(pagina),
            total_paginas: Math.ceil(total / limite),
            total_resultados: total,
            limite: parseInt(limite)
          }
        }
      });
    } catch (error) {
      logger.error('Error al obtener guías:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las guías' }
      });
    }
  }

  // HU-SOP-04: Obtener detalle de guía
  async obtenerDetalleGuia(req, res) {
    try {
      const { id } = req.params;

      const guia = await prisma.guia.findUnique({
        where: { id, activa: true },
        include: {
          categoria: {
            select: { id: true, nombre: true, icono: true, color: true }
          }
        }
      });

      if (!guia) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Guía no encontrada' }
        });
      }

      // Incrementar contador de descargas
      await prisma.guia.update({
        where: { id },
        data: { descargas: { increment: 1 } }
      });

      res.json({
        success: true,
        data: { guia }
      });
    } catch (error) {
      logger.error('Error al obtener detalle de guía:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el detalle de la guía' }
      });
    }
  }

  // HU-SOP-04: Obtener categorías de guías
  async obtenerCategoriasGuias(req, res) {
    try {
      const categorias = await prisma.categoriaGuia.findMany({
        include: {
          _count: {
            select: { guias: { where: { activa: true } } }
          }
        },
        orderBy: { nombre: 'asc' }
      });

      res.json({
        success: true,
        data: { categorias }
      });
    } catch (error) {
      logger.error('Error al obtener categorías de guías:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las categorías' }
      });
    }
  }

  // Búsqueda general en centro de ayuda
  async busquedaGeneral(req, res) {
    try {
      const { termino, pagina = 1, limite = 10 } = req.query;

      if (!termino || termino.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'El término de búsqueda debe tener al menos 3 caracteres' }
        });
      }

      const busqueda = termino.trim();
      const skip = (pagina - 1) * limite;

      // Buscar en FAQs
      const [faqs, totalFaqs] = await Promise.all([
        prisma.fAQ.findMany({
          where: {
            activa: true,
            OR: [
              { pregunta: { contains: busqueda, mode: 'insensitive' } },
              { respuesta: { contains: busqueda, mode: 'insensitive' } }
            ]
          },
          include: {
            categoria: {
              select: { id: true, nombre: true, icono: true, color: true }
            }
          },
          orderBy: { vistas: 'desc' },
          skip,
          take: Math.ceil(parseInt(limite) / 2)
        }),
        prisma.fAQ.count({
          where: {
            activa: true,
            OR: [
              { pregunta: { contains: busqueda, mode: 'insensitive' } },
              { respuesta: { contains: busqueda, mode: 'insensitive' } }
            ]
          }
        })
      ]);

      // Buscar en guías
      const [guias, totalGuias] = await Promise.all([
        prisma.guia.findMany({
          where: {
            activa: true,
            OR: [
              { titulo: { contains: busqueda, mode: 'insensitive' } },
              { descripcion: { contains: busqueda, mode: 'insensitive' } }
            ]
          },
          include: {
            categoria: {
              select: { id: true, nombre: true, icono: true, color: true }
            }
          },
          orderBy: { descargas: 'desc' },
          skip,
          take: Math.ceil(parseInt(limite) / 2)
        }),
        prisma.guia.count({
          where: {
            activa: true,
            OR: [
              { titulo: { contains: busqueda, mode: 'insensitive' } },
              { descripcion: { contains: busqueda, mode: 'insensitive' } }
            ]
          }
        })
      ]);

      // Combinar resultados
      const resultados = [
        ...faqs.map(faq => ({ ...faq, tipo: 'faq' })),
        ...guias.map(guia => ({ ...guia, tipo: 'guia' }))
      ].sort((a, b) => {
        // Priorizar resultados más relevantes
        if (a.tipo === 'faq' && b.tipo === 'guia') return -1;
        if (a.tipo === 'guia' && b.tipo === 'faq') return 1;
        return 0;
      });

      res.json({
        success: true,
        data: {
          termino: busqueda,
          resultados,
          totales: {
            faqs: totalFaqs,
            guias: totalGuias,
            total: totalFaqs + totalGuias
          },
          paginacion: {
            pagina_actual: parseInt(pagina),
            limite: parseInt(limite)
          }
        }
      });
    } catch (error) {
      logger.error('Error en búsqueda general:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error en la búsqueda' }
      });
    }
  }

  // Obtener contenido destacado (más visitado/descargado)
  async obtenerContenidoDestacado(req, res) {
    try {
      const { limite = 5 } = req.query;

      const [faqsDestacadas, guiasDestacadas] = await Promise.all([
        prisma.fAQ.findMany({
          where: { activa: true },
          include: {
            categoria: {
              select: { id: true, nombre: true, icono: true, color: true }
            }
          },
          orderBy: { vistas: 'desc' },
          take: parseInt(limite)
        }),
        prisma.guia.findMany({
          where: { activa: true },
          include: {
            categoria: {
              select: { id: true, nombre: true, icono: true, color: true }
            }
          },
          orderBy: { descargas: 'desc' },
          take: parseInt(limite)
        })
      ]);

      res.json({
        success: true,
        data: {
          faqs_destacadas: faqsDestacadas,
          guias_destacadas: guiasDestacadas
        }
      });
    } catch (error) {
      logger.error('Error al obtener contenido destacado:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al obtener contenido destacado' }
      });
    }
  }
}

module.exports = new HelpCenterController();