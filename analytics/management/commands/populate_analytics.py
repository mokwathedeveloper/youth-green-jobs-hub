from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date
from analytics.models import PlatformMetrics, UserEngagementMetrics, EnvironmentalImpactMetrics, CountyMetrics
from authentication.models import User
from waste_collection.models import WasteReport
from products.models import Product, Order
from dateutil.relativedelta import relativedelta

class Command(BaseCommand):
    help = 'Populates the analytics models with the latest data.'

    def handle(self, *args, **options):
        self.stdout.write('Starting analytics population...')
        today = timezone.now().date()

        self.populate_platform_metrics(today)
        self.populate_user_engagement_metrics(today)
        self.populate_environmental_impact_metrics(today)
        self.populate_county_metrics(today)

        self.stdout.write(self.style.SUCCESS('Successfully populated analytics models.'))

    def populate_platform_metrics(self, today):
        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__date=today).count()
        active_users_today = User.objects.filter(last_login__date=today).count()
        min_age, max_age = (18, 35)
        min_birth_date = today - relativedelta(years=max_age)
        max_birth_date = today - relativedelta(years=min_age)
        youth_users = User.objects.filter(date_of_birth__gte=min_birth_date, date_of_birth__lte=max_birth_date).count()
        sme_vendors = User.objects.filter(user_type='sme').count()
        verified_vendors = User.objects.filter(user_type='sme', is_verified=True).count()

        total_waste_reports = WasteReport.objects.count()
        waste_reports_today = WasteReport.objects.filter(reported_at__date=today).count()
        total_waste_collected_kg = WasteReport.objects.aggregate(models.Sum('actual_weight'))['actual_weight__sum'] or 0
        waste_collected_today_kg = WasteReport.objects.filter(reported_at__date=today).aggregate(models.Sum('actual_weight'))['actual_weight__sum'] or 0

        total_products = Product.objects.count()
        products_added_today = Product.objects.filter(created_at__date=today).count()
        total_orders = Order.objects.count()
        orders_today = Order.objects.filter(created_at__date=today).count()
        total_sales_ksh = Order.objects.aggregate(models.Sum('total_amount'))['total_amount__sum'] or 0
        sales_today_ksh = Order.objects.filter(created_at__date=today).aggregate(models.Sum('total_amount'))['total_amount__sum'] or 0

        PlatformMetrics.objects.update_or_create(
            date=today,
            defaults={
                'total_users': total_users,
                'new_users_today': new_users_today,
                'active_users_today': active_users_today,
                'youth_users': youth_users,
                'sme_vendors': sme_vendors,
                'verified_vendors': verified_vendors,
                'total_waste_reports': total_waste_reports,
                'waste_reports_today': waste_reports_today,
                'total_waste_collected_kg': total_waste_collected_kg,
                'waste_collected_today_kg': waste_collected_today_kg,
                'total_products': total_products,
                'products_added_today': products_added_today,
                'total_orders': total_orders,
                'orders_today': orders_today,
                'total_sales_ksh': total_sales_ksh,
                'sales_today_ksh': sales_today_ksh,
            }
        )

    def populate_user_engagement_metrics(self, today):
        for user in User.objects.all():
            login_count = 0 # This would need to be tracked elsewhere
            session_duration_minutes = 0 # This would need to be tracked elsewhere
            pages_visited = 0 # This would need to be tracked elsewhere
            waste_reports_submitted = WasteReport.objects.filter(reporter=user, reported_at__date=today).count()
            waste_collected_kg = WasteReport.objects.filter(reporter=user, reported_at__date=today).aggregate(models.Sum('actual_weight'))['actual_weight__sum'] or 0
            credits_earned = 0 # This would need to be calculated
            events_joined = 0 # This would need to be calculated
            products_viewed = 0 # This would need to be tracked elsewhere
            products_added_to_cart = 0 # This would need to be tracked elsewhere
            orders_placed = Order.objects.filter(customer=user, created_at__date=today).count()
            credits_spent = 0 # This would need to be calculated
            money_spent_ksh = Order.objects.filter(customer=user, created_at__date=today).aggregate(models.Sum('total_amount'))['total_amount__sum'] or 0
            reviews_written = 0 # This would need to be calculated

            UserEngagementMetrics.objects.update_or_create(
                user=user,
                date=today,
                defaults={
                    'login_count': login_count,
                    'session_duration_minutes': session_duration_minutes,
                    'pages_visited': pages_visited,
                    'waste_reports_submitted': waste_reports_submitted,
                    'waste_collected_kg': waste_collected_kg,
                    'credits_earned': credits_earned,
                    'events_joined': events_joined,
                    'products_viewed': products_viewed,
                    'products_added_to_cart': products_added_to_cart,
                    'orders_placed': orders_placed,
                    'credits_spent': credits_spent,
                    'money_spent_ksh': money_spent_ksh,
                    'reviews_written': reviews_written,
                }
            )

    def populate_environmental_impact_metrics(self, today):
        # This would require more complex calculations based on waste types, etc.
        pass

    def populate_county_metrics(self, today):
        for county in User.objects.values_list('county', flat=True).distinct():
            if not county: continue
            total_users = User.objects.filter(county=county).count()
            active_users = User.objects.filter(county=county, last_login__date=today).count()
            sme_vendors = User.objects.filter(county=county, user_type='sme').count()
            waste_reports = WasteReport.objects.filter(reporter__county=county).count()
            waste_collected_kg = WasteReport.objects.filter(reporter__county=county).aggregate(models.Sum('actual_weight'))['actual_weight__sum'] or 0
            credits_earned = 0 # This would need to be calculated
            co2_reduction_kg = 0 # This would need to be calculated
            products_listed = Product.objects.filter(vendor__county=county).count()
            orders_placed = Order.objects.filter(customer__county=county, created_at__date=today).count()
            sales_ksh = Order.objects.filter(customer__county=county, created_at__date=today).aggregate(models.Sum('total_amount'))['total_amount__sum'] or 0
            credits_spent = 0 # This would need to be calculated
            collection_events = 0 # This would need to be calculated
            event_participants = 0 # This would need to be calculated

            CountyMetrics.objects.update_or_create(
                county=county,
                date=today,
                defaults={
                    'total_users': total_users,
                    'active_users': active_users,
                    'sme_vendors': sme_vendors,
                    'waste_reports': waste_reports,
                    'waste_collected_kg': waste_collected_kg,
                    'credits_earned': credits_earned,
                    'co2_reduction_kg': co2_reduction_kg,
                    'products_listed': products_listed,
                    'orders_placed': orders_placed,
                    'sales_ksh': sales_ksh,
                    'credits_spent': credits_spent,
                    'collection_events': collection_events,
                    'event_participants': event_participants,
                }
            )
