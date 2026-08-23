import client from './client';

export const getTrips = async () => {
  const response = await client.get('/trips');
  return response.data;
};

export const getTripById = async (id) => {
  const response = await client.get(`/trips/${id}`);
  return response.data;
};

export const createTrip = async (tripData) => {
  const response = await client.post('/trips', tripData);
  return response.data;
};

export const updateTrip = async (id, tripData) => {
  const response = await client.put(`/trips/${id}`, tripData);
  return response.data;
};

export const deleteTrip = async (id) => {
  const response = await client.delete(`/trips/${id}`);
  return response.data;
};
