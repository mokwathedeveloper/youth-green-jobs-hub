import psutil
import time
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import connection
from django.contrib.auth import get_user_model
from decimal import Decimal

from analytics.models import SystemPerformanceMetrics, DashboardAlert

User = get_user_model()


class Command(BaseCommand):
    help = 'Monitor system performance and create alerts for issues'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=300,  # 5 minutes
            help='Monitoring interval in seconds (default: 300)',
        )
        parser.add_argument(
            '--once',
            action='store_true',
            help='Run once instead of continuously',
        )

    def handle(self, *args, **options):
        interval = options['interval']
        run_once = options['once']

        self.stdout.write(f'Starting system performance monitoring...')
        
        if run_once:
            self.collect_metrics()
        else:
            self.stdout.write(f'Monitoring every {interval} seconds. Press Ctrl+C to stop.')
            try:
                while True:
                    self.collect_metrics()
                    time.sleep(interval)
            except KeyboardInterrupt:
                self.stdout.write('\nStopping system performance monitoring.')

    def collect_metrics(self):
        """Collect and store system performance metrics"""
        try:
            timestamp = timezone.now()
            
            # System resource metrics
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Database performance metrics
            db_metrics = self.get_database_metrics()
            
            # API performance metrics (simplified)
            api_metrics = self.get_api_metrics()
            
            # User activity metrics
            concurrent_users = self.get_concurrent_users()
            
            # Create performance metrics record
            metrics = SystemPerformanceMetrics.objects.create(
                timestamp=timestamp,
                api_response_time_ms=api_metrics['response_time'],
                api_requests_count=api_metrics['request_count'],
                api_error_rate=api_metrics['error_rate'],
                db_query_time_ms=db_metrics['query_time'],
                db_connections_active=db_metrics['connections'],
                cpu_usage_percent=Decimal(str(cpu_usage)),
                memory_usage_percent=Decimal(str(memory.percent)),
                disk_usage_percent=Decimal(str(disk.percent)),
                concurrent_users=concurrent_users,
                page_load_time_ms=api_metrics['page_load_time'],
                error_count=0,  # Placeholder
                warning_count=0,  # Placeholder
            )
            
            # Check for alerts
            self.check_performance_alerts(metrics)
            
            self.stdout.write(
                f'[{timestamp.strftime("%Y-%m-%d %H:%M:%S")}] '
                f'CPU: {cpu_usage:.1f}% | '
                f'Memory: {memory.percent:.1f}% | '
                f'Disk: {disk.percent:.1f}% | '
                f'Users: {concurrent_users}'
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error collecting metrics: {str(e)}')
            )

    def get_database_metrics(self):
        """Get database performance metrics"""
        try:
            # Measure query time
            start_time = time.time()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            query_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Get connection count (PostgreSQL specific)
            try:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT count(*) FROM pg_stat_activity WHERE state = 'active'"
                    )
                    active_connections = cursor.fetchone()[0]
            except Exception:
                # Fallback for non-PostgreSQL databases
                active_connections = 1
            
            return {
                'query_time': int(query_time),
                'connections': active_connections
            }
        except Exception as e:
            self.stdout.write(f'Database metrics error: {str(e)}')
            return {
                'query_time': 0,
                'connections': 0
            }

    def get_api_metrics(self):
        """Get API performance metrics (simplified)"""
        # This is a simplified implementation
        # In a real system, you'd integrate with your API monitoring
        return {
            'response_time': 150,  # Placeholder
            'request_count': 100,  # Placeholder
            'error_rate': Decimal('0.5'),  # Placeholder
            'page_load_time': 800,  # Placeholder
        }

    def get_concurrent_users(self):
        """Get count of concurrent active users"""
        # This is a simplified implementation
        # You'd implement based on your session management
        try:
            # Count users who have been active in the last 15 minutes
            from django.utils import timezone
            from datetime import timedelta
            
            cutoff_time = timezone.now() - timedelta(minutes=15)
            
            # This would need to be implemented based on your user activity tracking
            # For now, return a placeholder
            return 25  # Placeholder
            
        except Exception:
            return 0

    def check_performance_alerts(self, metrics):
        """Check performance metrics and create alerts if needed"""
        alerts_created = []
        
        # CPU usage alert
        if metrics.cpu_usage_percent > 80:
            alert = self.create_alert(
                title='High CPU Usage',
                message=f'CPU usage is at {metrics.cpu_usage_percent}%',
                alert_type='warning' if metrics.cpu_usage_percent < 90 else 'error',
                category='performance',
                alert_data={'cpu_usage': float(metrics.cpu_usage_percent)}
            )
            if alert:
                alerts_created.append('CPU')

        # Memory usage alert
        if metrics.memory_usage_percent > 80:
            alert = self.create_alert(
                title='High Memory Usage',
                message=f'Memory usage is at {metrics.memory_usage_percent}%',
                alert_type='warning' if metrics.memory_usage_percent < 90 else 'error',
                category='performance',
                alert_data={'memory_usage': float(metrics.memory_usage_percent)}
            )
            if alert:
                alerts_created.append('Memory')

        # Disk usage alert
        if metrics.disk_usage_percent > 85:
            alert = self.create_alert(
                title='High Disk Usage',
                message=f'Disk usage is at {metrics.disk_usage_percent}%',
                alert_type='warning' if metrics.disk_usage_percent < 95 else 'error',
                category='system',
                alert_data={'disk_usage': float(metrics.disk_usage_percent)}
            )
            if alert:
                alerts_created.append('Disk')

        # API response time alert
        if metrics.api_response_time_ms > 2000:
            alert = self.create_alert(
                title='Slow API Response',
                message=f'API response time is {metrics.api_response_time_ms}ms',
                alert_type='warning' if metrics.api_response_time_ms < 5000 else 'error',
                category='performance',
                alert_data={'response_time': metrics.api_response_time_ms}
            )
            if alert:
                alerts_created.append('API')

        # Database performance alert
        if metrics.db_query_time_ms > 1000:
            alert = self.create_alert(
                title='Slow Database Queries',
                message=f'Database query time is {metrics.db_query_time_ms}ms',
                alert_type='warning',
                category='performance',
                alert_data={'query_time': metrics.db_query_time_ms}
            )
            if alert:
                alerts_created.append('Database')

        if alerts_created:
            self.stdout.write(
                self.style.WARNING(f'Created alerts for: {", ".join(alerts_created)}')
            )

    def create_alert(self, title, message, alert_type, category, alert_data=None):
        """Create a dashboard alert if it doesn't already exist"""
        try:
            # Check if similar alert already exists and is active
            existing_alert = DashboardAlert.objects.filter(
                title=title,
                is_active=True,
                is_acknowledged=False
            ).first()
            
            if existing_alert:
                # Update existing alert with new data
                existing_alert.message = message
                existing_alert.alert_data = alert_data or {}
                existing_alert.save()
                return existing_alert
            else:
                # Create new alert
                alert = DashboardAlert.objects.create(
                    title=title,
                    message=message,
                    alert_type=alert_type,
                    category=category,
                    alert_data=alert_data or {}
                )
                return alert
                
        except Exception as e:
            self.stdout.write(f'Error creating alert: {str(e)}')
            return None

    def cleanup_old_metrics(self, days_to_keep=30):
        """Clean up old performance metrics"""
        try:
            cutoff_date = timezone.now() - timezone.timedelta(days=days_to_keep)
            deleted_count = SystemPerformanceMetrics.objects.filter(
                timestamp__lt=cutoff_date
            ).delete()[0]
            
            if deleted_count > 0:
                self.stdout.write(f'Cleaned up {deleted_count} old performance metrics')
                
        except Exception as e:
            self.stdout.write(f'Error cleaning up metrics: {str(e)}')
