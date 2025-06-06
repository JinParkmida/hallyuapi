const express = require('express');
const groupController = require('../../controllers/v2/groupController');
const { validateQuery, validateId, schemas } = require('../../utils/validation');

const router = express.Router();

/**
 * @swagger
 * /api/v2/groups:
 *   get:
 *     summary: Get all groups with filtering and pagination
 *     tags: [Groups]
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
 *         description: Search query for group names
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [boyband, girlgroup, mixed, solo]
 *         description: Filter by group type
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company
 *       - in: query
 *         name: debutYear
 *         schema:
 *           type: integer
 *         description: Filter by debut year
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: memberCount
 *         schema:
 *           type: integer
 *         description: Filter by member count
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, debut, popularity, recent]
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
 *         description: List of groups
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', validateQuery(schemas.group), groupController.getAllGroups);

/**
 * @swagger
 * /api/v2/groups/search:
 *   get:
 *     summary: Search groups with relevance scoring
 *     tags: [Groups]
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
router.get('/search', groupController.searchGroups);

/**
 * @swagger
 * /api/v2/groups/anniversaries:
 *   get:
 *     summary: Get upcoming group anniversaries
 *     tags: [Groups]
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
 *         description: List of upcoming anniversaries
 */
router.get('/anniversaries', groupController.getUpcomingAnniversaries);

/**
 * @swagger
 * /api/v2/groups/type/{type}:
 *   get:
 *     summary: Get groups by type
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [boyband, girlgroup, mixed, solo]
 *         description: Group type
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
 *         description: List of groups by type
 *       400:
 *         description: Invalid type parameter
 */
router.get('/type/:type', groupController.getGroupsByType);

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
 *         description: Group details with members
 *       404:
 *         description: Group not found
 *       400:
 *         description: Invalid ID parameter
 */
router.get('/:id', validateId, groupController.getGroupById);

/**
 * @swagger
 * /api/v2/groups/{id}/members:
 *   get:
 *     summary: Get group members
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, age, birth]
 *           default: name
 *         description: Sort members by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
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
 *         description: List of group members
 *       404:
 *         description: Group not found
 */
router.get('/:id/members', validateId, groupController.getGroupMembers);

module.exports = router;