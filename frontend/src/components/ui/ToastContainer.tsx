/**
 * Toast Container Component
 * 
 * Renders all active toast notifications in a fixed position
 * with proper stacking and animations.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../contexts/ToastContext';
import Toast from './Toast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'top-right',
  className = ''
}) => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const containerContent = (
    <div
      className={`fixed z-50 pointer-events-none ${positionClasses[position]} ${className}`}
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-2 max-h-screen overflow-hidden">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </div>
  );

  // Render to portal to ensure proper z-index stacking
  return createPortal(containerContent, document.body);
};

export default ToastContainer;
