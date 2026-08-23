import client from './client';

export const searchPlaces = async (query, type) => {
  const params = { query };
  if (type) params.type = type;
  
  const response = await client.get('/places/search', { params });
  return response.data;
};

export const getPlaceDetails = async (placeId) => {
  const response = await client.get(`/places/${placeId}`);
  return response.data;
};
