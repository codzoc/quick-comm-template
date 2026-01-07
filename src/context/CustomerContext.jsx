import React, { createContext, useContext, useState, useEffect } from 'react';
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
 * Listens to Firebase Auth state changes to keep session synchronized across all components
 */
export function CustomerProvider({ children }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Check if user is a customer (not admin)
      const userType = getSessionType();
      
      if (user && userType === 'customer') {
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
    });

    return unsubscribe;
  }, []);

  const value = {
    currentCustomer,
    customerProfile,
    loading
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

