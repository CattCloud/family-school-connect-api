const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Importar middlewares
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFound');
const { logAccess } = require('./middleware/logging');

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const comunicadosRoutes = require('./routes/comunicados');
const encuestasRoutes = require('./routes/encuestas');

// Inicializar app
const app = express();

// Configuración de middlewares de seguridad
app.use(require('helmet')({
  contentSecurityPolicy: false, // Desactivado para facilitar desarrollo
}));

// Configuración de CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limitar tasa de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limitar cada IP a 100 peticiones por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging de peticiones
app.use(logAccess('general', 'api_request'));

// Parsear body de peticiones
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas de la API
app.use('/auth', authRoutes);
app.use('/usuarios', usersRoutes);
app.use('/comunicados', comunicadosRoutes);
app.use('/encuestas', encuestasRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejo de errores
app.use(errorHandler);

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en modo ${NODE_ENV} en el puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;