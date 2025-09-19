import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Building, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { paymentApi } from '../../services/api';
import type { Order, PaymentProvider, PaymentInitiateData } from '../../types/products';

const paymentSchema = z.object({
  provider: z.string().min(1, 'Please select a payment method'),
  customer_phone: z.string().min(10, 'Please enter a valid phone number'),
  customer_email: z.string().email('Please enter a valid email address').optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onPaymentSuccess: (transactionId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}) => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customer_email: order.customer.email,
    },
  });

  const selectedProvider = watch('provider');

  useEffect(() => {
    if (isOpen) {
      loadPaymentProviders();
    }
  }, [isOpen]);

  const loadPaymentProviders = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getPaymentProviders();
      setProviders(response.providers);
    } catch (err) {
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setPaymentInProgress(true);
      setError(null);

      const paymentData: PaymentInitiateData = {
        order_id: order.id,
        provider: data.provider,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
      };

      const result = await paymentApi.initiatePayment(paymentData);

      if (result.success) {
        // Handle different payment methods
        if (data.provider === 'mpesa') {
          // For M-Pesa, show STK push message
          alert('Please check your phone for M-Pesa payment prompt');
          // Start polling for payment status
          pollPaymentStatus(result.transaction_id!);
        } else if (data.provider === 'paystack') {
          // For Paystack, redirect to payment page
          if (result.data?.authorization_url) {
            window.open(result.data.authorization_url, '_blank');
            // Start polling for payment status
            pollPaymentStatus(result.transaction_id!);
          }
        } else {
          // For other methods, show success message
          onPaymentSuccess(result.transaction_id!);
          onClose();
        }
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaymentInProgress(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const result = await paymentApi.verifyPayment(transactionId);
        
        if (result.success) {
          onPaymentSuccess(transactionId);
          onClose();
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setError('Payment verification timeout. Please check your payment status.');
          setPaymentInProgress(false);
        }
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setError('Failed to verify payment status');
          setPaymentInProgress(false);
        }
      }
    };

    poll();
  };

  const getProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'mpesa':
        return <Smartphone className="w-5 h-5" />;
      case 'paystack':
        return <CreditCard className="w-5 h-5" />;
      case 'bank_transfer':
        return <Building className="w-5 h-5" />;
      case 'cash_on_delivery':
        return <Truck className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getProviderDescription = (provider: PaymentProvider) => {
    switch (provider.name) {
      case 'mpesa':
        return 'Pay using M-Pesa mobile money';
      case 'paystack':
        return 'Pay with card, bank transfer, or mobile money';
      case 'bank_transfer':
        return 'Direct bank transfer';
      case 'cash_on_delivery':
        return 'Pay when your order is delivered';
      default:
        return provider.display_name;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={paymentInProgress}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Order Total:</span>
            <span className="font-semibold">KSh {order.total_amount.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Order #{order.order_number}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {paymentInProgress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-600 text-sm">
              Processing payment... Please wait and do not close this window.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            {loading ? (
              <div className="text-center py-4">Loading payment methods...</div>
            ) : (
              <div className="space-y-2">
                {providers.map((provider) => (
                  <label
                    key={provider.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedProvider === provider.name
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      value={provider.name}
                      {...register('provider')}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      {getProviderIcon(provider.name)}
                      <div>
                        <div className="font-medium">{provider.display_name}</div>
                        <div className="text-sm text-gray-500">
                          {getProviderDescription(provider)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Min: KSh {provider.min_amount} - Max: KSh {provider.max_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.provider && (
              <p className="text-red-500 text-sm mt-1">{errors.provider.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              {...register('customer_phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0712345678"
            />
            {errors.customer_phone && (
              <p className="text-red-500 text-sm mt-1">{errors.customer_phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('customer_email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
            />
            {errors.customer_email && (
              <p className="text-red-500 text-sm mt-1">{errors.customer_email.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={paymentInProgress}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={paymentInProgress}
              disabled={loading || paymentInProgress}
              className="flex-1"
            >
              Pay KSh {order.total_amount.toLocaleString()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
