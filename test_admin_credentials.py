#!/usr/bin/env python3
"""
Test script to verify admin credentials work on production
"""
import requests
from requests.auth import HTTPBasicAuth

def test_admin_login():
    """Test admin login credentials"""
    admin_url = "https://youth-green-jobs-hub.onrender.com/admin/login/"
    
    # Test credentials from build script
    credentials = [
        ("admin", "YouthGreenJobs2024!"),
        ("admin", "admin"),
        ("superuser", "YouthGreenJobs2024!"),
    ]
    
    print("🔐 Testing Admin Login Credentials")
    print("=" * 40)
    
    session = requests.Session()
    
    for username, password in credentials:
        print(f"\n🧪 Testing: {username} / {password}")
        
        try:
            # Get login page to get CSRF token
            response = session.get(admin_url)
            if response.status_code != 200:
                print(f"❌ Cannot access login page: {response.status_code}")
                continue
                
            # Extract CSRF token
            csrf_token = None
            if 'csrfmiddlewaretoken' in response.text:
                import re
                match = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', response.text)
                if match:
                    csrf_token = match.group(1)
            
            if not csrf_token:
                print("❌ Could not find CSRF token")
                continue
                
            # Attempt login
            login_data = {
                'username': username,
                'password': password,
                'csrfmiddlewaretoken': csrf_token,
                'next': '/admin/'
            }
            
            response = session.post(admin_url, data=login_data)
            
            if response.status_code == 302:  # Redirect means success
                print("✅ Login successful!")
                print(f"   Redirected to: {response.headers.get('Location', 'Unknown')}")
                return username, password
            elif 'Please enter the correct username and password' in response.text:
                print("❌ Invalid credentials")
            else:
                print(f"❌ Unexpected response: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing credentials: {e}")
    
    print("\n⚠️ No valid credentials found")
    return None, None

def suggest_solutions():
    """Suggest solutions for admin access"""
    print("\n🔧 Solutions to Try:")
    print("=" * 25)
    print("1. 🚀 Force new deployment to ensure superuser creation:")
    print("   - The build script should create admin/YouthGreenJobs2024!")
    print("   - Check Render logs for superuser creation messages")
    print()
    print("2. 📧 Create superuser via Django shell on production:")
    print("   - This requires access to Render's shell/console")
    print("   - Or create a management command to do it")
    print()
    print("3. 🔄 Alternative: Create admin via API endpoint:")
    print("   - Add a temporary endpoint to create superuser")
    print("   - Remove it after use for security")
    print()
    print("4. 📋 Check current database state:")
    print("   - Verify if any users exist in production database")
    print("   - Check if authentication app is working")

def main():
    print("🚀 Youth Green Jobs Hub - Admin Credentials Test")
    print("=" * 55)
    
    username, password = test_admin_login()
    
    if username and password:
        print(f"\n✅ SUCCESS! Use these credentials:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"\n🔗 Admin URL: https://youth-green-jobs-hub.onrender.com/admin/")
    else:
        suggest_solutions()

if __name__ == "__main__":
    main()
