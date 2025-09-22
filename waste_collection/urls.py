from django.urls import path
from . import views
from . import api_views

app_name = 'waste_collection'

urlpatterns = [
    # Real API endpoints (NO MOCK DATA)
    path('api/analytics/', api_views.analytics_dashboard, name='analytics-dashboard'),
    path('api/categories/', api_views.waste_categories, name='api-categories'),
    path('api/collection-points/', api_views.collection_points, name='api-collection-points'),
    path('api/dashboard/', api_views.user_dashboard, name='api-user-dashboard'),
    path('api/products/', api_views.products_list, name='api-products'),

    # Original endpoints
    path('categories/', views.WasteCategoryListView.as_view(), name='category-list'),
    
    # Collection Points
    path('collection-points/', views.CollectionPointListView.as_view(), name='collection-point-list'),
    path('collection-points/<uuid:pk>/', views.CollectionPointDetailView.as_view(), name='collection-point-detail'),
    path('collection-points/nearby/', views.nearby_collection_points, name='nearby-collection-points'),
    
    # Waste Reports
    path('reports/', views.WasteReportListCreateView.as_view(), name='waste-report-list-create'),
    path('reports/<uuid:pk>/', views.WasteReportDetailView.as_view(), name='waste-report-detail'),
    
    # Credit Transactions
    path('credits/', views.CreditTransactionListView.as_view(), name='credit-transaction-list'),
    path('credits/balance/', views.credit_balance, name='credit-balance'),
    
    # Collection Events
    path('events/', views.CollectionEventListCreateView.as_view(), name='collection-event-list-create'),
    path('events/<uuid:pk>/', views.CollectionEventDetailView.as_view(), name='collection-event-detail'),
    path('events/<uuid:event_id>/join/', views.join_collection_event, name='join-collection-event'),
    path('events/<uuid:event_id>/leave/', views.leave_collection_event, name='leave-collection-event'),
    
    # Dashboard and Statistics
    path('dashboard/stats/', views.user_dashboard_stats, name='user-dashboard-stats'),

    # Maps and Route Optimization
    path('maps/geocode/', views.geocode_address, name='geocode-address'),
    path('maps/reverse-geocode/', views.reverse_geocode, name='reverse-geocode'),
    path('routes/optimize/', views.optimize_route, name='optimize-route'),
    path('analytics/coverage/', views.collection_point_coverage_analysis, name='coverage-analysis'),
]
