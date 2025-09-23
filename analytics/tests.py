from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from decimal import Decimal
from .models import PlatformMetrics, UserEngagementMetrics, EnvironmentalImpactMetrics
from waste_collection.models import WasteCategory, WasteReport, CollectionPoint
from products.models import SMEVendor, Product, Order
from datetime import date, timedelta

User = get_user_model()


class PlatformMetricsModelTest(TestCase):
    """Test cases for PlatformMetrics model"""

    def setUp(self):
        self.metrics = PlatformMetrics.objects.create(
            date=date.today(),
            total_users=100,
            active_users=75,
            new_registrations=10,
            total_waste_reports=50,
            approved_waste_reports=45,
            total_products=25,
            total_orders=15,
            total_revenue=Decimal('1500.00'),
            county="Kisumu"
        )

    def test_platform_metrics_creation(self):
        """Test creating platform metrics"""
        self.assertEqual(self.metrics.total_users, 100)
        self.assertEqual(self.metrics.active_users, 75)
        self.assertEqual(self.metrics.county, "Kisumu")
        self.assertEqual(self.metrics.total_revenue, Decimal('1500.00'))

    def test_platform_metrics_str(self):
        """Test string representation"""
        expected_str = f"Platform Metrics - {self.metrics.date} ({self.metrics.county})"
        self.assertEqual(str(self.metrics), expected_str)


class UserEngagementMetricsModelTest(TestCase):
    """Test cases for UserEngagementMetrics model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.engagement = UserEngagementMetrics.objects.create(
            user=self.user,
            date=date.today(),
            login_count=5,
            waste_reports_submitted=3,
            products_viewed=10,
            orders_placed=2,
            time_spent_minutes=120
        )

    def test_user_engagement_creation(self):
        """Test creating user engagement metrics"""
        self.assertEqual(self.engagement.user, self.user)
        self.assertEqual(self.engagement.login_count, 5)
        self.assertEqual(self.engagement.waste_reports_submitted, 3)
        self.assertEqual(self.engagement.time_spent_minutes, 120)

    def test_user_engagement_str(self):
        """Test string representation"""
        expected_str = f"{self.user.username} - {self.engagement.date}"
        self.assertEqual(str(self.engagement), expected_str)


class EnvironmentalImpactMetricsModelTest(TestCase):
    """Test cases for EnvironmentalImpactMetrics model"""

    def setUp(self):
        self.impact = EnvironmentalImpactMetrics.objects.create(
            date=date.today(),
            total_waste_collected_kg=Decimal('500.50'),
            co2_reduction_kg=Decimal('250.25'),
            trees_equivalent=10,
            landfill_diversion_kg=Decimal('450.00'),
            recycling_rate_percentage=Decimal('85.50'),
            county="Kisumu"
        )

    def test_environmental_impact_creation(self):
        """Test creating environmental impact metrics"""
        self.assertEqual(self.impact.total_waste_collected_kg, Decimal('500.50'))
        self.assertEqual(self.impact.co2_reduction_kg, Decimal('250.25'))
        self.assertEqual(self.impact.trees_equivalent, 10)
        self.assertEqual(self.impact.county, "Kisumu")

    def test_environmental_impact_str(self):
        """Test string representation"""
        expected_str = f"Environmental Impact - {self.impact.date} ({self.impact.county})"
        self.assertEqual(str(self.impact), expected_str)


class AnalyticsAPITest(APITestCase):
    """Test cases for analytics API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            is_staff=True  # Admin user for analytics access
        )

        # Create test data
        self.platform_metrics = PlatformMetrics.objects.create(
            date=date.today(),
            total_users=100,
            active_users=75,
            county="Kisumu"
        )

        self.environmental_impact = EnvironmentalImpactMetrics.objects.create(
            date=date.today(),
            total_waste_collected_kg=Decimal('500.50'),
            co2_reduction_kg=Decimal('250.25'),
            county="Kisumu"
        )

        # Authenticate user
        self.client.force_authenticate(user=self.user)

    def test_get_platform_metrics(self):
        """Test getting platform metrics"""
        url = reverse('analytics:platform-metrics-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_environmental_impact(self):
        """Test getting environmental impact metrics"""
        url = reverse('analytics:environmental-impact-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_analytics_dashboard_summary(self):
        """Test analytics dashboard summary endpoint"""
        url = reverse('analytics:dashboard-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('total_waste_collected', response.data)
        self.assertIn('co2_reduction', response.data)


class AnalyticsCalculationTest(TestCase):
    """Test cases for analytics calculations and aggregations"""

    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )

        # Create waste category and collection point
        self.category = WasteCategory.objects.create(
            name="Plastic Bottles",
            credit_rate=Decimal('2.50'),
            co2_reduction_rate=Decimal('0.75')
        )
        self.collection_point = CollectionPoint.objects.create(
            name="Test Collection Point",
            latitude=Decimal('-0.0917'),
            longitude=Decimal('34.7680')
        )

        # Create waste reports
        WasteReport.objects.create(
            user=self.user1,
            category=self.category,
            collection_point=self.collection_point,
            weight_kg=Decimal('10.0'),
            status='approved'
        )
        WasteReport.objects.create(
            user=self.user2,
            category=self.category,
            collection_point=self.collection_point,
            weight_kg=Decimal('15.0'),
            status='approved'
        )

    def test_total_waste_calculation(self):
        """Test calculation of total waste collected"""
        total_waste = WasteReport.objects.filter(status='approved').aggregate(
            total=models.Sum('weight_kg')
        )['total']
        self.assertEqual(total_waste, Decimal('25.0'))

    def test_co2_reduction_calculation(self):
        """Test calculation of CO2 reduction"""
        reports = WasteReport.objects.filter(status='approved')
        total_co2_reduction = sum(
            report.weight_kg * report.category.co2_reduction_rate
            for report in reports
        )
        expected_co2 = (Decimal('10.0') + Decimal('15.0')) * Decimal('0.75')
        self.assertEqual(total_co2_reduction, expected_co2)
