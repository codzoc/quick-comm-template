import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthChange } from '../../services/auth';
import { getOrderStats } from '../../services/orders';
import { getAllProducts } from '../../services/products';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminStyles.css';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        navigate('/admin');
      } else {
        loadDashboardData();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const [orderStats, products] = await Promise.all([getOrderStats(), getAllProducts()]);
      setStats(orderStats);
      const lowStock = products.filter((p) => p.stock < 5);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="active">Dashboard</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/settings">Settings</Link>
          <button onClick={handleSignOut} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main className="admin-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <div className="stat-value">{stats.pendingOrders}</div>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <div className="stat-value">₹{stats.totalRevenue}</div>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="admin-table-container">
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <h3>Low Stock Alert</h3>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
