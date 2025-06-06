const express = require('express');
const idolRoutes = require('./idolRoutes');
const groupRoutes = require('./groupRoutes');
const companyRoutes = require('./companyRoutes');
const statsRoutes = require('./statsRoutes');
const searchRoutes = require('./searchRoutes');
const dataService = require('../../services/dataService');
const { formatResponse } = require('../../utils/helpers');

const router = express.Router();

// Mount sub-routes
router.use('/idols', idolRoutes);
router.use('/groups', groupRoutes);
router.use('/companies', companyRoutes);
router.use('/stats', statsRoutes);
router.use('/search', searchRoutes);

/**
 * @swagger
 * /api/v2:
 *   get:
 *     summary: API v2 information and status
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information and data summary
 */
router.get('/', (req, res) => {
  try {
    const summary = dataService.getDataSummary();
    
    const apiInfo = {
      version: '2.0.0',
      name: 'Hallyu API v2',
      description: 'Comprehensive K-pop database API based on dbkpop.com data',
      features: [
        'Advanced search and filtering',
        'Pagination and sorting',
        'Real-time birthday and anniversary tracking',
        'Comprehensive statistics',
        'Company and group relationship data',
        'Relevance-based search results',
        'RESTful design with proper HTTP status codes'
      ],
      endpoints: {
        idols: '/api/v2/idols',
        groups: '/api/v2/groups',
        companies: '/api/v2/companies',
        statistics: '/api/v2/stats',
        search: '/api/v2/search'
      },
      dataSummary: summary,
      documentation: '/api/docs',
      status: 'active'
    };
    
    res.status(200).json(formatResponse(apiInfo, 'success', 'Welcome to Hallyu API v2'));
  } catch (error) {
    console.error('Error in v2 index:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v2/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API health status
 */
router.get('/health', (req, res) => {
  try {
    const summary = dataService.getDataSummary();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      uptime: process.uptime(),
      dataStatus: {
        loaded: summary.groups > 0 && summary.artists > 0,
        lastUpdated: summary.lastUpdated,
        totalRecords: summary.groups + summary.artists + summary.actors
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    
    res.status(200).json(formatResponse(health));
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;