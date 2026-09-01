import React, { useState } from 'react';
import { searchPlaces } from '../../api/places.api';

const PlaceSearch = ({ destination, onAddPlace, onPlaceClick, darkTheme = true }) => {
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
      // Append destination to query for better contextual results if they don't specify it
      const searchQuery = query.toLowerCase().includes(destination.toLowerCase()) 
        ? query 
        : `${query} in ${destination}`;
        
      const data = await searchPlaces(searchQuery, type);
      setResults(data);
    } catch (err) {
      setError('Failed to fetch places');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (e, place) => {
    e.stopPropagation(); // prevent clicking the container
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
    <div className="bg-[#0f172a] p-5 h-full flex flex-col text-gray-200">
      <h3 className="text-xl font-bold text-white mb-4">Discover Places</h3>
      
      <form onSubmit={handleSearch} className="mb-5 space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search e.g., "Cafes" in ${destination}`}
          className="w-full px-4 py-2.5 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm"
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#161E31] border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300 text-sm appearance-none"
          >
            <option value="point_of_interest">Attractions</option>
            <option value="restaurant">Restaurants</option>
            <option value="lodging">Hotels</option>
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2 rounded-lg font-medium hover:bg-blue-600/30 disabled:opacity-50 transition-colors text-sm shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {error && <p className="text-red-400 text-sm mb-4 px-2">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
             Searching...
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">No places found.</div>
        ) : (
          results.map((place) => (
            <div 
              key={place.place_id} 
              className="p-3 border border-gray-800 rounded-xl hover:border-gray-600 bg-[#161E31] flex gap-3 items-center cursor-pointer transition-colors group"
              onClick={() => handlePreview(place)}
            >
              {place.photo_url ? (
                <img src={place.photo_url} alt={place.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-700" />
              ) : (
                <div className="w-16 h-16 bg-[#1E293B] rounded-lg flex-shrink-0 flex items-center justify-center text-gray-600 border border-gray-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              )}
              <div className="flex-1 pr-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">{place.name}</h4>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{place.formatted_address}</p>
                <div className="flex items-center mt-1.5 text-[10px] text-gray-400 font-medium">
                  <span className="text-yellow-500 mr-1 text-sm">★</span>
                  <span>{place.rating || 'N/A'} ({place.user_ratings_total || 0})</span>
                </div>
              </div>
              <button
                onClick={(e) => handleAdd(e, place)}
                className="text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-lg transition-colors flex-shrink-0"
                title="Add to Trip"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
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
