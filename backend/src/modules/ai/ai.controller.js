const asyncHandler = require('../../utils/asyncHandler');
const { generateStructuredOutput } = require('../../services/ai/geminiProvider');
const tripParseSchema = require('../../services/ai/schemas/tripParse.schema');
const itinerarySchema = require('../../services/ai/schemas/itinerary.schema');
const Trip = require('../trip/trip.model');
const { recalculateBudget } = require('../budget/budget.service');

// @desc    Parse natural language trip input
// @route   POST /api/ai/parse-trip
// @access  Private
const parseTripInput = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400);
    throw new Error('Please provide a prompt');
  }

  const systemInstruction = `You are a travel planning assistant. Extract the requested fields from the user's input.
  If a field is not explicitly mentioned but can be logically inferred (e.g., 'to my home in Delhi' -> destination is Delhi), extract it.
  If a field is completely missing, return null or the default value as specified in the schema.
  User Input: "${prompt}"`;

  const parsedData = await generateStructuredOutput(systemInstruction, tripParseSchema);
  
  res.status(200).json(parsedData);
});

// @desc    Generate full itinerary for a trip
// @route   POST /api/ai/generate-itinerary/:tripId
// @access  Private
const generateItinerary = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this trip');
  }

  const systemInstruction = `You are a master travel planner. Generate a highly detailed day-by-day, hour-by-hour itinerary for this trip.
  
Trip Constraints:
- Origin: ${trip.origin.name}
- Destination: ${trip.destination.name}
- Start Date: ${trip.startDate}
- End Date: ${trip.endDate}
- Travelers: ${trip.travelers}
- Travel Mode: ${trip.travelMode}
- Total Budget: ${trip.budget?.totalBudget || 'Unspecified'}
- Pace: ${trip.preferences?.travelPace || 'moderate'}
- Interests: ${trip.preferences?.interests?.join(', ') || 'General sightseeing'}

User Selected Places that MUST be included if possible:
${JSON.stringify(trip.selectedPlaces.map(p => ({ name: p.name, category: p.category, rating: p.rating, photo_url: p.photo_url })), null, 2)}

Rules:
1. Ensure the travel time between places is logical.
2. Group nearby places on the same day.
3. Keep the budget constraint in mind. If a selected place pushes them over budget, mention it in the optimizationNotes.
4. Fill in gaps with logical suggestions (e.g., if no restaurants were selected, suggest some for meals).
5. Ensure there is time allocated for travel from origin to destination and back.`;

  const aiResult = await generateStructuredOutput(systemInstruction, itinerarySchema, 'gemini-2.5-flash');

  if (aiResult.itinerary) {
    trip.itinerary = aiResult.itinerary;
    trip.status = 'planned';
    if (aiResult.optimizationNotes) {
      trip.optimizationMetadata = {
        lastOptimizedAt: new Date(),
        optimizationNotes: aiResult.optimizationNotes
      };
    }
    
    // Recalculate budget based on generated itinerary
    trip.budget = recalculateBudget(trip);
    
    await trip.save();
  }

  res.status(200).json(trip);
});

// @desc    Replan/Adjust existing itinerary based on user instruction
// @route   POST /api/ai/replan-itinerary/:tripId
// @access  Private
const replanItinerary = asyncHandler(async (req, res) => {
  const { instruction, newBudget } = req.body;
  const trip = await Trip.findById(req.params.tripId);
  
  if (!trip || !trip.itinerary) {
    res.status(404);
    throw new Error('Trip or existing itinerary not found');
  }

  if (trip.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this trip');
  }

  if (newBudget) {
    trip.budget.totalBudget = Number(newBudget);
    await trip.save(); // save the new budget constraint before passing to AI
  }

  if (!instruction) {
    res.status(400);
    throw new Error('Please provide an instruction for replanning');
  }

  const systemInstruction = `You are a master travel planner. The user wants to modify their existing itinerary.
  
Trip Constraints:
- Total Budget: ${trip.budget?.totalBudget || 'Unspecified'}
- Current Estimated Cost: ${trip.budget?.totalEstimated || 0}

Current Itinerary Data (JSON):
${JSON.stringify(trip.itinerary, null, 2)}

User's Modification Request: "${instruction}"

Rules:
1. Apply the user's requested modification (e.g., removing a place, adding a place, or shuffling times). If the user asks for cheaper alternatives, replace expensive items. If they increased the budget, you can upgrade items or suggest better ones.
2. Fix any time gaps or illogical routing created by the change.
3. STRICTLY keep the new total budget constraint in mind.
4. Output the complete, updated day-by-day itinerary.`;

  const aiResult = await generateStructuredOutput(systemInstruction, itinerarySchema, 'gemini-2.5-flash');

  if (aiResult.itinerary) {
    trip.revisionHistory.push({
      revisionNumber: trip.revisionHistory.length + 1,
      changeType: 'ai_replan',
      changeSummary: instruction,
      createdAt: new Date()
    });

    trip.itinerary = aiResult.itinerary;
    
    if (aiResult.optimizationNotes) {
      trip.optimizationMetadata.optimizationNotes = [
        ...trip.optimizationMetadata.optimizationNotes,
        `Budget Optimization / Replan: ${instruction}`,
        ...aiResult.optimizationNotes
      ];
    }
    
    trip.budget = recalculateBudget(trip);
    await trip.save();
  }

  res.status(200).json(trip);
});

// @desc    Generate a packing list based on trip details
// @route   POST /api/ai/packing-list/:tripId
// @access  Private
const generatePackingList = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.tripId);
  
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this trip');
  }

  const { Type } = require('../../services/ai/geminiProvider');
  const packingSchema = {
    type: Type.OBJECT,
    properties: {
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Category name, e.g., 'Clothing', 'Electronics'" },
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of items to pack"
            }
          },
          required: ["name", "items"]
        }
      }
    },
    required: ["categories"]
  };

  const systemInstruction = `You are a travel assistant. Generate a highly relevant packing list for a trip.
Trip Constraints:
- Destination: ${trip.destination.name}
- Start Date: ${trip.startDate}
- End Date: ${trip.endDate}
- Travelers: ${trip.travelers}
- Interests: ${trip.preferences?.interests?.join(', ') || 'General'}
Consider the likely weather for the destination during these dates.`;

  const aiResult = await generateStructuredOutput(systemInstruction, packingSchema, 'gemini-2.5-flash');

  res.status(200).json(aiResult);
});

module.exports = {
  parseTripInput,
  generateItinerary,
  replanItinerary,
  generatePackingList
};
