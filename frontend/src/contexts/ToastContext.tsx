/**
 * Toast Context and Provider
 * 
 * Provides global toast notification management with SDG theming support.
 * Allows components to show notifications from anywhere in the app.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { NotificationProps, SDGTheme, NotificationType } from '../types/sdg';

interface ToastItem extends NotificationProps {
  id: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<NotificationProps, 'onClose'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  // Convenience methods
  showSuccess: (title: string, message?: string, theme?: SDGTheme) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string, theme?: SDGTheme) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<NotificationProps, 'onClose'>): string => {
    const id = generateId();
    const newToast: ToastItem = {
      ...toast,
      id,
      onClose: () => hideToast(id),
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Limit the number of toasts
      return updatedToasts.slice(0, maxToasts);
    });

    return id;
  }, [generateId, maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((
    title: string, 
    message?: string, 
    theme: SDGTheme = 'climate-action'
  ): string => {
    return showToast({
      type: 'success',
      title,
      message,
      theme,
      duration: 4000,
    });
  }, [showToast]);

  const showError = useCallback((
    title: string, 
    message?: string
  ): string => {
    return showToast({
      type: 'error',
      title,
      message,
      duration: 6000, // Longer duration for errors
    });
  }, [showToast]);

  const showWarning = useCallback((
    title: string, 
    message?: string
  ): string => {
    return showToast({
      type: 'warning',
      title,
      message,
      duration: 5000,
    });
  }, [showToast]);

  const showInfo = useCallback((
    title: string, 
    message?: string, 
    theme: SDGTheme = 'sustainable-cities'
  ): string => {
    return showToast({
      type: 'info',
      title,
      message,
      theme,
      duration: 4000,
    });
  }, [showToast]);

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};
