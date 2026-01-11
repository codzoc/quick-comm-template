import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logoutCustomer, updateCustomerProfile } from '../services/customerAuth';
import { signOut } from '../services/auth';
import { getCustomerAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/addresses';
import { getCustomerOrders } from '../services/orders';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './CustomerAccount.css';

const CustomerAccount = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile, userRole } = useAuth();
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

    // Order management state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    // Profile form state
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        checkAuth();
    }, [currentUser, userProfile, userRole]);

    const checkAuth = async () => {
        if (!currentUser || userRole !== 'customer') {
            navigate('/login', { state: { from: '/account' } });
            return;
        }

        try {
            // Use userProfile from context (real-time listener keeps it updated)
            if (!userProfile) {
                // Profile is loading or doesn't exist yet
                setLoading(true);
                return;
            }

            setCustomer({
                uid: userProfile.uid,
                email: userProfile.email,
                name: userProfile.name || '',
                phone: userProfile.phone || ''
            });
            
            setProfileForm({
                name: userProfile.name || '',
                phone: userProfile.phone || ''
            });

            // Load addresses and orders
            await loadAddresses(currentUser.uid);
            await loadOrders(currentUser.uid);
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
            if (userRole === 'customer') {
                await logoutCustomer();
            } else {
                await signOut();
            }
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
            await updateCustomerProfile(currentUser.uid, profileForm);
            setSuccess('Profile updated successfully');
            setEditingProfile(false);
            // Real-time listener will automatically update userProfile
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b'; // orange
            case 'paid': return '#3b82f6'; // blue
            case 'processing': return '#3b82f6'; // blue
            case 'shipped': return '#8b5cf6'; // purple
            case 'delivered': return '#10b981'; // green
            case 'completed': return '#10b981'; // green
            case 'cancelled': return '#ef4444'; // red
            case 'refunded': return '#6b7280'; // gray
            default: return '#6b7280'; // gray
        }
    };

    const handleCancelOrder = async (orderId) => {
        // Since we don't have direct access to firestore in this component (it uses services),
        // we might need to export the cancel logic to a service or import firestore here.
        // Looking at file, it imports specific services.
        // Let's modify it to use a service we'll create or just import firestore if needed.
        // Actually, CustomerOrders.jsx used direct firestore calls.

        /* 
           NOTE: Ideally we'd add updateOrderStatus to services/orders.js. 
           For now I'll assume we can't easily add imports without breaking something or being too invasive.
           However, I CAN import { doc, updateDoc } from 'firebase/firestore' and { db } from '../config/firebase'.
           But I don't see those imports at the top.
           
           Wait, step 328 showed imports:
           import { getCurrentCustomer... } from '../services/customerAuth';
           import { getCustomerAddresses... } from '../services/addresses';
           import { getCustomerOrders } from '../services/orders';
           
           I shouldn't add new imports if I can avoid it to minimize risk.
           BUT, cancellation requires a write. 
           
           I will SKIP the cancellation button for now in this refactor to be safe and focus on "View Details".
           The user asked for "View Details".
        */
        // Cancel order functionality not implemented in Account view
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {orders.map((order) => (
                                            <div key={order.id} style={{
                                                backgroundColor: 'var(--color-surface)',
                                                borderRadius: 'var(--border-radius-lg)',
                                                padding: '1.5rem',
                                                boxShadow: 'var(--shadow-sm)',
                                                border: '1px solid var(--color-border)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '1rem'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>#{order.orderId || order.id?.slice(0, 8)}</div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                                        {formatDate(order.createdAt)} • {order.items.length} Items
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 500 }}>
                                                        {formatCurrency(order.total)}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '999px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                        backgroundColor: `${getStatusColor(order.status)}20`,
                                                        color: getStatusColor(order.status),
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {order.status}
                                                    </span>

                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => setSelectedOrder(order)}
                                                        style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Order Details Modal */}
                                {selectedOrder && (
                                    <div style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 1000,
                                        padding: '1rem'
                                    }} onClick={() => setSelectedOrder(null)}>
                                        <div style={{
                                            backgroundColor: 'white',
                                            borderRadius: '0.5rem',
                                            width: '100%',
                                            maxWidth: '600px',
                                            maxHeight: '90vh',
                                            overflowY: 'auto',
                                            position: 'relative',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                        }} onClick={e => e.stopPropagation()}>
                                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Order #{selectedOrder.orderId || selectedOrder.id?.slice(0, 8)}</h3>
                                                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, color: '#6b7280' }}>&times;</button>
                                            </div>

                                            <div style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Status</h4>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                                                            color: getStatusColor(selectedOrder.status),
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500,
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {selectedOrder.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Date</h4>
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            {formatDate(selectedOrder.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Delivery To</h4>
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            {selectedOrder.customer.name}<br />
                                                            {selectedOrder.customer.phone}<br />
                                                            <span style={{ color: '#6b7280' }}>
                                                                {selectedOrder.customer.address}, {selectedOrder.customer.pin}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Payment</h4>
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            {selectedOrder.paymentGateway === 'cod' ? 'Cash on Delivery' : 'Online Payment'}<br />
                                                            Status: <span style={{ textTransform: 'capitalize', color: getStatusColor(selectedOrder.paymentStatus) }}>{selectedOrder.paymentStatus || 'Pending'}</span>
                                                            {(selectedOrder.transactionId || selectedOrder.paymentDetails?.transactionId) && (
                                                                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '0.25rem', overflowWrap: 'anywhere', color: '#6b7280' }}>
                                                                    Tx: {selectedOrder.paymentDetails?.transactionId || selectedOrder.transactionId}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Order Items</h4>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                                    {selectedOrder.items.map((item, idx) => (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                                <div style={{
                                                                    width: '48px', height: '48px',
                                                                    backgroundColor: '#f3f4f6',
                                                                    borderRadius: '8px',
                                                                    backgroundImage: `url(${(item.images && item.images.length > 0) ? item.images[0] : (item.imagePath || item.product?.images?.[0] || item.product?.imagePath || '/images/placeholder.png')})`,
                                                                    backgroundSize: 'cover',
                                                                    backgroundPosition: 'center'
                                                                }}></div>
                                                                <div>
                                                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.product?.title || item.title}</div>
                                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Qty: {item.quantity}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{formatCurrency(item.price * item.quantity)}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <span>Subtotal</span>
                                                        <span>{selectedOrder.subtotal ? formatCurrency(selectedOrder.subtotal) : formatCurrency(selectedOrder.total)}</span>
                                                    </div>
                                                    {selectedOrder.tax > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                            <span>Tax</span>
                                                            <span>{formatCurrency(selectedOrder.tax)}</span>
                                                        </div>
                                                    )}
                                                    {selectedOrder.shipping > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                            <span>Shipping</span>
                                                            <span>{formatCurrency(selectedOrder.shipping)}</span>
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                                        <span>Total</span>
                                                        <span>{formatCurrency(selectedOrder.total)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => setSelectedOrder(null)}
                                                    style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.9rem' }}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
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
