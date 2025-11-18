import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'settings';

/**
 * Settings Service
 * Handles static page content and other site-wide settings
 */

/**
 * Get static page content
 * @param {string} pageType - 'about' | 'terms' | 'privacy'
 * @returns {Promise<string>} Page content
 */
export async function getStaticPageContent(pageType) {
  try {
    const docRef = doc(db, COLLECTION_NAME, 'staticPages');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data[pageType] || null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching static page content:', error);
    return null;
  }
}

/**
 * Update static page content (admin only)
 * @param {string} pageType - 'about' | 'terms' | 'privacy'
 * @param {string} content - Page content
 * @returns {Promise<void>}
 */
export async function updateStaticPageContent(pageType, content) {
  try {
    const docRef = doc(db, COLLECTION_NAME, 'staticPages');
    const docSnap = await getDoc(docRef);

    const currentData = docSnap.exists() ? docSnap.data() : {};

    await setDoc(docRef, {
      ...currentData,
      [pageType]: content
    });
  } catch (error) {
    console.error('Error updating static page content:', error);
    throw new Error('Failed to update page content. Please try again.');
  }
}

export default {
  getStaticPageContent,
  updateStaticPageContent
};
