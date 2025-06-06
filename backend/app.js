const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');

// Import routers
const actorRouter = require('./routes/actorRoutes');
const artistRouter = require('./routes/artistRoutes');
const groupRouter = require('./routes/groupRoutes');
const v2Router = require('./routes/v2');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API v2 (New comprehensive API)
app.use('/api/v2', v2Router);

// API v1 (Legacy routes - maintained for backward compatibility)
app.use('/api/v1/actors', actorRouter);
app.use('/api/v1/artists', artistRouter);
app.use('/api/v1/groups', groupRouter);

// Legacy endpoints
app.get('/api/v1/hello', (req, res) => res.send('안녕!'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Hallyu API',
    version: '2.0.0',
    description: 'Comprehensive K-pop database API based on dbkpop.com data',
    documentation: '/api/docs',
    endpoints: {
      'v2 (recommended)': '/api/v2',
      'v1 (legacy)': '/api/v1'
    },
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// API root redirect
app.get('/api', (req, res) => {
  res.redirect('/api/v2');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    availableEndpoints: {
      'API v2': '/api/v2',
      'API v1': '/api/v1',
      'Documentation': '/api/docs',
      'Health Check': '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;
