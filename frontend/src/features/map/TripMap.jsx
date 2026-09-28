import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, OverlayView } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const libraries = ['geometry'];

const CustomMarker = ({ position, type, title, subtitle, imageUrl, points, onClick }) => {
  let colorClass = 'bg-[#F28C28]';
  let dotColor = 'bg-[#FEF3E7]';
  
  if (type === 'origin') {
    colorClass = 'bg-[#1FA774]';
    dotColor = 'bg-[#E6F6F0]';
  } else if (type === 'destination') {
    colorClass = 'bg-[#6D3DF5]';
    dotColor = 'bg-[#F0EBFF]';
  } else if (type === 'stay') {
    colorClass = 'bg-[#4A90E2]';
    dotColor = 'bg-[#EBF3FC]';
  }

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
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
        className="relative group cursor-pointer transition-all duration-500 ease-out z-10 hover:z-50" 
        style={{
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0) translateY(-20px)',
          opacity: mounted ? 1 : 0
        }}
        onClick={onClick}
      >
        {/* Map Pin */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white ${colorClass} transition-transform group-hover:scale-110`}>
             <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
          </div>
          <div className="w-0.5 h-2.5 bg-[#172033] shadow-xs"></div>
        </div>
        
        {/* Info Card */}
        <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 w-max bg-white rounded-lg p-2 border border-[#E5E7EB] shadow-lg flex items-center gap-2 transition-all duration-300 opacity-95 group-hover:opacity-100 group-hover:scale-105">
          <div className="flex flex-col text-left">
            <span className="text-[#172033] font-bold text-xs leading-tight truncate max-w-[130px]" title={title}>{title}</span>
            {subtitle && <span className="text-[#697386] text-[10px] font-medium">{subtitle}</span>}
          </div>
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-8 h-8 rounded object-cover border border-[#E5E7EB] shrink-0" />
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
      const placesToBound = allMarkers.filter(m => m.type !== 'origin');
      
      if (placesToBound.length > 0) {
        placesToBound.forEach(point => bounds.extend(point.position));
      } else {
        allMarkers.forEach(point => bounds.extend(point.position));
      }
      
      map.fitBounds(bounds);
      
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
    setVisibleCount(0);
    if (isLoaded && map && allMarkers.length > 0) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= allMarkers.length) {
          clearInterval(interval);
        }
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [isLoaded, map, allMarkers.length]);

  if (!isLoaded) return <div className="w-full h-full bg-[#F7F8FA] animate-pulse rounded-xl border border-[#E5E7EB]"></div>;

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
        mapTypeId: 'terrain',
        backgroundColor: '#F7F8FA'
      }}
    >
      {/* Markers */}
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

      {/* Midpoint Info Box */}
      {decodedPath.length > 0 && routeDetails && (
        <OverlayView 
          position={decodedPath[Math.floor(decodedPath.length / 2)]} 
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
        >
          <div className="bg-white/95 backdrop-blur rounded-lg p-2 border border-[#E5E7EB] shadow-md flex flex-col items-center z-40 text-[#172033] min-w-[85px]">
            <svg className="w-4 h-4 text-[#4A90E2] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span className="font-extrabold text-xs">{Math.round(routeDetails.totalDuration / 60)}h {Math.round(routeDetails.totalDuration % 60)}m</span>
            <span className="text-[10px] text-[#697386] font-semibold">{(routeDetails.totalDistance / 1000).toFixed(0)} km</span>
          </div>
        </OverlayView>
      )}

      {/* Polyline Route */}
      {decodedPath.length > 0 && (
        <Polyline
          path={decodedPath}
          options={{
            strokeColor: '#6D3DF5',
            strokeOpacity: 0.85,
            strokeWeight: 5,
            geodesic: true,
          }}
        />
      )}
      
      {/* Map Legend */}
      <div className="absolute top-3 right-12 bg-white/90 backdrop-blur border border-[#E5E7EB] p-3 rounded-lg shadow-sm flex flex-col gap-2">
         <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#6D3DF5] rounded-full"></div>
            <span className="text-[#172033] text-[11px] font-bold">Route Path</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1FA774] border border-white"></div>
            <span className="text-[#172033] text-[11px] font-bold">Origin</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6D3DF5] border border-white"></div>
            <span className="text-[#172033] text-[11px] font-bold">Destination</span>
         </div>
      </div>
    </GoogleMap>
  );
};

export default React.memo(TripMap);
