const DataService = require('../../services/DataService');

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Database statistics and analytics endpoints
 */

class StatsController {
  /**
   * @swagger
   * /api/v2/stats/overview:
   *   get:
   *     summary: Get overall database statistics
   *     tags: [Statistics]
   *     responses:
   *       200:
   *         description: Database overview statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/StatsOverview'
   */
  static async getOverview(req, res) {
    try {
      const stats = DataService.getOverviewStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 500
      });
    }
  }

  /**
   * @swagger
   * /api/v2/stats/companies:
   *   get:
   *     summary: Get company statistics ranked by total talent
   *     tags: [Statistics]
   *     responses:
   *       200:
   *         description: Company statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         example: "SM Entertainment"
   *                       artistCount:
   *                         type: integer
   *                         example: 25
   *                       groupCount:
   *                         type: integer
   *                         example: 15
   *                       totalTalent:
   *                         type: integer
   *                         example: 40
   */
  static async getCompanyStats(req, res) {
    try {
      const stats = DataService.getCompanyStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 500
      });
    }
  }
}

module.exports = StatsController;