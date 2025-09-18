# Analytics System Technical Documentation

## Architecture Overview

The Analytics System is built using Django REST Framework for the backend and React with TypeScript for the frontend. It provides comprehensive monitoring, reporting, and data visualization capabilities.

## Backend Architecture

### Models Structure

```python
# Core Analytics Models
- PlatformMetrics: Daily aggregated platform statistics
- UserEngagementMetrics: Individual user activity tracking
- EnvironmentalImpactMetrics: Environmental sustainability metrics
- CountyMetrics: Regional performance data
- SystemPerformanceMetrics: Technical performance monitoring
- DashboardAlert: System notifications and alerts
```

### Database Design

#### PlatformMetrics Table
```sql
CREATE TABLE analytics_platformmetrics (
    id UUID PRIMARY KEY,
    date DATE UNIQUE,
    total_users INTEGER,
    active_users_today INTEGER,
    total_waste_collected_kg DECIMAL(10,2),
    waste_collected_today_kg DECIMAL(10,2),
    total_credits_earned DECIMAL(12,2),
    credits_earned_today DECIMAL(12,2),
    total_co2_reduction_kg DECIMAL(10,4),
    co2_reduction_today_kg DECIMAL(10,4),
    total_sales_ksh DECIMAL(12,2),
    sales_today_ksh DECIMAL(12,2),
    total_orders INTEGER,
    orders_today INTEGER
);
```

#### UserEngagementMetrics Table
```sql
CREATE TABLE analytics_userengagementmetrics (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth_user(id),
    date DATE,
    reports_submitted INTEGER,
    credits_earned DECIMAL(10,2),
    credits_spent DECIMAL(10,2),
    orders_placed INTEGER,
    money_spent DECIMAL(10,2),
    session_duration_minutes INTEGER,
    last_activity TIMESTAMP,
    UNIQUE(user_id, date)
);
```

### API Views Architecture

#### ViewSet Pattern
```python
class PlatformMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for platform metrics with filtering and pagination
    """
    queryset = PlatformMetrics.objects.all().order_by('-date')
    serializer_class = PlatformMetricsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date']
    pagination_class = StandardResultsSetPagination
```

#### Function-Based Views for Complex Logic
```python
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_summary(request):
    """
    Complex aggregation logic for dashboard summary
    """
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    
    # Complex calculations and growth metrics
    # Returns comprehensive dashboard data
```

### Data Aggregation System

#### Management Commands
```python
# Daily aggregation command
python manage.py aggregate_daily_analytics [--date YYYY-MM-DD] [--force]

# System monitoring command  
python manage.py monitor_system_performance [--once] [--interval SECONDS]

# Report generation command
python manage.py generate_analytics_report --start-date YYYY-MM-DD --end-date YYYY-MM-DD [--format summary|detailed|csv]
```

#### Aggregation Logic
```python
def aggregate_platform_metrics(self, target_date):
    """
    Aggregates platform-wide metrics for a specific date
    """
    start_of_day = timezone.make_aware(
        datetime.combine(target_date, time.min)
    )
    end_of_day = timezone.make_aware(
        datetime.combine(target_date, time.max)
    )
    
    # User metrics
    total_users = User.objects.count()
    new_users_today = User.objects.filter(
        date_joined__range=[start_of_day, end_of_day]
    ).count()
    
    # Waste collection metrics with CO2 calculation
    total_co2_reduction = WasteReport.objects.filter(
        status='collected',
        actual_weight_kg__isnull=False
    ).aggregate(
        total=Sum(F('actual_weight_kg') * F('category__co2_reduction_per_kg'))
    )['total'] or Decimal('0.00')
```

### Serializers

#### Comprehensive Serialization
```python
class PlatformMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformMetrics
        fields = '__all__'

class DashboardSummarySerializer(serializers.Serializer):
    """Custom serializer for dashboard summary data"""
    users_today = serializers.IntegerField()
    waste_collected_today = serializers.DecimalField(max_digits=10, decimal_places=2)
    # ... other fields
    
class ChartDataSerializer(serializers.Serializer):
    """Serializer for chart.js compatible data"""
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.ListField(child=serializers.DictField())
```

## Frontend Architecture

### TypeScript Types

```typescript
// Core Analytics Types
export interface PlatformMetrics {
  id: string;
  date: string;
  total_users: number;
  active_users_today: number;
  total_waste_collected_kg: string;
  waste_collected_today_kg: string;
  total_credits_earned: string;
  credits_earned_today: string;
  total_co2_reduction_kg: string;
  co2_reduction_today_kg: string;
  total_sales_ksh: string;
  sales_today_ksh: string;
  total_orders: number;
  orders_today: number;
}

export interface DashboardSummary {
  users_today: number;
  waste_collected_today: string;
  credits_earned_today: string;
  co2_reduced_today: string;
  orders_today: number;
  sales_today: string;
  total_users: number;
  total_waste_collected: string;
  total_credits_earned: string;
  total_co2_reduced: string;
  total_orders: number;
  total_sales: string;
  user_growth: string;
  waste_growth: string;
  sales_growth: string;
  active_alerts_count: number;
  critical_alerts_count: number;
}
```

### API Service Layer

```typescript
// Analytics API Service
export const analyticsApi = {
  // Dashboard endpoints
  getDashboardSummary: (): Promise<DashboardSummary> =>
    apiClient.get('/analytics/dashboard/summary/'),
    
  getSystemHealth: (): Promise<SystemHealth> =>
    apiClient.get('/analytics/dashboard/system-health/'),
    
  // Data endpoints with pagination
  getPlatformMetrics: (params?: PaginationParams): Promise<PaginatedResponse<PlatformMetrics>> =>
    apiClient.get('/analytics/platform-metrics/', { params }),
    
  // Chart data endpoints
  getWasteCollectionChart: (params?: ChartParams): Promise<TimeSeriesData> =>
    apiClient.get('/analytics/charts/waste-collection/', { params }),
    
  // Alert management
  getAlerts: (params?: AlertParams): Promise<PaginatedResponse<DashboardAlert>> =>
    apiClient.get('/analytics/alerts/', { params }),
    
  acknowledgeAlert: (alertId: string): Promise<void> =>
    apiClient.post(`/analytics/alerts/${alertId}/acknowledge/`),
};
```

### Component Architecture

#### Reusable Components
```typescript
// KPI Card Component
interface DashboardCardProps {
  title: string;
  value: string | number;
  growth?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export const KPICard: React.FC<DashboardCardProps> = ({
  title, value, growth, icon, trend, loading
}) => {
  // Component implementation with loading states and animations
};

// Chart Card Component
interface ChartCardProps {
  title: string;
  data: TimeSeriesData;
  type: 'line' | 'bar' | 'area';
  height?: number;
  loading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title, data, type, height = 300, loading
}) => {
  // Recharts integration with responsive design
};
```

### State Management

#### React Query Integration
```typescript
// Custom hooks for data fetching
export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboardSummary,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['analytics', 'system-health'],
    queryFn: analyticsApi.getSystemHealth,
    refetchInterval: 60 * 1000, // 1 minute
  });
};
```

## Performance Optimization

### Backend Optimizations

#### Database Indexing
```sql
-- Critical indexes for analytics queries
CREATE INDEX idx_platformmetrics_date ON analytics_platformmetrics(date);
CREATE INDEX idx_userengagement_user_date ON analytics_userengagementmetrics(user_id, date);
CREATE INDEX idx_wastereport_collected_at ON waste_collection_wastereport(collected_at);
CREATE INDEX idx_wastereport_status ON waste_collection_wastereport(status);
```

#### Query Optimization
```python
# Use select_related and prefetch_related
queryset = WasteReport.objects.select_related(
    'category', 'reporter', 'collected_by'
).prefetch_related('credit_transactions')

# Use database aggregation instead of Python loops
metrics = WasteReport.objects.aggregate(
    total_weight=Sum('actual_weight_kg'),
    total_co2=Sum(F('actual_weight_kg') * F('category__co2_reduction_per_kg'))
)
```

#### Caching Strategy
```python
from django.core.cache import cache

def get_dashboard_summary():
    cache_key = f"dashboard_summary_{timezone.now().date()}"
    cached_data = cache.get(cache_key)
    
    if cached_data is None:
        # Calculate fresh data
        cached_data = calculate_dashboard_metrics()
        cache.set(cache_key, cached_data, timeout=300)  # 5 minutes
    
    return cached_data
```

### Frontend Optimizations

#### Code Splitting
```typescript
// Lazy load analytics components
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AnalyticsOverviewPage = lazy(() => import('./pages/admin/AnalyticsOverviewPage'));

// Route-based code splitting
<Route 
  path="/admin/analytics" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboardPage />
    </Suspense>
  } 
/>
```

#### Memoization
```typescript
// Memoize expensive calculations
const chartData = useMemo(() => {
  return transformDataForChart(rawData);
}, [rawData]);

// Memoize components
const MemoizedChartCard = memo(ChartCard);
```

## Security Considerations

### Authentication & Authorization
```python
# Admin-only access for analytics
permission_classes = [IsAuthenticated, IsAdminUser]

# Custom permission for specific analytics features
class AnalyticsPermission(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.has_perm('analytics.view_metrics'))
        )
```

### Data Privacy
```python
# Anonymize sensitive data in analytics
def anonymize_user_data(user_data):
    return {
        'user_id': hash_user_id(user_data['id']),
        'county': user_data['county'],
        'activity_level': user_data['activity_level'],
        # Exclude PII
    }
```

## Monitoring & Alerting

### System Performance Monitoring
```python
import psutil
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    def monitor_system(self):
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        # Create alerts for high resource usage
        if cpu_percent > 80:
            DashboardAlert.objects.create(
                title="High CPU Usage",
                alert_type="error",
                category="performance",
                alert_data={"cpu_usage": cpu_percent}
            )
```

### Error Tracking
```python
import logging

logger = logging.getLogger('analytics')

def safe_aggregate_metrics(date):
    try:
        return aggregate_daily_metrics(date)
    except Exception as e:
        logger.error(f"Failed to aggregate metrics for {date}: {str(e)}")
        # Create alert for failed aggregation
        DashboardAlert.objects.create(
            title="Analytics Aggregation Failed",
            alert_type="error",
            category="system"
        )
        raise
```

## Deployment Considerations

### Environment Variables
```bash
# Analytics-specific settings
ANALYTICS_CACHE_TIMEOUT=300
ANALYTICS_AGGREGATION_SCHEDULE="0 1 * * *"  # Daily at 1 AM
ANALYTICS_RETENTION_DAYS=730  # 2 years
SYSTEM_MONITORING_INTERVAL=60  # 1 minute
```

### Scheduled Tasks
```python
# Celery tasks for background processing
@shared_task
def daily_analytics_aggregation():
    """Run daily analytics aggregation"""
    call_command('aggregate_daily_analytics')

@shared_task  
def system_performance_monitoring():
    """Monitor system performance"""
    call_command('monitor_system_performance', '--once')
```

### Backup Strategy
```bash
# Backup analytics data
pg_dump --table=analytics_* youth_green_jobs_db > analytics_backup.sql

# Restore analytics data
psql youth_green_jobs_db < analytics_backup.sql
```

## Testing Strategy

### Unit Tests
```python
class TestAnalyticsAggregation(TestCase):
    def test_platform_metrics_aggregation(self):
        # Create test data
        user = User.objects.create_user('test@example.com')
        WasteReport.objects.create(
            reporter=user,
            status='collected',
            actual_weight_kg=10.5
        )
        
        # Run aggregation
        call_command('aggregate_daily_analytics', '--date', '2025-09-18')
        
        # Verify results
        metrics = PlatformMetrics.objects.get(date='2025-09-18')
        self.assertEqual(metrics.waste_collected_today_kg, Decimal('10.5'))
```

### Integration Tests
```python
class TestAnalyticsAPI(APITestCase):
    def test_dashboard_summary_endpoint(self):
        # Create admin user and authenticate
        admin = User.objects.create_superuser('admin@example.com')
        self.client.force_authenticate(user=admin)
        
        # Test endpoint
        response = self.client.get('/api/v1/analytics/dashboard/summary/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('users_today', response.data)
```

## Troubleshooting Guide

### Common Issues

1. **Aggregation Failures**: Check database connectivity and model relationships
2. **Performance Issues**: Review query optimization and caching
3. **Chart Rendering**: Verify data format and frontend dependencies
4. **Permission Errors**: Confirm user roles and permissions

### Debug Commands
```bash
# Check aggregation status
python manage.py shell -c "from analytics.models import PlatformMetrics; print(PlatformMetrics.objects.count())"

# Test API endpoints
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/analytics/dashboard/summary/

# Monitor system performance
python manage.py monitor_system_performance --once
```
