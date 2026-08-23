import React, { useEffect } from 'react';
import { useTrip } from '../hooks/useTrip';
import { Link } from 'react-router-dom';

const TripHistory = () => {
  const { trips, loading, error, fetchTrips } = useTrip();

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Sort trips: newest first
  const sortedTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Your Adventures</h1>
            <p className="text-gray-500 text-lg">Manage your past and upcoming travels seamlessly.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold text-lg border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </Link>
            <Link
              to="/create"
              className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-primary border border-transparent rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-blue-500/30 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2 -ml-1 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Plan New Trip
              </span>
              <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-8 border border-red-100 shadow-sm">
            {error}
          </div>
        )}

        {sortedTrips.length === 0 && !error ? (
          <div className="bg-white p-16 text-center rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No trips planned yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Your next great adventure is waiting. Start exploring destinations and crafting your itinerary today.</p>
            <Link
              to="/create"
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors inline-block shadow-md"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTrips.map((trip) => {
              const statusColor = trip.status === 'planned' 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-yellow-100 text-yellow-700 border-yellow-200';

              return (
                <Link
                  key={trip._id}
                  to={`/dashboard?tripId=${trip._id}`}
                  className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${statusColor} backdrop-blur-md bg-white/90`}>
                        {trip.status}
                      </span>
                    </div>
                    
                    <div className="absolute bottom-4 left-6 text-white">
                      <h3 className="text-2xl font-extrabold leading-tight">
                        {trip.destination.name.split(',')[0]}
                      </h3>
                      <p className="text-white/80 text-sm font-medium">From {trip.origin.name.split(',')[0]}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-gray-600 text-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-primary shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="font-medium">
                          {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                          {' - '}
                          {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mr-3 text-orange-500 shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <span className="font-medium">{trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3 text-green-500 shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span className="font-medium">
                          {trip.budget?.totalBudget ? `₹${trip.budget.totalBudget.toLocaleString()}` : 'No Budget Set'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-primary group-hover:text-blue-600 transition-colors">
                      Open Dashboard
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistory;
