import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list' | 'table';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  lines = 1,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded';
      case 'card':
        return 'rounded-lg';
      case 'list':
        return 'rounded h-16';
      case 'table':
        return 'rounded h-12';
      default:
        return 'rounded';
    }
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${animationClasses[animation]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width, // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    <div className="space-y-4">
      <LoadingSkeleton variant="text" width="60%" height="1.5rem" />
      <LoadingSkeleton variant="text" lines={3} />
      <div className="flex space-x-4">
        <LoadingSkeleton variant="rectangular" width="100px" height="2.5rem" />
        <LoadingSkeleton variant="rectangular" width="100px" height="2.5rem" />
      </div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
        <LoadingSkeleton variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" width="40%" height="1.25rem" />
          <LoadingSkeleton variant="text" width="80%" />
        </div>
        <LoadingSkeleton variant="rectangular" width="80px" height="2rem" />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <LoadingSkeleton key={index} variant="text" width="60%" height="1rem" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <LoadingSkeleton key={colIndex} variant="text" width="80%" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <LoadingSkeleton variant="text" width="300px" height="2rem" />
        <LoadingSkeleton variant="text" width="400px" />
      </div>
      <LoadingSkeleton variant="rectangular" width="120px" height="2.5rem" />
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <LoadingSkeleton variant="text" width="80px" />
              <LoadingSkeleton variant="text" width="60px" height="1.5rem" />
            </div>
            <LoadingSkeleton variant="circular" width="3rem" height="3rem" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <LoadingSkeleton variant="text" width="200px" height="1.5rem" className="mb-4" />
          <LoadingSkeleton variant="rectangular" width="100%" height="300px" />
        </div>
      ))}
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 8, 
  className = '' 
}) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <LoadingSkeleton variant="rectangular" width="100%" height="200px" />
        <div className="p-4 space-y-3">
          <LoadingSkeleton variant="text" width="80%" height="1.25rem" />
          <LoadingSkeleton variant="text" lines={2} />
          <div className="flex justify-between items-center">
            <LoadingSkeleton variant="text" width="60px" height="1.5rem" />
            <LoadingSkeleton variant="rectangular" width="80px" height="2rem" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC<{ 
  title?: string; 
  height?: number; 
  className?: string 
}> = ({ 
  title, 
  height = 300, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    {title && (
      <LoadingSkeleton variant="text" width="200px" height="1.5rem" className="mb-4" />
    )}
    <LoadingSkeleton variant="rectangular" width="100%" height={`${height}px`} />
  </div>
);

export default LoadingSkeleton;
