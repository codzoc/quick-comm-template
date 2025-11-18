import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthChange } from '../../services/auth';
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import { getStoreInfo } from '../../services/storeInfo';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusChangeModal, setStatusChangeModal] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) navigate('/admin');
      else loadOrders();
    });
    return () => unsubscribe();
  }, [navigate, filter]);

  const loadOrders = async () => {
    try {
      const [ordersData, storeData] = await Promise.all([
        getAllOrders(filter),
        getStoreInfo()
      ]);
      setOrders(ordersData);
      setStoreInfo(storeData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeRequest = (order, newStatus) => {
    setStatusChangeModal({ order, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!statusChangeModal) return;

    try {
      await updateOrderStatus(statusChangeModal.order.id, statusChangeModal.newStatus);
      loadOrders();
      // Keep modal open to show WhatsApp option
    } catch (err) {
      alert(err.message);
      setStatusChangeModal(null);
    }
  };

  const sendWhatsAppNotification = () => {
    if (!statusChangeModal || !storeInfo?.whatsapp) return;

    const { order, newStatus } = statusChangeModal;
    const phone = order.customer.phone.replace(/[^0-9]/g, '');

    // Build items list
    const itemsList = order.items.map(item =>
      `${item.quantity}x ${item.title} - ₹${item.subtotal}`
    ).join('\n');

    const statusMessages = {
      pending: 'Your order is pending confirmation',
      processing: 'Your order is being processed',
      completed: 'Your order has been completed and delivered',
      cancelled: 'Your order has been cancelled'
    };

    const message = `Hello ${order.customer.name},\n\nYour order status has been updated!\n\n*Order ID:* ${order.orderId}\n*Status:* ${statusMessages[newStatus]}\n\n*Order Items:*\n${itemsList}\n\n*Total:* ₹${order.total}\n\nThank you for shopping with us!`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setStatusChangeModal(null);
  };

  if (loading) return <div className="admin-layout"><LoadingSpinner size="large" /></div>;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Orders</h1>
        <nav className="admin-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/orders" className="active">Orders</Link>
          <Link to="/admin/settings">Settings</Link>
          <button onClick={() => signOut().then(() => navigate('/admin'))} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main className="admin-content">
        <div className="page-header">
          <h2>Manage Orders</h2>
          <div className="page-actions">
            <select value={filter || ''} onChange={(e) => setFilter(e.target.value || null)} style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--border-radius-sm)' }}>
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={loadOrders} />}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace' }}>{order.orderId}</td>
                  <td>
                    <div>{order.customer.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>{order.customer.phone}</div>
                  </td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </td>
                  <td>{order.createdAt?.toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn-secondary"
                        style={{
                          padding: 'var(--spacing-xs)',
                          fontSize: 'var(--font-size-xs)',
                          minWidth: 'auto',
                          height: 'auto'
                        }}
                      >
                        View
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          if (e.target.value !== order.status) {
                            handleStatusChangeRequest(order, e.target.value);
                            e.target.value = order.status; // Reset dropdown
                          }
                        }}
                        style={{ padding: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Change Confirmation Modal */}
        {statusChangeModal && (
          <div className="modal-overlay" onClick={() => setStatusChangeModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3>Update Order Status</h3>
                <button className="modal-close" onClick={() => setStatusChangeModal(null)}>&times;</button>
              </div>

              <div className="modal-body">
                <p style={{ marginBottom: 'var(--spacing-md)' }}>
                  Change order <strong>{statusChangeModal.order.orderId}</strong> status to{' '}
                  <span className={`status-badge status-${statusChangeModal.newStatus}`}>
                    {statusChangeModal.newStatus}
                  </span>?
                </p>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexDirection: 'column' }}>
                  <button
                    className="btn-primary"
                    onClick={confirmStatusChange}
                    style={{ width: '100%' }}
                  >
                    Confirm Status Change
                  </button>

                  {storeInfo?.whatsapp && (
                    <button
                      className="btn-secondary"
                      onClick={sendWhatsAppNotification}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)' }}
                    >
                      <span>📱</span>
                      <span>Send WhatsApp Notification to Customer</span>
                    </button>
                  )}

                  <button
                    className="btn-secondary"
                    onClick={() => setStatusChangeModal(null)}
                    style={{ width: '100%' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <div className="modal-header">
                <h3>Order Details</h3>
                <button className="modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
              </div>

              <div className="modal-body">
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-light)' }}>Order Information</h4>
                  <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <p><strong>Order ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedOrder.orderId}</span></p>
                    <p><strong>Date:</strong> {selectedOrder.createdAt?.toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${selectedOrder.status}`}>{selectedOrder.status}</span></p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-light)' }}>Customer Details</h4>
                  <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.customer.address}</p>
                    <p><strong>PIN:</strong> {selectedOrder.customer.pin}</p>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-light)' }}>Order Items</h4>
                  <table className="admin-table" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.title}</td>
                          <td>₹{item.price}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                        <td style={{ fontWeight: 'bold' }}>₹{selectedOrder.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;
