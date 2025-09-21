import { useMemo, useCallback, useRef, useEffect } from 'react';

// Enhanced useMemo with cache size limit
export const useMemoWithLimit = <T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheSize: number = 10
): T => {
  const cache = useRef<Map<string, T>>(new Map());
  const keyHistory = useRef<string[]>([]);

  const key = JSON.stringify(deps);

  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key)!;
    }

    const value = factory();
    
    // Add to cache
    cache.current.set(key, value);
    keyHistory.current.push(key);

    // Limit cache size
    if (keyHistory.current.length > cacheSize) {
      const oldestKey = keyHistory.current.shift()!;
      cache.current.delete(oldestKey);
    }

    return value;
  }, deps);
};

// Debounced callback
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttled callback
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay, ...deps]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

// Memoized value with expiration
export const useMemoWithExpiration = <T>(
  factory: () => T,
  deps: React.DependencyList,
  ttl: number = 60000 // 1 minute default
): T => {
  const cache = useRef<{ value: T; timestamp: number } | null>(null);

  return useMemo(() => {
    const now = Date.now();
    
    if (cache.current && (now - cache.current.timestamp) < ttl) {
      return cache.current.value;
    }

    const value = factory();
    cache.current = { value, timestamp: now };
    return value;
  }, deps);
};

// Deep comparison memoization
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T } | null>(null);

  const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  };

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
};

// Stable reference hook
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// Memoized object with stable references
export const useStableObject = <T extends Record<string, any>>(obj: T): T => {
  const keys = Object.keys(obj).sort();
  const values = keys.map(key => obj[key]);

  return useMemo(() => {
    const result = {} as T;
    keys.forEach((key, index) => {
      result[key as keyof T] = values[index];
    });
    return result;
  }, values);
};

// Computed value with dependencies
export const useComputed = <T, D extends readonly unknown[]>(
  compute: (...deps: D) => T,
  deps: D
): T => {
  return useMemo(() => compute(...deps), deps);
};

// Lazy initialization
export const useLazyMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): (() => T) => {
  const valueRef = useRef<T | null>(null);
  const depsRef = useRef<React.DependencyList | null>(null);
  const initializedRef = useRef(false);

  return useCallback(() => {
    const depsChanged = !depsRef.current || 
      deps.length !== depsRef.current.length ||
      deps.some((dep, index) => dep !== depsRef.current![index]);

    if (!initializedRef.current || depsChanged) {
      valueRef.current = factory();
      depsRef.current = deps;
      initializedRef.current = true;
    }

    return valueRef.current!;
  }, deps);
};
