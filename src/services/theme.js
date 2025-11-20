import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { themeTemplates, defaultTemplate, getThemeTemplate } from '../config/themeTemplates';

const COLLECTION_NAME = 'settings';
const THEME_DOC_ID = 'theme';

/**
 * Default theme configuration
 * Used as fallback when no theme is set in Firebase
 */
const defaultTheme = {
  fontFamily: 'Poppins',
  colors: {
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    secondary: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textLight: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    disabled: '#D1D5DB',
    outOfStock: '#DC2626'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  zIndex: {
    base: 1,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    toast: 400
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
  getDefaultTheme
};
