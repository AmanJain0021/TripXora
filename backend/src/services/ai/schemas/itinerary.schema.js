const { Type } = require('../geminiProvider');

const itineraryItemSchema = {
  type: Type.OBJECT,
  properties: {
    time: { type: Type.STRING, description: "Time of the activity e.g. '09:00 AM'" },
    type: { type: Type.STRING, description: "Must be one of: 'attraction', 'meal', 'travel', 'hotel', 'rest'" },
    name: { type: Type.STRING, description: "Name of the place, activity, or travel segment" },
    duration: { type: Type.INTEGER, description: "Duration in minutes" },
    cost: { type: Type.INTEGER, description: "Estimated cost in the local currency. 0 if free." },
    notes: { type: Type.STRING, description: "Tips or important info for this activity" },
    photo_url: { type: Type.STRING, description: "URL of the photo for this place, copied exactly from the input if provided" },
    coordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER }
      }
    }
  },
  required: ["time", "type", "name", "duration", "cost"]
};

const itineraryDaySchema = {
  type: Type.OBJECT,
  properties: {
    dayIndex: { type: Type.INTEGER, description: "The day number, starting from 1" },
    date: { type: Type.STRING, description: "The date of the day in YYYY-MM-DD format" },
    items: {
      type: Type.ARRAY,
      items: itineraryItemSchema,
      description: "List of activities for the day in chronological order"
    }
  },
  required: ["dayIndex", "items"]
};

const fullItinerarySchema = {
  type: Type.OBJECT,
  properties: {
    itinerary: {
      type: Type.ARRAY,
      items: itineraryDaySchema,
      description: "The complete day-by-day itinerary"
    },
    optimizationNotes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Notes on how the AI optimized the trip based on constraints like budget, time, or geography."
    }
  },
  required: ["itinerary"]
};

module.exports = fullItinerarySchema;
