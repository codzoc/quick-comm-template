import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signUpCustomer, loginCustomer } from '../services/customerAuth';
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
                                    <LoadingSpinner size="small" />
                                ) : (
                                    isLogin ? 'Login' : 'Sign Up'
                                )}
                            </button>
                        </form>

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
        </>
    );
};

export default CustomerAuth;
