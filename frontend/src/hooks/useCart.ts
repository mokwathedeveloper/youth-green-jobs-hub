import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { productsApi } from '../services/api';
import type { CartItem, CartSummary, CheckoutData } from '../types/products';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);

  const {
    data: cartData,
    loading: cartLoading,
    error: cartError,
    execute: fetchCart,
  } = useApi(productsApi.getCart);

  const {
    loading: addToCartLoading,
    error: addToCartError,
    execute: addToCartExecute,
    reset: resetAddToCartError,
  } = useApi(productsApi.addToCart);

  const {
    loading: updateCartLoading,
    error: updateCartError,
    execute: updateCartExecute,
  } = useApi(productsApi.updateCartItem);

  const {
    loading: removeFromCartLoading,
    error: removeFromCartError,
    execute: removeFromCartExecute,
  } = useApi(productsApi.removeFromCart);

  const {
    loading: checkoutLoading,
    error: checkoutError,
    execute: checkoutExecute,
    reset: resetCheckoutError,
  } = useApi(productsApi.checkout);

  // Load cart data
  const loadCart = useCallback(async () => {
    try {
      const data = await fetchCart();
      if (data) {
        setCartItems(data.items || []);
        setCartSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, [fetchCart]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      await addToCartExecute({ product_id: productId, quantity });
      await loadCart(); // Refresh cart after adding
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  }, [addToCartExecute, loadCart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      await updateCartExecute(itemId, quantity);
      await loadCart(); // Refresh cart after updating
      return true;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      return false;
    }
  }, [updateCartExecute, loadCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      await removeFromCartExecute(itemId);
      await loadCart(); // Refresh cart after removing
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    }
  }, [removeFromCartExecute, loadCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      // Remove all items one by one
      const promises = cartItems.map(item => removeFromCartExecute(item.id));
      await Promise.all(promises);
      await loadCart(); // Refresh cart after clearing
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    }
  }, [cartItems, removeFromCartExecute, loadCart]);

  // Checkout
  const checkout = useCallback(async (checkoutData: CheckoutData) => {
    try {
      const result = await checkoutExecute(checkoutData);
      if (result) {
        await loadCart(); // Refresh cart after checkout
      }
      return result;
    } catch (error) {
      console.error('Failed to checkout:', error);
      return null;
    }
  }, [checkoutExecute, loadCart]);

  // Calculate cart totals
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.product_id === productId);
  }, [cartItems]);

  const getCartItem = useCallback((productId: string) => {
    return cartItems.find(item => item.product_id === productId);
  }, [cartItems]);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return {
    // Data
    cartItems,
    cartSummary,
    cartTotal: getCartTotal(),
    cartItemCount: getCartItemCount(),

    // Loading states
    cartLoading,
    addToCartLoading,
    updateCartLoading,
    removeFromCartLoading,
    checkoutLoading,

    // Error states
    cartError,
    addToCartError,
    updateCartError,
    removeFromCartError,
    checkoutError,

    // Actions
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,

    // Utilities
    isInCart,
    getCartItem,

    // Error resets
    resetAddToCartError,
    resetCheckoutError,
  };
};
