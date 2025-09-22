from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Platform Metrics
    path('platform-metrics/', views.PlatformMetricsListView.as_view(), name='platform-metrics-list'),
    path('platform-metrics/<str:date>/', views.PlatformMetricsDetailView.as_view(), name='platform-metrics-detail'),
    
    # User Engagement Metrics
    path('user-engagement/', views.UserEngagementMetricsListView.as_view(), name='user-engagement-list'),
    
    # Environmental Impact Metrics
    path('environmental-impact/', views.EnvironmentalImpactMetricsListView.as_view(), name='environmental-impact-list'),
    
    # County Metrics
    path('county-metrics/', views.CountyMetricsListView.as_view(), name='county-metrics-list'),
    
    # System Performance Metrics
    path('system-performance/', views.SystemPerformanceMetricsListView.as_view(), name='system-performance-list'),
    
    # Dashboard Alerts
    path('alerts/', views.DashboardAlertListView.as_view(), name='alerts-list'),
    path('alerts/<uuid:pk>/', views.DashboardAlertDetailView.as_view(), name='alerts-detail'),
    path('alerts/<uuid:alert_id>/acknowledge/', views.acknowledge_alert, name='acknowledge-alert'),
    
    # Dashboard Summary and Analytics
    path('dashboard/summary/', views.dashboard_summary, name='dashboard-summary'),
    path('dashboard/system-health/', views.system_health, name='system-health'),
    path('dashboard/environmental-impact/', views.environmental_impact_summary, name='environmental-impact-summary'),
    
    # Chart Data Endpoints
    path('charts/waste-trends/', views.waste_collection_trends, name='waste-trends'),
    path('charts/user-growth/', views.user_growth_trends, name='user-growth'),
    path('charts/marketplace-trends/', views.marketplace_trends, name='marketplace-trends'),

    # Rankings and Breakdowns
    path('rankings/counties/', views.county_rankings, name='county-rankings'),
    path('breakdown/waste-categories/', views.waste_category_breakdown, name='waste-category-breakdown'),
    path('top-performers/', views.top_performers, name='top-performers'),

    # User Analytics (no admin required)
    path('user/summary/', views.user_analytics_summary, name='user-analytics-summary'),
]
