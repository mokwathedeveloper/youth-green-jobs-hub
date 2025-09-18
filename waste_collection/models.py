from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

User = get_user_model()


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
    county = models.CharField(max_length=100, default='Kisumu')
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
    county = models.CharField(max_length=100, default='Kisumu')
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
        upload_to='waste_reports/',
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
    county = models.CharField(max_length=100, default='Kisumu')
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
