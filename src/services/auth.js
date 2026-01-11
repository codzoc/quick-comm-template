import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Authentication Service
 * Handles admin authentication
 */

/**
 * Check if a user is an admin
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function isAdmin(email) {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', email));
    return adminDoc.exists() && adminDoc.data().role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Sign in with email and password (Admin only)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Verify user is an admin
    const adminStatus = await isAdmin(email);
    if (!adminStatus) {
      await firebaseSignOut(auth);
      throw new Error('Access denied. This account is not authorized as an admin.');
    }

    // AuthContext will automatically detect admin role and update state
    return userCredential;
  } catch (error) {
    console.error('Sign in error:', error);
    if (error.message.includes('Access denied')) {
      throw error;
    }
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
    // AuthContext will automatically update state on auth change
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Get current session type (deprecated - use AuthContext instead)
 * @returns {string|null} 'admin' or null
 * @deprecated Use useAuth() hook from AuthContext instead
 */
export function getSessionType() {
  // This is kept for backward compatibility but should not be used
  // AuthContext manages role state automatically
  return null;
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
 * Send password reset email
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
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
  onAuthChange,
  resetPassword,
  isAdmin,
  getSessionType
};
