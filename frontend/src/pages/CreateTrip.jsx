import React, { useState } from 'react';
import NaturalLanguageInput from '../features/trip-builder/NaturalLanguageInput';
import TripForm from '../features/trip-builder/TripForm';

const CreateTrip = () => {
  const [parsedData, setParsedData] = useState(null);

  const handleParsed = (data) => {
    setParsedData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Create New Trip</h1>
          <p className="text-gray-600">Where would you like to go next?</p>
        </div>

        <NaturalLanguageInput onParsed={handleParsed} />
        
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR FILL MANUALLY</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <TripForm prefilledData={parsedData} />
      </div>
    </div>
  );
};

export default CreateTrip;
