import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Recycle, 
  ShoppingCart, 
  TrendingUp, 
  Leaf, 
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';
import { KPICard, ChartCard, AlertCard, SystemHealthCard } from '../../components/analytics';
import { analyticsApi } from '../../services/api';
import type { 
  DashboardSummary, 
  TimeSeriesData, 
  DashboardAlert, 
  SystemHealth 
} from '../../types/analytics';

const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [wasteChartData, setWasteChartData] = useState<TimeSeriesData | null>(null);
  const [userChartData, setUserChartData] = useState<TimeSeriesData | null>(null);
  const [marketplaceChartData, setMarketplaceChartData] = useState<TimeSeriesData | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
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

      setSummary(summaryData);
      setWasteChartData(wasteData);
      setUserChartData(userData);
      setMarketplaceChartData(marketplaceData);
      setAlerts(alertsData.results);
      setSystemHealth(healthData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await analyticsApi.acknowledgeDashboardAlert(alertId);
      // Update the alert in the local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_acknowledged: true }
          : alert
      ));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await analyticsApi.deleteDashboardAlert(alertId);
      // Remove the alert from local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Youth Green Jobs & Waste Recycling Hub Analytics
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadDashboardData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Users"
            value={summary?.total_users || 0}
            change={summary?.user_growth}
            changeLabel="vs yesterday"
            icon={<Users className="w-6 h-6" />}
            color="blue"
            loading={loading}
          />
          <KPICard
            title="Waste Collected"
            value={`${summary?.total_waste_collected || 0} kg`}
            change={summary?.waste_growth}
            changeLabel="vs yesterday"
            icon={<Recycle className="w-6 h-6" />}
            color="green"
            loading={loading}
          />
          <KPICard
            title="Total Sales"
            value={`KSh ${summary?.total_sales || 0}`}
            change={summary?.sales_growth}
            changeLabel="vs yesterday"
            icon={<DollarSign className="w-6 h-6" />}
            color="yellow"
            loading={loading}
          />
          <KPICard
            title="CO2 Reduced"
            value={`${summary?.total_co2_reduced || 0} kg`}
            icon={<Leaf className="w-6 h-6" />}
            color="green"
            loading={loading}
          />
        </div>

        {/* Today's Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="New Users Today"
            value={summary?.users_today || 0}
            icon={<Users className="w-6 h-6" />}
            color="indigo"
            loading={loading}
          />
          <KPICard
            title="Waste Today"
            value={`${summary?.waste_collected_today || 0} kg`}
            icon={<Recycle className="w-6 h-6" />}
            color="green"
            loading={loading}
          />
          <KPICard
            title="Orders Today"
            value={summary?.orders_today || 0}
            icon={<ShoppingCart className="w-6 h-6" />}
            color="purple"
            loading={loading}
          />
          <KPICard
            title="Credits Earned Today"
            value={summary?.credits_earned_today || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            color="blue"
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Waste Collection Trends (30 Days)"
            data={wasteChartData || { labels: [], datasets: [] }}
            type="line"
            height={300}
            loading={loading}
          />
          <ChartCard
            title="User Growth Trends (30 Days)"
            data={userChartData || { labels: [], datasets: [] }}
            type="area"
            height={300}
            loading={loading}
          />
        </div>

        {/* Marketplace Chart */}
        <div className="mb-8">
          <ChartCard
            title="Marketplace Trends (30 Days)"
            data={marketplaceChartData || { labels: [], datasets: [] }}
            type="bar"
            height={350}
            loading={loading}
          />
        </div>

        {/* System Health and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SystemHealthCard
            systemHealth={systemHealth!}
            loading={loading}
          />
          
          {/* Active Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {alerts.length}
              </span>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledgeAlert}
                    onDismiss={handleDismissAlert}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
