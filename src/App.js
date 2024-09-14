// App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './components/AuthContext'; // Import AuthContext
import Summarizer from './components/summarizer';
import Login from './components/Login'; // Login component
import Register from './components/Register'; // Register component
import Dashboard from './components/Dashboard'; // Dashboard component
import { Toaster } from 'react-hot-toast';

// PrivateRoute component to protect certain routes
function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/summarizer" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Add Register Route */}
        <Route path="/summarizer" element={<PrivateRoute><Summarizer /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

// Wrap the App with the AuthProvider for token management
export default function Root() {
  return (
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  );
}
