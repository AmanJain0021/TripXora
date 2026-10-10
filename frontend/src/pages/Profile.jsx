import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    travelPace: 'moderate',
    dietary: 'None',
    newsletter: true
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] font-sans flex flex-col">
      <header className="bg-white sticky top-0 z-50 border-b border-[#E5E7EB] px-6 py-3.5 flex justify-between items-center shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#6D3DF5] flex items-center justify-center text-white shadow-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-xl font-extrabold text-[#172033] tracking-tight">Trip<span className="text-[#6D3DF5]">Xora</span></h1>
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard"
            className="btn-secondary text-xs"
          >
            <svg className="w-4 h-4 text-[#6D3DF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <Link to="/history" className="text-xs font-semibold text-[#697386] hover:text-[#172033] transition-colors">
            My Trips
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          
          <div>
            <span className="badge-purple mb-2">Account Profile</span>
            <h2 className="text-3xl font-extrabold text-[#172033] tracking-tight">Explorer Settings</h2>
          </div>

          <div className="travel-card p-6 flex items-center gap-6">
            <div className="w-16 h-16 bg-[#F0EBFF] text-[#6D3DF5] rounded-full flex items-center justify-center text-2xl font-bold border border-[#6D3DF5]/20 shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#172033]">{user?.name}</h3>
              <p className="text-[#697386] text-sm">{user?.email}</p>
              <div className="mt-2 flex gap-3">
                <span className="badge-green">
                  Premium Explorer Member
                </span>
              </div>
            </div>
          </div>

          <div className="travel-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#172033]">Travel Preferences</h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={isEditing ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
              >
                {isEditing ? 'Save Preferences' : 'Edit Preferences'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Base Currency</label>
                <select 
                  disabled={!isEditing}
                  value={preferences.currency}
                  onChange={e => setPreferences({...preferences, currency: e.target.value})}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 text-[#172033] focus:ring-2 focus:ring-[#6D3DF5] outline-none text-sm disabled:opacity-60 cursor-pointer font-medium"
                >
                  <option value="INR">Indian Rupee (INR ₹)</option>
                  <option value="USD">US Dollar (USD $)</option>
                  <option value="EUR">Euro (EUR €)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Default Travel Pace</label>
                <select 
                  disabled={!isEditing}
                  value={preferences.travelPace}
                  onChange={e => setPreferences({...preferences, travelPace: e.target.value})}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 text-[#172033] focus:ring-2 focus:ring-[#6D3DF5] outline-none text-sm disabled:opacity-60 cursor-pointer font-medium"
                >
                  <option value="relaxed">Relaxed Sightseeing</option>
                  <option value="moderate">Moderate Balanced</option>
                  <option value="fast">Fast-paced Exploration</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#697386] mb-2">Dietary Restrictions / Notes</label>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={preferences.dietary}
                  onChange={e => setPreferences({...preferences, dietary: e.target.value})}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 text-[#172033] focus:ring-2 focus:ring-[#6D3DF5] outline-none text-sm disabled:opacity-60 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm mt-8">
            <h3 className="text-base font-bold text-red-600 mb-1">Session Management</h3>
            <p className="text-[#697386] text-xs mb-4">Sign out of your active TripXora session on this device.</p>
            
            <div className="flex gap-4">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-bold text-xs transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
