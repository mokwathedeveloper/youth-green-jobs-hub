import { useState, useEffect, useCallback } from 'react';
import { authApi, wasteApi, productsApi, analyticsApi } from '../services/api';
import type { User } from '../types/auth';
import type { WasteReportListItem } from '../types/waste';
import type { ProductListItem } from '../types/products';

// Generic admin data hook for consistent data loading patterns
export const useAdminData = <T>(
  dataLoader: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dataLoader();
      setData(result);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
};

// Specific hooks for each admin section
export const useAdminUsers = () => {
  return useAdminData(async () => {
    const usersResponse = await authApi.getUsers({ page_size: 100 });
    const allUsers = usersResponse.results || usersResponse;
    
    const stats = {
      total_users: allUsers.length,
      youth_users: allUsers.filter((u: User) => u.is_youth).length,
      verified_users: allUsers.filter((u: User) => u.is_verified).length,
      staff_users: allUsers.filter((u: User) => u.is_staff || u.is_superuser).length,
      new_users_today: allUsers.filter((u: User) => {
        const today = new Date().toDateString();
        return new Date(u.date_joined || '').toDateString() === today;
      }).length
    };

    return { users: allUsers, stats };
  });
};

export const useAdminWaste = () => {
  return useAdminData(async () => {
    const [reportsResponse, categoriesData, collectionPointsData] = await Promise.all([
      wasteApi.getWasteReports({ page_size: 100 }),
      wasteApi.getCategories(),
      wasteApi.getCollectionPoints({ page_size: 100 })
    ]);

    const allReports = reportsResponse.results || [];
    const stats = {
      total_reports: allReports.length,
      pending_reports: allReports.filter((r: WasteReportListItem) => r.status === 'reported').length,
      verified_reports: allReports.filter((r: WasteReportListItem) => r.status === 'verified').length,
      collected_reports: allReports.filter((r: WasteReportListItem) => r.status === 'collected').length,
      total_waste_kg: allReports.reduce((sum: number, r: WasteReportListItem) => sum + (parseFloat(r.actual_weight || r.estimated_weight || '0') || 0), 0),
      total_credits_awarded: allReports.reduce((sum: number, r: WasteReportListItem) => sum + (typeof r.credits_awarded === 'number' ? r.credits_awarded : 0), 0)
    };

    return {
      reports: allReports,
      categories: categoriesData,
      collectionPoints: collectionPointsData.results || [],
      stats
    };
  });
};

export const useAdminProducts = () => {
  return useAdminData(async () => {
    const [productsResponse, vendorsData, categoriesData] = await Promise.all([
      productsApi.getProducts({ page_size: '100' }),
      productsApi.getVendors({ page_size: '100' }),
      productsApi.getProductCategories()
    ]);

    const allProducts = productsResponse.results || [];
    const allVendors = vendorsData.results || [];
    
    const stats = {
      total_products: allProducts.length,
      pending_products: allProducts.filter((p: ProductListItem) => !p.is_featured).length,
      approved_products: allProducts.filter((p: ProductListItem) => p.is_featured).length,
      total_vendors: allVendors.length,
      total_categories: categoriesData.length,
      total_sales: allProducts.reduce((sum: number, p: ProductListItem) => sum + (p.total_sales || 0), 0)
    };

    return {
      products: allProducts,
      vendors: allVendors,
      categories: categoriesData,
      stats
    };
  });
};

export const useAdminAnalytics = () => {
  return useAdminData(async () => {
    const [
      summaryData,
      wasteData,
      userData,
      marketplaceData,
      alertsData,
      healthData
    ] = await Promise.all([
      analyticsApi.getDashboardSummary(),
      analyticsApi.getWasteCollectionTrends(30),
      analyticsApi.getUserGrowthTrends(30),
      analyticsApi.getMarketplaceTrends(30),
      analyticsApi.getDashboardAlerts({ is_active: 'true' } as any),
      analyticsApi.getSystemHealth()
    ]);

    return {
      summary: summaryData,
      wasteChartData: wasteData,
      userChartData: userData,
      marketplaceChartData: marketplaceData,
      alerts: alertsData.results,
      systemHealth: healthData
    };
  });
};

// Reusable export functionality
export const useDataExport = () => {
  const exportToCSV = useCallback((data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, '_')] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const exportToText = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  return { exportToCSV, exportToText };
};

// Reusable admin actions
export const useAdminActions = () => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const performAction = useCallback(async (
    actionId: string,
    action: () => Promise<void>,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    try {
      setActionLoading(actionId);
      await action();
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Action failed';
      onError?.(errorMessage);
      console.error(`Action ${actionId} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  return {
    performAction,
    actionLoading,
    isActionLoading: (actionId: string) => actionLoading === actionId
  };
};

// Combined hook for admin dashboard
export const useAdminDashboard = () => {
  const analytics = useAdminAnalytics();
  const { exportToCSV, exportToText } = useDataExport();
  const { performAction, actionLoading } = useAdminActions();

  const exportAnalyticsData = useCallback(() => {
    if (!analytics.data?.summary) return;

    const summary = analytics.data.summary;
    const csvData = [
      { metric: 'Total Users', value: summary.total_users, growth: summary.user_growth || 'N/A' },
      { metric: 'Waste Collected (kg)', value: summary.total_waste_collected, growth: summary.waste_growth || 'N/A' },
      { metric: 'Total Sales (KSh)', value: summary.total_sales, growth: summary.sales_growth || 'N/A' },
      { metric: 'CO2 Reduced (kg)', value: summary.total_co2_reduced, growth: 'N/A' },
      { metric: 'New Users Today', value: summary.users_today, growth: 'N/A' },
      { metric: 'Waste Today (kg)', value: summary.waste_collected_today, growth: 'N/A' },
      { metric: 'Orders Today', value: summary.orders_today, growth: 'N/A' },
      { metric: 'Credits Earned Today', value: summary.credits_earned_today, growth: 'N/A' }
    ];

    exportToCSV(csvData, 'analytics_summary', ['Metric', 'Value', 'Growth']);
  }, [analytics.data, exportToCSV]);

  const exportSystemReport = useCallback(() => {
    if (!analytics.data?.summary || !analytics.data?.systemHealth) return;

    const { summary, systemHealth, alerts } = analytics.data;
    const reportContent = `
YOUTH GREEN JOBS & WASTE RECYCLING HUB
SYSTEM ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

=== PLATFORM OVERVIEW ===
Total Users: ${summary.total_users}
User Growth: ${summary.user_growth || 'N/A'}
New Users Today: ${summary.users_today}

=== WASTE MANAGEMENT ===
Total Waste Collected: ${summary.total_waste_collected} kg
Waste Growth: ${summary.waste_growth || 'N/A'}
Waste Collected Today: ${summary.waste_collected_today} kg
CO2 Reduced: ${summary.total_co2_reduced} kg

=== MARKETPLACE ===
Total Sales: KSh ${summary.total_sales}
Sales Growth: ${summary.sales_growth || 'N/A'}
Orders Today: ${summary.orders_today}
Credits Earned Today: ${summary.credits_earned_today}

=== SYSTEM HEALTH ===
Overall Status: ${systemHealth.status}
CPU Usage: ${systemHealth.cpu_usage}%
Memory Usage: ${systemHealth.memory_usage}%
Disk Usage: ${systemHealth.disk_usage}%
Response Time: ${systemHealth.response_time}ms
Active Alerts: ${systemHealth.active_alerts}

=== ACTIVE ALERTS ===
${alerts.length > 0 ? alerts.map(alert => `- ${alert.title}: ${alert.message}`).join('\n') : 'No active alerts'}

Report generated by Youth Green Jobs Hub Admin Dashboard
    `.trim();

    exportToText(reportContent, 'system_report');
  }, [analytics.data, exportToText]);

  return {
    ...analytics,
    exportAnalyticsData,
    exportSystemReport,
    performAction,
    actionLoading
  };
};
