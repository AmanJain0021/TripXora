import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  
  // Simple state for UI demonstration
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    travelPace: 'moderate',
    dietary: 'None',
    newsletter: true
  });

  const handleSave = () => {
    // In a real app, hit an endpoint to save user preferences
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-8 py-4 flex justify-between items-center shadow-[0_1px_2px_rgb(0,0,0,0.02)]">
        <Link to="/history" className="flex items-center gap-3">
          <img src="/logo.png" alt="TripXora Logo" className="h-8 w-auto object-contain" />
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">TripXora</h1>
        </Link>
        <Link to="/history" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          Back to Trips
        </Link>
      </header>

      <main className="flex-1 p-6 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          
          <h2 className="text-3xl font-extrabold text-gray-900 mt-4 mb-8">Account Settings</h2>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-50 text-primary rounded-full flex items-center justify-center text-4xl font-bold border border-blue-100 shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-2 flex gap-3">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Premium Member</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Travel Preferences</h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  isEditing ? 'bg-primary text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isEditing ? 'Save Changes' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Base Currency</label>
                <select 
                  disabled={!isEditing}
                  value={preferences.currency}
                  onChange={e => setPreferences({...preferences, currency: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="INR">Indian Rupee (INR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Default Travel Pace</label>
                <select 
                  disabled={!isEditing}
                  value={preferences.travelPace}
                  onChange={e => setPreferences({...preferences, travelPace: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="fast">Fast-paced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dietary Restrictions</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={preferences.dietary}
                  onChange={e => setPreferences({...preferences, dietary: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-red-100 mt-12">
            <h3 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-gray-500 text-sm mb-6">Actions here are permanent and cannot be undone.</p>
            
            <div className="flex gap-4">
              <button
                onClick={logout}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
              >
                Log Out Everywhere
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
