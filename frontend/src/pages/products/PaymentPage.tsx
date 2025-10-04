import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, 
  Phone, 
  Coins, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { productsApi } from '../../services/api';
import { Order } from '../../types/products';

interface PaymentProvider {
  name: string;
  display_name: string;
  min_amount: number;
  max_amount: number;
}

interface PaymentResult {
  success: boolean;
  message: string;
  transaction_id?: string;
  external_id?: string;
  data?: any;
}

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrderAndProviders();
    }
  }, [orderId]);

  const loadOrderAndProviders = async () => {
    try {
      setIsLoading(true);
      
      // Load order details
      const orderResponse = await productsApi.getOrder(orderId!);
      setOrder(orderResponse);
      
      // Pre-fill phone from order
      if (orderResponse.delivery_phone) {
        setCustomerPhone(orderResponse.delivery_phone);
      }
      
      // Load payment providers
      const providersResponse = await fetch('/api/v1/products/payments/providers/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (providersResponse.ok) {
        const data = await providersResponse.json();
        setProviders(data.providers || []);
      }
      
    } catch (err: any) {
      setError('Failed to load payment information');
      console.error('Error loading payment data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!order) return;
    
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      setError(null);
      
      // Handle different payment methods
      if (order.payment_method === 'credits') {
        // For credits, initiate payment directly
        const response = await fetch('/api/v1/products/payments/initiate/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            order_id: order.id,
            provider: 'credits',
            customer_phone: customerPhone,
            customer_email: order.customer_email || ''
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setPaymentStatus('success');
          setPaymentResult(result);
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate(`/dashboard/orders/${order.id}`, {
              state: { paymentSuccess: true }
            });
          }, 2000);
        } else {
          setPaymentStatus('failed');
          setError(result.message || 'Payment failed');
        }
        
      } else if (order.payment_method === 'mpesa') {
        // For M-Pesa, initiate STK push
        if (!customerPhone) {
          setError('Please enter your phone number for M-Pesa payment');
          setIsProcessing(false);
          return;
        }
        
        const response = await fetch('/api/v1/products/payments/initiate/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            order_id: order.id,
            provider: 'mpesa',
            customer_phone: customerPhone,
            customer_email: order.customer_email || ''
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setPaymentResult(result);
          // Start polling for payment status
          pollPaymentStatus(result.transaction_id);
        } else {
          setPaymentStatus('failed');
          setError(result.message || 'Failed to initiate M-Pesa payment');
        }
        
      } else if (order.payment_method === 'cash_on_delivery') {
        // For cash on delivery, mark as confirmed
        setPaymentStatus('success');
        setPaymentResult({
          success: true,
          message: 'Order confirmed for cash on delivery'
        });
        
        setTimeout(() => {
          navigate(`/dashboard/orders/${order.id}`, {
            state: { paymentSuccess: true }
          });
        }, 2000);
      }
      
    } catch (err: any) {
      setPaymentStatus('failed');
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/v1/products/payments/verify/${transactionId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        const result = await response.json();
        
        if (result.success && result.status === 'completed') {
          setPaymentStatus('success');
          setPaymentResult(result);
          
          setTimeout(() => {
            navigate(`/dashboard/orders/${order!.id}`, {
              state: { paymentSuccess: true }
            });
          }, 2000);
          
        } else if (result.status === 'failed') {
          setPaymentStatus('failed');
          setError(result.message || 'Payment failed');
          
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus('failed');
          setError('Payment verification timeout. Please check your payment status.');
        }
        
      } catch (err) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus('failed');
          setError('Failed to verify payment status');
        }
      }
    };
    
    poll();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'credits':
        return <Coins className="w-6 h-6 text-blue-600" />;
      case 'mpesa':
        return <Phone className="w-6 h-6 text-green-600" />;
      case 'cash_on_delivery':
        return <CreditCard className="w-6 h-6 text-orange-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Clock className="w-8 h-8 text-gray-600" />;
    }
  };

  const formatPrice = (price: number | string) => {
    // Convert to number if it's a string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Check if the conversion resulted in a valid number
    if (isNaN(numericPrice)) {
      console.warn('Invalid price value:', price);
      return 'KSh 0';
    }

    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're trying to pay for could not be found.</p>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600">Order #{order.order_number}</p>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            {getStatusIcon()}
            <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              {paymentStatus === 'pending' && 'Ready to Pay'}
              {paymentStatus === 'processing' && 'Processing Payment...'}
              {paymentStatus === 'success' && 'Payment Successful!'}
              {paymentStatus === 'failed' && 'Payment Failed'}
            </h2>
            
            {paymentResult && (
              <p className="text-gray-600 mb-4">{paymentResult.message}</p>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">{formatPrice(order.total_amount)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method</span>
              <div className="flex items-center">
                {getPaymentIcon(order.payment_method)}
                <span className="ml-2 font-medium capitalize">
                  {order.payment_method.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            {order.payment_method === 'mpesa' && paymentStatus === 'pending' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number for M-Pesa
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g., +254712345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {paymentStatus === 'pending' && (
          <button
            onClick={initiatePayment}
            disabled={isProcessing}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(order.total_amount)}`}
          </button>
        )}

        {paymentStatus === 'processing' && order.payment_method === 'mpesa' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">M-Pesa Payment Instructions</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Check your phone for the M-Pesa prompt</li>
              <li>2. Enter your M-Pesa PIN to complete the payment</li>
              <li>3. Wait for confirmation (this may take a few moments)</li>
            </ol>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <button
            onClick={() => {
              setPaymentStatus('pending');
              setError(null);
              setPaymentResult(null);
            }}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
