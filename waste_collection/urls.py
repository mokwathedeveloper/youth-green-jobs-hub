from django.urls import path
from . import views

app_name = 'waste_collection'

urlpatterns = [
    # Waste Categories
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
    
    # Collection Events
    path('events/', views.CollectionEventListCreateView.as_view(), name='collection-event-list-create'),
    path('events/<uuid:pk>/', views.CollectionEventDetailView.as_view(), name='collection-event-detail'),
    path('events/<uuid:event_id>/join/', views.join_collection_event, name='join-collection-event'),
    path('events/<uuid:event_id>/leave/', views.leave_collection_event, name='leave-collection-event'),
    
    # Dashboard and Statistics
    path('dashboard/stats/', views.user_dashboard_stats, name='user-dashboard-stats'),
]
