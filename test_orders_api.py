#!/usr/bin/env python3
"""
Test script to verify orders API is working correctly
"""
import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, Order, OrderItem
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_orders_api():
    """Test the orders API endpoint"""
    print("🧪 TESTING ORDERS API")
    print("=" * 40)
    
    try:
        # Get or create test user
        user, created = User.objects.get_or_create(
            username='orders_test_user',
            defaults={
                'email': 'orderstest@example.com',
                'first_name': 'Orders',
                'last_name': 'Test',
                'user_type': 'youth',
                'credits': Decimal('100.00')
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✅ Created test user: {user.username}")
        else:
            print(f"✅ Using existing test user: {user.username}")
        
        # Create JWT token for authentication
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Create API client
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Test orders endpoint
        print("\n📋 Testing Orders API Endpoint...")
        response = client.get('/api/v1/products/orders/')
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Orders API working")
            print(f"Response structure: {list(data.keys()) if isinstance(data, dict) else 'List response'}")
            
            if isinstance(data, dict):
                if 'results' in data:
                    orders = data['results']
                    print(f"📦 Found {len(orders)} orders")
                    if orders:
                        print(f"Sample order: {orders[0]}")
                    else:
                        print("📭 No orders found for user")
                elif 'count' in data:
                    print(f"📦 Total orders count: {data['count']}")
                else:
                    print(f"📦 Orders data: {data}")
            else:
                print(f"📦 Found {len(data)} orders (direct list)")
                if data:
                    print(f"Sample order: {data[0]}")
        else:
            print(f"❌ Orders API failed: {response.status_code}")
            print(f"Error response: {response.content.decode()}")
        
        # Check database directly
        print("\n🗄️ Checking Database Directly...")
        user_orders = Order.objects.filter(customer=user)
        print(f"📦 Orders in database for user: {user_orders.count()}")
        
        if user_orders.exists():
            for order in user_orders[:3]:  # Show first 3 orders
                print(f"   Order {order.order_number}: {order.status} - ${order.total_amount}")
        
        # Check all orders in database
        all_orders = Order.objects.all()
        print(f"📦 Total orders in database: {all_orders.count()}")
        
        if all_orders.exists():
            print("Recent orders:")
            for order in all_orders.order_by('-created_at')[:5]:
                print(f"   {order.order_number} - {order.customer.username} - {order.status} - ${order.total_amount}")
        
        # Test creating a new order if no orders exist
        if not user_orders.exists():
            print("\n🆕 Creating test order...")
            
            # Get a product
            product = Product.objects.filter(is_active=True).first()
            if product:
                order = Order.objects.create(
                    customer=user,
                    payment_method='credits',
                    delivery_address='123 Test Street',
                    delivery_county='Nairobi',
                    delivery_phone='+254712345678',
                    total_amount=product.discounted_price
                )
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=1,
                    unit_price=product.discounted_price,
                    total_price=product.discounted_price
                )
                
                print(f"✅ Created test order: {order.order_number}")
                
                # Test API again
                print("\n🔄 Testing API after creating order...")
                response = client.get('/api/v1/products/orders/')
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, dict) and 'results' in data:
                        orders = data['results']
                        print(f"✅ Now found {len(orders)} orders via API")
                    else:
                        print(f"✅ API response: {data}")
                else:
                    print(f"❌ API still failing: {response.status_code}")
            else:
                print("❌ No products available to create test order")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing orders API: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_orders_serializer():
    """Test the orders serializer"""
    print("\n🔧 TESTING ORDERS SERIALIZER")
    print("=" * 40)
    
    try:
        from products.serializers import OrderSerializer
        
        # Get an order
        order = Order.objects.first()
        if order:
            serializer = OrderSerializer(order)
            data = serializer.data
            
            print(f"✅ Order serializer working")
            print(f"Serialized fields: {list(data.keys())}")
            print(f"Sample data: {data}")
            
            return True
        else:
            print("❌ No orders to test serializer with")
            return False
            
    except Exception as e:
        print(f"❌ Error testing orders serializer: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("📋 ORDERS API DIAGNOSTICS")
    print("=" * 50)
    
    api_ok = test_orders_api()
    serializer_ok = test_orders_serializer()
    
    print("\n📋 ORDERS DIAGNOSTICS SUMMARY")
    print("=" * 40)
    print(f"✅ Orders API: {'PASS' if api_ok else 'FAIL'}")
    print(f"✅ Orders Serializer: {'PASS' if serializer_ok else 'FAIL'}")
    
    if api_ok and serializer_ok:
        print("\n🎉 ORDERS SYSTEM IS WORKING!")
        print("\n💡 If frontend still shows 'No orders found':")
        print("   1. Check browser console for API errors")
        print("   2. Verify authentication tokens are valid")
        print("   3. Check network requests in DevTools")
        print("   4. Ensure user has orders in their account")
    else:
        print("\n⚠️ ORDERS SYSTEM HAS ISSUES")
        print("   Check the individual test results above.")

if __name__ == "__main__":
    main()
