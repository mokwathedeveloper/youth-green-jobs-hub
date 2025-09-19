"""
Achievement and badge service for gamification
"""
import logging
from typing import List, Dict, Optional
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
from ..models import Badge, UserBadge, UserProfile, PointTransaction

logger = logging.getLogger(__name__)


class AchievementService:
    """Service for managing achievements and badges"""
    
    def __init__(self):
        self.badge_conditions = {
            'waste_collection': self._check_waste_collection_badges,
            'marketplace': self._check_marketplace_badges,
            'community': self._check_community_badges,
            'environmental': self._check_environmental_badges,
            'milestone': self._check_milestone_badges,
        }
    
    def check_and_award_badges(self, user: User, action_type: str, context: Dict = None) -> List[Badge]:
        """
        Check if user qualifies for any badges and award them
        
        Args:
            user: User to check badges for
            action_type: Type of action that triggered the check
            context: Additional context about the action
            
        Returns:
            List of newly awarded badges
        """
        try:
            profile, created = UserProfile.objects.get_or_create(user=user)
            if created:
                logger.info(f"Created gamification profile for user {user.username}")
            
            newly_awarded = []
            
            # Get all active badges user hasn't earned yet
            earned_badge_ids = UserBadge.objects.filter(user=user).values_list('badge_id', flat=True)
            available_badges = Badge.objects.filter(
                is_active=True
            ).exclude(id__in=earned_badge_ids)
            
            for badge in available_badges:
                if self._check_badge_conditions(user, badge, action_type, context):
                    awarded_badge = self._award_badge(user, badge, action_type, context)
                    if awarded_badge:
                        newly_awarded.append(badge)
            
            return newly_awarded
            
        except Exception as e:
            logger.error(f"Error checking badges for user {user.username}: {e}")
            return []
    
    def _check_badge_conditions(self, user: User, badge: Badge, action_type: str, context: Dict) -> bool:
        """Check if user meets conditions for a specific badge"""
        try:
            profile = user.gamification_profile
            
            # Check points requirement
            if badge.points_required > profile.total_points:
                return False
            
            # Check category-specific conditions
            if badge.category in self.badge_conditions:
                return self.badge_conditions[badge.category](user, badge, action_type, context)
            
            # Default: check generic conditions from badge.conditions JSON
            return self._check_generic_conditions(user, badge.conditions, context)
            
        except Exception as e:
            logger.error(f"Error checking conditions for badge {badge.name}: {e}")
            return False
    
    def _check_waste_collection_badges(self, user: User, badge: Badge, action_type: str, context: Dict) -> bool:
        """Check waste collection specific badge conditions"""
        profile = user.gamification_profile
        conditions = badge.conditions
        
        # First waste report
        if badge.name == "First Steps" and action_type == 'waste_report_created':
            return True
        
        # Waste collection milestones
        if 'total_waste_kg' in conditions:
            required_kg = Decimal(str(conditions['total_waste_kg']))
            if profile.total_waste_collected_kg >= required_kg:
                return True
        
        # Streak badges
        if 'streak_days' in conditions:
            required_streak = conditions['streak_days']
            if profile.current_streak_days >= required_streak:
                return True
        
        # Report count badges
        if 'report_count' in conditions:
            from waste_collection.models import WasteReport
            report_count = WasteReport.objects.filter(reporter=user).count()
            if report_count >= conditions['report_count']:
                return True
        
        return False
    
    def _check_marketplace_badges(self, user: User, badge: Badge, action_type: str, context: Dict) -> bool:
        """Check marketplace specific badge conditions"""
        profile = user.gamification_profile
        conditions = badge.conditions
        
        # First order
        if badge.name == "First Purchase" and action_type == 'order_created':
            return True
        
        # Order count milestones
        if 'order_count' in conditions:
            if profile.total_orders_placed >= conditions['order_count']:
                return True
        
        # Spending milestones
        if 'total_spent' in conditions:
            from products.models import Order
            total_spent = Order.objects.filter(
                customer=user, 
                status='delivered'
            ).aggregate(
                total=models.Sum('total_amount')
            )['total'] or Decimal('0.00')
            
            if total_spent >= Decimal(str(conditions['total_spent'])):
                return True
        
        return False
    
    def _check_community_badges(self, user: User, badge: Badge, action_type: str, context: Dict) -> bool:
        """Check community specific badge conditions"""
        profile = user.gamification_profile
        conditions = badge.conditions
        
        # Event participation
        if 'events_attended' in conditions:
            if profile.total_events_attended >= conditions['events_attended']:
                return True
        
        # Referral badges
        if 'referrals' in conditions:
            if profile.total_referrals >= conditions['referrals']:
                return True
        
        return False
    
    def _check_environmental_badges(self, user: User, badge: Badge, action_type: str, context: Dict) -> bool:
        """Check environmental impact badge conditions"""
        profile = user.gamification_profile
        conditions = badge.conditions
        
        # CO2 savings (estimated from waste collected)
        if 'co2_saved_kg' in conditions:
            # Rough estimate: 1kg waste = 0.5kg CO2 saved
            estimated_co2_saved = profile.total_waste_collected_kg * Decimal('0.5')
            if estimated_co2_saved >= Decimal(str(conditions['co2_saved_kg'])):
                return True
        
        return False
    
    def _check_milestone_badges(self, user: User, badge: Badge, action_type: str, context: Dict) -> bool:
        """Check milestone badge conditions"""
        profile = user.gamification_profile
        conditions = badge.conditions
        
        # Level milestones
        if 'level' in conditions:
            if profile.current_level >= conditions['level']:
                return True
        
        # Point milestones
        if 'total_points' in conditions:
            if profile.total_points >= conditions['total_points']:
                return True
        
        return False
    
    def _check_generic_conditions(self, user: User, conditions: Dict, context: Dict) -> bool:
        """Check generic badge conditions"""
        # This can be extended for more complex condition checking
        return True
    
    def _award_badge(self, user: User, badge: Badge, action_type: str, context: Dict) -> Optional[UserBadge]:
        """Award a badge to a user"""
        try:
            # Calculate points for this badge based on rarity
            rarity_points = {
                'common': 10,
                'uncommon': 25,
                'rare': 50,
                'epic': 100,
                'legendary': 250,
            }
            points_earned = rarity_points.get(badge.rarity, 10)
            
            # Create user badge record
            user_badge = UserBadge.objects.create(
                user=user,
                badge=badge,
                points_earned=points_earned,
                source_type=action_type,
                source_id=context.get('source_id', '') if context else ''
            )
            
            # Add points to user profile
            profile = user.gamification_profile
            profile.add_points(points_earned, f"badge_{badge.name}")
            
            logger.info(f"Awarded badge '{badge.name}' to user {user.username}")
            return user_badge
            
        except Exception as e:
            logger.error(f"Error awarding badge {badge.name} to user {user.username}: {e}")
            return None
    
    def get_user_badges(self, user: User) -> Dict:
        """Get user's badge information"""
        try:
            user_badges = UserBadge.objects.filter(user=user).select_related('badge')
            
            badges_by_category = {}
            total_points_from_badges = 0
            
            for user_badge in user_badges:
                category = user_badge.badge.category
                if category not in badges_by_category:
                    badges_by_category[category] = []
                
                badges_by_category[category].append({
                    'id': str(user_badge.badge.id),
                    'name': user_badge.badge.name,
                    'description': user_badge.badge.description,
                    'icon': user_badge.badge.icon,
                    'color': user_badge.badge.color,
                    'rarity': user_badge.badge.rarity,
                    'earned_at': user_badge.earned_at,
                    'points_earned': user_badge.points_earned,
                })
                
                total_points_from_badges += user_badge.points_earned
            
            return {
                'badges_by_category': badges_by_category,
                'total_badges': user_badges.count(),
                'total_points_from_badges': total_points_from_badges,
            }
            
        except Exception as e:
            logger.error(f"Error getting badges for user {user.username}: {e}")
            return {
                'badges_by_category': {},
                'total_badges': 0,
                'total_points_from_badges': 0,
            }
    
    def get_available_badges(self, user: User) -> List[Dict]:
        """Get badges available for user to earn"""
        try:
            earned_badge_ids = UserBadge.objects.filter(user=user).values_list('badge_id', flat=True)
            available_badges = Badge.objects.filter(
                is_active=True,
                is_hidden=False
            ).exclude(id__in=earned_badge_ids)
            
            badges_list = []
            for badge in available_badges:
                badges_list.append({
                    'id': str(badge.id),
                    'name': badge.name,
                    'description': badge.description,
                    'icon': badge.icon,
                    'color': badge.color,
                    'category': badge.category,
                    'rarity': badge.rarity,
                    'points_required': badge.points_required,
                })
            
            return badges_list
            
        except Exception as e:
            logger.error(f"Error getting available badges for user {user.username}: {e}")
            return []


# Global service instance
achievement_service = AchievementService()
