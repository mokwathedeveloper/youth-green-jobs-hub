"""
URL configuration for partnerships app
"""
from django.urls import path
from . import views

app_name = 'partnerships'

urlpatterns = [
    # Partners
    path('partners/', views.PartnerListCreateView.as_view(), name='partner-list-create'),
    path('partners/<uuid:pk>/', views.PartnerDetailView.as_view(), name='partner-detail'),
    
    # Collaborations
    path('collaborations/', views.CollaborationListCreateView.as_view(), name='collaboration-list-create'),
    path('collaborations/<uuid:pk>/', views.CollaborationDetailView.as_view(), name='collaboration-detail'),
    
    # Partnership Agreements
    path('agreements/', views.PartnershipAgreementListCreateView.as_view(), name='agreement-list-create'),
    path('agreements/<uuid:pk>/', views.PartnershipAgreementDetailView.as_view(), name='agreement-detail'),
    
    # Partner Integrations
    path('integrations/', views.PartnerIntegrationListView.as_view(), name='integration-list'),
    path('integrations/<uuid:pk>/', views.PartnerIntegrationDetailView.as_view(), name='integration-detail'),
    path('integrations/<uuid:partner_id>/sync/', views.sync_partner_data, name='sync-partner-data'),
    
    # Partnership Reports
    path('reports/', views.PartnershipReportListCreateView.as_view(), name='report-list-create'),
    path('reports/<uuid:pk>/', views.PartnershipReportDetailView.as_view(), name='report-detail'),
    
    # Statistics
    path('statistics/', views.partnership_statistics, name='partnership-statistics'),
]
