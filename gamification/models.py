"""
Gamification models for the Youth Green Jobs platform
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid
from django.utils import timezone


class Badge(models.Model):
    """Achievement badges that users can earn"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(
        max_length=50,
        help_text="Icon name or emoji for the badge"
    )
    color = models.CharField(
        max_length=7,
        default='#4CAF50',
        help_text="Hex color code for the badge"
    )
    
    # Badge categories
    CATEGORY_CHOICES = [
        ('waste_collection', 'Waste Collection'),
        ('marketplace', 'Marketplace'),
        ('community', 'Community'),
        ('environmental', 'Environmental Impact'),
        ('achievement', 'Special Achievement'),
        ('milestone', 'Milestone'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Badge rarity
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('uncommon', 'Uncommon'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')
    
    # Requirements
    points_required = models.PositiveIntegerField(
        default=0,
        help_text="Minimum points required to earn this badge"
    )
    
    # Conditions for earning the badge (JSON format)
    conditions = models.JSONField(
        default=dict,
        help_text="Conditions that must be met to earn this badge"
    )
    
    # Badge properties
    is_active = models.BooleanField(default=True)
    is_hidden = models.BooleanField(
        default=False,
        help_text="Hidden badges are not shown until earned"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'points_required', 'name']
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
    
    def __str__(self):
        return f"{self.name} ({self.get_rarity_display()})"


class UserProfile(models.Model):
    """Extended user profile for gamification"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamification_profile')
    
    # Points and levels
    total_points = models.PositiveIntegerField(default=0)
    current_level = models.PositiveIntegerField(default=1)
    points_to_next_level = models.PositiveIntegerField(default=100)
    
    # Streaks
    current_streak_days = models.PositiveIntegerField(default=0)
    longest_streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Statistics
    total_waste_collected_kg = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00')
    )
    total_orders_placed = models.PositiveIntegerField(default=0)
    total_events_attended = models.PositiveIntegerField(default=0)
    total_referrals = models.PositiveIntegerField(default=0)
    
    # Achievements
    badges_earned = models.ManyToManyField(Badge, through='UserBadge', blank=True)
    
    # Preferences
    show_on_leaderboard = models.BooleanField(default=True)
    receive_achievement_notifications = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username} - Level {self.current_level}"
    
    @property
    def level_progress_percentage(self):
        """Calculate progress to next level as percentage"""
        if self.points_to_next_level == 0:
            return 100
        
        level_points = self.get_points_for_level(self.current_level + 1) - self.get_points_for_level(self.current_level)
        current_progress = level_points - self.points_to_next_level
        
        return (current_progress / level_points) * 100 if level_points > 0 else 0
    
    def get_points_for_level(self, level):
        """Calculate total points required for a specific level"""
        # Exponential growth: level^2 * 50
        return (level - 1) ** 2 * 50
    
    def add_points(self, points, source=None):
        """Add points and check for level up"""
        self.total_points += points
        
        # Check for level up
        while self.points_to_next_level <= points:
            points -= self.points_to_next_level
            self.current_level += 1
            next_level_points = self.get_points_for_level(self.current_level + 1) - self.get_points_for_level(self.current_level)
            self.points_to_next_level = next_level_points - points
        
        self.points_to_next_level -= points
        self.save()
        
        # Create point transaction record
        PointTransaction.objects.create(
            user=self.user,
            points=points,
            transaction_type='earned',
            source=source or 'manual',
            description=f"Points earned from {source or 'manual action'}"
        )


class UserBadge(models.Model):
    """Junction table for user badges with earning details"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    
    earned_at = models.DateTimeField(auto_now_add=True)
    points_earned = models.PositiveIntegerField(
        default=0,
        help_text="Points earned when this badge was awarded"
    )
    
    # Context of earning
    source_type = models.CharField(
        max_length=50,
        help_text="Type of action that earned this badge"
    )
    source_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID of the specific action/object that earned this badge"
    )
    
    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
        verbose_name = 'User Badge'
        verbose_name_plural = 'User Badges'
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"


class PointTransaction(models.Model):
    """Record of all point transactions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='point_transactions')
    
    points = models.IntegerField(help_text="Points gained (positive) or lost (negative)")
    
    TRANSACTION_TYPES = [
        ('earned', 'Earned'),
        ('spent', 'Spent'),
        ('bonus', 'Bonus'),
        ('penalty', 'Penalty'),
        ('adjustment', 'Adjustment'),
    ]
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    
    source = models.CharField(
        max_length=100,
        help_text="Source of the points (waste_report, order, event, etc.)"
    )
    source_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID of the specific source object"
    )
    
    description = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Point Transaction'
        verbose_name_plural = 'Point Transactions'
    
    def __str__(self):
        return f"{self.user.username}: {self.points:+d} points ({self.source})"


class Challenge(models.Model):
    """Time-limited challenges for users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Challenge timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Challenge requirements
    requirements = models.JSONField(
        default=dict,
        help_text="Requirements to complete the challenge"
    )
    
    # Rewards
    points_reward = models.PositiveIntegerField(default=0)
    badge_reward = models.ForeignKey(
        Badge, on_delete=models.SET_NULL, 
        null=True, blank=True,
        help_text="Badge awarded for completing this challenge"
    )
    
    # Challenge properties
    is_active = models.BooleanField(default=True)
    max_participants = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Maximum number of participants (null for unlimited)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Challenge'
        verbose_name_plural = 'Challenges'
    
    def __str__(self):
        return self.title
    
    @property
    def is_ongoing(self):
        """Check if challenge is currently active"""
        now = timezone.now()
        return self.start_date <= now <= self.end_date and self.is_active
    
    @property
    def participants_count(self):
        """Get number of participants"""
        return self.participants.count()


class ChallengeParticipation(models.Model):
    """User participation in challenges"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='participants')
    
    joined_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Progress tracking
    progress = models.JSONField(
        default=dict,
        help_text="Current progress towards challenge completion"
    )
    
    is_completed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'challenge']
        ordering = ['-joined_at']
        verbose_name = 'Challenge Participation'
        verbose_name_plural = 'Challenge Participations'
    
    def __str__(self):
        return f"{self.user.username} - {self.challenge.title}"


class Leaderboard(models.Model):
    """Leaderboard configurations and snapshots"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Leaderboard type
    LEADERBOARD_TYPES = [
        ('points', 'Total Points'),
        ('waste_collected', 'Waste Collected'),
        ('orders', 'Orders Placed'),
        ('events', 'Events Attended'),
        ('streak', 'Current Streak'),
        ('badges', 'Badges Earned'),
    ]
    leaderboard_type = models.CharField(max_length=20, choices=LEADERBOARD_TYPES)
    
    # Time period
    PERIOD_CHOICES = [
        ('all_time', 'All Time'),
        ('yearly', 'Yearly'),
        ('monthly', 'Monthly'),
        ('weekly', 'Weekly'),
        ('daily', 'Daily'),
    ]
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='all_time')
    
    # Configuration
    max_entries = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    
    # Snapshot data
    snapshot_data = models.JSONField(
        default=list,
        help_text="Cached leaderboard data"
    )
    last_updated = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Leaderboard'
        verbose_name_plural = 'Leaderboards'
    
    def __str__(self):
        return f"{self.name} ({self.get_period_display()})"
