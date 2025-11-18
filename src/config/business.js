/**
 * Business Configuration
 *
 * CUSTOMIZATION GUIDE:
 * - storeName: Your store's name
 * - logoPath: Path to your logo in /public/images/ folder
 * - attribution: Required links to @build.with.justin (DO NOT REMOVE)
 *
 * Store contact info (phone, WhatsApp, social media) is managed
 * via the Admin Panel > Store Settings (stored in Firestore)
 */

export const business = {
  // Your store name
  storeName: 'Quick Commerce Demo',

  // Logo path (relative to /public folder)
  // Upload your logo to /public/images/logo.png
  logoPath: '/images/logo.png',

  // Attribution (REQUIRED - DO NOT REMOVE)
  // This template is free to use with attribution
  attribution: {
    youtube: 'https://youtube.com/@build.with.justin',
    instagram: 'https://instagram.com/build.with.justin',
    text: '@build.with.justin'
  }
};

export default business;
