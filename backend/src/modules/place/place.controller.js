const asyncHandler = require('../../utils/asyncHandler');
const { searchPlaces: gSearchPlaces, getPlaceDetails: gGetPlaceDetails } = require('../../integrations/googleMaps/places');

// @desc    Search for places
// @route   GET /api/places/search
// @access  Private
const searchPlaces = asyncHandler(async (req, res) => {
  const { query, type } = req.query;

  if (!query) {
    res.status(400);
    throw new Error('Please provide a search query');
  }

  const places = await gSearchPlaces(query, type);
  res.status(200).json(places);
});

// @desc    Get place details
// @route   GET /api/places/:placeId
// @access  Private
const getPlaceDetails = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  if (!placeId) {
    res.status(400);
    throw new Error('Please provide a placeId');
  }

  const details = await gGetPlaceDetails(placeId);
  res.status(200).json(details);
});

module.exports = {
  searchPlaces,
  getPlaceDetails
};
