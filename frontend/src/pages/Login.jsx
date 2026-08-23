import React from 'react';
import LoginForm from '../features/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img src="/logo.png" alt="TripXora Logo" className="h-16 w-auto mb-4 object-contain" />
        <h1 className="text-center text-4xl font-extrabold text-primary mb-2 tracking-tight">TripXora</h1>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
