/**
 * SDG Card Component
 * 
 * A reusable card component with SDG theming support for the
 * Youth Green Jobs Hub platform. Supports multiple variants,
 * sizes, and dynamic theming based on SDG goals.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { SDGCardProps } from '../../types/sdg';
import { getSDGTailwindClasses, getSDGTheme } from '../../config/sdgThemes';
import { clsx } from 'clsx';

const SDGCard: React.FC<SDGCardProps> = ({
  title,
  description,
  theme = 'default',
  size = 'md',
  variant = 'solid',
  icon,
  image,
  actions,
  onClick,
  className = '',
  children,
  loading = false,
  disabled = false,
  ...props
}) => {
  const themeConfig = getSDGTheme(theme);
  const tailwindClasses = getSDGTailwindClasses(theme);

  // Base card classes
  const baseClasses = clsx(
    'rounded-lg shadow-md transition-all duration-200 overflow-hidden',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
      'cursor-pointer hover:shadow-lg transform hover:-translate-y-1': onClick && !disabled,
      'opacity-50 cursor-not-allowed': disabled,
      'relative': loading,
    }
  );

  // Size-based classes
  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg',
    xl: 'p-10 text-xl',
  };

  // Variant-based classes
  const variantClasses = {
    solid: clsx(
      'bg-white border',
      tailwindClasses.border.light,
      'hover:shadow-lg'
    ),
    outline: clsx(
      'bg-transparent border-2',
      tailwindClasses.border.primary,
      'hover:bg-opacity-5',
      tailwindClasses.bg.light
    ),
    ghost: clsx(
      'bg-transparent border-0',
      'hover:bg-opacity-10',
      tailwindClasses.bg.light
    ),
    gradient: clsx(
      'bg-gradient-to-br text-white border-0',
      theme === 'climate-action' ? 'from-green-500 to-green-700' :
      theme === 'sustainable-cities' ? 'from-blue-500 to-blue-700' :
      theme === 'decent-work' ? 'from-orange-400 to-orange-600' :
      'from-gray-500 to-gray-700'
    ),
  };

  // Focus ring classes
  const focusClasses = tailwindClasses.ring.primary;

  // Combined classes
  const cardClasses = clsx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    focusClasses,
    className
  );

  // Text color classes based on variant
  const textClasses = variant === 'gradient' ? 'text-white' : tailwindClasses.text.dark;
  const secondaryTextClasses = variant === 'gradient' ? 'text-white text-opacity-90' : 'text-gray-600';

  const handleClick = () => {
    if (onClick && !disabled && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick && !disabled && !loading) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      )}

      {/* Image section */}
      {image && (
        <div className="mb-4 -mx-6 -mt-6 md:-mx-8 md:-mt-8 lg:-mx-10 lg:-mt-10">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Header section */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon */}
        {icon && (
          <div className={clsx(
            'flex-shrink-0 p-2 rounded-lg',
            variant === 'gradient' ? 'bg-white bg-opacity-20' : tailwindClasses.bg.light
          )}>
            <div className={clsx(
              'w-5 h-5',
              variant === 'gradient' ? 'text-white' : tailwindClasses.text.primary
            )}>
              {icon}
            </div>
          </div>
        )}

        {/* Title and SDG badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={clsx(
              'font-semibold truncate',
              textClasses
            )}>
              {title}
            </h3>
            {theme !== 'default' && (
              <span className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                variant === 'gradient' ? 'bg-white bg-opacity-20 text-white' :
                `${tailwindClasses.bg.light} ${tailwindClasses.text.primary}`
              )}>
                SDG {themeConfig.goal}
              </span>
            )}
          </div>
          
          {/* Description */}
          {description && (
            <p className={clsx(
              'text-sm line-clamp-2',
              secondaryTextClasses
            )}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content section */}
      {children && (
        <div className="mb-4">
          {children}
        </div>
      )}

      {/* Actions section */}
      {actions && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SDGCard;
export { SDGCard };
