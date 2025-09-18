import React, { useState, useEffect } from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Users, 
  Package, 
  Star,
  User,
  Weight,
  Coins,
  UserPlus,
  UserMinus,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  Award
} from 'lucide-react';
import { wasteApi } from '../../services/api';
import type { CollectionEventDetailType } from '../../types/waste';

interface CollectionEventDetailProps {
  eventId: string;
  onBack?: () => void;
  onJoinEvent?: (eventId: string) => void;
  onLeaveEvent?: (eventId: string) => void;
  showActions?: boolean;
}

export const CollectionEventDetail: React.FC<CollectionEventDetailProps> = ({
  eventId,
  onBack,
  onJoinEvent,
  onLeaveEvent,
  showActions = true
}) => {
  const [event, setEvent] = useState<CollectionEventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await wasteApi.getCollectionEventById(eventId);
        setEvent(data);
      } catch (error) {
        console.error('Failed to load event:', error);
        setError('Failed to load collection event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleJoinEvent = async () => {
    if (!onJoinEvent || !event) return;
    
    setActionLoading(true);
    try {
      await onJoinEvent(event.id);
      // Reload event to update participant list
      window.location.reload();
    } catch (error) {
      console.error('Failed to join event:', error);
      alert('Failed to join event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!onLeaveEvent || !event) return;
    
    setActionLoading(true);
    try {
      await onLeaveEvent(event.id);
      // Reload event to update participant list
      window.location.reload();
    } catch (error) {
      console.error('Failed to leave event:', error);
      alert('Failed to leave event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="w-5 h-5" />;
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
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

  const isEventUpcoming = (): boolean => {
    if (!event) return false;
    return isAfter(new Date(event.start_date), new Date());
  };

  const isEventActive = (): boolean => {
    if (!event) return false;
    const now = new Date();
    return isAfter(now, new Date(event.start_date)) && isBefore(now, new Date(event.end_date));
  };

  const canJoinEvent = (): boolean => {
    if (!event) return false;
    return isEventUpcoming() && 
           event.status === 'planned' && 
           (!event.max_participants || event.participant_count < event.max_participants);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600">Event ID: {event.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
            {getStatusIcon(event.status)}
            <span className="ml-2 capitalize">{event.status}</span>
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {getEventTypeDisplay(event.event_type)}
          </span>
          {parseFloat(event.bonus_multiplier) > 1 && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <Star className="w-4 h-4 mr-1" />
              {event.bonus_multiplier}x Bonus
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Target Categories */}
          {event.target_categories.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Target Waste Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.target_categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {category.credit_rate_per_kg} credits/kg
                      </p>
                      <p className="text-xs text-gray-500">
                        × {event.bonus_multiplier} = {(parseFloat(category.credit_rate_per_kg) * parseFloat(event.bonus_multiplier)).toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Participants ({event.participants.length})
            </h2>
            
            {event.participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No participants yet. Be the first to join!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {event.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {participant.user.first_name} {participant.user.last_name}
                        </p>
                        <p className="text-sm text-gray-600">@{participant.user.username}</p>
                      </div>
                    </div>
                    
                    {event.status === 'completed' && (
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600">
                          <Weight className="w-4 h-4 mr-1" />
                          <span>{participant.weight_collected} kg</span>
                        </div>
                        <div className="flex items-center text-sm text-green-600">
                          <Coins className="w-4 h-4 mr-1" />
                          <span>{participant.credits_earned} credits</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results (for completed events) */}
          {event.status === 'completed' && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-bold">Event Results</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{event.total_weight_collected} kg</p>
                  <p className="text-sm text-green-100">Total Waste Collected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{event.total_credits_awarded}</p>
                  <p className="text-sm text-green-100">Credits Awarded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{event.participants.length}</p>
                  <p className="text-sm text-green-100">Participants</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(event.start_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.start_date), 'h:mm a')} - {format(new Date(event.end_date), 'h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{event.location}</p>
                  <p className="text-sm text-gray-600">{event.county}, {event.sub_county}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {event.participant_count}
                    {event.max_participants && ` / ${event.max_participants}`} participants
                  </p>
                  {event.max_participants && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (event.participant_count / event.max_participants) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Organizer
            </h2>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {event.organizer.first_name} {event.organizer.last_name}
                </p>
                <p className="text-sm text-gray-600">@{event.organizer.username}</p>
                <p className="text-sm text-gray-600">{event.organizer.email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {canJoinEvent() && onJoinEvent && (
                  <button
                    onClick={handleJoinEvent}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Join Event
                  </button>
                )}
                
                {isEventUpcoming() && onLeaveEvent && (
                  <button
                    onClick={handleLeaveEvent}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserMinus className="w-4 h-4 mr-2" />
                    )}
                    Leave Event
                  </button>
                )}
                
                {isEventActive() && (
                  <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-md text-center font-medium">
                    Event is Currently Active
                  </div>
                )}
                
                {event.status === 'completed' && (
                  <div className="w-full px-4 py-2 bg-purple-100 text-purple-800 rounded-md text-center font-medium">
                    Event Completed
                  </div>
                )}
                
                {event.status === 'cancelled' && (
                  <div className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-md text-center font-medium">
                    Event Cancelled
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
