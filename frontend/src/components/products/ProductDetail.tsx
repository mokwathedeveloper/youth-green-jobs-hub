import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  Leaf, 
  Recycle,
  MapPin,
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import type { Product } from '../../types/products';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  isLoading = false,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

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

  const handleAddToCart = () => {
    if (!isLoading && product.is_in_stock) {
      onAddToCart(product.id, quantity);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock_quantity || 100)) {
      setQuantity(newQuantity);
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)} ({product.total_sales} reviews)
        </span>
      </div>
    );
  };

  const images = product.images.length > 0 ? product.images : [
    { id: '1', image: product.featured_image, alt_text: product.name, sort_order: 0 }
  ];

  return (
    <div className={`bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[selectedImage]?.image || '/api/placeholder/600/600'}
                alt={images[selectedImage]?.alt_text || product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? 'border-green-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Vendor */}
            <div className="flex items-center space-x-2">
              <Link
                to={`/dashboard/vendors/${product.vendor.id}`}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {product.vendor.business_name}
              </Link>
              {product.vendor.is_verified && (
                <Shield className="w-4 h-4 text-green-600" />
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center justify-between">
              {renderRating(product.average_rating)}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{product.view_count} views</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                {product.discount_percentage > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(product.discounted_price)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                      -{product.discount_percentage}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              {product.credit_price && (
                <div className="text-blue-600 font-medium">
                  Or pay with {product.credit_price} credits
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                product.is_in_stock ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  product.is_in_stock ? 'bg-green-600' : 'bg-red-600'
                }`} />
                <span className="font-medium">
                  {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              {product.is_low_stock && product.is_in_stock && (
                <span className="text-orange-600 text-sm">
                  Only {product.stock_quantity} left!
                </span>
              )}
            </div>

            {/* Eco Features */}
            <div className="flex flex-wrap gap-2">
              {product.recyclable && (
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <Recycle className="w-4 h-4" />
                  <span>Recyclable</span>
                </div>
              )}
              {product.biodegradable && (
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <Leaf className="w-4 h-4" />
                  <span>Biodegradable</span>
                </div>
              )}
              {product.carbon_footprint_kg && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Carbon footprint: {product.carbon_footprint_kg}kg CO₂
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.is_in_stock && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock_quantity || 100)}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || isLoading}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-colors ${
                  product.is_in_stock && !isLoading
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {!product.is_in_stock
                    ? 'Out of Stock'
                    : isLoading
                    ? 'Adding...'
                    : 'Add to Cart'
                  }
                </span>
              </button>

              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className={`p-3 border rounded-lg transition-colors ${
                    isFavorite
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}

              <button className="p-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>Free delivery within {product.vendor.county}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <span>Ships from {product.vendor.county}, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                
                {product.eco_friendly_features && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Eco-Friendly Features</h3>
                    <p className="text-gray-700">{product.eco_friendly_features}</p>
                  </div>
                )}

                {product.materials && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Materials</h3>
                    <p className="text-gray-700">{product.materials}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <dl className="space-y-3">
                    {product.sku && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">SKU:</dt>
                        <dd className="font-medium">{product.sku}</dd>
                      </div>
                    )}
                    {product.weight_kg && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Weight:</dt>
                        <dd className="font-medium">{product.weight_kg} kg</dd>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Dimensions:</dt>
                        <dd className="font-medium">{product.dimensions}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium">{product.category.name}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Recyclable:</dt>
                      <dd className={`font-medium ${product.recyclable ? 'text-green-600' : 'text-gray-500'}`}>
                        {product.recyclable ? 'Yes' : 'No'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Biodegradable:</dt>
                      <dd className={`font-medium ${product.biodegradable ? 'text-green-600' : 'text-gray-500'}`}>
                        {product.biodegradable ? 'Yes' : 'No'}
                      </dd>
                    </div>
                    {product.carbon_footprint_kg && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Carbon Footprint:</dt>
                        <dd className="font-medium">{product.carbon_footprint_kg} kg CO₂</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Reviews component will be implemented here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
