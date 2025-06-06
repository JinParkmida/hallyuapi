const app = require('./app');
const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Use port 12000 as specified in the runtime information
const PORT = process.env.PORT || 12000;
const HOST = '0.0.0.0'; // Allow access from any host

app.listen(PORT, HOST, function () {
  console.log(`🚀 Hallyu API v2.0 is running!`);
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`📚 Documentation: http://${HOST}:${PORT}/api/docs`);
  console.log(`🔍 API v2: http://${HOST}:${PORT}/api/v2`);
  console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /api/v2              - API information');
  console.log('  GET  /api/v2/idols        - List all idols');
  console.log('  GET  /api/v2/groups       - List all groups');
  console.log('  GET  /api/v2/companies    - List all companies');
  console.log('  GET  /api/v2/stats        - Statistics');
  console.log('  GET  /api/v2/search       - Search functionality');
  console.log('  GET  /api/docs            - API documentation');
});
