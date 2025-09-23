from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from decimal import Decimal
from .models import SMEVendor, Product, Order, ShoppingCart, PaymentTransaction
from datetime import date

User = get_user_model()


class SMEVendorModelTest(TestCase):
    """Test cases for SMEVendor model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='vendor1',
            email='vendor@example.com',
            password='testpass123'
        )
        self.vendor = SMEVendor.objects.create(
            user=self.user,
            business_name="Green Products Kenya",
            business_description="Eco-friendly products for sustainable living",
            business_registration_number="BN123456",
            phone_number="+254712345678",
            county="Kisumu",
            is_verified=True
        )

    def test_sme_vendor_creation(self):
        """Test creating an SME vendor"""
        self.assertEqual(self.vendor.business_name, "Green Products Kenya")
        self.assertEqual(self.vendor.user, self.user)
        self.assertTrue(self.vendor.is_verified)

    def test_sme_vendor_str(self):
        """Test string representation"""
        expected_str = f"{self.vendor.business_name} ({self.vendor.user.username})"
        self.assertEqual(str(self.vendor), expected_str)


class ProductModelTest(TestCase):
    """Test cases for Product model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='vendor1',
            email='vendor@example.com',
            password='testpass123'
        )
        self.vendor = SMEVendor.objects.create(
            user=self.user,
            business_name="Green Products Kenya",
            is_verified=True
        )
        self.product = Product.objects.create(
            vendor=self.vendor,
            name="Eco-friendly Water Bottle",
            description="Reusable water bottle made from recycled materials",
            price=Decimal('15.99'),
            category="household",
            stock_quantity=50,
            is_active=True
        )

    def test_product_creation(self):
        """Test creating a product"""
        self.assertEqual(self.product.name, "Eco-friendly Water Bottle")
        self.assertEqual(self.product.price, Decimal('15.99'))
        self.assertEqual(self.product.vendor, self.vendor)
        self.assertTrue(self.product.is_active)

    def test_product_str(self):
        """Test string representation"""
        expected_str = f"{self.product.name} - KES {self.product.price}"
        self.assertEqual(str(self.product), expected_str)

    def test_product_in_stock(self):
        """Test stock availability check"""
        self.assertTrue(self.product.in_stock)

        # Test out of stock
        self.product.stock_quantity = 0
        self.product.save()
        self.assertFalse(self.product.in_stock)


class ShoppingCartModelTest(TestCase):
    """Test cases for ShoppingCart model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='customer1',
            email='customer@example.com',
            password='testpass123'
        )
        self.vendor_user = User.objects.create_user(
            username='vendor1',
            email='vendor@example.com',
            password='testpass123'
        )
        self.vendor = SMEVendor.objects.create(
            user=self.vendor_user,
            business_name="Green Products Kenya",
            is_verified=True
        )
        self.product = Product.objects.create(
            vendor=self.vendor,
            name="Eco-friendly Water Bottle",
            price=Decimal('15.99'),
            stock_quantity=50
        )

    def test_shopping_cart_creation(self):
        """Test creating a shopping cart item"""
        cart_item = ShoppingCart.objects.create(
            user=self.user,
            product=self.product,
            quantity=2
        )
        self.assertEqual(cart_item.user, self.user)
        self.assertEqual(cart_item.product, self.product)
        self.assertEqual(cart_item.quantity, 2)

    def test_cart_item_total_price(self):
        """Test total price calculation for cart item"""
        cart_item = ShoppingCart.objects.create(
            user=self.user,
            product=self.product,
            quantity=3
        )
        expected_total = self.product.price * 3
        self.assertEqual(cart_item.total_price, expected_total)


class OrderModelTest(TestCase):
    """Test cases for Order model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='customer1',
            email='customer@example.com',
            password='testpass123'
        )
        self.vendor_user = User.objects.create_user(
            username='vendor1',
            email='vendor@example.com',
            password='testpass123'
        )
        self.vendor = SMEVendor.objects.create(
            user=self.vendor_user,
            business_name="Green Products Kenya",
            is_verified=True
        )
        self.product = Product.objects.create(
            vendor=self.vendor,
            name="Eco-friendly Water Bottle",
            price=Decimal('15.99'),
            stock_quantity=50
        )

    def test_order_creation(self):
        """Test creating an order"""
        order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('31.98'),
            status='pending',
            delivery_address="123 Main St, Kisumu",
            delivery_phone="+254712345678"
        )
        order.products.add(self.product)

        self.assertEqual(order.user, self.user)
        self.assertEqual(order.total_amount, Decimal('31.98'))
        self.assertEqual(order.status, 'pending')
        self.assertIn(self.product, order.products.all())


class ProductAPITest(APITestCase):
    """Test cases for product API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='customer1',
            email='customer@example.com',
            password='testpass123'
        )
        self.vendor_user = User.objects.create_user(
            username='vendor1',
            email='vendor@example.com',
            password='testpass123'
        )
        self.vendor = SMEVendor.objects.create(
            user=self.vendor_user,
            business_name="Green Products Kenya",
            is_verified=True
        )
        self.product = Product.objects.create(
            vendor=self.vendor,
            name="Eco-friendly Water Bottle",
            price=Decimal('15.99'),
            stock_quantity=50,
            is_active=True
        )

        # Authenticate user
        self.client.force_authenticate(user=self.user)

    def test_list_products(self):
        """Test listing products"""
        url = reverse('products:products-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_product_detail(self):
        """Test getting product details"""
        url = reverse('products:products-detail', kwargs={'pk': self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Eco-friendly Water Bottle")

    def test_add_to_cart(self):
        """Test adding product to shopping cart"""
        url = reverse('products:cart-list')
        data = {
            'product': self.product.id,
            'quantity': 2
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ShoppingCart.objects.filter(user=self.user, product=self.product).exists())
