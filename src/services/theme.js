import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { defaultTemplate, getThemeTemplate } from '../config/themeTemplates';

const COLLECTION_NAME = 'settings';
const THEME_DOC_ID = 'theme';

/**
 * Default theme configuration
 * Used as fallback when no theme is set in Firebase
 */
const defaultTheme = {
  ...getThemeTemplate(defaultTemplate),
  colors: {
    ...getThemeTemplate(defaultTemplate).colors,
    disabled: '#cbd5e1',
    outOfStock: '#dc2626'
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  }
};

/**
 * Get theme configuration from Firebase
 * Returns theme based on selected template or default
 * @returns {Promise<Object>} Theme configuration
 */
export async function getTheme() {
  try {
    const docRef = doc(db, COLLECTION_NAME, THEME_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // If template is specified, use template and merge with custom overrides
      if (data.templateKey) {
        const template = getThemeTemplate(data.templateKey);
        const customOverrides = data.customOverrides || {};
        return {
          ...template,
          ...customOverrides,
          templateKey: data.templateKey
        };
      }

      // Legacy support: if no template, use old theme format
      if (data.theme) {
        return { ...defaultTheme, ...data.theme };
      }
    }

    // Return default template theme if document doesn't exist
    return { ...getThemeTemplate(defaultTemplate), templateKey: defaultTemplate };
  } catch (error) {
    console.error('Error fetching theme:', error);
    // Return default template theme on error
    return { ...getThemeTemplate(defaultTemplate), templateKey: defaultTemplate };
  }
}

/**
 * Update theme configuration in Firebase (admin only)
 * @param {Object} theme - Theme configuration object
 * @returns {Promise<void>}
 */
export async function updateTheme(theme) {
  try {
    const docRef = doc(db, COLLECTION_NAME, THEME_DOC_ID);

    await setDoc(docRef, {
      theme: theme,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    throw new Error('Failed to update theme. Please try again.');
  }
}

/**
 * Update theme template selection in Firebase (admin only)
 * @param {string} templateKey - Template key (e.g., 'flat', 'minimal')
 * @param {Object} customOverrides - Optional custom overrides to template
 * @returns {Promise<void>}
 */
export async function updateThemeTemplate(templateKey, customOverrides = {}) {
  try {
    const docRef = doc(db, COLLECTION_NAME, THEME_DOC_ID);

    await setDoc(docRef, {
      templateKey,
      customOverrides,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating theme template:', error);
    throw new Error('Failed to update theme template. Please try again.');
  }
}

/**
 * Get current theme template key
 * @returns {Promise<string>} Current template key
 */
export async function hasSavedTheme() {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, THEME_DOC_ID));
    return snap.exists();
  } catch (error) {
    console.error('Error checking saved theme:', error);
    return false;
  }
}

export async function getCurrentTemplate() {
  try {
    const docRef = doc(db, COLLECTION_NAME, THEME_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.templateKey || defaultTemplate;
    }

    return defaultTemplate;
  } catch (error) {
    console.error('Error fetching current template:', error);
    return defaultTemplate;
  }
}

/**
 * Get default theme configuration
 * @returns {Object} Default theme
 */
export function getDefaultTheme() {
  return defaultTheme;
}

export default {
  getTheme,
  updateTheme,
  updateThemeTemplate,
  getCurrentTemplate,
  hasSavedTheme,
  getDefaultTheme
};
