import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ProductDetail, ProductList } from '../../components/products';
import apiClient from '../../services/api';
import type { Product, ProductListItem, ProductRecommendations } from '../../types/products';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);

  // Fetch product details
  const fetchProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [productResponse, recommendationsResponse] = await Promise.all([
        apiClient.getProduct(productId),
        apiClient.getProductRecommendations(productId).catch(() => null) // Don't fail if recommendations fail
      ]);
      
      setProduct(productResponse);
      setRecommendations(recommendationsResponse);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to load product details. Please try again.');
      }
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load product on mount and when ID changes
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    } else {
      setError('Invalid product ID');
      setIsLoading(false);
    }
  }, [id]);

  // Handle add to cart
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      setIsAddingToCart(true);
      await apiClient.addToCart({ product_id: productId, quantity });
      
      // Show success message (you might want to use a toast notification)
      console.log(`Added ${quantity} item(s) to cart successfully`);
      
      // Optionally redirect to cart or show a success message
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Show error message (you might want to use a toast notification)
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (productId: string) => {
    setFavoriteProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    // In a real app, you'd also sync this with the backend
  };

  // Handle recommendation add to cart
  const handleRecommendationAddToCart = async (productId: string) => {
    try {
      await apiClient.addToCart({ product_id: productId, quantity: 1 });
      console.log('Recommended product added to cart successfully');
    } catch (err) {
      console.error('Error adding recommended product to cart:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Product not found' ? 'Product Not Found' : 'Error Loading Product'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Product not found' 
              ? 'The product you\'re looking for doesn\'t exist or has been removed.'
              : error || 'Something went wrong while loading the product details.'
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/products')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse All Products
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - Youth Green Jobs Hub</title>
        <meta name="description" content={product.short_description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.short_description} />
        <meta property="og:image" content={product.featured_image} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => navigate('/dashboard/products')}
                className="text-gray-500 hover:text-gray-700"
              >
                Products
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => navigate(`/dashboard/products?category=${product.category.id}`)}
                className="text-gray-500 hover:text-gray-700"
              >
                {product.category.name}
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium truncate">
                {product.name}
              </span>
            </div>
          </div>
        </div>

        {/* Product Detail */}
        <ProductDetail
          product={product}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favoriteProducts.includes(product.id)}
          isLoading={isAddingToCart}
        />

        {/* Recommendations */}
        {recommendations && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Similar Products */}
              {recommendations.similar_products.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Similar Products
                  </h2>
                  <ProductList
                    products={recommendations.similar_products}
                    onAddToCart={handleRecommendationAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    favoriteProducts={favoriteProducts}
                    showFilters={false}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  />
                </div>
              )}

              {/* More from Vendor */}
              {recommendations.vendor_products.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    More from {product.vendor.business_name}
                  </h2>
                  <ProductList
                    products={recommendations.vendor_products}
                    onAddToCart={handleRecommendationAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    favoriteProducts={favoriteProducts}
                    showFilters={false}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;
