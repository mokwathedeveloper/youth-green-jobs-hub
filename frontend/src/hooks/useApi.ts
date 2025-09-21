import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiError } from '../services/api';

// Generic API hook state
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// API hook options
export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retryConfig?: {
    retries: number;
    retryDelay: number;
  };
}

// Generic API hook
export function useApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { immediate = false, onSuccess, onError, retryConfig } = options;

  const execute = useCallback(
    async (...args: P) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      try {
        const data = await apiFunction(...args);
        
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setState({
          data,
          loading: false,
          error: null,
          success: true,
        });

        onSuccess?.(data);
        return data;
      } catch (error) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const apiError = error as ApiError;
        setState({
          data: null,
          loading: false,
          error: apiError,
          success: false,
        });

        onError?.(apiError);
        throw apiError;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const retry = useCallback(() => {
    if (state.error) {
      execute();
    }
  }, [execute, state.error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

// Specialized hook for paginated data
export interface PaginatedData<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface UsePaginatedApiOptions<T> extends UseApiOptions<PaginatedData<T>> {
  pageSize?: number;
  initialPage?: number;
}

export function usePaginatedApi<T, P extends any[] = []>(
  apiFunction: (page: number, pageSize: number, ...args: P) => Promise<PaginatedData<T>>,
  options: UsePaginatedApiOptions<T> = {}
) {
  const { pageSize = 20, initialPage = 1, ...apiOptions } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);

  const api = useApi(
    (page: number, ...args: P) => apiFunction(page, pageSize, ...args),
    {
      ...apiOptions,
      onSuccess: (data) => {
        if (currentPage === 1) {
          setAllData(data.results);
        } else {
          setAllData(prev => [...prev, ...data.results]);
        }
        apiOptions.onSuccess?.(data);
      },
    }
  );

  const loadMore = useCallback(
    (...args: P) => {
      if (api.data?.next && !api.loading) {
        setCurrentPage(prev => prev + 1);
        return api.execute(currentPage + 1, ...args);
      }
    },
    [api, currentPage]
  );

  const refresh = useCallback(
    (...args: P) => {
      setCurrentPage(1);
      setAllData([]);
      return api.execute(1, ...args);
    },
    [api]
  );

  const hasMore = Boolean(api.data?.next);
  const totalCount = api.data?.count || 0;

  return {
    ...api,
    data: allData,
    currentPage,
    hasMore,
    totalCount,
    loadMore,
    refresh,
  };
}

// Hook for optimistic updates
export interface UseOptimisticOptions<T> {
  onOptimisticUpdate?: (data: T) => void;
  onRevert?: (data: T) => void;
}

export function useOptimistic<T>(
  initialData: T,
  options: UseOptimisticOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const previousDataRef = useRef<T>(initialData);

  const updateOptimistically = useCallback(
    (newData: T) => {
      previousDataRef.current = data;
      setData(newData);
      setIsOptimistic(true);
      options.onOptimisticUpdate?.(newData);
    },
    [data, options]
  );

  const confirmUpdate = useCallback(
    (confirmedData?: T) => {
      if (confirmedData) {
        setData(confirmedData);
      }
      setIsOptimistic(false);
    },
    []
  );

  const revertUpdate = useCallback(() => {
    const previousData = previousDataRef.current;
    setData(previousData);
    setIsOptimistic(false);
    options.onRevert?.(previousData);
  }, [options]);

  return {
    data,
    isOptimistic,
    updateOptimistically,
    confirmUpdate,
    revertUpdate,
  };
}

// Hook for debounced API calls
export function useDebouncedApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  delay: number = 300,
  options: UseApiOptions<T> = {}
) {
  const api = useApi(apiFunction, options);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback(
    (...args: P) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        api.execute(...args);
      }, delay);
    },
    [api, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...api,
    execute: debouncedExecute,
  };
}
