import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { AdminGuard } from '../../components/routing/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import AdminDashboardPage from '../../pages/admin/AdminDashboardPage';
import UserManagementPage from '../../pages/admin/UserManagementPage';
import WasteManagementPage from '../../pages/admin/WasteManagementPage';
import ProductManagementPage from '../../pages/admin/ProductManagementPage';

// Mock API calls
jest.mock('../../services/api', () => ({
  analyticsApi: {
    getDashboardSummary: jest.fn().mockResolvedValue({
      total_users: 1250,
      user_growth: 5.2,
      total_waste_collected: 15420,
      waste_growth: 8.1,
      total_sales: 125000,
      sales_growth: 12.3,
      total_co2_reduced: 2840,
      users_today: 23,
      waste_collected_today: 145,
      orders_today: 8,
      credits_earned_today: 340
    }),
    getWasteCollectionTrends: jest.fn().mockResolvedValue({
      labels: ['Day 1', 'Day 2', 'Day 3'],
      datasets: [{ data: [100, 120, 145] }]
    }),
    getUserGrowthTrends: jest.fn().mockResolvedValue({
      labels: ['Day 1', 'Day 2', 'Day 3'],
      datasets: [{ data: [1200, 1225, 1250] }]
    }),
    getMarketplaceTrends: jest.fn().mockResolvedValue({
      labels: ['Day 1', 'Day 2', 'Day 3'],
      datasets: [{ data: [120000, 122500, 125000] }]
    }),
    getDashboardAlerts: jest.fn().mockResolvedValue({
      results: []
    }),
    getSystemHealth: jest.fn().mockResolvedValue({
      status: 'healthy',
      cpu_usage: 45,
      memory_usage: 62,
      disk_usage: 78,
      response_time: 120,
      active_alerts: 0
    })
  },
  authApi: {
    getUsers: jest.fn().mockResolvedValue({
      results: [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          is_active: true,
          is_staff: false,
          date_joined: '2024-01-15T10:30:00Z'
        }
      ],
      count: 1
    })
  },
  wasteApi: {
    getReports: jest.fn().mockResolvedValue({
      results: [
        {
          id: 1,
          collector_name: 'Jane Smith',
          waste_type: 'plastic',
          weight_kg: 25.5,
          status: 'pending',
          created_at: '2024-12-01T14:30:00Z'
        }
      ],
      count: 1
    })
  },
  productsApi: {
    getProducts: jest.fn().mockResolvedValue({
      results: [
        {
          id: 1,
          name: 'Eco-friendly Bag',
          vendor_name: 'Green Vendor',
          price: 500,
          is_featured: false,
          created_at: '2024-11-15T09:00:00Z'
        }
      ],
      count: 1
    })
  }
}));

// Mock user context
const mockUser = {
  id: 1,
  email: 'admin@example.com',
  first_name: 'Admin',
  last_name: 'User',
  is_staff: true,
  is_superuser: false
};

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  getFullName: () => 'Admin User',
  getInitials: () => 'AU',
  isAdmin: () => true,
  isStaff: () => true,
  isSuperuser: () => false
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider value={mockAuthContext as any}>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Admin Dashboard Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AdminGuard', () => {
    it('allows access for staff users', () => {
      render(
        <TestWrapper>
          <AdminGuard>
            <div>Admin Content</div>
          </AdminGuard>
        </TestWrapper>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('denies access for non-staff users', () => {
      const nonStaffContext = {
        ...mockAuthContext,
        user: { ...mockUser, is_staff: false, is_superuser: false },
        isAdmin: () => false,
        isStaff: () => false
      };

      render(
        <BrowserRouter>
          <AuthProvider value={nonStaffContext as any}>
            <AdminGuard>
              <div>Admin Content</div>
            </AdminGuard>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('AdminLayout', () => {
    it('renders navigation menu correctly', () => {
      render(
        <TestWrapper>
          <AdminLayout title="Test Page">
            <div>Content</div>
          </AdminLayout>
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Waste Management')).toBeInTheDocument();
      expect(screen.getByText('Product Management')).toBeInTheDocument();
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('displays user information correctly', () => {
      render(
        <TestWrapper>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </TestWrapper>
      );

      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Staff')).toBeInTheDocument();
    });
  });

  describe('AdminDashboardPage', () => {
    it('renders KPI cards with correct data', async () => {
      render(
        <TestWrapper>
          <AdminDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('1250')).toBeInTheDocument();
        expect(screen.getByText('Waste Collected')).toBeInTheDocument();
        expect(screen.getByText('15420 kg')).toBeInTheDocument();
      });
    });

    it('handles export functionality', async () => {
      // Mock URL.createObjectURL and document.createElement
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      const mockClick = jest.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

      render(
        <TestWrapper>
          <AdminDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const exportButton = screen.getByText('Export CSV');
        expect(exportButton).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('UserManagementPage', () => {
    it('renders user data table', async () => {
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('displays user statistics', async () => {
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  describe('WasteManagementPage', () => {
    it('renders waste reports table', async () => {
      render(
        <TestWrapper>
          <WasteManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Waste Management')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('25.5 kg')).toBeInTheDocument();
      });
    });
  });

  describe('ProductManagementPage', () => {
    it('renders product data table', async () => {
      render(
        <TestWrapper>
          <ProductManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Product Management')).toBeInTheDocument();
        expect(screen.getByText('Eco-friendly Bag')).toBeInTheDocument();
        expect(screen.getByText('Green Vendor')).toBeInTheDocument();
      });
    });
  });

  describe('Data Export Functionality', () => {
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      const mockClick = jest.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
    });

    it('exports CSV data correctly', async () => {
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const exportButton = screen.getByText('Export CSV');
        expect(exportButton).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);

      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      // Mock API to throw error
      const mockAnalyticsApi = require('../../services/api').analyticsApi;
      mockAnalyticsApi.getDashboardSummary.mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <AdminDashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <AdminLayout title="Mobile Test">
            <div>Mobile Content</div>
          </AdminLayout>
        </TestWrapper>
      );

      expect(screen.getByText('Mobile Test')).toBeInTheDocument();
      expect(screen.getByText('Mobile Content')).toBeInTheDocument();
    });
  });
});
