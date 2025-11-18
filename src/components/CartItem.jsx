import React from 'react';
import './CartItem.css';

/**
 * Cart Item Component
 * Displays item in cart with quantity controls
 *
 * Props:
 * - item: {product, quantity}
 * - onUpdateQuantity: Callback function(productId, newQuantity)
 * - onRemove: Callback function(productId)
 */
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item;
  const { id, title, imagePath, price, discountedPrice } = product;
  const finalPrice = discountedPrice || price;
  const subtotal = finalPrice * quantity;

  const handleIncrease = () => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1 && onUpdateQuantity) {
      onUpdateQuantity(id, quantity - 1);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(id);
    }
  };

  return (
    <div className="cart-item">
      {/* Product Image */}
      <div className="cart-item-image-container">
        <img
          src={imagePath}
          alt={title}
          className="cart-item-image"
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
      </div>

      {/* Product Details */}
      <div className="cart-item-details">
        <h4 className="cart-item-title">{title}</h4>
        <p className="cart-item-price">₹{finalPrice} each</p>

        {/* Quantity Controls */}
        <div className="cart-item-quantity">
          <button
            className="quantity-btn"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="quantity-value">{quantity}</span>
          <button
            className="quantity-btn"
            onClick={handleIncrease}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Subtotal and Remove */}
      <div className="cart-item-actions">
        <p className="cart-item-subtotal">₹{subtotal}</p>
        <button
          className="cart-item-remove"
          onClick={handleRemove}
          aria-label="Remove item"
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CartItem;
