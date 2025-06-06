const express = require('express');
const SearchController = require('../../controllers/v2/searchController');

const router = express.Router();

router.get('/', SearchController.search);
router.get('/suggestions', SearchController.getSuggestions);

module.exports = router;