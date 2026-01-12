import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import { business } from '../config/business';
import { getStoreInfo } from '../services/storeInfo';
import './Footer.css';

/**
 * Footer Component
 * Shows store contact info, static pages, and attribution
 */
function Footer() {
  const [storeInfo, setStoreInfo] = useState(null); // null = loading
  const [staticPages, setStaticPages] = useState({
    about: false,
    terms: false,
    privacy: false
  });

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      const info = await getStoreInfo();
      setStoreInfo(info);

      // Check which static pages exist
      // This will be implemented when we create the settings service
      // For now, we'll show the links regardless
      setStaticPages({
        about: true,
        terms: true,
        privacy: true
      });
    } catch (error) {
      console.error('Error loading footer data:', error);
      // On error, set to empty object so we don't show defaults
      setStoreInfo({});
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Store Info Section */}
        {storeInfo && (
          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="footer-links">
              {storeInfo.phone && (
                <a href={`tel:${storeInfo.phone}`} className="footer-link">
                  <Phone size={16} />
                  <span>{storeInfo.phone}</span>
                </a>
              )}
              {storeInfo.whatsapp && (
                <a
                  href={`https://wa.me/${storeInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Static Pages */}
        <div className="footer-section">
          <h3 className="footer-heading">Information</h3>
          <div className="footer-links">
            {staticPages.about && <Link to="/about" className="footer-link">About Us</Link>}
            {staticPages.terms && <Link to="/terms" className="footer-link">Terms & Conditions</Link>}
            {staticPages.privacy && <Link to="/privacy" className="footer-link">Privacy Policy</Link>}
          </div>
        </div>

        {/* Attribution (Required) */}
        <div className="footer-section">
          {/* Store Social Media */}
          {(storeInfo?.facebook || storeInfo?.instagram || storeInfo?.youtube) && (
            <div className="footer-social">
              {storeInfo?.facebook && (
                <a
                  href={storeInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
              )}
              {storeInfo?.instagram && (
                <a
                  href={storeInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}
              {storeInfo?.youtube && (
                <a
                  href={storeInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="YouTube"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {
          storeInfo === null 
            ? '' // Loading - don't show anything
            : storeInfo.storeName || (!storeInfo._documentExists ? 'Quick Commerce' : '') // Show default only if document doesn't exist
        }. All rights reserved. <a
              href={business.attribution.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="attribution-link"
            >
              {business.attribution.text}
            </a>
          </p>
      </div>
    </footer>
  );
}

export default Footer;
