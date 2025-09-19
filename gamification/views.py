"""
Views for gamification system
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import (
    Badge, UserProfile, UserBadge, PointTransaction,
    Challenge, ChallengeParticipation
)
from .serializers import (
    BadgeSerializer, UserProfileSerializer, UserBadgeSerializer,
    PointTransactionSerializer, ChallengeSerializer, ChallengeParticipationSerializer,
    LeaderboardSerializer, UserRankingSerializer, AchievementsSummarySerializer,
    BadgesByCategorySerializer, UserProfileUpdateSerializer, ChallengeJoinSerializer,
    PointsAwardSerializer
)
from .services.achievement_service import achievement_service
from .services.leaderboard_service import leaderboard_service


# User Profile Views

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user's gamification profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UserProfileUpdateSerializer
        return UserProfileSerializer


class UserProfileDetailView(generics.RetrieveAPIView):
    """Get another user's public gamification profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'user__username'
    
    def get_queryset(self):
        return UserProfile.objects.filter(show_on_leaderboard=True)


# Badge Views

class BadgeListView(generics.ListAPIView):
    """List all available badges"""
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Badge.objects.filter(is_active=True, is_hidden=False)


class UserBadgesView(generics.ListAPIView):
    """Get user's earned badges"""
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related('badge')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_badges_by_category(request):
    """Get user's badges organized by category"""
    try:
        badges_data = achievement_service.get_user_badges(request.user)
        serializer = BadgesByCategorySerializer(badges_data)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_badges(request):
    """Get badges available for user to earn"""
    try:
        badges_data = achievement_service.get_available_badges(request.user)
        return Response({'available_badges': badges_data})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Point Transaction Views

class PointTransactionListView(generics.ListAPIView):
    """List user's point transactions"""
    serializer_class = PointTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PointTransaction.objects.filter(user=self.request.user)


# Leaderboard Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """Get leaderboard data"""
    leaderboard_type = request.GET.get('type', 'points')
    period = request.GET.get('period', 'all_time')
    limit = int(request.GET.get('limit', 100))
    
    try:
        leaderboard_data = leaderboard_service.get_leaderboard(
            leaderboard_type, period, limit
        )
        serializer = LeaderboardSerializer(leaderboard_data)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_ranking(request):
    """Get user's ranking in leaderboards"""
    leaderboard_type = request.GET.get('type', 'points')
    period = request.GET.get('period', 'all_time')
    
    try:
        ranking_data = leaderboard_service.get_user_ranking(
            request.user, leaderboard_type, period
        )
        serializer = UserRankingSerializer(ranking_data)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def achievements_summary(request):
    """Get comprehensive achievements summary for user"""
    try:
        summary_data = leaderboard_service.get_user_achievements_summary(request.user)
        serializer = AchievementsSummarySerializer(summary_data)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Challenge Views

class ChallengeListView(generics.ListAPIView):
    """List active challenges"""
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Challenge.objects.filter(is_active=True).order_by('-start_date')


class ChallengeDetailView(generics.RetrieveAPIView):
    """Get challenge details"""
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]
    queryset = Challenge.objects.filter(is_active=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_challenge(request):
    """Join a challenge"""
    serializer = ChallengeJoinSerializer(data=request.data)
    if serializer.is_valid():
        try:
            challenge_id = serializer.validated_data['challenge_id']
            challenge = get_object_or_404(Challenge, id=challenge_id, is_active=True)
            
            # Check if challenge is ongoing
            if not challenge.is_ongoing:
                return Response(
                    {'error': 'Challenge is not currently active'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user already joined
            if ChallengeParticipation.objects.filter(
                user=request.user, challenge=challenge
            ).exists():
                return Response(
                    {'error': 'Already joined this challenge'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check participant limit
            if challenge.max_participants:
                current_participants = challenge.participants.count()
                if current_participants >= challenge.max_participants:
                    return Response(
                        {'error': 'Challenge is full'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Join challenge
            participation = ChallengeParticipation.objects.create(
                user=request.user,
                challenge=challenge
            )
            
            serializer = ChallengeParticipationSerializer(participation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserChallengesView(generics.ListAPIView):
    """List user's challenge participations"""
    serializer_class = ChallengeParticipationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChallengeParticipation.objects.filter(
            user=self.request.user
        ).select_related('challenge')


# Admin Views

@api_view(['POST'])
@permission_classes([IsAdminUser])
def award_points(request):
    """Manually award points to a user (admin only)"""
    serializer = PointsAwardSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user_id = serializer.validated_data['user_id']
            points = serializer.validated_data['points']
            source = serializer.validated_data['source']
            description = serializer.validated_data['description']
            
            user = get_object_or_404(User, id=user_id)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            profile.add_points(points, source)
            
            # Check for badges
            achievement_service.check_and_award_badges(
                user, 'manual_award', {'points': points, 'source': source}
            )
            
            return Response({
                'success': True,
                'message': f'Awarded {points} points to {user.username}',
                'user_total_points': profile.total_points
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_leaderboards(request):
    """Update cached leaderboard data (admin only)"""
    try:
        leaderboard_service.update_cached_leaderboards()
        return Response({'success': True, 'message': 'Leaderboards updated'})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Statistics Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gamification_stats(request):
    """Get overall gamification statistics"""
    try:
        stats = {
            'total_users': UserProfile.objects.count(),
            'total_badges_awarded': UserBadge.objects.count(),
            'total_points_awarded': sum(
                profile.total_points for profile in UserProfile.objects.all()
            ),
            'active_challenges': Challenge.objects.filter(is_active=True).count(),
            'top_level': UserProfile.objects.order_by('-current_level').first().current_level if UserProfile.objects.exists() else 0,
        }
        
        return Response(stats)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
