import React, { useState } from 'react';
import { searchPlaces } from '../../api/places.api';

const PlaceSearch = ({ destination, onAddPlace }) => {
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

  const handleAdd = (place) => {
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Discover Places</h3>
      
      <form onSubmit={handleSearch} className="mb-4 space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search e.g., "Cafes" in ${destination}`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm"
          >
            <option value="point_of_interest">Attractions</option>
            <option value="restaurant">Restaurants</option>
            <option value="lodging">Hotels</option>
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">Searching...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">No places found.</div>
        ) : (
          results.map((place) => (
            <div key={place.place_id} className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50 flex gap-3 items-center">
              {place.photo_url ? (
                <img src={place.photo_url} alt={place.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              )}
              <div className="flex-1 pr-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm truncate">{place.name}</h4>
                <p className="text-xs text-gray-500 truncate">{place.formatted_address}</p>
                <div className="flex items-center mt-1 text-xs text-gray-600">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{place.rating || 'N/A'} ({place.user_ratings_total || 0})</span>
                </div>
              </div>
              <button
                onClick={() => handleAdd(place)}
                className="text-primary hover:bg-blue-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
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
