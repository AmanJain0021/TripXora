const { mapsClient } = require('./mapsClient');

/**
 * Search for places using Google Places API (Text Search)
 * 
 * @param {string} query - The search query (e.g., "restaurants in Udaipur")
 * @param {string} type - Optional place type
 * @returns {Array} Array of place results
 */
const searchPlaces = async (query, type) => {
  try {
    if (process.env.GOOGLE_MAPS_API_KEY === 'mocked_key_for_now' || !process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('Using mocked Google Maps API key. Returning fake places.');
      return [
        {
          place_id: 'mock_1',
          name: 'Mock ' + query,
          formatted_address: '123 Mock Street',
          rating: 4.5,
          user_ratings_total: 120,
          types: type ? [type] : ['point_of_interest'],
          geometry: { location: { lat: 24.5854, lng: 73.7125 } },
          photo_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop'
        }
      ];
    }

    const params = {
      query,
      key: process.env.GOOGLE_MAPS_API_KEY,
    };

    if (type) {
      params.type = type;
    }

    const response = await mapsClient.textSearch({
      params,
      timeout: 10000
    });

    if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
      const results = response.data.results.map(place => {
        let photo_url = null;
        if (place.photos && place.photos.length > 0) {
          photo_url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        }
        return { ...place, photo_url };
      });
      return results;
    } else {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Places API Error:', error.response?.data || error.message);
    throw new Error('Failed to search places');
  }
};

/**
 * Get Place Details
 */
const getPlaceDetails = async (placeId) => {
  try {
    if (process.env.GOOGLE_MAPS_API_KEY === 'mocked_key_for_now' || !process.env.GOOGLE_MAPS_API_KEY) {
      return {
        place_id: placeId,
        name: 'Mock Place Details',
        formatted_address: '123 Mock Street',
        rating: 4.5,
        website: 'https://mockplace.com',
        formatted_phone_number: '123-456-7890',
        geometry: { location: { lat: 24.5854, lng: 73.7125 } }
      };
    }

    const response = await mapsClient.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'rating', 'formatted_phone_number', 'formatted_address', 'geometry', 'website', 'photos', 'reviews'],
        key: process.env.GOOGLE_MAPS_API_KEY,
      }
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    } else {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Place Details API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch place details');
  }
};

module.exports = {
  searchPlaces,
  getPlaceDetails
};
