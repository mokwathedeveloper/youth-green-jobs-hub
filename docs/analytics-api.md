# Analytics API Documentation

## Overview

The Analytics API provides comprehensive monitoring and reporting capabilities for the Youth Green Jobs & Waste Recycling Hub platform. It tracks platform metrics, user engagement, environmental impact, and system performance.

## Authentication

All analytics endpoints require admin authentication:

```bash
Authorization: Bearer <admin_jwt_token>
```

## Base URL

```
/api/v1/analytics/
```

## Core Models

### PlatformMetrics
Daily aggregated platform-wide statistics:
- Total users and new users today
- Waste collection metrics (kg)
- Credits earned and spent
- Sales and orders data
- CO2 reduction tracking

### UserEngagementMetrics
Individual user activity tracking:
- Reports submitted
- Credits earned/spent
- Orders placed
- Session duration
- Last activity

### EnvironmentalImpactMetrics
Environmental sustainability metrics:
- Waste diverted from landfills
- CO2 reduction achieved
- Trees equivalent saved
- Energy conservation
- Economic value generated

### CountyMetrics
Regional performance comparison:
- County-wise waste collection
- User activity by region
- CO2 reduction by county
- Regional rankings

### SystemPerformanceMetrics
Technical performance monitoring:
- API response times
- Error rates
- CPU/Memory usage
- Database connections
- Concurrent users

### DashboardAlert
System notifications and alerts:
- Performance alerts
- Error notifications
- Milestone achievements
- System health warnings

## API Endpoints

### Dashboard Summary
Get key metrics overview for admin dashboard.

```http
GET /api/v1/analytics/dashboard/summary/
```

**Response:**
```json
{
  "users_today": 15,
  "waste_collected_today": "125.50",
  "credits_earned_today": "2510.00",
  "co2_reduced_today": "45.75",
  "orders_today": 8,
  "sales_today": "15750.00",
  "total_users": 1250,
  "total_waste_collected": "12500.75",
  "total_credits_earned": "125000.00",
  "total_co2_reduced": "4575.25",
  "total_orders": 850,
  "total_sales": "425000.00",
  "user_growth": "12.5",
  "waste_growth": "8.3",
  "sales_growth": "15.7",
  "active_alerts_count": 2,
  "critical_alerts_count": 0
}
```

### System Health
Get current system health status and metrics.

```http
GET /api/v1/analytics/dashboard/system-health/
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-18T20:33:18.381046Z",
  "current_metrics": {
    "api_response_time_ms": 150,
    "api_error_rate": 0.5,
    "cpu_usage_percent": 45.2,
    "memory_usage_percent": 68.7,
    "disk_usage_percent": 25.3,
    "concurrent_users": 125,
    "db_connections_active": 8
  },
  "24h_averages": {
    "avg_response_time_ms": 145.5,
    "avg_error_rate": 0.3,
    "avg_cpu_usage": 42.1,
    "avg_memory_usage": 65.2
  },
  "active_alerts": 0
}
```

### Platform Metrics
Get historical platform metrics with pagination.

```http
GET /api/v1/analytics/platform-metrics/
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "count": 30,
  "next": "http://localhost:8000/api/v1/analytics/platform-metrics/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-here",
      "date": "2025-09-18",
      "total_users": 1250,
      "active_users_today": 125,
      "total_waste_collected_kg": "12500.75",
      "waste_collected_today_kg": "125.50",
      "total_credits_earned": "125000.00",
      "credits_earned_today": "2510.00",
      "total_co2_reduction_kg": "4575.25",
      "co2_reduction_today_kg": "45.75",
      "total_sales_ksh": "425000.00",
      "sales_today_ksh": "15750.00",
      "total_orders": 850,
      "orders_today": 8
    }
  ]
}
```

### User Engagement Metrics
Get user engagement data with filtering.

```http
GET /api/v1/analytics/user-engagement/
```

**Query Parameters:**
- `user_id`: Filter by specific user
- `date_from`: Start date
- `date_to`: End date
- `page`: Page number
- `page_size`: Items per page

### Environmental Impact
Get environmental impact metrics.

```http
GET /api/v1/analytics/environmental-impact/
```

### County Metrics
Get regional performance data.

```http
GET /api/v1/analytics/county-metrics/
```

### System Performance
Get system performance history.

```http
GET /api/v1/analytics/system-performance/
```

### Alerts Management
Get and manage system alerts.

```http
GET /api/v1/analytics/alerts/
POST /api/v1/analytics/alerts/{id}/acknowledge/
```

## Chart Data Endpoints

### Waste Collection Chart
Get time-series data for waste collection visualization.

```http
GET /api/v1/analytics/charts/waste-collection/
```

**Query Parameters:**
- `period`: 'week', 'month', 'quarter', 'year' (default: 'month')
- `county`: Filter by county

**Response:**
```json
{
  "labels": ["2025-09-01", "2025-09-02", "..."],
  "datasets": [
    {
      "label": "Waste Collected (kg)",
      "data": [125.5, 98.2, 156.7, "..."],
      "borderColor": "#10B981",
      "backgroundColor": "#10B98120"
    }
  ]
}
```

### User Growth Chart
```http
GET /api/v1/analytics/charts/user-growth/
```

### CO2 Reduction Chart
```http
GET /api/v1/analytics/charts/co2-reduction/
```

### Sales Performance Chart
```http
GET /api/v1/analytics/charts/sales-performance/
```

## Ranking Endpoints

### County Rankings
Get top-performing counties by waste collection.

```http
GET /api/v1/analytics/rankings/counties/
```

### Top Collectors
Get top waste collectors (users).

```http
GET /api/v1/analytics/rankings/top-collectors/
```

### Top SMEs
Get top-performing SME vendors.

```http
GET /api/v1/analytics/rankings/top-smes/
```

## Breakdown Endpoints

### Waste Category Breakdown
Get waste collection by category.

```http
GET /api/v1/analytics/breakdowns/waste-categories/
```

### User Type Breakdown
Get user distribution by type.

```http
GET /api/v1/analytics/breakdowns/user-types/
```

## Management Commands

### Daily Analytics Aggregation
Aggregate daily analytics data:

```bash
python manage.py aggregate_daily_analytics [--date YYYY-MM-DD] [--force]
```

### System Performance Monitoring
Monitor system performance:

```bash
python manage.py monitor_system_performance [--once] [--interval SECONDS]
```

### Analytics Report Generation
Generate comprehensive reports:

```bash
python manage.py generate_analytics_report --start-date YYYY-MM-DD --end-date YYYY-MM-DD [--format summary|detailed|csv]
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (admin required)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Analytics endpoints are rate-limited to prevent abuse:
- 100 requests per minute for authenticated users
- 1000 requests per hour for admin users

## Data Retention

- Platform metrics: Retained indefinitely
- User engagement: 2 years
- System performance: 90 days
- Alerts: 1 year (acknowledged), indefinite (unacknowledged)
