const DataService = require('../../services/DataService');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Advanced search functionality with fuzzy matching
 */

class SearchController {
  /**
   * @swagger
   * /api/v2/search:
   *   get:
   *     summary: Search across all data types with advanced options
   *     tags: [Search]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [all, artists, groups, actors, companies]
   *           default: all
   *         description: Type of content to search
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *           maximum: 100
   *         description: Maximum number of results
   *       - in: query
   *         name: fuzzy
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Enable fuzzy matching for approximate results
   *     responses:
   *       200:
   *         description: Search results with relevance scoring
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SearchResult'
   *       400:
   *         description: Invalid search parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  static async search(req, res) {
    try {
      const schema = Joi.object({
        q: Joi.string().min(1).max(100).required(),
        type: Joi.string().valid('all', 'artists', 'groups', 'actors', 'companies').default('all'),
        limit: Joi.number().integer().min(1).max(100).default(20),
        fuzzy: Joi.boolean().default(true)
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
          code: 400
        });
      }

      const { q, type, limit, fuzzy } = value;
      const results = DataService.search(q, type, { limit, fuzzy });

      res.json({
        success: true,
        query: q,
        type: type,
        totalResults: results.length,
        results: results
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
   * /api/v2/search/suggestions:
   *   get:
   *     summary: Get search suggestions based on partial query
   *     tags: [Search]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *           minLength: 2
   *         description: Partial search query
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           maximum: 20
   *         description: Maximum number of suggestions
   *     responses:
   *       200:
   *         description: Search suggestions
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 query:
   *                   type: string
   *                   example: "BT"
   *                 suggestions:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       text:
   *                         type: string
   *                         example: "BTS"
   *                       type:
   *                         type: string
   *                         example: "group"
   *                       relevance:
   *                         type: number
   *                         example: 95
   */
  static async getSuggestions(req, res) {
    try {
      const schema = Joi.object({
        q: Joi.string().min(2).max(50).required(),
        limit: Joi.number().integer().min(1).max(20).default(10)
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
          code: 400
        });
      }

      const { q, limit } = value;
      const results = DataService.search(q, 'all', { limit, fuzzy: true });
      
      const suggestions = results.map(result => ({
        text: result.stageName || result.name,
        type: result.type,
        relevance: result.relevance
      }));

      res.json({
        success: true,
        query: q,
        suggestions: suggestions
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

module.exports = SearchController;