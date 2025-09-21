import { useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { useLoading } from '../contexts/LoadingContext';
import type { ApiError } from '../services/api';

interface ErrorHandlerOptions {
  showNotification?: boolean;
  persistent?: boolean;
  retryAction?: () => void;
  fallbackMessage?: string;
  logError?: boolean;
}

export const useErrorHandler = () => {
  const { showError, showWarning, showSuccess, showInfo } = useError();
  const { stopLoading, clearAllLoading } = useLoading();

  // Handle API errors with proper user feedback
  const handleApiError = useCallback((
    error: ApiError | Error | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showNotification = true,
      persistent = false,
      retryAction,
      fallbackMessage = 'An unexpected error occurred',
      logError = true,
    } = options;

    // Log error for debugging
    if (logError) {
      console.error('Error handled by useErrorHandler:', error);
    }

    // Stop any loading states
    clearAllLoading();

    let title = 'Error';
    let message = fallbackMessage;
    let shouldShowNotification = showNotification;

    if (error instanceof Error) {
      // Handle ApiError specifically
      if ('status' in error && 'data' in error) {
        const apiError = error as ApiError;
        
        switch (apiError.status) {
          case 400:
            title = 'Invalid Request';
            message = apiError.data?.message || 'Please check your input and try again.';
            break;
          case 401:
            title = 'Authentication Required';
            message = 'Please log in to continue.';
            // Don't show notification for auth errors as they're handled by auth context
            shouldShowNotification = false;
            break;
          case 403:
            title = 'Access Denied';
            message = 'You do not have permission to perform this action.';
            break;
          case 404:
            title = 'Not Found';
            message = 'The requested resource could not be found.';
            break;
          case 409:
            title = 'Conflict';
            message = apiError.data?.message || 'This action conflicts with existing data.';
            break;
          case 422:
            title = 'Validation Error';
            message = apiError.data?.message || 'Please check your input and try again.';
            break;
          case 429:
            title = 'Too Many Requests';
            message = 'Please wait a moment before trying again.';
            break;
          case 500:
            title = 'Server Error';
            message = 'Something went wrong on our end. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            title = 'Service Unavailable';
            message = 'The service is temporarily unavailable. Please try again later.';
            break;
          default:
            title = 'Network Error';
            message = apiError.data?.message || 'Please check your connection and try again.';
        }
      } else {
        // Handle regular JavaScript errors
        title = 'Application Error';
        message = error.message || fallbackMessage;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    // Show notification if requested
    if (shouldShowNotification) {
      const notificationId = showError(title, message, persistent);
      
      // Add retry action if provided
      if (retryAction) {
        // Note: This would require extending the notification system to support actions
        // For now, we'll just log that a retry action is available
        console.log('Retry action available for error:', title);
      }
      
      return notificationId;
    }

    return null;
  }, [showError, clearAllLoading]);

  // Handle network errors specifically
  const handleNetworkError = useCallback((error: unknown, retryAction?: () => void) => {
    return handleApiError(error, {
      showNotification: true,
      persistent: true,
      retryAction,
      fallbackMessage: 'Network connection failed. Please check your internet connection.',
    });
  }, [handleApiError]);

  // Handle validation errors
  const handleValidationError = useCallback((error: unknown, fieldErrors?: Record<string, string[]>) => {
    if (fieldErrors) {
      // Handle field-specific validation errors
      const firstField = Object.keys(fieldErrors)[0];
      const firstError = fieldErrors[firstField]?.[0];
      
      if (firstError) {
        return showWarning('Validation Error', firstError);
      }
    }

    return handleApiError(error, {
      fallbackMessage: 'Please check your input and try again.',
    });
  }, [handleApiError, showWarning]);

  // Handle success operations
  const handleSuccess = useCallback((message: string, details?: string) => {
    return showSuccess(message, details);
  }, [showSuccess]);

  // Handle warnings
  const handleWarning = useCallback((message: string, details?: string) => {
    return showWarning(message, details);
  }, [showWarning]);

  // Handle info messages
  const handleInfo = useCallback((message: string, details?: string) => {
    return showInfo(message, details);
  }, [showInfo]);

  // Wrapper for async operations with error handling
  const withErrorHandling = useCallback(<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions & {
      successMessage?: string;
      loadingId?: string;
    } = {}
  ) => {
    return async (): Promise<T | null> => {
      try {
        const result = await operation();
        
        if (options.successMessage) {
          handleSuccess(options.successMessage);
        }
        
        return result;
      } catch (error) {
        handleApiError(error, options);
        return null;
      }
    };
  }, [handleApiError, handleSuccess]);

  // Safe async operation that won't throw
  const safeAsync = useCallback(<T>(
    operation: () => Promise<T>,
    fallback?: T
  ) => {
    return async (): Promise<T | undefined> => {
      try {
        return await operation();
      } catch (error) {
        handleApiError(error, { showNotification: false });
        return fallback;
      }
    };
  }, [handleApiError]);

  return {
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleSuccess,
    handleWarning,
    handleInfo,
    withErrorHandling,
    safeAsync,
  };
};
