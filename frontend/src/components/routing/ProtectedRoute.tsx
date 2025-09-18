import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: string;
  minAge?: number;
  maxAge?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  requiredRole,
  minAge,
  maxAge,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but route doesn't require auth (like login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Check role-based access
  if (requireAuth && user && requiredRole) {
    // For future role implementation
    // if (user.role !== requiredRole) {
    //   return <Navigate to="/unauthorized" replace />;
    // }
  }

  // Check age restrictions
  if (requireAuth && user && (minAge || maxAge)) {
    const userAge = user.age;
    
    if (minAge && (!userAge || userAge < minAge)) {
      return <Navigate to="/age-restricted" replace />;
    }
    
    if (maxAge && (!userAge || userAge > maxAge)) {
      return <Navigate to="/age-restricted" replace />;
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
