import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in context
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div 
        className="rounded-3xl shadow-2xl p-8 border border-white/60 transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.40)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-gray-900 font-bold mt-1">Start planning your perfect trip</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-900 font-bold p-3.5 rounded-xl mb-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-2.5 bg-white/60 border border-white/80 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:bg-white text-gray-900 placeholder-gray-600 outline-none transition-all shadow-sm font-semibold"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-2.5 bg-white/60 border border-white/80 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:bg-white text-gray-900 placeholder-gray-600 outline-none transition-all shadow-sm font-semibold"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-2.5 bg-white/60 border border-white/80 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:bg-white text-gray-900 placeholder-gray-600 outline-none transition-all shadow-sm font-semibold"
              placeholder="•••••••• (Min 6 characters)"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 active:scale-[0.99] cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-700 font-medium mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline hover:text-purple-700 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
