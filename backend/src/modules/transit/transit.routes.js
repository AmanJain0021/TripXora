const express = require('express');
const { protect } = require('../../middlewares/auth');
const { searchTrains } = require('./transit.controller');

const router = express.Router();

router.get('/trains', protect, searchTrains);

module.exports = router;
