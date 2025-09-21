import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Recycle, 
  Coins, 
  TrendingUp, 
  RefreshCw,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import KPICard from './KPICard';
import ChartCard from './ChartCard';
import SystemHealthCard from './SystemHealthCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import type { AnalyticsTimeRange } from '../../types/analytics';

const AnalyticsDashboard: React.FC = () => {
  const {
    dashboardMetrics,
    systemHealth,
    userActivity,
    environmentalImpact,
    timeRange,
    metricsLoading,
    healthLoading,
    metricsError,
    updateTimeRange,
    refreshAnalytics,
    formatMetric,
    calculateChange,
    getHealthStatus,
  } = useAnalytics();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeRangeOptions: { value: AnalyticsTimeRange; label: string }[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
  ];

  const handleTimeRangeChange = async (newRange: AnalyticsTimeRange) => {
    await updateTimeRange(newRange);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    // Implementation for data export
    console.log('Exporting analytics data...');
  };

  if (metricsLoading && !dashboardMetrics) {
    return <LoadingSpinner size="lg" text="Loading analytics dashboard..." className="py-12" />;
  }

  if (metricsError && !dashboardMetrics) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load analytics data</div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Monitor your environmental impact and platform performance
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as AnalyticsTimeRange)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportData}
              className="flex items-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {dashboardMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Users"
              value={dashboardMetrics.total_users}
              change={calculateChange(dashboardMetrics.total_users, dashboardMetrics.previous_total_users || 0)}
              changeLabel="vs previous period"
              icon={<Users className="w-6 h-6" />}
              color="blue"
              loading={metricsLoading}
            />
            
            <KPICard
              title="Waste Collected"
              value={`${formatMetric(dashboardMetrics.total_waste_collected)} kg`}
              change={calculateChange(dashboardMetrics.total_waste_collected, dashboardMetrics.previous_waste_collected || 0)}
              changeLabel="vs previous period"
              icon={<Recycle className="w-6 h-6" />}
              color="green"
              loading={metricsLoading}
            />
            
            <KPICard
              title="Credits Earned"
              value={formatMetric(dashboardMetrics.total_credits_earned)}
              change={calculateChange(dashboardMetrics.total_credits_earned, dashboardMetrics.previous_credits_earned || 0)}
              changeLabel="vs previous period"
              icon={<Coins className="w-6 h-6" />}
              color="yellow"
              loading={metricsLoading}
            />
            
            <KPICard
              title="Active Reports"
              value={dashboardMetrics.active_reports}
              change={calculateChange(dashboardMetrics.active_reports, dashboardMetrics.previous_active_reports || 0)}
              changeLabel="vs previous period"
              icon={<BarChart3 className="w-6 h-6" />}
              color="purple"
              loading={metricsLoading}
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Waste Collection Trends"
            chartType="line"
            timeRange={timeRange}
            className="lg:col-span-1"
          />
          
          <ChartCard
            title="User Activity"
            chartType="bar"
            timeRange={timeRange}
            className="lg:col-span-1"
          />
        </div>

        {/* System Health and Environmental Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SystemHealthCard
            health={systemHealth}
            loading={healthLoading}
            status={getHealthStatus()}
            className="lg:col-span-1"
          />
          
          {environmentalImpact && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatMetric(environmentalImpact.co2_saved)} kg
                    </div>
                    <div className="text-sm text-gray-600">CO₂ Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatMetric(environmentalImpact.water_saved)} L
                    </div>
                    <div className="text-sm text-gray-600">Water Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatMetric(environmentalImpact.energy_saved)} kWh
                    </div>
                    <div className="text-sm text-gray-600">Energy Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        {userActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-600">{activity.user_name}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AnalyticsDashboard;
