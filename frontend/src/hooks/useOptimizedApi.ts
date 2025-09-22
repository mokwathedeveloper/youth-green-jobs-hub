import { useState, useCallback, useRef, useEffect } from 'react';
import { useApiCache } from './useLocalStorage';
import type { ApiError } from '../services/api';

/**
 * Request deduplication manager
 */
class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator();
    }
    return RequestDeduplicator.instance;
  }

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(key?: string) {
    if (key) {
      this.pendingRequests.delete(key);
    } else {
      this.pendingRequests.clear();
    }
  }
}

/**
 * Optimistic update manager
 */
export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  timestamp: number;
  rollback: () => void;
}

export function useOptimisticUpdates<T>() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate<T>[]>([]);

  const addOptimisticUpdate = useCallback((id: string, data: T, rollback: () => void) => {
    const update: OptimisticUpdate<T> = {
      id,
      data,
      timestamp: Date.now(),
      rollback,
    };

    setOptimisticUpdates(prev => [...prev, update]);

    // Auto-remove after 30 seconds if not manually removed
    setTimeout(() => {
      removeOptimisticUpdate(id);
    }, 30000);

    return update;
  }, []);

  const removeOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => prev.filter(update => update.id !== id));
  }, []);

  const rollbackOptimisticUpdate = useCallback((id: string) => {
    const update = optimisticUpdates.find(u => u.id === id);
    if (update) {
      update.rollback();
      removeOptimisticUpdate(id);
    }
  }, [optimisticUpdates, removeOptimisticUpdate]);

  const clearOptimisticUpdates = useCallback(() => {
    optimisticUpdates.forEach(update => update.rollback());
    setOptimisticUpdates([]);
  }, [optimisticUpdates]);

  return {
    optimisticUpdates,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    rollbackOptimisticUpdate,
    clearOptimisticUpdates,
  };
}

/**
 * Advanced API hook with caching, deduplication, and optimistic updates
 */
export interface UseOptimizedApiOptions<T> {
  cacheKey?: string;
  cacheTTL?: number; // minutes
  enableDeduplication?: boolean;
  enableOptimisticUpdates?: boolean;
  staleWhileRevalidate?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onOptimisticUpdate?: (data: T) => void;
  onOptimisticRollback?: () => void;
}

export function useOptimizedApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseOptimizedApiOptions<T> = {}
) {
  const {
    cacheKey,
    cacheTTL = 5,
    enableDeduplication = true,
    enableOptimisticUpdates = false,
    staleWhileRevalidate = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onOptimisticUpdate,
    onOptimisticRollback,
  } = options;

  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: ApiError | null;
    success: boolean;
    isStale: boolean;
  }>({
    data: null,
    loading: false,
    error: null,
    success: false,
    isStale: false,
  });

  const cache = useApiCache<T>(cacheKey || '', cacheTTL);
  const deduplicator = RequestDeduplicator.getInstance();
  const { addOptimisticUpdate, removeOptimisticUpdate } = useOptimisticUpdates<T>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate request key for deduplication
  const generateRequestKey = useCallback((...args: P) => {
    return `${apiFunction.toString()}-${JSON.stringify(args)}`;
  }, [apiFunction]);

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const requestKey = generateRequestKey(...args);

      // Check cache first
      if (cacheKey && cache.data && !cache.isExpired) {
        setState(prev => ({
          ...prev,
          data: cache.data,
          loading: false,
          error: null,
          success: true,
          isStale: false,
        }));

        // If stale-while-revalidate is enabled, fetch fresh data in background
        if (staleWhileRevalidate) {
          setState(prev => ({ ...prev, isStale: true }));
          // Continue with fresh fetch
        } else {
          onSuccess?.(cache.data);
          return cache.data;
        }
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      const performRequest = async (): Promise<T> => {
        const attemptRequest = async (attempt: number): Promise<T> => {
          try {
            const result = await apiFunction(...args);
            
            // Check if request was aborted
            if (abortControllerRef.current?.signal.aborted) {
              throw new Error('Request aborted');
            }

            return result;
          } catch (error) {
            if (abortControllerRef.current?.signal.aborted) {
              throw error;
            }

            if (attempt < retryAttempts) {
              await new Promise(resolve => 
                setTimeout(resolve, retryDelay * Math.pow(2, attempt))
              );
              return attemptRequest(attempt + 1);
            }
            throw error;
          }
        };

        return attemptRequest(0);
      };

      try {
        let result: T;

        if (enableDeduplication) {
          result = await deduplicator.deduplicate(requestKey, performRequest);
        } else {
          result = await performRequest();
        }

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        // Update cache
        if (cacheKey) {
          cache.setData(result);
        }

        setState({
          data: result,
          loading: false,
          error: null,
          success: true,
          isStale: false,
        });

        onSuccess?.(result);
        return result;
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        const apiError = error as ApiError;
        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError,
          success: false,
          isStale: false,
        }));

        onError?.(apiError);
        throw apiError;
      }
    },
    [
      apiFunction,
      generateRequestKey,
      cacheKey,
      cache,
      staleWhileRevalidate,
      enableDeduplication,
      deduplicator,
      retryAttempts,
      retryDelay,
      onSuccess,
      onError,
    ]
  );

  const executeOptimistic = useCallback(
    async (optimisticData: T, ...args: P): Promise<T | null> => {
      if (!enableOptimisticUpdates) {
        return execute(...args);
      }

      const optimisticId = `${Date.now()}-${Math.random()}`;
      const previousData = state.data;

      // Apply optimistic update
      setState(prev => ({
        ...prev,
        data: optimisticData,
        isStale: false,
      }));

      onOptimisticUpdate?.(optimisticData);

      // Add optimistic update with rollback
      const rollback = () => {
        setState(prev => ({
          ...prev,
          data: previousData,
        }));
        onOptimisticRollback?.();
      };

      addOptimisticUpdate(optimisticId, optimisticData, rollback);

      try {
        const result = await execute(...args);
        removeOptimisticUpdate(optimisticId);
        return result;
      } catch (error) {
        // Rollback on error
        rollback();
        removeOptimisticUpdate(optimisticId);
        throw error;
      }
    },
    [
      enableOptimisticUpdates,
      execute,
      state.data,
      onOptimisticUpdate,
      onOptimisticRollback,
      addOptimisticUpdate,
      removeOptimisticUpdate,
    ]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
      isStale: false,
    });

    if (cacheKey) {
      cache.clearCache();
    }

    if (enableDeduplication) {
      deduplicator.clear();
    }
  }, [cacheKey, cache, enableDeduplication, deduplicator]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      cache.clearCache();
    }
  }, [cacheKey, cache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    executeOptimistic,
    reset,
    invalidateCache,
    isCached: Boolean(cacheKey && cache.data && !cache.isExpired),
  };
}

/**
 * Batch API requests hook
 */
export interface BatchRequest<T> {
  key: string;
  request: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export function useBatchApi() {
  const [batchState, setBatchState] = useState<{
    loading: boolean;
    results: Record<string, any>;
    errors: Record<string, ApiError>;
  }>({
    loading: false,
    results: {},
    errors: {},
  });

  const executeBatch = useCallback(async <T>(requests: BatchRequest<T>[]) => {
    setBatchState(prev => ({
      ...prev,
      loading: true,
      errors: {},
    }));

    const promises = requests.map(async ({ key, request, onSuccess, onError }) => {
      try {
        const result = await request();
        onSuccess?.(result);
        return { key, result, error: null };
      } catch (error) {
        const apiError = error as ApiError;
        onError?.(apiError);
        return { key, result: null, error: apiError };
      }
    });

    try {
      const results = await Promise.all(promises);
      
      const successResults: Record<string, any> = {};
      const errorResults: Record<string, ApiError> = {};

      results.forEach(({ key, result, error }) => {
        if (error) {
          errorResults[key] = error;
        } else {
          successResults[key] = result;
        }
      });

      setBatchState({
        loading: false,
        results: successResults,
        errors: errorResults,
      });

      return { results: successResults, errors: errorResults };
    } catch (error) {
      setBatchState(prev => ({
        ...prev,
        loading: false,
      }));
      throw error;
    }
  }, []);

  return {
    ...batchState,
    executeBatch,
  };
}

/**
 * Prefetch hook for preloading data
 */
export function usePrefetch() {
  const prefetchedData = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  const prefetch = useCallback(async <T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ) => {
    const cached = prefetchedData.current.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }

    try {
      const data = await fetchFunction();
      prefetchedData.current.set(key, {
        data,
        timestamp: Date.now(),
      });
      return data;
    } catch (error) {
      console.error(`Prefetch failed for key ${key}:`, error);
      throw error;
    }
  }, []);

  const getPrefetchedData = useCallback(<T>(key: string): T | null => {
    const cached = prefetchedData.current.get(key);
    return cached ? cached.data : null;
  }, []);

  const clearPrefetchedData = useCallback((key?: string) => {
    if (key) {
      prefetchedData.current.delete(key);
    } else {
      prefetchedData.current.clear();
    }
  }, []);

  return {
    prefetch,
    getPrefetchedData,
    clearPrefetchedData,
  };
}
