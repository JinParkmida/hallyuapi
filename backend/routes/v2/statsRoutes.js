const express = require('express');
const StatsController = require('../../controllers/v2/statsController');

const router = express.Router();

router.get('/overview', StatsController.getOverview);
router.get('/companies', StatsController.getCompanyStats);

module.exports = router;