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
    return 'Local Sightseeing & Exploration';
  };

  if (isGenerating) {
    return (
      <div className="p-8 text-center h-full flex flex-col items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6D3DF5] mb-4"></div>
        <p className="text-[#697386] text-sm font-medium">TripXora is crafting your visual route...</p>
      </div>
    );
  }

  if (!trip.itinerary || trip.itinerary.length === 0) {
    return (
      <div className="text-center flex-1 flex flex-col items-center justify-center p-6 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
        <div className="w-10 h-10 rounded-full bg-[#F0EBFF] text-[#6D3DF5] flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <h3 className="text-base font-bold text-[#172033] mb-1">No Itinerary Yet</h3>
        <p className="text-[#697386] text-xs mb-4 max-w-xs font-medium">
          Generate an optimized day-by-day travel plan.
        </p>
        <button
          onClick={handleGenerate}
          className="btn-primary text-xs w-full py-2"
        >
          ✨ Generate Itinerary
        </button>
        {error && <p className="text-red-500 text-xs mt-3 font-semibold">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${darkTheme ? 'text-gray-200' : 'text-[#172033]'}`}>
      <div className="flex-1 overflow-y-auto" style={{scrollbarWidth: 'none'}}>
        <div className="relative border-l border-[#E5E7EB] ml-3 pb-4 mt-2 space-y-6">
          {trip.itinerary.map((day) => (
            <div key={day.dayIndex} className="relative">
              {/* Day Badge */}
              <div className="absolute -left-[1.4rem] top-0 flex items-center justify-center bg-white py-0.5">
                <span className="badge-purple font-extrabold text-xs px-2.5 py-1 border border-[#6D3DF5]/30">
                  Day {day.dayIndex}
                </span>
              </div>
              
              <div className="ml-8">
                <h4 className="font-extrabold text-[#172033] mb-3 text-sm leading-tight pr-2">
                  {generateDayTitle(day.items)}
                </h4>
                
                <div className="mt-4 mb-6 space-y-4">
                  {day.items.map((item, idx) => {
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
                          <div className="w-14 text-[11px] text-[#697386] font-semibold text-right pr-2 pt-1 shrink-0">
                            {item.time || item.startTime || getTimeForIndex(idx)}
                          </div>
                          
                          {/* Timeline line */}
                          <div className="relative border-l border-[#E5E7EB] pl-3 w-full pb-3">
                            {/* dot */}
                            <div className="absolute -left-[5px] top-2.5 w-2 h-2 bg-[#6D3DF5] rounded-full group-hover:scale-125 transition-transform"></div>
                            
                            {/* Item Card */}
                            <div className="bg-white rounded-lg p-3 border border-[#E5E7EB] shadow-sm hover:border-[#6D3DF5] hover:shadow-md transition-all">
                               <div className="flex gap-3">
                                  {item.photo_url && (
                                     <img src={item.photo_url} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#E5E7EB]" alt={item.name} />
                                  )}
                                  <div className="flex-1">
                                     <h5 className="font-bold text-[#172033] text-xs group-hover:text-[#6D3DF5] transition-colors">{item.name}</h5>
                                     <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#697386] bg-[#F7F8FA] border border-[#E5E7EB] px-1.5 py-0.5 rounded">{item.type}</span>
                                        {item.duration && (
                                          <span className="text-[10px] text-[#697386] flex items-center gap-1 font-medium">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {item.duration} {typeof item.duration === 'number' ? 'mins' : ''}
                                          </span>
                                        )}
                                        {item.cost > 0 && <span className="badge-green text-[10px] py-0.5 ml-auto">₹{item.cost}</span>}
                                     </div>
                                  </div>
                               </div>

                               {item.notes && (
                                  <div className="mt-2.5 p-2 bg-[#F7F8FA] rounded-md border border-[#E5E7EB] text-[11px] text-[#697386] flex items-start gap-1.5 font-medium">
                                     <span className="text-[#F28C28] shrink-0">💡</span>
                                     <span className="leading-snug">{item.notes}</span>
                                  </div>
                               )}
                               
                               {/* Ride Booking Options */}
                               {distance && distance > 0 && nextItem && (
                                  <div className="mt-2.5 pt-2 border-t border-[#E5E7EB] flex justify-between items-center">
                                     <span className="text-[10px] text-[#697386] font-medium">Book cab to next stop:</span>
                                     <div className="flex gap-1.5">
                                        <a 
                                           href={`https://book.olacabs.com/?pickup_lat=${item.coordinates.lat}&pickup_lng=${item.coordinates.lng}&pickup_name=${encodeURIComponent(item.name)}&drop_lat=${nextItem.coordinates.lat}&drop_lng=${nextItem.coordinates.lng}&drop_name=${encodeURIComponent(nextItem.name)}`}
                                           target="_blank" rel="noopener noreferrer"
                                           onClick={(e) => e.stopPropagation()}
                                           className="text-[9px] font-bold bg-[#cde021] text-black hover:bg-[#b8c91d] px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                                        >
                                           Ola
                                        </a>
                                        <a 
                                           href={`https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${item.coordinates.lat}&pickup[longitude]=${item.coordinates.lng}&pickup[nickname]=${encodeURIComponent(item.name)}&dropoff[latitude]=${nextItem.coordinates.lat}&dropoff[longitude]=${nextItem.coordinates.lng}&dropoff[nickname]=${encodeURIComponent(nextItem.name)}`}
                                           target="_blank" rel="noopener noreferrer"
                                           onClick={(e) => e.stopPropagation()}
                                           className="text-[9px] font-bold bg-[#172033] text-white hover:bg-black px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                                        >
                                           Uber
                                        </a>
                                        <a 
                                           href={`https://www.google.com/maps/dir/?api=1&origin=${item.coordinates.lat},${item.coordinates.lng}&destination=${nextItem.coordinates.lat},${nextItem.coordinates.lng}&travelmode=driving`}
                                           target="_blank" rel="noopener noreferrer"
                                           onClick={(e) => e.stopPropagation()}
                                           className="text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                        >
                                           Maps
                                        </a>
                                     </div>
                                  </div>
                               )}
                            </div>
                            
                            {/* Distance Indicator */}
                            {distance && distance > 0 && (
                               <div className="absolute -bottom-2.5 left-[-16px] flex items-center bg-white px-1.5 py-0.5 rounded-full border border-[#E5E7EB] shadow-xs z-10">
                                  <svg className="w-2.5 h-2.5 text-[#4A90E2] mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                  <span className="text-[9px] font-bold text-[#697386]">{distance} km</span>
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

      <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
        <div className="flex gap-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Adjust itinerary (e.g., Add more nature spots)"
            className="flex-1 px-3 py-1.5 text-xs bg-[#F7F8FA] border border-[#E5E7EB] text-[#172033] rounded-lg focus:ring-1 focus:ring-[#6D3DF5] outline-none placeholder-[#697386] font-medium"
          />
          <button
            onClick={() => handleReplan(instruction)}
            disabled={!instruction.trim() || isGenerating}
            className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
          >
            Adjust
          </button>
        </div>
        <button
          onClick={handleGenerate}
          className="text-[#697386] text-[11px] font-semibold hover:text-[#6D3DF5] transition-colors mt-2 text-center w-full"
        >
          Reset / Re-generate Itinerary ↻
        </button>
      </div>
    </div>
  );
};

export default ItineraryView;
