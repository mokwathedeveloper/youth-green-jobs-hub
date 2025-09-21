import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
  cancellable?: boolean;
  onCancel?: () => void;
}

interface LoadingContextType {
  loadingStates: LoadingState[];
  isLoading: boolean;
  globalLoading: boolean;
  startLoading: (id: string, message?: string, options?: Partial<LoadingState>) => void;
  stopLoading: (id: string) => void;
  updateLoading: (id: string, updates: Partial<LoadingState>) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);
  const [globalLoading, setGlobalLoadingState] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<string>();

  const isLoading = loadingStates.length > 0 || globalLoading;

  const startLoading = useCallback((
    id: string, 
    message?: string, 
    options: Partial<LoadingState> = {}
  ) => {
    setLoadingStates(prev => {
      const existing = prev.find(state => state.id === id);
      if (existing) {
        return prev.map(state => 
          state.id === id 
            ? { ...state, message, ...options }
            : state
        );
      }
      return [...prev, { id, message, ...options }];
    });
  }, []);

  const stopLoading = useCallback((id: string) => {
    setLoadingStates(prev => prev.filter(state => state.id !== id));
  }, []);

  const updateLoading = useCallback((id: string, updates: Partial<LoadingState>) => {
    setLoadingStates(prev => 
      prev.map(state => 
        state.id === id 
          ? { ...state, ...updates }
          : state
      )
    );
  }, []);

  const setGlobalLoading = useCallback((loading: boolean, message?: string) => {
    setGlobalLoadingState(loading);
    setGlobalMessage(message);
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates([]);
    setGlobalLoadingState(false);
    setGlobalMessage(undefined);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        loadingStates,
        isLoading,
        globalLoading,
        startLoading,
        stopLoading,
        updateLoading,
        setGlobalLoading,
        clearAllLoading,
      }}
    >
      {children}
      {globalLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <LoadingSpinner size="lg" className="mb-4" />
            {globalMessage && (
              <p className="text-center text-gray-700">{globalMessage}</p>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

// Hook for managing component-specific loading states
export const useComponentLoading = (componentId: string) => {
  const { startLoading, stopLoading, updateLoading, loadingStates } = useLoading();

  const isComponentLoading = loadingStates.some(state => state.id === componentId);
  const componentLoadingState = loadingStates.find(state => state.id === componentId);

  const setLoading = useCallback((loading: boolean, message?: string, options?: Partial<LoadingState>) => {
    if (loading) {
      startLoading(componentId, message, options);
    } else {
      stopLoading(componentId);
    }
  }, [componentId, startLoading, stopLoading]);

  const updateComponentLoading = useCallback((updates: Partial<LoadingState>) => {
    updateLoading(componentId, updates);
  }, [componentId, updateLoading]);

  return {
    isLoading: isComponentLoading,
    loadingState: componentLoadingState,
    setLoading,
    updateLoading: updateComponentLoading,
  };
};

// Hook for managing async operations with loading states
export const useAsyncOperation = () => {
  const { startLoading, stopLoading } = useLoading();

  const executeWithLoading = useCallback(async function<T>(
    operation: () => Promise<T>,
    loadingId: string,
    message?: string
  ): Promise<T> {
    try {
      startLoading(loadingId, message);
      const result = await operation();
      return result;
    } finally {
      stopLoading(loadingId);
    }
  }, [startLoading, stopLoading]);

  return { executeWithLoading };
};

// Higher-order component for automatic loading states
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingId: string,
  defaultMessage?: string
) => {
  return React.forwardRef<any, P & { loading?: boolean; loadingMessage?: string }>((props, ref) => {
    const { loading, loadingMessage, ...componentProps } = props;
    const { setLoading } = useComponentLoading(loadingId);

    React.useEffect(() => {
      setLoading(loading || false, loadingMessage || defaultMessage);
    }, [loading, loadingMessage, setLoading]);

    return <Component {...(componentProps as P)} ref={ref} />;
  });
};
