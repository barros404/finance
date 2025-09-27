require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const orcamentoRoutes = require('./routes/orcamento.routes');
const tesourariaRoutes = require('./routes/tesouraria.routes');
const uploadRoutes = require('./routes/upload.routes');
const relatoriosRoutes = require('./routes/relatorios.routes');
const riscosRoutes = require('./routes/riscos.routes');
const execucaoRoutes = require('./routes/execucao.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const aprovacaoRoutes = require('./routes/aprovacao.routes');
const pgcRoutes = require('./routes/pgc.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orcamentos', orcamentoRoutes);
app.use('/api/tesouraria', tesourariaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/riscos', riscosRoutes);
app.use('/api/execucoes', execucaoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/aprovacao', aprovacaoRoutes);
app.use('/api/pgc', pgcRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    error: {
      statusCode: 404,
      message: 'The requested resource was not found on this server.'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
