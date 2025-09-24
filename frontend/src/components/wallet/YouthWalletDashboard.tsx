// YouthWalletDashboard - Credit Management for Youth Users
import React, { useState } from 'react';
import { 
  Gift, 
  Smartphone, 
  ShoppingBag, 
  Coins, 
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { WalletCard } from './WalletCard';
import { TransactionTable } from './TransactionTable';
import type { CreditRedemption, RedemptionOption } from '../../types/wallet';

export const YouthWalletDashboard: React.FC = () => {
  const {
    balance,
    transactions,
    stats,
    loading,
    error,
    refreshWallet,
    redeemCredits,
    formatAmount
  } = useWallet();

  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redemptionLoading, setRedemptionLoading] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);
  const [redemptionForm, setRedemptionForm] = useState<CreditRedemption>({
    amount: 0,
    redemption_type: 'airtime',
    phone_number: '',
    notes: ''
  });

  // Redemption options
  const redemptionOptions: RedemptionOption[] = [
    {
      type: 'airtime',
      display_name: 'Mobile Airtime',
      min_amount: 10,
      max_amount: 1000,
      fee_percentage: 0,
      description: 'Top up your mobile phone',
      icon: 'smartphone'
    },
    {
      type: 'voucher',
      display_name: 'Shopping Voucher',
      min_amount: 50,
      max_amount: 5000,
      fee_percentage: 2,
      description: 'Use in eco-products marketplace',
      icon: 'shopping-bag'
    },
    {
      type: 'cash',
      display_name: 'Cash Withdrawal',
      min_amount: 100,
      max_amount: 10000,
      fee_percentage: 5,
      description: 'Withdraw to M-Pesa',
      icon: 'credit-card'
    },
    {
      type: 'eco_coins',
      display_name: 'Eco Coins',
      min_amount: 25,
      max_amount: 2500,
      fee_percentage: 0,
      description: 'Convert to platform coins',
      icon: 'coins'
    }
  ];

  const getRedemptionIcon = (type: string) => {
    switch (type) {
      case 'airtime': return Smartphone;
      case 'voucher': return ShoppingBag;
      case 'cash': return CreditCard;
      case 'eco_coins': return Coins;
      default: return Gift;
    }
  };

  const handleRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!redemptionForm.amount || redemptionForm.amount <= 0) {
      return;
    }

    try {
      setRedemptionLoading(true);
      const result = await redeemCredits(redemptionForm);
      
      if (result.success) {
        setRedemptionSuccess(result.message);
        setShowRedemptionModal(false);
        setRedemptionForm({
          amount: 0,
          redemption_type: 'airtime',
          phone_number: '',
          notes: ''
        });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setRedemptionSuccess(null), 5000);
      }
    } catch (error: any) {
      console.error('Redemption failed:', error);
    } finally {
      setRedemptionLoading(false);
    }
  };

  const selectedOption = redemptionOptions.find(opt => opt.type === redemptionForm.redemption_type);
  const calculatedFee = selectedOption ? (redemptionForm.amount * selectedOption.fee_percentage / 100) : 0;
  const netAmount = redemptionForm.amount - calculatedFee;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600">Manage your credits and redeem rewards</p>
        </div>
      </div>

      {/* Success Message */}
      {redemptionSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800">{redemptionSuccess}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Wallet Balance Card */}
      <WalletCard
        balance={balance}
        loading={loading}
        onRefresh={refreshWallet}
        title="Credit Balance"
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {redemptionOptions.map((option) => {
            const Icon = getRedemptionIcon(option.type);
            return (
              <button
                key={option.type}
                onClick={() => {
                  setRedemptionForm(prev => ({ ...prev, redemption_type: option.type }));
                  setShowRedemptionModal(true);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{option.display_name}</h4>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Min: KSh {option.min_amount} | Fee: {option.fee_percentage}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(stats.credits.total_earned)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Redeemed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(stats.credits.total_spent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CO₂ Reduced</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.environmental_impact.total_co2_reduction_kg.toFixed(1)} kg
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
      />

      {/* Redemption Modal */}
      {showRedemptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Redeem Credits - {selectedOption?.display_name}
            </h3>
            
            <form onSubmit={handleRedemption} className="space-y-4">
              <div>
                <label htmlFor="redemption-amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (KSh)
                </label>
                <input
                  id="redemption-amount"
                  name="amount"
                  type="number"
                  min={selectedOption?.min_amount}
                  max={Math.min(selectedOption?.max_amount || 0, balance?.current_balance || 0)}
                  step="0.01"
                  value={redemptionForm.amount || ''}
                  onChange={(e) => setRedemptionForm(prev => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  autoComplete="transaction-amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {formatAmount(balance?.current_balance || 0)}
                </p>
              </div>

              {(redemptionForm.redemption_type === 'airtime' || redemptionForm.redemption_type === 'cash') && (
                <div>
                  <label htmlFor="redemption-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="redemption-phone"
                    name="phone_number"
                    type="tel"
                    value={redemptionForm.phone_number || ''}
                    onChange={(e) => setRedemptionForm(prev => ({
                      ...prev,
                      phone_number: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="254712345678"
                    autoComplete="tel"
                  />
                </div>
              )}

              {calculatedFee > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span>{formatAmount(redemptionForm.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee ({selectedOption?.fee_percentage}%):</span>
                    <span>-{formatAmount(calculatedFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t border-yellow-300 pt-2 mt-2">
                    <span>You'll receive:</span>
                    <span>{formatAmount(netAmount)}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRedemptionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={redemptionLoading || !redemptionForm.amount}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {redemptionLoading ? 'Processing...' : 'Redeem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
