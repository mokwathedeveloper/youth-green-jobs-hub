import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  X, 
  Check,
  Clock
} from 'lucide-react';
import type { AlertCardProps, AlertType } from '../../types/analytics';

interface ExtendedAlertCardProps extends AlertCardProps {
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const AlertCard: React.FC<ExtendedAlertCardProps> = ({
  alert,
  onAcknowledge,
  onDismiss,
  className = '',
  showActions = true,
  compact = false
}) => {
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertColors = (type: AlertType) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          text: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const colors = getAlertColors(alert.alert_type);

  const handleAcknowledge = () => {
    if (onAcknowledge && !alert.is_acknowledged) {
      onAcknowledge(alert.id);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(alert.id);
    }
  };

  if (compact) {
    return (
      <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
            {getAlertIcon(alert.alert_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${colors.title} truncate`}>
                {alert.title}
              </p>
              <div className="flex items-center space-x-1 ml-2">
                {alert.is_acknowledged && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Check className="w-3 h-3" />
                    <span>Acked</span>
                  </div>
                )}
                {showActions && onDismiss && (
                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className={`text-xs ${colors.text} mt-1 line-clamp-2`}>
              {alert.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
            {getAlertIcon(alert.alert_type)}
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-semibold ${colors.title}`}>
              {alert.title}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                {getCategoryLabel(alert.category)}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(alert.created_at)}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Message */}
      <div className="mb-4">
        <p className={`text-sm ${colors.text}`}>
          {alert.message}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {alert.is_acknowledged ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              <span>
                Acknowledged by {alert.acknowledged_by_username}
              </span>
              {alert.acknowledged_at && (
                <span className="text-gray-500">
                  on {formatDate(alert.acknowledged_at)}
                </span>
              )}
            </div>
          ) : (
            showActions && onAcknowledge && (
              <button
                onClick={handleAcknowledge}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white ${colors.button} rounded-md transition-colors`}
              >
                <Check className="w-4 h-4" />
                <span>Acknowledge</span>
              </button>
            )
          )}
        </div>

        {alert.auto_resolve_at && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Auto-resolves {formatDate(alert.auto_resolve_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
