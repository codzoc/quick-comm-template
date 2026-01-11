import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protected Admin Route Component
 * Uses unified AuthContext for authentication and authorization
 */
const ProtectedAdminRoute = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner size="large" message="Verifying access..." />;
    }

    if (!currentUser || userRole !== 'admin') {
        // Silently redirect non-admins (security best practice - don't reveal admin routes exist)
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;
