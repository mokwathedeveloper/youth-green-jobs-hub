import { useEffect, useCallback, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMountTime: number;
  memoryUsage?: number;
  networkRequests: number;
  cacheHits: number;
  cacheMisses: number;
}

interface UsePerformanceOptions {
  trackRender?: boolean;
  trackMemory?: boolean;
  trackNetwork?: boolean;
  trackCache?: boolean;
  reportInterval?: number;
}

export const usePerformance = (
  componentName: string,
  options: UsePerformanceOptions = {}
) => {
  const {
    trackRender = true,
    trackMemory = false,
    trackNetwork = false,
    trackCache = false,
    reportInterval = 10000, // 10 seconds
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMountTime: 0,
    networkRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
  });

  const mountTime = useRef<number>(Date.now());
  const renderStartTime = useRef<number>(0);
  const networkRequestCount = useRef<number>(0);
  const cacheHitCount = useRef<number>(0);
  const cacheMissCount = useRef<number>(0);

  // Track component mount time
  useEffect(() => {
    const mountDuration = Date.now() - mountTime.current;
    setMetrics(prev => ({
      ...prev,
      componentMountTime: mountDuration,
    }));
  }, []);

  // Track render performance
  const startRender = useCallback(() => {
    if (trackRender) {
      renderStartTime.current = performance.now();
    }
  }, [trackRender]);

  const endRender = useCallback(() => {
    if (trackRender && renderStartTime.current > 0) {
      const renderDuration = performance.now() - renderStartTime.current;
      setMetrics(prev => ({
        ...prev,
        renderTime: renderDuration,
      }));
    }
  }, [trackRender]);

  // Track memory usage
  const getMemoryUsage = useCallback(() => {
    if (trackMemory && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, [trackMemory]);

  // Track network requests
  const trackNetworkRequest = useCallback(() => {
    if (trackNetwork) {
      networkRequestCount.current += 1;
      setMetrics(prev => ({
        ...prev,
        networkRequests: networkRequestCount.current,
      }));
    }
  }, [trackNetwork]);

  // Track cache performance
  const trackCacheHit = useCallback(() => {
    if (trackCache) {
      cacheHitCount.current += 1;
      setMetrics(prev => ({
        ...prev,
        cacheHits: cacheHitCount.current,
      }));
    }
  }, [trackCache]);

  const trackCacheMiss = useCallback(() => {
    if (trackCache) {
      cacheMissCount.current += 1;
      setMetrics(prev => ({
        ...prev,
        cacheMisses: cacheMissCount.current,
      }));
    }
  }, [trackCache]);

  // Performance reporting
  const reportMetrics = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    const report = {
      component: componentName,
      timestamp: new Date().toISOString(),
      metrics: {
        ...metrics,
        memoryUsage: memoryUsage?.used,
      },
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 Performance Report: ${componentName}`);
      console.log('Render Time:', `${metrics.renderTime.toFixed(2)}ms`);
      console.log('Mount Time:', `${metrics.componentMountTime}ms`);
      console.log('Network Requests:', metrics.networkRequests);
      console.log('Cache Hits:', metrics.cacheHits);
      console.log('Cache Misses:', metrics.cacheMisses);
      if (memoryUsage) {
        console.log('Memory Usage:', `${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB`);
      }
      console.groupEnd();
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // This would integrate with your analytics service
      // analytics.track('performance_metrics', report);
    }

    return report;
  }, [componentName, metrics, getMemoryUsage]);

  // Periodic reporting
  useEffect(() => {
    const interval = setInterval(reportMetrics, reportInterval);
    return () => clearInterval(interval);
  }, [reportMetrics, reportInterval]);

  return {
    metrics,
    startRender,
    endRender,
    trackNetworkRequest,
    trackCacheHit,
    trackCacheMiss,
    reportMetrics,
    getMemoryUsage,
  };
};

// Hook for measuring async operations
export const useAsyncPerformance = () => {
  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      }

      throw error;
    }
  }, []);

  return { measureAsync };
};

// Hook for bundle size analysis
export const useBundleAnalysis = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    totalSize: number;
    gzippedSize: number;
    chunks: Array<{ name: string; size: number }>;
  } | null>(null);

  useEffect(() => {
    // This would integrate with webpack-bundle-analyzer or similar
    // For now, we'll just track basic metrics
    if (process.env.NODE_ENV === 'development') {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const totalSize = scripts.reduce((total, script) => {
        // This is a rough estimation
        return total + (script.textContent?.length || 0);
      }, 0);

      setBundleInfo({
        totalSize,
        gzippedSize: totalSize * 0.3, // Rough estimation
        chunks: scripts.map((script, index) => ({
          name: script.getAttribute('src') || `chunk-${index}`,
          size: script.textContent?.length || 0,
        })),
      });
    }
  }, []);

  return bundleInfo;
};

// Performance monitoring wrapper component
export const withPerformanceMonitoring = function<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.forwardRef<any, P>((props, ref) => {
    const { startRender, endRender } = usePerformance(componentName);

    useEffect(() => {
      startRender();
      return () => endRender();
    });

    return React.createElement(Component, { ...props, ref });
  });
};
