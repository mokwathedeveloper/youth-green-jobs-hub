import React, { useState, useEffect } from 'react';
import {
  Package,
  Store,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { AdminLayout, DataTable, StatusBadge, KPICard } from '../../components/admin';
import type { TableColumn, TableAction } from '../../components/admin';
import { productsApi } from '../../services/api';
import type { ProductListItem, SMEVendorListItem, ProductCategory } from '../../types/products';

interface ProductStats {
  total_products: number;
  pending_products: number;
  approved_products: number;
  total_vendors: number;
  total_categories: number;
  total_sales: number;
}

const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [, setVendors] = useState<SMEVendorListItem[]>([]);
  const [, setCategories] = useState<ProductCategory[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all product management data in parallel
      const [productsResponse, vendorsData, categoriesData] = await Promise.all([
        productsApi.getProducts({ page_size: '100' }),
        productsApi.getVendors({ page_size: '100' }),
        productsApi.getProductCategories()
      ]);

      const allProducts = productsResponse.results || [];
      const allVendors = vendorsData.results || [];

      // Calculate stats from products data
      const stats: ProductStats = {
        total_products: allProducts.length,
        pending_products: allProducts.filter((p: ProductListItem) => !p.is_featured).length, // Use is_featured as proxy for approval
        approved_products: allProducts.filter((p: ProductListItem) => p.is_featured).length,
        total_vendors: allVendors.length,
        total_categories: categoriesData.length,
        total_sales: allProducts.reduce((sum: number, p: ProductListItem) =>
          sum + (p.total_sales || 0), 0)
      };

      setProducts(allProducts);
      setVendors(allVendors);
      setCategories(categoriesData);
      setStats(stats);
    } catch (err: any) {
      console.error('Failed to load product management data:', err);
      setError('Failed to load product management data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product: ProductListItem) => {
    // Navigate to product detail view
    window.open(`/admin/products/${product.id}`, '_blank');
  };

  const handleApproveProduct = async (product: ProductListItem) => {
    try {
      // This would need an admin endpoint to update product approval status
      console.log('Approve product:', product.id);
      // await adminApi.updateProductApproval(product.id, true);
      // loadData(); // Reload data after update
    } catch (err) {
      console.error('Failed to approve product:', err);
    }
  };

  const handleRejectProduct = async (product: ProductListItem) => {
    try {
      // This would need an admin endpoint to update product approval status
      console.log('Reject product:', product.id);
      // await adminApi.updateProductApproval(product.id, false);
      // loadData(); // Reload data after update
    } catch (err) {
      console.error('Failed to reject product:', err);
    }
  };

  const exportProducts = () => {
    // Export products to CSV
    const csvContent = [
      ['ID', 'Name', 'Vendor', 'Category', 'Price (KSh)', 'Credit Price', 'Status', 'Sales', 'Rating', 'Created Date'].join(','),
      ...products.map(product => [
        product.id,
        product.name,
        product.vendor?.business_name || 'N/A',
        product.category?.name || 'N/A',
        product.price,
        product.credit_price || 'N/A',
        product.is_featured ? 'Featured' : 'Standard',
        product.total_sales || 0,
        product.average_rating || 0,
        new Date(product.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getProductStatus = (product: ProductListItem) => {
    if (product.is_featured) return 'featured';
    return 'standard';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'featured': return 'success';
      case 'standard': return 'neutral';
      default: return 'neutral';
    }
  };

  const columns: TableColumn<ProductListItem>[] = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, product) => (
        <div className="flex items-center space-x-3">
          {product.featured_image && (
            <img
              src={product.featured_image}
              alt={product.name}
              className="w-10 h-10 rounded-md object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 truncate max-w-48">
              {product.short_description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'vendor',
      label: 'Vendor',
      sortable: true,
      render: (vendor) => (
        <div>
          <div className="font-medium text-gray-900">
            {vendor?.business_name || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {vendor?.county || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (category) => category?.name || 'N/A'
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value, product) => (
        <div>
          <div className="font-medium text-gray-900">
            KSh {parseFloat(value).toFixed(2)}
          </div>
          {product.credit_price && (
            <div className="text-sm text-green-600">
              {product.credit_price.toFixed(0)} credits
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, product) => {
        const status = getProductStatus(product);
        return (
          <StatusBadge 
            status={getStatusColor(status)} 
            text={status.toUpperCase()}
            size="sm"
          />
        );
      }
    },
    {
      key: 'total_sales',
      label: 'Sales',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value || 0}
        </span>
      )
    },
    {
      key: 'average_rating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-900">
            {parseFloat(value || '0').toFixed(1)}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions: TableAction<ProductListItem>[] = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewProduct
    },
    {
      label: 'Feature',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleApproveProduct,
      className: 'text-green-600 hover:text-green-800',
      show: (product) => !product.is_featured
    },
    {
      label: 'Unfeature',
      icon: <XCircle className="w-4 h-4" />,
      onClick: handleRejectProduct,
      className: 'text-red-600 hover:text-red-800',
      show: (product) => product.is_featured
    }
  ];

  return (
    <AdminLayout
      title="Product Management"
      subtitle="Monitor and approve eco-friendly products from SME vendors"
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={exportProducts}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <KPICard
          title="Total Products"
          value={stats?.total_products || 0}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          loading={loading}
        />
        <KPICard
          title="Pending"
          value={stats?.pending_products || 0}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
        <KPICard
          title="Approved"
          value={stats?.approved_products || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <KPICard
          title="Vendors"
          value={stats?.total_vendors || 0}
          icon={<Store className="w-6 h-6" />}
          color="purple"
          loading={loading}
        />
        <KPICard
          title="Categories"
          value={stats?.total_categories || 0}
          icon={<Package className="w-6 h-6" />}
          color="indigo"
          loading={loading}
        />
        <KPICard
          title="Total Sales"
          value={stats?.total_sales || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
      </div>

      {/* Products Table */}
      <DataTable
        data={products}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No products found"
      />
    </AdminLayout>
  );
};

export default ProductManagementPage;
