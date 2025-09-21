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
  point_type: 'drop_off' | 'collection' | 'recycling_center' | 'community_center';
  address: string;
  county: string;
  sub_county: string;
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
  status: 'reported' | 'verified' | 'collected' | 'processed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_weight_kg: string;
  actual_weight_kg: string | null;
  location_description: string;
  county: string;
  sub_county: string;
  latitude: string | null;
  longitude: string | null;
  photo: string | null;
  collection_point: CollectionPoint | null;
  verified_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  verified_at: string | null;
  collected_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  collected_at: string | null;
  notes: string;
  estimated_credits: string;
  actual_credits: string;
  estimated_co2_reduction: string;
  actual_co2_reduction: string;
  created_at: string;
  updated_at: string;
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
  status: 'reported' | 'verified' | 'collected' | 'processed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_weight_kg: string;
  actual_weight_kg: string | null;
  estimated_credits: string;
  actual_credits: string;
  county: string;
  sub_county: string;
  created_at: string;
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
  transaction_type: 'earned' | 'spent' | 'bonus' | 'penalty' | 'adjustment';
  amount: string;
  waste_report: WasteReportListItem | null;
  description: string;
  reference_id: string;
  processed_by: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  created_at: string;
}

export interface CollectionEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'community_cleanup' | 'school_program' | 'beach_cleanup' | 'market_cleanup' | 'special_drive';
  organizer: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  location: string;
  county: string;
  sub_county: string;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  participant_count: number;
  target_categories: WasteCategory[];
  bonus_multiplier: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  total_weight_collected: string;
  total_credits_awarded: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  total_found: number;
  search_radius_km: number;
}

// Form Data Types
export interface WasteReportFormData {
  title: string;
  description: string;
  category_id: string;
  estimated_weight_kg: number;
  location_description: string;
  county: string;
  sub_county: string;
  latitude?: number;
  longitude?: number;
  photo?: File;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  collection_point_id?: string;
}

export interface CollectionEventFormData {
  title: string;
  description: string;
  event_type: 'community_cleanup' | 'school_program' | 'beach_cleanup' | 'market_cleanup' | 'special_drive';
  location: string;
  county: string;
  sub_county: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  target_category_ids: string[];
  bonus_multiplier: number;
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
  county?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
}

export interface CollectionEventFilters {
  status?: string;
  county?: string;
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
export type SortField = 'created_at' | 'title' | 'status' | 'priority' | 'estimated_weight_kg' | 'actual_weight_kg';

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
