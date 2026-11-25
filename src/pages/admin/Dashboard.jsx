import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  Check,
  Circle
} from 'lucide-react';
import { onAuthChange } from '../../services/auth';
import { getOrderStats } from '../../services/orders';
import { getAllProducts } from '../../services/products';
import { getStoreInfo } from '../../services/storeInfo';
import { getPaymentSettings } from '../../services/payment';
import { hasSavedTheme } from '../../services/theme';
import { getEmailSettings } from '../../services/email';
import { getOnboardingStatus, saveOnboardingStatus } from '../../services/onboarding';
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
  const [checklist, setChecklist] = useState(null);
  const [onboardingHidden, setOnboardingHidden] = useState(false);
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
      const [orderStats, products, storeData, paymentData, themeSaved, emailData, onboarding] = await Promise.all([
        getOrderStats(),
        getAllProducts(),
        getStoreInfo(),
        getPaymentSettings(),
        hasSavedTheme(),
        getEmailSettings().catch(() => ({})),
        getOnboardingStatus()
      ]);
      setStats(orderStats);
      setStoreInfo(storeData);
      const lowStock = products.filter((p) => p.stock < 5);
      setLowStockProducts(lowStock);

      const hasBranding = Boolean(storeData?._documentExists && storeData.storeName);
      const hasTheme = Boolean(themeSaved);
      const hasProduct = products.length > 0;
      const hasPricing = Boolean(storeData?._documentExists && storeData.currencySymbol);
      const hasCod = paymentData?.cod?.enabled !== false;
      const hasOnlineOrEmail = Boolean(
        paymentData?.stripe?.enabled ||
        paymentData?.razorpay?.enabled ||
        emailData?.smtp?.user
      );

      const steps = [
        {
          id: 'branding',
          label: 'Store name + logo',
          done: hasBranding,
          action: 'Add your store name and logo (upload or URL)',
          href: '/admin/settings?tab=0'
        },
        {
          id: 'theme',
          label: 'Pick a theme',
          done: hasTheme,
          action: 'Choose a storefront theme',
          href: '/admin/settings?tab=1'
        },
        {
          id: 'product',
          label: 'Add first product',
          done: hasProduct,
          action: 'Add a product with an image upload or URL',
          href: '/admin/products'
        },
        {
          id: 'pricing',
          label: 'Pricing / currency',
          done: hasPricing,
          action: 'Set currency, tax, and shipping',
          href: '/admin/settings?tab=4'
        },
        {
          id: 'cod',
          label: 'COD confirmed',
          done: hasCod,
          action: 'Confirm Cash on Delivery is enabled',
          href: '/admin/settings?tab=5'
        },
        {
          id: 'upgrade',
          label: 'Optional: payments & emails',
          done: hasOnlineOrEmail,
          optional: true,
          action: 'Enable Stripe/Razorpay/email after deploying Functions',
          href: '/admin/settings?tab=5'
        }
      ];

      const requiredDone = steps.filter((step) => !step.optional).every((step) => step.done);
      setChecklist(steps);
      setOnboardingHidden(onboarding.dismissed || onboarding.completed || requiredDone);

      if (requiredDone && !onboarding.completed) {
        saveOnboardingStatus({ completed: true, dismissed: onboarding.dismissed }).catch(() => {});
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissChecklist = async () => {
    setOnboardingHidden(true);
    try {
      await saveOnboardingStatus({ completed: false, dismissed: true });
    } catch (error) {
      console.error('Error dismissing onboarding:', error);
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
  const requiredSteps = (checklist || []).filter((step) => !step.optional);
  const doneCount = requiredSteps.filter((step) => step.done).length;
  const progress = requiredSteps.length ? Math.round((doneCount / requiredSteps.length) * 100) : 0;

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: '#0f766e'
    },
    {
      title: 'Pending',
      value: stats.pendingOrders,
      icon: Package,
      color: '#d97706'
    },
    {
      title: 'Paid',
      value: stats.paidOrders,
      icon: CheckCircle,
      color: '#0284c7'
    },
    {
      title: 'Processing',
      value: stats.processingOrders,
      icon: Clock,
      color: '#0e7490'
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: '#059669'
    },
    {
      title: 'Refunded',
      value: stats.refundedOrders,
      icon: AlertTriangle,
      color: '#dc2626'
    },
    {
      title: 'Total Revenue',
      value: `${currencySymbol}${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: '#059669'
    },
    {
      title: 'Online Revenue',
      value: `${currencySymbol}${(stats.onlineRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: '#0e7490'
    },
    {
      title: 'COD Revenue',
      value: `${currencySymbol}${(stats.codRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: '#d97706'
    }
  ];

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>

      {!onboardingHidden && checklist && (
        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Setup checklist
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Finish these steps to open your store. You can still use image URLs instead of uploads.
                </Typography>
              </Box>
              <Button size="small" onClick={dismissChecklist}>
                Dismiss
              </Button>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, height: 8, borderRadius: 999 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {checklist.map((step) => (
                <Box
                  key={step.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    py: 0.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    {step.done ? (
                      <Check size={18} color="#059669" />
                    ) : (
                      <Circle size={18} color="#94a3b8" />
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: step.done ? 'line-through' : 'none' }}>
                        {step.label}{step.optional ? ' (optional)' : ''}
                      </Typography>
                      {!step.done && (
                        <Typography variant="caption" color="text.secondary">
                          {step.action}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {!step.done && (
                    <Button size="small" variant="outlined" onClick={() => navigate(step.href)}>
                      Open
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

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

      {lowStockProducts.length > 0 && (
        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AlertTriangle size={20} style={{ color: '#dc2626' }} />
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
