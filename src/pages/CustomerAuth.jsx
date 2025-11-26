import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signUpCustomer, loginCustomer, resetCustomerPassword } from '../services/customerAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import './CustomerAuth.css';

const CustomerAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await loginCustomer(formData.email, formData.password);
            } else {
                // Validate signup fields
                if (!formData.name.trim()) {
                    setError('Please enter your name');
                    setLoading(false);
                    return;
                }
                if (!formData.phone.trim()) {
                    setError('Please enter your phone number');
                    setLoading(false);
                    return;
                }

                await signUpCustomer(
                    formData.email,
                    formData.password,
                    formData.name,
                    formData.phone
                );
            }

            // Redirect to account page or return to previous page
            const from = location.state?.from || '/account';
            navigate(from);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            email: '',
            password: '',
            name: '',
            phone: ''
        });
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetSuccess(false);
        setResetLoading(true);

        try {
            await resetCustomerPassword(resetEmail);
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
        <>
            <Header />
            <div className="customer-auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <h1 className="auth-title">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="auth-subtitle">
                            {isLogin
                                ? 'Login to access your account and orders'
                                : 'Sign up to save addresses and track orders'}
                        </p>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    placeholder="Enter your password"
                                />
                                {!isLogin && (
                                    <small className="form-hint">At least 6 characters</small>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <LoadingSpinner size="small" inline />
                                ) : (
                                    isLogin ? 'Login' : 'Sign Up'
                                )}
                            </button>
                        </form>

                        {isLogin && (
                            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>
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
                        )}

                        <div className="auth-toggle">
                            <p>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="auth-toggle-btn"
                                >
                                    {isLogin ? 'Sign Up' : 'Login'}
                                </button>
                            </p>
                        </div>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="auth-guest-btn"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
            <Footer />

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
                        <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text)' }}>Reset Password</h2>

                        {resetSuccess ? (
                            <div>
                                <p style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-md)' }}>
                                    Password reset email sent! Check your inbox.
                                </p>
                                <button
                                    onClick={closeResetModal}
                                    className="auth-submit-btn"
                                    style={{ width: '100%' }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                {resetError && (
                                    <div className="auth-error">
                                        {resetError}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="reset-email">Email Address</label>
                                    <input
                                        type="email"
                                        id="reset-email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    <button
                                        type="submit"
                                        className="auth-submit-btn"
                                        disabled={resetLoading}
                                        style={{ flex: 1 }}
                                    >
                                        {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeResetModal}
                                        className="auth-guest-btn"
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
        </>
    );
};

export default CustomerAuth;
