const express = require('express');
const { protect } = require('../../middlewares/auth');
const { searchTrains, searchFlights } = require('./transit.controller');

const router = express.Router();

router.get('/trains', protect, searchTrains);
router.get('/flights', protect, searchFlights);

module.exports = router;

