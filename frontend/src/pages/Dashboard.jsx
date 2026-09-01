import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTrip } from '../hooks/useTrip';
import { Link, useSearchParams } from 'react-router-dom';
import TripMap from '../features/map/TripMap';
import PlacePreview from '../features/trip-builder/PlacePreview';
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
  const [previewPlace, setPreviewPlace] = useState(null);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [isCostExpanded, setIsCostExpanded] = useState(false);

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
    if (currentTrip.selectedPlaces?.some(p => p.placeId === place.placeId)) return;

    const newSelectedPlaces = [...(currentTrip.selectedPlaces || []), {
      placeId: place.placeId,
      name: place.name,
      category: place.category,
      location: place.location,
      rating: place.rating
    }];

    try {
      await updateTrip(currentTrip._id, { selectedPlaces: newSelectedPlaces });
      if (currentTrip.status === 'planned') {
        const { replanItinerary } = await import('../api/ai.api');
        await replanItinerary(currentTrip._id, `Add "${place.name}" to the itinerary in a logical chronological spot without going significantly over budget.`);
        await fetchTrip(currentTrip._id);
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

  const totalDistance = routeDetails ? (routeDetails.totalDistance / 1000).toFixed(0) : 0;
  const totalMinutes = routeDetails ? Math.round(routeDetails.totalDuration / 60) : 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remMins = totalMinutes % 60;
  const estCost = currentTrip?.budget?.totalEstimated || 0;

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col font-sans text-gray-200">
      {/* Top Navbar */}
      <header className="bg-[#0B1120] sticky top-0 z-50 border-b border-gray-800 px-8 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 rounded-xl">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Trip<span className="text-gray-500">Xora</span></h1>
          <span className="text-xs font-semibold text-gray-400 ml-2 mt-1">AI-Powered Travel Planner</span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Estimated Cost Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsCostExpanded(!isCostExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ₹{estCost.toLocaleString()}
              <svg className={`w-4 h-4 transition-transform ${isCostExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            {isCostExpanded && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-[#1E293B] rounded-xl border border-gray-700 shadow-2xl p-4 z-[100]">
                 <h4 className="text-white font-bold mb-3 border-b border-gray-700 pb-2">Cost Breakdown</h4>
                 <div className="space-y-3 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-400">Transport (Fuel & Toll)</span>
                     <span className="text-white font-medium">₹{Math.round(estCost * 0.35).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Stay ({currentTrip?.itinerary?.length || 0} Nights)</span>
                     <span className="text-white font-medium">₹{Math.round(estCost * 0.35).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Food</span>
                     <span className="text-white font-medium">₹{Math.round(estCost * 0.20).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Activities & Entry</span>
                     <span className="text-white font-medium">₹{Math.round(estCost * 0.10).toLocaleString()}</span>
                   </div>
                 </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowToolsPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] hover:bg-[#334155] rounded-lg text-sm font-semibold text-white transition-colors border border-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Discover Places & Tools
          </button>
          
          <Link to="/history" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            My Trips
          </Link>
          <div className="h-5 w-px bg-gray-700"></div>
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-white hidden md:block">{user?.name}</span>
          </Link>
          <button onClick={logout} className="text-sm p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-hidden relative">
        {!tripId ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-4">
             <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Select a trip from My Trips</h2>
          </div>
        ) : loading || !currentTrip ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-3 flex flex-col h-full gap-4 overflow-y-auto pr-2" style={{scrollbarWidth: 'none'}}>
              
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Your Trip to {currentTrip.destination.name} <span className="text-yellow-400 text-xl">✨</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="text-emerald-400 font-semibold">{currentTrip.origin.name}</span> → <span className="text-blue-400 font-semibold">{currentTrip.destination.name}</span> ({currentTrip.itinerary?.length || 0} Days)
                </p>
              </div>

              {/* Top Stats Row */}
              <div className="bg-[#161E31] rounded-2xl p-4 flex justify-between border border-gray-800/80 shadow-sm">
                 <div className="text-center flex-1">
                   <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider">Total Distance</p>
                   <p className="text-white font-semibold">{totalDistance} km</p>
                 </div>
                 <div className="w-px bg-gray-700"></div>
                 <div className="text-center flex-1">
                   <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider">Total Time</p>
                   <p className="text-white font-semibold">{totalHours} h {remMins} m</p>
                 </div>
                 <div className="w-px bg-gray-700"></div>
                 <div className="text-center flex-1">
                   <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider">Est. Cost</p>
                   <p className="text-emerald-400 font-semibold">₹{estCost.toLocaleString()}</p>
                 </div>
              </div>

              {/* Itinerary Overview */}
              <div className="bg-[#161E31] rounded-2xl p-5 border border-gray-800/80 flex-1 overflow-y-auto shadow-sm" style={{scrollbarWidth: 'none'}}>
                 <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                   Itinerary Overview
                   {currentTrip.status !== 'planned' && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Draft</span>
                   )}
                 </h3>
                 <ItineraryView trip={currentTrip} onPlaceClick={setPreviewPlace} darkTheme={true} />
              </div>


            </div>

            {/* RIGHT MAP AREA */}
            <div className="lg:col-span-9 flex flex-col h-full bg-[#161E31] rounded-2xl border border-gray-800/80 overflow-hidden relative shadow-lg">
               {previewPlace ? (
                 <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
                   <div className="w-full max-w-5xl h-[80%] relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-[#0B1120]">
                     <PlacePreview place={previewPlace} trip={currentTrip} />
                     <button 
                       onClick={() => setPreviewPlace(null)} 
                       className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                     >
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                   </div>
                 </div>
               ) : null}
               
               <div className="flex-1 relative w-full h-full">
                  <TripMap trip={currentTrip} routeDetails={routeDetails} onPlaceClick={setPreviewPlace} />
               </div>

               {/* Bottom Bar Features */}
               <div className="h-20 bg-[#0B1120] border-t border-gray-800/80 flex items-center justify-around px-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-700 bg-[#161E31] flex items-center justify-center text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-400 leading-tight">Smart Route</p>
                      <p className="text-[11px] text-gray-500">Optimized route for less travel time</p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-800"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-700 bg-[#161E31] flex items-center justify-center text-teal-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-teal-400 leading-tight">Top Attractions</p>
                      <p className="text-[11px] text-gray-500">Handpicked places for best experience</p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-800"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-700 bg-[#161E31] flex items-center justify-center text-emerald-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-400 leading-tight">Budget Optimized</p>
                      <p className="text-[11px] text-gray-500">Best options within your budget</p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-800"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-700 bg-[#161E31] flex items-center justify-center text-purple-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-400 leading-tight">Real-time Updates</p>
                      <p className="text-[11px] text-gray-500">Traffic, weather & route updates</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Slide Out Discover Panel */}
            {showToolsPanel && (
               <div className="absolute inset-y-0 right-0 w-96 bg-[#0f172a] border-l border-gray-700 shadow-2xl z-[60] flex flex-col transform transition-transform duration-300">
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#161E31]">
                     <h3 className="font-bold text-white text-lg">Trip Tools</h3>
                     <button onClick={() => setShowToolsPanel(false)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>
                  <div className="flex border-b border-gray-800 shrink-0 bg-[#161E31]">
                     <button 
                       className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'discover' ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1E293B]' : 'text-gray-500 hover:text-gray-300'}`}
                       onClick={() => setActiveTab('discover')}
                     >
                       Discover
                     </button>
                     <button 
                       className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'budget' ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1E293B]' : 'text-gray-500 hover:text-gray-300'}`}
                       onClick={() => setActiveTab('budget')}
                     >
                       Budget
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#0f172a] custom-scrollbar">
                     {activeTab === 'discover' ? (
                       <PlaceSearch 
                         destination={currentTrip.destination.name} 
                         onAddPlace={handleAddPlace} 
                         onPlaceClick={setPreviewPlace}
                         darkTheme={true}
                       />
                     ) : (
                       <BudgetPanel trip={currentTrip} />
                     )}
                  </div>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
