// PayoutForm Component - SME Payout Request Form
import React, { useState } from 'react';
import { Smartphone, Building2, CreditCard, AlertCircle } from 'lucide-react';

interface PayoutFormProps {
  onSubmit: (data: PayoutFormData) => Promise<void>;
  loading?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

interface PayoutFormData {
  amount: number;
  method: 'mpesa' | 'bank_transfer' | 'paystack';
  phone_number?: string;
  bank_details?: {
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_code: string;
  };
  notes?: string;
}

export const PayoutForm: React.FC<PayoutFormProps> = ({
  onSubmit,
  loading = false,
  minAmount = 100,
  maxAmount = 50000
}) => {
  const [formData, setFormData] = useState<PayoutFormData>({
    amount: 0,
    method: 'mpesa',
    phone_number: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    if (!formData.amount || formData.amount < minAmount) {
      newErrors.amount = `Minimum amount is KSh ${minAmount}`;
    } else if (formData.amount > maxAmount) {
      newErrors.amount = `Maximum amount is KSh ${maxAmount}`;
    }

    // Method-specific validation
    if (formData.method === 'mpesa') {
      if (!formData.phone_number) {
        newErrors.phone_number = 'Phone number is required for M-Pesa';
      } else if (!/^254\d{9}$/.test(formData.phone_number.replace(/\s+/g, ''))) {
        newErrors.phone_number = 'Please enter a valid Kenyan phone number (254XXXXXXXXX)';
      }
    }

    if (formData.method === 'bank_transfer') {
      if (!formData.bank_details?.account_name) {
        newErrors.account_name = 'Account name is required';
      }
      if (!formData.bank_details?.account_number) {
        newErrors.account_number = 'Account number is required';
      }
      if (!formData.bank_details?.bank_name) {
        newErrors.bank_name = 'Bank name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        amount: 0,
        method: 'mpesa',
        phone_number: '',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Payout request failed:', error);
    }
  };

  const updateFormData = (updates: Partial<PayoutFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const updateBankDetails = (updates: Partial<PayoutFormData['bank_details']>) => {
    setFormData(prev => ({
      ...prev,
      bank_details: { ...prev.bank_details, ...updates } as any
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Payout</h3>
        <p className="text-sm text-gray-600">
          Request a payout of your earnings. Processing may take 1-3 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div>
          <label htmlFor="payout-amount" className="block text-sm font-medium text-gray-700 mb-2">
            Payout Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              KSh
            </span>
            <input
              id="payout-amount"
              name="amount"
              type="number"
              min={minAmount}
              max={maxAmount}
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => updateFormData({ amount: parseFloat(e.target.value) || 0 })}
              className={`pl-12 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              autoComplete="transaction-amount"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.amount}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Min: KSh {minAmount.toLocaleString()} | Max: KSh {maxAmount.toLocaleString()}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payout Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* M-Pesa */}
            <button
              type="button"
              onClick={() => updateFormData({ method: 'mpesa' })}
              className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                formData.method === 'mpesa'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">M-Pesa</span>
            </button>

            {/* Bank Transfer */}
            <button
              type="button"
              onClick={() => updateFormData({ method: 'bank_transfer' })}
              className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                formData.method === 'bank_transfer'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Bank Transfer</span>
            </button>

            {/* Paystack */}
            <button
              type="button"
              onClick={() => updateFormData({ method: 'paystack' })}
              className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                formData.method === 'paystack'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Paystack</span>
            </button>
          </div>
        </div>

        {/* Method-specific fields */}
        {formData.method === 'mpesa' && (
          <div>
            <label htmlFor="mpesa-phone" className="block text-sm font-medium text-gray-700 mb-2">
              M-Pesa Phone Number
            </label>
            <input
              id="mpesa-phone"
              name="phone_number"
              type="tel"
              value={formData.phone_number || ''}
              onChange={(e) => updateFormData({ phone_number: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.phone_number ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="254712345678"
              autoComplete="tel"
            />
            {errors.phone_number && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.phone_number}
              </p>
            )}
          </div>
        )}

        {formData.method === 'bank_transfer' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  id="account-name"
                  name="account_name"
                  type="text"
                  value={formData.bank_details?.account_name || ''}
                  onChange={(e) => updateBankDetails({ account_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.account_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                {errors.account_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.account_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  id="account-number"
                  name="account_number"
                  type="text"
                  value={formData.bank_details?.account_number || ''}
                  onChange={(e) => updateBankDetails({ account_number: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.account_number ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1234567890"
                  autoComplete="off"
                />
                {errors.account_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                id="bank-name"
                name="bank_name"
                type="text"
                value={formData.bank_details?.bank_name || ''}
                onChange={(e) => updateBankDetails({ bank_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.bank_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Equity Bank"
                autoComplete="organization"
              />
              {errors.bank_name && (
                <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="payout-notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="payout-notes"
            name="notes"
            value={formData.notes || ''}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Any additional information..."
            autoComplete="off"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Request Payout'}
          </button>
        </div>
      </form>
    </div>
  );
};
