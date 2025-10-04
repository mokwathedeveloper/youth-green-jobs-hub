import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ToastContainer from './components/ui/ToastContainer';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/routing/ProtectedRoute';
import GuestGuard from './components/routing/GuestGuard';
import AuthGuard from './components/routing/AuthGuard';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProfileForm from './components/auth/ProfileForm';

// Layout Components (to be created)
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';

// Page Components
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import WalletPage from './pages/WalletPage';

// Waste Collection Pages
import { WasteDashboardPage } from './pages/WasteDashboardPage';
import { WasteReportsPage } from './pages/WasteReportsPage';
import { CollectionPointsPage } from './pages/CollectionPointsPage';
import { CollectionEventsPage } from './pages/CollectionEventsPage';
import { CreditTransactionsPage } from './pages/CreditTransactionsPage';

// Product Pages
import { ProductsPage, ProductDetailPage, CheckoutPage, PaymentPage } from './pages/products';



const App: FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ErrorProvider>
          <LoadingProvider>
            <AuthProvider>
              <ToastProvider>
                <Router>
                <div className="App">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
            </Route>

            {/* Guest-only Routes (redirect authenticated users) */}
            <Route path="/login" element={
              <GuestGuard>
                <LoginForm />
              </GuestGuard>
            } />
            <Route path="/register" element={
              <GuestGuard>
                <RegisterForm />
              </GuestGuard>
            } />



            {/* Protected Routes (require authentication) */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfileForm />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="payment/:orderId" element={<PaymentPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />

              {/* Waste Collection Routes */}
              <Route path="waste" element={<WasteDashboardPage />} />
              <Route path="waste/reports" element={<WasteReportsPage />} />
              <Route path="waste/collection-points" element={<CollectionPointsPage />} />
              <Route path="waste/events" element={<CollectionEventsPage />} />
              <Route path="waste/credits" element={<CreditTransactionsPage />} />

              {/* Eco Products Routes */}
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="checkout" element={<CheckoutPage />} />

              {/* Wallet Routes */}
              <Route path="wallet" element={<WalletPage />} />
            </Route>

            {/* Youth-specific Routes (age 18-35) */}
            <Route path="/youth/*" element={
              <ProtectedRoute minAge={18} maxAge={35}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Youth-specific routes will be added here */}
            </Route>

            {/* Catch-all route */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
                    <ToastContainer />
                  </div>
                </Router>
              </ToastProvider>
            </AuthProvider>
          </LoadingProvider>
        </ErrorProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
