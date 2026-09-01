import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, OverlayView } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const libraries = ['geometry'];

const CustomMarker = ({ position, type, title, subtitle, imageUrl, points, onClick }) => {
  let colorClass = 'bg-red-500';
  let dotColor = 'bg-red-400';
  
  if (type === 'origin') {
    colorClass = 'bg-emerald-500';
    dotColor = 'bg-emerald-400';
  } else if (type === 'destination') {
    colorClass = 'bg-purple-500';
    dotColor = 'bg-purple-400';
  } else if (type === 'stay') {
    colorClass = 'bg-indigo-500';
    dotColor = 'bg-indigo-400';
  }

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Trigger animation after initial render
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <OverlayView 
      position={position} 
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -height })}
    >
      <div 
        className="relative group cursor-pointer transition-all duration-700 ease-out z-10 hover:z-50" 
        style={{
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0) translateY(-40px)',
          opacity: mounted ? 1 : 0
        }}
        onClick={onClick}
      >
        {/* The Map Pin */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-white ${colorClass} transition-transform group-hover:scale-110`}>
             <div className={`w-2 h-2 rounded-full ${dotColor} shadow-inner`}></div>
          </div>
          <div className="w-0.5 h-3 bg-white shadow-sm mt-0.5"></div>
        </div>
        
        {/* The Info Card */}
        <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 w-max bg-[#1E293B]/90 backdrop-blur-md rounded-lg p-1.5 border border-gray-700/80 shadow-xl flex items-center gap-2 transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:scale-110 group-hover:z-50">
          <div className="flex flex-col text-left pl-1 pr-0.5">
            <span className="text-white font-bold text-[11px] tracking-wide truncate max-w-[120px] leading-tight" title={title}>{title}</span>
            {subtitle && <span className="text-gray-400 text-[9px] mt-0.5">{subtitle}</span>}
            {points && points.length > 0 && (
              <ul className="text-gray-300 text-[9px] mt-0.5 space-y-0.5">
                {points.slice(0, 1).map((p, i) => (
                  <li key={i} className="truncate max-w-[100px]">• {p}</li>
                ))}
                {points.length > 1 && <li className="text-gray-500 italic">+ {points.length - 1} more</li>}
              </ul>
            )}
          </div>
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-9 h-9 rounded object-cover border border-gray-600/50 shadow-inner shrink-0" />
          )}
        </div>
      </div>
    </OverlayView>
  );
};

const TripMap = ({ trip, routeDetails, onPlaceClick }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [decodedPath, setDecodedPath] = useState([]);

  const allMarkers = useMemo(() => {
    const markers = [];
    if (trip?.origin?.coordinates) {
      markers.push({ 
        key: 'origin',
        type: 'origin', 
        title: trip.origin.name, 
        position: trip.origin.coordinates 
      });
    }
    
    trip?.itinerary?.forEach(day => {
      day.items.forEach((item, idx) => {
        if (item.coordinates && item.type !== 'travel' && item.type !== 'rest') {
          markers.push({
            key: `it-${day.dayIndex}-${idx}`,
            type: item.type === 'hotel' ? 'stay' : 'place',
            title: item.name,
            subtitle: `Day ${day.dayIndex}`,
            position: item.coordinates,
            imageUrl: item.photo_url,
            item: item
          });
        }
      });
    });

    if (trip?.destination?.coordinates) {
      markers.push({ 
        key: 'destination',
        type: 'destination', 
        title: trip.destination.name, 
        position: trip.destination.coordinates,
        points: ['Destination Reached']
      });
    }

    return markers;
  }, [trip]);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  useEffect(() => {
    if (routeDetails?.polyline && window.google) {
      const path = window.google.maps.geometry.encoding.decodePath(routeDetails.polyline);
      setDecodedPath(path.map(p => ({ lat: p.lat(), lng: p.lng() })));
    }
  }, [routeDetails, isLoaded]);

  useEffect(() => {
    if (map && allMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      // Ignore origin when fitting bounds to zoom into the destination places
      const placesToBound = allMarkers.filter(m => m.type !== 'origin');
      
      if (placesToBound.length > 0) {
        placesToBound.forEach(point => bounds.extend(point.position));
      } else {
        allMarkers.forEach(point => bounds.extend(point.position));
      }
      
      map.fitBounds(bounds);
      
      // Prevent zooming in too close if there are only a few places very close to each other
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 14) map.setZoom(14);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, allMarkers]);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);


  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0); // reset on trip change
    if (isLoaded && map && allMarkers.length > 0) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= allMarkers.length) {
          clearInterval(interval);
        }
      }, 400); // 400ms delay between pins
      
      return () => clearInterval(interval);
    }
  }, [isLoaded, map, allMarkers.length]);

  if (!isLoaded) return <div className="w-full h-full bg-[#161E31] animate-pulse rounded-2xl border border-gray-800"></div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: 'hybrid', // Satellite view with labels
        backgroundColor: '#0B1120'
      }}
    >
      <div className="absolute inset-0 pointer-events-none bg-blue-900/10 mix-blend-overlay"></div>

      {/* Render only visible markers based on staggered animation state */}
      {allMarkers.slice(0, visibleCount).map(marker => (
        <CustomMarker 
          key={marker.key}
          position={marker.position}
          type={marker.type}
          title={marker.title}
          subtitle={marker.subtitle}
          imageUrl={marker.imageUrl}
          points={marker.points}
          onClick={() => marker.item && onPlaceClick && onPlaceClick(marker.item)}
        />
      ))}

      {/* Route Info Box at Midpoint */}
      {decodedPath.length > 0 && routeDetails && (
        <OverlayView 
          position={decodedPath[Math.floor(decodedPath.length / 2)]} 
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
        >
          <div className="bg-[#1E293B]/90 backdrop-blur-md rounded-xl p-2 border border-gray-700/80 shadow-2xl flex flex-col items-center z-40 text-white min-w-[90px]">
            <svg className="w-5 h-5 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            <span className="font-bold text-xs">{Math.round(routeDetails.totalDuration / 60)}h {Math.round(routeDetails.totalDuration % 60)}m</span>
            <span className="text-[10px] text-gray-400">{(routeDetails.totalDistance / 1000).toFixed(0)} km</span>
          </div>
        </OverlayView>
      )}

      {/* Polyline for route */}
      {decodedPath.length > 0 && (
        <Polyline
          path={decodedPath}
          options={{
            strokeColor: '#38bdf8', // bright sky blue
            strokeOpacity: 0.9,
            strokeWeight: 6,
            geodesic: true,
          }}
        />
      )}
      
      {/* Legend overlay */}
      <div className="absolute top-4 right-14 bg-[#1E293B]/90 backdrop-blur border border-gray-700 p-4 rounded-xl shadow-xl flex flex-col gap-3">
         <div className="flex items-center gap-3">
            <div className="w-6 h-1 bg-sky-400 rounded-full"></div>
            <span className="text-white text-xs font-semibold">Travel Route</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 border border-white shrink-0"></div>
            <span className="text-white text-xs font-semibold">Places to Visit</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-indigo-500 border border-white shrink-0"></div>
            <span className="text-white text-xs font-semibold">Stay Location</span>
         </div>
      </div>
    </GoogleMap>
  );
};

export default React.memo(TripMap);
