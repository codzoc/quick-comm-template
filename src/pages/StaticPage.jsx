import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getStaticPageContent } from '../services/settings';
import { getDefaultPageContent } from '../utils/defaultPageContent';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import 'react-quill/dist/quill.snow.css';
import './StaticPage.css';

/**
 * Static Page Component
 * Displays About, Terms, Privacy pages with content from Firestore
 */
function StaticPage({ pageType }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadContent();
  }, [pageType]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await getStaticPageContent(pageType);
      // Use default content if data is null, undefined, or empty string
      setContent(data && data.trim() ? data : getDefaultPageContent(pageType));
      setError(false);
    } catch (err) {
      console.error('Error loading static page:', err);
      setContent(getDefaultPageContent(pageType));
      setError(false);
    } finally {
      setLoading(false);
    }
  };


  const getTitles = () => {
    const titles = {
      about: 'About Us',
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      shipping: 'Shipping Policy',
      cancellation: 'Cancellation & Refund Policy',
      contact: 'Contact Us'
    };
    return titles[pageType] || '';
  };

  if (loading) {
    return (
      <>
        <Header showSearch={false} />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner size="large" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header showSearch={false} />
      <main className="static-page">
        <div className="static-page-container">
          {/* <h1 className="static-page-title">{getTitles()}</h1> */}
          <div className="static-page-content ql-editor" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default StaticPage;
