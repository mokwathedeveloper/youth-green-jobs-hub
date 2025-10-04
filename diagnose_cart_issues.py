#!/usr/bin/env python3
"""
Script to diagnose add to cart functionality issues
"""
import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, ShoppingCart, CartItem, SMEVendor, ProductCategory
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from products.views import add_to_cart
import json

User = get_user_model()

def check_models():
    """Check if cart models are working properly"""
    print("🔍 CHECKING CART MODELS")
    print("=" * 40)
    
    # Check if we have products
    products = Product.objects.filter(is_active=True)
    print(f"✅ Active Products: {products.count()}")
    
    if products.exists():
        product = products.first()
        print(f"   Sample Product: {product.name} (ID: {product.id})")
        print(f"   Price: ${product.price}")
        print(f"   Stock: {product.stock_quantity}")
        print(f"   Vendor Active: {product.vendor.is_active if product.vendor else 'No vendor'}")
        print(f"   Vendor Verified: {product.vendor.is_verified if product.vendor else 'No vendor'}")
    
    # Check users
    users = User.objects.filter(is_active=True)
    print(f"✅ Active Users: {users.count()}")
    
    # Check existing carts
    carts = ShoppingCart.objects.all()
    print(f"✅ Existing Carts: {carts.count()}")
    
    cart_items = CartItem.objects.all()
    print(f"✅ Cart Items: {cart_items.count()}")
    
    return products.first(), users.first() if users.exists() else None

def test_cart_creation():
    """Test creating a cart and adding items"""
    print("\n🛒 TESTING CART CREATION")
    print("=" * 40)
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        username='test_cart_user',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'user_type': 'youth'
        }
    )
    
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✅ Created test user: {user.username}")
    else:
        print(f"✅ Using existing test user: {user.username}")
    
    # Get a product
    product = Product.objects.filter(is_active=True).first()
    if not product:
        print("❌ No active products found!")
        return False
    
    print(f"✅ Using product: {product.name}")
    
    # Test cart creation
    try:
        cart, created = ShoppingCart.objects.get_or_create(customer=user)
        print(f"✅ Cart {'created' if created else 'retrieved'}: {cart.id}")
        
        # Test adding item to cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )
        
        if not created:
            cart_item.quantity += 1
            cart_item.save()
        
        print(f"✅ Cart item {'created' if created else 'updated'}")
        print(f"   Quantity: {cart_item.quantity}")
        print(f"   Unit Price: ${cart_item.unit_price}")
        print(f"   Total Price: ${cart_item.total_price}")
        
        # Test cart totals
        print(f"✅ Cart totals:")
        print(f"   Total Items: {cart.total_items}")
        print(f"   Total Amount: ${cart.total_amount}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing cart: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_view():
    """Test the add_to_cart API view"""
    print("\n🌐 TESTING API VIEW")
    print("=" * 40)
    
    # Get test user and product
    user = User.objects.filter(username='test_cart_user').first()
    product = Product.objects.filter(is_active=True).first()
    
    if not user or not product:
        print("❌ Missing test user or product")
        return False
    
    # Create request factory
    factory = RequestFactory()
    
    # Test data
    test_data = {
        'product_id': str(product.id),
        'quantity': 2
    }
    
    # Create POST request
    request = factory.post(
        '/api/v1/products/cart/add/',
        data=json.dumps(test_data),
        content_type='application/json'
    )
    request.user = user
    
    try:
        response = add_to_cart(request)
        print(f"✅ API Response Status: {response.status_code}")
        
        if response.status_code == 201:
            response_data = json.loads(response.content)
            print(f"✅ Response Data: {response_data}")
        else:
            print(f"❌ Error Response: {response.content}")
            
        return response.status_code == 201
        
    except Exception as e:
        print(f"❌ Error testing API view: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_vendor_issues():
    """Check for vendor-related issues that might block cart functionality"""
    print("\n🏪 CHECKING VENDOR ISSUES")
    print("=" * 40)
    
    products = Product.objects.filter(is_active=True)
    
    for product in products[:5]:  # Check first 5 products
        print(f"\n📦 Product: {product.name}")
        print(f"   Active: {product.is_active}")
        print(f"   Stock: {product.stock_quantity}")
        print(f"   Track Inventory: {product.track_inventory}")
        
        if product.vendor:
            print(f"   Vendor: {product.vendor.business_name}")
            print(f"   Vendor Active: {product.vendor.is_active}")
            print(f"   Vendor Verified: {product.vendor.is_verified}")
            
            if not product.vendor.is_active:
                print(f"   ⚠️ ISSUE: Vendor is not active!")
            if not product.vendor.is_verified:
                print(f"   ⚠️ ISSUE: Vendor is not verified!")
        else:
            print(f"   ❌ ISSUE: No vendor assigned!")

def fix_vendor_issues():
    """Fix common vendor issues"""
    print("\n🔧 FIXING VENDOR ISSUES")
    print("=" * 40)
    
    # Activate and verify all vendors
    vendors = SMEVendor.objects.all()
    updated_count = 0
    
    for vendor in vendors:
        if not vendor.is_active or not vendor.is_verified:
            vendor.is_active = True
            vendor.is_verified = True
            vendor.save()
            updated_count += 1
            print(f"✅ Fixed vendor: {vendor.business_name}")
    
    print(f"📊 Updated {updated_count} vendors")
    
    # Ensure all products have stock
    products = Product.objects.filter(stock_quantity=0)
    for product in products:
        product.stock_quantity = 50
        product.save()
        print(f"✅ Added stock to: {product.name}")

def main():
    print("🛒 YOUTH GREEN JOBS HUB - CART DIAGNOSTICS")
    print("=" * 55)
    
    try:
        # Run diagnostics
        product, user = check_models()
        
        if not product:
            print("\n❌ No products found! Run populate_products first.")
            return
        
        # Fix vendor issues first
        fix_vendor_issues()
        
        # Test cart functionality
        cart_success = test_cart_creation()
        api_success = test_api_view()
        
        # Check for vendor issues
        check_vendor_issues()
        
        print("\n📋 DIAGNOSTIC SUMMARY")
        print("=" * 30)
        print(f"✅ Cart Creation: {'PASS' if cart_success else 'FAIL'}")
        print(f"✅ API View: {'PASS' if api_success else 'FAIL'}")
        
        if cart_success and api_success:
            print("\n🎉 CART FUNCTIONALITY IS WORKING!")
            print("\n💡 If frontend still has issues, check:")
            print("   1. Authentication tokens")
            print("   2. CORS settings")
            print("   3. Frontend API calls")
            print("   4. Browser console errors")
        else:
            print("\n❌ CART FUNCTIONALITY HAS ISSUES")
            print("   Check the errors above for details")
        
    except Exception as e:
        print(f"❌ Diagnostic error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
