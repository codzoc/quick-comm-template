import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { business } from '../config/business';
import { getStoreInfo } from '../services/storeInfo';
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
  const [storeName, setStoreName] = useState('Quick Commerce');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    // Fetch store name from Firebase
    const fetchStoreName = async () => {
      try {
        const storeInfo = await getStoreInfo();
        if (storeInfo.storeName) {
          setStoreName(storeInfo.storeName);
        }
      } catch (error) {
        console.error('Error fetching store name:', error);
        // Keep default name on error
      }
    };

    fetchStoreName();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    setMobileMenuOpen(false);
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

        {/* Logo */}
        <Link to="/" className="header-logo" onClick={() => setMobileMenuOpen(false)}>
          <img src={business.logoPath} alt={storeName} />
          <span className="header-store-name">{storeName}</span>
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
