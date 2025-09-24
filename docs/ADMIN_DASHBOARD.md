# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive management interface for the Youth Green Jobs & Waste Recycling Hub platform. It provides administrators with tools to manage users, waste collection reports, SME vendor products, and platform analytics.

## Features

### 🔐 Authentication & Authorization
- **Role-based Access Control**: Uses Django's `is_staff` and `is_superuser` fields
- **JWT Authentication**: Integrates with existing authentication system
- **AdminGuard Component**: Protects all admin routes from unauthorized access
- **Graceful Access Denied**: User-friendly error messages for non-admin users

### 📊 Analytics Dashboard
- **Real-time KPIs**: Total users, waste collected, sales, CO2 reduction
- **Growth Metrics**: Daily growth rates and trends
- **Interactive Charts**: 30-day trends for waste collection, user growth, marketplace
- **System Health Monitoring**: CPU, memory, disk usage, response times
- **Active Alerts**: Real-time system alerts with acknowledge/dismiss actions
- **Export Functionality**: CSV export for analytics data, system reports

### 👥 User Management
- **Comprehensive User Overview**: Total users, active users, new registrations
- **User Details Table**: Name, email, role, status, registration date
- **Search & Filter**: Find users by name, email, or role
- **CSV Export**: Export user data for analysis
- **Role Management**: View user roles (Youth, SME, Staff, Superuser)

### ♻️ Waste Management
- **Report Monitoring**: View all waste collection reports
- **Approval Workflow**: Approve or reject pending waste reports
- **Impact Tracking**: Monitor environmental impact metrics
- **Search & Filter**: Find reports by collector, status, or date
- **CSV Export**: Export waste data for reporting

### 📦 Product Management
- **SME Product Oversight**: Monitor all vendor products
- **Feature/Unfeature**: Promote or demote products in marketplace
- **Product Statistics**: Track product performance and visibility
- **Search & Filter**: Find products by name, vendor, or status
- **CSV Export**: Export product data for analysis

## Technical Architecture

### Frontend Components

#### Core Admin Components
- **AdminLayout**: Consistent layout with navigation sidebar
- **AdminGuard**: Route protection component
- **DataTable**: Reusable table with search, sort, pagination
- **StatusBadge**: Consistent status display component

#### Page Components
- **AdminDashboardPage**: Main analytics dashboard
- **UserManagementPage**: User administration interface
- **WasteManagementPage**: Waste report management
- **ProductManagementPage**: Product catalog oversight

### Styling & Design
- **TailwindCSS**: Utility-first CSS framework
- **SDG Color Scheme**: Green (#2E7D32) and Blue (#1976D2) theme
- **Responsive Design**: Mobile-friendly interface
- **Consistent UI Patterns**: Reusable components across all pages

### API Integration
- **Real Data**: No mock data - all components use actual API endpoints
- **Error Handling**: Comprehensive error states and loading indicators
- **Type Safety**: Full TypeScript integration with proper API types

## Navigation Structure

### Primary Navigation (Management)
1. **Dashboard** - Overview and analytics
2. **User Management** - Manage youth and SME accounts
3. **Waste Management** - Approve waste collection reports
4. **Product Management** - Manage SME vendor products

### Secondary Navigation (Tools)
1. **Reports** - Generate detailed reports (future feature)
2. **Export Data** - Export platform data (integrated in each page)
3. **Settings** - System configuration (future feature)

## API Endpoints Used

### Authentication
- `GET /api/v1/auth/me/` - Current user profile
- `POST /api/v1/auth/logout/` - User logout

### Analytics
- `GET /api/v1/analytics/dashboard-summary/` - Dashboard KPIs
- `GET /api/v1/analytics/waste-collection-trends/` - Waste trends
- `GET /api/v1/analytics/user-growth-trends/` - User growth
- `GET /api/v1/analytics/marketplace-trends/` - Marketplace data
- `GET /api/v1/analytics/dashboard-alerts/` - System alerts
- `GET /api/v1/analytics/system-health/` - System health metrics

### User Management
- `GET /api/v1/auth/users/` - User list with pagination

### Waste Management
- `GET /api/v1/waste/reports/` - Waste reports with pagination
- `PATCH /api/v1/waste/reports/{id}/` - Update report status

### Product Management
- `GET /api/v1/products/products/` - Product list with pagination
- `PATCH /api/v1/products/products/{id}/` - Update product status

## Export Functionality

### CSV Exports
- **User Data**: Name, email, role, status, registration date
- **Waste Reports**: Collector, type, weight, status, date
- **Products**: Name, vendor, price, status, featured status
- **Analytics Summary**: All KPIs with growth metrics

### System Reports
- **Comprehensive Text Reports**: Platform overview, metrics, system health
- **Automated Filename**: Includes date for easy organization
- **Multi-format Support**: CSV for data analysis, TXT for reports

## Security Features

### Access Control
- **Route Protection**: AdminGuard on all admin routes
- **Permission Checks**: Validates `is_staff` or `is_superuser`
- **JWT Validation**: Ensures authenticated access
- **Graceful Degradation**: Proper error handling for unauthorized access

### Data Protection
- **Read-only by Default**: Most operations are view-only
- **Controlled Actions**: Limited write operations (approve/reject, feature/unfeature)
- **Audit Trail**: All actions logged through API calls

## Development Guidelines

### Component Structure
```
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx      # Main layout component
│   │   ├── DataTable.tsx        # Reusable table component
│   │   ├── StatusBadge.tsx      # Status display component
│   │   └── index.ts             # Component exports
│   └── routing/
│       ├── AdminGuard.tsx       # Route protection
│       └── index.ts             # Routing exports
├── pages/admin/
│   ├── AdminDashboardPage.tsx   # Analytics dashboard
│   ├── UserManagementPage.tsx   # User management
│   ├── WasteManagementPage.tsx  # Waste management
│   └── ProductManagementPage.tsx # Product management
└── hooks/
    ├── useAuth.ts               # Enhanced with admin checks
    └── useApi.ts                # API integration hooks
```

### Code Standards
- **TypeScript**: Full type safety with proper interfaces
- **React Hooks**: Modern functional components
- **Error Boundaries**: Comprehensive error handling
- **Loading States**: Proper loading indicators
- **Responsive Design**: Mobile-first approach

## Testing

### Build Verification
```bash
cd frontend
npm run build
```

### Manual Testing Checklist
- [ ] Admin authentication and authorization
- [ ] Dashboard loads with real data
- [ ] User management CRUD operations
- [ ] Waste report approval workflow
- [ ] Product feature/unfeature actions
- [ ] Export functionality works
- [ ] Responsive design on mobile
- [ ] Error handling for API failures

## Deployment Notes

### Environment Requirements
- React 19.1.1+ with TypeScript
- TailwindCSS 4.x
- Vite build system
- Django REST Framework backend
- JWT authentication configured

### Build Process
1. All admin components build successfully
2. No TypeScript errors
3. Proper tree-shaking for production
4. Optimized bundle size

## Future Enhancements

### Planned Features
- **Advanced Reports**: Detailed analytics reports
- **System Settings**: Configuration management
- **Bulk Operations**: Mass user/product actions
- **Real-time Notifications**: WebSocket integration
- **Advanced Filtering**: More sophisticated search options

### Performance Optimizations
- **Code Splitting**: Lazy load admin components
- **Caching**: Implement proper data caching
- **Pagination**: Optimize large data sets
- **Virtual Scrolling**: Handle large tables efficiently

## Support

For technical support or questions about the Admin Dashboard:
1. Check this documentation first
2. Review the component source code
3. Test with the development environment
4. Contact the development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: React 19.1.1, Django REST Framework
