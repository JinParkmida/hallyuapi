const DataService = require('../../services/DataService');
const { validatePaginationParams, validateId } = require('../../utils/validation');

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: K-pop group management endpoints
 */

class GroupController {
  /**
   * @swagger
   * /api/v2/groups:
   *   get:
   *     summary: Get all groups with pagination and filtering
   *     tags: [Groups]
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
   *           default: name
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
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filter by status (Active, Disbanded, etc.)
   *     responses:
   *       200:
   *         description: List of groups
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedResponse'
   */
  static async getAllGroups(req, res) {
    try {
      const options = validatePaginationParams(req.query);
      const result = DataService.getGroups(options);
      
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
   * /api/v2/groups/{id}:
   *   get:
   *     summary: Get group by ID
   *     tags: [Groups]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Group ID
   *     responses:
   *       200:
   *         description: Group details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Group'
   *       404:
   *         description: Group not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getGroupById(req, res) {
    try {
      const id = validateId(req.params.id);
      const group = DataService.getGroupById(id);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Group not found',
          code: 404
        });
      }

      res.json({
        success: true,
        data: group
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
   * /api/v2/groups/anniversaries/today:
   *   get:
   *     summary: Get groups with debut anniversaries today
   *     tags: [Groups]
   *     responses:
   *       200:
   *         description: Groups celebrating debut anniversaries today
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
   *                     $ref: '#/components/schemas/Group'
   *                 count:
   *                   type: integer
   *                   example: 2
   */
  static async getTodaysAnniversaries(req, res) {
    try {
      const anniversaries = DataService.getGroupAnniversaries();
      
      res.json({
        success: true,
        data: anniversaries,
        count: anniversaries.length
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

module.exports = GroupController;