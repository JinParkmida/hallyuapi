const express = require('express');
const GroupController = require('../../controllers/v2/groupController');

const router = express.Router();

router.get('/', GroupController.getAllGroups);
router.get('/anniversaries/today', GroupController.getTodaysAnniversaries);
router.get('/:id', GroupController.getGroupById);

module.exports = router;