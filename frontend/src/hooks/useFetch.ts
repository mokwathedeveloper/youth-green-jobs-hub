import { useState, useEffect, useCallback, useRef } from 'react';
import { useApiCache } from './useLocalStorage';
import type { ApiError } from '../services/api';

/**
 * Enhanced fetch hook with caching, retry logic, and optimistic updates
 */
export interface UseFetchOptions<T> {
  immediate?: boolean;
  cache?: boolean;
  cacheTTL?: number; // in minutes
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onRetry?: (attempt: number) => void;
  transform?: (data: any) => T;
  dependencies?: any[];
}

export interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
  retryCount: number;
}

export function useFetch<T>(
  fetchFunction: () => Promise<T>,
  options: UseFetchOptions<T> = {}
) {
  const {
    immediate = false,
    cache = false,
    cacheTTL = 5,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onRetry,
    transform,
    dependencies = [],
  } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
    retryCount: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cache hook (only used if cache is enabled)
  const cacheKey = cache ? `fetch-${fetchFunction.toString().slice(0, 50)}` : '';
  const apiCache = useApiCache<T>(cacheKey, cacheTTL);

  const execute = useCallback(
    async (forceRefresh = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Check cache first
      if (cache && !forceRefresh && apiCache.data && !apiCache.isExpired) {
        setState(prev => ({
          ...prev,
          data: apiCache.data,
          loading: false,
          error: null,
          success: true,
        }));
        onSuccess?.(apiCache.data);
        return apiCache.data;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      const attemptFetch = async (attempt: number): Promise<T | null> => {
        try {
          const rawData = await fetchFunction();
          
          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return null;
          }

          // Transform data if transform function provided
          const data = transform ? transform(rawData) : rawData;

          // Cache the data
          if (cache) {
            apiCache.setData(data);
          }

          setState({
            data,
            loading: false,
            error: null,
            success: true,
            retryCount: 0,
          });

          onSuccess?.(data);
          return data;
        } catch (error) {
          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return null;
          }

          const apiError = error as ApiError;

          // Retry logic
          if (attempt < retryAttempts) {
            onRetry?.(attempt + 1);
            
            setState(prev => ({
              ...prev,
              retryCount: attempt + 1,
            }));

            // Wait before retrying
            return new Promise((resolve) => {
              retryTimeoutRef.current = setTimeout(() => {
                resolve(attemptFetch(attempt + 1));
              }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
            });
          }

          // Final error state
          setState({
            data: null,
            loading: false,
            error: apiError,
            success: false,
            retryCount: attempt,
          });

          onError?.(apiError);
          throw apiError;
        }
      };

      return attemptFetch(0);
    },
    [fetchFunction, cache, apiCache, transform, retryAttempts, retryDelay, onSuccess, onError, onRetry]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      retryCount: 0,
    });
    
    if (cache) {
      apiCache.clearCache();
    }
  }, [cache, apiCache]);

  const retry = useCallback(() => {
    execute(true);
  }, [execute]);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Execute when dependencies change
  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    retry,
    isRetrying: state.retryCount > 0 && state.loading,
  };
}

/**
 * Hook for fetching multiple resources in parallel
 */
export function useParallelFetch<T extends Record<string, any>>(
  fetchFunctions: { [K in keyof T]: () => Promise<T[K]> },
  options: Omit<UseFetchOptions<T>, 'transform'> = {}
) {
  const [state, setState] = useState<{
    data: Partial<T>;
    loading: boolean;
    errors: Partial<Record<keyof T, ApiError>>;
    success: boolean;
  }>({
    data: {},
    loading: false,
    errors: {},
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      errors: {},
      success: false,
    }));

    const keys = Object.keys(fetchFunctions) as (keyof T)[];
    const promises = keys.map(async (key) => {
      try {
        const data = await fetchFunctions[key]();
        return { key, data, error: null };
      } catch (error) {
        return { key, data: null, error: error as ApiError };
      }
    });

    try {
      const results = await Promise.all(promises);
      
      const data: Partial<T> = {};
      const errors: Partial<Record<keyof T, ApiError>> = {};
      let hasErrors = false;

      results.forEach(({ key, data: resultData, error }) => {
        if (error) {
          errors[key] = error;
          hasErrors = true;
        } else {
          data[key] = resultData;
        }
      });

      setState({
        data,
        loading: false,
        errors,
        success: !hasErrors,
      });

      if (!hasErrors) {
        options.onSuccess?.(data as T);
      } else {
        const firstError = Object.values(errors)[0];
        options.onError?.(firstError as ApiError);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        success: false,
      }));
      options.onError?.(error as ApiError);
    }
  }, [fetchFunctions, options]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [options.immediate, execute]);

  return {
    ...state,
    execute,
  };
}

/**
 * Hook for infinite scrolling/pagination
 */
export interface UseInfiniteScrollOptions<T> {
  pageSize?: number;
  initialPage?: number;
  hasMore?: (data: T[], page: number) => boolean;
  onSuccess?: (data: T[], page: number) => void;
  onError?: (error: ApiError) => void;
}

export function useInfiniteScroll<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ results: T[]; hasMore: boolean }>,
  options: UseInfiniteScrollOptions<T> = {}
) {
  const {
    pageSize = 20,
    initialPage = 1,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    loadingMore: false,
    error: null as ApiError | null,
    hasMore: true,
    page: initialPage,
  });

  const loadMore = useCallback(async () => {
    if (state.loading || state.loadingMore || !state.hasMore) return;

    setState(prev => ({
      ...prev,
      loadingMore: true,
      error: null,
    }));

    try {
      const result = await fetchFunction(state.page, pageSize);
      
      setState(prev => ({
        ...prev,
        data: [...prev.data, ...result.results],
        loadingMore: false,
        hasMore: result.hasMore,
        page: prev.page + 1,
      }));

      onSuccess?.(result.results, state.page);
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loadingMore: false,
        error: apiError,
      }));
      onError?.(apiError);
    }
  }, [fetchFunction, state.page, state.loading, state.loadingMore, state.hasMore, pageSize, onSuccess, onError]);

  const refresh = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      data: [],
      page: initialPage,
      hasMore: true,
    }));

    try {
      const result = await fetchFunction(initialPage, pageSize);
      
      setState(prev => ({
        ...prev,
        data: result.results,
        loading: false,
        hasMore: result.hasMore,
        page: initialPage + 1,
      }));

      onSuccess?.(result.results, initialPage);
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
      onError?.(apiError);
    }
  }, [fetchFunction, initialPage, pageSize, onSuccess, onError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    loadMore,
    refresh,
  };
}
