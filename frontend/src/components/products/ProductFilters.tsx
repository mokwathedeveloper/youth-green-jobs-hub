import React, { useState, useEffect } from 'react';
import { X, Filter, Leaf, Recycle, MapPin, DollarSign } from 'lucide-react';
import type { ProductSearchParams, ProductCategory } from '../../types/products';
import { kenyaCounties } from '../../schemas/productSchemas';

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductSearchParams) => void;
  onClose: () => void;
  initialFilters?: ProductSearchParams;
  categories?: ProductCategory[];
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  onFiltersChange,
  onClose,
  initialFilters = {},
  categories = [],
  className = ''
}) => {
  const [filters, setFilters] = useState<ProductSearchParams>(initialFilters);
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.min_price || '',
    max: initialFilters.max_price || ''
  });

  useEffect(() => {
    setFilters(initialFilters);
    setPriceRange({
      min: initialFilters.min_price || '',
      max: initialFilters.max_price || ''
    });
  }, [initialFilters]);

  const handleFilterChange = (key: keyof ProductSearchParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);
    
    const newFilters = {
      ...filters,
      min_price: newPriceRange.min ? newPriceRange.min : undefined,
      max_price: newPriceRange.max ? newPriceRange.max : undefined
    };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    setPriceRange({ min: '', max: '' });
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof ProductSearchParams] !== undefined && 
    filters[key as keyof ProductSearchParams] !== ''
  );

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Price Range (KES)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min price"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max price"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            County
          </label>
          <select
            value={filters.county || ''}
            onChange={(e) => handleFilterChange('county', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Counties</option>
            {kenyaCounties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>

        {/* Eco-Friendly Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Eco-Friendly Features
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.eco_friendly === 'true'}
                onChange={(e) => 
                  handleFilterChange('eco_friendly', e.target.checked ? 'true' : undefined)
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <Leaf className="w-4 h-4 text-green-600 mr-1" />
                Eco-Friendly Products Only
              </span>
            </label>
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Availability
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.in_stock === true}
                onChange={(e) => 
                  handleFilterChange('in_stock', e.target.checked ? true : undefined)
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                In Stock Only
              </span>
            </label>
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('ordering', '-average_rating')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.ordering === '-average_rating'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Highest Rated
            </button>
            <button
              onClick={() => handleFilterChange('ordering', '-total_sales')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.ordering === '-total_sales'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Best Selling
            </button>
            <button
              onClick={() => handleFilterChange('ordering', 'price')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.ordering === 'price'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Lowest Price
            </button>
            <button
              onClick={() => handleFilterChange('ordering', '-created_at')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.ordering === '-created_at'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Newest
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
