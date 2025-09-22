from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

User = get_user_model()


class WasteCategory(models.Model):
    """Categories of waste that can be collected and recycled"""
    CATEGORY_TYPES = [
        ('plastic', 'Plastic'),
        ('paper', 'Paper'),
        ('metal', 'Metal'),
        ('glass', 'Glass'),
        ('organic', 'Organic'),
        ('electronic', 'Electronic'),
        ('textile', 'Textile'),
        ('hazardous', 'Hazardous'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True)
    credit_rate = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('1.00'),
        help_text="Credits per kg of this waste type"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Waste Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class CollectionPoint(models.Model):
    """Physical locations where waste can be dropped off"""
    POINT_TYPES = [
        ('drop_off', 'Drop-off Point'),
        ('collection_center', 'Collection Center'),
        ('recycling_facility', 'Recycling Facility'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    point_type = models.CharField(max_length=20, choices=POINT_TYPES, default='drop_off')
    description = models.TextField(blank=True)
    
    # Simple location fields (no GIS)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Accepted waste categories
    accepted_categories = models.ManyToManyField(WasteCategory, blank=True)
    
    # Operational details
    is_active = models.BooleanField(default=True)
    operating_hours = models.CharField(max_length=200, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class WasteReport(models.Model):
    """Reports of waste found or collected by users"""
    STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('verified', 'Verified'),
        ('collected', 'Collected'),
        ('processed', 'Processed'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waste_reports')
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE)
    collection_point = models.ForeignKey(CollectionPoint, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Waste details
    estimated_weight = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    actual_weight = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # Location (simple)
    location_description = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Status and processing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to='waste_reports/', blank=True, null=True)
    
    # Credits
    credits_awarded = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    
    # Timestamps
    reported_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    collected_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-reported_at']

    def __str__(self):
        return f"{self.category.name} - {self.estimated_weight}kg by {self.reporter.username}"


class CreditTransaction(models.Model):
    """Track credit transactions for users"""
    TRANSACTION_TYPES = [
        ('earned', 'Credits Earned'),
        ('redeemed', 'Credits Redeemed'),
        ('bonus', 'Bonus Credits'),
        ('penalty', 'Penalty Deduction'),
        ('adjustment', 'Manual Adjustment'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    
    # Related objects
    waste_report = models.ForeignKey(WasteReport, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Balance tracking
    balance_before = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    balance_after = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"


class CollectionEvent(models.Model):
    """Organized waste collection events"""
    EVENT_TYPES = [
        ('community_cleanup', 'Community Cleanup'),
        ('beach_cleanup', 'Beach Cleanup'),
        ('park_cleanup', 'Park Cleanup'),
        ('school_program', 'School Program'),
        ('corporate_event', 'Corporate Event'),
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    
    # Location
    location_name = models.CharField(max_length=200)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Timing
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    registration_deadline = models.DateTimeField(null=True, blank=True)
    
    # Participation
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    participants = models.ManyToManyField(User, through='EventParticipation', blank=True)
    
    # Organizer
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    
    # Results
    total_waste_collected = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_datetime']

    def __str__(self):
        return self.title


class EventParticipation(models.Model):
    """Through model for event participation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(CollectionEvent, on_delete=models.CASCADE)
    
    # Participation details
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)
    waste_collected = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    credits_earned = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    
    class Meta:
        unique_together = ['user', 'event']

    def __str__(self):
        return f"{self.user.username} - {self.event.title}"
