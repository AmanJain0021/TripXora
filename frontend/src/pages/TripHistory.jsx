import React, { useEffect, useState } from 'react';
import { useTrip } from '../hooks/useTrip';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const TripHistory = () => {
  const { trips, loading, error, fetchTrips } = useTrip();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Trips');

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Sort trips: newest first
  const sortedTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filters = ['All Trips', 'Upcoming', 'Completed', 'Favorites'];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans">
      
      {/* BANNER SECTION */}
      <div className="relative w-full h-[320px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
        {/* Background Image / Illustration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506501139174-099022df5260?auto=format&fit=crop&q=80&w=2071")', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 h-full relative z-10 flex flex-col justify-center">
          
          {/* Header row in banner */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
             <div></div>
             <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input type="text" placeholder="Search your trips, destinations..." className="pl-10 pr-4 py-2.5 w-80 rounded-full border border-white/60 bg-white/70 backdrop-blur-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] text-gray-700" />
                </div>
                
                {/* Bell Icon */}
                <button className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] relative hover:bg-white transition-colors border border-white/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                
                {/* Profile Icon */}
                <Link to="/profile" className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shadow-sm hover:ring-2 hover:ring-white transition-all">
                   {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Link>
             </div>
          </div>

          <div className="flex justify-between items-end mt-12">
            <div>
              <p className="text-gray-700 font-bold mb-1">Hello, {user?.name ? user.name.split(' ')[0] : 'Traveler'}! <span className="text-xl">👋</span></p>
              <h1 className="text-5xl font-extrabold text-[#1a1f36] tracking-tight mb-3">Your Adventures</h1>
              <p className="text-gray-500 text-lg font-medium">Manage your past and upcoming travels seamlessly.</p>
            </div>
            
            <Link
              to="/create"
              className="bg-[#6B46C1] hover:bg-[#553C9A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_10px_20px_-10px_rgba(107,70,193,0.5)] transition-all hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Plan New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* FILTERS & CONTENT */}
      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
        
        {/* Filter Bar */}
        <div className="flex justify-between items-center bg-white/70 backdrop-blur-md rounded-2xl p-2 mb-8 shadow-sm border border-gray-100/50">
           <div className="flex gap-2">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeFilter === filter 
                      ? 'bg-[#7E57C2] text-white shadow-md shadow-purple-500/20' 
                      : 'text-gray-500 hover:bg-gray-100/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                 <select className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer shadow-sm">
                   <option>Sort by: Recent</option>
                   <option>Sort by: Oldest</option>
                   <option>Sort by: Price (High-Low)</option>
                 </select>
                 <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
              </div>
              
              <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                 <button className="p-1.5 bg-[#7E57C2] text-white rounded-lg shadow-sm">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                 </button>
                 <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                 </button>
              </div>
           </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-8 border border-red-100 shadow-sm">
             {error}
          </div>
        )}

        {sortedTrips.length === 0 && !error ? (
          <div className="bg-white p-16 text-center rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mt-10">
            <h3 className="text-2xl font-bold text-[#1a1f36] mb-3">No trips planned yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg font-medium">Your next great adventure is waiting. Start exploring destinations and crafting your itinerary today.</p>
            <Link
              to="/create"
              className="bg-[#6B46C1] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#553C9A] transition-colors inline-block shadow-[0_10px_20px_-10px_rgba(107,70,193,0.5)]"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {sortedTrips.map((trip) => {
              
              const destName = trip.destination.name.split(',')[0];
              // Use picsum.photos which reliably sources high-quality images from Unsplash
              const imageUrl = `https://picsum.photos/seed/${trip._id}/800/600`;
              
              return (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/dashboard?tripId=${trip._id}`)}
                  className="bg-white rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Image Header */}
                  <div className="h-[180px] relative overflow-hidden shrink-0 bg-gray-200 m-3 rounded-2xl">
                    <img 
                       src={imageUrl} 
                       alt={trip.destination.name} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* PLANNED Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 text-[11px] font-extrabold rounded-full tracking-wider bg-white text-green-600 shadow-sm">
                        {trip.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Favorite Heart */}
                    <button 
                       onClick={(e) => { e.stopPropagation(); /* handle favorite toggle */ }}
                       className="absolute top-12 right-3 w-8 h-8 rounded-full bg-slate-900/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors shadow-sm"
                    >
                       <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                  </div>
                  
                  {/* Card Body */}
                  <div className="px-6 pb-6 pt-3 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <h3 className="text-[22px] font-extrabold text-[#1a1f36] leading-tight mb-0.5">
                        {destName}
                      </h3>
                      <p className="text-gray-500 text-sm font-semibold">From {trip.origin.name.split(',')[0]}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                      {/* Dates */}
                      <div className="col-span-2 flex items-center text-gray-600 text-sm font-bold">
                        <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-indigo-500 shrink-0 bg-indigo-50/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <span>
                          {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                          {' - '}
                          {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* Travelers */}
                      <div className="flex items-center text-gray-600 text-sm font-bold">
                        <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-orange-500 shrink-0 bg-orange-50/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <span>{trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                      </div>

                      {/* Budget */}
                      <div className="flex items-center text-gray-600 text-sm font-bold">
                        <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-emerald-500 shrink-0 bg-emerald-50/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span>
                          {trip.budget?.totalBudget ? `₹${trip.budget.totalBudget.toLocaleString()}` : 'No Budget'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-extrabold text-[#7E57C2] group-hover:text-[#553C9A] transition-colors">
                        Open Dashboard
                      </span>
                      <div className="w-8 h-8 rounded-full border-2 border-purple-100 flex items-center justify-center text-[#7E57C2] group-hover:bg-[#7E57C2] group-hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistory;
