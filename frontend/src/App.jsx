import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TripProvider } from './contexts/TripContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripHistory from './pages/TripHistory';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateTrip />} />
              <Route path="/history" element={<TripHistory />} />
              <Route path="/profile" element={<Profile />} />
              {/* Add more protected routes here */}
            </Route>

            {/* Default Route */}
            <Route path="*" element={<Navigate to="/history" replace />} />
          </Routes>
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
