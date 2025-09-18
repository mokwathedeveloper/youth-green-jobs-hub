import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * GuestGuard component that redirects authenticated users away from guest-only pages
 * Used for login/register pages that authenticated users shouldn't access
 */
const GuestGuard: React.FC<GuestGuardProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Get the intended destination from location state, or use default
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default GuestGuard;
