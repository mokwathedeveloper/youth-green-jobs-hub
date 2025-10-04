#!/usr/bin/env python3
"""
Script to test frontend-backend integration for cart and order functionality
"""
import os
import sys
import django
import requests
import json
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, ShoppingCart, CartItem, Order, OrderItem
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# API Configuration
API_BASE_URL = "https://youth-green-jobs-hub.onrender.com/api/v1"
FRONTEND_URL = "https://frontend-three-ashy-66.vercel.app"

def get_test_user_token():
    """Get or create a test user and return JWT token"""
    try:
        # Get or create test user
        user, created = User.objects.get_or_create(
            username='frontend_test_user',
            defaults={
                'email': 'frontendtest@example.com',
                'first_name': 'Frontend',
                'last_name': 'Test',
                'user_type': 'youth',
                'is_active': True
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✅ Created test user: {user.username}")
        else:
            print(f"✅ Using existing test user: {user.username}")
        
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        return access_token, user
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return None, None

def test_api_endpoints(token):
    """Test API endpoints that frontend uses"""
    print("\n🔍 TESTING API ENDPOINTS")
    print("=" * 40)
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    results = {}
    
    # Test 1: Get Products
    try:
        response = requests.get(f"{API_BASE_URL}/products/products/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET /products/products/ - {data.get('count', 0)} products")
            results['get_products'] = True
        else:
            print(f"❌ GET /products/products/ - Status: {response.status_code}")
            results['get_products'] = False
    except Exception as e:
        print(f"❌ GET /products/products/ - Error: {e}")
        results['get_products'] = False
    
    # Test 2: Get Cart
    try:
        response = requests.get(f"{API_BASE_URL}/products/cart/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET /products/cart/ - {len(data.get('items', []))} items")
            results['get_cart'] = True
        else:
            print(f"❌ GET /products/cart/ - Status: {response.status_code}")
            results['get_cart'] = False
    except Exception as e:
        print(f"❌ GET /products/cart/ - Error: {e}")
        results['get_cart'] = False
    
    # Test 3: Add to Cart
    try:
        # Get a product first
        products_response = requests.get(f"{API_BASE_URL}/products/products/", headers=headers, timeout=10)
        if products_response.status_code == 200:
            products = products_response.json().get('results', [])
            if products:
                product_id = products[0]['id']
                
                cart_data = {
                    'product_id': product_id,
                    'quantity': 1
                }
                
                response = requests.post(
                    f"{API_BASE_URL}/products/cart/add/", 
                    headers=headers, 
                    json=cart_data,
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    print(f"✅ POST /products/cart/add/ - Added product to cart")
                    results['add_to_cart'] = True
                else:
                    print(f"❌ POST /products/cart/add/ - Status: {response.status_code}")
                    print(f"   Response: {response.text}")
                    results['add_to_cart'] = False
            else:
                print(f"❌ POST /products/cart/add/ - No products available")
                results['add_to_cart'] = False
        else:
            print(f"❌ POST /products/cart/add/ - Could not get products")
            results['add_to_cart'] = False
    except Exception as e:
        print(f"❌ POST /products/cart/add/ - Error: {e}")
        results['add_to_cart'] = False
    
    # Test 4: Create Order
    try:
        # Get cart first
        cart_response = requests.get(f"{API_BASE_URL}/products/cart/", headers=headers, timeout=10)
        if cart_response.status_code == 200:
            cart_data = cart_response.json()
            cart_items = cart_data.get('items', [])
            
            if cart_items:
                order_data = {
                    'payment_method': 'credits',
                    'delivery_address': '123 Frontend Test Street, Nairobi',
                    'delivery_county': 'Nairobi',
                    'delivery_phone': '+254712345678',
                    'items': [
                        {
                            'product_id': item['product']['id'],
                            'quantity': item['quantity']
                        } for item in cart_items
                    ]
                }
                
                response = requests.post(
                    f"{API_BASE_URL}/products/orders/create/", 
                    headers=headers, 
                    json=order_data,
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    order = response.json()
                    print(f"✅ POST /products/orders/create/ - Order: {order.get('order_number')}")
                    results['create_order'] = True
                else:
                    print(f"❌ POST /products/orders/create/ - Status: {response.status_code}")
                    print(f"   Response: {response.text}")
                    results['create_order'] = False
            else:
                print(f"❌ POST /products/orders/create/ - No items in cart")
                results['create_order'] = False
        else:
            print(f"❌ POST /products/orders/create/ - Could not get cart")
            results['create_order'] = False
    except Exception as e:
        print(f"❌ POST /products/orders/create/ - Error: {e}")
        results['create_order'] = False
    
    return results

def test_frontend_accessibility():
    """Test if frontend pages are accessible"""
    print("\n🌐 TESTING FRONTEND ACCESSIBILITY")
    print("=" * 40)
    
    pages_to_test = [
        f"{FRONTEND_URL}/dashboard/products",
        f"{FRONTEND_URL}/dashboard/cart",
        f"{FRONTEND_URL}/dashboard/orders"
    ]
    
    results = {}
    
    for page_url in pages_to_test:
        try:
            response = requests.get(page_url, timeout=10)
            page_name = page_url.split('/')[-1]
            
            if response.status_code == 200:
                print(f"✅ {page_name} page - Accessible")
                results[page_name] = True
            else:
                print(f"❌ {page_name} page - Status: {response.status_code}")
                results[page_name] = False
        except Exception as e:
            page_name = page_url.split('/')[-1]
            print(f"❌ {page_name} page - Error: {e}")
            results[page_name] = False
    
    return results

def check_database_state():
    """Check current database state"""
    print("\n📊 CHECKING DATABASE STATE")
    print("=" * 40)
    
    try:
        # Check products
        products_count = Product.objects.filter(is_active=True).count()
        print(f"✅ Active Products: {products_count}")
        
        # Check orders
        orders_count = Order.objects.count()
        print(f"✅ Total Orders: {orders_count}")
        
        # Check recent orders
        recent_orders = Order.objects.order_by('-created_at')[:3]
        for order in recent_orders:
            print(f"   📦 {order.order_number} - {order.status} - ${order.total_amount}")
        
        # Check carts
        carts_count = ShoppingCart.objects.count()
        print(f"✅ Shopping Carts: {carts_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database check error: {e}")
        return False

def provide_debugging_info():
    """Provide debugging information for frontend developers"""
    print("\n🔧 DEBUGGING INFORMATION FOR FRONTEND")
    print("=" * 50)
    
    print("📋 API Endpoints to check:")
    print(f"   • Products: {API_BASE_URL}/products/products/")
    print(f"   • Cart: {API_BASE_URL}/products/cart/")
    print(f"   • Add to Cart: {API_BASE_URL}/products/cart/add/")
    print(f"   • Create Order: {API_BASE_URL}/products/orders/create/")
    
    print("\n🔑 Authentication:")
    print("   • Make sure JWT tokens are being sent in Authorization header")
    print("   • Format: 'Bearer <token>'")
    print("   • Check token expiration and refresh logic")
    
    print("\n📝 Request Format for Add to Cart:")
    print("   POST /products/cart/add/")
    print("   {")
    print('     "product_id": "uuid-string",')
    print('     "quantity": 1')
    print("   }")
    
    print("\n📝 Request Format for Create Order:")
    print("   POST /products/orders/create/")
    print("   {")
    print('     "payment_method": "credits",')
    print('     "delivery_address": "123 Street",')
    print('     "delivery_county": "Nairobi",')
    print('     "delivery_phone": "+254712345678",')
    print('     "items": [')
    print('       {')
    print('         "product_id": "uuid-string",')
    print('         "quantity": 1')
    print('       }')
    print('     ]')
    print("   }")
    
    print("\n🐛 Common Issues to Check:")
    print("   • CORS headers in browser DevTools")
    print("   • Network tab for failed requests")
    print("   • Console errors in browser")
    print("   • Token storage in localStorage")
    print("   • API base URL configuration")

def main():
    print("🔍 YOUTH GREEN JOBS HUB - FRONTEND-BACKEND INTEGRATION TEST")
    print("=" * 65)
    
    # Get test user and token
    token, user = get_test_user_token()
    if not token:
        print("❌ Could not get authentication token")
        return
    
    # Run tests
    db_ok = check_database_state()
    api_results = test_api_endpoints(token)
    frontend_results = test_frontend_accessibility()
    
    # Summary
    print("\n📋 INTEGRATION TEST SUMMARY")
    print("=" * 40)
    print(f"✅ Database State: {'PASS' if db_ok else 'FAIL'}")
    print(f"✅ Get Products: {'PASS' if api_results.get('get_products') else 'FAIL'}")
    print(f"✅ Get Cart: {'PASS' if api_results.get('get_cart') else 'FAIL'}")
    print(f"✅ Add to Cart: {'PASS' if api_results.get('add_to_cart') else 'FAIL'}")
    print(f"✅ Create Order: {'PASS' if api_results.get('create_order') else 'FAIL'}")
    print(f"✅ Frontend Pages: {'PASS' if all(frontend_results.values()) else 'FAIL'}")
    
    # Overall status
    all_passed = (
        db_ok and 
        all(api_results.values()) and 
        all(frontend_results.values())
    )
    
    if all_passed:
        print("\n🎉 ALL INTEGRATION TESTS PASSED!")
        print("   The frontend should be working correctly now.")
    else:
        print("\n⚠️ SOME INTEGRATION TESTS FAILED")
        print("   Check the individual test results above.")
    
    # Provide debugging info
    provide_debugging_info()

if __name__ == "__main__":
    main()
