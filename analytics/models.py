import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

User = get_user_model()


class PlatformMetrics(models.Model):
    """
    Daily aggregated platform-wide metrics for dashboard analytics
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Date for metrics
    date = models.DateField(
        unique=True,
        help_text=_("Date for which metrics are calculated")
    )

    # User Metrics
    total_users = models.PositiveIntegerField(
        default=0,
        help_text=_("Total registered users")
    )

    new_users_today = models.PositiveIntegerField(
        default=0,
        help_text=_("New users registered today")
    )

    active_users_today = models.PositiveIntegerField(
        default=0,
        help_text=_("Users who logged in today")
    )

    youth_users = models.PositiveIntegerField(
        default=0,
        help_text=_("Total youth users (age 18-35)")
    )

    sme_vendors = models.PositiveIntegerField(
        default=0,
        help_text=_("Total SME vendors registered")
    )

    verified_vendors = models.PositiveIntegerField(
        default=0,
        help_text=_("Total verified SME vendors")
    )

    # Waste Collection Metrics
    total_waste_reports = models.PositiveIntegerField(
        default=0,
        help_text=_("Total waste reports submitted")
    )

    waste_reports_today = models.PositiveIntegerField(
        default=0,
        help_text=_("Waste reports submitted today")
    )

    total_waste_collected_kg = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total waste collected in kilograms")
    )

    waste_collected_today_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Waste collected today in kilograms")
    )

    total_credits_earned = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total credits earned by users")
    )

    credits_earned_today = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Credits earned today")
    )

    total_co2_reduction_kg = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total CO2 reduction in kilograms")
    )

    co2_reduction_today_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("CO2 reduction today in kilograms")
    )

    # Product Marketplace Metrics
    total_products = models.PositiveIntegerField(
        default=0,
        help_text=_("Total products listed")
    )

    products_added_today = models.PositiveIntegerField(
        default=0,
        help_text=_("Products added today")
    )

    total_orders = models.PositiveIntegerField(
        default=0,
        help_text=_("Total orders placed")
    )

    orders_today = models.PositiveIntegerField(
        default=0,
        help_text=_("Orders placed today")
    )

    total_sales_ksh = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total sales in Kenyan Shillings")
    )

    sales_today_ksh = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Sales today in Kenyan Shillings")
    )

    total_credits_spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total credits spent on products")
    )

    credits_spent_today = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Credits spent today")
    )

    # Event Metrics
    total_collection_events = models.PositiveIntegerField(
        default=0,
        help_text=_("Total collection events organized")
    )

    events_today = models.PositiveIntegerField(
        default=0,
        help_text=_("Collection events today")
    )

    total_event_participants = models.PositiveIntegerField(
        default=0,
        help_text=_("Total event participants")
    )

    event_participants_today = models.PositiveIntegerField(
        default=0,
        help_text=_("Event participants today")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Platform Metrics")
        verbose_name_plural = _("Platform Metrics")
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['-date']),
        ]

    def __str__(self):
        return f"Platform Metrics - {self.date}"


class UserEngagementMetrics(models.Model):
    """
    Individual user engagement tracking for personalized analytics
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='engagement_metrics',
        help_text=_("User for engagement tracking")
    )

    date = models.DateField(
        help_text=_("Date for engagement metrics")
    )

    # Login and Activity Metrics
    login_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of logins today")
    )

    session_duration_minutes = models.PositiveIntegerField(
        default=0,
        help_text=_("Total session duration in minutes")
    )

    pages_visited = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of pages visited")
    )

    # Waste Collection Engagement
    waste_reports_submitted = models.PositiveIntegerField(
        default=0,
        help_text=_("Waste reports submitted today")
    )

    waste_collected_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Waste collected today in kg")
    )

    credits_earned = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Credits earned today")
    )

    events_joined = models.PositiveIntegerField(
        default=0,
        help_text=_("Collection events joined today")
    )

    # Marketplace Engagement
    products_viewed = models.PositiveIntegerField(
        default=0,
        help_text=_("Products viewed today")
    )

    products_added_to_cart = models.PositiveIntegerField(
        default=0,
        help_text=_("Products added to cart today")
    )

    orders_placed = models.PositiveIntegerField(
        default=0,
        help_text=_("Orders placed today")
    )

    credits_spent = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Credits spent today")
    )

    money_spent_ksh = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Money spent today in KSh")
    )

    # Social Engagement
    reviews_written = models.PositiveIntegerField(
        default=0,
        help_text=_("Product reviews written today")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("User Engagement Metrics")
        verbose_name_plural = _("User Engagement Metrics")
        ordering = ['-date', 'user']
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['date']),
            models.Index(fields=['-date']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.date}"


class EnvironmentalImpactMetrics(models.Model):
    """
    Environmental impact tracking and calculations
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    date = models.DateField(
        unique=True,
        help_text=_("Date for environmental impact calculation")
    )

    # Waste Collection Impact
    total_waste_diverted_kg = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Total waste diverted from landfills (kg)")
    )

    plastic_recycled_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Plastic waste recycled (kg)")
    )

    paper_recycled_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Paper waste recycled (kg)")
    )

    metal_recycled_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Metal waste recycled (kg)")
    )

    glass_recycled_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Glass waste recycled (kg)")
    )

    organic_composted_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Organic waste composted (kg)")
    )

    # Carbon Impact
    co2_reduction_kg = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("CO2 emissions reduced (kg)")
    )

    co2_equivalent_trees_planted = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Equivalent trees planted for CO2 reduction")
    )

    # Energy and Resource Savings
    energy_saved_kwh = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Energy saved through recycling (kWh)")
    )

    water_saved_liters = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Water saved through recycling (liters)")
    )

    landfill_space_saved_m3 = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Landfill space saved (cubic meters)")
    )

    # Economic Impact
    economic_value_ksh = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Economic value generated (KSh)")
    )

    jobs_supported = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Green jobs supported (full-time equivalent)")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Environmental Impact Metrics")
        verbose_name_plural = _("Environmental Impact Metrics")
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['-date']),
        ]

    def __str__(self):
        return f"Environmental Impact - {self.date}"


class CountyMetrics(models.Model):
    """
    County-specific metrics for regional analytics and insights
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    county = models.CharField(
        max_length=100,
        help_text=_("County name")
    )

    date = models.DateField(
        help_text=_("Date for county metrics")
    )

    # User Metrics by County
    total_users = models.PositiveIntegerField(
        default=0,
        help_text=_("Total users in this county")
    )

    active_users = models.PositiveIntegerField(
        default=0,
        help_text=_("Active users today in this county")
    )

    sme_vendors = models.PositiveIntegerField(
        default=0,
        help_text=_("SME vendors in this county")
    )

    # Waste Collection by County
    waste_reports = models.PositiveIntegerField(
        default=0,
        help_text=_("Waste reports from this county")
    )

    waste_collected_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Waste collected in this county (kg)")
    )

    credits_earned = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Credits earned in this county")
    )

    co2_reduction_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("CO2 reduction in this county (kg)")
    )

    # Marketplace Activity by County
    products_listed = models.PositiveIntegerField(
        default=0,
        help_text=_("Products listed by vendors in this county")
    )

    orders_placed = models.PositiveIntegerField(
        default=0,
        help_text=_("Orders placed in this county")
    )

    sales_ksh = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Sales in this county (KSh)")
    )

    credits_spent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_("Credits spent in this county")
    )

    # Collection Events by County
    collection_events = models.PositiveIntegerField(
        default=0,
        help_text=_("Collection events in this county")
    )

    event_participants = models.PositiveIntegerField(
        default=0,
        help_text=_("Event participants in this county")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("County Metrics")
        verbose_name_plural = _("County Metrics")
        ordering = ['-date', 'county']
        unique_together = ['county', 'date']
        indexes = [
            models.Index(fields=['county', 'date']),
            models.Index(fields=['date']),
            models.Index(fields=['-date']),
        ]

    def __str__(self):
        return f"{self.county} - {self.date}"


class SystemPerformanceMetrics(models.Model):
    """
    System performance and technical metrics for monitoring
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    timestamp = models.DateTimeField(
        help_text=_("Timestamp for performance measurement")
    )

    # API Performance
    api_response_time_ms = models.PositiveIntegerField(
        default=0,
        help_text=_("Average API response time in milliseconds")
    )

    api_requests_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Total API requests in the last hour")
    )

    api_error_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("API error rate percentage")
    )

    # Database Performance
    db_query_time_ms = models.PositiveIntegerField(
        default=0,
        help_text=_("Average database query time in milliseconds")
    )

    db_connections_active = models.PositiveIntegerField(
        default=0,
        help_text=_("Active database connections")
    )

    # System Resources
    cpu_usage_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("CPU usage percentage")
    )

    memory_usage_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("Memory usage percentage")
    )

    disk_usage_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("Disk usage percentage")
    )

    # User Activity
    concurrent_users = models.PositiveIntegerField(
        default=0,
        help_text=_("Concurrent active users")
    )

    page_load_time_ms = models.PositiveIntegerField(
        default=0,
        help_text=_("Average page load time in milliseconds")
    )

    # Error Tracking
    error_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of errors in the last hour")
    )

    warning_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of warnings in the last hour")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("System Performance Metrics")
        verbose_name_plural = _("System Performance Metrics")
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"System Performance - {self.timestamp}"


class DashboardAlert(models.Model):
    """
    System alerts and notifications for admin dashboard
    """
    ALERT_TYPES = [
        ('info', _('Information')),
        ('warning', _('Warning')),
        ('error', _('Error')),
        ('success', _('Success')),
    ]

    ALERT_CATEGORIES = [
        ('system', _('System')),
        ('performance', _('Performance')),
        ('user_activity', _('User Activity')),
        ('waste_collection', _('Waste Collection')),
        ('marketplace', _('Marketplace')),
        ('environmental', _('Environmental')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(
        max_length=200,
        help_text=_("Alert title")
    )

    message = models.TextField(
        help_text=_("Alert message")
    )

    alert_type = models.CharField(
        max_length=20,
        choices=ALERT_TYPES,
        default='info',
        help_text=_("Type of alert")
    )

    category = models.CharField(
        max_length=30,
        choices=ALERT_CATEGORIES,
        help_text=_("Alert category")
    )

    is_active = models.BooleanField(
        default=True,
        help_text=_("Whether alert is currently active")
    )

    is_acknowledged = models.BooleanField(
        default=False,
        help_text=_("Whether alert has been acknowledged")
    )

    acknowledged_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts',
        help_text=_("User who acknowledged the alert")
    )

    acknowledged_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When alert was acknowledged")
    )

    # Alert Data (JSON field for additional context)
    alert_data = models.JSONField(
        default=dict,
        blank=True,
        help_text=_("Additional alert data and context")
    )

    # Auto-resolution
    auto_resolve_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("When alert should auto-resolve")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Dashboard Alert")
        verbose_name_plural = _("Dashboard Alerts")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'alert_type']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.get_alert_type_display()}: {self.title}"
