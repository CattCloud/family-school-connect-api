const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtiene el año académico actual y configuración de trimestres
 */
const getAcademicYearController = async (req, res) => {
  try {
    // Obtener el año actual
    const currentYear = new Date().getFullYear();
    
    // Determinar el trimestre actual según la fecha del sistema
    const currentDate = new Date();
    let trimestreActual = 1;
    
    // Configuración de trimestres (según documentación)
    const trimestres = [
      {
        numero: 1,
        nombre: "Trimestre 1",
        fecha_inicio: `${currentYear}-03-01`,
        fecha_fin: `${currentYear}-05-31`,
        estado: currentDate >= new Date(`${currentYear}-03-01`) && currentDate <= new Date(`${currentYear}-05-31`) ? "en_curso" : 
                currentDate > new Date(`${currentYear}-05-31`) ? "cerrado" : "pendiente",
        fecha_cierre: currentDate > new Date(`${currentYear}-05-31`) ? `${currentYear}-06-05` : null
      },
      {
        numero: 2,
        nombre: "Trimestre 2",
        fecha_inicio: `${currentYear}-06-01`,
        fecha_fin: `${currentYear}-09-15`,
        estado: currentDate >= new Date(`${currentYear}-06-01`) && currentDate <= new Date(`${currentYear}-09-15`) ? "en_curso" : 
                currentDate > new Date(`${currentYear}-09-15`) ? "cerrado" : "pendiente",
        fecha_cierre: currentDate > new Date(`${currentYear}-09-15`) ? `${currentYear}-09-20` : null
      },
      {
        numero: 3,
        nombre: "Trimestre 3",
        fecha_inicio: `${currentYear}-09-16`,
        fecha_fin: `${currentYear}-12-20`,
        estado: currentDate >= new Date(`${currentYear}-09-16`) && currentDate <= new Date(`${currentYear}-12-20`) ? "en_curso" : 
                currentDate > new Date(`${currentYear}-12-20`) ? "cerrado" : "pendiente",
        fecha_cierre: currentDate > new Date(`${currentYear}-12-20`) ? `${currentYear}-12-23` : null
      }
    ];
    
    // Determinar qué trimestre está en curso actualmente
    const trimestreEnCurso = trimestres.find(t => t.estado === "en_curso");
    if (trimestreEnCurso) {
      trimestreActual = trimestreEnCurso.numero;
    }
    
    // Respuesta según documentación
    res.status(200).json({
      success: true,
      data: {
        año_actual: currentYear,
        trimestres: trimestres,
        trimestre_actual: trimestreActual
      }
    });
    
  } catch (error) {
    console.error('Error al obtener año académico:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor al obtener el año académico'
      }
    });
  }
};

module.exports = {
  getAcademicYearController
};