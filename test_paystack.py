#!/usr/bin/env python3
"""
Test Paystack Configuration
This script tests the Paystack test credentials and connection.
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')
django.setup()

import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_paystack_credentials():
    """Test Paystack test credentials"""
    print("💳 Testing Paystack Configuration")
    print("=" * 50)
    
    # Get credentials from environment
    public_key = os.getenv('PAYSTACK_PUBLIC_KEY')
    secret_key = os.getenv('PAYSTACK_SECRET_KEY')
    sandbox = os.getenv('PAYSTACK_SANDBOX', 'True').lower() == 'true'
    
    print(f"📋 Configuration:")
    print(f"   Public Key: {public_key[:15]}..." if public_key else "   Public Key: Not set")
    print(f"   Secret Key: {secret_key[:15]}..." if secret_key else "   Secret Key: Not set")
    print(f"   Test Mode: {sandbox}")
    print()
    
    if not all([public_key, secret_key]):
        print("❌ Missing Paystack credentials!")
        return False
    
    # Verify it's a test key
    if not public_key.startswith('pk_test_') or not secret_key.startswith('sk_test_'):
        print("⚠️  Warning: These don't appear to be test keys!")
        print("   Make sure you're using test keys for development")
        print()
    
    # Test API connection
    print("🔑 Testing API Connection...")
    
    try:
        # Test endpoint - verify credentials
        verify_url = "https://api.paystack.co/transaction/verify/invalid_reference"
        
        headers = {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(verify_url, headers=headers, timeout=30)
        
        # We expect this to fail with 400 (transaction not found) but with valid auth
        if response.status_code == 400:
            response_data = response.json()
            if "Transaction reference not found" in response_data.get('message', ''):
                print("✅ API Connection Successful!")
                print("   Credentials are valid and API is accessible")
                print("   (Expected 'transaction not found' error confirms auth works)")
                print()

                # Test transaction initialization
                test_transaction_initialization(secret_key)

                return True
            else:
                print(f"❌ Unexpected Error:")
                print(f"   Message: {response_data.get('message')}")
                return False
        elif response.status_code == 401:
            print("❌ Authentication Failed!")
            print("   Invalid secret key or API credentials")
            print(f"   Response: {response.text}")
            return False
        else:
            print(f"⚠️  Unexpected Response:")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_transaction_initialization(secret_key):
    """Test transaction initialization"""
    try:
        print("💰 Testing Transaction Initialization...")
        
        # Initialize transaction endpoint
        init_url = "https://api.paystack.co/transaction/initialize"
        
        # Test transaction data
        payload = {
            "email": "test@youthgreenjobs.ke",
            "amount": 100,  # 1 KES in kobo (100 kobo = 1 KES)
            "currency": "KES",
            "reference": "test_" + str(int(os.urandom(4).hex(), 16)),
            "callback_url": "https://youth-green-jobs-api.herokuapp.com/api/v1/products/payments/webhook/paystack/",
            "metadata": {
                "custom_fields": [
                    {
                        "display_name": "Platform",
                        "variable_name": "platform",
                        "value": "Youth Green Jobs Hub"
                    }
                ]
            }
        }
        
        headers = {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(init_url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            transaction_data = response.json()
            
            if transaction_data.get('status'):
                data = transaction_data.get('data', {})
                print("✅ Transaction Initialization Successful!")
                print(f"   Reference: {data.get('reference')}")
                print(f"   Authorization URL: {data.get('authorization_url')[:50]}...")
                print(f"   Access Code: {data.get('access_code')}")
                print()
                
                # Show test card information
                show_test_cards()
                
                return True
            else:
                print("❌ Transaction Initialization Failed!")
                print(f"   Message: {transaction_data.get('message')}")
                return False
        else:
            print(f"❌ Transaction Initialization Failed!")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Transaction Initialization Error: {e}")
        return False

def show_test_cards():
    """Show test card information"""
    print("💳 Test Card Information:")
    print("   For testing payments, use these test cards:")
    print()
    print("   🇰🇪 Kenyan Cards:")
    print("      Visa: 4084084084084081")
    print("      Mastercard: 5060666666666666666")
    print("      Verve: 5061020000000000094")
    print()
    print("   🔐 Security Details:")
    print("      CVV: 408")
    print("      PIN: 1234")
    print("      Expiry: Any future date")
    print()
    print("   📱 OTP: 123456 (for transactions requiring OTP)")

def test_banks_list(secret_key):
    """Test banks list endpoint"""
    try:
        print("🏦 Testing Banks List...")
        
        banks_url = "https://api.paystack.co/bank"
        
        headers = {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(banks_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            banks_data = response.json()
            
            if banks_data.get('status'):
                banks = banks_data.get('data', [])
                print(f"✅ Banks List Retrieved Successfully!")
                print(f"   Total Banks: {len(banks)}")
                
                # Show first few Kenyan banks
                kenyan_banks = [bank for bank in banks if 'kenya' in bank.get('country', '').lower()][:5]
                if kenyan_banks:
                    print("   Sample Kenyan Banks:")
                    for bank in kenyan_banks:
                        print(f"      - {bank.get('name')} ({bank.get('code')})")
                
                return True
            else:
                print("❌ Banks List Failed!")
                print(f"   Message: {banks_data.get('message')}")
                return False
        else:
            print(f"❌ Banks List Failed!")
            print(f"   Status Code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Banks List Error: {e}")
        return False

def main():
    """Main test function"""
    print("🌱 Youth Green Jobs Hub - Paystack Test")
    print("=" * 50)
    print()
    
    success = test_paystack_credentials()
    
    if success:
        # Test additional endpoints
        secret_key = os.getenv('PAYSTACK_SECRET_KEY')
        test_banks_list(secret_key)
    
    print()
    print("=" * 50)
    if success:
        print("🎉 Paystack Configuration Test PASSED!")
        print()
        print("📋 Next Steps:")
        print("1. Deploy to Heroku with these credentials")
        print("2. Test card payments in your live application")
        print("3. Use the test cards provided above")
        print("4. Apply for live Paystack credentials when ready")
    else:
        print("❌ Paystack Configuration Test FAILED!")
        print()
        print("🔧 Troubleshooting:")
        print("1. Check your Paystack credentials")
        print("2. Ensure internet connection is stable")
        print("3. Verify test keys are correct")
        print("4. Contact Paystack support if issues persist")
    
    print()
    print("📖 For more information:")
    print("   - Paystack Dashboard: https://dashboard.paystack.com/")
    print("   - Paystack API Documentation: https://paystack.com/docs/")
    print("   - Test Cards: https://paystack.com/docs/payments/test-payments/")

if __name__ == "__main__":
    main()
