#!/usr/bin/env python3
"""
Test M-Pesa Configuration
This script tests the M-Pesa sandbox credentials and connection.
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
import base64
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_mpesa_credentials():
    """Test M-Pesa sandbox credentials"""
    print("🇰🇪 Testing M-Pesa Sandbox Configuration")
    print("=" * 50)
    
    # Get credentials from environment
    consumer_key = os.getenv('MPESA_CONSUMER_KEY')
    consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
    business_short_code = os.getenv('MPESA_BUSINESS_SHORT_CODE')
    passkey = os.getenv('MPESA_PASSKEY')
    sandbox = os.getenv('MPESA_SANDBOX', 'True').lower() == 'true'
    
    print(f"📋 Configuration:")
    print(f"   Consumer Key: {consumer_key[:10]}..." if consumer_key else "   Consumer Key: Not set")
    print(f"   Consumer Secret: {consumer_secret[:10]}..." if consumer_secret else "   Consumer Secret: Not set")
    print(f"   Business Short Code: {business_short_code}")
    print(f"   Passkey: {passkey[:10]}..." if passkey else "   Passkey: Not set")
    print(f"   Sandbox Mode: {sandbox}")
    print()
    
    if not all([consumer_key, consumer_secret, business_short_code, passkey]):
        print("❌ Missing M-Pesa credentials!")
        return False
    
    # Test OAuth token generation
    print("🔑 Testing OAuth Token Generation...")
    
    try:
        # Prepare credentials
        credentials = f"{consumer_key}:{consumer_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        # M-Pesa OAuth URL (sandbox)
        oauth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(oauth_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in')
            
            print(f"✅ OAuth Token Generated Successfully!")
            print(f"   Access Token: {access_token[:20]}...")
            print(f"   Expires In: {expires_in} seconds")
            print()
            
            # Test STK Push (simulation)
            print("📱 Testing STK Push Simulation...")
            test_stk_push(access_token)
            
            return True
        else:
            print(f"❌ OAuth Token Generation Failed!")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_stk_push(access_token):
    """Test STK Push with sandbox credentials"""
    try:
        # STK Push URL (sandbox)
        stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        
        # Generate timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Get credentials
        business_short_code = os.getenv('MPESA_BUSINESS_SHORT_CODE')
        passkey = os.getenv('MPESA_PASSKEY')
        
        # Generate password
        password_string = f"{business_short_code}{passkey}{timestamp}"
        password = base64.b64encode(password_string.encode()).decode()
        
        # STK Push payload
        payload = {
            "BusinessShortCode": business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": 1,  # Test with 1 KES
            "PartyA": "254708374149",  # Test phone number
            "PartyB": business_short_code,
            "PhoneNumber": "254708374149",  # Test phone number
            "CallBackURL": "https://youth-green-jobs-api.herokuapp.com/api/v1/products/payments/webhook/mpesa/",
            "AccountReference": "YouthGreenJobs",
            "TransactionDesc": "Test Payment"
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(stk_url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            stk_data = response.json()
            print(f"✅ STK Push Initiated Successfully!")
            print(f"   Merchant Request ID: {stk_data.get('MerchantRequestID')}")
            print(f"   Checkout Request ID: {stk_data.get('CheckoutRequestID')}")
            print(f"   Response Code: {stk_data.get('ResponseCode')}")
            print(f"   Response Description: {stk_data.get('ResponseDescription')}")
            print()
            print("📱 Check the test phone number (254708374149) for STK push prompt")
            print("   Use PIN: 1234 to complete the test transaction")
        else:
            print(f"❌ STK Push Failed!")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ STK Push Error: {e}")

def main():
    """Main test function"""
    print("🌱 Youth Green Jobs Hub - M-Pesa Test")
    print("=" * 50)
    print()
    
    success = test_mpesa_credentials()
    
    print()
    print("=" * 50)
    if success:
        print("🎉 M-Pesa Configuration Test PASSED!")
        print()
        print("📋 Next Steps:")
        print("1. Deploy to Heroku with these credentials")
        print("2. Test payments in your live application")
        print("3. Apply for production M-Pesa credentials when ready")
        print("4. Switch to production mode for live payments")
    else:
        print("❌ M-Pesa Configuration Test FAILED!")
        print()
        print("🔧 Troubleshooting:")
        print("1. Check your M-Pesa credentials")
        print("2. Ensure internet connection is stable")
        print("3. Verify sandbox environment is accessible")
        print("4. Contact Safaricom support if issues persist")
    
    print()
    print("📖 For more information:")
    print("   - Safaricom Developer Portal: https://developer.safaricom.co.ke/")
    print("   - M-Pesa API Documentation: https://developer.safaricom.co.ke/docs")

if __name__ == "__main__":
    main()
