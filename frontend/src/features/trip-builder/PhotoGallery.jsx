import React from 'react';

const PhotoGallery = ({ trip }) => {
  // Gather all unique photos from itinerary and selected places
  const photos = [];
  const seen = new Set();
  
  if (trip.itinerary) {
    trip.itinerary.forEach(day => {
      day.items.forEach(item => {
        if (item.photo_url && !seen.has(item.name)) {
          seen.add(item.name);
          photos.push({ name: item.name, url: item.photo_url, type: item.type });
        }
      });
    });
  }

  if (trip.selectedPlaces) {
    trip.selectedPlaces.forEach(place => {
      if (place.photo_url && !seen.has(place.name)) {
        seen.add(place.name);
        photos.push({ name: place.name, url: place.photo_url, type: place.category });
      }
    });
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-gray-500 p-8 text-center rounded-2xl">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Photos Yet</h3>
        <p className="text-sm max-w-sm">Generate an itinerary or add places with photos to see your trip's visual highlights here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-full overflow-y-auto p-6 rounded-2xl">
      <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Trip Highlights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {photos.map((photo, idx) => (
          <div key={idx} className="relative rounded-2xl overflow-hidden shadow-sm group h-64 border border-gray-100 bg-gray-50">
            <img 
              src={photo.url} 
              alt={photo.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 transition-opacity duration-300"></div>
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-semibold uppercase tracking-wider mb-2 border border-white/20">
                {photo.type || 'Place'}
              </span>
              <h4 className="font-bold text-lg leading-tight truncate drop-shadow-md">
                {photo.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;
