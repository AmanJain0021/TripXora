const { mapsClient } = require('./mapsClient');

/**
 * Calculates a route between an origin and a destination, potentially with waypoints.
 * 
 * @param {string|Object} origin - The origin location. Can be a string address or {lat, lng}
 * @param {string|Object} destination - The destination location.
 * @param {Array} waypoints - Array of string addresses or {lat, lng}
 * @param {string} mode - Travel mode: 'driving', 'walking', 'bicycling', 'transit'
 * @returns {Object} Route data including distance, duration, and polyline
 */
const calculateRoute = async (origin, destination, waypoints = [], mode = 'driving') => {
  try {
    if (mode === 'flight') {
      return {
        totalDistance: 1000000, // mock distance
        totalDuration: 7200, // mock duration
        polyline: 'mock_flight_polyline',
        legs: [{ from: origin, to: destination, distance: 1000000, duration: 7200 }]
      };
    }

    if (process.env.GOOGLE_MAPS_API_KEY === 'mocked_key_for_now' || !process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('Using mocked Google Maps API key. Returning fake route data.');
      return {
        totalDistance: 150000, // meters
        totalDuration: 7200, // seconds
        polyline: 'mock_polyline',
        legs: []
      };
    }

    const requestArgs = {
      params: {
        origin,
        destination,
        waypoints: waypoints.map(wp => typeof wp === 'string' ? wp : `${wp.lat},${wp.lng}`),
        mode,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 10000, // milliseconds
    };

    const response = await mapsClient.directions(requestArgs);

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0]; // Assuming single leg for simple routes, or sum up for multiple legs
      
      let totalDistance = 0;
      let totalDuration = 0;
      const formattedLegs = [];

      for (const l of route.legs) {
        totalDistance += l.distance.value;
        totalDuration += l.duration.value;
        formattedLegs.push({
          from: l.start_address,
          to: l.end_address,
          distance: l.distance.value,
          duration: l.duration.value
        });
      }

      return {
        totalDistance,
        totalDuration,
        polyline: route.overview_polyline.points,
        legs: formattedLegs
      };
    } else {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Directions API Error:', error.response?.data || error.message);
    throw new Error('Failed to calculate route');
  }
};

module.exports = {
  calculateRoute
};
