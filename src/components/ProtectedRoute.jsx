import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { getSessionType } from '../services/customerAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protected Route for Admin Pages
 * Redirects to admin login if not authenticated as admin
 */
export function AdminProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = getCurrentUser();
      const userType = getSessionType();

      if (user && userType === 'admin') {
        setIsAuthenticated(true);
        setIsAuthorized(true);
      } else {
        setIsAuthenticated(false);
        setIsAuthorized(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/**
 * Protected Route for Customer Pages
 * Redirects to customer login if not authenticated as customer
 */
export function CustomerProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      const userType = getSessionType();

      if (user && userType === 'customer') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return children;
}
