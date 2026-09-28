import React, { useState } from 'react';
import { generatePackingList } from '../../api/ai.api';

const ExtrasPanel = ({ trip }) => {
  const [packingList, setPackingList] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const getMockWeather = (destination) => {
    const temps = [22, 25, 28, 18, 30, 15, 32];
    const conditions = ['Sunny', 'Partly Cloudy', 'Clear', 'Light Rain'];
    
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

  const weather = getMockWeather(trip.destination?.name || 'Destination');

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
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col h-full overflow-hidden text-[#172033]">
      <div className="pb-3 border-b border-[#E5E7EB] flex justify-between items-center shrink-0 mb-4">
        <h3 className="text-base font-extrabold text-[#172033]">Weather & Extras</h3>
      </div>

      <div className="overflow-y-auto flex-1 space-y-6 pr-1">
        
        {/* Weather Forecast */}
        <div>
          <h4 className="font-extrabold text-[#172033] mb-2.5 text-xs uppercase tracking-wider">
            Forecast for {trip.destination?.name?.split(',')[0] || 'Destination'}
          </h4>
          <div className="bg-gradient-to-br from-[#4A90E2] to-[#357ABD] rounded-xl p-4 text-white shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div>
                <p className="text-3xl font-extrabold">{weather.temp}°C</p>
                <p className="text-blue-100 text-xs font-semibold mt-0.5">{weather.condition}</p>
              </div>
              <div className="text-4xl">
                {weather.condition.includes('Sun') || weather.condition.includes('Clear') ? '☀️' : '⛅'}
              </div>
            </div>
            
            <div className="flex justify-between border-t border-white/20 pt-3 relative z-10 text-xs">
              {weather.forecast.map((f, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-blue-100 mb-0.5">{f.day}</p>
                  <p className="text-base">{f.icon}</p>
                  <p className="font-bold">{f.temp}°</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Packing List */}
        <div>
          <h4 className="font-extrabold text-[#172033] mb-2.5 text-xs uppercase tracking-wider">Smart Packing List</h4>
          
          {!packingList && !isGenerating && (
            <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-[#F0EBFF] text-[#6D3DF5] rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-xs text-[#697386] mb-3 font-medium">Generate a packing checklist tailored to your destination and climate.</p>
              <button
                onClick={handleGeneratePacking}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Generate List
              </button>
              {error && <p className="text-red-500 text-xs mt-2 font-semibold">{error}</p>}
            </div>
          )}

          {isGenerating && (
            <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6D3DF5] mx-auto mb-2"></div>
              <p className="text-xs text-[#697386] font-medium">Analyzing destination climate & activities...</p>
            </div>
          )}

          {packingList && (
            <div className="space-y-3">
              {packingList.map((category, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs">
                  <h5 className="font-bold text-[#172033] text-xs mb-2">{category.name}</h5>
                  <ul className="space-y-1.5">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-center text-xs text-[#172033] font-medium">
                        <input type="checkbox" className="mr-2 rounded border-[#E5E7EB] text-[#6D3DF5] focus:ring-[#6D3DF5]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                onClick={handleGeneratePacking}
                className="w-full text-center text-xs font-bold text-[#6D3DF5] hover:text-[#5730D4] py-1"
              >
                Regenerate Checklist ↻
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtrasPanel;
