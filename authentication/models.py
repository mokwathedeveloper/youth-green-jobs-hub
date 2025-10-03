from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from datetime import date
from youth_green_jobs_backend.config import get_default_county, get_upload_path, profile_picture_upload_path, verification_document_upload_path


class User(AbstractUser):
    """
    Custom User model for Youth Green Jobs & Waste Recycling Hub
    Extends Django's AbstractUser with youth-specific profile fields
    """

    # Contact Information
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text=_("Phone number for contact and SMS notifications")
    )

    # Personal Information
    date_of_birth = models.DateField(
        blank=True,
        null=True,
        help_text=_("Date of birth for age verification and youth eligibility")
    )

    gender = models.CharField(
        max_length=20,
        choices=[
            ('male', _('Male')),
            ('female', _('Female')),
            ('other', _('Other')),
            ('prefer_not_to_say', _('Prefer not to say')),
        ],
        blank=True,
        null=True,
        help_text=_("Gender identity")
    )

    # Location Information
    county = models.CharField(
        max_length=50,
        default=get_default_county,
        help_text=_("County in Kenya")
    )

    sub_county = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Sub-county or ward within the county")
    )

    address = models.TextField(
        blank=True,
        null=True,
        help_text=_("Physical address or location description")
    )

    # Education and Skills
    education_level = models.CharField(
        max_length=20,
        choices=[
            ('primary', _('Primary Education')),
            ('secondary', _('Secondary Education')),
            ('tertiary', _('Tertiary/College')),
            ('university', _('University')),
            ('vocational', _('Vocational Training')),
            ('other', _('Other')),
        ],
        blank=True,
        null=True,
        help_text=_("Highest level of education completed")
    )

    skills = models.TextField(
        blank=True,
        null=True,
        help_text=_("Skills and competencies (comma-separated)")
    )

    interests = models.TextField(
        blank=True,
        null=True,
        help_text=_("Areas of interest in green jobs and environmental work")
    )

    # Employment Status
    employment_status = models.CharField(
        max_length=20,
        choices=[
            ('unemployed', _('Unemployed')),
            ('student', _('Student')),
            ('employed', _('Employed')),
            ('self_employed', _('Self-employed')),
            ('seeking_work', _('Seeking Work')),
        ],
        default='seeking_work',
        help_text=_("Current employment status")
    )

    # Profile and Verification
    profile_picture = models.ImageField(
        upload_to=profile_picture_upload_path,
        blank=True,
        null=True,
        help_text=_("Profile picture for user identification")
    )

    bio = models.TextField(
        max_length=500,
        blank=True,
        null=True,
        help_text=_("Short biography or personal description")
    )

    is_verified = models.BooleanField(
        default=False,
        help_text=_("Whether the user's identity has been verified")
    )

    verification_document = models.FileField(
        upload_to=verification_document_upload_path,
        blank=True,
        null=True,
        help_text=_("Identity document for verification (ID, passport, etc.)")
    )

    # Preferences and Settings
    preferred_language = models.CharField(
        max_length=10,
        choices=[
            ('en', _('English')),
            ('sw', _('Swahili')),
            ('luo', _('Luo')),
        ],
        default='en',
        help_text=_("Preferred language for communication")
    )

    receive_sms_notifications = models.BooleanField(
        default=True,
        help_text=_("Whether to receive SMS notifications about opportunities")
    )

    receive_email_notifications = models.BooleanField(
        default=True,
        help_text=_("Whether to receive email notifications")
    )

    # Timestamps
    profile_completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text=_("When the user completed their profile")
    )

    last_activity = models.DateTimeField(
        auto_now=True,
        help_text=_("Last time the user was active on the platform")
    )

    # Gamification and Rewards
    credits = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("User's current credit balance")
    )

    user_type = models.CharField(
        max_length=20,
        choices=[
            ('youth', _('Youth')),
        ],
        default='youth',
        help_text=_("User type")
    )

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.email})"

    @property
    def age(self):
        """Calculate age from date of birth"""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None

    @property
    def is_youth(self):
        """Check if user qualifies as youth (18-35 years old)"""
        age = self.age
        return age is not None and 18 <= age <= 35

    @property
    def profile_completion_percentage(self):
        """Calculate profile completion percentage"""
        required_fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'date_of_birth', 'county', 'education_level', 'employment_status'
        ]
        completed_fields = sum(1 for field in required_fields if getattr(self, field))
        return int((completed_fields / len(required_fields)) * 100)

    def get_skills_list(self):
        """Return skills as a list"""
        if self.skills:
            return [skill.strip() for skill in self.skills.split(',') if skill.strip()]
        return []

    def get_interests_list(self):
        """Return interests as a list"""
        if self.interests:
            return [interest.strip() for interest in self.interests.split(',') if interest.strip()]
        return []
