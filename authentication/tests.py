from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import date, timedelta
import json

User = get_user_model()


class UserModelTest(TestCase):
    """Test cases for the custom User model"""

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+254712345678',
            'date_of_birth': date(2000, 1, 1),
            'gender': 'male',
            'county': 'Kisumu',
            'sub_county': 'Kisumu Central',
            'education_level': 'secondary',
            'employment_status': 'unemployed',
        }

    def test_create_user(self):
        """Test creating a user with valid data"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.county, 'Kisumu')

    def test_user_age_calculation(self):
        """Test age calculation property"""
        user = User.objects.create_user(**self.user_data)
        expected_age = (date.today() - user.date_of_birth).days // 365
        self.assertEqual(user.age, expected_age)

    def test_is_youth_property(self):
        """Test youth eligibility check"""
        # Test youth user (age 25)
        youth_data = self.user_data.copy()
        youth_data['date_of_birth'] = date.today() - timedelta(days=25*365)
        youth_user = User.objects.create_user(**youth_data)
        self.assertTrue(youth_user.is_youth)

        # Test non-youth user (age 40)
        old_data = self.user_data.copy()
        old_data['username'] = 'olduser'
        old_data['email'] = 'old@example.com'
        old_data['date_of_birth'] = date.today() - timedelta(days=40*365)
        old_user = User.objects.create_user(**old_data)
        self.assertFalse(old_user.is_youth)

    def test_user_str_method(self):
        """Test string representation of user"""
        user = User.objects.create_user(**self.user_data)
        expected_str = f"{user.first_name} {user.last_name} ({user.username})"
        self.assertEqual(str(user), expected_str)


class AuthenticationAPITest(APITestCase):
    """Test cases for authentication API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('authentication:register')
        self.login_url = reverse('authentication:login')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+254712345678',
            'date_of_birth': '2000-01-01',
            'gender': 'male',
            'county': 'Kisumu',
            'sub_county': 'Kisumu Central',
            'education_level': 'secondary',
            'employment_status': 'unemployed',
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_user_registration_password_mismatch(self):
        """Test registration with password mismatch"""
        data = self.user_data.copy()
        data['password_confirm'] = 'differentpass'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        User.objects.create_user(username='testuser', email='existing@example.com')
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful user login"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpass'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
