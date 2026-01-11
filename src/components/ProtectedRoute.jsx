import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protected Route for Admin Pages
 * Redirects to admin login if not authenticated as admin
 */
export function AdminProtectedRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

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

  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/**
 * Protected Route for Customer Pages
 * Redirects to customer login if not authenticated as customer
 */
export function CustomerProtectedRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

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

  if (!currentUser || userRole !== 'customer') {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return children;
}
