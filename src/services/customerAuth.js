import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Customer Authentication Service
 * Handles customer signup, login, and profile management
 */

/**
 * Sign up new customer
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<Object>} User data
 */
export async function signUpCustomer(email, password, name, phone) {
    try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName: name });

        // Create customer document in Firestore
        const customerData = {
            email: email,
            name: name,
            phone: phone,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'customers', user.uid), customerData);

        return {
            uid: user.uid,
            email: user.email,
            name: name,
            phone: phone
        };
    } catch (error) {
        console.error('Sign up error:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

/**
 * Sign in customer
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} User data
 */
export async function loginCustomer(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch customer data from Firestore
        const customerDoc = await getDoc(doc(db, 'customers', user.uid));

        if (customerDoc.exists()) {
            return {
                uid: user.uid,
                email: user.email,
                ...customerDoc.data()
            };
        }

        // If customer document doesn't exist, return basic info
        return {
            uid: user.uid,
            email: user.email,
            name: user.displayName || '',
            phone: ''
        };
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

/**
 * Sign out customer
 * @returns {Promise<void>}
 */
export async function logoutCustomer() {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout. Please try again.');
    }
}

/**
 * Get current customer
 * @returns {User|null}
 */
export function getCurrentCustomer() {
    return auth.currentUser;
}

/**
 * Get customer data from Firestore
 * @param {string} customerId
 * @returns {Promise<Object>}
 */
export async function getCustomerData(customerId) {
    try {
        const customerDoc = await getDoc(doc(db, 'customers', customerId));

        if (customerDoc.exists()) {
            return {
                uid: customerId,
                ...customerDoc.data()
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching customer data:', error);
        throw new Error('Failed to load customer data.');
    }
}

/**
 * Update customer profile
 * @param {string} customerId
 * @param {Object} updates - {name, phone}
 * @returns {Promise<void>}
 */
export async function updateCustomerProfile(customerId, updates) {
    try {
        const customerRef = doc(db, 'customers', customerId);

        await setDoc(customerRef, {
            ...updates,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // Update Firebase Auth display name if name changed
        if (updates.name && auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: updates.name });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile. Please try again.');
    }
}

/**
 * Subscribe to customer auth state changes
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function onCustomerAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get user-friendly error message
 * @param {string} errorCode
 * @returns {string}
 */
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

export default {
    signUpCustomer,
    loginCustomer,
    logoutCustomer,
    getCurrentCustomer,
    getCustomerData,
    updateCustomerProfile,
    onCustomerAuthChange
};
