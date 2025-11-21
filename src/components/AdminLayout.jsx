import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { signOut } from '../services/auth';
import { getStoreInfo } from '../services/storeInfo';
import './AdminLayout.css';

/**
 * Admin Layout Component
 * Provides sidebar navigation and layout structure for admin pages
 *
 * Props:
 * - children: Page content to display
 */
function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeName, setStoreName] = useState('Admin Panel');
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoreInfo = async () => {
      try {
        const info = await getStoreInfo();
        if (info?.storeName) {
          setStoreName(info.storeName);
        }
      } catch (error) {
        console.error('Error loading store info:', error);
      }
    };
    loadStoreInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      to: '/admin/products',
      icon: Package,
      label: 'Products'
    },
    {
      to: '/admin/orders',
      icon: ShoppingBag,
      label: 'Orders'
    },
    {
      to: '/admin/settings',
      icon: Settings,
      label: 'Settings'
    }
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="admin-mobile-title">{storeName}</h1>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{storeName}</h2>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
