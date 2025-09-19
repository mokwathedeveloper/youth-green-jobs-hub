from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    WasteCategory,
    CollectionPoint,
    WasteReport,
    CreditTransaction,
    CollectionEvent,
    EventParticipation,
    CollectionRoute,
    CollectionPointLocation,
    RouteOptimization
)

User = get_user_model()


class WasteCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for waste categories
    """
    class Meta:
        model = WasteCategory
        fields = [
            'id', 'name', 'category_type', 'description', 
            'credit_rate_per_kg', 'co2_reduction_per_kg', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CollectionPointSerializer(serializers.ModelSerializer):
    """
    Serializer for collection points
    """
    accepted_categories = WasteCategorySerializer(many=True, read_only=True)
    accepted_category_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = CollectionPoint
        fields = [
            'id', 'name', 'point_type', 'address', 'county', 'sub_county',
            'latitude', 'longitude', 'contact_phone', 'contact_email',
            'operating_hours', 'accepted_categories', 'accepted_category_ids',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        accepted_category_ids = validated_data.pop('accepted_category_ids', [])
        collection_point = CollectionPoint.objects.create(**validated_data)
        if accepted_category_ids:
            collection_point.accepted_categories.set(accepted_category_ids)
        return collection_point
    
    def update(self, instance, validated_data):
        accepted_category_ids = validated_data.pop('accepted_category_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if accepted_category_ids is not None:
            instance.accepted_categories.set(accepted_category_ids)
        
        return instance


class UserBasicSerializer(serializers.ModelSerializer):
    """
    Basic user serializer for nested relationships
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id', 'username', 'first_name', 'last_name', 'email']


class WasteReportListSerializer(serializers.ModelSerializer):
    """
    Serializer for waste report list view (minimal data)
    """
    reporter = UserBasicSerializer(read_only=True)
    category = WasteCategorySerializer(read_only=True)
    estimated_credits = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    actual_credits = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = WasteReport
        fields = [
            'id', 'title', 'reporter', 'category', 'status', 'priority',
            'estimated_weight_kg', 'actual_weight_kg', 'estimated_credits',
            'actual_credits', 'county', 'sub_county', 'created_at'
        ]


class WasteReportDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for waste report detail view (complete data)
    """
    reporter = UserBasicSerializer(read_only=True)
    category = WasteCategorySerializer(read_only=True)
    collection_point = CollectionPointSerializer(read_only=True)
    verified_by = UserBasicSerializer(read_only=True)
    collected_by = UserBasicSerializer(read_only=True)
    estimated_credits = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    actual_credits = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    estimated_co2_reduction = serializers.DecimalField(max_digits=10, decimal_places=4, read_only=True)
    actual_co2_reduction = serializers.DecimalField(max_digits=10, decimal_places=4, read_only=True)
    
    class Meta:
        model = WasteReport
        fields = [
            'id', 'title', 'description', 'reporter', 'category', 'status', 'priority',
            'estimated_weight_kg', 'actual_weight_kg', 'location_description',
            'county', 'sub_county', 'latitude', 'longitude', 'photo',
            'collection_point', 'verified_by', 'verified_at', 'collected_by',
            'collected_at', 'notes', 'estimated_credits', 'actual_credits',
            'estimated_co2_reduction', 'actual_co2_reduction', 'created_at', 'updated_at'
        ]


class WasteReportCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating waste reports
    """
    category_id = serializers.UUIDField(write_only=True)
    collection_point_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = WasteReport
        fields = [
            'title', 'description', 'category_id', 'estimated_weight_kg',
            'location_description', 'county', 'sub_county', 'latitude',
            'longitude', 'photo', 'priority', 'collection_point_id'
        ]
    
    def validate_category_id(self, value):
        try:
            WasteCategory.objects.get(id=value, is_active=True)
        except WasteCategory.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive waste category.")
        return value
    
    def validate_collection_point_id(self, value):
        if value:
            try:
                CollectionPoint.objects.get(id=value, is_active=True)
            except CollectionPoint.DoesNotExist:
                raise serializers.ValidationError("Invalid or inactive collection point.")
        return value
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        collection_point_id = validated_data.pop('collection_point_id', None)
        
        validated_data['category_id'] = category_id
        validated_data['reporter'] = self.context['request'].user
        
        if collection_point_id:
            validated_data['collection_point_id'] = collection_point_id
        
        return WasteReport.objects.create(**validated_data)


class WasteReportUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating waste reports (staff only)
    """
    verified_by_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    collected_by_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    collection_point_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = WasteReport
        fields = [
            'status', 'priority', 'actual_weight_kg', 'verified_by_id',
            'verified_at', 'collected_by_id', 'collected_at', 'notes',
            'collection_point_id'
        ]
    
    def validate_status(self, value):
        # Add business logic for status transitions
        if self.instance and self.instance.status == 'cancelled':
            raise serializers.ValidationError("Cannot update cancelled reports.")
        return value


class CreditTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for credit transactions
    """
    user = UserBasicSerializer(read_only=True)
    waste_report = WasteReportListSerializer(read_only=True)
    processed_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = CreditTransaction
        fields = [
            'id', 'user', 'transaction_type', 'amount', 'waste_report',
            'description', 'reference_id', 'processed_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EventParticipationSerializer(serializers.ModelSerializer):
    """
    Serializer for event participation
    """
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = EventParticipation
        fields = [
            'id', 'user', 'joined_at', 'weight_collected', 'credits_earned'
        ]
        read_only_fields = ['id', 'joined_at']


class CollectionEventListSerializer(serializers.ModelSerializer):
    """
    Serializer for collection event list view
    """
    organizer = UserBasicSerializer(read_only=True)
    participant_count = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = CollectionEvent
        fields = [
            'id', 'title', 'event_type', 'organizer', 'location',
            'county', 'sub_county', 'start_date', 'end_date',
            'max_participants', 'participant_count', 'status',
            'bonus_multiplier', 'is_active', 'created_at'
        ]


class CollectionEventDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for collection event detail view
    """
    organizer = UserBasicSerializer(read_only=True)
    target_categories = WasteCategorySerializer(many=True, read_only=True)
    participants = EventParticipationSerializer(
        source='eventparticipation_set', 
        many=True, 
        read_only=True
    )
    participant_count = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = CollectionEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'organizer',
            'location', 'county', 'sub_county', 'start_date', 'end_date',
            'max_participants', 'participant_count', 'target_categories',
            'bonus_multiplier', 'status', 'total_weight_collected',
            'total_credits_awarded', 'participants', 'is_active',
            'created_at', 'updated_at'
        ]


class CollectionEventCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating collection events
    """
    target_category_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = CollectionEvent
        fields = [
            'title', 'description', 'event_type', 'location',
            'county', 'sub_county', 'start_date', 'end_date',
            'max_participants', 'target_category_ids', 'bonus_multiplier'
        ]
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        return data
    
    def create(self, validated_data):
        target_category_ids = validated_data.pop('target_category_ids', [])
        validated_data['organizer'] = self.context['request'].user
        
        event = CollectionEvent.objects.create(**validated_data)
        if target_category_ids:
            event.target_categories.set(target_category_ids)
        
        return event


# Maps and Route Serializers

class CollectionRouteSerializer(serializers.ModelSerializer):
    """Serializer for collection routes"""
    created_by = UserBasicSerializer(read_only=True)

    class Meta:
        model = CollectionRoute
        fields = [
            'id', 'name', 'description', 'estimated_duration_minutes',
            'estimated_distance_km', 'optimization_score', 'is_active',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CollectionPointLocationSerializer(serializers.ModelSerializer):
    """Serializer for collection point locations"""
    collection_point = CollectionPointSerializer(read_only=True)
    verified_by = UserBasicSerializer(read_only=True)
    latitude = serializers.ReadOnlyField()
    longitude = serializers.ReadOnlyField()

    class Meta:
        model = CollectionPointLocation
        fields = [
            'id', 'collection_point', 'latitude', 'longitude',
            'street_address', 'neighborhood', 'ward', 'constituency',
            'county', 'postal_code', 'place_id', 'plus_code',
            'accessibility_features', 'is_verified', 'verified_at',
            'verified_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'latitude', 'longitude', 'verified_at',
            'verified_by', 'created_at', 'updated_at'
        ]


class RouteOptimizationSerializer(serializers.ModelSerializer):
    """Serializer for route optimization requests"""
    requested_by = UserBasicSerializer(read_only=True)
    optimized_route = CollectionRouteSerializer(read_only=True)
    collection_points = CollectionPointSerializer(many=True, read_only=True)

    class Meta:
        model = RouteOptimization
        fields = [
            'id', 'max_duration_minutes', 'max_distance_km',
            'vehicle_capacity_kg', 'optimized_route', 'status',
            'requested_by', 'requested_at', 'completed_at',
            'optimization_results', 'collection_points'
        ]
        read_only_fields = [
            'id', 'optimized_route', 'status', 'requested_by',
            'requested_at', 'completed_at', 'optimization_results'
        ]


class RouteOptimizationCreateSerializer(serializers.Serializer):
    """Serializer for creating route optimization requests"""
    start_latitude = serializers.FloatField()
    start_longitude = serializers.FloatField()
    collection_point_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=2
    )
    max_duration_minutes = serializers.IntegerField(default=480)
    max_distance_km = serializers.DecimalField(
        max_digits=8, decimal_places=2, default=100.00
    )
    vehicle_capacity_kg = serializers.DecimalField(
        max_digits=8, decimal_places=2, default=1000.00
    )


class GeocodeSerializer(serializers.Serializer):
    """Serializer for geocoding requests"""
    address = serializers.CharField(max_length=500)


class ReverseGeocodeSerializer(serializers.Serializer):
    """Serializer for reverse geocoding requests"""
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
