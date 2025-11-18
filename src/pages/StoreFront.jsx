import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getAllProducts } from '../services/products';
import { createOrder } from '../services/orders';
import { getStoreInfo } from '../services/storeInfo';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './StoreFront.css';

/**
 * StoreFront Component
 * Single-file customer-facing page with:
 * - Product listing with search
 * - Shopping cart
 * - Checkout form
 * - Order confirmation with WhatsApp integration
 *
 * This file is designed to be easily editable by AI
 */
function StoreFront() {
  // State Management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);

  // Cart and Checkout State
  const {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    openCart,
    closeCart
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Customer Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    pin: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Load products and store info on mount
  useEffect(() => {
    loadData();

    // Listen for cart open event from header
    const handleOpenCart = () => openCart();
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, [openCart]);

  // Filter products based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, storeData] = await Promise.all([
        getAllProducts(),
        getStoreInfo()
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setStoreInfo(storeData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    openCart();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setShowCheckout(true);
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!customerInfo.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!customerInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!customerInfo.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!customerInfo.pin.trim()) {
      errors.pin = 'PIN code is required';
    } else if (!/^\d{6}$/.test(customerInfo.pin)) {
      errors.pin = 'Please enter a valid 6-digit PIN code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        items: cartItems,
        customer: customerInfo,
        total: getCartTotal()
      };

      const order = await createOrder(orderData);
      setOrderId(order.orderId);
      setOrderSuccess(true);
      clearCart();
      setCustomerInfo({ name: '', phone: '', address: '', pin: '' });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!storeInfo?.whatsapp) return;
    const phone = storeInfo.whatsapp.replace(/[^0-9]/g, '');
    const message = `Hi, my order ID is ${orderId}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleNewOrder = () => {
    setOrderSuccess(false);
    setOrderId('');
    setShowCheckout(false);
    closeCart();
  };

  // Render Loading State
  if (loading) {
    return (
      <div className="storefront">
        <Header cartItemCount={0} onSearch={handleSearch} />
        <main className="storefront-main">
          <LoadingSpinner size="large" message="Loading products..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="storefront">
      <Header
        cartItemCount={getCartItemCount()}
        onSearch={handleSearch}
        showSearch={true}
      />

      <main className="storefront-main">
        <div className="container">
          {/* Error Message */}
          {error && (
            <ErrorMessage message={error} onRetry={loadData} type="error" />
          )}

          {/* Products Grid */}
          {!error && (
            <section className="products-section">
              <h1 className="products-heading">Our Products</h1>

              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p>
                    {searchQuery
                      ? `No products found for "${searchQuery}"`
                      : 'No products available at the moment'}
                  </p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="cart-modal-overlay" onClick={closeCart}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            {!orderSuccess ? (
              <>
                {!showCheckout ? (
                  // Cart View
                  <div className="cart-content">
                    <div className="cart-header">
                      <h2>Shopping Cart</h2>
                      <button
                        className="cart-close-btn"
                        onClick={closeCart}
                        aria-label="Close cart"
                      >
                        ×
                      </button>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="cart-empty">
                        <p>Your cart is empty</p>
                        <button className="btn-primary" onClick={closeCart}>
                          Continue Shopping
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="cart-items-list">
                          {cartItems.map((item) => (
                            <CartItem
                              key={item.product.id}
                              item={item}
                              onUpdateQuantity={updateQuantity}
                              onRemove={removeFromCart}
                            />
                          ))}
                        </div>

                        <div className="cart-footer">
                          <div className="cart-total">
                            <span>Total:</span>
                            <span className="cart-total-amount">
                              ₹{getCartTotal()}
                            </span>
                          </div>
                          <button
                            className="btn-primary btn-checkout"
                            onClick={handleCheckout}
                          >
                            Proceed to Checkout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // Checkout Form
                  <div className="checkout-content">
                    <div className="cart-header">
                      <button
                        className="back-btn"
                        onClick={handleBackToCart}
                      >
                        ← Back to Cart
                      </button>
                      <h2>Checkout</h2>
                      <button
                        className="cart-close-btn"
                        onClick={closeCart}
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handlePlaceOrder} className="checkout-form">
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              name: e.target.value
                            })
                          }
                          className={formErrors.name ? 'error' : ''}
                        />
                        {formErrors.name && (
                          <span className="error-text">{formErrors.name}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              phone: e.target.value
                            })
                          }
                          placeholder="10-digit mobile number"
                          className={formErrors.phone ? 'error' : ''}
                        />
                        {formErrors.phone && (
                          <span className="error-text">{formErrors.phone}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="address">Delivery Address *</label>
                        <textarea
                          id="address"
                          rows="3"
                          value={customerInfo.address}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              address: e.target.value
                            })
                          }
                          className={formErrors.address ? 'error' : ''}
                        />
                        {formErrors.address && (
                          <span className="error-text">
                            {formErrors.address}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="pin">PIN Code *</label>
                        <input
                          type="text"
                          id="pin"
                          value={customerInfo.pin}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              pin: e.target.value
                            })
                          }
                          placeholder="6-digit PIN"
                          maxLength="6"
                          className={formErrors.pin ? 'error' : ''}
                        />
                        {formErrors.pin && (
                          <span className="error-text">{formErrors.pin}</span>
                        )}
                      </div>

                      <div className="checkout-summary">
                        <div className="summary-row">
                          <span>Items ({getCartItemCount()}):</span>
                          <span>₹{getCartTotal()}</span>
                        </div>
                        <div className="summary-row summary-total">
                          <span>Total:</span>
                          <span>₹{getCartTotal()}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary btn-place-order"
                        disabled={submitting}
                      >
                        {submitting ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              // Order Success
              <div className="order-success">
                <div className="success-icon">✓</div>
                <h2>Thank you for your order!</h2>
                <div className="order-id-display">
                  <span className="order-id-label">Order ID:</span>
                  <span className="order-id-value">{orderId}</span>
                </div>
                <p className="success-message">
                  WhatsApp us your Order ID to get tracking and support
                </p>
                {storeInfo?.whatsapp && (
                  <button
                    className="btn-primary btn-whatsapp"
                    onClick={handleWhatsApp}
                  >
                    💬 Message on WhatsApp
                  </button>
                )}
                <button className="btn-secondary" onClick={handleNewOrder}>
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreFront;
