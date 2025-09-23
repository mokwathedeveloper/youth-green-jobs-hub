import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, CreditCard, Phone, MapPin, User, Calendar } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Button } from '@/components/ui/button';
import type { Order } from '../types/products';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, orderDetailLoading, orderDetailError, loadOrder } = useProducts();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id, loadOrder]);

  useEffect(() => {
    if (currentOrder) {
      setOrder(currentOrder);
    }
  }, [currentOrder]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refunded':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Phone className="w-4 h-4 text-green-600" />;
      case 'credits':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'cash_on_delivery':
        return <MapPin className="w-4 h-4 text-orange-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  if (orderDetailLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (orderDetailError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/dashboard/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/orders')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.order_number}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium capitalize">
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product?.image || '/placeholder-product.jpg'}
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.product?.category}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  {order.confirmed_at && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                        <p className="text-sm text-gray-600">{formatDate(order.confirmed_at)}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.shipped_at && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Truck className="w-4 h-4 text-indigo-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                        <p className="text-sm text-gray-600">{formatDate(order.shipped_at)}</p>
                        {order.tracking_number && (
                          <p className="text-sm text-gray-600">
                            Tracking: <span className="font-medium">{order.tracking_number}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {order.delivered_at && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                        <p className="text-sm text-gray-600">{formatDate(order.delivered_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {order.credits_used > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Credits Used</span>
                    <span className="font-medium text-blue-600">-{formatPrice(order.credits_used)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center space-x-3">
                {getPaymentMethodIcon(order.payment_method)}
                <span className="font-medium capitalize">
                  {order.payment_method.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">
                      {order.delivery_address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.delivery_county}
                      {order.delivery_sub_county && `, ${order.delivery_sub_county}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{order.delivery_phone}</p>
                  </div>
                </div>
                {order.delivery_instructions && (
                  <div className="flex items-start space-x-3">
                    <Package className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Instructions</p>
                      <p className="text-sm text-gray-600">{order.delivery_instructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === 'pending' && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </Button>
              )}
              <Link to="/dashboard/products" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
