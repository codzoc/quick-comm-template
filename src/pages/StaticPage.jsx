import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getStaticPageContent } from '../services/settings';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
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
      setContent(data || getDefaultContent(pageType));
      setError(false);
    } catch (err) {
      console.error('Error loading static page:', err);
      setContent(getDefaultContent(pageType));
      setError(false);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (type) => {
    const defaults = {
      about: `# About Us

Welcome to our store! We are committed to providing quality products and excellent customer service.

## Our Mission

To deliver the best shopping experience to our customers.

## Our Values

- Quality products
- Customer satisfaction
- Fast delivery
- Excellent support`,

      terms: `# Terms & Conditions

## 1. Introduction

By accessing and using this website, you accept and agree to be bound by the terms and conditions outlined below.

## 2. Use of Service

You agree to use our service only for lawful purposes and in a way that does not infringe on the rights of others.

## 3. Orders

- All orders are subject to availability
- Prices are subject to change without notice
- We reserve the right to refuse any order

## 4. Payment

Payment must be made at the time of delivery unless otherwise agreed.

## 5. Delivery

We strive to deliver products in a timely manner. Delivery times are estimates and not guaranteed.

## 6. Returns & Refunds

Please contact us regarding returns and refunds. Each case will be evaluated individually.

## 7. Limitation of Liability

We are not liable for any indirect, incidental, or consequential damages arising from the use of our service.

## 8. Changes to Terms

We reserve the right to modify these terms at any time.

For questions about these terms, please contact us.`,

      privacy: `# Privacy Policy

## Introduction

We respect your privacy and are committed to protecting your personal information.

## Information We Collect

We collect the following information when you place an order:
- Name
- Phone number
- Delivery address
- PIN code

## How We Use Your Information

Your information is used solely for:
- Processing and delivering your orders
- Communicating with you about your orders
- Improving our service

## Information Sharing

We do not sell, trade, or rent your personal information to third parties.

## Data Security

We implement appropriate security measures to protect your personal information.

## Your Rights

You have the right to:
- Access your personal information
- Request correction of your information
- Request deletion of your information

## Contact Information

For privacy-related questions, please contact us through the information provided on our website.

## Changes to Privacy Policy

We may update this privacy policy from time to time. Changes will be posted on this page.

*Last updated: ${new Date().toLocaleDateString()}*`
    };

    return defaults[type] || '';
  };

  const getTitles = () => {
    const titles = {
      about: 'About Us',
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy'
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
          <h1 className="static-page-title">{getTitles()}</h1>
          <div className="static-page-content">
            {content.split('\n').map((line, index) => {
              // Simple markdown-like rendering
              if (line.startsWith('# ')) {
                return <h2 key={index}>{line.substring(2)}</h2>;
              } else if (line.startsWith('## ')) {
                return <h3 key={index}>{line.substring(3)}</h3>;
              } else if (line.startsWith('- ')) {
                return <li key={index}>{line.substring(2)}</li>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else if (line.startsWith('*') && line.endsWith('*')) {
                return <p key={index} style={{ fontStyle: 'italic', color: 'var(--color-text-light)' }}>{line.substring(1, line.length - 1)}</p>;
              } else {
                return <p key={index}>{line}</p>;
              }
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default StaticPage;
