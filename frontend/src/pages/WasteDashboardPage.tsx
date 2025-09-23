import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WasteDashboard } from '../components/waste/WasteDashboard';
import { useAuth } from '../contexts/AuthContext';

export const WasteDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReportWaste = () => {
    navigate('/dashboard/waste/reports?action=create');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WasteDashboard
          userId={user?.id?.toString()}
          onReportWaste={handleReportWaste}
        />
      </div>
    </div>
  );
};
