from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point, LineString
from youth_green_jobs_backend.config import get_default_county, get_upload_path

User = get_user_model()


def waste_report_photo_path(instance, filename):
    """Generate upload path for waste report photos"""
    return get_upload_path('waste_reports') + filename


class WasteCategory(models.Model):
    """
    Categories of waste that can be collected and recycled
    """
    CATEGORY_TYPES = [
        ('plastic', 'Plastic'),
        ('paper', 'Paper'),
        ('metal', 'Metal'),
        ('glass', 'Glass'),
        ('organic', 'Organic'),
        ('electronic', 'Electronic'),
        ('textile', 'Textile'),
        ('hazardous', 'Hazardous'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True)
    credit_rate_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Credits earned per kilogram of this waste type"
    )
    co2_reduction_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))],
        help_text="CO2 reduction in kg per kilogram of waste collected"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Waste Category'
        verbose_name_plural = 'Waste Categories'

    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"


class CollectionPoint(models.Model):
    """
    Physical locations where waste can be dropped off or collected from
    """
    POINT_TYPES = [
        ('drop_off', 'Drop-off Point'),
        ('collection', 'Collection Point'),
        ('recycling_center', 'Recycling Center'),
        ('community_center', 'Community Center'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    point_type = models.CharField(max_length=20, choices=POINT_TYPES)
    address = models.TextField()
    county = models.CharField(max_length=100, default=get_default_county)
    sub_county = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('-90')), MaxValueValidator(Decimal('90'))]
    )
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('-180')), MaxValueValidator(Decimal('180'))]
    )
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    operating_hours = models.TextField(blank=True, help_text="Operating hours description")
    accepted_categories = models.ManyToManyField(
        WasteCategory,
        related_name='collection_points',
        help_text="Types of waste accepted at this point"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Collection Point'
        verbose_name_plural = 'Collection Points'

    def __str__(self):
        return f"{self.name} - {self.get_point_type_display()}"


class WasteReport(models.Model):
    """
    Reports of waste found or collected by users
    """
    STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('verified', 'Verified'),
        ('collected', 'Collected'),
        ('processed', 'Processed'),
        ('cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='waste_reports'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(
        WasteCategory,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    estimated_weight_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Estimated weight in kilograms"
    )
    location_description = models.TextField()
    county = models.CharField(max_length=100, default=get_default_county)
    sub_county = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True
    )
    photo = models.ImageField(
        upload_to=waste_report_photo_path,
        null=True,
        blank=True,
        help_text="Photo of the waste"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    collection_point = models.ForeignKey(
        CollectionPoint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_reports',
        help_text="Staff member who verified this report"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    collected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_reports',
        help_text="Person who collected this waste"
    )
    collected_at = models.DateTimeField(null=True, blank=True)
    actual_weight_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Actual weight collected in kilograms"
    )
    notes = models.TextField(blank=True, help_text="Additional notes or comments")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Waste Report'
        verbose_name_plural = 'Waste Reports'

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    @property
    def estimated_credits(self):
        """Calculate estimated credits based on estimated weight"""
        return self.estimated_weight_kg * self.category.credit_rate_per_kg

    @property
    def actual_credits(self):
        """Calculate actual credits based on actual weight collected"""
        if self.actual_weight_kg:
            return self.actual_weight_kg * self.category.credit_rate_per_kg
        return Decimal('0.00')

    @property
    def estimated_co2_reduction(self):
        """Calculate estimated CO2 reduction based on estimated weight"""
        return self.estimated_weight_kg * self.category.co2_reduction_per_kg

    @property
    def actual_co2_reduction(self):
        """Calculate actual CO2 reduction based on actual weight collected"""
        if self.actual_weight_kg:
            return self.actual_weight_kg * self.category.co2_reduction_per_kg
        return Decimal('0.0000')


class CreditTransaction(models.Model):
    """
    Track credit transactions for users
    """
    TRANSACTION_TYPES = [
        ('earned', 'Credits Earned'),
        ('spent', 'Credits Spent'),
        ('bonus', 'Bonus Credits'),
        ('penalty', 'Penalty'),
        ('adjustment', 'Manual Adjustment'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='credit_transactions'
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Credit amount (positive for earned/bonus, negative for spent/penalty)"
    )
    waste_report = models.ForeignKey(
        WasteReport,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='credit_transactions',
        help_text="Related waste report if applicable"
    )
    description = models.CharField(max_length=200)
    reference_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="External reference ID (e.g., purchase order)"
    )
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_transactions',
        help_text="Staff member who processed this transaction"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Credit Transaction'
        verbose_name_plural = 'Credit Transactions'

    def __str__(self):
        return f"{self.user.username} - {self.get_transaction_type_display()}: {self.amount}"


class CollectionEvent(models.Model):
    """
    Organized waste collection events
    """
    EVENT_TYPES = [
        ('community_cleanup', 'Community Cleanup'),
        ('school_program', 'School Program'),
        ('beach_cleanup', 'Beach Cleanup'),
        ('market_cleanup', 'Market Cleanup'),
        ('special_drive', 'Special Drive'),
    ]

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    organizer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='organized_events'
    )
    location = models.TextField()
    county = models.CharField(max_length=100, default=get_default_county)
    sub_county = models.CharField(max_length=100, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    max_participants = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of participants (leave blank for unlimited)"
    )
    participants = models.ManyToManyField(
        User,
        through='EventParticipation',
        related_name='participated_events'
    )
    target_categories = models.ManyToManyField(
        WasteCategory,
        related_name='target_events',
        help_text="Types of waste targeted for this event"
    )
    bonus_multiplier = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[MinValueValidator(Decimal('1.00'))],
        help_text="Credit multiplier for this event (e.g., 1.5 for 50% bonus)"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    total_weight_collected = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total weight collected during this event"
    )
    total_credits_awarded = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total credits awarded for this event"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Collection Event'
        verbose_name_plural = 'Collection Events'

    def __str__(self):
        return f"{self.title} - {self.start_date.strftime('%Y-%m-%d')}"

    @property
    def is_active(self):
        """Check if the event is currently active"""
        from django.utils import timezone
        now = timezone.now()
        return self.start_date <= now <= self.end_date and self.status == 'active'

    @property
    def participant_count(self):
        """Get the number of participants"""
        return self.participants.count()


class EventParticipation(models.Model):
    """
    Through model for event participation with additional data
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(CollectionEvent, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    weight_collected = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Weight collected by this participant"
    )
    credits_earned = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Credits earned by this participant in this event"
    )

    class Meta:
        unique_together = ['user', 'event']
        verbose_name = 'Event Participation'
        verbose_name_plural = 'Event Participations'

    def __str__(self):
        return f"{self.user.username} - {self.event.title}"


# Maps and Location Models
class CollectionRoute(models.Model):
    """Optimized routes for waste collection"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Route geometry
    route_geometry = gis_models.LineStringField(
        help_text="Route path as LineString geometry",
        null=True, blank=True
    )

    # Route details
    estimated_duration_minutes = models.PositiveIntegerField(
        help_text="Estimated time to complete route in minutes"
    )
    estimated_distance_km = models.DecimalField(
        max_digits=8, decimal_places=2,
        help_text="Estimated distance in kilometers"
    )

    # Route optimization
    optimization_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        default=Decimal('0.00'),
        help_text="Route efficiency score (0-100)"
    )

    # Status and metadata
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-optimization_score', 'name']
        verbose_name = 'Collection Route'
        verbose_name_plural = 'Collection Routes'

    def __str__(self):
        return f"{self.name} ({self.optimization_score}% efficient)"


class CollectionPointLocation(models.Model):
    """Enhanced location data for collection points with GIS support"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collection_point = models.OneToOneField(
        CollectionPoint,
        on_delete=models.CASCADE,
        related_name='location_data'
    )

    # Geographic data
    coordinates = gis_models.PointField(
        help_text="Precise GPS coordinates of the collection point"
    )

    # Address components
    street_address = models.CharField(max_length=255, blank=True)
    neighborhood = models.CharField(max_length=100, blank=True)
    ward = models.CharField(max_length=100, blank=True)
    constituency = models.CharField(max_length=100, blank=True)
    county = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    # Location metadata
    place_id = models.CharField(
        max_length=255, blank=True,
        help_text="Google Places API place ID"
    )
    plus_code = models.CharField(
        max_length=20, blank=True,
        help_text="Google Plus Code for the location"
    )

    # Accessibility and features
    accessibility_features = models.JSONField(
        default=dict,
        help_text="Accessibility features (wheelchair_accessible, parking, etc.)"
    )

    # Verification status
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether location has been verified by field team"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='verified_locations'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Collection Point Location'
        verbose_name_plural = 'Collection Point Locations'

    def __str__(self):
        return f"Location for {self.collection_point.name}"

    @property
    def latitude(self):
        """Get latitude from coordinates"""
        return self.coordinates.y if self.coordinates else None

    @property
    def longitude(self):
        """Get longitude from coordinates"""
        return self.coordinates.x if self.coordinates else None

    def set_coordinates(self, latitude, longitude):
        """Set coordinates from latitude and longitude"""
        self.coordinates = Point(longitude, latitude)


class RouteOptimization(models.Model):
    """Route optimization requests and results"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Optimization parameters
    start_location = gis_models.PointField(help_text="Starting point for optimization")
    collection_points = models.ManyToManyField(
        CollectionPoint,
        help_text="Collection points to include in optimization"
    )

    # Optimization constraints
    max_duration_minutes = models.PositiveIntegerField(
        default=480,  # 8 hours
        help_text="Maximum route duration in minutes"
    )
    max_distance_km = models.DecimalField(
        max_digits=8, decimal_places=2,
        default=Decimal('100.00'),
        help_text="Maximum route distance in kilometers"
    )
    vehicle_capacity_kg = models.DecimalField(
        max_digits=8, decimal_places=2,
        default=Decimal('1000.00'),
        help_text="Vehicle capacity in kilograms"
    )

    # Optimization results
    optimized_route = models.ForeignKey(
        CollectionRoute,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text="Generated optimized route"
    )

    # Status tracking
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Metadata
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Results
    optimization_results = models.JSONField(
        default=dict,
        help_text="Detailed optimization results and metrics"
    )

    class Meta:
        ordering = ['-requested_at']
        verbose_name = 'Route Optimization'
        verbose_name_plural = 'Route Optimizations'

    def __str__(self):
        return f"Route optimization {self.id} - {self.get_status_display()}"


class GeospatialAnalytics(models.Model):
    """Geospatial analytics and insights"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Analysis parameters
    analysis_type = models.CharField(
        max_length=50,
        choices=[
            ('coverage', 'Coverage Analysis'),
            ('density', 'Collection Point Density'),
            ('efficiency', 'Route Efficiency'),
            ('accessibility', 'Accessibility Analysis'),
            ('demand', 'Demand Prediction'),
        ]
    )

    # Geographic scope
    analysis_area = gis_models.PolygonField(
        help_text="Geographic area for analysis",
        null=True, blank=True
    )

    # Time period
    start_date = models.DateField()
    end_date = models.DateField()

    # Analysis results
    results = models.JSONField(
        default=dict,
        help_text="Analysis results and metrics"
    )

    # Visualizations
    map_data = models.JSONField(
        default=dict,
        help_text="GeoJSON data for map visualizations"
    )

    # Metadata
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']
        verbose_name = 'Geospatial Analytics'
        verbose_name_plural = 'Geospatial Analytics'

    def __str__(self):
        return f"{self.get_analysis_type_display()} - {self.generated_at.date()}"
