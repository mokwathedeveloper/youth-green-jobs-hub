import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  MapPin, 
  Award,
  Calendar,
  Filter
} from 'lucide-react';
import { ChartCard, KPICard } from '../../components/analytics';
import { analyticsApi } from '../../services/api';
import type { 
  CountyRanking, 
  WasteCategoryBreakdown, 
  TopPerformers,
  EnvironmentalImpactSummary,
  TimeSeriesData
} from '../../types/analytics';

const AnalyticsOverviewPage: React.FC = () => {
  const [countyRankings, setCountyRankings] = useState<CountyRanking[]>([]);
  const [wasteBreakdown, setWasteBreakdown] = useState<WasteCategoryBreakdown[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformers | null>(null);
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpactSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedMetric, setSelectedMetric] = useState('waste_collected');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedMetric]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const [
        rankingsData,
        breakdownData,
        performersData,
        impactData
      ] = await Promise.all([
        analyticsApi.getCountyRankings(selectedMetric, selectedPeriod),
        analyticsApi.getWasteCategoryBreakdown(selectedPeriod),
        analyticsApi.getTopPerformers(selectedPeriod),
        analyticsApi.getEnvironmentalImpactSummary(selectedPeriod)
      ]);

      setCountyRankings(rankingsData);
      setWasteBreakdown(breakdownData);
      setTopPerformers(performersData);
      setEnvironmentalImpact(impactData);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform waste breakdown data for pie chart
  const wasteChartData: TimeSeriesData = {
    labels: wasteBreakdown.map(item => item.category),
    datasets: [{
      label: 'Weight (kg)',
      data: wasteBreakdown.map(item => item.weight_kg),
      borderColor: '#10B981',
      backgroundColor: '#10B981'
    }]
  };

  // Transform county rankings for bar chart
  const countyChartData: TimeSeriesData = {
    labels: countyRankings.slice(0, 10).map(item => item.county),
    datasets: [{
      label: 'Value',
      data: countyRankings.slice(0, 10).map(item => item.value),
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F6'
    }]
  };

  const periodOptions = [
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' }
  ];

  const metricOptions = [
    { value: 'waste_collected', label: 'Waste Collected' },
    { value: 'sales', label: 'Sales' },
    { value: 'credits_earned', label: 'Credits Earned' },
    { value: 'users', label: 'Users' },
    { value: 'co2_reduction', label: 'CO2 Reduction' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Analytics Overview
                </h1>
                <p className="text-gray-600 mt-1">
                  Detailed analytics and performance insights
                </p>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {periodOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {metricOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Environmental Impact KPIs */}
        {environmentalImpact && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Waste Diverted"
              value={`${environmentalImpact.period_totals.waste_diverted_kg.toFixed(1)} kg`}
              subtitle={`${selectedPeriod} days`}
              icon={<BarChart3 className="w-6 h-6" />}
              color="green"
              loading={loading}
            />
            <KPICard
              title="CO2 Reduced"
              value={`${environmentalImpact.period_totals.co2_reduced_kg.toFixed(1)} kg`}
              subtitle={`${selectedPeriod} days`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="blue"
              loading={loading}
            />
            <KPICard
              title="Trees Equivalent"
              value={environmentalImpact.period_totals.trees_equivalent.toFixed(0)}
              subtitle={`${selectedPeriod} days`}
              icon={<Award className="w-6 h-6" />}
              color="green"
              loading={loading}
            />
            <KPICard
              title="Economic Value"
              value={`KSh ${environmentalImpact.period_totals.economic_value_ksh.toFixed(0)}`}
              subtitle={`${selectedPeriod} days`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="yellow"
              loading={loading}
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title={`County Rankings - ${metricOptions.find(m => m.value === selectedMetric)?.label}`}
            data={countyChartData}
            type="bar"
            height={350}
            loading={loading}
          />
          <ChartCard
            title="Waste Category Breakdown"
            data={wasteChartData}
            type="bar"
            height={350}
            loading={loading}
          />
        </div>

        {/* Top Performers */}
        {topPerformers && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Collectors */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-green-600" />
                Top Waste Collectors
              </h3>
              <div className="space-y-3">
                {topPerformers.top_collectors.slice(0, 5).map((collector, index) => (
                  <div key={collector.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{collector.name || collector.username}</p>
                        <p className="text-sm text-gray-500">{collector.reports_submitted} reports</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{collector.waste_collected.toFixed(1)} kg</p>
                      <p className="text-sm text-gray-500">{collector.credits_earned.toFixed(0)} credits</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Counties */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Top Counties
              </h3>
              <div className="space-y-3">
                {topPerformers.top_counties.slice(0, 5).map((county, index) => (
                  <div key={county.county} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{county.county}</p>
                        <p className="text-sm text-gray-500">{county.total_users} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{county.waste_collected.toFixed(1)} kg</p>
                      <p className="text-sm text-gray-500">{county.co2_reduced.toFixed(1)} kg CO2</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Waste Category Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Waste Category Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CO2 Reduced
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits Earned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wasteBreakdown.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.weight_kg.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.co2_reduction.toFixed(1)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.credits_earned.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverviewPage;
