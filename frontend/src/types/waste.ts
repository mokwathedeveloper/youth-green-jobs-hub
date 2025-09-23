// Waste Collection Types for Youth Green Jobs Hub

export interface WasteCategory {
  id: string;
  name: string;
  category_type: 'plastic' | 'paper' | 'metal' | 'glass' | 'organic' | 'electronic' | 'textile' | 'hazardous' | 'other';
  description: string;
  credit_rate_per_kg: string;
  co2_reduction_per_kg: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  point_type: 'drop_off' | 'collection_center' | 'recycling_facility';
  address: string;
  latitude: string | null;
  longitude: string | null;
  contact_phone: string;
  contact_email: string;
  operating_hours: string;
  accepted_categories: WasteCategory[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  distance_km?: number; // For nearby collection points
}

export interface WasteReport {
  id: string;
  title: string;
  description: string;
  reporter: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  category: WasteCategory;
  status: 'reported' | 'verified' | 'collected' | 'processed' | 'rejected';
  estimated_weight: string;
  actual_weight: string | null;
  location_description: string;
  latitude: string | null;
  longitude: string | null;
  photo: string | null;
  collection_point: CollectionPoint | null;
  verified_at: string | null;
  collected_at: string | null;
  processed_at: string | null;
  credits_awarded: string;
  reported_at: string;
}

export interface WasteReportListItem {
  id: string;
  title: string;
  reporter: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  category: WasteCategory;
  status: 'reported' | 'verified' | 'collected' | 'processed' | 'rejected';
  estimated_weight: string;
  actual_weight: string | null;
  credits_awarded: string;
  reported_at: string;
}

export interface CreditTransaction {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  transaction_type: 'earned' | 'redeemed' | 'bonus' | 'penalty' | 'adjustment';
  amount: string;
  waste_report: WasteReportListItem | null;
  description: string;
  balance_before: string;
  balance_after: string;
  created_at: string;
}

export interface CollectionEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'community_cleanup' | 'beach_cleanup' | 'park_cleanup' | 'school_program' | 'corporate_event';
  organizer: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  location_name: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  start_datetime: string;
  end_datetime: string;
  registration_deadline: string | null;
  max_participants: number | null;
  participant_count: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  total_waste_collected: string;
}

export interface EventParticipation {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  joined_at: string;
  weight_collected: string;
  credits_earned: string;
}

export interface CollectionEventDetailType extends CollectionEvent {
  participants: EventParticipation[];
}

export interface DashboardStats {
  reports: {
    total_reports: number;
    verified_reports: number;
    collected_reports: number;
    total_estimated_weight_kg: number;
    total_actual_weight_kg: number;
  };
  credits: {
    current_balance: number;
    total_earned: number;
    total_spent: number;
    total_bonus: number;
  };
  events: {
    events_joined: number;
    total_weight_collected_kg: number;
    total_credits_earned: number;
  };
  environmental_impact: {
    total_co2_reduction_kg: number;
  };
  total_credits: number;
  total_waste_collected: number;
  co2_saved: number;
  trees_saved: number;
  water_saved: number;
}

export interface NearbyCollectionPointsResponse {
  collection_points: CollectionPoint[];
  results: CollectionPoint[];
  total_found: number;
  search_radius_km: number;
}

// Form Data Types
export interface WasteReportFormData {
  title: string;
  description: string;
  category_id: string;
  estimated_weight: number;
  location_description: string;
  latitude?: number;
  longitude?: number;
  photo?: File;
  collection_point_id?: string;
}

export interface CollectionEventFormData {
  title: string;
  description: string;
  event_type: 'community_cleanup' | 'beach_cleanup' | 'park_cleanup' | 'school_program' | 'corporate_event';
  location_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  start_datetime: string;
  end_datetime: string;
  registration_deadline?: string;
  max_participants?: number;
}

// API Response Types
export interface WasteReportListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WasteReportListItem[];
}

export interface CreditTransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CreditTransaction[];
}

export interface CollectionEventListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CollectionEvent[];
}

// Filter Types
export interface WasteReportFilters {
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
}

export interface CollectionEventFilters {
  status?: string;
  event_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreditTransactionFilters {
  transaction_type?: string;
  date_from?: string;
  date_to?: string;
}

// Map Types
export interface MapLocation {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  category?: string;
}

// Status Badge Types
export type WasteReportStatusColor = 'gray' | 'blue' | 'yellow' | 'green' | 'red';
export type PriorityColor = 'green' | 'yellow' | 'orange' | 'red';
export type EventStatusColor = 'blue' | 'green' | 'gray' | 'red';

// Utility Types
export type SortDirection = 'asc' | 'desc';
export type SortField = 'reported_at' | 'title' | 'status' | 'estimated_weight' | 'actual_weight';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Error Types
export interface WasteAPIError {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationError {
  [key: string]: string[];
}
