import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Authentication Service
 * Handles admin authentication
 */

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Get current user
 * @returns {User|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function onAuthChange(callback) {
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
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.'
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

export default {
  signIn,
  signOut,
  getCurrentUser,
  onAuthChange
};
