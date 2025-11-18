/**
 * Theme Configuration
 *
 * CUSTOMIZATION GUIDE:
 * - fontFamily: Just change the Google Font name (e.g., 'Poppins', 'Roboto', 'Inter', 'Montserrat')
 * - colors: Modify hex codes to match your brand
 * - spacing: Adjust pixel values for padding/margins
 *
 * The font will be automatically loaded from Google Fonts CDN.
 */

export const theme = {
  // Google Font - Change this to any Google Font name
  // Popular options: 'Poppins', 'Roboto', 'Inter', 'Montserrat', 'Open Sans', 'Lato'
  fontFamily: 'Poppins',

  // Brand Colors
  colors: {
    primary: '#3B82F6',      // Main brand color (buttons, links)
    primaryHover: '#2563EB', // Hover state for primary
    secondary: '#10B981',    // Success/positive actions
    background: '#FFFFFF',   // Page background
    surface: '#F9FAFB',      // Card/surface background
    text: '#1F2937',         // Main text color
    textLight: '#6B7280',    // Secondary text color
    border: '#E5E7EB',       // Border color
    error: '#EF4444',        // Error messages
    success: '#10B981',      // Success messages
    warning: '#F59E0B',      // Warning messages
    info: '#3B82F6',         // Info messages
    disabled: '#D1D5DB',     // Disabled state
    outOfStock: '#DC2626'    // Out of stock badge
  },

  // Spacing (used for padding, margins, gaps)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },

  // Typography
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

  // Z-index layers
  zIndex: {
    base: 1,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    toast: 400
  }
};

export default theme;
