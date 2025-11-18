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
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} style={{ padding: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)' }}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminOrders;
