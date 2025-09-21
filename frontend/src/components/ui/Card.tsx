import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-medium',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'rounded-lg transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'hover:shadow-lg hover:-translate-y-1',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card sub-components
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={clsx('mb-4', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}> = ({ children, className = '', as: Component = 'h3' }) => (
  <Component className={clsx('text-lg font-semibold text-gray-900', className)}>
    {children}
  </Component>
);

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={clsx('text-sm text-gray-600 mt-1', className)}>
    {children}
  </p>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={clsx('mt-4 pt-4 border-t border-gray-200', className)}>
    {children}
  </div>
);

export default Card;
