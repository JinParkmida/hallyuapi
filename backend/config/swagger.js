const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hallyu API',
      version: '2.0.0',
      description: 'Comprehensive K-pop database API based on dbkpop.com data',
      contact: {
        name: 'Hallyu API Team',
        url: 'https://github.com/JinParkmida/hallyuapi',
        email: 'contact@hallyuapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: '/api/v2',
        description: 'API v2 Server'
      },
      {
        url: '/api/v1',
        description: 'API v1 Server (Legacy)'
      }
    ],
    tags: [
      {
        name: 'General',
        description: 'General API information and health checks'
      },
      {
        name: 'Idols',
        description: 'K-pop idol/artist operations'
      },
      {
        name: 'Groups',
        description: 'K-pop group operations'
      },
      {
        name: 'Companies',
        description: 'Entertainment company operations'
      },
      {
        name: 'Statistics',
        description: 'Statistical data and analytics'
      },
      {
        name: 'Search',
        description: 'Search and discovery operations'
      }
    ]
  },
  apis: [
    './routes/v2/*.js',
    './controllers/v2/*.js'
  ]
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #e91e63 }
  `,
  customSiteTitle: 'Hallyu API Documentation',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions
};