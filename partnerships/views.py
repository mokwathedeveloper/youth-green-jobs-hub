"""
Views for partnership system
"""
from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
import uuid

from .models import (
    Partner, Collaboration, PartnershipAgreement,
    PartnerIntegration, PartnershipReport
)
from .serializers import (
    PartnerSerializer, PartnerListSerializer, PartnerCreateSerializer,
    CollaborationSerializer, CollaborationListSerializer, CollaborationCreateSerializer,
    CollaborationUpdateSerializer, PartnershipAgreementSerializer,
    PartnerIntegrationSerializer, PartnerIntegrationConfigSerializer,
    PartnershipReportSerializer, PartnershipStatsSerializer,
    PartnerDashboardSerializer, CollaborationProgressSerializer
)


# Partner Views

class PartnerListCreateView(generics.ListCreateAPIView):
    """List and create partners"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'partner_type', 'city', 'county']
    ordering_fields = ['name', 'created_at', 'partnership_start_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Partner.objects.all()
        
        # Filter by partner type
        partner_type = self.request.query_params.get('type')
        if partner_type:
            queryset = queryset.filter(partner_type=partner_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by active status
        active_only = self.request.query_params.get('active_only')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(status='active')
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PartnerCreateSerializer
        return PartnerListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PartnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete partner"""
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Only admins can delete partners"""
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [IsAuthenticated()]


# Collaboration Views

class CollaborationListCreateView(generics.ListCreateAPIView):
    """List and create collaborations"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'partner__name', 'collaboration_type']
    ordering_fields = ['title', 'start_date', 'created_at']
    ordering = ['-start_date']
    
    def get_queryset(self):
        queryset = Collaboration.objects.select_related('partner')
        
        # Filter by partner
        partner_id = self.request.query_params.get('partner')
        if partner_id:
            try:
                partner_uuid = uuid.UUID(partner_id)
                queryset = queryset.filter(partner_id=partner_uuid)
            except ValueError:
                pass
        
        # Filter by collaboration type
        collab_type = self.request.query_params.get('type')
        if collab_type:
            queryset = queryset.filter(collaboration_type=collab_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by active status
        active_only = self.request.query_params.get('active_only')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(status__in=['planning', 'active'])
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CollaborationCreateSerializer
        return CollaborationListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CollaborationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete collaboration"""
    queryset = Collaboration.objects.select_related('partner')
    serializer_class = CollaborationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return CollaborationUpdateSerializer
        return CollaborationSerializer
    
    def get_permissions(self):
        """Only admins can delete collaborations"""
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [IsAuthenticated()]


# Partnership Agreement Views

class PartnershipAgreementListCreateView(generics.ListCreateAPIView):
    """List and create partnership agreements"""
    serializer_class = PartnershipAgreementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'partner__name', 'agreement_type']
    ordering = ['-signed_date']
    
    def get_queryset(self):
        queryset = PartnershipAgreement.objects.select_related('partner')
        
        # Filter by partner
        partner_id = self.request.query_params.get('partner')
        if partner_id:
            try:
                partner_uuid = uuid.UUID(partner_id)
                queryset = queryset.filter(partner_id=partner_uuid)
            except ValueError:
                pass
        
        # Filter by agreement type
        agreement_type = self.request.query_params.get('type')
        if agreement_type:
            queryset = queryset.filter(agreement_type=agreement_type)
        
        # Filter by active status
        active_only = self.request.query_params.get('active_only')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(is_active=True)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PartnershipAgreementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete partnership agreement"""
    queryset = PartnershipAgreement.objects.select_related('partner')
    serializer_class = PartnershipAgreementSerializer
    permission_classes = [IsAuthenticated]


# Partner Integration Views

class PartnerIntegrationListView(generics.ListAPIView):
    """List partner integrations"""
    serializer_class = PartnerIntegrationSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return PartnerIntegration.objects.select_related('partner')


class PartnerIntegrationDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update partner integration"""
    queryset = PartnerIntegration.objects.select_related('partner')
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return PartnerIntegrationConfigSerializer
        return PartnerIntegrationSerializer


@api_view(['POST'])
@permission_classes([IsAdminUser])
def sync_partner_data(request, partner_id):
    """Manually trigger data sync with partner"""
    try:
        partner = get_object_or_404(Partner, id=partner_id)
        integration = get_object_or_404(PartnerIntegration, partner=partner)
        
        # Here you would implement the actual sync logic
        # For now, just update the sync status
        integration.last_sync_at = timezone.now()
        integration.sync_status = 'success'
        integration.save()
        
        return Response({
            'success': True,
            'message': f'Data sync initiated for {partner.name}',
            'last_sync_at': integration.last_sync_at
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Partnership Report Views

class PartnershipReportListCreateView(generics.ListCreateAPIView):
    """List and create partnership reports"""
    serializer_class = PartnershipReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'partner__name', 'report_type']
    ordering = ['-period_end']
    
    def get_queryset(self):
        queryset = PartnershipReport.objects.select_related('partner', 'collaboration')
        
        # Filter by partner
        partner_id = self.request.query_params.get('partner')
        if partner_id:
            try:
                partner_uuid = uuid.UUID(partner_id)
                queryset = queryset.filter(partner_id=partner_uuid)
            except ValueError:
                pass
        
        # Filter by report type
        report_type = self.request.query_params.get('type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        # Filter by published status
        published_only = self.request.query_params.get('published_only')
        if published_only and published_only.lower() == 'true':
            queryset = queryset.filter(is_published=True)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)


class PartnershipReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete partnership report"""
    queryset = PartnershipReport.objects.select_related('partner', 'collaboration')
    serializer_class = PartnershipReportSerializer
    permission_classes = [IsAuthenticated]


# Statistics and Analytics Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def partnership_statistics(request):
    """Get partnership statistics"""
    try:
        # Basic counts
        total_partners = Partner.objects.count()
        active_partners = Partner.objects.filter(status='active').count()
        total_collaborations = Collaboration.objects.count()
        active_collaborations = Collaboration.objects.filter(
            status__in=['planning', 'active']
        ).count()
        
        # Budget totals
        total_budget = Collaboration.objects.aggregate(
            total=Sum('budget_amount')
        )['total'] or 0
        
        # Partners by type
        partners_by_type = dict(
            Partner.objects.values('partner_type').annotate(
                count=Count('id')
            ).values_list('partner_type', 'count')
        )
        
        # Collaborations by type
        collaborations_by_type = dict(
            Collaboration.objects.values('collaboration_type').annotate(
                count=Count('id')
            ).values_list('collaboration_type', 'count')
        )
        
        # Monthly progress (last 12 months)
        monthly_progress = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            month_data = {
                'month': month_start.strftime('%Y-%m'),
                'new_partners': Partner.objects.filter(
                    created_at__range=[month_start, month_end]
                ).count(),
                'new_collaborations': Collaboration.objects.filter(
                    created_at__range=[month_start, month_end]
                ).count(),
            }
            monthly_progress.append(month_data)
        
        stats_data = {
            'total_partners': total_partners,
            'active_partners': active_partners,
            'total_collaborations': total_collaborations,
            'active_collaborations': active_collaborations,
            'total_budget': total_budget,
            'partners_by_type': partners_by_type,
            'collaborations_by_type': collaborations_by_type,
            'monthly_progress': monthly_progress,
        }
        
        serializer = PartnershipStatsSerializer(stats_data)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
