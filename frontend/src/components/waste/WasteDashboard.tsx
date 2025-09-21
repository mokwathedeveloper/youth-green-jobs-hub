import React, { useEffect } from 'react';
import {
  Package,
  Coins,
  Leaf,
  TrendingUp,
  Calendar,
  Weight,
  Clock,
  AlertCircle,
  Users
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useWaste } from '../../hooks/useWaste';
import LoadingSpinner from '../ui/LoadingSpinner';


interface WasteDashboardProps {
  userId?: string; // If provided, shows personal dashboard
}

export const WasteDashboard: React.FC<WasteDashboardProps> = ({ userId }) => {
  const {
    dashboardStats,
    dashboardLoading,
    dashboardError,
    loadDashboardStats,

  } = useWaste();

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats, userId]);

  if (dashboardLoading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." className="py-12" />;
  }

  if (dashboardError || !dashboardStats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">
          {typeof dashboardError === 'string' ? dashboardError : dashboardError?.message || 'Failed to load dashboard'}
        </p>
        <button
          onClick={loadDashboardStats}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Prepare chart data
  const reportStatusData = [
    { name: 'Reported', value: dashboardStats.reports.total_reports - dashboardStats.reports.verified_reports, color: '#3B82F6' },
    { name: 'Verified', value: dashboardStats.reports.verified_reports - dashboardStats.reports.collected_reports, color: '#F59E0B' },
    { name: 'Collected', value: dashboardStats.reports.collected_reports, color: '#10B981' }
  ];

  const creditData = [
    { name: 'Earned', value: dashboardStats.credits.total_earned, color: '#10B981' },
    { name: 'Spent', value: dashboardStats.credits.total_spent, color: '#EF4444' },
    { name: 'Bonus', value: dashboardStats.credits.total_bonus, color: '#8B5CF6' }
  ];

  // Mock monthly data for trends (in a real app, this would come from the API)
  const monthlyData = [
    { month: 'Jan', reports: 12, weight: 45, credits: 180 },
    { month: 'Feb', reports: 19, weight: 67, credits: 268 },
    { month: 'Mar', reports: 15, weight: 52, credits: 208 },
    { month: 'Apr', reports: 22, weight: 78, credits: 312 },
    { month: 'May', reports: 28, weight: 95, credits: 380 },
    { month: 'Jun', reports: 31, weight: 112, credits: 448 }
  ];

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
        <div className="mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Report Waste
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports"
          value={dashboardStats.reports.total_reports}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          subtitle={`${dashboardStats.reports.collected_reports} collected`}
          trend="+12% from last month"
        />

        <StatCard
          title="Credit Balance"
          value={dashboardStats.credits.current_balance}
          icon={<Coins className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
          subtitle={`${dashboardStats.credits.total_earned} total earned`}
          trend="+8% from last month"
        />

        <StatCard
          title="Weight Collected"
          value={`${dashboardStats.reports.total_actual_weight_kg} kg`}
          icon={<Weight className="w-6 h-6 text-white" />}
          color="bg-green-500"
          subtitle={`${dashboardStats.reports.total_estimated_weight_kg} kg estimated`}
          trend="+15% from last month"
        />

        <StatCard
          title="CO₂ Reduced"
          value={`${dashboardStats.environmental_impact.total_co2_reduction_kg} kg`}
          icon={<Leaf className="w-6 h-6 text-white" />}
          color="bg-emerald-500"
          subtitle="Environmental impact"
          trend="+18% from last month"
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

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="reports" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Reports"
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="weight" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Weight (kg)"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="credits" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Credits"
              />
            </LineChart>
          </ResponsiveContainer>
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
            {dashboardStats.events.events_joined > 0 ? (
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
                <p className="text-2xl font-bold">{dashboardStats.reports.total_reports}</p>
                <p className="text-sm text-green-100">Reports Submitted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboardStats.reports.total_actual_weight_kg} kg</p>
                <p className="text-sm text-green-100">Waste Collected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboardStats.environmental_impact.total_co2_reduction_kg} kg</p>
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
