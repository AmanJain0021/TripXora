import React, { useState } from 'react';
import { generateItinerary, replanItinerary } from '../../api/ai.api';
import { useTrip } from '../../hooks/useTrip';

const ItineraryView = ({ trip }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [instruction, setInstruction] = useState('');
  const { fetchTrip } = useTrip();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateItinerary(trip._id);
      await fetchTrip(trip._id);
    } catch (err) {
      setError('Failed to generate itinerary. Try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplan = async (customInstruction) => {
    if (!customInstruction.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      await replanItinerary(trip._id, customInstruction);
      await fetchTrip(trip._id);
      setInstruction('');
    } catch (err) {
      setError('Failed to adjust itinerary. Try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveItem = (itemName, dayIndex) => {
    const prompt = `Remove "${itemName}" from Day ${dayIndex} and fill the gap logically without going over budget.`;
    handleReplan(prompt);
  };

  if (isGenerating) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center h-full flex flex-col items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">AI is adjusting your trip...</h3>
        <p className="text-gray-500 text-sm">Analyzing places, optimizing routes, and checking budgets.</p>
      </div>
    );
  }

  if (!trip.itinerary || trip.itinerary.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Itinerary Yet</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">
          Select some places you want to visit, then let our AI generate an optimized day-by-day plan.
        </p>
        <button
          onClick={handleGenerate}
          className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm w-full"
        >
          ✨ Generate AI Itinerary
        </button>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h3 className="text-xl font-bold text-gray-900">Your Itinerary</h3>
        <button
          onClick={handleGenerate}
          className="text-primary text-sm font-medium hover:underline flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Re-generate
        </button>
      </div>

      <div className="p-4 bg-blue-50/50 border-b border-gray-100 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Add 2 hours of rest on Day 1"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button
            onClick={() => handleReplan(instruction)}
            disabled={!instruction.trim()}
            className="bg-primary text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors shrink-0"
          >
            Adjust ✨
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-8">
        {trip.itinerary.map((day) => (
          <div key={day.dayIndex} className="relative">
            <h4 className="font-bold text-gray-900 mb-4 sticky top-0 bg-white/95 backdrop-blur py-2 z-10 border-b border-gray-100">
              Day {day.dayIndex} <span className="text-gray-400 font-normal ml-2">{day.date}</span>
            </h4>
            
            <div className="space-y-4">
              {day.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-semibold text-gray-500 w-16 text-right pt-1 group-hover:text-primary transition-colors">
                      {item.time}
                    </div>
                    {idx !== day.items.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors relative">
                      <button 
                        onClick={() => handleRemoveItem(item.name, day.dayIndex)}
                        className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove activity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                      
                      <div className="flex justify-between items-start mb-2 pr-8">
                        <div className="flex gap-3 items-center">
                          {item.photo_url && (
                            <img src={item.photo_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <h5 className="font-semibold text-gray-900 text-sm">{item.name}</h5>
                        </div>
                        {item.cost > 0 && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded shrink-0">
                            ₹{item.cost}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="capitalize px-2 py-0.5 bg-white rounded border border-gray-200">
                          {item.type}
                        </span>
                        <span>⏱ {Math.round(item.duration / 60)}h {item.duration % 60 > 0 ? `${item.duration % 60}m` : ''}</span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 bg-white/50 p-2 rounded-lg border border-gray-100 pr-8">
                          💡 {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryView;
