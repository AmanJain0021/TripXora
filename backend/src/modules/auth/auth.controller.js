const User = require('./user.model');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../../utils/asyncHandler');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide an email and password');
  }

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (user && user.password && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const passport = require('passport');

// @desc    Initiate Google OAuth login
// @route   GET /api/auth/google
// @access  Public
const googleAuth = (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        'Google OAuth is not configured on the server'
      )}`
    );
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(
    req,
    res,
    next
  );
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      const errorMessage =
        err?.message || info?.message || 'Google authentication failed';
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`
      );
    }

    try {
      const token = generateToken(user._id);
      return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (tokenErr) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          'Failed to generate authentication token'
        )}`
      );
    }
  })(req, res, next);
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  getMe,
};
