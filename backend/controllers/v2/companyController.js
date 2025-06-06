const DataService = require('../../services/DataService');
const { validatePaginationParams, validateId } = require('../../utils/validation');

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Entertainment company management endpoints
 */

class CompanyController {
  /**
   * @swagger
   * /api/v2/companies:
   *   get:
   *     summary: Get all companies with pagination and filtering
   *     tags: [Companies]
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
   *         name: type
   *         schema:
   *           type: string
   *         description: Filter by company type
   *     responses:
   *       200:
   *         description: List of companies
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedResponse'
   */
  static async getAllCompanies(req, res) {
    try {
      const options = validatePaginationParams(req.query);
      const result = DataService.getCompanies(options);
      
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
   * /api/v2/companies/{id}:
   *   get:
   *     summary: Get company by ID
   *     tags: [Companies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Company ID
   *     responses:
   *       200:
   *         description: Company details with associated artists and groups
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Company'
   *       404:
   *         description: Company not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async getCompanyById(req, res) {
    try {
      const id = validateId(req.params.id);
      const company = DataService.getCompanyById(id);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found',
          code: 404
        });
      }

      res.json({
        success: true,
        data: company
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

module.exports = CompanyController;