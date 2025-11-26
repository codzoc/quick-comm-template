import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentCustomer, getCustomerData, logoutCustomer, updateCustomerProfile } from '../services/customerAuth';
import { getCustomerAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/addresses';
import { getCustomerOrders } from '../services/orders';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './CustomerAccount.css';

const CustomerAccount = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('addresses');
    const [customer, setCustomer] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Address form state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        address: '',
        pin: '',
        isDefault: false
    });

    // Profile form state
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const user = getCurrentCustomer();
        if (!user) {
            navigate('/login', { state: { from: '/account' } });
            return;
        }

        try {
            const customerData = await getCustomerData(user.uid);

            if (!customerData) {
                // If auth exists but no firestore data, initialize empty form and force edit
                setCustomer({ email: user.email, uid: user.uid });
                setProfileForm({
                    name: user.displayName || '',
                    phone: ''
                });
                setEditingProfile(true);
                setError('Please complete your profile to continue.');
            } else {
                setCustomer(customerData);
                setProfileForm({
                    name: customerData.name || '',
                    phone: customerData.phone || ''
                });

                // Load addresses and orders only if profile exists
                await loadAddresses(user.uid);
                await loadOrders(user.uid);
            }
        } catch (err) {
            setError('Failed to load account data');
        } finally {
            setLoading(false);
        }
    };

    const loadAddresses = async (customerId) => {
        try {
            const addressList = await getCustomerAddresses(customerId);
            setAddresses(addressList);
        } catch (err) {
            console.error('Error loading addresses:', err);
        }
    };

    const loadOrders = async (customerId) => {
        try {
            const orderList = await getCustomerOrders(customerId);
            setOrders(orderList);
        } catch (err) {
            console.error('Error loading orders:', err);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutCustomer();
            navigate('/');
        } catch (err) {
            setError('Failed to logout');
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingAddress) {
                await updateAddress(customer.uid, editingAddress.id, addressForm);
                setSuccess('Address updated successfully');
            } else {
                await addAddress(customer.uid, addressForm);
                setSuccess('Address added successfully');
            }

            await loadAddresses(customer.uid);
            resetAddressForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            name: address.name,
            phone: address.phone,
            address: address.address,
            pin: address.pin,
            isDefault: address.isDefault
        });
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            await deleteAddress(addressId);
            setSuccess('Address deleted successfully');
            await loadAddresses(customer.uid);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await setDefaultAddress(customer.uid, addressId);
            setSuccess('Default address updated');
            await loadAddresses(customer.uid);
        } catch (err) {
            setError(err.message);
        }
    };

    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
            name: '',
            phone: '',
            address: '',
            pin: '',
            isDefault: false
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await updateCustomerProfile(customer.uid, profileForm);
            setSuccess('Profile updated successfully');
            setEditingProfile(false);
            await checkAuth();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toFixed(2)}`;
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="customer-account-page">
                    <LoadingSpinner size="large" message="Loading your account..." />
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="customer-account-page">
                <div className="account-container">
                    <div className="account-header">
                        <div>
                            <h1 className="account-title">My Account</h1>
                            <p className="account-subtitle">Welcome back, {customer?.name}!</p>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>

                    {error && <ErrorMessage message={error} onClose={() => setError('')} />}
                    {success && (
                        <div className="success-message">
                            {success}
                            <button onClick={() => setSuccess('')} className="close-btn">×</button>
                        </div>
                    )}

                    <div className="account-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('addresses')}
                        >
                            Addresses
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders ({orders.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </button>
                    </div>

                    <div className="tab-content">
                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div className="addresses-section">
                                <div className="section-header">
                                    <h2>Saved Addresses</h2>
                                    {!showAddressForm && (
                                        <button
                                            onClick={() => setShowAddressForm(true)}
                                            className="add-address-btn"
                                        >
                                            + Add New Address
                                        </button>
                                    )}
                                </div>

                                {showAddressForm && (
                                    <div className="address-form-card">
                                        <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                                        <form onSubmit={handleAddressSubmit} className="address-form">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={addressForm.name}
                                                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={addressForm.phone}
                                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Complete Address</label>
                                                <textarea
                                                    value={addressForm.address}
                                                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                                    required
                                                    rows="3"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>PIN Code</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.pin}
                                                    onChange={(e) => setAddressForm({ ...addressForm, pin: e.target.value })}
                                                    required
                                                    maxLength="6"
                                                />
                                            </div>
                                            <div className="form-group checkbox-group">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={addressForm.isDefault}
                                                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                    />
                                                    Set as default address
                                                </label>
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="save-btn">
                                                    {editingAddress ? 'Update Address' : 'Save Address'}
                                                </button>
                                                <button type="button" onClick={resetAddressForm} className="cancel-btn">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="addresses-grid">
                                    {addresses.length === 0 ? (
                                        <div className="empty-state">
                                            <p>No saved addresses yet</p>
                                            <small>Add an address to make checkout faster</small>
                                        </div>
                                    ) : (
                                        addresses.map((addr) => (
                                            <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                                                {addr.isDefault && <span className="default-badge">Default</span>}
                                                <div className="address-info">
                                                    <h4>{addr.name}</h4>
                                                    <p>{addr.phone}</p>
                                                    <p>{addr.address}</p>
                                                    <p>PIN: {addr.pin}</p>
                                                </div>
                                                <div className="address-actions">
                                                    {!addr.isDefault && (
                                                        <button onClick={() => handleSetDefault(addr.id)} className="action-btn">
                                                            Set as Default
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleEditAddress(addr)} className="action-btn">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteAddress(addr.id)} className="action-btn delete">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="orders-section">
                                <h2>Order History</h2>
                                {orders.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No orders yet</p>
                                        <small>Your order history will appear here</small>
                                        <button onClick={() => navigate('/')} className="shop-now-btn">
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {orders.map((order) => (
                                            <div key={order.id} className="order-card">
                                                <div className="order-header">
                                                    <div>
                                                        <h4>Order #{order.orderId}</h4>
                                                        <p className="order-date">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                    <span className={`order-status status-${order.status}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="order-items">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="order-item">
                                                            <span>{item.title} × {item.quantity}</span>
                                                            <span>{formatCurrency(item.subtotal)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="order-total">
                                                    <strong>Total:</strong>
                                                    <strong>{formatCurrency(order.total)}</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="profile-section">
                                <h2>Profile Information</h2>
                                {!editingProfile ? (
                                    <div className="profile-view">
                                        <div className="profile-field">
                                            <label>Name</label>
                                            <p>{customer?.name}</p>
                                        </div>
                                        <div className="profile-field">
                                            <label>Email</label>
                                            <p>{customer?.email}</p>
                                        </div>
                                        <div className="profile-field">
                                            <label>Phone</label>
                                            <p>{customer?.phone}</p>
                                        </div>
                                        <button onClick={() => setEditingProfile(true)} className="edit-profile-btn">
                                            Edit Profile
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleProfileSubmit} className="profile-form">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={customer?.email}
                                                disabled
                                            />
                                            <small>Email cannot be changed</small>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="save-btn">
                                                Save Changes
                                            </button>
                                            <button type="button" onClick={() => setEditingProfile(false)} className="cancel-btn">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CustomerAccount;
