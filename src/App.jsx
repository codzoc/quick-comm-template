import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StoreFront from './pages/StoreFront';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminStoreSettings from './pages/admin/StoreSettings';
import AdminCustomers from './pages/admin/Customers';
import AdminAdmins from './pages/admin/Admins';
import StaticPage from './pages/StaticPage';
import CustomerAuth from './pages/CustomerAuth';
import CustomerAccount from './pages/CustomerAccount';
import SEO from './components/SEO';
import ErrorBoundary from './components/ErrorBoundary';
import { AdminProtectedRoute, CustomerProtectedRoute } from './components/ProtectedRoute';

/**
 * Main App Component
 * Handles routing for public storefront and admin panel
 * Uses role-based protected routes to distinguish admin and customer sessions
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SEO />
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StoreFront />} />

        {/* Customer Routes */}
        <Route path="/login" element={<CustomerAuth />} />
        <Route path="/signup" element={<CustomerAuth />} />
        <Route path="/account" element={
          <CustomerProtectedRoute>
            <CustomerAccount />
          </CustomerProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <AdminProtectedRoute>
            <AdminProducts />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminProtectedRoute>
            <AdminOrders />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <AdminProtectedRoute>
            <AdminCustomers />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/admins" element={
          <AdminProtectedRoute>
            <AdminAdmins />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <AdminStoreSettings />
          </AdminProtectedRoute>
        } />

        {/* Static Pages */}
        <Route path="/about" element={<StaticPage pageType="about" />} />
        <Route path="/terms" element={<StaticPage pageType="terms" />} />
        <Route path="/privacy" element={<StaticPage pageType="privacy" />} />

        {/* 404 - Redirect to home */}
        <Route path="*" element={<StoreFront />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
