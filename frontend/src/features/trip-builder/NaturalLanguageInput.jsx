import React, { useState } from 'react';
import { parseTripInput } from '../../api/ai.api';

const NaturalLanguageInput = ({ onParsed }) => {
  const [prompt, setPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);

  const handleParse = async () => {
    if (!prompt.trim()) return;
    setIsParsing(true);
    setError(null);
    try {
      const data = await parseTripInput(prompt);
      onParsed(data);
    } catch (err) {
      setError('Could not parse trip from text. Please try again or fill the details below.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="travel-card p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-extrabold text-[#172033] flex items-center gap-2">
          Natural Language Journey Creator <span className="text-[#F28C28]">✨</span>
        </h3>
        <span className="badge-purple">Smart AI Input</span>
      </div>
      <p className="text-xs text-[#697386] mb-4 font-medium">
        Describe your journey idea naturally (e.g. origin, destination, duration, budget), and TripXora will extract the details automatically.
      </p>
      
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Plan a 3-day road trip from Indore to Bhopal for 2 people with a budget of ₹12,000 focusing on lakes, heritage monuments, and local food."
          className="w-full p-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#6D3DF5] focus:border-[#6D3DF5] outline-none transition-all resize-none h-32 text-[#172033] placeholder-[#697386] text-sm font-medium"
        />
        <button
          onClick={handleParse}
          disabled={isParsing || !prompt.trim()}
          className="absolute bottom-3 right-3 btn-primary text-xs py-2 px-4 disabled:opacity-50"
        >
          {isParsing ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            'Extract Journey Details ✨'
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-3 font-semibold">{error}</p>}
    </div>
  );
};

export default NaturalLanguageInput;
