import React from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Users,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { SystemHealth, SystemHealthStatus } from '../../types/analytics';

interface SystemHealthCardProps {
  systemHealth: SystemHealth;
  loading?: boolean;
  className?: string;
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
  systemHealth,
  loading = false,
  className = ''
}) => {
  const getStatusColor = (status: SystemHealthStatus) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getStatusIcon = (status: SystemHealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: SystemHealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'warning':
        return 'Performance Issues Detected';
      case 'critical':
        return 'Critical Issues Detected';
      default:
        return 'Unknown Status';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const colors = getStatusColor(systemHealth.status);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'CPU Usage',
      value: systemHealth.current_metrics.cpu_usage_percent,
      unit: '%',
      icon: <Cpu className="w-4 h-4" />,
      thresholds: { warning: 60, critical: 80 }
    },
    {
      label: 'Memory Usage',
      value: systemHealth.current_metrics.memory_usage_percent,
      unit: '%',
      icon: <Server className="w-4 h-4" />,
      thresholds: { warning: 60, critical: 80 }
    },
    {
      label: 'Disk Usage',
      value: systemHealth.current_metrics.disk_usage_percent,
      unit: '%',
      icon: <HardDrive className="w-4 h-4" />,
      thresholds: { warning: 70, critical: 85 }
    },
    {
      label: 'API Response Time',
      value: systemHealth.current_metrics.api_response_time_ms,
      unit: 'ms',
      icon: <Activity className="w-4 h-4" />,
      thresholds: { warning: 1000, critical: 2000 }
    },
    {
      label: 'API Error Rate',
      value: systemHealth.current_metrics.api_error_rate,
      unit: '%',
      icon: <AlertCircle className="w-4 h-4" />,
      thresholds: { warning: 2, critical: 5 }
    },
    {
      label: 'Active Users',
      value: systemHealth.current_metrics.concurrent_users,
      unit: '',
      icon: <Users className="w-4 h-4" />,
      thresholds: { warning: 1000, critical: 2000 }
    },
    {
      label: 'DB Connections',
      value: systemHealth.current_metrics.db_connections_active,
      unit: '',
      icon: <Database className="w-4 h-4" />,
      thresholds: { warning: 80, critical: 95 }
    }
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`${colors.icon}`}>
            {getStatusIcon(systemHealth.status)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <p className="text-sm text-gray-500">
              Last updated: {formatTimestamp(systemHealth.timestamp)}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
          {getStatusLabel(systemHealth.status)}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="text-gray-500">
                  {metric.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {metric.label}
                </span>
              </div>
              <span className={`text-sm font-bold ${getMetricColor(metric.value, metric.thresholds)}`}>
                {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
              </span>
            </div>
            
            {/* Progress bar for percentage metrics */}
            {metric.unit === '%' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metric.value, metric.thresholds)}`}
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 24h Averages */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">24-Hour Averages</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Avg Response Time</span>
            <p className="font-medium text-gray-900">
              {systemHealth['24h_averages'].avg_response_time_ms.toFixed(0)}ms
            </p>
          </div>
          <div>
            <span className="text-gray-500">Avg Error Rate</span>
            <p className="font-medium text-gray-900">
              {systemHealth['24h_averages'].avg_error_rate.toFixed(2)}%
            </p>
          </div>
          <div>
            <span className="text-gray-500">Avg CPU Usage</span>
            <p className="font-medium text-gray-900">
              {systemHealth['24h_averages'].avg_cpu_usage.toFixed(1)}%
            </p>
          </div>
          <div>
            <span className="text-gray-500">Avg Memory Usage</span>
            <p className="font-medium text-gray-900">
              {systemHealth['24h_averages'].avg_memory_usage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {systemHealth.active_alerts > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center space-x-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-gray-700">
              {systemHealth.active_alerts} active system alert{systemHealth.active_alerts !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthCard;
