import React, { useState } from 'react';
import { generateItinerary, replanItinerary } from '../../api/ai.api';
import { useTrip } from '../../hooks/useTrip';

const getDistance = (coord1, coord2) => {
  if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) return null;
  const R = 6371; // km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

const ItineraryView = ({ trip, onPlaceClick, darkTheme = false }) => {
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

  const handlePreview = (item) => {
    if (onPlaceClick) {
      onPlaceClick({
        name: item.name,
        category: item.type,
        photo_url: item.photo_url,
        notes: item.notes,
        cost: item.cost
      });
    }
  };

  const generateDayTitle = (items) => {
    const locations = items
      .filter(i => i.type === 'attraction' || i.name.toLowerCase().includes('drive') || i.name.toLowerCase().includes('flight'))
      .map(i => {
        let name = i.name;
        if (name.toLowerCase().includes('drive to ')) name = name.replace(/drive to /i, '');
        if (name.toLowerCase().includes('travel to ')) name = name.replace(/travel to /i, '');
        return name;
      })
      .slice(0, 3);
      
    if (locations.length > 0) return locations.join(' → ');
    return 'Local Sightseeing & Leisure';
  };

  if (isGenerating) {
    return (
      <div className="p-8 text-center h-full flex flex-col items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400 text-sm">TripXora is optimizing your route...</p>
      </div>
    );
  }

  if (!trip.itinerary || trip.itinerary.length === 0) {
    return (
      <div className="text-center flex-1 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Itinerary Yet</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">
          Let TripXora generate an optimized day-by-day plan.
        </p>
        <button
          onClick={handleGenerate}
          className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-6 py-2 rounded-lg font-medium hover:bg-blue-600/30 transition-colors shadow-sm w-full"
        >
          ✨ Generate Itinerary
        </button>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>
    );
  }

  const getDayColor = (index) => {
    const colors = [
      'from-emerald-500 to-teal-400',
      'from-blue-500 to-indigo-500',
      'from-purple-500 to-fuchsia-500',
      'from-orange-500 to-red-500',
    ];
    return colors[(index - 1) % colors.length];
  };

  return (
    <div className="flex flex-col h-full text-gray-200">
      <div className="flex-1 overflow-y-auto" style={{scrollbarWidth: 'none'}}>
        <div className="relative border-l border-gray-700 ml-4 pb-4 mt-4 space-y-8">
          {trip.itinerary.map((day, dIdx) => (
            <div key={day.dayIndex} className="relative">
              {/* Day Badge */}
              <div className="absolute -left-[1.65rem] top-0 flex items-center justify-center bg-[#161E31] py-1">
                <div className={`bg-gradient-to-r ${getDayColor(day.dayIndex)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-[#161E31]`}>
                  Day {day.dayIndex}
                </div>
              </div>
              
              <div className="ml-10">
                <h4 className="font-bold text-white mb-3 text-sm leading-tight pr-2">
                  {generateDayTitle(day.items)}
                </h4>
                
                <div className="mt-6 mb-8">
                  {day.items.map((item, idx) => {
                    // Fallback mock time since not all AI outputs have a strict time field
                    const getTimeForIndex = (i) => {
                      const times = ['08:00 AM', '09:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM', '06:30 PM', '08:00 PM'];
                      return times[i % times.length];
                    };

                    const nextItem = day.items[idx + 1];
                    const distance = nextItem ? getDistance(item.coordinates, nextItem.coordinates) : null;

                    return (
                      <div key={idx} className="relative w-full">
                        <div 
                          className="flex w-full cursor-pointer group"
                          onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                        >
                          {/* Time column */}
                          <div className="w-16 text-[10px] text-gray-400 font-medium text-right pr-3 pt-1 shrink-0">
                            {item.time || item.startTime || getTimeForIndex(idx)}
                          </div>
                          
                          {/* Timeline line */}
                          <div className="relative border-l border-gray-700 pl-4 w-full pb-6">
                            {/* dot */}
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-gray-500 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                            
                            {/* Card */}
                            <div className="bg-[#1E293B] rounded-xl p-3 border border-gray-700/80 shadow-sm hover:border-gray-500 hover:shadow-md transition-all">
                               <div className="flex gap-3">
                                  {item.photo_url && (
                                     <img src={item.photo_url} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-700" alt={item.name} />
                                  )}
                                  <div className="flex-1">
                                     <h5 className="font-bold text-white text-[13px] leading-snug group-hover:text-blue-400 transition-colors">{item.name}</h5>
                                     <div className="flex items-center flex-wrap gap-2 mt-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded bg-[#0f172a]">{item.type}</span>
                                        {item.duration && (
                                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {item.duration} {typeof item.duration === 'number' ? 'mins' : ''}
                                          </span>
                                        )}
                                        {item.cost > 0 && <span className="text-[10px] text-emerald-400 font-bold ml-auto bg-emerald-500/10 px-1.5 py-0.5 rounded">₹{item.cost}</span>}
                                     </div>
                                  </div>
                               </div>
                               {item.notes && (
                                  <div className="mt-3 p-2 bg-[#0f172a] rounded-lg border border-gray-800 text-[11px] text-gray-400 flex items-start gap-2">
                                     <span className="text-yellow-500 mt-0.5 shrink-0 text-sm">💡</span>
                                     <span className="leading-relaxed">{item.notes}</span>
                                  </div>
                               )}
                               
                               {/* Ride Booking Options */}
                               {distance && distance > 0 && nextItem && (
                                  <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
                                     <span className="text-[10px] text-gray-500 font-medium">Book ride to next stop:</span>
                                     <div className="flex gap-2">
                                        <a 
                                           href={`https://book.olacabs.com/?pickup_lat=${item.coordinates.lat}&pickup_lng=${item.coordinates.lng}&pickup_name=${encodeURIComponent(item.name)}&drop_lat=${nextItem.coordinates.lat}&drop_lng=${nextItem.coordinates.lng}&drop_name=${encodeURIComponent(nextItem.name)}`}
                                           target="_blank" rel="noopener noreferrer"
                                           onClick={(e) => e.stopPropagation()}
                                           className="text-[10px] font-bold bg-[#cde021] text-black hover:bg-[#b8c91d] px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                        >
                                           Ola
                                        </a>
                                        <a 
                                           href={`https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${item.coordinates.lat}&pickup[longitude]=${item.coordinates.lng}&pickup[nickname]=${encodeURIComponent(item.name)}&dropoff[latitude]=${nextItem.coordinates.lat}&dropoff[longitude]=${nextItem.coordinates.lng}&dropoff[nickname]=${encodeURIComponent(nextItem.name)}`}
                                           target="_blank" rel="noopener noreferrer"
                                           onClick={(e) => e.stopPropagation()}
                                           className="text-[10px] font-bold bg-black text-white hover:bg-gray-800 px-3 py-1 rounded border border-gray-700 flex items-center gap-1 transition-colors"
                                        >
                                           Uber
                                        </a>
                                     </div>
                                  </div>
                               )}
                            </div>
                            
                            {/* Distance Badge */}
                            {distance && distance > 0 && (
                               <div className="absolute -bottom-3 left-[-22px] flex items-center bg-[#161E31] px-2 py-0.5 rounded-full border border-gray-700/80 z-10">
                                  <svg className="w-3 h-3 text-blue-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                  <span className="text-[9px] font-medium text-gray-400">{distance} km</span>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Adjust itinerary (e.g., Make it cheaper)"
            className="flex-1 px-3 py-2 text-sm bg-[#0f172a] border border-gray-700 text-white rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600"
          />
          <button
            onClick={() => handleReplan(instruction)}
            disabled={!instruction.trim() || isGenerating}
            className="bg-[#1E293B] text-blue-400 border border-gray-700 px-3 py-2 text-sm rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
          >
            Adjust
          </button>
        </div>
        <button
          onClick={handleGenerate}
          className="text-gray-500 text-xs font-medium hover:text-white transition-colors mt-2 text-center w-full"
        >
          Reset / Re-generate ↻
        </button>
      </div>
    </div>
  );
};

export default ItineraryView;
