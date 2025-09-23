from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from decimal import Decimal
from .models import WasteCategory, CollectionPoint, WasteReport, CreditTransaction
from datetime import date

User = get_user_model()


class WasteCategoryModelTest(TestCase):
    """Test cases for WasteCategory model"""

    def setUp(self):
        self.category = WasteCategory.objects.create(
            name="Plastic Bottles",
            description="PET plastic bottles",
            credit_rate=Decimal('2.50'),
            co2_reduction_rate=Decimal('0.75'),
            is_active=True
        )

    def test_waste_category_creation(self):
        """Test creating a waste category"""
        self.assertEqual(self.category.name, "Plastic Bottles")
        self.assertEqual(self.category.credit_rate, Decimal('2.50'))
        self.assertTrue(self.category.is_active)

    def test_waste_category_str(self):
        """Test string representation"""
        self.assertEqual(str(self.category), "Plastic Bottles")


class CollectionPointModelTest(TestCase):
    """Test cases for CollectionPoint model"""

    def setUp(self):
        self.collection_point = CollectionPoint.objects.create(
            name="Kisumu Central Collection Point",
            address="Tom Mboya Street, Kisumu",
            latitude=Decimal('-0.0917'),
            longitude=Decimal('34.7680'),
            is_active=True
        )

    def test_collection_point_creation(self):
        """Test creating a collection point"""
        self.assertEqual(self.collection_point.name, "Kisumu Central Collection Point")
        self.assertEqual(self.collection_point.latitude, Decimal('-0.0917'))
        self.assertTrue(self.collection_point.is_active)

    def test_collection_point_str(self):
        """Test string representation"""
        self.assertEqual(str(self.collection_point), "Kisumu Central Collection Point")


class WasteReportModelTest(TestCase):
    """Test cases for WasteReport model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
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

    def test_waste_report_creation(self):
        """Test creating a waste report"""
        report = WasteReport.objects.create(
            user=self.user,
            category=self.category,
            collection_point=self.collection_point,
            weight_kg=Decimal('5.0'),
            description="5kg of plastic bottles collected",
            status='pending'
        )
        self.assertEqual(report.user, self.user)
        self.assertEqual(report.weight_kg, Decimal('5.0'))
        self.assertEqual(report.status, 'pending')

    def test_waste_report_credits_calculation(self):
        """Test credits calculation based on weight and category rate"""
        report = WasteReport.objects.create(
            user=self.user,
            category=self.category,
            collection_point=self.collection_point,
            weight_kg=Decimal('5.0'),
            status='approved'
        )
        expected_credits = Decimal('5.0') * self.category.credit_rate
        self.assertEqual(report.credits_earned, expected_credits)


class CreditTransactionModelTest(TestCase):
    """Test cases for CreditTransaction model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_credit_transaction_creation(self):
        """Test creating a credit transaction"""
        transaction = CreditTransaction.objects.create(
            user=self.user,
            amount=Decimal('10.50'),
            transaction_type='earned',
            description='Credits earned from waste collection'
        )
        self.assertEqual(transaction.user, self.user)
        self.assertEqual(transaction.amount, Decimal('10.50'))
        self.assertEqual(transaction.transaction_type, 'earned')


class WasteCollectionAPITest(APITestCase):
    """Test cases for waste collection API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = WasteCategory.objects.create(
            name="Plastic Bottles",
            credit_rate=Decimal('2.50')
        )
        self.collection_point = CollectionPoint.objects.create(
            name="Test Collection Point",
            latitude=Decimal('-0.0917'),
            longitude=Decimal('34.7680')
        )

        # Authenticate user
        self.client.force_authenticate(user=self.user)

    def test_create_waste_report(self):
        """Test creating a waste report via API"""
        url = reverse('waste_collection:waste-reports-list')
        data = {
            'category': self.category.id,
            'collection_point': self.collection_point.id,
            'weight_kg': '3.5',
            'description': 'Test waste report'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(WasteReport.objects.filter(user=self.user).exists())

    def test_list_waste_categories(self):
        """Test listing waste categories"""
        url = reverse('waste_collection:waste-categories-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_list_collection_points(self):
        """Test listing collection points"""
        url = reverse('waste_collection:collection-points-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
