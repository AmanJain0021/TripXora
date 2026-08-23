const express = require('express');
const router = express.Router();
const { searchPlaces, getPlaceDetails } = require('./place.controller');
const { protect } = require('../../middlewares/auth');

router.get('/search', protect, searchPlaces);
router.get('/:placeId', protect, getPlaceDetails);

module.exports = router;
