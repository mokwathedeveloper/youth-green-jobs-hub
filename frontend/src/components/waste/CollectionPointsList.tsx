import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Package,
  Navigation,
  Filter,
  Search,
  ExternalLink,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { wasteApi } from '../../services/api';
import type { CollectionPoint, MapLocation } from '../../types/waste';

interface CollectionPointsListProps {
  onPointSelect?: (point: CollectionPoint) => void;
  selectedPointId?: string;
  showMap?: boolean;
}

export const CollectionPointsList: React.FC<CollectionPointsListProps> = ({
  onPointSelect,
  selectedPointId,
  showMap = true
}) => {
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setUserLocation] = useState<MapLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    point_type: '',
    county: 'Kisumu'
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Load collection points
  useEffect(() => {
    const loadCollectionPoints = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await wasteApi.getCollectionPoints({
          county: filters.county,
          point_type: filters.point_type || undefined,
          is_active: true,
          page_size: 100
        });
        setCollectionPoints(response.results);
      } catch (error) {
        console.error('Failed to load collection points:', error);
        setError('Failed to load collection points. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCollectionPoints();
  }, [filters.county, filters.point_type]);

  // Filter and search points
  useEffect(() => {
    let filtered = collectionPoints;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(point =>
        point.name.toLowerCase().includes(searchLower) ||
        point.address.toLowerCase().includes(searchLower) ||
        point.point_type.toLowerCase().includes(searchLower) ||
        point.accepted_categories.some(cat => 
          cat.name.toLowerCase().includes(searchLower)
        )
      );
    }
    
    setFilteredPoints(filtered);
  }, [collectionPoints, searchTerm]);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await wasteApi.getCurrentLocation();
      setUserLocation(location);
      
      // Load nearby collection points
      const nearbyPoints = await wasteApi.getNearbyCollectionPoints(
        location.latitude,
        location.longitude,
        20
      );
      setCollectionPoints(nearbyPoints.collection_points);
    } catch (error) {
      console.error('Failed to get location:', error);
      alert('Failed to get your location. Please ensure location services are enabled.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const getPointTypeDisplay = (pointType: string): string => {
    switch (pointType) {
      case 'drop_off': return 'Drop-off Point';
      case 'collection': return 'Collection Center';
      case 'recycling_center': return 'Recycling Center';
      case 'community_center': return 'Community Center';
      default: return pointType.replace('_', ' ');
    }
  };

  const getPointTypeColor = (pointType: string): string => {
    switch (pointType) {
      case 'drop_off': return 'bg-blue-100 text-blue-800';
      case 'collection': return 'bg-green-100 text-green-800';
      case 'recycling_center': return 'bg-purple-100 text-purple-800';
      case 'community_center': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading collection points...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collection Points</h2>
          <p className="text-gray-600">
            {filteredPoints.length} collection point{filteredPoints.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={getCurrentLocation}
            disabled={loadingLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            Find Nearby
          </button>
          
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search collection points..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point Type
              </label>
              <select
                value={filters.point_type}
                onChange={(e) => setFilters({ ...filters, point_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All types</option>
                <option value="drop_off">Drop-off Point</option>
                <option value="collection">Collection Center</option>
                <option value="recycling_center">Recycling Center</option>
                <option value="community_center">Community Center</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ point_type: '', county: 'Kisumu' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Points List */}
      <div className="space-y-4">
        {filteredPoints.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No collection points found.</p>
          </div>
        ) : (
          filteredPoints.map((point) => (
            <div
              key={point.id}
              className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
                selectedPointId === point.id ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
              }`}
              onClick={() => onPointSelect?.(point)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {point.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPointTypeColor(point.point_type)}`}>
                        {getPointTypeDisplay(point.point_type)}
                      </span>
                    </div>
                    {point.distance_km && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {point.distance_km.toFixed(1)} km away
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span>{point.address}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{point.contact_phone}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{point.contact_email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Clock className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span>{point.operating_hours}</span>
                      </div>
                      
                      {point.accepted_categories.length > 0 && (
                        <div className="flex items-start">
                          <Package className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Accepted Categories:</p>
                            <div className="flex flex-wrap gap-1">
                              {point.accepted_categories.slice(0, 4).map((category) => (
                                <span
                                  key={category.id}
                                  className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                                >
                                  {category.name}
                                </span>
                              ))}
                              {point.accepted_categories.length > 4 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{point.accepted_categories.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                  {point.latitude && point.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </a>
                  )}
                  
                  {showMap && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPointSelect?.(point);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View on Map
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
