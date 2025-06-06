const express = require('express');
const artistRoutes = require('./artistRoutes');
const groupRoutes = require('./groupRoutes');
const actorRoutes = require('./actorRoutes');
const companyRoutes = require('./companyRoutes');
const searchRoutes = require('./searchRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

/**
 * @swagger
 * /api/v2:
 *   get:
 *     summary: API v2 welcome endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message and API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Welcome to Hallyu API v2.0"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "/api/docs"
 *                 endpoints:
 *                   type: object
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Hallyu API v2.0 - Comprehensive K-pop Database',
    version: '2.0.0',
    documentation: '/api/docs',
    endpoints: {
      artists: '/api/v2/artists',
      groups: '/api/v2/groups',
      actors: '/api/v2/actors',
      companies: '/api/v2/companies',
      search: '/api/v2/search',
      statistics: '/api/v2/stats'
    },
    features: [
      'Advanced search with fuzzy matching',
      'Real-time birthdays and anniversaries',
      'Comprehensive statistics',
      'Pagination and filtering',
      'Company relationship mapping'
    ]
  });
});

// Mount sub-routers
router.use('/artists', artistRoutes);
router.use('/groups', groupRoutes);
router.use('/actors', actorRoutes);
router.use('/companies', companyRoutes);
router.use('/search', searchRoutes);
router.use('/stats', statsRoutes);

module.exports = router;