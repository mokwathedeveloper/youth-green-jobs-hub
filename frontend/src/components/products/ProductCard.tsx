import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Leaf, Recycle, Heart } from 'lucide-react';
import type { ProductListItem } from '../../types/products';

interface ProductCardProps {
  product: ProductListItem;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  isLoading = false,
  className = ''
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && !isLoading) {
      onAddToCart(product.id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite && !isLoading) {
      onToggleFavorite(product.id);
    }
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const safePrice = isNaN(numericPrice) ? 0 : numericPrice;

    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(safePrice);
  };

  const renderRating = (rating: number | string) => {
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const safeRating = isNaN(numericRating) ? 0 : numericRating;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= safeRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({safeRating.toFixed(1)})
        </span>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}>
      <Link to={`/dashboard/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.featured_image || '/api/placeholder/300/200'}
            alt={product.name}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.is_featured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            {parseFloat(product.discount_percentage.toString()) > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                -{parseFloat(product.discount_percentage.toString()).toFixed(0)}%
              </span>
            )}
            {!product.is_in_stock && (
              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Out of Stock
              </span>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-400 hover:text-red-500'
              }`}
              disabled={isLoading}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Vendor */}
          <p className="text-sm text-green-600 font-medium mb-1">
            {product.vendor.business_name}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.short_description}
          </p>

          {/* Eco Features */}
          <div className="flex items-center space-x-2 mb-3">
            {product.tags_list.includes('recyclable') && (
              <div className="flex items-center text-green-600">
                <Recycle className="w-4 h-4 mr-1" />
                <span className="text-xs">Recyclable</span>
              </div>
            )}
            {product.tags_list.includes('biodegradable') && (
              <div className="flex items-center text-green-600">
                <Leaf className="w-4 h-4 mr-1" />
                <span className="text-xs">Biodegradable</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="mb-3">
            {renderRating(product.average_rating)}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {parseFloat(product.discount_percentage.toString()) > 0 ? (
                <>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.discounted_price)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            {product.credit_price && (
              <div className="text-sm text-blue-600">
                {product.credit_price} credits
              </div>
            )}
          </div>

          {/* Category */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>{product.category.name}</span>
            <span>{parseInt(product.total_sales.toString()) || 0} sold</span>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      {onAddToCart && (
        <div className="px-4 pb-4">
          <button
            onClick={handleAddToCart}
            disabled={!product.is_in_stock || isLoading}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              product.is_in_stock && !isLoading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              {!product.is_in_stock
                ? 'Out of Stock'
                : isLoading
                ? 'Adding...'
                : 'Add to Cart'
              }
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
