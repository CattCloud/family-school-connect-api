'use strict';

const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');

const prisma = new PrismaClient();

/**
 * Obtiene el año académico actual y configuración de trimestres
 * GET /anio-academico/actual
 */
const getCurrentAcademicYearController = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Determinar trimestre actual según fecha del sistema
    const getCurrentTrimester = () => {
      const month = new Date().getMonth() + 1; // 1-12
      
      if (month >= 3 && month <= 5) return 1; // Marzo-Mayo
      if (month >= 6 && month <= 9) return 2; // Junio-Septiembre
      if (month >= 10 && month <= 12) return 3; // Octubre-Diciembre
      return 1; // Enero-Febrero pertenece al T1 del año actual
    };

    const currentTrimester = getCurrentTrimester();

    // Configuración de trimestres (pueden ser configurables en el futuro)
    const trimestres = [
      {
        numero: 1,
        nombre: 'Trimestre 1',
        fecha_inicio: `${currentYear}-03-01`,
        fecha_fin: `${currentYear}-05-31`,
        estado: currentTrimester === 1 ? 'en_curso' : currentTrimester > 1 ? 'cerrado' : 'pendiente',
        fecha_cierre: currentTrimester > 1 ? `${currentYear}-06-05` : null
      },
      {
        numero: 2,
        nombre: 'Trimestre 2',
        fecha_inicio: `${currentYear}-06-01`,
        fecha_fin: `${currentYear}-09-15`,
        estado: currentTrimester === 2 ? 'en_curso' : currentTrimester > 2 ? 'cerrado' : 'pendiente',
        fecha_cierre: currentTrimester > 2 ? `${currentYear}-09-20` : null
      },
      {
        numero: 3,
        nombre: 'Trimestre 3',
        fecha_inicio: `${currentYear}-09-16`,
        fecha_fin: `${currentYear}-12-20`,
        estado: currentTrimester === 3 ? 'en_curso' : 'pendiente',
        fecha_cierre: null
      }
    ];

    const response = {
      año_actual: currentYear,
      trimestres,
      trimestre_actual: currentTrimester
    };

    return successResponse(res, response, 200);

  } catch (error) {
    console.error('Error al obtener año académico actual:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Error al obtener año académico actual', 500);
  }
};

module.exports = {
  getCurrentAcademicYearController,
};