const express = require('express');
const ActorController = require('../../controllers/v2/actorController');

const router = express.Router();

router.get('/', ActorController.getAllActors);
router.get('/:id', ActorController.getActorById);

module.exports = router;