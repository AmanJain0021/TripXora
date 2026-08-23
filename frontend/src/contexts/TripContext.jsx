import React, { createContext, useState, useCallback } from 'react';
import { getTrips, getTripById, createTrip as createTripApi, updateTrip as updateTripApi, deleteTrip as deleteTripApi } from '../api/trips.api';

export const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrip = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await getTripById(id);
      setCurrentTrip(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trip details');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = async (tripData) => {
    setLoading(true);
    try {
      const newTrip = await createTripApi(tripData);
      setTrips([newTrip, ...trips]);
      setError(null);
      return newTrip;
    } catch (err) {
      setError('Failed to create trip');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id, tripData) => {
    setLoading(true);
    try {
      const updated = await updateTripApi(id, tripData);
      setTrips(trips.map(t => t._id === id ? updated : t));
      if (currentTrip && currentTrip._id === id) {
        setCurrentTrip(updated);
      }
      setError(null);
      return updated;
    } catch (err) {
      setError('Failed to update trip');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    setLoading(true);
    try {
      await deleteTripApi(id);
      setTrips(trips.filter(t => t._id !== id));
      if (currentTrip && currentTrip._id === id) {
        setCurrentTrip(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete trip');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TripContext.Provider value={{
      trips, currentTrip, loading, error,
      fetchTrips, fetchTrip, createTrip, updateTrip, deleteTrip, setCurrentTrip
    }}>
      {children}
    </TripContext.Provider>
  );
};
