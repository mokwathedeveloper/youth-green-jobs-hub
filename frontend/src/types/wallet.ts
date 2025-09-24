// Wallet Types for Frontend-Only Implementation
// Consumes existing backend APIs without backend modifications

export interface WalletBalance {
  current_balance: number;
  total_earned: number;
  total_spent: number;
  total_bonus: number;
}

export interface CreditTransaction {
  id: string;
  transaction_type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  created_at: string;
  waste_report?: {
    id: string;
    category: string;
    weight_kg: number;
  };
  order?: {
    id: string;
    total_amount: number;
  };
}

export interface PaymentProvider {
  name: string;
  display_name: string;
  is_active: boolean;
  supported_currencies: string[];
  logo_url?: string;
}

export interface PaymentTransaction {
  id: string;
  transaction_id: string;
  order_id: string;
  provider: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  external_id?: string;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  method: 'mpesa' | 'bank_transfer' | 'paystack';
  phone_number?: string;
  bank_details?: {
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_code: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at?: string;
  notes?: string;
}

export interface WalletStats {
  // Credit-related stats
  credits: WalletBalance;
  
  // Transaction stats
  transaction_count: number;
  recent_transactions: CreditTransaction[];
  
  // Payment stats
  total_payments: number;
  successful_payments: number;
  pending_payments: number;
  
  // Payout stats (for SME users)
  total_payouts_requested?: number;
  pending_payouts?: number;
  completed_payouts?: number;
  
  // Environmental impact
  environmental_impact: {
    total_co2_reduction_kg: number;
  };
}

export interface RedemptionOption {
  type: 'airtime' | 'voucher' | 'cash' | 'eco_coins';
  display_name: string;
  min_amount: number;
  max_amount: number;
  fee_percentage: number;
  description: string;
  icon: string;
}

export interface CreditRedemption {
  amount: number;
  redemption_type: 'airtime' | 'voucher' | 'cash' | 'eco_coins';
  phone_number?: string;
  notes?: string;
}

// API Response Types
export interface WalletApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface TransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CreditTransaction[];
}

export interface PaymentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentTransaction[];
}

// Filter Types
export interface TransactionFilters {
  transaction_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaymentFilters {
  status?: string;
  provider?: string;
  date_from?: string;
  date_to?: string;
}
