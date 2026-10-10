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
    interests: [],
    ageGroup: 'all-ages',
    hotelType: 'no_preference'
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
        interests: prefilledData.interests || prev.interests,
        ageGroup: prefilledData.ageGroup || prev.ageGroup,
        hotelType: prefilledData.hotelType || prefilledData.preferences?.hotelType || prev.hotelType
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
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date(Date.now() + 86400000).toISOString(),
        travelers: Number(formData.travelers),
        travelMode: formData.travelMode,
        budget: Number(formData.budget),
        preferences: {
          interests: formData.interests,
          ageGroup: formData.ageGroup,
          hotelType: formData.hotelType
        }
      };
      
      const newTrip = await createTrip(payload);
      navigate(`/dashboard?tripId=${newTrip._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="travel-card p-8">
      <h3 className="text-xl font-bold text-[#172033] mb-6 border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
        <span>Trip Details</span>
        <span className="badge-purple">
          Custom Itinerary
        </span>
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">From (Origin)</label>
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
            placeholder="e.g. Indore"
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] placeholder-[#697386] text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">To (Destination)</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            placeholder="e.g. Bhopal"
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] placeholder-[#697386] text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Travelers</label>
          <input
            type="number"
            name="travelers"
            min="1"
            value={formData.travelers}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Budget (INR ₹)</label>
          <input
            type="number"
            name="budget"
            min="0"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g. 15000"
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] placeholder-[#697386] text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Travel Mode</label>
          <select
            name="travelMode"
            value={formData.travelMode}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] text-sm cursor-pointer font-medium"
          >
            <option value="car">🚗 Car / Road Trip</option>
            <option value="bike">🏍️ Bike</option>
            <option value="bus">🚌 Bus</option>
            <option value="train">🚆 Train</option>
            <option value="flight">✈️ Flight</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Group Dynamic</label>
          <select
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] text-sm cursor-pointer font-medium"
          >
            <option value="all-ages">All Ages (Mixed Family/Friends)</option>
            <option value="kids">Family with Kids (0-12 yrs)</option>
            <option value="teens">Youth & Teens (13-17 yrs)</option>
            <option value="adults">Solo / Adults (18-59 yrs)</option>
            <option value="seniors">Seniors (60+ yrs)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Stay Preference</label>
          <select
            name="hotelType"
            value={formData.hotelType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] text-sm cursor-pointer font-medium"
          >
            <option value="5_star">5 Star Hotel / Resort</option>
            <option value="4_star">4 Star Boutique Hotel</option>
            <option value="3_star">3 Star Comfortable Hotel</option>
            <option value="budget">Budget Hotel</option>
            <option value="homestay">Heritage Homestay</option>
            <option value="hostel">Backpacker Hostel</option>
            <option value="no_preference">No Preference</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Interests (comma separated)</label>
        <input
          type="text"
          value={formData.interests.join(', ')}
          onChange={handleInterestsChange}
          placeholder="Historical, Food, Lakes, Photography, Nature"
          className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none text-[#172033] placeholder-[#697386] text-sm font-medium"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary py-3 px-8 text-sm"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Crafting Itinerary...
            </>
          ) : (
            'Generate My Travel Plan ✈️'
          )}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
