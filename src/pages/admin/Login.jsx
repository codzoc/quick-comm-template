import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, onAuthChange, resetPassword } from '../../services/auth';
import { getStoreInfo } from '../../services/storeInfo';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState('Quick Commerce');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch store name
    const fetchStoreName = async () => {
      try {
        const storeInfo = await getStoreInfo();
        if (storeInfo.storeName) {
          setStoreName(storeInfo.storeName);
        }
      } catch (error) {
        console.error('Error fetching store name:', error);
      }
    };

    fetchStoreName();

    // Redirect if already logged in as admin
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        const userType = localStorage.getItem('userType');
        if (userType === 'admin') {
          navigate('/admin/dashboard');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);
    setResetLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setResetEmail('');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>{storeName}</h1>
          <p>Admin Login</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              textDecoration: 'underline'
            }}
          >
            Forgot Password?
          </button>
        </div>

        <p className="login-help">
          Set up your admin account in Firebase Console (Authentication section)
        </p>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeResetModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--border-radius-lg)',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Reset Password</h2>

            {resetSuccess ? (
              <div>
                <p style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-md)' }}>
                  Password reset email sent! Check your inbox.
                </p>
                <button
                  onClick={closeResetModal}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                {resetError && <ErrorMessage message={resetError} />}

                <div className="form-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={resetLoading}
                    style={{ flex: 1 }}
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={closeResetModal}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLogin;
