import React from 'react';
import {
  Users,
  Recycle,
  ShoppingCart,
  TrendingUp,
  Leaf,
  DollarSign,
  Activity,
  AlertCircle,
  UserCheck,
  Package,
  Download,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/admin';
import { KPICard, ChartCard, AlertCard, SystemHealthCard } from '../../components/analytics';
import { useAdminDashboard } from '../../hooks/useAdminData';

const AdminDashboardPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    refetch,
    exportAnalyticsData,
    exportSystemReport,
    performAction
  } = useAdminDashboard();

  const summary = data?.summary;
  const wasteChartData = data?.wasteChartData;
  const userChartData = data?.userChartData;
  const marketplaceChartData = data?.marketplaceChartData;
  const alerts = data?.alerts || [];
  const systemHealth = data?.systemHealth;

  const handleAcknowledgeAlert = async (alertId: string) => {
    await performAction(
      `acknowledge-${alertId}`,
      async () => {
        const { analyticsApi } = await import('../../services/api');
        await analyticsApi.acknowledgeDashboardAlert(alertId);
      },
      () => refetch(),
      (error) => console.error('Failed to acknowledge alert:', error)
    );
  };

  const handleDismissAlert = async (alertId: string) => {
    await performAction(
      `dismiss-${alertId}`,
      async () => {
        const { analyticsApi } = await import('../../services/api');
        await analyticsApi.deleteDashboardAlert(alertId);
      },
      () => refetch(),
      (error) => console.error('Failed to dismiss alert:', error)
    );
  };

  const navigateToPage = (path: string) => {
    window.location.href = path;
  };

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Youth Green Jobs & Waste Recycling Hub Analytics"
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={exportAnalyticsData}
            disabled={!summary}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportSystemReport}
            disabled={!summary || !systemHealth}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span>System Report</span>
          </button>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Dashboard Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 bg-red-600 text-white px-3 py-1 text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => navigateToPage('/admin/users')}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500">Manage youth and SME accounts</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigateToPage('/admin/waste')}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Recycle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Waste Management</h3>
              <p className="text-sm text-gray-500">Approve waste collection reports</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigateToPage('/admin/products')}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
              <p className="text-sm text-gray-500">Manage SME vendor products</p>
            </div>
          </div>
        </div>
      </div>
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
    </AdminLayout>
  );
};

export default AdminDashboardPage;
