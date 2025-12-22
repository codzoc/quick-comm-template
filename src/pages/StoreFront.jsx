import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getAllProducts } from '../services/products';
import { createOrder } from '../services/orders';
import { getStoreInfo } from '../services/storeInfo';
import { getPaymentSettings } from '../services/payment';
import { getCurrentCustomer, signUpCustomer } from '../services/customerAuth';
import { getDefaultAddress, addAddress } from '../services/addresses';
import { initiateRazorpayPayment } from '../services/paymentGateway';
import { ShoppingBag } from 'lucide-react';
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
  const navigate = useNavigate();

  // State Management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
  const [orderItems, setOrderItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');

  // Customer Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    pin: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Account creation state for guests
  const [createAccount, setCreateAccount] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [registrationErrors, setRegistrationErrors] = useState({});

  // Load products and store info on mount
  useEffect(() => {
    loadData();
    checkCustomerAuth();

    // Listen for cart open event from header
    const handleOpenCart = () => openCart();
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, [openCart]);

  // Check if customer is logged in and load default address
  const checkCustomerAuth = async () => {
    const user = getCurrentCustomer();
    setCurrentUser(user);

    if (user) {
      setCreateAccount(true); // Default to saving address for logged-in users
      try {
        const defaultAddr = await getDefaultAddress(user.uid);
        if (defaultAddr) {
          setCustomerInfo({
            name: defaultAddr.name,
            phone: defaultAddr.phone,
            email: user.email || '',
            address: defaultAddr.address,
            pin: defaultAddr.pin
          });
        }
      } catch (err) {
        console.error('Error loading default address:', err);
      }
    } else {
      setCreateAccount(false); // Default to unchecked for guests
    }
  };

  // Reset cart view when cart is opened
  useEffect(() => {
    if (isCartOpen) {
      setShowCheckout(false);
      setOrderSuccess(false);
      setSubmitting(false);
    }
  }, [isCartOpen]);

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
      const [productsData, storeData, paymentData] = await Promise.all([
        getAllProducts(),
        getStoreInfo(),
        getPaymentSettings()
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setStoreInfo(storeData);
      setPaymentSettings(paymentData);

      // Set default payment method if needed
      if (paymentData?.cod?.enabled && !paymentData?.stripe?.enabled) {
        setSelectedPaymentMethod('cod');
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const result = addToCart(product);
    if (!result.success) {
      alert(result.error);
    } else {
      openCart();
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Calculate cart subtotal, tax, shipping, and grand total
  const getCartSubtotal = () => {
    return getCartTotal();
  };

  const getCartTax = () => {
    if (!storeInfo?.taxPercentage) return 0;
    return (getCartSubtotal() * storeInfo.taxPercentage) / 100;
  };

  const getCartShipping = () => {
    if (!storeInfo?.shippingCost) return 0;
    return storeInfo.shippingCost;
  };

  const getCartGrandTotal = () => {
    return getCartSubtotal() + getCartTax() + getCartShipping();
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

    // Email is now required for all orders (for email notifications)
    if (!customerInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!customerInfo.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!customerInfo.pin.trim()) {
      errors.pin = 'PIN code is required';
    } else if (!/^\d{6}$/.test(customerInfo.pin)) {
      errors.pin = 'Please enter a valid 6-digit PIN code';
    }

    // Registration validation
    if (createAccount && !currentUser) {
      if (!registrationData.password) {
        errors.password = 'Password is required';
      } else if (registrationData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      if (registrationData.password !== registrationData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
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
      let finalCustomerId = currentUser?.uid || null;

      // Handle Account Creation for Guests
      if (createAccount && !currentUser) {
        try {
          const newCustomer = await signUpCustomer(
            customerInfo.email,
            registrationData.password,
            customerInfo.name,
            customerInfo.phone
          );
          finalCustomerId = newCustomer.uid;

          // Save the address for the new customer
          await addAddress(finalCustomerId, {
            name: customerInfo.name,
            phone: customerInfo.phone,
            address: customerInfo.address,
            pin: customerInfo.pin,
            isDefault: true
          });
        } catch (authErr) {
          throw new Error(`Account creation failed: ${authErr.message}`);
        }
      }
      // Handle Address Saving for Logged-in Users
      else if (currentUser && createAccount) {
        await addAddress(currentUser.uid, {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          pin: customerInfo.pin,
          isDefault: true
        });
      }

      const orderData = {
        items: cartItems,
        customer: customerInfo,
        customerId: finalCustomerId,
        subtotal: getCartSubtotal(),
        tax: getCartTax(),
        shipping: getCartShipping(),
        total: getCartGrandTotal(),
        paymentMethod: selectedPaymentMethod,
        paymentGateway: selectedPaymentMethod,
        paymentStatus: selectedPaymentMethod === 'cod' ? 'pending' : 'processing'
      };

      // Handle different payment methods
      if (selectedPaymentMethod === 'cod') {
        // COD - Create order directly
        const order = await createOrder(orderData);
        setOrderId(order.orderId);
        setOrderItems(cartItems.map(item => ({
          title: item.product.title,
          quantity: item.quantity,
          price: item.product.discountedPrice || item.product.price
        })));
        setOrderSuccess(true);
        clearCart();

        // Clear form
        setCustomerInfo({ name: '', phone: '', email: '', address: '', pin: '' });
        setCreateAccount(false);
        setRegistrationData({ password: '', confirmPassword: '' });
      } else if (selectedPaymentMethod === 'razorpay') {
        // Razorpay - Create order first, then initiate payment
        const order = await createOrder(orderData);

        try {
          await initiateRazorpayPayment({
            keyId: paymentSettings.razorpay.keyId,
            orderId: order.id,
            amount: getCartGrandTotal(),
            currency: 'INR',
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            onSuccess: (response) => {
              // Payment successful - show success message
              setOrderId(order.orderId);
              setOrderItems(cartItems.map(item => ({
                title: item.product.title,
                quantity: item.quantity,
                price: item.product.discountedPrice || item.product.price
              })));
              setOrderSuccess(true);
              clearCart();
              setCustomerInfo({ name: '', phone: '', email: '', address: '', pin: '' });
              setCreateAccount(false);
              setRegistrationData({ password: '', confirmPassword: '' });
              setSubmitting(false);
            },
            onFailure: (error) => {
              setError('Payment failed: ' + error.message);
              setSubmitting(false);
            }
          });
        } catch (paymentErr) {
          setError('Payment initialization failed: ' + paymentErr.message);
          setSubmitting(false);
        }
      } else if (selectedPaymentMethod === 'stripe') {
        // Stripe - Create order and redirect to Stripe Checkout
        // Note: This requires a backend endpoint to create Stripe Checkout session
        setError('Stripe integration requires backend setup. Please use COD or Razorpay for now.');
        setSubmitting(false);
      }

    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!storeInfo?.whatsapp) return;
    const phone = storeInfo.whatsapp.replace(/[^0-9]/g, '');

    // Build items list
    const itemsList = orderItems.map(item =>
      `${item.quantity}x ${item.title} - ₹${item.price * item.quantity}`
    ).join('\n');

    const message = `Hi, my order ID is *${orderId}*\n\n*Order Items:*\n${itemsList}\n\nThank you!`;
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
                      currencySymbol={storeInfo?.currencySymbol || '₹'}
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
                              currencySymbol={storeInfo?.currencySymbol || '₹'}
                            />
                          ))}
                        </div>

                        <div className="cart-footer">
                          <div className="cart-total" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', alignItems: 'flex-end' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>Subtotal:</span>
                              <span style={{ fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>{storeInfo?.currencySymbol || '₹'}{getCartSubtotal().toFixed(2)}</span>
                            </div>
                            {storeInfo?.taxPercentage > 0 && (
                              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>Tax ({storeInfo.taxPercentage}%):</span>
                                <span style={{ fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>{storeInfo?.currencySymbol || '₹'}{getCartTax().toFixed(2)}</span>
                              </div>
                            )}
                            {storeInfo?.shippingCost > 0 && (
                              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>Shipping:</span>
                                <span style={{ fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>{storeInfo?.currencySymbol || '₹'}{getCartShipping().toFixed(2)}</span>
                              </div>
                            )}
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-xs)' }}>
                              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Total:</span>
                              <span className="cart-total-amount" style={{ textAlign: 'right' }}>
                                {storeInfo?.currencySymbol || '₹'}{getCartGrandTotal().toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexDirection: 'column' }}>
                            <button
                              className="btn-primary btn-checkout"
                              onClick={handleCheckout}
                            >
                              Proceed to Checkout
                            </button>
                            <button
                              className="btn-secondary"
                              onClick={closeCart}
                              style={{ width: '100%' }}
                            >
                              Continue Shopping
                            </button>
                          </div>
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

                    {/* Login Button for Guest Users */}
                    {!currentUser && (
                      <div style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-md)',
                        marginBottom: 'var(--spacing-md)',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)'
                      }}>
                        <p style={{
                          margin: '0 0 var(--spacing-sm)',
                          color: 'var(--color-text-light)',
                          fontSize: 'var(--font-size-sm)'
                        }}>
                          Have an account? Login to use saved addresses
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/login', { state: { from: '/' } })}
                          style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius-full)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-primary-hover)'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
                        >
                          Login to Account
                        </button>
                      </div>
                    )}

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
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          value={customerInfo.email}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              email: e.target.value
                            })
                          }
                          placeholder="your@email.com"
                          className={formErrors.email ? 'error' : ''}
                          required
                          disabled={currentUser}
                        />
                        {formErrors.email && (
                          <span className="error-text">{formErrors.email}</span>
                        )}
                        <small style={{ display: 'block', marginTop: 'var(--spacing-xs)', color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                          Required for order confirmation and updates
                        </small>
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

                      {/* Account Creation / Save Address Checkbox */}
                      <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                          <input
                            type="checkbox"
                            checked={createAccount}
                            onChange={(e) => setCreateAccount(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>
                            {currentUser
                              ? 'Save this address for future orders'
                              : 'Create an account and save address'}
                          </span>
                        </label>
                      </div>

                      {/* Registration Fields for Guests */}
                      {!currentUser && createAccount && (
                        <>
                          <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                              type="password"
                              id="password"
                              value={registrationData.password}
                              onChange={(e) => setRegistrationData({
                                ...registrationData,
                                password: e.target.value
                              })}
                              className={formErrors.password ? 'error' : ''}
                              placeholder="Min. 6 characters"
                            />
                            {formErrors.password && (
                              <span className="error-text">{formErrors.password}</span>
                            )}
                          </div>

                          <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                              type="password"
                              id="confirmPassword"
                              value={registrationData.confirmPassword}
                              onChange={(e) => setRegistrationData({
                                ...registrationData,
                                confirmPassword: e.target.value
                              })}
                              className={formErrors.confirmPassword ? 'error' : ''}
                              placeholder="Re-enter password"
                            />
                            {formErrors.confirmPassword && (
                              <span className="error-text">{formErrors.confirmPassword}</span>
                            )}
                          </div>
                        </>
                      )}

                      <div className="checkout-summary">
                        <div className="summary-row">
                          <span>Subtotal ({getCartItemCount()} items):</span>
                          <span>{storeInfo?.currencySymbol || '₹'}{getCartSubtotal().toFixed(2)}</span>
                        </div>
                        {storeInfo?.taxPercentage > 0 && (
                          <div className="summary-row">
                            <span>Tax ({storeInfo.taxPercentage}%):</span>
                            <span>{storeInfo?.currencySymbol || '₹'}{getCartTax().toFixed(2)}</span>
                          </div>
                        )}
                        {storeInfo?.shippingCost > 0 && (
                          <div className="summary-row">
                            <span>Shipping:</span>
                            <span>{storeInfo?.currencySymbol || '₹'}{getCartShipping().toFixed(2)}</span>
                          </div>
                        )}
                        <div className="summary-row summary-total">
                          <span>Total:</span>
                          <span>{storeInfo?.currencySymbol || '₹'}{getCartGrandTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Payment Method Section */}
                      <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)' }}>Payment Method</h3>

                        {paymentSettings?.cod?.enabled && (
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius-sm)',
                            marginBottom: 'var(--spacing-sm)',
                            cursor: 'pointer',
                            backgroundColor: selectedPaymentMethod === 'cod' ? 'var(--color-surface)' : 'transparent'
                          }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={selectedPaymentMethod === 'cod'}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div>
                              <span style={{ fontWeight: 'var(--font-weight-medium)', display: 'block' }}>
                                {paymentSettings.cod.label || 'Cash on Delivery'}
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                                {paymentSettings.cod.description || 'Pay with cash upon delivery'}
                              </span>
                            </div>
                          </label>
                        )}

                        {paymentSettings?.stripe?.enabled && (
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius-sm)',
                            marginBottom: 'var(--spacing-sm)',
                            cursor: 'pointer',
                            backgroundColor: selectedPaymentMethod === 'stripe' ? 'var(--color-surface)' : 'transparent'
                          }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="stripe"
                              checked={selectedPaymentMethod === 'stripe'}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div>
                              <span style={{ fontWeight: 'var(--font-weight-medium)', display: 'block' }}>
                                Credit/Debit Card (Stripe)
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                                Secure online payment via Stripe
                              </span>
                            </div>
                          </label>
                        )}

                        {paymentSettings?.razorpay?.enabled && (
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius-sm)',
                            marginBottom: 'var(--spacing-sm)',
                            cursor: 'pointer',
                            backgroundColor: selectedPaymentMethod === 'razorpay' ? 'var(--color-surface)' : 'transparent'
                          }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="razorpay"
                              checked={selectedPaymentMethod === 'razorpay'}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            />
                            <div>
                              <span style={{ fontWeight: 'var(--font-weight-medium)', display: 'block' }}>
                                UPI / Cards / Netbanking (Razorpay)
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                                Pay securely via Razorpay
                              </span>
                            </div>
                          </label>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn-primary btn-place-order"
                        disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {submitting ? (
                          'Placing Order...'
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            <span>Place Order</span>
                          </>
                        )}
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
