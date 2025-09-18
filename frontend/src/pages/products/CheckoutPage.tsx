import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CreditCard, Coins, MapPin, Phone, User, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderCreateSchema, type OrderCreateData } from '../../schemas/productSchemas';
import { productsApi } from '../../services/api';
import type { ShoppingCart } from '../../types/products';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<OrderCreateData>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: {
      payment_method: 'credits'
    }
  });

  const paymentMethod = watch('payment_method');

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await productsApi.getCart();
      setCart(cartData);
      
      if (!cartData || cartData.items.length === 0) {
        navigate('/dashboard/products');
      }
    } catch (err) {
      setError('Failed to load cart. Please try again.');
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const onSubmit = async (data: OrderCreateData) => {
    if (!cart) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare order data
      const orderData: OrderCreateData = {
        ...data,
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const order = await productsApi.createOrder(orderData);

      // Clear cart after successful order
      await productsApi.clearCart();
      
      // Redirect to order confirmation
      navigate(`/dashboard/orders/${order.id}`, {
        state: { orderCreated: true }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order. Please try again.');
      console.error('Error creating order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to your cart before checkout.</p>
          <button
            onClick={() => navigate('/dashboard/products')}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Youth Green Jobs Hub</title>
        <meta name="description" content="Complete your order for eco-friendly products" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              <span className="text-gray-300">/</span>
              <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Delivery Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        County *
                      </label>
                      <input
                        {...register('delivery_county')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Kisumu"
                      />
                      {errors.delivery_county && (
                        <p className="text-red-600 text-sm mt-1">{errors.delivery_county.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-County
                      </label>
                      <input
                        {...register('delivery_sub_county')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Kisumu Central"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      {...register('delivery_address')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full delivery address"
                    />
                    {errors.delivery_address && (
                      <p className="text-red-600 text-sm mt-1">{errors.delivery_address.message}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      {...register('delivery_phone')}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., +254712345678"
                    />
                    {errors.delivery_phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.delivery_phone.message}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions
                    </label>
                    <textarea
                      {...register('delivery_instructions')}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any special delivery instructions (optional)"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('payment_method')}
                        type="radio"
                        value="credits"
                        className="text-green-600 focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center">
                        <Coins className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Pay with Credits</span>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('payment_method')}
                        type="radio"
                        value="mpesa"
                        className="text-green-600 focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center">
                        <Phone className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium">M-Pesa</span>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        {...register('payment_method')}
                        type="radio"
                        value="cash_on_delivery"
                        className="text-green-600 focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center">
                        <User className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Customer Notes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Additional Notes
                  </h2>
                  <textarea
                    {...register('customer_notes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Any additional notes for your order (optional)"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? 'Processing Order...' : 'Place Order'}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.product.featured_image || '/api/placeholder/50/50'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cart.total_items} items)</span>
                    <span className="font-medium">{formatPrice(cart.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(cart.total_amount)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                {paymentMethod === 'credits' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      You'll pay with your earned credits from waste collection activities.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
