import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  MapPin, 
  Calendar, 
  Weight, 
  Coins, 
  User, 
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { wasteApi } from '../../services/api';
import type { WasteReport } from '../../types/waste';

interface WasteReportDetailProps {
  reportId: string;
  onBack?: () => void;
  showActions?: boolean;
}

export const WasteReportDetail: React.FC<WasteReportDetailProps> = ({
  reportId,
  onBack
}) => {
  const [report, setReport] = useState<WasteReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await wasteApi.getWasteReportById(reportId);
        setReport(data);
      } catch (error) {
        console.error('Failed to load report:', error);
        setError('Failed to load waste report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verified': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'collected': return 'bg-green-100 text-green-800 border-green-200';
      case 'processed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported': return <Clock className="w-5 h-5" />;
      case 'verified': return <AlertCircle className="w-5 h-5" />;
      case 'collected': return <CheckCircle className="w-5 h-5" />;
      case 'processed': return <Package className="w-5 h-5" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading report details...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-600">Report ID: {report.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
            {getStatusIcon(report.status)}
            <span className="ml-2 capitalize">{report.status}</span>
          </span>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityColor(report.priority)}`}>
            <span className="capitalize">{report.priority} Priority</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Photo */}
          {report.photo && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo</h2>
              <img
                src={report.photo}
                alt="Waste report"
                className="w-full max-w-md rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Location Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{report.location_description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">County:</span>
                  <p className="text-gray-600">{report.county}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sub-county:</span>
                  <p className="text-gray-600">{report.sub_county || 'Not specified'}</p>
                </div>
              </div>
              {report.latitude && report.longitude && (
                <div>
                  <span className="font-medium text-gray-700">Coordinates:</span>
                  <p className="text-gray-600">
                    {parseFloat(report.latitude).toFixed(6)}, {parseFloat(report.longitude).toFixed(6)}
                    <a
                      href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Collection Point */}
          {report.collection_point && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Point</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-600">{report.collection_point.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-600">{report.collection_point.address}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {report.collection_point.contact_phone}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {report.collection_point.contact_email}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Operating Hours:</span>
                  <p className="text-gray-600">{report.collection_point.operating_hours}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {report.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{report.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Category
                </span>
                <span className="font-medium">{report.category.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Weight className="w-4 h-4 mr-2" />
                  Weight
                </span>
                <span className="font-medium">
                  {report.actual_weight_kg || report.estimated_weight_kg} kg
                  {!report.actual_weight_kg && (
                    <span className="text-sm text-gray-500 ml-1">(estimated)</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Coins className="w-4 h-4 mr-2" />
                  Credits
                </span>
                <span className="font-medium">
                  {report.actual_credits || report.estimated_credits}
                  {!report.actual_credits && (
                    <span className="text-sm text-gray-500 ml-1">(estimated)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">CO₂ Reduction</span>
                <span className="font-medium">
                  {report.actual_co2_reduction || report.estimated_co2_reduction} kg
                  {!report.actual_co2_reduction && (
                    <span className="text-sm text-gray-500 ml-1">(estimated)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Reporter
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-600">
                  {report.reporter.first_name} {report.reporter.last_name}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Username:</span>
                <p className="text-gray-600">@{report.reporter.username}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{report.reporter.email}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Reported</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {report.verified_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Verified</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(report.verified_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {report.verified_by && (
                      <p className="text-sm text-gray-500">
                        by {report.verified_by.first_name} {report.verified_by.last_name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {report.collected_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Collected</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(report.collected_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {report.collected_by && (
                      <p className="text-sm text-gray-500">
                        by {report.collected_by.first_name} {report.collected_by.last_name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
