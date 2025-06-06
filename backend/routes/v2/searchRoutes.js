const express = require('express');
const searchController = require('../../controllers/v2/searchController');

const router = express.Router();

/**
 * @swagger
 * /api/v2/search/global:
 *   get:
 *     summary: Global search across all entities
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Global search results with relevance scoring
 *       400:
 *         description: Missing search query
 */
router.get('/global', searchController.globalSearch);

/**
 * @swagger
 * /api/v2/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 20
 *         description: Maximum number of suggestions
 *     responses:
 *       200:
 *         description: List of search suggestions
 *       400:
 *         description: Query too short or missing
 */
router.get('/suggestions', searchController.getSearchSuggestions);

/**
 * @swagger
 * /api/v2/search/advanced:
 *   get:
 *     summary: Advanced search with filters
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
 *           enum: [group, artist, actor, company]
 *         description: Filter by entity type
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [M, F]
 *         description: Filter by gender (for artists/actors)
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status (for groups)
 *       - in: query
 *         name: debutYear
 *         schema:
 *           type: integer
 *         description: Filter by debut year (for groups)
 *       - in: query
 *         name: birthYear
 *         schema:
 *           type: integer
 *         description: Filter by birth year (for artists/actors)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Advanced search results with applied filters
 *       400:
 *         description: Missing search query
 */
router.get('/advanced', searchController.advancedSearch);

module.exports = router;