import { useEffect } from 'react';
import { getStoreInfo } from '../services/storeInfo';

/**
 * SEO Component
 * Dynamically updates meta tags based on Firebase settings
 * Updates title and meta tags as early as possible for proper link sharing
 */
function SEO() {
  useEffect(() => {
    const updateMetaTags = async () => {
      try {
        const storeInfo = await getStoreInfo();

        // Only use defaults if document doesn't exist in Firestore
        const useDefaults = !storeInfo._documentExists;

        // Get store name - use default only if document doesn't exist
        const storeName = storeInfo.storeName || (useDefaults ? 'Quick Commerce' : '');
        const seoTitle = storeInfo.seoTitle || (storeName ? `${storeName} - Online Shopping` : '');
        const seoDescription = storeInfo.seoDescription || 
          (useDefaults && storeName ? `Shop at ${storeName}. Best products at affordable prices.` : '');
        const seoKeywords = storeInfo.seoKeywords || 
          (useDefaults ? 'online shopping, ecommerce, buy products, best deals' : '');

        // Update title - only if we have a value (either from Firestore or confirmed defaults)
        if (seoTitle) {
          document.title = seoTitle;
        }

        // Update or create meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.head.appendChild(metaDescription);
        }
        if (seoDescription) {
          metaDescription.content = seoDescription;
        }

        // Update or create meta keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = 'keywords';
          document.head.appendChild(metaKeywords);
        }
        if (seoKeywords) {
          metaKeywords.content = seoKeywords;
        }

        // Open Graph tags for social media - only if we have values
        if (seoTitle || storeName) {
          updateOrCreateMetaTag('og:title', seoTitle || storeName);
        }
        if (seoDescription) {
          updateOrCreateMetaTag('og:description', seoDescription);
        }
        updateOrCreateMetaTag('og:type', 'website');
        if (storeName) {
          updateOrCreateMetaTag('og:site_name', storeName);
        }

        // Twitter Card tags
        updateOrCreateMetaTag('twitter:card', 'summary_large_image', 'name');
        if (seoTitle || storeName) {
          updateOrCreateMetaTag('twitter:title', seoTitle || storeName, 'name');
        }
        if (seoDescription) {
          updateOrCreateMetaTag('twitter:description', seoDescription, 'name');
        }

        // Additional SEO tags
        updateOrCreateMetaTag('robots', 'index, follow', 'name');
        if (storeName) {
          updateOrCreateMetaTag('author', storeName, 'name');
        }

      } catch (error) {
        console.error('Error loading SEO meta tags:', error);
      }
    };

    // Load immediately, don't wait
    updateMetaTags();
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Helper function to update or create meta tags
 */
function updateOrCreateMetaTag(property, content, attributeName = 'property') {
  let metaTag = document.querySelector(`meta[${attributeName}="${property}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attributeName, property);
    document.head.appendChild(metaTag);
  }
  metaTag.content = content;
}

export default SEO;
