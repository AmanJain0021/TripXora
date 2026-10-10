import React, { useState } from 'react';
import { searchPlaces } from '../../api/places.api';

const PlaceSearch = ({ destination, onAddPlace, onPlaceClick, darkTheme = false }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('point_of_interest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const searchQuery = query.toLowerCase().includes(destination?.toLowerCase() || '') 
        ? query 
        : `${query} in ${destination || ''}`;
        
      const data = await searchPlaces(searchQuery, type);
      setResults(data);
    } catch (err) {
      setError('Failed to fetch places');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (e, place) => {
    e.stopPropagation();
    const newPlace = {
      placeId: place.place_id,
      name: place.name,
      category: type,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      rating: place.rating,
      photo_url: place.photo_url
    };
    onAddPlace(newPlace);
  };

  const handlePreview = (place) => {
    if (onPlaceClick) {
      const previewData = {
        placeId: place.place_id,
        name: place.name,
        category: type,
        rating: place.rating,
        photo_url: place.photo_url,
        formatted_address: place.formatted_address
      };
      onPlaceClick(previewData);
    }
  };

  return (
    <div className="bg-white p-4 h-full flex flex-col text-[#172033]">
      <h3 className="text-base font-extrabold text-[#172033] mb-3">Discover Places</h3>
      
      <form onSubmit={handleSearch} className="mb-4 space-y-2.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search e.g., "Cafes" in ${destination || 'city'}`}
          className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#6D3DF5] text-[#172033] placeholder-[#697386] text-xs font-medium"
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg text-[#172033] text-xs font-medium"
          >
            <option value="point_of_interest">Attractions</option>
            <option value="restaurant">Restaurants</option>
            <option value="lodging">Hotels</option>
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-xs mb-3 px-1 font-semibold">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#697386] text-xs font-medium">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6D3DF5] mb-2"></div>
             Searching places...
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-[#697386] text-xs font-medium">Search for attractions or dining options above.</div>
        ) : (
          results.map((place) => (
            <div 
              key={place.place_id} 
              className="p-2.5 border border-[#E5E7EB] rounded-xl hover:border-[#6D3DF5] bg-white flex gap-3 items-center cursor-pointer transition-all shadow-xs group"
              onClick={() => handlePreview(place)}
            >
              {place.photo_url ? (
                <img src={place.photo_url} alt={place.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-[#E5E7EB]" />
              ) : (
                <div className="w-14 h-14 bg-[#F7F8FA] rounded-lg flex-shrink-0 flex items-center justify-center text-[#697386] border border-[#E5E7EB]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="flex-1 pr-1 min-w-0">
                <h4 className="font-bold text-[#172033] text-xs truncate group-hover:text-[#6D3DF5] transition-colors">{place.name}</h4>
                <p className="text-[10px] text-[#697386] truncate mt-0.5">{place.formatted_address}</p>
                <div className="flex items-center mt-1 text-[10px] text-[#697386] font-semibold">
                  <span className="text-[#F28C28] mr-1 text-xs">★</span>
                  <span>{place.rating || 'N/A'} ({place.user_ratings_total || 0})</span>
                </div>
              </div>
              <button
                onClick={(e) => handleAdd(e, place)}
                className="text-[#697386] hover:text-[#1FA774] hover:bg-[#E6F6F0] p-1.5 rounded-lg transition-colors flex-shrink-0"
                title="Add to Trip"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaceSearch;
