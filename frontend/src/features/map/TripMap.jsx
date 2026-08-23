import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

// Default center (India center if no trip loaded)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const libraries = ['geometry'];

const TripMap = ({ trip, routeDetails }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [decodedPath, setDecodedPath] = useState([]);

  useEffect(() => {
    if (routeDetails?.polyline && window.google) {
      const path = window.google.maps.geometry.encoding.decodePath(routeDetails.polyline);
      setDecodedPath(path.map(p => ({ lat: p.lat(), lng: p.lng() })));
    }
  }, [routeDetails, isLoaded]);

  useEffect(() => {
    if (map && decodedPath.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      decodedPath.forEach(point => bounds.extend(point));
      map.fitBounds(bounds);
    }
  }, [map, decodedPath]);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl"></div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {/* Markers for origin and destination if they have coordinates */}
      {trip?.origin?.coordinates && (
        <Marker position={trip.origin.coordinates} label="A" />
      )}
      {trip?.destination?.coordinates && (
        <Marker position={trip.destination.coordinates} label="B" />
      )}

      {/* Polyline for route */}
      {decodedPath.length > 0 && (
        <Polyline
          path={decodedPath}
          options={{
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          }}
        />
      )}
    </GoogleMap>
  );
};

export default React.memo(TripMap);
