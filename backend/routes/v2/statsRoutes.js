const express = require('express');
const statsController = require('../../controllers/v2/statsController');

const router = express.Router();

/**
 * @swagger
 * /api/v2/stats/overview:
 *   get:
 *     summary: Get overview statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Overview statistics including totals, demographics, and trends
 */
router.get('/overview', statsController.getOverviewStats);

/**
 * @swagger
 * /api/v2/stats/demographics:
 *   get:
 *     summary: Get demographic statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Detailed demographic breakdowns by gender, country, age, etc.
 */
router.get('/demographics', statsController.getDemographicStats);

/**
 * @swagger
 * /api/v2/stats/trends:
 *   get:
 *     summary: Get trend statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Trend analysis including debut patterns, company trends, etc.
 */
router.get('/trends', statsController.getTrendStats);

module.exports = router;