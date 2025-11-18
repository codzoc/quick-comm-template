import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Cart Context
 * Manages cart state in memory (no localStorage)
 *
 * Cart state is session-based and will be lost on page refresh
 * This is intentional for this template to avoid persistence complexity
 */

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  // Cart items: [{product, quantity}]
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Add item to cart
  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex > -1) {
        // Increase quantity if already in cart
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      return updatedItems;
    });
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculate cart totals
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product.discountedPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  // Get total items count
  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Toggle cart modal
  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    toggleCart,
    openCart,
    closeCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
