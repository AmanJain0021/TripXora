const express = require('express');
const router = express.Router();
const { parseTripInput, generateItinerary, replanItinerary, generatePackingList } = require('./ai.controller');
const { protect } = require('../../middlewares/auth');

router.post('/parse-trip', protect, parseTripInput);
router.post('/generate-itinerary/:tripId', protect, generateItinerary);
router.post('/replan-itinerary/:tripId', protect, replanItinerary);
router.post('/packing-list/:tripId', protect, generatePackingList);

module.exports = router;
