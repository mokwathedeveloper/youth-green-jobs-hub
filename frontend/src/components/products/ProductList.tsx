import React, { useState, useEffect } from 'react';
import { Grid, List, Filter, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import { useProducts } from '../../hooks/useProducts';
import { useOptimizedApi } from '../../hooks/useOptimizedApi';
import { useUserPreferences } from '../../hooks/useLocalStorage';
import { ProductGridSkeleton } from '../ui/LoadingSkeleton';
import ErrorState from '../ui/ErrorState';
import type { ProductSearchParams } from '../../types/products';

interface ProductListProps {
  products?: any[];
  isLoading?: boolean;
  error?: string | null;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onFiltersChange?: (filters: any) => void;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favoriteProducts?: string[];
  showFilters?: boolean;
  showFiltersPanel?: boolean;
  className?: string;
  initialFilters?: ProductSearchParams;
}

export const ProductList: React.FC<ProductListProps> = ({
  products: propProducts,
  isLoading: propIsLoading,
  error: propError,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onFiltersChange,
  onAddToCart,
  onToggleFavorite,
  favoriteProducts = [],
  showFilters = true,
  showFiltersPanel: propShowFiltersPanel,
  className = '',
  initialFilters = {}
}) => {
  const {
    products: hookProducts,
    productsLoading,
    productsError,
    searchProducts,
  } = useProducts();

  const { preferences, updatePreference } = useUserPreferences();

  // Use props if provided, otherwise use hook data
  const products = propProducts || hookProducts || [];
  const isLoading = propIsLoading !== undefined ? propIsLoading : productsLoading;
  const error = propError !== undefined ? propError : productsError;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(preferences.dashboardLayout);
  const [showFiltersPanel, setShowFiltersPanel] = useState(propShowFiltersPanel || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Update preferences when view mode changes
  useEffect(() => {
    if (viewMode !== preferences.dashboardLayout) {
      updatePreference('dashboardLayout', viewMode);
    }
  }, [viewMode, preferences.dashboardLayout, updatePreference]);

  useEffect(() => {
    if (!propProducts) {
      searchProducts({ ...initialFilters, q: searchQuery, ordering: sortBy } as any);
    }
  }, [searchProducts, initialFilters, searchQuery, sortBy, propProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFiltersChange) {
      onFiltersChange({ q: searchQuery, ordering: sortBy });
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    if (onFiltersChange) {
      onFiltersChange({ q: searchQuery, ordering: newSortBy });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              page === currentPage
                ? 'text-white bg-green-600 border border-green-600'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
        <Search className="w-full h-full" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
      <p className="text-gray-500 mb-4">
        Try adjusting your search criteria or filters to find what you're looking for.
      </p>
      <button
        onClick={() => {
          setSearchQuery('');
          setSortBy('name');
          onFiltersChange?.({});
        }}
        className="text-green-600 hover:text-green-700 font-medium"
      >
        Clear all filters
      </button>
    </div>
  );

  const renderLoadingState = () => (
    <ProductGridSkeleton items={preferences.defaultPageSize || 8} />
  );

  const renderErrorState = () => (
    <ErrorState
      error={error}
      title="Error loading products"
      variant="card"
      showRetry={true}
      onRetry={() => {
        if (onFiltersChange) {
          onFiltersChange({ q: searchQuery, ordering: sortBy });
        } else {
          window.location.reload();
        }
      }}
    />
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="price">Price Low-High</option>
            <option value="-price">Price High-Low</option>
            <option value="-average_rating">Highest Rated</option>
            <option value="-total_sales">Best Selling</option>
            <option value="-created_at">Newest First</option>
          </select>

          {/* Filters Toggle */}
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                showFiltersPanel
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          )}

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && !error && (
        <div className="text-sm text-gray-600">
          Showing {products.length} of {totalCount} products
        </div>
      )}

      {/* Filters Panel */}
      {showFiltersPanel && showFilters && onFiltersChange && (
        <ProductFilters
          onFiltersChange={onFiltersChange}
          onClose={() => setShowFiltersPanel(false)}
        />
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Products Grid/List */}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favoriteProducts.includes(product.id)}
                className={viewMode === 'list' ? 'flex' : ''}
              />
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ProductList;
