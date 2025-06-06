const DataService = require('../../services/DataService');
const { validatePaginationParams, validateId } = require('../../utils/validation');

/**
 * @swagger
 * tags:
 *   name: Artists
 *   description: K-pop artist management endpoints
 */

class ArtistController {
  /**
   * @swagger
   * /api/v2/artists:
   *   get:
   *     summary: Get all artists with pagination and filtering
   *     tags: [Artists]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Items per page
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           default: stageName
   *         description: Field to sort by
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Sort order
   *       - in: query
   *         name: company
   *         schema:
   *           type: string
   *         description: Filter by company
   *     responses:
   *       200:
   *         description: List of artists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedResponse'
   */
  static async getAllArtists(req, res) {
    try {
      const options = validatePaginationParams(req.query);
      const result = DataService.getArtists(options);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: 400
      });
    }
  }

  /**
   * @swagger
   * /api/v2/artists/{id}:
   *   get:
   *     summary: Get artist by ID
   *     tags: [Artists]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Artist ID
   *     responses:
   *       200:
   *         description: Artist details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Artist'
   *       404:
   *         description: Artist not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getArtistById(req, res) {
    try {
      const id = validateId(req.params.id);
      const artist = DataService.getArtistById(id);
      
      if (!artist) {
        return res.status(404).json({
          success: false,
          error: 'Artist not found',
          code: 404
        });
      }

      res.json({
        success: true,
        data: artist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: 400
      });
    }
  }

  /**
   * @swagger
   * /api/v2/artists/birthdays/today:
   *   get:
   *     summary: Get artists with birthdays today
   *     tags: [Artists]
   *     responses:
   *       200:
   *         description: Artists celebrating birthdays today
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
   *                     $ref: '#/components/schemas/Artist'
   *                 count:
   *                   type: integer
   *                   example: 3
   */
  static async getTodaysBirthdays(req, res) {
    try {
      const birthdays = DataService.getTodaysBirthdays();
      
      res.json({
        success: true,
        data: birthdays,
        count: birthdays.length
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
   * /api/v2/artists/birthdays/upcoming:
   *   get:
   *     summary: Get upcoming artist birthdays
   *     tags: [Artists]
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           default: 7
   *         description: Number of days to look ahead
   *     responses:
   *       200:
   *         description: Upcoming artist birthdays
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
   *                       date:
   *                         type: string
   *                         format: date
   *                       artists:
   *                         type: array
   *                         items:
   *                           $ref: '#/components/schemas/Artist'
   */
  static async getUpcomingBirthdays(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const upcoming = DataService.getUpcomingBirthdays(days);
      
      res.json({
        success: true,
        data: upcoming
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

module.exports = ArtistController;