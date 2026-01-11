import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getSessionType } from '../services/customerAuth';

const CustomerContext = createContext();

export function useCustomer() {
  return useContext(CustomerContext);
}

/**
 * Customer Context Provider
 * Manages global customer authentication state and profile data
 * Listens to Firebase Auth state changes and localStorage changes to keep session synchronized across all components
 */
export function CustomerProvider({ children }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load customer data
  const loadCustomerData = useCallback(async (user) => {
    if (!user) {
      setCurrentCustomer(null);
      setCustomerProfile(null);
      setLoading(false);
      return;
    }

    // Check if user is a customer (not admin)
    // Use a small delay to ensure localStorage is updated after login
    const checkSessionType = () => {
      const userType = getSessionType();
      return userType === 'customer';
    };

    // First check immediately
    let isCustomer = checkSessionType();
    
    // If not customer, wait a bit and check again (handles race condition with localStorage)
    if (!isCustomer) {
      await new Promise(resolve => setTimeout(resolve, 100));
      isCustomer = checkSessionType();
    }

    if (isCustomer) {
      setCurrentCustomer(user);
      
      // Fetch customer profile from Firestore
      try {
        const customerDoc = await getDoc(doc(db, 'customers', user.uid));
        
        if (customerDoc.exists()) {
          setCustomerProfile({
            uid: user.uid,
            email: user.email,
            ...customerDoc.data()
          });
        } else {
          // If customer document doesn't exist, create basic profile from auth
          setCustomerProfile({
            uid: user.uid,
            email: user.email,
            name: user.displayName || '',
            phone: ''
          });
        }
      } catch (error) {
        console.error("Error fetching customer profile:", error);
        // Fallback to basic profile from auth
        setCustomerProfile({
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          phone: ''
        });
      }
    } else {
      // User is not a customer (could be admin, logged out, or wrong session type)
      setCurrentCustomer(null);
      setCustomerProfile(null);
    }
    
    setLoading(false);
  }, []);

  // Function to refresh customer data (can be called externally)
  const refreshCustomerData = useCallback(async () => {
    const user = auth.currentUser;
    await loadCustomerData(user);
  }, [loadCustomerData]);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await loadCustomerData(user);
    });

    // Listen to storage changes (for when localStorage is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'userType' || e.key === null) {
        // Storage changed, refresh customer data
        const user = auth.currentUser;
        loadCustomerData(user);
      }
    };

    // Listen to custom auth events (for immediate updates after login/logout)
    const handleAuthEvent = () => {
      const user = auth.currentUser;
      loadCustomerData(user);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customerAuthChanged', handleAuthEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customerAuthChanged', handleAuthEvent);
    };
  }, [loadCustomerData]);

  const value = {
    currentCustomer,
    customerProfile,
    loading,
    refreshCustomerData
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

