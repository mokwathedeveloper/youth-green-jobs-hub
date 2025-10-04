#!/usr/bin/env python3
"""
Script to diagnose order placement functionality issues
"""
import os
import sys
import django
from decimal import Decimal
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, ShoppingCart, CartItem, Order, OrderItem
from django.test import RequestFactory
from products.views import OrderCreateView
from products.serializers import OrderCreateSerializer
from rest_framework.test import APIRequestFactory

User = get_user_model()

def check_order_models():
    """Check if order models are working properly"""
    print("🔍 CHECKING ORDER MODELS")
    print("=" * 40)
    
    # Check existing orders
    orders = Order.objects.all()
    print(f"✅ Existing Orders: {orders.count()}")
    
    if orders.exists():
        order = orders.first()
        print(f"   Sample Order: {order.order_number}")
        print(f"   Status: {order.status}")
        print(f"   Total: ${order.total_amount}")
        print(f"   Items: {order.items.count()}")
    
    # Check order items
    order_items = OrderItem.objects.all()
    print(f"✅ Order Items: {order_items.count()}")
    
    return orders.first() if orders.exists() else None

def test_order_creation():
    """Test creating an order"""
    print("\n📦 TESTING ORDER CREATION")
    print("=" * 40)
    
    # Get or create test user
    user, created = User.objects.get_or_create(
        username='test_order_user',
        defaults={
            'email': 'testorder@example.com',
            'first_name': 'Order',
            'last_name': 'Test',
            'user_type': 'youth'
        }
    )
    
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✅ Created test user: {user.username}")
    else:
        print(f"✅ Using existing test user: {user.username}")
    
    # Get products
    products = Product.objects.filter(is_active=True)[:2]
    if not products:
        print("❌ No active products found!")
        return False
    
    print(f"✅ Using products: {[p.name for p in products]}")
    
    # Test order creation via serializer
    try:
        order_data = {
            'payment_method': 'credits',
            'delivery_address': '123 Test Street, Nairobi',
            'delivery_county': 'Nairobi',
            'delivery_sub_county': 'Westlands',
            'delivery_phone': '+254712345678',
            'delivery_instructions': 'Test delivery',
            'customer_notes': 'Test order',
            'items': [
                {
                    'product_id': str(products[0].id),
                    'quantity': 2
                },
                {
                    'product_id': str(products[1].id),
                    'quantity': 1
                }
            ]
        }
        
        print(f"📋 Order data: {json.dumps(order_data, indent=2)}")
        
        # Test serializer validation
        serializer = OrderCreateSerializer(data=order_data)
        if serializer.is_valid():
            print("✅ Order data validation passed")
            
            # Create order manually
            items_data = serializer.validated_data.pop('items')
            order = Order.objects.create(
                customer=user,
                **serializer.validated_data
            )
            
            total_amount = Decimal('0.00')
            for item_data in items_data:
                product = Product.objects.get(id=item_data['product_id'])
                unit_price = product.discounted_price
                total_price = unit_price * item_data['quantity']
                total_amount += total_price
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    unit_price=unit_price,
                    total_price=total_price
                )
            
            order.total_amount = total_amount
            order.save()
            
            print(f"✅ Order created successfully!")
            print(f"   Order Number: {order.order_number}")
            print(f"   Total Amount: ${order.total_amount}")
            print(f"   Items Count: {order.items.count()}")
            
            return True
        else:
            print(f"❌ Order validation failed: {serializer.errors}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating order: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_order_api_view():
    """Test the order creation API view"""
    print("\n🌐 TESTING ORDER API VIEW")
    print("=" * 40)
    
    # Get test user and products
    user = User.objects.filter(username='test_order_user').first()
    products = Product.objects.filter(is_active=True)[:2]
    
    if not user or not products:
        print("❌ Missing test user or products")
        return False
    
    # Create API request
    factory = APIRequestFactory()
    
    order_data = {
        'payment_method': 'credits',
        'delivery_address': '456 API Test Street, Kisumu',
        'delivery_county': 'Kisumu',
        'delivery_phone': '+254723456789',
        'items': [
            {
                'product_id': str(products[0].id),
                'quantity': 1
            }
        ]
    }
    
    request = factory.post(
        '/api/v1/products/orders/create/',
        data=json.dumps(order_data),
        content_type='application/json'
    )
    request.user = user
    
    try:
        view = OrderCreateView.as_view()
        response = view(request)
        
        print(f"✅ API Response Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Order created via API successfully!")
            return True
        else:
            print(f"❌ API Error: Status {response.status_code}")
            # Try to get response data
            try:
                response.render()
                response_data = json.loads(response.content)
                print(f"   Response: {response_data}")
            except:
                print("   Could not parse response")
            return False
            
    except Exception as e:
        print(f"❌ Error testing API view: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_cart_to_order_flow():
    """Test creating order from cart"""
    print("\n🛒➡️📦 TESTING CART TO ORDER FLOW")
    print("=" * 40)
    
    # Get test user
    user = User.objects.filter(username='test_order_user').first()
    if not user:
        print("❌ No test user found")
        return False
    
    # Create cart with items
    cart, created = ShoppingCart.objects.get_or_create(customer=user)
    
    # Clear existing cart items
    cart.items.all().delete()
    
    # Add items to cart
    products = Product.objects.filter(is_active=True)[:2]
    for product in products:
        CartItem.objects.create(
            cart=cart,
            product=product,
            quantity=1
        )
    
    print(f"✅ Cart created with {cart.total_items} items")
    print(f"   Cart Total: ${cart.total_amount}")
    
    # Create order from cart
    try:
        order_data = {
            'payment_method': 'credits',
            'delivery_address': '789 Cart Test Street, Mombasa',
            'delivery_county': 'Mombasa',
            'delivery_phone': '+254734567890',
            'items': [
                {
                    'product_id': str(item.product.id),
                    'quantity': item.quantity
                }
                for item in cart.items.all()
            ]
        }
        
        serializer = OrderCreateSerializer(data=order_data)
        if serializer.is_valid():
            # Create order
            items_data = serializer.validated_data.pop('items')
            order = Order.objects.create(
                customer=user,
                **serializer.validated_data
            )
            
            total_amount = Decimal('0.00')
            for item_data in items_data:
                product = Product.objects.get(id=item_data['product_id'])
                unit_price = product.discounted_price
                total_price = unit_price * item_data['quantity']
                total_amount += total_price
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    unit_price=unit_price,
                    total_price=total_price
                )
            
            order.total_amount = total_amount
            order.save()
            
            # Clear cart
            cart.items.all().delete()
            
            print(f"✅ Order created from cart successfully!")
            print(f"   Order: {order.order_number}")
            print(f"   Cart cleared: {cart.total_items} items remaining")
            
            return True
        else:
            print(f"❌ Cart to order validation failed: {serializer.errors}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating order from cart: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("📦 YOUTH GREEN JOBS HUB - ORDER DIAGNOSTICS")
    print("=" * 55)
    
    try:
        # Run diagnostics
        existing_order = check_order_models()
        
        # Test order creation
        order_success = test_order_creation()
        api_success = test_order_api_view()
        cart_success = check_cart_to_order_flow()
        
        print("\n📋 DIAGNOSTIC SUMMARY")
        print("=" * 30)
        print(f"✅ Order Creation: {'PASS' if order_success else 'FAIL'}")
        print(f"✅ API View: {'PASS' if api_success else 'FAIL'}")
        print(f"✅ Cart to Order: {'PASS' if cart_success else 'FAIL'}")
        
        if order_success and api_success and cart_success:
            print("\n🎉 ORDER FUNCTIONALITY IS WORKING!")
            print("\n💡 If frontend still has issues, check:")
            print("   1. Authentication tokens")
            print("   2. Form validation")
            print("   3. API endpoint URLs")
            print("   4. Browser console errors")
            print("   5. Network requests in DevTools")
        else:
            print("\n❌ ORDER FUNCTIONALITY HAS ISSUES")
            print("   Check the errors above for details")
        
    except Exception as e:
        print(f"❌ Diagnostic error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
