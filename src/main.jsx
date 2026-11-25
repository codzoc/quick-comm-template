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

  Object.entries(theme.colors || {}).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });

  Object.entries(theme.spacing || {}).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  Object.entries(theme.borderRadius || {}).forEach(([key, value]) => {
    root.style.setProperty(`--border-radius-${key}`, value);
  });

  Object.entries(theme.shadows || {}).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  Object.entries(theme.fontSize || {}).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });

  Object.entries(theme.fontWeight || {}).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value);
  });

  Object.entries(theme.zIndex || {}).forEach(([key, value]) => {
    root.style.setProperty(`--z-index-${key}`, value);
  });

  Object.entries(theme.transitions || {}).forEach(([key, value]) => {
    root.style.setProperty(`--transition-${key}`, value);
  });

  root.style.setProperty('--backdrop-filter', theme.backdrop || 'none');
  if (theme.backdrop) {
    root.style.setProperty('--header-bg', 'rgba(255, 255, 255, 0.12)');
  } else {
    root.style.setProperty('--header-bg', 'color-mix(in srgb, var(--color-background) 88%, transparent)');
  }

  const background = theme.colors?.background || '';
  if (typeof background === 'string' && background.includes('gradient')) {
    root.style.setProperty('--page-atmosphere', background);
    document.body.style.backgroundColor = 'transparent';
  } else {
    root.style.setProperty('--page-atmosphere', 'radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)');
    document.body.style.backgroundColor = '';
  }

  if (theme.colors?.primary) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.colors.primary);
  }
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

// Render app immediately (non-blocking)
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CartProvider>
      <FaviconLoader />
      <App />
    </CartProvider>
  </React.StrictMode>
);

// Load theme and store info in background (non-blocking)
// This doesn't block initial render - theme will apply when ready
initializeTheme().catch((error) => {
  console.error('Error loading theme (non-critical):', error);
  // App continues to work with default theme from theme.css
});
