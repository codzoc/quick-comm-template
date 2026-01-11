import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginCustomer, signUpCustomer } from '../services/customerAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { LogIn, UserPlus } from 'lucide-react';
import './StoreFront.css';

function CustomerProfile() {
    const { currentUser, userProfile, userRole, updateUserProfile, loading } = useAuth();
    const navigate = useNavigate();

    // Auth State
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authName, setAuthName] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // Profile State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        pin: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                phone: userProfile.phone || '',
                address: userProfile.address || '',
                pin: userProfile.pin || ''
            });
        }
    }, [userProfile]);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);

        try {
            if (isLoginMode) {
                await loginCustomer(authEmail, authPassword);
            } else {
                await signUpCustomer(authEmail, authPassword, authName, '');
            }
            // AuthContext will automatically update via real-time listener
        } catch (error) {
            console.error('Auth error:', error);
            setAuthError(error.message.replace('Firebase: ', ''));
        } finally {
            setAuthLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateUserProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    // If not logged in, show Auth Form
    if (!currentUser) {
        return (
            <div className="storefront">
                <Header />
                <main className="storefront-main">
                    <div className="container">
                        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                {isLoginMode ? 'Welcome Back' : 'Create Account'}
                            </h2>

                            {authError && (
                                <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 'var(--border-radius-md)' }}>
                                    {authError}
                                </div>
                            )}

                            <form onSubmit={handleAuthSubmit}>
                                {!isLoginMode && (
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={authName}
                                            onChange={(e) => setAuthName(e.target.value)}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={authEmail}
                                        onChange={(e) => setAuthEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={authPassword}
                                        onChange={(e) => setAuthPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Sign Up')}
                                </button>
                            </form>

                            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLoginMode(!isLoginMode)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                >
                                    {isLoginMode ? 'Sign Up' : 'Login'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // If logged in, show Profile Form
    return (
        <div className="storefront">
            <Header />
            <main className="storefront-main">
                <div className="container">
                    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}>
                        <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>

                        {message.text && (
                            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}
                                style={{
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    borderRadius: 'var(--border-radius-md)',
                                    backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                                    color: message.type === 'error' ? '#dc2626' : '#16a34a'
                                }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleProfileSubmit} className="checkout-form" style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={currentUser?.email || ''}
                                    disabled
                                    style={{ backgroundColor: 'var(--color-background)', cursor: 'not-allowed', opacity: 0.7 }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleProfileChange}
                                    placeholder="10-digit mobile number"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Delivery Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="pin">PIN Code</label>
                                <input
                                    type="text"
                                    id="pin"
                                    name="pin"
                                    value={formData.pin}
                                    onChange={handleProfileChange}
                                    placeholder="6-digit PIN"
                                    maxLength="6"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                    style={{ flex: 1 }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => navigate('/orders')}
                                    style={{ flex: 1 }}
                                >
                                    View My Orders
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CustomerProfile;
