import React, { useState, useEffect } from 'react';
import { getPlaceDetails, searchPlaces } from '../../api/places.api';

const PlacePreview = ({ place, trip }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (!place) return;
    
    let isMounted = true;
    setCurrentImageIdx(0);
    const fetchImages = async () => {
      setLoading(true);
      try {
        if (place.placeId) {
          const details = await getPlaceDetails(place.placeId);
          if (details.photos_urls && details.photos_urls.length > 0) {
            if (isMounted) setImages(details.photos_urls);
            return;
          }
        }
        
        const searchQuery = trip?.destination?.name 
          ? `${place.name} in ${trip.destination.name}` 
          : place.name;
          
        const searchRes = await searchPlaces(searchQuery);
        
        const match = searchRes?.find(r => r.name.toLowerCase().includes(place.name.toLowerCase())) || searchRes?.[0];
        
        if (match && match.place_id) {
          try {
            const details = await getPlaceDetails(match.place_id);
            if (details && details.photos_urls && details.photos_urls.length > 0) {
              if (isMounted) setImages(details.photos_urls);
              return;
            }
          } catch (err) {
            console.error("Failed to get details for match", err);
          }
          
          if (match.photos_urls && match.photos_urls.length > 0) {
            if (isMounted) setImages(match.photos_urls);
          } else if (match.photo_url) {
            if (isMounted) setImages([match.photo_url.replace('maxwidth=400', 'maxwidth=1200')]);
          } else {
            if (isMounted) setImages([]);
          }
        } else if (place.photo_url) {
          if (isMounted) setImages([place.photo_url.replace('maxwidth=400', 'maxwidth=1200')]);
        } else {
          if (isMounted) setImages([]);
        }
      } catch (e) {
        if (isMounted) {
          if (place.photo_url) setImages([place.photo_url.replace('maxwidth=400', 'maxwidth=1200')]);
          else setImages([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchImages();
    return () => { isMounted = false; };
  }, [place, trip]);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!place) return null;

  return (
    <div className="w-full h-full bg-[#0B1120] flex flex-col md:flex-row overflow-hidden text-gray-200">
      {/* Left Side: Images Carousel */}
      <div className="w-full md:w-3/5 h-1/2 md:h-full relative bg-black flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <span>Loading high-res photos...</span>
          </div>
        ) : images.length > 0 ? (
          <div className="w-full h-full flex flex-col bg-black">
            {/* Main Image */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              <img 
                src={images[currentImageIdx]} 
                alt={`${place.name} - ${currentImageIdx + 1}`} 
                className="w-full h-full object-cover transition-opacity duration-300"
                loading="lazy"
              />
            </div>
            
            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="h-24 bg-[#0B1120] p-3 flex gap-3 overflow-x-auto custom-scrollbar shrink-0 border-t border-gray-800 items-center">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }}
                    className={`h-full aspect-[4/3] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      idx === currentImageIdx 
                        ? 'border-blue-400 opacity-100 shadow-[0_0_10px_rgba(56,189,248,0.5)]' 
                        : 'border-transparent opacity-40 hover:opacity-100 scale-95 hover:scale-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>No photo available</span>
          </div>
        )}
      </div>

      {/* Right Side: Details */}
      <div className="w-full md:w-2/5 h-1/2 md:h-full p-8 overflow-y-auto bg-[#161E31] border-l border-gray-800 custom-scrollbar">
        {place.category && (
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            {place.category.replace(/_/g, ' ')}
          </span>
        )}
        <h2 className="text-3xl font-extrabold mb-2 text-white tracking-tight">{place.name}</h2>
        
        {place.rating && (
          <div className="flex items-center text-yellow-400 mb-6 bg-yellow-400/10 w-max px-2 py-1 rounded">
            <span className="text-lg mr-1">★</span>
            <span className="font-bold">{place.rating}</span>
          </div>
        )}
        
        {place.formatted_address && (
          <div className="mb-6">
            <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Location</h4>
            <p className="text-gray-300 text-sm flex items-start gap-2 bg-[#1E293B] p-3 rounded-lg border border-gray-700/50">
              <span className="mt-0.5">📍</span>
              <span>{place.formatted_address}</span>
            </p>
          </div>
        )}
        
        {place.notes && (
          <div>
            <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">TripXora AI Insight</h4>
            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-100 text-sm flex items-start gap-3">
              <span className="text-xl">✨</span>
              <span className="italic leading-relaxed">{place.notes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacePreview;
