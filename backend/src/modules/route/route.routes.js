const express = require('express');
const router = express.Router();
const { calculateRoute } = require('./route.controller');
const { protect } = require('../../middlewares/auth');

router.post('/calculate', protect, calculateRoute);

module.exports = router;
