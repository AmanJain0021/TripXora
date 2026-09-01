import React from 'react';
import RegisterForm from '../features/auth/RegisterForm';
import signupBg from '../assets/signup-bg.png';

const Register = () => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url(${signupBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay to ensure vibrant background while enhancing text readability */}
      <div className="absolute inset-0 bg-black/15 backdrop-brightness-95 pointer-events-none"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-6">
        <div className="p-3 rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 shadow-lg mb-3">
          <img src="/logo.png" alt="TripXora Logo" className="h-16 w-auto object-contain drop-shadow-md" />
        </div>
        <h1 className="text-center text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
          Trip<span className="text-purple-300">Xora</span>
        </h1>
      </div>
      
      <div className="relative z-10">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
