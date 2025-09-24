// WalletCard Component - Reusable Balance Display
import React from 'react';
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import type { WalletBalance } from '../../types/wallet';

interface WalletCardProps {
  balance: WalletBalance | null;
  loading?: boolean;
  onRefresh?: () => void;
  title?: string;
  showDetails?: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  loading = false,
  onRefresh,
  title = "Wallet Balance",
  showDetails = true
}) => {
  const formatAmount = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-green-100 text-sm">Available Balance</p>
          </div>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Main Balance */}
        <div>
          <div className="text-3xl font-bold">
            {loading ? (
              <div className="animate-pulse bg-white bg-opacity-20 h-8 w-32 rounded"></div>
            ) : (
              formatAmount(balance?.current_balance || 0)
            )}
          </div>
        </div>

        {/* Balance Details */}
        {showDetails && balance && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-200" />
              <div>
                <p className="text-xs text-green-100">Total Earned</p>
                <p className="font-semibold">{formatAmount(balance.total_earned)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-red-200" />
              <div>
                <p className="text-xs text-green-100">Total Spent</p>
                <p className="font-semibold">{formatAmount(balance.total_spent)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !balance && (
          <div className="space-y-2">
            <div className="animate-pulse bg-white bg-opacity-20 h-4 w-24 rounded"></div>
            <div className="animate-pulse bg-white bg-opacity-20 h-4 w-32 rounded"></div>
          </div>
        )}
      </div>
    </div>
  );
};
