import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleGoogleToken, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const errorMsg = searchParams.get('error');

      if (errorMsg) {
        setError(decodeURIComponent(errorMsg));
        navigate('/login', { replace: true });
        return;
      }

      if (token) {
        try {
          await handleGoogleToken(token);
          navigate('/dashboard', { replace: true });
        } catch (err) {
          setError(err.message || 'Google authentication failed');
          navigate('/login', { replace: true });
        }
      } else {
        setError('No authentication token received');
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [searchParams, handleGoogleToken, setError, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl max-w-sm w-full">
        <div className="inline-block p-4 rounded-full bg-purple-600/20 mb-4 animate-pulse">
          <svg
            className="w-10 h-10 text-purple-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h3 className="text-xl font-extrabold text-white mb-2">
          Completing Google Login...
        </h3>
        <p className="text-gray-300 text-sm">
          Please wait while we log you into TripXora.
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
