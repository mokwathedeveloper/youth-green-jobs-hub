import React from 'react';
import { WasteDashboard } from '../components/waste/WasteDashboard';
import { useAuth } from '../contexts/AuthContext';

export const WasteDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WasteDashboard userId={user?.id?.toString()} />
      </div>
    </div>
  );
};
