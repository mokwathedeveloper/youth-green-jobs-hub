import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Download,
  Eye,
  Edit,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminLayout, DataTable, StatusBadge, KPICard } from '../../components/admin';
import type { TableColumn, TableAction } from '../../components/admin';
import { authApi } from '../../services/api';
import type { User } from '../../types/auth';

interface UserStats {
  total_users: number;
  youth_users: number;
  verified_users: number;
  staff_users: number;
  new_users_today: number;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState({
    county: '',
    employment_status: '',
    youth_only: false
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load users with filters
      const usersResponse = await authApi.getUsers({
        county: filters.county || undefined,
        employment_status: filters.employment_status || undefined,
        youth_only: filters.youth_only || undefined,
        page_size: 100 // Load more users for admin view
      });

      // Calculate stats from users data
      const allUsers = usersResponse.results || usersResponse;
      const stats: UserStats = {
        total_users: allUsers.length,
        youth_users: allUsers.filter((u: User) => u.is_youth).length,
        verified_users: allUsers.filter((u: User) => u.is_verified).length,
        staff_users: allUsers.filter((u: User) => u.is_staff || u.is_superuser).length,
        new_users_today: allUsers.filter((u: User) => {
          const today = new Date().toDateString();
          return new Date(u.date_joined || '').toDateString() === today;
        }).length
      };

      setUsers(allUsers);
      setStats(stats);
    } catch (err: any) {
      console.error('Failed to load user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    // Navigate to user detail view
    window.open(`/admin/users/${user.id}`, '_blank');
  };

  const handleEditUser = (user: User) => {
    // Navigate to user edit form
    window.open(`/admin/users/${user.id}/edit`, '_blank');
  };

  const handleToggleVerification = async (user: User) => {
    try {
      // This would need an admin endpoint to update user verification
      console.log('Toggle verification for user:', user.id);
      // await adminApi.updateUserVerification(user.id, !user.is_verified);
      // loadData(); // Reload data after update
    } catch (err) {
      console.error('Failed to update user verification:', err);
    }
  };

  const handleToggleStaff = async (user: User) => {
    try {
      // This would need an admin endpoint to update user staff status
      console.log('Toggle staff status for user:', user.id);
      // await adminApi.updateUserStaffStatus(user.id, !user.is_staff);
      // loadData(); // Reload data after update
    } catch (err) {
      console.error('Failed to update user staff status:', err);
    }
  };

  const exportUsers = () => {
    // Export users to CSV
    const csvContent = [
      ['ID', 'Username', 'Name', 'Email', 'County', 'Age', 'Employment Status', 'Verified', 'Staff', 'Date Joined'].join(','),
      ...users.map(user => [
        user.id,
        user.username,
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.county || '',
        user.age || '',
        user.employment_status || '',
        user.is_verified ? 'Yes' : 'No',
        user.is_staff || user.is_superuser ? 'Yes' : 'No',
        new Date(user.date_joined || '').toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          {user.profile_picture ? (
            <img 
              src={user.profile_picture} 
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.first_name?.[0] || user.username[0]}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Full Name',
      sortable: true,
      render: (_, user) => `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'
    },
    {
      key: 'county',
      label: 'County',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <span>{value || '-'}</span>
          {user.is_youth && <StatusBadge status="youth" size="sm" />}
        </div>
      )
    },
    {
      key: 'employment_status',
      label: 'Employment',
      sortable: true,
      render: (value) => value ? value.replace('_', ' ').toUpperCase() : '-'
    },
    {
      key: 'is_verified',
      label: 'Verified',
      sortable: true,
      render: (value) => (
        <StatusBadge 
          status={value ? 'verified' : 'unverified'} 
          size="sm"
        />
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (_, user) => {
        if (user.is_superuser) return <StatusBadge status="superuser" size="sm" />;
        if (user.is_staff) return <StatusBadge status="staff" size="sm" />;
        return <StatusBadge status="neutral" text="User" size="sm" />;
      }
    },
    {
      key: 'date_joined',
      label: 'Joined',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions: TableAction<User>[] = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewUser
    },
    {
      label: 'Edit User',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEditUser
    },
    {
      label: 'Toggle Verification',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleToggleVerification,
      className: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Toggle Staff Status',
      icon: <Shield className="w-4 h-4" />,
      onClick: handleToggleStaff,
      className: 'text-purple-600 hover:text-purple-800',
      show: (user) => !user.is_superuser // Don't show for superusers
    }
  ];

  return (
    <AdminLayout
      title="User Management"
      subtitle="Manage youth and SME user accounts"
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={exportUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KPICard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          loading={loading}
        />
        <KPICard
          title="Youth Users"
          value={stats?.youth_users || 0}
          icon={<Users className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <KPICard
          title="Verified Users"
          value={stats?.verified_users || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="indigo"
          loading={loading}
        />
        <KPICard
          title="Staff Users"
          value={stats?.staff_users || 0}
          icon={<Shield className="w-6 h-6" />}
          color="purple"
          loading={loading}
        />
        <KPICard
          title="New Today"
          value={stats?.new_users_today || 0}
          icon={<UserPlus className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No users found"
      />
    </AdminLayout>
  );
};

export default UserManagementPage;
