// WalletPage - Role-based Wallet Dashboard Router
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  YouthWalletDashboard, 
  SMEWalletDashboard, 
  AdminWalletDashboard 
} from '../components/wallet';

/**
 * WalletPage component that renders the appropriate wallet dashboard
 * based on the user's role (Youth, SME, or Admin)
 * 
 * This is a frontend-only implementation that consumes existing APIs
 */
const WalletPage: React.FC = () => {
  const { user } = useAuth();

  const renderWalletDashboard = () => {
    // Check user type from existing user properties
    const userType = user?.user_type || 'youth';
    const isAdmin = user?.is_staff || user?.is_superuser;
    const isSME = user?.is_sme_user || userType === 'sme';
    const isYouth = user?.is_youth_user || userType === 'youth';

    // Admin users get the admin dashboard
    if (isAdmin || userType === 'admin') {
      return <AdminWalletDashboard />;
    }
    
    // SME users get the business wallet dashboard
    if (isSME) {
      return <SMEWalletDashboard />;
    }
    
    // Youth users (and default) get the youth wallet dashboard
    if (isYouth || userType === 'youth') {
      return <YouthWalletDashboard />;
    }

    // Fallback to youth dashboard for unknown roles
    return <YouthWalletDashboard />;
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderWalletDashboard()}
      </div>
    </div>
  );
};

export default WalletPage;
