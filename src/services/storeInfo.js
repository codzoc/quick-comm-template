import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'storeInfo';
const SETTINGS_COLLECTION = 'settings';

/**
 * Store Info Service
 * Handles store contact information and static pages
 */

/**
 * Get store contact information
 * @returns {Promise<Object>} Returns store info with _documentExists flag
 */
export async function getStoreInfo() {
  try {
    const storeRef = doc(db, COLLECTION_NAME, 'contact');
    const storeSnap = await getDoc(storeRef);

    if (storeSnap.exists()) {
      const data = storeSnap.data();
      // Ensure pricing fields have defaults (these are safe defaults for calculations)
      // But don't set defaults for display fields like storeName, productsHeading - only if document doesn't exist
      return {
        ...data,
        currencySymbol: data.currencySymbol || '₹',
        taxPercentage: data.taxPercentage ?? 0,
        shippingCost: data.shippingCost ?? 0,
        logoUrl: data.logoUrl || '/images/logo.png',
        // Don't set default for productsHeading if document exists - let it be empty if not set
        productsHeading: data.productsHeading,
        _documentExists: true // Flag to indicate document exists in Firestore
      };
    } else {
      // Return default values if document doesn't exist
      return {
        storeName: 'Quick Commerce',
        phone: '',
        whatsapp: '',
        facebook: '',
        instagram: '',
        youtube: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        currencySymbol: '₹',
        taxPercentage: 0,
        shippingCost: 0,
        logoUrl: '/images/logo.png',
        productsHeading: 'Our Products',
        _documentExists: false // Flag to indicate document doesn't exist - defaults are safe to use
      };
    }
  } catch (error) {
    console.error('Error fetching store info:', error);
    throw new Error('Failed to load store information.');
  }
}

/**
 * Update store contact information
 * @param {Object} storeData
 * @returns {Promise<void>}
 */
export async function updateStoreInfo(storeData) {
  try {
    const storeRef = doc(db, COLLECTION_NAME, 'contact');
    await setDoc(
      storeRef,
      {
        ...storeData,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating store info:', error);
    throw new Error('Failed to update store information.');
  }
}

/**
 * Get static page content (About, Terms, Privacy, Shipping, Cancellation, Contact)
 * @param {string} pageType - 'about' | 'terms' | 'privacy' | 'shipping' | 'cancellation' | 'contact'
 * @returns {Promise<Object>}
 */
export async function getStaticPage(pageType) {
  try {
    const pageRef = doc(db, SETTINGS_COLLECTION, pageType);
    const pageSnap = await getDoc(pageRef);

    if (pageSnap.exists()) {
      return pageSnap.data();
    } else {
      return {
        content: '',
        imagePath: null
      };
    }
  } catch (error) {
    console.error(`Error fetching ${pageType} page:`, error);
    throw new Error(`Failed to load ${pageType} page.`);
  }
}

/**
 * Update static page content
 * @param {string} pageType - 'about' | 'terms' | 'privacy' | 'shipping' | 'cancellation' | 'contact'
 * @param {Object} pageData - {content, imagePath}
 * @returns {Promise<void>}
 */
export async function updateStaticPage(pageType, pageData) {
  const validPages = ['about', 'terms', 'privacy', 'shipping', 'cancellation', 'contact'];

  if (!validPages.includes(pageType)) {
    throw new Error('Invalid page type');
  }

  try {
    const pageRef = doc(db, SETTINGS_COLLECTION, pageType);
    await setDoc(
      pageRef,
      {
        ...pageData,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Error updating ${pageType} page:`, error);
    throw new Error(`Failed to update ${pageType} page.`);
  }
}

/**
 * Get all static pages
 * @returns {Promise<Object>} Object with about, terms, privacy, shipping, cancellation, contact keys
 */
export async function getAllStaticPages() {
  try {
    const about = await getStaticPage('about');
    const terms = await getStaticPage('terms');
    const privacy = await getStaticPage('privacy');
    const shipping = await getStaticPage('shipping');
    const cancellation = await getStaticPage('cancellation');
    const contact = await getStaticPage('contact');

    return {
      about,
      terms,
      privacy,
      shipping,
      cancellation,
      contact
    };
  } catch (error) {
    console.error('Error fetching static pages:', error);
    return {
      about: { content: '', imagePath: null },
      terms: { content: '', imagePath: null },
      privacy: { content: '', imagePath: null },
      shipping: { content: '', imagePath: null },
      cancellation: { content: '', imagePath: null },
      contact: { content: '', imagePath: null }
    };
  }
}

export default {
  getStoreInfo,
  updateStoreInfo,
  getStaticPage,
  updateStaticPage,
  getAllStaticPages
};
