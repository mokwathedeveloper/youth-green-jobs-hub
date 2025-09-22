from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404
# Temporarily disabled GIS import
# from django.contrib.gis.geos import Point
from decimal import Decimal

from .models import (
    WasteCategory,
    CollectionPoint,
    WasteReport,
    CreditTransaction,
    CollectionEvent,
    EventParticipation,
)
from .serializers import (
    WasteCategorySerializer,
    CollectionPointSerializer,
    WasteReportListSerializer,
    WasteReportDetailSerializer,
    WasteReportCreateSerializer,
    WasteReportUpdateSerializer,
    CreditTransactionSerializer,
    CollectionEventListSerializer,
    CollectionEventDetailSerializer,
    CollectionEventCreateSerializer,
    EventParticipationSerializer
)


class WasteCategoryListView(generics.ListAPIView):
    """
    List all active waste categories
    """
    queryset = WasteCategory.objects.filter(is_active=True)
    serializer_class = WasteCategorySerializer
    permission_classes = [IsAuthenticated]


class CollectionPointListView(generics.ListAPIView):
    """
    List all active collection points
    """
    queryset = CollectionPoint.objects.filter(is_active=True).prefetch_related('accepted_categories')
    serializer_class = CollectionPointSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        county = self.request.query_params.get('county')
        sub_county = self.request.query_params.get('sub_county')
        point_type = self.request.query_params.get('point_type')

        if county:
            queryset = queryset.filter(county__icontains=county)
        if sub_county:
            queryset = queryset.filter(sub_county__icontains=sub_county)
        if point_type:
            queryset = queryset.filter(point_type=point_type)

        return queryset


class CollectionPointDetailView(generics.RetrieveAPIView):
    """
    Retrieve a specific collection point
    """
    queryset = CollectionPoint.objects.filter(is_active=True).prefetch_related('accepted_categories')
    serializer_class = CollectionPointSerializer
    permission_classes = [IsAuthenticated]


class WasteReportListCreateView(generics.ListCreateAPIView):
    """
    List waste reports or create a new one
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = WasteReport.objects.select_related(
            'reporter', 'category', 'collection_point', 'verified_by', 'collected_by'
        )

        # Filter by user's own reports unless staff
        if not self.request.user.is_staff:
            queryset = queryset.filter(reporter=self.request.user)

        # Additional filters
        status_filter = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        county = self.request.query_params.get('county')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        if county:
            queryset = queryset.filter(county__icontains=county)

        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WasteReportCreateSerializer
        return WasteReportListSerializer


class WasteReportDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a specific waste report
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = WasteReport.objects.select_related(
            'reporter', 'category', 'collection_point', 'verified_by', 'collected_by'
        )

        # Users can only access their own reports unless staff
        if not self.request.user.is_staff:
            queryset = queryset.filter(reporter=self.request.user)

        return queryset

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return WasteReportUpdateSerializer
        return WasteReportDetailSerializer

    def perform_update(self, serializer):
        # Only staff can update reports
        if not self.request.user.is_staff:
            return Response(
                {'error': 'Only staff members can update waste reports'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = serializer.save()

        # Auto-set verification timestamp if status changed to verified
        if instance.status == 'verified' and not instance.verified_at:
            instance.verified_at = timezone.now()
            instance.verified_by = self.request.user
            instance.save()

        # Auto-set collection timestamp if status changed to collected
        if instance.status == 'collected' and not instance.collected_at:
            instance.collected_at = timezone.now()
            instance.collected_by = self.request.user
            instance.save()

            # Create credit transaction when waste is collected
            if instance.actual_weight_kg:
                CreditTransaction.objects.create(
                    user=instance.reporter,
                    transaction_type='earned',
                    amount=instance.actual_credits,
                    waste_report=instance,
                    description=f"Credits earned for collecting {instance.category.name}",
                    processed_by=self.request.user
                )


class CreditTransactionListView(generics.ListAPIView):
    """
    List user's credit transactions
    """
    serializer_class = CreditTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CreditTransaction.objects.select_related(
            'user', 'waste_report', 'processed_by'
        )

        # Users can only see their own transactions unless staff
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)

        # Additional filters
        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        return queryset.order_by('-created_at')


class CollectionEventListCreateView(generics.ListCreateAPIView):
    """
    List collection events or create a new one
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CollectionEvent.objects.select_related('organizer').prefetch_related(
            'target_categories', 'participants'
        ).annotate(
            participant_count=Count('participants')
        )

        # Filter by status and location
        status_filter = self.request.query_params.get('status')
        county = self.request.query_params.get('county')
        event_type = self.request.query_params.get('event_type')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if county:
            queryset = queryset.filter(county__icontains=county)
        if event_type:
            queryset = queryset.filter(event_type=event_type)

        return queryset.order_by('-start_date')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CollectionEventCreateSerializer
        return CollectionEventListSerializer


class CollectionEventDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a specific collection event
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CollectionEvent.objects.select_related('organizer').prefetch_related(
            'target_categories', 'participants', 'eventparticipation_set__user'
        ).annotate(
            participant_count=Count('participants')
        )

    def get_serializer_class(self):
        return CollectionEventDetailSerializer

    def perform_update(self, serializer):
        # Only organizers and staff can update events
        instance = self.get_object()
        if not (self.request.user.is_staff or instance.organizer == self.request.user):
            return Response(
                {'error': 'Only event organizers and staff can update events'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_collection_event(request, event_id):
    """
    Join a collection event
    """
    event = get_object_or_404(CollectionEvent, id=event_id)

    # Check if event is active and not full
    if event.status != 'active':
        return Response(
            {'error': 'Event is not active'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if event.max_participants and event.participant_count >= event.max_participants:
        return Response(
            {'error': 'Event is full'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user is already participating
    participation, created = EventParticipation.objects.get_or_create(
        user=request.user,
        event=event
    )

    if not created:
        return Response(
            {'error': 'You are already participating in this event'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = EventParticipationSerializer(participation)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_collection_event(request, event_id):
    """
    Leave a collection event
    """
    event = get_object_or_404(CollectionEvent, id=event_id)

    try:
        participation = EventParticipation.objects.get(
            user=request.user,
            event=event
        )
        participation.delete()
        return Response(
            {'message': 'Successfully left the event'},
            status=status.HTTP_200_OK
        )
    except EventParticipation.DoesNotExist:
        return Response(
            {'error': 'You are not participating in this event'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard_stats(request):
    """
    Get user dashboard statistics
    """
    user = request.user

    # User's waste reports stats
    reports_stats = WasteReport.objects.filter(reporter=user).aggregate(
        total_reports=Count('id'),
        total_estimated_weight=Sum('estimated_weight_kg'),
        total_actual_weight=Sum('actual_weight_kg'),
        verified_reports=Count('id', filter=Q(status='verified')),
        collected_reports=Count('id', filter=Q(status='collected')),
    )

    # User's credit stats
    credit_stats = CreditTransaction.objects.filter(user=user).aggregate(
        total_earned=Sum('amount', filter=Q(transaction_type='earned')),
        total_spent=Sum('amount', filter=Q(transaction_type='spent')),
        total_bonus=Sum('amount', filter=Q(transaction_type='bonus')),
    )

    # Calculate current balance
    total_earned = credit_stats['total_earned'] or Decimal('0.00')
    total_spent = abs(credit_stats['total_spent'] or Decimal('0.00'))
    total_bonus = credit_stats['total_bonus'] or Decimal('0.00')
    current_balance = total_earned + total_bonus - total_spent

    # User's event participation
    event_stats = EventParticipation.objects.filter(user=user).aggregate(
        events_joined=Count('id'),
        total_event_weight=Sum('weight_collected'),
        total_event_credits=Sum('credits_earned'),
    )

    # Environmental impact
    total_co2_reduction = Decimal('0.0000')
    for report in WasteReport.objects.filter(reporter=user, status='collected'):
        total_co2_reduction += report.actual_co2_reduction

    return Response({
        'reports': {
            'total_reports': reports_stats['total_reports'] or 0,
            'verified_reports': reports_stats['verified_reports'] or 0,
            'collected_reports': reports_stats['collected_reports'] or 0,
            'total_estimated_weight_kg': float(reports_stats['total_estimated_weight'] or 0),
            'total_actual_weight_kg': float(reports_stats['total_actual_weight'] or 0),
        },
        'credits': {
            'current_balance': float(current_balance),
            'total_earned': float(total_earned),
            'total_spent': float(total_spent),
            'total_bonus': float(total_bonus),
        },
        'events': {
            'events_joined': event_stats['events_joined'] or 0,
            'total_weight_collected_kg': float(event_stats['total_event_weight'] or 0),
            'total_credits_earned': float(event_stats['total_event_credits'] or 0),
        },
        'environmental_impact': {
            'total_co2_reduction_kg': float(total_co2_reduction),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nearby_collection_points(request):
    """
    Get nearby collection points based on user location
    """
    try:
        lat = float(request.query_params.get('latitude'))
        lng = float(request.query_params.get('longitude'))
        radius_km = float(request.query_params.get('radius', 10))  # Default 10km radius
    except (TypeError, ValueError):
        return Response(
            {'error': 'Invalid latitude, longitude, or radius parameters'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Simple distance calculation (for more accurate results, use PostGIS)
    # This is a basic implementation using Haversine formula approximation
    collection_points = CollectionPoint.objects.filter(
        is_active=True,
        latitude__isnull=False,
        longitude__isnull=False
    ).prefetch_related('accepted_categories')

    nearby_points = []
    for point in collection_points:
        # Basic distance calculation (approximate)
        lat_diff = abs(float(point.latitude) - lat)
        lng_diff = abs(float(point.longitude) - lng)

        # Rough approximation: 1 degree ≈ 111 km
        distance_km = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111

        if distance_km <= radius_km:
            point_data = CollectionPointSerializer(point).data
            point_data['distance_km'] = round(distance_km, 2)
            nearby_points.append(point_data)

    # Sort by distance
    nearby_points.sort(key=lambda x: x['distance_km'])

    return Response({
        'collection_points': nearby_points,
        'total_found': len(nearby_points),
        'search_radius_km': radius_km
    })


# Maps and Route Optimization Views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def geocode_address(request):
    """Geocode an address to get coordinates"""
    address = request.data.get('address')
    if not address:
        return Response(
            {'error': 'Address is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        from .services.maps_service import maps_service
        result = maps_service.geocode_address(address)

        if result:
            return Response({
                'success': True,
                'result': result
            })
        else:
            return Response({
                'success': False,
                'error': 'Address not found'
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reverse_geocode(request):
    """Reverse geocode coordinates to get address"""
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')

    if latitude is None or longitude is None:
        return Response(
            {'error': 'Latitude and longitude are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        from .services.maps_service import maps_service
        result = maps_service.reverse_geocode(float(latitude), float(longitude))

        if result:
            return Response({
                'success': True,
                'result': result
            })
        else:
            return Response({
                'success': False,
                'error': 'Location not found'
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_route(request):
    """Optimize collection route"""
    try:
        # Extract request data
        start_lat = request.data.get('start_latitude')
        start_lng = request.data.get('start_longitude')
        collection_point_ids = request.data.get('collection_point_ids', [])
        constraints = request.data.get('constraints', {})

        if start_lat is None or start_lng is None:
            return Response(
                {'error': 'Start coordinates are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not collection_point_ids:
            return Response(
                {'error': 'Collection point IDs are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get collection points
        collection_points = CollectionPoint.objects.filter(
            id__in=collection_point_ids
        )

        if not collection_points.exists():
            return Response(
                {'error': 'No valid collection points found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create start location point
        start_location = f"{start_lng},{start_lat}"

        # Optimize route
        from .services.route_optimizer import route_optimizer
        optimization_result = route_optimizer.optimize_collection_route(
            start_location=start_location,
            collection_points=list(collection_points),
            constraints=constraints
        )

        if optimization_result:
            return Response({
                'success': True,
                'optimization_result': {
                    'total_distance_km': float(optimization_result['total_distance_km']),
                    'total_duration_minutes': optimization_result['total_duration_minutes'],
                    'efficiency_score': float(optimization_result['efficiency_score']),
                    'waypoint_order': optimization_result['waypoint_order'],
                    'overview_polyline': optimization_result['overview_polyline'],
                    'bounds': optimization_result['bounds'],
                }
            })
        else:
            return Response({
                'success': False,
                'error': 'Route optimization failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def collection_point_coverage_analysis(request):
    """Analyze collection point coverage in an area"""
    try:
        # Get analysis parameters
        center_lat = request.GET.get('center_latitude')
        center_lng = request.GET.get('center_longitude')
        radius_km = float(request.GET.get('radius_km', 10))

        if center_lat is None or center_lng is None:
            return Response(
                {'error': 'Center coordinates are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        center_lat = float(center_lat)
        center_lng = float(center_lng)

        # Get collection points in the area
        collection_points = CollectionPoint.objects.filter(
            is_active=True
        )

        # Calculate coverage metrics
        points_in_area = []
        total_capacity = 0

        for point in collection_points:
            # Calculate distance from center
            distance = ((point.latitude - center_lat) ** 2 +
                       (point.longitude - center_lng) ** 2) ** 0.5 * 111  # Rough km conversion

            if distance <= radius_km:
                points_in_area.append({
                    'id': str(point.id),
                    'name': point.name,
                    'latitude': point.latitude,
                    'longitude': point.longitude,
                    'capacity_kg': float(point.capacity_kg),
                    'distance_from_center_km': round(distance, 2)
                })
                total_capacity += point.capacity_kg

        # Calculate coverage metrics
        area_km2 = 3.14159 * (radius_km ** 2)  # Circle area
        points_per_km2 = len(points_in_area) / area_km2 if area_km2 > 0 else 0
        capacity_per_km2 = float(total_capacity) / area_km2 if area_km2 > 0 else 0

        return Response({
            'analysis_area': {
                'center_latitude': center_lat,
                'center_longitude': center_lng,
                'radius_km': radius_km,
                'area_km2': round(area_km2, 2)
            },
            'coverage_metrics': {
                'total_collection_points': len(points_in_area),
                'total_capacity_kg': float(total_capacity),
                'points_per_km2': round(points_per_km2, 3),
                'capacity_per_km2': round(capacity_per_km2, 2),
                'coverage_rating': 'excellent' if points_per_km2 > 0.5 else
                                 'good' if points_per_km2 > 0.2 else
                                 'fair' if points_per_km2 > 0.1 else 'poor'
            },
            'collection_points': points_in_area
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def credit_balance(request):
    """
    Get the current credit balance for the authenticated user
    """
    user = request.user

    # Get user's credit transactions
    transactions = CreditTransaction.objects.filter(user=user)
    total_credits_earned = transactions.filter(
        transaction_type='earned'
    ).aggregate(
        total=Sum('amount')
    )['total'] or 0

    total_credits_spent = transactions.filter(
        transaction_type='spent'
    ).aggregate(
        total=Sum('amount')
    )['total'] or 0

    current_balance = total_credits_earned - total_credits_spent

    return Response({
        'balance': float(current_balance),
        'total_earned': float(total_credits_earned),
        'total_spent': float(total_credits_spent),
    })
