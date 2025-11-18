import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading Spinner Component
 * Shows a spinning loader for async operations
 *
 * Props:
 * - size: 'small', 'medium', 'large' (default: 'medium')
 * - message: Optional loading message to display
 */
function LoadingSpinner({ size = 'medium', message }) {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner loading-spinner-${size}`}>
        <div className="spinner"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
