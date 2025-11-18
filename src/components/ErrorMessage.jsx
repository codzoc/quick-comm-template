import React from 'react';
import './ErrorMessage.css';

/**
 * Error Message Component
 * Displays user-friendly error messages
 *
 * Props:
 * - message: Error message to display
 * - onRetry: Optional retry callback function
 * - type: 'error', 'warning', 'info' (default: 'error')
 */
function ErrorMessage({ message, onRetry, type = 'error' }) {
  if (!message) return null;

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`error-message error-message-${type}`}>
      <div className="error-content">
        <span className="error-icon">{icons[type]}</span>
        <p className="error-text">{message}</p>
      </div>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
