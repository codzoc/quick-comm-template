import React from 'react';
import { Link } from 'react-router-dom';
import { business } from '../config/business';
import SearchBar from './SearchBar';
import './Header.css';

/**
 * Header Component
 * Sticky header with logo, search, and cart
 *
 * Props:
 * - cartItemCount: Number of items in cart
 * - onSearch: Search callback function
 * - showSearch: Boolean to show/hide search bar (default: true)
 */
function Header({ cartItemCount = 0, onSearch, showSearch = true }) {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src={business.logoPath} alt={business.storeName} />
          <span className="header-store-name">{business.storeName}</span>
        </Link>

        {/* Search Bar (Desktop) */}
        {showSearch && (
          <div className="header-search-desktop">
            <SearchBar onSearch={onSearch} />
          </div>
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
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="cart-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
          <span className="cart-text">Cart</span>
        </button>
      </div>

      {/* Search Bar (Mobile) */}
      {showSearch && (
        <div className="header-search-mobile">
          <SearchBar onSearch={onSearch} />
        </div>
      )}
    </header>
  );
}

export default Header;
