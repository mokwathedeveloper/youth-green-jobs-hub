import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

import type { DashboardCardProps } from '../../types/analytics';

interface KPICardProps extends Omit<DashboardCardProps, 'icon'> {
  icon?: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  subtitle,
  color = 'blue',
  loading = false,
  className = ''
}) => {
  const { formatMetric } = useAnalytics();

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return formatMetric(val);
    }
    return val.toString();
  };

  const formatChange = (changeVal?: number): string => {
    if (changeVal === undefined || changeVal === null) return '';
    const sign = changeVal >= 0 ? '+' : '';
    return `${sign}${changeVal.toFixed(1)}%`;
  };

  const getChangeIcon = (changeVal?: number) => {
    if (changeVal === undefined || changeVal === null) return <Minus className="w-4 h-4" />;
    if (changeVal > 0) return <TrendingUp className="w-4 h-4" />;
    if (changeVal < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = (changeVal?: number): string => {
    if (changeVal === undefined || changeVal === null) return 'text-gray-500';
    if (changeVal > 0) return 'text-green-600';
    if (changeVal < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      accent: 'bg-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      accent: 'bg-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      accent: 'bg-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      accent: 'bg-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      accent: 'bg-purple-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      accent: 'bg-indigo-600'
    }
  };

  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${colors.border} ${colors.bg} p-6 transition-all duration-200 hover:shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 truncate">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Change Indicator */}
      {(change !== undefined && change !== null) && (
        <div className="flex items-center space-x-1">
          <div className={`flex items-center space-x-1 ${getChangeColor(change)}`}>
            {getChangeIcon(change)}
            <span className="text-sm font-medium">
              {formatChange(change)}
            </span>
          </div>
          {changeLabel && (
            <span className="text-sm text-gray-500">
              {changeLabel}
            </span>
          )}
        </div>
      )}

      {/* Accent Bar */}
      <div className={`h-1 ${colors.accent} rounded-full mt-4 opacity-20`}></div>
    </div>
  );
};

export default KPICard;
