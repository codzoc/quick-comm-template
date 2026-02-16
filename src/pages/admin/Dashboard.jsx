import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getOrderStats } from '../../services/orders';
import { getAllProducts } from '../../services/products';
import { getStoreInfo } from '../../services/storeInfo';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AdminStyles.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    refundedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    onlineRevenue: 0,
    codRevenue: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
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
      const [orderStats, products, storeData] = await Promise.all([
        getOrderStats(),
        getAllProducts(),
        getStoreInfo()
      ]);
      setStats(orderStats);
      setStoreInfo(storeData);
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

  const currencySymbol = storeInfo?.currencySymbol || '₹';

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: '#3b82f6'
    },
    {
      title: 'Pending',
      value: stats.pendingOrders,
      icon: Package,
      color: '#f59e0b'
    },
    {
      title: 'Paid',
      value: stats.paidOrders,
      icon: CheckCircle,
      color: '#3b82f6'
    },
    {
      title: 'Processing',
      value: stats.processingOrders,
      icon: Clock,
      color: '#8b5cf6'
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: '#10b981'
    },
    {
      title: 'Refunded',
      value: stats.refundedOrders,
      icon: AlertTriangle,
      color: '#ef4444' // Red/Orange for refund? Or Gray? AlertTriangle suggests warning/error.
    },
    {
      title: 'Total Revenue',
      value: `${currencySymbol}${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: '#10b981'
    },
    {
      title: 'Online Revenue',
      value: `${currencySymbol}${(stats.onlineRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: '#8b5cf6'
    },
    {
      title: 'COD Revenue',
      value: `${currencySymbol}${(stats.codRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: '#f59e0b'
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
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'var(--color-surface)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{product.title}</TableCell>
                        <TableCell sx={{ color: 'var(--color-error)', fontWeight: 'bold' }}>{product.stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
