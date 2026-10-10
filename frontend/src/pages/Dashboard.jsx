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
import FlightSearch from '../features/transit/FlightSearch';
import { calculateRoute } from '../api/routes.api';

const FEATURED_DESTINATIONS = [
  {
    id: 'bhopal',
    name: 'Bhopal',
    tagline: 'City of Lakes & Ancient Heritage',
    image: 'https://images.unsplash.com/photo-1627894006066-b457863ee9b4?auto=format&fit=crop&q=80&w=800',
    route: 'Indore → Bhopal',
    duration: '3 Days',
    estCost: '₹12,400',
    tag: 'Heritage & Nature'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    tagline: 'The Royal Pink City',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800',
    route: 'Delhi → Jaipur',
    duration: '4 Days',
    estCost: '₹18,500',
    tag: 'Culture & Palaces'
  },
  {
    id: 'goa',
    name: 'Goa',
    tagline: 'Sun-kissed Beaches & Portuguese Heritage',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800',
    route: 'Mumbai → Goa',
    duration: '5 Days',
    estCost: '₹24,000',
    tag: 'Beaches & Relaxation'
  },
  {
    id: 'kerala',
    name: 'Munnar & Backwaters',
    tagline: 'God\'s Own Country',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
    route: 'Kochi → Munnar',
    duration: '6 Days',
    estCost: '₹28,900',
    tag: 'Hills & Waterways'
  }
];

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
  const [showFlightDrawer, setShowFlightDrawer] = useState(false);
  const [showTrainDrawer, setShowTrainDrawer] = useState(false);
  const [mapSize, setMapSize] = useState('30'); // '30', '50', '70', '100'
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMapFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const totalDistance = routeDetails ? (routeDetails.totalDistance / 1000).toFixed(0) : 0;
  const totalMinutes = routeDetails ? Math.round(routeDetails.totalDuration / 60) : 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remMins = totalMinutes % 60;
  const estCost = currentTrip?.budget?.totalEstimated || 0;

  // Main Dashboard overview when no specific trip is open
  if (!tripId) {
    const sortedTrips = [...(trips || [])].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
    
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans text-[#172033]">
        {/* LIGHT NAVBAR */}
        <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#6D3DF5] flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-[#172033] tracking-tight">Trip<span className="text-[#6D3DF5]">Xora</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/dashboard" className="px-3.5 py-2 text-sm font-bold text-[#6D3DF5] bg-[#F0EBFF] rounded-lg">
                Explore
              </Link>
              <Link to="/history" className="px-3.5 py-2 text-sm font-semibold text-[#697386] hover:text-[#172033] hover:bg-gray-100 rounded-lg transition-colors">
                My Trips
              </Link>
              <button onClick={() => setShowFlightDrawer(true)} className="px-3.5 py-2 text-sm font-semibold text-[#697386] hover:text-[#172033] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#4A90E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Flights
              </button>
              <button onClick={() => setShowTrainDrawer(true)} className="px-3.5 py-2 text-sm font-semibold text-[#697386] hover:text-[#172033] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1FA774]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                Trains
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/create" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>Plan New Trip</span>
            </Link>

            <Link to="/profile" className="flex items-center gap-2.5 pl-2 border-l border-[#E5E7EB]">
              <div className="w-9 h-9 rounded-full bg-[#F0EBFF] text-[#6D3DF5] flex items-center justify-center font-bold text-sm border border-[#6D3DF5]/20">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* HERO SECTION */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
          
          {/* Welcome Travel Banner */}
          <section className="relative rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-xl">
              <span className="badge-purple mb-3">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                Travel Explorer Platform
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#172033] tracking-tight mb-2">
                Good morning, {user?.name ? user.name.split(' ')[0] : 'Traveler'} 👋
              </h1>
              <p className="text-[#697386] text-base mb-6 font-medium leading-relaxed">
                Where are you heading next? Search destinations or generate a personalized itinerary in seconds.
              </p>

              {/* Search Box */}
              <div className="flex items-center bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-2 max-w-lg shadow-inner">
                <svg className="w-5 h-5 text-[#697386] ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Search cities, attractions, or routes (e.g., Indore to Bhopal)..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-[#172033] placeholder-[#697386] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate('/create');
                  }}
                />
                <button onClick={() => navigate('/create')} className="btn-primary text-xs shrink-0 py-2">
                  Start Planning
                </button>
              </div>
            </div>

            {/* Travel Hero Imagery */}
            <div className="w-full md:w-80 h-52 rounded-xl overflow-hidden shadow-md relative shrink-0 border border-[#E5E7EB]">
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800" 
                alt="Travel Destination" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-[#FEF3E7]">Spotlight</p>
                <p className="text-sm font-extrabold">Discover Coastal & Heritage Routes</p>
              </div>
            </div>
          </section>

          {/* YOUR RECENT / UPCOMING TRIPS */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-[#172033] tracking-tight">Your Travel Overview</h2>
                <p className="text-sm text-[#697386]">Recent planned journeys and upcoming itineraries</p>
              </div>
              <Link to="/history" className="text-sm font-bold text-[#6D3DF5] hover:text-[#5730D4] flex items-center gap-1">
                View All Trips ({sortedTrips.length}) →
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32 bg-white rounded-xl border border-[#E5E7EB]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6D3DF5]"></div>
              </div>
            ) : sortedTrips.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
                <div className="w-12 h-12 bg-[#F0EBFF] text-[#6D3DF5] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-lg font-bold text-[#172033] mb-1">No upcoming trips yet</h3>
                <p className="text-sm text-[#697386] mb-4">Start crafting your first journey with TripXora's smart planner.</p>
                <Link to="/create" className="btn-primary text-sm">
                  Create First Trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTrips.slice(0, 3).map((trip) => {
                  const destName = trip.destination?.name ? trip.destination.name.split(',')[0] : 'Destination';
                  const imageUrl = `https://picsum.photos/seed/${trip._id}/800/600`;
                  
                  return (
                    <div
                      key={trip._id}
                      onClick={() => navigate(`/dashboard?tripId=${trip._id}`)}
                      className="travel-card travel-card-hover group flex flex-col overflow-hidden"
                    >
                      <div className="h-44 relative overflow-hidden bg-gray-100">
                        <img 
                          src={imageUrl} 
                          alt={destName} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="badge-green shadow-sm">
                            {trip.status ? trip.status.toUpperCase() : 'PLANNED'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-lg font-bold text-[#172033] group-hover:text-[#6D3DF5] transition-colors">
                              {destName}
                            </h3>
                            <span className="badge-purple shrink-0 text-[11px]">
                              {trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#697386] mb-3">
                            From {trip.origin?.name ? trip.origin.name.split(',')[0] : 'Origin'}
                          </p>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
                          <div className="flex items-center justify-between text-xs text-[#697386]">
                            <span className="flex items-center gap-1.5 font-medium">
                              <svg className="w-3.5 h-3.5 text-[#4A90E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Dates flexible'}
                            </span>
                            <span className="font-bold text-[#1FA774]">
                              {trip.budget?.totalBudget ? `₹${trip.budget.totalBudget.toLocaleString()}` : 'Budget Flexible'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 text-xs font-bold text-[#6D3DF5]">
                            <span>View Itinerary</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* EXPLORE FEATURED DESTINATIONS */}
          <section className="pt-4">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-[#172033] tracking-tight">Explore Destinations</h2>
              <p className="text-sm text-[#697386]">Handcrafted route inspiration for your next getaway</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_DESTINATIONS.map((dest) => (
                <div 
                  key={dest.id}
                  onClick={() => navigate(`/create`)}
                  className="travel-card travel-card-hover group flex flex-col overflow-hidden"
                >
                  <div className="h-48 relative overflow-hidden bg-gray-100">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="badge-orange shadow-sm">
                        {dest.tag}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#172033] group-hover:text-[#6D3DF5] transition-colors mb-0.5">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-[#697386] mb-3">{dest.tagline}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#172033]">{dest.route}</span>
                      <span className="font-bold text-[#1FA774]">{dest.estCost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Slide Out Flight Search Panel */}
        {showFlightDrawer && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-[#E5E7EB] shadow-2xl z-[100] flex flex-col">
            <div className="p-4 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F7F8FA]">
              <h3 className="font-bold text-[#172033] text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#4A90E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Flight Finder
              </h3>
              <button onClick={() => setShowFlightDrawer(false)} className="text-[#697386] hover:text-[#172033] p-1 rounded-lg hover:bg-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FlightSearch currentTrip={null} />
            </div>
          </div>
        )}

        {/* Slide Out Train Search Panel */}
        {showTrainDrawer && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-[#E5E7EB] shadow-2xl z-[100] flex flex-col">
            <div className="p-4 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F7F8FA]">
              <h3 className="font-bold text-[#172033] text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1FA774]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                Train Finder
              </h3>
              <button onClick={() => setShowTrainDrawer(false)} className="text-[#697386] hover:text-[#172033] p-1 rounded-lg hover:bg-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <TrainSearch currentTrip={null} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Trip Detail View
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans text-[#172033]">
      {/* Top Travel Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#E5E7EB] px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6D3DF5] flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-xl font-extrabold text-[#172033] tracking-tight">Trip<span className="text-[#6D3DF5]">Xora</span></h1>
          </Link>
          <span className="hidden sm:inline-block text-xs font-semibold text-[#697386] border-l border-[#E5E7EB] pl-3 py-1">
            {currentTrip?.origin?.name?.split(',')[0]} → {currentTrip?.destination?.name?.split(',')[0]}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {tripId && currentTrip && (
            <>
              {/* Cost Breakdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsCostExpanded(!isCostExpanded)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#E6F6F0] text-[#1FA774] border border-[#1FA774]/20 rounded-lg text-xs font-bold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ₹{estCost.toLocaleString()}
                  <svg className={`w-3.5 h-3.5 transition-transform ${isCostExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {isCostExpanded && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl border border-[#E5E7EB] shadow-xl p-4 z-[100]">
                    <h4 className="text-[#172033] font-bold mb-3 border-b border-[#E5E7EB] pb-2 text-sm">Est. Budget Breakdown</h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#697386]">Transport & Fuel</span>
                        <span className="text-[#172033] font-semibold">₹{Math.round(estCost * 0.35).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#697386]">Stay ({currentTrip?.itinerary?.length || 0} Nights)</span>
                        <span className="text-[#172033] font-semibold">₹{Math.round(estCost * 0.35).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#697386]">Food & Dining</span>
                        <span className="text-[#172033] font-semibold">₹{Math.round(estCost * 0.20).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#697386]">Activities</span>
                        <span className="text-[#172033] font-semibold">₹{Math.round(estCost * 0.10).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => { setShowToolsPanel(true); setActiveTab('flights'); }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF3FC] text-[#4A90E2] border border-[#4A90E2]/20 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Flights
              </button>

              <button 
                onClick={() => { setShowToolsPanel(true); setActiveTab('trains'); }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F6F0] text-[#1FA774] border border-[#1FA774]/20 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                Trains
              </button>

              <button 
                onClick={() => setShowToolsPanel(true)}
                className="btn-secondary text-xs py-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span>Tools</span>
              </button>
            </>
          )}
          
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-primary text-xs py-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </button>

          <button onClick={logout} className="text-[#697386] hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      {/* TRIP ITINERARY + MAP MAIN LAYOUT */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden relative">
        {loading || !currentTrip ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6D3DF5]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-90px)] relative">
            
            {/* MAP SECTION */}
            <div className={`flex flex-col h-full bg-white rounded-xl border border-[#E5E7EB] overflow-hidden relative shadow-sm transition-all duration-300 ${
              isMapFullscreen 
                ? 'fixed inset-4 z-[200] rounded-xl bg-white border-2 border-[#6D3DF5] shadow-2xl' 
                : mapSize === '30' ? 'lg:col-span-3' : mapSize === '50' ? 'lg:col-span-5' : mapSize === '70' ? 'lg:col-span-7' : 'lg:col-span-10'
            }`}>
               
               {/* Map Controls */}
               <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-white/90 backdrop-blur border border-[#E5E7EB] p-1 rounded-lg shadow-sm">
                 <span className="text-[10px] font-bold text-[#697386] px-1 uppercase tracking-wider hidden sm:inline">Map Size:</span>
                 {['30', '50', '70', '100'].map(size => (
                   <button 
                     key={size}
                     onClick={() => setMapSize(size)}
                     className={`px-2 py-0.5 text-xs font-bold rounded ${mapSize === size ? 'bg-[#6D3DF5] text-white' : 'text-[#697386] hover:bg-gray-100'}`}
                   >
                     {size}%
                   </button>
                 ))}
               </div>

               {previewPlace ? (
                 <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
                   <div className="w-full max-w-4xl h-[85%] relative rounded-xl overflow-hidden shadow-2xl bg-white">
                     <PlacePreview place={previewPlace} trip={currentTrip} />
                     <button 
                       onClick={() => setPreviewPlace(null)} 
                       className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur text-[#172033] p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   </div>
                 </div>
               ) : null}
               
               <div className="flex-1 relative w-full h-full">
                  <TripMap trip={currentTrip} routeDetails={routeDetails} onPlaceClick={setPreviewPlace} />
               </div>

               {/* Bottom Route Summary Bar */}
               <div className="py-2.5 bg-[#F7F8FA] border-t border-[#E5E7EB] grid grid-cols-2 md:grid-cols-4 gap-2 px-3 shrink-0 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4A90E2]"></span>
                    <p className="font-semibold text-[#172033] truncate">Smart Route Active</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F28C28]"></span>
                    <p className="font-semibold text-[#172033] truncate">Top Attractions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1FA774]"></span>
                    <p className="font-semibold text-[#172033] truncate">Budget Optimized</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6D3DF5]"></span>
                    <p className="font-semibold text-[#172033] truncate">Live Itinerary Sync</p>
                  </div>
               </div>
            </div>

            {/* ITINERARY OVERVIEW SECTION */}
            {!isMapFullscreen && mapSize !== '100' && (
              <div className={`flex flex-col h-full gap-4 overflow-y-auto transition-all duration-300 ${
                mapSize === '30' ? 'lg:col-span-7' : mapSize === '50' ? 'lg:col-span-5' : 'lg:col-span-3'
              }`}>
                
                {/* Destination Hero Header */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="badge-purple mb-1">
                        {currentTrip?.itinerary?.length || 0} Day Itinerary
                      </span>
                      <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
                        {currentTrip?.destination?.name?.split(',')[0] || 'Destination'}
                      </h2>
                      <p className="text-xs font-semibold text-[#697386]">
                        {currentTrip?.origin?.name?.split(',')[0]} → {currentTrip?.destination?.name?.split(',')[0]}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#697386] block font-medium">Est. Total</span>
                      <span className="text-lg font-extrabold text-[#1FA774]">₹{estCost.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Trip Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-[#F7F8FA] p-3 rounded-lg border border-[#E5E7EB] text-center text-xs">
                    <div>
                      <span className="text-[#697386] block text-[10px] uppercase font-bold">Distance</span>
                      <span className="font-bold text-[#172033]">{totalDistance} km</span>
                    </div>
                    <div>
                      <span className="text-[#697386] block text-[10px] uppercase font-bold">Duration</span>
                      <span className="font-bold text-[#172033]">{totalHours}h {remMins}m</span>
                    </div>
                    <div>
                      <span className="text-[#697386] block text-[10px] uppercase font-bold">Pace</span>
                      <span className="font-bold text-[#6D3DF5] capitalize">{currentTrip?.travelStyle || 'Balanced'}</span>
                    </div>
                  </div>
                </div>

                {/* Day-by-day Itinerary Component */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex-1 overflow-y-auto shadow-sm">
                   <h3 className="text-[#172033] font-extrabold mb-4 text-base flex items-center justify-between">
                     Itinerary Journal
                     {currentTrip.status !== 'planned' && (
                        <span className="badge-orange text-[10px]">Drafting</span>
                     )}
                   </h3>
                   <ItineraryView trip={currentTrip} onPlaceClick={setPreviewPlace} darkTheme={false} />
                </div>
              </div>
            )}

            {/* Slide Out Discover & Tools Panel */}
            {showToolsPanel && (
               <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-[#E5E7EB] shadow-2xl z-[60] flex flex-col">
                  <div className="p-4 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F7F8FA]">
                     <h3 className="font-bold text-[#172033] text-base">Travel Tools & Discovery</h3>
                     <button onClick={() => setShowToolsPanel(false)} className="text-[#697386] hover:text-[#172033] p-1 rounded-lg hover:bg-gray-200">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
                  <div className="flex border-b border-[#E5E7EB] bg-[#F7F8FA]">
                     <button 
                       className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activeTab === 'discover' ? 'text-[#6D3DF5] border-b-2 border-[#6D3DF5] bg-white' : 'text-[#697386] hover:text-[#172033]'}`}
                       onClick={() => setActiveTab('discover')}
                     >
                       Places
                     </button>
                     <button 
                       className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activeTab === 'trains' ? 'text-[#1FA774] border-b-2 border-[#1FA774] bg-white' : 'text-[#697386] hover:text-[#172033]'}`}
                       onClick={() => setActiveTab('trains')}
                     >
                       Trains
                     </button>
                     <button 
                       className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activeTab === 'flights' ? 'text-[#4A90E2] border-b-2 border-[#4A90E2] bg-white' : 'text-[#697386] hover:text-[#172033]'}`}
                       onClick={() => setActiveTab('flights')}
                     >
                       Flights
                     </button>
                     <button 
                       className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activeTab === 'budget' ? 'text-[#6D3DF5] border-b-2 border-[#6D3DF5] bg-white' : 'text-[#697386] hover:text-[#172033]'}`}
                       onClick={() => setActiveTab('budget')}
                     >
                       Budget
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                     {activeTab === 'discover' && (
                       <PlaceSearch 
                         destination={currentTrip?.destination?.name || ''} 
                         onAddPlace={handleAddPlace} 
                         onPlaceClick={setPreviewPlace}
                         darkTheme={false}
                       />
                     )}
                     {activeTab === 'trains' && (
                       <TrainSearch currentTrip={currentTrip} />
                     )}
                     {activeTab === 'flights' && (
                       <FlightSearch currentTrip={currentTrip} />
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
