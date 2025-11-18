import React, { useState, useEffect } from 'react';
import './SearchBar.css';

/**
 * Search Bar Component
 * Real-time search with debouncing
 *
 * Props:
 * - onSearch: Callback function with search query
 * - placeholder: Placeholder text (default: 'Search products...')
 * - debounceMs: Debounce delay in milliseconds (default: 300)
 */
function SearchBar({ onSearch, placeholder = 'Search products...', debounceMs = 300 }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <svg
        className="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button className="search-clear" onClick={handleClear} aria-label="Clear search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
