const express = require('express');
const idolController = require('../../controllers/v2/idolController');
const { validateQuery, validateId, schemas } = require('../../utils/validation');

const router = express.Router();

/**
 * @swagger
 * /api/v2/idols:
 *   get:
 *     summary: Get all idols with filtering and pagination
 *     tags: [Idols]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for names
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [M, F, male, female]
 *         description: Filter by gender
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: Filter by group name
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company
 *       - in: query
 *         name: birthYear
 *         schema:
 *           type: integer
 *         description: Filter by birth year
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, debut, alphabetical]
 *           default: name
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of idols
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', validateQuery(schemas.idol), idolController.getAllIdols);

/**
 * @swagger
 * /api/v2/idols/search:
 *   get:
 *     summary: Search idols with relevance scoring
 *     tags: [Idols]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results with relevance scores
 *       400:
 *         description: Missing search query
 */
router.get('/search', idolController.searchIdols);

/**
 * @swagger
 * /api/v2/idols/birthdays:
 *   get:
 *     summary: Get upcoming idol birthdays
 *     tags: [Idols]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days ahead to check
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
 *         description: List of upcoming birthdays
 */
router.get('/birthdays', idolController.getUpcomingIdolBirthdays);

/**
 * @swagger
 * /api/v2/idols/trending:
 *   get:
 *     summary: Get trending idols
 *     tags: [Idols]
 *     parameters:
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
 *         description: List of trending idols
 */
router.get('/trending', idolController.getTrendingIdols);

/**
 * @swagger
 * /api/v2/idols/gender/{gender}:
 *   get:
 *     summary: Get idols by gender
 *     tags: [Idols]
 *     parameters:
 *       - in: path
 *         name: gender
 *         required: true
 *         schema:
 *           type: string
 *           enum: [male, female, M, F]
 *         description: Gender filter
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
 *         description: List of idols by gender
 *       400:
 *         description: Invalid gender parameter
 */
router.get('/gender/:gender', idolController.getIdolsByGender);

/**
 * @swagger
 * /api/v2/idols/{id}:
 *   get:
 *     summary: Get idol by ID
 *     tags: [Idols]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Idol ID
 *     responses:
 *       200:
 *         description: Idol details
 *       404:
 *         description: Idol not found
 *       400:
 *         description: Invalid ID parameter
 */
router.get('/:id', validateId, idolController.getIdolById);

module.exports = router;