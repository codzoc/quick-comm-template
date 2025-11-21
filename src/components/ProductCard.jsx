import React from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import './ProductCard.css';

/**
 * Product Card Component
 * Displays individual product with image, details, and add to cart button
 *
 * Props:
 * - product: {id, title, description, price, discountedPrice, imagePath, stock}
 * - onAddToCart: Callback function when "Add to Cart" is clicked
 * - currencySymbol: Currency symbol to display (default: ₹)
 */
function ProductCard({ product, onAddToCart, currencySymbol = '₹' }) {
  const { title, description, price, discountedPrice, imagePath, stock } = product;
  const isOutOfStock = stock === 0;
  const hasDiscount = discountedPrice && discountedPrice < price;

  const handleAddToCart = () => {
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={imagePath}
          alt={title}
          className="product-image"
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
        {isOutOfStock && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
        {hasDiscount && !isOutOfStock && (
          <div className="discount-badge">
            {Math.round(((price - discountedPrice) / price) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="product-details">
        <h3 className="product-title">{title}</h3>
        <p className="product-description">{description}</p>

        {/* Price */}
        <div className="product-price-container">
          {hasDiscount ? (
            <>
              <span className="product-price-discounted">{currencySymbol}{discountedPrice}</span>
              <span className="product-price-original">{currencySymbol}{price}</span>
            </>
          ) : (
            <span className="product-price">{currencySymbol}{price}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingBag size={18} />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>

        {/* Low Stock Warning */}
        {!isOutOfStock && stock < 5 && (
          <p className="low-stock-warning">
            <AlertCircle size={14} />
            <span>Only {stock} left in stock!</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
