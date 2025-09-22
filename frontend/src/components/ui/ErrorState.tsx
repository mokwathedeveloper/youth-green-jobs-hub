import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Server, 
  Shield, 
  Search,
  FileX,
  Clock,
  Home
} from 'lucide-react';
import type { ApiError } from '../../services/api';

interface ErrorStateProps {
  error?: ApiError | Error | string | null;
  title?: string;
  message?: string;
  variant?: 'page' | 'card' | 'inline' | 'banner';
  size?: 'sm' | 'md' | 'lg';
  showRetry?: boolean;
  showHome?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title,
  message,
  variant = 'card',
  size = 'md',
  showRetry = true,
  showHome = false,
  showDetails = false,
  onRetry,
  onHome,
  className = '',
  children,
}) => {
  // Determine error type and appropriate icon/message
  const getErrorInfo = () => {
    if (!error) {
      return {
        icon: AlertTriangle,
        title: title || 'Something went wrong',
        message: message || 'An unexpected error occurred. Please try again.',
        color: 'red',
      };
    }

    if (typeof error === 'string') {
      return {
        icon: AlertTriangle,
        title: title || 'Error',
        message: message || error,
        color: 'red',
      };
    }

    const apiError = error as ApiError;
    const status = apiError.status;

    // Network/Connection errors
    if (!status || status === 0) {
      return {
        icon: Wifi,
        title: title || 'Connection Error',
        message: message || 'Unable to connect to the server. Please check your internet connection.',
        color: 'orange',
      };
    }

    // Client errors (4xx)
    if (status >= 400 && status < 500) {
      switch (status) {
        case 401:
          return {
            icon: Shield,
            title: title || 'Authentication Required',
            message: message || 'Please log in to access this content.',
            color: 'yellow',
          };
        case 403:
          return {
            icon: Shield,
            title: title || 'Access Denied',
            message: message || 'You don\'t have permission to access this resource.',
            color: 'red',
          };
        case 404:
          return {
            icon: Search,
            title: title || 'Not Found',
            message: message || 'The requested resource could not be found.',
            color: 'gray',
          };
        case 408:
          return {
            icon: Clock,
            title: title || 'Request Timeout',
            message: message || 'The request took too long to complete. Please try again.',
            color: 'orange',
          };
        case 429:
          return {
            icon: Clock,
            title: title || 'Too Many Requests',
            message: message || 'You\'re making requests too quickly. Please wait a moment and try again.',
            color: 'orange',
          };
        default:
          return {
            icon: AlertTriangle,
            title: title || 'Request Error',
            message: message || apiError.message || 'There was a problem with your request.',
            color: 'red',
          };
      }
    }

    // Server errors (5xx)
    if (status >= 500) {
      return {
        icon: Server,
        title: title || 'Server Error',
        message: message || 'The server encountered an error. Please try again later.',
        color: 'red',
      };
    }

    // Default error
    return {
      icon: AlertTriangle,
      title: title || 'Error',
      message: message || apiError.message || 'An error occurred.',
      color: 'red',
    };
  };

  const errorInfo = getErrorInfo();
  const Icon = errorInfo.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8',
      title: 'text-base',
      message: 'text-sm',
      button: 'px-3 py-1.5 text-sm',
    },
    md: {
      container: 'p-6',
      icon: 'w-12 h-12',
      title: 'text-lg',
      message: 'text-base',
      button: 'px-4 py-2',
    },
    lg: {
      container: 'p-8',
      icon: 'w-16 h-16',
      title: 'text-xl',
      message: 'text-lg',
      button: 'px-6 py-3',
    },
  };

  const config = sizeConfig[size];

  // Color configurations
  const colorConfig = {
    red: {
      icon: 'text-red-500',
      iconBg: 'bg-red-100',
      title: 'text-red-900',
      message: 'text-red-700',
    },
    orange: {
      icon: 'text-orange-500',
      iconBg: 'bg-orange-100',
      title: 'text-orange-900',
      message: 'text-orange-700',
    },
    yellow: {
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-100',
      title: 'text-yellow-900',
      message: 'text-yellow-700',
    },
    gray: {
      icon: 'text-gray-500',
      iconBg: 'bg-gray-100',
      title: 'text-gray-900',
      message: 'text-gray-700',
    },
  };

  const colors = colorConfig[errorInfo.color as keyof typeof colorConfig];

  // Variant-specific styling
  const getVariantClasses = () => {
    switch (variant) {
      case 'page':
        return 'min-h-screen flex items-center justify-center bg-gray-50';
      case 'card':
        return 'bg-white rounded-lg border border-gray-200 shadow-sm';
      case 'inline':
        return 'bg-gray-50 rounded-md border border-gray-200';
      case 'banner':
        return `bg-${errorInfo.color}-50 border border-${errorInfo.color}-200 rounded-md`;
      default:
        return 'bg-white rounded-lg border border-gray-200';
    }
  };

  const containerClasses = `${getVariantClasses()} ${config.container} ${className}`;

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto w-fit p-3 ${colors.iconBg} rounded-full mb-4`}>
          <Icon className={`${config.icon} ${colors.icon}`} />
        </div>

        {/* Title */}
        <h3 className={`font-semibold ${colors.title} ${config.title} mb-2`}>
          {errorInfo.title}
        </h3>

        {/* Message */}
        <p className={`${colors.message} ${config.message} mb-6 max-w-md mx-auto`}>
          {errorInfo.message}
        </p>

        {/* Error Details (Development only) */}
        {showDetails && error && typeof error === 'object' && 'stack' in error && (
          <details className="text-left bg-gray-100 p-4 rounded-md mb-6 max-w-lg mx-auto">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details
            </summary>
            <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
              {error.stack || JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center ${config.button} bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}

          {showHome && onHome && (
            <button
              onClick={onHome}
              className={`inline-flex items-center ${config.button} bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors`}
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>
          )}
        </div>

        {/* Custom children */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Predefined error state components
export const NetworkError: React.FC<Omit<ErrorStateProps, 'error'>> = (props) => (
  <ErrorState
    {...props}
    error={{ status: 0, message: 'Network error' } as ApiError}
  />
);

export const NotFoundError: React.FC<Omit<ErrorStateProps, 'error'>> = (props) => (
  <ErrorState
    {...props}
    error={{ status: 404, message: 'Not found' } as ApiError}
  />
);

export const UnauthorizedError: React.FC<Omit<ErrorStateProps, 'error'>> = (props) => (
  <ErrorState
    {...props}
    error={{ status: 401, message: 'Unauthorized' } as ApiError}
  />
);

export const ServerError: React.FC<Omit<ErrorStateProps, 'error'>> = (props) => (
  <ErrorState
    {...props}
    error={{ status: 500, message: 'Server error' } as ApiError}
  />
);

export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}> = ({ 
  title = 'No data available',
  message = 'There\'s nothing to show here yet.',
  icon: Icon = FileX,
  action,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="mx-auto w-fit p-3 bg-gray-100 rounded-full mb-4">
      <Icon className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
    {action}
  </div>
);

export default ErrorState;
