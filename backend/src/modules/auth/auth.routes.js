const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  getMe,
} = require('./auth.controller');
const { protect } = require('../../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);

module.exports = router;
