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
    <div className="bg-[#0f172a] p-5 h-full flex flex-col text-gray-200">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Check Train Tickets</h3>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">Live API</span>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div className="space-y-3">
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             </div>
             <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin Station"
                className="w-full pl-9 pr-4 py-2.5 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm"
             />
          </div>
          
          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-emerald-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             </div>
             <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination Station"
                className="w-full pl-9 pr-4 py-2.5 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm"
             />
          </div>

          <div className="relative">
             <div className="absolute top-1/2 left-3 -translate-y-1/2 text-blue-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             </div>
             <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white text-sm"
             />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !origin || !destination || !date}
          className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-600/30 disabled:opacity-50 transition-colors text-sm"
        >
          {loading ? 'Searching Trains...' : 'Find Trains'}
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
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
             Connecting to Train API...
          </div>
        )}

        {!loading && trains.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500 text-sm flex flex-col items-center">
             <svg className="w-12 h-12 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
             Search to see live train prices
          </div>
        )}

        {!loading && trains.map((train, idx) => (
          <div key={idx} className="bg-[#161E31] border border-gray-700/80 rounded-xl overflow-hidden hover:border-gray-500 transition-colors shadow-sm">
            <div className="p-3 border-b border-gray-700/50 bg-[#1E293B]/50 flex justify-between items-center">
              <div>
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  {train.trainName} 
                  <span className="text-[10px] font-mono text-gray-400 bg-[#0f172a] px-1.5 py-0.5 rounded border border-gray-700">{train.trainNo}</span>
                </h4>
              </div>
              <span className="text-xs text-gray-400 font-medium">{train.duration}</span>
            </div>
            
            <div className="p-3 flex justify-between items-center border-b border-gray-700/50">
               <div className="text-center">
                 <p className="text-lg font-bold text-white leading-none">{train.departureTime}</p>
                 <p className="text-[10px] text-gray-500 uppercase font-semibold mt-1">Departs</p>
               </div>
               <div className="flex-1 px-4 relative flex items-center justify-center">
                  <div className="h-px bg-gray-700 w-full absolute top-1/2 -translate-y-1/2 z-0"></div>
                  <div className="bg-[#161E31] px-2 z-10 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                  </div>
               </div>
               <div className="text-center">
                 <p className="text-lg font-bold text-white leading-none">{train.arrivalTime}</p>
                 <p className="text-[10px] text-gray-500 uppercase font-semibold mt-1">Arrives</p>
               </div>
            </div>

            <div className="p-3 bg-[#0f172a]/50">
               <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                 {train.classes.map((cls, i) => (
                   <div key={i} className={`shrink-0 border rounded-lg p-2 text-center min-w-[70px] ${cls.available ? 'border-emerald-500/30 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10' : 'border-gray-700/50 bg-gray-800/30 opacity-60'}`}>
                     <p className={`text-xs font-bold ${cls.available ? 'text-emerald-400' : 'text-gray-500'}`}>{cls.type}</p>
                     <p className={`text-[10px] mt-0.5 ${cls.available ? 'text-white font-semibold' : 'text-gray-500'}`}>₹{cls.price}</p>
                     <p className={`text-[9px] mt-0.5 uppercase tracking-wide ${cls.available ? 'text-emerald-500/70' : 'text-red-400'}`}>
                       {cls.available ? 'Available' : 'Waitlist'}
                     </p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainSearch;
