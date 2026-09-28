import React, { useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const TrainSearch = ({ currentTrip }) => {
  const { user } = useAuth();
  
  const [origin, setOrigin] = useState(currentTrip?.origin?.name || '');
  const [destination, setDestination] = useState(currentTrip?.destination?.name || '');
  const [date, setDate] = useState(
    currentTrip?.startDate ? new Date(currentTrip.startDate).toISOString().split('T')[0] : ''
  );
  
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    setLoading(true);
    setError(null);
    setTrains([]);

    try {
      const response = await client.get(
        `/transit/trains?origin=${origin}&destination=${destination}&date=${date}`
      );
      
      if (response.data.success) {
        setTrains(response.data.data.trains);
      } else {
        setError(response.data.message || 'Failed to find trains.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to the Train API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 h-full flex flex-col text-[#172033]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#172033]">Train Tickets</h3>
        <span className="badge-green text-[10px]">Live API</span>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-3 mb-5">
        <div className="space-y-2.5">
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[#1FA774]">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin Station"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#1FA774] text-[#172033] placeholder-[#697386] text-xs font-medium"
             />
          </div>
          
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[#1FA774]">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination Station"
                className="w-full pl-9 pr-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#1FA774] text-[#172033] placeholder-[#697386] text-xs font-medium"
             />
          </div>

          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[#6D3DF5]">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#1FA774] text-[#172033] text-xs font-medium"
             />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !origin || !destination || !date}
          className="w-full btn-primary text-xs py-2 bg-[#1FA774] hover:bg-[#188A5F] disabled:opacity-50"
        >
          {loading ? 'Searching Trains...' : 'Find Trains'}
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
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1FA774] mb-2"></div>
             Checking live IRCTC train availability...
          </div>
        )}

        {!loading && trains.length === 0 && !error && (
          <div className="text-center py-8 text-[#697386] text-xs font-medium flex flex-col items-center">
             <svg className="w-8 h-8 text-[#697386] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
             Search above to see real-time train schedules.
          </div>
        )}

        {!loading && trains.map((train, idx) => (
          <div key={idx} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:border-[#1FA774] transition-colors shadow-xs">
            <div className="p-2.5 border-b border-[#E5E7EB] bg-[#F7F8FA] flex justify-between items-center">
              <div>
                <h4 className="text-[#172033] font-bold text-xs flex items-center gap-1.5">
                  {train.trainName} 
                  <span className="text-[10px] font-mono text-[#697386] bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">{train.trainNo}</span>
                </h4>
              </div>
              <span className="text-xs text-[#697386] font-medium">{train.duration}</span>
            </div>
            
            <div className="p-3 flex justify-between items-center border-b border-[#E5E7EB]">
               <div className="text-center">
                 <p className="text-base font-extrabold text-[#172033] leading-none">{train.departureTime}</p>
                 <p className="text-[10px] text-[#697386] uppercase font-bold mt-1">Departs</p>
               </div>
               <div className="flex-1 px-3 relative flex items-center justify-center">
                  <div className="h-px bg-[#E5E7EB] w-full absolute top-1/2 -translate-y-1/2 z-0"></div>
                  <div className="bg-white px-1.5 z-10 text-[#1FA774]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </div>
               </div>
               <div className="text-center">
                 <p className="text-base font-extrabold text-[#172033] leading-none">{train.arrivalTime}</p>
                 <p className="text-[10px] text-[#697386] uppercase font-bold mt-1">Arrives</p>
               </div>
            </div>

            <div className="p-2.5 bg-[#F7F8FA] flex flex-col gap-2">
               <div className="flex gap-1.5 overflow-x-auto pb-1">
                 {train.classes.map((cls, i) => (
                   <div key={i} className={`shrink-0 border rounded-md p-1.5 text-center min-w-[65px] ${cls.available ? 'border-[#1FA774]/40 bg-white' : 'border-[#E5E7EB] bg-gray-100 opacity-60'}`}>
                     <p className={`text-[10px] font-bold ${cls.available ? 'text-[#1FA774]' : 'text-[#697386]'}`}>{cls.type}</p>
                     <p className={`text-xs mt-0.5 ${cls.available ? 'text-[#172033] font-extrabold' : 'text-[#697386]'}`}>₹{cls.price}</p>
                   </div>
                 ))}
               </div>

               <div className="pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between">
                 <span className="text-[10px] text-[#1FA774] font-semibold flex items-center gap-1">
                   IRCTC Verified
                 </span>
                 <a
                   href="https://www.makemytrip.com/railways/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="btn-primary text-xs py-1 px-3 bg-[#1FA774] hover:bg-[#188A5F]"
                 >
                   Book Train
                 </a>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainSearch;
