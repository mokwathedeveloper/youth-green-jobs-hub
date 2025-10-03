// WalletPage - Role-based Wallet Dashboard Router
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { YouthWalletDashboard } from '../components/wallet';

/**
 * WalletPage component that renders the youth wallet dashboard
 *
 * This is a frontend-only implementation that consumes existing APIs
 */
const WalletPage: React.FC = () => {
  const { user } = useAuth();

  // Show loading state if user data is not yet available
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <YouthWalletDashboard />
    </div>
  );
};

export default WalletPage;
