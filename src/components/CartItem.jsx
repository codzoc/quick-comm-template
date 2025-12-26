import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import './CartItem.css';

/**
 * Cart Item Component
 * Displays item in cart with quantity controls
 *
 * Props:
 * - item: {product, quantity}
 * - onUpdateQuantity: Callback function(productId, newQuantity)
 * - onRemove: Callback function(productId)
 * - currencySymbol: Currency symbol to display (default: ₹)
 */
function CartItem({ item, onUpdateQuantity, onRemove, currencySymbol = '₹' }) {
  const { product, quantity } = item;
  const { id, title, imagePath, images, price, discountedPrice } = product;
  // Support both new format (images array) and legacy (imagePath)
  const displayImage = (images && images.length > 0) ? images[0] : (imagePath || '/images/placeholder.png');
  const finalPrice = discountedPrice || price;
  const subtotal = finalPrice * quantity;

  const handleIncrease = () => {
    if (onUpdateQuantity) {
      const result = onUpdateQuantity(id, quantity + 1);
      if (result && !result.success) {
        alert(result.error);
      }
    }
  };

  const handleDecrease = () => {
    if (quantity > 1 && onUpdateQuantity) {
      const result = onUpdateQuantity(id, quantity - 1);
      if (result && !result.success) {
        alert(result.error);
      }
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
          src={displayImage}
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
        <p className="cart-item-price">{currencySymbol}{finalPrice} each</p>

        {/* Quantity Controls */}
        <div className="cart-item-quantity">
          <button
            className="quantity-btn"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="quantity-value">{quantity}</span>
          <button
            className="quantity-btn"
            onClick={handleIncrease}
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Subtotal and Remove */}
      <div className="cart-item-actions">
        <p className="cart-item-subtotal">{currencySymbol}{subtotal.toFixed(2)}</p>
        <button
          className="cart-item-remove"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default CartItem;
