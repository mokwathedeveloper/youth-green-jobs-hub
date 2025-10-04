import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Leaf, Award, TrendingUp } from 'lucide-react';
import { ProductList } from '../../components/products';
import { productsApi } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import type { ProductListItem, ProductSearchParams, ProductCategory } from '../../types/products';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);

  // Cart hook for managing cart state
  const { addToCart, addToCartLoading } = useCart();

  // Convert URL search params to API params
  const getFiltersFromURL = (): ProductSearchParams => {
    const filters: ProductSearchParams = {};
    
    if (searchParams.get('q')) filters.q = searchParams.get('q')!;
    if (searchParams.get('category')) filters.category = searchParams.get('category')!;
    if (searchParams.get('min_price')) filters.min_price = searchParams.get('min_price')!;
    if (searchParams.get('max_price')) filters.max_price = searchParams.get('max_price')!;
    if (searchParams.get('county')) filters.county = searchParams.get('county')!;
    if (searchParams.get('eco_friendly')) filters.eco_friendly = searchParams.get('eco_friendly')!;
    if (searchParams.get('ordering')) filters.ordering = searchParams.get('ordering')!;
    if (searchParams.get('page')) {
      const page = parseInt(searchParams.get('page')!);
      if (!isNaN(page)) setCurrentPage(page);
    }

    return filters;
  };

  // Update URL when filters change
  const updateURL = (filters: ProductSearchParams, page?: number) => {
    const newParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        newParams.set(key, value.toString());
      }
    });
    
    if (page && page > 1) {
      newParams.set('page', page.toString());
    }
    
    setSearchParams(newParams);
  };

  // Fetch products
  const fetchProducts = async (filters: ProductSearchParams = {}, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: page.toString(),
        page_size: '12'
      };
      
      const response = await productsApi.getProducts(params);

      setProducts(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / 12));
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await productsApi.getProductCategories();
      setCategories(response);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    const filters = getFiltersFromURL();
    const page = parseInt(searchParams.get('page') || '1');
    
    fetchProducts(filters, page);
    fetchCategories();
  }, []);

  // Handle filter changes
  const handleFiltersChange = (filters: ProductSearchParams) => {
    updateURL(filters, 1);
    fetchProducts(filters, 1);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    const filters = getFiltersFromURL();
    updateURL(filters, page);
    fetchProducts(filters, page);
  };

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    try {
      const success = await addToCart(productId, 1);
      if (success) {
        console.log('Product added to cart successfully');
        // You might want to show a success toast here
      } else {
        console.error('Failed to add product to cart');
        // You might want to show an error toast here
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      // You might want to show an error toast here
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

  return (
    <>
      <Helmet>
        <title>Eco-Friendly Products - Youth Green Jobs Hub</title>
        <meta 
          name="description" 
          content="Discover eco-friendly products from verified SME vendors in Kenya. Support local businesses while making sustainable choices." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Eco-Friendly Marketplace
              </h1>
              <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                Discover sustainable products from verified SME vendors across Kenya. 
                Every purchase supports local businesses and environmental conservation.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">{totalCount}+</div>
                  <div className="text-sm text-green-100">Products</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-green-100">Verified Vendors</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-green-100">Eco-Friendly</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-green-100">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Categories */}
          {categories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleFiltersChange({ category: category.id })}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
                  >
                    {category.icon && (
                      <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                    )}
                    <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{category.product_count} products</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product List */}
          <ProductList
            products={products}
            isLoading={isLoading}
            error={error}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            favoriteProducts={favoriteProducts}
            addToCartLoading={addToCartLoading}
            showFilters={true}
          />
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
