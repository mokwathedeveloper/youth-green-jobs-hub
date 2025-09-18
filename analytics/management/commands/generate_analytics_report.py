import csv
import json
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q, Max
from django.contrib.auth import get_user_model
from decimal import Decimal

from analytics.models import (
    PlatformMetrics,
    UserEngagementMetrics,
    EnvironmentalImpactMetrics,
    CountyMetrics,
    SystemPerformanceMetrics
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate comprehensive analytics reports'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start-date',
            type=str,
            help='Start date for report (YYYY-MM-DD)',
        )
        parser.add_argument(
            '--end-date',
            type=str,
            help='End date for report (YYYY-MM-DD)',
        )
        parser.add_argument(
            '--format',
            choices=['json', 'csv', 'summary'],
            default='summary',
            help='Output format (default: summary)',
        )
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path (optional)',
        )
        parser.add_argument(
            '--report-type',
            choices=['platform', 'environmental', 'county', 'performance', 'all'],
            default='all',
            help='Type of report to generate (default: all)',
        )

    def handle(self, *args, **options):
        # Parse dates
        if options['start_date']:
            try:
                start_date = datetime.strptime(options['start_date'], '%Y-%m-%d').date()
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Invalid start date format. Use YYYY-MM-DD.')
                )
                return
        else:
            # Default to last 30 days
            start_date = (timezone.now() - timedelta(days=30)).date()

        if options['end_date']:
            try:
                end_date = datetime.strptime(options['end_date'], '%Y-%m-%d').date()
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Invalid end date format. Use YYYY-MM-DD.')
                )
                return
        else:
            end_date = timezone.now().date()

        if start_date > end_date:
            self.stdout.write(
                self.style.ERROR('Start date cannot be after end date.')
            )
            return

        self.stdout.write(f'Generating analytics report from {start_date} to {end_date}')

        # Generate report data
        report_data = {}
        
        if options['report_type'] in ['platform', 'all']:
            report_data['platform'] = self.generate_platform_report(start_date, end_date)
            
        if options['report_type'] in ['environmental', 'all']:
            report_data['environmental'] = self.generate_environmental_report(start_date, end_date)
            
        if options['report_type'] in ['county', 'all']:
            report_data['county'] = self.generate_county_report(start_date, end_date)
            
        if options['report_type'] in ['performance', 'all']:
            report_data['performance'] = self.generate_performance_report(start_date, end_date)

        # Output report
        output_format = options['format']
        output_file = options['output']

        if output_format == 'json':
            self.output_json_report(report_data, output_file)
        elif output_format == 'csv':
            self.output_csv_report(report_data, output_file, start_date, end_date)
        else:
            self.output_summary_report(report_data, start_date, end_date)

        self.stdout.write(
            self.style.SUCCESS('Analytics report generated successfully!')
        )

    def generate_platform_report(self, start_date, end_date):
        """Generate platform metrics report"""
        metrics = PlatformMetrics.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')

        if not metrics.exists():
            return {'error': 'No platform metrics found for the specified date range'}

        # Aggregate totals
        totals = metrics.aggregate(
            total_new_users=Sum('new_users_today'),
            total_waste_collected=Sum('waste_collected_today_kg'),
            total_credits_earned=Sum('credits_earned_today'),
            total_orders=Sum('orders_today'),
            total_sales=Sum('sales_today_ksh'),
            total_co2_reduction=Sum('co2_reduction_today_kg'),
            avg_active_users=Avg('active_users_today'),
        )

        # Latest metrics
        latest = metrics.last()

        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': (end_date - start_date).days + 1
            },
            'totals': {
                'new_users': totals['total_new_users'] or 0,
                'waste_collected_kg': float(totals['total_waste_collected'] or 0),
                'credits_earned': float(totals['total_credits_earned'] or 0),
                'orders_placed': totals['total_orders'] or 0,
                'sales_ksh': float(totals['total_sales'] or 0),
                'co2_reduction_kg': float(totals['total_co2_reduction'] or 0),
                'avg_daily_active_users': float(totals['avg_active_users'] or 0),
            },
            'current_status': {
                'total_users': latest.total_users,
                'total_waste_collected_kg': float(latest.total_waste_collected_kg),
                'total_credits_earned': float(latest.total_credits_earned),
                'total_products': latest.total_products,
                'sme_vendors': latest.sme_vendors,
                'verified_vendors': latest.verified_vendors,
            },
            'daily_metrics': [
                {
                    'date': metric.date.isoformat(),
                    'new_users': metric.new_users_today,
                    'waste_collected_kg': float(metric.waste_collected_today_kg),
                    'credits_earned': float(metric.credits_earned_today),
                    'orders': metric.orders_today,
                    'sales_ksh': float(metric.sales_today_ksh),
                }
                for metric in metrics
            ]
        }

    def generate_environmental_report(self, start_date, end_date):
        """Generate environmental impact report"""
        metrics = EnvironmentalImpactMetrics.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')

        if not metrics.exists():
            return {'error': 'No environmental metrics found for the specified date range'}

        # Aggregate totals
        totals = metrics.aggregate(
            total_waste_diverted=Sum('total_waste_diverted_kg'),
            total_plastic_recycled=Sum('plastic_recycled_kg'),
            total_paper_recycled=Sum('paper_recycled_kg'),
            total_metal_recycled=Sum('metal_recycled_kg'),
            total_glass_recycled=Sum('glass_recycled_kg'),
            total_organic_composted=Sum('organic_composted_kg'),
            total_co2_reduction=Sum('co2_reduction_kg'),
            total_trees_equivalent=Sum('co2_equivalent_trees_planted'),
            total_energy_saved=Sum('energy_saved_kwh'),
            total_water_saved=Sum('water_saved_liters'),
            total_economic_value=Sum('economic_value_ksh'),
        )

        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': (end_date - start_date).days + 1
            },
            'environmental_impact': {
                'waste_diverted_kg': float(totals['total_waste_diverted'] or 0),
                'co2_reduction_kg': float(totals['total_co2_reduction'] or 0),
                'trees_equivalent': float(totals['total_trees_equivalent'] or 0),
                'energy_saved_kwh': float(totals['total_energy_saved'] or 0),
                'water_saved_liters': float(totals['total_water_saved'] or 0),
                'economic_value_ksh': float(totals['total_economic_value'] or 0),
            },
            'waste_breakdown': {
                'plastic_recycled_kg': float(totals['total_plastic_recycled'] or 0),
                'paper_recycled_kg': float(totals['total_paper_recycled'] or 0),
                'metal_recycled_kg': float(totals['total_metal_recycled'] or 0),
                'glass_recycled_kg': float(totals['total_glass_recycled'] or 0),
                'organic_composted_kg': float(totals['total_organic_composted'] or 0),
            },
            'daily_impact': [
                {
                    'date': metric.date.isoformat(),
                    'waste_diverted_kg': float(metric.total_waste_diverted_kg),
                    'co2_reduction_kg': float(metric.co2_reduction_kg),
                    'economic_value_ksh': float(metric.economic_value_ksh),
                }
                for metric in metrics
            ]
        }

    def generate_county_report(self, start_date, end_date):
        """Generate county performance report"""
        metrics = CountyMetrics.objects.filter(
            date__range=[start_date, end_date]
        ).values('county').annotate(
            total_waste_collected=Sum('waste_collected_kg'),
            total_credits_earned=Sum('credits_earned'),
            total_co2_reduction=Sum('co2_reduction_kg'),
            total_sales=Sum('sales_ksh'),
            avg_users=Avg('total_users'),
            total_events=Sum('collection_events'),
        ).order_by('-total_waste_collected')

        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': (end_date - start_date).days + 1
            },
            'county_rankings': [
                {
                    'county': metric['county'],
                    'waste_collected_kg': float(metric['total_waste_collected'] or 0),
                    'credits_earned': float(metric['total_credits_earned'] or 0),
                    'co2_reduction_kg': float(metric['total_co2_reduction'] or 0),
                    'sales_ksh': float(metric['total_sales'] or 0),
                    'avg_users': float(metric['avg_users'] or 0),
                    'collection_events': metric['total_events'] or 0,
                }
                for metric in metrics
            ]
        }

    def generate_performance_report(self, start_date, end_date):
        """Generate system performance report"""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Make timezone aware
        start_datetime = timezone.make_aware(start_datetime)
        end_datetime = timezone.make_aware(end_datetime)

        metrics = SystemPerformanceMetrics.objects.filter(
            timestamp__range=[start_datetime, end_datetime]
        )

        if not metrics.exists():
            return {'error': 'No performance metrics found for the specified date range'}

        # Calculate averages
        averages = metrics.aggregate(
            avg_api_response_time=Avg('api_response_time_ms'),
            avg_cpu_usage=Avg('cpu_usage_percent'),
            avg_memory_usage=Avg('memory_usage_percent'),
            avg_disk_usage=Avg('disk_usage_percent'),
            avg_concurrent_users=Avg('concurrent_users'),
            max_api_response_time=Max('api_response_time_ms'),
            max_cpu_usage=Max('cpu_usage_percent'),
        )

        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'total_measurements': metrics.count()
            },
            'performance_averages': {
                'api_response_time_ms': float(averages['avg_api_response_time'] or 0),
                'cpu_usage_percent': float(averages['avg_cpu_usage'] or 0),
                'memory_usage_percent': float(averages['avg_memory_usage'] or 0),
                'disk_usage_percent': float(averages['avg_disk_usage'] or 0),
                'concurrent_users': float(averages['avg_concurrent_users'] or 0),
            },
            'performance_peaks': {
                'max_api_response_time_ms': averages['max_api_response_time'] or 0,
                'max_cpu_usage_percent': float(averages['max_cpu_usage'] or 0),
            }
        }

    def output_json_report(self, report_data, output_file):
        """Output report in JSON format"""
        json_data = json.dumps(report_data, indent=2, default=str)
        
        if output_file:
            with open(output_file, 'w') as f:
                f.write(json_data)
            self.stdout.write(f'JSON report saved to {output_file}')
        else:
            self.stdout.write(json_data)

    def output_csv_report(self, report_data, output_file, start_date, end_date):
        """Output report in CSV format"""
        if not output_file:
            output_file = f'analytics_report_{start_date}_{end_date}.csv'

        with open(output_file, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            
            # Platform metrics
            if 'platform' in report_data and 'daily_metrics' in report_data['platform']:
                writer.writerow(['Platform Metrics'])
                writer.writerow(['Date', 'New Users', 'Waste Collected (kg)', 'Credits Earned', 'Orders', 'Sales (KSh)'])
                for metric in report_data['platform']['daily_metrics']:
                    writer.writerow([
                        metric['date'],
                        metric['new_users'],
                        metric['waste_collected_kg'],
                        metric['credits_earned'],
                        metric['orders'],
                        metric['sales_ksh']
                    ])
                writer.writerow([])  # Empty row

            # County rankings
            if 'county' in report_data and 'county_rankings' in report_data['county']:
                writer.writerow(['County Rankings'])
                writer.writerow(['County', 'Waste Collected (kg)', 'Credits Earned', 'CO2 Reduction (kg)', 'Sales (KSh)'])
                for county in report_data['county']['county_rankings']:
                    writer.writerow([
                        county['county'],
                        county['waste_collected_kg'],
                        county['credits_earned'],
                        county['co2_reduction_kg'],
                        county['sales_ksh']
                    ])

        self.stdout.write(f'CSV report saved to {output_file}')

    def output_summary_report(self, report_data, start_date, end_date):
        """Output summary report to console"""
        self.stdout.write('\n' + '='*60)
        self.stdout.write(f'ANALYTICS REPORT: {start_date} to {end_date}')
        self.stdout.write('='*60)

        # Platform summary
        if 'platform' in report_data and 'totals' in report_data['platform']:
            platform = report_data['platform']
            self.stdout.write('\nPLATFORM METRICS:')
            self.stdout.write(f'  New Users: {platform["totals"]["new_users"]:,}')
            self.stdout.write(f'  Waste Collected: {platform["totals"]["waste_collected_kg"]:,.1f} kg')
            self.stdout.write(f'  Credits Earned: {platform["totals"]["credits_earned"]:,.0f}')
            self.stdout.write(f'  Orders Placed: {platform["totals"]["orders_placed"]:,}')
            self.stdout.write(f'  Sales: KSh {platform["totals"]["sales_ksh"]:,.2f}')
            self.stdout.write(f'  CO2 Reduction: {platform["totals"]["co2_reduction_kg"]:,.1f} kg')

        # Environmental summary
        if 'environmental' in report_data and 'environmental_impact' in report_data['environmental']:
            env = report_data['environmental']['environmental_impact']
            self.stdout.write('\nENVIRONMENTAL IMPACT:')
            self.stdout.write(f'  Waste Diverted: {env["waste_diverted_kg"]:,.1f} kg')
            self.stdout.write(f'  CO2 Reduction: {env["co2_reduction_kg"]:,.1f} kg')
            self.stdout.write(f'  Trees Equivalent: {env["trees_equivalent"]:,.0f}')
            self.stdout.write(f'  Energy Saved: {env["energy_saved_kwh"]:,.0f} kWh')
            self.stdout.write(f'  Economic Value: KSh {env["economic_value_ksh"]:,.2f}')

        # Top counties
        if 'county' in report_data and 'county_rankings' in report_data['county']:
            counties = report_data['county']['county_rankings'][:5]
            self.stdout.write('\nTOP 5 COUNTIES:')
            for i, county in enumerate(counties, 1):
                self.stdout.write(
                    f'  {i}. {county["county"]}: {county["waste_collected_kg"]:,.1f} kg waste'
                )

        self.stdout.write('\n' + '='*60)
