import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../hooks/useTrip';

const TripForm = ({ prefilledData }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    travelMode: 'car',
    interests: []
  });
  
  const { createTrip, loading, error } = useTrip();
  const navigate = useNavigate();

  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        origin: prefilledData.origin || prev.origin,
        destination: prefilledData.destination || prev.destination,
        startDate: prefilledData.startDate || prev.startDate,
        endDate: prefilledData.endDate || prev.endDate,
        travelers: prefilledData.travelers || prev.travelers,
        budget: prefilledData.budget || prev.budget,
        travelMode: prefilledData.travelMode || prev.travelMode,
        interests: prefilledData.interests || prev.interests
      }));
    }
  }, [prefilledData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestsChange = (e) => {
    const value = e.target.value;
    const interestsArray = value.split(',').map(i => i.trim()).filter(i => i);
    setFormData(prev => ({ ...prev, interests: interestsArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        origin: { name: formData.origin },
        destination: { name: formData.destination },
        startDate: formData.startDate || new Date().toISOString(), // Mock dates if not provided
        endDate: formData.endDate || new Date(Date.now() + 86400000).toISOString(),
        travelers: Number(formData.travelers),
        travelMode: formData.travelMode,
        budget: Number(formData.budget),
        preferences: {
          interests: formData.interests
        }
      };
      
      const newTrip = await createTrip(payload);
      navigate(`/dashboard?tripId=${newTrip._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Trip Details</h3>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
            placeholder="e.g. Indore"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            placeholder="e.g. Udaipur"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
          <input
            type="number"
            name="travelers"
            min="1"
            value={formData.travelers}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget (INR)</label>
          <input
            type="number"
            name="budget"
            min="0"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g. 15000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Travel Mode</label>
          <select
            name="travelMode"
            value={formData.travelMode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="flight">Flight</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</label>
        <input
          type="text"
          value={formData.interests.join(', ')}
          onChange={handleInterestsChange}
          placeholder="Historical, Food, Photography"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md disabled:opacity-70"
        >
          {loading ? 'Planning...' : 'Plan My Trip'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
