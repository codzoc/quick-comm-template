import React, { useMemo, useState } from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import ProductImageSlider from './ProductImageSlider';
import ProductConfigurationModal from './ProductConfigurationModal';
import './ProductCard.css';

/**
 * Product Card Component
 * Displays individual product with image, details, and add to cart button
 *
 * Props:
 * - product: {id, title, description, price, discountedPrice, imagePath, images, stock}
 * - onAddToCart: Callback function when "Add to Cart" is clicked
 * - currencySymbol: Currency symbol to display (default: ₹)
 */
function ProductCard({ product, onAddToCart, currencySymbol = '₹' }) {
  const { title, description, price, discountedPrice, imagePath, images, stock } = product;
  const isOutOfStock = stock === 0;
  const hasDiscount = discountedPrice && discountedPrice < price;
  const [showSlider, setShowSlider] = useState(false);
  const [showConfigurationModal, setShowConfigurationModal] = useState(false);
  const [selectedSwatch, setSelectedSwatch] = useState('');
  const hasConfigurations = Boolean(product.hasConfigurations && product.configurations?.length > 0);

  const isVisibleColor = (value) => {
    if (!value) return false;
    const normalized = String(value).trim().toLowerCase();
    return normalized !== 'transparent' && normalized !== 'rgba(0,0,0,0)' && normalized !== '#00000000';
  };

  const colorAttribute = product.configurationAttributes?.find((attribute) => attribute.name?.toLowerCase() === 'color')
    || product.configurationAttributes?.find((attribute) => attribute.type === 'color');
  const colorSwatches = hasConfigurations && colorAttribute
    ? [...new Set(product.configurations.map((row) => row.values?.[colorAttribute.id]).filter(isVisibleColor))]
    : [];

  // Support both new format (images array) and legacy (imagePath)
  const productImages = images && images.length > 0 ? images : (imagePath ? [imagePath] : ['/images/placeholder.png']);
  const mainImage = productImages[0];

  const selectedSwatchImage = useMemo(() => {
    if (!selectedSwatch || !hasConfigurations || !colorAttribute) return '';
    const firstMatchingConfiguration = (product.configurations || []).find((row) => (
      row.values?.[colorAttribute.id] === selectedSwatch
    ));
    return firstMatchingConfiguration?.image || '';
  }, [selectedSwatch, hasConfigurations, colorAttribute, product.configurations]);

  const displayImage = selectedSwatchImage || mainImage;

  const handleAddToCart = () => {
    if (hasConfigurations) {
      setShowConfigurationModal(true);
      return;
    }
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleConfigurationAddToCart = (selectedConfiguration, attributes, selectedValues) => {
    if (!onAddToCart) return;
    onAddToCart(product, selectedConfiguration, attributes, selectedValues);
  };

  const handleImageClick = () => {
    // Always allow opening slider, even with just one image (including placeholder)
    setShowSlider(true);
  };

  const handleColorSwatchClick = (event, swatch) => {
    event.stopPropagation();
    setSelectedSwatch((prev) => (prev === swatch ? '' : swatch));
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image-container" onClick={handleImageClick} style={{ cursor: 'pointer' }}>
        <img
          src={displayImage}
          alt={title}
          className="product-image"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
          }}
        />
        {productImages.length > 1 && (
          <div className="multiple-images-indicator">
            {productImages.length} images
          </div>
        )}
        {isOutOfStock && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
        {hasDiscount && !isOutOfStock && (
          <div className="discount-badge">
            {Math.round(((price - discountedPrice) / price) * 100)}% OFF
          </div>
        )}
        {colorSwatches.length > 0 && (
          <div className="product-color-swatches">
            {colorSwatches.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={`product-color-swatch ${selectedSwatch === swatch ? 'selected' : ''}`}
                style={{ backgroundColor: swatch }}
                aria-label={`Preview ${title} in ${swatch}`}
                onClick={(event) => handleColorSwatchClick(event, swatch)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Slider Modal */}
      <ProductImageSlider
        images={productImages}
        isOpen={showSlider}
        onClose={() => setShowSlider(false)}
        initialIndex={0}
      />

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
          disabled={isOutOfStock && !hasConfigurations}
        >
          <ShoppingBag size={18} />
          <span>{isOutOfStock && !hasConfigurations ? 'Out of Stock' : hasConfigurations ? 'View Product' : 'Add to Cart'}</span>
        </button>

        {/* Low Stock Warning */}
        {!isOutOfStock && stock < 5 && (
          <p className="low-stock-warning">
            <AlertCircle size={14} />
            <span>Only {stock} left in stock!</span>
          </p>
        )}
      </div>
      <ProductConfigurationModal
        product={product}
        isOpen={showConfigurationModal}
        onClose={() => setShowConfigurationModal(false)}
        onAddToCart={handleConfigurationAddToCart}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}

export default ProductCard;
