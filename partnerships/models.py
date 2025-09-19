"""
Partnership models for NGO and company collaborations
"""
from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
from django.core.validators import MinValueValidator, MaxValueValidator, URLValidator
from decimal import Decimal
import uuid
from django.utils import timezone


class Partner(models.Model):
    """Partner organizations (NGOs, companies, government agencies)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic information
    name = models.CharField(max_length=200)
    description = models.TextField()
    logo = models.ImageField(upload_to='partners/logos/', blank=True, null=True)
    
    # Partner type
    PARTNER_TYPES = [
        ('ngo', 'Non-Governmental Organization'),
        ('company', 'Private Company'),
        ('government', 'Government Agency'),
        ('cooperative', 'Cooperative'),
        ('educational', 'Educational Institution'),
        ('international', 'International Organization'),
    ]
    partner_type = models.CharField(max_length=20, choices=PARTNER_TYPES)
    
    # Contact information
    contact_person = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    website = models.URLField(blank=True, validators=[URLValidator()])
    
    # Address
    address = models.TextField()
    city = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Kenya')
    
    # Partnership details
    partnership_start_date = models.DateField()
    partnership_end_date = models.DateField(null=True, blank=True)
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Partnership focus areas
    focus_areas = models.JSONField(
        default=list,
        help_text="Areas of focus (waste_management, education, funding, etc.)"
    )
    
    # API integration
    api_key = models.CharField(
        max_length=100, blank=True,
        help_text="API key for partner integration"
    )
    webhook_url = models.URLField(
        blank=True,
        help_text="Webhook URL for partner notifications"
    )
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_partnerships')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Partner'
        verbose_name_plural = 'Partners'
    
    def __str__(self):
        return f"{self.name} ({self.get_partner_type_display()})"
    
    @property
    def is_active(self):
        """Check if partnership is currently active"""
        if self.status != 'active':
            return False
        
        today = timezone.now().date()
        if self.partnership_end_date and today > self.partnership_end_date:
            return False
        
        return today >= self.partnership_start_date


class Collaboration(models.Model):
    """Specific collaboration projects between partners and the platform"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic information
    title = models.CharField(max_length=200)
    description = models.TextField()
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name='collaborations')
    
    # Collaboration type
    COLLABORATION_TYPES = [
        ('funding', 'Funding/Grants'),
        ('equipment', 'Equipment Donation'),
        ('training', 'Training Programs'),
        ('awareness', 'Awareness Campaigns'),
        ('research', 'Research Projects'),
        ('technology', 'Technology Support'),
        ('market_access', 'Market Access'),
        ('capacity_building', 'Capacity Building'),
    ]
    collaboration_type = models.CharField(max_length=20, choices=COLLABORATION_TYPES)
    
    # Timeline
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Budget and resources
    budget_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=3, default='KES')
    
    # Target metrics
    target_beneficiaries = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Expected number of beneficiaries"
    )
    target_waste_kg = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        help_text="Target waste collection in kg"
    )
    
    # Status tracking
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    
    # Progress tracking
    progress_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(100)]
    )
    
    # Results
    actual_beneficiaries = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Actual number of beneficiaries reached"
    )
    actual_waste_kg = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        help_text="Actual waste collected in kg"
    )
    
    # Documentation
    documents = models.JSONField(
        default=list,
        help_text="List of collaboration documents and reports"
    )
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Collaboration'
        verbose_name_plural = 'Collaborations'
    
    def __str__(self):
        return f"{self.title} - {self.partner.name}"
    
    @property
    def is_active(self):
        """Check if collaboration is currently active"""
        if self.status not in ['planning', 'active']:
            return False
        
        today = timezone.now().date()
        if self.end_date and today > self.end_date:
            return False
        
        return today >= self.start_date


class PartnershipAgreement(models.Model):
    """Legal agreements and contracts with partners"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name='agreements')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Agreement type
    AGREEMENT_TYPES = [
        ('mou', 'Memorandum of Understanding'),
        ('contract', 'Service Contract'),
        ('grant', 'Grant Agreement'),
        ('partnership', 'Partnership Agreement'),
        ('nda', 'Non-Disclosure Agreement'),
    ]
    agreement_type = models.CharField(max_length=20, choices=AGREEMENT_TYPES)
    
    # Agreement details
    signed_date = models.DateField()
    effective_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    
    # Terms and conditions
    terms_and_conditions = models.TextField()
    deliverables = models.JSONField(
        default=list,
        help_text="List of deliverables and milestones"
    )
    
    # Financial terms
    total_value = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    payment_terms = models.TextField(blank=True)
    
    # Document management
    document_url = models.URLField(
        blank=True,
        help_text="URL to the signed agreement document"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-signed_date']
        verbose_name = 'Partnership Agreement'
        verbose_name_plural = 'Partnership Agreements'
    
    def __str__(self):
        return f"{self.title} - {self.partner.name}"


class PartnerIntegration(models.Model):
    """API integrations and data exchange with partners"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    partner = models.OneToOneField(Partner, on_delete=models.CASCADE, related_name='integration')
    
    # Integration configuration
    integration_type = models.CharField(
        max_length=50,
        choices=[
            ('webhook', 'Webhook Integration'),
            ('api', 'REST API Integration'),
            ('file_transfer', 'File Transfer'),
            ('database', 'Database Integration'),
        ],
        default='webhook'
    )
    
    # API configuration
    base_url = models.URLField(blank=True)
    authentication_method = models.CharField(
        max_length=20,
        choices=[
            ('api_key', 'API Key'),
            ('oauth', 'OAuth'),
            ('basic', 'Basic Auth'),
            ('token', 'Bearer Token'),
        ],
        default='api_key'
    )
    
    # Credentials (encrypted in production)
    api_credentials = models.JSONField(
        default=dict,
        help_text="API credentials and configuration"
    )
    
    # Data mapping
    data_mapping = models.JSONField(
        default=dict,
        help_text="Field mapping between systems"
    )
    
    # Sync configuration
    sync_frequency = models.CharField(
        max_length=20,
        choices=[
            ('real_time', 'Real-time'),
            ('hourly', 'Hourly'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('manual', 'Manual'),
        ],
        default='daily'
    )
    
    last_sync_at = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(
        max_length=20,
        choices=[
            ('success', 'Success'),
            ('failed', 'Failed'),
            ('pending', 'Pending'),
        ],
        default='pending'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Partner Integration'
        verbose_name_plural = 'Partner Integrations'
    
    def __str__(self):
        return f"{self.partner.name} - {self.get_integration_type_display()}"


class PartnershipReport(models.Model):
    """Reports and analytics for partnerships"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name='reports')
    collaboration = models.ForeignKey(
        Collaboration, on_delete=models.CASCADE, 
        related_name='reports', null=True, blank=True
    )
    
    # Report details
    title = models.CharField(max_length=200)
    report_type = models.CharField(
        max_length=20,
        choices=[
            ('progress', 'Progress Report'),
            ('financial', 'Financial Report'),
            ('impact', 'Impact Assessment'),
            ('quarterly', 'Quarterly Report'),
            ('annual', 'Annual Report'),
        ]
    )
    
    # Reporting period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Report data
    report_data = models.JSONField(
        default=dict,
        help_text="Report metrics and data"
    )
    
    # Summary
    executive_summary = models.TextField()
    key_achievements = models.JSONField(default=list)
    challenges = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    
    # Document
    report_document_url = models.URLField(
        blank=True,
        help_text="URL to the full report document"
    )
    
    # Status
    is_published = models.BooleanField(default=False)
    
    # Metadata
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-period_end']
        verbose_name = 'Partnership Report'
        verbose_name_plural = 'Partnership Reports'
    
    def __str__(self):
        return f"{self.title} - {self.partner.name}"
