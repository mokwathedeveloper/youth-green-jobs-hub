"""
Serializers for gamification system
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Badge, UserProfile, UserBadge, PointTransaction, 
    Challenge, ChallengeParticipation, Leaderboard
)


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for gamification"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class BadgeSerializer(serializers.ModelSerializer):
    """Badge serializer"""
    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'category',
            'rarity', 'points_required', 'is_hidden', 'created_at'
        ]


class UserBadgeSerializer(serializers.ModelSerializer):
    """User badge serializer"""
    badge = BadgeSerializer(read_only=True)
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = [
            'id', 'user', 'badge', 'earned_at', 'points_earned',
            'source_type', 'source_id'
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    user = UserBasicSerializer(read_only=True)
    level_progress_percentage = serializers.ReadOnlyField()
    badges_count = serializers.SerializerMethodField()
    recent_badges = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'total_points', 'current_level', 'points_to_next_level',
            'level_progress_percentage', 'current_streak_days', 'longest_streak_days',
            'total_waste_collected_kg', 'total_orders_placed', 'total_events_attended',
            'total_referrals', 'badges_count', 'recent_badges', 'show_on_leaderboard',
            'receive_achievement_notifications', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'total_points', 'current_level', 'points_to_next_level',
            'current_streak_days', 'longest_streak_days', 'total_waste_collected_kg',
            'total_orders_placed', 'total_events_attended', 'total_referrals',
            'badges_count', 'recent_badges', 'created_at', 'updated_at'
        ]
    
    def get_badges_count(self, obj):
        """Get total number of badges earned"""
        return obj.badges_earned.count()
    
    def get_recent_badges(self, obj):
        """Get 5 most recent badges"""
        recent_badges = UserBadge.objects.filter(user=obj.user).select_related('badge').order_by('-earned_at')[:5]
        return UserBadgeSerializer(recent_badges, many=True).data


class PointTransactionSerializer(serializers.ModelSerializer):
    """Point transaction serializer"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PointTransaction
        fields = [
            'id', 'user', 'points', 'transaction_type', 'source',
            'source_id', 'description', 'created_at'
        ]


class ChallengeSerializer(serializers.ModelSerializer):
    """Challenge serializer"""
    is_ongoing = serializers.ReadOnlyField()
    participants_count = serializers.ReadOnlyField()
    badge_reward = BadgeSerializer(read_only=True)
    
    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date',
            'requirements', 'points_reward', 'badge_reward', 'is_active',
            'max_participants', 'is_ongoing', 'participants_count',
            'created_at', 'updated_at'
        ]


class ChallengeParticipationSerializer(serializers.ModelSerializer):
    """Challenge participation serializer"""
    user = UserBasicSerializer(read_only=True)
    challenge = ChallengeSerializer(read_only=True)
    
    class Meta:
        model = ChallengeParticipation
        fields = [
            'id', 'user', 'challenge', 'joined_at', 'completed_at',
            'progress', 'is_completed'
        ]


class LeaderboardEntrySerializer(serializers.Serializer):
    """Leaderboard entry serializer"""
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    score = serializers.FloatField()
    level = serializers.IntegerField(required=False)
    total_points = serializers.IntegerField(required=False)
    badges_count = serializers.IntegerField(required=False)
    current_streak = serializers.IntegerField(required=False)
    longest_streak = serializers.IntegerField(required=False)


class LeaderboardSerializer(serializers.Serializer):
    """Leaderboard serializer"""
    type = serializers.CharField()
    period = serializers.CharField()
    last_updated = serializers.DateTimeField()
    entries = LeaderboardEntrySerializer(many=True)
    total_entries = serializers.IntegerField()


class UserRankingSerializer(serializers.Serializer):
    """User ranking serializer"""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    rank = serializers.IntegerField(allow_null=True)
    score = serializers.FloatField(allow_null=True)
    total_participants = serializers.IntegerField()
    leaderboard_type = serializers.CharField()
    period = serializers.CharField()


class AchievementsSummarySerializer(serializers.Serializer):
    """Achievements summary serializer"""
    profile = serializers.DictField()
    rankings = serializers.DictField()
    recent_badges = serializers.ListField()
    total_badges = serializers.IntegerField()


class BadgesByCategorySerializer(serializers.Serializer):
    """Badges organized by category serializer"""
    badges_by_category = serializers.DictField()
    total_badges = serializers.IntegerField()
    total_points_from_badges = serializers.IntegerField()


# Create/Update Serializers

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile preferences"""
    class Meta:
        model = UserProfile
        fields = ['show_on_leaderboard', 'receive_achievement_notifications']


class ChallengeJoinSerializer(serializers.Serializer):
    """Serializer for joining a challenge"""
    challenge_id = serializers.UUIDField()


class PointsAwardSerializer(serializers.Serializer):
    """Serializer for manually awarding points (admin only)"""
    user_id = serializers.IntegerField()
    points = serializers.IntegerField()
    source = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500)
