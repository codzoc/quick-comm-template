import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './ProductImageSlider.css';

/**
 * Product Image Slider Component
 * Displays a modal slider for viewing multiple product images
 * 
 * Props:
 * - images: Array of image URLs
 * - isOpen: Boolean to control visibility
 * - onClose: Callback function to close the slider
 * - initialIndex: Starting image index (default: 0)
 */
function ProductImageSlider({ images, isOpen, onClose, initialIndex = 0 }) {
  // Ensure we always have at least one image to display
  const displayImages = images && images.length > 0 ? images : ['/images/placeholder.png'];
  
  const [currentIndex, setCurrentIndex] = useState(() => {
    const safeIndex = Math.min(initialIndex, displayImages.length - 1);
    return Math.max(0, safeIndex);
  });

  // Update current index when initialIndex changes or images change
  useEffect(() => {
    const safeIndex = Math.min(initialIndex, displayImages.length - 1);
    setCurrentIndex(Math.max(0, safeIndex));
  }, [initialIndex, displayImages.length]);

  // Lock body scroll when slider is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  const sliderContent = (
    <div 
      className="product-image-slider-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="product-image-slider-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="slider-close-btn" 
          onClick={onClose}
          aria-label="Close slider"
        >
          <X size={24} />
        </button>

        {/* Main Image */}
        <div className="slider-main-image-container">
          {displayImages.length > 1 && (
            <button 
              className="slider-nav-btn slider-nav-prev" 
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          
          <img 
            src={displayImages[currentIndex] || '/images/placeholder.png'} 
            alt={`Product image ${currentIndex + 1}`}
            className="slider-main-image"
            onError={(e) => {
              e.target.src = '/images/placeholder.png';
            }}
          />

          {displayImages.length > 1 && (
            <button 
              className="slider-nav-btn slider-nav-next" 
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="slider-counter">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {displayImages.length > 1 && (
          <div className="slider-thumbnails">
            {displayImages.map((image, index) => (
              <button
                key={index}
                className={`slider-thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/images/placeholder.png';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render to document body using portal to escape any parent container constraints
  return createPortal(sliderContent, document.body);
}

export default ProductImageSlider;

