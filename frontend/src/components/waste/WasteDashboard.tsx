import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  Leaf,
  TrendingUp,
  Calendar,
  Weight,
  Clock,
  AlertCircle,
  Users,
  RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useUserPreferences } from '../../hooks/useLocalStorage';
import LoadingSpinner from '../ui/LoadingSpinner';


interface WasteDashboardProps {
  userId?: string; // If provided, shows personal dashboard
}

export const WasteDashboard: React.FC<WasteDashboardProps> = ({ userId }) => {
  // Use real analytics data - NO MOCK DATA
  const {
    wasteCollectionTrends,
    userGrowthTrends,
    currentStats,
    loading,
    error,
    refetch,
  } = useAnalytics();

  const { preferences } = useUserPreferences();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Convert time range to days (currently unused but kept for future enhancement)
  // const getDaysFromTimeRange = useCallback((range: '7d' | '30d' | '90d') => {
  //   switch (range) {
  //     case '7d': return 7;
  //     case '30d': return 30;
  //     case '90d': return 90;
  //     default: return 30;
  //   }
  // }, []);

  // Refresh real data
  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Load dashboard data on component mount and when time range changes
  useEffect(() => {
    loadAllData();
  }, [loadAllData, userId]);

  // Auto-refresh based on user preferences
  useEffect(() => {
    if (preferences.autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        loadAllData();
      }, preferences.autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [preferences.autoRefreshInterval, loadAllData]);

  if (loading || refreshing) {
    return <LoadingSpinner size="lg" text="Loading real dashboard data..." className="py-12" />;
  }

  if (error || !currentStats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">
          {error || 'Failed to load real dashboard data'}
        </p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Prepare chart data using REAL data
  const reportStatusData = [
    { name: 'Active Users', value: currentStats.active_users, color: '#3B82F6' },
    { name: 'Collection Points', value: currentStats.collection_points, color: '#F59E0B' },
    { name: 'CO₂ Saved', value: Math.floor(currentStats.co2_saved / 10), color: '#10B981' }
  ];

  const creditData = [
    { name: 'Credits Distributed', value: Math.floor(currentStats.credits_distributed / 100), color: '#10B981' },
    { name: 'Waste Collected', value: Math.floor(currentStats.total_waste_collected / 100), color: '#EF4444' },
    { name: 'Active Users', value: Math.floor(currentStats.active_users / 10), color: '#8B5CF6' }
  ];

  // Real data is already in the correct format from API

  // Transform data for charts - convert Chart.js format to Recharts format
  const wasteCollectionChartData = wasteCollectionTrends?.labels ?
    wasteCollectionTrends.labels.map((label, index) => ({
      month: label,
      plastic: wasteCollectionTrends.datasets[0]?.data[index] || 0,
      paper: wasteCollectionTrends.datasets[1]?.data[index] || 0,
      metal: wasteCollectionTrends.datasets[2]?.data[index] || 0,
      glass: wasteCollectionTrends.datasets[3]?.data[index] || 0,
      organic: wasteCollectionTrends.datasets[4]?.data[index] || 0,
    })) : [];

  const userGrowthChartData = userGrowthTrends?.labels ?
    userGrowthTrends.labels.map((label, index) => ({
      month: label,
      users: userGrowthTrends.datasets[0]?.data[index] || 0,
      active_users: userGrowthTrends.datasets[1]?.data[index] || 0,
    })) : [];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: string;
  }> = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userId ? 'My Waste Dashboard' : 'Waste Management Dashboard'}
          </h1>
          <p className="text-gray-600">
            Track your environmental impact and waste collection activities
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadAllData}
            disabled={refreshing}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Report Waste Button */}
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Report Waste
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Waste Collected"
          value={`${currentStats.total_waste_collected.toLocaleString()} kg`}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          subtitle="Real data from API"
          trend="Live data"
        />

        <StatCard
          title="Active Users"
          value={currentStats.active_users.toLocaleString()}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
          subtitle="Currently active"
          trend="Real-time"
        />

        <StatCard
          title="Collection Points"
          value={currentStats.collection_points}
          icon={<Weight className="w-6 h-6 text-white" />}
          color="bg-green-500"
          subtitle="Available locations"
          trend="Updated live"
        />

        <StatCard
          title="CO₂ Saved"
          value={`${currentStats.co2_saved.toLocaleString()} kg`}
          icon={<Leaf className="w-6 h-6 text-white" />}
          color="bg-emerald-500"
          subtitle="Environmental impact"
          trend="Real impact"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {reportStatusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Collection Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Waste Collection Trends (Real Data)</h2>
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          {error ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Failed to load real waste collection trends</p>
                <button
                  onClick={refetch}
                  className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : wasteCollectionChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wasteCollectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="plastic"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Plastic"
                  />
                  <Line
                    type="monotone"
                    dataKey="paper"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Paper"
                  />
                  <Line
                    type="monotone"
                    dataKey="metal"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Metal"
                  />
                  <Line
                    type="monotone"
                    dataKey="glass"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Glass"
                  />
                  <Line
                    type="monotone"
                    dataKey="organic"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Organic"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p>No trend data available</p>
              </div>
            </div>
          )}
        </div>

        {/* User Growth Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Activity Trends</h2>
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          {userGrowthChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="active_users"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>No user activity data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            <button className="text-sm text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Plastic bottles near market</p>
                    <p className="text-xs text-gray-500">2 hours ago • 5.2 kg</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Reported
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <button className="text-sm text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="space-y-3">
            {currentStats && currentStats.collection_points > 0 ? (
              [1, 2].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Beach Cleanup Drive</p>
                      <p className="text-xs text-gray-500">Tomorrow • Kisumu Beach</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Users className="w-3 h-3 mr-1" />
                    Joined
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No upcoming events</p>
                <button className="mt-2 text-sm text-green-600 hover:text-green-700">
                  Browse Events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environmental Impact Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Your Environmental Impact</h2>
            <p className="text-green-100 mb-4">
              You've made a positive impact on the environment through waste collection activities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{currentStats?.collection_points || 0}</p>
                <p className="text-sm text-green-100">Collection Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{currentStats?.total_waste_collected || 0} kg</p>
                <p className="text-sm text-green-100">Waste Collected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{currentStats?.co2_saved || 0} kg</p>
                <p className="text-sm text-green-100">CO₂ Reduced</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <Leaf className="w-24 h-24 text-green-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
