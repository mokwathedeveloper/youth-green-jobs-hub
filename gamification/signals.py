"""
Django signals for gamification system
"""
import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal

# Import models from other apps
from waste_collection.models import WasteReport, EventParticipation
from products.models import Order, ProductReview

# Import gamification models and services
from .models import UserProfile, PointTransaction
from .services.achievement_service import achievement_service

logger = logging.getLogger(__name__)


from django.conf import settings

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_gamification_profile(sender, instance, created, **kwargs):
    """Create gamification profile when user is created"""
    if created:
        try:
            UserProfile.objects.create(user=instance)
            logger.info(f"Created gamification profile for user: {instance.username}")
        except Exception as e:
            logger.error(f"Error creating gamification profile for {instance.username}: {e}")


@receiver(post_save, sender=WasteReport)
def handle_waste_report_gamification(sender, instance, created, **kwargs):
    """Handle gamification when waste report is created or updated"""
    if created:
        try:
            user = instance.reporter
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            # Award points for waste report
            base_points = 10
            weight_bonus = int(float(instance.estimated_weight_kg) * 2)  # 2 points per kg
            total_points = base_points + weight_bonus
            
            profile.add_points(total_points, 'waste_report')
            
            # Update waste collection stats
            profile.total_waste_collected_kg += instance.estimated_weight_kg
            
            # Update streak
            today = timezone.now().date()
            if profile.last_activity_date:
                days_diff = (today - profile.last_activity_date).days
                if days_diff == 1:
                    # Consecutive day
                    profile.current_streak_days += 1
                    if profile.current_streak_days > profile.longest_streak_days:
                        profile.longest_streak_days = profile.current_streak_days
                elif days_diff > 1:
                    # Streak broken
                    profile.current_streak_days = 1
                # Same day doesn't change streak
            else:
                # First activity
                profile.current_streak_days = 1
                profile.longest_streak_days = 1
            
            profile.last_activity_date = today
            profile.save()
            
            # Check for badges
            context = {
                'source_id': str(instance.id),
                'weight_kg': float(instance.estimated_weight_kg),
                'category': instance.category.name if instance.category else None,
            }
            
            newly_awarded = achievement_service.check_and_award_badges(
                user, 'waste_report_created', context
            )
            
            if newly_awarded:
                logger.info(f"Awarded {len(newly_awarded)} badges to {user.username} for waste report")
            
        except Exception as e:
            logger.error(f"Error handling waste report gamification: {e}")


@receiver(post_save, sender=Order)
def handle_order_gamification(sender, instance, created, **kwargs):
    """Handle gamification when order is created or updated"""
    try:
        user = instance.customer
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        if created:
            # Award points for placing order
            order_points = 5
            amount_bonus = int(float(instance.total_amount) / 100)  # 1 point per 100 KSh
            total_points = order_points + amount_bonus
            
            profile.add_points(total_points, 'order_placed')
            profile.total_orders_placed += 1
            profile.save()
            
            # Check for badges
            context = {
                'source_id': str(instance.id),
                'order_amount': float(instance.total_amount),
                'order_count': profile.total_orders_placed,
            }
            
            achievement_service.check_and_award_badges(
                user, 'order_created', context
            )
            
        elif instance.status == 'delivered' and kwargs.get('update_fields') and 'status' in kwargs['update_fields']:
            # Bonus points for completed order
            completion_bonus = 10
            profile.add_points(completion_bonus, 'order_completed')
            
            context = {
                'source_id': str(instance.id),
                'order_amount': float(instance.total_amount),
            }
            
            achievement_service.check_and_award_badges(
                user, 'order_completed', context
            )
            
    except Exception as e:
        logger.error(f"Error handling order gamification: {e}")


@receiver(post_save, sender=EventParticipation)
def handle_event_participation_gamification(sender, instance, created, **kwargs):
    """Handle gamification when user participates in events"""
    if created:
        try:
            user = instance.user
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            # Award points for event participation
            participation_points = 15
            profile.add_points(participation_points, 'event_participation')
            profile.total_events_attended += 1
            profile.save()
            
            # Check for badges
            context = {
                'source_id': str(instance.id),
                'event_id': str(instance.event.id),
                'event_type': instance.event.event_type,
                'events_attended': profile.total_events_attended,
            }
            
            achievement_service.check_and_award_badges(
                user, 'event_joined', context
            )
            
        except Exception as e:
            logger.error(f"Error handling event participation gamification: {e}")


@receiver(post_save, sender=ProductReview)
def handle_product_review_gamification(sender, instance, created, **kwargs):
    """Handle gamification when user reviews a product"""
    if created:
        try:
            user = instance.customer
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            # Award points for product review
            review_points = 5
            
            # Bonus for detailed review
            if len(instance.comment) > 100:
                review_points += 5
            
            # Bonus for high rating
            if instance.rating >= 4:
                review_points += 3
            
            profile.add_points(review_points, 'product_review')
            
            # Check for badges
            context = {
                'source_id': str(instance.id),
                'product_id': str(instance.product.id),
                'rating': instance.rating,
                'review_length': len(instance.comment),
            }
            
            achievement_service.check_and_award_badges(
                user, 'review_created', context
            )
            
        except Exception as e:
            logger.error(f"Error handling product review gamification: {e}")


# Additional signal handlers for other gamification triggers

@receiver(post_save, sender=User)
def handle_user_profile_updates(sender, instance, created, **kwargs):
    """Handle gamification for user profile updates"""
    if not created and kwargs.get('update_fields'):
        try:
            # Award points for profile completion
            updated_fields = kwargs['update_fields']
            profile_fields = ['first_name', 'last_name', 'email']
            
            if any(field in updated_fields for field in profile_fields):
                profile, _ = UserProfile.objects.get_or_create(user=instance)
                
                # Check profile completion
                completion_score = 0
                if instance.first_name:
                    completion_score += 1
                if instance.last_name:
                    completion_score += 1
                if instance.email:
                    completion_score += 1
                
                # Award points for profile completion milestones
                if completion_score == 3:  # Full profile
                    profile.add_points(20, 'profile_completed')
                    
                    context = {'completion_score': completion_score}
                    achievement_service.check_and_award_badges(
                        instance, 'profile_completed', context
                    )
                
        except Exception as e:
            logger.error(f"Error handling user profile gamification: {e}")


def award_referral_points(referrer_user, referred_user):
    """Award points for successful referrals (to be called manually)"""
    try:
        referrer_profile, _ = UserProfile.objects.get_or_create(user=referrer_user)
        
        # Award referral points
        referral_points = 50
        referrer_profile.add_points(referral_points, 'referral')
        referrer_profile.total_referrals += 1
        referrer_profile.save()
        
        # Check for referral badges
        context = {
            'referred_user_id': str(referred_user.id),
            'total_referrals': referrer_profile.total_referrals,
        }
        
        achievement_service.check_and_award_badges(
            referrer_user, 'referral_successful', context
        )
        
        logger.info(f"Awarded referral points to {referrer_user.username}")
        
    except Exception as e:
        logger.error(f"Error awarding referral points: {e}")


def award_daily_login_points(user):
    """Award points for daily login (to be called from login view)"""
    try:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        # Check if user already got daily login points today
        today = timezone.now().date()
        recent_login_transaction = PointTransaction.objects.filter(
            user=user,
            source='daily_login',
            created_at__date=today
        ).first()
        
        if not recent_login_transaction:
            # Award daily login points
            login_points = 2
            profile.add_points(login_points, 'daily_login')
            
            logger.info(f"Awarded daily login points to {user.username}")
        
    except Exception as e:
        logger.error(f"Error awarding daily login points: {e}")
