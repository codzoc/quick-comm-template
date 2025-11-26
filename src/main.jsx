import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { getTheme } from './services/theme';
import { getStoreInfo } from './services/storeInfo';
import { initializeFont } from './utils/googleFonts';
import FaviconLoader from './components/FaviconLoader';
import './index.css';
import './theme.css';

/**
 * Apply theme CSS variables to :root
 */
function applyThemeVariables(theme) {
  const root = document.documentElement;

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  // Border Radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--border-radius-${key}`, value);
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  // Font Sizes
  Object.entries(theme.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });

  // Font Weights
  Object.entries(theme.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value);
  });

  // Z-index
  Object.entries(theme.zIndex).forEach(([key, value]) => {
    root.style.setProperty(`--z-index-${key}`, value);
  });
}

/**
 * Initialize and apply theme from Firebase
 */
async function initializeTheme() {
  try {
    // Fetch theme and store info from Firebase
    const [theme, storeInfo] = await Promise.all([
      getTheme(),
      getStoreInfo()
    ]);

    // Initialize Google Font from theme configuration
    initializeFont(theme);

    // Apply theme CSS variables
    applyThemeVariables(theme);

    return storeInfo;
  } catch (error) {
    console.error('Error initializing theme:', error);
    // Theme service will return default theme on error
    return {};
  }
}

// Initialize theme and render app
initializeTheme().then((storeInfo) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <CartProvider>
        <FaviconLoader iconUrl={storeInfo?.storeIcon} />
        <App />
      </CartProvider>
    </React.StrictMode>
  );
});
