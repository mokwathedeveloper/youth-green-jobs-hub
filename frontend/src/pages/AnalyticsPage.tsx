import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnalyticsDashboard } from '../components/analytics';

const AnalyticsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Analytics - Youth Green Jobs Hub</title>
        <meta name="description" content="View analytics and insights for waste collection and environmental impact" />
      </Helmet>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track your environmental impact and platform insights
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard />
      </div>
    </>
  );
};

export default AnalyticsPage;
