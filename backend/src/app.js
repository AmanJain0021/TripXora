const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TripXora API is running' });
});

// Define routes here
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/trips', require('./modules/trip/trip.routes'));
app.use('/api/ai', require('./modules/ai/ai.routes'));
app.use('/api/routes', require('./modules/route/route.routes'));
app.use('/api/places', require('./modules/place/place.routes'));

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
