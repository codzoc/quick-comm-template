import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthChange } from '../services/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import LoadingSpinner from './LoadingSpinner';

const ProtectedAdminRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (!user) {
                navigate('/admin');
                return;
            }

            try {
                // Check if user exists in 'admins' collection
                // We use email as the document ID for simplicity and direct lookup
                const adminDocRef = doc(db, 'admins', user.email);
                const adminDoc = await getDoc(adminDocRef);

                if (adminDoc.exists()) {
                    setIsAuthorized(true);
                } else {
                    // Silently redirect non-admins (security best practice - don't reveal admin routes exist)
                    navigate('/'); // Redirect non-admins to home
                }
            } catch (error) {
                console.error('Error verifying admin status:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return <LoadingSpinner size="large" message="Verifying access..." />;
    }

    return isAuthorized ? children : null;
};

export default ProtectedAdminRoute;
