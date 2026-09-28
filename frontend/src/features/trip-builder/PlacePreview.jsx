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

  if (!place) return null;

  return (
    <div className="w-full h-full bg-white flex flex-col md:flex-row overflow-hidden text-[#172033]">
      {/* Left Side: Photo Carousel */}
      <div className="w-full md:w-3/5 h-1/2 md:h-full relative bg-gray-900 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-300 text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
            <span>Loading photos...</span>
          </div>
        ) : images.length > 0 ? (
          <div className="w-full h-full flex flex-col bg-gray-900">
            {/* Main Photo */}
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
              <div className="h-20 bg-gray-950 p-2.5 flex gap-2.5 overflow-x-auto shrink-0 border-t border-gray-800 items-center">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }}
                    className={`h-full aspect-[4/3] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      idx === currentImageIdx 
                        ? 'border-[#6D3DF5] opacity-100' 
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
          <div className="flex flex-col items-center justify-center text-gray-400 text-sm">
            <svg className="w-10 h-10 mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>No photo available</span>
          </div>
        )}
      </div>

      {/* Right Side: Details */}
      <div className="w-full md:w-2/5 h-1/2 md:h-full p-6 overflow-y-auto bg-white border-l border-[#E5E7EB]">
        {place.category && (
          <span className="badge-purple mb-3">
            {place.category.replace(/_/g, ' ')}
          </span>
        )}
        <h2 className="text-2xl font-extrabold mb-2 text-[#172033] tracking-tight">{place.name}</h2>
        
        {place.rating && (
          <div className="flex items-center text-[#F28C28] mb-4 bg-[#FEF3E7] w-max px-2.5 py-1 rounded-md text-xs font-bold">
            <span className="mr-1 text-sm">★</span>
            <span>{place.rating}</span>
          </div>
        )}
        
        {place.formatted_address && (
          <div className="mb-4">
            <h4 className="text-[11px] uppercase text-[#697386] font-bold tracking-wider mb-1.5">Location</h4>
            <p className="text-[#172033] text-xs font-medium flex items-start gap-2 bg-[#F7F8FA] p-3 rounded-lg border border-[#E5E7EB]">
              <span className="mt-0.5">📍</span>
              <span>{place.formatted_address}</span>
            </p>
          </div>
        )}
        
        {place.notes && (
          <div>
            <h4 className="text-[11px] uppercase text-[#697386] font-bold tracking-wider mb-1.5">TripXora Travel Insight</h4>
            <div className="p-3 bg-[#F0EBFF] rounded-lg border border-[#6D3DF5]/20 text-[#6D3DF5] text-xs flex items-start gap-2">
              <span className="text-base">✨</span>
              <span className="font-medium leading-relaxed">{place.notes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacePreview;
