import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTrip } from '../hooks/useTrip';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import TripMap from '../features/map/TripMap';
import PlacePreview from '../features/trip-builder/PlacePreview';
import PlaceSearch from '../features/trip-builder/PlaceSearch';
import ItineraryView from '../features/trip-builder/ItineraryView';
import BudgetPanel from '../features/budget/BudgetPanel';
import ExtrasPanel from '../features/extras/ExtrasPanel';
import TrainSearch from '../features/transit/TrainSearch';
import { calculateRoute } from '../api/routes.api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const navigate = useNavigate();
  const { trips, fetchTrips, fetchTrip, currentTrip, loading, updateTrip } = useTrip();
  const [routeDetails, setRouteDetails] = useState(null);
  const [previewPlace, setPreviewPlace] = useState(null);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [isCostExpanded, setIsCostExpanded] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId);
    } else {
      fetchTrips();
    }
  }, [tripId, fetchTrip, fetchTrips]);

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

  if (!tripId) {
    const sortedTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return (
      <div className="min-h-screen bg-[#0B1120] flex font-sans text-gray-200 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#0F172A] border-r border-gray-800 flex flex-col shrink-0 relative z-20">
           {/* Logo */}
           <div className="p-6 flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-xl">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">Trip<span className="text-gray-500">Xora</span></h1>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">AI Travel Planner</p>
              </div>
           </div>

           {/* Navigation */}
           <nav className="flex-1 px-4 space-y-1 overflow-y-auto" style={{scrollbarWidth: 'none'}}>
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#1E293B] text-white rounded-xl font-medium border border-gray-700 shadow-sm">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                Dashboard
              </Link>
              <Link to="/history" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                My Trips
              </Link>
              <Link to="/create" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Plan New Trip
              </Link>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl font-medium transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                Explore Destinations
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl font-medium transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Budget Manager
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl font-medium transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Saved Places
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl font-medium transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Travel Calendar
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl font-medium transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Preferences
              </div>
              
              {/* Promo Card */}
              <div className="mt-8 mx-2 p-4 bg-gradient-to-b from-[#1E293B] to-[#161E31] rounded-2xl border border-gray-800 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                 <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto mb-3 flex items-center justify-center text-xl shadow-lg border border-gray-700">✈️</div>
                 <h4 className="text-white font-bold text-sm mb-1 relative z-10">Plan Smarter,<br/>Travel Better</h4>
                 <p className="text-[11px] text-gray-400 mb-4 relative z-10">Let AI craft the perfect itinerary for you.</p>
                 <Link to="/create" className="relative z-10 block w-full py-2 bg-[#6B46C1] hover:bg-[#553C9A] text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                   Plan a New Trip
                 </Link>
              </div>
           </nav>

           {/* User Profile Footer */}
           <Link to="/profile" className="p-4 border-t border-gray-800 flex items-center justify-between shrink-0 hover:bg-gray-800/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                   {user?.name?.charAt(0).toUpperCase()}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white leading-tight truncate w-32">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 truncate w-32">{user?.email}</p>
                 </div>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
           </Link>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
           
           {/* Decorative Top Gradient Banner */}
           <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-900/20 via-indigo-900/10 to-transparent pointer-events-none z-0"></div>

           {/* Header Area */}
           <header className="px-10 pt-10 pb-6 flex flex-col md:flex-row md:justify-between items-start md:items-end relative z-10 gap-6">
              <div>
                 <p className="text-gray-400 font-medium mb-2">Hello, {user?.name ? user.name.split(' ')[0] : 'Traveler'}! <span className="text-xl">👋</span></p>
                 <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Select a trip from <span className="text-cyan-400">My Trips</span></h2>
                 <p className="text-gray-500">Your adventures, all in one place.</p>
              </div>
              <div className="flex items-center gap-4 self-end md:self-auto pb-2">
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   </div>
                   <input type="text" placeholder="Search trips, places, destinations..." className="pl-10 pr-4 py-2 w-72 rounded-full border border-gray-700/50 bg-[#161E31]/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm text-gray-200 placeholder-gray-500" />
                 </div>
                 <button className="w-10 h-10 bg-[#161E31] rounded-full flex items-center justify-center text-gray-400 shadow-sm relative hover:bg-gray-800 transition-colors border border-gray-700/50">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-purple-500 rounded-full border border-[#161E31]"></span>
                 </button>
                 <div className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center text-cyan-400 font-bold border border-gray-700 shadow-sm">
                   {user?.name?.charAt(0).toUpperCase()}
                 </div>
              </div>
           </header>

           {/* Toolbar */}
           <div className="px-10 pb-6 flex justify-end items-center relative z-10 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <select className="appearance-none bg-[#161E31] border border-gray-700 text-gray-300 text-sm font-medium rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer shadow-sm">
                      <option>Sort by: Recent</option>
                      <option>Oldest</option>
                      <option>Price</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                 </div>
                 <div className="flex bg-[#161E31] rounded-xl border border-gray-700 p-1 shadow-sm">
                    <button className="p-1.5 bg-[#6B46C1] text-white rounded-lg shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                 </div>
              </div>
           </div>

           {/* Cards Grid */}
           <div className="flex-1 overflow-y-auto px-10 py-8 relative z-10" style={{scrollbarWidth: 'none'}}>
              {loading ? (
                 <div className="flex justify-center items-center h-40">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                 </div>
              ) : sortedTrips.length === 0 ? (
                 <div className="text-center mt-20">
                   <h3 className="text-2xl font-bold text-gray-300 mb-2">No trips planned yet</h3>
                   <p className="text-gray-500">Start exploring destinations and craft your first itinerary.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                  {sortedTrips.map((trip) => {
                    const destName = trip.destination.name.split(',')[0];
                    const imageUrl = `https://picsum.photos/seed/${trip._id}/800/600`;
                    
                    return (
                      <div
                        key={trip._id}
                        onClick={() => {
                          navigate(`/dashboard?tripId=${trip._id}`);
                        }}
                        className="bg-[#161E31] rounded-[20px] shadow-lg border border-gray-800 hover:border-gray-600 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer"
                      >
                        {/* Image Header */}
                        <div className="h-[180px] relative overflow-hidden shrink-0 bg-gray-900 m-2 rounded-xl">
                          <img 
                             src={imageUrl} 
                             alt={trip.destination.name} 
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                          />
                          
                          {/* PLANNED Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-3 py-1 text-[10px] font-extrabold rounded-full tracking-wider bg-green-900/80 backdrop-blur text-green-400 border border-green-800">
                              {trip.status.toUpperCase()}
                            </span>
                          </div>

                          {/* Favorite Heart */}
                          <button 
                             onClick={(e) => { e.stopPropagation(); }}
                             className="absolute top-12 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-gray-300 hover:bg-black/60 hover:text-red-400 transition-colors border border-gray-700/50"
                          >
                             <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          </button>
                        </div>
                        
                        {/* Card Body */}
                        <div className="px-5 pb-5 pt-3 flex-1 flex flex-col justify-between">
                          <div className="mb-4">
                            <h3 className="text-[20px] font-bold text-gray-100 leading-tight mb-1">
                              {destName}
                            </h3>
                            <p className="text-gray-400 text-xs font-semibold">From {trip.origin.name.split(',')[0]}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                            {/* Dates */}
                            <div className="col-span-2 flex items-center text-gray-300 text-xs font-semibold">
                              <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-indigo-400 shrink-0 bg-indigo-500/10 border border-indigo-500/20">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              </div>
                              <span>
                                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                                {' - '}
                                {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            
                            {/* Travelers */}
                            <div className="flex items-center text-gray-300 text-xs font-semibold">
                              <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-orange-400 shrink-0 bg-orange-500/10 border border-orange-500/20">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                              </div>
                              <span>{trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                            </div>

                            {/* Budget */}
                            <div className="flex items-center text-gray-300 text-xs font-semibold">
                              <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-emerald-400 shrink-0 bg-emerald-500/10 border border-emerald-500/20">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              </div>
                              <span>
                                {trip.budget?.totalBudget ? `₹${trip.budget.totalBudget.toLocaleString()}` : 'No Budget'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Card Footer */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                            <span className="text-xs font-bold text-[#7E57C2] group-hover:text-purple-400 transition-colors">
                              View Details
                            </span>
                            <div className="w-7 h-7 rounded-full border border-purple-900 flex items-center justify-center text-[#7E57C2] group-hover:bg-[#7E57C2] group-hover:border-[#7E57C2] group-hover:text-white transition-all">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
           </div>
        </main>
      </div>
    );
  }

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
          {tripId && currentTrip && (
            <>
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
            </>
          )}
          
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
        {loading || !currentTrip ? (
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
                       className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'trains' ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1E293B]' : 'text-gray-500 hover:text-gray-300'}`}
                       onClick={() => setActiveTab('trains')}
                     >
                       Trains
                     </button>
                     <button 
                       className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'budget' ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1E293B]' : 'text-gray-500 hover:text-gray-300'}`}
                       onClick={() => setActiveTab('budget')}
                     >
                       Budget
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#0f172a] custom-scrollbar">
                     {activeTab === 'discover' && (
                       <PlaceSearch 
                         destination={currentTrip.destination.name} 
                         onAddPlace={handleAddPlace} 
                         onPlaceClick={setPreviewPlace}
                         darkTheme={true}
                       />
                     )}
                     {activeTab === 'trains' && (
                       <TrainSearch currentTrip={currentTrip} />
                     )}
                     {activeTab === 'budget' && (
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
