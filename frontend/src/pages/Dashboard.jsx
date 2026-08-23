import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTrip } from '../hooks/useTrip';
import { Link, useSearchParams } from 'react-router-dom';
import TripMap from '../features/map/TripMap';
import PlaceSearch from '../features/trip-builder/PlaceSearch';
import ItineraryView from '../features/trip-builder/ItineraryView';
import BudgetPanel from '../features/budget/BudgetPanel';
import ExtrasPanel from '../features/extras/ExtrasPanel';
import { calculateRoute } from '../api/routes.api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const { fetchTrip, currentTrip, loading, updateTrip } = useTrip();
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId);
    }
  }, [tripId, fetchTrip]);

  useEffect(() => {
    const getRoute = async () => {
      if (currentTrip && currentTrip.origin && currentTrip.destination) {
        try {
          const details = await calculateRoute(
            currentTrip.origin.name,
            currentTrip.destination.name,
            currentTrip.selectedPlaces?.map(p => p.name) || [],
            currentTrip.travelMode
          );
          setRouteDetails(details);
        } catch (error) {
          console.error("Failed to fetch route:", error);
        }
      }
    };
    getRoute();
  }, [currentTrip]);

  const handleAddPlace = async (place) => {
    if (!currentTrip) return;
    
    // Check if place is already added
    if (currentTrip.selectedPlaces?.some(p => p.placeId === place.placeId)) {
      return; // Already exists
    }

    const newSelectedPlaces = [...(currentTrip.selectedPlaces || []), {
      placeId: place.placeId,
      name: place.name,
      category: place.category,
      location: place.location,
      rating: place.rating
    }];

    try {
      await updateTrip(currentTrip._id, { selectedPlaces: newSelectedPlaces });
      
      // If the trip is already planned, automatically ask AI to fit the new place in
      if (currentTrip.status === 'planned') {
        const { replanItinerary } = await import('../api/ai.api');
        // We do this asynchronously without blocking the UI immediately, 
        // though showing a loading state would be better. For simplicity, we trigger it.
        await replanItinerary(currentTrip._id, `Add "${place.name}" to the itinerary in a logical chronological spot without going significantly over budget.`);
        await fetchTrip(currentTrip._id); // Refresh to show new itinerary
      }
    } catch (err) {
      console.error('Failed to add place:', err);
    }
  };

  const handleRemovePlace = async (placeId) => {
    if (!currentTrip) return;
    
    const placeToRemove = currentTrip.selectedPlaces?.find(p => p.placeId === placeId);
    const updatedPlaces = currentTrip.selectedPlaces?.filter(p => p.placeId !== placeId) || [];
    
    try {
      await updateTrip(currentTrip._id, { selectedPlaces: updatedPlaces });
      
      if (currentTrip.status === 'planned' && placeToRemove) {
        const { replanItinerary } = await import('../api/ai.api');
        await replanItinerary(currentTrip._id, `Remove "${placeToRemove.name}" from the itinerary and logically fill the gap without going over budget.`);
        await fetchTrip(currentTrip._id);
      }
    } catch (err) {
      console.error("Failed to remove place", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-8 py-4 flex justify-between items-center shadow-[0_1px_2px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="TripXora Logo" className="h-8 w-auto object-contain" />
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">TripXora</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/history" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            My Trips
          </Link>
          <div className="h-5 w-px bg-gray-200"></div>
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-50 text-primary rounded-full flex items-center justify-center font-bold text-sm border border-blue-100">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden md:block">{user?.name}</span>
          </Link>
          <button
            onClick={logout}
            className="text-sm p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
            title="Log Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {!tripId ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-4 animate-fade-in">
            <div className="mb-8 relative group cursor-default">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse"></div>
              <img 
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop" 
                alt="Travel" 
                className="w-56 h-56 object-cover rounded-full shadow-2xl relative z-10 border-4 border-white transition-transform duration-700 hover:scale-105" 
              />
              {/* Floating decorative elements */}
              <div className="absolute top-0 -left-8 bg-white p-3 rounded-2xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                ✈️
              </div>
              <div className="absolute bottom-4 -right-6 bg-white p-3 rounded-2xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                🌍
              </div>
            </div>
            
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Ready for your next adventure{user?.name ? `, ${user.name.split(' ')[0]}` : ''}?
            </h2>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
              Every great journey begins with a single step. Start planning your dream vacation, explore new destinations, and let our AI curate the perfect day-by-day itinerary just for you.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                to="/history" 
                className="px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                View History
              </Link>
              <Link 
                to="/" 
                className="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Plan New Trip
              </Link>
            </div>
          </div>
        ) : loading || !currentTrip ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
            
            {/* Left Sidebar (Itinerary/Details) */}
            <div className="lg:col-span-1 flex flex-col h-full gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {currentTrip.origin.name} <br/>
                  <span className="text-lg text-gray-500 font-normal">to</span><br/>
                  {currentTrip.destination.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded uppercase">
                    {currentTrip.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
                  </span>
                </div>
                
                {routeDetails && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Estimated Travel</p>
                    <p className="font-semibold text-gray-900">
                      {(routeDetails.totalDistance / 1000).toFixed(1)} km 
                      <span className="mx-2">•</span> 
                      {Math.round(routeDetails.totalDuration / 60)} mins
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Bottom Left Panel: Itinerary OR Selected Places */}
              {currentTrip.status === 'planned' ? (
                <ItineraryView trip={currentTrip} />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col overflow-y-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Places to Visit</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {!currentTrip.selectedPlaces || currentTrip.selectedPlaces.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No places added yet. Use the discover panel to add places!</p>
                    ) : (
                      currentTrip.selectedPlaces.map(place => (
                        <div key={place.placeId} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="truncate pr-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">{place.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{place.category?.replace(/_/g, ' ')}</p>
                          </div>
                          <button 
                            onClick={() => handleRemovePlace(place.placeId)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ItineraryView trip={currentTrip} />
                  </div>
                </div>
              )}
            </div>

            {/* Middle Map View */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <TripMap trip={currentTrip} routeDetails={routeDetails} />
            </div>

            {/* Right Panel: Tabs for Discover and Budget */}
            <div className="lg:col-span-1 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100 shrink-0">
                <button
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    !searchParams.get('tab') || searchParams.get('tab') !== 'budget'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('tab');
                    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                  }}
                >
                  Discover
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    searchParams.get('tab') === 'budget'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('tab', 'budget');
                    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                  }}
                >
                  Budget
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    searchParams.get('tab') === 'extras'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('tab', 'extras');
                    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                  }}
                >
                  Extras
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {searchParams.get('tab') === 'budget' ? (
                  <BudgetPanel trip={currentTrip} />
                ) : searchParams.get('tab') === 'extras' ? (
                  <ExtrasPanel trip={currentTrip} />
                ) : (
                  <PlaceSearch 
                    destination={currentTrip.destination.name} 
                    onAddPlace={handleAddPlace} 
                  />
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
