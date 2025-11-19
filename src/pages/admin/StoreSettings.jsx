import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthChange } from '../../services/auth';
import { getStoreInfo, updateStoreInfo, getAllStaticPages, updateStaticPage } from '../../services/storeInfo';
import { getTheme, updateTheme } from '../../services/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminStoreSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    youtube: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [staticPages, setStaticPages] = useState({
    about: { content: '', imagePath: '' },
    terms: { content: '', imagePath: '' },
    privacy: { content: '', imagePath: '' }
  });
  const [theme, setTheme] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) navigate('/admin');
      else loadSettings();
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      const [info, pages, themeData] = await Promise.all([
        getStoreInfo(),
        getAllStaticPages(),
        getTheme()
      ]);
      setStoreInfo(info);
      setStaticPages(pages);
      setTheme(themeData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStoreInfo = async (e) => {
    e.preventDefault();
    try {
      await updateStoreInfo(storeInfo);
      setSuccess('Store information saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveStaticPage = async (pageType) => {
    try {
      await updateStaticPage(pageType, staticPages[pageType]);
      setSuccess(`${pageType.charAt(0).toUpperCase() + pageType.slice(1)} page saved successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    try {
      await updateTheme(theme);
      setSuccess('Theme saved successfully! Refresh the page to see changes.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleColorChange = (key, value) => {
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value
      }
    });
  };

  if (loading) return <div className="admin-layout"><LoadingSpinner size="large" /></div>;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>{storeInfo?.storeName || 'Quick Commerce'} - Settings</h1>
        <nav className="admin-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/settings" className="active">Settings</Link>
          <button onClick={() => signOut().then(() => navigate('/admin'))} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main className="admin-content">
        {error && <ErrorMessage message={error} onRetry={loadSettings} />}
        {success && <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-lg)' }}>{success}</div>}

        {/* Store Contact Info */}
        <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Store Contact Information</h3>
          <form onSubmit={handleSaveStoreInfo} className="admin-form">
            <div className="form-group">
              <label>Store Name</label>
              <input type="text" value={storeInfo.storeName} onChange={(e) => setStoreInfo({ ...storeInfo, storeName: e.target.value })} />
            </div>
            <div className="form-row two-col">
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={storeInfo.phone} onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })} placeholder="+91 1234567890" />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input type="tel" value={storeInfo.whatsapp} onChange={(e) => setStoreInfo({ ...storeInfo, whatsapp: e.target.value })} placeholder="+91 1234567890" />
              </div>
            </div>
            <div className="form-group">
              <label>Facebook URL</label>
              <input type="url" value={storeInfo.facebook} onChange={(e) => setStoreInfo({ ...storeInfo, facebook: e.target.value })} placeholder="https://facebook.com/yourpage" />
            </div>
            <div className="form-group">
              <label>Instagram URL</label>
              <input type="url" value={storeInfo.instagram} onChange={(e) => setStoreInfo({ ...storeInfo, instagram: e.target.value })} placeholder="https://instagram.com/yourprofile" />
            </div>
            <div className="form-group">
              <label>YouTube URL</label>
              <input type="url" value={storeInfo.youtube} onChange={(e) => setStoreInfo({ ...storeInfo, youtube: e.target.value })} placeholder="https://youtube.com/@yourchannel" />
            </div>

            <h4 style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)' }}>SEO Settings</h4>
            <div className="form-group">
              <label>SEO Title</label>
              <input
                type="text"
                value={storeInfo.seoTitle || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, seoTitle: e.target.value })}
                placeholder="Best Online Store - Your Store Name"
                maxLength="60"
              />
              <small style={{ color: 'var(--color-text-light)', marginTop: '4px', display: 'block' }}>
                Recommended: 50-60 characters. This appears in search engine results.
              </small>
            </div>
            <div className="form-group">
              <label>SEO Description</label>
              <textarea
                rows="3"
                value={storeInfo.seoDescription || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, seoDescription: e.target.value })}
                placeholder="Shop the best products at affordable prices. Fast delivery across India."
                maxLength="160"
              />
              <small style={{ color: 'var(--color-text-light)', marginTop: '4px', display: 'block' }}>
                Recommended: 150-160 characters. This appears as the description in search results.
              </small>
            </div>
            <div className="form-group">
              <label>SEO Keywords</label>
              <input
                type="text"
                value={storeInfo.seoKeywords || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, seoKeywords: e.target.value })}
                placeholder="online shopping, buy products, ecommerce, best deals"
              />
              <small style={{ color: 'var(--color-text-light)', marginTop: '4px', display: 'block' }}>
                Comma-separated keywords relevant to your store (e.g., "online shopping, electronics, fast delivery")
              </small>
            </div>

            <button type="submit" className="btn-primary">Save Store Info</button>
          </form>
        </div>

        {/* Theme Configuration */}
        {theme && (
          <div style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Theme Configuration</h3>
            <form onSubmit={handleSaveTheme} className="admin-form">
              <div className="form-group">
                <label>Font Family</label>
                <input
                  type="text"
                  value={theme.fontFamily || ''}
                  onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                  placeholder="e.g., Poppins, Roboto, Inter"
                />
                <small style={{ color: 'var(--color-text-light)', marginTop: '4px', display: 'block' }}>
                  Popular options: Poppins, Roboto, Inter, Montserrat, Open Sans, Lato
                </small>
              </div>

              <h4 style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>Brand Colors</h4>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>Primary Color</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.colors?.primary || '#3B82F6'}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      style={{ width: '50px', height: '38px' }}
                    />
                    <input
                      type="text"
                      value={theme.colors?.primary || ''}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Primary Hover</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.colors?.primaryHover || '#2563EB'}
                      onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                      style={{ width: '50px', height: '38px' }}
                    />
                    <input
                      type="text"
                      value={theme.colors?.primaryHover || ''}
                      onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                      placeholder="#2563EB"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Secondary Color</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.colors?.secondary || '#10B981'}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      style={{ width: '50px', height: '38px' }}
                    />
                    <input
                      type="text"
                      value={theme.colors?.secondary || ''}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      placeholder="#10B981"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Background</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.colors?.background || '#FFFFFF'}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      style={{ width: '50px', height: '38px' }}
                    />
                    <input
                      type="text"
                      value={theme.colors?.background || ''}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label>Text Color</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.colors?.text || '#1F2937'}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      style={{ width: '50px', height: '38px' }}
                    />
                    <input
                      type="text"
                      value={theme.colors?.text || ''}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      placeholder="#1F2937"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Text Light</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.colors?.textLight || '#6B7280'}
                      onChange={(e) => handleColorChange('textLight', e.target.value)}
                      style={{ width: '50px', height: '38px' }}
                    />
                    <input
                      type="text"
                      value={theme.colors?.textLight || ''}
                      onChange={(e) => handleColorChange('textLight', e.target.value)}
                      placeholder="#6B7280"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary">Save Theme</button>
            </form>
          </div>
        )}

        {/* Static Pages */}
        {['about', 'terms', 'privacy'].map((pageType) => (
          <div key={pageType} style={{ backgroundColor: 'white', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--spacing-xl)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)', textTransform: 'capitalize' }}>{pageType} Page</h3>
            <div className="admin-form">
              <div className="form-group">
                <label>Content</label>
                <textarea rows="6" value={staticPages[pageType].content} onChange={(e) => setStaticPages({ ...staticPages, [pageType]: { ...staticPages[pageType], content: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Image Path (Optional)</label>
                <input type="text" value={staticPages[pageType].imagePath} onChange={(e) => setStaticPages({ ...staticPages, [pageType]: { ...staticPages[pageType], imagePath: e.target.value } })} placeholder="/images/banner.jpg" />
              </div>
              <button type="button" onClick={() => handleSaveStaticPage(pageType)} className="btn-primary">Save {pageType.charAt(0).toUpperCase() + pageType.slice(1)}</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default AdminStoreSettings;
