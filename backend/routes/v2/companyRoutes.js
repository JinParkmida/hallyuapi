const express = require('express');
const companyController = require('../../controllers/v2/companyController');

const router = express.Router();

/**
 * @swagger
 * /api/v2/companies:
 *   get:
 *     summary: Get all companies
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for company names
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, groups, artists]
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
 *         description: List of companies
 */
router.get('/', companyController.getAllCompanies);

/**
 * @swagger
 * /api/v2/companies/search:
 *   get:
 *     summary: Search companies
 *     tags: [Companies]
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
 *         description: Search results
 *       400:
 *         description: Missing search query
 */
router.get('/search', companyController.searchCompanies);

/**
 * @swagger
 * /api/v2/companies/{name}:
 *   get:
 *     summary: Get company by name
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Company name (URL encoded)
 *     responses:
 *       200:
 *         description: Company details with statistics
 *       404:
 *         description: Company not found
 */
router.get('/:name', companyController.getCompanyByName);

/**
 * @swagger
 * /api/v2/companies/{name}/artists:
 *   get:
 *     summary: Get company artists
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Company name (URL encoded)
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [M, F]
 *         description: Filter by gender
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: Filter by group
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, birth]
 *           default: name
 *         description: Sort field
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
 *         description: List of company artists
 *       404:
 *         description: Company not found
 */
router.get('/:name/artists', companyController.getCompanyArtists);

/**
 * @swagger
 * /api/v2/companies/{name}/groups:
 *   get:
 *     summary: Get company groups
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Company name (URL encoded)
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, debut, members]
 *           default: name
 *         description: Sort field
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
 *         description: List of company groups
 *       404:
 *         description: Company not found
 */
router.get('/:name/groups', companyController.getCompanyGroups);

module.exports = router;