const asyncHandler = require('../../utils/asyncHandler');
const { calculateRoute: calcRoute } = require('../../integrations/googleMaps/directions');

// @desc    Calculate route details
// @route   POST /api/routes/calculate
// @access  Private
const calculateRoute = asyncHandler(async (req, res) => {
  const { origin, destination, waypoints, mode } = req.body;

  if (!origin || !destination) {
    res.status(400);
    throw new Error('Please provide origin and destination');
  }

  // Google Maps mode mapping
  const modeMap = {
    car: 'driving',
    bike: 'bicycling', // Note: Google might not support biking everywhere, often falls back to driving
    bus: 'transit',
    train: 'transit',
    flight: 'driving' // Google Maps Directions doesn't handle flights, would need a custom integration for flights
  };

  const gmapsMode = modeMap[mode] || 'driving';

  const routeDetails = await calcRoute(origin, destination, waypoints, gmapsMode);
  
  res.status(200).json(routeDetails);
});

module.exports = {
  calculateRoute
};
