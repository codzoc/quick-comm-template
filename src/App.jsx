import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StoreFront from './pages/StoreFront';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminStoreSettings from './pages/admin/StoreSettings';
import StaticPage from './pages/StaticPage';

/**
 * Main App Component
 * Handles routing for public storefront and admin panel
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StoreFront />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/settings" element={<AdminStoreSettings />} />

        {/* Static Pages */}
        <Route path="/about" element={<StaticPage pageType="about" />} />
        <Route path="/terms" element={<StaticPage pageType="terms" />} />
        <Route path="/privacy" element={<StaticPage pageType="privacy" />} />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<StoreFront />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
