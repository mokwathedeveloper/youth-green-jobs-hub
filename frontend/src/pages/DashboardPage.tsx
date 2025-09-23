import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Recycle,
  ShoppingBag,
  Users,
  Award,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWaste } from '../hooks/useWaste';
import { Button } from '@/components/ui/button';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { dashboardStats, loading: wasteLoading } = useWaste();

  // Create stats from real user data
  const stats = [
    {
      name: 'Waste Collected',
      value: dashboardStats?.reports?.total_actual_weight_kg
        ? `${dashboardStats.reports.total_actual_weight_kg.toFixed(1)} kg`
        : '0 kg',
      change: '+12%', // Could be calculated from historical data
      changeType: 'positive',
      icon: Recycle,
      color: 'green',
    },
    {
      name: 'Credits Earned',
      value: dashboardStats?.credits?.current_balance
        ? `KSh ${dashboardStats.credits.current_balance.toFixed(0)}`
        : 'KSh 0',
      change: '+8%', // Could be calculated from historical data
      changeType: 'positive',
      icon: Award,
      color: 'blue',
    },
    {
      name: 'Reports Submitted',
      value: dashboardStats?.reports?.total_reports?.toString() || '0',
      change: `+${dashboardStats?.reports?.total_reports || 0}`,
      changeType: 'positive',
      icon: ShoppingBag,
      color: 'purple',
    },
    {
      name: 'CO₂ Reduced',
      value: dashboardStats?.environmental_impact?.total_co2_reduction_kg
        ? `${(dashboardStats.environmental_impact.total_co2_reduction_kg / 1000).toFixed(2)} tons`
        : '0 tons',
      change: '+0.1',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'waste_collection',
      description: 'Collected 15kg of plastic waste',
      location: 'Kondele Market',
      time: '2 hours ago',
      credits: '+KSh 150',
    },
    {
      id: 2,
      type: 'purchase',
      description: 'Purchased eco-friendly soap',
      location: 'Green SME Store',
      time: '1 day ago',
      credits: '-KSh 200',
    },
    {
      id: 3,
      type: 'waste_collection',
      description: 'Collected 8kg of organic waste',
      location: 'Nyamasaria',
      time: '2 days ago',
      credits: '+KSh 80',
    },
  ];

  const quickActions = [
    {
      name: 'Report Waste',
      description: 'Report waste in your area',
      href: '/dashboard/waste/reports',
      icon: Recycle,
      color: 'green',
    },
    {
      name: 'Browse Products',
      description: 'Shop eco-friendly products',
      href: '/dashboard/products',
      icon: ShoppingBag,
      color: 'blue',
    },
    {
      name: 'View Analytics',
      description: 'Track your impact',
      href: '/dashboard/analytics',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      name: 'Find Community',
      description: 'Connect with other youth',
      href: '/dashboard/community',
      icon: Users,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-green-100">
              Ready to make a positive impact today? Let's continue your green journey.
            </p>
            {user?.profile_completion_percentage && user.profile_completion_percentage < 100 && (
              <div className="mt-4">
                <p className="text-sm text-green-100 mb-2">
                  Complete your profile to unlock more features
                </p>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-green-400 bg-opacity-30 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${user.profile_completion_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {user.profile_completion_percentage}%
                  </span>
                  <Link to="/dashboard/profile">
                    <Button variant="secondary" size="sm">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600',
            emerald: 'bg-emerald-100 text-emerald-600',
          };
          
          return (
            <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colorClasses = {
              green: 'bg-green-50 text-green-600 hover:bg-green-100',
              blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
              purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
              orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
            };
            
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors ${colorClasses[action.color as keyof typeof colorClasses]}`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/dashboard/activity" className="text-sm text-green-600 hover:text-green-700">
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                {activity.type === 'waste_collection' ? (
                  <Recycle className="w-5 h-5 text-green-600" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{activity.location}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>{activity.time}</span>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                activity.credits.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {activity.credits}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
