// Middleware simple para manejar rutas no encontradas
function simpleNotFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = simpleNotFound;