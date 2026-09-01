const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/transit', require('./modules/transit/transit.routes'));

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
