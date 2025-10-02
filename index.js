'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFound');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const teachersRoutes = require('./routes/teachers');
const evaluationRoutes = require('./routes/evaluation');
const adminRoutes = require('./routes/admin');
let devRoutes = null;
if (process.env.ENABLE_DEV_ROUTES === 'true' && process.env.NODE_ENV !== 'production') {
  try {
    devRoutes = require('./routes/dev');
  } catch {
    devRoutes = null;
  }
}

const app = express();

// Middlewares base
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(express.json());

// Rutas API
app.use('/', authRoutes);
app.use('/', teachersRoutes);
app.use('/', evaluationRoutes);
app.use('/', adminRoutes);

if (devRoutes) {
  app.use('/', devRoutes);
}

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler (después de rutas)
app.use(notFoundHandler);

// Error handler centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;