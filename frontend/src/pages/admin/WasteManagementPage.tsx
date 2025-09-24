import React, { useState, useEffect } from 'react';
import {
  Recycle,
  MapPin,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { AdminLayout, DataTable, StatusBadge, KPICard } from '../../components/admin';
import type { TableColumn, TableAction } from '../../components/admin';
import { wasteApi } from '../../services/api';
import type { WasteReportListItem, WasteCategory, CollectionPoint } from '../../types/waste';

interface WasteStats {
  total_reports: number;
  pending_reports: number;
  verified_reports: number;
  collected_reports: number;
  total_waste_kg: number;
  total_credits_awarded: number;
}

const WasteManagementPage: React.FC = () => {
  const [reports, setReports] = useState<WasteReportListItem[]>([]);
  const [, setCategories] = useState<WasteCategory[]>([]);
  const [, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [stats, setStats] = useState<WasteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all waste management data in parallel
      const [reportsResponse, categoriesData, collectionPointsData] = await Promise.all([
        wasteApi.getWasteReports({ page_size: 100 }),
        wasteApi.getCategories(),
        wasteApi.getCollectionPoints({ page_size: 100 })
      ]);

      const allReports = reportsResponse.results || [];
      const allCollectionPoints = collectionPointsData.results || [];

      // Calculate stats from reports data
      const stats: WasteStats = {
        total_reports: allReports.length,
        pending_reports: allReports.filter((r: WasteReportListItem) => r.status === 'reported').length,
        verified_reports: allReports.filter((r: WasteReportListItem) => r.status === 'verified').length,
        collected_reports: allReports.filter((r: WasteReportListItem) => r.status === 'collected' || r.status === 'processed').length,
        total_waste_kg: allReports.reduce((sum: number, r: WasteReportListItem) =>
          sum + parseFloat(r.actual_weight || r.estimated_weight || '0'), 0),
        total_credits_awarded: allReports.reduce((sum: number, r: WasteReportListItem) =>
          sum + parseFloat(r.credits_awarded || '0'), 0)
      };

      setReports(allReports);
      setCategories(categoriesData);
      setCollectionPoints(allCollectionPoints);
      setStats(stats);
    } catch (err: any) {
      console.error('Failed to load waste management data:', err);
      setError('Failed to load waste management data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: WasteReportListItem) => {
    // Navigate to report detail view
    window.open(`/admin/waste/reports/${report.id}`, '_blank');
  };

  const handleApproveReport = async (report: WasteReportListItem) => {
    try {
      // This would need an admin endpoint to update report status
      console.log('Approve report:', report.id);
      // await adminApi.updateWasteReportStatus(report.id, 'verified');
      // loadData(); // Reload data after update
    } catch (err) {
      console.error('Failed to approve report:', err);
    }
  };

  const handleRejectReport = async (report: WasteReportListItem) => {
    try {
      // This would need an admin endpoint to update report status
      console.log('Reject report:', report.id);
      // await adminApi.updateWasteReportStatus(report.id, 'rejected');
      // loadData(); // Reload data after update
    } catch (err) {
      console.error('Failed to reject report:', err);
    }
  };

  const exportReports = () => {
    // Export reports to CSV
    const csvContent = [
      ['ID', 'Reporter', 'Category', 'Status', 'Weight (kg)', 'Location', 'Credits', 'Reported Date'].join(','),
      ...reports.map(report => [
        report.id,
        `${report.reporter.first_name} ${report.reporter.last_name}`,
        report.category.name,
        report.status,
        report.actual_weight || report.estimated_weight,
        report.location_description,
        report.credits_awarded,
        new Date(report.reported_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste_reports_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'warning';
      case 'verified': return 'info';
      case 'collected': return 'success';
      case 'processed': return 'success';
      case 'rejected': return 'error';
      default: return 'neutral';
    }
  };

  const columns: TableColumn<WasteReportListItem>[] = [
    {
      key: 'id',
      label: 'Report ID',
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">
          {value.slice(0, 8)}...
        </span>
      )
    },
    {
      key: 'reporter',
      label: 'Reporter',
      sortable: true,
      render: (reporter) => (
        <div>
          <div className="font-medium text-gray-900">
            {reporter.first_name} {reporter.last_name}
          </div>
          <div className="text-sm text-gray-500">{reporter.username}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (category) => (
        <div>
          <div className="font-medium text-gray-900">{category.name}</div>
          <div className="text-sm text-gray-500 capitalize">{category.category_type}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <StatusBadge 
          status={getStatusColor(value)} 
          text={value.toUpperCase()}
          size="sm"
        />
      )
    },
    {
      key: 'estimated_weight',
      label: 'Weight (kg)',
      sortable: true,
      render: (value, report) => (
        <div>
          <div className="font-medium text-gray-900">
            {report.actual_weight || value} kg
          </div>
          {report.actual_weight && report.actual_weight !== value && (
            <div className="text-sm text-gray-500">Est: {value} kg</div>
          )}
        </div>
      )
    },
    {
      key: 'location_description',
      label: 'Location',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 truncate max-w-32" title={value}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'credits_awarded',
      label: 'Credits',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-green-600">
          {parseFloat(value || '0').toFixed(2)}
        </span>
      )
    },
    {
      key: 'reported_at',
      label: 'Reported',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions: TableAction<WasteReportListItem>[] = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewReport
    },
    {
      label: 'Approve',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleApproveReport,
      className: 'text-green-600 hover:text-green-800',
      show: (report) => report.status === 'reported'
    },
    {
      label: 'Reject',
      icon: <XCircle className="w-4 h-4" />,
      onClick: handleRejectReport,
      className: 'text-red-600 hover:text-red-800',
      show: (report) => report.status === 'reported'
    }
  ];

  return (
    <AdminLayout
      title="Waste Management"
      subtitle="Monitor and approve waste collection reports"
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={exportReports}
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
          title="Total Reports"
          value={stats?.total_reports || 0}
          icon={<Recycle className="w-6 h-6" />}
          color="blue"
          loading={loading}
        />
        <KPICard
          title="Pending"
          value={stats?.pending_reports || 0}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
        <KPICard
          title="Verified"
          value={stats?.verified_reports || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="indigo"
          loading={loading}
        />
        <KPICard
          title="Collected"
          value={stats?.collected_reports || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <KPICard
          title="Total Waste (kg)"
          value={stats?.total_waste_kg.toFixed(1) || '0.0'}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          loading={loading}
        />
        <KPICard
          title="Credits Awarded"
          value={stats?.total_credits_awarded.toFixed(0) || '0'}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
      </div>

      {/* Reports Table */}
      <DataTable
        data={reports}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No waste reports found"
      />
    </AdminLayout>
  );
};

export default WasteManagementPage;
