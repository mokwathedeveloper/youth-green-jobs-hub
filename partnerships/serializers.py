"""
Serializers for partnership system
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Partner, Collaboration, PartnershipAgreement,
    PartnerIntegration, PartnershipReport
)


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for partnerships"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class PartnerSerializer(serializers.ModelSerializer):
    """Partner serializer"""
    created_by = UserBasicSerializer(read_only=True)
    is_active = serializers.ReadOnlyField()
    collaborations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'description', 'logo', 'partner_type',
            'contact_person', 'contact_email', 'contact_phone', 'website',
            'address', 'city', 'county', 'country',
            'partnership_start_date', 'partnership_end_date', 'status',
            'focus_areas', 'api_key', 'webhook_url',
            'is_active', 'collaborations_count', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_collaborations_count(self, obj):
        """Get number of active collaborations"""
        return obj.collaborations.filter(status__in=['planning', 'active']).count()


class PartnerListSerializer(serializers.ModelSerializer):
    """Simplified partner serializer for list views"""
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'partner_type', 'status', 'is_active',
            'contact_person', 'contact_email', 'city', 'county',
            'partnership_start_date', 'created_at'
        ]


class CollaborationSerializer(serializers.ModelSerializer):
    """Collaboration serializer"""
    partner = PartnerListSerializer(read_only=True)
    partner_id = serializers.UUIDField(write_only=True)
    created_by = UserBasicSerializer(read_only=True)
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Collaboration
        fields = [
            'id', 'title', 'description', 'partner', 'partner_id',
            'collaboration_type', 'start_date', 'end_date',
            'budget_amount', 'currency', 'target_beneficiaries', 'target_waste_kg',
            'status', 'progress_percentage', 'actual_beneficiaries', 'actual_waste_kg',
            'documents', 'is_active', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class CollaborationListSerializer(serializers.ModelSerializer):
    """Simplified collaboration serializer for list views"""
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Collaboration
        fields = [
            'id', 'title', 'partner_name', 'collaboration_type',
            'start_date', 'end_date', 'status', 'progress_percentage',
            'budget_amount', 'currency', 'is_active', 'created_at'
        ]


class PartnershipAgreementSerializer(serializers.ModelSerializer):
    """Partnership agreement serializer"""
    partner = PartnerListSerializer(read_only=True)
    partner_id = serializers.UUIDField(write_only=True)
    created_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PartnershipAgreement
        fields = [
            'id', 'partner', 'partner_id', 'title', 'description',
            'agreement_type', 'signed_date', 'effective_date', 'expiry_date',
            'terms_and_conditions', 'deliverables', 'total_value', 'payment_terms',
            'document_url', 'is_active', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class PartnerIntegrationSerializer(serializers.ModelSerializer):
    """Partner integration serializer"""
    partner = PartnerListSerializer(read_only=True)
    
    class Meta:
        model = PartnerIntegration
        fields = [
            'id', 'partner', 'integration_type', 'base_url',
            'authentication_method', 'data_mapping', 'sync_frequency',
            'last_sync_at', 'sync_status', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_sync_at', 'sync_status', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Hide sensitive credentials in API responses"""
        data = super().to_representation(instance)
        # Don't expose api_credentials in API responses
        return data


class PartnershipReportSerializer(serializers.ModelSerializer):
    """Partnership report serializer"""
    partner = PartnerListSerializer(read_only=True)
    partner_id = serializers.UUIDField(write_only=True)
    collaboration = CollaborationListSerializer(read_only=True)
    collaboration_id = serializers.UUIDField(write_only=True, required=False)
    generated_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PartnershipReport
        fields = [
            'id', 'partner', 'partner_id', 'collaboration', 'collaboration_id',
            'title', 'report_type', 'period_start', 'period_end',
            'report_data', 'executive_summary', 'key_achievements',
            'challenges', 'recommendations', 'report_document_url',
            'is_published', 'generated_by', 'generated_at'
        ]
        read_only_fields = ['id', 'generated_by', 'generated_at']


# Create/Update Serializers

class PartnerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating partners"""
    class Meta:
        model = Partner
        fields = [
            'name', 'description', 'logo', 'partner_type',
            'contact_person', 'contact_email', 'contact_phone', 'website',
            'address', 'city', 'county', 'country',
            'partnership_start_date', 'partnership_end_date',
            'focus_areas', 'webhook_url'
        ]


class CollaborationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating collaborations"""
    class Meta:
        model = Collaboration
        fields = [
            'title', 'description', 'partner', 'collaboration_type',
            'start_date', 'end_date', 'budget_amount', 'currency',
            'target_beneficiaries', 'target_waste_kg'
        ]


class CollaborationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating collaboration progress"""
    class Meta:
        model = Collaboration
        fields = [
            'status', 'progress_percentage', 'actual_beneficiaries',
            'actual_waste_kg', 'documents'
        ]


class PartnerIntegrationConfigSerializer(serializers.ModelSerializer):
    """Serializer for configuring partner integrations"""
    class Meta:
        model = PartnerIntegration
        fields = [
            'integration_type', 'base_url', 'authentication_method',
            'api_credentials', 'data_mapping', 'sync_frequency', 'is_active'
        ]


# Statistics and Analytics Serializers

class PartnershipStatsSerializer(serializers.Serializer):
    """Partnership statistics serializer"""
    total_partners = serializers.IntegerField()
    active_partners = serializers.IntegerField()
    total_collaborations = serializers.IntegerField()
    active_collaborations = serializers.IntegerField()
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    partners_by_type = serializers.DictField()
    collaborations_by_type = serializers.DictField()
    monthly_progress = serializers.ListField()


class PartnerDashboardSerializer(serializers.Serializer):
    """Partner dashboard data serializer"""
    partner_info = PartnerSerializer()
    active_collaborations = CollaborationListSerializer(many=True)
    recent_reports = PartnershipReportSerializer(many=True)
    integration_status = PartnerIntegrationSerializer()
    performance_metrics = serializers.DictField()


class CollaborationProgressSerializer(serializers.Serializer):
    """Collaboration progress tracking serializer"""
    collaboration_id = serializers.UUIDField()
    title = serializers.CharField()
    progress_percentage = serializers.IntegerField()
    milestones_completed = serializers.IntegerField()
    total_milestones = serializers.IntegerField()
    budget_utilized = serializers.DecimalField(max_digits=12, decimal_places=2)
    beneficiaries_reached = serializers.IntegerField()
    waste_collected_kg = serializers.DecimalField(max_digits=10, decimal_places=2)
