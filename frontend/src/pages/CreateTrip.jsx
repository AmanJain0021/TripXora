import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NaturalLanguageInput from '../features/trip-builder/NaturalLanguageInput';
import TripForm from '../features/trip-builder/TripForm';

const CreateTrip = () => {
  const [parsedData, setParsedData] = useState(null);
  const navigate = useNavigate();

  const handleParsed = (data) => {
    setParsedData(data);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#E5E7EB] px-6 py-3.5 flex justify-between items-center shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#6D3DF5] flex items-center justify-center text-white shadow-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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

      {/* Content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-8 text-center sm:text-left">
          <span className="badge-purple mb-2">
            Journey Builder
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight mt-1 mb-2">
            Plan Your Next Trip ✈️
          </h1>
          <p className="text-[#697386] text-sm">Describe your travel ideas in natural text or fill out the travel details below.</p>
        </div>

        <NaturalLanguageInput onParsed={handleParsed} />
        
        <div className="relative flex py-8 items-center">
          <div className="flex-grow border-t border-[#E5E7EB]"></div>
          <span className="flex-shrink-0 mx-4 text-[#697386] text-xs font-bold uppercase tracking-widest bg-[#F7F8FA] px-3">
            Or Customize Details Manually
          </span>
          <div className="flex-grow border-t border-[#E5E7EB]"></div>
        </div>

        <TripForm prefilledData={parsedData} />
      </main>
    </div>
  );
};

export default CreateTrip;
