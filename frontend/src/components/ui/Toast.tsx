/**
 * Toast Notification Component
 * 
 * A reusable toast notification component with SDG theming support
 * for displaying success, error, warning, and info messages.
 */

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { NotificationProps } from '../../types/sdg';
import { getSDGTailwindClasses } from '../../config/sdgThemes';
import { clsx } from 'clsx';

const Toast: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  theme = 'default',
  duration = 5000,
  onClose,
  actions,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const tailwindClasses = getSDGTailwindClasses(theme);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  // Icon mapping
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type];

  // Color classes based on type and theme
  const getColorClasses = () => {
    const baseClasses = 'border-l-4';
    
    switch (type) {
      case 'success':
        return clsx(
          baseClasses,
          'bg-green-50 border-green-400 text-green-800',
          theme !== 'default' && tailwindClasses.bg.light
        );
      case 'error':
        return clsx(
          baseClasses,
          'bg-red-50 border-red-400 text-red-800'
        );
      case 'warning':
        return clsx(
          baseClasses,
          'bg-yellow-50 border-yellow-400 text-yellow-800'
        );
      case 'info':
        return clsx(
          baseClasses,
          'bg-blue-50 border-blue-400 text-blue-800',
          theme !== 'default' && tailwindClasses.bg.light
        );
      default:
        return clsx(baseClasses, 'bg-gray-50 border-gray-400 text-gray-800');
    }
  };

  const getIconColorClasses = () => {
    switch (type) {
      case 'success':
        return theme !== 'default' ? tailwindClasses.text.primary : 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return theme !== 'default' ? tailwindClasses.text.primary : 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      className={clsx(
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden',
        'transform transition-all duration-300 ease-in-out',
        isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : 'translate-x-0 opacity-100 scale-100',
        getColorClasses()
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon 
              className={clsx('w-5 h-5', getIconColorClasses())} 
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm opacity-90">
                {message}
              </p>
            )}
            
            {/* Actions */}
            {actions && (
              <div className="mt-3 flex gap-2">
                {actions}
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={clsx(
                'inline-flex rounded-md p-1.5 transition-colors',
                'hover:bg-black hover:bg-opacity-10 focus:outline-none',
                'focus:ring-2 focus:ring-offset-2',
                theme !== 'default' ? tailwindClasses.ring.primary : 'focus:ring-gray-500'
              )}
              onClick={handleClose}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="h-1 bg-black bg-opacity-10">
          <div
            className={clsx(
              'h-full transition-all ease-linear',
              type === 'success' && theme !== 'default' 
                ? 'bg-current' 
                : type === 'success' 
                ? 'bg-green-500'
                : type === 'error'
                ? 'bg-red-500'
                : type === 'warning'
                ? 'bg-yellow-500'
                : type === 'info' && theme !== 'default'
                ? 'bg-current'
                : 'bg-blue-500'
            )}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}


    </div>
  );
};

export default Toast;
