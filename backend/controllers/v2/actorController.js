const DataService = require('../../services/DataService');
const { validatePaginationParams, validateId } = require('../../utils/validation');

/**
 * @swagger
 * tags:
 *   name: Actors
 *   description: Korean actor management endpoints
 */

class ActorController {
  /**
   * @swagger
   * /api/v2/actors:
   *   get:
   *     summary: Get all actors with pagination and filtering
   *     tags: [Actors]
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
   *         name: agency
   *         schema:
   *           type: string
   *         description: Filter by agency
   *     responses:
   *       200:
   *         description: List of actors
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedResponse'
   */
  static async getAllActors(req, res) {
    try {
      const options = validatePaginationParams(req.query);
      const result = DataService.getActors(options);
      
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
   * /api/v2/actors/{id}:
   *   get:
   *     summary: Get actor by ID
   *     tags: [Actors]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Actor ID
   *     responses:
   *       200:
   *         description: Actor details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Actor'
   *       404:
   *         description: Actor not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getActorById(req, res) {
    try {
      const id = validateId(req.params.id);
      const actor = DataService.getActorById(id);
      
      if (!actor) {
        return res.status(404).json({
          success: false,
          error: 'Actor not found',
          code: 404
        });
      }

      res.json({
        success: true,
        data: actor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: 400
      });
    }
  }
}

module.exports = ActorController;