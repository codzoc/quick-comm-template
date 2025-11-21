import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getOrderStats } from '../../services/orders';
import { getAllProducts } from '../../services/products';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminStyles.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
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
      const [orderStats, products] = await Promise.all([
        getOrderStats(),
        getAllProducts()
      ]);
      setStats(orderStats);
      const lowStock = products.filter((p) => p.stock < 5);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: '#3b82f6'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Package,
      color: '#f59e0b'
    },
    {
      title: 'Processing Orders',
      value: stats.processingOrders,
      icon: Clock,
      color: '#3b82f6'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: '#10b981'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: '#10b981'
    }
  ];

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        {statCards.map((stat) => (
          <Card key={stat.title} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 1, bgcolor: `${stat.color}15` }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Low Stock Alert
              </Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
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
            </Box>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
