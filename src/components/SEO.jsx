import { useEffect } from 'react';
import { getStoreInfo } from '../services/storeInfo';

/**
 * SEO Component
 * Dynamically updates meta tags based on Firebase settings
 */
function SEO() {
  useEffect(() => {
    const updateMetaTags = async () => {
      try {
        const storeInfo = await getStoreInfo();

        // Update title
        if (storeInfo.seoTitle) {
          document.title = storeInfo.seoTitle;
        } else if (storeInfo.storeName) {
          document.title = `${storeInfo.storeName} - Online Shopping`;
        }

        // Update or create meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.head.appendChild(metaDescription);
        }
        metaDescription.content = storeInfo.seoDescription ||
          `Shop at ${storeInfo.storeName || 'Quick Commerce'}. Best products at affordable prices.`;

        // Update or create meta keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = 'keywords';
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = storeInfo.seoKeywords ||
          'online shopping, ecommerce, buy products, best deals';

        // Open Graph tags for social media
        updateOrCreateMetaTag('og:title', storeInfo.seoTitle || storeInfo.storeName || 'Quick Commerce');
        updateOrCreateMetaTag('og:description', storeInfo.seoDescription || 'Shop the best products online');
        updateOrCreateMetaTag('og:type', 'website');
        updateOrCreateMetaTag('og:site_name', storeInfo.storeName || 'Quick Commerce');

        // Twitter Card tags
        updateOrCreateMetaTag('twitter:card', 'summary_large_image', 'name');
        updateOrCreateMetaTag('twitter:title', storeInfo.seoTitle || storeInfo.storeName || 'Quick Commerce', 'name');
        updateOrCreateMetaTag('twitter:description', storeInfo.seoDescription || 'Shop the best products online', 'name');

        // Additional SEO tags
        updateOrCreateMetaTag('robots', 'index, follow', 'name');
        updateOrCreateMetaTag('author', storeInfo.storeName || 'Quick Commerce', 'name');

      } catch (error) {
        console.error('Error loading SEO meta tags:', error);
      }
    };

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
