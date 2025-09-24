// Wallet Hook - Frontend Only
// Manages wallet state and API calls

import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '../services/walletApi';
import { useAuth } from './useAuth';
import type {
  WalletBalance,
  CreditTransaction,
  PaymentProvider,
  PaymentTransaction,
  WalletStats,
  CreditRedemption,
  TransactionFilters,
  PaymentFilters
} from '../types/wallet';

export const useWallet = () => {
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch credit balance
   */
  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const balanceData = await walletApi.getCreditBalance();
      setBalance(balanceData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
      console.error('Error fetching balance:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch credit transactions
   */
  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await walletApi.getCreditTransactions(filters);
      setTransactions(response.results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch payment history
   */
  const fetchPayments = useCallback(async (filters?: PaymentFilters) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await walletApi.getPaymentHistory(filters);
      setPayments(response.results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch payment providers
   */
  const fetchProviders = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const providersData = await walletApi.getPaymentProviders();
      setProviders(providersData);
    } catch (err: any) {
      console.error('Error fetching providers:', err);
    }
  }, [isAuthenticated]);

  /**
   * Fetch wallet stats
   */
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const statsData = await walletApi.getDashboardStats();
      setStats(statsData);
      
      // Also update balance from stats
      if (statsData.credits) {
        setBalance(statsData.credits);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Redeem credits
   */
  const redeemCredits = useCallback(async (redemption: CreditRedemption) => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const result = await walletApi.redeemCredits(redemption);
      
      if (result.success) {
        // Refresh balance and transactions after successful redemption
        await fetchBalance();
        await fetchTransactions();
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Credit redemption failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchBalance, fetchTransactions]);

  /**
   * Request payout (for SME users)
   */
  const requestPayout = useCallback(async (payoutData: {
    amount: number;
    method: 'mpesa' | 'bank_transfer' | 'paystack';
    phone_number?: string;
    bank_details?: any;
    notes?: string;
  }) => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const result = await walletApi.requestPayout(payoutData);
      
      if (result.success) {
        // Refresh stats after successful payout request
        await fetchStats();
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Payout request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchStats]);

  /**
   * Initiate payment
   */
  const initiatePayment = useCallback(async (orderData: {
    order_id: string;
    provider: string;
    customer_phone: string;
    customer_email?: string;
  }) => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const result = await walletApi.initiatePayment(orderData);
      
      if (result.success) {
        // Refresh payments after successful initiation
        await fetchPayments();
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPayments]);

  /**
   * Verify payment
   */
  const verifyPayment = useCallback(async (transactionId: string) => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      const result = await walletApi.verifyPayment(transactionId);
      
      // Refresh payments after verification
      await fetchPayments();
      return result;
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPayments]);

  /**
   * Refresh all wallet data
   */
  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    
    await Promise.all([
      fetchStats(),
      fetchTransactions(),
      fetchPayments(),
      fetchProviders()
    ]);
  }, [isAuthenticated, fetchStats, fetchTransactions, fetchPayments, fetchProviders]);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshWallet();
    }
  }, [isAuthenticated, user, refreshWallet]);

  return {
    // Data
    balance,
    transactions,
    payments,
    providers,
    stats,
    
    // State
    loading,
    error,
    
    // Actions
    fetchBalance,
    fetchTransactions,
    fetchPayments,
    fetchProviders,
    fetchStats,
    redeemCredits,
    requestPayout,
    initiatePayment,
    verifyPayment,
    refreshWallet,
    
    // Utilities
    formatAmount: walletApi.formatAmount,
    getTransactionColor: walletApi.getTransactionColor,
    getPaymentStatusColor: walletApi.getPaymentStatusColor
  };
};
