import client from './client';

export const calculateRoute = async (origin, destination, waypoints = [], mode = 'car') => {
  const response = await client.post('/routes/calculate', { origin, destination, waypoints, mode });
  return response.data;
};
