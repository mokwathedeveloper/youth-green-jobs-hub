import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react';

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorContextType {
  notifications: ErrorNotification[];
  addNotification: (notification: Omit<ErrorNotification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showError: (title: string, message?: string, persistent?: boolean) => string;
  showSuccess: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const addNotification = useCallback((notification: Omit<ErrorNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: ErrorNotification = {
      ...notification,
      id,
      duration: notification.duration ?? (notification.type === 'error' ? 0 : 5000),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (if not persistent)
    if (newNotification.duration && newNotification.duration > 0 && !newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showError = useCallback((title: string, message?: string, persistent = false) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent,
    });
  }, [addNotification]);

  const showSuccess = useCallback((title: string, message?: string) => {
    return addNotification({
      type: 'success',
      title,
      message,
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    return addNotification({
      type: 'warning',
      title,
      message,
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    return addNotification({
      type: 'info',
      title,
      message,
    });
  }, [addNotification]);

  return (
    <ErrorContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showError,
        showSuccess,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <NotificationContainer />
    </ErrorContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useError();

  const getIcon = (type: ErrorNotification['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: ErrorNotification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 shadow-lg transition-all duration-300 ${getStyles(notification.type)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium">{notification.title}</h3>
              {notification.message && (
                <p className="mt-1 text-sm opacity-90">{notification.message}</p>
              )}
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-2 text-sm font-medium underline hover:no-underline"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black hover:bg-opacity-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
