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
      case '6E': return 'from-blue-600 to-indigo-700 text-white';
      case 'AI': return 'from-red-600 to-amber-600 text-white';
      case 'UK': return 'from-purple-700 to-pink-700 text-white';
      case 'QP': return 'from-amber-500 to-orange-600 text-white';
      default: return 'from-sky-600 to-blue-800 text-white';
    }
  };

  return (
    <div className="bg-white p-4 h-full flex flex-col text-[#172033]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#172033] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#4A90E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Flight Tickets
        </h3>
        <span className="badge-blue text-[10px]">
          Live API
        </span>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-3 mb-5">
        <div className="space-y-2.5">
          {/* Origin */}
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[#4A90E2]">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
               </svg>
             </div>
             <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Departure Airport / City"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#4A90E2] text-[#172033] placeholder-[#697386] text-xs font-medium"
             />
          </div>
          
          {/* Destination */}
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[#1FA774]">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
               </svg>
             </div>
             <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Arrival Airport / City"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#4A90E2] text-[#172033] placeholder-[#697386] text-xs font-medium"
             />
          </div>

          {/* Departure Date */}
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6D3DF5]">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
             </div>
             <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#4A90E2] text-[#172033] text-xs font-medium"
             />
          </div>

          {/* Cabin Class Selection */}
          <div className="flex gap-1.5 text-xs">
            {['ALL', 'Economy', 'Business'].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setCabinClass(cls)}
                className={`flex-1 py-1 rounded-md border text-xs font-bold transition-colors ${
                  cabinClass === cls
                    ? 'bg-[#EBF3FC] border-[#4A90E2] text-[#4A90E2]'
                    : 'bg-[#F7F8FA] border-[#E5E7EB] text-[#697386] hover:text-[#172033]'
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
          className="w-full btn-primary text-xs py-2 bg-[#4A90E2] hover:bg-[#357ABD] disabled:opacity-50"
        >
          {loading ? 'Searching Flights...' : 'Find Flights'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg mb-4 text-red-600 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 text-[#697386] text-xs font-medium">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4A90E2] mb-2"></div>
             Fetching live flight schedules...
          </div>
        )}

        {!loading && flights.length === 0 && !error && (
          <div className="text-center py-8 text-[#697386] text-xs font-medium flex flex-col items-center">
             <svg className="w-8 h-8 text-[#697386] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
             </svg>
             Search above to view real-time flight schedules & fares.
          </div>
        )}

        {!loading && flights.map((flight, idx) => (
          <div key={idx} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:border-[#4A90E2] transition-colors shadow-xs">
            {/* Header */}
            <div className="p-2.5 border-b border-[#E5E7EB] bg-[#F7F8FA] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black bg-gradient-to-br ${getAirlineColor(flight.code)} text-white`}>
                  {flight.code}
                </div>
                <h4 className="text-[#172033] font-bold text-xs flex items-center gap-1.5">
                  {flight.airline} 
                  <span className="text-[10px] font-mono text-[#697386] bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                    {flight.flightNo}
                  </span>
                </h4>
              </div>
              <span className="badge-blue text-[10px]">
                {flight.stops}
              </span>
            </div>
            
            {/* Route Details */}
            <div className="p-3 flex justify-between items-center border-b border-[#E5E7EB]">
               <div className="text-center">
                 <p className="text-base font-extrabold text-[#172033] leading-none">{flight.departureTime}</p>
                 <p className="text-[10px] text-[#697386] uppercase font-bold mt-1">{origin.substring(0, 3).toUpperCase() || 'DEP'}</p>
               </div>
               
               <div className="flex-1 px-3 relative flex flex-col items-center justify-center">
                  <span className="text-[10px] text-[#697386] font-semibold mb-1">{flight.duration}</span>
                  <div className="h-px bg-[#E5E7EB] w-full relative flex items-center justify-center">
                    <div className="bg-white px-1 z-10 text-[#4A90E2] transform rotate-90">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                      </svg>
                    </div>
                  </div>
               </div>

               <div className="text-center">
                 <p className="text-base font-extrabold text-[#172033] leading-none">{flight.arrivalTime}</p>
                 <p className="text-[10px] text-[#697386] uppercase font-bold mt-1">{destination.substring(0, 3).toUpperCase() || 'ARR'}</p>
               </div>
            </div>

            {/* Cabin Fares */}
            <div className="p-2.5 bg-[#F7F8FA] flex flex-col gap-2">
               <div className="flex gap-1.5 overflow-x-auto pb-1">
                 {flight.classes.map((cls, i) => (
                   <div key={i} className={`shrink-0 border rounded-md p-1.5 text-center min-w-[75px] ${cls.available ? 'border-[#4A90E2]/40 bg-white' : 'border-[#E5E7EB] bg-gray-100 opacity-60'}`}>
                     <p className={`text-[10px] font-bold ${cls.available ? 'text-[#4A90E2]' : 'text-[#697386]'}`}>{cls.type}</p>
                     <p className={`text-xs mt-0.5 ${cls.available ? 'text-[#172033] font-extrabold' : 'text-[#697386]'}`}>₹{cls.price.toLocaleString('en-IN')}</p>
                   </div>
                 ))}
               </div>

               <div className="pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between">
                 <span className="text-[10px] text-[#1FA774] font-semibold flex items-center gap-1">
                   Instant Booking Available
                 </span>
                 <a
                   href="https://www.makemytrip.com/flights/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="btn-primary text-xs py-1 px-3 bg-[#4A90E2] hover:bg-[#357ABD]"
                 >
                   Book Flight
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
