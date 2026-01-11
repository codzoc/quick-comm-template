import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Unified Authentication Context Provider
 * 
 * Manages authentication state for both admin and customer users with:
 * - Real-time Firestore listeners for immediate updates
 * - Automatic role detection (admin vs customer)
 * - Unified state management across the entire app
 * - No localStorage dependencies or race conditions
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'customer' | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile data with real-time listener
  const loadUserProfile = useCallback(async (user) => {
    if (!user) {
      setUserProfile(null);
      setUserRole(null);
      setLoading(false);
      return () => {}; // Return empty unsubscribe function
    }

    try {
      // Check if user is admin first
      const adminDocRef = doc(db, 'admins', user.email);
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists() && adminDoc.data().role === 'admin') {
        // User is an admin
        setUserRole('admin');
        
        // Set up real-time listener for admin data
        const unsubscribeAdmin = onSnapshot(adminDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              ...snapshot.data()
            });
          } else {
            // Admin doc was deleted, treat as logged out
            setUserProfile(null);
            setUserRole(null);
          }
          setLoading(false);
        }, (err) => {
          console.error('Error in admin listener:', err);
          setError('Failed to load admin data');
          setLoading(false);
        });

        return unsubscribeAdmin;
      } else {
        // User is a customer (or not found in admins)
        setUserRole('customer');
        
        const customerDocRef = doc(db, 'customers', user.uid);
        
        // Set up real-time listener for customer data
        const unsubscribeCustomer = onSnapshot(customerDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              ...snapshot.data()
            });
            setLoading(false);
          } else {
            // Customer doc doesn't exist yet, create it
            const customerData = {
              email: user.email,
              name: user.displayName || '',
              phone: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            setDoc(customerDocRef, customerData).then(() => {
              setUserProfile({
                uid: user.uid,
                email: user.email,
                ...customerData
              });
              setLoading(false);
            }).catch((err) => {
              console.error('Error creating customer doc:', err);
              // Set basic profile from auth data
              setUserProfile({
                uid: user.uid,
                email: user.email,
                name: user.displayName || '',
                phone: ''
              });
              setLoading(false);
            });
          }
        }, (err) => {
          console.error('Error in customer listener:', err);
          // Fallback to basic profile from auth
          setUserProfile({
            uid: user.uid,
            email: user.email,
            name: user.displayName || '',
            phone: ''
          });
          setLoading(false);
        });

        return unsubscribeCustomer;
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user data');
      setUserProfile(null);
      setUserRole(null);
      setLoading(false);
      return () => {}; // Return empty unsubscribe function
    }
  }, []);

  // Main auth state listener
  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setError(null);

      if (user) {
        // Load user profile with real-time listener
        unsubscribeProfile = await loadUserProfile(user);
      } else {
        // User logged out
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    }, (err) => {
      console.error('Auth state change error:', err);
      setError('Authentication error');
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, [loadUserProfile]);

  // Update user profile function
  const updateUserProfile = useCallback(async (updates) => {
    if (!currentUser || !userRole) {
      throw new Error('No user logged in');
    }

    try {
      if (userRole === 'admin') {
        const adminRef = doc(db, 'admins', currentUser.email);
        await updateDoc(adminRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        // Real-time listener will automatically update state
      } else if (userRole === 'customer') {
        const customerRef = doc(db, 'customers', currentUser.uid);
        await updateDoc(customerRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
        // Real-time listener will automatically update state
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      throw new Error('Failed to update profile');
    }
  }, [currentUser, userRole]);

  // Refresh user data manually (useful after operations)
  const refreshUserData = useCallback(async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  }, [currentUser, loadUserProfile]);

  // Check if user is admin
  const isAdmin = userRole === 'admin';
  
  // Check if user is customer
  const isCustomer = userRole === 'customer';

  // Check if user is authenticated
  const isAuthenticated = !!currentUser;

  const value = {
    // User state
    currentUser,
    userProfile,
    userRole,
    loading,
    error,
    
    // Helper functions
    isAdmin,
    isCustomer,
    isAuthenticated,
    
    // Actions
    updateUserProfile,
    refreshUserData,
    
    // Set error (for clearing errors)
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
