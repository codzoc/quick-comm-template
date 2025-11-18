import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthChange } from '../../services/auth';
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import './AdminStyles.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      const data = await getAllOrders(filter);
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
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
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-xs)' }}
                      >
                        View
                      </button>
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} style={{ padding: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)' }}>
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

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
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
