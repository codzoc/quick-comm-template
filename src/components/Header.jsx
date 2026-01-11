import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, User } from 'lucide-react';
import { business } from '../config/business';
import { getStoreInfo } from '../services/storeInfo';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import './Header.css';

/**
 * Header Component
 * Sticky header with logo, search, cart, and mobile menu
 *
 * Props:
 * - cartItemCount: Number of items in cart
 * - onSearch: Search callback function
 * - showSearch: Boolean to show/hide search bar (default: true)
 */
function Header({ cartItemCount = 0, onSearch, showSearch = true }) {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('Quick Commerce');
  const [logoUrl, setLogoUrl] = useState(business.logoPath);
  const [storeIcon, setStoreIcon] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  // Get user from unified auth context
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    // Fetch store info from Firebase
    const fetchStoreInfo = async () => {
      try {
        const storeInfo = await getStoreInfo();
        if (storeInfo.storeName) {
          setStoreName(storeInfo.storeName);
        }
        if (storeInfo.logoUrl) {
          setLogoUrl(storeInfo.logoUrl);
        }
        if (storeInfo.storeIcon) {
          setStoreIcon(storeInfo.storeIcon);
        }
      } catch (error) {
        console.error('Error fetching store info:', error);
        // Keep default values on error
      }
    };

    fetchStoreInfo();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    setMobileMenuOpen(false);
  };

  const handleUserClick = () => {
    if (currentUser && userRole === 'customer') {
      navigate('/account');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Hamburger Menu (Mobile) */}
        <button
          type="button"
          className="header-hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo - Show logo image if available, otherwise show icon + text */}
        <Link to="/" className="header-logo" onClick={() => setMobileMenuOpen(false)}>
          {logoUrl && logoUrl !== '/images/logo.png' ? (
            // Show logo image only
            <img src={logoUrl} alt={storeName} />
          ) : (
            // Show icon + text
            <>
              {storeIcon && (
                <img
                  src={storeIcon}
                  alt="Store icon"
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
              )}
              <span className="header-store-name">{storeName}</span>
            </>
          )}
        </Link>

        {/* Search Bar (Desktop) */}
        {showSearch && (
          <div className="header-search-desktop">
            <SearchBar onSearch={onSearch} />
          </div>
        )}

        {/* Right Actions */}
        <div className="header-actions">
          {/* Search Icon (Mobile) */}
          {showSearch && (
            <button
              type="button"
              className="header-search-icon"
              onClick={toggleMobileSearch}
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>
          )}

          {/* User/Account Button */}
          <button
            type="button"
            className="header-user-btn"
            onClick={handleUserClick}
            aria-label={currentUser && userRole === 'customer' ? "Go to account" : "Login"}
          >
            <User size={20} className="user-icon" />
            <span className="user-text">{currentUser && userRole === 'customer' ? 'Account' : 'Login'}</span>
          </button>

          {/* Cart Icon */}
          <button
            type="button"
            className="header-cart-btn"
            onClick={() => {
              // Trigger cart modal opening (handled by parent component)
              const event = new CustomEvent('openCart');
              window.dispatchEvent(event);
            }}
            aria-label="Open cart"
          >
            <ShoppingCart size={20} className="cart-icon" />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
            <span className="cart-text">Cart</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && mobileSearchOpen && (
        <div className="header-search-mobile">
          <SearchBar onSearch={onSearch} />
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav className="header-mobile-nav">
          <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>
            Home
          </Link>
          <Link to="/about" className="mobile-nav-link" onClick={toggleMobileMenu}>
            About
          </Link>
          <Link to="/terms" className="mobile-nav-link" onClick={toggleMobileMenu}>
            Terms
          </Link>
          <Link to="/privacy" className="mobile-nav-link" onClick={toggleMobileMenu}>
            Privacy
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;
