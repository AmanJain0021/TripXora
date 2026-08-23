import React, { useState } from 'react';
import { generatePackingList } from '../../api/ai.api';

const ExtrasPanel = ({ trip }) => {
  const [packingList, setPackingList] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Mock weather data based on destination for prototype purposes
  const getMockWeather = (destination) => {
    const temps = [22, 25, 28, 18, 30, 15, 32];
    const conditions = ['Sunny', 'Partly Cloudy', 'Clear', 'Light Rain'];
    
    // Simple determinism based on string length
    const tempIndex = destination.length % temps.length;
    const condIndex = destination.length % conditions.length;
    
    return {
      temp: temps[tempIndex],
      condition: conditions[condIndex],
      forecast: [
        { day: 'Today', temp: temps[tempIndex], icon: '☀️' },
        { day: 'Tmrw', temp: temps[(tempIndex + 1) % temps.length], icon: '⛅' },
        { day: 'Day 3', temp: temps[(tempIndex + 2) % temps.length], icon: '🌧️' }
      ]
    };
  };

  const weather = getMockWeather(trip.destination.name);

  const handleGeneratePacking = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generatePackingList(trip._id);
      setPackingList(data.categories);
    } catch (err) {
      setError('Failed to generate packing list.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h3 className="text-xl font-bold text-gray-900">Weather & Extras</h3>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-8">
        
        {/* Weather Widget */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Forecast for {trip.destination.name.split(',')[0]}</h4>
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                <p className="text-4xl font-extrabold">{weather.temp}°C</p>
                <p className="text-blue-100 font-medium mt-1">{weather.condition}</p>
              </div>
              <div className="text-5xl">
                {weather.condition.includes('Sun') || weather.condition.includes('Clear') ? '☀️' : '⛅'}
              </div>
            </div>
            
            <div className="flex justify-between border-t border-white/20 pt-4 relative z-10">
              {weather.forecast.map((f, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-blue-100 mb-1">{f.day}</p>
                  <p className="text-lg">{f.icon}</p>
                  <p className="text-sm font-bold">{f.temp}°</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Packing List */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Smart Packing List</h4>
          
          {!packingList && !isGenerating && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">Generate a personalized packing list based on your destination and activities.</p>
              <button
                onClick={handleGeneratePacking}
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Generate List
              </button>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
          )}

          {isGenerating && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm text-gray-500 font-medium">Analyzing trip & weather...</p>
            </div>
          )}

          {packingList && (
            <div className="space-y-4">
              {packingList.map((category, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h5 className="font-bold text-gray-900 mb-3">{category.name}</h5>
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <input type="checkbox" className="mt-1 mr-3 rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                onClick={handleGeneratePacking}
                className="w-full text-center text-xs font-semibold text-primary hover:text-blue-700 py-2"
              >
                Regenerate List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtrasPanel;
