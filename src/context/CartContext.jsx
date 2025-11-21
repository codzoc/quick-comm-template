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
    let result = { success: true, error: null };

    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex > -1) {
        // Increase quantity if already in cart
        const currentQuantity = prevItems[existingItemIndex].quantity;
        const newQuantity = currentQuantity + 1;

        // Check stock availability
        if (newQuantity > product.stock) {
          result = {
            success: false,
            error: `Only ${product.stock} items available in stock`
          };
          return prevItems; // Don't update
        }

        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity = newQuantity;
        return updatedItems;
      } else {
        // Add new item to cart
        // Check if at least 1 item in stock
        if (product.stock < 1) {
          result = {
            success: false,
            error: 'This item is out of stock'
          };
          return prevItems; // Don't add
        }

        return [...prevItems, { product, quantity: 1 }];
      }
    });

    return result;
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) return { success: false, error: 'Quantity must be at least 1' };

    let result = { success: true, error: null };

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.product.id === productId) {
          // Check stock availability
          if (newQuantity > item.product.stock) {
            result = {
              success: false,
              error: `Only ${item.product.stock} items available in stock`
            };
            return item; // Don't update
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return updatedItems;
    });

    return result;
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
