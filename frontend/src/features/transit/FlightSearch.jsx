import React, { useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const FlightSearch = ({ currentTrip }) => {
  const { user } = useAuth();
  
  const [origin, setOrigin] = useState(currentTrip?.origin?.name || '');
  const [destination, setDestination] = useState(currentTrip?.destination?.name || '');
  const [date, setDate] = useState(
    currentTrip?.startDate ? new Date(currentTrip.startDate).toISOString().split('T')[0] : ''
  );
  const [cabinClass, setCabinClass] = useState('ALL');
  
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      const response = await client.get(
        `/transit/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}&cabinClass=${cabinClass}`
      );
      
      if (response.data.success) {
        setFlights(response.data.data.flights);
      } else {
        setError(response.data.message || 'Failed to find flights.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to Flight API.');
    } finally {
      setLoading(false);
    }
  };

  const getAirlineColor = (code) => {
    switch (code) {
      case '6E': return 'from-blue-600 to-indigo-700 text-blue-300';
      case 'AI': return 'from-red-600 to-amber-600 text-red-300';
      case 'UK': return 'from-purple-700 to-pink-700 text-purple-300';
      case 'QP': return 'from-amber-500 to-orange-600 text-amber-200';
      default: return 'from-sky-600 to-blue-800 text-sky-300';
    }
  };

  return (
    <div className="bg-[#0f172a] p-5 h-full flex flex-col text-gray-200">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Check Flight Tickets
        </h3>
        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
          Live API
        </span>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div className="space-y-3">
          {/* Origin */}
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-sky-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
               </svg>
             </div>
             <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Departure Airport / City"
                className="w-full pl-9 pr-4 py-2.5 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-white placeholder-gray-500 text-sm"
             />
          </div>
          
          {/* Destination */}
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-emerald-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
               </svg>
             </div>
             <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Arrival Airport / City"
                className="w-full pl-9 pr-4 py-2.5 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-white placeholder-gray-500 text-sm"
             />
          </div>

          {/* Departure Date */}
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-purple-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
             </div>
             <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-white text-sm"
             />
          </div>

          {/* Cabin Class Selection */}
          <div className="flex gap-2 text-xs">
            {['ALL', 'Economy', 'Business'].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setCabinClass(cls)}
                className={`flex-1 py-1.5 rounded-md border font-medium transition-colors ${
                  cabinClass === cls
                    ? 'bg-sky-600/30 border-sky-500 text-sky-300'
                    : 'bg-[#161E31] border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !origin || !destination || !date}
          className="w-full bg-sky-600/20 text-sky-400 border border-sky-500/30 px-5 py-2.5 rounded-lg font-bold hover:bg-sky-600/30 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {loading ? 'Searching Flights...' : 'Find Flights'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-4"></div>
             Searching best flight routes...
          </div>
        )}

        {!loading && flights.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500 text-sm flex flex-col items-center">
             <svg className="w-12 h-12 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
             </svg>
             Search to see live flight fares & schedules
          </div>
        )}

        {!loading && flights.map((flight, idx) => (
          <div key={idx} className="bg-[#161E31] border border-gray-700/80 rounded-xl overflow-hidden hover:border-gray-500 transition-colors shadow-sm">
            {/* Header */}
            <div className="p-3 border-b border-gray-700/50 bg-[#1E293B]/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-black bg-gradient-to-br ${getAirlineColor(flight.code)} text-white`}>
                  {flight.code}
                </div>
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  {flight.airline} 
                  <span className="text-[10px] font-mono text-gray-400 bg-[#0f172a] px-1.5 py-0.5 rounded border border-gray-700">
                    {flight.flightNo}
                  </span>
                </h4>
              </div>
              <span className="text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 font-semibold">
                {flight.stops}
              </span>
            </div>
            
            {/* Route Details */}
            <div className="p-3 flex justify-between items-center border-b border-gray-700/50">
               <div className="text-center">
                 <p className="text-lg font-bold text-white leading-none">{flight.departureTime}</p>
                 <p className="text-[10px] text-gray-400 uppercase font-semibold mt-1">{origin.substring(0, 3).toUpperCase() || 'DEP'}</p>
               </div>
               
               <div className="flex-1 px-4 relative flex flex-col items-center justify-center">
                  <span className="text-[11px] text-gray-400 font-medium mb-1">{flight.duration}</span>
                  <div className="h-px bg-gray-700 w-full relative flex items-center justify-center">
                    <div className="bg-[#161E31] px-1 z-10 text-sky-400 transform rotate-90">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                      </svg>
                    </div>
                  </div>
               </div>

               <div className="text-center">
                 <p className="text-lg font-bold text-white leading-none">{flight.arrivalTime}</p>
                 <p className="text-[10px] text-gray-400 uppercase font-semibold mt-1">{destination.substring(0, 3).toUpperCase() || 'ARR'}</p>
               </div>
            </div>

            {/* Cabin Fares & Action */}
            <div className="p-3 bg-[#0f172a]/50 flex flex-col gap-2.5">
               <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                 {flight.classes.map((cls, i) => (
                   <div key={i} className={`shrink-0 border rounded-lg p-2 text-center min-w-[85px] ${cls.available ? 'border-sky-500/30 bg-sky-500/5 cursor-pointer hover:bg-sky-500/10 transition-colors' : 'border-gray-700/50 bg-gray-800/30 opacity-60'}`}>
                     <p className={`text-xs font-bold ${cls.available ? 'text-sky-300' : 'text-gray-500'}`}>{cls.type}</p>
                     <p className={`text-xs mt-0.5 ${cls.available ? 'text-white font-extrabold' : 'text-gray-500'}`}>₹{cls.price.toLocaleString('en-IN')}</p>
                     {cls.seatsLeft && (
                       <p className="text-[9px] mt-0.5 text-emerald-400 font-medium">
                         {cls.seatsLeft} seats left
                       </p>
                     )}
                   </div>
                 ))}
               </div>

               <div className="pt-2 border-t border-gray-700/40 flex items-center justify-between">
                 <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                   Instant Confirmation
                 </span>
                 <a
                   href="https://www.makemytrip.com/flights/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition-all flex items-center gap-1.5 active:scale-95"
                 >
                   <span>Book Now</span>
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                   </svg>
                 </a>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightSearch;
