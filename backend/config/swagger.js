const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hallyu API v2.0',
      version: '2.0.0',
      description: 'Comprehensive K-pop Database API based on dbkpop.com data structure',
      contact: {
        name: 'JinParkmida',
        url: 'https://github.com/JinParkmida/hallyuapi'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:12000',
        description: 'Development server'
      },
      {
        url: 'https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev',
        description: 'Runtime server'
      }
    ],
    components: {
      schemas: {
        Artist: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            stageName: { type: 'string', example: 'IU' },
            fullName: { type: 'string', example: 'Lee Ji-eun' },
            koreanName: { type: 'string', example: '이지은' },
            dateOfBirth: { type: 'string', format: 'date', example: '1993-05-16' },
            company: { type: 'string', example: 'EDAM Entertainment' },
            debutDate: { type: 'string', format: 'date', example: '2008-09-18' },
            position: { type: 'string', example: 'Solo Artist' },
            nationality: { type: 'string', example: 'South Korean' }
          }
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'BTS' },
            koreanName: { type: 'string', example: '방탄소년단' },
            company: { type: 'string', example: 'HYBE' },
            debutDate: { type: 'string', format: 'date', example: '2013-06-13' },
            members: { type: 'array', items: { type: 'string' } },
            genre: { type: 'string', example: 'K-pop, Hip hop' },
            status: { type: 'string', example: 'Active' }
          }
        },
        Actor: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            stageName: { type: 'string', example: 'Song Joong-ki' },
            fullName: { type: 'string', example: 'Song Joong-ki' },
            koreanName: { type: 'string', example: '송중기' },
            dateOfBirth: { type: 'string', format: 'date', example: '1985-09-19' },
            agency: { type: 'string', example: 'History D&C' },
            debutYear: { type: 'integer', example: 2008 }
          }
        },
        Company: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'SM Entertainment' },
            type: { type: 'string', example: 'Major Label' },
            founded: { type: 'integer', example: 1995 },
            artists: { type: 'array', items: { $ref: '#/components/schemas/Artist' } },
            groups: { type: 'array', items: { $ref: '#/components/schemas/Group' } }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                currentPage: { type: 'integer', example: 1 },
                totalPages: { type: 'integer', example: 10 },
                totalItems: { type: 'integer', example: 200 },
                itemsPerPage: { type: 'integer', example: 20 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false }
              }
            }
          }
        },
        SearchResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            query: { type: 'string', example: 'BTS' },
            totalResults: { type: 'integer', example: 5 },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'group' },
                  relevance: { type: 'number', example: 100 }
                }
              }
            }
          }
        },
        StatsOverview: {
          type: 'object',
          properties: {
            totalArtists: { type: 'integer', example: 1428 },
            totalGroups: { type: 'integer', example: 352 },
            totalActors: { type: 'integer', example: 310 },
            totalCompanies: { type: 'integer', example: 232 },
            lastUpdated: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Resource not found' },
            code: { type: 'integer', example: 404 }
          }
        }
      }
    }
  },
  apis: ['./routes/v2/*.js', './controllers/v2/*.js']
};

module.exports = swaggerJsdoc(options);