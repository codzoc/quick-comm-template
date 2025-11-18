import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthChange } from '../../services/auth';
import { getStoreInfo, updateStoreInfo, getAllStaticPages, updateStaticPage } from '../../services/storeInfo';
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
    youtube: ''
  });
  const [staticPages, setStaticPages] = useState({
    about: { content: '', imagePath: '' },
    terms: { content: '', imagePath: '' },
    privacy: { content: '', imagePath: '' }
  });
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
      const [info, pages] = await Promise.all([getStoreInfo(), getAllStaticPages()]);
      setStoreInfo(info);
      setStaticPages(pages);
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

  if (loading) return <div className="admin-layout"><LoadingSpinner size="large" /></div>;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Store Settings</h1>
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
            <button type="submit" className="btn-primary">Save Store Info</button>
          </form>
        </div>

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
