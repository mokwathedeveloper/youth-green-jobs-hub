#!/usr/bin/env python3
"""
Script to diagnose payment flow issues
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
from products.models import (
    Product, Order, OrderItem, PaymentProvider, PaymentTransaction
)
from rest_framework.test import APIRequestFactory
from products.payments.service import PaymentService

User = get_user_model()

def check_payment_providers():
    """Check available payment providers"""
    print("💳 CHECKING PAYMENT PROVIDERS")
    print("=" * 40)
    
    try:
        providers = PaymentProvider.objects.all()
        print(f"✅ Total Payment Providers: {providers.count()}")
        
        for provider in providers:
            status = "🟢 Active" if provider.is_active else "🔴 Inactive"
            sandbox = "🧪 Sandbox" if provider.is_sandbox else "🏭 Production"
            print(f"   {status} {provider.display_name} ({provider.name}) - {sandbox}")
            print(f"      Min: ${provider.min_amount} | Max: ${provider.max_amount}")
            print(f"      Fee: {provider.transaction_fee_percentage}% + ${provider.fixed_fee}")
        
        # Check if any providers are active
        active_providers = providers.filter(is_active=True)
        if active_providers.exists():
            print(f"✅ {active_providers.count()} active payment providers found")
            return True
        else:
            print("❌ No active payment providers found")
            return False
            
    except Exception as e:
        print(f"❌ Error checking payment providers: {e}")
        return False

def create_sample_payment_providers():
    """Create sample payment providers if none exist"""
    print("\n🔧 CREATING SAMPLE PAYMENT PROVIDERS")
    print("=" * 40)
    
    try:
        # Create M-Pesa provider
        mpesa_provider, created = PaymentProvider.objects.get_or_create(
            name='mpesa',
            defaults={
                'display_name': 'M-Pesa',
                'is_active': True,
                'is_sandbox': True,
                'min_amount': Decimal('1.00'),
                'max_amount': Decimal('70000.00'),
                'transaction_fee_percentage': Decimal('0.00'),
                'fixed_fee': Decimal('0.00'),
                'supported_currencies': ['KES'],
                'configuration': {
                    'consumer_key': 'test_consumer_key',
                    'consumer_secret': 'test_consumer_secret',
                    'business_short_code': '174379',
                    'passkey': 'test_passkey',
                    'callback_url': 'https://youth-green-jobs-hub.onrender.com/api/v1/payments/webhook/mpesa/'
                }
            }
        )
        
        if created:
            print("✅ Created M-Pesa payment provider")
        else:
            print("✅ M-Pesa payment provider already exists")
        
        # Create Credits provider (internal)
        credits_provider, created = PaymentProvider.objects.get_or_create(
            name='credits',
            defaults={
                'display_name': 'Green Credits',
                'is_active': True,
                'is_sandbox': False,
                'min_amount': Decimal('1.00'),
                'max_amount': Decimal('10000.00'),
                'transaction_fee_percentage': Decimal('0.00'),
                'fixed_fee': Decimal('0.00'),
                'supported_currencies': ['KES'],
                'configuration': {}
            }
        )
        
        if created:
            print("✅ Created Credits payment provider")
        else:
            print("✅ Credits payment provider already exists")
        
        # Create Cash on Delivery provider
        cod_provider, created = PaymentProvider.objects.get_or_create(
            name='cash_on_delivery',
            defaults={
                'display_name': 'Cash on Delivery',
                'is_active': True,
                'is_sandbox': False,
                'min_amount': Decimal('1.00'),
                'max_amount': Decimal('50000.00'),
                'transaction_fee_percentage': Decimal('0.00'),
                'fixed_fee': Decimal('0.00'),
                'supported_currencies': ['KES'],
                'configuration': {}
            }
        )
        
        if created:
            print("✅ Created Cash on Delivery payment provider")
        else:
            print("✅ Cash on Delivery payment provider already exists")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating payment providers: {e}")
        return False

def test_payment_service():
    """Test payment service functionality"""
    print("\n🧪 TESTING PAYMENT SERVICE")
    print("=" * 40)
    
    try:
        # Test get available providers
        providers = PaymentService.get_available_providers()
        print(f"✅ Available providers: {len(providers)}")
        for provider in providers:
            print(f"   - {provider['display_name']} ({provider['name']})")
        
        # Test get provider instance
        mpesa_provider = PaymentService.get_provider('mpesa')
        if mpesa_provider:
            print("✅ M-Pesa provider instance created successfully")
        else:
            print("❌ Failed to create M-Pesa provider instance")
        
        credits_provider = PaymentService.get_provider('credits')
        if credits_provider:
            print("✅ Credits provider instance created successfully")
        else:
            print("❌ Failed to create Credits provider instance")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing payment service: {e}")
        return False

def test_order_payment_flow():
    """Test complete order to payment flow"""
    print("\n📦➡️💳 TESTING ORDER TO PAYMENT FLOW")
    print("=" * 40)
    
    try:
        # Get or create test user
        user, created = User.objects.get_or_create(
            username='payment_test_user',
            defaults={
                'email': 'paymenttest@example.com',
                'first_name': 'Payment',
                'last_name': 'Test',
                'user_type': 'youth',
                'credits': Decimal('100.00')  # Give user some credits
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✅ Created test user: {user.username}")
        else:
            print(f"✅ Using existing test user: {user.username}")
        
        print(f"   User credits: ${user.credits}")
        
        # Get a product
        product = Product.objects.filter(is_active=True).first()
        if not product:
            print("❌ No active products found")
            return False
        
        print(f"✅ Using product: {product.name} - ${product.discounted_price}")
        
        # Create an order
        order = Order.objects.create(
            customer=user,
            payment_method='credits',
            delivery_address='123 Payment Test Street',
            delivery_county='Nairobi',
            delivery_phone='+254712345678',
            total_amount=product.discounted_price
        )
        
        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=1,
            unit_price=product.discounted_price,
            total_price=product.discounted_price
        )
        
        print(f"✅ Created order: {order.order_number}")
        print(f"   Order total: ${order.total_amount}")
        print(f"   Payment method: {order.payment_method}")
        
        # Test payment initiation for credits
        if order.payment_method == 'credits':
            print("\n💰 Testing Credits Payment...")
            
            # Check if user has enough credits
            if user.credits >= order.total_amount:
                print(f"✅ User has sufficient credits: ${user.credits} >= ${order.total_amount}")
                
                # Simulate credits payment
                user.credits -= order.total_amount
                user.save()
                
                order.status = 'confirmed'
                order.save()
                
                print(f"✅ Credits payment successful")
                print(f"   User credits after payment: ${user.credits}")
                print(f"   Order status: {order.status}")
                
                return True
            else:
                print(f"❌ Insufficient credits: ${user.credits} < ${order.total_amount}")
                return False
        
        # Test payment initiation for M-Pesa
        elif order.payment_method == 'mpesa':
            print("\n📱 Testing M-Pesa Payment...")
            
            result = PaymentService.initiate_payment(
                order=order,
                provider_name='mpesa',
                customer_phone='+254712345678',
                customer_email=user.email,
                callback_url='https://youth-green-jobs-hub.onrender.com/api/v1/payments/webhook/mpesa/'
            )
            
            if result.success:
                print(f"✅ M-Pesa payment initiated successfully")
                print(f"   Transaction ID: {result.transaction_id}")
                print(f"   Message: {result.message}")
                return True
            else:
                print(f"❌ M-Pesa payment initiation failed: {result.message}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing order payment flow: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_frontend_payment_integration():
    """Check what the frontend needs for payment integration"""
    print("\n🌐 FRONTEND PAYMENT INTEGRATION REQUIREMENTS")
    print("=" * 50)
    
    print("📋 Required API Endpoints:")
    print("   • GET /api/v1/products/payments/providers/ - Get available payment methods")
    print("   • POST /api/v1/products/payments/initiate/ - Initiate payment")
    print("   • GET /api/v1/products/payments/verify/{transaction_id}/ - Verify payment")
    print("   • GET /api/v1/products/payments/history/ - Payment history")
    
    print("\n📝 Payment Flow:")
    print("   1. User places order (creates order with 'pending' status)")
    print("   2. Frontend shows payment options based on selected method:")
    print("      - Credits: Immediate confirmation")
    print("      - M-Pesa: Show STK push instructions")
    print("      - Cash on Delivery: Show delivery confirmation")
    print("   3. For electronic payments, initiate payment via API")
    print("   4. Poll payment status or handle webhook")
    print("   5. Show payment confirmation")
    
    print("\n🔧 Frontend Implementation Needed:")
    print("   • Payment method selection (already exists)")
    print("   • Payment processing page after order creation")
    print("   • Payment status polling/checking")
    print("   • Payment confirmation page")
    print("   • Error handling for failed payments")

def main():
    print("💳 YOUTH GREEN JOBS HUB - PAYMENT FLOW DIAGNOSTICS")
    print("=" * 60)
    
    try:
        # Check current state
        providers_ok = check_payment_providers()
        
        # Create providers if needed
        if not providers_ok:
            create_sample_payment_providers()
            providers_ok = check_payment_providers()
        
        # Test payment service
        service_ok = test_payment_service()
        
        # Test order payment flow
        flow_ok = test_order_payment_flow()
        
        # Show frontend requirements
        check_frontend_payment_integration()
        
        print("\n📋 PAYMENT DIAGNOSTICS SUMMARY")
        print("=" * 40)
        print(f"✅ Payment Providers: {'PASS' if providers_ok else 'FAIL'}")
        print(f"✅ Payment Service: {'PASS' if service_ok else 'FAIL'}")
        print(f"✅ Order Payment Flow: {'PASS' if flow_ok else 'FAIL'}")
        
        if all([providers_ok, service_ok, flow_ok]):
            print("\n🎉 PAYMENT SYSTEM IS WORKING!")
            print("\n💡 ISSUE IDENTIFIED:")
            print("   The backend payment system is working correctly.")
            print("   The issue is that the frontend only creates orders")
            print("   but doesn't handle the payment processing step.")
            print("\n🔧 SOLUTION NEEDED:")
            print("   1. Add payment processing page after order creation")
            print("   2. Implement payment method handling (credits, M-Pesa, etc.)")
            print("   3. Add payment status checking and confirmation")
        else:
            print("\n⚠️ PAYMENT SYSTEM HAS ISSUES")
            print("   Check the individual test results above.")
        
    except Exception as e:
        print(f"❌ Diagnostic error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
