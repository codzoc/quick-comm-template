import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, onAuthChange } from '../../services/auth';
import { getStoreInfo } from '../../services/storeInfo';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState('Quick Commerce');
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

    // Redirect if already logged in
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        navigate('/admin/dashboard');
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

        <p className="login-help">
          Set up your admin account in Firebase Console (Authentication section)
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
