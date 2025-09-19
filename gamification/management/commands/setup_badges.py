"""
Management command to set up default badges for gamification
"""
from django.core.management.base import BaseCommand
from gamification.models import Badge


class Command(BaseCommand):
    help = 'Set up default badges for gamification system'

    def handle(self, *args, **options):
        self.stdout.write('Setting up default badges...')

        badges_data = [
            # Waste Collection Badges
            {
                'name': 'First Steps',
                'description': 'Submit your first waste report',
                'icon': '🌱',
                'color': '#4CAF50',
                'category': 'waste_collection',
                'rarity': 'common',
                'points_required': 0,
                'conditions': {'first_report': True}
            },
            {
                'name': 'Eco Warrior',
                'description': 'Collect 10kg of waste',
                'icon': '♻️',
                'color': '#2196F3',
                'category': 'waste_collection',
                'rarity': 'uncommon',
                'points_required': 50,
                'conditions': {'total_waste_kg': 10}
            },
            {
                'name': 'Green Champion',
                'description': 'Collect 50kg of waste',
                'icon': '🏆',
                'color': '#FF9800',
                'category': 'waste_collection',
                'rarity': 'rare',
                'points_required': 200,
                'conditions': {'total_waste_kg': 50}
            },
            {
                'name': 'Environmental Hero',
                'description': 'Collect 100kg of waste',
                'icon': '🦸',
                'color': '#9C27B0',
                'category': 'waste_collection',
                'rarity': 'epic',
                'points_required': 500,
                'conditions': {'total_waste_kg': 100}
            },
            {
                'name': 'Planet Saver',
                'description': 'Collect 500kg of waste',
                'icon': '🌍',
                'color': '#FFD700',
                'category': 'waste_collection',
                'rarity': 'legendary',
                'points_required': 2000,
                'conditions': {'total_waste_kg': 500}
            },
            {
                'name': 'Streak Master',
                'description': 'Maintain a 7-day activity streak',
                'icon': '🔥',
                'color': '#FF5722',
                'category': 'waste_collection',
                'rarity': 'uncommon',
                'points_required': 100,
                'conditions': {'streak_days': 7}
            },
            {
                'name': 'Consistency King',
                'description': 'Maintain a 30-day activity streak',
                'icon': '👑',
                'color': '#FFD700',
                'category': 'waste_collection',
                'rarity': 'epic',
                'points_required': 500,
                'conditions': {'streak_days': 30}
            },

            # Marketplace Badges
            {
                'name': 'First Purchase',
                'description': 'Make your first marketplace purchase',
                'icon': '🛒',
                'color': '#4CAF50',
                'category': 'marketplace',
                'rarity': 'common',
                'points_required': 0,
                'conditions': {'first_order': True}
            },
            {
                'name': 'Smart Shopper',
                'description': 'Place 5 orders',
                'icon': '🛍️',
                'color': '#2196F3',
                'category': 'marketplace',
                'rarity': 'uncommon',
                'points_required': 100,
                'conditions': {'order_count': 5}
            },
            {
                'name': 'Loyal Customer',
                'description': 'Place 20 orders',
                'icon': '💎',
                'color': '#9C27B0',
                'category': 'marketplace',
                'rarity': 'rare',
                'points_required': 400,
                'conditions': {'order_count': 20}
            },
            {
                'name': 'Big Spender',
                'description': 'Spend KSh 10,000 total',
                'icon': '💰',
                'color': '#FFD700',
                'category': 'marketplace',
                'rarity': 'epic',
                'points_required': 800,
                'conditions': {'total_spent': 10000}
            },

            # Community Badges
            {
                'name': 'Community Member',
                'description': 'Attend your first community event',
                'icon': '🤝',
                'color': '#4CAF50',
                'category': 'community',
                'rarity': 'common',
                'points_required': 0,
                'conditions': {'events_attended': 1}
            },
            {
                'name': 'Active Participant',
                'description': 'Attend 5 community events',
                'icon': '🎯',
                'color': '#2196F3',
                'category': 'community',
                'rarity': 'uncommon',
                'points_required': 150,
                'conditions': {'events_attended': 5}
            },
            {
                'name': 'Community Leader',
                'description': 'Attend 15 community events',
                'icon': '🌟',
                'color': '#FF9800',
                'category': 'community',
                'rarity': 'rare',
                'points_required': 500,
                'conditions': {'events_attended': 15}
            },
            {
                'name': 'Referral Master',
                'description': 'Refer 5 new users',
                'icon': '📢',
                'color': '#9C27B0',
                'category': 'community',
                'rarity': 'epic',
                'points_required': 300,
                'conditions': {'referrals': 5}
            },

            # Environmental Impact Badges
            {
                'name': 'Carbon Saver',
                'description': 'Save 25kg of CO2 equivalent',
                'icon': '🌿',
                'color': '#4CAF50',
                'category': 'environmental',
                'rarity': 'uncommon',
                'points_required': 100,
                'conditions': {'co2_saved_kg': 25}
            },
            {
                'name': 'Climate Warrior',
                'description': 'Save 100kg of CO2 equivalent',
                'icon': '🌍',
                'color': '#2196F3',
                'category': 'environmental',
                'rarity': 'rare',
                'points_required': 400,
                'conditions': {'co2_saved_kg': 100}
            },
            {
                'name': 'Earth Guardian',
                'description': 'Save 250kg of CO2 equivalent',
                'icon': '🛡️',
                'color': '#FFD700',
                'category': 'environmental',
                'rarity': 'legendary',
                'points_required': 1000,
                'conditions': {'co2_saved_kg': 250}
            },

            # Milestone Badges
            {
                'name': 'Rising Star',
                'description': 'Reach level 5',
                'icon': '⭐',
                'color': '#FF9800',
                'category': 'milestone',
                'rarity': 'uncommon',
                'points_required': 0,
                'conditions': {'level': 5}
            },
            {
                'name': 'Experienced User',
                'description': 'Reach level 10',
                'icon': '🎖️',
                'color': '#9C27B0',
                'category': 'milestone',
                'rarity': 'rare',
                'points_required': 0,
                'conditions': {'level': 10}
            },
            {
                'name': 'Master User',
                'description': 'Reach level 20',
                'icon': '🏅',
                'color': '#FFD700',
                'category': 'milestone',
                'rarity': 'epic',
                'points_required': 0,
                'conditions': {'level': 20}
            },
            {
                'name': 'Legend',
                'description': 'Reach level 50',
                'icon': '👑',
                'color': '#FFD700',
                'category': 'milestone',
                'rarity': 'legendary',
                'points_required': 0,
                'conditions': {'level': 50}
            },
            {
                'name': 'Point Collector',
                'description': 'Earn 1,000 total points',
                'icon': '💯',
                'color': '#2196F3',
                'category': 'milestone',
                'rarity': 'uncommon',
                'points_required': 0,
                'conditions': {'total_points': 1000}
            },
            {
                'name': 'Point Master',
                'description': 'Earn 5,000 total points',
                'icon': '🎯',
                'color': '#9C27B0',
                'category': 'milestone',
                'rarity': 'rare',
                'points_required': 0,
                'conditions': {'total_points': 5000}
            },
            {
                'name': 'Point Legend',
                'description': 'Earn 10,000 total points',
                'icon': '🏆',
                'color': '#FFD700',
                'category': 'milestone',
                'rarity': 'legendary',
                'points_required': 0,
                'conditions': {'total_points': 10000}
            },
        ]

        created_count = 0
        updated_count = 0

        for badge_data in badges_data:
            badge, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults=badge_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created badge: {badge.name}')
                )
            else:
                # Update existing badge
                for key, value in badge_data.items():
                    if key != 'name':
                        setattr(badge, key, value)
                badge.save()
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Updated badge: {badge.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Badge setup completed!'
                f'\n📊 Created: {created_count} badges'
                f'\n🔄 Updated: {updated_count} badges'
                f'\n📈 Total badges: {Badge.objects.count()}'
            )
        )
