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
      <div className="min-h-screen bg-[#F7F8FA] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6D3DF5]"></div>
      </div>
    );
  }

  const sortedTrips = [...(trips || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filters = ['All Trips', 'Upcoming', 'Completed', 'Favorites'];

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-[#172033]">
      {/* NAVBAR */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6D3DF5] flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-[#172033] tracking-tight">Trip<span className="text-[#6D3DF5]">Xora</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/dashboard" className="px-3.5 py-2 text-sm font-semibold text-[#697386] hover:text-[#172033] hover:bg-gray-100 rounded-lg transition-colors">
              Explore
            </Link>
            <Link to="/history" className="px-3.5 py-2 text-sm font-bold text-[#6D3DF5] bg-[#F0EBFF] rounded-lg">
              My Trips
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="btn-secondary text-xs">
            <svg className="w-4 h-4 text-[#6D3DF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link to="/create" className="btn-primary text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            <span>Plan New Trip</span>
          </Link>
        </div>
      </header>
      
      {/* BANNER SECTION */}
      <div className="bg-white border-b border-[#E5E7EB] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="badge-purple mb-2">Travel Journal</span>
            <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">Your Adventures</h1>
            <p className="text-[#697386] text-sm font-medium">Manage and review your saved travel itineraries.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="btn-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Plan New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* FILTERS & CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-3 mb-8 shadow-sm border border-[#E5E7EB]">
           <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeFilter === filter 
                      ? 'bg-[#6D3DF5] text-white shadow-sm' 
                      : 'text-[#697386] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {filter}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative">
                 <select className="bg-[#F7F8FA] border border-[#E5E7EB] text-[#172033] text-xs font-bold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#6D3DF5] cursor-pointer">
                   <option>Sort by: Recent</option>
                   <option>Sort by: Oldest</option>
                   <option>Sort by: Price</option>
                 </select>
              </div>
           </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-200 text-sm">
             {error}
          </div>
        )}

        {sortedTrips.length === 0 && !error ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-[#E5E7EB]">
            <div className="w-12 h-12 bg-[#F0EBFF] text-[#6D3DF5] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[#172033] mb-2">No trips planned yet</h3>
            <p className="text-[#697386] mb-6 max-w-md mx-auto text-sm font-medium">Your next great adventure is waiting. Start exploring destinations and crafting your itinerary today.</p>
            <Link
              to="/create"
              className="btn-primary"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {sortedTrips.map((trip) => {
              const destName = trip.destination?.name ? trip.destination.name.split(',')[0] : 'Destination';
              const imageUrl = `https://picsum.photos/seed/${trip._id}/800/600`;
              
              return (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/dashboard?tripId=${trip._id}`)}
                  className="travel-card travel-card-hover group overflow-hidden flex flex-col cursor-pointer"
                >
                  <div className="h-44 relative overflow-hidden shrink-0 bg-gray-100">
                    <img 
                       src={imageUrl} 
                       alt={destName} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    <div className="absolute top-3 right-3 z-10">
                      <span className="badge-green shadow-sm">
                        {trip.status ? trip.status.toUpperCase() : 'PLANNED'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-[#172033] group-hover:text-[#6D3DF5] transition-colors leading-tight mb-0.5">
                          {destName}
                        </h3>
                        <p className="text-[#697386] text-xs font-semibold">From {trip.origin?.name ? trip.origin.name.split(',')[0] : 'Origin'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4 text-xs font-medium text-[#697386]">
                        <div className="col-span-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#4A90E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span>
                            {trip.startDate && trip.endDate ? (
                              <>
                                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                                {' - '}
                                {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </>
                            ) : (
                              'Flexible Dates'
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#F28C28]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          <span>{trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#1FA774]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-[#1FA774] font-bold">
                            {trip.budget?.totalBudget ? `₹${trip.budget.totalBudget.toLocaleString()}` : 'Flexible'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] text-xs font-bold text-[#6D3DF5]">
                      <span>Open Dashboard</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
