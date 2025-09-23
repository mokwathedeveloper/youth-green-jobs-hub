import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { WasteReportsList } from '../components/waste/WasteReportsList';
import { WasteReportForm } from '../components/waste/WasteReportForm';
import { WasteReportDetail } from '../components/waste/WasteReportDetail';
import { useAuth } from '../contexts/AuthContext';

type ViewMode = 'list' | 'create' | 'detail';

export const WasteReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Check URL parameters on component mount
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setViewMode('create');
      // Clear the action parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setViewMode('detail');
  };

  const handleCreateReport = () => {
    setViewMode('create');
  };

  const handleReportCreated = (reportId: string) => {
    setSelectedReportId(reportId);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedReportId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Waste Reports</h1>
                <p className="text-gray-600">Track your waste reporting activities and impact</p>
              </div>
              <button
                onClick={handleCreateReport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Waste
              </button>
            </div>
            
            <WasteReportsList 
              onViewReport={handleViewReport}
              userId={user?.id?.toString()}
            />
          </div>
        )}

        {viewMode === 'create' && (
          <WasteReportForm
            onSuccess={handleReportCreated}
            onCancel={handleBack}
          />
        )}

        {viewMode === 'detail' && selectedReportId && (
          <WasteReportDetail
            reportId={selectedReportId}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};
