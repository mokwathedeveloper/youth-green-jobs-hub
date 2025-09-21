// Analytics Types for Youth Green Jobs & Waste Recycling Hub

export interface PlatformMetrics {
  id: string;
  date: string;
  
  // User Metrics
  total_users: number;
  new_users_today: number;
  active_users_today: number;
  youth_users: number;
  sme_vendors: number;
  verified_vendors: number;
  
  // Waste Collection Metrics
  total_waste_reports: number;
  waste_reports_today: number;
  total_waste_collected_kg: number;
  waste_collected_today_kg: number;
  total_credits_earned: number;
  credits_earned_today: number;
  total_co2_reduction_kg: number;
  co2_reduction_today_kg: number;
  
  // Product Marketplace Metrics
  total_products: number;
  products_added_today: number;
  total_orders: number;
  orders_today: number;
  total_sales_ksh: number;
  sales_today_ksh: number;
  total_credits_spent: number;
  credits_spent_today: number;
  
  // Event Metrics
  total_collection_events: number;
  events_today: number;
  total_event_participants: number;
  event_participants_today: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UserEngagementMetrics {
  id: string;
  user: string;
  user_username: string;
  user_full_name: string;
  date: string;
  
  // Login and Activity Metrics
  login_count: number;
  session_duration_minutes: number;
  pages_visited: number;
  
  // Waste Collection Engagement
  waste_reports_submitted: number;
  waste_collected_kg: number;
  credits_earned: number;
  events_joined: number;
  
  // Marketplace Engagement
  products_viewed: number;
  products_added_to_cart: number;
  orders_placed: number;
  credits_spent: number;
  money_spent_ksh: number;
  
  // Social Engagement
  reviews_written: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface EnvironmentalImpactMetrics {
  id: string;
  date: string;
  
  // Waste Collection Impact
  total_waste_diverted_kg: number;
  plastic_recycled_kg: number;
  paper_recycled_kg: number;
  metal_recycled_kg: number;
  glass_recycled_kg: number;
  organic_composted_kg: number;
  
  // Carbon Impact
  co2_reduction_kg: number;
  co2_equivalent_trees_planted: number;
  
  // Energy and Resource Savings
  energy_saved_kwh: number;
  water_saved_liters: number;
  landfill_space_saved_m3: number;
  
  // Economic Impact
  economic_value_ksh: number;
  jobs_supported: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CountyMetrics {
  id: string;
  county: string;
  date: string;
  
  // User Metrics by County
  total_users: number;
  active_users: number;
  sme_vendors: number;
  
  // Waste Collection by County
  waste_reports: number;
  waste_collected_kg: number;
  credits_earned: number;
  co2_reduction_kg: number;
  
  // Marketplace Activity by County
  products_listed: number;
  orders_placed: number;
  sales_ksh: number;
  credits_spent: number;
  
  // Collection Events by County
  collection_events: number;
  event_participants: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SystemPerformanceMetrics {
  id: string;
  timestamp: string;
  
  // API Performance
  api_response_time_ms: number;
  api_requests_count: number;
  api_error_rate: number;
  
  // Database Performance
  db_query_time_ms: number;
  db_connections_active: number;
  
  // System Resources
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  
  // User Activity
  concurrent_users: number;
  page_load_time_ms: number;
  
  // Error Tracking
  error_count: number;
  warning_count: number;
  
  // Timestamps
  created_at: string;
}

export type AlertType = 'info' | 'warning' | 'error' | 'success';
export type AlertCategory = 'system' | 'performance' | 'user_activity' | 'waste_collection' | 'marketplace' | 'environmental';

export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  alert_type: AlertType;
  category: AlertCategory;
  is_active: boolean;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_by_username?: string;
  acknowledged_at?: string;
  alert_data: Record<string, any>;
  auto_resolve_at?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Summary Types
export interface DashboardSummary {
  // Today's Key Metrics
  users_today: number;
  waste_collected_today: number;
  credits_earned_today: number;
  co2_reduced_today: number;
  orders_today: number;
  sales_today: number;
  
  // Total Metrics
  total_users: number;
  total_waste_collected: number;
  total_credits_earned: number;
  total_co2_reduced: number;
  total_orders: number;
  total_sales: number;
  
  // Growth Metrics (percentage change from yesterday)
  user_growth: number;
  waste_growth: number;
  sales_growth: number;
  
  // Active Alerts
  active_alerts_count: number;
  critical_alerts_count: number;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: ChartDataset[];
}

// Missing types for analytics hooks
export type AnalyticsTimeRange = '7d' | '30d' | '90d' | '1y';

export interface DashboardMetrics {
  total_users: number;
  total_waste_collected: number;
  total_credits_earned: number;
  total_co2_reduction: number;
  growth_rate: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface UserActivity {
  date: string;
  active_users: number;
  new_registrations: number;
  waste_reports: number;
  marketplace_orders: number;
}

export interface EnvironmentalImpact {
  date: string;
  co2_reduction_kg: number;
  waste_diverted_kg: number;
  trees_equivalent: number;
  water_saved_liters: number;
}

export interface CountyRanking {
  county: string;
  value: number;
  rank: number;
  percentage: number;
}

export interface WasteCategoryBreakdown {
  category: string;
  weight_kg: number;
  percentage: number;
  co2_reduction: number;
  credits_earned: number;
}

export interface TopCollector {
  username: string;
  name: string;
  waste_collected: number;
  credits_earned: number;
  reports_submitted: number;
}

export interface TopCounty {
  county: string;
  waste_collected: number;
  co2_reduced: number;
  total_users: number;
}

export interface TopVendor {
  business_name: string;
  owner_name: string;
  sales: number;
  orders: number;
  rating: number;
}

export interface TopProduct {
  name: string;
  vendor: string;
  units_sold: number;
  revenue: number;
  rating: number;
}

export interface TopPerformers {
  top_collectors: TopCollector[];
  top_counties: TopCounty[];
  top_vendors: TopVendor[];
  top_products: TopProduct[];
}

// System Health Types
export interface SystemHealthMetrics {
  api_response_time_ms: number;
  api_error_rate: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  concurrent_users: number;
  db_connections_active: number;
}

export interface SystemHealth24hAverages {
  avg_response_time_ms: number;
  avg_error_rate: number;
  avg_cpu_usage: number;
  avg_memory_usage: number;
}

export type SystemHealthStatus = 'healthy' | 'warning' | 'critical';

export interface SystemHealth {
  status: SystemHealthStatus;
  timestamp: string;
  current_metrics: SystemHealthMetrics;
  '24h_averages': SystemHealth24hAverages;
  active_alerts: number;
}

// Environmental Impact Summary Types
export interface EnvironmentalPeriodTotals {
  waste_diverted_kg: number;
  co2_reduced_kg: number;
  trees_equivalent: number;
  energy_saved_kwh: number;
  water_saved_liters: number;
  economic_value_ksh: number;
  jobs_supported: number;
}

export interface EnvironmentalDailyAverage {
  waste_diverted_kg: number;
  co2_reduced_kg: number;
  economic_value_ksh: number;
}

export interface EnvironmentalLatestDay {
  date: string | null;
  waste_diverted_kg: number;
  co2_reduced_kg: number;
}

export interface EnvironmentalImpactSummary {
  period_days: number;
  period_totals: EnvironmentalPeriodTotals;
  daily_average: EnvironmentalDailyAverage;
  latest_day: EnvironmentalLatestDay;
}

// API Response Types
export interface AnalyticsListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filter Types
export interface AnalyticsFilters {
  date?: string;
  date_after?: string;
  date_before?: string;
  county?: string;
  user?: string;
  days?: number;
  metric?: string;
}

// Dashboard Component Props Types
export interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

export interface ChartCardProps {
  title: string;
  data: TimeSeriesData;
  height?: number;
  type?: 'line' | 'bar' | 'area';
}

export interface AlertCardProps {
  alert: DashboardAlert;
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}
