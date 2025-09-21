import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, X, CreditCard, Coins } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';

interface ShoppingCartProps {
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

export const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  onClose,
  isOpen = true,
  className = ''
}) => {
  const {
    cartItems,
    cartSummary,
    cartTotal,
    cartItemCount,
    cartLoading,
    updateCartItem,
    removeFromCart,
    clearCart,
    updateCartLoading,
    removeFromCartLoading,
  } = useCart();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await onUpdateQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await onRemoveItem(itemId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const renderCartItem = (item: CartItem) => {
    const isUpdating = updatingItems.has(item.id);
    
    return (
      <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.product.featured_image || '/api/placeholder/80/80'}
            alt={item.product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/dashboard/products/${item.product.id}`}
            className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2"
          >
            {item.product.name}
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            {item.product.vendor.business_name}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm font-medium text-green-600">
              {formatPrice(item.unit_price)}
            </span>
            {item.product.credit_price && (
              <span className="text-xs text-blue-600">
                {item.product.credit_price} credits
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="w-8 text-center text-sm font-medium">
            {isUpdating ? '...' : item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
            disabled={isUpdating}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(item.total_price)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => handleRemoveItem(item.id)}
          disabled={isUpdating}
          className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderEmptyCart = () => (
    <div className="text-center py-12">
      <CartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">
        Start shopping to add items to your cart
      </p>
      <Link
        to="/dashboard/products"
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        onClick={onClose}
      >
        Browse Products
      </Link>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <CartIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Shopping Cart
            {cart && cart.total_items > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({cart.total_items} items)
              </span>
            )}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Loading cart...</span>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          renderEmptyCart()
        ) : (
          <div className="p-4">
            {/* Cart Items */}
            <div className="space-y-0">
              {cart.items.map(renderCartItem)}
            </div>

            {/* Cart Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
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

              {/* Payment Options Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Coins className="w-4 h-4" />
                  <span>You can pay with credits or cash at checkout</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Link
                  to="/dashboard/checkout"
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  onClick={onClose}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </Link>
                
                <Link
                  to="/dashboard/products"
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  Continue Shopping
                </Link>

                {cart.items.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="w-full text-sm text-red-600 hover:text-red-700 py-2"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
