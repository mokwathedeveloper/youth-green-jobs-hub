import React, { useState, useEffect } from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Package, 
  Star,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserPlus,
  UserMinus,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { wasteApi } from '../../services/api';
import type {
  CollectionEvent,
  CollectionEventFilters
} from '../../types/waste';

interface CollectionEventsListProps {
  onViewEvent?: (eventId: string) => void;
  onJoinEvent?: (eventId: string) => void;
  onLeaveEvent?: (eventId: string) => void;
  showFilters?: boolean;
  userId?: string; // If provided, shows events the user has joined
}

export const CollectionEventsList: React.FC<CollectionEventsListProps> = ({
  onViewEvent,
  onJoinEvent,
  onLeaveEvent,
  showFilters = true,
  userId
}) => {
  const [events, setEvents] = useState<CollectionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CollectionEventFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [joiningEvents, setJoiningEvents] = useState<Set<string>>(new Set());

  const pageSize = 10;

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          ...filters,
          page: currentPage,
          page_size: pageSize,
          ordering: 'start_date',
          ...(userId && { participant: userId })
        };

        const response = await wasteApi.getCollectionEvents(params);
        setEvents(response.results);
        setTotalCount(response.count);
        setTotalPages(Math.ceil(response.count / pageSize));
      } catch (error) {
        console.error('Failed to load events:', error);
        setError('Failed to load collection events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentPage, filters, userId]);

  const handleFilterChange = (newFilters: CollectionEventFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!onJoinEvent) return;
    
    setJoiningEvents(prev => new Set(prev).add(eventId));
    try {
      await onJoinEvent(eventId);
      // Reload events to update participant count
      window.location.reload();
    } catch (error) {
      console.error('Failed to join event:', error);
      alert('Failed to join event. Please try again.');
    } finally {
      setJoiningEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!onLeaveEvent) return;
    
    setJoiningEvents(prev => new Set(prev).add(eventId));
    try {
      await onLeaveEvent(eventId);
      // Reload events to update participant count
      window.location.reload();
    } catch (error) {
      console.error('Failed to leave event:', error);
      alert('Failed to leave event. Please try again.');
    } finally {
      setJoiningEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="w-4 h-4" />;
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEventTypeDisplay = (eventType: string): string => {
    switch (eventType) {
      case 'community_cleanup': return 'Community Cleanup';
      case 'school_program': return 'School Program';
      case 'beach_cleanup': return 'Beach Cleanup';
      case 'market_cleanup': return 'Market Cleanup';
      case 'special_drive': return 'Special Drive';
      default: return eventType.replace('_', ' ');
    }
  };

  const isEventUpcoming = (event: CollectionEvent): boolean => {
    return isAfter(new Date(event.start_date), new Date());
  };

  const isEventActive = (event: CollectionEvent): boolean => {
    const now = new Date();
    return isAfter(now, new Date(event.start_date)) && isBefore(now, new Date(event.end_date));
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading events...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">
            {userId ? 'My Collection Events' : 'Collection Events'}
          </h2>
          <p className="text-gray-600">
            {totalCount} event{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>

        {showFilters && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All statuses</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={filters.event_type || ''}
                onChange={(e) => handleFilterChange({ ...filters, event_type: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All types</option>
                <option value="community_cleanup">Community Cleanup</option>
                <option value="school_program">School Program</option>
                <option value="beach_cleanup">Beach Cleanup</option>
                <option value="market_cleanup">Market Cleanup</option>
                <option value="special_drive">Special Drive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange({ ...filters, date_from: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({});
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No collection events found.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                          <span className="ml-1 capitalize">{event.status}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getEventTypeDisplay(event.event_type)}
                        </span>
                        {parseFloat(event.bonus_multiplier) > 1 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            {event.bonus_multiplier}x Bonus
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(event.start_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs">
                          {format(new Date(event.start_date), 'h:mm a')} - {format(new Date(event.end_date), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="font-medium">{event.location}</p>
                        <p className="text-xs">{event.county}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {event.participant_count}
                          {event.max_participants && ` / ${event.max_participants}`} participants
                        </p>
                        <p className="text-xs">
                          Organized by {event.organizer.first_name} {event.organizer.last_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {event.target_categories.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-start">
                        <Package className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Target Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {event.target_categories.map((category) => (
                              <span
                                key={category.id}
                                className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {event.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Event Completed!</strong> Collected {event.total_weight_collected} kg of waste, 
                        awarded {event.total_credits_awarded} credits to participants.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                  {onViewEvent && (
                    <button
                      onClick={() => onViewEvent(event.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  )}
                  
                  {isEventUpcoming(event) && event.status === 'planned' && (
                    <>
                      {onJoinEvent && (
                        <button
                          onClick={() => handleJoinEvent(event.id)}
                          disabled={joiningEvents.has(event.id) || Boolean(event.max_participants && event.participant_count >= event.max_participants)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                        >
                          {joiningEvents.has(event.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-1" />
                          )}
                          Join Event
                        </button>
                      )}
                      
                      {onLeaveEvent && (
                        <button
                          onClick={() => handleLeaveEvent(event.id)}
                          disabled={joiningEvents.has(event.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                        >
                          {joiningEvents.has(event.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <UserMinus className="w-4 h-4 mr-1" />
                          )}
                          Leave Event
                        </button>
                      )}
                    </>
                  )}
                  
                  {isEventActive(event) && (
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-center text-sm font-medium">
                      Event Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{totalCount}</span>
                {' '}results
              </p>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === currentPage
                          ? 'z-10 bg-green-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
