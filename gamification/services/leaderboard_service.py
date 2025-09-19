"""
Leaderboard service for gamification
"""
import logging
from typing import List, Dict, Optional
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from ..models import UserProfile, Leaderboard, UserBadge

logger = logging.getLogger(__name__)


class LeaderboardService:
    """Service for managing leaderboards and rankings"""
    
    def __init__(self):
        self.leaderboard_calculators = {
            'points': self._calculate_points_leaderboard,
            'waste_collected': self._calculate_waste_leaderboard,
            'orders': self._calculate_orders_leaderboard,
            'events': self._calculate_events_leaderboard,
            'streak': self._calculate_streak_leaderboard,
            'badges': self._calculate_badges_leaderboard,
        }
    
    def get_leaderboard(self, leaderboard_type: str, period: str = 'all_time', limit: int = 100) -> Dict:
        """
        Get leaderboard data for a specific type and period
        
        Args:
            leaderboard_type: Type of leaderboard (points, waste_collected, etc.)
            period: Time period (all_time, monthly, weekly, daily)
            limit: Maximum number of entries to return
            
        Returns:
            Dictionary with leaderboard data
        """
        try:
            if leaderboard_type not in self.leaderboard_calculators:
                raise ValueError(f"Unknown leaderboard type: {leaderboard_type}")
            
            # Calculate leaderboard data
            calculator = self.leaderboard_calculators[leaderboard_type]
            leaderboard_data = calculator(period, limit)
            
            return {
                'type': leaderboard_type,
                'period': period,
                'last_updated': timezone.now(),
                'entries': leaderboard_data,
                'total_entries': len(leaderboard_data),
            }
            
        except Exception as e:
            logger.error(f"Error generating leaderboard {leaderboard_type}: {e}")
            return {
                'type': leaderboard_type,
                'period': period,
                'last_updated': timezone.now(),
                'entries': [],
                'total_entries': 0,
                'error': str(e),
            }
    
    def get_user_ranking(self, user: User, leaderboard_type: str, period: str = 'all_time') -> Dict:
        """Get user's ranking in a specific leaderboard"""
        try:
            leaderboard = self.get_leaderboard(leaderboard_type, period, limit=1000)
            
            user_rank = None
            user_score = None
            total_participants = len(leaderboard['entries'])
            
            for i, entry in enumerate(leaderboard['entries']):
                if entry['user_id'] == user.id:
                    user_rank = i + 1
                    user_score = entry['score']
                    break
            
            return {
                'user_id': user.id,
                'username': user.username,
                'rank': user_rank,
                'score': user_score,
                'total_participants': total_participants,
                'leaderboard_type': leaderboard_type,
                'period': period,
            }
            
        except Exception as e:
            logger.error(f"Error getting user ranking for {user.username}: {e}")
            return {
                'user_id': user.id,
                'username': user.username,
                'rank': None,
                'score': None,
                'total_participants': 0,
                'leaderboard_type': leaderboard_type,
                'period': period,
                'error': str(e),
            }
    
    def _calculate_points_leaderboard(self, period: str, limit: int) -> List[Dict]:
        """Calculate points-based leaderboard"""
        queryset = UserProfile.objects.select_related('user').filter(
            show_on_leaderboard=True,
            user__is_active=True
        )
        
        # Apply period filter if needed
        if period != 'all_time':
            # For points, we use total_points regardless of period
            # In a real implementation, you might want to track period-specific points
            pass
        
        # Order by total points
        queryset = queryset.order_by('-total_points')[:limit]
        
        leaderboard = []
        for i, profile in enumerate(queryset):
            leaderboard.append({
                'rank': i + 1,
                'user_id': profile.user.id,
                'username': profile.user.username,
                'first_name': profile.user.first_name,
                'last_name': profile.user.last_name,
                'score': profile.total_points,
                'level': profile.current_level,
                'badges_count': profile.badges_earned.count(),
            })
        
        return leaderboard
    
    def _calculate_waste_leaderboard(self, period: str, limit: int) -> List[Dict]:
        """Calculate waste collection leaderboard"""
        queryset = UserProfile.objects.select_related('user').filter(
            show_on_leaderboard=True,
            user__is_active=True
        )
        
        # For period-specific waste collection, we'd need to query WasteReport model
        # For now, using total_waste_collected_kg
        queryset = queryset.order_by('-total_waste_collected_kg')[:limit]
        
        leaderboard = []
        for i, profile in enumerate(queryset):
            leaderboard.append({
                'rank': i + 1,
                'user_id': profile.user.id,
                'username': profile.user.username,
                'first_name': profile.user.first_name,
                'last_name': profile.user.last_name,
                'score': float(profile.total_waste_collected_kg),
                'level': profile.current_level,
                'total_points': profile.total_points,
            })
        
        return leaderboard
    
    def _calculate_orders_leaderboard(self, period: str, limit: int) -> List[Dict]:
        """Calculate marketplace orders leaderboard"""
        queryset = UserProfile.objects.select_related('user').filter(
            show_on_leaderboard=True,
            user__is_active=True
        )
        
        queryset = queryset.order_by('-total_orders_placed')[:limit]
        
        leaderboard = []
        for i, profile in enumerate(queryset):
            leaderboard.append({
                'rank': i + 1,
                'user_id': profile.user.id,
                'username': profile.user.username,
                'first_name': profile.user.first_name,
                'last_name': profile.user.last_name,
                'score': profile.total_orders_placed,
                'level': profile.current_level,
                'total_points': profile.total_points,
            })
        
        return leaderboard
    
    def _calculate_events_leaderboard(self, period: str, limit: int) -> List[Dict]:
        """Calculate community events leaderboard"""
        queryset = UserProfile.objects.select_related('user').filter(
            show_on_leaderboard=True,
            user__is_active=True
        )
        
        queryset = queryset.order_by('-total_events_attended')[:limit]
        
        leaderboard = []
        for i, profile in enumerate(queryset):
            leaderboard.append({
                'rank': i + 1,
                'user_id': profile.user.id,
                'username': profile.user.username,
                'first_name': profile.user.first_name,
                'last_name': profile.user.last_name,
                'score': profile.total_events_attended,
                'level': profile.current_level,
                'total_points': profile.total_points,
            })
        
        return leaderboard
    
    def _calculate_streak_leaderboard(self, period: str, limit: int) -> List[Dict]:
        """Calculate streak leaderboard"""
        queryset = UserProfile.objects.select_related('user').filter(
            show_on_leaderboard=True,
            user__is_active=True
        )
        
        # Use longest streak for all-time, current streak for recent periods
        if period == 'all_time':
            queryset = queryset.order_by('-longest_streak_days')
            score_field = 'longest_streak_days'
        else:
            queryset = queryset.order_by('-current_streak_days')
            score_field = 'current_streak_days'
        
        queryset = queryset[:limit]
        
        leaderboard = []
        for i, profile in enumerate(queryset):
            score = getattr(profile, score_field)
            leaderboard.append({
                'rank': i + 1,
                'user_id': profile.user.id,
                'username': profile.user.username,
                'first_name': profile.user.first_name,
                'last_name': profile.user.last_name,
                'score': score,
                'current_streak': profile.current_streak_days,
                'longest_streak': profile.longest_streak_days,
                'level': profile.current_level,
            })
        
        return leaderboard
    
    def _calculate_badges_leaderboard(self, period: str, limit: int) -> List[Dict]:
        """Calculate badges leaderboard"""
        # Get users with badge counts
        users_with_badges = User.objects.filter(
            is_active=True,
            gamification_profile__show_on_leaderboard=True
        ).annotate(
            badges_count=Count('userbadge'),
            total_points=Sum('gamification_profile__total_points')
        ).order_by('-badges_count', '-total_points')[:limit]
        
        leaderboard = []
        for i, user in enumerate(users_with_badges):
            leaderboard.append({
                'rank': i + 1,
                'user_id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'score': user.badges_count,
                'total_points': user.total_points or 0,
                'level': getattr(user.gamification_profile, 'current_level', 1),
            })
        
        return leaderboard
    
    def update_cached_leaderboards(self):
        """Update all cached leaderboard data"""
        try:
            leaderboards = Leaderboard.objects.filter(is_active=True)
            
            for leaderboard in leaderboards:
                data = self.get_leaderboard(
                    leaderboard.leaderboard_type,
                    leaderboard.period,
                    leaderboard.max_entries
                )
                
                leaderboard.snapshot_data = data['entries']
                leaderboard.save()
                
                logger.info(f"Updated cached leaderboard: {leaderboard.name}")
            
        except Exception as e:
            logger.error(f"Error updating cached leaderboards: {e}")
    
    def get_user_achievements_summary(self, user: User) -> Dict:
        """Get comprehensive achievements summary for a user"""
        try:
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Get user's rankings across different leaderboards
            rankings = {}
            for lb_type in ['points', 'waste_collected', 'orders', 'events', 'streak', 'badges']:
                ranking = self.get_user_ranking(user, lb_type)
                rankings[lb_type] = ranking
            
            # Get recent badges
            recent_badges = UserBadge.objects.filter(user=user).select_related('badge').order_by('-earned_at')[:5]
            
            return {
                'profile': {
                    'total_points': profile.total_points,
                    'current_level': profile.current_level,
                    'level_progress': profile.level_progress_percentage,
                    'current_streak': profile.current_streak_days,
                    'longest_streak': profile.longest_streak_days,
                    'total_waste_collected': float(profile.total_waste_collected_kg),
                    'total_orders': profile.total_orders_placed,
                    'total_events': profile.total_events_attended,
                },
                'rankings': rankings,
                'recent_badges': [
                    {
                        'name': ub.badge.name,
                        'icon': ub.badge.icon,
                        'color': ub.badge.color,
                        'rarity': ub.badge.rarity,
                        'earned_at': ub.earned_at,
                    }
                    for ub in recent_badges
                ],
                'total_badges': UserBadge.objects.filter(user=user).count(),
            }
            
        except Exception as e:
            logger.error(f"Error getting achievements summary for {user.username}: {e}")
            return {}


# Global service instance
leaderboard_service = LeaderboardService()
