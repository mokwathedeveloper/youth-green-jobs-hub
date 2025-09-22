import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with TypeScript support and error handling
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Custom hook for sessionStorage with TypeScript support and error handling
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from session storage by key
      const item = window.sessionStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to session storage
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Function to remove the item from sessionStorage
  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing user preferences in localStorage
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dashboardLayout: 'grid' | 'list';
  notificationsEnabled: boolean;
  autoRefreshInterval: number;
  defaultPageSize: number;
  favoriteCounties: string[];
  mapDefaultZoom: number;
  mapDefaultCenter: [number, number];
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  dashboardLayout: 'grid',
  notificationsEnabled: true,
  autoRefreshInterval: 30000, // 30 seconds
  defaultPageSize: 20,
  favoriteCounties: [],
  mapDefaultZoom: 10,
  mapDefaultCenter: [-0.0917, 34.7680], // Kisumu coordinates
};

export function useUserPreferences() {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage<UserPreferences>(
    'youth-green-jobs-preferences',
    defaultPreferences
  );

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
    },
    [setPreferences]
  );

  const resetToDefaults = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    resetToDefaults,
    clearPreferences,
  };
}

/**
 * Hook for managing cart persistence
 */
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  creditPrice?: number;
  addedAt: string;
}

export function useCartPersistence() {
  const [cartItems, setCartItems, clearCart] = useLocalStorage<CartItem[]>('cart-items', []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'addedAt'>) => {
      const newItem: CartItem = {
        ...item,
        addedAt: new Date().toISOString(),
      };
      
      setCartItems(prev => {
        const existingIndex = prev.findIndex(i => i.productId === item.productId);
        if (existingIndex >= 0) {
          // Update existing item
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], quantity: item.quantity };
          return updated;
        } else {
          // Add new item
          return [...prev, newItem];
        }
      });
    },
    [setCartItems]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    },
    [setCartItems]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      
      setCartItems(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    },
    [setCartItems, removeItem]
  );

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const getTotalCreditPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + ((item.creditPrice || 0) * item.quantity), 0);
  }, [cartItems]);

  return {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getTotalCreditPrice,
  };
}

/**
 * Hook for caching API responses
 */
export function useApiCache<T>(key: string, ttlMinutes: number = 5) {
  const cacheKey = `api-cache-${key}`;
  
  const [cache, setCache] = useLocalStorage<{
    data: T | null;
    timestamp: number;
    ttl: number;
  }>(`${cacheKey}`, {
    data: null,
    timestamp: 0,
    ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
  });

  const isExpired = useCallback(() => {
    if (!cache.data || !cache.timestamp) return true;
    return Date.now() - cache.timestamp > cache.ttl;
  }, [cache]);

  const setData = useCallback(
    (data: T) => {
      setCache({
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      });
    },
    [setCache, ttlMinutes]
  );

  const getData = useCallback(() => {
    if (isExpired()) {
      return null;
    }
    return cache.data;
  }, [cache.data, isExpired]);

  const clearCache = useCallback(() => {
    setCache({
      data: null,
      timestamp: 0,
      ttl: ttlMinutes * 60 * 1000,
    });
  }, [setCache, ttlMinutes]);

  return {
    data: getData(),
    setData,
    clearCache,
    isExpired: isExpired(),
  };
}
