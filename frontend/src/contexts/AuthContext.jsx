import React, { createContext, useState, useEffect } from 'react';
import { getMe, login as loginApi, register as registerApi } from '../api/auth.api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await loginApi(email, password);
      localStorage.setItem('token', data.token);
      setUser(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const data = await registerApi(name, email, password);
      localStorage.setItem('token', data.token);
      setUser(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const handleGoogleToken = async (token) => {
    try {
      setError(null);
      localStorage.setItem('token', token);
      const userData = await getMe();
      setUser(userData);
      return userData;
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setError(err.response?.data?.message || 'Google authentication failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, handleGoogleToken, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
