import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { analyticsApi } from '../services/api';
import type { 
  DashboardMetrics, 
  AnalyticsTimeRange, 
  ChartData, 
  SystemHealth,
  UserActivity,
  EnvironmentalImpact 
} from '../types/analytics';

export const useAnalytics = () => {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('7d');
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null);

  // Dashboard metrics
  const {
    data: metricsData,
    loading: metricsLoading,
    error: metricsError,
    execute: fetchMetrics,
  } = useApi(analyticsApi.getDashboardMetrics);

  // System health
  const {
    data: healthData,
    loading: healthLoading,
    error: healthError,
    execute: fetchHealth,
  } = useApi(analyticsApi.getSystemHealth);

  // User activity
  const {
    data: activityData,
    loading: activityLoading,
    error: activityError,
    execute: fetchActivity,
  } = useApi(analyticsApi.getUserActivity);

  // Environmental impact
  const {
    data: impactData,
    loading: impactLoading,
    error: impactError,
    execute: fetchImpact,
  } = useApi(analyticsApi.getEnvironmentalImpact);

  // Chart data
  const {
    data: chartData,
    loading: chartLoading,
    error: chartError,
    execute: fetchChartData,
  } = useApi(analyticsApi.getChartData);

  // Load dashboard metrics
  const loadDashboardMetrics = useCallback(async (range?: AnalyticsTimeRange) => {
    try {
      const data = await fetchMetrics(range || timeRange);
      if (data) {
        setDashboardMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    }
  }, [fetchMetrics, timeRange]);

  // Load system health
  const loadSystemHealth = useCallback(async () => {
    try {
      const data = await fetchHealth();
      if (data) {
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  }, [fetchHealth]);

  // Load user activity
  const loadUserActivity = useCallback(async (range?: AnalyticsTimeRange) => {
    try {
      const data = await fetchActivity(range || timeRange);
      if (data) {
        setUserActivity(data);
      }
    } catch (error) {
      console.error('Failed to load user activity:', error);
    }
  }, [fetchActivity, timeRange]);

  // Load environmental impact
  const loadEnvironmentalImpact = useCallback(async (range?: AnalyticsTimeRange) => {
    try {
      const data = await fetchImpact(range || timeRange);
      if (data) {
        setEnvironmentalImpact(data);
      }
    } catch (error) {
      console.error('Failed to load environmental impact:', error);
    }
  }, [fetchImpact, timeRange]);

  // Load chart data
  const loadChartData = useCallback(async (chartType: string, range?: AnalyticsTimeRange) => {
    try {
      const data = await fetchChartData(chartType, range || timeRange);
      return data;
    } catch (error) {
      console.error('Failed to load chart data:', error);
      return null;
    }
  }, [fetchChartData, timeRange]);

  // Load all analytics data
  const loadAllAnalytics = useCallback(async (range?: AnalyticsTimeRange) => {
    const selectedRange = range || timeRange;
    await Promise.all([
      loadDashboardMetrics(selectedRange),
      loadSystemHealth(),
      loadUserActivity(selectedRange),
      loadEnvironmentalImpact(selectedRange),
    ]);
  }, [loadDashboardMetrics, loadSystemHealth, loadUserActivity, loadEnvironmentalImpact, timeRange]);

  // Update time range and refresh data
  const updateTimeRange = useCallback(async (newRange: AnalyticsTimeRange) => {
    setTimeRange(newRange);
    await loadAllAnalytics(newRange);
  }, [loadAllAnalytics]);

  // Refresh all data
  const refreshAnalytics = useCallback(async () => {
    await loadAllAnalytics();
  }, [loadAllAnalytics]);

  // Calculate percentage change
  const calculateChange = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);

  // Format metrics for display
  const formatMetric = useCallback((value: number, type: 'number' | 'currency' | 'percentage' = 'number'): string => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
          minimumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toLocaleString();
    }
  }, []);

  // Get system health status
  const getHealthStatus = useCallback(() => {
    if (!systemHealth) return 'unknown';
    
    const { cpu_usage, memory_usage, disk_usage, response_time } = systemHealth;
    
    if (cpu_usage > 80 || memory_usage > 80 || disk_usage > 90 || response_time > 1000) {
      return 'critical';
    } else if (cpu_usage > 60 || memory_usage > 60 || disk_usage > 70 || response_time > 500) {
      return 'warning';
    }
    return 'healthy';
  }, [systemHealth]);

  // Load initial data
  useEffect(() => {
    loadAllAnalytics();
  }, [loadAllAnalytics]);

  // Auto-refresh system health every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadSystemHealth]);

  return {
    // Data
    dashboardMetrics,
    systemHealth,
    userActivity,
    environmentalImpact,
    timeRange,

    // Loading states
    metricsLoading,
    healthLoading,
    activityLoading,
    impactLoading,
    chartLoading,

    // Error states
    metricsError,
    healthError,
    activityError,
    impactError,
    chartError,

    // Actions
    loadDashboardMetrics,
    loadSystemHealth,
    loadUserActivity,
    loadEnvironmentalImpact,
    loadChartData,
    loadAllAnalytics,
    updateTimeRange,
    refreshAnalytics,

    // Utilities
    calculateChange,
    formatMetric,
    getHealthStatus,
  };
};
