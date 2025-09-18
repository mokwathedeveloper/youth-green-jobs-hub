import React, { useState } from 'react';
import { Map, List } from 'lucide-react';
import { CollectionPointsMap } from '../components/waste/CollectionPointsMap';
import { CollectionPointsList } from '../components/waste/CollectionPointsList';
import type { CollectionPoint } from '../types/waste';

type ViewMode = 'map' | 'list';

export const CollectionPointsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const handlePointSelect = (point: CollectionPoint) => {
    setSelectedPointId(point.id);
    // If in list view, switch to map to show the selected point
    if (viewMode === 'list') {
      setViewMode('map');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header with View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collection Points</h1>
              <p className="text-gray-600">Find nearby waste collection points and drop-off locations</p>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4 mr-2" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </button>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'map' ? (
            <CollectionPointsMap
              height="600px"
              onPointSelect={handlePointSelect}
              selectedPointId={selectedPointId || undefined}
            />
          ) : (
            <CollectionPointsList
              onPointSelect={handlePointSelect}
              selectedPointId={selectedPointId || undefined}
              showMap={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};
