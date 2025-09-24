# Frontend Wallet System Documentation

## Overview

This document describes the **frontend-only wallet system** implementation for the Youth Green Jobs & Waste Recycling Hub. The system provides role-based wallet dashboards that consume existing backend APIs without requiring backend modifications.

## Architecture

### Frontend-Only Approach
- **No backend changes** - Uses existing APIs only
- **Role-based routing** - Different dashboards for Youth, SME, and Admin users
- **Reusable components** - Modular design for maintainability
- **Real-time data** - Consumes live API endpoints

### Technology Stack
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Custom hooks** for state management

## File Structure

```
frontend/src/
├── components/wallet/
│   ├── WalletCard.tsx           # Balance display component
│   ├── TransactionTable.tsx     # Transaction history with filters
│   ├── PayoutForm.tsx          # SME payout request form
│   ├── YouthWalletDashboard.tsx # Youth credit management
│   ├── SMEWalletDashboard.tsx   # Business earnings & payouts
│   ├── AdminWalletDashboard.tsx # System-wide management
│   └── index.ts                # Component exports
├── hooks/
│   └── useWallet.ts            # Wallet state management hook
├── services/
│   └── walletApi.ts            # API service layer
├── types/
│   └── wallet.ts               # TypeScript interfaces
└── pages/
    └── WalletPage.tsx          # Role-based router
```

## API Integration

### Existing APIs Used
The wallet system consumes these existing backend endpoints:

#### Credit Management
- `GET /api/v1/waste/credits/balance/` - User credit balance
- `GET /api/v1/waste/credits/` - Credit transaction history
- `GET /api/v1/waste/dashboard/stats/` - Dashboard statistics

#### Payment Processing
- `GET /api/v1/products/payments/providers/` - Available payment providers
- `POST /api/v1/products/payments/initiate/` - Initiate payment
- `GET /api/v1/products/payments/verify/{id}/` - Verify payment status
- `GET /api/v1/products/payments/history/` - Payment history

### API Service Layer
The `walletApi.ts` service provides:
- **Error handling** - Graceful fallbacks for API failures
- **Data transformation** - Converts API responses to frontend types
- **Utility functions** - Formatting and color helpers
- **Mock implementations** - For features requiring backend development

## Components

### WalletCard
Reusable balance display component with:
- **Real-time balance** from API
- **Earnings/spending breakdown**
- **Refresh functionality**
- **Loading states**

### TransactionTable
Comprehensive transaction display with:
- **Filterable data** (type, date range, search)
- **Pagination support**
- **Responsive design**
- **Loading skeletons**

### PayoutForm
SME payout request form supporting:
- **Multiple payment methods** (M-Pesa, Bank Transfer, Paystack)
- **Form validation**
- **Dynamic fee calculation**
- **Method-specific fields**

## Role-Based Dashboards

### Youth Wallet Dashboard
Features for youth users:
- **Credit balance** and transaction history
- **Credit redemption** (airtime, vouchers, cash, eco-coins)
- **Environmental impact** tracking
- **Quick action buttons**

### SME Wallet Dashboard
Features for business users:
- **Business earnings** overview
- **Payout request** functionality
- **Sales transaction** history
- **Payout status** tracking

### Admin Wallet Dashboard
Features for administrators:
- **System-wide statistics**
- **All user transactions**
- **Payout approval** workflow
- **User wallet** oversight

## Routing

### Role Detection
The system detects user roles using existing user properties:
```typescript
const userType = user?.user_type || 'youth';
const isAdmin = user?.is_staff || user?.is_superuser;
const isSME = user?.is_sme_user || userType === 'sme';
const isYouth = user?.is_youth_user || userType === 'youth';
```

### Route Structure
- `/dashboard/wallet` - Main wallet page (role-based routing)
- Automatically shows appropriate dashboard based on user role
- Fallback to Youth dashboard for unknown roles

## State Management

### useWallet Hook
Custom hook providing:
- **Balance management** - Real-time balance updates
- **Transaction handling** - Fetch and filter transactions
- **Payment processing** - Initiate and verify payments
- **Error handling** - Centralized error management
- **Loading states** - UI feedback during API calls

### Data Flow
1. **Authentication** - User logs in via existing auth system
2. **Role detection** - System determines user type
3. **Dashboard routing** - Appropriate dashboard loads
4. **API consumption** - Real-time data from existing endpoints
5. **State updates** - React hooks manage component state

## Features

### Credit Redemption (Youth)
- **Multiple redemption types** with different fees
- **Phone number validation** for airtime/cash
- **Balance checking** before redemption
- **Success/error feedback**

### Payout Requests (SME)
- **Multi-method support** (M-Pesa, Bank, Paystack)
- **Form validation** with method-specific fields
- **Fee calculation** display
- **Request tracking**

### Admin Management
- **System overview** with key metrics
- **Transaction monitoring** across all users
- **Payout approval** workflow
- **User wallet** inspection

## Styling

### TailwindCSS Classes
- **Consistent color scheme** - Green primary, blue secondary
- **Responsive design** - Mobile-first approach
- **Component variants** - Success, warning, error states
- **Loading animations** - Skeleton screens and spinners

### Design System
- **Cards** - White background with subtle shadows
- **Buttons** - Consistent sizing and hover states
- **Forms** - Proper validation styling
- **Tables** - Responsive with hover effects

## Testing

### Manual Testing
1. **Login** with different user types
2. **Navigate** to `/dashboard/wallet`
3. **Verify** correct dashboard loads
4. **Test** all interactive features
5. **Check** API error handling

### User Types for Testing
- **Youth**: Credit redemption features
- **SME**: Payout request functionality  
- **Admin**: System oversight capabilities

## Future Enhancements

### Backend Integration
When backend wallet endpoints are implemented:
1. Replace mock functions in `walletApi.ts`
2. Update API endpoints in service layer
3. Add real-time WebSocket updates
4. Implement proper error handling

### Additional Features
- **Notification system** for payout updates
- **Export functionality** for transaction history
- **Advanced filtering** and search
- **Mobile app** compatibility

## Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
No additional environment variables required - uses existing API configuration.

### Browser Support
- **Modern browsers** with ES6+ support
- **Mobile responsive** design
- **Progressive enhancement** for older browsers

## Maintenance

### Code Organization
- **Modular components** for easy updates
- **TypeScript interfaces** for type safety
- **Consistent naming** conventions
- **Comprehensive documentation**

### Performance
- **Lazy loading** for dashboard components
- **Memoized calculations** in hooks
- **Optimized re-renders** with React best practices
- **Efficient API calls** with caching

---

This frontend-only implementation provides a complete wallet system that integrates seamlessly with the existing platform while maintaining clean separation of concerns and professional code quality.
