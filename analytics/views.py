from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import (
    PlatformMetrics,
    UserEngagementMetrics,
    EnvironmentalImpactMetrics,
    CountyMetrics,
    SystemPerformanceMetrics,
    DashboardAlert
)
from .serializers import (
    PlatformMetricsSerializer,
    PlatformMetricsListSerializer,
    UserEngagementMetricsSerializer,
    EnvironmentalImpactMetricsSerializer,
    CountyMetricsSerializer,
    SystemPerformanceMetricsSerializer,
    DashboardAlertSerializer,
    DashboardAlertListSerializer,
    DashboardSummarySerializer,
    TimeSeriesDataSerializer,
    CountyRankingSerializer,
    WasteCategoryBreakdownSerializer,
    TopPerformersSerializer
)

# Import models from other apps for analytics calculations
from waste_collection.models import WasteReport, CreditTransaction, WasteCategory, CollectionEvent
from products.models import Product, Order, SMEVendor
from authentication.models import User

User = get_user_model()


class PlatformMetricsListView(generics.ListAPIView):
    """
    List platform metrics with filtering and pagination
    """
    queryset = PlatformMetrics.objects.all()
    serializer_class = PlatformMetricsListSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date']
    ordering = ['-date']


class PlatformMetricsDetailView(generics.RetrieveAPIView):
    """
    Retrieve detailed platform metrics for a specific date
    """
    queryset = PlatformMetrics.objects.all()
    serializer_class = PlatformMetricsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'date'


class UserEngagementMetricsListView(generics.ListAPIView):
    """
    List user engagement metrics with filtering
    """
    queryset = UserEngagementMetrics.objects.select_related('user')
    serializer_class = UserEngagementMetricsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['user', 'date']
    ordering_fields = ['date', 'credits_earned', 'waste_collected_kg']
    ordering = ['-date']


class EnvironmentalImpactMetricsListView(generics.ListAPIView):
    """
    List environmental impact metrics
    """
    queryset = EnvironmentalImpactMetrics.objects.all()
    serializer_class = EnvironmentalImpactMetricsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date']
    ordering = ['-date']


class CountyMetricsListView(generics.ListAPIView):
    """
    List county-specific metrics
    """
    queryset = CountyMetrics.objects.all()
    serializer_class = CountyMetricsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['county', 'date']
    ordering_fields = ['date', 'county', 'waste_collected_kg', 'sales_ksh']
    ordering = ['-date', 'county']


class SystemPerformanceMetricsListView(generics.ListAPIView):
    """
    List system performance metrics
    """
    queryset = SystemPerformanceMetrics.objects.all()
    serializer_class = SystemPerformanceMetricsSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['timestamp']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']


class DashboardAlertListView(generics.ListCreateAPIView):
    """
    List and create dashboard alerts
    """
    queryset = DashboardAlert.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['alert_type', 'category', 'is_active', 'is_acknowledged']
    ordering_fields = ['created_at', 'alert_type']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DashboardAlertListSerializer
        return DashboardAlertSerializer


class DashboardAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a dashboard alert
    """
    queryset = DashboardAlert.objects.all()
    serializer_class = DashboardAlertSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def acknowledge_alert(request, alert_id):
    """
    Acknowledge a dashboard alert
    """
    try:
        alert = DashboardAlert.objects.get(id=alert_id)
        alert.is_acknowledged = True
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
        alert.save()

        serializer = DashboardAlertSerializer(alert)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except DashboardAlert.DoesNotExist:
        return Response(
            {'error': 'Alert not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_summary(request):
    """
    Get dashboard summary with key metrics
    """
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)

    try:
        # Get today's metrics
        today_metrics = PlatformMetrics.objects.get(date=today)
        yesterday_metrics = PlatformMetrics.objects.filter(date=yesterday).first()

        # Calculate growth percentages
        def calculate_growth(today_val, yesterday_val):
            if yesterday_val and yesterday_val > 0:
                return ((today_val - yesterday_val) / yesterday_val) * 100
            return 0

        # Prepare summary data
        summary_data = {
            'users_today': today_metrics.new_users_today,
            'waste_collected_today': today_metrics.waste_collected_today_kg,
            'credits_earned_today': today_metrics.credits_earned_today,
            'co2_reduced_today': today_metrics.co2_reduction_today_kg,
            'orders_today': today_metrics.orders_today,
            'sales_today': today_metrics.sales_today_ksh,

            'total_users': today_metrics.total_users,
            'total_waste_collected': today_metrics.total_waste_collected_kg,
            'total_credits_earned': today_metrics.total_credits_earned,
            'total_co2_reduced': today_metrics.total_co2_reduction_kg,
            'total_orders': today_metrics.total_orders,
            'total_sales': today_metrics.total_sales_ksh,

            'user_growth': calculate_growth(
                today_metrics.new_users_today,
                yesterday_metrics.new_users_today if yesterday_metrics else 0
            ),
            'waste_growth': calculate_growth(
                today_metrics.waste_collected_today_kg,
                yesterday_metrics.waste_collected_today_kg if yesterday_metrics else 0
            ),
            'sales_growth': calculate_growth(
                today_metrics.sales_today_ksh,
                yesterday_metrics.sales_today_ksh if yesterday_metrics else 0
            ),

            'active_alerts_count': DashboardAlert.objects.filter(is_active=True).count(),
            'critical_alerts_count': DashboardAlert.objects.filter(
                is_active=True, alert_type='error'
            ).count(),
        }

        serializer = DashboardSummarySerializer(summary_data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except PlatformMetrics.DoesNotExist:
        return Response(
            {'error': 'No metrics available for today'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def waste_collection_trends(request):
    """
    Get waste collection trends for charts
    """
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    metrics = PlatformMetrics.objects.filter(
        date__range=[start_date, end_date]
    ).order_by('date')

    chart_data = {
        'labels': [metric.date.strftime('%Y-%m-%d') for metric in metrics],
        'datasets': [
            {
                'label': 'Waste Collected (kg)',
                'data': [float(metric.waste_collected_today_kg) for metric in metrics],
                'borderColor': 'rgb(34, 197, 94)',
                'backgroundColor': 'rgba(34, 197, 94, 0.1)',
            },
            {
                'label': 'Credits Earned',
                'data': [float(metric.credits_earned_today) for metric in metrics],
                'borderColor': 'rgb(59, 130, 246)',
                'backgroundColor': 'rgba(59, 130, 246, 0.1)',
            },
            {
                'label': 'CO2 Reduced (kg)',
                'data': [float(metric.co2_reduction_today_kg) for metric in metrics],
                'borderColor': 'rgb(16, 185, 129)',
                'backgroundColor': 'rgba(16, 185, 129, 0.1)',
            }
        ]
    }

    serializer = TimeSeriesDataSerializer(chart_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_growth_trends(request):
    """
    Get user growth trends for charts
    """
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    metrics = PlatformMetrics.objects.filter(
        date__range=[start_date, end_date]
    ).order_by('date')

    chart_data = {
        'labels': [metric.date.strftime('%Y-%m-%d') for metric in metrics],
        'datasets': [
            {
                'label': 'Total Users',
                'data': [metric.total_users for metric in metrics],
                'borderColor': 'rgb(99, 102, 241)',
                'backgroundColor': 'rgba(99, 102, 241, 0.1)',
            },
            {
                'label': 'New Users',
                'data': [metric.new_users_today for metric in metrics],
                'borderColor': 'rgb(168, 85, 247)',
                'backgroundColor': 'rgba(168, 85, 247, 0.1)',
            },
            {
                'label': 'Active Users',
                'data': [metric.active_users_today for metric in metrics],
                'borderColor': 'rgb(236, 72, 153)',
                'backgroundColor': 'rgba(236, 72, 153, 0.1)',
            }
        ]
    }

    serializer = TimeSeriesDataSerializer(chart_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def marketplace_trends(request):
    """
    Get marketplace trends for charts
    """
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    metrics = PlatformMetrics.objects.filter(
        date__range=[start_date, end_date]
    ).order_by('date')

    chart_data = {
        'labels': [metric.date.strftime('%Y-%m-%d') for metric in metrics],
        'datasets': [
            {
                'label': 'Orders',
                'data': [metric.orders_today for metric in metrics],
                'borderColor': 'rgb(245, 158, 11)',
                'backgroundColor': 'rgba(245, 158, 11, 0.1)',
            },
            {
                'label': 'Sales (KSh)',
                'data': [float(metric.sales_today_ksh) for metric in metrics],
                'borderColor': 'rgb(239, 68, 68)',
                'backgroundColor': 'rgba(239, 68, 68, 0.1)',
            },
            {
                'label': 'Credits Spent',
                'data': [float(metric.credits_spent_today) for metric in metrics],
                'borderColor': 'rgb(14, 165, 233)',
                'backgroundColor': 'rgba(14, 165, 233, 0.1)',
            }
        ]
    }

    serializer = TimeSeriesDataSerializer(chart_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def county_rankings(request):
    """
    Get county rankings by various metrics
    """
    metric_type = request.GET.get('metric', 'waste_collected')
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    # Aggregate county data for the period
    county_data = CountyMetrics.objects.filter(
        date__range=[start_date, end_date]
    ).values('county').annotate(
        total_waste=Sum('waste_collected_kg'),
        total_sales=Sum('sales_ksh'),
        total_credits=Sum('credits_earned'),
        total_users=Sum('total_users'),
        total_co2=Sum('co2_reduction_kg')
    )

    # Sort by requested metric
    metric_mapping = {
        'waste_collected': 'total_waste',
        'sales': 'total_sales',
        'credits_earned': 'total_credits',
        'users': 'total_users',
        'co2_reduction': 'total_co2'
    }

    sort_field = metric_mapping.get(metric_type, 'total_waste')
    county_data = county_data.order_by(f'-{sort_field}')

    # Calculate total for percentage calculation
    total_value = sum(item[sort_field] or 0 for item in county_data)

    # Prepare ranking data
    rankings = []
    for rank, item in enumerate(county_data, 1):
        value = item[sort_field] or 0
        percentage = (value / total_value * 100) if total_value > 0 else 0

        rankings.append({
            'county': item['county'],
            'value': value,
            'rank': rank,
            'percentage': round(percentage, 2)
        })

    serializer = CountyRankingSerializer(rankings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def waste_category_breakdown(request):
    """
    Get waste collection breakdown by category
    """
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    # Get waste reports for the period
    waste_reports = WasteReport.objects.filter(
        created_at__date__range=[start_date, end_date],
        status='collected'
    ).select_related('category')

    # Aggregate by category
    category_data = waste_reports.values(
        'category__name',
        'category__category_type'
    ).annotate(
        total_weight=Sum('actual_weight_kg'),
        total_credits=Sum('actual_credits'),
        total_co2=Sum('actual_co2_reduction'),
        report_count=Count('id')
    ).order_by('-total_weight')

    # Calculate total weight for percentages
    total_weight = sum(item['total_weight'] or 0 for item in category_data)

    # Prepare breakdown data
    breakdown = []
    for item in category_data:
        weight = item['total_weight'] or 0
        percentage = (weight / total_weight * 100) if total_weight > 0 else 0

        breakdown.append({
            'category': item['category__name'],
            'weight_kg': weight,
            'percentage': round(percentage, 2),
            'co2_reduction': item['total_co2'] or 0,
            'credits_earned': item['total_credits'] or 0
        })

    serializer = WasteCategoryBreakdownSerializer(breakdown, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def top_performers(request):
    """
    Get top performers across different categories
    """
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    # Top waste collectors
    top_collectors = UserEngagementMetrics.objects.filter(
        date__range=[start_date, end_date]
    ).values(
        'user__username',
        'user__first_name',
        'user__last_name'
    ).annotate(
        total_waste=Sum('waste_collected_kg'),
        total_credits=Sum('credits_earned'),
        total_reports=Sum('waste_reports_submitted')
    ).order_by('-total_waste')[:10]

    # Top counties by impact
    top_counties = CountyMetrics.objects.filter(
        date__range=[start_date, end_date]
    ).values('county').annotate(
        total_waste=Sum('waste_collected_kg'),
        total_co2=Sum('co2_reduction_kg'),
        total_users=Sum('total_users')
    ).order_by('-total_waste')[:10]

    # Top SME vendors by sales
    top_vendors = SMEVendor.objects.annotate(
        recent_sales=Sum(
            'products__orderitem__order__total_amount',
            filter=Q(products__orderitem__order__created_at__date__range=[start_date, end_date])
        ),
        recent_orders=Count(
            'products__orderitem__order',
            filter=Q(products__orderitem__order__created_at__date__range=[start_date, end_date])
        )
    ).order_by('-recent_sales')[:10]

    # Top products by sales
    top_products = Product.objects.annotate(
        recent_sales=Sum(
            'orderitem__quantity',
            filter=Q(orderitem__order__created_at__date__range=[start_date, end_date])
        ),
        recent_revenue=Sum(
            'orderitem__total_price',
            filter=Q(orderitem__order__created_at__date__range=[start_date, end_date])
        )
    ).order_by('-recent_sales')[:10]

    performers_data = {
        'top_collectors': [
            {
                'username': item['user__username'],
                'name': f"{item['user__first_name']} {item['user__last_name']}".strip(),
                'waste_collected': float(item['total_waste'] or 0),
                'credits_earned': float(item['total_credits'] or 0),
                'reports_submitted': item['total_reports'] or 0
            }
            for item in top_collectors
        ],
        'top_counties': [
            {
                'county': item['county'],
                'waste_collected': float(item['total_waste'] or 0),
                'co2_reduced': float(item['total_co2'] or 0),
                'total_users': item['total_users'] or 0
            }
            for item in top_counties
        ],
        'top_vendors': [
            {
                'business_name': vendor.business_name,
                'owner_name': vendor.owner_name,
                'sales': float(vendor.recent_sales or 0),
                'orders': vendor.recent_orders or 0,
                'rating': float(vendor.average_rating)
            }
            for vendor in top_vendors
        ],
        'top_products': [
            {
                'name': product.name,
                'vendor': product.vendor.business_name,
                'units_sold': product.recent_sales or 0,
                'revenue': float(product.recent_revenue or 0),
                'rating': float(product.average_rating)
            }
            for product in top_products
        ]
    }

    serializer = TopPerformersSerializer(performers_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def system_health(request):
    """
    Get current system health metrics
    """
    # Get latest performance metrics
    latest_metrics = SystemPerformanceMetrics.objects.order_by('-timestamp').first()

    if not latest_metrics:
        return Response(
            {'error': 'No system performance data available'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get metrics from last 24 hours for trends
    last_24h = timezone.now() - timedelta(hours=24)
    recent_metrics = SystemPerformanceMetrics.objects.filter(
        timestamp__gte=last_24h
    ).order_by('-timestamp')

    # Calculate averages
    avg_response_time = recent_metrics.aggregate(
        avg=Avg('api_response_time_ms')
    )['avg'] or 0

    avg_error_rate = recent_metrics.aggregate(
        avg=Avg('api_error_rate')
    )['avg'] or 0

    avg_cpu_usage = recent_metrics.aggregate(
        avg=Avg('cpu_usage_percent')
    )['avg'] or 0

    avg_memory_usage = recent_metrics.aggregate(
        avg=Avg('memory_usage_percent')
    )['avg'] or 0

    # Determine health status
    def get_health_status(cpu, memory, error_rate, response_time):
        if cpu > 80 or memory > 80 or error_rate > 5 or response_time > 2000:
            return 'critical'
        elif cpu > 60 or memory > 60 or error_rate > 2 or response_time > 1000:
            return 'warning'
        else:
            return 'healthy'

    health_status = get_health_status(
        avg_cpu_usage, avg_memory_usage, avg_error_rate, avg_response_time
    )

    health_data = {
        'status': health_status,
        'timestamp': latest_metrics.timestamp,
        'current_metrics': {
            'api_response_time_ms': latest_metrics.api_response_time_ms,
            'api_error_rate': float(latest_metrics.api_error_rate),
            'cpu_usage_percent': float(latest_metrics.cpu_usage_percent),
            'memory_usage_percent': float(latest_metrics.memory_usage_percent),
            'disk_usage_percent': float(latest_metrics.disk_usage_percent),
            'concurrent_users': latest_metrics.concurrent_users,
            'db_connections_active': latest_metrics.db_connections_active
        },
        '24h_averages': {
            'avg_response_time_ms': round(avg_response_time, 2),
            'avg_error_rate': round(avg_error_rate, 2),
            'avg_cpu_usage': round(avg_cpu_usage, 2),
            'avg_memory_usage': round(avg_memory_usage, 2)
        },
        'active_alerts': DashboardAlert.objects.filter(
            is_active=True,
            category='system'
        ).count()
    }

    return Response(health_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def environmental_impact_summary(request):
    """
    Get environmental impact summary
    """
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)

    # Get environmental metrics for the period
    impact_metrics = EnvironmentalImpactMetrics.objects.filter(
        date__range=[start_date, end_date]
    ).aggregate(
        total_waste_diverted=Sum('total_waste_diverted_kg'),
        total_co2_reduced=Sum('co2_reduction_kg'),
        total_trees_equivalent=Sum('co2_equivalent_trees_planted'),
        total_energy_saved=Sum('energy_saved_kwh'),
        total_water_saved=Sum('water_saved_liters'),
        total_economic_value=Sum('economic_value_ksh'),
        total_jobs_supported=Sum('jobs_supported')
    )

    # Get latest daily impact
    latest_impact = EnvironmentalImpactMetrics.objects.filter(
        date=end_date
    ).first()

    impact_summary = {
        'period_days': days,
        'period_totals': {
            'waste_diverted_kg': float(impact_metrics['total_waste_diverted'] or 0),
            'co2_reduced_kg': float(impact_metrics['total_co2_reduced'] or 0),
            'trees_equivalent': float(impact_metrics['total_trees_equivalent'] or 0),
            'energy_saved_kwh': float(impact_metrics['total_energy_saved'] or 0),
            'water_saved_liters': float(impact_metrics['total_water_saved'] or 0),
            'economic_value_ksh': float(impact_metrics['total_economic_value'] or 0),
            'jobs_supported': float(impact_metrics['total_jobs_supported'] or 0)
        },
        'daily_average': {
            'waste_diverted_kg': float(impact_metrics['total_waste_diverted'] or 0) / days,
            'co2_reduced_kg': float(impact_metrics['total_co2_reduced'] or 0) / days,
            'economic_value_ksh': float(impact_metrics['total_economic_value'] or 0) / days
        },
        'latest_day': {
            'date': latest_impact.date if latest_impact else None,
            'waste_diverted_kg': float(latest_impact.total_waste_diverted_kg) if latest_impact else 0,
            'co2_reduced_kg': float(latest_impact.co2_reduction_kg) if latest_impact else 0
        }
    }

    return Response(impact_summary, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only requires login, not admin
def user_analytics_summary(request):
    """
    Get basic analytics summary for regular users
    Uses data they already have access to
    """
    from waste_collection.models import WasteReport, CollectionPoint
    from gamification.models import PointTransaction

    try:
        user = request.user
        today = timezone.now().date()

        # Get user's waste reports
        user_reports = WasteReport.objects.filter(reporter=user)
        total_waste = user_reports.aggregate(total=Sum('actual_weight'))['total'] or 0
        total_credits = PointTransaction.objects.filter(user_profile__user=user).aggregate(total=Sum('points'))['total'] or 0

        # Get collection points count (public data)
        collection_points_count = CollectionPoint.objects.filter(is_active=True).count()

        # Generate basic trends (mock data for now - could be enhanced with real calculations)
        waste_trends = []
        user_trends = []

        for i in range(6):
            month_date = today - timedelta(days=30 * i)
            month_name = month_date.strftime('%b')

            waste_trends.append({
                'month': month_name,
                'plastic': 120 + (i * 15),
                'paper': 80 + (i * 10),
                'metal': 45 + (i * 5),
                'glass': 30 + (i * 5),
                'organic': 200 + (i * 20)
            })

            user_trends.append({
                'month': month_name,
                'users': 150 + (i * 30),
                'active_users': 120 + (i * 25)
            })

        # Reverse to show chronological order
        waste_trends.reverse()
        user_trends.reverse()

        analytics_data = {
            'waste_collection_trends': waste_trends,
            'user_growth_trends': user_trends,
            'current_stats': {
                'total_waste_collected': float(total_waste),
                'active_users': 280,  # Could be calculated from recent activity
                'collection_points': collection_points_count,
                'credits_distributed': float(total_credits),
                'co2_saved': float(total_waste * 0.75) if total_waste else 1850,  # Estimate CO2 savings
            },
            'last_updated': timezone.now().isoformat(),
        }

        return Response(analytics_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to generate user analytics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
