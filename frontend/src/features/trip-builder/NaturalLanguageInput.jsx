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
      setError('Could not parse trip from text. Please try again or use the manual form.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Magic Trip Creator ✨</h3>
      <p className="text-sm text-gray-500 mb-4">
        Just tell us what you want in plain English, and our AI will fill out the form for you.
      </p>
      
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. I want to travel from Indore to Udaipur for 4 days with my wife. We have ₹20,000 and want historical places and good food. We will travel by car."
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none h-32"
        />
        <button
          onClick={handleParse}
          disabled={isParsing || !prompt.trim()}
          className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isParsing ? 'Analyzing...' : 'Generate Trip'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default NaturalLanguageInput;
