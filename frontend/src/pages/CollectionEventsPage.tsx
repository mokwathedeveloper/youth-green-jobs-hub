import React, { useState } from 'react';
import { CollectionEventsList } from '../components/waste/CollectionEventsList';
import { CollectionEventDetail } from '../components/waste/CollectionEventDetail';
import { wasteApi } from '../services/api';

type ViewMode = 'list' | 'detail';

export const CollectionEventsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setViewMode('detail');
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await wasteApi.joinCollectionEvent(eventId);
      alert('Successfully joined the event!');
    } catch (error) {
      console.error('Failed to join event:', error);
      throw error;
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await wasteApi.leaveCollectionEvent(eventId);
      alert('Successfully left the event.');
    } catch (error) {
      console.error('Failed to leave event:', error);
      throw error;
    }
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedEventId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'list' && (
          <CollectionEventsList
            onViewEvent={handleViewEvent}
            onJoinEvent={handleJoinEvent}
            onLeaveEvent={handleLeaveEvent}
          />
        )}

        {viewMode === 'detail' && selectedEventId && (
          <CollectionEventDetail
            eventId={selectedEventId}
            onBack={handleBack}
            onJoinEvent={handleJoinEvent}
            onLeaveEvent={handleLeaveEvent}
          />
        )}
      </div>
    </div>
  );
};
