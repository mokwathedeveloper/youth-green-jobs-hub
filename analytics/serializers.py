from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    PlatformMetrics,
    UserEngagementMetrics,
    EnvironmentalImpactMetrics,
    CountyMetrics,
    SystemPerformanceMetrics,
    DashboardAlert
)

User = get_user_model()


class PlatformMetricsSerializer(serializers.ModelSerializer):
    """
    Serializer for platform-wide metrics
    """
    class Meta:
        model = PlatformMetrics
        fields = [
            'id', 'date', 'total_users', 'new_users_today', 'active_users_today',
            'youth_users', 'sme_vendors', 'verified_vendors', 'total_waste_reports',
            'waste_reports_today', 'total_waste_collected_kg', 'waste_collected_today_kg',
            'total_credits_earned', 'credits_earned_today', 'total_co2_reduction_kg',
            'co2_reduction_today_kg', 'total_products', 'products_added_today',
            'total_orders', 'orders_today', 'total_sales_ksh', 'sales_today_ksh',
            'total_credits_spent', 'credits_spent_today', 'total_collection_events',
            'events_today', 'total_event_participants', 'event_participants_today',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlatformMetricsListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for platform metrics list view
    """
    class Meta:
        model = PlatformMetrics
        fields = [
            'id', 'date', 'total_users', 'active_users_today', 'total_waste_collected_kg',
            'waste_collected_today_kg', 'total_credits_earned', 'credits_earned_today',
            'total_co2_reduction_kg', 'co2_reduction_today_kg', 'total_sales_ksh',
            'sales_today_ksh', 'total_orders', 'orders_today'
        ]


class UserEngagementMetricsSerializer(serializers.ModelSerializer):
    """
    Serializer for user engagement metrics
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = UserEngagementMetrics
        fields = [
            'id', 'user', 'user_username', 'user_full_name', 'date',
            'login_count', 'session_duration_minutes', 'pages_visited',
            'waste_reports_submitted', 'waste_collected_kg', 'credits_earned',
            'events_joined', 'products_viewed', 'products_added_to_cart',
            'orders_placed', 'credits_spent', 'money_spent_ksh', 'reviews_written',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_username', 'user_full_name', 'created_at', 'updated_at']


class EnvironmentalImpactMetricsSerializer(serializers.ModelSerializer):
    """
    Serializer for environmental impact metrics
    """
    class Meta:
        model = EnvironmentalImpactMetrics
        fields = [
            'id', 'date', 'total_waste_diverted_kg', 'plastic_recycled_kg',
            'paper_recycled_kg', 'metal_recycled_kg', 'glass_recycled_kg',
            'organic_composted_kg', 'co2_reduction_kg', 'co2_equivalent_trees_planted',
            'energy_saved_kwh', 'water_saved_liters', 'landfill_space_saved_m3',
            'economic_value_ksh', 'jobs_supported', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CountyMetricsSerializer(serializers.ModelSerializer):
    """
    Serializer for county-specific metrics
    """
    class Meta:
        model = CountyMetrics
        fields = [
            'id', 'county', 'date', 'total_users', 'active_users', 'sme_vendors',
            'waste_reports', 'waste_collected_kg', 'credits_earned', 'co2_reduction_kg',
            'products_listed', 'orders_placed', 'sales_ksh', 'credits_spent',
            'collection_events', 'event_participants', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SystemPerformanceMetricsSerializer(serializers.ModelSerializer):
    """
    Serializer for system performance metrics
    """
    class Meta:
        model = SystemPerformanceMetrics
        fields = [
            'id', 'timestamp', 'api_response_time_ms', 'api_requests_count',
            'api_error_rate', 'db_query_time_ms', 'db_connections_active',
            'cpu_usage_percent', 'memory_usage_percent', 'disk_usage_percent',
            'concurrent_users', 'page_load_time_ms', 'error_count', 'warning_count',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DashboardAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for dashboard alerts
    """
    acknowledged_by_username = serializers.CharField(
        source='acknowledged_by.username', 
        read_only=True
    )
    
    class Meta:
        model = DashboardAlert
        fields = [
            'id', 'title', 'message', 'alert_type', 'category', 'is_active',
            'is_acknowledged', 'acknowledged_by', 'acknowledged_by_username',
            'acknowledged_at', 'alert_data', 'auto_resolve_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'acknowledged_by_username', 'created_at', 'updated_at']


class DashboardAlertListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for alerts list view
    """
    acknowledged_by_username = serializers.CharField(
        source='acknowledged_by.username', 
        read_only=True
    )
    
    class Meta:
        model = DashboardAlert
        fields = [
            'id', 'title', 'alert_type', 'category', 'is_active',
            'is_acknowledged', 'acknowledged_by_username', 'acknowledged_at', 'created_at'
        ]


# Dashboard Summary Serializers
class DashboardSummarySerializer(serializers.Serializer):
    """
    Serializer for dashboard summary data
    """
    # Today's Key Metrics
    users_today = serializers.IntegerField()
    waste_collected_today = serializers.DecimalField(max_digits=10, decimal_places=2)
    credits_earned_today = serializers.DecimalField(max_digits=10, decimal_places=2)
    co2_reduced_today = serializers.DecimalField(max_digits=10, decimal_places=2)
    orders_today = serializers.IntegerField()
    sales_today = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Total Metrics
    total_users = serializers.IntegerField()
    total_waste_collected = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_credits_earned = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_co2_reduced = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Growth Metrics (percentage change from yesterday)
    user_growth = serializers.DecimalField(max_digits=5, decimal_places=2)
    waste_growth = serializers.DecimalField(max_digits=5, decimal_places=2)
    sales_growth = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Active Alerts
    active_alerts_count = serializers.IntegerField()
    critical_alerts_count = serializers.IntegerField()


class ChartDataSerializer(serializers.Serializer):
    """
    Serializer for chart data points
    """
    date = serializers.DateField()
    value = serializers.DecimalField(max_digits=12, decimal_places=2)
    label = serializers.CharField(max_length=100, required=False)


class TimeSeriesDataSerializer(serializers.Serializer):
    """
    Serializer for time series chart data
    """
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.ListField(
        child=serializers.DictField()
    )


class CountyRankingSerializer(serializers.Serializer):
    """
    Serializer for county ranking data
    """
    county = serializers.CharField()
    value = serializers.DecimalField(max_digits=12, decimal_places=2)
    rank = serializers.IntegerField()
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class WasteCategoryBreakdownSerializer(serializers.Serializer):
    """
    Serializer for waste category breakdown
    """
    category = serializers.CharField()
    weight_kg = serializers.DecimalField(max_digits=10, decimal_places=2)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    co2_reduction = serializers.DecimalField(max_digits=10, decimal_places=2)
    credits_earned = serializers.DecimalField(max_digits=10, decimal_places=2)


class TopPerformersSerializer(serializers.Serializer):
    """
    Serializer for top performers data
    """
    # Top Users by Waste Collection
    top_collectors = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Top Counties by Impact
    top_counties = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Top SME Vendors by Sales
    top_vendors = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Top Products by Sales
    top_products = serializers.ListField(
        child=serializers.DictField()
    )
