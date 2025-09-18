import { z } from 'zod';

// Base schemas for common fields
const uuidSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const datetimeSchema = z.string().datetime();
const positiveNumberSchema = z.number().min(0);
const percentageSchema = z.number().min(0).max(100);

// Platform Metrics Schema
export const platformMetricsSchema = z.object({
  id: uuidSchema,
  date: dateSchema,
  
  // User Metrics
  total_users: positiveNumberSchema,
  new_users_today: positiveNumberSchema,
  active_users_today: positiveNumberSchema,
  youth_users: positiveNumberSchema,
  sme_vendors: positiveNumberSchema,
  verified_vendors: positiveNumberSchema,
  
  // Waste Collection Metrics
  total_waste_reports: positiveNumberSchema,
  waste_reports_today: positiveNumberSchema,
  total_waste_collected_kg: positiveNumberSchema,
  waste_collected_today_kg: positiveNumberSchema,
  total_credits_earned: positiveNumberSchema,
  credits_earned_today: positiveNumberSchema,
  total_co2_reduction_kg: positiveNumberSchema,
  co2_reduction_today_kg: positiveNumberSchema,
  
  // Product Marketplace Metrics
  total_products: positiveNumberSchema,
  products_added_today: positiveNumberSchema,
  total_orders: positiveNumberSchema,
  orders_today: positiveNumberSchema,
  total_sales_ksh: positiveNumberSchema,
  sales_today_ksh: positiveNumberSchema,
  total_credits_spent: positiveNumberSchema,
  credits_spent_today: positiveNumberSchema,
  
  // Event Metrics
  total_collection_events: positiveNumberSchema,
  events_today: positiveNumberSchema,
  total_event_participants: positiveNumberSchema,
  event_participants_today: positiveNumberSchema,
  
  // Timestamps
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

// User Engagement Metrics Schema
export const userEngagementMetricsSchema = z.object({
  id: uuidSchema,
  user: uuidSchema,
  user_username: z.string().min(1),
  user_full_name: z.string(),
  date: dateSchema,
  
  // Login and Activity Metrics
  login_count: positiveNumberSchema,
  session_duration_minutes: positiveNumberSchema,
  pages_visited: positiveNumberSchema,
  
  // Waste Collection Engagement
  waste_reports_submitted: positiveNumberSchema,
  waste_collected_kg: positiveNumberSchema,
  credits_earned: positiveNumberSchema,
  events_joined: positiveNumberSchema,
  
  // Marketplace Engagement
  products_viewed: positiveNumberSchema,
  products_added_to_cart: positiveNumberSchema,
  orders_placed: positiveNumberSchema,
  credits_spent: positiveNumberSchema,
  money_spent_ksh: positiveNumberSchema,
  
  // Social Engagement
  reviews_written: positiveNumberSchema,
  
  // Timestamps
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

// Environmental Impact Metrics Schema
export const environmentalImpactMetricsSchema = z.object({
  id: uuidSchema,
  date: dateSchema,
  
  // Waste Collection Impact
  total_waste_diverted_kg: positiveNumberSchema,
  plastic_recycled_kg: positiveNumberSchema,
  paper_recycled_kg: positiveNumberSchema,
  metal_recycled_kg: positiveNumberSchema,
  glass_recycled_kg: positiveNumberSchema,
  organic_composted_kg: positiveNumberSchema,
  
  // Carbon Impact
  co2_reduction_kg: positiveNumberSchema,
  co2_equivalent_trees_planted: positiveNumberSchema,
  
  // Energy and Resource Savings
  energy_saved_kwh: positiveNumberSchema,
  water_saved_liters: positiveNumberSchema,
  landfill_space_saved_m3: positiveNumberSchema,
  
  // Economic Impact
  economic_value_ksh: positiveNumberSchema,
  jobs_supported: positiveNumberSchema,
  
  // Timestamps
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

// County Metrics Schema
export const countyMetricsSchema = z.object({
  id: uuidSchema,
  county: z.string().min(1),
  date: dateSchema,
  
  // User Metrics by County
  total_users: positiveNumberSchema,
  active_users: positiveNumberSchema,
  sme_vendors: positiveNumberSchema,
  
  // Waste Collection by County
  waste_reports: positiveNumberSchema,
  waste_collected_kg: positiveNumberSchema,
  credits_earned: positiveNumberSchema,
  co2_reduction_kg: positiveNumberSchema,
  
  // Marketplace Activity by County
  products_listed: positiveNumberSchema,
  orders_placed: positiveNumberSchema,
  sales_ksh: positiveNumberSchema,
  credits_spent: positiveNumberSchema,
  
  // Collection Events by County
  collection_events: positiveNumberSchema,
  event_participants: positiveNumberSchema,
  
  // Timestamps
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

// System Performance Metrics Schema
export const systemPerformanceMetricsSchema = z.object({
  id: uuidSchema,
  timestamp: datetimeSchema,
  
  // API Performance
  api_response_time_ms: positiveNumberSchema,
  api_requests_count: positiveNumberSchema,
  api_error_rate: percentageSchema,
  
  // Database Performance
  db_query_time_ms: positiveNumberSchema,
  db_connections_active: positiveNumberSchema,
  
  // System Resources
  cpu_usage_percent: percentageSchema,
  memory_usage_percent: percentageSchema,
  disk_usage_percent: percentageSchema,
  
  // User Activity
  concurrent_users: positiveNumberSchema,
  page_load_time_ms: positiveNumberSchema,
  
  // Error Tracking
  error_count: positiveNumberSchema,
  warning_count: positiveNumberSchema,
  
  // Timestamps
  created_at: datetimeSchema,
});

// Dashboard Alert Schema
export const alertTypeSchema = z.enum(['info', 'warning', 'error', 'success']);
export const alertCategorySchema = z.enum(['system', 'performance', 'user_activity', 'waste_collection', 'marketplace', 'environmental']);

export const dashboardAlertSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  alert_type: alertTypeSchema,
  category: alertCategorySchema,
  is_active: z.boolean(),
  is_acknowledged: z.boolean(),
  acknowledged_by: uuidSchema.optional(),
  acknowledged_by_username: z.string().optional(),
  acknowledged_at: datetimeSchema.optional(),
  alert_data: z.record(z.string(), z.any()),
  auto_resolve_at: datetimeSchema.optional(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

// Dashboard Summary Schema
export const dashboardSummarySchema = z.object({
  // Today's Key Metrics
  users_today: positiveNumberSchema,
  waste_collected_today: positiveNumberSchema,
  credits_earned_today: positiveNumberSchema,
  co2_reduced_today: positiveNumberSchema,
  orders_today: positiveNumberSchema,
  sales_today: positiveNumberSchema,
  
  // Total Metrics
  total_users: positiveNumberSchema,
  total_waste_collected: positiveNumberSchema,
  total_credits_earned: positiveNumberSchema,
  total_co2_reduced: positiveNumberSchema,
  total_orders: positiveNumberSchema,
  total_sales: positiveNumberSchema,
  
  // Growth Metrics
  user_growth: z.number(),
  waste_growth: z.number(),
  sales_growth: z.number(),
  
  // Active Alerts
  active_alerts_count: positiveNumberSchema,
  critical_alerts_count: positiveNumberSchema,
});

// Chart Data Schemas
export const chartDataPointSchema = z.object({
  date: dateSchema,
  value: z.number(),
  label: z.string().optional(),
});

export const chartDatasetSchema = z.object({
  label: z.string(),
  data: z.array(z.number()),
  borderColor: z.string(),
  backgroundColor: z.string(),
  fill: z.boolean().optional(),
});

export const timeSeriesDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(chartDatasetSchema),
});

// Ranking and Breakdown Schemas
export const countyRankingSchema = z.object({
  county: z.string(),
  value: positiveNumberSchema,
  rank: z.number().min(1),
  percentage: percentageSchema,
});

export const wasteCategoryBreakdownSchema = z.object({
  category: z.string(),
  weight_kg: positiveNumberSchema,
  percentage: percentageSchema,
  co2_reduction: positiveNumberSchema,
  credits_earned: positiveNumberSchema,
});

// Top Performers Schemas
export const topCollectorSchema = z.object({
  username: z.string(),
  name: z.string(),
  waste_collected: positiveNumberSchema,
  credits_earned: positiveNumberSchema,
  reports_submitted: positiveNumberSchema,
});

export const topCountySchema = z.object({
  county: z.string(),
  waste_collected: positiveNumberSchema,
  co2_reduced: positiveNumberSchema,
  total_users: positiveNumberSchema,
});

export const topVendorSchema = z.object({
  business_name: z.string(),
  owner_name: z.string(),
  sales: positiveNumberSchema,
  orders: positiveNumberSchema,
  rating: z.number().min(0).max(5),
});

export const topProductSchema = z.object({
  name: z.string(),
  vendor: z.string(),
  units_sold: positiveNumberSchema,
  revenue: positiveNumberSchema,
  rating: z.number().min(0).max(5),
});

export const topPerformersSchema = z.object({
  top_collectors: z.array(topCollectorSchema),
  top_counties: z.array(topCountySchema),
  top_vendors: z.array(topVendorSchema),
  top_products: z.array(topProductSchema),
});

// System Health Schemas
export const systemHealthStatusSchema = z.enum(['healthy', 'warning', 'critical']);

export const systemHealthMetricsSchema = z.object({
  api_response_time_ms: positiveNumberSchema,
  api_error_rate: percentageSchema,
  cpu_usage_percent: percentageSchema,
  memory_usage_percent: percentageSchema,
  disk_usage_percent: percentageSchema,
  concurrent_users: positiveNumberSchema,
  db_connections_active: positiveNumberSchema,
});

export const systemHealth24hAveragesSchema = z.object({
  avg_response_time_ms: positiveNumberSchema,
  avg_error_rate: percentageSchema,
  avg_cpu_usage: percentageSchema,
  avg_memory_usage: percentageSchema,
});

export const systemHealthSchema = z.object({
  status: systemHealthStatusSchema,
  timestamp: datetimeSchema,
  current_metrics: systemHealthMetricsSchema,
  '24h_averages': systemHealth24hAveragesSchema,
  active_alerts: positiveNumberSchema,
});

// Environmental Impact Summary Schemas
export const environmentalPeriodTotalsSchema = z.object({
  waste_diverted_kg: positiveNumberSchema,
  co2_reduced_kg: positiveNumberSchema,
  trees_equivalent: positiveNumberSchema,
  energy_saved_kwh: positiveNumberSchema,
  water_saved_liters: positiveNumberSchema,
  economic_value_ksh: positiveNumberSchema,
  jobs_supported: positiveNumberSchema,
});

export const environmentalDailyAverageSchema = z.object({
  waste_diverted_kg: positiveNumberSchema,
  co2_reduced_kg: positiveNumberSchema,
  economic_value_ksh: positiveNumberSchema,
});

export const environmentalLatestDaySchema = z.object({
  date: dateSchema.nullable(),
  waste_diverted_kg: positiveNumberSchema,
  co2_reduced_kg: positiveNumberSchema,
});

export const environmentalImpactSummarySchema = z.object({
  period_days: positiveNumberSchema,
  period_totals: environmentalPeriodTotalsSchema,
  daily_average: environmentalDailyAverageSchema,
  latest_day: environmentalLatestDaySchema,
});

// API Response Schemas
export const analyticsListResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: positiveNumberSchema,
    next: z.string().url().nullable(),
    previous: z.string().url().nullable(),
    results: z.array(itemSchema),
  });

// Filter Schemas
export const analyticsFiltersSchema = z.object({
  date: dateSchema.optional(),
  date_after: dateSchema.optional(),
  date_before: dateSchema.optional(),
  county: z.string().optional(),
  user: uuidSchema.optional(),
  days: z.number().min(1).max(365).optional(),
  metric: z.string().optional(),
});

// Form Schemas for Creating/Updating Analytics Data
export const createAlertSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required'),
  alert_type: alertTypeSchema,
  category: alertCategorySchema,
  alert_data: z.record(z.string(), z.any()).optional(),
  auto_resolve_at: datetimeSchema.optional(),
});

export const acknowledgeAlertSchema = z.object({
  alert_id: uuidSchema,
});

// Export type inference helpers
export type PlatformMetrics = z.infer<typeof platformMetricsSchema>;
export type UserEngagementMetrics = z.infer<typeof userEngagementMetricsSchema>;
export type EnvironmentalImpactMetrics = z.infer<typeof environmentalImpactMetricsSchema>;
export type CountyMetrics = z.infer<typeof countyMetricsSchema>;
export type SystemPerformanceMetrics = z.infer<typeof systemPerformanceMetricsSchema>;
export type DashboardAlert = z.infer<typeof dashboardAlertSchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
export type TimeSeriesData = z.infer<typeof timeSeriesDataSchema>;
export type CountyRanking = z.infer<typeof countyRankingSchema>;
export type WasteCategoryBreakdown = z.infer<typeof wasteCategoryBreakdownSchema>;
export type TopPerformers = z.infer<typeof topPerformersSchema>;
export type SystemHealth = z.infer<typeof systemHealthSchema>;
export type EnvironmentalImpactSummary = z.infer<typeof environmentalImpactSummarySchema>;
export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>;
export type CreateAlert = z.infer<typeof createAlertSchema>;
export type AcknowledgeAlert = z.infer<typeof acknowledgeAlertSchema>;
