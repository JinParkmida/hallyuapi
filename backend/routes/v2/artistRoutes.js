const express = require('express');
const ArtistController = require('../../controllers/v2/artistController');

const router = express.Router();

router.get('/', ArtistController.getAllArtists);
router.get('/birthdays/today', ArtistController.getTodaysBirthdays);
router.get('/birthdays/upcoming', ArtistController.getUpcomingBirthdays);
router.get('/:id', ArtistController.getArtistById);

module.exports = router;