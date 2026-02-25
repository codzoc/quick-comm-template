import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import './ProductConfigurationModal.css';

function ProductConfigurationModal({ product, isOpen, onClose, onAddToCart, currencySymbol = '₹' }) {
  const [selectedValues, setSelectedValues] = useState({});
  const isVisibleColor = (value) => {
    if (!value) return false;
    const normalized = String(value).trim().toLowerCase();
    return normalized !== 'transparent' && normalized !== 'rgba(0,0,0,0)' && normalized !== '#00000000';
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const attributes = useMemo(() => {
    if (Array.isArray(product.configurationAttributes) && product.configurationAttributes.length > 0) {
      return product.configurationAttributes;
    }
    const fallbackKeys = Object.keys(product.configurations?.[0]?.values || {});
    return fallbackKeys.map((key) => ({ id: key, name: key, type: key === 'color' ? 'color' : 'text' }));
  }, [product.configurationAttributes, product.configurations]);

  const visibleAttributes = useMemo(() => {
    return attributes.filter((attribute) => {
      if (attribute.type !== 'color') return true;
      const hasColorOptions = (product.configurations || []).some((configuration) =>
        isVisibleColor(configuration.values?.[attribute.id])
      );
      return hasColorOptions;
    });
  }, [attributes, product.configurations]);

  useEffect(() => {
    if (!isOpen) return;
    if (!product.configurations || product.configurations.length === 0) {
      setSelectedValues({});
      return;
    }

    // Better UX: auto-select when there is only one configuration.
    if (product.configurations.length === 1) {
      const onlyConfiguration = product.configurations[0];
      const prefilled = visibleAttributes.reduce((acc, attribute) => {
        const value = onlyConfiguration.values?.[attribute.id];
        if (value) acc[attribute.id] = value;
        return acc;
      }, {});
      setSelectedValues(prefilled);
      return;
    }

    setSelectedValues({});
  }, [isOpen, product.id, product.configurations, visibleAttributes]);

  const productImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.imagePath ? [product.imagePath] : ['/images/placeholder.png']);

  const selectedConfiguration = useMemo(() => {
    if (!product.configurations || product.configurations.length === 0) return null;
    if (product.configurations.length === 1) return product.configurations[0];
    const allSelected = visibleAttributes.every((attribute) => selectedValues[attribute.id]);
    if (!allSelected) return null;
    return product.configurations.find((configuration) =>
      visibleAttributes.every((attribute) => configuration.values?.[attribute.id] === selectedValues[attribute.id])
    ) || null;
  }, [visibleAttributes, product.configurations, selectedValues]);

  const getAvailableValues = (attributeId) => {
    const filtered = (product.configurations || []).filter((configuration) => {
      return visibleAttributes.every((attribute) => {
        if (attribute.id === attributeId) return true;
        const selected = selectedValues[attribute.id];
        if (!selected) return true;
        return configuration.values?.[attribute.id] === selected;
      });
    });

    const values = [...new Set(filtered.map((configuration) => configuration.values?.[attributeId]).filter(Boolean))];
    const attribute = visibleAttributes.find((item) => item.id === attributeId);
    if (attribute?.type === 'color') {
      return values.filter(isVisibleColor);
    }
    return values;
  };

  const handleSelect = (attributeId, value) => {
    setSelectedValues((prev) => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const handleAdd = () => {
    if (!selectedConfiguration) return;
    onAddToCart(selectedConfiguration, visibleAttributes, selectedValues);
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
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
          {visibleAttributes.map((attribute) => {
            const options = getAvailableValues(attribute.id);
            return (
              <div key={attribute.id} className="product-config-attribute">
                <div className="product-config-attribute-label">{attribute.name}</div>
                <div className="product-config-options">
                  {options.map((option) => (
                    attribute.type === 'color' ? (
                      <button
                        key={`${attribute.id}_${option}`}
                        type="button"
                        className={`product-config-color-choice ${selectedValues[attribute.id] === option ? 'selected' : ''}`}
                        onClick={() => handleSelect(attribute.id, option)}
                        aria-label={`${attribute.name} ${option}`}
                        title={option}
                        style={{ backgroundColor: option }}
                      />
                    ) : (
                      <label key={`${attribute.id}_${option}`} className="product-config-option">
                        <input
                          type="radio"
                          name={attribute.id}
                          checked={selectedValues[attribute.id] === option}
                          onChange={() => handleSelect(attribute.id, option)}
                        />
                        {option}
                      </label>
                    )
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
    </div>,
    document.body
  );
}

export default ProductConfigurationModal;
