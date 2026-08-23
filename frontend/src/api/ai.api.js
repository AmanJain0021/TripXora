import client from './client';

export const parseTripInput = async (prompt) => {
  const response = await client.post('/ai/parse-trip', { prompt });
  return response.data;
};

export const generateItinerary = async (tripId) => {
  const response = await client.post(`/ai/generate-itinerary/${tripId}`);
  return response.data;
};

export const replanItinerary = async (tripId, instruction, newBudget = null) => {
  const body = { instruction };
  if (newBudget) body.newBudget = newBudget;
  const response = await client.post(`/ai/replan-itinerary/${tripId}`, body);
  return response.data;
};

export const generatePackingList = async (tripId) => {
  const response = await client.post(`/ai/packing-list/${tripId}`);
  return response.data;
};
