import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Minus,
  Shield,
  User,
  Verified
} from 'lucide-react';

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'verified' 
  | 'unverified'
  | 'staff'
  | 'superuser'
  | 'youth'
  | 'sme'
  | 'reported'
  | 'collected'
  | 'processed'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral';

interface StatusBadgeProps {
  status: StatusType | string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, {
      color: string;
      bgColor: string;
      borderColor: string;
      icon: React.ReactNode;
      defaultText: string;
    }> = {
      active: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        defaultText: 'Active'
      },
      inactive: {
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: <Minus className="w-3 h-3" />,
        defaultText: 'Inactive'
      },
      pending: {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <Clock className="w-3 h-3" />,
        defaultText: 'Pending'
      },
      approved: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        defaultText: 'Approved'
      },
      rejected: {
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <XCircle className="w-3 h-3" />,
        defaultText: 'Rejected'
      },
      verified: {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <Verified className="w-3 h-3" />,
        defaultText: 'Verified'
      },
      unverified: {
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: <AlertCircle className="w-3 h-3" />,
        defaultText: 'Unverified'
      },
      staff: {
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: <Shield className="w-3 h-3" />,
        defaultText: 'Staff'
      },
      superuser: {
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        icon: <Shield className="w-3 h-3" />,
        defaultText: 'Superuser'
      },
      youth: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <User className="w-3 h-3" />,
        defaultText: 'Youth'
      },
      sme: {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <User className="w-3 h-3" />,
        defaultText: 'SME'
      },
      reported: {
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <AlertCircle className="w-3 h-3" />,
        defaultText: 'Reported'
      },
      collected: {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <CheckCircle className="w-3 h-3" />,
        defaultText: 'Collected'
      },
      processed: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        defaultText: 'Processed'
      },
      success: {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        defaultText: 'Success'
      },
      error: {
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <XCircle className="w-3 h-3" />,
        defaultText: 'Error'
      },
      warning: {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <AlertCircle className="w-3 h-3" />,
        defaultText: 'Warning'
      },
      info: {
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <AlertCircle className="w-3 h-3" />,
        defaultText: 'Info'
      },
      neutral: {
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: <Minus className="w-3 h-3" />,
        defaultText: 'Neutral'
      }
    };

    return configs[status.toLowerCase()] || configs.neutral;
  };

  const getSizeClasses = (size: string) => {
    const sizes: Record<string, {
      padding: string;
      text: string;
      iconSize: string;
    }> = {
      sm: {
        padding: 'px-2 py-1',
        text: 'text-xs',
        iconSize: 'w-3 h-3'
      },
      md: {
        padding: 'px-3 py-1',
        text: 'text-sm',
        iconSize: 'w-4 h-4'
      },
      lg: {
        padding: 'px-4 py-2',
        text: 'text-base',
        iconSize: 'w-5 h-5'
      }
    };

    return sizes[size] || sizes.md;
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const displayText = text || config.defaultText;

  return (
    <span
      className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${config.color} ${config.bgColor} ${config.borderColor}
        ${sizeClasses.padding} ${sizeClasses.text}
        ${className}
      `}
    >
      {showIcon && (
        <span className={sizeClasses.iconSize}>
          {config.icon}
        </span>
      )}
      <span>{displayText}</span>
    </span>
  );
};

export default StatusBadge;
