from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from django.contrib.auth import get_user_model
from decimal import Decimal

from analytics.models import (
    PlatformMetrics,
    UserEngagementMetrics,
    EnvironmentalImpactMetrics,
    CountyMetrics
)
from waste_collection.models import WasteReport, CreditTransaction, CollectionEvent, EventParticipation
from products.models import Product, Order, SMEVendor
from authentication.models import User

User = get_user_model()


class Command(BaseCommand):
    help = 'Aggregate daily analytics data for platform metrics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Date to aggregate (YYYY-MM-DD). Defaults to yesterday.',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-aggregation even if data exists',
        )

    def handle(self, *args, **options):
        # Determine the date to aggregate
        if options['date']:
            try:
                target_date = datetime.strptime(options['date'], '%Y-%m-%d').date()
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Invalid date format. Use YYYY-MM-DD.')
                )
                return
        else:
            # Default to yesterday
            target_date = (timezone.now() - timedelta(days=1)).date()

        self.stdout.write(f'Aggregating analytics data for {target_date}')

        # Check if data already exists
        if not options['force']:
            if PlatformMetrics.objects.filter(date=target_date).exists():
                self.stdout.write(
                    self.style.WARNING(f'Data for {target_date} already exists. Use --force to re-aggregate.')
                )
                return

        try:
            # Aggregate platform metrics
            self.aggregate_platform_metrics(target_date)
            
            # Aggregate user engagement metrics
            self.aggregate_user_engagement_metrics(target_date)
            
            # Aggregate environmental impact metrics
            self.aggregate_environmental_impact_metrics(target_date)
            
            # Aggregate county metrics
            self.aggregate_county_metrics(target_date)

            self.stdout.write(
                self.style.SUCCESS(f'Successfully aggregated analytics data for {target_date}')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error aggregating data: {str(e)}')
            )
            raise

    def aggregate_platform_metrics(self, target_date):
        """Aggregate platform-wide metrics for the given date"""
        self.stdout.write('Aggregating platform metrics...')

        # Date ranges
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        # Make timezone aware
        start_of_day = timezone.make_aware(start_of_day)
        end_of_day = timezone.make_aware(end_of_day)

        # User metrics
        total_users = User.objects.count()
        new_users_today = User.objects.filter(
            date_joined__range=[start_of_day, end_of_day]
        ).count()
        
        # Active users (users who logged in today)
        # Note: This would require session tracking or login logging
        active_users_today = 0  # Placeholder - implement based on your auth system
        
        youth_users = User.objects.filter(
            date_of_birth__isnull=False
        ).extra(
            where=["EXTRACT(year FROM age(date_of_birth)) BETWEEN 18 AND 35"]
        ).count()
        
        sme_vendors = SMEVendor.objects.count()
        verified_vendors = SMEVendor.objects.filter(is_verified=True).count()

        # Waste collection metrics
        total_waste_reports = WasteReport.objects.count()
        waste_reports_today = WasteReport.objects.filter(
            created_at__range=[start_of_day, end_of_day]
        ).count()

        # Total waste collected (all time)
        total_waste_collected = WasteReport.objects.filter(
            status='collected',
            actual_weight_kg__isnull=False
        ).aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        # Waste collected today
        waste_collected_today = WasteReport.objects.filter(
            collected_at__range=[start_of_day, end_of_day],
            status='collected',
            actual_weight_kg__isnull=False
        ).aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        # Credits metrics
        total_credits_earned = CreditTransaction.objects.filter(
            transaction_type='earned'
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        credits_earned_today = CreditTransaction.objects.filter(
            created_at__range=[start_of_day, end_of_day],
            transaction_type='earned'
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # CO2 reduction metrics
        total_co2_reduction = WasteReport.objects.filter(
            status='collected'
        ).aggregate(
            total=Sum('actual_co2_reduction')
        )['total'] or Decimal('0.00')

        co2_reduction_today = WasteReport.objects.filter(
            collected_at__range=[start_of_day, end_of_day],
            status='collected'
        ).aggregate(
            total=Sum('actual_co2_reduction')
        )['total'] or Decimal('0.00')

        # Product marketplace metrics
        total_products = Product.objects.filter(is_active=True).count()
        products_added_today = Product.objects.filter(
            created_at__range=[start_of_day, end_of_day]
        ).count()

        total_orders = Order.objects.count()
        orders_today = Order.objects.filter(
            created_at__range=[start_of_day, end_of_day]
        ).count()

        # Sales metrics
        total_sales = Order.objects.filter(
            status__in=['completed', 'delivered']
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')

        sales_today = Order.objects.filter(
            created_at__range=[start_of_day, end_of_day],
            status__in=['completed', 'delivered']
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')

        # Credits spent
        total_credits_spent = CreditTransaction.objects.filter(
            transaction_type='spent'
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        credits_spent_today = CreditTransaction.objects.filter(
            created_at__range=[start_of_day, end_of_day],
            transaction_type='spent'
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Event metrics
        total_collection_events = CollectionEvent.objects.count()
        events_today = CollectionEvent.objects.filter(
            created_at__range=[start_of_day, end_of_day]
        ).count()

        total_event_participants = EventParticipation.objects.count()
        event_participants_today = EventParticipation.objects.filter(
            joined_at__range=[start_of_day, end_of_day]
        ).count()

        # Create or update platform metrics
        platform_metrics, created = PlatformMetrics.objects.update_or_create(
            date=target_date,
            defaults={
                'total_users': total_users,
                'new_users_today': new_users_today,
                'active_users_today': active_users_today,
                'youth_users': youth_users,
                'sme_vendors': sme_vendors,
                'verified_vendors': verified_vendors,
                'total_waste_reports': total_waste_reports,
                'waste_reports_today': waste_reports_today,
                'total_waste_collected_kg': total_waste_collected,
                'waste_collected_today_kg': waste_collected_today,
                'total_credits_earned': total_credits_earned,
                'credits_earned_today': credits_earned_today,
                'total_co2_reduction_kg': total_co2_reduction,
                'co2_reduction_today_kg': co2_reduction_today,
                'total_products': total_products,
                'products_added_today': products_added_today,
                'total_orders': total_orders,
                'orders_today': orders_today,
                'total_sales_ksh': total_sales,
                'sales_today_ksh': sales_today,
                'total_credits_spent': total_credits_spent,
                'credits_spent_today': credits_spent_today,
                'total_collection_events': total_collection_events,
                'events_today': events_today,
                'total_event_participants': total_event_participants,
                'event_participants_today': event_participants_today,
            }
        )

        action = 'Created' if created else 'Updated'
        self.stdout.write(f'{action} platform metrics for {target_date}')

    def aggregate_user_engagement_metrics(self, target_date):
        """Aggregate user engagement metrics for active users on the given date"""
        self.stdout.write('Aggregating user engagement metrics...')

        # Date ranges
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        # Make timezone aware
        start_of_day = timezone.make_aware(start_of_day)
        end_of_day = timezone.make_aware(end_of_day)

        # Get users who had activity on this date
        active_users = User.objects.filter(
            Q(wastereport__created_at__range=[start_of_day, end_of_day]) |
            Q(order__created_at__range=[start_of_day, end_of_day]) |
            Q(credittransaction__created_at__range=[start_of_day, end_of_day])
        ).distinct()

        for user in active_users:
            # Waste collection engagement
            waste_reports_submitted = WasteReport.objects.filter(
                reporter=user,
                created_at__range=[start_of_day, end_of_day]
            ).count()

            waste_collected = WasteReport.objects.filter(
                reporter=user,
                collected_at__range=[start_of_day, end_of_day],
                status='collected',
                actual_weight_kg__isnull=False
            ).aggregate(
                total=Sum('actual_weight_kg')
            )['total'] or Decimal('0.00')

            credits_earned = CreditTransaction.objects.filter(
                user=user,
                created_at__range=[start_of_day, end_of_day],
                transaction_type='earned'
            ).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')

            events_joined = EventParticipation.objects.filter(
                user=user,
                joined_at__range=[start_of_day, end_of_day]
            ).count()

            # Marketplace engagement
            orders_placed = Order.objects.filter(
                user=user,
                created_at__range=[start_of_day, end_of_day]
            ).count()

            credits_spent = CreditTransaction.objects.filter(
                user=user,
                created_at__range=[start_of_day, end_of_day],
                transaction_type='spent'
            ).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')

            money_spent = Order.objects.filter(
                user=user,
                created_at__range=[start_of_day, end_of_day]
            ).aggregate(
                total=Sum('total_amount')
            )['total'] or Decimal('0.00')

            # Create user engagement metrics
            UserEngagementMetrics.objects.update_or_create(
                user=user,
                date=target_date,
                defaults={
                    'login_count': 1,  # Placeholder - implement based on your auth system
                    'session_duration_minutes': 0,  # Placeholder
                    'pages_visited': 0,  # Placeholder
                    'waste_reports_submitted': waste_reports_submitted,
                    'waste_collected_kg': waste_collected,
                    'credits_earned': credits_earned,
                    'events_joined': events_joined,
                    'products_viewed': 0,  # Placeholder
                    'products_added_to_cart': 0,  # Placeholder
                    'orders_placed': orders_placed,
                    'credits_spent': credits_spent,
                    'money_spent_ksh': money_spent,
                    'reviews_written': 0,  # Placeholder
                }
            )

        self.stdout.write(f'Aggregated engagement metrics for {active_users.count()} users')

    def aggregate_environmental_impact_metrics(self, target_date):
        """Aggregate environmental impact metrics for the given date"""
        self.stdout.write('Aggregating environmental impact metrics...')

        # Date ranges
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        # Make timezone aware
        start_of_day = timezone.make_aware(start_of_day)
        end_of_day = timezone.make_aware(end_of_day)

        # Get waste reports collected on this date
        collected_reports = WasteReport.objects.filter(
            collected_at__range=[start_of_day, end_of_day],
            status='collected',
            actual_weight_kg__isnull=False
        )

        # Calculate totals by category
        total_waste_diverted = collected_reports.aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        # Waste by category (simplified - you might want to join with WasteCategory)
        plastic_recycled = collected_reports.filter(
            category__category_type='plastic'
        ).aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        paper_recycled = collected_reports.filter(
            category__category_type='paper'
        ).aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        metal_recycled = collected_reports.filter(
            category__category_type='metal'
        ).aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        glass_recycled = collected_reports.filter(
            category__category_type='glass'
        ).aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        organic_composted = collected_reports.filter(
            category__category_type='organic'
        ).aggregate(
            total=Sum('actual_weight_kg')
        )['total'] or Decimal('0.00')

        # CO2 reduction
        co2_reduction = collected_reports.aggregate(
            total=Sum('actual_co2_reduction')
        )['total'] or Decimal('0.00')

        # Calculate equivalent trees planted (1 tree = ~22 kg CO2 per year)
        co2_equivalent_trees = co2_reduction / Decimal('22') if co2_reduction > 0 else Decimal('0.00')

        # Simplified calculations for energy and water savings
        # These would be based on waste type and recycling factors
        energy_saved_kwh = total_waste_diverted * Decimal('2.5')  # Simplified factor
        water_saved_liters = total_waste_diverted * Decimal('15')  # Simplified factor
        landfill_space_saved_m3 = total_waste_diverted * Decimal('0.001')  # Simplified factor

        # Economic impact (simplified)
        economic_value = total_waste_diverted * Decimal('50')  # KSh per kg
        jobs_supported = total_waste_diverted / Decimal('1000')  # 1 job per 1000 kg

        # Create environmental impact metrics
        EnvironmentalImpactMetrics.objects.update_or_create(
            date=target_date,
            defaults={
                'total_waste_diverted_kg': total_waste_diverted,
                'plastic_recycled_kg': plastic_recycled,
                'paper_recycled_kg': paper_recycled,
                'metal_recycled_kg': metal_recycled,
                'glass_recycled_kg': glass_recycled,
                'organic_composted_kg': organic_composted,
                'co2_reduction_kg': co2_reduction,
                'co2_equivalent_trees_planted': co2_equivalent_trees,
                'energy_saved_kwh': energy_saved_kwh,
                'water_saved_liters': water_saved_liters,
                'landfill_space_saved_m3': landfill_space_saved_m3,
                'economic_value_ksh': economic_value,
                'jobs_supported': jobs_supported,
            }
        )

        self.stdout.write(f'Aggregated environmental impact metrics for {target_date}')

    def aggregate_county_metrics(self, target_date):
        """Aggregate county-specific metrics for the given date"""
        self.stdout.write('Aggregating county metrics...')

        # Date ranges
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        # Make timezone aware
        start_of_day = timezone.make_aware(start_of_day)
        end_of_day = timezone.make_aware(end_of_day)

        # Get all counties with activity
        counties = WasteReport.objects.values_list('county', flat=True).distinct()

        for county in counties:
            if not county:
                continue

            # User metrics by county
            total_users = User.objects.filter(county=county).count()
            active_users = User.objects.filter(
                county=county,
                wastereport__created_at__range=[start_of_day, end_of_day]
            ).distinct().count()

            sme_vendors = SMEVendor.objects.filter(county=county).count()

            # Waste collection by county
            waste_reports = WasteReport.objects.filter(
                county=county,
                created_at__range=[start_of_day, end_of_day]
            ).count()

            waste_collected = WasteReport.objects.filter(
                county=county,
                collected_at__range=[start_of_day, end_of_day],
                status='collected',
                actual_weight_kg__isnull=False
            ).aggregate(
                total=Sum('actual_weight_kg')
            )['total'] or Decimal('0.00')

            credits_earned = CreditTransaction.objects.filter(
                user__county=county,
                created_at__range=[start_of_day, end_of_day],
                transaction_type='earned'
            ).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')

            co2_reduction = WasteReport.objects.filter(
                county=county,
                collected_at__range=[start_of_day, end_of_day],
                status='collected'
            ).aggregate(
                total=Sum('actual_co2_reduction')
            )['total'] or Decimal('0.00')

            # Marketplace activity by county
            products_listed = Product.objects.filter(
                vendor__county=county
            ).count()

            orders_placed = Order.objects.filter(
                user__county=county,
                created_at__range=[start_of_day, end_of_day]
            ).count()

            sales = Order.objects.filter(
                user__county=county,
                created_at__range=[start_of_day, end_of_day],
                status__in=['completed', 'delivered']
            ).aggregate(
                total=Sum('total_amount')
            )['total'] or Decimal('0.00')

            credits_spent = CreditTransaction.objects.filter(
                user__county=county,
                created_at__range=[start_of_day, end_of_day],
                transaction_type='spent'
            ).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')

            # Collection events by county
            collection_events = CollectionEvent.objects.filter(
                county=county,
                created_at__range=[start_of_day, end_of_day]
            ).count()

            event_participants = EventParticipation.objects.filter(
                event__county=county,
                joined_at__range=[start_of_day, end_of_day]
            ).count()

            # Create county metrics
            CountyMetrics.objects.update_or_create(
                county=county,
                date=target_date,
                defaults={
                    'total_users': total_users,
                    'active_users': active_users,
                    'sme_vendors': sme_vendors,
                    'waste_reports': waste_reports,
                    'waste_collected_kg': waste_collected,
                    'credits_earned': credits_earned,
                    'co2_reduction_kg': co2_reduction,
                    'products_listed': products_listed,
                    'orders_placed': orders_placed,
                    'sales_ksh': sales,
                    'credits_spent': credits_spent,
                    'collection_events': collection_events,
                    'event_participants': event_participants,
                }
            )

        self.stdout.write(f'Aggregated county metrics for {len(counties)} counties')

    def get_user_county(self, user):
        """Get user's county - implement based on your User model structure"""
        # This is a placeholder - implement based on your actual User model
        return getattr(user, 'county', 'Unknown')
