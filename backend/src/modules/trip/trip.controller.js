const Trip = require('./trip.model');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  const {
    origin,
    destination,
    startDate,
    endDate,
    travelers,
    travelMode,
    budget,
    preferences
  } = req.body;

  const trip = await Trip.create({
    userId: req.user._id,
    origin,
    destination,
    startDate,
    endDate,
    travelers,
    travelMode,
    budget: {
      totalBudget: budget,
      status: 'pending'
    },
    preferences,
    status: 'draft'
  });

  res.status(201).json(trip);
});

// @desc    Get user trips
// @route   GET /api/trips
// @access  Private
const getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(trips);
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  // Check ownership
  if (trip.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this trip');
  }

  res.status(200).json(trip);
});

// @desc    Update trip parameters
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this trip');
  }

  const updatedTrip = await Trip.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedTrip);
});

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this trip');
  }

  await trip.deleteOne();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
};
