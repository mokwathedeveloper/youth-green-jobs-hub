import { useCallback } from 'react';
import { wasteApi } from '../services/api';
import { useApi, usePaginatedApi } from './useApi';
import type {
  WasteCategory,
  CollectionPoint,
  WasteReport,
  CollectionEvent,
  DashboardStats,
  WasteReportFormData,
  CollectionEventFormData,
  WasteReportFilters,
  CollectionEventFilters,
  CreditTransactionFilters,
  MapLocation,
} from '../types/waste';

export const useWaste = () => {
  // Dashboard stats
  const dashboardStatsApi = useApi(wasteApi.getDashboardStats);

  // Waste categories
  const categoriesApi = useApi(wasteApi.getCategories, { immediate: true });

  // Collection points
  const collectionPointsApi = useApi(wasteApi.getCollectionPoints);
  const nearbyPointsApi = useApi(wasteApi.getNearbyCollectionPoints);

  // Waste reports
  // Create wrapper functions to make API methods compatible with usePaginatedApi
  const getWasteReportsWrapper = async (page: number, pageSize: number) => {
    const response = await wasteApi.getWasteReports({ page, page_size: pageSize });
    return {
      data: response.results,
      total: response.count,
      hasMore: !!response.next
    };
  };

  const reportsApi = usePaginatedApi(getWasteReportsWrapper);
  const createReportApi = useApi(wasteApi.createWasteReport, {
    onSuccess: () => {
      // Refresh reports and dashboard stats
      reportsApi.refresh();
      dashboardStatsApi.execute();
    },
  });

  // Collection events
  const getCollectionEventsWrapper = async (page: number, pageSize: number) => {
    const response = await wasteApi.getCollectionEvents({ page, page_size: pageSize });
    return {
      data: response.results,
      total: response.count,
      hasMore: !!response.next
    };
  };

  const eventsApi = usePaginatedApi(getCollectionEventsWrapper);
  const createEventApi = useApi(wasteApi.createCollectionEvent, {
    onSuccess: () => {
      eventsApi.refresh();
    },
  });
  const joinEventApi = useApi(wasteApi.joinCollectionEvent, {
    onSuccess: () => {
      eventsApi.refresh();
    },
  });
  const leaveEventApi = useApi(wasteApi.leaveCollectionEvent, {
    onSuccess: () => {
      eventsApi.refresh();
    },
  });

  // Credit transactions
  const getCreditTransactionsWrapper = async (page: number, pageSize: number) => {
    const response = await wasteApi.getCreditTransactions({ page, page_size: pageSize });
    return {
      data: response.results,
      total: response.count,
      hasMore: !!response.next
    };
  };

  const transactionsApi = usePaginatedApi(getCreditTransactionsWrapper);

  // Convenience methods
  const loadDashboardStats = useCallback(() => {
    return dashboardStatsApi.execute();
  }, [dashboardStatsApi]);

  const loadCollectionPoints = useCallback((filters?: any) => {
    return collectionPointsApi.execute(filters);
  }, [collectionPointsApi]);

  const loadNearbyPoints = useCallback(
    (latitude: number, longitude: number, radius?: number) => {
      return nearbyPointsApi.execute(latitude, longitude, radius);
    },
    [nearbyPointsApi]
  );

  const loadWasteReports = useCallback((filters?: WasteReportFilters) => {
    return reportsApi.refresh();
  }, [reportsApi]);

  const createWasteReport = useCallback(
    (data: WasteReportFormData) => {
      return createReportApi.execute(data);
    },
    [createReportApi]
  );

  const loadCollectionEvents = useCallback((filters?: CollectionEventFilters) => {
    return eventsApi.refresh();
  }, [eventsApi]);

  const createCollectionEvent = useCallback(
    (data: CollectionEventFormData) => {
      return createEventApi.execute(data);
    },
    [createEventApi]
  );

  const joinCollectionEvent = useCallback(
    (eventId: string) => {
      return joinEventApi.execute(eventId);
    },
    [joinEventApi]
  );

  const leaveCollectionEvent = useCallback(
    (eventId: string) => {
      return leaveEventApi.execute(eventId);
    },
    [leaveEventApi]
  );

  const loadCreditTransactions = useCallback((filters?: CreditTransactionFilters) => {
    return transactionsApi.refresh();
  }, [transactionsApi]);

  const loadMoreReports = useCallback(() => {
    return reportsApi.loadMore();
  }, [reportsApi]);

  const loadMoreEvents = useCallback(() => {
    return eventsApi.loadMore();
  }, [eventsApi]);

  const loadMoreTransactions = useCallback(() => {
    return transactionsApi.loadMore();
  }, [transactionsApi]);

  // Get user's total credits
  const getTotalCredits = useCallback(() => {
    return dashboardStatsApi.data?.total_credits || 0;
  }, [dashboardStatsApi.data]);

  // Get user's total waste collected
  const getTotalWasteCollected = useCallback(() => {
    return dashboardStatsApi.data?.total_waste_collected || 0;
  }, [dashboardStatsApi.data]);

  // Get environmental impact
  const getEnvironmentalImpact = useCallback(() => {
    return {
      co2_saved: dashboardStatsApi.data?.co2_saved || 0,
      trees_saved: dashboardStatsApi.data?.trees_saved || 0,
      water_saved: dashboardStatsApi.data?.water_saved || 0,
    };
  }, [dashboardStatsApi.data]);

  return {
    // State
    dashboardStats: dashboardStatsApi.data,
    categories: categoriesApi.data || [],
    collectionPoints: collectionPointsApi.data || [],
    nearbyPoints: nearbyPointsApi.data?.results || [],
    wasteReports: reportsApi.data,
    collectionEvents: eventsApi.data,
    creditTransactions: transactionsApi.data,

    // Loading states
    dashboardLoading: dashboardStatsApi.loading,
    categoriesLoading: categoriesApi.loading,
    collectionPointsLoading: collectionPointsApi.loading,
    nearbyPointsLoading: nearbyPointsApi.loading,
    reportsLoading: reportsApi.loading,
    eventsLoading: eventsApi.loading,
    transactionsLoading: transactionsApi.loading,
    createReportLoading: createReportApi.loading,
    createEventLoading: createEventApi.loading,
    joinEventLoading: joinEventApi.loading,
    leaveEventLoading: leaveEventApi.loading,

    // Error states
    dashboardError: dashboardStatsApi.error,
    categoriesError: categoriesApi.error,
    collectionPointsError: collectionPointsApi.error,
    nearbyPointsError: nearbyPointsApi.error,
    reportsError: reportsApi.error,
    eventsError: eventsApi.error,
    transactionsError: transactionsApi.error,
    createReportError: createReportApi.error,
    createEventError: createEventApi.error,
    joinEventError: joinEventApi.error,
    leaveEventError: leaveEventApi.error,

    // Pagination
    hasMoreReports: reportsApi.hasMore,
    hasMoreEvents: eventsApi.hasMore,
    hasMoreTransactions: transactionsApi.hasMore,
    reportsCount: reportsApi.totalCount,
    eventsCount: eventsApi.totalCount,
    transactionsCount: transactionsApi.totalCount,

    // Actions
    loadDashboardStats,
    loadCollectionPoints,
    loadNearbyPoints,
    loadWasteReports,
    createWasteReport,
    loadCollectionEvents,
    createCollectionEvent,
    joinCollectionEvent,
    leaveCollectionEvent,
    loadCreditTransactions,
    loadMoreReports,
    loadMoreEvents,
    loadMoreTransactions,

    // Utility methods
    getTotalCredits,
    getTotalWasteCollected,
    getEnvironmentalImpact,

    // Reset methods
    resetCreateReportError: createReportApi.reset,
    resetCreateEventError: createEventApi.reset,
    resetJoinEventError: joinEventApi.reset,
    resetLeaveEventError: leaveEventApi.reset,
  };
};
