const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema({
  time: String,
  type: {
    type: String,
    enum: ['attraction', 'meal', 'travel', 'hotel', 'rest'],
  },
  name: String,
  duration: Number, // in minutes
  cost: Number,
  notes: String,
  photo_url: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

const itineraryDaySchema = new mongoose.Schema({
  dayIndex: Number,
  date: Date,
  items: [itineraryItemSchema]
});

const stopSchema = new mongoose.Schema({
  name: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  order: Number,
  stayDuration: Number,
  addedBy: {
    type: String,
    enum: ['user', 'system'],
    default: 'user'
  }
});

const selectedPlaceSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  category: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  visitDuration: Number,
  entryCost: Number,
  rating: Number,
  dayIndex: Number,
  reason: String,
  photo_url: String
});

const accommodationSchema = new mongoose.Schema({
  dayIndex: Number,
  name: String,
  type: {
    type: String,
    enum: ['budget', 'mid-range', 'luxury']
  },
  estimatedCost: Number,
  isEstimated: {
    type: Boolean,
    default: true
  },
  location: {
    lat: Number,
    lng: Number
  }
});

const revisionSchema = new mongoose.Schema({
  revisionNumber: Number,
  changeType: String,
  changeSummary: String,
  diff: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'active', 'completed'],
    default: 'draft'
  },
  
  // Trip Parameters
  origin: {
    name: { type: String, required: true },
    coordinates: { lat: Number, lng: Number }
  },
  destination: {
    name: { type: String, required: true },
    coordinates: { lat: Number, lng: Number }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  travelers: { type: Number, required: true, min: 1 },
  travelMode: {
    type: String,
    enum: ['car', 'bike', 'bus', 'train', 'flight'],
    default: 'car'
  },
  preferences: {
    interests: [String],
    travelPace: {
      type: String,
      enum: ['relaxed', 'moderate', 'packed'],
      default: 'moderate'
    },
    foodPreference: String
  },
  
  // Planned Data
  stops: [stopSchema],
  selectedPlaces: [selectedPlaceSchema],
  
  route: {
    totalDistance: Number,
    totalDuration: Number,
    polyline: String,
    legs: [{
      from: String,
      to: String,
      distance: Number,
      duration: Number
    }]
  },
  
  accommodation: [accommodationSchema],
  itinerary: [itineraryDaySchema],
  
  budget: {
    totalBudget: Number,
    currency: { type: String, default: 'INR' },
    breakdown: {
      transport: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      localTransport: { type: Number, default: 0 },
      miscellaneous: { type: Number, default: 0 }
    },
    totalEstimated: { type: Number, default: 0 },
    perPerson: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['within', 'over', 'optimized', 'pending'],
      default: 'pending'
    }
  },
  
  revisionHistory: [revisionSchema],
  
  optimizationMetadata: {
    lastOptimizedAt: Date,
    optimizationNotes: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
