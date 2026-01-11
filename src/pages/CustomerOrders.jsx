import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import './StoreFront.css';

function CustomerOrders() {
    const { currentUser, userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!authLoading && (!currentUser || userRole !== 'customer')) {
            navigate('/');
            return;
        }

        if (currentUser && userRole === 'customer') {
            fetchOrders();
        }
    }, [currentUser, userRole, authLoading, navigate]);

    const fetchOrders = async () => {
        try {
            // Query orders where customer.email matches current user email
            // Note: In a real app, we should probably store uid in the order, 
            // but for now we'll match by email since the original order structure uses customer object
            const ordersRef = collection(db, 'orders');
            // We might need a composite index for this query: email + createdAt
            // For now, let's just query by email if possible, or we might need to filter client side if index is missing
            // Let's try to query by 'customer.email' if we update the order creation to include it explicitly at top level
            // or just rely on the nested field.

            // Since we can't easily change existing data structure without migration, 
            // let's assume we'll query by a new field 'userId' if we add it, or 'customer.email'

            // Ideally we should add userId to orders. For now, let's try to find orders by customer email inside the object
            // Firestore can query nested objects: "customer.email" == currentUser.email
            const q = query(
                ordersRef,
                where("customer.email", "==", currentUser.email),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const ordersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            setOrders(ordersList);
        } catch (error) {
            console.error("Error fetching orders:", error);
            // Fallback if index is missing or other error
            // Try fetching all and filtering (not efficient but works for small scale)
            // Or just show empty state with error
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        setCancelling(orderId);
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'cancelled',
                updatedAt: new Date()
            });

            // Update local state
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: 'cancelled' } : order
            ));
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Failed to cancel order. Please try again.");
        } finally {
            setCancelling(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b'; // orange
            case 'paid': return '#3b82f6'; // blue (same as processing)
            case 'processing': return '#3b82f6'; // blue
            case 'shipped': return '#8b5cf6'; // purple
            case 'delivered': return '#10b981'; // green
            case 'completed': return '#10b981'; // green
            case 'cancelled': return '#ef4444'; // red
            case 'refunded': return '#6b7280'; // gray
            default: return '#6b7280'; // gray
        }
    };

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="storefront">
            <Header />
            <main className="storefront-main">
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h1>My Orders</h1>
                            <button className="btn-secondary" onClick={() => navigate('/profile')}>
                                Back to Profile
                            </button>
                        </div>

                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-lg)' }}>
                                <p>You haven't placed any orders yet.</p>
                                <button
                                    className="btn-primary"
                                    style={{ marginTop: '1rem' }}
                                    onClick={() => navigate('/')}
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {orders.map(order => (
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
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>#{order.id.slice(0, 8)}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                                {order.createdAt?.toLocaleDateString()} • {order.items.length} Items
                                            </div>
                                            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 500 }}>
                                                ₹{order.total?.toFixed(2)}
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
                                                style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                View Details
                                            </button>

                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    disabled={cancelling === order.id}
                                                    style={{
                                                        color: 'var(--color-error)',
                                                        background: 'none',
                                                        border: '1px solid var(--color-error)',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: 'var(--border-radius-sm)',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {cancelling === order.id ? '...' : 'Cancel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

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
                                            backgroundColor: 'var(--color-surface)',
                                            borderRadius: 'var(--border-radius-lg)',
                                            width: '100%',
                                            maxWidth: '600px',
                                            maxHeight: '90vh',
                                            overflowY: 'auto',
                                            position: 'relative',
                                            boxShadow: 'var(--shadow-lg)'
                                        }} onClick={e => e.stopPropagation()}>
                                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0 }}>Order #{selectedOrder.id.slice(0, 8)}</h3>
                                                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
                                            </div>

                                            <div style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Status</h4>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                                                            color: getStatusColor(selectedOrder.status),
                                                            fontSize: '0.9rem',
                                                            fontWeight: 500,
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {selectedOrder.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Date</h4>
                                                        <div style={{ fontSize: '0.95rem' }}>
                                                            {selectedOrder.createdAt?.toLocaleDateString()} {selectedOrder.createdAt?.toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Delivery To</h4>
                                                        <div style={{ fontSize: '0.95rem' }}>
                                                            {selectedOrder.customer.name}<br />
                                                            {selectedOrder.customer.phone}<br />
                                                            <span style={{ color: 'var(--color-text-light)' }}>
                                                                {selectedOrder.customer.address}, {selectedOrder.customer.pin}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Payment</h4>
                                                        <div style={{ fontSize: '0.95rem' }}>
                                                            {selectedOrder.paymentGateway === 'cod' ? 'Cash on Delivery' : 'Online Payment'}<br />
                                                            Status: <span style={{ textTransform: 'capitalize', color: getStatusColor(selectedOrder.paymentStatus) }}>{selectedOrder.paymentStatus || 'Pending'}</span>
                                                            {(selectedOrder.transactionId || selectedOrder.paymentDetails?.transactionId) && (
                                                                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', marginTop: '0.25rem', overflowWrap: 'anywhere' }}>
                                                                    Tx: {selectedOrder.paymentDetails?.transactionId || selectedOrder.transactionId}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Order Items</h4>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                    {selectedOrder.items.map((item, idx) => (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                                <div style={{
                                                                    width: '50px', height: '50px',
                                                                    backgroundColor: 'var(--color-background)',
                                                                    borderRadius: '8px',
                                                                    backgroundImage: `url(${(item.images && item.images.length > 0) ? item.images[0] : (item.imagePath || item.product?.images?.[0] || item.product?.imagePath || '/images/placeholder.png')})`,
                                                                    backgroundSize: 'cover',
                                                                    backgroundPosition: 'center'
                                                                }}></div>
                                                                <div>
                                                                    <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.product?.title || item.title}</div>
                                                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Qty: {item.quantity}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <span>Subtotal</span>
                                                        <span>₹{selectedOrder.subtotal?.toFixed(2) || (selectedOrder.total).toFixed(2)}</span>
                                                    </div>
                                                    {selectedOrder.tax > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                            <span>Tax</span>
                                                            <span>₹{selectedOrder.tax.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {selectedOrder.shipping > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                            <span>Shipping</span>
                                                            <span>₹{selectedOrder.shipping.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                                        <span>Total</span>
                                                        <span>₹{selectedOrder.total?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', borderBottomLeftRadius: 'var(--border-radius-lg)', borderBottomRightRadius: 'var(--border-radius-lg)', textAlign: 'right' }}>
                                                <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CustomerOrders;
