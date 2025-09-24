// Wallet API Service - Frontend Only
// Consumes existing backend APIs without backend modifications

import { api } from './api';
import type {
  WalletBalance,
  PaymentProvider,
  WalletStats,
  CreditRedemption,
  WalletApiResponse,
  TransactionListResponse,
  PaymentListResponse,
  TransactionFilters,
  PaymentFilters
} from '../types/wallet';

class WalletApiService {
  // Base URLs for existing APIs
  private readonly WASTE_API = '/api/v1/waste';
  private readonly PRODUCTS_API = '/api/v1/products';

  /**
   * Get user's credit balance from existing waste API
   */
  async getCreditBalance(): Promise<WalletBalance> {
    try {
      const response = await api.get(`${this.WASTE_API}/credits/balance/`);
      return (response as any).data;
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
      // Return default balance if API fails
      return {
        current_balance: 0,
        total_earned: 0,
        total_spent: 0,
        total_bonus: 0
      };
    }
  }

  /**
   * Get user's credit transactions from existing waste API
   */
  async getCreditTransactions(filters?: TransactionFilters): Promise<TransactionListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get(`${this.WASTE_API}/credits/?${params.toString()}`);
      return (response as any).data;
    } catch (error) {
      console.error('Failed to fetch credit transactions:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  }

  /**
   * Get dashboard stats from existing waste API
   */
  async getDashboardStats(): Promise<WalletStats> {
    try {
      const response = await api.get(`${this.WASTE_API}/dashboard/stats/`);
      const data = (response as any).data;

      // Transform existing API response to wallet stats format
      return {
        credits: data.credits || {
          current_balance: 0,
          total_earned: 0,
          total_spent: 0,
          total_bonus: 0
        },
        transaction_count: data.credits?.transaction_count || 0,
        recent_transactions: data.recent_transactions || [],
        total_payments: data.total_payments || 0,
        successful_payments: data.successful_payments || 0,
        pending_payments: data.pending_payments || 0,
        environmental_impact: data.environmental_impact || {
          total_co2_reduction_kg: 0
        }
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get available payment providers from existing products API
   */
  async getPaymentProviders(): Promise<PaymentProvider[]> {
    try {
      const response = await api.get(`${this.PRODUCTS_API}/payments/providers/`);
      return (response as any).data.providers || [];
    } catch (error) {
      console.error('Failed to fetch payment providers:', error);
      return [];
    }
  }

  /**
   * Get payment history from existing products API
   */
  async getPaymentHistory(filters?: PaymentFilters): Promise<PaymentListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.provider) params.append('provider', filters.provider);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`${this.PRODUCTS_API}/payments/history/?${params.toString()}`);
      return (response as any).data;
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  }

  /**
   * Initiate payment using existing products API
   */
  async initiatePayment(orderData: {
    order_id: string;
    provider: string;
    customer_phone: string;
    customer_email?: string;
  }): Promise<WalletApiResponse> {
    try {
      const response = await api.post(`${this.PRODUCTS_API}/payments/initiate/`, orderData);
      return {
        success: (response as any).data.success,
        message: (response as any).data.message,
        data: (response as any).data
      };
    } catch (error: any) {
      console.error('Failed to initiate payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment initiation failed',
        data: error.response?.data
      };
    }
  }

  /**
   * Verify payment status using existing products API
   */
  async verifyPayment(transactionId: string): Promise<WalletApiResponse> {
    try {
      const response = await api.get(`${this.PRODUCTS_API}/payments/verify/${transactionId}/`);
      return {
        success: (response as any).data.success,
        message: (response as any).data.message,
        data: (response as any).data
      };
    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed',
        data: error.response?.data
      };
    }
  }

  /**
   * Simulate credit redemption (would need backend implementation)
   * For now, this is a frontend-only simulation
   */
  async redeemCredits(redemption: CreditRedemption): Promise<WalletApiResponse> {
    try {
      // This would need a real backend endpoint
      // For now, simulate the response
      console.log('Credit redemption requested:', redemption);
      
      return {
        success: true,
        message: `Successfully redeemed KSh ${redemption.amount} for ${redemption.redemption_type}`,
        data: {
          transaction_id: `txn_${Date.now()}`,
          amount: redemption.amount,
          type: redemption.redemption_type
        }
      };
    } catch (error: any) {
      console.error('Failed to redeem credits:', error);
      return {
        success: false,
        message: 'Credit redemption failed',
        data: null
      };
    }
  }

  /**
   * Simulate payout request (would need backend implementation)
   * For now, this is a frontend-only simulation
   */
  async requestPayout(payoutData: {
    amount: number;
    method: 'mpesa' | 'bank_transfer' | 'paystack';
    phone_number?: string;
    bank_details?: any;
    notes?: string;
  }): Promise<WalletApiResponse> {
    try {
      // This would need a real backend endpoint
      // For now, simulate the response
      console.log('Payout request submitted:', payoutData);
      
      return {
        success: true,
        message: `Payout request of KSh ${payoutData.amount} submitted successfully`,
        data: {
          request_id: `payout_${Date.now()}`,
          amount: payoutData.amount,
          method: payoutData.method,
          status: 'pending'
        }
      };
    } catch (error: any) {
      console.error('Failed to request payout:', error);
      return {
        success: false,
        message: 'Payout request failed',
        data: null
      };
    }
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: number, currency: string = 'KSh'): string {
    return `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  }

  /**
   * Get transaction status color
   */
  getTransactionColor(type: string): string {
    switch (type) {
      case 'earned':
      case 'bonus':
        return 'text-green-600';
      case 'spent':
      case 'penalty':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export const walletApi = new WalletApiService();
export default walletApi;
