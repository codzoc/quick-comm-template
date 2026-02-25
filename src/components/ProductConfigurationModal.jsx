import React, { useEffect, useMemo, useState } from 'react';
import './ProductConfigurationModal.css';

function ProductConfigurationModal({ product, isOpen, onClose, onAddToCart, currencySymbol = '₹' }) {
  const [selectedValues, setSelectedValues] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedValues({});
    }
  }, [isOpen, product.id]);

  const attributes = useMemo(() => {
    if (Array.isArray(product.configurationAttributes) && product.configurationAttributes.length > 0) {
      return product.configurationAttributes;
    }
    const fallbackKeys = Object.keys(product.configurations?.[0]?.values || {});
    return fallbackKeys.map((key) => ({ id: key, name: key, type: key === 'color' ? 'color' : 'text' }));
  }, [product.configurationAttributes, product.configurations]);

  const productImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.imagePath ? [product.imagePath] : ['/images/placeholder.png']);

  const selectedConfiguration = useMemo(() => {
    if (!product.configurations || product.configurations.length === 0) return null;
    const allSelected = attributes.every((attribute) => selectedValues[attribute.id]);
    if (!allSelected) return null;
    return product.configurations.find((configuration) =>
      attributes.every((attribute) => configuration.values?.[attribute.id] === selectedValues[attribute.id])
    ) || null;
  }, [attributes, product.configurations, selectedValues]);

  const getAvailableValues = (attributeId) => {
    const filtered = (product.configurations || []).filter((configuration) => {
      return attributes.every((attribute) => {
        if (attribute.id === attributeId) return true;
        const selected = selectedValues[attribute.id];
        if (!selected) return true;
        return configuration.values?.[attribute.id] === selected;
      });
    });

    return [...new Set(filtered.map((configuration) => configuration.values?.[attributeId]).filter(Boolean))];
  };

  const handleSelect = (attributeId, value) => {
    setSelectedValues((prev) => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const handleAdd = () => {
    if (!selectedConfiguration) return;
    onAddToCart(selectedConfiguration, attributes, selectedValues);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="product-config-modal-overlay" onClick={onClose}>
      <div className="product-config-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="product-config-close" onClick={onClose}>×</button>
        <div className="product-config-left">
          <img
            src={selectedConfiguration?.image || productImages[0]}
            alt={product.title}
            className="product-config-image"
            onError={(e) => { e.target.src = '/images/placeholder.png'; }}
          />
        </div>
        <div className="product-config-right">
          <h3>{product.title}</h3>
          <p>{product.description}</p>
          {attributes.map((attribute) => {
            const options = getAvailableValues(attribute.id);
            return (
              <div key={attribute.id} className="product-config-attribute">
                <div className="product-config-attribute-label">{attribute.name}</div>
                <div className="product-config-options">
                  {options.map((option) => (
                    <label key={`${attribute.id}_${option}`} className="product-config-option">
                      <input
                        type="radio"
                        name={attribute.id}
                        checked={selectedValues[attribute.id] === option}
                        onChange={() => handleSelect(attribute.id, option)}
                      />
                      {attribute.type === 'color' ? (
                        <span className="product-config-color-option">
                          <span className="product-config-color-dot" style={{ backgroundColor: option }} />
                          {option}
                        </span>
                      ) : option}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="product-config-footer">
            <strong>
              {currencySymbol}
              {(selectedConfiguration?.discountedPrice || selectedConfiguration?.price || product.discountedPrice || product.price)}
            </strong>
            <button type="button" className="add-to-cart-btn" onClick={handleAdd} disabled={!selectedConfiguration}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductConfigurationModal;
