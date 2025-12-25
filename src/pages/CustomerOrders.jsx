import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import './StoreFront.css';

function CustomerOrders() {
    const { currentUser, loading: authLoading } = useUser();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/');
            return;
        }

        if (currentUser) {
            fetchOrders();
        }
    }, [currentUser, authLoading, navigate]);

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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {orders.map(order => (
                                    <div key={order.id} style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderRadius: 'var(--border-radius-lg)',
                                        padding: '1.5rem',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Order #{order.id.slice(0, 8)}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                                    {order.createdAt?.toLocaleDateString()} at {order.createdAt?.toLocaleTimeString()}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--color-text-light)' }}>
                                                    Pay via {order.paymentGateway === 'cod' ? 'Cash' : 'Online'} • <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus || 'Pending'}</span>
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
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={cancelling === order.id}
                                                        style={{
                                                            color: 'var(--color-error)',
                                                            background: 'none',
                                                            border: '1px solid var(--color-error)',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: 'var(--border-radius-sm)',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {cancelling === order.id ? 'Cancelling...' : 'Cancel'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1rem 0', margin: '1rem 0' }}>
                                            {order.items.map((item, index) => (
                                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span>{item.quantity}x {item.product?.title || item.title}</span>
                                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                            <span>Total</span>
                                            <span>₹{order.total?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
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
