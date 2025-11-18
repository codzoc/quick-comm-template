import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { theme } from './config/theme';
import { initializeFont } from './utils/googleFonts';
import './index.css';
import './theme.css';

/**
 * Initialize Google Font from theme configuration
 */
initializeFont(theme);

/**
 * Apply theme CSS variables to :root
 */
function applyThemeVariables() {
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

// Apply theme on load
applyThemeVariables();

// Render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
