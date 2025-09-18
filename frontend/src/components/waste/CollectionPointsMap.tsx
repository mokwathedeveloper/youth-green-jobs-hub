import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Filter, 
  Phone,
  Clock,
  Package,
  Loader2,
  AlertCircle,
  ExternalLink,
  Target
} from 'lucide-react';
import { wasteApi } from '../../services/api';
import type { CollectionPoint, MapLocation } from '../../types/waste';
import 'leaflet/dist/leaflet.css';

// Note: In a production environment, you would need to properly configure Leaflet CSS
// and ensure the marker images are available in your public directory

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CollectionPointsMapProps {
  height?: string;
  showFilters?: boolean;
  onPointSelect?: (point: CollectionPoint) => void;
  selectedPointId?: string;
}

// Custom hook to fit map bounds
const FitBounds: React.FC<{ points: CollectionPoint[] }> = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length > 0) {
      const validPoints = points.filter(p => p.latitude && p.longitude);
      if (validPoints.length > 0) {
        const bounds = new LatLngBounds(
          validPoints.map(p => [parseFloat(p.latitude!), parseFloat(p.longitude!)])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [points, map]);

  return null;
};

export const CollectionPointsMap: React.FC<CollectionPointsMapProps> = ({
  height = '500px',
  showFilters = true,
  onPointSelect,
  selectedPointId
}) => {
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [filters, setFilters] = useState({
    point_type: '',
    county: 'Kisumu',
    search: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const mapRef = useRef<any>(null);

  // Default center (Kisumu, Kenya)
  const defaultCenter: [number, number] = [-0.0917, 34.7680];

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

  // Filter points based on search
  useEffect(() => {
    let filtered = collectionPoints;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(point =>
        point.name.toLowerCase().includes(searchLower) ||
        point.address.toLowerCase().includes(searchLower) ||
        point.point_type.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredPoints(filtered);
  }, [collectionPoints, filters.search]);

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

  const getPointTypeIcon = (pointType: string): string => {
    switch (pointType) {
      case 'drop_off': return '📦';
      case 'collection': return '🚛';
      case 'recycling_center': return '♻️';
      case 'community_center': return '🏢';
      default: return '📍';
    }
  };

  const getPointTypeColor = (pointType: string): string => {
    switch (pointType) {
      case 'drop_off': return '#3B82F6';
      case 'collection': return '#10B981';
      case 'recycling_center': return '#8B5CF6';
      case 'community_center': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const createCustomIcon = (pointType: string, isSelected: boolean = false) => {
    const color = isSelected ? '#EF4444' : getPointTypeColor(pointType);
    const size = isSelected ? 35 : 25;
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      `)}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size]
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" style={{ height }}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" style={{ height }}>
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
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Collection Points</h2>
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
          
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

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
                onClick={() => setFilters({ point_type: '', county: 'Kisumu', search: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
        <MapContainer
          center={userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter}
          zoom={userLocation ? 14 : 12}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={new Icon({
                iconUrl: `data:image/svg+xml;base64,${btoa(`
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `)}`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div className="text-center">
                  <Navigation className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <p className="font-medium">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Collection point markers */}
          {filteredPoints.map((point) => {
            if (!point.latitude || !point.longitude) return null;
            
            const isSelected = selectedPointId === point.id;
            
            return (
              <Marker
                key={point.id}
                position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                icon={createCustomIcon(point.point_type, isSelected)}
                eventHandlers={{
                  click: () => onPointSelect?.(point)
                }}
              >
                <Popup>
                  <div className="min-w-64 max-w-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{point.name}</h3>
                      <span className="text-lg">{getPointTypeIcon(point.point_type)}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{point.address}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{point.contact_phone}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{point.operating_hours}</span>
                      </div>
                      
                      {point.accepted_categories.length > 0 && (
                        <div className="flex items-start">
                          <Package className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {point.accepted_categories.slice(0, 3).map((category) => (
                              <span
                                key={category.id}
                                className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                              >
                                {category.name}
                              </span>
                            ))}
                            {point.accepted_categories.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{point.accepted_categories.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {point.distance_km && (
                        <div className="text-xs text-blue-600 font-medium">
                          {point.distance_km.toFixed(1)} km away
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </a>
                      
                      {onPointSelect && (
                        <button
                          onClick={() => onPointSelect(point)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 flex items-center justify-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Fit bounds to show all points */}
          <FitBounds points={filteredPoints} />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: getPointTypeColor('drop_off') }}
            ></div>
            <span className="text-sm text-gray-600">Drop-off Point</span>
          </div>
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: getPointTypeColor('collection') }}
            ></div>
            <span className="text-sm text-gray-600">Collection Center</span>
          </div>
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: getPointTypeColor('recycling_center') }}
            ></div>
            <span className="text-sm text-gray-600">Recycling Center</span>
          </div>
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: getPointTypeColor('community_center') }}
            ></div>
            <span className="text-sm text-gray-600">Community Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};
