import React from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-8 h-8',
      iconContainer: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      iconContainer: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      iconContainer: 'w-24 h-24',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={clsx('text-center', classes.container, className)}>
      {Icon && (
        <div className={clsx(
          'mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4',
          classes.iconContainer
        )}>
          <Icon className={clsx('text-gray-400', classes.icon)} />
        </div>
      )}
      
      <h3 className={clsx('font-semibold text-gray-900 mb-2', classes.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={clsx('text-gray-600 mb-6 max-w-md mx-auto', classes.description)}>
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={clsx(
            'inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors',
            action.variant === 'secondary'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-primary text-white hover:bg-primary/90'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
