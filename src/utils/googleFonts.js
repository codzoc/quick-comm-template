/**
 * Google Fonts Loader
 * Dynamically loads Google Fonts based on theme configuration
 */

/**
 * Load a Google Font by name
 * @param {string} fontName - Name of the Google Font (e.g., 'Poppins', 'Roboto')
 * @param {string[]} weights - Array of font weights to load (default: ['400', '500', '600', '700'])
 */
export function loadGoogleFont(fontName, weights = ['400', '500', '600', '700']) {
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href*="${fontName}"]`);
  if (existingLink) {
    return; // Font already loaded
  }

  // Build Google Fonts URL
  const weightsParam = weights.join(';');
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(
    / /g,
    '+'
  )}:wght@${weightsParam}&display=swap`;

  // Create and append link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontUrl;
  document.head.appendChild(link);
}

/**
 * Apply font family to document root
 * @param {string} fontFamily - Font family name
 */
export function applyFontFamily(fontFamily) {
  document.documentElement.style.setProperty('--font-family', `"${fontFamily}", sans-serif`);
}

/**
 * Initialize Google Font from theme
 * @param {Object} theme - Theme configuration object
 */
export function initializeFont(theme) {
  if (theme.fontFamily) {
    loadGoogleFont(theme.fontFamily);
    applyFontFamily(theme.fontFamily);
  }
}

export default {
  loadGoogleFont,
  applyFontFamily,
  initializeFont
};
